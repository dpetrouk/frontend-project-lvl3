import onChange from 'on-change';

const renderFeedback = (form, elements) => {
  elements.feedbackElement.textContent = form.feedback;
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
  container.innerHTML = '<div class="card-body"><h2 class="card-title h4">Фиды</h2</div>';
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
  elements.feedsElement.innerHTML = '';
  elements.feedsElement.append(container)
};

const createLinkElement = (title, link, id) => {
  const a = document.createElement('a');
  a.classList.add('fw-bold');
  a.href = link;
  a.textContent = title;
  a.setAttribute('data-id', `${id}`);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  return a;
};

const createButtonElement = (id) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btn.setAttribute('data-id', `${id}`);
  btn.setAttribute('data-bs-toggle', 'modal');
  btn.setAttribute('data-bs-target', '#modal');
  btn.textContent = 'Просмотр';
  /*
  + addEventListener и формирование модального окна?
  */
  return btn;
};

const renderPosts = (posts, elements) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  container.innerHTML = '<div class="card-body"><h2 class="card-title h4">Посты</h2</div>';
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  posts.forEach((post, id) => {
    const { title, link } = post;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const linkElement = createLinkElement(title, link, id);
    const btn = createButtonElement(id);
    li.append(linkElement, btn);
    ul.prepend(li);
  });
  container.append(ul);
  elements.postsElement.innerHTML = '';
  elements.postsElement.append(container);
};

const initView = (state, elements) => {
  elements.input.focus();
  elements.form.setAttribute('autocomplete', 'off');

  const mapping = {
    'form.status': () => renderForm(state.form, elements),
    'form.feedback': () => renderFeedback(state.form, elements),
    'form.fields.url': () => renderFormErrors(state.form, elements),
    'feeds': () => renderFeeds(state.feeds, elements),
    'posts': () => renderPosts(state.posts, elements),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;