let currentColumn = '';
let editingTaskId = null;

function openModal(columnId, task = null) {
  document.getElementById("task-modal").style.display = "flex";
  currentColumn = columnId;
  if (task) {
    editingTaskId = task.id;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.desc;
    document.getElementById("modal-title").textContent = "Edit Task";
  } else {
    editingTaskId = null;
    document.getElementById("task-title").value = '';
    document.getElementById("task-desc").value = '';
    document.getElementById("modal-title").textContent = "Add Task";
  }
}

function closeModal() {
  document.getElementById("task-modal").style.display = "none";
}

document.getElementById("save-card-btn").addEventListener("click", saveTask);

function saveTask() {
  const title = document.getElementById("task-title").value.trim();
  const desc = document.getElementById("task-desc").value.trim();
  if (!title || !desc) return alert("Please fill in both fields.");

  const column = document.getElementById(currentColumn);
  if (editingTaskId) {
    const taskEl = document.getElementById(editingTaskId);
    taskEl.querySelector("h4").textContent = title;
    taskEl.querySelector("p").textContent = desc;
    taskEl.dataset.title = title;
    taskEl.dataset.desc = desc;
  } else {
    const taskEl = document.createElement("div");
    const id = "task-" + Date.now();
    taskEl.id = id;
    taskEl.className = "task";
    taskEl.draggable = true;
    taskEl.dataset.title = title;
    taskEl.dataset.desc = desc;
    taskEl.ondragstart = drag;

    taskEl.innerHTML = `
      <h4>${title}</h4>
      <p>${desc}</p>
      <div class="task-actions">
        <button class="edit-btn" onclick="openModal('${currentColumn}', {id: '${id}', title: '${title}', desc: '${desc}'})"><i class="fas fa-pen"></i></button>
        <button class="delete-btn" onclick="deleteTask('${id}')"><i class="fas fa-trash"></i></button>
      </div>
    `;
    column.appendChild(taskEl);
  }
  closeModal();
  saveToStorage();
}

function deleteTask(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  saveToStorage();
}

function clearColumn(columnId) {
  const column = document.getElementById(columnId);
  [...column.querySelectorAll(".task")].forEach(t => t.remove());
  saveToStorage();
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  const id = event.dataTransfer.getData("text");
  const task = document.getElementById(id);
  const column = event.currentTarget;
  column.appendChild(task);
  saveToStorage();
}

function allowDrop(event) {
  event.preventDefault();
}

function saveToStorage() {
  const data = {};
  document.querySelectorAll(".column").forEach(col => {
    const tasks = [...col.querySelectorAll(".task")].map(task => ({
      id: task.id,
      title: task.dataset.title,
      desc: task.dataset.desc
    }));
    data[col.id] = tasks;
  });
  localStorage.setItem("trelloBoard", JSON.stringify(data));
}

function loadFromStorage() {
    const data = JSON.parse(localStorage.getItem("trelloBoard")) || {};
    Object.keys(data).forEach(columnId => {
      const column = document.getElementById(columnId);
      data[columnId].forEach(task => {
        const taskEl = document.createElement("div");
        taskEl.id = task.id;
        taskEl.className = "task";
        taskEl.draggable = true;
        taskEl.dataset.title = task.title;
        taskEl.dataset.desc = task.desc;
        taskEl.ondragstart = drag;
        taskEl.innerHTML = `
          <h4>${task.title}</h4>
          <p>${task.desc}</p>
          <div class="task-actions">
            <button class="edit-btn" onclick="openModal('${columnId}', {id: '${task.id}', title: '${task.title}', desc: '${task.desc}'})"><i class="fas fa-pen"></i></button>
            <button class="delete-btn" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
          </div>
        `;
        column.appendChild(taskEl);
      });
    });
  }


window.onload = loadFromStorage;
