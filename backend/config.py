import os
from dotenv import load_dotenv

load_dotenv()

# Vercel / Neon / Supabase injects POSTGRES_URL or DATABASE_URL
POSTGRES_URL = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')

# Flask settings
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
