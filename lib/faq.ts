/*
 * The homepage FAQ, copied VERBATIM from kibadvisors.com's homepage.
 *
 * These are answers about fees, timelines and required documents — i.e. things
 * a client may rely on. Don't reword them here; if the business changes an
 * answer, change it on the WordPress page and re-copy.
 */

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ: FaqItem[] = [
  {
    question: 'How long does the process take?',
    answer:
      'Most clients receive guidance and lender recommendations within 24–72 hours. The exact timeline for approval depends on the lender and type of financing.'
  },
  {
    question: 'Are there any hidden fees?',
    answer:
      'Absolutely not. Our guidance is transparent, and we help you understand all terms and costs before connecting you with a lender.'
  },
  {
    question: 'What types of financing can I access?',
    answer:
      'We help you connect with SBA loans, term loans, business acquisition loans, equipment financing, commercial real estate solutions and revolving lines of credit.'
  },
  {
    question: 'What documents will I need to apply?',
    answer:
      'Basic requirements include 3–6 months of business bank statements, recent tax returns (business and personal), profit & loss statements, balance sheet, business license, and a voided business check. For larger loans or SBA programs, additional documentation may be required.'
  },
  {
    question: 'Will I have support through the process?',
    answer:
      'Absolutely. You’ll work with a dedicated loan specialist who guides you from eligibility assessment to lender communication, application submission, and final approval.'
  }
];
