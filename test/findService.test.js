'use strict';

const AstUtils = require('../');
const path = require('path');
const assert = require('assert');
const utils = require('../lib/utils');
const fs = require('fs');
const recast = require('recast');
const baseDir = path.resolve(__dirname, './fixtures/app1');
const astUtil = new AstUtils();

function findService(key, name) {
  return astUtil.findService(
    fs.readFileSync(path.resolve(baseDir, `./service/${name}.js`)).toString(),
    key
  );
}

describe('test/findConfig.test.js', () => {
  it('should work correctly', () => {
    const result = findService('test.userInfo', 'Test');
    assert(!!result);
    assert(result.loc.start.line === 22);
    assert(result.key.name === 'userInfo');
  });

  it('should work correctly with Literal', () => {
    const result = findService('test["user.search"]', 'Test');
    assert(!!result);
    assert(result.loc.start.line === 26);
    assert(result.key.value === 'user.search');
  });

  it('should work correctly with different ReturnStatement', () => {
    let result = findService('test["user.search"]', 'Test2');
    assert(!!result);
    assert(result.loc.start.line === 26);
    assert(result.key.value === 'user.search');

    result = findService('test["user.search"]', 'Test3');
    assert(!!result);
    assert(result.loc.start.line === 23);
    assert(result.key.value === 'user.search');
  });
});
