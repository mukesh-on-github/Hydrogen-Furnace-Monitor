Hydrogen Furnace Monitor<p align="center"><img src="asset/images/logo-64.png" alt="App Logo" width="100"><b>Real-time Telemetry & Analytics for Green Metallurgy</b><i>Developed by Bytezapy</i></p>📖 OverviewThe Hydrogen Furnace Monitor is a unified desktop application designed to track, visualize, and analyze the performance of hydrogen-based DRI (Direct Reduced Iron) furnaces.It bridges the gap between complex industrial hardware (IoT sensors/ESP32) and user-friendly software, providing engineers and researchers with a single interface to monitor Hydrogen Concentration, Temperature Stability, Power Efficiency, and Relay Status.✨ Key Features📡 Live Streaming: Connect directly to ESP32 sensors via WebSocket for real-time data visualization.📂 Data Playback: Import .csv or .xlsx logs to replay past experiments with adjustable speed controls.📊 Smart Visualization: Live charts for Efficiency and Power consumption, plus a spreadsheet-style telemetry table.⚙️ Custom Mapping: Map any dataset column names (e.g., temp_c, h2_sens) to the app's internal logic without changing code.🔔 Safety Alarms: Configurable thresholds for H₂ concentration and Temperature to trigger visual and toast alerts.📦 Portable: Built on Electron to run natively on Windows as a standalone executable.🛠️ Tech StackFramework: Electron (Node.js + Chromium)Frontend: HTML5, CSS3 (Bento Grid Design), Vanilla JavaScriptVisualization: Chart.js (Real-time graphing)Data Handling: SheetJS (xlsx) (Excel file parsing)Build Tool: electron-builder🚀 Installation & SetupPrerequisitesNode.js (v16 or higher recommended)npm (comes with Node.js)1. Clone the Repositorygit clone [https://github.com/your-username/hydrogen-furnace-monitor.git](https://github.com/your-username/hydrogen-furnace-monitor.git)
cd hydrogen-furnace-monitor
2. Install DependenciesInstall the required packages (Electron, Chart.js, etc.).npm install
3. Run in Development ModeThis starts the app with hot-reloading enabled.npm start
📦 Building the Executable (.exe)To create a distributable Windows installer for sharing:Ensure you have run npm install.Run the build script:npm run build
The installer (Hydrogen Furnace Monitor Setup 1.0.0.exe) will be generated in the dist/ folder.📖 User Guide🏠 Home PageView the project mission and system architecture.Click "Launch Monitor" to start the dashboard.🖥️ Monitor DashboardLeft Panel: * Connection: Enter your ESP32 WebSocket URL (e.g., ws://192.168.1.10:81) and click Connect.Status: View system readiness and active alarms.Center Panel: * Telemetry Table: View raw data rows coming in live.Right Panel: * Graphs: Watch the Efficiency and Power trends evolve in real-time.⚙️ Options PageColumn Mapping: If your CSV file has headers like Temp_Sensor_1 instead of process_temp_C, map them here so the app understands your data.Alarms: Enable/Disable safety warnings for high H₂ or Temperature levels.Playback Speed: Control how fast sample data is replayed (1x to 10x).📂 Project StructureHydrogen-Furnace-Monitor/
├── asset/                  # Static assets (images, fonts, icons)
├── dist/                   # Output folder for built .exe files
├── renderer/               # Frontend Source Code
│   ├── index.html          # Main container
│   ├── home.html           # Landing page content
│   ├── monitor.html        # Dashboard layout
│   ├── options.html        # Settings layout
│   ├── about.html          # Team info
│   ├── styles.css          # Global styling
│   └── renderer.js         # Frontend logic (Charts, Routing, WebSocket)
├── main.js                 # Electron Main Process (System operations)
├── preload.js              # Secure bridge between Frontend & Backend
└── package.json            # Project configuration & dependencies
👥 The TeamBytezapy Development TeamMukesh Pandey: Founder & Developer (Industrial IoT & Automation)Raj Kartik Singh: Co-Founder & Architect (System Design)📄 LicenseThis project is licensed under the MIT License - see the LICENSE file for details.
