// mario.js — minijuego de plataformas: recreación del mundo 1-1 del
// Mario Bros original dibujada a rects (pixel art propio, sin assets).
// El personaje es el avatar de Legans_8. WASD o flechas; el canvas
// captura las teclas solo cuando tiene foco.

function initMario(canvas) {
  const ctx = canvas.getContext('2d');
  const T = 16, FILAS = 13, COLS = 212;
  const GRAV = 0.5;
  const CAM_Y = 2 * T; // se recortan las dos filas superiores de cielo
  let ANCHO = 320, ALTO = (FILAS - 2) * T;

  // El canvas llena la caja: la resolución interna se calcula para mantener
  // píxeles cuadrados a la altura de 11 filas de tiles
  function medir() {
    const cw = canvas.clientWidth || 320, ch = canvas.clientHeight || ALTO;
    ANCHO = Math.max(160, Math.round(ALTO * cw / ch));
    canvas.width = ANCHO;
    canvas.height = ALTO;
  }
  medir();
  window.addEventListener('resize', medir);

  /* ----- sonidos retro (WebAudio, sin samples) ----- */
  let actx = null;
  function sonido(f0, f1, dur, tipo = 'square', vol = 0.04) {
    if (!actx) try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const t0 = actx.currentTime;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.linearRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t0); o.stop(t0 + dur);
  }
  const sndSalto = () => sonido(220, 880, 0.2);
  const sndMoneda = () => { sonido(988, 0, 0.07); setTimeout(() => sonido(1319, 0, 0.28), 70); };
  const sndPisar = () => sonido(300, 90, 0.12);
  const sndGolpe = () => sonido(110, 60, 0.1);
  const sndMorir = () => sonido(520, 70, 0.5, 'triangle', 0.06);
  const sndBandera = () => sonido(1046, 220, 0.7);
  const fanfarria = () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => sonido(f, 0, 0.18), i * 140));

  /* ----- nivel: 0 aire · 1 suelo · 2 ladrillo · 3 bloque ? · 4 tubo · 5 duro · 6 usado ----- */
  const huecos = new Set([69, 70, 86, 87, 88, 153, 154]);
  const tubos = [[28, 2], [38, 3], [46, 4], [57, 4], [163, 2], [179, 2]];
  let mapa;

  function construirNivel() {
    mapa = Array.from({ length: FILAS }, () => new Array(COLS).fill(0));
    for (let x = 0; x < COLS; x++) if (!huecos.has(x)) { mapa[11][x] = 1; mapa[12][x] = 1; }
    const pon = (x, y, t) => { mapa[y][x] = t; };

    // bloques flotantes (fila 7 a altura de salto, fila 3 la hilera alta)
    [[16, 7, 3],
     [20, 7, 2], [21, 7, 3], [22, 7, 2], [23, 7, 3], [24, 7, 2], [22, 3, 3],
     [77, 7, 2], [78, 7, 3], [79, 7, 2],
     [80, 3, 2], [81, 3, 2], [82, 3, 2], [83, 3, 2], [84, 3, 2], [85, 3, 2], [86, 3, 2], [87, 3, 2],
     [91, 3, 2], [92, 3, 2], [93, 3, 2], [94, 3, 3], [94, 7, 2],
     [100, 7, 2], [101, 7, 3], [106, 7, 3], [109, 7, 3], [109, 3, 3], [112, 7, 3],
     [118, 7, 2],
     [121, 3, 2], [122, 3, 2], [123, 3, 2],
     [128, 3, 2], [129, 3, 3], [130, 3, 3], [131, 3, 2], [128, 7, 2], [131, 7, 2],
     [168, 7, 2], [169, 7, 2], [170, 7, 3], [171, 7, 2]]
      .forEach(([x, y, t]) => pon(x, y, t));

    tubos.forEach(([x, h]) => {
      for (let y = 11 - h; y <= 10; y++) { pon(x, y, 4); pon(x + 1, y, 4); }
    });

    // escaleras de bloque duro
    for (let i = 0; i < 4; i++) {
      for (let y = 0; y <= i; y++) pon(134 + i, 10 - y, 5);
      for (let y = 0; y <= 3 - i; y++) pon(140 + i, 10 - y, 5);
      for (let y = 0; y <= i; y++) pon(148 + i, 10 - y, 5);
      for (let y = 0; y <= 3 - i; y++) pon(155 + i, 10 - y, 5);
    }
    for (let i = 0; i < 8; i++) for (let y = 0; y <= i; y++) pon(181 + i, 10 - y, 5);
    pon(198, 10, 5); // base del mástil
  }
  construirNivel();
  const META_X = 198 * T;
  const PUERTA_X = 202 * T + 34;

  /* ----- estado de partida ----- */
  const GOOMBAS = [22, 40, 51, 80.5, 82, 97, 98.5, 107, 108.5, 114, 115.5, 174, 175.5];
  let jugador, enemigos, camara, estado = 'inicio';
  let puntos = 0, monedas = 0, tiempo = 400, cuentaT = 0, banderaY = 0;
  const bumps = new Map();   // bloques rebotando: "cx,cy" -> frames
  let monedasFx = [], textosFx = [];
  const teclas = {};

  function reiniciarPos() {
    jugador = { x: 32, y: 160, vx: 0, vy: 0, w: 11, h: 15, enSuelo: false, saltoBloqueado: false, mira: 1, golpeArriba: false };
    enemigos = GOOMBAS.map(c => ({ x: c * T, y: 11 * T - 14, vx: -0.3, vy: 0, w: 14, h: 14, activo: false, plano: 0 }));
    camara = 0; tiempo = 400; cuentaT = 0; banderaY = 2 * T + 2;
    bumps.clear(); monedasFx = []; textosFx = [];
  }
  function reiniciarTodo() {
    construirNivel();
    puntos = 0; monedas = 0;
    reiniciarPos();
  }
  reiniciarPos();

  /* ----- físicas ----- */
  const solido = (x, y) => {
    const cx = Math.floor(x / T), cy = Math.floor(y / T);
    if (cx < 0 || cx >= COLS) return true;
    if (cy < 0 || cy >= FILAS) return false;
    return mapa[cy][cx] > 0;
  };
  const choca = e => {
    const xs = [e.x, e.x + e.w - 1], ys = [e.y, e.y + e.h / 2, e.y + e.h - 1];
    return xs.some(x => ys.some(y => solido(x, y)));
  };
  function mover(e) {
    e.x += e.vx;
    e.choqueX = false;
    if (choca(e)) {
      if (e.vx > 0) e.x = Math.floor((e.x + e.w) / T) * T - e.w - 0.01;
      else e.x = (Math.floor(e.x / T) + 1) * T + 0.01;
      e.choqueX = true;
    }
    e.vy = Math.min(e.vy + GRAV, 8);
    e.y += e.vy;
    e.enSuelo = false; e.golpeArriba = false;
    if (choca(e)) {
      if (e.vy > 0) { e.y = Math.floor((e.y + e.h) / T) * T - e.h - 0.01; e.enSuelo = true; }
      else { e.y = (Math.floor(e.y / T) + 1) * T + 0.01; e.golpeArriba = true; }
      e.vy = 0;
    }
  }

  function morir() { sndMorir(); reiniciarPos(); }

  function fxTexto(x, y, txt) { textosFx.push({ x, y, txt, t: 0 }); }

  function golpearBloque() {
    const j = jugador;
    const cy = Math.floor(j.y / T) - 1;
    if (cy < 0 || cy >= FILAS) return;
    const cands = [j.x + j.w / 2, j.x + 1, j.x + j.w - 1].map(x => Math.floor(x / T));
    const cx = cands.find(c => c >= 0 && c < COLS && mapa[cy][c] > 0);
    if (cx === undefined) return;
    const t = mapa[cy][cx];
    if (t === 3) {
      mapa[cy][cx] = 6;
      bumps.set(cx + ',' + cy, 10);
      monedas++; puntos += 200;
      monedasFx.push({ x: cx * T + 4, y: cy * T - 14, vy: -3.2, t: 0 });
      fxTexto(cx * T, cy * T - 18, '+200');
      sndMoneda();
    } else if (t === 2) {
      bumps.set(cx + ',' + cy, 10);
      sndGolpe();
    } else if (t > 0) sndGolpe();
  }

  function pasoFx() {
    bumps.forEach((f, k) => { f > 1 ? bumps.set(k, f - 1) : bumps.delete(k); });
    monedasFx = monedasFx.filter(m => { m.vy += 0.25; m.y += m.vy; return ++m.t < 26; });
    textosFx = textosFx.filter(f => { f.y -= 0.6; return ++f.t < 40; });
  }

  function paso() {
    const j = jugador;
    pasoFx();

    // secuencia de meta: bajar por el mástil y caminar hasta el castillo
    if (estado === 'bandera') {
      // baja hasta quedar de pie sobre el bloque base del mástil (fila 10),
      // no hasta el suelo: si no, queda incrustado en el bloque y se atora
      j.y = Math.min(j.y + 2.4, 10 * T - j.h - 0.01);
      banderaY = Math.min(banderaY + 2.4, 9 * T - 16);
      if (j.y >= 10 * T - j.h - 0.02 && banderaY >= 9 * T - 16) estado = 'marcha';
      return;
    }
    if (estado === 'marcha') {
      j.mira = 1; j.vx = 1.2;
      mover(j);
      camara = Math.max(0, Math.min(j.x - ANCHO / 2 + 60, COLS * T - ANCHO));
      if (j.x >= PUERTA_X) { estado = 'win'; fanfarria(); }
      return;
    }

    // tiempo estilo arcade
    if (++cuentaT >= 24) { cuentaT = 0; if (--tiempo <= 0) { morir(); return; } }

    const izq = teclas.a || teclas.arrowleft, der = teclas.d || teclas.arrowright;
    const salto = teclas.w || teclas.arrowup || teclas[' '];
    if (der) { j.vx = Math.min(j.vx + 0.14, 1.7); j.mira = 1; }
    else if (izq) { j.vx = Math.max(j.vx - 0.14, -1.7); j.mira = -1; }
    else if (j.enSuelo) j.vx *= 0.82;
    if (salto && j.enSuelo && !j.saltoBloqueado) { j.vy = -8.4; j.saltoBloqueado = true; sndSalto(); }
    if (!salto) { j.saltoBloqueado = false; if (j.vy < -3.5) j.vy = -3.5; }
    mover(j);
    if (j.golpeArriba) golpearBloque();
    if (j.x < 0) { j.x = 0; j.vx = 0; }

    if (j.y > FILAS * T + 32) { morir(); return; }
    if (j.x + j.w >= META_X + 3) {
      estado = 'bandera';
      j.x = META_X + 7 - j.w; j.vx = 0; j.vy = 0;
      puntos += 1000;
      fxTexto(META_X - 8, 4 * T, '+1000');
      sndBandera();
      return;
    }

    camara = Math.max(0, Math.min(j.x - ANCHO / 2 + 60, COLS * T - ANCHO));

    enemigos.forEach(en => {
      if (en.plano) { en.plano++; return; }
      if (!en.activo) { if (en.x < camara + ANCHO + T) en.activo = true; else return; }
      mover(en);
      if (en.choqueX) en.vx = -en.vx;
      if (en.y > FILAS * T + 32) { en.plano = 999; return; }
      if (j.x < en.x + en.w && j.x + j.w > en.x && j.y < en.y + en.h && j.y + j.h > en.y) {
        if (j.vy > 0 && j.y + j.h - en.y < 10) {
          en.plano = 1; j.vy = -4.5;
          puntos += 100; fxTexto(en.x, en.y - 12, '+100');
          sndPisar();
        } else morir();
      }
    });
    enemigos = enemigos.filter(en => en.plano < 18);
  }

  /* ----- dibujo ----- */
  function tile(t, x, y) {
    if (t === 1) {
      ctx.fillStyle = '#c8662a'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#ffc890'; ctx.fillRect(x, y, T, 1); ctx.fillRect(x, y, 1, T);
      ctx.fillStyle = '#6e2e0c'; ctx.fillRect(x, y + 14, T, 2); ctx.fillRect(x + 14, y, 2, T);
      ctx.fillRect(x + 7, y + 4, 2, 2); ctx.fillRect(x + 3, y + 9, 2, 2);
    } else if (t === 2) {
      ctx.fillStyle = '#b35418'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#ffc890'; ctx.fillRect(x, y, T, 1);
      ctx.fillStyle = '#3c1c08';
      ctx.fillRect(x, y + 7, T, 1); ctx.fillRect(x, y + 15, T, 1);
      ctx.fillRect(x + 8, y, 1, 7); ctx.fillRect(x + 3, y + 8, 1, 7); ctx.fillRect(x + 12, y + 8, 1, 7);
    } else if (t === 3) {
      ctx.fillStyle = '#e8941c'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#ffd890'; ctx.fillRect(x, y, T, 1); ctx.fillRect(x, y, 1, T);
      ctx.fillStyle = '#7a4304'; ctx.fillRect(x, y + 14, T, 2); ctx.fillRect(x + 14, y, 2, T);
      ctx.fillRect(x + 2, y + 2, 1, 1); ctx.fillRect(x + 13, y + 2, 1, 1);
      ctx.fillRect(x + 2, y + 13, 1, 1); ctx.fillRect(x + 13, y + 13, 1, 1);
      ctx.fillStyle = '#fff8e8';
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', x + T / 2 + 0.5, y + T / 2 + 1);
    } else if (t === 5) {
      ctx.fillStyle = '#c0a060'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#e8d0a0'; ctx.fillRect(x, y, T, 2); ctx.fillRect(x, y, 2, T);
      ctx.fillStyle = '#7c6234'; ctx.fillRect(x, y + 14, T, 2); ctx.fillRect(x + 14, y, 2, T);
      ctx.fillRect(x + 4, y + 4, 8, 8);
      ctx.fillStyle = '#c0a060'; ctx.fillRect(x + 5, y + 5, 6, 6);
    } else if (t === 6) {
      // bloque ? ya usado
      ctx.fillStyle = '#8c5418'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#5a3208'; ctx.fillRect(x, y + 14, T, 2); ctx.fillRect(x + 14, y, 2, T);
      ctx.fillRect(x + 3, y + 3, 2, 2); ctx.fillRect(x + 11, y + 3, 2, 2);
      ctx.fillRect(x + 3, y + 11, 2, 2); ctx.fillRect(x + 11, y + 11, 2, 2);
    }
  }

  function colina(x, alto) {
    const baseY = 11 * T - CAM_Y;
    ctx.fillStyle = '#1da010';
    ctx.beginPath();
    ctx.moveTo(x, baseY); ctx.lineTo(x + alto, baseY - alto); ctx.lineTo(x + 2 * alto, baseY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0c5c08';
    ctx.fillRect(x + alto - 2, baseY - alto + 8, 2, 2);
    ctx.fillRect(x + alto + 6, baseY - alto + 16, 2, 2);
    ctx.fillRect(x + alto - 9, baseY - alto + 18, 2, 2);
  }

  function arbusto(x, n) {
    const y = 11 * T - 10 - CAM_Y;
    ctx.fillStyle = '#1da010';
    for (let i = 0; i < n; i++) { ctx.fillRect(x + i * 12 + 2, y, 8, 10); ctx.fillRect(x + i * 12, y + 3, 12, 7); }
    ctx.fillStyle = '#7ce05c';
    for (let i = 0; i < n; i++) ctx.fillRect(x + i * 12 + 3, y + 1, 2, 4);
  }

  function nube(x, y, n) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < n; i++) { ctx.fillRect(x + i * 14 + 3, y, 10, 8); ctx.fillRect(x + i * 14, y + 4, 14, 8); }
    ctx.fillStyle = '#c8e0f8';
    for (let i = 0; i < n; i++) ctx.fillRect(x + i * 14, y + 10, 14, 2);
  }

  // avatar de Legans_8: pelo negro, gafas, sudadera morada y abrigo oscuro
  function dibujarJugador() {
    const j = jugador;
    const px = Math.round(j.x - Math.round(camara)) - 1, py = Math.round(j.y) - CAM_Y;
    const PELO = '#16161e', PIEL = '#ffd8b0', MORADO = '#5c3a8c', CAPUCHA = '#7c52b4',
          GAFA = '#2c2c38', TENIS = '#e8e8e8';
    const andando = j.enSuelo && Math.abs(j.vx) > 0.25;
    const fase = !j.enSuelo ? 1 : (andando ? Math.floor(j.x / 9) % 2 : 0);
    // pelo despeinado
    ctx.fillStyle = PELO;
    ctx.fillRect(px + 2, py, 8, 1);
    ctx.fillRect(px + 1, py + 1, 10, 2);
    ctx.fillRect(px + 1, py + 3, 2, 2);
    ctx.fillRect(px + 9, py + 3, 2, 2);
    // cara
    ctx.fillStyle = PIEL; ctx.fillRect(px + 3, py + 3, 6, 4);
    // gafas redondas con reflejo
    ctx.fillStyle = GAFA;
    ctx.fillRect(px + 3, py + 4, 2, 2); ctx.fillRect(px + 7, py + 4, 2, 2);
    ctx.fillRect(px + 5, py + 4, 2, 1);
    ctx.fillStyle = '#a8d0ff'; ctx.fillRect(px + 4, py + 4, 1, 1); ctx.fillRect(px + 8, py + 4, 1, 1);
    // sudadera morada con capucha
    ctx.fillStyle = MORADO; ctx.fillRect(px + 2, py + 7, 8, 5);
    ctx.fillStyle = CAPUCHA; ctx.fillRect(px + 4, py + 7, 4, 2);
    // abrigo negro (brazos a los lados)
    ctx.fillStyle = PELO; ctx.fillRect(px, py + 7, 2, 6); ctx.fillRect(px + 10, py + 7, 2, 6);
    // mano al frente
    ctx.fillStyle = PIEL; ctx.fillRect(px + (j.mira > 0 ? 10 : 0), py + 11, 2, 2);
    // piernas y tenis según fase de caminata
    ctx.fillStyle = '#26262e';
    if (fase === 1) {
      ctx.fillRect(px + 3, py + 12, 6, 2);
      ctx.fillStyle = TENIS; ctx.fillRect(px + 2, py + 14, 4, 1); ctx.fillRect(px + 6, py + 14, 4, 1);
    } else {
      ctx.fillRect(px + 1, py + 12, 4, 2); ctx.fillRect(px + 7, py + 12, 4, 2);
      ctx.fillStyle = TENIS; ctx.fillRect(px, py + 14, 4, 1); ctx.fillRect(px + 8, py + 14, 4, 1);
    }
  }

  function dibujar() {
    ctx.fillStyle = '#6b8cff';
    ctx.fillRect(0, 0, ANCHO, ALTO);
    const c = Math.round(camara);
    const visible = x => x > -64 && x < ANCHO + 64;

    // fondo: colinas, arbustos y nubes (se repiten cada 48 columnas, como el original)
    [[0, 35], [16, 22], [48, 35], [64, 22], [96, 35], [112, 22], [144, 35], [160, 22], [192, 35]]
      .forEach(([cx, h]) => { const x = cx * T - c; if (visible(x)) colina(x, h); });
    [[11, 3], [23, 1], [41, 2], [59, 3], [71, 1], [89, 2], [107, 3], [119, 1], [137, 2], [167, 1], [185, 2]]
      .forEach(([cx, n]) => { const x = cx * T - c; if (visible(x)) arbusto(x, n); });
    [[8, 24, 1], [19, 8, 1], [27, 16, 3], [36, 24, 2], [56, 8, 1], [67, 16, 1], [75, 24, 3],
     [87, 8, 2], [103, 24, 1], [115, 8, 1], [123, 16, 3], [140, 24, 2], [152, 8, 1],
     [163, 16, 1], [171, 24, 3], [187, 8, 2], [200, 24, 1]]
      .forEach(([cx, y, n]) => { const x = cx * T - c; if (visible(x)) nube(x, y, n); });

    // tiles visibles (los tubos se dibujan aparte); rebote al golpearlos desde abajo
    const c0 = Math.floor(c / T), c1 = Math.min(COLS - 1, Math.ceil((c + ANCHO) / T));
    for (let cx = c0; cx <= c1; cx++)
      for (let cy = 0; cy < FILAS; cy++)
        if (mapa[cy][cx] && mapa[cy][cx] !== 4) {
          const f = bumps.get(cx + ',' + cy) || 0;
          const off = f > 5 ? 10 - f : f;
          tile(mapa[cy][cx], cx * T - c, cy * T - CAM_Y - off);
        }

    // tubos con boca ancha y brillo lateral
    tubos.forEach(([tc, h]) => {
      const x = tc * T - c, top = (11 - h) * T - CAM_Y, alto = h * T;
      if (!visible(x)) return;
      ctx.fillStyle = '#2fa322'; ctx.fillRect(x + 2, top + 13, 28, alto - 13);
      ctx.fillStyle = '#7ce05c'; ctx.fillRect(x + 5, top + 13, 4, alto - 13);
      ctx.fillStyle = '#1d6e14'; ctx.fillRect(x + 25, top + 13, 5, alto - 13);
      ctx.fillStyle = '#2fa322'; ctx.fillRect(x - 1, top, 34, 13);
      ctx.fillStyle = '#7ce05c'; ctx.fillRect(x + 2, top + 1, 5, 11);
      ctx.fillStyle = '#1d6e14'; ctx.fillRect(x + 29, top + 1, 4, 11); ctx.fillRect(x - 1, top + 11, 34, 2);
      ctx.fillStyle = '#0c3c08'; ctx.fillRect(x - 1, top, 34, 1);
    });

    // mástil con bola y bandera (baja en la secuencia de meta)
    const mx = META_X + 7 - c;
    if (visible(mx)) {
      ctx.fillStyle = '#3c8024'; ctx.fillRect(mx, 2 * T - CAM_Y, 2, 8 * T);
      ctx.fillStyle = '#b8e0a0'; ctx.fillRect(mx, 2 * T - CAM_Y, 1, 8 * T);
      ctx.fillStyle = '#c8d800'; ctx.fillRect(mx - 1, 2 * T - 4 - CAM_Y, 4, 4);
      const by = banderaY - CAM_Y;
      ctx.fillStyle = '#30a020';
      ctx.beginPath();
      ctx.moveTo(mx, by); ctx.lineTo(mx - 14, by + 7); ctx.lineTo(mx, by + 14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(mx - 8, by + 5, 3, 3);
    }

    // castillo de ladrillo con almenas, puerta y ventanas
    const kx = 202 * T - c;
    if (kx > -120 && kx < ANCHO + 120) {
      const sueloY = 11 * T - CAM_Y;
      ctx.fillStyle = '#b35418';
      ctx.fillRect(kx, sueloY - 48, 80, 48);
      ctx.fillRect(kx + 24, sueloY - 80, 32, 32);
      ctx.fillStyle = '#3c1c08';
      for (let fy = 0; fy < 3; fy++) ctx.fillRect(kx, sueloY - 16 - fy * 16, 80, 1);
      ctx.fillStyle = '#b35418';
      for (let i = 0; i < 5; i++) ctx.fillRect(kx + i * 17, sueloY - 53, 10, 5);
      for (let i = 0; i < 2; i++) ctx.fillRect(kx + 26 + i * 17, sueloY - 85, 10, 5);
      ctx.fillStyle = '#1c0c04';
      ctx.fillRect(kx + 32, sueloY - 24, 16, 24);
      ctx.fillRect(kx + 34, sueloY - 28, 12, 6);
      ctx.fillRect(kx + 8, sueloY - 40, 8, 10); ctx.fillRect(kx + 64, sueloY - 40, 8, 10);
      ctx.fillRect(kx + 36, sueloY - 70, 8, 10);
    }

    // monedas saltando de los bloques ?
    monedasFx.forEach(m => {
      const w = Math.max(2, Math.round(7 * Math.abs(Math.cos(m.t * 0.35))));
      const x = Math.round(m.x - c + (8 - w) / 2), y = Math.round(m.y) - CAM_Y;
      ctx.fillStyle = '#ffd820'; ctx.fillRect(x, y, w, 12);
      ctx.fillStyle = '#b88800'; ctx.fillRect(x, y + 10, w, 2);
      if (w > 3) { ctx.fillStyle = '#fff8c0'; ctx.fillRect(x + 1, y + 2, 1, 8); }
    });

    // goombas con cejas y patas sombreadas
    enemigos.forEach(en => {
      const x = Math.round(en.x - c), y = Math.round(en.y) - CAM_Y;
      if (!visible(x)) return;
      if (en.plano) {
        ctx.fillStyle = '#9c5018'; ctx.fillRect(x, y + 9, 14, 5);
        ctx.fillStyle = '#5a2808'; ctx.fillRect(x, y + 12, 14, 2);
        return;
      }
      ctx.fillStyle = '#9c5018';
      ctx.fillRect(x + 3, y, 8, 3); ctx.fillRect(x + 1, y + 2, 12, 4); ctx.fillRect(x, y + 5, 14, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 3, y + 3, 2, 1); ctx.fillRect(x + 9, y + 3, 2, 1);
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 3, y + 4, 3, 4); ctx.fillRect(x + 8, y + 4, 3, 4);
      ctx.fillStyle = '#000'; ctx.fillRect(x + 4, y + 6, 2, 2); ctx.fillRect(x + 9, y + 6, 2, 2);
      ctx.fillStyle = '#5a2808';
      const p = Math.floor(en.x / 8) % 2;
      ctx.fillRect(x + (p ? 0 : 1), y + 11, 5, 3); ctx.fillRect(x + (p ? 9 : 8), y + 11, 5, 3);
    });

    dibujarJugador();

    // textos flotantes (+100, +200...)
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    textosFx.forEach(f => {
      ctx.fillStyle = '#fff';
      ctx.fillText(f.txt, Math.round(f.x - c), Math.round(f.y) - CAM_Y);
    });

    // HUD clásico: puntos, monedas, mundo y tiempo
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText('LEGANS', 8, 5);
    ctx.fillText(String(puntos).padStart(6, '0'), 8, 16);
    const cmx = Math.round(ANCHO * 0.36);
    ctx.fillStyle = '#ffd820'; ctx.fillRect(cmx, 16, 5, 8);
    ctx.fillStyle = '#b88800'; ctx.fillRect(cmx, 22, 5, 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('x' + String(monedas).padStart(2, '0'), cmx + 8, 16);
    ctx.textAlign = 'center';
    ctx.fillText('MUNDO', Math.round(ANCHO * 0.62), 5);
    ctx.fillText('1-1', Math.round(ANCHO * 0.62), 16);
    ctx.textAlign = 'right';
    ctx.fillText('TIEMPO', ANCHO - 8, 5);
    ctx.fillText(String(tiempo).padStart(3, '0'), ANCHO - 8, 16);

    if (estado === 'inicio' || estado === 'win') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, ANCHO, ALTO);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(estado === 'win' ? '¡NIVEL COMPLETADO!' : 'MUNDO 1-1', ANCHO / 2, ALTO / 2 - 20);
      ctx.font = '8px "Press Start 2P", monospace';
      if (estado === 'win') ctx.fillText('PUNTOS ' + puntos + ' · MONEDAS ' + monedas, ANCHO / 2, ALTO / 2 + 2);
      ctx.fillText(estado === 'win' ? 'CLIC PARA REINICIAR' : 'CLIC PARA JUGAR', ANCHO / 2, ALTO / 2 + (estado === 'win' ? 22 : 6));
      if (estado === 'inicio') {
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#c8d0ff';
        ctx.fillText('WASD / FLECHAS · SALTA CON W, ↑ O ESPACIO', ANCHO / 2, ALTO / 2 + 26);
      }
    }
  }

  /* ----- input y bucle ----- */
  const KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '];
  canvas.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (KEYS.includes(k)) { teclas[k] = true; e.preventDefault(); }
  });
  canvas.addEventListener('keyup', e => { teclas[e.key.toLowerCase()] = false; });
  canvas.addEventListener('blur', () => { KEYS.forEach(k => { teclas[k] = false; }); });
  canvas.addEventListener('click', () => {
    if (estado === 'win') reiniciarTodo();
    if (estado === 'inicio' || estado === 'win') estado = 'jugando';
    canvas.focus();
  });

  (function bucle() {
    if (estado === 'jugando' || estado === 'bandera' || estado === 'marcha') paso();
    dibujar();
    requestAnimationFrame(bucle);
  })();
}
