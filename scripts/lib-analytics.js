/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// eslint-disable-next-line import/no-cycle
import { getMetadata } from './scripts.js';
import { setObject } from './set-object.js';

/**
 * Customer's XDM schema namespace
 * @type {string}
 */
const CUSTOM_SCHEMA_NAMESPACE = '_bamboohr';

/**
 * Returns experiment id and variant running
 * @returns {{experimentVariant: *, experimentId}}
 */
export function getExperimentDetails() {
  let experiment;
  if (window.hlx.experiment) {
    experiment = {
      experimentId: window.hlx.experiment.id,
      experimentVariant: window.hlx.experiment.selectedVariant,
    };
  }
  return experiment;
}

/**
 * Returns script that initializes a queue for each alloy instance,
 * in order to be ready to receive events before the alloy library is loaded
 * Documentation
 * https://experienceleague.adobe.com/docs/experience-platform/edge/fundamentals/installing-the-sdk.html?lang=en#adding-the-code
 * @type {string}
 */
function getAlloyInitScript() {
  return `!function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||[]).push(o),n[o]=
  function(){var u=arguments;return new Promise(function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}(window,["alloy"]);`;
}

/**
 * Returns datastream id to use as edge configuration id
 *
 * A development datastream can be provided by setting the applicable localstorage key ('Adobe Development Datastream')
 * with the desired stream as the value and that will override the stage datastream when loaded on a non-production
 * domain.
 *
 * Existing dev datastream that is available to be set via local storage: 05576f9e-140b-4dcc-bccd-d73d97d94690
 *
 * @returns {{edgeConfigId: string, orgId: string}}
 */
function getDatastreamConfiguration() {
  let edgeConfigId;
  const adobeDevDatastream = (localStorage ? localStorage.getItem('Adobe Development Datastream') : undefined);
  if (adobeDevDatastream) {
	  edgeConfigId = adobeDevDatastream;
  } else {
    const isProdSite = /^(marketplace|partners|www)\.bamboohr\.com$/i.test(document.location.hostname);
    edgeConfigId = isProdSite ? '3f2b3209-7600-4a37-8bb5-0d91f8f7f7e7' : '48e64dbd-346e-45e9-8f8d-c82715e21301';
  }

  return {
    edgeConfigId,
    orgId: '63C70EF1613FCF530A495EE2@AdobeOrg',
  };
}

/**
 * Enhance all events with additional details, like experiment running,
 * before sending them to the edge
 * @param options event in the XDM schema format
 */
function enhanceAnalyticsEvent(options) {
  const experiment = getExperimentDetails();
  options.xdm[CUSTOM_SCHEMA_NAMESPACE] = {
    ...options.xdm[CUSTOM_SCHEMA_NAMESPACE],
    ...(experiment ? {experiment} : {}), // add experiment details, if existing, to all events
  };
}

/**
 * Returns alloy configuration
 * Documentation https://experienceleague.adobe.com/docs/experience-platform/edge/fundamentals/configuring-the-sdk.html
 */
// eslint-disable-next-line no-unused-vars
function getAlloyConfiguration(document) {
  return {
    // enable while debugging
    debugEnabled: document.location.hostname.startsWith('localhost'),
    // disable when clicks are also tracked via sendEvent with additional details
    clickCollectionEnabled: false,
    // adjust default based on customer use case
    defaultConsent: 'pending',
    ...getDatastreamConfiguration(),
    onBeforeEventSend: (options) => enhanceAnalyticsEvent(options),
  };
}

/**
 * Create inline script
 * @param document
 * @param element where to create the script element
 * @param innerHTML the script
 * @param type the type of the script element
 * @returns {HTMLScriptElement}
 */
function createInlineScript(document, element, innerHTML, type) {
  const script = document.createElement('script');
  if (type) {
    script.type = type;
  }
  script.innerHTML = innerHTML;
  element.appendChild(script);
  return script;
}

/**
 * Sets Adobe standard v1.0 consent for alloy based on the input
 * Documentation: https://experienceleague.adobe.com/docs/experience-platform/edge/consent/supporting-consent.html?lang=en#using-the-adobe-standard-version-1.0
 * @param approved
 * @returns {Promise<*>}
 */
export async function analyticsSetConsent(approved) {
  // eslint-disable-next-line no-undef
  return alloy('setConsent', {
    consent: [{
      standard: 'Adobe',
      version: '1.0',
      value: {
        general: approved ? 'in' : 'out',
      },
    }],
  });
}

export async function getBlogMetaFromInstrumentation() {
  try {
    const resp = await fetch('/blog/instrumentation.json');
    const json = await resp.json();
    // eslint-disable-next-line prefer-const
    let blogMeta = {};
    json.digitaldata.data.forEach((mapping) => {
      if(mapping.metadata === 'title'){
        mapping.metadata = 'og:title';
      }
      const metaValue = getMetadata(mapping.metadata);
      if (metaValue) {
        setObject(blogMeta, mapping.digitaldata, metaValue);
      }
    });
    return blogMeta.resource;
  } catch (e) {
    return {};
  }
}

export function getCampaignString(){
  const urlParams = new URLSearchParams(window.location.search);
  const campaign = `${urlParams.get("utm_campaign") || "not_set"}|${urlParams.get("utm_source") || "not_set"}|${urlParams.get("utm_medium") || "not_set"}|${urlParams.get("utm_term") || "not_set"}|${urlParams.get("utm_content") || "not_set"}`;

  return (campaign !== "not_set|not_set|not_set|not_set|not_set" ? campaign : "");
}

/**
 * Basic tracking for page views with alloy
 * @param document
 * @param additionalXdmFields
 * @param blogPageDetails
 * @returns {Promise<*>}
 */
export async function analyticsTrackPageViews(document, additionalXdmFields = {}, blogPageDetails = {}) {
  // eslint-disable-next-line no-undef
  return alloy('sendEvent', {
	renderDecisions: true,
    xdm: {
      eventType: 'web.webpagedetails.pageViews',
      web: {
        webPageDetails: {
          name: `${document.title}`,
          [CUSTOM_SCHEMA_NAMESPACE]: {
            campaign: getCampaignString()
		  },
          pageViews: {
            value: 1,
          },
        },
      },
      [CUSTOM_SCHEMA_NAMESPACE]: {
		blogPageDetails,
        ...additionalXdmFields,
      },
    },
  });
}

/**
 * Sets up analytics tracking with alloy (initializes and configures alloy)
 * @param document
 * @returns {Promise<void>}
 */
export async function setupAnalyticsTrackingWithAlloy(document) {
  createInlineScript(document, document.body, getAlloyInitScript(), 'text/javascript');

  // eslint-disable-next-line no-undef
  const configure = alloy('configure', getAlloyConfiguration(document));

  // Custom logic can be inserted here in order to support early tracking before alloy library
  // loads, for e.g. for page views
  const blogMeta = await getBlogMetaFromInstrumentation();
  const pageView = analyticsTrackPageViews(document,{}, blogMeta); // track page view early

  await import('./alloy.min.js');
  await configure;
  await pageView;
}

/**
 * Basic tracking for link clicks with alloy
 * Documentation: https://experienceleague.adobe.com/docs/experience-platform/edge/data-collection/track-links.html
 * @param element
 * @param linkType
 * @param additionalXdmFields
 * @returns {Promise<*>}
 */
export async function analyticsTrackLinkClicks(element, linkType = 'other', additionalXdmFields = {}) {
  // eslint-disable-next-line no-undef
  return alloy('sendEvent', {
    documentUnloading: true,
    xdm: {
      eventType: 'web.webinteraction.linkClicks',
      web: {
        webInteraction: {
          linkURL: `${element.href}`,
          // eslint-disable-next-line no-nested-ternary
          name: `${element.text ? element.text.trim() : (element.innerHTML ? element.innerHTML.trim() : '')}`,
          linkClicks: {
            value: 1,
          },
          type: linkType,
        },
      },
      [CUSTOM_SCHEMA_NAMESPACE]: {
        ...additionalXdmFields,
      },
    },
  });
}

/**
 * Basic tracking for form submissions with alloy
 * @param element
 * @param additionalXdmFields
 * @returns {Promise<*>}
 */
export async function analyticsTrackFormSubmission(element, additionalXdmFields = {}) {
	const empText = element.querySelector('select[name="Employees_Text__c"]');
	const formBusinessSize = empText?.value || 'unknown';
	const rawFormId = element.id.replace('mktoForm_', '');

  // eslint-disable-next-line no-undef
  return alloy('sendEvent', {
    documentUnloading: true,
    xdm: {
      eventType: 'web.formFilledOut',
      [CUSTOM_SCHEMA_NAMESPACE]: {
        form: {
          formId: rawFormId,
          formComplete: 1,
		      businessSize: formBusinessSize
        },
        ...additionalXdmFields,
      },
    },
  });
}

/**
 * Basic tracking for video play with alloy
 * @param element
 * @param additionalXdmFields
 * @returns {Promise<*>}
 */
export async function analyticsTrackVideo(
  {
    id, name, type, hasStarted, hasCompleted, progressMarker,
  },
  additionalXdmFields = {},
) {
  const primaryAssetReference = {
    id: `${id}`,
    dc: {
      title: `${name}`,
    },
    showType: `${type}`,
  };
  if (hasStarted) {
    // eslint-disable-next-line no-undef
    return alloy('sendEvent', {
      documentUnloading: true,
      xdm: {
        [CUSTOM_SCHEMA_NAMESPACE]: {
          media: {
            mediaTimed: {
              impressions: {
                value: 1,
              },
              primaryAssetReference,
            },
          },
          ...additionalXdmFields,
        },
      },
    });
  }
  if (hasCompleted) {
    // eslint-disable-next-line no-undef
    return alloy('sendEvent', {
      documentUnloading: true,
      xdm: {
        [CUSTOM_SCHEMA_NAMESPACE]: {
          media: {
            mediaTimed: {
              completes: {
                value: 1,
              },
              primaryAssetReference,
            },
          },
          ...additionalXdmFields,
        },
      },
    });
  }
  if (progressMarker) {
    // eslint-disable-next-line no-undef
    return alloy('sendEvent', {
      documentUnloading: true,
      xdm: {
        [CUSTOM_SCHEMA_NAMESPACE]: {
          media: {
            mediaTimed: {
              [progressMarker]: {
                value: 1,
              },
              primaryAssetReference,
            },
          },
          ...additionalXdmFields,
        },
      },
    });
  }
  return Promise.resolve();
}

export async function analyticsTrackFormStart(form) {

	const rawFormId = form.id.replace('mktoForm_', '');

	// eslint-disable-next-line no-undef
	return alloy('sendEvent', {
		documentUnloading: true,
		xdm: {
			eventType: 'web.formStarted',
			[CUSTOM_SCHEMA_NAMESPACE]: {
				form: {
					formId: rawFormId,
					formStart: 1,
				}
			},
		},
	});
}

export async function analyticsTrackTabClicks(clickedTabText) {
	// eslint-disable-next-line no-undef
	return alloy('sendEvent', {
		documentUnloading: true,
		xdm: {
			eventType: 'web.webinteraction.linkClicks',
			web: {
				webInteraction: {
          [CUSTOM_SCHEMA_NAMESPACE]: {
						clickedTab: clickedTabText,
					},
				},
			},
		},
	});
}

export async function analyticsTrackSocial(platform) {
	// eslint-disable-next-line no-undef
	return alloy('sendEvent', {
		documentUnloading: true,
		xdm: {
			eventType: 'social.share',
			socialMarketing: {
				network: platform,
				share: 1
			}
		},
	});
}

export async function analyticsTrackPreformEmailEntered() {
  if(!window.preformEmailEntered) {
    window.preformEmailEntered = true;

    // eslint-disable-next-line no-undef
    return alloy('sendEvent', {
      documentUnloading: true,
      xdm: {
        eventType: 'web.formFilledOut',
        [CUSTOM_SCHEMA_NAMESPACE]: {
          form: {
            preFormEmailEntered: 1,
          }
        },
      },
    });
  }
  return Promise.resolve();
}

export async function analyticsTrackPreformEmailSubmitted() {
  // eslint-disable-next-line no-undef
  return alloy('sendEvent', {
    documentUnloading: true,
    xdm: {
      eventType: 'web.formFilledOut',
      [CUSTOM_SCHEMA_NAMESPACE]: {
        form: {
          preFormEmailSubmitted: 1,
        }
      },
    },
  });
}

export async function analyticsTrackCWV(cwv) {
  // eslint-disable-next-line no-undef
  return alloy('sendEvent', {
    documentUnloading: true,
    xdm: {
      eventType: 'web.performance.measurements',
      [CUSTOM_SCHEMA_NAMESPACE]: {
        cwv,
      }
    },
  });
}
