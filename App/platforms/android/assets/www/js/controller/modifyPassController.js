ionicApp.controller('modifyPassController', function ($rootScope, $scope, $state, $ionicPopup, customerService) {
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
    $scope.model = {};

    $scope.submit = function () {

        if (!$scope.model.old_password || $scope.model.old_password.length == 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入旧密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.old_password || $scope.model.old_password.length < 6) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入旧密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.model.new_password || $scope.model.new_password.length == 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入新密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.new_password || $scope.model.new_password.length < 6) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入新密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if ($scope.model.new_password != $scope.model.new_password2) {
            $ionicPopup.alert({
                title: '提示',
                template: '两次密码输入不一致！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        $scope.model.submitRequest = {
            password: $scope.model.old_password,
            new_password: $scope.model.new_password,
        }
        //修改密码
        customerService.customerModifyPassword($scope.model.submitRequest).then(function (data) {
            $ionicPopup.alert({
                title: '通知',
                template: '密码修改成功！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $rootScope.loginRequestEnter.password = $scope.model.submitRequest.new_password;
            $state.go('app.user');      //跳转到个人中心
        });
    }
});