'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('../');
const assert = require('assert');

describe('test/parseUnittest.test.js', () => {
  it('should work correctly', () => {
    const list = utils.parseUnittest(
      fs.readFileSync(path.resolve(__dirname, './fixtures/app1/test/util.js'))
        .toString()
    );

    assert(list.length === 1);
    assert(list[0].children.length === 4);
    assert(list[0].children[2].type === 'describe');
    assert(list[0].children[3].type === 'describe');
    assert(list[0].children[2].children.length === 5);
    assert(list[0].children[3].children.length === 3);
  });
});
