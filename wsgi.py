from backend.app import app
from backend.db import init_db

import os

# Initialize database on startup (skip on Vercel to avoid cold start latency)
if not os.getenv('VERCEL'):
    init_db()

if __name__ == "__main__":
    app.run()
