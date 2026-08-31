import { CalendarClock, Mail, Phone } from 'lucide-react';
import type { TeamMember } from '@/components/ui/team-section-block-shadcnui';

/*
 * Team copy, lifted from https://kibadvisors.com/meet-our-team/ (the main
 * WordPress site). Names, roles, taglines and bios are VERBATIM from that page;
 * the only editorial change is splitting each bio into paragraphs at existing
 * sentence boundaries so it reads in a card. Don't paraphrase these — if the
 * WordPress page is updated, re-copy rather than rewrite.
 *
 * Note: Barbara's role reads "Director of Client Success" on the source page
 * while her bio says "Client Success Manager". Both are reproduced as written.
 *
 * `focus` tags are ours, not from the source page — three-word summaries of what
 * each person actually handles, used for the badge row.
 *
 * Photos are the same files the legacy /advisors/* booking pages use, already
 * cropped square and face-centered (see CLAUDE.md).
 */

const EMAIL = 'mailto:info@kibadvisors.com';
const PHONE = 'tel:2512108445';

export const TEAM: TeamMember[] = [
  {
    name: 'Michael Sylkatis',
    role: 'Founder & Principal Advisor',
    image: '/advisors/img/michael-sylkatis.jpg',
    meta: '26+ years in financial services',
    tagline:
      'Guides business owners through big-picture decisions, capital strategy, and long-term alignment.',
    focus: ['Capital Strategy', 'Acquisitions', 'Expansion Financing'],
    bio: [
      'Michael Sylkatis is the Founder and Principal Advisor of Kingdom Impact Business Advisors and works directly with business owners as a trusted guide through important financial and growth decisions. Clients work with Michael to gain clarity around their options and confidence in the path forward—not to be sold a loan.',
      'With more than 26 years of experience in financial services, Michael helps business owners navigate acquisitions, expansion, and financing with a thoughtful, steady approach. He takes time to understand each business, clearly explain recommendations, and ensure clients feel informed and supported at every step.',
      'Michael has been married to his wife, Barbara, for 25 years, and together they have two sons—one serving in the U.S. Navy and the other a high school baseball player. He and his family are active in their church, and faith plays an important role in how he approaches both life and business, guiding his commitment to integrity, stewardship, and doing what is right for the client.',
      'Outside of work, Michael enjoys spending time with his family, traveling, watching baseball and football, and being outdoors with their dogs. He founded Kingdom Impact Business Advisors to build an advisory firm where business owners feel heard, respected, and guided toward decisions that support both their companies and their families.'
    ],
    links: [
      { label: 'Book a call', href: '/advisors/michael-sylkatis', icon: CalendarClock },
      { label: 'Email the team', href: EMAIL, icon: Mail },
      { label: 'Call the team', href: PHONE, icon: Phone }
    ]
  },
  {
    name: 'Barbara Sylkatis',
    role: 'Director of Client Success',
    image: '/advisors/img/barbara-sylkatis.jpg',
    meta: '10+ years in business advisory & lending',
    tagline:
      'Your primary point of support—focused on communication, coordination, and making the process feel clear and personal.',
    focus: ['Client Communication', 'Process Coordination', 'Advisory Support'],
    bio: [
      'Barbara Sylkatis serves as Client Success Manager at Kingdom Impact Business Advisors and is often one of the first and most consistent points of contact for clients. Her role is centered on helping clients feel supported, informed, and confident as they move through the advisory and lending process.',
      'With over 10 years of experience in business advisory and lending services, Barbara understands that the process can feel complex or overwhelming at times. She works closely with clients to answer questions, clarify next steps, and ensure nothing feels rushed or unclear. Her calm, thoughtful approach helps create an experience that feels organized, personal, and well guided.',
      'Outside of work, Barbara enjoys baking and cooking for family and friends and is passionate about helping rescue dogs find their permanent homes. That same care and compassion show up in how she serves clients—making sure each person feels valued, heard, and well cared for throughout their journey with Kingdom Impact Business Advisors.'
    ],
    links: [
      { label: 'Book a call', href: '/advisors/barbara-sylkatis', icon: CalendarClock },
      { label: 'Email the team', href: EMAIL, icon: Mail },
      { label: 'Call the team', href: PHONE, icon: Phone }
    ]
  },
  {
    name: 'Ariel Austria',
    role: 'Client Success Advisor',
    image: '/advisors/img/ariel-austria.jpg',
    meta: '15+ years in client support & quality assurance',
    tagline:
      'Helps prepare and organize everything behind the scenes so your information is accurate, complete, and lender-ready.',
    focus: ['Documentation', 'Lender Readiness', 'Quality Assurance'],
    bio: [
      'Ariel serves as a Client Success Advisor at Kingdom Impact Business Advisors and works closely with clients to help them feel supported, informed, and confident throughout the advisory and lending process. He plays a key role in guiding clients through documentation, preparation, and next steps so the process feels clear and manageable.',
      "With over 15 years of experience in client support, sales, and quality assurance, Ariel understands that details matter most when clients are relying on you to get them right. He takes time to listen, understand each client's situation, and ensure information is accurate and well prepared as it moves forward. His calm, methodical approach helps create a smooth experience for both clients and lending partners.",
      'Outside of work, Ariel enjoys staying curious by keeping up with emerging technology, unwinding with video games, and traveling when possible. He also enjoys discovering new food spots with his family—simple moments that reflect the same care, curiosity, and attention he brings to his work with clients.'
    ],
    links: [
      { label: 'Book a call', href: '/advisors/ariel-austria', icon: CalendarClock },
      { label: 'Email the team', href: EMAIL, icon: Mail },
      { label: 'Call the team', href: PHONE, icon: Phone }
    ]
  }
];
