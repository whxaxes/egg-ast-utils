'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const utils = require('../');
const util = require('./util');
const baseDir = path.resolve(__dirname, './fixtures/app1');

describe('test/parseClass.test.js', () => {
  it('should work correctly with classes', () => {
    let url = path.resolve(baseDir, './service/Test.js');
    let result = utils.parseClass(fs.readFileSync(url).toString());
    console.log(result);
    // util.matchNode(url, result);

    url = path.resolve(baseDir, './service/Test2.js');
    result = utils.parseClass(fs.readFileSync(url).toString());
    // util.matchNode(url, result);

    // url = path.resolve(baseDir, './service/Test3.js');
    // result = utils.parseClass(fs.readFileSync(url).toString());
    // util.matchNode(url, result);

    // url = path.resolve(baseDir, './service/Test4.js');
    // result = utils.parseClass(fs.readFileSync(url).toString());
    // assert(!result);
  });
});
