"""
QuBitLab AI - Database & Persistence Module
SQLite-backed relational storage for Users, Learner Progress, Quiz Attempts,
Challenge Attempts, Saved Circuits, and AI Learning Activity.
"""

import os
import sqlite3
import json
import secrets
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "qubitlab.db")


def get_db_connection() -> sqlite3.Connection:
    """Creates a sqlite3 database connection with dictionary row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Initializes tables and indices in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    )
    """)

    # 2. User Sessions Table (Persistent Auth Tokens)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 3. Learner Module Progress Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learner_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        module_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('not_started', 'in_progress', 'completed')),
        percentage INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, module_id)
    )
    """)

    # 4. Quiz Attempts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        module_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        percentage REAL NOT NULL,
        selected_option INTEGER,
        is_correct BOOLEAN NOT NULL,
        attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 5. Challenge Attempts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS challenge_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('in_progress', 'completed')),
        score INTEGER DEFAULT 0,
        attempts_count INTEGER DEFAULT 1,
        circuit_json TEXT,
        completion_date TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, challenge_id)
    )
    """)

    # 6. Saved Quantum Circuits Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_circuits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        qubits INTEGER NOT NULL DEFAULT 2,
        steps_json TEXT NOT NULL,
        python_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 7. AI Learning Activity Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        mode TEXT NOT NULL,
        topic TEXT,
        prompt_summary TEXT,
        circuit_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 8. Activity Feed Log (Chronological learner milestones)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_feed (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()


# -----------------------------------------------------------------------------
# User & Authentication Service
# -----------------------------------------------------------------------------

def register_user(name: str, email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """Registers a new user, hashes password, and initializes module progress."""
    name = name.strip()
    email = email.strip().lower()

    if not name or not email or not password:
        return False, "All fields are required.", None

    if len(password) < 6:
        return False, "Password must be at least 6 characters long.", None

    if "@" not in email or "." not in email:
        return False, "Please enter a valid email address.", None

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check duplicate
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return False, "An account with this email already exists.", None

        # Hash password securely
        pwd_hash = generate_password_hash(password, method="pbkdf2:sha256")
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, last_login) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
            (name, email, pwd_hash)
        )
        user_id = cursor.lastrowid

        # Initialize standard curriculum modules for learner
        default_modules = ["qubits", "superposition", "pauli_gates", "measurement", "entanglement", "grover"]
        for mod_id in default_modules:
            cursor.execute(
                "INSERT INTO learner_progress (user_id, module_id, status, percentage) VALUES (?, ?, 'not_started', 0)",
                (user_id, mod_id)
            )

        # Log initial registration activity
        cursor.execute(
            "INSERT INTO activity_feed (user_id, activity_type, title, detail) VALUES (?, 'register', 'Account Created', 'Joined QuBitLab AI Quantum Academy')",
            (user_id,)
        )

        conn.commit()

        # Fetch clean user dict (excluding password hash)
        user_data = get_user_by_id(user_id, conn)
        conn.close()
        return True, "Registration successful.", user_data

    except Exception as e:
        conn.rollback()
        conn.close()
        return False, f"Registration error: {str(e)}", None


def authenticate_user(email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """Authenticates user credentials and updates last login timestamp."""
    email = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?", (email,))
    user_row = cursor.fetchone()

    if not user_row:
        conn.close()
        return False, "Invalid email or password.", None

    if not check_password_hash(user_row["password_hash"], password):
        conn.close()
        return False, "Invalid email or password.", None

    # Update last login
    cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user_row["id"],))
    conn.commit()

    user_data = {
        "id": user_row["id"],
        "name": user_row["name"],
        "email": user_row["email"],
        "created_at": user_row["created_at"]
    }
    conn.close()
    return True, "Authentication successful.", user_data


def create_user_session(user_id: int) -> str:
    """Generates a secure random session token and stores it in the database."""
    token = secrets.token_hex(32)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO user_sessions (token, user_id) VALUES (?, ?)",
        (token, user_id)
    )
    conn.commit()
    conn.close()
    return token


def validate_session_token(token: str) -> Optional[Dict[str, Any]]:
    """Validates session token and returns user dictionary if valid."""
    if not token:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.created_at, u.last_login
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ?
    """, (token,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def delete_user_session(token: str):
    """Deletes a session token upon logout."""
    if not token:
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def get_user_by_id(user_id: int, conn: Optional[sqlite3.Connection] = None) -> Optional[Dict[str, Any]]:
    """Fetches user profile safely without password hash."""
    close_after = False
    if conn is None:
        conn = get_db_connection()
        close_after = True

    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, created_at, last_login FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()

    if close_after:
        conn.close()

    if row:
        return dict(row)
    return None


# -----------------------------------------------------------------------------
# Learner Progress Service
# -----------------------------------------------------------------------------

def get_learner_progress(user_id: int) -> Dict[str, Any]:
    """Fetches complete learning module progress and stats for a learner."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT module_id, status, percentage, time_spent_seconds, last_accessed
        FROM learner_progress
        WHERE user_id = ?
    """, (user_id,))
    progress_rows = cursor.fetchall()

    modules_progress = {row["module_id"]: dict(row) for row in progress_rows}

    # Best quiz score per module
    cursor.execute("""
        SELECT module_id, MAX(score) as best_score, max_score, MAX(percentage) as best_pct, COUNT(*) as attempts
        FROM quiz_attempts
        WHERE user_id = ?
        GROUP BY module_id
    """, (user_id,))
    quiz_rows = cursor.fetchall()
    quizzes_summary = {row["module_id"]: dict(row) for row in quiz_rows}

    conn.close()
    return {
        "modules": modules_progress,
        "quizzes": quizzes_summary
    }


def update_module_progress(user_id: int, module_id: str, status: str, percentage: int = 0) -> bool:
    """Updates learner progress on a module and logs milestone activity."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO learner_progress (user_id, module_id, status, percentage, last_accessed)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, module_id) DO UPDATE SET
            status = excluded.status,
            percentage = MAX(learner_progress.percentage, excluded.percentage),
            last_accessed = CURRENT_TIMESTAMP
    """, (user_id, module_id, status, percentage))

    if status == "completed":
        # Log to activity feed
        cursor.execute(
            "INSERT INTO activity_feed (user_id, activity_type, title, detail) VALUES (?, 'module_completed', 'Completed Module', ?)",
            (user_id, f"Mastered '{module_id.replace('_', ' ').title()}'")
        )

    conn.commit()
    conn.close()
    return True


def record_quiz_attempt(
    user_id: int,
    module_id: str,
    score: int,
    max_score: int,
    selected_option: int,
    is_correct: bool
) -> Dict[str, Any]:
    """Records quiz attempt and automatically marks module completed if correct."""
    percentage = (score / max_score) * 100.0 if max_score > 0 else 0.0
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO quiz_attempts (user_id, module_id, score, max_score, percentage, selected_option, is_correct)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, module_id, score, max_score, percentage, selected_option, is_correct))

    if is_correct:
        # Update module progress to completed
        cursor.execute("""
            INSERT INTO learner_progress (user_id, module_id, status, percentage, last_accessed)
            VALUES (?, ?, 'completed', 100, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, module_id) DO UPDATE SET
                status = 'completed',
                percentage = 100,
                last_accessed = CURRENT_TIMESTAMP
        """, (user_id, module_id))

        cursor.execute(
            "INSERT INTO activity_feed (user_id, activity_type, title, detail) VALUES (?, 'quiz', 'Passed Concept Checkpoint', ?)",
            (user_id, f"100% on '{module_id.replace('_', ' ').title()}' quiz")
        )

    conn.commit()
    conn.close()
    return {
        "success": True,
        "is_correct": is_correct,
        "score": score,
        "percentage": percentage
    }


# -----------------------------------------------------------------------------
# Challenge Attempts Service
# -----------------------------------------------------------------------------

def get_challenge_attempts(user_id: int) -> Dict[str, Any]:
    """Fetches all challenge records for a learner."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT challenge_id, status, score, attempts_count, circuit_json, completion_date, updated_at
        FROM challenge_attempts
        WHERE user_id = ?
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return {row["challenge_id"]: dict(row) for row in rows}


def record_challenge_attempt(
    user_id: int,
    challenge_id: str,
    passed: bool,
    score: int,
    circuit_json: Dict[str, Any]
) -> Dict[str, Any]:
    """Records challenge verification and updates learner challenge status."""
    conn = get_db_connection()
    cursor = conn.cursor()

    status = "completed" if passed else "in_progress"
    circuit_str = json.dumps(circuit_json)

    cursor.execute("""
        INSERT INTO challenge_attempts (user_id, challenge_id, status, score, attempts_count, circuit_json, completion_date, updated_at)
        VALUES (?, ?, ?, ?, 1, ?, CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, challenge_id) DO UPDATE SET
            status = CASE WHEN ? THEN 'completed' ELSE challenge_attempts.status END,
            score = MAX(challenge_attempts.score, excluded.score),
            attempts_count = challenge_attempts.attempts_count + 1,
            circuit_json = excluded.circuit_json,
            completion_date = CASE WHEN ? AND challenge_attempts.completion_date IS NULL THEN CURRENT_TIMESTAMP ELSE challenge_attempts.completion_date END,
            updated_at = CURRENT_TIMESTAMP
    """, (user_id, challenge_id, status, score, circuit_str, passed, passed, passed))

    if passed:
        cursor.execute(
            "INSERT INTO activity_feed (user_id, activity_type, title, detail) VALUES (?, 'challenge', 'Challenge Solved', ?)",
            (user_id, f"Completed '{challenge_id.replace('_', ' ').title()}' (+{score} XP)")
        )

    conn.commit()
    conn.close()
    return {"recorded": True, "status": status}


# -----------------------------------------------------------------------------
# Saved Quantum Circuits Service
# -----------------------------------------------------------------------------

def get_saved_circuits(user_id: int) -> List[Dict[str, Any]]:
    """Returns only the authenticated learner's private saved circuits."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, description, qubits, steps_json, python_code, created_at, updated_at
        FROM saved_circuits
        WHERE user_id = ?
        ORDER BY updated_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        try:
            item["steps"] = json.loads(item["steps_json"])
        except Exception:
            item["steps"] = []
        result.append(item)
    return result


def save_circuit(
    user_id: int,
    name: str,
    qubits: int,
    steps: List[Any],
    description: str = "",
    python_code: str = ""
) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """Saves a new quantum circuit for the learner."""
    name = name.strip()
    if not name:
        name = f"Circuit {datetime.now().strftime('%b %d, %H:%M')}"

    steps_json = json.dumps(steps)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO saved_circuits (user_id, name, description, qubits, steps_json, python_code, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (user_id, name, description, qubits, steps_json, python_code))
    circuit_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO activity_feed (user_id, activity_type, title, detail) VALUES (?, 'circuit_saved', 'Saved Circuit', ?)",
        (user_id, f"Saved '{name}' ({qubits} qubits)")
    )

    conn.commit()

    cursor.execute("SELECT * FROM saved_circuits WHERE id = ?", (circuit_id,))
    row = dict(cursor.fetchone())
    row["steps"] = steps
    conn.close()
    return True, "Circuit saved successfully.", row


def update_saved_circuit(
    user_id: int,
    circuit_id: int,
    name: str,
    qubits: int,
    steps: List[Any],
    description: str = "",
    python_code: str = ""
) -> Tuple[bool, str]:
    """Updates an existing saved circuit belonging to the user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Ensure ownership
    cursor.execute("SELECT id FROM saved_circuits WHERE id = ? AND user_id = ?", (circuit_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return False, "Circuit not found or access denied."

    steps_json = json.dumps(steps)
    cursor.execute("""
        UPDATE saved_circuits
        SET name = ?, description = ?, qubits = ?, steps_json = ?, python_code = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    """, (name, description, qubits, steps_json, python_code, circuit_id, user_id))

    conn.commit()
    conn.close()
    return True, "Circuit updated."


def delete_saved_circuit(user_id: int, circuit_id: int) -> Tuple[bool, str]:
    """Deletes a saved circuit belonging to the learner."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM saved_circuits WHERE id = ? AND user_id = ?", (circuit_id, user_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()

    if deleted:
        return True, "Circuit deleted."
    return False, "Circuit not found or access denied."


# -----------------------------------------------------------------------------
# AI Learning Activity Service
# -----------------------------------------------------------------------------

def log_ai_activity(user_id: int, mode: str, topic: str, prompt_summary: str, circuit_summary: str):
    """Records lightweight learning context for AI recommendations."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ai_activity (user_id, mode, topic, prompt_summary, circuit_summary)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, mode, topic, prompt_summary[:200], circuit_summary[:200]))
    conn.commit()
    conn.close()


# -----------------------------------------------------------------------------
# Personalized Dashboard Analytics Service
# -----------------------------------------------------------------------------

def get_learner_dashboard_data(user_id: int) -> Dict[str, Any]:
    """
    Computes real, personalized metrics for the authenticated learner:
    - Overall completion percentage
    - Recommended next module
    - Completed modules count
    - Average quiz score
    - Completed challenges count
    - Saved circuits count
    - Recent activity timeline
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # User basic info
    cursor.execute("SELECT name, email, created_at FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        return {}

    # Module stats
    cursor.execute("""
        SELECT module_id, status, percentage FROM learner_progress WHERE user_id = ?
    """, (user_id,))
    mod_rows = cursor.fetchall()
    total_modules = 6
    completed_modules = [r for r in mod_rows if r["status"] == "completed"]
    completed_modules_count = len(completed_modules)

    # Find next incomplete module
    default_order = ["qubits", "superposition", "pauli_gates", "measurement", "entanglement", "grover"]
    completed_ids = {r["module_id"] for r in completed_modules}
    next_topic = "Mastered All Modules!"
    for m_id in default_order:
        if m_id not in completed_ids:
            next_topic = m_id.replace("_", " ").title()
            break

    # Quiz stats
    cursor.execute("""
        SELECT AVG(percentage) as avg_pct, COUNT(*) as attempts_count
        FROM (
            SELECT MAX(percentage) as percentage
            FROM quiz_attempts
            WHERE user_id = ?
            GROUP BY module_id
        )
    """, (user_id,))
    quiz_stat = cursor.fetchone()
    quiz_avg = round(quiz_stat["avg_pct"], 1) if quiz_stat and quiz_stat["avg_pct"] is not None else 0.0

    # Challenge stats
    # Challenge stats (status can be 'completed' or 'passed')
    cursor.execute("""
        SELECT COUNT(*) as solved_count, SUM(score) as total_xp
        FROM challenge_attempts
        WHERE user_id = ? AND (status = 'completed' OR status = 'passed')
    """, (user_id,))
    chal_stat = cursor.fetchone()
    challenges_solved = chal_stat["solved_count"] if chal_stat else 0
    total_xp = (chal_stat["total_xp"] or 0) + (completed_modules_count * 50)

    # Saved circuits count
    cursor.execute("SELECT COUNT(*) as count FROM saved_circuits WHERE user_id = ?", (user_id,))
    circuits_count = cursor.fetchone()["count"]

    # Calculate overall completion (6 modules + 5 challenges = 11 milestones)
    total_milestones = 11
    completed_milestones = completed_modules_count + challenges_solved
    overall_percentage = min(100, int((completed_milestones / total_milestones) * 100))

    # Activity feed (latest 6 activities)
    cursor.execute("""
        SELECT activity_type, title, detail, created_at
        FROM activity_feed
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 6
    """, (user_id,))
    activity_rows = cursor.fetchall()
    activities = [dict(a) for a in activity_rows]

    conn.close()

    return {
        "user": {
            "id": user_id,
            "name": user_row["name"],
            "email": user_row["email"]
        },
        "learner_name": user_row["name"],
        "learner_email": user_row["email"],
        "overall_percentage": overall_percentage,
        "overall_completion_pct": overall_percentage,
        "next_topic": next_topic,
        "continue_module": {
            "module_id": next_topic.lower().replace(" ", "_"),
            "title": next_topic
        },
        "completed_modules_count": completed_modules_count,
        "total_modules": total_modules,
        "quiz_average": quiz_avg,
        "challenges_solved": challenges_solved,
        "total_challenges": 5,
        "saved_circuits_count": circuits_count,
        "total_xp": total_xp,
        "metrics": {
            "modules_completed": completed_modules_count,
            "modules_total": total_modules,
            "quiz_average": quiz_avg,
            "challenges_completed": challenges_solved,
            "challenges_total": 5,
            "saved_circuits": circuits_count,
            "total_xp": total_xp
        },
        "module_progress": [dict(r) for r in mod_rows],
        "recent_activity": activities
    }
