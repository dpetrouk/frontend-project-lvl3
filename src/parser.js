import i18n from 'i18next';

const getTextContentFromWorkingSelector = (item, selectors) => selectors
  .reduce((acc, selector) => {
    const selectedElement = item.querySelector(selector);
    return selectedElement ? selectedElement.textContent : acc;
  }, '');

const parseRSS = (data) => {
  try {
    const parser = new DOMParser();
    const documentElement = parser.parseFromString(data, 'text/xml');
    const rssElement = documentElement.querySelector('rss');
    const rss = {
      channel: {
        title: rssElement.querySelector('title').textContent,
        description: rssElement.querySelector('description') ? rssElement.querySelector('description').textContent : '',
      },
      posts: [],
    };
    const items = ['item', 'entry'].reduce((acc, selector) => {
      const selectedElements = rssElement.querySelectorAll(selector)
      return selectedElements.length > 0 ? [...selectedElements] : acc;
    }, []);
    rss.posts = items.reduceRight((acc, item) => {
      const post = {
        title: item.querySelector('title').textContent,
        description: getTextContentFromWorkingSelector(item, ['description', 'content']),
        link: (item.querySelector('link').textContent || item.querySelector('link').getAttribute('href')),
      };
      return [...acc, post];
    }, []);
    return rss;
  } catch(err) {
    throw new Error(i18n.t('errors.resource'));
  }
};

export default parseRSS;