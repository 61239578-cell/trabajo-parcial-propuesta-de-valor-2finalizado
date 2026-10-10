// ============================================================
//  SMART FIT CUSCO · Registro en Google Sheets (v6)
//  Pega TODO esto en: tu Google Sheet -> Extensiones -> Apps Script
//  1) Ejecuta una vez la función  configurar()  (pide permisos)
//  2) Implementar -> Administrar implementaciones -> editar (lápiz)
//     -> Versión: Nueva versión -> Implementar  (la URL /exec no cambia)
// ============================================================
// Cada pestaña: lista de campos (clave) en el orden de las columnas.
const PESTANAS = {
  Formulario:  ['fecha','sesion','estrellas','gusto','uso','util','conf','usar','pago','nps','comentario','silueta','altura','pecho','cintura','cadera'],
  Compras:     ['fecha','pedido_id','estado','canal','cliente','telefono','items','cantidad','total','sesion','notas'],
  Medidas:     ['fecha','sesion','altura','pecho','cintura','cadera','silueta','talla_calculada','segundos'],
  Probador:    ['fecha','sesion','paso','prenda','color','ajuste','talla','silueta'],
  Bolsa:       ['fecha','sesion','prenda','talla','color'],
  Favoritos:   ['fecha','sesion','prenda'],
  Opiniones:   ['fecha','sesion','momento','prenda','talla','estrellas','gusto','comentario'],
  Contactos:   ['fecha','cliente','correo','mensaje','estado'],
  Suscriptores:['fecha','correo'],
  Cambios:     ['fecha','sesion','prenda','talla','color','detalle','comentario','estado'],
  Lia:         ['fecha','sesion','accion','pregunta'],
  Visitas:     ['fecha','sesion','prenda'],
  Eventos:     ['fecha','sesion','evento','detalle','prenda','talla','segundos']
};
// Títulos legibles de columnas (si una clave no está aquí, se usa tal cual)
const ENC = {
  fecha:'Fecha y hora', sesion:'Visitante (código)', estrellas:'Estrellas (1-5)', gusto:'Qué le gustó',
  uso:'Probar el asistente me pareció…', util:'¿Le ayudaría a encontrar ropa que le quede bien?',
  conf:'Confianza en la talla recomendada', usar:'¿Lo usaría en una tienda de Cusco?', pago:'¿Pagaría por un servicio así?',
  nps:'Recomendación (0-10)', comentario:'Comentario', silueta:'Silueta', altura:'Altura (cm)', pecho:'Pecho (cm)',
  cintura:'Cintura (cm)', cadera:'Cadera (cm)', pedido_id:'N.º de pedido', estado:'Estado', canal:'Canal', cliente:'Cliente',
  telefono:'Celular', items:'Prendas', cantidad:'Cantidad', total:'Total (S/)', notas:'Notas',
  talla_calculada:'Talla calculada', segundos:'Segundos en el sitio', paso:'Paso', prenda:'Prenda', color:'Color',
  ajuste:'Ajuste', talla:'Talla', momento:'Momento', correo:'Correo', mensaje:'Mensaje', detalle:'Detalle',
  accion:'Acción', pregunta:'Pregunta', evento:'Evento'
};
const CAT_HEAD = ['id','categoria','nombre','estilo','precio','precio_anterior','etiqueta','siluetas','colores','tela','cuidados','agotadas'];
const CAT_DATOS = [["id", "categoria", "nombre", "estilo", "precio", "precio_anterior", "etiqueta", "siluetas", "colores", "tela", "cuidados", "agotadas"], ["v1", "vestido", "Vestido envolvente", "Elegante", "139", "", "Nuevo", "reloj;pera;manzana", "Terracota;Verde;Negro;Azul", "Crepé elástico", "Lavar en frío, no usar secadora", ""], ["v2", "vestido", "Vestido línea A", "Casual", "149", "189", "-20%", "manzana;inv;rect", "Azul;Mostaza;Negro;Verde", "Crepé elástico", "Lavar en frío, no usar secadora", "L;5XL"], ["v3", "vestido", "Vestido midi fluido", "Elegante", "169", "", "", "pera;reloj;rect", "Verde;Terracota;Negro;Crema", "Crepé elástico", "Lavar en frío, no usar secadora", ""], ["b1", "top", "Blusa fluida", "Moderno", "79", "", "Nuevo", "pera;rect;reloj", "Crema;Terracota;Verde;Azul", "Algodón con elastano", "Lavar a máquina en frío", ""], ["b2", "top", "Polo básico", "Casual", "59", "", "", "reloj;pera;manzana;rect;inv", "Negro;Crema;Azul;Mostaza", "Algodón con elastano", "Lavar a máquina en frío", "5XL"], ["b3", "top", "Camisa oversize", "Clásico", "99", "129", "-20%", "manzana;inv;rect", "Crema;Azul;Negro;Verde", "Algodón con elastano", "Lavar a máquina en frío", ""], ["b4", "top", "Top cruzado", "Moderno", "89", "", "Nuevo", "reloj;pera;manzana", "Verde;Negro;Terracota;Crema", "Algodón con elastano", "Lavar a máquina en frío", ""], ["b5", "top", "Blusa manga larga", "Casual", "85", "", "", "pera;rect;inv", "Mostaza;Crema;Negro;Verde", "Algodón con elastano", "Lavar a máquina en frío", ""], ["b6", "top", "Suéter tejido", "Clásico", "129", "159", "-20%", "reloj;rect;manzana", "Terracota;Verde;Crema;Negro", "Tejido suave", "Lavar a mano", ""], ["c1", "casaca", "Casaca larga", "Urbano", "219", "", "Nuevo", "manzana;reloj;rect", "Negro;Azul;Terracota;Verde", "Mezcla de poliéster", "Lavado en seco o a mano", ""], ["c2", "casaca", "Casaca estructurada", "Clásico", "199", "", "", "pera;rect", "Negro;Crema;Mostaza;Azul", "Mezcla de poliéster", "Lavado en seco o a mano", ""], ["c3", "casaca", "Blazer largo", "Elegante", "239", "299", "-20%", "pera;reloj;manzana", "Negro;Azul;Crema;Terracota", "Mezcla de poliéster", "Lavado en seco o a mano", "2XL"], ["c4", "casaca", "Cárdigan largo", "Casual", "179", "", "Nuevo", "manzana;pera;rect", "Crema;Negro;Azul;Terracota", "Tejido suave", "Lavar a mano", ""], ["c5", "casaca", "Bomber urbana", "Urbano", "189", "", "", "inv;rect;reloj", "Verde;Negro;Azul;Mostaza", "Mezcla de poliéster", "Lavado en seco o a mano", ""], ["p1", "pantalon", "Pantalón tiro alto", "Moderno", "159", "", "", "reloj;manzana;rect", "Negro;Azul;Mostaza;Verde", "Algodón stretch", "Lavar a máquina, planchar a temperatura media", "3XL"], ["p2", "pantalon", "Pantalón recto", "Clásico", "129", "", "", "inv;pera;reloj;rect", "Negro;Crema;Azul;Terracota", "Algodón stretch", "Lavar a máquina, planchar a temperatura media", ""], ["p3", "pantalon", "Pantalón fluido", "Casual", "139", "", "Nuevo", "pera;manzana;rect", "Crema;Verde;Negro;Mostaza", "Algodón stretch", "Lavar a máquina, planchar a temperatura media", ""], ["p4", "pantalon", "Pantalón cargo", "Urbano", "149", "", "", "pera;manzana;rect", "Crema;Verde;Negro;Azul", "Algodón stretch", "Lavar a máquina, planchar a temperatura media", ""], ["p5", "pantalon", "Pantalón sastre", "Elegante", "169", "", "Nuevo", "reloj;pera;rect", "Negro;Azul;Crema;Mostaza", "Algodón stretch", "Lavar a máquina, planchar a temperatura media", ""]];
const ESTADOS_PEDIDO = ['Nuevo','Confirmado','Pagado','Listo para recoger','Entregado','Cancelado'];
const RENOMBRAR = { Pedidos:'Compras', Encuesta:'Formulario', Tallaje:'Tallaje (antiguo)' }; // migración de la v5

function hoja_(nombre){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(nombre) || ss.insertSheet(nombre);
}

// ---------- Se ejecuta UNA vez a mano (y otra vez si actualizas el script) ----------
function configurar(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(RENOMBRAR).forEach(function(v){
    const s = ss.getSheetByName(v);
    if (s && !ss.getSheetByName(RENOMBRAR[v])) s.setName(RENOMBRAR[v]);
  });
  Object.keys(PESTANAS).forEach(function(n){
    const sh = hoja_(n), h = PESTANAS[n];
    sh.getRange(1,1,1,h.length).setValues([h.map(function(k){ return ENC[k]||k; })])
      .setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff').setWrap(true).setVerticalAlignment('middle');
    sh.setFrozenRows(1);
    sh.getRange(2,1,sh.getMaxRows()-1,1).setNumberFormat('yyyy-mm-dd hh:mm');
    sh.setColumnWidths(1,h.length,130);
  });
  hoja_('Compras').setColumnWidth(7,380);
  hoja_('Formulario').setColumnWidths(5,5,200);

  // Compras: estado desplegable con colores + total en soles
  const p = hoja_('Compras');
  p.getRange(2,3,1000,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS_PEDIDO,true).setAllowInvalid(true).build());
  p.getRange(2,9,1000,1).setNumberFormat('"S/ "#,##0.00');
  p.setConditionalFormatRules([['Nuevo','#fff2cc'],['Confirmado','#cfe2f3'],['Pagado','#d9ead3'],['Listo para recoger','#d9d2e9'],['Entregado','#b6d7a8'],['Cancelado','#f4cccc']]
    .map(function(r){ return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(r[0]).setBackground(r[1]).setRanges([p.getRange('C2:C1000')]).build(); }));
  hoja_('Contactos').getRange(2,5,1000,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pendiente','Respondido'],true).build());
  hoja_('Cambios').getRange(2,8,1000,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pendiente','Atendido'],true).build());

  // Catálogo editable (se carga solo si está vacío)
  const c = hoja_('Catalogo');
  if (c.getLastRow() === 0) { c.getRange(1,1,CAT_DATOS.length,CAT_HEAD.length).setNumberFormat('@').setValues(CAT_DATOS); }
  c.getRange(1,1,1,CAT_HEAD.length).setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff');
  c.setFrozenRows(1);
  c.getRange(1,1,c.getMaxRows(),CAT_HEAD.length).setNumberFormat('@');

  resumen_();
  const ini = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja1');
  if (ini && ss.getSheets().length > 1 && ini.getLastRow() === 0) ss.deleteSheet(ini);
  ss.setActiveSheet(ss.getSheetByName('Resumen')); ss.moveActiveSheet(1);
  SpreadsheetApp.getUi().alert('Listo. Pestañas creadas. Si ya tenías la aplicación web, actualízala con "Nueva versión".');
}

function resumen_(){
  const sh = hoja_('Resumen'); sh.clear();
  const f = [
    ['RESUMEN SMART FIT CUSCO',''],
    ['Compras / pedidos totales','=MAX(0,COUNTA(Compras!B:B)-1)'],
    ['Pedidos nuevos (sin atender)','=COUNTIF(Compras!C:C,"Nuevo")'],
    ['Ventas confirmadas (S/)','=SUM(Compras!I2:I)-SUMIF(Compras!C2:C,"Nuevo",Compras!I2:I)-SUMIF(Compras!C2:C,"Cancelado",Compras!I2:I)'],
    ['Pedidos por WhatsApp','=COUNTIF(Compras!D:D,"WhatsApp")'],
    ['Reservas en tienda','=COUNTIF(Compras!D:D,"Reserva en tienda")'],
    ['Personas que dieron sus medidas','=MAX(0,COUNTA(Medidas!A:A)-1)'],
    ['Prendas añadidas a la bolsa','=MAX(0,COUNTA(Bolsa!A:A)-1)'],
    ['Favoritos marcados','=MAX(0,COUNTA(Favoritos!A:A)-1)'],
    ['Respuestas del formulario','=MAX(0,COUNTA(Formulario!A:A)-1)'],
    ['Estrellas promedio (formulario)','=IFERROR(AVERAGE(Formulario!C2:C),"–")'],
    ['Recomendación promedio 0–10','=IFERROR(AVERAGE(Formulario!J2:J),"–")'],
    ['Opiniones tras tallaje/compra','=MAX(0,COUNTA(Opiniones!A:A)-1)'],
    ['Estrellas promedio (opiniones)','=IFERROR(AVERAGE(Opiniones!F2:F),"–")'],
    ['Mensajes de contacto pendientes','=COUNTIF(Contactos!E:E,"Pendiente")'],
    ['Suscriptores','=MAX(0,COUNTA(Suscriptores!B:B)-1)'],
    ['Solicitudes de cambio de talla','=MAX(0,COUNTA(Cambios!A:A)-1)']
  ];
  f.forEach(function(r,i){ sh.getRange(i+1,1).setValue(r[0]); if (r[1]) sh.getRange(i+1,2).setFormula(r[1]); });
  sh.getRange('A1').setFontWeight('bold').setFontSize(14);
  sh.getRange('A2:A17').setFontWeight('bold');
  sh.setColumnWidth(1,300); sh.setColumnWidth(2,120); sh.setColumnWidth(3,30);
  // Rankings automáticos (columnas D-E, G-H, J-K)
  const rk = [
    ['D1','Tallas más calculadas','Medidas!H2:H','H'],
    ['G1','Prendas más probadas','Probador!D2:D','D'],
    ['J1','Prendas más favoritas','Favoritos!C2:C','C']
  ];
  rk.forEach(function(r){
    sh.getRange(r[0]).setValue(r[1]).setFontWeight('bold');
    const cell = sh.getRange(r[0]).offset(1,0);
    cell.setFormula('=IFERROR(QUERY('+r[2]+',"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc limit 10 label count(Col1) \'Veces\', Col1 \'\'",0),"Aún sin datos")');
  });
  sh.setColumnWidth(4,170); sh.setColumnWidth(7,220); sh.setColumnWidth(10,220);
}

function pedazo_(txt, sep){ return String(txt||'').split(sep||' · '); }

// ---------- Recibe los datos del sitio ----------
function doPost(e){
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    const f = d.fecha ? new Date(d.fecha) : new Date();
    const det = String(d.detalle||'');
    const ev = det.split(':')[0];
    const resto = det.indexOf(':')>-1 ? det.slice(det.indexOf(':')+1).trim() : '';
    let destino, fila;
    switch (d.tipo) {
      case 'pedido':
        destino='Compras'; fila={fecha:f,pedido_id:d.pedido_id,estado:d.estado||'Nuevo',canal:d.canal,cliente:d.cliente,telefono:d.telefono,items:d.items,cantidad:d.cantidad,total:d.total,sesion:d.sesion,notas:''}; break;
      case 'encuesta':
        destino='Formulario'; fila=Object.assign({},d,{fecha:f}); break;
      case 'feedback_talla': case 'feedback_compra':
        destino='Opiniones'; fila={fecha:f,sesion:d.sesion,momento:d.tipo==='feedback_talla'?'Tras el tallaje':'Tras la compra',prenda:d.prenda,talla:d.talla,estrellas:d.estrellas,gusto:d.gusto,comentario:d.comentario}; break;
      case 'contacto':
        destino='Contactos'; fila={fecha:f,cliente:d.cliente||pedazo_(det)[0],correo:d.correo||pedazo_(det)[1]||'',mensaje:d.comentario,estado:'Pendiente'}; break;
      case 'suscripcion':
        destino='Suscriptores'; fila={fecha:f,correo:d.correo||det}; break;
      case 'cambio_talla':
        destino='Cambios'; fila={fecha:f,sesion:d.sesion,prenda:d.prenda,talla:d.talla,color:d.color,detalle:det,comentario:d.comentario,estado:'Pendiente'}; break;
      default: // 'evento': se reparte según su nombre
        switch (ev) {
          case 'medidas_analizadas':
            destino='Medidas'; fila={fecha:f,sesion:d.sesion,altura:d.altura,pecho:d.pecho,cintura:d.cintura,cadera:d.cadera,silueta:d.silueta||pedazo_(resto)[1],talla_calculada:resto.replace(/^talla\s+/,'').split(' · ')[0],segundos:d.segundos}; break;
          case 'prenda_probada':
            destino='Probador'; fila={fecha:f,sesion:d.sesion,paso:'probada',prenda:pedazo_(resto)[0],color:pedazo_(resto)[1]||d.color,ajuste:pedazo_(resto)[2]||'',talla:d.talla,silueta:d.silueta}; break;
          case 'talla_lista':
            destino='Probador'; fila={fecha:f,sesion:d.sesion,paso:'talla lista',prenda:resto||d.prenda,color:d.color,ajuste:'',talla:d.talla,silueta:d.silueta}; break;
          case 'anadir_bolsa':
            destino='Bolsa'; fila={fecha:f,sesion:d.sesion,prenda:resto||d.prenda,talla:d.talla,color:d.color}; break;
          case 'favorito':
            destino='Favoritos'; fila={fecha:f,sesion:d.sesion,prenda:resto}; break;
          case 'ficha_vista':
            destino='Visitas'; fila={fecha:f,sesion:d.sesion,prenda:resto}; break;
          case 'lia_faq': case 'lia_menu':
            destino='Lia'; fila={fecha:f,sesion:d.sesion,accion:ev==='lia_faq'?'Pregunta frecuente':'Abrió el menú',pregunta:resto}; break;
          default:
            destino='Eventos'; fila={fecha:f,sesion:d.sesion,evento:ev,detalle:resto,prenda:d.prenda,talla:d.talla,segundos:d.segundos};
        }
    }
    const sh = hoja_(destino), head = PESTANAS[destino];
    if (sh.getLastRow() === 0) sh.appendRow(head.map(function(k){ return ENC[k]||k; }));
    sh.appendRow(head.map(function(k){ return fila[k]===undefined?'':fila[k]; }));
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: '+err);
  } finally { try { lock.releaseLock(); } catch(x){} }
}

// ---------- GET: estado, o catálogo en CSV para la tienda ----------
function doGet(e){
  if (e && e.parameter && e.parameter.catalogo) {
    const v = hoja_('Catalogo').getDataRange().getValues();
    const csv = v.map(function(r){ return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
    return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
  }
  return ContentService.createTextOutput('Smart Fit Cusco: activo');
}
