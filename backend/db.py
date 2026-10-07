import pymysql
from backend.config import DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME


def get_db():
    """Get a database connection with DictCursor."""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        charset='utf8mb4'
    )


def init_db():
    """Create database and tables if they don't exist, seed initial data."""
    try:
        try:
            # 1) Create the database (Ignore errors if not allowed)
            conn = pymysql.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASS,
                charset='utf8mb4'
            )
            with conn.cursor() as cur:
                cur.execute(
                    "CREATE DATABASE IF NOT EXISTS `%s` "
                    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci" % DB_NAME
                )
            conn.commit()
            conn.close()
        except Exception as db_err:
            print(f"⚠️ Could not create database (might already exist or permission denied): {db_err}")

        # 2) Create tables
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS athletes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nickname VARCHAR(100) NOT NULL,
                    full_name VARCHAR(255) DEFAULT '',
                    belt_color VARCHAR(50) DEFAULT 'White',
                    birth_date VARCHAR(20) DEFAULT '',
                    class_type VARCHAR(50) DEFAULT 'รอบปกติ',
                    weight VARCHAR(20) DEFAULT ''
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS instructors (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS attendance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    person_id INT NOT NULL,
                    person_type ENUM('athlete', 'instructor') NOT NULL,
                    date DATE NOT NULL,
                    present BOOLEAN NOT NULL DEFAULT 0,
                    UNIQUE KEY unique_attendance (person_id, person_type, date)
                )
            """)

            # 3) Seed mock data if tables are empty
            cur.execute("SELECT COUNT(*) AS cnt FROM athletes")
            if cur.fetchone()['cnt'] == 0:
                cur.execute("""
                    INSERT INTO athletes (nickname, full_name, belt_color, birth_date, class_type, weight)
                    VALUES
                        ('Nong', 'Nong Somchai', 'Yellow', '2018-05-12', 'รอบปกติ', '25.5'),
                        ('Fah',  'Fah Sai',     'Green',  '2016-10-22', 'รอบนักกีฬา', '30.2'),
                        ('Bank', '',             'White',  '2020-01-05', 'รอบปกติ', '20.0'),
                        ('Ploy', 'Ploy Pailin',  'Blue',   '2014-08-15', 'รอบนักกีฬา', '42.1')
                """)

            cur.execute("SELECT COUNT(*) AS cnt FROM instructors")
            if cur.fetchone()['cnt'] == 0:
                cur.execute("INSERT INTO instructors (name) VALUES ('ครูปูเป้'), ('ครูมิน')")

        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise e
