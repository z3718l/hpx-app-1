ionicApp.controller('onZhiDetailController', function ($scope, $rootScope, $state, $filter, WEB_URL, $ionicPopup, billService, enterprisesService, toolService, customerService) {
    $scope.appraisalModel = {};

    //$scope.changeBillStyleId = function (bill_style_id) {
    //    if (bill_style_id == $scope.model.bill_style_id)
    //        return;
    //    $scope.params = $scope.Params.Create('-offer_time', 1);
    //    $scope.filter = {
    //        search: '',
    //        publishingTimeS: '',
    //        publishingTimeB: '',
    //        tradeLocationId: '',
    //    };
    //    //billService.searchBillOffer($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[0], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {

    //    billService.searchBillOffer($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, bill_style_id, $scope.model.enterprise_name, $scope.filter.tradeLocationId).then(function (data) {
    //        if (!data[0]) {
    //            $ionicPopup.alert({
    //                title: "通知",
    //                template: "没有该类报价信息！",
    //                okType: "button-assertive",
    //            });
    //        }
    //        else {
    //            $scope.model = data[0];
    //            $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
    //        }
    //    })
    //}
    //$scope.follow = function (follow) {
    //    $scope.followModel = {
    //        collection_enterprise_id: $scope.model.enterprise_id,
    //        is_collection_enterprise: follow
    //    }
    //    customerService.followEnterprise($scope.followModel).then(function () {
    //        $scope.model.is_collection_enterprise = follow;
    //    })
    //}

    //if ($rootScope.boId) {
    //    billService.getBillOffer($rootScope.billOfferbillOfferId).then(function (data) {
    //        $scope.model = data;
    //        toolService.getStars($scope.model.enterprise_id).then(function (data) {
    //            $scope.star = data;
    //        });
    //        $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
    //    });
    //}
    //else {
    //    $scope.model = {}
    //    $scope.model.enterprise_id = $rootScope.eId
    //    $scope.model.enterprise_name = $rootScope.eN
    //    //toolService.getStars($scope.model.enterprise_id).then(function (data) {
    //    //    $scope.star = data;
    //    //});
    //    $scope.changeBillStyleId('202')
    //}
    $scope.getorderAppraisal = function () {
        //enterprisesService.getorderAppraisal('101', $scope.model.id).then(function (data) {
        //    $scope.appraisalModel = data;
        //});
    }

    // 调整
    $scope.edit = function (data) {
        //跳转到报价详细信息
        $state.go('app.newBillOffer');
    }
    //删除报价
    $scope.remove = function (data) {
        var confirmPopup = $ionicPopup.confirm({
            title: '注意',
            template: '确定要删除该报价吗?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                billService.deleteBillOffer(data.id).then(function (data) {
                    $scope.doRefresh();
                });
            }
        });


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