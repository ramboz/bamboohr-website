import { buildBlock, getMetadata } from './scripts.js';
import { toSlug } from './integrations-listing.js';

function buildImageBlocks(main) {
  let floatCounter = 0;
  main.querySelectorAll(':scope > div > p > picture, :scope > div > p > a > picture').forEach((picture) => {
    const up = picture.parentElement;
    const p = picture.closest('p');
    const div = p.parentElement;
    const nextSib = p.nextElementSibling;
    if ([...up.children].length === 1) {
      const imgBlock = buildBlock('image', { elems: [up] });
      if (up.tagName === 'A') {
        div.insertBefore(imgBlock, p);
        imgBlock.classList.add(floatCounter % 2 ? 'left' : 'right');
        floatCounter += 1;
      } else div.insertBefore(imgBlock, nextSib);
    }
  });
}

function buildArticleHeader(main) {
  try {
    const author = getMetadata('author');
    const publicationDate = getMetadata('publication-date');
    const updatedDate = getMetadata('updated-date') || '';
    const readtime = getMetadata('read-time');
    const category = getMetadata('category');
    const h1 = main.querySelector('h1');
    const picture = document.querySelector('h1 + p > picture');

    if (author && publicationDate && main.parentNode === document.body) {
      document.body.classList.add('blog-post');

      const categoryItems = category.split(',');
      const categories = categoryItems.map(cat =>
        `<a href="/blog/category/${toSlug(cat.trim())}">${cat}</a>`).join('');
      const categoryEl = `<li>${categories}</li>`;
      const breadcrumb =
        `<ul>
          <li><a href="/blog/">Blog</a></li>
          ${categoryEl}
        </ul>`;

        const articleHeaderBlock = buildBlock('article-header', [
        [breadcrumb],
        [h1],
        [`<span>${author}</span><span>${publicationDate}</span><span>${updatedDate}</span><span>${readtime} read</span>`],
        [picture],
      ]);
      main.querySelector('main>div').prepend(articleHeaderBlock);
      return (true);
    }
  } catch (e) {
    // something went wrong
  }
  return (false);
}

function buildAuthorContainer(main) {
  try {
    if (window.location.pathname.includes('/author/')) {
      document.body.classList.add('author-page');
      const container = buildBlock('author-container', []);
      main.prepend(container);
      return true;
    }
  } catch (e) {
    // something went wrong
  }
  return false;
}

function buildSidebarCta(main) {
  let sidebarCta = main.querySelector('.sidebar-cta');
  const blockContent = [];
  if (!sidebarCta) {
    blockContent.push(`<h3>See how easy HR can be when everything works together.</h3><p><a href="/demo">Schedule a Demo of BambooHR</a></p>`);
    sidebarCta = buildBlock('sidebar-cta', [blockContent]);
    sidebarCta?.classList?.add('email-form');
  }
  main.querySelector('main>div').append(sidebarCta);

  const observer = new MutationObserver((mutationsList) => {
    const mutationEl = mutationsList.find((mutation) =>
        mutation.type === "attributes" &&
        mutation.attributeName === "data-block-status" &&
        mutation.target.dataset.blockStatus === "loaded"
    );
  
    if (mutationEl) {
      const sidebarCtaHeight = mutationEl.target.offsetHeight;
      const tocWrapper = main.querySelector('.toc-wrapper');
      tocWrapper.style.setProperty('--sidebar-cta-height', `${sidebarCtaHeight + 24}px`);
    }
  });

  observer.observe(sidebarCta, { attributes: true });
}

export default async function decorateTemplate(main) {
  const isBlog = buildArticleHeader(main);
  if (isBlog) {
    buildImageBlocks(main);
    const related = main.querySelector('.related-posts');
    const authorBlock = buildBlock('author', [['']]);
    main.querySelector('main>div').append(authorBlock);

    buildSidebarCta(main);

    if (related) {
      const section = document.createElement('div');
      section.append(related);
      main.append(section);
    }
  }
  const isAuthor = buildAuthorContainer(main);
  if (isAuthor) {
    const h1 = document.querySelector('h1');
    const position = h1.nextElementSibling;
    position.remove();
    const pic = document.querySelector('picture')
      ? document.querySelector('picture').parentElement : null;
    let bio;
    if (pic) {
      bio = pic.nextElementSibling;
      pic.remove();
    }
    const body = bio ? [[h1], [bio]] : [[h1]];
    document.querySelector('.author-container').append(
      buildBlock('author-header', body),
      buildBlock('article-feed', [
        ['author', h1.textContent],
      ]),
    );
  }
}
