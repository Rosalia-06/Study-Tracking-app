const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const darkToggle = document.getElementById('darkToggle');
const calendar = document.getElementById('calendar');
const greeting = document.getElementById('greeting');
const monthSelector = document.getElementById('monthSelector');

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
  populateMonthSelector();
  showGreeting(savedTasks);
  generateCalendar(savedTasks);
  showReminder(savedTasks);
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
    <span class="taskText">${subject} - ${chapter} (${date})</span>
    <button class="editBtn">✏️ Edit</button>
    <button class="deleteBtn">❌ Delete</button>
  `;

  li.querySelector('.checkTask').addEventListener('change', () => {
    li.classList.toggle('done');
    updateProgress();
  });

  li.querySelector('.deleteBtn').addEventListener('click', () => {
    li.remove();
    updateProgress();
    updateLocalStorage();
    generateCalendar(JSON.parse(localStorage.getItem('tasks')) || []);
  });

  li.querySelector('.editBtn').addEventListener('click', () => {
    const newText = prompt("Edit your task:", li.querySelector('.taskText').textContent);
    if (newText) {
      li.querySelector('.taskText').textContent = newText;
      updateLocalStorage();
      generateCalendar(JSON.parse(localStorage.getItem('tasks')) || []);
    }
  });

  taskList.appendChild(li);
  updateProgress();

  if (save) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ subject, chapter, date });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    populateMonthSelector();
    showGreeting(tasks);
    generateCalendar(tasks);
    showReminder(tasks);
  }
}

function updateProgress() {
  const tasks = document.querySelectorAll('#taskList li');
  const completed = document.querySelectorAll('#taskList li.done');
  const percent = tasks.length ? (completed.length / tasks.length) * 100 : 0;
  progressBar.value = percent;
}

function updateLocalStorage() {
  const updatedTasks = [];
  document.querySelectorAll('#taskList li').forEach(li => {
    const text = li.querySelector('.taskText').textContent;
    const match = text.match(/(.+?) - (.+?) \((\d{4}-\d{2}-\d{2})\)/);
    if (match) {
      updatedTasks.push({
        subject: match[1],
        chapter: match[2],
        date: match[3]
      });
    }
  });
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function showGreeting(tasks) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hour = now.getHours();
  const minute = now.getMinutes().toString().padStart(2, '0');
  const todayTasks = tasks.filter(t => t.date === dateStr);
  const taskMsg = todayTasks.length ? `Ab apko ${todayTasks[0].subject} start karna hai.` : `Aaj koi task set nahi hai. Chill maaro 😌`;
  greeting.textContent = `Hi Vanshika, aaj ${now.toLocaleDateString('en-IN')} hai aur ${hour}:${minute} ho rahe hain. ${taskMsg}`;
}

function showReminder(tasks) {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  if (todayTasks.length) {
    alert(`Reminder: Aaj ka task hai — ${todayTasks[0].subject}: ${todayTasks[0].chapter}`);
  }
}

function populateMonthSelector() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  monthSelector.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const option = document.createElement('option');
    const date = new Date(currentYear, i);
    option.value = i;
    option.textContent = date.toLocaleString('default', { month: 'long' });
    if (i === currentMonth) option.selected = true;
    monthSelector.appendChild(option);
  }
}

  monthSelector.addEventListener('change', () => {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  generateCalendar(tasks);
});

function generateCalendar(tasks = []) {
  const selectedMonth = parseInt(monthSelector.value);
  const today = new Date();
  const year = today.getFullYear();
  const firstDay = new Date(year, selectedMonth, 1).getDay();
  const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();

  calendar.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.classList.add('day');
    day.innerHTML = `<div class="date">${i}</div>`;

    const dayStr = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
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