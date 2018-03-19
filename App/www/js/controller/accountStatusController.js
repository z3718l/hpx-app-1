ionicApp.controller('accountStatusController', function ($scope, $rootScope, $state, $ionicPopup, customerService, payingService) {
    console.log($scope)
    console.log($rootScope)
    // 查询个人信息，企业信息，经办人信息以及账户信息
    customerService.getCustomer().then(function (data) {
        $scope.model = data;
        if ($rootScope.identity.customer_id && $scope.model.is_verified != 0) {
            customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
                $scope.singleEnterprise = data;
                $scope.enterpriseModel = data;
                if ($scope.singleEnterprise.enterprise_id != 0 && ($scope.singleEnterprise.enterprise_id != null || $scope.enterpriseModel.is_verified != 0)) {
                    // 根据企业id查询经办人信息
                    payingService.getAgentTreasurer($scope.singleEnterprise.enterprise_id).then(function (agentData) {
                        $scope.agentModel = agentData;
                    });
                    // 根据企业信息查询银行卡信息
                    payingService.getAccount($scope.singleEnterprise.enterprise_id).then(function (accountData) {
                        //$scope.isLoging = false;
                        if (accountData) {
                            $scope.AccountData = accountData.acct_list;
                        } else {
                            $scope.AccountData = ""
                        }
                    })
                }
            })
        }
    });
    // 机构认证 验证
    //ui-sref="app.accredit"
    $scope.accredit = function () {
        if ($scope.model.is_verified == 0) {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请先完善联系人信息！',
                okText: '确    定',
                cssClass: 'hpxModal',
            });
            alertPopup.then(function (res) {
                $state.go('app.userInfo');
            })
        } else {
            $state.go('app.accredit');
        }
    }
    // 业务授权验证
    //ui-sref="app.newAuthorizate"
    $scope.newAuthorizate = function () {
        if ($scope.singleEnterprise.enterprise_id == 0 || $scope.singleEnterprise.enterprise_id == '') {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请先进行机构认证！',
                okText: '确    定',
                cssClass: 'hpxModal',
            });
            alertPopup.then(function (res) {
                $state.go('app.accredit');
            })
        } else {
            $state.go('app.newAuthorizate');
        }
    }
    // 账户绑定验证
    $scope.accountBind = function () {
        if ($scope.model.is_verified < 3) {
            $ionicPopup.alert({
                title: "通知",
                template: "请先进行机构绑定和业务授权！",
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        } else {
            $state.go('app.accountBind');
        }
    }
})