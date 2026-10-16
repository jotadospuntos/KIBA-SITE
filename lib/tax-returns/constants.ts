/*
 * /tax-returns. Client-safe: no secrets here. Retention is the debt
 * schedule's RETENTION_DAYS (45), swept by the same cleanup cron.
 */

export const PREFIX = 'tax-returns/';

/* Two years of business returns plus each owner's personal returns, with
   room for schedules sent as separate files. */
export const MAX_FILES = 10;
export const MAX_FILE_MB = 25;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

/* How long the upload ticket from /api/tax-returns lasts: long enough for
   MAX_FILES x MAX_FILE_MB on a slow connection. */
export const UPLOAD_TICKET_MS = 2 * 60 * 60 * 1000;

/* Blob path for one uploaded file. The client builds it, the server checks it
   against FILE_PATH, so a ticket can only ever write into its own folder. */
export const filePath = (id: string, name: string) => `${PREFIX}${id}/files/${name}`;
export const FILE_PATH = /^tax-returns\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/files\/([\w.-]{1,100}\.pdf)$/;

/* A file name that matches FILE_PATH. The index keeps two "return.pdf"s apart. */
export function safeFileName(original: string, index: number) {
  const base = original.replace(/\.pdf$/i, '').replace(/[^\w.-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 80);
  return `${index + 1}-${base || 'tax-return'}.pdf`;
}
