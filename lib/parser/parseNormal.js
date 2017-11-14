'use strict';

const utils = require('../utils');
const j = require('jscodeshift');

class SimpleNode {
  constructor(node) {
    this.nodes = [ node ];
    this.children = {};
  }

  get(key) {
    const list = utils.parseExpression(key);
    let current = this;
    list.forEach(item => {
      current = current.children[utils.getValue(item)];
    });
    return current;
  }
}

module.exports = source => {
  const baseAst = j(source);
  const result = utils.findModuleReturnNode(baseAst);
  if (result) {
    if (j.ObjectExpression.check(result.node)) {
      // return { ... }
      return collectInObject(result.node);
    } else if (j.Identifier.check(result.node)) {
      // return config;
      const declarator = baseAst.find(
        j.VariableDeclarator,
        { id: { name: result.node.name } }
      ).filter(p => p.scope.depth === 1);

      // plain object assignment
      if (declarator.size()) {
        return collectInAssign(result.node.name, result.ast, 1);
      }

      // classes
      const classAst = result.ast.find(
        j.ClassDeclaration,
        { id: { name: result.node.name } }
      ).filter(p => p.scope.depth === 1);

      if (classAst.size()) {
        return collectInClasses(classAst.get().value.body);
      }
    } else if (j.ClassExpression.check(result.node)) {
      return collectInClasses(result.node.body);
    }
  } else {
    // use exports
    return collectInAssign('exports', baseAst, 0);
  }
};

// xxx = { ... }
function collectInAssign(key, ast, depth) {
  if (!key) {
    return;
  }

  let result;
  ast.find(j.AssignmentExpression, {
    operator: '=',
  })
    .filter(p => p.scope.depth === depth)
    .forEach(p => {
      result = result || new SimpleNode(p.value);
      const list = utils.parseExpression(p.value.left);
      const first = list.shift();
      if (!first || first.name !== key) {
        return;
      }

      const rightNode = p.value.right;
      let current = result;
      while (list.length) {
        const item = list.shift();
        const key = utils.getValue(item);
        const children = current.children;

        if (!children[key]) {
          children[key] = new SimpleNode(item);
        }

        if (!list.length) {
          if (j.ObjectExpression.check(rightNode) || j.ArrayExpression.check(rightNode)) {
            children[key] = collectInObject(p.value.right, item);
          }

          if (!children[key].nodes.includes(item)) {
            children[key].nodes.push(item);
          }
        } else {
          current = children[key];
        }
      }
    });

  return result;
}

// { ... }
function collectInObject(node, left = node) {
  const result = new SimpleNode(left);
  const children = result.children;
  if (j.ObjectExpression.check(node)) {
    node.properties.forEach(prop => {
      children[utils.getValue(prop.key)] = collectInObject(
        prop.value,
        prop.key
      );
    });
  } else if (j.ArrayExpression.check(node)) {
    node.elements.forEach((ele, i) => {
      children[i] = collectInObject(ele);
    });
  }

  return result;
}

function collectInClasses(node) {
  const result = new SimpleNode(node);
  const children = result.children;
  node.body.forEach(item => {
    if (item.kind === 'constructor') {
      return;
    }

    const key = utils.getValue(item.key);
    if (!children[key]) {
      children[key] = new SimpleNode(item.key);
    } else {
      children[key].nodes.push(item.key);
    }
  });

  return result;
}
