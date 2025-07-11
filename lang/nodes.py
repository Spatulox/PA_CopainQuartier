import datetime
import os

front_url = os.getenv("FRONT_URL", "http://localhost:5173")
legal_fields = {
    'publications': ['name', 'created_at', 'description', 'body', 'updated_at', 'author.name', 'author.lastname', 'author', 'link'],
}


class FieldReference:

    def __init__(self, field_name):
        self.field_name = field_name


class Query:

    def __init__(self, collection, if_clause=None, sort=None, limit=None, projection=None):
        self.collection = collection
        self.if_clause = if_clause
        self.sort = sort
        self.limit = limit
        self.projection = projection

    def mongo_query(self):
        if self.collection not in ['publications']:
            raise Exception(f"Collection '{self.collection}' is not supported")
        query = [
            {
                '$lookup': {
                    'from': "users",
                    'as': "author",
                    'localField': "author_id",
                    'foreignField': "_id",
                }
            },
            {
                '$unwind':
                {
                    'path': "$author",
                }
            },
            {
                '$project': {
                '_id': 0,
                'author.name': 1,
                'author.lastname': 1,
                'name': 1,
                'created_at': 1,
                'description': 1,
                'body': 1,
                'updated_at': 1,
                    'link': {
                        '$concat': [
                            front_url,
                            '/publications/',
                        {
                            '$toString': '$_id'
                        }

                        ]
                    }
                }
            }
        ]        
        if self.if_clause:
            query.append(self.if_clause.to_aggregation_stage(self.collection))
        if self.sort:
            query.append(self.sort.to_aggregation_stage(self.collection))
        if self.limit:
            query.append(self.limit.to_aggregation_stage(self.collection))
        else:
            query.append({'$limit': 100})
        if self.projection:
            query.append(self.projection.to_aggregation_stage(self.collection))

        return query, self.collection


class Condition:

    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right

    def to_mongo_query(self, collection_name):
        match self.operator:
            case '=':
                return {'$eq': [expression_to_mongo(self.left, collection_name), expression_to_mongo(self.right, collection_name)]}
            case '!=':
                return {'$ne': [expression_to_mongo(self.left, collection_name), expression_to_mongo(self.right, collection_name)]}
            case '<':
                return {'$lt': [expression_to_mongo(self.left, collection_name), expression_to_mongo(self.right, collection_name)]}
            case '<=':
                return {'$lte': [expression_to_mongo(self.left, collection_name), expression_to_mongo(self.right, collection_name)]}
            case '>':
                return {'$gt': [expression_to_mongo(self.left, collection_name), expression_to_mongo(self.right, collection_name)]}
            case '>=':
                return {'$gte': [expression_to_mongo(self.left, collection_name), expression_to_mongo(self.right, collection_name)]}
            case 'MATCHES':
                return {
                    '$regexMatch': {
                        'input': expression_to_mongo(self.left, collection_name),
                        'regex': expression_to_mongo(self.right, collection_name),
                        'options': 'i'
                    }
                }
            case 'AND':
                return {'$and': [self.left.to_mongo_query(collection_name), self.right.to_mongo_query(collection_name)]}
            case 'OR':
                return {'$or': [self.left.to_mongo_query(collection_name), self.right.to_mongo_query(collection_name)]}
            case 'NOT':
                return {'$not': self.right.to_mongo_query(collection_name)}
            case _:
                raise ValueError(f"Unsupported operator: {self.operator}")

            
def expression_to_mongo(expression, collection_name):
    if isinstance(expression, FieldReference):
        if expression.field_name not in legal_fields.get(collection_name, []):
            raise ValueError(f"Field '{expression.field_name}' is not allowed in collection '{collection_name}'")
        return f"${expression.field_name}"
    elif isinstance(expression, datetime.datetime) or isinstance(expression, str) or isinstance(expression, int) or isinstance(expression, float):
        return expression
    elif isinstance(expression, ExpressionBinaryOp):
        return expression.to_mongo_query(collection_name)
    elif isinstance(expression, FunctionCall):
        return expression.to_mongo_query(collection_name)
    else:
        raise ValueError(f"Unsupported expression type: {type(expression)}")


class IfClause:

    def __init__(self, condition):
        self.condition = condition

    def to_aggregation_stage(self, collection_name):
        return {
            '$match': {
                '$expr': self.condition.to_mongo_query(collection_name)
            }
        }


class Sort:

    def __init__(self, field, descending=False):
        self.field = field
        self.descending = descending

    def to_aggregation_stage(self, collection_name):
        if not isinstance(self.field, FieldReference):
            raise ValueError(f"Sort field must be a FieldReference, got {type(self.field)}")
        if self.field.field_name not in legal_fields.get(collection_name, []):
            raise ValueError(f"Field '{self.field.field_name}' is not allowed in collection '{collection_name}'")
        sort_order = -1 if self.descending else 1
        return {
            '$sort': {
                self.field.field_name: sort_order
            }
        }


class LimitClause:

    def __init__(self, limit):
        self.limit = limit
    
    def to_aggregation_stage(self, collection_name):
        if not isinstance(self.limit, int) or self.limit < 0:
            raise ValueError(f"Limit must be a non-negative integer, got {self.limit}")
        return {
            '$limit': self.limit
        }


class Projection:

    def __init__(self, fields):
        self.fields = fields

    def check_validity(self ):
        field_names = [field.field_name for field in self.fields if isinstance(field, ProjectionField)]
        for field_name in field_names:
            conflicting_name = next((f for f in field_names if f.startswith(f"{field_name}.")), None)
            if conflicting_name:
                raise ValueError(f"Field '{field_name}' conflicts with another field in the projection: {conflicting_name}")
            

    def to_aggregation_stage(self, collection_name):
        self.check_validity()
        projection_dict = {}
        for field in self.fields:
            if isinstance(field, ProjectionField):
                if field.expression:
                    projection_dict[field.field_name] = expression_to_mongo(field.expression, collection_name)
                else:
                    if field.field_name not in legal_fields.get(collection_name, []):
                        raise ValueError(f"Field '{field.field_name}' is not allowed in collection '{collection_name}'")
                    projection_dict[field.field_name] = 1
            else:
                raise ValueError(f"Unsupported field type in projection: {type(field)}")
        return {
            '$project': projection_dict
        }


class ProjectionField:

    def __init__(self, field_name, expression=None):
        self.field_name = field_name
        self.expression = expression


class  ExpressionBinaryOp:

    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right

    def to_mongo_query(self, collection_name):
        operator_map = {
            # $add only adds numbers, so we need to use $concat for strings
            '+': {
                '$cond': [
                    { '$and': [
                        { '$isNumber': [expression_to_mongo(self.left, collection_name)] },
                        { '$isNumber': [expression_to_mongo(self.right, collection_name)] }
                    ] },
                    { '$add': [
                        expression_to_mongo(self.left, collection_name),
                        expression_to_mongo(self.right, collection_name)
                    ] },
                    { '$concat': [
                        { '$toString': expression_to_mongo(self.left, collection_name) },
                        { '$toString': expression_to_mongo(self.right, collection_name) }
                    ] }
                ]
            },
            '-': '$subtract',
            '*': '$multiply',
            '/': '$divide',
            '%': '$mod'
        }
        if self.operator not in operator_map:
            raise ValueError(f"Unsupported operator: {self.operator}")
        if self.operator == '+':
            return operator_map['+']
        return {
            operator_map[self.operator]: [
                expression_to_mongo(self.left, collection_name),
                expression_to_mongo(self.right, collection_name)
            ]
        }

        
class FunctionCall:

    def __init__(self, function_name, arguments):
        self.function_name = function_name
        self.arguments = arguments

    def to_mongo_query(self, collection_name):
        function_map = {
            'len': {
                '$strLenCP': {
                    '$toString': expression_to_mongo(self.arguments[0], collection_name)
                }
            },
            'min': {
                '$min': [expression_to_mongo(arg, collection_name) for arg in self.arguments]
            },
            'max': {
                '$max': [expression_to_mongo(arg, collection_name) for arg in self.arguments]
            },
            'random_int': {
                '$floor': {
                    '$multiply': [
                        {'$rand': {}},
                        expression_to_mongo(self.arguments[0], collection_name)
                    ]
                }
            },
        }

        if self.function_name not in function_map:
            raise ValueError(f"Unsupported function: {self.function_name}")
        return function_map[self.function_name]
