// home.js — página de inicio: hero, recientes, destacados y redes.

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('heroAvatar').innerHTML = AVATAR_IMG;

  // Avatar vivo: 5 modelos (emociones), cada uno con 4 frames que combinan
  // ojos (abiertos/cerrados) y boca (cerrada/abierta) para parpadear y hablar
  // a la vez. La emoción la marca cada frase del bocadillo.
  const imgAv = document.getElementById('avatarVivo');
  const EMOS = {
    happy:   ['media/happy/1 happy.png', 'media/happy/2 happy.png', 'media/happy/3 happy.png', 'media/happy/4  happy.png'],
    actually:['media/actually/1 actually.png', 'media/actually/2 actually.png', 'media/actually/3 actually.png', 'media/actually/4 actually.png'],
    angry:   ['media/angry/1 Mole.png', 'media/angry/2 Mole.png', 'media/angry/3 Mole.png', 'media/angry/4 Mole.png'],
    sad:     ['media/sad/1 sad.png', 'media/sad/2 sad.png', 'media/sad/3 sad.png', 'media/sad/4 sad.png'],
    timidin: ['media/timidin/1 timidin.png', 'media/timidin/2 timidin.png', 'media/timidin/3 timidin.png', 'media/timidin/4 timidin.png'],
  };
  Object.values(EMOS).flat().forEach(s => { const i = new Image(); i.src = s; });
  let avEmo = 'happy', avOjos = false, avBoca = false, avBocaTimer = null;
  // frame: (ojos?2:0)+(boca?1:0) -> 0 base, 1 hablando, 2 parpadeo, 3 ambos
  const pintaAv = () => { imgAv.src = EMOS[avEmo][(avOjos ? 2 : 0) + (avBoca ? 1 : 0)]; };

  (function parpadea() {
    setTimeout(() => {
      avOjos = true; pintaAv();
      setTimeout(() => { avOjos = false; pintaAv(); parpadea(); }, 160);
    }, 3000 + Math.random() * 4000);
  })();

  const boca = document.createElement('div');
  boca.className = 'npc-bocadillo hero-bocadillo';
  document.getElementById('heroAvatar').prepend(boca);

  function diceAv(frase) {
    const txt = typeof frase === 'string' ? frase : frase.t;
    avEmo = (typeof frase === 'object' && EMOS[frase.e]) ? frase.e : 'happy';
    boca.classList.toggle('boca-timidin', avEmo === 'timidin');
    boca.classList.toggle('boca-angry', avEmo === 'angry');
    avBoca = false; pintaAv();
    boca.textContent = txt;
    boca.classList.remove('pop');
    void boca.offsetWidth;
    boca.classList.add('pop');
    clearInterval(avBocaTimer);
    avBocaTimer = setInterval(() => { avBoca = !avBoca; pintaAv(); }, 170);
    setTimeout(() => {
      clearInterval(avBocaTimer);
      avBoca = false; pintaAv();
    }, Math.min(3200, Math.max(1100, txt.length * 70)));
  }

  const CHARLA_HOME = [
    { t: '¡Bienvenido a mi mundo!', e: 'happy' },
    { t: '¿Ya viste el catálogo? No para de crecer', e: 'happy' },
    { t: 'Pásate por Twitch, hay directo pronto', e: 'happy' },
    { t: 'Hay un minijuego escondido en Canales...', e: 'happy' },
    ...CHARLA_GEEK,
  ];
  let ultimaAv = 0;
  setTimeout(() => diceAv(CHARLA_HOME[0]), 900);
  (function charlaAv() {
    setTimeout(() => {
      if (!document.hidden) {
        let i;
        do { i = Math.floor(Math.random() * CHARLA_HOME.length); } while (i === ultimaAv);
        ultimaAv = i;
        diceAv(CHARLA_HOME[i]);
      }
      charlaAv();
    }, 9000 + Math.random() * 6000);
  })();

  // Efecto máquina de escribir en el título del hero
  const h1 = document.querySelector('.hero-text h1');
  if (h1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const texto = h1.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).join('\n');
    const linea = document.createElement('span');
    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    h1.textContent = '';
    h1.append(linea, cursor);
    let i = 0;
    (function tick() {
      linea.innerHTML = texto.slice(0, i).replace(/\n/g, '<br>');
      if (i++ <= texto.length) setTimeout(tick, 55);
    })();
  }

  const recientes = GAMES
    .filter(g => g.jugado)
    .sort((a, b) => b.jugado.localeCompare(a.jugado))
    .slice(0, 4);
  document.getElementById('recientes').innerHTML = recientes.map(cardHTML).join('');

  const destacados = GAMES.filter(g => g.destacado).slice(0, 4);
  document.getElementById('destacados').innerHTML = destacados.map(cardHTML).join('');
});
