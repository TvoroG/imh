'use strict';

var imhControllers = angular.module('imhControllers', []);

imhControllers.controller('MapCtrl', [
    '$scope', 'auth',
    function ($scope, auth) {
        $scope.login = function () {
            auth.login();
        };
    }]);
