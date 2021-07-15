import axios from 'axios';
import i18n from 'i18next';
import * as yup from 'yup';
import resources from './locales/resources.js';
import initView from './view.js';
import parseRSS from './parser.js';


const getFeed = (feed) => {
  const proxiedUrl = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(feed)}`;
  return axios.get(proxiedUrl)
    .then((response) => response.data.contents)
    .catch((err) => {
      if (err === 'Network Error') {
        throw new Error(i18n.t('errors.network'));
      }
      throw err;
    });
};

const app = () => {
  const defaultLanguage = 'ru';
  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  });

  const state = {
    feeds: [],
    posts: [],
    addedUrls: [],
    form: {
      status: 'filling',
      fields: {
        url: {
          valid: true,
        },
      },
      feedback: null,
    },
  };
  const elements = { 
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedbackElement: document.querySelector('.feedback'),
    feedsElement: document.querySelector('.feeds'),
    postsElement: document.querySelector('.posts'),
  };
  const watched = initView(state, elements);

  // Удалить позже
  const urlExamples = [...document.querySelectorAll('.link-secondary')];
  urlExamples.forEach((urlElement) => {
    urlElement.addEventListener('click', (e) => {
      e.preventDefault();
      elements.input.value = urlElement.textContent;
    })
  });

  yup.setLocale({
    string: {
      url: i18n.t('errors.validation.url'),
    },
  });
  const schema = yup.string().url();
  const validate = (value) => schema.validate(value)
    .then(() => {
      if (watched.addedUrls.includes(value)) {
        throw new Error(i18n.t('errors.validation.uniqueness'));
      }
      return null;
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
        const { channel, posts } = parseRSS(data);
        watched.feeds.push(channel);
        watched.posts.push(...posts);
        watched.addedUrls.push(sourceUrl);
        watched.form.feedback = i18n.t('feedback.success');
      })
      .catch((err) => {
        watched.form.feedback = err.message;
        watched.form.status = 'failed';
      });
  });
};

export default app;