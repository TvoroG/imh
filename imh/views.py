from flask import (render_template, make_response, url_for,
                   redirect, flash, g, request)
from flask.ext.login import login_user, login_required, current_user
from imh import app, login_manager
from models import db, User

@app.route('/')
def index():
    return make_response(open('imh/templates/index.html').read())


@app.route('/some/')
@login_required
def some():
    return 'hello world, {}'.format(g.user.username)


@app.route('/login/', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    username = request.form['username']
    password = request.form['password']
    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        flash('Username or Password is invalid', 'error')
        return redirect(url_for('login'))
    login_user(user)
    flash('Logged in successfully')
    return redirect(request.args.get('next') or url_for('index'))


@app.route('/register/', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    user = User(request.form['username'],
                request.form['password'],
                request.form['email'])
    db.session.add(user)
    db.session.commit()
    flash('User successfully registered')
    return redirect(url_for('login'))


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.before_request
def add_user_to_global():
    g.user = current_user
