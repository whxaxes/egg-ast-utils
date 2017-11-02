'use strict';

const utils = require('../utils');
const j = require('jscodeshift');
const path = require('path');
const fs = require('fs');
const recast = require('recast');

module.exports = (key, baseDir) => {
  const fileMaps = {};
  utils.findFiles(path.resolve(baseDir, './config')).forEach(fp => {
    const result = findArea(key, fs.readFileSync(fp).toString());
    if (result) {
      fileMaps[fp] = {
        node: result,
        text: recast.print(result).code,
        loc: result.loc,
      };
    }
  });
  return fileMaps;
};

function findArea(key, content) {
  let keyList;
  if (key.includes('.') || key.includes('[')) {
    keyList = utils.parseExpression(key);
  } else {
    keyList = [{ name: key }];
  }

  const baseAst = j(content);
  const ast = baseAst.find(j.ExpressionStatement, {
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        object: {
          name: 'module',
        },
        property: {
          name: 'exports',
        },
      },
    },
  });

  // find module.exports
  if (ast.size() === 1) {
    const rightNode = ast.get().value.expression.right;

    if (
      j.FunctionExpression.check(rightNode) ||
      j.ArrowFunctionExpression.check(rightNode)
    ) {
      // module.exports = () => ({ ... });
      if (j.ObjectExpression.check(rightNode.body)) {
        return findInObject(keyList, rightNode.body);
      }

      // module.exports = () => { ... }
      const returnAst = ast
        .find(rightNode.type, rightNode)
        .find(j.ReturnStatement)
        .filter(p => p.parentPath.parentPath.parentPath.value === rightNode);

      if (!returnAst.size()) {
        return;
      }

      // find return argument
      const returnArgument = returnAst.get().value.argument;
      if (j.ObjectExpression.check(returnArgument)) {
        // return { ... }
        return findInObject(keyList, returnArgument);
      } else if (j.Identifier.check(returnArgument)) {
        // return config;
        return findInAssign(returnArgument.name, keyList, ast);
      }
    } else if (j.ObjectExpression.check(rightNode)) {
      // module.exports = { ... }
      return findInObject(keyList, rightNode);
    }
  } else {
    // use exports
    return findInAssign('exports', keyList, baseAst);
  }
}

// xxx = { ... }
function findInAssign(key, keyList, ast) {
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
  });

  if (!assignAst.size()) {
    return;
  }

  let target;
  const assignRight = assignAst.get().value.right;
  if (j.ObjectExpression.check(assignRight) || j.ArrayExpression.check(assignRight)) {
    target = findInObject(keyList, assignRight);
  } else {
    target = assignRight;
  }

  return target;
}

// { ... }
function findInObject(keyList, node) {
  const current = keyList.shift();
  if (!current) {
    return node;
  }

  const key = getValue(current);
  if (j.ObjectExpression.check(node)) {
    const newNode = node.properties.find(prop => {
      return key === getValue(prop.key);
    });

    if (newNode) {
      return findInObject(keyList, newNode.value);
    }
  } else if (j.ArrayExpression.check(node)) {
    if (node.elements[key]) {
      return findInObject(keyList, node.elements[key]);
    }
  }
}

// get value from Literal and Identifier
function getValue(node) {
  return j.Literal.check(node) ? node.value : node.name;
}
