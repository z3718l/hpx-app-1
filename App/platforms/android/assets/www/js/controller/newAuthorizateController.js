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