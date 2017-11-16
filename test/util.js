'use strict';

const _ = require('lodash');
const debug = require('debug')('egg-ast-utils');

class MockService {}

exports.matchNode = (url, checkObj) => {
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
;
