/* eslint no-param-reassign: ["error", { "props": false }] */

import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import Modal from 'bootstrap/js/dist/modal';
import resources from './locales/resources.js';
import initView from './view.js';
import parseRSS from './rssParser.js';

const languages = ['ru', 'en'];
const defaultLanguage = languages[0];

const proxify = (feed) => {
  const proxy = new URL('https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=');
  proxy.searchParams.set('url', feed);
  return proxy.toString();
};

const getFeed = (feed) => {
  const proxifiedFeed = proxify(feed);
  return axios.get(proxifiedFeed)
    .then((response) => response.data.contents)
    .catch((err) => {
      if (!err.response) {
        err.message = 'form.feedback.errors.network';
      }
      throw err;
    });
};

const generatePosts = (items) => items.reduce((acc, item) => {
  const { title, description, link } = item;
  const post = {
    title,
    description,
    link,
    id: link ?? title ?? description,
  };
  return [post, ...acc];
}, []);

const generateFeed = (data) => {
  try {
    const { title, description, items } = parseRSS(data);
    return {
      channel: {
        title, description,
      },
      posts: generatePosts(items),
    };
  } catch {
    throw new Error('form.feedback.errors.resource');
  }
};

const runApp = (i18nextInstance) => {
  const state = {
    language: defaultLanguage,
    feeds: [],
    posts: [],
    addedUrls: [],
    visited: new Set(),
    form: {
      status: 'filling',
      fields: {
        url: {
          valid: true,
        },
      },
      feedback: null,
    },
    modal: {
      selectedPost: null,
    },
    examples: {
      selected: null,
    },
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      window: document.querySelector('.modal'),
      title: document.querySelector('.modal-title'),
      description: document.querySelector('.modal-body'),
      btnOpen: document.querySelector('.full-article'),
      btnClose: document.querySelector('.modal-footer button'),
    },
    initialTextFields: {
      pageTitle: document.querySelector('title'),
      header: document.querySelector('h1.display-3'),
      pageDescription: document.querySelector('p.lead'),
      labelForInput: document.querySelector('label[for="url-input"]'),
      examplesHeader: document.querySelector('p.text-muted span'),
    },
    btnAdd: document.querySelector('#btnAdd'),
    languageSelector: document.querySelector('#language-selector'),
  };
  const watched = initView(state, elements, i18nextInstance);

  yup.setLocale({
    mixed: {
      required: 'form.feedback.errors.validation.required',
      notOneOf: 'form.feedback.errors.validation.uniqueness',
    },
    string: {
      url: 'form.feedback.errors.validation.url',
    },
  });
  const schema = yup.lazy(() => yup.string().required().url().notOneOf(watched.addedUrls));
  const validate = (value) => schema.validate(value);

  const updateFeed = (sourceUrl) => {
    setTimeout(() => {
      getFeed(sourceUrl)
        .then((data) => {
          const { posts } = generateFeed(data);
          const oldPostsIds = watched.posts.map(({ id }) => id);
          const newPosts = posts.filter(({ id }) => !oldPostsIds.includes(id));
          if (newPosts.length === 0) {
            return;
          }
          watched.posts.push(...newPosts);
        })
        .then(() => updateFeed(sourceUrl))
        .catch((err) => console.log('Updating error: ', err));
    }, 5000);
  };

  elements.languageSelector.addEventListener('click', (e) => {
    const { language } = e.target.dataset;
    if (languages.includes(language)) {
      i18nextInstance.changeLanguage(language).then(() => {
        watched.language = language;
      });
    }
  });

  // Выбор фидов-примеров
  elements.initialTextFields.examplesHeader.parentElement.addEventListener('click', (e) => {
    e.preventDefault();
    const { target } = e;
    if (e.target.nodeName === 'A') {
      watched.examples.selected = '';
      watched.examples.selected = target.textContent;
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(elements.form);
    const sourceUrl = formData.get('url');
    validate(sourceUrl)
      .then(() => {
        watched.form.fields.url.valid = true;
        watched.form.feedback = null;
      })
      .catch((err) => {
        watched.form.fields.url.valid = false;
        throw err;
      })
      .then(() => {
        watched.form.status = 'loading';
        return getFeed(sourceUrl);
      })
      .then((data) => {
        watched.form.status = 'filling';
        const { channel, posts } = generateFeed(data);
        watched.feeds.push(channel);
        watched.posts.push(...posts);
        watched.addedUrls.push(sourceUrl);
        watched.form.feedback = 'form.feedback.success';
      })
      .then(() => updateFeed(sourceUrl))
      .catch((err) => {
        watched.form.feedback = err.message;
        watched.form.status = 'failed';
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (id) {
      watched.visited.add(id);
    }
  });

  Modal.getInstance(elements.modal);
  elements.modal.window.addEventListener('show.bs.modal', (e) => {
    const { id } = e.relatedTarget.dataset;
    if (id) {
      watched.modal.selectedPost = id;
    }
  });
};

const init = () => {
  const i18nextInstance = i18next.createInstance({
    lng: defaultLanguage,
    resources,
  });
  return i18nextInstance
    .init()
    .then(() => {
      runApp(i18nextInstance);
    });
};

export default init;
