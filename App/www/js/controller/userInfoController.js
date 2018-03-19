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