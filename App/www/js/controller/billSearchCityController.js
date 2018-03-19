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