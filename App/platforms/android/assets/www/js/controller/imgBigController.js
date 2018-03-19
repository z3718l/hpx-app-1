ionicApp.controller('imgBigController', function ($scope, $rootScope, $state, $stateParams, $ionicHistory) {

    $scope.img_path = $stateParams.imgPath;
    $scope.rotate90 = false;
    $scope.back = function () {
        $ionicHistory.goBack();
    }
})