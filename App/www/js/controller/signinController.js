ionicApp.controller('signinController', function ($rootScope, $scope, $state, $interval, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {
    $scope.model = {};
    $scope.loginRequestEnterprise = {};
    $scope.loginRequest = {};
    $scope.loginRequestEnterprise.username = "";
    $scope.loginRequestEnterprise.password = "";
    $scope.loginRequest.username = "";
    $scope.loginRequest.password = "";
    $rootScope.loginRequestEnter = {};
    $scope.enterprises = [];
    //新建账户信息
    $scope.loginEnterprise = function () {
        $scope.loginRequestEnterprise = {
            username: $scope.model.phone_number,
            password: $scope.model.password,
        }
        $rootScope.loginRequestEnter = {
            username: $scope.model.phone_number,
            password: $scope.model.password,
        }
        customerService.customerLoginEnterprise($scope.loginRequestEnterprise).then(function (data) {
            if (data.enterprises[0].enterprise_id != -1) {
                if (data.enterprises.length == 1) {
                    $scope.loginRequest = {
                        username:$scope.model.phone_number,
                        password: $scope.model.password,
                        enterprise_id:data.enterprises[0].enterprise_id,
                    }
                    customerService.customerLogin($scope.loginRequest).then(function (data) {
                        localStorageService.set('customer', data);
                        $rootScope.identity = data;
                        Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
                        $state.go('app.user');      //跳转到个人中心
                    });
                } else {
                    $rootScope.enterprises = data.enterprises;
                    $state.go('app.signinEnterprise');
                }
            } else {
                $scope.loginRequest = {
                    username: $scope.loginRequestEnterprise.username,
                    password: $scope.loginRequestEnterprise.password,
                    enterprise_id: -1
                };
                customerService.customerLogin($scope.loginRequest).then(function (data) {
                    localStorageService.set('customer', data);
                    $rootScope.identity = data;
                    Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
                    $state.go('app.user');      //跳转到个人中心
                });
            }
        });
    };
    $scope.login = function (enterprise_id) {
        $scope.loginRequest = {
            username: $scope.loginRequestEnterprise.phone_number,
            password: $scope.loginRequestEnterprise.password,
            enterprise_id: enterprise_id
        }
        customerService.customerLogin($scope.loginRequest).then(function (data) {
            localStorageService.set('customer', data);
            $rootScope.identity = data;
            Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
            $state.go('app.user');      //跳转到个人中心
        });
    };
})