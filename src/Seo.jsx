import { useEffect } from 'react';
import { useApp } from './context.js';
import { getSeoForRoute, getStructuredData, SITE_NAME } from './seo.js';

function upsertMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function upsertJsonLd(data) {
  let tag = document.head.querySelector('#site-structured-data');
  if (!tag) {
    tag = document.createElement('script');
    tag.id = 'site-structured-data';
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
}

export function Seo() {
  const { route } = useApp();

  useEffect(() => {
    const seo = getSeoForRoute(route);
    const robots = seo.noindex ? 'noindex, nofollow' : 'index, follow';

    document.title = seo.title;
    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'robots', robots);
    upsertLink('canonical', seo.canonical);

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:url', seo.canonical);
    upsertMeta('property', 'og:image', seo.image);
    upsertMeta('property', 'og:image:secure_url', seo.image);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:image:alt', 'Reclaim Portfolio asset recovery and blockchain investigation');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);
    upsertMeta('name', 'twitter:image', seo.image);

    upsertJsonLd(getStructuredData());
  }, [route]);

  return null;
}
