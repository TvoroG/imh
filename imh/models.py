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
    

class Entity(db.Model):
    __tablename__ = 'entities'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=True)
    images = db.relationship('Image', backref='entity', lazy='dynamic')
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)
    alien_site = db.Column(db.Enum('twitter', 'vk', 'instagram', name='alien_site_types'))
    alien_id = db.Column(db.BigInteger, nullable=True)
    alien_name = db.Column(db.String(100), nullable=True)
    url = db.Column(db.String(4096), nullable=True)

    def __init__(self, alien_site=None, alien_id=None, text=None, lat=None, lng=None):
        self.alien_site = alien_site
        self.alien_id = alien_id
        self.text = text if text else None
        self.lat = lat
        self.lng = lng
        self.url = None
        self.alien_name = None

    @property
    def serialize(self):
        return {
            'id': self.id,
            'text': self.text,
            'lat': self.lat,
            'lng': self.lng,
            'alien_id': self.alien_id,
            'alien_site': self.alien_site,
            'image': [i.serialize for i in self.images]
        }


class Image(db.Model):
    __tablename__ = 'images'

    id = db.Column(db.Integer, primary_key=True)
    url_small = db.Column(db.String(4096), nullable=True)
    url_medium = db.Column(db.String(4096), nullable=True)
    url_big = db.Column(db.String(4096), nullable=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entities.id'), nullable=True)

    def __init__(self, small=None, medium=None, big=None, entity=None):
        self.url_small = small
        self.url_medium = medium
        self.url_big = big
        self.entity = entity

    @property
    def serialize(self):
        return {
            'small': self.url_small,
            'medium': self.url_medium,
            'big': self.url_big
        }
