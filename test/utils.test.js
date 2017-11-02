'use strict';

const utils = require('../lib/utils');
const path = require('path');
const assert = require('assert');
const j = require('jscodeshift');

describe('test/index.test.js', () => {
  it('#findFiles', () => {
    const list = utils.findFiles(path.resolve(__dirname, './fixtures/app1/config/'));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.default.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.local.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.prod.js')));
  });

  it('#findFiles in deep', () => {
    const list = utils.findFiles(path.resolve(__dirname, './fixtures/app1/'), true);
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/package.json')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.default.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.local.js')));
    assert(list.includes(path.resolve(__dirname, './fixtures/app1/config/config.prod.js')));
  });

  it('#parseExpression', () => {
    let list = utils.parseExpression('abc.bbc');
    assert(list[0].name === 'abc');
    assert(list[1].name === 'bbc');

    list = utils.parseExpression('abc.ddd.aa[11]');
    assert(list[0].name === 'abc');
    assert(list[1].name === 'ddd');
    assert(list[2].name === 'aa');
    assert(list[3].value === 11);
    assert(j.Literal.check(list[3]));
  });
});
