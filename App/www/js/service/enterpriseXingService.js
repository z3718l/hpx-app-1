ionicApp.factory('enterpriseXingService', ['Restangular', function (Restangular) {
    var res = Restangular.all('enterpriseXingyeUser');
    return {
        enterpriseXingyeUser: function (enterpriseId) {
            return res.one('getLegalInfo' + '?enterpriseId=' + enterpriseId).get();
        },

        // 判断是否有使用权限 
        //customerPrivilege: function (model) {
        //    console.log(model)
        //    return res.all('customerPrivilege').post(model)
        //},
        //// 查询套餐
        //privilegePackage: function (model) {
        //    return res.all('privilegePackage').post(model)
        //},
        //// 购买套餐
        //privilegePackOrder: function (model) {
        //    return res.all('privilegePackOrder').post(model)
        //},
    }
}]);