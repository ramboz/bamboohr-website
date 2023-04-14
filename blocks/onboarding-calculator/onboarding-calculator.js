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

/**
 * Display the calcResult to the front-end
 * @param {number} calcResult 
 * @param {string} formId 
 */
function appendCalcResultToDom(calcResult, formId) {
	const form = document.getElementById(formId)
	const resultDiv = form.querySelector('#calc-result')

	resultDiv.innerText = `$ ${calcResult}`
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

	const avgHourlyRate = (avgAnnualEmployeeSalary / workingHoursPerYear).toFixed(2)
	const onboardingHoursCost = (avgHourlyRate * avgOnboardHours).toFixed(2)
	const totalAnuualOnboardingCosts = ((onboardingHoursCost + avgAdditionalCosts) * newEmployeesPerYear).toFixed(0)

	return totalAnuualOnboardingCosts
}

function calcIndividualCost(employeeOnboardingData) {
	const {newEmployeeSalary, newEmployeeHoursSpendOnboarding, hrStaffSalaryForOnboardingTasks, hrHoursSpentOnboardingProcess, salarayManagerOfNewEmployee, managerHoursSpentOnboarding, newEmployeeRelocationCost, workstationCost} = employeeOnboardingData
	const {workingHoursPerYear} = getFormular(organisationForm)

	/**
	 * HR salary(per hour)
	 * hrStaffSalaryForOnboardingTasks / yearly working hours = HR salary(per hour)
	 */
	const hrSalaryperHour = (hrStaffSalaryForOnboardingTasks / workingHoursPerYear).toFixed(2)
	console.log(`hrSalaryperHour: ${hrSalaryperHour}`);
	
	/**
	 * Manager Salary(per hour)
	 * salarayManagerOfNewEmployee / yearly working hours = Manager Salary(per hour)
	 */
	const managerSalaryPerHour = (salarayManagerOfNewEmployee / workingHoursPerYear).toFixed(2)
	console.log(`managerSalaryPerHour: ${managerSalaryPerHour}`);

	/**
	 * Employee Salary(per hour)
	 * newEmployeeSalary / yearly working hours = Employee Salary(per hour)
	 */
	const employeeSalaryPerHour = (newEmployeeSalary / workingHoursPerYear).toFixed(2)
	console.log(`employeeSalaryPerHour: ${employeeSalaryPerHour}`);

	/**
	 * Total HR Onboarding Hour Cost
	 * HR salary * hrHoursSpentOnboardingProcess
	 */
	const totalHrOnboardingHourCost = (hrSalaryperHour * hrHoursSpentOnboardingProcess).toFixed(2)
	console.log(`totalHrOnboardingHourCost: ${totalHrOnboardingHourCost}`);

	/**
	 * Total Manager Hour Cost
	 * Manager Salary * managerHoursSpentOnboarding
	 */
	const totalManagerHourCost = (managerSalaryPerHour * managerHoursSpentOnboarding).toFixed(2)
	console.log(`totalManagerHourCost: ${totalManagerHourCost}`);

	/**
	 * Total Employee Onboarding Hour Cost
	 * Employee Salary * newEmployeeHoursSpendOnboarding
	 */
	const totalEmployeeOnboardingHourCost = (employeeSalaryPerHour * newEmployeeHoursSpendOnboarding).toFixed(2)
	console.log(`totalEmployeeOnboardingHourCost: ${totalEmployeeOnboardingHourCost}`);

	console.log(`newEmployeeRelocationCost: ${newEmployeeRelocationCost}`);
	console.log(`workstationCost: ${workstationCost}`);

	/**
	 * Final cost of new employee
	 * (Total HR Onboarding Hour Cost + Total Manager Hour Cost + Total Employee Onboarding Hour Cost) + newEmployeeRelocationCost + workstationCost
	 */
	const finalCostOfNewEmployee = totalHrOnboardingHourCost + totalManagerHourCost + totalEmployeeOnboardingHourCost
	console.log(`finalCostOfNewEmployee: ${finalCostOfNewEmployee}`);

	/**
	 * TODO:
	 * Convert all values use to calculate finalCostOfNewEmployee to number. Return finalCostOfNewEmployee
	 */
}

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

		const employeeOnboardingData = {newEmployeeSalary, hoursSpendOnOnboarding, hrSalaryForOnboardingTasks, hrHoursSpentOnboarding, salarayManagerNewEmployee, managerHoursSpentOnboarding, newEmployeeRelocationCost, workstationCost}

		calcIndividualCost(employeeOnboardingData)
	}
}

function showTab(index, form) {
	const tabs = form.querySelectorAll('.tab')
	tabs[index].style.display = 'block'

	// if (index === (tabs.length - 1)) {
	// 	form.getElementById('nextBtn').innerText = 'Submit'
	// }
	// console.log(tabs.length);
	// console.log(index);
}

function resetForm(block) {
	const formsArr = block.querySelectorAll('form')
	const tabsArr = block.querySelectorAll('.tab')
	const navBtnArr = block.querySelectorAll('.navBtn-wrapper')
	currentTab = 0

	formsArr.forEach(form => {
		form.classList.remove('active')
		form.reset()
	});

	tabsArr.forEach(tab => {
		tab.style.display = ''
	});

	navBtnArr.forEach(btn => {
		btn.style.display = ''
	});

	showTab(currentTab, block)
}

function nextPrev(index, form) {
	const tabsArr = form.querySelectorAll('.tab')
	const secondToLastTab = tabsArr[tabsArr.length - 2];
	const navBtn = form.querySelector('.navBtn-wrapper')

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
}

function createCalcResultHtml() {
	const divWrapper = document.createElement('div')
	divWrapper.classList.add('tab')

	const contentHtml = `<div class="result__wrapper">
	<div class="result__left">
	<div id="calc-result"></div>
	<p>Is the estimated cost of onboarding this new employee.</p>
	<button type="button" class="reset-calc-btn">Calculate Again</button>
	</div>
	<div class="result__right">
	<p>Get the right HR software to build for the future</p>
	<a class="button accent" href="/hr-software/video-tour">Video Product Tour</a>
	</div>
	</div>`

	divWrapper.innerHTML = contentHtml

	return divWrapper
}

function createNavBtn() {
	const fieldWrapper = document.createElement('div')
	fieldWrapper.classList.add('navBtn-wrapper')

	const btns = `<button type="button" id="prevBtn">Previous</button>
    <button type="button" id="nextBtn">Next</button>`

	fieldWrapper.innerHTML = btns

	return fieldWrapper
}

function createRangeInput(type, options, field) {
	const input = document.createElement('input');
	const [minValue, maxValue] = options.split('|')
	input.type = type;
	input.id = field
	input.value = 0
	input.min = minValue.trim()
	input.max = maxValue.trim()

	return input
}

function createFields(fields) {
	const fieldWrapper = document.createElement('div')
	fieldWrapper.classList.add('tab')
	fields.forEach(item => {
		const {Field, Type, Options, Tooltip} = item
		const divFieldItem = document.createElement('div')
		divFieldItem.classList.add('field-item')

		if (Tooltip) {
			const tooltipHtml = `<div class="tooltip"><span class="tooltip__text">${Tooltip}</span></div>`
			divFieldItem.insertAdjacentHTML('beforeend', tooltipHtml);
		}
	
		switch (Type) {
			case 'range': 
				divFieldItem.append(createLabel(item))
				divFieldItem.append(createRangeInput(Type, Options, Field))
			break;
			case 'formular':
				return
			default:
				divFieldItem.append(createLabel(item))
				divFieldItem.append(createInput(item))
		}

		fieldWrapper.append(divFieldItem)
	})
	return fieldWrapper
}

// Individual form
function createIndividualForm(fields) {
	// Create form element
	const form = createElem('form',)

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

	showTab(currentTab, form)
	
	return form
}

// Orgnaisation form
function createOrganisationForm(fields) {
	// Create form element
	const form = createElem('form',)

	// Setup form attributes
	form.setAttribute('id', 'organisation-form')
	form.classList.add('d-none')

	form.append(createFields(fields))
	form.append(createCalcResultHtml())
	form.append(createNavBtn())

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

	showTab(currentTab, form)
	
	return form
}

function toggleForm(formId) {
	const form = document.getElementById(formId)
	form.classList.add('active')

	showTab(currentTab, form)
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
		title: 'Individually'
	})
	Object.assign(organisationBtn, {
		classList: ['button accent'],
		type: 'button',
		title: 'Organisation'
	})

	indidualBtn.setAttribute('data-form', 'individual-form')
	organisationBtn.setAttribute('data-form', 'organisation-form')

	ctaContainer.append(indidualBtn, organisationBtn)

	// Click event for buttons
	ctaContainer.addEventListener('click', (e) => {
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
	cols[0].classList.add('hello')
	// 2nd collumn
	cols[1].classList.add('hello-2')

	firstDiv.append(createCtaContainer())
	block.append(createOrganisationForm(organisationForm), createIndividualForm(individualForm))

	const resetBtnArr = document.querySelectorAll('.reset-calc-btn')

	resetBtnArr.forEach(btn => {
		btn.addEventListener('click', () => {
			resetForm(block)
		})
	});
}