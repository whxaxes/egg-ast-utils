'use strict';

const utils = require('../utils');
const j = require('jscodeshift');
const collector = require('../collector');

module.exports = source => {
  const baseAst = j(source);
  const result = utils.findModuleReturnNode(baseAst);
  if (result) {
    const returnNode = result.returnNode;

    if (j.Identifier.check(returnNode)) {
      // return class
      const classAst = result.ast.find(
        j.ClassDeclaration,
        { id: { name: returnNode.name } }
      ).filter(p => p.scope.depth === 1);

      if (classAst.size()) {
        return collector.collectInClasses(
          result.ast.get().value,
          classAst.get().value.body
        );
      }
    } else if (j.ClassExpression.check(returnNode)) {
      // module.exports = () => ( class )
      return collector.collectInClasses(
        result.ast.get().value,
        returnNode.body
      );
    }
  } else {
    // use exports
    return collector.collectInAssign('exports', baseAst, 0);
  }
};
