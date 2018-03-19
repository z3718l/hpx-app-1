ionicApp.controller('signinEnterpriseController', function ($rootScope, $scope, $state, $interval, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {
    //新建账户信息
    $scope.loginRequest = {};
    $scope.loginRequest.username = "";
    $scope.loginRequest.password = "";
    $scope.enterprises1 = [];
    $scope.enterprises1 = $rootScope.enterprises;
    $scope.loginRequest = $rootScope.loginRequestEnter;

    $scope.loginEnter = function (n) {
        $scope.loginRequest.enterprise_id = n;
        customerService.customerLogin($scope.loginRequest).then(function (data) {
            localStorageService.set('customer', data);
            $rootScope.identity = data;
            Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
            $state.go('app.user');      //跳转到个人中心
        });
    };

})