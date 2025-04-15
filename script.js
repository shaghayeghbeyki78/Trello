const addTaskBtns = document.querySelectorAll('.add-task-btn');
const clearBtns = document.querySelectorAll('.clear-tasks-btn');
const modal = document.querySelector('.modal');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const saveBtn = document.getElementById('save-task');
const cancelBtn = document.getElementById('cancel-task');

let editingTask = null;
let currentColumn = null;

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

  const tasks = getTasks();
  tasks.forEach(task => {
    const column = document.querySelector(`.column[data-status="${task.status}"] .task-list`);
    if (column) {
      column.appendChild(createTaskCard(task));
    }
  });
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.classList.add('task');
  card.setAttribute('draggable', 'true');
  card.dataset.id = task.id;

  card.innerHTML = `
    <h4>${task.title}</h4>
    <p>${task.desc}</p>
    <div class="task-actions">
      <i class="fas fa-edit"></i>
      <i class="fas fa-trash-alt red"></i>
    </div>
  `;

  // Drag events
  card.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', task.id);
  });

  // Edit
  card.querySelector('.fa-edit').addEventListener('click', () => {
    editingTask = task;
    titleInput.value = task.title;
    descInput.value = task.desc;
    modal.style.display = 'flex';
  });

  // Delete
  card.querySelector('.fa-trash-alt').addEventListener('click', () => {
    let tasks = getTasks().filter(t => t.id !== task.id);
    saveTasks(tasks);
    renderTasks();
  });

  return card;
}

// Add task button
addTaskBtns.forEach(btn => {
  btn.addEventListener('click', e => {
    currentColumn = e.target.closest('.column').dataset.status;
    editingTask = null;
    titleInput.value = '';
    descInput.value = '';
    modal.style.display = 'flex';
  });
});

// Save task
saveBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();

  if (!title || !desc) return alert('Title and Description are required');

  let tasks = getTasks();

  if (editingTask) {
    tasks = tasks.map(t => t.id === editingTask.id ? { ...t, title, desc } : t);
  } else {
    tasks.push({
      id: Date.now().toString(),
      title,
      desc,
      status: currentColumn,
    });
  }

  saveTasks(tasks);
  modal.style.display = 'none';
  renderTasks();
});

// Cancel modal
cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Clear tasks per column
clearBtns.forEach(btn => {
  btn.addEventListener('click', e => {
    const status = e.target.closest('.column').dataset.status;
    let tasks = getTasks().filter(t => t.status !== status);
    saveTasks(tasks);
    renderTasks();
  });
});

// Drag & Drop
document.querySelectorAll('.task-list').forEach(list => {
  list.addEventListener('dragover', e => e.preventDefault());

  list.addEventListener('drop', e => {
    const id = e.dataTransfer.getData('text/plain');
    const tasks = getTasks().map(t =>
      t.id === id ? { ...t, status: list.closest('.column').dataset.status } : t
    );
    saveTasks(tasks);
    renderTasks();
  });
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
});
