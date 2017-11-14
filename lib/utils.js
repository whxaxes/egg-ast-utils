'use strict';

const path = require('path');
const fs = require('fs');
const j = require('jscodeshift');
const c = require('./constant');

exports.findFiles = (dir, deep) => {
  let list = [];
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fp = path.resolve(dir, f);
    const stat = fs.lstatSync(fp);
    if (stat.isFile()) {
      list.push(fp);
    } else if (deep && stat.isDirectory()) {
      list = list.concat(exports.findFiles(fp, deep));
    }
  });
  return list;
};

exports.parseExpression = key => {
  if (typeof key === 'string' && !key.includes('.') && !key.includes('[')) {
    return [ j.identifier(key) ];
  }

  let member;
  if (j.MemberExpression.check(key)) {
    member = key;
  } else {
    member = j(key)
      .find(j.MemberExpression)
      .get().value;
  }

  const list = [];

  while (member) {
    if (member.property) {
      list.unshift(member.property);
    }

    if (member.object) {
      member = member.object;
    } else {
      list.unshift(member);
      break;
    }
  }

  return list;
};

exports.getValue = node => {
  return node
    ? j.Literal.check(node) ? node.value : node.name
    : node;
};

exports.findModuleRightNode = ast => {
  const newAst = ast
    .find(j.ExpressionStatement, {
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
    })
    .filter(p => p.scope.isGlobal);

  if (!newAst.size()) {
    return;
  }

  return newAst.get().value.expression.right;
};

exports.findModuleReturnNode = (ast, rightNode) => {
  rightNode = rightNode || exports.findModuleRightNode(ast);
  if (!rightNode) {
    return;
  }

  let type = c.EXP_NOT_FUNC;
  let returnNode;

  if (
    j.FunctionExpression.check(rightNode) ||
    j.ArrowFunctionExpression.check(rightNode)
  ) {
    if (!j.BlockStatement.check(rightNode.body)) {
      // module.exports = () => ({ ... });
      type = c.EXP_ARROW_RETURN;
      returnNode = rightNode.body;
    } else {
      // module.exports = () => { ... }
      type = c.EXP_INNER_RETURN;

      const returnAst = ast
        .find(j.ReturnStatement)
        .filter(p => p.scope.node === rightNode);

      if (!returnAst.size()) {
        returnNode = j.identifier('undefined');
      } else {
        returnNode = returnAst.get().value.argument;
      }
    }
  }

  return {
    type, ast,
    node: returnNode || rightNode,
  };
};
