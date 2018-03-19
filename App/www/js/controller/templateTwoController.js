ionicApp.controller('templateTwoController', function ($scope, $rootScope, $state, $filter, WEB_URL, $compile) {
    
    $scope.goTo = function () {
        window.history.back();
    }
    $scope.hpxReward = '<img src="images/activity8.png" alt="" /><img ng-click="goTo()" src="images/activity7.png" alt="" />';
    $scope.phxIntrod = '<img src="images/activity6.png" alt="" /><img ng-click="goTo()" src="images/activity7.png" alt="" />';

    $scope.style = 'line-height:0;'
    $scope.style1 = 'height:100%;background-color:#fedd52;'

    angular.element(".act_bind1").append($compile($scope.hpxReward)($scope));
    angular.element(".act_bind2").append($compile($scope.phxIntrod)($scope));
    
})