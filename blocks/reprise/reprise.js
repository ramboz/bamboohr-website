import { createElem } from '../../scripts/scripts.js';

const bodyElem = document.querySelector('body');
let loaded = false;
let repriseUrl = null;

const loadModal = () => {
  // skip if loaded
  if (loaded) return;

  // create modal
  const wrapperElem = createElem('div', 'modal-wrapper');
  wrapperElem.classList.add('reprise-modal');
  const modalElem = createElem('div', 'modal');
  const closeElem = createElem('div', 'modal-close');
  const contentElem = createElem('div', 'modal-content');
  modalElem.append(closeElem, contentElem);
  wrapperElem.append(modalElem);
  bodyElem.append(wrapperElem);

  loaded = true;
};

const handleCloseClick = (event) => {

  // skip children clicks
  if (
    !event.target.classList.contains('modal-wrapper') &&
    !event.target.classList.contains('modal-close')
  ) {
    return;
  }

  const wrapperElem = event.target.closest('.modal-wrapper');

  // hide modal
  bodyElem.classList.remove('modal-open');
  wrapperElem.classList.remove('visible');
};

const handleThumbClick = () => {
  const wrapperElem = document.querySelector('.reprise-modal');
  const closeElem = wrapperElem.querySelector('.modal-close');
  const contentElem = wrapperElem.querySelector('.modal-content');

  // attach events
  wrapperElem.addEventListener('click', handleCloseClick);
  closeElem.addEventListener('click', handleCloseClick);

  // inject embed
  contentElem.innerHTML = `<iframe class="bhrborder-radius" src="${repriseUrl}" title="Product Tour by Reprise" name="General Overview" height="720px" width="1280px" allow="clipboard-write" style="border: 0"></iframe>`;

  // show modal
  bodyElem.classList.add('modal-open');
  wrapperElem.classList.add('visible');
};

const loadreprise = async (block) => {
  if (block.classList.contains('is-loaded')) {
    return;
  }

  repriseUrl = block.querySelector('a')?.getAttribute('href') || null;
  const posterElem = block.querySelector('picture');

  // skip if no url
  if (!repriseUrl) return;

  // create modal
  loadModal();

    // attach event
    posterElem.addEventListener('click', handleThumbClick);

  // empty and add elements
  block.innerText = '';
  block.append(posterElem);
  block.classList.add('is-loaded');
  
};

export default async function decorate(block) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      loadreprise(block);
    }
  });
  observer.observe(block);
}
