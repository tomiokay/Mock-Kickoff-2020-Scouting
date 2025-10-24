// ===============================================
// DATABASE AND DASHBOARD FUNCTIONALITY
// ===============================================

// Initialize Supabase Client
let supabase = null;
let allMatchData = [];

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
    setupNavigationTabs();
    setupDashboardEventListeners();
});

function initializeSupabase() {
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
        console.warn('Supabase not configured. Please set up config.js');
        return;
    }

    if (SUPABASE_URL.includes('YOUR_SUPABASE_URL_HERE') || SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY_HERE')) {
        console.warn('Supabase credentials not set. Please follow SUPABASE_SETUP.md');
        return;
    }

    try {
        if (!window.supabase) {
            console.warn('Supabase library not loaded');
            return;
        }
        const { createClient } = window.supabase;
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully!');
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

// ===============================================
// NAVIGATION
// ===============================================

function setupNavigationTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const scoutView = document.getElementById('scoutView');
    const dashboardView = document.getElementById('dashboardView');
    const timerDisplay = document.getElementById('timerDisplay');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.dataset.view;

            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Switch views
            if (view === 'scout') {
                scoutView.classList.add('active-view');
                dashboardView.classList.remove('active-view');
                timerDisplay.style.display = 'flex';
            } else if (view === 'dashboard') {
                scoutView.classList.remove('active-view');
                dashboardView.classList.add('active-view');
                timerDisplay.style.display = 'none';
                loadDashboardData();
            }
        });
    });
}

// ===============================================
// SAVE TO DATABASE
// ===============================================

async function saveToDatabase() {
    if (!supabase) {
        showPopup('Database not configured. Please set up Supabase in config.js', 'error');
        return;
    }

    // Validate that match has data
    if (!scoutingData.teamNumber || !scoutingData.matchNumber) {
        showPopup('Please complete match setup before saving', 'warning');
        return;
    }

    try {
        const maxShootDistance = typeof getMaxShootingDistance === 'function' ? getMaxShootingDistance() : 0;
        const avgShootDistance = typeof getAverageShootingDistance === 'function' ? getAverageShootingDistance() : 0;

        const dataToSave = {
            team_number: parseInt(scoutingData.teamNumber),
            match_number: parseInt(scoutingData.matchNumber),
            alliance_color: scoutingData.allianceColor,
            starting_position: scoutingData.startingPosition,
            scout_name: scoutingData.scoutName || 'Anonymous',
            auto_score: scoutingData.scores.auto,
            teleop_score: scoutingData.scores.teleop,
            endgame_score: scoutingData.scores.endgame,
            total_score: scoutingData.scores.total,
            crossed_init_line: scoutingData.counts.initLine > 0,
            auto_bottom_port: scoutingData.counts.autoBottomPort,
            auto_outer_port: scoutingData.counts.autoOuterPort,
            auto_inner_port: scoutingData.counts.autoInnerPort,
            pickup_ball: scoutingData.counts.pickupBall,
            teleop_bottom_port: scoutingData.counts.teleopBottomPort,
            teleop_outer_port: scoutingData.counts.teleopOuterPort,
            teleop_inner_port: scoutingData.counts.teleopInnerPort,
            rotation_control: scoutingData.counts.rotationControl,
            position_control: scoutingData.counts.positionControl,
            park: scoutingData.counts.park > 0,
            hang: scoutingData.counts.hang > 0,
            level: scoutingData.counts.level > 0,
            effective_defense: scoutingData.counts.effectiveDefense || 0,
            defensive_foul: scoutingData.counts.defensiveFoul || 0,
            pinned: scoutingData.counts.pinned || 0,
            penalty: scoutingData.counts.penalty,
            disabled: scoutingData.counts.disabled,
            total_defense_time: totalDefenseTime || 0,
            max_shooting_distance: maxShootDistance,
            avg_shooting_distance: avgShootDistance,
            notes: scoutingData.notes,
            match_duration: elapsedTime,
            field_markers_json: typeof getFieldMarkersData === 'function' ? JSON.stringify(getFieldMarkersData()) : null
        };

        const { data, error } = await supabase
            .from('match_data')
            .insert([dataToSave])
            .select();

        if (error) throw error;

        showPopup('Match data saved to database successfully!', 'success');
        console.log('Saved data:', data);

    } catch (error) {
        console.error('Error saving to database:', error);
        showPopup('Error saving to database: ' + error.message, 'error');
    }
}

// ===============================================
// LOAD DASHBOARD DATA
// ===============================================

async function loadDashboardData(filters = {}) {
    if (!supabase) {
        console.warn('Supabase not configured');
        return;
    }

    try {
        let query = supabase
            .from('match_data')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.team) {
            query = query.eq('team_number', parseInt(filters.team));
        }
        if (filters.match) {
            query = query.eq('match_number', parseInt(filters.match));
        }
        if (filters.alliance) {
            query = query.eq('alliance_color', filters.alliance);
        }

        const { data, error } = await query;

        if (error) throw error;

        allMatchData = data || [];
        displayDashboardData(allMatchData);
        updateStatistics(allMatchData);

    } catch (error) {
        console.error('Error loading data:', error);
        showPopup('Error loading data: ' + error.message, 'error');
    }
}

// ===============================================
// DISPLAY DATA IN TABLE
// ===============================================

function displayDashboardData(data) {
    const tableBody = document.getElementById('dataTableBody');
    const dataCount = document.getElementById('dataCount');

    dataCount.textContent = data.length;

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px;">
                    No data found. ${allMatchData.length > 0 ? 'Try clearing filters.' : 'Start scouting to see data here!'}
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(match => {
        const date = new Date(match.created_at).toLocaleDateString();
        const allianceClass = match.alliance_color === 'red' ? 'alliance-red' : 'alliance-blue';

        return `
            <tr data-match-id="${match.id}">
                <td>${match.match_number}</td>
                <td><strong>${match.team_number}</strong></td>
                <td class="${allianceClass}">${match.alliance_color.toUpperCase()}</td>
                <td>${match.starting_position}</td>
                <td>${match.auto_score}</td>
                <td>${match.teleop_score}</td>
                <td>${match.endgame_score}</td>
                <td><strong>${match.total_score}</strong></td>
                <td>${match.scout_name}</td>
                <td>${date}</td>
                <td class="row-actions">
                    <button class="action-icon-btn view-btn" onclick="viewMatchDetails(${match.id})">👁️ View</button>
                    <button class="action-icon-btn delete-btn" onclick="deleteMatch(${match.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    // Add click event to rows
    const rows = tableBody.querySelectorAll('tr[data-match-id]');
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                const matchId = parseInt(row.dataset.matchId);
                viewMatchDetails(matchId);
            }
        });
    });
}

// ===============================================
// STATISTICS
// ===============================================

function updateStatistics(data) {
    const totalMatches = data.length;
    const uniqueTeams = new Set(data.map(m => m.team_number)).size;

    // Basic averages
    const avgAuto = totalMatches > 0
        ? Math.round(data.reduce((sum, m) => sum + (m.auto_score || 0), 0) / totalMatches)
        : 0;

    const avgTeleop = totalMatches > 0
        ? Math.round(data.reduce((sum, m) => sum + (m.teleop_score || 0), 0) / totalMatches)
        : 0;

    const avgEndgame = totalMatches > 0
        ? Math.round(data.reduce((sum, m) => sum + (m.endgame_score || 0), 0) / totalMatches)
        : 0;

    const avgTotal = totalMatches > 0
        ? Math.round(data.reduce((sum, m) => sum + (m.total_score || 0), 0) / totalMatches)
        : 0;

    // Accuracy calculations
    // Robots typically start with 3 pre-loaded balls for auto
    const STARTING_BALLS = 3;

    const autoShots = data.reduce((sum, m) => sum + (m.auto_bottom_port || 0) + (m.auto_outer_port || 0) + (m.auto_inner_port || 0), 0);
    const autoAttempts = totalMatches * STARTING_BALLS; // Each match starts with 3 balls
    const autoAccuracy = autoAttempts > 0 ? Math.round((autoShots / autoAttempts) * 100) : 0;

    const teleopShots = data.reduce((sum, m) => sum + (m.teleop_bottom_port || 0) + (m.teleop_outer_port || 0) + (m.teleop_inner_port || 0), 0);
    const teleopBallsPickedUp = data.reduce((sum, m) => sum + (m.pickup_ball || 0), 0);
    const teleopAccuracy = teleopBallsPickedUp > 0 ? Math.round((teleopShots / teleopBallsPickedUp) * 100) : 0;

    const totalShots = autoShots + teleopShots;
    const totalBallsAvailable = autoAttempts + teleopBallsPickedUp; // Starting balls + picked up balls
    const overallAccuracy = totalBallsAvailable > 0 ? Math.round((totalShots / totalBallsAvailable) * 100) : 0;

    // Climb success rate
    const climbAttempts = data.filter(m => m.hang || m.park).length;
    const climbSuccess = data.filter(m => m.hang).length;
    const climbRate = climbAttempts > 0 ? Math.round((climbSuccess / climbAttempts) * 100) : 0;

    // Shooting distance
    const shootingDistances = data.filter(m => m.max_shooting_distance > 0).map(m => m.max_shooting_distance);
    const maxShootDistance = shootingDistances.length > 0 ? Math.max(...shootingDistances).toFixed(2) : 0;
    const avgShootDistance = shootingDistances.length > 0
        ? (shootingDistances.reduce((sum, d) => sum + d, 0) / shootingDistances.length).toFixed(2)
        : 0;

    // Defense time
    const avgDefenseTime = totalMatches > 0
        ? Math.round(data.reduce((sum, m) => sum + (m.total_defense_time || 0), 0) / totalMatches)
        : 0;

    // Control wheel rate
    const controlWheelSuccess = data.filter(m => m.rotation_control || m.position_control).length;
    const controlWheelRate = totalMatches > 0 ? Math.round((controlWheelSuccess / totalMatches) * 100) : 0;

    // Average balls scored per match
    const avgBalls = totalMatches > 0
        ? Math.round(totalShots / totalMatches)
        : 0;

    // Update basic stats
    document.getElementById('statTotalMatches').textContent = totalMatches;
    document.getElementById('statTotalTeams').textContent = uniqueTeams;
    document.getElementById('statAvgAuto').textContent = avgAuto;
    document.getElementById('statAvgTeleop').textContent = avgTeleop;
    document.getElementById('statAvgEndgame').textContent = avgEndgame;
    document.getElementById('statAvgTotal').textContent = avgTotal;

    // Update detailed analytics
    document.getElementById('statAutoAccuracy').textContent = autoAccuracy + '%';
    document.getElementById('statTeleopAccuracy').textContent = teleopAccuracy + '%';
    document.getElementById('statOverallAccuracy').textContent = overallAccuracy + '%';
    document.getElementById('statClimbRate').textContent = climbRate + '%';
    document.getElementById('statMaxShootDistance').textContent = maxShootDistance;
    document.getElementById('statAvgShootDistance').textContent = avgShootDistance;
    document.getElementById('statAvgDefenseTime').textContent = avgDefenseTime + 's';
    document.getElementById('statControlWheelRate').textContent = controlWheelRate + '%';
    document.getElementById('statAvgBalls').textContent = avgBalls;
}

// ===============================================
// VIEW MATCH DETAILS
// ===============================================

function viewMatchDetails(matchId) {
    const match = allMatchData.find(m => m.id === matchId);
    if (!match) return;

    const modal = document.getElementById('matchDetailsModal');
    const content = document.getElementById('matchDetailsContent');

    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Match Number</span>
                <span class="detail-value">${match.match_number}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Team Number</span>
                <span class="detail-value">${match.team_number}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Alliance</span>
                <span class="detail-value">${match.alliance_color.toUpperCase()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Starting Position</span>
                <span class="detail-value">${match.starting_position}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Scout</span>
                <span class="detail-value">${match.scout_name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Match Duration</span>
                <span class="detail-value">${match.match_duration}s</span>
            </div>
        </div>

        <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">Scores</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Auto Score</span>
                <span class="detail-value">${match.auto_score}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Teleop Score</span>
                <span class="detail-value">${match.teleop_score}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Endgame Score</span>
                <span class="detail-value">${match.endgame_score}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Total Score</span>
                <span class="detail-value">${match.total_score}</span>
            </div>
        </div>

        <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">Autonomous</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Crossed Init Line</span>
                <span class="detail-value">${match.crossed_init_line ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Bottom Port</span>
                <span class="detail-value">${match.auto_bottom_port}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Outer Port</span>
                <span class="detail-value">${match.auto_outer_port}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Inner Port</span>
                <span class="detail-value">${match.auto_inner_port}</span>
            </div>
        </div>

        <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">Teleop</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Balls Picked Up</span>
                <span class="detail-value">${match.pickup_ball}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Bottom Port</span>
                <span class="detail-value">${match.teleop_bottom_port}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Outer Port</span>
                <span class="detail-value">${match.teleop_outer_port}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Inner Port</span>
                <span class="detail-value">${match.teleop_inner_port}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Rotation Control</span>
                <span class="detail-value">${match.rotation_control}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Position Control</span>
                <span class="detail-value">${match.position_control}</span>
            </div>
        </div>

        <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">Endgame</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Parked</span>
                <span class="detail-value">${match.park ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Hanging</span>
                <span class="detail-value">${match.hang ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Level Switch</span>
                <span class="detail-value">${match.level ? '✓ Yes' : '✗ No'}</span>
            </div>
        </div>

        <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">Defense & Other</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Total Defense Time</span>
                <span class="detail-value">${match.total_defense_time || 0}s</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Effective Defense</span>
                <span class="detail-value">${match.effective_defense || 0}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Defensive Fouls</span>
                <span class="detail-value">${match.defensive_foul || 0}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Pinned Opponent</span>
                <span class="detail-value">${match.pinned || 0}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Penalties</span>
                <span class="detail-value">${match.penalty || 0}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Disabled Times</span>
                <span class="detail-value">${match.disabled || 0}</span>
            </div>
        </div>

        <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">📊 Performance Metrics</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Total Balls Scored</span>
                <span class="detail-value">${(match.auto_bottom_port || 0) + (match.auto_outer_port || 0) + (match.auto_inner_port || 0) + (match.teleop_bottom_port || 0) + (match.teleop_outer_port || 0) + (match.teleop_inner_port || 0)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Shooting Accuracy</span>
                <span class="detail-value">${calculateAccuracy(match)}%</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Max Shooting Distance</span>
                <span class="detail-value">${(match.max_shooting_distance || 0).toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Avg Shooting Distance</span>
                <span class="detail-value">${(match.avg_shooting_distance || 0).toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Points Per Second</span>
                <span class="detail-value">${(match.total_score / (match.match_duration || 150)).toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Contribution Score</span>
                <span class="detail-value">${calculateContributionScore(match)}</span>
            </div>
        </div>

        ${match.notes ? `
            <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">Notes</h3>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                ${match.notes}
            </div>
        ` : ''}

        ${match.field_markers_json ? `
            <h3 style="color: #00d4ff; margin: 20px 0 10px 0;">Field Tracking</h3>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 10px; text-align: center;">
                <canvas id="modalFieldCanvas" width="600" height="300" style="border: 2px solid rgba(0, 212, 255, 0.5); border-radius: 8px; max-width: 100%; background: #1a1a2e;"></canvas>
                <div style="display: flex; gap: 20px; margin-top: 15px; justify-content: center; flex-wrap: wrap;">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; background: #00ff88; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px #00ff88;"></span>
                        Ground Pickup
                    </span>
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; background: #ff6b35; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px #ff6b35;"></span>
                        Shooting
                    </span>
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; background: #ffaa00; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px #ffaa00;"></span>
                        Scoring
                    </span>
                </div>
            </div>
        ` : ''}
    `;

    modal.style.display = 'flex';

    // Draw field map if there are markers
    if (match.field_markers_json) {
        setTimeout(() => drawModalFieldMap(match.field_markers_json), 100);
    }
}

function calculateAccuracy(match) {
    const STARTING_BALLS = 3;
    const totalShots = (match.auto_bottom_port || 0) + (match.auto_outer_port || 0) + (match.auto_inner_port || 0) +
                       (match.teleop_bottom_port || 0) + (match.teleop_outer_port || 0) + (match.teleop_inner_port || 0);
    const ballsAvailable = STARTING_BALLS + (match.pickup_ball || 0);
    if (ballsAvailable === 0) return 0;
    return Math.round((totalShots / ballsAvailable) * 100);
}

function calculateContributionScore(match) {
    // Weighted scoring: Auto worth more, endgame climb worth more, defense adds value
    let score = 0;
    score += (match.auto_score || 0) * 1.5; // Auto is 1.5x valuable
    score += (match.teleop_score || 0) * 1.0;
    score += (match.endgame_score || 0) * 1.2; // Endgame is 1.2x valuable
    score += (match.total_defense_time || 0) * 0.5; // Defense time adds points
    score += (match.effective_defense || 0) * 3; // Effective defense blocks
    score -= (match.penalty || 0) * 5; // Penalties reduce score
    score -= (match.defensive_foul || 0) * 3; // Defensive fouls reduce score
    return Math.round(score);
}

function drawModalFieldMap(markersJson) {
    const canvas = document.getElementById('modalFieldCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const markers = JSON.parse(markersJson);

    // Load and draw field image
    const img = new Image();
    img.src = 'Images/Field.png';
    img.onload = () => {
        // Clear and draw field
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw markers
        const markerColors = {
            pickup: '#00ff88',
            shoot: '#ff6b35',
            score: '#ffaa00'
        };

        markers.forEach((marker, index) => {
            const x = marker.x * canvas.width;
            const y = marker.y * canvas.height;
            const color = markerColors[marker.type] || '#ffffff';

            // Draw glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;

            // Draw marker
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Reset shadow
            ctx.shadowBlur = 0;

            // Draw number
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 8px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(index + 1, x, y);
        });
    };
    img.onerror = () => {
        // Draw placeholder
        ctx.fillStyle = '#2a2a4e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
}

// ===============================================
// DELETE MATCH
// ===============================================

async function deleteMatch(matchId) {
    if (!confirm('Are you sure you want to delete this match data?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('match_data')
            .delete()
            .eq('id', matchId);

        if (error) throw error;

        showPopup('Match deleted successfully', 'success');
        loadDashboardData();

    } catch (error) {
        console.error('Error deleting match:', error);
        showPopup('Error deleting match: ' + error.message, 'error');
    }
}

// ===============================================
// DASHBOARD EVENT LISTENERS
// ===============================================

function setupDashboardEventListeners() {
    // Save to database button
    const saveBtn = document.getElementById('saveToDatabase');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveToDatabase);
    }

    // Refresh data
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadDashboardData());
    }

    // Apply filters
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const filters = {
                team: document.getElementById('filterTeam').value,
                match: document.getElementById('filterMatch').value,
                alliance: document.getElementById('filterAlliance').value
            };
            loadDashboardData(filters);
        });
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.getElementById('filterTeam').value = '';
            document.getElementById('filterMatch').value = '';
            document.getElementById('filterAlliance').value = '';
            loadDashboardData();
        });
    }

    // Export all CSV
    const exportAllCSVBtn = document.getElementById('exportAllCSV');
    if (exportAllCSVBtn) {
        exportAllCSVBtn.addEventListener('click', exportAllDataCSV);
    }

    // Export all JSON
    const exportAllJSONBtn = document.getElementById('exportAllJSON');
    if (exportAllJSONBtn) {
        exportAllJSONBtn.addEventListener('click', exportAllDataJSON);
    }

    // Clear all data
    const clearAllBtn = document.getElementById('clearAllData');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllData);
    }

    // Close modal
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('matchDetailsModal').style.display = 'none';
        });
    }

    // Close modal on outside click
    const modal = document.getElementById('matchDetailsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// ===============================================
// EXPORT FUNCTIONS
// ===============================================

function exportAllDataCSV() {
    if (allMatchData.length === 0) {
        showPopup('No data to export', 'warning');
        return;
    }

    let csv = 'Match,Team,Alliance,Position,Scout,Auto,Teleop,Endgame,Total,Init Line,Auto Bottom,Auto Outer,Auto Inner,Pickup,Teleop Bottom,Teleop Outer,Teleop Inner,Rotation,Position Ctrl,Park,Hang,Level,Defense,Penalty,Disabled,Notes,Date\n';

    allMatchData.forEach(m => {
        csv += `${m.match_number},${m.team_number},${m.alliance_color},${m.starting_position},${m.scout_name},${m.auto_score},${m.teleop_score},${m.endgame_score},${m.total_score},${m.crossed_init_line},${m.auto_bottom_port},${m.auto_outer_port},${m.auto_inner_port},${m.pickup_ball},${m.teleop_bottom_port},${m.teleop_outer_port},${m.teleop_inner_port},${m.rotation_control},${m.position_control},${m.park},${m.hang},${m.level},${m.defense},${m.penalty},${m.disabled},"${(m.notes || '').replace(/"/g, '""')}",${new Date(m.created_at).toLocaleString()}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scouting-data-all-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportAllDataJSON() {
    if (allMatchData.length === 0) {
        showPopup('No data to export', 'warning');
        return;
    }

    const json = JSON.stringify(allMatchData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scouting-data-all-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function clearAllData() {
    const confirmed = prompt('⚠️ WARNING: This will delete ALL scouting data from the database!\n\nType "DELETE ALL" to confirm:');

    if (confirmed !== 'DELETE ALL') {
        showPopup('Cancelled - no data was deleted', 'info');
        return;
    }

    try {
        const { error } = await supabase
            .from('match_data')
            .delete()
            .neq('id', 0); // Delete all rows

        if (error) throw error;

        showPopup('All data has been deleted', 'success');
        loadDashboardData();

    } catch (error) {
        console.error('Error clearing data:', error);
        showPopup('Error clearing data: ' + error.message, 'error');
    }
}
