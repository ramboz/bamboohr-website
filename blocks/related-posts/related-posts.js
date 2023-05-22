import { getMetadata, lookupPages, toCamelCase, } from '../../scripts/scripts.js';
import { filterArticles } from '../article-feed/article-feed.js';
import { createBlogCard } from '../featured-articles/featured-articles.js';
import { createAppCard, sortOptions } from '../app-cards/app-cards.js';
import { createArticleCard, loadWistiaBlock } from '../listing/listing.js';
import { createDateCard } from '../upcoming/upcoming.js';

function addNoBackgroundClass() {
  const relatedPostsWrapper = document.querySelectorAll('.related-posts-wrapper');
  relatedPostsWrapper.forEach((relatedPost) => {
    if (relatedPost.querySelector('.no-background')) {
      relatedPost.classList.add('no-background');
    }
  });
}

function filterAndSort(dataArray, criteria, uniqueCards) {
  if (!dataArray) return null;

  let filteredResults = dataArray;
  if (criteria.filters) {
    // Filter prep
    const filterKeys = [];
    const filterValues = {};
    criteria.filters.forEach(f => {
      const filterParts = f.split(':');
      const key = filterParts[0].trim();
      filterKeys.push(key);
      if (filterValues[key] === undefined) filterValues[key] = [];
      filterValues[key].push(filterParts[1].trim().toLowerCase());
    });

    // Do filter
    filteredResults = dataArray.filter((row) => {
      // if (isUpcomingEvent(row.eventDate)) return false;
      const matchedAll = filterKeys.every((key) => {
        let matched = false;
        if (row[key]) {
          const rowValues = row[key].split(',').map((t) => t.trim().toLowerCase());
          matched = filterValues[key].some((t) => rowValues.includes(t));
        }
        return matched;
      });

      return matchedAll;
    });
  }
  
  if (criteria.sortBy) {
    const { sortBy } = criteria;
    // Do sort
    if (sortOptions(sortBy)) filteredResults.sort(sortOptions(sortBy));
  }

  // Ensure return value is unique
  let returnVal = null;
  filteredResults.some((r, index) => {
    if (uniqueCards.includes(r.path)) return false;
    // Safety net: only check the first 10.
    if (index > 10) return true;

    returnVal = r;
    return true;
  });

  return returnVal;
}

async function getCardPath(colConfig, uniqueCards) {
  const promises = [];
  colConfig.forEach(async (col) => {
    const promise = new Promise((resolve) => {
      if (col.path) {
        const pathnames = [col.path];
        lookupPages(pathnames, col.contentType)
          .then((articles) => {
            [ col.article ] = articles;
            if (col.article) uniqueCards.push(col.article.path);
            // console.log(`getCardPath processed path: path = ${col.article.path}, index = ${index}`);
            resolve();
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(`Can't find card for ${col.path}`, err);
            resolve();
          });
      } else {
        lookupPages([], col.contentType)
          .then(() => {
            const article = filterAndSort(window.pageIndex[col.contentType].data, col, uniqueCards);
            col.article = article;
            if (col.article) uniqueCards.push(col.article.path);
            // console.log(`getCardPath processed content type: path = ${col.article.path}, index = ${index}`);
            resolve();
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(`Can't find card for content type = ${col.contentType}`, err);
            resolve();
          });
      }
    });

    promises.push(promise);
  });

  return Promise.all(promises);
}

function updateImgHeights(target) {
  let block = target;
  if (!target.classList.contains('related-posts') && 
      target.classList.contains('related-posts-card-picture')) {
    block = target.parentElement.parentElement;
  } else if (target.tagName === 'IMG') {
    let p = target.parentElement;
    while (!p.classList?.contains('related-posts')) p = p.parentElement;
    block = p;
  }
  const relatedPostsCards = block.querySelectorAll('.related-posts-card');
  const relatedPostsCardImgs = block.querySelectorAll('.related-posts-card img');

  if (relatedPostsCards.length !== relatedPostsCardImgs.length) return;

  const isInitialized = [...relatedPostsCardImgs].every(i => i.clientHeight);
  if (!isInitialized) return;
  
  let modelImg = null;
  let tallestImg = null;
  let maxHeight = 0;
  // Find model/tallest
  relatedPostsCardImgs.forEach((img) => {
    if (img.dataset.modelImg) modelImg = img;
    if (img.clientHeight > maxHeight) {
      maxHeight = img.clientHeight;
      tallestImg = img;
    }
  });

  if (modelImg) maxHeight = modelImg.clientHeight;
  if (!modelImg && tallestImg) tallestImg.dataset.modelImg = true;

  if (!maxHeight) return;
  
  // Set all image heights to match the model/tallest.
  relatedPostsCardImgs.forEach((img) => {
    if (!img.dataset.modelImg) img.style.height = `${maxHeight}px`;
  });
}

async function createCards(block, colConfig) {
  const uniqueCards = [];
  await getCardPath(colConfig, uniqueCards);
  
  colConfig.forEach(col => {
    if (!col.article) return;

    let card = null;
    let loadWistia = false;
    switch (col.cardStyle) {
      case 'app':
        card = createAppCard(col.article, 'related-posts');
        break;
      case 'article':
        card = createArticleCard(col.article, 'related-posts', col.customLinkText, false, false, true);
        loadWistia = true;
        break;
      case 'date':
        card = createDateCard(col.article, 'related-posts', true, false, {text: col.customLinkText});
        loadWistia = true;
        break;
      case 'blog':
        card = createBlogCard(col.article, 'related-posts', col.customLinkText);
        break;

      case 'simple':
      default:
        card = createArticleCard(col.article, 'related-posts', col.customLinkText, false, true);
        loadWistia = true;
        break;
    }

    block.append(card);
    if (loadWistia) loadWistiaBlock(col.article, card);
  });

  // Adds .no-background class to related posts block after all cards are created
  addNoBackgroundClass();

  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(e => {
      updateImgHeights(e.target);
    });
  });

  const cardObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      window.setTimeout(() => {
        // This assumes every column has an image/wistia
        const relatedPostsCardImgs = block.querySelectorAll('.related-posts-card img');
        if (relatedPostsCardImgs.length === colConfig.length) {
          relatedPostsCardImgs.forEach(i => resizeObserver.observe(i));
          cardObserver.disconnect();
        }
      }, 500);
    }
  });
  const relatedPostsCards = block.querySelectorAll('.related-posts-card');
  relatedPostsCards.forEach(c => cardObserver.observe(c));

  window.setTimeout(() => {
    block.querySelectorAll('.related-posts-card-body-simple h3').forEach(h3 => {
      if (h3.scrollWidth > h3.clientWidth) h3.title = h3.innerText;
    });

    block.querySelectorAll('.related-posts-card-category').forEach(cat => {
      if (cat.parentElement.scrollWidth > cat.parentElement.clientWidth) cat.title = cat.innerText;
    });
  }, 1000);
}

function getContentType(pathname) {
  const contentTypes = [
    {path: '/blog/', contentType: 'blog'},
    {path: '/integrations/', contentType: 'integrations'},
    {path: '/resources/hr-glossary/', contentType: 'hrGlossary'},
    {path: '/resources/events/hr-virtual/2022/', contentType: 'hrvs'},
    {path: '/resources/', contentType: 'resources'},
    {path: '/speakers/', contentType: 'speakers'},
    {path: '/product-updates/', contentType: 'productUpdates'},
    {path: '/webinars/', contentType: 'webinars'},
  ];

  let contentType = null;

  contentTypes.some(c => {
    if (pathname.startsWith(c.path)) {
      contentType = c.contentType;
      return true;
    }

    return false;
  });

  return contentType;
}

function getDefaultCardStyle(contentType, mixed) {
  if (mixed) return 'simple';

  let defCardStyle = null;
  switch(contentType) {
    case 'integrations':
      defCardStyle = 'app';
      break;
    case 'productUpdates':
      defCardStyle = 'article';
      break;
    case 'webinars':
      defCardStyle = 'date';
      break;

    case 'blog':
      default:
      defCardStyle = 'blog';
      break;
  }

  return defCardStyle;
}

function buildColConfig(block) {
  const configRows = [...block.children];
  // Parse the column config info (content type determines index to read):
  // content type + path or
  // content type + filters, sort by and card style
  const contentTypes = [];
  const colConfig = configRows.map(configRow => {
    const link = configRow.querySelector('a');

    if (link) {
      let { pathname } = new URL(link.href);
      if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
      const contentType = getContentType(pathname);
      if (!contentTypes.includes(contentType)) contentTypes.push(contentType);
      return {contentType, path: pathname, cardStyle: null, article: null };
    } 
    
    const config = {
      contentType: null,
      filters: [],
      sortBy: null,
      cardStyle: null,
      article: null,
    };
    const configParts = configRow.innerText.split(',');
    configParts.forEach(p => {
      const propValPairs = p.split(':');
      const prop = propValPairs[0].trim().toLowerCase();
      if (prop === 'content type' || prop === 'sort by' || prop === 'card style'
          || prop === 'custom link text') {
        const val = propValPairs[1].trim();
        config[toCamelCase(prop)] = val;
      } else config.filters.push(p.trim());
    });

    if (!contentTypes.includes(config.contentType)) contentTypes.push(config.contentType);

    return config;
  });

  const mixed = contentTypes.length > 1;
  colConfig.forEach(c => {
    if (!c.cardStyle) c.cardStyle = getDefaultCardStyle(c.contentType, mixed);
  });

  return colConfig;
}

export default async function decorate(block) {
  const isFlexibleContent = block.classList.contains('flexible-content');

  if (isFlexibleContent) {
    const colConfig = buildColConfig(block);
    block.textContent = '';
    createCards(block, colConfig);

    return;
  }
  
  const pathnames = [...block.querySelectorAll('a')].map((a) => {
    let { pathname } = new URL(a.href);
    if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return pathname;
  });
  block.textContent = '';
  let articles = await lookupPages(pathnames, 'blog');
  if (!articles.length) {
    const feed = { data: [], complete: false, cursor: 0 };
    await filterArticles({ category: getMetadata('category') }, feed, 4, 0);
    articles = feed.data.slice(0, 4);
  }
  articles.forEach((article) => {
    block.append(createBlogCard(article, 'related-posts'));
  });

  // Adds .no-background class to related posts block
  addNoBackgroundClass();
}
