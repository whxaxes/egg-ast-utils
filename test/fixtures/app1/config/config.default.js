'use strict';

module.exports = appInfo => {
  const config = {};

  // should change to your own
  config.keys = appInfo.name + '_1501832752131_9495';

  // add your config here
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.nj': 'nunjucks',
      'test': [
        1,
        2,
        3
      ]
    },
  };

  config.view.mapping['.nj'] = '111';

  config.view = {
    bbc: {
      
    }
  }

  config.static = {
    maxAge: 200000,
  };

  config.static = {
    other: 20000,
    maxAge: {
      aaa: '123'
    },
  };

  config.security = {
    csrf: false,
  };

  return config;
};
