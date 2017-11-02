'use strict';

module.exports = antx => {
  return {
    sfclient: {
      service: 'asdasdasdasd',
      appPort: 9090,
      hostCheckTimeout: 1000,
      hostCheckDelay: 200,
      alias: {
        gh: 'asdasdasdasd',
      },
      serverList: [
        'asdasdasdasd',
      ],
    },

    view: {
      mapping: {
        '.nj': 'nunjucks',
      },
    },
  };
};
