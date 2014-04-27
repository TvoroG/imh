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
                deferred.resolve();
                console.log(data);
            }).error(function (data) {
                deferred.reject();
                console.log(data);
            });
            return deferred.promise;
        };

        return auth;
    }]);

imhServices.factory('mapF', [
    '$window',
    function ($window) {
        var mf = {};

        mf.createMap = function (el, options) {
            return new $window.google.maps.Map(el, options);
        };
        
        mf.createPosition = function (lat, lng) {
            return new $window.google.maps.LatLng(lat, lng);
        };

        mf.createMarker = function (options) {
            return new $window.google.maps.Marker(options);
        };

        mf.createWindow = function (options) {
            return new $window.google.maps.InfoWindow(options);
        };

        mf.addListener = function () {
            $window.google.maps.event.addListener.apply(null, arguments);
        };
        return mf;
    }]);


imhServices.factory('entityF', [
    '$rootScope', '$http', '$q', 'mapF', 'Vk',
    function ($rootScope, $http, $q, mapF, Vk) {
        var ef = {},
            es = [];
        
        ef.create = function (model) {
            var entity = {};
            entity.model = model;
            entity.position = mapF.createPosition(model.lat, model.lng);
            entity.marker = mapF.createMarker({
                position: entity.position,
                title: model.id.toString()
            });

            entity.window = mapF.createWindow({
                content: '<a target="_blank" href="' + model.url +'"><img src="' + model.image[0].small + '"></a>'
            });

            mapF.addListener(entity.marker, 'click', function () {
                entity.window.open(entity.marker.map, entity.marker);
            });

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

                    console.log(es);
                    deferred.resolve({'new': newE, 'old': oldE});
                })
                .error(function (data) {
                    console.log(data);
                    deferred.reject();
                });

            return deferred.promise;
        };

        ef.modeVkFriends = function () {
            Vk.friends.get()
                .then(Vk.friends.photos)
                .then(function (photos) {
                    console.log(photos);
                }, function (data) {
                    console.log('Noooo!');
                });
        };

        var getNew = function (models) {
            var i, j, e,
                found = false,
                res = [];
            
            for (i = 0; i < models.length; i++) {
                found = false;
                for (j = 0; j < es.length && !found; j++)
                    found = isModelsEqual(models[i], es[j].model);

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
                for (j = 0; j < models.length && !found; j++)
                    found = isModelsEqual(es[i].model, models[j]);

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


imhServices.factory('Vk', [
    '$window', '$q', '$http', '$timeout',
    function ($window, $q, $http, $timeout) {
        var Vk = {
            openapi: $window.VK,
            session: null,
            user: {
                friends: {
                    count: null,
                    photos: null
                }
            },
            accessPermission: 4
        }
        , sessionDeferred = $q.defer();
        
        Vk.openapi.init({
            apiId: 4313646
        });

        Vk.login = function () {
            Vk.openapi.Auth.login(authLogin, Vk.accessPermission);
        };

        Vk.authorize = function () {
            if (!Vk.session) {
                Vk.openapi.Auth.getLoginStatus(authLogin);
            } else {
                sessionDeferred.resolve(Vk.session);
            }
            return sessionDeferred.promise;
        };

        Vk.isAuthorized = function () {
            return !!Vk.session;
        };

        Vk.friends = {};
        Vk.friends.get = function () {
            var deferred = $q.defer();
            
            if (!Vk.isAuthorized()) {
                deferred.reject();
                return deferred.promise;
            } else if (Vk.user.friends.count) {
                deferred.resolve();
                return deferred.promise;
            }

            Vk.openapi.Api.call('friends.get', {
                user_id: Vk.session.mid
            }, function (data) {
                if (data.response) {
                    console.log(data);
                    Vk.user.friends.count = data.response.length;
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });

            return deferred.promise;
        };

        var execFunc = 'https://api.vk.com/method/execute.friendsPhotos';

        Vk.friends.photos = function () {
            var deferred = $q.defer();
            
            if (!Vk.user.friends.count || !Vk.isAuthorized()) {
                deferred.reject('user friends need');
                return deferred.promise;
            }
            
            Vk.user.friends.photos = [];
            Vk.friends._photos(0, deferred);
            return deferred.promise;
        };

        Vk.friends._photos = function (offset, deferred) {
            if (!Vk.user.friends.count || !Vk.isAuthorized()) {
                deferred.reject('user friends need');
            }

            Vk.openapi.Api.call('execute.friendsPhotos', {
                user_id: Vk.session.mid,
                offset: offset
            }, function (data) {
                if (data.response) {
                    var ofs = data.response.offset,
                        photos = data.response.photos;

                    if (ofs < Vk.user.friends.count) {
                        Vk.friends._photos(ofs, deferred);
                    } else {
                        deferred.resolve(Vk.user.friends.photos);
                    }
                    Vk.user.friends.photos = Vk.user.friends.photos.concat(photos);
                } else if (data.error.error_code === 6) {
                    $timeout(function () {
                        Vk.friends._photos(offset, deferred);
                    }, 1000);
                } else {
                    deferred.reject(data);
                }
            });
        };

        var authLogin = function (response) {
            if (response.session) {
                setSession(response);
            } else {
                sessionDeferred.reject();
            }
            console.log(response);
        }
        , setSession = function (response) {
            Vk.session = response.session;
            sessionDeferred.resolve(Vk.session);
        };
        
        return Vk;
    }]);
