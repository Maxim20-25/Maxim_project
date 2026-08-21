// Kanban Board Functionality
class KanbanBoard {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [];
        this.init();
    }

    init() {
        this.renderAllTasks();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const newTaskInput = document.getElementById('newTaskInput');

        addTaskBtn.addEventListener('click', () => this.addTask());
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }

    addTask() {
        const input = document.getElementById('newTaskInput');
        const title = input.value.trim();

        if (!title) {
            alert('Введите название задачи!');
            return;
        }

        const task = {
            id: Date.now(),
            title: title,
            status: 'todo'
        };

        this.tasks.push(task);
        this.save();
        this.renderTask(task);
        this.updateCounts();
        input.value = '';
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.save();
        this.renderAllTasks();
        this.updateCounts();
    }

    moveTask(id, newStatus) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            this.save();
            this.renderAllTasks();
            this.updateCounts();
        }
    }

    renderAllTasks() {
        ['todo', 'in-progress', 'done'].forEach(status => {
            const container = document.querySelector(`.task-list[data-status="${status}"]`);
            container.innerHTML = '';
        });

        this.tasks.forEach(task => this.renderTask(task));
    }

    renderTask(task) {
        const container = document.querySelector(`.task-list[data-status="${task.status}"]`);
        if (!container) return;

        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.draggable = true;
        taskCard.dataset.id = task.id;

        taskCard.innerHTML = `
            <div class="task-title">${this.escapeHtml(task.title)}</div>
            <div class="task-actions">
                ${task.status !== 'todo' ? '<button class="btn-move" data-action="prev">← Назад</button>' : ''}
                ${task.status !== 'done' ? '<button class="btn-move" data-action="next">Вперед →</button>' : ''}
                <button class="btn-delete" data-action="delete">Удалить</button>
            </div>
        `;

        // Add event listeners to buttons
        taskCard.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'delete') {
                    this.deleteTask(task.id);
                } else if (action === 'next') {
                    const newStatus = task.status === 'todo' ? 'in-progress' : 'done';
                    this.moveTask(task.id, newStatus);
                } else if (action === 'prev') {
                    const newStatus = task.status === 'done' ? 'in-progress' : 'todo';
                    this.moveTask(task.id, newStatus);
                }
            });
        });

        // Drag events
        taskCard.addEventListener('dragstart', (e) => {
            taskCard.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
        });

        taskCard.addEventListener('dragend', () => {
            taskCard.classList.remove('dragging');
        });

        container.appendChild(taskCard);
    }

    updateCounts() {
        ['todo', 'in-progress', 'done'].forEach(status => {
            const count = this.tasks.filter(t => t.status === status).length;
            const column = document.querySelector(`.column[data-status="${status}"]`);
            if (column) {
                const countEl = column.querySelector('.task-count');
                countEl.textContent = count;
            }
        });
    }

    setupDragAndDrop() {
        const columns = document.querySelectorAll('.task-list');

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = document.querySelector('.task-card.dragging');
                if (dragging) {
                    column.appendChild(dragging);
                }
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = column.dataset.status;
                this.moveTask(taskId, newStatus);
            });
        });
    }

    save() {
        localStorage.setItem('kanbanTasks', JSON.stringify(this.tasks));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Habit Tracker Functionality
class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.currentWeek = this.getCurrentWeek();
        this.init();
    }

    init() {
        this.renderAllHabits();
        this.setupEventListeners();
    }

    getCurrentWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        
        const week = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            week.push(date.toISOString().split('T')[0]);
        }
        return week;
    }

    getDayIndex(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDay();
        return day === 0 ? 6 : day - 1;
    }

    setupEventListeners() {
        const addHabitBtn = document.getElementById('addHabitBtn');
        const newHabitInput = document.getElementById('newHabitInput');

        addHabitBtn.addEventListener('click', () => this.addHabit());
        newHabitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });
    }

    addHabit() {
        const input = document.getElementById('newHabitInput');
        const name = input.value.trim();

        if (!name) {
            alert('Введите название привычки!');
            return;
        }

        const habit = {
            id: Date.now(),
            name: name,
            completedDays: []
        };

        this.habits.push(habit);
        this.save();
        this.renderHabit(habit);
        input.value = '';
    }

    toggleDay(habitId, dateStr) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            const index = habit.completedDays.indexOf(dateStr);
            if (index > -1) {
                habit.completedDays.splice(index, 1);
            } else {
                habit.completedDays.push(dateStr);
            }
            this.save();
            this.renderAllHabits();
        }
    }

    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.save();
        this.renderAllHabits();
    }

    renderAllHabits() {
        const container = document.getElementById('habitList');
        container.innerHTML = '';
        this.habits.forEach(habit => this.renderHabit(habit));
    }

    renderHabit(habit) {
        const container = document.getElementById('habitList');
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'habit-row';

        const completedCount = habit.completedDays.filter(
            d => this.currentWeek.includes(d)
        ).length;

        const percentage = Math.round((completedCount / 7) * 100);

        let daysHtml = '';
        this.currentWeek.forEach((dateStr, index) => {
            const isCompleted = habit.completedDays.includes(dateStr);
            const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
            
            daysHtml += `
                <div class="habit-day">
                    <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" 
                         data-habit-id="${habit.id}" 
                         data-date="${dateStr}"
                         title="${dayNames[index]}">
                        ${isCompleted ? '✓' : ''}
                    </div>
                </div>
            `;
        });

        row.innerHTML = `
            <div class="habit-name">${this.escapeHtml(habit.name)}</div>
            ${daysHtml}
            <div class="habit-stats">${percentage}%</div>
            <button class="habit-delete" data-habit-id="${habit.id}">✕</button>
        `;

        // Add event listeners
        row.querySelectorAll('.habit-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', () => {
                const habitId = parseInt(checkbox.dataset.habitId);
                const date = checkbox.dataset.date;
                this.toggleDay(habitId, date);
            });
        });

        const deleteBtn = row.querySelector('.habit-delete');
        deleteBtn.addEventListener('click', () => {
            const habitId = parseInt(deleteBtn.dataset.habitId);
            this.deleteHabit(habitId);
        });

        container.appendChild(row);
    }

    save() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Tab Navigation
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Initialize both apps
    new KanbanBoard();
    new HabitTracker();
});
