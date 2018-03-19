ionicApp.controller('signupController', function ($rootScope, $scope, $state, $interval, $ionicModal, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {
    $scope.model = {};
    $scope.verifyStr = "获取验证码";
    $scope.disableVerify = false;
    $scope.filter = {
        choicePhone: 0,
        rule: true
    }
    //var second = 90;
    //发送验证码
    $scope.getVerify = function () {
        if (!$scope.model.phone_number || $scope.model.phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        customerService.phoneVerify($scope.model.phone_number).then(function () {
            $ionicPopup.alert({
                title: '通知',
                template: '验证码已发送!',
                okText: '确    定',
                cssClass: 'hpxModal'
                });
            $scope.second = 60;
            $scope.disableVerify = true;

            $interval(function () {
                $scope.verifyStr = $scope.second + "秒后重新获取";
                $scope.second--;

                if ($scope.second == 0) {
                    $scope.verifyStr = "重新获取验证码";
                    $scope.disableVerify = false;
                }
            }, 1000, 60);
        })
    };

    $scope.PhoneChange = function () {
        if ($scope.model.phone_number && (/^1(3|4|5|7|8)\d{9}$/.test($scope.model.phone_number))) {
            //$scope.model.phone_number.length == 11 &&
            customerService.testPhoneNumber($scope.model.phone_number).then(function (data) {
                if (!data) {
                    $scope.filter.choicePhone = 1;
                }
                else {
                    $scope.filter.choicePhone = 2;
                }
            });
        }
        else if ($scope.model.phone_number && $scope.model.phone_number.length == 11) {
            $scope.filter.choicePhone = 3;
        }
    }

    $ionicModal.fromTemplateUrl('servicePopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.serviceModal = modal;
    });
    $scope.hpxService = function () {
        $scope.serviceModal.show();
    };
    $scope.closeModel = function () {
        $scope.serviceModal.hide();
    }

    $scope.signup = function () {
        if (!$scope.model.phone_number || $scope.model.phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.password || $scope.model.password.length == 0) {
             $ionicPopup.alert({
                title: '提示',
                template: '请输入密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
                });
                return;
        }

        if (!$scope.model.password || $scope.model.password.length < 6) {
             $ionicPopup.alert({
                 title: '提示',
                 template: '请输入密码!',
                 okText: '确    定',
                 cssClass: 'hpxModal'
             });
            return;
        }

        if ($scope.model.password != $scope.model.password2) {
             $ionicPopup.alert({
                 title: '提示',
                 template: '两次密码输入不一致！',
                 okText: '确    定',
                 cssClass: 'hpxModal'
             });
            return;
        }

        if (!$scope.model.phone_verify_code || $scope.model.phone_verify_code.length == 0) {
             $ionicPopup.alert({
                 title: '提示',
                 template: '请输入验证码！',
                 okText: '确    定',
                 cssClass: 'hpxModal'
             });
            return;
        }

        if (!$scope.filter.rule) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读协议并勾选同意！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        //注册功能
        customerService.customerReg($scope.model).then(function (data) {
            $ionicPopup.alert({
                title: '通知',
                template: '注册成功，请完善联系人信息!',
                okText: '确    定',
                cssClass: 'hpxModal'
                });
            $scope.loginRequest = {
                username: $scope.model.phone_number,
                password: $scope.model.password,
                enterprise_id: -1
            }
            $rootScope.loginRequestEnter = {
                username: $scope.model.phone_number,
                password: $scope.model.password,
                enterprise_id: -1
            }
            //新建账户信息
            customerService.customerLogin($scope.loginRequest).then(function (data) {
                //$cookieStore.put('customer', data);
                localStorageService.set('customer', data);
                //alert(data.token);
                $rootScope.identity = data;
                Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
                $state.go('app.userInfo');      //跳转到个人中心
            });
        });
    }

    //$scope.tLogin = function () {
    //    $scope.loginRequest = {
    //            username: 17826859540,
    //            password: '111111',
    //            enterprise_id: -1
    //        }
    // customerService.customerLogin($scope.loginRequest).then(function (data) {
    //            //$cookieStore.put('customer', data);
    //            localStorageService.put('customer', data);
    //            alert(data.token);
    //            $rootScope.identity = data;
    //            Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
    //            $state.go('app.home');      //跳转到个人中心
    //        });
    //}
});