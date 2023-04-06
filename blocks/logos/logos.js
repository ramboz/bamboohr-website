import { readBlockConfig, createOptimizedPicture, toClassName } from '../../scripts/scripts.js';

export default async function decorate(block) {
  if (!block.querySelector('picture')) {
    const config = readBlockConfig(block);
    let {partners} = config;
    block.classList.add('partner-logos');
    block.innerHTML = '';
    if (partners) {
      partners = [...partners.split(', ')];
      const list = document.createElement('ul');
      partners.forEach((partner) => {
        const imageFolder = block.classList.contains('grayscale') ? '/assets/partner-logos/grayscale/' : '/assets/partner-logos/'
        const imageSrc = `${imageFolder}${toClassName(partner)}.svg`;
        const partnerLogo = createOptimizedPicture(imageSrc, partner, false, [{ width: '250' }]);
        const li = document.createElement('li');
        li.innerHTML = partnerLogo.outerHTML;
        list.appendChild(li);
      });
      block.append(list);
    }
  }
}
