// app.js — compartido en todas las páginas: tema, navbar, footer, avatar,
// skyline, generador de portadas pixel art e iconos de redes.

const THEME_KEY = 'legans8-theme';

/* ---------- Avatar del creador (parpadeo y habla los maneja home.js) ---------- */
const AVATAR_IMG = `<span class="avatar-blink">
  <img class="avatar-open" id="avatarVivo" src="media/happy/1 happy.png" alt="Avatar pixel art de Legans_8">
</span>`;

/* ---------- Frases geek compartidas (bocadillos del inicio y de contacto) ---------- */
const CHARLA_GEEK = [
  '¿Sabías? Mario se llamaba "Jumpman" en Donkey Kong',
  '¿Sabías? Pac-Man nació de una pizza sin una rebanada',
  'El primer easter egg está en Adventure (Atari, 1979)',
  'Tetris se creó en la URSS en 1984',
  'Zelda se llama así por Zelda Fitzgerald',
  'En Metroid (1986) Samus sorprendió a todos: ¡era ella!',
  'El Konami Code: ↑↑↓↓←→←→ B A',
  'La primera versión de Minecraft se hizo en 6 días',
  'GTA iba a ser un juego de policías... salió al revés',
  'Sonic tiene un solo ojo con dos pupilas. Míralo bien',
  '"It\'s-a me!"',
  '"The cake is a lie" — Portal',
  '"Es peligroso ir solo, toma esto" — Zelda',
  '"War never changes" — Fallout',
  '"YOU DIED" — Dark Souls',
  '"¡Objection!" — Phoenix Wright',
  '"Snake? ¡SNAAAKE!" — Metal Gear',
  '"Praise the sun \\[T]/" — Dark Souls',
  '"FUS RO DAH" — Skyrim',
  'Press F to pay respects',
  'GG WP',
  '¿Una partidita más? Solo una...',
  '¿Sabías? "Game Over" lo popularizó el arcade Space Invaders',
  '¿Sabías? La cruceta (D-pad) la inventó Nintendo para Game & Watch',
  '¿Sabías? Lara Croft iba a llamarse Laura Cruz',
  '¿Sabías? Los Goombas son setas que traicionaron al Reino Champiñón',
  '¿Sabías? Kratos significa "fuerza" en griego',
  '¿Sabías? Steve de Minecraft no tiene nombre oficial... era "Steve?"',
  '¿Sabías? El "blast processing" de Sega era casi puro marketing',
  '¿Sabías? Pikachu viene de "pika" (chispa) y "chu" (ratón)',
  '¿Sabías? Doom corre hasta en una calculadora y un test de embarazo',
  '¿Sabías? Halo iba a ser un juego de estrategia para Mac',
  '¿Sabías? El récord de Tetris (NES) cayó por el "rolling"',
  '¿Sabías? Crash Bandicoot se llamaba "Willie the Wombat"',
  '¿Sabías? Megaman es "Rockman" en Japón',
  '"Would you kindly?" — BioShock',
  '"Hey! Listen!" — Navi, Zelda',
  '"Do a barrel roll!" — Star Fox',
  '"Stay a while and listen" — Diablo',
  '"Nothing is true, todo está permitido" — Assassin\'s Creed',
  '"A man chooses, a slave obeys" — BioShock',
  '"Finish him!" — Mortal Kombat',
  '"Wake me up when you need me" — Halo',
  '"The right man in the wrong place..." — Half-Life',
  '"Cuando la vida te dé limones..." — Cave Johnson, Portal',
  '"¡Es hora del Power-Up!"',
  '"Requiescat in pace" — Assassin\'s Creed',
  'Easter egg: busca la vaca en Diablo II',
  'No te rindas: ¡el siguiente intento es el bueno!',
  '¿Speedrun o exploración? Yo me quedo con las dos',
  'Loot legendario incoming...',
  'Respawn en 3... 2... 1...',
  'Checkpoint guardado. Puedes seguir tranquilo',
  'Nivel de hype: AL MÁXIMO',
];

/* ---------- Iconos de redes (SVG, fill currentColor) ---------- */
const ICONS = {
  twitch: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.1 0L.5 4.1v16.4h5.6V24h3.1l3-3.4h4.6l6.2-6.2V0H2.1zm18.8 13.3l-3.6 3.6h-5.6l-3 3v-3H4.1V2.1h16.8v11.2zM17.3 5.6v6.2h-2.1V5.6h2.1zm-5.6 0v6.2H9.6V5.6h2.1z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2s-.2-1.6-.9-2.4c-.9-.9-1.9-.9-2.4-1C16.9 2.6 12 2.6 12 2.6s-4.9 0-8.2.2c-.5.1-1.5.1-2.4 1-.7.8-.9 2.4-.9 2.4S.3 8.1.3 10v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.4c.9.9 2 .9 2.5 1 1.8.2 7.6.2 8.1.2 0 0 4.9 0 8.2-.2.5-.1 1.5-.1 2.4-1 .7-.8.9-2.4.9-2.4s.2-1.9.2-3.8V10c0-1.9-.2-3.8-.2-3.8zM9.8 14.9V7.7l6.5 3.6-6.5 3.6z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.6 8.7L23.4 22h-7l-5.5-7.2L4.6 22H1.5l8.1-9.3L1 2h7.2l5 6.6L18.9 2zm-1.2 18h1.9L6.9 3.9H4.8L17.7 20z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zM12 0C8.7 0 8.3 0 7 .1 5.7.2 4.8.4 4 .7c-.8.3-1.5.7-2.2 1.4C1.1 2.8.7 3.5.4 4.3.1 5.1-.1 6 .1 7.3 0 8.3 0 8.7 0 12s0 3.7.1 5c.1 1.3.3 2.2.6 3 .3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 3 .6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.2-.3 3-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.6-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.2-.6-3-.3-.8-.7-1.5-1.4-2.2C21.8 1.1 21.1.7 20.3.4c-.8-.3-1.7-.5-3-.6C16 0 15.6 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3c-.2.4-.5.9-.6 1.3a18.3 18.3 0 0 0-5.5 0C9.1 3.9 8.8 3.4 8.6 3a19.7 19.7 0 0 0-4.9 1.5A20.4 20.4 0 0 0 .2 18.1a19.9 19.9 0 0 0 6 3c.5-.7.9-1.4 1.3-2.1-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1 .4.7.8 1.5 1.3 2.1a19.8 19.8 0 0 0 6-3 20.3 20.3 0 0 0-3.5-13.7zM8.5 15.3c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.2 1.1 2.1 2.4c0 1.3-.9 2.4-2.1 2.4zm7 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.2 1.1 2.1 2.4c0 1.3-.9 2.4-2.1 2.4z"/></svg>',
};

/* ---------- Portadas pixel art generadas ---------- */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h = (h ^ s.charCodeAt(i)) * 16777619 >>> 0; }
  return h;
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Portada vertical 3:4 (o apaisada para galería) en pixel art, determinista por id.
function coverURI(game, seed = 0, landscape = false) {
  const [c0, c1] = game.colores;
  const rand = rng(hashStr(game.id) + seed * 7919);
  const cols = landscape ? 16 : 9;
  const rows = landscape ? 10 : 12;
  const cell = 8;
  const w = cols * cell, h = rows * cell;
  let rects = `<rect width="${w}" height="${h}" fill="${c0}"/>`;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const r = rand();
      if (r > 0.82) {
        rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${c1}" opacity="${(0.35 + rand() * 0.5).toFixed(2)}"/>`;
      } else if (r < 0.12) {
        rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#000" opacity="0.25"/>`;
      }
    }
  }
  // motivo central: rombo pixelado
  const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2) - 1;
  [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]].forEach(([dx, dy]) => {
    rects += `<rect x="${(cx + dx) * cell}" y="${(cy + dy) * cell}" width="${cell}" height="${cell}" fill="${c1}"/>`;
  });
  // banda inferior oscura
  rects += `<rect x="0" y="${h - cell * 2}" width="${w}" height="${cell * 2}" fill="#000" opacity="0.35"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* ---------- Helpers ---------- */
function fmtFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]} de ${y}`;
}

// Portada real si el juego la tiene; pixel art generado como respaldo.
function coverSrc(g) {
  return g.portada ? encodeURI(g.portada) : coverURI(g);
}

function badgeHTML(estado) {
  return `<span class="badge badge-${estado}">${ESTADOS[estado]}</span>`;
}

function cardHTML(g) {
  return `
  <a class="card pixel-frame" href="juego.html?id=${g.id}">
    <span class="card-in">
      <span class="card-shine" aria-hidden="true"></span>
      <img class="card-cover" src="${coverSrc(g)}" alt="Portada de ${g.nombre}">
      <div class="card-body">
        <span class="card-title">${g.nombre.toUpperCase()}</span>
        <span class="card-meta">${g.genero} · ${g.plataforma}</span>
        <div class="card-foot">${badgeHTML(g.estado)}</div>
      </div>
    </span>
  </a>`;
}

function socialBtnHTML(s) {
  return `
  <a class="social-btn" href="${s.url}" target="_blank" rel="noopener" title="${s.nombre}">
    ${ICONS[s.id]}
    <span>${s.nombre.toUpperCase()}</span>
  </a>`;
}

/* ---------- Tema ---------- */
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
}

/* ---------- Navbar y footer ---------- */
function renderChrome() {
  const page = document.body.dataset.page || '';
  const links = [
    ['index.html', 'inicio', 'INICIO'],
    ['catalogo.html', 'catalogo', 'CATÁLOGO'],
    ['canales.html', 'canales', 'CANALES'],
    ['sobre-mi.html', 'sobre-mi', 'SOBRE MÍ'],
    ['contacto.html', 'contacto', 'CONTACTO'],
  ];
  document.body.insertAdjacentHTML('afterbegin', '<div class="crt-overlay" aria-hidden="true"></div>');

  const nav = `
  <header class="navbar">
    <div class="navbar-inner">
      <a class="brand" href="index.html"><span>Legans_8</span></a>
      <ul class="nav-links" id="navLinks">
        ${links.map(([href, id, label]) => `<li><a href="${href}" class="${id === page ? 'active' : ''}">${label}</a></li>`).join('')}
      </ul>
      <button class="theme-toggle" type="button"><img src="media/sol y luna.png" alt=""></button>
      <button class="hamburger" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button>
    </div>
  </header>`;

  const footer = `
  <footer class="footer">
    <div class="tetris-anim tetris-left" aria-hidden="true"></div>
    <div class="tetris-anim tetris-right" aria-hidden="true"></div>
    <div class="footer-inner">
      <a class="brand" href="index.html"><span>Legans_8</span></a>
      <div class="social-row">
        ${SOCIALS.map(s => `<a class="social-btn" style="min-width:56px;padding:10px" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.nombre}">${ICONS[s.id]}</a>`).join('')}
      </div>
      <p class="footer-note">Bienvenido a mi mundo — el catálogo de juegos de Legans_8. Hecho con cariño pixel a pixel.</p>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', nav);
  document.body.insertAdjacentHTML('beforeend', footer);

  setTheme(localStorage.getItem(THEME_KEY) || 'dark');
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // esperar a que carguen las imágenes para medir bien el alto de la página
    const arrancar = () => document.querySelectorAll('.tetris-anim').forEach(initTetris);
    if (document.readyState === 'complete') arrancar();
    else window.addEventListener('load', arrancar);
  }

  const burger = document.querySelector('.hamburger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  initCardFX();
  initCardZoom();
}

/* ---------- Transición al abrir un juego: la portada crece hasta llenar la
   pantalla, se navega a la ficha y ahí se encoge a su sitio (ver juego.js) ---------- */
function initCardZoom() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    const card = e.target.closest('a.card');
    if (!card) return;
    const img = card.querySelector('.card-cover');
    if (!img) return;
    e.preventDefault();
    const r = img.getBoundingClientRect();
    const clon = img.cloneNode();
    Object.assign(clon.style, {
      position: 'fixed', left: r.left + 'px', top: r.top + 'px',
      width: r.width + 'px', height: r.height + 'px',
      objectFit: 'cover', margin: '0', zIndex: '9999', imageRendering: 'pixelated'
    });
    document.body.appendChild(clon);
    sessionStorage.setItem('zoomFicha', '1');
    const anim = clon.animate(
      [{ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' },
       { left: '0px', top: '0px', width: '100vw', height: '100vh' }],
      { duration: 450, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
    // Fallback por si la animación no corre (pestaña oculta, etc.): navegar igual
    const irse = () => { location.href = card.href; };
    anim.onfinish = irse;
    setTimeout(irse, 700);
  });
}

/* ---------- Efectos de las tarjetas: tilt 3D + brillo holográfico + barra XP ---------- */
function initCardFX() {
  const sinMovim = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Materialización raster: la tarjeta se dibuja renglón por renglón, cada
  // renglón de izquierda a derecha, solo cuando entra por la parte de abajo.
  // Al salir de pantalla se oculta para que el efecto se repita.
  const limpiarMask = el => {
    ['maskImage', 'maskSize', 'maskPosition', 'maskRepeat',
     'webkitMaskImage', 'webkitMaskSize', 'webkitMaskPosition', 'webkitMaskRepeat']
      .forEach(p => { el.style[p] = ''; });
  };

  function rasterScan(card) {
    const el = card.querySelector('.card-in');
    if (!el) return;
    cancelAnimationFrame(card._raster);
    const CEL = 14;
    const w = el.offsetWidth, h = el.offsetHeight;
    const cols = Math.max(1, Math.ceil(w / CEL));
    const filas = Math.max(1, Math.ceil(h / CEL));
    const total = cols * filas;
    const porFrame = Math.max(1, Math.round(total / 200)); // ~200 frames ≈ 3.3 s
    let celda = 0;
    el.style.maskRepeat = el.style.webkitMaskRepeat = 'no-repeat';
    const paso = () => {
      celda += porFrame;
      if (celda >= total) { limpiarMask(el); return; }
      const fila = Math.floor(celda / cols);
      const col = celda % cols;
      const y = fila * CEL, x = col * CEL;
      // capa 1: renglones ya completos; capa 2: renglón en curso (avanza a la derecha)
      el.style.webkitMaskImage = el.style.maskImage = 'linear-gradient(#000,#000), linear-gradient(#000,#000)';
      el.style.webkitMaskSize = el.style.maskSize = `100% ${y}px, ${x}px ${CEL}px`;
      el.style.webkitMaskPosition = el.style.maskPosition = `0 0, 0 ${y}px`;
      card._raster = requestAnimationFrame(paso);
    };
    card._raster = requestAnimationFrame(paso);
  }

  const xpIO = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      const c = e.target;
      if (e.isIntersecting) {
        const mitad = (e.rootBounds ? e.rootBounds.height : innerHeight) / 2;
        const desdeAbajo = e.boundingClientRect.top >= mitad;
        c.classList.add('cargada');
        if (desdeAbajo && !sinMovim) rasterScan(c);
      } else {
        c.classList.remove('cargada');
        cancelAnimationFrame(c._raster);
        const el = c.querySelector('.card-in');
        if (el) limpiarMask(el);
      }
    });
  }, { threshold: 0.2 });
  const marcar = c => { c.classList.add('fx-init'); xpIO.observe(c); };
  const observar = root => {
    if (root.nodeType === 1 && root.matches?.('.card:not(.fx-init)')) marcar(root);
    root.querySelectorAll?.('.card:not(.fx-init)').forEach(marcar);
  };
  observar(document);
  new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType === 1) observar(n);
  }))).observe(document.body, { childList: true, subtree: true });

  if (sinMovim) return;

  // Tilt 3D + sheen siguiendo el cursor (delegación, cubre tarjetas dinámicas)
  let actual = null;
  const reset = c => { c.style.transform = ''; c.style.removeProperty('--mx'); c.style.removeProperty('--my'); };
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.card');
    if (card !== actual) { if (actual) reset(actual); actual = card; }
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.transform = `translateY(-4px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 9}deg)`;
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  });
}

/* ---------- Animación Tetris en los laterales ---------- */
// Piezas clásicas caen desde el borde inferior del nav y se apilan formando
// 4 líneas casi completas sobre el footer; una pieza I cae por el hueco,
// las líneas parpadean, se limpian y el ciclo vuelve a empezar.
const TETRIS_COLORS = {
  I: '#5CE8E8', O: '#FFC857', T: '#8B5CF6',
  L: '#FF9F45', J: '#5C8CFF', S: '#5CE8A4', Z: '#FF6B81',
};

// Color aleatorio evitando repetir el anterior, para que piezas seguidas no salgan iguales
let _ultimoColorTetris = null;
function tetrisColor() {
  const paleta = Object.values(TETRIS_COLORS).filter(c => c !== _ultimoColorTetris);
  _ultimoColorTetris = paleta[Math.floor(Math.random() * paleta.length)];
  return _ultimoColorTetris;
}

// Patrones de encaje: cómo rellenar una franja de `w` columnas × 4 filas con
// piezas clásicas que conservan su forma. Cada lista va en orden de caída
// (las piezas más profundas primero). Coordenadas [x, y] con y=0 arriba.
function tetrisRegion(w) {
  // color aleatorio por pieza: la misma figura puede salir en cualquier color
  const pz = (n, cells) => ({ color: tetrisColor(), cells });
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shift = (pzs, dx) => pzs.map(p => ({ color: p.color, cells: p.cells.map(([x, y]) => [x + dx, y]) }));
  // Espejo horizontal: duplica la variedad (una L espejada es una J, una S es una Z)
  const mirror = pzs => pzs.map(p => ({
    color: p.color,
    cells: p.cells.map(([x, y]) => [w - 1 - x, y]),
  }));

  let res;
  if (w <= 0) return [];
  else if (w === 1) res = [pz('I', [[0, 0], [0, 1], [0, 2], [0, 3]])];
  else if (w === 2) res = pick([
    // L+J entrelazadas pesa el doble que el par de cubos
    () => [pz('L', [[0, 1], [0, 2], [0, 3], [1, 3]]), pz('J', [[0, 0], [1, 0], [1, 1], [1, 2]])],
    () => [pz('L', [[0, 1], [0, 2], [0, 3], [1, 3]]), pz('J', [[0, 0], [1, 0], [1, 1], [1, 2]])],
    () => [pz('O', [[0, 2], [1, 2], [0, 3], [1, 3]]), pz('O', [[0, 0], [1, 0], [0, 1], [1, 1]])],
  ])();
  else if (w === 3) res = pick([
    () => tetrisRegion(1).concat(shift(tetrisRegion(2), 1)),
    () => tetrisRegion(2).concat(shift(tetrisRegion(1), 2)),
    // Z con dos J, y su gemela S con dos L (doble peso para que salgan S/Z)
    () => [
      pz('J', [[1, 3], [2, 1], [2, 2], [2, 3]]),
      pz('Z', [[1, 1], [1, 2], [0, 2], [0, 3]]),
      pz('J', [[0, 0], [1, 0], [2, 0], [0, 1]]),
    ],
    () => [
      pz('L', [[1, 3], [0, 1], [0, 2], [0, 3]]),
      pz('S', [[1, 1], [1, 2], [2, 2], [2, 3]]),
      pz('L', [[0, 0], [1, 0], [2, 0], [2, 1]]),
    ],
    () => [
      pz('J', [[1, 3], [2, 1], [2, 2], [2, 3]]),
      pz('Z', [[1, 1], [1, 2], [0, 2], [0, 3]]),
      pz('J', [[0, 0], [1, 0], [2, 0], [0, 1]]),
    ],
    () => [
      pz('L', [[1, 3], [0, 1], [0, 2], [0, 3]]),
      pz('S', [[1, 1], [1, 2], [2, 2], [2, 3]]),
      pz('L', [[0, 0], [1, 0], [2, 0], [2, 1]]),
    ],
  ])();
  else if (w === 4) res = pick([
    // mezclas variadas pesan más que las cuatro T iguales
    () => tetrisRegion(2).concat(shift(tetrisRegion(2), 2)),
    () => tetrisRegion(1).concat(shift(tetrisRegion(3), 1)),
    () => tetrisRegion(3).concat(shift(tetrisRegion(1), 3)),
    () => tetrisRegion(1).concat(shift(tetrisRegion(3), 1)),
    () => tetrisRegion(3).concat(shift(tetrisRegion(1), 3)),
    () => [
      pz('T', [[1, 3], [2, 3], [3, 3], [2, 2]]),
      pz('T', [[0, 1], [0, 2], [0, 3], [1, 2]]),
      pz('T', [[3, 0], [3, 1], [3, 2], [2, 1]]),
      pz('T', [[0, 0], [1, 0], [2, 0], [1, 1]]),
    ],
  ])();
  else if (w === 5) res = pick([
    () => tetrisRegion(2).concat(shift(tetrisRegion(3), 2)),
    () => tetrisRegion(3).concat(shift(tetrisRegion(2), 3)),
    () => tetrisRegion(1).concat(shift(tetrisRegion(4), 1)),
    () => tetrisRegion(4).concat(shift(tetrisRegion(1), 4)),
  ])();
  else {
    // anchos mayores: dividir en dos franjas y combinar
    const k = pick([2, 3, 4, 5].filter(n => w - n >= 1));
    res = tetrisRegion(k).concat(shift(tetrisRegion(w - k), k));
  }
  return Math.random() < 0.5 ? mirror(res) : res;
}

function initTetris(container) {
  const nav = document.querySelector('.navbar');
  const footer = document.querySelector('.footer');
  const COLS = 10, STACK = 4, CELL = 19; // 18px + 1px de hueco
  // La columna cubre toda la página: del borde inferior del nav al footer.
  const alto = Math.max(300, footer.offsetTop - nav.offsetHeight - 16);
  const ROWS = Math.floor(alto / CELL);
  // Paso de caída proporcional a la altura: cada pieza tarda ~2.5 s en llegar.
  const PASO = Math.max(1, Math.round(ROWS / 55));
  container.style.height = (ROWS * CELL - 1) + 'px';

  const cells = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    cells.push(container.appendChild(document.createElement('div')));
  }
  const at = (c, r) => cells[r * COLS + c];
  let timer;

  let gap, piezas, piezaIdx;

  function cycle() {
    cells.forEach(d => { d.style.background = 'transparent'; d.style.filter = 'none'; });
    gap = Math.floor(Math.random() * COLS);
    // el muro se arma con piezas reales a izquierda y derecha del hueco
    const der = tetrisRegion(COLS - 1 - gap).map(p => ({
      color: p.color,
      cells: p.cells.map(([x, y]) => [x + gap + 1, y]),
    }));
    piezas = tetrisRegion(gap).concat(der);
    piezaIdx = 0;
    dropNext();
  }

  function dropNext() {
    if (piezaIdx >= piezas.length) { dropI(); return; }
    const pieza = piezas[piezaIdx++];
    let y = -4; // desplazamiento vertical respecto a la fila destino 0
    const destino = ROWS - STACK; // el muro ocupa las últimas 4 filas

    const draw = on => {
      pieza.cells.forEach(([cx, cy]) => {
        const r = y + cy;
        if (r >= 0 && r < ROWS) at(cx, r).style.background = on ? pieza.color : 'transparent';
      });
    };

    timer = setInterval(() => {
      draw(false);
      y = Math.min(y + PASO, destino);
      draw(true);
      if (y === destino) {
        clearInterval(timer);
        // aterrizó: la pieza se queda tal cual, con su forma y color
        setTimeout(dropNext, 200);
      }
    }, 45);
  }

  function dropI() {
    let y = -4;
    const colorI = tetrisColor();
    const draw = on => {
      for (let k = 0; k < 4; k++) {
        const r = y + k;
        if (r >= 0 && r < ROWS) at(gap, r).style.background = on ? colorI : 'transparent';
      }
    };
    timer = setInterval(() => {
      draw(false);
      y = Math.min(y + PASO, ROWS - STACK);
      draw(true);
      if (y === ROWS - STACK) { clearInterval(timer); flash(); }
    }, 45);
  }

  function flash() {
    let n = 0;
    timer = setInterval(() => {
      const on = n % 2 === 0;
      for (let r = ROWS - STACK; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) at(c, r).style.filter = on ? 'brightness(2.2)' : 'none';
      }
      n++;
      if (n === 6) {
        clearInterval(timer);
        setTimeout(cycle, 800);
      }
    }, 130);
  }

  cycle();
}

document.addEventListener('DOMContentLoaded', renderChrome);
