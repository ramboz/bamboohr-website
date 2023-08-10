import { createElem, loadCSS } from "../../scripts/scripts.js";
import { loadFormAndChilipiper } from "../form/form.js";
import { findSplitSubType } from "../columns/columns.js";

export default async function decorate(block) {
  console.log(block);
  let splitVals = null;
  [...block.classList].some((c) => {
    splitVals = findSplitSubType(c);
    return splitVals;
  });

  const steps = block.querySelectorAll(':scope > div');
  steps.forEach((step, i) => {
    step.dataset.step = i;
    step.classList = 'signup-step';

    const cols = [...step.children];
    if(cols?.length === 2 && splitVals) {
      cols.forEach((col, n) => { col.classList.add(`column${splitVals[n]}`); });
    }
  });

  const formParams = {formUrl: null, formId: null, successUrl: null, chilipiper: null, floatingLabel: false };
  formParams.formId = '2137';
  const mktoForm = `<form id="mktoForm_${formParams.formId}"></form>`;
  const step0FormContainer = document.createElement('div');
  step0FormContainer.classList.add('form-container');
  step0FormContainer.innerHTML = mktoForm;

  const cssBase = `${window.hlx.serverPath}${window.hlx.codeBasePath}`;
  loadCSS(`${cssBase}/blocks/form/form.css`, null);

  let el;
  const paragraphs = block.querySelectorAll('p');
  paragraphs.forEach( paragraph => {
    if(paragraph.innerText === '[signup-step1]' || paragraph.innerText === '[signup-step2]') {
      paragraph.parentNode.parentNode.classList.add('form');
      paragraph.parentNode.classList.add('form-col');
      paragraph.parentNode.previousElementSibling.classList.add('content-col');
    }
    switch(paragraph.innerText) {
      case '[signup-step1]':
        paragraph.innerHTML = step0FormContainer.outerHTML;
        el = paragraph;
        break;
      case '[signup-step2]':
        paragraph.innerHTML = 'signup step2';
        break;
      default:
        // do nothing
        break;
    }
  });

  const { step } = el.parentElement.parentElement.dataset;
  console.log(step);
   loadFormAndChilipiper(formParams, () => {
     const { step } = el.parentElement.parentElement.dataset;
     console.log(step);
     // nextStep(el, block, true, step);
   });
}