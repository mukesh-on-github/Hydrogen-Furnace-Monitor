Hydrogen Furnace Monitor

<p align="center">
<img src="logo-256.png" alt="App Logo" width="100">





<b>Real-time Telemetry & Analytics for Green Metallurgy</b>





<i>Developed by Bytezapy</i>
</p>

📖 Overview

The Hydrogen Furnace Monitor is a unified desktop application designed to track, visualize, and analyze the performance of hydrogen-based DRI (Direct Reduced Iron) furnaces.

It bridges the gap between complex industrial hardware (IoT sensors/ESP32) and user-friendly software, providing engineers and researchers with a single interface to monitor Hydrogen Concentration, Temperature Stability, Power Efficiency, and Relay Status.

✨ Key Features

📡 Live Streaming: Connect directly to ESP32 sensors via WebSocket (ws://...) or USB Serial for real-time visualization.

📂 Data Playback: Import .csv or .xlsx logs to replay past experiments with adjustable speed controls.

📊 Smart Visualization: Live charts for Efficiency and Power consumption, plus a spreadsheet-style telemetry table.

⚙️ Custom Mapping: Map any dataset column names (e.g., temp_c, h2_sens) to the app's internal logic without changing code.

🔔 Safety Alarms: Configurable thresholds for H₂ concentration and Temperature that trigger visual alerts.

📦 Portable: Built on Electron to run natively on Windows as a standalone executable.

🛠️ Tech Stack

Framework: Electron (Node.js + Chromium)

Frontend: HTML5, CSS3 (Bento Grid Design), Vanilla JavaScript

Visualization: Chart.js (Real-time graphing)

Data Handling: SheetJS (xlsx) (Excel file parsing)

Build Tool: electron-builder

🚀 Installation & Setup

Prerequisites

Node.js (v16 or higher recommended)

npm (comes with Node.js)

1. Clone the Repository
