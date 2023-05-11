import { createElem } from "../../scripts/scripts.js";

const firstName = sessionStorage.getItem('generator-firstName');
const secondName = sessionStorage.getItem('generator-secondName');
const businessName = sessionStorage.getItem('generator-businessName');

const formUrl = '/website-marketing-resources/offboarding-calculator-form.json'
let formsNameArr = null
let formsArr = null
let editFormID = "";
let selectedTemplate = ""

// Forms
const resignationAcknowledgementForm = []
const resignationAnnouncementForm = []
const exitInterviewForm = []
const returningEquipmentForm = []
const leavingConfirmationForm = []
const offboardingDismissalForm = []

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
  let output = '<div class="tooltip"><span>More information</span><div class="tooltip__text">' + content + '</div></div>';
  return output;
}

// Generate Input
function createInput(id, type, label, placeholder, value, tooltip) {
  const inputHtml = `<div>
  <label for="${id}">${label} ${tooltip ? createTooltip(tooltip) : ''}</label>
  <input type="${type}" id="${id}" ${placeholder ? `placeholder="${placeholder}"` : '' } ${value ? `value="${value}"` : ''} />
  </div>`

  return inputHtml;
}

function createSelect(id, label, options, tooltip) {
  const optionsHtml = options.map(item => `<option value="${item.formValue}">${item.formLabel}</option>`)

  const selectHTML = `<div class="template-options__wrapper">
  <label for="${id}"> ${label} ${tooltip ? createTooltip(tooltip) : ''}</label>
  <select id="${id}">${optionsHtml}</select>
  </div>`


  return selectHTML;
}

const countrySelect = '<div><label for="lead-country">Country</label><select id="lead-country" name="country"><option value="Afghanistan">Afghanistan</option><option value="Aland Islands">Aland Islands</option><option value="Albania">Albania</option><option value="Algeria">Algeria</option><option value="American Samoa">American Samoa</option><option value="Andorra">Andorra</option><option value="Angola">Angola</option><option value="Anguilla">Anguilla</option><option value="Antarctica">Antarctica</option><option value="Antigua and Barbuda">Antigua and Barbuda</option><option value="Argentina">Argentina</option><option value="Armenia">Armenia</option><option value="Aruba">Aruba</option><option value="Australia">Australia</option><option value="Austria">Austria</option><option value="Azerbaijan">Azerbaijan</option><option value="Bahamas">Bahamas</option><option value="Bahrain">Bahrain</option><option value="Bangladesh">Bangladesh</option><option value="Barbados">Barbados</option><option value="Belarus">Belarus</option><option value="Belgium">Belgium</option><option value="Belize">Belize</option><option value="Benin">Benin</option><option value="Bermuda">Bermuda</option><option value="Bhutan">Bhutan</option><option value="Bolivia">Bolivia</option><option value="Bonaire, Sint Eustatius and Saba">Bonaire, Sint Eustatius and Saba</option><option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option><option value="Botswana">Botswana</option><option value="Bouvet Island">Bouvet Island</option><option value="Brazil">Brazil</option><option value="British Indian Ocean Territory">British Indian Ocean Territory</option><option value="Brunei Darussalam">Brunei Darussalam</option><option value="Bulgaria">Bulgaria</option><option value="Burkina Faso">Burkina Faso</option><option value="Burundi">Burundi</option><option value="Cambodia">Cambodia</option><option value="Cameroon">Cameroon</option><option value="Canada">Canada</option><option value="Cape Verde">Cape Verde</option><option value="Cayman Islands">Cayman Islands</option><option value="Central African Republic">Central African Republic</option><option value="Chad">Chad</option><option value="Chile">Chile</option><option value="China">China</option><option value="Christmas Island">Christmas Island</option><option value="Cocos (Keeling) Islands">Cocos (Keeling) Islands</option><option value="Colombia">Colombia</option><option value="Comoros">Comoros</option><option value="Congo">Congo</option><option value="Congo, Democratic Republic of the Congo">Congo, Democratic Republic of the Congo</option><option value="Cook Islands">Cook Islands</option><option value="Costa Rica">Costa Rica</option><option value="Cote D\'Ivoire">Cote D\'Ivoire</option><option value="Croatia">Croatia</option><option value="Cuba">Cuba</option><option value="Curacao">Curacao</option><option value="Cyprus">Cyprus</option><option value="Czech Republic">Czech Republic</option><option value="Denmark">Denmark</option><option value="Djibouti">Djibouti</option><option value="Dominica">Dominica</option><option value="Dominican Republic">Dominican Republic</option><option value="Ecuador">Ecuador</option><option value="Egypt">Egypt</option><option value="El Salvador">El Salvador</option><option value="Equatorial Guinea">Equatorial Guinea</option><option value="Eritrea">Eritrea</option><option value="Estonia">Estonia</option><option value="Ethiopia">Ethiopia</option><option value="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</option><option value="Faroe Islands">Faroe Islands</option><option value="Fiji">Fiji</option><option value="Finland">Finland</option><option value="France">France</option><option value="French Guiana">French Guiana</option><option value="French Polynesia">French Polynesia</option><option value="French Southern Territories">French Southern Territories</option><option value="Gabon">Gabon</option><option value="Gambia">Gambia</option><option value="Georgia">Georgia</option><option value="Germany">Germany</option><option value="Ghana">Ghana</option><option value="Gibraltar">Gibraltar</option><option value="Greece">Greece</option><option value="Greenland">Greenland</option><option value="Grenada">Grenada</option><option value="Guadeloupe">Guadeloupe</option><option value="Guam">Guam</option><option value="Guatemala">Guatemala</option><option value="Guernsey">Guernsey</option><option value="Guinea">Guinea</option><option value="Guinea-Bissau">Guinea-Bissau</option><option value="Guyana">Guyana</option><option value="Haiti">Haiti</option><option value="Heard Island and Mcdonald Islands">Heard Island and Mcdonald Islands</option><option value="Holy See (Vatican City State)">Holy See (Vatican City State)</option><option value="Honduras">Honduras</option><option value="Hong Kong">Hong Kong</option><option value="Hungary">Hungary</option><option value="Iceland">Iceland</option><option value="India">India</option><option value="Indonesia">Indonesia</option><option value="Iran, Islamic Republic of">Iran, Islamic Republic of</option><option value="Iraq">Iraq</option><option value="Ireland">Ireland</option><option value="Isle of Man">Isle of Man</option><option value="Israel">Israel</option><option value="Italy">Italy</option><option value="Jamaica">Jamaica</option><option value="Japan">Japan</option><option value="Jersey">Jersey</option><option value="Jordan">Jordan</option><option value="Kazakhstan">Kazakhstan</option><option value="Kenya">Kenya</option><option value="Kiribati">Kiribati</option><option value="Korea, Democratic People\'s Republic of">Korea, Democratic People\'s Republic of</option><option value="Korea, Republic of">Korea, Republic of</option><option value="Kosovo">Kosovo</option><option value="Kuwait">Kuwait</option><option value="Kyrgyzstan">Kyrgyzstan</option><option value="Lao People\'s Democratic Republic">Lao People\'s Democratic Republic</option><option value="Latvia">Latvia</option><option value="Lebanon">Lebanon</option><option value="Lesotho">Lesotho</option><option value="Liberia">Liberia</option><option value="Libyan Arab Jamahiriya">Libyan Arab Jamahiriya</option><option value="Liechtenstein">Liechtenstein</option><option value="Lithuania">Lithuania</option><option value="Luxembourg">Luxembourg</option><option value="Macao">Macao</option><option value="Macedonia, the Former Yugoslav Republic of">Macedonia, the Former Yugoslav Republic of</option><option value="Madagascar">Madagascar</option><option value="Malawi">Malawi</option><option value="Malaysia">Malaysia</option><option value="Maldives">Maldives</option><option value="Mali">Mali</option><option value="Malta">Malta</option><option value="Marshall Islands">Marshall Islands</option><option value="Martinique">Martinique</option><option value="Mauritania">Mauritania</option><option value="Mauritius">Mauritius</option><option value="Mayotte">Mayotte</option><option value="Mexico">Mexico</option><option value="Micronesia, Federated States of">Micronesia, Federated States of</option><option value="Moldova, Republic of">Moldova, Republic of</option><option value="Monaco">Monaco</option><option value="Mongolia">Mongolia</option><option value="Montenegro">Montenegro</option><option value="Montserrat">Montserrat</option><option value="Morocco">Morocco</option><option value="Mozambique">Mozambique</option><option value="Myanmar">Myanmar</option><option value="Namibia">Namibia</option><option value="Nauru">Nauru</option><option value="Nepal">Nepal</option><option value="Netherlands">Netherlands</option><option value="Netherlands Antilles">Netherlands Antilles</option><option value="New Caledonia">New Caledonia</option><option value="New Zealand">New Zealand</option><option value="Nicaragua">Nicaragua</option><option value="Niger">Niger</option><option value="Nigeria">Nigeria</option><option value="Niue">Niue</option><option value="Norfolk Island">Norfolk Island</option><option value="Northern Mariana Islands">Northern Mariana Islands</option><option value="Norway">Norway</option><option value="Oman">Oman</option><option value="Pakistan">Pakistan</option><option value="Palau">Palau</option><option value="Palestinian Territory, Occupied">Palestinian Territory, Occupied</option><option value="Panama">Panama</option><option value="Papua New Guinea">Papua New Guinea</option><option value="Paraguay">Paraguay</option><option value="Peru">Peru</option><option value="Philippines">Philippines</option><option value="Pitcairn">Pitcairn</option><option value="Poland">Poland</option><option value="Portugal">Portugal</option><option value="Puerto Rico">Puerto Rico</option><option value="Qatar">Qatar</option><option value="Reunion">Reunion</option><option value="Romania">Romania</option><option value="Russian Federation">Russian Federation</option><option value="Rwanda">Rwanda</option><option value="Saint Barthelemy">Saint Barthelemy</option><option value="Saint Helena">Saint Helena</option><option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option><option value="Saint Lucia">Saint Lucia</option><option value="Saint Martin">Saint Martin</option><option value="Saint Pierre and Miquelon">Saint Pierre and Miquelon</option><option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option><option value="Samoa">Samoa</option><option value="San Marino">San Marino</option><option value="Sao Tome and Principe">Sao Tome and Principe</option><option value="Saudi Arabia">Saudi Arabia</option><option value="Senegal">Senegal</option><option value="Serbia">Serbia</option><option value="Serbia and Montenegro">Serbia and Montenegro</option><option value="Seychelles">Seychelles</option><option value="Sierra Leone">Sierra Leone</option><option value="Singapore">Singapore</option><option value="Sint Maarten">Sint Maarten</option><option value="Slovakia">Slovakia</option><option value="Slovenia">Slovenia</option><option value="Solomon Islands">Solomon Islands</option><option value="Somalia">Somalia</option><option value="South Africa">South Africa</option><option value="South Georgia and the South Sandwich Islands">South Georgia and the South Sandwich Islands</option><option value="South Sudan">South Sudan</option><option value="Spain">Spain</option><option value="Sri Lanka">Sri Lanka</option><option value="Sudan">Sudan</option><option value="Suriname">Suriname</option><option value="Svalbard and Jan Mayen">Svalbard and Jan Mayen</option><option value="Swaziland">Swaziland</option><option value="Sweden">Sweden</option><option value="Switzerland">Switzerland</option><option value="Syrian Arab Republic">Syrian Arab Republic</option><option value="Taiwan, Province of China">Taiwan, Province of China</option><option value="Tajikistan">Tajikistan</option><option value="Tanzania, United Republic of">Tanzania, United Republic of</option><option value="Thailand">Thailand</option><option value="Timor-Leste">Timor-Leste</option><option value="Togo">Togo</option><option value="Tokelau">Tokelau</option><option value="Tonga">Tonga</option><option value="Trinidad and Tobago">Trinidad and Tobago</option><option value="Tunisia">Tunisia</option><option value="Turkey">Turkey</option><option value="Turkmenistan">Turkmenistan</option><option value="Turks and Caicos Islands">Turks and Caicos Islands</option><option value="Tuvalu">Tuvalu</option><option value="Uganda">Uganda</option><option value="Ukraine">Ukraine</option><option value="United Arab Emirates">United Arab Emirates</option><option value="United Kingdom">United Kingdom</option><option value="United States" selected>United States</option><option value="United States Minor Outlying Islands">United States Minor Outlying Islands</option><option value="Uruguay">Uruguay</option><option value="Uzbekistan">Uzbekistan</option><option value="Vanuatu">Vanuatu</option><option value="Venezuela">Venezuela</option><option value="Viet Nam">Viet Nam</option><option value="Virgin Islands, British">Virgin Islands, British</option><option value="Virgin Islands, U.s.">Virgin Islands, U.s.</option><option value="Wallis and Futuna">Wallis and Futuna</option><option value="Western Sahara">Western Sahara</option><option value="Yemen">Yemen</option><option value="Zambia">Zambia</option><option value="Zimbabwe">Zimbabwe</option></select></div>';

// const employeeCount = ['10', '25', '50', '100', '500', '1000+'];
const employeeCount = [
  {
    formValue: 10,
    formLabel: 10
  },
  {
    formValue: 25,
    formLabel: 25
  },
  {
    formValue: 50,
    formLabel: 50
  },
  {
    formValue: 100,
    formLabel: 100
  },
  {
    formValue: 500,
    formLabel: 500
  },
  {
    formValue: '1000+',
    formLabel: '1000+'
  },
];

// Content Selection Template
function templateSelection(el, forms) {
  const selectHtml = createSelect('template-options', 'Choose your template', forms, 'Select template tooltip')
  const selectionHtml = `<div>${selectHtml}<button data-step="0" data-next class="button button--teal" id="select-template">Get started</button></div>`

  return selectionHtml;
}

// Content Input Shortcode Template
function templateFormWrapper() {
  const formHtml = `<form class="form-wrap" id="template-form"></form><nav><button data-step="1" data-prev class="button button--outline">Back</button><button data-step="1" data-next type="submit" class="button" id="populate-template">Next</button></nav>`

  return formHtml;
}

function getTemplatesTone(template) {
  const formattedTemplates = template.reduce((acc, item, index) => {
    const {TemplateFormal, TemplateFriendly, TemplateNeutral} = item
    
    if (TemplateFormal && TemplateFriendly && TemplateNeutral ) {
      const obj = {
        TemplateFormal: item.TemplateFormal,
        TemplateFriendly: item.TemplateFriendly,
        TemplateNeutral: item.TemplateNeutral
      }
      acc[index] = obj
    }
    return acc
  }, [])

  return formattedTemplates
}

// Tone Selection Shortcode Template
function templateTone(el) {
  const templates = formsArr.find(item => item.formValue = sessionStorage.getItem('generator-template'));
  const labelArr = ['Formal', 'Neutral', 'Friendly']
  const formatTemp = getTemplatesTone(templates)

  const divWrapper = createElem('div', 'tone-selection')
  const toneTemplateDiv = `<div class="tone-template"><div id="template-preview"></div></div><nav><button data-step="2" data-prev class="button button--outline">Back</button><button data-step="2" class="button" id="lead-gen">Get my template</button></nav>`

  const propertyNames = Object.keys(formatTemp[0]);
  
  const obj = labelArr.reduce((acc, label, index) => {
    acc[label] = propertyNames[index]
    return acc
  }, {})

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(obj) ) {
    const selected = value === 'TemplateFormal' ? 'checked' : null
    const inputHtml = `<input type="radio" name="select-tone" id="${value}" value="${value}" ${selected}/><label for="${value}">${key}</label>`
    divWrapper.insertAdjacentHTML('beforeend', inputHtml)
  }

  el.insertAdjacentHTML('afterend', toneTemplateDiv)

  return divWrapper
}

// Lead Gen Shortcode Template
function leadGenTemplate() {
  let output = '<form class="form-wrap" id="lead-gen">';
  output += createInput('lead-first-name', 'text', 'Your first name', 'Please enter your first name', firstName);
  output += createInput('lead-second-name', 'text', 'Your second name', 'Please enter your second name', secondName);
  output += createInput('lead-email', 'email', 'Email address', 'Please enter your email address', null);
  output += createInput('lead-title', 'text', 'Job title', 'Please enter your Job title', null);
  output += createInput('lead-business', 'text', 'Company name', 'Please enter your company name', businessName);
  output += createInput('lead-phone', 'tel', 'Phone Number', 'Please enter your phone number', null);
  output += countrySelect;
  output += createSelect('lead-employees', 'Employee Count ', employeeCount);
  output += '</form>';
  output += '<nav><button data-step="3" class="button button--teal" id="download-confirmed">Download my template</button></nav>';
  return output;
}

// Lead Gen Shortcode Template
function downloadConfirmed() {
  const output = `<div><a href="https://bamboohr.com/blog" class="button button--teal">Go to blog</a><button data-close data-step="4" class="button button--outline button--teal">Close and return to page</button></div>`

  return output;
}

// Generate Inputs
function generateInputs(template) {
  const output = template.map(item => {
    const {Field, Label, Placeholder, Tooltip, Type} = item
    return `${createInput(Field, Type, Label, Placeholder, null, Tooltip)}`
  }).join('')
  return output
}

// Next Step
function nextStep(el) {
  let current = parseInt(el.target.dataset.step);
  document.querySelector('[data-step="' + current + '"]').classList.remove('offboarding-generator-step--active');
  document.querySelector('[data-step="' + (++current) + '"]').classList.add('offboarding-generator-step--active');
}

// Previous Step
function prevStep(el) {
  let current = parseInt(el.target.dataset.step);
  document.querySelector('[data-step="' + current + '"]').classList.remove('offboarding-generator-step--active');
  document.querySelector('[data-step="' + (--current) + '"]').classList.add('offboarding-generator-step--active');   
}

function nextBtnHandler(el) {
  el.querySelector('#populate-template').addEventListener('click', (e) => {
    e.preventDefault()
    const form = el.querySelector('#template-form')
    const inputFields = form.querySelectorAll('input')
    editFormID = form.dataset.form;

    const values = Object.values(inputFields).reduce((acc, item) => {
      acc[item.id] = item.value
      return acc
    }, [])

    const propertyNames = Object.keys(values)

    propertyNames.forEach(item => {
      const input = el.querySelector(`#${item}`);
      if(input && input.value !== null) {
        sessionStorage.setItem(`generator-${item}`, input.value);
      }
    })

    editSessionStorage(editFormID, values)
    nextStep(e);
  });
}

function radioBtnHandler(el) {
  // Store tone selection
  const toneSelection = el.querySelectorAll('input[type=radio][name="select-tone"]');
  toneSelection.forEach(radio => radio.addEventListener('change', () => {
    const tone = radio.value;
    sessionStorage.setItem('generator-tone', tone);
    const template = sessionStorage.getItem('generator-template');
    const templates = formsArr.find(item => item.formValue === template);
    const formatTemp = getTemplatesTone(templates)
  
    el.querySelector('#template-preview').innerHTML = formatTemp[0][tone];
  }));
}

function templateSelectHandler(el) {
  el.querySelector('#select-template').addEventListener('click', (e) => {
    selectedTemplate = el.querySelector('#template-options').value;
    const templatePreview = el.querySelector('#template-preview')
    const formTemplate = el.querySelector('#template-form')
    const templates = formsArr.find(item => item.formValue === selectedTemplate);
    const formatTemp = getTemplatesTone(templates)
    // document.getElementById('template-preview').innerHTML = formatTemp[0][sessionStorage.getItem('generator-tone')];
    formTemplate.innerHTML = generateInputs(templates);
    formTemplate.setAttribute('data-form', selectedTemplate)
    // sessionStorage.setItem('generator-template', selectedTemplate);
    addToSessionStorage(selectedTemplate, templates);
    templatePreview.innerHTML = formatTemp[0].TemplateFormal

    nextStep(e);
  });
}

export default async function decorate(block) {
  
  const data = await fetchData(formUrl)

  // Set template defaults
  sessionStorage.setItem('generator-template', 'resignation-letter-acknowledgement');
  sessionStorage.setItem('generator-tone', 'TemplateFormal');

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

  const stepOne = document.querySelector('.offboarding-generator-step[data-step="0"]');
  let stepOneContent = stepOne.innerHTML;
  stepOne.innerHTML = stepOneContent + svgOne;

  document.querySelectorAll('.offboarding-generator-step--overlay').forEach((el) => {
    let content = el.innerHTML;
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
        item.innerHTML = leadGenTemplate();
        break;
      case '[generator-download-confirmed]':
        item.innerHTML = downloadConfirmed();
        break;
      default:
        // do nothing none paragraphs
        break;
    }
  });

  // Store template selection
  templateSelectHandler(block)

  // Store template inputs
  nextBtnHandler(block)

  radioBtnHandler(block)

  // Progress to lead gen
  document.getElementById('lead-gen').addEventListener('click', (el) => {
    document.querySelector('.offboarding-generator-container').classList.add('offboarding-generator-container--overlay');
    nextStep(el);
  });

  // Progress to completed template
  document.getElementById('download-confirmed').addEventListener('click', (e) => {
    nextStep(e);
  });
  
  const prev = document.querySelectorAll('[data-prev]');
  prev.forEach(el => {
    el.addEventListener('click', el => {
      prevStep(el);
    });
  });

  const close = block.querySelector('.button[data-close]');  
  close.addEventListener('click', (e) => {
    const current = parseInt(e.target.dataset.step, 10);
    document.querySelector(`[data-step="${current}"]`).classList.remove('offboarding-generator-step--active');
    document.querySelector('[data-step="0"]').classList.add('offboarding-generator-step--active');   
    document.querySelector('.offboarding-generator-container').classList.remove('offboarding-generator-container--overlay');
  });
}