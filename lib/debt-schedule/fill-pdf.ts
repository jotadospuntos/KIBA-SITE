import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { PDFFont, PDFForm } from 'pdf-lib';
import { MAX_DEBTS, PDF_ROWS } from './constants';
import { formatDate, formatMoney, formatPercent } from './format';
import type { DebtEntry, DebtSchedule } from './schema';

/*
 * SERVER-ONLY. Fills KIBA's own Business Debt Schedule template (a 1-page
 * AcroForm) rather than drawing a lookalike, so the output is the document the
 * advisors already send to lenders. Never run this in the browser: the client
 * could tamper with it, and the stored file and the downloaded file must be
 * the same bytes.
 *
 * THE INDEX TRAP. Text fields are 1-indexed ("Lenders NameRow1".."Row10") and
 * the dropdowns are 0-indexed ("Dropdown1.0".."Dropdown1.9"). Only textField()
 * and dropdown() below know about that - don't build a field name anywhere else.
 * Note "Lenders" has no apostrophe in the field name.
 *
 * MORE THAN TEN DEBTS. The template has ten rows, so debts are chunked by ten
 * and each chunk fills its own fresh copy of the template, which is flattened
 * and only then copied into the output. Copying pages that still carry form
 * fields collides on the field names.
 *
 * "Other" goes onto the PDF as plain "Other"; the "Please specify" text has no
 * cell on the template and stays in the submitted data only (decided by the
 * human).
 */

const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'templates', 'business-debt-schedule.pdf');

/* Column -> field-name prefix, for the text columns. */
const TEXT_COLUMNS = {
  lender: 'Lenders Name',
  original: 'Original Amount',
  balance: 'Current Balance',
  rate: 'Interest Rate',
  payment: 'Monthly Payment',
  open: 'Open Date',
  maturity: 'Maturity Date',
  collateral: 'Type of Collateral'
} as const;

/* Dropdown1 = Type of Debt, Dropdown2 = Secured/Unsecured, Dropdown3 = Current/Delinquent. */
type DropdownGroup = 1 | 2 | 3;

/* `row` is 1..10 everywhere in this file. */
const textField = (form: PDFForm, col: keyof typeof TEXT_COLUMNS, row: number) =>
  form.getTextField(`${TEXT_COLUMNS[col]}Row${row}`);
const dropdown = (form: PDFForm, group: DropdownGroup, row: number) =>
  form.getDropdown(`Dropdown${group}.${row - 1}`);

const CELL_FONT_SIZE = 8;
/* The Type of Debt cell is 93pt wide and "Non-SBA Commercial Loan" is the
   longest option, so the dropdowns run a size smaller than the text cells. */
const DROPDOWN_FONT_SIZE = 6.5;
const HEADER_FONT_SIZE = 9;
/* Inner padding pdf-lib leaves on each side of a text cell. */
const CELL_PADDING = 6;

let templateBytes: Promise<Buffer> | null = null;
function loadTemplate() {
  templateBytes ??= readFile(TEMPLATE_PATH);
  return templateBytes;
}

/* Cuts text to fit the cell, with an ellipsis, rather than letting it spill
   over the next column. */
function fitToCell(text: string, font: PDFFont, size: number, cellWidth: number): string {
  const max = cellWidth - CELL_PADDING;
  if (font.widthOfTextAtSize(text, size) <= max) return text;
  let cut = text;
  while (cut.length > 1 && font.widthOfTextAtSize(`${cut}…`, size) > max) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

function setText(
  form: PDFForm,
  name: string,
  value: string,
  font: PDFFont,
  size: number
) {
  const field = form.getTextField(name);
  const width = field.acroField.getWidgets()[0].getRectangle().width;
  field.setFontSize(size);
  field.setText(value ? fitToCell(value, font, size, width) : '');
}

function fillRow(form: PDFForm, row: number, d: DebtEntry, font: PDFFont) {
  const cell = (col: keyof typeof TEXT_COLUMNS, value: string) =>
    setText(form, textField(form, col, row).getName(), value, font, CELL_FONT_SIZE);

  cell('lender', d.lenderName);
  cell('original', formatMoney(d.originalAmount));
  cell('balance', formatMoney(d.currentBalance));
  cell('rate', formatPercent(d.interestRate));
  cell('payment', formatMoney(d.monthlyPayment));
  cell('open', formatDate(d.openDate));
  cell('maturity', d.noMaturity ? 'Revolving' : d.maturityDate ? formatDate(d.maturityDate) : '');
  cell('collateral', d.securedStatus === 'Secured' ? d.collateral ?? '' : '');

  const choices: [DropdownGroup, string][] = [
    [1, d.typeOfDebt],
    [2, d.securedStatus],
    [3, d.paymentStatus]
  ];
  for (const [group, value] of choices) {
    const dd = dropdown(form, group, row);
    dd.setFontSize(DROPDOWN_FONT_SIZE);
    dd.select(value);
  }
}

/* Unused rows: blank, not "Select one" - the placeholder would print. */
function clearRow(form: PDFForm, row: number) {
  for (const col of Object.keys(TEXT_COLUMNS) as (keyof typeof TEXT_COLUMNS)[]) {
    textField(form, col, row).setText('');
  }
  for (const group of [1, 2, 3] as DropdownGroup[]) dropdown(form, group, row).clear();
}

async function fillPage(
  data: DebtSchedule,
  chunk: DebtEntry[],
  isLastPage: boolean,
  totals: { balance: number; payment: number }
): Promise<PDFDocument> {
  const doc = await PDFDocument.load(await loadTemplate());
  const form = doc.getForm();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  /* On every page, so each sheet identifies itself if they get separated. */
  setText(form, 'Text4.0', data.contactName, font, HEADER_FONT_SIZE);
  setText(form, 'Text4.1', data.businessName, font, HEADER_FONT_SIZE);
  setText(form, 'Text4.2', formatDate(data.asOfDate), font, HEADER_FONT_SIZE);

  for (let row = 1; row <= PDF_ROWS; row++) {
    const debt = chunk[row - 1];
    if (debt) fillRow(form, row, debt, font);
    else clearRow(form, row);
  }

  /* Grand totals on the last page only; earlier pages stay blank so nobody
     reads a page subtotal as the total. */
  setText(form, 'Total Balances', isLastPage ? formatMoney(totals.balance) : '', font, HEADER_FONT_SIZE);
  setText(form, 'Total Payments', isLastPage ? formatMoney(totals.payment) : '', font, HEADER_FONT_SIZE);

  form.updateFieldAppearances(font);
  form.flatten();
  return doc;
}

export async function fillDebtSchedule(data: DebtSchedule): Promise<Uint8Array> {
  /* The schema already caps this; checked again because this is the last
     stop before a file exists. */
  if (data.debts.length > MAX_DEBTS) throw new Error(`More than ${MAX_DEBTS} debts`);

  const debts = data.hasNoDebt ? [] : data.debts;
  const totals = debts.reduce(
    (t, d) => ({ balance: t.balance + d.currentBalance, payment: t.payment + d.monthlyPayment }),
    { balance: 0, payment: 0 }
  );

  /* At least one page, so a "no debt" schedule is still a signed-off sheet. */
  const chunks: DebtEntry[][] = [];
  for (let i = 0; i < debts.length; i += PDF_ROWS) chunks.push(debts.slice(i, i + PDF_ROWS));
  if (chunks.length === 0) chunks.push([]);

  const out = await PDFDocument.create();
  out.setTitle(`Business Debt Schedule — ${data.businessName}`);
  out.setAuthor('Kingdom Impact Business Advisors');
  out.setCreator('go.kibadvisors.com/debt-schedule');

  for (let i = 0; i < chunks.length; i++) {
    const page = await fillPage(data, chunks[i], i === chunks.length - 1, totals);
    const [copied] = await out.copyPages(page, [0]);
    out.addPage(copied);
  }

  return out.save();
}
