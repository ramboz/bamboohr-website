import {
  createOptimizedPicture,
  readBlockConfig,
  readIndex,
} from '../../scripts/scripts.js';
import { createAppCard, sortOptions } from '../app-cards/app-cards.js';
import { createArticleCard } from '../listing/listing.js';

function createDateCard(article, classPrefix, eager = false) {
  const title = article.title.split(' - ')[0];
  const card = document.createElement('div');
  const articleCategory = article.category || article.topicPrimary || article.topicSecondary
    || article.contentType || article.brandedContent || '';
  const articleCategoryElement = articleCategory ? `<p>${articleCategory}</p>` : '';
  const articleFormat = article?.format || article?.mediaType || '';
  card.className = `${classPrefix}-card`;
  card.setAttribute('am-region', `${articleCategory} . ${articleFormat}`.toUpperCase());
  const image = article.cardImage || article.image;
  const pictureString = createOptimizedPicture(
    image,
    article.imageAlt || article.title,
    eager,
    [{ width: 750 }],
  ).outerHTML;
  card.innerHTML = `
    <div class="${classPrefix}-card-picture"><a href="${article.path}">${pictureString}</a></div>
    <div class="${classPrefix}-card-body" am-region="${title}">
    <h4>${article.eventDateAndTime}</h4>
    <h5>${article?.presenter || ''}</h5>
    <h3>${title}</h3>
    <p>${article.description}</p>
    ${articleCategoryElement}
    <p><a href="${article.path}">Register for this event</a></p>
    </div>`;
  return (card);
}

async function filterResults(indexConfig = {}) {
  /* load index */
  const collection = indexConfig.indexName;
  await readIndex(indexConfig.indexPath, collection);
  
  const listings = window.pageIndex[collection];

  const keys = indexConfig.filterOn.split(',').map((t) => t.trim());

  /* filter */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const results = listings.data.filter((row) => {
    const filterMatches = {};
    let matched = false;
    const matchedAll = keys.every((key) => {
      if (row[key]) {
        if (key === 'eventDateAndTime') {
          if (!row[key].toLowerCase().includes('demand')) matched = true;
        } else matched = true;
      } else if (key === 'futureOnly') {
        const date = new Date(row.eventDate);
        if (date >= today) matched = true;
        else matched = false;
      }
      filterMatches[key] = matched;
      return matched;
    });

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
  indexConfig.filterOn = blockConfig.filter;
  indexConfig.sortBy = blockConfig['sort-by'];

  block.innerHTML = '<ul class="upcoming-results"></ul>';

  const resultsElement = block.querySelector('.upcoming-results');

  const displayResults = async (results) => {
    resultsElement.innerHTML = '';
    results.forEach((product) => {
      if (indexConfig.cardStyle === 'date') {
        resultsElement.append(createDateCard(product, 'upcoming-article'));
      } else if (indexConfig.cardStyle === 'article') {
        resultsElement.append(createArticleCard(product, 'upcoming-article'));
      } else resultsElement.append(createAppCard(product, blockName));
    });
  };

  const runSearch = async () => {
    const results = await filterResults(indexConfig);
    const { sortBy } = indexConfig;

    if (sortBy && sortOptions(sortBy)) results.sort(sortOptions(sortBy));
    displayResults(results, null);
  };

  runSearch();
}
