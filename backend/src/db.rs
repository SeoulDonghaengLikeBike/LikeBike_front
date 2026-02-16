use rusqlite::Connection;

pub fn initialize(conn: &Connection) {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kakao_id TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL DEFAULT '',
            email TEXT NOT NULL DEFAULT '',
            profile_image_url TEXT,
            experience_points INTEGER NOT NULL DEFAULT 0,
            points INTEGER NOT NULL DEFAULT 0,
            level INTEGER NOT NULL DEFAULT 1,
            level_name TEXT NOT NULL DEFAULT '관심인',
            benefits TEXT NOT NULL DEFAULT '',
            description TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answers TEXT NOT NULL DEFAULT '[]',
            correct_answer TEXT NOT NULL,
            explanation TEXT NOT NULL DEFAULT '',
            hint_link TEXT NOT NULL DEFAULT '',
            hint_description TEXT NOT NULL DEFAULT '',
            display_date TEXT NOT NULL,
            quiz_type TEXT NOT NULL DEFAULT 'select'
        );

        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            is_correct INTEGER NOT NULL DEFAULT 0,
            points_earned INTEGER NOT NULL DEFAULT 0,
            experience_earned INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
        );

        CREATE TABLE IF NOT EXISTS bike_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            bike_photo_url TEXT NOT NULL,
            safety_gear_photo_url TEXT NOT NULL,
            started_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            verification_status TEXT NOT NULL DEFAULT 'pending',
            verified_at TEXT,
            points_awarded INTEGER NOT NULL DEFAULT 0,
            admin_notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS course_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            course_name TEXT NOT NULL DEFAULT '',
            course_description TEXT NOT NULL DEFAULT '',
            description TEXT NOT NULL DEFAULT '',
            photo_url TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'pending',
            review TEXT NOT NULL DEFAULT '',
            reviewed_at TEXT,
            reviewed_by_admin_id INTEGER,
            admin_notes TEXT,
            points_awarded INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS course_places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            name TEXT NOT NULL DEFAULT '',
            address_name TEXT NOT NULL DEFAULT '',
            description TEXT NOT NULL DEFAULT '',
            photo_url TEXT NOT NULL DEFAULT '',
            latitude REAL NOT NULL DEFAULT 0.0,
            longitude REAL NOT NULL DEFAULT 0.0,
            x TEXT NOT NULL DEFAULT '',
            y TEXT NOT NULL DEFAULT '',
            sequence_order INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (course_id) REFERENCES course_recommendations(id)
        );

        CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            experience_points INTEGER NOT NULL DEFAULT 0,
            reward_reason TEXT NOT NULL DEFAULT '',
            source_type TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        ",
    )
    .expect("Failed to initialize database tables");
}

/// Compute level from experience points
pub fn compute_level(xp: i64) -> (i64, &'static str) {
    if xp >= 500 {
        (6, "전문가")
    } else if xp >= 400 {
        (5, "숙련자")
    } else if xp >= 300 {
        (4, "중급자")
    } else if xp >= 200 {
        (3, "초보자")
    } else if xp >= 100 {
        (2, "입문자")
    } else {
        (1, "관심인")
    }
}
