// Custom Notification Popup System
// Replaces browser alert() with styled in-app notifications

let currentPopupTimeout = null;

/**
 * Show a custom notification popup
 * @param {string} message - The message to display
 * @param {string} type - The type of notification: 'success', 'error', 'warning', 'info'
 * @param {number} duration - How long to show the popup in milliseconds (default: 4000)
 */
function showPopup(message, type = 'info', duration = 4000) {
    const popup = document.getElementById('notificationPopup');
    const messageEl = document.getElementById('notificationMessage');
    const iconEl = document.getElementById('notificationIcon');

    // Clear any existing timeout
    if (currentPopupTimeout) {
        clearTimeout(currentPopupTimeout);
    }

    // Set the message
    messageEl.textContent = message;

    // Set the icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    iconEl.textContent = icons[type] || icons.info;

    // Remove all type classes and add the current type
    popup.className = 'notification-popup';
    popup.classList.add(type);

    // Show the popup
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    // Auto-hide after duration
    currentPopupTimeout = setTimeout(() => {
        hidePopup();
    }, duration);
}

/**
 * Hide the notification popup
 */
function hidePopup() {
    const popup = document.getElementById('notificationPopup');
    popup.classList.remove('show');

    if (currentPopupTimeout) {
        clearTimeout(currentPopupTimeout);
        currentPopupTimeout = null;
    }
}

// Set up close button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('notificationClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', hidePopup);
    }

    // Also close on clicking the popup (optional)
    const popup = document.getElementById('notificationPopup');
    if (popup) {
        popup.addEventListener('click', (e) => {
            // Only close if clicking the popup itself, not the close button
            if (e.target === popup || e.target.classList.contains('notification-content')) {
                hidePopup();
            }
        });
    }
});

// Override the native alert function (optional - only if you want to completely replace it)
// Uncomment the following if you want all alert() calls to use the custom popup
// window.alert = function(message) {
//     showPopup(message, 'info');
// };
