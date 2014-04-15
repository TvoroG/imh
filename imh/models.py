from datetime import datetime
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.bcrypt import generate_password_hash, check_password_hash
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    registered_on = db.Column(db.DateTime)
 
    def __init__(self, username, password, email):
        self.username = username
        self.set_password(password)
        self.email = email
        self.registered_on = datetime.now()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def generate_auth_token(self, expiration=666):
        from imh import app
        s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
        return s.dumps({'id': self.id})

    @staticmethod
    def verify_auth_token(token):
        from imh import app
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None
        except BadSignature:
            return None
        user = User.query.get(data['id'])
        return user
        
    def __repr__(self):
        return '<User %r>' % (self.username)
    
