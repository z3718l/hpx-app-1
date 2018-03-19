ionicApp.controller('onDaLsController', function ($scope, $rootScope, $state, $filter, WEB_URL, $ionicPopup, billService, enterprisesService, toolService, customerService) {
    $scope.appraisalModel = {};
    $scope.cc = {
        isType1: true,
        isType2: true,
        isType3: true
    };

    $scope.changeBillStyleId = function (bill_style_id) {
        var timestamp = Date.parse(new Date());
        $scope.hpxTime = timestamp;
        $scope.params = $scope.Params.Create('-offer_time', 1);
        var now = new Date();
        Y = now.getFullYear() + '-';
        M = now.getMonth() + 1 + '-';
        D = now.getDate();
        $scope.finS = Y + M + D;
        $scope.filter = {
            search: '',
            publishingTimeS: $scope.finS,
            publishingTimeB: $scope.finS,
            tradeLocationId: '',
        };
        
        billService.searchBillOffer0($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, bill_style_id, $scope.model.enterprise_name, $scope.filter.tradeLocationId).then(function (data0) {
            console.log(data0)
            $scope.model = {
                bill_style_id: bill_style_id,
                bill_style_name: '',
                enterprise_name: $rootScope.eN || $scope.model.enterprise_name,
                enterprise_id: $rootScope.eId || $scope.model.enterprise_id
            }
            $scope.findF202 = data0.bill_offers;
            if (data0.is_collection_enterprise != null) {
                $scope.findF00 = data0;
            } else if (data0.is_collection_enterprise == null) {
                $scope.findF00 = data0.bill_offers
            }
            
            if (data0.bill_offers[0] == null) {               
                if ($scope.model.bill_style_id == 202) {
                    $scope.model.bill_style_name = '银电大票'
                } else if ($scope.model.bill_style_id == 203) {
                    $scope.model.bill_style_name = '银纸小票'
                } else if ($scope.model.bill_style_id == 204) {
                    $scope.model.bill_style_name = '银电小票'
                } else if ($scope.model.bill_style_id == 205) {
                    $scope.model.bill_style_name = '商票'
                }
            }
            else {
                $scope.model = data0.bill_offers[0];
                $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
            }
        });
    }

    $scope.follow = function (follow) {
            // 判断是否登录
            if (!$rootScope.identity) {
                //alert("123")
                $ionicPopup.alert({
                    title: '提示',
                    template: '账户未登录！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                $state.go("app.signin");
            }
            else {
                $scope.followModel = {
                    collection_enterprise_id: $scope.model.enterprise_id,
                    is_collection_enterprise: follow
                }
                console.log($scope.followModel)
                customerService.followEnterprise($scope.followModel).then(function () {
                    $scope.findF00.is_collection_enterprise = follow;
                })
            }    
    }

    if ($rootScope.boId) {
        billService.getBillOffer($rootScope.billOfferbillOfferId).then(function (data) {
            $scope.model = data;
            $scope.hpxTime = data.offer_time
            $scope.findF00 = data;
            toolService.getStars($scope.model.enterprise_id).then(function (data) {
                $scope.star = data;
            });
            $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
        });
    }
    else {
        // 默认执行事件
        hpxBill = function () {
            $scope.params = $scope.Params.Create('-offer_time', 1);
            var timestamp = Date.parse(new Date());
            $scope.hpxTime = timestamp;
            var now = new Date();
            Y = now.getFullYear() + '-';
            M = now.getMonth() + 1 + '-';
            D = now.getDate();
            $scope.finS = Y + M + D;
            $scope.filter = {
                search: '',
                publishingTimeS: $scope.finS,
                publishingTimeB: $scope.finS,
                tradeLocationId: '',
            };
            $scope.model = {}
            $scope.model.enterprise_id = $rootScope.eId || $rootScope.eId0
            $scope.model.enterprise_name = $rootScope.eN || $rootScope.eN
            var bill_style_id = 202;
            billService.searchBillOffer0($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, bill_style_id, $scope.model.enterprise_name, $scope.filter.tradeLocationId).then(function (data0) {
                $scope.findF202 = data0.bill_offers;
                if (!data0.bill_offers[0]) {
                    var bill_style_id = 203;
                    billService.searchBillOffer0($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, bill_style_id, $scope.model.enterprise_name, $scope.filter.tradeLocationId).then(function (data1) {
                        $scope.findF203 = data1.bill_offers;
                        if (!data1.bill_offers[0]) {
                            var bill_style_id = 204;
                            billService.searchBillOffer0($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, bill_style_id, $scope.model.enterprise_name, $scope.filter.tradeLocationId).then(function (data2) {
                                $scope.findF204 = data2.bill_offers;
                                if (!data2.bill_offers[0]) {
                                    var bill_style_id = 205;
                                    billService.searchBillOffer0($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, bill_style_id, $scope.model.enterprise_name, $scope.filter.tradeLocationId).then(function (data3) {
                                        $scope.findF205 = data3.bill_offers;
                                        if (!data3.bill_offers[0]) {
                                            
                                        } else {
                                            $scope.changeBillStyleId(205);
                                            $scope.model = data3.bill_offers[0];
                                            $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
                                        }
                                    })
                                } else {
                                    $scope.changeBillStyleId(204);
                                    $scope.model = data2.bill_offers[0];
                                    $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
                                }
                            })
                        } else {
                            $scope.changeBillStyleId(203);
                            $scope.model = data1.bill_offers[0];
                            $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
                        }
                    })
                } else {
                    $scope.changeBillStyleId(202);
                    $scope.model = data0.bill_offers[0];
                    $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
                }
            });
        }
        hpxBill();
        $scope.model = {}
        $scope.model.enterprise_id = $rootScope.eId
        $scope.model.enterprise_name = $rootScope.eN
        $scope.changeBillStyleId('202');
    }

    $scope.getorderAppraisal = function () {
        //enterprisesService.getorderAppraisal('101', $scope.model.id).then(function (data) {
        //    $scope.appraisalModel = data;
        //});
    }
    $scope.share = function () {
        var myPopup = $ionicPopup.show({
            cssClass: 'hpxShare',
            template: '<div class="g-alert-shares">' +
                      '<div class="box">' +
                      '<ul class="con">' +
                      '<li><a href="javascript:;" ng-click="shareToWechatFriend()"><img src="images/share1.png" alt=""/>微信好友</a></li>' +
                      '<li><a href="javascript:;" ng-click="shareToWechat()"><img src="images/share2.png" alt=""/>微信朋友圈</a></li>' +
                      //'<li><a href="javascript:;" ng-click="shareToWeibo()"><img src="images/share3.png" alt=""/>新浪微博</a></li>' +
                      '<li><a href="javascript:;" ng-click="shareToQQ()"><img src="images/share4.png" alt=""/>QQ好友</a></li>' +
                      '<li><a href="javascript:;" ng-click="shareToQQZone()"><img src="images/share5.png" alt=""/>QQ空间</a></li>' +
                      '</ul>' +
                      '</div>' +
                      '</div>',
            scope: $scope,
            buttons: [
                  {
                      text: '取消',
                  },
            ]
        })
    }
    $scope.shareToWechatFriend = function () {
        try {
            Wechat.share({
                message: {
                    title: $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '，' + $scope.model.bill_style_name + '报价',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString()
                    }
                },
                scene: Wechat.Scene.SESSION   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (reason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: reason,
                //    okType: "button-assertive",
                //});
            });
        }
        catch (e) {
            console.log(e.message);
        }
    };

    $scope.shareToWechat = function () {
        try {
            Wechat.share({
                message: {
                    title: $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '，' + $scope.model.bill_style_name + '报价',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString()
                    }
                },
                scene: Wechat.Scene.TIMELINE   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (reason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: reason,
                //    okType: "button-assertive",
                //});
            });
        }
        catch (e) {
            console.log(e.message);
        }
    };

    $scope.shareToWeibo = function () {
        try {
            var args = {};
            args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '，' + $scope.model.bill_style_name + '报价';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            WeiboSDK.shareToWeibo(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: failReason,
                //    okType: "button-assertive",
                //});
            }, args);
        }
        catch (e) {
            console.log(e.message);
        }
    };

    $scope.shareToQQ = function () {
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '，' + $scope.model.bill_style_name + '报价';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            QQSDK.shareNews(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: failReason,
                //    okType: "button-assertive",
                //});
            }, args);
        }
        catch (e) {
            console.log(e.message);
        }
    };

    $scope.shareToQQZone = function () {
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '，' + $scope.model.bill_style_name + '报价';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            QQSDK.shareNews(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: failReason,
                //    okType: "button-assertive",
                //});
            }, args);
        }
        catch (e) {
            console.log(e.message);
        }

    };
})