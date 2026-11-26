/* ==========================================================
   WFRP — DIE SEITEN WIRKLICH AUSFUEHREN
   (wfrp_erschaffung.html, wfrp_heldenbrief.html, Weiche in js/sitzung.js)

   Die Rechnung prueft tests/t_wfrp.js. Hier geht es um das, was
   eine Rechnung nicht sehen kann: dass die Seiten laufen, dass die
   Knoepfe die richtigen Funktionen treffen und dass am Ende das
   Richtige in der Datenbank steht.

   Ausgefuehrt wird der Skriptblock der Seite selbst (geschnitten,
   nicht nachgebaut) - mit gefaelschtem DOM und gefaelschter
   Datenbank. Eine Pruefung auf eine nachgebaute Kopie wuerde genau
   die Fehler nicht sehen, um die es geht.

   Der Ablauf:
     1. Erschaffung: Spezies, Karriere, Attribute, Herkunft,
        Ausbildung, Geld, Name - jeder Schritt wird gezeichnet,
        dann abgeschlossen. In der Datenbank muss eine FERTIGE
        Figur liegen, und die Seite muss zum Heldenbrief weiter.
     2. Heldenbrief: liest diese Figur, wuerfelt, setzt Glueck ein,
        steigert, wechselt die Stufe.
     3. Die Weiche: Eine Savage-Worlds-Sitzung schickt die WFRP-
        Seite weg, BEVOR sie etwas schreibt.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const WURZEL = path.join(__dirname, '..');

let f = 0, anzahl = 0;
const chk = (n, c, x) => {
  anzahl++;
  console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x)));
  if (!c) f++;
};
const warte = (ms) => new Promise(r => setTimeout(r, ms || 0));

/* ---------------- Gefaelschte Datenbank ---------------- */
function fakeDb(start) {
  const daten = JSON.parse(JSON.stringify(start || {}));
  const log = [];
  function hol(p) {
    return p.split('/').filter(Boolean).reduce((o, k) => (o == null ? undefined : o[k]), daten);
  }
  function setz(p, v) {
    const t = p.split('/').filter(Boolean);
    let o = daten;
    for (let i = 0; i < t.length - 1; i++) { if (o[t[i]] == null || typeof o[t[i]] !== 'object') o[t[i]] = {}; o = o[t[i]]; }
    if (v === null) delete o[t[t.length - 1]]; else o[t[t.length - 1]] = JSON.parse(JSON.stringify(v));
  }
  const db = {
    daten, log,
    ref(p) {
      p = String(p || '');
      return {
        once() { return Promise.resolve({ val: () => { const v = hol(p); return v === undefined ? null : JSON.parse(JSON.stringify(v)); } }); },
        on(ev, cb) { if (p === '.info/connected') cb({ val: () => true }); else cb({ val: () => hol(p) === undefined ? null : hol(p), forEach() {} }); },
        off() {},
        update(o) { log.push(['update', p, o]); Object.keys(o).forEach(k => setz(p + '/' + k, o[k])); return Promise.resolve(); },
        set(v) { log.push(['set', p, v]); setz(p, v); return Promise.resolve(); },
        push(v) { log.push(['push', p, v]); return Promise.resolve(); },
        remove() { log.push(['remove', p]); setz(p, null); return Promise.resolve(); }
      };
    }
  };
  return db;
}

/* ---------------- Gefaelschtes DOM ---------------- */
function knoten() {
  return {
    innerHTML: '', textContent: '', value: '', style: {}, title: '',
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, toggle(c, an) { if (an) this._s.add(c); else this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    insertAdjacentHTML() {}, appendChild() {}
  };
}
function seite(datei, db, speicher, antworten) {
  const html = fs.readFileSync(path.join(WURZEL, datei), 'utf8');
  const bloecke = html.match(/<script>([\s\S]*?)<\/script>/g).map(s => s.replace(/^<script>|<\/script>$/g, ''));
  const knotenNach = {};
  const ersetzt = [];
  const ctx = {
    console, JSON, Math, Date, Promise, Object, Array, String, Number, isNaN, parseInt, Set,
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms || 0, 5)), clearTimeout,
    localStorage: {
      getItem: k => (k in speicher ? speicher[k] : null),
      setItem: (k, v) => { speicher[k] = String(v); }, removeItem: k => { delete speicher[k]; }
    },
    location: { search: '', hash: '', replace: (u) => ersetzt.push(u), reload() {} },
    confirm: () => true, alert: () => {}, prompt: (t, v) => (antworten && antworten.prompt) || v || '',
    scrollTo() {},
    firebase: {
      initializeApp() {}, database: Object.assign(() => db, { ServerValue: { TIMESTAMP: 0 } })
    },
    firebaseConfig: {}
  };
  ctx.document = {
    getElementById: (id) => knotenNach[id] || (knotenNach[id] = knoten()),
    querySelectorAll: () => [], createElement: () => knoten(),
    body: knoten(), head: knoten(), documentElement: knoten(), activeElement: null
  };
  ctx.window = ctx; ctx.window.top = ctx; ctx.window.self = ctx;
  vm.createContext(ctx);
  ['js/sitzung.js', 'js/identitaet.js', 'js/wfrp_daten.js', 'js/wfrp_regelwerk.js', 'js/wfrp_erschaffung.js',
   'js/charakterbild.js'].forEach(p => {
    if (html.indexOf(p) > 0) vm.runInContext(fs.readFileSync(path.join(WURZEL, p), 'utf8'), ctx, { filename: p });
  });
  bloecke.forEach((b, i) => vm.runInContext(b, ctx, { filename: datei + '#' + i }));
  return { ctx, el: (id) => ctx.document.getElementById(id), ersetzt };
}
function lauf(s, code) { return vm.runInContext(code, s.ctx); }

(async function () {
  /* ======================= 1. ERSCHAFFUNG ======================= */
  const START = { sitzungen: { wf: { meta: { name: 'Altdorf', regelwerk: 'wfrp4', angelegt: 1 }, stand: {} } } };
  const db = fakeDb(START);
  const speicher = { korsaren_playername: 'Anna', pnp_sitzung_fest: 'wf' };
  let E;
  try { E = seite('wfrp_erschaffung.html', db, speicher); chk('die Erschaffung lädt ohne Fehler', true); }
  catch (e) { chk('die Erschaffung lädt ohne Fehler', false, e.message); return fertig(); }
  await warte(30);
  chk('… und leitet in einer WFRP-Sitzung nicht weiter', E.ersetzt.length === 0, E.ersetzt);
  chk('vor der ersten Wahl wird nichts geschrieben', db.log.filter(l => l[0] === 'update').length === 0, db.log);

  // Jeden Schritt zeichnen, bevor etwas gewaehlt ist - nichts darf werfen.
  let wirft = null;
  for (let i = 0; i < 8; i++) { try { lauf(E, 'geheZu(' + i + ')'); } catch (e) { wirft = i + ': ' + e.message; break; } }
  chk('alle acht Schritte zeichnen sich leer', !wirft, wirft);

  lauf(E, 'geheZu(0); speziesWaehlen("mensch"); karriereWaehlen("advokat"); attrWuerfeln();');
  chk('Attribute gewürfelt: +50 EP', lauf(E, 'wfrpErsEp(W).attribute') === 50);
  lauf(E, 'tausch("kg"); tausch("bf");');
  chk('nach einem Tausch: +25 EP', lauf(E, 'wfrpErsEp(W).attribute') === 25);
  lauf(E, 'karrAttr("i",1);karrAttr("i",1);karrAttr("gs",1);karrAttr("in",1);karrAttr("in",1);karrAttr("in",1);');
  chk('mehr als 5 Karriere-Steigerungen gehen nicht', lauf(E, 'wfrpErsSumme(W.attrKarr)') === 5);
  lauf(E, 'extraSetzen(1); detail("motivation","Gerechtigkeit");');
  lauf(E, 'const sp=WFRP_SPEZIES.mensch.fert.filter(r=>!wfrpErsBrauchtWahl(r));' +
          'sp.slice(0,3).forEach(r=>spFert(r,5)); sp.slice(3,6).forEach(r=>spFert(r,3)); spFert(sp[6],5);');
  chk('nur drei Fertigkeiten mit +5', lauf(E, 'W.spFert5.length') === 3);
  lauf(E, 'spTal(1,"gewitzt"); zufallsTalent(); zufallsTalent(); zufallsTalent(); zufallsTalent();');
  chk('genau drei Zufallstalente für einen Menschen', lauf(E, 'W.zufall.length') === 3);
  chk('… und keines doppelt', lauf(E, 'new Set(W.zufall.map(r=>wfrpRefTeile(r).id)).size') === 3);
  // Zufallstalente mit Wahl ("Scharfer Sinn (beliebig)") brauchen eine Spezialisierung.
  lauf(E, 'W.zufall.forEach(r=>{ if (wfrpErsBrauchtWahl(r)) talSpez(r,"Sehen"); });');
  /* Erst das Talent, das ein Zufallstalent schon sein KANN: Liegt
     "Lesen und Schreiben" schon unter den Zufallstalenten, muss die Seite
     den doppelten Griff melden. Danach eines, das es im Zufall nicht gibt. */
  lauf(E, 'W.zufall[0] = "lesen_schreiben"; karrTal("lesen_schreiben")');
  chk('ein Talent doppelt (Zufall + Karriere) wird gemeldet',
    lauf(E, 'wfrpErsOffen(W).karriere2.some(t => /hast du schon/.test(t))'), lauf(E, 'JSON.stringify(wfrpErsOffen(W).karriere2)'));
  chk('… und die Wahl steht gedämpft da', E.el('inhalt').innerHTML.indexOf('hast du schon') > 0 || (lauf(E, 'geheZu(4)'), E.el('inhalt').innerHTML.indexOf('hast du schon') > 0));
  lauf(E, 'W.zufall = []; zufallsTalent(); zufallsTalent(); zufallsTalent();');
  lauf(E, 'W.zufall.forEach(r=>{ if (wfrpErsBrauchtWahl(r)) talSpez(r,"Sehen"); });');
  lauf(E, 'WFRP_KARR_BY_ID.advokat.stufen[0].fert.forEach(r=>karrFertSetzen(r,5)); karrTal("schwadronieren");');
  chk('40 Steigerungen auf die Karrierefertigkeiten', lauf(E, 'wfrpErsSumme(W.karrFert)') === 40);
  lauf(E, 'karrFert(WFRP_KARR_BY_ID.advokat.stufen[0].fert[0], 1)');
  chk('eine 41. Steigerung geht nicht', lauf(E, 'wfrpErsSumme(W.karrFert)') === 40);
  lauf(E, 'geldWuerfeln(); detail("name","Molli Krumbiegel"); alterWuerfeln(); groesseWuerfeln(); augenWuerfeln(); haareWuerfeln();');
  chk('Größe in Zentimetern', /^\d+ cm$/.test(lauf(E, 'W.groesse')), lauf(E, 'W.groesse'));
  chk('Augenfarbe aus der Tabelle', !!lauf(E, 'W.augen'));

  wirft = null;
  for (let i = 0; i < 8; i++) { try { lauf(E, 'geheZu(' + i + ')'); } catch (e) { wirft = i + ': ' + e.message; break; } }
  chk('alle acht Schritte zeichnen sich mit einer vollen Figur', !wirft, wirft);
  chk('nichts mehr offen', lauf(E, 'wfrpErsFertig(W)'), lauf(E, 'JSON.stringify(wfrpErsOffen(W))'));
  chk('der Abschlussknopf ist frei', E.el('inhalt').innerHTML.indexOf('onclick="abschliessen()">') > 0);

  await warte(30);
  const zwischen = db.daten.sitzungen.wf.stand.figuren && db.daten.sitzungen.wf.stand.figuren.anna;
  chk('während der Erschaffung liegt die Figur unter dem Namen in der Sitzung', !!zwischen && zwischen.regelwerk === 'wfrp4');
  chk('… noch nicht fertig', zwischen && zwischen.fertig === false);
  chk('… mit dem Zustand des Assistenten als Text (Schrägstriche!)', zwischen && typeof zwischen.erschaffungJson === 'string');
  chk('kein Schlüssel der Figur enthält einen Schrägstrich',
    zwischen && Object.keys(zwischen.fert).concat(Object.keys(zwischen.tal)).every(k => k.indexOf('/') < 0),
    zwischen && Object.keys(zwischen.fert));

  lauf(E, 'abschliessen()');
  await warte(30);
  const fig = db.daten.sitzungen.wf.stand.figuren.anna;
  chk('abgeschlossen: die Figur ist fertig', fig.fertig === true && fig.name === 'Molli Krumbiegel');
  chk('… und die Seite geht zum Heldenbrief', E.ersetzt[0] === 'wfrp_heldenbrief.html', E.ersetzt);
  chk('Karriere Advokat, Stufe 1, Klasse Gelehrte', fig.karriere === 'advokat' && fig.stufe === 1 && fig.klasse === 'gelehrte');
  chk('Bonus-EP: 25 (Attribute getauscht)', fig.epGesamt === 25, fig.epGesamt);
  chk('Schicksal 3, Zähigkeit 3 (Mensch 2+1 / 1+2)', fig.schicksal === 3 && fig.zaehigkeit === 3, [fig.schicksal, fig.zaehigkeit]);
  chk('Ausrüstung: Klasse + Stufe 1', fig.ausr.indexOf('Dolch') >= 0 && fig.ausr.indexOf('Lupe') >= 0);
  chk('Talente: Todesweissagung, Gewitzt, Schwadronieren, drei Zufallstalente',
    fig.tal.todesweissagung === 1 && fig.tal.gewitzt === 1 && fig.tal.schwadronieren === 1 && Object.keys(fig.tal).length === 6,
    Object.keys(fig.tal));

  // Ein zweites Oeffnen der Erschaffung fasst die fertige Figur nicht an.
  const vorher = db.log.length;
  const E2 = seite('wfrp_erschaffung.html', db, speicher);
  await warte(30);
  chk('die Erschaffung sperrt eine fertige Figur', E2.el('inhalt').innerHTML.indexOf('Deine Figur ist fertig') > 0);
  chk('… und schreibt nichts', db.log.slice(vorher).filter(l => l[0] === 'update').length === 0);

  /* ======================= 2. HELDENBRIEF ======================= */
  let H;
  try { H = seite('wfrp_heldenbrief.html', db, speicher); chk('der Heldenbrief lädt ohne Fehler', true); }
  catch (e) { chk('der Heldenbrief lädt ohne Fehler', false, e.message); return fertig(); }
  await warte(30);
  chk('… und liest die Figur', lauf(H, 'F.name') === 'Molli Krumbiegel');
  chk('der WFRP-Bogen hat den Bild-Upload', H.el('bildStand').textContent.indexOf('Noch keins') === 0,
    H.el('bildStand').textContent);
  lauf(H, 'meinBild = "data:image/webp;base64,xyz"; bildHoch()');
  await warte(10);
  const bildPost = db.log.filter(l => l[0] === 'update' && /pcLeiste\/anna$/.test(l[1])).pop();
  chk('… schreibt neben die Figur, mit dem Namen der Figur',
    !!bildPost && bildPost[2].name === 'Molli Krumbiegel' && bildPost[2].bild === 'data:image/webp;base64,xyz', bildPost);
  chk('der Kopf nennt Karrierestufe und Status', H.el('kopf').innerHTML.indexOf('Rechtsstudent') > 0 && H.el('kopf').innerHTML.indexOf('Messing 4') > 0);
  chk('Attributwerte sind anklickbar', (H.el('attr').innerHTML.match(/probeAttr/g) || []).length === 10);

  lauf(H, 'mod = -20; probeAttr("in")');
  const w = lauf(H, 'letzter');
  chk('eine Probe trägt die Schwierigkeit', w.r.mod === -20 && w.r.ziel === w.r.basis - 20, w.r);
  chk('Intelligenz mit Gewitzt: +5 im Wert', w.r.basis === lauf(H, 'F.attrAnfang.in + F.attrSteig.in + 5'));
  const push = db.log.filter(l => l[0] === 'push' && /diceRolls$/.test(l[1])).pop();
  chk('der Wurf geht in den Feed', !!push && push[2].probe === 'Intelligenz' && push[2].weg.art === 'w100');
  chk('… mit "gut" als eigenem Feld', push && typeof push[2].gut === 'boolean');
  const gl = lauf(H, 'F.glueck');
  lauf(H, 'mitGlueck("eg")');
  chk('Glück +1 EG kostet einen Punkt', lauf(H, 'F.glueck') === gl - 1);
  chk('… und hebt die EG um 1', lauf(H, 'zaehlt().eg') === w.r.eg + 1);
  lauf(H, 'mitGlueck("eg")');
  chk('… aber nur einmal je Probe', lauf(H, 'F.glueck') === gl - 1);

  // Steigern mit den Bonus-EP
  lauf(H, 'steigern("attr","i")');
  chk('ein Karriereattribut steigern: 25 EP', lauf(H, 'F.epAusgegeben') === 25 && lauf(H, 'F.attrSteig.i') === 3);
  lauf(H, 'steigern("attr","i")');
  chk('… ohne EP geht es nicht', lauf(H, 'F.attrSteig.i') === 3 && /zu wenig EP/.test(H.el('stMeld').textContent));
  lauf(H, 'el("epNeu").value = "1000"; epDazu(1)');
  chk('EP gutschreiben', lauf(H, 'F.epGesamt') === 1025);
  lauf(H, 'steigern("tal","streitbar")');
  chk('ein Talent einer anderen Stufe bleibt gesperrt', !lauf(H, 'F.tal.streitbar'));
  lauf(H, 'wechseln("advokat", 2)');
  chk('aufsteigen: Stufe 2 für 200 EP (nicht abgeschlossen)', lauf(H, 'F.stufe') === 2 && lauf(H, 'F.epAusgegeben') === 225, lauf(H, 'F.epAusgegeben'));
  lauf(H, 'steigern("tal","streitbar")');
  chk('… jetzt ist das Talent der Stufe 2 frei', lauf(H, 'F.tal.streitbar') === 1);
  wirft = null;
  try { lauf(H, 'zeichne()'); } catch (e) { wirft = e.message; }
  chk('der ganze Bogen zeichnet sich nach allem neu', !wirft, wirft);
  await warte(30);
  const nachher = db.daten.sitzungen.wf.stand.figuren.anna;
  chk('der Bogen schreibt seine Fassung hoch', nachher.stufe === 2 && nachher.tal.streitbar === 1);
  chk('… und lässt den Zustand des Assistenten stehen', typeof nachher.erschaffungJson === 'string');

  // Eine Spezialisierung mit Apostroph zerbricht nichts.
  /* Wissen (beliebig) liegt auf Stufe 2 AUSSERHALB der Karriere - also
     ausdruecklich zum doppelten Preis. */
  lauf(H, 'steigern("fert", wfrpKey("wissen", spezSauber("Grimm\\u0027s Recht")), true)');
  chk('ein Apostroph in einer Spezialisierung wird entfernt', lauf(H, 'F.fert["wissen:Grimms Recht"]') === 1,
    lauf(H, 'JSON.stringify(F.fert)'));
  wirft = null;
  try { lauf(H, 'zeichne()'); } catch (e) { wirft = e.message; }
  chk('… und der Bogen zeichnet sich damit', !wirft && H.el('fert').innerHTML.indexOf('Grimms Recht') > 0, wirft);

  /* ======================= 3. DIE WEICHE ======================= */
  const dbSw = fakeDb({ sitzungen: { sw: { meta: { name: 'Korsaren', angelegt: 1 }, stand: { figuren: { anna: { name: 'Kai', attr: { kampf: 3 } } } } } } });
  const sp2 = { korsaren_playername: 'Anna', pnp_sitzung_fest: 'sw' };
  const X = seite('wfrp_erschaffung.html', dbSw, sp2);
  await warte(30);
  chk('in einer Savage-Worlds-Sitzung leitet die WFRP-Erschaffung weiter', X.ersetzt[0] === 'charaktererstellung.html', X.ersetzt);
  lauf(X, 'speziesWaehlen("zwerg")');
  await warte(30);
  chk('… und schreibt danach nichts in die fremde Figur', dbSw.log.filter(l => l[0] === 'update').length === 0, dbSw.log);
  const Y = seite('wfrp_heldenbrief.html', dbSw, sp2);
  await warte(30);
  chk('der WFRP-Heldenbrief leitet ebenso weiter', Y.ersetzt[0] === 'heldenbrief.html', Y.ersetzt);

  // Die Savage-Worlds-Seiten in einer WFRP-Sitzung
  const src = fs.readFileSync(path.join(WURZEL, 'charaktererstellung.html'), 'utf8');
  const i1 = src.indexOf("regelwerkWeiter('savage', rw, 'erschaffung')"), i2 = src.indexOf('startUebernahme();', i1);
  chk('die SW-Erschaffung prüft das Regelwerk vor dem ersten Schreiben', i1 > 0 && i2 > i1);
  const hb = fs.readFileSync(path.join(WURZEL, 'heldenbrief.html'), 'utf8');
  const j1 = hb.indexOf("regelwerkWeiter('savage', rw, 'bogen')"), j2 = hb.indexOf('figurUmzug(db', j1);
  chk('der SW-Heldenbrief ebenso', j1 > 0 && j2 > j1);

  /* ======================= 4. DIE WUERFELLEISTE ======================= */
  /* js/dice.js laeuft auf der Karte. Traegt die Figur "wfrp", wuerfelt sie
     W100 gegen den Wert - mit derselben wfrpProbe wie der Heldenbrief. */
  {
    const dbL = fakeDb({});
    const lauscher = {};
    const leiste = Object.assign(knoten(), { addEventListener: (ev, fn) => { lauscher[ev] = fn; } });
    const lctx = {
      console, JSON, Math, Date, Promise, Object, Array, String, Number, parseInt, setTimeout: () => 0,
      localStorage: { getItem: k => (k === 'korsaren_playername' ? 'Anna' : null), setItem() {} },
      firebase: { database: { ServerValue: { TIMESTAMP: 0 } } },
      document: {
        createElement: (t) => (t === 'div' && !lctx._erste ? (lctx._erste = true, leiste) : knoten()),
        getElementById: (id) => (id === 'wuerfelLeiste' ? leiste : null),
        head: knoten(), body: knoten()
      }
    };
    lctx.window = lctx;
    vm.createContext(lctx);
    ['js/regelwerk.js', 'js/wfrp_daten.js', 'js/wfrp_regelwerk.js', 'js/dice.js'].forEach(p =>
      vm.runInContext(fs.readFileSync(path.join(WURZEL, p), 'utf8'), lctx, { filename: p }));
    lctx.FIG = { schluessel: 'anna', name: 'Molli', wfrp: true,
      werte: [{ n: 'Kampfgeschick', wert: 34 }], fertigkeiten: [{ n: 'Wissen (Recht)', wert: 48 }] };
    lctx.DB = dbL;
    let wirftL = null;
    try { vm.runInContext('initDiceRoller(DB, { ohneFeed: true, holeFigur: function () { return FIG; } })', lctx); }
    catch (e) { wirftL = e.message; }
    chk('die Leiste startet mit einer Warhammer-Figur', !wirftL, wirftL);
    chk('… zeigt Werte statt Würfelstufen', leiste.innerHTML.indexOf('Kampfgeschick <s class="wl-s3">34</s>') > 0, leiste.innerHTML.slice(0, 300));
    chk('… eine Schwierigkeit und einen W100', leiste.innerHTML.indexOf('data-wmod="-20"') > 0 && leiste.innerHTML.indexOf('data-frei="100"') > 0);
    const klick = (ds) => lauscher.click({ target: { closest: () => ({ dataset: ds }) } });
    klick({ wmod: '-20' });
    klick({ wwert: '34', wname: 'Kampfgeschick' });
    const p = dbL.log.filter(l => l[0] === 'push').pop();
    chk('ein Klick würfelt W100 gegen den Wert mit der Schwierigkeit',
      !!p && p[2].weg.art === 'w100' && p[2].ziel === 14 && p[2].probe === 'Kampfgeschick', p && p[2]);
    chk('… und schreibt "gut" mit', p && typeof p[2].gut === 'boolean');
    klick({ frei: '100' });
    const q = dbL.log.filter(l => l[0] === 'push').pop();
    chk('der freie W100 explodiert nicht', q && q[2].sides === 100 && q[2].total >= 1 && q[2].total <= 100 && !q[2].explodiert, q && q[2]);
    chk('nur W10 und W100, keine Savage-Worlds-Würfel',
      leiste.innerHTML.indexOf('data-frei="10"') > 0 && leiste.innerHTML.indexOf('data-frei="12"') < 0 &&
      leiste.innerHTML.indexOf('data-frei="6"') < 0, leiste.innerHTML.match(/data-frei="\d+"/g));
    chk('… und nichts, was explodiert', leiste.innerHTML.indexOf('data-ex=') < 0);
  }

  /* Die SPIELLEITUNG hat keine Figur - die Leiste muss das Regelwerk an der
     Sitzung erkennen. Und die Gegenprobe: eine Savage-Worlds-Sitzung behaelt
     ihre Wuerfel. */
  async function leisteOhneFigur(regelwerk) {
    const meta = regelwerk ? { name: 'X', regelwerk } : { name: 'X' };
    const dbS = fakeDb({ sitzungen: { s1: { meta } } });
    dbS.sitzung = 's1'; dbS.echt = dbS;
    const leiste = Object.assign(knoten(), { addEventListener() {} });
    let erste = false;
    const c = {
      console, JSON, Math, Date, Promise, Object, Array, String, Number, parseInt, setTimeout: () => 0,
      localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
      firebase: { database: { ServerValue: { TIMESTAMP: 0 } } },
      document: {
        createElement: (t) => (t === 'div' && !erste ? (erste = true, leiste) : knoten()),
        getElementById: (id) => (id === 'wuerfelLeiste' ? leiste : null), head: knoten(), body: knoten()
      }
    };
    c.window = c;
    vm.createContext(c);
    ['js/sitzung.js', 'js/regelwerk.js', 'js/wfrp_daten.js', 'js/wfrp_regelwerk.js', 'js/dice.js'].forEach(p =>
      vm.runInContext(fs.readFileSync(path.join(WURZEL, p), 'utf8'), c, { filename: p }));
    c.DB = dbS;
    vm.runInContext('initDiceRoller(DB, { allowPrivate: true, holeFigur: function () { return null; } })', c);
    await warte(10);
    return leiste.innerHTML;
  }
  const slW = await leisteOhneFigur('wfrp4');
  chk('die Spielleitung würfelt in einer WFRP-Sitzung W10 und W100',
    slW.indexOf('data-frei="100"') > 0 && slW.indexOf('data-frei="12"') < 0, slW.match(/data-frei="\d+"/g));
  const slS = await leisteOhneFigur(null);
  chk('… in einer Savage-Worlds-Sitzung weiter W4 bis W12 mit Explodieren',
    slS.indexOf('data-frei="12"') > 0 && slS.indexOf('data-frei="100"') < 0 && slS.indexOf('data-ex=') > 0,
    slS.match(/data-frei="\d+"/g));

  fertig();
})().catch(e => { chk('Ablauf ohne Ausnahme', false, e.stack); fertig(); });

function fertig() {
  console.log((f ? 'FEHLER: ' + f : 'OK') + ' / ' + anzahl + ' Pruefungen');
  process.exit(f ? 1 : 0);
}
