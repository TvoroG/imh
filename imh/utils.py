from functools import wraps
from flask import g, request, abort

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if request.json is not None:
            token = request.json.get('token')
        if token is None:
            abort(403)
        user = User.verify_auth_token(token)
        if user is None:
            abort(403)
        g.user = user
        return f(*args, **kwargs)
    return decorated
