'use strict';


module.exports = app => (
  class Test extends app.Service {
    constructor(ctx) {
      super(ctx);
    }

    /**
     * 获取账号信息
     *
     * @param {Object} [page] - 分页参数
     *  - {Number} [page] - 页数
     *  - {Number} [size=30] - 每页条数
     *
     * @return {Array} - 游戏列表
     */
    userInfo(page) {
      return this.ctx.httpClient.request('xxxx');
    }

    'user.search'(data, page) {
      return this.ctx.httpClient.request('xxxx');
    }
  }
);