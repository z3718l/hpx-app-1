ionicApp.controller('myBiddingController', function ($scope, $rootScope, $state, $filter,$ionicPopup, billService, addressService, customerService, constantsService, bankService, fileService, orderService) {
    if($rootScope.identity == null){
        $ionicPopup.alert({
                    title: '提示',
                    template: '账户未登录！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
        $state.go("app.signin");
        return
    }
    $scope.filter = {
        choiceBillType: 101,
        choiceStatus: 880,
        status: null,
        iselectronic: 0,
    };
    $scope.billsNumber = function () {
        billService.getBillsNumber($scope.filter.choiceBillType).then(function (data) {
            $scope.numberModel = data;
        })
    }
    $scope.billsNumber();

    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-publishing_time', 10);
        $scope.listData = [];
        $scope.loadMore();
    };

    //获取我发布的票据信息
    $scope.loadMore = function (first) {
        if ($scope.filter.status >= 804 && $scope.filter.choiceBillType == 101) {
            return orderService.getOwnBiddingOrder($scope.params, $scope.filter.choiceBillType, $scope.filter.status).then(function (data) {
                 if ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].bill.status_code == 801 && data[i].bid_result == 0) {
                            data[i].bill.status_name = "已报价";
                        } else if (data[i].bill.status_code == 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失效";
                        } else if (data[i].bill.status_code > 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失败";
                        }
                    }
                };
                if (($scope.filter.choiceBillType == 101 && ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881)) || $scope.filter.choiceBillType == 102) {
                    for (var j = 0; j < data.length; j++) {
                        if (!data[j].bill.bill_deadline_time)
                            data[j].bill.remaining_day = null;
                    };
                }
                $scope.hasMore = data.length == 10;
                $scope.listData = first ? data : $scope.listData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete')
                $scope.$broadcast('scroll.refreshComplete');
                $scope.params.next();
            });
        } else {
            return billService.getOwnBillBidding($scope.params, $scope.filter.choiceBillType, $scope.filter.status).then(function (data) {
                if ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].bill.status_code == 801 && data[i].bid_result == 0) {
                            data[i].bill.status_name = "已报价";
                        } else if (data[i].bill.status_code == 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失效";
                        } else if (data[i].bill.status_code > 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失败";
                        }
                    }
                };
                if (($scope.filter.choiceBillType == 101 && ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881)) || $scope.filter.choiceBillType == 102) {
                    for (var j = 0; j < data.length; j++) {
                        if (!data[j].bill.bill_deadline_time)
                            data[j].bill.remaining_day = null;
                    };
                }
                $scope.hasMore = data.length == 10;
                $scope.listData = first ? data : $scope.listData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete')
                $scope.$broadcast('scroll.refreshComplete');
                $scope.params.next();
            });
            
        }
        
    };

    $scope.$on('$stateChangeSuccess', $scope.doRefresh);

    //选择电票
    $scope.choiceEBillType = function () {
        $scope.filter.choiceBillType = 101;
        $scope.filter.status = null;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();
    };
    //选择纸票
    $scope.choicePBillType = function () {
        $scope.filter.choiceBillType = 102;
        $scope.filter.status = null;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();
    };
    //全部
    $scope.choiceTradeStatusAll = function () {
        $scope.filter.iselectronic = 0;
        $scope.filter.choiceStatus = 880;
        $scope.filter.status = null;
        $scope.doRefresh();
    }
    //竞价
    $scope.choiceTradeStatusBidding = function () {
        $scope.filter.iselectronic = 0;
        $scope.filter.choiceStatus = 881;
        $scope.filter.status = 801;
        $scope.doRefresh();
    }
    //交易中
    $scope.choiceTradeStatusTrade = function () {
        $scope.filter.iselectronic = 1;
        $scope.filter.status = 804;
        //if ($scope.filter.choiceBillType == 101) {
        //    $scope.filter.status = 804;
        //} else if ($scope.filter.choiceBillType == 102) {
        //    $scope.filter.status = 809;
        //}
        $scope.filter.choiceStatus = 882;
        $scope.doRefresh();
    }
    //交易完成
    $scope.choiceTradeStatusComplete = function () {
        $scope.filter.iselectronic = 0;
        $scope.filter.status = 810;
        $scope.filter.choiceStatus = 883;
        $scope.doRefresh();
    }
    //交易失败
    $scope.choiceTradeStatusFail = function () {
        $scope.filter.iselectronic = 1;
        $scope.filter.status = 816;
        $scope.filter.choiceStatus = 884;
        $scope.doRefresh();
    }

    $scope.delete = function (data) {
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '是否确定删除？',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                billService.deleteBillBidding(data.id).then(function (result) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: ' 成功删除。',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    $scope.choiceTradeStatusBidding();
                    $scope.billsNumber();
                })
            }
        });
       
    }
})