from backend.db import get_db

try:
    conn = get_db()
    with conn.cursor() as cur:
        # Update sequence for athletes
        cur.execute("SELECT setval('athletes_id_seq', (SELECT MAX(id) FROM athletes));")
        # Update sequence for instructors just in case
        cur.execute("SELECT setval('instructors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM instructors));")
        # Update sequence for attendance
        cur.execute("SELECT setval('attendance_id_seq', (SELECT COALESCE(MAX(id), 1) FROM attendance));")
        # Update sequence for weight_history
        cur.execute("SELECT setval('weight_history_id_seq', (SELECT COALESCE(MAX(id), 1) FROM weight_history));")
        conn.commit()
        print("Sequences updated successfully!")
except Exception as e:
    print("Error:", e)
