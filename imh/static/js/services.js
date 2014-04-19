'use strict';

var imhServices = angular.module('imhServices', []);

imhServices.factory('auth', [
    '$http', '$q',
    function ($http, $q) {
        var auth = {},
            urlBase = '/api',
            url = function (p) {
                return urlBase + p;
            };

        auth.token = null;

        auth.login = function (username, password) {
            var deferred = $q.defer();
            
            $http.post(url('/login/'), {
                username: username,
                password: password
            }).success(function (data) {
                auth.token = data.token;
                deferred.resolve();
                console.log(data);
            }).error(function (data) {
                deferred.reject();
                console.log(data);
            });
            return deferred.promise;
        };

        auth.register = function (username, email, password) {
            var deferred = $q.defer();

            $http.post(url('/user/'), {
                username: username,
                email: email,
                password: password
            }).success(function (data) {
                auth.token = data.token;
                console.log(data);
            }).error(function (data) {
                console.log(data);
            });
            return deferred.promise;
        };

        auth.some = function () {
            if (auth.token === null) {
                console.log('token is missing');
                return;
            }
            $http.post(url('/some/'), {
                token: auth.token
            }).success(function (data) {
                console.log(data);
            }).error(function (data) {
                console.log(data);
            });
        };

        return auth;
    }]);

imhServices.factory('mapF', [
    function () {
        var mf = {};

        mf.createMap = function (el, options) {
            return new google.maps.Map(el, options);
        };
        
        mf.createPosition = function (lat, lng) {
            return new google.maps.LatLng(lat, lng);
        };

        mf.createMarker = function (options) {
            return new google.maps.Marker(options);
        };
        return mf;
    }]);


imhServices.factory('entityF', [
    '$http', '$q', 'mapF',
    function ($http, $q, mapF) {
        var ef = {},
            es = [];
        
        ef.create = function (model) {
            var entity = {};
            entity.position = mapF.createPosition(model.lat, model.lng);
            entity.marker = mapF.createMarker({
                position: entity.position,
                title: model.id.toString()
            });
            entity.model = model;
            return entity;
        };

        ef.createAll = function (models) {
            var i, res = [];
            for (i = 0; i < models.length; i++) {
                res.push(ef.create(models[i]));
            }
            return res;
        };

        ef.fetch = function () {
            var deferred = $q.defer();
            
            $http.get('/api/entity/last/')
                .success(function (data) {
                    var entities = data['entities'],
                        newE = getNew(entities),
                        oldE = getOld(entities);

                    console.log('es:');
                    console.log(es);
                    deferred.resolve({'new': newE, 'old': oldE});
                })
                .error(function (data) {
                    console.log(data);
                    deferred.reject();
                });

            return deferred.promise;
        };

        var getNew = function (models) {
            var i, j, e,
                found = false,
                res = [];
            
            for (i = 0; i < models.length; i++) {
                found = false;
                for (j = 0; j < es.length && !found; j++) {
                    found = isModelsEqual(models[i], es[j].model);
                }

                if (!found) {
                    e = ef.create(models[i]);
                    res.push(e);
                    es.push(e);
                }
            }

            return res;
        };

        var getOld = function (models) {
            var i, j,
                found = false,
                res = [];

            for (i = es.length - 1; i >= 0; i--) {
                found = false;
                for (j = 0; j < models.length && !found; j++) {
                    found = isModelsEqual(es[j].model, models[j]);
                }

                if (!found) {
                    res.push(es[i]);
                    es.splice(i, 1);
                }
            }

            return res;
        };

        var isModelsEqual = function (m1, m2) {
            return (m1.alien_site == m2.alien_site &&
                    m1.alien_id == m2.alien_id);
        };
        
        return ef;
    }]);
