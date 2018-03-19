ionicApp.controller('billQueryController', function ($scope, $rootScope, $state, $filter, $ionicPopup, billService, addressService, $cordovaGeolocation, $ionicGesture) {
    //date类型转换
    Date.prototype.pattern = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份         
            "d+": this.getDate(), //日         
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
            "H+": this.getHours(), //小时         
            "m+": this.getMinutes(), //分         
            "s+": this.getSeconds(), //秒         
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度         
            "S": this.getMilliseconds() //毫秒         
        };
        var week = {
            "0": "日",
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    $scope.dateFilter = { date_index: 0 };
    $scope.dates = [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }];
    $scope.dateTimes = [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }];
    $scope.date = new Date();
    for (var i = 0; i < 5; i++) {
        $scope.dates[i].date = $scope.date.pattern("yyyy-MM-dd EE");
        $scope.dateTimes[i].date = $scope.date.pattern("yyyy-MM-dd");
        $scope.date.setDate(($scope.date.getDate() - 1));
    }

    $scope.filter = {
        acceptorTypeID: '',
        billStatusAll: true,
        tradeTypeCode: '',
        //billTypeID: ['101', '102'],
        billTypeID: '',
        billStatusCode: '801',
        billCharacterCode: '',
        billStyleID: '',
        sort: -1,
        priceArrow: true,
        deadlineTimeArrow: false,
        locationId: ''
    };
    $scope.is_vis = false; // 没有数据时候的显示与隐藏
    $scope.doRefresh = function () {
        switch ($scope.filter.sort) {
            case -1:
                $scope.params = $scope.Params.Create("-publishing_time", 10);
                break;
            case 0:
                if ($scope.filter.priceArrow) {
                    $scope.params = $scope.Params.Create('-bill_sum_price', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+bill_sum_price', 10);
                }
                break;
            case 1:
                if ($scope.filter.deadlineTimeArrow) {
                    $scope.params = $scope.Params.Create('-deadline_time', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+deadline_time', 10);
                }
                break;
        }
        $scope.listData = [];
        //$scope.listData102 = [];
        $scope.loadMore();
    };
    $scope.isGeoLocation = false;

    // 判断是否登录  电票
    $scope.hpxRelBill = function (item) {
        if ($rootScope.identity == null) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go("app.signin");
            return;
        } else {
            $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.id ,'check':3});
        }
    };

    //定位
    $scope.geoLocation = function () {
        baidumap_location.getCurrentPosition(function (result) {
            addressService.geoLocation(result.latitude, result.longitude).then(function (data) {
                if (data) {
                    $scope.isGeoLocation = true;
                    if (data.locationIdList) {
                        $scope.locationModel.province_name = data.locationIdList[0].provinceName;
                        $scope.locationModel.province_id = data.locationIdList[0].provinceId;
                        $scope.locationModel.city_id = data.locationIdList[0].citytId;
                        $scope.locationModel.city_name = data.locationIdList[0].cityName;
                    }
                    //直辖市
                    else if (data.districtId) {
                        $scope.locationModel.province_name = data.cityName;
                        $scope.locationModel.province_id = data.cityId
                        //$scope.locationModel.city_id = data.districtId;
                        $scope.locationModel.city_id = data.cityId;
                        $scope.locationModel.city_name = data.districtName;
                    }
                    else {
                        $scope.locationModel.province_name = data.cityName;
                        $scope.locationModel.province_id = data.cityId;
                        $scope.locationModel.city_name = data.cityName;
                        $scope.locationModel.city_id = data.cityId;
                    }
                    $scope.filter.locationId = $scope.locationModel.city_id;
                    $scope.doRefresh();
                } else {
                    $ionicPopup.alert({
                        title: '通知',
                        template: '该城市不在定位范围内！',
                        okType: 'button-assertive',
                    });
                }
            })
        }, function (err) {
            console.log(err);
        })
    }

    if (!$rootScope.billSearchModel || !$rootScope.billSearchModel.city_name) {
        $scope.locationModel = {
            city_id: '',
            city_name: "未知"
        };
        $scope.geoLocation();
    }
    else {
        $scope.locationModel = {
            city_name: $rootScope.billSearchModel.city_name
        };
    }


    $rootScope.billQuerybillProductId = null;
    $scope.changeBillProductId = function (billProductId) {
        $rootScope.billQuerybillProductId = billProductId;
    };

    $scope.show = true;
    $scope.loadMore = function (first) {
        if ($rootScope.billSearchModel) {
            if ($rootScope.billSearchModel.city_id) {
                if ($rootScope.billSearchModel.province_id == 1 || $rootScope.billSearchModel.province_id == 20 || $rootScope.billSearchModel.province_id == 860 || $rootScope.billSearchModel.province_id == 2462) {
                    $scope.filter.locationId = $rootScope.billSearchModel.province_id;
                }
                else {
                    $scope.filter.locationId = $rootScope.billSearchModel.city_id;
                }
                $scope.locationModel.city_name = $rootScope.billSearchModel.city_name;
            }
        }

        billService.searchBillProduct($scope.params, $scope.filter.billTypeID, $scope.filter.billStyleID, $scope.filter.billStatusCode, $scope.filter.acceptorTypeID, $scope.filter.locationId, $scope.filter.tradeTypeCode, $scope.filter.billCharacterCode, $scope.filter.billFlawID).then(function (data) {
            $scope.products = data;
            if (data.length == 0) {
                $scope.is_vis = true;
            } else {
                $scope.is_vis = false;
            }
            $scope.hasMore = data.length == 10;
            
            $scope.listData = first ? $scope.products : $scope.listData.concat($scope.products);
            $scope.$broadcast('scroll.infiniteScrollComplete')
            $scope.params.next();
            $scope.$broadcast('scroll.refreshComplete')
        });
    };

    $scope.sort = 0;
    $scope.priceArrow = true;
    $scope.changeArrow = function (func) {
        switch (func) {
            case 'price':
                $scope.filter.sort = 0;
                $scope.filter.priceArrow = !$scope.filter.priceArrow;
                break;
            case 'deadline_time':
                $scope.filter.sort = 1;
                $scope.filter.deadlineTimeArrow = !$scope.filter.deadlineTimeArrow;
                break;
        }
        $scope.doRefresh();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
});