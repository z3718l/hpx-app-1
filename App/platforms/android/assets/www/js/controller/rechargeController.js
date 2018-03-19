ionicApp.controller('rechargeController', function ($scope, $rootScope, $ionicPopup, $state, $http, API_URL, payingService, alipayService) {
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
    $scope.alipayAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: '提示',
            template: '充值成功！',
            okText: '确    定',
            cssClass: 'hpxModal',
        });
        alertPopup.then(function (res) {
            //$state.go('app.recharge');
            //window.location.reload();
            $scope.model.recharge_price = "";
        })
    }
    $scope.model = {};
    $scope.submit = function () {
        //if (!$scope.model.recharge_price) return;
        //window.open(API_URL + '/paying/recharge?rechargePrice=' + $scope.model.recharge_price + '&enterpriseId=' + $rootScope.identity.enterprise_id);
        alipayService.alipay($scope.model.recharge_price, $rootScope.identity.enterprise_id).then(function (data) {
            var orderInfo = data.orderInfo;
            //cordova.plugins.AliPay.pay   cordova.plugins.alipay.payment
            cordova.plugins.AliPay.pay(orderInfo, function (e) {
                alipayService.synNotification(e).then(function (data) {
                    $scope.alipayAlert();
                })
            }, function (e) {
                alipayService.synNotification(e).then(function (data) {
                    
                })
            })
        });
    };
    if ($rootScope.identity.is_verified >= 3 || $rootScope.identity.is_verified == 1) {
        // 获取账户余额
        payingService.GetPlatformAccount().then(function (data) {
            $scope.hpxMoney = data;
        })
    }

})