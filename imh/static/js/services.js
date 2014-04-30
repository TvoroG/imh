'use strict';

var imhServices = angular.module('imhServices', []);

imhServices.factory('auth', [
    '$http', '$q', '$cookies',
    function ($http, $q, $cookies) {
        var auth = {
            token: null,
            tokenKey: 'imh_auth_token'
        }
        , urlBase = '/api'
        , url = function (p) {
            return urlBase + p;
        }
        
        , setToken = function (t) {
            auth.token = t;
            $cookies[auth.tokenKey] = auth.token;
        }
        
        , tokenFromSession = function () {
            var t;
            
            if (auth.tokenKey in $cookies) {
                t = $cookies[auth.tokenKey];
                if (t)
                    setToken(t);
            }
            return false;
        };

        auth.login = function (username, password) {
            var deferred = $q.defer();

            if (tokenFromSession()) {
                deferred.resolve();
                return deferred.promise;
            }
            
            $http.post(url('/login/'), {
                username: username,
                password: password
            }).success(function (data) {
                setToken(data.token);
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
                setToken(data.token);
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
                content: createWindowContent(model.url,
                                             model.image[0].small)
            });

            mapF.addListener(entity.marker, 'click', function () {
                entity.window.open(entity.marker.map, entity.marker);
            });

            return entity;
        };
        
        ef.createFromVkObject = function (obj) {
            var entity = {};
            entity.model = obj;
            entity.position = mapF.createPosition(obj.lat, obj['long']);
            entity.marker = mapF.createMarker({
                position: entity.position,
                title: obj.pid.toString()
            });

            entity.window = mapF.createWindow({
                content: createWindowContent(Vk.photoLink(obj),
                                             obj.src_small)
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

        ef.createFromAllVkObjects = function (objs) {
            var i, res = [];
            for (i = 0; i < objs.length; i++) {
                res.push(ef.createFromVkObject(objs[i]));
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
                    $rootScope.$broadcast('mode.vk.activate', {
                        'new': ef.createFromAllVkObjects(photos),
                        'old': es
                    });
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

        var createWindowContent = function (href, img) {
            return '<a target="_blank" href="' + href + '">' +
                '<img src="' + img + '"></a>';
        };
        
        return ef;
    }]);


imhServices.factory('Vk', [
    '$window', '$q', '$http', '$timeout', '$cookies',
    function ($window, $q, $http, $timeout, $cookies) {
        var Vk = {
            openapi: $window.VK,
            session: null,
            rootUrl: 'https://vk.com/',
            sessionKey: 'imh_vk_session',
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
            if (!Vk.session && !sessionFromCookies()) {
                Vk.openapi.Auth.getLoginStatus(authLogin);
            } else {
                sessionDeferred.resolve(Vk.session);
            }
            return sessionDeferred.promise;
        };

        Vk.isAuthorized = function () {
            if (!Vk.session)
                sessionFromCookies();
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
                    Vk.user.friends.count = data.response.length;
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });

            return deferred.promise;
        };

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

        Vk.photoLink = function (o) {
            return Vk.rootUrl + 'id' + o.owner_id +
                '?z=photo' + o.owner_id + '_' + o.pid;
        };

        var authLogin = function (response) {
            if (response.session) {
                setSession(response);
            } else {
                console.log(response);
                sessionDeferred.reject();
            }
        }
        , setSession = function (response) {
            Vk.session = response.session;
            $cookies[Vk.sessionKey] = angular.toJson(Vk.session);
            console.log($cookies);
            sessionDeferred.resolve(Vk.session);
        }
        , sessionFromCookies = function () {
            var s, now;
            if (Vk.sessionKey in $cookies) {
                s = angular.fromJson($cookies[Vk.sessionKey]);
                if (s && 'expire' in s && 'mid' in s) {
                    // get unix timestamp
                    now = Math.round(+new Date()/1000);
                    if (now < s['expire']) {
                        Vk.session = s;
                        return true;
                    }
                }
            }
            return false;
        };
        
        return Vk;
    }]);
