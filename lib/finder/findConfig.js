'use strict';

const utils = require('../utils');
const j = require('jscodeshift');

module.exports = (source, key) => {
  return findNode(source, key);
};

function findNode(source, key) {
  const keyList = utils.parseExpression(key);
  const baseAst = j(source);
  const result = utils.findModuleReturnNode(baseAst);
  if (result) {
    if (j.ObjectExpression.check(result.node)) {
      // return { ... }
      return findInObject(keyList, result.node);
    } else if (j.Identifier.check(result.node)) {
      // return config;
      return findInAssign(result.node.name, keyList, result.ast, 1);
    }
  } else {
    // use exports
    return findInAssign('exports', keyList, baseAst, 0);
  }
}

// xxx = { ... }
function findInAssign(key, keyList, ast, depth) {
  if (!key) {
    return;
  }

  const assignAst = ast.find(j.AssignmentExpression, {
    operator: '=',
    left: {
      object: {
        name: key,
      },
      property: {
        name: keyList.shift().name,
      },
    },
  }).filter(p => p.scope.depth === depth);

  if (!assignAst.size()) {
    return;
  }

  let target;
  const assignNode = assignAst.get().value;
  const assignRight = assignNode.right;

  if (keyList.length && (j.ObjectExpression.check(assignRight) || j.ArrayExpression.check(assignRight))) {
    target = findInObject(keyList, assignRight);
  } else {
    target = assignNode;
  }

  return target;
}

// { ... }
function findInObject(keyList, node) {
  if (!keyList.length) {
    return node;
  }

  const current = keyList.shift();
  const key = utils.getValue(current);
  if (j.ObjectExpression.check(node)) {
    const newNode = node.properties.find(prop => {
      return key === utils.getValue(prop.key);
    });

    if (newNode) {
      if (!keyList.length) {
        return newNode;
      }

      return findInObject(keyList, newNode.value);
    }
  } else if (j.ArrayExpression.check(node)) {
    if (node.elements[key]) {
      return findInObject(keyList, node.elements[key]);
    }
  }
}
