export default async function decorate(block) {
  const anchor = block.querySelector('a');

  if (anchor?.href?.endsWith('.mp4')) {
    block.innerHTML = `
      <video autoplay muted loop>
        <source src="${anchor.innerText}" type="video/mp4">
      </video>`;
  }
}
