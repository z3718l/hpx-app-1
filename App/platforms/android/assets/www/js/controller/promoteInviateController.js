ionicApp.controller('promoteInviateController', function ($scope, $rootScope, $state, $ionicPopup,WEB_URL, constantsService, payingService, appHomeService, getIntivationService, billService, enterprisesService, toolService, customerService) {
    $scope.getAppPhone = {
        'num': ""
    }
    getMan = function () {
        // 获取手机号
        appHomeService.getAppHome().then(function (data) {
            $scope.customerInfo = data;
            getIntivationService.getInvitationCode(data.phone_number).then(function (data) {
                $scope.getAppPhone.num = data;

                var hpxAa = data.split("")
                $scope.hpxgA = hpxAa;
                angular.forEach(hpxAa, function (ele,ind) {

                })

            })
        });
        $(".g-alert-shares").hide();
    }
    getMan();

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
   
    //$scope.share = function () {
    //    $(".g-alert-shares").fadeIn(300);
    //};

    //$scope.shareClose = function () {
    //    $(".g-alert-shares").fadeOut(300);
    //};
    // 微信好友
    $scope.shareToWechat = function () {
        try {
            Wechat.share({
                message: {
                    title: '注册使用汇票线，可获取双重惊喜特权',
                    description: '汇票线是票据在线交易一站式服务平台，让票据交易安全快捷！我的邀请码是：' + $scope.getAppPhone.num,
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: 'http://wechat.huipiaoxian.com/invitation/register.jsp?tel=' + $scope.customerInfo.phone_number
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
    // 微信朋友圈
    $scope.shareToWechatFriend = function () {
        try {
            Wechat.share({
                message: {
                    title: '注册使用汇票线，可获取双重惊喜特权',
                    description: '汇票线是票据在线交易一站式服务平台，让票据交易安全快捷！我的邀请码是：' + $scope.getAppPhone.num,
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: 'http://wechat.huipiaoxian.com/invitation/register.jsp?tel=' + $scope.customerInfo.phone_number
                    }
                },
                scene: Wechat.Scene.SESSION   // share to Timeline
            }, function () {
                //alert("分享成功！");
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (reason) {
                console.log("Failed: " + reason);
            });
        }
        catch (e) {
            console.log(e.message);
        }
    };
    // 微博
    $scope.shareToWeibo = function () {
        try {
            var args = {};
            args.url = 'http://wechat.huipiaoxian.com/invitation/register.jsp?tel=' + $scope.customerInfo.phone_number;
            args.title = '注册使用汇票线，可获取双重惊喜特权';
            args.description = '汇票线是票据在线交易一站式服务平台，让票据交易安全快捷！我的邀请码是：' + $scope.getAppPhone.num;
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
            args.url = 'http://wechat.huipiaoxian.com/invitation/register.jsp?tel=' + $scope.customerInfo.phone_number;
            args.title = '注册使用汇票线，可获取双重惊喜特权';
            args.description = '汇票线是票据在线交易一站式服务平台，让票据交易安全快捷！我的邀请码是：' + $scope.getAppPhone.num;
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
            args.url = 'http://wechat.huipiaoxian.com/invitation/register.jsp?tel=' + $scope.customerInfo.phone_number;
            args.title = '注册使用汇票线，可获取双重惊喜特权';
            args.description = '汇票线是票据在线交易一站式服务平台，让票据交易安全快捷！我的邀请码是：' + $scope.getAppPhone.num;
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


    //$scope.shareToQQZone = function () {
    //    try {
    //        var args = {};
    //        args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
    //        args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
    //        args.url = 'http://wechat.huipiaoxian.com/invitation/register.jsp?tel=' + $scope.customerInfo.phone_number;
    //        args.title = '注册使用汇票线，可获取双重惊喜特权';
    //        args.description = '汇票线是票据在线交易一站式服务平台，让票据交易安全快捷！我的邀请码是：' + $scope.getAppPhone.num;
    //        args.image = 'https://www.huipiaoxian.com/thumbnail.png';
    //        QQSDK.shareNews(function () {
    //            //alert('分享成功！');
    //            $ionicPopup.alert({
    //                title: "提示",
    //                template: "分享成功！",
    //                okText: '确    定',
    //                cssClass: 'hpxModal'
    //            });
    //        }, function (failReason) {
    //            console.log(failReason);
    //        }, args);
    //    }
    //    catch (e) {
    //        console.log(e.message);
    //    }
    //};

    //$scope.shareToQQZone = function () {
    //    try {
    //        var args = {};
    //        args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
    //        args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
    //        args.url = 'http://wechat.huipiaoxian.com/invitation/register.jsp?tel=' + $scope.customerInfo.phone_number;
    //        args.title = '注册使用汇票线，可获取双重惊喜特权';
    //        args.description = '汇票线是票据在线交易一站式服务平台，让票据交易安全快捷！我的邀请码是：' + $scope.getAppPhone.num;
    //        //args.image = 'https://www.huipiaoxian.com/thumbnail.png';
    //        QQSDK.shareNews(function () {
    //            $ionicPopup.alert({
    //                title: "提示",
    //                template: "分享成功！",
    //                okText: '确    定',
    //                cssClass: 'hpxModal'
    //            });
    //        }, function (failReason) {
    //            //$ionicPopup.alert({
    //            //    title: "提示",
    //            //    template: failReason,
    //            //    okType: "button-assertive",
    //            //});
    //        }, args);
    //    }
    //    catch (e) {
    //        console.log(e.message);
    //    }
    //};

})