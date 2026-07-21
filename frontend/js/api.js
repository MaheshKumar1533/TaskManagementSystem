// TaskSphere Client API layer

(function() {
    const getApiUrl = () => {
        if (window.location.protocol === 'file:') {
            return 'http://localhost:8000/api';
        }
        // In Docker environment, Nginx reverse-proxies /api to Django container
        if (window.location.port === '8080' || window.location.port === '80' || window.location.port === '') {
            return '/api';
        }
        return 'http://localhost:8000/api';
    };

    const API_BASE = getApiUrl();

    // Export API functions globally
    window.TaskAPI = {
        baseUrl: API_BASE,

        async getTasks() {
            const response = await fetch(`${API_BASE}/tasks/`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        },

        async getStats() {
            const response = await fetch(`${API_BASE}/stats/`);
            if (!response.ok) throw new Error('Failed to fetch statistics');
            return response.json();
        },

        async createTask(payload) {
            const response = await fetch(`${API_BASE}/tasks/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to create task');
            return response.json();
        },

        async updateTask(taskId, payload) {
            const response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to update task');
            return response.json();
        },

        async deleteTask(taskId) {
            const response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete task');
            return response.json();
        }
    };
})();
