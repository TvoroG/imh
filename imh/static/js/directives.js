'use strict';

var imhDirectives = angular.module('imhDirectives', []);

imhDirectives.directive('map', [
    '$timeout', '$http', '$window', 'mapF', 'entityF',
    function ($timeout, $http, $window, mapF, entityF) {
        var mapOptions = {
            center: mapF.createPosition(55.792403, 49.131203),
            zoom: 12,
            mapTypeId: $window.google.maps.MapTypeId.ROADMAP
        };
        
        var map,
            entities = [],
            updatePromise,
            delay = 30000;

        var link = function (scope, element, attrs) {
            if (element.contents()[0]) {
                map = mapF.createMap(element.contents()[0], mapOptions);
                
                scope.$on('mode.last', function (event, es) {
                    update(es);
                    $timeout.cancel(updatePromise);
                    updatePromise = $timeout(pullLast);
                });               

                scope.$on('mode.vk.friends', function (event, es) {
                    update(es);
                    $timeout.cancel(updatePromise);
                });

                scope.$on('mode.vk.object', function (event, es) {
                    update(es);
                    $timeout.cancel(updatePromise);
                });

                scope.$on('mode.twitter.object', function (event, es) {
                    update(es);
                    $timeout.cancel(updatePromise);
                });

                scope.$on('mode.twitter.hashtag', function (event, es) {
                    update(es);
                    $timeout.cancel(updatePromise);
                });

                scope.$on('mode.instagram.object', function (event, es) {
                    update(es);
                    $timeout.cancel(updatePromise);
                });

                scope.$on('mode.instagram.hashtag', function (event, es) {
                    update(es);
                    $timeout.cancel(updatePromise);
                });
            }            
        };

        var pullLast = function () {
            entityF
                .fetch(map)
                .then(function (es) {
                    updatePromise = $timeout(pullLast, delay);
                    update(es);
                    console.log(es);
                }, function () {
                    updatePromise = $timeout(pullLast, delay);
                });
        }
        , update = function (es) {
            var i;
            for (i = 0; i < es['old'].length; i++) {
                es['old'][i].marker.setMap(null);
            }
            for (i = 0; i < es['new'].length; i++) {
                es['new'][i].marker.setMap(map);
            }
        };

        
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/static/partials/map.html',
            link: link
        };
    }]);
