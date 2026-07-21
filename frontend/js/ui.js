// TaskSphere Shared UI Layer

(function() {
    // Setup date strings
    const setDateBadge = (elementId) => {
        const el = document.getElementById(elementId);
        if (el) {
            const options = { month: 'long', day: 'numeric', year: 'numeric' };
            el.textContent = new Date().toLocaleDateString('en-US', options);
        }
    };

    // Escapes special characters for rendering safety
    const escapeHTML = (str) => {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // Displays dynamic toast notification overlays
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' 
            ? '<i class="fa-regular fa-circle-check"></i>' 
            : '<i class="fa-solid fa-circle-exclamation"></i>';
            
        toast.innerHTML = `
            ${icon}
            <span class="toast-message">${escapeHTML(message)}</span>
        `;

        container.appendChild(toast);

        // Remove from DOM after CSS slide out
        setTimeout(() => {
            toast.remove();
        }, 4000);
    };

    // Export UI functions globally
    window.TaskUI = {
        setDateBadge,
        escapeHTML,
        showToast
    };
})();
