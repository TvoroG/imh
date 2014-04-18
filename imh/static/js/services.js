'use strict';

var imhServices = angular.module('imhServices', []);

imhServices.factory('auth', [
    '$http', '$q',
    function ($http, $q) {
        var auth = {},
            urlBase = '/api',
            url = function (p) {
                return urlBase + p;
            };

        auth.token = null;

        auth.login = function (username, password) {
            var deferred = $q.defer();
            
            $http.post(url('/login/'), {
                username: username,
                password: password
            }).success(function (data) {
                auth.token = data.token;
                deferred.resolve();
                console.log(data);
            }).error(function (data) {
                deferred.reject();
                console.log(data);
            });
            return deferred.promise;
        };

        auth.register = function (username, email, password) {
            var deferred = $q.defer();

            $http.post(url('/user/'), {
                username: username,
                email: email,
                password: password
            }).success(function (data) {
                auth.token = data.token;
                console.log(data);
            }).error(function (data) {
                console.log(data);
            });
            return deferred.promise;
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
