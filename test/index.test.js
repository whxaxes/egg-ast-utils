'use strict';

const AstUtils = require('../');
const path = require('path');
const assert = require('assert');

describe('test/index.test.js', () => {
  const util = new AstUtils({
    baseDir: path.resolve(__dirname, './fixtures/app1'),
  });

  it('should work correctly', () => {
    const result = util.findConfig('view.mapping[".nj"]');
    const list = Object.keys(result);
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.default.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.local.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.prod.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.unittest.js')));
  });

  it('should not match config while it was not exist', () => {
    const result = util.findConfig('sfclient.serverList[0]');
    const list = Object.keys(result);
    list.forEach(item => {
      assert(result[item].text === '\'asdasdasdasd\'');
    });

    assert(!list.includes(path.resolve(__dirname, './fixtures/app1/config/config.default.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.local.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.prod.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.unittest.js')));
  });

  it('should has config position', () => {
    let result = util.findConfig('keys');
    const list = Object.keys(result);

    assert(result[list[0]].loc.start.line === 7);
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.default.js')));
    assert(!list.includes(path.resolve(__dirname, './fixtures/app1/config/config.local.js')));
    assert(!list.includes(path.resolve(__dirname, './fixtures/app1/config/config.prod.js')));
    assert(!list.includes(path.resolve(__dirname, './fixtures/app1/config/config.unittest.js')));

    result = util.findConfig('view.defaultViewEngine');
    assert(result[list[0]].loc.start.line === 11);
  });
});
