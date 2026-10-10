// ============================================================
//  CONFIGURACIÓN DE SMART FIT CUSCO  (v4)
// ============================================================
// 1) EXCEL / GOOGLE SHEETS: pega aquí la URL de tu Apps Script (termina en /exec).
//    Mientras esté vacía, los datos se guardan solo en el navegador de cada persona.
// 2) IMÁGENES: ruta de cada foto (carpeta assets/img/). Si dejas una vacía ('') o falla,
//    se usa la ilustración por defecto.
//    - Fotos extra de una prenda: v1_2, v1_3, ... (aparecen como miniaturas en la ficha
//      y la segunda se ve al pasar el mouse sobre la tarjeta).
//    - Foto por color: v1_Terracota, v1_Verde, ... (cambia al elegir ese color).
// 3) EFECTOS: cada efecto se apaga poniendo false. EFECTOS: false apaga todos.
window.CONFIG = {
  ENDPOINT: 'https://script.google.com/macros/s/AKfycbwOFHUXPGWVD35RWk2Uvs-HlQu6dj8Wuf2-tIMpJbCiJWJFLyQLRdgVhRU8dnq8prnG/exec',
  WHATSAPP: '51900000000',   // número con código de país, sin + ni espacios (ahora es de ejemplo)
  CATALOGO_URL: 'https://script.google.com/macros/s/AKfycbwOFHUXPGWVD35RWk2Uvs-HlQu6dj8Wuf2-tIMpJbCiJWJFLyQLRdgVhRU8dnq8prnG/exec?catalogo=1',          // la misma URL /exec de ENDPOINT + '?catalogo=1' (lee la pestaña Catalogo; ver README)
  SITIO_URL: '',             // ej: 'https://tuusuario.github.io/smart-fit-cusco' (mejora las vistas previas al compartir)
  IDIOMA: 'es',              // idioma inicial: 'es' o 'en' (la persona puede cambiarlo con el botón ES/EN)

  // ---------- Efectos visuales (true = encendido, false = apagado) ----------
  EFECTOS: {
    zoom: true,          // zoom suave en tarjetas de producto
    crossfade: false,    // 2.ª foto (v1_2) al pasar el mouse (apagado: se usa la misma foto)
    tilt: true,          // inclinación 3D sutil (solo con mouse)
    colorHover: true,    // puntos de color en la tarjeta cambian el tono / la foto
    tov: true,           // categorías del Inicio: texto "Ver colección →" animado
    kenburns: true,      // portada: zoom lento
    parallax: true,      // portada y banners: parallax con el scroll
    entrada: true,       // portada: entrada escalonada del titular y botones
    reveal: true,        // aparición al hacer scroll
    marquee: true,       // cinta de beneficios en el Inicio
    lupa: true,          // lupa en la ficha de producto
    lightbox: true,      // vista grande al hacer clic en la foto
    cursor: true,        // cursor personalizado (solo con mouse)
    probadorFoto: true   // probador virtual con tu propia foto
  },

  // ---------- Pasarela de pago (apagada por defecto) ----------
  // Para activarla lee el comentario "PASARELA DE PAGO" al inicio de assets/efectos.js
  PAGO: {
    ACTIVO: false,
    PROVEEDOR: 'mercadopago',   // 'mercadopago' o 'culqi'
    URL_PREFERENCIA: '',        // Mercado Pago: URL de tu función/servidor que crea la preferencia
    PUBLIC_KEY: ''              // Culqi: tu llave pública (pk_test_... / pk_live_...)
  },

  // ---------- Analítica ligera (apagada por defecto) ----------
  ANALITICA: {
    ACTIVA: false,
    PROVEEDOR: 'plausible',     // 'plausible' o 'ga'
    PLAUSIBLE_DOMINIO: '',      // ej: 'tuusuario.github.io'
    GA_ID: ''                   // ej: 'G-XXXXXXXXXX'
  },

  // ---------- Looks de temporada (sección del Inicio) ----------
  LOOKBOOK: [
    { k: 'lk1', t: 'Falda plisada terracota', alt: 'Mujer con blusa negra y falda plisada terracota' },
    { k: 'lk2', t: 'Looks en pareja', alt: 'Mujer y hombre con ropa de la colección de Smart Fit Cusco' },
    { k: 'lk3', t: 'Polo blanco y jean', alt: 'Hombre con polo blanco y jean azul' },
    { k: 'lk4', t: 'Camiseta y pantalón negro', alt: 'Hombre con camiseta blanca y pantalón negro' },
    { k: 'lk7', t: 'Enterizo fluido negro', alt: 'Mujer con enterizo negro de corte fluido' }
  ],

  IMAGENES: {
    // --- Inicio ---
    hero: 'assets/img/hero.webp',
    cat_vestido: 'assets/img/cat_vestido.webp',
    cat_top: 'assets/img/cat_top.webp',
    cat_casaca: 'assets/img/cat_casaca.webp',
    cat_pantalon: 'assets/img/cat_pantalon.webp',
    // --- Tienda ---
    tienda: 'assets/img/tienda.webp',
    // vestidos: Envolvente, Línea A, Midi fluido
    v1: 'assets/img/v1.webp',
    v2: 'assets/img/v2.webp',
    v3: 'assets/img/v3.webp',
    // tops: Blusa fluida, Polo básico, Camisa oversize, Top cruzado, Blusa manga larga, Suéter tejido
    b1: 'assets/img/b1.webp',
    b2: 'assets/img/b2.webp',
    b3: 'assets/img/b3.webp',
    b4: 'assets/img/b4.webp',
    b5: 'assets/img/b5.webp',
    b6: 'assets/img/b6.webp',
    // casacas: Larga, Estructurada, Blazer largo, Cárdigan largo, Bomber urbana
    c1: 'assets/img/c1.webp',
    c2: 'assets/img/c2.webp',
    c3: 'assets/img/c3.webp',
    c4: 'assets/img/c4.webp',
    c5: 'assets/img/c5.webp',
    // pantalones: Tiro alto, Recto, Fluido, Cargo, Sastre
    p1: 'assets/img/p1.webp',
    p2: 'assets/img/p2.webp',
    p3: 'assets/img/p3.webp',
    p4: 'assets/img/p4.webp',
    p5: 'assets/img/p5.webp',
    // --- Looks de temporada ---
    lk1: 'assets/img/lk1.webp', lk2: 'assets/img/lk2.webp', lk3: 'assets/img/lk3.webp',
    lk4: 'assets/img/lk4.webp', lk7: 'assets/img/lk7.webp',
    // --- Bocetos de referencia del asistente de tallas ---
    ref_mujer: 'assets/img/ref_mujer.webp', ref_hombre: 'assets/img/ref_hombre.webp',
    // --- Nosotros ---
    nosotros: 'assets/img/nosotros.webp'
  }
};
