# Bienvenido a mi mundo — Legans_8

Catálogo personal de videojuegos jugados en directo (Twitch) y YouTube, con
estética retro pixel-art. Sitio estático: solo HTML, CSS y JavaScript, sin
dependencias ni build.

## Páginas

- **Inicio** — hero con avatar animado (parpadeo + habla con bocadillos geek),
  sprite caminante, juegos recientes y destacados.
- **Catálogo** — buscador, filtros y portadas con transición de zoom al abrir.
- **Sobre mí** — biografía, banner con glitch y avatar 360°.
- **Canales** — redes + minijuego "Mundo 1-1" estilo Mario Bros (canvas, WASD/flechas).
- **Contacto** — formulario tipo terminal CRT con un NPC animado que reacciona.

## Cómo verlo en local

Cualquier servidor estático sirve. Por ejemplo:

```bash
python -m http.server 4173
```

Y abrir <http://localhost:4173>.

## Estructura

```
css/      estilos (un solo styles.css con variables de tema)
js/       lógica por página (app, home, catalogo, juego, contacto, mario)
media/    imágenes, avatares y portadas
*.html    una página por archivo
```
