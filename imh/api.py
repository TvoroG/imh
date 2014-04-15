import colander as c
from flask import request, abort
from flask.ext.restful import reqparse, abort, Api, Resource
from schemas import LoginSchema, TokenSchema
from utils import token_required
from forms import RegistrationForm, LoginForm
from models import User

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


class TokenResource(SchemaResource):
    schema = LoginSchema
    def post(self):
        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(username=form.username.data).first()
            if user is None or not user.check_password(form.password.data):
                abort(403)
            return {'token': user.generate_auth_token()}
        abort(403)


class SomeResource(SchemaResource):
    method_decorators = [token_required]
    schema = TokenSchema
    def post(self):
        return {'hello': 'world'}


api.add_resource(TokenResource, '/token/')
api.add_resource(SomeResource, '/some/')
