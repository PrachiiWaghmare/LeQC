# LeQC — Learn Quantum Computing

> **Explore. Build. Simulate. Master Quantum Computing.**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/PrachiiWaghmare/LeQC)

LeQC is a modern, interactive, gamified quantum computing education platform. It blends conceptual intuition, an interactive quantum circuit builder, live Qiskit Aer quantum simulation, 3D Bloch sphere visualizations, AI tutoring, and teacher analytics into an engaging experience.

---

## 🚀 Key Features

### 1. Interactive Onboarding & 3D Living Quantum Visual
- Immersive landing experience with a dynamic 3D quantum visualization (interactive Bloch sphere, floating quantum gates $H, X, Z, \text{CNOT}$, orbiting probability electron clouds).
- Seamless authentication modal (Login / Sign Up) and persona switcher (Student Learner vs. Quantum Educator).

### 2. Gamified Top-to-Bottom Learning Journey
- Linear, progressive learning path structured from start to finish:
  1. 🚀 **Quantum Basics**
  2. 🔬 **Qubits**
  3. 🌀 **Superposition**
  4. 🎛️ **Quantum Gates**
  5. 🔗 **Entanglement**
  6. 🌌 **Bell States**
  7. ⚡ **Grover's Algorithm**
  8. 🏆 **Quantum Mastery**
- Interactive mission nodes with multi-step bite-sized learning, checkpoints, live circuit tasks, quizzes, XP rewards, and level unlocks.

### 3. Visual Quantum Circuit Studio
- Drag-and-drop / click-to-place quantum circuit grid supporting multi-qubit registers.
- Single-qubit gates ($H, X, Y, Z, S, T$) and two-qubit entangling gates ($\text{CNOT}, CZ$).
- Instant preset circuits (Bell State $|\Phi^+\rangle$, Superposition $|+\rangle$, GHZ State, Grover's Search).

### 4. Real Quantum Simulation (Qiskit Aer)
- 1024-shot simulation executing locally with exact measurement counts, probabilities, statevectors, and partial trace Bloch vector computations.
- Local fallback simulation engine for instant offline response even without Python installed.

### 5. Multi-Perspective Quantum Visualizations
- **Interactive 3D Bloch Sphere** powered by Three.js with full OrbitControls, Cartesian axes, statevector orientation $|\psi\rangle$, and entanglement radius indicators.
- **Measurement Probability Distribution** chart with responsive animation.
- **Dirac Ket & Phase Inspector** displaying state amplitudes and quantum phase dials.

### 6. Context-Aware AI Quantum Tutor
- Explains circuits, diagnoses errors, generates circuits from plain English prompts, optimizes gate depth, and provides Socratic hints.
- Dual-engine architecture: powered by Google Gemini with offline pedagogical heuristics fallback.

### 7. Teacher & Educator Dashboard
- Class overview metrics (Active Students, Average Mastery, Missions Completed, Platform Health).
- Student roster tracking level progress, XP, completed missions, and individual progress inspection.

---

## 🛠️ Tech Stack & Architecture

- **Backend**:
  - Python 3.10+ (Tested on Python 3.13)
  - **Qiskit 2.5.2** & **Qiskit Aer 0.17.2** (Quantum circuit execution and statevector mechanics)
  - **Flask 3.1.2** with Flask-CORS
  - **Google GenAI SDK** (Gemini 2.5 Flash integration)
- **Frontend**:
  - Semantic HTML5, Modular Vanilla JavaScript (ES6+)
  - Custom Dark-Mode Cyber-Quantum Design System (Glassmorphic aesthetics, HSL color tokens)
  - **Three.js** & **OrbitControls** (3D Bloch sphere & living quantum hero visual)
  - **Chart.js** (Measurement probabilities histogram)
  - 100% self-contained local vendor libraries for offline reliability

---

## 🏁 Quickstart

### Prerequisites
- Python 3.10 or higher
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/PrachiiWaghmare/LeQC.git
   cd LeQC
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the application:
   ```bash
   python server.py
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

---

## 📄 License
This project is open-source under the MIT License.
