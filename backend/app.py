import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.config import PORT, DEBUG
from backend.db import init_db
from backend.routes.athletes import athletes_bp
from backend.routes.instructors import instructors_bp
from backend.routes.attendance import attendance_bp

# ---------------------------------------------------------------------------
# Flask App Factory
# ---------------------------------------------------------------------------
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')
CORS(app)

# Register Blueprints
app.register_blueprint(athletes_bp)
app.register_blueprint(instructors_bp)
app.register_blueprint(attendance_bp)


# ---------------------------------------------------------------------------
# Serve Frontend (static files)
# ---------------------------------------------------------------------------
@app.route('/')
def serve_index():
    return send_from_directory(STATIC_DIR, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve any file from the static folder; fallback to index.html for SPA."""
    file_path = os.path.join(STATIC_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, 'index.html')


# ---------------------------------------------------------------------------
# Setup Route (Useful for Vercel Serverless)
# ---------------------------------------------------------------------------
@app.route('/api/init-db')
def api_init_db():
    try:
        init_db()
        return {"message": "Database initialized successfully"}
    except Exception as e:
        return {"error": str(e)}, 500


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
