'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const utils = require('../');
const util = require('./util');
const baseDir = path.resolve(__dirname, './fixtures/app1');

describe('test/parseNormal.test.js', () => {
  it('should work correctly with config', () => {
    let url = path.resolve(baseDir, './config/config.default.js');
    let result = utils.parseConfig(fs.readFileSync(url).toString());
    console.log(result.find('view'));
    assert(result.find('view').length === 2);
    assert(result.find('view.mapping[".nj"]').length === 2);
    // console.log(result.children.static[1].children.maxAge[0]);
    // console.log(result.find('view.mapping[".nj"]'));
    // console.log(result.find('static.maxAge', true));

    // util.matchNode(url, result);
    // assert(result.find('view.mapping[".nj"]').nodes.length === 2);
    // assert(Object.keys(result.get('view').children).length === 2);

    url = path.resolve(baseDir, './config/config.local.js');
    result = utils.parseConfig(fs.readFileSync(url).toString());
    // util.matchNode(url, result);

    // url = path.resolve(baseDir, './config/config.prod.js');
    // result = utils.parseConfig(fs.readFileSync(url).toString());
    // util.matchNode(url, result);

    // url = path.resolve(baseDir, './config/config.unittest.js');
    // result = utils.parseConfig(fs.readFileSync(url).toString());
    // util.matchNode(url, result);
  });
});
