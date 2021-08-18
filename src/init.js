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

const getFeed = async (feed) => {
  const proxifiedFeed = proxify(feed);
  try {
    const response = await axios.get(proxifiedFeed);
    return response.data.contents;
  } catch (err) {
    if (!err.response) {
      err[Symbol('translationKey')] = 'form.feedback.errors.network';
    }
    throw err;
  }
};

const generatePosts = (items) => items.reduce((acc, item) => {
  const { title, description, link } = item;
  const post = {
    title,
    description,
    link,
    id: link ?? title ?? description, // hash may be generated here instead
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
  } catch (err) {
    err[Symbol('translationKey')] = 'form.feedback.errors.resource';
    throw err;
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

  const yupTranslationKeysMapping = {
    required: 'form.feedback.errors.validation.required',
    notOneOf: 'form.feedback.errors.validation.uniqueness',
    url: 'form.feedback.errors.validation.url',
  };
  const schema = yup.lazy(() => yup.string().required().url().notOneOf(watched.addedUrls));
  const validate = (value) => schema.validate(value).catch((err) => {
    err[Symbol('translationKey')] = yupTranslationKeysMapping[err.type];
    throw err;
  });

  const updateFeed = (sourceUrl) => {
    setTimeout(async () => {
      const data = await getFeed(sourceUrl);
      const { posts } = generateFeed(data);
      const oldPostsIds = watched.posts.map(({ id }) => id);
      const newPosts = posts.filter(({ id }) => !oldPostsIds.includes(id));
      if (newPosts.length !== 0) {
        watched.posts.push(...newPosts);
      }
      updateFeed(sourceUrl);
    }, 5000);
  };

  elements.languageSelector.addEventListener('click', async (e) => {
    const { language } = e.target.dataset;
    if (languages.includes(language)) {
      await i18nextInstance.changeLanguage(language);
      watched.language = language;
    }
  });

  // Add handlers for examples
  elements.initialTextFields.examplesHeader.parentElement.addEventListener('click', (e) => {
    e.preventDefault();
    const { target } = e;
    if (e.target.nodeName === 'A') {
      watched.examples.selected = '';
      watched.examples.selected = target.textContent;
    }
  });

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.form);
    const sourceUrl = formData.get('url');
    try {
      await validate(sourceUrl);
      watched.form.fields.url.valid = true;
      watched.form.feedback = null;
      watched.form.status = 'loading';
      const data = await getFeed(sourceUrl);
      watched.form.status = 'filling';
      const { channel, posts } = generateFeed(data);
      watched.feeds.push(channel);
      watched.posts.push(...posts);
      watched.addedUrls.push(sourceUrl);
      watched.form.feedback = 'form.feedback.success';
      updateFeed(sourceUrl);
    } catch (err) {
      watched.form.fields.url.valid = false;
      const key = Object.getOwnPropertySymbols(err)
        .find((item) => item.description === 'translationKey');
      watched.form.feedback = err[key];
      watched.form.status = 'failed';
    }
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

const init = async () => {
  const i18nextInstance = i18next.createInstance({
    lng: defaultLanguage,
    resources,
  });
  await i18nextInstance.init();
  runApp(i18nextInstance);
};

export default init;
