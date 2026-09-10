/*
 * Copy for /capital-solutions and its six program pages.
 *
 * Source: https://kibadvisors.com/capital-solutions/, where all six programs
 * live on ONE page. This site splits them into a page each, so the copy is
 * adapted the way app/about-us/about-content.ts is:
 *
 *  - `summary` and every `fit` bullet and `caution` line are VERBATIM from the
 *    source page. Those are the sentences that carry KIBA's actual position on
 *    each product - don't reword them. If the WordPress page changes, re-copy.
 *  - Headlines, hero subs, `expand`, and `usedFor` are written for this layout.
 *
 * DELIBERATELY NO NUMBERS. The source page quotes no rates, terms, amounts or
 * qualification thresholds, and none are invented here. Anything of that kind
 * is a lending claim that has to come from the human, not from a copy pass.
 *
 * HERO IMAGES ARE PLACEHOLDERS. Every program points at an existing photo in
 * public/img/hero/ so the pages render; real stock is being gathered. All of
 * them except owner-cafe-laptop.webp are 800x533 and upscale in the hero panel
 * (see CLAUDE.md) - the replacements want to be roughly 2600x2000. Swapping one
 * is a one-line change to `heroImage` / `heroImageAlt` below and nothing else.
 */

import type { LucideIcon } from 'lucide-react';
import { Building2, CalendarClock, Handshake, Landmark, Repeat, Wrench } from 'lucide-react';

export type Program = {
  /* URL is /capital-solutions/<slug>. */
  slug: string;
  /* Short label for the nav dropdown and the cross-link cards. */
  navTitle: string;
  /* One line under the label in the nav dropdown. */
  navDesc: string;
  /* Shown on the bento cards that cross-link between programs. */
  icon: LucideIcon;
  /* Full product name, used in headings and metadata. */
  name: string;
  /* Hero headline. Rendered through SplitText; \n becomes a line break. */
  headline: string;
  heroSub: string;
  heroBullets: [string, string];
  heroImage: string;
  heroImageAlt: string;
  /* VERBATIM from the source page. */
  summary: string;
  /* Ours: one paragraph of context after the summary. */
  expand: string;
  /* Ours: what the product typically funds. Non-numeric on purpose. */
  usedFor: string[];
  /* VERBATIM from the source page - the "may make sense if" list. */
  fit: string[];
  /* VERBATIM from the source page - the caveat KIBA leads with. */
  caution: string;
  metaDescription: string;
};

export const PROGRAMS: Program[] = [
  {
    slug: 'sba-loans',
    navTitle: 'SBA Loans',
    navDesc: 'Longer terms and lower payments, with more process.',
    icon: Landmark,
    name: 'SBA Loans',
    headline: 'SBA loans, structured\nto actually close.',
    heroSub:
      'Longer terms and lower monthly payments, in exchange for more structure and a longer road to closing. We will tell you upfront whether that trade is worth making for your business.',
    heroBullets: [
      'Built for stable businesses with steady cash flow.',
      'We prepare the file before it ever reaches a lender.'
    ],
    heroImage: '/img/hero/storefront-owner.webp',
    heroImageAlt: 'A small business owner outside their storefront',
    summary:
      'SBA loans can offer longer terms and lower monthly payments, but they also come with more structure and a longer approval process. They tend to work best for stable businesses with steady cash flow and clear long-term plans.',
    expand:
      'The structure is the point. An SBA loan asks more of you up front — documentation, patience, a plan that holds together on paper — and gives back repayment terms most conventional loans will not. Most of the work happens before anything is submitted, and that preparation is what decides the answer you get.',
    usedFor: [
      'Expanding into a new location or market',
      'Acquiring an existing business',
      'Refinancing higher-cost debt into a longer term',
      'Working capital tied to a long-term plan'
    ],
    fit: [
      'Your business has consistent cash flow',
      "You're planning long-term growth or acquisition",
      "You're comfortable with documentation and a structured process",
      'You want predictable, extended repayment terms'
    ],
    caution: 'If speed or flexibility is your top priority, an SBA loan is probably not the right tool.',
    metaDescription:
      'SBA loans offer longer terms and lower monthly payments in exchange for more structure and a longer approval process. KIBA prepares the file and tells you honestly whether an SBA loan fits your business.'
  },
  {
    slug: 'business-acquisition-loans',
    navTitle: 'Business Acquisition Loans',
    navDesc: 'Financing to buy a business, stress-tested first.',
    icon: Handshake,
    name: 'Business Acquisition Loans',
    headline: 'Financing that holds up\nafter the deal closes.',
    heroSub:
      'Getting approved is the easy part. We pressure-test whether the combined business can actually carry the debt — before you are committed to finding out.',
    heroBullets: [
      'We look at the target’s numbers, not just yours.',
      'If the deal only works on paper, you will hear it from us.'
    ],
    heroImage: '/img/hero/deal-handshake.webp',
    heroImageAlt: 'Two business owners shaking hands over a completed deal',
    summary:
      'Buying another business is about more than getting approved. The numbers have to hold up, and the deal needs to strengthen—not strain—your existing operation.',
    expand:
      'An acquisition changes two businesses at once. The financing has to survive the transition period, not just the closing table — which means looking hard at the target’s real cash flow, what happens to it once the current owner leaves, and what the combined operation looks like in a slow quarter.',
    usedFor: [
      'Buying a competitor or a complementary business',
      'Partner and shareholder buyouts',
      'Succession purchases from a retiring owner',
      'Acquiring a book of business or a location'
    ],
    fit: [
      'The target business has reliable cash flow',
      'The combined businesses can support the debt',
      "You've thought through integration and risk",
      'The purchase supports your long-term goals'
    ],
    caution: "If the deal only works “on paper,” it's worth slowing down.",
    metaDescription:
      'Business acquisition financing from KIBA. We stress-test whether the target’s cash flow and the combined operation can actually carry the debt before you commit.'
  },
  {
    slug: 'term-loans',
    navTitle: 'Term Loans',
    navDesc: 'A defined purpose and a clear payoff date.',
    icon: CalendarClock,
    name: 'Term Loans',
    headline: 'A clear purpose,\nand a clear payoff date.',
    heroSub:
      'A fixed amount, a fixed schedule, a known end. Term loans are straightforward — which makes the real question whether the payment fits, not whether you can get approved.',
    heroBullets: [
      'Sized to what the business can carry, not the maximum.',
      'Often the cleanest way out of higher-cost debt.'
    ],
    heroImage: '/img/hero/owner-reviewing.webp',
    heroImageAlt: 'A business owner reviewing figures at their desk',
    summary:
      "Term loans work best when there's a clear purpose, such as expansion, refinancing, or stabilizing cash flow, and when payments fit comfortably into the business. Approval matters less than sustainability.",
    expand:
      'The discipline of a term loan is its main advantage: a set amount, a set payment and a date the debt is gone. That only works in your favour when the payment is comfortable on an ordinary month rather than a good one, which is the number we start from.',
    usedFor: [
      'Funding a defined expansion or project',
      'Refinancing higher-cost or short-term debt',
      'Stabilizing cash flow with predictable payments',
      'One-time investments with a clear return'
    ],
    fit: [
      'You have a defined use for the funds',
      'Cash flow can support fixed monthly payments',
      'The loan replaces higher-cost or less stable debt',
      'You want a clear payoff timeline'
    ],
    caution: "If payments would feel tight, it's usually a sign to reassess.",
    metaDescription:
      'Term loans for expansion, refinancing or stabilizing cash flow. KIBA sizes the loan to what your business can comfortably carry — approval matters less than sustainability.'
  },
  {
    slug: 'equipment-financing',
    navTitle: 'Equipment Financing',
    navDesc: 'For assets that clearly pay for themselves.',
    icon: Wrench,
    name: 'Equipment Financing',
    headline: 'Equipment that earns\nits place on the books.',
    heroSub:
      'The machine should pay for its own payment. We look at what the asset actually produces, how long it lasts, and whether owning beats renting before we look at financing it.',
    heroBullets: [
      'Term matched to the useful life of the asset.',
      'Sometimes the honest answer is to lease it instead.'
    ],
    heroImage: '/img/hero/workshop-owner.webp',
    heroImageAlt: 'A workshop owner operating equipment on the shop floor',
    summary:
      'Equipment financing can be a good option when the equipment directly supports revenue or efficiency. The key is making sure the asset truly earns its place on the balance sheet.',
    expand:
      'Equipment is one of the few things a business borrows for that can be measured directly: it either produces more, costs less to run, or lets you take work you were turning away. When the term matches the useful life, the asset pays for itself over the same period you are paying for it.',
    usedFor: [
      'Machinery, tooling and production equipment',
      'Vehicles and fleet additions',
      'Technology and systems upgrades',
      'Replacing aging equipment before it fails'
    ],
    fit: [
      'The equipment directly supports revenue or productivity',
      'The useful life matches the loan term',
      'Cash flow remains comfortable after the payment',
      'Ownership makes more sense than renting or outsourcing'
    ],
    caution: "If the equipment won't clearly pay for itself, it's worth considering alternatives.",
    metaDescription:
      'Equipment financing for machinery, vehicles and systems. KIBA matches the term to the useful life of the asset and tells you when leasing is the better call.'
  },
  {
    slug: 'commercial-real-estate-loans',
    navTitle: 'Commercial & Investment Real Estate',
    navDesc: 'Ownership, weighed against the cash it ties up.',
    icon: Building2,
    name: 'Commercial & Investment Real Estate Loans',
    headline: 'Own the building\nwithout straining the business.',
    heroSub:
      'Property can be the most stabilizing thing a business owns, or the thing that leaves it without room to move. The difference is what your reserves look like the day after closing.',
    heroBullets: [
      'Long-term cost control instead of rising rent.',
      'We look at liquidity after the purchase, not before.'
    ],
    heroImage: '/img/hero/boutique-owner.webp',
    heroImageAlt: 'A business owner in the commercial space they operate from',
    summary:
      'Owning property can be a strong long-term move, but it can also tie up cash and reduce flexibility.',
    expand:
      'Buying the building converts a rising, permanent expense into a fixed one and builds equity while you operate — a genuinely strong position to be in. It also converts liquid cash into an illiquid asset, which is the part worth thinking hardest about, because flexibility is what gets a business through a bad year.',
    usedFor: [
      'Buying the property your business operates from',
      'Owner-occupied expansion or relocation',
      'Investment and income-producing property',
      'Refinancing an existing commercial mortgage'
    ],
    fit: [
      'Ownership improves long-term stability or cost control',
      'You have sufficient cash reserves after the purchase',
      'The property aligns with your growth plans',
      "The business isn't stretched thin by the commitment"
    ],
    caution: 'If liquidity is critical, leasing may be the better option.',
    metaDescription:
      'Commercial and investment real estate financing. KIBA weighs the long-term stability of ownership against the cash and flexibility it ties up before recommending a purchase.'
  },
  {
    slug: 'lines-of-credit',
    navTitle: 'Revolving Lines of Credit',
    navDesc: 'Flexibility for timing gaps, not for shortfalls.',
    icon: Repeat,
    name: 'Revolving Lines of Credit',
    headline: 'Flexibility for timing gaps,\nnot for shortfalls.',
    heroSub:
      'A line of credit is the most useful and the most misused tool on this list. Drawn against a timing gap it is excellent. Drawn against a losing month it hides the problem.',
    heroBullets: [
      'You only pay for what you actually draw.',
      'We will say so if a line is treating a symptom.'
    ],
    heroImage: '/img/hero/advisor-on-call.webp',
    heroImageAlt: 'An advisor on a call with a client',
    summary:
      "Lines of credit can provide flexibility, but they're often misunderstood. Used wisely, they help smooth timing gaps. Used incorrectly, they can hide deeper cash flow issues.",
    expand:
      'The test is whether the balance comes back down. A line that is drawn and repaid as receivables land is doing exactly its job; a line that only ever grows is financing a loss, and the sooner that gets named the more options you still have.',
    usedFor: [
      'Bridging the gap between invoicing and payment',
      'Seasonal swings in working capital',
      'Inventory and payroll timing',
      'Standing capacity for unplanned opportunities'
    ],
    fit: [
      'Cash flow timing varies month to month',
      'You need short-term working capital flexibility',
      'You plan to pay balances down regularly',
      'The line supports operations, not losses'
    ],
    caution: "If it's covering ongoing shortfalls, it's a sign to step back and reassess.",
    metaDescription:
      'Revolving lines of credit for working capital timing gaps. KIBA helps you tell the difference between a line that smooths cash flow and one that is hiding a deeper problem.'
  }
];

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

/* Shared across every program page and the hub. VERBATIM from the source
   page's "How We Decide What's Right" section. */
export const DECISION_FACTORS = [
  'Cash flow and existing obligations',
  'Risk and downside scenarios',
  'Timing and future plans',
  'How much flexibility you need'
];

export const DECISION_LEAD = 'We don’t match businesses to loans. We match decisions to reality.';

export const DECISION_PHILOSOPHY =
  'Sometimes the right move is borrowing. Sometimes it’s preparing first. And sometimes it’s choosing not to borrow at all.';

/* The hub page's own copy. Intro is VERBATIM from the source page. */
export const HUB_INTRO =
  "At Kingdom Impact Business Advisors, we don't start with loan products. We start with your business. Just because money is available doesn't mean it's the right move. Different businesses need different tools at different stages. What helps one company grow can put unnecessary pressure on another. Our role is to help you choose what actually fits, so capital supports your business instead of working against it.";

/* VERBATIM - the "One Size Doesn't Fit Anyone" list. */
export const HUB_QUESTIONS = [
  'Why a certain option might fit',
  'What it really costs over time',
  'How it affects cash flow and flexibility',
  'Whether it supports where you’re trying to go'
];
