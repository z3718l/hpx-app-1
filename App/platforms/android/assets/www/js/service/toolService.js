ionicApp.factory('toolService', ['Restangular', function (Restangular) {
    var res = Restangular.all('tools');
    return {
        interestRate: function () {
            return res.get('interestRate', {});
        },
        priceTrend: function () {
            return res.get('priceTrend', {});
        },
        calculator: function (model, func) {
            var param = {};
            if (func)
                param['func'] = func;
            return res.all("calculator").post(model, param);
        },
        searchCalendar: function (year, month, billTypeId, number) {
            var queryParam = {
                'year': year,
                'month': month,
                'billTypeId': billTypeId,
                'number': number
            }
            return res.get('calendar', queryParam).then(function (data) {
                return data;
            });
        },
        getStars: function (enterpriseId) {
            return res.all('star').one(enterpriseId.toString()).get();
        },
        setStars: function (product) {
            return res.all('star').one(product.publisher_id.toString()).get().then(function (data) {
                product.star = data;
            });
        },
        setStars2: function (product) {
            return res.all('star').one(product.enterprise_id.toString()).get().then(function (data) {
                product.star = data;
            });
        },
        isCalendarSpecial: function (day_str) {
            return res.get('calendar', { 'date': day_str });
        },
        serviceByPublication: function (billNumber) {
            return res.get('serviceByPublication', billNumber);
        },
        getSystemTime: function(){
        return res.get('systemTime', {});
        }
    }
}]);
