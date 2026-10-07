from flask import Blueprint, jsonify, request
from backend.db import get_db

attendance_bp = Blueprint('attendance', __name__)


@attendance_bp.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records for a specific date.
    Query params: ?date=YYYY-MM-DD
    Returns list of {person_id, person_type, present}
    """
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"error": "Missing 'date' query parameter"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT person_id, person_type, present FROM attendance WHERE date=%s",
                (date_str,)
            )
            records = cur.fetchall()
            # Convert `present` from 0/1 to bool
            for r in records:
                r['present'] = bool(r['present'])

        return jsonify(records)
    finally:
        conn.close()


@attendance_bp.route('/api/attendance', methods=['POST'])
def save_attendance():
    """Save/update attendance for a specific date.
    Body: { date: "YYYY-MM-DD", records: [ {id, type, present}, ... ] }
    """
    data = request.json
    date_str = data.get('date')
    records = data.get('records', [])

    if not date_str or not records:
        return jsonify({"error": "Missing 'date' or 'records'"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            for r in records:
                cur.execute(
                    "INSERT INTO attendance (person_id, person_type, date, present) "
                    "VALUES (%s, %s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE present=%s",
                    (r['id'], r['type'], date_str, r['present'], r['present'])
                )
            conn.commit()

        return jsonify({"message": "Attendance saved"}), 200
    finally:
        conn.close()


@attendance_bp.route('/api/attendance/monthly', methods=['GET'])
def get_monthly_attendance():
    """Get attendance count per person for a given month.
    Query params: ?month=YYYY-MM
    Returns { athletes: [{id, count}], instructors: [{id, count}] }
    """
    month_str = request.args.get('month')
    if not month_str:
        return jsonify({"error": "Missing 'month' query parameter"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Athletes
            cur.execute(
                "SELECT person_id AS id, COUNT(*) AS count "
                "FROM attendance "
                "WHERE person_type='athlete' AND present=1 AND DATE_FORMAT(date, '%%Y-%%m')=%s "
                "GROUP BY person_id",
                (month_str,)
            )
            athlete_counts = {r['id']: r['count'] for r in cur.fetchall()}

            # Instructors
            cur.execute(
                "SELECT person_id AS id, COUNT(*) AS count "
                "FROM attendance "
                "WHERE person_type='instructor' AND present=1 AND DATE_FORMAT(date, '%%Y-%%m')=%s "
                "GROUP BY person_id",
                (month_str,)
            )
            instructor_counts = {r['id']: r['count'] for r in cur.fetchall()}

        return jsonify({
            "athletes": athlete_counts,
            "instructors": instructor_counts,
        })
    finally:
        conn.close()
