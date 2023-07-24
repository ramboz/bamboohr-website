import { createElem, createOptimizedPicture } from '../../scripts/scripts.js';

function canReadPic(path) {
    let readPic = true;
    const noPicList = ['/pl-pages/demo-request/', '/lp/demo/', '/lp/payroll/', '/signup/', '/pricing/'];
    noPicList.some(p => {
        if (path === p) {
            readPic = false;
            return true;
        }
        return false;
    });

    return readPic;
}

function createLinkButton(link) {
    const button = createElem('p', 'button-container');
    const btnLink = document.createElement('a');
    btnLink.className = 'button accent';
    btnLink.href = link.pathname;
    btnLink.textContent = 'Register Now';
    btnLink.title = btnLink.textContent;
    button.append(btnLink);

    return button;
}

function findDescription(block) {
    let desc = null;
    const pList = block.querySelectorAll('p');
    const ps = [...pList];
    ps.some(p => {
        if (!p.classList.contains('button-container') && p.textContent) {
            desc = p;
            return true;
        }

        return false;
    });

    return desc;
}

/**
 * Retrieves the content of a metadata tag from the dom param.
 * @param {Document} dom Parsed from the page fetch
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
 function getDomMetadata(dom, name) {
    const attr = name && name.includes(':') ? 'property' : 'name';
    const meta = dom.head.querySelector(`meta[${attr}="${name}"]`);
    return meta && meta.content;
}

export default async function decorate(block) {
    const skipImageRead = block.classList.contains('no-image');

    // Create a card with 2 parts: text and image
    const card = createElem('div', 'callout-card');
    const calloutText = createElem('div', 'callout-text');
    const calloutImg = createElem('div', 'callout-image');
    card.append(calloutText);
    card.append(calloutImg);

    // Look for existing elements in the block configuration
    const topic = block.querySelector('h4');
    let title = block.querySelector('h3');
    let desc = findDescription(block);
    const link = block.querySelector('a');
    let button = null;
    if (link.parentElement.classList.contains('button-container')) button = link.parentElement;
    let pic = block.querySelector('picture');
    const readPic = skipImageRead ? false : canReadPic(link.pathname);

    // If elements are missing read the link page's metadata and create them.
    if (link && (!title || !desc || (readPic && !pic))) {
        const resp = await fetch(`${link.pathname}`);
        const text = await resp.text();
        const dom = new DOMParser().parseFromString(text, 'text/html');

        if (!title) {
            const titleText = getDomMetadata(dom, 'og:title');
            if (titleText) {
                title = document.createElement('h3');
                title.innerHTML = titleText;
            }
        }

        if (!desc) {
            const descText = getDomMetadata(dom, 'og:description');
            if (descText) {
                desc = document.createElement('p');
                desc.innerHTML = descText;
            }
        }

        if (readPic && !pic) {
            const img = getDomMetadata(dom, 'og:image');
            if (img) pic = createOptimizedPicture(img, title, false, [{ width: 750 }]);
        }
    }

    if (link && !button) button = createLinkButton(link);

    // Add elements to card text and card image
    if (topic) calloutText.append(topic);
    if (title) calloutText.append(title);
    if (desc) calloutText.append(desc);
    if (button) calloutText.append(button);
    if (pic) calloutImg.append(pic);

    // Add block and wrapper classes
    if (calloutImg.children.length) calloutText.classList.add('callout-has-image');
    else {
        calloutImg.remove();
        calloutText.classList.add('callout-text-only');
    }
    const isSmall = block.classList.contains('small');
    let wrapperWidth = 'width-medium';
    if (calloutImg.children.length === 0 || isSmall) wrapperWidth = 'width-small';
    block.parentElement.classList.add(wrapperWidth);

    block.innerHTML = '';
    block.append(card);
}
