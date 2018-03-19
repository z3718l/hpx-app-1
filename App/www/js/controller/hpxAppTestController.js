ionicApp.controller('hpxAppTestController', function ($scope, $rootScope, $state, $ionicPopup, constantsService, payingService, appHomeService, getInvitationService, billService, enterprisesService, toolService, customerService) {
    $scope.getAppPhone = {
        'num': ""
    }
    getMan = function () {
        // 获取手机号
        appHomeService.getAppHome().then(function (data) {
            $scope.customerInfo = data;
            getInvitationService.getInvitationCode(data.phone_number).then(function (data) {
                console.log("获取邀请码成功")
                console.log(data)
                $scope.getAppPhone.num = data;
            })
        });

        $(".g-alert-shares").show();
    }
    getMan();

    $scope.shareClose = function () {
        $(".g-alert-shares").fadeOut(300);
    };
    // 微信好友
    $scope.shareToWechatFriend = function () {
        Wechat.share({
            text: "分享内容",
            scene: Wechat.Scene.TIMELINE
        }, function () {
            alert("Success");
        }, function (reason) {
            alert("Failed: " + reason);
        });
    };
    // 微信朋友圈
    $scope.shareToWechat = function () {
        Wechat.share({
            text: "分享内容",
            scene: Wechat.Scene.SESSION
        }, function () {
            alert("Success");
        }, function (reason) {
            alert("Failed: " + reason);
        });
    };
    // 微博
    $scope.shareToWeibo = function () {
        var args = {};
        args.url = 'https://www.huipiaoxian.com';
        args.title = '分享标题';
        args.description = '分享内容';
        args.image = 'https://cordova.apache.org/static/img/pluggy.png';
        WeiboSDK.shareToWeibo(function () {
            alert('share success');
        }, function (failReason) {
            alert(failReason);
        }, args);
    };

    $scope.shareToQQ = function () {
        var args = {};
        args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
        args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
        args.text = '分享内容';
        QQSDK.shareText(function () {
            alert('shareText success');
        }, function (failReason) {
            alert(failReason);
        }, args);
    };

    $scope.shareToQQZone = function () {
        var args = {};
        args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
        args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
        args.text = '分享内容';
        QQSDK.shareText(function () {
            alert('shareText success');
        }, function (failReason) {
            alert(failReason);
        }, args);
    };

})