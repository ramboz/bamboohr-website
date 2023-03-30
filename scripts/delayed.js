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
import { analyticsSetConsent, analyticsTrackLinkClicks, analyticsTrackVideo } from './lib-analytics.js';

sampleRUM('cwv');

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
  $script.src = url;
  if (type) {
    $script.setAttribute('type', type);
  }
  if (defer && $script.src) {
    $script.defer = defer;
  }
  if (location === 'header') {
    $head.append($script);
  } else if (location === 'footer') {
    $body.append($script);
  }
  $script.onload = callback;
  return $script;
}

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

  // TODO: revert to non-proxied url before merging
  const trustArcFormSrc = 'https://tracker.ekremney.workers.dev/?thirdPartyTracker=https://form-renderer.trustarc.com/browser/client.js';
  loadScript('header', trustArcFormSrc, null, 'text/javascript', true);
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

// TODO: revert to non-proxied url before merging
loadScript('footer', 'https://tracker.ekremney.workers.dev/?thirdPartyTracker=https://consent.trustarc.com/v2/notice/qvlbs6', setConsentBasedOnTrustArc, 'text/javascript');

loadScript('header', 'https://www.googleoptimize.com/optimize.js?id=OPT-PXL7MPD', null);

loadTrustArcFormScript();

/* google tag manager */
// eslint-disable-next-line
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-ZLCX');

/* This is temporary code to load our homepage convert test mid-test.
 we are loading here to avoid the delay "long flicker" before the test page is loaded.
 This type of test should be handled in Adobe Franklin experiments going forward.
*/
// const testPaths = [
//   '/resources/hr-glossary/performance-review'
// ];
// const isOnTestPath = testPaths.includes(window.location.pathname);
// if (isOnTestPath) {
const $head = document.querySelector('head');
const $script = document.createElement('script');
$script.src = 'https://cdn-4.convertexperiments.com/js/10004673-10005501.js';
$head.append($script);
// }
/* This is the end of the temporary convert test code */

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
  const loginLinks = document.querySelectorAll('[href="https://app.bamboohr.com/login/"], [href="https://partners.bamboohr.com/login/"]');
  loginLinks.forEach(item => {
    item.addEventListener('click', async (event) => {
      await analyticsTrackLinkClicks(event.currentTarget, 'exit');
    });
  });

  const mobileAppLinks = document.querySelectorAll('[href="https://apps.apple.com/us/app/bamboohr/id587244049"], ' +
    '[href="https://play.google.com/store/apps/details?id=com.mokinetworks.bamboohr"]');
  mobileAppLinks.forEach(item => {
    item.addEventListener('click', async (event) => {
      await analyticsTrackLinkClicks(event.currentTarget, 'exit');
    });
  });

  const phoneNumberLinks = document.querySelectorAll('[href^="tel:"]');
  phoneNumberLinks.forEach(item => {
    item.addEventListener('click', async (event) => {
      await analyticsTrackLinkClicks(event.currentTarget, 'exit');
    });
  });

  const socialMediaLink = document.querySelectorAll('main div.article-header-share a, footer div.social a');
  socialMediaLink.forEach(item => {
    item.addEventListener('click', async (event) => {
      await analyticsTrackLinkClicks(event.currentTarget, 'exit');
    });
  });
}

trackInteractionExternalLinks();
