(function () {
  'use strict';

  // ── Storage helpers ──────────────────────────────────────
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ── Printer Status ───────────────────────────────────────
  var STATUS_KEY = 'a1mini_status';
  var defaultStatus = {
    state: 'idle',
    nozzleTemp: 0,
    bedTemp: 0,
    printProgress: 0,
    printSpeed: 0,
    filament: 'PLA',
    totalHours: 0,
    totalPrints: 0
  };

  var status = load(STATUS_KEY, defaultStatus);

  function applyStatusToUI() {
    document.getElementById('state-select').value = status.state;
    document.getElementById('nozzle-temp').value = status.nozzleTemp;
    document.getElementById('bed-temp').value = status.bedTemp;
    document.getElementById('print-progress').value = status.printProgress;
    document.getElementById('print-speed').value = status.printSpeed;
    document.getElementById('filament-type').value = status.filament;
    document.getElementById('total-hours').value = status.totalHours;
    document.getElementById('total-prints').value = status.totalPrints;
    updateStatusDisplay();
  }

  function updateStatusDisplay() {
    var state = document.getElementById('state-select').value;
    var dot = document.querySelector('.status-dot');
    var text = document.getElementById('printer-state-text');

    dot.className = 'status-dot status-dot--' + state;

    var labels = {
      idle: 'Idle',
      printing: 'Tlaci',
      paused: 'Pozastavena',
      error: 'Chyba',
      offline: 'Offline'
    };
    text.textContent = labels[state] || state;

    // Progress bars
    var nozzle = parseInt(document.getElementById('nozzle-temp').value) || 0;
    var bed = parseInt(document.getElementById('bed-temp').value) || 0;
    var progress = parseInt(document.getElementById('print-progress').value) || 0;

    document.getElementById('nozzle-bar').style.width = Math.max(0, Math.min(100, (nozzle / 300) * 100)) + '%';
    document.getElementById('bed-bar').style.width = Math.max(0, Math.min(100, (bed / 80) * 100)) + '%';
    document.getElementById('progress-bar').style.width = Math.max(0, Math.min(100, progress)) + '%';
  }

  document.getElementById('state-select').addEventListener('change', updateStatusDisplay);
  document.getElementById('nozzle-temp').addEventListener('input', updateStatusDisplay);
  document.getElementById('bed-temp').addEventListener('input', updateStatusDisplay);
  document.getElementById('print-progress').addEventListener('input', updateStatusDisplay);

  document.getElementById('save-status-btn').addEventListener('click', function () {
    status = {
      state: document.getElementById('state-select').value,
      nozzleTemp: parseInt(document.getElementById('nozzle-temp').value) || 0,
      bedTemp: parseInt(document.getElementById('bed-temp').value) || 0,
      printProgress: parseInt(document.getElementById('print-progress').value) || 0,
      printSpeed: parseInt(document.getElementById('print-speed').value) || 0,
      filament: document.getElementById('filament-type').value,
      totalHours: parseFloat(document.getElementById('total-hours').value) || 0,
      totalPrints: parseInt(document.getElementById('total-prints').value) || 0
    };
    save(STATUS_KEY, status);
    showToast('Stav ulozeny');
  });

  applyStatusToUI();

  // ── Maintenance Log ──────────────────────────────────────
  var LOG_KEY = 'a1mini_log';
  var logs = load(LOG_KEY, []);

  function renderLogs() {
    var tbody = document.getElementById('log-tbody');
    var empty = document.getElementById('log-empty');

    if (logs.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    var typeLabels = {
      maintenance: 'Udrzba',
      repair: 'Oprava',
      upgrade: 'Vylepsenie',
      note: 'Poznamka'
    };

    tbody.innerHTML = logs.map(function (entry, i) {
      return '<tr>' +
        '<td style="white-space:nowrap">' + escapeHtml(entry.date) + '</td>' +
        '<td><span class="log-type-badge log-type-badge--' + entry.type + '">' + typeLabels[entry.type] + '</span></td>' +
        '<td>' + escapeHtml(entry.desc) + '</td>' +
        '<td><button class="log-delete-btn" data-index="' + i + '" title="Vymazat">&times;</button></td>' +
        '</tr>';
    }).join('');
  }

  document.getElementById('add-log-btn').addEventListener('click', function () {
    var date = document.getElementById('log-date').value;
    var type = document.getElementById('log-type').value;
    var desc = document.getElementById('log-desc').value.trim();

    if (!date || !desc) {
      showToast('Vyplnte datum a popis', 'warning');
      return;
    }

    logs.unshift({ date: date, type: type, desc: desc });
    save(LOG_KEY, logs);
    renderLogs();

    document.getElementById('log-desc').value = '';
    showToast('Zaznam pridany');
  });

  document.getElementById('log-tbody').addEventListener('click', function (e) {
    if (e.target.classList.contains('log-delete-btn')) {
      var idx = parseInt(e.target.dataset.index);
      logs.splice(idx, 1);
      save(LOG_KEY, logs);
      renderLogs();
      showToast('Zaznam vymazany');
    }
  });

  // Set default date to today
  var _today = new Date(); document.getElementById('log-date').value = _today.getFullYear() + '-' + String(_today.getMonth()+1).padStart(2,'0') + '-' + String(_today.getDate()).padStart(2,'0');
  renderLogs();

  // ── Maintenance Reminders ────────────────────────────────
  var REMINDERS_KEY = 'a1mini_reminders';

  var defaultReminders = [
    {
      id: 'lubricate-y-axis',
      title: 'Mazanie Y-osi',
      desc: 'Namaz lubrikacny olej na vodiacu listu Y-osi. Pouzite olej z prislusenstva (nie mazivo/grease). Odporucane: mesacne.',
      intervalDays: 30,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/maintenance/lubricate-y-axis'
    },
    {
      id: 'clean-hotend',
      title: 'Cistenie hotend zostavy',
      desc: 'Vycistite hotend, silikonovu ponozku a oblast trysky od zvyskov filamentu. Odporucane: kazde 2-4 tyzdne.',
      intervalDays: 21,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/maintenance/clean-hotend-assembly'
    },
    {
      id: 'clean-extruder',
      title: 'Cistenie extrudera',
      desc: 'Skontrolujte a vycistite ozubene kolieska extrudera od zvyskov prasku filamentu. Odporucane: kazdy mesiac.',
      intervalDays: 30,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/maintenance'
    },
    {
      id: 'check-belts',
      title: 'Kontrola remienkov',
      desc: 'Skontrolujte napnutie a stav remienkov X a Y osi. Hladajte opotrebenie alebo uvolnenie.',
      intervalDays: 90,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/maintenance'
    },
    {
      id: 'check-ptfe',
      title: 'Kontrola PTFE trubiciek',
      desc: 'Skontrolujte stav PTFE trubiciek (zmena farby, deformacia). Vymente ak su poskodene.',
      intervalDays: 90,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/maintenance'
    },
    {
      id: 'clean-buildplate',
      title: 'Cistenie podlozky',
      desc: 'Umyte PEI podlozku izopropylalkoholom (IPA) pre lepsiu adhezivitu. Odporucane: pred kazdou tlacou alebo minimalne tyzdenne.',
      intervalDays: 7,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/maintenance/period-maintenance'
    },
    {
      id: 'firmware-check',
      title: 'Kontrola firmware',
      desc: 'Skontrolujte ci je k dispozicii nova verzia firmware cez Bambu Studio alebo displej tlaciarny.',
      intervalDays: 30,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/manual'
    },
    {
      id: 'z-axis-leadscrew',
      title: 'Mazanie Z-osi (vodiaca skrutka)',
      desc: 'Naneste tenku vrstvu mazacieho tuku na vodiacu skrutku Z-osi. Odporucane: kazde 3 mesiace.',
      intervalDays: 90,
      lastDone: null,
      link: 'https://wiki.bambulab.com/en/a1-mini/maintenance'
    }
  ];

  var reminders = load(REMINDERS_KEY, defaultReminders);

  // Merge any new default reminders not present in saved data
  defaultReminders.forEach(function (dr) {
    var exists = reminders.some(function (r) { return r.id === dr.id; });
    if (!exists) reminders.push(dr);
  });

  function renderReminders() {
    var grid = document.getElementById('reminders-grid');
    var now = new Date();

    grid.innerHTML = reminders.map(function (r, i) {
      var dueStatus = '';
      var dueLabel = '';
      var lastLabel = 'Nikdy';

      if (r.lastDone) {
        var last = new Date(r.lastDone);
        lastLabel = formatDate(last);
        var nextDue = new Date(last.getTime() + r.intervalDays * 86400000);
        var daysLeft = Math.ceil((nextDue - now) / 86400000);

        if (daysLeft <= 0) {
          dueStatus = 'overdue';
          dueLabel = 'Po termíne (' + Math.abs(daysLeft) + ' d)';
        } else if (daysLeft <= 7) {
          dueStatus = 'soon';
          dueLabel = 'Za ' + daysLeft + ' dni';
        } else {
          dueStatus = 'ok';
          dueLabel = 'Za ' + daysLeft + ' dni';
        }
      } else {
        dueStatus = 'overdue';
        dueLabel = 'Nezbehla';
      }

      return '<div class="reminder-card">' +
        '<div class="reminder-card-header">' +
          '<span class="reminder-title">' + escapeHtml(r.title) + '</span>' +
          '<span class="reminder-interval">' + r.intervalDays + ' dni</span>' +
        '</div>' +
        '<div class="reminder-desc">' + escapeHtml(r.desc) +
          (r.link ? ' <a href="' + r.link + '" target="_blank" rel="noopener">Navod &rarr;</a>' : '') +
        '</div>' +
        '<div class="reminder-status">' +
          '<div>' +
            '<div class="reminder-last">Posledne: <strong>' + lastLabel + '</strong></div>' +
            '<span class="reminder-due reminder-due--' + dueStatus + '">' + dueLabel + '</span>' +
          '</div>' +
          '<button class="reminder-done-btn" data-index="' + i + '">Hotovo</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  document.getElementById('reminders-grid').addEventListener('click', function (e) {
    if (e.target.classList.contains('reminder-done-btn')) {
      var idx = parseInt(e.target.dataset.index);
      reminders[idx].lastDone = new Date().toISOString();
      save(REMINDERS_KEY, reminders);
      renderReminders();
      showToast('Pripomienka aktualizovana');
    }
  });

  renderReminders();

  // ── Toast notifications ──────────────────────────────────
  function showToast(msg, type) {
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'success');
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('toast--visible');
    });

    setTimeout(function () {
      toast.classList.remove('toast--visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2200);
  }

  // Add toast styles dynamically
  var style = document.createElement('style');
  style.textContent =
    '.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); ' +
    'background: var(--elevated); border: 1px solid var(--border); color: var(--text); ' +
    'font-family: "Space Mono", monospace; font-size: 0.75rem; letter-spacing: 0.5px; ' +
    'padding: 10px 20px; border-radius: 8px; z-index: 9999; opacity: 0; transition: opacity 0.3s, transform 0.3s; pointer-events:none; }' +
    '.toast--visible { opacity: 1; transform: translateX(-50%) translateY(0); }' +
    '.toast--success { border-color: var(--accent-border); color: var(--accent2); }' +
    '.toast--warning { border-color: rgba(251,191,36,0.3); color: var(--warning); }';
  document.head.appendChild(style);

  // ── Helpers ──────────────────────────────────────────────
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(d) {
    return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
  }

})();
