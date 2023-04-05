import { buildBlock, getMetadata, toClassName } from './scripts.js';

const pageTitle = document.querySelector('h1').innerText;
const pageUrl = document.querySelector('meta[property="og:url"]').getAttribute('content');
const socialImage = document.querySelector('meta[property="og:image"]').getAttribute('content');
const pageDescription = document.querySelector('meta[property="og:description"]').getAttribute('content');
const author = document.querySelector('.quote div div p:nth-of-type(2)').innerText.split(',')[0];
const datePublished = document.lastModified;
const reviewBody = document.querySelector('.quote div div p:nth-of-type(1)').innerHTML.replace(/["]+/g, '');
const wistiaThumb = getMetadata('wistia-video-thumbnail');
const wistiaVideoId = getMetadata('wistia-video-id');
const wistiaVideoUrl = `https://bamboohr.wistia.com/medias/${wistiaVideoId}`;
const videoDescription = document.querySelector('.video-object-schema div div:nth-of-type(2) p:nth-of-type(1)').innerText;
// console.log(videoDescription, ' video description.');

function createProductSchemaMarkup() {
  const productSchema = {
    '@context': 'http://schema.org/',
    '@type': 'Product',
    'name': pageTitle,
    'url': pageUrl,
    'image': socialImage,
    'description': pageDescription,
    'brand': 'Bamboohr',
    'aggregateRating': {
      '@type': 'aggregateRating',
      'ratingValue': '4.3',
      'reviewCount': '593'
    },
    'review': [
      {
        '@type': 'Review',
        'author': author,
        'datePublished': datePublished,
        'reviewBody': reviewBody,
      }
    ]
  }
  const $productSchema = document.createElement('script', { type: 'application/ld+json' });
  $productSchema.innerHTML = JSON.stringify(productSchema);
  const $head = document.head;
  $head.append($productSchema);
}

function createVideoObjectSchemaMarkup() {
  const videoObjectSchema = {
    '@context': "http://schema.org/",
    '@type': 'VideoObject',
    'name': pageTitle,
    'thumbnailUrl': wistiaThumb,
    'embedUrl': wistiaVideoUrl,
    'uploadDate': datePublished,
    'description': videoDescription,
  }
  const $videoObjectSchema = document.createElement('script', { type: 'application/ld+json' });
  $videoObjectSchema.innerHTML = JSON.stringify(videoObjectSchema);
  const $head = document.head;
  $head.append($videoObjectSchema);
}

function createFaqPageSchemaMarkup() {
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [],
  }

  document.querySelectorAll('.faq-page-schema .accordion').forEach((tab) => {
    console.log(tab, ' this is a tab');
      // const q = tab.querySelector('h2').innerText;
    // const a = tab.querySelector('p').innerText;
    // console.log(q, ' question');
    // console.log(a);
  });
  const $faqPageSchema = document.createElement('script', { type: 'application/ld+json' });
  $faqPageSchema.innerHTML = JSON.stringify(faqPageSchema);
  const $head = document.head;
  $head.append($faqPageSchema);
}

export default async function decorateTemplate() {
  const schemaVals = getMetadata('schema').split(',');
  schemaVals.forEach(val => {
    if (val.indexOf('Product')) {
      // console.log('This is the Product Schema val.');
      createProductSchemaMarkup();
    }
    if (val.indexOf('VidoObject')) {
      createVideoObjectSchemaMarkup();
      // console.log('This is the Video Object Schema.');
    }
    if (val.indexOf('FAQPage')) {
      createFaqPageSchemaMarkup();
      // console.log('This is the FAQ Page Schema.');
    }
  });
}
