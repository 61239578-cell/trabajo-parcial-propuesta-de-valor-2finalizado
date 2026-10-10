#!/usr/bin/env python3
"""
Genera páginas estáticas con URL limpia (ej. /tienda/vestido/, /producto/v1/, /blog/...)
para GitHub Pages. Cada una tiene su title, description y Open Graph propios (así se ve
bien al compartir el enlace) y redirige a la aplicación (#ruta).

USO (opcional, solo si cambias el catálogo o tu dirección):
    python3 generar-paginas.py
Si pones SITIO abajo (sin barra final), las vistas previas y el sitemap usan la dirección completa.
"""
import csv, os, shutil, html

SITIO = ''   # ej: 'https://tuusuario.github.io/smart-fit-cusco'

KN = {'vestido': 'Vestidos', 'top': 'Tops', 'casaca': 'Casacas', 'pantalon': 'Pantalones'}
PAGINAS = {
    'tienda': ('Tienda de moda talla grande | Smart Fit Cusco', 'Vestidos, tops, casacas y pantalones de la L a la 5XL. Filtra por color, estilo y silueta.'),
    'asistente': ('Asistente de tallas | Smart Fit Cusco', 'Ingresa tus medidas, descubre tu talla exacta y pruébate la prenda en el probador virtual.'),
    'nosotros': ('Nosotros | Smart Fit Cusco', 'Somos un ecosistema digital de moda inclusiva para tallas grandes en Cusco.'),
    'opinion': ('Tu opinión | Smart Fit Cusco', 'Cuéntanos qué te pareció el asistente de tallas y ayúdanos a mejorar.'),
    'contacto': ('Contacto y recojo en tienda | Smart Fit Cusco', 'Escríbenos por WhatsApp o recoge tu pedido en Cusco.'),
    'blog': ('Guías de estilo por silueta | Smart Fit Cusco', 'Tres guías para elegir prendas según tu silueta: reloj de arena, pera y manzana.'),
}
BLOG = {
    'silueta-reloj-de-arena': ('Silueta reloj de arena: cómo marcar tu cintura', 'Prendas y cortes que acompañan una silueta reloj de arena.'),
    'silueta-pera': ('Silueta pera: equilibrio entre arriba y abajo', 'Cómo vestir una silueta pera: cortes, escotes y colores que equilibran.'),
    'silueta-manzana': ('Silueta manzana: comodidad con estructura', 'Guía para una silueta manzana: telas, largos y cortes que estilizan.'),
}
RAIZ = os.path.dirname(os.path.abspath(__file__))

def pagina(ruta, titulo, desc, imagen='assets/img/og.jpg'):
    prof = ruta.count('/') + 1
    rel = '../' * prof
    destino = rel + '#' + ruta
    abs_ = (SITIO + '/') if SITIO else rel
    og = abs_ + imagen
    url = (SITIO + '/' + ruta + '/') if SITIO else ''
    t, d = html.escape(titulo), html.escape(desc, quote=True)
    out = os.path.join(RAIZ, *ruta.split('/'))
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(f'''<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t}</title><meta name="description" content="{d}">
{('<link rel="canonical" href="%s">' % url) if url else ''}
<meta property="og:title" content="{t}"><meta property="og:description" content="{d}"><meta property="og:type" content="website">
<meta property="og:image" content="{og}">{('<meta property="og:url" content="%s">' % url) if url else ''}<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url={destino}"><script>location.replace("{destino}")</script></head>
<body><p><a href="{destino}">{t}</a></p></body></html>''')

urls = ['']
for r, (t, d) in PAGINAS.items():
    pagina(r, t, d); urls.append(r)
for c, n in KN.items():
    pagina('tienda/' + c, n + ' talla grande | Smart Fit Cusco', f'Compra {n.lower()} de la L a la 5XL en Smart Fit Cusco.'); urls.append('tienda/' + c)
for s, (t, d) in BLOG.items():
    pagina('blog/' + s, t + ' | Smart Fit Cusco', d); urls.append('blog/' + s)
with open(os.path.join(RAIZ, 'catalogo.csv'), encoding='utf-8-sig') as f:
    for fila in csv.DictReader(f):
        img = 'assets/img/%s.webp' % fila['id']
        pagina('producto/' + fila['id'], fila['nombre'] + ' | Smart Fit Cusco',
               f"{fila['nombre']} en tallas L a 5XL. S/ {fila['precio']}.00. Calcula tu talla y pruébatela en el probador virtual.", img)
        urls.append('producto/' + fila['id'])
if SITIO:
    with open(os.path.join(RAIZ, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
                ''.join('<url><loc>%s/%s</loc></url>\n' % (SITIO, (u + '/') if u else '') for u in urls) + '</urlset>\n')
    with open(os.path.join(RAIZ, 'robots.txt'), 'w') as f:
        f.write('User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' % SITIO)
print(len(urls) - 1, 'páginas generadas')
