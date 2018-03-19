ionicApp.controller('myTaskController', function ($scope, $rootScope, $state, customerService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.tab = 1;
    $scope.filter = {
        
    };
    $scope.is_vis = false;
    $scope.setTab = function (set) {
        $scope.tab = set;
        $scope.doRefresh();
    }
    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create();
        $scope.drawerListData = [];
        $scope.reciverListData = [];
        $scope.loadMore();
    };
    $scope.loadMore = function (first) {
        if ($scope.tab == 1) {
            $scope.setType = 'drawer';
            customerService.getMyTasks($scope.params, $scope.setType).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                $scope.drawerListData = first ? data : $scope.drawerListData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
            });
        } else {
            $scope.setType = 'reciver';
            customerService.getMyTasks($scope.params, $scope.setType).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                $scope.reciverListData = first ? data : $scope.reciverListData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
            });
        }        
        $scope.params.next();
    };
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})