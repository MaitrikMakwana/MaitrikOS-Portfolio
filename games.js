/* MaitrikOS -- Arcade: Neon Highway (lane runner) + Hex Rush (typing) */
'use strict';

var MiniGames = {
  _bound: false,
  current: 'highway',

  onOpen: function () {
    this.ensureInit();
    if (this.current === 'highway') this.highway.focusCanvas();
  },

  ensureInit: function () {
    if (this._bound) return;
    this._bound = true;
    var self = this;
    var tabs = document.querySelectorAll('[data-arcade-tab]');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        self.switchTo(this.getAttribute('data-arcade-tab'));
      });
    }
    this.highway.init();
    this.hexrush.init();
  },

  switchTo: function (name) {
    if (!name) return;
    this.current = name;
    var tabs = document.querySelectorAll('[data-arcade-tab]');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      t.classList.toggle('arcade-tab-active', t.getAttribute('data-arcade-tab') === name);
    }
    var panels = document.querySelectorAll('[data-arcade-panel]');
    for (var j = 0; j < panels.length; j++) {
      var p = panels[j];
      p.style.display = p.getAttribute('data-arcade-panel') === name ? 'flex' : 'none';
    }
    this.highway.pause();
    this.hexrush.pause();
    if (name === 'highway') this.highway.focusCanvas();
    if (name === 'hexrush') {
      var inp = document.getElementById('hexrush-input');
      if (inp) setTimeout(function () { inp.focus(); }, 80);
    }
  },

  /* ---- NEON HIGHWAY: 3-lane dodge ---- */
  highway: {
    canvas: null,
    ctx: null,
    raf: null,
    running: false,
    lane: 1,
    score: 0,
    best: 0,
    obstacles: [],
    lastSpawn: 0,
    spawnEvery: 1100,
    baseSpeed: 3.2,
    W: 300,
    H: 420,
    LANES: 3,

    init: function () {
      this.canvas = document.getElementById('highway-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      var self = this;
      try {
        var b = localStorage.getItem('mk_highway_best');
        if (b) {
          this.best = parseInt(b, 10) || 0;
          var el = document.getElementById('highway-best');
          if (el) el.textContent = String(this.best);
        }
      } catch (e) {}
      var st = document.getElementById('highway-start');
      if (st) st.addEventListener('click', function () { self.start(); });
      var L = document.getElementById('highway-left');
      var R = document.getElementById('highway-right');
      if (L) L.addEventListener('click', function () { self.nudge(-1); });
      if (R) R.addEventListener('click', function () { self.nudge(1); });
      window.addEventListener('keydown', function (e) {
        if (MiniGames.current !== 'highway' || !self.running) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          self.nudge(-1);
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          self.nudge(1);
        }
      }, true);
      this.drawStatic();
    },

    focusCanvas: function () {
      if (this.canvas) this.canvas.focus();
    },

    nudge: function (d) {
      this.lane = Math.max(0, Math.min(this.LANES - 1, this.lane + d));
    },

    laneCenterX: function (lane) {
      var lw = this.W / this.LANES;
      return lane * lw + lw / 2;
    },

    pause: function () {
      this.running = false;
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    },

    start: function () {
      this.pause();
      this.running = true;
      this.lane = 1;
      this.score = 0;
      this.obstacles = [];
      this.lastSpawn = performance.now();
      this.spawnEvery = 1100;
      var se = document.getElementById('highway-score');
      if (se) se.textContent = '0';
      var self = this;
      function loop() {
        if (!self.running) return;
        self.step();
        self.raf = requestAnimationFrame(loop);
      }
      this.raf = requestAnimationFrame(loop);
    },

    step: function () {
      var now = performance.now();
      var sp = this.baseSpeed + this.score * 0.04;

      if (now - this.lastSpawn > this.spawnEvery) {
        this.obstacles.push({
          lane: Math.floor(Math.random() * this.LANES),
          y: -50,
          h: 36 + Math.random() * 14
        });
        this.lastSpawn = now;
        this.spawnEvery = Math.max(380, 1100 - this.score * 12);
      }

      var carY = this.H - 52;
      var carH = 44;
      var i;
      for (i = 0; i < this.obstacles.length; i++) {
        this.obstacles[i].y += sp;
      }

      for (i = this.obstacles.length - 1; i >= 0; i--) {
        var o = this.obstacles[i];
        if (o.y > this.H + 40) {
          this.obstacles.splice(i, 1);
          this.score++;
          var sx = document.getElementById('highway-score');
          if (sx) sx.textContent = String(this.score);
          if (this.score > this.best) {
            this.best = this.score;
            try {
              localStorage.setItem('mk_highway_best', String(this.best));
            } catch (e) {}
            var be = document.getElementById('highway-best');
            if (be) be.textContent = String(this.best);
          }
          continue;
        }
        if (o.lane === this.lane && o.y + o.h > carY && o.y < carY + carH) {
          this.crash();
          return;
        }
      }

      this.drawFrame(carY, carH);
    },

    crash: function () {
      this.pause();
      if (typeof Notif !== 'undefined') {
        Notif.show('Neon Highway', 'Collision — score: ' + this.score, '🏎️');
      }
      this.drawStatic();
    },

    drawStatic: function () {
      if (!this.ctx) return;
      var ctx = this.ctx;
      ctx.fillStyle = '#060b10';
      ctx.fillRect(0, 0, this.W, this.H);
      var lw = this.W / this.LANES;
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lw, 0);
      ctx.lineTo(lw, this.H);
      ctx.moveTo(lw * 2, 0);
      ctx.lineTo(lw * 2, this.H);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 230, 118, 0.08)';
      ctx.font = '13px JetBrains Mono, monospace';
      ctx.fillText('START', this.W / 2 - 28, this.H / 2);
    },

    drawFrame: function (carY, carH) {
      if (!this.ctx) return;
      var ctx = this.ctx;
      ctx.fillStyle = '#060b10';
      ctx.fillRect(0, 0, this.W, this.H);
      var lw = this.W / this.LANES;
      var g;
      for (g = 1; g < this.LANES; g++) {
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.2)';
        ctx.setLineDash([10, 14]);
        ctx.beginPath();
        ctx.moveTo(g * lw, 0);
        ctx.lineTo(g * lw, this.H);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      for (var i = 0; i < this.obstacles.length; i++) {
        var o = this.obstacles[i];
        var ox = this.laneCenterX(o.lane) - 28;
        ctx.fillStyle = 'rgba(255, 80, 80, 0.9)';
        ctx.shadowColor = 'rgba(255,60,60,0.5)';
        ctx.shadowBlur = 12;
        ctx.fillRect(ox, o.y, 56, o.h);
        ctx.shadowBlur = 0;
      }
      var cx = this.laneCenterX(this.lane);
      ctx.fillStyle = '#00e676';
      ctx.shadowColor = 'rgba(0, 230, 118, 0.6)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(cx, carY);
      ctx.lineTo(cx - 22, carY + carH);
      ctx.lineTo(cx + 22, carY + carH);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(cx - 10, carY + 8, 20, 12);
    }
  },

  /* ---- HEX RUSH: type the payload before time runs out ---- */
  hexrush: {
    words: [
      '0xDEAD', '0xBEEF', 'SHA-256', 'TLS1.3', 'JWT', 'CVE-2024', 'nmap -sV',
      'BurpSuite', 'Metasploit', 'Wireshark', 'iptables', 'AES-256', 'RSA-4096',
      'sudo -i', '/etc/passwd', 'chmod 755', 'grep -r', 'IPv6', 'UDP/53',
      'SSH-22', 'HTTPS', 'OAuth2', 'XSS', 'SQLi', 'CSRF', 'Docker', 'kubectl',
      'PyGuard', 'CHARUSAT', 'CyBrief'
    ],
    active: false,
    target: '',
    deadline: 0,
    raf: null,
    score: 0,
    streak: 0,
    timeMs: 4500,

    init: function () {
      var self = this;
      var btn = document.getElementById('hexrush-start');
      var inp = document.getElementById('hexrush-input');
      if (btn) btn.addEventListener('click', function () { self.start(); });
      if (inp) {
        inp.addEventListener('input', function () { self.checkInput(); });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            self.checkInput(true);
          }
        });
      }
    },

    pause: function () {
      this.active = false;
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    },

    pickWord: function () {
      var w = this.words[Math.floor(Math.random() * this.words.length)];
      if (w === this.target && this.words.length > 1) return this.pickWord();
      return w;
    },

    start: function () {
      this.pause();
      this.score = 0;
      this.streak = 0;
      this.timeMs = 4500;
      var inp = document.getElementById('hexrush-input');
      if (inp) inp.value = '';
      this.updateHud();
      this.nextRound();
    },

    nextRound: function () {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
      var self = this;
      this.target = this.pickWord();
      this.deadline = performance.now() + this.timeMs;
      this.active = true;
      var bar = document.getElementById('hexrush-bar');
      if (bar) bar.style.width = '100%';
      var disp = document.getElementById('hexrush-display');
      if (disp) {
        disp.innerHTML = '<span class="hexrush-target">' + this.escapeHtml(this.target) + '</span>';
      }
      var inp = document.getElementById('hexrush-input');
      if (inp) {
        inp.value = '';
        inp.focus();
      }
      function tick() {
        if (!self.active) return;
        var left = self.deadline - performance.now();
        var bar = document.getElementById('hexrush-bar');
        if (bar) bar.style.width = Math.max(0, (left / self.timeMs) * 100) + '%';
        if (left <= 0) {
          self.fail('Time expired');
          return;
        }
        self.raf = requestAnimationFrame(tick);
      }
      this.raf = requestAnimationFrame(tick);
    },

    escapeHtml: function (s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },

    checkInput: function (force) {
      if (!this.active) return;
      var inp = document.getElementById('hexrush-input');
      if (!inp) return;
      var v = inp.value.trim();
      var t = this.target;
      if (v.toLowerCase() !== t.toLowerCase()) {
        if (force && v.length > 0) this.fail('Wrong payload');
        return;
      }
      this.score++;
      this.streak++;
      this.timeMs = Math.max(1800, 4500 - this.streak * 120);
      this.updateHud();
      if (typeof Notif !== 'undefined' && this.streak > 0 && this.streak % 5 === 0) {
        Notif.show('Hex Rush', 'Streak x' + this.streak + '!', '⚡');
      }
      this.pause();
      var self = this;
      setTimeout(function () {
        self.nextRound();
      }, 140);
    },

    fail: function (reason) {
      this.pause();
      this.active = false;
      this.streak = 0;
      if (typeof Notif !== 'undefined') {
        Notif.show('Hex Rush', reason + ' — score: ' + this.score, '⌨️');
      }
      var disp = document.getElementById('hexrush-display');
      if (disp) {
        disp.innerHTML = '<span class="hexrush-target">' + this.escapeHtml(this.target) + '</span><div class="hexrush-fail">' + this.escapeHtml(reason) + '</div>';
      }
    },

    updateHud: function () {
      var s = document.getElementById('hexrush-score');
      var st = document.getElementById('hexrush-streak');
      if (s) s.textContent = String(this.score);
      if (st) st.textContent = String(this.streak);
    }
  }
};
