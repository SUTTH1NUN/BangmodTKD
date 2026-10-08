from backend.db import get_db

try:
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'athletes';")
        print("Athletes columns:", cur.fetchall())
except Exception as e:
    print("Error:", e)
