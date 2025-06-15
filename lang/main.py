import json
from dotenv import load_dotenv
from pymongo import MongoClient
import os
from parser import parse_query

def main():
    load_dotenv()
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("MONGO_DB_NAME", 'test')]


    query = parse_query('publications IF NOT ( author.name = "Aubrey" AND author.lastname = "Koch" OR name MATCHES "Tutis .* harum non arbitro." ) SORT -updated_at LIMIT 10 PROJECT { name, body: body + "lala" }')

    print(json.dumps(query, indent=2, default=lambda o: o.__dict__))

    print(json.dumps(query.mongo_query(), indent=2, default=lambda o: o.__dict__))


    res = query.mongo_exec(db)
    for doc in res:
        print(json.dumps(doc, indent=2, default=lambda o: o.__str__()))

if __name__ == "__main__":
    main()