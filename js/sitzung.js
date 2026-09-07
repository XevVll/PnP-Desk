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

/* ---------- Der Zeiger, und die bewusste Wahl ----------
   Zwei verschiedene Dinge, die vorher eins waren:

   aktiveSitzung  - der globale Zeiger. Ihm folgen die SPIELER.
                    Setzt die Spielleitung ihn um, wechseln alle mit.
   pnp_sitzung_fest - eine bewusste Wahl DIESES Browsers. Sie schlaegt
                    den Zeiger und folgt ihm nicht mehr.

   Ohne diese Trennung koennte die Spielleitung nicht in eine Sitzung
   hineinschauen, ohne die ganze Gruppe dorthin mitzunehmen. */
var SITZUNG_FEST_KEY = 'pnp_sitzung_fest';

function sitzungFest() {
  try { return localStorage.getItem(SITZUNG_FEST_KEY) || ''; } catch (e) { return ''; }
}
function setzeSitzungFest(sid) {
  try { localStorage.setItem(SITZUNG_FEST_KEY, sid); } catch (e) {}
  return sid;
}
function loeseSitzung() {
  try { localStorage.removeItem(SITZUNG_FEST_KEY); } catch (e) {}
}

/* Eine Sitzung laesst sich auch per Adresse mitgeben: ...?sitzung=xyz
   Genau so kommt man aus dem Regie-Hub direkt in die richtige Ansicht -
   und spaeter ein eingeladener Spieler per Beitrittslink. */
function sitzungAusAdresse() {
  try {
    var t = (location.search || '').match(/[?&]sitzung=([^&#]+)/);
    return t ? decodeURIComponent(t[1]) : '';
  } catch (e) { return ''; }
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
  // Eine Sitzung in der Adresse ist eine bewusste Wahl und wird gemerkt.
  var ausAdresse = sitzungAusAdresse();
  if (ausAdresse) setzeSitzungFest(ausAdresse);

  var fest = sitzungFest();
  var sid  = fest || sitzungAusCache();
  var huelle = sitzungsDatenbank(echteDb, sid);

  // Wer sich festgelegt hat, folgt dem Zeiger NICHT mehr. Sonst wuerde
  // die Spielleitung beim Blick in eine ruhende Sitzung sofort wieder
  // in die laufende zurueckgerissen.
  if (fest) return huelle;

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
   BEITRITT UND FREIGABE
   ----------------------------------------------------------
   Ein Spieler ist NICHT automatisch dabei, nur weil er die
   Adresse kennt. Er traegt eine Sitzungs-ID ein; die
   Spielleitung schickt sie ihm.

   Das hat einen sachlichen Grund und ist nicht nur Ordnung:
   Ohne Sitzung weiss die Charaktererschaffung gar nicht, fuer
   WELCHES Spiel sie eine Figur baut - Regeln und Inhalt haengen
   am Spiel, nicht am Browser.

   Zwei Stufen, bewusst getrennt:
     BEIGETRETEN - der Spieler gehoert zur Sitzung. Er kann eine
                   Figur bauen und fuehren.
     FREIGEGEBEN - die Spielleitung hat die Sitzung gestartet
                   (aktiveSitzung zeigt darauf). Erst jetzt fuehrt
                   die Karte irgendwohin; vorher gaebe es nichts
                   zu sehen und die Szene stuende auf einem
                   fremden Stand.
   ========================================================== */

function hatSitzung() { return !!sitzungFest(); }

/* Einer Sitzung beitreten. Geprueft wird gegen die Datenbank -
   ein Tippfehler soll nicht in einer leeren Sitzung enden, die
   es gar nicht gibt. */
function sitzungBeitreten(echteDb, eingabe, fertig) {
  var sid = String(eingabe == null ? '' : eingabe).trim().toLowerCase()
              .replace(/^.*[?&]sitzung=/, '')      // ein ganzer Link geht auch
              .replace(/[^a-z0-9-]/g, '');
  if (!sid) { fertig({ ok: false, grund: 'leer' }); return; }
  if (!echteDb) { fertig({ ok: false, grund: 'offline' }); return; }
  echteDb.ref(SITZUNG_WURZEL + '/' + sid + '/meta').once('value').then(function (s) {
    var meta = s.val();
    if (!meta) { fertig({ ok: false, grund: 'unbekannt', sid: sid }); return; }
    setzeSitzungFest(sid);
    sitzungInCache(sid);
    fertig({ ok: true, sid: sid, meta: meta });
  }).catch(function (e) { fertig({ ok: false, grund: 'fehler', fehler: e }); });
}

/* Laeuft meine Sitzung gerade? Ruft cb bei jeder Aenderung erneut,
   damit eine wartende Seite von selbst aufgeht, sobald die
   Spielleitung startet - ohne dass jemand neu laden muss. */
function beobachteFreigabe(db, cb) {
  if (!db || !db.echt) { cb(false); return; }
  try {
    db.echt.ref(SITZUNG_ZEIGER).on('value', function (s) {
      cb((s.val() || '') === db.sitzung, s.val() || '');
    });
  } catch (e) { cb(false); }
}

/* Ein vollflaechiger Hinweis, der die Seite anhaelt. Einmal hier,
   statt dreimal in den Seiten - und damit sagt jede Sperre
   dasselbe. */
function sitzungsSperre(titel, text, knopfText, knopfZiel) {
  try {
    var d = document.createElement('div');
    d.setAttribute('style',
      'position:fixed;inset:0;z-index:99999;background:#12232a;color:#fefcf8;' +
      'display:flex;align-items:center;justify-content:center;padding:2rem;' +
      "font-family:'Libre Baskerville',Georgia,serif;text-align:center");
    d.innerHTML =
      '<div style="max-width:30rem">' +
      '<div style="font-family:' + "'Cinzel',serif" + ';font-size:1.5rem;color:#c9a84c;' +
        'letter-spacing:.06em;margin-bottom:.9rem">' + titel + '</div>' +
      '<p style="font-size:.92rem;line-height:1.7;color:#cfc8ba">' + text + '</p>' +
      (knopfText ? '<a href="' + knopfZiel + '" style="display:inline-block;margin-top:1.4rem;' +
        'font-family:' + "'Cinzel',serif" + ';font-size:.75rem;letter-spacing:.08em;' +
        'padding:.5rem 1.1rem;border:1px solid #c9a84c;color:#c9a84c;border-radius:5px;' +
        'text-decoration:none">' + knopfText + '</a>' : '') +
      '</div>';
    document.body.appendChild(d);
  } catch (e) {}
}

/* ==========================================================
   SPIELERKENNUNG — aus einem Namen einen Schluessel machen
   ----------------------------------------------------------
   Bewusst HIER und nicht je Seite: Die Spielleitung kann einen
   Namen vormerken, und derselbe Spieler traegt sich beim
   Anmelden selbst ein. Beide muessen zwingend denselben
   Schluessel erzeugen - sonst steht ein Mensch doppelt in der
   Liste, einmal vorgemerkt und einmal anwesend, und niemand
   sieht, dass es dieselbe Person ist.

   Punkt, Doppelkreuz, Dollar, Klammern und Schraegstrich sind
   in Firebase-Schluesseln verboten; Umlaute werden umgeschrieben,
   damit aus "Jörg" nicht "j-rg" wird. */
function spielerKennung(name) {
  var roh = String(name == null ? '' : name).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return roh;
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
    SITZUNG_CACHE_KEY, SITZUNG_FEST_KEY, SITZUNGS_PFADE,
    sitzungFest, setzeSitzungFest, loeseSitzung, sitzungAusAdresse,
    hatSitzung, sitzungBeitreten, beobachteFreigabe, sitzungsSperre,
    istSitzungsPfad, sitzungsPfad, sitzungsDatenbank,
    FIGUR_ALPHABET, FIGUR_LAENGE, neuerFigurCode, figurCodeNormal,
    figurCodeGueltig, figurCodeLesbar, figurCodeKey, figurCode,
    setzeFigurCode, vergissFigurCode, freienFigurCode, spielerKennung,
    sitzungAusCache, sitzungInCache, sitzungsDbJetzt
  };
}
