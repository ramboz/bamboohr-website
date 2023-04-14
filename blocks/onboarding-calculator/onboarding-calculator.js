import { createElem } from '../../scripts/scripts.js';
import { createLabel, createInput } from '../form/form.js';

let currentTab = 0
let totalCost = 0
const jsonUrl = '/website-marketing-resources/roi-calculator-form.json'

const organisationForm = []
const individualForm = []

async function fetchData(url) {
	const resp = await fetch(url);
	const json = await resp.json()
	const {data} = json

	return data
}

function calcOrganisationCost() {
	console.log('calcOrganisationCost');
	totalCost = 20
	console.log(totalCost);
}

function calcIndividualCost() {
	console.log('calcIndividualCost');
	totalCost = 20
	console.log(totalCost);
}

function formSubmitHandler(form) {
	if (form.id === 'organisation-form') {
		const avgAnnualEmployeeSalary = form.elements.avgAnnualEmployeeSalary.value
		const avgOnboardHours = form.elements.avgOnboardHours.value
		const avgAdditionalCosts = form.elements.avgAdditionalCosts.value
		const newEmployeesPerYear = form.elements.newEmployeesPerYear.value

		calcIndividualCost()
	}

	if (form.id === 'individual-form') {
		const newEmployeeSalary = form.elements.newEmployeeSalary.value
		const hoursSpendOnOnboarding = form.elements.hoursSpendOnOnboarding.value
		const hrSalaryForOnboardingTasks = form.elements.hrSalaryForOnboardingTasks.value
		const hrHoursSpentOnboarding = form.elements.hrHoursSpentOnboarding.value
		const salarayManagerNewEmployee = form.elements.salarayManagerNewEmployee.value
		const managerHoursSpentOnboarding = form.elements.managerHoursSpentOnboarding.value
		const newEmployeeRelocationCost = form.elements.newEmployeeRelocationCost.value
		const workstationCost = form.elements.workstationCost.value
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