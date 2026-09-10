/*
 * The one list of client testimonials for the whole site.
 *
 * Before this existed the same quotes were pasted into the homepage carousel
 * and into nine legacy HTML files, and they had already drifted: the homepage
 * attributed two of them to "Business Owner" while every legacy page named the
 * client, and business-acquisitions.html had lost an "an" from Raul's quote.
 * The named attributions won - they're the stronger and more specific version,
 * and they're what the majority of pages were already showing.
 *
 * THERE ARE ONLY FOUR REAL TESTIMONIALS. That is a content fact, not an
 * oversight, and it drives the column layout in
 * components/ui/testimonials-columns-1.tsx: the block splits into two columns
 * at this length and will use three automatically once there are six. Do NOT
 * pad this array to fill the layout - inventing client quotes for a financial
 * advisory firm is not a design decision.
 *
 * NO PHOTOS EITHER. We have no images of these clients, and the reference
 * component's avatar slot is filled with a generated monogram rather than a
 * stock face, for the same reason. Add a real `image` to an entry and the
 * component will use it instead.
 */

export type Testimonial = {
  quote: string;
  name: string;
  /* Shown under the name - what they are, not a job title we invented. */
  role: string;
  /* Optional real photo. Falls back to an initials monogram when absent. */
  image?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Michael worked tirelessly with us to obtain our SBA loan and helped us understand the process throughout. He made an otherwise stressful process easy and successful! Highly recommend his services!',
    name: 'Nick R.',
    role: 'SBA Loan Client'
  },
  {
    quote:
      'Michael was excellent in trying to find every possible solution for my funding needs. He stayed connected to the deal at all times to make sure we got to the closing table.',
    name: 'Richard R.',
    role: 'Business Funding Client'
  },
  {
    quote:
      'Michael & Barbara helped us navigate the complexities of an SBA loan. They were patient and proficient with their work, and made the process extremely easy. I would work with them again.',
    name: 'Raul G.',
    role: 'SBA Loan Client'
  },
  {
    quote:
      'We continue to work with Michael because of his deep experience in the lending space and his genuine commitment to doing what’s right for each client. He consistently goes above and beyond, giving every file the care and attention it deserves. That level of effort and integrity is why we confidently refer our clients to him whenever the need arises.',
    name: 'Paul Childers',
    role: 'RivenWay Business Solutions'
  }
];

/* "Nick R." -> "NR", "Paul Childers" -> "PC". Used for the monogram avatar. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
