class Date:

    def __init__(self, value):
        self.value = value


class FieldReference:

    def __init__(self, field_name):
        self.field_name = field_name


class Query:

    def __init__(self, collection, where=None, order_by=None, limit=None, projection=None):
        self.collection = collection
        self.where = where
        self.order_by = order_by
        self.limit = limit
        self.projection = projection


class Condition:

    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right


class ExpressionBinaryOp:

    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right


class WhereClause:

    def __init__(self, conditions):
        self.conditions = conditions


class OrderByClause:

    def __init__(self, field, direction='ASC'):
        self.field = field
        self.direction = direction


class LimitClause:

    def __init__(self, limit):
        self.limit = limit


class Projection:

    def __init__(self, fields):
        self.fields = fields


class ProjectionField:

    def __init__(self, field_name, expression=None):
        self.field_name = field_name
        self.expression = expression
