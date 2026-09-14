/*
 * The advisor booking pages, migrated off public/legacy/advisors/*.html.
 *
 * This replaces the legacy config-block-plus-injector-script pattern with a
 * proper data file, which is what CLAUDE.md asks for when those pages become
 * real routes. `_template.html` is gone with them: adding an advisor is a new
 * entry in this array, not a copied file.
 *
 * EVERY FIELD IS VERBATIM from the corresponding legacy config block, including
 * each advisor's own `schedulerUrl` — those are three DIFFERENT GoHighLevel
 * calendars and must not be collapsed into one.
 *
 * Photos are the existing /advisors/img/*.jpg files rather than the base64 data
 * URIs the legacy pages embedded. Same images; the legacy pages inlined them so
 * each file stayed self-contained, which a real route doesn't need.
 */

export type Advisor = {
  slug: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  photo: string;
  /* This advisor's own GoHighLevel calendar. Not shared. */
  schedulerUrl: string;
};

export const ADVISORS: Advisor[] = [
  {
    slug: 'michael-sylkatis',
    name: 'Michael Sylkatis',
    title: 'Founder & Principal Advisor',
    tagline:
      'Guides business owners through big-picture decisions, capital strategy, and long-term alignment.',
    bio: 'Michael Sylkatis is the Founder and Principal Advisor of Kingdom Impact Business Advisors and works directly with business owners as a trusted guide through important financial and growth decisions. Clients work with Michael to gain clarity around their options and confidence in the path forward—not to be sold a loan.',
    photo: '/advisors/img/michael-sylkatis.jpg',
    schedulerUrl: 'https://api.leadconnectorhq.com/widget/booking/hNVlyN1rtNcxpWkSshP8'
  },
  {
    slug: 'barbara-sylkatis',
    name: 'Barbara Sylkatis',
    title: 'Director of Client Success',
    tagline:
      'Your primary point of support—focused on communication, coordination, and making the process feel clear and personal.',
    bio: 'Barbara Sylkatis serves as Client Success Manager at Kingdom Impact Business Advisors and is often one of the first and most consistent points of contact for clients. Her role is centered on helping clients feel supported, informed, and confident as they move through the advisory and lending process.',
    photo: '/advisors/img/barbara-sylkatis.jpg',
    schedulerUrl: 'https://api.leadconnectorhq.com/widget/booking/WCEosREj9oH9u6eZiysI'
  },
  {
    slug: 'ariel-austria',
    name: 'Ariel Austria',
    title: 'Client Success Advisor',
    tagline:
      'Helps prepare and organize everything behind the scenes so your information is accurate, complete, and lender-ready.',
    bio: 'Ariel serves as a Client Success Advisor at Kingdom Impact Business Advisors and works closely with clients to help them feel supported, informed, and confident throughout the advisory and lending process. He plays a key role in guiding clients through documentation, preparation, and next steps so the process feels clear and manageable.',
    photo: '/advisors/img/ariel-austria.jpg',
    schedulerUrl: 'https://api.leadconnectorhq.com/widget/booking/ZO06OLqzbTuqpxNiaC2d'
  }
];

export function getAdvisor(slug: string): Advisor | undefined {
  return ADVISORS.find((a) => a.slug === slug);
}
