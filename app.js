/**
 * TaskFlow — Pair Version JavaScript
 * Built incrementally with GitHub Copilot as AI pair programming assistant.
 *
 * Architectural decisions made during pair programming:
 * - Separate JS module from HTML (Copilot suggested inline; decision to separate was manual)
 * - TaskManager class pattern (Copilot suggested procedural; class chosen for testability)
 * - Immutable state updates (Copilot suggested direct mutation; corrected to functional updates)
 * - XSS protection via createTextNode (Copilot suggestion accepted)
 * - ARIA live region for accessibility (added manually after Copilot omitted it)
 */

'use strict';

// ───────────────────────────────────────────────
// TaskManager — core state management
// Decision: class-based for encapsulation
// ───────────────────────────────────────────────
class TaskManager {
  constructor() {
    this._tasks = [];
    this._nextId = 1;
  }

  /** @returns {Task[]} immutable copy of all tasks */
  getAll() {
    return [...this._tasks];
  }

  /** 
   * @param {string} filter - 'all' | 'active' | 'completed'
   * @param {string} [searchQuery] - text search query
   * @returns {Task[]} tasks matching filter and search query
   */
  getFiltered(filter, searchQuery = '') {
    let result = this._tasks;
    if (filter === 'active') {
      result = result.filter(t => !t.done);
    } else if (filter === 'completed') {
      result = result.filter(t => t.done);
    }
    
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(t => t.title.toLowerCase().includes(query));
    }
    return result;
  }

  /**
   * Add a new task.
   * @param {string} title
   * @returns {Task} the new task
   */
  add(title) {
    const task = { id: this._nextId++, title: title.trim(), done: false };
    this._tasks = [...this._tasks, task];
    return task;
  }

  /**
   * Toggle a task's completion state.
   * @param {number} id
   * @returns {boolean} true if toggled successfully
   */
  toggle(id) {
    let toggled = false;
    this._tasks = this._tasks.map(t => {
      if (t.id === id) { toggled = true; return { ...t, done: !t.done }; }
      return t;
    });
    return toggled;
  }

  /**
   * Remove a task by id.
   * @param {number} id
   * @returns {boolean} true if removed
   */
  remove(id) {
    const before = this._tasks.length;
    this._tasks = this._tasks.filter(t => t.id !== id);
    return this._tasks.length < before;
  }

  /** Remove all completed tasks */
  clearCompleted() {
    this._tasks = this._tasks.filter(t => !t.done);
  }

  /** @returns {number} count of tasks where done === false */
  countActive() {
    return this._tasks.filter(t => !t.done).length;
  }

  /** @returns {number} count of tasks where done === true */
  countCompleted() {
    return this._tasks.filter(t => t.done).length;
  }
}

// ───────────────────────────────────────────────
// UI Controller — separates rendering from state
// Decision: explicit render() call rather than
// reactive proxy (simpler for this scope)
// ───────────────────────────────────────────────
class UIController {
  constructor(manager) {
    this.manager     = manager;
    this.filter      = 'all';
    this.searchQuery = '';

    // DOM refs — acquired once at init
    this.taskInput      = document.getElementById('task-input');
    this.addBtn         = document.getElementById('add-btn');
    this.taskList       = document.getElementById('task-list');
    this.emptyState     = document.getElementById('empty-state');
    this.emptyTitle     = document.getElementById('empty-title');
    this.emptySub       = document.getElementById('empty-subtitle');
    this.remainNum      = document.getElementById('remaining-num');
    this.remainLabel    = document.getElementById('remaining-label');
    this.clearBtn       = document.getElementById('clear-btn');
    this.countAll       = document.getElementById('count-all');
    this.countActive    = document.getElementById('count-active');
    this.countComp      = document.getElementById('count-completed');
    this.filterTabs     = document.querySelectorAll('.filter-tab');
    this.searchInput    = document.getElementById('search-input');
    this.searchClearBtn = document.getElementById('search-clear-btn');
  }

  /** Bind all event listeners */
  bindEvents() {
    // Add task
    this.addBtn.addEventListener('click', () => this._handleAdd());
    this.taskInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._handleAdd();
    });

    // Search input live filtering — Copilot suggestion: input event listener
    this.searchInput.addEventListener('input', e => {
      this.searchQuery = e.target.value;
      if (this.searchClearBtn) {
        this.searchClearBtn.hidden = !this.searchQuery;
      }
      this.render();
    });

    if (this.searchClearBtn) {
      this.searchClearBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.searchQuery = '';
        this.searchClearBtn.hidden = true;
        this.searchInput.focus();
        this.render();
      });
    }

    // Filters — Copilot suggestion: use event delegation on filter-nav
    // Decision: accepted delegation pattern, added aria-pressed management
    document.querySelector('.filter-nav').addEventListener('click', e => {
      const tab = e.target.closest('.filter-tab');
      if (tab) this._setFilter(tab.dataset.filter);
    });

    // Clear completed
    this.clearBtn.addEventListener('click', () => {
      this.manager.clearCompleted();
      this.render();
    });
  }

  /** Handle adding a new task */
  _handleAdd() {
    const raw = this.taskInput.value.trim();
    if (!raw) {
      this.taskInput.focus();
      return;
    }
    this.manager.add(raw);
    this.taskInput.value = '';
    this.taskInput.focus();
    this.render();
  }

  /** Change the active filter */
  _setFilter(newFilter) {
    if (newFilter === this.filter) return;
    this.filter = newFilter;
    this.render();
  }

  /**
   * Render the full UI from current state.
   * Copilot initially suggested innerHTML for the whole list;
   * changed to createElement for XSS safety.
   */
  render() {
    const all        = this.manager.getAll();
    const filtered   = this.manager.getFiltered(this.filter, this.searchQuery);
    const active     = this.manager.countActive();
    const completed  = this.manager.countCompleted();

    // ── Update filter tab counts ──
    this.countAll.textContent    = all.length;
    this.countActive.textContent = active;
    this.countComp.textContent   = completed;

    // ── Update filter tab active state ──
    this.filterTabs.forEach(tab => {
      const isActive = tab.dataset.filter === this.filter;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    });

    // ── Render task list ──
    this.taskList.innerHTML = '';

    if (filtered.length === 0) {
      this.taskList.hidden   = true;
      this.emptyState.hidden = false;
      this._updateEmptyMessage();
    } else {
      this.taskList.hidden   = false;
      this.emptyState.hidden = true;
      filtered.forEach(task => {
        this.taskList.appendChild(this._createTaskElement(task));
      });
    }

    // ── Footer ──
    this.remainNum.textContent   = active;
    this.remainLabel.textContent = active === 1 ? 'task' : 'tasks';
    this.clearBtn.disabled       = completed === 0;
  }

  /** Build a single task list item element */
  _createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' completed' : '');
    li.setAttribute('id', `task-${task.id}`);
    li.setAttribute('role', 'listitem');

    // Checkbox
    const check = document.createElement('div');
    check.className = 'task-check';
    check.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    // Title — using createTextNode for XSS safety
    // Copilot suggested this; accepted
    const titleEl = document.createElement('span');
    titleEl.className = 'task-title';
    titleEl.appendChild(document.createTextNode(task.title));

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'task-delete';
    delBtn.setAttribute('type', 'button');
    delBtn.setAttribute('aria-label', `Delete: ${task.title}`);
    delBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    // Toggle handler — click anywhere on item except delete button
    li.addEventListener('click', e => {
      if (!e.target.closest('.task-delete')) {
        this.manager.toggle(task.id);
        this.render();
      }
    });

    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      this.manager.remove(task.id);
      this.render();
    });

    li.appendChild(check);
    li.appendChild(titleEl);
    li.appendChild(delBtn);

    return li;
  }

  /** Set empty state messages based on current filter */
  _updateEmptyMessage() {
    const q = this.searchQuery.trim();
    if (q) {
      this.emptyTitle.textContent = 'No matching tasks';
      this.emptySub.textContent   = `No tasks match "${q}". Try a different keyword or clear search.`;
      return;
    }
    const messages = {
      all:       { title: 'No tasks yet',          sub: 'Add your first task above to get started.' },
      active:    { title: 'No active tasks',        sub: 'All tasks are marked complete. Great work! 🎉' },
      completed: { title: 'No completed tasks',     sub: 'Complete a task to see it here.' },
    };
    const msg = messages[this.filter];
    this.emptyTitle.textContent = msg.title;
    this.emptySub.textContent   = msg.sub;
  }
}

// ───────────────────────────────────────────────
// Entrypoint
// Decision: DOMContentLoaded to ensure DOM is ready
// before script execution (Copilot suggestion accepted)
// ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const manager = new TaskManager();
  const ui      = new UIController(manager);

  ui.bindEvents();
  ui.render();
  ui.taskInput.focus();
});
