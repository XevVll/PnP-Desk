// Generisches Erkundungs-Graph-System: eine verdeckte Knoten-/Kanten-
// Struktur für Szenen mit freier Erkundung (erste Nutzung: Riffinsel,
// "11.1"). Spieler sehen den Graph selbst nie, nur Situationstexte und - an
// Entscheidungspunkten - eine Auswahl an Kanten mit kurzem Sinneshinweis
// (Design-Regel 2.8: Ort-/Sinnesinfo, keine Vorwegnahme, was am Ende
// wartet). Live-Zustand (aktueller Knoten, Stimmen) liegt in Firebase unter
// graphState/{sceneId} - siehe js/regie_vault.js (Adminpanel-Seite,
// schreibt currentNode) und karte.html (Spieleransicht, schreibt Stimmen
// unter demselben mySessionId-Muster wie openMarkers, Bibel 13.9).
//
// Knoten-Typen (seit 2026-08-21 vereinfacht: Hendriks Referenz-Skizze kennt
// nur zwei Kategorien, "grün" = Aufgabe und "blau" = echter Ort - eine
// dritte Kategorie "Gabelung ohne Aufgabe" gibt es dort nicht):
//   "start"     - Startpunkt, keine Probe. Zeigt seine "edges" sofort als
//                 wählbare Optionen (SL-Klick navigiert direkt).
//   "ereignis"  - EIN grüner Punkt: kurzer Zwischenstopp mit einer ECHTEN
//                 Probe (Felder: probe, text, erfolgText/misserfolgText -
//                 SL-Referenz zum Vorlesen je nach Wurf, Misserfolg bewusst
//                 leicht, meist 1 Schaden oder rein folgenlos, nie ein
//                 hartes Fehlschlag-Ende) UND zugleich normaler
//                 Entscheidungspunkt - hat der Knoten mehrere "edges",
//                 werden die nach der Probe ganz normal als Wahl-Optionen
//                 gezeigt (kein separater "Gabelung"-Typ mehr nötig).
//   "ort"       - aufdeckbare Fundstelle, verknüpft mit einer Marker-ID
//                 (ortId). Wird eine Kante GEZIELT auf einen "ort"-Knoten
//                 im Adminpanel angeklickt, erscheint dort eine Erfolg/
//                 Misserfolg-Auflösung (Feld "probe") statt direkter
//                 Navigation - Erfolg setzt currentNode auf diesen Knoten
//                 UND blendet den verknüpften Marker via hiddenMarkersLive
//                 sichtbar; Misserfolg belässt currentNode am Ausgangs-
//                 knoten (Konsequenztext, kein Abbruch, jederzeit erneut
//                 versuchbar). Einmal erreicht, verhält sich ein "ort"-
//                 Knoten wie eine "gabelung" (eigene "edges" für die
//                 Weiter-Erkundung).
//
// Kanten-Objekt: { from, to, hinweis } - "hinweis" ist der Sinneseindruck,
// den Spieler an einem Entscheidungsknoten für GENAU DIESE Kante sehen.
const EXPLORATION_GRAPHS = {
  "11.1": {
    startNode: "start",
    nodes: {
      // top/left (%) auf das echte Referenzbild abgestimmt (images/
      // riffinsel.webp, seit 2026-08-21) - Landmasse liegt darin ungefähr
      // zwischen 40-95% (links-rechts) und 15-65% (oben-unten), siehe
      // Marker-Koordinaten in riffinsel_scenes.js. Augenmaß, bei Bedarf
      // feinjustieren.
      // ACHTUNG (2026-08-21): Positionen/Kanten unten sind Claudes bestmögliche
      // Ableitung aus Hendriks handgezeichneter Referenz-Skizze auf dem echten
      // Kartenbild (viele kreuzende Linien) - nicht pixelgenau garantiert.
      // Mit dem Debug-Overlay (karte.html ohne ?erkundungHideDebug) gegen die
      // Skizze gegenprüfen und bei Abweichungen Koordinaten/Kanten anpassen.
      start: { type: "start", label: "Aufbruch vom Riffstrand", top: 46, left: 52 },

      ereignis_moskitos: {
        type: "ereignis", label: "Ein Mückenschwarm", top: 42, left: 56,
        probe: "Körper",
        text: "Ein dichter Schwarm Mücken empfängt jeden, der hier durchmuss.",
        erfolgText: "Mit ein paar schnellen, genervten Schlägen kommt man halbwegs unzerstochen durch.",
        misserfolgText: "Dutzende Stiche später ist die Haut gerötet und juckt fürchterlich — 1 Schadenspunkt."
      },
      ereignis_schlamm: {
        type: "ereignis", label: "Schlammiger Boden", top: 48, left: 58,
        probe: "Geschick",
        text: "Der Boden wird hier plötzlich weich und schlammig, jeder Schritt ein Risiko wegzurutschen.",
        erfolgText: "Sicher hindurchbalanciert.",
        misserfolgText: "Ausgerutscht, bis zu den Knien im Schlamm — nichts Ernstes, nur unangenehm und nass, kein Schaden."
      },
      ereignis_fussspuren: {
        type: "ereignis", label: "Ungewöhnliche Fußspuren", top: 30, left: 48,
        probe: "Wahrnehmung",
        text: "Ungewöhnliche Fußspuren im weichen Boden, deutlich zu groß für einen Menschen, ziehen sich ein Stück neben dem Pfad her und verschwinden wieder im Dickicht.",
        erfolgText: "Wer genau hinsieht, erkennt weitere Details an den Spuren — ohne dass sich daraus sofort eine Erklärung ergibt (SL-Ermessen, z. B. als späterer Anknüpfungspunkt nutzbar).",
        misserfolgText: "Die Spuren bleiben ein flüchtiger Eindruck, mehr nicht — folgenlos, kein Schaden."
      },
      ereignis_ridge: {
        type: "ereignis", label: "Ein rutschiger Felsvorsprung", top: 26, left: 52,
        probe: "Klettern",
        text: "Nasses, moosbewachsenes Gestein versperrt den direkten Weg — nur mit sicherem Tritt kommt man ohne Umweg daran vorbei.",
        erfolgText: "Sicherer Tritt, kein Problem.",
        misserfolgText: "Ein Ausrutscher, kurz auf allen Vieren — 1 Schadenspunkt."
      },
      ereignis_dornen: {
        type: "ereignis", label: "Dichtes Dornengestrüpp", top: 27, left: 60,
        probe: "Körper",
        text: "Ein Gestrüpp aus dornigen Ranken blockiert den Pfad, dicht genug, dass ein Umweg mühsam wäre.",
        erfolgText: "Mit kräftigen Schlägen wird ein Weg hindurch freigeschlagen.",
        misserfolgText: "Ein paar tiefe Kratzer beim Durchkämpfen — 1 Schadenspunkt."
      },
      ereignis_wind: {
        type: "ereignis", label: "Böiger Wind auf dem Grat", top: 26, left: 67,
        probe: "Körper",
        text: "Der Wind auf dem schmalen Grat nimmt merklich zu, reißt an Kleidung und Haaren.",
        erfolgText: "Sicherer Tritt, der Grat wird ohne Zwischenfall überquert.",
        misserfolgText: "Eine Böe erwischt einen ungünstig — kurz der Halt verloren, abgerutscht. 1 Schadenspunkt."
      },
      ereignis_hub: {
        type: "ereignis", label: "Ein enger Durchschlupf", top: 39, left: 62,
        probe: "Geschick",
        text: "Zwischen zwei moosüberwachsenen Felsblöcken bleibt nur ein schmaler Spalt, gerade breit genug für eine Person.",
        erfolgText: "Geschmeidig hindurchgezwängt, kein Problem.",
        misserfolgText: "Stecken geblieben, mit Mühe und einer schmerzhaften Schramme wieder frei — 1 Schadenspunkt."
      },
      ereignis_krabben: {
        type: "ereignis", label: "Ein Krabbenschwarm", top: 52, left: 65,
        probe: "Geschick",
        text: "Dutzende kleine Landkrabben stieben in alle Richtungen auseinander, als die Gruppe hier vorbeikommt.",
        erfolgText: "Ein Ausweichschritt, keine einzige wird getreten.",
        misserfolgText: "Ein unangenehmer Tritt auf einen Panzer, ein spitzer Zwick zur Antwort — 1 Schadenspunkt, nichts Ernstes."
      },
      ereignis_lianen: {
        type: "ereignis", label: "Herabhängende Lianen", top: 53, left: 69,
        probe: "Geschick",
        text: "Dichte, herabhängende Lianen und Luftwurzeln versperren fast den Blick auf den Weg.",
        erfolgText: "Beiseite geschoben, freie Sicht.",
        misserfolgText: "In den Ranken verheddert, ein kurzer Kampf, um wieder frei zu kommen — 1 Schadenspunkt."
      },

      suesswasserquelle: {
        type: "ort", label: "Die Süßwasserquelle", ortId: "suesswasserquelle",
        probe: "Instinkt/Survival",
        erfolgText: "Ein Gespür dafür, wo im dichten Gelände Wasser zu finden ist, führt direkt zur Quelle.",
        misserfolgText: "Zeit verloren, dazu ein kleiner Schaden — übles, brackiges Wasser probiert. Ein zweiter Versuch ist jederzeit möglich."
      },
      wrackteile: {
        type: "ort", label: "Wrackteile am Riff", ortId: "wrackteile",
        probe: "Klettern/Körper",
        erfolgText: "Über scharfes, nasses Riffgestein hinweg werden die Wrackteile erreicht.",
        misserfolgText: "Zeit verloren, dazu ein kleiner Schaden — Schnittwunde am Riffgestein. Ein zweiter Versuch ist jederzeit möglich."
      },
      aussichtsklippe: {
        type: "ort", label: "Die Aussichtsklippe", ortId: "aussichtsklippe",
        probe: "Klettern",
        erfolgText: "Die Klippe wird erklommen.",
        misserfolgText: "Zeit verloren, dazu ein kleiner Schaden — abgerutscht. Ein zweiter Versuch ist jederzeit möglich."
      },
      versteckte_grotte: {
        type: "ort", label: "Die versteckte Grotte", ortId: "versteckte_grotte",
        probe: "Wahrnehmung",
        erfolgText: "Der gut versteckte Spalt im Fels wird bemerkt.",
        misserfolgText: "Bewusst folgenlos — der Eingang wird einfach übersehen, kein Schaden. Jederzeit ein zweiter Versuch."
      }
    },
    // Alle vier "ort"-Knoten sind in Hendriks Skizze Sackgassen (keine
    // ausgehende Kante) - einmal gefunden, ist diese Fundstelle für diesen
    // Erkundungsdurchgang abgeschlossen, die Gruppe muss zurück (Zurück-
    // Option) oder woanders weitermachen.
    edges: {
      e_start_moskitos: { from: "start", to: "ereignis_moskitos", hinweis: "Ein Sumpf aus feuchter Erde und Mückensummen liegt geradeaus." },
      e_start_schlamm: { from: "start", to: "ereignis_schlamm", hinweis: "Ein zweiter Pfad führt tiefer ins Dickicht, der Boden wirkt hier schon aufgeweicht." },

      e_moskitos_quelle: { from: "ereignis_moskitos", to: "suesswasserquelle", hinweis: "Kurz dahinter plätschert Wasser." },
      e_moskitos_fussspuren: { from: "ereignis_moskitos", to: "ereignis_fussspuren", hinweis: "Ein kaum sichtbarer Abzweig verschwindet zwischen dichten Farnen." },
      e_moskitos_hub: { from: "ereignis_moskitos", to: "ereignis_hub", hinweis: "Der Pfad führt weiter zwischen engstehenden Felsblöcken." },

      e_fussspuren_ridge: { from: "ereignis_fussspuren", to: "ereignis_ridge", hinweis: "Die Spur führt bergauf, über nasses, moosbewachsenes Gestein." },
      e_ridge_dornen: { from: "ereignis_ridge", to: "ereignis_dornen", hinweis: "Dahinter wird der Weg von dichtem Gestrüpp gesäumt." },
      e_dornen_wind: { from: "ereignis_dornen", to: "ereignis_wind", hinweis: "Ein schmaler Grat zieht sich weiter Richtung offener Klippe." },
      e_dornen_hub: { from: "ereignis_dornen", to: "ereignis_hub", hinweis: "Ein zweiter, tieferer Pfad führt bergab." },
      e_wind_klippe: { from: "ereignis_wind", to: "aussichtsklippe", hinweis: "Der Grat mündet in einen freien Felsvorsprung." },

      e_hub_wind: { from: "ereignis_hub", to: "ereignis_wind", hinweis: "Steil bergauf, dem Wind entgegen." },
      e_hub_schlamm: { from: "ereignis_hub", to: "ereignis_schlamm", hinweis: "Der Boden wird merklich weicher." },
      e_hub_krabben: { from: "ereignis_hub", to: "ereignis_krabben", hinweis: "Der Pfad führt weiter Richtung Küste, das Rauschen des Riffs wird lauter." },

      e_schlamm_krabben: { from: "ereignis_schlamm", to: "ereignis_krabben", hinweis: "Festerer Boden kündigt sich in der Ferne an." },

      e_krabben_grotte: { from: "ereignis_krabben", to: "versteckte_grotte", hinweis: "Ein unauffälliger Trampelpfad führt Richtung eines dichten Wurzelvorhangs." },
      e_krabben_wrackteile: { from: "ereignis_krabben", to: "wrackteile", hinweis: "Große, scharfkantige Felsbrocken versperren fast den Weg zum Wasser." },
      e_krabben_lianen: { from: "ereignis_krabben", to: "ereignis_lianen", hinweis: "Ein von Lianen überwucherter Seitenpfad zweigt ab." },

      e_lianen_grotte: { from: "ereignis_lianen", to: "versteckte_grotte", hinweis: "Direkt dahinter öffnet sich ein schmaler Spalt im Fels." }
    }
  }
};

function getExplorationGraph(sceneId) {
  return (typeof EXPLORATION_GRAPHS !== 'undefined' && EXPLORATION_GRAPHS[sceneId]) ? EXPLORATION_GRAPHS[sceneId] : null;
}

function getGraphNode(sceneId, nodeId) {
  const g = getExplorationGraph(sceneId);
  return (g && g.nodes[nodeId]) ? Object.assign({ id: nodeId }, g.nodes[nodeId]) : null;
}

// Bildschirm-Position (top/left in %, wie bei Markern) für einen Knoten -
// entweder direkt am Knoten hinterlegt (start/gabelung/ereignis) oder, bei
// "ort"-Knoten, vom verknüpften Marker übernommen (kein Duplizieren der
// Koordinate - wird der Marker später verschoben, zieht die Positions-
// Markierung automatisch mit). getMarkersFn wird als Parameter übergeben,
// da karte.html/regie.html je eine eigene getMarkersForScene()-Funktion
// mitbringen (unterschiedliche Implementierung, gleiche Signatur).
function getGraphNodePosition(sceneId, nodeId, getMarkersFn) {
  const node = getGraphNode(sceneId, nodeId);
  if (!node) return null;
  if (typeof node.top === 'number' && typeof node.left === 'number') return { top: node.top, left: node.left };
  if (node.ortId && typeof getMarkersFn === 'function') {
    const markers = getMarkersFn(sceneId) || [];
    const marker = markers.find(function (m) { return m.id === node.ortId; });
    if (marker) return { top: marker.top, left: marker.left };
  }
  return null;
}

// Ausgehende Kanten eines Knotens, als Array von { id, from, to, hinweis }.
// "edges" ist bewusst NICHT am Knoten selbst gepflegt (Fehlerquelle bei
// manuellem Doppel-Eintragen), sondern wird hier aus dem Kanten-Objekt
// der Szene abgeleitet, indem nach from === nodeId gefiltert wird.
function getOutgoingEdges(sceneId, nodeId) {
  const g = getExplorationGraph(sceneId);
  if (!g) return [];
  return Object.keys(g.edges)
    .filter(function (edgeId) { return g.edges[edgeId].from === nodeId; })
    .map(function (edgeId) { return Object.assign({ id: edgeId }, g.edges[edgeId]); });
}

// Hendriks Vorgabe: Spieler sollen IMMER auch umkehren können, selbst wenn
// dafür keine echte Kante im Graphen modelliert wurde. "history" ist die
// Liste bereits besuchter Knoten-IDs aus graphState/{sceneId}/history
// (siehe js/regie_vault.js, graphAdvance/graphGoBack) - ist sie nicht leer,
// wird eine synthetische Zurück-Option angehängt, die zum jeweils letzten
// Eintrag führt. Kein Fund-/Probe-Gate beim Zurückgehen (man war ja schon
// dort). Wird sowohl von karte.html (Pfeil) als auch regie.html (Panel)
// genutzt, damit beide Seiten dieselbe Options-Liste sehen.
const BACK_EDGE_ID = '__back__';
function getPlayableOptions(sceneId, nodeId, history) {
  const edges = getOutgoingEdges(sceneId, nodeId);
  if (history && history.length) {
    edges.push({ id: BACK_EDGE_ID, to: history[history.length - 1], hinweis: 'Zurück, den Weg zurückverfolgen.', isBack: true });
  }
  return edges;
}
