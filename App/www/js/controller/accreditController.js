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