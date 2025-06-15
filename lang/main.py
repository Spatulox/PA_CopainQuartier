from db import db
from parser import parse_query
from flask import Flask, request, jsonify


def process_query(query_string):

    query = parse_query(query_string)

    res = query.mongo_exec(db)
    return list(res)


app = Flask(__name__)


@app.route('/query', methods=['POST'])
def handle_query():
    data = request.get_json() or {}
    print(data)
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    try:
        result = process_query(query)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
