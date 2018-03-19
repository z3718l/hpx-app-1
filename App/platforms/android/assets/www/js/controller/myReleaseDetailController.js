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