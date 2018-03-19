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
