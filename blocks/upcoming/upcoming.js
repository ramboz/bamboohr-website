import {
  createOptimizedPicture,
  readBlockConfig,
  readIndex,
  toCategory,
} from '../../scripts/scripts.js';
import { createAppCard, sortOptions } from '../app-cards/app-cards.js';
import { createArticleCard, loadWistiaBlock, isUpcomingEvent } from '../listing/listing.js';

function formatTitle(article) {
  let title = article.title.split(' | ')[0];
  if (article.path.startsWith('/live-demo-webinars/')) {
    const newTitle = title.split(': ')[1];
    if (newTitle) title = newTitle.trim();
  }

  return title;
}

export function createDateCard(article, classPrefix, hideCategory = false, eager = false, cardLink = {}) {
  const title = formatTitle(article);
  const card = document.createElement('div');
  let articleCategory = [article.category, article.topic, article.planType, article.productArea, article.contentType, article.brandedContent];
  articleCategory = articleCategory.filter((str) => (str !== '' && str !== undefined)).join(' | ');
  const articleFormat = article?.format || article?.mediaType || '';
  card.className = `${classPrefix}-card`;
  card.setAttribute('am-region', `${articleCategory} . ${articleFormat}`.toUpperCase());
  let articlePicture = '';
  let wistiaBlock = '';
  if (article.wistiaVideoId) {
    wistiaBlock = `<div class="wistia block hide-play">
        <a href="https://bamboohr.wistia.com/medias/${article.wistiaVideoId}"></a>
      </div>`;
  } else {
    const image = article.cardImage || article.image;
    const pictureString = createOptimizedPicture(
      image,
      article.imageAlt || article.title,
      eager,
      [{ width: 750 }],
    ).outerHTML;

    articlePicture = `<div class="${classPrefix}-card-picture">
        <a href="${article.path}">${pictureString}</a>
      </div>`;
  }
  const articleImage = articlePicture || wistiaBlock;
  const articleLinkText = cardLink.text || article.linkText || 'Register for this event';
  const category = toCategory(articleCategory);
  const articlePath = cardLink.link || article.path || '';
  const articleDate = article.eventDateAndTime ? `<h4>${article.eventDateAndTime}</h4>` : '';
  const articlePresenter = article?.presenter || article?.customerName ? `<h5>${article?.presenter || article?.customerName || ''}</h5>` : '';
  const articleLink = articlePath ? `<p><a href="${articlePath}">${articleLinkText}</a></p>` : '';
  const articleCategorySpan = !article.readTime && articleCategory ? `<span class="${classPrefix}-card-category">${articleCategory}</span>` : '';
  const articleCardHeader = !hideCategory ? `<div class="${classPrefix}-card-header category-color-${category}">
      ${articleCategorySpan}
    </div>` : '';

  card.innerHTML = `
    ${articleImage}
    <div class="${classPrefix}-card-body" am-region="${title}">
    ${articleDate}
    ${articlePresenter}
    <h3>${title}</h3>
    <p class="${classPrefix}-card-detail">${article.description}</p>
    ${articleCardHeader}
    ${articleLink}
    </div>`;
  return (card);
}

function checkForMatch(row, key, defaultReturn, liveDemoWebinarsCnt) {
  if (key === 'futureOnly') {
    return isUpcomingEvent(row.eventDate);
  } else if (key === 'liveDemoWebinarsLimit3' && row.path.startsWith('/live-demo-webinars/')) {
    return liveDemoWebinarsCnt < 3;
  }

  if (row[key]) {
    if (key !== 'eventDateAndTime') return true;
    if (!row[key].toLowerCase().includes('demand')) return true;
  }
  return defaultReturn;
}

async function filterResults(indexConfig = {}) {
  /* load index */
  const collection = indexConfig.indexName;
  await readIndex(indexConfig.indexPath, collection);
  
  const listings = window.pageIndex[collection];

  if (!indexConfig.filterOn) return listings.data;

  const keys = indexConfig.filterOn.split(',').map((t) => t.trim());
  const isWebinars = indexConfig.indexPath.startsWith('/webinars/query-index');

  /* filter */
  let liveDemoWebinarsCnt = 0;
  const results = listings.data.filter((row) => {
    let matched = false;
    const matchedAll = keys.every((key) => {
      matched = checkForMatch(row, key, matched, liveDemoWebinarsCnt);
      return matched;
    });

    if (isWebinars && matchedAll && row.path.startsWith('/live-demo-webinars/')) {
      liveDemoWebinarsCnt += 1;
    }

    return matchedAll;
  });
  
  return results;
}

export default async function decorate(block, blockName) {
  const indexConfig = {indexPath: '', indexName: '', cardStyle: '', filterOn: '', sortBy: ''};
  const blockConfig = readBlockConfig(block);

  indexConfig.indexPath = blockConfig['index-path'];
  indexConfig.indexName = blockConfig['index-name'];
  indexConfig.cardStyle = blockConfig['card-style'];
  indexConfig.customLinkText = blockConfig['custom-link-text'];
  indexConfig.filterOn = blockConfig.filter;
  indexConfig.sortBy = blockConfig['sort-by'];
  indexConfig.hideCategory = blockConfig['hide-category'] || false;
  indexConfig.limit = +blockConfig.limit || 0;
  
  let cardLink = {};
  if (blockConfig['card-link'] && blockConfig['card-link-text']) {
    cardLink = {link: blockConfig['card-link'], text: blockConfig['card-link-text']};
  } else if (indexConfig.customLinkText) {
    cardLink = {text: indexConfig.customLinkText};
  }

  block.innerHTML = '<ul class="upcoming-results"></ul>';

  const resultsElement = block.querySelector('.upcoming-results');

  const displayResults = async (results) => {
    resultsElement.innerHTML = '';
    const max = indexConfig.limit ? indexConfig.limit : results.length;
    for (let i = 0; i < max; i += 1) {
      const product = results[i];

      if (indexConfig.cardStyle === 'date') {
        const dateCard = createDateCard(product, 'upcoming-article',
          indexConfig.hideCategory, false, cardLink);
        resultsElement.append(dateCard);
        loadWistiaBlock(product, dateCard);
      } else if (indexConfig.cardStyle === 'article') {
        const articleCard = createArticleCard(product, 'upcoming-article',
          indexConfig.customLinkText, false, false, indexConfig.hideCategory);
        resultsElement.append(articleCard);
        loadWistiaBlock(product, articleCard);
      } else resultsElement.append(createAppCard(product, blockName));
    }
  };

  const runSearch = async () => {
    const results = await filterResults(indexConfig);
    const { sortBy } = indexConfig;

    if (results.length === 0) {
      block.innerHTML = '<h2 class="empty-upcoming">More webinars coming soon.</h2>';
      return;
    }

    if (sortBy && sortOptions(sortBy)) results.sort(sortOptions(sortBy));
    displayResults(results, null);
  };

  runSearch();
}
