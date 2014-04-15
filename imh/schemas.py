import colander as c

class LoginSchema(c.MappingSchema):
    username = c.SchemaNode(c.String(),
                            validator=c.Length(min=1, max=20))
    password = c.SchemaNode(c.String())


class TokenSchema(c.MappingSchema):
    token = c.SchemaNode(c.String())
