import { createElem } from '../../scripts/scripts.js';
import { emailPattern } from '../form/form.js';

function createEmailInput() {
  const input = document.createElement('input');
  input.type = 'email';
  input.id = 'email';
  input.name = 'email';
  input.setAttribute('required', '');

  const eventTypes = ['blur', 'change'];
  eventTypes.forEach(eventType => {
    input.addEventListener(eventType, () => {
      input.parentNode.classList.toggle('error', !input.value || !emailPattern.test(input.value));
    });
  });

  return input;
}

/**
 * Create email form
 *  @param {object} ctaBtn - sidebar cta button element
 */
function createForm(ctaBtn) {
  const ctaBtnUrl =  new URL(ctaBtn.href);
  const formAction = ctaBtnUrl.pathname + ctaBtnUrl.search + ctaBtnUrl.hash;
  const form = createElem('form', 'sidebar-cta-form');
  form.action = formAction;
  form.method = 'get';
  form.setAttribute('novalidate', '');

  const fieldWrapper = createElem('div', 'field-wrapper');
  const label = document.createElement('label');
  label.setAttribute('for', 'email');
  label.textContent = 'Email';
  const emailInput = createEmailInput();
  const fieldErrorMsg = createElem('div', 'error-msg');
  fieldWrapper.append(label);
  fieldWrapper.append(emailInput);
  fieldWrapper.append(fieldErrorMsg);

  emailInput.addEventListener('focusin', () => {
    if (!label.classList.contains('active')) label.classList.add('active');
  });
  emailInput.addEventListener('focusout', () => {
    if (label.classList.contains('active') && !emailInput.value.trim().length) label.classList.remove('active');
  });
  emailInput.addEventListener('input', () => {
    if (!label.classList.contains('active') && emailInput.value.trim().length) {
      label.classList.add('active');
    }
  });
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = ctaBtn?.textContent;
  form.append(fieldWrapper);
  form.append(submitButton);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (emailInput.value.trim() === '' || !emailPattern.test(emailInput.value)) {
      fieldErrorMsg.textContent = 'Please enter a valid email address.';
      return;
    }
    form.submit();
  });
  
  return form;
}

export default function decorate(block) {
  const ctaBtn = block.querySelector('a');

  if (block.classList.contains('email-form') && ctaBtn) {
    const form = createForm(ctaBtn);
    ctaBtn.parentElement.replaceWith(form);
  }
}