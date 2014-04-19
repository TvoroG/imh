'use strict';

var imhDirectives = angular.module('imhDirectives', []);

imhDirectives.directive('map', ['$timeout', '$http', 'mapF', 'entityF', function ($timeout, $http, mapF, entityF) {
    var mapOptions = {
        center: mapF.createPosition(55.792403, 49.131203),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    var map,
        entities = [],
        updatePromise,
        delay = 5000;

    var link = function (scope, element, attrs) {
        map = mapF.createMap(element.contents()[0], mapOptions);
        updatePromise = $timeout(update, delay);
    };

    var update = function () {
        entityF
            .fetch(map)
            .then(function (es) {
                updatePromise = $timeout(update, delay);
                
                var i;
                for (i = 0; i < es['new'].length; i++) {
                    es['new'][i].marker.setMap(map);
                }

                for (i = 0; i < es['old'].length; i++) {
                    es['old'][i].marker.setMap(null);
                    es['old'][i].marker = null;
                }

                console.log(es);
            }, function () {
                updatePromise = $timeout(update, delay);
            });
    };

    
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/static/partials/map.html',
        link: link
    };
}]);


imhDirectives.directive('loginForm', ['auth', function (auth) {
    var link = function (scope, element, attrs) {
        scope.submit = function () {
            if (scope.loginForm.$invalid) {
                console.log('login form error');
                return;
            }

            auth
                .login(scope.username, scope.password)
                .then(function () {
                    console.log('success');
                });
        };
    };
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/static/partials/login_form.html',
        link: link
    };
}]);

imhDirectives.directive('registerForm', ['auth', function (auth) {
    var link = function (scope, element, attrs) {
        scope.submit = function () {
            if (scope.registerForm.$invalid) {
                console.log('register form error');
                return;
            }

            auth
                .register(scope.username, scope.email, scope.password)
                .then(function () {
                    console.log('success');
                });
        };
    };
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/static/partials/register_form.html',
        link: link
    };
}]);
