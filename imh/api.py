import colander as c
from sqlalchemy import union_all
from flask import request, abort
from flask.ext.restful import reqparse, abort, Api, Resource
from schemas import (LoginSchema, TokenSchema, RegisterSchema)
from utils import token_required
from models import db, User, Entity
from tasks import twitter_user_tweets, twitter_hashtags

api = Api(prefix='/api')


class SchemaResource(Resource):
    def dispatch_request(self, *args, **kwargs):
        schema = self.schema()
        try:
            data = request.args
            if request.form:
                data = request.form
            if request.json is not None:
                data = request.json
            self.data = schema.deserialize(data)
            print self.data
        except c.Invalid as e:
            print e.asdict()
            abort(400)
        return super(Resource, self).dispatch_request(*args, **kwargs)


class LoginResource(SchemaResource):
    schema = LoginSchema
    def post(self):
        print self.data
        user = User.query.filter_by(username=self.data['username']).first()
        if user is None or not user.check_password(self.data['password']):
            abort(403)
        return {'token': user.generate_auth_token()}


class UserResource(SchemaResource):
    schema = RegisterSchema
    def post(self):
        user = User.query.filter_by(username=self.data['username']).first()
        if user is not None:
            return {'message': 'User already exists'}, 400
        user = User(self.data['username'],
                    self.data['password'],
                    self.data['email'])
        db.session.add(user)
        db.session.commit()
        return {'token': user.generate_auth_token()}


class TwitterUserTweetsResource(Resource):
    def get(self):
        name = request.args.get('name')
        if not name:
            return {'message': 'Bad name'}, 400

        ts = twitter_user_tweets(name)
        return {'tweets': [t.serialize for t in ts]}


class TwitterHashtagResource(Resource):
    def get(self):
        hashtag = request.args.get('hashtag')
        if not hashtag:
            return {'message': 'Bad hashtag'}, 400

        ts = twitter_hashtags(hashtag)
        return {'tweets': [t.serialize for t in ts]}
        


class LastEntityResource(Resource):
    def get(self):
        last_vk = (Entity.query
                   .filter_by(alien_site='vk')
                   .order_by(Entity.id.desc())
                   .limit(50)
                   .subquery())
        last_instagram = (Entity.query
                          .filter_by(alien_site='instagram')
                          .order_by(Entity.id.desc())
                          .limit(50)
                          .subquery())
        last_twitter = (Entity.query
                        .filter_by(alien_site='twitter')
                        .order_by(Entity.id.desc())
                        .limit(50)
                        .subquery())
        last = (db.session.query(Entity)
                .select_entity_from(union_all(last_vk.select(),
                                              last_instagram.select(),
                                              last_twitter.select())))
        return {'entities': [l.serialize for l in last.all()]}

api.add_resource(LoginResource, '/login/')
api.add_resource(UserResource, '/user/')
api.add_resource(LastEntityResource, '/entity/last/')
api.add_resource(TwitterUserTweetsResource, '/twitter/user/tweets/')
api.add_resource(TwitterHashtagResource, '/twitter/hashtag/')
