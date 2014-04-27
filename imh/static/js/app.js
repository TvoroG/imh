'use strict';

var imhApp = angular.module('imhApp', [
    'ngRoute',
    'imhControllers',
    'imhDirectives',
    'imhServices',
    'mgcrea.ngStrap'
]);

imhApp.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/index', {
                templateUrl: '/static/partials/index.html',
                controller: 'IndexCtrl'
            })
            .when('/login', {
                templateUrl: '/static/partials/index.html',
                controller: 'LoginCtrl'
            })
            .when('/register', {
                templateUrl: '/static/partials/index.html',
                controller: 'RegisterCtrl'
            })
            .when('/home', {
                templateUrl: '/static/partials/home.html',
                controller: 'HomeCtrl'
            })
            .when('/home/settings', {
                templateUrl: '/static/partials/home.html',
                controller: 'SettingsCtrl'
            })
            .when('/home/vk/friends', {
                templateUrl: '/static/partials/home.html',
                controller: 'VkFriendsCtrl'
            })
            .otherwise({
                redirectTo: '/index'
            });
    }]);
