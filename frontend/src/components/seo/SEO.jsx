import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Melodic Vault';
const DEFAULT_DESCRIPTION =
  'Secure files with melody and rhythm based authentication, local encryption, and metadata-only backend storage.';
const DEFAULT_IMAGE = '/favicon.svg';

const getSiteUrl = () =>
  (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes.identity).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  Object.entries(attributes.values).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const setLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  noIndex = false,
  type = 'website',
}) => {
  const location = useLocation();

  useEffect(() => {
    const siteUrl = getSiteUrl();
    const path = location.pathname === '/' ? '' : location.pathname;
    const canonical = `${siteUrl}${path}`;
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

    document.title = fullTitle;
    document.documentElement.lang = 'en';
    setLink('canonical', canonical);

    setMeta('meta[name="description"]', {
      identity: { name: 'description' },
      values: { content: description },
    });
    setMeta('meta[name="robots"]', {
      identity: { name: 'robots' },
      values: { content: noIndex ? 'noindex,nofollow' : 'index,follow' },
    });
    setMeta('meta[property="og:site_name"]', {
      identity: { property: 'og:site_name' },
      values: { content: SITE_NAME },
    });
    setMeta('meta[property="og:title"]', {
      identity: { property: 'og:title' },
      values: { content: fullTitle },
    });
    setMeta('meta[property="og:description"]', {
      identity: { property: 'og:description' },
      values: { content: description },
    });
    setMeta('meta[property="og:type"]', {
      identity: { property: 'og:type' },
      values: { content: type },
    });
    setMeta('meta[property="og:url"]', {
      identity: { property: 'og:url' },
      values: { content: canonical },
    });
    setMeta('meta[property="og:image"]', {
      identity: { property: 'og:image' },
      values: { content: imageUrl },
    });
    setMeta('meta[name="twitter:card"]', {
      identity: { name: 'twitter:card' },
      values: { content: 'summary_large_image' },
    });
    setMeta('meta[name="twitter:title"]', {
      identity: { name: 'twitter:title' },
      values: { content: fullTitle },
    });
    setMeta('meta[name="twitter:description"]', {
      identity: { name: 'twitter:description' },
      values: { content: description },
    });
    setMeta('meta[name="twitter:image"]', {
      identity: { name: 'twitter:image' },
      values: { content: imageUrl },
    });

    const appJson = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      description: DEFAULT_DESCRIPTION,
      offers: {
        '@type': 'Offer',
        price: '199',
        priceCurrency: 'INR',
      },
    };

    let structuredData = document.getElementById('app-structured-data');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = 'app-structured-data';
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(appJson);
  }, [description, image, location.pathname, noIndex, title, type]);

  return null;
};

export default SEO;
