import { readBlockConfig, getMetadata, toClassName } from '../../scripts/scripts.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const maxLevel = config.levels || 1;
  const showSubtree = config['show-subtree'] ? config['show-subtree'].toLowerCase().trim() : '';

  const title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = 'Table of Contents';
  block.textContent = '';
  block.append(title);

  let tocItems = document.querySelectorAll(
    // eslint-disable-next-line comma-dangle
    '.default-content-wrapper h2, .default-content-wrapper h3, .default-content-wrapper h4, .default-content-wrapper h5, .title-wrapper h2, .title-wrapper h3, .title-wrapper h4, .title-wrapper h5, .columns-wrapper .add-to-toc h2, .columns-wrapper .add-to-toc h3, .columns-wrapper .add-to-toc h4, .columns-wrapper .add-to-toc h5'
  );

  let olStack = [document.createElement('ol')];
  const testVariation = getMetadata('test-variation') ? toClassName(getMetadata('test-variation')) : '';

  if (testVariation === 'blog-redesign') {
    tocItems = document.querySelectorAll('.default-content-wrapper h2, .title-wrapper h2, .columns-wrapper .add-to-toc h2');
    olStack = [document.createElement('ul')];
    const tocSiblings = document.querySelector('.toc-container').children?.length;
    const tocWrapper = document.querySelector('.toc-wrapper');
    tocWrapper.style.gridRow = `1 / span ${tocSiblings - 1}`;
  }
  let lastChapter = '';
  tocItems.forEach((h) => {
    const hLevel = parseInt(h.tagName.substring(1), 10) - 1;
    const show = showSubtree ? hLevel < 2 || lastChapter === showSubtree : true;
    if (hLevel <= maxLevel && show) {
      while (hLevel > olStack.length) {
        const newOl = document.createElement('ol');
        olStack[olStack.length - 1].append(newOl);
        olStack.push(newOl);
      }
      while (hLevel < olStack.length) olStack.pop();
      const ol = olStack[hLevel - 1];
      const li = document.createElement('li');
      const numbered = /^\d+\. /;
      const heading = h.textContent.match(numbered)
        ? h.textContent.substring(h.textContent.indexOf(' '))
        : h.textContent;
      li.innerHTML = `<a href="#${h.id}">${heading}</a>`;
      ol.append(li);
      if (hLevel === 1) lastChapter = h.textContent.toLowerCase().trim();
    }
  });
  block.append(olStack[0]);

  if (testVariation === 'blog-redesign') {
    title.setAttribute('aria-selected', false);
    const tocContent = block.querySelector('ul');
    tocContent.setAttribute('aria-hidden', true);
    title.addEventListener('click', ()=>{
      const isSelected = title.getAttribute('aria-selected') === 'true';
      title.setAttribute('aria-selected', !isSelected);
      tocContent.setAttribute('aria-hidden', isSelected);
    });
  }
}
