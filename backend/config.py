import os
from dotenv import load_dotenv

load_dotenv()

# Vercel Postgres injects POSTGRES_URL
POSTGRES_URL = os.getenv('POSTGRES_URL')

# Flask settings
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
