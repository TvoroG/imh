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
            delay = 5000;

        var link = function (scope, element, attrs) {
            map = mapF.createMap(element.contents()[0], mapOptions);
            updatePromise = $timeout(update, delay);
        };

        var update = function () {
            entityF
                .fetch(map)
                .then(function (es) {
                    updatePromise = $timeout(update, delay);
                    
                    var i;
                    for (i = 0; i < es['new'].length; i++) {
                        es['new'][i].marker.setMap(map);
                    }

                    for (i = 0; i < es['old'].length; i++) {
                        es['old'][i].marker.setMap(null);
                        es['old'][i].marker = null;
                    }

                    console.log(es);
                }, function () {
                    updatePromise = $timeout(update, delay);
                });
        };

        
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/static/partials/map.html',
            link: link
        };
    }]);
