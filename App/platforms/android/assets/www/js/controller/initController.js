ionicApp.controller('initController', function ($scope, $rootScope, $state, localStorageService) {
    var tour = localStorageService.get('tour');

    if (tour) {
        $state.go('app.home');
    }
    else {
        localStorageService.set('tour', 'finished');
        $state.go('tour');
    }
})