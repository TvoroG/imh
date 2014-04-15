'use strict';

var imhControllers = angular.module('imhControllers', []);

imhControllers.controller('MapCtrl', [
    '$scope', 'auth',
    function ($scope, auth) {
        $scope.login = function () {
            auth.login($scope.username, $scope.password);
        };

        $scope.some = function () {
            auth.some();
        };
    }]);
