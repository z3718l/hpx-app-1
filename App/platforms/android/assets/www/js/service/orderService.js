ionicApp.factory('orderService', ['Restangular', function (Restangular) {
    var res = Restangular.all('orders');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        orderCount: function () {
            return res.get('orderCount', {});
        },
        getOwnOrderDrawer: function (params) {
            var queryParam = {
                'role': 'drawer',
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('order', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.orders;
            });
        },
        getOwnOrderReceiver: function (params) {
            var queryParam = {
                'role': 'receiver',
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('order', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.orders;
            });
        },
        getOwnOrder: function (params, billTypeId, status) {
            var queryParam = {
                'billTypeId': billTypeId,
                'status': status,
                'role': 'drawer',
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('order', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.orders;
            });
        },
        getOwnBiddingOrder: function (params, billTypeId, status) {
            var queryParam = {
                'billTypeId': billTypeId,
                'status': status,
                'role': 'receiver',
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('order', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.orders;
            });
        },
        getOrder: function (orderId) {
            return res.all('order').one(orderId.toString()).get();
        },
        orderPayCommission: function (orderId) {
            return res.all('orderCommission').one(orderId.toString()).put();
        },
        orderPay: function (orderId, model) {
            return res.all('orderPay').one(orderId.toString()).customPUT(model);
        },
        updateOrderReceiver: function (orderId, model) {
            return res.all('orderReceiver').one(orderId.toString()).customPUT(model);
        },
        orderPayNew: function (orderId, orderPayTypeId, phone_number, verifyCode) {
            return res.all('orderPay').one(orderId.toString()).get({ 'orderPayTypeId': orderPayTypeId, 'phone': phone_number, 'verifyCode': verifyCode });
        },
        //orderPay: function (orderId) {
        //    return res.all('orderPay').all('temp').one(orderId.toString()).get();
        //},
        //orderPayConfirm: function (orderId) {
        //    return res.all('orderPayConfirm').all('temp').one(orderId.toString()).get();
        //},
        orderEndorsement: function (orderId) {
            return res.all('orderEndorsement').one(orderId.toString()).customPUT();
        },
        getOrderEndorsement: function (orderId) {
            return res.all('orderEndorsement').one(orderId.toString()).get();
        },
        deleteOrderEndorsement: function (orderId) {
            return res.all('orderEndorsement').one(orderId.toString()).remove();
        },
        orderLogistics: function (orderLogisticId, model) {
            return res.all('orderLogistic').one(orderLogisticId.toString()).customPUT(model);
        },
        orderConfirm: function (orderId, token) {
            return res.all('orderConfirm').one(orderId.toString()).get({ 'token': token });
        },
        orderFinish: function (orderId) {
            return res.all('orderFinish').one(orderId.toString()).get();
        },
        orderAppraisal: function (orderId, model) {
            return res.all('orderAppraisal').one(orderId.toString()).customPUT(model);
        },
        getOrderRunning: function (role) {
            var queryParam = {
                'func': 'count',
                'role': role
            }

            return res.get('order', queryParam);
        },
        updateOrderAccountReceiver: function (orderId, receiver_account_id) {
            //return res.all('orderAccount').customPUT({ 'account_id': receiver_account_id }, orderId, { 'func': 'receiver' });
            return res.all('orderAccount').one(orderId.toString() + '?account_id=' + receiver_account_id + '&func=' + 'receiver').customPUT();
        },
        updateOrderAccountDrawer: function (orderId, drawer_account_id) {
            //return res.all('orderAccount').customPUT({ 'account_id': drawer_account_id }, orderId, { 'func': 'drawer' });
            //return res.all('orderAccount').customPUT(orderId, { 'func': 'drawer' } + '&account_id' + drawer_account_id);
            return res.all('orderAccount').one(orderId.toString() + '?account_id=' + drawer_account_id + '&func=' + 'drawer').customPUT();
        },
    }
}]);
