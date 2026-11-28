/* ==========================================================
   ABENTEUER — jede Sitzung sieht nur ihren eigenen Inhalt
   ----------------------------------------------------------
   Hendriks Vorgabe vom 27.11.2026: „Das müssen wir natürlich
   getrennt voneinander aufnehmen." Gemeint: Ein zweites
   Abenteuer (die Hartsklein-Schleuse, WFRP) darf nicht in der
   Szenenliste der Korsaren-Runde stehen, und umgekehrt.

   Geprüft wird der ECHTE Code: Die Stellen aus js/regie_vault.js
   und karte.html werden geschnitten und in einem vm-Kontext
   ausgeführt, zusammen mit allen Szenendateien - so, wie der
   Browser sie lädt.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const BASIS = path.join(__dirname, '..');
const lies = p => fs.readFileSync(path.join(BASIS, p), 'utf8');

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

function schnitt(text, von, bis) {
  const a = text.indexOf(von);
  const b = text.indexOf(bis, a + von.length);
  if (a < 0 || b < 0) throw new Error('Schnitt findet nichts: ' + von + ' … ' + bis);
  return text.slice(a, b);
}

/* ---------- Ein Kontext wie im Browser ---------- */
function neuerKontext(extraDateien) {
  const speicher = {};
  const ctx = {
    console,
    localStorage: {
      getItem: k => (k in speicher ? speicher[k] : null),
      setItem: (k, v) => { speicher[k] = String(v); },
      removeItem: k => { delete speicher[k]; }
    },
    location: { search: '', reload() { ctx.neuGeladen = (ctx.neuGeladen || 0) + 1; } },
    window: {}
  };
  vm.createContext(ctx);
  const dateien = ['js/sitzung.js', 'js/abenteuer.js',
    'js/scenes.js', 'js/golden_lion_scenes.js', 'js/schatzinsel_scenes.js',
    'js/spanischer_hafen_scenes.js', 'js/schmugglernest_scenes.js', 'js/artefakthandel_scenes.js',
    'js/riffinsel_scenes.js', 'js/grabesinsel_scenes.js', 'js/abspann_scenes.js',
    'abenteuer/hartsklein/szenen.js'].concat(extraDateien || []);
  dateien.forEach(d => vm.runInContext(lies(d), ctx, { filename: d }));
  return ctx;
}

/* ---------- 1. Die Anmeldung ---------- */
{
  const ctx = neuerKontext();
  const r = vm.runInContext('({ a: abenteuerVonSzene("hk1.1"), k: abenteuerVonSzene("1.1"), x: abenteuerVonSzene("gibtsnicht"), s: !!abenteuerSzene("hk1.1"), ks: abenteuerSzene("1.1") })', ctx);
  chk('Hartsklein-Szene gehört zu hartsklein', r.a === 'hartsklein', r);
  chk('Korsaren-Szene gehört zu korsaren (nicht angemeldet = Vorgabe)', r.k === 'korsaren', r);
  chk('eine unbekannte Szene gilt als korsaren', r.x === 'korsaren', r);
  chk('abenteuerSzene findet die angemeldete', r.s === true, r);
  chk('abenteuerSzene findet keine Korsaren-Szene', r.ks === null, r);

  let fehler = '';
  try { vm.runInContext('abenteuerSzenenRegistrieren("hartsklein", { "hk1.1": {} })', ctx); } catch (e) { fehler = e.message; }
  chk('eine doppelt angemeldete Szene bricht ab', /doppelt/.test(fehler), fehler);
  fehler = '';
  try { vm.runInContext('abenteuerSzenenRegistrieren("gibtsnicht", {})', ctx); } catch (e) { fehler = e.message; }
  chk('ein unbekanntes Abenteuer bricht ab', /Unbekannt/.test(fehler), fehler);
  fehler = '';
  try { vm.runInContext('abenteuerSzenenRegistrieren("korsaren", {})', ctx); } catch (e) { fehler = e.message; }
  chk('Korsaren meldet sich nicht an', /Vorgabe/.test(fehler), fehler);

  const ids = vm.runInContext('Object.keys(ABENTEUER_SZENEN.hartsklein)', ctx);
  chk('jede Hartsklein-Szene trägt das Präfix hk', ids.every(id => /^hk/.test(id)), ids);
  const start = vm.runInContext('ABENTEUER.hartsklein.start', ctx);
  chk('der Start von Hartsklein ist eine angemeldete Szene', ids.indexOf(start) >= 0, start);
}

/* ---------- 2. Die Regie zeigt nur das eigene Abenteuer ---------- */
const VAULT = lies('js/regie_vault.js');
const vaultTeil =
  schnitt(VAULT, 'const SCENE_ORDER', '// ---------- Live-Vorschau') +
  schnitt(VAULT, 'function getAllSceneEntries()', 'function fbKey(') +
  ';this.__regie = { setze: a => { aktivAbenteuer = a; }, getAllSceneEntries, getSceneLabel, getMarkersForScene, startSzene, szeneImAbenteuer };';

function regie(a) {
  const ctx = neuerKontext();
  vm.runInContext(vaultTeil, ctx);
  ctx.__regie.setze(a);
  return ctx.__regie;
}
{
  const k = regie('korsaren');
  const kIds = k.getAllSceneEntries().map(e => e.id);
  chk('Korsaren-Regie zeigt Grimsgate', kIds.indexOf('1.1') >= 0, kIds);
  chk('Korsaren-Regie zeigt KEINE Hartsklein-Szene', !kIds.some(id => /^hk/.test(id)), kIds);
  chk('Korsaren-Regie behält ihre Reihenfolge (6.1 nach 7.1)', kIds.indexOf('7.1') < kIds.indexOf('6.1'), kIds);
  chk('Korsaren startet bei 1.1', k.startSzene() === '1.1', k.startSzene());

  const h = regie('hartsklein');
  const hIds = h.getAllSceneEntries().map(e => e.id);
  chk('Hartsklein-Regie zeigt nur Hartsklein', hIds.length > 0 && hIds.every(id => /^hk/.test(id)), hIds);
  chk('Hartsklein startet bei hk1.1', h.startSzene() === 'hk1.1', h.startSzene());
  chk('Hartsklein lehnt eine Korsaren-Szene als Live-Szene ab', h.szeneImAbenteuer('1.1') === false);
  chk('Korsaren lehnt eine Hartsklein-Szene ab', k.szeneImAbenteuer('hk1.1') === false);
  chk('getSceneLabel kennt die angemeldete Szene', h.getSceneLabel('hk1.1') === 'Die Hartsklein-Schleuse', h.getSceneLabel('hk1.1'));
  chk('getMarkersForScene liefert ein Feld', Array.isArray(h.getMarkersForScene('hk1.1')));
}

/* ---------- 3. Die Karte ---------- */
const KARTE = lies('karte.html');
const karteTeil =
  schnitt(KARTE, 'const MAP_REGISTRY = [', 'function getBackgroundForScene') +
  schnitt(KARTE, 'var kartenAbenteuer', '// ==========') +
  ';this.__karte = { setze: a => { kartenAbenteuer = a; }, findSceneMeta, getFallbackDefaultScene, szeneImKartenAbenteuer };';
{
  const ctx = neuerKontext();
  vm.runInContext(karteTeil, ctx);
  const K = ctx.__karte;
  chk('Karte: Vorgabe ist Korsaren, Start 1.1', K.getFallbackDefaultScene() === '1.1', K.getFallbackDefaultScene());
  chk('Karte findet die Hartsklein-Szene', !!K.findSceneMeta('hk1.1'));
  chk('Karte findet Grimsgate weiterhin', !!K.findSceneMeta('1.1'));
  K.setze('hartsklein');
  chk('Karte in Hartsklein startet bei hk1.1', K.getFallbackDefaultScene() === 'hk1.1', K.getFallbackDefaultScene());
  chk('Karte in Hartsklein lehnt 1.1 ab', K.szeneImKartenAbenteuer('1.1') === false);
  chk('Karte in Hartsklein nimmt hk1.1', K.szeneImKartenAbenteuer('hk1.1') === true);
}

/* ---------- 4. Die Regie-Daten stoßen nicht zusammen ---------- */
{
  const ctx = neuerKontext(['js/regie.js', 'abenteuer/hartsklein/regie.js']);
  const r = vm.runInContext('({ sr: !!SZENEN_REGIE["hk1.1"], grim: !!SZENEN_REGIE["1.1"] })', ctx);
  chk('Hartsklein trägt sein Szenenziel ein', r.sr, r);
  chk('Korsaren-Szenenziele bleiben stehen', r.grim, r);
  const orte = vm.runInContext('Object.keys(ORTE).filter(k => /^hk_/.test(k))', ctx);
  const marker = vm.runInContext('(ABENTEUER_SZENEN.hartsklein["hk1.1"].markers || []).map(m => m.id)', ctx);
  chk('jeder Hartsklein-Marker trägt das Präfix hk_', marker.every(id => /^hk_/.test(id)), marker);
  chk('jeder Hartsklein-Ort trägt das Präfix hk_', orte.every(id => /^hk_/.test(id)), orte);

  // Ein Zusammenstoß muss laut brechen, nicht still überschreiben.
  const ctx2 = neuerKontext(['js/regie.js']);
  vm.runInContext('SZENEN_REGIE["hk1.1"] = { alt: true };', ctx2);
  let fehler = '';
  try { vm.runInContext(lies('abenteuer/hartsklein/regie.js'), ctx2); } catch (e) { fehler = e.message; }
  chk('ein Zusammenstoß in SZENEN_REGIE bricht ab', /gibt es schon/.test(fehler), fehler);
}

/* ---------- 5. Sitzung -> Spiel -> Abenteuer ---------- */
function fakeDb(daten, fehlschlag) {
  return {
    sitzung: 's1',
    echt: {
      ref(p) {
        return {
          once() {
            if (fehlschlag) return Promise.reject(new Error('offline'));
            const teile = p.split('/'); let v = daten;
            teile.forEach(t => { v = (v && v[t] !== undefined) ? v[t] : null; });
            return Promise.resolve({ val: () => v });
          }
        };
      }
    }
  };
}
function pruefe(daten, fehlschlag, cache) {
  const ctx = neuerKontext();
  if (cache) ctx.localStorage.setItem('pnp_abenteuer_s1', cache);
  return new Promise(res => vm.runInContext('abenteuerPruefen', ctx)(fakeDb(daten, fehlschlag), a => res({ a, ctx })));
}
(async function () {
  let r = await pruefe({ sitzungen: { s1: { meta: { spiel: 'g' } } }, spiele: { g: { abenteuer: 'hartsklein' } } });
  chk('Spiel mit abenteuer=hartsklein -> hartsklein', r.a === 'hartsklein', r.a);
  chk('… und es wird für die Sitzung gemerkt', r.ctx.localStorage.getItem('pnp_abenteuer_s1') === 'hartsklein');

  r = await pruefe({ sitzungen: { s1: { meta: { spiel: 'g' } } }, spiele: { g: { name: 'alt' } } });
  chk('ein Spiel OHNE Feld bleibt Korsaren (alte Spiele ändern sich nicht)', r.a === 'korsaren', r.a);

  r = await pruefe({ sitzungen: { s1: { meta: {} } } });
  chk('eine Sitzung ohne Spiel ist Korsaren', r.a === 'korsaren', r.a);

  r = await pruefe({ sitzungen: { s1: { meta: { spiel: 'g' } } }, spiele: { g: { abenteuer: 'unsinn' } } });
  chk('ein unbekanntes Abenteuer fällt auf Korsaren zurück', r.a === 'korsaren', r.a);

  r = await pruefe({}, true, 'hartsklein');
  chk('ohne Verbindung gilt der Cache', r.a === 'hartsklein', r.a);

  r = await pruefe({}, true, null);
  chk('ohne Verbindung und ohne Cache gilt Korsaren', r.a === 'korsaren', r.a);

  // Abgleich: weicht das Abenteuer ab, lädt die Seite genau einmal neu.
  const ctx = neuerKontext();
  const db = fakeDb({ sitzungen: { s1: { meta: { spiel: 'g' } } }, spiele: { g: { abenteuer: 'hartsklein' } } });
  vm.runInContext('abenteuerAbgleichen', ctx)(db, 'korsaren');
  await new Promise(r2 => setTimeout(r2, 10));
  chk('abweichender Cache lädt die Seite neu', ctx.neuGeladen === 1, ctx.neuGeladen);
  const ctx2 = neuerKontext();
  vm.runInContext('abenteuerAbgleichen', ctx2)(db, 'hartsklein');
  await new Promise(r2 => setTimeout(r2, 10));
  chk('passender Cache lädt NICHT neu', !ctx2.neuGeladen, ctx2.neuGeladen);

  /* ---------- 6. Der Regie-Hub ---------- */
  const HUB = lies('regie_hub.html');
  chk('Hub lädt js/abenteuer.js', HUB.indexOf('<script src="js/abenteuer.js"></script>') >= 0);

  /* ---------- 6a. Erst das Regelwerk, dann das Abenteuer ----------
     Hendrik, 27.11.2026: „Die Abenteuer sollten doch dem Regelwerk
     zugeordnet sein." Die Prüfungen führen die Hub-Funktionen aus. */
  {
    const rctx = neuerKontext();
    const r = vm.runInContext(`({
      sw: abenteuerDesRegelwerks('savage'), wf: abenteuerDesRegelwerks('wfrp4'),
      alt: abenteuerVon({}), altRw: regelwerkVonSpiel({}),
      nurRw: abenteuerVon({ regelwerk: 'wfrp4' }),
      falsch: abenteuerVon({ regelwerk: 'wfrp4', abenteuer: 'korsaren' }),
      hk: regelwerkVonSpiel({ abenteuer: 'hartsklein' })
    })`, rctx);
    chk('Savage Worlds führt Korsaren, nicht Hartsklein', r.sw.indexOf('korsaren') >= 0 && r.sw.indexOf('hartsklein') < 0, r.sw);
    chk('WFRP führt Hartsklein, nicht Korsaren', r.wf.indexOf('hartsklein') >= 0 && r.wf.indexOf('korsaren') < 0, r.wf);
    chk('ein Spiel von vorher bleibt Korsaren / Savage Worlds', r.alt === 'korsaren' && r.altRw === 'savage', r);
    chk('ein WFRP-Spiel ohne Abenteuer nimmt ein WFRP-Abenteuer', r.nurRw === 'hartsklein', r);
    chk('ein unpassendes Abenteuer gilt nicht (Korsaren unter WFRP)', r.falsch === 'hartsklein', r);
    chk('ohne gespeichertes Regelwerk gilt das des Abenteuers', r.hk === 'wfrp4', r);

    /* Die Hub-Funktionen selbst, geschnitten und ausgeführt. */
    const knoten = {};
    const el = id => knoten[id] || (knoten[id] = { value: '', innerHTML: '', textContent: '', options: [] });
    const geschrieben = [];
    const meldungen = [];
    const fakeDb = {
      ref(p) { return {
        set(v) { geschrieben.push([p || '', v]); return Promise.resolve(); },
        update(v) { geschrieben.push([p || '', v]); return Promise.resolve(); }
      }; }
    };
    Object.assign(rctx, { el, db: fakeDb, esc: x => String(x),
      meld: (id, t) => meldungen.push(t),
      freieKennung: n => n.toLowerCase(), spiele: {}, sitzungen: {} });
    vm.runInContext(schnitt(HUB, 'function spielAnlegen()', '/* ---------- Steuern'), rctx);
    vm.runInContext(schnitt(HUB, 'function zeichneRegelwerk(', 'function zeichneStartRang('), rctx);
    vm.runInContext(schnitt(HUB, 'function abenteuerFeld(', 'function zeichneSpiele('), rctx);

    // Formular: WFRP gewählt -> nur WFRP-Abenteuer in der Liste
    el('spielRegel').value = 'wfrp4';
    vm.runInContext('abenteuerAuswahl()', rctx);
    chk('Formular: WFRP listet Hartsklein', /hartsklein/.test(el('spielAbenteuer').innerHTML), el('spielAbenteuer').innerHTML);
    chk('Formular: WFRP listet KEIN Korsaren', !/korsaren/.test(el('spielAbenteuer').innerHTML), el('spielAbenteuer').innerHTML);

    // Anlegen schreibt Regelwerk und Abenteuer
    el('spielName').value = 'Schleuse'; el('spielAbenteuer').value = 'hartsklein';
    vm.runInContext('spielAnlegen()', rctx);
    const sp = geschrieben.pop();
    chk('Spiel anlegen schreibt Regelwerk und Abenteuer', sp && sp[0] === 'spiele/schleuse' && sp[1].regelwerk === 'wfrp4' && sp[1].abenteuer === 'hartsklein', sp);

    // Unpassend: Savage Worlds + Hartsklein wird abgelehnt
    el('spielRegel').value = 'savage'; el('spielName').value = 'Falsch'; el('spielAbenteuer').value = 'hartsklein';
    const vorher = geschrieben.length;
    vm.runInContext('spielAnlegen()', rctx);
    chk('Savage Worlds mit Hartsklein wird NICHT angelegt', geschrieben.length === vorher, geschrieben.slice(vorher));

    // Sitzung übernimmt das Regelwerk vom Spiel
    rctx.spiele = { schleuse: { name: 'Schleuse', regelwerk: 'wfrp4', abenteuer: 'hartsklein' } };
    vm.runInContext('spiele = this.spiele', rctx);
    el('sitzName').value = 'Runde'; el('sitzSpiel').value = 'schleuse'; el('sitzPw').value = '';
    vm.runInContext('sitzungAnlegen()', rctx);
    const paket = geschrieben.pop();
    const meta = paket && paket[1]['sitzungen/runde/meta'];
    chk('Sitzung übernimmt WFRP vom Spiel', meta && meta.regelwerk === 'wfrp4', paket);
    chk('der Hub hat kein eigenes Regelwerk-Feld für die Sitzung mehr', HUB.indexOf('<select id="sitzRegel"') < 0);

    // Hendriks Testspiel: altes Spiel ohne Felder, Sitzung aber WFRP
    vm.runInContext(`spiele = { test: { name: 'Test' } };
      sitzungen = { test: { meta: { spiel: 'test', regelwerk: 'wfrp4' }, stand: { figuren: { sl: {} } } } };`, rctx);
    const warn = vm.runInContext('zeichneRegelwerk("test")', rctx);
    chk('Sitzung, die vom Spiel abweicht, sagt das', /läuft nach Savage Worlds/.test(warn), warn);
    const feld = vm.runInContext('regelwerkFeld("test", spiele.test, ["test"])', rctx);
    chk('das Spiel bietet „angleichen" an WFRP an', /Spiel angleichen/.test(feld) && /wfrp4/.test(feld), feld);
    vm.runInContext('spielRegelSetzen("test", "wfrp4")', rctx);
    const angl = geschrieben.pop();
    chk('angleichen setzt Regelwerk UND ein passendes Abenteuer', angl && angl[0] === 'spiele/test' && angl[1].regelwerk === 'wfrp4' && angl[1].abenteuer === 'hartsklein', angl);
    vm.runInContext("spiele.test.regelwerk = 'wfrp4'; spiele.test.abenteuer = 'hartsklein';", rctx);
    chk('danach keine Warnung mehr', !/läuft nach/.test(vm.runInContext('zeichneRegelwerk("test")', rctx)));
    chk('danach kein Angleichen-Knopf mehr', !/angleichen/.test(vm.runInContext('regelwerkFeld("test", spiele.test, ["test"])', rctx)));

    // Uneinige Sitzungen: kein Angleichen, sonst würde eine davon falsch
    vm.runInContext(`spiele.u = { name: 'U' };
      sitzungen.a = { meta: { spiel: 'u', regelwerk: 'wfrp4' } };
      sitzungen.b = { meta: { spiel: 'u', regelwerk: 'savage' } };`, rctx);
    chk('uneinige Sitzungen: kein Angleichen-Knopf', !/angleichen/.test(vm.runInContext('regelwerkFeld("u", spiele.u, ["a","b"])', rctx)));

    // Abenteuer-Feld eines ungenutzten WFRP-Spiels listet nur WFRP
    const af = vm.runInContext("abenteuerFeld('s', { regelwerk: 'wfrp4', abenteuer: 'hartsklein' }, 0)", rctx);
    chk('Abenteuer-Feld eines WFRP-Spiels ohne Korsaren', /hartsklein/.test(af) && !/korsaren/.test(af), af);
  }
  const feld = schnitt(HUB, 'function abenteuerFeld(', 'function spielAbenteuerSetzen(');
  const hctx = neuerKontext();
  hctx.esc = s => String(s);
  vm.runInContext(feld + ';this.__feld = abenteuerFeld;', hctx);
  const offen = hctx.__feld('g', { abenteuer: 'hartsklein' }, 0);
  const fest = hctx.__feld('g', { abenteuer: 'hartsklein' }, 2);
  chk('ohne Sitzung ist das Abenteuer umstellbar', /<select/.test(offen) && /value="hartsklein" selected/.test(offen), offen);
  chk('mit Sitzung steht es fest (kein Auswahlfeld)', !/<select/.test(fest) && /Hartsklein/.test(fest), fest);
  chk('ein Spiel ohne Feld zeigt Korsaren', /Korsaren/.test(hctx.__feld('g', {}, 1)));

  /* ---------- 7. Eingebunden, wo es hingehört ---------- */
  const REGIE = lies('regie.html');
  const pos = (t, s) => t.indexOf('<script src="' + s + '"></script>');
  chk('regie.html: abenteuer.js nach sitzung.js', pos(REGIE, 'js/sitzung.js') >= 0 && pos(REGIE, 'js/abenteuer.js') > pos(REGIE, 'js/sitzung.js'));
  chk('regie.html: Hartsklein-Regie NACH js/regie.js', pos(REGIE, 'abenteuer/hartsklein/regie.js') > pos(REGIE, 'js/regie.js'));
  chk('regie.html: Hartsklein-Szenen nach abenteuer.js', pos(REGIE, 'abenteuer/hartsklein/szenen.js') > pos(REGIE, 'js/abenteuer.js'));
  chk('karte.html: Hartsklein-Szenen nach abenteuer.js', pos(KARTE, 'abenteuer/hartsklein/szenen.js') > pos(KARTE, 'js/abenteuer.js'));

  /* ---------- 8. Der Inhalt der Hartsklein-Schleuse (MARKE_INHALT_28_11) ----------
     Geprueft wird, was am Tisch lautlos brechen wuerde: ein Marker ohne
     GM-Seite, ein Bild ins Leere, eine Probe mit einem Fertigkeitsnamen,
     den es in WFRP nicht gibt, oder ein Grab, das von Anfang an auf der
     Karte steht und die Loesung verraet. */
  {
    const ictx = neuerKontext(['js/regie.js', 'abenteuer/hartsklein/regie.js',
      'js/wfrp_daten.js', 'js/wfrp_regelwerk.js']);
    const I = vm.runInContext('({ ORTE: ORTE, SR: SZENEN_REGIE, sz: abenteuerSzene("hk1.1"),' +
      ' fert: WFRP_FERTIGKEITEN.map(function (x) { return x.n; }),' +
      ' attr: WFRP_ATTRIBUTE.map(function (x) { return x.n; }),' +
      ' schw: WFRP_SCHWIERIGKEITEN })', ictx);
    const marker = I.sz.markers;
    const ids = marker.map(m => m.id);
    const hkOrte = Object.keys(I.ORTE).filter(k => k.indexOf('hk_') === 0);

    chk('die Szene hat ein Kartenbild', !!I.sz.background);
    chk('mindestens zehn Orte auf der Karte', marker.length >= 10, marker.length);
    chk('jede Marker-Kennung traegt das Praefix hk_', ids.every(k => k.indexOf('hk_') === 0), ids);
    chk('jeder Marker hat eine GM-Seite in ORTE', ids.every(k => I.ORTE[k]), ids.filter(k => !I.ORTE[k]));
    chk('kein hk_-Ort ohne Marker', hkOrte.every(k => ids.indexOf(k) >= 0), hkOrte.filter(k => ids.indexOf(k) < 0));

    const bilder = [I.sz.background];
    marker.forEach(m => {
      bilder.push(m.img);
      Object.keys(m.variants || {}).forEach(v => bilder.push(m.variants[v].img));
    });
    const fehlt = bilder.filter(b => !b || !fs.existsSync(path.join(BASIS, b)));
    chk('jedes Bild der Szene liegt wirklich in images/', fehlt.length === 0, fehlt);
    chk('kein Marker ohne Bild und Beschreibung', marker.every(m => m.img && m.desc && m.title));

    const verborgen = marker.filter(m => m.verborgen).map(m => m.id);
    chk('genau das Grab ist zu Beginn verborgen', JSON.stringify(verborgen) === '["hk_grab"]', verborgen);

    let probleme = [], interaktionen = 0, trigger = 0;
    hkOrte.forEach(o => {
      const ia = I.ORTE[o].interaktionen || {};
      Object.keys(ia).forEach(k => {
        interaktionen++;
        const x = ia[k];
        if (k.indexOf('hk_') !== 0) probleme.push(o + '.' + k + ': Kennung ohne hk_');
        if (!x.title || !x.kurz || !x.details) probleme.push(o + '.' + k + ': Titel/Kurz/Details fehlt');
        if (!x.trigger || !x.trigger.length) probleme.push(o + '.' + k + ': keine Trigger');
        const tid = (x.trigger || []).map(t => t.id);
        trigger += tid.length;
        if (new Set(tid).size !== tid.length) probleme.push(o + '.' + k + ': doppelte Trigger-Kennung');
        (x.trigger || []).forEach(t => { if (!t.id || !t.label) probleme.push(o + '.' + k + ': Trigger ohne id/label'); });
      });
    });
    chk('jede Interaktion vollstaendig, Trigger eindeutig', probleme.length === 0, probleme);
    chk('der Inhalt ist da (mind. 20 Interaktionen, 80 Trigger)', interaktionen >= 20 && trigger >= 80, { interaktionen, trigger });

    const alles = JSON.stringify(hkOrte.map(k => I.ORTE[k])) + JSON.stringify(I.SR['hk1.1']);
    chk('kein [OFFEN] mehr im Abenteuer', alles.indexOf('[OFFEN]') < 0);
    chk('Szenenziel und Stimmung stehen', !!(I.SR['hk1.1'].uebergeordnetesZiel && I.SR['hk1.1'].stimmung));
    chk('das Szenenziel bleibt kurz (unter 600 Zeichen)', I.SR['hk1.1'].uebergeordnetesZiel.length < 600,
      I.SR['hk1.1'].uebergeordnetesZiel.length);

    /* Jede Probe im Text: "Name, Schwierigkeit (+n)". Der Name muss eine
       WFRP-Fertigkeit oder ein Attribut sein, die Zahl zur Schwierigkeit
       passen. Ein erfundener Name ("Wille", "Koerper") faellt hier auf. */
    const namen = new Set(I.fert.concat(I.attr));
    const schw = {}; I.schw.forEach(x => { schw[x.n] = x.mod; });
    const re = /([A-ZÄÖÜ][a-zäöüß]+)(?: \([^)]*\))?, (Sehr leicht|Leicht|Durchschnittlich|Herausfordernd|Schwierig|Schwer|Sehr schwer) \(([+−-]?\d+)\)/g;
    let m, proben = 0; const falsch = [];
    while ((m = re.exec(alles))) {
      proben++;
      const mod = parseInt(m[3].replace('−', '-'), 10);
      if (!namen.has(m[1])) falsch.push('unbekannt: ' + m[1]);
      if (schw[m[2]] !== mod) falsch.push(m[2] + ' ist ' + schw[m[2]] + ', nicht ' + m[3]);
    }
    chk('es gibt Proben im Text (mind. 15)', proben >= 15, proben);
    chk('jede Probe nennt eine echte WFRP-Fertigkeit mit passender Schwierigkeit', falsch.length === 0, falsch);

    /* Die NSC tragen ihr volles Profil. */
    const npcs = [];
    hkOrte.forEach(k => (I.ORTE[k].npcs || []).forEach(n => { if (npcs.indexOf(n) < 0) npcs.push(n); }));
    const spalten = ['b', 'kg', 'bf', 'st', 'wi', 'i', 'gw', 'gs', 'in', 'wk', 'ch', 'lep'];
    chk('vier Figuren mit Werten (Henrietta, Tote, Raben, Kurgorn)', npcs.length === 4, npcs.map(n => n.name));
    chk('jedes Profil hat alle zwoelf Spalten', npcs.every(n => n.wfrp && spalten.every(s => s in n.wfrp.profil)),
      npcs.filter(n => !(n.wfrp && spalten.every(s => s in n.wfrp.profil))).map(n => n.name));
    const kur = npcs.find(n => n.name === 'Kurgorn Three-Eyes');
    chk('Kurgorns Werte wie im Abenteuer (KG 75, WI 50, LeP 19)',
      kur && kur.wfrp.profil.kg === 75 && kur.wfrp.profil.wi === 50 && kur.wfrp.profil.lep === 19, kur && kur.wfrp.profil);
    const tot = npcs.find(n => n.name === 'Die Toten aus dem Kanal');
    chk('Zombiewerte wie im Regelwerk S. 328 (KG 15, I 5, LeP 12)',
      tot && tot.wfrp.profil.kg === 15 && tot.wfrp.profil.i === 5 && tot.wfrp.profil.lep === 12, tot && tot.wfrp.profil);
    chk('Henrietta steht an mehreren Orten als DASSELBE Objekt',
      I.ORTE.hk_schleuse.npcs[0] === I.ORTE.hk_flur.npcs[0]);
  }

  /* ---------- 9. Verborgen bis zum Aufdecken ---------- */
  {
    const vctx = neuerKontext();
    const V = vm.runInContext('({ v: markerVerborgen, u: markerSichtbarkeitUmschalten })', vctx);
    const grab = { id: 'hk_grab', verborgen: true }, flur = { id: 'hk_flur' };
    chk('ein verborgener Marker ist ohne Eintrag ausgeblendet', V.v(grab, {}) === true);
    chk('aufgedeckt (false) ist er sichtbar', V.v(grab, { hk_grab: false }) === false);
    chk('ein normaler Marker ist ohne Eintrag sichtbar (wie bisher)', V.v(flur, {}) === false);
    chk('ein normaler Marker mit true ist ausgeblendet (wie bisher)', V.v(flur, { hk_flur: true }) === true);
    chk('Umschalten deckt den verborgenen auf: schreibt false', V.u(grab, {}) === false);
    chk('und blendet ihn wieder aus: Eintrag weg', V.u(grab, { hk_grab: false }) === null);
    chk('ein normaler Marker schreibt beim Ausblenden true', V.u(flur, {}) === true);
    chk('und beim Einblenden wird der Eintrag geloescht (wie bisher)', V.u(flur, { hk_flur: true }) === null);

    // Die Karte filtert ueber den Helfer, auf Haupt- UND Sub-Orten.
    chk('karte.html blendet ueber markerVerborgen aus (Haupt- und Sub-Orte)',
      (KARTE.match(/markerVerborgen\(/g) || []).length >= 2 && KARTE.indexOf('!currentHiddenMarkerIds[') < 0);

    // Die Regie schaltet wirklich so um: echter Code, geschnitten.
    const VAULT = lies('js/regie_vault.js');
    const tctx = neuerKontext();
    const geschrieben = [];
    tctx.db = { ref(p) { return { set(v) { geschrieben.push([p, v]); }, remove() { geschrieben.push([p, 'REMOVE']); } }; } };
    tctx.fbKey = k => String(k).replace(/\./g, '-');
    vm.runInContext('var hiddenMarkerIds = {};' +
      'function getMarkersForScene(s) { var x = abenteuerSzene(s); return x ? x.markers : []; }', tctx);
    vm.runInContext(schnitt(VAULT, 'function toggleMarkerVisibility(', '// ---------- Text-Suche'), tctx);
    vm.runInContext('toggleMarkerVisibility("hk1.1", "hk_grab")', tctx);
    chk('Regie: das verborgene Grab aufdecken schreibt false',
      JSON.stringify(geschrieben.pop()) === JSON.stringify(['hiddenMarkersLive/hk1-1/hk_grab', false]));
    vm.runInContext('hiddenMarkerIds = { hk_grab: false }; toggleMarkerVisibility("hk1.1", "hk_grab")', tctx);
    chk('Regie: wieder verbergen loescht den Eintrag',
      JSON.stringify(geschrieben.pop()) === JSON.stringify(['hiddenMarkersLive/hk1-1/hk_grab', 'REMOVE']));
    vm.runInContext('hiddenMarkerIds = {}; toggleMarkerVisibility("hk1.1", "hk_flur")', tctx);
    chk('Regie: ein normaler Marker wird wie bisher mit true ausgeblendet',
      JSON.stringify(geschrieben.pop()) === JSON.stringify(['hiddenMarkersLive/hk1-1/hk_flur', true]));

    /* Die Steckbrief-Karte zeigt das WFRP-Profil - und ohne Feld nichts davon. */
    const pctx = neuerKontext();
    vm.runInContext(schnitt(VAULT, 'function steckbriefCardsHTML(', '// ---------- Live-Präsenz'), pctx);
    const karteMit = vm.runInContext('steckbriefCardsHTML([{ name: "X", wfrp: { profil: { b: 4, kg: 15, lep: 12 }, eigenschaften: "Untot" } }])', pctx);
    const karteOhne = vm.runInContext('steckbriefCardsHTML([{ name: "Y", rolle: "Matrose" }])', pctx);
    chk('Karte mit WFRP: Tabelle mit allen zwoelf Spalten', (karteMit.match(/<th>/g) || []).length === 12 && /LeP/.test(karteMit), karteMit);
    chk('fehlende Werte stehen als Strich da', (karteMit.match(/<td>—<\/td>/g) || []).length === 9, karteMit);
    chk('Eigenschaften als eigene Zeile', /<b>Eigenschaften<\/b> Untot/.test(karteMit));
    chk('Karte ohne WFRP-Feld bleibt wie bisher (keine Tabelle)', karteOhne.indexOf('<table') < 0);
  }

  console.log('\nOK: ' + (anzahl - f) + '   FEHLER: ' + f);
  process.exitCode = f ? 1 : 0;
})();
