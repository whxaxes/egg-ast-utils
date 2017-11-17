'use strict';

const utils = require('../utils');
const j = require('jscodeshift');
const collector = require('../collector');

module.exports = source => {
  const baseAst = j(source);
  const result = utils.findModuleReturnNode(baseAst);
  if (result) {
    const returnNode = result.returnNode;

    if (j.ObjectExpression.check(returnNode)) {
      // return { ... }
      return collector.collectInObject(
        result.ast.get().value,
        null,
        returnNode
      );
    } else if (j.Identifier.check(returnNode)) {
      // return config;
      return collector.collectInAssign(returnNode.name, result.ast, 1);
    }
  } else {
    // use exports
    return collector.collectInAssign('exports', baseAst, 0);
  }
};
