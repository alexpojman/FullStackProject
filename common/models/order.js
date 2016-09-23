'use strict';

module.exports = function(Order) {
  Order.beforeRemote('create', function(context, user, next) {
    context.args.data.customerId = context.req.accessToken.userId;
    next();
  });
};
