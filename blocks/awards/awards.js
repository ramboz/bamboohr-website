export default async function decorate(block) {
  let imagesUrl = '';
  if (block.classList.contains('variant-1')) {
    imagesUrl = `/assets/awards/images-variant-1.plain.html`;
  } else {
    imagesUrl = `/assets/awards/images.plain.html`;
  }
  const response = await fetch(imagesUrl);
  const text = await response.text();
  const DOM = new DOMParser().parseFromString(text, 'text/html');
  const pictures = DOM.querySelectorAll('picture');
  // Clean in case they added rows to the table block
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }
  block.append(...pictures);
}
