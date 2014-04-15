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

        auth.token = null;

        auth.login = function (username, password) {
            $http.post(url('/token/'), {
                username: username,
                password: password
            }).success(function (data) {
                auth.token = data.token;
                console.log(data);
            }).error(function (data) {
                console.log(data);
            });
        };

        auth.some = function () {
            if (auth.token === null) {
                console.log('token is missing');
                return;
            }
            $http.post(url('/some/'), {
                token: auth.token
            }).success(function (data) {
                console.log(data);
            }).error(function (data) {
                console.log(data);
            });
        };

        return auth;
    }]);
