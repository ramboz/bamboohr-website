import {
  // createOptimizedPicture,
  // formatDate,
  getMetadata,
} from '../../scripts/scripts.js';

function createProductSchema() {
  const name = getMetadata('title');
  const presenter = getMetadata('presenter');
  const { title } = document;
  const description = getMetadata('description');
  const category = getMetadata('category');
  let dateString = getMetadata('presentation-date');
  if (dateString.includes(' ')) [dateString] = dateString.split(' ');
  const presentationDate = formatDate(dateString);
  const image = getMetadata('metadata-content-image');
  const picture = createOptimizedPicture(image, false, [{ width: '286' }]);

  content.innerHTML = `
    <div class="content-container">
      <div class="content-image">${picture.outerHTML}</div>
      <div class="content-body" am-region="${title}">
        <h3>${presenter}</h3>
        <h1>${title}</h1>
        <p>${description}</p>
        <span class="content-category">${category}</span> 
        <span class="content-date">${presentationDate}</span>
      </div>
    </div>`;
  return (content);
  console.log('helo world');

}

export default async function decorate(block) {
  block.append(createProductSchema());
}



// const schemaProduct {
//   '@context': 'http://schema.org',
//   '@type': 'Product',
//   name: (getMetadata('title')) || document.title,
//   url: get,
// };











/* <script type="application/ld+json">
{
  "@context": "http://schema.org/",
  "@type": "Product",
  "name": "{{ pageVars.getTitle }}",
  "url": "https://www.bamboohr.com/{{ pageVars.getSlug }}/",
  "image": "https:{{ pageVars.getFeatureBand[0].getImage.getFile.getUrl }}",
  "description": "{{ header_metaDescription }}",
  "brand": "BambooHR",
  "aggregateRating": {
    "@type": "aggregateRating",
    "ratingValue": "4.3",
    "reviewCount": "593"
  },
  "review": [
    {
      "@type": "Review",
      "author": "{{ pageVars.getCustomerQuote.getName | split(',')[0] }}",
      "datePublished": "{{ pageVars.getSystemProperties.getUpdatedAt | date("Y-m-d") }}",
      "reviewBody": "{{ pageVars.getCustomerQuote.getQuote | trim }}"
    }
  ]
}
</script>

{% if (pageVars.getBannerWistiaId) %}
  <script type="application/ld+json">
  {
    "@context": "http://schema.org/",
    "@type": "VideoObject",
    "name": "{{ pageVars.getTitle }}",
    "thumbnailUrl": "{{ pageVars.getVideoScreenshot.getFile.getUrl }}",
    "embedUrl":"https://fast.wistia.net/embed/iframe/{{ pageVars.getBannerWistiaId }}",
    "uploadDate": "{{ pageVars.getSystemProperties.getCreatedAt }}",
    "description": "{{ pageVars.getFeatureBand[0].getDescription }}"
  }
</script> */