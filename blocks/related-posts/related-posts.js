import { getMetadata, lookupPages } from '../../scripts/scripts.js';
import { filterArticles } from '../article-feed/article-feed.js';
import { createBlogCard } from '../featured-articles/featured-articles.js';

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => {
    let { pathname } = new URL(a.href);
    if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return pathname;
  });
  block.textContent = '';
  let articles = await lookupPages(pathnames, 'blog');
  if (!articles.length) {
    const feed = { data: [], complete: false, cursor: 0 };
    await filterArticles({ category: getMetadata('category') }, feed, 4, 0);
    articles = feed.data.slice(0, 4);
  }
  articles.forEach((article) => {
    block.append(createBlogCard(article, 'related-posts'));
  });

  // Adds .no-background class to related posts block
  const relatedPostsWrapper = document.querySelectorAll('.related-posts-wrapper');
  relatedPostsWrapper.forEach((relatedPost) => {
    if (relatedPost.querySelector('.no-background')) {
      relatedPost.classList.add('no-background');
    }
  });
}
