# egg-ast-utils

## methods

### parseNormal

file

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

parse

```js
const astUtil = require('egg-ast-utils');
const result = astUtil.parseNormal(fs.readFileSync('config.default.js').toString());

console.log(result);
// { nodes: [ { Assignment } ], children: { ... } }

console.log(result.get('view.defaultViewEngine'))
// { nodes: [ { Identify } ] }

console.log(result.get('security.csrf'))
// { nodes: [ { Identify } ] }
```

### parseUnittest

file

```js
// test/util.test.js
describe('lib#utils#utils.js', () => {
  before(function* b() {
    ...
  });

  it('forEach should run without error', () => {
    ...
  });

  describe('sub describe 2', function() {
  	it('should throw friendly error', () => {
      ...
    });
  
    it('should throw error correctly without el', () => {
      ...
    });
  
    it('should run without error if no el', (done) => {
      ...
    });
  });
});
```

parse

```js
const astUtil = require('egg-ast-utils');
const list = astUtil.parseUnittest(fs.readFileSync('test/util.test.js').toString());

console.log(list);
// [
//   { 
//     node: { CallExpression },
//     type: 'describe',
//     describe: 'lib#utils#utils.js', 
//     children: [
//       { node: { CallExpression }, type: 'before' },
//       { node: { CallExpression }, type: 'it', describe: 'forEach should run without error' },
//       { node: { CallExpression }, type: 'describe', describe: 'sub describe 2', children: [ ... ] },
//     ]
//   }
// ]
```

