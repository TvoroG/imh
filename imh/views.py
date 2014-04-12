from flask import (render_template, make_response, url_for,
                   redirect, flash, g, request)
from flask.ext.login import (login_user, logout_user, login_required,
                             current_user)
from imh import app, login_manager
from models import db, User
from forms import RegistrationForm, LoginForm

@app.route('/')
def index():
    return make_response(open('imh/templates/index.html').read())


@app.route('/some/')
@login_required
def some():
    return 'hello world, {}'.format(g.user.username)


@app.route('/login/', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            return redirect(url_for('login'))
        login_user(user)
        return redirect(request.args.get('next') or url_for('index'))
    return render_template('login.html', form=form)


@app.route('/logout/')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/register/', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(form.username.data,
                    form.password.data,
                    form.email.data)
        db.session.add(user)
        db.session.commit()
        flash('User successfully registered')
        return redirect(url_for('login'))
    print form
    return render_template('register.html', form=form)


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.before_request
def add_user_to_global():
    g.user = current_user
