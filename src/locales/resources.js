const resources = {
  ru: {
    translation: {
      errors: {
        validation: {
          url: 'Ссылка должна быть валидным URL', //'this must be a valid URL'
          uniqueness: 'RSS уже существует', // duplication // 'RSS already exists'
        },
        network: 'Ошибка сети', // network 'Network Error'
        resource: 'Ресурс не содержит валидный RSS',
        
      },
      feedback: {
        success: 'RSS успешно загружен',
      },
      interface: {
        feeds: 'Фиды',
        posts: 'Посты',
        show: 'Просмотр',
        open: 'Читать полностью',
        close: 'Закрыть',
      },
    },
  },
};

export default resources;