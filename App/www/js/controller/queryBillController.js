ionicApp.controller('queryBillController', function ($rootScope, $scope, $state, $stateParams, ngTableParams, addressService, billService, constantsService) {
    var emptyEntity = {};
    var newEntity = angular.copy(emptyEntity, newEntity);

    $scope.filter = {
        acceptorTypeID: '',
        billStatusAll: true,
        tradeTypeCode: '',
        billTypeID: '',
        billStatusCode: '801,802,803,804,805,806,807,808,809,810,811,812,813',
        billCharacterCode: '',
        billStyleID:'',
    };

    $scope.tableParams = new ngTableParams({ 'sorting': { 'publishing_time': 'desc' } }, {
        getData: function (params) {

            var acceptorTypeID = [];
            if (!$scope.filter.acceptorTypeAll) {           //获取选中的承兑机构
                for (var i = 0; i < $scope.acceptorTypeData.length; i++) {
                    if ($scope.acceptorTypeData[i].checked) {
                        acceptorTypeID.push($scope.acceptorTypeData[i].code)
                    }
                }
            }
            $scope.filter.acceptorTypeID = acceptorTypeID.join(",");

            
            $scope.filter.locationId = $scope.filter.CityID;

            //查看票据
            return billService.searchBillProduct(params, $scope.filter.billTypeID, $scope.filter.billStyleID, $scope.filter.billStatusCode, $scope.filter.acceptorTypeID, $scope.filter.locationId, $scope.filter.tradeTypeCode, $scope.filter.billCharacterCode, $scope.filter.billFlawID).then(function (data) {
                $scope.first = $scope.getFirst(params);
                //if (data.bill_status_code == 801) {
                //    data.bill_status_name="发布中";
                //}else if(data.bill_status_code >= 802) {
                //    data.bill_status_name="交易中";
                //}
                return data;
            });
        }
    });
    //刷新
    $scope.reflash = function () {
        $scope.tableParams.reload();
    }

  
});
