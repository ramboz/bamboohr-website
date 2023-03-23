import { scrollToForm } from '../form/form.js';

export default function decorate(block) {
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
