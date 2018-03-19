ionicApp.controller('onXiaoController', function ($scope, $rootScope, $state, $stateParams, $ionicPopup, $timeout, addressService, customerService, billService, constantsService) {
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
        'bill_style_id': 204,
        'deadline_type_code': 1701,
        'trade_type_id': 1801,
        'trade_background_code': 1601,
        'max_price_type': 0,
    };

    $scope.model = {
        'contact_name': $rootScope.identity.customer_name,
        'contact_phone': $rootScope.identity.phone_number,
        'offer_detail': {},
        'bill_style_id': 204,
        'deadline_type_code': 1701,
        'trade_type_id': 1801,
        'trade_background_code': 1601,
        'max_price_type': 0,
    };



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


    //$scope.choiceTIs360 = function () {
    //    $scope.filter.is360 = true;
    //}
    //$scope.choiceFIs360 = function () {
    //    $scope.filter.is360 = false;
    //}

    //$scope.choiceTIs180 = function () {
    //    $scope.filter.is180 = true;
    //}
    //$scope.choiceFIs180 = function () {
    //    $scope.filter.is180 = false;
    //}

    //$scope.choice1BillPrice = function () {
    //    $scope.filter.billPrice = 1;
    //}

    //$scope.choice2BillPrice = function () {
    //    $scope.filter.billPrice = 2;
    //}

    //$scope.choice3BillPrice = function () {
    //    $scope.filter.billPrice = 3;
    //}


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
        $scope.model.offer_detail = JSON.stringify($scope.model.offer_detail);
        //$scope.model.offer_detail = $scope.model.offer_detail.split(',');
        //for (var i = 0; i < $scope.model.offer_detail.length; i++) {
        //    $scope.model.offer_detail_value = $scope.model.offer_detail[i].split(':');
        //    $scope.model.offer_detail_value[1] = '"'+ parseFloat($scope.model.offer_detail_value[1]).toPrecision(4) + '"';
        //    $scope.model.offer_detail[i] = $scope.model.offer_detail_value.join(':');
        //}
        //$scope.model.offer_detail = $scope.model.offer_detail.join(',');
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
        $state.go('app.billOfferQuery');
    }

    $scope.share = function () {
        $(".g-alert-shares").fadeIn(300);
    };

    $scope.shareClose = function () {
        $(".g-alert-shares").fadeOut(300);
    };

    $scope.shareToWechatFriend = function () {
        try {
            Wechat.share({
                message: {
                    title: $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '承兑贴现报价信息，有意向请查看！',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString()
                    }
                },
                scene: Wechat.Scene.SESSION   // share to Timeline
            }, function () {
                alert("分享成功！");
            }, function (reason) {
                alert("Failed: " + reason);
            });
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToWechat = function () {
        try {
            Wechat.share({
                message: {
                    title: $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '承兑贴现报价信息，有意向请查看！',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString()
                    }
                },
                scene: Wechat.Scene.TIMELINE   // share to Timeline
            }, function () {
                alert("分享成功！");
            }, function (reason) {
                alert("Failed: " + reason);
            });
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToWeibo = function () {
        try {
            var args = {};
            args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '承兑贴现报价信息，有意向请查看！';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            WeiboSDK.shareToWeibo(function () {
                alert('分享成功！');
            }, function (failReason) {
                alert(failReason);
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToQQ = function () {
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '承兑贴现报价信息，有意向请查看！';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            QQSDK.shareNews(function () {
                alert('分享成功！');
            }, function (failReason) {
                alert(failReason);
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToQQZone = function () {
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '承兑贴现报价信息，有意向请查看！';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            QQSDK.shareNews(function () {
                alert('分享成功！');
            }, function (failReason) {
                alert(failReason);
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };
})