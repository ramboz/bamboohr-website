const loadVideo = (block) => {
  if (block.classList.contains('is-loaded')) {
    return;
  }

  const anchor = block.querySelector('a');

  if (anchor?.href?.endsWith('.mp4')) {
    block.innerHTML = `
      <video autoplay muted loop>
        <source src="${anchor.innerText}" type="video/mp4">
      </video>`;

      block.classList.add('is-loaded');
  }
};

export default async function decorate(block) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      loadVideo(block);
    }
  });
  observer.observe(block);
}
