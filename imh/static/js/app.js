'use strict';

var imhApp = angular.module('imhApp', [
    'ngRoute',
    'ngCookies',
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
                controller: 'IndexCtrl',
                loginRequired: false
            })
            .when('/login', {
                templateUrl: '/static/partials/index.html',
                controller: 'LoginCtrl',
                loginRequired: false
            })
            .when('/logout', {
                templateUrl: '/static/partials/index.html',
                controller: 'LogoutCtrl',
                loginRequired: true
            })
            .when('/register', {
                templateUrl: '/static/partials/index.html',
                controller: 'RegisterCtrl',
                loginRequired: false
            })
            .when('/home', {
                templateUrl: '/static/partials/home.html',
                controller: 'HomeCtrl',
                loginRequired: true
            })
            .when('/home/settings', {
                templateUrl: '/static/partials/home.html',
                controller: 'SettingsCtrl',
                loginRequired: true
            })
            .when('/home/vk/friends', {
                templateUrl: '/static/partials/home.html',
                controller: 'VkFriendsCtrl',
                loginRequired: true
            })
            .when('/vk/:name', {
                templateUrl: '/static/partials/index.html',
                controller: 'VkUsersCtrl',
                loginRequired: false
            })
            .when('/twitter/user/:name', {
                templateUrl: '/static/partials/index.html',
                controller: 'TwitterUsersCtrl',
                loginRequired: false
            })
            .when('/twitter/hashtag/:name', {
                templateUrl: '/static/partials/index.html',
                controller: 'TwitterHashtagCtrl',
                loginRequired: false
            })
            .when('/search', {
                templateUrl: '/static/partials/index.html',
                controller: 'SearchCtrl',
                loginRequired: false
            })        
            .otherwise({
                redirectTo: '/index'
            });
    }]);

imhApp.run([
    '$rootScope', '$location', 'auth',
    function ($rootScope, $location, auth) {
        $rootScope.$on(
            '$routeChangeStart',
            function (event, currRoute, prevRoute) {
                if (currRoute.loginRequired && !auth.isLogged())
                    $location.path('/login');
            });
    }]);
