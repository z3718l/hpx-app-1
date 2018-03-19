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
