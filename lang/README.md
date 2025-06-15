## Syntax

{collection} (IF {condition})? (SORT {fieldName})? (LIMIT {int}) (PROJECT {projection})? 

### Example:

`publications IF Date > lala AND author MATCHES '.*' AND title = "lalala" PROJECT {title, author, nbchar: len(content)}`


## Operators:

For conditions: >, <, >=, <=, MATCHES, =, !=
For arithmetic expressions: +, -, *, /, %
Builtin functions: len, max, min, random_int 
