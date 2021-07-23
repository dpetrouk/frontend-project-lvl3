import onChange from 'on-change';
import i18n from 'i18next';

const renderFeedback = (form, elements) => {
  elements.feedbackElement.textContent = i18n.t(form.feedback);
};

const renderFormErrors = (form, elements) => {
  const field = form.fields.url;
  if (field.valid) {
    elements.input.classList.remove('is-invalid');
    elements.feedbackElement.classList.remove('text-danger');
    elements.feedbackElement.classList.add('text-success');
  } else {
    elements.input.classList.add('is-invalid');
    elements.feedbackElement.classList.remove('text-success');
    elements.feedbackElement.classList.add('text-danger');
  }
};

const renderForm = (form, elements) => {
  switch (form.status) {
    case 'filling':
      elements.submitBtn.disabled = false;
      elements.input.disabled = false;
      elements.input.value = '';
      elements.input.focus();
      elements.feedbackElement.classList.remove('text-danger');
      elements.feedbackElement.classList.add('text-success');
      break;
    case 'failed':
      elements.submitBtn.disabled = false;
      elements.input.disabled = false;
      elements.input.select();
      elements.feedbackElement.classList.remove('text-success');
      elements.feedbackElement.classList.add('text-danger');
      break;
    case 'loading':
      elements.submitBtn.disabled = true;
      elements.input.disabled = true;
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
  feeds.forEach((channel, id) => {
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
    elements.feedsElement.innerHTML = '';
    elements.feedsElement.append(container);
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
    if (visited.includes(id)) {
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
    elements.postsElement.innerHTML = '';
    elements.postsElement.append(container);
  }
};

const renderModal = (state, elements) => {
  const id = state.modal.selectedPost;
  const { title, description, link } = state.posts[id];
  elements.modal.title.textContent = title;
  elements.modal.description.textContent = description;
  elements.modal.btnOpen.href = link;
};

const renderInitTexts = (elements) => {
  elements.textFields.pageTitle.textContent = i18n.t('pageTitle');
  elements.textFields.header.textContent = i18n.t('pageTitle');
  elements.textFields.pageDescription.textContent = i18n.t('pageDescription');
  elements.textFields.labelForInput.textContent = i18n.t('form.labelForInput');
  elements.textFields.examples.textContent = i18n.t('form.examples');
  elements.btnAdd.textContent = i18n.t('form.btnAdd');
  elements.modal.btnOpen.textContent = i18n.t('modal.btnOpen');
  elements.modal.btnClose.textContent = i18n.t('modal.btnClose');
};

const renderAllTexts = (state, elements) => {
  renderInitTexts(elements);
  renderFeedback(state.form, elements);
  renderFeeds(state.feeds, elements);
  renderPosts(state, elements);
};

const initView = (state, elements) => {
  elements.input.focus();
  elements.form.setAttribute('autocomplete', 'off'); // потом удалить
  renderInitTexts(elements);

  const mapping = {
    'language': () => renderAllTexts(state, elements),
    'form.status': () => renderForm(state.form, elements),
    'form.feedback': () => renderFeedback(state.form, elements),
    'form.fields.url': () => renderFormErrors(state.form, elements),
    'feeds': () => renderFeeds(state.feeds, elements),
    'posts': () => renderPosts(state, elements),
    'visited': () => renderPosts(state, elements),
    'modal.selectedPost': () => renderModal(state, elements),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;