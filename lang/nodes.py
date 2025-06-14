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

    def mongo_exec(self, database):
        if self.collection not in ['publications']:
            raise Exception(f"Collection '{self.collection}' is not supported")
        collection = database[self.collection]
        query = []
        if self.where:
            query.append(self.where.to_aggregation_stage())
        if self.order_by:
            query.append(self.order_by.to_aggregation_stage())
        if self.limit:
            query.append(self.limit.to_aggregation_stage())
        if self.projection:
            query.append(self.projection.to_aggregation_stage())
        return collection.aggregate(query)

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


class IfClause:

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
