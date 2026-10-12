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





/* Zum Anzeigen und Vorlesen in zwei Dreiergruppen. */
function figurCodeLesbar(code) {
  var c = String(code || '');
  return c.length === FIGUR_LAENGE ? c.slice(0, 3) + '-' + c.slice(3) : c;
}

/* Welchen Code haelt dieser Browser fuer diese Sitzung? Bewusst je
   Sitzung: Dieselbe Person spielt in zwei Runden zwei Figuren. */
function figurCodeKey(sid) { return 'pnp_figur_' + (sid || SITZUNG_VORGABE); }

/* Der lokale Rueckfall MUSS ebenso je Sitzung liegen. Lag er unter
   einem festen Schluessel, sah ein Spieler in Sitzung B die Figur aus
   Sitzung A - und sobald er etwas anfasste, wurde sie dort unter dem
   Code von B gespeichert. Daten waeren zwischen Sitzungen ausgelaufen. */
function figurCacheKey(sid) { return 'kors_figur_' + (sid || SITZUNG_VORGABE); }

/* Einmalige Uebernahme: Bis September 2026 lag der lokale Stand unter
   dem festen Schluessel "kors_figur". Wer gerade mitten in einer Figur
   steckt, soll sie nicht verlieren, nur weil der Schluessel wandert.
   Firebase bleibt die Wahrheit - das hier rettet nur den Zwischenstand
   dessen, der offline weitergebaut hat. */
function figurCacheUebernehmen(sid) {
  try {
    var neu = figurCacheKey(sid);
    if (localStorage.getItem(neu)) return false;
    var alt = localStorage.getItem('kors_figur');
    if (!alt) return false;
    localStorage.setItem(neu, alt);
    localStorage.removeItem('kors_figur');
    return true;
  } catch (e) { return false; }
}
function figurCode(sid) {
  try { return localStorage.getItem(figurCodeKey(sid)) || ''; } catch (e) { return ''; }
}
/* Haelt fest, welche Figur dieser Browser bearbeitet. Seit der
   Schluessel der Spielername ist, wird hier nichts mehr normalisiert -
   der Wert ist entweder ein Schluessel oder ein alter Zufallscode,
   und beides soll unveraendert durchgehen. */
function setzeFigurCode(sid, code) {
  var c = String(code || '');
  try { localStorage.setItem(figurCodeKey(sid), c); } catch (e) {}
  return c;
}
function vergissFigurCode(sid) {
  try { localStorage.removeItem(figurCodeKey(sid)); } catch (e) {}
}

/* ==========================================================
   HOECHSTENS EINE FIGUR JE SPIELER UND SITZUNG
   ----------------------------------------------------------
   Die Verbindung "dieser Mensch -> diese Figur" lag bisher
   allein im localStorage (pnp_figur_{sid}). Auf einem zweiten
   Geraet war sie damit weg: Der Assistent fand keinen Code,
   erzeugte einen neuen - und derselbe Spieler hatte zwei
   Figuren in derselben Sitzung. Die Spielleitung sah dann
   "2 Figur(en)" bei einer Person.

   Deshalb traegt jede Figur jetzt ihren Besitzer:
       figuren/{code}.besitzer = spielerKennung(name)

   Der Name ist der Schluessel, weil er ueber Geraete hinweg
   stabil ist - der Spieler tippt ihn ja wieder ein. Die
   Browser-Kennung (pnp_player_id) waere dafuer untauglich,
   sie entsteht je Browser neu. Es ist dieselbe normalisierte
   Form, unter der ein Spieler schon in
   sitzungen/{sid}/spieler/{k} steht.

   BEWUSST am Figurenknoten und NICHT als eigener Pfad
   figurVon/{kennung}: Ein neuer Top-Level-Pfad muesste in
   SITZUNGS_PFADE *und* in firebase-rules.json stehen, und die
   Regeln muessen von Hand in der Konsole veroeffentlicht
   werden - bis dahin schlaegt jeder Schreibzugriff STILL fehl.
   So kommt die Regel ohne Regeländerung aus, und die Figur
   sagt von sich aus, wem sie gehoert.
   ========================================================== */
/* ==========================================================
   DER SCHLUESSEL IST NAME + SITZUNG
   ----------------------------------------------------------
   Seit Oktober 2026 liegt eine Figur unter
       sitzungen/{sid}/stand/figuren/{spielerKennung(name)}

   Damit ist "hoechstens eine Figur je Spieler und Sitzung"
   nicht mehr eine Regel, die der Code einhalten muss, sondern
   eine Eigenschaft des Pfades: An derselben Stelle kann keine
   zweite Figur liegen. Vorher war der Schluessel ein
   Zufallscode, und die Zuordnung zum Menschen hing am
   localStorage - auf einem zweiten Geraet entstand eine zweite
   Figur, und niemand merkte es.

   WELCHER Name: der Anmeldename aus dem Hub
   (localStorage.korsaren_playername, siehe js/identitaet.js) -
   NICHT das Feld "Spieler" im Assistenten. Das ist editierbar,
   und ein Tippfehler darin wuerde genau die zweite Figur
   erzeugen, die hier verhindert werden soll.

   Ohne Namen gibt es keinen Schluessel. Die Figurenseiten
   muessen diesen Fall abfangen, statt unter '' zu schreiben.
   ========================================================== */
function figurSchluessel(name) {
  return spielerKennung(name);
}

/* Liegt die Figur unter einem Schluessel, der kein Spielername
   ist, stammt sie aus der Zeit der Zufallscodes. Die
   Spielleitung soll sie zuordnen oder wegraeumen koennen -
   stillschweigend verschwinden darf sie nicht. */
function istAltSchluessel(schluessel) {
  var s = String(schluessel || '');
  if (!s) return false;
  // Ein Zufallscode ist genau FIGUR_LAENGE Zeichen aus dem
  // Crockford-Alphabet und enthaelt keinen Bindestrich.
  if (s.length !== FIGUR_LAENGE) return false;
  for (var i = 0; i < s.length; i++) {
    if (FIGUR_ALPHABET.indexOf(s.charAt(i)) < 0) return false;
  }
  return true;
}





/* ==========================================================
   IST DAS UEBERHAUPT EINE FIGUR?
   ----------------------------------------------------------
   Ein Knoten unter figuren/{name} heisst noch nicht, dass dort
   eine Figur liegt. Es kann eine leere Huelle sein - ein
   Datensatz mit Vorgabewerten und sonst nichts.

   Das ist im Oktober 2026 schmerzhaft aufgefallen: Der Assistent
   schrieb beim Oeffnen IMMER einmal hoch ("damit die Spielleitung
   von einer fertigen Figur erfaehrt"). Wer seine Figur loeschte,
   wurde zur Erschaffung weitergeleitet - und die legte im selben
   Moment eine leere Huelle an. Fuer den Hub sah das aus wie eine
   Figur: Die Heldenbrief-Kachel ging wieder auf, der Bogen
   oeffnete sich leer, und man konnte dieselbe Nicht-Figur erneut
   loeschen. Ein Kreis, aus dem man nicht herauskam.

   Geprueft wird deshalb auf INHALT, nicht auf Existenz. Bewusst
   ohne js/regelwerk.js: Diese Datei kennt die Regeln nicht und
   soll sie nicht kennen muessen. Eine frische Figur hat alle
   Attribute auf 1 (d4) und fuenf Kernfertigkeiten auf 1 - alles
   darueber ist eine Entscheidung, die jemand getroffen hat.
   ========================================================== */
function istFigurEcht(roh) {
  if (!roh || typeof roh !== 'object') return false;

  if (String(roh.name || '').trim()) return true;
  if (laenge(roh.tal) || laenge(roh.hnd) || laenge(roh.ausr)) return true;
  if (+roh.steigerungen > 0 || +roh.rang > 0) return true;
  if (+roh.wunden > 0 || roh.angeschlagen) return true;
  if (String(roh.notizen || '').trim()) return true;
  if (roh.brief && Object.keys(roh.brief).some(function (k) {
    return String(roh.brief[k] || '').trim();
  })) return true;
  // Etwas gesteigert? Vorgabe ist ueberall 1.
  if (ueberVorgabe(roh.attr) || ueberVorgabe(roh.fert)) return true;
  return false;

  function laenge(x) {
    if (!x) return 0;
    return Array.isArray(x) ? x.length : Object.keys(x).length;
  }
  function ueberVorgabe(o) {
    if (!o || typeof o !== 'object') return false;
    return Object.keys(o).some(function (k) { return +o[k] > 1; });
  }
}

/* ==========================================================
   EINE FIGUR LOESCHEN
   ----------------------------------------------------------
   Haengt hier und nicht in den Seiten, weil es drei Stellen
   sind und das Vergessen EINER davon den Loeschvorgang
   rueckgaengig macht:

     1. der Knoten in der Datenbank
     2. der lokale Rueckfall  (kors_figur_{sid})
     3. der gemerkte Schluessel (pnp_figur_{sid})

   Bleibt (2) stehen, liest die Seite beim naechsten Oeffnen den
   alten Stand und schreibt ihn zurueck - die Figur waere wieder
   da, und der Spieler haette keine Ahnung, warum.

   Reihenfolge: ERST lokal, DANN die Datenbank. Bricht es
   dazwischen ab, ist die Figur in der Datenbank noch da und nur
   dieser Browser hat sie vergessen. Das ist der harmlosere der
   beiden halben Zustaende - andersherum waere sie weg und der
   Browser schriebe sie aus dem Rueckfall wieder hoch.

   Das Loeschen selbst ist NICHT rueckholbar und es gibt kein
   Backup. Die Rueckfrage gehoert in die Seite, nicht hierher -
   diese Funktion tut, was man ihr sagt.
   ========================================================== */
function figurLoeschen(db, sid, schluessel, fertig) {
  fertig = fertig || function () {};
  if (!schluessel) { fertig(new Error('kein Schlüssel')); return; }
  try { localStorage.removeItem(figurCacheKey(sid)); } catch (e) {}
  vergissFigurCode(sid);
  if (!db) { fertig(null); return; }
  db.ref('figuren/' + schluessel).remove()
    .then(function () { fertig(null); })
    .catch(function (e) { fertig(e || new Error('Löschen fehlgeschlagen')); });
}

/* ==========================================================
   UMZUG EINER ALTEN FIGUR
   ----------------------------------------------------------
   Bis Oktober 2026 lag eine Figur unter einem Zufallscode, den
   nur der Browser kannte. Dieser Code ist der einzige Faden zu
   ihr - geht er verloren, ist die Figur fuer ihren Spieler weg.
   Deshalb zieht sie beim ersten Oeffnen unter den Namen um.

   Reihenfolge ist Absicht: ERST schreiben, DANN loeschen.
   Bricht es dazwischen ab, steht die Figur zweimal da - sichtbar,
   und die Spielleitung kann aufraeumen. Andersherum waere sie weg.

   Liegt unter dem Namen schon etwas, wird NICHTS angefasst: Die
   Figur am Namen ist die gueltige, und sie zu ueberschreiben
   waere genau der Datenverlust, den wir vermeiden wollen.

   Haengt hier, weil Assistent UND Heldenbrief sie brauchen -
   zwei Kopien dieser Reihenfolge wuerden auseinanderlaufen, und
   ein Fehler darin kostet eine Figur.
   ========================================================== */
function figurUmzug(db, sid, schluessel, fertig) {
  fertig = fertig || function () {};
  var alt = figurCode(sid);
  if (!db || !schluessel || !alt || alt === schluessel) { fertig(null); return; }

  db.ref('figuren/' + schluessel).once('value').then(function (s) {
    if (s.val()) { vergissFigurCode(sid); fertig(null); return; }
    return db.ref('figuren/' + alt).once('value').then(function (a) {
      var roh = a.val();
      if (!roh) { vergissFigurCode(sid); fertig(null); return; }
      var kopie = {};
      Object.keys(roh).forEach(function (k) { kopie[k] = roh[k]; });
      kopie.umgezogenVon = alt;
      return db.ref('figuren/' + schluessel).update(kopie).then(function () {
        // Erst jetzt, wo die Figur sicher unter dem Namen liegt.
        return db.ref('figuren/' + alt).remove().catch(function () {
          // Bleibt sie stehen, ist das unschoen, aber nicht schlimm:
          // die Regie zeigt sie als alte Figur an.
        });
      }).then(function () {
        vergissFigurCode(sid);
        fertig(roh);
      });
    });
  }).catch(function () { fertig(null); });
}



if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SITZUNG_VORGABE, SITZUNG_ZEIGER, SITZUNG_WURZEL, SPIEL_WURZEL,
    SITZUNG_CACHE_KEY, SITZUNG_FEST_KEY, SITZUNGS_PFADE,
    sitzungFest, setzeSitzungFest, loeseSitzung, sitzungAusAdresse,
    hatSitzung, sitzungBeitreten, beobachteFreigabe, sitzungsSperre,
    istSitzungsPfad, sitzungsPfad, sitzungsDatenbank,
    FIGUR_ALPHABET, FIGUR_LAENGE,
    figurCodeLesbar, figurCodeKey, figurCode,
    setzeFigurCode, vergissFigurCode, spielerKennung,
    figurSchluessel, istAltSchluessel, figurUmzug, figurLoeschen, istFigurEcht,
    figurCacheKey, figurCacheUebernehmen,
    sitzungAusCache, sitzungInCache, sitzungsDbJetzt
  };
}
