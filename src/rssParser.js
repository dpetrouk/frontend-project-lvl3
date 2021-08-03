const generateItem = (element) => {
  const children = [...element.children];
  const item = children.reduce((acc, child) => {
    const name = child.nodeName;
    return { ...acc, [name]: child.textContent };
  }, {});
  return item;
};

const generateRSSObject = (rssElement) => {
  const channelElement = rssElement.querySelector('channel');
  const channelChildren = [...channelElement.children];
  const rssObject = channelChildren.reduce((acc, child) => {
    const name = child.nodeName;
    if (name !== 'item') {
      return { ...acc, [name]: child.textContent };
    }
    const accItems = acc.items ?? [];
    const item = generateItem(child);
    return { ...acc, items: [...accItems, item] };
  }, {});
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
