/* MaitrikOS -- main.js -- Core OS Engine */
'use strict';

var $ = function(id) { return document.getElementById(id); };
var $q = function(sel) { return document.querySelector(sel); };
function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

window.__GfxPaused = false;
document.addEventListener('visibilitychange', function() { window.__GfxPaused = document.hidden; });

// ---- STARFIELD ----
function initStarfield(cid, d) {
  d=d||120; var c=$(cid); if(!c)return; var ctx=c.getContext('2d'),stars=[],W=0,H=0;
  function resize(){W=c.width=c.parentElement?c.parentElement.offsetWidth:innerWidth;H=c.height=c.parentElement?c.parentElement.offsetHeight:innerHeight;stars=[];for(var i=0;i<d;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.2,p:Math.random()*6.28,s:Math.random()*0.005+0.001,dx:(Math.random()-0.5)*0.05,dy:(Math.random()-0.5)*0.05});}
  function draw(){
    if(window.__GfxPaused){requestAnimationFrame(draw);return;}
    ctx.clearRect(0,0,W,H);for(var i=0;i<stars.length;i++){var s=stars[i];s.p+=s.s;s.x+=s.dx;s.y+=s.dy;if(s.x<0||s.x>W)s.dx*=-1;if(s.y<0||s.y>H)s.dy*=-1;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fillStyle='rgba(255,255,255,'+(((Math.sin(s.p)+1)/2)*0.6)+')';ctx.fill();}requestAnimationFrame(draw);
  }
  resize();addEventListener('resize',resize);draw();
}

// ---- MATRIX RAIN ----
function initMatrixRain(cid){var c=$(cid);if(!c)return{start:function(){},stop:function(){}};var ctx=c.getContext('2d'),ch='ABCDEFGHIJKLMN0123456789@#$%&*',cols,drops,aid,fs=14;
  function resize(){c.width=innerWidth;c.height=innerHeight;cols=Math.floor(c.width/fs);drops=[];for(var i=0;i<cols;i++)drops[i]=1;}
  function draw(){
    if(window.__GfxPaused){aid=requestAnimationFrame(draw);return;}
    ctx.fillStyle='rgba(0,0,0,0.04)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#00ff41';ctx.font=fs+'px JetBrains Mono';for(var i=0;i<drops.length;i++){ctx.fillText(ch[Math.floor(Math.random()*ch.length)],i*fs,drops[i]*fs);if(drops[i]*fs>c.height&&Math.random()>0.975)drops[i]=0;drops[i]++;}aid=requestAnimationFrame(draw);
  }
  addEventListener('resize',resize);return{start:function(){resize();draw();},stop:function(){if(aid)cancelAnimationFrame(aid);}};}

// ---- BOOT ----
var BOOT_MSGS=[{d:80,t:'BIOS version 2.5.0  Copyright (C) MaitrikOS Foundation'},{d:120,t:'Checking RAM ... 16384 MB OK'},{d:60,t:'[<span class="t-green">  OK  </span>] Reached target Hardware initialization.'},{d:100,t:'[<span class="t-green">  OK  </span>] Loaded module ACPI, PCI, USB3'},{d:80,t:'Mounting root filesystem ...'},{d:120,t:'[<span class="t-green">  OK  </span>] Mounted /dev/sda1 on /'},{d:60,t:'[<span class="t-green">  OK  </span>] Mounted /home/maitrik'},{d:80,t:'[<span class="t-green">  OK  </span>] Loaded cybersecurity.module'},{d:80,t:'Starting Network Manager ...'},{d:200,t:'[<span class="t-green">  OK  </span>] Started Network Manager -- eth0 UP'},{d:60,t:'Acquiring IP from DHCP ... 192.168.1.142'},{d:100,t:'[<span class="t-green">  OK  </span>] Reached target Network is Online'},{d:80,t:'Starting MaitrikOS Display Manager ...'},{d:120,t:'[<span class="t-green">  OK  </span>] Started Wayland compositor (Mutter 44.0)'},{d:60,t:'[<span class="t-green">  OK  </span>] Started PulseAudio Sound System'},{d:80,t:'[<span class="t-green">  OK  </span>] Started MaitrikOS v1.0'},{d:400,t:'<span class="t-green">MaitrikOS v1.0 LTS</span> -- Linux 5.15.0-generic x86_64'}];

function runBoot(){var log=$('boot-log');if(!log)return;
  if(localStorage.getItem('mk_skip_boot')==='1'){initStarfield('boot-canvas',80);transitionTo('boot-screen','login-screen');return;}
  initStarfield('boot-canvas',80);var idx=0;
  function next(){if(idx>=BOOT_MSGS.length){setTimeout(function(){transitionTo('boot-screen','login-screen');},900);return;}var m=BOOT_MSGS[idx];idx++;setTimeout(function(){var l=document.createElement('div');l.innerHTML=m.t;log.appendChild(l);log.scrollTop=log.scrollHeight;next();},m.d);}next();}

function transitionTo(fid,tid){var f=$(fid),t=$(tid);if(!f||!t)return;f.classList.add('fade-out');setTimeout(function(){f.classList.remove('active','fade-out');f.style.display='none';t.style.display='flex';t.classList.add('active');if(tid==='login-screen')initLoginScreen();else if(tid==='desktop-screen')initDesktop();},450);}

// ---- LOGIN ----
var loginClkIv=null;
function initLoginScreen(){initStarfield('login-canvas',100);function upd(){var n=new Date(),el=$('login-clock');if(el)el.textContent=n.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}upd();if(loginClkIv)clearInterval(loginClkIv);loginClkIv=setInterval(upd,1000);var ll=$('last-login');if(ll)ll.textContent=localStorage.getItem('mk_last')||'Never';localStorage.setItem('mk_last',new Date().toLocaleString());setTimeout(function(){var pw=$('password-input');if(pw)pw.focus();},200);}
var lf=$('login-form');if(lf)lf.addEventListener('submit',function(e){e.preventDefault();var c=$q('.login-card');if(c){c.style.transform='scale(0.95)';c.style.opacity='0.5';c.style.transition='all .3s';setTimeout(function(){c.style.transform='';c.style.opacity='';c.style.transition='';transitionTo('login-screen','desktop-screen');},350);}else transitionTo('login-screen','desktop-screen');});

// ---- DESKTOP INIT ----
function initDesktop(){initStarfield('desktop-bg-canvas',150);Clock.start();Screensaver.init();HtopAnim.start();CursorTrail.init();Parallax.init();ActivityFeed.start();
  setTimeout(function(){IncomingPopup.show();},5000);
  setTimeout(function(){var h=$('desktop-hint');if(h&&!localStorage.getItem('mk_hint_dismissed'))h.classList.remove('hidden');},1400);
  StatusWidget.start();
  Achievement.unlock('first_login');
}

// ---- STATUS WIDGET ----
var StatusWidget = {
  start: function() {
    this.update();
    setInterval(() => this.update(), 1000);
  },
  update: function() {
    var el = $('sw-uptime');
    if(!el) return;
    // Simple mock uptime logic
    var start = new Date('2023-08-01');
    var now = new Date();
    var diff = now - start;
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var y = Math.floor(days / 365);
    var d = days % 365;
    el.textContent = y + 'y ' + Math.floor(d/30) + 'm ' + (d%30) + 'd';
  }
};

// ---- ACHIEVEMENT SYSTEM ----
var Achievement = {
  data: {},
  init: function() {
    this.data = JSON.parse(localStorage.getItem('mk_achievements') || '{}');
    if (!this.data.achievements) this.data.achievements = {};
  },
  save: function() {
    localStorage.setItem('mk_achievements', JSON.stringify(this.data));
  },
  unlock: function(id) {
    if (this.data.achievements[id] && this.data.achievements[id].unlocked) return false;
    this.data.achievements[id] = {unlocked: true, timestamp: new Date().toISOString()};
    this.save();
    Notif.show('Achievement Unlocked!', this.getName(id), '&#127942;');
    return true;
  },
  getName: function(id) {
    var names = {
      first_login: 'First Boot',
      terminal_explorer: 'Terminal Explorer',
      app_opener: 'App Opener',
      secret_hunter: 'Secret Hunter',
      flag_submitter: 'Flag Submitter',
      game_player: 'Game Player',
      root_access: 'Root Access',
      full_tour: 'Tour Guide',
      contact_made: 'Contact Made',
      threat_defender: 'Threat Defender',
      ghost_in_shell: 'Ghost in the Shell',
      explorer: 'Explorer',
      ctf_easy: 'CTF Novice',
      ctf_medium: 'CTF Intermediate',
      ctf_hard: 'CTF Expert'
    };
    return names[id] || id;
  },
  isUnlocked: function(id) {
    return this.data.achievements[id] && this.data.achievements[id].unlocked;
  },
  trackCommand: function(cmd) {
    if (!this.data.commands) this.data.commands = {};
    this.data.commands[cmd] = (this.data.commands[cmd] || 0) + 1;
    if (Object.keys(this.data.commands).length >= 5) this.unlock('terminal_explorer');
    this.save();
  },
  trackApp: function(app) {
    if (!this.data.apps) this.data.apps = {};
    this.data.apps[app] = (this.data.apps[app] || 0) + 1;
    if (Object.keys(this.data.apps).length >= 3) this.unlock('app_opener');
    this.save();
  },
  render: function() {
    var entries = $('ctf-entries');
    if (!entries) return;
    entries.innerHTML = '';
    var achievements = this.data.achievements || {};
    var totalScore = 0;
    var achievementList = [
      {id: 'first_login', name: 'First Boot', desc: 'Logged into MaitrikOS', icon: '&#128187;', score: 100},
      {id: 'terminal_explorer', name: 'Terminal Explorer', desc: 'Used 5+ terminal commands', icon: '&#128187;', score: 150},
      {id: 'app_opener', name: 'App Opener', desc: 'Opened 3+ applications', icon: '&#128193;', score: 150},
      {id: 'explorer', name: 'Explorer', desc: 'Completed explore_system mission', icon: '&#128270;', score: 200},
      {id: 'ghost_in_shell', name: 'Ghost in the Shell', desc: 'Found the hidden CTF flag', icon: '&#128123;', score: 300},
      {id: 'contact_made', name: 'Contact Made', desc: 'Sent a contact message', icon: '&#128231;', score: 200},
      {id: 'root_access', name: 'Root Access', desc: 'Activated root mode', icon: '&#128274;', score: 250},
      {id: 'ctf_easy', name: 'CTF Novice', desc: 'Completed all easy CTF challenges', icon: '&#127942;', score: 150},
      {id: 'ctf_medium', name: 'CTF Intermediate', desc: 'Completed all medium CTF challenges', icon: '&#127942;', score: 200},
      {id: 'ctf_hard', name: 'CTF Expert', desc: 'Completed all hard CTF challenges', icon: '&#127942;', score: 300}
    ];
    achievementList.forEach(function(ach) {
      var entry = document.createElement('div');
      entry.className = 'ctf-entry' + (achievements[ach.id] && achievements[ach.id].unlocked ? ' unlocked' : '');
      entry.innerHTML = '<div class="ctf-rank">' + ach.icon + '</div><div class="ctf-info"><div class="ctf-name">' + ach.name + '</div><div class="ctf-desc">' + ach.desc + '</div></div><div class="ctf-score"><span class="score-num">' + (achievements[ach.id] && achievements[ach.id].unlocked ? ach.score : 0) + '</span> pts</div>';
      entries.appendChild(entry);
      if (achievements[ach.id] && achievements[ach.id].unlocked) totalScore += ach.score;
    });
    var totalEl = $('ctf-total-score');
    if (totalEl) totalEl.textContent = totalScore;
  }
};
Achievement.init();

// ---- CTF CHALLENGE GAME ----
var CTFGame = {
  currentDifficulty: 'easy',
  currentChallenge: null,
  score: 0,
  completed: {},
  
  challenges: {
    easy: [
      {
        id: 'crypto_basic',
        title: 'Basic Cryptography',
        description: 'Decode this Base64 message: "SGVsbG8gV29ybGQh"',
        flag: 'Hello World!',
        hint: 'Base64 is a common encoding scheme. Try online decoders.',
        points: 50
      },
      {
        id: 'network_scan',
        title: 'Network Reconnaissance',
        description: 'What port does HTTP typically use?',
        flag: '80',
        hint: 'HTTP is the protocol for web traffic.',
        points: 30
      },
      {
        id: 'file_hidden',
        title: 'Hidden Files',
        description: 'In Linux, hidden files start with what character?',
        flag: '.',
        hint: 'These files are not shown in normal directory listings.',
        points: 25
      }
    ],
    medium: [
      {
        id: 'crypto_caesar',
        title: 'Caesar Cipher',
        description: 'Decrypt this message: "Uifsf jt b tfdsfu dpef"',
        flag: 'There is a secret key',
        hint: 'Each letter is shifted by 1 position.',
        points: 75
      },
      {
        id: 'web_vuln',
        title: 'Web Vulnerability',
        description: 'What does SQL injection allow attackers to do?',
        flag: 'execute arbitrary sql commands',
        hint: 'It involves manipulating database queries.',
        points: 80
      },
      {
        id: 'stego_basic',
        title: 'Basic Steganography',
        description: 'What technique hides data within other data?',
        flag: 'steganography',
        hint: 'It\'s different from encryption.',
        points: 70
      }
    ],
    hard: [
      {
        id: 'crypto_advanced',
        title: 'Advanced Cryptography',
        description: 'What hashing algorithm is considered broken and should not be used?',
        flag: 'md5',
        hint: 'It\'s vulnerable to collision attacks.',
        points: 100
      },
      {
        id: 'forensics_memory',
        title: 'Memory Forensics',
        description: 'What tool is commonly used for analyzing memory dumps?',
        flag: 'volatility',
        hint: 'It\'s a framework for memory analysis.',
        points: 120
      },
      {
        id: 'exploit_dev',
        title: 'Exploit Development',
        description: 'What technique allows code execution by overflowing a buffer?',
        flag: 'buffer overflow',
        hint: 'It involves writing more data than allocated.',
        points: 150
      }
    ]
  },
  
  init: function() {
    this.loadProgress();
    this.bindEvents();
    this.showWelcome();
  },
  
  bindEvents: function() {
    var self = this;
    
    // Difficulty tabs
    var tabs = document.querySelectorAll('.ctf-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function() {
        self.setDifficulty(this.getAttribute('data-difficulty'));
      });
    }
    
    // Submit button
    var submitBtn = $('ctf-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function() {
        self.submitFlag();
      });
    }
    
    // Hint button
    var hintBtn = $('ctf-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', function() {
        self.showHint();
      });
    }
    
    // Enter key for input
    var input = $('ctf-flag-input');
    if (input) {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          self.submitFlag();
        }
      });
    }
  },
  
  setDifficulty: function(difficulty) {
    this.currentDifficulty = difficulty;
    this.currentChallenge = null;
    
    // Update UI
    var tabs = document.querySelectorAll('.ctf-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-difficulty') === difficulty);
    }
    
    var levelEl = $('ctf-current-level');
    if (levelEl) {
      levelEl.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
    
    this.showWelcome();
    this.updateProgress();
  },
  
  showWelcome: function() {
    var titleEl = $('ctf-challenge-title');
    var descEl = $('ctf-challenge-description');
    var hintsEl = $('ctf-challenge-hints');
    
    if (titleEl) titleEl.textContent = 'Welcome to ' + this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1) + ' Challenges';
    if (descEl) descEl.textContent = 'Select a challenge from the list below to begin!';
    if (hintsEl) hintsEl.classList.remove('show');
    
    this.showChallengeList();
  },
  
  showChallengeList: function() {
    var descEl = $('ctf-challenge-description');
    if (!descEl) return;
    
    var challenges = this.challenges[this.currentDifficulty] || [];
    var html = '<div style="margin-top: 16px;">';
    
    challenges.forEach(function(challenge, index) {
      var completed = CTFGame.completed[challenge.id];
      var status = completed ? '✅ Completed' : '🔒 Locked';
      html += '<div style="margin-bottom: 8px; cursor: pointer; padding: 8px; border-radius: 4px; background: rgba(0,0,0,0.2);" onclick="CTFGame.loadChallenge(' + index + ')">';
      html += '<strong>' + challenge.title + '</strong> (' + challenge.points + ' pts) - ' + status;
      html += '</div>';
    });
    
    html += '</div>';
    descEl.innerHTML = html;
  },
  
  loadChallenge: function(index) {
    var challenges = this.challenges[this.currentDifficulty] || [];
    if (index >= challenges.length) return;
    
    this.currentChallenge = challenges[index];
    
    var titleEl = $('ctf-challenge-title');
    var descEl = $('ctf-challenge-description');
    var hintsEl = $('ctf-challenge-hints');
    
    if (titleEl) titleEl.textContent = this.currentChallenge.title;
    if (descEl) descEl.textContent = this.currentChallenge.description;
    if (hintsEl) {
      hintsEl.classList.remove('show');
      hintsEl.textContent = '';
    }
    
    var input = $('ctf-flag-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    
    this.clearFeedback();
  },
  
  submitFlag: function() {
    if (!this.currentChallenge) {
      this.showFeedback('Please select a challenge first!', 'error');
      return;
    }
    
    var input = $('ctf-flag-input');
    if (!input) return;
    
    var userFlag = input.value.trim().toLowerCase();
    var correctFlag = this.currentChallenge.flag.toLowerCase();
    
    if (userFlag === correctFlag) {
      this.completeChallenge();
    } else {
      this.showFeedback('Incorrect flag. Try again!', 'error');
    }
  },
  
  completeChallenge: function() {
    if (!this.currentChallenge) return;
    
    var challengeId = this.currentChallenge.id;
    if (this.completed[challengeId]) {
      this.showFeedback('Challenge already completed!', 'error');
      return;
    }
    
    // Mark as completed
    this.completed[challengeId] = true;
    this.score += this.currentChallenge.points;
    
    // Update UI
    this.updateScore();
    this.updateProgress();
    this.saveProgress();
    
    // Show success
    this.showFeedback('🎉 Correct! +' + this.currentChallenge.points + ' points!', 'success');
    
    // Unlock achievement
    Achievement.unlock('ctf_' + this.currentDifficulty);
    
    // Notification
    Notif.show('CTF Challenge', 'Challenge completed! +' + this.currentChallenge.points + ' points', '🏆');
    
    // Reset for next challenge
    setTimeout(() => {
      this.showChallengeList();
    }, 2000);
  },
  
  showHint: function() {
    if (!this.currentChallenge) {
      this.showFeedback('Please select a challenge first!', 'error');
      return;
    }
    
    var hintsEl = $('ctf-challenge-hints');
    if (hintsEl) {
      hintsEl.textContent = '💡 Hint: ' + this.currentChallenge.hint;
      hintsEl.classList.add('show');
    }
  },
  
  showFeedback: function(message, type) {
    var feedbackEl = $('ctf-feedback');
    if (feedbackEl) {
      feedbackEl.textContent = message;
      feedbackEl.className = 'ctf-feedback ' + (type || '');
    }
  },
  
  clearFeedback: function() {
    var feedbackEl = $('ctf-feedback');
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'ctf-feedback';
    }
  },
  
  updateScore: function() {
    var scoreEl = $('ctf-game-score');
    if (scoreEl) scoreEl.textContent = this.score;
  },
  
  updateProgress: function() {
    var challenges = this.challenges[this.currentDifficulty] || [];
    var completed = Object.keys(this.completed).filter(id => 
      challenges.some(c => c.id === id)
    ).length;
    
    var totalEl = $('ctf-total-challenges');
    var completedEl = $('ctf-completed');
    var fillEl = $('ctf-progress-fill');
    
    if (totalEl) totalEl.textContent = challenges.length;
    if (completedEl) completedEl.textContent = completed;
    if (fillEl) {
      var percentage = challenges.length > 0 ? (completed / challenges.length) * 100 : 0;
      fillEl.style.width = percentage + '%';
    }
  },
  
  loadProgress: function() {
    var data = JSON.parse(localStorage.getItem('ctf_progress') || '{}');
    this.score = data.score || 0;
    this.completed = data.completed || {};
    this.updateScore();
  },
  
  saveProgress: function() {
    var data = {
      score: this.score,
      completed: this.completed
    };
    localStorage.setItem('ctf_progress', JSON.stringify(data));
  }
};

// ---- CLOCK ----
var Clock={iv:null,start:function(){this.tick();var s=this;this.iv=setInterval(function(){s.tick();},1000);},tick:function(){var n=new Date(),t=$('clock-time'),d=$('clock-date');if(t)t.textContent=n.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});if(d)d.textContent=n.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});}};

// ---- SCREENSAVER (45s) ----
var Screensaver={timer:null,rain:null,T:45000,init:function(){this.rain=initMatrixRain('matrix-canvas');this.reset();var s=this;document.addEventListener('mousemove',function(){s.reset();});document.addEventListener('keydown',function(){s.hide();});document.addEventListener('click',function(){s.hide();});},reset:function(){this.hide();clearTimeout(this.timer);var s=this;this.timer=setTimeout(function(){s.show();},this.T);},show:function(){var ss=$('screensaver');if(!ss)return;ss.classList.remove('hidden');if(this.rain)this.rain.start();},hide:function(){var ss=$('screensaver');if(!ss||ss.classList.contains('hidden'))return;ss.classList.add('hidden');if(this.rain)this.rain.stop();}};

// ---- HTOP ANIM ----
var HtopAnim={iv:null,start:function(){var s=this;this.iv=setInterval(function(){s.tick();},2000);},tick:function(){var rows=document.querySelectorAll('.htop-row[data-cpu]');for(var i=0;i<rows.length;i++){var b=parseInt(rows[i].dataset.cpu)||50,v=clamp(b+Math.floor(Math.random()*16-8),5,99),f=rows[i].querySelector('.htop-fill'),p=rows[i].querySelector('.htop-pct');if(f)f.style.width=v+'%';if(p)p.textContent=v+'%';}}};

// ---- CTF SCORE ANIM ----
function animateCtfScores(){var nums=document.querySelectorAll('.score-num'),total=0;for(var i=0;i<nums.length;i++){var tgt=parseInt(nums[i].dataset.target)||0;total+=tgt;(function(el,t){var c=0,s=Math.ceil(t/40);var iv=setInterval(function(){c+=s;if(c>=t){c=t;clearInterval(iv);}el.textContent=c;},30);})(nums[i],tgt);}var te=$('ctf-total-score');if(te){var c2=0,s2=Math.ceil(total/50);var iv2=setInterval(function(){c2+=s2;if(c2>=total){c2=total;clearInterval(iv2);}te.textContent=c2;},25);}}

// ---- NEOFETCH ----
function populateNeofetch(){var info=$('nf-info');if(!info)return;info.innerHTML='';var lines=[{l:'',v:'<span class="t-green">maitrik</span>@<span class="t-blue">maitrik-os</span>'},{l:'',v:'---------------------'},{l:'OS',v:'MaitrikOS v2.0 LTS (Human build 2003)'},{l:'Host',v:'CHARUSAT University, Changa, Anand'},{l:'Degree',v:'B.Tech Computer Engineering (2023 – 2027)'},{l:'CGPA',v:'9.2 / 10.0 (5th Semester)'},{l:'Location',v:'Surat, Gujarat, India'},{l:'Role',v:'Cybersecurity Intern • Video Editor • 3D Animator'},{l:'Internship',v:'CyBrief Pvt. Ltd., Ahmedabad (May–Jun 2025)'},{l:'Arsenal',v:'Nmap · Burp Suite · Metasploit · Wireshark · Docker'},{l:'Certs',v:'Google Cybersecurity [In Progress] · AWS CLF-C02 [Appearing]'},{l:'Email',v:'maitrikmakwana18@gmail.com'},{l:'GitHub',v:'github.com/MaitrikMakwana'},{l:'Shell',v:'bash 5.2.15 | MaitrikOS Wayland'}];for(var i=0;i<lines.length;i++){var d=document.createElement('div');d.className='nf-line';d.style.animationDelay=(i*50)+'ms';d.innerHTML=lines[i].l?'<span class="nf-label">'+lines[i].l+':</span> '+lines[i].v:lines[i].v;info.appendChild(d);}}

// ---- ROADMAP ----
function populateRoadmap() {
  var container = $('roadmap-timeline');
  if(!container) return;
  container.innerHTML = '';
  var items = [
    {date: '2026 – FUTURE', title: 'Next Chapter', sub: 'Cybersecurity Engineer / Cloud Professional', desc: 'Seeking full-time roles and internships in Cybersecurity or Cloud. Continuously building high-impact systems. Available for collaborations.', isNext: true},
    {date: 'JAN 2025 – PRESENT', title: 'Video Editor & 3D Animator', sub: 'GDG CHARUSAT • Ongoing', desc: 'Creating promotional 3D animations and video content for Google Developer Group events at CHARUSAT University. Responsible for all visual branding and event coverage.'},
    {date: 'MAY 2025 – JUN 2025', title: 'Cybersecurity Intern', sub: 'CyBrief Pvt. Ltd., Ahmedabad • Intern ID: CBPL-I0100', desc: '6-week intensive internship. Performed full-lifecycle VAPT on DVWA and Metasploitable2 following OWASP methodology. Wrote professional security assessment reports. Tools: Nmap, Burp Suite, TryHackMe. <br><a href="https://cy-brief.com/" target="_blank" style="color:var(--accent-green);text-decoration:underline;">Visit CyBrief ↗</a>'},
    {date: '2024 – 2025', title: 'Video Editor & 3D Animator', sub: 'CHARUSAT University Media Crew • Completed', desc: 'Official media team for the university. Handled video production, 3D animations, and photography for university events, fests, and promotional campaigns.'},
    {date: 'AUG 2023 – PRESENT', title: 'B.Tech Computer Engineering', sub: 'Charotar University of Science and Technology (CHARUSAT), Changa, Anand, Gujarat', desc: 'Current CGPA: 9.2/10.0 (5th Semester). Key coursework: Network Security, Operating Systems, Cloud Computing, Database Management Systems.'}
  ];
  items.forEach((it, i) => {
    var el = document.createElement('div');
    el.className = 'roadmap-item' + (it.isNext ? ' roadmap-next' : '');
    el.innerHTML = `<span class="roadmap-date">${it.date}</span><div class="roadmap-title">${it.title}</div><div class="roadmap-subtitle">${it.sub}</div><div class="roadmap-desc">${it.desc}</div>`;
    container.appendChild(el);
    setTimeout(() => el.classList.add('reveal'), i * 200 + 100);
  });
}

// ---- SPECS (JSON) ----
function populateSpecs() {
  var container = $('json-display');
  if(!container) return;
  var data = {
    "identity": {
      "name": "Maitrik Makwana",
      "location": "Surat, Gujarat, India",
      "tagline": "CE Student | Cybersecurity | Cloud | Creative",
      "status": "open_to_opportunities"
    },
    "education": {
      "university": "CHARUSAT, Changa, Anand",
      "degree": "B.Tech Computer Engineering",
      "period": "2023 - 2027",
      "cgpa": 9.2
    },
    "experience": {
      "cybrief": "Cybersecurity Intern (May-Jun 2025)",
      "gdg_charusat": "Video Editor & 3D Animator [Ongoing]",
      "university_media": "Media Crew 2024-2025",
      "freelance": "Video Editing & 3D Animation"
    },
    "technical_arsenal": {
      "cybersecurity": ["VAPT", "Nmap", "Burp Suite", "Metasploit", "Wireshark", "SQLMap"],
      "languages": ["C++", "Python", "SQL", "Bash", "JavaScript"],
      "stack": ["React", "Node.js", "Express", "PostgreSQL", "Docker", "AWS"]
    },
    "certifications": {
      "google_cybersecurity": "In Progress (Coursera)",
      "aws_cloud_practitioner": "Appearing (CLF-C02)"
    },
    "metrics": {
      "cgpa": 9.2,
      "projects_shipped": 4,
      "vapt_reports_written": 2,
      "curiosity_level": "infinite"
    }
  };
  
  function formatJSON(obj, indent) {
    indent = indent || 0;
    let html = '<div class="json-bracket">{</div><div class="json-indent">';
    const keys = Object.keys(obj);
    keys.forEach((key, i) => {
      const val = obj[key];
      html += `<div><span class="json-key">"${key}"</span>: `;
      if(Array.isArray(val)) {
        html += '<span class="json-bracket">[</span>';
        val.forEach((v, vi) => { html += `<span class="json-string">"${v}"</span>${vi < val.length - 1 ? ', ' : ''}`; });
        html += '<span class="json-bracket">]</span>';
      } else if(typeof val === 'object') {
        html += formatJSON(val, indent + 1);
      } else if(typeof val === 'string') {
        html += `<span class="json-string">"${val}"</span>`;
      } else {
        html += `<span class="json-number">${val}</span>`;
      }
      html += (i < keys.length - 1 ? ',' : '') + '</div>';
    });
    html += '</div><div class="json-bracket">}</div>';
    return html;
  }
  container.innerHTML = formatJSON(data);
  
  // Add scrolling animation
  container.style.overflow = 'hidden';
  container.style.height = '100%';
  container.style.position = 'relative';
  
  // Create a wrapper for scrolling
  var wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100%';
  wrapper.style.height = '200%'; // Make it taller than container
  wrapper.innerHTML = container.innerHTML;
  container.innerHTML = '';
  container.appendChild(wrapper);
  
  // Auto-scroll animation
  var scrollSpeed = 1;
  var scrollPos = 0;
  var maxScroll = wrapper.offsetHeight - container.offsetHeight;
  
  function scrollAnimate() {
    scrollPos += scrollSpeed;
    if (scrollPos >= maxScroll) {
      scrollPos = 0; // Reset to top
      setTimeout(() => {
        wrapper.style.transition = 'none';
        wrapper.style.transform = 'translateY(0px)';
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.1s linear';
        }, 50);
      }, 2000); // Pause at bottom
    } else {
      wrapper.style.transform = 'translateY(-' + scrollPos + 'px)';
    }
  }
  
  // Start scrolling after a delay
  setTimeout(() => {
    wrapper.style.transition = 'transform 0.1s linear';
    var scrollInterval = setInterval(scrollAnimate, 50);
    
    // Stop scrolling on user interaction
    container.addEventListener('mouseenter', () => clearInterval(scrollInterval));
    container.addEventListener('touchstart', () => clearInterval(scrollInterval));
  }, 1000);
}

// ---- VAULT (CERTIFICATES) ----
function populateVault() {
  var container = $('vault-content');
  if(!container) return;
  container.innerHTML = '';
  var certs = [
    {title: 'Google Professional Cybersecurity', org: 'Google • Coursera • In Progress', img: 'src/png/PNPT.png', badge: 'IN PROGRESS'},
    {title: 'AWS Certified Cloud Practitioner', org: 'Amazon Web Services • Appearing (CLF-C02)', img: 'src/png/CNSP.png', badge: 'UPCOMING'},
    {title: 'CyBrief Internship Certificate', org: 'CyBrief Pvt. Ltd. • Cybersecurity Intern', img: 'src/png/AUCIS.png', badge: 'COMPLETED'},
    {title: 'Hack The Box Profile', org: 'HTB • Pentesting Platform', img: 'src/png/HackThebox.jpg', badge: 'ACTIVE'},
    {title: 'TryHackMe Progress', org: 'THM • Cybersecurity Training', img: 'src/png/tryhackme.png', badge: 'ACTIVE'},
    {title: 'PortSwigger Web Academy', org: 'Burp Suite • Web Security Labs', img: 'src/png/portswiggerDashboard.png', badge: 'ACTIVE'}
  ];
  certs.forEach(c => {
    var badgeColor = c.badge === 'COMPLETED' ? '#00e676' : c.badge === 'IN PROGRESS' || c.badge === 'UPCOMING' ? '#ffcc00' : '#4fc3f7';
    var el = document.createElement('div');
    el.className = 'cert-card';
    el.innerHTML = `<div class="cert-img-wrap"><img src="${c.img}" alt="${c.title}"><div class="cert-badge" style="background:${badgeColor};color:#000;position:absolute;top:8px;right:8px;font-size:9px;font-weight:700;padding:3px 7px;border-radius:4px;letter-spacing:0.05em;">${c.badge}</div></div><div class="cert-info"><div class="cert-title">${c.title}</div><div class="cert-org">${c.org}</div></div>`;
    container.appendChild(el);
  });
}

// ---- TOOLS (ARSENAL) ----
function populateTools() {
  var container = $('tools-content');
  if(!container) return;
  container.innerHTML = '';
  var tools = [
    {name: 'Nmap', level: 80, desc: 'Network exploration & stealth scanning. Used extensively at CyBrief for host discovery and service enumeration.', img: 'src/png/nmap.png'},
    {name: 'Burp Suite', level: 70, desc: 'Web app pentesting proxy. Used for intercepting requests, finding OWASP vulnerabilities, and writing PoC exploits.', img: 'src/png/portswigger.png'},
    {name: 'Metasploit', level: 70, desc: 'Exploitation framework. Performed actual exploitation on Metasploitable2 during internship VAPT engagements.', img: 'src/png/metasploit.png'},
    {name: 'Wireshark', level: 80, desc: 'Packet-level network analysis. Core tool for PyGuard project and network traffic metadata research.', img: 'src/png/wireshark.png'},
    {name: 'Nessus', level: 65, desc: 'Vulnerability assessment scanner. Used for automated scanning of target environments during VAPT.', img: 'src/png/nessus.png'},
    {name: 'SQLMap', level: 70, desc: 'Automated SQL injection detection and exploitation on web application targets.', img: 'src/png/sqlmap.png'},
    {name: 'Hashcat', level: 65, desc: 'GPU-accelerated password recovery. Used for credential testing in network security assessments.', img: 'src/png/hashcat.png'},
    {name: 'OWASP ZAP', level: 68, desc: 'Open-source web app security scanner. Used alongside Burp Suite for comprehensive web assessments.', img: 'src/png/owaspzap.png'}
  ];
  tools.forEach(t => {
    var el = document.createElement('div');
    el.className = 'tool-card';
    el.innerHTML = `<div class="tool-icon-wrap"><img src="${t.img}" alt="${t.name}"></div><div class="tool-content"><div class="tool-name">${t.name} <span style="font-size:10px;color:var(--text-muted);font-weight:400;">${t.level}%</span></div><div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin:5px 0 8px;"><div style="width:${t.level}%;height:100%;background:linear-gradient(90deg,var(--accent-green),#00cc44);border-radius:2px;"></div></div><div class="tool-desc">${t.desc}</div></div>`;
    container.appendChild(el);
  });
}

// ---- THREAT MAP ----
var ThreatMap = {
  canvas: null, ctx: null, dots: [], links: [], count: 0, iv: null,
  start: function() {
    this.canvas = $('threat-map-canvas');
    if(!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    if(this.iv) clearInterval(this.iv);
    this.iv = setInterval(() => this.tick(), 100);
    this.loop();
  },
  resize: function() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.dots = [];
    for(let i=0; i<30; i++) this.dots.push({x: Math.random()*this.canvas.width, y: Math.random()*this.canvas.height});
  },
  tick: function() {
    if(Math.random() > 0.92) {
      let d1 = this.dots[Math.floor(Math.random()*this.dots.length)];
      let d2 = this.dots[Math.floor(Math.random()*this.dots.length)];
      if(d1 !== d2) {
        this.links.push({a: d1, b: d2, p: 0, s: 0.02 + Math.random()*0.03});
        this.count++;
        var el = $('map-attack-count'); if(el) el.textContent = this.count;
        this.addLog();
      }
    }
  },
  addLog: function() {
    var log = $('map-log'); if(!log) return;
    var ips = ['192.168.1.'+Math.floor(Math.random()*255), '10.0.0.'+Math.floor(Math.random()*255), '172.16.0.'+Math.floor(Math.random()*255)];
    var d = document.createElement('div');
    d.textContent = `[ATTACK] Inbound from ${ips[Math.floor(Math.random()*ips.length)]} -> BLOCKED`;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    if(log.childNodes.length > 20) log.removeChild(log.firstChild);
  },
  loop: function() {
    if(!this.ctx) return;
    this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#00ff41';
    this.dots.forEach(d => {
      this.ctx.beginPath(); this.ctx.arc(d.x, d.y, 1.5, 0, 6.28); this.ctx.fill();
    });
    this.ctx.strokeStyle = '#ff3333';
    this.ctx.lineWidth = 1;
    for(let i=this.links.length-1; i>=0; i--) {
      let l = this.links[i];
      l.p += l.s;
      if(l.p >= 1) { this.links.splice(i, 1); continue; }
      this.ctx.beginPath();
      this.ctx.moveTo(l.a.x, l.a.y);
      let dx = l.b.x - l.a.x, dy = l.b.y - l.a.y;
      this.ctx.lineTo(l.a.x + dx*l.p, l.a.y + dy*l.p);
      this.ctx.stroke();
    }
    requestAnimationFrame(() => this.loop());
  }
};

// ---- SYSTEM LOGS (GUESTBOOK) ----
function populateLogs() {
  var entries = $('visitors-log-entries');
  if(!entries) return;
  if(entries.innerHTML !== '') return;
  var logs = JSON.parse(localStorage.getItem('maitrik_logs') || '[]');
  if(logs.length === 0) {
    logs = [
      {ts: '2025-05-12 14:22:01', msg: 'System initialized. Firewall active.'},
      {ts: '2025-05-15 09:45:12', msg: 'Visitor from 192.168.1.1 granted guest access.'}
    ];
  }
  logs.forEach(l => {
    var d = document.createElement('div'); d.className = 'log-entry';
    d.innerHTML = `<span class="log-ts">[${l.ts}]</span><span class="log-msg">${l.msg}</span>`;
    entries.appendChild(d);
  });
  entries.scrollTop = entries.scrollHeight;
}

var lf_inj = $('log-inject-form');
if(lf_inj) lf_inj.addEventListener('submit', function(e) {
  e.preventDefault();
  var inp = $('log-input'); if(!inp) return;
  var val = inp.value.trim();
  if(!val) return;
  var msg = val;
  if(val.startsWith('./inject_log.sh --msg')) {
    msg = val.split("'")[1] || val.split('"')[1] || val.replace('./inject_log.sh --msg ', '');
  }
  var now = new Date().toISOString().replace('T', ' ').split('.')[0];
  var logs = JSON.parse(localStorage.getItem('maitrik_logs') || '[]');
  logs.push({ts: now, msg: msg});
  localStorage.setItem('maitrik_logs', JSON.stringify(logs));
  var entries = $('visitors-log-entries');
  var d = document.createElement('div'); d.className = 'log-entry';
  d.innerHTML = `<span class="log-ts">[${now}]</span><span class="log-msg">${msg}</span>`;
  entries.appendChild(d);
  entries.scrollTop = entries.scrollHeight;
  inp.value = '';
  Notif.show('System Logs', 'Log entry injected successfully.', '&#128466;');
});

// ---- NOTIFICATIONS ----
var Notif={container:null,init:function(){this.container=document.createElement('div');this.container.className='notif-container';document.body.appendChild(this.container);},show:function(t,m,ic){if(!this.container)this.init();ic=ic||'&#128276;';var el=document.createElement('div');el.className='notif';el.innerHTML='<div class="notif-icon">'+ic+'</div><div class="notif-body"><div class="notif-title">'+t+'</div><div class="notif-msg">'+m+'</div></div>';this.container.appendChild(el);setTimeout(function(){el.classList.add('notif-out');setTimeout(function(){el.remove();},300);},4000);}};Notif.init();

// ---- WINDOW MANAGER ----
var zTop=200;
var WM={
  defs:{'terminal-win':{w:720,h:450,x:160,y:60},'neofetch-win':{w:680,h:380,x:200,y:80},'projects-win':{w:720,h:460,x:180,y:70},'contact-win':{w:600,h:540,x:220,y:60},'vapt-win':{w:760,h:500,x:140,y:50},'htop-win':{w:720,h:420,x:170,y:70},'arcade-win':{w:420,h:560,x:120,y:40},'ctf-win':{w:640,h:480,x:200,y:60},'ctf-challenge-win':{w:700,h:550,x:180,y:50},'readme-win':{w:560,h:420,x:240,y:110},'pdf-win':{w:780,h:640,x:250,y:40},'roadmap-win':{w:600,h:500,x:220,y:60},'specs-win':{w:650,h:450,x:180,y:80},'vault-win':{w:740,h:520,x:190,y:50},'tools-win':{w:720,h:500,x:170,y:70},'map-win':{w:800,h:500,x:150,y:60},'logs-win':{w:600,h:450,x:240,y:100}},
  open:function(id){var w=$(id);if(!w)return;var s=this.loadSt(id),d=this.defs[id]||{w:600,h:400,x:180,y:80};w.style.width=(s?s.w:d.w)+'px';w.style.height=(s?s.h:d.h)+'px';w.style.left=(s?s.x:d.x+Math.random()*40)+'px';w.style.top=(s?s.y:d.y+Math.random()*20)+'px';w.classList.add('win-open');w.style.display='flex';this.focus(id);if(id==='neofetch-win')populateNeofetch();if(id==='ctf-win')animateCtfScores();if(id==='roadmap-win')populateRoadmap();if(id==='specs-win')populateSpecs();if(id==='vault-win')populateVault();if(id==='tools-win')populateTools();if(id==='map-win')ThreatMap.start();if(id==='logs-win')populateLogs();if(id==='arcade-win'&&window.MiniGames)MiniGames.onOpen();if(id==='ctf-challenge-win'&&window.CTFGame)CTFGame.init();},
  close:function(id){var w=$(id);if(!w)return;this.saveSt(id);w.classList.remove('win-open','win-focused');w.style.display='none';w.dataset.maximized='';Taskbar.render();},
  minimize:function(id){var w=$(id);if(!w)return;w.style.display='none';Taskbar.render();},
  restore:function(id){var w=$(id);if(!w)return;w.style.display='flex';w.classList.add('win-open');this.focus(id);},
  focus:function(id){var a=document.querySelectorAll('.win');for(var i=0;i<a.length;i++)a[i].classList.remove('win-focused');var w=$(id);if(!w)return;zTop++;w.style.zIndex=zTop;w.classList.add('win-focused');Taskbar.render();if(id==='terminal-win')setTimeout(function(){var inp=$('term-input');if(inp)inp.focus();},50);},
  maximize:function(id){var w=$(id);if(!w)return;if(w.dataset.maximized==='1'){w.style.top=w.dataset.pT;w.style.left=w.dataset.pL;w.style.width=w.dataset.pW;w.style.height=w.dataset.pH;w.dataset.maximized='';}else{w.dataset.pT=w.style.top;w.dataset.pL=w.style.left;w.dataset.pW=w.style.width;w.dataset.pH=w.style.height;w.style.top='0';w.style.left='0';w.style.width='100%';w.style.height='100%';w.dataset.maximized='1';}},
  dragging:false,dragWin:null,dOX:0,dOY:0,
  startDrag:function(e,id){if(e.target.classList.contains('dot'))return;e.preventDefault();var w=$(id);if(!w||w.dataset.maximized==='1')return;this.dragging=true;this.dragWin=w;this.focus(id);var r=w.getBoundingClientRect();this.dOX=e.clientX-r.left;this.dOY=e.clientY-r.top;},
  onMove:function(e){if(!this.dragging||!this.dragWin)return;this.dragWin.style.left=clamp(e.clientX-this.dOX,-this.dragWin.offsetWidth+60,innerWidth-40)+'px';this.dragWin.style.top=clamp(e.clientY-this.dOY,0,innerHeight-58)+'px';},
  onUp:function(){if(this.dragging&&this.dragWin)this.saveSt(this.dragWin.id);this.dragging=false;this.dragWin=null;},
  saveSt:function(id){var w=$(id);if(!w)return;try{localStorage.setItem('w_'+id,JSON.stringify({w:w.offsetWidth,h:w.offsetHeight,x:parseInt(w.style.left)||0,y:parseInt(w.style.top)||0}));}catch(e){}},
  loadSt:function(id){try{var s=localStorage.getItem('w_'+id);return s?JSON.parse(s):null;}catch(e){return null;}}
};
document.addEventListener('mousemove',function(e){WM.onMove(e);});
document.addEventListener('mouseup',function(){WM.onUp();});
var bars=document.querySelectorAll('.win-bar');for(var i=0;i<bars.length;i++){(function(b){var id=b.dataset.win;if(id)b.addEventListener('mousedown',function(e){WM.startDrag(e,id);});})(bars[i]);}
var allW=document.querySelectorAll('.win');for(var i=0;i<allW.length;i++){(function(w){w.addEventListener('mousedown',function(){WM.focus(w.id);});})(allW[i]);}

// ---- TASKBAR ----
var Taskbar={render:function(){var c=$('tb-tasks');if(!c)return;c.innerHTML='';var ws=document.querySelectorAll('.win.win-open');for(var i=0;i<ws.length;i++){var w=ws[i],id=w.id,t=w.dataset.title||id,ic=w.dataset.icon||'',vis=w.style.display!=='none',foc=w.classList.contains('win-focused');var tk=document.createElement('div');tk.className='tb-task'+(foc&&vis?' tb-active':'');tk.textContent=ic+' '+t.split('--')[0].trim().substring(0,16);(function(wid,v,f){tk.onclick=function(){if(!v)WM.restore(wid);else if(f)WM.minimize(wid);else WM.restore(wid);};})(id,vis,foc);c.appendChild(tk);}}};

// ---- LAUNCHER ----
var Launcher={isOpen:false,toggle:function(){this.isOpen=!this.isOpen;var l=$('app-launcher');if(!l)return;if(this.isOpen){l.classList.remove('hidden');setTimeout(function(){var s=$('launcher-search');if(s)s.focus();},50);}else l.classList.add('hidden');},hide:function(){this.isOpen=false;var l=$('app-launcher');if(l)l.classList.add('hidden');}};
var tbL=$('tb-launcher');if(tbL)tbL.addEventListener('click',function(e){e.stopPropagation();Launcher.toggle();});
var ls=$('launcher-search');if(ls)ls.addEventListener('input',function(){var q=this.value.toLowerCase();var apps=document.querySelectorAll('.launcher-app');for(var i=0;i<apps.length;i++){var n=apps[i].querySelector('span').textContent.toLowerCase();apps[i].style.display=n.indexOf(q)>=0?'':'none';}});
document.addEventListener('click',function(e){if(!e.target.closest('#app-launcher')&&!e.target.closest('#tb-launcher'))Launcher.hide();var ctx=$('context-menu');if(ctx)ctx.classList.add('hidden');});

// ---- CONTEXT MENU ----
var ds=$('desktop-screen');if(ds)ds.addEventListener('contextmenu',function(e){if(e.target.closest('.win')||e.target.closest('.taskbar'))return;e.preventDefault();var m=$('context-menu');if(!m)return;m.classList.remove('hidden');var x=e.clientX,y=e.clientY;if(x+200>innerWidth)x=innerWidth-210;if(y+m.offsetHeight>innerHeight)y=innerHeight-m.offsetHeight-10;m.style.left=x+'px';m.style.top=y+'px';});

// ---- KONAMI CODE ----
var konamiSeq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],konamiIdx=0,rootMode=false;
document.addEventListener('keydown',function(e){var loginS=$('login-screen');if(loginS&&loginS.classList.contains('active')){if(e.key==='Enter'){var f=$('login-form');if(f)f.dispatchEvent(new Event('submit',{cancelable:true}));}return;}var desk=$('desktop-screen');if(!desk||!desk.classList.contains('active'))return;if(e.key===konamiSeq[konamiIdx]){konamiIdx++;if(konamiIdx>=konamiSeq.length){konamiIdx=0;toggleRootMode();}}else konamiIdx=0;if(e.ctrlKey&&e.altKey&&(e.key==='t'||e.key==='T')){e.preventDefault();OS.openApp('terminal-win');}if(e.altKey&&e.key==='Tab'){e.preventDefault();var ow=document.querySelectorAll('.win.win-open');if(ow.length<2)return;var fc=$q('.win.win-focused'),idx=-1;for(var i=0;i<ow.length;i++)if(ow[i]===fc){idx=i;break;}WM.restore(ow[(idx+1)%ow.length].id);}if(e.key==='Escape'){var fc=$q('.win.win-focused');if(fc&&!e.target.closest('#app-launcher'))WM.close(fc.id);Launcher.hide();var ctx=$('context-menu');if(ctx)ctx.classList.add('hidden');}});
function toggleRootMode(){rootMode=!rootMode;if(rootMode){document.body.classList.add('root-mode');Notif.show('ROOT MODE','Root access granted. Theme changed.','&#128274;');var t=$('terminal-title');if(t)t.textContent='root@maitrik-os: ~';Achievement.unlock('root_access');}else{document.body.classList.remove('root-mode');Notif.show('USER MODE','Returned to normal mode.','&#128100;');var t=$('terminal-title');if(t)t.textContent='maitrik@maitrik-os: ~';}}

// ---- OS API ----
var OS={
  openApp:function(id){Launcher.hide();var w=$(id);if(!w)return;if(w.classList.contains('win-open')&&w.style.display!=='none')WM.focus(id);else WM.open(id);Taskbar.render();if(id==='ctf-win')Achievement.render();if(id==='ctf-challenge-win')CTFGame.init();Achievement.trackApp(id);},
  close:function(id){WM.close(id);},minimize:function(id){WM.minimize(id);Taskbar.render();},maximize:function(id){WM.maximize(id);},
  notify:function(t,m,i){Notif.show(t,m,i);},
  contextAction:function(a){var c=$('context-menu');if(c)c.classList.add('hidden');switch(a){case'terminal':this.openApp('terminal-win');break;case'about':this.openApp('neofetch-win');break;case'arcade':this.openApp('arcade-win');break;case'refresh':Notif.show('Desktop','Desktop refreshed.','&#128260;');break;case'resume':this.openApp('pdf-win');break;case'shutdown':this.shutdown();break;}},
  shutdown:function(){document.body.style.transition='opacity 1s';document.body.style.opacity='0';setTimeout(function(){document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#00ff41;font-family:JetBrains Mono,monospace;font-size:18px;">System halted. See you soon!</div>';document.body.style.opacity='1';},1000);},
  openProject:function(slug){var projects={'pyguard':{title:'PyGuard -- README.md',body:'<h2>&#128737; PyGuard - Modern Network Traffic Metadata Capture & Analysis</h2><div style="margin-bottom:16px;"><span class="badge badge-blue">Python 3.8+</span><span class="badge badge-green">License: MIT</span><span class="badge badge-purple">ML IDS</span></div><p style="color:var(--text-secondary); font-size:13px; margin-bottom:16px; line-height:1.6;">PyGuard is a comprehensive desktop application for capturing, analyzing, and storing network traffic metadata. It features a modern PyQt5 UI with sidebar navigation, real-time protocol stats, advanced filtering, and color-coded packet tables.</p><h3>&#128640; Quick Start</h3><div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; font-family:var(--font-mono); font-size:12px; margin-bottom:16px; border:1px solid var(--border-subtle); line-height:1.6; color:var(--text-primary);"><span class="t-muted"># Activate virtual environment</span><br>.\\venv\\Scripts\\Activate.ps1<br><br><span class="t-muted"># Start the application</span><br>python run_pyguard.py</div><h3>&#10024; Features</h3><ul style="padding-left:20px; color:var(--text-secondary); margin-bottom:16px; font-size:13px; line-height:1.6;"><li><strong>High-Performance Capture</strong>: Efficient packet capture using Scapy</li><li><strong>Flexible Storage</strong>: Native PCAP, PostgreSQL DB, JSON, Parquet</li><li><strong>UI & ML Integration</strong>: PyQt5 interface equipped with a Machine Learning IDS pipeline (Normal vs Attack traffic)</li></ul><h3>&#127959;&#65039; Project Structure</h3><pre style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; font-family:var(--font-mono); font-size:12px; color:var(--text-secondary); overflow-x:auto; margin-bottom:16px;">PyGuard-main/<br>&#9500;&#9472;&#9472; desktop_app/  # PyQt5 UI & logic<br>&#9500;&#9472;&#9472; Final_IDS/    # Integrated ML Pipeline<br>&#9500;&#9472;&#9472; pyguard/      # Core packet processing<br>&#9492;&#9472;&#9472; run_pyguard.py</pre><br><a href="https://github.com/MaitrikMakwana/PyGuard" target="_blank">&#8599; View Repository on GitHub</a>'},'tapms':{title:'TAPMS -- README.md',body:'<div class="readme-body"><h2>&#128101; TAPMS \u2013 Teams & Project Management</h2><div style="margin-bottom:16px;"><span class="badge badge-blue">React.js</span><span class="badge badge-green">Node.js</span><span class="badge badge-purple">PostgreSQL</span><span class="badge badge-blue">Docker</span></div><p style="color:var(--text-secondary); font-size:13px; margin-bottom:16px; line-height:1.6;">A modern Student Batch Collaboration and Project Management platform designed specifically for universities. TAPMS enables seamless grouping, task tracking, and mentor-student interaction.</p><h3>&#10024; Key Features</h3><ul style="padding-left:20px; color:var(--text-secondary); margin-bottom:16px; font-size:13px; line-height:1.6;"><li><strong>Batch Management</strong>: Automated importing of students and faculty via Excel/CSV</li><li><strong>Mentor Tracking</strong>: Dedicated portals for progress tracking and milestone reviews</li><li><strong>Project Organization</strong>: Team formation, task delegation, and timeline management</li></ul><h3>&#127959;&#65039; Architecture & Tech Stack</h3><table class="vapt-table" style="margin-bottom:16px; font-size:12px; width:100%;"><tr><td><strong>Frontend</strong></td><td>React.js SPAs for Student, Mentor, and Admin roles</td></tr><tr><td><strong>Backend</strong></td><td>Node.js & Express API services</td></tr><tr><td><strong>Database</strong></td><td>PostgreSQL for relational integrity and role modeling</td></tr><tr><td><strong>Deployment</strong></td><td>Containerized via Docker for scalable hosting</td></tr></table><h3>&#128194; Repository Structure</h3><pre style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; font-family:var(--font-mono); font-size:12px; color:var(--text-secondary); overflow-x:auto; margin-bottom:16px;">TAPMS/<br>&#9500;&#9472;&#9472; frontend/     # React Application<br>&#9500;&#9472;&#9472; backend/      # Node.js Express Server<br>&#9500;&#9472;&#9472; faculty.xlsx  # Sample Faculty Dataset<br>&#9492;&#9472;&#9472; student.xlsx  # Sample Student Dataset</pre><br><a href="https://github.com/vasu-CE/TAPMS" target="_blank">&#8599; View Repository on GitHub</a></div>'},'peerconnect':{title:'PeerConnect -- README.md',body:'<div class="readme-body"><h2>&#128279; PeerCloud \u2013 Academic MVP</h2><div style="margin-bottom:16px;"><span class="badge badge-purple">FastAPI</span><span class="badge badge-blue">React</span><span class="badge badge-green">Docker</span><span class="badge badge-blue">PostgreSQL</span></div><p style="color:var(--text-secondary); font-size:13px; margin-bottom:16px; line-height:1.6;">A community-owned Infrastructure-as-a-Service (IaaS) platform that enables secure, metered compute sharing using Docker containers. <strong>Currently in Academic MVP development phase.</strong></p><h3>&#9881;&#65039; Job Lifecycle & Billing</h3><div class="vapt-methodology" style="margin-bottom:16px;"><div class="method-step" style="padding:8px;"><div class="method-desc" style="color:var(--text-primary);">QUEUED</div></div> <div class="method-arrow">&#8594;</div><div class="method-step" style="padding:8px;"><div class="method-desc" style="color:var(--text-primary);">ASSIGNED</div></div> <div class="method-arrow">&#8594;</div><div class="method-step" style="padding:8px;"><div class="method-desc" style="color:var(--text-primary);">RUNNING</div></div> <div class="method-arrow">&#8594;</div><div class="method-step" style="padding:8px;"><div class="method-desc" style="color:var(--text-primary);">COMPLETED</div></div></div><p style="font-size:12px; color:var(--text-secondary); margin-bottom:16px;">Jobs are billed by <code>runtime_min \u00d7 req_cpu \u00d7 price_cpu</code>. Providers earn the total minus a 15% platform fee.</p><h3>&#127959;&#65039; System Architecture</h3><table class="vapt-table" style="margin-bottom:16px; font-size:12px; width:100%;"><tr><td><strong>Control Plane</strong></td><td>FastAPI backend (job assignment, billing, JWT auth)</td></tr><tr><td><strong>Provider Agent</strong></td><td>Python polling loop executing tasks via Docker engine</td></tr><tr><td><strong>Frontend</strong></td><td>React + Vite dashboard for providers and clients</td></tr><tr><td><strong>Storage</strong></td><td>Local persistence for ZIP inputs, outputs, and logs</td></tr></table><h3>&#128194; Project Structure</h3><pre style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; font-family:var(--font-mono); font-size:12px; color:var(--text-secondary); overflow-x:auto; margin-bottom:16px;">peerconnect/<br>&#9500;&#9472;&#9472; control_plane/  # API Server + APScheduler<br>&#9500;&#9472;&#9472; provider_agent/ # Docker execution engine<br>&#9500;&#9472;&#9472; frontend/       # React App<br>&#9492;&#9472;&#9472; storage/        # Job inputs/outputs</pre><br><a href="https://github.com/MaitrikMakwana/Peer-Connect" target="_blank">&#8599; View Repository on GitHub</a></div>'},'piisanitization':{title:'PII Sanitizer -- README.md',body:'<div class="readme-body"><h2>&#128737; PII Data Sanitization Platform</h2><div style="margin-bottom:16px;"><span class="badge badge-blue">React 18</span><span class="badge badge-green">Node.js</span><span class="badge badge-purple">Python ML</span><span class="badge badge-blue">PostgreSQL</span></div><p style="color:var(--text-secondary); font-size:13px; margin-bottom:16px; line-height:1.6;">A comprehensive platform for detecting and sanitizing Personally Identifiable Information (PII) across multiple file formats. Built with React, Express.js, and a Python ML engine powered by Presidio + spaCy.</p><h3>&#10024; Key Features</h3><ul style="padding-left:20px; color:var(--text-secondary); margin-bottom:16px; font-size:13px; line-height:1.6;"><li><strong>Async 7-stage Pipeline</strong>: File processing using BullMQ workers</li><li><strong>Extensive Format Support</strong>: PDF, DOCX, TXT, CSV, JSON, PNG/JPG</li><li><strong>Image Sanitization</strong>: OCR via Tesseract + Presidio NLP with black-rectangle redaction</li><li><strong>Format-Preserving</strong>: Replaces DOCX data while keeping fonts/bolding</li><li><strong>Admin Dashboard</strong>: Real-time KPIs, R2 storage usage, and charts</li></ul><h3>&#127959;&#65039; Architecture & Tech Stack</h3><table class="vapt-table" style="margin-bottom:16px; font-size:12px; width:100%;"><tr><td><strong>Frontend</strong></td><td>React 18, TS, Tailwind v4, shadcn/ui</td></tr><tr><td><strong>Backend</strong></td><td>Express, TS, Prisma, BullMQ</td></tr><tr><td><strong>PII Engine</strong></td><td>FastAPI, Presidio, spaCy, PyMuPDF, Tesseract</td></tr><tr><td><strong>Infrastructure</strong></td><td>Neon DB, Upstash Redis, Cloudflare R2</td></tr></table><h3>&#9881;&#65039; The 7-Stage Pipeline</h3><div class="vapt-methodology" style="margin-bottom:16px;"><div class="method-step" style="padding:10px; min-width:80px;"><div class="method-num" style="font-size:14px;">1</div><div class="method-label">Download</div></div> <div class="method-arrow">&#8594;</div><div class="method-step" style="padding:10px; min-width:80px;"><div class="method-num" style="font-size:14px;">2</div><div class="method-label">Analyze</div></div> <div class="method-arrow">&#8594;</div><div class="method-step" style="padding:10px; min-width:80px;"><div class="method-num" style="font-size:14px;">3</div><div class="method-label">Sanitize</div></div> <div class="method-arrow">&#8594;</div><div class="method-step" style="padding:10px; min-width:80px;"><div class="method-num" style="font-size:14px;">4</div><div class="method-label">Upload</div></div></div><br><a href="https://github.com/MaitrikMakwana/PII-DATA-SANITIZATION" target="_blank">&#8599; View Repository on GitHub</a></div>'},'cloudenthu':{title:'CloudEnthu -- README.md',body:'<div class="readme-body"><h2>&#9729;&#65039; CloudEnthu - AWS Study Platform</h2><div style="margin-bottom:16px;"><span class="badge badge-blue">React 18</span><span class="badge badge-green">Node.js</span><span class="badge badge-purple">PostgreSQL</span><span class="badge badge-blue">AWS Cloud</span></div><p style="color:var(--text-secondary); font-size:13px; margin-bottom:16px; line-height:1.6;">Real-world AWS Cloud Practitioner notes, study guides, and learning materials &#8212; written week by week. A personal blog and notes platform built to document the journey preparing for the CLF-C02 exam.</p><h3>&#10024; Features</h3><ul style="padding-left:20px; color:var(--text-secondary); margin-bottom:16px; font-size:13px; line-height:1.6;"><li><strong>Week-based Organization</strong>: Notes grouped into weeks with customizable names</li><li><strong>Tagging System</strong>: Filter posts by topic (e.g., #s3, #iam, #ec2)</li><li><strong>Secure Admin CMS</strong>: JWT-authenticated dashboard with rate-limiting & helmet</li><li><strong>Markdown Editor</strong>: Write notes in Markdown, beautifully renderer</li></ul><h3>&#127959;&#65039; Tech Stack</h3><table class="vapt-table" style="margin-bottom:16px; font-size:12px; width:100%;"><tr><td><strong>Frontend</strong></td><td>React 18 + Vite (Vanilla CSS Neobrutalism)</td></tr><tr><td><strong>Backend</strong></td><td>Node.js, Express, Prisma ORM</td></tr><tr><td><strong>Database</strong></td><td>PostgreSQL</td></tr><tr><td><strong>Security</strong></td><td>JWT, bcrypt, Helmet.js, express-rate-limit</td></tr></table><br><a href="https://github.com/MaitrikMakwana/CloudEnthu" target="_blank" style="margin-right:12px;">&#8599; View Repository</a> <a href="https://cloud-enthu-1.vercel.app/" target="_blank" style="color:var(--accent-green);">&#8599; Live Site</a></div>'}};var p=projects[slug];if(!p)return;var ti=$('readme-win-title');if(ti)ti.textContent=p.title;var co=$('readme-content');if(co)co.innerHTML='<div class="readme-body">'+p.body+'</div>';var w=$('readme-win');if(w)w.dataset.title=p.title;this.openApp('readme-win');},
  sendContact:function(e){e.preventDefault();var email=$('contact-email')?$('contact-email').value:'',msg=$('contact-msg')?$('contact-msg').value:'';if(!email||!msg){Notif.show('Firefox','Please fill required fields.','&#9888;');return false;}var name=$('contact-name')?$('contact-name').value:'Visitor';var btn=e.target.querySelector('button[type="submit"]');if(btn)btn.innerHTML='<span>Sending...</span>';fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_key:'1cbba76d-c4a2-4e86-8d4f-b2198780261a',name:name,email:email,message:msg,subject:'MaitrikOS Portfolio Contact'})}).then(r=>r.json()).then(d=>{var st=$('contact-status');if(st){st.className='contact-status success';st.textContent='Message securely delivered to Maitrik -> Exit code 0 \u2713';st.classList.remove('hidden');}Notif.show('Firefox','Email transmitted successfully.','&#9989;');Achievement.unlock('contact_made');e.target.reset();if(btn)btn.innerHTML='<span>./send_message.sh</span>';}).catch(err=>{var st=$('contact-status');if(st){st.className='contact-status error';st.textContent='Failed to send. Network error.';st.classList.remove('hidden');}Notif.show('Firefox','Transmission failed.','&#10060;');if(btn)btn.innerHTML='<span>./send_message.sh</span>';});return false;}
};

// ---- BOOT ----
addEventListener('load',function(){
  Terminal.init();
  Achievement.init();
  var bs=$('boot-skip');if(bs)bs.addEventListener('click',function(){var rem=$('boot-remember');if(rem&&rem.checked)localStorage.setItem('mk_skip_boot','1');transitionTo('boot-screen','login-screen');});
  var dhd=$('desktop-hint-dismiss');if(dhd)dhd.addEventListener('click',function(){localStorage.setItem('mk_hint_dismissed','1');var p=$('desktop-hint');if(p)p.classList.add('hidden');});
  runBoot();
});