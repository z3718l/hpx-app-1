ionicApp.factory('bankService', ['Restangular', function (Restangular) {
    var res = Restangular.all('banks');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        queryAll: function () {
            return res.get('bankNext', {});
        },

        query: function (params, head_bank_id, bank_address_id, keyword) {
            var queryParam = {
                'headBankId': head_bank_id,
                'bankAddressId': bank_address_id,
                'keyword': keyword,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('bank', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.banks;
            });
        },

        getBank: function (head_bank_id, bank_address_id, keyword) {
            return res.get('bank',{ 'headBankId': head_bank_id, 'bankAddressId': bank_address_id , 'keyword': keyword }).then(function(data){
                return data.banks;
            });
        },

        getSpecificBank:function(bankId){
            return res.all('bank').one(bankId.toString()).get()
        },

        findSpecificBank: function (bankId) {
            return res.get('bank', { "find": bankId });
        },

        add: function (model) {
            return res.all('bankNext').post(model);
        },
        update: function (model) {
            return res.one('bankNext', model.id).customPUT(model);
        },
        remove: function (id) {
            return res.all('bankNext').customDELETE(id);
        },
        banks: function (bankId) {
            console.log(bankId)
            return res.all('bank').one('getCnapsInfo').one(bankId.toString()).get();
        }
    }
}]);