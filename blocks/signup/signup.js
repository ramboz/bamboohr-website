import { createElem, loadCSS } from "../../scripts/scripts.js";
import { loadFormAndChilipiper, sanitizeInput, cleanPhone } from "../form/form.js";
import { findSplitSubType } from "../columns/columns.js";

const validatePassword = (password) => (
  password.length >= 8 &&
  password.length < 124 &&
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
  const step2Form = event.target;

  // Sanitize all input fields
  const sanitizedInputElements = inputElements.map(input => ({
    input,
    id: input.id,
    name: input.name,
    value: input.name === 'phone' ? cleanPhone(input.value) : sanitizeInput(input.value)
  }));

  const formData = new FormData(step2Form);

  // Append sanitized values to FormData
  sanitizedInputElements.forEach(input => {
    formData.append(input.name, input.value);
  });

  const workEmailInput = sanitizedInputElements.find(elem => elem.id === 'workEmail');
  const websiteInput = sanitizedInputElements.find(elem => elem.id === 'Website');
  const isWorkEmailEmpty = workEmailInput.value.trim() === '';
  const isWebsiteEmpty = websiteInput.value.trim() === '';

  if (!isWorkEmailEmpty || !isWebsiteEmpty) {
    return;
  }

  const sanitizedPasswordInput = sanitizedInputElements.find(elem => elem.id === 'password1');
  const passwordInput = sanitizedPasswordInput.input;
  const passwordValue = sanitizedPasswordInput.value.trim();

  const sanitizedDomainInput = sanitizedInputElements.find(elem => elem.id === 'siteDomain');
  const domainInput = sanitizedDomainInput.input;
  const domainValue = sanitizedDomainInput.value.trim();

  const domainValidationResult = await validateDomain(domainValue);
  const domainTaken = domainValidationResult === true;

  const checkboxInput = sanitizedInputElements.find(elem => elem.id === 'agree').input;
  const checkboxChecked = checkboxInput.checked;

  const errorMessages = [
    { condition: passwordValue === '', input: passwordInput, message: 'Password cannot be empty.' },
    { condition: !validatePassword(passwordValue), input: passwordInput, message: 'Password does not meet requirements.' },
    { condition: domainValue === '', input: domainInput, message: 'Domain cannot be empty.' },
    { condition: domainValidationResult === 'bad_domain', input: domainInput, message: 'Invalid domain format.' },
    { condition: domainTaken, input: domainInput, message: 'Domain is already taken.' },
    { condition: !checkboxChecked, input: checkboxInput, message: '' }
  ];

  sanitizedInputElements.forEach(input => {
    const inputEl = input.input;
    const existingError = inputEl.parentNode?.querySelector('.error-message');
    if (existingError) {
      inputEl.parentNode.removeChild(existingError);
    }
  });

  errorMessages.forEach(errorMessage => {
    const { condition, input, message } = errorMessage;

    if (condition) {
      const existingError = input.parentNode?.querySelector('.error-message');

      if (!existingError) input.parentNode.classList.add('error');
      if (!existingError && message !== '') {
        const errorElem = createElem('p', 'error-message');
        errorElem.textContent = message;
        input.parentNode.insertBefore(errorElem, input.nextSibling);
      }
    } else {
      const sameInputConditions = errorMessages.filter(msg => msg.input === input && msg.condition);
      if (sameInputConditions.length === 0) {
        input.parentNode.classList.remove('error');
      }
    }
  });

  if (errorMessages.every(errorMessage => errorMessage.condition === false)) {
    console.log(formData);
    const entries = formData.entries();
    let entry = entries.next();
    while (!entry.done) {
      const [name, value] = entry.value;
      console.log(`${name}: ${value}`);
      entry = entries.next();
    }
  

    // try {
    //   const response = await fetch('https://www.bamboolocal.com/post_signup.php', {
    //     method: 'POST',
    //     body: formData
    //   });
    //   if (!response.ok) {
    //     console.error('Error submitting signup step2 form:', response.statusText);
    //   }
    //   // Handle success or redirect as needed
    //   const responseData = await response.json(); // Parse the JSON response, if applicable
    //   console.log('Form submitted successfully:', responseData);

    // } catch (error) {
    //   console.error('An error occurred:', error);
    // }
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
    { type: 'hidden', id: 'firstName', name: 'firstName'},
    { type: 'hidden', id: 'lastName', name: 'lastName' },
    { type: 'hidden', id: 'email', name: 'email' },
    { type: 'hidden', id: 'companyName', name: 'companyName' },
    { type: 'hidden', id: 'jobTitle', name: 'jobTitle' },
    { type: 'hidden', id: 'phone', name: 'phone' },
    { type: 'checkbox', id: 'agree', name: 'agree', label: 'I agree to the&nbsp;<a href="https://www.bamboohr.com/legal/terms-of-service" rel="noopener" target="_blank">terms and conditions</a>', value: 'accept', required: true },
    { type: 'honeypot', id: 'workEmail', name: 'workEmail' },
    { type: 'honeypot', id: 'Website', name: 'Website' }
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
    
    if (fieldConfig.type === 'honeypot') {
      input.type = 'text';
      input.id = fieldConfig.id;
      input.name = fieldConfig.name;
      input.tabIndex = -1;
      input.style.display = 'none';
    } else {
      input.type = fieldConfig.type;
      input.id = fieldConfig.id;
      input.name = fieldConfig.name;
      if (fieldConfig.value) input.value = fieldConfig.value;
      input.required = fieldConfig.required;
    }
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

/**
 * get step1 form values
 * @param {object} formElement - form element
 */
function getStep1FormValues(formElement) {
  const formData = new FormData(formElement);
  const formValues = {};

  formData.forEach((value, name) => {
    formValues[name] = value;
  });

  return formValues;
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
  // formParams.floatingLabel = true;
  const mktoForm = `<form id="mktoForm_${formParams.formId}"></form>`;
  const step1FormContainer = document.createElement('div');
  step1FormContainer.classList.add('form-container');
  step1FormContainer.innerHTML = mktoForm;

  const cssBase = `${window.hlx.serverPath}${window.hlx.codeBasePath}`;
  loadCSS(`${cssBase}/blocks/form/form.css`, null);

  const step2Form = buildStep2Form();

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
     const { step } = step1FormContainer.parentElement.parentElement.dataset;
     console.log(step);


    const step1Form = step1FormContainer.querySelector(`#mktoForm_${formParams.formId}`);
    const step1FormValues = getStep1FormValues(step1Form);
    console.log(step1FormValues);

    const hiddenFields = step2Form.querySelectorAll('input[type="hidden"]');
    const fieldMappings = {
      'firstName': 'FirstName',
      'lastName': 'LastName',
      'email': 'Email',
      'companyName': 'Company',
      'jobTitle': 'Title',
      'phone': 'Phone',
    };
    
    hiddenFields.forEach(hiddenField => {
      const fieldName = fieldMappings[hiddenField.name] || hiddenField.name;
      console.log(fieldName);
      if (step1FormValues[fieldName]) {
        hiddenField.value = step1FormValues[fieldName];
        console.log(hiddenField);
        console.log(step1FormValues[fieldName]);
      }
    });
    console.log(hiddenFields);
     // nextStep(el, block, true, step);
   });
}