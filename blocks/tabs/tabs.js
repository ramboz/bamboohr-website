import { analyticsTrackTabClicks } from '../../scripts/lib-analytics.js';

// mobile vs desktop
const mediaQueryPhone = window.matchMedia('(max-width: 599px)');
const mediaQueryStacked = window.matchMedia('(max-width: 784px)');
const mediaQueryTablet = window.matchMedia('(max-width: 1024px)');

function getIconParent(elem) {
  let e = elem;
  if (e.tagName === 'path') e = e.parentNode;
  if (e.tagName === 'g') e = e.parentNode;
  if (e.tagName === 'svg') e = e.parentNode;

  return e;
}

function isIconElem(elem) {
  if (elem.tagName === 'path' || elem.tagName === 'g' || elem.tagName === 'svg') return true;

  return false;
}

function openTab(e) {
  let { target } = e;
  let parent = target.parentNode;
  const twoup = parent.parentNode;
  if (
    (twoup?.classList.contains('click-not-hover') || twoup?.classList.contains('style-4')) &&
    parent.classList.contains('tabs-title')
  ) {
    target = parent;
    parent = target.parentNode;
  } else if (isIconElem(target)) {
    const iconTarget = getIconParent(target);
    const iconParent = iconTarget?.parentNode;
    const iconTwoup = iconParent?.parentNode;

    if (iconTwoup?.classList.contains('style-4') && iconParent?.classList.contains('tabs-title')) {
      target = iconParent;
      parent = target.parentNode;
    }
  }
  const selected = target.getAttribute('aria-selected') === 'true';

  // accordion nested one level deeper
  if (parent.classList.contains('accordion')) parent = parent.parentNode;

  // no bubbling plz, stopPropagation wasn't working ¯\_(ツ)_/¯
  if (!target.classList.contains('tabs-title')) return;

  if (!selected) {
    // close all open tabs
    const openTitles = parent.querySelectorAll('.tabs-title[aria-selected="true"]');
    const openContent = parent.querySelectorAll('.tabs-content[aria-hidden="false"]');
    const openAccordions = parent.querySelectorAll('.accordion[aria-selected="true"]');
    openTitles.forEach((tab) => tab.setAttribute('aria-selected', false));
    openContent.forEach((tab) => tab.setAttribute('aria-hidden', true));
    openAccordions.forEach((accordion) => accordion.setAttribute('aria-selected', false));

    // open clicked tab
    target.setAttribute('aria-selected', true);
    if (target.parentNode.classList.contains('accordion')) {
      target.parentNode.setAttribute('aria-selected', true);
    }
    const content = parent.querySelector(`[aria-labelledby="${target.id}"]`);
    content.setAttribute('aria-hidden', false);

    /* Adobe tab name click events tracking */
	  analyticsTrackTabClicks(target.innerText);

  } else if (
    (mediaQueryPhone.matches &&
      !parent.classList.contains('style-1') &&
      !parent.classList.contains('style-2')) ||
    parent.classList.contains('style-3') ||
    (mediaQueryStacked.matches && parent.classList.contains('style-4'))
  ) {
    target.setAttribute('aria-selected', false);
    if (target.parentNode.classList.contains('accordion')) {
      target.parentNode.setAttribute('aria-selected', false);
    }
    const content = parent.querySelector(`[aria-labelledby="${target.id}"]`);
    content.setAttribute('aria-hidden', true);
  }
}

function scrollTab(title) {
  title.scrollIntoView({ block: 'nearest' });
}

function getVisibleTab(event) {
  const { target } = event;
  const dots = target.querySelectorAll('.tabs-dots-dot');
  const tabTitles = target.querySelectorAll('.tabs-title');
  const leftPosition = target.scrollLeft;
  let leftPadding = 0;

  // skip larger screens that don't do the carousel
  if (!mediaQueryTablet.matches) return;

  tabTitles.forEach((tabTitle, key) => {
    const offset = tabTitle.offsetLeft;

    // set first offset (extra padding?)
    if (key === 0) leftPadding = offset;

    if (offset - leftPadding === leftPosition) {
      // set active dot
      dots[key].setAttribute('aria-selected', true);

      // trigger default functionality
      openTab({ target: tabTitle });
    } else {
      // remove active classes
      dots[key].setAttribute('aria-selected', false);
    }
  });
}

function buildDotNav(block) {
  // count tabs
  const count = block.querySelectorAll('.tabs-title').length;
  const dots = document.createElement('ol');
  dots.classList.add('tabs-dots');

  // make dots
  [...new Array(count).fill('').keys()].forEach(() => {
    const dot = document.createElement('li');
    dot.classList.add('tabs-dots-dot');
    dot.setAttribute('aria-selected', false);
    dots.append(dot);
  });

  // add dynamic grid number, +1 for dots
  block.style.gridTemplateRows = `repeat(${count + 1}, min-content)`;

  // attach click listener
  [...dots.children].forEach((dot, key) => {
    dot.addEventListener('click', (event) => {
      const { target } = event;
      const title = [...block.querySelectorAll('.tabs-title')][key];

      // skip selected
      if (target.getAttribute('aria-selected') === 'true') return;

      // scroll to title
      scrollTab(title);
    });
  });

  // add dots
  block.append(dots);

  // attach listener
  block.addEventListener('scroll', getVisibleTab);
}

export default function decorate(block) {
  [...block.children].forEach((tab) => {
    // fixup buttons
    const isButtonLinks = block.classList.contains('button-style-link');
    if (isButtonLinks) {
      const buttons = tab.querySelectorAll('a.button');
      buttons.forEach((button) => {
        button.classList.add('link');
      });
    }

    // setup tab title
    const title = tab.querySelector('h2');
    const anchor = title.querySelector('a');
    const open = title.querySelector('strong') !== null; // bold title indicates auto-open tab
    const icon = tab.querySelector('span.icon');
    let titleElement;
    const content = tab.querySelector('div');

    // need titles in same element
    if (block.classList.contains('style-2')) {
      const subtitle = tab.querySelector('h3');

      if (anchor) {
        titleElement = anchor;
      } else {
        titleElement = document.createElement('div');
      }

      titleElement.setAttribute('id', title.getAttribute('id'));
      title.removeAttribute('id');
      title.innerHTML = title.textContent;
      title.classList.add('tabs-title-title');
      titleElement.textContent = '';
      titleElement.append(title);

      if (block.classList.contains('active-subtitle')) {
        const activeSubtitleContent = document.createElement('div');
        activeSubtitleContent.classList = 'tabs-title-active-subtitle-content';
        titleElement.append(activeSubtitleContent);
        [...content.children].forEach((child) => {
          const pic = child.querySelector('picture');

          if (!pic && child.tagName !== 'H2') {
            activeSubtitleContent.append(child);
          }
        });
      } else if (subtitle) {
        subtitle.classList.add('tabs-title-subtitle');
        titleElement.append(subtitle);
      }

      if (block.classList.contains('click-not-hover')) {
        titleElement.addEventListener('click', openTab);
      } else titleElement.addEventListener('mouseover', openTab);
    } else if (icon && block.classList.contains('style-4')) {
      titleElement = document.createElement('div');

      titleElement.setAttribute('id', title.getAttribute('id'));
      title.removeAttribute('id');
      titleElement.append(icon, title);
      titleElement.addEventListener('click', openTab);
    } else {
      titleElement = title;
      titleElement.innerHTML = title.textContent;
      titleElement.addEventListener('click', openTab);
    }

    titleElement.classList.add('tabs-title');
    titleElement.setAttribute('aria-selected', open);

    // setup tab content
    content.classList.add('tabs-content');
    content.setAttribute('aria-labelledby', titleElement.id);
    content.setAttribute('aria-hidden', !open);

    if (block.classList.contains('style-4')) {
      const containerDiv = document.createElement('div');
      containerDiv.classList = 'tabs-flex-content';
      content.append(containerDiv);
      const textDiv = document.createElement('div');
      textDiv.classList = 'column5 tabs-non-img-col';
      const picDiv = document.createElement('div');
      picDiv.classList = 'column7 tabs-img-col';
      containerDiv.append(textDiv, picDiv);

      [...content.children].forEach((child) => {
        const pic = child.querySelector('picture');

        if (pic) {
          if (pic.parentElement.tagName === 'P') pic.parentElement.remove();
          picDiv.append(pic);
        } else if (child.tagName !== 'H2') {
          textDiv.append(child);
        }
      });
    }

    if (block.classList.contains('style-3')) {
      // accordions need content and titles in same element
      const accordion = document.createElement('div');

      accordion.classList.add('accordion');
      accordion.append(titleElement, content);

      block.append(accordion);
    } else {
      // move tab and content to block root
      block.append(titleElement, content);
    }

    tab.remove();
  });

  // add dots
  if (block.classList.contains('style-1') || block.classList.contains('style-2')) {
    buildDotNav(block);
  }

  // if no tabs are open, open first tab by default
  if (!block.querySelector('.tabs-title[aria-selected="true"]')) {
    block.querySelector('.tabs-title').setAttribute('aria-selected', true);
    block.querySelector('.tabs-title + .tabs-content').setAttribute('aria-hidden', false);
    block.querySelector('.tabs-dots-dot')?.setAttribute('aria-selected', true);
    block.querySelector('.accordion')?.setAttribute('aria-selected', true);
  }
}
