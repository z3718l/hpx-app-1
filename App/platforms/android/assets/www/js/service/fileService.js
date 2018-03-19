ionicApp.factory('fileService', ['Restangular', function (Restangular) {
    var res = Restangular.all('files');
    return {
        getFileById: function (fid) {
            return res.all('file').one(fid.toString()).get();
        }
    }
}]);
