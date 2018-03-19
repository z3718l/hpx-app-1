ionicApp.controller('accountBindController', function ($scope, $rootScope, $state, $ionicPopup, customerService, constantsService, payingService, localStorageService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.hpxColse = function () {
        $state.go('app.user');
    };
    $scope.model = {}
    //获取所有的银行账户信息，并显示是否为默认银行账户
    if ($rootScope.identity.is_verified == 0) {
        customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
            $scope.findEnterprise = data;
            if (data.enterprise_id) {
                $rootScope.identity.enterprise_id = $scope.findEnterprise.enterprise_id;
                payingService.getAccount($rootScope.identity.enterprise_id).then(function (data) {
                    if (data) {
                        $scope.AccountData = data.acct_list;
                        for (var i = 0; i < $scope.AccountData.length; i++) {
                            if ($scope.AccountData[i].is_default == 1) {
                                $scope.AccountData[i].is_default = "是";
                            } else {
                                $scope.AccountData[i].is_default = null;
                            }
                        }
                    }
                });
            }
        })
    }
    else {
        payingService.getAccount($rootScope.identity.enterprise_id).then(function (data) {
            if (data) {
                $scope.AccountData = data.acct_list;
                for (var i = 0; i < $scope.AccountData.length; i++) {
                    if ($scope.AccountData[i].is_default == 1) {
                        $scope.AccountData[i].is_default = "是";
                    } else {
                        $scope.AccountData[i].is_default = null;
                    }
                }
            }
        });
    }
    $rootScope.accountTypeCode = 501
    //卖方买方class改变
    $scope.changeType = function (accountTypeCode) {
        $rootScope.accountTypeCode = accountTypeCode;
        //获取所有的银行账户信息，并显示是否为默认银行账户

        payingService.getAccount($rootScope.identity.enterprise_id).then(function (data) {
            if (data.acct_list) {
                $scope.AccountData = data.acct_list;
                for (var i = 0; i < $scope.AccountData.length; i++) {
                    if ($scope.AccountData[i].is_default == 1) {
                        $scope.AccountData[i].is_default = "是";
                    } else {
                        $scope.AccountData[i].is_default = null;
                    }
                }
            }
        });
    }
    //调用后台功能进行自动验证
    $scope.verifySubmit = function () {
        if (parseInt($scope.model.verify_string) != 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入不超过1元的金额!！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        $scope.models = {
            'enterprise_person': $rootScope.identity.enterprise_name || $scope.findEnterprise.enterprise_name,
            'enterpriseId': $rootScope.identity.enterprise_id || $scope.findEnterprise.enterprise_id,
        };
        $scope.modeles = {
            account_type_code: 501,
            is_default: 0,
        }
        payingService.checkAccount($scope.models.enterpriseId, $scope.model.verify_string, $scope.modeles.is_default, $scope.modeles.account_type_code).then(function (data) {
            //$ionicPopup.alert({
            //    title: '通知',
            //    template: '小额验证成功！',
            //    okText: '确    定',
            //    cssClass: 'hpxModal'
            //});
            //$state.go('app.user');
            // 只有当第一次绑定银行卡鉴权的时候，才会强制退出一次
            if ($scope.AccountData.length < 2) {
                var alertPopup = $ionicPopup.alert({
                    title: '提示',
                    template: '小额验证通过，请退出重新登录进行电票交易！',
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
                alertPopup.then(function (res) {
                    // 强制退出，重新登录
                    $rootScope.identity = null;
                    localStorageService.set('customer', null);
                    $state.go('app.signin');
                })
            } else {
                $ionicPopup.alert({
                    title: '通知',
                    template: '小额验证成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                $state.go('app.user');
            }
        });

    };
    $scope.verify = function (data) {
        $scope.model = data;
    }
})
ionicApp.controller('accountStatusController', function ($scope, $rootScope, $state, $ionicPopup, customerService, payingService) {
    console.log($scope)
    console.log($rootScope)
    // 查询个人信息，企业信息，经办人信息以及账户信息
    customerService.getCustomer().then(function (data) {
        $scope.model = data;
        if ($rootScope.identity.customer_id && $scope.model.is_verified != 0) {
            customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
                $scope.singleEnterprise = data;
                $scope.enterpriseModel = data;
                if ($scope.singleEnterprise.enterprise_id != 0 && ($scope.singleEnterprise.enterprise_id != null || $scope.enterpriseModel.is_verified != 0)) {
                    // 根据企业id查询经办人信息
                    payingService.getAgentTreasurer($scope.singleEnterprise.enterprise_id).then(function (agentData) {
                        $scope.agentModel = agentData;
                    });
                    // 根据企业信息查询银行卡信息
                    payingService.getAccount($scope.singleEnterprise.enterprise_id).then(function (accountData) {
                        //$scope.isLoging = false;
                        if (accountData) {
                            $scope.AccountData = accountData.acct_list;
                        } else {
                            $scope.AccountData = ""
                        }
                    })
                }
            })
        }
    });
    // 机构认证 验证
    //ui-sref="app.accredit"
    $scope.accredit = function () {
        if ($scope.model.is_verified == 0) {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请先完善联系人信息！',
                okText: '确    定',
                cssClass: 'hpxModal',
            });
            alertPopup.then(function (res) {
                $state.go('app.userInfo');
            })
        } else {
            $state.go('app.accredit');
        }
    }
    // 业务授权验证
    //ui-sref="app.newAuthorizate"
    $scope.newAuthorizate = function () {
        if ($scope.singleEnterprise.enterprise_id == 0 || $scope.singleEnterprise.enterprise_id == '') {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请先进行机构认证！',
                okText: '确    定',
                cssClass: 'hpxModal',
            });
            alertPopup.then(function (res) {
                $state.go('app.accredit');
            })
        } else {
            $state.go('app.newAuthorizate');
        }
    }
    // 账户绑定验证
    $scope.accountBind = function () {
        if ($scope.model.is_verified < 3) {
            $ionicPopup.alert({
                title: "通知",
                template: "请先进行机构绑定和业务授权！",
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        } else {
            $state.go('app.accountBind');
        }
    }
})
ionicApp.controller('accreditController', function ($scope, $rootScope, $state, $ionicPopup, $ionicModal,$timeout, customerService, localStorageService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.hpxColse = function () {
        $state.go('app.user');
    };
    // 根据用户查询企业
    if ($rootScope.identity.customer_id > 0) {
        customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
            $scope.findEnter = data;
            if (data.enterprise_address == "") {
                $scope.enterprise_addres = "";
            } else {
                $scope.enterprise_addres = data.enterprise_address;
            }
            $scope.model = {
                enterprise_name: data.enterprise_name,
                credential_photo_id: data.credential_photo_id,
                credential_photo_address: data.credential_photo_address,
                artificial_person_front_photo_id: data.artificial_person_front_photo_id,
                artificial_person_front_photo_address: data.artificial_person_front_photo_address,
                artificial_person_back_photo_id: data.artificial_person_back_photo_id,
                artificial_person_back_photo_address: data.artificial_person_back_photo_address,
                id: data.enterprise_id,
                is_verified: data.is_alive,
                credential_number: data.credential_number,
                enterprise_address: $scope.enterprise_addres,
                verify_description: data.description
            };
        })
    }
    //hpxCou = function () {
    //    if ($rootScope.identity.is_verified == 0) {
    //        customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
    //            if (data.enterprise_address == "") {
    //                $scope.enterprise_addres = "";
    //            } else {
    //                $scope.enterprise_addres = data.enterprise_address;
    //            }
    //            if (data.artificial_person_back_photo) {
    //                $scope.model = {
    //                    enterprise_name: data.enterprise_name,
    //                    //credential_photo_id: data.credential_photo_id,
    //                    credential_photo_address: data.credential_photo,
    //                    //artificial_person_front_photo_id: data.artificial_person_front_photo_id,
    //                    artificial_person_front_photo_address: data.artificial_person_front_photo,
    //                    //artificial_person_back_photo_id: data.artificial_person_back_photo_id,
    //                    artificial_person_back_photo_address: data.artificial_person_back_photo,
    //                    id: data.enterprise_id,
    //                    is_verified: data.is_alive,
    //                    verify_status: "审核失败",
    //                    verify_description: data.description,
    //                    enterprise_address: $scope.enterprise_addres
    //                }
    //                if (data.credential_photo_id && data.artificial_person_front_photo_id && data.artificial_person_back_photo_id) {
    //                    $scope.is_Disable = false;
    //                } else {
    //                    $scope.is_Disable = true;
    //                }
    //            }
    //            else {
    //                customerService.getAllEnterprise().then(function (data) {
    //                    if (data.enterprise_address == "") {
    //                        $scope.enterprise_addres = "";
    //                    } else {
    //                        $scope.enterprise_addres = data.enterprise_address;
    //                    }
    //                    $scope.model = {
    //                        enterprise_name: data.enterprise_name,
    //                        //credential_number: data.credential_number,
    //                        credential_photo_id: data.credential_photo_id,
    //                        credential_photo_address: data.credential_photo_address,
    //                        artificial_person_front_photo_id: data.artificial_person_front_photo_id,
    //                        artificial_person_front_photo_address: data.artificial_person_front_photo_address,
    //                        artificial_person_back_photo_id: data.artificial_person_back_photo_id,
    //                        artificial_person_back_photo_address: data.artificial_person_back_photo_address,
    //                        id: data.id,
    //                        is_verified: data.is_verified,
    //                        credential_number: data.credential_number,
    //                        enterprise_address: $scope.enterprise_addres
    //                    };
    //                    if (data.credential_photo_id && data.artificial_person_front_photo_id && data.artificial_person_back_photo_id) {
    //                        $scope.is_Disable = false;
    //                    } else {
    //                        $scope.is_Disable = true;
    //                    }
    //                });
    //            }
    //        })
    //    }
    //    else {
    //        customerService.getAllEnterprise().then(function (data) {
    //            if (data.enterprise_address == "") {
    //                $scope.enterprise_addres = "";
    //            } else {
    //                $scope.enterprise_addres = data.enterprise_address;
    //            }
    //            $scope.model = {
    //                enterprise_name: data.enterprise_name,
    //                //credential_number: data.credential_number,
    //                credential_photo_id: data.credential_photo_id,
    //                credential_photo_address: data.credential_photo_address,
    //                artificial_person_front_photo_id: data.artificial_person_front_photo_id,
    //                artificial_person_front_photo_address: data.artificial_person_front_photo_address,
    //                artificial_person_back_photo_id: data.artificial_person_back_photo_id,
    //                artificial_person_back_photo_address: data.artificial_person_back_photo_address,
    //                id: data.id,
    //                is_verified: data.is_verified,
    //                credential_number: data.credential_number,
    //                verify_status: data.verify_status,
    //                enterprise_address: $scope.enterprise_addres
    //            };
    //            if (data.credential_photo_id && data.artificial_person_front_photo_id && data.artificial_person_back_photo_id) {
    //                $scope.is_Disable = false;
    //            } else {
    //                $scope.is_Disable = true;
    //            }
    //            customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data2) {
    //                $scope.model.verify_description = data2.description
    //            });
    //        });
    //    }
    //}
    //hpxCou();

    $scope.filter = {
        tip: false,
        update: false,
        tp: [0, 0, 0]
    };
    $scope.takePhoto = function (index) {
        switch (index) {
            case 0:
                $scope.$takePhoto(function (data) {
                    $scope.model.credential_photo_address = data;
                    $scope.imgCre = true;
                    //$scope.isViewF = false;
                    //$scope.isViewB = false;
                    $scope.$uploadPhoto($scope.model.credential_photo_address, function (data) {
                        data = JSON.parse(data);
                        $scope.model.credential_photo_id = data.data.id;
                        $scope.model.credential_photo_address = data.data.file_path;
                        $scope.filter.tp[index] = true;
                        if ($scope.model.credential_photo_id || $scope.model.credential_photo_id != '') {
                            $timeout(function () {
                                $scope.imgCre = false;
                                $rootScope.isView = false;
                                $scope.isViewF = false;
                                $scope.isViewB = false;
                            },100)
                        }
                    });

                });
                break;
            case 1:
                $scope.$takePhoto(function (data) {
                    $scope.model.artificial_person_front_photo_address = data;
                    $scope.isViewF = true;
                    //$scope.imgCre = false;
                    //$scope.isViewB = false;
                    $scope.$uploadPhoto($scope.model.artificial_person_front_photo_address, function (data) {
                        data = JSON.parse(data);
                        $scope.model.artificial_person_front_photo_id = data.data.id;
                        $scope.model.artificial_person_front_photo_address = data.data.file_path;
                        $scope.filter.tp[index] = true;
                        if ($scope.model.artificial_person_front_photo_id || $scope.model.artificial_person_front_photo_id != '') {
                            $timeout(function () {
                                $scope.isViewF = false;
                                $rootScope.isView = false;
                                $scope.imgCre = false;
                                $scope.isViewB = false;
                            }, 100)
                        }
                    });
                });
                break;
            case 2:
                $scope.$takePhoto(function (data) {
                    $scope.model.artificial_person_back_photo_address = data;
                    $scope.isViewB = true;
                    //$scope.imgCre = false;
                    //$scope.isViewF = false;
                    $scope.$uploadPhoto($scope.model.artificial_person_back_photo_address, function (data) {
                        data = JSON.parse(data);
                        $scope.model.artificial_person_back_photo_id = data.data.id;
                        $scope.model.artificial_person_back_photo_address = data.data.file_path;
                        $scope.filter.tp[index] = true;
                        if ($scope.model.artificial_person_back_photo_id || $scope.model.artificial_person_back_photo_id != '') {
                            $timeout(function () {
                                $scope.isViewB = false;
                                $rootScope.isView = false;
                                $scope.imgCre = false;
                                $scope.isViewF = false;
                            }, 100)
                        }
                    });
                });
                break;
        }
    };

    $scope.loginOut = function () {
        $rootScope.loginRequestEnter = null;
        $rootScope.enterprises = null;
        $rootScope.identity = null;
        localStorageService.set('customer', null);
        $ionicPopup.alert({
            title: '提示',
            template: '请重新登录!',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
    }

    $scope.save = function () {
        if ($scope.model.enterprise_name == '') {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入机构全称！',
                okType: 'button-assertive',
            });
            return;
        }
        if (!$scope.model.credential_photo_id && !$scope.imgCre) {
            $ionicPopup.alert({
                title: '提示',
                template: '请上传营业执照！',
                okType: 'button-assertive',
            });
            return;
        }
        if (!$scope.model.credential_photo_id && $scope.imgCre) {
            $ionicPopup.alert({
                title: '提示',
                template: '正在上传，请等待！',
                okType: 'button-assertive',
            });
            return;
        }
        if (!$scope.model.artificial_person_front_photo_id && !$scope.isViewF) {
            $ionicPopup.alert({
                title: '提示',
                template: '请上传法人代表身份证！',
                okType: 'button-assertive',
            });
            return;
        }
        if (!$scope.model.artificial_person_front_photo_id && $scope.isViewF) {
            $ionicPopup.alert({
                title: '提示',
                template: '正在上传，请等待！',
                okType: 'button-assertive',
            });
            return;
        }

        if (!$scope.model.artificial_person_back_photo_id && !$scope.isViewB) {
            $ionicPopup.alert({
                title: '提示',
                template: '请上传法人代表身份证！',
                okType: 'button-assertive',
            });
            return;
        }
        if (!$scope.model.artificial_person_back_photo_id && $scope.isViewB) {
            $ionicPopup.alert({
                title: '提示',
                template: '正在上传，请等待！',
                okType: 'button-assertive',
            });
            return;
        }
        if ($scope.model.id == null || $scope.model.id == 0) {
            customerService.insertEnterprise($scope.model).then(function (data) {
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxWan',
                    template: '<div class="alert-bind-info1">' +
                               '<div class="box">' +
                               '<h3>温馨提示</h3>' +
                               '<p>已完善机构认证信息，请进行下一步业务授权</p>' +
                               '<ul>' +
                               '<li class="on"><i>1</i>编辑联系人信息</li>' +
                               '<li class="on"><i>2</i>机构认证</li>' +
                               '<li><i>3</i>业务授权</li>' +
                               '<li><i>4</i>账户绑定</li>' +
                               '</ul>' +
                               '<p class="tips">注：进行电票交易须完成四步信息填写，如无需电票交易则填写第一、二步信息即可。</p>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '取消',
                              onTap: function (e) {
                                  $state.go('app.user');
                              }
                          },
                          {
                              text: '进入下一步',
                              type: 'button-positive',
                              onTap: function (e) {
                                  $state.go('app.newAuthorizate');
                              }
                          }
                    ]
                })

            });
        } else {
            $scope.model.enterprise_address = ($scope.model.enterprise_address != "" && $scope.model.enterprise_address != undefined && $scope.model.enterprise_address != null) ? $scope.model.enterprise_address : "";
            customerService.updateEnterprise2($scope.model).then(function (data) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '保存成功，请等待管理员审核！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                $state.go('app.user');

            });
        }
    };
    $scope.update = function () {
        if ($scope.filter.update == false) {
            $scope.filter.update = true;
        }
        else {
            $scope.save();
        }
    }
    //图片放大弹框
    $ionicModal.fromTemplateUrl('imgMagnify.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.imgMagnifyModal = modal;
    });

    $scope.openImgMagnifyModal = function (img_path) {
        if (img_path) {
            $scope.imgMagnifyModal.show();
            $scope.img_path = img_path;
        }
    }

    $scope.closeImgMagnifyModal = function () {
        $scope.imgMagnifyModal.hide();
    }
})
ionicApp.controller('activityController', function ($scope, $rootScope, $state,$compile) {
    $scope.onLine = function () {
        $state.go("app.onLine")
    }
    $scope.hpxReward = '<img src="images/activity8.png" alt="" /><img ng-click="onLine()" src="images/activity7.png" alt="" />';
    $scope.phxIntrod = '<img src="images/activity6.png" alt="" /><img ng-click="onLine()" src="images/activity7.png" alt="" />';

    $scope.style = 'line-height:0;'
    $scope.style1 = 'height:100%;background-color:#fedd52;'

    angular.element(".act_bind1").append($compile($scope.hpxReward)($scope));
    angular.element(".act_bind2").append($compile($scope.phxIntrod)($scope));
})
ionicApp.controller('addAccountController', function ($scope, $rootScope, $state, $ionicPopup, bankService, addressService, customerService, payingService, $ionicModal) {
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
    $scope.verifyStr = "账户验证";
    $scope.disableVerify = false;
    $scope.getVerifyh = function () {
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
        //if ($scope.findEnterprise.enterprise_id == 0 || $scope.findEnterprise.is_alive == 2) {
        //    $ionicPopup.alert({
        //        title: '通知',
        //        template: '机构认证待审核，请等待或联系客服！',
        //        okText: '确    定',
        //        cssClass: 'hpxModal'
        //    });
        //}
        //else if ($scope.findEnterprise.is_alive == -1) {
        //    $ionicPopup.alert({
        //        title: '通知',
        //        template: '企业审核信息有误，请进行修改！',
        //        okText: '确    定',
        //        onTap: function (e) {
        //            $state.go('app.accredit');
        //        },
        //        cssClass: 'hpxModal'
        //    });
        //}
        //else if ($scope.agentModel.isChecked == 0) {
        //    $ionicPopup.alert({
        //        title: '通知',
        //        template: '业务授权待审核，请等待或联系客服！',
        //        okText: '确    定',
        //        cssClass: 'hpxModal'
        //    });
        //}
        //else if ($scope.agentModel.isChecked == -1) {
        //    $ionicPopup.alert({
        //        title: '通知',
        //        template: '业务授权信息有误，请进行修改！',
        //        okText: '确    定',
        //        onTap: function (e) {
        //            $state.go('app.authorizate');
        //        },
        //        cssClass: 'hpxModal'
        //    });
        //}
        //else {
            payingService.getAccount(hpAid).then(function (data) {              
                if (!data || data.acct_list.length == 0) {
                    payingService.openAccount(hpAid, $scope.model).then(function (data) {
                        $scope.verifyStr = "正在验证";
                        $scope.disableVerify = true;
                        if (data && data != null) {
                            $ionicPopup.alert({
                                title: '通知',
                                template: '机构认证审核通过，请等待小额验证！',
                                okText: '确    定',
                                cssClass: 'hpxModal'
                            });
                        }
                    });
                }
                else if (data.acct_list.length == 1) {
                    if (data.acct_list[0].bank_number.startsWith("309") || $scope.model.cnaps_code.startsWith("309")) {
                        payingService.addMoreAccount(hpAid, $scope.model).then(function (data) {
                            $scope.verifyStr = "正在验证";
                            $scope.disableVerify = true;
                            if (data && data != null) {
                                $ionicPopup.alert({
                                    title: '通知',
                                    template: '机构认证审核通过，请等待小额验证！',
                                    okText: '确    定',
                                    cssClass: 'hpxModal'
                                });
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
        //}



    }
    //$scope.getVerifyh = function () {
    //    if (!$scope.model.account_person) {
    //        $ionicPopup.alert({
    //            title: '警告',
    //            template: '请输入银行名称！',
    //            okType: 'button-assertive',
    //        });
    //        return;
    //    }
    //    if (!$scope.model.bank_number) {
    //        $ionicPopup.alert({
    //            title: '警告',
    //            template: '请输入开户行行号！',
    //            okType: 'button-assertive',
    //        });
    //        return;
    //    }
    //    if (!$scope.model.account_number) {
    //        $ionicPopup.alert({
    //            title: '警告',
    //            template: '请输入账号！',
    //            okType: 'button-assertive',
    //        });
    //        return;
    //    }
    //    payingService.getAccount($scope.model.enterpriseId).then(function (data) {
    //        $scope.verifyStr = "正在验证";
    //        $scope.disableVerify = true;
    //        if (!data.acct_list || data.acct_list.length == 0) {
    //            payingService.openAccount($scope.model.enterpriseId, $scope.model).then(function (data) {
    //                if (data && data != null) {
    //                    $ionicPopup.alert({
    //                        title: '警告',
    //                        template: '审核通过，等待小额验证！',
    //                        okType: 'button-assertive',
    //                    });
    //                }
    //            });
    //        } else if (data.acct_list.length == 1) {
    //            payingService.addMoreAccount($scope.model.enterpriseId, $scope.model).then(function (data) {
    //                if (data && data != null) {
    //                    $ionicPopup.alert({
    //                        title: '警告',
    //                        template: '审核通过，等待小额验证！',
    //                        okType: 'button-assertive',
    //                    });
    //                }
    //            });
    //        }
    //    })

    //}
    //完成绑定
    $scope.submitbinding = function () {
        if (!$scope.model.is_default) {
            $scope.model.is_default = 0;
        } else {
            $scope.model.is_default = 1;
        }
        
        payingService.checkAccount($scope.model.enterpriseId, $scope.model.verify_string, $scope.model.is_default, $scope.model.account_type_code).then(function (data) {
            $ionicPopup.alert({
                title: '通知',
                template: '小额验证通过，请退出冲洗你登录进行电票交易！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $scope.identifyModel = data;
            //console.log(data)
            $scope.identifyModel.enterprise_name = $scope.model.enterprise_person;
            $scope.openTipModal();
        });
    }
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
ionicApp.controller('appController', function ($scope, $rootScope, $state, localStorageService, FILE_URL, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $ionicPopup, billService) {
    console.log("app");
    console.log($scope)
    $scope.$on('$stateChangeSuccess', function () {
        //TouchSlide({
        //    slideCell: "#tabBox1",
        //    endFun: function (e) {
        //        var t = document.getElementById("tabBox1-bd");
        //        t.parentNode.style.height = t.children[e].children[0].offsetHeight + 50 + "px",
        //        e > 0 && (t.parentNode.style.transition = "200ms")
        //    }
        //});
    });
    $scope.Params = {
        Create: function (orderBy, count) {
            var params = {};
            if (orderBy) {
                params._orderBy = orderBy;
            }

            if (count) {
                params._count = count;
            } else {
                params._count = 10;
            }

            params._page = 1;

            params.page = function () {
                return params._page;
            };

            params.orderBy = function () {
                return params._orderBy;
            };

            params.count = function () {
                return params._count;
            };

            params.total = function (total) {
                params._total = total;
            };

            params.next = function () {
                params._page++;
            };

            return params;
        }
    };

    $scope.$takePhoto = function (success) {
        //alert("调用$takePhoto");
        var hide = $ionicActionSheet.show({
            buttons: [
              { text: '<i class="icon ion-ios-camera"></i>拍照' },
              { text: '<i class="icon ion-ios-albums"></i>从相册中选择' }
            ],
            titleText: '获取图片',
            cancelText: '取消',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                //alert("buttonClicked")
                if (index == 0) {
                    // 拍照
                    //alert("拍照")
                    var options = {
                        quality: 100,                                       //保存图像的质量，范围0-100
                        destinationType: Camera.DestinationType.FILE_URI,  //返回值格式:DATA_URL=0,返回作为base64编码字符串；FILE_URL=1，返回图像的URL；NATIVE_RUL=2，返回图像本机URL
                        sourceType: Camera.PictureSourceType.CAMERA,       //设置图片来源：PHOTOLIBRARY=0，相机拍照=1，
                        allowEdit: false,                                   //选择图片前是否允许编辑
                        encodingType: Camera.EncodingType.JPEG,            //JPEN = 0，PNG = 1
                        //targetWidth: 100,                                  //缩放图像的宽度（像素）
                        //targetHeight: 100,                                 //缩放图像的高度（像素）
                        popoverOptions: CameraPopoverOptions,              //ios,iPad弹出位置
                        saveToPhotoAlbum: true,                            //是否保存到相册
                        correctOrientation: true                           //设置摄像机拍摄的图像是否为正确的方向
                    };
                    //alert(options)
                    $cordovaCamera.getPicture(options).then(function (imageURI) {
                        success(imageURI);
                        hide();
                    }, function (err) {
                        //alert(err);
                    });
                } else if (index == 1) {
                    var options = {
                        maximumImagesCount: 1, //最大选择图片数量
                        width: 0,             //筛选宽度：如果宽度为0，返回所有尺寸的图片
                        height: 0,            //筛选高度：如果高度为0，返回所有尺寸的图片
                        quality: 100          //图像质量的大小，默认为100
                    };
                    //alert(options)
                    $cordovaImagePicker.getPictures(options).then(function (results) {
                        //alert(results)
                        for (var i = 0; i < results.length; i++) {
                            success(results[i])
                            hide();
                            return;
                        }
                    }, function (error) {
                        //alert(err);
                    });
                }
            }
        });
    };
    //$rootScope.isView = false;
    $scope.$uploadPhoto = function (src, success) {
        $rootScope.isView = true;
        var uri = FILE_URL + '/file';
        var options = new FileUploadOptions();

        options.fileKey = "file";
        options.fileNam = src.substr(src.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.headers = { 'Authorization': 'Bearer ' + $rootScope.identity.token };
        options.params = { 'FileTypeCode': 1002 };

        var ft = new FileTransfer();
        ft.upload(src, uri, function (result) {
            success(result.response);
        }, function (err) {
            //alert(err.exception);
        }, options);
        ft.onprogress = function (progressEvent) {
            if (progressEvent.lengthComputable) {
                var oploadProgres = Number(progressEvent.loaded / progressEvent.total).toFixed(2);
                $rootScope.progress = oploadProgres * 100;
                //if ($rootScope.progress >= 100) {
                //    $rootScope.isView = false;
                //}
            }
            //alert($rootScope.isView)
        };
    };

    $scope.amountInWords = function (n) {
        if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
            return "";
        var unit = "千百拾亿千百拾万千百拾元角分", str = "";
        n += "00";
        var p = n.indexOf('.');
        if (p >= 0)
            n = n.substring(0, p) + n.substr(p + 1, 2);
        unit = unit.substr(unit.length - n.length);
        for (var i = 0; i < n.length; i++)
            str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
        return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
    }

    // 获取该企业的今日报价信息
    $scope.hpxji = function () {
        if ($rootScope.identity == null) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go("app.signin");
            return
        } else {
            billService.getBillOfferBySelf().then(function (data) {
                console.log(data);
                if (data == null) {
                    $state.go('app.newBillOffer');
                } else {
                    $state.go('app.billOfferQuery')
                }
            })
        }  
    }

    // 点击我要出票判断是否登录
    $scope.hpxDraw = function () {
        if ($rootScope.identity == null) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go("app.signin");
            return
        } else {
            $state.go('app.drawBill')
        }
    }
    // 点击我的账户
    $scope.hpxUserA = function () {
        if ($rootScope.identity == null) {
            //$ionicPopup.alert({
            //    title: '提示',
            //    template: '账户未登录！',
            //    okText: '确    定',
            //    cssClass: 'hpxModal'
            //});
            $state.go("app.signin");
            return
        } else {
            $state.go('app.user')
        }
    }

    //hpxInit = function () {
    //    console.log("获取今日报价信息")
    //    billService.getBillOfferBySelf().then(function (data) {
    //        console.log(data);
    //        if (data == null) {
    //            //$scope.listData = data;
    //            $state.go('app.newBillOffer');
    //        } else {
    //            //$scope.listData = data.billOffers;
    //            //for (item in data.billOffers) {
    //            //    data.billOffers[item].offer_detail = JSON.parse(data.billOffers[item].offer_detail)
    //            //}
    //            $scope.go('app.billOfferQuery')
    //        }
    //    })
    //}
    //hpxInit();

})
ionicApp.controller('authorizateController', function ($scope, $rootScope, $state, $ionicPopup, $ionicModal, customerService, payingService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.hpxColse = function () {
        $state.go('app.user');
    };
    $scope.model = {}
    $scope.exampleModel = {
        src1: "images/danweishouquan.jpg",
        src2: "images/qiyeshouquan.jpg",
    };
    $scope.loginOut = function () {
        $rootScope.loginRequestEnter = null;
        $rootScope.enterprises = null;
        $rootScope.identity = null;
        localStorageService.set('customer', null);
        $ionicPopup.alert({
            title: '提示',
            template: '请重新登录!',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
    }
    $scope.takePhoto = function (index) {
        //alert(index)
        switch (index) {
            case 0:
                $scope.$takePhoto(function (data) {
                    //alert(data)
                    //alert($scope.agentModel.authorization_xingyeshujin_photo_address)
                    $scope.agentModel.authorization_xingyeshujin_photo_address = data;
                    $scope.$uploadPhoto($scope.agentModel.authorization_xingyeshujin_photo_address, function (data) {
                        data = JSON.parse(data);
                        $scope.agentModel.authorization_xingyeshujin_photo_id = data.data.id;
                        $scope.agentModel.authorization_xingyeshujin_photo_address = data.data.file_path;
                        //alert($scope.agentModel.authorization_xingyeshujin_photo_id)
                        //$ionicPopup.alert({
                        //    title: '提示',
                        //    template: $scope.agentModel.authorization_xingyeshujin_photo_id,
                        //    okType: 'button-assertive',
                        //});
                    });
                });
                break;
            case 1:
                $scope.$takePhoto(function (data) {
                    $scope.agentModel.authorization_xingyebank_photo_address = data;
                    $scope.$uploadPhoto($scope.agentModel.authorization_xingyebank_photo_address, function (data) {
                        data = JSON.parse(data);
                        $scope.agentModel.authorization_xingyebank_photo_id = data.data.id;
                        $scope.agentModel.authorization_xingyebank_photo_address = data.data.file_path;
                        //alert($scope.agentModel.authorization_xingyebank_photo_address)
                    });
                });
                break;

        }
    };
    $scope.filter = {
        tip: false,
        update: false,
        Rule: true
    };
    if ($rootScope.identity.is_verified >= 0) {
        //alert("is0")
        customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
            //console.log(data)
            $scope.findEnterprise = data;
            //alert(data + "?")
            if (data.enterprise_id) {
                //alert($scope.findEnterprise.enterprise_id)
                $scope.model.id = $scope.findEnterprise.enterprise_id;
                //alert($scope.model.id + "!")
                payingService.getAgentTreasurer($scope.model.id).then(function (result) {
                    //$scope.agentModel = result;
                    if (result) {
                        $scope.agentModel = result;
                    }
                    else {
                        $scope.agentModel = {
                            authorization_xingyeshujin_photo_address: '',
                            authorization_xingyebank_photo_address: '',
                        };
                    }
                });
            }
        })
    }
    else {
        customerService.getAllEnterprise().then(function (data) {
            $scope.model = data;
            //alert(data + "!")
            if (data.id) {
                //alert($scope.model.id + "?")
                payingService.getAgentTreasurer($scope.model.id).then(function (result) {
                    //alert(reslut)
                    if (result) {
                        $scope.agentModel = result;
                    }
                    else {
                        $scope.agentModel = {
                            authorization_xingyeshujin_photo_address: '',
                            authorization_xingyebank_photo_address: '',
                        };
                    }
                });
            }
        });
    }
        //$scope.reloadModel = function () {
        //if ($rootScope.identity.is_verified == 0) {
        //    console.log("条件完成")
        //    customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
        //        console.log(data)
        //        $scope.findEnterprise = data;
        //        //alert($scope.findEnterprise.enterprise_id)
        //        $scope.model.id = $scope.findEnterprise.enterprise_id;
        //        alert($scope.model.id + "!")
        //        payingService.getAgentTreasurer($scope.model.id).then(function (result) {
        //            $scope.agentModel = result;
        //        });
        //    })
        //}
        //else {

        //}
        //}
        //$scope.reloadModel();
    $ionicModal.fromTemplateUrl('servicePopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.serviceModal = modal;
    });
    $scope.zhijian = function () {
        $scope.serviceModal.show();
    }
    $scope.closeModel = function () {
        $scope.serviceModal.hide();
    }

    $scope.saveAgent = function () {
        if (!$scope.agentModel.agent_treasurer_name) {
            $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人姓名！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.agent_treasurer_phone) {
            $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人手机号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.agent_treasurer_cert_no) {
            $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人身份证号码！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.authorization_xingyeshujin_photo_id || !$scope.agentModel.authorization_xingyebank_photo_id) {
            $ionicPopup.alert({
                title: '提示',
                template: '请上传身份证！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.filter.Rule) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读协议并勾选同意！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.isChecked) {
            payingService.postAgentTreasurer($scope.model.id, $scope.agentModel).then(function (data) {
                //$scope.reloadModel();
                //$ionicPopup.alert({
                //    title: '警告',
                //    template: '保存成功，请等待管理员审核！',
                //    okType: 'button-assertive',
                //});
                //$state.go('app.user');
                //$scope.filter.tip = true;
                //$scope.loginOut()
                //$state.go('app.signin');
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxWan',
                    template: '<div class="alert-bind-info1">' +
                               '<div class="box">' +
                               '<h3>温馨提示</h3>' +
                               '<p>已完善业务授权信息，请进行下一步账户绑定</p>' +
                               '<ul>' +
                               '<li class="on"><i>1</i>编辑联系人信息</li>' +
                               '<li class="on"><i>2</i>机构认证</li>' +
                               '<li class="on"><i>3</i>业务授权</li>' +
                               '<li><i>4</i>账户绑定</li>' +
                               '</ul>' +
                               '<p class="tips">注：进行电票交易须完成四步信息填写，如无需电票交易则填写第一、二步信息即可。</p>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '取消',
                              onTap: function (e) {
                                  $state.go('app.user');
                              }
                          },
                          {
                              text: '进入下一步',
                              type: 'button-positive',
                              onTap: function (e) {
                                  $state.go('app.accountBind');
                              }
                          }
                    ]
                })
            });
        } else {
            payingService.updateAgentTreasurer($scope.model.id, $scope.agentModel).then(function (data) {
                //$scope.reloadModel();
                $ionicPopup.alert({
                    title: '警告',
                    template: '保存成功，请等待管理员审核！！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                $state.go('app.user');
                //$scope.filter.tip = true
            });
        }
    }

    $scope.updateAgent = function () {
        if ($scope.filter.update == false) {
            $scope.filter.update = true;
        }
        else {
            $scope.saveAgent();
        }
    }

    //图片放大弹框
    $ionicModal.fromTemplateUrl('imgMagnify.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.imgMagnifyModal = modal;
    });


    $scope.openImgMagnifyModal = function (img_path) {
        if (img_path) {
            $scope.imgMagnifyModal.show();
            $scope.img_path = img_path;
        }
    }

    $scope.closeImgMagnifyModal = function () {
        $scope.imgMagnifyModal.hide();
    }
});
ionicApp.controller('baCooController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getInvitationService, $ionicPopup) {


})
ionicApp.controller('bankQueryController', function ($rootScope, $scope, $state, $ionicPopup, bankService, addressService) {
    $scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;
    }
    $scope.model = {
        head_bank_id: null,
        city_id: null,
        province_id: null,
        keyword: null,
    }
    //精确查询
    $scope.queryPrecise = function () {
        if ($scope.model.precise_id.length != 12) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的行号，行号长度为12位！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        bankService.findSpecificBank($scope.model.precise_id).then(function (data) {
            if (data) {
                $scope.branchPreciseData = data;
            }
            else {
                $ionicPopup.alert({
                    title: '提示',
                    template: '查询结果为空，建议使用模糊查询！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }
        });
    }
    //根据总行，所在市，关键字找到对应的分行数据
    $scope.queryVague = function () {
        if ($scope.model.head_bank_id && $scope.model.province_id && $scope.model.city_id) {
            $scope.params = $scope.Params.Create();
            $scope.branchVagueData = [];
            $scope.loadMore();
        }
        else {
            $ionicPopup.alert({
                title: '提示',
                template: '请省份(直辖市)、市级、银行名称填写完整后查询！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        }
    }
    $scope.loadMore = function (first) {
        bankService.query($scope.params, $scope.model.head_bank_id, $scope.model.city_id, $scope.model.keyword).then(function (data) {
            $scope.hasMore = data.length == 10;
            $scope.branchVagueData = first ? data : $scope.branchVagueData.concat(data);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
        $scope.params.next();
    }
    //获取所有的省级地址
    addressService.queryAll().then(function (data) {
        $scope.ProvinceData = data;
    });
    //获取对应省的市
    $scope.provinceChange = function () {
        if ($scope.model.province_id == null) {
            return;
        }
        else {
            return addressService.getCity($scope.model.province_id).then(function (data) {
                $scope.CityData = data;
            });
        }
    }
    //获取对应市的区
    /*
    $scope.cityChange = function () {
        $scope.branchVagueData = [];
        
        if ($scope.model.city_id == null) {
            return;
        }
        else {
            return addressService.queryDstrict($scope.model.city_id).then(function (data) {
                $scope.AddressData = data;
            });
        }
        
    }*/

    //获取所有的银行账户总行信息
    bankService.queryAll().then(function (data) {
        $scope.bankData = data;
    });
});
ionicApp.controller('bannerCooperationController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getInvitationService, $ionicPopup) {
   

})
ionicApp.controller('bannerSecurityController', function ($scope, $rootScope, $state, $filter, $ionicHistory, $ionicPopup) {
    

})
ionicApp.controller('bannerSecuritysController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getInvitationService, $ionicPopup) {


})
ionicApp.controller('billDetailController', function ($rootScope, $scope, $state, billService) {
    $scope.model = {};
    alert($rootScope.billQuerybillProductId);
    billService.getBillProduct($rootScope.billQuerybillProductId).then(function (data) {
        $scope.model = data;
    });
});
ionicApp.controller('billOfferController', function ($scope, $rootScope, $state, $filter, $ionicPopup, billService, toolService, addressService) {
    Date.prototype.pattern = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份         
            "d+": this.getDate(), //日         
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
            "H+": this.getHours(), //小时         
            "m+": this.getMinutes(), //分         
            "s+": this.getSeconds(), //秒         
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度         
            "S": this.getMilliseconds() //毫秒         
        };
        var week = {
            "0": "日",
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    $scope.dateFilter = { date_index: 0 };
    $scope.dates = [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }];
    $scope.dateTimes = [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }];
    $scope.date = new Date();
    for (var i = 0; i < 5; i++) {
        $scope.dates[i].date = $scope.date.pattern("yyyy-MM-dd EE");
        $scope.dateTimes[i].date = $scope.date.pattern("yyyy-MM-dd");
        $scope.date.setDate(($scope.date.getDate() - 1));
    }

    if ($rootScope.hpxQBS == 202) {
        $scope.tab = 1;
    } else if ($rootScope.hpxQBS == 203) {
        $scope.tab = 2;
    } else if ($rootScope.hpxQBS == 204) {
        $scope.tab = 3;
    } else if ($rootScope.hpxQBS == 205) {
        $scope.tab = 4;
    }
    //$scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;
        $scope.doRefresh();
    }


    //手势滑动
    $scope.onSwipeLeft = function () {
        //alert($scope.tab)
        if ($scope.tab != 4) {
            $scope.setTab($scope.tab + 1);
        }
    }

    $scope.onSwipeRight = function () {
        //alert($scope.tab)
        if ($scope.tab != 1) {
            $scope.setTab($scope.tab - 1);
        }
    }
    $scope.onSwipeDown = function () {

        if ($scope.hasMore) {
            $socpe.loadMore();
        }
    }
    //$scope.locationModel = {
    //    city_id:'',
    //    city_name: "未知"
    //};
    $scope.filter = {
        billStyleId: ['202', '203', '204', '205'],
        search: 'search',
        publishingTimeS: '',
        publishingTimeB: '',
        enterpriseName: '',
        tradeLocationId: '',
        sort: -1,
        rate01: false,
        rate02: false,
        rate03: false,
        rate04: false,
        rate05: false,
        rate06: false,
    };
    $scope.is_vis = false;
    $scope.doRefresh = function () {
        //alert($scope.filter.sort)
        switch ($scope.filter.sort) {
            case -1:
                $scope.params = $scope.Params.Create('-offer_time', 10);
                break;
            case 0:
                if ($scope.filter.rate01) {
                    $scope.params = $scope.Params.Create('-offer_rate01', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate01', 10);
                }
                break;
            case 1:
                if ($scope.filter.rate02) {
                    $scope.params = $scope.Params.Create('-offer_rate02', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate02', 10);
                }
                break;
            case 2:
                if ($scope.filter.rate03) {
                    $scope.params = $scope.Params.Create('-offer_rate03', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate03', 10);
                }
                break;
            case 3:
                if ($scope.filter.rate04) {
                    $scope.params = $scope.Params.Create('-offer_rate04', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate04', 10);
                }
                break;
            case 4:
                if ($scope.filter.rate05) {
                    $scope.params = $scope.Params.Create('-offer_rate05', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate05', 10);
                }
                break;
            case 5:
                if ($scope.filter.rate06) {
                    $scope.params = $scope.Params.Create('-offer_rate06', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+offer_rate06', 10);
                }

        }
        $scope.listData202 = [];
        $scope.listData203 = [];
        $scope.listData204 = [];
        $scope.listData205 = [];

        // 时间判断
        var toDay = new Date()
        TY = toDay.getFullYear() + '-';
        TM = (toDay.getMonth() + 1 < 10 ? '0' + (toDay.getMonth() + 1) : toDay.getMonth() + 1) + '-';
        TD = toDay.getDate() < 10 ? '0' + toDay.getDate() : toDay.getDate();
        TDS = (toDay.getDate() + 1) < 10 ? '0' + (toDay.getDate() + 1) : (toDay.getDate() + 1);
        $scope.TDay = TY + TM + TD;
        $scope.TSDay = TY + TM + TDS;
        if ($scope.dateTimes[$scope.dateFilter.date_index].date == $scope.TDay) {
            //$scope.filter.publishingTimeS = $scope.dateTimes[$scope.dateFilter.date_index].date;
            var orDate = new Date(0)
            OY = orDate.getFullYear() + '-';
            OM = (orDate.getMonth() + 1 < 10 ? '0' + (orDate.getMonth() + 1) : orDate.getMonth() + 1) + '-';
            OD = orDate.getDate() < 10 ? '0' + orDate.getDate() : orDate.getDate();
            $scope.ODay = OY + OM + OD;
            $scope.filter.publishingTimeB = $scope.TSDay; //$scope.dateTimes[$scope.dateFilter.date_index].date;
            $scope.filter.publishingTimeS = $scope.ODay;
        } else {
            $scope.filter.publishingTimeS = $scope.dateTimes[$scope.dateFilter.date_index].date;
            var Hdate = new Date($scope.filter.publishingTimeS.replace(/-/g, "/"));
            var date2 = new Date(new Date().setDate(Hdate.getDate() + 1));
            var date_str = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate();
            $scope.filter.publishingTimeB = date_str;
        }

        $scope.loadMore();
    };
    $scope.isGeoLocation = false;
    //定位
    $scope.geoLocation = function () {
        baidumap_location.getCurrentPosition(function (result) {
            addressService.geoLocation(result.latitude, result.longitude).then(function (data) {
                if (data) {
                    $scope.isGeoLocation = true;
                    if (data.locationIdList) {
                        $scope.locationModel.province_name = data.locationIdList[0].provinceName;
                        $scope.locationModel.province_id = data.locationIdList[0].provinceId;
                        $scope.locationModel.city_id = data.locationIdList[0].citytId;
                        $scope.locationModel.city_name = data.locationIdList[0].cityName;
                    }
                        //直辖市
                    else if (data.districtId) {
                        $scope.locationModel.province_name = data.cityName;
                        $scope.locationModel.province_id = data.cityId
                        //$scope.locationModel.city_id = data.districtId;
                        $scope.locationModel.city_id = data.cityId;
                        $scope.locationModel.city_name = data.districtName;
                    }
                    else {
                        $scope.locationModel.province_name = data.cityName;
                        $scope.locationModel.province_id = data.cityId;
                        $scope.locationModel.city_name = data.cityName;
                        $scope.locationModel.city_id = data.cityId;
                    }
                    $scope.filter.locationId = $scope.locationModel.city_id;
                    $scope.doRefresh();
                } else {
                    $ionicPopup.alert({
                        title: '通知',
                        template: '该城市不在定位范围内！',
                        okType: 'button-assertive',
                    });
                }
            })
        }, function (err) {
            console.log(err);
        })
    }

    if (!$rootScope.billOfferSearchModel || !$rootScope.billOfferSearchModel.city_name) {
        $scope.locationModel = {
            city_id: '',
            city_name: "未知"
        };
        $scope.geoLocation();
    }
    else {
        $scope.locationModel = {
            city_name: $rootScope.billOfferSearchModel.city_name
        };
    }
    $scope.changeBillOfferId = function (billOfferId) {
        $rootScope.boId = true;
        $rootScope.billOfferbillOfferId = billOfferId;
    };
    /*
    searchBillOffer: function (params, search, publishingTimeS, publishingTimeB, billStyleId, enterpriseName, tradeLocationId)
    */
    $scope.show = [true, true, true];
    $scope.loadMore = function (first) {
        if ($rootScope.billOfferSearchModel) {
            if ($rootScope.billOfferSearchModel.city_id) {
                if ($rootScope.billOfferSearchModel.province_id == 1 || $rootScope.billOfferSearchModel.province_id == 20 || $rootScope.billOfferSearchModel.province_id == 860 || $rootScope.billOfferSearchModel.province_id == 2462) {
                    $scope.filter.tradeLocationId = $rootScope.billOfferSearchModel.province_id;
                }
                else {
                    $scope.filter.tradeLocationId = $rootScope.billOfferSearchModel.city_id;
                }
                $scope.locationModel.city_name = $rootScope.billOfferSearchModel.city_name;
            }

        }
        if ($scope.tab == 1) {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[0], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[0], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData202 = first ? data : $scope.listData202.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData202).length; i++) {
                    toolService.setStars2($scope.listData202[i]);
                };
            });
        }
        else if ($scope.tab == 2) {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[1], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[1], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData203 = first ? data : $scope.listData203.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData203).length; i++) {
                    toolService.setStars2($scope.listData203[i]);
                };
            });
        }
        else if ($scope.tab == 3) {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[2], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[2], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData204 = first ? data : $scope.listData204.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData204).length; i++) {
                    toolService.setStars2($scope.listData204[i]);
                };
            });
        }
        else {
            //billService.getHomeBillOffer($scope.filter.func, $scope.filter.billStyleId[3], $scope.filter.n).then(function (data) {
            billService.searchBillOffer2($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[3], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                for (item in data) {
                    data[item].offer_detail = JSON.parse(data[item].offer_detail);
                }
                $scope.listData205 = first ? data : $scope.listData205.concat(data);
                
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                for (var i = 0; i < ($scope.listData205).length; i++) {
                    toolService.setStars2($scope.listData205[i]);
                };
            });
        }
        $scope.params.next();
    };
    $scope.rateClick = function (func) {
        $scope.filter.sort = func;
        switch (func) {
            case 0:
                $scope.filter.rate01 = !$scope.filter.rate01;
                break;
            case 1:
                $scope.filter.rate02 = !$scope.filter.rate02;
                break;
            case 2:
                $scope.filter.rate03 = !$scope.filter.rate03;
                break;
            case 3:
                $scope.filter.rate04 = !$scope.filter.rate04;
                break;
            case 4:
                $scope.filter.rate05 = !$scope.filter.rate05;
                break;
            case 5:
                $scope.filter.rate06 = !$scope.filter.rate06;
                break;
        }
        $scope.doRefresh();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
});
ionicApp.controller('billOfferDetailController', function ($scope, $rootScope, $state, $filter, WEB_URL, $ionicPopup, billService, enterprisesService, toolService, customerService) {
    $scope.appraisalModel = {};
    $scope.cc = {
        isType1: true,
        isType2: true,
        isType3: true
    };
    $scope.changeBillStyleId = function (bill_style_id) {
        if (bill_style_id == 202) {
            $rootScope.hpxQBS = 202;
        } else if (bill_style_id == 203) {
            $rootScope.hpxQBS = 203;
        } else if (bill_style_id == 204) {
            $rootScope.hpxQBS = 204;
        } else if (bill_style_id == 205) {
            $rootScope.hpxQBS = 205;
        }
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
        if (!$rootScope.identity) {
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
            customerService.followEnterprise($scope.followModel).then(function () {
                $scope.findF00.is_collection_enterprise = follow;
            })
        }
    }

    if ($rootScope.boId) {
        billService.getBillOffer($rootScope.billOfferbillOfferId).then(function (data) {
            $scope.model = data;
            if (data.bill_style_id == 202) {
                $rootScope.hpxQBS = 202;
            } else if (data.bill_style_id == 203) {
                $rootScope.hpxQBS = 203;
            } else if (data.bill_style_id == 204) {
                $rootScope.hpxQBS = 204;
            } else if (data.bill_style_id == 205) {
                $rootScope.hpxQBS = 205;
            }
            $scope.findF00 = data;
            $scope.hpxTime = data.offer_time;
            toolService.getStars($scope.model.enterprise_id).then(function (data) {
                $scope.star = data;
            });
            $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
        });
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
ionicApp.controller('billOfferQueryController', function ($scope, $rootScope, $state, $ionicPopup, billService) {
    $scope.filter = {};

    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-offer_time', 10);
        //$scope.listData = [];
        $scope.loadMore();
    };
    $scope.loadMore = function (first) {
        //billService.getOwnBillOffer($scope.params, $scope.filter.billTypeId, $scope.filter.billStyleId, $scope.filter.maxPrice, $scope.filter.tradeLocationId, $scope.filter.keyword).then(function (data) {
        //    $scope.hasMore = data.length == 10;
        //    //for (item in data) {
        //    //    //console.log(data[item].offer_detail)
        //    //    console.log(JSON.parse(data[item].offer_detail))
        //    //    //data[item].offer_detail = JSON.parse(data[item].offer_detail);
        //    //}
        //    $scope.listData = first ? data : $scope.listData.concat(data);
        //    $scope.$broadcast('scroll.infiniteScrollComplete');
        //});
        //$scope.params.next();

        billService.getBillOfferBySelf().then(function (data) {
            if (data == null) {
                $scope.listData = data;
                //$state.go('app.newBillOffer');
            } else {
                $scope.listData = data.billOffers;
                for (item in data.billOffers) {
                    data.billOffers[item].offer_detail = JSON.parse(data.billOffers[item].offer_detail)
                }
            }
        })
        $scope.params.next();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);

    $scope.changeBillOfferId = function (billOfferId) {
        console.log("获取票据id")
        console.log(billOfferId)
        $rootScope.boId = true;
        $rootScope.billOfferbillOfferId = billOfferId;
    };

    //删除报价
    $scope.remove = function (data) {
        var confirmPopup = $ionicPopup.confirm({
            title: '注意',
            template: '确定要删除该报价吗?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                billService.deleteBillOffer(data.id).then(function (data) {
                    $scope.doRefresh();
                });
            }
        });
    }

    $scope.edit = function (data) {
        //跳转到报价详细信息
        $state.go('app.newBillOffer', { 'id': data.id });
    }

    // 跳转新建报价
    $scope.hpxXinZeng = function () {
        $state.go('app.onLines');
    }
});
ionicApp.controller('billOfferSearchCityController', function ($scope, $rootScope, $http, $state, $ionicPopup, addressService, $cordovaGeolocation, $ionicScrollDelegate) {
    $scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;
    }
    $scope.filter = {
        searchText: '',
        searchResult: [],
    }

    $scope.search = function () {
        //alert($scope.filter.searchText)
        if (!$scope.filter.searchText) {
            $scope.filter.searchResult = [];
            return;
        }
        addressService.citySearch($scope.filter.searchText).then(function (data) {
            if (data) {
                $scope.filter.searchResult = data;
            }
        })
    }
    $scope.isGeoLocation = false;
    $scope.geoLocation = function (func) {
        baidumap_location.getCurrentPosition(function (result) {
            addressService.geoLocation(result.latitude, result.longitude).then(function (data) {
                if (data) {
                    $scope.isGeoLocation = true;
                    $rootScope.billOfferSearchModel.geoLoca = true
                    //普通城市
                    if (data.locationIdList) {
                        $rootScope.billOfferSearchModel.province_name = data.locationIdList[0].provinceName;
                        $rootScope.billOfferSearchModel.province_id = data.locationIdList[0].provinceId;
                        $rootScope.billOfferSearchModel.city_id = data.locationIdList[0].cityId;
                        $rootScope.billOfferSearchModel.city_name = data.locationIdList[0].cityName;
                        addressService.queryCity($rootScope.billOfferSearchModel.province_id).then(function (data) {
                            $scope.CityData = data;
                        });
                    }
                    //直辖市
                    else if (data.districtId) {
                        $rootScope.billOfferSearchModel.province_name = data.cityName;
                        $rootScope.billOfferSearchModel.province_id = data.cityId
                        $rootScope.billOfferSearchModel.city_id = data.districtId;
                        $rootScope.billOfferSearchModel.city_name = data.districtName;
                        addressService.queryCity($rootScope.billOfferSearchModel.province_id + 1).then(function (data) {
                            $scope.CityData = data;
                        });
                    }
                    //特别行政区
                    else {
                        $rootScope.billOfferSearchModel.province_name = data.cityName;
                        $rootScope.billOfferSearchModel.province_id = data.cityId;
                    }
                    if (func) {
                        $scope.submit();
                    }
                }
                else {
                    $ionicPopup.alert({
                        title: '通知',
                        template: '该城市不在定位范围内！',
                        okType: 'button-assertive',
                    });
                }
            })
        }, function (err) {
            console.log(err);
        })
    }
    //$scope.geoLocation();

    //热门城市
    $scope.hotCity = function (location_id, location_name) {
        $rootScope.billOfferSearchModel.geoLoca = false;
        $scope.isGeoLocation = false;
        if (!location_id) {
            $rootScope.billOfferSearchModel.province_id = null;
            $rootScope.billOfferSearchModel.province_name = '';
            $rootScope.billOfferSearchModel.city_id = null;
            $rootScope.billOfferSearchModel.city_name = '全国';
        }
        else {
            if (location_id == 1 || location_id == 20 || location_id == 860 || location_id == 2462) {
                $rootScope.billOfferSearchModel.province_id = location_id;
                $rootScope.billOfferSearchModel.province_name = location_name;
                $rootScope.billOfferSearchModel.city_id = location_id;
                $rootScope.billOfferSearchModel.city_name = location_name;
                $scope.setProvince(location_id, location_name);
            }
            else {
                if (location_id == 1007) {
                    $rootScope.billOfferSearchModel.province_id = 1006;
                    $rootScope.billOfferSearchModel.province_name = '浙江省';
                }
                else if (location_id == 2132 || location_id == 2158) {
                    $rootScope.billOfferSearchModel.province_id = 2131;
                    $rootScope.billOfferSearchModel.province_name = '广东省';
                }
                $scope.setProvince($rootScope.billOfferSearchModel.province_id, $rootScope.billOfferSearchModel.province_name);
                $rootScope.billOfferSearchModel.city_id = location_id;
                $rootScope.billOfferSearchModel.city_name = location_name;
            }
        }
        $scope.submit();
    }
    //获取对应的省区的市级地址
    $scope.setProvince = function (province_id, province_name) {
        $scope.isGeoLocation = false;
        $rootScope.billOfferSearchModel.province_id = province_id;
        $rootScope.billOfferSearchModel.province_name = province_name;
        //$rootScope.billOfferSearchModel.city_id = null;
        //$rootScope.billOfferSearchModel.city_name = '';
        if (province_id == null) {
            return;
        } else if (province_id == 1 || province_id == 20 || province_id == 860 || province_id == 2462) {
            $scope.CityData = [{ id: province_id, parent_address_id: province_id + 1, address_name: province_name }]
            province_id = province_id + 1;
            return addressService.queryCity(province_id).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    //console.log(data[i]);
                    $scope.CityData.push(data[i]);
                }
            });
        } else {
            return addressService.queryCity(province_id).then(function (data) {
                $scope.CityData = data;
            });
        }
    }
    $scope.setCity = function (city_id, city_name) {
        $rootScope.billOfferSearchModel.geoLoca = false;
        $scope.isGeoLocation = false;
        $rootScope.billOfferSearchModel.city_name = city_name;
        if ($rootScope.billOfferSearchModel.province_id == 1 || $rootScope.billOfferSearchModel.province_id == 20 || $rootScope.billOfferSearchModel.province_id == 860 || $rootScope.billOfferSearchModel.province_id == 2462) {
            $rootScope.billOfferSearchModel.city_id = $rootScope.billOfferSearchModel.province_id;
        } else {
            $rootScope.billOfferSearchModel.city_id = city_id;
        }
        $scope.submit();
    }

    if (!$rootScope.billOfferSearchModel || $rootScope.billOfferSearchModel.geoLoca) {
        $rootScope.billOfferSearchModel = {
            province_name: '',
            city_name: '',
        }
        $scope.geoLocation();
        //获取所有省区地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
        });
    }
    else if ($rootScope.billOfferSearchModel.province_id && $rootScope.billOfferSearchModel.province_name) {
        //获取所有省区地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
            $scope.setProvince($rootScope.billOfferSearchModel.province_id, $rootScope.billOfferSearchModel.province_name)
        });
    }
    else {
        //获取所有省区地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
        });
    }
    $scope.submit = function () {
        $state.go('app.billOffer');
    }
    //滑动轮回到顶部
    $scope.scrollCityToTop = function () {
        $ionicScrollDelegate.$getByHandle('city').scrollTop();
    };
})
ionicApp.controller('billQueryController', function ($scope, $rootScope, $state, $filter, $ionicPopup, billService, addressService, $cordovaGeolocation, $ionicGesture) {
    //date类型转换
    Date.prototype.pattern = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份         
            "d+": this.getDate(), //日         
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
            "H+": this.getHours(), //小时         
            "m+": this.getMinutes(), //分         
            "s+": this.getSeconds(), //秒         
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度         
            "S": this.getMilliseconds() //毫秒         
        };
        var week = {
            "0": "日",
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    $scope.dateFilter = { date_index: 0 };
    $scope.dates = [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }];
    $scope.dateTimes = [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }];
    $scope.date = new Date();
    for (var i = 0; i < 5; i++) {
        $scope.dates[i].date = $scope.date.pattern("yyyy-MM-dd EE");
        $scope.dateTimes[i].date = $scope.date.pattern("yyyy-MM-dd");
        $scope.date.setDate(($scope.date.getDate() - 1));
    }

    $scope.filter = {
        acceptorTypeID: '',
        billStatusAll: true,
        tradeTypeCode: '',
        //billTypeID: ['101', '102'],
        billTypeID: '',
        billStatusCode: '801',
        billCharacterCode: '',
        billStyleID: '',
        sort: -1,
        priceArrow: true,
        deadlineTimeArrow: false,
        locationId: ''
    };
    $scope.is_vis = false; // 没有数据时候的显示与隐藏
    $scope.doRefresh = function () {
        switch ($scope.filter.sort) {
            case -1:
                $scope.params = $scope.Params.Create("-publishing_time", 10);
                break;
            case 0:
                if ($scope.filter.priceArrow) {
                    $scope.params = $scope.Params.Create('-bill_sum_price', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+bill_sum_price', 10);
                }
                break;
            case 1:
                if ($scope.filter.deadlineTimeArrow) {
                    $scope.params = $scope.Params.Create('-deadline_time', 10);
                }
                else {
                    $scope.params = $scope.Params.Create('+deadline_time', 10);
                }
                break;
        }
        $scope.listData = [];
        //$scope.listData102 = [];
        $scope.loadMore();
    };
    $scope.isGeoLocation = false;

    // 判断是否登录  电票
    $scope.hpxRelBill = function (item) {
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
            $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.id ,'check':3});
        }
    };

    //定位
    $scope.geoLocation = function () {
        baidumap_location.getCurrentPosition(function (result) {
            addressService.geoLocation(result.latitude, result.longitude).then(function (data) {
                if (data) {
                    $scope.isGeoLocation = true;
                    if (data.locationIdList) {
                        $scope.locationModel.province_name = data.locationIdList[0].provinceName;
                        $scope.locationModel.province_id = data.locationIdList[0].provinceId;
                        $scope.locationModel.city_id = data.locationIdList[0].citytId;
                        $scope.locationModel.city_name = data.locationIdList[0].cityName;
                    }
                    //直辖市
                    else if (data.districtId) {
                        $scope.locationModel.province_name = data.cityName;
                        $scope.locationModel.province_id = data.cityId
                        //$scope.locationModel.city_id = data.districtId;
                        $scope.locationModel.city_id = data.cityId;
                        $scope.locationModel.city_name = data.districtName;
                    }
                    else {
                        $scope.locationModel.province_name = data.cityName;
                        $scope.locationModel.province_id = data.cityId;
                        $scope.locationModel.city_name = data.cityName;
                        $scope.locationModel.city_id = data.cityId;
                    }
                    $scope.filter.locationId = $scope.locationModel.city_id;
                    $scope.doRefresh();
                } else {
                    $ionicPopup.alert({
                        title: '通知',
                        template: '该城市不在定位范围内！',
                        okType: 'button-assertive',
                    });
                }
            })
        }, function (err) {
            console.log(err);
        })
    }

    if (!$rootScope.billSearchModel || !$rootScope.billSearchModel.city_name) {
        $scope.locationModel = {
            city_id: '',
            city_name: "未知"
        };
        $scope.geoLocation();
    }
    else {
        $scope.locationModel = {
            city_name: $rootScope.billSearchModel.city_name
        };
    }


    $rootScope.billQuerybillProductId = null;
    $scope.changeBillProductId = function (billProductId) {
        $rootScope.billQuerybillProductId = billProductId;
    };

    $scope.show = true;
    $scope.loadMore = function (first) {
        if ($rootScope.billSearchModel) {
            if ($rootScope.billSearchModel.city_id) {
                if ($rootScope.billSearchModel.province_id == 1 || $rootScope.billSearchModel.province_id == 20 || $rootScope.billSearchModel.province_id == 860 || $rootScope.billSearchModel.province_id == 2462) {
                    $scope.filter.locationId = $rootScope.billSearchModel.province_id;
                }
                else {
                    $scope.filter.locationId = $rootScope.billSearchModel.city_id;
                }
                $scope.locationModel.city_name = $rootScope.billSearchModel.city_name;
            }
        }

        billService.searchBillProduct($scope.params, $scope.filter.billTypeID, $scope.filter.billStyleID, $scope.filter.billStatusCode, $scope.filter.acceptorTypeID, $scope.filter.locationId, $scope.filter.tradeTypeCode, $scope.filter.billCharacterCode, $scope.filter.billFlawID).then(function (data) {
            $scope.products = data;
            if (data.length == 0) {
                $scope.is_vis = true;
            } else {
                $scope.is_vis = false;
            }
            $scope.hasMore = data.length == 10;
            
            $scope.listData = first ? $scope.products : $scope.listData.concat($scope.products);
            $scope.$broadcast('scroll.infiniteScrollComplete')
            $scope.params.next();
            $scope.$broadcast('scroll.refreshComplete')
        });
    };

    $scope.sort = 0;
    $scope.priceArrow = true;
    $scope.changeArrow = function (func) {
        switch (func) {
            case 'price':
                $scope.filter.sort = 0;
                $scope.filter.priceArrow = !$scope.filter.priceArrow;
                break;
            case 'deadline_time':
                $scope.filter.sort = 1;
                $scope.filter.deadlineTimeArrow = !$scope.filter.deadlineTimeArrow;
                break;
        }
        $scope.doRefresh();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
});
ionicApp.controller('billSearchCityController', function ($scope, $rootScope, $state, $ionicPopup, addressService, $cordovaGeolocation, $ionicScrollDelegate) {
    $scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;

    }
    $scope.filter = {
        searchText: '',
        searchResult: [],
    }

    $scope.search = function () {
        //alert($scope.filter.searchText)
        if (!$scope.filter.searchText) {
            $scope.filter.searchResult = [];
            return;
        }
        addressService.citySearch($scope.filter.searchText).then(function (data) {
            if (data) {
                $scope.filter.searchResult = data;
            }
        })
    }
    $scope.isGeoLocation = false;
    $scope.geoLocation = function (func) {
        baidumap_location.getCurrentPosition(function (result) {
            addressService.geoLocation(result.latitude, result.longitude).then(function (data) {
                if (data) {
                    $scope.isGeoLocation = true;
                    $rootScope.billSearchModel.geoLoca = true
                    //普通城市
                    if (data.locationIdList) {
                        $rootScope.billSearchModel.province_name = data.locationIdList[0].provinceName;
                        $rootScope.billSearchModel.province_id = data.locationIdList[0].provinceId;
                        $rootScope.billSearchModel.city_id = data.locationIdList[0].cityId;
                        $rootScope.billSearchModel.city_name = data.locationIdList[0].cityName;
                        addressService.queryCity($rootScope.billSearchModel.province_id).then(function (data) {
                            $scope.CityData = data;
                        });
                    }
                    //直辖市
                    else if (data.districtId) {
                        $rootScope.billSearchModel.province_name = data.cityName;
                        $rootScope.billSearchModel.province_id = data.cityId
                        $rootScope.billSearchModel.city_id = data.districtId;
                        $rootScope.billSearchModel.city_name = data.districtName;
                        addressService.queryCity($rootScope.billSearchModel.province_id + 1).then(function (data) {
                            $scope.CityData = data;
                        });
                    }
                    //特别行政区
                    else {
                        $rootScope.billSearchModel.province_name = data.cityName;
                        $rootScope.billSearchModel.province_id = data.cityId;
                    }
                    if (func) {
                        $scope.submit();
                    }
                }
                else {
                    $ionicPopup.alert({
                        title: '通知',
                        template: '该城市不在定位范围内！',
                        okType: 'button-assertive',
                    });
                }
            })
        }, function (err) {
            console.log(err);
        })
    }
    //获取对应的省下所有的市级地址
    $scope.setProvince = function (province_id, province_name) {
        $scope.isGeoLocation = false;
        $rootScope.billSearchModel.province_name = province_name;
        $rootScope.billSearchModel.province_id = province_id;
        if (province_id == null) {
            return;
        }
        else if (province_id == 1 || province_id == 20 || province_id == 860 || province_id == 2462) {
            $scope.CityData = [{ id: province_id, parent_address_id: province_id + 1, address_name: province_name }]
            province_id = province_id + 1;
            return addressService.queryCity(province_id).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    //console.log(data[i]);
                    $scope.CityData.push(data[i]);
                }
                //$scope.CityData = data;
            });
        }
        else {
            return addressService.queryCity(province_id).then(function (data) {
                $scope.CityData = data;
            });
        }
    }
    $scope.setCity = function (city_id, city_name, province_id, province_name) {
        $rootScope.billSearchModel.geoLoca = false;
        $scope.isGeoLocation = false;
        if (province_id && province_name) {
            $rootScope.billSearchModel.province_id = province_id;
            $rootScope.billSearchModel.province_name = province_name;
        }
        $rootScope.billSearchModel.city_name = city_name;
        if ($rootScope.billSearchModel.province_id == 1 || $rootScope.billSearchModel.province_id == 20 || $rootScope.billSearchModel.province_id == 860 || $rootScope.billSearchModel.province_id == 2462) {
            $rootScope.billSearchModel.city_id = $rootScope.billSearchModel.province_id;
        } else {
        $rootScope.billSearchModel.city_id = city_id;
        }
        $scope.submit();
    }
    //热门城市
    $scope.hotCity = function (location_id, location_name) {
        $rootScope.billSearchModel.geoLoca = false;
        $scope.isGeoLocation = false;
        if (!location_id) {
            $rootScope.billSearchModel.province_id = null;
            $rootScope.billSearchModel.province_name = '';
            $rootScope.billSearchModel.city_id = null;
            $rootScope.billSearchModel.city_name = '全国';
        }
        else {
            if (location_id == 1 || location_id == 20 || location_id == 860 || location_id == 2462) {
                $rootScope.billSearchModel.province_id = location_id;
                $rootScope.billSearchModel.province_name = location_name;
                $rootScope.billSearchModel.city_id = location_id;
                $rootScope.billSearchModel.city_name = location_name;
                $scope.setProvince(location_id, location_name);
            }
            else {
                if (location_id == 1007) {
                    $rootScope.billSearchModel.province_id = 1006;
                    $rootScope.billSearchModel.province_name = '浙江省';
                }
                else if (location_id == 2132 || location_id == 2158) {
                    $rootScope.billSearchModel.province_id = 2131;
                    $rootScope.billSearchModel.province_name = '广东省';
                }
                $scope.setProvince($rootScope.billSearchModel.province_id, $rootScope.billSearchModel.province_name);
                $rootScope.billSearchModel.city_id = location_id;
                $rootScope.billSearchModel.city_name = location_name;
            }
        }
        $scope.submit();
    }
    if (!$rootScope.billSearchModel || $rootScope.billSearchModel.geoLoca) {
        $rootScope.billSearchModel = {
            province_name: '',
            city_name: '',
        }
        $scope.geoLocation();
        //获取所有的省级地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
        });
    }
    else if ($rootScope.billSearchModel.province_id && $rootScope.billSearchModel.province_name) {
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
            $scope.setProvince($rootScope.billSearchModel.province_id, $rootScope.billSearchModel.province_name)
        })
    }
    else {
        //获取所有的省级地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
        });
    }
    $scope.submit = function () {
        $state.go('app.billQuery');
    }

    //滑动轮回到顶部
    $scope.scrollCityToTop = function () {
        $ionicScrollDelegate.$getByHandle('city').scrollTop();
    };
})
ionicApp.controller('businessQueryController', function ($rootScope, $scope, $state, $ionicPopup, $ionicModal, API_URL, customerService, privilegeService, payingService) {
    //公商查询
    $scope.query = function (name) {
        if (!name || name.length < 4) {
            $ionicPopup.alert({
                title: '提示',
                template: '至少输入四个关键字！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        // 发送查询权限的请求
        privilegeService.customerPrivilege({
            'privilege_id': 1
        }).then(function (data) {
            console.log(data)
            if (data.right == 0) {
                if (data.isuser == 0) {
                    // 前往登录
                    var myPopup = $ionicPopup.show({
                        cssClass: 'hpxQuan',
                        template: '<div class="hpxPermis">' +
                                   '<div class="box0">' +
                                   '<h4>温馨提示</h4>' +
                                   '<section>您的“工商查询”工具使用权限已用完！请登录</section>' +
                                   '</div>' +
                                   '</div>',
                        scope: $scope,
                        buttons: [
                              {
                                  text: '取消',
                                  type: 'button-royal',
                                  onTap: function (e) {

                                  }
                              },
                              {
                                  text: '前往登录',
                                  type: 'button-positive',
                                  onTap: function (e) {
                                      $state.go('app.signin');
                                  }
                              }
                        ]
                    })
                } else {
                    if (data.enterprise_id <= 0) {
                        // 前往认证
                        var myPopup = $ionicPopup.show({
                            cssClass: 'hpxQuan',
                            template: '<div class="hpxPermis">' +
                                       '<div class="box">' +
                                       '<h4>温馨提示</h4>' +
                                       '<section>您的“工商查询”工具使用权限已用完！请进行机构认证</section>' +
                                       '</div>' +
                                       '</div>',
                            scope: $scope,
                            buttons: [
                                  {
                                      text: '取消',
                                      type: 'button-royal',
                                      onTap: function (e) {

                                      }
                                  },
                                  {
                                      text: '前往认证',
                                      type: 'button-positive',
                                      onTap: function (e) {
                                          $state.go('app.accredit');
                                      }
                                  }
                            ]
                        })
                    } else {
                        // 前往购买
                        var myPopup = $ionicPopup.show({
                            cssClass: 'hpxQuan hpxQing',
                            template: '<div class="hpxPermis">' +
                                       '<div class="box">' +
                                       '<h4>温馨提示</h4>' +
                                       '<section style="line-height:26px;">您的“工商查询”工具免费使用时限已到期，可通过两种方式进行续期：<strong style="display:block;">①现金充值购买使用权限；</strong><strong style="display:block;">②参与“邀请朋友免费获取工具使用权限”活动。</strong></section>' +
                                       '</div>' +
                                       '</div>',
                            scope: $scope,
                            buttons: [
                                  {
                                      text: '现金购买',
                                      type: 'button-calm',
                                      onTap: function (e) {
                                          // 查询购买套餐
                                          privilegeService.privilegePackage({
                                              'privilege_id': 1
                                          }).then(function (data) {
                                              console.log("套餐详情")
                                              console.log(data)
                                              $scope.hpxPack(data[0])
                                              $scope.package = data

                                          })
                                          $scope.buyModal.show();
                                      }
                                  },
                                  {
                                      text: '邀请朋友',
                                      type: 'button-royal',
                                      onTap: function (e) {
                                          $state.go('app.promoteEvent');
                                      }
                                  }
                            ]
                        })
                    }
                }
            } else {
                customerService.enterpriseDetail(name, 1).then(function (data) {
                    $scope.enterpriseInfo = data;
                    if (data == null) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '查询无结果！',
                            okText: '确    定',
                            cssClass: 'hpxModal'
                        });
                    }
                });
            }
        })
    }
    //详细弹框
    $ionicModal.fromTemplateUrl('detail.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.detailModal = modal;
    });

    $scope.openDetailModal = function (data) {
        customerService.enterpriseDetail(data['name'], 0).then(function (data) {
            $scope.enterpriseDetailInfo = data;
            $scope.detailModal.show();
        });
    }
    $scope.closeDetailModal = function () {
        $scope.detailModal.hide();
    }
    //权限的弹窗
    $ionicModal.fromTemplateUrl('buyPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.buyModal = modal;
    });
    $scope.buy = function () {
        // 获取账户余额
        payingService.GetPlatformAccount().then(function (data) {
            $scope.hpxMoney = data;
            var price = $scope.price;
            var hitems = $scope.items;
            if ($scope.hpxMoney.platform_account_balance >= price) {
                privilegeService.privilegePackOrder({
                    'enterprise_id': $rootScope.identity.enterprise_id,
                    'customer_id': $rootScope.identity.customer_id,
                    'package_id': hitems
                }).then(function (data) {
                    //购买成功
                    $ionicPopup.alert({
                        title: '提示',
                        template: '恭喜您！已完成购买，可以使用“工商查询”工具！',
                        okText: '确    定',
                        onTap: function () {
                            $scope.buyModal.hide();
                        },
                        cssClass: 'hpxModal'
                    });
                })
            } else {
                // 平台余额不足
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxQuan',
                    template: '<div class="hpxPermis">' +
                               '<div class="box">' +
                               '<h4>温馨提示</h4>' +
                               '<section>您的账户余额不足，请充值！！！</section>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '取消',
                              type: 'button-royal',
                              onTap: function (e) {

                              }
                          },
                          {
                              text: '前往充值',
                              type: 'button-positive',
                              onTap: function (e) {
                                  $scope.buyModal.hide();
                                  $state.go('app.recharge');
                              }
                          }
                    ]
                })
            }
        })
    }
    $scope.hpxPack = function (hPack) {
        console.log(hPack.id)
        console.log(hPack.package_price)
        $scope.items = hPack.id
        $scope.price = hPack.package_price
    }
    $scope.refresh = function () {
        $('.h_bty section').eq(0).find('input[name = "sex"]').attr('checked', 'true')
    }

});

ionicApp.controller('calculatorController', function ($rootScope, $scope, $state, $ionicPopup, toolService, $ionicModal) {
    $scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;
        $scope.changeMode(index - 1);
    }
    //计算时用的数字的栈
    $scope.num = [];
    //接受输入用的运算符栈
    $scope.opt = [];
    //计算器计算结果
    $scope.result = '';
    //表示是否要重新开始显示,为true表示不重新显示，false表示要清空当前输出重新显示数字
    $scope.flag = true;
    //表示当前是否可以再输入运算符，如果可以为true，否则为false
    $scope.isOpt = true;
    //显示计算器样式
    var date = new Date();
    //alert(date);
    //date.setHours(date.getHours() + 8);
    //alert(date);
    //date.setDate(date.getDate() - 1);
    //alert(date);
    var tormorrow = new Date();
    //alert(tormorrow);
    tormorrow.setDate(date.getDate() + 1);
    //alert(tormorrow);
    $scope.model = {
        /*
        start_date: date,
        start_time: date.toISOString().slice(0, 10),/*toLocaleDateString().replace('/','-').replace('/','-')
        end_date: tormorrow,
        end_time: tormorrow.toISOString().slice(0, 10),/*toLocaleDateString().replace('/', '-').replace('/', '-'),*/
        interest_type: "year",
        bill_type: "elec",
        adjust_day: 0,
        days: "",
    };


    //alert($scope.model.start_date);
    //alert($scope.model.start_time);
    //alert($scope.model.end_date);
    //alert($scope.model.end_time);
    $scope.initModel = {};
    angular.copy($scope.model, $scope.initModel);
    /*
    $scope.model.start_date = date,
    $scope.model.start_time = date.toISOString().slice(0, 10);/*toLocaleDateString().replace('/','-').replace('/','-')
    $scope.model.end_date = tormorrow;
    $scope.model.end_time = tormorrow.toISOString().slice(0, 10);/*toLocaleDateString().replace('/', '-').replace('/', '-'),*/
    $scope.chooseMany = 0;
    $scope.interestTypes = [{ type: 'year', name: '年利率' }, { type: 'month', name: '月利率' }];
    $scope.billTypes = [{ type: 'elec', name: '电票' }, { type: 'paper', name: '纸票' }];
    $scope.changeType = function (type) {
        if ($scope.chooseMany == 0) {
            switch (type) {
                case "year":
                    $scope.model.interest_type = 'year'; $scope.model.bill_type = 'elec'; $scope.model.adjust_day = 0;
                    break;
                case "month":
                    $scope.model.interest_type = 'month'; $scope.model.bill_type = 'paper'; $scope.model.adjust_day = 3;
                    break;
                case "elec":
                    $scope.model.bill_type = 'elec'; $scope.model.adjust_day = 0; $scope.model.interest_type = 'year';
                    break;
                case "paper":
                    $scope.model.bill_type = 'paper'; $scope.model.adjust_day = 3; $scope.model.interest_type = 'month';
                    break;
            }
        }
        else {
            switch (type) {
                case "elec":
                    $scope.model.bill_type = 'elec'; $scope.model.interest_type = 'year'; $scope.model.adjust_day = 0;
                    break;
                case "paper":
                    $scope.model.bill_type = 'paper'; $scope.model.interest_type = 'month'; $scope.model.adjust_day = 3;
                    break;
                case "year":
                    $scope.model.interest_type = 'year'; $scope.model.bill_type = 'elec';
                    break;
                case "month":
                    $scope.model.interest_type = 'month'; $scope.model.bill_type = 'paper';
                    break;
            }
        }
    }

    $scope.$watch('model.start_date', function (newValue, oldValue) {
        /*
            toISOString().slice(0, 10)会减一天;
            实际上start-time比start-date少一天
        */
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        //if ($scope.model.start_time instanceof Date) {
        /*
        var dateValue = new Date();
        dateValue.setHours(newValue.getHours() + 8);
        dateValue.setDate(dateValue.getDate() - 1);
        */
        if (newValue == null) $scope.model.start_time = null;
        else {
            /*
            $scope.model.start_time = newValue/*.toISOString().slice(0, 10);//toLocaleDateString().replace('/', '-').replace('/', '-');
            alert($scope.model.start_time);*/
            $scope.model.start_time = newValue.toISOString().slice(0, 10);//toLocaleDateString().replace('/', '-').replace('/', '-');
            //alert($scope.model.start_time);
        }
        $scope.onTimeSet($scope.model.start_time, 'start_time');
        //}
    });
    $scope.$watch('model.end_date', function (newValue, oldValue) {
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        if (newValue == null) $scope.model.end_time = null;
        else $scope.model.end_time = newValue.toISOString().slice(0, 10);;//toLocaleDateString().replace('/', '-').replace('/', '-');
        $scope.onTimeSet($scope.model.end_time, 'end_time');
    });
    $scope.$watch('model.many_start_date', function (newValue, oldValue) {
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        if (newValue == null) $scope.model.many_start_time = null;
        else {
            /*
            $scope.model.many_start_time = newValue/*.toISOString().slice(0, 10); //toLocaleDateString().replace('/', '-').replace('/', '-');
            alert($scope.model.many_start_time);
            */
            $scope.model.many_start_time = newValue.toISOString().slice(0, 10);
            //alert($scope.model.many_start_time);
        }
        $scope.onTimeSet($scope.model.many_start_time, 'many_start_time');
    });
    $scope.$watch('model.many_end_date', function (newValue, oldValue) {
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        if (newValue == null) $scope.model.many_end_time = null;
        else $scope.model.many_end_time = newValue.toISOString().slice(0, 10); //toLocaleDateString().replace('/', '-').replace('/', '-');
        $scope.onTimeSet($scope.model.many_end_time, 'many_end_time');
    });

    //选择时间，请求是否假期
    $scope.onTimeSet = function (newDate, key) {
        if (newDate == null) {
            $scope.model[key + '_tip'] = '';
            return;
        }
        toolService.isCalendarSpecial(newDate).then(function (data) {
            $scope.model[key + '_tip'] = data.holiday_name;
        });
    }
    /*
    //手机端<input type=date 对ng-change无响应,导致即时判断是否为节假日暂时无法实现。。
    $scope.changeTime = function (time, key) {
        alert("changeTime");
        alert(time);
        var date = new Date(time);
        alert(date);
        date = date.toISOString();
        alert(date);
        date = date.toISOString().slice(0, 10);
        alert(date);
        switch (key) {
            case "start_time":
                $scope.model.start_time = date;
                break;
            case "end_time":
                $scope.model.end_time = date;
                break;
            case "many_start_time":
                $scope.model.many_start_time = date;
                break;
            case "many_end_time":
                $scope.model.many_end_time = date;
                break;
        }
    }
    */
    $scope.calcuInterest = function (func) {
        var query = {};
        angular.copy($scope.model, query);
        if (!$scope.model.denomination) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入票面金额！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        //通过利率计算
        if (!func) {
            if (!$scope.model.interest) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入利率！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }

            if (!$scope.model.start_time || !$scope.model.end_time) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入开始和结束时间！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }
            if (parseInt($scope.model.start_time.replace(/-/g, "")) >= parseInt($scope.model.end_time.replace(/-/g, ""))) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '贴现时间必须小于到期时间！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }
            if ($scope.model.interest) {
                query['interest_year'] = null;
                query['interest_month'] = null;
                query['interest_' + $scope.model.interest_type] = query.interest;
            }
        } else {
            //十万计算
            if (!$scope.model.every_plus) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入贴息！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }
            query.start_time = null;
            query.end_time = null;
            if ($scope.model.many_start_time && $scope.model.many_end_time) {
                if (parseInt($scope.model.many_start_time.replace(/-/g, "")) >= parseInt($scope.model.many_end_time.replace(/-/g, ""))) {

                    $ionicPopup.alert({
                        title: '提示',
                        template: '贴现时间必须小于到期时间！',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    return;
                }
                query.start_time = $scope.model.many_start_time;
                query.end_time = $scope.model.many_end_time;
            }
            else {
                toolService.calculator(query, func).then(function (data) {
                    $scope.interestResult = {
                        discount_interest: data.discount_interest,
                        discount_amount: data.discount_amount
                    }

                });
                return;
            }
        }

        toolService.calculator(query, func).then(function (data) {
            $scope.interestResult = data;
        });
    }

    //重置表单
    $scope.clear = function () {
        angular.copy($scope.initModel, $scope.model);
        $scope.interestResult = "";
    }

    $scope.changeMode = function (mode) {
        $scope.chooseMany = mode;
        $scope.clear();
    }

    //再计算
    $scope.calculatorAgain = function (func) {
        if (!func) {
            $scope.model.interest = Number($scope.interestResult['interest_' + $scope.model.interest_type]);
            $scope.model.start_date = $scope.model.many_start_date;
            $scope.model.start_time = $scope.model.many_start_time;
            $scope.model.end_date = $scope.model.many_end_date;
            $scope.model.end_time = $scope.model.many_end_time;
            /*
            $scope.model = {
                denomination: $scope.model.denomination,
                interest_type: $scope.model.interest_type,
                bill_type: $scope.model.bill_type,
                every_plus: $scope.model.every_plus,
                commission: $scope.model.commission,
            };
            */
            $scope.tab = 1;
            $scope.chooseMany = 0;
        }
        else {
            $scope.model.every_plus = Number($scope.interestResult.every_plus_amount),
            $scope.model.many_start_date = $scope.model.start_date;
            $scope.model.many_start_time = $scope.model.start_time;
            $scope.model.many_end_date = $scope.model.end_date;
            $scope.model.many_end_time = $scope.model.end_time;
            /*
            $scope.model = {
                denomination: $scope.model.denomination,
                interest_type: $scope.model.interest_type,
                bill_type: $scope.model.bill_type,
            };
            */
            $scope.tab = 2;
            $scope.chooseMany = 1;
        }
        $scope.calcuInterest(func);
    }

    //计算器弹框
    $ionicModal.fromTemplateUrl('calc.html', {
        scope: $scope,
        //animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.calcModal = modal;
        $scope.calcHeight = $(window).get(0).innerHeight + 6;
        console.log($scope.calcHeight)
    });

    $scope.openCalcModal = function (number) {
        if (number) {
            $scope.calcModal.show();
            $scope.number = number;
            $scope.result = $scope.number;
            $scope.num.push($scope.number);
        }
    }

    $scope.closeCalcModal = function () {
        $scope.calcModal.hide();
    }
    $scope.data = {
        "1": ["AC", "+/-", "%", "÷"],
        "2": ["7", "8", "9", "×"],
        "3": ["4", "5", "6", "－"],
        "4": ["1", "2", "3", "＋"],
        "5": ["返回","0", ".", "="]
    };
  
    $scope.showClass = function (index, a) {
        if (a == 0) {
            return "zero";
        }
        return index == 3 || a == "=" ? "end-no" : "normal";
    };
    $scope.init=function(){
        $scope.num = [];
        
        $scope.opt=[];
        $scope.flag = true;
        $scope.isOpt = true;
        $scope.point = false;

    };
    $scope.showResult = function (a) {
        var reg = /\d/ig, regDot = /\./ig, regAbs = /\//ig;
        //如果点击的是个数字
        if (reg.test(a)) {
            //消除冻结
            if ($scope.isOpt == false) {
                $scope.isOpt = true;
            }
            if ($scope.result != 0 && $scope.flag && $scope.result != "error") {
                $scope.result += a;
            }
            else if ($scope.point == true && $scope.flag && $scope.result != 'error') {
                $scope.result += a;
                $scope.point = false;
            }
            else {
                $scope.result = a;
                $scope.flag = true;
            }
        }
            //如果点击的是AC
        else if (a == "AC") {
            $scope.result = '';
            $scope.result += 0;
            $scope.init();
        }
        else if (a == ".") {
            if ($scope.result != "" && $scope.flag && !regDot.test($scope.result)) {
                $scope.result += a;
                $scope.point = true;
            }
            else if($scope.result != '' && !$scope.flag) {
                $scope.result = '';
                $scope.result += 0;
                $scope.result += a;
                $scope.point = true;
                $scope.flag = true;
            }
        }
        else if (regAbs.test(a)) {
            if ($scope.result > 0) {
                $scope.result = "-" + $scope.result;
            }
            else {
                $scope.result = Math.abs($scope.result);
            }
        }
        else if (a == "%") {
            $scope.result = $scope.format(Number($scope.result) / 100);

        } else if (a == "返回") {
            $scope.closeCalcModal();
        }
            //如果点击的是个运算符且当前显示结果不为空和error
        else if ($scope.checkOperator(a) && $scope.result != "" && $scope.result != "error" && $scope.isOpt) {
            $scope.flag = false;
            $scope.num.push($scope.result);
            $scope.operation(a);
            //点击一次运算符之后需要将再次点击运算符的情况忽略掉
            $scope.isOpt = false;
        }
        else if (a == "=" && $scope.result != "" && $scope.result != "error") {
            $scope.flag = false;
            $scope.num.push($scope.result);
            while ($scope.opt.length != 0) {
                var operator = $scope.opt.pop();
                var right = $scope.num.pop();
                var left = $scope.num.pop();
                $scope.calculate(left, operator, right);
            }
        }
    };
    $scope.format = function (num) {
        //var regNum = /.{10,}/ig;
        //if (regNum.test(num)) {
        //    if (/\./.test(num)) {
        //        return num.toExponential(3);
        //    }
        //    else {
        //        return num.toExponential();
        //    }
        //}
        //else {
        //    return num;
        //}
        return num;
    }
    //比较当前输入的运算符和运算符栈栈顶运算符的优先级
    //如果栈顶运算符优先级小，则将当前运算符进栈，并且不计算，
    //否则栈顶运算符出栈，且数字栈连续出栈两个元素，进行计算
    //然后将当前运算符进栈。
    $scope.operation = function (current) {
        //如果运算符栈为空，直接将当前运算符入栈
        if (!$scope.opt.length) {
            $scope.opt.push(current);
            return;
        }
        var operator, right, left;
        var lastOpt = $scope.opt[$scope.opt.length - 1];
        //如果当前运算符优先级大于last运算符，仅进栈
        if ($scope.isPri(current, lastOpt)) {
            $scope.opt.push(current);
        }
        else {
            operator = $scope.opt.pop();
            right = $scope.num.pop();
            left = $scope.num.pop();
            $scope.calculate(left, operator, right);
            $scope.operation(current);
        }
    };
    //负责计算结果函数
    $scope.calculate = function (left, operator, right) {
        switch (operator) {
            case "＋":
                $scope.result = $scope.format(Number(left) + Number(right));
                $scope.num.push($scope.result);
                break;
            case "－":
                $scope.result = $scope.format(Number(left) - Number(right));
                $scope.num.push($scope.result);
                break;
            case "×":
                $scope.result = $scope.format(Number(left) * Number(right));
                $scope.num.push($scope.result);
                break;
            case "÷":
                if (right == 0) {
                    $scope.result = "error";
                    $scope.init();
                }
                else {
                    $scope.result = $scope.format(Number(left) / Number(right));
                    $scope.num.push($scope.result);
                }
                break;
            default: break;
        }
    };
    //判断当前运算符是否优先级高于last，如果是返回true
    //否则返回false
    $scope.isPri = function (current, last) {
        if (current == last) {
            return false;
        }
        else {
            if (current == "×" || current == "÷") {
                if (last == "×" || last == "÷") {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        }
    };
    //判断当前符号是否是可运算符号
    $scope.checkOperator = function (opt) {
        if (opt == "＋" || opt == "－" || opt == "×" || opt == "÷") {
            return true;
        }
        return false;
    }
    $scope.denominationChange = function () {
        //alert("??")
        if ($scope.model.denomination < 0) {
            $scope.model.denomination = 0;
            return;
        }
        //var changed = false;
        //if ($scope.model.denomination > 10) {
        //    alert("jhjh")
        //    changed = true;
        //}
        //console.log(($scope.model.denomination + '').split('.'))
        //var denomination = ($scope.model.denomination + '').split('.')
        ////alert(denomination[0].length)
        //var changed = false;
        //if (denomination[0].length > 6) {
        //    denomination[0] = '';
        //    changed = true;
        //}
        //if (denomination[1] && denomination[1].length > 6) {
        //    denomination[1] = '';
        //    changed = true;
        //}
        //if (changed) {
        //    denomination = denomination.join('.');
        //    $scope.model.denomination = parseFloat(denomination);
        //}
        if ($scope.model.denomination > 999999.999999) {
            $scope.model.denomination = 999999.999999;
        }
        
        //else 
        if ($scope.model.denomination < 0)$scope.model.denomination = 0;
    }
    //if ($scope.tab == 2) {
    //    $scope.denominationChange = function () {
    //        if ($scope.model.denomination < 0) {
    //            $scope.model.denomination = 0;
    //            return;
    //        }
    //        if ($scope.model.denomination > 999999.999999) {
    //            $scope.model.denomination = 999999.999999;
    //        }
    //        if ($scope.model.denomination < 0) $scope.model.denomination = 0;
    //    }
    //}

    // date字体大小的调整
    var o = document.getElementById('appDate1');
});
ionicApp.controller('calendarController', function ($rootScope, $scope, $state, toolService) {
    $scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;

    }
    $scope.tab1 = 1;
    $scope.setTab1 = function (index) {
        $scope.tab1 = index;

    }
    var date = new Date();
    $scope.model = {
        billTypeId: 101,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        number: 6,
    }
    $scope.initModel = {};
    s = $scope.model.year;
    if ($scope.model.month < 10)
        s = s + '-0' + $scope.model.month;
    else
        s = s + '-' + $scope.model.month;
    if ($scope.model.day < 10)
        s = s + '-0' + $scope.model.day;
    else
        s = s + '-' + $scope.model.day;
    //$scope.todayStr = $scope.model.year + '-' + $scope.model.month + '-' + $scope.model.day;
    $scope.todayStr = s;    //当前日期字符串
    angular.copy($scope.model, $scope.initModel);

    $scope.getNumber = function (num) { var x = new Array(); for (var i = 0; i < num; i++) { x.push(i + 1); } return x; }
    //初始化数据,设置最大查询允许月份
    $scope.maxMonth = 2;
    function init_data() {
        $scope.allYears = new Array(20);
        $scope.allYears[0] = (date.getMonth() + 1) > 10 ? date.getFullYear() + 1 : date.getFullYear();
        for (var i = 1; i < $scope.allYears.length; i++)
            $scope.allYears[i] = $scope.allYears[i - 1] - 1;
        $scope.allMonths = $scope.getNumber((date.getMonth() + 1) > (12 - $scope.maxMonth) ? $scope.model.year > date.getFullYear() ? (date.getMonth() + 1 + $scope.maxMonth) % 12 : 12 : date.getMonth() + 1 + $scope.maxMonth);
        $scope.weekMap_en = {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
            "Sunday": 7,
        };
        $scope.weekMap = {
            "星期一": 1,
            "星期二": 2,
            "星期三": 3,
            "星期四": 4,
            "星期五": 5,
            "星期六": 6,
            "星期日": 7,
        };
    }
    init_data();

    //reset
    $scope.reset = function () {
        $scope.model.day = $scope.initModel.day;
        $scope.setYear($scope.initModel.year);
        $scope.setMonth($scope.initModel.month);
        $scope.queryCalendar();
    }
    $scope.setYear = function (year) {
        if (date.getFullYear() <= year) {
            $scope.allMonths = $scope.getNumber((date.getMonth() + 1) > (12 - $scope.maxMonth) ? year > date.getFullYear() ? (date.getMonth() + 1 + $scope.maxMonth) % 12 : 12 : date.getMonth() + 1 + $scope.maxMonth);
        } else {
            $scope.allMonths = $scope.getNumber(12);
        }
        //判断不超过最大月份
        if ($scope.allMonths[$scope.allMonths.length - 1] < $scope.model.month) {
            $scope.model.month = $scope.allMonths[$scope.allMonths.length - 1];
        }
        $scope.model.year = year;
        $scope.queryCalendar();
    }
    $scope.setMonth = function (month) {
        if ($scope.allMonths[$scope.allMonths.length - 1] < month) {
            return;
        }
        $scope.model.month = month;
        $scope.queryCalendar();
    }

    //查询Calendar
    $scope.queryCalendar = function () {
        toolService.searchCalendar($scope.model.year, $scope.model.month, $scope.model.billTypeId, $scope.model.number).then(function (data) {
            $scope.calendarResult = new Array(5);
            var firstDayIndex = $scope.weekMap[data[0].week_name] - 1;
            var calendarPrev = new Array();
            for (var i = 0; i < firstDayIndex; i++)
                calendarPrev.push({ "week_name": null, "bill_calendar_days": null })
            for (var i = 0; i < 6; i++) {
                if (i == 0)
                    $scope.calendarResult[i] = calendarPrev.concat(data.slice(0, 7 - firstDayIndex))
                else
                    $scope.calendarResult[i] = data.slice(i * 7 - firstDayIndex, i * 7 + 7 - firstDayIndex);
                if ($scope.calendarResult[i].length != 7) {
                    for (var j = 0; j < 7 - $scope.calendarResult[i].length; j++)
                        $scope.calendarResult[i].push({ "week_name": null, "bill_calendar_days": null });
                }
            }
        });
    }
    $scope.queryCalendar();

    $scope.refresh = function (id) {
        $scope.model.billTypeId = id;
        if (id = 102)
            $scope.model.number = 6;
        $scope.queryCalendar();
    }

    $scope.refreshCycle = function (cycle) {
        $scope.model.number = cycle;
        $scope.queryCalendar();
    }
});

ionicApp.controller('dianDaController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getInvitationService, $ionicPopup) {


})
ionicApp.controller('drawBillController', function ($scope, $rootScope, $state, $stateParams, $timeout, $ionicModal, $ionicPopup, billService, addressService, customerService, constantsService, bankService, fileService) {
    var btId = 101
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return;
        //判断是否允许出票
    }
    else if ($rootScope.identity.is_verified == -1 || $rootScope.identity.is_verified == 0 || $rootScope.identity.is_verified == 2) {
        btId = 102
        $ionicPopup.alert({
            title: '提示',
            template: '您是个人客户，只能发布纸票！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
    }

    $scope.model = {
        endorsement_number: 1,
        contact_name: $rootScope.identity == null ? "" : $rootScope.identity.customer_name,
        contact_phone: $rootScope.identity == null ? "" : $rootScope.identity.phone_number,
        bill_type_id: btId,
        trade_type_code: 701,
        //bill_front_photo_id: 1,
        //bill_front_photo_path: 'http://wechat.huipiaoxian.com/activity/img/sharelogo.jpg',
    };

    $scope.filter = {
        tradetype: 0,
        perfect: false
    }
    //获取客户信息中的省市地址信息
    init = function () {
        customerService.getCustomer().then(function (data) {
            if (data.trade_location_province_id && data.trade_location_city_id) {
                $scope.model.product_province_id = data.trade_location_province_id;

                addressService.queryCity(data.trade_location_province_id).then(function (data) {
                    $scope.cityData = data;
                });
                $scope.model.product_location_id = data.trade_location_city_id;
            }
        });
    };
    init();

    constantsService.queryConstantsType(4).then(function (data) {
        $scope.acceptorTypeData = data;
    })
    if ($stateParams.perfect) {
        $scope.filter.perfect = $stateParams.perfect
    }
    //获取我的发布详细信息
    if ($stateParams.id) {
        billService.getBillProduct($stateParams.id).then(function (data) {
            $scope.model = data;
            //$scope.model.drawer_account_id = $stateParams.accountId;
            $scope.model.account_id = $stateParams.accountId;
            $scope.model.contract_num = $stateParams.contract_num;
            //$scope.model.product_deadline_time = new Date($scope.model.bill_deadline_time);
            //$timeout(function () {
            //    if ($stateParams.id && $scope.model.trade_type_code == 702 && $scope.model.bill_type_id == 101) {
            //        $scope.filter.tradetype = 1;
            //        //document.getElementById("price").readOnly = "readonly";
            //        //document.getElementById("acceptortype").disabled = "true";
            //        //document.getElementById("producttime").readOnly = "readonly";
            //        //document.getElementById("producttime").disabled = "true";
            //    }
            //});
            //$('.jqzoom').imagezoom();
        });
    }

    $scope.$watch('model.bill_deadline_date', function (newValue, oldValue) {
        if (newValue === oldValue) { return; } // AKA first run
        //if ($scope.model.start_time instanceof Date) {
        /*
        var dateValue = new Date();
        dateValue.setHours(newValue.getHours() + 8);
        dateValue.setDate(dateValue.getDate() - 1);
        */
        $scope.model.bill_deadline_time = new Date($scope.model.bill_deadline_date).getTime();
        //if (newValue == null) $scope.model.start_time = null;
        //else $scope.model.start_time = newValue.toISOString().slice(0, 10);//toLocaleDateString().replace('/', '-').replace('/', '-');
        //$scope.onTimeSet($scope.model.start_time, 'start_time');
        //}
    });
    $scope.choiceEBillType = function () {
        $scope.model.bill_type_id = 101;
        $scope.model.bill_deadline_time = new Date().setYear(new Date().getFullYear() + 1);
        $scope.model.product_deadline_time = new Date($scope.model.bill_deadline_time);
    };
    //选择纸票
    $scope.choicePBillType = function () {
        $scope.model.bill_type_id = 102;
        $scope.model.bill_deadline_time = new Date().setMonth(new Date().getMonth() + 6);
        $scope.model.product_deadline_time = new Date($scope.model.bill_deadline_time);
    };

    $scope.choiceYTradeType = function () {
        $scope.model.trade_type_code = 701;
    };
    $scope.choiceNTradeType = function () {
        $scope.model.trade_type_code = 702;
    };
    //获取全部省级地址
    addressService.queryAll().then(function (data) {
        $scope.provinceData = data;
        $scope.provinceChange();
    });
    //获取各省市下面的市区
    $scope.provinceChange = function () {
        if (!$scope.model.product_province_id) {
            $scope.cityData = [];
        } else if ($scope.model.product_province_id == 1 || $scope.model.product_province_id == 20 || $scope.model.product_province_id == 860 || $scope.model.product_province_id == 2462) {
            $scope.filter.tradeProvinceId = $scope.model.product_province_id + 1;
            return addressService.queryCity($scope.filter.tradeProvinceId).then(function (data) {
                $scope.cityData = data;
            });
        } else {
            return addressService.queryCity($scope.model.product_province_id).then(function (data) {
                $scope.cityData = data;
            });
        }
    }
    $scope.takePhoto = function (index) {
        switch (index) {
            case 0:
                $scope.$takePhoto(function (data) {
                    $scope.imgBillF = true;
                    // 如果点击上传，并且已经上传了一次了，就先清空之前的id
                    if ($scope.imgBillF && $scope.model.bill_front_photo_id) {
                        $scope.model.bill_front_photo_id = '';
                    }
                    $scope.model.bill_front_photo_path = data;
                    $scope.$uploadPhoto($scope.model.bill_front_photo_path, function (data) {
                        data = JSON.parse(data);
                        $scope.model.bill_front_photo_id = data.data.id;
                        $scope.model.bill_front_photo_path = data.data.file_path;
                        if ($scope.model.bill_front_photo_id || $scope.model.bill_front_photo_id != '') {
                            $timeout(function () {
                                $scope.imgBillF = false;
                                $rootScope.isView = false;
                                $scope.imgBillB = false;
                            }, 100)
                        }
                    });
                });
                break;
            case 1:
                $scope.$takePhoto(function (data) {
                    $scope.imgBillB = true;
                    $scope.model.bill_back_photo_path = data;
                    $scope.$uploadPhoto($scope.model.bill_back_photo_path, function (data) {
                        data = JSON.parse(data);
                        $scope.model.bill_back_photo_id = data.data.id;
                        $scope.model.bill_back_photo_path = data.data.file_path;
                        if ($scope.model.bill_back_photo_id || $scope.model.bill_back_photo_id != '') {
                            $timeout(function () {
                                $scope.imgBillF = false;
                                $rootScope.isView = false;
                                $scope.imgBillB = false;
                            }, 100)
                        }
                    });
                });
                break;
        }
    };
    
    //汇票正面图片放大功能
    $scope.setFrontID = function (response) {
        $timeout(function () {
            $scope.model.bill_front_photo_id = response.data.data.id;
            $scope.model.bill_front_photo_path = response.data.data.file_path;
            $('.jqzoom_front').imagezoom();
        })
    };
    //汇票背面图片放大功能
    $scope.setBackID = function (response) {
        $timeout(function () {
            $scope.model.bill_back_photo_id = response.data.data.id;
            $scope.model.bill_back_photo_path = response.data.data.file_path;
            $('.jqzoom_back').imagezoom();
        })
    };
    //汇票正面图片移除功能
    $scope.removeFront = function () {
        $scope.model.bill_front_photo_id = null;
        $scope.model.bill_front_photo_path = '';
    }
    //汇票背面图片移除功能
    $scope.removeBack = function () {
        $scope.model.bill_back_photo_id = null;
        $scope.model.bill_back_photo_path = '';
    }
    //上传图片后，点击图片跳转页面，放大图片
    $scope.showFront = function () {
        window.open('index.html#/img?path=' + $scope.model.bill_front_photo_path);
    }
    //上传图片后，点击图片跳转页面，放大图片
    $scope.showBack = function () {
        window.open('index.html#/img?path=' + $scope.model.bill_back_photo_path);
    }

    $scope.enclosure = [];
    $scope.model.bill_back_files = [];

    //  confirm 对话框
    $scope.showConfirm = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: '注意',
            template: '确定要发布汇票吗?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                if (!$scope.model.id) {
                    //发布汇票信息
                    billService.insertBillProduct($scope.model).then(function (data) {
                        $ionicPopup.alert({
                            title: '注意',
                            template: '发布成功，请等待后台审核（30分钟内完成）。',
                            okText: '确    定',
                            cssClass: 'hpxModal'
                        });
                        $state.go("app.myReleaseElecAll");
                    });
                }
                else {
                    //审核不通过 修改汇票信息
                    if ($scope.model.id && $stateParams.bidId && $scope.model.trade_type_code == 702) {
                        $scope.model.bill_product_id = $scope.model.id;
                        $scope.model.bill_product_bidding_id = parseInt($stateParams.bidId);
                        $scope.model.is_NeedXY = 1;
                        $scope.model.type = "bidding";
                        billService.generateOrders($scope.model).then(function (data) {
                            billService.updateBillHpx($scope.model.id, $scope.model).then(function (data) {
                                $ionicPopup.alert({
                                    title: '注意',
                                    template: '发布成功，请等待后台审核（30分钟内完成）。',
                                    okText: '确    定',
                                    cssClass: 'hpxModal'
                                });
                                $state.go("app.myReleaseElecAll");
                            })
                        })
                    } else {
                        billService.updateBillProduct($scope.model.id, $scope.model).then(function (data) {
                            $ionicPopup.alert({
                                title: '注意',
                                template: '发布成功，请等待后台审核（30分钟内完成）。',
                                okText: '确    定',
                                cssClass: 'hpxModal'
                            });
                            $state.go("app.myReleaseElecAll");
                        });
                    }
                }
            }
            else {
                return
            }
        });
    };

    $scope.save = function () {
        //校验，提示信息
        if (!$scope.model.bill_type_id) {
            $ionicPopup.alert({
                title: '提示',
                template: '请选择票据类型',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }


        if (!$scope.model.trade_type_code) {

            $ionicPopup.alert({
                title: '提示',
                template: '请选择交易方式！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.bill_sum_price) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入票面金额！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        
        if ($scope.model.trade_type_code == 701) {
            if (!$scope.model.bill_front_photo_id && !$scope.imgBillF) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请上传汇票！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return
            }
            if (!$scope.model.bill_front_photo_id && $scope.imgBillF) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '正在上传，请等待！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return
            }
            

            if (!$scope.model.bill_back_photo_id && $scope.imgBillB) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '正在上传，请等待！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return
            }
        }

        if ($scope.model.trade_type_code == 702) {
            if (!$scope.model.acceptor_type_id) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请选择承兑机构！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return
            }
        }
        if ($scope.model.trade_type_code == 702) {
            if (!$scope.model.product_deadline_time) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请选择预约交易日期！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return
            }
        }


        $scope.model.bill_flaw_ids = [];
        $scope.model.bill_type_id = parseInt($scope.model.bill_type_id);
        $scope.model.trade_type_code = parseInt($scope.model.trade_type_code);

        $scope.showConfirm();

    }

    //图片放大弹框
    $ionicModal.fromTemplateUrl('imgMagnify.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.imgMagnifyModal = modal;
    });

    $scope.openImgMagnifyModal = function (img_path) {
        if (img_path) {
            $scope.imgMagnifyModal.show();
            $scope.img_path = img_path;
        }
    }

    $scope.closeImgMagnifyModal = function () {
        $scope.imgMagnifyModal.hide();
    }
    //获取全部省级地址
    addressService.queryAll().then(function (data) {
        $scope.provinceData = data;
        $scope.provinceChange();
    });
    //获取各省市下面的市区
    $scope.provinceChange = function () {
        if (!$scope.model.product_province_id) {
            $scope.cityData = [];
        } else if ($scope.model.product_province_id == 1 || $scope.model.product_province_id == 20 || $scope.model.product_province_id == 860 || $scope.model.product_province_id == 2462) {
            $scope.filter.tradeProvinceId = $scope.model.product_province_id + 1;
            return addressService.queryCity($scope.filter.tradeProvinceId).then(function (data) {
                $scope.cityData = data;
            });
        } else {
            return addressService.queryCity($scope.model.product_province_id).then(function (data) {
                $scope.cityData = data;
            });
        }

    }
})
ionicApp.controller('evaluateCityController', function ($scope, $rootScope, $state) {
    $scope.model = {};
    $scope.model.star1 = 0;

    $scope.chioceStar11 = function () {
        $scope.model.star1 = 1;
    };

    $scope.chioceStar12 = function () {
        $scope.model.star1 = 2;
    };

    $scope.chioceStar13 = function () {
        $scope.model.star1 = 3;
    };

    $scope.chioceStar14 = function () {
        $scope.model.star1 = 4;
    };

    $scope.chioceStar15 = function () {
        $scope.model.star1 = 5;
    };

    $scope.model.star2 = 0;

    $scope.chioceStar21 = function () {
        $scope.model.star2 = 1;
    };

    $scope.chioceStar22 = function () {
        $scope.model.star2 = 2;
    };

    $scope.chioceStar23 = function () {
        $scope.model.star2 = 3;
    };

    $scope.chioceStar24 = function () {
        $scope.model.star2 = 4;
    };

    $scope.chioceStar25 = function () {
        $scope.model.star2 = 5;
    };
})
ionicApp.controller('followController', function ($scope, $rootScope,$stateParams, $state, $ionicPopup, customerService, toolService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.detail = function(model) {
        $rootScope.boId = false
        $rootScope.eId = model.collection_enterprise_id
        $rootScope.eN = model.collection_enterprise_name
        $state.go('app.onDaLs');
    }
    //$scope.filter = {
    //    follBiEn:1
    //}
    //$scope.filter.follBiEn = $stateParams.follBiEn;
    //$scope.tab = 1;
    if ($rootScope.idBiEn == 1) {
        $scope.tab = 1;
    } else if ($rootScope.idBiEn == 2) {
        $scope.tab = 2;
    }
    $scope.hpxFollow = true;
    $scope.closeModel = function() {
        $state.go('app.user')
    }
    $scope.setTab = function (index) {
        $scope.tab = index;
        $scope.doRefresh();
    }
    $scope.filter = {};
    $scope.is_vis = false;
    if ($scope.hpxFollow) {
        $scope.doRefresh = function () {
            $scope.params = $scope.Params.Create();
            $scope.listData = [];
            $scope.billListData = [];
            $scope.loadMore();
        };
        $scope.loadMore = function (first) {
            if ($scope.tab == 1) {
                customerService.getAllFollowEnterprises($scope.params).then(function (data) {
                    if (data == null) {
                        $scope.is_vis = true;
                    } else {
                        $scope.is_vis = false;
                        $scope.hasMore = data.length == 10;
                        $scope.listData = first ? data : $scope.listData.concat(data);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                    }

                });
            }
            else {
                customerService.getAllFollowBills($scope.params).then(function (data) {
                    if (data.length == 0) {
                        $scope.is_vis = true;
                    } else {
                        $scope.is_vis = false;
                    }
                    $scope.hasMore = data.length == 10;
                    $scope.billListData = first ? data : $scope.billListData.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                });
            }
            $scope.params.next();
        };
    }
    $scope.myFollow = function (item) {
        console.log(item)
        $scope.billsModel = item;
        if (item.bill_status >= 804) {
            var myPopup = $ionicPopup.show({
                cssClass: 'hpxModals hpxFollowS',
                title:'提示',
                template: '此张票据已交易，无法进行竞价。',
                scope: $scope,
                buttons: [
                      {
                          text: '取消收藏',
                          type:'button-default',
                          onTap: function (e) {
                              //$state.go('app.user');
                              var follow = 0;
                              //$scope.follow = function (follow) {
                                  $scope.followModel = {
                                      collection_bill_id: item.collection_bill_id,
                                      is_collection_bill: follow
                                  }
                                  customerService.followBill($scope.followModel).then(function () {
                                      //$scope.model.is_collection_enterprise = follow;
                                      $scope.billsModel.is_collection_bill = follow;
                                      $scope.setTab(2);
                                  })
                              //}
                          }
                      },
                      {
                          text: '确定',
                          type: 'button-positive',
                          onTap: function (e) {
                              //$state.go('app.authorizate');
                          }
                      }
                ]
            })
        } else {
            $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.collection_bill_id });
        }
    };
    $scope.followBill = function (collection_bill_id, follow) {
        $scope.followBillModel = {
            collection_bill_id: collection_bill_id,
            is_collection_bill: follow
        };
        customerService.followBill($scope.followBillModel)
        $scope.doRefresh();
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})
ionicApp.controller('forgetPasswordController', function ($rootScope, $scope, $state, $interval, $ionicPopup, customerService) {
    $scope.model = {};
    $scope.verifyStr = "获取验证码";
    $scope.disableVerify = false;
    $scope.filter = {
        choicePhone: 0,
    }
    //var second = 60;
    //发送验证码
    $scope.getVerify = function () {
        if (!$scope.model.phone_number || $scope.model.phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        customerService.phoneVerify($scope.model.phone_number).then(function () {
            $ionicPopup.alert({
                title: '通知',
                template: '验证码已发送!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $scope.second = 60;
            $scope.disableVerify = true;

            $interval(function () {
                $scope.verifyStr = $scope.second + "秒后可重新获取";
                $scope.second--;

                if ($scope.second == 0) {
                    $scope.verifyStr = "重新获取验证码";
                    $scope.disableVerify = false;
                }
            }, 1000, 60);
        })
    };

    $scope.PhoneChange = function () {
        if ($scope.model.phone_number && (/^1(3|4|5|7|8)\d{9}$/.test($scope.model.phone_number))) {
            //$scope.model.phone_number.length == 11 &&
            customerService.testPhoneNumber($scope.model.phone_number).then(function (data) {
                if (!data) {
                    $scope.filter.choicePhone = 1;
                }
                else {
                    $scope.filter.choicePhone = 2;
                }
            });
        }
        else if ($scope.model.phone_number && $scope.model.phone_number.length == 11) {
            $scope.filter.choicePhone = 3;
        }
    }

    $scope.submit = function () {
        if (!$scope.model.phone_number || $scope.model.phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.new_password || $scope.model.new_password.length == 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.new_password || $scope.model.new_password.length < 6) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if ($scope.model.new_password != $scope.model.new_password2) {
            $ionicPopup.alert({
                title: '提示',
                template: '两次密码输入不一致！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.phone_verify_code || $scope.model.phone_verify_code.length == 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入验证码！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        $scope.model.submitRequest = {
            phone_verify_code: $scope.model.phone_verify_code,
            new_password: $scope.model.new_password,
        }
        //修改密码
        customerService.customerPasswordReset($scope.model.phone_number, $scope.model.submitRequest).then(function (data) {
            $ionicPopup.alert({
                title: '提示',
                template: '密码重置成功！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $rootScope.loginRequestEnter.password = $scope.model.submitRequest.new_password;
            $state.go('app.signin');            //跳转到登录界面
        });
    }
});
ionicApp.controller('homeController', function ($http, $scope, $rootScope, API_URL, $state,$ionicSlideBoxDelegate, $filter, billService, $compile, toolService, $ionicHistory, $ionicPopup, bannerService) {
    $ionicHistory.clearHistory();

    $scope.hpxBill = function () {
        if (!$rootScope.identity) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go("app.signin");
        }
        else {
            $state.go("app.billOffer")
        }
    }

    $scope.fiter = {
        hpxType1: true,
    }
    $scope.hpxShou = function (billId) {
        if (!$rootScope.identity) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go("app.signin");
        }
        else {
            $state.go("app.myReleaseDetail", { 'myReleaseBillId': billId })
        }
    }

    $rootScope.boId = true;
    $rootScope.hpxQBS = 202;
    $rootScope.hpxBID = 101;

    $scope.doRefresh = function () {
        $scope.bills = [];
        $scope.products = [];
        $scope.loadMore();
    }

    $scope.loadMore = function () {
        billService.getHomeBillOffer('home', 202, 1).then(function (data) {
            if (!data) {
                //$scope.bills[0] = null;
            } else {
                $scope.bills[0] = data[0]
                $scope.bills[0].offer_detail = JSON.parse($scope.bills[0].offer_detail)
                toolService.getStars($scope.bills[0].enterprise_id).then(function (data) {
                    $scope.bills[0].star = data;
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
        billService.getHomeBillOffer('home', 203, 1).then(function (data) {
            if (!data) {

            } else {
                $scope.bills[1] = data[0]
                $scope.bills[1].offer_detail = JSON.parse($scope.bills[1].offer_detail)
                toolService.getStars($scope.bills[1].enterprise_id).then(function (data) {
                    $scope.bills[1].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
        billService.getHomeBillOffer('home', 204, 1).then(function (data) {
            if (!data) {

            } else {
                $scope.bills[2] = data[0]
                $scope.bills[2].offer_detail = JSON.parse($scope.bills[2].offer_detail)
                toolService.getStars($scope.bills[2].enterprise_id).then(function (data) {
                    $scope.bills[2].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
        billService.getHomeBillOffer('home', 205, 1).then(function (data) {
            if (!data) {

            } else {
                $scope.bills[3] = data[0]
                $scope.bills[3].offer_detail = JSON.parse($scope.bills[3].offer_detail)
                toolService.getStars($scope.bills[3].enterprise_id).then(function (data) {
                    $scope.bills[3].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });

        billService.getHomeBillProduct('home', 101).then(function (data) {

            if (data.length == 0) {

            } else if (data.length == 1) {
                $scope.products[0] = data[0];
                $scope.products[0].bill_deadline_time = $filter('date')($scope.products[0].bill_deadline_time, 'yyyy-MM-dd');
                toolService.getStars($scope.products[0].publisher_id).then(function (data) {
                    $scope.products[0].star = data
                });
            } else {
                $scope.products[0] = data[0];
                $scope.products[1] = data[1];
                $scope.products[0].bill_deadline_time = $filter('date')($scope.products[0].bill_deadline_time, 'yyyy-MM-dd');
                $scope.products[1].bill_deadline_time = $filter('date')($scope.products[1].bill_deadline_time, 'yyyy-MM-dd');

                toolService.getStars($scope.products[0].publisher_id).then(function (data) {
                    $scope.products[0].star = data
                });

                toolService.getStars($scope.products[1].publisher_id).then(function (data) {
                    $scope.products[1].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });

        billService.getHomeBillProduct('home', 102).then(function (data) {
            if (data.length == 0) {

            } else if (data.length == 1) {
                $scope.products[2] = data[0];
                $scope.products[2].bill_deadline_time = $filter('date')($scope.products[2].bill_deadline_time, 'yyyy-MM-dd');
                toolService.getStars($scope.products[2].publisher_id).then(function (data) {
                    $scope.products[2].star = data
                });
            } else {
                $scope.products[2] = data[0];
                $scope.products[3] = data[1];
                $scope.products[2].bill_deadline_time = $filter('date')($scope.products[2].bill_deadline_time, 'yyyy-MM-dd');
                $scope.products[3].bill_deadline_time = $filter('date')($scope.products[3].bill_deadline_time, 'yyyy-MM-dd');
                toolService.getStars($scope.products[2].publisher_id).then(function (data) {
                    $scope.products[2].star = data
                });
                toolService.getStars($scope.products[3].publisher_id).then(function (data) {
                    $scope.products[3].star = data
                });
            }
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);

    //获取点击billOfferId
    $scope.changeBillOfferId = function (billOfferId) {
        $rootScope.billOfferbillOfferId = billOfferId;       
    };
    $scope.calculator = function () {
        $state.go('app.calculator');
    };
    $scope.calendar = function () {
        $state.go('app.calendar');
    };
    $scope.querybank = function () {
        $state.go('app.querybank');
    };
    $scope.queryenterprise = function () {
        $state.go('app.queryenterprise');
    };

    $scope.judgeLogina = function () {
        $state.go('app.onLine');
    };
    //推广部分
    $scope.judgeLogin = function () {
        if ($rootScope.identity == null) {
            $ionicPopup.alert({
                title: '提示',
                template: '账户未登录！',
                okText:'确    定',
                cssClass:'hpxModal'
            });
            $state.go("app.signin");
            return;
        } else {
            $state.go('app.promoteEvent');
        }
    };
    $scope.judgeLoginc = function () {
        $state.go('app.bannerSecurity');
    };
    $scope.judgeLogind = function () {
        $state.go('app.newRegister');
    };
    
    hpxV = function () {
        // 判断版本
        var versionCode = 160;
        // 获取服务器版本
        $http.get(API_URL + "/appVersion/getLatestVersion").success(function (data) {
            var ser_versionCode = parseInt(data.data.toString().replace(/\./g, ''));
            if (versionCode < ser_versionCode) {
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxQuan hpxQing',
                    template: '<div class="hpxPermis">' +
                               '<div class="box">' +
                               '<h4>发现新版本 v' + data.data + '</h4>' +
                               '<section style="line-height:26px;">新版本浏览更快速，功能更便捷，还不快去更新！</section>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '稍后再说',
                              type: 'button-royal',
                          },
                          {
                              text: '立即更新',
                              type: 'button-calm',
                              onTap: function (e) {
                                  //window.open("http://139.224.112.243/huipiaoxian.apk");
                                  window.open("http://android.myapp.com/myapp/detail.htm?apkName=io.cordova.hpx");
                              }
                          }
                    ]
                })
            }
        })

        // 获取banner信息
        //bannerService.banner().then(function (data) {
        //    console.log("111111")
        //    console.log(data)
        //    $scope.banner = data;
        //    $scope.updateSlide();
        //})
    }
    hpxV();
    //$scope.updateSlide = function () {
    //    $ionicSlideBoxDelegate.$getByHandle('slideboximgs').update();
    //    $ionicSlideBoxDelegate.$getByHandle("slideboximgs").loop(true);
    //}
    //$scope.judgeLogina = function (bann) {
    //    console.log("bann")
    //    console.log(bann)
    //    $rootScope.bannId = bann.id;
    //    if (bann.template_id == 1) {
    //        $state.go('app.templateOne');
    //    } else if (bann.template_id == 2) {
    //        $state.go('app.templateTwo');
    //    } else if (bann.template_id == 3) {
    //        $state.go('app.templateThree');
    //    } else if (bann.template_id == 4) {
    //        $state.go('app.templateFour');
    //    } else if (bann.template_id == 5) {
    //        if ($rootScope.identity == null) {
    //            $ionicPopup.alert({
    //                title: '提示',
    //                template: '账户未登录！',
    //                okText: '确    定',
    //                cssClass: 'hpxModal'
    //            });
    //            $state.go("app.signin");
    //            return;
    //        } else {
    //            $state.go('app.promoteEvent');
    //        }
    //    }
    //}
})
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
ionicApp.controller('hpxBaoController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getInvitationService, $ionicPopup) {

})
ionicApp.controller('hpxDaController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getInvitationService, $ionicPopup) {


})
ionicApp.controller('imgBigController', function ($scope, $rootScope, $state, $stateParams, $ionicHistory) {

    $scope.img_path = $stateParams.imgPath;
    $scope.rotate90 = false;
    $scope.back = function () {
        $ionicHistory.goBack();
    }
})
ionicApp.controller('initController', function ($scope, $rootScope, $state, localStorageService) {
    var tour = localStorageService.get('tour');

    if (tour) {
        $state.go('app.home');
    }
    else {
        localStorageService.set('tour', 'finished');
        $state.go('tour');
    }
})
ionicApp.controller('jobQueryController', function ($rootScope, $scope, $state, $ionicPopup, $ionicModal, toolService, privilegeService, payingService) {
    $scope.model = {
        billNumber: null,
    };
    $scope.filter = {
        'checkedType': 1,        //默认1个月
        choiceReCharge: 1,
        'items':3
    };
    
    //更改输入框检验
    /*
    $scope.updateBillNumber = function () {
        if (!$scope.model.billNumber) {
            $scope.model.billNumberValidate = null;
            return;
        }
        if (!/^[0-9]{16}$/.test($scope.model.billNumber) && !/^[0-9]{8}$/.test($scope.model.billNumber)) {
            $scope.model.billNumberValidate = false;
        } else {
            $scope.model.billNumberValidate = true;
        }
    }*/

    //权限的弹窗
    $ionicModal.fromTemplateUrl('frientPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.frientModal = modal;
    });
    $ionicModal.fromTemplateUrl('buyPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.buyModal = modal;
    });

    //查询
    $scope.query = function () {
        if (!$scope.model.billNumber) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入汇票票号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!/^[0-9]{16}$/.test($scope.model.billNumber) && !/^[0-9]{8}$/.test($scope.model.billNumber)) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入16位或后8位汇票票号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        //查询权限
        privilegeService.customerPrivilege({
            'privilege_id': 2
        }).then(function(data){
            console.log(data)
            if (data.right == 0) {
                if (data.isuser == 0) {
                     // 前往登录
                    var myPopup = $ionicPopup.show({
                        cssClass: 'hpxQuan',
                        template: '<div class="hpxPermis">' +
                                   '<div class="box0">' +
                                   '<h4>温馨提示</h4>' +
                                   '<section>您的“挂失查询”工具使用权限已用完！请登录</section>' +
                                   '</div>' +
                                   '</div>',
                        scope: $scope,
                        buttons: [
                              {
                                  text: '取消',
                                  type:'button-royal',
                                  onTap: function (e) {
                                      
                                  }
                              },
                              {
                                  text: '前往登录',
                                  type: 'button-positive',
                                  onTap: function (e) {
                                      $state.go('app.signin');
                                  }
                              }
                        ]
                    })
                } else {
                    if (data.enterprise_id <= 0) {
                         // 前往认证
                        var myPopup = $ionicPopup.show({
                            cssClass: 'hpxQuan',
                            template: '<div class="hpxPermis">' +
                                       '<div class="box">' +
                                       '<h4>温馨提示</h4>' +
                                       '<section>您的“挂失查询”工具使用权限已用完！请进行机构认证</section>' +
                                       '</div>' +
                                       '</div>',
                            scope: $scope,
                            buttons: [
                                  {
                                      text: '取消',
                                      type: 'button-royal',
                                      onTap: function (e) {

                                      }
                                  },
                                  {
                                      text: '前往认证',
                                      type: 'button-positive',
                                      onTap: function (e) {
                                          $state.go('app.accredit');
                                      }
                                  }
                            ]
                        })
                    } else {
                        // 前往购买
                        var myPopup = $ionicPopup.show({
                            cssClass: 'hpxQuan hpxQing',
                            template: '<div class="hpxPermis">' +
                                       '<div class="box">' +
                                       '<h4>温馨提示</h4>' +
                                       '<section style="line-height:26px;">您的“挂失查询”工具免费使用时限已到期，可通过两种方式进行续期：<strong style="display:block;">①现金充值购买使用权限；</strong><strong style="display:block;">②参与“邀请朋友免费获取工具使用权限”活动。</strong></section>' +
                                       '</div>' +
                                       '</div>',
                            scope: $scope,
                            buttons: [
                                  {
                                      text: '现金购买',
                                      type: 'button-calm',
                                      onTap: function (e) {
                                          // 查询购买套餐
                                          privilegeService.privilegePackage({
                                              'privilege_id': 2
                                          }).then(function (data) {
                                              console.log("套餐详情")
                                              console.log(data)
                                              $scope.hpxPack(data[0])
                                              $scope.package = data

                                          })
                                          $scope.buyModal.show();
                                      }
                                  },
                                  {
                                      text: '邀请朋友',
                                      type: 'button-royal',
                                      onTap: function (e) {
                                          $state.go('app.promoteEvent');
                                      }
                                  }
                            ]
                        })
                    }
                }
            } else {
                toolService.serviceByPublication($scope.model).then(function (data) {
                    if (data.page_info.items_number)
                        $scope.queryResult = data['service_by_publications'][0];
                    else {
                        $scope.queryResult = null;
                        $ionicPopup.alert({
                            title: '提示',
                            template: '该票号目前暂无挂失信息！',
                            okText: '确    定',
                            cssClass: 'hpxModal'
                        });
                    }
                });
            }
        })
    }

    $scope.buy = function () {
        // 获取账户余额
        payingService.GetPlatformAccount().then(function (data) {
            $scope.hpxMoney = data;
            var price = $scope.price;
            var hitems = $scope.items;
            if ($scope.hpxMoney.platform_account_balance >= price) {
                privilegeService.privilegePackOrder({
                    'enterprise_id': $rootScope.identity.enterprise_id,
                    'customer_id': $rootScope.identity.customer_id,
                    'package_id': hitems
                }).then(function (data) {
                    //购买成功
                    $ionicPopup.alert({
                        title: '提示',
                        template: '恭喜您！已完成购买，可以使用“挂失查询”工具！',
                        okText: '确    定',
                        onTap:function(){
                            $scope.buyModal.hide();
                        },
                        cssClass: 'hpxModal'
                    });
                })
            } else {
                // 平台余额不足
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxQuan',
                    template: '<div class="hpxPermis">' +
                               '<div class="box">' +
                               '<h4>温馨提示</h4>' +
                               '<section>您的账户余额不足，请充值！！！</section>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '取消',
                              type: 'button-royal',
                              onTap: function (e) {
                                  
                              }
                          },
                          {
                              text: '前往充值',
                              type: 'button-positive',
                              onTap: function (e) {
                                  $scope.buyModal.hide();
                                  $state.go('app.recharge');
                              }
                          }
                    ]
                })
            }
        })
    }
    $scope.hpxPack = function (hPack) {
        console.log(hPack.id)
        console.log(hPack.package_price)
        $scope.items = hPack.id
        $scope.price = hPack.package_price
    }
    $scope.refresh = function () {
        $('.h_bty section').eq(0).find('input[name = "sex"]').attr('checked', 'true')
    }
    //清理
    $scope.clear = function () {
        $scope.model.billNumber = null;
        $scope.queryResult = null;
        //$scope.updateBillNumber();
    }
});

ionicApp.controller('messageController', function ($scope, $rootScope,$ionicPopup, $state, $filter, notisService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.filter = {
        type: '1,2,3,4,5,6',
        time1: '',
        time2: '',
        isRead: '',
    };
    $scope.is_vis = false;
    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-send_time', 10);
        $scope.listData = [];
        $scope.loadMore();
    };
    $scope.loadMore = function (first) {
        notisService.getNotification($scope.params, $scope.filter.type, $scope.filter.time1, $scope.filter.time2, $scope.filter.isread).then(function (data) {
            $scope.hasMore = data.length == 10;
            $scope.listData = first ? data : $scope.listData.concat(data);
            if (data.length == 0) {
                $scope.is_vis = true;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
        });
        $scope.params.next();
    };
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})
ionicApp.controller('messageDetailController', function ($scope, $rootScope, $ionicPopup, $state, $filter, $stateParams, notisService) {
    $scope.filter = {};
    $scope.model = {};
    $scope.notificationId = $stateParams.notificationId;
    notisService.seeNotification($scope.notificationId).then(function (data) {
        $scope.model = data;
    });


    $scope.deleteNotification = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: '注意',
            template: '确定要删除该通知吗?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                notisService.deleteNotification($scope.notificationId).then(function () {
                    $state.go('app.message');
                })
            }
        });
    }
})
ionicApp.controller('modifyPassController', function ($rootScope, $scope, $state, $ionicPopup, customerService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.model = {};

    $scope.submit = function () {

        if (!$scope.model.old_password || $scope.model.old_password.length == 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入旧密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.old_password || $scope.model.old_password.length < 6) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入旧密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.model.new_password || $scope.model.new_password.length == 0) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入新密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.new_password || $scope.model.new_password.length < 6) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入新密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if ($scope.model.new_password != $scope.model.new_password2) {
            $ionicPopup.alert({
                title: '提示',
                template: '两次密码输入不一致！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        $scope.model.submitRequest = {
            password: $scope.model.old_password,
            new_password: $scope.model.new_password,
        }
        //修改密码
        customerService.customerModifyPassword($scope.model.submitRequest).then(function (data) {
            $ionicPopup.alert({
                title: '通知',
                template: '密码修改成功！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $rootScope.loginRequestEnter.password = $scope.model.submitRequest.new_password;
            $state.go('app.user');      //跳转到个人中心
        });
    }
});
ionicApp.controller('modifyPhoneController', function ($scope, $rootScope, $state, $interval, $ionicPopup, customerService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.changePhoneModel = {
        oldPhoneVerifyStr: '获取验证码',
        newPhoneVerifyStr: '获取验证码',
    }
    customerService.getCustomer().then(function (data) {
        $scope.changePhoneModel.old_phone_number = data.phone_number;
    });
    
    $scope.disableVerify1 = false;
    $scope.disableVerify2 = false;
    
    $scope.filter = {
        choicePhone: 0,
    }
    $scope.PhoneChange = function () {
        if ($scope.changePhoneModel.new_phone_number && (/^1(3|4|5|7|8)\d{9}$/.test($scope.changePhoneModel.new_phone_number))) {
            customerService.testPhoneNumber($scope.changePhoneModel.new_phone_number).then(function (data) {
                if (!data) {
                    $scope.filter.choicePhone = 1;
                }
                else {
                    $scope.filter.choicePhone = 2;
                }
            });
        }
        else if ($scope.changePhoneModel.new_phone_number && $scope.changePhoneModel.new_phone_number.length == 11) {
            $scope.filter.choicePhone = 3;
        }
    }
    $scope.getOldPhoneVerify = function () {
        customerService.phoneVerify($scope.changePhoneModel.old_phone_number).then(function () {
            $ionicPopup.alert({
                title: '通知',
                template: '验证码已发送!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $scope.changePhoneModel.oldPhoneVerifyStrSecond = 60;
            $scope.disableVerify1 = true;

            $interval(function () {
                $scope.changePhoneModel.oldPhoneVerifyStr = $scope.changePhoneModel.oldPhoneVerifyStrSecond + "秒后可重新获取";
                $scope.changePhoneModel.oldPhoneVerifyStrSecond--;

                if ($scope.changePhoneModel.oldPhoneVerifyStrSecond == 0) {
                    $scope.changePhoneModel.oldPhoneVerifyStr = "重新获取验证码";
                    $scope.disableVerify1 = false;
                }
            }, 1000, 60);
        })

    };
    $scope.getNewPhoneVerify = function () {
        if (!$scope.changePhoneModel.new_phone_number || $scope.changePhoneModel.new_phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        customerService.phoneVerify($scope.changePhoneModel.new_phone_number).then(function () {
            $ionicPopup.alert({
                title: '通知',
                template: '验证码已发送!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $scope.changePhoneModel.newPhoneVerifyStrSecond = 60;
            $scope.disableVerify2 = true;

            $interval(function () {
                $scope.changePhoneModel.newPhoneVerifyStr = $scope.changePhoneModel.newPhoneVerifyStrSecond + "秒后可重新获取";
                $scope.changePhoneModel.newPhoneVerifyStrSecond--;

                if ($scope.changePhoneModel.newPhoneVerifyStrSecond == 0) {
                    $scope.changePhoneModel.newPhoneVerifyStr = "重新获取验证码";
                    $scope.disableVerify2 = false;
                }
            }, 1000, 60);
        })
    };
    $scope.submit = function () {
        customerService.customerPhone($scope.changePhoneModel).then(function (meta) {
            $ionicPopup.alert({
                title: '通知',
                template: '成功更换手机号，请重新登录!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $state.go('app.signin');
        });
    }
})
ionicApp.controller('myBiddingController', function ($scope, $rootScope, $state, $filter,$ionicPopup, billService, addressService, customerService, constantsService, bankService, fileService, orderService) {
    if($rootScope.identity == null){
        $ionicPopup.alert({
                    title: '提示',
                    template: '账户未登录！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
        $state.go("app.signin");
        return
    }
    $scope.filter = {
        choiceBillType: 101,
        choiceStatus: 880,
        status: null,
        iselectronic: 0,
    };
    $scope.billsNumber = function () {
        billService.getBillsNumber($scope.filter.choiceBillType).then(function (data) {
            $scope.numberModel = data;
        })
    }
    $scope.billsNumber();

    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-publishing_time', 10);
        $scope.listData = [];
        $scope.loadMore();
    };

    //获取我发布的票据信息
    $scope.loadMore = function (first) {
        if ($scope.filter.status >= 804 && $scope.filter.choiceBillType == 101) {
            return orderService.getOwnBiddingOrder($scope.params, $scope.filter.choiceBillType, $scope.filter.status).then(function (data) {
                 if ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].bill.status_code == 801 && data[i].bid_result == 0) {
                            data[i].bill.status_name = "已报价";
                        } else if (data[i].bill.status_code == 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失效";
                        } else if (data[i].bill.status_code > 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失败";
                        }
                    }
                };
                if (($scope.filter.choiceBillType == 101 && ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881)) || $scope.filter.choiceBillType == 102) {
                    for (var j = 0; j < data.length; j++) {
                        if (!data[j].bill.bill_deadline_time)
                            data[j].bill.remaining_day = null;
                    };
                }
                $scope.hasMore = data.length == 10;
                $scope.listData = first ? data : $scope.listData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete')
                $scope.$broadcast('scroll.refreshComplete');
                $scope.params.next();
            });
        } else {
            return billService.getOwnBillBidding($scope.params, $scope.filter.choiceBillType, $scope.filter.status).then(function (data) {
                if ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].bill.status_code == 801 && data[i].bid_result == 0) {
                            data[i].bill.status_name = "已报价";
                        } else if (data[i].bill.status_code == 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失效";
                        } else if (data[i].bill.status_code > 801 && data[i].bid_result == 2) {
                            data[i].bill.status_name = "竞价失败";
                        }
                    }
                };
                if (($scope.filter.choiceBillType == 101 && ($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881)) || $scope.filter.choiceBillType == 102) {
                    for (var j = 0; j < data.length; j++) {
                        if (!data[j].bill.bill_deadline_time)
                            data[j].bill.remaining_day = null;
                    };
                }
                $scope.hasMore = data.length == 10;
                $scope.listData = first ? data : $scope.listData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete')
                $scope.$broadcast('scroll.refreshComplete');
                $scope.params.next();
            });
            
        }
        
    };

    $scope.$on('$stateChangeSuccess', $scope.doRefresh);

    //选择电票
    $scope.choiceEBillType = function () {
        $scope.filter.choiceBillType = 101;
        $scope.filter.status = null;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();
    };
    //选择纸票
    $scope.choicePBillType = function () {
        $scope.filter.choiceBillType = 102;
        $scope.filter.status = null;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();
    };
    //全部
    $scope.choiceTradeStatusAll = function () {
        $scope.filter.iselectronic = 0;
        $scope.filter.choiceStatus = 880;
        $scope.filter.status = null;
        $scope.doRefresh();
    }
    //竞价
    $scope.choiceTradeStatusBidding = function () {
        $scope.filter.iselectronic = 0;
        $scope.filter.choiceStatus = 881;
        $scope.filter.status = 801;
        $scope.doRefresh();
    }
    //交易中
    $scope.choiceTradeStatusTrade = function () {
        $scope.filter.iselectronic = 1;
        $scope.filter.status = 804;
        //if ($scope.filter.choiceBillType == 101) {
        //    $scope.filter.status = 804;
        //} else if ($scope.filter.choiceBillType == 102) {
        //    $scope.filter.status = 809;
        //}
        $scope.filter.choiceStatus = 882;
        $scope.doRefresh();
    }
    //交易完成
    $scope.choiceTradeStatusComplete = function () {
        $scope.filter.iselectronic = 0;
        $scope.filter.status = 810;
        $scope.filter.choiceStatus = 883;
        $scope.doRefresh();
    }
    //交易失败
    $scope.choiceTradeStatusFail = function () {
        $scope.filter.iselectronic = 1;
        $scope.filter.status = 816;
        $scope.filter.choiceStatus = 884;
        $scope.doRefresh();
    }

    $scope.delete = function (data) {
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '是否确定删除？',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                billService.deleteBillBidding(data.id).then(function (result) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: ' 成功删除。',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    $scope.choiceTradeStatusBidding();
                    $scope.billsNumber();
                })
            }
        });
       
    }
})
ionicApp.controller('myReleaseDetailController', function ($scope, $rootScope, $state, API_URL, WEB_URL,XingYe_URL, $timeout, enterpriseXingService, addressService, $stateParams, $filter, billService, toolService, payingService, enterprisesService, orderService, constantsService, $ionicModal, $ionicPopup, customerService, $interval) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal',
        });
        $state.go("app.signin");
        return
    }
    $scope.isVisible = false;
    $scope.filter = {
        check: 0,
        isaccount: 0,
        billBided: 0,
        billSuccess: 0,
        isbidingtime: 0,
        isidentity: 0,
        fromKeyWord: "",
        toKeyWord: "",
        rule: 0,
        payRule: 0,
        follBiEn:2
    };
    $rootScope.idBiEn = 2;
    $scope.billId = $stateParams.myReleaseBillId;
    $scope.orderId = $stateParams.myReleaseOrderId;
    $scope.filter.check = $stateParams.check;
    $scope.filter.rule = false;
    $scope.billModel = {};
    $scope.biddings = {};
    $scope.model = {};
    $scope.open = true;
    $scope.open2 = true;
    $scope.endorsements = [];
    $scope.evaluateModel = {
        type_id: null,
        to_id: null,
        star: 0,
        bill_status_code: null,
        order_status_id: null,
        description: null,
        additional_description: null,
    };

    $scope.changeOpen = function () {
        $scope.open = !$scope.open;
    }
    $scope.changeOpen2 = function () {
        $scope.open2 = !$scope.open2;
    }
    

    var difference;
    //获取票据详情
    init = function () {
        toolService.getSystemTime().then(function (date) {
            var newSystemDate = new Date().getTime();
            difference = newSystemDate - date;
        });
        billService.getBillDetail($scope.billId).then(function (data) {
            $scope.billModel = data;
            if (data.bill_type_id == 101) {
                $rootScope.hpxBID = 101;
            } else if (data.bill_type_id == 102) {
                $rootScope.hpxBID = 102;
            }
            $scope.biddingModel = {
                bill_product_id: $scope.billModel.id,
                bid_enterprise_name: $rootScope.identity.enterprise_name,
                bid_deal_price: 0,
            };
            if ($scope.filter.check == 4) {
                billService.getBillProductBidding($scope.billId).then(function (data) {
                    $scope.biddings = data;
                    angular.forEach(data, function (ele, index) {
                        $scope.hpxBidding = ele;

                    })
                    $scope.openAccountModal($scope.billModel);
                });
            }
            //网络异步问题处理
            if ($scope.billModel.bill_type_id == 101) {
                if ($scope.billId && $rootScope.identity && ($rootScope.identity.can_see_bill_detail == 1 || $scope.billModel.publisher_id == $rootScope.identity.enterprise_id)) {
                    billService.getBillProductBidding($scope.billId).then(function (data) {
                        $scope.biddings = data;
                        angular.forEach(data, function (ele, index) {
                            $scope.hpxBidding = ele;
                        })
                    });
                }
            } else if ($scope.billModel.bill_type_id == 102 && $scope.billId && $rootScope.identity) {
                billService.getBillProductBidding($scope.billId).then(function (data) {
                    $scope.biddings = data;
                    angular.forEach(data, function (ele, index) {
                        $scope.hpxBidding = ele;
                        if (ele.is_mine == 1) {
                            $scope.isVisible = true;
                        }
                    })
                });
            }
        });
        //获取出票订单详情
        if ($scope.orderId) {
            orderService.getOrder($scope.orderId).then(function (data) {
                $scope.orderModel = data;
                // 获取票据信息
                billService.getBillProduct($scope.orderModel.bill_id).then(function (data) {
                    $scope.FindBill = data;
                });
                //payingService.getAccountPY($scope.orderModel.bill_id).then(function (data) {
                //    $scope.hpxGetAcc = data;
                //    $scope.hfindAccX = data.drawerAccount;
                //    $scope.hfindAccY = data.receiverAccount;
                //})
            });
        }

        //根据条件判断，成立则获取出价记录
        if ($scope.billId && $rootScope.identity && ($rootScope.identity.can_see_bill_detail == 1 || $scope.model.publisher_id == $rootScope.identity.enterprise_id)) {
            billService.getBillProductBidding($scope.billId).then(function (data) {
                $scope.biddings = data;
                angular.forEach(data, function (ele, index) {
                    $scope.hpxBidding = ele;
                })
            });
        };
    };
    init();
    // 提现手续费得计算
    $scope.phxPay = {
        withdrawal_procedure: "",
        hpxZong: 0,
        amount: ""
    }
    $scope.bidPoundage = function () {
        if ($scope.billModel.bill_type_id == 101) {
            if ($scope.phxPay.amount <= 100000.00) {
                $scope.phxPay.withdrawal_procedure = 10.00;
            } else if ($scope.phxPay.amount > 100000.00 && $scope.phxPay.amount <= 500000.00) {
                $scope.phxPay.withdrawal_procedure = 15.00;
            } else if ($scope.phxPay.amount > 500000.00 && $scope.phxPay.amount <= 1000000.00) {
                $scope.phxPay.withdrawal_procedure = 20.00;
            } else if ($scope.phxPay.amount > 1000000.00) {
                $scope.phxPay.withdrawal_procedure = Number($scope.phxPay.amount * 0.00002).toFixed(2);
                if ($scope.phxPay.withdrawal_procedure >= 200) {
                    $scope.phxPay.withdrawal_procedure = 200.00;
                }
            }
        } else if ($scope.billModel.bill_type_id == 102) {
            $scope.phxPay.withdrawal_procedure = 0;
        }
    }
    //弹出竞价窗口
    $ionicModal.fromTemplateUrl('bidPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.bidModal = modal;
    });
    // 点击竞价 新增报价信息
    $scope.addBidding = function () {
        if ($scope.billModel.trade_type_code == 702) {
            $scope.biddingModel.bid_rate = $scope.biddingModel.bill_rate;
        }
        billService.insertBillBidding($scope.biddingModel).then(function (data) {
            billService.getBillProductBidding($scope.billModel.id).then(function (data) {
                $scope.biddings = data;
            });
            setTimeout(function () {
                if ($scope.billModel.bill_type_id == 101) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '<p>报价成功！</p>' +
                                  '<p>请等待出票方确认报价。</p>',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    $state.go("app.myBidding");
                } else if ($scope.billModel.bill_type_id == 102) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '<p>报价成功！</p>' + 
                                  '<p>温馨提醒：报价后请及时联系出票方。</p>',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    $state.go("app.myBidding");
                }
            }, 350);
        });
    };


    //选择成交页面
    $ionicModal.fromTemplateUrl('choicePayAccount.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.accountModal = modal;
    });
    //预约出票弹出完善窗口
    $ionicModal.fromTemplateUrl('addvPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.addvModal = modal;
    });
    //弹出选择成交窗口
    $scope.showFinishBidding = function (item) {
        $scope.accountModel = {
            account_person: $scope.billModel.drawer_name,
        }
        $scope.billModel.drawer_account_id = null;
        payingService.getAccount($scope.billModel.drawer_id).then(function (data) {
            $scope.accountModel = data.acct_list[0];
            var enterpriseId = $rootScope.identity.enterprise_id
            //payingService.getAccount(enterpriseId).then(function (data) {
            //    $scope.accounts = data.acct_list;
            //})
            $scope.accountModal.enterprise_name = data.enterprise_name;
        })
        // 查询已经鉴权成功的银行卡
        payingService.getAccountPX($scope.billId).then(function (data) {
            $scope.accounts = data.drawerAccount;
        })
        $scope.payModel = {};
        $scope.payModel.payId = item.id || $scope.hpxBidding.id;
        $scope.payModel.bid_every_plus = item.bid_every_plus;
        $scope.payModel.bid_enterprise_id = item.bid_enterprise_id || $scope.hpxBidding.bid_enterprise_id;
        $scope.payModel.bid_deal_price = item.bid_deal_price || $scope.hpxBidding.bid_deal_price;
        $scope.payModel.drawer_id = item.drawer_id || $scope.hpxBidding.drawer_id;
        $scope.payModel.bill_rate = item.bid_rate || $scope.hpxBidding.bid_rate;
        $scope.payModel.receiver_id = item.receiver_id || $scope.hpxBidding.receiver_id;
        $scope.payModel.receiver_name = item.receiver_name || $scope.hpxBidding.receiver_name;
        $scope.payModel.receiver_avg_star = item.receiver_avg_star || $scope.hpxBidding.receiver_avg_star;
        $scope.payModel.receiver_contact_name = item.receiver_contact_name || $scope.hpxBidding.receiver_contact_name;
        $scope.payModel.receiver_contact_phone = item.receiver_contact_phone || $scope.hpxBidding.receiver_contact_phone;

        billService.insertEnterpriseId($scope.billModel.id, $scope.payModel.bid_enterprise_id).then(function (data) {
            // 根据票据id查询双方银行卡信息
            payingService.getAccountPX($scope.billModel.id).then(function (data) {
                $scope.hpxAX = data;
                $scope.hpxContract = data.receiverAccount;
            })
        })
        enterpriseXingService.enterpriseXingyeUser($rootScope.identity.enterprise_id).then(function (data) {
            $scope.drawEnterprise = data;
        })
        enterpriseXingService.enterpriseXingyeUser($scope.payModel.bid_enterprise_id).then(function (data0) {
            $scope.reawEnterprise = data0;
        })
    };
    $scope.openAccountModal = function (item) {
        $scope.wanShan = {
            wanS: '您的票据信息还不完善',
            wanB: '请完善票据信息',
            wanBill: '修改票据信息后',
            wanCill: '请重新确认出票方信息'
        };
        var dd;
        var ee;
        if ($scope.filter.check == 4) {
            dd = $scope.wanShan.wanBill;
            ee = $scope.wanShan.wanCill;
        } else {
            dd = $scope.wanShan.wanS;
            ee = $scope.wanShan.wanB;
        }
        // 获取竞价方信息
        $scope.payModel = {};
        $scope.payModel.payId = item.id;
        $scope.payModel.bid_every_plus = item.bid_every_plus;
        $scope.payModel.bid_enterprise_id = item.bid_enterprise_id;
        $scope.payModel.bid_rate = item.bid_rate;
        $scope.payModel.bid_deal_price = item.bid_deal_price;
        $scope.payModel.drawer_id = item.drawer_id;
        $scope.payModel.bill_rate = item.bid_rate;
        $scope.payModel.receiver_id = item.receiver_id;
        $scope.payModel.receiver_name = item.receiver_name;
        $scope.payModel.receiver_avg_star = item.receiver_avg_star;
        $scope.payModel.receiver_contact_name = item.receiver_contact_name;
        $scope.payModel.receiver_contact_phone = item.receiver_contact_phone;

        $scope.bidBillY = item;
        if ($scope.billModel.trade_type_code == 702 && $scope.billModel.bill_type_id == 101 && $scope.billModel.publisher_id == $rootScope.identity.enterprise_id && ($scope.hpxBidding.is_checked == -1 || $scope.hpxBidding.bill.is_checked == 1) && ($scope.model.bill_front_photo_path == null || $scope.model.bill_back_photo_path == null || $scope.model.bill_number == null || $scope.model.bill_deadline_time == null || $scope.model.bill_deal_price == null || $scope.model.bill_rate == null)) {
            var myPopup = $ionicPopup.show({
                cssClass: 'hpxModals hpxshow',
                template: '<img style="width:70px;margin-bottom:22px;" src="images/hpxaa.png" alt=""/>' +
                          '<p style="margin-bottom:10px;">' + dd + '</p>' +
                          '<p>' + ee + '</p>',
                scope: $scope,
                buttons: [
                  { text: '否' },
                  {
                      text: '是',
                      type: 'button-positive',
                      onTap: function (e) {
                          $scope.addvModal.show();
                          //var btId = 101;
                          $scope.model = {
                              endorsement_number: 0,
                              contact_name: $rootScope.identity == null ? "" : $rootScope.identity.customer_name,
                              contact_phone: $rootScope.identity == null ? "" : $rootScope.identity.phone_number,
                              bill_type_id: 101,
                              trade_type_code: 702,
                              //bill_deadline_time: new Date().setYear(new Date().getFullYear() + 1),
                              //product_deadline_time: new Date(new Date().setYear(new Date().getFullYear() + 1)),
                          };
                          $scope.filter = {
                              tradetype: 0,
                              perfect: false
                          }
                          //获取客户信息中的省市地址信息
                          init = function () {
                              customerService.getCustomer().then(function (data) {
                                  if (data.trade_location_province_id && data.trade_location_city_id) {
                                      $scope.model.product_province_id = data.trade_location_province_id;

                                      addressService.queryCity(data.trade_location_province_id).then(function (data) {
                                          $scope.cityData = data;
                                      });
                                      $scope.model.product_location_id = data.trade_location_city_id;
                                  }
                              });
                          };
                          init();

                          constantsService.queryConstantsType(4).then(function (data) {
                              $scope.acceptorTypeData = data;
                          })
                          if ($stateParams.perfect) {
                              $scope.filter.perfect = $stateParams.perfect
                          }
                          //获取我的发布详细信息
                          if ($scope.billId) {
                              billService.getBillProduct($scope.billId).then(function (data) {
                                  $scope.model = data;
                                  $scope.modelCopy = angular.copy(data);// =new data;
                                  $scope.billModel = data;
                                  //$scope.model.drawer_account_id = $stateParams.accountId;
                                  $scope.model.account_id = $stateParams.accountId;
                                  $scope.model.contract_num = $stateParams.contract_num;
                                  $scope.model.product_deadline_time = new Date($scope.model.bill_deadline_time);
                              });
                          }

                          $scope.$watch('model.bill_deadline_date', function (newValue, oldValue) {
                              if (newValue === oldValue) { return; } // AKA first run
                              $scope.model.bill_deadline_time = new Date($scope.model.bill_deadline_date).getTime();
                          });
                          $scope.choiceEBillType = function () {
                              $scope.model.bill_type_id = 101;
                              $scope.model.bill_deadline_time = new Date().setYear(new Date().getFullYear() + 1);
                              $scope.model.product_deadline_time = new Date($scope.model.bill_deadline_time);
                          };
                          //选择纸票
                          $scope.choicePBillType = function () {
                              $scope.model.bill_type_id = 102;
                              $scope.model.bill_deadline_time = new Date().setMonth(new Date().getMonth() + 6);
                              $scope.model.product_deadline_time = new Date($scope.model.bill_deadline_time);
                          };

                          $scope.choiceNTradeType = function () {
                              $scope.model.trade_type_code = 702;
                          };
                          //获取全部省级地址
                          addressService.queryAll().then(function (data) {
                              $scope.provinceData = data;
                              $scope.provinceChange();
                          });
                          //获取各省市下面的市区
                          $scope.provinceChange = function () {
                              if (!$scope.model.product_province_id) {
                                  $scope.cityData = [];
                              } else if ($scope.model.product_province_id == 1 || $scope.model.product_province_id == 20 || $scope.model.product_province_id == 860 || $scope.model.product_province_id == 2462) {
                                  $scope.filter.tradeProvinceId = $scope.model.product_province_id + 1;
                                  return addressService.queryCity($scope.filter.tradeProvinceId).then(function (data) {
                                      $scope.cityData = data;
                                  });
                              } else {
                                  return addressService.queryCity($scope.model.product_province_id).then(function (data) {
                                      $scope.cityData = data;
                                  });
                              }
                          }
                          $scope.takePhoto = function (index) {

                              switch (index) {
                                  case 0:

                                      $scope.$takePhoto(function (data) {
                                          $scope.model.bill_front_photo_path = data;
                                          $scope.$uploadPhoto($scope.model.bill_front_photo_path, function (data) {
                                              data = JSON.parse(data);
                                              $scope.model.bill_front_photo_id = data.data.id;
                                              $scope.model.bill_front_photo_path = data.data.file_path;
                                          });
                                      });
                                      break;
                                  case 1:
                                      $scope.$takePhoto(function (data) {
                                          $scope.model.bill_back_photo_path = data;
                                          $scope.$uploadPhoto($scope.model.bill_back_photo_path, function (data) {
                                              data = JSON.parse(data);
                                              $scope.model.bill_back_photo_id = data.data.id;
                                              $scope.model.bill_back_photo_path = data.data.file_path;
                                          });
                                      });
                                      break;
                              }
                          };
                          //汇票正面图片放大功能
                          $scope.setFrontID = function (response) {
                              $timeout(function () {
                                  $scope.model.bill_front_photo_id = response.data.data.id;
                                  $scope.model.bill_front_photo_path = response.data.data.file_path;
                                  $('.jqzoom_front').imagezoom();
                              })
                          };
                          //汇票背面图片放大功能
                          $scope.setBackID = function (response) {
                              $timeout(function () {
                                  $scope.model.bill_back_photo_id = response.data.data.id;
                                  $scope.model.bill_back_photo_path = response.data.data.file_path;
                                  $('.jqzoom_back').imagezoom();
                              })
                          };
                          //汇票正面图片移除功能
                          $scope.removeFront = function () {
                              $scope.model.bill_front_photo_id = null;
                              $scope.model.bill_front_photo_path = '';
                          }
                          //汇票背面图片移除功能
                          $scope.removeBack = function () {
                              $scope.model.bill_back_photo_id = null;
                              $scope.model.bill_back_photo_path = '';
                          }
                          //上传图片后，点击图片跳转页面，放大图片
                          $scope.showFront = function () {
                              window.open('index.html#/img?path=' + $scope.model.bill_front_photo_path);
                          }
                          //上传图片后，点击图片跳转页面，放大图片
                          $scope.showBack = function () {
                              window.open('index.html#/img?path=' + $scope.model.bill_back_photo_path);
                          }

                          $scope.enclosure = [];
                          $scope.model.bill_back_files = [];

                          //  confirm 对话框
                          $scope.showConfirm = function () {
                              var confirmPopup = $ionicPopup.confirm({
                                  title: '提  示',
                                  template: '确定要发布汇票吗?',
                                  cancelText: '否',
                                  okText: '是',
                                  cssClass: 'hpxModals'
                              });
                              confirmPopup.then(function (res) {
                                  if (res) {
                                      //发布汇票信息
                                      billService.updateBillHpx($scope.billId, $scope.model).then(function (data) {
                                          $scope.accountModel = {
                                              account_person: $scope.model.drawer_name,
                                          }
                                          $scope.model.drawer_account_id = null;

                                          var enterpriseId = $rootScope.identity.enterprise_id
                                          //payingService.getAccount(enterpriseId).then(function (data) {
                                          //    $scope.accounts = data.acct_list;
                                          //})
                                          // 根据票据id查询已经鉴权成功的银行卡
                                          payingService.getAccountPX($scope.billId).then(function (data) {
                                              $scope.accounts = data.drawerAccount;
                                          })
                                          $scope.payModel = {};
                                          $scope.payModel.payId = item.id;
                                          $scope.payModel.bid_every_plus = item.bid_every_plus;
                                          $scope.payModel.bid_enterprise_name = item.bid_enterprise_name;
                                          $scope.payModel.bid_enterprise_id = item.bid_enterprise_id;
                                          $scope.payModel.bid_deal_price = item.bid_deal_price;
                                          $scope.payModel.bill_rate = item.bid_rate;
                                          $scope.payModel.receiver_name = item.receiver_name;
                                          $scope.payModel.receiver_avg_star = item.receiver_avg_star;
                                          $scope.payModel.receiver_contact_name = item.receiver_contact_name;
                                          $scope.payModel.receiver_contact_phone = item.receiver_contact_phone;

                                          billService.insertEnterpriseId($scope.billId, $rootScope.identity.enterprise_id).then(function (data) {
                                              payingService.getAccountPX($scope.billId).then(function (data) {
                                                  $scope.hpxAX = data;
                                                  $scope.hpxContract = data.receiverAccount;
                                              })
                                              
                                          })
                                          $scope.addvModal.hide();
                                          $scope.accountModal.show();
                                          $scope.showFinishBidding(item);
                                      });
                                  }
                              });
                          };

                          $scope.save = function () {
                              //校验，提示信息
                              if (!$scope.model.bill_type_id) {
                                  $ionicPopup.alert({
                                      title: '提示',
                                      template: '请选择票据类型',
                                      okText: '确    定',
                                      cssClass: 'hpxModal'
                                  });
                                  return;
                              }
                              if (!$scope.model.trade_type_code) {

                                  $ionicPopup.alert({
                                      title: '提示',
                                      template: '请选择交易方式！',
                                      okText: '确    定',
                                      cssClass: 'hpxModal'
                                  });
                                  return;
                              }

                              if (!$scope.model.bill_sum_price) {
                                  $ionicPopup.alert({
                                      title: '提示',
                                      template: '请输入票面金额！',
                                      okText: '确    定',
                                      cssClass: 'hpxModal'
                                  });
                                  return;
                              }
                              if (!$scope.model.acceptor_type_id) {
                                  $ionicPopup.alert({
                                      title: '提示',
                                      template: '请选择承兑机构！',
                                      okText: '确    定',
                                      cssClass: 'hpxModal'
                                  });
                                  return;
                              }
                              if (!$scope.model.acceptor_name) {
                                  $ionicPopup.alert({
                                      title: '提示',
                                      template: '请输入承兑人全称！',
                                      okText: '确    定',
                                      cssClass: 'hpxModal'
                                  });
                                  return;
                              }
                              if (!$scope.model.bill_number) {
                                  $ionicPopup.alert({
                                      title: '提示',
                                      template: '请输入票据号！',
                                      okText: '确    定',
                                      cssClass: 'hpxModal'
                                  });
                                  return;
                              }
                              if ($scope.model.bill_number.length < 30) {
                                  $ionicPopup.alert({
                                      title: '提示',
                                      template: '请输入正确的票据号！',
                                      okText: '确    定',
                                      cssClass: 'hpxModal'
                                  });
                                  return;
                              }
                              if ($scope.model.trade_type_code == 702) {
                                  if (!$scope.model.bill_front_photo_id) {
                                      $ionicPopup.alert({
                                          title: '提示',
                                          template: '请上传汇票正面！',
                                          okText: '确    定',
                                          cssClass: 'hpxModal'
                                      });
                                      return
                                  }
                              }

                              $scope.model.bill_flaw_ids = [];
                              $scope.model.bill_type_id = parseInt($scope.model.bill_type_id);
                              $scope.model.trade_type_code = parseInt($scope.model.trade_type_code);

                              $scope.showConfirm();

                          }

                          //图片放大弹框
                          $ionicModal.fromTemplateUrl('imgMagnify.html', {
                              scope: $scope,
                          }).then(function (modal) {
                              $scope.imgMagnifyModal = modal;
                          });

                          $scope.openImgMagnifyModal = function (img_path) {
                              if (img_path) {
                                  $scope.imgMagnifyModal.show();
                                  $scope.img_path = img_path;
                              }
                          }

                          $scope.closeImgMagnifyModal = function () {
                              $scope.imgMagnifyModal.hide();
                          }
                          //获取全部省级地址
                          addressService.queryAll().then(function (data) {
                              $scope.provinceData = data;
                              $scope.provinceChange();
                          });
                          //获取各省市下面的市区
                          $scope.provinceChange = function () {
                              if (!$scope.model.product_province_id) {
                                  $scope.cityData = [];
                              } else if ($scope.model.product_province_id == 1 || $scope.model.product_province_id == 20 || $scope.model.product_province_id == 860 || $scope.model.product_province_id == 2462) {
                                  $scope.filter.tradeProvinceId = $scope.model.product_province_id + 1;
                                  return addressService.queryCity($scope.filter.tradeProvinceId).then(function (data) {
                                      $scope.cityData = data;
                                  });
                              } else {
                                  return addressService.queryCity($scope.model.product_province_id).then(function (data) {
                                      $scope.cityData = data;
                                  });
                              }
                          }

                      }
                  },
                ]
            });

        } else {
            $scope.accountModal.show();
            $scope.showFinishBidding(item);
        }
    };
    $scope.finishBidding = function () {
        if (!$scope.AccountR && $scope.bill_type_id == 101) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先选择收款账户！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.filter.rule) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读并同意质押协议！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '确认选择该收票人进行交易吗?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });      
        confirmPopup.then(function (res) {
            if (res) {
                $scope.model.bill_product_id = $scope.billId;
                $scope.model.bill_product_bidding_id = $scope.payModel.payId;
                $scope.model.is_NeedXY = 1;
                $scope.model.type = "bidding";
                if ($scope.billModel.bill_type_id == 101) {
                    $scope.model.contract_num = $scope.firstSign.contract_num;
                    $scope.model.id = $scope.accountModel.account_id;
                } else {
                    $scope.model.contract_num = 0;
                    $scope.model.id = 0;
                }
                             
                if (($scope.model.trade_type_code == 702 && $scope.model.bill_type_id == 101) || ($scope.hpxBidding.bill.trade_type_code == 702 && $scope.hpxBidding.bill.bill_type_id == 101)) {
                    billService.generateOrders($scope.model).then(function (data) {
                        $scope.hpxYuS = 1;
                        setTimeout(function () {
                            $ionicPopup.alert({
                                title: '提示',
                                template: '确认交易方成功！',
                                okText: '确    定',
                                cssClass: 'hpxModal'
                            });
                            $scope.addvModal.hide();
                            $state.go("app.myReleaseElecAll");
                        }, 350);
                    })
                }

                if ($scope.billModel.trade_type_code == 701 || (($scope.billModel.trade_type_code == 702 || $scope.hpxBidding.bill.trade_type_code == 702) && ($scope.billModel.bill_type_id == 102 || $scope.hpxBidding.bill.bill_type_id == 102))) {
                    
                    billService.newOrderBidding({ 'bill_product_id': $scope.billModel.id, 'bill_product_bidding_id': $scope.payModel.payId, 'is_NeedXY': 1, 'type': 'bidding', 'contract_num': $scope.model.contract_num, 'account_id': $scope.model.id }).then(function (data) {
                        if ($scope.billModel.bill_type_id == 101) {
                            billService.getBillProduct($scope.billModel.id).then(function (data) {
                                $scope.filter.order_id = data.order_id;
                                $scope.billModel = data;
                                orderService.updateOrderAccountDrawer($scope.filter.order_id, $scope.accountModel.account_id).then(function () {

                                    setTimeout(function () {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: '确认交易方成功！',
                                            okText: '确    定',
                                            cssClass: 'hpxModal'
                                        });
                                        $state.go("app.myReleaseElecAll");
                                    }, 350);
                                });

                                billService.getBillProductBidding($stateParams.myReleaseBillId).then(function (data) {
                                    $scope.biddings = data;
                                    angular.forEach(data, function (ele, i) {
                                        $scope.Re = ele;
                                    })
                                });
                            });
                        } else {
                            $state.go("app.myReleaseElecAll");
                        }
                    });
                }
            }
        });
    }


    //弹出支付窗口
    $ionicModal.fromTemplateUrl('payPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.payModal = modal;
    });
    // 点击付款按钮
    $scope.payShow = function () {
        payingService.getAccountPY($scope.orderModel.bill_id).then(function (data) {
            $scope.hpxGetAcc = data;
            $scope.hfindAccX = data.drawerAccount;
            $scope.hfindAccY = data.receiverAccount;
        })
        $scope.payModal.show();
        angular.forEach($scope.biddings, function (ele, ind) {
            //$scope.phxPay = {
            //    withdrawal_procedure: 10,
            //    hpxZong: 0
            //}
            //if ($scope.billModel.bill_type_id == 101) {
            //    if ($scope.biddingModel.bid_deal_price <= 100000.00) {
            //        $scope.phxPay.withdrawal_procedure = 10;
            //    } else if ($scope.biddingModel.bid_deal_price > 100000.00 && $scope.biddingModel.bid_deal_price <= 500000.00) {
            //        $scope.phxPay.withdrawal_procedure = 15;
            //    } else if ($scope.biddingModel.bid_deal_price > 500000.00 && $scope.biddingModel.bid_deal_price <= 1000000.00) {
            //        $scope.phxPay.withdrawal_procedure = 20;
            //    } else if ($scope.biddingModel.bid_deal_price > 1000000.00) {
            //        $scope.phxPay.withdrawal_procedure = $scope.biddingModel.bid_deal_price * 0.00002;
            //        if ($scope.phxPay.withdrawal_procedure >= 200) {
            //            $scope.phxPay.withdrawal_procedure = 200;
            //        }
            //    }
            //} else if ($scope.billModel.bill_type_id == 102) {
            //    $scope.phxPay.withdrawal_procedure = 0;
            //}
            $scope.phxPay.amount = $scope.biddingModel.bid_deal_price;
            $scope.bidPoundage();
            $scope.hpxZ = Number($scope.phxPay.withdrawal_procedure) + Number(ele.bid_deal_price);
            $scope.phxPay.hpxZong = Number($scope.hpxZ).toFixed(2);
        })

        enterpriseXingService.enterpriseXingyeUser($scope.billModel.publisher_id).then(function (data) {
            $scope.drawsEnterprise = data;
        })
        enterpriseXingService.enterpriseXingyeUser($scope.billModel.receiver_id).then(function (data) {
            $scope.reawsEnterprise = data;
        })
    };
    //支付票款
    $scope.pay = function () {
        if (!$scope.filter.payRule) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读并同意质押协议！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        else {
            payingService.getVacctNos($scope.hfindAccY.saler_buyer_v_acct_no, $scope.secondSing.contractNum, $scope.orderModel.bill_id).then(function (data) {
                $scope.xuNiS = data;
            })
            $scope.orderModel.receiver_account_id = $scope.hfindAccY.id;
            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '确定要支付票据款?',
                cancelText: '否',
                okText: '是',
                cssClass: 'hpxModals'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    payingService.queryAccount($rootScope.identity.token).then(function (data) {
                        $scope.queryAccountS = data
                        if ($scope.hfindAccY.saler_buyer_v_acct_no == data.corp.v_acct.acct_no) {
                            $scope.hpxYu = Number(data.corp.v_acct.balance).toFixed(2);
                        } else {
                            $scope.hpxYu = Number(data.corp.general_v_accts[0].balance).toFixed(2);
                        }
                        //console.log($scope.hpxYu)
                        if ($scope.hpxYu < $scope.phxPay.hpxZong) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: '您的兴业执剑人见证代管系统账户余额不足，请至PC官网进行充值付款。' +
                                           '<p style="font-size:0.3rem;margin-top:6px;">您的兴业账户当前余额：<span style="color:#f55a14;">' + $scope.hpxYu + '</span>元</p>' +
                                           '<p style="font-size:0.3rem;margin-top:6px;">您需要支付的金额：<span style="color:#f55a14;">' + $scope.phxPay.hpxZong + '</span>元</p>',
                                okText: '确    定',
                                cssClass: 'hpxModal hpxTi'
                            });
                            $scope.payModal.hide();
                            $state.go('app.myBidding');
                        } else {
                            orderService.updateOrderAccountReceiver($scope.orderModel.id, $scope.hfindAccY.id).then(function (data) {
                                orderService.updateOrderReceiver($scope.orderModel.id, $scope.orderModel).then(function (data) {
                                    // , $rootScope.identity.phone_number, $scope.orderModel.verify_code
                                    payingService.orderPay($scope.orderModel.order_number, $scope.xuNiS.saller_vacct_no, $scope.xuNiS.buyer_vacct_no, $stateParams.myReleaseOrderId).then(function (data) {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: '付款成功！',
                                            okText: '确    定',
                                            cssClass: 'hpxModal'
                                        });
                                        $state.go("app.myBidding")
                                    });

                                });
                            });
                        }
                    })
                }
            })
        }
    };
    // 弹出背书窗口
    $ionicModal.fromTemplateUrl('endorsePopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.endorseModal = modal;
    });
    //确认背书
    $scope.endorsement = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '是否确认背书?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                orderService.orderEndorsement($scope.orderModel.id).then(function () {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '出票方背书成功！',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                });
                $state.go("app.myReleaseElecAll");
            }
        });
    };
    //乙方签收背书
    $scope.validate = function () {
        //alert($rootScope.identity.token);
        var confirmPopup = $ionicPopup.confirm({
            title: '确认签收背书?',
            template: '如果未经核实进行操作，后果自负！！！',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                payingService.confirmXYPay($scope.orderModel.id).then(function () {
                    $ionicPopup.alert({
                        title: '提示',
                        template: ' <p>签收成功！</p>'+
                                  '<p>请等待系统核验解冻资金。</p>',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    $state.go('app.myBidding');
                });
            }
        });
    }
    //评价界面
    $ionicModal.fromTemplateUrl('evaluate.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.evaluateModal = modal;
    });
    //图片放大弹框
    $ionicModal.fromTemplateUrl('imgMagnify.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.imgMagnifyModal = modal;
    });

    $scope.getEndorsementURL = function (input) {
        if (typeof input == "undefined") return "";
        if (input.length > 0) {
            var url = input.split(".");
            url[url.length - 2] = url[url.length - 2] + "-1";
            return url.join(".");
        }
        return "";
    }
    $scope.openImgMagnifyModal = function (img_path, t) {
        if (img_path) {
            $scope.imgMagnifyModal.show();
            if (t) $scope.img_path = $scope.getEndorsementURL(img_path);
            else $scope.img_path = img_path;
        }
    }

    $scope.closeImgMagnifyModal = function () {
        $scope.imgMagnifyModal.hide();
    }

    $scope.closeEndorseModal = function () {
        $scope.endorseModal.hide();
    };

    $scope.$on('$destroy', function () {
        $scope.endorseModal.remove();
    });

    //验证码获取模块
    $scope.verifyStr = "获取验证码";

    $scope.openPayModal = function () {
        $scope.payModal.show();
    };

    $scope.closePayModal = function () {
        $scope.payModal.hide();
    };

    $scope.$on('$destroy', function () {
        $scope.payModal.remove();
    });

    $scope.closeAccountModal = function () {
        $scope.accountModal.hide();
        $state.go('app.myReleaseElecAll')
    };

    $scope.$on('$destroy', function () {
        $scope.accountModal.remove();
    });


    $scope.openEvaluateModal = function (item) {
        $scope.evaluateModal.show();
        if ($scope.billModel.bill_type_id == 101) {
            $scope.evaluateModel.bill_status_code = $scope.orderModel.bill_status_code;
            $scope.evaluateModel.order_status_id = $scope.orderModel.order_status_id;
            $scope.evaluateModel.type_id = $scope.orderModel.bill_type_id;
            $scope.evaluateModel.to_id = $scope.orderModel.id;
            if ($scope.orderModel.bill_status_code > 810) {
                enterprisesService.getorderAppraisal($scope.evaluateModel.type_id, $scope.evaluateModel.to_id).then(function (data) {
                    //swal("hello");
                    $scope.drawerevalutaModel = data.drawer_appraisal;
                    $scope.receiverevalutaModel = data.receiver_appraisal;
                    //$scope.addevaluateModel = data;
                    //console.log(data.drawer_appraisal);
                });
            }
        } else if ($scope.billModel.bill_type_id == 102) {
            $scope.evaluateModel.bill_status_code = $scope.billModel.bill_status_code;
            $scope.evaluateModel.type_id = $scope.billModel.bill_type_id;
            $scope.evaluateModel.to_id = $scope.billModel.id;
            if ($scope.evaluateModel.bill_status_code > 810) {
                enterprisesService.getorderAppraisal($scope.evaluateModel.type_id, $scope.evaluateModel.to_id).then(function (data) {
                    //swal("hello");
                    $scope.drawerevalutaModel = data.drawer_appraisal;
                    $scope.receiverevalutaModel = data.receiver_appraisal;
                    //$scope.addevaluateModel = data;
                });
            }

        };
    };

    $scope.closeEvaluateModal = function () {
        $scope.evaluateModal.hide();
    };

    $scope.$on('$destroy', function () {
        $scope.evaluateModal.remove();
    });

    $scope.openBidModal = function () {
        $scope.bidModal.show();
        $scope.biddingModel = {
            bill_product_id: $scope.billModel.id,
            bid_enterprise_name: $rootScope.identity.enterprise_name,
        };
    };

    $scope.closeBidModal = function () {
        $scope.bidModal.hide();
    };

    $scope.$on('$destroy', function () {
        $scope.bidModal.remove();
    });


    //确认成交
    $scope.submitbillnew = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '是否线下已完成交易?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                billService.finishBillNew($scope.billModel.id).then(function (data) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: ' 已成功确认成交！',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    $state.go("app.myReleaseElecAll")
                });
            }
        });
    }

    //贴息计算
    $scope.ratechange = function () {
        $scope.rateModel = {};
        if ($scope.biddingModel.bid_rate > 0 || $scope.biddingModel.bill_rate > 0) {
            var newDate = new Date();

            $scope.rateModel.start_time = $filter('date')(newDate, 'yyyy-MM-dd');
            $scope.rateModel.end_time = $filter('date')($scope.billModel.bill_deadline_time, 'yyyy-MM-dd');

            $scope.rateModel.denomination = $scope.billModel.bill_sum_price / 10000;
            $scope.rateModel.commission = 0;

            //$scope.phxPay = {
            //    withdrawal_procedure: 10,
            //    hpxZong: 0
            //}

            if ($scope.billModel.trade_type_code == 701) {
                if ($scope.billModel.bill_type_id == 102) {
                    $scope.rateModel.interest_month = $scope.biddingModel.bid_rate;
                    $scope.rateModel.adjust_day = 3;
                } else if ($scope.billModel.bill_type_id == 101) {
                    $scope.rateModel.interest_year = $scope.biddingModel.bid_rate;
                    $scope.rateModel.adjust_day = 0;
                    $scope.rateModel.every_plus = $scope.biddingModel.bid_every_plus;
                }
                //$scope.rateModel.every_plus = 0;
                toolService.calculator($scope.rateModel).then(function (data) {
                    $scope.biddingModel.bid_rate_price = data.discount_interest;
                    $scope.biddingModel.bid_deal_price = data.discount_amount;

                    //if ($scope.billModel.bill_type_id == 101) {
                    //    console.log($scope.biddingModel.bid_deal_price)
                    //    if ($scope.biddingModel.bid_deal_price <= 100000.00) {
                    //        $scope.phxPay.withdrawal_procedure = 10;
                    //    } else if ($scope.biddingModel.bid_deal_price > 100000.00 && $scope.biddingModel.bid_deal_price <= 500000.00) {
                    //        $scope.phxPay.withdrawal_procedure = 15;
                    //    } else if ($scope.biddingModel.bid_deal_price > 500000.00 && $scope.biddingModel.bid_deal_price <= 1000000.00) {
                    //        $scope.phxPay.withdrawal_procedure = 20;
                    //    } else if ($scope.biddingModel.bid_deal_price > 1000000.00) {
                    //        $scope.phxPay.withdrawal_procedure = Number($scope.biddingModel.bid_deal_price * 0.00002).toFixed(2);
                    //        if ($scope.phxPay.withdrawal_procedure >= 200) {
                    //            $scope.phxPay.withdrawal_procedure = 200;
                    //        }
                    //    }
                    //} else if ($scope.billModel.bill_type_id == 102) {
                    //    $scope.phxPay.withdrawal_procedure = 0;
                    //}

                    $scope.phxPay.amount = $scope.biddingModel.bid_deal_price;
                    $scope.bidPoundage();
                    $scope.phxPay.hpxZong = Number($scope.phxPay.withdrawal_procedure) + Number($scope.biddingModel.bid_deal_price);
                    $rootScope.hpxAll = $scope.phxPay.hpxZong;

                });
            } else if ($scope.billModel.trade_type_code == 702) {
                $scope.rateModel.every_plus = $scope.biddingModel.bill_rate;
                toolService.calculator($scope.rateModel, 'ten').then(function (data) {
                    $scope.biddingModel.bid_rate_price = data.discount_interest;
                    $scope.biddingModel.bid_deal_price = data.discount_amount;

                    //if ($scope.billModel.bill_type_id == 101) {
                    //    if ($scope.biddingModel.bid_deal_price <= 100000.00) {
                    //        $scope.phxPay.withdrawal_procedure = 10;
                    //    } else if ($scope.biddingModel.bid_deal_price > 100000.00 && $scope.biddingModel.bid_deal_price <= 500000.00) {
                    //        $scope.phxPay.withdrawal_procedure = 15;
                    //    } else if ($scope.biddingModel.bid_deal_price > 500000.00 && $scope.biddingModel.bid_deal_price <= 1000000.00) {
                    //        $scope.phxPay.withdrawal_procedure = 20;
                    //    } else if ($scope.biddingModel.bid_deal_price > 1000000.00) {
                    //        $scope.phxPay.withdrawal_procedure = Number($scope.biddingModel.bid_deal_price * 0.00002).toFixed(2);
                    //        if ($scope.phxPay.withdrawal_procedure >= 200) {
                    //            $scope.phxPay.withdrawal_procedure = 200;
                    //        }
                    //    }
                    //} else if ($scope.billModel.bill_type_id == 102) {
                    //    $scope.phxPay.withdrawal_procedure = 0;
                    //}
                    $scope.phxPay.amount = $scope.biddingModel.bid_deal_price;
                    $scope.bidPoundage();
                    $scope.phxPay.hpxZong = Number($scope.phxPay.withdrawal_procedure) + Number($scope.biddingModel.bid_deal_price);
                    $rootScope.hpxAll = $scope.phxPay.hpxZong;

                });
            }

        }
    };

    // 甲方弹出质押协议
    $scope.jiafang = function () {
        if (!$scope.AccountR) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先选择银行卡！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        } else {
            $scope.submitRule();
        }
    }
    $scope.submitRule = function () {
        var todayDate = new Date();
        $scope.filter.newYear = todayDate.getFullYear();
        $scope.filter.newMonth = todayDate.getMonth() + 1;
        $scope.filter.newToday = todayDate.getDate();
        $scope.filter.fromKeyWord = "";
        //$scope.panDuan = {
        //    zhi: '‰',
        //    dian: '%',
        //    dianY: "￥",
        //    xian: "借款利率（年利率）",
        //    yu: "借款利息（每十万）[元]",
        //};
        //$scope.phxPay = {
        //    withdrawal_procedure: "",
        //    hpxZong:""
        //}
        var hdate = new Date($scope.billModel.bill_deadline_time);
        Y = hdate.getFullYear() + '-';
        M = (hdate.getMonth() + 1 < 10 ? '0' + (hdate.getMonth() + 1) : hdate.getMonth() + 1) + '-';
        D = hdate.getDate() < 10 ? '0' + hdate.getDate() : hdate.getDate();
        $scope.hpxDate = Y + M + D;

        //if ($scope.billModel.bill_type_id == 101) {
        //    console.log("贴现金额=" + $scope.payModel.bid_deal_price)
        //    if ($scope.payModel.bid_deal_price <= 100000.00) {
        //        $scope.phxPay.withdrawal_procedure = 10;
        //    } else if ($scope.payModel.bid_deal_price > 100000.00 && $scope.payModel.bid_deal_price <= 500000.00) {
        //        $scope.phxPay.withdrawal_procedure = 15;
        //    } else if ($scope.payModel.bid_deal_price > 500000.00 && $scope.payModel.bid_deal_price <= 1000000.00) {
        //        $scope.phxPay.withdrawal_procedure = 20;
        //    } else if ($scope.payModel.bid_deal_price > 1000000.00) {
        //        $scope.phxPay.withdrawal_procedure = Number($scope.payModel.bid_deal_price * 0.00002).toFixed(2);
        //        if ($scope.phxPay.withdrawal_procedure >= 200) {
        //            $scope.phxPay.withdrawal_procedure = 200;
        //        }
        //    }
        //} else if ($scope.billModel.bill_type_id == 102) {
        //    $scope.phxPay.withdrawal_procedure = 0;
        //}
        $scope.phxPay.amount = $scope.payModel.bid_deal_price;
        $scope.bidPoundage();
        $scope.phxPay.hpxZong = Number($scope.phxPay.withdrawal_procedure).toFixed(2) + Number($scope.payModel.bid_deal_price).toFixed(2);
        $rootScope.hpxAll = $scope.phxPay.hpxZong;
        var myPopup = $ionicPopup.show({
            cssClass: 'hpxModalZ',
            title: '票据应收款转让服务合同',
            template: '<div class="zhiEnterprise">' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">甲方（转让方）：</label>' +
                      '<span class="hpxPart1">' + $rootScope.identity.enterprise_name + '</span>' +
                      '<div class="clear"></div>'+
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">法定代表人或负责人：</label>' +
                      '<span class="hpxPart2">' + $scope.drawEnterprise.legalName + '</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">乙方（受让方）：</label>' +
                      '<span class="hpxPart1">' + $scope.payModel.receiver_name + '</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">法定代表人或负责人：</label>' +
                      '<span class="hpxPart2">' + $scope.reawEnterprise.legalName + '</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">丙方（信息平台）：</label>' +
                      '<span style="width: 51%;" class="hpxPart2">上海票趣信息科技有限公司</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '</div>' +
                      '<section style="font-size:0.3rem;" class="contractCon">' +
                      '<div style="text-indent: 2em;margin-bottom:10px;">根据《中华人民共和国合同法》、《中华人民共和国票据法》及相关法律法规的规定，甲乙丙三方在平等、自愿的基础上，就票据应收款转让及服务等有关事宜达成协议如下：</div>' +
                      '<strong>第一条 释义</strong>' +
                      '<div>' +
                      '<p><strong>一、甲方：</strong>指拟在丙方提供的信息平台上转让票据应收款的一方，根据本合同表述的需要，甲方在本合同中也可称之为转让方。</p>' +
                      '<p><strong>二、乙方：</strong>指拟在丙方提供的信息平台上受让票据应收款的一方，根据本合同表述的需要，乙方在本合同中也可称之为受让方。</p>' +
                      '<p><strong>三、信息平台：</strong>指丙方开发的汇票线平台，为交易双方提供交易服务的互联网网站及交易系统，根据本合同表述的需要，丙方在本合同中也可称之为信息平台。</p>' +
                      '<p><strong>四、标的票据：</strong>指转让方在信息平台上发布的转让方拟转让其票据应收款于受让方的商业汇票。</p>' +
                      '<p><strong>五、发布日：</strong>就一笔标的票据而言，指其发布时间所在日期。</p>' +
                      '<p><strong>六、兴业数字金融服务（上海）股份有限公司票据流转资金代管专户：</strong>指甲方、乙方、丙方同意，由丙方合作机构兴业数字金融服务（上海）股份有限公司（简称“兴业数金”）为方便转让方与受让方资金流转和安全而在兴业银行开立的票据流转资金代管专户（简称“票据流转资金代管专户”）。</p>' +
                      '<p><strong>七、转让服务费：</strong>指信息平台及合作机构兴业数金基于其为交易双方提供的票据应收款转让相关服务而向受让方单方收取的服务费。</p>' +
                      '<p><strong>八、提现费（电汇费）：</strong>指转让方提现产生的费用，实际上由受让方承担</p>' +
                      '<p><strong>九、票据应收款：</strong>指标的票据的承兑人承担的在票据到期日无条件支付的票据款项。</p>' +
                      '<p><strong>十、票据应收款转让：</strong>指转让方通过信息平台提供的服务在信息平台与受让方达成协议将票据背书转让方式将票据应收款无条件不可撤销地转让给受让方的行为。</p>' +
                      '<p><strong>十一、贴现金额：</strong>指转让方与受让方签订交易合同时所达成的成交金额，即信息平台于转让成功时自票据流转资金代管专户实际划入转让方收款账户的金额，其数额等于总扣款额减去服务费与提现费（电汇费）后的余额。</p>' +
                      '<p><strong>十二、总扣款额：</strong>指受让方就受让标的实际应支付的款项，即信息平台于受让方支付标的金额时实际从受让方账户里扣划至票据流转资金代管专户的款项，其数额等于贴现金额加上服务费与提现费（电汇费）后的金额。</p>' +
                      '<p><strong>十三、转让成功：</strong>本协议第六条第一款第5点条款赋予的含义。</p>' +
                      '<p><strong>十四、转让失败：</strong>本协议第六条第一款第6点、第7点相关条款赋予的含义。</p>' +
                      '</div>' +
                      '<strong>第二条 票据应收款的转让</strong>' +
                      '<div>' +
                      '<p>甲方同意根据本合同约定的条款及条件向乙方转让相应的票据应收款，乙方同意根据本合同约定的条款及条件向甲方支付本合同约定的金额。</p>' +
                      '</div>' +
                      '<strong>第三条 乙方对价支付的前提条件</strong>' +
                      '<div>' +
                      '<p>只有在以下条件全部满足的情形下，乙方才有义务向甲方支付受让票据的对价：</p>' +
                      '<p>1.本合同已生效；</p>' +
                      '<p>2.本合同项下甲方转让的标的票据不存在任何争议、纠纷。</p>' +
                      '<p>3.甲方已将标的票据成功背书给乙方。</p>' +
                      '</div>' +
                      '<strong>第四条 对价支付</strong>' +
                      '<div>' +
                      '<p>一、上述第三条约定的对价支付的前提条件全部满足之后，乙方委托丙方（并且甲方同意由乙方委托丙方）将数额等于实收金额的资金通过兴业银行资金代管专户转入甲方银行账户。</p>' +
                      '<p>二、本合同各方均同意，在前述第三条约定前提条件全部满足的情形下，丙方合作机构兴业数金将根据乙方的委托于成交日当日将乙方提前划入票据流转资金代管专户的数额等于实收金额的资金通过票据流转资金代管专户转入甲方指定的银行账户，但若因系统关闭或故障等待特殊原因无法成交日当日完成划款，则兴业数金可于下一个工作日完成划款。</p>' +
                      '<p>三、本合同各方均确认及同意有关款项的计算规则：甲方贴现金额（成交金额）=乙方总扣款额-转让服务费-提现费（电汇费）。</p>' +
                      '</div>' +
                      '<strong>第五条 转让服务费</strong>' +
                      '<div>' +
                      '<p>一、甲乙双方确认本合同基于丙方提供的转让服务达成，并同意由乙方单方面向丙方支付转让服务费；甲乙双方无条件不可撤销地同意，委托兴业数金通过其自主研发的执剑人票据见证代管系统为甲乙双方提供票据流转见证、资金代管等服务，由此产生的相关服务费包含在乙方向丙方支付的转让服务费中并由丙方代收。</p>' +
                      '<p>二、转让服务费等于乙方实际支付的实扣金额与甲方实际收取金额之间的差额，转让服务费=转让票据票面金额*转让服务费率，乙方同意根据本合同约定的服务费率向丙方支付转让服务费。转让服务费率以丙方公布的收费规则为准。</p>' +
                      '<p>三、乙方委托兴业数金代管资金时，其向票据流转资金代管专户划转受让票据应收款的资金时应同时将转让服务费一并转让。</p>' +
                      '</div>' +
                      '<strong>第六条 信息对接、资金代转及划转服务</strong>' +
                      '<div>' +
                      '<p>一、 丙方及丙方合作机构根据标的票据转让订单为甲乙双方提供信息对接、资金代管及划转服务：</p>' +
                      '<p>1.转让方将拟转让的标的票据于丙方信息平台发布后，受让方对其进行报价，转让方同意成交金额并确认在线签署本合同后，订单生效，进入实际交易阶段。</p>' +
                      '<p>2.受让方在有效时间内（30分钟）成功提交有效付款指令将受让资金及相应服务费划转入票据流转资金代管专户后，兴业银行将自动将成交金额及服务费从受让方银行账户中划入票据流转资金代管专户，同时信息平台就该笔转让订单对受让方显示“你已支付交易款，请等待持票方完成背书”，对转让方显示“资金方已打款，请完成背书并确认”。</p>' +
                      '<p>3.当一笔标的票据在信息平台上对转让方显示“资金方已打款，请完成背书并确认”的状态时，转让方应当根据丙方及丙方合作机构执剑人票据见证代管系统的提示在有效时间内（30分钟）办理标的票据的背书手续；若转让方将标的票据成功背书给受让方，且转让方在有效时间内点击确认完成背书操作，则信息平台就该笔转让订单对转让方显示“你已完成背书，请等待资金方签收电票”，对受让方显示“持票方已背书，请完成签收和申请解冻交易款”；</p>' +
                      '<p>4.当一笔标的票据在信息平台上对受让方显示“持票方已背书，请完成签收和申请解冻交易款”的状态时，受让方应在有效时间（30分钟）内点击确认完成签收操作并解冻交易款。若受让方未在有效时间内接收票据背书，则视为拒绝接收票据背书。若在受让方签收票据背书之前，转让方撤销票据背书导致受让方无法签收票据，则视为撤销背书。</p>' +
                      '<p>5.若受让方接收标的票据背书后在信息平台确认签收并解冻交易款，丙方合作机构兴业银行通过执剑人票据见证代管系统将对标的票据的背书状态进行见证核实，若转让方成功将标的票据背书给受让方，则构成转让成功。转让成功后，则转让方可通过执剑人票据见证代管系统发出指令将票据流转资金代管专户内数额等于成交金额的资金划入转让方银行指定账户内；若受让方接收标的票据背书后未在信息平台确认签收并解冻交易款，且执剑人票据代管系统进行核验后，确认受让方已成功接收标的票据背书，则执剑人票据见证代管系统有权自行将票据流转资金代管专户内数额等于成交金额的资金划入转让方银行指定账户内，由此产生的任何后果由受让方承担。</p>' +
                      '<p>6.在前述情形下，若受让方未于有效时间内成功提交有效付款指令将资金转入票据流转资金代管专户，或受让方银行账户内资金不足成交金额及服务费，或受让方主动取消交易，或拒绝接收票据背书，则票据应收款转让失败，由此产生合同无法履行的责任由受让方承担。若受让方已经将资金转入票据流转资金代管专户，转让方未在有效时间将标的票据背书，或转让方在票据背书后撤销背书、或转让方主动取消交易，则票据应收款转让失败，由此产生合同无法履行的责任由转让方承担。</p>' +
                      '<p>7.转让失败的，信息平台向转让方及受让方发出转让失败通知，同时票据流转资金代管专户将账户内数额等于受让方实付金额的资金退回受让方执剑人票据见证代管系统的电子账户内；转让方与受让方将无法对该笔标的票据转让订单进行任何操作。</p>' +
                      '<p>二、信息平台正常发起转让的时间段为银行工作日的9：00-16：30，在16：30时后需要进行票据应收款转让见证审核的订单，将在次日进行；信息平台根据业务情况针对转让的时间段进行调整并经预先公告的，则按照公告后的时间段进行转让。</p>' +
                      '</div>' +
                      '<strong>第七条 甲方的保证与承诺</strong>' +
                      '<div>' +
                      '<p>一、甲方是一家根据中国法律设立的法人企业，自设立至今始终有效存续，且目前经营状况正常，具备签署本合同并履行合同义务的民事权利能力和民事行为能力，甲方应根据丙方要求提供营业执照等主体资格资料。</p>' +
                      '<p>二、 其签署本合同并履行本合同项下的义务（包括但不限于向乙方转让票据）已经得到甲方内部充分的授权，所需的外部审批及同意（若有）亦已全部取得。</p>' +
                      '<p>三、 签署本合同是甲方真实意思表示，本合同的签署不会导致违反适用于甲方的任何法律法规、规范性文件或甲方章程或类似文件，也不会违反其与任何第三方签订的任何协议或承诺；本合同生效后，将构成甲方有约束力及执行力的义务。</p>' +
                      '<p>四、 除本合同签署前已书面通知丙方的（若有）以外，甲方不存在任何可能对本合同履行产生重大不利影响的诉讼、仲裁、执行、申诉、复议、重组、破产、清算等程序及其他事件或情况。</p>' +
                      '<p>五、本合同项下的标的票据为合法、真实、有效且不存在票据诈骗等违法犯罪情形，不属于风险票据、已挂失票据或公示催告票据，标的票据记载事项完整，甲方为该标的票据的合法持有人并享有完整的票据应收款；</p>' +
                      '<p>六、 标的票据为甲方背书受让，甲方保证其直接前手的背书是真实有效并对其真实性负责；标的票据为甲方以其他合法方式取得的，甲方保证其受让是合法有效的并对合法性负责。</p>' +
                      '<p>七、 除根据本合同甲方与乙方之间因转让票据产生的权利及负担外，标的票据及票据应收款均不能存在本合同未做披露的任何债务负担或者第三方的权利主张、抵消权、质押或其他负担，甲方享有的票据收益权不存在本合同未做披露的法律上的障碍，且转让后票据应收款上不存在本合同未做披露的任何债务负担或第三方的权利主张或抵消权。</p>' +
                      '<p>八、 本合同生效后，甲方无权再对标的票据进行向除乙方之外的任何第三方转让标的票据。</p>' +
                      '<p>九、 甲方在丙方提交的标的票据信息、背书账户信息等信息真实有效，否则由甲方提供信息错误造成的一切损失由甲方承担。</p>' +
                      '<p>十、甲方在此无条件不可撤销地授权丙方及丙方的合作机构通过电子商业汇票系统查询标的票据的票面信息、背书记录、影像等相关信息，并委托丙方合作机构兴业数金代管票据应收款转让项下的款项。</p>' +
                      '<p>十一、 标的票据转让过程中，甲方所有操作必须依照信息平台的提示进行并保障甲方联系方式的畅通，否则由于甲方操作失误造成的一切损失由甲方承担。所需注意环节包括但不限于在订单进行中时，且满足本协议第6条情形下，甲方才可进行背书，并在对应环节有效时间内完成相应的操作行为，否则，自愿承担由此产生的全部不利结果。</p>' +
                      '<p>十二、 甲方保证履行本合同项下转让方的承诺及义务。</p>' +
                      '</div>' +
                      '<strong>第八条 乙方的保证与承诺</strong>' +
                      '<div>' +
                      '<p>一、乙方是一家根据中国法律设立的法人企业，自设立至今始终有效存续，且目前经营状况正常，具备签署本合同并履行合同义务的民事权利能力和民事行为能力，乙方应根据丙方要求提供营业执照等主体资格资料。</p>' +
                      '<p>二、 其签署本合同并履行本合同项下的义务已经得到乙方内部充分的授权，所需的外部审批及同意（若有）亦已全部取得。</p>' +
                      '<p>三、 签署本合同是乙方真实意思表示，本合同的签署不会导致违反适用于乙方的任何法律法规、规范性文件或乙方章程或类似文件，也不会违反其与任何第三方签订的任何协议或承诺；本合同生效后，将构成乙方有约束力及执行力的义务。</p>' +
                      '<p>四、乙方不存在任何可能对本合同履行产生重大不利影响的诉讼、仲裁、执行、申诉、复议、重组、破产、清算等程序及其他事件或情况。</p>' +
                      '<p>五、 乙方在丙方信息平台提交的标的票据被背书账户信息等真实有效，否则由乙方提供信息错误造成的一切损失由乙方承担。</p>' +
                      '<p>六、 乙方无条件不可撤销地授权丙方及丙方的合作机构通过电子商业汇票系统查询标的票据的票面信息、背书记录、影像等相关信息，并由丙方合作机构兴业数金代管票据应收款转让项下的资金。</p>' +
                      '<p>七、 标的票据转让过程中，乙方所有操作必须依照信息平台的提示进行并保障乙方联系方式的畅通，否则由于乙方操作失误造成的一切损失由乙方承担。所需注意环节包括但不限于满足本协议第六条情形下，乙方需及时根据本协议约定办理票据背书相关手续，并在对应环节有效时间内完成相关操作；否则，自愿承担由此产生的全部不利结果。</p>' +
                      '<p>八、乙方保证履行本合同项下受让方的承诺及义务。</p>' +
                      '</div>' +
                      '<strong>第九条 违约责任</strong>' +
                      '<div>' +
                      '<p>任何一方违反本合同项下任何承诺及保证或违反本合同项下任何其他义务，则构成违约。守约方有权要求违约方限期纠正违约行为并采取补救措施。违约方的违约行为给对方造成损失，应予赔偿。</p>' +
                      '</div>' +
                      '<strong>第十条 争议解决</strong>' +
                      '<div>' +
                      '<p>一、 任何一方本合同的订立、效力、解释、履行及争议的解决均适用中华人民共和国法律。</p>' +
                      '<p>二、 凡由本合同引起的或与本合同有关的争议和纠纷，各方应协商解决；不能协商或协商不能达成一致的，同意提交上海仲裁委员会根据其先行有效的仲裁规则仲裁解决，仲裁地点为上海市。</p>' +
                      '</div>' +
                      '<strong>第十一条 合同生效</strong>' +
                      '<div>' +
                      '<p>各方同意本合同以下任何一种形式生效：</p>' +
                      '<p>1.本合同自甲、乙、丙三方根据电子签名相关法律法规线上签署之日生效。</p>' +
                      '<p>2.本合同自甲、乙双方通过汇票线平台阅读并点击同意接受本合同后生效。</p>' +
                      '</div>' +
                      '<strong>第十二条 其他事宜</strong>' +
                      '<div>' +
                      '<p>本合同未尽事宜，由三方协商并签订补充合同确定，补充合同与本合同具有同等法律效力。</p>' +
                      '</div>' +
                      '<strong>第十三条 转让订单概要</strong>' +
                      '<div>' +
                      '<p>标的票据信息、背书人信息、被背书人信息、成交对价信息：</p>' +                    
                     '<div class="contractDetail">' +
                     '<div class="hpxBott hpxHead">标的票据信息概要</div>' +
                     '<p class="hpxBott">' +
                      '<label>票据类型：</label>' +
                      '<span>' + $scope.billModel.acceptor_type_name + '</span>' +
                      '</p>' +
                      '<div class="hpxBott">' +
                      '<p>票据号码：</p>' +
                      '<span style="display:block;width:85%;text-align:left;">' + $scope.billModel.bill_number + '</span>' +
                      '</div>' +
                      '<p class="hpxBott">' +
                      '<label>承兑人全称：</label>' +
                      '<span>' + $scope.billModel.acceptor_name + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>票面金额：</label>' +
                      '<span>￥' + $scope.billModel.bill_sum_price + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>汇票到期日：</label>' +
                      '<span>' + $scope.hpxDate + '</span>' +
                      '</p>' +
                      '<div class="hpxBott hpxHead">背书人信息（转让方）</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">背书人户名：</label>' +
                      '<span>' + $rootScope.identity.enterprise_name + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">背书人开户行：</label>' +
                      '<span>' + $scope.AccountR.bank_name + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">银行账号：</label>' +
                      '<span>' + $scope.AccountR.account_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">联行号：</label>' +
                      '<span>' + $scope.AccountR.bank_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott hpxHead">被背书人信息（受让方）</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">被背书人户名：</label>' +
                      '<span>' + $scope.payModel.receiver_name + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">被背书人开户行：</label>' +
                      '<span>' + $scope.hpxAX.receiverAccountName + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">银行帐号：</label>' +
                      '<span>' + $scope.hpxAX.receiverAccount.account_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">联行号：</label>' +
                      '<span>' + $scope.hpxAX.receiverAccount.bank_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott hpxHead">成交价格</div>' +
                      '<p class="hpxBott">' +
                      '<label>贴现金额[元]：</label>' +
                      '<span>￥' + $scope.payModel.bid_deal_price + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>服务费[元]：</label>' +
                      '<span>￥0</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label style="width:56%;">提现费（电汇费）[元]：</label>' +
                      '<span style="display:inline-block;width:43%;">￥' + $scope.phxPay.withdrawal_procedure + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>总扣款额[元]：</label>' +
                      '<span>￥' + $rootScope.hpxAll + '</span>' +
                      '</p>' +
                      '<div>甲方、乙方均已通读上述条款，甲方、乙方对其的本合同下的权利义务已充分熟悉；甲乙双方对本合同所有内容均无异议。</div>' +
                     '</div>'+
                      '</div>' +
                      '<div style="text-align: right;margin-top:0.14rem;">签订日期：' + $scope.filter.newYear + '年' + $scope.filter.newMonth + '月' + $scope.filter.newToday + '日</div>' +
                      '</section></div></div>',
            scope: $scope,
            buttons: [
              {
                  text: '取消',
                  onTap: function () {
                      $('#ownBillOfferks')[0].checked = false;
                  }

              },
              {
                  text: '同意并继续',
                  type: 'button-positive',
                  onTap: function (e) {
                      if (!$scope.filter.rule) {
                          $scope.filter.rule = true;
                      }
                      payingService.econtractFirstSign($scope.payModel.drawer_id, $scope.filter.fromKeyWord, $scope.model.id, $scope.payModel.payId).then(function (data) {
                          $scope.firstSign = data
                          $scope.contract = $scope.firstSign.contract_num
                          payingService.getVacctNo($scope.AccountR.v_acct_no, $scope.firstSign.contract_num, $scope.billModel.id).then(function (data) {
                              
                          });
                      });
                  }
              },
            ]
        });
    }




    $scope.accountChangeBill = function () {
        //i = $scope.model.drawer_account_id.indexOf('_',0)+1;
        //s=$scope.model.drawer_account_id.substr(i, 100);
        payingService.getAccountR($scope.billModel.drawer_account_id).then(function (data) {
            $scope.accountModel = data;
            $scope.filter.isaccount = 1;
        })
    }
    //获取支付方式类型信息
    constantsService.queryConstantsType(12).then(function (data) {
        $scope.orderPayTypeData = data;
    })
    //选择收款账户
    $scope.accountChange = function () {
        payingService.getAccountR($scope.model.id).then(function (data) {
            $("#ownBillOfferks")[0].checked = false;
            angular.forEach(data.acct_list, function (ele, i) {
                $scope.AccountR = ele;

            })
        })
    }
    //获取背书账号
    //customerService.getAllEnterpriseAccount(501).then(function (data) {
    //    $scope.accounts = data;
    //    $scope.addressModel = {};
    //    if (data) {
    //        $scope.addressModel.receiver_account_id = data[0].id;
    //    }
    //})

    // 乙方签署质押协议
    $scope.submitRuleY = function () {
        // 获取今日时间
        var todayDate = new Date();
        $scope.filter.newYear = todayDate.getFullYear();
        $scope.filter.newMonth = todayDate.getMonth() + 1;
        $scope.filter.newToday = todayDate.getDate();
        $scope.filter.fromKeyWord = "";
        // 获取汇票到期日
        var hdate = new Date($scope.billModel.bill_deadline_time);
        Y = hdate.getFullYear() + '-';
        M = (hdate.getMonth() + 1 < 10 ? '0' + (hdate.getMonth() + 1) : hdate.getMonth() + 1) + '-';
        D = hdate.getDate() < 10 ? '0' + hdate.getDate() : hdate.getDate();
        $scope.hpxDate = Y + M + D;
        
        

        // 计算提现手续费
        //if ($scope.billModel.bill_type_id == 101) {
        //    if ($scope.orderModel.order_total_price <= 100000.00) {
        //        $scope.phxPay.withdrawal_procedure = 10;
        //    } else if ($scope.orderModel.order_total_price > 100000.00 && $scope.orderModel.order_total_price <= 500000.00) {
        //        $scope.phxPay.withdrawal_procedure = 15;
        //    } else if ($scope.orderModel.order_total_price > 500000.00 && $scope.orderModel.order_total_price <= 1000000.00) {
        //        $scope.phxPay.withdrawal_procedure = 20;
        //    } else if ($scope.orderModel.order_total_price > 1000000.00) {
        //        $scope.phxPay.withdrawal_procedure = Number($scope.orderModel.order_total_price * 0.00002).toFixed(2);
        //        if ($scope.phxPay.withdrawal_procedure >= 200) {
        //            $scope.phxPay.withdrawal_procedure = 200;
        //        }
        //    }
        //} else if ($scope.billModel.bill_type_id == 102) {
        //    $scope.phxPay.withdrawal_procedure = 0;
        //}
        $scope.phxPay.amount = $scope.orderModel.order_total_price;
        $scope.bidPoundage();
        $scope.phxPay.hpxZong = Number($scope.phxPay.withdrawal_procedure).toFixed(2) + Number($scope.orderModel.order_total_price).toFixed(2);
        $rootScope.hpxAll = $scope.phxPay.hpxZong;


        var myPopup = $ionicPopup.show({
            cssClass: 'hpxModalZ',
            title: '票据应收款转让服务合同',
            template: '<div class="zhiEnterprise">' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">甲方（转让方）：</label>' +
                      '<span class="hpxPart1">' + $scope.billModel.drawer_name + '</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">法定代表人或负责人：</label>' +
                      '<span class="hpxPart2">' + $scope.drawsEnterprise.legalName + '</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">乙方（受让方）：</label>' +
                      '<span class="hpxPart1">' + $scope.billModel.receiver_name + '</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">法定代表人或负责人：</label>' +
                      '<span class="hpxPart2">' + $scope.reawsEnterprise.legalName + '</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '<div class="hpxContracS">' +
                      '<label style="font-size:0.33rem;">丙方（信息平台）：</label>' +
                      '<span style="width: 51%;" class="hpxPart2">上海票趣信息科技有限公司</span>' +
                      '<div class="clear"></div>' +
                      '</div>' +
                      '</div>' +
                      '<section style="font-size:0.3rem;" class="contractCon">' +
                      '<div style="text-indent: 2em;margin-bottom:10px;">根据《中华人民共和国合同法》、《中华人民共和国票据法》及相关法律法规的规定，甲乙丙三方在平等、自愿的基础上，就票据应收款转让及服务等有关事宜达成协议如下：</div>' +
                      '<strong>第一条 释义</strong>' +
                      '<div>' +
                      '<p><strong>一、甲方：</strong>指拟在丙方提供的信息平台上转让票据应收款的一方，根据本合同表述的需要，甲方在本合同中也可称之为转让方。</p>' +
                      '<p><strong>二、乙方：</strong>指拟在丙方提供的信息平台上受让票据应收款的一方，根据本合同表述的需要，乙方在本合同中也可称之为受让方。</p>' +
                      '<p><strong>三、信息平台：</strong>指丙方开发的汇票线平台，为交易双方提供交易服务的互联网网站及交易系统，根据本合同表述的需要，丙方在本合同中也可称之为信息平台。</p>' +
                      '<p><strong>四、标的票据：</strong>指转让方在信息平台上发布的转让方拟转让其票据应收款于受让方的商业汇票。</p>' +
                      '<p><strong>五、发布日：</strong>就一笔标的票据而言，指其发布时间所在日期。</p>' +
                      '<p><strong>六、兴业数字金融服务（上海）股份有限公司票据流转资金代管专户：</strong>指甲方、乙方、丙方同意，由丙方合作机构兴业数字金融服务（上海）股份有限公司（简称“兴业数金”）为方便转让方与受让方资金流转和安全而在兴业银行开立的票据流转资金代管专户（简称“票据流转资金代管专户”）。</p>' +
                      '<p><strong>七、转让服务费：</strong>指信息平台及合作机构兴业数金基于其为交易双方提供的票据应收款转让相关服务而向受让方单方收取的服务费。</p>' +
                      '<p><strong>八、提现费（电汇费）：</strong>指转让方提现产生的费用，实际上由受让方承担</p>' +
                      '<p><strong>九、票据应收款：</strong>指标的票据的承兑人承担的在票据到期日无条件支付的票据款项。</p>' +
                      '<p><strong>十、票据应收款转让：</strong>指转让方通过信息平台提供的服务在信息平台与受让方达成协议将票据背书转让方式将票据应收款无条件不可撤销地转让给受让方的行为。</p>' +
                      '<p><strong>十一、贴现金额：</strong>指转让方与受让方签订交易合同时所达成的成交金额，即信息平台于转让成功时自票据流转资金代管专户实际划入转让方收款账户的金额，其数额等于总扣款额减去服务费与提现费（电汇费）后的余额。</p>' +
                      '<p><strong>十二、总扣款额：</strong>指受让方就受让标的实际应支付的款项，即信息平台于受让方支付标的金额时实际从受让方账户里扣划至票据流转资金代管专户的款项，其数额等于贴现金额加上服务费与提现费（电汇费）后的金额。</p>' +
                      '<p><strong>十三、转让成功：</strong>本协议第六条第一款第5点条款赋予的含义。</p>' +
                      '<p><strong>十四、转让失败：</strong>本协议第六条第一款第6点、第7点相关条款赋予的含义。</p>' +
                      '</div>' +
                      '<strong>第二条 票据应收款的转让</strong>' +
                      '<div>' +
                      '<p>甲方同意根据本合同约定的条款及条件向乙方转让相应的票据应收款，乙方同意根据本合同约定的条款及条件向甲方支付本合同约定的金额。</p>' +
                      '</div>' +
                      '<strong>第三条 乙方对价支付的前提条件</strong>' +
                      '<div>' +
                      '<p>只有在以下条件全部满足的情形下，乙方才有义务向甲方支付受让票据的对价：</p>' +
                      '<p>1.本合同已生效；</p>' +
                      '<p>2.本合同项下甲方转让的标的票据不存在任何争议、纠纷。</p>' +
                      '<p>3.甲方已将标的票据成功背书给乙方。</p>' +
                      '</div>' +
                      '<strong>第四条 对价支付</strong>' +
                      '<div>' +
                      '<p>一、上述第三条约定的对价支付的前提条件全部满足之后，乙方委托丙方（并且甲方同意由乙方委托丙方）将数额等于实收金额的资金通过兴业银行资金代管专户转入甲方银行账户。</p>' +
                      '<p>二、本合同各方均同意，在前述第三条约定前提条件全部满足的情形下，丙方合作机构兴业数金将根据乙方的委托于成交日当日将乙方提前划入票据流转资金代管专户的数额等于实收金额的资金通过票据流转资金代管专户转入甲方指定的银行账户，但若因系统关闭或故障等待特殊原因无法成交日当日完成划款，则兴业数金可于下一个工作日完成划款。</p>' +
                      '<p>三、本合同各方均确认及同意有关款项的计算规则：甲方贴现金额（成交金额）=乙方总扣款额-转让服务费-提现费（电汇费）。</p>' +
                      '</div>' +
                      '<strong>第五条 转让服务费</strong>' +
                      '<div>' +
                      '<p>一、甲乙双方确认本合同基于丙方提供的转让服务达成，并同意由乙方单方面向丙方支付转让服务费；甲乙双方无条件不可撤销地同意，委托兴业数金通过其自主研发的执剑人票据见证代管系统为甲乙双方提供票据流转见证、资金代管等服务，由此产生的相关服务费包含在乙方向丙方支付的转让服务费中并由丙方代收。</p>' +
                      '<p>二、转让服务费等于乙方实际支付的实扣金额与甲方实际收取金额之间的差额，转让服务费=转让票据票面金额*转让服务费率，乙方同意根据本合同约定的服务费率向丙方支付转让服务费。转让服务费率以丙方公布的收费规则为准。</p>' +
                      '<p>三、乙方委托兴业数金代管资金时，其向票据流转资金代管专户划转受让票据应收款的资金时应同时将转让服务费一并转让。</p>' +
                      '</div>' +
                      '<strong>第六条 信息对接、资金代转及划转服务</strong>' +
                      '<div>' +
                      '<p>一、 丙方及丙方合作机构根据标的票据转让订单为甲乙双方提供信息对接、资金代管及划转服务：</p>' +
                      '<p>1.转让方将拟转让的标的票据于丙方信息平台发布后，受让方对其进行报价，转让方同意成交金额并确认在线签署本合同后，订单生效，进入实际交易阶段。</p>' +
                      '<p>2.受让方在有效时间内（30分钟）成功提交有效付款指令将受让资金及相应服务费划转入票据流转资金代管专户后，兴业银行将自动将成交金额及服务费从受让方银行账户中划入票据流转资金代管专户，同时信息平台就该笔转让订单对受让方显示“你已支付交易款，请等待持票方完成背书”，对转让方显示“资金方已打款，请完成背书并确认”。</p>' +
                      '<p>3.当一笔标的票据在信息平台上对转让方显示“资金方已打款，请完成背书并确认”的状态时，转让方应当根据丙方及丙方合作机构执剑人票据见证代管系统的提示在有效时间内（30分钟）办理标的票据的背书手续；若转让方将标的票据成功背书给受让方，且转让方在有效时间内点击确认完成背书操作，则信息平台就该笔转让订单对转让方显示“你已完成背书，请等待资金方签收电票”，对受让方显示“持票方已背书，请完成签收和申请解冻交易款”；</p>' +
                      '<p>4.当一笔标的票据在信息平台上对受让方显示“持票方已背书，请完成签收和申请解冻交易款”的状态时，受让方应在有效时间（30分钟）内点击确认完成签收操作并解冻交易款。若受让方未在有效时间内接收票据背书，则视为拒绝接收票据背书。若在受让方签收票据背书之前，转让方撤销票据背书导致受让方无法签收票据，则视为撤销背书。</p>' +
                      '<p>5.若受让方接收标的票据背书后在信息平台确认签收并解冻交易款，丙方合作机构兴业银行通过执剑人票据见证代管系统将对标的票据的背书状态进行见证核实，若转让方成功将标的票据背书给受让方，则构成转让成功。转让成功后，则转让方可通过执剑人票据见证代管系统发出指令将票据流转资金代管专户内数额等于成交金额的资金划入转让方银行指定账户内；若受让方接收标的票据背书后未在信息平台确认签收并解冻交易款，且执剑人票据代管系统进行核验后，确认受让方已成功接收标的票据背书，则执剑人票据见证代管系统有权自行将票据流转资金代管专户内数额等于成交金额的资金划入转让方银行指定账户内，由此产生的任何后果由受让方承担。</p>' +
                      '<p>6.在前述情形下，若受让方未于有效时间内成功提交有效付款指令将资金转入票据流转资金代管专户，或受让方银行账户内资金不足成交金额及服务费，或受让方主动取消交易，或拒绝接收票据背书，则票据应收款转让失败，由此产生合同无法履行的责任由受让方承担。若受让方已经将资金转入票据流转资金代管专户，转让方未在有效时间将标的票据背书，或转让方在票据背书后撤销背书、或转让方主动取消交易，则票据应收款转让失败，由此产生合同无法履行的责任由转让方承担。</p>' +
                      '<p>7.转让失败的，信息平台向转让方及受让方发出转让失败通知，同时票据流转资金代管专户将账户内数额等于受让方实付金额的资金退回受让方执剑人票据见证代管系统的电子账户内；转让方与受让方将无法对该笔标的票据转让订单进行任何操作。</p>' +
                      '<p>二、信息平台正常发起转让的时间段为银行工作日的9：00-16：30，在16：30时后需要进行票据应收款转让见证审核的订单，将在次日进行；信息平台根据业务情况针对转让的时间段进行调整并经预先公告的，则按照公告后的时间段进行转让。</p>' +
                      '</div>' +
                      '<strong>第七条 甲方的保证与承诺</strong>' +
                      '<div>' +
                      '<p>一、甲方是一家根据中国法律设立的法人企业，自设立至今始终有效存续，且目前经营状况正常，具备签署本合同并履行合同义务的民事权利能力和民事行为能力，甲方应根据丙方要求提供营业执照等主体资格资料。</p>' +
                      '<p>二、 其签署本合同并履行本合同项下的义务（包括但不限于向乙方转让票据）已经得到甲方内部充分的授权，所需的外部审批及同意（若有）亦已全部取得。</p>' +
                      '<p>三、 签署本合同是甲方真实意思表示，本合同的签署不会导致违反适用于甲方的任何法律法规、规范性文件或甲方章程或类似文件，也不会违反其与任何第三方签订的任何协议或承诺；本合同生效后，将构成甲方有约束力及执行力的义务。</p>' +
                      '<p>四、 除本合同签署前已书面通知丙方的（若有）以外，甲方不存在任何可能对本合同履行产生重大不利影响的诉讼、仲裁、执行、申诉、复议、重组、破产、清算等程序及其他事件或情况。</p>' +
                      '<p>五、本合同项下的标的票据为合法、真实、有效且不存在票据诈骗等违法犯罪情形，不属于风险票据、已挂失票据或公示催告票据，标的票据记载事项完整，甲方为该标的票据的合法持有人并享有完整的票据应收款；</p>' +
                      '<p>六、 标的票据为甲方背书受让，甲方保证其直接前手的背书是真实有效并对其真实性负责；标的票据为甲方以其他合法方式取得的，甲方保证其受让是合法有效的并对合法性负责。</p>' +
                      '<p>七、 除根据本合同甲方与乙方之间因转让票据产生的权利及负担外，标的票据及票据应收款均不能存在本合同未做披露的任何债务负担或者第三方的权利主张、抵消权、质押或其他负担，甲方享有的票据收益权不存在本合同未做披露的法律上的障碍，且转让后票据应收款上不存在本合同未做披露的任何债务负担或第三方的权利主张或抵消权。</p>' +
                      '<p>八、 本合同生效后，甲方无权再对标的票据进行向除乙方之外的任何第三方转让标的票据。</p>' +
                      '<p>九、 甲方在丙方提交的标的票据信息、背书账户信息等信息真实有效，否则由甲方提供信息错误造成的一切损失由甲方承担。</p>' +
                      '<p>十、甲方在此无条件不可撤销地授权丙方及丙方的合作机构通过电子商业汇票系统查询标的票据的票面信息、背书记录、影像等相关信息，并委托丙方合作机构兴业数金代管票据应收款转让项下的款项。</p>' +
                      '<p>十一、 标的票据转让过程中，甲方所有操作必须依照信息平台的提示进行并保障甲方联系方式的畅通，否则由于甲方操作失误造成的一切损失由甲方承担。所需注意环节包括但不限于在订单进行中时，且满足本协议第6条情形下，甲方才可进行背书，并在对应环节有效时间内完成相应的操作行为，否则，自愿承担由此产生的全部不利结果。</p>' +
                      '<p>十二、 甲方保证履行本合同项下转让方的承诺及义务。</p>' +
                      '</div>' +
                      '<strong>第八条 乙方的保证与承诺</strong>' +
                      '<div>' +
                      '<p>一、乙方是一家根据中国法律设立的法人企业，自设立至今始终有效存续，且目前经营状况正常，具备签署本合同并履行合同义务的民事权利能力和民事行为能力，乙方应根据丙方要求提供营业执照等主体资格资料。</p>' +
                      '<p>二、 其签署本合同并履行本合同项下的义务已经得到乙方内部充分的授权，所需的外部审批及同意（若有）亦已全部取得。</p>' +
                      '<p>三、 签署本合同是乙方真实意思表示，本合同的签署不会导致违反适用于乙方的任何法律法规、规范性文件或乙方章程或类似文件，也不会违反其与任何第三方签订的任何协议或承诺；本合同生效后，将构成乙方有约束力及执行力的义务。</p>' +
                      '<p>四、乙方不存在任何可能对本合同履行产生重大不利影响的诉讼、仲裁、执行、申诉、复议、重组、破产、清算等程序及其他事件或情况。</p>' +
                      '<p>五、 乙方在丙方信息平台提交的标的票据被背书账户信息等真实有效，否则由乙方提供信息错误造成的一切损失由乙方承担。</p>' +
                      '<p>六、 乙方无条件不可撤销地授权丙方及丙方的合作机构通过电子商业汇票系统查询标的票据的票面信息、背书记录、影像等相关信息，并由丙方合作机构兴业数金代管票据应收款转让项下的资金。</p>' +
                      '<p>七、 标的票据转让过程中，乙方所有操作必须依照信息平台的提示进行并保障乙方联系方式的畅通，否则由于乙方操作失误造成的一切损失由乙方承担。所需注意环节包括但不限于满足本协议第六条情形下，乙方需及时根据本协议约定办理票据背书相关手续，并在对应环节有效时间内完成相关操作；否则，自愿承担由此产生的全部不利结果。</p>' +
                      '<p>八、乙方保证履行本合同项下受让方的承诺及义务。</p>' +
                      '</div>' +
                      '<strong>第九条 违约责任</strong>' +
                      '<div>' +
                      '<p>任何一方违反本合同项下任何承诺及保证或违反本合同项下任何其他义务，则构成违约。守约方有权要求违约方限期纠正违约行为并采取补救措施。违约方的违约行为给对方造成损失，应予赔偿。</p>' +
                      '</div>' +
                      '<strong>第十条 争议解决</strong>' +
                      '<div>' +
                      '<p>一、 任何一方本合同的订立、效力、解释、履行及争议的解决均适用中华人民共和国法律。</p>' +
                      '<p>二、 凡由本合同引起的或与本合同有关的争议和纠纷，各方应协商解决；不能协商或协商不能达成一致的，同意提交上海仲裁委员会根据其先行有效的仲裁规则仲裁解决，仲裁地点为上海市。</p>' +
                      '</div>' +
                      '<strong>第十一条 合同生效</strong>' +
                      '<div>' +
                      '<p>各方同意本合同以下任何一种形式生效：</p>' +
                      '<p>1.本合同自甲、乙、丙三方根据电子签名相关法律法规线上签署之日生效。</p>' +
                      '<p>2.本合同自甲、乙双方通过信息平台阅读并点击同意接受本合同后生效。</p>' +
                      '</div>' +
                      '<strong>第十二条 其他事宜</strong>' +
                      '<div>' +
                      '<p>本合同未尽事宜，由三方协商并签订补充合同确定，补充合同与本合同具有同等法律效力。</p>' +
                      '</div>' +
                      '<strong>第十三条 转让订单概要</strong>' +
                      '<div>' +
                      '<p>标的票据信息、背书人信息、被背书人信息、成交对价信息：</p>' +
                     '<div class="contractDetail">' +
                     '<div class="hpxBott hpxHead">标的票据信息概要</div>' +
                     '<p class="hpxBott">' +
                      '<label>票据类型：</label>' +
                      '<span>' + $scope.billModel.acceptor_type_name + '</span>' +
                      '</p>' +
                      '<div class="hpxBott">' +
                      '<p>票据号码：</p>' +
                      '<span style="display:block;width:85%;text-align:left;">' + $scope.billModel.bill_number + '</span>' +
                      '</div>' +
                      '<p class="hpxBott">' +
                      '<label>承兑人全称：</label>' +
                      '<span>' + $scope.billModel.acceptor_name + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>票面金额：</label>' +
                      '<span>￥' + $scope.billModel.bill_sum_price + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>汇票到期日：</label>' +
                      '<span>' + $scope.hpxDate + '</span>' +
                      '</p>' +
                      '<div class="hpxBott hpxHead">背书人信息（转让方）</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">背书人户名：</label>' +
                      '<span>' + $scope.billModel.drawer_name + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">背书人开户行：</label>' +
                      '<span>' + $scope.hpxGetAcc.drawerAccountName + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">银行账号：</label>' +
                      '<span>' + $scope.hfindAccX.account_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">联行号：</label>' +
                      '<span>' + $scope.hfindAccX.bank_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott hpxHead">被背书人信息（受让方）</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">被背书人户名：</label>' +
                      '<span>' + $scope.billModel.receiver_name + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">被背书人开户行：</label>' +
                      '<span>' + $scope.hpxGetAcc.receiverAccountName+ '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">银行帐号：</label>' +
                      '<span>' + $scope.hpxGetAcc.receiverAccount.account_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott">' +
                      '<label class="col-md-3 control-label">联行号：</label>' +
                      '<span>' + $scope.hpxGetAcc.receiverAccount.bank_number + '</span>' +
                      '</div>' +
                      '<div class="hpxBott hpxHead">成交价格</div>' +
                      '<p class="hpxBott">' +
                      '<label>贴现金额[元]：</label>' +
                      '<span>￥' + $scope.orderModel.order_total_price + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>服务费[元]：</label>' +
                      '<span>￥0</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label style="width:56%;">提现费（电汇费）[元]：</label>' +
                      '<span style="display:inline-block;width:43%;">￥' + $scope.phxPay.withdrawal_procedure + '</span>' +
                      '</p>' +
                      '<p class="hpxBott">' +
                      '<label>总扣款额[元]：</label>' +
                      '<span>￥' + $rootScope.hpxAll + '</span>' +
                      '</p>' +
                      '<div>甲方、乙方均已通读上述条款，甲方、乙方对其的本合同下的权利义务已充分熟悉；甲乙双方对本合同所有内容均无异议。</div>' +
                     '</div>' +
                      '</div>' +
                      '<div style="text-align: right;margin-top:0.14rem;">签订日期：' + $scope.filter.newYear + '年' + $scope.filter.newMonth + '月' + $scope.filter.newToday + '日</div>' +
                      '</section></div></div>',
            scope: $scope,
            buttons: [
              {
                  text: '取消',
                  onTap: function (e) {
                      $("#ownBillOffer")[0].checked = false;
                  }
              },
              {
                  text: '同意并继续',
                  type: 'button-positive',
                  onTap: function (e) {
                      if (!$scope.filter.payRule) {
                          $scope.filter.payRule = true;
                      }
                      payingService.econtractNextSign($scope.orderModel.receiver_id, $scope.filter.toKeyWord, $scope.orderModel.id).then(function (data) {
                          
                          $scope.secondSing = data;
                      });
                      $scope.filter.submitRule = 1;
                     
                  }
              },
            ]
        });

    }

    // 提现
    //window.open(API_URL + '/paying/recharge?rechargePrice=' + $scope.model.recharge_price + '&enterpriseId=' + $rootScope.identity.enterprise_id);
    //$scope.withdraw = function () {
    //    window.open(XingYe_URL + $rootScope.identity.corp_id);
    //}

    //增加背书
    $scope.model.endorsement_file = [];
    $scope.add = function (response) {
        $scope.endorsements.push({
            endorsement_id: $scope.model.bill_front_photo_id,
            endorsement_address: $scope.model.bill_front_photo_path,
        });
    }

    $scope.takePhoto = function (index) {
        $scope.$takePhoto(function (data) {
            $scope.model.bill_front_photo_path = data;
            $scope.$uploadPhoto($scope.model.bill_front_photo_path, function (data) {
                data = JSON.parse(data);
                $scope.model.bill_front_photo_id = data.data.id;
                $scope.model.bill_front_photo_path = data.data.file_path;
                $scope.add();
            });
        });
    };

    $scope.verifyStr = "获取验证码";
    $scope.disableVerify = false;
    var second = 60;
    //发送验证码
    $scope.getVerify = function () {
        $scope.filter.phone_number = $rootScope.identity.phone_number;
        customerService.phoneVerify($scope.filter.phone_number).then(function () {
            $ionicPopup.alert({
                title: '提示',
                template: '验证码已发送！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            $scope.second = 60;
            $scope.disableVerify = true;

            $interval(function () {
                $scope.verifyStr = $scope.second + "秒后可重新获取";
                $scope.second--;

                if ($scope.second == 0) {
                    $scope.verifyStr = "重新获取验证码";
                    $scope.disableVerify = false;
                }
            }, 1000, 60);
        })
    };


    $scope.chioceStar11 = function () {
        $scope.evaluateModel.star = 1;
    };

    $scope.chioceStar12 = function () {
        $scope.evaluateModel.star = 2;
    };

    $scope.chioceStar13 = function () {
        $scope.evaluateModel.star = 3;
    };

    $scope.chioceStar14 = function () {
        $scope.evaluateModel.star = 4;
    };

    $scope.chioceStar15 = function () {
        $scope.evaluateModel.star = 5;
    };

    $scope.showEvaluatesell = function () {
        enterprisesService.insertAppraisal($scope.evaluateModel).then(function (data) {
            $scope.closeEvaluateModal();
            if ($scope.filter.check == 1) {
                $state.go('app.myReleaseElecAll');
            } else if ($scope.filter.check == 2) {
                $state.go('app.myBidding');
            } else {
                $state.go('app.user');
            }
            
        });
    };
    //关注
    $scope.follow = function (follow) {
        $scope.followModel = {
            collection_bill_id: $scope.billModel.id,
            is_collection_bill: follow
        }
        customerService.followBill($scope.followModel).then(function () {
            //$scope.model.is_collection_enterprise = follow;
            $scope.billModel.is_collection_bill = follow
        })
    }

    waitTime = function () {
        if ($scope.orderModel) {
            var newdate = new Date().getTime();
            if ($scope.billModel.bill_status_code >= 804) {
                if (difference >= 0) {
                    if ($scope.orderModel.order_status_id == 804) {
                        var waitdate = newdate - $scope.orderModel.order_time - difference;
                    } else {
                        var waitdate = newdate - $scope.orderModel.order_update_time - difference;
                    }
                } else {
                    if ($scope.orderModel.order_status_id == 804) {
                        var waitdate = newdate - $scope.orderModel.order_time + difference;
                    } else {
                        var waitdate = newdate - $scope.orderModel.order_update_time + difference;
                    }
                }
            }

            if (waitdate > 1000) {
                var waitTime = new Date(waitdate);
                $scope.filter.waitTimeD = waitTime.getDate();
                if ($scope.filter.waitTimeD > 2) {
                    $scope.filter.waitTimeH = waitTime.getHours() - 8 + ($scope.filter.waitTimeD - 1) * 24;
                } else if ($scope.filter.waitTimeD > 1) {
                    $scope.filter.waitTimeH = waitTime.getHours() - 8 + 24;
                } else {
                    $scope.filter.waitTimeH = waitTime.getHours() - 8;
                }
                $scope.filter.waitdateM = waitTime.getMinutes();
                $scope.filter.waitdateS = waitTime.getSeconds();
            } else {
                $scope.filter.waitTimeH = 0;
                $scope.filter.waitdateM = 0;
                $scope.filter.waitdateS = 0;
            }
        }
    }
    //一分钟自动刷新
    $scope.countDown = function (scopeStr) {
        var flag = 0;
        $scope[scopeStr] = 3;
        $scope[scopeStr + '_flag'] = 1;
        $interval(function () {
            $scope[scopeStr] = $scope[scopeStr] != 3 ? $scope[scopeStr] + 1 : 0;
            if ($scope[scopeStr + '_flag'] <= 60) {
                $scope[scopeStr + '_flag']++;
                if ($scope[scopeStr + '_flag'] == 61) {
                    flag++;
                    if ($scope.filter.buttonClicked == 1) {
                        $scope[scopeStr + '_flag'] = 1;
                    } else if (flag == 3) {
                        init();
                        $scope[scopeStr + '_flag'] = 1;
                        flag = 0;
                    }
                }
            } else {
                $scope[scopeStr + '_flag'] = 1;
            }
            if ($scope.orderModel) {
                if ($scope.orderModel.order_status_id == 804 || $scope.orderModel.order_status_id == 806 || $scope.orderModel.order_status_id == 807 || $scope.orderModel.order_status_id == 808) {
                    waitTime();
                }
            }
        }, 1000);
    }
    if ($scope.orderId) {
        $scope.countDown('countValue');
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


    $scope.shareToWechatFriend = function () {
        try {
            if ($scope.billModel.bill_type_id == 101) {
                $scope.billType = "电票";
            } else {
                $scope.billType = "纸票";
            }
            Wechat.share({
                message: {
                    title: '现出一张' + Number($scope.billModel.bill_sum_price / 10000).toFixed(2) + '万元' + $scope.billType + $scope.billModel.acceptor_type_name + '，机不可失，赶紧查看！',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: WEB_URL + '/share/index.html#/share/shareBill?id=' + $scope.billModel.id.toString()
                    }
                },
                scene: Wechat.Scene.SESSION   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: '提示',
                    template: '分享成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (reason) {
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: reason,
                //    okType: 'button-assertive',
                //});
            });
        }
        catch (e) {
            console.log(e.message);
        }
    };

    $scope.shareToWechat = function () {
        try {
            if ($scope.billModel.bill_type_id == 101) {
                $scope.billType = "电票";
            } else {
                $scope.billType = "纸票";
            }
            Wechat.share({
                message: {
                    title: '现出一张' + Number($scope.billModel.bill_sum_price / 10000).toFixed(2) + '万元' + $scope.billType + $scope.billModel.acceptor_type_name + '，机不可失，赶紧查看！',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: WEB_URL + '/share/index.html#/share/shareBill?id=' + $scope.billModel.id.toString()
                    }
                },
                scene: Wechat.Scene.TIMELINE   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: '提示',
                    template: '分享成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (reason) {
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: reason,
                //    okType: 'button-assertive',
                //});
            });
        }
        catch (e) {
            console.log(e.message);
        }
    };

    $scope.shareToWeibo = function () {
        try {
            if ($scope.billModel.bill_type_id == 101) {
                $scope.billType = "电票";
            } else {
                $scope.billType = "纸票";
            }
            var args = {};
            args.url = WEB_URL + '/share/index.html#/share/shareBill?id=' + $scope.billModel.id.toString();
            args.title = '现出一张' + Number($scope.billModel.bill_sum_price / 10000).toFixed(2) + '万元' + $scope.billType + $scope.billModel.acceptor_type_name + '，机不可失，赶紧查看！';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            //args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            WeiboSDK.shareToWeibo(function () {
                $ionicPopup.alert({
                    title: '提示',
                    template: '分享成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: failReason,
                //    okType: 'button-assertive',
                //});
            }, args);
        }
        catch (e) {
            console.log(e.message);
        }
    };

    $scope.shareToQQ = function () {
        try {
            if ($scope.billModel.bill_type_id == 101) {
                $scope.billType = "电票";
            } else {
                $scope.billType = "纸票";
            }
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            args.url = WEB_URL + '/share/index.html#/share/shareBill?id=' + $scope.billModel.id.toString();
            args.title = '现出一张' + Number($scope.billModel.bill_sum_price / 10000).toFixed(2) + '万元' + $scope.billType + $scope.billModel.acceptor_type_name + '，机不可失，赶紧查看！';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            QQSDK.shareNews(function () {
                $ionicPopup.alert({
                    title: '提示',
                    template: '分享成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: failReason,
                //    okType: 'button-assertive',
                //});
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToQQZone = function () {
        try {
            if ($scope.billModel.bill_type_id == 101) {
                $scope.billType = "电票";
            } else {
                $scope.billType = "纸票";
            }
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            args.url = WEB_URL + '/share/index.html#/share/shareBill?id=' + $scope.billModel.id.toString();
            args.title = '现出一张' + Number($scope.billModel.bill_sum_price / 10000).toFixed(2) + '万元' + $scope.billType + $scope.billModel.acceptor_type_name + '，机不可失，赶紧查看！';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            QQSDK.shareNews(function () {
                // alert('分享成功！');
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: '提示',
                //    template: failReason,
                //    okType: 'button-assertive',
                //});
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };


    // 纸票注意事项
    $scope.submitRules = function () {
        var myPopup = $ionicPopup.show({
            cssClass: 'hpxModalZ hpxcc',
            template: '尊敬的汇票线用户：' +
                      '<p>纸票交易存在风险，本平台不对任何纸票信息、纸票真伪进行担保， 若出现任何交易损失，概不负责！</p>' +
                      '<p>建议选择市场上信用好，口碑好，实力强的资金方进行合作。</p>' +
                      '<p>纸票交易需要注意以下事项：</p>' +
                      '<p>1、交易前充分了解对方，要有充足的书面材料做保证，例如: 要求对方提供身份证原件及复印件、企业资质复印件、企业三章（公章、财务专用章、法人章），有固定电话（企业及家庭），企业及家庭详细住址；企业地址可在当地工商局官网查询，以及查询企业相关资质及法人信息。</p>' +
                      '<p>2、在双方交易时应签署双方认可的承兑汇票转让协议 或承兑汇票质押协议等一些有法律效应的材料。如果是非法人交易应提供法人身份证复印件、法人的联系方式及法人授权委托书。双方应在书面材料上签字盖章。</p>' +
                      '<p>3、在双方交易过程中，做到票不离手，汇票不离视线，钱票当面两清，谨防诈骗。</p>',
            scope: $scope,
            buttons: [
              {
                  text: '取消',
                  onTap: function (e) {
                      //$('#ownBillOfferkss')[0].checked = false;
                  }
              },
              {
                  text: '同意',
                  type: 'button-positive',
                  onTap: function (e) {
                      $('#ownBillOfferkss')[0].checked = true;
                  }
              },
            ]
        });
    };
});
ionicApp.controller('myReleaseElecAllController', function ($rootScope, $scope, $state, $filter, $stateParams, $ionicPopup, $ionicModal, billService, addressService, customerService, constantsService, payingService,bankService, fileService, orderService) {
    //console.log($scope)
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.filter = {
        choiceBillType: 101,
        choiceStatus: 880,
        choiceorder: 0,
        isTrade: 0,
        status: null,
        isAlive: null,
        billStatusCode: null,
    };
    $scope.billsNumber = function () {
        billService.getBillsNumber($scope.filter.choiceBillType).then(function (data) {
            $scope.numberModel = data;
         })
    }
    $scope.billsNumber();
   


    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-publishing_time',10);
        $scope.listData = [];
        $scope.loadMore();
    };

    $scope.loadMore = function (first) {
            if ($scope.filter.status >= 809 && $scope.filter.choiceBillType == 101) {
                return orderService.getOwnOrder($scope.params, $scope.filter.choiceBillType, $scope.filter.status).then(function (data) {
                   
                    if ((($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881 || $scope.filter.choiceStatus == 882) && $scope.filter.choiceBillType == 101) || $scope.filter.choiceBillType == 102) {
                        for (var j = 0; j < data.length; j++) {
                            if (!data[j].bill_deadline_time)
                                data[j].remaining_day = null;
                        };
                    }
                    for (var j = 0; j < data.length; j++) {
                        data[j].publishing_time = $filter('date')(data[j].publishing_time, 'yyyy-MM-dd');
                        data[j].bill_deadline_time = $filter('date')(data[j].bill_deadline_time, 'yyyy-MM-dd');
                    };
                    $scope.hasMore = data.length == 10;
                    $scope.listData = first ? data : $scope.listData.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete')
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.params.next();
                });
                
            } else {
                return billService.getOwnBillProduct($scope.params, $scope.filter.choiceBillType, $scope.filter.isAlive, $scope.filter.billStatusCode).then(function (data) {
                  
                    if ((($scope.filter.choiceStatus == 880 || $scope.filter.choiceStatus == 881 || $scope.filter.choiceStatus == 882) && $scope.filter.choiceBillType == 101) || $scope.filter.choiceBillType == 102) {
                        for (var j = 0; j < data.length; j++) {
                            if (!data[j].bill_deadline_time)
                                data[j].remaining_day = null;
                        };
                    }
                    for (var j = 0; j < data.length; j++) {
                       data[j].publishing_time = $filter('date')(data[j].publishing_time, 'yyyy-MM-dd');
                       data[j].bill_deadline_time = $filter('date')(data[j].bill_deadline_time, 'yyyy-MM-dd');
                    };
                    $scope.hasMore = data.length == 10;
                    $scope.listData = first ? data : $scope.listData.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete')
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.params.next();
                });
                
            }
            
        
    };
   $scope.$on('$stateChangeSuccess', $scope.doRefresh);
   // $scope.doRefresh();
    //选择电票
    $scope.choiceEBillType = function () {
        $scope.filter.choiceBillType = 101;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();

    };
    //选择纸票
    $scope.choicePBillType = function () {
        $scope.filter.choiceBillType = 102;
        $scope.billsNumber();
        $scope.choiceTradeStatusAll();
    };
    //全部
    $scope.choiceTradeStatusAll = function () {
        $scope.filter.choiceStatus = 880;
        $scope.filter.isTrade = 0;
        $scope.filter.isAlive = null;
        $scope.filter.billStatusCode = null;
        $scope.filter.status = null;
        $scope.filter.choiceorder = 0;
        $scope.doRefresh();
    }
    //平台审核
    $scope.choiceTradeStatusCheck = function () {
        $scope.filter.choiceStatus = 881;
        $scope.filter.isAlive = 0;
        $scope.filter.isTrade = 0;

        $scope.filter.billStatusCode = null;
        $scope.filter.status = null;
        $scope.filter.choiceorder = 0;
        $scope.doRefresh();
    }
    //发布中
    $scope.choiceTradeStatusPublish = function () {
        $scope.filter.choiceStatus = 882;
        $scope.filter.isAlive = 1;
        $scope.filter.isTrade = 0;

        $scope.filter.billStatusCode = null;
        $scope.filter.status = null;
        $scope.filter.choiceorder = 0;
        $scope.doRefresh();
    }
    //交易中
    $scope.choiceTradeStatusTrade = function () {
        $scope.filter.choiceStatus = 883;
        $scope.filter.choiceorder = 1;
        $scope.filter.isTrade = 1;

        if ($scope.filter.choiceBillType == 101) {
            $scope.filter.status = 809;
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = null;
        } else if ($scope.filter.choiceBillType == 102) {
            $scope.filter.billStatusCode = 809;
            $scope.filter.isAlive = null;
            $scope.filter.status = null;
        };
        $scope.doRefresh();
    }
    //交易完成
    $scope.choiceTradeStatusComplete = function () {
        $scope.filter.choiceStatus = 884;
        $scope.filter.isTrade = 0;

        if ($scope.filter.choiceBillType == 101) {
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = null;
            $scope.filter.status = 810;
            $scope.filter.choiceorder = 1;
            $scope.doRefresh();
        } else if ($scope.filter.choiceBillType == 102) {
            $scope.filter.status = null;
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = 810;
            $scope.doRefresh();
        }
    }
    //交易关闭
    $scope.choiceTradeStatusFail = function () {
        $scope.filter.choiceStatus = 885;
        $scope.filter.isAlive = 1;
        $scope.filter.isTrade = 0;

        if ($scope.filter.choiceBillType == 101) {
            $scope.filter.billStatusCode = null;
            $scope.filter.status = 816;
            $scope.filter.choiceorder = 0;
            $scope.doRefresh();
        } else if ($scope.filter.choiceBillType == 102) {
            $scope.filter.status = null;
            $scope.filter.isAlive = null;
            $scope.filter.billStatusCode = 816;
            $scope.doRefresh();
        }
    }

    // 预约出票审核失败修改信息
    // 预约出票弹出完善窗口
    $ionicModal.fromTemplateUrl('addvPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.addvModal = modal;
    });
    $scope.hpxYuB = function (item) {
        $scope.items = item;
        //console.log(item)
        $stateParams.id = item.id;
        $scope.billId = item.id;
        // 如果没有竞价信息，且不通过（第一次不通过）
        // 根据票据id获取竞价信息 $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.id ,'check':3});
        billService.getBillProductBidding($scope.billId).then(function (data) {
            $scope.biddings = data;
            angular.forEach(data, function (ele, index) {
                $scope.hpxBidding = ele;
            });
            if ($scope.hpxBidding == null || $scope.items.is_checked == -1) {
                $state.go('app.drawBill', { id: item.id });
            } else if ($scope.hpxBidding != null && $scope.items.is_checked != -1) {
                // 如果有竞价信息进行预约出票的修改
                $state.go('app.myReleaseDetail', { 'myReleaseBillId': item.id, 'check': 4 });
            } 

        });
    }

})
ionicApp.controller('myTaskController', function ($scope, $rootScope, $state, customerService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.tab = 1;
    $scope.filter = {
        
    };
    $scope.is_vis = false;
    $scope.setTab = function (set) {
        $scope.tab = set;
        $scope.doRefresh();
    }
    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create();
        $scope.drawerListData = [];
        $scope.reciverListData = [];
        $scope.loadMore();
    };
    $scope.loadMore = function (first) {
        if ($scope.tab == 1) {
            $scope.setType = 'drawer';
            customerService.getMyTasks($scope.params, $scope.setType).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                $scope.drawerListData = first ? data : $scope.drawerListData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
            });
        } else {
            $scope.setType = 'reciver';
            customerService.getMyTasks($scope.params, $scope.setType).then(function (data) {
                $scope.hasMore = data.length == 10;
                if (data.length == 0) {
                    $scope.is_vis = true;
                } else {
                    $scope.is_vis = false;
                }
                $scope.reciverListData = first ? data : $scope.reciverListData.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
            });
        }        
        $scope.params.next();
    };
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})
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
ionicApp.controller('newAuthorizateController', function ($scope, $rootScope, $state, $ionicPopup,$timeout, $ionicModal, customerService, payingService) {
    console.log($scope)
    console.log($rootScope)
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.hpxColse = function () {
        $state.go('app.user');
    };
    customerService.getCustomer().then(function (data) {
        $scope.customerModal = data;
    })
    $scope.model = {}
    $scope.agentModel = {

    }
    $scope.exampleModel = {
        src1: "images/danweishouquan.jpg",
        src2: "images/qiyeshouquan.jpg",
    };
    $scope.loginOut = function () {
        $rootScope.loginRequestEnter = null;
        $rootScope.enterprises = null;
        $rootScope.identity = null;
        localStorageService.set('customer', null);
        $ionicPopup.alert({
            title: '提示',
            template: '请重新登录!',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
    }
    $scope.takePhoto = function (index) {
        switch (index) {
            case 0:
                $scope.$takePhoto(function (data) {
                    $scope.agentModel.agent_treasurer_cert_photo_front_address = data;
                    $scope.isViewAgentF = true;
                    //$scope.isViewAgentB = false;
                    $scope.$uploadPhoto($scope.agentModel.agent_treasurer_cert_photo_front_address, function (data) {
                        data = JSON.parse(data);
                        $scope.agentModel.agent_treasurer_cert_photo_front_id = data.data.id;
                        $scope.agentModel.agent_treasurer_cert_photo_front_address = data.data.file_path;
                        $scope.filter.tp[index] = true;
                        if ($scope.agentModel.agent_treasurer_cert_photo_front_id || $scope.agentModel.agent_treasurer_cert_photo_front_id != '') {
                            $timeout(function () {
                                $scope.isViewAgentF = false;
                                $scope.isViewAgentB = false;
                                $rootScope.isView = false;
                            }, 100)
                        }
                    });
                });
                break;
            case 1:
                $scope.$takePhoto(function (data) {
                    $scope.agentModel.agent_treasurer_cert_photo_back_address = data;
                    //$scope.isViewAgentF = false;
                    $scope.isViewAgentB = true;
                    $scope.$uploadPhoto($scope.agentModel.agent_treasurer_cert_photo_back_address, function (data) {
                        data = JSON.parse(data);
                        $scope.agentModel.agent_treasurer_cert_photo_back_id = data.data.id;
                        $scope.agentModel.agent_treasurer_cert_photo_back_address = data.data.file_path;
                        if ($scope.agentModel.agent_treasurer_cert_photo_front_id || $scope.agentModel.agent_treasurer_cert_photo_front_id != '') {
                            $timeout(function () {
                                $scope.isViewAgentB = false;
                                $rootScope.isView = false;
                                $scope.isViewAgentF = false;
                            }, 100)
                        }
                    });
                });
                break;
        }
    };
    $scope.filter = {
        tip: false,
        update: false,
        Rule: true,
        //enterprise_proxy_agree
    };
    if ($rootScope.identity.is_verified >= 0) {
        
        customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
            //console.log(data)
            $scope.findEnterprise = data;
            //alert(data + "?")
            if (data.enterprise_id) {
                //alert($scope.findEnterprise.enterprise_id)
                $scope.model.id = $scope.findEnterprise.enterprise_id;
                //alert($scope.model.id + "!")
                payingService.getAgentTreasurer($scope.model.id).then(function (result) {
                    //$scope.agentModel = result;
                    if (result) {
                        $scope.agentModel = result;
                        $scope.is_Disable = false;
                        if (result.enterprise_proxy_agree == "Y") {
                            $scope.filter.enterprise_proxy_agree = true;
                        } 
                        if (result.authorization_cert_agree == "Y") {
                            $scope.filter.authorization_cert_agree = true;
                        }
                    }
                    else {
                        $scope.agentModel = {
                            agent_treasurer_cert_photo_front_address: '',
                            agent_treasurer_cert_photo_back_address: '',
                        };
                        $scope.is_Disable = true;
                    }
                });
            }
        })
    }
    else {
        customerService.getAllEnterprise().then(function (data) {
            $scope.model = data;
            //alert(data + "!")
            if (data.id) {
                //alert($scope.model.id + "?")
                payingService.getAgentTreasurer($scope.model.id).then(function (result) {
                    //alert(reslut)
                    if (result) {
                        $scope.agentModel = result;
                        $scope.is_Disable = false;
                        if (result.enterprise_proxy_agree == "Y") {
                            $scope.filter.enterprise_proxy_agree = true;
                        }
                        if (result.authorization_cert_agree == "Y") {
                            $scope.filter.authorization_cert_agree = true;
                        }
                    }
                    else {
                        $scope.agentModel = {
                            agent_treasurer_cert_photo_front_address: '',
                            agent_treasurer_cert_photo_back_address: '',
                        };
                        $scope.is_Disable = true;
                    }
                });
            }
        });
    }
    $ionicModal.fromTemplateUrl('servicePopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.serviceModal = modal;
    });
    $scope.zhijian = function () {
        $scope.serviceModal.show();
    }
    $scope.closeModel = function () {
        $scope.serviceModal.hide();
    }
    // 电子签章
    $ionicModal.fromTemplateUrl('enterprisePopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.enterpriseModal = modal;
    });
    $ionicModal.fromTemplateUrl('monadPopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.monadModal = modal;
    });
    // 获取当前时间
    var todayDate = new Date();
    $scope.newYear = todayDate.getFullYear();
    $scope.newMonth = (todayDate.getMonth() + 1) < 10 ? '0' + (todayDate.getMonth() + 1) : (todayDate.getMonth() + 1);
    $scope.newToday = todayDate.getDate() < 10 ? '0' + todayDate.getDate() : todayDate.getDate();
    // 企业授权书
    $scope.EnAuthorizationModel = function () {
        if (!$scope.agentModel.agent_treasurer_name) {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人姓名！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            alertPopup.then(function (res) {
                $timeout(function () {
                    $scope.filter.enterprise_proxy_agree = false;
                })
            })
            return;
        }
        if (!$scope.agentModel.agent_treasurer_phone) {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人手机号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            alertPopup.then(function (res) {
                $timeout(function () {
                    $scope.filter.enterprise_proxy_agree = false;
                })
            })
            return;
        }
        if (!$scope.agentModel.agent_treasurer_cert_no) {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人身份证号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            alertPopup.then(function (res) {
                $timeout(function () {
                    $scope.filter.enterprise_proxy_agree = false;
                })
            })
            return;
        }
        if (!$scope.customerModal.id_number) {
            var alertPopup = $ionicPopup.alert({
                title: '提示',
                template: '请完善联系人身份证号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            alertPopup.then(function (res) {
                $timeout(function () {
                    $scope.filter.enterprise_proxy_agree = false;
                })
            })
            return;
        }
        $scope.enterpriseModal.show();
    }
    $scope.agreeEnterprise = function () {
        $scope.enterpriseModal.hide();
        $scope.filter.enterprise_proxy_agree = true;
        $scope.agentModel.enterprise_proxy_agree = "Y";
    }
    $scope.closeEn = function () {
        $scope.enterpriseModal.hide();
        if($scope.agentModel.isChecked == 0){
            $scope.filter.enterprise_proxy_agree = true;
        } else {
            $scope.filter.enterprise_proxy_agree = false;
        }
    }
    // 单位授权书
    $scope.BusAuthorizationModel = function () {
        $scope.monadModal.show();
    }
    $scope.agreeAgent = function () {
        $scope.monadModal.hide();
        $scope.filter.authorization_cert_agree = true;
        $scope.agentModel.authorization_cert_agree = "Y";
    }
    $scope.closeAg = function () {
        $scope.monadModal.hide();
        if ($scope.agentModel.isChecked == 0) {
            $scope.filter.authorization_cert_agree = true;
        } else {
            $scope.filter.authorization_cert_agree = false;
        }
    }
    // 正在审核的时候，禁止签协议
    if ($scope.agentModel.isChecked == 0) {
        $scope.isDisable = true;
    }
    $scope.saveAgent = function () {
        //alert($scope.agentModel.agent_treasurer_cert_photo_front_id)
        //alert($scope.agentModel.agent_treasurer_cert_photo_back_id)
        if (!$scope.agentModel.agent_treasurer_name) {
            $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人姓名！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.agent_treasurer_phone) {
            $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人手机号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.agent_treasurer_cert_no) {
            $ionicPopup.alert({
                title: '提示',
                template: '请填写经办人身份证号码！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.agent_treasurer_cert_photo_front_id && !$scope.isViewAgentF) {
            $ionicPopup.alert({
                title: '提示',
                template: '请上传身份证！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.agent_treasurer_cert_photo_front_id && $scope.isViewAgentF) {
            $ionicPopup.alert({
                title: '提示',
                template: '身份证正在上传，请等待！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.agentModel.agent_treasurer_cert_photo_back_id && !$scope.isViewAgentB) {
            $ionicPopup.alert({
                title: '提示',
                template: '请上传身份证！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.agent_treasurer_cert_photo_back_id && $scope.isViewAgentB) {
            $ionicPopup.alert({
                title: '提示',
                template: '身份证正在上传，请等待！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.filter.Rule) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读协议并勾选同意！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.filter.enterprise_proxy_agree) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读企业授权协议并勾选同意！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.filter.authorization_cert_agree) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读单位授权协议并勾选同意！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!$scope.agentModel.isChecked) {
            payingService.postAgentTreasurer2($scope.model.id, $scope.agentModel).then(function (data) {
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxWan',
                    template: '<div class="alert-bind-info1">' +
                               '<div class="box">' +
                               '<h3>温馨提示</h3>' +
                               '<p>已完善业务授权信息，请进行下一步账户绑定</p>' +
                               '<ul>' +
                               '<li class="on"><i>1</i>编辑联系人信息</li>' +
                               '<li class="on"><i>2</i>机构认证</li>' +
                               '<li class="on"><i>3</i>业务授权</li>' +
                               '<li><i>4</i>账户绑定</li>' +
                               '</ul>' +
                               '<p class="tips">注：进行电票交易须完成四步信息填写，如无需电票交易则填写第一、二步信息即可。</p>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '取消',
                              onTap: function (e) {
                                  $state.go('app.user');
                              }
                          },
                          {
                              text: '进入下一步',
                              type: 'button-positive',
                              onTap: function (e) {
                                  $state.go('app.accountBind');
                              }
                          }
                    ]
                })
            });
        } else {
            payingService.updateAgentTreasurer($scope.model.id, $scope.agentModel).then(function (data) {
                //$scope.reloadModel();
                $ionicPopup.alert({
                    title: '警告',
                    template: '保存成功，请等待管理员审核！！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                $state.go('app.user');
                //$scope.filter.tip = true
            });
        }
    }

    $scope.updateAgent = function () {
        if ($scope.filter.update == false) {
            $scope.filter.update = true;
        }
        else {
            $scope.saveAgent();
        }
    }

    //图片放大弹框
    $ionicModal.fromTemplateUrl('imgMagnify.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.imgMagnifyModal = modal;
    });


    $scope.openImgMagnifyModal = function (img_path) {
        if (img_path) {
            $scope.imgMagnifyModal.show();
            $scope.img_path = img_path;
        }
    }

    $scope.closeImgMagnifyModal = function () {
        $scope.imgMagnifyModal.hide();
    }
});
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
ionicApp.controller('newRegisterController', function ($scope, $rootScope) {

})
ionicApp.controller('onDaDetailController', function ($scope, $rootScope, $state, $filter, WEB_URL, $ionicPopup, billService, enterprisesService, toolService, customerService) {
    $scope.appraisalModel = {};

    $scope.cc = {
        isType1: true,
        isType2: true,
        isType3: true
    };

    $scope.changeBillStyleId = function (bill_style_id) {
        if (bill_style_id == $scope.model.bill_style_id)
            return;
    $scope.params = $scope.Params.Create('-offer_time', 1);
    $scope.filter = {
        search: '',
        publishingTimeS: '',
        publishingTimeB: '',
        tradeLocationId: '',
    };
    
        //if ($scope.filter.isType1 == true) {
        //    $('.hpxcc').show();
        //} else if ($scope.filter.isType1 == false) {
        //    $('.hpxcc').hide();
        //}
        //billService.searchBillOffer($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, $scope.filter.billStyleId[0], $scope.filter.enterpriseName, $scope.filter.tradeLocationId).then(function (data) {

        billService.searchBillOffer($scope.params, $scope.filter.search, $scope.filter.publishingTimeS, $scope.filter.publishingTimeB, bill_style_id, $scope.model.enterprise_name, $scope.filter.tradeLocationId).then(function (data) {
            if (!data[0]) {
                $ionicPopup.alert({
                    title: "通知",
                    template: "没有该类报价信息！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }
            else {
                $scope.model = data[0];
                $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
            }
        })
    }
    $scope.follow = function (follow) {
        $scope.followModel = {
            collection_enterprise_id: $scope.model.enterprise_id,
            is_collection_enterprise: follow
        }
        customerService.followEnterprise($scope.followModel).then(function () {
            $scope.model.is_collection_enterprise = follow;
        })
    }

    if ($rootScope.boId) {
        billService.getBillOffer($rootScope.billOfferbillOfferId).then(function (data) {
            $scope.model = data;
            toolService.getStars($scope.model.enterprise_id).then(function (data) {
                $scope.star = data;
            });
            $scope.model.offer_detail = JSON.parse($scope.model.offer_detail);
        });
        enterprisesService.getorderAppraisalA($rootScope.billOfferbillOfferId).then(function (data) {
            
        })

    }
    else {
        $scope.model = {}
        $scope.model.enterprise_id = $rootScope.eId
        $scope.model.enterprise_name = $rootScope.eN
        //toolService.getStars($scope.model.enterprise_id).then(function (data) {
        //    $scope.star = data;
        //});
        //$scope.changeBillStyleId('202')
    }
    $scope.getorderAppraisal = function () {
        //enterprisesService.getorderAppraisal('101', $scope.model.id).then(function (data) {
        //    $scope.appraisalModel = data;
        //});
    }

    // 调整
    $scope.edit = function (data) {
        $state.go('app.newBillOffer', { 'id': data.id });
    }
    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create('-offer_time', 10);
        //$scope.listData = [];
        //$scope.loadMore();
    };
    //删除报价
    $scope.remove = function (data) {
        console.log(data)
        var confirmPopup = $ionicPopup.confirm({
            title: '注意',
            template: '确定要删除该报价吗?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                billService.deleteBillOffer(data.id).then(function (data) {
                    //$scope.doRefresh();
                    $state.go('app.billOfferQuery')
                });
            }
        });


    }


    $scope.share = function () { 
        var myPopup = $ionicPopup.show({
            cssClass: 'hpxShare',
            template: '<div class="g-alert-shares">' +
                      '<div class="box">' +
                      '<ul class="con">' +
                      '<li><a href="javascript:;" ng-click="shareToWechatFriend()"><img src="images/share1.png" alt=""/>微信好友</a></li>' +
                      '<li><a href="javascript:;" ng-click="shareToWechat()"><img src="images/share2.png" alt=""/>微信朋友圈</a></li>'+
                      //'<li><a href="javascript:;" ng-click="shareToWeibo()"><img src="images/share3.png" alt=""/>新浪微博</a></li>'+
                      '<li><a href="javascript:;" ng-click="shareToQQ()"><img src="images/share4.png" alt=""/>QQ好友</a></li>'+
                      '<li><a href="javascript:;" ng-click="shareToQQZone()"><img src="images/share5.png" alt=""/>QQ空间</a></li>'+
                      '</ul>'+
                      '</div>'+
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

    $scope.shareToWeibo = function () {
        try {
            var args = {};
            args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = $filter('date')($scope.model.offer_time, 'yyyy年MM月dd日') + '，' + $scope.model.publisher_name + '，' + $scope.model.bill_style_name + '报价';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = 'https://www.huipiaoxian.com/thumbnail.png';
            WeiboSDK.shareToWeibo(function () {
                //alert('分享成功！');
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                console.log(failReason);
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
                //alert('分享成功！');
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                console.log(failReason);
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
                //alert('分享成功！');
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
            }, function (failReason) {
                console.log(failReason);
            }, args);
        }
        catch (e) {
            console.log(e.message);
        }
    };
})
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
ionicApp.controller('onLineController', function ($scope, $rootScope, $state, $filter, $ionicHistory, $ionicPopup, $sce, $compile) {
    //$scope.includeAct = function (args) {
    //    $rootScope.activityId = args;
    //    $state.go("app.activity");
    //}
    //$scope.canyu = function () {
    //    if ($rootScope.identity == null) {
    //        $ionicPopup.alert({
    //            title: '提示',
    //            template: '账户未登录！',
    //            okText: '确    定',
    //            cssClass: 'hpxModal'
    //        });
    //        $state.go("app.signin");
    //        return;
    //    } else {
    //        $state.go('app.draw');
    //    }
    //}
    //$scope.htmlTop = '<img src="images/activity1.png"><img src="images/activity2.png"><img src="images/activity3.png">';
    //$scope.htmlFoot = '<img style="float:left;width:55%;" ng-click="includeAct(1)" src="images/activity4.png" alt="" /><img style="float:right;width:45%;" ng-click="includeAct(2)" src="images/activity5.png" alt="" />';

    //$scope.style = 'line-height:0;'
    //$scope.style1 = 'height:100%;background-color:#fedd52;'
    //$scope.trusHtmlFoot = $sce.trustAsHtml($scope.htmlFoot);
    //angular.element(".act_bind").append($compile($scope.htmlFoot)($scope));

    // 通过bannerid查询显示的内容
    //$scope.anTemplate = [
    //    {
    //        'url': 'images/activity2.png'
    //    },
    //    {
    //        'url': 'images/activity2.png'
    //    }
    //]
    //$scope.updateSlide = function () {
    //    $ionicSlideBoxDelegate.$getByHandle('slideboximgs').update();
    //    $ionicSlideBoxDelegate.$getByHandle("slideboximgs");
    //}


    //$scope.acTemplate = {
    //    'img_usr': {
    //        'img1': '',
    //        'img2': '',
    //        'img3': ''
    //    },
    //    'html': {
    //        'html1': '<img src="images/activity1.png"><img ng-click="canyu()" src="images/activity2.png"><img src="images/activity3.png">',
    //        'html2': '<img style="float:left;width:55%;" ng-click="includeAct(1)" src="images/activity4.png" alt="" /><img style="float:right;width:45%;" ng-click="includeAct(2)" src="images/activity5.png" alt="" />',
    //        'html3':'<button ng-click="btn(1)">html</button>'
    //    },
    //    'style': {
    //        'style1': 'line-height:0;',
    //        'style2': 'height:100%;background-color:#fedd52;'
    //    },
    //    'text': {
    //        'text1':'上海汇票线'
    //    }
    //}
    //$scope.htmlTop = $scope.acTemplate.html.html1;
    //$scope.htmlFoot = $scope.acTemplate.html.html2;
    //$scope.style = $scope.acTemplate.style.style1;
    //$scope.style1 = $scope.acTemplate.style.style2;
    //angular.element(".act_bind").append($compile($scope.htmlFoot)($scope));

    //$scope.activity = function (args) {
    //    $state.go('app.activity');
    //    $rootScope.actiId = args;
    //}
    //$scope.canyu = function () {
    //    window.open("http://wechat.huipiaoxian.com/invitation/appswitch.html");
    //}

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
                    title: '汇票线“独家代理”火热招募中',
                    description: '不容错过，票据平台风口已来，给您一个借力平台，一起分享电票时代的发展红利。',
                    thumb: "http://wechat.huipiaoxian.com/invitation/images/logo.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: 'http://wechat.huipiaoxian.com/activity0929/index.html',
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
                    title: '汇票线“独家代理”火热招募中',
                    description: '不容错过，票据平台风口已来，给您一个借力平台，一起分享电票时代的发展红利。',
                    thumb: "http://wechat.huipiaoxian.com/invitation/images/logo.png",
                    media: {
                        type: Wechat.Type.WEBPAGE,
                        webpageUrl: 'http://wechat.huipiaoxian.com/activity0929/index.html',
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
            args.url = 'http://wechat.huipiaoxian.com/activity0929/index.html';
            args.title = '汇票线“独家代理”火热招募中';
            args.description = '不容错过，票据平台风口已来，给您一个借力平台，一起分享电票时代的发展红利。';
            args.image = 'http://wechat.huipiaoxian.com/invitation/images/logo.png';
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
            args.url = 'http://wechat.huipiaoxian.com/activity0929/index.html';
            args.title = '汇票线“独家代理”火热招募中';
            args.description = '不容错过，票据平台风口已来，给您一个借力平台，一起分享电票时代的发展红利。';
            args.image = 'http://wechat.huipiaoxian.com/invitation/images/logo.png';
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
            args.url = 'http://wechat.huipiaoxian.com/activity0929/index.html';
            args.title = '汇票线“独家代理”火热招募中';
            args.description = '汇票线是免收平台服务费，免费对接，不赚差价的票据在线交易一站式服务平台。';
            args.image = 'http://wechat.huipiaoxian.com/invitation/images/logo.png';
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
ionicApp.controller('onLinesController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, $ionicPopup) {

    var bill_style_id;

    $scope.onShangO = function (bill_style_id) {
        billService.getBillOfferBySelf().then(function (data) {
            if (data == null) {
                $rootScope.hpxA = bill_style_id;
                $state.go('app.newBillOffer');
            } else {
                $scope.billData = data.billOffers;
                var itemData = data.billOffers;
                var keepGoing = true;
                angular.forEach(itemData, function (ele, ind) {
                    if (keepGoing) {
                        if (bill_style_id == ele.bill_style_id) {
                            $rootScope.boId = true;
                            $rootScope.billOfferbillOfferId = ele.bill_offer_id;
                            $state.go('app.onDaDetail', { 'id': ele.bill_offer_id })
                            keepGoing = false;
                        }
                        else if (bill_style_id != ele.bill_style_id) {
                            $rootScope.hpxA = bill_style_id;
                            $state.go('app.newBillOffer');
                        }
                    }
                })
            }
        });
    }


    $scope.doRefresh = function () {
        $scope.getBill();
    };
    console.log($scope)
    $scope.getBill = function () {
        billService.getBillOfferBySelf().then(function (data) {
            if (data != null) {
                $scope.billData = data.billOffers;
            }
        });
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
    
})
ionicApp.controller('onShangController', function ($scope, $rootScope, $state, $stateParams, $ionicPopup, $timeout, addressService, customerService, billService, constantsService) {
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
ionicApp.controller('onShangDetailController', function ($scope, $rootScope, $state, $filter, WEB_URL, $ionicPopup, billService, enterprisesService, toolService, customerService) {
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
ionicApp.controller('onXiaoDetailController', function ($scope, $rootScope, $state, $filter, WEB_URL, $ionicPopup, billService, enterprisesService, toolService, customerService) {
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
ionicApp.controller('photoTestController', function ($scope, $rootScope, customerService, $state) {
    // 模拟登陆
    customerService.customerLoginEnterprise({ 'username': 'jinyifan', 'password': '123654789' }).then(function (data) {
        customerService.customerLogin({ 'username': 'jinyifan', 'password': '123654789', 'enterprise_id': data.enterprises[0].enterprise_id }).then(function (data) {
            $rootScope.identity = data;
        });
    });

    $scope.takePhoto = function () {
        $scope.$takePhoto(function (data) {
            $scope.photoSrc = data;
        });
    }

    $scope.upload = function (src) {
        $scope.$uploadPhoto(src, function (data) {
            
        });
    }
})
ionicApp.controller('promoteEventController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getIntivationService, $ionicPopup) {
    console.log($scope)
    $scope.staetEvent = function () {
        $state.go('app.promoteInvitaSuc')
    }
    hpx = function () {
        $(".cpop").hide();
        // 获取手机号
        appHomeService.getAppHome().then(function (data) {
            $scope.customerInfo = data;
            getIntivationService.getInvitationRecord(data.phone_number).then(function (data) {
                console.log("获取")
                console.log(data)
                $scope.getAppPhone = data;
            })
        });
    }
    hpx();
    $scope.guize = function () {

        var myPopup = $ionicPopup.show({
            cssClass: 'hpxYao',
            templateUrl: 'endorsePopup.html',
            template: '<div><img style="width:70px;" src="../../images/close.png" /></div>',
            scope: $scope,
            buttons: [
              { text: '我知道了' },
              //{
              //    text: '是',
              //    type: 'button-positive',
              //    onTap: function (e) {
              //        console.log("保存完成")

              //        //$scope.addvModal.show();
              //    }
              //},
            ]
        });
    }
    $scope.hpxClose = function () {
        $(".cpop").hide();
    }


})
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
ionicApp.controller('publishController', function ($rootScope, $scope, $timeout, $stateParams, $state, FILE_URL, Upload, billService, addressService, customerService, constantsService, bankService, fileService) {
    
});

ionicApp.controller('querybankController', function ($rootScope, $scope, $state, $interval, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {

})
ionicApp.controller('queryBillController', function ($rootScope, $scope, $state, $stateParams, ngTableParams, addressService, billService, constantsService) {
    var emptyEntity = {};
    var newEntity = angular.copy(emptyEntity, newEntity);

    $scope.filter = {
        acceptorTypeID: '',
        billStatusAll: true,
        tradeTypeCode: '',
        billTypeID: '',
        billStatusCode: '801,802,803,804,805,806,807,808,809,810,811,812,813',
        billCharacterCode: '',
        billStyleID:'',
    };

    $scope.tableParams = new ngTableParams({ 'sorting': { 'publishing_time': 'desc' } }, {
        getData: function (params) {

            var acceptorTypeID = [];
            if (!$scope.filter.acceptorTypeAll) {           //获取选中的承兑机构
                for (var i = 0; i < $scope.acceptorTypeData.length; i++) {
                    if ($scope.acceptorTypeData[i].checked) {
                        acceptorTypeID.push($scope.acceptorTypeData[i].code)
                    }
                }
            }
            $scope.filter.acceptorTypeID = acceptorTypeID.join(",");

            
            $scope.filter.locationId = $scope.filter.CityID;

            //查看票据
            return billService.searchBillProduct(params, $scope.filter.billTypeID, $scope.filter.billStyleID, $scope.filter.billStatusCode, $scope.filter.acceptorTypeID, $scope.filter.locationId, $scope.filter.tradeTypeCode, $scope.filter.billCharacterCode, $scope.filter.billFlawID).then(function (data) {
                $scope.first = $scope.getFirst(params);
                //if (data.bill_status_code == 801) {
                //    data.bill_status_name="发布中";
                //}else if(data.bill_status_code >= 802) {
                //    data.bill_status_name="交易中";
                //}
                return data;
            });
        }
    });
    //刷新
    $scope.reflash = function () {
        $scope.tableParams.reload();
    }

  
});

ionicApp.controller('queryenterpriseController', function ($rootScope, $scope, $state, $interval, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {

})
ionicApp.controller('receiveBillController', function ($rootScope, $scope, $state, addressService, billService, $ionicPopup) {
    $rootScope.receiveBill = {};
    $rootScope.receiveBill.filter = {
        //billTypeAll: true,
        billStyleAll: true,
        acceptorTypeAll: true,
        billCharacterAll: true,
        billStatusAll: true,
        //tradeTypeCode: '701,702',
        tradeTypeCode: '',
        //billTypeID: '101,102',
        billTypeID: '',
        billStatusCode: '801,802',
        //billCharacterCode: '1701,1702',
        billCharacterCode: '',
        //acceptorTypeID: '401,402,403,404,405,406,407'
        acceptorTypeID: '',
        acceptorTypeIdArray: []
    };
    $scope.filter = {
        //billTypeAll: true,
        billStyleAll: true,
        acceptorTypeAll: true,
        billCharacterAll: true,
        billStatusAll: true,
        //tradeTypeCode: '701,702',
        tradeTypeCode: '',
        //billTypeID: '101,102',
        billTypeID: '',
        billStatusCode: '801,802',
        //billCharacterCode: '1701,1702',
        billCharacterCode: '',
        //acceptorTypeID: '401,402,403,404,405,406,407'
        acceptorTypeID:'',
        acceptorTypeIdArray: []
    };


    //全选票据类型
    $scope.choiceAllBillType = function () {
        $scope.filter.billTypeID = '';
        $scope.filter.billStyleAll = true;
    };

    //选择电票
    $scope.choiceEBillType = function () {
        $scope.filter.billTypeID = '101';
        $scope.filter.billStyleAll = false;
    };
    //选择纸票
    $scope.choicePBillType = function () {
        $scope.filter.billTypeID = '102';
        $scope.filter.billStyleAll = false;
    };

    //交易方式（全选）
    $scope.choiceAlltradeType = function () {
        $scope.filter.tradeTypeCode = '';
    };

    //选择现票买断
    $scope.choiceNtradeType = function () {
        $scope.filter.tradeTypeCode = '701';
    };

    //选择预约出票
    $scope.choiceRAlltradeType = function () {
        $scope.filter.tradeTypeCode = '702';
    };

    //汇票状态（全选）
    $scope.choiceAllBillStatus = function () {
        $scope.filter.billStatusCode = '801,802,803,804,805,806,807,808,809,810,811,812,813';
        $scope.filter.billStatusAll = true;
    };

    ////未交易
    //$scope.choiceNAllBillStatus = function () {
    //    $scope.filter.billStatusCode = '801,802';
    //    $scope.filter.billStatusAll = false;
    //};

    ////已交易
    //$scope.choiceYAllBillStatus = function () {
    //    $scope.filter.billStatusCode = '803,804,805,806,807,808,809,810,811,812,813';
    //    $scope.filter.billStatusAll = false;
    //};

    //承兑机构（全选）
    $scope.choiceAllAcceptorType = function () {
        $scope.filter.acceptorTypeID = '';
        $scope.filter.acceptorTypeAll = true;
        $scope.filter.acceptorTypeIdArray = [];
    };
    $scope.choiceAcceptorType = function (id) {
        $scope.filter.acceptorTypeAll = false;
        if ($scope.filter.acceptorTypeIdArray.indexOf(id) == -1) {
            $scope.filter.acceptorTypeIdArray.push(id)
        }
        else {
            for(var i = 0; i < $scope.filter.acceptorTypeIdArray.length; i++) {
                if($scope.filter.acceptorTypeIdArray[i] == id) {
                    $scope.filter.acceptorTypeIdArray.splice(i, 1)
                    break;
                }
            }
        }
    }
    //国股
    $scope.choice401AcceptorType = function () {
        $scope.filter.acceptorTypeAll = false;
        $scope.filter.acceptorTypeID = '401';
    }
    
    //城商 
    $scope.choice402AcceptorType = function () {
        $scope.filter.acceptorTypeAll = false;
        $scope.filter.acceptorTypeID = '402'
    }
    
    //三农
    $scope.choice403AcceptorType = function () {
        $scope.filter.acceptorTypeAll = false;
        $scope.filter.acceptorTypeID = '403'
    }

    //村镇 
    $scope.choice404AcceptorType = function () {
        $scope.filter.acceptorTypeAll = false;
        $scope.filter.acceptorTypeID = '404'
    }
    
    //外资 
    $scope.choice405AcceptorType = function () {
        $scope.filter.acceptorTypeAll = false;
        $scope.filter.acceptorTypeID = '405'
    }
    
    //财务公司 
    $scope.choice406AcceptorType = function () {
        $scope.filter.acceptorTypeAll = false;
        $scope.filter.acceptorTypeID = '406'
    }

    //商票
    $scope.choice407AcceptorType = function () {
        $scope.filter.acceptorTypeAll = false;
        $scope.filter.acceptorTypeID = '407'
    }

    //汇票特点（全选）
    $scope.choiceAllBillCharacter = function () {
        $scope.filter.billCharacterAll = true;
        $scope.filter.billCharacterCode = ''
    }
    //足月
    $scope.choiceYBillCharacter = function () {
        $scope.filter.billCharacterAll = false;
        $scope.filter.billCharacterCode = '1701'
    }

    //不足月
    $scope.choiceNBillCharacter = function () {
        $scope.filter.billCharacterAll = false;
        $scope.filter.billCharacterCode = '1702'
    }
    //获取所有的省级地址
    addressService.queryAll().then(function (data) {
        $scope.ProvinceData = data;
        $scope.filterProvinceChange();
    });
    //获取对应的省下所有的市级地址
    $scope.filterProvinceChange = function () {
        if ($scope.filter.ProvinceID == null) {
            return;
        } else if ($scope.filter.ProvinceID == 1 || $scope.filter.ProvinceID == 20 || $scope.filter.ProvinceID == 860 || $scope.filter.ProvinceID == 2462) {
            $scope.filter.tradeProvinceId = $scope.filter.ProvinceID + 1;
            return addressService.queryCity($scope.filter.tradeProvinceId).then(function (data) {
                $scope.CityData = data;
            });
        }else {
            return addressService.queryCity($scope.filter.ProvinceID).then(function (data) {
                $scope.CityData = data;
            });
        }
    }
    $scope.getResult = function () {
        $scope.filter.acceptorTypeID = $scope.filter.acceptorTypeIdArray.join(',')
        //alert($scope.filter.acceptorTypeID)
        if($scope.filter.CityID==undefined){
            $scope.filter.CityID = $scope.filter.ProvinceID;
        }
        $rootScope.receiveBill.filter = $scope.filter;
        $state.go('app.receiveBillResult');
    }
   
    $scope.showHelp = function () {
        $ionicPopup.alert({
            title: '帮助',
            template: ' 足月票：一般是指剩余天数半年期票多于180天，一年期票多于360天的汇票！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
    }

})
ionicApp.controller('receiveBillResultController', function ($scope, $rootScope, $state,$timeout, $ionicPopup, billService, toolService) {
    $scope.filter = {
        //billTypeAll: true,
        billStyleAll: true,
        acceptorTypeAll: true,
        billCharacterAll: true,
        billStatusAll: true,
        //tradeTypeCode: '701,702',
        tradeTypeCode: '',
        //billTypeID: '101,102',
        billTypeID: '',
        billStatusCode: '801,802,803,804,805,806,807,808,809,810,811,812,813',
        //billCharacterCode: '1701,1702',
        billCharacterCode: '',
        //acceptorTypeID: '401,402,403,404,405,406,407'
        acceptorTypeID: ''
    };
    $scope.is_vis = false;
    $scope.hpxMyRe = function (bill) {
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
            $state.go('app.myReleaseDetail', { 'myReleaseBillId': bill.id });
        }
    };
    $scope.starTemp = {};
    $scope.doRefresh = function () {
        $scope.filter = $rootScope.receiveBill.filter;
        $scope.params = $scope.Params.Create('-publishing_time', 10);
        $scope.listData = [];
        $scope.loadMore();
    };
    $scope.loadMore = function (first) {
        $scope.filter.locationId = $scope.filter.CityID;

        //查看票据
        return billService.searchBillProduct($scope.params, $scope.filter.billTypeID, $scope.filter.billStyleID, $scope.filter.billStatusCode, $scope.filter.acceptorTypeID, $scope.filter.locationId, $scope.filter.tradeTypeCode, $scope.filter.billCharacterCode, $scope.filter.billFlawID).then(function (data) {
            $scope.products = data;
            if (data.length == 0) {
                $scope.is_vis = true;
            } else {
                $scope.is_vis = false;
            }
            for (var i = 0; i < $scope.products.length; i++) {
                toolService.setStars($scope.products[i]);
            };
            $scope.hasMore = data.length == 10;
            $scope.listData = first ? $scope.products : $scope.listData.concat($scope.products);
            
            $scope.$broadcast('scroll.infiniteScrollComplete')
            $scope.params.next();
            $scope.$broadcast('scroll.refreshComplete')
        });
    };
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})
ionicApp.controller('rechargeController', function ($scope, $rootScope, $ionicPopup, $state, $http, API_URL, payingService, alipayService) {
    if ($rootScope.identity == null) {
        $ionicPopup.alert({
            title: '提示',
            template: '账户未登录！',
            okText: '确    定',
            cssClass: 'hpxModal'
        });
        $state.go("app.signin");
        return
    }
    $scope.alipayAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: '提示',
            template: '充值成功！',
            okText: '确    定',
            cssClass: 'hpxModal',
        });
        alertPopup.then(function (res) {
            //$state.go('app.recharge');
            //window.location.reload();
            $scope.model.recharge_price = "";
        })
    }
    $scope.model = {};
    $scope.submit = function () {
        //if (!$scope.model.recharge_price) return;
        //window.open(API_URL + '/paying/recharge?rechargePrice=' + $scope.model.recharge_price + '&enterpriseId=' + $rootScope.identity.enterprise_id);
        alipayService.alipay($scope.model.recharge_price, $rootScope.identity.enterprise_id).then(function (data) {
            var orderInfo = data.orderInfo;
            //cordova.plugins.AliPay.pay   cordova.plugins.alipay.payment
            cordova.plugins.AliPay.pay(orderInfo, function (e) {
                alipayService.synNotification(e).then(function (data) {
                    $scope.alipayAlert();
                })
            }, function (e) {
                alipayService.synNotification(e).then(function (data) {
                    
                })
            })
        });
    };
    if ($rootScope.identity.is_verified >= 3 || $rootScope.identity.is_verified == 1) {
        // 获取账户余额
        payingService.GetPlatformAccount().then(function (data) {
            $scope.hpxMoney = data;
        })
    }

})
ionicApp.controller('rechargePayController', function ($scope, $rootScope, $state) {
})
ionicApp.controller('rechargerecordController', function ($scope, $rootScope, $state, payingService) {
    
    $scope.filter = {};

    $scope.doRefresh = function () {
        $scope.params = $scope.Params.Create();
        $scope.listData = [];
        $scope.loadMore();
    };
    $scope.is_vis = false;
    $scope.loadMore = function (first) {
        payingService.platformAccountBalance($scope.params).then(function (data) {
            if (data == null) {
                $scope.is_vis = true;
            } else {
                $scope.is_vis = false;
            }
            $scope.hasMore = data.length == 10;
            $scope.listData = first ? data : $scope.listData.concat(data);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
        });

        $scope.params.next();
    };

    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
})
ionicApp.controller('securityController', function ($scope, $rootScope, $state) {
})
ionicApp.controller('setController', function ($scope, $rootScope, $state, $ionicPopup, localStorageService) {
    $scope.loginOut = function () {
        if ($rootScope.identity) {
            $rootScope.loginRequestEnter = null;
            $rootScope.enterprises = null;
            $rootScope.identity = null;
            localStorageService.set('customer', null);
            $ionicPopup.alert({
                title: '提示',
                template: '退出成功!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
        }
    }
    $scope.showVersion = function () {
        $ionicPopup.alert({
            title: '提示',
            template: '当前版本:汇票线v1.6.0!',
            okText: '确    定',
            cssClass: 'hpxModal hpxfu'
        });
    }
})
ionicApp.controller('signinController', function ($rootScope, $scope, $state, $interval, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {
    $scope.model = {};
    $scope.loginRequestEnterprise = {};
    $scope.loginRequest = {};
    $scope.loginRequestEnterprise.username = "";
    $scope.loginRequestEnterprise.password = "";
    $scope.loginRequest.username = "";
    $scope.loginRequest.password = "";
    $rootScope.loginRequestEnter = {};
    $scope.enterprises = [];
    //新建账户信息
    $scope.loginEnterprise = function () {
        $scope.loginRequestEnterprise = {
            username: $scope.model.phone_number,
            password: $scope.model.password,
        }
        $rootScope.loginRequestEnter = {
            username: $scope.model.phone_number,
            password: $scope.model.password,
        }
        customerService.customerLoginEnterprise($scope.loginRequestEnterprise).then(function (data) {
            if (data.enterprises[0].enterprise_id != -1) {
                if (data.enterprises.length == 1) {
                    $scope.loginRequest = {
                        username:$scope.model.phone_number,
                        password: $scope.model.password,
                        enterprise_id:data.enterprises[0].enterprise_id,
                    }
                    customerService.customerLogin($scope.loginRequest).then(function (data) {
                        localStorageService.set('customer', data);
                        $rootScope.identity = data;
                        Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
                        $state.go('app.user');      //跳转到个人中心
                    });
                } else {
                    $rootScope.enterprises = data.enterprises;
                    $state.go('app.signinEnterprise');
                }
            } else {
                $scope.loginRequest = {
                    username: $scope.loginRequestEnterprise.username,
                    password: $scope.loginRequestEnterprise.password,
                    enterprise_id: -1
                };
                customerService.customerLogin($scope.loginRequest).then(function (data) {
                    localStorageService.set('customer', data);
                    $rootScope.identity = data;
                    Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
                    $state.go('app.user');      //跳转到个人中心
                });
            }
        });
    };
    $scope.login = function (enterprise_id) {
        $scope.loginRequest = {
            username: $scope.loginRequestEnterprise.phone_number,
            password: $scope.loginRequestEnterprise.password,
            enterprise_id: enterprise_id
        }
        customerService.customerLogin($scope.loginRequest).then(function (data) {
            localStorageService.set('customer', data);
            $rootScope.identity = data;
            Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
            $state.go('app.user');      //跳转到个人中心
        });
    };
})
ionicApp.controller('signinEnterpriseController', function ($rootScope, $scope, $state, $interval, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {
    //新建账户信息
    $scope.loginRequest = {};
    $scope.loginRequest.username = "";
    $scope.loginRequest.password = "";
    $scope.enterprises1 = [];
    $scope.enterprises1 = $rootScope.enterprises;
    $scope.loginRequest = $rootScope.loginRequestEnter;

    $scope.loginEnter = function (n) {
        $scope.loginRequest.enterprise_id = n;
        customerService.customerLogin($scope.loginRequest).then(function (data) {
            localStorageService.set('customer', data);
            $rootScope.identity = data;
            Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
            $state.go('app.user');      //跳转到个人中心
        });
    };

})
ionicApp.controller('signupController', function ($rootScope, $scope, $state, $interval, $ionicModal, billService, $ionicPopup, customerService, constantsService, Restangular, localStorageService) {
    $scope.model = {};
    $scope.verifyStr = "获取验证码";
    $scope.disableVerify = false;
    $scope.filter = {
        choicePhone: 0,
        rule: true
    }
    //var second = 90;
    //发送验证码
    $scope.getVerify = function () {
        if (!$scope.model.phone_number || $scope.model.phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        customerService.phoneVerify($scope.model.phone_number).then(function () {
            $ionicPopup.alert({
                title: '通知',
                template: '验证码已发送!',
                okText: '确    定',
                cssClass: 'hpxModal'
                });
            $scope.second = 60;
            $scope.disableVerify = true;

            $interval(function () {
                $scope.verifyStr = $scope.second + "秒后重新获取";
                $scope.second--;

                if ($scope.second == 0) {
                    $scope.verifyStr = "重新获取验证码";
                    $scope.disableVerify = false;
                }
            }, 1000, 60);
        })
    };

    $scope.PhoneChange = function () {
        if ($scope.model.phone_number && (/^1(3|4|5|7|8)\d{9}$/.test($scope.model.phone_number))) {
            //$scope.model.phone_number.length == 11 &&
            customerService.testPhoneNumber($scope.model.phone_number).then(function (data) {
                if (!data) {
                    $scope.filter.choicePhone = 1;
                }
                else {
                    $scope.filter.choicePhone = 2;
                }
            });
        }
        else if ($scope.model.phone_number && $scope.model.phone_number.length == 11) {
            $scope.filter.choicePhone = 3;
        }
    }

    $ionicModal.fromTemplateUrl('servicePopup.html', {
        scope: $scope,
    }).then(function (modal) {
        $scope.serviceModal = modal;
    });
    $scope.hpxService = function () {
        $scope.serviceModal.show();
    };
    $scope.closeModel = function () {
        $scope.serviceModal.hide();
    }

    $scope.signup = function () {
        if (!$scope.model.phone_number || $scope.model.phone_number.length != 11) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入手机号码!',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }

        if (!$scope.model.password || $scope.model.password.length == 0) {
             $ionicPopup.alert({
                title: '提示',
                template: '请输入密码!',
                okText: '确    定',
                cssClass: 'hpxModal'
                });
                return;
        }

        if (!$scope.model.password || $scope.model.password.length < 6) {
             $ionicPopup.alert({
                 title: '提示',
                 template: '请输入密码!',
                 okText: '确    定',
                 cssClass: 'hpxModal'
             });
            return;
        }

        if ($scope.model.password != $scope.model.password2) {
             $ionicPopup.alert({
                 title: '提示',
                 template: '两次密码输入不一致！',
                 okText: '确    定',
                 cssClass: 'hpxModal'
             });
            return;
        }

        if (!$scope.model.phone_verify_code || $scope.model.phone_verify_code.length == 0) {
             $ionicPopup.alert({
                 title: '提示',
                 template: '请输入验证码！',
                 okText: '确    定',
                 cssClass: 'hpxModal'
             });
            return;
        }

        if (!$scope.filter.rule) {
            $ionicPopup.alert({
                title: '提示',
                template: '请先阅读协议并勾选同意！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        //注册功能
        customerService.customerReg($scope.model).then(function (data) {
            $ionicPopup.alert({
                title: '通知',
                template: '注册成功，请完善联系人信息!',
                okText: '确    定',
                cssClass: 'hpxModal'
                });
            $scope.loginRequest = {
                username: $scope.model.phone_number,
                password: $scope.model.password,
                enterprise_id: -1
            }
            $rootScope.loginRequestEnter = {
                username: $scope.model.phone_number,
                password: $scope.model.password,
                enterprise_id: -1
            }
            //新建账户信息
            customerService.customerLogin($scope.loginRequest).then(function (data) {
                //$cookieStore.put('customer', data);
                localStorageService.set('customer', data);
                //alert(data.token);
                $rootScope.identity = data;
                Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
                $state.go('app.userInfo');      //跳转到个人中心
            });
        });
    }

    //$scope.tLogin = function () {
    //    $scope.loginRequest = {
    //            username: 17826859540,
    //            password: '111111',
    //            enterprise_id: -1
    //        }
    // customerService.customerLogin($scope.loginRequest).then(function (data) {
    //            //$cookieStore.put('customer', data);
    //            localStorageService.put('customer', data);
    //            alert(data.token);
    //            $rootScope.identity = data;
    //            Restangular.setDefaultHeaders({ 'Authorization': 'Bearer ' + data.token });
    //            $state.go('app.home');      //跳转到个人中心
    //        });
    //}
});
ionicApp.controller('smearBillController', function ($rootScope, $ionicPopup, $scope, $state, localStorageService, FILE_URL, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer) {
    var curRotate = 0;

    var outSize = $(window).get(0).innerWidth * 2;			//定义canvas宽高
    $('#cv').height = outSize;

    var isMouseDown = false;			//检测按下鼠标动作
    var lastLoc = { x: 0, y: 0 };		//上一次的坐标

    var canvas = document.getElementById("canvas");		//获取canvas对象
    var context = canvas.getContext("2d");			//取得图形上下文
    var mosicIndex = 0;                 //当前灰度索引
    var mosicLevel = 30;                //灰度的层级
    var oldStartX = oldStartY = -1;
    var history = [];                   // 历史记录

    canvas.width = outSize;			//定义canvas宽高
    canvas.height = outSize;
    //context.fillStyle = 'rgba(255, 255, 255, 0)';

    var hasPhoto = false;

    var shareImgUrl = null;//分享图片链接

    $scope.setting = {
        size: 10
    };


    var pencil = $scope.pencil = {
        thickness: 30,
        color: 'rgba(0,0,0,0)'
    };


    //function initProgress() {
    //    $scope.progressInfo = "保存中...";

    //    $scope.progressStyle = {
    //        "width": "2%"
    //    };
    //}

    var image = new Image();
    image.crossOrigin = '*';

    drawImage = function () {
        if (image.height > image.width) {
            canvas.height = outSize;
            canvas.width = canvas.height * image.width / image.height;
        } else {
            canvas.width = outSize;
            canvas.height = canvas.width * image.height / image.width;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);		//绘制图像

        //$('#cv').height = outSize;
    }

    $scope.initImage = function () {
        $scope.$takePhoto(function (data) {
            $scope.photoSrc = data;

            $scope.imgUrl = $scope.photoSrc;
            image.src = $scope.imgUrl + "?" + new Date().getTime();

            hasPhoto = true;

            image.onload = function () {
                drawImage();
            }
        });
    }



    $scope.cancel = function () {
        if (history.length > 0) {
            var pixelData = history.pop();
            context.putImageData(pixelData, 0, 0);
        }

        //image.src = $scope.imgUrl + "?" + new Date().getTime();

        //image.onload = function () {
        //    drawImage();
        //}
    }
    ////当鼠标在外部并且松开的时候
    //$("body").addEventListener('touchend', function (e) {
    //    isMouseDown = false;
    //}, false);

    // 手指按下
    canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        isMouseDown = true;

        lastLoc = windowToCanvas(e.touches[0].pageX * 2, e.touches[0].pageY * 2);

        var pixelData = context.getImageData(0, 0, canvas.width, canvas.height);
        history.push(pixelData);
    }, false);

    // 手指离开
    canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        isMouseDown = false;
    }, false);

    // 手指移动
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (isMouseDown && hasPhoto) {
            var size = $scope.setting.size;
            var curLoc = windowToCanvas(e.touches[0].pageX * 2, e.touches[0].pageY * 2);
            //var pixelData = context.getImageData(curLoc.x, curLoc.y, Math.abs(lastLoc.x-curLoc.x),Math.abs(lastLoc.y-curLoc.y));    // 获得区域数据
            var r = g = b = 0;
            var s = "";
            var startX = startY = 0;

            startX = parseInt(curLoc.x / size) * size;
            startY = parseInt(curLoc.y / size) * size;
            if (oldStartX != startX || oldStartY != startY) {
                r = g = b = mosicIndex * mosicLevel + 80;
                mosicIndex = (mosicIndex + 1) % 6;
                s = 'rgb(' + r + ',' + g + ',' + b + ')';
                context.fillStyle = s;
                context.fillRect(startX, startY, size, size);
                oldStartX = startX;
                oldStartY = startY;
            }
            shareImgUrl = null;
            lastLoc = curLoc;
        }
    }, false);

    //鼠标移动事件
    canvas.onmousemove = function (e) {

    };

    function windowToCanvas(x, y) {				//计算canvas上面的坐标
        var point = canvas.getBoundingClientRect();			//元素边框距离页面的距离
        x = Math.round(x - point.left);
        y = Math.round(y - point.top);
        return { x: x, y: y };
    }

    //$scope.saveImage = function () {
    //    $scope.save(0);
    //};
    //$scope.replaceImage = function () {
    //    $scope.save(1);
    //};
    $scope.save = function () {
        try {
            window.canvas2ImagePlugin.saveImageDataToLibrary(function (msg) {
                $ionicPopup.alert({
                    title: "提示",
                    template: "保存成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            },
                function (err) {
                    $ionicPopup.alert({
                        title: "提示",
                        template: "保存失败！" + err,
                        okText: '确    定',
                        cssClass: 'hpxModal',
                    });
                }, document.getElementById('canvas')
            );
        } catch (e) {
            //alert(e.message);
        }
    };

    var onLoadHandler = function (event) {
        if (this.status == 200 || this.status == 304) {
            //var result = JSON.parse(this.responseText);
            //alert("保存成功");
        }
    };

    //$scope.onProgressHandler = function (event) {
    //    if (event.lengthComputable) {
    //        var percentComplete = parseInt(event.loaded / event.total * 100) + "%";
    //        $scope.progressStyle.width = percentComplete;
    //        if (event.loaded == event.total) {
    //            console.log("保存成功");
    //            $scope.progressInfo = "保存成功";
    //            //保存成功后续处理
    //            afterSave();
    //        }
    //        $scope.$apply();
    //    }
    //};

    //function afterSave() {
    //    $("#progressModal").modal('hide');
    //    var data = {
    //        bill: $stateParams.data.model
    //    };
    //    $state.go('app.constants.checkBill', { data: data });
    //}

    //$scope.resetCanvas = function () {
    //    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    //}

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    ////获取文件名称
    function getEndorsementFileName(imgUrl) {
        var url = imgUrl.split("/");
        var preNames = url[url.length - 1].split(".");
        return preNames[0] + "-1." + preNames[1];
    }

    //顺时针旋转
    $scope.rotate = function () {
        curRotate = curRotate + 1;
        refreshImg();
    };

    ////逆时针旋转
    //$scope.eastern = function () {
    //    console.log(curRotate);
    //    curRotate = curRotate - 1;
    //    refreshImg();
    //};

    function refreshImg() {
        var w = canvas.width;
        var h = canvas.height;
        canvas.width = h;
        canvas.height = w;

        context.save();
        var rotation = curRotate * Math.PI / 2;
        context.clearRect(0, 0, canvas.width, canvas.height)

        if (curRotate % 2 == 0) {
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(rotation);
            context.translate(-canvas.width / 2, -canvas.height / 2);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
        } else {
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(rotation);
            context.translate(-canvas.height / 2, -canvas.width / 2);
            context.drawImage(image, 0, 0, canvas.height, canvas.width);
        }

        context.restore();//恢复状态
        shareImgUrl = null;
    }

    $scope.uploadShareImg = function () {
        try {
            var imgulr = canvas.toDataURL("image/png");
            //alert("调用uploadShareImg方法")
            var uri = 'http://139.224.112.243:4005/v1' + '/file';
            var options = new FileUploadOptions();

            options.fileKey = "file";
            options.fileNam = "0";
            options.mimeType = "image/png";
            //options.headers = { 'Authorization': 'Bearer ' + $rootScope.identity.token };
            options.params = { 'FileTypeCode': 1002 };

            var ft = new FileTransfer();
            ft.upload(imgulr, uri, function (result) {
                data = JSON.parse(result.response)
                //alert(JSON.stringify(result.response))
                //alert(data.data.file_path);
                shareImgUrl = data.data.file_path;
            }, function (err) {
                //alert(err.exception);
            }, options);
        } catch (e) {
            //alert(e.message)
        }
    }

    $scope.share = function () {
        $(".g-alert-shares").fadeIn(300);
        if (!shareImgUrl) {
            $scope.uploadShareImg();
        }
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
                    title: '汇票分享',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    //thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    thumb: canvas.toDataURL("image/png"),
                    media: {
                        type: Wechat.Type.IMAGE,
                        image: canvas.toDataURL("image/png")
                    }
                },
                scene: Wechat.Scene.SESSION   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
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
            alert(e.message);
        }
    };

    $scope.shareToWechat = function () {
        try {
            Wechat.share({
                message: {
                    title: '汇票分享',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    //thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    thumb: canvas.toDataURL("image/png"),
                    media: {
                        type: Wechat.Type.IMAGE,
                        image: canvas.toDataURL("image/png")
                    }
                },
                scene: Wechat.Scene.TIMELINE   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
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
            alert(e.message);
        }
    };

    $scope.shareToWeibo = function () {
        try {
            var args = {};
            //args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = '汇票分享',
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = canvas.toDataURL("image/png");
            WeiboSDK.shareToWeibo(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
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
            alert(e.message);
        }
    };

    $scope.shareToQQ = function () {
        //alert(shareImgUrl)
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            //args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = '汇票分享';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = shareImgUrl;
            QQSDK.shareImage(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
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
            alert(e.message);
        }
    };

    $scope.shareToQQZone = function () {
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            //args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = '汇票分享';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = shareImgUrl;
            QQSDK.shareImage(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
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
            alert(e.message);
        }
    };
});

ionicApp.controller('onZhiDetailController', function ($scope, $rootScope, $state, $filter, WEB_URL, $ionicPopup, $compile) {
    

    
})
ionicApp.controller('templateOneController', function ($scope, $rootScope, $state, $stateParams, $ionicPopup, $compile) {
    $scope.anTemplate = [
        {
            'url': 'images/activity2.png'
        },
        {
            'url': 'images/activity2.png'
        }
    ]
    $scope.updateSlide = function () {
        $ionicSlideBoxDelegate.$getByHandle('slideboximgs').update();
        $ionicSlideBoxDelegate.$getByHandle("slideboximgs");
    }
})
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
ionicApp.controller('templateTwoController', function ($scope, $rootScope, $state, $filter, WEB_URL, $compile) {
    
    $scope.goTo = function () {
        window.history.back();
    }
    $scope.hpxReward = '<img src="images/activity8.png" alt="" /><img ng-click="goTo()" src="images/activity7.png" alt="" />';
    $scope.phxIntrod = '<img src="images/activity6.png" alt="" /><img ng-click="goTo()" src="images/activity7.png" alt="" />';

    $scope.style = 'line-height:0;'
    $scope.style1 = 'height:100%;background-color:#fedd52;'

    angular.element(".act_bind1").append($compile($scope.hpxReward)($scope));
    angular.element(".act_bind2").append($compile($scope.phxIntrod)($scope));
    
})
//ionicApp.controller('testController', function ($scope, $rootScope, $state, FILE_URL) {
//    var curRotate = 0;

//    var canvasWidth = $(window).get(0).innerWidth;			//定义canvas宽高
//    var canvasHeight = $(window).get(0).innerHeight - 200;

//    var isMouseDown = false;			//检测按下鼠标动作
//    var lastLoc = { x: 0, y: 0 };		//上一次的坐标

//    var canvas = document.getElementById("canvas");		//获取canvas对象
//    var context = canvas.getContext("2d");			//取得图形上下文
//    var mosicIndex = 0;                 //当前灰度索引
//    var mosicLevel = 30;                //灰度的层级
//    var oldStartX = oldStartY = -1;

//    canvas.width = canvasWidth;			//定义canvas宽高
//    canvas.height = canvasHeight;

//    $scope.size = 10;


//    var pencil = $scope.pencil = {
//        thickness: 30,
//        color: 'rgba(0,0,0,0)'
//    };


//    //function initProgress() {
//    //    $scope.progressInfo = "保存中...";

//    //    $scope.progressStyle = {
//    //        "width": "2%"
//    //    };
//    //}

//    var image = new Image();
//    image.crossOrigin = '*';

//    $scope.takePhoto = function () {
//        $scope.$takePhoto(function (data) {
//            $scope.photoSrc = data;
//        });
//    }

//    function initImage() {
//        $scope.imgUrl = "http://hpx-file.oss-cn-hangzhou.aliyuncs.com/hpxpic/ct7hdsTEZ6HgKfLAQTjXXTleVhdcRth3pEWi1kiYXsQ17zu.jpg";
//        image.src = $scope.imgUrl + "?" + new Date().getTime();

//        image.onload = function () {
//            context.drawImage(image, 0, 0, canvasWidth, canvasHeight);		//绘制图像
//        }
//    }

//    initImage();


//    ////当鼠标在外部并且松开的时候
//    //$("body").addEventListener('touchend', function (e) {
//    //    isMouseDown = false;
//    //}, false);

//    // 手指按下
//    canvas.addEventListener('touchstart', function (e) {
//        e.preventDefault();
//        isMouseDown = true;

//        lastLoc = windowToCanvas(e.touches[0].pageX, e.touches[0].pageY);
//    }, false);

//    // 手指离开
//    canvas.addEventListener('touchend', function (e) {
//        e.preventDefault();
//        isMouseDown = false;
//    }, false);

//    // 手指移动
//    canvas.addEventListener('touchmove', function (e) {
//        e.preventDefault();
//        if (isMouseDown) {
//            var size = $scope.size;
//            var curLoc = windowToCanvas(e.touches[0].pageX, e.touches[0].pageY);
//            //var pixelData = context.getImageData(curLoc.x, curLoc.y, Math.abs(lastLoc.x-curLoc.x),Math.abs(lastLoc.y-curLoc.y));    // 获得区域数据
//            var r = g = b = 0;
//            var s = "";
//            var startX = startY = 0;

//            startX = parseInt(curLoc.x / size) * size;
//            startY = parseInt(curLoc.y / size) * size;
//            if (oldStartX != startX || oldStartY != startY) {
//                r = g = b = mosicIndex * mosicLevel + 80;
//                mosicIndex = (mosicIndex + 1) % 6;
//                s = 'rgb(' + r + ',' + g + ',' + b + ')';
//                context.fillStyle = s;
//                context.fillRect(startX, startY, size, size);
//                oldStartX = startX;
//                oldStartY = startY;
//            }

//            lastLoc = curLoc;
//        }
//    }, false);

//    //鼠标移动事件
//    canvas.onmousemove = function (e) {

//    };

//    function windowToCanvas(x, y) {				//计算canvas上面的坐标
//        var point = canvas.getBoundingClientRect();			//元素边框距离页面的距离
//        x = Math.round(x - point.left);
//        y = Math.round(y - point.top);
//        return { x: x, y: y };
//    }

//    //$scope.saveImage = function () {
//    //    $scope.save(0);
//    //};
//    //$scope.replaceImage = function () {
//    //    $scope.save(1);
//    //};
//    $scope.save = function () {
//        // 获取Base64编码后的图像数据，格式是字符串
//        // 后面的部分可以通过Base64解码器解码之后直接写入文件。
//        var data_url = canvas.toDataURL("image/png");
//        //var blob = dataURLtoBlob(data_url);
//        var fileName = getEndorsementFileName($scope.imgUrl);
//        //var fd = new FormData();
//        //fd.append("file", blob, fileName);
//        //var xhr = new XMLHttpRequest();
//        //xhr.addEventListener('load', onLoadHandler, false);
//        ////xhr.upload.addEventListener('progress', $scope.onProgressHandler, false);
//        //xhr.open('POST', FILE_URL + '/fileWithName', true);
//        //xhr.send(fd);


//        var uri = FILE_URL + '/fileWithName';
//        var options = new FileUploadOptions();

//        options.fileKey = "file";
//        options.fileName = getEndorsementFileName($scope.imgUrl);
//        options.mimeType = "image/jpeg";
//        //options.headers = { 'Authorization': 'Bearer ' + $rootScope.identity.token };
//        //options.params = { 'FileTypeCode': 1002 };

//        var ft = new FileTransfer();
//        ft.upload(data_url, uri, function (result) {
//            alert("上传成功！");
//        }, function (err) {
//            alert(err.exception);
//        }, options);
//    };

//    var onLoadHandler = function (event) {
//        if (this.status == 200 || this.status == 304) {
//            //var result = JSON.parse(this.responseText);
//            //alert("保存成功");
//        }
//    };

//    //$scope.onProgressHandler = function (event) {
//    //    if (event.lengthComputable) {
//    //        var percentComplete = parseInt(event.loaded / event.total * 100) + "%";
//    //        $scope.progressStyle.width = percentComplete;
//    //        if (event.loaded == event.total) {
//    //            console.log("保存成功");
//    //            $scope.progressInfo = "保存成功";
//    //            //保存成功后续处理
//    //            afterSave();
//    //        }
//    //        $scope.$apply();
//    //    }
//    //};

//    //function afterSave() {
//    //    $("#progressModal").modal('hide');
//    //    var data = {
//    //        bill: $stateParams.data.model
//    //    };
//    //    $state.go('app.constants.checkBill', { data: data });
//    //}

//    //$scope.resetCanvas = function () {
//    //    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
//    //}

//    function dataURLtoBlob(dataurl) {
//        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//        while (n--) {
//            u8arr[n] = bstr.charCodeAt(n);
//        }
//        return new Blob([u8arr], { type: mime });
//    }

//    ////获取文件名称
//    function getEndorsementFileName(imgUrl) {
//        var url = imgUrl.split("/");
//        var preNames = url[url.length - 1].split(".");
//        return preNames[0] + "-1." + preNames[1];
//    }

//    ////顺时针旋转
//    //$scope.clockwise = function () {
//    //    console.log(curRotate);
//    //    curRotate = curRotate + 1;
//    //    refreshImg();
//    //};

//    ////逆时针旋转
//    //$scope.eastern = function () {
//    //    console.log(curRotate);
//    //    curRotate = curRotate - 1;
//    //    refreshImg();
//    //};

//    //function refreshImg() {
//    //    context.save();
//    //    var rotation = curRotate * Math.PI / 2;
//    //    context.clearRect(0, 0, canvasWidth, canvasHeight)
//    //    context.translate(canvasWidth / 2, canvasHeight / 2);
//    //    context.rotate(rotation);
//    //    context.translate(-canvasWidth / 2, -canvasHeight / 2);
//    //    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
//    //    context.restore();//恢复状态
//    //}
//})
ionicApp.controller('tourController', function ($scope, $rootScope, $state) {

})
ionicApp.controller('transactionDetailController', function ($scope, $rootScope, $state) {
})
ionicApp.controller('userAgentController', function ($rootScope, $scope, $state, $interval) {

})
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
ionicApp.controller('userInfoController', function ($scope, $rootScope, $state, customerService, addressService, $ionicPopup, payingService) {
    $scope.model = {};
    $scope.filter = {
        isModified: 1,
        tradCity: true,
        tip: false,
        changed: false,
        isSave:false
    };
    $scope.isViewEide = false;
    $scope.hpxColse = function () {
        $state.go('app.user');
    };
    //获取自己的注册资料；调用provinceChange获取市，调用cityChange获取区；设置默认显示的证件图片
    customerService.getCustomer().then(function (data) {
        $scope.model = data;
        if (data.trade_location_city == "市辖区") {
            console.log("市辖区")
            $scope.location_city = 1;
        }
        //alert($scope.model.trade_location_city)
        $scope.provinceChange();
        if ($scope.model.trade_location_province_id != 1 || $scope.model.trade_location_province_id != 20 || $scope.model.trade_location_province_id != 860 || $scope.model.trade_location_province_id != 2462) {
            $scope.cityChange();
        }
        // 查询信息完善程度
        if ($rootScope.identity.customer_id && $scope.model.is_verified != 0) {
            customerService.SingleEnterprise($rootScope.identity.customer_id).then(function (data) {
                $scope.enterpriseModel = data;
                if ($scope.enterpriseModel.enterprise_id != 0 && ($scope.enterpriseModel.enterprise_id != null || $scope.enterpriseModel.is_verified != 0)) {
                    // 根据企业id查询经办人信息
                    payingService.getAgentTreasurer($scope.enterpriseModel.enterprise_id).then(function (agentData) {
                        if (agentData) {
                            $scope.agentModel = agentData;
                            if ($scope.agentModel.isChecked == 1 || $scope.agentModel.isChecked == 0) {
                                $scope.isViewEide = true;
                            }
                        }
                    });
                }
            })
        }
    });
    //获取所有的省级地址
    addressService.queryAll().then(function (data) {
        $scope.ProvinceData = data;
    });
    //获取对应省的市
    $scope.provinceChange = function () {
        if ($scope.model.trade_location_province_id == null) {
            return;
        } else if ($scope.model.trade_location_province_id == 1 || $scope.model.trade_location_province_id == 20 || $scope.model.trade_location_province_id == 860 || $scope.model.trade_location_province_id == 2462) {
            $scope.filter.tradeProvinceId = $scope.model.trade_location_province_id + 1;
            $scope.filter.isModified == 0;
            //document.getElementById("tradCity").style.display = "none";
            $scope.filter.tradCity = false;
            $scope.CityData = null;
            return addressService.queryDstrict($scope.filter.tradeProvinceId).then(function (data) {
                $scope.AddressData = data;
            });
        } else {
            $scope.filter.isModified == 1;
            //document.getElementById("tradCity").style.display = "block";
            $scope.filter.tradCity = true;
            $scope.AddressData = null;
            return addressService.queryCity($scope.model.trade_location_province_id).then(function (data) {
                $scope.CityData = data;
            });
        }
    };
    //获取对应市的区
    $scope.cityChange = function () {
        if ($scope.model.trade_location_city_id == null) {
            return;
        }
        else {
            return addressService.queryDstrict($scope.model.trade_location_city_id).then(function (data) {
                $scope.AddressData = data;
            });
        }
    }
    $scope.modified = function () {
        $scope.model.is_verified = 0;
        $scope.filter.isSave = true;
        var tempList = $scope.model.telephone_number.split('-');
        $scope.model.telephone_code = tempList[0];
        $scope.model.telephone_number_number = tempList[1];
        $scope.filter.isModified = 1;
        $scope.filter.changed = true;
        setTimeout(function () {
            if ($scope.model.trade_location_province_id == 1 || $scope.model.trade_location_province_id == 20 || $scope.model.trade_location_province_id == 860 || $scope.model.trade_location_province_id == 2462) {
                $scope.filter.tradCity = false;
            }
        }, 50);
    };
    //提交客户信息进行审核
    $scope.save = function () {
        if (!$scope.model.customer_name) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入联系人！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if (!/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test($scope.model.id_number) || !$scope.model.id_number) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入正确的身份证号！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        if ($scope.model.telephone_code && $scope.model.telephone_number_number) {
            $scope.model.telephone_number = $scope.model.telephone_code + '-' + $scope.model.telephone_number_number;
        }
        customerService.updateCustomer($scope.model).then(function (data) {
            if ($scope.model.is_verified == 0 && !$scope.filter.isSave) {
                var myPopup = $ionicPopup.show({
                    cssClass: 'hpxWan',
                    template: '<div class="alert-bind-info1">' +
                               '<div class="box">' +
                               '<h3>温馨提示</h3>' +
                               '<p>已完善联系人信息，请进行下一步机构认证</p>' +
                               '<ul>' +
                               '<li class="on"><i>1</i>编辑联系人信息</li>' +
                               '<li><i>2</i>机构认证</li>' +
                               '<li><i>3</i>业务授权</li>' +
                               '<li><i>4</i>账户绑定</li>' +
                               '</ul>' +
                               '<p class="tips">注：进行电票交易须完成四步信息填写，如无需电票交易则填写第一、二步信息即可。</p>' +
                               '</div>' +
                               '</div>',
                    scope: $scope,
                    buttons: [
                          {
                              text: '取消',
                              onTap: function (e) {
                                  $state.go('app.user');
                              }
                          },
                          {
                              text: '进入下一步',
                              type: 'button-positive',
                              onTap: function (e) {
                                  $state.go('app.accredit')
                              }
                          }
                    ]
                })
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: '提示',
                    template: '修改成功！',
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
                alertPopup.then(function (res) {
                    $state.go('app.user');
                })
            }
        });
    };
})