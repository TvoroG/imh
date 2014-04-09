from flask.ext.admin import Admin, BaseView, expose

class UserView(BaseView):
    @expose('/')
    def index(self):
        return self.render('admin/users.html')


admin = Admin(name='Imh admin')

admin.add_view(UserView(name='Users', endpoint='users'))
