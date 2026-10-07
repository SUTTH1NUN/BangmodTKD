from flask import Blueprint, jsonify, request
from backend.db import get_db

athletes_bp = Blueprint('athletes', __name__)

# Column mapping: JS camelCase -> MySQL snake_case
JS_TO_DB = {
    'nickname': 'nickname',
    'fullName': 'full_name',
    'beltColor': 'belt_color',
    'birthDate': 'birth_date',
    'classType': 'class_type',
    'weight': 'weight',
}

DB_TO_JS = {v: k for k, v in JS_TO_DB.items()}


def _row_to_json(row):
    """Convert a DB row dict (snake_case) to JS-friendly dict (camelCase)."""
    return {
        'id': row['id'],
        'nickname': row['nickname'],
        'fullName': row.get('full_name', ''),
        'beltColor': row.get('belt_color', 'White'),
        'birthDate': row.get('birth_date', ''),
        'classType': row.get('class_type', 'รอบปกติ'),
        'weight': row.get('weight', ''),
    }


@athletes_bp.route('/api/athletes', methods=['GET'])
def list_athletes():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM athletes ORDER BY id")
            rows = cur.fetchall()

            athletes = []
            for row in rows:
                a = _row_to_json(row)
                cur.execute(
                    "SELECT COUNT(*) AS cnt FROM attendance "
                    "WHERE person_id=%s AND person_type='athlete' AND present=TRUE",
                    (row['id'],)
                )
                a['attendanceCount'] = cur.fetchone()['cnt']
                athletes.append(a)

        return jsonify(athletes)
    finally:
        conn.close()


@athletes_bp.route('/api/athletes', methods=['POST'])
def add_athlete():
    data = request.json
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO athletes (nickname, full_name, belt_color, birth_date, class_type, weight) "
                "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    data.get('nickname', ''),
                    data.get('fullName', ''),
                    data.get('beltColor', 'White'),
                    data.get('birthDate', ''),
                    data.get('classType', 'รอบปกติ'),
                    data.get('weight', ''),
                )
            )
            new_id = cur.fetchone()['id']
            conn.commit()
            cur.execute("SELECT * FROM athletes WHERE id=%s", (new_id,))
            row = cur.fetchone()

        result = _row_to_json(row)
        result['attendanceCount'] = 0
        return jsonify(result), 201
    finally:
        conn.close()


@athletes_bp.route('/api/athletes/<int:athlete_id>', methods=['PUT'])
def update_athlete(athlete_id):
    data = request.json
    conn = get_db()
    try:
        with conn.cursor() as cur:
            fields = []
            values = []
            for js_key, db_key in JS_TO_DB.items():
                if js_key in data:
                    fields.append(f"{db_key}=%s")
                    values.append(data[js_key])

            if fields:
                values.append(athlete_id)
                cur.execute(
                    f"UPDATE athletes SET {', '.join(fields)} WHERE id=%s",
                    values
                )
                conn.commit()

        return jsonify({"message": "Updated"}), 200
    finally:
        conn.close()


@athletes_bp.route('/api/athletes/<int:athlete_id>', methods=['DELETE'])
def delete_athlete(athlete_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM attendance WHERE person_id=%s AND person_type='athlete'", (athlete_id,))
            cur.execute("DELETE FROM athletes WHERE id=%s", (athlete_id,))
            conn.commit()
        return jsonify({"message": "Deleted"}), 200
    finally:
        conn.close()

@athletes_bp.route('/api/weights', methods=['GET'])
def get_weights():
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"error": "date is required"}), 400
    
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT athlete_id, weight FROM weight_history WHERE date=%s", (date_str,))
            rows = cur.fetchall()
            return jsonify(rows)
    finally:
        conn.close()

@athletes_bp.route('/api/weights', methods=['PUT'])
def update_weights():
    data = request.json
    date_str = data.get('date')
    records = data.get('records', [])
    
    conn = get_db()
    try:
        with conn.cursor() as cur:
            for r in records:
                cur.execute("""
                    INSERT INTO weight_history (athlete_id, date, weight) 
                    VALUES (%s, %s, %s)
                    ON CONFLICT (athlete_id, date) 
                    DO UPDATE SET weight = EXCLUDED.weight
                """, (r['id'], date_str, r['weight']))
            conn.commit()
        return jsonify({"message": "Saved weights"}), 200
    finally:
        conn.close()

@athletes_bp.route('/api/athletes/<int:athlete_id>/weights', methods=['GET'])
def get_athlete_weight_history(athlete_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT date, weight FROM weight_history WHERE athlete_id=%s ORDER BY date ASC",
                (athlete_id,)
            )
            rows = cur.fetchall()
            # Convert date objects to strings for JSON
            history = [{"date": r['date'].strftime('%Y-%m-%d'), "weight": r['weight']} for r in rows]
            return jsonify(history)
    finally:
        conn.close()


