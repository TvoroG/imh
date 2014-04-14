'use strict';

var imhDirectives = angular.module('imhDirectives', []);

imhDirectives.directive('map', function () {
    var mapOptions = {
        center: new google.maps.LatLng(55.792403, 49.131203),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }, map;


    var link = function (scope, element, attrs) {
        map = new google.maps.Map(element.contents()[0], mapOptions);
    };
    
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/static/partials/map.html',
        link: link
    };
});
