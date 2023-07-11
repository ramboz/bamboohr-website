export default function decorate(block) {
  const regex = /(^(?:tablet-|laptop-|desktop-)?cols-(?:[1-6]))/g;
  const colsClasses = [...block.classList].filter((cl) => cl.match(regex));

  const galleryContainer = block.querySelector('picture').parentNode;
  galleryContainer.classList.add('gallery-container');
  colsClasses.forEach((colClass) => {
    galleryContainer.classList.add(colClass);
  });
}
