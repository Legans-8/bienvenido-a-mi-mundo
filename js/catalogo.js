// catalogo.js — cuadrícula con búsqueda, filtros combinables, orden y chips.

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const grid = $('grid'), vacio = $('vacio'), chips = $('chips'), contador = $('contador');
  const buscador = $('buscador'), resultados = $('resultados');
  const selects = { genero: $('fGenero'), plataforma: $('fPlataforma'), anio: $('fAnio'), estado: $('fEstado') };
  const orden = $('fOrden');

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // Poblar selects con valores únicos del catálogo
  const fill = (sel, valores, labels) => {
    valores.forEach(v => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = labels ? labels[v] : v;
      sel.appendChild(o);
    });
  };
  fill(selects.genero, [...new Set(GAMES.map(g => g.genero))].sort());
  fill(selects.plataforma, [...new Set(GAMES.map(g => g.plataforma))].sort());
  fill(selects.anio, [...new Set(GAMES.map(g => g.anio))].sort((a, b) => b - a));
  fill(selects.estado, Object.keys(ESTADOS), ESTADOS);

  const state = { q: '', genero: '', plataforma: '', anio: '', estado: '' };

  function filtrar() {
    let lista = GAMES.filter(g =>
      (!state.q || norm(g.nombre).includes(norm(state.q))) &&
      (!state.genero || g.genero === state.genero) &&
      (!state.plataforma || g.plataforma === state.plataforma) &&
      (!state.anio || String(g.anio) === state.anio) &&
      (!state.estado || g.estado === state.estado)
    );
    const ord = orden.value;
    if (ord === 'alfabetico') lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    else if (ord === 'popularidad') lista.sort((a, b) => b.popularidad - a.popularidad);
    else lista.sort((a, b) => (b.jugado || '0').localeCompare(a.jugado || '0'));
    return lista;
  }

  function renderChips() {
    const labels = { genero: 'Género', plataforma: 'Plataforma', anio: 'Año', estado: 'Estado' };
    chips.innerHTML = Object.entries(state)
      .filter(([k, v]) => v && k !== 'q')
      .map(([k, v]) => `<button class="chip" data-k="${k}" aria-label="Quitar filtro ${labels[k]}">${labels[k]}: ${k === 'estado' ? ESTADOS[v] : v} ✕</button>`)
      .join('');
  }

  function render() {
    const lista = filtrar();
    renderChips();

    if (GAMES.length === 0) {
      grid.innerHTML = '';
      contador.textContent = '';
      vacio.innerHTML = `
        <div class="empty pixel-frame">
          <h3>CATÁLOGO EN CONSTRUCCIÓN</h3>
          <p>Estoy cargando los juegos del canal. Mientras tanto, pásate por los directos.</p>
          <a class="btn btn-primary" href="canales.html">IR A LOS CANALES</a>
        </div>`;
      return;
    }

    if (lista.length === 0) {
      grid.innerHTML = '';
      contador.textContent = '0 juegos encontrados';
      vacio.innerHTML = `
        <div class="empty pixel-frame">
          <h3>GAME OVER</h3>
          <p>No se encontró ningún juego en esta partida. Prueba con otros filtros.</p>
          <button class="btn btn-primary" id="limpiar" type="button">LIMPIAR FILTROS</button>
        </div>`;
      document.getElementById('limpiar').addEventListener('click', limpiarTodo);
      return;
    }

    vacio.innerHTML = '';
    contador.textContent = `${lista.length} ${lista.length === 1 ? 'juego' : 'juegos'} en el catálogo`;
    grid.innerHTML = lista.map(cardHTML).join('');
  }

  function limpiarTodo() {
    state.q = ''; buscador.value = '';
    for (const k of ['genero', 'plataforma', 'anio', 'estado']) { state[k] = ''; selects[k].value = ''; }
    render();
  }

  // Filtros
  for (const [k, sel] of Object.entries(selects)) {
    sel.addEventListener('change', () => { state[k] = sel.value; render(); });
  }
  orden.addEventListener('change', render);

  // Chips removibles
  chips.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const k = chip.dataset.k;
    state[k] = '';
    selects[k].value = '';
    render();
  });

  // Búsqueda: filtra la cuadrícula y muestra dropdown desde el 3er carácter
  buscador.addEventListener('input', () => {
    state.q = buscador.value.trim();
    render();
    if (state.q.length >= 3) {
      const matches = GAMES.filter(g => norm(g.nombre).includes(norm(state.q))).slice(0, 6);
      if (matches.length > 0) {
        resultados.innerHTML = matches.map(g =>
          `<a href="juego.html?id=${g.id}"><img src="${coverSrc(g)}" alt="">${g.nombre.toUpperCase()}</a>`
        ).join('');
        resultados.hidden = false;
        return;
      }
    }
    resultados.hidden = true;
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) resultados.hidden = true;
  });

  render();
});
