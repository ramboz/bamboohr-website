import { formatDate, toCategory, toClassName, getMetadata } from '../../scripts/scripts.js';
import { createSharing } from '../page-header/page-header.js';

function applyClasses(styles, elements, prefix) {
  [...elements].forEach((row, i) => {
    row.classList.add(`${prefix}-${styles[i] || 'extra'}`);
  });
}

function createProgress() {
  const progress = document.createElement('progress');
  progress.setAttribute('value', 0);
  progress.setAttribute('max', 100);
  return progress;
}

function createBreadcrumbListSchemaMarkup() {
  let positionCounter = 1;
  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [],
  };
  document.querySelectorAll('.article-header-breadcrumb div ul li').forEach((item) => {
    const crumbItem = item.querySelector('a').textContent.trim();
    const hrefVal = item.querySelector('a').href;
    if (crumbItem && hrefVal) {
      breadcrumbListSchema.itemListElement.push({
        '@type': 'ListItem',
        // eslint-disable-next-line no-plusplus
        position: positionCounter++,
        name: crumbItem,
        item: hrefVal,
      });
    }
  });
  const $breadcrumbListSchema = document.createElement('script');
  $breadcrumbListSchema.innerHTML = JSON.stringify(breadcrumbListSchema, null, 2);
  $breadcrumbListSchema.setAttribute('type', 'application/ld+json');
  const $head = document.head;
  $head.append($breadcrumbListSchema);
}

export default async function decorateArticleHeader($block, blockName) {
  const testVariation = getMetadata('test-variation') ? toClassName(getMetadata('test-variation')) : '';
  if (testVariation) {
    applyClasses(['breadcrumb', 'title', 'author-pub', 'image'], $block.children, blockName);
    createBreadcrumbListSchemaMarkup();
  } else {
    applyClasses(['image', 'eyebrow', 'title', 'author-pub'], $block.children, blockName);
  }
  applyClasses(['category', 'read-time'], $block.querySelector('.article-header-eyebrow').firstChild.children, blockName);
  applyClasses(['author', 'publication-date', 'updated-date'], $block.querySelector('.article-header-author-pub').firstChild.children, blockName);

  // link author
  const $author = $block.querySelector(`.${blockName}-author`);
  const author = $author.textContent;
  const a = document.createElement('a');
  a.href = `/blog/author/${toClassName(author)}`;
  a.textContent = author;
  $author.textContent = '';
  $author.append(a);

  const category = $block.querySelector('.article-header-category');
  category.innerHTML = `<a href="/blog/category/${toCategory(category.textContent)}">${category.textContent}</a>`;

  // format dates
  const $pubdate = $block.querySelector(`.${blockName}-publication-date`);
  $pubdate.textContent = formatDate($pubdate.textContent);

  const $update = $block.querySelector(`.${blockName}-updated-date`);
  if ($update.textContent) $update.textContent = formatDate($update.textContent);

  // sharing + progress
  $block.append(createSharing('article-header-share'));
  const progress = createProgress();
  $block.append(progress);

  document.addEventListener('scroll', () => {
    progress.setAttribute('value', window.scrollY);
    progress.setAttribute('max', document.querySelector('main').clientHeight - window.innerHeight);
  });
}
