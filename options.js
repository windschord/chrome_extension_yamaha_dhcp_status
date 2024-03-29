window.onload = init

document.getElementById('close_btn').addEventListener('click', save)

function init() {
  chrome.storage.sync.get(['target', 'prefix', 'baseUrl', 'username', 'password'], function (data) {
    document.getElementById('target').value = data.target ? data.target : 'rtx1210';
    document.getElementById('prefix').value = data.prefix ? data.prefix : 'http';
    document.getElementById('baseUrl').value = data.baseUrl ? data.baseUrl : '192.168.0.1';
    document.getElementById('username').value = data.username ? data.username : '';
    document.getElementById('password').value = data.password ? data.password : '';
  });
}

function save() {
  document.getElementById('result').textContent = ""
  chrome.storage.sync.set({
    target: document.getElementById('target').value,
    prefix: document.getElementById('prefix').value,
    baseUrl: document.getElementById('baseUrl').value,
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
  });
  document.getElementById('result').textContent = "saved"
}