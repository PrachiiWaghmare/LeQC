"""
QuBitLab AI - Full Stack Server with Learner Authentication & Persistence
Hosts the Flask REST API & serves the frontend client for the Quantum Learning Platform.
"""

import sys
import os
import io
import json
import subprocess
import traceback
from functools import wraps
from typing import Dict, Any

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from flask import Flask, request, jsonify, send_from_directory, session, g
from flask_cors import CORS

import qiskit
from backend.quantum_engine import QuantumEngine
from backend.ai_tutor import AITutor
from backend.curriculum import MODULES, PRESETS, CHALLENGES
from backend.database import (
    init_db, register_user, authenticate_user, create_user_session,
    validate_session_token, delete_user_session, get_user_by_id,
    get_learner_progress, update_module_progress, record_quiz_attempt,
    get_challenge_attempts, record_challenge_attempt, get_saved_circuits,
    save_circuit, update_saved_circuit, delete_saved_circuit,
    log_ai_activity, get_learner_dashboard_data
)

# Initialize Flask App
app = Flask(__name__, static_folder="static", static_url_path="/static")
app.secret_key = os.environ.get("SECRET_KEY", "qubitlab-quantum-secret-key-2026-auth")
CORS(app, supports_credentials=True)

# Initialize Database & Core Services
init_db()
quantum_engine = QuantumEngine()
ai_tutor = AITutor()


# -------------------------------------------------------------
# Authentication Helpers & Middleware
# -------------------------------------------------------------

def get_authenticated_user():
    """Extracts authenticated user from Authorization header or session cookie."""
    # 1. Check Authorization: Bearer <token>
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif "qubitlab_token" in request.cookies:
        token = request.cookies.get("qubitlab_token")

    if token:
        user = validate_session_token(token)
        if user:
            return user

    # 2. Check Flask signed session
    user_id = session.get("user_id")
    if user_id:
        return get_user_by_id(user_id)

    return None


def login_required(f):
    """Decorator ensuring that endpoint requires an authenticated learner."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_authenticated_user()
        if not user:
            return jsonify({
                "success": False,
                "error": "Authentication required. Please log in.",
                "authenticated": False
            }), 401
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function


# -------------------------------------------------------------
# Static Frontend Routes
# -------------------------------------------------------------

@app.route("/")
def index():
    """Serves the main application SPA."""
    return send_from_directory("static", "index.html")


@app.route("/<path:path>")
def static_proxy(path):
    """Fallback proxy for static files."""
    if os.path.exists(os.path.join("static", path)):
        return send_from_directory("static", path)
    return send_from_directory("static", "index.html")


# -------------------------------------------------------------
# Authentication API Endpoints
# -------------------------------------------------------------

@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    """Registers a new learner account and initializes session."""
    try:
        data = request.get_json(force=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or data.get("identity") or data.get("username") or "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password")

        if not name or not email or not password:
            return jsonify({"success": False, "error": "Full name, email/username, and password are required."}), 400

        if confirm_password is not None and password != confirm_password:
            return jsonify({"success": False, "error": "Passwords do not match."}), 400

        success, msg, user = register_user(name, email, password)
        if not success:
            return jsonify({"success": False, "error": msg}), 400

        # Create persistent session token
        token = create_user_session(user["id"])
        session["user_id"] = user["id"]

        resp = jsonify({
            "success": True,
            "message": "Account created successfully.",
            "user": user,
            "token": token
        })
        resp.set_cookie("qubitlab_token", token, httponly=True, samesite="Lax")
        return resp, 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    """Authenticates learner and creates session."""
    try:
        data = request.get_json(force=True) or {}
        email = (data.get("email") or data.get("identity") or data.get("username") or "").strip()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"success": False, "error": "Email/username and password are required."}), 400

        success, msg, user = authenticate_user(email, password)
        if not success:
            return jsonify({"success": False, "error": msg}), 401

        # Create persistent session token
        token = create_user_session(user["id"])
        session["user_id"] = user["id"]

        resp = jsonify({
            "success": True,
            "message": "Logged in successfully.",
            "user": user,
            "token": token
        })
        resp.set_cookie("qubitlab_token", token, httponly=True, samesite="Lax")
        return resp

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    """Logs learner out and invalidates session token."""
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif "qubitlab_token" in request.cookies:
        token = request.cookies.get("qubitlab_token")

    if token:
        delete_user_session(token)

    session.pop("user_id", None)
    resp = jsonify({"success": True, "message": "Logged out successfully."})
    resp.delete_cookie("qubitlab_token")
    return resp


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    """Returns currently authenticated user profile or false if guest."""
    user = get_authenticated_user()
    if user:
        return jsonify({
            "authenticated": True,
            "user": user
        })
    return jsonify({
        "authenticated": False,
        "user": None
    })


# -------------------------------------------------------------
# Learner Personalized Progress Endpoints
# -------------------------------------------------------------

@app.route("/api/learner/dashboard", methods=["GET"])
@login_required
def get_personalized_dashboard():
    """Returns real, personalized metrics for current authenticated learner."""
    data = get_learner_dashboard_data(g.current_user["id"])
    return jsonify({
        "success": True,
        "dashboard": data
    })


@app.route("/api/learner/progress", methods=["GET"])
@login_required
def get_progress():
    """Returns module statuses and quiz best scores for authenticated learner."""
    data = get_learner_progress(g.current_user["id"])
    challenges = get_challenge_attempts(g.current_user["id"])
    return jsonify({
        "success": True,
        "progress": data,
        "challenges": challenges
    })


@app.route("/api/learner/module-progress", methods=["POST"])
@login_required
def update_progress():
    """Updates learner status on a curriculum module."""
    try:
        data = request.get_json(force=True) or {}
        module_id = data.get("module_id", "").strip()
        status = data.get("status", "in_progress")
        percentage = int(data.get("percentage", 0))

        if not module_id:
            return jsonify({"success": False, "error": "Missing module_id"}), 400

        update_module_progress(g.current_user["id"], module_id, status, percentage)
        return jsonify({"success": True, "message": "Progress recorded."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/learner/quiz-attempt", methods=["POST"])
@login_required
def submit_quiz_attempt():
    """Records quiz attempt and automatically marks module completed if correct."""
    try:
        data = request.get_json(force=True) or {}
        module_id = data.get("module_id", "").strip()
        selected_option = data.get("selected_option")
        passed = data.get("passed")

        # Look up correct option from MODULES curriculum
        mod = next((m for m in MODULES if m["id"] == module_id), None)
        if not mod or "quiz" not in mod:
            return jsonify({"success": False, "error": "Quiz not found"}), 404

        correct_option = mod["quiz"]["correct"]
        if passed is not None:
            is_correct = bool(passed)
        elif selected_option is not None:
            is_correct = (int(selected_option) == correct_option)
        else:
            is_correct = False

        score = 10 if is_correct else 0
        max_score = 10
        sel_idx = int(selected_option) if selected_option is not None else (correct_option if is_correct else -1)

        res = record_quiz_attempt(
            g.current_user["id"],
            module_id,
            score,
            max_score,
            sel_idx,
            is_correct
        )
        res["explanation"] = mod["quiz"]["explanation"]
        return jsonify(res)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/learner/challenge-attempt", methods=["POST"])
@login_required
def submit_challenge_attempt():
    """Evaluates challenge circuit and records attempt for learner."""
    try:
        payload = request.get_json(force=True) or {}
        challenge_id = payload.get("challenge_id", "")
        circuit_data = payload.get("circuit") or payload.get("circuit_data") or {}
        
        # Check if circuit data was supplied for verification
        if circuit_data and circuit_data.get("steps"):
            result = quantum_engine.verify_challenge(challenge_id, circuit_data)
            passed = result.get("passed", False)
            score = result.get("score", 0)
        else:
            passed = payload.get("status") in ["passed", "completed"] or bool(payload.get("passed", False))
            score = int(payload.get("score", 100 if passed else 25))
            result = {
                "passed": passed,
                "score": score,
                "message": "Challenge solved successfully!" if passed else "Challenge attempt recorded."
            }

        record_challenge_attempt(
            g.current_user["id"],
            challenge_id,
            passed,
            score,
            circuit_data
        )

        return jsonify({"success": True, "result": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -------------------------------------------------------------
# Saved Quantum Circuits API Endpoints
# -------------------------------------------------------------

@app.route("/api/circuits", methods=["GET"])
@login_required
def list_circuits():
    """Returns only the authenticated learner's private saved circuits."""
    circuits = get_saved_circuits(g.current_user["id"])
    return jsonify({
        "success": True,
        "circuits": circuits
    })


@app.route("/api/circuits", methods=["POST"])
@login_required
def create_circuit():
    """Saves a new quantum circuit for the learner."""
    try:
        data = request.get_json(force=True) or {}
        name = data.get("name", "").strip()
        circuit_data = data.get("circuit_data") or {}
        steps = data.get("steps") or circuit_data.get("steps", [])
        qubits = int(data.get("qubits") or circuit_data.get("qubits", 2))
        description = data.get("description", "").strip()
        python_code = data.get("python_code", "")

        ok, msg, circuit = save_circuit(
            g.current_user["id"],
            name,
            qubits,
            steps,
            description,
            python_code
        )
        if not ok:
            return jsonify({"success": False, "error": msg}), 400

        return jsonify({
            "success": True,
            "message": msg,
            "circuit": circuit,
            "circuit_id": circuit["id"] if circuit else None
        }), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/circuits/<int:circuit_id>", methods=["PUT"])
@login_required
def update_circuit(circuit_id):
    """Updates an existing saved circuit belonging to learner."""
    try:
        data = request.get_json(force=True) or {}
        name = data.get("name", "").strip()
        qubits = int(data.get("qubits", 2))
        steps = data.get("steps", [])
        description = data.get("description", "").strip()
        python_code = data.get("python_code", "")

        ok, msg = update_saved_circuit(
            g.current_user["id"],
            circuit_id,
            name,
            qubits,
            steps,
            description,
            python_code
        )
        if not ok:
            return jsonify({"success": False, "error": msg}), 403

        return jsonify({"success": True, "message": msg})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/circuits/<int:circuit_id>", methods=["DELETE"])
@login_required
def delete_circuit(circuit_id):
    """Deletes a saved circuit belonging to learner."""
    try:
        ok, msg = delete_saved_circuit(g.current_user["id"], circuit_id)
        if not ok:
            return jsonify({"success": False, "error": msg}), 403

        return jsonify({"success": True, "message": msg})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -------------------------------------------------------------
# Quantum Simulation & Curriculum Public Endpoints
# -------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    """Returns server, database, and quantum backend status."""
    return jsonify({
        "status": "healthy",
        "service": "QuBitLab AI Server",
        "qiskit_version": getattr(qiskit, "__version__", "2.x"),
        "backend": "Qiskit Aer Simulator",
        "database": "SQLite Relational Store",
        "has_genai": ai_tutor.get_api_client() is not None
    })


@app.route("/api/curriculum", methods=["GET"])
def get_curriculum():
    """Returns interactive learning curriculum modules."""
    return jsonify({
        "success": True,
        "modules": MODULES
    })


@app.route("/api/presets", methods=["GET"])
def get_presets():
    """Returns preset circuit templates."""
    return jsonify({
        "success": True,
        "presets": PRESETS
    })


@app.route("/api/challenges", methods=["GET"])
def get_challenges():
    """Returns quantum challenges."""
    return jsonify({
        "success": True,
        "challenges": CHALLENGES
    })


@app.route("/api/simulate", methods=["POST"])
def simulate_circuit():
    """
    Simulates quantum circuit via Qiskit Aer and returns counts,
    probabilities, statevectors, and Bloch coordinates.
    """
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"success": False, "error": "Missing circuit payload"}), 400

        result = quantum_engine.simulate(data)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/optimize", methods=["POST"])
def optimize_circuit():
    """Analyzes circuit for gate cancellations and depth optimizations."""
    try:
        data = request.get_json(force=True)
        result = quantum_engine.optimize_circuit(data)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/verify-challenge", methods=["POST"])
def verify_challenge():
    """Verifies a learner's challenge circuit against objective criteria."""
    try:
        payload = request.get_json(force=True)
        challenge_id = payload.get("challenge_id", "")
        circuit_data = payload.get("circuit", {})

        result = quantum_engine.verify_challenge(challenge_id, circuit_data)

        # If user is logged in, also record in their persistent history
        user = get_authenticated_user()
        if user:
            record_challenge_attempt(
                user["id"],
                challenge_id,
                result.get("passed", False),
                result.get("score", 0),
                circuit_data
            )

        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/run-code", methods=["POST"])
def run_python_code():
    """
    Executes Python Qiskit code in a sandboxed subprocess and captures stdout/stderr.
    """
    try:
        payload = request.get_json(force=True)
        code = payload.get("code", "").strip()

        if not code:
            return jsonify({"success": False, "output": "No Python code provided."})

        # Basic security guardrail for execution
        forbidden_tokens = ["import os", "import sys", "import subprocess", "import shutil", "__import__", "eval(", "exec("]
        for token in forbidden_tokens:
            if token in code and "qiskit" not in token:
                return jsonify({
                    "success": False,
                    "output": f"Security restriction: '{token}' is disallowed in sandbox execution."
                })

        # Run via subprocess using current Python interpreter with a 7 second timeout
        proc = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=7,
            encoding="utf-8",
            errors="replace"
        )

        output = proc.stdout
        if proc.stderr:
            output += "\n[Standard Error / Warnings]:\n" + proc.stderr

        return jsonify({
            "success": proc.returncode == 0,
            "output": output or "(Code executed successfully with no output)"
        })

    except subprocess.TimeoutExpired:
        return jsonify({"success": False, "output": "Execution timed out (7s limit reached)."})
    except Exception as e:
        return jsonify({"success": False, "output": f"Execution error: {str(e)}"})


@app.route("/api/ai-tutor", methods=["POST"])
def consult_ai_tutor():
    """Contextual AI Quantum Tutor endpoint with lightweight learner activity logging."""
    try:
        payload = request.get_json(force=True)
        response = ai_tutor.query(payload)

        # If user is authenticated, record lightweight learning context
        user = get_authenticated_user()
        if user:
            mode = payload.get("mode", "chat")
            topic = payload.get("topic", "Quantum Fundamentals")
            user_msg = payload.get("user_message", "")
            circ = payload.get("circuit", {})
            circ_desc = f"{circ.get('qubits', 2)} qubits"
            log_ai_activity(user["id"], mode, topic, user_msg, circ_desc)

        return jsonify(response)
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "response": f"AI Tutor encountered an unexpected issue: {str(e)}"
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"============================================================")
    print(f"🚀 QuBitLab AI Server starting on http://localhost:{port}")
    print(f"⚛️ Quantum Backend: Qiskit Aer {getattr(qiskit, '__version__', '2.x')}")
    print(f"💾 Learner Database: SQLite (qubitlab.db)")
    print(f"🔒 Auth & Persistence: Active")
    print(f"============================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
