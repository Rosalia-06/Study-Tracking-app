const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const darkToggle = document.getElementById('darkToggle');
const calendar = document.getElementById('calendar');

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
}

// Toggle dark mode
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled' : 'disabled');
});

// Load tasks from localStorage
window.addEventListener('load', () => {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => addTask(task.subject, task.chapter, task.date, false));
  updateProgress();
  generateCalendar(savedTasks);
});

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const subject = document.getElementById('subject').value;
  const chapter = document.getElementById('chapter').value;
  const date = document.getElementById('taskDate').value;

  addTask(subject, chapter, date, true);
  form.reset();
});

function addTask(subject, chapter, date, save) {
  const li = document.createElement('li');
  li.innerHTML = `
    <input type="checkbox" class="checkTask" />
    <span>${subject} - ${chapter} (${date})</span>
  `;

  li.querySelector('.checkTask').addEventListener('change', () => {
    li.classList.toggle('done');
    updateProgress();
  });

  taskList.appendChild(li);
  updateProgress();

  if (save) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ subject, chapter, date });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    generateCalendar(tasks);
  }
}

function updateProgress() {
  const tasks = document.querySelectorAll('#taskList li');
  const completed = document.querySelectorAll('#taskList li.done');
  const percent = tasks.length ? (completed.length / tasks.length) * 100 : 0;
  progressBar.value = percent;
}

function generateCalendar(tasks = []) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendar.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.classList.add('day');
    day.innerHTML = `<div class="date">${i}</div>`;

    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    tasks.forEach(task => {
      if (task.date === dayStr) {
        const taskEl = document.createElement('div');
        taskEl.classList.add('task');
        taskEl.textContent = `${task.subject}: ${task.chapter}`;
        day.appendChild(taskEl);
      }
    });

    calendar.appendChild(day);
  }
}