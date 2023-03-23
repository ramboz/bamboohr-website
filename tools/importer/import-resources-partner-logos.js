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
/* global */
/* eslint-disable no-console, class-methods-use-this */

export default {
  preprocess: ({ document, params }) => {
    const partners = [...document.querySelectorAll('.AssetTopLogo')].map((img) => img.src);
    partners.shift();
    console.log('partners',partners);
    params.partners = partners;
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transform: ({ params }) => {
    console.log('partners',params.partners);
    return {
      path:  new URL(params.originalURL).pathname,
      report: {
        partners: `https:${params.partners}`,
      }
    };
  },
};