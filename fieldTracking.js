// ===============================================
// FIELD TRACKING FUNCTIONALITY
// ===============================================

// Field tracking state
let fieldImage = null;
let fieldCanvas = null;
let fieldCtx = null;
let currentMode = 'pickup';
let fieldMarkers = [];

// Marker colors
const MARKER_COLORS = {
    pickup: '#00ff88',
    shoot: '#ff6b35',
    score: '#ffaa00'
};

// Initialize field tracking when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initializeFieldTracking();
});

function initializeFieldTracking() {
    fieldCanvas = document.getElementById('fieldCanvas');
    if (!fieldCanvas) {
        console.warn('Field canvas not found');
        return;
    }

    fieldCtx = fieldCanvas.getContext('2d');

    // Load field image
    fieldImage = new Image();
    fieldImage.src = 'Images/Screenshot 2025-10-20 223552.png';
    fieldImage.onload = () => {
        drawField();
    };
    fieldImage.onerror = () => {
        console.error('Failed to load field image');
        // Draw a placeholder
        fieldCtx.fillStyle = '#2a2a4e';
        fieldCtx.fillRect(0, 0, fieldCanvas.width, fieldCanvas.height);
        fieldCtx.fillStyle = '#ffffff';
        fieldCtx.font = '20px Arial';
        fieldCtx.textAlign = 'center';
        fieldCtx.fillText('Field Image Not Found', fieldCanvas.width / 2, fieldCanvas.height / 2);
    };

    // Set up mode buttons
    const modeButtons = document.querySelectorAll('.mode-btn[data-mode]');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
        });
    });

    // Clear last marker
    const clearLastBtn = document.getElementById('clearLastMarker');
    if (clearLastBtn) {
        clearLastBtn.addEventListener('click', () => {
            if (fieldMarkers.length > 0) {
                fieldMarkers.pop();
                drawField();
            }
        });
    }

    // Clear all markers
    const clearAllBtn = document.getElementById('clearAllMarkers');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (fieldMarkers.length > 0 && confirm('Clear all field markers?')) {
                fieldMarkers = [];
                drawField();
            }
        });
    }

    // Canvas click handler
    fieldCanvas.addEventListener('click', handleFieldClick);
}

function handleFieldClick(event) {
    const rect = fieldCanvas.getBoundingClientRect();
    const scaleX = fieldCanvas.width / rect.width;
    const scaleY = fieldCanvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Normalize coordinates to 0-1 range for database storage
    const normalizedX = x / fieldCanvas.width;
    const normalizedY = y / fieldCanvas.height;

    // Add marker
    const marker = {
        x: x,
        y: y,
        normalizedX: normalizedX,
        normalizedY: normalizedY,
        type: currentMode,
        timestamp: new Date().toISOString(),
        time: elapsedTime
    };

    fieldMarkers.push(marker);
    drawField();
}

function drawField() {
    if (!fieldCtx || !fieldCanvas) return;

    // Clear canvas
    fieldCtx.clearRect(0, 0, fieldCanvas.width, fieldCanvas.height);

    // Draw field image
    if (fieldImage && fieldImage.complete) {
        fieldCtx.drawImage(fieldImage, 0, 0, fieldCanvas.width, fieldCanvas.height);
    } else {
        // Draw placeholder
        fieldCtx.fillStyle = '#2a2a4e';
        fieldCtx.fillRect(0, 0, fieldCanvas.width, fieldCanvas.height);
    }

    // Draw all markers
    fieldMarkers.forEach((marker, index) => {
        drawMarker(marker.x, marker.y, marker.type, index + 1);
    });
}

function drawMarker(x, y, type, number) {
    const color = MARKER_COLORS[type] || '#ffffff';

    // Draw outer glow
    fieldCtx.shadowBlur = 15;
    fieldCtx.shadowColor = color;

    // Draw marker circle
    fieldCtx.fillStyle = color;
    fieldCtx.beginPath();
    fieldCtx.arc(x, y, 8, 0, Math.PI * 2);
    fieldCtx.fill();

    // Draw border
    fieldCtx.strokeStyle = '#ffffff';
    fieldCtx.lineWidth = 2;
    fieldCtx.stroke();

    // Reset shadow
    fieldCtx.shadowBlur = 0;

    // Draw number
    fieldCtx.fillStyle = '#000000';
    fieldCtx.font = 'bold 10px Arial';
    fieldCtx.textAlign = 'center';
    fieldCtx.textBaseline = 'middle';
    fieldCtx.fillText(number, x, y);
}

function getFieldMarkersData() {
    return fieldMarkers.map(marker => ({
        type: marker.type,
        x: marker.normalizedX,
        y: marker.normalizedY,
        time: marker.time
    }));
}

function loadFieldMarkers(markersData) {
    if (!Array.isArray(markersData)) return;

    fieldMarkers = markersData.map(marker => ({
        x: marker.x * fieldCanvas.width,
        y: marker.y * fieldCanvas.height,
        normalizedX: marker.x,
        normalizedY: marker.y,
        type: marker.type,
        time: marker.time || 0
    }));

    drawField();
}

function clearFieldMarkers() {
    fieldMarkers = [];
    drawField();
}

// Make functions available globally
window.getFieldMarkersData = getFieldMarkersData;
window.loadFieldMarkers = loadFieldMarkers;
window.clearFieldMarkers = clearFieldMarkers;
window.drawField = drawField;
