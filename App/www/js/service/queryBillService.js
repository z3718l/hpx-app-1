ionicApp.factory('queryBillService', ['Restangular', function (Restangular) {
    var res = Restangular.all('bills');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        //queryAll: function () {
        //    return res.get('billProduct', {}).then(function (result) {
        //        return result.bill_products;
        //    });
        //},
        //queryBillProduct: function (ProductId) {
        //    return res.get('billProduct' + '/' + ProductId);
        //},
        query: function (params, bill_style_id, bill_status_code, acceptor_type_id, bill_character_code, product_location_id, trade_type_code, keyword) {
            var queryParam = {
                'billStyleId': bill_style_id,
                'billStatusCode': bill_status_code,
                'acceptorTypeId': acceptor_type_id,
                'billCharacterCode': bill_character_code,
                'locationId': product_location_id,
                'tradeTypeCode': trade_type_code,
                //'isValid': isValid,
                'keyword': keyword,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('billProduct', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_products;
            });
        },
        //add: function (model) {
        //    return res.all('billProduct').post(model);
        //},
        //update: function (model) {
        //    return res.one('billProduct', model.id).customPUT(model);
        //},
        //remove: function (id) {
        //    return res.all('billProduct').customDELETE(id);
        //},
        //login: function (loginRequest) {
        //    return res.all('Login').post(loginRequest);
        //},
        //updateUserInfo: function (user) {
        //    return res.all('UpdateUserInfo').post(user);
        //},
        //updatePassword: function (oldPassword, newPassword) {
        //    return res.all('UpdatePassword').post(
        //        {
        //            'oldPassword': oldPassword,
        //            'newPassword': newPassword,
        //        });
        //},
        //resetPassword: function (userID) {
        //    return res.get('ResetPassword', { 'userID': userID });
        //}
    }
}]);
