import { createElem } from "../../scripts/scripts.js";

const formUrl = '/website-marketing-resources/offboarding-calculator-form.json';

let formsNameArr = null;
let formsArr = null;
let editFormID = "";
let selectedTemplate = "";
let selectedForm = ""
let emailFormat = '';
let formFields = "";
let formValues = '';

// Forms
const resignationAcknowledgementForm = []
const resignationAnnouncementForm = []
const exitInterviewForm = []
const returningEquipmentForm = []
const leavingConfirmationForm = []
const offboardingDismissalForm = []
const leadGenForm = []

async function fetchData(url) {
	const resp = await fetch(url);
	const json = await resp.json()
	const {data} = json

	return data
}

function getSessionStorage() {
  return sessionStorage.getItem("forms")
    ? JSON.parse(sessionStorage.getItem("forms"))
    : [];
}

function addToSessionStorage(id, data) {
  const form = { id, data };
  const forms = getSessionStorage();
  
  // Check if a form with the same id already exists
  const formExists = forms.some(item => item.id === id);
  if (!formExists) {
    forms.push(form);
    sessionStorage.setItem("forms", JSON.stringify(forms));
  }
}

function createProgressIndicatorHtml() {
	const spanHtml = createElem('span', 'step');

	return spanHtml;
}

function getMessage(field) {
  const { validity } = field
  const text = field.id;
  const convertedText = text.replace(/([A-Z])/g, ' $1').toLowerCase();

  if (validity.valueMissing) return `Please enter ${convertedText}`;
  if (validity.typeMismatch) return `Please enter a valid ${field.type}`
	if (validity.patternMismatch) return `Please enter the correct format. 0690xxxxxx`

  return field.validationMessage
}

function validateForm(form, block) {
	let valid = true;
	const inputFields = form.querySelectorAll('input');

	inputFields.forEach(input => {
		const inputContainer = input.parentElement;
		const errorBox = inputContainer.querySelector('.error');
    let message = '';
    let regex = ''

    if (input.validity.valueMissing) {
      message = getMessage(input);
      errorBox.classList.remove('hidden');
      inputContainer.classList.add('invalid');
      errorBox.textContent = message ;
      valid = false;
      return false;
    }

    if (input.dataset.field === 'address') {
      message = getMessage(input);
      errorBox.classList.remove('hidden');
      inputContainer.classList.add('invalid');
      errorBox.textContent = message ;
      valid = false;
      return false;
    }

    if (input.type === 'text') {
      regex = /^[A-Za-z\s]+$/;
      if (!input.value.match(regex)) {
        message = 'Please enter letters only.';
        errorBox.classList.remove('hidden');
        inputContainer.classList.add('invalid');
        errorBox.textContent = message;
        valid = false;
        return false;
      }
    } else if (input.type === 'tel') {
      regex = /^\d+$/;
      if (!input.value.match(regex)) {
        message = 'Please enter numbers only.';
        errorBox.classList.remove('hidden');
        inputContainer.classList.add('invalid');
        errorBox.textContent = message;
        valid = false;
        return false;
      }
    }

    errorBox.classList.add('hidden');
    inputContainer.classList.remove('invalid');
	});

	if (valid) {
		block.querySelectorAll('.step')[0].className += " finish";
	}
	
	return valid;
}

function editSessionStorage(id, value) {
  let forms = getSessionStorage();

  forms = forms.map(form => {
    if (form.id === id) {
      form.data.forEach(item => {
        const {Field} = item
        if (Object.keys(value).includes(Field)) {
          item.FieldValue = value[Field]
        }
        
      })
    }
    return form;
  });

  sessionStorage.setItem("forms", JSON.stringify(forms));
}

// Generate Tooltip
function createTooltip(content) {
  const output = `<div class="tooltip"><span>More information</span><div class="tooltip__text">${content}</div></div>`;
  return output;
}

function createSelect(id, label, options, tooltip) {
  const optionsHtml = options.map(item => `<option value="${item.formValue}">${item.formLabel}</option>`)

  const selectHTML = `<div class="template-options__wrapper">
  <label for="${id}"> ${label} ${tooltip ? createTooltip(tooltip) : ''}</label>
  <select id="${id}">${optionsHtml}</select>
  </div>`


  return selectHTML;
}

// Generate Input
function createInput(id, type, label, placeholder, value, tooltip, options, data) {
  let inputHtml = '';
  let optionsArr = '';

  if (type !== "select") {
    inputHtml = `<div class="field_item">
    <label for="${id}">${label} ${tooltip ? createTooltip(tooltip) : ''}</label>
    <input type="${type}" id="${id}" ${placeholder ? `placeholder="${placeholder}"` : '' } ${value ? `value="${value}"` : ''} ${type === 'date' ? 'min="2023-01-01" max="2050-12-31"' : ''} ${type === 'datetime-local' ? 'min="2023-01-01T00:00" max="2050-12-31T23:30"' : ''} ${data ? `data-field="${data}"` : ""} required/>
    <div class="error hidden"></div>
    </div>`
  }

  if (options) { 
    optionsArr = options.split(", ").map(item => ({ formLabel: item, formValue: item }));
    inputHtml = createSelect(id, label, optionsArr, tooltip)
  }

  return inputHtml;
}

// Content Selection Template
function templateSelection(el, forms) {
  const selectHtml = createSelect('template-options', 'Choose your template', forms, 'Select template tooltip')
  const selectionHtml = `<div>${selectHtml}<button data-step="0" data-next class="button button--teal" id="select-template">Get started</button></div>`

  return selectionHtml;
}

// Content Input Shortcode Template
function templateFormWrapper() {
  const formHtml = `<form class="form-wrap" id="template-form"></form><nav><button data-step="1" data-prev class="button button--outline">Back</button><button type="submit" class="button" id="populate-template" data-step="1">Next</button></nav>`

  return formHtml;
}

function getTemplatesTone(template) {
  const formattedTemplates = template.reduce((acc, item, index) => {
    const {TemplateFormal, TemplateFriendly, TemplateNeutral} = item
    
    if (TemplateFormal && TemplateFriendly && TemplateNeutral ) {
      const obj = {
        TemplateFormal: item.TemplateFormal,
        TemplateNeutral: item.TemplateNeutral,
        TemplateFriendly: item.TemplateFriendly,
      }
      acc[index] = obj
    }
    return acc
  }, [])

  return formattedTemplates
}

// Generate Inputs
function generateInputs(template) {
  const output = template.map(item => {
    const {Field, Label, Placeholder, Tooltip, Type, Options, Data} = item
    return `${createInput(Field, Type, Label, Placeholder, null, Tooltip, Options, Data)}`
  }).join('')
  return output
}

// Tone Selection Shortcode Template
function templateTone(el) {
  const labelArr = ['Formal', 'Neutral', 'Friendly']
  const divWrapper = createElem('div', 'tone-selection')

  const toneTemplateDiv = `<div class="tone-template"><div id="template-preview"></div></div><nav><button data-step="2" data-prev class="button button--outline">Back</button><button data-step="2" class="button" id="lead-gen">Generate my template</button></nav>`

  labelArr.forEach(item => {
    const inputHtml = `<button class="template-selector" id="Template${item}">${item}</button>`
    divWrapper.insertAdjacentHTML('beforeend', inputHtml)
  })

  el.insertAdjacentHTML('afterend', toneTemplateDiv)

  return divWrapper
}

// Lead Gen Shortcode Template
function leadGenTemplate(el) {
  const inputFields = generateInputs(leadGenForm)
  const form = createElem('form', 'form-wrap')
  const closeTextHTML = '<div class="overlay-close"><button data-close class="button">No, I do not want my bespoke template CLOSE</button></div>'
  const btnHTML = '<button data-step="3" class="button button--teal" id="download-confirmed">Copy to Clipboard</button>'
  form.setAttribute('id', 'lead-gen')
  form.insertAdjacentHTML('beforeend', inputFields)
  form.insertAdjacentHTML('beforeend', btnHTML)

  el.insertAdjacentHTML('beforeend', closeTextHTML)

  return form;
}

// Lead Gen Shortcode Template
function downloadConfirmed() {
  const output = `<div><a href="https://bamboohr.com/blog" class="button button--teal">Go to blog</a><button data-close data-step="4" class="button button--outline button--teal">Close and return to page</button></div>`

  return output;
}

function stepIndicator(index, form) {
  const stepsArr = form.querySelectorAll(".step");
  
  stepsArr.forEach(item => {
		item.classList.remove('step-active');
	});

  stepsArr[index].classList.add('step-active');
}

function scrollToTop() {
  let position = document.querySelector('#offboarding-generator').offsetTop
  const nav = document.querySelector('.header-wrapper .nav')
  const navHeight = nav.getBoundingClientRect().height

  position -= navHeight

  window.scrollTo({
    left: 0,
    top: position,
    behavior: 'smooth'
  });
}

// Next Step
function nextStep(el, block) {
  let current = parseInt(el.target.dataset.step, 10);
  document.querySelector(`[data-step="${current}"]`).classList.remove('offboarding-generator-step--active');

  if (block) {
    stepIndicator(current, block);
  }

  current += 1

  document.querySelector(`[data-step="${current}"]`).classList.add('offboarding-generator-step--active');

  scrollToTop()
}

// Previous Step
function prevStep(el, block) {
  let current = parseInt(el.target.dataset.step, 10);
  document.querySelector(`[data-step="${current}"]`).classList.remove('offboarding-generator-step--active');

  if (block) {
    stepIndicator(0, block);
  }

  block.querySelector(`[data-step="${--current}"]`).classList.add('offboarding-generator-step--active');

  if (current === 0) {
    block.querySelector('.progress-bar').classList.remove('active');
  }

  scrollToTop()
}

function templatePreview(values, block) {
  const templatePreviewDom = block.querySelector('#template-preview')
  const tokens = templatePreviewDom.querySelectorAll('[data-token]')

  tokens.forEach(token => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(values) ) {
      let data = value.value
      let time = ""

      if (value.type === "date" || value.type === "datetime-local") {
        data = new Date(value.value).toLocaleDateString("en-US");
      }

      if (value.type === "datetime-local") {
        time = new Date(value.value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }

      if (token.dataset.token === key) {
        token.textContent = data
      } else if (token.dataset.token === 'name') {
        token.textContent = `${values.firstName.value} ${values.secondName.value}`
      } else if (token.dataset.token === 'time') {
        token.textContent = time
      }
    }
  })
}

function nextBtnHandler(event, block) {
  const form = block.querySelector('#template-form');
  const inputFields = form.querySelectorAll('input')
  editFormID = form.dataset.form;

  if (!validateForm(form, block)) return;

  formValues = Object.values(inputFields).reduce((acc, item) => {
    const {id, value, type} = item
    acc[id] = {
      value,
      type
    }
    return acc
  }, [])

  const propertyNames = Object.keys(formValues)

  propertyNames.forEach(item => {
    const input = block.querySelector(`#${item}`);
    if(input && input.value !== null) {
      const capitalised = item.charAt(0).toUpperCase() + item.slice(1)
      const fieldId = block.querySelector(`#lead${capitalised}`)

      if (fieldId) {
        fieldId.value = input.value
      }
    }
  })

  templatePreview(formValues, block)
  editSessionStorage(editFormID, formValues)
  nextStep(event, block);
}

function radioBtnHandler(el) {
  // Store tone selection
  const toneSelection = el.querySelectorAll('.template-selector');
  const toneSelectionWrapper = el.querySelector('.tone-selection')
  toneSelection[0].classList.add('checked')

  toneSelectionWrapper.addEventListener('click', (e) => {

    toneSelection.forEach(item => {
      item.classList.remove('checked')
    })

    const tone = e.target.id;

    if (tone) {
      const button = el.querySelector(`#${tone}`)
      button.classList.add('checked')
      sessionStorage.setItem('generator-tone', tone);
    
      el.querySelector('#template-preview').innerHTML = emailFormat[0][tone];
      templatePreview(formValues, el)
    }
  })
}

function templateSelectHandler(event, block) {
  selectedTemplate = block.querySelector('#template-options').value;
  const templatePreviewDom = block.querySelector('#template-preview')
  const formTemplate = block.querySelector('#template-form')
  selectedForm = formsArr.find(item => item.formValue === selectedTemplate);
  emailFormat = getTemplatesTone(selectedForm)
  const pregressBar = block.querySelector('.progress-bar')

  formTemplate.innerHTML = generateInputs(selectedForm);

  formTemplate.setAttribute('data-form', selectedTemplate)
  addToSessionStorage(selectedTemplate, selectedForm);
  templatePreviewDom.innerHTML = emailFormat[0].TemplateFormal
  pregressBar.classList.add('active')

  nextStep(event, block);
}

function leadGenBtnHandler(block) {
  const containerDiv = block.parentElement.parentElement
  containerDiv.classList.add('offboarding-generator-container--overlay');
  block.querySelector('.progress-bar').classList.remove('active');
}

function resetForm(block) {
  const stepsArr = block.querySelectorAll('.offboarding-generator-step')
  const forms = block.querySelectorAll('form')
  const blockContainer = block.parentNode.parentElement

  forms.forEach(form => {
    form.reset()
  });

  stepsArr.forEach(element => {
    element.classList.remove('offboarding-generator-step--active');
  });

  block.querySelector('[data-step="0"]').classList.add('offboarding-generator-step--active');   
  blockContainer.classList.remove('offboarding-generator-container--overlay');
}

function removeHTMLTags(str) {
  // Replace closing </p> tags with new line breaks
  const withLineBreaks = str.replace(/<\/p>/g, '\n\n');

  // Remove HTML tags using regular expression
  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, '');
  
  return withoutTags;
}


async function copyToClipboard(el) {
  let text = el.querySelector('#template-preview').innerHTML;
  text = removeHTMLTags(text)

  try {
    await navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export default async function decorate(block) {
  
  const data = await fetchData(formUrl)
  const progressBarDiv = createElem('div', 'progress-bar');
  block.setAttribute('id', 'offboarding-generator');

  // Add classes to generator step wrapping divs
  const {children} = block;
  for(let i = 0; i < children.length; i++) {
    children[i].dataset.step = i;
    children[i].classList = 'offboarding-generator-step';
    if( i === 0 ) {
      children[i].classList = 'offboarding-generator-step offboarding-generator-step--active';
    } else if (i === 3 || i === 4) {
      children[i].classList = 'offboarding-generator-step offboarding-generator-step--overlay';
    }
    else if (i === 1 || i === 2) {
      children[i].classList = 'offboarding-generator-step tab';
    }
  }

  // Sort fields for each forms
	data.forEach(item => {
    const {Form} = item

    switch(Form) {
      case "resignation letter acknowledgement":
        resignationAcknowledgementForm.push(item);
        resignationAcknowledgementForm.formLabel = item.Form
        resignationAcknowledgementForm.formValue = item.Form.replace(/ /g, '-')
        break;
      case "resignation announcement":
        resignationAnnouncementForm.push(item);
        resignationAnnouncementForm.formLabel = item.Form
        resignationAnnouncementForm.formValue = item.Form.replace(/ /g, '-')
        break;
      case "exit interview":
        exitInterviewForm.push(item);
        exitInterviewForm.formLabel = item.Form
        exitInterviewForm.formValue = item.Form.replace(/ /g, '-')
        break;
      case "returning equipment/company property":
        returningEquipmentForm.push(item);
        returningEquipmentForm.formLabel = item.Form
        returningEquipmentForm.formValue = item.Form.replace(/[ /]/g, '-')
        break;
      case "confirmation of leaving date":
        leavingConfirmationForm.push(item);
        leavingConfirmationForm.formLabel = item.Form
        leavingConfirmationForm.formValue = item.Form.replace(/ /g, '-')
        break;
      case "offboarding for dismissal":
        offboardingDismissalForm.push(item);
        offboardingDismissalForm.formLabel = item.Form
        offboardingDismissalForm.formValue = item.Form.replace(/ /g, '-')
        break;
      case "lead gen":
        leadGenForm.push(item);
        leadGenForm.formLabel = item.Form.replace(/ /g, '-')
        break;
      default:
        // do nothing for other form types
        break;
    }
  });

  formsNameArr = data.reduce((acc, obj) => {
    const {Form} = obj
    if (!acc.includes(Form)) {
      acc.push(Form)
    }
    return acc
  }, [])

  /**
   * Store all forms in array
   */
  formsArr = [resignationAcknowledgementForm, resignationAnnouncementForm, exitInterviewForm, returningEquipmentForm, leavingConfirmationForm, offboardingDismissalForm]

  // Add SVG's
  const svgOne = '<svg width="313" height="404" viewBox="0 0 313 404" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M211.451 -36.908L46.9479 -81.3319C20.2268 -88.5622 -8.31543 -80.8583 -27.8774 -61.1249L-148.295 60.3383C-167.888 80.0717 -175.518 108.835 -168.359 135.767L-124.274 301.654C-117.115 328.618 -96.2344 349.678 -69.4819 356.876L95.0521 401.332C121.773 408.562 150.315 400.858 169.877 381.125L290.295 259.693C309.888 239.96 317.518 211.196 310.359 184.264L266.274 18.3772C259.115 -8.5866 238.203 -29.6461 211.513 -36.8764L211.451 -36.908Z" fill="#E8F6F9"/></svg>';
  const svgTwo = '<svg width="548" height="696" viewBox="0 0 548 696" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M573.676 70.638L326.922 4.00218C286.84 -6.84331 244.027 4.71258 214.684 34.3127L34.0576 216.507C4.66754 246.108 -6.77763 289.253 3.96104 329.651L70.0886 578.482C80.8273 618.927 112.148 650.516 152.277 661.315L399.078 727.998C439.16 738.843 481.973 727.287 511.316 697.687L691.942 515.54C721.332 485.94 732.778 442.795 722.039 402.396L655.911 153.566C645.173 113.12 613.804 81.5309 573.77 70.6854L573.676 70.638Z" fill="#E8F6F9"/></svg>';

  const stepOne = block.querySelector('.offboarding-generator-step[data-step="0"]');
  const stepOneContent = stepOne.innerHTML;
  stepOne.innerHTML = stepOneContent + svgOne;

  block.querySelectorAll('.offboarding-generator-step--overlay').forEach((el) => {
    const content = el.innerHTML;
    el.innerHTML = content + svgTwo;
  });

  // Replace shortcodes with functionality
  const paragraphs = block.querySelectorAll('p');
  paragraphs.forEach( item => {
    switch(item.innerText) {
      case '[generator-template-selection]':
        item.innerHTML = templateSelection(item, formsArr);
        break;
      case '[generator-template-population]':
        item.innerHTML = templateFormWrapper();
        break;
      case '[generator-template-tone]':
        item.innerHTML = '';
        item.append(templateTone(item));
        break;
      case '[generator-lead-gen]':
        item.innerHTML = '';
        item.append(leadGenTemplate(item));
        break;
      case '[generator-download-confirmed]':
        item.innerHTML = downloadConfirmed();
        break;
      default:
        // do nothing none paragraphs
        break;
    }
  });

  // Create progress bar div
  block.append(progressBarDiv)

  const tabsArr = block.querySelectorAll('.tab');
  tabsArr.forEach(() => {
		progressBarDiv.append(createProgressIndicatorHtml());
	});

  // Store template selection
  // templateSelectHandler(block)
  block.querySelector('#select-template').addEventListener('click', (event) => {
    templateSelectHandler(event, block)
  })

  // Store template inputs
  // nextBtnHandler(block)

  block.querySelector('#populate-template').addEventListener('click', (e) => {
    e.preventDefault()
    nextBtnHandler(e, block)
  })

  radioBtnHandler(block)

  // Progress to lead gen
  block.querySelector('#lead-gen').addEventListener('click', (e) => {
    leadGenBtnHandler(block)
    nextStep(e);
  });

  // Progress to completed template
  block.querySelector('#download-confirmed').addEventListener('click', (e) => {
    e.preventDefault()
    const form = e.target.parentElement
    
    if (!validateForm(form, block)) return;

    copyToClipboard(block)
    nextStep(e);
  });
  
  const prev = block.querySelectorAll('[data-prev]');
  prev.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      prevStep(e, block);
    });
  });

  const close = block.querySelectorAll('.button[data-close]');
  close.forEach(item => {
    item.addEventListener('click', () => {
      resetForm(block)
    });
  });
}