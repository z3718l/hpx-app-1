ionicApp.controller('billOfferController', function ($scope, $rootScope, $state, $filter, $ionicPopup, billService, toolService, addressService) {
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

    if ($rootScope.hpxQBS == 202) {
        $scope.tab = 1;
    } else if ($rootScope.hpxQBS == 203) {
        $scope.tab = 2;
    } else if ($rootScope.hpxQBS == 204) {
        $scope.tab = 3;
    } else if ($rootScope.hpxQBS == 205) {
        $scope.tab = 4;
    }
    //$scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;
        $scope.doRefresh();
    }


    //手势滑动
    $scope.onSwipeLeft = function () {
        //alert($scope.tab)
        if ($scope.tab != 4) {
            $scope.setTab($scope.tab + 1);
        }
    }

    $scope.onSwipeRight = function () {
        //alert($scope.tab)
        if ($scope.tab != 1) {
            $scope.setTab($scope.tab - 1);
        }
    }
    $scope.onSwipeDown = function () {

        if ($scope.hasMore) {
            $socpe.loadMore();
        }
    }
    //$scope.locationModel = {
    //    city_id:'',
    //    city_name: "未知"
    //};
    $scope.filter = {
        billStyleId: ['202', '203', '204', '205'],
        search: 'search',
        publishingTimeS: '',
        publishingTimeB: '',
        enterpriseName: '',
        tradeLocationId: '',
        sort: -1,
        rate01: false,
        rate02: false,
        rate03: false,
        rate04: false,
        rate05: false,
        rate06: false,
    };
    $scope.is_vis = false;
    $scope.doRefresh = function () {
        //alert($scope.filter.sort)
        switch ($scope.filter.sort) {
            case -1:
                $scope.params = $scope.Params.Create('-offer_time', 10);
                break;
            case 0:
                if ($scope.filter.rate01) {
                    $scope.params = $scope.Params.Create('-offer_rate01', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate01', 10);
                }
                break;
            case 1:
                if ($scope.filter.rate02) {
                    $scope.params = $scope.Params.Create('-offer_rate02', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate02', 10);
                }
                break;
            case 2:
                if ($scope.filter.rate03) {
                    $scope.params = $scope.Params.Create('-offer_rate03', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate03', 10);
                }
                break;
            case 3:
                if ($scope.filter.rate04) {
                    $scope.params = $scope.Params.Create('-offer_rate04', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate04', 10);
                }
                break;
            case 4:
                if ($scope.filter.rate05) {
                    $scope.params = $scope.Params.Create('-offer_rate05', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate05', 10);
                }
                break;
            case 5:
                if ($scope.filter.rate06) {
                    $scope.params = $scope.Params.Create('-offer_rate06', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate06', 10);
                }

        }
        $scope.listData202 = [];
        $scope.listData203 = [];
        $scope.listData204 = [];
        $scope.listData205 = [];

        // 时间判断
        var toDay = new Date()
        TY = toDay.getFullYear() + '-';
        TM = (toDay.getMonth() + 1 < 10 ? '0' + (toDay.getMonth() + 1) : toDay.getMonth() + 1) + '-';
        TD = toDay.getDate() < 10 ? '0' + toDay.getDate() : toDay.getDate();
        TDS = (toDay.getDate() + 1) < 10 ? '0' + (toDay.getDate() + 1) : (toDay.getDate() + 1);
        $scope.TDay = TY + TM + TD;
        $scope.TSDay = TY + TM + TDS;
        if ($scope.dateTimes[$scope.dateFilter.date_index].date == $scope.TDay) {
            //$scope.filter.publishingTimeS = $scope.dateTimes[$scope.dateFilter.date_index].date;
            var orDate = new Date(0)
            OY = orDate.getFullYear() + '-';
            OM = (orDate.getMonth() + 1 < 10 ? '0' + (orDate.getMonth() + 1) : orDate.getMonth() + 1) + '-';
            OD = orDate.getDate() < 10 ? '0' + orDate.getDate() : orDate.getDate();
            $scope.ODay = OY + OM + OD;
            $scope.filter.publishingTimeB = $scope.TSDay; //$scope.dateTimes[$scope.dateFilter.date_index].date;
            $scope.filter.publishingTimeS = $scope.ODay;
        } else {
            $scope.filter.publishingTimeS = $scope.dateTimes[$scope.dateFilter.date_index].date;
            var Hdate = new Date($scope.filter.publishingTimeS.replace(/-/g, "/"));
            var date2 = new Date(new Date().setDate(Hdate.getDate() + 1));
            var date_str = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate();
            $scope.filter.publishingTimeB = date_str;
        }

        $scope.loadMore();
    };
    $scope.isGeoLocation = false;
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

    if (!$rootScope.billOfferSearchModel || !$rootScope.billOfferSearchModel.city_name) {
        $scope.locationModel = {
            city_id: '',
            city_name: "未知"
        };
        $scope.geoLocation();
    }
    else {
        $scope.locationModel = {
            city_name: $rootScope.billOfferSearchModel.city_name
        };
    }
    $scope.changeBillOfferId = function (billOfferId) {
        $rootScope.boId = true;
        $rootScope.billOfferbillOfferId = billOfferId;
    };
    /*
    searchBillOffer: function (params, search, publishingTimeS, publishingTimeB, billStyleId, enterpriseName, tradeLocationId)
    */
    $scope.show = [true, true, true];
    $scope.loadMore = function (first) {
        if ($rootScope.billOfferSearchModel) {
            if ($rootScope.billOfferSearchModel.city_id) {
                if ($rootScope.billOfferSearchModel.province_id == 1 || $rootScope.billOfferSearchModel.province_id == 20 || $rootScope.billOfferSearchModel.province_id == 860 || $rootScope.billOfferSearchModel.province_id == 2462) {
                    $scope.filter.tradeLocationId = $rootScope.billOfferSearchModel.province_id;
                }
                else {
                    $scope.filter.tradeLocationId = $rootScope.billOfferSearchModel.city_id;
                }
                $scope.locationModel.city_name = $rootScope.billOfferSearchModel.city_name;
            }

        }
        if ($scope.tab == 1) {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[0], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[0], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData202 = first ? data : $scope.listData202.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData202).length; i++) {
                    toolService.setStars2($scope.listData202[i]);
                };
            });
        }
        else if ($scope.tab == 2) {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[1], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[1], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData203 = first ? data : $scope.listData203.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData203).length; i++) {
                    toolService.setStars2($scope.listData203[i]);
                };
            });
        }
        else if ($scope.tab == 3) {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[2], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[2], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData204 = first ? data : $scope.listData204.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData204).length; i++) {
                    toolService.setStars2($scope.listData204[i]);
                };
            });
        }
        else {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[3], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[3], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData205 = first ? data : $scope.listData205.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData205).length; i++) {
                    toolService.setStars2($scope.listData205[i]);
                };
            });
        }
        $scope.params.next();
    };
    $scope.rateClick = function (func) {
        $scope.filter.sort = func;
        switch (func) {
            case 0:
                $scope.filter.rate01 = !$scope.filter.rate01;
                break;
            case 1:
                $scope.filter.rate02 = !$scope.filter.rate02;
                break;
            case 2:
                $scope.filter.rate03 = !$scope.filter.rate03;
                break;
            case 3:
                $scope.filter.rate04 = !$scope.filter.rate04;
                break;
            case 4:
                $scope.filter.rate05 = !$scope.filter.rate05;
                break;
            case 5:
                $scope.filter.rate06 = !$scope.filter.rate06;
                break;
        }
        $scope.doRefresh();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
});