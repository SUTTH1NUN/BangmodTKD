import psycopg2
from psycopg2.extras import RealDictCursor
from backend.config import POSTGRES_URL


def get_db():
    """Get a database connection with DictCursor."""
    return psycopg2.connect(
        POSTGRES_URL,
        cursor_factory=RealDictCursor
    )


def init_db():
    """Create tables if they don't exist."""
    try:
        # Create tables
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS athletes (
                    id SERIAL PRIMARY KEY,
                    nickname VARCHAR(100) NOT NULL,
                    full_name VARCHAR(255) DEFAULT '',
                    belt_color VARCHAR(50) DEFAULT 'White',
                    birth_date VARCHAR(20) DEFAULT '',
                    class_type VARCHAR(50) DEFAULT 'รอบปกติ'
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS instructors (
                    id SERIAL PRIMARY KEY,
                    nickname VARCHAR(100) NOT NULL,
                    full_name VARCHAR(255) DEFAULT '',
                    username VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS attendance (
                    id SERIAL PRIMARY KEY,
                    person_id INT NOT NULL,
                    person_type VARCHAR(50) NOT NULL,
                    date DATE NOT NULL,
                    present BOOLEAN NOT NULL DEFAULT FALSE,
                    UNIQUE (person_id, person_type, date)
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS weight_history (
                    id SERIAL PRIMARY KEY,
                    athlete_id INT NOT NULL,
                    date DATE NOT NULL,
                    weight VARCHAR(20) NOT NULL,
                    UNIQUE (athlete_id, date)
                )
            """)


        conn.commit()
        
        # Check if instructors table is empty, if so, seed an admin user
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS count FROM instructors")
            res = cur.fetchone()
            if res['count'] == 0:
                cur.execute("""
                    INSERT INTO instructors (nickname, full_name, username, password)
                    VALUES ('Admin', 'System Administrator', 'admin', 'admin')
                """)
                conn.commit()
                print("✅ Seeded default admin user (admin / admin)")
                
        conn.close()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise e
