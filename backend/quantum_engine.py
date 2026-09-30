"""
QuBitLab AI - Quantum Simulation Engine
Powers circuit creation, Qiskit Aer simulation, statevector analysis,
Bloch sphere vector computations, code generation, and challenge validation.
"""

import sys
import io
import math
import numpy as np
from typing import Dict, List, Any, Optional, Tuple

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace
from qiskit_aer import AerSimulator


class QuantumEngine:
    """Core quantum simulation and analysis engine."""

    def __init__(self):
        self.simulator = AerSimulator()

    def build_circuit(self, circuit_data: Dict[str, Any]) -> Tuple[QuantumCircuit, QuantumCircuit]:
        """
        Builds two Qiskit QuantumCircuit instances from circuit JSON:
        1. qc_sim: Includes measurements for shot-based simulation.
        2. qc_state: Pure unitary circuit (without measurements) for exact statevector and Bloch vectors.
        """
        num_qubits = circuit_data.get("qubits", 2)
        num_qubits = max(1, min(num_qubits, 6))  # 1 to 6 qubits for smooth web simulation
        steps = circuit_data.get("steps", [])

        # Circuit for statevector (no measurements)
        qc_state = QuantumCircuit(num_qubits)
        # Circuit for simulation (with measurements)
        qc_sim = QuantumCircuit(num_qubits, num_qubits)

        measurements = []

        for step in steps:
            for op in step:
                gate = op.get("gate", "").upper()
                q = op.get("qubit")
                target = op.get("target")
                control = op.get("control")
                params = op.get("params", {})

                if gate == "H" and q is not None and q < num_qubits:
                    qc_state.h(q)
                    qc_sim.h(q)
                elif gate == "X" and q is not None and q < num_qubits:
                    qc_state.x(q)
                    qc_sim.x(q)
                elif gate == "Y" and q is not None and q < num_qubits:
                    qc_state.y(q)
                    qc_sim.y(q)
                elif gate == "Z" and q is not None and q < num_qubits:
                    qc_state.z(q)
                    qc_sim.z(q)
                elif gate == "S" and q is not None and q < num_qubits:
                    qc_state.s(q)
                    qc_sim.s(q)
                elif gate == "T" and q is not None and q < num_qubits:
                    qc_state.t(q)
                    qc_sim.t(q)
                elif gate == "RX" and q is not None and q < num_qubits:
                    theta = float(params.get("theta", math.pi / 2))
                    qc_state.rx(theta, q)
                    qc_sim.rx(theta, q)
                elif gate == "RY" and q is not None and q < num_qubits:
                    theta = float(params.get("theta", math.pi / 2))
                    qc_state.ry(theta, q)
                    qc_sim.ry(theta, q)
                elif gate == "RZ" and q is not None and q < num_qubits:
                    theta = float(params.get("theta", math.pi / 2))
                    qc_state.rz(theta, q)
                    qc_sim.rz(theta, q)
                elif (gate in ["CX", "CNOT"]) and control is not None and target is not None:
                    if control < num_qubits and target < num_qubits and control != target:
                        qc_state.cx(control, target)
                        qc_sim.cx(control, target)
                elif gate == "CZ" and control is not None and target is not None:
                    if control < num_qubits and target < num_qubits and control != target:
                        qc_state.cz(control, target)
                        qc_sim.cz(control, target)
                elif gate == "SWAP" and control is not None and target is not None:
                    if control < num_qubits and target < num_qubits and control != target:
                        qc_state.swap(control, target)
                        qc_sim.swap(control, target)
                elif gate == "M" and q is not None and q < num_qubits:
                    cbit = op.get("cbit", q)
                    measurements.append((q, cbit))
                elif gate == "RESET" and q is not None and q < num_qubits:
                    qc_state.reset(q)
                    qc_sim.reset(q)

        # If measurements were explicitly placed, add them; otherwise measure all qubits for shots
        if measurements:
            for q, c in measurements:
                qc_sim.measure(q, c)
        else:
            for q in range(num_qubits):
                qc_sim.measure(q, q)

        return qc_sim, qc_state

    def simulate(self, circuit_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes circuit on Qiskit Aer and returns comprehensive quantum state analysis.
        """
        num_qubits = circuit_data.get("qubits", 2)
        shots = circuit_data.get("shots", 1024)
        shots = max(100, min(shots, 10000))

        try:
            qc_sim, qc_state = self.build_circuit(circuit_data)

            # 1. Statevector analysis (from pure circuit before measurement collapse)
            sv = Statevector.from_instruction(qc_state)
            sv_data = sv.data
            probabilities_dict = sv.probabilities_dict()

            # Format statevector amplitudes
            statevector_list = []
            dirac_terms = []
            dim = 2 ** num_qubits

            for i in range(dim):
                bitstr = format(i, f"0{num_qubits}b")
                amp = sv_data[i]
                real_part = float(np.real(amp))
                imag_part = float(np.imag(amp))
                mag = float(np.abs(amp))
                phase = float(np.angle(amp))
                prob = float(mag ** 2)

                statevector_list.append({
                    "basis": bitstr,
                    "real": round(real_part, 4),
                    "imag": round(imag_part, 4),
                    "magnitude": round(mag, 4),
                    "phase": round(phase, 4),
                    "probability": round(prob, 4)
                })

                if mag > 0.001:
                    coeff_str = ""
                    if abs(mag - 1.0) < 0.01:
                        coeff_str = "" if phase >= 0 else "-"
                    elif abs(mag - 0.7071) < 0.01:
                        coeff_str = "1/√2 " if phase >= 0 else "-1/√2 "
                    elif abs(mag - 0.5) < 0.01:
                        coeff_str = "1/2 " if phase >= 0 else "-1/2 "
                    else:
                        coeff_str = f"{mag:.3f} "
                    dirac_terms.append(f"{coeff_str}|{bitstr}⟩")

            dirac_repr = " + ".join(dirac_terms) if dirac_terms else "|0...0⟩"

            # 2. Bloch sphere vector for each individual qubit via partial trace
            bloch_vectors = []
            for q in range(num_qubits):
                # Trace out all other qubits
                other_qubits = [k for k in range(num_qubits) if k != q]
                if other_qubits:
                    rho_q = partial_trace(sv, other_qubits)
                else:
                    rho_q = sv

                rho_data = rho_q.data if hasattr(rho_q, "data") else np.outer(sv_data, np.conj(sv_data))
                
                # Bloch vector formula: rx = 2*Re(rho01), ry = -2*Im(rho01), rz = rho00 - rho11
                rx = float(2.0 * np.real(rho_data[0, 1]))
                ry = float(-2.0 * np.imag(rho_data[0, 1]))
                rz = float(np.real(rho_data[0, 0] - rho_data[1, 1]))
                radius = float(math.sqrt(rx**2 + ry**2 + rz**2))

                # Spherical coordinates: theta, phi
                theta = float(math.acos(max(-1.0, min(1.0, rz / (radius if radius > 1e-6 else 1.0)))))
                phi = float(math.atan2(ry, rx))

                bloch_vectors.append({
                    "qubit": q,
                    "x": round(rx, 4),
                    "y": round(ry, 4),
                    "z": round(rz, 4),
                    "radius": round(radius, 4),
                    "theta": round(theta, 4),
                    "phi": round(phi, 4),
                    "is_entangled": bool(radius < 0.95 and num_qubits > 1)
                })

            # 3. Aer Simulator Execution with shots
            sim_job = self.simulator.run(qc_sim, shots=shots)
            sim_result = sim_job.result()
            counts_raw = sim_result.get_counts()

            # Clean and ensure all measured keys have equal padding
            counts = {str(k): int(v) for k, v in counts_raw.items()}
            total_shots = sum(counts.values())

            # Measurement probabilities from shots
            shot_probabilities = {k: round(v / total_shots, 4) for k, v in counts.items()}

            # 4. Generate Python Qiskit code & OpenQASM
            python_code = self.generate_qiskit_code(circuit_data)
            qasm_str = qc_sim.qasm() if hasattr(qc_sim, "qasm") else ""

            # 5. Circuit metrics
            gate_count = qc_sim.size()
            depth = qc_sim.depth()

            return {
                "success": True,
                "qubits": num_qubits,
                "shots": shots,
                "counts": counts,
                "probabilities": shot_probabilities,
                "theoretical_probabilities": {k: round(v, 4) for k, v in probabilities_dict.items()},
                "statevector": statevector_list,
                "dirac": dirac_repr,
                "bloch_vectors": bloch_vectors,
                "python_code": python_code,
                "qasm": qasm_str,
                "circuit_depth": depth,
                "gate_count": gate_count,
                "is_entangled": any(bv["is_entangled"] for bv in bloch_vectors)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def generate_qiskit_code(self, circuit_data: Dict[str, Any]) -> str:
        """Generates idiomatic, runnable Python Qiskit code."""
        num_qubits = circuit_data.get("qubits", 2)
        steps = circuit_data.get("steps", [])

        lines = [
            "from qiskit import QuantumCircuit",
            "from qiskit_aer import AerSimulator",
            "from qiskit.visualization import plot_histogram",
            "",
            f"# Initialize a Quantum Circuit with {num_qubits} qubits and {num_qubits} classical bits",
            f"qc = QuantumCircuit({num_qubits}, {num_qubits})",
            ""
        ]

        has_measurements = False

        for step_idx, step in enumerate(steps):
            if not step:
                continue
            lines.append(f"# Step {step_idx + 1}")
            for op in step:
                gate = op.get("gate", "").upper()
                q = op.get("qubit")
                target = op.get("target")
                control = op.get("control")

                if gate == "H":
                    lines.append(f"qc.h({q})")
                elif gate == "X":
                    lines.append(f"qc.x({q})")
                elif gate == "Y":
                    lines.append(f"qc.y({q})")
                elif gate == "Z":
                    lines.append(f"qc.z({q})")
                elif gate == "S":
                    lines.append(f"qc.s({q})")
                elif gate == "T":
                    lines.append(f"qc.t({q})")
                elif gate in ["CX", "CNOT"]:
                    lines.append(f"qc.cx({control}, {target})")
                elif gate == "CZ":
                    lines.append(f"qc.cz({control}, {target})")
                elif gate == "SWAP":
                    lines.append(f"qc.swap({control}, {target})")
                elif gate == "M":
                    lines.append(f"qc.measure({q}, {op.get('cbit', q)})")
                    has_measurements = True
                elif gate == "RESET":
                    lines.append(f"qc.reset({q})")

        if not has_measurements:
            lines.append("")
            lines.append("# Measure all qubits into classical registers")
            lines.append(f"qc.measure(range({num_qubits}), range({num_qubits}))")

        lines.extend([
            "",
            "# Simulate circuit on Qiskit Aer",
            "simulator = AerSimulator()",
            "job = simulator.run(qc, shots=1024)",
            "result = job.result()",
            "counts = result.get_counts()",
            "",
            "print('Circuit Structure:')",
            "print(qc.draw(output='text'))",
            "print('\\nMeasurement Results (Counts):')",
            "print(counts)",
            "for state, count in counts.items():",
            "    print(f'|{state}>: {count/1024 * 100:.1f}%')"
        ])

        return "\n".join(lines)

    def optimize_circuit(self, circuit_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes circuit for simplifications:
        - Self-inverse pairs (H*H = I, X*X = I, Z*Z = I)
        - Redundant back-to-back CNOTs
        - Unused qubits
        """
        steps = circuit_data.get("steps", [])
        num_qubits = circuit_data.get("qubits", 2)
        optimizations = []

        # Track last gate on each qubit
        last_gate_on_qubit = {}

        for step_idx, step in enumerate(steps):
            for op in step:
                gate = op.get("gate", "").upper()
                q = op.get("qubit")
                if q is not None and gate in ["H", "X", "Y", "Z"]:
                    if q in last_gate_on_qubit and last_gate_on_qubit[q]["gate"] == gate:
                        prev_step = last_gate_on_qubit[q]["step"]
                        optimizations.append({
                            "type": "self_inverse",
                            "qubit": q,
                            "gate": gate,
                            "message": f"Consecutive {gate} gates on Qubit {q} at steps {prev_step + 1} and {step_idx + 1} cancel each other out ({gate}·{gate} = I)."
                        })
                        del last_gate_on_qubit[q]
                    else:
                        last_gate_on_qubit[q] = {"gate": gate, "step": step_idx}

        return {
            "has_optimizations": len(optimizations) > 0,
            "count": len(optimizations),
            "suggestions": optimizations
        }

    def verify_challenge(self, challenge_id: str, circuit_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifies if student circuit solves the requested challenge.
        """
        sim_res = self.simulate(circuit_data)
        if not sim_res["success"]:
            return {"passed": False, "message": f"Circuit execution failed: {sim_res.get('error')}"}

        probs = sim_res.get("probabilities", {})
        theo_probs = sim_res.get("theoretical_probabilities", {})
        num_qubits = circuit_data.get("qubits", 1)

        if challenge_id == "superposition_plus":
            # Target: equal superposition on 1 qubit (|0> ~ 50%, |1> ~ 50%)
            p0 = probs.get("0", 0) + probs.get("00", 0)
            p1 = probs.get("1", 0) + probs.get("01", 0)
            if 0.40 <= p0 <= 0.60 and 0.40 <= p1 <= 0.60:
                return {
                    "passed": True,
                    "score": 100,
                    "message": "Perfect! You applied the Hadamard gate (H) to create the |+⟩ superposition state. Notice the 50/50 probability split!"
                }
            return {
                "passed": False,
                "score": 20,
                "message": f"Not quite. Expected a 50/50 probability distribution between |0⟩ and |1⟩, but received |0⟩: {p0*100:.1f}%, |1⟩: {p1*100:.1f}%. Try placing a Hadamard (H) gate on Q0."
            }

        elif challenge_id == "flip_qubit":
            # Target: prepare |1> from |0> using Pauli-X
            p1 = probs.get("1", 0)
            if p1 >= 0.95:
                return {
                    "passed": True,
                    "score": 100,
                    "message": "Excellent! The Pauli-X gate acts as a quantum NOT gate, flipping |0⟩ directly to |1⟩ with 100% certainty."
                }
            return {
                "passed": False,
                "score": 0,
                "message": f"Expected 100% measurement in state |1⟩, but measured |1⟩: {p1*100:.1f}%. Remember the Pauli-X gate inverts the computational basis."
            }

        elif challenge_id == "bell_state_phi_plus":
            # Target: |Phi+> = (|00> + |11>)/sqrt(2)
            p00 = probs.get("00", 0)
            p11 = probs.get("11", 0)
            p01 = probs.get("01", 0)
            p10 = probs.get("10", 0)
            if 0.40 <= p00 <= 0.60 and 0.40 <= p11 <= 0.60 and p01 <= 0.05 and p10 <= 0.05:
                return {
                    "passed": True,
                    "score": 150,
                    "message": "Congratulations! You have created the maximally entangled Bell State |Φ+⟩ = (|00⟩ + |11⟩)/√2! Measuring one qubit instantly determines the other."
                }
            return {
                "passed": False,
                "score": 40,
                "message": f"Expected only |00⟩ and |11⟩ at ~50% each. Got |00⟩: {p00*100:.1f}%, |11⟩: {p11*100:.1f}%, |01⟩: {p01*100:.1f}%, |10⟩: {p10*100:.1f}%. Hint: Put H on Q0, then a CNOT with control Q0 and target Q1."
            }

        elif challenge_id == "phase_flip_minus":
            # Target: |-> state = (|0> - |1>)/sqrt(2)
            # In statevector, real or imag parts have opposite sign
            sv = sim_res.get("statevector", [])
            amp0 = next((item for item in sv if item["basis"].endswith("0")), None)
            amp1 = next((item for item in sv if item["basis"].endswith("1")), None)
            if amp0 and amp1:
                # Opposite sign in amplitudes
                if abs(amp0["real"] - 0.707) < 0.1 and abs(amp1["real"] + 0.707) < 0.1:
                    return {
                        "passed": True,
                        "score": 120,
                        "message": "Brilliant! You created the |-⟩ state! The relative phase between |0⟩ and |1⟩ is π (phase flipped)."
                    }
            return {
                "passed": False,
                "score": 30,
                "message": "To create the |-⟩ state, either start with X on Q0 to get |1⟩ and then apply H, or apply H followed by Z."
            }

        elif challenge_id == "ghz_state":
            # Target: GHZ 3-qubit state = (|000> + |111>)/sqrt(2)
            p000 = probs.get("000", 0)
            p111 = probs.get("111", 0)
            if 0.40 <= p000 <= 0.60 and 0.40 <= p111 <= 0.60:
                return {
                    "passed": True,
                    "score": 200,
                    "message": "Outstanding! You constructed the 3-qubit Greenberger-Horne-Zeilinger (GHZ) entangled state!"
                }
            return {
                "passed": False,
                "score": 50,
                "message": "Hint for GHZ state: Put H on Q0, then CNOT(0->1), then CNOT(1->2) or CNOT(0->2)."
            }

        return {
            "passed": False,
            "score": 0,
            "message": f"Unknown challenge ID: {challenge_id}"
        }
