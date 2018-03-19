ionicApp.controller('templateOneController', function ($scope, $rootScope, $state, $stateParams, $ionicPopup, $compile) {
    $scope.anTemplate = [
        {
            'url': 'images/activity2.png'
        },
        {
            'url': 'images/activity2.png'
        }
    ]
    $scope.updateSlide = function () {
        $ionicSlideBoxDelegate.$getByHandle('slideboximgs').update();
        $ionicSlideBoxDelegate.$getByHandle("slideboximgs");
    }
})