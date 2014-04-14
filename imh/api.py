import colander as c
from flask import request, abort
from flask.ext.restful import reqparse, abort, Api, Resource
from schemas import LoginSchema

api = Api(prefix='/api')


class SchemaResource(Resource):
    def dispatch_request(self, *args, **kwargs):
        schema = self.schema()
        try:
            self.data = schema.deserialize(request.json)
        except c.Invalid as e:
            print e.asdict()
            abort(400)
        return super(Resource, self).dispatch_request(*args, **kwargs)
        

class LoginResource(SchemaResource):
    schema = LoginSchema
    def post(self):
        return self.data


api.add_resource(LoginResource, '/login/')
