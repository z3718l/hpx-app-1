ionicApp.controller('billOfferQueryController', function ($scope, $rootScope, $state, $ionicPopup, billService) {
    $scope.filter = {};

    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-offer_time', 10);
        //$scope.listData = [];
        $scope.loadMore();
    };
    $scope.loadMore = function (first) {
        //billService.getOwnBillOffer($scope.params, $scope.filter.billTypeId, $scope.filter.billStyleId, $scope.filter.maxPrice, $scope.filter.tradeLocationId, $scope.filter.keyword).then(function (data) {
        //    $scope.hasMore = data.length == 10;
        //    //for (item in data) {
        //    //    //console.log(data[item].offer_detail)
        //    //    console.log(JSON.parse(data[item].offer_detail))
        //    //    //data[item].offer_detail = JSON.parse(data[item].offer_detail);
        //    //}
        //    $scope.listData = first ? data : $scope.listData.concat(data);
        //    $scope.$broadcast('scroll.infiniteScrollComplete');
        //});
        //$scope.params.next();

        billService.getBillOfferBySelf().then(function (data) {
            if (data == null) {
                $scope.listData = data;
                //$state.go('app.newBillOffer');
            } else {
                $scope.listData = data.billOffers;
                for (item in data.billOffers) {
                    data.billOffers[item].offer_detail = JSON.parse(data.billOffers[item].offer_detail)
                }
            }
        })
        $scope.params.next();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);

    $scope.changeBillOfferId = function (billOfferId) {
        console.log("获取票据id")
        console.log(billOfferId)
        $rootScope.boId = true;
        $rootScope.billOfferbillOfferId = billOfferId;
    };

    //删除报价
    $scope.remove = function (data) {
        var confirmPopup = $ionicPopup.confirm({
            title: '注意',
            template: '确定要删除该报价吗?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                billService.deleteBillOffer(data.id).then(function (data) {
                    $scope.doRefresh();
                });
            }
        });
    }

    $scope.edit = function (data) {
        //跳转到报价详细信息
        $state.go('app.newBillOffer', { 'id': data.id });
    }

    // 跳转新建报价
    $scope.hpxXinZeng = function () {
        $state.go('app.onLines');
    }
});