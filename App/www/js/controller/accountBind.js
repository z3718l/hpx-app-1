ionicApp.controller('accountBindController', function ($scope, $rootScope, $state, $ionicPopup, customerService, constantsService, payingService, localStorageService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.hpxColse = function () {
        $state.go('app.user');
    };
    $scope.model = {}
    //获取所有的银行账户信息，并显示是否为默认银行账户
    if ($rootScope.identity.is_verified == 0) {
        customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
            $scope.findEnterprise = data;
            if (data.enterprise_id) {
                $rootScope.identity.enterprise_id = $scope.findEnterprise.enterprise_id;
                payingService.getAccount($rootScope.identity.enterprise_id).then(function (data) {
                    if (data) {
                        $scope.AccountData = data.acct_list;
                        for (var i = 0; i < $scope.AccountData.length; i++) {
                            if ($scope.AccountData[i].is_default == 1) {
                                $scope.AccountData[i].is_default = "是";
                            } else {
                                $scope.AccountData[i].is_default = null;
                            }
                        }
                    }
                });
            }
        })
    }
    else {
        payingService.getAccount($rootScope.identity.enterprise_id).then(function (data) {
            if (data) {
                $scope.AccountData = data.acct_list;
                for (var i = 0; i < $scope.AccountData.length; i++) {
                    if ($scope.AccountData[i].is_default == 1) {
                        $scope.AccountData[i].is_default = "是";
                    } else {
                        $scope.AccountData[i].is_default = null;
                    }
                }
            }
        });
    }
    $rootScope.accountTypeCode = 501
    //卖方买方class改变
    $scope.changeType = function (accountTypeCode) {
        $rootScope.accountTypeCode = accountTypeCode;
        //获取所有的银行账户信息，并显示是否为默认银行账户

        payingService.getAccount($rootScope.identity.enterprise_id).then(function (data) {
            if (data.acct_list) {
                $scope.AccountData = data.acct_list;
                for (var i = 0; i < $scope.AccountData.length; i++) {
                    if ($scope.AccountData[i].is_default == 1) {
                        $scope.AccountData[i].is_default = "是";
                    } else {
                        $scope.AccountData[i].is_default = null;
                    }
                }
            }
        });
    }
    //调用后台功能进行自动验证
    $scope.verifySubmit = function () {
        if (parseInt($scope.model.verify_string) != 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入不超过1元的金额!！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        $scope.models = {
            'enterprise_person': $rootScope.identity.enterprise_name || $scope.findEnterprise.enterprise_name,
            'enterpriseId': $rootScope.identity.enterprise_id || $scope.findEnterprise.enterprise_id,
        };
        $scope.modeles = {
            account_type_code: 501,
            is_default: 0,
        }
        payingService.checkAccount($scope.models.enterpriseId, $scope.model.verify_string, $scope.modeles.is_default, $scope.modeles.account_type_code).then(function (data) {
            //$ionicPopup.alert({
            //    title: '通知',
            //    template: '小额验证成功！',
            //    okText: '确    定',
            //    cssClass: 'hpxModal'
            //});
            //$state.go('app.user');
            // 只有当第一次绑定银行卡鉴权的时候，才会强制退出一次
            if ($scope.AccountData.length < 2) {
                var alertPopup = $ionicPopup.alert({
                    title: '提示',
                    template: '小额验证通过，请退出重新登录进行电票交易！',
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
                alertPopup.then(function (res) {
                    // 强制退出，重新登录
                    $rootScope.identity = null;
                    localStorageService.set('customer', null);
                    $state.go('app.signin');
                })
            } else {
                $ionicPopup.alert({
                    title: '通知',
                    template: '小额验证成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                $state.go('app.user');
            }
        });

    };
    $scope.verify = function (data) {
        $scope.model = data;
    }
})