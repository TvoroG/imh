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

        auth.isLogged = function () {
            if (!auth.token)
                tokenFromSession();
            return !!auth.token;
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

        auth.logout = function () {
            setToken('');
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
    '$rootScope', '$http', '$q', 'mapF', 'Vk', 'Twitter',
    '$templateCache', '$compile',
    function ($rootScope, $http, $q, mapF, Vk, Twitter,
              $templateCache, $compile) {
        var ef = {},
            es = [],
            current = es;
        
        ef.create = function (model) {
            var entity = {};
            entity.model = model;
            entity.position = mapF.createPosition(model.lat, model.lng);
            if (model.alien_site == 'vk') {
                entity.marker = mapF.createMarker({
                    position: entity.position,
                    icon: '/static/img/vk_marker.png'
                });
            } else {
                entity.marker = mapF.createMarker({
                    position: entity.position
                });
            }

            entity.window = mapF.createWindow({
                content: createWindowContent(model.url,
                                             model.img_small,
                                             model.text)
            });

            mapF.addListener(entity.marker, 'click', function () {
                entity.window.open(entity.marker.map, entity.marker);
            });

            return entity;
        };
        
        ef.createFromVkObject = function (obj, getPhotoSrc) {
            var entity = {};
            entity.model = obj;
            entity.position = mapF.createPosition(obj.lat, obj['long']);
            entity.marker = mapF.createMarker({
                position: entity.position,
                icon: '/static/img/vk_marker.png'
            });

            entity.window = mapF.createWindow({
                content: createWindowContent(Vk.photoLink(obj),
                                             getPhotoSrc(obj),
                                             obj.text)
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

        ef.createFromAllVkObjects = function (objs, getPhotoSrc) {
            var i, res = [];
            for (i = 0; i < objs.length; i++) {
                if (hasPosition(objs[i])) {
                    res.push(ef.createFromVkObject(objs[i], getPhotoSrc));
                }
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

                    current = es;
                    console.log('size:', current.length);
                    deferred.resolve({'new': newE, 'old': oldE});
                })
                .error(function (data) {
                    console.log(data);
                    deferred.reject();
                });

            return deferred.promise;
        };

        ef.modeLast = function () {
            var mes = {
                'new': es,
                'old': current
            };
            $rootScope.$broadcast('mode.last', mes);
            current = mes['new'];
        };

        ef.modeVkFriends = function () {
            Vk.friends.get()
                .then(Vk.friends.photos)
                .then(function (photos) {
                    var mes = {
                        'new': ef.createFromAllVkObjects(
                            photos,
                            function (o) {return o.src_small;}
                        ),
                        'old': current
                    };
                    $rootScope.$broadcast('mode.vk.friends', mes);
                    current = mes['new'];
                }, function (data) {
                    console.log('Noooo!');
                });
        };

        ef.modeVkObject = function (name) {
            Vk.photos.all(name)
                .then(function (photos) {
                    var mes = {
                        'new': ef.createFromAllVkObjects(
                            photos,
                            function (o) {return o.src_small;}
                        ),
                        'old': current
                    };
                    $rootScope.$broadcast('mode.vk.object', mes);
                    current = mes['new'];
                    console.log(photos);
                }, function (data) {
                    console.log(data);
                });
        };

        ef.modeTwitterObject = function (name) {
            console.log(name);
            Twitter.user.tweets(name)
                .then(function (tweets) {
                    var mes = {
                        'new': ef.createAll(tweets),
                        'old': current
                    };
                    $rootScope.$broadcast('mode.twitter.object', mes);
                    current = mes['new'];
                    console.log(tweets);
                },function (data) {
                    console.log(data);
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

        var createWindowContent = function (href, img, text) {
            var image = img ? '<img src="' + img + '">' : '',
                maxw = img ? 150 : 300;
            
            text = text ? text : '';
            return '<div style="float: left; max-width:' + maxw + 'px;">'+
                '<a target="_blank" href="' + href + '">' + image +
                '<div>' + text + '</div>' + 
                '</a></div>';
        };

        var hasPosition = function (o) {
            return 'lat' in o && 'long' in o;
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
            accessPermission: 4
        }
        , cache = {
            user: {
                friends: {
                    count: null,
                    photos: null
                }
            },
            photos: {}
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
            } else if (cache.user.friends.count) {
                deferred.resolve();
                return deferred.promise;
            }

            Vk.openapi.Api.call('friends.get', {
                user_id: Vk.session.mid
            }, function (data) {
                if (data.response) {
                    cache.user.friends.count = data.response.length;
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });

            return deferred.promise;
        };

        Vk.friends.photos = function () {
            var deferred = $q.defer();
            
            if (!cache.user.friends.count || !Vk.isAuthorized()) {
                deferred.reject('user friends need');
                return deferred.promise;
            } else if (cache.user.friends.photos) {
                deferred.resolve(cache.user.friends.photos);
                return deferred.promise;
            }
            
            cache.user.friends.photos = [];
            Vk.friends._photos(0, deferred);
            return deferred.promise;
        };

        Vk.friends._photos = function (offset, deferred) {
            if (!cache.user.friends.count || !Vk.isAuthorized()) {
                deferred.reject('user friends need');
            }

            Vk.openapi.Api.call('execute.friendsPhotos', {
                user_id: Vk.session.mid,
                offset: offset
            }, function (data) {
                if (data.response) {
                    var ofs = data.response.offset,
                        photos = data.response.photos;

                    if (ofs < cache.user.friends.count) {
                        Vk.friends._photos(ofs, deferred);
                    } else {
                        deferred.resolve(cache.user.friends.photos);
                    }
                    cache.user.friends.photos = cache.user.friends.photos.concat(photos);
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

        Vk.resolveScreenName = function (screenName) {
            var deferred = $q.defer();

            Vk.openapi.Api.call('utils.resolveScreenName', {
                screen_name: screenName
            }, function (data) {
                if (data.response && 'object_id' in data.response) {
                    deferred.resolve(data.response);
                } else {
                    deferred.reject();
                }
            });

            return deferred.promise;
        };

        Vk.photos = {};
        Vk.photos.all = function (name) {
            var deferred = $q.defer();         
            
            Vk.resolveScreenName(name)
                .then(function (data) {
                    if (data.object_id in cache.photos) {
                        deferred.resolve(cache.photos[data.object_id]);
                    } else if (data.type === 'user') {
                        Vk.users._photos(data.object_id, 0,
                                         [], deferred);
                    } else {
                        deferred.reject('Only users');
                    }
                });
            
            return deferred.promise;
        };

        Vk.users = {};
        Vk.users.photos = function (userId) {
            var deferred = $q.defer();
            Vk.users._photos(userId, 0, [], deferred);
            return deferred.promise;
        };

        Vk.users._photos = function (objectId, offset, photos, deferred) {
            Vk.openapi.Api.call('photos.getAll', {
                owner_id: objectId,
                no_service_albums: 0,
                count: 200,
                offset: offset
            }, function (data) {
                if (data.response && data.response.length > 0) {
                    var total = data.response[0],
                        count = data.response.length - 1;
                    
                    data.response.shift();
                    photos.push.apply(photos, data.response);
                    
                    if (offset + count < total) {
                        Vk.users._photos(objectId, offset + count,
                                         photos, deferred);
                    } else {
                        cache.photos[objectId] = photos;
                        deferred.resolve(photos);
                    }
                } else {
                    deferred.reject(data);
                }
            });
        };

        Vk.logout = function () {
            delete $cookies[Vk.sessionKey];
            Vk.session = null;
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
                try {
                    s = angular.fromJson($cookies[Vk.sessionKey]);
                } catch (e) {
                    return false;
                }
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

imhServices.factory('Twitter', [
    '$http', '$q',
    function ($http, $q) {
        var t = {};

        t.user = {};
        t.user.tweets = function (name) {
            var deferred = $q.defer();
            
            $http.get('/api/twitter/user/tweets/', {
                params: {name: name}
            }).success(function (data) {
                console.log(data);
                deferred.resolve(data['tweets']);
            }).error(function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };
        
        return t;
    }
]);
