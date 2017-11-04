'use strict';

const path = require('path');
const utils = require('./lib/utils');

module.exports = class AstUtils {
  constructor() {
    const libDir = path.resolve(__dirname, './lib/finder');
    utils.findFiles(libDir).forEach(fp => {
      this[path.basename(fp, '.js')] = require(fp);
    });
  }
};
