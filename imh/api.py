import colander as c
from flask import request, abort
from flask.ext.restful import reqparse, abort, Api, Resource
from schemas import LoginSchema, TokenSchema, RegisterSchema
from utils import token_required
from models import db, User

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
        print self.data
        user = User.query.filter_by(username=self.data['username']).first()
        if user is not None:
            return {'message': 'User already exists'}, 400
        user = User(self.data['username'],
                    self.data['password'],
                    self.data['email'])
        db.session.add(user)
        db.session.commit()
        return {'token': user.generate_auth_token()}


api.add_resource(LoginResource, '/login/')
api.add_resource(UserResource, '/user/')
