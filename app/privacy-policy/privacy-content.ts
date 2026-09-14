import type { LegalDoc } from '@/components/LegalPage/LegalPage';

/*
 * The Privacy Policy, supplied by KIBA and reproduced VERBATIM.
 *
 * DO NOT EDIT THE WORDING HERE. This is a legal document: no tightening, no
 * house-style tweaks, no "clearer" phrasing, not even punctuation. If it needs
 * to change, the change comes from the business (or their counsel) as new text
 * and this file is replaced wholesale, with `updated` bumped.
 *
 * Structure only — headings, paragraphs, lists and the definition list — was
 * added to render it. Nothing was reordered, merged or dropped.
 */

export const PRIVACY_POLICY: LegalDoc = {
  title: 'Privacy Policy',
  updated: 'Updated on June 17th, 2026',
  intro: [
    'Kingdom Impact Business Advisors (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, disclosed, and protected when you visit our website, submit information through our forms, communicate with us, or use our services.',
    'This Privacy Policy applies to our website and any associated subdomains (collectively, our “Service”). By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms & Conditions.'
  ],
  sections: [
    {
      heading: 'Definitions and Key Terms',
      blocks: [
        {
          type: 'p',
          text: 'To help explain things as clearly as possible in this Privacy Policy, every time any of these terms are referenced, they are defined as follows:'
        },
        {
          type: 'dl',
          items: [
            {
              term: 'Company',
              def: 'when this policy mentions “Company”, “we”, “us”, or “our”, it refers to MBS Holdings LLC dba Kingdom Impact Business Advisors (1309 Coffeen Ave Ste 1200, Sheridan, WY 82801), which is responsible for your information under this Privacy Policy.'
            },
            {
              term: 'Country',
              def: 'where Kingdom Impact Business Advisors is based, in this case, the United States.'
            },
            {
              term: 'Customer',
              def: 'a person, business, or organization that engages with Kingdom Impact Business Advisors regarding consulting, funding advisory, financing solutions, lender referral, or related services.'
            },
            {
              term: 'Device',
              def: 'any internet-connected device such as a computer, tablet, or mobile phone used to access our website or services.'
            },
            {
              term: 'Personal Data',
              def: 'information that can directly or indirectly identify an individual.'
            },
            {
              term: 'Service',
              def: 'refers to the services provided by Kingdom Impact Business Advisors, including business consulting, funding advisory, financing solutions, lender referral, and related business support services.'
            },
            {
              term: 'Website',
              def: 'the Kingdom Impact Business Advisors site, which can be accessed via this URL: https://kibadvisors.com'
            },
            { term: 'You', def: 'a person or entity using our website or services.' }
          ]
        }
      ]
    },
    {
      heading: 'What Information Do We Collect?',
      blocks: [
        { type: 'p', text: 'We may collect information that you voluntarily provide to us, including:' },
        {
          type: 'ul',
          items: [
            'First and last name',
            'Email address',
            'Phone number',
            'Mailing address',
            'Social Security number',
            'Information submitted through applications, forms, surveys, or communications'
          ]
        },
        {
          type: 'p',
          text: 'We may also automatically collect certain technical information when you visit our website, including:'
        },
        {
          type: 'ul',
          items: [
            'IP address',
            'Browser type',
            'Device information',
            'Website usage information',
            'Referral sources',
            'Cookie and tracking data'
          ]
        }
      ]
    },
    {
      heading: 'How Do We Use the Information We Collect?',
      blocks: [
        { type: 'p', text: 'We may use the information we collect to:' },
        {
          type: 'ul',
          items: [
            'Respond to inquiries and requests',
            'Evaluate financing opportunities',
            'Connect you with lenders and funding providers',
            'Process applications and service requests',
            'Provide customer support',
            'Improve our website and services',
            'Send updates and communications',
            'Comply with legal obligations',
            'Prevent fraud and unauthorized activity'
          ]
        }
      ]
    },
    {
      heading: 'Email Communications',
      blocks: [
        {
          type: 'p',
          text: 'By submitting your email address through our website, forms, advertisements, or other communication channels, you consent to receive communications from Kingdom Impact Business Advisors regarding your inquiries, financing opportunities, application updates, appointment reminders, customer support, and related services.'
        },
        {
          type: 'p',
          text: 'You may unsubscribe from marketing emails at any time by clicking the unsubscribe link included in our emails. Please note that we may still send service-related or transactional communications regarding your inquiries, applications, or existing relationship with Kingdom Impact Business Advisors.'
        }
      ]
    },
    {
      heading: 'SMS Communications',
      blocks: [
        {
          type: 'p',
          text: 'If you provide your mobile phone number through our website, forms, advertisements, or other communication channels, you consent to receive text messages from Kingdom Impact Business Advisors regarding your inquiries, financing opportunities, application updates, appointment reminders, customer support, and related services.'
        },
        { type: 'p', text: 'Message frequency may vary.' },
        { type: 'p', text: 'Message and data rates may apply.' },
        {
          type: 'p',
          text: 'You may opt out of SMS communications at any time by replying OUT to any message. For assistance, reply HELP or contact us at info@kibadvisors.com.'
        },
        {
          type: 'p',
          text: 'Consent to receive SMS messages is not a condition of purchase, financing approval, or obtaining services from Kingdom Impact Business Advisors.'
        },
        {
          type: 'p',
          text: 'Mobile information will not be shared with third parties or affiliates for marketing or promotional purposes. Information may be shared with service providers solely to facilitate messaging services and business operations.'
        }
      ]
    },
    {
      heading: 'Do We Share the Information We Collect with Third Parties?',
      blocks: [
        {
          type: 'p',
          text: 'We may share information with trusted third-party service providers that assist us in operating our business, including:'
        },
        {
          type: 'ul',
          items: [
            'CRM and customer management platforms',
            'Email service providers',
            'SMS and communication providers',
            'Analytics providers',
            'Cloud storage and hosting providers',
            'Customer support providers'
          ]
        },
        {
          type: 'p',
          text: 'We may also share information with lenders, financial institutions, funding providers, underwriting partners, and other financing sources when necessary to evaluate financing opportunities or provide requested services.'
        },
        {
          type: 'p',
          text: 'We may disclose information if required by law, court order, subpoena, regulatory request, or governmental authority.'
        }
      ]
    },
    {
      heading: 'Financing and Lender Referrals',
      blocks: [
        {
          type: 'p',
          text: 'Kingdom Impact Business Advisors provides business consulting, funding advisory, financing solutions, lender referral, and related business support services.'
        },
        {
          type: 'p',
          text: 'Information you submit may be shared with banks, third-party lenders, SBA lenders, and other financing sources for the purpose of evaluating financing opportunities.'
        },
        {
          type: 'p',
          text: 'Submission of information does not guarantee approval or funding. All financing decisions are made solely by the applicable lender or funding provider.'
        }
      ]
    },
    {
      heading: 'Cookies',
      blocks: [
        {
          type: 'p',
          text: 'Kingdom Impact Business Advisors uses cookies and similar technologies to enhance website performance, analyze website usage, improve user experience, and measure marketing effectiveness.'
        },
        {
          type: 'p',
          text: 'Most web browsers allow you to disable cookies. However, doing so may limit certain functionality of the website.'
        }
      ]
    },
    {
      heading: 'Analytics and Advertising Technologies',
      blocks: [
        {
          type: 'p',
          text: 'Kingdom Impact Business Advisors may use analytics and advertising technologies to better understand website usage, improve our services, measure advertising effectiveness, and provide relevant content to visitors.'
        },
        { type: 'p', text: 'These technologies may include:' },
        {
          type: 'ul',
          items: [
            'Google Analytics',
            'Google Ads',
            'Meta Pixel (Facebook Pixel)',
            'Other analytics and advertising platforms'
          ]
        },
        {
          type: 'p',
          text: 'These tools may collect information regarding your interaction with our website, including pages visited, time spent on the website, browser information, device information, referral sources, and other usage data.'
        },
        {
          type: 'p',
          text: 'The information collected through these technologies is generally used for reporting, analytics, advertising optimization, audience creation, remarketing, and improving the user experience.'
        },
        {
          type: 'p',
          text: 'You may be able to control certain tracking technologies through your browser settings or through the privacy controls provided by the applicable platform.'
        }
      ]
    },
    {
      heading: 'Remarketing Services',
      blocks: [
        {
          type: 'p',
          text: 'Kingdom Impact Business Advisors may use remarketing and retargeting services to display advertisements to individuals who have previously visited our website.'
        },
        {
          type: 'p',
          text: 'These advertisements may appear on search engines, social media platforms, and other websites across the internet.'
        },
        {
          type: 'p',
          text: 'Remarketing technologies help us communicate with individuals who have previously expressed interest in our services and improve the effectiveness of our advertising campaigns.'
        }
      ]
    },
    {
      heading: 'Links to Other Websites',
      blocks: [
        {
          type: 'p',
          text: 'Our website may contain links to third-party websites, lenders, financial institutions, service providers, social media platforms, or other external resources.'
        },
        {
          type: 'p',
          text: 'We are not responsible for the privacy practices, content, policies, or security of any third-party websites. We encourage you to review the privacy policies of any website you visit before providing personal information.'
        },
        {
          type: 'p',
          text: 'Your use of third-party websites is governed solely by the terms and policies of those websites.'
        }
      ]
    },
    {
      heading: 'How Long Do We Keep Your Information?',
      blocks: [
        {
          type: 'p',
          text: 'We retain information only as long as reasonably necessary to provide services, comply with legal obligations, resolve disputes, enforce agreements, and maintain business records.'
        }
      ]
    },
    {
      heading: 'How Do We Protect Your Information?',
      blocks: [
        {
          type: 'p',
          text: 'We implement reasonable administrative, technical, and physical safeguards designed to protect your personal information from unauthorized access, use, disclosure, or destruction.'
        },
        {
          type: 'p',
          text: 'While we strive to protect your information, no method of transmission over the Internet or method of electronic storage is completely secure, and we cannot guarantee absolute security.'
        }
      ]
    },
    {
      heading: 'California Residents',
      blocks: [
        {
          type: 'p',
          text: 'California residents may have rights under applicable privacy laws, including the right to know, access, correct, or delete certain personal information collected about them.'
        },
        { type: 'p', text: 'We do not sell personal information for monetary consideration.' }
      ]
    },
    {
      heading: 'Changes to This Privacy Policy',
      blocks: [
        {
          type: 'p',
          text: 'We reserve the right to modify this Privacy Policy at any time. Any changes will be posted on this page with an updated revision date.'
        },
        {
          type: 'p',
          text: 'Your continued use of our website or services following any changes constitutes acceptance of the revised Privacy Policy.'
        }
      ]
    },
    {
      heading: 'Contact Us',
      blocks: [
        { type: 'p', text: 'Don’t hesitate to contact us if you have any questions.' },
        { type: 'p', text: 'Via Email: info@kibadvisors.com' }
      ]
    }
  ]
};
