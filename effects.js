/* MaitrikOS -- effects.js -- Terminal + All Alive-Site Effects */
'use strict';

// ---- TERMINAL ENGINE ----
var Terminal={
  history:[],histIdx:-1,output:null,input:null,ghostActive:false,
  init:function(){this.output=$('term-output');this.input=$('term-input');if(!this.input)return;
    this.print('Welcome to <span class="t-green">MaitrikOS</span> v1.0 LTS (Linux 5.15.0-generic x86_64)','markup');
    this.print('Type <span class="t-blue">help</span> to see available commands.\n','markup');
    var self=this;this.input.addEventListener('keydown',function(e){if(self.ghostActive)return;self.handleKey(e);});
    var tc=$('terminal-win-content');if(tc)tc.addEventListener('click',function(){self.input.focus();});},
  handleKey:function(e){if(e.key==='Enter'){e.preventDefault();var cmd=this.input.value.trim();this.input.value='';this.histIdx=-1;if(cmd){this.history.unshift(cmd);this.printPrompt(cmd);this.execute(cmd);}else this.printPrompt('');this.scrollBottom();}
    if(e.key==='ArrowUp'){e.preventDefault();if(this.histIdx<this.history.length-1){this.histIdx++;this.input.value=this.history[this.histIdx]||'';}}
    if(e.key==='ArrowDown'){e.preventDefault();if(this.histIdx>0){this.histIdx--;this.input.value=this.history[this.histIdx]||'';}else{this.histIdx=-1;this.input.value='';}}
    if(e.key==='Tab'){e.preventDefault();var v=this.input.value.trim(),cn=Object.keys(this.commands);for(var i=0;i<cn.length;i++)if(cn[i].indexOf(v)===0){this.input.value=cn[i];break;}}},
  printPrompt:function(cmd){var u=rootMode?'root':'maitrik',sym=rootMode?'#':'$';this.print('<span class="t-green">'+u+'</span><span class="t-muted">@</span><span class="t-blue">maitrik-os</span><span class="t-muted">:</span><span class="t-blue">~</span><span class="t-white">'+sym+' </span>'+this.escape(cmd),'markup');},
  print:function(c,t){t=t||'text';var d=document.createElement('div');d.className='term-line';if(t==='markup')d.innerHTML=c;else d.textContent=c;if(this.output)this.output.appendChild(d);this.scrollBottom();},
  escape:function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');},
  scrollBottom:function(){var c=$('terminal-win-content');if(c)c.scrollTop=c.scrollHeight;},
  execute:function(raw){var parts=raw.split(' ');var cmd=parts[0].toLowerCase();var args=parts.slice(1);
    if(raw.indexOf('&&')>=0){var cmds=raw.split('&&');for(var i=0;i<cmds.length;i++)this.execute(cmds[i].trim());return;}
    if(cmd==='cd'){this.print('(simulated) Changed directory to '+args.join(' '));return;}
    var h=this.commands[cmd];if(h)h.call(this,args);else this.print('bash: '+cmd+': command not found. Type \'help\'.');},
  commands:{
    help:function(){var l=['<span class="t-green">MaitrikOS -- Available Commands</span>','--------------------------------------','<span class="t-blue">whoami</span>       - display identity','<span class="t-blue">roadmap</span>      - view experience timeline','<span class="t-blue">specs</span>        - system technical specs (JSON)','<span class="t-blue">socials</span>      - view social media links','<span class="t-blue">ls [dir]</span>     - list directory','<span class="t-blue">cat [file]</span>   - display file','<span class="t-blue">pwd</span>          - working directory','<span class="t-blue">ping [host]</span>  - ping server','<span class="t-blue">nmap</span>         - port scan','<span class="t-blue">neofetch</span>     - system info','<span class="t-blue">htop</span>         - process monitor','<span class="t-blue">ssh cybrief</span>  - connect to CyBrief','<span class="t-blue">skills</span>       - list skills','<span class="t-blue">history</span>      - command history','<span class="t-blue">open [app]</span>   - open app (incl. arcade, games)','<span class="t-blue">games</span>        - list mini-games','<span class="t-blue">play [game]</span>  - highway | hexrush','<span class="t-blue">resume</span>       - view resume','<span class="t-blue">hack [tgt]</span>   - simulate breach','<span class="t-blue">scan_network</span> - simulate port scan','<span class="t-blue">root</span>         - escalate privileges','<span class="t-blue">clear</span>        - clear terminal','<span class="t-blue">ctf</span>          - launch CTF challenges','<span class="t-blue">mission [name]</span> - view missions','<span class="t-blue">hint [mission]</span> - get mission hints','<span class="t-blue">solve [mission]</span> - get mission solutions','<span class="t-blue">submit_flag</span>  - submit CTF flag','<span class="t-blue">sudo hire maitrik</span> - easter egg'];for(var i=0;i<l.length;i++)this.print(l[i],'markup');},
    whoami:function(){this.print('maitrik makwana -- B.Tech CE @ CHARUSAT (9.2 CGPA) | Cybersecurity Intern @ CyBrief | Video Editor & 3D Animator | Surat, Gujarat');},
    ls:function(args){
      var isAll = (args && args.indexOf('-a') > -1);
      var allSkills = ['VAPT','Nmap','Burp_Suite','Metasploit','Wireshark','SQLMap','Scapy','Python','C++','C','SQL','Bash','JavaScript','TypeScript','React.js','Tailwind','Node.js','Express.js','PostgreSQL','Prisma','FastAPI','AWS','Docker','Linux','Git','Cloudflare_R2','spaCy','Presidio_NLP','Tesseract_OCR','YOLOv8'];
      var dirs={'~':['about_me.txt','projects/','experience/','skills.json','.bashrc','.ssh/', 'skills/'],'projects':['PyGuard/','TAPMS/','PeerConnect/','PII-Data-Sanitization/','CloudEnthu/'],'projects/':['PyGuard/','TAPMS/','PeerConnect/','PII-Data-Sanitization/','CloudEnthu/'],'skills':allSkills,'skills/':allSkills,'experience':['cybrief_intern.log','gdg_charusat.log'],'experience/':['cybrief_intern.log','gdg_charusat.log']};
      var target = '~';
      for(var i=0;i<(args?args.length:0);i++){ if(args[i]!=='-a'){ target=args[i]; break; } }
      var items=dirs[target];
      if(items){
        if(isAll && target==='~') items = items.concat(['.secret_flag']);
        var h='';for(var i=0;i<items.length;i++){if(items[i].charAt(items[i].length-1)==='/')h+='<span class="t-blue">'+items[i]+'</span>   ';else h+=items[i]+'   ';}
        this.print(h,'markup');
      }else this.print('ls: cannot access \''+target+'\'');
    },
    cat:function(args){
      var files={
        'about_me.txt':['Name     : Maitrik Makwana','Location : Surat, Gujarat, India','Role     : CE Student | Cybersecurity Enthusiast | Creative Professional','Tagline  : Building real-world tech with a drive for cybersecurity & cloud','','Education: B.Tech Computer Engineering @ CHARUSAT (2023-2027)','CGPA     : 9.2 / 10.0 (5th Semester)','','Experience:','  - Cybersecurity Intern @ CyBrief Pvt. Ltd. (May-Jun 2025)','  - Video Editor & 3D Animator @ GDG CHARUSAT [Ongoing]','  - University Media Crew @ CHARUSAT (2024-2025)','  - Freelance Video Editing & 3D Animation','','Hobbies  : Photography, Filmmaking, 3D Animation'],
        'resume':['Opening resume viewer...','(Triggering PDF viewer)'],
        'skills.json':['{','  "cybersecurity": {','    "Nmap": "80%", "Burp Suite": "70%", "Metasploit": "70%",','    "Wireshark": "80%", "SQLMap": "70%", "OWASP VAPT": "75%"','  },','  "languages": {','    "C++": "80%", "Python": "60%", "SQL": "70%",','    "Bash": "70%", "JavaScript": "50%"','  },','  "stack": {','    "React": "50%", "Node.js": "50%", "Express": "55%",','    "PostgreSQL": "65%", "Docker": "60%", "AWS": "60%"','  },','  "creative": {','    "3D Animation": "80%", "Video Editing": "80%", "Photography": "Hobby"','  }','}'],
        'projects':['1. PyGuard      -- Network Traffic Capture & ML IDS Analysis (Python, PyQt5, Scapy)','2. CloudEnthu   -- AWS Learning Blog CMS (React, Node.js, PostgreSQL)','3. PII Sanitizer -- AI-powered PII Detection Platform (React, Express, Presidio NLP)','4. PeerCloud    -- Community IaaS Platform [In Progress] (Docker, Node.js)','','Most Proud: PyGuard -- used by CHARUSAT lab faculty for teaching network security!'],
        '.bashrc':['# MaitrikOS .bashrc','export PS1="\\u@\\h:\\w$ "','alias hack="echo Nice try, run: hack [target]"','alias pyguard="python run_pyguard.py"'],
        '.secret_flag':['Wow, you actually checked hidden files!','Flag: HTB{gh0st_1n_th3_sh3ll_maitrik}','Submit with: submit_flag HTB{gh0st_1n_th3_sh3ll_maitrik}']
      };
      if(!args||!args[0]){this.print('cat: missing operand');return;}
      if(args[0]==='resume'){this.print('Opening Document Viewer...');OS.openApp('pdf-win');return;}
      var c=files[args[0]];if(c)for(var i=0;i<c.length;i++)this.print(c[i]);else this.print('cat: '+args[0]+': No such file or directory');
    },
    pwd:function(){this.print('/home/maitrik');},
    ping:function(args){var host=(args&&args[0])||'maitrik.dev';this.print('PING '+host+' (192.168.1.142): 56 data bytes');var self=this;for(var i=1;i<=3;i++){(function(seq){setTimeout(function(){self.print('64 bytes from '+host+': icmp_seq='+seq+' ttl=64 time='+(Math.random()*3+0.1).toFixed(3)+' ms');if(seq===3)self.print('--- 3 packets, 3 received, 0% loss \ud83d\udfe2');self.scrollBottom();},seq*600);})(i);}},
    nmap:function(){this.print('Starting Nmap 7.92 ( https://nmap.org )');this.print('Nmap scan report for localhost (127.0.0.1)\n');this.print('<span class="t-muted">PORT       STATE  SERVICE        VERSION</span>','markup');var ports=[['22/tcp','open','ssh','[Python]'],['80/tcp','open','http','[ReactJS]'],['443/tcp','open','https','[AWS]'],['4444/tcp','open','metasploit','[Exploitation]'],['5432/tcp','open','postgresql','[Database]'],['8080/tcp','open','proxy','[Burp Suite]']];for(var i=0;i<ports.length;i++){var p=ports[i];while(p[0].length<10)p[0]+=' ';while(p[1].length<7)p[1]+=' ';while(p[2].length<15)p[2]+=' ';this.print('<span class="t-green">'+p[0]+'</span><span class="t-yellow">'+p[1]+'</span>'+p[2]+'<span class="t-muted">'+p[3]+'</span>','markup');}},
    neofetch:function(){var l=['<span class="t-green">    .--.</span>        <span class="t-green">maitrik</span>@<span class="t-blue">maitrik-os</span>','<span class="t-green">   |o_o |</span>       ---------------------','<span class="t-green">   |:_/ |</span>       <span class="t-blue">OS:</span> MaitrikOS (Human v21)','<span class="t-green">  //   \\\\ \\\\</span>      <span class="t-blue">Host:</span> CHARUSAT University','<span class="t-green"> (|     | )</span>     <span class="t-blue">CGPA:</span> 9.2/10.0','<span class="t-green">/\'\\\\_ _/`\\\\</span>     <span class="t-blue">Role:</span> CyberSec @ CyBrief','<span class="t-green">\\\\___)=(___/</span>    <span class="t-blue">Skills:</span> Nmap \u00b7 Burp \u00b7 MSF \u00b7 Docker'];for(var i=0;i<l.length;i++)this.print(l[i],'markup');},
    htop:function(){this.print('<span class="t-green">MaitrikOS</span> | Tasks: <span class="t-yellow">8</span> running','markup');this.print('<span class="t-muted">PID  NAME                 CPU%  STATUS</span>','markup');var p=[['001','vapt-engine','87%','Running'],['002','nmap-scanner','80%','Running'],['003','burpsuite','72%','Running'],['004','python','65%','Running'],['005','aws-cloud','58%','Running'],['008','ml-ids','40%','Learning']];for(var i=0;i<p.length;i++){var x=p[i];while(x[0].length<5)x[0]+=' ';while(x[1].length<21)x[1]+=' ';while(x[2].length<6)x[2]+=' ';var col=x[3]==='Learning'?'t-yellow':'t-green';this.print(x[0]+x[1]+'<span class="t-green">'+x[2]+'</span><span class="'+col+'">'+x[3]+'</span>','markup');}},
    ssh:function(args){var d=(args&&args[0])||'';if(d==='cybrief'){this.print('Connecting to CyBrief Pvt Ltd... (Ahmedabad, GJ)');var self=this;setTimeout(function(){self.print('<span class="t-green">Connected</span> -- CyBrief Pvt. Ltd. | Intern ID: CBPL-I0100','markup');self.print('Duration : 12 May 2025 – 28 June 2025 (6 weeks)');self.print('Role     : Cybersecurity Intern');self.print('[+] VAPT on DVWA and Metasploitable2 (OWASP methodology)');self.print('[+] Wrote professional security assessment reports');self.print('[+] Tools used: Nmap, Burp Suite, Metasploit, TryHackMe');self.print('Connection closed by remote host.');self.scrollBottom();},800);}else this.print('ssh: Could not resolve hostname '+d+': Name or service not known');},
    history:function(){var f=['[1001] ssh maitrik@cybrief.pvt','[1002] nmap -sV -sC 192.168.1.0/24','[1003] msfconsole -q','[1004] use exploit/unix/ftp/vsftpd_234_backdoor','[1005] set RHOSTS 192.168.56.101 && exploit','[1006] python run_pyguard.py --capture eth0 --db postgres','[1007] cat vapt_report_dvwa.pdf | grep CRITICAL','[1008] git push origin main  # PyGuard v1.2','[1009] blender --background render_intro.blend','[1010] echo "sleep is a vulnerability" >> /var/log/thoughts'];for(var i=0;i<f.length;i++)this.print(f[i]);},
    skills:function(){
      this.print('<span class="t-green">cat /etc/skills.conf</span>','markup');
      this.print('[CyberSec  ] Nmap (80%) | Burp Suite (70%) | Metasploit (70%) | Wireshark (80%) | SQLMap (70%)');
      this.print('[Languages ] C++ (80%) | Python (60%) | SQL (70%) | Bash (70%) | JavaScript (50%)');
      this.print('[Stack     ] React (50%) | Node.js (50%) | PostgreSQL (65%) | Docker (60%) | AWS (60%)');
      this.print('[Creative  ] 3D Animation (80%) | Video Editing (80%) | Photography (Hobby)');
      this.print('[Certs     ] Google Cybersecurity [In Progress] | AWS CLF-C02 [Appearing]');
    },
    resume:function(){this.print('Opening Document Viewer...');OS.openApp('pdf-win');},
    roadmap:function(){this.print('Accessing digital roadmap...');OS.openApp('roadmap-win');},
    specs:function(){this.print('Fetching system specifications...');OS.openApp('specs-win');},
    socials:function(){
      this.print('<span class="t-green">Maitrik Makwana -- Online Presence</span>','markup');
      this.print('<span class="t-blue">GitHub:</span>    https://github.com/MaitrikMakwana');
      this.print('<span class="t-blue">LinkedIn:</span>  https://www.linkedin.com/in/maitrik-makwana-5a9575283/');
      this.print('<span class="t-blue">Instagram:</span> https://www.instagram.com/maitrik__makwana/');
      this.print('<span class="t-blue">Email:</span>     maitrikmakwana18@gmail.com');
      this.print('\nType <span class="t-blue">open [platform]</span> to launch (github / linkedin / instagram)','markup');
    },
    open:function(args){var map={'terminal':'terminal-win','about':'neofetch-win','neofetch':'neofetch-win','projects':'projects-win','contact':'contact-win','vapt':'vapt-win','htop':'htop-win','achievements':'ctf-win','resume':'pdf-win','arcade':'arcade-win','games':'arcade-win','roadmap':'roadmap-win','specs':'specs-win','vault':'vault-win','tools':'tools-win','map':'map-win','logs':'logs-win','github':'https://github.com/MaitrikMakwana','linkedin':'https://www.linkedin.com/in/maitrik-makwana-5a9575283/','instagram':'https://www.instagram.com/maitrik__makwana/'};if(!args||!args[0]){this.print('open: try: '+Object.keys(map).join(', '));return;}var id=map[args[0]];if(id){if(id.startsWith('http')){window.open(id,'_blank');this.print('Redirecting to '+args[0]+'...');}else{OS.openApp(id);this.print('Opening '+args[0]+'...');}}else this.print('open: \''+args[0]+'\' not found');},
    games:function(){this.print('<span class="t-green">~/games</span> — built into MaitrikOS','markup');this.print('  play highway — Neon Highway (3-lane dodge, A/D or arrows)');this.print('  play hexrush — type payloads before the timer runs out');this.print('Or: <span class="t-blue">open arcade</span> for the full window.','markup');},
    play:function(args){var g=args&&args[0]?args[0].toLowerCase():'';if(g!=='highway'&&g!=='hexrush'){this.print('Usage: play highway | hexrush');return;}if(typeof MiniGames==='undefined'){this.print('games module not loaded.');return;}OS.openApp('arcade-win');var self=this;setTimeout(function(){MiniGames.switchTo(g);if(g==='highway')MiniGames.highway.focusCanvas();else{var i=document.getElementById('hexrush-input');if(i)i.focus();}self.print('Launched: '+g);},280);},
    clear:function(){if(this.output)this.output.innerHTML='';},
    submit_flag:function(args){
      if(!args||args.length===0){ this.print('Usage: submit_flag {flag}'); return; }
      if(args[0]==='HTB{gh0st_1n_th3_sh3ll}'){
        this.print('<span class="t-green" style="font-size:18px; font-weight:bold;">\u2691 ACHIEVEMENT UNLOCKED: "Ghost in the Shell"</span>','markup');
        this.print('Congratulations! You found the hidden flag. Welcome to the elite tier.');
        Notif.show('CTF Subsystem','Flag accepted! You found it!','&#127942;');
        Achievement.unlock('ghost_in_shell');
      } else {
        this.print('<span class="t-red">Invalid flag. Keep hunting.</span>','markup');
      }
    },
    cowsay:function(args){
      var msg=args?args.join(' '):'Moo.';
      var l=msg.length+2;var b=' ';for(var i=0;i<l;i++)b+='-';
      this.print(b);this.print('&lt; '+this.escape(msg)+' &gt;','markup');this.print(b);
      this.print('        \\   ^__^');this.print('         \\  (oo)\\_______');this.print('            (__)\\       )\\/\\');this.print('                ||----w |');this.print('                ||     ||');
    },
    hack:function(args){
      var tgt=(args&&args[0])||'127.0.0.1';
      this.print('Initializing exploit payload for '+tgt+'...');
      var self=this;
      var lines=['[!] Exploit sequence started','[+] Bypassing firewall...','[+] Exploiting vsftpd 2.3.4 backdoor','[+] Injecting shellcode...','[+] Escalating privileges...','[!] ROOT ACCESS GRANTED','[+] Wiping logs...'];
      for(var i=0; i<lines.length; i++){
        (function(ln, idx){
          setTimeout(function(){
            self.print('<span class="'+(idx===5?'t-red':'t-green')+'">'+ln+'</span>','markup');
            if(idx===6) self.print('\nBreach successful. Control established.');
          }, (idx+1)*500);
        })(lines[i], i);
      }
    },
    scan_network:function(){
      this.print('Scanning local network for vulnerable nodes...');
      var self=this;
      var count=0;
      var iv = setInterval(function(){
        count += 10;
        self.print(`Progress: [${'='.repeat(count/5)}${' '.repeat(20-count/5)}] ${count}%`);
        if(count >= 100){
          clearInterval(iv);
          self.print('\nScan complete. 3 vulnerable hosts identified.');
          self.print('Type <span class="t-blue">nmap</span> for details.','markup');
        }
      }, 300);
    },
    root:function(){
      this.print('Escalating privileges to ROOT...');
      var self=this;
      setTimeout(function(){
        toggleRootMode();
        self.print('<span class="t-red">SYSTEM OVERRIDE: Breach Mode Active.</span>','markup');
      }, 1000);
    },
    sl:function(){
      this.print('      ====        ________                ___________');
      this.print('  _D _|  |_______/        \\__I_I_____===__|_________|');
      this.print('   |(_)---  |   H\\________/ |   |        =|___ ___|');
      this.print('   /     |  |   H  |  |     |   |         ||_| |_||');
      this.print('  |      |  |   H  |__--------------------| [___] |');
      this.print('  | ________|___H__/__|_____/[][]~\\_______|       |');
      this.print('  |/ |   |-----------I_____I [][] []  D   |=======|__');
    },
    ctf:function(){
      this.print('Launching CTF Challenge Arena...');
      OS.openApp('ctf-challenge-win');
    },
    sudo:function(args){var j=args?args.join(' '):'';if(j==='hire me'||j==='hire maitrik'){this.print('[sudo] password for maitrik: ');var self=this;setTimeout(function(){self.print('<span class="t-green">Access granted.</span>','markup');self.print('Redirecting to maitrikmakwana18@gmail.com...');Notif.show('System','sudo hire maitrik executed!','&#128640;');setTimeout(function(){window.open('mailto:maitrikmakwana18@gmail.com');},500);},800);}else if(j==='rm -rf /'||j==='rm -rf / --no-preserve-root'){fakeDelete(this);}else this.print('[sudo] incident will be reported.');},
    mission:function(args){
      if(!args||args.length===0){
        this.print('Available Missions:');
        this.print('1. explore_system - Discover hidden files and commands');
        this.print('2. find_flag - Locate the hidden CTF flag');
        this.print('3. contact_me - Send a message through the contact form');
        this.print('Usage: mission {mission_name}');
        return;
      }
      var m=args[0];
      if(m==='explore_system'){
        this.print('Mission: Explore the System');
        this.print('Objective: Use terminal commands to explore the filesystem.');
        this.print('Hint: Start with "ls" and "cat" commands.');
        this.print('Reward: Explorer Badge');
      } else if(m==='find_flag'){
        this.print('Mission: Find the Flag');
        this.print('Objective: Submit the hidden CTF flag.');
        this.print('Hint: The flag is HTB{gh0st_1n_th3_sh3ll}');
        this.print('Reward: Ghost in the Shell Achievement');
      } else if(m==='contact_me'){
        this.print('Mission: Contact Me');
        this.print('Objective: Send a message via the contact form.');
        this.print('Hint: Fill out the contact form in the Firefox app.');
        this.print('Reward: Communicator Badge');
      } else {
        this.print('Unknown mission: '+m);
      }
    },
    hint:function(args){
      if(!args||args.length===0){
        this.print('Usage: hint {mission_name}');
        return;
      }
      var m=args[0];
      if(m==='explore_system'){
        this.print('Hint: Try "ls -a" to see hidden files, then "cat .bashrc"');
      } else if(m==='find_flag'){
        this.print('Hint: The flag starts with HTB{...}');
      } else if(m==='contact_me'){
        this.print('Hint: Open the Firefox app and look for the contact form.');
      } else {
        this.print('No hint available for: '+m);
      }
    },
    solve:function(args){
      if(!args||args.length===0){
        this.print('Usage: solve {mission_name}');
        return;
      }
      var m=args[0];
      if(m==='explore_system'){
        this.print('Solution: ls -a && cat .bashrc');
        Achievement.unlock('explorer');
      } else if(m==='find_flag'){
        this.print('Solution: submit_flag HTB{gh0st_1n_th3_sh3ll}');
      } else if(m==='contact_me'){
        this.print('Solution: Open Firefox app and submit the contact form.');
      } else {
        this.print('No solution available for: '+m);
      }
    }
  }
};

function fakeDelete(term){var ov=$('fake-delete-overlay'),tx=$('fake-delete-text');if(!ov||!tx)return;ov.classList.remove('hidden');tx.innerHTML='';var files=['Deleting /usr/bin/nmap...','Deleting /opt/burpsuite/...','Deleting /home/maitrik/projects/PyGuard/...','Deleting /home/maitrik/projects/TAPMS/...','Deleting /var/log/experience.log...','Deleting /etc/skills.conf...','rm: cannot remove \'/home/maitrik/determination\': Permission denied','rm: cannot remove \'/home/maitrik/passion\': Operation not permitted','','Just kidding. Nice try. \ud83d\ude04','System restored.'];var idx=0;function next(){if(idx>=files.length){setTimeout(function(){ov.classList.add('hidden');term.print('<span class="t-green">System restored. Nice try! \ud83d\ude04</span>','markup');},2000);return;}var l=document.createElement('div');l.textContent=files[idx];tx.appendChild(l);idx++;setTimeout(next,idx<7?250:800);}next();}

// ---- GHOST TYPING ----
var GhostTyper={
  typing:false,
  typeCmd:function(cmd,callback){
    if(!Terminal.input||!Terminal.output)return callback&&callback();
    Terminal.ghostActive=true; this.typing=true;
    Terminal.input.value='';Terminal.input.disabled=true;
    var i=0,self=this;
    function typeChar(){
      if(i>=cmd.length){
        setTimeout(function(){
          Terminal.input.value='';Terminal.input.disabled=false;
          Terminal.printPrompt(cmd);Terminal.execute(cmd);Terminal.scrollBottom();
          self.typing=false;
          if(callback)callback();
        },300);
        return;
      }
      Terminal.input.value+=cmd.charAt(i);i++;
      var delay=50+Math.random()*80;
      if(cmd.charAt(i-1)===' ')delay+=40;
      setTimeout(typeChar,delay);
    }
    typeChar();
  }
};

// ---- GHOST SEQUENCE (Choreographed auto-opening) ----
var GhostSequence={
  running:false,
  start:function(){
    this.running=true;
    var self=this;
    // 0s: Desktop appears (already done)
    // 0.6s: Terminal opens
    setTimeout(function(){OS.openApp('terminal-win');},600);
    // 2s: Ghost starts typing whoami
    setTimeout(function(){
      GhostTyper.typeCmd('whoami',function(){
        // 2s pause then nmap
        setTimeout(function(){
          GhostTyper.typeCmd('nmap',function(){
            // 2s pause then ls projects/
            setTimeout(function(){
              GhostTyper.typeCmd('ls projects/',function(){
                // Hand over control
                setTimeout(function(){
                  Terminal.ghostActive=false;
                  Terminal.print('\n<span class="t-yellow">Session handed over. Your turn \u2192</span>','markup');
                  Terminal.print('Type <span class="t-blue">help</span> to see all commands.\n','markup');
                  Terminal.scrollBottom();
                  // Start cursor wiggle invite
                  var inp=$('term-input');if(inp){inp.classList.add('wiggle');inp.focus();}
                  // Stop radar
                  var rp=$q('.radar-ping');if(rp)rp.classList.remove('active');
                  self.running=false;
                },500);
              });
            },2000);
          });
        },2000);
      });
    },2500);
    // 8s: neofetch window auto-opens
    setTimeout(function(){OS.openApp('neofetch-win');},8000);
    // 12s: Projects folder opens
    setTimeout(function(){OS.openApp('projects-win');},12000);
    // 16s: VAPT report opens with row highlights
    setTimeout(function(){OS.openApp('vapt-win');self.highlightVaptRows();},16000);
    // Start radar pulse on terminal icon
    setTimeout(function(){var rp=$q('.radar-ping');if(rp)rp.classList.add('active');},1000);
    // Welcome notification
    setTimeout(function(){Notif.show('MaitrikOS','Welcome back, maitrik!','&#128187;');},800);
  },
  highlightVaptRows:function(){
    var rows=document.querySelectorAll('.vapt-finding');
    for(var i=0;i<rows.length;i++){
      rows[i].style.animationDelay=(i*300)+'ms';
      (function(row,idx){
        setTimeout(function(){row.classList.add('highlight');setTimeout(function(){row.classList.remove('highlight');},1500);},idx*500);
      })(rows[i],i);
    }
  }
};

// ---- INCOMING CONNECTION POPUP ----
var IncomingPopup={
  show:function(){
    var popup=$('incoming-popup');if(!popup)return;
    // Generate fake IP
    var ip=Math.floor(Math.random()*200+10)+'.'+Math.floor(Math.random()*255)+'.'+Math.floor(Math.random()*255)+'.'+Math.floor(Math.random()*255);
    var ipEl=$('visitor-ip');if(ipEl)ipEl.textContent=ip;
    popup.classList.remove('hidden','accepted');
  },
  accept:function(){
    var popup=$('incoming-popup');if(!popup)return;
    popup.classList.add('accepted');
    Notif.show('Firewall','Connection accepted. Welcome, visitor.','&#128274;');
    setTimeout(function(){popup.classList.add('hidden');},400);
  },
  deny:function(){
    var popup=$('incoming-popup');if(!popup)return;
    popup.classList.add('accepted');
    Notif.show('Firewall','Inbound connection dropped by policy.','&#128683;');
    setTimeout(function(){popup.classList.add('hidden');},400);
  }
};

// ---- ACTIVITY FEED ----
var ActivityFeed={
  items:[
    {dot:'#00ff41',text:'PyGuard: running in CHARUSAT network lab  live'},
    {dot:'#58a6ff',text:'PeerCloud: Docker IaaS pipeline active    build'},
    {dot:'#ffcc00',text:'Google Cybersecurity Cert: module 4/8     ongoing'},
    {dot:'#ff5f57',text:'Threat Map: inbound scan blocked          active'},
    {dot:'#00ff41',text:'CyBrief VAPT: 2 reports delivered         done'},
    {dot:'#58a6ff',text:'GDG CHARUSAT: promo video exported        2d ago'},
    {dot:'#bc8cff',text:'AWS CLF-C02: exam prep in progress        study'},
    {dot:'#ffcc00',text:'PII Sanitizer: v1.2 pipeline test passed  3d ago'},
    {dot:'#00ff41',text:'CloudEnthu: live at cloud-enthu.vercel.app shipped'}
  ],
  idx:0,iv:null,
  start:function(){
    this.tick();var s=this;this.iv=setInterval(function(){s.tick();},3500);
  },
  tick:function(){
    var el=$('activity-text'),dot=$q('.activity-dot');if(!el)return;
    var item=this.items[this.idx%this.items.length];
    el.style.opacity='0';
    var self=this;
    setTimeout(function(){
      el.textContent=item.text;el.style.opacity='1';
      if(dot)dot.style.background=item.dot;
      self.idx++;
    },300);
  }
};

// ---- CURSOR TRAIL ----
var CursorTrail={
  container:null,throttle:0,
  init:function(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    this.container=$('cursor-trail');if(!this.container)return;
    var self=this;
    document.addEventListener('mousemove',function(e){
      var now=Date.now();if(now-self.throttle<50)return;self.throttle=now;
      var dot=document.createElement('div');
      dot.className='trail-dot';dot.style.left=(e.clientX-2)+'px';dot.style.top=(e.clientY-2)+'px';
      self.container.appendChild(dot);
      setTimeout(function(){dot.remove();},600);
    });
  }
};

// ---- PARALLAX ----
var Parallax={
  init:function(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var cx=innerWidth/2,cy=innerHeight/2;
    document.addEventListener('mousemove',function(e){
      var dx=(e.clientX-cx)/cx,dy=(e.clientY-cy)/cy;
      var wins=document.querySelectorAll('.parallax-win.win-open');
      for(var i=0;i<wins.length;i++){
        if(wins[i].style.display==='none')continue;
        var depth=parseFloat(wins[i].dataset.depth)||0.5;
        var ox=dx*4*depth,oy=dy*3*depth;
        wins[i].style.transform='translate('+ox.toFixed(1)+'px,'+oy.toFixed(1)+'px)';
      }
    });
    addEventListener('resize',function(){cx=innerWidth/2;cy=innerHeight/2;});
  }
};

// ---- CURSOR INVITATION WIGGLE ----
(function(){
  // Remove wiggle when user starts typing
  document.addEventListener('keydown',function(){
    var inp=$('term-input');if(inp)inp.classList.remove('wiggle');
  });
  // Re-add wiggle after 5s idle
  var idleTimer=null;
  document.addEventListener('mousemove',function(){
    clearTimeout(idleTimer);
    idleTimer=setTimeout(function(){
      var inp=$('term-input');
      if(inp&&!Terminal.ghostActive&&document.activeElement!==inp){
        inp.classList.add('wiggle');
        var rp=$q('.radar-ping');if(rp)rp.classList.add('active');
      }
    },5000);
  });
})();

// ---- AUTO TOUR ----
var AutoTour={
  running:false,
  start:function(){
    if(this.running){this.stop();return;}
    this.running=true;
    var btn=$('btn-tour');if(btn){btn.textContent='\u25a0 Stop';btn.classList.add('touring');}
    // Close all windows first
    var wins=document.querySelectorAll('.win.win-open');for(var i=0;i<wins.length;i++)WM.close(wins[i].id);
    var self=this;var steps=[
      function(){OS.openApp('terminal-win');},
      function(){GhostTyper.typeCmd('whoami',function(){});},
      function(){GhostTyper.typeCmd('neofetch',function(){});},
      function(){OS.openApp('neofetch-win');},
      function(){OS.openApp('projects-win');},
      function(){OS.openApp('vapt-win');Notif.show('VAPT','Security Assessment Report opened','&#128737;');},
      function(){OS.openApp('htop-win');},
      function(){OS.openApp('ctf-win');},
      function(){OS.openApp('contact-win');Notif.show('Tour','Tour complete! Explore freely.','&#127942;');self.stop();}
    ];
    var idx=0;
    function next(){
      if(!self.running||idx>=steps.length)return;
      steps[idx]();idx++;
      setTimeout(next,3000);
    }
    setTimeout(next,500);
  },
  stop:function(){
    this.running=false;
    var btn=$('btn-tour');if(btn){btn.textContent='\u25b6 Tour';btn.classList.remove('touring');}
    Terminal.ghostActive=false;
    var inp=$('term-input');if(inp)inp.disabled=false;
  }
};

// ---- MOBILE TERMINAL ----
var MobileTerminal={
  output:null,input:null,
  init:function(){
    if(innerWidth>=768)return;
    var mOut=$('mobile-output'),mIn=$('mobile-input');if(!mOut||!mIn)return;
    this.output=mOut;this.input=mIn;
    this.print('Welcome to <span class="t-green">MaitrikOS</span> Mobile','markup');
    this.print('Tap buttons or type commands.\n','markup');
    this.run('neofetch');
    var self=this;mIn.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();var cmd=mIn.value.trim();mIn.value='';if(cmd)self.run(cmd);}});
  },
  print:function(c,t){t=t||'text';var d=document.createElement('div');d.className='term-line';if(t==='markup')d.innerHTML=c;else d.textContent=c;if(this.output)this.output.appendChild(d);if(this.output)this.output.scrollTop=this.output.scrollHeight;},
  run:function(cmd){this.print('<span class="t-green">$</span> '+cmd,'markup');var parts=cmd.split(' '),c=parts[0].toLowerCase(),args=parts.slice(1);var h=Terminal.commands[c];if(h){var orig=Terminal.output,origS=Terminal.scrollBottom;Terminal.output=this.output;var self=this;Terminal.scrollBottom=function(){if(self.output)self.output.scrollTop=self.output.scrollHeight;};h.call(Terminal,args);Achievement.trackCommand(c);Terminal.output=orig;Terminal.scrollBottom=origS;}else this.print('command not found: '+c);}
};
