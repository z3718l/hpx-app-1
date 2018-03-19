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