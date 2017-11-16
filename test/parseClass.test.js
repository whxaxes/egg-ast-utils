'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const utils = require('../');
const baseDir = path.resolve(__dirname, './fixtures/app1');

describe('test/parseClass.test.js', () => {
  it('should work correctly with classes', () => {
    let url = path.resolve(baseDir, './service/Test.js');
    let result = utils.parseClass(fs.readFileSync(url).toString());
    assert(result.find('bbb').length === 2);
    assert(result.find('userInfo').length === 1);
    assert(result.find('"user.search"').length === 1);

    url = path.resolve(baseDir, './service/Test2.js');
    result = utils.parseClass(fs.readFileSync(url).toString());
    assert(result.find('userInfo').length === 1);
    assert(result.find('"user.search"').length === 1);

    url = path.resolve(baseDir, './service/Test3.js');
    result = utils.parseClass(fs.readFileSync(url).toString());
    assert(result.find('userInfo').length === 1);
    assert(result.find('"user.search"').length === 1);

    url = path.resolve(baseDir, './service/Test4.js');
    result = utils.parseClass(fs.readFileSync(url).toString());
    assert(!result);
  });
});
