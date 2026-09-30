/**
 * QuBitLab AI - Main Frontend Application Logic
 * Integrates Circuit Studio, Three.js 3D Bloch Sphere, Chart.js Probabilities,
 * Interactive Curriculum, Coding Lab, Challenges, and Context-Aware AI Tutor.
 */

(function () {
  'use strict';

  // =========================================================================
  // Application State
  // =========================================================================
  const state = {
    activeView: 'dashboard',
    circuit: {
      qubits: 2,
      steps: [
        [{ gate: 'H', qubit: 0 }],
        [{ gate: 'CX', control: 0, target: 1 }],
        [{ gate: 'M', qubit: 0 }, { gate: 'M', qubit: 1 }]
      ]
    },
    activeGateTool: 'H',
    cnotPendingControl: null, // Used when placing multi-qubit gates
    simulationResult: null,
    curriculum: [],
    activeModule: null,
    challenges: [],
    activeChallenge: null,
    selectedBlochQubit: 0,
    shots: 1024,
    geminiApiKey: localStorage.getItem('qubitlab_gemini_key') || '',
    authToken: localStorage.getItem('qubitlab_token') || null,
    currentUser: null,
    learnerDashboard: null,
    savedCircuits: [],
    progress: {
      completedModules: [],
      solvedChallenges: [],
      simulationsCount: 0,
      xp: 0
    }
  };

  function saveProgress() {
    updateProgressUI();
  }

  // =========================================================================
  // DOM Elements References
  // =========================================================================
  const dom = {
    // Navigation & Auth Header
    navTabs: document.querySelectorAll('.nav-tab-btn'),
    viewSections: document.querySelectorAll('.view-section'),
    engineStatusPill: document.getElementById('engine-status-pill'),
    openAiTutorBtn: document.getElementById('open-ai-tutor-btn'),
    settingsModalBtn: document.getElementById('settings-modal-btn'),
    authNavGuest: document.getElementById('auth-nav-guest'),
    authNavUser: document.getElementById('auth-nav-user'),
    navLoginBtn: document.getElementById('nav-login-btn'),
    navRegisterBtn: document.getElementById('nav-register-btn'),
    navUserName: document.getElementById('nav-user-name'),
    navMyCircuitsBtn: document.getElementById('nav-my-circuits-btn'),
    navLogoutBtn: document.getElementById('nav-logout-btn'),

    // Dashboard Personalization
    heroLearnerName: document.getElementById('hero-learner-name'),
    heroProgressPct: document.getElementById('hero-progress-pct'),
    heroProgressBar: document.getElementById('hero-progress-bar'),
    heroContinueTopic: document.getElementById('hero-continue-topic'),
    heroContinueLearningBtn: document.getElementById('hero-continue-learning-btn'),
    heroStartLearningBtn: document.getElementById('hero-start-learning-btn'),
    heroQuickBellBtn: document.getElementById('hero-quick-bell-btn'),
    heroTakeChallengeBtn: document.getElementById('hero-take-challenge-btn'),
    statModulesCompleted: document.getElementById('stat-modules-completed'),
    statQuizAvg: document.getElementById('stat-quiz-avg'),
    statChallengesSolved: document.getElementById('stat-challenges-solved'),
    statSavedCircuits: document.getElementById('stat-saved-circuits'),
    statCircuitsRun: document.getElementById('stat-circuits-run'),
    statSimulatorShots: document.getElementById('stat-simulator-shots'),
    dashboardActivityFeed: document.getElementById('dashboard-activity-feed'),
    viewAllModulesLink: document.getElementById('view-all-modules-link'),
    openStudioLink: document.getElementById('open-studio-link'),

    // Academy
    moduleNavList: document.getElementById('module-nav-list'),
    moduleCategoryPill: document.getElementById('module-category-pill'),
    moduleDurationPill: document.getElementById('module-duration-pill'),
    moduleTitleHeading: document.getElementById('module-title-heading'),
    moduleSubtitleHeading: document.getElementById('module-subtitle-heading'),
    moduleContentStream: document.getElementById('module-content-stream'),
    superpositionThetaSlider: document.getElementById('superposition-theta-slider'),
    sliderThetaVal: document.getElementById('slider-theta-val'),
    sliderStateLabel: document.getElementById('slider-state-label'),
    interactiveStateEquation: document.getElementById('interactive-state-equation'),
    probBar0: document.getElementById('prob-bar-0'),
    probBar1: document.getElementById('prob-bar-1'),
    academyOpenCircuitBtn: document.getElementById('academy-open-circuit-btn'),
    quizQuestionText: document.getElementById('quiz-question-text'),
    quizOptionsList: document.getElementById('quiz-options-list'),
    quizExplanationBox: document.getElementById('quiz-explanation-box'),

    // Studio
    studioQubitsSelect: document.getElementById('studio-qubits-select'),
    studioPresetsSelect: document.getElementById('studio-presets-select'),
    studioAddStepBtn: document.getElementById('studio-add-step-btn'),
    studioRemoveStepBtn: document.getElementById('studio-remove-step-btn'),
    studioOptimizeBtn: document.getElementById('studio-optimize-btn'),
    studioSaveCircuitBtn: document.getElementById('studio-save-circuit-btn'),
    studioMyCircuitsBtn: document.getElementById('studio-my-circuits-btn'),
    studioClearBtn: document.getElementById('studio-clear-btn'),
    studioRunSimBtn: document.getElementById('studio-run-sim-btn'),
    circuitWireGrid: document.getElementById('circuit-wire-grid'),
    gateTokens: document.querySelectorAll('.gate-token'),
    probabilitiesChartCanvas: document.getElementById('probabilities-chart-canvas'),
    blochThreeContainer: document.getElementById('bloch-three-canvas-container'),
    blochTelemetryText: document.getElementById('bloch-telemetry-text'),
    blochQubitSelect: document.getElementById('bloch-qubit-select'),
    stateDiracDisplay: document.getElementById('state-dirac-display'),
    statevectorTableBody: document.getElementById('statevector-table-body'),
    explainResultAiBtn: document.getElementById('explain-result-ai-btn'),

    // Code Lab
    pythonCodeEditor: document.getElementById('python-code-editor'),
    syncFromBuilderBtn: document.getElementById('sync-from-builder-btn'),
    runQiskitCodeBtn: document.getElementById('run-qiskit-code-btn'),
    terminalStdoutPre: document.getElementById('terminal-stdout-pre'),
    terminalStatusText: document.getElementById('terminal-status-text'),

    // Challenges
    challengesGridContainer: document.getElementById('challenges-grid-container'),
    challengeWorkspaceBanner: document.getElementById('challenge-workspace-banner'),
    activeChallengeTitle: document.getElementById('active-challenge-title'),
    activeChallengeObjective: document.getElementById('active-challenge-objective'),
    challengeHintBtn: document.getElementById('challenge-hint-btn'),
    challengeSubmitBtn: document.getElementById('challenge-submit-btn'),
    challengeFeedbackBox: document.getElementById('challenge-feedback-box'),

    // Progress
    progressPercentageVal: document.getElementById('progress-percentage-val'),
    progressXpVal: document.getElementById('progress-xp-val'),
    progressTopicsTbody: document.getElementById('progress-topics-tbody'),

    // AI Tutor Drawer
    aiTutorOverlay: document.getElementById('ai-tutor-overlay'),
    aiTutorDrawer: document.getElementById('ai-tutor-drawer'),
    closeAiTutorBtn: document.getElementById('close-ai-tutor-btn'),
    tutorActiveTopicBadge: document.getElementById('tutor-active-topic-badge'),
    tutorActiveCircuitBadge: document.getElementById('tutor-active-circuit-badge'),
    tutorQuickChips: document.querySelectorAll('.ai-tutor-drawer .quick-chip'),
    tutorMessagesFeed: document.getElementById('tutor-messages-feed'),
    tutorUserInput: document.getElementById('tutor-user-input'),
    tutorSendBtn: document.getElementById('tutor-send-btn'),

    // Settings Modal
    settingsModalOverlay: document.getElementById('settings-modal-overlay'),
    closeSettingsModalBtn: document.getElementById('close-settings-modal-btn'),
    cancelSettingsBtn: document.getElementById('cancel-settings-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    settingsGeminiKey: document.getElementById('settings-gemini-key'),
    settingsShotsSelect: document.getElementById('settings-shots-select'),

    // Auth Modal
    authModalOverlay: document.getElementById('auth-modal-overlay'),
    closeAuthModalBtn: document.getElementById('close-auth-modal-btn'),
    tabBtnLogin: document.getElementById('tab-btn-login'),
    tabBtnRegister: document.getElementById('tab-btn-register'),
    authErrorAlert: document.getElementById('auth-error-alert'),
    authLoginForm: document.getElementById('auth-login-form'),
    authRegisterForm: document.getElementById('auth-register-form'),
    loginIdentity: document.getElementById('login-identity'),
    loginPassword: document.getElementById('login-password'),
    registerFullname: document.getElementById('register-fullname'),
    registerIdentity: document.getElementById('register-identity'),
    registerPassword: document.getElementById('register-password'),
    registerConfirmPassword: document.getElementById('register-confirm-password'),
    linkToRegister: document.getElementById('link-to-register'),
    linkToLogin: document.getElementById('link-to-login'),

    // Saved Circuits Modal
    savedCircuitsModalOverlay: document.getElementById('saved-circuits-modal-overlay'),
    closeSavedCircuitsModalBtn: document.getElementById('close-saved-circuits-modal-btn'),
    closeSavedCircuitsFooterBtn: document.getElementById('close-saved-circuits-footer-btn'),
    savedCircuitsList: document.getElementById('saved-circuits-list'),

    // Save Circuit Dialog
    saveCircuitDialogOverlay: document.getElementById('save-circuit-dialog-overlay'),
    closeSaveCircuitDialogBtn: document.getElementById('close-save-circuit-dialog-btn'),
    cancelSaveCircuitDialogBtn: document.getElementById('cancel-save-circuit-dialog-btn'),
    confirmSaveCircuitBtn: document.getElementById('confirm-save-circuit-btn'),
    saveCircuitNameInput: document.getElementById('save-circuit-name-input'),
    saveCircuitDescInput: document.getElementById('save-circuit-desc-input'),
    saveCircuitErrorAlert: document.getElementById('save-circuit-error-alert'),

    // Toasts
    toastContainer: document.getElementById('toast-container')
  };

  // =========================================================================
  // Chart.js Visualizer Setup
  // =========================================================================
  let probChart = null;

  function initChart() {
    if (!window.Chart || !dom.probabilitiesChartCanvas) return;
    const ctx = dom.probabilitiesChartCanvas.getContext('2d');

    probChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['|00⟩', '|11⟩'],
        datasets: [{
          label: 'Measurement Probability',
          data: [0.5, 0.5],
          backgroundColor: '#2563eb',
          borderColor: '#1d4ed8',
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: '#f97316'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#f97316',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const prob = context.parsed.y;
                const shots = Math.round(prob * state.shots);
                return `Probability: ${(prob * 100).toFixed(1)}% (${shots} / ${state.shots} shots)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1.0,
            ticks: {
              color: '#4b5563',
              callback: value => `${(value * 100).toFixed(0)}%`
            },
            grid: { color: '#e5e7eb' }
          },
          x: {
            ticks: {
              color: '#111827',
              font: { family: 'JetBrains Mono', weight: 'bold', size: 12 }
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  function updateChart(probabilities) {
    if (!probChart) return;
    const sortedKeys = Object.keys(probabilities).sort();
    probChart.data.labels = sortedKeys.map(k => `|${k}⟩`);
    probChart.data.datasets[0].data = sortedKeys.map(k => probabilities[k]);
    probChart.update();
  }

  // =========================================================================
  // Three.js 3D Bloch Sphere Visualizer Setup
  // =========================================================================
  let blochScene, blochCamera, blochRenderer, blochControls;
  let blochArrow = null;
  let blochRadiusMesh = null;
  let targetVector = new THREE.Vector3(0, 0, 1);
  let currentVector = new THREE.Vector3(0, 0, 1);

  function initThreeBloch() {
    if (!window.THREE || !dom.blochThreeContainer) return;
    const container = dom.blochThreeContainer;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 280;

    // Scene & Camera
    blochScene = new THREE.Scene();
    blochCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    blochCamera.position.set(2.4, 1.8, 2.4);

    // Renderer
    blochRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    blochRenderer.setSize(width, height);
    blochRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(blochRenderer.domElement);

    // Orbit Controls
    if (window.THREE.OrbitControls) {
      blochControls = new window.THREE.OrbitControls(blochCamera, blochRenderer.domElement);
      blochControls.enableDamping = true;
      blochControls.dampingFactor = 0.05;
      blochControls.enableZoom = true;
      blochControls.minDistance = 1.8;
      blochControls.maxDistance = 5.0;
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    blochScene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    blochScene.add(dirLight);

    // Transparent Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 24);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    blochScene.add(sphereMesh);

    // Equator Ring (X-Y plane) - Electric Blue
    const ringGeo = new THREE.RingGeometry(0.99, 1.01, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide });
    const equator = new THREE.Mesh(ringGeo, ringMat);
    equator.rotation.x = Math.PI / 2;
    blochScene.add(equator);

    // Principal Axes: X (Amber Orange), Y (Emerald), Z (Electric Blue)
    const axesLength = 1.35;
    
    // Z axis (Vertical: Three.js Y) - Electric Blue
    createAxisLine(new THREE.Vector3(0, -axesLength, 0), new THREE.Vector3(0, axesLength, 0), 0x2563eb);
    // X axis (Three.js X) - Amber Orange
    createAxisLine(new THREE.Vector3(-axesLength, 0, 0), new THREE.Vector3(axesLength, 0, 0), 0xf97316);
    // Y axis (Three.js Z) - Emerald
    createAxisLine(new THREE.Vector3(0, 0, -axesLength), new THREE.Vector3(0, 0, axesLength), 0x10b981);

    // State Vector Arrow - Electric Blue
    const dir = new THREE.Vector3(0, 1, 0);
    const origin = new THREE.Vector3(0, 0, 0);
    blochArrow = new THREE.ArrowHelper(dir, origin, 1.0, 0x2563eb, 0.16, 0.08);
    blochArrow.line.material.linewidth = 3;
    blochScene.add(blochArrow);

    // Pulsing point for entangled state (radius ~ 0) - Amber Orange
    const centerGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const centerMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    blochRadiusMesh = new THREE.Mesh(centerGeo, centerMat);
    blochRadiusMesh.visible = false;
    blochScene.add(blochRadiusMesh);

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      if (blochControls) blochControls.update();

      // Smooth interpolation of state vector
      currentVector.lerp(targetVector, 0.12);
      const len = currentVector.length();

      if (blochArrow) {
        if (len > 0.05) {
          const norm = currentVector.clone().normalize();
          blochArrow.setDirection(norm);
          blochArrow.setLength(len, 0.15, 0.07);
          blochArrow.visible = true;
          if (blochRadiusMesh) blochRadiusMesh.visible = false;
        } else {
          // Entangled mixed state at origin
          blochArrow.visible = false;
          if (blochRadiusMesh) {
            blochRadiusMesh.visible = true;
            const s = 1 + Math.sin(Date.now() * 0.005) * 0.2;
            blochRadiusMesh.scale.set(s, s, s);
          }
        }
      }

      blochRenderer.render(blochScene, blochCamera);
    }
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
      if (!dom.blochThreeContainer) return;
      const w = dom.blochThreeContainer.clientWidth;
      const h = dom.blochThreeContainer.clientHeight;
      blochCamera.aspect = w / h;
      blochCamera.updateProjectionMatrix();
      blochRenderer.setSize(w, h);
    });
  }

  function createAxisLine(start, end, colorHex) {
    const points = [start, end];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.6 });
    const line = new THREE.Line(geo, mat);
    blochScene.add(line);
  }

  function updateBlochVector(rx, ry, rz, isEntangled) {
    // Mapping: Bloch (x, y, z) -> Three.js (x, z, y) so +Z is North Pole (|0>)
    // rx -> Three X
    // ry -> Three Z
    // rz -> Three Y
    targetVector.set(rx, rz, ry);

    const radius = Math.sqrt(rx * rx + ry * ry + rz * rz);

    if (isEntangled || radius < 0.1) {
      dom.blochTelemetryText.innerHTML = `
        <span style="color:#ea580c; font-weight:700;">🔗 Entangled Subsystem (Mixed State)</span><br>
        r = ${radius.toFixed(2)} (Individual state indefinite without other qubit)
      `;
    } else {
      dom.blochTelemetryText.innerHTML = `
        |ψ⟩ = [x: ${rx.toFixed(2)}, y: ${ry.toFixed(2)}, z: ${rz.toFixed(2)}]<br>
        Bloch Radius r = ${radius.toFixed(2)} (${radius > 0.98 ? 'Pure State' : 'Partially Mixed'})
      `;
    }
  }

  // =========================================================================
  // Circuit Studio Builder & Visual Grid
  // =========================================================================
  function renderCircuitGrid() {
    const grid = dom.circuitWireGrid;
    if (!grid) return;
    grid.innerHTML = '';

    const numQubits = state.circuit.qubits;
    const numSteps = Math.max(state.circuit.steps.length, 5);

    // Ensure steps array is correctly sized
    while (state.circuit.steps.length < numSteps) {
      state.circuit.steps.push([]);
    }

    for (let q = 0; q < numQubits; q++) {
      const row = document.createElement('div');
      row.className = 'qubit-wire-row';

      // Wire Label (|q0> = |0>)
      const label = document.createElement('div');
      label.className = 'wire-label';
      label.innerHTML = `<span>|q<sub>${q}</sub>⟩</span> <span style="font-size:0.7rem; color:var(--text-dim);">= |0⟩</span>`;
      row.appendChild(label);

      // Horizontal wire line
      const line = document.createElement('div');
      line.className = 'wire-line';
      row.appendChild(line);

      // Track slots
      const slotsTrack = document.createElement('div');
      slotsTrack.className = 'wire-slots-track';

      for (let s = 0; s < numSteps; s++) {
        const slot = document.createElement('div');
        slot.className = 'circuit-slot';
        slot.dataset.qubit = q;
        slot.dataset.step = s;

        // Check if a gate exists at this slot
        const stepOps = state.circuit.steps[s] || [];
        const op = stepOps.find(o => o.qubit === q || o.control === q || o.target === q);

        if (op) {
          slot.classList.add('occupied');
          const gateEl = document.createElement('div');
          gateEl.className = 'placed-gate';

          if (op.gate === 'CX' || op.gate === 'CNOT') {
            if (op.control === q) {
              gateEl.classList.add('gate-cx');
              gateEl.innerHTML = `<div class="cnot-control-dot" title="CNOT Control on Q${q}"></div>`;
            } else if (op.target === q) {
              gateEl.classList.add('gate-cx');
              gateEl.innerHTML = `<div class="cnot-target-cross" title="CNOT Target on Q${q}">⊕</div>`;
            }
          } else if (op.gate === 'CZ') {
            if (op.control === q) {
              gateEl.classList.add('gate-cz');
              gateEl.innerHTML = `<div class="cnot-control-dot" style="background:#3b82f6;"></div>`;
            } else {
              gateEl.classList.add('gate-cz');
              gateEl.innerText = 'Z';
            }
          } else {
            gateEl.classList.add(`gate-${op.gate.toLowerCase()}`);
            gateEl.innerText = op.gate;
          }

          // Click gate to remove
          gateEl.addEventListener('click', (e) => {
            e.stopPropagation();
            removeGateAt(s, q);
          });

          slot.appendChild(gateEl);
        } else {
          // Slot click: place active gate
          slot.addEventListener('click', () => {
            handleSlotClick(s, q);
          });
        }

        slotsTrack.appendChild(slot);
      }

      row.appendChild(slotsTrack);
      grid.appendChild(row);
    }
  }

  function handleSlotClick(stepIdx, qubitIdx) {
    const gate = state.activeGateTool;
    if (!gate) return;

    if (gate === 'CX' || gate === 'CNOT' || gate === 'CZ') {
      // Two-qubit gate selection
      if (state.cnotPendingControl === null) {
        state.cnotPendingControl = { step: stepIdx, qubit: qubitIdx, gate: gate };
        showToast(`Selected Q${qubitIdx} as Control. Now click Target wire at Step ${stepIdx + 1}.`);
      } else {
        const ctrl = state.cnotPendingControl;
        if (ctrl.step === stepIdx && ctrl.qubit !== qubitIdx) {
          // Add two-qubit gate
          ensureStepExists(stepIdx);
          state.circuit.steps[stepIdx].push({
            gate: ctrl.gate,
            control: ctrl.qubit,
            target: qubitIdx
          });
          state.cnotPendingControl = null;
          renderCircuitGrid();
          runSimulation();
          showToast(`Placed ${gate} (Q${ctrl.qubit} → Q${qubitIdx})`);
        } else {
          state.cnotPendingControl = null;
          showToast('Invalid target wire. CNOT cancelled.', 'warning');
        }
      }
    } else {
      // Single-qubit gate placement
      ensureStepExists(stepIdx);
      state.circuit.steps[stepIdx].push({
        gate: gate,
        qubit: qubitIdx
      });
      renderCircuitGrid();
      runSimulation();
    }
  }

  function removeGateAt(stepIdx, qubitIdx) {
    const stepOps = state.circuit.steps[stepIdx];
    if (!stepOps) return;
    state.circuit.steps[stepIdx] = stepOps.filter(o => 
      o.qubit !== qubitIdx && o.control !== qubitIdx && o.target !== qubitIdx
    );
    renderCircuitGrid();
    runSimulation();
    showToast('Gate removed');
  }

  function ensureStepExists(stepIdx) {
    while (state.circuit.steps.length <= stepIdx) {
      state.circuit.steps.push([]);
    }
  }

  function clearCircuit() {
    state.circuit.steps = [[], [], [], [], []];
    state.cnotPendingControl = null;
    renderCircuitGrid();
    runSimulation();
    showToast('Circuit cleared');
  }

  function loadCircuit(circuitData) {
    if (!circuitData) return;
    state.circuit.qubits = circuitData.qubits || 2;
    state.circuit.steps = JSON.parse(JSON.stringify(circuitData.steps || []));
    dom.studioQubitsSelect.value = state.circuit.qubits;
    updateBlochQubitDropdown();
    renderCircuitGrid();
    runSimulation();
  }

  function updateBlochQubitDropdown() {
    if (!dom.blochQubitSelect) return;
    dom.blochQubitSelect.innerHTML = '';
    for (let q = 0; q < state.circuit.qubits; q++) {
      const opt = document.createElement('option');
      opt.value = q;
      opt.innerText = `Q${q}`;
      if (q === state.selectedBlochQubit) opt.selected = true;
      dom.blochQubitSelect.appendChild(opt);
    }
  }

  // =========================================================================
  // Backend Simulation Client
  // =========================================================================
  async function runSimulation() {
    try {
      dom.studioRunSimBtn.innerHTML = `
        <svg class="pulse-dot" style="width:12px; height:12px;"></svg>
        Simulating on Aer...
      `;

      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qubits: state.circuit.qubits,
          steps: state.circuit.steps,
          shots: state.shots
        })
      });

      const res = await response.json();
      dom.studioRunSimBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Run Simulation (${state.shots} shots)
      `;

      if (res.success) {
        state.simulationResult = res;
        state.progress.simulationsCount = (state.progress.simulationsCount || 0) + 1;
        saveProgress();

        // 1. Update Probabilities Chart
        updateChart(res.probabilities);

        // 2. Update Dirac State Equation
        dom.stateDiracDisplay.innerText = `|ψ⟩ = ${res.dirac}`;

        // 3. Update Statevector Table
        renderStatevectorTable(res.statevector);

        // 4. Update 3D Bloch Sphere
        renderBlochForCurrentQubit();

        // 5. Update Qiskit Code Editor
        if (dom.pythonCodeEditor) {
          dom.pythonCodeEditor.value = res.python_code || '';
        }

        // 6. Update AI Context Header
        updateAiTutorContext();

      } else {
        showToast(`Simulation error: ${res.error}`, 'error');
      }
    } catch (err) {
      console.error('Simulation request failed:', err);
      dom.studioRunSimBtn.innerHTML = `Run Simulation`;
      showToast('Simulation failed to connect to backend.', 'error');
    }
  }

  function renderStatevectorTable(statevector) {
    const tbody = dom.statevectorTableBody;
    if (!tbody || !statevector) return;
    tbody.innerHTML = '';

    statevector.forEach(row => {
      const tr = document.createElement('tr');
      const phaseDeg = ((row.phase * 180) / Math.PI).toFixed(1);
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--color-accent);">|${row.basis}⟩</td>
        <td>${row.real.toFixed(4)}</td>
        <td>${row.imag >= 0 ? '+' : ''}${row.imag.toFixed(4)}i</td>
        <td>${row.magnitude.toFixed(4)}</td>
        <td>${row.phase.toFixed(2)} rad (${phaseDeg}°)</td>
        <td style="color:${row.probability > 0 ? 'var(--color-accent)' : 'var(--text-dim)'}; font-weight:700;">
          ${(row.probability * 100).toFixed(1)}%
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderBlochForCurrentQubit() {
    if (!state.simulationResult || !state.simulationResult.bloch_vectors) return;
    const vectors = state.simulationResult.bloch_vectors;
    const q = state.selectedBlochQubit;
    const bv = vectors.find(v => v.qubit === q) || vectors[0];
    if (bv) {
      updateBlochVector(bv.x, bv.y, bv.z, bv.is_entangled);
    }
  }

  // =========================================================================
  // Curriculum & Interactive Academy
  // =========================================================================
  async function loadCurriculum() {
    try {
      const res = await fetch('/api/curriculum').then(r => r.json());
      if (res.success && res.modules) {
        state.curriculum = res.modules;
        renderAcademySidebar();
        loadModule(state.curriculum[0].id);
      }
    } catch (e) {
      console.error('Failed to load curriculum:', e);
    }
  }

  function renderAcademySidebar() {
    const list = dom.moduleNavList;
    if (!list) return;
    list.innerHTML = '';

    state.curriculum.forEach((mod, idx) => {
      const item = document.createElement('div');
      item.className = 'module-nav-item';
      if (state.activeModule && state.activeModule.id === mod.id) item.classList.add('active');
      if (state.progress.completedModules.includes(mod.id)) item.classList.add('completed');

      item.innerHTML = `
        <div class="module-badge-num">${mod.badge}</div>
        <div class="module-nav-info">
          <div class="module-nav-title">${mod.title}</div>
          <div class="module-nav-meta">${mod.category} • ${mod.duration}</div>
        </div>
      `;

      item.addEventListener('click', () => loadModule(mod.id));
      list.appendChild(item);
    });
  }

  function loadModule(moduleId) {
    const mod = state.curriculum.find(m => m.id === moduleId);
    if (!mod) return;
    state.activeModule = mod;

    renderAcademySidebar();

    // Fill Header
    dom.moduleCategoryPill.innerText = mod.category;
    dom.moduleDurationPill.innerText = mod.duration;
    dom.moduleTitleHeading.innerText = mod.title;
    dom.moduleSubtitleHeading.innerText = mod.subtitle;

    // Fill Content Stream
    dom.moduleContentStream.innerHTML = '';
    mod.content.forEach(section => {
      const el = document.createElement('div');
      el.style.marginBottom = '18px';

      if (section.type === 'paragraph') {
        el.innerHTML = `<p style="font-size:0.95rem; color:var(--text-main); line-height:1.7;">${formatMarkdown(section.text)}</p>`;
      } else if (section.type === 'key_concept') {
        el.className = 'interactive-playground-box';
        el.style.margin = '16px 0';
        el.innerHTML = `
          <div class="playground-title">${section.title}</div>
          ${section.formula ? `<div class="state-equation-display">${section.formula}</div>` : ''}
          <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.6;">${formatMarkdown(section.text)}</p>
        `;
      } else if (section.type === 'analogy') {
        el.style.padding = '16px 20px';
        el.style.borderRadius = 'var(--radius-md)';
        el.style.background = 'rgba(168, 85, 247, 0.08)';
        el.style.border = '1px solid rgba(168, 85, 247, 0.25)';
        el.innerHTML = `
          <div style="font-weight:700; color:var(--purple-accent); margin-bottom:6px; font-size:0.9rem;">
            🔮 ${section.title}
          </div>
          <p style="font-size:0.88rem; color:#e2e8f0; line-height:1.6;">${formatMarkdown(section.text)}</p>
        `;
      } else {
        el.innerHTML = `<p style="font-size:0.88rem; color:var(--text-muted);">${formatMarkdown(section.text)}</p>`;
      }
      dom.moduleContentStream.appendChild(el);
    });

    // Fill Quiz
    if (mod.quiz) {
      dom.quizQuestionText.innerText = mod.quiz.question;
      dom.quizOptionsList.innerHTML = '';
      dom.quizExplanationBox.style.display = 'none';

      mod.quiz.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerText = opt;
        btn.addEventListener('click', () => {
          handleQuizAnswer(idx, mod.quiz.correct, mod.quiz.explanation, mod.id);
        });
        dom.quizOptionsList.appendChild(btn);
      });
    }

    updateAiTutorContext();

    // Persist module access to server for authenticated learner
    if (state.currentUser) {
      const isAlreadyDone = state.progress.completedModules.includes(moduleId);
      authFetch('/api/learner/module-progress', {
        method: 'POST',
        body: {
          module_id: moduleId,
          status: isAlreadyDone ? 'completed' : 'in_progress',
          completion_pct: isAlreadyDone ? 100 : 50
        }
      }).catch(e => console.warn('Module progress update note:', e));
    }
  }

  function handleQuizAnswer(selectedIndex, correctIndex, explanation, moduleId) {
    const buttons = dom.quizOptionsList.querySelectorAll('.quiz-option-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIndex) btn.classList.add('correct');
      if (idx === selectedIndex && idx !== correctIndex) btn.classList.add('incorrect');
    });

    dom.quizExplanationBox.innerText = explanation;
    dom.quizExplanationBox.style.display = 'block';

    const isCorrect = (selectedIndex === correctIndex);
    const score = isCorrect ? 10 : 0;

    if (isCorrect) {
      if (!state.progress.completedModules.includes(moduleId)) {
        state.progress.completedModules.push(moduleId);
        state.progress.xp = (state.progress.xp || 0) + 50;
        showToast('🎉 Correct! Module completed (+50 XP)');
        renderAcademySidebar();
      }
    }

    // Persist quiz attempt to backend
    if (state.currentUser) {
      authFetch('/api/learner/quiz-attempt', {
        method: 'POST',
        body: {
          module_id: moduleId,
          score: score,
          max_score: 10,
          passed: isCorrect
        }
      }).then(() => refreshLearnerData()).catch(e => console.warn('Quiz attempt sync note:', e));
    }
  }

  // Interactive Superposition Slider Logic
  if (dom.superpositionThetaSlider) {
    dom.superpositionThetaSlider.addEventListener('input', (e) => {
      const deg = parseInt(e.target.value, 10);
      const rad = (deg * Math.PI) / 180;
      const alpha = Math.cos(rad / 2);
      const beta = Math.sin(rad / 2);
      const p0 = alpha * alpha;
      const p1 = beta * beta;

      dom.sliderThetaVal.innerText = `${deg}° (${(rad / Math.PI).toFixed(2)}π)`;

      let stateName = 'Superposition';
      if (deg === 0) stateName = 'Ground State |0⟩';
      else if (deg === 90) stateName = 'Equal Superposition |+⟩';
      else if (deg === 180) stateName = 'Flipped State |1⟩';
      dom.sliderStateLabel.innerText = stateName;

      dom.interactiveStateEquation.innerText = `|ψ⟩ = ${alpha.toFixed(3)} |0⟩ + ${beta.toFixed(3)} |1⟩`;

      dom.probBar0.style.width = `${(p0 * 100).toFixed(1)}%`;
      dom.probBar0.innerText = `|0⟩: ${(p0 * 100).toFixed(1)}%`;

      dom.probBar1.style.width = `${(p1 * 100).toFixed(1)}%`;
      dom.probBar1.innerText = `|1⟩: ${(p1 * 100).toFixed(1)}%`;
    });
  }

  if (dom.academyOpenCircuitBtn) {
    dom.academyOpenCircuitBtn.addEventListener('click', () => {
      if (state.activeModule && state.activeModule.circuit_preset) {
        loadCircuit(state.activeModule.circuit_preset);
      }
      switchView('builder');
    });
  }

  // =========================================================================
  // Quantum Challenges
  // =========================================================================
  async function loadChallenges() {
    try {
      const res = await fetch('/api/challenges').then(r => r.json());
      if (res.success && res.challenges) {
        state.challenges = res.challenges;
        renderChallengesGrid();
      }
    } catch (e) {
      console.error('Failed to load challenges:', e);
    }
  }

  function renderChallengesGrid() {
    const grid = dom.challengesGridContainer;
    if (!grid) return;
    grid.innerHTML = '';

    state.challenges.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'challenge-card';
      const isSolved = state.progress.solvedChallenges.includes(ch.id);

      card.innerHTML = `
        <div>
          <div class="challenge-header">
            <span class="challenge-diff-pill diff-${ch.difficulty.toLowerCase()}">${ch.difficulty}</span>
            <span class="challenge-pts">${ch.points} XP</span>
          </div>
          <h3 class="challenge-title">${ch.title}</h3>
          <p class="challenge-desc">${ch.objective}</p>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:16px;">
          <span style="font-size:0.75rem; color:${isSolved ? '#059669' : 'var(--text-dim)'}; font-weight:700;">
            ${isSolved ? '✓ Mastered' : '○ Unsolved'}
          </span>
          <button class="btn-primary" style="padding:6px 14px; font-size:0.8rem;" data-id="${ch.id}">
            ${isSolved ? 'Review' : 'Start Challenge'} →
          </button>
        </div>
      `;

      card.querySelector('button').addEventListener('click', () => {
        startChallenge(ch);
      });

      grid.appendChild(card);
    });
  }

  function startChallenge(ch) {
    state.activeChallenge = ch;
    dom.challengeWorkspaceBanner.style.display = 'block';
    dom.activeChallengeTitle.innerText = `Active Challenge: ${ch.title}`;
    dom.activeChallengeObjective.innerText = ch.objective;
    dom.challengeFeedbackBox.style.display = 'none';

    // Prepare circuit for challenge
    state.circuit.qubits = ch.qubits || 2;
    state.circuit.steps = [[], [], [], [], []];
    dom.studioQubitsSelect.value = state.circuit.qubits;
    updateBlochQubitDropdown();
    renderCircuitGrid();
    runSimulation();

    switchView('builder');
    showToast(`Started Challenge: ${ch.title}`);
  }

  async function submitChallengeSolution() {
    if (!state.activeChallenge) {
      showToast('No active challenge selected.', 'warning');
      return;
    }

    try {
      showToast('Verifying circuit solution on Qiskit Aer...');
      const res = await fetch('/api/verify-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: state.activeChallenge.id,
          circuit: state.circuit
        })
      }).then(r => r.json());

      const result = res.result;
      dom.challengeFeedbackBox.style.display = 'block';

      if (result.passed) {
        dom.challengeFeedbackBox.style.background = '#ecfdf5';
        dom.challengeFeedbackBox.style.border = '1px solid #10b981';
        dom.challengeFeedbackBox.style.color = '#065f46';
        dom.challengeFeedbackBox.innerHTML = `<strong>🎉 Victory!</strong> ${result.message}`;

        if (!state.progress.solvedChallenges.includes(state.activeChallenge.id)) {
          state.progress.solvedChallenges.push(state.activeChallenge.id);
          state.progress.xp = (state.progress.xp || 0) + (result.score || 100);
          renderChallengesGrid();
        }
      } else {
        dom.challengeFeedbackBox.style.background = '#fef2f2';
        dom.challengeFeedbackBox.style.border = '1px solid #ef4444';
        dom.challengeFeedbackBox.style.color = '#991b1b';
        dom.challengeFeedbackBox.innerHTML = `<strong>Try Again:</strong> ${result.message}`;
      }

      // Persist challenge attempt to backend database
      if (state.currentUser) {
        authFetch('/api/learner/challenge-attempt', {
          method: 'POST',
          body: {
            challenge_id: state.activeChallenge.id,
            status: result.passed ? 'passed' : 'failed',
            score: result.passed ? (result.score || 100) : 25,
            circuit_json: JSON.stringify(state.circuit)
          }
        }).then(() => refreshLearnerData()).catch(e => console.warn('Challenge attempt sync note:', e));
      }
    } catch (e) {
      showToast('Failed to verify challenge with server.', 'error');
    }
  }

  // =========================================================================
  // Quantum Coding Lab
  // =========================================================================
  if (dom.runQiskitCodeBtn) {
    dom.runQiskitCodeBtn.addEventListener('click', async () => {
      const code = dom.pythonCodeEditor.value;
      if (!code.trim()) return;

      dom.terminalStatusText.innerText = 'Executing in sandbox...';
      dom.terminalStdoutPre.innerText = 'Running Python/Qiskit execution...';

      try {
        const res = await fetch('/api/run-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        }).then(r => r.json());

        dom.terminalStatusText.innerText = res.success ? 'Success (Exit 0)' : 'Error';
        dom.terminalStdoutPre.innerText = res.output;
      } catch (err) {
        dom.terminalStatusText.innerText = 'Failed';
        dom.terminalStdoutPre.innerText = `Network/Server Error: ${err.message}`;
      }
    });
  }

  if (dom.syncFromBuilderBtn) {
    dom.syncFromBuilderBtn.addEventListener('click', () => {
      if (state.simulationResult && state.simulationResult.python_code) {
        dom.pythonCodeEditor.value = state.simulationResult.python_code;
        showToast('Synchronized code from Visual Studio!');
      }
    });
  }

  // =========================================================================
  // Contextual AI Quantum Tutor Drawer & Quick Actions
  // =========================================================================
  function updateAiTutorContext() {
    if (dom.tutorActiveTopicBadge) {
      const topic = state.activeModule ? state.activeModule.title : 'Quantum Circuit Studio';
      dom.tutorActiveTopicBadge.innerText = `Topic: ${topic}`;
    }
    if (dom.tutorActiveCircuitBadge) {
      const totalGates = state.circuit.steps.reduce((acc, s) => acc + s.length, 0);
      dom.tutorActiveCircuitBadge.innerText = `${state.circuit.qubits} Qubits (${totalGates} Gates)`;
    }
  }

  function openAiTutor(initialPrompt = null, initialMode = null) {
    dom.aiTutorOverlay.classList.add('open');
    dom.aiTutorDrawer.classList.add('open');
    updateAiTutorContext();

    if (initialPrompt || initialMode) {
      queryAiTutor(initialMode || 'chat', initialPrompt || '');
    }
  }

  function closeAiTutor() {
    dom.aiTutorOverlay.classList.remove('open');
    dom.aiTutorDrawer.classList.remove('open');
  }

  async function queryAiTutor(mode, userMessage = '') {
    // Append User Bubble if message is provided
    if (userMessage) {
      appendChatMessage('user', userMessage);
    }

    // Append loading bubble
    const loadingId = 'ai-loading-' + Date.now();
    appendChatMessage('ai', 'Thinking and inspecting quantum wavefunction...', loadingId);

    try {
      const payload = {
        mode: mode,
        user_message: userMessage,
        topic: state.activeModule ? state.activeModule.title : 'Quantum Circuit Studio',
        circuit: state.circuit,
        simulation: state.simulationResult || {},
        code: dom.pythonCodeEditor ? dom.pythonCodeEditor.value : '',
        challenge_id: state.activeChallenge ? state.activeChallenge.id : null,
        api_key: state.geminiApiKey
      };

      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      // Remove loading bubble
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      if (res.success) {
        appendChatMessage('ai', res.response, null, res.generated_circuit);
      } else {
        appendChatMessage('ai', `I encountered an issue: ${res.error || 'Unknown error'}`);
      }

    } catch (e) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      appendChatMessage('ai', 'Connection to AI Tutor backend interrupted.');
    }
  }

  function appendChatMessage(sender, text, elementId = null, generatedCircuit = null) {
    const feed = dom.tutorMessagesFeed;
    if (!feed) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    if (elementId) bubble.id = elementId;

    if (sender === 'ai') {
      bubble.innerHTML = formatMarkdown(text);

      if (generatedCircuit) {
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn-load-circuit';
        loadBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Load Circuit Into Studio
        `;
        loadBtn.addEventListener('click', () => {
          loadCircuit(generatedCircuit);
          switchView('builder');
          closeAiTutor();
          showToast('Loaded AI generated circuit into Studio!');
        });
        bubble.appendChild(loadBtn);
      }
    } else {
      bubble.innerText = text;
    }

    feed.appendChild(bubble);
    feed.scrollTop = feed.scrollHeight;
  }

  // Quick Action Chips in AI Tutor
  dom.tutorQuickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const mode = chip.dataset.mode;
      queryAiTutor(mode);
    });
  });

  if (dom.tutorSendBtn) {
    dom.tutorSendBtn.addEventListener('click', () => {
      const text = dom.tutorUserInput.value.trim();
      if (!text) return;
      dom.tutorUserInput.value = '';
      queryAiTutor('chat', text);
    });
  }

  if (dom.tutorUserInput) {
    dom.tutorUserInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const text = dom.tutorUserInput.value.trim();
        if (!text) return;
        dom.tutorUserInput.value = '';
        queryAiTutor('chat', text);
      }
    });
  }

  // =========================================================================
  // Settings & Configuration Modal
  // =========================================================================
  function openSettings() {
    dom.settingsGeminiKey.value = state.geminiApiKey || '';
    dom.settingsShotsSelect.value = state.shots;
    dom.settingsModalOverlay.classList.add('open');
  }

  function closeSettings() {
    dom.settingsModalOverlay.classList.remove('open');
  }

  if (dom.saveSettingsBtn) {
    dom.saveSettingsBtn.addEventListener('click', () => {
      state.geminiApiKey = dom.settingsGeminiKey.value.trim();
      state.shots = parseInt(dom.settingsShotsSelect.value, 10) || 1024;
      localStorage.setItem('qubitlab_gemini_key', state.geminiApiKey);
      closeSettings();
      showToast('Settings saved successfully!');
      runSimulation();
    });
  }

  // =========================================================================
  // Progress & Dashboard UI Updates
  // =========================================================================
  function updateProgressUI() {
    if (dom.statModulesCompleted) {
      dom.statModulesCompleted.innerText = `${state.progress.completedModules.length} / 6`;
    }
    if (dom.statCircuitsRun) {
      dom.statCircuitsRun.innerText = state.progress.simulationsCount || 14;
    }
    if (dom.statChallengesSolved) {
      dom.statChallengesSolved.innerText = `${state.progress.solvedChallenges.length} / 5`;
    }
    if (dom.progressXpVal) {
      dom.progressXpVal.innerText = `${state.progress.xp || 350} XP`;
    }
    if (dom.progressPercentageVal) {
      const pct = Math.round(
        ((state.progress.completedModules.length + state.progress.solvedChallenges.length) / 11) * 100
      );
      dom.progressPercentageVal.innerText = `${pct}%`;
    }

    // Populate topic table in progress view
    if (dom.progressTopicsTbody && state.curriculum.length) {
      dom.progressTopicsTbody.innerHTML = '';
      state.curriculum.forEach(m => {
        const isDone = state.progress.completedModules.includes(m.id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--color-text);">${m.title}</td>
          <td>${m.category}</td>
          <td>
            <span style="font-size:0.75rem; font-weight:700; color:${isDone ? '#059669' : '#ea580c'};">
              ${isDone ? '✓ Mastered' : '⚙ In Progress'}
            </span>
          </td>
          <td>${isDone ? '100%' : 'Not Taken'}</td>
          <td>
            <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" data-id="${m.id}">
              Study →
            </button>
          </td>
        `;
        tr.querySelector('button').addEventListener('click', () => {
          loadModule(m.id);
          switchView('learn');
        });
        dom.progressTopicsTbody.appendChild(tr);
      });
    }
  }

  // =========================================================================
  // Authenticated Network Fetch Helper
  // =========================================================================
  async function authFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (state.authToken) {
      options.headers['Authorization'] = `Bearer ${state.authToken}`;
    }
    const isJsonBody = options.body && typeof options.body === 'object' && !(options.body instanceof FormData);
    if (isJsonBody) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, options);
    if (res.status === 401 && state.authToken) {
      console.warn('Session expired or unauthorized');
      state.authToken = null;
      state.currentUser = null;
      localStorage.removeItem('qubitlab_token');
      updateAuthUI();
    }
    return res;
  }

  // =========================================================================
  // Learner Authentication & Session System
  // =========================================================================
  function openAuthModal(mode = 'login') {
    if (dom.authErrorAlert) dom.authErrorAlert.style.display = 'none';
    if (mode === 'register') {
      if (dom.tabBtnLogin) dom.tabBtnLogin.classList.remove('active');
      if (dom.tabBtnRegister) dom.tabBtnRegister.classList.add('active');
      if (dom.authLoginForm) dom.authLoginForm.style.display = 'none';
      if (dom.authRegisterForm) dom.authRegisterForm.style.display = 'block';
    } else {
      if (dom.tabBtnRegister) dom.tabBtnRegister.classList.remove('active');
      if (dom.tabBtnLogin) dom.tabBtnLogin.classList.add('active');
      if (dom.authRegisterForm) dom.authRegisterForm.style.display = 'none';
      if (dom.authLoginForm) dom.authLoginForm.style.display = 'block';
    }
    if (dom.authModalOverlay) dom.authModalOverlay.classList.add('open');
  }

  function closeAuthModal() {
    if (dom.authModalOverlay) dom.authModalOverlay.classList.remove('open');
    if (dom.authErrorAlert) dom.authErrorAlert.style.display = 'none';
  }

  function showAuthError(msg) {
    if (dom.authErrorAlert) {
      dom.authErrorAlert.innerText = msg;
      dom.authErrorAlert.style.display = 'block';
    }
  }

  function updateAuthUI() {
    if (state.currentUser) {
      if (dom.authNavGuest) dom.authNavGuest.style.display = 'none';
      if (dom.authNavUser) dom.authNavUser.style.display = 'flex';
      const displayName = state.currentUser.name || state.currentUser.username;
      if (dom.navUserName) dom.navUserName.innerText = displayName;
      if (dom.heroLearnerName) dom.heroLearnerName.innerText = displayName;
    } else {
      if (dom.authNavGuest) dom.authNavGuest.style.display = 'flex';
      if (dom.authNavUser) dom.authNavUser.style.display = 'none';
      if (dom.heroLearnerName) dom.heroLearnerName.innerText = 'Quantum Learner';
      if (dom.heroProgressPct) dom.heroProgressPct.innerText = '0%';
      if (dom.heroProgressBar) dom.heroProgressBar.style.width = '0%';
      if (dom.statModulesCompleted) dom.statModulesCompleted.innerText = '0 / 6';
      if (dom.statQuizAvg) dom.statQuizAvg.innerText = '0%';
      if (dom.statChallengesSolved) dom.statChallengesSolved.innerText = '0 / 5';
      if (dom.statSavedCircuits) dom.statSavedCircuits.innerText = '0';
      if (dom.dashboardActivityFeed) {
        dom.dashboardActivityFeed.innerHTML = '<div class="empty-state-box">Sign in or register to track your quantum learning progress!</div>';
      }
    }
  }

  async function checkAuthSession() {
    if (!state.authToken) {
      updateAuthUI();
      return;
    }
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        state.currentUser = data.user;
        updateAuthUI();
        await refreshLearnerData();
      } else {
        state.authToken = null;
        state.currentUser = null;
        localStorage.removeItem('qubitlab_token');
        updateAuthUI();
      }
    } catch (e) {
      console.warn('Check auth session failed:', e);
      updateAuthUI();
    }
  }

  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const identityEl = document.getElementById('login-identity');
    const passwordEl = document.getElementById('login-password');
    const identity = identityEl ? identityEl.value.trim() : '';
    const password = passwordEl ? passwordEl.value : '';
    if (!identity || !password) {
      showAuthError('Please enter your email/username and password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identity, identity: identity, password: password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        state.authToken = data.token;
        state.currentUser = data.user;
        localStorage.setItem('qubitlab_token', data.token);
        closeAuthModal();
        if (identityEl) identityEl.value = '';
        if (passwordEl) passwordEl.value = '';
        showToast(`Welcome back, ${data.user.name}!`);
        updateAuthUI();
        await refreshLearnerData();
        switchView('dashboard');
      } else {
        showAuthError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      showAuthError('Network error while logging in.');
    }
  }

  async function handleRegister(e) {
    if (e && e.preventDefault) e.preventDefault();
    const fullnameEl = document.getElementById('register-fullname');
    const identityEl = document.getElementById('register-identity');
    const passwordEl = document.getElementById('register-password');
    const confirmPasswordEl = document.getElementById('register-confirm-password');

    const fullname = fullnameEl ? fullnameEl.value.trim() : '';
    const identity = identityEl ? identityEl.value.trim() : '';
    const password = passwordEl ? passwordEl.value : '';
    const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : '';

    if (!fullname || !identity || !password) {
      showAuthError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      showAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showAuthError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: fullname, 
          email: identity, 
          identity: identity, 
          password: password, 
          confirm_password: confirmPassword 
        })
      });
      const data = await res.json();
      if (data.success && data.token) {
        state.authToken = data.token;
        state.currentUser = data.user;
        localStorage.setItem('qubitlab_token', data.token);
        closeAuthModal();
        if (fullnameEl) fullnameEl.value = '';
        if (identityEl) identityEl.value = '';
        if (passwordEl) passwordEl.value = '';
        if (confirmPasswordEl) confirmPasswordEl.value = '';
        showToast(`Account registered! Welcome to QuBitLab, ${data.user.name}!`);
        updateAuthUI();
        await refreshLearnerData();
        switchView('dashboard');
      } else {
        showAuthError(data.error || 'Registration failed.');
      }
    } catch (err) {
      showAuthError('Network error during registration.');
    }
  }

  async function handleLogout() {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    state.authToken = null;
    state.currentUser = null;
    state.learnerDashboard = null;
    state.savedCircuits = [];
    localStorage.removeItem('qubitlab_token');
    updateAuthUI();
    showToast('Logged out successfully.');
    switchView('dashboard');
  }

  // =========================================================================
  // Learner Progress & Personal Dashboard Persistence
  // =========================================================================
  async function refreshLearnerData() {
    if (!state.currentUser) return;
    try {
      const res = await authFetch('/api/learner/dashboard');
      const data = await res.json();
      if (data.success && data.dashboard) {
        const d = data.dashboard;
        state.learnerDashboard = d;

        // Hero Welcome & Progress
        if (dom.heroLearnerName) dom.heroLearnerName.innerText = d.user.name || d.user.username;
        if (dom.heroProgressPct) dom.heroProgressPct.innerText = `${d.overall_completion_pct}%`;
        if (dom.heroProgressBar) dom.heroProgressBar.style.width = `${d.overall_completion_pct}%`;
        if (dom.heroContinueTopic && d.continue_module) {
          dom.heroContinueTopic.innerText = d.continue_module.title;
          dom.heroContinueTopic.dataset.moduleId = d.continue_module.module_id;
        }

        // Stats Cards
        if (dom.statModulesCompleted) dom.statModulesCompleted.innerText = `${d.metrics.modules_completed} / ${d.metrics.modules_total}`;
        if (dom.statQuizAvg) dom.statQuizAvg.innerText = `${d.metrics.quiz_average}%`;
        if (dom.statChallengesSolved) dom.statChallengesSolved.innerText = `${d.metrics.challenges_completed} / ${d.metrics.challenges_total}`;
        if (dom.statSavedCircuits) dom.statSavedCircuits.innerText = `${d.metrics.saved_circuits}`;

        // Sync local completed modules & solved challenges state
        state.progress.completedModules = (d.module_progress || [])
          .filter(m => m.status === 'completed')
          .map(m => m.module_id);
        
        state.progress.solvedChallenges = (d.challenge_attempts || [])
          .filter(c => c.status === 'passed')
          .map(c => c.challenge_id);
        
        state.progress.xp = d.metrics.total_xp || 0;

        // Progress tab
        if (dom.progressPercentageVal) dom.progressPercentageVal.innerText = `${d.overall_completion_pct}%`;
        if (dom.progressXpVal) dom.progressXpVal.innerText = `${d.metrics.total_xp} XP`;

        // Render Recent Activity Feed
        renderRecentActivity(d.recent_activity || []);

        // Update Roadmap nodes
        updateRoadmapNodes(d.module_progress || []);

        // Update Progress Tab Table & Badges
        updateProgressUI();
        renderAcademySidebar();
      }
    } catch (e) {
      console.warn('Failed to refresh learner data:', e);
    }
  }

  function renderRecentActivity(activities) {
    if (!dom.dashboardActivityFeed) return;
    if (!activities || activities.length === 0) {
      dom.dashboardActivityFeed.innerHTML = '<div class="empty-state-box">No learning activity recorded yet. Start a module, take a quiz, or solve a challenge!</div>';
      return;
    }

    dom.dashboardActivityFeed.innerHTML = activities.map(act => {
      let icon = '⚡';
      let iconClass = 'module';
      if (act.activity_type === 'quiz') { icon = '📝'; iconClass = 'quiz'; }
      else if (act.activity_type === 'challenge') { icon = '🏆'; iconClass = 'challenge'; }
      else if (act.activity_type === 'circuit') { icon = '⚛️'; iconClass = 'circuit'; }
      else if (act.activity_type === 'auth') { icon = '👤'; iconClass = 'register'; }

      const timeStr = act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

      return `
        <div class="activity-item">
          <div class="activity-icon-bubble ${iconClass}">${icon}</div>
          <div class="activity-content">
            <div class="activity-title">${act.title}</div>
            <div class="activity-detail">${act.detail || ''}</div>
          </div>
          ${timeStr ? `<div class="activity-time">${timeStr}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function updateRoadmapNodes(moduleProgress) {
    const progressMap = {};
    (moduleProgress || []).forEach(m => { progressMap[m.module_id] = m.status; });

    document.querySelectorAll('.roadmap-step').forEach(step => {
      const modId = step.dataset.moduleId;
      if (!modId) return;
      step.classList.remove('completed', 'active');
      const statusEl = step.querySelector('.roadmap-step-status');

      if (progressMap[modId] === 'completed') {
        step.classList.add('completed');
        if (statusEl) statusEl.innerText = '✓ Completed';
      } else if (progressMap[modId] === 'in_progress') {
        step.classList.add('active');
        if (statusEl) statusEl.innerText = '⚡ In Progress';
      } else {
        if (statusEl) statusEl.innerText = 'Ready';
      }
    });
  }

  // =========================================================================
  // Saved Circuits Management (CRUD)
  // =========================================================================
  function openSaveCircuitDialog() {
    if (!state.currentUser) {
      openAuthModal('login');
      showToast('Please sign in to save circuits to your account.', 'warning');
      return;
    }
    if (dom.saveCircuitErrorAlert) dom.saveCircuitErrorAlert.style.display = 'none';
    if (dom.saveCircuitNameInput) {
      const now = new Date();
      dom.saveCircuitNameInput.value = `Quantum Circuit ${now.toLocaleDateString()}`;
    }
    if (dom.saveCircuitDescInput) dom.saveCircuitDescInput.value = '';
    if (dom.saveCircuitDialogOverlay) dom.saveCircuitDialogOverlay.classList.add('open');
  }

  function closeSaveCircuitDialog() {
    if (dom.saveCircuitDialogOverlay) dom.saveCircuitDialogOverlay.classList.remove('open');
  }

  async function handleConfirmSaveCircuit() {
    const name = dom.saveCircuitNameInput ? dom.saveCircuitNameInput.value.trim() : '';
    const desc = dom.saveCircuitDescInput ? dom.saveCircuitDescInput.value.trim() : '';
    if (!name) {
      if (dom.saveCircuitErrorAlert) {
        dom.saveCircuitErrorAlert.innerText = 'Circuit name is required.';
        dom.saveCircuitErrorAlert.style.display = 'block';
      }
      return;
    }

    const totalGates = state.circuit.steps.reduce((acc, step) => acc + step.length, 0);

    try {
      const res = await authFetch('/api/circuits', {
        method: 'POST',
        body: {
          name: name,
          qubits: state.circuit.qubits,
          gates_count: totalGates,
          circuit_data: state.circuit,
          description: desc
        }
      });
      const data = await res.json();
      if (data.success) {
        closeSaveCircuitDialog();
        showToast(`Circuit "${name}" saved to your account!`);
        await refreshLearnerData();
      } else {
        if (dom.saveCircuitErrorAlert) {
          dom.saveCircuitErrorAlert.innerText = data.error || 'Failed to save circuit.';
          dom.saveCircuitErrorAlert.style.display = 'block';
        }
      }
    } catch (e) {
      if (dom.saveCircuitErrorAlert) {
        dom.saveCircuitErrorAlert.innerText = 'Network error saving circuit.';
        dom.saveCircuitErrorAlert.style.display = 'block';
      }
    }
  }

  async function openSavedCircuitsModal() {
    if (!state.currentUser) {
      openAuthModal('login');
      showToast('Please sign in to access your saved circuits.', 'warning');
      return;
    }
    if (dom.savedCircuitsModalOverlay) dom.savedCircuitsModalOverlay.classList.add('open');
    await loadAndRenderSavedCircuits();
  }

  function closeSavedCircuitsModal() {
    if (dom.savedCircuitsModalOverlay) dom.savedCircuitsModalOverlay.classList.remove('open');
  }

  async function loadAndRenderSavedCircuits() {
    if (!dom.savedCircuitsList) return;
    dom.savedCircuitsList.innerHTML = '<div class="empty-state-box">Loading your saved circuits...</div>';

    try {
      const res = await authFetch('/api/circuits');
      const data = await res.json();
      if (data.success && data.circuits) {
        state.savedCircuits = data.circuits;
        if (data.circuits.length === 0) {
          dom.savedCircuitsList.innerHTML = '<div class="empty-state-box">You haven\'t saved any circuits yet. Build a circuit in the studio and click <strong>💾 Save</strong>!</div>';
          return;
        }

        dom.savedCircuitsList.innerHTML = data.circuits.map(c => {
          const modDate = c.updated_at ? new Date(c.updated_at).toLocaleDateString() : '';
          return `
            <div class="saved-circuit-card" data-circuit-id="${c.id}">
              <div class="saved-circuit-info">
                <div class="saved-circuit-title">${c.name}</div>
                <div class="saved-circuit-meta">${c.qubits} Qubits • ${c.gates_count || 0} Gates • ${c.description || 'Saved circuit'} • ${modDate}</div>
              </div>
              <div class="saved-circuit-actions">
                <button class="btn-primary btn-load-saved-circuit" data-id="${c.id}" style="padding:4px 12px; font-size:0.8rem;">
                  Load
                </button>
                <button class="btn-secondary btn-delete-saved-circuit" data-id="${c.id}" style="padding:4px 10px; font-size:0.8rem; color:#ef4444; border-color:#fca5a5;">
                  Delete
                </button>
              </div>
            </div>
          `;
        }).join('');

        // Attach action handlers
        dom.savedCircuitsList.querySelectorAll('.btn-load-saved-circuit').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            const circuitObj = state.savedCircuits.find(c => c.id === id);
            if (circuitObj && circuitObj.circuit_data) {
              loadCircuit(circuitObj.circuit_data);
              closeSavedCircuitsModal();
              switchView('builder');
              showToast(`Loaded "${circuitObj.name}" into Studio!`);
            }
          });
        });

        dom.savedCircuitsList.querySelectorAll('.btn-delete-saved-circuit').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id, 10);
            if (confirm('Are you sure you want to delete this saved circuit?')) {
              await deleteSavedCircuit(id);
            }
          });
        });
      }
    } catch (e) {
      dom.savedCircuitsList.innerHTML = '<div class="empty-state-box" style="color:#ef4444;">Failed to load saved circuits.</div>';
    }
  }

  async function deleteSavedCircuit(circuitId) {
    try {
      const res = await authFetch(`/api/circuits/${circuitId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Circuit deleted.');
        await loadAndRenderSavedCircuits();
        await refreshLearnerData();
      } else {
        showToast(data.error || 'Failed to delete circuit.', 'error');
      }
    } catch (e) {
      showToast('Error deleting circuit.', 'error');
    }
  }

  // =========================================================================
  // Navigation & View Switching
  // =========================================================================
  function switchView(viewName) {
    // Protected Routes: Only authenticated learners (or demo students) can access inner sections
    const hasDemoRole = window._qubitlab_role === 'student';
    if (!state.currentUser && !hasDemoRole && viewName !== 'dashboard') {
      openAuthModal('login');
      showToast(`Please sign in or register to access ${viewName.toUpperCase()}.`, 'warning');
      return;
    }

    state.activeView = viewName;

    // Update student nav tab active states (only tabs with data-view, not data-teacher-view)
    document.querySelectorAll('#student-nav .nav-tab-btn').forEach(tab => {
      if (tab.dataset.view === viewName) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    dom.viewSections.forEach(section => {
      if (section.id === `view-${viewName}`) section.classList.add('active');
      else section.classList.remove('active');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View specific hooks
    if (viewName === 'builder') {
      setTimeout(() => {
        if (blochRenderer && dom.blochThreeContainer) {
          const w = dom.blochThreeContainer.clientWidth;
          const h = dom.blochThreeContainer.clientHeight;
          blochCamera.aspect = w / h;
          blochCamera.updateProjectionMatrix();
          blochRenderer.setSize(w, h);
        }
      }, 100);
    }
  }

  // Bind view switching specifically to student navigation tabs
  document.querySelectorAll('#student-nav .nav-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });


  // =========================================================================
  // Toast Helper
  // =========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.style.borderColor = 'var(--rose-danger)';
    if (type === 'warning') toast.style.borderColor = 'var(--amber-warning)';
    toast.innerText = message;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // Simple Markdown Formatter Helper
  function formatMarkdown(text) {
    if (!text) return '';
    let out = text
      .replace(/### (.*?)\n/g, '<h3>$1</h3>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="font-family:var(--font-mono); color:var(--cyan-primary);">$1</code>')
      .replace(/\n\n/g, '<br><br>');
    return out;
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  function setupEventListeners() {
    // Brand home
    document.getElementById('brand-home-btn').addEventListener('click', () => switchView('dashboard'));

    // Dashboard quick CTAs
    if (dom.heroStartLearningBtn) dom.heroStartLearningBtn.addEventListener('click', () => switchView('learn'));
    if (dom.heroQuickBellBtn) {
      dom.heroQuickBellBtn.addEventListener('click', () => {
        loadPreset('bell_phi_plus');
        switchView('builder');
      });
    }
    if (dom.heroTakeChallengeBtn) dom.heroTakeChallengeBtn.addEventListener('click', () => switchView('challenges'));
    if (dom.viewAllModulesLink) dom.viewAllModulesLink.addEventListener('click', () => switchView('learn'));
    if (dom.openStudioLink) dom.openStudioLink.addEventListener('click', () => switchView('builder'));

    // Roadmap node clicks
    document.querySelectorAll('.roadmap-step').forEach(step => {
      step.addEventListener('click', () => {
        const modId = step.dataset.moduleId;
        if (modId) {
          loadModule(modId);
          switchView('learn');
        }
      });
    });

    // Launchpad cards
    document.querySelectorAll('.launch-card').forEach(card => {
      card.addEventListener('click', () => {
        const preset = card.dataset.preset;
        if (preset) {
          loadPreset(preset);
          switchView('builder');
        }
      });
    });

    // AI prompt chips in dashboard
    document.querySelectorAll('.ai-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        openAiTutor(prompt, 'chat');
      });
    });

    // AI Tutor drawer triggers
    if (dom.openAiTutorBtn) dom.openAiTutorBtn.addEventListener('click', () => openAiTutor());
    if (dom.closeAiTutorBtn) dom.closeAiTutorBtn.addEventListener('click', closeAiTutor);
    if (dom.aiTutorOverlay) dom.aiTutorOverlay.addEventListener('click', closeAiTutor);
    if (dom.explainResultAiBtn) {
      dom.explainResultAiBtn.addEventListener('click', () => {
        openAiTutor(null, 'explain');
      });
    }

    // Settings modal triggers
    if (dom.settingsModalBtn) dom.settingsModalBtn.addEventListener('click', openSettings);
    if (dom.closeSettingsModalBtn) dom.closeSettingsModalBtn.addEventListener('click', closeSettings);
    if (dom.cancelSettingsBtn) dom.cancelSettingsBtn.addEventListener('click', closeSettings);
    if (dom.settingsModalOverlay) {
      dom.settingsModalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.settingsModalOverlay) closeSettings();
      });
    }

    // Gate palette clicks
    dom.gateTokens.forEach(token => {
      token.addEventListener('click', () => {
        dom.gateTokens.forEach(t => t.classList.remove('active-tool'));
        token.classList.add('active-tool');
        state.activeGateTool = token.dataset.gate;
        state.cnotPendingControl = null;
      });
    });

    // Studio toolbar controls
    if (dom.studioQubitsSelect) {
      dom.studioQubitsSelect.addEventListener('change', (e) => {
        state.circuit.qubits = parseInt(e.target.value, 10);
        state.selectedBlochQubit = 0;
        updateBlochQubitDropdown();
        renderCircuitGrid();
        runSimulation();
      });
    }

    if (dom.studioPresetsSelect) {
      dom.studioPresetsSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) loadPreset(val);
      });
    }

    if (dom.studioAddStepBtn) {
      dom.studioAddStepBtn.addEventListener('click', () => {
        state.circuit.steps.push([]);
        renderCircuitGrid();
      });
    }

    if (dom.studioRemoveStepBtn) {
      dom.studioRemoveStepBtn.addEventListener('click', () => {
        if (state.circuit.steps.length > 3) {
          state.circuit.steps.pop();
          renderCircuitGrid();
          runSimulation();
        }
      });
    }

    if (dom.studioOptimizeBtn) {
      dom.studioOptimizeBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.circuit)
          }).then(r => r.json());

          if (res.success && res.data) {
            if (res.data.has_optimizations) {
              const msg = res.data.suggestions.map(s => s.message).join('\n');
              showToast(`⚡ Optimization alert: ${res.data.count} redundancy found!`);
              openAiTutor(null, 'optimize');
            } else {
              showToast('✨ Circuit topology is already optimal! No redundant gates.');
            }
          }
        } catch (e) {
          showToast('Optimize check failed.', 'error');
        }
      });
    }

    if (dom.studioClearBtn) dom.studioClearBtn.addEventListener('click', clearCircuit);
    if (dom.studioRunSimBtn) dom.studioRunSimBtn.addEventListener('click', runSimulation);

    // Bloch Qubit selection change
    if (dom.blochQubitSelect) {
      dom.blochQubitSelect.addEventListener('change', (e) => {
        state.selectedBlochQubit = parseInt(e.target.value, 10) || 0;
        renderBlochForCurrentQubit();
      });
    }

    // Challenge actions
    if (dom.challengeHintBtn) {
      dom.challengeHintBtn.addEventListener('click', () => {
        openAiTutor(null, 'hint');
      });
    }

    if (dom.challengeSubmitBtn) {
      dom.challengeSubmitBtn.addEventListener('click', submitChallengeSolution);
    }

    // Auth navbar buttons & modal
    if (dom.navLoginBtn) dom.navLoginBtn.addEventListener('click', () => openAuthModal('login'));
    if (dom.navRegisterBtn) dom.navRegisterBtn.addEventListener('click', () => openAuthModal('register'));
    if (dom.tabBtnLogin) dom.tabBtnLogin.addEventListener('click', () => openAuthModal('login'));
    if (dom.tabBtnRegister) dom.tabBtnRegister.addEventListener('click', () => openAuthModal('register'));
    if (dom.linkToRegister) dom.linkToRegister.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('register'); });
    if (dom.linkToLogin) dom.linkToLogin.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('login'); });
    if (dom.closeAuthModalBtn) dom.closeAuthModalBtn.addEventListener('click', closeAuthModal);
    if (dom.authModalOverlay) {
      dom.authModalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.authModalOverlay) closeAuthModal();
      });
    }
    if (dom.authLoginForm) dom.authLoginForm.addEventListener('submit', handleLogin);
    if (dom.authRegisterForm) dom.authRegisterForm.addEventListener('submit', handleRegister);
    if (dom.navLogoutBtn) dom.navLogoutBtn.addEventListener('click', handleLogout);

    // Hero Continue Learning CTA
    if (dom.heroContinueLearningBtn) {
      dom.heroContinueLearningBtn.addEventListener('click', () => {
        const modId = dom.heroContinueTopic ? dom.heroContinueTopic.dataset.moduleId : null;
        if (modId) loadModule(modId);
        switchView('learn');
      });
    }

    // Studio Save and My Circuits controls
    if (dom.studioSaveCircuitBtn) dom.studioSaveCircuitBtn.addEventListener('click', openSaveCircuitDialog);
    if (dom.studioMyCircuitsBtn) dom.studioMyCircuitsBtn.addEventListener('click', openSavedCircuitsModal);
    if (dom.navMyCircuitsBtn) dom.navMyCircuitsBtn.addEventListener('click', openSavedCircuitsModal);

    // Save Circuit Dialog controls
    if (dom.closeSaveCircuitDialogBtn) dom.closeSaveCircuitDialogBtn.addEventListener('click', closeSaveCircuitDialog);
    if (dom.cancelSaveCircuitDialogBtn) dom.cancelSaveCircuitDialogBtn.addEventListener('click', closeSaveCircuitDialog);
    if (dom.confirmSaveCircuitBtn) dom.confirmSaveCircuitBtn.addEventListener('click', handleConfirmSaveCircuit);
    if (dom.saveCircuitDialogOverlay) {
      dom.saveCircuitDialogOverlay.addEventListener('click', (e) => {
        if (e.target === dom.saveCircuitDialogOverlay) closeSaveCircuitDialog();
      });
    }

    // Saved Circuits Modal controls
    if (dom.closeSavedCircuitsModalBtn) dom.closeSavedCircuitsModalBtn.addEventListener('click', closeSavedCircuitsModal);
    if (dom.closeSavedCircuitsFooterBtn) dom.closeSavedCircuitsFooterBtn.addEventListener('click', closeSavedCircuitsModal);
    if (dom.savedCircuitsModalOverlay) {
      dom.savedCircuitsModalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.savedCircuitsModalOverlay) closeSavedCircuitsModal();
      });
    }
  }

  async function loadPreset(presetKey) {
    try {
      const res = await fetch('/api/presets').then(r => r.json());
      if (res.success && res.presets[presetKey]) {
        loadCircuit(res.presets[presetKey]);
        showToast(`Loaded ${res.presets[presetKey].name}`);
      }
    } catch (e) {
      console.error('Failed to load preset:', e);
    }
  }

  // =========================================================================
  // Initialize Application
  // =========================================================================
  async function init() {
    setupEventListeners();
    initChart();
    initThreeBloch();
    updateBlochQubitDropdown();
    renderCircuitGrid();

    // Check server health
    try {
      const health = await fetch('/api/health').then(r => r.json());
      if (health.status === 'healthy') {
        document.getElementById('engine-name-label').innerText = `${health.backend} (${health.qiskit_version})`;
      }
    } catch (e) {
      console.warn('Backend server check note:', e);
    }

    // Check learner authentication session & restore progress
    await checkAuthSession();

    // Load curriculum & challenges
    await loadCurriculum();
    await loadChallenges();
    updateProgressUI();

    // Initial simulation run on default Bell State
    await runSimulation();
  }



  function renderStudentDashboard(student) {
    if (!student) return;

    // 1. Top HUD Identity & Stats
    const studentNameEl = document.getElementById('hud-student-name');
    if (studentNameEl) studentNameEl.textContent = student.name.split(' ')[0] || student.name;

    const avatarEl = document.getElementById('hud-avatar');
    if (avatarEl) avatarEl.textContent = student.avatar || 'AS';

    const streakEl = document.getElementById('hud-streak-val');
    if (streakEl) streakEl.textContent = `${student.streakDays} Days`;

    const xpEl = document.getElementById('hud-xp-val');
    if (xpEl) xpEl.textContent = `${student.totalXP} XP`;

    const rankEl = document.getElementById('hud-rank-val');
    if (rankEl) rankEl.textContent = student.rank || 'Quantum Explorer';

    const progEl = document.getElementById('hud-progress-val');
    if (progEl) progEl.textContent = `${student.overallProgress}%`;

    const quizEl = document.getElementById('hud-quiz-val');
    if (quizEl) quizEl.textContent = `${student.quizAverage}%`;

    const circuitsEl = document.getElementById('hud-circuits-val');
    if (circuitsEl) circuitsEl.textContent = `${student.savedCircuits ? student.savedCircuits.length : 2}`;

    // 2. Recommended Next Activity Banner
    const recBanner = document.getElementById('recommended-activity-banner');
    const recHeading = document.getElementById('rec-banner-heading');
    const recDesc = document.getElementById('rec-banner-desc');
    const recCta = document.getElementById('rec-banner-cta-btn');
    const recIcon = document.getElementById('rec-banner-icon');

    if (recBanner && student.recommendation) {
      const rec = student.recommendation;
      const currentLevel = window.QUBITLAB_DEMO.getLevel(rec.levelId || 'superposition');

      if (currentLevel && currentLevel.status === 'completed') {
        recBanner.classList.add('unlocked-all');
        if (recIcon) recIcon.textContent = '🎉';
        if (recHeading) {
          recHeading.innerHTML = `<span>Level 3: Superposition Mastered!</span> <span class="rec-tag-pill" style="background:rgba(16,185,129,0.15); color:#059669;">100% Complete</span>`;
        }
        if (recDesc) {
          recDesc.textContent = `Aarav has unlocked Level 4: Quantum Gates (+50 XP earned)! Proceed to explore Pauli rotations on the Bloch sphere.`;
        }
        if (recCta) {
          recCta.innerHTML = `<span>Explore Quantum Gates</span> &rarr;`;
          recCta.onclick = () => openLevelMissionModal('quantum_gates');
        }
      } else {
        recBanner.classList.remove('unlocked-all');
        if (recIcon) recIcon.textContent = currentLevel ? currentLevel.icon : '🟠';
        if (recHeading) {
          recHeading.innerHTML = `<span>${rec.levelTitle || 'Level 3: Superposition'}</span> <span class="rec-tag-pill">60% Complete</span>`;
        }
        if (recDesc) {
          recDesc.textContent = rec.detail || `You've completed the concept lesson, circuit experiment, and simulation analysis. Solve the Level Challenge to master Superposition and unlock Level 4: Quantum Gates (+50 XP)!`;
        }
        if (recCta) {
          recCta.innerHTML = `<span>${rec.actionText || 'Take Level Challenge'}</span> &rarr;`;
          recCta.onclick = () => openLevelMissionModal(rec.levelId || 'superposition');
        }
      }
    }

    // 3. Render The Quantum Journey Path
    renderQuantumJourney();

    // 4. Render Recent Activity Feed
    const feed = document.getElementById('dashboard-activity-feed');
    if (feed && student.recentActivity) {
      feed.innerHTML = student.recentActivity.map(a =>
        `<div class="activity-event">
          <div class="activity-icon ${a.type || 'module'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${a.type === 'module' ? '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' :
                a.type === 'quiz' ? '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><circle cx="12" cy="12" r="10"></circle>' :
                a.type === 'circuit' ? '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>' :
                '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'}
            </svg>
          </div>
          <div class="activity-body">
            <div class="activity-text">${a.text}</div>
            <div class="activity-time">${a.time}</div>
          </div>
        </div>`
      ).join('');
    }
  }

  // =========================================================================
  // QUANTUM LEARNING JOURNEY RENDERER (TOP -> BOTTOM WINDING GAME MAP)
  // =========================================================================

  function renderQuantumJourney() {
    const flowContainer = document.getElementById('quantum-journey-levels-flow');
    if (!flowContainer || !window.QUBITLAB_DEMO) return;

    const levels = window.QUBITLAB_DEMO.getStudentLevels();

    // 1. TOP BANNER: START YOUR QUANTUM JOURNEY
    let html = `
      <div class="journey-node-row row-pos-center" id="journey-row-start">
        <div class="journey-start-marker" id="journey-node-start" title="Journey begins here!">
          <span class="start-icon-pulse">🚀</span>
          <div class="start-badge-content">
            <span class="start-badge-label">START YOUR QUANTUM JOURNEY</span>
            <span class="start-badge-sub">Begin at Level 1 — Quantum Basics below</span>
          </div>
        </div>
      </div>
    `;

    // 2. LEVELS 1 THROUGH 7 (Strict TOP -> BOTTOM Order, Winding Left & Right)
    levels.forEach((level, idx) => {
      const isCurrent = level.status === 'in_progress';
      const isCompleted = level.status === 'completed';
      const isLocked = level.status === 'locked';

      // Alternating winding pattern: Level 1 (left), Level 2 (right), Level 3 (left), etc.
      const rowPosClass = idx % 2 === 0 ? 'row-pos-left' : 'row-pos-right';

      const statusPillText = isCompleted
        ? '✓ COMPLETED'
        : isCurrent
        ? `⚡ IN PROGRESS (${level.progress}%)`
        : '🔒 LOCKED';

      const statusPillClass = isCompleted ? 'completed' : isCurrent ? 'in_progress' : 'locked';
      const doneMissionsCount = level.completedMissions ? level.completedMissions.length : 0;
      const totalMissions = level.missions ? level.missions.length : 0;

      const ctaBtnText = isCompleted
        ? 'Review Level →'
        : isCurrent
        ? 'CONTINUE LEVEL →'
        : '🔒 Locked';

      const ctaBtnClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';

      html += `
        <div class="journey-node-row ${rowPosClass}" id="journey-row-lvl-${level.id}">
          <div class="journey-node-card ${level.status}" id="node-card-${level.id}" data-level-id="${level.id}" data-level-idx="${idx}">
            
            <!-- Left Orb / Checkpoint Badge -->
            <div class="node-orb-container">
              <div class="node-orb" id="orb-${level.id}">
                ${isCompleted ? '✓' : isLocked ? '🔒' : level.icon || '⚛️'}
              </div>
              ${isCurrent ? '<div class="node-pulse-ring"></div>' : ''}
            </div>

            <!-- Content Center -->
            <div class="node-content-info">
              <div class="node-meta-row">
                <span class="node-level-tag">LEVEL 0${level.number}</span>
                <span class="node-status-pill ${statusPillClass}">${statusPillText}</span>
              </div>
              <h3 class="node-title">${level.title}</h3>
              <p class="node-subtitle">${level.subtitle}</p>

              <!-- Progress Strip -->
              <div class="node-progress-strip">
                <div class="node-prog-track">
                  <div class="node-prog-fill ${level.status}" style="width: ${level.progress}%;"></div>
                </div>
                <span class="node-missions-count">${doneMissionsCount} / ${totalMissions} Missions</span>
              </div>
            </div>

            <!-- Action Side Right -->
            <div class="node-action-side">
              <span class="node-xp-badge">+${level.xpReward} XP</span>
              <button class="btn-node-cta ${ctaBtnClass}" type="button" aria-label="${ctaBtnText}">
                ${ctaBtnText}
              </button>
            </div>

          </div>
        </div>
      `;
    });

    // 3. BOTTOM DESTINATION: QUANTUM MASTERY (CAPSTONE TROPHY)
    html += `
      <div class="journey-node-row row-pos-center" id="journey-row-mastery">
        <div class="journey-capstone-card" id="journey-node-mastery" title="Master all 7 levels to unlock Quantum Mastery Certification">
          <div class="capstone-orb">🏆</div>
          <div class="capstone-info">
            <h3>QUANTUM MASTERY</h3>
            <p>Capstone Certification • Full Quantum Algorithm Architect status unlocked upon completing all 7 levels.</p>
          </div>
        </div>
      </div>
    `;

    flowContainer.innerHTML = html;

    // Attach click events to each level card
    levels.forEach((level) => {
      const card = document.getElementById(`node-card-${level.id}`);
      if (!card) return;

      card.addEventListener('click', () => {
        if (level.status === 'locked') {
          // Play shake animation
          card.classList.remove('shake');
          void card.offsetWidth; // trigger reflow
          card.classList.add('shake');

          // Find predecessor level
          const prevLevel = levels[level.number - 2];
          const prevTitle = prevLevel ? prevLevel.title : 'the previous level';
          showToast(`🔒 Level ${level.number}: ${level.title} is locked. Complete ${prevTitle} to unlock!`, 'warning');
        } else {
          // Open Level Mission Modal for current or completed levels
          openLevelMissionModal(level.id);
        }
      });
    });

    // Draw dynamic smooth SVG bezier connecting path
    setTimeout(() => {
      updateJourneySvgPaths();
    }, 40);
  }

  // =========================================================================
  // DYNAMIC SVG BEZIER PATH GENERATOR
  // =========================================================================

  function updateJourneySvgPaths() {
    const mapContainer = document.getElementById('quantum-world-map');
    const svgEl = document.getElementById('quantum-map-svg');
    const pathCompleted = document.getElementById('svg-path-completed');
    const pathActive = document.getElementById('svg-path-active');
    const pathLocked = document.getElementById('svg-path-locked');

    if (!mapContainer || !svgEl || !window.QUBITLAB_DEMO) return;

    const mapRect = mapContainer.getBoundingClientRect();
    if (mapRect.width === 0 || mapRect.height === 0) return;

    // Synchronize SVG canvas dimensions to container
    svgEl.setAttribute('viewBox', `0 0 ${mapContainer.clientWidth} ${mapContainer.clientHeight}`);
    svgEl.setAttribute('width', mapContainer.clientWidth);
    svgEl.setAttribute('height', mapContainer.clientHeight);

    const levels = window.QUBITLAB_DEMO.getStudentLevels();

    // Collect ordered nodes: [Start, Level 1, Level 2, ..., Level 7, Mastery]
    const nodeSequence = [];

    // 1. Start node
    const startEl = document.getElementById('journey-node-start');
    if (startEl) {
      const rect = startEl.getBoundingClientRect();
      nodeSequence.push({
        status: 'completed',
        x: rect.left + rect.width / 2 - mapRect.left,
        y: rect.bottom - mapRect.top - 4
      });
    }

    // 2. Level nodes
    levels.forEach(lvl => {
      const cardEl = document.getElementById(`node-card-${lvl.id}`);
      const orbEl = document.getElementById(`orb-${lvl.id}`);
      const targetEl = orbEl || cardEl;
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        nodeSequence.push({
          status: lvl.status,
          x: rect.left + rect.width / 2 - mapRect.left,
          y: rect.top + rect.height / 2 - mapRect.top
        });
      }
    });

    // 3. Mastery node
    const masteryEl = document.getElementById('journey-node-mastery');
    if (masteryEl) {
      const rect = masteryEl.getBoundingClientRect();
      nodeSequence.push({
        status: 'locked',
        x: rect.left + rect.width / 2 - mapRect.left,
        y: rect.top - mapRect.top + 8
      });
    }

    if (nodeSequence.length < 2) return;

    let dCompleted = '';
    let dActive = '';
    let dLocked = '';

    for (let i = 0; i < nodeSequence.length - 1; i++) {
      const p1 = nodeSequence[i];
      const p2 = nodeSequence[i + 1];

      const x1 = p1.x;
      const y1 = p1.y;
      const x2 = p2.x;
      const y2 = p2.y;

      const dy = y2 - y1;
      const c1y = y1 + dy * 0.55;
      const c2y = y2 - dy * 0.55;

      const segmentD = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${c1y.toFixed(1)}, ${x2.toFixed(1)} ${c2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)} `;

      // Determine segment state
      if (p2.status === 'completed') {
        dCompleted += segmentD;
      } else if (p2.status === 'in_progress') {
        dActive += segmentD;
      } else {
        dLocked += segmentD;
      }
    }

    if (pathCompleted) pathCompleted.setAttribute('d', dCompleted);
    if (pathActive) pathActive.setAttribute('d', dActive);
    if (pathLocked) pathLocked.setAttribute('d', dLocked);
  }

  // Handle window resizing for SVG path alignment
  window.addEventListener('resize', () => {
    if (window._qubitlab_role === 'student') {
      updateJourneySvgPaths();
    }
  });

  // =========================================================================
  // LEVEL MISSIONS & CHALLENGE MODAL
  // =========================================================================

  function openLevelMissionModal(levelId) {
    if (!window.QUBITLAB_DEMO) return;
    const level = window.QUBITLAB_DEMO.getLevel(levelId);
    if (!level) return;

    // Populate Header
    const orb = document.getElementById('level-modal-orb');
    if (orb) orb.textContent = level.icon || '⚛️';

    const titleEl = document.getElementById('level-modal-title');
    if (titleEl) titleEl.textContent = `Level ${level.number} — ${level.title}`;

    const subEl = document.getElementById('level-modal-subtitle');
    if (subEl) subEl.textContent = level.subtitle;

    const xpBadge = document.getElementById('level-modal-xp-badge');
    if (xpBadge) xpBadge.textContent = `+${level.xpReward} XP`;

    // Build Body
    const body = document.getElementById('level-modal-body');
    if (!body) return;

    const doneCount = level.completedMissions ? level.completedMissions.length : 0;
    const totalCount = level.missions ? level.missions.length : 0;
    const isCompleted = level.status === 'completed';

    // 1. Progress Meter
    const meterHtml = `
      <div class="level-progress-meter">
        <div class="meter-label-row">
          <span style="font-weight:700; color:var(--color-text);">Level Mastery Progress</span>
          <span style="font-weight:800; font-family:var(--font-mono); color:${isCompleted ? '#059669' : 'var(--color-secondary)'};">
            ${level.progress}% Complete (${doneCount}/${totalCount} Missions)
          </span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width: ${level.progress}%; background: ${isCompleted ? '#10b981' : 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-secondary) 100%)'};"></div>
        </div>
      </div>
    `;

    // 2. Missions List
    const missionsHtml = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="missions-section-title">
          <span>📋 Level Missions (${doneCount} of ${totalCount} Completed)</span>
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-dim);">Sequential Objective</span>
        </div>
        <div class="missions-list">
          ${level.missions.map((m, mIdx) => {
            const isDone = level.completedMissions && level.completedMissions.includes(m.id);
            return `
              <div class="mission-row ${isDone ? 'completed' : 'active'}">
                <div class="mission-left">
                  <div class="mission-check-circle ${isDone ? 'done' : 'pending'}">
                    ${isDone ? '✓' : mIdx + 1}
                  </div>
                  <div class="mission-desc-box">
                    <div class="mission-name">
                      <span>${m.icon || '⚛️'}</span>
                      <span>${m.title}</span>
                      ${isDone ? '<span class="rec-tag-pill" style="background:rgba(16,185,129,0.15); color:#059669; font-size:0.68rem; padding:1px 6px;">Done</span>' : ''}
                    </div>
                    <div class="mission-sub">${m.desc}</div>
                  </div>
                </div>
                <div>
                  <button class="btn-mission-action" onclick="window.handleMissionAction('${level.id}', '${m.id}', '${m.type}', '${m.preset || m.moduleId || ''}')">
                    ${isDone ? 'Review' : 'Start'} &rarr;
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // 3. Interactive Challenge Section
    let challengeHtml = '';
    if (level.challenge) {
      if (level.challengePassed) {
        challengeHtml = `
          <div class="level-complete-celebration" style="padding:20px;">
            <div class="celebration-trophy-orb" style="width:52px; height:52px; font-size:1.6rem;">✓</div>
            <h3 style="font-family:var(--font-heading); font-size:1.25rem; font-weight:800; color:var(--color-text);">Challenge Passed!</h3>
            <p style="font-size:0.88rem; color:var(--text-muted); max-width:480px;">
              You have successfully answered the ${level.title} challenge and earned <strong>+${level.xpReward} XP</strong>.
            </p>
          </div>
        `;
      } else {
        challengeHtml = `
          <div class="level-challenge-box" id="level-challenge-section">
            <div class="challenge-box-header">
              <div class="challenge-box-title">
                <span>🧩 Final Level Challenge</span>
                <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">Pass to unlock next level</span>
              </div>
              <span class="node-xp-badge">+${level.xpReward} XP</span>
            </div>

            <p class="challenge-question-text">${level.challenge.question}</p>

            ${level.challenge.context ? `
              <div class="challenge-context-tip">
                💡 <strong>Simulation Context:</strong> ${level.challenge.context}
              </div>
            ` : ''}

            <div class="challenge-options-list" id="challenge-options-container">
              ${level.challenge.options.map(opt => `
                <div class="challenge-option-card" data-opt-id="${opt.id}" onclick="window.selectChallengeOption('${opt.id}')">
                  <div class="option-radio-dot"></div>
                  <div style="flex:1;">${opt.text}</div>
                </div>
              `).join('')}
            </div>

            <div class="challenge-feedback-card" id="challenge-feedback-card"></div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <button class="btn-secondary" onclick="window.askAiTutorHint('${level.title}')" style="padding:8px 14px; font-size:0.82rem;">
                💡 Ask AI Tutor for Hint
              </button>
              <button class="btn-primary" id="submit-level-challenge-btn" onclick="window.submitLevelChallenge('${level.id}')" style="padding:9px 22px; font-size:0.88rem; font-weight:700;">
                ✓ Submit Answer
              </button>
            </div>
          </div>
        `;
      }
    }

    body.innerHTML = `
      ${meterHtml}
      ${missionsHtml}
      ${challengeHtml}
    `;

    // Open the modal
    const overlay = document.getElementById('level-mission-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  function closeLevelMissionModal() {
    const overlay = document.getElementById('level-mission-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  window.openLevelMissionModal = openLevelMissionModal;
  window.closeLevelMissionModal = closeLevelMissionModal;

  // Mission Action Dispatcher (Connects Journey with Studio, Academy, AI Tutor)
  window.handleMissionAction = function(levelId, missionId, type, param) {
    // 1. Mark mission completed in centralized data if not already done
    window.QUBITLAB_DEMO.completeMission(levelId, missionId);

    // 2. Perform contextual action
    if (type === 'circuit' || type === 'simulation' || type === 'prob_analysis') {
      closeLevelMissionModal();
      switchView('builder');

      // If preset defined, load preset
      if (param && dom.studioPresetsSelect) {
        dom.studioPresetsSelect.value = param;
        dom.studioPresetsSelect.dispatchEvent(new Event('change'));
        showToast(`Loaded ${param} preset into Circuit Studio!`);
      }

      if (type === 'simulation') {
        runSimulation();
        showToast('Running 1024-shot simulation on Qiskit Aer...');
      }
    } else if (type === 'lesson') {
      closeLevelMissionModal();
      switchView('learn');
      if (param) {
        loadModule(param);
      }
    } else if (type === 'challenge') {
      const challengeBox = document.getElementById('level-challenge-section');
      if (challengeBox) {
        challengeBox.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Interactive Challenge Option Selection
  let selectedOptionId = null;
  window.selectChallengeOption = function(optionId) {
    selectedOptionId = optionId;
    document.querySelectorAll('.challenge-option-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.optId === optionId);
    });
  };

  // Ask AI Tutor for Hint directly from Level Challenge
  window.askAiTutorHint = function(topicTitle) {
    openAiTutorDrawer();
    sendAiTutorQuery('hint', `Give me a helpful conceptual hint for the ${topicTitle} challenge without revealing the final answer.`);
  };

  // Submit Interactive Challenge & Trigger Celebratory Level Unlock
  window.submitLevelChallenge = function(levelId) {
    if (!selectedOptionId) {
      showToast('Please select an option before submitting.', 'warning');
      return;
    }

    const level = window.QUBITLAB_DEMO.getLevel(levelId);
    if (!level || !level.challenge) return;

    const chosen = level.challenge.options.find(o => o.id === selectedOptionId);
    const feedbackBox = document.getElementById('challenge-feedback-card');

    if (!chosen) return;

    if (chosen.correct) {
      // 1. Mark correct styling
      document.querySelectorAll('.challenge-option-card').forEach(card => {
        if (card.dataset.optId === chosen.id) {
          card.classList.add('correct');
        }
      });

      if (feedbackBox) {
        feedbackBox.className = 'challenge-feedback-card correct';
        feedbackBox.textContent = `✓ ${chosen.explanation}`;
      }

      // 2. Trigger centralized level completion & next level unlock
      const unlockResult = window.QUBITLAB_DEMO.passLevelChallenge(levelId);

      // 3. Render celebratory screen inside modal after short delay
      setTimeout(() => {
        const body = document.getElementById('level-modal-body');
        if (!body) return;

        const nextLvl = unlockResult ? unlockResult.unlockedLevel : null;
        body.innerHTML = `
          <div class="level-complete-celebration">
            <div class="celebration-trophy-orb">🎉</div>
            <h2 class="celebration-title">LEVEL ${level.number} COMPLETE!</h2>
            <div style="font-weight:700; font-size:1.15rem; color:var(--color-text);">${level.title} Mastered</div>
            <div class="celebration-xp-pill">+${unlockResult ? unlockResult.xpEarned : 50} XP EARNED</div>
            <ul class="celebration-bullets">
              <li>✓ All ${level.missions.length} Level Missions Completed</li>
              <li>✓ Interactive Level Challenge Passed</li>
            </ul>
            ${nextLvl ? `
              <div class="celebration-unlock-box">
                🔓 Level ${nextLvl.number}: ${nextLvl.title} Unlocked!
              </div>
            ` : `
              <div class="celebration-unlock-box">
                🏆 Quantum Mastery Capstone Unlocked!
              </div>
            `}
            <div class="celebration-actions">
              ${nextLvl ? `
                <button class="btn-primary" onclick="window.continueToNextLevel('${nextLvl.id}')" style="padding:11px 22px; font-weight:700;">
                  Continue to Level ${nextLvl.number}: ${nextLvl.title} &rarr;
                </button>
              ` : ''}
              <button class="btn-secondary" onclick="window.closeLevelMissionModal()" style="padding:11px 20px;">
                Return to Journey Map
              </button>
            </div>
          </div>
        `;

        showToast(`🎉 Level ${level.number} Completed! Next level unlocked!`, 'success');
      }, 700);

    } else {
      // Mark incorrect styling
      document.querySelectorAll('.challenge-option-card').forEach(card => {
        if (card.dataset.optId === chosen.id) {
          card.classList.add('incorrect');
        }
      });

      if (feedbackBox) {
        feedbackBox.className = 'challenge-feedback-card incorrect';
        feedbackBox.textContent = `✗ ${chosen.explanation}`;
      }
    }
  };

  window.continueToNextLevel = function(nextLevelId) {
    closeLevelMissionModal();
    openLevelMissionModal(nextLevelId);
  };

  // Wire up Level Mission Modal close button & backdrop click
  const closeLevelBtn = document.getElementById('close-level-modal-btn');
  if (closeLevelBtn) closeLevelBtn.addEventListener('click', closeLevelMissionModal);

  const levelModalOverlay = document.getElementById('level-mission-modal-overlay');
  if (levelModalOverlay) {
    levelModalOverlay.addEventListener('click', (e) => {
      if (e.target === levelModalOverlay) closeLevelMissionModal();
    });
  }

  // =========================================================================
  // ONBOARDING & AUTHENTICATION FLOW (LANDING -> AUTH -> ROLE -> APP)
  // =========================================================================

  // DOM Elements for Onboarding Flow
  const landingOverlay = document.getElementById('landing-page-overlay');
  const authOverlay = document.getElementById('auth-page-overlay');
  const roleOverlay = document.getElementById('role-selection-overlay');
  const studentNav = document.getElementById('student-nav');
  const teacherNav = document.getElementById('teacher-nav');
  const switchRoleBtn = document.getElementById('switch-role-btn');
  const switchRoleLbl = document.getElementById('switch-role-label');

  // Navigation Controller between screens
  function showLandingPage() {
    if (landingOverlay) {
      landingOverlay.style.display = 'flex';
      landingOverlay.classList.remove('hidden');
    }
    if (authOverlay) authOverlay.style.display = 'none';
    if (roleOverlay) roleOverlay.style.display = 'none';

    // Hide app navigation bars during onboarding
    if (studentNav) studentNav.style.display = 'none';
    if (teacherNav) teacherNav.style.display = 'none';
    if (switchRoleBtn) switchRoleBtn.style.display = 'none';

    // Start 3D visual animation loop
    startLandingVisual();
  }

  function showAuthPage(initialTab = 'login') {
    // Stop 3D animation loop while in auth screen to save GPU/CPU
    stopLandingVisual();

    if (landingOverlay) landingOverlay.style.display = 'none';
    if (authOverlay) {
      authOverlay.style.display = 'flex';
      authOverlay.classList.remove('hidden');
    }
    if (roleOverlay) roleOverlay.style.display = 'none';

    if (studentNav) studentNav.style.display = 'none';
    if (teacherNav) teacherNav.style.display = 'none';
    if (switchRoleBtn) switchRoleBtn.style.display = 'none';

    switchAuthTab(initialTab);
  }

  function showRoleOverlay() {
    stopLandingVisual();

    if (landingOverlay) landingOverlay.style.display = 'none';
    if (authOverlay) authOverlay.style.display = 'none';
    if (roleOverlay) {
      roleOverlay.style.display = 'flex';
      roleOverlay.classList.remove('hidden');
    }

    if (studentNav) studentNav.style.display = 'none';
    if (teacherNav) teacherNav.style.display = 'none';
    if (switchRoleBtn) switchRoleBtn.style.display = 'none';
  }

  function switchAuthTab(tab) {
    const loginTabBtn = document.getElementById('auth-tab-login-btn');
    const signupTabBtn = document.getElementById('auth-tab-signup-btn');
    const loginForm = document.getElementById('auth-screen-login-form');
    const signupForm = document.getElementById('auth-screen-signup-form');
    const alertBox = document.getElementById('auth-page-alert');

    if (alertBox) alertBox.style.display = 'none';

    if (tab === 'signup') {
      if (loginTabBtn) loginTabBtn.classList.remove('active');
      if (signupTabBtn) signupTabBtn.classList.add('active');
      if (loginForm) loginForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'block';
    } else {
      if (loginTabBtn) loginTabBtn.classList.add('active');
      if (signupTabBtn) signupTabBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
    }
  }

  function enterStudentRole() {
    if (!window.QUBITLAB_DEMO) { console.error('Demo data not loaded'); return; }
    window._qubitlab_role = 'student';

    // Hide role overlay
    if (roleOverlay) {
      roleOverlay.classList.add('hidden');
      setTimeout(() => { roleOverlay.style.display = 'none'; }, 400);
    }

    // Set demo student as authenticated user so all tabs, save circuits, etc. work seamlessly
    const student = window.QUBITLAB_DEMO.getStudent();
    if (!state.currentUser) {
      state.currentUser = {
        id: student.id || 1,
        name: student.name || 'Aarav Sharma',
        username: 'aarav',
        email: 'aarav@quantumclass.edu'
      };
      updateAuthUI();
    }

    // Show student nav, hide teacher nav
    if (studentNav) studentNav.style.display = '';
    if (teacherNav) teacherNav.style.display = 'none';
    if (switchRoleBtn) {
      switchRoleBtn.style.display = '';
      if (switchRoleLbl) switchRoleLbl.textContent = 'Switch Role';
    }

    // Render student dashboard with active demo student
    renderStudentDashboard(student);

    // Switch to dashboard view
    switchView('dashboard');
  }

  function enterTeacherRole() {
    if (!window.QUBITLAB_DEMO) { console.error('Demo data not loaded'); return; }
    window._qubitlab_role = 'teacher';

    // Hide role overlay
    if (roleOverlay) {
      roleOverlay.classList.add('hidden');
      setTimeout(() => { roleOverlay.style.display = 'none'; }, 400);
    }

    // Show teacher nav, hide student nav
    if (studentNav) studentNav.style.display = 'none';
    if (teacherNav) teacherNav.style.display = '';
    if (switchRoleBtn) {
      switchRoleBtn.style.display = '';
      if (switchRoleLbl) switchRoleLbl.textContent = 'Switch Role';
    }

    // Render student roster table
    renderStudentRosterTable();

    // Show teacher dashboard
    switchTeacherView('teacher-dashboard');
  }

  function switchTeacherView(viewName) {
    if (!viewName) return;
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('view-' + viewName);
    if (target) target.classList.add('active');

    // Update teacher nav active state
    document.querySelectorAll('#teacher-nav .nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.teacherView === viewName);
    });
  }

  function renderStudentRosterTable() {
    const tbody = document.getElementById('student-roster-tbody');
    if (!tbody || !window.QUBITLAB_DEMO) return;
    const roster = window.QUBITLAB_DEMO.CLASS_ROSTER;

    tbody.innerHTML = roster.map(s => {
      const progColor = s.progress >= 60 ? 'var(--color-accent)' : s.progress >= 35 ? 'var(--color-secondary)' : '#ef4444';
      const isAttention = s.status === 'Needs Attention';
      return `<tr>
        <td>
          <div class="student-name-cell">
            <div class="student-table-avatar" style="background:${isAttention ? '#ef4444' : 'var(--color-primary)'};">${s.avatar}</div>
            <span style="font-weight:600;">${s.name}</span>
          </div>
        </td>
        <td>
          <div class="table-progress-bar">
            <div class="table-prog-track"><div class="table-prog-fill" style="width:${s.progress}%; background:${progColor};"></div></div>
            <span style="font-size:0.82rem; font-weight:700; color:${progColor};">${s.progress}%</span>
          </div>
        </td>
        <td style="font-weight:600; color:${s.quizAverage >= 70 ? 'var(--color-accent)' : '#ef4444'};">${s.quizAverage}%</td>
        <td>${s.currentLevel || 'Superposition'}</td>
        <td>${s.challengesDone || 1} / 5</td>
        <td style="color:var(--text-muted); font-size:0.82rem;">${s.lastActive}</td>
        <td>
          <span class="status-badge ${isAttention ? 'attention' : 'active'}">
            ${isAttention ? '⚠ Needs Attention' : '● Active'}
          </span>
        </td>
        <td>
          <button class="btn-view-student" onclick="window.teacherViewStudent(${s.id})">View Journey →</button>
        </td>
      </tr>`;
    }).join('');
  }

  // Teacher View: Displays student's ACTUAL Quantum Learning Journey
  window.teacherViewStudent = function(studentId) {
    if (!window.QUBITLAB_DEMO) return;
    const rosterStudent = window.QUBITLAB_DEMO.CLASS_ROSTER.find(s => s.id === studentId);
    if (!rosterStudent) return;

    // Check if this is student #1 (Aarav Sharma) - use live active studentData
    const isAarav = studentId === 1;
    const liveStudent = isAarav ? window.QUBITLAB_DEMO.getStudent() : null;

    const studentName = liveStudent ? liveStudent.name : rosterStudent.name;
    const studentAvatar = liveStudent ? liveStudent.avatar : rosterStudent.avatar;
    const studentProgress = liveStudent ? liveStudent.overallProgress : rosterStudent.progress;
    const studentQuizAvg = liveStudent ? liveStudent.quizAverage : rosterStudent.quizAverage;
    const studentLastActive = rosterStudent.lastActive;

    // Populate modal header
    const avatarEl = document.getElementById('student-detail-avatar');
    if (avatarEl) avatarEl.textContent = studentAvatar;

    const nameEl = document.getElementById('student-detail-name');
    if (nameEl) nameEl.textContent = studentName;

    const metaEl = document.getElementById('student-detail-meta');
    if (metaEl) {
      metaEl.textContent = `Overall Progress: ${studentProgress}% • Quiz Average: ${studentQuizAvg}% • Last Active: ${studentLastActive}`;
    }

    const body = document.getElementById('student-detail-body');
    if (!body) return;

    // Get live journey levels for Aarav
    const levels = isAarav
      ? window.QUBITLAB_DEMO.getStudentLevels()
      : window.QUBITLAB_DEMO.getMasterLevels().map((l, i) => ({
          ...l,
          status: i < rosterStudent.modulesCompleted ? 'completed' : i === rosterStudent.modulesCompleted ? 'in_progress' : 'locked',
          progress: i < rosterStudent.modulesCompleted ? 100 : i === rosterStudent.modulesCompleted ? 50 : 0
        }));

    // Render Journey list inside Teacher modal
    const journeyRows = levels.map(lvl => {
      const statusIcon = lvl.status === 'completed' ? '✓' : lvl.status === 'in_progress' ? '🟠' : '🔒';
      const statusColor = lvl.status === 'completed' ? '#059669' : lvl.status === 'in_progress' ? 'var(--color-secondary)' : 'var(--text-dim)';
      const statusLabel = lvl.status === 'completed' ? 'Completed (100%)' : lvl.status === 'in_progress' ? `In Progress (${lvl.progress}%)` : 'Locked';

      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:var(--radius-md); background:${lvl.status === 'in_progress' ? 'rgba(249,115,22,0.06)' : lvl.status === 'completed' ? 'rgba(16,185,129,0.04)' : '#f9fafb'}; margin-bottom:8px; border:1px solid ${lvl.status === 'in_progress' ? 'rgba(249,115,22,0.25)' : lvl.status === 'completed' ? 'rgba(16,185,129,0.2)' : '#e5e7eb'};">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.1rem; width:24px; text-align:center;">${statusIcon}</span>
            <div>
              <div style="font-weight:700; font-size:0.9rem; color:var(--color-text);">Level ${lvl.number}: ${lvl.title}</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">${lvl.subtitle}</div>
            </div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:${statusColor};">${statusLabel}</span>
        </div>
      `;
    }).join('');

    // Dynamic Learning Insight
    let insightNote = '';
    if (isAarav) {
      const superState = liveStudent.levelStates.superposition;
      if (superState && superState.status === 'completed') {
        insightNote = '🎉 Superposition mastered (+50 XP earned)! Aarav has completed the concept lesson, circuit experiment, and challenge. Level 4: Quantum Gates is now unlocked and ready to explore.';
      } else {
        insightNote = 'Superposition is currently in progress (60% complete, 4 of 5 missions done). Aarav has completed the concept lesson and circuit experiment, but still needs to finish the final challenge to unlock Quantum Gates.';
      }
    } else {
      insightNote = rosterStudent.recommendation ? rosterStudent.recommendation.note : 'Active learner progressing through sequential quantum modules.';
    }

    body.innerHTML = `
      <div class="student-detail-section">
        <div class="student-detail-section-title">Overall Quantum Progress</div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <div style="flex:1; height:12px; background:#f3f4f6; border-radius:6px; overflow:hidden;">
            <div style="width:${studentProgress}%; height:100%; background:linear-gradient(90deg, var(--color-accent) 0%, var(--color-secondary) 100%); border-radius:6px; transition:width 0.4s ease;"></div>
          </div>
          <span style="font-weight:800; font-family:var(--font-mono); color:var(--color-accent); font-size:1.05rem;">${studentProgress}%</span>
        </div>
      </div>

      <div class="student-detail-section">
        <div class="student-detail-section-title">Quantum Learning Journey (Actual Progress)</div>
        <div style="display:flex; flex-direction:column;">
          ${journeyRows}
        </div>
      </div>

      <div class="student-detail-section">
        <div class="student-detail-section-title">AI Pedagogical Learning Insight</div>
        <div class="student-recommendation-box">
          <div class="rec-title">⚡ Real-Time Progress Analysis</div>
          <div class="rec-body">${insightNote}</div>
        </div>
      </div>

      <div class="student-detail-section">
        <div class="student-detail-section-title">Recent Learning Activity</div>
        ${(isAarav && liveStudent.recentActivity ? liveStudent.recentActivity : rosterStudent.recentActivity).map(a =>
          `<div style="padding:6px 0; border-bottom:1px solid #f3f4f6; font-size:0.85rem; color:var(--text-muted);">• ${typeof a === 'string' ? a : a.text}</div>`
        ).join('')}
      </div>
    `;

    // Open modal
    const overlay = document.getElementById('student-detail-modal-overlay');
    if (overlay) overlay.classList.add('open');
  };

  // Wire up reactive listener so any update in centralized demo data re-renders UI instantly
  if (window.QUBITLAB_DEMO && typeof window.QUBITLAB_DEMO.subscribe === 'function') {
    window.QUBITLAB_DEMO.subscribe((student) => {
      // Re-render Student Dashboard if in student mode
      if (window._qubitlab_role === 'student') {
        renderStudentDashboard(student);
      }
      // Re-render Teacher Roster table if in teacher mode
      if (window._qubitlab_role === 'teacher') {
        renderStudentRosterTable();
      }
    });
  }



  // =========================================================================
  // 3D QUANTUM ANIMATION (THREE.JS LIVING QUANTUM SYSTEM)
  // =========================================================================
  let landingVisualScene = null;
  let landingVisualCamera = null;
  let landingVisualRenderer = null;
  let landingVisualAnimFrame = null;
  let landingVisualRunning = false;
  let quantumBlochGroup = null;
  let quantumQubitNodes = [];
  let quantumDustParticles = null;
  let photonPackets = [];
  let mouseTargetX = 0;
  let mouseTargetY = 0;

  function initLandingVisual() {
    const canvas = document.getElementById('landing-hero-canvas');
    const container = document.getElementById('landing-canvas-holder');
    if (!canvas || !container || !window.THREE) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera
    landingVisualScene = new THREE.Scene();
    landingVisualCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    landingVisualCamera.position.set(0, 0, 8.5);

    // 2. Renderer
    landingVisualRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    landingVisualRenderer.setSize(width, height);
    landingVisualRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 3. Central Bloch Sphere & Coordinate Frame
    quantumBlochGroup = new THREE.Group();
    landingVisualScene.add(quantumBlochGroup);

    // Sphere Wireframe
    const sphereGeo = new THREE.SphereGeometry(2.3, 24, 18);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xEC4899,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    quantumBlochGroup.add(sphereMesh);

    // Inner glowing equator & meridian rings
    const ringGeo1 = new THREE.RingGeometry(2.28, 2.32, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xF472B6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const equatorRing = new THREE.Mesh(ringGeo1, ringMat1);
    equatorRing.rotation.x = Math.PI / 2;
    quantumBlochGroup.add(equatorRing);

    const meridianRing = new THREE.Mesh(ringGeo1, ringMat1);
    meridianRing.rotation.y = Math.PI / 2;
    quantumBlochGroup.add(meridianRing);

    // Axis Lines (|0⟩ to |1⟩ and |+⟩ to |-⟩)
    const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -2.8, 0),
      new THREE.Vector3(0, 2.8, 0)
    ]);
    const zAxisMat = new THREE.LineBasicMaterial({ color: 0xF472B6, transparent: true, opacity: 0.7 });
    const zAxisLine = new THREE.Line(zAxisGeo, zAxisMat);
    quantumBlochGroup.add(zAxisLine);

    const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.8, 0, 0),
      new THREE.Vector3(2.8, 0, 0)
    ]);
    const xAxisMat = new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.5 });
    const xAxisLine = new THREE.Line(xAxisGeo, xAxisMat);
    quantumBlochGroup.add(xAxisLine);

    // Core pulsing energy nucleus
    const coreGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    quantumBlochGroup.add(coreMesh);

    // 4. Orbiting Qubit Nodes
    const nodeDefs = [
      { radius: 3.4, speed: 0.012, phase: 0, color: 0xEC4899, label: '|0⟩' },
      { radius: 3.8, speed: -0.009, phase: Math.PI / 2, color: 0x38BDF8, label: '|1⟩' },
      { radius: 4.2, speed: 0.007, phase: Math.PI, color: 0xF472B6, label: '|ψ⟩' },
      { radius: 4.6, speed: -0.014, phase: Math.PI * 1.5, color: 0xA855F7, label: '|Φ⁺⟩' }
    ];

    quantumQubitNodes = nodeDefs.map(def => {
      const nodeGroup = new THREE.Group();

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({ color: def.color })
      );
      nodeGroup.add(mesh);

      const aura = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.36, 24),
        new THREE.MeshBasicMaterial({
          color: def.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45
        })
      );
      nodeGroup.add(aura);

      landingVisualScene.add(nodeGroup);
      return { group: nodeGroup, aura, ...def };
    });

    // 5. Entanglement Pulse Packets traveling between nodes
    for (let i = 0; i < 6; i++) {
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xEC4899 : 0x38BDF8 })
      );
      landingVisualScene.add(pMesh);
      photonPackets.push({
        mesh: pMesh,
        sourceIdx: i % 4,
        targetIdx: (i + 1) % 4,
        progress: (i / 6)
      });
    }

    // 6. Floating Quantum Particle Dust Cloud
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xF472B6,
      size: 0.07,
      transparent: true,
      opacity: 0.55
    });
    quantumDustParticles = new THREE.Points(particleGeo, particleMat);
    landingVisualScene.add(quantumDustParticles);

    // 7. Mouse Parallax Interaction on Card
    const cardEl = document.getElementById('landing-visual-card');
    if (cardEl) {
      cardEl.addEventListener('mousemove', (e) => {
        const rect = cardEl.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseTargetX = normX * 0.4;
        mouseTargetY = normY * 0.3;
      });
      cardEl.addEventListener('mouseleave', () => {
        mouseTargetX = 0;
        mouseTargetY = 0;
      });
    }

    // 8. Responsive Resize Observer
    window.addEventListener('resize', onLandingVisualResize);
  }

  function onLandingVisualResize() {
    const container = document.getElementById('landing-canvas-holder');
    if (!container || !landingVisualRenderer || !landingVisualCamera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width > 0 && height > 0) {
      landingVisualCamera.aspect = width / height;
      landingVisualCamera.updateProjectionMatrix();
      landingVisualRenderer.setSize(width, height);
    }
  }

  function startLandingVisual() {
    if (landingVisualRunning) return;
    landingVisualRunning = true;
    onLandingVisualResize();
    animateLandingVisual();
  }

  function stopLandingVisual() {
    landingVisualRunning = false;
    if (landingVisualAnimFrame) {
      cancelAnimationFrame(landingVisualAnimFrame);
      landingVisualAnimFrame = null;
    }
  }

  let visualTime = 0;
  function animateLandingVisual() {
    if (!landingVisualRunning) return;
    landingVisualAnimFrame = requestAnimationFrame(animateLandingVisual);

    visualTime += 0.015;

    // 1. Rotate Bloch Sphere
    if (quantumBlochGroup) {
      quantumBlochGroup.rotation.y += 0.005;
      quantumBlochGroup.rotation.x = Math.sin(visualTime * 0.5) * 0.15 + mouseTargetY;
      quantumBlochGroup.rotation.z = Math.cos(visualTime * 0.4) * 0.1 + mouseTargetX;
    }

    // 2. Animate Orbiting Qubits
    const nodePositions = [];
    quantumQubitNodes.forEach((node, i) => {
      const angle = visualTime * node.speed * 40 + node.phase;
      const x = Math.cos(angle) * node.radius;
      const z = Math.sin(angle) * (node.radius * 0.8);
      const y = Math.sin(visualTime * 1.5 + i) * 1.2;

      node.group.position.set(x, y, z);
      node.aura.rotation.z += 0.02;
      nodePositions.push(new THREE.Vector3(x, y, z));
    });

    // 3. Animate Traveling Entangled Photons
    photonPackets.forEach(p => {
      p.progress += 0.008;
      if (p.progress >= 1) p.progress = 0;
      if (nodePositions[p.sourceIdx] && nodePositions[p.targetIdx]) {
        p.mesh.position.lerpVectors(nodePositions[p.sourceIdx], nodePositions[p.targetIdx], p.progress);
      }
    });

    // 4. Drift Particle Dust
    if (quantumDustParticles) {
      quantumDustParticles.rotation.y = visualTime * 0.03;
      quantumDustParticles.rotation.x = Math.sin(visualTime * 0.02) * 0.05;
    }

    // 5. Smooth Camera Movement
    if (landingVisualCamera) {
      landingVisualCamera.position.x += (mouseTargetX * 1.2 - landingVisualCamera.position.x) * 0.05;
      landingVisualCamera.position.y += (mouseTargetY * 1.0 - landingVisualCamera.position.y) * 0.05;
      landingVisualCamera.lookAt(0, 0, 0);
    }

    if (landingVisualRenderer && landingVisualScene && landingVisualCamera) {
      landingVisualRenderer.render(landingVisualScene, landingVisualCamera);
    }
  }

  // =========================================================================
  // EVENT LISTENERS INITIALIZATION
  // =========================================================================

  // Wire up teacher nav tabs
  document.querySelectorAll('#teacher-nav .nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTeacherView(btn.dataset.teacherView);
    });
  });

  // Wire up Landing Page Buttons
  const landingStartBtn = document.getElementById('landing-start-btn');
  if (landingStartBtn) {
    landingStartBtn.addEventListener('click', () => showAuthPage('login'));
  }

  const landingDirectLoginBtn = document.getElementById('landing-direct-login-btn');
  if (landingDirectLoginBtn) {
    landingDirectLoginBtn.addEventListener('click', () => showAuthPage('login'));
  }

  const landingNavAuthBtn = document.getElementById('landing-nav-auth-btn');
  if (landingNavAuthBtn) {
    landingNavAuthBtn.addEventListener('click', () => showAuthPage('login'));
  }

  // Wire up Auth Page Tab Buttons & Links
  const authTabLoginBtn = document.getElementById('auth-tab-login-btn');
  if (authTabLoginBtn) {
    authTabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
  }

  const authTabSignupBtn = document.getElementById('auth-tab-signup-btn');
  if (authTabSignupBtn) {
    authTabSignupBtn.addEventListener('click', () => switchAuthTab('signup'));
  }

  const authSwitchToSignup = document.getElementById('auth-switch-to-signup');
  if (authSwitchToSignup) {
    authSwitchToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('signup');
    });
  }

  const authSwitchToLogin = document.getElementById('auth-switch-to-login');
  if (authSwitchToLogin) {
    authSwitchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('login');
    });
  }

  const authBackToLandingBtn = document.getElementById('auth-back-to-landing-btn');
  if (authBackToLandingBtn) {
    authBackToLandingBtn.addEventListener('click', () => showLandingPage());
  }

  const roleBackToAuthBtn = document.getElementById('role-back-to-auth-btn');
  if (roleBackToAuthBtn) {
    roleBackToAuthBtn.addEventListener('click', () => showAuthPage('login'));
  }

  // Handle Login Form Submit (Frontend Mock Auth)
  const loginForm = document.getElementById('auth-screen-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('auth-login-email');
      const emailVal = emailInput ? emailInput.value.trim() : 'learner';
      const alertBox = document.getElementById('auth-page-alert');

      if (alertBox) {
        alertBox.className = 'auth-msg-alert success';
        alertBox.textContent = `✓ Welcome back, ${emailVal}! Launching profile selection...`;
        alertBox.style.display = 'block';
      }

      showToast(`Logged in successfully as ${emailVal}!`, 'success');
      setTimeout(() => {
        showRoleOverlay();
      }, 500);
    });
  }

  // Handle Sign Up Form Submit (Frontend Mock Auth)
  const signupForm = document.getElementById('auth-screen-signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('auth-signup-name');
      const pwdInput = document.getElementById('auth-signup-pwd');
      const confirmPwdInput = document.getElementById('auth-signup-confirm-pwd');
      const alertBox = document.getElementById('auth-page-alert');

      if (pwdInput && confirmPwdInput && pwdInput.value !== confirmPwdInput.value) {
        if (alertBox) {
          alertBox.className = 'auth-msg-alert';
          alertBox.textContent = '✗ Passwords do not match. Please verify and try again.';
          alertBox.style.display = 'block';
        }
        return;
      }

      const nameVal = nameInput ? nameInput.value.trim() : 'Learner';
      if (alertBox) {
        alertBox.className = 'auth-msg-alert success';
        alertBox.textContent = `✓ Account created! Welcome to LeQC, ${nameVal}!`;
        alertBox.style.display = 'block';
      }

      showToast(`Account created for ${nameVal}!`, 'success');
      setTimeout(() => {
        showRoleOverlay();
      }, 600);
    });
  }

  // Wire up role selection buttons
  const enterStudentBtn = document.getElementById('enter-student-btn');
  if (enterStudentBtn) enterStudentBtn.addEventListener('click', enterStudentRole);

  const enterTeacherBtn = document.getElementById('enter-teacher-btn');
  if (enterTeacherBtn) enterTeacherBtn.addEventListener('click', enterTeacherRole);

  // Wire up switch role button in navbar
  if (switchRoleBtn) {
    switchRoleBtn.addEventListener('click', () => {
      showRoleOverlay();
    });
  }

  // Close student detail modal
  const closeDetailBtn = document.getElementById('close-student-detail-btn');
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
      const overlay = document.getElementById('student-detail-modal-overlay');
      if (overlay) overlay.classList.remove('open');
    });
  }

  // Close on overlay backdrop click
  const studentDetailOverlay = document.getElementById('student-detail-modal-overlay');
  if (studentDetailOverlay) {
    studentDetailOverlay.addEventListener('click', (e) => {
      if (e.target === studentDetailOverlay) studentDetailOverlay.classList.remove('open');
    });
  }

  // =========================================================================
  // THEME CONTROLLER (LIGHT / DARK MODE)
  // =========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('leqc_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      });
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('leqc_theme', theme);
    // Redraw SVG paths to ensure perfect rendering across theme switches
    setTimeout(() => {
      if (typeof updateJourneySvgPaths === 'function') {
        updateJourneySvgPaths();
      }
    }, 50);
  }

  // Initialize Landing Page flow on entry
  const _originalInit = init;
  async function initWithLandingFlow() {
    // 1. Initialize theme
    initTheme();
    // 2. Initialize Three.js Quantum Visual on Landing Page
    initLandingVisual();
    // 3. Run silent background init for core platform
    await _originalInit();
    // 4. Present Landing Page first
    showLandingPage();
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithLandingFlow);
  } else {
    initWithLandingFlow();
  }

})();


