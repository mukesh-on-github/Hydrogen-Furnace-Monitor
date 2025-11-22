# Hydrogen Furnace Monitor (Greenvolution Challenge)

## Overview
Desktop monitor app with Live (ESP32) and Sample modes.  
UI pages in `renderer/pages/`, main process in `main/`, assets in `asset/`.

## Quick start
1. `npm install`  
2. `npm run start` — run in dev  
3. `npm run dist` — build installer (requires electron-builder)

## Folder layout
- `main/` — Electron main & IPC handlers  
- `renderer/` — HTML / JS pages and styles  
- `asset/` — images, fonts, sample data, scripts, styles  
- `package.json` — scripts & build config

## Assets
- Put icons in `asset/images/` (logo-256.png, logo-128.png, tray-icon-32.png, tray-icon-16.png)  
- Sample data: `asset/data/sample_data.csv` or `.json` or `.xlsx`

## Notes
- Serial comms use `serialport`. For ESP32 via USB you may need to rebuild native modules.
- Settings persisted with `electron-store`.
