ionicApp.controller('modifyPhoneController', function ($scope, $rootScope, $state, $interval, $ionicPopup, customerService) {
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
    $scope.changePhoneModel = {
        oldPhoneVerifyStr: '获取验证码',
        newPhoneVerifyStr: '获取验证码',
    }
    customerService.getCustomer().then(function (data) {
        $scope.changePhoneModel.old_phone_number = data.phone_number;
    });
    
    $scope.disableVerify1 = false;
    $scope.disableVerify2 = false;
    
    $scope.filter = {
        choicePhone: 0,
    }
    $scope.PhoneChange = function () {
        if ($scope.changePhoneModel.new_phone_number && (/^1(3|4|5|7|8)\d{9}$/.test($scope.changePhoneModel.new_phone_number))) {
            customerService.testPhoneNumber($scope.changePhoneModel.new_phone_number).then(function (data) {
                if (!data) {
                    $scope.filter.choicePhone = 1;
                }
                else {
                    $scope.filter.choicePhone = 2;
                }
            });
        }
        else if ($scope.changePhoneModel.new_phone_number && $scope.changePhoneModel.new_phone_number.length == 11) {
            $scope.filter.choicePhone = 3;
        }
    }
    $scope.getOldPhoneVerify = function () {
        customerService.phoneVerify($scope.changePhoneModel.old_phone_number).then(function () {
            $ionicPopup.alert({
                title: '通知',
                template: '验证码已发送!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $scope.changePhoneModel.oldPhoneVerifyStrSecond = 60;
            $scope.disableVerify1 = true;

            $interval(function () {
                $scope.changePhoneModel.oldPhoneVerifyStr = $scope.changePhoneModel.oldPhoneVerifyStrSecond + "秒后可重新获取";
                $scope.changePhoneModel.oldPhoneVerifyStrSecond--;

                if ($scope.changePhoneModel.oldPhoneVerifyStrSecond == 0) {
                    $scope.changePhoneModel.oldPhoneVerifyStr = "重新获取验证码";
                    $scope.disableVerify1 = false;
                }
            }, 1000, 60);
        })

    };
    $scope.getNewPhoneVerify = function () {
        if (!$scope.changePhoneModel.new_phone_number || $scope.changePhoneModel.new_phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        customerService.phoneVerify($scope.changePhoneModel.new_phone_number).then(function () {
            $ionicPopup.alert({
                title: '通知',
                template: '验证码已发送!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $scope.changePhoneModel.newPhoneVerifyStrSecond = 60;
            $scope.disableVerify2 = true;

            $interval(function () {
                $scope.changePhoneModel.newPhoneVerifyStr = $scope.changePhoneModel.newPhoneVerifyStrSecond + "秒后可重新获取";
                $scope.changePhoneModel.newPhoneVerifyStrSecond--;

                if ($scope.changePhoneModel.newPhoneVerifyStrSecond == 0) {
                    $scope.changePhoneModel.newPhoneVerifyStr = "重新获取验证码";
                    $scope.disableVerify2 = false;
                }
            }, 1000, 60);
        })
    };
    $scope.submit = function () {
        customerService.customerPhone($scope.changePhoneModel).then(function (meta) {
            $ionicPopup.alert({
                title: '通知',
                template: '成功更换手机号，请重新登录!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go('app.signin');
        });
    }
})