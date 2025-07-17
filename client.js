const key = 'supersecretkey';
const socket = io({ auth: { key } });

const nameInput = document.getElementById('name');
const msgInput = document.getElementById('msg');
const messages = document.getElementById('messages');
const notifToggle = document.getElementById('notifToggle');
const saveToggle = document.getElementById('saveToggle');
const fileInput = document.getElementById('fileInput');

let nameLocked = false;
let chatHistory = [];

if (localStorage.getItem('savedChat')) {
  chatHistory = JSON.parse(localStorage.getItem('savedChat'));
  chatHistory.forEach(msg => addMessage(msg));
}

socket.on('chat message', data => {
  addMessage(data);
  if (saveToggle.checked) saveChat();
  if (notifToggle.checked && document.hidden) {
    new Notification(`${data.name}: ${data.text}`);
  }
});

function send() {
  const name = nameInput.value.trim();
  const text = msgInput.value.trim();
  if (!name || !text) return;

  const message = { name, text };
  socket.emit('chat message', message);
  msgInput.value = '';

  if (!nameLocked) {
    nameInput.disabled = true;
    nameLocked = true;
  }
}

function addMessage(msg) {
  const li = document.createElement('li');
  li.textContent = `${msg.name}: ${msg.text}`;
  messages.appendChild(li);
}

function saveChat() {
  const all = Array.from(messages.children).map(li => {
    const [name, ...rest] = li.textContent.split(': ');
    return { name, text: rest.join(': ') };
  });
  localStorage.setItem('savedChat', JSON.stringify(all));
}

notifToggle.addEventListener('change', () => {
  if (notifToggle.checked && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload', {
    method: 'POST',
    headers: { 'x-api-key': key },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      const fileMsg = { name: nameInput.value.trim(), text: `Uploaded: ${data.originalname}` };
      socket.emit('chat message', fileMsg);
    });
});
