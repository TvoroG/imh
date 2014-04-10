'use strict';

var imhControllers = angular.module('imhControllers', []);

imhControllers.controller('MapCtrl', [
    '$scope',
    function ($scope) {
        $scope.data = 'hello world';
    }]);
