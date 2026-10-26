# Lecoude

Copia de trabajo del sitio público [lecoude.com](https://lecoude.com). El sitio en producción se sirve con GitHub Pages desde la rama `main` del repositorio público. Esta copia no despliega nada: los cambios de aquí no llegan a lecoude.com.

Marca y razón social: **Lecoude** / **Lecoude SRL**.

## Cómo verlo en local

No hay paso de build. Es HTML, CSS y JavaScript estáticos.

```bash
python3 -m http.server 43123 --bind 127.0.0.1
```

Abre [http://127.0.0.1:43123](http://127.0.0.1:43123). El idioma de las páginas interiores se cambia con el interruptor EN/ES (o `?lang=es`).

## Qué falta y está marcado

Donde solo Victor puede aportar el dato, el sitio dice **TODO_VICTOR**: correo oficial, teléfono, WhatsApp, dirección, redes, backend del formulario, precios fuera de Posicionamiento en IA, alcance de Crecimiento y Enterprise, testimonios reales y la imagen social definitiva.

La imagen `assets/images/og-image.png` es una tarjeta 1200×630 generada a partir del diseño existente (fondo `#080D18`, wordmark Lecoude). Sustituirla si hay una pieza oficial.

## No hacer

No subir esta copia a la rama `main` del repositorio público. Un push ahí republica el sitio en lecoude.com.
