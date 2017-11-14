# egg-ast-utils

## methods

### parseNormal

```js
// config.default.js
module.exports = appInfo => {
  const config = {};

  config.keys = appInfo.name + '_1501832752131_9495';

  config.view = {
    defaultViewEngine: 'nunjucks',
  };

  config.security = {
    csrf: false,
  };

  return config;
};
```

```js
// parse
const astUtil = require('egg-ast-utils');
const result = astUtil.parseNormal(fs.readFileSync('config.default.js').toString());

console.log(result);
// { nodes: [ { Assignment } ], children: { ... } }

console.log(result.get('view.defaultViewEngine'))
// { nodes: [ { Identify } ] }

console.log(result.get('security.csrf'))
// { nodes: [ { Identify } ] }
```