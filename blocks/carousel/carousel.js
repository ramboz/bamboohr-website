const mediaQueryLarge = window.matchMedia('(min-width: 1800px)');
const mediaQueryMedium = window.matchMedia('(min-width: 1098px)');
const mediaQuerySmall = window.matchMedia('(max-width: 707px)');

function calculateScrollbarWidth() {
  document.documentElement.style.setProperty(
    '--scrollbar-width',
    `${window.innerWidth - document.documentElement.clientWidth}px`
  );
}

function getStyle5CardMinWidth() {
  if (mediaQuerySmall.matches) return 260;
  if (mediaQueryLarge.matches) return 360;
  if (mediaQueryMedium.matches) return 300;

  return 280;
}

function getStyle5CardCount(block) {
  const cardMinWidth = getStyle5CardMinWidth();
  const cardStyle = block.firstElementChild.currentStyle || window.getComputedStyle(block.firstElementChild);
  const cardMargin = parseFloat(cardStyle.marginLeft) + parseFloat(cardStyle.marginRight);
  const cardPadding = parseFloat(cardStyle.paddingLeft) + parseFloat(cardStyle.paddingRight);
  const cardCnt = Math.floor(block.offsetWidth / (cardMinWidth + cardMargin + cardPadding));

  return cardCnt ? cardCnt : 1;
}

function isStyle5ScrolledToFirstCardInGroup(block, activeButtonIndex) {
  const cards = block.querySelectorAll(':scope > div');
  const cardCnt = getStyle5CardCount(block);
  let isFirst = false;
  let isLast = false;
  let leftPadding = 0;

  cards.forEach((card, index) => {
    if (index === 0) leftPadding = card.offsetLeft;
    const cardLeft = card.offsetLeft - leftPadding;
    if (cardLeft >= block.scrollLeft - 5 && cardLeft <= block.scrollLeft + 5) {
      const btnGroup = Math.floor(index/cardCnt);

      if (activeButtonIndex !== btnGroup) isLast = true;
      else if (index % cardCnt === 0) isFirst = true;
    }
  });

  return isFirst || isLast;
}

function selectButton(block, button, row, buttons, rememberScrollToOffset = true) {
  const index = [...buttons].indexOf(button);
  const arrows = block.parentNode.querySelector('.carousel-controls');
  const isStyle5 = block.classList.contains('style-5');

  const newScrollPos = row.offsetLeft - row.parentNode.offsetLeft;
  if (isStyle5 && rememberScrollToOffset) block.dataset.scrollToOffset = newScrollPos;
  block.scrollTo({ top: 0, left: newScrollPos, behavior: 'smooth' });
  buttons.forEach((r) => r.classList.remove('selected'));
  button.classList.add('selected');

  // enable arrows
  [...arrows.children].forEach((arrow) => arrow.classList.remove('disabled'));

  // disable arrows
  if ((!isStyle5 && index === 0) || (isStyle5 && newScrollPos === 0)) {
    arrows.querySelector('.prev').classList.add('disabled');
  } else if (index >= buttons.length - 1) {
    arrows.querySelector('.next').classList.add('disabled');
  }
}

function getVisibleSlide(event) {
  const { target } = event;
  const isStyle5 = target.classList.contains('style-5');
  const buttons = target.nextElementSibling.querySelectorAll('button');
  const slides = target.querySelectorAll(':scope > div');
  const leftPosition = target.scrollLeft;
  const rightEnd = target.scrollWidth - target.offsetWidth;
  const cardCnt = getStyle5CardCount(target);
  let leftPadding = 0;

  const scrollToOffset = +target.dataset.scrollToOffset;
  if (scrollToOffset !== -1 
      && scrollToOffset !== leftPosition 
      && (leftPosition !== rightEnd || scrollToOffset < rightEnd)) { 
    return; 
  }
  target.dataset.scrollToOffset = -1;

  slides.forEach((slide, key) => {
    const offset = slide.offsetLeft;
    let btnGroup = isStyle5 ? Math.floor(key/cardCnt) : key;

    // set first offset (extra padding?)
    if (key === 0) leftPadding = offset;

    if (offset - leftPadding === leftPosition ||
        (isStyle5 && btnGroup === buttons.length - 1 && leftPosition === rightEnd)) {
      // trigger default functionality
      if (isStyle5 && offset >= rightEnd - 20) btnGroup = buttons.length - 1;

      selectButton(target, buttons[btnGroup], slide, buttons, false);
    }
  });
}

function updateButtons(carouselWrapper, carouselInterval, carouselIntervalPause, autoPlayList) {
  const block = carouselWrapper.firstElementChild;
  const buttons = block.nextElementSibling;
  const carouselControls = buttons.nextElementSibling;

  if (!block.offsetWidth) return;

  const cardStyle = block.firstElementChild.currentStyle || window.getComputedStyle(block.firstElementChild);
  const cardMargin = parseFloat(cardStyle.marginLeft) + parseFloat(cardStyle.marginRight);
  const cardCnt = getStyle5CardCount(block);
  const newCardWidth = (Math.round(block.offsetWidth / cardCnt) - cardMargin);
  const cards = block.querySelectorAll(':scope > div');

  // Size the cards to cover entire block width
  // eslint-disable-next-line no-return-assign
  cards.forEach(card => card.style.maxWidth = `${newCardWidth}px`);

  if (cardCnt > 1) carouselControls.style.display = 'flex';
  else carouselControls.style.display = 'none';

  const buttonCount = Math.ceil(block.children.length / cardCnt);

  if (buttonCount === buttons.children.length) return;

  [...buttons.children].forEach(b => b.remove());
  // eslint-disable-next-line no-param-reassign
  carouselIntervalPause = true;
  autoPlayList.length = 0;

  [...block.children].forEach((row, i) => {
    /* buttons */
    if (i % cardCnt === 0) {
      const button = document.createElement('button');
      if (!i) button.classList.add('selected');
      button.addEventListener('click', () => {
        window.clearInterval(carouselInterval);
        selectButton(block, button, row, [...buttons.children]);
      });
      buttons.append(button);
      autoPlayList.push({ row, button });
    }
  });

  // eslint-disable-next-line no-param-reassign
  carouselIntervalPause = false;
}

export default function decorate(block) {
  const zIndex1 = 'z-index-1';
  if (block.classList.contains(zIndex1)) {
    block.parentElement.classList.add(zIndex1);
    block.classList.remove(zIndex1);
  }
  const buttons = document.createElement('div');
  const autoPlayList = [];
  let carouselInterval = null;
  // eslint-disable-next-line
  let carouselIntervalPause = false;
  const isStyle5 = block.classList.contains('style-5');
  block.dataset.scrollToOffset = -1;

  // dots
  buttons.className = 'carousel-buttons';
  if (isStyle5) buttons.classList.add('style-5');
  [...block.children].forEach((row, i) => {
    // set classes
    [...row.children].forEach((child) => {
      const pic = child.querySelector('picture');
      if (pic) {
        if (isStyle5) {
          const picOrigParent = pic.parentElement;
          const picDiv = document.createElement('div');
          picDiv.classList.add('carousel-image');
          picDiv.append(pic);
          if (picOrigParent.children.length === 0) picOrigParent.remove();
          child.parentElement.insertBefore(picDiv, child);

          child.classList.add('carousel-text');
        } else {
          child.classList.add('carousel-image');
        }
      } else {
        child.classList.add('carousel-text');
      }
    });

    // move icon to parent's parent
    const icon = row.querySelector('span.icon');
    if (icon) icon.parentNode.parentNode.prepend(icon);

    /* buttons */
    const button = document.createElement('button');
    if (!i) button.classList.add('selected');
    button.addEventListener('click', () => {
      window.clearInterval(carouselInterval);
      selectButton(block, button, row, [...buttons.children]);
    });
    buttons.append(button);
    autoPlayList.push({ row, button });
  });
  block.parentElement.append(buttons);

  // arrows
  const arrows = document.createElement('div');
  const prev = document.createElement('button');
  const next = document.createElement('button');

  arrows.classList.add('carousel-controls');
  prev.classList.add('prev', 'disabled');
  next.classList.add('next');
  arrows.append(prev);
  arrows.append(next);
  [...arrows.children].forEach((arrow) => arrow.addEventListener('click', ({ target }) => {
    const active = buttons.querySelector('.selected');
    const index = [...buttons.children].indexOf(active);

    if (target.classList.contains('disabled')) return;

    if (target.classList.contains('prev')) {
      let clickIndex = index - 1;
      if (isStyle5 && !isStyle5ScrolledToFirstCardInGroup(block, index)) clickIndex = index;

      [...buttons.children].at(clickIndex).click();
    } else if (target.classList.contains('next')) {
      [...buttons.children].at(index + 1).click();
    }
  }));
  block.parentElement.append(arrows);

  // attach scroll event
  block.addEventListener('scroll', getVisibleSlide);

  calculateScrollbarWidth();
  window.addEventListener('resize', calculateScrollbarWidth, false);
  if (isStyle5) {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(e => {
        updateButtons(e.target, carouselInterval, carouselIntervalPause, autoPlayList);
      });
    });
    resizeObserver.observe(block.parentElement);
  }

  // skip for new styles
  if ((block.classList.contains('style-1')
      || block.classList.contains('style-2')
      || block.classList.contains('style-3') 
      || block.classList.contains('style-4')
      || block.classList.contains('style-5')) 
    && !block.classList.contains('auto-play')) return;

  carouselInterval = window.setInterval(() => {
    if (carouselIntervalPause) return;
    autoPlayList.some((b, i) => {
      const isSelected = b.button.classList.contains('selected');
      if (isSelected) {
        const nextB = (i + 1 >= autoPlayList.length) ? autoPlayList[0] : autoPlayList[i + 1];
        selectButton(block, nextB.button, nextB.row, [b.button]);
      }
      return isSelected;
    });
  }, 5000);
}
