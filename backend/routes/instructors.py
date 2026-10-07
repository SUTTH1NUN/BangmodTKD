from flask import Blueprint, jsonify, request
from backend.db import get_db

instructors_bp = Blueprint('instructors', __name__)


@instructors_bp.route('/api/instructors', methods=['GET'])
def list_instructors():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM instructors ORDER BY id")
            rows = cur.fetchall()

            instructors = []
            for row in rows:
                cur.execute(
                    "SELECT COUNT(*) AS cnt FROM attendance "
                    "WHERE person_id=%s AND person_type='instructor' AND present=1",
                    (row['id'],)
                )
                instructors.append({
                    'id': row['id'],
                    'name': row['name'],
                    'attendanceCount': cur.fetchone()['cnt'],
                })

        return jsonify(instructors)
    finally:
        conn.close()


@instructors_bp.route('/api/instructors', methods=['POST'])
def add_instructor():
    data = request.json
    name = data.get('name', '').strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO instructors (name) VALUES (%s)", (name,))
            conn.commit()
            new_id = cur.lastrowid

        return jsonify({"id": new_id, "name": name, "attendanceCount": 0}), 201
    finally:
        conn.close()


@instructors_bp.route('/api/instructors/<int:instructor_id>', methods=['DELETE'])
def delete_instructor(instructor_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM attendance WHERE person_id=%s AND person_type='instructor'", (instructor_id,))
            cur.execute("DELETE FROM instructors WHERE id=%s", (instructor_id,))
            conn.commit()
        return jsonify({"message": "Deleted"}), 200
    finally:
        conn.close()
