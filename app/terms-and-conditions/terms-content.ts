import type { LegalDoc } from '@/components/LegalPage/LegalPage';

/*
 * The Terms & Conditions, supplied by KIBA and reproduced VERBATIM.
 *
 * DO NOT EDIT THE WORDING HERE. This is a legal document: no tightening, no
 * house-style tweaks, no "clearer" phrasing, not even punctuation. If it needs
 * to change, the change comes from the business (or their counsel) as new text
 * and this file is replaced wholesale, with `updated` bumped.
 *
 * Structure only — headings, paragraphs, lists and the definition list — was
 * added to render it. Nothing was reordered, merged or dropped. The source has
 * no text before its first heading ("General Terms"), so `intro` is empty.
 */

export const TERMS_AND_CONDITIONS: LegalDoc = {
  title: 'Terms & Conditions',
  updated: 'Updated on June 17th, 2026',
  intro: [],
  sections: [
    {
      heading: 'General Terms',
      blocks: [
        {
          type: 'p',
          text: 'By accessing or using the Kingdom Impact Business Advisors website, submitting information through our forms, requesting information regarding our services, or otherwise engaging with us, you confirm that you are in agreement with and bound by the terms contained in these Terms & Conditions.'
        },
        {
          type: 'p',
          text: 'These Terms & Conditions apply to the entire website and any communication between you and Kingdom Impact Business Advisors, including but not limited to email, telephone, text message, social media, and other electronic communications.'
        },
        {
          type: 'p',
          text: 'We reserve the right to modify our website, services, policies, and these Terms & Conditions at any time.'
        }
      ]
    },
    {
      heading: 'Definitions and Key Terms',
      blocks: [
        {
          type: 'p',
          text: 'To help explain things as clearly as possible in these Terms & Conditions, every time any of these terms are referenced, they are defined as follows:'
        },
        {
          type: 'dl',
          items: [
            {
              term: 'Company',
              def: 'when these Terms mention “Company”, “we”, “us”, or “our”, it refers to MBS Holdings LLC dba Kingdom Impact Business Advisors (1309 Coffeen Ave Ste 1200, Sheridan, WY 82801)'
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
      heading: 'Services',
      blocks: [
        {
          type: 'p',
          text: 'Kingdom Impact Business Advisors provides consulting and advisory services intended to assist businesses in evaluating financing opportunities and connecting with potential funding sources.'
        },
        {
          type: 'p',
          text: 'We do not originate loans, extend credit, make underwriting decisions, or guarantee financing approval.'
        },
        {
          type: 'p',
          text: 'Any financing offer, approval, funding amount, repayment term, interest rate, fee structure, or lending decision is determined solely by the applicable lender or funding provider.'
        }
      ]
    },
    {
      heading: 'No Guarantee of Financing',
      blocks: [
        { type: 'p', text: 'Kingdom Impact Business Advisors does not guarantee:' },
        {
          type: 'ul',
          items: [
            'Approval for financing',
            'Funding of any application',
            'Specific funding amounts',
            'Interest rates',
            'Repayment terms',
            'Availability of financing programs',
            'Funding timelines'
          ]
        },
        {
          type: 'p',
          text: 'Submission of information through our website or engagement with our services does not guarantee funding or approval.'
        }
      ]
    },
    {
      heading: 'User Responsibilities',
      blocks: [
        { type: 'p', text: 'By using our website and services, you agree that:' },
        {
          type: 'ul',
          items: [
            'All information you provide is accurate and complete.',
            'You have authority to act on behalf of any business you represent.',
            'You will promptly update any information that becomes inaccurate.',
            'You will use the website and services only for lawful purposes.',
            'You will not provide false, misleading, or fraudulent information.'
          ]
        }
      ]
    },
    {
      heading: 'Website Use Restrictions',
      blocks: [
        { type: 'p', text: 'You agree not to:' },
        {
          type: 'ul',
          items: [
            'Use the website in violation of any law or regulation.',
            'Attempt to gain unauthorized access to our systems or data.',
            'Introduce malware, viruses, or harmful code.',
            'Interfere with the operation of the website.',
            'Use automated tools to scrape or collect website data without authorization.'
          ]
        }
      ]
    },
    {
      heading: 'Communications Consent',
      blocks: [
        {
          type: 'p',
          text: 'By submitting your information through our website, forms, advertisements, social media channels, email, telephone, or other communication channels, you consent to receive communications from Kingdom Impact Business Advisors regarding your inquiry, application, financing opportunities, services, and account-related matters.'
        },
        { type: 'p', text: 'Communications may be delivered through:' },
        {
          type: 'ul',
          items: ['Email', 'Telephone calls', 'SMS', 'Automated technology', 'Other electronic communication methods']
        },
        {
          type: 'p',
          text: 'Consent to receive communications is not a condition of financing approval or obtaining services.'
        }
      ]
    },
    {
      heading: 'SMS Terms of Service',
      blocks: [
        {
          type: 'p',
          text: 'By providing your mobile phone number and consenting to receive text messages, you agree to receive SMS communications from Kingdom Impact Business Advisors regarding:'
        },
        {
          type: 'ul',
          items: [
            'Financing inquiries',
            'Application updates',
            'Appointment reminders',
            'Account notifications',
            'Customer support communications',
            'Business funding opportunities'
          ]
        },
        { type: 'p', text: 'Message frequency may vary.' },
        { type: 'p', text: 'Message and data rates may apply.' },
        { type: 'p', text: 'You may opt out at any time by replying OUT to any message.' },
        { type: 'p', text: 'For assistance, reply HELP or contact us at info@kibadvisors.com.' },
        {
          type: 'p',
          text: 'Consent to receive SMS messages is not a condition of purchase, financing approval, or obtaining services.'
        },
        { type: 'p', text: 'Supported carriers are not liable for delayed or undelivered messages.' }
      ]
    },
    {
      heading: 'Third-Party Services',
      blocks: [
        {
          type: 'p',
          text: 'Kingdom Impact Business Advisors may utilize third-party software providers, communication platforms, CRM systems, lenders, financial institutions, funding providers, and other service providers.'
        },
        {
          type: 'p',
          text: 'We are not responsible for the content, actions, policies, services, products, financing decisions, or performance of any third party.'
        },
        {
          type: 'p',
          text: 'Any agreement entered into between you and a third-party lender or provider is solely between you and that third party.'
        }
      ]
    },
    {
      heading: 'Links to Other Websites',
      blocks: [
        {
          type: 'p',
          text: 'Our website may contain links to third-party websites, lenders, financial institutions, social media platforms, or other external resources that are not owned or controlled by Kingdom Impact Business Advisors.'
        },
        {
          type: 'p',
          text: 'We do not control and are not responsible for the content, policies, practices, products, services, or availability of any third-party websites or resources.'
        },
        {
          type: 'p',
          text: 'Your use of any third-party website is at your own risk and subject to the terms and conditions of the applicable third party.'
        }
      ]
    },
    {
      heading: 'Intellectual Property',
      blocks: [
        {
          type: 'p',
          text: 'The website and its entire contents, including but not limited to text, graphics, logos, images, designs, documents, and other materials, are owned by Kingdom Impact Business Advisors or its licensors and are protected by applicable intellectual property laws.'
        },
        {
          type: 'p',
          text: 'No content may be copied, reproduced, distributed, modified, or exploited without prior written consent.'
        }
      ]
    },
    {
      heading: 'Privacy',
      blocks: [
        { type: 'p', text: 'Your use of our website is also governed by our Privacy Policy.' },
        {
          type: 'p',
          text: 'By using our website and services, you acknowledge that you have reviewed and accepted our Privacy Policy.'
        }
      ]
    },
    {
      heading: 'Disclaimer',
      blocks: [
        { type: 'p', text: 'The website and services are provided on an “AS IS” and “AS AVAILABLE” basis.' },
        {
          type: 'p',
          text: 'Kingdom Impact Business Advisors makes no warranties, express or implied, regarding:'
        },
        {
          type: 'ul',
          items: [
            'Website availability',
            'Accuracy of information',
            'Financing outcomes',
            'Business results',
            'Third-party services'
          ]
        },
        { type: 'p', text: 'We disclaim all warranties to the fullest extent permitted by law.' }
      ]
    },
    {
      heading: 'Limitation of Liability',
      blocks: [
        {
          type: 'p',
          text: 'To the fullest extent permitted by applicable law, Kingdom Impact Business Advisors, its owners, officers, employees, contractors, affiliates, or representatives shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages arising from:'
        },
        {
          type: 'ul',
          items: [
            'Use of the website',
            'Use of our services',
            'Financing decisions',
            'Denied applications',
            'Delayed funding',
            'Loss of profits',
            'Business interruption',
            'Loss of data'
          ]
        },
        {
          type: 'p',
          text: 'Your sole remedy for dissatisfaction with our services is to discontinue use of the website and services.'
        }
      ]
    },
    {
      heading: 'Indemnification',
      blocks: [
        {
          type: 'p',
          text: 'You agree to indemnify and hold harmless Kingdom Impact Business Advisors, its owners, officers, employees, contractors, affiliates, and representatives from any claims, damages, liabilities, losses, costs, or expenses arising from:'
        },
        {
          type: 'ul',
          items: [
            'Your use of the website or services',
            'Information you provide',
            'Your violation of these Terms & Conditions',
            'Your violation of applicable laws or regulations'
          ]
        }
      ]
    },
    {
      heading: 'Changes to Our Terms & Conditions',
      blocks: [
        { type: 'p', text: 'We reserve the right to update or modify these Terms & Conditions at any time.' },
        { type: 'p', text: 'Any changes will be posted on this page with an updated revision date.' },
        {
          type: 'p',
          text: 'Your continued use of our website or services following any changes constitutes acceptance of the revised Terms & Conditions.'
        }
      ]
    },
    {
      heading: 'Governing Law',
      blocks: [
        {
          type: 'p',
          text: 'These Terms & Conditions shall be governed and interpreted in accordance with the laws of the State of Wyoming, without regard to conflict of law principles.'
        }
      ]
    },
    {
      heading: 'Severability',
      blocks: [
        {
          type: 'p',
          text: 'If any provision of these Terms & Conditions is found to be unenforceable or invalid, the remaining provisions shall continue in full force and effect.'
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
