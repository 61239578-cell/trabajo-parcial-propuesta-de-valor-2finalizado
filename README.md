# Smart Fit Cusco — sitio web con asistente de tallas

Sitio de una sola página con subpáginas (Inicio, Tienda, Asistente de tallas, Nosotros, Tu opinión, Contacto).
Incluye a **Lía**, la asistente flotante que habla en todas las páginas, y el registro de datos a Excel.

## Archivos
```
index.html            -> estructura del sitio
apps-script.gs        -> código para guardar los datos en Google Sheets / Excel
assets/style.css      -> diseño
assets/app.js         -> lógica (asistente, tienda, Lía, encuestas)
assets/config.js      -> AQUÍ configuras el Excel y las imágenes
assets/img/           -> AQUÍ van tus fotos (ver LEEME.txt)
```

## 1. Conectar con Google Sheets / Excel (v5, una sola vez)
1. Crea una hoja nueva en Google Sheets (vacía), con tu cuenta de Google Workspace.
2. Extensiones -> Apps Script. Borra lo que haya, pega `apps-script.gs` y guarda.
3. Elige la función `configurar` y pulsa Ejecutar (autoriza los permisos). Crea las pestañas, listas desplegables, colores, el Catálogo y el Resumen.
4. Implementar -> Nueva implementación -> Aplicación web. Ejecutar como: Yo. Acceso: Cualquier persona. Copia la URL `/exec`.
5. En `assets/config.js` pega esa URL en `ENDPOINT` y en `CATALOGO_URL` la misma URL seguida de `?catalogo=1`.
6. Para tener el Excel: Archivo -> Descargar -> Microsoft Excel (.xlsx).

Pestañas que se llenan solas (v6):
- **Formulario**: la encuesta completa de "Tu opinión" (cada pregunta con su título, estrellas, recomendación 0–10).
- **Compras**: cada pedido (WhatsApp o reserva en tienda) con cliente, celular, prendas, total y *estado* (Nuevo, Confirmado, Pagado, Listo para recoger, Entregado, Cancelado).
- **Medidas**: altura, pecho, cintura, cadera, silueta y talla calculada de cada persona.
- **Probador**: prendas probadas y tallas listas. **Bolsa**: prendas añadidas. **Favoritos**. **Visitas** (fichas vistas).
- **Opiniones** (tras tallaje y tras compra), **Contactos** (Pendiente/Respondido), **Suscriptores**, **Cambios** de talla, **Lia** (preguntas al asistente), **Eventos** (otros clics).
- **Catalogo**: editable; la tienda lo lee sin tocar código. **Resumen**: totales, promedios y rankings (tallas, prendas probadas y favoritas).
Si venías de la v5, `configurar` renombra Pedidos -> Compras y Encuesta -> Formulario sin perder datos.

Si cambias el Apps Script debes crear una *nueva implementación* (o "Administrar implementaciones" -> editar -> Nueva versión).
Panel de resultados y CSV: abre `index.html?admin=1#opinion`.
En la bolsa, la persona escribe nombre y celular antes de pedir; sin eso no se envía el pedido.

## 2. Agregar imágenes
1. Copia tus fotos a `assets/img/` (nombres sugeridos en `assets/img/LEEME.txt`).
2. Abre `assets/config.js` y escribe la ruta, por ejemplo `v1: 'assets/img/v1.jpg'`.
3. Recarga. Si una foto falla o falta, el sitio usa la ilustración automáticamente.
El probador virtual siempre usa la figura dibujada, porque se ajusta a las medidas de cada persona.

## 3. Catálogo editable desde Google Sheets (sin tocar código)
1. Importa `catalogo.csv` a una hoja nueva de Google Sheets y edítala (una fila por prenda).
   Columnas: id, categoria (vestido, top, casaca, pantalon), nombre, estilo, precio, precio_anterior, etiqueta (Nuevo, -20% o vacío),
   siluetas (reloj, pera, manzana, rect, inv separadas por ;), colores (Negro, Crema, Azul, Terracota, Verde, Mostaza separados por ;), tela, cuidados.
2. Archivo -> Compartir -> Publicar en la web -> elige esa hoja y formato CSV -> Publicar. Copia el link.
3. Pégalo en `assets/config.js` en `CATALOGO_URL`. Si queda vacío o falla, se usa el catálogo que viene en `app.js`.
La clave de imagen de cada prenda es su `id` (ej: `z1: 'assets/img/z1.jpg'` en config.js).

## 4. Pedidos por WhatsApp
En `assets/config.js` cambia `WHATSAPP` por tu número con código de país (ej: `51984123456`). Lo usan el botón "Pedir por WhatsApp" de la bolsa y la página Contacto.

## 5. Publicar en GitHub Pages
1. Repositorio -> Add file -> Upload files. Sube TODO el contenido (incluida la carpeta `assets`).
2. Settings -> Pages -> rama `main`, carpeta `/ (root)`.
3. Abre el link, haz un tallaje, envía una opinión y comprueba que aparezcan filas en la hoja.

Datos de contacto, precios y stock son de ejemplo: cámbialos en `assets/app.js` (buscar `CAT=` y la página `contacto`).


---
## Novedades v4 (imágenes, efectos y mejoras)

**Cómo cambiar fotos:** reemplaza el archivo en `assets/img/` con el mismo nombre (WebP) o cambia la ruta en `assets/config.js`.
Fotos extra de una prenda: `v1_2`, `v1_3`… (miniaturas en la ficha; la `_2` se ve al pasar el mouse en la tarjeta).
Foto por color: `v1_Terracota`, `v1_Verde`… (cambia al elegir el color; si no existe se usa la principal).

**Apagar efectos** (en `assets/config.js`, bloque `EFECTOS`; `EFECTOS: false` apaga todos):
`zoom` · `crossfade` · `tilt` · `colorHover` · `tov` (categorías) · `kenburns` · `parallax` · `entrada` · `reveal` · `marquee` · `lupa` · `lightbox` · `cursor` · `probadorFoto`.
Además se respeta `prefers-reduced-motion`. Todo el código nuevo está en `assets/efectos.js` y al final de `assets/style.css`.

**Tallas agotadas:** columna opcional `agotadas` en `catalogo.csv` (ej. `L;5XL`).
**Cambio de talla:** botón en la bolsa y en el asistente; se registra en el Excel con tipo `cambio_talla`.
**Pago:** botón "Pagar ahora" desactivado; instrucciones al inicio de `assets/efectos.js` y bloque `PAGO` en config.
**Analítica:** bloque `ANALITICA` en config (apagada). **Idioma:** botón ES/EN (traduce la interfaz; las guías del blog están en español).
**SEO / rutas limpias:** `generar-paginas.py` crea `/tienda/`, `/producto/v1/`, `/blog/...` con sus etiquetas (title, description, Open Graph). Pon `SITIO_URL` en config.js y `SITIO` en el script para vistas previas con dirección completa y `sitemap.xml`.
