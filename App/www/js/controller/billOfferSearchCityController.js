ionicApp.controller('billOfferSearchCityController', function ($scope, $rootScope, $http, $state, $ionicPopup, addressService, $cordovaGeolocation, $ionicScrollDelegate) {
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
                    $rootScope.billOfferSearchModel.geoLoca = true
                    //普通城市
                    if (data.locationIdList) {
                        $rootScope.billOfferSearchModel.province_name = data.locationIdList[0].provinceName;
                        $rootScope.billOfferSearchModel.province_id = data.locationIdList[0].provinceId;
                        $rootScope.billOfferSearchModel.city_id = data.locationIdList[0].cityId;
                        $rootScope.billOfferSearchModel.city_name = data.locationIdList[0].cityName;
                        addressService.queryCity($rootScope.billOfferSearchModel.province_id).then(function (data) {
                            $scope.CityData = data;
                        });
                    }
                    //直辖市
                    else if (data.districtId) {
                        $rootScope.billOfferSearchModel.province_name = data.cityName;
                        $rootScope.billOfferSearchModel.province_id = data.cityId
                        $rootScope.billOfferSearchModel.city_id = data.districtId;
                        $rootScope.billOfferSearchModel.city_name = data.districtName;
                        addressService.queryCity($rootScope.billOfferSearchModel.province_id + 1).then(function (data) {
                            $scope.CityData = data;
                        });
                    }
                    //特别行政区
                    else {
                        $rootScope.billOfferSearchModel.province_name = data.cityName;
                        $rootScope.billOfferSearchModel.province_id = data.cityId;
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
    //$scope.geoLocation();

    //热门城市
    $scope.hotCity = function (location_id, location_name) {
        $rootScope.billOfferSearchModel.geoLoca = false;
        $scope.isGeoLocation = false;
        if (!location_id) {
            $rootScope.billOfferSearchModel.province_id = null;
            $rootScope.billOfferSearchModel.province_name = '';
            $rootScope.billOfferSearchModel.city_id = null;
            $rootScope.billOfferSearchModel.city_name = '全国';
        }
        else {
            if (location_id == 1 || location_id == 20 || location_id == 860 || location_id == 2462) {
                $rootScope.billOfferSearchModel.province_id = location_id;
                $rootScope.billOfferSearchModel.province_name = location_name;
                $rootScope.billOfferSearchModel.city_id = location_id;
                $rootScope.billOfferSearchModel.city_name = location_name;
                $scope.setProvince(location_id, location_name);
            }
            else {
                if (location_id == 1007) {
                    $rootScope.billOfferSearchModel.province_id = 1006;
                    $rootScope.billOfferSearchModel.province_name = '浙江省';
                }
                else if (location_id == 2132 || location_id == 2158) {
                    $rootScope.billOfferSearchModel.province_id = 2131;
                    $rootScope.billOfferSearchModel.province_name = '广东省';
                }
                $scope.setProvince($rootScope.billOfferSearchModel.province_id, $rootScope.billOfferSearchModel.province_name);
                $rootScope.billOfferSearchModel.city_id = location_id;
                $rootScope.billOfferSearchModel.city_name = location_name;
            }
        }
        $scope.submit();
    }
    //获取对应的省区的市级地址
    $scope.setProvince = function (province_id, province_name) {
        $scope.isGeoLocation = false;
        $rootScope.billOfferSearchModel.province_id = province_id;
        $rootScope.billOfferSearchModel.province_name = province_name;
        //$rootScope.billOfferSearchModel.city_id = null;
        //$rootScope.billOfferSearchModel.city_name = '';
        if (province_id == null) {
            return;
        } else if (province_id == 1 || province_id == 20 || province_id == 860 || province_id == 2462) {
            $scope.CityData = [{ id: province_id, parent_address_id: province_id + 1, address_name: province_name }]
            province_id = province_id + 1;
            return addressService.queryCity(province_id).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    //console.log(data[i]);
                    $scope.CityData.push(data[i]);
                }
            });
        } else {
            return addressService.queryCity(province_id).then(function (data) {
                $scope.CityData = data;
            });
        }
    }
    $scope.setCity = function (city_id, city_name) {
        $rootScope.billOfferSearchModel.geoLoca = false;
        $scope.isGeoLocation = false;
        $rootScope.billOfferSearchModel.city_name = city_name;
        if ($rootScope.billOfferSearchModel.province_id == 1 || $rootScope.billOfferSearchModel.province_id == 20 || $rootScope.billOfferSearchModel.province_id == 860 || $rootScope.billOfferSearchModel.province_id == 2462) {
            $rootScope.billOfferSearchModel.city_id = $rootScope.billOfferSearchModel.province_id;
        } else {
            $rootScope.billOfferSearchModel.city_id = city_id;
        }
        $scope.submit();
    }

    if (!$rootScope.billOfferSearchModel || $rootScope.billOfferSearchModel.geoLoca) {
        $rootScope.billOfferSearchModel = {
            province_name: '',
            city_name: '',
        }
        $scope.geoLocation();
        //获取所有省区地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
        });
    }
    else if ($rootScope.billOfferSearchModel.province_id && $rootScope.billOfferSearchModel.province_name) {
        //获取所有省区地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
            $scope.setProvince($rootScope.billOfferSearchModel.province_id, $rootScope.billOfferSearchModel.province_name)
        });
    }
    else {
        //获取所有省区地址
        addressService.queryAll().then(function (data) {
            $scope.ProvinceData = data;
        });
    }
    $scope.submit = function () {
        $state.go('app.billOffer');
    }
    //滑动轮回到顶部
    $scope.scrollCityToTop = function () {
        $ionicScrollDelegate.$getByHandle('city').scrollTop();
    };
})