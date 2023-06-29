export default async function decorate(block) {
  const response = await fetch(`/assets/awards/images.plain.html`);
  const text = await response.text();
  const DOM = new DOMParser().parseFromString(text, 'text/html');
  const pictures = DOM.querySelectorAll('picture');
  // Clean in case they added rows to the table block
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }
  block.append(...pictures);
}
