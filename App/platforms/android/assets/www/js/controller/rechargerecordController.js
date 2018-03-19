ionicApp.controller('rechargerecordController', function ($scope, $rootScope, $state, payingService) {
    
    $scope.filter = {};

    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create();
        $scope.listData = [];
        $scope.loadMore();
    };
    $scope.is_vis = false;
    $scope.loadMore = function (first) {
        payingService.platformAccountBalance($scope.params).then(function (data) {
            if (data == null) {
                $scope.is_vis = true;
            } else {
                $scope.is_vis = false;
            }
            $scope.hasMore = data.length == 10;
            $scope.listData = first ? data : $scope.listData.concat(data);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
        });

        $scope.params.next();
    };

    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})