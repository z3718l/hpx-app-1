ionicApp.factory('appHomeService', ['Restangular', function (Restangular) {
    var res = Restangular.all('app');
    return {
        getAppHome: function () {
            return res.get('show', { 'func': 'home' });
        },
    };

}]);