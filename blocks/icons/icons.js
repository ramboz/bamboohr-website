import { readBlockConfig, createOptimizedPicture, toClassName } from '../../scripts/scripts.js';

function addSVGSizeToIconDesc(el) {
  const svgElem = el.querySelector('svg');
  if (svgElem) {
    const svgWidth = svgElem.getAttribute('width');
    const svgHeight = svgElem.getAttribute('height');
    const iconDesc = el.querySelector('.icon-description');
    const sizeInfo = document.createElement('p');
    
    sizeInfo.className = 'icon-size';
    sizeInfo.textContent = `${svgWidth} x ${svgHeight}`;
    iconDesc.append(sizeInfo);
  }
}

export default async function decorate(block) {
  if (!block.querySelector('picture')) {
    const config = readBlockConfig(block);
    let {list} = config;
    const optimized = block.classList.contains('optimized');
    block.classList.add('icons-library');
    block.innerHTML = '';
    if (list) {
      list = [...list.split(', ')];
      const iconList = document.createElement('ul');
      list.forEach((icon) => {
        const li = document.createElement('li');
        const iconName = `${toClassName(icon)}`;
        if (optimized) {
          const imageSrc = `/icons/${iconName}.svg`;
          const iconSVG = createOptimizedPicture(imageSrc, icon, false, [{ width: '250' }]);
          li.innerHTML = `<div class="icon-image ${iconName}">${iconSVG.outerHTML}</div>
            <div class="icon-description">
              <p class="icon-name">${iconName}</p>
            </div>`;
        } else {
          const fetchBase = window.hlx.serverPath;
          fetch(`${fetchBase}${window.hlx.codeBasePath}/icons/${iconName}.svg`).then((resp) => {
            if (resp.status === 200)
              resp.text().then((svg) => {
                li.innerHTML = `<div class="icon-image ${iconName}">${svg}</div>
                  <div class="icon-description">
                    <p class="icon-name">${iconName}</p>
                  </div>`;

                addSVGSizeToIconDesc(li);
              });
          });
        }
        
        iconList.appendChild(li);
      });
      block.append(iconList);
      const div = document.createElement('div');
      div.innerHTML = `<p class="icon-count">Icon Count: ${list.length}</p>`;
      block.append(div);
    }
  }
}
