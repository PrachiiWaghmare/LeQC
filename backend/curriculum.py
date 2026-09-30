"""
QuBitLab AI - Curriculum and Learning Knowledge Base
Contains rich structured interactive modules, concept quizzes, challenges, and circuit presets.
"""

from typing import List, Dict, Any

MODULES: List[Dict[str, Any]] = [
    {
        "id": "qubits",
        "title": "What is a Qubit?",
        "subtitle": "Classical Bits vs. Quantum Bits & The Bloch Sphere",
        "category": "Fundamentals",
        "badge": "01",
        "duration": "5 min",
        "summary": "Discover how quantum bits exploit the laws of quantum physics to exist in linear combinations of 0 and 1 simultaneously.",
        "content": [
            {
                "type": "paragraph",
                "text": "In classical computing, the fundamental unit of information is the **bit**, which can strictly be either **0** or **1** (like a light switch that is either OFF or ON). In quantum computing, the fundamental building block is the **qubit** (quantum bit)."
            },
            {
                "type": "key_concept",
                "title": "The Quantum State Vector |ψ⟩",
                "formula": "|ψ⟩ = α|0⟩ + β|1⟩",
                "text": "A qubit's state is described as a linear combination of two basis states, |0⟩ and |1⟩. The coefficients α and β are **complex probability amplitudes**. The total probability must equal 100%: |α|² + |β|² = 1."
            },
            {
                "type": "analogy",
                "title": "The Coin Analogy",
                "text": "A classical bit is like a coin lying flat on a table: heads (0) or tails (1). A qubit is like a coin **actively spinning on the table**—until you slap your hand down on it (measurement), it exists in a dynamic continuum of both states simultaneously!"
            },
            {
                "type": "interactive_callout",
                "title": "Geometric Reality: The Bloch Sphere",
                "text": "Any pure single-qubit state can be represented as a point on the surface of a three-dimensional unit sphere called the **Bloch Sphere**. The North Pole represents |0⟩, the South Pole represents |1⟩, and the equator represents equal superposition states like |+⟩ and |-⟩."
            }
        ],
        "circuit_preset": {
            "qubits": 1,
            "steps": [
                [{"gate": "M", "qubit": 0}]
            ]
        },
        "quiz": {
            "question": "If a qubit is in the state |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩, what is the probability of measuring 0?",
            "options": [
                "100%",
                "50%",
                "25%",
                "0%"
            ],
            "correct": 1,
            "explanation": "According to Born's Rule, the probability of measuring |0⟩ is |α|² = |1/√2|² = 1/2 = 50%."
        }
    },
    {
        "id": "superposition",
        "title": "Superposition & The Hadamard Gate",
        "subtitle": "Creating Quantum Parallelism with the H Gate",
        "category": "Core Mechanics",
        "badge": "02",
        "duration": "7 min",
        "summary": "Learn how the Hadamard gate transforms definite states into equal superpositions, unlocking quantum parallel processing.",
        "content": [
            {
                "type": "paragraph",
                "text": "**Superposition** is the ability of a quantum system to exist in multiple states at the same time until an observation or measurement is performed."
            },
            {
                "type": "key_concept",
                "title": "The Hadamard Gate (H)",
                "formula": "H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩   and   H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩",
                "text": "The Hadamard gate is the quintessential superposition creator. When applied to ground state |0⟩, it rotates the state vector 90° onto the Bloch sphere's X-axis, creating the equal superposition state |+⟩."
            },
            {
                "type": "analogy",
                "title": "Musical Harmony & Wave Superposition",
                "text": "Think of superposition like musical notes. If you strike a C and a G on a piano at the same time, you do not hear just one note or the other—you hear a rich harmonic chord that contains both frequencies simultaneously."
            }
        ],
        "circuit_preset": {
            "qubits": 1,
            "steps": [
                [{"gate": "H", "qubit": 0}],
                [{"gate": "M", "qubit": 0}]
            ]
        },
        "quiz": {
            "question": "What happens if you apply two Hadamard gates in a row (H · H) to a qubit starting in |0⟩?",
            "options": [
                "It stays in equal superposition",
                "It returns to the initial state |0⟩",
                "It flips to |1⟩",
                "It collapses irreversibly"
            ],
            "correct": 1,
            "explanation": "The Hadamard gate is self-inverse (H · H = I, the Identity operation). Applying H twice returns the qubit back to its original state |0⟩ via quantum interference!"
        }
    },
    {
        "id": "pauli_gates",
        "title": "Single Qubit Gates: Pauli X, Y, Z",
        "subtitle": "Rotations on the Bloch Sphere: Bit Flips & Phase Flips",
        "category": "Gates",
        "badge": "03",
        "duration": "8 min",
        "summary": "Master the Pauli operators (X, Y, Z) that rotate quantum states across the principal axes of the Bloch sphere.",
        "content": [
            {
                "type": "paragraph",
                "text": "Quantum logic gates are represented by unitary matrices. In single-qubit space, the **Pauli matrices (X, Y, Z)** are the fundamental rotation operators."
            },
            {
                "type": "key_concept",
                "title": "The Pauli Gates Trio",
                "formula": "X = [[0, 1], [1, 0]],   Y = [[0, -i], [i, 0]],   Z = [[1, 0], [0, -1]]",
                "text": "• Pauli-X (Quantum NOT): Flips |0⟩ to |1⟩ and |1⟩ to |0⟩.\n• Pauli-Z (Phase Flip): Leaves |0⟩ unchanged, but flips the phase of |1⟩ to -|1⟩.\n• Pauli-Y: Combines both bit-flip and phase-flip with an imaginary factor."
            },
            {
                "type": "analogy",
                "title": "Phase is Invisible to Direct Measurement",
                "text": "If a qubit is in |+⟩ = (|0⟩ + |1⟩)/√2 and you apply a Z gate, it transforms into |-⟩ = (|0⟩ - |1⟩)/√2. If you measure immediately, both give 50% 0 and 50% 1! The minus sign is a relative phase that only shows up when you interfere the states using another gate like H."
            }
        ],
        "circuit_preset": {
            "qubits": 1,
            "steps": [
                [{"gate": "X", "qubit": 0}],
                [{"gate": "M", "qubit": 0}]
            ]
        },
        "quiz": {
            "question": "Which Pauli gate acts as the direct quantum equivalent of the classical NOT gate?",
            "options": [
                "Pauli-Z",
                "Pauli-X",
                "Pauli-Y",
                "Hadamard"
            ],
            "correct": 1,
            "explanation": "Pauli-X inverts the computational basis: X|0⟩ = |1⟩ and X|1⟩ = |0⟩, exactly mirroring the classical NOT operation."
        }
    },
    {
        "id": "measurement",
        "title": "Quantum Measurement & Wavefunction Collapse",
        "subtitle": "Born's Rule and the Transition from Quantum to Classical",
        "category": "Core Mechanics",
        "badge": "04",
        "duration": "6 min",
        "summary": "Understand how reading out a qubit fundamentally disturbs it, forcing probabilistic collapse to a classical 0 or 1.",
        "content": [
            {
                "type": "paragraph",
                "text": "A quantum system evolves deterministically and reversibly via unitary gates until you **measure** it. Measurement forces the wavefunction to choose a single reality."
            },
            {
                "type": "key_concept",
                "title": "Born's Rule & Wavefunction Collapse",
                "formula": "P(0) = |α|²,   P(1) = |β|²",
                "text": "When you measure a state |ψ⟩ = α|0⟩ + β|1⟩ in the standard basis, the probability of obtaining 0 is |α|² and obtaining 1 is |β|². The post-measurement state is irrevocably collapsed to whichever state was observed."
            }
        ],
        "circuit_preset": {
            "qubits": 1,
            "steps": [
                [{"gate": "H", "qubit": 0}],
                [{"gate": "M", "qubit": 0}]
            ]
        },
        "quiz": {
            "question": "Can you measure a qubit in superposition without altering its quantum state?",
            "options": [
                "Yes, by using gentle lasers",
                "No, measurement irreversibly collapses the superposition into a definite eigenstate",
                "Yes, if the qubit is unentangled",
                "Only on Tuesdays"
            ],
            "correct": 1,
            "explanation": "Measurement fundamentally interacts with the quantum system, causing wavefunction collapse into an eigenstate of the measurement operator."
        }
    },
    {
        "id": "entanglement",
        "title": "Entanglement & Bell States",
        "subtitle": "Einstein's 'Spooky Action at a Distance' and the CNOT Gate",
        "category": "Multi-Qubit",
        "badge": "05",
        "duration": "10 min",
        "summary": "Construct the famous Bell states where two qubits share a single inseparable quantum destiny.",
        "content": [
            {
                "type": "paragraph",
                "text": "**Quantum Entanglement** occurs when two or more qubits become intertwined such that the physical state of any individual qubit cannot be described independently of the others—even if they are light-years apart."
            },
            {
                "type": "key_concept",
                "title": "The Controlled-NOT (CNOT) Gate",
                "formula": "CNOT|00⟩ = |00⟩,   CNOT|01⟩ = |01⟩,   CNOT|10⟩ = |11⟩,   CNOT|11⟩ = |10⟩",
                "text": "The CNOT gate acts on two qubits: if the **control qubit** is 1, it flips the **target qubit**; otherwise, the target qubit is left unchanged."
            },
            {
                "type": "key_concept",
                "title": "The Canonical Bell State |Φ+⟩",
                "formula": "|Φ+⟩ = (|00⟩ + |11⟩)/√2",
                "text": "Created by applying a Hadamard to Q0, followed by a CNOT(0 → 1). When you measure Q0, whether it yields 0 or 1 is completely random (50/50). But the instant you measure Q0, Q1 will ALWAYS yield the EXACT SAME outcome with 100% correlation!"
            },
            {
                "type": "analogy",
                "title": "The Magic Entangled Dice",
                "text": "Imagine two magic dice separated in different rooms. Roll die A: you get a random 6. Instantly, die B lands on 6! Roll die A again: you get 2. Die B immediately lands on 2. That is the non-local correlation of quantum entanglement."
            }
        ],
        "circuit_preset": {
            "qubits": 2,
            "steps": [
                [{"gate": "H", "qubit": 0}],
                [{"gate": "CX", "control": 0, "target": 1}],
                [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
            ]
        },
        "quiz": {
            "question": "If you measure Q0 of a Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 and get 0, what is the probability that Q1 will also be measured as 0?",
            "options": [
                "50%",
                "100%",
                "0%",
                "25%"
            ],
            "correct": 1,
            "explanation": "Because the state is (|00⟩ + |11⟩)/√2, measuring Q0 as 0 immediately collapses the combined state to |00⟩. Therefore, measuring Q1 is guaranteed to yield 0 with 100% certainty!"
        }
    },
    {
        "id": "grover",
        "title": "Grover's Quantum Search Algorithm",
        "subtitle": "Quadratic Speedup Through Amplitude Amplification",
        "category": "Algorithms",
        "badge": "06",
        "duration": "12 min",
        "summary": "Explore how quantum computers search an unsorted database of N items in O(√N) time using constructive wave interference.",
        "content": [
            {
                "type": "paragraph",
                "text": "Searching an unsorted database of N items classically requires checking N/2 items on average. Lov Grover discovered in 1996 that a quantum algorithm can find the marked item in only **O(√N)** steps—a quadratic speedup!"
            },
            {
                "type": "key_concept",
                "title": "The Two Pillars of Grover's Algorithm",
                "formula": "G = Diffusion · Oracle",
                "text": "1. **The Quantum Oracle:** Evaluates all states simultaneously in superposition and flips the phase (multiplies by -1) of the marked item(s).\n2. **The Diffusion Operator (Inversion About the Mean):** Reflects all amplitudes across their average, amplifying the marked state's positive probability while suppressing all incorrect answers."
            }
        ],
        "circuit_preset": {
            "qubits": 2,
            "steps": [
                [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
                [{"gate": "CZ", "control": 0, "target": 1}],
                [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
                [{"gate": "X", "qubit": 0}, {"gate": "X", "qubit": 1}],
                [{"gate": "CZ", "control": 0, "target": 1}],
                [{"gate": "X", "qubit": 0}, {"gate": "X", "qubit": 1}],
                [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
                [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
            ]
        },
        "quiz": {
            "question": "What is the computational complexity of searching an unsorted database of N items using Grover's algorithm?",
            "options": [
                "O(N)",
                "O(log N)",
                "O(√N)",
                "O(1)"
            ],
            "correct": 2,
            "explanation": "Grover's algorithm achieves a quadratic speedup of O(√N), turning a problem that would take 1,000,000 classical operations into roughly 1,000 quantum steps!"
        }
    }
]

PRESETS: Dict[str, Dict[str, Any]] = {
    "bell_phi_plus": {
        "name": "Bell State |Φ+⟩",
        "description": "(|00⟩ + |11⟩)/√2 - Canonical maximally entangled 2-qubit state",
        "qubits": 2,
        "steps": [
            [{"gate": "H", "qubit": 0}],
            [{"gate": "CX", "control": 0, "target": 1}],
            [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
        ]
    },
    "bell_psi_plus": {
        "name": "Bell State |Ψ+⟩",
        "description": "(|01⟩ + |10⟩)/√2 - Anti-correlated entangled state",
        "qubits": 2,
        "steps": [
            [{"gate": "H", "qubit": 0}],
            [{"gate": "X", "qubit": 1}],
            [{"gate": "CX", "control": 0, "target": 1}],
            [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
        ]
    },
    "superposition_plus": {
        "name": "Single Qubit Superposition |+⟩",
        "description": "(|0⟩ + |1⟩)/√2 - 50/50 probability distribution",
        "qubits": 1,
        "steps": [
            [{"gate": "H", "qubit": 0}],
            [{"gate": "M", "qubit": 0}]
        ]
    },
    "ghz_state": {
        "name": "3-Qubit GHZ State",
        "description": "(|000⟩ + |111⟩)/√2 - Tripartite quantum entanglement",
        "qubits": 3,
        "steps": [
            [{"gate": "H", "qubit": 0}],
            [{"gate": "CX", "control": 0, "target": 1}],
            [{"gate": "CX", "control": 1, "target": 2}],
            [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}, {"gate": "M", "qubit": 2}]
        ]
    },
    "quantum_teleportation": {
        "name": "Quantum Teleportation Protocol",
        "description": "Teleports the unknown quantum state of Q0 to Q2 using an entangled EPR pair on Q1-Q2",
        "qubits": 3,
        "steps": [
            # Prepare state to teleport on Q0 (e.g. H gate)
            [{"gate": "H", "qubit": 0}],
            # Create shared Bell pair between Q1 and Q2
            [{"gate": "H", "qubit": 1}],
            [{"gate": "CX", "control": 1, "target": 2}],
            # Bell measurement on sender qubits Q0 and Q1
            [{"gate": "CX", "control": 0, "target": 1}],
            [{"gate": "H", "qubit": 0}],
            [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}, {"gate": "M", "qubit": 2}]
        ]
    },
    "grover_search": {
        "name": "Grover's 2-Qubit Search (|11⟩)",
        "description": "Amplifies target state |11⟩ to 100% probability in one step",
        "qubits": 2,
        "steps": [
            [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
            [{"gate": "CZ", "control": 0, "target": 1}],
            [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
            [{"gate": "X", "qubit": 0}, {"gate": "X", "qubit": 1}],
            [{"gate": "CZ", "control": 0, "target": 1}],
            [{"gate": "X", "qubit": 0}, {"gate": "X", "qubit": 1}],
            [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}],
            [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}]
        ]
    },
    "quantum_rng": {
        "name": "Quantum Random Number Generator",
        "description": "Generates truly random 3-bit numbers using quantum superposition collapse",
        "qubits": 3,
        "steps": [
            [{"gate": "H", "qubit": 0}, {"gate": "H", "qubit": 1}, {"gate": "H", "qubit": 2}],
            [{"gate": "M", "qubit": 0}, {"gate": "M", "qubit": 1}, {"gate": "M", "qubit": 2}]
        ]
    }
}

CHALLENGES: List[Dict[str, Any]] = [
    {
        "id": "superposition_plus",
        "title": "Level 1: The Superposition Pioneer",
        "difficulty": "Beginner",
        "points": 100,
        "qubits": 1,
        "objective": "Transform a qubit starting in ground state |0⟩ into equal superposition |+⟩ = (|0⟩ + |1⟩)/√2. Target measurement: ~50% |0⟩ and ~50% |1⟩.",
        "hint": "Explore the single-qubit gate palette. Which gate rotates the state vector from the North Pole to the Equator?",
        "solution_criteria": "Hadamard (H) on Q0, followed by measurement."
    },
    {
        "id": "flip_qubit",
        "title": "Level 2: The Quantum Flip",
        "difficulty": "Beginner",
        "points": 100,
        "qubits": 1,
        "objective": "Prepare state |1⟩ with 100% measurement probability from initial state |0⟩.",
        "hint": "Which gate acts as a quantum inverter/NOT gate, rotating 180° around the X-axis?",
        "solution_criteria": "Pauli-X on Q0, followed by measurement."
    },
    {
        "id": "bell_state_phi_plus",
        "title": "Level 3: Einstein's 'Spooky' Bell State",
        "difficulty": "Intermediate",
        "points": 150,
        "qubits": 2,
        "objective": "Entangle two qubits to construct the Bell State |Φ+⟩ = (|00⟩ + |11⟩)/√2. Measurement must yield ONLY |00⟩ and |11⟩ with ~50% each.",
        "hint": "Put the first qubit in superposition with H, then connect it to the second qubit using a controlled two-qubit gate (CNOT).",
        "solution_criteria": "H on Q0, then CNOT(control=0, target=1), then measure both."
    },
    {
        "id": "phase_flip_minus",
        "title": "Level 4: Relative Phase Architect",
        "difficulty": "Intermediate",
        "points": 120,
        "qubits": 1,
        "objective": "Prepare the |-⟩ = (|0⟩ - |1⟩)/√2 state with a negative relative phase on the |1⟩ amplitude.",
        "hint": "You can either apply an X gate to get |1⟩ and then an H gate, or apply H followed by a Z gate.",
        "solution_criteria": "X followed by H, or H followed by Z on Q0."
    },
    {
        "id": "ghz_state",
        "title": "Level 5: Tripartite GHZ Entanglement",
        "difficulty": "Advanced",
        "points": 200,
        "qubits": 3,
        "objective": "Entangle 3 qubits into the Greenberger-Horne-Zeilinger state (|000⟩ + |111⟩)/√2. Only all-zeros or all-ones should be measured.",
        "hint": "Cascade CNOT gates starting from a superposition on Q0 across Q1 and Q2.",
        "solution_criteria": "H on Q0, CNOT(0->1), CNOT(1->2), measure all."
    }
]
