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