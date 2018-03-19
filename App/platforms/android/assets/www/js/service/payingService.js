ionicApp.factory('payingService', ['Restangular', function (Restangular) {
    var res = Restangular.all('paying');
    return {
        payByAlipay: function (recharge_price) {
            return res.all('orderLogistic').one(orderLogisticId.toString()).customPUT({ 'recharge_price': recharge_price });
        },
        platformAccountBalance: function (params, changeType) {
            var queryParam = {
                'changeType': 1,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
            }

            return res.get('platformAccountBalance', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.balance_changes;
            });
        },
        recharge: function (recharge_price) {
            return res.all('recharge').customPUT({ 'recharge_price': recharge_price });
        },
        GetPlatformAccount: function () {
            return res.one('platformAccount').get();
        },
        bfapi: {
            queryBalance: function (p, n) {
                var queryParam = {
                    'type': 3,
                    'p': p,
                    'n': n,
                    'orderBy': '-id',
                    'status': 1,
                }
                return res.all('bfapi').get('queryBalance', queryParam);
            }
        },
        openAccount: function (enterpriseId, model) {
            return res.all('xingyeapi').one('xingYeOpenAccount').one('openAccount').all(enterpriseId.toString()).post(model);
        },
        addMoreAccount: function (enterpriseId, model) {
            return res.all('xingyeapi').one('xingYeOpenAccount').one('addMoreAccount').all(enterpriseId.toString()).post(model);
        },
        checkAccount: function (enterpriseId, amt, isDefault, accountTypeCode) {
            var queryParam = {
                'amt': amt,
                'isDefault': isDefault,
                'accountTypeCode': accountTypeCode
            }
            return res.all('xingyeapi').one('xingYeOpenAccount').one('checkAccount').all(enterpriseId.toString()).post(queryParam)
        },
        getAccount: function (enterpriseId) {
            return res.all('xingyeapi').one('account').one('getAccount').one(enterpriseId.toString()).get();
        },
        getAccountR: function (accountId) {
            return res.all('xingyeapi').one('account').one('getAccountR').one(accountId.toString()).get()
        },
        queryAccount: function (token) {
            return res.all('xingyeapi').one('query').get({ 'token': token });
        },
        //orderPay:function(token){
        //    return res.all('xingyeapi').one('orderPay' + '?token' + token).post()
        //},
        orderPay: function (orderNum, sallerVAcctNo, buyerVAcctNo, orderId) {
            //console.log("s82=" + sallerVAcctNo) , phone_number, verifyCode 
            //console.log("b62=" + buyerVAcctNo)   + '&phone=' + phone_number + '&verifyCode=' + verifyCode
            return res.all('xingyeapi').one('orderPay').one('?orderName=' + orderNum + '&sallerVAcctNo=' + sallerVAcctNo + '&buyerVAcctNo=' + buyerVAcctNo + '&orderId=' + orderId).post();
        },
        getVacctNo: function (vacctNo, contractNum, billId) {
            return res.all('xingyeapi').one('econtract').one('getVacctNo' + '?vacctNo=' + vacctNo + '&contractNum=' + contractNum + '&billId=' + billId + '&type=' + 0).get();
        },
        getVacctNos: function (vacctNo, contractNum, billId) {
            return res.all('xingyeapi').one('econtract').one('getVacctNo' + '?vacctNo=' + vacctNo + '&contractNum=' + contractNum + '&billId=' + billId + '&type=' + 1).get();
        },
        econtractFirstSign: function (fromEnterpriseId,fromKeyWord, account_id, product_bidding_id) {
            var model = {
                'fromKeyWord': fromKeyWord,
                'account_id': account_id,
                'product_bidding_id': product_bidding_id
            }
            return res.all('xingyeapi').one('econtract').one('firstSign').all(fromEnterpriseId.toString()).post(model);
        },
        econtractNextSign: function (toEnterpriseId, toKeyWord, orderId) {
            var model = {
                'toKeyWord': toKeyWord, 'orderId': orderId
            }
            return res.all('xingyeapi').one('econtract').one('nextSign2').all(toEnterpriseId.toString()).post(model);
        },
        postAgentTreasurer: function (enterpriseId, model) {
            return res.all('xingyeapi').one('insertAgentTreasurer').all(enterpriseId.toString()).post(model);
        },
        postAgentTreasurer2: function (enterpriseId, model) {
            return res.all('xingyeapi').one('insertAgentTreasurer2').all(enterpriseId.toString()).post(model);
        },
        updateAgentTreasurer: function (enterpriseId, model) {
            return res.all('xingyeapi').one('updateAgentTreasurer').one(enterpriseId.toString()).customPUT(model);
        },
        getAgentTreasurer: function (enterpriseId) {
            return res.all('xingyeapi').one('selectAgentTreasurer').one(enterpriseId.toString()).get();
        },
        confirmXYPay: function (orderId) {
            return res.all('xingyeapi').one('pay' + '?orderId=' + orderId).customPUT();
        },
        getAccountPX: function (id) {
            return res.all('xingyeapi').one('account').one('getAccountP').one(id.toString() + '?type=' + 1).get();
        },
        getAccountPY: function (id) {
            return res.all('xingyeapi').one('account').one('getAccountP').one(id.toString() + '?type=' + 2).get();
        },
        saveAccount: function (modal) {
            console.log(modal);
            return res.all('xingyeapi').all('account').post(modal);
        }

    };
}]);