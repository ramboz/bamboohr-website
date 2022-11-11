/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const createReferenceBlock = (main, document) => {
  main.querySelectorAll('.HrGlossaryAlsoLike__container').forEach((container) => {
    const cells = [['Reference']];
    container.querySelectorAll('.HrGlossaryAlsoLike__wrapper').forEach((cell) => {
      cells.push([cell]);
    });
    const table = WebImporter.DOMUtils.createTable(cells, document);
    container.replaceWith(table);
  });
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const category = document.querySelector('[property="article:section"]');
  if (category) {
    meta.Category = category.content;
  }

  const date = document.querySelector('[property="article:published_time"]');
  if (date) {
    meta['Publication Date'] = date.content.substring(0, date.content.indexOf('T'));
  }

  const updated = main.querySelector('.blogPostContent__metaModifiedDate');
  if (updated && updated.textContent) {
    const d = updated.textContent.replace('Updated ', '');
    meta['Updated Date'] = new Date(d).toISOString().substring(0, 10);
  }

  const author = main.querySelector('[rel="author"]');
  if (author) {
    meta.Author = author;
  }

  const metatop = main.querySelector('.blogPostContent__metaTop');
  if (metatop) {
    const split = metatop.textContent.trim().split('\n');
    if (split.length === 3) {
      // eslint-disable-next-line prefer-destructuring
      meta['Read Time'] = split[2].trim();
    }
  }

  const img = document.querySelector('[property="og:image"]');
  if (img) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(document.body, [
      'header',
      'footer',
      '.HrGlossarySearch',
      '.HrGlossaryBreadcrumb',
      '.NavbarMobile',
      '.HrGlossaryBanner',
      '.HrGlossaryCalc',
      '.acc-out-of-view',
      '.Footer',
    ]);
    const main = document.querySelector('.HrGlossary');

    createReferenceBlock(main, document);
    createMetadata(main, document);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
};