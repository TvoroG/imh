import colander as c
from sqlalchemy import union_all
from flask import request, abort
from flask.ext.restful import reqparse, abort, Api, Resource
from schemas import LoginSchema, TokenSchema, RegisterSchema
from utils import token_required
from models import db, User, Entity

api = Api(prefix='/api')


class SchemaResource(Resource):
    def dispatch_request(self, *args, **kwargs):
        schema = self.schema()
        try:
            data = request.form
            if request.json is not None:
                data = request.json
            self.data = schema.deserialize(data)
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

class LastEntityResource(Resource):
    def get(self):
        last_vk = (Entity.query
                   .filter_by(alien_site='vk')
                   .order_by(Entity.id.desc())
                   .limit(15)
                   .subquery())
        last_instagram = (Entity.query
                          .filter_by(alien_site='instagram')
                          .order_by(Entity.id.desc())
                          .limit(15)
                          .subquery())
        last = (db.session.query(Entity)
                .select_entity_from(union_all(last_vk.select(),
                                              last_instagram.select())))
        return {'entities': [l.serialize for l in last.all()]}

api.add_resource(LoginResource, '/login/')
api.add_resource(UserResource, '/user/')
api.add_resource(LastEntityResource, '/entity/last/')
