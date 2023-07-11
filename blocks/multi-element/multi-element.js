import { scrollToForm } from '../form/form.js';

export default function decorate(block) {
  // convert "number" classes
  [...block.classList].forEach((name) => {
    if (!Number.isNaN(+name.split('').at(0))) {
      block.classList.remove(name);
      block.classList.add(`style-${name}`);
    }
  });

  const inlineButtons = block.classList.contains('button-inline');

  // clean up markup, move all "columns" as block children
  block.querySelectorAll(':scope > div').forEach((row, key) => {
    row.querySelectorAll(':scope > div').forEach((col) => {
      const pictures = col.querySelectorAll('picture');

      if (pictures.length > 1) {
        col.classList.add('images');

        // move to parent div and remove empty p
        pictures.forEach((picture) => {
          picture.parentNode.remove();
          col.append(picture);
        });
      } else {
        col.classList.add('content');
      }

      if (key === 1 &&
          (block.classList.contains('extra') || block.classList.contains('extra-right'))) {
        col.classList.add('extra');
      }

      if (inlineButtons) {
        // Group inline buttons
        const btns = col.querySelectorAll('.button-container');
        if (btns.length) {
          const multiInlineBtns = document.createElement('div');
          multiInlineBtns.classList.add('multi-inline-buttons');

          btns.forEach(btn => multiInlineBtns.append(btn));

          col.append(multiInlineBtns);
        }
      }

      block.append(col);
    });

    row.remove();
  });

   // enable links/buttons to scroll to form
   const links = block.querySelectorAll('a');
   if (links) {
     links.forEach((a) => {
       if(a.hash === '#scroll-to-form') {
         a.addEventListener('click', (e) => {
           e.preventDefault();
           scrollToForm();
         })
       }
     });
   }
}
