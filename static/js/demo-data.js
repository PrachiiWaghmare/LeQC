/**
 * QuBitLab AI - Centralized Demo Data & Learning Journey Engine
 * Single source of truth for Student & Teacher dashboards, Level Progression,
 * Missions, Challenges, XP, and Gamified Learning Path.
 */

window.QUBITLAB_DEMO = (function () {
  "use strict";

  // Master definition of all 7 Quantum Journey levels + Capstone
  const JOURNEY_LEVELS_MASTER = [
    {
      id: "quantum_basics",
      number: 1,
      title: "Quantum Basics",
      subtitle: "Classical vs Quantum Information & The Quantum Advantage",
      icon: "⚛️",
      xpReward: 50,
      unlockRequirement: "Starting level — already unlocked",
      summary: "Understand how quantum bits differ fundamentally from classical binary bits through continuous state spaces.",
      missions: [
        {
          id: "basics_m1",
          title: "Learn the Concept",
          icon: "📖",
          desc: "Compare classical binary bits (0 or 1) with quantum state vectors",
          type: "lesson",
          moduleId: "qubits"
        },
        {
          id: "basics_m2",
          title: "Quick Knowledge Check",
          icon: "🧠",
          desc: "Identify the physical properties that enable quantum speedup",
          type: "quiz"
        },
        {
          id: "basics_m3",
          title: "Level Challenge: Bit vs Qubit",
          icon: "🧩",
          desc: "Determine which state represents a valid quantum state on the unit circle",
          type: "challenge"
        }
      ],
      challenge: {
        id: "ch_basics",
        question: "Why can a quantum computer process certain problems exponentially faster than a classical computer?",
        options: [
          { id: "a", text: "Because quantum processors have higher clock frequencies than silicon chips.", correct: false, explanation: "Incorrect: Quantum processors operate at much lower clock speeds, but harness superposition and interference." },
          { id: "b", text: "Because an n-qubit system can exist in a superposition of 2ⁿ states simultaneously.", correct: true, explanation: "Correct! The state space scales exponentially as 2ⁿ, allowing simultaneous quantum computation over all basis states." },
          { id: "c", text: "Because quantum bits never generate heat or consume energy.", correct: false, explanation: "Incorrect: Dilution refrigerators consume significant power to maintain cryogenic temperatures." },
          { id: "d", text: "Because quantum bits can take on negative probabilities.", correct: false, explanation: "Incorrect: Probabilities are always non-negative (|c|² ≥ 0), though probability amplitudes can be negative or complex." }
        ]
      }
    },
    {
      id: "qubits",
      number: 2,
      title: "Qubits",
      subtitle: "State Vectors, |0⟩ & |1⟩ Basis, and the 3D Bloch Sphere",
      icon: "🌐",
      xpReward: 60,
      unlockRequirement: "Complete Quantum Basics to unlock",
      summary: "Explore the geometric representation of a single qubit on the Bloch sphere, spanning pure states from North to South pole.",
      missions: [
        {
          id: "qubits_m1",
          title: "Understand Qubits",
          icon: "📖",
          desc: "Dirac ket notation: |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1",
          type: "lesson",
          moduleId: "qubits"
        },
        {
          id: "qubits_m2",
          title: "Experiment with |0⟩ and |1⟩",
          icon: "⚛️",
          desc: "Inspect North pole [0, 0, 1] and South pole [0, 0, -1] on the Bloch sphere",
          type: "experiment"
        },
        {
          id: "qubits_m3",
          title: "Run a Simple Circuit",
          icon: "▶️",
          desc: "Initialize a qubit in |0⟩ and measure in the computational Z basis",
          type: "circuit"
        },
        {
          id: "qubits_m4",
          title: "Level Challenge: Qubit Flip",
          icon: "🧩",
          desc: "Predict the state after applying a Pauli-X gate to |0⟩",
          type: "challenge"
        }
      ],
      challenge: {
        id: "ch_qubits",
        question: "What state will the qubit be in after applying a Pauli-X gate to the ground state |0⟩?",
        options: [
          { id: "a", text: "It remains unchanged in state |0⟩.", correct: false, explanation: "Incorrect: The Identity (I) gate leaves |0⟩ unchanged, while the X gate acts as a bit-flip." },
          { id: "b", text: "It transitions to |1⟩ with 100% deterministic probability.", correct: true, explanation: "Correct! The Pauli-X operator maps X|0⟩ = |1⟩, flipping the Bloch vector from North pole to South pole." },
          { id: "c", text: "It enters an equal superposition (|0⟩ + |1⟩)/√2.", correct: false, explanation: "Incorrect: The Hadamard (H) gate creates equal superposition, not Pauli-X." },
          { id: "d", text: "The qubit collapses and destroys its state.", correct: false, explanation: "Incorrect: The X gate is a unitary, reversible quantum gate." }
        ]
      }
    },
    {
      id: "superposition",
      number: 3,
      title: "Superposition",
      subtitle: "Hadamard Gates, Probability Amplitudes & Statevectors",
      icon: "🟠",
      xpReward: 50,
      unlockRequirement: "Complete Qubits to unlock",
      summary: "Master the fundamental quantum property where a qubit simultaneously holds both |0⟩ and |1⟩ until measured.",
      missions: [
        {
          id: "super_m1",
          title: "Learn Superposition",
          icon: "📖",
          desc: "Explore linear combinations of orthogonal basis states and probability amplitudes",
          type: "lesson",
          moduleId: "superposition"
        },
        {
          id: "super_m2",
          title: "Build a Superposition Circuit",
          icon: "⚛️",
          desc: "Place a Hadamard (H) gate on wire Q0 in the Visual Circuit Studio",
          type: "circuit",
          preset: "superposition_plus"
        },
        {
          id: "super_m3",
          title: "Run the Circuit",
          icon: "▶️",
          desc: "Execute 1024 simulation shots using the local Qiskit Aer backend",
          type: "simulation"
        },
        {
          id: "super_m4",
          title: "Understand Measurement Probabilities",
          icon: "📊",
          desc: "Verify Born's rule: |1/√2|² = 50% probability for |0⟩ and 50% for |1⟩",
          type: "prob_analysis"
        },
        {
          id: "super_m5",
          title: "Final Level Challenge",
          icon: "🧩",
          desc: "Solve the interactive concept challenge to master Superposition and unlock Level 4",
          type: "challenge"
        }
      ],
      challenge: {
        id: "ch_superposition",
        question: "What happens to the measurement probabilities after applying an H (Hadamard) gate to the ground state |0⟩?",
        context: "You placed an H gate on wire Q0 and ran 1024 shots on Qiskit Aer.",
        options: [
          {
            id: "a",
            text: "The qubit collapses immediately to |1⟩ with 100% certainty.",
            correct: false,
            explanation: "Incorrect: The X gate flips deterministically to |1⟩, whereas the H gate creates a quantum superposition."
          },
          {
            id: "b",
            text: "The state splits into equal superposition (|+⟩) with ~50% probability of |0⟩ and ~50% probability of |1⟩.",
            correct: true,
            explanation: "Correct! The Hadamard gate maps |0⟩ to (1/√2)|0⟩ + (1/√2)|1⟩, creating equal measurement probabilities of 50% each."
          },
          {
            id: "c",
            text: "The qubit loses all phase information and cancels out to 0% probability everywhere.",
            correct: false,
            explanation: "Incorrect: Total probability is always conserved at 100% (normalization condition)."
          },
          {
            id: "d",
            text: "The qubit stays in |0⟩ unless measured twice in succession.",
            correct: false,
            explanation: "Incorrect: Unitary gates transform states instantaneously before measurement takes place."
          }
        ]
      }
    },
    {
      id: "quantum_gates",
      number: 4,
      title: "Quantum Gates",
      subtitle: "Pauli-X, Y, Z, Phase S, and T Rotations",
      icon: "⚡",
      xpReward: 65,
      unlockRequirement: "Complete Superposition to unlock this level",
      summary: "Understand single-qubit unitary rotations, phase shifts, and gate algebra on the Bloch sphere.",
      missions: [
        {
          id: "gates_m1",
          title: "Master Pauli Rotations",
          icon: "📖",
          desc: "Understand rotations around X, Y, and Z axes on the Bloch sphere",
          type: "lesson",
          moduleId: "pauli_gates"
        },
        {
          id: "gates_m2",
          title: "Build Multi-Gate Sequences",
          icon: "⚛️",
          desc: "Observe how non-commuting gates (like X·Z ≠ Z·X) produce distinct states",
          type: "circuit"
        },
        {
          id: "gates_m3",
          title: "Simulate Phase Transformations",
          icon: "▶️",
          desc: "Track complex phase angles with S (90°) and T (45°) phase gates",
          type: "simulation"
        },
        {
          id: "gates_m4",
          title: "Final Level Challenge: Gate Inversion",
          icon: "🧩",
          desc: "Construct a circuit that changes |0⟩ into |1⟩ using minimal gate depth",
          type: "challenge"
        }
      ],
      challenge: {
        id: "ch_gates",
        question: "Which single gate transforms state |0⟩ into |1⟩?",
        options: [
          { id: "a", text: "Pauli-Z gate", correct: false, explanation: "Incorrect: Z leaves |0⟩ unchanged because Z|0⟩ = |0⟩." },
          { id: "b", text: "Pauli-X gate", correct: true, explanation: "Correct! The Pauli-X gate acts as a quantum NOT gate, flipping |0⟩ to |1⟩." },
          { id: "c", text: "Hadamard gate", correct: false, explanation: "Incorrect: H creates equal superposition |+⟩, not |1⟩." },
          { id: "d", text: "Phase S gate", correct: false, explanation: "Incorrect: S applies a 90° phase shift to |1⟩, leaving |0⟩ unchanged." }
        ]
      }
    },
    {
      id: "entanglement",
      number: 5,
      title: "Entanglement",
      subtitle: "Two-Qubit States & Non-Local Quantum Correlations",
      icon: "🔗",
      xpReward: 75,
      unlockRequirement: "Complete Quantum Gates to unlock this level",
      summary: "Discover quantum non-locality where the measurement of one qubit instantaneously determines the state of another.",
      missions: [
        {
          id: "entang_m1",
          title: "Understanding Non-Locality",
          icon: "📖",
          desc: "Einstein-Podolsky-Rosen paradox and state non-separability",
          type: "lesson",
          moduleId: "entanglement"
        },
        {
          id: "entang_m2",
          title: "Controlled-NOT (CNOT) Mechanics",
          icon: "⚛️",
          desc: "Flips the target qubit if and only if the control qubit is in state |1⟩",
          type: "circuit"
        },
        {
          id: "entang_m3",
          title: "Simulate Correlated Outcomes",
          icon: "▶️",
          desc: "Verify that entangled measurements always yield matching pairs",
          type: "simulation"
        },
        {
          id: "entang_m4",
          title: "Final Level Challenge: Entanglement Radius",
          icon: "🧩",
          desc: "Observe why the Bloch vector shrinks inside the sphere for entangled subsystems",
          type: "challenge"
        }
      ],
      challenge: {
        id: "ch_entang",
        question: "When two qubits are maximally entangled, what is the length of the individual reduced Bloch vector for each qubit?",
        options: [
          { id: "a", text: "r = 1.0 (on the surface of the sphere)", correct: false, explanation: "Incorrect: Pure states have r = 1.0, but entangled subsystems form maximally mixed states." },
          { id: "b", text: "r = 0.0 (at the exact center of the Bloch sphere)", correct: true, explanation: "Correct! For a maximally entangled pair, tracing out one qubit leaves the other in a completely mixed state at the origin." },
          { id: "c", text: "r = 2.0 (outside the sphere)", correct: false, explanation: "Incorrect: Bloch vectors are strictly bounded inside or on the unit sphere (r ≤ 1)." },
          { id: "d", text: "r = -1.0", correct: false, explanation: "Incorrect: The vector radius is a non-negative norm." }
        ]
      }
    },
    {
      id: "bell_states",
      number: 6,
      title: "Bell States",
      subtitle: "The Four Maximally Entangled Two-Qubit States (|Φ±⟩, |Ψ±⟩)",
      icon: "🌌",
      xpReward: 80,
      unlockRequirement: "Complete Entanglement to unlock this level",
      summary: "Construct and analyze all four canonical Bell basis states used in quantum teleportation and cryptography.",
      missions: [
        {
          id: "bell_m1",
          title: "The Four Bell States",
          icon: "📖",
          desc: "Understand |Φ+⟩, |Φ-⟩, |Ψ+⟩, and |Ψ-⟩ mathematical forms",
          type: "lesson"
        },
        {
          id: "bell_m2",
          title: "Construct Bell Circuit (H + CNOT)",
          icon: "⚛️",
          desc: "Wire an H gate on Q0 followed by a CNOT from Q0 to Q1",
          type: "circuit",
          preset: "bell_phi_plus"
        },
        {
          id: "bell_m3",
          title: "1024-Shot Correlation Analysis",
          icon: "▶️",
          desc: "Simulate and verify that only |00⟩ (~50%) and |11⟩ (~50%) occur",
          type: "simulation"
        },
        {
          id: "bell_m4",
          title: "Final Level Challenge: Phase Switch",
          icon: "🧩",
          desc: "Transform |Φ+⟩ into |Φ-⟩ by inserting a Pauli-Z phase gate",
          type: "challenge"
        }
      ],
      challenge: {
        id: "ch_bell",
        question: "Which gate sequence creates the canonical Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 from initial state |00⟩?",
        options: [
          { id: "a", text: "H on Q0, then CNOT with control Q0 and target Q1", correct: true, explanation: "Correct! H on Q0 creates (|0⟩+|1⟩)/√2 |0⟩ = (|00⟩+|10⟩)/√2, then CNOT flips Q1 when Q0=1 to produce (|00⟩+|11⟩)/√2." },
          { id: "b", text: "X on Q0, then X on Q1", correct: false, explanation: "Incorrect: This simply creates the unentangled product state |11⟩." },
          { id: "c", text: "H on Q0, then H on Q1", correct: false, explanation: "Incorrect: This creates an unentangled product of superpositions |++⟩." },
          { id: "d", text: "CNOT without any prior Hadamard gate", correct: false, explanation: "Incorrect: If control qubit is |0⟩, CNOT does nothing and leaves the state |00⟩." }
        ]
      }
    },
    {
      id: "grover",
      number: 7,
      title: "Grover's Algorithm",
      subtitle: "Quantum Amplitude Amplification & Database Search",
      icon: "🔍",
      xpReward: 100,
      unlockRequirement: "Complete Bell States to unlock this level",
      summary: "Synthesize oracle and diffusion operators to solve unstructured search problems in O(√N) time.",
      missions: [
        {
          id: "grover_m1",
          title: "Oracle & Diffusion Operators",
          icon: "📖",
          desc: "How amplitude amplification flips marked states and inverts about the mean",
          type: "lesson",
          moduleId: "grover"
        },
        {
          id: "grover_m2",
          title: "Construct Phase Oracle",
          icon: "⚛️",
          desc: "Mark target state |11⟩ with a negative relative phase (-1)",
          type: "circuit",
          preset: "grover_search"
        },
        {
          id: "grover_m3",
          title: "Build Diffusion Operator",
          icon: "⚡",
          desc: "Apply Hadamard layers and reflection around the average amplitude",
          type: "circuit"
        },
        {
          id: "grover_m4",
          title: "Simulate Probability Peak",
          icon: "▶️",
          desc: "Observe marked state |11⟩ reach 100% measurement probability in 1 iteration",
          type: "simulation"
        },
        {
          id: "grover_m5",
          title: "Final Level Challenge: 2-Qubit Search",
          icon: "🧩",
          desc: "Verify quadratic speedup over classical brute force search",
          type: "challenge"
        }
      ],
      challenge: {
        id: "ch_grover",
        question: "For an unstructured database of N items, how many queries does Grover's quantum search require compared to classical search?",
        options: [
          { id: "a", text: "Classical: O(N) queries; Grover: O(√N) queries (quadratic speedup)", correct: true, explanation: "Correct! Grover's algorithm achieves optimal O(√N) query complexity, finding an item among 1,000,000 in ~1,000 steps." },
          { id: "b", text: "Both require O(N) queries.", correct: false, explanation: "Incorrect: Grover provides a proven quadratic speedup." },
          { id: "c", text: "Grover requires O(1) single query for any database size.", correct: false, explanation: "Incorrect: Grover is bounded by O(√N), which is proven to be optimal for black-box search." },
          { id: "d", text: "Grover requires exponential queries O(2ⁿ).", correct: false, explanation: "Incorrect: 2ⁿ is the size of the database N." }
        ]
      }
    }
  ];

  // Initial student state for Aarav Sharma (Beginner / Early Intermediate)
  const INITIAL_STUDENT = {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@quantumclass.edu",
    avatar: "AS",
    overallProgress: 28,      // ~28%
    totalXP: 280,              // 280 XP
    streakDays: 4,             // 4-day learning streak
    rank: "Quantum Explorer (Level 3)",
    quizAverage: 68,           // ~68%
    challengesCompletedCount: 1,
    totalChallengesCount: 5,
    currentLevelId: "superposition",
    levelStates: {
      quantum_basics: {
        status: "completed",
        progress: 100,
        xpEarned: 50,
        completedMissions: ["basics_m1", "basics_m2", "basics_m3"],
        challengePassed: true
      },
      qubits: {
        status: "completed",
        progress: 100,
        xpEarned: 60,
        completedMissions: ["qubits_m1", "qubits_m2", "qubits_m3", "qubits_m4"],
        challengePassed: true
      },
      superposition: {
        status: "in_progress",
        progress: 60,          // 4/5 missions = 60-80% progress
        xpEarned: 30,
        completedMissions: ["super_m1", "super_m2", "super_m3", "super_m4"],
        challengePassed: false
      },
      quantum_gates: {
        status: "locked",
        progress: 0,
        xpEarned: 0,
        completedMissions: [],
        challengePassed: false
      },
      entanglement: {
        status: "locked",
        progress: 0,
        xpEarned: 0,
        completedMissions: [],
        challengePassed: false
      },
      bell_states: {
        status: "locked",
        progress: 0,
        xpEarned: 0,
        completedMissions: [],
        challengePassed: false
      },
      grover: {
        status: "locked",
        progress: 0,
        xpEarned: 0,
        completedMissions: [],
        challengePassed: false
      }
    },
    savedCircuits: [
      { name: "Superposition Demo", qubits: 2, description: "Hadamard gate on qubit 0 (|+⟩)", lastEdited: "Today" },
      { name: "Basic X Gate", qubits: 1, description: "Pauli-X flip demonstration (|1⟩)", lastEdited: "Yesterday" }
    ],
    recentActivity: [
      { type: "challenge", icon: "award", text: "Ready to solve Level 3 Superposition Challenge", time: "Just now" },
      { type: "circuit",   icon: "zap",   text: "Executed 1024-shot simulation on Superposition circuit", time: "1h ago" },
      { type: "circuit",   icon: "zap",   text: "Created 'Superposition Demo' in Circuit Studio", time: "2h ago" },
      { type: "module",    icon: "book",  text: "Completed Superposition concept lesson", time: "4h ago" },
      { type: "quiz",      icon: "edit",  text: "Scored 7/10 on Quantum Basics concept checkpoint", time: "Yesterday" },
      { type: "challenge", icon: "check", text: "Completed Level 2: Qubit Flip Challenge", time: "2 days ago" }
    ],
    recommendation: {
      levelId: "superposition",
      levelTitle: "Level 3: Superposition",
      actionText: "Take Level Challenge →",
      headline: "Superposition is currently in progress",
      detail: "Aarav has completed the concept lesson, circuit experiment, and simulation analysis. Solving the Level Challenge will master Superposition and unlock Quantum Gates (+50 XP)!",
      alertNote: "Current quiz score is 68% — recommend reviewing probability amplitudes before proceeding."
    }
  };

  // Central active student clone
  let studentData = JSON.parse(JSON.stringify(INITIAL_STUDENT));

  // Teacher Class Roster (10 Students)
  const CLASS_ROSTER = [
    {
      id: 1,
      name: "Aarav Sharma",
      avatar: "AS",
      progress: 28,
      currentLevel: "Superposition",
      quizAverage: 68,
      modulesCompleted: 2,
      totalModules: 7,
      challengesDone: 1,
      lastActive: "Today",
      status: "Active",
      recentActivity: [
        "Completed Quantum Basics",
        "Completed Qubits level",
        "Built Superposition circuit in Studio",
        "Ready for Superposition Challenge"
      ],
      recommendation: {
        topic: "Superposition",
        score: 68,
        note: "Superposition is currently in progress (60%). Aarav has finished the circuit experiment and needs to pass the final challenge to unlock Quantum Gates."
      }
    },
    {
      id: 2,
      name: "Ananya Patil",
      avatar: "AP",
      progress: 46,
      currentLevel: "Quantum Gates",
      quizAverage: 74,
      modulesCompleted: 3,
      totalModules: 7,
      challengesDone: 2,
      lastActive: "Today",
      status: "Active",
      recentActivity: ["Passed Superposition Challenge", "Constructed Pauli-X circuit", "Scored 74% on Gates quiz"],
      recommendation: { topic: "Quantum Gates", score: 74, note: "Making good progress — ready to introduce Entanglement and CNOT." }
    },
    {
      id: 3,
      name: "Riya Mehta",
      avatar: "RM",
      progress: 19,
      currentLevel: "Qubits",
      quizAverage: 61,
      modulesCompleted: 1,
      totalModules: 7,
      challengesDone: 0,
      lastActive: "Yesterday",
      status: "Needs Attention",
      recentActivity: ["Completed Quantum Basics (61%)", "Stuck on Bloch sphere orientation", "Inactive 1 day"],
      recommendation: { topic: "Qubits", score: 61, note: "Low quiz score (61%) — recommend 3D Bloch sphere interactive practice." }
    },
    {
      id: 4,
      name: "Kabir Shah",
      avatar: "KS",
      progress: 63,
      currentLevel: "Entanglement",
      quizAverage: 82,
      modulesCompleted: 4,
      totalModules: 7,
      challengesDone: 3,
      lastActive: "Today",
      status: "Active",
      recentActivity: ["Completed Quantum Gates", "Passed Gate Inversion Challenge", "Simulated CNOT Bell state"],
      recommendation: { topic: "Entanglement", score: 82, note: "Strong performer — ready to master Bell States." }
    },
    {
      id: 5,
      name: "Ishita Joshi",
      avatar: "IJ",
      progress: 35,
      currentLevel: "Superposition",
      quizAverage: 70,
      modulesCompleted: 2,
      totalModules: 7,
      challengesDone: 1,
      lastActive: "2 days ago",
      status: "Active",
      recentActivity: ["Passed Qubits Challenge", "Started Superposition lesson"],
      recommendation: { topic: "Superposition", score: 70, note: "Recommend completing Hadamard experiment in Circuit Studio." }
    },
    {
      id: 6,
      name: "Dev Patel",
      avatar: "DP",
      progress: 55,
      currentLevel: "Quantum Gates",
      quizAverage: 78,
      modulesCompleted: 3,
      totalModules: 7,
      challengesDone: 2,
      lastActive: "Today",
      status: "Active",
      recentActivity: ["Completed Superposition", "Passed Gate Challenge", "Simulated Phase S and T rotations"],
      recommendation: { topic: "Quantum Gates", score: 78, note: "Consistent progress — introduce multi-qubit gates next." }
    },
    {
      id: 7,
      name: "Priya Nair",
      avatar: "PN",
      progress: 12,
      currentLevel: "Quantum Basics",
      quizAverage: 55,
      modulesCompleted: 0,
      totalModules: 7,
      challengesDone: 0,
      lastActive: "3 days ago",
      status: "Needs Attention",
      recentActivity: ["Started Quantum Basics", "Quiz score 55%", "Inactive 3 days"],
      recommendation: { topic: "Quantum Basics", score: 55, note: "Very early stage and inactive — needs direct engagement review." }
    },
    {
      id: 8,
      name: "Arjun Reddy",
      avatar: "AR",
      progress: 78,
      currentLevel: "Bell States",
      quizAverage: 88,
      modulesCompleted: 5,
      totalModules: 7,
      challengesDone: 4,
      lastActive: "Today",
      status: "Active",
      recentActivity: ["Completed Entanglement", "Passed Bell State Challenge", "Preparing for Grover Search"],
      recommendation: { topic: "Bell States", score: 88, note: "Top student — ready for Grover's Algorithm capstone." }
    },
    {
      id: 9,
      name: "Meera Kulkarni",
      avatar: "MK",
      progress: 31,
      currentLevel: "Superposition",
      quizAverage: 65,
      modulesCompleted: 2,
      totalModules: 7,
      challengesDone: 1,
      lastActive: "Today",
      status: "Active",
      recentActivity: ["Completed Qubits", "Working on Superposition probabilities"],
      recommendation: { topic: "Superposition", score: 65, note: "Provide extra feedback on probability amplitude calculations." }
    },
    {
      id: 10,
      name: "Rohan Gupta",
      avatar: "RG",
      progress: 48,
      currentLevel: "Quantum Gates",
      quizAverage: 76,
      modulesCompleted: 3,
      totalModules: 7,
      challengesDone: 2,
      lastActive: "Yesterday",
      status: "Active",
      recentActivity: ["Passed Superposition Challenge", "Working through Pauli gates"],
      recommendation: { topic: "Quantum Gates", score: 76, note: "Solid understanding — test with non-commuting gate challenges." }
    }
  ];

  const CLASS_ANALYTICS = {
    totalStudents: 24,
    activeToday: 18,
    averageProgress: 42,
    averageQuizScore: 71,
    moduleCompletion: [
      { title: "Quantum Basics",    pct: 92 },
      { title: "Qubits",            pct: 85 },
      { title: "Superposition",     pct: 68 },
      { title: "Quantum Gates",     pct: 46 },
      { title: "Entanglement",      pct: 28 },
      { title: "Bell States",       pct: 18 },
      { title: "Grover Algorithm",  pct: 8 }
    ],
    quizAverages: [
      { title: "Quantum Basics",    avg: 78 },
      { title: "Qubits",            avg: 74 },
      { title: "Superposition",     avg: 68 },
      { title: "Quantum Gates",     avg: 72 },
      { title: "Entanglement",      avg: 67 },
      { title: "Bell States",       avg: 64 },
      { title: "Grover Algorithm",  avg: 60 }
    ]
  };

  const TEACHER = {
    name: "Prof. Radha Krishnan",
    email: "r.krishnan@quantumcollege.edu",
    subject: "Quantum Computing & Algorithms",
    institution: "National Institute of Quantum Sciences"
  };

  // State Change Subscribers (Reactive listeners for UI re-render)
  const listeners = [];
  function subscribe(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }
  function notifyAll() {
    listeners.forEach((fn) => {
      try { fn(studentData); } catch (e) { console.error("Subscriber error", e); }
    });
  }

  // Synchronize Aarav in the class roster whenever studentData changes
  function syncRosterWithStudent() {
    if (CLASS_ROSTER && CLASS_ROSTER[0]) {
      const aarav = CLASS_ROSTER[0];
      aarav.progress = studentData.overallProgress;
      aarav.quizAverage = studentData.quizAverage;
      aarav.challengesDone = studentData.challengesCompletedCount;

      const currLvl = JOURNEY_LEVELS_MASTER.find((l) => l.id === studentData.currentLevelId);
      aarav.currentLevel = currLvl ? currLvl.title : "Superposition";

      // Count completed levels
      const completedLevels = Object.values(studentData.levelStates).filter((s) => s.status === "completed").length;
      aarav.modulesCompleted = completedLevels;

      if (studentData.levelStates.superposition.status === "completed") {
        aarav.recommendation = {
          topic: "Quantum Gates",
          score: studentData.quizAverage,
          note: "🎉 Superposition mastered (+50 XP)! Aarav has unlocked Quantum Gates and is ready to explore Pauli rotations."
        };
      } else {
        aarav.recommendation = {
          topic: "Superposition",
          score: studentData.quizAverage,
          note: "Superposition is currently in progress (60%). Aarav has finished the circuit experiment and needs to pass the final challenge to unlock Quantum Gates."
        };
      }
    }
  }

  // Public Query Methods
  function getMasterLevels() {
    return JOURNEY_LEVELS_MASTER;
  }

  function getStudent() {
    return studentData;
  }

  function getStudentLevels() {
    return JOURNEY_LEVELS_MASTER.map((level) => {
      const state = studentData.levelStates[level.id] || {
        status: "locked",
        progress: 0,
        xpEarned: 0,
        completedMissions: [],
        challengePassed: false
      };
      return {
        ...level,
        status: state.status,
        progress: state.progress,
        xpEarned: state.xpEarned,
        completedMissions: state.completedMissions,
        challengePassed: state.challengePassed
      };
    });
  }

  function getLevel(levelId) {
    const master = JOURNEY_LEVELS_MASTER.find((l) => l.id === levelId);
    if (!master) return null;
    const state = studentData.levelStates[levelId] || {
      status: "locked",
      progress: 0,
      xpEarned: 0,
      completedMissions: [],
      challengePassed: false
    };
    return {
      ...master,
      status: state.status,
      progress: state.progress,
      xpEarned: state.xpEarned,
      completedMissions: state.completedMissions,
      challengePassed: state.challengePassed
    };
  }

  // Progression Action: Complete a mission in a level
  function completeMission(levelId, missionId) {
    const levelState = studentData.levelStates[levelId];
    if (!levelState || levelState.status === "locked") return false;

    if (!levelState.completedMissions.includes(missionId)) {
      levelState.completedMissions.push(missionId);
    }

    const master = JOURNEY_LEVELS_MASTER.find((l) => l.id === levelId);
    if (master) {
      const totalMissions = master.missions.length;
      const doneCount = levelState.completedMissions.length;
      levelState.progress = Math.min(100, Math.round((doneCount / totalMissions) * 100));
    }

    syncRosterWithStudent();
    notifyAll();
    return true;
  }

  // Progression Action: Pass Level Challenge & Complete Level (Level Unlock Flow)
  function passLevelChallenge(levelId) {
    const levelState = studentData.levelStates[levelId];
    if (!levelState || levelState.status === "locked") return null;

    const master = JOURNEY_LEVELS_MASTER.find((l) => l.id === levelId);
    if (!master) return null;

    // Mark challenge passed and level complete
    levelState.challengePassed = true;
    levelState.status = "completed";
    levelState.progress = 100;
    levelState.xpEarned = master.xpReward;

    // Ensure all missions are marked complete
    master.missions.forEach((m) => {
      if (!levelState.completedMissions.includes(m.id)) {
        levelState.completedMissions.push(m.id);
      }
    });

    // Award XP
    studentData.totalXP += master.xpReward;
    studentData.challengesCompletedCount = Math.min(
      studentData.totalChallengesCount,
      studentData.challengesCompletedCount + 1
    );

    // Recalculate overall progress across 7 levels
    const completedLevelsCount = Object.values(studentData.levelStates).filter(
      (s) => s.status === "completed"
    ).length;
    studentData.overallProgress = Math.min(
      100,
      Math.round((completedLevelsCount / JOURNEY_LEVELS_MASTER.length) * 100)
    );

    // Determine and unlock the next sequential level
    const currentIndex = JOURNEY_LEVELS_MASTER.findIndex((l) => l.id === levelId);
    let nextLevel = null;
    if (currentIndex >= 0 && currentIndex + 1 < JOURNEY_LEVELS_MASTER.length) {
      nextLevel = JOURNEY_LEVELS_MASTER[currentIndex + 1];
      const nextState = studentData.levelStates[nextLevel.id];
      if (nextState && nextState.status === "locked") {
        nextState.status = "in_progress";
        nextState.progress = 0;
        studentData.currentLevelId = nextLevel.id;
      }
    }

    // Add recent activity item
    studentData.recentActivity.unshift({
      type: "challenge",
      icon: "award",
      text: `Passed ${master.title} Challenge (+${master.xpReward} XP)!`,
      time: "Just now"
    });

    if (nextLevel) {
      studentData.recentActivity.unshift({
        type: "module",
        icon: "unlock",
        text: `Unlocked Level ${nextLevel.number}: ${nextLevel.title}!`,
        time: "Just now"
      });
      studentData.recommendation = {
        levelId: nextLevel.id,
        levelTitle: `Level ${nextLevel.number}: ${nextLevel.title}`,
        actionText: "Begin Level →",
        headline: `Level ${nextLevel.number}: ${nextLevel.title} is now unlocked!`,
        detail: `Congratulations on mastering ${master.title}! Proceed to ${nextLevel.title} to continue your journey.`,
        alertNote: null
      };
    }

    syncRosterWithStudent();
    notifyAll();

    return {
      completedLevel: master,
      unlockedLevel: nextLevel,
      xpEarned: master.xpReward,
      newTotalXP: studentData.totalXP,
      newOverallProgress: studentData.overallProgress
    };
  }

  // Reset to initial prototype state (for demo repeatability)
  function resetToInitial() {
    studentData = JSON.parse(JSON.stringify(INITIAL_STUDENT));
    syncRosterWithStudent();
    notifyAll();
  }

  // Initialize sync
  syncRosterWithStudent();

  return {
    // Data objects
    DEMO_STUDENT: studentData,
    CLASS_ROSTER,
    CLASS_ANALYTICS,
    TEACHER,
    JOURNEY_LEVELS: JOURNEY_LEVELS_MASTER,

    // Methods
    getMasterLevels,
    getStudent,
    getStudentLevels,
    getLevel,
    completeMission,
    passLevelChallenge,
    resetToInitial,
    subscribe
  };
})();
