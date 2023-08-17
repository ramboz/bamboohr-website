import { createElem, loadCSS } from "../../scripts/scripts.js";
import { loadFormAndChilipiper, sanitizeInput, cleanPhone } from "../form/form.js";
import { findSplitSubType } from "../columns/columns.js";
import { getDefaultEmbed } from "../embed/embed.js";

const createDotLoader = () => {
  const loaderContainer = createElem('div', 'dot-loader-container');
  const leftLoader = createElem('div', 'dot-loader');
  const rightLoader = createElem('div', 'dot-loader');

  const createDot = () => createElem('div', 'dot');

  Array.from({ length: 3 }).forEach(() => {
    leftLoader.appendChild(createDot());
    rightLoader.appendChild(createDot());
  });

  const copy = createElem('div', 'typ-title2');
  copy.textContent = 'Firing up the thingamajig...';

  loaderContainer.append(leftLoader, copy, rightLoader);

  return loaderContainer;
};

/**
 * Validate password
 * @param {string} password - password user entered on step 2
 */
const validatePassword = (password) => (
  password.length >= 8 &&
  password.length < 124 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password)
);

/**
 * Validate password on keyup
 * @param {obj} passwordInput - password input element
 * @param {obj} passwordReqsWrapper - password requirements element
 */
const validatePasswordOnKeyup = (passwordInput, passwordReqsWrapper) => {
  const password = passwordInput.value;
  const passwordList = passwordReqsWrapper.querySelector('.signup-password-list');
  const errorElem = passwordInput.parentNode.querySelector('.error-message');

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

  if (password && requirements.every(requirement => requirement.condition)) {
    if (errorElem) {
      passwordInput.parentNode.removeChild(errorElem);
      passwordInput.parentNode.classList.remove('error');
    }
  }
};

/**
 * Validate domain
 * @param {string} domain - siteDomain that user created
 */
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

/**
 * Show signup step
 * @param {int} stepNumber - step number
 */
function showStep(stepNumber) {
  const steps = document.querySelectorAll('.signup-step');
  steps.forEach(step => {
    const stepToShow = parseInt(step.dataset.step, 10);
    if (stepNumber === 3 && stepToShow === 2) {
      step.querySelector('.form-col').classList.add('hide');
    } else {
      step.classList.remove('active');
    }

    if (stepToShow === stepNumber){
      step.classList.add('active');
    }
  });
}

/**
 * Submit step 2 form
 * @param {obj} event - event
 * @param {obj} inputElements - form input elements
 */
async function step2Submit(event, inputElements) {
  event.preventDefault();
  const step2Form = event.target;

  const currentStep = step2Form.closest('.signup-step').dataset.step;

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
    const existingField = formData.get(input.name);
    if (existingField === null) {
      formData.append(input.name, input.value);
    } else {
      formData.set(input.name, input.value);
    }
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

    // show step 3
    showStep(parseInt(currentStep, 10) + 1);
    const successModal = document.getElementById('signup-success-modal');
    successModal.classList.add('visible');
    document.body.classList.add('modal-open');

    try {
      const response = await fetch('https://www.bamboolocal.com/post_signup.php', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error('Error submitting signup step2 form:', response.statusText);
      }
      const loderContainer = successModal.querySelector('.dot-loader-container');
      const responseData = await response.json();

      if (responseData.errors && responseData.errors.length > 0) {
        const errorMsgEl = createElem('p', 'signup-submit-error');
        errorMsgEl.textContent = 'There was an error setting up your account, please try again later';
        loderContainer.replaceWith(errorMsgEl);
      }
      // eslint-disable-next-line no-console
      console.log('Form submitted successfully:', responseData);
      const loginBtn = createElem('a', 'success-login-btn');
      loginBtn.textContent = 'We\'re Ready!';
      loginBtn.href = responseData.goTo;
      loderContainer.replaceWith(loginBtn);

      if (responseData.openAlso !== undefined) {
        loginBtn.addEventListener('click', () => {
          window.open(responseData.openAlso, '_blank');
        });
        loginBtn.setAttribute('data-openalso', '1');
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred:', error);
    }
  }
}

/**
 * Build step 2 form
 * @returns {obj} formContainer
 */
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
    { type: 'hidden', id: 'maxEmployees', name: 'maxEmployees' },
    { type: 'hidden', id: 'country', name: 'country' },
    { type: 'hidden', id: 'requestType', name: 'requestType', value: 'Trial' },
    { type: 'honeypot', id: 'workEmail', name: 'workEmail' },
    { type: 'honeypot', id: 'Website', name: 'Website' },
    { type: 'checkbox', id: 'agree', name: 'agree', label: 'I agree to the&nbsp;<a href="https://www.bamboohr.com/legal/terms-of-service" rel="noopener" target="_blank">terms and conditions</a>', value: 'accept', required: true }
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
    step.classList.add('signup-step');

    const cols = [...step.children];
    if(cols?.length === 2 && splitVals) {
      cols.forEach((col, n) => { col.classList.add(`column${splitVals[n]}`); });
    }

    const currentStep = step.dataset.step;
    if (currentStep === '1') {
      step.classList.add('active');
    } else if (currentStep === '2') {
      const secondH1 = step.querySelector('h1');
      const newDiv = createElem('div', 'signup-title');
      newDiv.textContent = secondH1.textContent;
      secondH1.replaceWith(newDiv);
    } else if (currentStep === '3') {
      const step3Content = step.firstElementChild;
      const wrapper = createElem('div', 'modal-wrapper');
      wrapper.id = 'signup-success-modal';

      const modal = createElem('div', 'modal');
      const modalContent = createElem('div', 'modal-content');

      if (step3Content) modalContent.appendChild(step3Content);
      modal.append(modalContent);
      wrapper.append(modal);
      step.appendChild(wrapper);

      const a = step.querySelector('a');
      if (a?.href?.includes('wistia')) {
        const url = new URL(a.href.replace(/\/$/, ''));
        const embed = getDefaultEmbed(url);
        a.outerHTML = embed;
      }

      const dotLoader = createDotLoader();
      modalContent.append(dotLoader);
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
        break;
    }
  });

  loadFormAndChilipiper(formParams, () => {
  const currentStep = 1;

  const step1Form = step1FormContainer.querySelector(`#mktoForm_${formParams.formId}`);
  const step1FormValues = getStep1FormValues(step1Form);
  const hiddenFields = step2Form.querySelectorAll('input[type="hidden"]');
  const fieldMappings = {
    'firstName': 'FirstName',
    'lastName': 'LastName',
    'email': 'Email',
    'companyName': 'Company',
    'jobTitle': 'Title',
    'phone': 'Phone',
    'maxEmployees': 'Employees_Text__c',
    'country': 'Country',
    'requestType': 'RequestType',
  };
  
  // fill hidden fields value with step1 form values
  hiddenFields.forEach(hiddenField => {
    const fieldName = fieldMappings[hiddenField.name] || hiddenField.name;
    if (step1FormValues[fieldName]) {
      hiddenField.value = step1FormValues[fieldName];
      if (hiddenField.name === 'maxEmployees') {
        const [, max] = step1FormValues[fieldName].split('-');
        hiddenField.value = parseInt(max, 10);
      }
    }
  });
  showStep(currentStep + 1);
  });
}