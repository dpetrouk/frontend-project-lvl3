import * as yup from 'yup';
//.import _ from 'lodash';
import axios from 'axios';
import initView from './view.js';

// i18n

/*
const errorMessages = {
  form: {
    error: 'Ссылка должна быть валидным URL',
  },
  network: {
    error: 'Ошибка сети',
  },
  resource: {
    error: 'Ресурс не содержит валидный RSS',
  },
};
*/
const errorsMapping = {
  'this must be a valid URL': 'Ссылка должна быть валидным URL',
  'Network Error': 'Ошибка сети',
};

const schema = yup.string().url();


const getFeed = (feed) => {
  const proxiedUrl = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(feed)}`;
  return axios.get(proxiedUrl)
    .then((response) => response.data.contents)
    .catch((err) => {
      throw err;
    });
};

const form = document.querySelector('.rss-form');
const input = document.getElementById('url-input');
const submitBtn = document.querySelector('button[type="submit"]');
const feedbackElement = document.querySelector('.feedback');
const feedsElement = document.querySelector('.feeds');
const postsElement = document.querySelector('.posts');

const elements = { form, input, submitBtn, feedbackElement, feedsElement, postsElement };


// Удалить позже
const urlExamples = [...document.querySelectorAll('.link-secondary')];
urlExamples.forEach((urlElement) => {
  urlElement.addEventListener('click', (e) => {
    e.preventDefault();
    input.value = urlElement.textContent;
  })
});

const parseRSS = (data) => {
  const parser = new DOMParser();
  const rssDOM = parser.parseFromString(data, 'text/xml');
  const rss = {
    channel: {
      title: rssDOM.querySelector('title').textContent,
      description: rssDOM.querySelector('description') ? rssDOM.querySelector('description').textContent : '',
    },
    posts: [],
  };
  const items = ['item', 'entry'].reduce((acc, selector) => {
    const selectedElements = rssDOM.querySelectorAll(selector)
    return selectedElements.length > 0 ? [...selectedElements] : acc;
  }, []);
  rss.posts = items.map((item) => {
    const post = {
      title: item.querySelector('title').textContent,
      description: ['description', 'content'].reduce((acc, selector) => {
        const selectedElement = item.querySelector(selector);
        return selectedElement ? selectedElement.textContent : acc;
      }, ''),
      link: (item.querySelector('link').textContent || item.querySelector('link').getAttribute('href')),
    };
    return post;
  });
  return rss;
};

const app = () => {
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

  const watched = initView(state, elements);

  const validate = (value) => {
    try {
      schema.validateSync(value);
      if (watched.addedUrls.includes(value)) {
        throw new Error('RSS уже существует');
      }
      return null;
    } catch (err) {
      return err.message;
    }
  };
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const sourceUrl = formData.get('url');
  
    const error = validate(sourceUrl);
  
    if (error) {
      watched.form.fields.url = {
        valid: false,
      };
      watched.form.feedback = error;
      console.log(watched.form.feedback);
      return;
    }

    watched.form.fields.url = {
      valid: true,
    };

    watched.form.feedback = null;
    watched.form.status = 'loading';

    getFeed(sourceUrl)
      .then((data) => {
        watched.form.status = 'filling';
        watched.form.feedback = 'RSS успешно загружен';
        watched.addedUrls.push(sourceUrl);
        const { channel, posts } = parseRSS(data);
        watched.feeds.push(channel);
        watched.posts.push(...posts);
      })
      .catch((err) => {
        watched.form.feedback = errorsMapping[err.message] || err.message;
        console.log(err, watched.form.feedback);
        watched.form.status = 'failed';
      });
  });
};

export default app;