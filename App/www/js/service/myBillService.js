ionicApp.factory('myBillService', ['Restangular', function (Restangular) {
    var res = Restangular.all('bills');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        //queryAll: function () {
        //    return res.get('bill', {}).then(function (result) {
        //        return result.bill_products;
        //    });
        //},
        //bill_status_code, acceptor_type_id, bill_character_code, product_location_id, trade_type_code,
        query: function (params, bill_deadline_time, bill_type_id, bill_style_id, keyword) {
            var queryParam = {
                'bdeadline_time': bill_deadline_time,
                'billTypeId':bill_type_id,
                'billStyleId': bill_style_id,
                //'billStatusCode': bill_status_code,
                //'acceptorTypeId': acceptor_type_id,
                //'billCharacterCode': bill_character_code,
                //'locationId': product_location_id,
                //'tradeTypeCode': trade_type_code,
                //'isValid': isValid,
                'keyword': keyword,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('bill', queryParam).then(function (result) {
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


