ionicApp.controller('messageDetailController', function ($scope, $rootScope, $ionicPopup, $state, $filter, $stateParams, notisService) {
    $scope.filter = {};
    $scope.model = {};
    $scope.notificationId = $stateParams.notificationId;
    notisService.seeNotification($scope.notificationId).then(function (data) {
        $scope.model = data;
    });


    $scope.deleteNotification = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: '注意',
            template: '确定要删除该通知吗?',
            cancelText: '否',
            okText: '是',
            cssClass: 'hpxModals'
        });
        confirmPopup.then(function (res) {
            if (res) {
                notisService.deleteNotification($scope.notificationId).then(function () {
                    $state.go('app.message');
                })
            }
        });
    }
})