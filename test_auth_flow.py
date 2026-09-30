import urllib.request
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def post(url, data, token=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
    if token: req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode())

def get(url, token=None):
    req = urllib.request.Request(url)
    if token: req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode())

ts = int(time.time())
ada_email = f"ada_{ts}@quantum.edu"
max_email = f"max_{ts}@quantum.edu"

print("Testing QuBitLab Learner Auth & Persistence System...")

# 1. Register User 1: Ada Lovelace
print(f"\n[Step 1] Register User 1: Ada Lovelace ({ada_email})")
r1 = post("http://localhost:5000/api/auth/register", {
    "name": "Ada Lovelace",
    "identity": ada_email,
    "password": "QuantumPassword123!",
    "confirm_password": "QuantumPassword123!"
})
print("Register response:", r1)
assert r1.get("success"), f"Registration failed: {r1}"
token_ada = r1["token"]

# 2. Verify Ada's initial dashboard
print("\n[Step 2] Check Ada's Initial Dashboard")
d1 = get("http://localhost:5000/api/learner/dashboard", token_ada)
print("Initial metrics:", d1["dashboard"]["metrics"])
assert d1["dashboard"]["metrics"]["modules_completed"] == 0
assert d1["dashboard"]["metrics"]["saved_circuits"] == 0

# 3. Ada takes Superposition Quiz
print("\n[Step 3] Ada Takes Quiz (10/10)")
q1 = post("http://localhost:5000/api/learner/quiz-attempt", {
    "module_id": "superposition",
    "score": 10,
    "max_score": 10,
    "passed": True
}, token_ada)
print("Quiz response:", q1)
assert q1.get("success")

# 4. Ada saves Quantum Circuit
print("\n[Step 4] Ada Saves Circuit: 'Ada Entangled Bell Pair'")
c1 = post("http://localhost:5000/api/circuits", {
    "name": "Ada Entangled Bell Pair",
    "qubits": 2,
    "gates_count": 2,
    "circuit_data": {
        "qubits": 2,
        "steps": [
            [{"gate": "H", "qubit": 0}],
            [{"gate": "CX", "control": 0, "target": 1}]
        ]
    },
    "description": "Bell state |Phi+> synthesized with H + CX"
}, token_ada)
print("Save circuit response:", c1)
assert c1.get("success")
ada_circuit_id = c1.get("circuit_id") or c1["circuit"]["id"]

# 5. Ada Solves Bell State Challenge
print("\n[Step 5] Ada Solves Challenge: 'bell_state_phi_plus'")
ch1 = post("http://localhost:5000/api/learner/challenge-attempt", {
    "challenge_id": "bell_state_phi_plus",
    "status": "passed",
    "score": 100,
    "circuit_json": "{}"
}, token_ada)
print("Challenge response:", ch1)
assert ch1.get("success")

# 6. Verify Ada's updated dashboard
print("\n[Step 6] Check Ada's Updated Dashboard")
d2 = get("http://localhost:5000/api/learner/dashboard", token_ada)
m2 = d2["dashboard"]["metrics"]
print("Updated metrics:", m2)
print("Recent activity:", [a["title"] for a in d2["dashboard"]["recent_activity"]])
assert m2["modules_completed"] == 1
assert m2["challenges_completed"] == 1
assert m2["saved_circuits"] == 1
assert m2["quiz_average"] == 100.0

# 7. Register User 2: Max Planck (Verify Isolation)
print("\n[Step 7] Register User 2: Max Planck (Testing Isolation)")
r2 = post("http://localhost:5000/api/auth/register", {
    "name": "Max Planck",
    "identity": max_email,
    "password": "QuantaPassword456!",
    "confirm_password": "QuantaPassword456!"
})
print("Max register response:", r2)
assert r2.get("success")
token_max = r2["token"]

# 8. Verify Max Planck's isolated clean state
print("\n[Step 8] Check Max Planck's Dashboard (Must NOT see Ada's data)")
d_max = get("http://localhost:5000/api/learner/dashboard", token_max)
m_max = d_max["dashboard"]["metrics"]
print("Max metrics:", m_max)
assert m_max["modules_completed"] == 0, "Isolation failure: Max saw completed modules!"
assert m_max["challenges_completed"] == 0, "Isolation failure: Max saw completed challenges!"
assert m_max["saved_circuits"] == 0, "Isolation failure: Max saw saved circuits!"
max_circuits = get("http://localhost:5000/api/circuits", token_max)["circuits"]
assert len(max_circuits) == 0, "Isolation failure: Max saw Ada's saved circuits!"
print("User isolation verified! Max Planck has 0 modules, 0 circuits, 0 challenges.")

# 9. Ada re-logins and verifies complete session persistence
print("\n[Step 9] Ada Logs Out and Logs Back In (Testing Persistence)")
l1 = post("http://localhost:5000/api/auth/login", {
    "identity": ada_email,
    "password": "QuantumPassword123!"
})
assert l1.get("success"), f"Ada login failed: {l1}"
token_ada_relogin = l1["token"]

d3 = get("http://localhost:5000/api/learner/dashboard", token_ada_relogin)
m3 = d3["dashboard"]["metrics"]
print("Ada metrics after relogin:", m3)
assert m3["modules_completed"] == 1
assert m3["challenges_completed"] == 1
assert m3["saved_circuits"] == 1
assert m3["quiz_average"] == 100.0

ada_circuits = get("http://localhost:5000/api/circuits", token_ada_relogin)["circuits"]
assert len(ada_circuits) == 1
assert ada_circuits[0]["name"] == "Ada Entangled Bell Pair"
print("Ada's saved circuit persists:", ada_circuits[0]["name"])

print("\nALL 9 TEST CRITERIA PASSED WITH 100% SUCCESS!")
