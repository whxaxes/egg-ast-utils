'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const utils = require('../');
const getValue = require('../lib/utils').getValue;
const baseDir = path.resolve(__dirname, './fixtures/app1');

describe('test/parseNormal.test.js', () => {
  it('should work correctly with config', () => {
    let url = path.resolve(baseDir, './config/config.default.js');
    let result = utils.parseConfig(fs.readFileSync(url).toString());
    assert(result.find('view').length === 2);
    assert(result.find('view.bbc').length === 1);
    assert(result.find('view.mapping[".nj"]').length === 2);
    assert(result.find('static.maxAge').length === 2);
    assert(getValue(result.find('static.maxAge.aaa')[0].key) === 'aaa');
    assert(getValue(result.find('static.maxAge.aaa')[0].value) === '123');
    assert(getValue(result.find('view.mapping[".nj"]')[0].value) === 'nunjucks');
    assert(getValue(result.find('view.mapping[".nj"]')[1].value) === '111');

    url = path.resolve(baseDir, './config/config.local.js');
    result = utils.parseConfig(fs.readFileSync(url).toString());
    assert(getValue(result.find('sfclient.alias.gh')[0].value) === 'asdasdasdasd');
    assert(getValue(result.find('sfclient.serverList[0]')[0].value) === 'asdasdasdasd');

    url = path.resolve(baseDir, './config/config.prod.js');
    result = utils.parseConfig(fs.readFileSync(url).toString());
    assert(getValue(result.find('sfclient.alias.gh')[0].value) === 'asdasdasdasd');
    assert(getValue(result.find('sfclient.serverList[0]')[0].value) === 'asdasdasdasd');

    url = path.resolve(baseDir, './config/config.unittest.js');
    result = utils.parseConfig(fs.readFileSync(url).toString());
    assert(getValue(result.find('sfclient.alias.gh')[0].value) === 'asdasdasdasd');
    assert(getValue(result.find('sfclient.serverList[0]')[0].value) === 'asdasdasdasd');
  });
});
