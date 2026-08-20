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
// Knoten-Typen:
//   "start"     - Startpunkt, keine Probe. Zeigt seine "edges" sofort als
//                 wählbare Optionen (SL-Klick navigiert direkt).
//   "gabelung"  - reiner Entscheidungspunkt, gleiches Verhalten wie "start".
//   "ereignis"  - kurzer Zwischenstopp (Würfelprobe/Text), GENAU EINE
//                 ausgehende Kante, kein echter Entscheidungspunkt. Felder:
//                 probe (String, z.B. "Körper"), text (Stimmungstext/
//                 leichte Komplikation, kein hartes Fehlschlag-Ende).
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
      start: { type: "start", label: "Aufbruch vom Riffstrand" },
      weg_nord: { type: "gabelung", label: "Der nördliche Pfad" },
      weg_sued: { type: "gabelung", label: "Der südliche Weg" },
      lichtung: { type: "gabelung", label: "Eine Lichtung im Inselinneren" },

      ereignis_moskitos: {
        type: "ereignis", label: "Ein Mückenschwarm",
        probe: "Körper (optional)",
        text: "Ein Schwarm Mücken empfängt jeden, der hier durchmuss — lästig, aber harmlos. Wer will, kann eine Körper-Probe versuchen, um halbwegs unzerstochen durchzukommen; zwingend ist das nicht."
      },
      ereignis_fussspuren: {
        type: "ereignis", label: "Ungewöhnliche Fußspuren",
        probe: "Wahrnehmung (optional)",
        text: "Ungewöhnliche Fußspuren im weichen Boden, deutlich zu groß für einen Menschen, ziehen sich ein Stück neben dem Pfad her und verschwinden wieder im Dickicht. Wer genau hinsieht (Wahrnehmung, optional), erkennt weitere Details — ohne dass sich daraus sofort eine Erklärung ergibt."
      },
      ereignis_wind: {
        type: "ereignis", label: "Böiger Wind auf dem Grat",
        probe: "Körper (optional)",
        text: "Der Wind auf dem schmalen Grat nimmt merklich zu, reißt an Kleidung und Haaren. Eine Körper-Probe (optional) hält den Tritt sicher — zwingend ist auch das nicht, nur unangenehm ohne."
      },
      ereignis_krabben: {
        type: "ereignis", label: "Ein Krabbenschwarm",
        text: "Dutzende kleine Landkrabben stieben in alle Richtungen auseinander, als die Gruppe hier vorbeikommt — ein kurzer, harmloser Moment."
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
    edges: {
      e_start_nord: { from: "start", to: "weg_nord", hinweis: "Ein schmaler Trampelpfad verschwindet feucht und schattig im dichten Grün." },
      e_start_sued: { from: "start", to: "weg_sued", hinweis: "Ein heller Streifen aus Sand und Geröll zieht sich am Fuß der Felsen entlang." },

      e_nord_moskitos: { from: "weg_nord", to: "ereignis_moskitos", hinweis: "Der Pfad steigt steil an, zwischen moosbewachsenen Steinen." },
      e_nord_fussspuren: { from: "weg_nord", to: "ereignis_fussspuren", hinweis: "Ein kaum sichtbarer Abzweig verschwindet zwischen dichten Farnen." },

      e_sued_wrackteile: { from: "weg_sued", to: "wrackteile", hinweis: "Große, scharfkantige Felsbrocken versperren fast den Weg zum Wasser." },
      e_sued_wind: { from: "weg_sued", to: "ereignis_wind", hinweis: "Ein schmaler Grat führt steil nach oben, dem Wind ausgesetzt." },

      e_moskitos_quelle: { from: "ereignis_moskitos", to: "suesswasserquelle", hinweis: "Kurz dahinter plätschert Wasser." },
      e_fussspuren_grotte: { from: "ereignis_fussspuren", to: "versteckte_grotte", hinweis: "Die Spur endet vor einem Vorhang aus Luftwurzeln." },
      e_wind_klippe: { from: "ereignis_wind", to: "aussichtsklippe", hinweis: "Der Grat mündet in einen freien Felsvorsprung." },

      e_quelle_lichtung: { from: "suesswasserquelle", to: "lichtung", hinweis: "Von der Quelle aus schlängelt sich ein weiterer Pfad tiefer ins Inselinnere." },
      e_wrackteile_lichtung: { from: "wrackteile", to: "lichtung", hinweis: "Von den Wrackteilen aus führt ein trittsicherer Pfad weiter landeinwärts." },
      e_grotte_lichtung: { from: "versteckte_grotte", to: "lichtung", hinweis: "Ein unauffälliger Trampelpfad führt von der Grotte aus weiter." },

      e_lichtung_krabben: { from: "lichtung", to: "ereignis_krabben", hinweis: "Ein raschelnder Pfad zwischen freiliegenden Wurzeln führt weiter." },
      e_lichtung_grotte: { from: "lichtung", to: "versteckte_grotte", hinweis: "Ein zweiter Weg zweigt Richtung dichterem Unterholz ab." },
      e_lichtung_klippe: { from: "lichtung", to: "aussichtsklippe", hinweis: "Der Pfad steigt an, das Rauschen des Windes wird lauter." },

      e_krabben_wrackteile: { from: "ereignis_krabben", to: "wrackteile", hinweis: "Dahinter lichtet sich das Grün, das Riff kommt in Sicht." }
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
