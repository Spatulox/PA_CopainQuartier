## Syntax

FROM {collection} (WHERE {condition})? (ORDER BY {fieldName})? (LIMIT {int}) (PROJECT {projection})? 

### Example:

`FROM publications WHERE (Date > lala) AND (author MATCHES '.\*') AND (title = "lalala") PROJECT {title, author, nbchar: len(content)}`


## Operators:

For conditions: >, <, >=, <=, MATCHES, =, !=
For arithmetic expressions: +, -, *, /, %
Builtin functions: len, max, min, random_int 
