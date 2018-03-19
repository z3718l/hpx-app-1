ionicApp.controller('myReleaseElecAllController', function ($rootScope, $scope, $state, $filter, $stateParams, $ionicPopup, $ionicModal, billService, addressService, customerService, constantsService, payingService,bankService, fileService, orderService) {
    //console.log($scope)
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
    $scope.filter = {
        choiceBillType: 101,
        choiceStatus: 880,
        choiceorder: 0,
        isTrade: 0,
        status: null,
        isAlive: null,
        billStatusCode: null,
    };
    $scope.billsNumber = function () {
        billService.getBillsNumber($scope.filter.choiceBillType).then(function (data) {
            $scope.numberModel = data;
         })
    }
    $scope.billsNumber();
   


    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-publishing_time',10);
        $scope.listData = [];
        $scope.loadMore();
    };

    $scope.loadMore = function (first) {
            if ($scope.filter.status >= 809 && $scope.filter.choiceBillType == 101) {
                return orderService.getOwnOrder($scope.params, $scope.filter.choiceBillType, $scope.filter.status).then(function (data) {
                   
                    if ((($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881 || $scope.filter.choiceStatus == 882) && $scope.filter.choiceBillType == 101) || $scope.filter.choiceBillType == 102) {
                        for (var j = 0; j < data.length; j++) {
                            if (!data[j].bill_deadline_time)
                                data[j].remaining_day = null;
                        };
                    }
                    for (var j = 0; j < data.length; j++) {
                        data[j].publishing_time = $filter('date')(data[j].publishing_time, 'yyyy-MM-dd');
                        data[j].bill_deadline_time = $filter('date')(data[j].bill_deadline_time, 'yyyy-MM-dd');
                    };
                    $scope.hasMore = data.length == 10;
                    $scope.listData = first ? data : $scope.listData.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete')
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.params.next();
                });
                
            } else {
                return billService.getOwnBillProduct($scope.params, $scope.filter.choiceBillType, $scope.filter.isAlive, $scope.filter.billStatusCode).then(function (data) {
                  
                    if ((($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881 || $scope.filter.choiceStatus == 882) && $scope.filter.choiceBillType == 101) || $scope.filter.choiceBillType == 102) {
                        for (var j = 0; j < data.length; j++) {
                            if (!data[j].bill_deadline_time)
                                data[j].remaining_day = null;
                        };
                    }
                    for (var j = 0; j < data.length; j++) {
                       data[j].publishing_time = $filter('date')(data[j].publishing_time, 'yyyy-MM-dd');
                       data[j].bill_deadline_time = $filter('date')(data[j].bill_deadline_time, 'yyyy-MM-dd');
                    };
                    $scope.hasMore = data.length == 10;
                    $scope.listData = first ? data : $scope.listData.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete')
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.params.next();
                });
                
            }
            
        
    };
   $scope.$on('$stateChangeSuccess', $scope.doRefresh);
   // $scope.doRefresh();
    //选择电票
    $scope.choiceEBillType = function () {
        $scope.filter.choiceBillType = 101;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();

    };
    //选择纸票
    $scope.choicePBillType = function () {
        $scope.filter.choiceBillType = 102;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();
    };
    //全部
    $scope.choiceTradeStatusAll = function () {
        $scope.filter.choiceStatus = 880;
        $scope.filter.isTrade = 0;
        $scope.filter.isAlive = null;
        $scope.filter.billStatusCode = null;
        $scope.filter.status = null;
        $scope.filter.choiceorder = 0;
        $scope.doRefresh();
    }
    //平台审核
    $scope.choiceTradeStatusCheck = function () {
        $scope.filter.choiceStatus = 881;
        $scope.filter.isAlive = 0;
        $scope.filter.isTrade = 0;

        $scope.filter.billStatusCode = null;
        $scope.filter.status = null;
        $scope.filter.choiceorder = 0;
        $scope.doRefresh();
    }
    //发布中
    $scope.choiceTradeStatusPublish = function () {
        $scope.filter.choiceStatus = 882;
        $scope.filter.isAlive = 1;
        $scope.filter.isTrade = 0;

        $scope.filter.billStatusCode = null;
        $scope.filter.status = null;
        $scope.filter.choiceorder = 0;
        $scope.doRefresh();
    }
    //交易中
    $scope.choiceTradeStatusTrade = function () {
        $scope.filter.choiceStatus = 883;
        $scope.filter.choiceorder = 1;
        $scope.filter.isTrade = 1;

        if ($scope.filter.choiceBillType == 101) {
            $scope.filter.status = 809;
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = null;
        } else if ($scope.filter.choiceBillType == 102) {
            $scope.filter.billStatusCode = 809;
            $scope.filter.isAlive = null;
            $scope.filter.status = null;
        };
        $scope.doRefresh();
    }
    //交易完成
    $scope.choiceTradeStatusComplete = function () {
        $scope.filter.choiceStatus = 884;
        $scope.filter.isTrade = 0;

        if ($scope.filter.choiceBillType == 101) {
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = null;
            $scope.filter.status = 810;
            $scope.filter.choiceorder = 1;
            $scope.doRefresh();
        } else if ($scope.filter.choiceBillType == 102) {
            $scope.filter.status = null;
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = 810;
            $scope.doRefresh();
        }
    }
    //交易关闭
    $scope.choiceTradeStatusFail = function () {
        $scope.filter.choiceStatus = 885;
        $scope.filter.isAlive = 1;
        $scope.filter.isTrade = 0;

        if ($scope.filter.choiceBillType == 101) {
            $scope.filter.billStatusCode = null;
            $scope.filter.status = 816;
            $scope.filter.choiceorder = 0;
            $scope.doRefresh();
        } else if ($scope.filter.choiceBillType == 102) {
            $scope.filter.status = null;
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = 816;
            $scope.doRefresh();
        }
    }

    // 预约出票审核失败修改信息
    // 预约出票弹出完善窗口
    $ionicModal.fromTemplateUrl('addvPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.addvModal = modal;
    });
    $scope.hpxYuB = function (item) {
        $scope.items = item;
        //console.log(item)
        $stateParams.id = item.id;
        $scope.billId = item.id;
        // 如果没有竞价信息，且不通过（第一次不通过）
        // 根据票据id获取竞价信息 $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.id ,'check':3});
        billService.getBillProductBidding($scope.billId).then(function (data) {
            $scope.biddings = data;
            angular.forEach(data, function (ele, index) {
                $scope.hpxBidding = ele;
            });
            if ($scope.hpxBidding == null || $scope.items.is_checked == -1) {
                $state.go('app.drawBill', { id: item.id });
            } else if ($scope.hpxBidding != null && $scope.items.is_checked != -1) {
                // 如果有竞价信息进行预约出票的修改
                $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.id, 'check': 4 });
            } 

        });
    }

})