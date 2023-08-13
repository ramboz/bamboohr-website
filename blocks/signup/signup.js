import { createElem, loadCSS } from "../../scripts/scripts.js";
import { loadFormAndChilipiper } from "../form/form.js";
import { findSplitSubType } from "../columns/columns.js";

const validatePassword = (password) => (
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password)
);

const validatePasswordOnKeyup = (passwordInput, passwordReqsWrapper) => {
  const password = passwordInput.value;
  const passwordList = passwordReqsWrapper.querySelector('.signup-password-list');

  const requirements = [
    { condition: password.length >= 8, message: 'Eight or more characters' },
    { condition: /[A-Z]/.test(password), message: 'At least one uppercase letter' },
    { condition: /[a-z]/.test(password), message: 'At least one lowercase letter' },
    { condition: /[0-9]/.test(password), message: 'At least one number' }
  ];

  requirements.forEach((requirement, index) => {
    const item = passwordList.children[index];
    if (requirement.condition) {
      item.classList.add('valid');
    } else {
      item.classList.remove('valid');
    }
  });
};

async function validateDomain(domain) {
  try {
    const response = await fetch(`https://www.bamboolocal.com/xhr/domain.php?test=${encodeURIComponent(domain)}`);
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Error validating domain:', response.statusText);
      return false;
    }
    const data = await response.json();
    return data.taken;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error validating domain:', error);
    return false;
  }
}

async function step2Submit(event, inputElements) {
  event.preventDefault();

  const passwordInput = inputElements.find(elem => elem.id === 'password1');
  const passwordValue = passwordInput.value.trim();

  const domainInput = inputElements.find(elem => elem.id === 'siteDomain');
  const domainValue = domainInput.value.trim();

  const domainValidationResult = await validateDomain(domainValue);
  const domainTaken = domainValidationResult === true;

  const checkboxInput = inputElements.find(elem => elem.id === 'agree');
  const checkboxChecked = checkboxInput.checked;

  const errorMessages = [
    { condition: passwordValue === '', input: passwordInput, message: 'Password cannot be empty.' },
    { condition: !validatePassword(passwordValue), input: passwordInput, message: 'Password does not meet requirements.' },
    { condition: domainValue === '', input: domainInput, message: 'Domain cannot be empty.' },
    { condition: domainValidationResult === 'bad_domain', input: domainInput, message: 'Invalid domain format.' },
    { condition: domainTaken, input: domainInput, message: 'Domain is already taken.' },
    { condition: !checkboxChecked, input: checkboxInput, message: '' }
  ];

  inputElements.forEach(input => {
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      input.parentNode.removeChild(existingError);
    }
  });

  errorMessages.forEach(errorMessage => {
    const { condition, input, message } = errorMessage;

    if (condition) {
      const existingError = input.parentNode.querySelector('.error-message');
      if (!existingError) input.parentNode.classList.add('error');
      if (!existingError && message !== '') {
        const errorElem = createElem('p', 'error-message');
        errorElem.textContent = message;
        input.insertAdjacentHTML('afterend', errorElem.outerHTML);
      }
    } else {
      input.parentNode.classList.remove('error');
    }
  });

  if (errorMessages.every(errorMessage => errorMessage.condition === false)) {
    console.log('form submitted');
    const step2Form = event.target;
    // step2Form.submit(); 
  }
}

function buildStep2Form() {
  const formContainer = createElem('div', 'signup-step2-form-container');
  const step2Form = createElem('form', 'signup-step2-form');
  step2Form.method = 'get';
  step2Form.setAttribute('novalidate', '');

  // Define field configurations
  const fields = [
    { type: 'text', id: 'siteDomain', name: 'siteDomain', label: 'BambooHR Domain', value: '', required: true },
    { type: 'password', id: 'password1', name: 'password1', label: 'Password', value: '', required: true },
    { type: 'hidden', id: 'email', name: 'email', value: '' },
    { type: 'checkbox', id: 'agree', name: 'agree', label: 'I agree to the&nbsp;<a href="https://www.bamboohr.com/legal/terms-of-service" rel="noopener" target="_blank">terms and conditions</a>', value: 'accept', required: true },
  ];

  const inputElements = [];

  // Create form fields
  fields.forEach(fieldConfig => {
    const inputWrapper = createElem('div', 'form-input-wrapper');
    const input = document.createElement('input');

    const domainValueContainer = createElem('div', 'domain-value-container');
    const domainValue = createElem('span', 'domain-value');
    domainValueContainer.append(domainValue, '.bamboohr.com');

    if (fieldConfig.id === 'siteDomain') inputWrapper.appendChild(domainValueContainer);

    if (fieldConfig.label && fieldConfig.type !== 'checkbox') {
      const label = document.createElement('label');
      label.textContent = fieldConfig.label;
      label.setAttribute('for', fieldConfig.id);
      inputWrapper.appendChild(label);
    }
    
    input.type = fieldConfig.type;
    input.id = fieldConfig.id;
    input.name = fieldConfig.name;
    if (fieldConfig.value) input.value = fieldConfig.value;
    input.required = fieldConfig.required;
    inputWrapper.appendChild(input);

    if (fieldConfig.id === 'siteDomain') {
      input.addEventListener('keyup', (event) => {
        domainValue.textContent = event.target.value;
      });
    }

    if (fieldConfig.type === 'checkbox') {
      const label = document.createElement('label');
      label.innerHTML = fieldConfig.label;
      label.setAttribute('for', fieldConfig.id);
      inputWrapper.appendChild(label);

      const checkboxWrapper = createElem('div', 'form-checkbox-options');
      checkboxWrapper.classList.add('form-input-wrapper', 'form-checkbox-options')
      inputWrapper.classList.add('form-checkbox-option');
      checkboxWrapper.appendChild(inputWrapper);
      step2Form.appendChild(checkboxWrapper);
    } else if (fieldConfig.type === 'password') {
      // Create password requirements
      const passwordReqsWrapper = createElem('div', 'signup-password-reqs');
      passwordReqsWrapper.innerHTML = '<p>Password Requirements:</p><ul class="signup-password-list"><li class="signup-password-length">Eight or more characters</li><li class="signup-password-upper">At least one uppercase letter</li><li class="signup-password-lower">At least one lowercase letter</li><li class="signup-password-number">At least one number</li></ul>';
      inputWrapper.appendChild(passwordReqsWrapper);
      step2Form.appendChild(inputWrapper);

      input.addEventListener('keyup', () => {
        validatePasswordOnKeyup(input, passwordReqsWrapper);
      });
    } else {
      step2Form.appendChild(inputWrapper);
    }
    inputElements.push(input);
  });

  // Create submit button
  const submitBtnWrapper = createElem('div', 'form-submit-wrapper');
  const submitButton = createElem('button', 'button');
  submitButton.textContent = 'Generate Your Account';
  submitButton.type = 'submit';
  submitButton.className = 'button';
  
  submitBtnWrapper.appendChild(submitButton);
  step2Form.appendChild(submitBtnWrapper);

  formContainer.appendChild(step2Form);

  step2Form.addEventListener('submit', (event) => {
    step2Submit(event, inputElements);
  });

  return formContainer;
}

export default function decorate(block) {
  let splitVals = null;
  [...block.classList].some((c) => {
    splitVals = findSplitSubType(c);
    return splitVals;
  });

  const steps = block.querySelectorAll(':scope > div');
  steps.forEach((step, i) => {
    step.dataset.step = i + 1;
    step.classList = 'signup-step';

    const cols = [...step.children];
    if(cols?.length === 2 && splitVals) {
      cols.forEach((col, n) => { col.classList.add(`column${splitVals[n]}`); });
    }
  });

  const formParams = {formUrl: null, formId: null, successUrl: null, chilipiper: null, floatingLabel: false };
  formParams.formId = '2137';
  const mktoForm = `<form id="mktoForm_${formParams.formId}"></form>`;
  const step1FormContainer = document.createElement('div');
  step1FormContainer.classList.add('form-container');
  step1FormContainer.innerHTML = mktoForm;

  const cssBase = `${window.hlx.serverPath}${window.hlx.codeBasePath}`;
  loadCSS(`${cssBase}/blocks/form/form.css`, null);

  const step2Form = buildStep2Form();

  let el;
  const paragraphs = block.querySelectorAll('p');
  paragraphs.forEach( paragraph => {
    if(paragraph.innerText === '[signup-step1]' || paragraph.innerText === '[signup-step2]') {
      paragraph.parentNode.parentNode.classList.add('form');
      paragraph.parentNode.classList.add('form-col');
      paragraph.parentNode.previousElementSibling.classList.add('content-col');
    }
    switch(paragraph.innerText) {
      case '[signup-step1]':
        paragraph.replaceWith(step1FormContainer);
        el = paragraph;
        break;
      case '[signup-step2]':
        paragraph.replaceWith(step2Form);
        break;
      default:
        // do nothing
        break;
    }
  });

   loadFormAndChilipiper(formParams, () => {
     const { step } = el.parentElement.parentElement.dataset;
     console.log(step);
     // nextStep(el, block, true, step);
   });
}