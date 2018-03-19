ionicApp.controller('photoTestController', function ($scope, $rootScope, customerService, $state) {
    // 模拟登陆
    customerService.customerLoginEnterprise({ 'username': 'jinyifan', 'password': '123654789' }).then(function (data) {
        customerService.customerLogin({ 'username': 'jinyifan', 'password': '123654789', 'enterprise_id': data.enterprises[0].enterprise_id }).then(function (data) {
            $rootScope.identity = data;
        });
    });

    $scope.takePhoto = function () {
        $scope.$takePhoto(function (data) {
            $scope.photoSrc = data;
        });
    }

    $scope.upload = function (src) {
        $scope.$uploadPhoto(src, function (data) {
            
        });
    }
})