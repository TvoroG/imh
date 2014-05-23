'use strict';

var imhControllers = angular.module('imhControllers', []);


imhControllers.controller('IndexCtrl', [
    '$scope', 'entityF',
    function ($scope, entityF) {
        entityF.modeLast();
    }]);


imhControllers.controller('LoginCtrl', [
    '$scope', '$modal', '$location', '$window', 'auth',
    function ($scope, $modal, $location, $window, auth) {
        $scope.login = {};

        $scope.login.modal = $modal({
            title: 'Login',
            contentTemplate: '/static/partials/login_form.html',
            scope: $scope,
            prefixEvent: 'login',
            show: true
        });

        $scope.$on('$destroy', function () {
            $scope.login.modal.$promise.then($scope.login.modal.hide);
        });

        $scope.$on('login.hide', function () {
            $window.history.back();
        });

        $scope.login.submit = function (usern, pass) {
            var u = usern || $scope.login.username,
                p = pass || $scope.login.password;
            auth
                .login(u, p)
                .then(function () {
                    $location.path('/home');
                });
        };
    }]);

imhControllers.controller('LogoutCtrl', [
    '$location', 'auth', 'Vk',
    function ($location, auth, Vk) {
        auth.logout();
        Vk.logout();
        $location.path('/index');
    }]);

imhControllers.controller('RegisterCtrl', [
    '$scope', '$modal', '$location', '$window', 'auth',
    function ($scope, $modal, $location, $window, auth) {
        $scope.register = {};

        $scope.register.modal = $modal({
            title: 'Register',
            prefixEvent: 'register',
            contentTemplate: '/static/partials/register_form.html',
            scope: $scope,
            show: true
        });

        $scope.$on('$destroy', function () {
            $scope.register.modal.$promise.then($scope.register.modal.hide);
        });

        $scope.$on('register.hide', function () {
            $window.history.back();
        });

        $scope.register.submit = function () {
            auth
                .register($scope.register.username,
                          $scope.register.email,
                          $scope.register.password)
                .then(function () {
                    $location.path('/home');
                });
        };
    }]);

imhControllers.controller('SettingsCtrl', [
    '$scope', '$modal', '$window', 'auth', 'Vk', '$cookies',
    function ($scope, $modal, $window, auth, Vk, $cookies) {
        $scope.vk = Vk;
        $scope.vk.show = true;
        $scope.settings = {};
        
        $scope.settings.modal = $modal({
            title: 'Settings',
            prefixEvent: 'settings',
            contentTemplate: '/static/partials/settings.html',
            scope: $scope
        });

        $scope.$on('settings.hide', function () {
            $window.history.back();
        });

        Vk
            .authorize()
            .then(function (session) {
                $scope.vk.show = false;
            }, function () {
                $scope.vk.show = true;
            });
    }]);

imhControllers.controller('VkFriendsCtrl', [
    '$scope', '$modal', '$location', 'auth', 'Vk', 'entityF',
    function ($scope, $modal, $location, auth, Vk, entityF) {
        if (!Vk.isAuthorized()) {
            //TODO: send to settings
            $scope.modal = $modal({
                title: 'Error',
                prefixEvent: 'vk.auth.error',
                content: 'You should be authorized in vk!',
                scope: $scope
            });

            $scope.$on('vk.auth.error.hide', function () {
                $location.path('/home');
            });
            return;
        }

        entityF.modeVkFriends();
    }]);


imhControllers.controller('VkUsersCtrl', [
    '$scope', '$routeParams', 'entityF',
    function ($scope, $routeParams, entityF) {
        entityF.modeVkObject($routeParams.name);
    }]);


imhControllers.controller('TwitterUsersCtrl', [
    '$scope', '$routeParams', 'entityF',
    function ($scope, $routeParams, entityF) {
        console.log($routeParams.name);
        entityF.modeTwitterObject($routeParams.name);
    }]);


imhControllers.controller('TwitterHashtagCtrl', [
    '$scope', '$routeParams', 'entityF',
    function ($scope, $routeParams, entityF) {
        entityF.modeTwitterHashtag($routeParams.name);
    }]);

imhControllers.controller('InstagramUsersCtrl', [
    '$scope', '$routeParams', 'entityF',
    function ($scope, $routeParams, entityF) {
        entityF.modeInstagramObject($routeParams.name);
    }]);

imhControllers.controller('InstagramHashtagCtrl', [
    '$scope', '$routeParams', 'entityF',
    function ($scope, $routeParams, entityF) {
        entityF.modeInstagramHashtag($routeParams.name);
    }]);

imhControllers.controller('SearchCtrl', [
    '$scope', 'entityF', '$modal', '$location', '$window',
    function ($scope, entityF, $modal, $location, $window) {
        $scope.modal = $modal({
            title: 'Search',
            prefixEvent: 'search',
            contentTemplate: '/static/partials/search.html',
            scope: $scope
        });

        $scope.options = [
            {name: 'vk user', url: '/vk/'},
            {name: 'twitter user', url: '/twitter/user/'},
            {name: 'twitter hashtag', url: '/twitter/hashtag/'},
            {name: 'instagram user', url: '/instagram/user/'},
            {name: 'instagram hashtag', url: '/instagram/hashtag/'}            
        ];

        $scope.current = $scope.options[0];

        $scope.$on('search.hide', function () {
            $window.history.back();
        });

        $scope.$on('$destroy', function () {
            $scope.modal.$promise.then($scope.modal.hide);
        });

        $scope.search = function (name, cur) {
            var url = cur.url + name + '/';
            $location.path(url);
        };
    }]);

imhControllers.controller('HomeCtrl', [
    '$scope', 'entityF',
    function ($scope, entityF) {
        entityF.modeLast();
    }]);
