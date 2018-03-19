ionicApp.controller('followController', function ($scope, $rootScope,$stateParams, $state, $ionicPopup, customerService, toolService) {
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
    $scope.detail = function(model) {
        $rootScope.boId = false
        $rootScope.eId = model.collection_enterprise_id
        $rootScope.eN = model.collection_enterprise_name
        $state.go('app.onDaLs');
    }
    //$scope.filter = {
    //    follBiEn:1
    //}
    //$scope.filter.follBiEn = $stateParams.follBiEn;
    //$scope.tab = 1;
    if ($rootScope.idBiEn == 1) {
        $scope.tab = 1;
    } else if ($rootScope.idBiEn == 2) {
        $scope.tab = 2;
    }
    $scope.hpxFollow = true;
    $scope.closeModel = function() {
        $state.go('app.user')
    }
    $scope.setTab = function (index) {
        $scope.tab = index;
        $scope.doRefresh();
    }
    $scope.filter = {};
    $scope.is_vis = false;
    if ($scope.hpxFollow) {
        $scope.doRefresh = function () {
            $scope.params = $scope.Params.Create();
            $scope.listData = [];
            $scope.billListData = [];
            $scope.loadMore();
        };
        $scope.loadMore = function (first) {
            if ($scope.tab == 1) {
                customerService.getAllFollowEnterprises($scope.params).then(function (data) {
                    if (data == null) {
                        $scope.is_vis = true;
                    } else {
                        $scope.is_vis = false;
                        $scope.hasMore = data.length == 10;
                        $scope.listData = first ? data : $scope.listData.concat(data);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                    }

                });
            }
            else {
                customerService.getAllFollowBills($scope.params).then(function (data) {
                    if (data.length == 0) {
                        $scope.is_vis = true;
                    } else {
                        $scope.is_vis = false;
                    }
                    $scope.hasMore = data.length == 10;
                    $scope.billListData = first ? data : $scope.billListData.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                });
            }
            $scope.params.next();
        };
    }
    $scope.myFollow = function (item) {
        console.log(item)
        $scope.billsModel = item;
        if (item.bill_status >= 804) {
            var myPopup = $ionicPopup.show({
                cssClass: 'hpxModals hpxFollowS',
                title:'提示',
                template: '此张票据已交易，无法进行竞价。',
                scope: $scope,
                buttons: [
                      {
                          text: '取消收藏',
                          type:'button-default',
                          onTap: function (e) {
                              //$state.go('app.user');
                              var follow = 0;
                              //$scope.follow = function (follow) {
                                  $scope.followModel = {
                                      collection_bill_id: item.collection_bill_id,
                                      is_collection_bill: follow
                                  }
                                  customerService.followBill($scope.followModel).then(function () {
                                      //$scope.model.is_collection_enterprise = follow;
                                      $scope.billsModel.is_collection_bill = follow;
                                      $scope.setTab(2);
                                  })
                              //}
                          }
                      },
                      {
                          text: '确定',
                          type: 'button-positive',
                          onTap: function (e) {
                              //$state.go('app.authorizate');
                          }
                      }
                ]
            })
        } else {
            $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.collection_bill_id });
        }
    };
    $scope.followBill = function (collection_bill_id, follow) {
        $scope.followBillModel = {
            collection_bill_id: collection_bill_id,
            is_collection_bill: follow
        };
        customerService.followBill($scope.followBillModel)
        $scope.doRefresh();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})