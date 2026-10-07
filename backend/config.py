import os
from dotenv import load_dotenv

load_dotenv()

# Azure Web App + Database injects specific variables like AZURE_MYSQL_HOST
# Railway injects MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
DB_HOST = os.getenv('AZURE_MYSQL_HOST') or os.getenv('MYSQLHOST') or os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('AZURE_MYSQL_PORT') or os.getenv('MYSQLPORT') or os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('AZURE_MYSQL_USER') or os.getenv('MYSQLUSER') or os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('AZURE_MYSQL_PASSWORD') or os.getenv('MYSQLPASSWORD') or os.getenv('DB_PASS', '')
DB_NAME = os.getenv('AZURE_MYSQL_DBNAME') or os.getenv('MYSQLDATABASE') or os.getenv('DB_NAME', 'bangmod_tkd')

# Flask settings
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
