// TaskSphere Dashboard Analytics Manager

(function() {
    const CIRCLE_CIRCUMFERENCE = 251.2;

    // Load data from API and update dashboard elements
    async function loadDashboardStats() {
        try {
            const stats = await window.TaskAPI.getStats();
            
            // Top Counter Numbers
            document.getElementById('stat-total').textContent = stats.total || 0;
            document.getElementById('stat-todo').textContent = stats.by_status.todo || 0;
            document.getElementById('stat-progress').textContent = stats.by_status.in_progress || 0;
            document.getElementById('stat-done').textContent = stats.by_status.done || 0;

            // Circular Completion Chart
            const completionPercent = stats.total > 0 
                ? Math.round((stats.by_status.done / stats.total) * 100) 
                : 0;
            
            document.getElementById('progress-percent').textContent = `${completionPercent}%`;
            
            const circleBar = document.getElementById('circle-progress-bar');
            if (circleBar) {
                const offset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * completionPercent) / 100;
                circleBar.style.strokeDashoffset = offset;
            }

            // Priority Distributions
            document.getElementById('count-high').textContent = stats.by_priority.high || 0;
            document.getElementById('count-medium').textContent = stats.by_priority.medium || 0;
            document.getElementById('count-low').textContent = stats.by_priority.low || 0;

            const maxPriority = Math.max(stats.by_priority.high, stats.by_priority.medium, stats.by_priority.low) || 1;
            
            document.getElementById('bar-high').style.width = `${((stats.by_priority.high || 0) / maxPriority) * 100}%`;
            document.getElementById('bar-medium').style.width = `${((stats.by_priority.medium || 0) / maxPriority) * 100}%`;
            document.getElementById('bar-low').style.width = `${((stats.by_priority.low || 0) / maxPriority) * 100}%`;

        } catch (err) {
            console.error('Failed to load dashboard statistics:', err);
            window.TaskUI.showToast('Unable to connect to server. Trying to reconnect...', 'error');
        }
    }

    // Initialize Dashboard View
    document.addEventListener('DOMContentLoaded', () => {
        // Ensure this only runs on dashboard.html
        if (document.getElementById('dashboard-view')) {
            window.TaskUI.setDateBadge('current-date');
            
            // SVG setup
            const circleBar = document.getElementById('circle-progress-bar');
            if (circleBar) {
                circleBar.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
                circleBar.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
            }
            
            loadDashboardStats();
            
            // Poll for fresh metrics occasionally
            setInterval(loadDashboardStats, 10000);
        }
    });
})();
