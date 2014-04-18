'use strict';

var imhDirectives = angular.module('imhDirectives', []);

imhDirectives.directive('map', function () {
    var mapOptions = {
        center: new google.maps.LatLng(55.792403, 49.131203),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }, map;


    var link = function (scope, element, attrs) {
        map = new google.maps.Map(element.contents()[0], mapOptions);
    };
    
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/static/partials/map.html',
        link: link
    };
});


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
