ionicApp.controller('billDetailController', function ($rootScope, $scope, $state, billService) {
    $scope.model = {};
    alert($rootScope.billQuerybillProductId);
    billService.getBillProduct($rootScope.billQuerybillProductId).then(function (data) {
        $scope.model = data;
    });
});