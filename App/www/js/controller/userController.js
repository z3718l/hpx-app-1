ionicApp.controller('userController', function ($scope, $rootScope, $state,$timeout,XingYe_URL, customerService, appHomeService, $ionicModal, $ionicPopup, payingService) {
    $scope.isSignIn = false;
    $scope.customerInfo = {
        
    }
    $scope.accountBind = function () {
        if ($rootScope.identity.is_verified == 0) {
            $ionicPopup.alert({
                title: "通知",
                template: "请先进行机构绑定和业务授权！",
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        }else{
            $state.go('app.accountBind');
        }
    }
    $rootScope.idBiEn = 1;
    $scope.alertOnlineService = false;
    if ($rootScope.identity) {
        //获取自己的注册资料
        customerService.getCustomer().then(function (data) {
            $scope.model = data;
        });
        appHomeService.getAppHome().then(function (data) {
            if (data != null) {
                $scope.isSignIn = true;
                $scope.customerInfo = data;
            }
        });
        if ($rootScope.identity.is_verified == 0) {
            customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
                if (data.is_alive && data.is_alive >= 4) {
                    payingService.queryAccount($rootScope.identity.token).then(function (data1) {
                        $scope.hpxBankAccount = data1;
                        if (!data1.corp.general_v_accts) {
                            if (data1.corp.v_acct.bank_name == "xingye") {
                                $scope.hpxXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                            } else {
                                $scope.hpxNoXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                            }
                        } else {
                            if (data1.corp.general_v_accts[0].bank_name == "xingye") {
                                $scope.hpxXYAccount = Number(data1.corp.general_v_accts[0].balance).toFixed(2);
                                $scope.hpxNoXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                            } else {
                                $scope.hpxXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                                $scope.hpxNoXYAccount = Number(data1.corp.general_v_accts[0].balance).toFixed(2);
                            }
                        }
                    })
                }
            })
        } else if ($rootScope.identity.is_verified >= 4) {
            payingService.queryAccount($rootScope.identity.token).then(function (data1) {
                $scope.hpxBankAccount = data1;
                // 只注册一个账户
                if (!data1.corp.general_v_accts) {
                    if (data1.corp.v_acct.bank_name == "xingye") {
                        $scope.hpxXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                    } else {
                        $scope.hpxNoXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                    }
                } else {
                    if (data1.corp.general_v_accts[0].bank_name == "xingye") {
                        $scope.hpxXYAccount = Number(data1.corp.general_v_accts[0].balance).toFixed(2);
                        $scope.hpxNoXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                    } else {
                        $scope.hpxXYAccount = Number(data1.corp.v_acct.balance).toFixed(2);
                        $scope.hpxNoXYAccount = Number(data1.corp.general_v_accts[0].balance).toFixed(2);
                    }
                }
            })
        }
    }

    $ionicModal.fromTemplateUrl('accountPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.accountModal = modal;
    });
    $scope.hpxAccount = function () {
        $scope.accountModal.show();
    }
    $scope.withdraw = function () {
        window.open(XingYe_URL + $rootScope.identity.corp_id);
    }
    $scope.alertOnline = function () {
        $scope.alertOnlineService = true;
        //alert($scope.alertOnlineService)
    }
    //(function (a, h, c, b, f, g) { a["UdeskApiObject"] = f; a[f] = a[f] || function () { (a[f].d = a[f].d || []).push(arguments) }; g = h.createElement(c); g.async = 1; g.src = b; c = h.getElementsByTagName(c)[0]; c.parentNode.insertBefore(g, c) })(window, document, "script", "http://assets-cli.huipiaoxian.udesk.cn/im_client/js/udeskApi.js?1484906754367", "ud");

    //ud({
    //    "code": "19hb4g1h",
    //    "link": "http://www.huipiaoxian.udesk.cn/im_client?web_plugin_id=23504",
    //    "targetSelector": "#online-service",
    //    "mobile": {
    //        "mode": "inner",
    //        "color": "#307AE8",
    //        "pos_flag": "srm",
    //        "onlineText": "联系客服，在线咨询",
    //        "offlineText": "客服下班，请留言",
    //        "pop": {
    //            "direction": "top",
    //            "arrow": {
    //                "top": 0,
    //                "left": "70%"
    //            }
    //        }
    //    }
    //});

    $scope.openService = function () {
        $scope.alertOnlineService = true;
    }
    $scope.closeService = function () {
        $scope.alertOnlineService = false;
    }
    $scope.onlineService = function () {
        $ionicPopup.alert({
            title: "通知",
            template: "暂不支持！",
            okText: '确    定',
            cssClass: 'hpxModal'
        });
    }
    $scope.closeModel = function () {
        $scope.accountModal.hide();
    }

    $('#online-service').click(function (e) {
        $scope.tanC = 1;
        e.stopPropagation();
        var myPopup = $ionicPopup.show({
            cssClass: 'hpxShare6',
            template: '<div class="alert-online-service" ng-click="closeService()">' +
                        '<div class="box">' +
                        '<ul>' +
                        '<li><a href="tel:4007720575"><img src="images/tel.png"alt="" class="icon">400-772-0575</a></li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>',
            scope: $scope,
        })
        $scope.noneTel = function () {
            myPopup.close();
        }
    })

    $(document).click(function () {
        if ($scope.tanC == 1) {
            $scope.noneTel();
        }
       
    })
    
})