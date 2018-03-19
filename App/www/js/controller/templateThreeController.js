ionicApp.controller('templateThreeController', function ($scope, $rootScope, $state, $stateParams, $ionicPopup, $compile) {
    var ban = {
        'template_id': 1,
        'bannId':5
    }
    $scope.acTemplate = {
        'title': '汇票线活动',
        'data': [
            {
                'id': 1,
                'type': 1,
                'img': 0,
                'style': 0,
                'content':0
            },
            {

            }
        ]
        //'img_usr': {
        //    'img1': '',
        //    'img2': '',
        //    'img3': ''
        //},
        //'html': {
        //    'html1': '<img src="images/activity1.png"><img ng-click="canyu()" src="images/activity2.png"><img src="images/activity3.png">',
        //    'html2': '<img style="float:left;width:55%;" ng-click="includeAct(ban)" src="images/activity4.png" alt="" /><img style="float:right;width:45%;" ng-click="includeAct(ban)" src="images/activity5.png" alt="" />',
        //    'html3': '<button ng-click="btn(1)">html</button>'
        //},
        //'style': {
        //    'style1': 'line-height:0;',
        //    'style2': 'height:100%;background-color:#fedd52;'
        //},
        //'text': {
        //    'text1': '上海汇票线'
        //}
    }
    $scope.htmlTop = $scope.acTemplate.html.html1;
    $scope.htmlFoot = $scope.acTemplate.html.html2;
    $scope.style = $scope.acTemplate.style.style1;
    $scope.style1 = $scope.acTemplate.style.style2;
    angular.element(".act_bind").append($compile($scope.htmlFoot)($scope));
    $scope.includeAct = function (args) {
        $rootScope.bannId = args.bannId;
        if (arge.template_id == 1) {
            $state.go('app.templateOne');
        } else if (arge.template_id == 2) {
            $state.go('app.templateTwo');
        } else if (args.template_id == 3) {
            $state.go('app.templateThree');
        } else if (args.template_id == 4) {
            $state.go('app.templateFour');
        }
        //$state.go("app.activity");
    }
    $scope.canyu = function () {
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
            $state.go('app.draw');
        }
    }


    // 分享
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

    // 微信好友
    $scope.shareToWechat = function () {
        try {
            Wechat.share({
                message: {
                    title: '用汇票线交易首单电票，最高可奖300元',
                    description: '汇票线是免收平台服务费，免费对接，不赚差价的票据在线交易一站式服务平台。',
                    thumb: "http://wechat.huipiaoxian.com/activity/img/sharelogo.jpg",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: 'http://wechat.huipiaoxian.com/activity/activity.html',
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
                    title: '用汇票线交易首单电票，最高可奖300元',
                    description: '汇票线是免收平台服务费，免费对接，不赚差价的票据在线交易一站式服务平台。',
                    thumb: "http://wechat.huipiaoxian.com/activity/img/sharelogo.jpg",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: 'http://wechat.huipiaoxian.com/activity/activity.html',
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
            args.url = 'http://wechat.huipiaoxian.com/activity/activity.html';
            args.title = '用汇票线交易首单电票，最高可奖300元';
            args.description = '汇票线是免收平台服务费，免费对接，不赚差价的票据在线交易一站式服务平台。';
            args.image = 'http://wechat.huipiaoxian.com/activity/img/sharelogo.jpg';
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
            args.url = 'http://wechat.huipiaoxian.com/activity/activity.html';
            args.title = '用汇票线交易首单电票，最高可奖300元';
            args.description = '汇票线是免收平台服务费，免费对接，不赚差价的票据在线交易一站式服务平台。';
            args.image = 'http://wechat.huipiaoxian.com/activity/img/sharelogo.jpg';
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
            args.url = 'http://wechat.huipiaoxian.com/activity/activity.html';
            args.title = '用汇票线交易首单电票，最高可奖300元';
            args.description = '汇票线是免收平台服务费，免费对接，不赚差价的票据在线交易一站式服务平台。';
            args.image = 'http://wechat.huipiaoxian.com/activity/img/sharelogo.jpg';
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