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
                    "WHERE person_id=%s AND person_type='instructor' AND present=TRUE",
                    (row['id'],)
                )
                instructors.append({
                    'id': row['id'],
                    'nickname': row['nickname'],
                    'fullName': row['full_name'],
                    'username': row['username'],
                    'attendanceCount': cur.fetchone()['cnt'],
                })

        return jsonify(instructors)
    finally:
        conn.close()


@instructors_bp.route('/api/instructors', methods=['POST'])
def add_instructor():
    data = request.json
    nickname = data.get('nickname', '').strip()
    full_name = data.get('fullName', '').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not nickname or not username or not password:
        return jsonify({"error": "Nickname, username, and password are required"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO instructors (nickname, full_name, username, password)
                VALUES (%s, %s, %s, %s) RETURNING id
            """, (nickname, full_name, username, password))
            new_id = cur.fetchone()['id']
            conn.commit()

        return jsonify({"id": new_id, "nickname": nickname, "full_name": full_name, "username": username, "attendanceCount": 0}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
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

@instructors_bp.route('/api/login/admin', methods=['POST'])
def login_admin():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, nickname, username FROM instructors WHERE username=%s AND password=%s", (username, password))
            user = cur.fetchone()
            
            if user:
                return jsonify({
                    "message": "Login successful", 
                    "role": "admin", 
                    "instructor_id": user['id'],
                    "nickname": user['nickname']
                }), 200
            else:
                return jsonify({"error": "Invalid username or password"}), 401
    finally:
        conn.close()

