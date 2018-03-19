/// <reference path="controller/accountBind.js" />
/// <reference path="controller/signupController.js" />
var ionicApp = angular.module('hpx', [
    'ionic',
    'ngCordova',
    'restangular',
    'LocalStorageModule',
    'ngSanitize'
]);
//ionicApp.filter('getEndorsementURL', function () { //可以注入依赖
//    alert("?")
//    return function (input) {
//        if (typeof input == "undefined") return "";
//        if (input.length > 0) {
//            var url = input.split(".");
//            url[url.length - 2] = url[url.length - 2] + "-1";
//            return url.join(".");
//        }
//        return "";
//    }
//}); 
ionicApp.filter("getEndorsementURL", function () {
    return function (input) {
        if (typeof input == "undefined") return "";
        if (input.length > 0) {
            var url = input.split(".");
            url[url.length - 2] = url[url.length - 2] + "-1";
            return url.join(".");
        }
        return "";
    }
});
ionicApp.run(function (JPUSH, $ionicPlatform, $rootScope, $ionicConfig, $timeout,$cordovaStatusbar, localStorageService) {
    $ionicPlatform.on("deviceready", function () {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        //延迟splash screnn 隐藏时间,不然会有短暂的白屏出现  
        setTimeout(function () {
            navigator.splashscreen.hide();
        }, 1000);

        //console.log(window.StatusBar)
        //if (window.StatusBar) {
        //    StatusBar.styleLightContent();;
        //}

        //if (cordova.platformId == 'android') {
        //    window.StatusBar.backgroundColorByHexString("#333");
        //} else {
        //    $cordovaStatusbar.overlaysWebView(false);
        //    $cordovaStatusbar.style(1);
        //    window.StatusBar.styleLightContent();
        //    $cordovaStatusbar.styleColor('black');
        //}

        //启动极光推送服务
        if (JPUSH) {
            window.plugins.jPushPlugin.init();
        }
    });

    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    });
})

ionicApp.run(function ($rootScope, $state, API_URL, $ionicLoading, $ionicPopup, $cordovaStatusbar, Restangular, localStorageService) {

    // 修改顶部的透明度
    //var StatusBar;
    //console.log($cordovaStatusbar)
    ////console.log(StatusBar)
    ////console.log(cordova.platformId)
    //if (cordova.platformId == 'android') {
    //    window.StatusBar.backgroundColorByHexString("#333");
    //} else {
    //    $cordovaStatusbar.overlaysWebView(false);
    //    $cordovaStatusbar.style(1);
    //    window.StatusBar.styleLightContent();
    //    $cordovaStatusbar.styleColor('black');
    //}

    $rootScope.$state = $state;

    Restangular.setBaseUrl(API_URL);


    //加入请求头
    $rootScope.identity = localStorageService.get('customer');
    var token = '';
    if ($rootScope.identity) {
        token = $rootScope.identity.token;
        Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + token });
    }

    Restangular.setRequestInterceptor(function (elem, operation, what) {
        $ionicLoading.show({
            template: '<p class="item-myicon"><ion-spinner icon="ios" class="spinner-light"></ion-spinner></p>',
            noBackdrop: true
        });
        return elem;
    });
    Restangular.setResponseInterceptor(function (data, operation, what, url, response, deferred) {
        $ionicLoading.hide();

        if (data.meta.code == 411) {
            deferred.reject(data);
            $rootScope.identity = null;
            localStorageService.set('customer', null);
            //$ionicPopup.alert({
            //    title: '提示',
            //    template: '您需要重新登录！',
            //    okText: '确    定',
            //    cssClass: 'hpxModal'
            //});
            $state.go('app.signin');
        }
        else if (data.meta.code >= 300) {
            deferred.reject(data);
            $ionicPopup.alert({
                title: '提示',
                template: data.meta.message,
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        }
        else {
            return data.data;
        }
    });
    Restangular.setErrorInterceptor(function (resp) {
        $ionicLoading.hide();
        if (resp.status == 401) {
            $state.go('app.home');
        }
        else if (resp.status == 0) {       
            //$ionicPopup.alert({
            //    title: '请检查网络连接！',
            //    okText: '确定',
            //    okType: 'button-assertive',
            //});
        }
        else {
            if (resp.data != null && resp.data.Message != null) {
                $ionicPopup.alert({
                    title: '提示',
                    template: resp.data.Message,
                    okText: '确    定',
                    //okType: 'button-assertive',
                });
            }
            else {
                $ionicPopup.alert({
                    title: '提示',
                    template: "未知错误 " + resp.status,
                    okText: '确    定',
                    //okType: 'button-assertive',
                });
            }
            return false;
        }
    });
});
//$urlRouterProvider.otherwise('app/home');
ionicApp.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $urlRouterProvider.otherwise('init');
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $stateProvider
    .state('init', {
        url: "/init",
        templateUrl: "views/init.html",
        controller: 'initController',
        cache: false
    })
    .state('tour', {
        url: "/tour",
        templateUrl: "views/tour.html",
        controller: 'tourController'
    })
    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "views/app/app.html",
        controller: 'appController'
    })
    .state('app.test', {
        url: '/test',
        templateUrl: 'views/app/test.html',
        controller: 'testController'
    })
    .state('app.home', {
        url: "/home",
        templateUrl: "views/app/home.html",
        controller: 'homeController'
    })
    .state('app.signup', {
        url: "/signup",
        templateUrl: "views/app/register.html",
        controller: 'signupController'
    })
    .state('app.signin', {
        url: "/signin",
        templateUrl:"views/app/login.html",
        controller:"signinController"
    })
    .state('app.signinEnterprise', {
        url: "/signinEnterprise",
        templateUrl: "views/app/loginEnterprise.html",
        controller: "signinEnterpriseController"
    })
    .state('app.forgetPassword', {
        url: "/forgetPassword",
        templateUrl: "views/app/forgetPassword.html",
        controller: "forgetPasswordController"
    })
    .state('app.billQuery', {
        url: "/billQuery",
        templateUrl: "views/app/billQuery.html",
        controller: 'billQueryController'
    })
    .state('app.user', {
        url: "/user",
        templateUrl: "views/app/user.html",
        controller: 'userController'
    })
    .state('app.setting', {
        url: "/setting",
        templateUrl: "views/app/setting.html",
        controller: 'setController'
    })
    .state('app.userInfo', {
        url: "/userInfo",
        templateUrl: "views/app/userInfo.html",
        controller: 'userInfoController'
    })
    .state('app.recharge', {
        url: "/recharge",
        templateUrl: "views/app/recharge.html",
        controller: 'rechargeController'
    })
    .state('app.myReleaseElecAll', {
        url: "/myReleaseElecAll",
        templateUrl: "views/app/myReleaseElecAll.html",
        controller: 'myReleaseElecAllController'
    })
    .state('app.myBidding', {
        url: "/myBidding",
        templateUrl: "views/app/myBidding.html",
        controller: 'myBiddingController'
    })
    .state('app.myTask', {
        url: "/myTask",
        templateUrl: "views/app/myTask.html",
        controller: 'myTaskController'
    })
    .state('app.accredit', {
        url: "/accredit",
        templateUrl: "views/app/accredit.html",
        controller: 'accreditController'//机构认证
    })
    .state('app.accountBind', {
        url: "/accountBind",
        templateUrl: "views/app/accountBind.html",
        controller: 'accountBindController'
    })
    .state('app.security', {
        url: "/security",
        templateUrl: "views/app/security.html",
        controller: 'securityController'
    })
    .state('app.message', {
        url: "/message",
        templateUrl: "views/app/message.html",
        controller: 'messageController'
    })
    .state('app.follow', {
        url: "/:follow?follBiEn",
        templateUrl: "views/app/follow.html",
        controller: 'followController'
    })
    .state('app.billOffer', {
        url: "/billOffer",
        templateUrl: "views/app/billOffer.html",
        controller: 'billOfferController'
    })
    .state('app.receiveBill', {
        url: "/receiveBill",
        templateUrl: "views/app/receiveBill.html",
        controller: 'receiveBillController'
    })
   .state('app.receiveBillResult', {
       url: "/receiveBillResult",
       templateUrl: "views/app/receiveBillResult.html",
       controller: 'receiveBillResultController'
   })
    .state('app.drawBill', {
        url: "/drawBill?id&bidId&accountId&perfect&contract_num",
        templateUrl: "views/app/drawBill.html",
        controller: 'drawBillController'
    })
    .state('app.newBillOffer', {
        url: "/:newBillOffer?id",
        templateUrl: "views/app/newBillOffer.html",
        controller: 'newBillOfferController'
    })
    .state('app.addAccount', {
        url: "/addAccount",
        templateUrl: "views/app/addAccount.html",
        controller: 'addAccountController'
    })
    .state('app.newAddAccount', {
        url: "/newAddAccount",
        templateUrl: "views/app/newAddAccount.html",
        controller: 'newAddAccountController'
    })
    .state('app.modifyPhone', {
        url: "/modifyPhone",
        templateUrl: "views/app/modifyPhone.html",
        controller: 'modifyPhoneController'
    })
    .state('app.modifyPass', {
        url: "/modifyPass",
        templateUrl: "views/app/modifyPass.html",
        controller: 'modifyPassController'
    })
    .state('app.smearBill', {
        url: "/smearBill",
        templateUrl: "views/app/smearBill.html",
        controller: 'smearBillController'
    })
    .state('app.businessQuery', {
        url: "/businessQuery",
        templateUrl: "views/app/businessQuery.html",
        controller: 'businessQueryController'
    })
     .state('app.jobQuery', {
         url: "/jobQuery",
         templateUrl: "views/app/jobQuery.html",
         controller: 'jobQueryController'
     })
     .state('app.calendar', {
         url: "/calendar",
         templateUrl: "views/app/calendar.html",
         controller: 'calendarController'
     })
     .state('app.bankQuery', {
         url: "/bankQuery",
         templateUrl: "views/app/bankQuery.html",
         controller: 'bankQueryController'
     })
     .state('app.calculator', {
         url: "/calculator",
         templateUrl: "views/app/calculator.html",
         controller: 'calculatorController'
     })
    .state('app.guide', {
        url: "/guide",
        templateUrl: "views/app/guide.html"
    })
    .state('app.agreement', {
        url: "/agreement",
        templateUrl: "views/app/agreement.html"
    })
    .state('app.about', {
        url: "/about",
        templateUrl: "views/app/about.html"
    })
    .state('app.photoTest', {
        url: "/photoTest",
        templateUrl: "views/app/photoTest.html",
        controller: 'photoTestController'
    })
    .state('app.rechargerecord', {
        url: "/rechargerecord",
        templateUrl: "views/app/rechargerecord.html",
        controller: 'rechargerecordController'
    })
    .state('app.billOfferDetail', {
        url: "/billOfferDetail",
        templateUrl: "views/app/billOfferDetail.html",
        controller: 'billOfferDetailController'
    })
    .state('app.billDetail', {
        url: "/billDetail",
        templateUrl: "views/app/billDetail.html",
        controller: 'billDetailController'
    })
    .state('app.myReleaseDetail', {
        url: "/:myReleaseDetail?myReleaseBillId&myReleaseOrderId&check",
        templateUrl: "views/app/myReleaseDetail.html",
        controller: 'myReleaseDetailController'
    })
    .state('app.transactionDetail', {
        url: "/transactionDetail",
        templateUrl: "views/app/transactionDetail.html",
        controller: 'transactionDetailController'
    })
    .state('app.rechargePay', {
        url: "/rechargePay",
        templateUrl: "views/app/rechargePay.html",
        controller: 'rechargePayController'
    })
    .state('app.billOfferQuery', {
        url: "/billOfferQuery",
        //cache: false,
        templateUrl: "views/app/billOfferQuery.html",
        controller: 'billOfferQueryController'
    })
    .state('app.billSearchCity', {
        url: "/billSearchCity",
        templateUrl: "views/app/billSearchCity.html",
        controller: 'billSearchCityController'
    })
    .state('app.billOfferSearchCity', {
        url:"/billOfferSearchCity",
        templateUrl:"views/app/billOfferSearchCity.html",
        controller:'billOfferSearchCityController'
    })
    //.state('app.evaluate', {
    //    url:"/evaluate",
    //    templateUrl: "views/app/evaluate.html",
    //    controller: 'evaluateCityController'
    //})
    .state('app.messageDetail', {
        url: '/:messageDetail?notificationId&check',
        templateUrl: 'views/app/messageDetail.html',
        controller: 'messageDetailController'
    })
    .state('app.authorizate', {
        url: '/authorizate',
        templateUrl: 'views/app/authorizate.html',
        controller: 'authorizateController'
    })
    .state('app.newAuthorizate', {
        url: '/newAuthorizate',
        templateUrl: 'views/app/newAuthorizate.html',
        controller: 'newAuthorizateController'
    })

    // 推广
    .state('app.promoteInvitaSuc', {
        url: '/promoteInvitaSuc',
        templateUrl: 'views/app/promoteInvitaSuc.html',
        controller: 'promoteInviateController'
    })
    .state('app.promoteEvent', {
        url: "/promoteEvent",
        templateUrl: "views/app/promoteEvent.html",
        controller: 'promoteEventController'
    })
    .state('app.hpxAppTest', {
        url: '/hpxAppTest',
        templateUrl: 'views/app/hpxAppTest.html',
        controller: 'hpxAppTestController '
    })

    .state('app.onLines', {
        url: '/onLines',
        templateUrl: 'views/app/onLines.html',
        controller: 'onLinesController'
    })

    .state('app.userAgent', {
        url: '/userAgent',
        templateUrl: 'views/app/userAgent.html',
        controller: 'userAgentController'
    })

    .state('app.onDaLs', {
        url: '/onDaLs',
        templateUrl: 'views/app/onDaLs.html',
        controller: 'onDaLsController'
    })
    .state('app.accountStatus', {
        url: '/accountStatus',
        templateUrl: 'views/app/accountStatus.html',
        controller: 'accountStatusController'
    })
    .state('app.onXiaos', {
        url: '/onXiaos',
        templateUrl: 'views/app/onXiaos.html',
        controller: 'onXiaosController'
    })
    .state('app.newRegister', {
        url: '/newRegister',
        templateUrl: 'views/app/newRegister.html',
        controller: 'newRegisterController'
    })
    
    .state('app.templateOne', {
        url: '/templateOne',
        templateUrl: 'views/app/templateOne.html',
        controller: 'templateOneController'
    })
    .state('app.templateTwo', {
        url: '/templateTwo',
        templateUrl: 'views/app/templateTwo.html',
        controller: 'templateTwoController'
    })
    .state('app.templateThree', {
        url: '/templateThree',
        templateUrl: 'views/app/templateThree.html',
        controller: 'templateThreeController'
    })
    .state('app.templateFour', {
        url: '/templateFour',
        templateUrl: 'views/app/templateFour.html',
        controller: 'templateFourController'
    })

    .state('app.activity', {
        url: '/activity',
        templateUrl: 'views/app/activity.html',
        controller: 'activityController'
    })
    .state('app.onXiaoDetail', {
        url: '/onXiaoDetail',
        templateUrl: 'views/app/onXiaoDetail.html',
        controller: 'onXiaoDetailController'
    })
    
    


    // banner
    .state('app.onLine', {
        url: '/onLine',
        templateUrl: 'views/app/onLine.html',
        controller: 'onLineController'
    })
    .state('app.bannerSecurity', {
        url: "/bannerSecurity",
        templateUrl: "views/app/bannerSecurity.html",
        controller: 'bannerSecurityController'
    })
    .state('app.bannerSecuritys', {
        url: "/bannerSecuritys",
        templateUrl: "views/app/bannerSecuritys.html",
        controller: 'bannerSecuritysController'
    })
    .state('app.bannerCooperation', {
        url: '/bannerCooperation',
        templateUrl: 'views/app/bannerCooperation.html',
        controller: 'bannerCooperationController '
    })

    .state('app.baCoo', {
        url: "/baCoo",
        templateUrl: "views/app/baCoo.html",
        controller: 'baCooController'
    })

    .state('app.hpxBaoJia', {
        url: '/hpxBaoJia',
        templateUrl: 'views/app/hpxBaoJia.html',
        controller: 'hpxBaoJiaController '
    })
    .state('app.hpxDa', {
        url: '/hpxDa',
        templateUrl: 'views/app/hpxDa.html',
        controller: 'hpxDaController '
    })
    .state('app.dianDa', {
        url: '/dianDa',
        templateUrl: 'views/app/dianDa.html',
        controller: 'dianDaController '
    })
});

ionicApp.controller('hpx', function ($cordovaStatusbar) {
    $cordovaStatusbar.overlaysWebView(true);

    // 样式: 无 : 0, 白色不透明: 1, 黑色半透明: 2, 黑色不透明: 3
    $cordovaStatusbar.style(2);

    // 背景颜色名字 : black, darkGray, lightGray, white, gray, red, green,
    // blue, cyan, yellow, magenta, orange, purple, brown, transparent注:需要开启状态栏占用视图.
    $cordovaStatusbar.styleColor('transparent');

    $cordovaStatusbar.styleHex('#fff');

    //$cordovaStatusbar.hide();

    $cordovaStatusbar.show();

    var isVisible = $cordovaStatusbar.isVisible();
})

//ionicApp.directive('compileHtml', function ($compile) {
//    return {
//        restrict: 'E',
//        replace: true,
//        link: function (scope, ele, attrs) {
//            scope.$watch(function () { return scope.$eval(attrs.ngBindHtml); },
//                function (html) {
//                    console.log("msgsh")
//                    ele.html(html);
//                    $compile(ele.contents())(scope);
//                });
//        }
//    };
//})
