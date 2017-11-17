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

exports.extractKeyword = (source, index, prefix) => {
  let result = '';
  j(source)
    .find(j.MemberExpression)
    .filter(p => !j.MemberExpression.check(p.parentPath.value))
    .forEach(p => {
      if (result) return;

      const mem = p.value;
      const list = exports.parseExpression(mem);
      const start = prefix
        ? list.findIndex(node => exports.getValue(node) === prefix)
        : 0;

      if (prefix && start === -1) {
        return;
      }

      const first = prefix ? start + 1 : start;
      let i = first;
      while (i < list.length) {
        const node = list[i++];

        if (node.start <= index && node.end >= index) {
          const end = j.Literal.check(node) ? node.end + 1 : node.end;
          result = source.substring(list[first].start, end);
          break;
        }
      }
    });

  return result;
};

exports.parseExpression = key => {
  if (typeof key === 'string' && !key.match(/\.|\[|'|"|`/)) {
    return [ j.identifier(key) ];
  }

  let member;
  if (j.MemberExpression.check(key)) {
    member = key;
  } else if (j.ExpressionStatement.check(key)) {
    member = key.expression;
  } else {
    member = j(key)
      .find(j.ExpressionStatement)
      .get().value.expression;
  }

  if (j.Literal.check(member)) {
    return [ member ];
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
  return node ? (j.Literal.check(node) ? node.value : node.name) : node;
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

  const astNode = newAst.get().value;
  const leftNode = astNode.expression.left;
  const rightNode = astNode.expression.right;
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
    type,
    ast,
    leftNode,
    rightNode,
    returnNode: returnNode || rightNode,
  };
};
