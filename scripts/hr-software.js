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
    'mainEntity': [
      // {
      //   "@type": "Question",
      //   "name": "Can I hire using the BambooHR® Mobile app?",
      //   "acceptedAnswer": {
      //     "@type": "Answer",
      //     "text": "You can hire and recruit with BambooHR on your smartphone using the BambooHR® Hiring app (available for iOS and Android). The app is designed specifically for anyone involved in the hiring process. You can use it to review candidates the instant they apply, coordinate with other hiring team members, and communicate directly with applicants. (The BambooHR Hiring app is separate from the BambooHR Mobile app, which is designed for managers and employees.)"
      //   }
      // },
      // {
      //   "@type": "Question",
      //   "name": "Which job boards do you integrate with?",
      //   "acceptedAnswer": {
      //     "@type": "Answer",
      //     "text": "Once you create a job posting in BambooHR, it just takes a couple of clicks to share it on Indeed, Glassdoor, ZipRecruiter (coming summer 2021), Facebook Jobs (also coming summer 2021), and social media sites like LinkedIn, Facebook, and Twitter."
      //   }
      // },
      // {
      //   "@type": "Question",
      //   "name": "Can I send offer letters to be signed electronically?",
      //   "acceptedAnswer": {
      //     "@type": "Answer",
      //     "text": "Yes! With BambooHR, you can create professional offer letters and send them to new hires to sign electronically, along with any other documents or disclosures you need from them."
      //   }
      // },
      // {
      //   "@type": "Question",
      //   "name": "What happens when someone accepts my offer letter?",
      //   "acceptedAnswer": {
      //     "@type": "Answer",
      //     "text": "BambooHR helps you move seamlessly from hiring to onboarding with customizable new hire packets: let new hires know what to expect on their first day, introduce them to their new team, and get important paperwork signed electronically even before their start date."
      //   }
      // }
    ],
  }
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
      console.log('This is the FAQ Page Schema.');
    }
  });
}
