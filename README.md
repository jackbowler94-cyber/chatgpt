# Daily Task Keeper

A lightweight desktop app that keeps daily tasks visible until you complete them. Incomplete tasks roll over automatically each day.

## Setup

```bash
cd app
npm install
npm start
```

## Features

- Add tasks with a quick input.
- Mark tasks complete with a checkbox (completed tasks are hidden).
- Persistent storage with task metadata: `date_created`, `date_completed`, and `completed`.
- Incomplete tasks from previous dates roll over into today automatically.

## Autostart on Login

The app attempts to register itself for auto-start on launch.

- **macOS**: Uses Electron's `app.setLoginItemSettings` to open at login.
- **Windows**: Uses Electron's `app.setLoginItemSettings` to open at login.
- **Linux**: Writes a `daily-task-keeper.desktop` entry into `~/.config/autostart`.

If you need to disable autostart, remove the entry via your OS login settings or delete the Linux `.desktop` file.

## Notes

- The app stays running when you close the window (it hides instead of quitting).
- Task data is stored in Electron's `userData` directory as `tasks.json`.
