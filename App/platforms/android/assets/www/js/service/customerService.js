ionicApp.factory('customerService', ['Restangular', '$interval', '$rootScope', '$state', 'localStorageService', function (Restangular, $interval, $rootScope, $state, localStorageService) {
    var res = Restangular.all('customers');
    return {
        testLogin: function () {
            return res.get('testLogin', {});
        },
        customerLogin: function (model) {
            return res.all('appCustomerLogin').post(model);
        },
        customerLoginEnterprise: function (model) {
            return res.all('customerLoginEnterprise').post(model);
        },
        //退出登录功能，退出后跳转到网站首页
        logout : function () {
            res.all('customerLogout').post().then(function () {
                localStorageService.put('customer', null);
                $rootScope.identity = null;
                Restangular.setDefaultHeaders({});
                $state.go('app.user');
            });
        },
        //发送验证码,抽象
        getVerify: function (phone, model, verifyStr, disableVerifyStr) {
            if (model[disableVerifyStr])
                return;
            if (!phone || phone.length != 11) {
                swal('请输入正确的手机号码！');
                return;
            }

            res.all('phoneVerify').one(phone.toString()).get().then(function () {
                swal('验证码已发送');
                model[verifyStr + 'Second'] = 90;
                model[disableVerifyStr] = true;

                $interval(function () {
                    model[verifyStr] = model[verifyStr + 'Second'] + "秒后可重新获取";
                    model[verifyStr + 'Second']--;

                    if (model[verifyStr + 'Second'] <= 0) {
                        model[verifyStr] = "重新获取验证码";
                        model[disableVerifyStr] = false;
                    }
                }, 1000, 90);
            })
        },
        customerLogout: function () {
            return res.all('customerLogout').post();
        },
        phoneVerify: function (phone) {
            return res.all('phoneVerify').one(phone.toString()).get();
        },
        customerPhone: function(data){
            return res.one('customerPhone').customPUT(data);
        },
        customerReg: function (model) {
            return res.all('customerReg').post(model);
        },
        customerPasswordReset: function (phone, model) {
            return res.customPUT(model, 'customerPasswordReset', { 'phone': phone, 'r': 2 });
        },
        customerPasswordResets: function (phone, model) {
            return res.customPUT(model, 'customerPasswordReset', { 'phone': phone, 'r': 1 });
        },
        customerModifyPassword: function (model) {
            return res.one('customerPassword').customPUT(model);
        },

        getAllCustomerAddress: function () {
            return res.get('customerAddress', {});
        },
        getCustomerAddress: function (customerAddressId) {
            return res.all('customerAddress').one(customerAddressId.toString()).get();
        },
        addAddress: function (model) {
            return res.all('customerAddress').post(model);
        },
        updateAddress: function (model) {
            return res.one('customerAddress', model.id).customPUT(model);
        },
        updateAddressDefault: function(data){
            return res.one('customerAddress').customPUT({}, data.id, { 'func': 'default' });
        },

        removeAddress: function (id) {
            return res.all('customerAddress').customDELETE(id);
        },
        getAllEnterpriseAccount: function (accountTypeCode) {
            return res.get('enterpriseAccount', { 'accountTypeCode': accountTypeCode });
        },
        getEnterpriseAccount: function(accountId){
            return res.all('enterpriseAccount').one(accountId.toString()).get();
        },
        getAllEnterprise: function () {
            return res.get('enterprise', {});
        },
        getEnterprise: function (enterpriseId) {
            return res.all('enterprise').one(enterpriseId.toString()).get();
        },
        insertEnterprise: function (model) {
            return res.all('enterprise').post(model);
        },
        updateEnterprise: function (model) {
            return res.one('enterprise').customPUT(model);
        },
        updateEnterprise2: function (model) {
            console.log(model)
            return res.all('enterprise').all(model.id).post(model);
        },
        deleteEnterprise: function (enterpriseId) {
            return res.all('enterprise').customDELETE(enterpriseId);
        },
        updateEnterpriseDefault: function (data) {
            return res.one('enterpriseAccount').customPUT({}, data.id, { 'func': 'default' });
        },

        updateEnterpriseCredential: function (model) {
            return res.one('enterpriseCredential', model.id).customPUT(model);
        },
        
        sendCustomerReview:function(){
            return res.one('customerReview').post();
        },

        getEnterpriseMember: function () {
            return res.get('enterpriseMember', {});
        },
        insertEnterpriseMember: function (model) {
            return res.all('enterpriseMember').post(model);
        },
        deleteEnterpriseMember: function (operater) {
            return res.all('enterpriseMember').customDELETE(operater.remove_phone_number, { 'code': operater.operator_phone_number_code });
        },
        insertEnterpriseAccount: function (model) {
            return res.all('enterpriseAccount').post(model);
        },
        updateWnterpriseAccount: function(model){
            return res.all('enterpriseAccount').one(model.id.toString()).customPUT(model);
        },
        deleteEnterpriseAccount: function (enterpriseId) {
            return res.all('enterpriseAccount').customDELETE(enterpriseId);
        },

        getCustomer: function () {
            return res.get('customer', {});
        },
        updateCustomer: function (model) {
            return res.one('customer').customPUT(model);
        },
        verify: function (id, verify_string) {
            return res.one('enterpriseAccountCheck', id.toString()).customPUT({ 'verify_string': verify_string }, '', { 'func': 'auto' });
        },
        enterpriseDetail: function (keyword, isSimple) {
            return res.get("enterpriseDetail", { 'isSimple': isSimple, 'keyword': keyword });
        },
        testPhoneNumber: function (phone) {
            return res.get("testPhoneNumber", { 'phone': phone });
        },
        followEnterprise: function (model) {
            return res.all("myAttention").all("saveOrUpdateCollectionEnterprise").post(model)
        },
        getAllFollowEnterprises: function (params) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
            }
            return res.one("myAttention", "getAllCollectionEnterprises").get(queryParam).then(function (result) {
                if (result != null) {
                    params.total(result.page_info.items_number);
                    return result.customerCollections;
                }
            });
        },
        followBill: function (model) {
            return res.all("myAttention").all("saveOrUpdateCollectionBill").post(model)
        },
        getAllFollowBills: function (params) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
            }
            return res.one("myAttention", "getAllCollectionBills").get(queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.customerCollections;
            });
        },
        getMyTasks: function (params,setType) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'type': setType,
            }
            console.log(setType)
            return res.one("appCustomerTasks", "getMyTasks").get(queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.taskBills;
            });
        },
        SingleEnterprise: function (customerId) {
            return res.all('customerReview').one('getSingleEnterprise' + '?customerId=' + customerId).get();
        }
    }
}]);
