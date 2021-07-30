import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import Modal from 'bootstrap/js/dist/modal';
import resources from './locales/resources.js';
import initView from './view.js';
import parseRSS from './parser.js';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';

const getFeed = (feed) => {
  const proxiedUrl = `${proxy}${encodeURIComponent(feed)}`;
  return axios.get(proxiedUrl)
    .then((response) => response.data.contents)
    .catch((err) => {
      if (err.message === 'Network Error') {
        throw new Error('form.feedback.errors.network');
      }
      throw err;
    });
};

const app = () => {
  const defaultLanguage = 'ru';
  i18n.init({
    lng: defaultLanguage,
    resources,
  });

  const state = {
    feeds: [],
    posts: [],
    postsIds: [],
    addedUrls: [],
    visited: [],
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
  };
  const watched = initView(state, elements);

  yup.setLocale({
    mixed: {
      required: 'form.feedback.errors.validation.required',
    },
    string: {
      url: 'form.feedback.errors.validation.url',
    },
  });
  const schema = yup.string().required().url();
  const validate = (value) => schema.validate(value)
    .then(() => {
      if (watched.addedUrls.includes(value)) {
        throw new Error('form.feedback.errors.validation.uniqueness');
      }
      return null;
    });

  const updateFeed = (sourceUrl) => {
    setTimeout(() => {
      getFeed(sourceUrl)
        .then((data) => {
          const { posts } = parseRSS(data);
          const newPosts = posts.filter(({ id }) => !watched.postsIds.includes(id));
          if (newPosts.length === 0) {
            return;
          }
          watched.posts.push(...newPosts);
          const newPostsIds = newPosts.map(({ id }) => id);
          watched.postsIds.push(...newPostsIds);
        })
        .then(() => updateFeed(sourceUrl))
        .catch((err) => console.log('Updating error: ', err));
    }, 5000);
  };

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
        const { channel, posts } = parseRSS(data);
        watched.feeds.push(channel);
        watched.posts.push(...posts);
        const postsIds = posts.map(({ id }) => id);
        watched.postsIds.push(...postsIds);
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
    if (id && !watched.visited.includes(id)) {
      watched.visited.push(id);
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

export default app;
