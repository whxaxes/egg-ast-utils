'use strict';

const utils = require('../utils');
const j = require('jscodeshift');
const keywords = [ 'describe', 'it', 'before', 'beforeEach', 'after', 'afterEach' ];
const desKeywords = [ 'describe', 'it' ];

class UnitNode {
  constructor(node, type) {
    this.node = node;
    this.type = type;

    if (type === desKeywords[0]) {
      this.children = [];
    }

    if (desKeywords.includes(type)) {
      this.describe = utils.getValue(node.arguments[0]);
    }
  }
}

module.exports = source => {
  return findCallee(j(source));
};

function findCallee(ast, depth = 0, list = []) {
  ast.find(
    j.CallExpression,
    { callee: { name: key => keywords.includes(key) } }
  )
    .filter(p => p.scope.depth === depth)
    .forEach(p => {
      const node = new UnitNode(p.value, p.value.callee.name);
      list.push(node);

      if (node.children) {
        findCallee(j(p), p.scope.depth + 1, node.children);
      }
    });

  return list;
}
