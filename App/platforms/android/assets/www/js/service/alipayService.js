ionicApp.factory('alipayService', ['Restangular', function (Restangular) {
    var res = Restangular.all('alipay');
    return {
        alipay: function (rechargePrice, enterpriseId) {
            var param = {
                'rechargePrice': rechargePrice,
                'enterpriseId': enterpriseId
            }
            return res.get('createOrder', param).then(function (result) {
                return result;
            })
            //return res.all('createOrder').post(param);
        },
        synNotification: function (notification) {
            return res.all('synNotification').post(notification);
        }
    }
}]);