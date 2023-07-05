import { readBlockConfig, getMetadata, toClassName } from '../../scripts/scripts.js';
import { isUpcomingEvent } from '../listing/listing.js';
import {
  analyticsTrackChiliPiper,
  analyticsTrackFormStart,
  analyticsTrackFormSubmission
} from '../../scripts/lib-analytics.js';
import { addWistia } from '../columns/columns.js';

// Regular expression pattern to validate email format
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  head.append(script);
  script.onload = callback;
  return script;
};

function createSelect(fd, multiSelect = false) {
  const select = document.createElement('select');
  if (multiSelect === true) {
    select.setAttribute('multiple', true);
  }
  select.id = fd.Field;
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', '');
  }

  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    ph.value = '';
    select.append(ph);
  }
  fd.Options.split('|').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  return select;
}

function getURLParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

function createOptions(fd) {
  const options = document.createElement('div');
  const optionType = fd.Type;
  options.classList.add(`form-${optionType}-options`);
  fd.Options.split('|').forEach((o, k) => {
    const option = document.createElement('div');
    option.classList.add(`form-${optionType}-option`);
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = optionType;
    input.name = fd.Field;
    input.id = fd.Field;
    input.required = !!fd.Mandatory;
    label.setAttribute('for', fd.Field);
    if (fd.Options.split('|').length > 1) {
      input.id = fd.Field + k;
      label.setAttribute('for', fd.Field + k);
    }
    // set radio data to url params if exists
    const param = getURLParam(o.trim().toLowerCase());
    if (param) {
      label.textContent = param.trim();
      input.value = param.trim();
    } else {
      input.value = o.trim();
      if (fd.Extra && fd.Options.split('|').length === 1) {
        label.innerHTML = `<a href="${fd.Extra}">${o.trim()}</a>`;
      } else {
        label.textContent = o.trim();
      }
    }
    option.append(input, label);
    options.append(option);
  });
  return options;
}

function removeValidationError(el) {
  el.parentNode.classList.remove('error');
}

function addValidationError(el) {
  el.parentNode.classList.add('error');
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

function sanitizeInput(input) {
  const output = input
    .replace(/<script[^>]*?>.*?<\/script>/gi, '')
    // eslint-disable-next-line no-useless-escape
    .replace(/<[\/\!]*?[^<>]*?>/gi, '')
    .replace(/<style[^>]*?>.*?<\/style>/gi, '')
    .replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '')
    .replace(/&nbsp;/g, '');
  return output;
}

async function submitForm(form) {
  let isError = false;
  const payload = {};
  const formEl = [...form.elements];
  let checkboxGroup = [];
  payload.entryDate = new Date().toLocaleDateString();
  formEl.forEach((fe, k) => {
    removeValidationError(fe);
    if (!fe.closest('.hidden')) {
      if (fe.required && fe.value === '') {
        isError = true;
        addValidationError(fe);
      }
      if (fe.type === 'email' && !emailPattern.test(fe.value)) {
        isError = true;
        addValidationError(fe);
      }
      if (fe.type === 'checkbox') {
        if (fe.required && !form.querySelector(`input[name="${fe.name}"]:checked`)) {
          isError = true;
          addValidationError(fe);
        }
        if (fe.checked) {
          if (formEl[k + 1] && formEl[k].name === formEl[k + 1].name) {
            checkboxGroup.push(sanitizeInput(formEl[k].value));
            payload[fe.name] = checkboxGroup.join(', ');
          } else {
            checkboxGroup = [];
            payload[fe.name] = sanitizeInput(fe.value);
          }
        }
      } else if (fe.type === 'select-multiple') {
        const selected = [...fe.selectedOptions].map((option) => sanitizeInput(option.value));
        payload[fe.id] = selected.join(', ');
      } else if (fe.id) {
        payload[fe.id] = sanitizeInput(fe.value);
      }
    }
  });
  return isError ? false : payload;
}

function createButton(fd) {
  const button = document.createElement('a');
  button.classList.add('button');
  button.href = '';
  button.textContent = fd.Label;
  if (fd.Field === 'submit') {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      button.setAttribute('disabled', '');
      const payload = await submitForm(button.closest('form'));

      if (!payload) {
        button.removeAttribute('disabled');
        return;
      }

      const resp = await fetch(button.closest('form').dataset.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: payload }),
      });

      if (resp.ok) {
        window.location.href = fd.Extra;
      } else {
        // eslint-disable-next-line no-console
        console.error(`Error submitting form: ${resp.status}`, resp);
      }
    });
  }
  return button;
}

export function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;

  if (fd.Value) {
    input.value = fd.Value;
  }

  const param = getURLParam(input.id);
  if (param) {
    input.value = param;
  }

  input.setAttribute('placeholder', fd.Placeholder);

  if (fd.Mandatory === 'x') {
    input.setAttribute('required', '');

    const eventTypes = ['blur', 'change'];
    eventTypes.forEach(eventType => {
      input.addEventListener(eventType, () => {
        if (input.value && input.parentNode.classList.contains('error')) {
          removeValidationError(input);
        } else {
          addValidationError(input);
        }
      });
    });
  }

  return input;
}

function createEmail(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  const eventTypes = ['blur', 'change'];

  if (fd.Value) {
    input.value = fd.Value;
  }

  const param = getURLParam(input.id);
  if (param) {
    input.value = param;
  }

  input.setAttribute('placeholder', fd.Placeholder);

  if (fd.Mandatory === 'x') {
    input.setAttribute('required', '');

    eventTypes.forEach(eventType => {
      input.addEventListener(eventType, () => {
        if (input.value && input.parentNode.classList.contains('error')) {
          removeValidationError(input);
        } else {
          addValidationError(input);
        }
      });
    });
  }

  eventTypes.forEach(eventType => {
    input.addEventListener(eventType, () => {
      if (emailPattern.test(input.value)) {
        removeValidationError(input);
      } else {
        addValidationError(input);
      }
    });
  });

  return input;
}

function createTextarea(fd) {
  const textarea = document.createElement('textarea');
  textarea.id = fd.Field;
  textarea.setAttribute('placeholder', fd.Placeholder);

  if (fd.Mandatory === 'x') {
    textarea.setAttribute('required', '');

    ['change', 'blur'].forEach(eventType => {
      textarea.addEventListener(eventType, () => {
        if (textarea.value && textarea.parentNode.classList.contains('error')) {
          removeValidationError(textarea);
        } else {
          addValidationError(textarea);
        }
      });
    });
  }

  return textarea;
}

export function createLabel(fd) {
  const label = document.createElement('label');
  if (fd.Label) {
    label.setAttribute('for', fd.Field);
    if (fd.Extra) {
      label.innerHTML = `<a href="${fd.Extra}">${fd.Label}</a>`;
    } else {
      label.textContent = fd.Label;
    }

    if (fd.Mandatory === 'x') {
      label.insertAdjacentHTML('beforeend', '<span class="required">*</span>');
    }
  }
  return label;
}

function createDescription(fd) {
  let desc = '';
  if (fd.Description) {
    desc = document.createElement('p');
    desc.className = 'form-description';
    desc.textContent = fd.Description;
  }
  return desc;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  const usp = new URLSearchParams(window.location.search);
  rules.forEach((field) => {
    const {
      type,
      condition: { key, operator, value },
    } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value || [...usp.getAll(key)].includes(value)) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];

  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    fieldWrapper.className = `form-${fd.Type}-wrapper${style}`;
    const fieldId = `form-${fd.Field}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    switch (fd.Type) {
      case 'email':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createDescription(fd));
        fieldWrapper.append(createEmail(fd));
        break;
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createDescription(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'multiselect':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createDescription(fd));
        fieldWrapper.append(createSelect(fd, true));
        break;
      case 'button':
        fieldWrapper.append(createButton(fd));
        break;
      case 'checkbox':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createDescription(fd));
        fieldWrapper.append(createOptions(fd));
        break;
      case 'radio':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createDescription(fd));
        fieldWrapper.append(createOptions(fd));
        break;
      case 'textarea':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createDescription(fd));
        fieldWrapper.append(createTextarea(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createDescription(fd));
        fieldWrapper.append(createInput(fd));
    }
    form.append(fieldWrapper);

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
  });

  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);

  return form;
}

function mktoFormReset(form, moreStyles) {
  const formId = `mktoForm_${form.getId()}`;
  const formEl = form.getFormElem()[0];
  const currentForm = document.getElementById(formId);

  const rando = Math.floor(Math.random() * 1000000);

  formEl.querySelectorAll('label[for]').forEach((labelEl) => {
    const forEl = formEl.querySelector(`[id="${labelEl.htmlFor}"]`);
    if (forEl) {
      const newId = `${forEl.id}_${rando}`;
      labelEl.htmlFor = newId;
      forEl.id = newId;

      if (forEl.classList.contains('mktoField') && forEl.getAttribute('type') === 'checkbox') {
        forEl.nextElementSibling.htmlFor = newId;
      }
    }
  });

  // remove element styles from <form> and children
  const styledEls = [...formEl.querySelectorAll('[style]')].concat(formEl);
  styledEls.forEach((el) => {
    el.removeAttribute('style');
  });

  const formStyleTag = formEl.querySelector('style[type="text/css"]');
  if (formStyleTag) formStyleTag.remove();

  document.getElementById('mktoForms2BaseStyle').disabled = true;
  document.getElementById('mktoForms2ThemeStyle').disabled = true;

  document.querySelectorAll('.mktoAsterix').forEach((el) => {
    el.remove();
  });
  document.querySelectorAll('.mktoOffset').forEach((el) => {
    el.remove();
  });
  document.querySelectorAll('.mktoGutter').forEach((el) => {
    el.remove();
  });
  document.querySelectorAll('.mktoClear').forEach((el) => {
    el.remove();
  });

  if (formEl.querySelector('[name="Country"]')) {
    formEl.querySelector('[name="Country"]').addEventListener('change', () => {
      document.querySelectorAll('.mktoAsterix').forEach((el) => {
        el.remove();
      });
      document.querySelectorAll('.mktoHtmlText').forEach((el) => {
        el.removeAttribute('style');
      });
      if (currentForm.querySelector('[name="Disclaimer__c"]')) {
        const gdprLabel = currentForm.querySelector('[for="Disclaimer__c"]');
        const gdprInput = currentForm.querySelector('[id="Disclaimer__c"]');
        gdprInput.id = `Disclaimer__c_${rando}`;
        gdprInput.nextElementSibling.htmlFor = `Disclaimer__c_${rando}`;
        gdprLabel.htmlFor = `Disclaimer__c_${rando}`;
        gdprLabel.removeAttribute('style');
        gdprInput.parentElement.classList.add('form-checkbox-option');
        gdprLabel.parentElement.classList.add('form-checkbox-flex');
        gdprLabel.firstElementChild.classList.add('form-gdpr-text');

        currentForm.querySelector('[name="Disclaimer__c"]').addEventListener('input', () => {
          if (currentForm.querySelector('.form-msg') && currentForm.querySelectorAll('.mktoField.mktoInvalid').length === 0 && currentForm.querySelectorAll('.mktoLogicalField.mktoInvalid').length === 0) {
            currentForm.querySelector('.form-msg').remove();
          }
        });
      }
    });
  }

  formEl.querySelectorAll('[type="checkbox"]').forEach((el) => {
    el.parentElement.classList.add('form-checkbox-option');
    el.parentElement.parentElement.classList.add('form-checkbox-flex');
  });

  // side-by-side fields

  const firstName = formEl.querySelector('[name="FirstName"]');
  const lastName = formEl.querySelector('[name="LastName"]');
  const phone = formEl.querySelector('[name="Phone"]');
  const numberOfEmp = formEl.querySelector('[name="Employees_Text__c"]');

  if (firstName && lastName) {
    firstName.closest('.mktoFormRow').classList.add('form-input-width50');
    lastName.closest('.mktoFormRow').classList.add('form-input-width50');
  }

  if (phone && numberOfEmp) {
    phone.closest('.mktoFormRow').classList.add('form-input-width50');
    numberOfEmp.closest('.mktoFormRow').classList.add('form-input-width50');
  }

  // Add error message when form is invalid
  const mktoButton = formEl.querySelector('.mktoButton');
  const formMsg = document.createElement('div');
  formMsg.classList.add('form-msg');
  formMsg.textContent = '*Please correct marked fields';

  mktoButton.addEventListener('click', () => {
    if (form.validate() === false && !currentForm.querySelector('.form-msg')) {
      currentForm.append(formMsg);
    }
  });

  // Remove error message when form is valid
  formEl.querySelectorAll('.mktoField').forEach((input) => {
    ['input', 'blur'].forEach((event) => {
      input.addEventListener(event, () => {
        if (currentForm.querySelector('.form-msg') && currentForm.querySelectorAll('.mktoField.mktoInvalid').length === 0) {
          currentForm.querySelector('.form-msg').remove();
        }
      });
    })
  });

  if (!moreStyles) {
    formEl.setAttribute('data-styles-ready', 'true');
  }
}

/* Adobe event tracking */
export function adobeEventTracking(event, componentData) {
  window.digitalData.push({
    "event": event,
    "component" : componentData
  });
}

function getMktoSearchParams(url) {
  const link = new URL(url);
  const requestType = link.searchParams?.get('requestType');
  let searchParamObj = {};
  if (requestType) {
    searchParamObj = {
      requestType
    };
  }
  return searchParamObj;
}

 // Replaces the default form heading text with the Form Heading Text value set in the metadata in the gdoc
 function addFormHeadingText() {
  const formHeadingText = getMetadata('form-heading-text');
  const formHeadingEl = document.querySelector('main .form .form-col p strong');
  if (formHeadingText && formHeadingEl) {
    formHeadingEl.textContent = formHeadingText;
  }
}

// Grabs the Expansion Product value from the meta data and adds it to the Request_Type_c hidden input field on the marketo form
function addExpansionProduct() {
  const expansionProduct = getMetadata('expansion-product');
  const requestType = document.querySelector('input[name="Request_Type__c"]');
  if (expansionProduct && requestType) {
    requestType.value = expansionProduct;
  }
}

/**
 * Capitalize first letter of object keys
 * @param {object} obj - The object to capitalize keys for
 * @returns {object} The object with capitalized keys
 */
const capitalizeKeys = (obj) => {
  const modifiedObj = {};
  Object.keys(obj).forEach((key) => {
    const modifiedKey = key.charAt(0).toUpperCase() + key.slice(1);
    modifiedObj[modifiedKey] = obj[key];
  });
  return modifiedObj;
};

/**
 * Get prefill fields from marketo cookie
 * @returns {Promise<object|null>} The prefill fields object or null if there was an error
 */
const getPrefillFields = async () => {
  try {
    const response = await fetch('/xhr/formfill.php');
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(`Request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const { formData } = data;
    const mktoLeadFields = formData ? capitalizeKeys(formData) : null;

    return mktoLeadFields;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return null;
  }
};

/**
 * Fill form fields with fields that exist in prefillFields
 * @param {object} prefillFields - The prefill fields object
 * @param {object} formEl - The form element to fill
 */
const fillFormFields = (prefillFields, formEl) => {
  Object.entries(prefillFields).forEach(([fieldName, fieldValue]) => {
    const formField = formEl.querySelector(`[name='${fieldName}']`);
    if (formField) {
      const formLabel = formField.previousElementSibling;
      formField.value = fieldValue;
      formLabel.classList.add('active');
    }
  });
};

/**
 * Set form values
 * @param {object} formEl - The form element to set values for
 */
const setFormValues = async (formEl) => {
  const prefillFields = await getPrefillFields();
  if (prefillFields) fillFormFields(prefillFields, formEl);
  return prefillFields;
};

/**
 * Clear form values
 *  @param {string} formEl - form element
 * @param {object} formFields - The form fields to clear the values
 * @param {boolean} includeEmail - include email to clear email value
 */
function clearFormValues(formEl, formFields, includeEmail = true) {
  formEl.classList.remove('minimized-form');
  const partnerConsent = formEl.querySelector('.bhrForm__partnerDisclaimer');
  if (partnerConsent) partnerConsent.closest('.mktoFormRow').classList.remove('hide');

  formFields.forEach((field) => {
    const formRow = field.closest('.mktoFormRow');
    if (formRow && formRow.classList.contains('hide')) formRow.classList.remove('hide');
    const fieldType = field.getAttribute('type');

    if (field.tagName === 'SELECT') {
      field.selectedIndex = 0;
    }
    if (fieldType !== 'hidden' && fieldType !== 'email' && field.tagName !== 'SELECT') {
      field.value = '';
    }
    if (includeEmail && fieldType === 'email') {
      field.value = '';
    }
  });
}

/**
 * Minimize marketo form to show email and checkboxes only
 * @param {object} formEl - form element
 */
function minimizeForm(formEl) {
  const formFields = formEl.querySelectorAll('.mktoField');
  formFields.forEach((field) => {
    const fieldType = field.getAttribute('type');
    if (fieldType !== 'email' && fieldType !== 'checkbox' && fieldType !== 'hidden' && field.value.trim() !== '') {
      const formRow = field.closest('.mktoFormRow');
      if (formRow) formRow.classList.add('hide');
      const partnerConsent = formEl.querySelector('.bhrForm__partnerDisclaimer');
      if (partnerConsent) partnerConsent.closest('.mktoFormRow').classList.add('hide');
    }
  });
}

function loadFormAndChilipiper(formId, successUrl, chilipiper, floatingLable = false) {
  loadScript('//grow.bamboohr.com/js/forms2/js/forms2.min.js', () => {
    window.MktoForms2.loadForm('//grow.bamboohr.com', '195-LOZ-515', formId);

    window.MktoForms2.whenReady((form) => {
      if (form.getId().toString() === formId) {
        mktoFormReset(form);
        const formEl = form.getFormElem()[0];

        /* Adobe Form Start event tracking when user changes the first field */
        formEl.firstElementChild.addEventListener('change', () => {
          // eslint-disable-next-line
          alloy("getIdentity")
          .then((result) => {
            // eslint-disable-next-line
            formEl.querySelector('input[name="ECID"]').value = result.identity.ECID;
          })
          .catch( () => { 
            formEl.querySelector('input[name="ECID"]').value = '';
          });
          analyticsTrackFormStart(formEl);
        });

        /* Prefill form fields */
        setFormValues(formEl)
          .then((result) => {
            const testVariation = getMetadata('test-variation') ? toClassName(getMetadata('test-variation')) : '';
            if (result && testVariation === 'minimized-form') {
              // Hide all form fields except email input
              formEl.classList.add('minimized-form');
              formEl.closest('.form').classList.add('has-minimized-form');

              const formCol = formEl.closest('.form-col');
              // set new form title
              const formTitle = formCol?.firstElementChild?.firstElementChild;
              const originalFormTitle = formCol?.firstElementChild?.firstElementChild.textContent;
              if (formTitle && result.FirstName) formTitle.textContent = `Welcome Back ${result.FirstName}!`;
              const formSubheading = formCol?.firstElementChild?.nextSibling;
              const originalFormSubheading = formCol?.firstElementChild?.nextSibling.textContent;

              const clearFormEl = document.createElement('a');
              clearFormEl.href = '#';
              clearFormEl.textContent = 'Tell us about yourself';
              if (formSubheading) formSubheading.innerHTML = `Not you? ${clearFormEl.outerHTML}`;

              const formConsentEl = document.createElement('p');
              formConsentEl.className = 'form-consent';
              formConsentEl.innerHTML = 'Please see our <a href="/privacy-policy/">Privacy Notice.</a>';
              const formLogos = formCol.querySelector('.form-logos');
              formCol.insertBefore(formConsentEl, formLogos);

              // minimize form
              const formFields = formEl.querySelectorAll('.mktoField');
              minimizeForm(formEl);

              // show all form fields and clear form values
              formSubheading.addEventListener('click', (e) => {
                e.preventDefault();
                clearFormValues(formEl, formFields);
                formConsentEl.remove();
                if (formTitle) formTitle.textContent = originalFormTitle;
                if (formSubheading) formSubheading.textContent = originalFormSubheading;
              });

              // show all fields if user change email, keep email prefilled
              const email = formEl.querySelector(`[name='Email']`);
              email.addEventListener('change', () => {
                if (email !== result.Email && formEl.classList.contains('minimized-form')) {
                  clearFormValues(formEl, formFields, false);
                  formConsentEl.remove();
                }
              });

              // show phone number field if user check the request a demo checkbox
              const demoCheckbox = formEl.querySelector('input[name="Demo_Request_Checkbox__c"]');
              demoCheckbox.addEventListener('change', () => {
                const phoneNumber = formEl.querySelector('input[name="Phone"]');
                const phoneNumberRow = phoneNumber.closest('.mktoFormRow');
                if (demoCheckbox.checked && phoneNumberRow && phoneNumberRow.classList.contains('hide')) {
                  phoneNumberRow.classList.remove('hide');
                }
              });
            }
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(`Error when setting form values: ${error.message}`);
          });

        /* floating label */
        if (floatingLable === true) {
          formEl.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])').forEach((input) => {
            const label = input.previousElementSibling;
            if (input.value.trim().length && label) label.classList.add('active');

            input.addEventListener('focusin', () => {
              if (!label.classList.contains('active')) label.classList.add('active');
            });
            input.addEventListener('focusout', () => {
              if (label.classList.contains('active') && !input.value.trim().length) label.classList.remove('active');
            });
            input.addEventListener('input', () => {
              if (!label.classList.contains('active') && input.value.trim().length) {
                label.classList.add('active');
              }
            });
          });
          formEl.querySelectorAll('select').forEach((select) => {
            select.previousElementSibling.classList.add('active');
          });
        }

        const readyTalkMeetingID = getMetadata('ready-talk-meeting-id');
        const readyTalkEl = formEl.querySelector('input[name="readyTalkMeetingID"]');
        if (readyTalkMeetingID && readyTalkEl) {
          formEl.querySelector('input[name="readyTalkMeetingID"]').value = readyTalkMeetingID;
        }

        const modalUrl = formEl.closest('.modal-wrapper')?.dataset.url;
        if (modalUrl) {
          const searchParams = getMktoSearchParams(modalUrl);
          const requestTypeInput = formEl.querySelector('input[name="Request_Type__c"]');
          if (requestTypeInput && searchParams?.requestType) requestTypeInput.value = searchParams.requestType;
        }

        const formSubmitText = getMetadata('form-submit-text');
        const formSubmitBtn = formEl.querySelector('.mktoButton');
        if (formSubmitText) {
          formSubmitBtn.textContent = formSubmitText;
        } else if (window.location.pathname.includes('/webinars/')) {
          const eventDateStr = getMetadata('event-date');
          formSubmitBtn.textContent = isUpcomingEvent(eventDateStr) ? 'Register for this event' : 'Watch Now';
        }

        addFormHeadingText();
        addExpansionProduct();

        const demoCheckbox = formEl.querySelector('input[name="Demo_Request_Checkbox__c"]');
        if (chilipiper && chilipiper === 'content-download-form') {
          const isAbsoluteURL = str => /^[a-z][a-z0-9+.-]*:/.test(str);
          const cpRedirectUrl = isAbsoluteURL(successUrl) ? successUrl : window.location.origin + successUrl;
          form.onSubmit(() => {
            if (demoCheckbox && demoCheckbox.checked) {
              // eslint-disable-next-line
              ChiliPiper.submit('bamboohr', 'content-download-form', { dynamicRedirectLink: cpRedirectUrl });
            }
          });
        }
        
        form.onSuccess(() => {
          /* GA events tracking */
          window.dataLayer = window.dataLayer || [];
          const eventType = form.getId() === 1240 ? 'demoRequest' : 'marketoForm';
          window.dataLayer.push({
            event: eventType,
            formName: form.getId(),
          });

          /* Adobe form complete events tracking */
		      analyticsTrackFormSubmission(formEl);

          /* Delay success page redirection for 1 second to ensure adobe tracking pixel fires */
          setTimeout(() => {
            if (successUrl && !chilipiper) window.location.href = successUrl;
            if (successUrl && chilipiper && chilipiper === 'content-download-form' && !demoCheckbox.checked) window.location.href = successUrl;
          },1000);

          return false;
        });
      }
    });
  });
  if (chilipiper) {
    loadScript('https://js.chilipiper.com/marketing.js', () => {
      let timeoutSuccessUrl = '';
      function redirectTimeout() {
        return setTimeout(() => {
		  setTimeout(() =>{
			analyticsTrackChiliPiper({"cpTimedOutEvent": 1});
		  },1000);		  
		  window.location.href = timeoutSuccessUrl; 
		}, '240000');
      }
      //  eslint-disable-next-line
      window.q = (a) => {return function(){ChiliPiper[a].q=(ChiliPiper[a].q||[]).concat([arguments])}};window.ChiliPiper=window.ChiliPiper||"submit scheduling showCalendar submit widget bookMeeting".split(" ").reduce(function(a,b){a[b]=q(b);return a},{});
      
      if (chilipiper !== 'content-download-form') {
        timeoutSuccessUrl = chilipiper === 'pricing-request-form' ? '/chilipiper/pricing-timeout-success' : '/chilipiper/live-demo-timeout-success';

        // eslint-disable-next-line
        ChiliPiper.scheduling('bamboohr', `${chilipiper}`, {
          title: 'Thanks! What time works best for a quick call?',
          onRouted: redirectTimeout,
          map: true,
        });
      }

      window.addEventListener('message', (event)=>{
        if (event.origin !== 'https://bamboohr.chilipiper.com') return;
        const eventData = event.data;
        const {action} = eventData;
        const trackedActions = ["booked", "phone-selected", "close"];
		if (trackedActions.includes(action)) {
		  let cpEvent = {};
		  // eslint-disable-next-line default-case
		  switch (action) {
			case "booked":	
			  cpEvent = {"cpBookedEvent": 1};
			  break;
			case "phone-selected":
			  cpEvent = {"cpCalledEvent": 1};
			  break;
			case "close":
			  cpEvent = {"cpClosedEvent": 1};
			  break;			  
		  }
		  analyticsTrackChiliPiper(cpEvent);
		}
		
      }, false);

    });
  }
}


const getDefaultEmbed = (url) => `<iframe frameborder="0" src="${url}" allowfullscreen scrolling="no" loading="lazy"></iframe>`;

export function scrollToForm() {
  const formEl = document.querySelector('.form-wrapper');
  formEl.scrollIntoView({
    behavior: 'smooth',
  });
  if (!/Mobi/.test(navigator.userAgent)) formEl.querySelector('input:not([type=hidden])').focus();
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  let chilipiper; let formUrl; let successUrl;

  const floatingLabel = !!block.classList.contains('floating-label');

  if (!block.classList.contains('has-content')) {
    const as = block.querySelectorAll('a');
    formUrl = as[0] ? as[0].href : '';
    successUrl = as[1] ? as[1].href : '';
  }

  [...block.classList].forEach((name) => {
    if (!Number.isNaN(+name.split('').at(0))) {
      block.classList.remove(name);
      block.classList.add(`grid-${name}`);
    }
  });
  if (!formUrl) {
    const resp = await fetch('/forms-map.json');
    const json = await resp.json();
    const map = json.data;
    map.forEach((entry) => {
      if (
        entry.URL === window.location.pathname || (entry.URL.endsWith('**') && window.location.pathname.startsWith(entry.URL.split('**')[0]))
      ) {
        formUrl = entry.Form;
        let fbTracking = '';
        if (entry.Success === '' && window.location.pathname.includes('/resources/')) fbTracking = '&fbTracking=success.php';
        successUrl = entry.Success === '' ? `${window.location.pathname}?formSubmit=success${fbTracking}` : entry.Success;
        chilipiper = entry.Chilipiper;
      }
    });
  }

  if (formUrl) {
    if (formUrl.includes('marketo')) {
      const formId = new URL(formUrl).hash.substring(4);
      if (config && !block.classList.contains('has-content')) {
        block.innerHTML = '';
      }
      const mktoForm = `<form id="mktoForm_${formId}"></form>`;
      if (block.classList.contains('has-content')) {
        const cols = block.querySelectorAll(':scope > div > div');
        cols.forEach((col) => {
          const formCol = [...col.children].find((child) => child.textContent.trim().toLowerCase() === 'form');
          if (formCol) {
            col.classList.add('form-col');
            const formContainer = document.createElement('div');
            formContainer.classList.add('form-container');
            formContainer.innerHTML = mktoForm;
            formCol.replaceWith(formContainer);
            loadFormAndChilipiper(formId, successUrl, chilipiper, floatingLabel);
          } else {
            col.classList.add('content-col');
            const a = col.querySelector('a');
            if (a && block.classList.contains('with-google-map')) {
              const url = new URL(a.href.replace(/\/$/, ''));
              a.outerHTML = getDefaultEmbed(url);
            } else if (a?.href?.includes('wistia')) {
              const loadWistiaCSS = true;
              addWistia(col, loadWistiaCSS);
            }
          }
        });
      } else {
        block.innerHTML = mktoForm;
        loadFormAndChilipiper(formId, successUrl, chilipiper, floatingLabel);
      }
    } else {
      const formEl = await createForm(formUrl);
      block.firstElementChild.replaceWith(formEl);
    }
  }
}
