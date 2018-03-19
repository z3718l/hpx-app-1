ionicApp.factory('enterprisesService', ['Restangular', function (Restangular) {
    var res = Restangular.all('enterprises');
    return {
        //评价
        insertAppraisal: function (model) {
            return res.all('enterpriseAppraisal').post(model);
        },
        //getAppraisal1:function(model){
        //    return res.one('enterpriseAppraisal?p=1&n=2&star=&func=mine').post(model);
        //},
        //getAppraisal2: function (model) {
        //    return res.one('enterpriseAppraisal?p=1&n=2&star=&func=tome').post(model);
        //},
        getorderAppraisalA: function (billOfferId) {
            return res.all('billOfferAppraisal').one('getAll').one(billOfferId.toString()).get();
        },
        //追加评价
        updateAppraisal: function (model) {
            return res.all('enterpriseAppraisal').one('enterpriseAppraisalId').post(model);
        },
        //getAppraisal: function (model) {
        //    return res.one('enterpriseAppraisal?p=1&n=2&star=&func=tome').post(model);
        //},
        getorderAppraisal: function(billtypeid, orderid){
           var queryParam = {
               'typeId': billtypeid,
               'toId': orderid,
               'func': 'show',
           }
            
            return res.get('enterpriseAppraisal', queryParam).then(function(data){
                return data;
            })
        },
     
    }
}]);


