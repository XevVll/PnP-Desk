/* ==========================================================
   SITZUNGEN — mehrere Spielrunden in einer Datenbank
   ----------------------------------------------------------
   Bisher lag der gesamte Spielstand flach in der Wurzel:
   currentScene, arenaState, figuren, diceRolls ... Damit gibt
   es genau EINE Runde. Zwei Gruppen wuerden sich gegenseitig
   die Szene umschalten.

   Ab jetzt haengt aller Spielstand unter
       sitzungen/{sid}/stand/...
   und ein einziger Zeiger sagt, welche Sitzung gerade laeuft:
       aktiveSitzung

   ---- Warum das hier eine Huelle ist und keine 84 Aenderungen ----
   Im Projekt stehen 84 Aufrufe der Form db.ref('currentScene').
   Die alle einzeln umzuschreiben waere 84 Gelegenheiten, eine
   zu vergessen - und eine vergessene schreibt still in die
   Wurzel zurueck, wo sie niemand sucht.
   Stattdessen wird das db-Objekt selbst ausgetauscht. Es hat
   dieselbe Form (eine Methode ref), haengt aber jedem bekannten
   Spielstands-Pfad das Sitzungs-Praefix an. Jeder Aufrufer
   bleibt woertlich, wie er ist.

   ---- Warum der Zeiger aus dem Cache kommt ----
   Die Seiten bauen ihre Datenbank synchron auf und haengen
   sofort ihre Listener an. Wuerde man erst auf den Zeiger
   warten, muesste in sieben Dateien der Ablauf umgebaut werden.
   Also: Sitzung aus dem localStorage nehmen (synchron), und
   parallel pruefen. Weicht sie ab, laedt die Seite neu. Ein
   veralteter Cache kostet damit genau einen Reload - und ein
   Sitzungswechsel ist ohnehin ein Einschnitt, kein Vorgang
   mitten im Spiel.
   ========================================================== */

var SITZUNG_VORGABE   = 'korsaren';       // bis eine Sitzung angelegt ist
var SITZUNG_ZEIGER    = 'aktiveSitzung';
var SITZUNG_WURZEL    = 'sitzungen';
var SPIEL_WURZEL      = 'spiele';
var SITZUNG_CACHE_KEY = 'pnp_aktive_sitzung';

/* Alle Pfade, die zum Spielstand EINER Sitzung gehoeren. Wer hier
   fehlt, schreibt weiter in die Wurzel - deshalb muss jeder neue
   Top-Level-Pfad hier UND in firebase-rules.json auftauchen. */
var SITZUNGS_PFADE = [
  'currentScene', 'sceneAudioFile', 'sceneCharacters', 'charStatus',
  'hiddenMarkersLive', 'markerVariant', 'openMarkers', 'diceRolls',
  'gmTimer', 'players', 'pcRuf', 'questDone', 'extraNpcs', 'extraGhosts',
  'regie', 'graphState', 'arenaState', 'figuren', 'termine'
];

/* Bewusst global und NICHT je Sitzung: der Zeiger selbst, die
   Sitzungsverwaltung, die Spiele - und ".info", das Firebase
   selbst fuehrt. */
function istSitzungsPfad(pfad) {
  var p = String(pfad === undefined || pfad === null ? '' : pfad).replace(/^\/+/, '');
  if (!p) return false;
  return SITZUNGS_PFADE.indexOf(p.split('/')[0]) >= 0;
}

function sitzungsPfad(sid, pfad) {
  var p = String(pfad === undefined || pfad === null ? '' : pfad).replace(/^\/+/, '');
  return istSitzungsPfad(p) ? SITZUNG_WURZEL + '/' + sid + '/stand/' + p : p;
}

/* Die Huelle. Liefert echte Firebase-Referenzen zurueck, nur unter
   dem richtigen Pfad - deshalb funktionieren once/on/push/remove/
   orderByChild/onDisconnect und alles Uebrige unveraendert weiter. */
function sitzungsDatenbank(echteDb, sid) {
  if (!echteDb) return null;
  var huelle = {
    sitzung: sid,
    echt: echteDb,
    pfad: function (p) { return sitzungsPfad(sid, p); },
    ref: function (pfad) {
      if (pfad === undefined || pfad === null || pfad === '' || pfad === '/') {
        // Wurzel-Referenz: wird im Projekt nur fuer Sammel-Updates
        // und fuer push().key benutzt. Beim Sammel-Update wird JEDER
        // Schluessel einzeln umgehaengt - sonst schriebe ein einziger
        // Aufruf den halben Spielstand zurueck in die Wurzel.
        var wurzel = echteDb.ref();
        return {
          update: function (paket) {
            var neu = {};
            Object.keys(paket || {}).forEach(function (k) {
              neu[sitzungsPfad(sid, k)] = paket[k];
            });
            return wurzel.update(neu);
          },
          push:  function () { return wurzel.push(); },
          child: function (p) { return echteDb.ref(sitzungsPfad(sid, p)); }
        };
      }
      return echteDb.ref(sitzungsPfad(sid, pfad));
    }
  };
  return huelle;
}

/* ---------- Der Zeiger ---------- */
function sitzungAusCache() {
  try { return localStorage.getItem(SITZUNG_CACHE_KEY) || SITZUNG_VORGABE; }
  catch (e) { return SITZUNG_VORGABE; }
}
function sitzungInCache(sid) {
  try { localStorage.setItem(SITZUNG_CACHE_KEY, sid); } catch (e) {}
  return sid;
}

/* Bequemer Einstieg fuer die Seiten: liefert sofort eine benutzbare
   Datenbank und korrigiert sich selbst, falls der Cache veraltet ist. */
function sitzungsDbJetzt(echteDb, beiWechsel) {
  var sid = sitzungAusCache();
  var huelle = sitzungsDatenbank(echteDb, sid);
  try {
    echteDb.ref(SITZUNG_ZEIGER).on('value', function (s) {
      var echt = s.val() || SITZUNG_VORGABE;
      if (echt === sid) { sitzungInCache(echt); return; }
      sitzungInCache(echt);
      if (beiWechsel) beiWechsel(echt);
      else if (typeof location !== 'undefined' && location.reload) location.reload();
    });
  } catch (e) { /* ohne Zeiger laeuft die Vorgabe-Sitzung weiter */ }
  return huelle;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SITZUNG_VORGABE, SITZUNG_ZEIGER, SITZUNG_WURZEL, SPIEL_WURZEL,
    SITZUNG_CACHE_KEY, SITZUNGS_PFADE,
    istSitzungsPfad, sitzungsPfad, sitzungsDatenbank,
    sitzungAusCache, sitzungInCache, sitzungsDbJetzt
  };
}
