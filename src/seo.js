export const SITE_URL = 'https://www.reclaimportfolio.com';
export const SITE_NAME = 'Reclaim Portfolio';
export const BRAND_NAME = 'Reclaim Portfolio';
export const SUPPORT_EMAIL = 'support@reclaimportfolio.com';
export const SUPPORT_PHONE = '+1-508-591-0090';
export const OG_IMAGE = `${SITE_URL}/link-preview.png`;

const publicPages = {
  home: {
    path: '/',
    title: 'Reclaim Portfolio | Asset Recovery & Blockchain Investigation',
    description: 'Reclaim Portfolio helps clients review lost assets, unclaimed property, stock records, and blockchain-linked funds with confidential, evidence-led support.',
  },
  about: {
    path: '/about',
    title: 'About Reclaim Portfolio | Evidence-Led Asset Recovery',
    description: 'Learn how Reclaim Portfolio approaches lost, dormant, and digital asset recovery with discretion, structured evidence, and clear case-dependent guidance.',
  },
  services: {
    path: '/services',
    title: 'Asset Recovery Services | Reclaim Portfolio',
    description: 'Explore Reclaim Portfolio services for unclaimed property, financial asset recovery, crypto investigation, fraud review, and institutional support.',
  },
  crypto: {
    path: '/crypto',
    title: 'Crypto Investigation & Blockchain Tracing | Reclaim Portfolio',
    description: 'Blockchain tracing, wallet analysis, transaction mapping, and AML-aware crypto investigation support for recovery and compliance workflows.',
  },
  stocks: {
    path: '/stocks',
    title: 'Stock Recovery & Equity Records Support | Reclaim Portfolio',
    description: 'Support for dormant brokerage accounts, old share certificates, transfer agent records, dividend trails, and estate-linked stock holdings.',
  },
  compliance: {
    path: '/compliance',
    title: 'Compliance & Risk Investigation | Reclaim Portfolio',
    description: 'Compliance-aware investigation support for AML review, transaction risk assessment, counterparty screening, and evidence documentation.',
  },
  resources: {
    path: '/resources',
    title: 'Asset Recovery Resources & Guides | Reclaim Portfolio',
    description: 'Read practical guides from Reclaim Portfolio on asset recovery, blockchain tracing, scam response, compliance, and document preparation.',
  },
  contact: {
    path: '/contact',
    title: 'Contact Reclaim Portfolio | Recovery Enquiries',
    description: 'Contact Reclaim Portfolio for confidential asset recovery, crypto investigation, stock recovery, and compliance support enquiries.',
  },
  intake: {
    path: '/intake',
    title: 'Start a Confidential Recovery Review | Reclaim Portfolio',
    description: 'Submit a confidential case intake to Reclaim Portfolio for a structured review of lost assets, crypto funds, stock records, or recovery documents.',
  },
  terms: {
    path: '/terms-of-use',
    title: 'Terms of Use | Reclaim Portfolio',
    description: 'Read the Reclaim Portfolio terms for using the website, submitting case information, creating accounts, and accessing client-facing services.',
  },
  privacy: {
    path: '/privacy-policy',
    title: 'Privacy Policy | Reclaim Portfolio',
    description: 'Learn how Reclaim Portfolio collects, uses, protects, and manages information submitted through the website and client-facing services.',
  },
};

const privatePages = {
  admin: { path: '/admin', title: 'Admin Portal | Reclaim Portfolio' },
  dashboard: { path: '/dashboard', title: 'Client Portal | Reclaim Portfolio' },
  login: { path: '/login', title: 'Sign In | Reclaim Portfolio' },
  signup: { path: '/signup', title: 'Create Account | Reclaim Portfolio' },
  'forgot-password': { path: '/forgot-password', title: 'Reset Access | Reclaim Portfolio' },
  'reset-password': { path: '/reset-password', title: 'Choose New Password | Reclaim Portfolio' },
  post: { path: '/resources', title: 'Resource | Reclaim Portfolio' },
  'not-found': { path: '/404', title: 'Page Not Found | Reclaim Portfolio' },
};

export const PUBLIC_SEO_PAGES = publicPages;

export function absoluteUrl(path = '/') {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

export function getSeoForRoute(route) {
  const page = publicPages[route];
  if (page) {
    return {
      ...page,
      canonical: absoluteUrl(page.path),
      image: OG_IMAGE,
      noindex: false,
    };
  }

  const fallback = privatePages[route] || privatePages['not-found'];
  return {
    path: fallback.path,
    title: fallback.title,
    description: 'Secure Reclaim Portfolio workspace page.',
    canonical: absoluteUrl(fallback.path),
    image: OG_IMAGE,
    noindex: true,
  };
}

export function getStructuredData() {
  const websiteId = `${SITE_URL}/#website`;
  const organizationId = `${SITE_URL}/#organization`;
  const serviceId = `${SITE_URL}/#professionalservice`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': organizationId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: BRAND_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon-512.png`,
      email: SUPPORT_EMAIL,
      telephone: SUPPORT_PHONE,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': serviceId,
      name: BRAND_NAME,
      url: SITE_URL,
      image: OG_IMAGE,
      email: SUPPORT_EMAIL,
      telephone: SUPPORT_PHONE,
      serviceType: [
        'Asset recovery support',
        'Unclaimed property recovery',
        'Blockchain investigation',
        'Crypto compliance review',
        'Stock recovery support',
      ],
      address: [
        {
          '@type': 'PostalAddress',
          streetAddress: 'Suite 1540, 500 Fifth Avenue',
          addressLocality: 'New York',
          addressRegion: 'NY',
          postalCode: '10110',
          addressCountry: 'US',
        },
        {
          '@type': 'PostalAddress',
          streetAddress: 'Dreikonigstrasse 8',
          postalCode: '8002',
          addressLocality: 'Zurich',
          addressCountry: 'CH',
        },
        {
          '@type': 'PostalAddress',
          streetAddress: 'Austrasse 52',
          postalCode: 'FL-9490',
          addressLocality: 'Vaduz',
          addressCountry: 'LI',
        },
      ],
      parentOrganization: { '@id': organizationId },
    },
  ];
}
