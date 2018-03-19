ionicApp.controller('newBillOfferController', function ($scope, $rootScope, $state, $stateParams, $ionicPopup, $timeout, $ionicHistory, addressService, customerService, billService, constantsService) {
    $scope.filter = {
        //is360: true,
        //is180: true,
        //billPrice:'1',
        isType1: true,
        isType2: false,
        isType3: false
    };

    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
        //企业未通过审核
    } else if ($rootScope.identity.is_verified < 3 && $rootScope.identity.is_verified != 1) {
        $ionicPopup.alert({
            title: '提示',
            template: '您未进行企业认证，暂时不能进行机构报价！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        //$timeout(function () {
        //    $state.go("app.user");
        //}, 1000);
        $state.go("app.user");
        return
    }


    //设置默认的内容
    var emptyEntity = {
        'contact_name': $rootScope.identity.customer_name,
        'contact_phone': $rootScope.identity.phone_number,
        'offer_detail': {},
        'bill_style_id': $rootScope.hpxA || 202,
        'deadline_type_code': 1701,
        'trade_type_id': 1801,
        'trade_background_code': 1601,
        'max_price_type': 0,
    };

    $scope.model = {
        'contact_name': $rootScope.identity.customer_name,
        'contact_phone': $rootScope.identity.phone_number,
        'offer_detail': {},
        'bill_style_id': $rootScope.hpxA || 202,
        'deadline_type_code': 1701,
        'trade_type_id': 1801,
        'trade_background_code': 1601,
        'max_price_type': 0,
    };


    // 报价id为0时才能点击
    if (!$stateParams.id) {
        $scope.choice202BillStye = function () {
            $scope.model.bill_style_id = 202;
        }

        $scope.choice203BillStye = function () {
            $scope.model.bill_style_id = 203;
            $scope.filter.isType1 = true;
            $scope.filter.isType2 = false;
            $scope.filter.isType3 = false;
        }

        $scope.choice204BillStye = function () {
            $scope.model.bill_style_id = 204;
            $scope.filter.isType1 = true;
            $scope.filter.isType2 = false;
            $scope.filter.isType3 = false;
        }

        $scope.choice205BillStye = function () {
            $scope.model.bill_style_id = 205;
        }
    }

    $scope.choice1701DeadlineType = function () {
        $scope.model.deadline_type_code = 1701;
    }

    $scope.choice1702DeadlineType = function () {
        $scope.model.deadline_type_code = 1702;
    }

    $scope.choice1703DeadlineType = function () {
        $scope.model.deadline_type_code = 1703;
    }

    $scope.choice1801TradeType = function () {
        $scope.model.trade_type_id = 1801;
    }
    $scope.choice1802TradeType = function () {
        $scope.model.trade_type_id = 1802;
    }
    $scope.choice1803TradeType = function () {
        $scope.model.trade_type_id = 1803;
    }
    $scope.choice1804TradeType = function () {
        $scope.model.trade_type_id = 1804;
    }

    $scope.choice1601TradeBackground = function () {
        $scope.model.trade_background_code = 1601;
    }
    $scope.choice1602TradeBackground = function () {
        $scope.model.trade_background_code = 1602;
    }
    $scope.choice1603TradeBackground = function () {
        $scope.model.trade_background_code = 1603;
    }

    $scope.choice0MaxPriceType = function () {
        $scope.model.max_price_type = 0;
    }
    $scope.choice1MaxPriceType = function () {
        $scope.model.max_price_type = 1;
    }
    //获取客户信息中的省市地址信息
    init = function () {
        customerService.getCustomer().then(function (AddData) {
            if (AddData.trade_location_province_id && AddData.trade_location_city_id) {
                $scope.model.trade_province_id = AddData.trade_location_province_id;
                if ($scope.model.trade_province_id == 1 || $scope.model.trade_province_id == 20 || $scope.model.trade_province_id == 860 || $scope.model.trade_province_id == 2462) {
                    $scope.filter.tradeProvinceId = $scope.model.trade_province_id + 1;
                    return addressService.queryCity($scope.filter.tradeProvinceId).then(function (data) {
                        $scope.CityData = data;
                        $scope.model.trade_location_id = AddData.trade_location_id;
                    });
                } else {
                    return addressService.queryCity($scope.model.trade_province_id).then(function (data) {
                        $scope.CityData = data;
                        $scope.model.trade_location_id = AddData.trade_location_city_id;
                    });
                }
            }
        });
    };

    //如果id不为0，获取指定报价信息
    if ($stateParams.id) {
        billService.getBillOffer($stateParams.id).then(function (data) {
            console.log(data)
            $scope.model = data;
            $scope.provinceChange();
            if ($scope.model.max_price > 0) {
                $scope.model.max_price_type = 1;
            }
            try {
                $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
            }
            catch (e) {

            }
        });
    }
    else {
        console.log($rootScope.hpxA)
        $rootScope.hpxA = $scope.model.bill_style_id;
        $scope.model = emptyEntity;
        init();
    }


    //获取所有省级地址
    addressService.queryAll().then(function (data) {
        $scope.ProvinceData = data;
    });
    //获取所有市级地址
    $scope.provinceChange = function () {
        if ($scope.model.trade_province_id == null) {
            return;
        } else if ($scope.model.trade_province_id == 1 || $scope.model.trade_province_id == 20 || $scope.model.trade_province_id == 860 || $scope.model.trade_province_id == 2462) {
            $scope.filter.tradeProvinceId = $scope.model.trade_province_id + 1;
            return addressService.queryCity($scope.filter.tradeProvinceId).then(function (data) {
                $scope.CityData = data;
            });
        } else {
            return addressService.queryCity($scope.model.trade_province_id).then(function (data) {
                $scope.CityData = data;
            });
        }
    };

    $scope.save = function () {
        if ($scope.model.offer_detail.offer_rate01 == null && $scope.model.offer_detail.offer_rate11 == null && $scope.model.offer_detail.offer_rate21 == null && $scope.model.offer_detail.offer_rate02 == null && $scope.model.offer_detail.offer_rate12 == null && $scope.model.offer_detail.offer_rate22 == null && $scope.model.offer_detail.offer_rate03 == null && $scope.model.offer_detail.offer_rate13 == null && $scope.model.offer_detail.offer_rate23 == null && $scope.model.offer_detail.offer_rate04 == null && $scope.model.offer_detail.offer_rate14 == null && $scope.model.offer_detail.offer_rate24 == null && $scope.model.offer_detail.offer_rate05 == null && $scope.model.offer_detail.offer_rate15 == null && $scope.model.offer_detail.offer_rate25 == null && $scope.model.offer_detail.offer_rate06 == null && $scope.model.offer_detail.offer_rate16 == null && $scope.model.offer_detail.offer_rate26 == null && $scope.model.offer_detail.offer_rate07 == null && $scope.model.offer_detail.offer_rate17 == null && $scope.model.offer_detail.offer_rate27 == null && $scope.model.offer_detail.offer_rate31 == null && $scope.model.offer_detail.offer_rate41 == null && $scope.model.offer_detail.offer_rate51 == null && $scope.model.offer_detail.offer_rate32 == null && $scope.model.offer_detail.offer_rate42 == null && $scope.model.offer_detail.offer_rate53 == null && $scope.model.offer_detail.offer_rate33 == null && $scope.model.offer_detail.offer_rate43 == null && $scope.model.offer_detail.offer_rate53 == null && $scope.model.offer_detail.offer_rate34 == null && $scope.model.offer_detail.offer_rate44 == null && $scope.model.offer_detail.offer_rate54 == null && $scope.model.offer_detail.offer_rate35 == null && $scope.model.offer_detail.offer_rate45 == null && $scope.model.offer_detail.offer_rate55 == null && $scope.model.offer_detail.offer_rate36 == null && $scope.model.offer_detail.offer_rate46 == null && $scope.model.offer_detail.offer_rate56 == null && $scope.model.offer_detail.offer_rate37 == null && $scope.model.offer_detail.offer_rate47 == null && $scope.model.offer_detail.offer_rate57 == null && $scope.model.offer_detail.offer_rate61 == null && $scope.model.offer_detail.offer_rate71 == null && $scope.model.offer_detail.offer_rate81 == null && $scope.model.offer_detail.offer_rate62 == null && $scope.model.offer_detail.offer_rate72 == null && $scope.model.offer_detail.offer_rate82 == null && $scope.model.offer_detail.offer_rate63 == null && $scope.model.offer_detail.offer_rate73 == null && $scope.model.offer_detail.offer_rate83 == null && $scope.model.offer_detail.offer_rate64 == null && $scope.model.offer_detail.offer_rate74 == null && $scope.model.offer_detail.offer_rate84 == null && $scope.model.offer_detail.offer_rate65 == null && $scope.model.offer_detail.offer_rate75 == null && $scope.model.offer_detail.offer_rate85 == null && $scope.model.offer_detail.offer_rate66 == null && $scope.model.offer_detail.offer_rate76 == null && $scope.model.offer_detail.offer_rate86 == null && $scope.model.offer_detail.offer_rate67 == null && $scope.model.offer_detail.offer_rate77 == null && $scope.model.offer_detail.offer_rate87 == null) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入报价！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if ($scope.model.bill_style_id == 203 || $scope.model.bill_style_id == 205) {
            if (!$scope.model.trade_location_id) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请选择交易地点！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }
        }
        for (x in $scope.model.offer_detail) {
            console.log($scope.model.offer_detail[x])
            if ($scope.model.offer_detail[x] == null) {
                delete ($scope.model.offer_detail[x]);
            }
            
        }

        $scope.model.offer_detail = JSON.stringify($scope.model.offer_detail);
        $scope.model.offer_detail = $scope.model.offer_detail.split(',');
        for (var i = 0; i < $scope.model.offer_detail.length; i++) {
            $scope.model.offer_detail_value = $scope.model.offer_detail[i].split(':');
            $scope.model.offer_detail_value[1] = '"' + parseFloat($scope.model.offer_detail_value[1]).toPrecision(4) + '"';
            $scope.model.offer_detail[i] = $scope.model.offer_detail_value.join(':');
        }
        $scope.model.offer_detail = $scope.model.offer_detail.join(',');
        $scope.model.offer_detail += '}';
        console.log($scope.model.offer_detail);
        //return;
        if ($scope.model.offer_detail == "{}" || $scope.model.offer_detail == null) {
            //alert("23123123")
            var myPopup = $ionicPopup.show({
                cssClass: 'hpxModal',
                title: '提示',
                template: '请输入报价信息！',
                scope: $scope,
                buttons: [
                  {
                      text: '确定',
                      onTap: function (e) {
                          window.location.reload();
                      }
                  },
                ]
            });
            return;
        }

        if ($scope.model.id == null) {
            //新增报价
            billService.insertBillOffer($scope.model).then(function (data) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '新增报价成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });

                $state.go('app.billOfferQuery');
            });
        }
        else {
            //修改报价
            billService.updateBillOffer($scope.model).then(function (data) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '修改报价成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                $state.go('app.billOfferQuery');
            });
        }

    };

    $scope.close = function () {
        $ionicHistory.goBack();
    }
})