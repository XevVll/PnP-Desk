/* ==========================================================
   ABENTEUER - welcher Inhalt in einer Sitzung gespielt wird
   ----------------------------------------------------------
   Bis zum 27.11.2026 kannte das PnP-Desk genau ein Abenteuer
   (Korsaren). Jede Szenendatei war fest in karte.html, regie.html
   und js/regie_vault.js eingetragen - ein zweites Abenteuer waere
   in der Szenenliste jeder Korsaren-Runde aufgetaucht.

   Jetzt gilt:
     REGELWERK  traegt Abenteuer (ABENTEUER[x].regelwerk).
     SPIEL  (spiele/{id})          traegt "regelwerk" und "abenteuer" -
                                   gewaehlt in dieser Reihenfolge.
     SITZUNG (sitzungen/{sid}/meta) zeigt per "spiel" auf ein Spiel und
                                   uebernimmt beim Anlegen dessen Regelwerk.
   Regie und Karte zeigen nur die Szenen DIESES Abenteuers.

   ---- Korsaren bleibt, wo es ist ----
   Die Korsaren-Dateien stehen weiter einzeln in den Seiten und
   tragen kein Abenteuer-Feld. Alles, was sich NICHT ueber
   abenteuerSzenenRegistrieren() anmeldet, gehoert zu "korsaren".
   Ein Spiel ohne Feld ist ebenfalls "korsaren" - damit aendert
   sich an den laufenden Sitzungen nichts.

   ---- Neue Abenteuer ----
   Liegen je in einem eigenen Ordner abenteuer/{id}/ und melden
   ihre Szenen hier an. Alle Kennungen (Marker, Orte, Trigger)
   tragen ein Praefix, damit nichts mit einem anderen Abenteuer
   in ORTE oder SZENEN_REGIE zusammenstoesst.

   ---- Warum der Stand aus dem Cache kommt ----
   Dasselbe Muster wie bei der Sitzung (js/sitzung.js): Die Seiten
   bauen ihre Szenenliste synchron auf. Also erst den Cache nehmen
   und parallel pruefen; weicht er ab, laedt die Seite neu.
   ========================================================== */

var ABENTEUER = {
  korsaren:   { n: 'Korsaren',               regelwerk: 'savage', start: '1.1' },
  hartsklein: { n: 'Die Hartsklein-Schleuse', regelwerk: 'wfrp4',  start: 'hk1.1' }
};
var ABENTEUER_VORGABE = 'korsaren';

/* abenteuerId -> { szenenId: szene } */
var ABENTEUER_SZENEN = {};

function abenteuerSzenenRegistrieren(abenteuer, szenen) {
  if (!ABENTEUER[abenteuer]) throw new Error('Unbekanntes Abenteuer: ' + abenteuer);
  if (abenteuer === ABENTEUER_VORGABE) throw new Error('Korsaren meldet sich nicht an, es ist die Vorgabe.');
  var ziel = ABENTEUER_SZENEN[abenteuer] || (ABENTEUER_SZENEN[abenteuer] = {});
  Object.keys(szenen || {}).forEach(function (id) {
    if (ziel[id]) throw new Error('Szene doppelt angemeldet: ' + id);
    ziel[id] = szenen[id];
  });
}

/* Eine angemeldete Szene, gleich welchen Abenteuers - oder null. */
function abenteuerSzene(sceneId) {
  var ids = Object.keys(ABENTEUER_SZENEN);
  for (var i = 0; i < ids.length; i++) {
    var s = ABENTEUER_SZENEN[ids[i]][sceneId];
    if (s) return s;
  }
  return null;
}

/* Zu welchem Abenteuer gehoert eine Szene? Nicht angemeldet = Korsaren. */
function abenteuerVonSzene(sceneId) {
  var ids = Object.keys(ABENTEUER_SZENEN);
  for (var i = 0; i < ids.length; i++) {
    if (ABENTEUER_SZENEN[ids[i]][sceneId]) return ids[i];
  }
  return ABENTEUER_VORGABE;
}

/* ---------- Regelwerk zuerst (27.11.2026) ----------
   Ein Abenteuer gehoert zu genau einem Regelwerk. Ein Spiel waehlt
   erst das Regelwerk, dann eines SEINER Abenteuer; die Sitzung
   uebernimmt das Regelwerk vom Spiel. So kann keine Runde ein
   WFRP-Abenteuer nach Savage Worlds spielen. */
function abenteuerDesRegelwerks(rw) {
  return Object.keys(ABENTEUER).filter(function (k) { return ABENTEUER[k].regelwerk === rw; });
}
function regelwerkBekannt(rw) {
  return Object.keys(ABENTEUER).some(function (k) { return ABENTEUER[k].regelwerk === rw; });
}

/* Das Abenteuer eines Spiels. Ohne Feld: das erste Abenteuer seines
   Regelwerks, und ohne beides Korsaren - so bleiben die Spiele von
   vor dem 27.11.2026, wie sie waren. Ein Abenteuer, das nicht zum
   gespeicherten Regelwerk passt, gilt nicht. */
function abenteuerVon(spiel) {
  var a = spiel && spiel.abenteuer, rw = spiel && spiel.regelwerk;
  if (regelwerkBekannt(rw)) {
    if (ABENTEUER[a] && ABENTEUER[a].regelwerk === rw) return a;
    return abenteuerDesRegelwerks(rw)[0];
  }
  return ABENTEUER[a] ? a : ABENTEUER_VORGABE;
}

/* Das Regelwerk eines Spiels: gespeichert, sonst das seines Abenteuers. */
function regelwerkVonSpiel(spiel) {
  var rw = spiel && spiel.regelwerk;
  return regelwerkBekannt(rw) ? rw : ABENTEUER[abenteuerVon(spiel)].regelwerk;
}

/* ---------- Welches Abenteuer laeuft hier? ---------- */
function abenteuerCacheKey(sid) {
  return 'pnp_abenteuer_' + (sid || (typeof SITZUNG_VORGABE !== 'undefined' ? SITZUNG_VORGABE : ''));
}
function abenteuerAusCache(sid) {
  try { var a = localStorage.getItem(abenteuerCacheKey(sid)); return ABENTEUER[a] ? a : null; }
  catch (e) { return null; }
}
function abenteuerInCache(sid, a) {
  try { localStorage.setItem(abenteuerCacheKey(sid), a); } catch (e) {}
}

/* Synchron: was dieser Browser zuletzt fuer die Sitzung gesehen hat. */
function aktivesAbenteuer(sid) {
  return abenteuerAusCache(sid) || ABENTEUER_VORGABE;
}

/* Liest Sitzung -> Spiel -> Abenteuer und ruft cb(abenteuer).
   Ohne Verbindung gilt der Cache, sonst die Vorgabe. */
function abenteuerPruefen(db, cb) {
  var sid = (db && db.sitzung) || (typeof sitzungFest === 'function' && sitzungFest()) || '';
  var echt = db && (db.echt || db);
  var fertig = false;
  function antwort(a) { if (fertig) return; fertig = true; cb(a); }
  var rueckfall = function () { antwort(aktivesAbenteuer(sid)); };
  if (!echt || !echt.ref || !sid) { rueckfall(); return; }
  try {
    echt.ref('sitzungen/' + sid + '/meta/spiel').once('value').then(function (s) {
      var spiel = s.val();
      if (!spiel) { abenteuerInCache(sid, ABENTEUER_VORGABE); antwort(ABENTEUER_VORGABE); return; }
      return echt.ref('spiele/' + spiel).once('value').then(function (sp) {
        var a = abenteuerVon(sp.val());
        abenteuerInCache(sid, a);
        antwort(a);
      });
    }).catch(rueckfall);
  } catch (e) { rueckfall(); }
}

/* Fuer die Seiten: weicht das gepruefte Abenteuer vom angezeigten ab,
   laedt die Seite neu. Ein veralteter Cache kostet genau einen Reload. */
function abenteuerAbgleichen(db, angezeigt) {
  abenteuerPruefen(db, function (a) {
    if (a !== angezeigt && typeof location !== 'undefined' && location.reload) location.reload();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ABENTEUER, ABENTEUER_VORGABE, ABENTEUER_SZENEN,
    abenteuerSzenenRegistrieren, abenteuerSzene, abenteuerVonSzene, abenteuerVon,
    abenteuerDesRegelwerks, regelwerkBekannt, regelwerkVonSpiel,
    abenteuerCacheKey, abenteuerAusCache, abenteuerInCache, aktivesAbenteuer,
    abenteuerPruefen, abenteuerAbgleichen
  };
}
