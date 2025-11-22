const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Get App Version
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  
  // Load HTML content safely (Replaces fetch)
  loadHtml: (fileName) => ipcRenderer.invoke("app:load-html", fileName),
  
  // Simple ping
  ping: () => "pong"
});