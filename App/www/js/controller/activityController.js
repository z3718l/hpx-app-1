ionicApp.controller('activityController', function ($scope, $rootScope, $state,$compile) {
    $scope.onLine = function () {
        $state.go("app.onLine")
    }
    $scope.hpxReward = '<img src="images/activity8.png" alt="" /><img ng-click="onLine()" src="images/activity7.png" alt="" />';
    $scope.phxIntrod = '<img src="images/activity6.png" alt="" /><img ng-click="onLine()" src="images/activity7.png" alt="" />';

    $scope.style = 'line-height:0;'
    $scope.style1 = 'height:100%;background-color:#fedd52;'

    angular.element(".act_bind1").append($compile($scope.hpxReward)($scope));
    angular.element(".act_bind2").append($compile($scope.phxIntrod)($scope));
})