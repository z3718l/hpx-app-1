ionicApp.controller('setController', function ($scope, $rootScope, $state, $ionicPopup, localStorageService) {
    $scope.loginOut = function () {
        if ($rootScope.identity) {
            $rootScope.loginRequestEnter = null;
            $rootScope.enterprises = null;
            $rootScope.identity = null;
            localStorageService.set('customer', null);
            $ionicPopup.alert({
                title: '提示',
                template: '退出成功!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        }
    }
    $scope.showVersion = function () {
        $ionicPopup.alert({
            title: '提示',
            template: '当前版本:汇票线v1.6.0!',
            okText: '确    定',
            cssClass: 'hpxModal hpxfu'
        });
    }
})