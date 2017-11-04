'use strict';

const AstUtils = require('../');
const path = require('path');
const assert = require('assert');
const utils = require('../lib/utils');
const fs = require('fs');
const recast = require('recast');
const baseDir = path.resolve(__dirname, './fixtures/app1');
const astUtil = new AstUtils();

function findAllConfig(key) {
  const fileMaps = {};
  utils.findFiles(path.resolve(baseDir, './config')).forEach(fp => {
    const result = astUtil.findConfig(fs.readFileSync(fp).toString(), key);
    if (result.node) {
      result.text = recast.print(result.node).code;
      fileMaps[fp] = result;
    }
  });
  return fileMaps;
}

describe('test/index.test.js', () => {
  it('should work correctly', () => {
    const result = findAllConfig('view.mapping[".nj"]');
    const list = Object.keys(result);
    list.forEach(item => {
      assert(result[item].text === '\'.nj\'');
    });

    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.default.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.local.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.prod.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.unittest.js')));
  });

  it('should not match config while it was not exist', () => {
    const result = findAllConfig('sfclient.serverList[0]');
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
    let result = findAllConfig('keys');
    const list = Object.keys(result);

    assert(result[list[0]].node.loc.start.line === 7);
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.default.js')));
    assert(!list.includes(path.resolve(__dirname, './fixtures/app1/config/config.local.js')));
    assert(!list.includes(path.resolve(__dirname, './fixtures/app1/config/config.prod.js')));
    assert(!list.includes(path.resolve(__dirname, './fixtures/app1/config/config.unittest.js')));

    result = findAllConfig('view.defaultViewEngine');
    assert(result[list[0]].node.loc.start.line === 11);
  });
});
