// TaskSphere Task Board Logic

(function() {
    let allTasks = [];
    let searchFilter = '';
    let priorityFilter = '';

    // Load tasks from backend
    async function loadTasks() {
        try {
            allTasks = await window.TaskAPI.getTasks();
            renderBoard();
        } catch (err) {
            console.error('Failed to load board tasks:', err);
            window.TaskUI.showToast('Unable to reach server. Try checking connections.', 'error');
        }
    }

    // Render task cards in columns
    function renderBoard() {
        const listTodo = document.getElementById('list-todo');
        const listProgress = document.getElementById('list-progress');
        const listDone = document.getElementById('list-done');

        if (!listTodo || !listProgress || !listDone) return;

        listTodo.innerHTML = '';
        listProgress.innerHTML = '';
        listDone.innerHTML = '';

        let todoCount = 0;
        let progressCount = 0;
        let doneCount = 0;

        const filteredTasks = allTasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchFilter) || 
                                  task.description.toLowerCase().includes(searchFilter);
            const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });

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

        document.getElementById('todo-badge').textContent = todoCount;
        document.getElementById('progress-badge').textContent = progressCount;
        document.getElementById('done-badge').textContent = doneCount;
    }

    // Card Builder
    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `task-card-${task.id}`;

        let dueDateHTML = '';
        if (task.due_date) {
            const date = new Date(task.due_date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dueDateHTML = `<div class="task-due-date"><i class="fa-regular fa-calendar"></i> ${dateStr}</div>`;
        }

        card.innerHTML = `
            <h4>${window.TaskUI.escapeHTML(task.title)}</h4>
            <p>${window.TaskUI.escapeHTML(task.description || 'No description provided.')}</p>
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

    // Modal control
    function openModal(task = null) {
        const taskForm = document.getElementById('task-form');
        const modalTitle = document.getElementById('modal-title');
        const taskModal = document.getElementById('task-modal');

        if (!taskForm || !taskModal) return;

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
        const taskModal = document.getElementById('task-modal');
        if (taskModal) {
            taskModal.classList.add('hidden');
        }
    }

    // Form submission
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
            if (taskId) {
                await window.TaskAPI.updateTask(taskId, payload);
                window.TaskUI.showToast('Task updated successfully!', 'success');
            } else {
                await window.TaskAPI.createTask(payload);
                window.TaskUI.showToast('Task created successfully!', 'success');
            }
            closeModal();
            loadTasks();
        } catch (err) {
            console.error(err);
            window.TaskUI.showToast('Failed to save task parameters.', 'error');
        }
    }

    // Global action callbacks
    window.editTask = function(taskId) {
        const task = allTasks.find(t => t.id === taskId);
        if (task) openModal(task);
    };

    window.deleteTask = async function(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await window.TaskAPI.deleteTask(taskId);
            window.TaskUI.showToast('Task deleted successfully', 'success');
            loadTasks();
        } catch (err) {
            console.error(err);
            window.TaskUI.showToast('Failed to delete task', 'error');
        }
    };

    window.moveTaskProgress = async function(taskId, currentStatus) {
        const nextStatus = currentStatus === 'todo' ? 'in_progress' : 'done';
        try {
            await window.TaskAPI.updateTask(taskId, { status: nextStatus });
            window.TaskUI.showToast('Task advanced successfully!', 'success');
            loadTasks();
        } catch (err) {
            console.error(err);
            window.TaskUI.showToast('Failed to transition task status', 'error');
        }
    };

    // Initialize Task Board View
    document.addEventListener('DOMContentLoaded', () => {
        const boardSection = document.getElementById('board-view');
        if (boardSection) {
            window.TaskUI.setDateBadge('current-date');
            
            // Register Event Listeners
            const btnNewTask = document.getElementById('btn-new-task');
            const btnCloseModal = document.getElementById('btn-close-modal');
            const btnCancelTask = document.getElementById('btn-cancel-task');
            const taskForm = document.getElementById('task-form');
            const searchInput = document.getElementById('search-input');
            const priorityFilterSelect = document.getElementById('priority-filter');

            if (btnNewTask) btnNewTask.addEventListener('click', () => openModal());
            if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
            if (btnCancelTask) btnCancelTask.addEventListener('click', closeModal);
            if (taskForm) taskForm.addEventListener('submit', handleFormSubmit);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    searchFilter = e.target.value.toLowerCase();
                    renderBoard();
                });
            }

            if (priorityFilterSelect) {
                priorityFilterSelect.addEventListener('change', (e) => {
                    priorityFilter = e.target.value;
                    renderBoard();
                });
            }

            loadTasks();
        }
    });
})();
