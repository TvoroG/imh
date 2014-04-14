'use strict';

var imhServices = angular.module('imhServices', []);

imhServices.factory('auth', [
    '$http',
    function ($http) {
        var auth = {},
            urlBase = '/api',
            url = function (p) {
                return urlBase + p;
            };

        auth.login = function () {
            $http.post(url('/login/'), {
                username: 'marsel',
                password: 'password'
            }).success(function (data) {
                console.log(data);
            }).error(function (data) {
                console.log(data);
            });
        };

        return auth;
    }]);
