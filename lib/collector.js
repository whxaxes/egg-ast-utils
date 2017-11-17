'use strict';

const utils = require('./utils');
const j = require('jscodeshift');

class SimpleNode {
  constructor(node, key, value) {
    this.node = node; // whole assignment or object
    this.key = key; // key in assignment or key in object
    this.value = value; // value in assignment or value in object
    this.parent = null;
    this.children = {};
  }

  has(key) {
    return this.children.hasOwnProperty(key);
  }

  get(key) {
    return this.children[key];
  }

  add(key, node) {
    node.parent = this;
    if (!this.has(key)) {
      this.children[key] = [ node ];
    } else {
      this.children[key].push(node);
    }
  }

  find(key, strict) {
    const list = utils.parseExpression(key);
    let newList = [];

    function traverse(list, node, index = 0) {
      const key = utils.getValue(list[index]);
      const nodeList = node.get(key);
      index++;

      if (!nodeList) {
        return;
      }

      if (index >= list.length) {
        newList = newList.concat(nodeList);
        return;
      }

      if (strict) {
        traverse(list, nodeList[nodeList.length - 1], index);
      } else {
        nodeList.forEach(item => {
          traverse(list, item, index);
        });
      }
    }

    traverse(list, this);

    return newList;
  }
}

// xxx = { ... }
exports.collectInAssign = (key, ast, depth) => {
  if (!key) {
    return;
  }

  const result = new SimpleNode(ast.get().value);
  ast.find(j.AssignmentExpression, {
    operator: '=',
  })
    .filter(p => p.scope.depth === depth)
    .forEach(p => {
      const list = utils.parseExpression(p.value.left);
      const first = list.shift();
      if (!first || first.name !== key) {
        return;
      }

      const rightNode = p.value.right;
      let current = result;
      while (list.length) {
        const item = list.shift();
        const itemKey = utils.getValue(item);

        if (!list.length) {
          if (j.ObjectExpression.check(rightNode) || j.ArrayExpression.check(rightNode)) {
            current.add(itemKey, exports.collectInObject(p.value, item, rightNode));
          } else {
            current.add(itemKey, new SimpleNode(p.value, item, rightNode));
          }
        } else {
          let itemNode;
          if (!current.has(itemKey)) {
            itemNode = new SimpleNode(p.value, item, rightNode);
            current.add(itemKey, itemNode);
          } else {
            // use the last node, because it can rewrite the value
            const nodeList = current.get(itemKey);
            itemNode = nodeList[nodeList.length - 1];
          }

          current = itemNode;
        }
      }
    });

  return result;
};

// { ... }
exports.collectInObject = (node, key, value) => {
  const result = new SimpleNode(node, key, value);
  if (j.ObjectExpression.check(value)) {
    value.properties.forEach(prop => {
      result.add(
        utils.getValue(prop.key),
        exports.collectInObject(
          prop,
          prop.key,
          prop.value
        )
      );
    });
  } else if (j.ArrayExpression.check(value)) {
    value.elements.forEach((ele, i) => {
      result.add(i, exports.collectInObject(ele, null, ele));
    });
  }

  return result;
};

// classes
exports.collectInClasses = (node, classNode) => {
  const result = new SimpleNode(node, null, classNode);
  classNode.body.forEach(item => {
    if (item.kind === 'constructor') {
      return;
    }

    result.add(
      utils.getValue(item.key),
      new SimpleNode(item, item.key, item.value)
    );
  });

  return result;
};
