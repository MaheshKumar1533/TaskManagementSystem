// TaskSphere Dashboard Orchestrator (ES6 Vanilla JS)

const getApiUrl = () => {
    if (window.location.protocol === 'file:') {
        return 'http://localhost:8000/api';
    }
    // In Docker Nginx environment, Nginx proxies /api to Django backend
    if (window.location.port === '8080' || window.location.port === '80' || window.location.port === '') {
        return '/api';
    }
    return 'http://localhost:8000/api';
};

const API_BASE = getApiUrl();

// App State
let tasks = [];
let stats = { total: 0, by_status: { todo: 0, in_progress: 0, done: 0 }, by_priority: { low: 0, medium: 0, high: 0 } };
let currentView = 'dashboard';
let searchFilter = '';
let priorityFilter = '';

// DOM Elements
const dashboardView = document.getElementById('dashboard-view');
const boardView = document.getElementById('board-view');
const navDashboard = document.getElementById('nav-dashboard');
const navBoard = document.getElementById('nav-board');
const welcomeText = document.getElementById('welcome-text');

const statTotal = document.getElementById('stat-total');
const statTodo = document.getElementById('stat-todo');
const statProgress = document.getElementById('stat-progress');
const statDone = document.getElementById('stat-done');

const circleProgressBar = document.getElementById('circle-progress-bar');
const progressPercent = document.getElementById('progress-percent');

const countHigh = document.getElementById('count-high');
const countMedium = document.getElementById('count-medium');
const countLow = document.getElementById('count-low');
const barHigh = document.getElementById('bar-high');
const barMedium = document.getElementById('bar-medium');
const barLow = document.getElementById('bar-low');

const listTodo = document.getElementById('list-todo');
const listProgress = document.getElementById('list-progress');
const listDone = document.getElementById('list-done');

const todoBadge = document.getElementById('todo-badge');
const progressBadge = document.getElementById('progress-badge');
const doneBadge = document.getElementById('done-badge');

const searchInput = document.getElementById('search-input');
const priorityFilterSelect = document.getElementById('priority-filter');

const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const btnNewTask = document.getElementById('btn-new-task');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelTask = document.getElementById('btn-cancel-task');

const currentDateEl = document.getElementById('current-date');
const toastContainer = document.getElementById('toast-container');

// SVG Configuration
const CIRCLE_CIRCUMFERENCE = 251.2; // 2 * pi * 40

// ----------------------------------------------------
// Core Initialization
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Set formatted current date
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);

    // SVG initialization
    if (circleProgressBar) {
        circleProgressBar.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
        circleProgressBar.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
    }

    setupEventListeners();
    fetchData();
});

// ----------------------------------------------------
// Event Listeners
// ----------------------------------------------------
function setupEventListeners() {
    // Navigation
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('dashboard');
    });

    navBoard.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('board');
    });

    // Modal Control
    btnNewTask.addEventListener('click', () => openModal());
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelTask.addEventListener('click', closeModal);
    
    // Form Submit
    taskForm.addEventListener('submit', handleFormSubmit);

    // Search and Filters
    searchInput.addEventListener('input', (e) => {
        searchFilter = e.target.value.toLowerCase();
        renderBoard();
    });

    priorityFilterSelect.addEventListener('change', (e) => {
        priorityFilter = e.target.value;
        renderBoard();
    });
}

// ----------------------------------------------------
// API Request Handling
// ----------------------------------------------------
async function fetchData() {
    try {
        const [tasksResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}/tasks/`),
            fetch(`${API_BASE}/stats/`)
        ]);

        if (!tasksResponse.ok || !statsResponse.ok) {
            throw new Error('API server error');
        }

        tasks = await tasksResponse.json();
        stats = await statsResponse.json();

        updateDashboard();
        renderBoard();
    } catch (err) {
        console.error('Failed to load data:', err);
        showToast('Unable to connect to Server. Backend might be starting...', 'error');
    }
}

// ----------------------------------------------------
// View Controllers
// ----------------------------------------------------
function switchView(viewName) {
    currentView = viewName;
    if (viewName === 'dashboard') {
        dashboardView.classList.remove('hidden');
        boardView.classList.add('hidden');
        navDashboard.classList.add('active');
        navBoard.classList.remove('active');
        welcomeText.textContent = 'Workspace Analytics';
    } else {
        dashboardView.classList.add('hidden');
        boardView.classList.remove('hidden');
        navDashboard.classList.remove('active');
        navBoard.classList.add('active');
        welcomeText.textContent = 'Task Board';
    }
}

// ----------------------------------------------------
// Dashboard Rendering
// ----------------------------------------------------
function updateDashboard() {
    // Top Counters
    statTotal.textContent = stats.total || 0;
    statTodo.textContent = stats.by_status.todo || 0;
    statProgress.textContent = stats.by_status.in_progress || 0;
    statDone.textContent = stats.by_status.done || 0;

    // Circular Progress
    const completionPercent = stats.total > 0 
        ? Math.round((stats.by_status.done / stats.total) * 100) 
        : 0;
    
    progressPercent.textContent = `${completionPercent}%`;
    
    if (circleProgressBar) {
        const offset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * completionPercent) / 100;
        circleProgressBar.style.strokeDashoffset = offset;
    }

    // Priority Distributions
    countHigh.textContent = stats.by_priority.high || 0;
    countMedium.textContent = stats.by_priority.medium || 0;
    countLow.textContent = stats.by_priority.low || 0;

    const maxPriority = Math.max(stats.by_priority.high, stats.by_priority.medium, stats.by_priority.low) || 1;
    
    barHigh.style.width = `${((stats.by_priority.high || 0) / maxPriority) * 100}%`;
    barMedium.style.width = `${((stats.by_priority.medium || 0) / maxPriority) * 100}%`;
    barLow.style.width = `${((stats.by_priority.low || 0) / maxPriority) * 100}%`;
}

// ----------------------------------------------------
// Kanban Board Rendering
// ----------------------------------------------------
function renderBoard() {
    // Clear lists
    listTodo.innerHTML = '';
    listProgress.innerHTML = '';
    listDone.innerHTML = '';

    let todoCount = 0;
    let progressCount = 0;
    let doneCount = 0;

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchFilter) || 
                              task.description.toLowerCase().includes(searchFilter);
        const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    // Populate columns
    filteredTasks.forEach(task => {
        const card = createTaskCard(task);
        if (task.status === 'todo') {
            listTodo.appendChild(card);
            todoCount++;
        } else if (task.status === 'in_progress') {
            listProgress.appendChild(card);
            progressCount++;
        } else if (task.status === 'done') {
            listDone.appendChild(card);
            doneCount++;
        }
    });

    // Update column counters
    todoBadge.textContent = todoCount;
    progressBadge.textContent = progressCount;
    doneBadge.textContent = doneCount;
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = `task-card-${task.id}`;

    // Format Date
    let dueDateHTML = '';
    if (task.due_date) {
        const date = new Date(task.due_date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dueDateHTML = `<div class="task-due-date"><i class="fa-regular fa-calendar"></i> ${dateStr}</div>`;
    }

    card.innerHTML = `
        <h4>${escapeHTML(task.title)}</h4>
        <p>${escapeHTML(task.description || 'No description provided.')}</p>
        <div class="task-meta">
            <span class="task-priority-pill ${task.priority}">${task.priority}</span>
            ${dueDateHTML}
        </div>
        <div class="task-actions">
            ${task.status !== 'done' ? `
                <button class="btn-move-action" title="Progress Status" onclick="moveTaskProgress(${task.id}, '${task.status}')">
                    <i class="fa-solid fa-arrow-right-long"></i>
                </button>
            ` : ''}
            <button class="btn-edit-action" title="Edit Task" onclick="editTask(${task.id})">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-delete-action" title="Delete Task" onclick="deleteTask(${task.id})">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        </div>
    `;

    return card;
}

// ----------------------------------------------------
// Task Actions (Create, Edit, Delete, Move)
// ----------------------------------------------------
function openModal(task = null) {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    
    if (task) {
        modalTitle.textContent = 'Edit Task';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-due').value = task.due_date || '';
    } else {
        modalTitle.textContent = 'Create New Task';
    }
    
    taskModal.classList.remove('hidden');
}

function closeModal() {
    taskModal.classList.add('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const status = document.getElementById('task-status').value;
    const priority = document.getElementById('task-priority').value;
    const due_date = document.getElementById('task-due').value;

    const payload = { title, description, status, priority, due_date: due_date || null };

    try {
        let response;
        if (taskId) {
            // Update
            response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Create
            response = await fetch(`${API_BASE}/tasks/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) throw new Error('Failed to save task');

        showToast(taskId ? 'Task updated successfully!' : 'Task created successfully!', 'success');
        closeModal();
        fetchData();
    } catch (err) {
        console.error(err);
        showToast('Failed to save task. Try again.', 'error');
    }
}

window.editTask = function(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        openModal(task);
    }
};

window.deleteTask = async function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        showToast('Task deleted successfully', 'success');
        fetchData();
    } catch (err) {
        console.error(err);
        showToast('Failed to delete task', 'error');
    }
};

window.moveTaskProgress = async function(taskId, currentStatus) {
    const nextStatus = currentStatus === 'todo' ? 'in_progress' : 'done';
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });

        if (!response.ok) throw new Error('Failed to update task status');

        showToast('Task advanced successfully!', 'success');
        fetchData();
    } catch (err) {
        console.error(err);
        showToast('Failed to move task', 'error');
    }
};

// ----------------------------------------------------
// Toast Notification Utility
// ----------------------------------------------------
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? '<i class="fa-regular fa-circle-check"></i>' 
        : '<i class="fa-solid fa-circle-exclamation"></i>';
        
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after animation completes
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Helper to escape HTML tags
function escapeHTML(str) {
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
}
