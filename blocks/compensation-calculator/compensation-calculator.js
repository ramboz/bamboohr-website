import { createElem } from '../../scripts/scripts.js';
import { createLabel, createInput } from '../form/form.js';

let currentTab = 0;
const jsonUrl = '/drafts/doliva/compensation-calculator-form.json';

const formFields = [];

async function fetchData(url) {
  const resp = await fetch(url);
  const json = await resp.json();
  const { data } = json;

  return data;
}

function createProgressIndicatorHtml() {
  const spanHtml = createElem('span', 'step');

  return spanHtml;
}

function formatNumber(sum) {
  const formattedNum = parseInt(sum, 10).toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formattedNum;
}

function getMessage(field) {
  const minValue = formatNumber(field.min);
  const maxValue = formatNumber(field.max);

  return `Please enter a number between ${minValue} and ${maxValue}`;
}

function validateForm(form) {
  let valid = true;
  const tabsArr = form.querySelectorAll('.tab');
  const inputFields = tabsArr[currentTab].querySelectorAll('input');

  inputFields.forEach((input) => {
    const inputContainer = input.parentElement;
    const errorBox = inputContainer.querySelector('.error');
    const parsedInputValue = parseInt(input.value, 10);
    const parsedInputMax = parseInt(input.max, 10);

    if (errorBox) {
      if (input.value.length === 0 || parsedInputValue > parsedInputMax) {
        const message = getMessage(input);
        errorBox.classList.remove('hidden');
        inputContainer.classList.add('invalid');
        errorBox.textContent = message;
        valid = false;
      } else {
        errorBox.classList.add('hidden');
      }
      inputContainer.classList.remove('invalid');
    }
  });

  if (valid) {
    form.querySelectorAll('.step')[currentTab].className += ' finish';
  }

  return valid;
}

/**
 * Display the calcResult to the front-end
 * @param {number} calcResult
 * @param {string} formId
 */
function appendCalcResultToDom(totalCost, totalPTO, formId) {
  const form = document.getElementById(formId);
  const costParagraph = form.querySelector('.total-cost');
  const ptoParagraph = form.querySelector('.total-pto');
  const formattedNum = totalCost.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (formattedNum.length === 10) {
    costParagraph.classList.add('fs-sm');
  } else if (formattedNum.length >= 11) {
    costParagraph.classList.add('fs-xs');
  }

  costParagraph.innerText = `${formattedNum}`;
  ptoParagraph.innerText = `${totalPTO} Paid Days Off`;
}

function calcTotal(compensationValues) {
  const total = compensationValues.reduce((prev, current) => prev + parseFloat(current), 0);

  return total;
}

/**
 * Handle form submission
 * @param {object} form
 */
function formSubmitHandler(form) {
  const baseSalary = form.elements.baseSalary.value;
  const commission = form.elements.commission.value;
  const medical = form.elements.medical.value;
  const dental = form.elements.dental.value;
  const vision = form.elements.vision.value;
  const hsa = form.elements.hsa.value;
  const fitness = form.elements.fitness.value;
  const retirement = form.elements.retirement.value;
  const annualBonus = form.elements.annualBonus.value;
  const stocks = form.elements.stocks.value;
  const signingBonus = form.elements.signingBonus.value;
  const professionalDevelopment = form.elements.professionalDevelopment.value;
  const tuition = form.elements.tuition.value;
  const charity = form.elements.charity.value;

  const holidays = form.elements.holidays.value;
  const vacation = form.elements.vacation.value;
  const sickDays = form.elements.sickDays.value;
  const volunteerDays = form.elements.volunteerDays.value;

  const compensationValues = [
    baseSalary,
    commission,
    hsa,
    medical,
    dental,
    vision,
    fitness,
    retirement,
    annualBonus,
    stocks,
    signingBonus,
    professionalDevelopment,
    tuition,
    charity,
  ];

  const totalCost = calcTotal(compensationValues);
  const totalPTO = calcTotal([holidays, vacation, sickDays, volunteerDays]);

  appendCalcResultToDom(totalCost, totalPTO, form.id);
}

function progressIndicator(index, form) {
  const stepsArr = form.querySelectorAll('.step');

  stepsArr.forEach((item) => {
    item.classList.remove('step-active');
  });

  stepsArr[index].classList.add('step-active');
}

function resetProgressIndicator(form) {
  const stepsArr = form.querySelectorAll('.step');

  stepsArr.forEach((item) => {
    item.classList.remove('step-active');
    item.classList.remove('finish');
  });
}

/**
 * Show the next form tab
 * @param {number} index
 * @param {object} form current active form
 */
function showTab(index, form) {
  const tabs = form.querySelectorAll('.tab');
  const nextBtn = form.querySelector('#nextBtn');
  const prevBtn = form.querySelector('#prev-btn');
  tabs[index].style.display = 'flex';

  if (index === tabs.length - 2) {
    nextBtn.setAttribute('type', 'submit');
    nextBtn.innerText = 'Calculate';
  } else {
    nextBtn.setAttribute('type', 'button');
    nextBtn.innerText = 'Next';
  }

  if (index === 0) {
    prevBtn.style.visibility = 'hidden';
  } else {
    prevBtn.style.visibility = 'visible';
  }
}

/**
 * Reset forms value
 * @param {object} block
 */
function resetForm(block) {
  const form = block.querySelector('form');
  const tabsArr = block.querySelectorAll('.tab');
  const navBtnArr = block.querySelectorAll('.navbtn-wrapper');
  const invalidFieldsArr = block.querySelectorAll('.field-item.invalid');
  const outputRangeArr = block.querySelectorAll('.range-value');
  const inputRangeArr = block.querySelectorAll('.input-range');
  const calcResults = block.querySelectorAll('.calc-result');
  currentTab = 0;

  calcResults.forEach((item) => {
    item.classList.remove('fs-xs', 'fs-sm');
  });

  form.classList.remove('active');
  form.querySelector('#nextBtn').innerText = 'Next';
  form.querySelector('#nextBtn').setAttribute('type', 'button');
  form.reset();
  resetProgressIndicator(form);

  invalidFieldsArr.forEach((item) => {
    item.classList.remove('invalid');
  });

  tabsArr.forEach((tab) => {
    tab.style.display = '';
  });

  navBtnArr.forEach((btn) => {
    btn.style.display = '';
  });

  outputRangeArr.forEach((item) => {
    item.style.left = `calc(0% + 8px)`;
    item.innerHTML = item.previousSibling.min;
  });

  inputRangeArr.forEach((item) => {
    item.style = `--percent:calc(0% + 8px)`;
  });

  showTab(currentTab, block);
  progressIndicator(currentTab, form);
}

/**
 * Handle next and prev buttons behavior
 * @param {number} index
 * @param {object} form
 */
function nextPrev(index, form) {
  const tabsArr = form.querySelectorAll('.tab');
  const navBtn = form.querySelector('.navbtn-wrapper');

  if (index === 1 && !validateForm(form)) return;

  tabsArr[currentTab].style.display = 'none';

  currentTab += index;

  if (currentTab < 0) {
    resetForm(navBtn.parentElement.parentElement);
  }

  if (currentTab >= tabsArr.length - 1) {
    formSubmitHandler(form);
    navBtn.style.display = 'none';
  }

  showTab(currentTab, form);
  progressIndicator(currentTab, form);
}

function createCalcResultHtml() {
  const divWrapper = document.createElement('div');
  divWrapper.classList.add('tab');

  const contentHtml = `<div class="result-wrapper">
	<div class="result-left">
	<p class="calc-result total-cost"></p>
	<p class="calc-result total-pto"></p>
	<p>Is the estimated total annual compensation.</p>
	<button type="button" class="reset-calc-btn">Calculate Again</button>
	</div>
	<div class="result-right">
	<div class="result-right-text">
	<p>Get the right HR software to build for the future</p>
	<a class="button accent" href="/hr-software/video-tour">Video Product Tour</a>
	</div>
	</div>
	</div>`;

  divWrapper.innerHTML = contentHtml;

  return divWrapper;
}

function createNavBtn() {
  const fieldWrapper = document.createElement('div');
  fieldWrapper.classList.add('navbtn-wrapper');

  const buttons = `<button type="button" id="prev-btn">Back</button>
    <button type="button" id="nextBtn">Next</button>`;

  fieldWrapper.innerHTML = buttons;

  return fieldWrapper;
}

function setRangeValueBubble(rangeValue, rangeValueBubble) {
  const val = rangeValue.value;
  const min = rangeValue.min ? rangeValue.min : 0;
  const max = rangeValue.max ? rangeValue.max : 100;
  const newVal = Number(((val - min) * 100) / (max - min));
  rangeValueBubble.innerHTML = formatNumber(val);

  rangeValueBubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
  rangeValue.style = `--percent:calc(${newVal}% + (${8 - newVal * 0.15}px))`;
}

function createRangeInputIndicator() {
  const output = document.createElement('output');
  output.classList.add('range-value');

  return output;
}

function createRangeInput(type, options, field) {
  const input = document.createElement('input');
  input.classList.add('input-range');
  const [minValue, maxValue, step] = options.split('|');
  input.type = type;
  input.id = field;
  input.setAttribute('value', 0);
  input.min = minValue.trim();
  input.max = maxValue.trim();

  if (step) {
    input.setAttribute('step', step.trim());
  }

  return input;
}

function addMinMaxLabels(el, icon) {
  const inputField = el.querySelector('input');
  const labelElement = createElem('div', 'range-container');

  const rangeMinMaxHtml = `<div class="range-min">${icon ? '$' : ''}${formatNumber(
    inputField.min
  )}</div>
	<div class="range-max">${icon ? '$' : ''}${formatNumber(inputField.max)}</div>`;
  labelElement.innerHTML = rangeMinMaxHtml;
  inputField.insertAdjacentElement('beforebegin', labelElement);
}

function addDescription(el, descriptionText) {
  const labelField = el.querySelector('label');
  if (descriptionText) {
    const descriptionElement = createElem('p', 'description-text');

    descriptionElement.textContent = descriptionText;
    labelField.insertAdjacentElement('afterend', descriptionElement);
  }
}

function createErrorBox(el) {
  const inputField = el.querySelector('input');
  const errorBox = document.createElement('div');
  errorBox.classList.add('error', 'hidden');
  const message = getMessage(inputField);
  errorBox.textContent = message;

  inputField.insertAdjacentElement('afterend', errorBox);
}

function addIcon(el, icon) {
  const inputField = el.querySelector('input');

  if (icon) {
    const descriptionElement = createElem('i', 'icon-dollar');

    inputField.insertAdjacentElement('afterend', descriptionElement);
  }
}

function createFields(fields) {
  const fieldWrapper = document.createElement('div');
  fieldWrapper.classList.add('tab');
  fields.forEach((item) => {
    const { Field, Type, Options, Tooltip, Icon, Description } = item;
    const divFieldItem = document.createElement('div');
    divFieldItem.classList.add('field-item');

    switch (Type) {
      case 'range':
        divFieldItem.classList.add('field-item-range');
        divFieldItem.append(createLabel(item));
        addDescription(divFieldItem, Description);
        divFieldItem.append(createRangeInput(Type, Options, Field));
        addMinMaxLabels(divFieldItem, Icon);
        divFieldItem.append(createRangeInputIndicator());
        break;
      case 'formular':
        return;
      default:
        divFieldItem.append(createLabel(item));
        addDescription(divFieldItem, Description);
        divFieldItem.append(createInput(item));
        createErrorBox(divFieldItem);
        addIcon(divFieldItem, Icon);
    }

    // Add Tooltip HTML if field label has tooltip description
    if (Tooltip) {
      const label = divFieldItem.querySelector('label');
      const tooltipHtml = `<div class="tooltip"><span class="tooltip-text">${Tooltip}</span></div>`;
      label.insertAdjacentHTML('beforeend', tooltipHtml);
    }

    // Add CSS class has-icon if field need to display dollar symbol $
    if (Icon) {
      divFieldItem.classList.add('has-icon');
    }

    // Set min and max value for number fields
    if (Type === 'number') {
      const inputField = divFieldItem.querySelector('input');
      inputField.setAttribute('min', 0);
      inputField.setAttribute('max', 1000000);
    }

    fieldWrapper.append(divFieldItem);
  });
  return fieldWrapper;
}

// Individual form
function createForm(fields) {
  // Create form element
  const form = createElem('form');
  const div = createElem('div', 'progress-bar');

  // Setup form attributes
  form.setAttribute('id', 'form');
  form.setAttribute('method', 'POST');

  // Grouping fields into different tab
  const grouped = fields.reduce((acc, obj) => {
    const key = obj.Tab;
    if (key === '') return acc;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  // eslint-disable-next-line
  for (const group in grouped) {
    form.append(createFields(grouped[group]));
  }

  form.append(createCalcResultHtml());
  form.append(createNavBtn());
  form.append(div);

  const tabsArr = form.querySelectorAll('.tab');

  tabsArr.forEach(() => {
    div.append(createProgressIndicatorHtml());
  });

  // Select prevBtn and nextBtn
  const btnArr = form.querySelectorAll('button');

  btnArr.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.id === 'nextBtn') {
        nextPrev(1, form);
      }

      if (e.target.id === 'prev-btn') {
        nextPrev(-1, form);
      }
    });
  });

  form.classList.add('active');

  tabsArr.forEach((item, index) => {
    if (Object.is(tabsArr.length - 1, index)) {
      // add class last-tab to the last tab div
      item.classList.add('last-tab');
    }
  });

  showTab(currentTab, form);
  progressIndicator(currentTab, form);

  return form;
}

export default async function decorate(block) {
  const data = await fetchData(jsonUrl);

  data.forEach((item) => {
    formFields.push(item);
  });

  block.append(createForm(formFields));

  const resetBtnArr = block.querySelectorAll('.reset-calc-btn');
  const rangeInputsArr = block.querySelectorAll('.field-item-range');

  resetBtnArr.forEach((btn) => {
    btn.addEventListener('click', () => {
      resetForm(block);
    });
  });

  rangeInputsArr.forEach((item) => {
    const inputRangeField = item.querySelector('.input-range');
    const rangeValueBubble = item.querySelector('.range-value');

    inputRangeField.addEventListener('input', () => {
      setRangeValueBubble(inputRangeField, rangeValueBubble);
    });

    setRangeValueBubble(inputRangeField, rangeValueBubble);
  });
}
