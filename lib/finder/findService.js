'use strict';

const utils = require('../utils');
const j = require('jscodeshift');
const c = require('../constant');

module.exports = (source, key) => {
  const keyList = utils.parseExpression(key);
  const ast = j(source);
  const result = utils.findModuleReturnNode(ast);

  if (!result) {
    return;
  }

  let classAst;
  if (result.type === c.EXP_INNER_RETURN && j.Identifier.check(result.node)) {
    const className = result.node.name;
    classAst = result.ast.find(j.ClassDeclaration, {
      id: { name: className },
    });
  } else if (j.ClassExpression.check(result.node)) {
    classAst = result.ast.find(result.node.type, result.node);
  }

  if (!classAst || !classAst.size()) {
    return;
  }

  keyList.shift();
  const methodNode = keyList.shift();
  const condition = j.Identifier.check(methodNode)
    ? { name: methodNode.name }
    : { value: methodNode.value };

  const methodAst = classAst
    .find(j.MethodDefinition, {
      key: condition,
    })
    .filter(p => p.scope.depth === 1);

  return methodAst.size() ? methodAst.get().value : null;
};
