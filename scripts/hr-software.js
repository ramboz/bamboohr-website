import { buildBlock, getMetadata, toClassName } from './scripts.js';

// const pageTitle = document.querySelector('h1').innerText;
// const pageUrl = document.querySelector('meta[property="og:url"]').getAttribute('content');
// const socialImage = document.querySelector('meta[property="og:image"]').getAttribute('content');
// const pageDescription = document.querySelector('meta[property="og:description"]').getAttribute('content');
// const author = document.querySelector('.quote div div p:nth-of-type(2)').innerText.split(',')[0];
// const datePublished = document.lastModified;
// const reviewBody = document.querySelector('.quote div div p:nth-of-type(1)').innerHTML.replace(/["]+/g, '');
// const wistiaThumb = getMetadata('wistia-video-thumbnail');
// const wistiaVideoId = getMetadata('wistia-video-id');
// const wistiaVideoUrl = `https://bamboohr.wistia.com/medias/${wistiaVideoId}`;
// const videoDescription = document.querySelector('.video-object-schema div div:nth-of-type(2) p:nth-of-type(1)').innerText;

// function createProductSchemaMarkup() {
//   const productSchema = {
//     'schemeId': 'Product Schema',
//     '@context': 'http://schema.org/',
//     '@type': 'Product',
//     'name': pageTitle,
//     'url': pageUrl,
//     'image': socialImage,
//     'description': pageDescription,
//     'brand': 'Bamboohr',
//     'aggregateRating': {
//       '@type': 'aggregateRating',
//       'ratingValue': '4.3',
//       'reviewCount': '593'
//     },
//     'review': [
//       {
//         '@type': 'Review',
//         'author': author,
//         'datePublished': datePublished,
//         'reviewBody': reviewBody,
//       }
//     ]
//   }
//   const $productSchema = document.createElement('script', { type: 'application/ld+json' });
//   $productSchema.innerHTML = JSON.stringify(productSchema);
//   const $head = document.head;
//   $head.append($productSchema);
// }

// function createVideoObjectSchemaMarkup() {
//   const videoObjectSchema = {
//     'schemeId': 'VideoObject Schema',
//     '@context': "http://schema.org/",
//     '@type': 'VideoObject',
//     'name': pageTitle,
//     'thumbnailUrl': wistiaThumb,
//     'embedUrl': wistiaVideoUrl,
//     'uploadDate': datePublished,
//     'description': videoDescription,
//   }
//   const $videoObjectSchema = document.createElement('script', { type: 'application/ld+json' });
//   $videoObjectSchema.innerHTML = JSON.stringify(videoObjectSchema);
//   const $head = document.head;
//   $head.append($videoObjectSchema);
// }

// function createFaqPageSchemaMarkup() {
//   const faqPageSchema = {
//     'schemeId': 'FAQPage Schema',
//     '@context': 'https://schema.org',
//     '@type': 'FAQPage',
//     mainEntity: [],
//   }

//   document.querySelectorAll('.accordion').forEach((tab, i) => {
//     console.log(tab, ' this is a tab');
//     // const q = tab.querySelector('h2').innerText;
//     // // console.log(q, ' question');
//     // const a = tab.querySelector('p').innerText;
//     // // console.log(a, ' answer');
//     // if (q && a) {
//     //   faqPageSchema.mainEntity.push({
//     //     '@type': 'HowToStep',
//     //     position: i + 1,
//     //     name: q.textContent.trim(),
//     //     acceptedAnswer: {
//     //       '@type': 'Answer',
//     //       text: a.textContent.trim(),
//     //     },
//     //   });
//     // }
//   });
//   const $faqPageSchema = document.createElement('script', { type: 'application/ld+json' });
//   $faqPageSchema.innerHTML = JSON.stringify(faqPageSchema);
//   const $head = document.head;
//   $head.append($faqPageSchema);
// }

export default async function decorateTemplate() {
  // const schemaVals = getMetadata('schema').split(',');
  // // console.log(schemaVals);
  // schemaVals.forEach(val => {
  //   switch(val.trim()) {
  //     case 'Product':
  //       createProductSchemaMarkup();
  //       break;
  //     case 'VideoObject':
  //       createVideoObjectSchemaMarkup();
  //       break;
  //     case 'FAQPage':
  //       createFaqPageSchemaMarkup();
  //       break;
  //     default:
  //   }
    // if (val === 'Product') {
    //   // console.log(val, 'product val');
    //   createProductSchemaMarkup();
    // }
    // if (val === 'VidoObject') {
    //   // console.log(val, 'video object val');
    //   createVideoObjectSchemaMarkup();
    // }
    // if (val === 'FAQPage') {
    //   createFaqPageSchemaMarkup();
    // }
  // });
}
