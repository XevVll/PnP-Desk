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
//                 (ortId). Gibt die SL die Bewegung dorthin frei, wird der
//                 verknüpfte Marker automatisch über hiddenMarkersLive
//                 sichtbar geschaltet. Die Felder probe/erfolgText/
//                 misserfolgText sind seit 2026-08-22 reine SL-Referenz
//                 zum Vorlesen - sie BLOCKIEREN die Bewegung nicht mehr
//                 (Hendriks Vorgabe: die SL gibt jede Bewegung ohnehin von
//                 Hand frei, ein Wurf soll sie nie verhindern). Ansonsten
//                 verhält sich ein "ort"-Knoten wie jeder andere Knoten
//                 mit eigenen "edges" für die Weiter-Erkundung.
//
// Kanten-Objekt: { from, to, hinweis } - "hinweis" ist der Sinneseindruck,
// den Spieler an einem Entscheidungsknoten für GENAU DIESE Kante sehen.
//
// STILREGEL für "hinweis" (Hendriks Vorgabe, 2026-08-22): rein beschreiben,
// wie der Weg AUSSIEHT/sich anfühlt - keine Wertung und keine Einordnung
// relativ zum bisherigen Weg. Also kein "führt zurück", kein "weiter",
// kein "ein zweiter Abzweig". Grund: der Graph ist vollständig beidseitig,
// jeder Knoten also über mehrere Routen erreichbar - ein "führt zurück
// Richtung Küste" erscheint dadurch auch Spielern, die nie an der Küste
// waren, und behauptet etwas Falsches über ihren Weg. Eine reine
// Ortsbeschreibung stimmt dagegen immer, egal woher die Gruppe kommt
// (verwandt mit Design-Regel 2.8 der Bibel).
// Riffinsel-Graph (11.1) seit 2026-08-21 von Hendrik selbst mit
// graph_editor.html direkt auf dem echten Kartenbild gebaut (löst Claudes
// vorherige Best-Effort-Ableitung aus der handgezeichneten Skizze ab, die
// naturgemäß nicht ganz exakt war). Knoten-IDs/Positionen/Kanten sind
// Hendriks Original - Texte/Proben/Sinneshinweise wurden danach im Dialog
// ausformuliert (Claude-Aufschlag, von Hendrik freizugeben), siehe CLAUDE.md.
const EXPLORATION_GRAPHS = {
  "11.1": {
    startNode: "strand",
    nodes: {
      strand: { type: "start", label: "Strand", top: 56.4, left: 54.2 },

      zwischenpunkt1: {
        type: "ereignis", label: "Ein Krabbenschwarm", top: 56.1, left: 65.6,
        probe: "Geschick",
        text: "Dutzende kleine Landkrabben stieben in alle Richtungen auseinander, als die Gruppe hier vorbeikommt.",
        erfolgText: "Ein Ausweichschritt, keine einzige wird getreten.",
        misserfolgText: "Ein unangenehmer Tritt auf einen Panzer, ein spitzer Zwick zur Antwort — 1 Schadenspunkt, nichts Ernstes."
      },
      // Vorausdeutung auf den Abbruch der Erkundung (ORTE.riffstrand, "Die
      // Affen greifen an"). Bis 2026-08-22 waren das menschengroße Fußspuren
      // als Hinweis auf feindliche Ureinwohner - die sind durch die Affen
      // ersetzt worden, der Hinweis wurde entsprechend angepasst.
      zp1l: {
        type: "ereignis", label: "Ungewöhnliche Abdrücke", top: 45.5, left: 59.4,
        probe: "Wahrnehmung",
        text: "Abdrücke im weichen Boden, die aussehen wie kleine Hände, ziehen sich ein Stück neben dem Pfad her und verschwinden wieder im Dickicht — zu viele, um von einem einzelnen Tier zu stammen.",
        erfolgText: "Wer genau hinsieht, erkennt: die Abdrücke sind frisch, und einige enden nicht am Wegrand, sondern setzen an den Stämmen wieder an (SL-Ermessen, als spätere Vorwarnung nutzbar).",
        misserfolgText: "Die Abdrücke bleiben ein flüchtiger Eindruck, mehr nicht — folgenlos, kein Schaden."
      },
      zwischenpunkt2: {
        type: "ereignis", label: "Herabhängende Lianen", top: 51.3, left: 69.9,
        probe: "Geschick",
        text: "Dichte, herabhängende Lianen und Luftwurzeln versperren fast den Blick auf den Weg.",
        erfolgText: "Beiseite geschoben, freie Sicht.",
        misserfolgText: "In den Ranken verheddert, ein kurzer Kampf, um wieder frei zu kommen — 1 Schadenspunkt."
      },
      zp3: {
        type: "ereignis", label: "Dichtes Dornengestrüpp", top: 41.8, left: 70.8,
        probe: "Körper",
        text: "Ein Gestrüpp aus dornigen Ranken blockiert den Pfad, dicht genug, dass ein Umweg mühsam wäre.",
        erfolgText: "Mit kräftigen Schlägen wird ein Weg hindurch freigeschlagen.",
        misserfolgText: "Ein paar tiefe Kratzer beim Durchkämpfen — 1 Schadenspunkt."
      },
      zp: {
        type: "ereignis", label: "Böiger Wind auf dem Grat", top: 30.1, left: 67.9,
        probe: "Körper",
        text: "Der Wind auf dem schmalen Grat nimmt merklich zu, reißt an Kleidung und Haaren.",
        erfolgText: "Sicherer Tritt, der Grat wird ohne Zwischenfall überquert.",
        misserfolgText: "Eine Böe erwischt einen ungünstig — kurz der Halt verloren, abgerutscht. 1 Schadenspunkt."
      },
      zp_2: {
        type: "ereignis", label: "Ein enger Durchschlupf", top: 46.3, left: 65.5,
        probe: "Geschick",
        text: "Zwischen zwei moosüberwachsenen Felsblöcken bleibt nur ein schmaler Spalt, gerade breit genug für eine Person.",
        erfolgText: "Geschmeidig hindurchgezwängt, kein Problem.",
        misserfolgText: "Stecken geblieben, mit Mühe und einer schmerzhaften Schramme wieder frei — 1 Schadenspunkt."
      },
      zp_3: {
        type: "ereignis", label: "Ein rutschiger Felsvorsprung", top: 31, left: 61,
        probe: "Klettern",
        text: "Nasses, moosbewachsenes Gestein versperrt den direkten Weg — nur mit sicherem Tritt kommt man ohne Umweg daran vorbei.",
        erfolgText: "Sicherer Tritt, kein Problem.",
        misserfolgText: "Ein Ausrutscher, kurz auf allen Vieren — 1 Schadenspunkt."
      },
      zp_4: {
        type: "ereignis", label: "Schlammiger Boden", top: 27.6, left: 53.6,
        probe: "Geschick",
        text: "Der Boden wird hier plötzlich weich und schlammig, jeder Schritt ein Risiko wegzurutschen.",
        erfolgText: "Sicher hindurchbalanciert.",
        misserfolgText: "Ausgerutscht, bis zu den Knien im Schlamm — nichts Ernstes, nur unangenehm und nass, kein Schaden."
      },
      zp_5: {
        type: "ereignis", label: "Zirpen aus dem Unterholz", top: 33.2, left: 44.4,
        probe: "Wahrnehmung",
        text: "Ein durchdringendes, rhythmisches Zirpen kommt aus dem dichten Unterholz — laut genug, dass ein einzelnes Insekt es kaum sein kann.",
        erfolgText: "Ein kurzer, aufmerksamer Blick genügt, um die Quelle als harmlosen Schwarm Zikaden auszumachen — kein Grund zur Sorge.",
        misserfolgText: "Die Quelle bleibt unklar — ein mulmiges Gefühl bleibt zurück, aber folgenlos, kein Schaden."
      },
      zp_6: {
        type: "ereignis", label: "Ein Mückenschwarm", top: 41.5, left: 53.3,
        probe: "Körper",
        text: "Ein dichter Schwarm Mücken empfängt jeden, der hier durchmuss.",
        erfolgText: "Mit ein paar schnellen, genervten Schlägen kommt man halbwegs unzerstochen durch.",
        misserfolgText: "Dutzende Stiche später ist die Haut gerötet und juckt fürchterlich — 1 Schadenspunkt."
      },

      wrack: {
        type: "ort", label: "Wrackteile am Riff", ortId: "wrackteile",
        probe: "Klettern/Körper",
        erfolgText: "Über scharfes, nasses Riffgestein hinweg werden die Wrackteile erreicht.",
        misserfolgText: "Zeit verloren, dazu ein kleiner Schaden — Schnittwunde am Riffgestein. Ein zweiter Versuch ist jederzeit möglich."
      },
      // Hendriks Rätsel (2026-08-22), Text von ihm. "probe: Int" bezieht sich
      // auf das Rätsel, nicht mehr aufs Finden des Spalts - die Bewegung
      // hierher ist ohnehin nicht mehr probengebunden (siehe 4.2 im Handbuch).
      // Ausführliche SL-Fassung inkl. Auflösung: ORTE.versteckte_grotte,
      // Interaktion "das_raetsel_der_kiste" (js/regie.js).
      versteckte_grotte: {
        type: "ort", label: "Die versteckte Grotte", ortId: "versteckte_grotte",
        probe: "Int",
        erfolgText: "Rätsel:\nEine Steinplatte mit Symbolen. Wenn diese vom Spieler mit einem Inwurf begutachtet wird, erhält dieser Spieler folgenden Text:\nIn Ringen aus Nacht, die Sonne wohnt,\nein anderer als ich, das Wasser meidet.\nKnack ich den Schädel ungeschont,\nkein Laut der durch die Stille schneidet.\nAlleine wachend zum Licht gebracht,\nHerrscher der Welt unter bei Nacht.\n\nSymbole:\nRing Nacht Sonne\nFamilie Wasser X\nKaputter Schädel\nWellen Geräusche X\nSonne Figur(Wächter)\nNacht(Linie darüber Sterne) eine Figur(Herrscher)\n\n\nDie Spieler haben 4 Steine vor sich mit Tier Symbolen.\nEule\nKatze\nSchlange\nMaus\n\n\nWenn die Spieler es schaffen, bekommen sie einen verzierten Säbel, in dem ein Jaguar eingraviert ist.",
        misserfolgText: "Ein Knall ertönt und ein fauchen, wie von einer Großkatze"
      },
      die_aussichtsklippe: {
        type: "ort", label: "Die Aussichtsklippe", ortId: "aussichtsklippe",
        probe: "Klettern",
        erfolgText: "Die Klippe wird erklommen.",
        misserfolgText: "Zeit verloren, dazu ein kleiner Schaden — abgerutscht. Ein zweiter Versuch ist jederzeit möglich."
      },
      suesswasserquelle: {
        type: "ort", label: "Die Süßwasserquelle", ortId: "suesswasserquelle",
        probe: "Instinkt/Survival",
        erfolgText: "Ein Gespür dafür, wo im dichten Gelände Wasser zu finden ist, führt direkt zur Quelle.",
        misserfolgText: "Zeit verloren, dazu ein kleiner Schaden — übles, brackiges Wasser probiert. Ein zweiter Versuch ist jederzeit möglich."
      }
    },
    edges: {
      e_strand_zwischenpunkt1: { from: "strand", to: "zwischenpunkt1", hinweis: "Ein heller Streifen aus Sand und Geröll am Fuß der Felsen." },
      e_zwischenpunkt1_strand: { from: "zwischenpunkt1", to: "strand", hinweis: "Loser Sand zwischen Felskante und offenem Wasser." },
      e_zwischenpunkt1_wrack: { from: "zwischenpunkt1", to: "wrack", hinweis: "Große, scharfkantige Felsbrocken bis ans Wasser." },
      e_wrack_zwischenpunkt1: { from: "wrack", to: "zwischenpunkt1", hinweis: "Ein schmaler Streifen Geröll zwischen den Felsbrocken." },
      e_zwischenpunkt1_zwischenpunkt2: { from: "zwischenpunkt1", to: "zwischenpunkt2", hinweis: "Ein Pfad am Riff entlang, ins dichtere Grün hinein." },

      e_zwischenpunkt2_versteckte_grotte: { from: "zwischenpunkt2", to: "versteckte_grotte", hinweis: "Ein schmaler Spalt im Fels, dahinter kühle, feuchte Luft." },
      e_versteckte_grotte_zwischenpunkt2: { from: "versteckte_grotte", to: "zwischenpunkt2", hinweis: "Ein Spalt im Fels, davor hängende Ranken." },
      e_versteckte_grotte_zp3: { from: "versteckte_grotte", to: "zp3", hinweis: "Ein Trampelpfad in niedergedrücktem Gras, kaum zu erkennen." },
      e_zp3_zwischenpunkt2: { from: "zp3", to: "zwischenpunkt2", hinweis: "Ein Pfad senkt sich zwischen Ranken und Luftwurzeln." },
      e_zwischenpunkt2_zwischenpunkt1: { from: "zwischenpunkt2", to: "zwischenpunkt1", hinweis: "Ein Pfad am Riff entlang, das Rauschen der Brandung wird lauter." },
      e_zwischenpunkt2_zp3: { from: "zwischenpunkt2", to: "zp3", hinweis: "Ein Abzweig verliert sich im dichten Dschungel." },
      e_zp3_versteckte_grotte: { from: "zp3", to: "versteckte_grotte", hinweis: "Ein kaum sichtbarer Trampelpfad zwischen Felsen hindurch." },

      e_strand_zp1l: { from: "strand", to: "zp1l", hinweis: "Ein Pfad vom Sand ins Dickicht hinein." },
      e_zp1l_strand: { from: "zp1l", to: "strand", hinweis: "Zwischen den Stämmen blitzt heller Sand auf, Brandung ist zu hören." },
      e_zp1l_zp_2: { from: "zp1l", to: "zp_2", hinweis: "Ein Weg zwischen mannshohen Farnen hindurch." },
      e_zp_2_zp1l: { from: "zp_2", to: "zp1l", hinweis: "Ein ausgetretener Weg, von dichten Farnen gesäumt." },
      e_zp_2_zwischenpunkt2: { from: "zp_2", to: "zwischenpunkt2", hinweis: "Ein Abzweig, auf dem die Luft feuchter und schwerer wird." },
      e_zp_2_zp3: { from: "zp_2", to: "zp3", hinweis: "Ein Abzweig, auf dem das Unterholz immer dorniger wird." },
      e_zwischenpunkt2_zp_2: { from: "zwischenpunkt2", to: "zp_2", hinweis: "Ein Abzweig zwischen moosüberwachsene Felsblöcke hinein." },
      e_zp3_zp_2: { from: "zp3", to: "zp_2", hinweis: "Ein Abzweig auf mannshohe Farne zu." },

      e_zp3_zp: { from: "zp3", to: "zp", hinweis: "Ein ansteigender Pfad, oben offener Fels über dem Grün." },
      e_zp_zp3: { from: "zp", to: "zp3", hinweis: "Ein Pfad fällt bergab, ins geschlossene Grün hinein." },
      e_zp_die_aussichtsklippe: { from: "zp", to: "die_aussichtsklippe", hinweis: "Der Grat mündet in einen freien Felsvorsprung." },
      e_die_aussichtsklippe_zp: { from: "die_aussichtsklippe", to: "zp", hinweis: "Ein schmaler Grat, auf dem der Wind ungebremst zieht." },
      e_zp_zp_3: { from: "zp", to: "zp_3", hinweis: "Ein Weg seitlich den Hang hinunter, über nasses Gestein." },

      e_zp_3_zp_4: { from: "zp_3", to: "zp_4", hinweis: "Ein Pfad über nasses, dunkles Gestein." },
      e_zp_3_suesswasserquelle: { from: "zp_3", to: "suesswasserquelle", hinweis: "Von unten her plätschert Wasser." },
      e_suesswasserquelle_zp_3: { from: "suesswasserquelle", to: "zp_3", hinweis: "Ein Pfad steigt zu moosbewachsenem, nassem Fels hinauf." },

      e_zp1l_zp_6: { from: "zp1l", to: "zp_6", hinweis: "Ein Abzweig ins feuchte, stehende Unterholz." },
      e_zp_6_zp1l: { from: "zp_6", to: "zp1l", hinweis: "Ein Abzweig auf trockeneren, festeren Boden." },
      e_zp_6_suesswasserquelle: { from: "zp_6", to: "suesswasserquelle", hinweis: "Das Plätschern von Wasser wird lauter." },
      e_suesswasserquelle_zp_6: { from: "suesswasserquelle", to: "zp_6", hinweis: "Ein Pfad ins schwüle, stehende Unterholz." },

      e_suesswasserquelle_zp_4: { from: "suesswasserquelle", to: "zp_4", hinweis: "Ein Pfad steigt bergauf, der Boden wird weicher." },
      e_suesswasserquelle_zp_5: { from: "suesswasserquelle", to: "zp_5", hinweis: "Ein Pfad nach Westen, ins dichte Unterholz." },
      e_zp_5_zp_4: { from: "zp_5", to: "zp_4", hinweis: "Ein Pfad zieht sich am Hang entlang." },
      e_zp_6_zp_5: { from: "zp_6", to: "zp_5", hinweis: "Ein schmaler Trampelpfad nach Westen." },
      e_zp_5_suesswasserquelle: { from: "zp_5", to: "suesswasserquelle", hinweis: "Ein feuchter, kühler Luftzug verrät die Nähe von Wasser." },
      e_zp_3_zp: { from: "zp_3", to: "zp", hinweis: "Ein ansteigender Pfad, der Wind wird spürbar stärker." },
      e_zp_4_suesswasserquelle: { from: "zp_4", to: "suesswasserquelle", hinweis: "Ein Weg fällt bergab, unten plätschert Wasser." },
      e_zp_4_zp_3: { from: "zp_4", to: "zp_3", hinweis: "Ein Pfad steigt über nasses Gestein den Hang hinauf." },
      e_zp_4_zp_5: { from: "zp_4", to: "zp_5", hinweis: "Ein Pfad am Hang entlang, das Unterholz wird dichter." },
      e_zp_5_zp_6: { from: "zp_5", to: "zp_6", hinweis: "Ein schmaler Trampelpfad nach Osten, die Luft wird schwüler." }
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
//
// WICHTIG (2026-08-22): die Zurück-Option wird NUR angehängt, wenn es keine
// echte Kante zum selben Ziel gibt. Seit der Riffinsel-Graph durchgehend
// beidseitig ist, wäre sie sonst immer ein Duplikat der ganz normalen
// Rückweg-Kante - auf der Karte ergäbe das zwei Pfeile mit exakt derselben
// Richtung, die sich gegenseitig überdecken, sodass die darunterliegende
// Verbindung nicht mehr einzeln anklickbar ist. Sie bleibt als Notausgang
// erhalten für echte Einbahnstraßen bzw. Knoten ohne modellierten Rückweg.
const BACK_EDGE_ID = '__back__';
function getPlayableOptions(sceneId, nodeId, history) {
  const edges = getOutgoingEdges(sceneId, nodeId);
  if (history && history.length) {
    const prev = history[history.length - 1];
    const hasRealEdgeBack = edges.some(function (e) { return e.to === prev; });
    if (!hasRealEdgeBack) {
      edges.push({ id: BACK_EDGE_ID, to: prev, hinweis: 'Ein Weg, dessen Bewuchs frisch niedergetreten ist.', isBack: true });
    }
  }
  return edges;
}
