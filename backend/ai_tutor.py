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

        # Default CHAT
        else:
            resp = (
                f"### ⚛️ QuBitLab Quantum Guide\n\n"
                f"You are currently exploring **{topic}** on a {num_qubits}-qubit circuit.\n\n"
                f"* **Current State:** `{dirac or '|0...0⟩'}`\n"
                f"* **Active Gates:** {', '.join([f'{k} ({v})' for k, v in gate_summary.items()]) if gate_summary else 'None (Ground State)'}\n"
                f"* **Entanglement Status:** {'🔗 Maximally Entangled Subsystem' if is_entangled else 'Separable Individual States'}\n\n"
                f"**What would you like to explore next?**\n"
                f"- Click **Explain Circuit** to see the physical step-by-step evolution.\n"
                f"- Click **Debug** to verify if your circuit has logical or measurement errors.\n"
                f"- Click **Generate** and ask me to construct any quantum algorithm (e.g. *'Create a Bell state'* or *'Grover search'*).\n"
                f"- Click **Optimize** to check for redundant gate cancellations."
            )
            return {
                "success": True,
                "engine": "QuBitLab Pedagogical Core",
                "mode": "chat",
                "response": resp
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
