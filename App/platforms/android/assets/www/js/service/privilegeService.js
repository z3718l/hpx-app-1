ionicApp.factory('privilegeService', ['Restangular', function (Restangular) {
    var res = Restangular.all('privilege');
    return {
        // 判断是否有使用权限 
        customerPrivilege: function (model) {
            console.log(model)
            return res.all('customerPrivilege').post(model)
        },
        // 查询套餐
        privilegePackage: function (model) {
            return res.all('privilegePackage').post(model)
        },
        // 购买套餐
        privilegePackOrder: function (model) {
            return res.all('privilegePackOrder').post(model)
        },
    }
}]);