'use strict';

const utils = require('./utils');
const j = require('jscodeshift');

class SimpleNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
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

  let result;
  ast.find(j.AssignmentExpression, {
    operator: '=',
  })
    .filter(p => p.scope.depth === depth)
    .forEach(p => {
      result = result || new SimpleNode(null, p.value);
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

        if (!list.length) {
          if (j.ObjectExpression.check(rightNode) || j.ArrayExpression.check(rightNode)) {
            current.add(key, exports.collectInObject(item, rightNode));
          } else {
            current.add(key, new SimpleNode(item, rightNode));
          }
        } else {
          let itemNode;
          if (!current.has(key)) {
            itemNode = new SimpleNode(item, rightNode);
            current.add(key, itemNode);
          } else {
            // 获取最后一个节点，因为后面的节点会把前面的复写
            const nodeList = current.get(key);
            itemNode = nodeList[nodeList.length - 1];
          }

          current = itemNode;
        }
      }
    });

  return result;
};

// { ... }
exports.collectInObject = (key, value) => {
  const result = new SimpleNode(key, value);
  if (j.ObjectExpression.check(value)) {
    value.properties.forEach(prop => {
      result.add(
        utils.getValue(prop.key),
        exports.collectInObject(
          prop.key,
          prop.value
        )
      );
    });
  } else if (j.ArrayExpression.check(value)) {
    value.elements.forEach((ele, i) => {
      result.add(i, exports.collectInObject(null, ele));
    });
  }

  return result;
};

// classes
exports.collectInClasses = node => {
  const result = new SimpleNode(null, node);
  node.body.forEach(item => {
    if (item.kind === 'constructor') {
      return;
    }

    result.add(
      utils.getValue(item.key),
      new SimpleNode(item.key, item.value)
    );
  });

  return result;
};
