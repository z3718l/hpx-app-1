ionicApp.controller('evaluateCityController', function ($scope, $rootScope, $state) {
    $scope.model = {};
    $scope.model.star1 = 0;

    $scope.chioceStar11 = function () {
        $scope.model.star1 = 1;
    };

    $scope.chioceStar12 = function () {
        $scope.model.star1 = 2;
    };

    $scope.chioceStar13 = function () {
        $scope.model.star1 = 3;
    };

    $scope.chioceStar14 = function () {
        $scope.model.star1 = 4;
    };

    $scope.chioceStar15 = function () {
        $scope.model.star1 = 5;
    };

    $scope.model.star2 = 0;

    $scope.chioceStar21 = function () {
        $scope.model.star2 = 1;
    };

    $scope.chioceStar22 = function () {
        $scope.model.star2 = 2;
    };

    $scope.chioceStar23 = function () {
        $scope.model.star2 = 3;
    };

    $scope.chioceStar24 = function () {
        $scope.model.star2 = 4;
    };

    $scope.chioceStar25 = function () {
        $scope.model.star2 = 5;
    };
})