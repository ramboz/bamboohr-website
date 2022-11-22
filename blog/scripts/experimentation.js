import {
  sampleRUM,
  toCamelCase,
  toClassName,
} from './scripts.js';

function e(e,t,n,r){var a=function(e){var t=function(e,t){for(var n,r,a=3&e.length,i=e.length-a,o=3432918353,c=461845907,u=t,d=0;d<i;)n=255&e.charCodeAt(d)|(255&e.charCodeAt(++d))<<8|(255&e.charCodeAt(++d))<<16|(255&e.charCodeAt(++d))<<24,++d,u=27492+(65535&(r=5*(65535&(u=(u^=n=(65535&(n=(n=(65535&n)*o+(((n>>>16)*o&65535)<<16)&4294967295)<<15|n>>>17))*c+(((n>>>16)*c&65535)<<16)&4294967295)<<13|u>>>19))+((5*(u>>>16)&65535)<<16)&4294967295))+((58964+(r>>>16)&65535)<<16);switch(n=0,a){case 3:n^=(255&e.charCodeAt(d+2))<<16;case 2:n^=(255&e.charCodeAt(d+1))<<8;case 1:u^=n=(65535&(n=(n=(65535&(n^=255&e.charCodeAt(d)))*o+(((n>>>16)*o&65535)<<16)&4294967295)<<15|n>>>17))*c+(((n>>>16)*c&65535)<<16)&4294967295}return u^=e.length,u=2246822507*(65535&(u^=u>>>16))+((2246822507*(u>>>16)&65535)<<16)&4294967295,u=3266489909*(65535&(u^=u>>>13))+((3266489909*(u>>>16)&65535)<<16)&4294967295,(u^=u>>>16)>>>0}(e,0);return Math.abs(t)%1e4/1e4}(e+"."+t),i=function(e,t,n){for(var r=e.reduce((function(e,t){return e+t}),0),a=0,i=0;i<t.length;i++)if(!(n>(a+=Number(e[i].toFixed(2))/r)))return t[i]}(n,r,a);return{treatmentId:i,bucketId:a}}function t(e,t,n){var r,a=function(e){var t=localStorage.getItem("unified-decisioning-experiments");if(t){var n=JSON.parse(t);if(n[e])return n[e].treatment}return null}(e);if(a)r=a;else{var i=function(e,t){for(var n=100*Math.random(),r=t.length;n>0&&r>0;)n-=+e[r-=1];return t[r]}(t,n);!function(e,t){var n=localStorage.getItem("unified-decisioning-experiments"),r=n?JSON.parse(n):{},a=new Date;Object.keys(r).forEach((function(e){var t=new Date(r[e].date);a.getTime()-t.getTime()>2592e6&&delete r[e]}));var i=a.toISOString().split("T")[0];r[e]={treatment:t,date:i},localStorage.setItem("unified-decisioning-experiments",JSON.stringify(r))}(e,i),r=i}return{treatmentId:r}}var n="VISITOR",r="DEVICE";function a(a,i,o){var c=a[o],u=c.experiment;if("EXPERIMENTATION"===c.type){var d=function(a,i){var o=i.id,c=i.identityNamespace,u=i.randomizationUnit,d=void 0===u?n:u,f=a.identityMap,s=i.treatments.map((function(e){return e.id})),m=i.treatments.map((function(e){return e.allocationPercentage})),h=null;switch(d){case n:h=e(o,f[c][0].id,m,s);break;case r:h=t(o,m,s);break;default:throw new Error("Unknow randomization unit")}return{experimentId:o,hashedBucket:h.bucketId,treatment:{id:h.treatmentId}}}(i,u).treatment;return[d]}}function i(e,t){var n={};return e.decisionNodes.forEach((function(e){n[e.id]=e})),{items:a(n,t,e.rootDecisionNodeId)}}export{i as evaluateDecisionPolicy};
const evaluateDecisionPolicy = i;

/**
 * Gets experiment config from the manifest and transforms it to more easily
 * consumable structure.
 *
 * the manifest consists of two sheets "settings" and "experiences", by default
 *
 * "settings" is applicable to the entire test and contains information
 * like "Audience", "Status" or "Blocks".
 *
 * "experience" hosts the experiences in rows, consisting of:
 * a "Percentage Split", "Label" and a set of "Links".
 *
 *
 * @param {string} experimentId
 * @param {object} cfg
 * @returns {object} containing the experiment manifest
 */
 export async function getExperimentConfig(experimentId, instantExperiment) {
  if (instantExperiment) {
    const config = {
      experimentName: `Instant Experiment: ${experimentId}`,
      audience: '',
      status: 'Active',
      id: experimentId,
      variants: {},
      variantNames: [],
    };

    const pages = instantExperiment.split(',').map((p) => new URL(p.trim()).pathname);
    const evenSplit = 1 / (pages.length + 1);

    config.variantNames.push('control');
    config.variants.control = {
      percentageSplit: '',
      pages: [window.location.pathname],
      blocks: [],
      label: 'Control',
    };

    pages.forEach((page, i) => {
      const vname = `challenger-${i + 1}`;
      config.variantNames.push(vname);
      config.variants[vname] = {
        percentageSplit: `${evenSplit}`,
        pages: [page],
        label: `Challenger ${i + 1}`,
      };
    });

    return (config);
  }

  const path = `/experimentation/${experimentId}/manifest.json`;
  try {
    const resp = await fetch(path);
    if (!resp.ok) {
      console.log('error loading experiment config:', resp);
      return null;
    }
    const json = await resp.json();
    const config = parseExperimentConfig(json);
    config.id = experimentId;
    config.manifest = path;
    config.basePath = `/experimentation/${experimentId}`;
    return config;
  } catch (e) {
    console.log(`error loading experiment manifest: ${path}`, e);
  }
  return null;
}

/**
 * this is an extensible stub to take on audience mappings
 * @param {string} audience
 * @return {boolean} is member of this audience
 */
function isValidAudience(audience) {
  if (audience === 'mobile') {
    return window.innerWidth < 600;
  }
  if (audience === 'desktop') {
    return window.innerWidth >= 600;
  }
  return true;
}

function getDecisionPolicy(config) {
  const decisionPolicy = {
    id: 'content-experimentation-policy',
    rootDecisionNodeId: 'n1',
    decisionNodes: [{
      id: 'n1',
      type: 'EXPERIMENTATION',
      experiment: {
        id: config.id,
        identityNamespace: 'ECID',
        randomizationUnit: 'DEVICE',
        treatments: Object.entries(config.variants).map(([key, props]) => ({
          id: key,
          allocationPercentage: props.percentageSplit
            ? parseFloat(props.percentageSplit) * 100
            : 100 - Object.values(config.variants).reduce((result, variant) => {
              result -= parseFloat(variant.percentageSplit || 0) * 100;
              return result;
            }, 100),
        })),
      },
    }],
  };
  return decisionPolicy;
}

/**
 * Replaces element with content from path
 * @param {string} path
 * @param {HTMLElement} element
 * @param {boolean} isBlock
 */
async function replaceInner(path, element, isBlock = false) {
  const plainPath = `${path}.plain.html`;
  try {
    const resp = await fetch(plainPath);
    if (!resp.ok) {
      console.log('error loading experiment content:', resp);
      return null;
    }
    const html = await resp.text();
    if (isBlock) {
      const div = document.createElement('div');
      div.innerHTML = html;
      element.replaceWith(div.children[0].children[0]);
    } else {
      element.innerHTML = html;
    }
  } catch (e) {
    console.log(`error loading experiment content: ${plainPath}`, e);
  }
  return null;
}

export async function runExperiment(experiment, instantExperiment) {
  const usp = new URLSearchParams(window.location.search);
  const [forcedExperiment, forcedVariant] = usp.has('experiment') ? usp.get('experiment').split('/') : [];

  const experimentConfig = await getExperimentConfig(experiment, instantExperiment);
  console.debug(experimentConfig);
  if (!experimentConfig || (toCamelCase(experimentConfig.status) !== 'active' && !forcedExperiment)) {
    return;
  }

  experimentConfig.run = forcedExperiment
    || isValidAudience(toClassName(experimentConfig.audience));
  window.hlx = window.hlx || {};
  window.hlx.experiment = experimentConfig;
  console.debug('run', experimentConfig.run, experimentConfig.audience);
  if (!experimentConfig.run) {
    return;
  }

  if (forcedVariant && experimentConfig.variantNames.includes(forcedVariant)) {
    experimentConfig.selectedVariant = forcedVariant;
  } else {
    const decision = evaluateDecisionPolicy(getDecisionPolicy(experimentConfig), {});
    experimentConfig.selectedVariant = decision.items[0].id;
  }

  sampleRUM('experiment', { source: experimentConfig.id, target: experimentConfig.selectedVariant });
  console.debug(`running experiment (${window.hlx.experiment.id}) -> ${window.hlx.experiment.selectedVariant}`);

  if (experimentConfig.selectedVariant === experimentConfig.variantNames[0]) {
    return;
  }

  const currentPath = window.location.pathname;
  const { pages } = experimentConfig.variants[experimentConfig.selectedVariant];
  if (!pages.length) {
    return;
  }

  const control = experimentConfig.variants[experimentConfig.variantNames[0]];
  const index = control.pages.indexOf(currentPath);
  if (index < 0 || pages[index] === currentPath) {
    return;
  }

  // Fullpage content experiment
  document.body.classList.add('experiment-' + experimentConfig.id);
  document.body.classList.add('variant-' + experimentConfig.selectedVariant);
  await replaceInner(pages[0], document.querySelector('main'));
}