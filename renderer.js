// renderer.js — Main Application Logic

(() => {
    'use strict';
  
    // --- 1. GLOBAL SETTINGS & STATE ---
    const APP_SETTINGS = {
        wsUrl: 'ws://localhost:81',
        mapping: {
            time: 'Time',
            h2: 'H2_raw',
            voltage: 'voltage_V',
            power: 'power_W',
            temp: 'process_temp_C',
            relay: 'relay_status'
        },
        alarms: { h2Max: 4.0, h2Enabled: true, tempMax: 1250, tempEnabled: false },
        playback: { speed: 1, loop: false }
    };
  
    // Load settings from LocalStorage
    const saved = localStorage.getItem('furnace_settings');
    if (saved) { 
        try { 
            const parsed = JSON.parse(saved);
            Object.assign(APP_SETTINGS, parsed);
        } catch (e) { console.error('Settings load error', e); }
    }
  
    function saveSettings() {
        localStorage.setItem('furnace_settings', JSON.stringify(APP_SETTINGS));
    }
  
    // --- Toast Notification Helper ---
    (function setupToast() {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed; right:20px; bottom:20px; z-index:9999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
      document.body.appendChild(wrap);
      
      window.toast = (msg, type = 'success') => {
        const t = document.createElement('div');
        t.innerText = msg;
        const color = type === 'error' ? '#ef4444' : '#3b82f6';
        t.style.cssText = `
            background: rgba(19, 22, 25, 0.95);
            color: #fff;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-size: 13px;
            font-weight: 500;
            border-left: 4px solid ${color};
            backdrop-filter: blur(4px);
            animation: fadeIn 0.3s ease-out;
        `;
        wrap.appendChild(t);
        
        if (!document.getElementById('toast-anim')) {
            const s = document.createElement('style');
            s.id = 'toast-anim';
            s.innerHTML = `@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`;
            document.head.appendChild(s);
        }

        setTimeout(() => {
            t.style.opacity = '0';
            setTimeout(() => t.remove(), 300);
        }, 3000);
      };
    })();
  
    /* ----------------------------
       Page Navigation System
       ---------------------------- */
    const contentDiv = document.querySelector('#main-content');
    const tabs = document.querySelectorAll('.tab');
    const pagesCache = {};
  
    async function loadPage(pageName) {
      tabs.forEach(t => t.classList.remove('active'));
      const activeBtn = document.querySelector(`.tab[data-page="${pageName}"]`);
      if (activeBtn) activeBtn.classList.add('active');
  
      if (!pagesCache[pageName]) {
        try {
          const htmlContent = await window.electronAPI.loadHtml(`${pageName}.html`);
          pagesCache[pageName] = htmlContent;
        } catch (err) {
          contentDiv.innerHTML = `<div style="padding:40px;color:red">Frontend Error: ${err.message}</div>`;
          return;
        }
      }
      contentDiv.innerHTML = pagesCache[pageName];
  
      if (pageName === 'monitor') window.initMonitorPage();
      if (pageName === 'options') window.initOptionsPage();
      if (pageName === 'home') window.initHomePage();
      if (pageName === 'about') window.initAboutPage();
    }
  
    tabs.forEach(btn => {
        btn.addEventListener('click', () => loadPage(btn.getAttribute('data-page')));
    });
    
    loadPage('home');
  
  
    /* ======================================================
       HOME PAGE LOGIC
       ====================================================== */
    window.initHomePage = function() {
        const btnStart = document.getElementById('btn-home-start');
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                document.querySelector('.tab[data-page="monitor"]')?.click();
            });
        }
        const btnLearn = document.getElementById('btn-home-learn');
        if (btnLearn) {
            btnLearn.addEventListener('click', () => {
                const el = document.getElementById('arch-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            });
        }
    };


    /* ======================================================
       MONITOR PAGE LOGIC
       ====================================================== */
    let chartEff = null, chartPower = null, ws = null, sampleInterval = null;
    let isPlayingSample = false; // Track status
    window.monitorData = [];
  
    window.initMonitorPage = function () {
      const ctxEff = document.getElementById('chart-eff')?.getContext('2d');
      const ctxPower = document.getElementById('chart-power')?.getContext('2d');
  
      const commonOpt = {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { grid: { color: '#2c3035' }, ticks: { color: '#6c757d' } } },
        elements: { point: { radius: 0 } }, 
        animation: false 
      };
  
      if (ctxEff) {
        chartEff = new Chart(ctxEff, {
          type: 'line',
          data: { labels: [], datasets: [{ label: 'Efficiency', data: [], borderColor: '#3b82f6', borderWidth: 2, tension: 0.2 }] },
          options: commonOpt
        });
      }
      if (ctxPower) {
        chartPower = new Chart(ctxPower, {
          type: 'line',
          data: { labels: [], datasets: [{ label: 'Power', data: [], borderColor: '#10b981', borderWidth: 2, tension: 0.2 }] },
          options: commonOpt
        });
      }
  
      if (window.monitorData.length > 0) {
        renderMonitorTable(window.monitorData);
        updateCharts(window.monitorData);
        updateStats(window.monitorData[window.monitorData.length - 1]);
      }
  
      // Update Badge if already running
      if(isPlayingSample) setStatus('Playing Sample', 'ready');

      const urlInput = document.getElementById('ws-url');
      if (urlInput) urlInput.value = APP_SETTINGS.wsUrl;
  
      document.getElementById('btn-connect-ws')?.addEventListener('click', () => {
        const url = document.getElementById('ws-url').value;
        if (!url) return window.toast('Enter URL', 'error');
        connectWS(url);
      });
  
      document.getElementById('btn-sample')?.addEventListener('click', runSampleData);
      
      document.getElementById('btn-stop-sample')?.addEventListener('click', () => {
        if (sampleInterval) clearInterval(sampleInterval);
        isPlayingSample = false;
        setStatus('Stopped', '');
      });
    };
  
    function setStatus(msg, type) {
      const el = document.getElementById('status');
      if(el) { el.innerText = msg; el.className = 'status-badge ' + (type || ''); }
    }
  
    function connectWS(url) {
      if (ws) ws.close();
      setStatus('Connecting...');
      try {
        ws = new WebSocket(url);
        ws.onopen = () => { setStatus('Connected', 'ready'); window.toast('Connected'); };
        ws.onmessage = (e) => { try { processIncoming(JSON.parse(e.data)); } catch(err){ console.warn('WS JSON Error'); } };
        ws.onerror = () => { setStatus('Error', 'error'); window.toast('Connect Failed', 'error'); };
        ws.onclose = () => { setStatus('Disconnected', ''); };
      } catch (e) { setStatus('Invalid URL', 'error'); }
    }
  
    // --- Playback with Dynamic Speed ---
    function runSampleData() {
        if (sampleInterval) clearInterval(sampleInterval);
        
        isPlayingSample = true;
        setStatus('Playing Sample', 'ready');
        
        // Use current speed
        const delay = 1000 / (APP_SETTINGS.playback.speed || 1);
        
        sampleInterval = setInterval(() => {
            const mock = {};
            const m = APP_SETTINGS.mapping;
            mock[m.time] = new Date().toLocaleTimeString();
            mock[m.h2] = (Math.random() * 5).toFixed(2);
            mock[m.voltage] = (220 + Math.random() * 5).toFixed(1);
            mock[m.power] = (500 + Math.random() * 500).toFixed(0);
            mock[m.temp] = (1150 + Math.random() * 100).toFixed(0);
            mock[m.relay] = Math.random() > 0.8 ? 'ON' : 'OFF';
            processIncoming(mock);
        }, delay);
    }
  
    function processIncoming(rawData) {
        const row = {};
        const map = APP_SETTINGS.mapping;
        row.time = rawData[map.time] || rawData.time || '';
        row.h2 = parseFloat(rawData[map.h2] || 0).toFixed(2);
        row.voltage = parseFloat(rawData[map.voltage] || 0).toFixed(1);
        row.power = parseFloat(rawData[map.power] || 0).toFixed(0);
        row.temp = parseFloat(rawData[map.temp] || 0).toFixed(0);
        row.relay = rawData[map.relay] || 'OFF';

        if (APP_SETTINGS.alarms.h2Enabled && parseFloat(row.h2) > APP_SETTINGS.alarms.h2Max) window.toast(`⚠️ H2 Alarm`, 'error');

        window.monitorData.push(row);
        if (window.monitorData.length > 200) window.monitorData.shift();
  
        if (document.getElementById('telemetry-table')) {
            renderMonitorTable(window.monitorData);
            updateCharts(window.monitorData);
            updateStats(row);
        }
    }
  
    window.renderMonitorTable = function (rows) {
      const tbody = document.querySelector('#telemetry-table tbody');
      if (!tbody) return;
      let html = '';
      const display = rows.slice().reverse();
      for (let r of display) {
        const eff = r.power > 0 ? (r.power / (r.temp||1)).toFixed(2) : '0.00';
        html += `<tr><td>${r.time}</td><td>${r.h2}%</td><td>${r.voltage}V</td><td>${eff}</td><td>${r.relay}</td></tr>`;
      }
      tbody.innerHTML = html;
    };
  
    function updateStats(last) {
       document.getElementById('stat-h2').innerText = last.h2 + '%';
       document.getElementById('stat-temp').innerText = last.temp + ' °C';
       document.getElementById('stat-power').innerText = last.power + ' W';
       const led = document.getElementById('ind-relay');
       if(led) { led.innerText = last.relay; led.className = String(last.relay).toUpperCase() === 'ON' ? 'led on' : 'led off'; }
    }
  
    function updateCharts(rows) {
        if (chartEff) {
            chartEff.data.labels = rows.map(r => r.time);
            chartEff.data.datasets[0].data = rows.map(r => (r.power / (r.temp||1)).toFixed(2));
            chartEff.update('none');
        }
        if (chartPower) {
            chartPower.data.labels = rows.map(r => r.time);
            chartPower.data.datasets[0].data = rows.map(r => r.power);
            chartPower.update('none');
        }
    }

    /* ======================================================
       OPTIONS PAGE LOGIC
       ====================================================== */
    window.initOptionsPage = function() {
        document.getElementById('opt-ws-url').value = APP_SETTINGS.wsUrl;
        document.getElementById('map-h2').value = APP_SETTINGS.mapping.h2;
        
        const slider = document.getElementById('opt-speed');
        const speedVal = document.getElementById('speed-val');
        if (slider) {
            slider.value = APP_SETTINGS.playback.speed;
            speedVal.innerText = slider.value + 'x';
        }

        // FIX: Restart running sample loop when slider moves
        slider?.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            APP_SETTINGS.playback.speed = newSpeed;
            speedVal.innerText = newSpeed + 'x';
            saveSettings();

            if (isPlayingSample) {
                runSampleData(); // Restart with new speed
            }
        });

        document.getElementById('btn-save-conn')?.addEventListener('click', () => {
            APP_SETTINGS.wsUrl = document.getElementById('opt-ws-url').value;
            saveSettings();
        });
        document.getElementById('btn-save-map')?.addEventListener('click', () => {
            APP_SETTINGS.mapping.h2 = document.getElementById('map-h2').value;
            saveSettings();
        });
    };
  
    /* ======================================================
       ABOUT PAGE LOGIC
       ====================================================== */
    window.initAboutPage = function() { console.log('About Init'); };
  
})();