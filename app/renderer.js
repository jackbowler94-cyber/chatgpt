const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-task');
const todayLabel = document.getElementById('today');

const formatToday = () => {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

todayLabel.textContent = formatToday();

const renderTasks = (tasks) => {
  taskList.innerHTML = '';
  if (!tasks.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No open tasks. Add one for today.';
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-item';

    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', async () => {
      const updated = await window.taskApi.toggleTask(task.id, checkbox.checked);
      renderTasks(updated);
    });

    const text = document.createElement('span');
    text.textContent = task.text;
    if (task.completed) {
      text.classList.add('completed');
    }

    const meta = document.createElement('small');
    meta.textContent = new Date(task.date_created).toLocaleDateString();

    label.appendChild(checkbox);
    label.appendChild(text);
    item.appendChild(label);
    item.appendChild(meta);
    taskList.appendChild(item);
  });
};

const addTask = async () => {
  const text = taskInput.value.trim();
  if (!text) {
    return;
  }
  await window.taskApi.addTask(text);
  const tasks = await window.taskApi.loadTasks();
  renderTasks(tasks);
  taskInput.value = '';
  taskInput.focus();
};

addButton.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});

window.taskApi.loadTasks().then(renderTasks);
