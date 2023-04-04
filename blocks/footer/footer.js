import { decorateIcons, getMetadata } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const hideBlog = !window.location.pathname.startsWith('/blog/');
  const navPath = getMetadata('nav');
  let footerName = 'footer';
  let styles = ['company', 'support', 'compare', 'links', 'blog', 'social', 'brand', 'legal'];

  if (navPath === '/nav-limited') {
    footerName = 'footer-limited';
    block.parentElement.classList.add('footer-limited');
    styles = ['links', 'brand', 'legal'];
  }
  const resp = await fetch(`/blog/fixtures/${footerName}.plain.html`);
  const html = await resp.text();
  block.innerHTML = html;
  decorateIcons(block);
  styles.forEach((style, i) => {
    if (block.children[i]) {
      block.children[i].classList.add(style);
      if (hideBlog && style === 'blog') block.children[i].setAttribute('aria-hidden', true);
    }
  });

  const $teconsent = document.createElement('div');
  $teconsent.id = 'teconsent';
  block.querySelector('a[href^="https://consent-pref.trustarc.com/"]').replaceWith($teconsent);

  const $consent = document.createElement('div');
  $consent.id = 'consent-banner';
  block.after($consent);
}
