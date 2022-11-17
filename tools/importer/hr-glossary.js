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

const createCalloutBlock = (main, document) => {
  main.querySelectorAll('.HrGlossaryTerm__contentCta').forEach((callout) => {
    const cells = [['Callout']];
    // let blockName = 'Callout';

    // cells.push([blockName]);

    const container = document.createElement('div');

    const firstText = callout.querySelector('.HrGlossaryTerm__contentCtaTitle');
    if (firstText) {
      const h = document.createElement('h3');
      h.innerHTML = firstText.textContent;
      container.append(h);
    }

    const sub = callout.querySelector('.HrGlossaryTerm__contentCtaSubheading');
    if (sub) {
      const p = document.createElement('p');
      p.innerHTML = sub.innerHTML;
      container.append(p);
    }

    cells.push([container]);

    const cta = callout.querySelector('a');
    if (cta) {
      cells.push([cta]);
    }
    callout.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
  });
};

const createReferenceBlock = (main, document) => {
  main.querySelectorAll('.HrGlossaryAlsoLike__container').forEach((container) => {
    const cells = [['Cards (image top, 3 columns)']];
    container.querySelectorAll('.HrGlossaryAlsoLike__wrapper').forEach((cell) => {
      cells.push([cell]);
    });
    const table = WebImporter.DOMUtils.createTable(cells, document);
    container.replaceWith(table);
  });
};

const createReferenceBlock2 = (main, document) => {
  main.querySelectorAll('.HrGlossaryAlsoLike__container').forEach((container) => {
    const cells = [['Cards (image top, 3 columns)']];
    const mainContainer = document.createElement('div');

    container.querySelectorAll('.HrGlossaryAlsoLike__wrapper').forEach((wrapper) => {
      const wrapper = document.createElement('div');
      const image = wrapper.querySelector('.HrGlossaryAlsoLike__image');
      if (image) {
        const img = document.createElement('img');
        img.src = image.content;
        wrapper.append(img);
      }

      // cells.push([wrapper]);
      // cells.push([cell]);
    });
    // wrapper.push[[mainContainer]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    mainContainer.replaceWith(table);
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

  const img = document.querySelector('[property="og:image"]');
  if (img) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const term = document.querySelector('h1');
  if (term) {
    meta.Term = term.innerHTML.replace(/[\n\t]/gm, '');
  }

  meta.Template = 'HR Glossary';
  
  meta.Theme = 'green';

  meta.Category = '';

  meta.Robots = '';

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
      // '.HrGlossaryAlsoLike',
      // '.HrGlossaryTerm__contentCtaWrap',
      '.acc-out-of-view',
      '.Footer',
    ]);
    const main = document.querySelector('.HrGlossary');
    createCalloutBlock(main, document);
    createReferenceBlock(main, document);
    // createReferenceBlock2(main, document);
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