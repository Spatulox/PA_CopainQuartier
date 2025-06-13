import ply.lex as lex
import ply.yacc as yacc
import nodes

reserved = {
    'FROM': 'FROM',
    'WHERE': 'WHERE',
    'PROJECT': 'PROJECT',
    'ORDER BY': 'ORDER_BY',
    'ASC': 'ASC',
    'DESC': 'DESC',
    'LIMIT': 'LIMIT',
    'MATCHES': 'MATCHES',
    'AND': 'AND',
    'OR': 'OR',
}

tokens = tuple(
    reserved.values()
) + (
    'NAME',
    'STRING',
    'NUMBER',
    'DATE',
    'LBRACE',
    'RBRACE',
    'LPAREN',
    'RPAREN',
    'COMMA',
    'COLON',
    'PLUS',
    'MINUS',
    'TIMES',
    'DIVIDE',
    'EQUALS',
    'NOTEQUALS',
    'GREATER',
    'LESS',
    'GREATEREQUAL',
    'LESSEQUAL',
    'MOD',
    'NOT',
)

precedence = (
    ('left', 'OR'),
    ('left', 'AND'),
    ('nonassoc', 'GREATER', 'GREATEREQUAL', 'LESS', 'LESSEQUAL', 'EQUAL', 'NOTEQUALS'),
    ('left', 'PLUS', 'MINUS'),
    ('left', 'TIMES', 'DIVIDE', 'MOD'),
    ('right', 'NOT'),
)

t_LBRACE = r'\{'
t_RBRACE = r'\}'
t_LPAREN = r'\('
t_RPAREN = r'\)'
t_COMMA = r','
t_COLON = r':'
t_PLUS = r'\+'
t_MINUS = r'-'
t_TIMES = r'\*'
t_DIVIDE = r'/'
t_MOD = r'%'
t_EQUALS = r'='
t_NOTEQUALS = r'!='
t_GREATER = r'>'
t_LESS = r'<'
t_GREATEREQUAL = r'>='
t_LESSEQUAL = r'<='
t_NOT = r'NOT'


def t_DATE(t):
    r'\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?'
    t.value = nodes.Date(t.value)
    return t


def t_NUMBER(t):
    r'-?\d+(\.\d+)?'
    t.value = float(t.value) if '.' in t.value else int(t.value)
    return t


def t_STRING(t):
    r'"([^"\\]*(\\.[^"\\]*)*)"'
    t.value = t.value[1:-1]  
    return t


def t_NAME(t):
    r'[a-zA-Z_][a-zA-Z0-9_]*'
    t.type = reserved.get(t.value, 'NAME')
    return t


def t_error(t):
    raise Exception("Illegal character '%s'" % t.value[0])


t_ignore = "\t\r\n "

lex.lex()


def p_empty(p):
    '''empty :'''
    pass


def p_query(p):
    '''query : FROM NAME where_clause order_by_clause limit_clause projection_clause'''
    p[0] = nodes.Query(
        collection=p[2],
        where=p[3],
        order_by=p[4],
        limit=p[5],
        projection=p[6]
    )


def p_where_clause(p):
    '''where_clause : WHERE condition
                    | empty'''
    if len(p) == 3:
        p[0] = nodes.WhereClause(conditions=[p[2]])
    else:
        p[0] = None


def p_order_by_clause(p):
    '''order_by_clause : ORDER BY NAME order_direction
                       | empty'''
    if len(p) != 2:
        p[0] = nodes.OrderByClause(field=p[3], direction=p[4])
    else:
        p[0] = None


def p_order_direction(p):
    '''order_direction : ASC
                    | DESC
                    | empty'''
    p[0] = p[1] if len(p) == 2 else None


def p_expression_fieldname(p):
    '''expression : NAME'''
    p[0] = nodes.FieldReference(field_name=p[1])


def p_expression_string(p):
    '''expression : STRING'''
    p[0] = p[1]  # String is already a simple value


def p_expression_other_stuff(p):
    '''expression : NUMBER
                  | DATE
                  | LPAREN expression RPAREN'''
    if len(p) == 2:
        p[0] = p[1]
    elif len(p) == 4:
        p[0] = p[2]


def p_expression_binary_op(p):
    '''expression : expression PLUS expression
                  | expression MINUS expression
                  | expression TIMES expression
                  | expression DIVIDE expression
                  | expression MOD expression'''
    p[0] = nodes.ExpressionBinaryOp(
        left=p[1],
        operator=p[2],
        right=p[3]
    )


def p_condition(p):
    '''condition : expression EQUALS expression
                 | expression NOTEQUALS expression
                 | expression GREATER expression
                 | expression LESS expression
                 | expression GREATEREQUAL expression
                 | expression LESSEQUAL expression
                 | expression MATCHES STRING'''
    p[0] = nodes.Condition(
        left=p[1],
        operator=p[2],
        right=p[3]
    )


def p_condition_paren(p):
    '''condition : LPAREN condition RPAREN'''
    p[0] = p[2]  


def p_condition_not(p):
    '''condition : NOT condition'''
    p[0] = nodes.Condition(
        left=None,
        operator=p[1],
        right=p[2]
    )


def p_condition_binary_op(p):
    '''condition : condition AND condition
                 | condition OR condition'''
    p[0] = nodes.Condition(
        left=p[1],
        operator=p[2],
        right=p[3]
    )


def p_projection_clause(p):
    '''projection_clause : PROJECT projection
                         | empty'''
    if len(p) == 3:
        p[0] = nodes.Projection(fields=p[2])
    else:
        p[0] = None
