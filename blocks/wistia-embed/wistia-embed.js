import { createElem } from '../../scripts/scripts.js';

const getOembed = (path) => {
  const oembed = new URL('/oembed', 'https://fast.wistia.com');
  const params = new URLSearchParams({
    autoPlay: false,
    embedType: 'iframe',
    url: path,
    videoFoam: true,
  });

  return fetch(`${oembed.toString()}?${params.toString()}`)
    .then((response) => response.json())
    .then((data) => data);
};

export default async function decorate(block) {
  const scriptElem = createElem('script');
  scriptElem.setAttribute('async', '');
  scriptElem.setAttribute('src', '//fast.wistia.com/assets/external/E-v1.js');
  block.append(scriptElem);

  const url = block.querySelector('a')?.getAttribute('href') || null;
  if (!url) return;

  const oEmbed = await getOembed(url);
  if (!oEmbed) return;

  const innerDiv = block.querySelector(':scope > div > div');
  innerDiv.innerHTML = oEmbed.html;
}
