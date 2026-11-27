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
  chk('Spiel anlegen schreibt das Abenteuer mit', /set\(\{ name: name, abenteuer: abenteuer,/.test(HUB));
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

  console.log('\nOK: ' + (anzahl - f) + '   FEHLER: ' + f);
  process.exitCode = f ? 1 : 0;
})();
