'use strict';

var imhControllers = angular.module('imhControllers', []);

imhControllers.controller('MapCtrl', [
    '$scope',
    function ($scope) {
        var mapOptions = {
            center: new google.maps.LatLng(55.792403, 49.131203),
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    }]);
