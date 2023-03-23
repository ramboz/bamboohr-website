import {
    lookupPages,
    readBlockConfig,
    createOptimizedPicture,
  } from '../../scripts/scripts.js';

import { sortOptions } from '../app-cards/app-cards.js';

export function createResourceCard(app, prefix) {
  if (app.image !== '') {
    const card = document.createElement('div');
    card.className = `${prefix}-card`;
    const cardLinkText = app.formSubmitText ? app.formSubmitText : 'Free Download';
    const picture = createOptimizedPicture(app.image, app.title, false, [{ width: 750 }]).outerHTML;
    card.innerHTML = `<a href="${app.path}"><div class="${prefix}-card-image">${picture}</div></a><div class="${prefix}-card-copy-container"><p>${app.description}</p><a href="${app.path}" class="${prefix}-card-link">${cardLinkText}</a></div>`;
    return (card);
  //  eslint-disable-next-line
  } else {
    return '';
  }
}
  
export async function decorateResourceFeed(config, block) {

  await lookupPages([], 'resources');
  const index = window.pageIndex.resources;
  const sortBy = 'category';
  if (sortBy && sortOptions(sortBy)) index.data.sort(sortOptions(sortBy));
  const resourceLibraryContainer = document.createElement('div');
  resourceLibraryContainer.className = 'resource-library-container';
  block.append(resourceLibraryContainer);

  index.data.forEach((resourceCard) => {
    if (resourceCard.title !== '') {
      const { category } = resourceCard;
      resourceCard.groupCategory = category.charAt(0).toUpperCase() + category.slice(1);
    }
  });

  //  eslint-disable-next-line
  const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {(result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  };

  const resourcesGroupedByCategories = groupBy(index.data, 'groupCategory');
  
  const resourceGroups = Object.entries(resourcesGroupedByCategories);

  resourceGroups.forEach((resourceGroup) => {
    if (resourceGroup[0] !== 'undefined') {
      const resourceGroupContainer = document.createElement('div');
      resourceGroupContainer.className = 'resource-group-container';
      resourceLibraryContainer.append(resourceGroupContainer);
      const resourceGroupCategory = document.createElement('div');
      resourceGroupCategory.className = 'resource-group-title typ-title1';
      resourceGroupContainer.append(resourceGroupCategory);
      const resourceGroupTitle = resourceGroup[0];
      resourceGroupCategory.textContent = resourceGroupTitle;
      //  eslint-disable-next-line
      resourceGroupCategory.id = resourceGroup[0];

      resourceGroup[1].forEach((resourceGroupItem) => {
        if (resourceGroupItem.image !== '') {
          const cardContainer = document.createElement('ul');
          cardContainer.append(createResourceCard(resourceGroupItem, 'resource'));
          resourceGroupContainer.append(cardContainer);
        }
      });
    }
  });
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';
  await decorateResourceFeed(config, block);
}
  