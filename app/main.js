const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

const TASKS_FILE = 'tasks.json';
let mainWindow;
let isQuitting = false;

const getTasksPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, TASKS_FILE);
};

const readTasks = () => {
  const tasksPath = getTasksPath();
  try {
    if (!fs.existsSync(tasksPath)) {
      return [];
    }
    const raw = fs.readFileSync(tasksPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read tasks', error);
    return [];
  }
};

const writeTasks = (tasks) => {
  const tasksPath = getTasksPath();
  try {
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Failed to write tasks', error);
  }
};

const ensureAutoStart = () => {
  if (process.platform === 'darwin' || process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
    });
    return;
  }

  if (process.platform === 'linux') {
    const autostartDir = path.join(app.getPath('home'), '.config', 'autostart');
    const desktopPath = path.join(autostartDir, 'daily-task-keeper.desktop');
    const execPath = process.execPath;

    try {
      fs.mkdirSync(autostartDir, { recursive: true });
      const desktopEntry = `[Desktop Entry]\nType=Application\nName=Daily Task Keeper\nExec=${execPath}\nX-GNOME-Autostart-enabled=true\n`;
      fs.writeFileSync(desktopPath, desktopEntry);
    } catch (error) {
      console.error('Failed to set Linux autostart entry', error);
    }
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 640,
    minWidth: 360,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

app.whenReady().then(() => {
  nativeTheme.themeSource = 'light';
  createWindow();
  ensureAutoStart();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

ipcMain.handle('tasks:load', () => {
  const tasks = readTasks();
  return tasks.filter((task) => task.completed === false);
});

ipcMain.handle('tasks:add', (_, text) => {
  const tasks = readTasks();
  const now = new Date().toISOString();
  const newTask = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    date_created: now,
    date_completed: null,
    completed: false,
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
});

ipcMain.handle('tasks:toggle', (_, id, completed) => {
  const tasks = readTasks();
  const now = new Date().toISOString();
  const updated = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }
    return {
      ...task,
      completed,
      date_completed: completed ? now : null,
    };
  });
  writeTasks(updated);
  return updated.filter((task) => task.completed === false);
});
