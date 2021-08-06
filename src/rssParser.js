const generateItem = (element) => {
  const children = [...element.children];
  const item = children.reduce((acc, child) => {
    const name = child.nodeName;
    return { ...acc, [name]: child.textContent };
  }, {});
  return item;
};

const generateRSSObject = (rssElement) => {
  const title = rssElement.querySelector('title').textContent;
  const link = rssElement.querySelector('link').textContent;
  const description = rssElement.querySelector('description').textContent;
  const itemElements = rssElement.querySelectorAll('item');
  const items = [...itemElements].map((item) => generateItem(item));
  const rssObject = {
    title,
    link,
    description,
    items,
  };
  return rssObject;
};

const parseRSS = (rssString) => {
  const domParser = new DOMParser();
  const rssDOM = domParser.parseFromString(rssString, 'text/xml');
  const rssElement = rssDOM.querySelector('rss');
  const rssObject = generateRSSObject(rssElement);
  return rssObject;
};

export default parseRSS;
