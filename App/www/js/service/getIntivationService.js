ionicApp.factory('getIntivationService', ['Restangular', function (Restangular) {
    var res = Restangular.all('invitation');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        getInvitationCode: function (phone) {
            return res.one('getInvitationCode' + '?customerPhone=' + phone).get();
        },
        getInvitationRecord: function (phone) {
            return res.one('getInvitationRecord' + '?customerPhone=' + phone).get();
        }

    }
}]);