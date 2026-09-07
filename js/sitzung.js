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

/* ==========================================================
   FIGURENCODE — die Figur bekommt eine eigene Adresse
   ----------------------------------------------------------
   Vorher hing eine Figur am Browser: Ihr Pfad war
   figuren/{pnp_player_id}, und diese Kennung entsteht im
   localStorage. Wer am Laptop baute und am Handy oeffnete, war
   fuer das System ein anderer Mensch ohne Figur.

   Jetzt traegt die Figur einen kurzen Code, den man abschreiben
   und eintippen kann. Er IST ihr Pfad:
       sitzungen/{sid}/stand/figuren/{code}

   Alphabet ist Crockford-Base32: ohne I, L, O und U. Damit gibt
   es die klassischen Verwechslungen beim Vorlesen nicht - und
   was doch als I oder O eingetippt wird, laesst sich eindeutig
   auf 1 und 0 zurueckfuehren.

   Der Code ist KEIN Passwort. Wer ihn hat, kann die Figur laden
   und aendern. In einer Runde eingeladener Freunde ist das genau
   richtig - am Tisch sagt man ihn sich ohnehin laut. */
var FIGUR_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
var FIGUR_LAENGE   = 6;

function neuerFigurCode() {
  var c = '';
  for (var i = 0; i < FIGUR_LAENGE; i++) {
    c += FIGUR_ALPHABET.charAt(Math.floor(Math.random() * FIGUR_ALPHABET.length));
  }
  return c;
}

/* Alles annehmen, was ein Mensch eintippt: Kleinbuchstaben,
   Bindestriche, Leerzeichen, und die vier verwechselten Zeichen. */
function figurCodeNormal(eingabe) {
  return String(eingabe == null ? '' : eingabe).toUpperCase()
    .replace(/[IL]/g, '1').replace(/[OU]/g, '0')
    .replace(/[^0-9A-Z]/g, '')
    .split('').filter(function (z) { return FIGUR_ALPHABET.indexOf(z) >= 0; })
    .join('').slice(0, FIGUR_LAENGE);
}
function figurCodeGueltig(code) {
  return figurCodeNormal(code).length === FIGUR_LAENGE;
}
/* Zum Anzeigen und Vorlesen in zwei Dreiergruppen. */
function figurCodeLesbar(code) {
  var c = String(code || '');
  return c.length === FIGUR_LAENGE ? c.slice(0, 3) + '-' + c.slice(3) : c;
}

/* Welchen Code haelt dieser Browser fuer diese Sitzung? Bewusst je
   Sitzung: Dieselbe Person spielt in zwei Runden zwei Figuren. */
function figurCodeKey(sid) { return 'pnp_figur_' + (sid || SITZUNG_VORGABE); }
function figurCode(sid) {
  try { return localStorage.getItem(figurCodeKey(sid)) || ''; } catch (e) { return ''; }
}
function setzeFigurCode(sid, code) {
  var c = figurCodeNormal(code) || String(code || '');
  try { localStorage.setItem(figurCodeKey(sid), c); } catch (e) {}
  return c;
}
function vergissFigurCode(sid) {
  try { localStorage.removeItem(figurCodeKey(sid)); } catch (e) {}
}

/* Einen Code besorgen, der in dieser Sitzung noch frei ist.
   Der Kollisionstest laeuft gegen die Datenbank, weil nur sie
   weiss, was es schon gibt. Ohne Verbindung wird schlicht einer
   erzeugt - bei 32^6 Moeglichkeiten ist das vertretbar. */
function freienFigurCode(db, fertig) {
  var versuche = 0;
  function probier() {
    var c = neuerFigurCode();
    if (!db || versuche >= 5) { fertig(c); return; }
    versuche++;
    db.ref('figuren/' + c).once('value').then(function (s) {
      if (s.val() === null) fertig(c); else probier();
    }).catch(function () { fertig(c); });
  }
  probier();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SITZUNG_VORGABE, SITZUNG_ZEIGER, SITZUNG_WURZEL, SPIEL_WURZEL,
    SITZUNG_CACHE_KEY, SITZUNGS_PFADE,
    istSitzungsPfad, sitzungsPfad, sitzungsDatenbank,
    FIGUR_ALPHABET, FIGUR_LAENGE, neuerFigurCode, figurCodeNormal,
    figurCodeGueltig, figurCodeLesbar, figurCodeKey, figurCode,
    setzeFigurCode, vergissFigurCode, freienFigurCode,
    sitzungAusCache, sitzungInCache, sitzungsDbJetzt
  };
}
