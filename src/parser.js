const getTextContentFromWorkingSelector = (item, selectors) => selectors
  .reduce((acc, selector) => {
    const selectedElement = item.querySelector(selector);
    return selectedElement ? selectedElement.textContent : acc;
  }, '');

const parseRSS = (data) => {
  try {
    const parser = new DOMParser();
    const documentElement = parser.parseFromString(data, 'text/xml');
    console.log('parsing: select rssElement from received RSS DOM');
    const rssElement = documentElement.querySelector('rss') || documentElement.querySelector('feed');
    console.log('parsing: RSS feed');
    const rss = {
      channel: {
        title: rssElement.querySelector('title').textContent,
        description: rssElement.querySelector('description') ? rssElement.querySelector('description').textContent : '',
      },
      posts: [],
    };
    console.log('parsing: collect items');
    const items = ['item', 'entry'].reduce((acc, selector) => {
      const selectedElements = rssElement.querySelectorAll(selector);
      return selectedElements.length > 0 ? [...selectedElements] : acc;
    }, []);
    console.log('parsing: RSS posts');
    rss.posts = items.reduceRight((acc, item) => {
      const post = {
        title: item.querySelector('title').textContent,
        description: getTextContentFromWorkingSelector(item, ['description', 'content']),
        link: item.querySelector('link').textContent || item.querySelector('link').getAttribute('href'),
        id: getTextContentFromWorkingSelector(item, ['id', 'post-id', 'guid']),
      };
      return [...acc, post];
    }, []);
    return rss;
  } catch (err) {
    console.log('parsing: error: \n', err);
    throw new Error('form.feedback.errors.resource');
  }
};

export default parseRSS;
