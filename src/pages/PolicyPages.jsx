import { PageHead, Reveal } from '../ui.jsx';

const LAST_UPDATED = 'May 28, 2026';

const termsSections = [
  {
    title: 'Use of this website',
    body: [
      'This website provides information about Reclaim Portfolio services and allows visitors to contact us, subscribe to updates, create an account, or submit a confidential case review request.',
      'You agree to use the website lawfully and not attempt to disrupt, misuse, reverse engineer, or gain unauthorized access to any part of the website, client portal, admin portal, or related systems.',
    ],
  },
  {
    title: 'No guaranteed recovery outcome',
    body: [
      'Reclaim Portfolio provides investigation, documentation, compliance, and asset recovery support. Recovery outcomes are case-dependent and may rely on records, jurisdiction rules, third parties, custodians, exchanges, institutions, and other factors outside our control.',
      'Nothing on this website guarantees that funds, property, securities, digital assets, or other assets will be recovered.',
    ],
  },
  {
    title: 'No legal, financial, or investment advice',
    body: [
      'Information on this website is provided for general informational purposes. It is not legal, financial, tax, investment, or regulatory advice.',
      'You should consult qualified professional advisors where legal, financial, tax, investment, or regulatory advice is required.',
    ],
  },
  {
    title: 'Case submissions and accounts',
    body: [
      'When you submit information through forms, upload evidence, or create an account, you are responsible for providing accurate information and for keeping your login credentials confidential.',
      'You should not submit information or documents that you do not have permission to share.',
    ],
  },
  {
    title: 'Intellectual property',
    body: [
      'Website content, branding, interface elements, copy, graphics, and other materials are owned by Reclaim Portfolio or its licensors unless otherwise stated.',
      'You may not copy, reproduce, sell, or redistribute website materials without written permission, except for personal reference related to your own case review.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about these Terms of Use may be sent to support@reclaimportfolio.com.',
    ],
  },
];

const privacySections = [
  {
    title: 'Information we collect',
    body: [
      'We may collect information you provide directly, including your name, email address, phone number, country, address, account details, case descriptions, wallet addresses, transaction hashes, uploaded evidence, support messages, and newsletter subscription details.',
      'We may also receive basic technical information from your browser or device, such as pages visited, timestamps, IP-related data, and security logs needed to operate and protect the website.',
    ],
  },
  {
    title: 'How we use information',
    body: [
      'We use information to respond to enquiries, review case submissions, provide client portal access, manage support requests, send requested communications, maintain records, improve website reliability, and protect against misuse or unauthorized access.',
      'We may use contact details to send service-related messages. Newsletter messages are sent only when you subscribe or otherwise request them.',
    ],
  },
  {
    title: 'How information is shared',
    body: [
      'We do not sell personal information. We may share information with service providers that help operate the website, email, hosting, security, support, case management, or related business systems.',
      'We may also share information when required by law, to protect rights and security, or with your direction or consent as part of a case review or recovery support process.',
    ],
  },
  {
    title: 'Security and retention',
    body: [
      'We use reasonable administrative, technical, and organizational safeguards designed to protect submitted information. No internet or email transmission can be guaranteed completely secure.',
      'We keep information for as long as needed for the purposes described in this policy, to maintain business records, resolve disputes, support security, or comply with legal obligations.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You may contact us to request access, correction, or deletion of information associated with you, subject to identity verification and any legal, security, or recordkeeping requirements.',
      'You may unsubscribe from newsletter communications using the unsubscribe option in the email or by contacting us.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about this Privacy Policy may be sent to support@reclaimportfolio.com.',
    ],
  },
];

function PolicyLayout({ eyebrow, title, sub, sections }) {
  return (
    <main>
      <PageHead eyebrow={eyebrow} title={title} sub={sub} />
      <section className="section-sm">
        <div className="wrap policy-wrap">
          <Reveal>
            <div className="glass policy-panel">
              <p className="policy-updated">Last updated: {LAST_UPDATED}</p>
              {sections.map((section) => (
                <section className="policy-section" key={section.title}>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export function TermsPage() {
  return (
    <PolicyLayout
      eyebrow="Terms of Use"
      title="Terms of Use"
      sub="Simple terms for using the Reclaim Portfolio website, public forms, and client-facing digital services."
      sections={termsSections}
    />
  );
}

export function PrivacyPage() {
  return (
    <PolicyLayout
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      sub="How Reclaim Portfolio collects, uses, protects, and manages information submitted through the website."
      sections={privacySections}
    />
  );
}
