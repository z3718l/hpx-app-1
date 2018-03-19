ionicApp.controller('promoteEventController', function ($scope, $rootScope, $state, $filter, billService, toolService, $ionicHistory, appHomeService, getIntivationService, $ionicPopup) {
    console.log($scope)
    $scope.staetEvent = function () {
        $state.go('app.promoteInvitaSuc')
    }
    hpx = function () {
        $(".cpop").hide();
        // 获取手机号
        appHomeService.getAppHome().then(function (data) {
            $scope.customerInfo = data;
            getIntivationService.getInvitationRecord(data.phone_number).then(function (data) {
                console.log("获取")
                console.log(data)
                $scope.getAppPhone = data;
            })
        });
    }
    hpx();
    $scope.guize = function () {

        var myPopup = $ionicPopup.show({
            cssClass: 'hpxYao',
            templateUrl: 'endorsePopup.html',
            template: '<div><img style="width:70px;" src="../../images/close.png" /></div>',
            scope: $scope,
            buttons: [
              { text: '我知道了' },
              //{
              //    text: '是',
              //    type: 'button-positive',
              //    onTap: function (e) {
              //        console.log("保存完成")

              //        //$scope.addvModal.show();
              //    }
              //},
            ]
        });
    }
    $scope.hpxClose = function () {
        $(".cpop").hide();
    }


})