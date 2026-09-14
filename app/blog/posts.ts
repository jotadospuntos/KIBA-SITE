/*
 * The blog, copied from kibadvisors.com's three published articles.
 *
 * THE BODY TEXT IS VERBATIM. These are KIBA's own published articles being
 * moved to KIBA's own new site — headings, paragraphs and list items are
 * reproduced word for word, in order. Don't rewrite them here; edit the
 * WordPress post and re-copy, or move the source of truth here deliberately.
 *
 * SLUGS MATCH THE WORDPRESS URLS exactly, including the third one, whose slug
 * ("why-you-need-business-credit-and-how-to-build-it") doesn't match its title.
 * Keeping it means any existing link or share still resolves if this ever
 * becomes the canonical copy.
 *
 * WHY A TS FILE AND NOT MDX/A CMS: three short posts, and adding an MDX
 * pipeline is a build-tooling decision that shouldn't be made in passing. The
 * `Block` union keeps the content structured rather than raw HTML, so moving to
 * MDX or a CMS later is a data migration, not a rewrite. Revisit when there are
 * enough posts that editing TypeScript is the bottleneck.
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'lead'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] };

export type Post = {
  slug: string;
  title: string;
  category: string;
  author: string;
  /* ISO date, for <time datetime>. */
  date: string;
  /* Human-readable, as the source page displays it. */
  dateLabel: string;
  excerpt: string;
  /* Minutes, computed from word count at 200wpm — see readingTime(). */
  blocks: Block[];
};

export const POSTS: Post[] = [
  {
    slug: 'how-to-improve-cash-flow-before-taking-on-debt',
    title: 'How to Improve Cash Flow Before Taking on Debt',
    category: 'Cash Flow & Strategy',
    author: 'Michael Sylkatis',
    date: '2026-04-22',
    dateLabel: 'April 22, 2026',
    excerpt:
      'In many cases, improving cash flow first can reduce the need for borrowing altogether.',
    blocks: [
      { type: 'p', text: 'Before pursuing financing, it’s worth asking a simple question:' },
      { type: 'lead', text: 'Does the business need capital — or better cash flow management?' },
      {
        type: 'p',
        text: 'In many cases, improving cash flow first can reduce the need for borrowing altogether.'
      },
      { type: 'h2', text: 'Why Cash Flow Comes First' },
      { type: 'p', text: 'Cash flow determines:' },
      {
        type: 'ul',
        items: [
          'Your ability to repay debt',
          'Your flexibility during slow periods',
          'Your overall financial stability'
        ]
      },
      {
        type: 'p',
        text: 'Without it, even well-structured financing can become difficult to manage.'
      },
      { type: 'h2', text: 'Ways to Improve Cash Flow' },
      { type: 'h3', text: '1. Review Expenses' },
      { type: 'p', text: 'Identify unnecessary or underperforming costs.' },
      { type: 'h3', text: '2. Optimize Payment Terms' },
      {
        type: 'p',
        text: 'Shorten receivable cycles where possible and manage payables strategically.'
      },
      { type: 'h3', text: '3. Improve Pricing or Margins' },
      { type: 'p', text: 'Small adjustments can have a significant impact over time.' },
      { type: 'h3', text: '4. Reduce Unused Debt' },
      { type: 'p', text: 'Eliminating high-cost or unused obligations can free up cash.' },
      { type: 'h2', text: 'When Financing Still Makes Sense' },
      {
        type: 'p',
        text: 'Improving cash flow doesn’t eliminate the need for capital — it strengthens your position.'
      },
      { type: 'p', text: 'Financing may still be appropriate when:' },
      {
        type: 'ul',
        items: [
          'You’re investing in growth',
          'You need to stabilize operations',
          'Timing requires additional flexibility'
        ]
      },
      {
        type: 'p',
        text: 'The difference is that you’re making the decision from a stronger foundation.'
      },
      { type: 'h2', text: 'Final Thought' },
      { type: 'p', text: 'Better cash flow creates better options.' },
      {
        type: 'p',
        text: 'Before taking on debt, it’s worth ensuring the business can support it — comfortably and consistently.'
      }
    ]
  },
  {
    slug: 'how-to-know-if-your-business-is-ready-for-financing',
    title: 'How to Know If Your Business Is Ready for Financing',
    category: 'Business Credit',
    author: 'Michael Sylkatis',
    date: '2026-04-22',
    dateLabel: 'April 22, 2026',
    excerpt:
      'Understanding where you stand before pursuing capital can save time, reduce risk, and lead to better long-term outcomes.',
    blocks: [
      {
        type: 'lead',
        text: 'Not every business that can get financing should. And not every business that needs it is truly ready.'
      },
      {
        type: 'p',
        text: 'Understanding where you stand before pursuing capital can save time, reduce risk, and lead to better long-term outcomes.'
      },
      { type: 'h2', text: 'What “Ready for Financing” Actually Means' },
      {
        type: 'p',
        text: 'Readiness isn’t just about getting approved. It’s about being able to use capital effectively without creating strain.'
      },
      { type: 'p', text: 'A financing decision should:' },
      {
        type: 'ul',
        items: [
          'Support growth or stability',
          'Fit within your cash flow',
          'Align with your broader business plan'
        ]
      },
      { type: 'p', text: 'If those elements aren’t clear, it’s worth slowing down.' },
      { type: 'h2', text: 'Key Signs Your Business May Be Ready' },
      { type: 'h3', text: '1. Consistent Cash Flow' },
      {
        type: 'p',
        text: 'Your business generates predictable revenue that can comfortably support repayment.'
      },
      { type: 'h3', text: '2. Clear Use of Funds' },
      {
        type: 'p',
        text: 'You know exactly how the capital will be used, expansion, equipment, refinancing, or working capital.'
      },
      { type: 'h3', text: '3. Stable Operations' },
      { type: 'p', text: 'Your business is not in a reactive or unstable position.' },
      { type: 'h3', text: '4. Financial Visibility' },
      {
        type: 'p',
        text: 'You understand your numbers — not perfectly, but clearly enough to make informed decisions.'
      },
      { type: 'h2', text: 'Signs You May Need to Prepare First' },
      {
        type: 'ul',
        items: [
          'Cash flow is inconsistent or unclear',
          'You’re unsure how much capital is actually needed',
          'Repayment would feel tight or uncertain',
          'The decision is being driven by urgency rather than strategy'
        ]
      },
      { type: 'p', text: 'In these cases, preparation often leads to better options later.' },
      { type: 'h2', text: 'Why Timing Matters' },
      { type: 'p', text: 'The same financing option can:' },
      { type: 'ul', items: ['Work well at the right time', 'Create pressure at the wrong time'] },
      { type: 'p', text: 'This is why thoughtful evaluation matters more than speed.' },
      { type: 'h2', text: 'Final Thought' },
      { type: 'p', text: 'Financing isn’t just about access, it’s about alignment.' },
      {
        type: 'p',
        text: 'When your business is ready, capital becomes a tool. When it’s not, it can become a burden.'
      }
    ]
  },
  {
    slug: 'why-you-need-business-credit-and-how-to-build-it',
    title: 'Why Business Credit Matters (and How to Build It the Right Way)',
    category: 'Business Credit',
    author: 'Michael Sylkatis',
    date: '2026-04-22',
    dateLabel: 'April 22, 2026',
    excerpt:
      'Business credit isn’t just a financial metric, it’s a reflection of how your business is perceived.',
    blocks: [
      {
        type: 'lead',
        text: 'Business credit isn’t just a financial metric, it’s a reflection of how your business is perceived.'
      },
      {
        type: 'p',
        text: 'Whether you’re planning to grow, stabilize cash flow, or simply keep your options open, strong business credit plays a critical role in the decisions available to you.'
      },
      { type: 'p', text: 'This isn’t about chasing funding. It’s about building credibility.' },
      { type: 'h2', text: 'Why Business Credit Matters' },
      {
        type: 'p',
        text: 'Many business owners assume credit only matters when applying for a loan. In reality, it influences much more than that.'
      },
      { type: 'p', text: 'Strong business credit can help you:' },
      {
        type: 'ul',
        items: [
          'Access better financing terms',
          'Maintain flexibility during slower periods',
          'Strengthen your position with lenders and partners',
          'Create more predictable, stable growth'
        ]
      },
      {
        type: 'p',
        text: 'It’s not about size, it’s about structure. Even established businesses can face limitations without solid credit in place.'
      },
      { type: 'h2', text: 'Business Credit Is Visibility' },
      {
        type: 'p',
        text: 'Unlike personal credit, business credit is more accessible to outside parties.'
      },
      { type: 'p', text: 'Lenders, vendors, and financial institutions can review key details such as:' },
      {
        type: 'ul',
        items: [
          'Business identity and registration',
          'Payment history',
          'Existing obligations',
          'Overall financial reliability'
        ]
      },
      {
        type: 'p',
        text: 'This visibility shapes how others evaluate your business. Before any conversation happens, your credit profile often speaks first.'
      },
      { type: 'h2', text: 'Credibility Drives Opportunity' },
      { type: 'p', text: 'When business credit is strong, decisions become easier.' },
      {
        type: 'p',
        text: 'Lenders are more comfortable extending capital. Terms are more manageable. Options are broader.'
      },
      { type: 'p', text: 'When it’s weak or unclear, the opposite happens:' },
      { type: 'ul', items: ['More restrictions', 'Higher costs', 'Fewer viable paths forward'] },
      {
        type: 'p',
        text: 'This is why business credit is less about access, and more about positioning.'
      },
      { type: 'h2', text: 'How to Start Building Business Credit' },
      {
        type: 'p',
        text: 'Building business credit doesn’t require complexity. It requires consistency.'
      },
      { type: 'p', text: 'Start with the fundamentals:' },
      {
        type: 'ul',
        items: [
          'Establish a registered business entity',
          'Obtain an EIN (Employer Identification Number)',
          'Set up a dedicated business bank account',
          'Maintain accurate business contact information',
          'Ensure proper licensing and documentation'
        ]
      },
      {
        type: 'p',
        text: 'These steps create a foundation that signals legitimacy and readiness.'
      },
      { type: 'h2', text: 'Build Gradually and Intentionally' },
      { type: 'p', text: 'Once the foundation is in place, growth happens over time.' },
      { type: 'p', text: 'Focus on:' },
      {
        type: 'ul',
        items: [
          'Opening vendor or trade accounts',
          'Making consistent, manageable purchases',
          'Paying all obligations on time',
          'Avoiding unnecessary debt'
        ]
      },
      {
        type: 'p',
        text: 'Business credit builds in layers. Quick fixes rarely create long-term stability.'
      },
      { type: 'h2', text: 'Monitor and Maintain Your Credit' },
      {
        type: 'p',
        text: 'Building credit is only part of the process — maintaining it matters just as much.'
      },
      { type: 'p', text: 'Regularly review your business credit reports to:' },
      {
        type: 'ul',
        items: ['Catch errors early', 'Track progress', 'Ensure accuracy across reporting agencies']
      },
      { type: 'p', text: 'Even small inaccuracies can affect how your business is viewed.' },
      { type: 'h2', text: 'A Measured Approach Matters' },
      { type: 'p', text: 'Not every business needs to pursue aggressive credit growth.' },
      { type: 'p', text: 'In some cases, the right move is to:' },
      {
        type: 'ul',
        items: [
          'Strengthen financials first',
          'Improve cash flow consistency',
          'Delay borrowing until the timing is right'
        ]
      },
      { type: 'p', text: 'Business credit should support your strategy — not drive it.' },
      { type: 'h2', text: 'Final Thoughts' },
      {
        type: 'p',
        text: 'Business credit isn’t about checking a box. It’s about building a foundation that supports better decisions over time.'
      },
      { type: 'p', text: 'When managed well, it creates:' },
      { type: 'ul', items: ['Flexibility', 'Stability', 'Confidence in future planning'] },
      {
        type: 'p',
        text: 'And most importantly, it allows you to approach capital — when needed — from a position of strength.'
      }
    ]
  }
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/* Rough read time from the block text, at 200 words per minute. Computed rather
   than stored so it can't drift from the body. */
export function readingTime(post: Post): number {
  const words = post.blocks.reduce((n, b) => {
    const text = b.type === 'ul' ? b.items.join(' ') : b.text;
    return n + text.split(/\s+/).length;
  }, 0);
  return Math.max(1, Math.round(words / 200));
}
