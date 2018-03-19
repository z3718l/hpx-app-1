ionicApp.controller('homeController', function ($http, $scope, $rootScope, API_URL, $state,$ionicSlideBoxDelegate, $filter, billService, $compile, toolService, $ionicHistory, $ionicPopup, bannerService) {
    $ionicHistory.clearHistory();

    $scope.hpxBill = function () {
        if (!$rootScope.identity) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go("app.signin");
        }
        else {
            $state.go("app.billOffer")
        }
    }

    $scope.fiter = {
        hpxType1: true,
    }
    $scope.hpxShou = function (billId) {
        if (!$rootScope.identity) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go("app.signin");
        }
        else {
            $state.go("app.myReleaseDetail", { 'myReleaseBillId': billId })
        }
    }

    $rootScope.boId = true;
    $rootScope.hpxQBS = 202;
    $rootScope.hpxBID = 101;

    $scope.doRefresh = function () {
        $scope.bills = [];
        $scope.products = [];
        $scope.loadMore();
    }

    $scope.loadMore = function () {
        billService.getHomeBillOffer('home', 202, 1).then(function (data) {
            if (!data) {
                //$scope.bills[0] = null;
            } else {
                $scope.bills[0] = data[0]
                $scope.bills[0].offer_detail = JSON.parse($scope.bills[0].offer_detail)
                toolService.getStars($scope.bills[0].enterprise_id).then(function (data) {
                    $scope.bills[0].star = data;
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
        billService.getHomeBillOffer('home', 203, 1).then(function (data) {
            if (!data) {

            } else {
                $scope.bills[1] = data[0]
                $scope.bills[1].offer_detail = JSON.parse($scope.bills[1].offer_detail)
                toolService.getStars($scope.bills[1].enterprise_id).then(function (data) {
                    $scope.bills[1].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
        billService.getHomeBillOffer('home', 204, 1).then(function (data) {
            if (!data) {

            } else {
                $scope.bills[2] = data[0]
                $scope.bills[2].offer_detail = JSON.parse($scope.bills[2].offer_detail)
                toolService.getStars($scope.bills[2].enterprise_id).then(function (data) {
                    $scope.bills[2].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
        billService.getHomeBillOffer('home', 205, 1).then(function (data) {
            if (!data) {

            } else {
                $scope.bills[3] = data[0]
                $scope.bills[3].offer_detail = JSON.parse($scope.bills[3].offer_detail)
                toolService.getStars($scope.bills[3].enterprise_id).then(function (data) {
                    $scope.bills[3].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });

        billService.getHomeBillProduct('home', 101).then(function (data) {

            if (data.length == 0) {

            } else if (data.length == 1) {
                $scope.products[0] = data[0];
                $scope.products[0].bill_deadline_time = $filter('date')($scope.products[0].bill_deadline_time, 'yyyy-MM-dd');
                toolService.getStars($scope.products[0].publisher_id).then(function (data) {
                    $scope.products[0].star = data
                });
            } else {
                $scope.products[0] = data[0];
                $scope.products[1] = data[1];
                $scope.products[0].bill_deadline_time = $filter('date')($scope.products[0].bill_deadline_time, 'yyyy-MM-dd');
                $scope.products[1].bill_deadline_time = $filter('date')($scope.products[1].bill_deadline_time, 'yyyy-MM-dd');

                toolService.getStars($scope.products[0].publisher_id).then(function (data) {
                    $scope.products[0].star = data
                });

                toolService.getStars($scope.products[1].publisher_id).then(function (data) {
                    $scope.products[1].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });

        billService.getHomeBillProduct('home', 102).then(function (data) {
            if (data.length == 0) {

            } else if (data.length == 1) {
                $scope.products[2] = data[0];
                $scope.products[2].bill_deadline_time = $filter('date')($scope.products[2].bill_deadline_time, 'yyyy-MM-dd');
                toolService.getStars($scope.products[2].publisher_id).then(function (data) {
                    $scope.products[2].star = data
                });
            } else {
                $scope.products[2] = data[0];
                $scope.products[3] = data[1];
                $scope.products[2].bill_deadline_time = $filter('date')($scope.products[2].bill_deadline_time, 'yyyy-MM-dd');
                $scope.products[3].bill_deadline_time = $filter('date')($scope.products[3].bill_deadline_time, 'yyyy-MM-dd');
                toolService.getStars($scope.products[2].publisher_id).then(function (data) {
                    $scope.products[2].star = data
                });
                toolService.getStars($scope.products[3].publisher_id).then(function (data) {
                    $scope.products[3].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);

    //获取点击billOfferId
    $scope.changeBillOfferId = function (billOfferId) {
        $rootScope.billOfferbillOfferId = billOfferId;       
    };
    $scope.calculator = function () {
        $state.go('app.calculator');
    };
    $scope.calendar = function () {
        $state.go('app.calendar');
    };
    $scope.querybank = function () {
        $state.go('app.querybank');
    };
    $scope.queryenterprise = function () {
        $state.go('app.queryenterprise');
    };

    $scope.judgeLogina = function () {
        $state.go('app.onLine');
    };
    //推广部分
    $scope.judgeLogin = function () {
        if ($rootScope.identity == null) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText:'确    定',
                cssClass:'hpxModal'
            });
            $state.go("app.signin");
            return;
        } else {
            $state.go('app.promoteEvent');
        }
    };
    $scope.judgeLoginc = function () {
        $state.go('app.bannerSecurity');
    };
    $scope.judgeLogind = function () {
        $state.go('app.newRegister');
    };
    
    hpxV = function () {
        // 判断版本
        var versionCode = 160;
        // 获取服务器版本
        $http.get(API_URL + "/appVersion/getLatestVersion").success(function (data) {
            var ser_versionCode = parseInt(data.data.toString().replace(/\./g, ''));
            if (versionCode < ser_versionCode) {
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxQuan hpxQing',
                    template: '<div class="hpxPermis">' +
                               '<div class="box">' +
                               '<h4>发现新版本 v' + data.data + '</h4>' +
                               '<section style="line-height:26px;">新版本浏览更快速，功能更便捷，还不快去更新！</section>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '稍后再说',
                              type: 'button-royal',
                          },
                          {
                              text: '立即更新',
                              type: 'button-calm',
                              onTap: function (e) {
                                  //window.open("http://139.224.112.243/huipiaoxian.apk");
                                  window.open("http://android.myapp.com/myapp/detail.htm?apkName=io.cordova.hpx");
                              }
                          }
                    ]
                })
            }
        })

        // 获取banner信息
        //bannerService.banner().then(function (data) {
        //    console.log("111111")
        //    console.log(data)
        //    $scope.banner = data;
        //    $scope.updateSlide();
        //})
    }
    hpxV();
    //$scope.updateSlide = function () {
    //    $ionicSlideBoxDelegate.$getByHandle('slideboximgs').update();
    //    $ionicSlideBoxDelegate.$getByHandle("slideboximgs").loop(true);
    //}
    //$scope.judgeLogina = function (bann) {
    //    console.log("bann")
    //    console.log(bann)
    //    $rootScope.bannId = bann.id;
    //    if (bann.template_id == 1) {
    //        $state.go('app.templateOne');
    //    } else if (bann.template_id == 2) {
    //        $state.go('app.templateTwo');
    //    } else if (bann.template_id == 3) {
    //        $state.go('app.templateThree');
    //    } else if (bann.template_id == 4) {
    //        $state.go('app.templateFour');
    //    } else if (bann.template_id == 5) {
    //        if ($rootScope.identity == null) {
    //            $ionicPopup.alert({
    //                title: '提示',
    //                template: '账户未登录！',
    //                okText: '确    定',
    //                cssClass: 'hpxModal'
    //            });
    //            $state.go("app.signin");
    //            return;
    //        } else {
    //            $state.go('app.promoteEvent');
    //        }
    //    }
    //}
})