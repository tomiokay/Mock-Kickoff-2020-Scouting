// Scouting App State
const scoutingData = {
    teamNumber: '',
    matchNumber: '',
    allianceColor: '',
    startingPosition: '',
    scoutName: '',
    startTime: null,
    actions: [],
    counts: {},
    scores: {
        auto: 0,
        teleop: 0,
        endgame: 0,
        total: 0
    },
    notes: '',
    preloadBalls: 0
};

// Ball tracking
let currentBallCount = 0;
const MAX_BALL_CAPACITY = 5;

function updateBallCountDisplay() {
    const ballCountDisplay = document.getElementById('ballCount');
    if (ballCountDisplay) {
        ballCountDisplay.textContent = currentBallCount;
    }
}

// Match timing constants (in seconds)
const MATCH_DURATION = 150; // 2:30
const AUTO_DURATION = 15;
const TELEOP_START = 15;
const ENDGAME_START = 120; // Last 30 seconds

// Timer variables
let matchTimer = null;
let elapsedTime = 0;
let isPaused = false;
let currentPeriod = 'PRE-MATCH';

// Defense mode variables
let isDefenseMode = false;
let defenseStartTime = 0;
let totalDefenseTime = 0;
let defenseTimer = null;

// Point values
const POINTS = {
    initLine: 5,
    autoBottomPort: 2,
    autoOuterPort: 4,
    autoInnerPort: 6,
    teleopBottomPort: 1,
    teleopOuterPort: 2,
    teleopInnerPort: 3,
    rotationControl: 10,
    positionControl: 20,
    park: 5,
    hang: 25,
    level: 15
};

// DOM Elements
const matchSetup = document.getElementById('matchSetup');
const scoutingInterface = document.getElementById('scoutingInterface');
const teamNumberInput = document.getElementById('teamNumber');
const matchNumberInput = document.getElementById('matchNumber');
const scoutNameInput = document.getElementById('scoutName');
const allianceButtons = document.querySelectorAll('.alliance-btn');
const positionButtons = document.querySelectorAll('.position-btn');
const startMatchBtn = document.getElementById('startMatch');
const timerDisplay = document.getElementById('timer');
const periodDisplay = document.getElementById('period');
const autoSection = document.getElementById('autoSection');
const teleopSection = document.getElementById('teleopSection');
const endgameSection = document.getElementById('endgameSection');
const timeline = document.getElementById('timeline');
const matchNotesTextarea = document.getElementById('matchNotes');

// Score displays
const autoScoreDisplay = document.getElementById('autoScore');
const teleopScoreDisplay = document.getElementById('teleopScore');
const endgameScoreDisplay = document.getElementById('endgameScore');
const totalScoreDisplay = document.getElementById('totalScore');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeCounts();
});

function initializeCounts() {
    scoutingData.counts = {
        initLine: 0,
        autoBottomPort: 0,
        autoOuterPort: 0,
        autoInnerPort: 0,
        pickupBall: 0,
        missBall: 0,
        teleopBottomPort: 0,
        teleopOuterPort: 0,
        teleopInnerPort: 0,
        rotationControl: 0,
        positionControl: 0,
        park: 0,
        hang: 0,
        level: 0,
        effectiveDefense: 0,
        defensiveFoul: 0,
        pinned: 0,
        penalty: 0,
        disabled: 0
    };
}

function setupEventListeners() {
    // Alliance selection
    allianceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            allianceButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            scoutingData.allianceColor = btn.dataset.color;
        });
    });

    // Starting position selection
    positionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            positionButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            scoutingData.startingPosition = btn.dataset.position;
        });
    });

    // Start match
    startMatchBtn.addEventListener('click', startMatch);

    // Action buttons
    const actionButtons = document.querySelectorAll('.sidebar-action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            recordAction(action);
        });
    });

    // Control buttons
    document.getElementById('pauseMatch').addEventListener('click', togglePause);
    document.getElementById('endMatch').addEventListener('click', endMatch);
    document.getElementById('exportJSON').addEventListener('click', exportJSON);
    document.getElementById('exportCSV').addEventListener('click', exportCSV);
    document.getElementById('resetMatch').addEventListener('click', resetMatch);

    // Defense mode buttons
    document.getElementById('defenseMode').addEventListener('click', enterDefenseMode);
    document.getElementById('exitDefense').addEventListener('click', exitDefenseMode);

    // Notes
    matchNotesTextarea.addEventListener('input', (e) => {
        scoutingData.notes = e.target.value;
    });
}

function startMatch() {
    // Validate inputs
    if (!teamNumberInput.value) {
        alert('Please enter a team number');
        return;
    }
    if (!matchNumberInput.value) {
        alert('Please enter a match number');
        return;
    }
    if (!scoutingData.allianceColor) {
        alert('Please select an alliance color');
        return;
    }
    if (!scoutingData.startingPosition) {
        alert('Please select a starting position');
        return;
    }

    // Store match info
    scoutingData.teamNumber = teamNumberInput.value;
    scoutingData.matchNumber = matchNumberInput.value;
    scoutingData.scoutName = scoutNameInput.value || 'Anonymous';
    scoutingData.startTime = new Date();

    // Get preload balls
    const preloadInput = document.getElementById('preloadBalls');
    scoutingData.preloadBalls = parseInt(preloadInput.value) || 0;
    currentBallCount = scoutingData.preloadBalls;
    updateBallCountDisplay();

    // Switch to scouting interface
    matchSetup.style.display = 'none';
    scoutingInterface.style.display = 'block';

    // Start timer
    startTimer();
}

function startTimer() {
    matchTimer = setInterval(() => {
        if (!isPaused) {
            elapsedTime++;
            updateTimerDisplay();
            updatePeriod();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updatePeriod() {
    const periodIndicator = document.querySelector('.period-indicator');

    if (elapsedTime < AUTO_DURATION) {
        if (currentPeriod !== 'AUTONOMOUS') {
            currentPeriod = 'AUTONOMOUS';
            periodDisplay.textContent = 'AUTONOMOUS';
            periodIndicator.className = 'period-indicator auto';
            autoSection.style.display = 'block';
            teleopSection.style.display = 'none';
            endgameSection.style.display = 'none';
        }
    } else if (elapsedTime < ENDGAME_START) {
        if (currentPeriod !== 'TELEOP') {
            currentPeriod = 'TELEOP';
            periodDisplay.textContent = 'TELEOP';
            periodIndicator.className = 'period-indicator teleop';
            autoSection.style.display = 'none';
            teleopSection.style.display = 'block';
            endgameSection.style.display = 'none';
        }
    } else if (elapsedTime < MATCH_DURATION) {
        if (currentPeriod !== 'ENDGAME') {
            currentPeriod = 'ENDGAME';
            periodDisplay.textContent = 'ENDGAME';
            periodIndicator.className = 'period-indicator endgame';
            autoSection.style.display = 'none';
            teleopSection.style.display = 'block';
            endgameSection.style.display = 'block';
        }
    } else {
        endMatch();
    }
}

function recordAction(action) {
    // Define actions that require balls
    const shootingActions = ['autoBottomPort', 'autoOuterPort', 'autoInnerPort',
                            'teleopBottomPort', 'teleopOuterPort', 'teleopInnerPort'];

    // Check if trying to shoot without balls
    if (shootingActions.includes(action) && currentBallCount === 0) {
        alert('⚠️ No balls available! Pick up a ball first.');
        return;
    }

    // Check if trying to miss without balls
    if (action === 'missBall' && currentBallCount === 0) {
        alert('⚠️ No balls available! Pick up a ball first.');
        return;
    }

    // Handle ball count changes
    if (action === 'pickupBall') {
        if (currentBallCount < MAX_BALL_CAPACITY) {
            currentBallCount++;
            updateBallCountDisplay();
        } else {
            alert('⚠️ Robot is at maximum ball capacity (5 balls)!');
            return;
        }
    } else if (shootingActions.includes(action)) {
        currentBallCount--;
        updateBallCountDisplay();
    } else if (action === 'missBall') {
        currentBallCount--;
        updateBallCountDisplay();
    }

    // Define toggle actions (can only be done once)
    const toggleActions = ['initLine', 'hang', 'park', 'level', 'rotationControl', 'positionControl'];
    const isToggle = toggleActions.includes(action);

    const btn = document.querySelector(`[data-action="${action}"]`);
    const countDisplay = document.getElementById(`count-${action}`);

    if (isToggle) {
        // Toggle behavior
        if (scoutingData.counts[action] === 0) {
            // Activate
            scoutingData.counts[action] = 1;

            // Record action with timestamp
            const actionData = {
                action: action,
                time: elapsedTime,
                period: currentPeriod,
                timestamp: new Date(),
                toggled: true
            };
            scoutingData.actions.push(actionData);

            // Add to timeline
            addToTimeline(actionData);

            // Update scores (add points)
            updateScores(action, 1);

            // Visual feedback - mark as active
            if (btn) {
                btn.classList.add('active-toggle');
            }
            if (countDisplay) {
                countDisplay.textContent = '✓';
            }
        } else {
            // Deactivate
            scoutingData.counts[action] = 0;

            // Remove from timeline
            removeLastActionFromTimeline(action);

            // Remove from actions array
            for (let i = scoutingData.actions.length - 1; i >= 0; i--) {
                if (scoutingData.actions[i].action === action) {
                    scoutingData.actions.splice(i, 1);
                    break;
                }
            }

            // Update scores (subtract points)
            updateScores(action, -1);

            // Visual feedback - mark as inactive
            if (btn) {
                btn.classList.remove('active-toggle');
            }
            if (countDisplay) {
                countDisplay.textContent = '0';
            }
        }

        // Button press animation
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    } else {
        // Normal increment behavior
        scoutingData.counts[action]++;

        // Update count display
        if (countDisplay) {
            countDisplay.textContent = scoutingData.counts[action];
        }

        // Record action with timestamp
        const actionData = {
            action: action,
            time: elapsedTime,
            period: currentPeriod,
            timestamp: new Date()
        };
        scoutingData.actions.push(actionData);

        // Add to timeline
        addToTimeline(actionData);

        // Update scores
        updateScores(action, 1);

        // Visual feedback
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    }
}

function addToTimeline(actionData) {
    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item ${getPeriodClass(actionData.period)}`;
    timelineItem.dataset.action = actionData.action; // For removal if needed

    const minutes = Math.floor(actionData.time / 60);
    const seconds = actionData.time % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const actionName = formatActionName(actionData.action);
    const points = POINTS[actionData.action] || 0;

    timelineItem.innerHTML = `
        <span class="timeline-time">${timeStr}</span>
        <span class="timeline-action">${actionName}</span>
        ${points > 0 ? `<span class="timeline-points">+${points}</span>` : ''}
    `;

    timeline.insertBefore(timelineItem, timeline.firstChild);
}

function removeLastActionFromTimeline(action) {
    // Find and remove the most recent timeline item for this action
    const items = timeline.querySelectorAll(`.timeline-item[data-action="${action}"]`);
    if (items.length > 0) {
        items[0].remove(); // Remove the first (most recent) item
    }
}

function getPeriodClass(period) {
    switch(period) {
        case 'AUTONOMOUS': return 'auto';
        case 'TELEOP': return 'teleop';
        case 'ENDGAME': return 'endgame';
        default: return 'other';
    }
}

function formatActionName(action) {
    const names = {
        initLine: 'Crossed Initiation Line',
        autoBottomPort: 'Auto - Bottom Port',
        autoOuterPort: 'Auto - Outer Port',
        autoInnerPort: 'Auto - Inner Port',
        pickupBall: 'Station Picked Up Ball',
        teleopBottomPort: 'Teleop - Bottom Port',
        teleopOuterPort: 'Teleop - Outer Port',
        teleopInnerPort: 'Teleop - Inner Port',
        rotationControl: 'Rotation Control',
        positionControl: 'Position Control',
        park: 'Parked',
        hang: 'Hanging',
        level: 'Level Switch',
        defenseStart: 'Defense Start',
        defenseEnd: 'Defense End',
        effectiveDefense: 'Effective Defense',
        defensiveFoul: 'Defensive Foul',
        pinned: 'Pinned Opponent',
        penalty: 'Penalty/Foul',
        disabled: 'Robot Disabled'
    };
    return names[action] || action;
}

function updateScores(action, multiplier = 1) {
    const points = (POINTS[action] || 0) * multiplier;

    // Determine which score to update based on current period
    if (currentPeriod === 'AUTONOMOUS') {
        scoutingData.scores.auto += points;
        autoScoreDisplay.textContent = scoutingData.scores.auto;
    } else if (currentPeriod === 'ENDGAME') {
        // Endgame scoring actions
        if (['park', 'hang', 'level'].includes(action)) {
            scoutingData.scores.endgame += points;
            endgameScoreDisplay.textContent = scoutingData.scores.endgame;
        } else {
            // Still scoring power cells in endgame counts as teleop
            scoutingData.scores.teleop += points;
            teleopScoreDisplay.textContent = scoutingData.scores.teleop;
        }
    } else {
        scoutingData.scores.teleop += points;
        teleopScoreDisplay.textContent = scoutingData.scores.teleop;
    }

    // Update total
    scoutingData.scores.total =
        scoutingData.scores.auto +
        scoutingData.scores.teleop +
        scoutingData.scores.endgame;
    totalScoreDisplay.textContent = scoutingData.scores.total;
}

function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseMatch');
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function endMatch() {
    if (matchTimer) {
        clearInterval(matchTimer);
        matchTimer = null;
    }

    periodDisplay.textContent = 'MATCH ENDED';
    document.querySelector('.period-indicator').className = 'period-indicator';

    const endMatchBtn = document.getElementById('endMatch');
    endMatchBtn.disabled = true;
    endMatchBtn.style.opacity = '0.5';

    const pauseBtn = document.getElementById('pauseMatch');
    pauseBtn.disabled = true;
    pauseBtn.style.opacity = '0.5';
}

function exportJSON() {
    const maxShootDistance = typeof getMaxShootingDistance === 'function' ? getMaxShootingDistance() : 0;
    const avgShootDistance = typeof getAverageShootingDistance === 'function' ? getAverageShootingDistance() : 0;

    const dataToExport = {
        matchInfo: {
            teamNumber: scoutingData.teamNumber,
            matchNumber: scoutingData.matchNumber,
            allianceColor: scoutingData.allianceColor,
            startingPosition: scoutingData.startingPosition,
            scoutName: scoutingData.scoutName,
            startTime: scoutingData.startTime,
            matchDuration: elapsedTime,
            totalDefenseTime: totalDefenseTime,
            maxShootingDistance: maxShootDistance,
            avgShootingDistance: avgShootDistance
        },
        scores: scoutingData.scores,
        actions: scoutingData.actions,
        counts: scoutingData.counts,
        fieldMarkers: typeof getFieldMarkersData === 'function' ? getFieldMarkersData() : [],
        notes: scoutingData.notes
    };

    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${scoutingData.matchNumber}-team-${scoutingData.teamNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportCSV() {
    // Create CSV header
    let csv = 'Match Number,Team Number,Alliance Color,Starting Position,Scout Name,';
    csv += 'Auto Score,Teleop Score,Endgame Score,Total Score,Total Defense Time (s),';

    // Add count headers
    for (const action in scoutingData.counts) {
        csv += `${formatActionName(action)},`;
    }
    csv += 'Notes\n';

    // Add data row
    csv += `${scoutingData.matchNumber},${scoutingData.teamNumber},${scoutingData.allianceColor},${scoutingData.startingPosition},${scoutingData.scoutName},`;
    csv += `${scoutingData.scores.auto},${scoutingData.scores.teleop},${scoutingData.scores.endgame},${scoutingData.scores.total},${totalDefenseTime},`;

    // Add counts
    for (const action in scoutingData.counts) {
        csv += `${scoutingData.counts[action]},`;
    }
    csv += `"${scoutingData.notes.replace(/"/g, '""')}"\n`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${scoutingData.matchNumber}-team-${scoutingData.teamNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function resetMatch() {
    if (matchTimer) {
        clearInterval(matchTimer);
        matchTimer = null;
    }

    // Exit defense mode if active
    if (isDefenseMode) {
        exitDefenseMode();
    }

    // Reset defense mode variables
    isDefenseMode = false;
    defenseStartTime = 0;
    totalDefenseTime = 0;
    if (defenseTimer) {
        clearInterval(defenseTimer);
        defenseTimer = null;
    }

    // Reset all data
    scoutingData.actions = [];
    initializeCounts();
    scoutingData.scores = {
        auto: 0,
        teleop: 0,
        endgame: 0,
        total: 0
    };
    scoutingData.notes = '';
    elapsedTime = 0;
    isPaused = false;
    currentPeriod = 'PRE-MATCH';
    currentBallCount = 0;
    updateBallCountDisplay();

    // Reset displays
    timerDisplay.textContent = '0:00';
    periodDisplay.textContent = 'PRE-MATCH';
    document.querySelector('.period-indicator').className = 'period-indicator';
    autoScoreDisplay.textContent = '0';
    teleopScoreDisplay.textContent = '0';
    endgameScoreDisplay.textContent = '0';
    totalScoreDisplay.textContent = '0';
    timeline.innerHTML = '';
    matchNotesTextarea.value = '';

    // Reset all count displays
    document.querySelectorAll('.btn-count').forEach(el => {
        el.textContent = '0';
    });

    // Remove active toggle states
    document.querySelectorAll('.sidebar-action-btn').forEach(btn => {
        btn.classList.remove('active-toggle');
        btn.classList.remove('active-defense');
    });

    // Reset defense mode button
    const defenseModeBtn = document.getElementById('defenseMode');
    if (defenseModeBtn) {
        defenseModeBtn.classList.remove('active-defense');
        defenseModeBtn.querySelector('.btn-label').textContent = '🛡️ Start Defense';
    }

    // Hide defense section
    document.getElementById('defenseSection').style.display = 'none';
    document.getElementById('defenseTimeValue').textContent = '0s';

    // Clear field markers
    if (typeof clearFieldMarkers === 'function') {
        clearFieldMarkers();
    }

    // Reset buttons
    document.getElementById('endMatch').disabled = false;
    document.getElementById('endMatch').style.opacity = '1';
    document.getElementById('pauseMatch').disabled = false;
    document.getElementById('pauseMatch').style.opacity = '1';
    document.getElementById('pauseMatch').textContent = 'Pause';

    // Return to setup
    scoutingInterface.style.display = 'none';
    matchSetup.style.display = 'block';

    // Clear inputs
    teamNumberInput.value = '';
    matchNumberInput.value = '';
    scoutNameInput.value = '';
    allianceButtons.forEach(btn => btn.classList.remove('selected'));
    positionButtons.forEach(btn => btn.classList.remove('selected'));
    scoutingData.allianceColor = '';
    scoutingData.startingPosition = '';
}

// Keyboard shortcuts for quick actions (optional enhancement)
document.addEventListener('keydown', (e) => {
    // Only if scouting interface is visible
    if (scoutingInterface.style.display === 'none') return;

    // Don't trigger shortcuts if user is typing in notes or other text fields
    const activeElement = document.activeElement;
    const isTyping = activeElement.tagName === 'TEXTAREA' ||
                     activeElement.tagName === 'INPUT' ||
                     activeElement.isContentEditable;

    if (isTyping) return;

    // Number keys for quick scoring during appropriate periods
    if (currentPeriod === 'AUTONOMOUS') {
        switch(e.key) {
            case '1': recordAction('autoBottomPort'); break;
            case '2': recordAction('autoOuterPort'); break;
            case '3': recordAction('autoInnerPort'); break;
            case 'i': recordAction('initLine'); break;
        }
    } else if (currentPeriod === 'TELEOP' || currentPeriod === 'ENDGAME') {
        switch(e.key) {
            case '1': recordAction('teleopBottomPort'); break;
            case '2': recordAction('teleopOuterPort'); break;
            case '3': recordAction('teleopInnerPort'); break;
            case 'p': recordAction('pickupBall'); break;
            case 'r': recordAction('rotationControl'); break;
            case 'c': recordAction('positionControl'); break;
        }
    }

    // Endgame specific
    if (currentPeriod === 'ENDGAME') {
        switch(e.key) {
            case 'h': recordAction('hang'); break;
            case 'k': recordAction('park'); break;
            case 'l': recordAction('level'); break;
        }
    }

    // Always available
    switch(e.key) {
        case 'f': recordAction('penalty'); break;
        case 'x': recordAction('disabled'); break;
        case ' ': e.preventDefault(); togglePause(); break;
    }
});

// ===============================================
// DEFENSE MODE FUNCTIONALITY
// ===============================================

function enterDefenseMode() {
    if (isDefenseMode) return; // Already in defense mode

    isDefenseMode = true;
    defenseStartTime = elapsedTime;

    // Hide other sections and show defense section
    document.getElementById('autoSection').style.display = 'none';
    document.getElementById('teleopSection').style.display = 'none';
    document.getElementById('endgameSection').style.display = 'none';
    document.getElementById('otherSection').style.display = 'none';
    document.getElementById('defenseSection').style.display = 'block';

    // Update defense mode button
    const defenseModeBtn = document.getElementById('defenseMode');
    defenseModeBtn.classList.add('active-defense');
    defenseModeBtn.querySelector('.btn-label').textContent = '🛡️ Defending...';

    // Start defense timer
    startDefenseTimer();

    // Record defense start action
    const actionData = {
        action: 'defenseStart',
        time: elapsedTime,
        period: currentPeriod,
        timestamp: new Date()
    };
    scoutingData.actions.push(actionData);
    addToTimeline(actionData);
}

function exitDefenseMode() {
    if (!isDefenseMode) return; // Not in defense mode

    isDefenseMode = false;

    // Calculate defense duration
    const defenseDuration = elapsedTime - defenseStartTime;
    totalDefenseTime += defenseDuration;

    // Stop defense timer
    stopDefenseTimer();

    // Show appropriate period section
    updatePeriodSections();
    document.getElementById('otherSection').style.display = 'block';

    // Update defense mode button
    const defenseModeBtn = document.getElementById('defenseMode');
    defenseModeBtn.classList.remove('active-defense');
    defenseModeBtn.querySelector('.btn-label').textContent = '🛡️ Start Defense';

    // Record defense end action with duration
    const actionData = {
        action: 'defenseEnd',
        time: elapsedTime,
        period: currentPeriod,
        timestamp: new Date(),
        duration: defenseDuration
    };
    scoutingData.actions.push(actionData);

    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item ${getPeriodClass(currentPeriod)}`;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    timelineItem.innerHTML = `
        <span class="timeline-time">${timeStr}</span>
        <span class="timeline-action">Defense End (${defenseDuration}s)</span>
    `;
    timeline.insertBefore(timelineItem, timeline.firstChild);
}

function startDefenseTimer() {
    const defenseTimeDisplay = document.getElementById('defenseTimeValue');
    let currentDefenseTime = 0;

    defenseTimer = setInterval(() => {
        if (!isPaused) {
            currentDefenseTime = elapsedTime - defenseStartTime;
            defenseTimeDisplay.textContent = `${currentDefenseTime}s`;
        }
    }, 1000);
}

function stopDefenseTimer() {
    if (defenseTimer) {
        clearInterval(defenseTimer);
        defenseTimer = null;
    }
    document.getElementById('defenseTimeValue').textContent = '0s';
}

function updatePeriodSections() {
    // Show the correct period section based on current period
    if (currentPeriod === 'AUTONOMOUS') {
        document.getElementById('autoSection').style.display = 'block';
        document.getElementById('teleopSection').style.display = 'none';
        document.getElementById('endgameSection').style.display = 'none';
    } else if (currentPeriod === 'TELEOP') {
        document.getElementById('autoSection').style.display = 'none';
        document.getElementById('teleopSection').style.display = 'block';
        document.getElementById('endgameSection').style.display = 'none';
    } else if (currentPeriod === 'ENDGAME') {
        document.getElementById('autoSection').style.display = 'none';
        document.getElementById('teleopSection').style.display = 'block';
        document.getElementById('endgameSection').style.display = 'block';
    }
}
