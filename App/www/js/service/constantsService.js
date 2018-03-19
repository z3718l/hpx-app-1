ionicApp.factory('constantsService', ['Restangular', function (Restangular) {
    var res = Restangular.all('mainconstants');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        queryAll: function () {
            return res.get('constant', {});
        },
        queryConstantsType: function (constant_type_id) {
            return res.get('constant', { 'constantTypeId': constant_type_id}).then(function (result) {
                return result.constants;
            });
        },
        queryAcceptorTypeforOffer: function (billStyleId) {
            return res.get('constant', { 'constantTypeId': 20, 'billStyleId': billStyleId }).then(function (result) {
                return result.constants;
            });
        },
        query: function (params, constant_type_id, keyword) {
            var queryParam = {
                'constantTypeId': constant_type_id,
                'keyword': keyword,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('constant', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.constants;
            });
        },
    }
}]);