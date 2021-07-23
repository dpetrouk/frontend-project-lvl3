const resources = {
  ru: {
    translation: {
      pageTitle: 'RSS агрегатор',
      pageDescription: 'Здесь можно читать RSS фиды',
      form: {
        btnAdd: 'Добавить',
        labelForInput: 'RSS ссылка',
        examples: 'Примеры',
        feedback: {
          success: 'RSS успешно загружен',
          errors: {
            validation: {
              url: 'Ссылка должна быть валидным URL',
              uniqueness: 'RSS уже существует',
            },
            network: 'Ошибка сети',
            resource: 'Ресурс не содержит валидный RSS',
          },
        },
      },
      feeds: {
        header: 'Фиды',
      },
      posts: {
        header: 'Посты',
        btnShow: 'Просмотр',
      },
      modal: {
        btnOpen: 'Читать полностью',
        btnClose: 'Закрыть',
      },
    },
  },
  en: {
    translation: {
      pageTitle: 'RSS agregator',
      pageDescription: 'You can read RSS feeds here',
      form: {
        btnAdd: 'Add',
        labelForInput: 'RSS link',
        examples: 'Examples',
        feedback: {
          success: 'RSS is loaded',
          errors: {
            validation: {
              url: 'This must be a valid URL',
              uniqueness: 'RSS already exists',
            },
            network: 'Network Error',
            resource: 'Resource doesn\'t contain valid RSS',
          },
        },
      },
      feeds: {
        header: 'Feeds'
      },
      posts: {
        header: 'Posts',
        btnShow: 'Show',
      },
      modal: {
        btnOpen: 'Read more',
        btnClose: 'Close',
      },
    },
  },
};

export default resources;