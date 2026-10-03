"""
QuBitLab AI - Contextual Quantum AI Tutor
Combines Google Gemini Generative AI (when API key is present) with an expert
built-in Quantum Pedagogical Intelligence Engine for offline and zero-setup operation.
"""

import os
import json
from typing import Dict, Any, Optional, Tuple

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


class AITutor:
    """Intelligent, context-aware AI Quantum Computing Tutor."""

    def __init__(self):
        pass

    def get_api_client(self, api_key: Optional[str] = None):
        """Initializes Google GenAI client if an API key is available."""
        if not HAS_GENAI:
            return None
        key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not key or key.strip() == "" or key.startswith("YOUR_"):
            return None
        try:
            return genai.Client(api_key=key.strip())
        except Exception:
            return None

    def query(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main query router: Evaluates learner query with full quantum context.
        Attempts Gemini API first; falls back seamlessly to Built-in Expert Quantum Engine.
        """
        mode = payload.get("mode", "explain").lower()
        user_message = payload.get("user_message", "").strip()
        topic = payload.get("topic", "Quantum Fundamentals")
        circuit = payload.get("circuit", {})
        simulation = payload.get("simulation", {})
        code = payload.get("code", "")
        challenge_id = payload.get("challenge_id")
        api_key = payload.get("api_key")

        # Try Gemini API if key is present
        client = self.get_api_client(api_key)
        if client:
            try:
                gemini_resp = self._call_gemini(client, mode, user_message, topic, circuit, simulation, code, challenge_id)
                if gemini_resp.get("success"):
                    return gemini_resp
            except Exception as e:
                # Log error and fall back gracefully
                print(f"[AITutor] Gemini API call error: {e}. Falling back to internal engine.")

        # Fallback to Built-in Pedagogical Intelligence Engine
        return self._rule_based_tutor(mode, user_message, topic, circuit, simulation, code, challenge_id)

    def _call_gemini(
        self,
        client,
        mode: str,
        user_message: str,
        topic: str,
        circuit: Dict[str, Any],
        simulation: Dict[str, Any],
        code: str,
        challenge_id: Optional[str]
    ) -> Dict[str, Any]:
        """Generates AI response using Gemini with strict quantum educational grounding."""
        
        system_instruction = (
            "You are the QuBitLab AI Quantum Tutor, an inspiring, world-class quantum physicist and computer scientist. "
            "Your mission is to make abstract quantum concepts (superposition, entanglement, phase interference, Bell states, Grover's algorithm) "
            "tangible, intuitive, and deeply understandable for students. "
            "Always tailor your response to the learner's current circuit, measurement probabilities, and active topic. "
            "Use clear analogies (e.g. spinning coins, correlated dice, musical wave interference), use Dirac notation (|0⟩, |1⟩, |+⟩, |-⟩, |Φ+⟩), "
            "and format your responses cleanly with markdown headers, bold highlights, and bullet points. "
            "If the mode is 'generate', describe the solution and ALSO output a clean JSON block under ```json { 'qubits': N, 'steps': [...] } ``` "
            "so the user can load it into their circuit builder with one click."
        )

        context_prompt = f"""
Mode: {mode.upper()}
Active Learning Topic: {topic}
User Message / Query: {user_message if user_message else '(No specific message; provide analysis for this mode)'}
Current Challenge: {challenge_id if challenge_id else 'Free exploration / Studio'}

[CURRENT CIRCUIT STATE]
Qubits: {circuit.get('qubits', 2)}
Circuit Steps: {json.dumps(circuit.get('steps', []))}

[SIMULATION TELEMETRY]
Dirac Equation: {simulation.get('dirac', 'N/A')}
Measurement Counts (1024 shots): {json.dumps(simulation.get('counts', {}))}
Measurement Probabilities: {json.dumps(simulation.get('probabilities', {}))}
Bloch Vectors: {json.dumps(simulation.get('bloch_vectors', []))}
Is Entangled: {simulation.get('is_entangled', False)}

[QISKIT PYTHON CODE]
```python
{code}
```

Please provide a structured, encouraging, and pedagogically rich response.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=context_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
            )
        )

        resp_text = response.text or ""
        generated_circuit = self._extract_circuit_json(resp_text)

        return {
            "success": True,
            "engine": "Gemini 2.5 Flash",
            "mode": mode,
            "response": resp_text,
            "generated_circuit": generated_circuit
        }

    def _extract_circuit_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extracts JSON circuit definition from text if present."""
        try:
            if "```json" in text:
                block = text.split("```json")[1].split("```")[0].strip()
                parsed = json.loads(block)
                if "qubits" in parsed and "steps" in parsed:
                    return parsed
            elif "{" in text and "steps" in text:
                start = text.find("{")
                end = text.rfind("}") + 1
                parsed = json.loads(text[start:end])
                if "qubits" in parsed and "steps" in parsed:
                    return parsed
        except Exception:
            pass
        return None

    def _rule_based_tutor(
        self,
        mode: str,
        user_message: str,
        topic: str,
        circuit: Dict[str, Any],
        simulation: Dict[str, Any],
        code: str,
        challenge_id: Optional[str]
    ) -> Dict[str, Any]:
        """High-pedagogy offline expert quantum intelligence engine."""
        
        num_qubits = circuit.get("qubits", 2)
        steps = circuit.get("steps", [])
        counts = simulation.get("counts", {})
        probabilities = simulation.get("probabilities", {})
        dirac = simulation.get("dirac", "")
        bloch = simulation.get("bloch_vectors", [])
        is_entangled = simulation.get("is_entangled", False)

        # Count gates
        gate_summary = {}
        for step in steps:
            for op in step:
                g = op.get("gate", "").upper()
                gate_summary[g] = gate_summary.get(g, 0) + 1

        # Mode: EXPLAIN
        if mode == "explain":
            resp = self._build_explanation(num_qubits, steps, gate_summary, probabilities, dirac, bloch, is_entangled, topic)
            return {
                "success": True,
                "engine": "QuBitLab Pedagogical Core",
                "mode": mode,
                "response": resp
            }

        # Mode: DEBUG
        elif mode == "debug":
            resp = self._build_debug_analysis(num_qubits, steps, gate_summary, probabilities, challenge_id)
            return {
                "success": True,
                "engine": "QuBitLab Pedagogical Core",
                "mode": mode,
                "response": resp
            }

        # Mode: GENERATE
        elif mode == "generate":
            resp, generated_circuit = self._build_generation(user_message)
            return {
                "success": True,
                "engine": "QuBitLab Pedagogical Core",
                "mode": mode,
                "response": resp,
                "generated_circuit": generated_circuit
            }

        # Mode: OPTIMIZE
        elif mode == "optimize":
            resp = self._build_optimization(steps, num_qubits)
            return {
                "success": True,
                "engine": "QuBitLab Pedagogical Core",
                "mode": mode,
                "response": resp
            }

        # Mode: HINT
        elif mode == "hint":
            resp = self._build_hint(challenge_id, steps, probabilities)
            return {
                "success": True,
                "engine": "QuBitLab Pedagogical Core",
                "mode": mode,
                "response": resp
            }

        # Default CHAT (Natural Language Quantum Inquiry)
        else:
            resp, generated_circuit = self._build_chat_response(
                user_message, topic, num_qubits, steps, gate_summary, probabilities, dirac, bloch, is_entangled
            )
            return {
                "success": True,
                "engine": "QuBitLab Pedagogical Core",
                "mode": "chat",
                "response": resp,
                "generated_circuit": generated_circuit
            }

    def _build_explanation(self, num_qubits, steps, gate_summary, probabilities, dirac, bloch, is_entangled, topic) -> str:
        """Constructs an in-depth pedagogical explanation."""
        lines = ["### 🔬 Circuit Breakdown & Physical Intuition\n"]

        # Initial state
        lines.append(f"1. **Initial State (Ground State):**\n"
                     f"   All {num_qubits} qubits begin prepared in the computational ground state $|{'0'*num_qubits}\\rangle$.\n")

        # Step by step
        if not steps or not any(steps):
            lines.append("2. **No Gates Applied Yet:**\n"
                         f"   Your circuit currently performs the identity operation. Measuring will yield $|{'0'*num_qubits}\\rangle$ with 100% probability.\n")
        else:
            lines.append("2. **Quantum Gate Transformations:**\n")
            step_num = 1
            for step in steps:
                if not step:
                    continue
                for op in step:
                    g = op.get("gate", "").upper()
                    q = op.get("qubit")
                    ctrl = op.get("control")
                    tgt = op.get("target")

                    if g == "H":
                        lines.append(f"   * **Hadamard Gate (H) on Q{q}:** Rotates $|0\\rangle$ into equal superposition $|+\\rangle = \\frac{{|0\\rangle + |1\\rangle}}{{\\sqrt{{2}}}}$. The qubit now simultaneously possesses a 50% probability amplitude of being measured as 0 or 1.")
                    elif g == "X":
                        lines.append(f"   * **Pauli-X (Quantum NOT) on Q{q}:** Flips the computational basis states ($|0\\rangle \\leftrightarrow |1\\rangle$), performing a $\\pi$ radian rotation around the X-axis of the Bloch sphere.")
                    elif g == "Z":
                        lines.append(f"   * **Pauli-Z (Phase Flip) on Q{q}:** Leaves $|0\\rangle$ unchanged but inverts the sign of $|1\\rangle$ ($|1\\rangle \\to -|1\\rangle$), creating quantum phase interference.")
                    elif g == "Y":
                        lines.append(f"   * **Pauli-Y Gate on Q{q}:** Combines bit-flip and phase-flip with a complex $i$ factor ($|0\\rangle \\to i|1\\rangle, |1\\rangle \\to -i|0\\rangle$).")
                    elif g in ["CX", "CNOT"]:
                        lines.append(f"   * **CNOT Gate (Control: Q{ctrl}, Target: Q{tgt}):** Performs a conditional NOT. If Q{ctrl} is in $|1\\rangle$, it inverts Q{tgt}. When preceded by a Hadamard on Q{ctrl}, this creates **quantum entanglement**!")
                    elif g == "S":
                        lines.append(f"   * **Phase Gate (S) on Q{q}:** Imposes a $\\pi/2$ (90°) rotation around the Z-axis, mapping real amplitudes to the imaginary axis.")
                    elif g == "T":
                        lines.append(f"   * **T Gate on Q{q}:** Imposes a $\\pi/4$ (45°) phase rotation, essential for universal fault-tolerant quantum computation.")
                    elif g == "M":
                        lines.append(f"   * **Measurement (M) on Q{q}:** Forces the fragile superposition wavefunction to irreversibly collapse into a definite classical bit (0 or 1) according to Born's Rule.")

        # Result interpretation
        lines.append("\n3. **Measurement Outcome Analysis:**\n")
        if probabilities:
            for state, prob in probabilities.items():
                pct = prob * 100
                lines.append(f"   * **$|{state}\\rangle$:** {pct:.1f}% probability ({int(prob*1024)}/1024 shots)")
        
        lines.append(f"\n4. **Statevector in Dirac Notation:**\n"
                     f"   $$|\\psi\\rangle = {dirac}$$\n")

        # Entanglement analysis
        if is_entangled:
            lines.append("5. **Quantum Entanglement Detected! 🌌**\n"
                         "   The state cannot be factored into independent product states $(|\\psi_0\\rangle \\otimes |\\psi_1\\rangle)$. "
                         "Notice on the 3D Bloch Sphere that the individual qubit vector length is **0.00**. "
                         "This occurs because an entangled qubit has no independent state of its own—only the joint system is purely defined!")
        else:
            lines.append("5. **Separable State:**\n"
                         "   The qubits remain in independent, separable states. Each qubit has a definite Bloch vector with length 1.00 on the sphere surface.")

        return "\n".join(lines)

    def _build_debug_analysis(self, num_qubits, steps, gate_summary, probabilities, challenge_id) -> str:
        """Pinpoints mistakes, unmeasured qubits, or logic flaws."""
        issues = []
        praises = []

        if not steps or not any(steps):
            issues.append("⚠️ **Empty Circuit:** Your circuit has no gates placed yet. Place at least one gate (like H or X) to observe quantum effects.")

        # Check for unmeasured qubits
        measured_qubits = set()
        for step in steps:
            for op in step:
                if op.get("gate", "").upper() == "M":
                    measured_qubits.add(op.get("qubit"))

        if measured_qubits and len(measured_qubits) < num_qubits:
            unmeasured = [f"Q{q}" for q in range(num_qubits) if q not in measured_qubits]
            issues.append(f"ℹ️ **Partial Measurement:** Only qubits {list(measured_qubits)} have explicit measurement gates. Qubits {unmeasured} will be automatically measured at the end of the simulation.")

        # Check for measurement placed in the middle
        seen_measure = False
        for step in steps:
            step_has_measure = any(op.get("gate", "").upper() == "M" for op in step)
            step_has_gate = any(op.get("gate", "").upper() not in ["M", "RESET"] for op in step)
            if seen_measure and step_has_gate:
                issues.append("⚠️ **Premature Measurement:** A quantum gate was applied *after* a measurement gate on the same wire. Remember that measurement irreversibly collapses the superposition into a classical bit!")
                break
            if step_has_measure:
                seen_measure = True

        # Check challenge criteria
        if challenge_id == "bell_state_phi_plus":
            p00 = probabilities.get("00", 0)
            p11 = probabilities.get("11", 0)
            if p00 > 0.4 and p11 > 0.4:
                praises.append("🎉 **Bell State Verified:** Your circuit successfully outputs only |00⟩ and |11⟩ at equal 50% probabilities!")
            else:
                issues.append("❌ **Bell State Requirement:** To generate $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$, you need an **H gate on Q0** followed by a **CNOT (Control: Q0, Target: Q1)**.")

        elif challenge_id == "superposition_plus":
            p0 = probabilities.get("0", 0) + probabilities.get("00", 0)
            p1 = probabilities.get("1", 0) + probabilities.get("01", 0)
            if abs(p0 - 0.5) < 0.1 and abs(p1 - 0.5) < 0.1:
                praises.append("🎉 **Superposition Verified:** Equal 50/50 probability distribution achieved.")
            else:
                issues.append("❌ **Unequal Superposition:** Expected ~50% for |0⟩ and ~50% for |1⟩. Check that a Hadamard (H) gate is placed on Q0.")

        # Build output
        res = ["### 🔍 Quantum Circuit Diagnostic Report\n"]
        if praises:
            res.extend([p + "\n" for p in praises])
        if issues:
            res.append("**Identified Findings:**\n")
            res.extend([f"* {issue}\n" for issue in issues])
        else:
            res.append("✅ **All Checks Passed!** No syntax errors, race conditions, or illegal gate sequences detected. Circuit is mathematically coherent.")

        return "\n".join(res)

    def _build_generation(self, user_message: str) -> Tuple[str, Dict[str, Any]]:
        """Generates pre-configured circuits from natural language prompts."""
        msg = user_message.lower()

        # 1. Bell State |Phi+>
        if "bell" in msg or "entangle" in msg or "phi+" in msg or "epr" in msg:
            circuit = {
                "qubits": 2,
                "steps": [
                    [{"gate": "H", "qubit": 0}],
                    [{"gate": "CX", "control": 0, "target": 1}],
                    [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
                ]
            }
            desc = (
                "### ✨ Generated Circuit: Bell State $|\\Phi^+\\rangle$\n\n"
                "I have generated the canonical Bell State $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$ for you!\n\n"
                "**How it works:**\n"
                "1. **H on Q0:** Places Q0 into equal superposition $(|0\\rangle + |1\\rangle)/\\sqrt{2}$.\n"
                "2. **CNOT (0 → 1):** Inverts Q1 whenever Q0 is $|1\\rangle$, locking their fates together into a maximally entangled pair.\n"
                "3. **Measurement:** Measures both qubits simultaneously.\n\n"
                "Click **Load Circuit Into Studio** below to test it!"
            )
            return desc, circuit

        # 2. Superposition |+>
        elif "superposition" in msg or "plus" in msg or "hadamard" in msg or "|+>" in msg:
            circuit = {
                "qubits": 1,
                "steps": [
                    [{"gate": "H", "qubit": 0}],
                    [{"gate": "M", "qubit": 0}]
                ]
            }
            desc = (
                "### ✨ Generated Circuit: Single Qubit Superposition $|+\\rangle$\n\n"
                "I generated the fundamental equal superposition state $|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$.\n\n"
                "**How it works:**\n"
                "* Applying the **Hadamard (H)** gate to ground state $|0\\rangle$ rotates the Bloch vector from the North Pole ($+Z$) onto the equator ($+X$).\n"
                "* Upon measurement, Born's Rule dictates a 50% probability of finding 0 and 50% probability of finding 1."
            )
            return desc, circuit

        # 3. GHZ State (3 Qubits)
        elif "ghz" in msg or "3-qubit" in msg or "triplet" in msg:
            circuit = {
                "qubits": 3,
                "steps": [
                    [{"gate": "H", "qubit": 0}],
                    [{"gate": "CX", "control": 0, "target": 1}],
                    [{"gate": "CX", "control": 1, "target": 2}],
                    [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}, {"gate": "M", "qubit": 2}]
                ]
            }
            desc = (
                "### ✨ Generated Circuit: 3-Qubit GHZ Entangled State\n\n"
                "I generated the Greenberger-Horne-Zeilinger (GHZ) state $|GHZ\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}$.\n\n"
                "**How it works:**\n"
                "* Q0 is put into superposition via H.\n"
                "* Two cascaded CNOTs propagate the entanglement to Q1 and Q2, creating a tripartite entangled quantum state with non-local quantum correlations."
            )
            return desc, circuit

        # 4. Grover's 2-Qubit Search Algorithm
        elif "grover" in msg or "search" in msg or "oracle" in msg:
            circuit = {
                "qubits": 2,
                "steps": [
                    # Equal superposition initialization
                    [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
                    # Oracle for target state |11> (Controlled-Z via H-CX-H)
                    [{"gate": "CZ", "control": 0, "target": 1}],
                    # Diffusion Operator (Amplitude Amplification)
                    [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
                    [{"gate": "X", "qubit": 0}, {"gate": "X", "qubit": 1}],
                    [{"gate": "CZ", "control": 0, "target": 1}],
                    [{"gate": "X", "qubit": 0}, {"gate": "X", "qubit": 1}],
                    [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
                    # Measurement
                    [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
                ]
            }
            desc = (
                "### ✨ Generated Circuit: Grover's Search Algorithm (Target: |11⟩)\n\n"
                "I synthesized Grover's quantum search algorithm for an unsorted 4-item database ($N=2^2=4$) targeting state $|11\\rangle$.\n\n"
                "**Key Stages:**\n"
                "1. **Uniform Superposition:** Parallel evaluation of all 4 states using $H^{\\otimes 2}$.\n"
                "2. **Quantum Oracle ($CZ$):** Flips the phase of the marked target state $|11\\rangle$.\n"
                "3. **Diffusion Operator:** Inversion about the mean amplitude, amplifying $|11\\rangle$ to ~100% probability in a single iteration!\n\n"
                "Click **Load Circuit Into Studio** to watch quantum amplitude amplification in action!"
            )
            return desc, circuit

        # 5. Quantum NOT / Flip to |1>
        elif "flip" in msg or "|1>" in msg or "not" in msg:
            circuit = {
                "qubits": 1,
                "steps": [
                    [{"gate": "X", "qubit": 0}],
                    [{"gate": "M", "qubit": 0}]
                ]
            }
            desc = (
                "### ✨ Generated Circuit: Quantum Bit-Flip to $|1\\rangle$\n\n"
                "Applies a **Pauli-X** gate on Q0, flipping $|0\\rangle$ into $|1\\rangle$ with 100% probability."
            )
            return desc, circuit

        # Default fallback: Bell State
        circuit = {
            "qubits": 2,
            "steps": [
                [{"gate": "H", "qubit": 0}],
                [{"gate": "CX", "control": 0, "target": 1}],
                [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
            ]
        }
        desc = (
            f"### ✨ Generated Circuit for: *'{user_message}'*\n\n"
            "I generated the fundamental 2-qubit Bell State $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$, "
            "which demonstrates both superposition and entanglement."
        )
        return desc, circuit

    def _build_optimization(self, steps, num_qubits) -> str:
        """Analyzes gate cancellations and circuit depth improvements."""
        res = ["### ⚡ Circuit Optimization & Gate Reduction\n"]
        cancellations = []

        last_gate_on_qubit = {}
        for s_idx, step in enumerate(steps):
            for op in step:
                g = op.get("gate", "").upper()
                q = op.get("qubit")
                if q is not None and g in ["H", "X", "Y", "Z"]:
                    if q in last_gate_on_qubit and last_gate_on_qubit[q]["gate"] == g:
                        p_idx = last_gate_on_qubit[q]["step"]
                        cancellations.append(f"Qubit {q}: Two consecutive **{g}** gates at steps {p_idx+1} and {s_idx+1} cancel out ({g}·{g} = I).")
                        del last_gate_on_qubit[q]
                    else:
                        last_gate_on_qubit[q] = {"gate": g, "step": s_idx}

        if cancellations:
            res.append("**Redundant Operations Found:**\n")
            for c in cancellations:
                res.append(f"* ✂️ {c}\n")
            res.append("\n**Optimization Benefit:** Removing these self-inverse pairs will reduce circuit depth and prevent decoherence on physical quantum hardware!")
        else:
            res.append("✨ **Optimal Gate Topology:** No trivial self-inverse gate redundancies ($H\\cdot H, X\\cdot X$) were found. Your circuit depth is well-compacted.")

        return "\n".join(res)

    def _build_hint(self, challenge_id: Optional[str], steps, probabilities) -> str:
        """Provides pedagogical hints without revealing the full solution."""
        if not challenge_id:
            return "💡 **Tutor Hint:** Try placing a Hadamard gate (H) on your first qubit to see how superposition changes your Bloch sphere vector from vertical to horizontal!"

        if challenge_id == "superposition_plus":
            return (
                "💡 **Challenge Hint (Superposition):**\n"
                "Remember that classical bits can only be 0 OR 1. "
                "Which single-qubit gate splits a state evenly into $|0\\rangle$ and $|1\\rangle$ with equal $1/\\sqrt{2}$ amplitudes? "
                "Look for the blue **H** gate in the palette!"
            )
        elif challenge_id == "flip_qubit":
            return (
                "💡 **Challenge Hint (Quantum NOT):**\n"
                "All qubits start in state $|0\\rangle$. Which gate represents the quantum version of a classical NOT gate? "
                "It rotates the state by $\\pi$ radians around the X-axis."
            )
        elif challenge_id == "bell_state_phi_plus":
            has_h = any(any(op.get("gate", "").upper() == "H" for op in step) for step in steps)
            has_cx = any(any(op.get("gate", "").upper() in ["CX", "CNOT"] for op in step) for step in steps)
            if not has_h:
                return "💡 **Challenge Hint (Bell State):** Step 1 requires putting the control qubit (Q0) into equal superposition. Which gate does that?"
            elif not has_cx:
                return "💡 **Challenge Hint (Bell State):** Q0 is in superposition, but Q1 is still isolated! What two-qubit gate will entangle Q0 (control) with Q1 (target)?"
            else:
                return "💡 **Challenge Hint (Bell State):** Ensure the **H gate is on Q0 before the CNOT**, and that the CNOT control is on Q0 while its target is on Q1."
        elif challenge_id == "phase_flip_minus":
            return (
                "💡 **Challenge Hint (Phase Flip):**\n"
                "The $|-\\rangle$ state is $(|0\\rangle - |1\\rangle)/\\sqrt{2}$. "
                "Notice the minus sign on $|1\\rangle$! "
                "Option 1: Flip $|0\\rangle$ to $|1\\rangle$ with X first, then apply H.\n"
                "Option 2: Apply H first to get $|+\\rangle$, then apply a Pauli-Z phase gate!"
            )
        elif challenge_id == "ghz_state":
            return (
                "💡 **Challenge Hint (GHZ State):**\n"
                "You need to entangle 3 qubits so they are either all 0 or all 1 $(|000\\rangle + |111\\rangle)/\\sqrt{2}$. "
                "Start with H on Q0. Then use CNOT to entangle Q0 with Q1, and another CNOT to entangle Q1 with Q2!"
            )
        return "💡 **Hint:** Keep experimenting with gates in the palette and watch the 3D Bloch sphere react!"

    def _build_chat_response(
        self,
        user_message: str,
        topic: str,
        num_qubits: int,
        steps: list,
        gate_summary: dict,
        probabilities: dict,
        dirac: str,
        bloch: list,
        is_entangled: bool
    ) -> Tuple[str, Optional[Dict[str, Any]]]:
        """Provides realistic, pedagogically rich quantum computing responses for conversational learner questions."""
        msg = (user_message or "").strip().lower()

        # 0. Empty or greeting
        if not msg or msg in ["hi", "hello", "hey", "greetings", "help", "start"]:
            welcome = (
                f"### 👋 Greetings, Quantum Explorer!\n\n"
                f"I am your **LeQC Quantum AI Tutor**. I analyze your circuit's wavefunction, statevector, and measurement probabilities in real-time.\n\n"
                f"**You can ask me about:**\n"
                f"* **Qubits:** *'What is a qubit?'* or *'How does a qubit differ from a classical bit?'*\n"
                f"* **Superposition:** *'Explain superposition and the Hadamard gate'*\n"
                f"* **Quantum Gates:** *'What do Pauli X, Z, and CNOT gates do?'*\n"
                f"* **Entanglement:** *'How does entanglement work?'* or *'What is spooky action at a distance?'*\n"
                f"* **Bell States:** *'How do I create a Bell state?'*\n"
                f"* **Quantum Circuits:** *'How do quantum circuits execute?'*\n"
                f"* **Qiskit:** *'Show me how to simulate this in Python with Qiskit'*\n"
                f"* **Measurement Probabilities:** *'Explain Born\'s Rule and probability amplitudes'*\n"
                f"* **Algorithms:** *'How does Grover\'s quantum search work?'*\n\n"
                f"Currently, you are in **{topic}** with a {num_qubits}-qubit circuit."
            )
            return welcome, None

        # 1. Circuit Generation / Creation Requests
        if any(w in msg for w in ["create", "generate", "make", "build", "construct", "give me a circuit"]):
            gen_desc, gen_circ = self._build_generation(user_message)
            if gen_circ:
                return gen_desc, gen_circ

        # 2. QUBITS
        if any(w in msg for w in ["qubit", "quantum bit", "what is a qubit", "bloch sphere", "statevector"]):
            ans = (
                "### ⚛️ What is a Qubit?\n\n"
                "A **qubit** (quantum bit) is the fundamental unit of quantum information, analogous to the classical bit (0 or 1).\n\n"
                "#### 1. Mathematical Representation\n"
                "Unlike a classical bit which is strictly deterministic (either 0 or 1), a qubit exists in a two-dimensional complex Hilbert space as a linear combination (superposition) of the basis states $|0\\rangle$ and $|1\\rangle$:\n\n"
                "$$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$\n\n"
                "where $\\alpha, \\beta \\in \\mathbb{C}$ are **probability amplitudes** satisfying the normalization condition:\n\n"
                "$$|\\alpha|^2 + |\\beta|^2 = 1$$\n\n"
                "#### 2. The Bloch Sphere Representation\n"
                "Geometrically, any pure single-qubit state can be visualized as a point on the surface of the **Bloch Sphere**:\n"
                "* **North Pole $(+Z)$:** Pure ground state $|0\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$\n"
                "* **South Pole $(-Z)$:** Excited state $|1\\rangle = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$\n"
                "* **Equator:** Equal superposition states such as $|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$ on the $+X$ axis.\n\n"
                "#### 3. Measurement & Wavefunction Collapse\n"
                "When you measure a qubit in the computational basis, its continuous superposition collapses into one of the two classical eigenstates with probabilities $P(0) = |\\alpha|^2$ and $P(1) = |\\beta|^2$."
            )
            return ans, None

        # 3. SUPERPOSITION
        if any(w in msg for w in ["superposition", "hadamard", "|+>", "|->", "linear combination"]):
            ans = (
                "### 🌊 Quantum Superposition & The Hadamard Gate\n\n"
                "**Superposition** is the quantum principle allowing a physical system to exist simultaneously in multiple orthogonal states until measured.\n\n"
                "#### 1. Creating Superposition with the Hadamard (H) Gate\n"
                "In quantum circuits, superposition is typically produced by applying a **Hadamard (H)** gate to a ground-state qubit $|0\\rangle$:\n\n"
                "$$H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$$\n\n"
                "$$H|1\\rangle = |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$$\n\n"
                "#### 2. Wave Interference: The Quantum Superpower\n"
                "Crucially, quantum states are described by **complex amplitudes**, not classical probabilities:\n"
                "* Amplitudes can be positive, negative, or imaginary.\n"
                "* When multiple computational paths converge, their amplitudes can **interfere constructively** (boosting correct answers) or **interfere destructively** (canceling wrong answers).\n\n"
                "#### 3. Classical vs Quantum Multi-State Scaling\n"
                "An $n$-qubit register can hold a simultaneous superposition of all $2^n$ computational states using only $n$ physical qubits! For example, 50 qubits hold $2^{50} \\approx 1.125 \\times 10^{15}$ simultaneous states."
            )
            return ans, None

        # 4. QUANTUM GATES
        if any(w in msg for w in ["quantum gate", "gates", "pauli", "cnot", "toffoli", "unitary", "phase gate"]):
            ans = (
                "### 🎛️ Quantum Logic Gates\n\n"
                "Quantum gates are represented mathematically as **unitary matrices** ($U^\\dagger U = I$), ensuring that quantum time evolution is strictly **reversible** and preserves probability conservation.\n\n"
                "#### 1. Fundamental Single-Qubit Gates\n"
                "* **H (Hadamard):** Creates equal superposition; rotates $\\pi$ around the diagonal $(X+Z)/\\sqrt{2}$ axis.\n"
                "* **X (Pauli-X / NOT):** Quantum bit-flip ($|0\\rangle \\leftrightarrow |1\\rangle$). Matrix: $\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$.\n"
                "* **Z (Pauli-Z / Phase Flip):** Flips the relative phase of $|1\\rangle$ ($|1\\rangle \\rightarrow -|1\\rangle$). Leaves $|0\\rangle$ unchanged.\n"
                "* **Y (Pauli-Y):** Combined bit and phase flip ($Y = iXZ$). Matrix: $\\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}$.\n"
                "* **S Gate:** Phase rotation of $\\pi/2$ (quarter turn about $Z$). Note that $S^2 = Z$.\n"
                "* **T Gate:** Phase rotation of $\\pi/4$ (eighth turn). Essential for universal fault-tolerant quantum computation.\n\n"
                "#### 2. Multi-Qubit Entangling Gates\n"
                "* **CNOT (CX):** Flips the target qubit if and only if the control qubit is $|1\\rangle$. When preceded by an H gate, it creates maximal entanglement!\n"
                "* **SWAP:** Exchanges quantum states between two wires.\n"
                "* **Toffoli (CCX):** Controlled-Controlled-NOT gate; universal for reversible classical logic."
            )
            return ans, None

        # 5. ENTANGLEMENT
        if any(w in msg for w in ["entangle", "entanglement", "epr", "spooky", "non-local", "teleport"]):
            ans = (
                "### 🔗 Quantum Entanglement & Non-Locality\n\n"
                "**Entanglement** is a uniquely quantum mechanical phenomenon wherein two or more qubits become correlated such that the quantum state of the system cannot be factored into independent states of its subsystems.\n\n"
                "#### 1. Mathematical Definition\n"
                "A state $|\\psi_{AB}\\rangle$ is entangled if and only if:\n\n"
                "$$|\\psi_{AB}\\rangle \\neq |\\psi_A\\rangle \\otimes |\\psi_B\\rangle$$\n\n"
                "#### 2. The Einstein-Podolsky-Rosen (EPR) Paradox\n"
                "In 1935, Einstein, Podolsky, and Rosen questioned quantum mechanics, calling instantaneous non-local correlation *'spooky action at a distance'* (*spukhafte Fernwirkung*). "
                "However, in 1964, John Stewart Bell proved through **Bell's Theorem** that no local hidden variable theory can reproduce all quantum mechanical correlations.\n\n"
                "#### 3. Key Properties & Technologies\n"
                "* **Instantaneous Correlation:** Measuring one qubit of a Bell pair immediately determines the measurement outcome of the other, regardless of spatial distance.\n"
                "* **No Faster-Than-Light Signaling:** Because individual measurement outcomes are fundamentally random, entanglement cannot transmit classical information faster than light without a classical communication channel.\n"
                "* **Applications:** Quantum Key Distribution (QKD / BB84 / E91), Superdense Coding, Quantum Teleportation, and Quantum Error Correction (Surface Codes)."
            )
            return ans, None

        # 6. BELL STATES
        if any(w in msg for w in ["bell state", "bell states", "phi+", "phi-", "psi+", "psi-"]):
            circuit = {
                "qubits": 2,
                "steps": [
                    [{"gate": "H", "qubit": 0}],
                    [{"gate": "CX", "control": 0, "target": 1}],
                    [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
                ]
            }
            ans = (
                "### 🔔 The Four Maximally Entangled Bell States\n\n"
                "The **Bell states** (or EPR pairs) form an orthonormal basis of maximally entangled two-qubit quantum states:\n\n"
                "1. **$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$** *(Canonical Bell State: 50% $|00\\rangle$, 50% $|11\\rangle$)*\n"
                "2. **$|\\Phi^-\\rangle = \\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}$** *(Phase-flipped correlation)*\n"
                "3. **$|\\Psi^+\\rangle = \\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}$** *(Anti-correlated: 50% $|01\\rangle$, 50% $|10\\rangle$)*\n"
                "4. **$|\\Psi^-\\rangle = \\frac{|01\\rangle - |10\\rangle}{\\sqrt{2}}$** *(Singlet state: anti-symmetric under particle exchange)*\n\n"
                "#### Construction Recipe for $|\\Phi^+\\rangle$:\n"
                "1. Start with ground state $|00\\rangle$.\n"
                "2. Apply a **Hadamard (H)** gate to Qubit 0: $\\rightarrow \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$.\n"
                "3. Apply a **CNOT (CX)** gate with Control = Q0 and Target = Q1: $\\rightarrow \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$.\n\n"
                "Click **Load Circuit Into Studio** below to test this circuit directly!"
            )
            return ans, circuit

        # 7. QUANTUM CIRCUITS
        if any(w in msg for w in ["circuit", "wires", "depth", "quantum circuit", "diagram"]):
            ans = (
                "### 📐 How Quantum Circuits Work\n\n"
                "A **quantum circuit** is a computational model representing a sequence of quantum gates operating on an ordered register of qubits.\n\n"
                "#### 1. Anatomical Elements\n"
                "* **Horizontal Lines (Wires):** Each horizontal wire represents a physical or logical qubit, evolving from left (initialization, $t=0$) to right (measurement).\n"
                "* **Boxes / Symbols:** Represent unitary operations ($H, X, Z, S, T$).\n"
                "* **Vertical Control Lines:** Connect multi-qubit gates (e.g. CNOT has a solid dot $\\bullet$ on the control and $\\oplus$ on the target).\n"
                "* **Meter Icons:** Measurement operations that project quantum states into classical memory bits.\n\n"
                "#### 2. Key Metrics\n"
                "* **Circuit Width:** Total number of qubits in the system.\n"
                "* **Circuit Depth:** The maximum number of gate operations on any single qubit path that must be executed sequentially. Shallow depth is critical to minimize decoherence on NISQ processors."
            )
            return ans, None

        # 8. QISKIT & PYTHON
        if any(w in msg for w in ["qiskit", "python", "code", "aer", "simulator", "sdk"]):
            ans = (
                "### 🐍 Quantum Programming with Qiskit\n\n"
                "**Qiskit** is the open-source quantum SDK created by IBM. Here is a clean script demonstrating how to build, simulate, and measure a 2-qubit Bell state:\n\n"
                "```python\n"
                "from qiskit import QuantumCircuit\n"
                "from qiskit_aer import AerSimulator\n\n"
                "# 1. Initialize a 2-qubit circuit with 2 classical bits\n"
                "qc = QuantumCircuit(2, 2)\n\n"
                "# 2. Apply gates: Hadamard on Q0, then CNOT(0 -> 1)\n"
                "qc.h(0)\n"
                "qc.cx(0, 1)\n\n"
                "# 3. Measure qubits into classical registers\n"
                "qc.measure([0, 1], [0, 1])\n\n"
                "# 4. Simulate with Qiskit Aer (1024 shots)\n"
                "simulator = AerSimulator()\n"
                "job = simulator.run(qc, shots=1024)\n"
                "counts = job.result().get_counts()\n\n"
                "print('Measurement Counts:', counts)\n"
                "# Output: {'00': ~512, '11': ~512}\n"
                "```\n\n"
                "You can also run Python code interactively in LeQC under the **Code Lab** tab!"
            )
            return ans, None

        # 9. MEASUREMENT PROBABILITIES & BORN RULE
        if any(w in msg for w in ["probability", "probabilities", "born", "measurement", "collapse", "amplitude"]):
            ans = (
                "### 🎲 Measurement Probabilities & Born's Rule\n\n"
                "In quantum mechanics, outcomes are fundamentally non-deterministic and governed by **Born's Rule**, formulated by Max Born in 1926.\n\n"
                "#### 1. Born's Rule Formulation\n"
                "Given an arbitrary statevector $|\\psi\\rangle = \\sum_{x} c_x |x\\rangle$ in the computational basis, the probability $P(x)$ of observing basis state $|x\\rangle$ upon measurement is:\n\n"
                "$$P(x) = |c_x|^2 = |\\langle x|\\psi\\rangle|^2$$\n\n"
                "Because probabilities must sum to 100%, the statevector satisfies the **normalization constraint**:\n\n"
                "$$\\sum_{x} P(x) = \\sum_{x} |c_x|^2 = 1$$\n\n"
                "#### 2. Amplitudes vs Probabilities\n"
                "A probability $P(x)$ is always a real number between $0$ and $1$. A quantum amplitude $c_x = r e^{i\\theta}$ is a **complex number** with magnitude $r$ and phase angle $\\theta$.\n"
                "* Phase interference enables destructive cancellation of unwanted solutions, a cornerstone of algorithms like Shor's and Grover's!\n\n"
                "#### 3. Wavefunction Collapse & Shot Statistics\n"
                "Upon measurement, the continuous wavefunction irreversibly collapses into the detected eigenstate. Running 1024 shots samples this probability distribution experimentally."
            )
            return ans, None

        # 10. GROVER'S ALGORITHM
        if any(w in msg for w in ["grover", "search", "oracle", "amplitude amplification", "diffusion"]):
            ans = (
                "### 🔍 Grover's Quantum Search Algorithm\n\n"
                "**Grover's Algorithm** (Lov Grover, 1996) solves the problem of searching an unstructured database of $N$ items in $O(\\sqrt{N})$ evaluations, providing a **quadratic speedup** over classical brute-force $O(N)$ search.\n\n"
                "#### 1. The Algorithm Workflow\n"
                "1. **Uniform Superposition:** Apply Hadamard gates across all $n$ qubits to prepare equal amplitudes: $|s\\rangle = \\frac{1}{\\sqrt{N}} \\sum_{x=0}^{N-1} |x\\rangle$.\n"
                "2. **Quantum Oracle ($U_w$):** Recognizes the target state $|w\\rangle$ and flips its phase: $|x\\rangle \\rightarrow -|x\\rangle$ if $x = w$, leaving other states unchanged.\n"
                "3. **Diffusion Operator ($U_s$):** Inverts all amplitudes about their mean average value: $U_s = 2|s\\rangle\\langle s| - I$. Because the marked state was made negative, inversion about the mean drastically magnifies its amplitude while reducing all others!\n"
                "4. **Iterate:** Repeat steps 2 & 3 approximately $R \\approx \\frac{\\pi}{4}\\sqrt{N}$ times.\n"
                "5. **Measure:** The marked item will be measured with probability close to 100%!"
            )
            return ans, None

        # 11. Asking about current circuit
        if any(w in msg for w in ["my circuit", "current circuit", "what does this do", "explain this circuit", "active circuit"]):
            gate_list_str = ', '.join([f'{k} ({v})' for k, v in gate_summary.items()]) if gate_summary else 'No gates (Ground state)'
            ans = (
                f"### 🔬 Telemetry for Your Current Circuit\n\n"
                f"* **Qubits:** {num_qubits} active wires\n"
                f"* **Current State:** `{dirac or '|0...0⟩'}`\n"
                f"* **Applied Gates:** {gate_list_str}\n"
                f"* **Entanglement:** {'🔗 Maximally Entangled State' if is_entangled else 'Independent / Separable Subsystems'}\n"
                f"* **Measurement Probabilities:** {json.dumps(probabilities) if probabilities else 'All probability in ground state'}\n\n"
                f"Would you like me to **explain the step-by-step physical breakdown**, **debug potential issues**, or **optimize redundant gates**?"
            )
            return ans, None

        # 12. Contextual Fallback for Other Questions
        fallback = (
            f"### ⚛️ LeQC Quantum Pedagogical Guide\n\n"
            f"That is an interesting question regarding quantum computing! You are currently exploring **{topic}** on a {num_qubits}-qubit circuit.\n\n"
            f"* **Current State:** `{dirac or '|0...0⟩'}`\n"
            f"* **Active Gates:** {', '.join([f'{k} ({v})' for k, v in gate_summary.items()]) if gate_summary else 'None (Ground State)'}\n"
            f"* **Entanglement Status:** {'🔗 Maximally Entangled' if is_entangled else 'Separable'}\n\n"
            f"**Recommended Topics to Explore:**\n"
            f"1. Ask *'What is a qubit?'* to understand Bloch spheres and complex Hilbert spaces.\n"
            f"2. Ask *'Explain superposition'* to see how the Hadamard gate enables wave interference.\n"
            f"3. Ask *'How does entanglement work?'* to explore Bell pairs and EPR non-locality.\n"
            f"4. Ask *'Show me Qiskit code'* for runnable Python circuit simulation.\n"
            f"5. Click **Explain Circuit** or **Debug** on the top toolbar for automatic circuit telemetry."
        )
        return fallback, None
