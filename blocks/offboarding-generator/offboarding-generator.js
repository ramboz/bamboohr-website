import { createElem } from "../../scripts/scripts.js";

// const template = sessionStorage.getItem('generator-template');
const firstName = sessionStorage.getItem('generator-first-name');
const secondName = sessionStorage.getItem('generator-second-name');
const employeeName = sessionStorage.getItem('generator-employee-name');
const businessName = sessionStorage.getItem('generator-business-name');
const resignationDate = sessionStorage.getItem('generator-resignation-date');
const departureDate = sessionStorage.getItem('generator-departure-date');
const departmentName = sessionStorage.getItem('generator-department');
const replacementName = sessionStorage.getItem('generator-replacement');
const departureReason = sessionStorage.getItem('generator-departure-reason');
const interviewDetails = sessionStorage.getItem('generator-interview-details');
const interviewDateTime = sessionStorage.getItem('generator-interview-datetime');
const equipmentDate = sessionStorage.getItem('generator-equipment-date');
const equipmentAddress = sessionStorage.getItem('generator-equipment-address');

const formUrl = '/website-marketing-resources/offboarding-calculator-form.json'
let formsNameArr = null
let formsArr = null

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

const templateOptions = [
  {
    'value': 'resignation-acknowledgement',
    'label': 'Resignation Letter Acknowledgement',
    'templates': {
      'formal' : '<p>Dear <span>[employee\'s name]</span>,</p><p>This letter acknowledges receipt of your resignation, as dated <span>[date resignation letter was submitted]</span>. I can confirm that your final working day will be <span>[last day working for the business]</span>.</p><p>We here at <span>[insert business name]</span> wish you all the best for your future endeavors.</p><p>Sincerely,</p><p><span>[Your name]</span></p>',
      'neutral' : '<p>Hello <span>[employee\'s name]</span>,</p><p>I can confirm receipt of your resignation, as dated <span>[date resignation letter was submitted]</span>. I can confirm that your final working day will be <span>[last day working for the business]</span>.</p><p>Thank you for your work here at <span>[insert business name]</span>.</p><p>All the best,</p><p><span>[Your name]</span></p>',
      'friendly' : '<p>Hi <span>[employee\'s name]</span>,</p><p>Thank you for getting in touch. I can confirm I have received your letter of resignation, as dated <span>[date resignation letter was submitted]</span>. Just to confirm, your final working day will be <span>[last day working for the business]</span>.</p><p>It has been a pleasure working with you. All the best for the future.</p><p>Thanks,</p><p><span>[Your name]</span></p>'
    },
  },
  {
    'value': 'resignation-announcement',
    'label': 'Resignation Announcement',
    'templates': {
      'formal' : '<p>Dear <span>[team or department name]</span>,</p><p>I am writing to inform you all that <span>[employee name]</span> will be leaving <span>[company name]</span>. Their last date will be <span>[departure date]</span>. <span>[Employee name]</span> is heading to <span>[reason for leaving if you have permission to reveal]</span> (can be omitted if an employee has not revealed their next steps).</p><p>Following <span>[employee\'s name]</span> departure, please direct all communications to <span>[person taking over duties for the interim]</span>.</p><p>I speak for the entire company when I say, congratulations <span>[employee name]</span>, and all the best for the future.</p><p>Sincerely,</p><p><span>[Your name]</span></p>',
      'neutral' : '<p>Hello <span>[team or department name]</span>,</p><p>I want to inform you all that <span>[employee name]</span> will be leaving us on <span>[departure date]</span>. <span>[Employee name]</span> is heading to <span>[reason for leaving if you have permission to reveal]</span> (can be omitted if an employee has not revealed their next steps).</p><p>Following <span>[employee\'s name]</span> departure, please direct all communications to <span>[person taking over duties for the interim]</span>.</p><p>Congratulations <span>[employee name]</span>, we wish you all the best for the future.</p><p>Thanks for your hard work,</p><p><span>[Your name]</span></p>',
      'friendly' : '<p>Hi <span>[team or department name]</span>,</p><p>We wanted to let you know that <span>[employee name]</span> will be leaving us on <span>[departure date]</span>. <span>[Employee name]</span> is heading to <span>[reason for leaving if you have permission to reveal]</span> (can be omitted if an employee has not revealed their next steps).</p><p>Following <span>[employee\'s name]</span> departure, please direct all communications to <span>[person taking over duties for the interim]</span>.</p><p>Congratulations <span>[employee name]</span>, we wish you all the best for the future.</p><p>We\'re sure you\'ll continue to achieve great things.</p><p><span>[Your name]</span></p>'
    }
  },
  {
    'value': 'exit-interview',
    'label': 'Exit Interview',
    'templates': {
      'formal' : '<p>Dear <span>[employee\'s name]</span>,</p><p>Thank you for your service here at <span>[insert business name]</span>.</p><p>As we strive to provide the best working environment for our employees, we would like to schedule an exit interview. This allows you to provide us with honest feedback and reflect on your time here with us. Any feedback is appreciated and will help management establish any areas that may need improving. All of your responses are confidential.</p><p>The interview will take place on <span>[date]</span> at <span>[time]</span>, either by <span>[a telephone call]</span> OR <span>[insert office room number/name]</span>. Please confirm you can attend.</p><p>Sincerely,</p><p><span>[Your name]</span></p>',
      'neutral' : '<p>Hello <span>[employee\'s name]</span>,</p><p>Following your resignation letter, we would like to schedule an exit interview. This gives you the opportunity to provide us with feedback and reflect on your time here with us. We appreciate any feedback, all of which is confidential.</p><p>The interview will take place on <span>[date]</span> at <span>[time]</span>. It will be <span>[a telephone call]</span> OR <span>[insert office room number/name]</span>. Please confirm you can attend.</p><p>I look forward to hearing from you,</p><p><span>[Your name]</span></p>',
      'friendly' : '<p>Hi <span>[employee\'s name]</span>,</p><p>Thanks for your time here at <span>[insert business name]</span>.</p><p>We would like to schedule an exit interview so we can hear your feedback on areas we do well in and anything that may need improving. We appreciate any feedback, all of which is confidential.</p><p>The interview will take place on <span>[date]</span> at <span>[time]</span>. It can be via <span>[a telephone call]</span> OR <span>[insert office room number/name]</span>. Does this date and time work for you?</p><p>Cheers,</p><p><span>[Your name]</span></p>'
    }
  },
  {
    'value': 'returning-equipment',
    'label': 'Returning Equipment/Company Property',
    'templates': {
      'formal' : '<p>Dear <span>[employee\'s name]</span>,</p><p>As you will be leaving the business on <span>[date of last day]</span>, you are required to return any keys, passes, company documents, equipment or other company property you have in your possession. It will need to be returned to <span>[address for return]</span> before <span>[date]</span>.</p><p>If you have any questions or concerns regarding the return of these items, please get in touch at the earliest possibility.</p><p>Sincerely,</p><p><span>[Your name]</span></p>',
      'neutral' : '<p>Hello <span>[employee\'s name]</span>,</p><p>As you will be leaving the business on <span>[date of last day]</span>, you are required to return any keys, passes, company documents, equipment or other company property you have in your possession. It will need to be returned to <span>[address for return]</span> before <span>[date]</span>.</p><p>If you have any questions or concerns regarding the return of these items, please get in touch at the earliest possibility.</p><p>Thank you,</p><p><span>[Your name]</span></p>',
      'friendly' : '<p>Hi <span>[employee\'s name]</span>,</p><p>Before your last day on <span>[date of last day]</span>, we will need you to return any keys, passes, company documents, equipment or other company property you have in your possession. It will need to be returned to <span>[address for return]</span> before <span>[date]</span>.</p><p>If you have any questions or concerns regarding the return of these items, please get in touch at the earliest possibility.</p><p>Thanks,</p><p><span>[Your name]</span></p>'
    }
  },
  {
    'value': 'leaving-confirmation',
    'label': 'Confirmation of leaving date',
    'templates': {
      'formal' : '<p>Dear <span>[Employee\'s name]</span>,</p><p>As your contract is due to be terminated on <span>[contract end date]</span>, we would like to confirm that your last working day with <span>[company\'s name]</span> will be on <span>[last working date]</span>.</p><p>Please note, your last pay date will be <span>[date]</span>. Please can you ensure any company property that you have access to is returned to <span>[address it needs to be sent to]</span> before <span>[date]</span>.</p><p>Sincerely,</p><p><span>[Your name]</span></p>',
      'neutral' : '<p>Hello <span>[Employee\'s name]</span>,</p><p>As your contract is due to be terminated on <span>[contract end date]</span>, we would like to confirm that your last working day with <span>[company\'s name]</span> will be on <span>[last working date]</span>.</p><p>Please note, your last pay date will be <span>[date]</span>. Please can you ensure any company property that you have access to is returned to <span>[address it needs to be sent to]</span> before <span>[date]</span>.</p><p>All the best,</p><p><span>[Your name]</span></p>',
      'friendly' : '<p>Hi <span>[Employee\'s name]</span>,</p><p>As your contract is due to be terminated on <span>[contract end date]</span>, we wanted to confirm that your last working day with us will be <span>[last working date]</span>.</p><p>Just to confirm, your last pay date will be <span>[date]</span>. Please can you ensure any company property that you have access to is returned to <span>[address it needs to be sent to]</span> before <span>[date]</span>.</p><p>Thank you,</p><p><span>[Your name]</span></p>'
    }
  },
  {
    'value': 'dismissal',
    'label': 'Offboarding for Dismissal',
    'templates': {
      'formal' : '<p>Dear <span>[Employee name]</span>,</p><p>We write to inform you that your employment with <span>[company\'s name]</span> will end as of <span>[termination date]</span>.</p><p>Your contract has been terminated due to <span>[List detailed reason(s)]</span>.</p><p>You will be paid until <span>[date]</span>. Please ensure all company property that you have access to is returned to <span>[address it needs to be sent to]</span> before <span>[date]</span>.</p><p>If you have questions or concerns about the termination of your contract, please feel free to contact me.</p><p>Sincerely,</p><p><span>[Your name]</span></p>',
      'neutral' : '<p>Hello <span>[employee name]</span>,</p><p>We\'re writing to confirm the termination of your contract here at <span>[company\'s name]</span>, as of <span>[termination date]</span>.</p><p>Your contract has been terminated due to <span>[List detailed reason(s)]</span>.</p><p>Your last pay date will be <span>[date]</span>. Please ensure any company property that you have access to is returned to <span>[address it needs to be sent to]</span> before <span>[date]</span>.</p><p>If you have any questions or concerns about the termination of your contract, please feel free to contact me.</p><p>Thanks,</p><p><span>[Your name]</span></p>',
      'friendly' : '<p>Hi <span>[employee name]</span>,</p><p>This is to confirm the termination of your contract here at <span>[company\'s name]</span>, as of <span>[termination date]</span>.</p><p>Your contract has been terminated due to <span>[List detailed reason(s)]</span>.</p><p>Please note, your last pay date will be <span>[date]</span>. Please ensure any company property that you have access to is returned to <span>[address it needs to be sent to]</span> before <span>[date]</span>.</p><p>If you have any questions or concerns about the termination of your contract, please feel free to contact me.</p><p>Thanks,</p><p><span>[Your name]</span></p>'
    }
  }
];

// Content Selection Template
function templateSelection(el, forms) {
  const selectHtml = createSelect('template-options', 'Choose your template', forms, 'Select template tooltip')
  const selectionHtml = `<div>${selectHtml}<button data-step="0" data-next class="button button--teal" id="select-template">Get started</button></div>`

  return selectionHtml;
}

// Content Input Shortcode Template
function templateFormWrapper() {
  let output = '<form class="form-wrap" id="template-form"></form>';
  output += '<nav>';
  output += '<button data-step="1" data-prev class="button button--outline">Back</button>';
  output += '<button data-step="1" data-next class="button" id="populate-template">Next</button>';
  output += '</nav>';
  return output;
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
  let output = '<div>';
  output += '<a href="https://bamboohr.com/blog" class="button button--teal">Go to blog</a>';
  output += '<button data-close data-step="4" class="button button--outline button--teal">Close and return to page</button>';
  output += '</div>';
  return output;
}

// Generate Inputs
/** TODO:
 * Add a 2nd param to get data from form
 * Pass placeholder from Google spreadsheet to createInput()
 */
function generateInputs(type) {
  const resignationDateInput = createInput('resignation-date', 'date', 'Date resignation letter was submitted', null, resignationDate, 'Tooltip!');
  const departureDateInput = createInput('departure-date', 'date', 'Last day working for the business', null, departureDate, 'Tooltip!');
  const equipmentDateInput = createInput('equipment-date', 'date', 'Date to return company equipment', null, equipmentDate, 'Tooltip!');
  const equipmentAddressInput = createInput('equipment-address', 'text', 'Address to return equipment', 'Please enter the address equipment is to be returned to', equipmentAddress, 'Tooltip!');
  const departureReasonInput = createInput('departure-reason', 'text', 'Enter a reason for the departure', 'Please enter the departure reason', departureReason, 'Tooltip!');

  let output = '';
  output += createInput('first-name', 'text', 'Your first name', 'Please enter your first name', firstName);
  output += createInput('second-name', 'text', 'Your second name', 'Please enter your second name', secondName);
  output += createInput('employee-name', 'text', 'Employee\'s Name', 'Please your employee\'s full name', employeeName, 'Tooltip!');
  output += createInput('business-name', 'text', 'Business name', 'Please your business name', businessName);

  switch(type) {
    case 'resignation-letter-acknowledgement':
      output += resignationDateInput;
      output += departureDateInput;
      break;
    case 'resignation-announcement':
      output += createInput('department-name', 'text', 'Enter the department/team name', 'Please enter the team name', departmentName, 'This is a tooltip about the department name field!');
      output += resignationDateInput;
      output += departureDateInput;
      output += departureReasonInput;
      output += createInput('replacement-name', 'text', 'Enter the name of the replacement', 'Please enter the replacement name', replacementName, 'Tooltip!');
      break;
    case 'exit-interview':
      output += createInput('interview-details', 'text', 'Enter interview details', 'Please enter interview details', interviewDetails, 'Tooltip!');
      output += createInput('interview-date', 'datetime-local', 'Enter exit interview date and time', null, interviewDateTime, 'Tooltip!');
      break;
    case 'returning-equipment-company-property':
      output += departureDateInput;
      output += equipmentDateInput
      output += equipmentAddressInput;
      break;
    case 'confirmation-of-leaving-date':
      output += departureDateInput;
      break;
    case 'offboarding-for-dismissal':
      output += departureDateInput;
      output += departureReasonInput;
      output += equipmentDateInput
      output += equipmentAddressInput;
      break;
    default:
        // do nothing none paragraphs
        break;
  }
  return output;
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

export default async function decorate(block) {
  
  const data = await fetchData(formUrl)

  // Set template defaults
  sessionStorage.setItem('generator-template', 'resignation-letter-acknowledgement');
  sessionStorage.setItem('generator-tone', 'TemplateFormal');

  // Add classes to generator step wrapping divs
  const children = block.children;
  for(var i = 0; i < children.length; i++) {
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
  const paragraphs = document.querySelectorAll('p');
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
      // case '[generator-download-confirmed]':
      //   item.innerHTML = downloadConfirmed();
      //   break;
      default:
        // do nothing none paragraphs
        break;
    }
  });

  // Store template selection
  block.querySelector('#select-template').addEventListener('click', (el) => {
    const selectedTemplate = document.getElementById('template-options').value;
    const templates = formsArr.find(item => item.formValue === selectedTemplate);
    const formatTemp = getTemplatesTone(templates)
    document.getElementById('template-preview').innerHTML = formatTemp[0][sessionStorage.getItem('generator-tone')];
    document.getElementById('template-form').innerHTML = generateInputs(selectedTemplate);
    sessionStorage.setItem('generator-template', selectedTemplate);
    nextStep(el);
  });

  // Store template inputs
  document.getElementById('populate-template').addEventListener('click', (el) => {
    const inputs = [
      'first-name', 
      'second-name',
      'employee-name',
      'business-name',
      'resignation-date',
      'departure-date',
      'department-name',
      'replacement-name',
      'departure-reason',
      'interview-details',
      'interview-datetime',
      'equipment-date',
      'equipment-address',
    ];
    inputs.forEach(item => {
      const input = document.getElementById(item);
      if(input && input.value !== null) {
        sessionStorage.setItem('generator-' + item, input.value);
      }
    });
    nextStep(el);
  });

  // Store tone selection
  const toneSelection = document.querySelectorAll('input[type=radio][name="select-tone"]');
  toneSelection.forEach(radio => radio.addEventListener('change', () => {
    const tone = radio.value;
    sessionStorage.setItem('generator-tone', tone);
    const template = sessionStorage.getItem('generator-template');
    const templates = formsArr.find(item => item.formValue === template);
    const formatTemp = getTemplatesTone(templates)
  
    document.getElementById('template-preview').innerHTML = formatTemp[0][tone];
  }));

  // Progress to lead gen
  document.getElementById('lead-gen').addEventListener('click', (el) => {
    document.querySelector('.offboarding-generator-container').classList.add('offboarding-generator-container--overlay');
    nextStep(el);
  });

  // Progress to completed template
  document.getElementById('download-confirmed').addEventListener('click', (el) => {
    nextStep(el);
  });
  
  const prev = document.querySelectorAll('[data-prev]');
  prev.forEach(el => {
    el.addEventListener('click', el => {
      prevStep(el);
    });
  });

  const close = document.querySelectorAll('.button[data-close]');
  close.forEach(el => {
    
    el.addEventListener('click', (el) => {
      let current = parseInt(el.target.dataset.step);
      document.querySelector('[data-step="' + current + '"]').classList.remove('offboarding-generator-step--active');
      document.querySelector('[data-step="0"]').classList.add('offboarding-generator-step--active');   
      document.querySelector('.offboarding-generator-container').classList.remove('offboarding-generator-container--overlay');
    });
  });
}