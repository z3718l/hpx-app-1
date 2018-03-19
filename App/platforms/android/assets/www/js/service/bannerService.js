ionicApp.factory('bannerService', ['Restangular', function (Restangular) {
    var res = Restangular.all('banner');
    return {
        // 查询所有banner信息
        banner: function () {
            return res.one('bannerInfo').get();
        },
        bannerGet: function (bannId) {
            console.log(bannId)
            return res.all('bannerInfo').one(bannId.toString()).get();
        }
    }
}]);