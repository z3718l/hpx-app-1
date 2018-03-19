ionicApp.factory('notisService', ['Restangular', function (Restangular) {
    var res = Restangular.all('notis');
    return {
        getNotification: function (params, type, time1, time2, isRead) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
                'type': type,
                'time1': time1,
                'time2': time2,
                'isRead': isRead,
            }
            return res.get('notification', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.notifications;
            });
        },
        seeNotification: function (notificationId) {
            return res.all('notification').one(notificationId.toString()).get();
        },
        deleteNotification: function (notificationId) {
            return res.all('notification').one(notificationId.toString()).customDELETE();
        }
    }
}]);
