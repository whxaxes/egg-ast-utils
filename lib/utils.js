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
  if (!key.includes('.') && !key.includes('[')) {
    return [ j.identifier(key) ];
  }

  let member = j(key)
    .find(j.MemberExpression)
    .get().__childCache;
  let save;
  const list = [];

  while (member) {
    if (member.property) {
      list.unshift(member.property.value);
    }

    if (member.object) {
      save = member.object;
      member = member.object.__childCache;
    } else {
      list.unshift(save.value);
      break;
    }
  }

  return list;
};

exports.getValue = node => {
  return j.Literal.check(node) ? node.value : node.name;
};

exports.findModuleReturnNode = ast => {
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

  const rightNode = newAst.get().value.expression.right;
  let type = c.EXP_NOT_FUNC;
  let returnNode;

  if (
    j.FunctionExpression.check(rightNode) ||
    j.ArrowFunctionExpression.check(rightNode)
  ) {
    // module.exports = () => ({ ... });
    if (!j.BlockStatement.check(rightNode.body)) {
      type = c.EXP_ARROW_RETURN;
      returnNode = rightNode.body;
    } else {
      type = c.EXP_INNER_RETURN;

      // module.exports = () => { ... }
      const returnAst = newAst
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
    type,
    ast: newAst,
    node: returnNode || rightNode,
  };
};
