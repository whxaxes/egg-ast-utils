'use strict';

const path = require('path');
const utils = require('./lib/utils');

const finderDir = path.resolve(__dirname, './lib/finder');
utils.findFiles(finderDir).forEach(fp => {
  exports[path.basename(fp, '.js')] = require(fp);
});

const parserDir = path.resolve(__dirname, './lib/parser');
utils.findFiles(parserDir).forEach(fp => {
  exports[path.basename(fp, '.js')] = require(fp);
});
