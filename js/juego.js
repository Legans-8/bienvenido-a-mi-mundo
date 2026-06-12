// juego.js — ficha individual: portada, galería, metadatos, reseña y enlaces.

document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('ficha');
  const id = new URLSearchParams(location.search).get('id');
  const g = GAMES.find(x => x.id === id);

  if (!g) {
    main.innerHTML = `
      <div class="empty pixel-frame" style="margin-top:32px">
        <h3>JUEGO NO ENCONTRADO</h3>
        <p>Esta ficha no existe o el juego ya no está en el catálogo.</p>
        <a class="btn btn-primary" href="catalogo.html">VOLVER AL CATÁLOGO</a>
      </div>`;
    return;
  }

  document.title = `${g.nombre} — Legans_8`;

  const galeria = [coverSrc(g), coverURI(g, 2, true), coverURI(g, 3, true)];

  const enlacesHTML = g.enlaces.length === 0 ? '' : `
    <section class="links-contenido">
      <h2>VER EL CONTENIDO</h2>
      <div class="link-list">
        ${g.enlaces.map(e => `
          <a href="${e.url}" target="_blank" rel="noopener">
            <span class="link-icon ${e.tipo}">${e.tipo === 'twitch' ? 'TWITCH' : 'YOUTUBE'}</span>
            <span>${e.titulo}</span>
          </a>`).join('')}
      </div>
    </section>`;

  main.innerHTML = `
    <a class="volver" href="catalogo.html">&laquo; VOLVER AL CATÁLOGO</a>
    <div class="ficha">
      <div class="ficha-cover">
        <div class="pixel-frame" style="padding:8px">
          <img id="portada" src="${coverSrc(g)}" alt="Portada de ${g.nombre}">
        </div>
        <div class="galeria">
          ${galeria.map((src, i) => `<img src="${src}" alt="Captura ${i + 1} de ${g.nombre}" data-src="${src}">`).join('')}
        </div>
      </div>
      <div class="ficha-info">
        <h1>${g.nombre.toUpperCase()}</h1>
        <dl class="meta-table">
          <dt>GÉNERO</dt><dd>${g.genero}</dd>
          <dt>PLATAFORMA</dt><dd>${g.plataforma}</dd>
          <dt>AÑO</dt><dd>${g.anio}</dd>
          <dt>JUGADO</dt><dd>${fmtFecha(g.jugado)}</dd>
          <dt>ESTADO</dt><dd>${badgeHTML(g.estado)}</dd>
        </dl>
        <section class="resena pixel-frame">
          <h2>MI OPINIÓN</h2>
          ${g.resena.map(p => `<p>${p}</p>`).join('')}
        </section>
        ${enlacesHTML}
      </div>
    </div>`;

  // Galería: clic en miniatura cambia la imagen grande
  main.querySelectorAll('.galeria img').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('portada').src = img.dataset.src;
    });
  });

  // Transición inversa del zoom: la portada llega ocupando toda la pantalla
  // y se encoge hasta su lugar en la ficha (la ida está en app.js)
  if (sessionStorage.getItem('zoomFicha')) {
    sessionStorage.removeItem('zoomFicha');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const portada = document.getElementById('portada');
      const encoger = () => {
        const r = portada.getBoundingClientRect();
        const clon = portada.cloneNode();
        Object.assign(clon.style, {
          position: 'fixed', left: '0px', top: '0px',
          width: '100vw', height: '100vh',
          objectFit: 'cover', margin: '0', zIndex: '9999', imageRendering: 'pixelated'
        });
        document.body.appendChild(clon);
        const anim = clon.animate(
          [{ left: '0px', top: '0px', width: '100vw', height: '100vh' },
           { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }],
          { duration: 450, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
        // Fallback por si la animación no corre: no dejar el clon tapando la ficha
        anim.onfinish = () => clon.remove();
        setTimeout(() => clon.remove(), 700);
      };
      if (portada.complete) encoger();
      else portada.addEventListener('load', encoger, { once: true });
    }
  }
});
