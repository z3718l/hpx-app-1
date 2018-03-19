ionicApp.factory('portalSuggestionService', ['Restangular', function (Restangular) {
    var res = Restangular.all('portals');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        queryAll: function () {
            return res.get('suggestion', {});
        },

        query: function (params, suggestionType_id, handleStatusCode, keyword) {
            //if (suggestionType_id == null) {
            //    suggestionType_id = 1;
            //}
            var queryParam = {
                'suggestionTypeId': suggestionType_id,
                'handleStatusCode': handleStatusCode,
                'keyword': keyword,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy()
            }

            return res.get('suggestion', queryParam).then(function (result) {
                if (result != null) {
                    params.total(result.page_info.items_number);
                    return result.portal_suggestions;
                } else return null;

            });
        },

        add: function (model) {
            return res.all('suggestion').post(model);
        },
        update: function (model, modell) {

            if (modell.is_suggest_person_accept == "1") {
                modell.is_suggest_person_accept = 1;
            } else modell.is_suggest_person_accept = 0;

            return res.one('suggestion', model.id).customPUT(modell);
        },
       
    }
}]);