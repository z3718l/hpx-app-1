ionicApp.factory('addressService', ['Restangular', function (Restangular) {
    var res = Restangular.all('otherconstants');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        queryAll: function () {
            return res.get('addressNext', {});
        },

        queryCity: function (Provinceid) {
            return res.all('addressNext').one(Provinceid.toString()).get({ 'onlyCity': 0 });
        },
        getCity: function(Provinceid){
            return res.all('addressNext').one(Provinceid.toString()).get();
        },

        queryDstrict: function (Cityid) {
            return res.all('addressNext').one(Cityid.toString()).get();
        },
        geoLocation: function (lat, lng) {
            var queryParam = {
                'lat': lat,
                'lng': lng,
            }
            return res.all('addressDetail').get('getCityIdByGeo', queryParam);
        },

        citySearch: function (addressName) {
            return res.all('addressNext').get('getParent', { 'addressName': addressName })
        }

        //query: function (params, parent_address_id) {
        //    var queryParam = {
        //        'parentAddressId': parent_address_id,
        //        'addressCode': address_code,
        //        'keyword': keyword,
        //        'p': params.page(),
        //        'n': params.count(),
        //        'orderBy': params.orderBy()
        //    }

        //    return res.get('address', queryParam).then(function (result) {
        //        params.total(result.page_info.items_number);
        //        return result.addresses;
        //    });
        //}
    };
}]);