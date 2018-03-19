ionicApp.factory('portalService', ['Restangular', function (Restangular) {
    var res = Restangular.all('portals');
    return {
        lastInformation: function (type) {
            var queryParam = {
                'informationTypeId': type,
                'p': 1,
                'n': 5,
                'orderBy': '-publishing_time'
            }

            return res.get('information', queryParam).then(function (result) {
                return result.portal_information;
            });
        },
        queryInformation: function (type) {
            var queryParam = {
                'informationTypeId': type,
                'p': 1,
                'n': 100,
                'orderBy': '-publishing_time'
            }

            return res.get('information', queryParam).then(function (result) {
                return result.portal_information;
            });
        },
        getInformation: function (id) {
            return res.all('information').one(id.toString()).get();
        },
        getInformationType: function (id) {
            return res.all('informationType').one(id.toString()).get();
        }
    };
}]);