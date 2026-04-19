// Matrix Digital Rain
const canvas = document.getElementById('matrix-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~';
  const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン';
  const cyrillic = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  const characters = alphanumeric + katakana + cyrillic;
  
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  
  const drops = [];
  for (let x = 0; x < columns; x++) {
    drops[x] = 1;
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(2, 10, 2, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px "Fira Code", monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(Math.floor(Math.random() * characters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  setInterval(drawMatrix, 40);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Typing Effect for description blocks
const typeTexts = document.querySelectorAll('.type-effect');
typeTexts.forEach((el) => {
  const text = el.innerText;
  el.innerText = '';
  let i = 0;
  function typeWriter() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, 20);
    }
  }
  
  // Use Intersection Observer for scroll triggers
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      typeWriter();
      observer.unobserve(el);
    }
  });
  observer.observe(el);
});

// Glitch Header Application
const glitchHeaders = document.querySelectorAll('.section-heading-article');
glitchHeaders.forEach(heading => {
  heading.classList.add('glitch');
  heading.setAttribute('data-text', heading.innerText);
});

// Terminal Cursor Blink
const injectTerminalStyles = document.createElement('style');
injectTerminalStyles.innerHTML = `
  .glitch {
    position: relative;
    color: white;
  }
  .glitch::before, .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
  }
  .glitch::before {
    left: 2px;
    text-shadow: -2px 0 red;
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch-anim 3s infinite linear alternate-reverse;
  }
  .glitch::after {
    left: -2px;
    text-shadow: -2px 0 blue;
    clip: rect(85px, 550px, 140px, 0);
    animation: glitch-anim 2.5s infinite linear alternate-reverse;
  }
  @keyframes glitch-anim {
    0% { clip: rect(31px, 9999px, 94px, 0); }
    10% { clip: rect(112px, 9999px, 76px, 0); }
    20% { clip: rect(85px, 9999px, 77px, 0); }
    30% { clip: rect(27px, 9999px, 97px, 0); }
    40% { clip: rect(86px, 9999px, 87px, 0); }
    50% { clip: rect(87px, 9999px, 84px, 0); }
    60% { clip: rect(11px, 9999px, 96px, 0); }
    70% { clip: rect(59px, 9999px, 62px, 0); }
    80% { clip: rect(1px, 9999px, 14px, 0); }
    90% { clip: rect(86px, 9999px, 80px, 0); }
    100% { clip: rect(74px, 9999px, 120px, 0); }
  }

  .tech-stack-box {
    border-color: #00ff00 !important;
    background-color: #001100 !important;
    box-shadow: 0 0 10px #00ff0033 !important;
    transition: 0.3s ease all !important;
  }
  .tech-stack-box:hover {
    transform: scale(1.1) !important;
    box-shadow: 0 0 20px #00ff00 !important;
    background-color: #002200 !important;
  }
  
  .project-box {
    border: 1px solid #00ff00 !important;
    background: rgba(0, 20, 0, 0.8) !important;
    box-shadow: inset 0 0 10px #00ff0055, 0 0 15px #000 !important;
  }
  
  ::selection {
    background-color: #00ff00 !important;
    color: #000 !important;
  }
`;
document.head.appendChild(injectTerminalStyles);
