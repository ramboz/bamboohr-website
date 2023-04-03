import { buildBlock, getMetadata, toClassName } from './scripts.js';

const name = document.getElementsByTagName('h1')[0].innerText;
const url = document.querySelector('meta[property="og:url"]').getAttribute('content');
const image = document.querySelector('meta[property="og:image"]').getAttribute('content');
const description = document.querySelector('meta[property="og:description"]').getAttribute('content');
const author = document.querySelector('.quote div div p:nth-of-type(2)').innerText.split(',')[0];
const datePublished = document.lastModified;
const reviewBody = document.querySelector('.quote div div p:nth-of-type(1)').innerHTML.replace(/["]+/g, '');
// const wistiaId = document.wistiaVideoId;
const wistiaVideoId = getMetadata('wistia-video-id');
console.log(wistiaVideoId, ' this is the wistia video id');
const wistiaVideoUrl = `https://bamboohr.wistia.com/medias/${wistiaVideoId}`;
// const wistiaThumb = document.querySelector('.column7 .wistia.block.is-loaded picture img').getAttribute('src');
// console.log(wistiaThumb, ' this is the thumbnail url');
// const wistiaData = [];
// if (wistiaVideoId) {
//   wistiaData.push(`<p><a href="${wistiaVideoUrl}"></a></p>`);
//   wistiaData.push(`<h3>Watch on demand</h3><p>Please note if this webinar was approved for professional certification, those credits are only sent to registrants who attended the live session and were logged on for the amount of time required by the certification vendor.</p>`);
// }

function createProductSchemaMarkup() {
  const productSchema = {
    '@context': 'http://schema.org/',
    '@type': 'Product',
    'name': name,
    'url': url,
    'image': image,
    'description': description,
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
    'name': name,
    // 'thumbnailUrl': "{{ pageVars.getVideoScreenshot.getFile.getUrl }}",
    'embedUrl': wistiaVideoUrl,
    'uploadDate': datePublished,
    'description': description,
  }
  const $videoObjectSchema = document.createElement('script', { type: 'application/ld+json' });
  $videoObjectSchema.innerHTML = JSON.stringify(videoObjectSchema);
  const $head = document.head;
  $head.append($videoObjectSchema);
}

export default async function decorateTemplate() {
  const schemaVals = getMetadata('schema').split(',');
  schemaVals.forEach(val => {
    if (val.indexOf('Product')) {
      console.log('This is the Product Schema val.');
      createProductSchemaMarkup();
    }
    if (val.indexOf('VidoObject')) {
      createVideoObjectSchemaMarkup()
      console.log('This is the Video Object Schema.');
    }
  });
}
