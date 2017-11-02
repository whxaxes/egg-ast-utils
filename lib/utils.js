'use strict';

const path = require('path');
const fs = require('fs');
const j = require('jscodeshift');

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
