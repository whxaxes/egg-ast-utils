'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const _ = require('lodash');
const debug = require('debug')('egg-ast-utils');
const utils = require('../');
const baseDir = path.resolve(__dirname, './fixtures/app1');

class MockService {}

function matchNode(url, checkObj) {
  const mod = require(url);
  let isClass = false;
  let obj = mod;
  if (typeof mod === 'function') {
    const app = { Service: MockService };
    obj = mod(app);
    if (typeof obj === 'function') {
      isClass = true;
      obj = new obj(app);
    }
  }

  if (isClass) {
    deepCheck(checkObj, obj);
  } else {
    deepCheck(obj, checkObj);
  }

  function deepCheck(obj, checkObj) {
    obj = isClass ? obj.children : obj;
    checkObj = isClass ? checkObj : checkObj.children;

    _.forEach(obj, (value, key) => {
      if (!checkObj[key]) {
        throw new Error(`object has no ${key}`);
      } else {
        debug('has %s', key);
      }

      if (_.isObject(obj[key])) {
        deepCheck(obj[key], checkObj[key]);
      }
    });
  }
}

describe('test/parseNormal.test.js', () => {
  it('should work correctly with config', () => {
    let url = path.resolve(baseDir, './config/config.default.js');
    let result = utils.parseNormal(fs.readFileSync(url).toString());
    matchNode(url, result);
    assert(result.get('view.mapping[".nj"]').nodes.length === 2);
    assert(Object.keys(result.get('view').children).length === 2);

    url = path.resolve(baseDir, './config/config.local.js');
    result = utils.parseNormal(fs.readFileSync(url).toString());
    matchNode(url, result);

    url = path.resolve(baseDir, './config/config.prod.js');
    result = utils.parseNormal(fs.readFileSync(url).toString());
    matchNode(url, result);

    url = path.resolve(baseDir, './config/config.unittest.js');
    result = utils.parseNormal(fs.readFileSync(url).toString());
    matchNode(url, result);
  });

  it('should work correctly with classes', () => {
    let url = path.resolve(baseDir, './service/Test.js');
    let result = utils.parseNormal(fs.readFileSync(url).toString());
    matchNode(url, result);

    url = path.resolve(baseDir, './service/Test2.js');
    result = utils.parseNormal(fs.readFileSync(url).toString());
    matchNode(url, result);

    url = path.resolve(baseDir, './service/Test3.js');
    result = utils.parseNormal(fs.readFileSync(url).toString());
    matchNode(url, result);

    url = path.resolve(baseDir, './service/Test4.js');
    result = utils.parseNormal(fs.readFileSync(url).toString());
    assert(!result);
  });
});
