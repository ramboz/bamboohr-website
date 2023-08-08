import { readBlockConfig } from '../../scripts/scripts.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const maxLevel = config.levels || 1;
  const showSubtree = config['show-subtree'] ? config['show-subtree'].toLowerCase().trim() : '';

  const title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = 'Table of Contents';
  block.textContent = '';
  block.append(title);

  const tocItems = document.querySelectorAll('.default-content-wrapper h2, .title-wrapper h2, .columns-wrapper .add-to-toc h2');

  const ulStack = [document.createElement('ul')];

  const tocSiblings = document.querySelector('.toc-container').children?.length;
  const tocWrapper = document.querySelector('.toc-wrapper');
  tocWrapper.style.gridRow = `1 / span ${tocSiblings - 1}`;

  let lastChapter = '';
  tocItems.forEach((h) => {
    const hLevel = parseInt(h.tagName.substring(1), 10) - 1;
    const show = showSubtree ? hLevel < 2 || lastChapter === showSubtree : true;
    if (hLevel <= maxLevel && show) {
      while (hLevel > ulStack.length) {
        const newUl = document.createElement('ul');
        ulStack[ulStack.length - 1].append(newUl);
        ulStack.push(newUl);
      }
      while (hLevel < ulStack.length) ulStack.pop();
      const ul = ulStack[hLevel - 1];
      const li = document.createElement('li');
      const numbered = /^\d+\. /;
      const heading = h.textContent.match(numbered)
        ? h.textContent.substring(h.textContent.indexOf(' '))
        : h.textContent;
      li.innerHTML = `<a href="#${h.id}">${heading}</a>`;
      ul.append(li);
      if (hLevel === 1) lastChapter = h.textContent.toLowerCase().trim();
    }
  });
  block.append(ulStack[0]);

  title.setAttribute('aria-selected', false);
  const tocContent = block.querySelector('ul');
  tocContent.setAttribute('aria-hidden', true);
  title.addEventListener('click', ()=>{
    const isSelected = title.getAttribute('aria-selected') === 'true';
    title.setAttribute('aria-selected', !isSelected);
    tocContent.setAttribute('aria-hidden', isSelected);
  });
}
