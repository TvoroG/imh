import colander as c


class TokenSchema(c.MappingSchema):
    token = c.SchemaNode(c.String())


class LoginSchema(c.MappingSchema):
    username = c.SchemaNode(c.String(),
                            validator=c.Length(min=1, max=20))
    password = c.SchemaNode(c.String())


class RegisterSchema(LoginSchema):
    email = c.SchemaNode(c.String(), validator=c.Length(min=3, max=50))


class TwitterUserTweetsSchema(c.MappingSchema):
    name = c.SchemaNode(c.String(), validator=c.Length(min=1))
