import { createElem } from '../../scripts/scripts.js';
import { createLabel, createInput } from '../form/form.js';

let currentTab = 0
const jsonUrl = '/website-marketing-resources/roi-calculator-form.json'

const organisationForm = []
const individualForm = []

async function fetchData(url) {
	const resp = await fetch(url);
	const json = await resp.json()
	const {data} = json

	return data
}

function createProgressIndicatorHtml() {
	const spanHtml = createElem('span', 'step')

	return spanHtml
}

function validateForm(form) {
	let valid = true
	const tabsArr = form.querySelectorAll('.tab')
	const activeTab = tabsArr[currentTab].querySelectorAll('input')

	activeTab.forEach(input => {
		if (input.value === '') {
			const inputContainer = input.parentElement
			inputContainer.classList.add('invalid')
			valid = false
		}
	})

	if (valid) {
		form.querySelectorAll('.step')[currentTab].className += " finish";
	}
	
	return valid
}

/**
 * Display the calcResult to the front-end
 * @param {number} calcResult 
 * @param {string} formId 
 */
function appendCalcResultToDom(calcResult, formId) {
	const form = document.getElementById(formId)
	const resultDiv = form.querySelector('#calc-result')

	resultDiv.innerText = `$${calcResult}`
}

/**
 * Gets Options value from the form
 * Create an object array using the field name and option value
 * @param {array} form contains fields data
 * @returns 
 */
function getFormular(form) {
	const formularArr = form.reduce((acc, obj) => {
		if (obj.Type === 'formular') {
			const key = obj.Field;
			if (!acc[key]) {
				acc[key] = obj.Options
			}
		}
		return acc;
	}, []);

	return formularArr
}

/**
 * Calculate total anuual onboarding costs for organisation
 * @param {object} onboardingData data from form fields
 * @returns 
 */
function calcOrganisationCost(onboardingData) {
	const {avgAnnualEmployeeSalary, avgOnboardHours, avgAdditionalCosts, newEmployeesPerYear} = onboardingData
	const {workingHoursPerYear} = getFormular(organisationForm)

	/**
	 * Average hourly rate(hourly rate)
	 * Average employee salary / working hours per year
	 */
	const avgHourlyRate = (avgAnnualEmployeeSalary / workingHoursPerYear).toFixed(2)

	/**
	 * Onboarding hours cost
	 * Average hourly rate x average hours needed to onboard new employee
	 */
	const onboardingHoursCost = parseFloat(avgHourlyRate * avgOnboardHours).toFixed(2)

	/**
	 * Total annual onboarding costs
	 * Onboarding hours cost + average additional costs x number of new employees per year
	 */
	const i = (parseFloat(onboardingHoursCost) + parseFloat(avgAdditionalCosts)).toFixed(2)

	const totalAnuualOnboardingCosts = parseFloat(i * newEmployeesPerYear)

	return totalAnuualOnboardingCosts.toFixed(0)
}

/**
 * Calculate the total costs of onboarding an employee
 * @param {object} employeeOnboardingData data from form fields
 * @returns 
 */
function calcIndividualCost(employeeOnboardingData) {
	const {newEmployeeSalary, newEmployeeHoursSpendOnboarding, hrStaffSalaryForOnboardingTasks, hrHoursSpentOnboardingProcess, salarayManagerOfNewEmployee, managerHoursSpentOnboarding, newEmployeeRelocationCost, workstationCost} = employeeOnboardingData
	const {workingHoursPerYear} = getFormular(organisationForm)

	/**
	 * HR salary(per hour)
	 * hrStaffSalaryForOnboardingTasks / yearly working hours = HR salary(per hour)
	 */
	const hrSalaryperHour = parseFloat((hrStaffSalaryForOnboardingTasks / workingHoursPerYear).toFixed(2))
	
	/**
	 * Manager Salary(per hour)
	 * salarayManagerOfNewEmployee / yearly working hours = Manager Salary(per hour)
	 */
	const managerSalaryPerHour = parseFloat((salarayManagerOfNewEmployee / workingHoursPerYear).toFixed(2))

	/**
	 * Employee Salary(per hour)
	 * newEmployeeSalary / yearly working hours = Employee Salary(per hour)
	 */
	const employeeSalaryPerHour = parseFloat(newEmployeeSalary / workingHoursPerYear).toFixed(2)

	/**
	 * Total HR Onboarding Hour Cost
	 * HR salary * hrHoursSpentOnboardingProcess
	 */
	const totalHrOnboardingHourCost = parseFloat((hrSalaryperHour * hrHoursSpentOnboardingProcess).toFixed(2))

	/**
	 * Total Manager Hour Cost
	 * Manager Salary * managerHoursSpentOnboarding
	 */
	const totalManagerHourCost = parseFloat((managerSalaryPerHour * managerHoursSpentOnboarding).toFixed(2))

	/**
	 * Total Employee Onboarding Hour Cost
	 * Employee Salary * newEmployeeHoursSpendOnboarding
	 */
	const totalEmployeeOnboardingHourCost = parseFloat((employeeSalaryPerHour * newEmployeeHoursSpendOnboarding).toFixed(2))

	/**
	 * Final cost of new employee
	 * (Total HR Onboarding Hour Cost + Total Manager Hour Cost + Total Employee Onboarding Hour Cost) + newEmployeeRelocationCost + workstationCost
	 */
	const finalCostOfNewEmployee = (totalHrOnboardingHourCost + totalManagerHourCost + totalEmployeeOnboardingHourCost) + parseFloat(newEmployeeRelocationCost) + parseFloat(workstationCost)

	return finalCostOfNewEmployee
}

/**
 * Handle form submission
 * @param {object} form 
 */
function formSubmitHandler(form) {
	if (form.id === 'organisation-form') {
		const avgAnnualEmployeeSalary = form.elements.avgAnnualEmployeeSalary.value
		const avgOnboardHours = form.elements.avgOnboardHours.value
		const avgAdditionalCosts = form.elements.avgAdditionalCosts.value
		const newEmployeesPerYear = form.elements.newEmployeesPerYear.value

		const organisationOnboardingData = {avgAnnualEmployeeSalary, avgOnboardHours, avgAdditionalCosts, newEmployeesPerYear}
		const totalAnuualOnboardingCosts = calcOrganisationCost(organisationOnboardingData)
		
		appendCalcResultToDom(totalAnuualOnboardingCosts, form.id)
	}

	if (form.id === 'individual-form') {
		const newEmployeeSalary = form.elements.newEmployeeSalary.value
		const newEmployeeHoursSpendOnboarding = form.elements.newEmployeeHoursSpendOnboarding.value
		const hrStaffSalaryForOnboardingTasks = form.elements.hrStaffSalaryForOnboardingTasks.value
		const hrHoursSpentOnboardingProcess = form.elements.hrHoursSpentOnboardingProcess.value
		const salarayManagerOfNewEmployee = form.elements.salarayManagerOfNewEmployee.value
		const managerHoursSpentOnboarding = form.elements.managerHoursSpentOnboarding.value
		const newEmployeeRelocationCost = form.elements.newEmployeeRelocationCost.value
		const workstationCost = form.elements.workstationCost.value

		const employeeOnboardingData = {newEmployeeSalary, newEmployeeHoursSpendOnboarding, hrStaffSalaryForOnboardingTasks, hrHoursSpentOnboardingProcess, salarayManagerOfNewEmployee, managerHoursSpentOnboarding, newEmployeeRelocationCost, workstationCost}

		const totalEmployeeOnboardingCosts = calcIndividualCost(employeeOnboardingData)

		appendCalcResultToDom(totalEmployeeOnboardingCosts, form.id)
	}
}

function progressIndicator(index, form) {
	const stepsArr = form.querySelectorAll(".step");

	stepsArr.forEach(item => {
		item.classList.remove('step-active')
	})

	stepsArr[index].classList.add('step-active')
}

/**
 * Show the next form tab
 * @param {number} index 
 * @param {object} form current active form
 */
function showTab(index, form) {
	const tabs = form.querySelectorAll('.tab')
	tabs[index].style.display = 'flex'

	if (index === (tabs.length - 2)) {
		form.querySelector('#nextBtn').innerText = 'Calculate'
	}
}

/**
 * Reset forms value
 * @param {object} block 
 */
function resetForm(block) {
	const formsArr = block.querySelectorAll('form')
	const tabsArr = block.querySelectorAll('.tab')
	const navBtnArr = block.querySelectorAll('.navBtn-wrapper')
	const invalidFieldsArr = block.querySelectorAll('.field-item.invalid')
	const outputRangeArr = block.querySelectorAll('.range-value')
	const inputRangeArr = block.querySelectorAll('.input-range')
	const contentElement = block.querySelector('.onboarding-calculator__content')
	currentTab = 0
	
	contentElement.style.display = ''

	formsArr.forEach(form => {
		form.classList.remove('active')
		form.querySelector('#nextBtn').innerText = 'Next'
		form.reset()
	});

	invalidFieldsArr.forEach(item => {
		item.classList.remove('invalid')
	});

	tabsArr.forEach(tab => {
		tab.style.display = ''
	});

	navBtnArr.forEach(btn => {
		btn.style.display = ''
	});

	outputRangeArr.forEach(item => {
		item.style.left = `calc(0% + 8px)`;
		item.innerHTML = item.previousSibling.min
	})

	inputRangeArr.forEach(item => {
		item.style = `--percent:calc(0% + 8px)`;
	})

	showTab(currentTab, block)
}

/**
 * Handle next and prev buttons behaviour
 * @param {number} index 
 * @param {object} form 
 */
function nextPrev(index, form) {
	const tabsArr = form.querySelectorAll('.tab')
	const navBtn = form.querySelector('.navBtn-wrapper')

	if (index === 1 && !validateForm(form)) return;

	tabsArr[currentTab].style.display ='none'

	currentTab += index

	if (currentTab < 0) {
		resetForm(navBtn.parentElement.parentElement)
	}

	if (currentTab >= (tabsArr.length - 1)) {
		formSubmitHandler(form)
		navBtn.style.display ='none'
	}

	showTab(currentTab, form)
	progressIndicator(currentTab, form)
}

function createCalcResultHtml() {
	const divWrapper = document.createElement('div')
	divWrapper.classList.add('tab')

	const contentHtml = `<div class="result__wrapper">
	<div class="result__left">
	<p id="calc-result"></p>
	<p>Is the estimated cost of onboarding this new employee.</p>
	<button type="button" class="reset-calc-btn">Calculate Again</button>
	</div>
	<div class="result__right">
	<div class="result__right-text">
	<p>Get the right HR software to build for the future</p>
	<a class="button accent" href="/hr-software/video-tour">Video Product Tour</a>
	</div>
	</div>
	</div>`

	divWrapper.innerHTML = contentHtml

	return divWrapper
}

function createNavBtn() {
	const fieldWrapper = document.createElement('div')
	fieldWrapper.classList.add('navBtn-wrapper')

	const btns = `<button type="button" id="prevBtn">Back</button>
    <button type="button" id="nextBtn">Next</button>`

	fieldWrapper.innerHTML = btns

	return fieldWrapper
}

function formatNumber(num) {
	if (num > 1000) {
		const abbreviated = `${num / 1000}k`;
		return abbreviated;
	}
	return num;
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
	const output = document.createElement('output')
	output.classList.add('range-value')

	return output
}

function createRangeInput(type, options, field) {
	const input = document.createElement('input');
	input.classList.add('input-range')
	const [minValue, maxValue, step] = options.split('|')
	input.type = type;
	input.id = field
	input.setAttribute('value', 0)
	input.min = minValue.trim()
	input.max = maxValue.trim()

	if (step) {
		input.setAttribute('step', step.trim())
	}

	return input
}

function addMinMaxLabels(el, displayCurrency) {
	const inputField = el.querySelector('input');
	const labelElement = createElem('div', 'range-container');

	const rangeMinMaxHtml = `<div class="range-min">${displayCurrency ? '$' : ''}${formatNumber(inputField.min)}</div>
	<div class="range-max">${displayCurrency ? '$' : ''}${formatNumber(inputField.max)}</div>`
	labelElement.innerHTML = rangeMinMaxHtml
	inputField.insertAdjacentElement('beforebegin', labelElement)
}

function addDescribtion(el, descriptionText) {
	const labelField = el.querySelector('label');
	if (descriptionText) {
		const descriptionElement = createElem('p', 'description-text');

		descriptionElement.textContent = descriptionText
		labelField.insertAdjacentElement('afterend', descriptionElement)
	}
}

function createFields(fields) {
	const fieldWrapper = document.createElement('div')
	fieldWrapper.classList.add('tab')
	fields.forEach(item => {
		const {Field, Type, Options, Tooltip, Currency, Description} = item
		const divFieldItem = document.createElement('div')
		divFieldItem.classList.add('field-item')
	
		switch (Type) {
			case 'range': 
				divFieldItem.classList.add('field-item__range')
				divFieldItem.append(createLabel(item))
				addDescribtion(divFieldItem, Description)
				divFieldItem.append(createRangeInput(Type, Options, Field))
				addMinMaxLabels(divFieldItem, Currency)
				divFieldItem.append(createRangeInputIndicator())
			break;
			case 'formular':
				return
			default:
				divFieldItem.append(createLabel(item))
				addDescribtion(divFieldItem, Description)
				divFieldItem.append(createInput(item))
		}

		if (Tooltip) {
			const label = divFieldItem.querySelector('label')
			const tooltipHtml = `<div class="tooltip"><span class="tooltip__text">${Tooltip}</span></div>`
			label.insertAdjacentHTML('beforeend', tooltipHtml);
		}

		fieldWrapper.append(divFieldItem)
	})
	return fieldWrapper
}

// Individual form
function createIndividualForm(fields) {
	// Create form element
	const form = createElem('form',)
	const div = createElem('div', 'progress-bar')

	// Setup form attributes
	form.setAttribute('id', 'individual-form')
	form.classList.add('d-none')

	// Grouping fields into different tab
	const grouped = fields.reduce((acc, obj) => {
		const key = obj.Tab;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(obj);
		return acc;
	}, {});

	// eslint-disable-next-line 
	for (const group in grouped) {
		form.append(createFields(grouped[group]))
	}

	form.append(createCalcResultHtml())
	form.append(createNavBtn())
	form.append(div)
	
	const tabsArr = form.querySelectorAll('.tab')
	
	tabsArr.forEach(() => {
		div.append(createProgressIndicatorHtml())
	})

	// Select prevBtn and nextBtn
	const btnArr = form.querySelectorAll('button')

	btnArr.forEach(btn => {
		btn.addEventListener('click', e => {
			if (e.target.id === 'nextBtn') {
				nextPrev(1, form)
			}

			if (e.target.id === 'prevBtn') {
				nextPrev(-1, form)
			}
		})
	});
	
	return form
}

// Orgnaisation form
function createOrganisationForm(fields) {
	// Create form element
	const form = createElem('form',)
	const div = createElem('div', 'progress-bar')

	// Setup form attributes
	form.setAttribute('id', 'organisation-form')
	form.classList.add('d-none')

	form.append(createFields(fields))
	form.append(createCalcResultHtml())
	form.append(createNavBtn())
	form.append(div)

	const tabsArr = form.querySelectorAll('.tab')

	tabsArr.forEach(() => {
		div.append(createProgressIndicatorHtml())
	})

	// Select prevBtn and nextBtn
	const btnArr = form.querySelectorAll('button')

	btnArr.forEach(btn => {
		btn.addEventListener('click', e => {
			if (e.target.id === 'nextBtn') {
				nextPrev(1, form)
			}

			if (e.target.id === 'prevBtn') {
				nextPrev(-1, form)
			}
		})
	});
	
	return form
}

function toggleForm(formId) {
	const form = document.getElementById(formId)
	const tabs = form.querySelectorAll('.tab')
	form.classList.add('active')

	tabs.forEach((item, index) => {
		if (Object.is(tabs.length - 1, index)) {
			// add class last-tab to the last tab div
			item.classList.add('last-tab')
		}
	});

	showTab(currentTab, form)
	progressIndicator(currentTab, form)
}

function createCtaContainer() {
	// Create elements
	const ctaContainer = createElem('div', 'form-cta-container');
	const indidualBtn = createElem('button')
	const organisationBtn = createElem('button')

	// Setup btn inner text
	indidualBtn.innerText = 'Individually'
	organisationBtn.innerText = 'Organisation'

	// Setup btn attributes
	Object.assign(indidualBtn, {
		classList: ['button accent'],
		type: 'button',
		title: 'Employee'
	})
	Object.assign(organisationBtn, {
		classList: ['button accent'],
		type: 'button',
		title: 'Organization'
	})

	indidualBtn.setAttribute('data-form', 'individual-form')
	organisationBtn.setAttribute('data-form', 'organisation-form')

	ctaContainer.append(indidualBtn, organisationBtn)

	// Click event for buttons
	ctaContainer.addEventListener('click', (e) => {
		const grandparentContainer = ctaContainer.parentElement.parentElement
		grandparentContainer.style.display = 'none'

		const id = e.target.dataset.form
		if (id) {
			toggleForm(id)
		}
	})

	return ctaContainer
}

export default async function decorate(block) {

	const data = await fetchData(jsonUrl)
	const firstDiv = block.firstElementChild

	Object.assign(firstDiv, {
		classList: ['onboarding-calculator__content'],
		id: 'roi-intro',
	})

	// Sort fields for each form
	data.forEach(item => {
		if (item.form === "Organisation") {
			organisationForm.push(item)
		}

		if (item.form === "Individual") {
			individualForm.push(item)
		}
	});
	
	const cols = [...block.firstElementChild.children]
	// 1st collumn
	cols[0].classList.add('onboarding-calculator__content-left')
	// 2nd collumn
	cols[1].classList.add('onboarding-calculator__content-right')

	cols[1].append(createCtaContainer())
	block.append(createOrganisationForm(organisationForm), createIndividualForm(individualForm))

	const resetBtnArr = block.querySelectorAll('.reset-calc-btn')
	const rangeInputsArr = block.querySelectorAll(".field-item__range");

	resetBtnArr.forEach(btn => {
		btn.addEventListener('click', () => {
			resetForm(block)
		})
	})

	rangeInputsArr.forEach(item => {
		const inputRangeField = item.querySelector(".input-range");
		const rangeValueBubble = item.querySelector(".range-value");

		inputRangeField.addEventListener("input", () => {
			setRangeValueBubble(inputRangeField, rangeValueBubble);
		})
		setRangeValueBubble(inputRangeField, rangeValueBubble);
	})
}