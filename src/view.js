/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint quote-props: ["error", "consistent-as-needed"] */

import onChange from 'on-change';
import i18n from 'i18next';

const renderFeedback = (form, elements) => {
  elements.feedback.textContent = i18n.t(form.feedback);
};

const renderFormErrors = (form, elements) => {
  const field = form.fields.url;
  if (field.valid) {
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
  } else {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
  }
};

const renderForm = (form, elements) => {
  switch (form.status) {
    case 'filling':
      elements.submitBtn.disabled = false;
      elements.input.readOnly = false;
      elements.input.value = '';
      elements.input.focus();
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      break;
    case 'failed':
      elements.submitBtn.disabled = false;
      elements.input.readOnly = false;
      elements.input.select();
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      break;
    case 'loading':
      elements.submitBtn.disabled = true;
      elements.input.readOnly = true;
      break;
    default:
      throw new Error(`Unknown form status: ${form.status}`);
  }
};

const renderFeeds = (feeds, elements) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  container.innerHTML = `<div class="card-body"><h2 class="card-title h4">${i18n.t('feeds.header')}</h2</div>`;
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.forEach((channel) => {
    const { description, title } = channel;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = description;
    li.append(h3, p);
    ul.prepend(li);
  });
  container.append(ul);
  if (container.textContent !== i18n.t('feeds.header')) {
    elements.feeds.innerHTML = '';
    elements.feeds.append(container);
  }
};

const createPostContainer = () => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  return li;
};

const createLinkElement = () => {
  const a = document.createElement('a');
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  return a;
};

const createButtonElement = () => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btn.setAttribute('data-bs-toggle', 'modal');
  btn.setAttribute('data-bs-target', '#modal');
  return btn;
};

const renderPosts = ({ visited, posts }, elements) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  container.innerHTML = `<div class="card-body"><h2 class="card-title h4">${i18n.t('posts.header')}</h2</div>`;
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const templates = {
    li: createPostContainer(),
    link: createLinkElement(),
    btn: createButtonElement(),
  };
  posts.forEach((post, id) => {
    const { title, link } = post;
    const li = templates.li.cloneNode();
    const linkElement = templates.link.cloneNode();
    if (visited.has(id)) {
      linkElement.classList.add('fw-normal', 'link-secondary');
    } else {
      linkElement.classList.add('fw-bold');
    }
    linkElement.href = link;
    linkElement.textContent = title;
    linkElement.setAttribute('data-id', `${id}`);
    const btn = templates.btn.cloneNode();
    btn.textContent = i18n.t('posts.btnShow');
    btn.setAttribute('data-id', `${id}`);
    li.append(linkElement, btn);
    ul.prepend(li);
  });
  container.append(ul);
  if (container.textContent !== i18n.t('posts.header')) {
    elements.posts.innerHTML = '';
    elements.posts.append(container);
  }
};

const renderModal = (state, elements) => {
  const id = state.modal.selectedPost;
  const { title, description, link } = state.posts[id];
  elements.modal.title.textContent = title;
  elements.modal.description.textContent = description;
  elements.modal.btnOpen.href = link;
};

const addLinkToInput = (state, elements) => {
  elements.input.value = state.examples.selected;
  elements.input.focus();
};

const renderInitialTexts = (elements) => {
  elements.initialTextFields.pageTitle.textContent = i18n.t('pageTitle');
  elements.initialTextFields.header.textContent = i18n.t('pageTitle');
  elements.initialTextFields.pageDescription.textContent = i18n.t('pageDescription');
  elements.initialTextFields.labelForInput.textContent = i18n.t('form.labelForInput');
  elements.initialTextFields.examplesHeader.textContent = i18n.t('form.examples');
  elements.btnAdd.textContent = i18n.t('form.btnAdd');
  elements.modal.btnOpen.textContent = i18n.t('modal.btnOpen');
  elements.modal.btnClose.textContent = i18n.t('modal.btnClose');
};

const renderAllTexts = (state, elements) => {
  renderInitialTexts(elements);
  renderFeedback(state.form, elements);
  renderFeeds(state.feeds, elements);
  renderPosts(state, elements);
  elements.input.focus();
};

const initView = (state, elements) => {
  renderInitialTexts(elements);

  const mapping = {
    'language': () => renderAllTexts(state, elements),
    'examples.selected': () => addLinkToInput(state, elements),
    'form.status': () => renderForm(state.form, elements),
    'form.feedback': () => renderFeedback(state.form, elements),
    'form.fields.url': () => renderFormErrors(state.form, elements),
    'feeds': () => renderFeeds(state.feeds, elements),
    'posts': () => renderPosts(state, elements),
    'visited': () => renderPosts(state, elements),
    'modal.selectedPost': () => renderModal(state, elements),
  };

  const watchedState = onChange(state, (path) => {
    mapping[path]?.();
  });

  return watchedState;
};

export default initView;
