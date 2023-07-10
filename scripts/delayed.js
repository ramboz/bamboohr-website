/* Core Web Vitals RUM collection */
/*
 * Copyright 2021 Adobe. All rights reserved.
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
import { sampleRUM } from './scripts.js';
// eslint-disable-next-line import/no-cycle
import {
  analyticsSetConsent,
  analyticsTrackLinkClicks,
  analyticsTrackSocial,
  analyticsTrackVideo
} from './lib-analytics.js';

sampleRUM('cwv');

function initEmbeddedMessaging() {
  try {
    // eslint-disable-next-line
    embeddedservice_bootstrap.settings.language = 'en_US'; // For example, enter 'en' or 'en-US'
    // eslint-disable-next-line
    embeddedservice_bootstrap.init(
      '00D7h0000004j7W',
      'BambooHR_Sales_Chat',
      'https://bamboohr--webchat.sandbox.my.site.com/ESWBambooHRSalesChat1687205865468',
      {
        scrt2URL: 'https://bamboohr--webchat.sandbox.my.salesforce-scrt.com'
      }
    );
  } catch (err) {
    // eslint-disable-next-line
    console.error('Error loading Embedded Messaging: ', err);
  }
};

/**
 * loads a script by adding a script tag to the head.
 * @param {string} where to load the js file ('header' or 'footer')
 * @param {string} url URL of the js file
 * @param {Function} callback callback on load
 * @param {string} type type attribute of script tag
 * @param {boolean} defer defer attribute of script tag
 * @returns {Element} script element
 */
function loadScript(location, url, callback, type, defer) {
  const $head = document.querySelector('head');
  const $body = document.querySelector('body');
  const $script = document.createElement('script');
  if (url) $script.src = url;
  if (type) $script.setAttribute('type', type);
  if (defer && $script.src) $script.defer = defer;
  if (location === 'header') {
    $head.append($script);
  } else if (location === 'footer') {
    $body.append($script);
  }
  $script.onload = callback;
  return $script;
}

function loadSalesforceChatScript() {
  const chatTestPaths = [
    '/drafts/sclayton/chat-test',
  ];

  const isOnChatTestPath = chatTestPaths.includes(window.location.pathname);
  if (!isOnChatTestPath) return;

  loadScript('footer', 'https://bamboohr--webchat.sandbox.my.site.com/ESWBambooHRSalesChat1687205865468/assets/js/bootstrap.min.js', async () => {
    initEmbeddedMessaging();
  }, 'text/javascript');
}

// eslint-disable-next-line no-unused-vars
function loadTrustArcFormScript() {
  window.trustarc = window.trustarc || {};
  const r = window.trustarc;
  r.irm = [];
  const n = ['init', 'shouldShowGPCBanner', 'setGPCSubmitted', 'destroy'];
  n.forEach(o => {
    r.irm[o] = r.irm[o] ||
      // eslint-disable-next-line func-names
      (function (t) {
        // eslint-disable-next-line func-names
        return function (...args) {
          r.irm.push([t, args]);
        };
      })(o);
  });
  r.irm.init(
    {
      formId: '62f6991b-9d92-4ba0-8736-4b9e0b0df291',
      gpcDetection: true
    },
    (error) => {
      document.body.innerHTML = error;
      document.body.style.color = 'red';
    }
  );

  // PROXIED URL: const trustArcFormSrc =
  // 'https://tracker.ekremney.workers.dev/?thirdPartyTracker=https://form-renderer.trustarc.com/browser/client.js';
  const trustArcFormSrc = 'https://form-renderer.trustarc.com/browser/client.js';

  loadScript('header', trustArcFormSrc, null, 'text/javascript', true);
}

/**
 * opens external links in new window
 */
function updateExternalLinks() {
  document.querySelectorAll('main a').forEach((a) => {
    try {
      const { origin } = new URL(a.href, window.location.href);
      if (origin && origin !== window.location.origin) {
        a.setAttribute('rel', 'noopener');
        a.setAttribute('target', '_blank');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid link: ${a.href}`);
    }
  });
}

function getCookie(name) {
  const cookieArr = document.cookie.split(";");
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split("=");
    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

function isTrustArcAdvertisingCookieAllowed() {
  const noticeGDPRPrefs = getCookie("notice_gdpr_prefs");
  const noticeBehavior = getCookie("notice_behavior");

  if (!noticeGDPRPrefs && noticeBehavior && noticeBehavior !== "expressed|eu") {
    return true;
  }
  if (noticeGDPRPrefs) {
    return /^.*2.*$/i.test(noticeGDPRPrefs);
  }
  return false;
}

// eslint-disable-next-line no-unused-vars
async function setConsentBasedOnTrustArc() {
  await analyticsSetConsent(isTrustArcAdvertisingCookieAllowed());

  window.addEventListener('message', async (event) => {
    if (event.data && event.data.includes && event.data.includes('submit_preferences')) {
      try {
        const eventDataJson = JSON.parse(event.data);
        if (eventDataJson.message === 'submit_preferences' && eventDataJson.source === 'preference_manager') {
          let approved = false;
          if (typeof eventDataJson.data === 'string') {
            approved = /^.*2.*$/i.test(eventDataJson.data);
          } else if (eventDataJson.data.value) {
            approved = /^.*2.*$/i.test(eventDataJson.data.value);
          }
          await analyticsSetConsent(approved);
        }
      } catch (e) {
        // ignore
      }
    }
  });
}

// PROXIED URL: loadScript('footer',
// 'https://tracker.ekremney.workers.dev/?thirdPartyTracker=https://consent.trustarc.com/v2/notice/qvlbs6', setConsentBasedOnTrustArc, 'text/javascript');
// loadScript('footer', 'https://consent.trustarc.com/v2/notice/qvlbs6', setConsentBasedOnTrustArc, 'text/javascript');

loadScript('header', 'https://www.googleoptimize.com/optimize.js?id=OPT-PXL7MPD', null);

// loadTrustArcFormScript();

/* google tag manager */
// eslint-disable-next-line
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-ZLCX');

loadSalesforceChatScript();

updateExternalLinks();

/**
 * Track Wistia Player events with alloy
 */
function trackWistiaPlayerEvents() {
  // eslint-disable-next-line no-underscore-dangle
  window._wq = window._wq || [];
  // eslint-disable-next-line no-underscore-dangle
  window._wq.push({
    id: "_all", onReady(wistiaItem) {
      const videoType = /podcast/i.test(document.URL) ? "podcast" : "video";

      wistiaItem.bind("play", async () => {
        await analyticsTrackVideo({
          id: `${wistiaItem.hashedId()}`,
          name: `${wistiaItem.name()}`,
          type: videoType,
          hasStarted: true,
        });
      });

      wistiaItem.bind("end", async () => {
        await analyticsTrackVideo({
          id: `${wistiaItem.hashedId()}`,
          name: `${wistiaItem.name()}`,
          type: videoType,
          hasCompleted: true,
        });
      });

      wistiaItem.bind('percentwatchedchanged', async (percent, lastPercent) => {
        // track progress percentage
        let progressMarker;
        if (percent >= .25 && lastPercent < .25) {
          progressMarker = "progress25";
        } else if (percent >= .50 && lastPercent < .50) {
          progressMarker = "progress50";
        } else if (percent >= .75 && lastPercent < .75) {
          progressMarker = "progress75";
        } else if (percent >= .90 && lastPercent < .90) {
          progressMarker = "progress90";
        }
        if (progressMarker) {
          await analyticsTrackVideo({
            id: `${wistiaItem.hashedId()}`,
            name: `${wistiaItem.name()}`,
            type: videoType,
            progressMarker,
          });
        }
      });
    }
  });
}

trackWistiaPlayerEvents();

/**
 * Track external links interaction with alloy
 */
function trackInteractionExternalLinks() {
  const allLinkTags = document.querySelectorAll('header a, main a:not(main div.article-header-share a), footer a:not(footer div.social a)');
	allLinkTags.forEach(item => {
	  // eslint-disable-next-line no-restricted-globals
	  const linkType = item.href.toLowerCase().includes(location.host) ? 'other' : 'exit';
	  item.addEventListener('click', async (event) => {
		  await analyticsTrackLinkClicks(event.currentTarget, linkType);
	  });
  });

  const socialMediaLink = document.querySelectorAll('footer div.social a span');
  socialMediaLink.forEach(item => {
	  const className = Array.from(item.classList).find(name => name.startsWith('icon-'));
	  if (className) {
		const socialNetwork = className.replace('icon-','')
		item.addEventListener('click', async () => {
		  await analyticsTrackSocial(socialNetwork);
		});
	  }
  });
}

trackInteractionExternalLinks();
