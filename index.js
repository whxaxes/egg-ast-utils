'use strict';

const path = require('path');
const utils = require('./lib/utils');

module.exports = class AstUtils {
  constructor({ baseDir }) {
    this.baseDir = baseDir;
    const libDir = path.resolve(__dirname, './lib/finder');
    utils.findFiles(libDir).forEach(fp => {
      const method = require(fp);
      this[path.basename(fp, '.js')] = key =>
        method.call(this, key, this.baseDir);
    });
  }
};
