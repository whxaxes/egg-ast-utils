'use strict';

const path = require('path');
const utils = require('./lib/utils');

const parserDir = path.resolve(__dirname, './lib/parser');
utils.findFiles(parserDir).forEach(fp => {
  exports[path.basename(fp, '.js')] = require(fp);
});
