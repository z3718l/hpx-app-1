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