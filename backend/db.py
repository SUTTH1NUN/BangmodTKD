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
                    class_type VARCHAR(50) DEFAULT 'รอบปกติ',
                    weight VARCHAR(20) DEFAULT ''
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS instructors (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL
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



        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise e
