// contacto.js — validación del formulario, NPC que reacciona y envío.
// Solo frontend: el envío se simula. Para producción, apuntar ENDPOINT a un
// servicio tipo Formspree/FormSubmit que reenvíe al correo del creador.

const ENDPOINT = null; // p. ej. 'https://formspree.io/f/XXXXXXXX'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formContacto');
  const estado = document.getElementById('estadoForm');
  const btn = document.getElementById('btnEnviar');
  const campos = {
    nombre: { wrap: document.getElementById('campoNombre'), input: document.getElementById('nombre'), valida: v => v.trim().length > 0 },
    email: { wrap: document.getElementById('campoEmail'), input: document.getElementById('email'), valida: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    mensaje: { wrap: document.getElementById('campoMensaje'), input: document.getElementById('mensaje'), valida: v => v.trim().length > 0 },
  };

  /* ----- NPC: el avatar comenta lo que haces ----- */
  const npc = document.querySelector('.npc');
  const bocadillo = document.getElementById('npcBocadillo');
  const npcImg = document.getElementById('npcImg');
  const FRASES = {
    nombre: '¿Cómo te llamas?',
    email: '¿A dónde te respondo?',
    mensaje: 'Te leo, ¡cuéntame!',
  };

  /* Poses del avatar: cada una tiene 2 frames (boca abierta/cerrada, o
     aire/suelo en la celebración) que se alternan mientras "habla" */
  const ANI = {
    base:        ['media/ani forms/base 1.png', 'media/ani forms/base 2.png'],
    senal:       ['media/ani forms/senal 1.png', 'media/ani forms/senal 2.png'],
    nonono:      ['media/ani forms/nonono 1.png', 'media/ani forms/nonono 2.png'],
    celebration: ['media/ani forms/celebration 1.png', 'media/ani forms/celebration 2.png'],
  };
  Object.values(ANI).flat().forEach(src => { const i = new Image(); i.src = src; });
  const npcAni = { pose: 'base', timer: null, gen: 0 };

  function mostrar(p, f) {
    npcImg.src = ANI[p][f];
    // en la celebración el frame 0 está en el aire: lo elevamos de verdad
    npcImg.style.transform = (p === 'celebration' && f === 0) ? 'translateY(-18px)' : '';
  }

  function animarPose(p, ms) {
    const gen = ++npcAni.gen;
    npcAni.pose = p;
    clearInterval(npcAni.timer);
    let f = 0;
    mostrar(p, 0);
    npcAni.timer = setInterval(() => { f = 1 - f; mostrar(p, f); }, p === 'celebration' ? 360 : 180);
    setTimeout(() => {
      if (npcAni.gen !== gen) return;
      clearInterval(npcAni.timer);
      // tras celebrar o regañar vuelve a la pose base; señalando se queda
      const reposo = (p === 'celebration' || p === 'nonono') ? 'base' : p;
      npcAni.pose = reposo;
      mostrar(reposo, 1);
    }, ms);
  }

  function decir(txt, pose) {
    bocadillo.textContent = txt;
    bocadillo.classList.remove('pop');
    void bocadillo.offsetWidth;
    bocadillo.classList.add('pop');
    const p = pose || npcAni.pose;
    animarPose(p, p === 'celebration' ? 4200 : Math.min(3200, Math.max(1100, txt.length * 70)));
    programarCharla();
  }

  // Charla del NPC: recordatorios, datos curiosos y frases icónicas que va
  // soltando cada 9-15 s mientras el bocadillo no diga otra cosa
  const CHARLA = [
    'Te estás demorando en llenarlo...',
    '¿Sigues ahí? El mensaje no se escribe solo',
    'AFK detectado... ¿hola?',
    'Tic, tac... esto no es un speedrun, pero casi',
    '¿Escribo yo por ti? Cobro en monedas',
    ...CHARLA_GEEK,
  ];
  let charlaTimer = null, ultimaCharla = -1;
  function programarCharla() {
    clearTimeout(charlaTimer);
    charlaTimer = setTimeout(() => {
      if (document.hidden) { programarCharla(); return; }
      let i;
      do { i = Math.floor(Math.random() * CHARLA.length); } while (i === ultimaCharla);
      ultimaCharla = i;
      decir(CHARLA[i], 'base');
    }, 9000 + Math.random() * 6000);
  }
  programarCharla();

  /* ----- sonidos retro (WebAudio, sin samples) ----- */
  let actx = null;
  function tono(f0, f1, dur, tipo = 'square', vol = 0.04) {
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
  const sndLogro = () => { tono(988, 0, 0.07); setTimeout(() => tono(1319, 0, 0.18), 80); setTimeout(() => tono(1568, 0, 0.35), 180); };
  const sndError = () => tono(150, 70, 0.3, 'sawtooth', 0.05);

  // "+100 PTS" flotando desde el botón
  function puntosFlotantes() {
    const p = document.createElement('span');
    p.className = 'pts-fx';
    p.textContent = '+100 PTS';
    p.style.left = btn.offsetLeft + btn.offsetWidth / 2 + 'px';
    p.style.top = btn.offsetTop - 8 + 'px';
    form.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }

  // Quitar el error al corregir el campo + frase del NPC al enfocar
  for (const [k, c] of Object.entries(campos)) {
    c.input.addEventListener('focus', () => decir(FRASES[k], 'senal'));
    c.input.addEventListener('input', () => {
      if (c.valida(c.input.value)) c.wrap.classList.remove('invalid');
    });
  }

  async function enviar(datos) {
    if (!ENDPOINT) {
      // Simulación de envío mientras no haya backend
      await new Promise(r => setTimeout(r, 600));
      return true;
    }
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(datos),
    });
    return res.ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    estado.className = 'form-status';

    let valido = true;
    for (const c of Object.values(campos)) {
      const ok = c.valida(c.input.value);
      c.wrap.classList.toggle('invalid', !ok);
      if (!ok && valido) { c.input.focus(); valido = false; }
    }
    if (!valido) {
      decir('¡Ups! Revisa los campos en rojo', 'nonono');
      sndError();
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'TRANSMITIENDO...';
    decir('Transmitiendo...', 'base');
    try {
      const ok = await enviar({
        nombre: campos.nombre.input.value.trim(),
        email: campos.email.input.value.trim(),
        mensaje: campos.mensaje.input.value.trim(),
      });
      if (!ok) throw new Error('fallo');
      estado.textContent = '¡LOGRO DESBLOQUEADO: PRIMER CONTACTO!';
      estado.classList.add('ok');
      form.reset();
      decir('¡Mensaje recibido! ♥', 'celebration');
      sndLogro();
      puntosFlotantes();
    } catch {
      // Conserva lo escrito y ofrece reintentar
      estado.textContent = 'FALLO DE TRANSMISIÓN. Revisa tu conexión e inténtalo de nuevo.';
      estado.classList.add('fail');
      decir('Algo falló... ¿reintentamos?', 'nonono');
      sndError();
    } finally {
      btn.disabled = false;
      btn.textContent = 'ENVIAR MENSAJE';
    }
  });
});
