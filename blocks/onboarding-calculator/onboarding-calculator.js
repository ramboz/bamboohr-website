import { createElem } from '../../scripts/scripts.js';
import { createLabel, createInput } from '../form/form.js';

function nextPrev(index) {
	console.log(index);
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

	form.append(createNavBtn())
	
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
	form.append(createNavBtn())

	// Select prevBtn and nextBtn
	const btnArr = form.querySelectorAll('button')

	btnArr.forEach(btn => {
		btn.addEventListener('click', e => {
			if (e.target.id === 'nextBtn') {
				nextPrev(1)
			}

			if (e.target.id === 'prevBtn') {
				nextPrev(-1)
			}
		})
	});
	
	return form
}

// 
function toggleForm(formId) {
	const form = document.getElementById(formId)
	form.classList.add('active')
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
		'data-form': 'individual-form',
		title: 'Individually'
	})
	Object.assign(organisationBtn, {
		classList: ['button accent'],
		type: 'button',
		'data-form': 'organisation-form',
		title: 'Organisation'
	})

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

	const resp = await fetch('/website-marketing-resources/roi-calculator-form.json');
	const json = await resp.json()
	const map = json.data

	const organisationForm = []
	const individualForm = []

	// Sort fields for each form
	map.forEach(item => {
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

	block.append(createCtaContainer());
	block.append(createOrganisationForm(organisationForm), createIndividualForm(individualForm))
}