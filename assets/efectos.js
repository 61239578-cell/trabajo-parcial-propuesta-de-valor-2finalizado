/* =====================================================================
   SMART FIT CUSCO — assets/efectos.js
   Todo lo nuevo (efectos, lightbox, probador con foto, pago, idioma,
   SEO, blog y analítica) vive en este archivo. app.js solo tiene
   pequeños "ganchos" (FX.cambio, FX.pagar) y marcas en el HTML.

   ÍNDICE
    1. Utilidades y interruptores (config.js → EFECTOS)
    2. Escaneo del DOM (se re-ejecuta cada vez que app.js dibuja algo)
    3. Aparición al hacer scroll · 4. Tilt 3D · 5. Puntos de color
    6. Lupa · 7. Teclado · 8. Parallax · 9. Cursor personalizado
   10. Lightbox · 11. Probador con tu foto · 12. Cambio de talla
   13. PASARELA DE PAGO · 14. Idioma ES/EN · 15. SEO por página
   16. Blog (guías por silueta) · 17. Analítica · 18. Arranque

   CÓMO APAGAR TODO: en config.js pon  EFECTOS: false
   CÓMO APAGAR UNO:  en config.js pon  EFECTOS: { cursor: false, ... }
   ===================================================================== */

/* =====================================================================
   PASARELA DE PAGO — cómo activarla (botón "Pagar ahora" de la bolsa)
   ---------------------------------------------------------------------
   El botón está desactivado por defecto. Para activarlo:
   MERCADO PAGO
     1. Crea una cuenta en mercadopago.com.pe y obtén tu Access Token.
        ¡NUNCA lo pongas en este archivo! Debe vivir en un servidor.
     2. Crea una función serverless (Cloudflare Worker, Netlify, Vercel,
        Apps Script...) que reciba { items:[{title,quantity,unit_price,
        currency_id}] }, cree una "preferencia" con la API de Mercado Pago
        y responda { init_point: "https://www.mercadopago.com.pe/..." }.
     3. En config.js: PAGO.ACTIVO = true, PROVEEDOR = 'mercadopago' y
        URL_PREFERENCIA = 'https://tu-funcion...'.
   CULQI
     1. Cuenta en culqi.com → copia tu llave pública (pk_...).
     2. En index.html agrega  <script src="https://checkout.culqi.com/js/v4"></script>
        antes de efectos.js.
     3. En config.js: PAGO.ACTIVO = true, PROVEEDOR = 'culqi', PUBLIC_KEY.
     4. Define window.culqi = function(){ ... } que lee Culqi.token y lo
        envía a TU servidor para crear el cargo con la llave privada.
   ===================================================================== */

(function () {
  'use strict';

  /* ---------- 1. UTILIDADES E INTERRUPTORES ---------- */
  var CFG = window.CONFIG || {}, EF = CFG.EFECTOS, IMGS = CFG.IMAGENES || {};
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var REDUCE = mq('(prefers-reduced-motion: reduce)');           // respeta "reducir movimiento"
  var MOUSE = mq('(hover: hover) and (pointer: fine)');          // solo mouse (no celular/tablet)
  var FLAGS = ['zoom', 'crossfade', 'tilt', 'colorHover', 'tov', 'kenburns', 'parallax', 'entrada',
               'reveal', 'marquee', 'lupa', 'lightbox', 'cursor', 'probadorFoto'];
  function on(k) { return EF !== false && !(EF && EF[k] === false); }
  FLAGS.forEach(function (f) { if (!on(f)) root.classList.add('fx-off-' + f); });   // el CSS usa estas clases
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  /* ---------- 2. ESCANEO DEL DOM ---------- */
  var lastHash = null, scanning = false;
  function scan() {
    scanning = false;
    var fresh = location.hash !== lastHash; lastHash = location.hash;
    reveal(fresh); tilt(); dots(); lupa(); teclado(); parReg(); probador();
    if (lang === 'en') traducir(document.body);
    if (document.title !== myTitle) seo();
  }
  function schedule() { if (!scanning) { scanning = true; requestAnimationFrame(scan); } }

  /* ---------- 3. APARICIÓN AL HACER SCROLL (IntersectionObserver) ---------- */
  var io = null;
  function reveal(fresh) {
    if (!on('reveal') || REDUCE || !('IntersectionObserver' in window)) return;
    if (!io) io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el); el.classList.add('fx-in');
        setTimeout(function () { el.classList.remove('fx-rev', 'fx-in'); el.style.transitionDelay = ''; }, 1100);
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    var v = $('#view'); if (!v) return;
    $$('.pc,.tile,.lkb,.bcard,.sec .hd,.ben>div,.col3>div,.ban .w>*,.gde>div', v).forEach(function (el) {
      if (el.__rv) return; el.__rv = 1;
      if (!fresh) return;                                  // al filtrar/escribir no se re-anima
      var i = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      el.classList.add('fx-rev'); el.style.transitionDelay = ((i % 6) * 80) + 'ms'; io.observe(el);
    });
    // seguro: si por algo no se activan, se muestran igual
    setTimeout(function () { $$('.fx-rev').forEach(function (el) { el.classList.add('fx-in'); }); }, 2600);
  }

  /* ---------- 4. TILT 3D SUTIL (máx. 6°, solo mouse) ---------- */
  function tilt() {
    if (!on('tilt') || REDUCE || !MOUSE) return;
    $$('.pc .im:not([data-fxt])').forEach(function (el) {
      el.setAttribute('data-fxt', '1'); var raf = 0, ev;
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return; ev = e;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0; var r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
          el.style.transform = 'perspective(800px) rotateX(' + (-y * 12).toFixed(2) + 'deg) rotateY(' + (x * 12).toFixed(2) + 'deg)';   // ±6°
        });
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 5. PUNTOS DE COLOR EN LA TARJETA ---------- */
  function dots() {
    if (!on('colorHover')) return;
    $$('.pc:not([data-fxd])').forEach(function (pc) {
      pc.setAttribute('data-fxd', '1');
      var id = pc.dataset.id, im = $('.im', pc), tn = $('.fx-tn', pc), nm = $('.cn', pc), main = $('.ph:not(.ph2)', im), orig = main && main.getAttribute('src');
      if (!tn || !nm) return;
      function show(col) {
        var k = id + '_' + col, has = !!IMGS[k];
        nm.textContent = col;
        if (main && main.parentNode) main.src = has ? IMGS[k] : orig;               // foto por color si existe
        tn.style.background = (window.COL && COL[col]) || '#999';
        tn.style.opacity = (has || (main && main.parentNode)) ? 0 : .4;      // las fotos no se tiñen; solo la ilustración de respaldo
      }
      function back() {
        var s = pc.dataset.sel;
        if (s) { show(s); return; }
        nm.textContent = ''; tn.style.opacity = 0; if (main && main.parentNode && orig) main.src = orig;
      }
      $$('.dot', pc).forEach(function (d) {
        d.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(d.dataset.dc); });
        d.addEventListener('focus', function () { show(d.dataset.dc); });
        d.addEventListener('blur', back);
        d.addEventListener('click', function (e) {          // clic o toque: deja el color elegido (también lo usa "Añadir")
          e.stopPropagation(); pc.dataset.sel = d.dataset.dc;
          $$('.dot', pc).forEach(function (x) { x.classList.toggle('on', x === d); }); show(d.dataset.dc);
        });
      });
      $('.dots', pc).addEventListener('pointerleave', back);
    });
  }

  /* ---------- 6. LUPA EN LA FICHA ---------- */
  function lupa() {
    if (!on('lupa') || !MOUSE) return;
    var f = $('.fim:not([data-fxl])'); if (!f) return; f.setAttribute('data-fxl', '1');
    var im = $('.ph.main', f); if (!im) return;
    f.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return; var r = f.getBoundingClientRect();
      im.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' + ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
      f.classList.add('fx-z');
    });
    f.addEventListener('pointerleave', function () { f.classList.remove('fx-z'); });
  }

  /* ---------- 7. TECLADO: colores y tallas son botones accesibles ---------- */
  function teclado() {
    $$('.sw:not([tabindex]),.sz:not([tabindex])').forEach(function (el) {
      el.tabIndex = 0; el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (el.classList.contains('sw') ? 'Color ' : 'Talla ') + (el.title && el.classList.contains('sw') ? el.title : el.textContent.trim()) + (el.classList.contains('ag') ? ' (agotada)' : ''));
    });
  }
  document.addEventListener('keydown', function (e) {
    var el = e.target;
    if ((e.key !== 'Enter' && e.key !== ' ') || !el || el.getAttribute('role') !== 'button' || /^(BUTTON|A|INPUT)$/.test(el.tagName)) return;
    e.preventDefault();
    var at = ['data-pc', 'data-ps', 'data-z', 'data-c', 'data-gi'].filter(function (a) { return el.hasAttribute(a); })[0], v = at && el.getAttribute(at);
    el.click();
    if (at) setTimeout(function () { var n = document.querySelector('[' + at + '="' + v + '"]'); if (n) n.focus(); }, 40);   // recupera el foco tras redibujar
  });

  /* ---------- 8. PARALLAX (solo transform) ---------- */
  var PAR = [], ptk = 0;
  function parReg() {
    if (!on('parallax') || REDUCE) return;
    PAR = $$('.hz,.nimg .ph'); parTick();
  }
  function parTick() {
    ptk = 0; var vh = window.innerHeight;
    PAR.forEach(function (el) {
      var h = el.parentNode; if (!h) return; var r = h.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var d = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (d * (el.classList.contains('ph') && !el.classList.contains('hero-img') ? -.1 : -.07)).toFixed(1) + 'px,0)';
    });
  }
  window.addEventListener('scroll', function () { if (PAR.length && !ptk) ptk = requestAnimationFrame(parTick); }, { passive: true });
  window.addEventListener('resize', function () { if (PAR.length) parTick(); });

  /* ---------- 9. CURSOR PERSONALIZADO (solo mouse) ---------- */
  function cursor() {
    if (!on('cursor') || !MOUSE || REDUCE) return;
    var c = document.createElement('div'); c.className = 'fx-cur'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span>Ver</span>';
    document.body.appendChild(c);
    var x = -100, y = -100, cx = x, cy = y, sc = .2, big = false, raf = 0;
    function loop() {
      cx += (x - cx) * .25; cy += (y - cy) * .25; sc += ((big ? 1 : .2) - sc) * .2;
      c.style.transform = 'translate3d(' + (cx - 32).toFixed(1) + 'px,' + (cy - 32).toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')';
      raf = (Math.abs(x - cx) > .3 || Math.abs(y - cy) > .3 || Math.abs((big ? 1 : .2) - sc) > .01) ? requestAnimationFrame(loop) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY; c.classList.add('on');
      var t = e.target.closest ? e.target : null;
      big = !!(t && t.closest('.pc .im,.tile,.fim,.hero .hz,.lkb,.bcard .bim') && !t.closest('button,a.btn,input,select,textarea'));
      c.classList.toggle('big', big); kick();
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { c.classList.remove('on'); });
    root.classList.add('fx-cursor-on');
  }

  /* ---------- 10. LIGHTBOX ---------- */
  var LB = null;
  function lightbox(items, i, cta) {
    if (!on('lightbox') || !items.length) return;
    if (LB) LB.close();
    var prevFocus = document.activeElement, idx = i || 0, tx = 0;
    var el = document.createElement('div'); el.className = 'fx-lb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Vista ampliada de la foto');
    el.innerHTML = '<button class="fx-lbx" aria-label="Cerrar vista ampliada">✕</button>' +
      (items.length > 1 ? '<button class="fx-lbp" aria-label="Foto anterior">‹</button><button class="fx-lbn" aria-label="Foto siguiente">›</button>' : '') +
      '<figure><img alt=""><figcaption></figcaption></figure><div class="fx-lbc"><span class="fx-lbk"></span>' + (cta ? '<button class="btn" id="fxlbc">' + esc(cta.t) + '</button>' : '') + '</div>';
    document.body.appendChild(el); document.body.style.overflow = 'hidden';
    var img = $('img', el), cap = $('figcaption', el), cnt = $('.fx-lbk', el);
    function show(n) {
      idx = (n + items.length) % items.length; var it = items[idx];
      img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
      img.src = it.src; img.alt = it.alt || ''; cap.textContent = it.alt || '';
      cnt.textContent = items.length > 1 ? (idx + 1) + ' / ' + items.length : '';
      var nx = new Image(); nx.src = items[(idx + 1) % items.length].src;       // precarga la siguiente
    }
    function close() { document.removeEventListener('keydown', key); el.remove(); document.body.style.overflow = ''; LB = null; if (prevFocus && prevFocus.focus) prevFocus.focus(); }
    function key(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'Tab') {                                               // el foco se queda dentro del lightbox
        var f = $$('button', el); if (!f.length) return; var a = f.indexOf(document.activeElement);
        if (e.shiftKey && a <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    }
    $('.fx-lbx', el).onclick = close;
    if ($('.fx-lbp', el)) { $('.fx-lbp', el).onclick = function () { show(idx - 1); }; $('.fx-lbn', el).onclick = function () { show(idx + 1); }; }
    if (cta) $('#fxlbc', el).onclick = function () { close(); cta.f(); };
    el.addEventListener('click', function (e) { if (e.target === el || e.target.tagName === 'FIGURE') close(); });
    el.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });          // deslizar en celular
    el.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50 && items.length > 1) show(idx + (d < 0 ? 1 : -1)); }, { passive: true });
    document.addEventListener('keydown', key); LB = { close: close }; show(idx); $('.fx-lbx', el).focus();
  }
  document.addEventListener('click', function (e) {
    var f = e.target.closest && e.target.closest('.fim[data-lb]');
    if (f && !e.target.closest('[data-fav]')) {                                  // foto de la ficha
      var ks = f.dataset.lb.split('|'), id = f.dataset.lbp, c = window.byId && byId(id);
      lightbox(ks.map(function (k) { return { src: IMGS[k], alt: window.altOf ? altOf(k) : '' }; }), +f.dataset.lbi, {
        t: 'Probar con mi talla', f: function () { window.probar(id); if (window.PG && PG.pc) window.S.col = PG.pc; }
      });
      return;
    }
    var l = e.target.closest && e.target.closest('.lkb');
    if (l) {                                                                     // looks de temporada
      var L = CFG.LOOKBOOK || [], ks2 = l.dataset.lbk.split('|');
      lightbox(ks2.map(function (k) { var m = L.filter(function (z) { return z.k === k; })[0] || {}; return { src: IMGS[k], alt: m.alt || m.t || '' }; }), +l.dataset.lbi, { t: 'Ver la tienda', f: function () { location.hash = '#tienda'; } });
    }
  });

  /* ---------- 11. PROBADOR CON TU FOTO (solo en tu navegador) ---------- */
  var F = { url: null, x: 0, y: 0, s: 1 };
  function probador() {
    var fg = $('#figp'); if (!fg || fg.__fx || !on('probadorFoto')) return; fg.__fx = 1;
    var col = fg.nextElementSibling, row = col && $('.row', col); if (!row) return;
    var box = document.createElement('div'); box.className = 'fx-ph';
    box.innerHTML = '<p class="lab" style="margin:14px 0 6px">Probador con tu foto</p><div class="row" style="margin-top:0"><label class="btn o sm fx-file" tabindex="0">Subir mi foto<input type="file" accept="image/*" hidden id="fxf"></label><button class="btn o sm" id="fxq" hidden>Usar la figura</button></div><label class="fx-sl" id="fxsl" hidden>Tamaño de la prenda<input type="range" id="fxs" min="50" max="170" value="100" aria-label="Tamaño de la prenda"></label><p class="lab" style="margin:8px 0 0;text-transform:none;letter-spacing:0">Tu foto se procesa solo en tu navegador y no se envía a ningún servidor. Arrastra la prenda para acomodarla. Es una superposición aproximada.</p>';
    col.insertBefore(box, row);
    function sync() { $('#fxq').hidden = !F.url; $('#fxsl').hidden = !F.url; $('#fxs').value = Math.round(F.s * 100); }
    function aplicar() {
      var m = window.M ? M() : { pecho: 112, cintura: 98, cadera: 122 }, g = window.fig(fg.dataset.k, fg.dataset.col, m, +fg.dataset.sz, false);
      var shape = (g.match(/<polygon[^>]*>/) || [''])[0] + (g.match(/<line[^>]*x1="100" y1="68"[^>]*>/) || [''])[0];
      fg.classList.add('fx-photo');
      fg.innerHTML = '<img class="fx-pimg" src="' + F.url + '" alt="Tu foto en el probador virtual"><svg class="fx-pg" viewBox="0 0 200 340" role="img" aria-label="Prenda sobre tu foto. Arrástrala para moverla" tabindex="0"></svg>';
      var sv = $('.fx-pg', fg); sv.innerHTML = shape.replace('<polygon', '<polygon fill-opacity=".82"');
      function pos() { sv.style.transform = 'translate(' + F.x + 'px,' + F.y + 'px) scale(' + F.s + ')'; } pos();
      var dx, dy, dr = false;
      sv.addEventListener('pointerdown', function (e) { dr = true; dx = e.clientX - F.x; dy = e.clientY - F.y; sv.setPointerCapture(e.pointerId); });
      sv.addEventListener('pointermove', function (e) { if (!dr) return; F.x = e.clientX - dx; F.y = e.clientY - dy; pos(); });
      sv.addEventListener('pointerup', function () { dr = false; });
      sv.addEventListener('keydown', function (e) {                              // mover con flechas (teclado)
        var st = 8, k = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key]; if (!k) return;
        e.preventDefault(); F.x += k[0]; F.y += k[1]; pos();
      });
      $('#fxs').oninput = function () { F.s = this.value / 100; pos(); };
    }
    $('#fxf').onchange = function () {
      var f = this.files && this.files[0]; if (!f || !/^image\//.test(f.type)) { window.toast('Elige un archivo de imagen'); return; }
      if (F.url) URL.revokeObjectURL(F.url);
      F.url = URL.createObjectURL(f); F.x = F.y = 0; F.s = 1; aplicar(); sync();   // la foto nunca sale del navegador
      if (window.track) track('probador_foto', 'foto local'); window.toast('Listo: arrastra la prenda para acomodarla');
    };
    $('.fx-file', box).addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#fxf').click(); } });
    $('#fxq').onclick = function () { if (F.url) URL.revokeObjectURL(F.url); F.url = null; window.render(); };   // vuelve a la figura SVG
    if (F.url) aplicar(); sync();
  }

  /* ---------- 12. CAMBIO DE TALLA (se registra en el Excel) ---------- */
  function cambio(it) {
    if (!it || !window.byId) return; var c = byId(it.id); if (!c) return;
    var ov = document.createElement('div'); ov.className = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="mod"><h3>Solicitar cambio de talla</h3><p class="lab">' + esc(c.n) + ' · ' + esc(it.col) + ' · talla actual ' + esc(it.sz) + '</p>' +
      '<label>Talla que necesitas<select id="fxcs" style="width:100%;margin-top:6px">' + SIZES.map(function (z) { var no = z.t === it.sz || agot(c, z.t); return '<option value="' + z.t + '"' + (no ? ' disabled' : '') + '>' + z.t + (z.t === it.sz ? ' (actual)' : agot(c, z.t) ? ' (agotada)' : '') + '</option>'; }).join('') + '</select></label>' +
      '<label style="margin-top:12px">Motivo<select id="fxcm" style="width:100%;margin-top:6px"><option>Me queda ajustada</option><option>Me queda holgada</option><option>Me equivoqué al elegir</option><option>Otro</option></select></label>' +
      '<textarea id="fxcc" rows="2" placeholder="Comentario (opcional)"></textarea><p class="err" id="fxce"></p><div class="row" style="margin-top:6px"><button class="btn" id="fxco">Enviar solicitud</button><button class="btn o" id="fxcn">Cancelar</button></div></div>';
    document.body.appendChild(ov); var pf = document.activeElement;
    var sel = $('#fxcs', ov); var first = Array.prototype.filter.call(sel.options, function (o) { return !o.disabled; })[0]; if (first) sel.value = first.value;
    function close() { document.removeEventListener('keydown', k); ov.remove(); if (pf && pf.focus) pf.focus(); }
    function k(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', k); sel.focus();
    $('#fxcn', ov).onclick = close;
    $('#fxco', ov).onclick = function () {
      if (!first || sel.options[sel.selectedIndex].disabled) { $('#fxce', ov).textContent = 'Elige una talla disponible.'; return; }
      var nueva = sel.value, motivo = $('#fxcm', ov).value;
      window.push('cambio_talla', { prenda: c.n, talla: it.sz, color: it.col, detalle: 'cambio de talla ' + it.sz + ' → ' + nueva + ' · ' + motivo, comentario: $('#fxcc', ov).value });
      close(); window.toast('Solicitud enviada: cambio a talla ' + nueva); if (window.Lia) Lia.say('¡Listo! Tu asistente preparará la talla ' + nueva + '.');
    };
  }

  /* ---------- 13. PASARELA DE PAGO (ver comentario al inicio del archivo) ---------- */
  function pagar(cart, total) {
    var P = CFG.PAGO || {};
    if (!P.ACTIVO) { window.toast('Pago en línea disponible pronto'); return; }
    var items = cart.map(function (x) { var c = byId(x.id); return { title: c.n + ' (' + x.col + ', talla ' + x.sz + ')', quantity: 1, unit_price: c.pr, currency_id: 'PEN' }; });
    window.track('pagar_ahora', P.PROVEEDOR + ' · S/ ' + total);
    if (P.PROVEEDOR === 'mercadopago') {
      if (!P.URL_PREFERENCIA) { window.toast('Falta configurar URL_PREFERENCIA'); return; }
      fetch(P.URL_PREFERENCIA, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d && d.init_point) location.href = d.init_point; else window.toast('No se pudo iniciar el pago'); })
        .catch(function () { window.toast('No se pudo conectar con el pago'); });
    } else if (P.PROVEEDOR === 'culqi') {
      if (!window.Culqi || !P.PUBLIC_KEY) { window.toast('Falta cargar Culqi y la llave pública'); return; }
      Culqi.publicKey = P.PUBLIC_KEY;
      Culqi.settings({ title: 'Smart Fit Cusco', currency: 'PEN', amount: total * 100 });   // el monto va en céntimos
      Culqi.open();
    }
  }

  /* ---------- 14. IDIOMA ES / EN ---------- */
  var lang = sget('sfc_lang') || CFG.IDIOMA || 'es', TR = [];
  var D = {
    'Envíos gratis en compras mayores a S/ 169.90 · Cambio de talla sin costo': 'Free shipping on orders over S/ 169.90 · Free size exchange',
    'Saltar al contenido': 'Skip to content', 'Inicio': 'Home', 'Tienda': 'Shop', 'Asistente de tallas': 'Size assistant', 'Guías de estilo': 'Style guides',
    'Nosotros': 'About us', 'Tu opinión': 'Your feedback', 'Contacto': 'Contact', 'Bolsa (': 'Bag (', 'Menú': 'Menu',
    'Colección 2026 · Tallas L a 5XL': '2026 Collection · Sizes L to 5XL', 'Moda que te queda como a ti.': 'Fashion that fits you.',
    'Vestidos, tops, casacas y pantalones para tallas grandes, con un asistente que mide tu talla exacta antes de comprar.': 'Dresses, tops, jackets and trousers for plus sizes, with an assistant that finds your exact size before you buy.',
    'Ver colección': 'View collection', 'Encuentra tu talla': 'Find your size', 'Compra por categoría': 'Shop by category', 'Ver todo': 'View all', 'Ver tienda': 'View shop',
    'Vestidos': 'Dresses', 'Tops': 'Tops', 'Casacas': 'Jackets', 'Pantalones': 'Trousers', 'Ver colección →': 'View collection →',
    'Deja de adivinar tu talla.': 'Stop guessing your size.', 'Probar el asistente': 'Try the assistant', 'Mide': 'Measure', 'Analiza': 'Analyze', 'Prueba': 'Try on',
    'Nuevo en tienda': 'New in', 'Looks de temporada': 'Season looks', 'Envíos gratis': 'Free shipping', 'En compras mayores a S/ 169.90': 'On orders over S/ 169.90',
    'Cambio de talla': 'Size exchange', 'Sin costo en el probador': 'Free at the fitting room', 'Pagos seguros': 'Secure payments', 'Tarjeta, Yape y Plin': 'Card, Yape and Plin',
    'Recojo en tienda': 'Store pickup', 'En Cusco, sin filas': 'In Cusco, no lines',
    'Envíos gratis desde S/ 169.90': 'Free shipping from S/ 169.90', 'Cambio de talla sin costo': 'Free size exchange', 'Asistente de tallas gratis': 'Free size assistant',
    'Recojo en tienda en Cusco': 'Store pickup in Cusco', 'Moda inclusiva de L a 5XL': 'Inclusive fashion from L to 5XL',
    'Toda la colección': 'Full collection', 'Mis favoritos': 'My favorites', 'Todo': 'All', 'Ordenar': 'Sort', 'Más relevantes': 'Most relevant', 'Precio: menor a mayor': 'Price: low to high',
    'Precio: mayor a menor': 'Price: high to low', 'Para mi silueta': 'For my shape', 'Buscar prendas…': 'Search clothes…', 'Todos los colores': 'All colors', 'Todos los estilos': 'All styles',
    'Negro': 'Black', 'Crema': 'Cream', 'Azul': 'Blue', 'Terracota': 'Terracotta', 'Verde': 'Green', 'Mostaza': 'Mustard',
    'Elegante': 'Elegant', 'Casual': 'Casual', 'Moderno': 'Modern', 'Clásico': 'Classic', 'Urbano': 'Urban',
    'Añadir': 'Add', 'Probar': 'Try on', 'Nuevo': 'New', 'Para tu silueta': 'For your shape', 'Quitar filtros': 'Clear filters',
    'Vestido envolvente': 'Wrap dress', 'Vestido línea A': 'A-line dress', 'Vestido midi fluido': 'Flowy midi dress', 'Blusa fluida': 'Flowy blouse', 'Polo básico': 'Basic polo',
    'Camisa oversize': 'Oversize shirt', 'Top cruzado': 'Wrap top', 'Blusa manga larga': 'Long-sleeve blouse', 'Suéter tejido': 'Knit sweater', 'Casaca larga': 'Long jacket',
    'Casaca estructurada': 'Structured jacket', 'Blazer largo': 'Long blazer', 'Cárdigan largo': 'Long cardigan', 'Bomber urbana': 'Urban bomber', 'Pantalón tiro alto': 'High-rise trousers',
    'Pantalón recto': 'Straight trousers', 'Pantalón fluido': 'Flowy trousers', 'Pantalón cargo': 'Cargo trousers', 'Pantalón sastre': 'Tailored trousers',
    'Añadir a la bolsa': 'Add to bag', 'Probar con mi talla': 'Try with my size', 'Detalles': 'Details', 'Tela': 'Fabric', 'Cuidados': 'Care', 'Tabla de medidas (cm)': 'Size chart (cm)',
    'Talla': 'Size', 'Pecho': 'Bust', 'Cintura': 'Waist', 'Cadera': 'Hip', 'Combina con': 'Pairs well with', 'Reseñas de clientas': 'Customer reviews',
    'Cambio de talla sin costo · Recojo en tienda en Cusco': 'Free size exchange · Store pickup in Cusco',
    'Tu bolsa': 'Your bag', 'Cerrar': 'Close', 'Quitar': 'Remove', 'Cambiar talla': 'Change size', 'Reservar para probar en tienda': 'Reserve to try in store', 'Pedir por WhatsApp': 'Order via WhatsApp',
    'Pagar ahora': 'Pay now', 'Tu bolsa está vacía.': 'Your bag is empty.', 'Solicitar cambio de talla': 'Request a size exchange', 'Enviar solicitud': 'Send request', 'Cancelar': 'Cancel',
    'Cuéntanos tus medidas': 'Tell us your measurements', '¿Cómo medirme?': 'How do I measure?', 'Analizar mis medidas': 'Analyze my measurements', 'Usar medidas de ejemplo': 'Use sample measurements',
    'Recordar mis medidas en este dispositivo': 'Remember my measurements on this device', 'Estatura (cm)': 'Height (cm)', 'Pecho (cm)': 'Bust (cm)', 'Cintura (cm)': 'Waist (cm)', 'Cadera (cm)': 'Hip (cm)',
    'Tu talla ideal': 'Your ideal size', 'Ver prendas para mí': 'See clothes for me', 'Cambiar medidas': 'Change measurements', 'Atrás': 'Back', 'Otra prenda': 'Another item', 'Pedir al asistente': 'Ask the assistant',
    'Probador con tu foto': 'Try-on with your photo', 'Subir mi foto': 'Upload my photo', 'Usar la figura': 'Use the figure', 'Dar mi opinión': 'Give my feedback',
    'Moda inclusiva para tallas grandes en Cusco, con un asistente que mide tu talla exacta.': 'Inclusive plus-size fashion in Cusco, with an assistant that finds your exact size.',
    'Empresa': 'Company', 'Newsletter': 'Newsletter', 'Recibe lanzamientos y beneficios.': 'Get launches and perks.', 'Suscribirme': 'Subscribe',
    'Moda inclusiva, hecha para encajar.': 'Inclusive fashion, made to fit.', 'Contacto y recojo en tienda': 'Contact and store pickup', 'Enviar mensaje': 'Send message', 'Escribir por WhatsApp': 'Write on WhatsApp',
    'Guías de estilo por silueta': 'Style guides by body shape', 'Ver prendas para tu silueta': 'See clothes for your shape', 'Leer guía': 'Read guide', 'Volver a las guías': 'Back to guides',
    'Correo electrónico': 'Email', 'Buscar prendas': 'Search clothes', 'Tu opinión nos ayuda a mejorar': 'Your feedback helps us improve', 'Enviar encuesta': 'Send survey'
  };
  var RX = [
    [/^Paso (\d+) de (\d+) · (.*)$/, function (m, a, b, c) { return 'Step ' + a + ' of ' + b + ' · ' + (({ 'Tus medidas': 'Your measurements', 'Análisis': 'Analysis', 'Elige tu prenda': 'Choose your item', 'Probador virtual': 'Virtual fitting room', 'Tu asistente': 'Your assistant' })[c] || c); }],
    [/^Color: (.*)$/, function (m, a) { return 'Color: ' + (D[a] || a); }],
    [/^Talla \(recomendada: (.*)\)$/, function (m, a) { return 'Size (recommended: ' + a + ')'; }],
    [/^Añadido a la bolsa: (.*)$/, function (m, a) { return 'Added to bag: ' + (D[a] || a); }]
  ];
  function tr1(t) { var k = t.trim(); if (!k) return null; var v = D[k]; if (v === undefined) { for (var i = 0; i < RX.length; i++) { var m = RX[i][0].exec(k); if (m) { v = RX[i][1].apply(null, m); break; } } } return v === undefined ? null : t.replace(k, v); }
  function traducir(r) {
    var w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentNode && n.parentNode.nodeName; return (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), n, a = [];
    while ((n = w.nextNode())) a.push(n);
    a.forEach(function (n) { if (n.__en === n.nodeValue) return; var v = tr1(n.nodeValue); if (v !== null && v !== n.nodeValue) { TR.push({ n: n, es: n.nodeValue }); n.__en = v; n.nodeValue = v; } });
    $$('[placeholder],[aria-label]', r).forEach(function (e) {
      ['placeholder', 'aria-label'].forEach(function (at) { var o = e.getAttribute(at); if (o && !e.hasAttribute('data-es-' + at) && D[o]) { e.setAttribute('data-es-' + at, o); e.setAttribute(at, D[o]); } });
    });
  }
  function destraducir() {
    TR.forEach(function (o) { if (o.n.isConnected && o.n.nodeValue === o.n.__en) { o.n.nodeValue = o.es; o.n.__en = null; } }); TR = [];
    $$('[data-es-placeholder],[data-es-aria-label]').forEach(function (e) {
      ['placeholder', 'aria-label'].forEach(function (at) { if (e.hasAttribute('data-es-' + at)) { e.setAttribute(at, e.getAttribute('data-es-' + at)); e.removeAttribute('data-es-' + at); } });
    });
  }
  function setLang(l) {
    lang = l; sset('sfc_lang', l); root.lang = l;
    var b = $('.fx-lang'); if (b) { b.textContent = l === 'es' ? 'EN' : 'ES'; b.setAttribute('aria-label', l === 'es' ? 'Switch to English' : 'Cambiar a español'); }
    if (l === 'en') traducir(document.body); else destraducir();
  }
  function langBtn() {
    var ic = $('.ic'); if (!ic) return; var b = document.createElement('button'); b.className = 'fx-lang'; b.type = 'button';
    b.onclick = function () { setLang(lang === 'es' ? 'en' : 'es'); }; ic.insertBefore(b, ic.firstChild);
  }

  /* ---------- 15. SEO POR PÁGINA (title, description, Open Graph, canonical) ---------- */
  var myTitle = '';
  var SEO = {
    inicio: ['Smart Fit Cusco — Moda inclusiva con asistente de tallas', 'Moda inclusiva para tallas grandes en Cusco. Calcula tu talla exacta, pruébate las prendas virtualmente y recíbelas verificadas.'],
    tienda: ['Tienda de moda talla grande | Smart Fit Cusco', 'Vestidos, tops, casacas y pantalones de la L a la 5XL. Filtra por color, estilo y silueta.'],
    asistente: ['Asistente de tallas | Smart Fit Cusco', 'Ingresa tus medidas, descubre tu talla exacta y pruébate la prenda en el probador virtual.'],
    nosotros: ['Nosotros | Smart Fit Cusco', 'Somos un ecosistema digital de moda inclusiva para tallas grandes en Cusco.'],
    opinion: ['Tu opinión | Smart Fit Cusco', 'Cuéntanos qué te pareció el asistente de tallas y ayúdanos a mejorar.'],
    contacto: ['Contacto y recojo en tienda | Smart Fit Cusco', 'Escríbenos por WhatsApp o recoge tu pedido en Cusco.'],
    blog: ['Guías de estilo por silueta | Smart Fit Cusco', 'Tres guías para elegir prendas según tu silueta: reloj de arena, pera y manzana.']
  };
  function meta(attr, name, val) {
    var m = document.head.querySelector('meta[' + attr + '="' + name + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute(attr, name); document.head.appendChild(m); } m.setAttribute('content', val);
  }
  function abs(u) { try { return new URL(u, (CFG.SITIO_URL ? CFG.SITIO_URL.replace(/\/$/, '') + '/' : location.href)).href; } catch (e) { return u; } }
  function seo() {
    var h = (location.hash || '#inicio').slice(1).split('/'), p = h[0] || 'inicio', o = SEO[p] || SEO.inicio, img = IMGS.hero ? 'assets/img/og.jpg' : '';
    var t = o[0], d = o[1];
    if (p === 'tienda' && window.KN && KN[h[1]]) { t = KN[h[1]] + ' talla grande | Smart Fit Cusco'; d = 'Compra ' + KN[h[1]].toLowerCase() + ' de la L a la 5XL en Smart Fit Cusco.'; }
    if (p === 'producto' && window.byId && byId(h[1])) {
      var c = byId(h[1]); t = c.n + ' | Smart Fit Cusco'; d = c.n + ' en tallas L a 5XL. S/ ' + c.pr + '.00. Calcula tu talla y pruébatela en el probador virtual.'; img = IMGS[c.id] || img;
      ld({ '@context': 'https://schema.org', '@type': 'Product', name: c.n, image: img ? abs(img) : undefined, description: d, offers: { '@type': 'Offer', priceCurrency: 'PEN', price: c.pr, availability: 'https://schema.org/InStock' } });
    } else ld(null);
    if (p === 'blog' && h[1]) { var a = POSTS.filter(function (x) { return x.s === h[1]; })[0]; if (a) { t = a.t + ' | Smart Fit Cusco'; d = a.d; img = IMGS[a.img] || img; } }
    document.title = t; myTitle = t;
    meta('name', 'description', d); meta('property', 'og:title', t); meta('property', 'og:description', d); meta('property', 'og:type', p === 'producto' ? 'product' : 'website');
    if (img) { meta('property', 'og:image', abs(img)); meta('name', 'twitter:image', abs(img)); } meta('name', 'twitter:card', 'summary_large_image');
    var base = (CFG.SITIO_URL ? CFG.SITIO_URL.replace(/\/$/, '') + '/' : location.origin + location.pathname.replace(/[^/]*$/, '')), url = p === 'inicio' ? base : base + h.join('/');
    meta('property', 'og:url', url);
    var l = document.head.querySelector('link[rel="canonical"]'); if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); } l.href = url;
  }
  function ld(o) {
    var e = document.getElementById('fx-ld'); if (!o) { if (e) e.remove(); return; }
    if (!e) { e = document.createElement('script'); e.type = 'application/ld+json'; e.id = 'fx-ld'; document.head.appendChild(e); } e.textContent = JSON.stringify(o);
  }

  /* ---------- 16. BLOG: GUÍAS DE ESTILO POR SILUETA ---------- */
  var POSTS = [
    {
      s: 'silueta-reloj-de-arena', sil: 'reloj', img: 'v1', t: 'Silueta reloj de arena: cómo marcar tu cintura', d: 'Prendas y cortes que acompañan una silueta reloj de arena, con pecho y cadera equilibrados y cintura marcada.',
      p: ['Si tu pecho y tu cadera miden casi lo mismo y tu cintura es claramente más estrecha, tienes una silueta reloj de arena. El objetivo no es esconderla: es acompañarla.',
        'Los vestidos envolventes y los tops cruzados son tus aliados porque dibujan la cintura sin apretar. Busca telas con caída, como el crepé elástico, que siguen tu forma sin marcar de más.',
        'En pantalones, el tiro alto alarga la pierna y define la cintura. Si usas casaca, elige las que se abren o se cruzan al frente y evita las cuadradas muy rígidas.'],
      tips: ['Vestidos envolventes y cruzados', 'Pantalón de tiro alto', 'Casacas con cinturón o cruce al frente', 'Telas con caída y algo de elasticidad']
    },
    {
      s: 'silueta-pera', sil: 'pera', img: 'p5', t: 'Silueta pera: equilibrio entre arriba y abajo', d: 'Cómo vestir una silueta pera, con cadera más ancha que el pecho: cortes, escotes y colores que equilibran.',
      p: ['La silueta pera tiene la cadera más ancha que el pecho y los hombros. La clave es dar presencia a la parte de arriba y dejar que la parte de abajo fluya.',
        'Los tops con detalle, color o escote cruzado atraen la mirada hacia el torso. Una blusa en tono mostaza o esmeralda, por ejemplo, funciona muy bien con un pantalón oscuro.',
        'En pantalones, prefiere cortes rectos o de sastre que caen sin marcar. Los blazers largos estructurados ordenan la línea y suman elegancia.'],
      tips: ['Tops con color, escote o detalle', 'Pantalón recto o de sastre', 'Blazers estructurados', 'Vestidos línea A que caen desde la cintura']
    },
    {
      s: 'silueta-manzana', sil: 'manzana', img: 'v2', t: 'Silueta manzana: comodidad con estructura', d: 'Guía para una silueta manzana, con cintura poco marcada: telas, largos y cortes que estilizan y dan comodidad.',
      p: ['En la silueta manzana la zona media es la más ancha y la cintura se marca poco. Lo mejor es crear una línea vertical y elegir prendas que no tiren ni aprieten.',
        'Los vestidos línea A y los cárdigan largos abiertos al frente alargan la figura y se sienten cómodos. Los escotes en V ayudan a estilizar el torso.',
        'En pantalones, el tiro alto con elástico suave da soporte sin apretar. Elige telas con algo de peso, que caigan, antes que telas muy finas que se peguen.'],
      tips: ['Vestidos línea A', 'Cárdigan o casaca larga abierta', 'Escote en V', 'Pantalón de tiro alto con elástico suave']
    }
  ];
  function blogPage() {
    var h = (location.hash || '').slice(1).split('/'), a = h[1] && POSTS.filter(function (x) { return x.s === h[1]; })[0];
    if (a) {
      return '<div class="w pg art-b"><p class="crumb"><a href="#inicio">Inicio</a> / <a href="#blog">Guías de estilo</a> / ' + esc(a.t) + '</p><h1>' + esc(a.t) + '</h1>' +
        banner(a.img, 380) + a.p.map(function (x) { return '<p style="font-size:16px">' + esc(x) + '</p>'; }).join('') +
        '<h3>Lo esencial</h3><ul>' + a.tips.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="row"><button class="btn" data-fxsil="' + a.sil + '">Ver prendas para tu silueta</button><a class="btn o" href="#asistente">Calcular mi talla</a><a class="btn o" href="#blog">Volver a las guías</a></div></div>';
    }
    return '<div class="w pg"><p class="crumb"><a href="#inicio">Inicio</a> / Guías de estilo</p><h1>Guías de estilo por silueta</h1><p style="color:var(--mut);max-width:620px">Tres guías cortas para elegir prendas según tu silueta. Si aún no la conoces, el asistente de tallas la calcula con tus medidas.</p><div class="grid" style="grid-template-columns:repeat(3,1fr)">' +
      POSTS.map(function (a) { return '<a class="bcard" href="#blog/' + a.s + '"><div class="bim">' + pic(a.img, '') + '</div><p class="lab" style="margin:12px 0 4px">Silueta ' + esc(window.BODY ? BODY[a.sil].toLowerCase() : a.sil) + '</p><h3>' + esc(a.t) + '</h3><p style="color:var(--mut);margin:0">' + esc(a.d) + '</p><p class="up" style="margin-top:10px">Leer guía →</p></a>'; }).join('') + '</div></div>';
  }
  document.addEventListener('click', function (e) {                              // botón "Ver prendas para tu silueta"
    var b = e.target.closest && e.target.closest('[data-fxsil]'); if (!b) return;
    window.S.body = b.dataset.fxsil; window.PG.so = 'sil'; if (window.track) track('blog_ver_prendas', b.dataset.fxsil); location.hash = '#tienda';
  });

  /* ---------- 17. ANALÍTICA LIGERA (apagada por defecto) ---------- */
  function analitica() {
    var A = CFG.ANALITICA || {}; if (!A.ACTIVA || navigator.doNotTrack === '1') return;         // respeta "No rastrear"
    if (A.PROVEEDOR === 'plausible' && A.PLAUSIBLE_DOMINIO) {
      var s = document.createElement('script'); s.defer = true; s.setAttribute('data-domain', A.PLAUSIBLE_DOMINIO);
      s.src = 'https://plausible.io/js/script.hash.js'; document.head.appendChild(s);          // versión que entiende rutas con #
    } else if (A.PROVEEDOR === 'ga' && A.GA_ID) {
      var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(A.GA_ID); document.head.appendChild(g);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', A.GA_ID, { anonymize_ip: true });
      window.addEventListener('hashchange', function () { gtag('config', A.GA_ID, { page_path: location.pathname + location.hash }); });
    }
  }

  /* ---------- 18. ARRANQUE ---------- */
  window.FX = { cambio: cambio, pagar: pagar, lightbox: lightbox, setLang: setLang, seo: seo };
  if (window.PG) PG.blog = blogPage;                                              // registra la página #blog
  window.addEventListener('hashchange', function () { seo(); schedule(); });
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  langBtn(); setLang(lang); cursor(); analitica();
  if (/^#blog/.test(location.hash) && window.route) route();                     // la ruta inicial #blog se dibuja ahora que existe
  seo(); schedule();
})();
