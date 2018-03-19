ionicApp.controller('newAddAccountController', function ($scope, $rootScope, $state, $ionicPopup, bankService, addressService, customerService, localStorageService, payingService, $ionicModal) {
    console.log($scope)
    customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
        if (data.artificial_person_back_photo_id) {
            $scope.model = {
                enterprise_person: data.enterprise_name,
                enterpriseId: data.enterprise_id,
                account_type_code: $rootScope.accountTypeCode
            }
        }
    })
    $scope.hpxColse = function () {
        $state.go('app.user');
    };
    var hpxCou = function () {
        customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
            $scope.findEnterprise = data;
            var phxAid = $rootScope.identity.enterprise_id || $scope.findEnterprise.enterprise_id;
            payingService.getAgentTreasurer(phxAid).then(function (data) {
                $scope.agentModel = data;
            })
        })
    }
    hpxCou();
    // 账户验证
    $scope.hpxFindBank = function () {
        if ($scope.model.cnaps_code.length > 1) {
            bankService.banks($scope.model.cnaps_code).then(function (data) {
                $scope.hpxBanks = data;
            });
        }
    }

    $scope.saveAccount = function () {
        var hpAid = $rootScope.identity.enterprise_id || $scope.findEnterprise.enterprise_id;
        if (!$scope.model.cnaps_code) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入开户行支行行号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if ($scope.hpxBanks.bank_branch_name == null) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的开户行支行行号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.model.account_number) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入账号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        $scope.accountModal = {
            account_type_code: "501",
            enterprise_name: $scope.findEnterprise.enterprise_name,
            account_number: $scope.model.account_number,
            cnaps_code: $scope.model.cnaps_code,
            bank_branch_name: $scope.hpxBanks
        }
        payingService.getAccount(hpAid).then(function (data) {
            if (!data || data.acct_list.length == 0) {
                payingService.saveAccount($scope.accountModal).then(function (data) {
                    if (data && data != null) {
                        //$ionicPopup.alert({
                        //    title: '提示',
                        //    template: '账户提交成功。\n 请等待鉴权！',
                        //    okText: '确    定',
                        //    cssClass: 'hpxModal'
                        //});
                        //$state.go("app.accountStatus");
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: '账户提交成功。请等待鉴权！\n 退出重新登录进行电票发布！',
                            okText: '确    定',
                            cssClass: 'hpxModal',
                        });
                        alertPopup.then(function (res) {
                            // 强制退出，重新登录
                            $rootScope.identity = null;
                            localStorageService.set('customer', null);
                            $state.go('app.signin');
                        })
                    }
                });
            } else if (data.acct_list.length == 1) {
                if (data.acct_list[0].bank_number.startsWith("309") || $scope.model.cnaps_code.startsWith("309")) {
                    payingService.addMoreAccount(hpAid, $scope.accountModal).then(function (data) {
                        if (data && data != null) {
                            $ionicPopup.alert({
                                title: '通知',
                                template: '机构认证审核通过，请等待小额验证！',
                                okText: '确    定',
                                cssClass: 'hpxModal'
                            });
                            $state.go("app.accountStatus");
                        }
                    });
                } else {
                    $ionicPopup.alert({
                        title: '通知',
                        template: '您没有兴业银行卡，请绑定兴业银行卡！！！',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                }
            }
        })

        //$scope.accountModal = {
        //    account_type_code: "501",
        //    enterprise_name: $scope.findEnterprise.enterprise_name,
        //    account_number: $scope.model.account_number,
        //    cnaps_code: $scope.model.cnaps_code,
        //    bank_branch_name: $scope.hpxBanks
        //}
        //payingService.saveAccount($scope.accountModal).then(function () {
        //    $ionicPopup.alert({
        //        title: '提示',
        //        template: '账户提交成功。\n 请等待鉴权！',
        //        okText: '确    定',
        //        cssClass: 'hpxModal'
        //    });
        //    $state.go("app.accountStatus");
        //})
    }
    //$scope.verifyStr = "账户验证";
    //$scope.disableVerify = false;
    //$scope.getVerifyh = function () {
    //    var hpAid = $rootScope.identity.enterprise_id || $scope.findEnterprise.enterprise_id;
    //    if (!$scope.model.cnaps_code) {
    //        $ionicPopup.alert({
    //            title: '提示',
    //            template: '请输入开户行支行行号！',
    //            okText: '确    定',
    //            cssClass: 'hpxModal'
    //        });
    //        return;
    //    }
    //    if ($scope.hpxBanks.bank_branch_name == null) {
    //        $ionicPopup.alert({
    //            title: '提示',
    //            template: '请输入正确的开户行支行行号！',
    //            okText: '确    定',
    //            cssClass: 'hpxModal'
    //        });
    //        return;
    //    }
    //    if (!$scope.model.account_number) {
    //        $ionicPopup.alert({
    //            title: '提示',
    //            template: '请输入账号！',
    //            okText: '确    定',
    //            cssClass: 'hpxModal'
    //        });
    //        return;
    //    }
    //        payingService.getAccount(hpAid).then(function (data) {              
    //            if (!data || data.acct_list.length == 0) {
    //                payingService.openAccount(hpAid, $scope.model).then(function (data) {
    //                    $scope.verifyStr = "正在验证";
    //                    $scope.disableVerify = true;
    //                    if (data && data != null) {
    //                        $ionicPopup.alert({
    //                            title: '通知',
    //                            template: '机构认证审核通过，请等待小额验证！',
    //                            okText: '确    定',
    //                            cssClass: 'hpxModal'
    //                        });
    //                    }
    //                });
    //            }
    //            else if (data.acct_list.length == 1) {
    //                if (data.acct_list[0].bank_number.startsWith("309") || $scope.model.cnaps_code.startsWith("309")) {
    //                    payingService.addMoreAccount(hpAid, $scope.model).then(function (data) {
    //                        $scope.verifyStr = "正在验证";
    //                        $scope.disableVerify = true;
    //                        if (data && data != null) {
    //                            $ionicPopup.alert({
    //                                title: '通知',
    //                                template: '机构认证审核通过，请等待小额验证！',
    //                                okText: '确    定',
    //                                cssClass: 'hpxModal'
    //                            });
    //                        }
    //                    });
    //                } else {
    //                    $ionicPopup.alert({
    //                        title: '通知',
    //                        template: '您没有兴业银行卡，请绑定兴业银行卡！！！',
    //                        okText: '确    定',
    //                        cssClass: 'hpxModal'
    //                    });
    //                }
    //            }
    //        })

    //}
    //完成绑定
    //$scope.submitbinding = function () {
    //    if (!$scope.model.is_default) {
    //        $scope.model.is_default = 0;
    //    } else {
    //        $scope.model.is_default = 1;
    //    }
        
    //    payingService.checkAccount($scope.model.enterpriseId, $scope.model.verify_string, $scope.model.is_default, $scope.model.account_type_code).then(function (data) {
    //        $ionicPopup.alert({
    //            title: '通知',
    //            template: '小额验证通过！',
    //            okText: '确    定',
    //            cssClass: 'hpxModal'
    //        });
    //        $scope.identifyModel = data;
    //        //console.log(data)
    //        $scope.identifyModel.enterprise_name = $scope.model.enterprise_person;
    //        $scope.openTipModal();
    //    });
    //}
    //成功提示弹框
    $ionicModal.fromTemplateUrl('successTip.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.tipModal = modal;
    });

    $scope.openTipModal = function () {
        $scope.tipModal.show();
    }
    $scope.complete = function () {
        $scope.tipModal.hide();
        $state.go('app.user');
    }
    //$scope.ddd = function () {
    //    $scope.tipModal.show();
    //}
    //$scope.openTipModal()
    $scope.closeTipModal = function () {
        $scope.tipModal.hide();
        $state.go('app.accountBind');
    }
})