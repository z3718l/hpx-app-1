ionicApp.controller('onLinesController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, $ionicPopup) {

    var bill_style_id;

    $scope.onShangO = function (bill_style_id) {
        billService.getBillOfferBySelf().then(function (data) {
            if (data == null) {
                $rootScope.hpxA = bill_style_id;
                $state.go('app.newBillOffer');
            } else {
                $scope.billData = data.billOffers;
                var itemData = data.billOffers;
                var keepGoing = true;
                angular.forEach(itemData, function (ele, ind) {
                    if (keepGoing) {
                        if (bill_style_id == ele.bill_style_id) {
                            $rootScope.boId = true;
                            $rootScope.billOfferbillOfferId = ele.bill_offer_id;
                            $state.go('app.onDaDetail', { 'id': ele.bill_offer_id })
                            keepGoing = false;
                        }
                        else if (bill_style_id != ele.bill_style_id) {
                            $rootScope.hpxA = bill_style_id;
                            $state.go('app.newBillOffer');
                        }
                    }
                })
            }
        });
    }


    $scope.doRefresh = function () {
        $scope.getBill();
    };
    console.log($scope)
    $scope.getBill = function () {
        billService.getBillOfferBySelf().then(function (data) {
            if (data != null) {
                $scope.billData = data.billOffers;
            }
        });
    }
    $scope.$on('$stateChangeSuccess', $scope.doRefresh);
    
})