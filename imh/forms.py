from flask.ext.wtf import Form
from wtforms import StringField, PasswordField, validators
from wtforms.fields.html5 import EmailField


class RegistrationForm(Form):
    username = StringField(validators=[validators.Length(min=1, max=20)])
    email = EmailField(validators=[validators.Length(min=6, max=50)])
    password = PasswordField(
        validators=[validators.Required(), validators.EqualTo('confirm')])
    confirm = PasswordField()
    

class LoginForm(Form):
    username = StringField(validators=[validators.Length(min=1, max=20)])
    password = PasswordField(validators=[validators.Required()])
