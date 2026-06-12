// home.js — página de inicio: hero, recientes, destacados y redes.

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('heroAvatar').innerHTML = AVATAR_IMG;

  // Avatar vivo: 4 frames que combinan ojos (abiertos/cerrados) y boca
  // (cerrada/abierta) para parpadear y hablar a la vez, con bocadillo geek
  const imgAv = document.getElementById('avatarVivo');
  const FRAMES_AV = [
    'media/happy/1 happy.png',  // ojos abiertos, boca cerrada
    'media/happy/2 happy.png',  // ojos abiertos, boca abierta
    'media/happy/3 happy.png',  // ojos cerrados, boca cerrada
    'media/happy/4  happy.png', // ojos cerrados, boca abierta
  ];
  FRAMES_AV.forEach(s => { const i = new Image(); i.src = s; });
  let avOjos = false, avBoca = false, avBocaTimer = null;
  const pintaAv = () => { imgAv.src = FRAMES_AV[(avOjos ? 2 : 0) + (avBoca ? 1 : 0)]; };

  (function parpadea() {
    setTimeout(() => {
      avOjos = true; pintaAv();
      setTimeout(() => { avOjos = false; pintaAv(); parpadea(); }, 160);
    }, 3000 + Math.random() * 4000);
  })();

  const boca = document.createElement('div');
  boca.className = 'npc-bocadillo hero-bocadillo';
  document.getElementById('heroAvatar').prepend(boca);

  function diceAv(txt) {
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
    '¡Bienvenido a mi mundo!',
    '¿Ya viste el catálogo? No para de crecer',
    'Pásate por Twitch, hay directo pronto',
    'Hay un minijuego escondido en Canales...',
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
