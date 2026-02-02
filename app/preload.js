const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('taskApi', {
  loadTasks: () => ipcRenderer.invoke('tasks:load'),
  addTask: (text) => ipcRenderer.invoke('tasks:add', text),
  toggleTask: (id, completed) => ipcRenderer.invoke('tasks:toggle', id, completed),
});
