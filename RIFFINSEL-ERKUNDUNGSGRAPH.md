# Handbuch: Riffinsel & Erkundungs-Graph-System (Szene 11.1)

Ausführliche Dokumentation zu Szene `11.1` „Riffinsel" und dem dahinterliegenden generischen
Erkundungs-Graph-System. Ziel: nachvollziehbar machen, **wie** das System funktioniert, **warum**
es so gebaut ist, und woran die Fehler beim ersten Durchgang lagen — als Referenz für künftige
Sitzungen und für den Fall, dass das System auf eine weitere Szene übertragen werden soll.

Technischer Kontext: [CLAUDE.md](CLAUDE.md) (Architektur-Muster, laufender Changelog). Story-
Kontext: [KAMPAGNEN-BIBEL.md](KAMPAGNEN-BIBEL.md), Abschnitt 7.4 „Spanischer Angriff → Riffinsel".

---

## 1. Warum es die Riffinsel als eigenes System gibt

Alle bisherigen Szenen (Grimsgate, Golden Lion, Schatzinsel, Spanischer Hafen, Schmugglernest,
Artefakthandel) funktionieren nach demselben Muster: eine Karte mit Markern, jeder Marker ein
Ort mit GM-Text. Die Spieler sehen die Karte direkt, klicken einen Marker an, die SL öffnet die
zugehörigen Interaktionen.

Die Riffinsel sollte etwas anderes leisten: eine **freie Erkundung ohne feste Route**, bei der
die Spieler sich aufteilen und selbst entscheiden können, wohin sie zuerst gehen — aber ohne dass
sie von Anfang an die ganze Insel samt aller Fundstellen auf der Karte sehen (das würde die
Erkundung selbst sinnlos machen). Gleichzeitig sollte es **kein Buchhaltungs-Albtraum für die SL**
werden (freie Bewegung über eine ungeführte Karte ist am Tisch schwer zu moderieren, vor allem
wenn sich die Gruppe aufteilt).

Die Lösung: ein **verdeckter Knoten-/Kanten-Graph**. Die Spieler sehen nie den Graphen selbst,
nur ihre aktuelle Position (als Ring auf der Karte) und die Wege, die von dort aus offen sind
(als Pfeile mit kurzem Sinneshinweis, nie mit Vorwegnahme dessen, was am Ende wartet — siehe
Design-Regel 2.8 der Bibel). Bewegen ist ein Abstimmungsprozess: jeder Spieler kann jede sichtbare
Option anklicken, die SL sieht die Stimmverteilung — und **gibt jede Bewegung selbst von Hand
frei**. Eine Stimme bewegt die Gruppe nie von allein, und ein Würfelergebnis hält sie nie auf
(Hendriks Vorgabe, 2026-08-22, siehe Abschnitt 4.2).

Bewusst **kein** neues Kartenfeature mit beweglichem Icon, Mehrheitsentscheidung oder Timer-Code
im eigentlichen Sinne — das wurde mit Hendrik besprochen und explizit zurückgestellt (siehe
Abschnitt 12). Der Graph ist ein reines Datenmodell, keine Simulation.

---

## 2. Das Datenmodell (`js/exploration_graphs.js`)

### 2.1 Knotentypen

Es gibt genau drei Knotentypen (reduziert von ursprünglich vier, siehe Abschnitt 11 — Hendriks
Referenz-Skizze kennt nur zwei sichtbare Kategorien: grün = Aufgabe, blau = echter Ort):

| Typ | Bedeutung | Felder |
|---|---|---|
| `start` | Startpunkt der Erkundung, keine Probe | `type`, `label`, `top`, `left` |
| `ereignis` | Kurzer Zwischenstopp mit einer Probe (Erzählung) UND normaler Entscheidungspunkt | `type`, `label`, `top`, `left`, `probe`, `text`, `erfolgText`, `misserfolgText` |
| `ort` | Aufdeckbare Fundstelle, verknüpft mit einem echten Kartenmarker | `type`, `label`, `probe`, `ortId`, `erfolgText`, `misserfolgText` (bewusst KEIN `top`/`left`, siehe 2.2) |

Die Probe-Felder sind bei **beiden** Typen reine SL-Referenz zum Vorlesen — sie entscheiden seit
2026-08-22 nicht mehr darüber, ob ein Weg begehbar ist (siehe 4.2).

Ein `ereignis`-Knoten ist **kein** Sackgassen-Stopp mit nur einem „Weiter"-Knopf. Seit der
Vereinfachung am 21.08. ist er gleichzeitig ein normaler Entscheidungspunkt — hat er mehrere
ausgehende Kanten, werden die nach der Probe ganz normal als Wahloptionen angezeigt. Das erlaubt
echte Verzweigungen mitten in einer Aufgabe, ohne einen eigenen vierten Knotentyp
(„Gabelung ohne Aufgabe") zu brauchen, den es in Hendriks ursprünglichem Entwurf gar nicht gibt.

Ein `ort`-Knoten unterscheidet sich nur bei der **Ankunft**: Gibt die SL die Bewegung dorthin
frei, wird der verknüpfte Marker automatisch über `hiddenMarkersLive` sichtbar geschaltet
(`revealOrtMarker()` in `js/regie_vault.js`, aufgerufen aus `graphAdvance()`/`graphGoBack()`).
Ansonsten verhält er sich wie jeder andere Knoten mit eigenen ausgehenden Kanten.

**Seit 2026-08-22 blockieren die Felder `probe`/`erfolgText`/`misserfolgText` die Bewegung
nicht mehr** — sie sind reine SL-Referenz zum Vorlesen. Das frühere Probe-Gate (`pendingOrtEdge`,
`graphResolveOrt()`, „✓ Erfolg — aufdecken" / „✗ Misserfolg") ist ersatzlos entfallen. Hendriks
Begründung: die SL gibt ohnehin jede einzelne Bewegung von Hand frei, ein Wurf soll sie deshalb
nie verhindern; ein misslungener Wurf färbt nur die Erzählung, nicht die Erreichbarkeit.

### 2.2 Warum `ort`-Knoten keine eigene Position haben

```js
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
```

`start`- und `ereignis`-Knoten tragen ihre Position direkt im Datensatz (`top`/`left`, Prozent
wie bei Markern). `ort`-Knoten dagegen holen sich ihre Position **live vom verknüpften Marker**
(`js/riffinsel_scenes.js`, per `ortId`). Das ist bewusst so, um Koordinaten-Duplizierung zu
vermeiden: würde ein Marker später neu kalibriert (kam bei dieser Szene mehrfach vor, siehe
Abschnitt 11.1), müsste sonst die Position an zwei Stellen synchron gehalten werden. So zieht die
Positions-Markierung im Graphen automatisch mit, sobald der Marker verschoben wird.

### 2.3 Kanten

```js
edges: {
  e_strand_zwischenpunkt1: { from: "strand", to: "zwischenpunkt1", hinweis: "Ein heller Streifen aus Sand und Geröll zieht sich am Fuß der Felsen entlang." },
  ...
}
```

**Stilregel für `hinweis` (Hendriks Vorgabe, 2026-08-22):** rein beschreiben, wie der Weg
aussieht bzw. sich anfühlt — **keine Wertung und keine Einordnung relativ zum bisherigen Weg**.
Also kein „führt zurück", kein „weiter", kein „ein zweiter Abzweig". Grund: der Graph ist
vollständig beidseitig, jeder Knoten also über mehrere Routen erreichbar. Ein „führt zurück
Richtung Küste" erschien dadurch auch Spielern, die nie an der Küste waren, und behauptete etwas
Falsches über deren Weg. Eine reine Ortsbeschreibung stimmt dagegen immer, egal woher die Gruppe
kommt (verwandt mit Design-Regel 2.8 der Bibel). Aus demselben Grund trägt das Spieler-Label auf
der Karte auch kein „↩"-Präfix mehr — nur die gedämpfte Farbe der `.back`-Option bleibt.

Jede Kante ist ein simples `{ from, to, hinweis }`-Objekt in einem flachen Kanten-Verzeichnis der
Szene — **nicht** am Knoten selbst als `edges`-Array gepflegt. Grund: doppelte Buchführung
(Kante am Start- UND am Zielknoten eintragen) ist eine Fehlerquelle, die diese Szene bereits ohne
Not durchgemacht hat (siehe Abschnitt 11). `getOutgoingEdges(sceneId, nodeId)` leitet die
ausgehenden Kanten eines Knotens bei jedem Aufruf frisch aus dem Kanten-Verzeichnis ab (Filter auf
`from === nodeId`) — es gibt nur eine Quelle der Wahrheit.

**Wichtig — Kanten sind gerichtet, keine automatische Rückrichtung:** Eine Kante `A → B`
bedeutet nur, dass man von A nach B gehen kann, nicht umgekehrt. Für einen normal begehbaren
Zweiwege-Pfad (der Regelfall auf dieser Insel) müssen **beide** Richtungen als eigene Kanten
angelegt werden. Das war die zentrale Fehlerquelle dieses Projekts, siehe Abschnitt 11.

### 2.4 Der „Zurück"-Mechanismus

Unabhängig vom eigentlichen Kantenmodell gibt es eine zweite, synthetische Rückkehr-Option:

`history` ist die Liste bereits besuchter Knoten in `graphState/{sceneId}/history` (Firebase).
Ist sie nicht leer, wird eine „Zurück"-Option angehängt, die zum zuletzt besuchten Knoten führt —
Hendriks ausdrückliche Vorgabe: Spieler sollen **immer** umkehren können, auch an Knoten, die
sonst nur eine Richtung nach vorn hätten.

**Nur wenn es keine echte Kante zum selben Ziel gibt (seit 2026-08-22).** Seit der Graph
durchgehend beidseitig ist, wäre die Zurück-Option sonst immer ein exaktes Duplikat der ganz
normalen Rückweg-Kante — auf der Karte zwei Pfeile mit identischer Richtung, exakt übereinander,
wodurch die darunterliegende echte Verbindung nicht mehr einzeln anklickbar war. Sie bleibt als
Notausgang für echte Einbahnstraßen bzw. Knoten ohne modellierten Rückweg erhalten.

Wichtig: Diese „Zurück"-Option ersetzt **nicht** echte bidirektionale Kanten. Sie führt nur zum
exakt letzten Schritt der eigenen Historie zurück, nicht zu einem beliebigen bereits besuchten
Nachbarn. Genau das war ein Teil der Verwirrung beim Debuggen — mit reinem „Zurück" allein hätte
man aus einer Sackgasse zwar rauskommen können, aber nicht frei zwischen bereits besuchten
Nachbarknoten hin- und herwechseln, wenn man auf einem anderen Weg dorthin gekommen war.

### 2.5 Firebase-Schema

```
graphState/{sceneId}/
  currentNode   — aktuelle Knoten-ID (string)
  history       — Array bereits besuchter Knoten-IDs
  votes/{sid}   — sessionId → gewählte edgeId (Spieler-Stimmen)
```

Geschrieben wird `currentNode`/`history` ausschließlich von der SL-Seite (`regie_vault.js`,
`graphAdvance()`/`graphGoBack()`) — bewusst kein direkter Spieler-Schreibzugriff
auf die eigentliche Bewegung, damit nicht ein einzelner Spieler-Client den Szenenfortschritt allein
bestimmen kann. Spieler schreiben nur ihre eigene Stimme unter `votes/{mySessionId}`
(`karte.html`, gleiches `onDisconnect().remove()`-Präsenzmuster wie das bestehende
`openMarkers`-Feature, Bibel 13.9).

**Atomare Schreibvorgänge:** `graphAdvance()`/`graphGoBack()` schreiben `currentNode`, `history`
und das Löschen der `votes` in einem einzigen `db.ref(...).update({...})`-Aufruf, nicht als drei
getrennte `.set()`/`.remove()`-Aufrufe. Grund: mit getrennten Schreibvorgängen feuerte der
Live-Listener bis zu dreimal pro Zug, jedes Mal mit einem nur teilweise aktualisierten
Zwischenstand — sichtbar als „der Punkt springt wild rum". Ein einziger atomarer Update-Aufruf
behebt das strukturell.

---

## 3. Spieler-Seite (`karte.html`)

### 3.1 Positions-Ring und Pfeile

Statt einer Liste zeigt `karte.html` die aktuelle Position direkt auf der Karte: ein pulsierender
Ring (`.erk-pos`) an der Koordinate des aktuellen Knotens (`getGraphNodePosition()`), umgeben von
Pfeil-Buttons (`.erk-arrow`, ein Button pro Kante aus `getPlayableOptions()`). Jeder Pfeil zeigt
per `Math.atan2()` in die **tatsächliche** Richtung des Zielknotens — kein Auto-Fächer über einen
festen Bogen (das war eine frühere, verworfene Variante, die bei echten Kartenkoordinaten sichtbar
falsche Richtungen erzeugte, z. B. ein Pfeil Richtung offenes Wasser statt ins Inselinnere).

Zwei Korrekturen dazu (2026-08-22), damit **jede** Verbindung einzeln anklickbar bleibt:

- **Seitenverhältnis-Korrektur:** `top`/`left` sind beide Prozentwerte, das Kartenbild ist aber
  1920×1047 — eine Richtung direkt aus den Rohprozenten zeigt daher systematisch zu flach. Die
  Horizontale wird vor dem `atan2()` mit `rect.width / rect.height` skaliert.
- **Winkel-Relaxation (`spreadAngles()`, `MIN_ARROW_SEP = 42°`):** ein Pfeil ist ~48 px breit auf
  Radius 68 px, deckt also gut 40° ab. Zwei geografisch fast gleich gerichtete Wege (auf der
  Riffinsel etwa Süßwasserquelle→Zirpen/Schlammboden, bis herab zu 17° Abstand) legten ihre Pfeile
  daher übereinander — der hintere war schlicht nicht mehr klickbar. Die Relaxation schiebt zu
  eng stehende Pfeile so weit auseinander, bis jeder frei liegt, bleibt dabei so nah wie möglich
  an der echten Richtung und erhält die Reihenfolge im Kreis (kein Pfeil springt auf die falsche
  Seite). Gemessener Mindestabstand über alle 15 Knoten danach: 49 px.

Ein Pfeil zur `__back__`-Option bekommt eine eigene, gedämpfte Farbe (`.erk-arrow.back`) statt
der kräftigen Standardfarbe (`#4a90e2`), damit „echter Weg vorwärts" und „reine Rückkehr" auch
optisch unterscheidbar bleiben. Die eigene Stimme wird per `.mine`-Klasse (Goldrand) hervorgehoben.

`resolveCurrentNodeId(graph)` fängt einen Sonderfall ab: zeigt `graphState/{sceneId}/currentNode`
auf eine Knoten-ID, die im aktuell geladenen Graphen gar nicht existiert (z. B. nach einem
Graph-Neubau mit geänderten IDs, während Firebase noch den alten Stand hält), fällt die Anzeige
auf `graph.startNode` zurück, statt komplett zu verschwinden. Ohne diesen Fallback bricht
`renderErkundungOnMap()`/`renderFogOfWar()` am `if (!node) return`-Guard ab — sichtbar als
„gar keine Bewegungspfeile mehr", ein Fehler, der beim ersten Graph-Neubau tatsächlich auftrat.

### 3.2 Flavor-Text

`#erkFlavorText`, fest am unteren Bildrand verankert (21px, Goldrand-Kasten), zeigt ausschließlich
`node.text` eines `ereignis`-Knotens — **niemals** `erfolgText`/`misserfolgText` (die bleiben
SL-exklusiv). Wird in jedem Rückkehr-/Fehlerpfad von `renderErkundungOnMap()` explizit
aus-/eingeblendet, damit kein alter Text stehen bleibt, wenn gerade kein Knoten aktiv ist. Ersetzt
eine frühere, kleine Tooltip-Variante direkt am Ring, die laut Hendriks Feedback „praktisch nicht
lesbar" war.

### 3.3 Fog of War

`#fogCanvas`, eine dunkle Fläche über der ganzen Karte mit weichen, kreisrunden Löchern
(Radial-Gradient + `destination-out`) um Start und alle bereits besuchten Knoten
(`history` + aktueller Knoten). Nur aktiv in Szenen mit definiertem `EXPLORATION_GRAPHS`-Eintrag;
andere Karten bleiben unverändert voll sichtbar. Grund für dieses Feature: ohne Nebel sahen
Spieler von Anfang an das komplette Kartenbild inklusive aller vier Fundstellen — der verdeckte
Graph selbst war zwar unsichtbar, aber der Zweck (nicht wissen, wo man hinlaufen soll) war durch
das offen sichtbare Artwork trotzdem unterlaufen.

`.marker` bekam dafür ein explizites `z-index: 10` (unter dem Nebel bei `z-index: 20`), damit
normale Marker zuverlässig unter dem Nebel verschwinden — vorher unklare DOM-Reihenfolge.

### 3.4 Debug-Overlay

`#erkDebugSvg` + farbige Punkte (`.erk-debug-node`, Lila = Start, Grün = Ereignis, Blau = Ort) mit
Namens-Label, nur sichtbar mit dem Query-Parameter `?erkundungDebug`. Zeigt den kompletten
verdeckten Graphen inklusive aller Kanten als rote Linien — reine Testhilfe, an keiner Stelle mit
Firebase verknüpft, in keinem Spielerpfad standardmäßig sichtbar. Dieses Overlay war das zentrale
Werkzeug, um in diesem Projekt gemeldete „diese Verbindung fehlt"-Fehler exakt zu lokalisieren:
Koordinaten aus dem Graphen gegen Screenshots der SL abgleichen, statt aus Textbeschreibungen zu
raten.

**Wichtig:** War testweise kurzzeitig standardmäßig sichtbar (Opt-out statt Opt-in), wurde aber
zurückgedreht, sobald Fog of War eingeführt wurde — ein standardmäßig sichtbarer Debug-Graph würde
den ganzen Zweck des Nebels sofort aushebeln.

---

## 4. SL-Seite (`regie.html` / `js/regie_vault.js`)

### 4.1 Das 🧭-Panel

`renderGraphPanelHTML(sceneId)` rendert im Szenenkopf einen eigenen Bereich mit:
- dem Situationstext + Probe-Referenz des aktuellen Knotens (`ereignis` wie `ort`), ausdrücklich
  als „Probe (nur Erzählung, kein Weg-Gate)" ausgewiesen
- der Liste aller spielbaren Optionen (`getPlayableOptions()`) als je einem Freigabe-Knopf mit
  Sinneshinweis, **Zielname** und Live-Stimmenzahl — jede Option direkt anklickbar, unabhängig
  von der Mehrheit (`graphSelectEdge()`)
- einem „↺ Zurücksetzen"-Knopf (`graphReset()`), der `graphState/{sceneId}` komplett löscht

Der Zielname steht bewusst mit im Knopf: mehrere Wege eines Knotens können ähnlich klingende
Sinneshinweise haben, und die SL muss eindeutig erkennen können, welche Verbindung sie freigibt.

### 4.2 Keine automatische Bewegung (seit 2026-08-22)

**Spieler-Stimmen bewegen die Gruppe nie von selbst.** Sie sind reine Willensbekundung: die SL
sieht nur, wie viele Spieler auf welchen Weg geklickt haben, und gibt jede Bewegung per Klick
selbst frei. Der frühere `AUTO_ADVANCE_THRESHOLD = 1` samt `maybeAutoAdvance()` („jede Stimme
zieht sofort weiter", ursprünglich ein Testmodus mangels Presence-Konzept) ist ersatzlos
entfallen — zusammen mit dem Probe-Gate ist die SL-Freigabe damit der **einzige** Weg, wie sich
`currentNode` ändert.

Zwei Konsequenzen, die zusammengehören und Hendriks Vorgabe direkt umsetzen:
- Eine Mehrheit ist nicht mehr nötig und auch nicht mehr definiert — die SL wertet die
  Stimmverteilung am Tisch aus, wie sie will.
- Ein Würfelergebnis kann eine Bewegung nicht mehr verhindern. Proben bleiben als Vorlese-Material
  erhalten (Erfolg/Misserfolg färben die Erzählung, Misserfolg kostet weiterhin z. B. einen
  Schadenspunkt), aber der Weg selbst steht immer offen.

### 4.3 `graphReset()`

Löscht `graphState/{sceneId}` vollständig. Die Gruppe fällt dadurch automatisch auf den
Startknoten zurück (`currentGraphNodeId()` nutzt bei leerem Snapshot ohnehin `startNode` als
Fallback). Deckt bereits gefundene Orte **nicht** wieder ab (`hiddenMarkersLive` bleibt
unberührt) — betrifft nur die Position im Graphen, nicht bereits erzählte Entdeckungen. Praktisch
bildet dieser Knopf den erzwungenen Rückzug bei „Die Eingeborenen greifen an" ab (Abschnitt 6.2),
ohne dass dafür eigene neue Technik nötig war.

---

## 5. Das Werkzeug: `graph_editor.html`

Eigenständiges, lokales Tool ohne Firebase-Anbindung zum visuellen Bauen eines
`EXPLORATION_GRAPHS`-Eintrags direkt auf dem echten Kartenbild: Knoten per Klick setzen
(Typ/Label/Probe/Text/Erfolg/Misserfolg), per Ziehen neu positionieren, Kanten per Klick-Klick
verbinden, bestehenden Code zum Weiterbearbeiten importieren, fertigen JS-Code exportieren
(Textfeld/Datei/Zwischenablage).

Entstand, weil das manuelle Ablesen einer handgezeichneten Routen-Skizze fehleranfällig war —
Hendrik hat den kompletten aktuellen Riffinsel-Graphen (15 Knoten, ursprünglich 21 Kanten) selbst
direkt mit diesem Tool auf dem echten Bild gebaut, nicht Claude aus einer Skizze abgeleitet.

**Bidirektional-Nachfrage (nachträglich ergänzt, siehe Abschnitt 11):** Seit dem Fehlerdurchgang
mit den einseitigen Kanten fragt der Editor nach dem Ziehen einer Kante per `confirm()`, ob auch
die Gegenrichtung angelegt werden soll (mit eigenem, separat abgefragtem Sinneshinweis für die
Rückrichtung) — „Abbrechen" für den Fall, dass wirklich eine echte Einbahnstraße gewollt ist.
Vorher legte eine gezogene Kante immer nur die eine angeklickte Richtung an, was bei einem Graphen,
dessen Normalfall ein zweiseitig begehbarer Pfad ist, wiederholt vergessen wurde.

`ort`-Knoten bekommen beim Export bewusst **kein** `top`/`left` (Position kommt im echten Betrieb
vom Marker, siehe Abschnitt 2.2) — beim Import eines bestehenden Graphen ohne `top`/`left` landen
sie als Platzhalter bei 50/50 und müssten von Hand an die richtige Stelle gezogen werden.

### 5.1 Aktuellen Stand in den Editor holen

```
node tools/export_graph_snapshot.js 11.1
```

Schreibt `riffinsel_graph_snapshot.js` ins Repo-Wurzelverzeichnis: den kompletten aktuellen
Graphen in genau der Form, die der Editor einliest — Inhalt kopieren, unten bei „Bestehenden
Graph laden" einfügen, „Laden". Der Snapshot ergänzt für die vier `ort`-Knoten die `top`/`left`
ihrer Marker, sodass sie sofort an der richtigen Stelle liegen statt bei 50/50; beim Export aus
dem Editor fällt das automatisch wieder weg, die echte Datei behält also ihr Format. Der Snapshot
wird von der Anwendung nicht geladen und veraltet, sobald `js/exploration_graphs.js` sich ändert —
dann einfach neu erzeugen.

**Import-Formate (seit 2026-08-22):** Der Editor akzeptiert die komplette Datei
(`const EXPLORATION_GRAPHS = { "11.1": {…} };`, auch mit Kommentarkopf), einen einzelnen
Szenen-Eintrag (`"11.1": {…}`) oder das reine Objekt. Vorher ging **nur** die mittlere Form —
ausgerechnet der eigene Export des Editors ließ sich damit nicht wieder einlesen, und der
Fehlschlag war still (das Objekt hatte auf oberster Ebene kein `nodes`). Bei mehreren Szenen im
Container wird die im Feld „Szenen-ID" eingestellte bevorzugt, sonst die erste.

---

## 6. Der Riffinsel-Graph im Detail

### 6.1 Knotenübersicht (15 Knoten)

| ID | Typ | Label | Probe | Bemerkung |
|---|---|---|---|---|
| `strand` | start | Strand | — | Position exakt deckungsgleich mit Marker `riffstrand` (56.4/54.2) |
| `zwischenpunkt1` | ereignis | Ein Krabbenschwarm | Geschick | |
| `zp1l` | ereignis | Ungewöhnliche Abdrücke | Wahrnehmung | Vorausdeutung auf „Die Affen greifen an" |
| `zwischenpunkt2` | ereignis | Herabhängende Lianen | Geschick | Knotenpunkt mit 4 Nachbarn |
| `zp3` | ereignis | Dichtes Dornengestrüpp | Körper | Knotenpunkt mit 4 Nachbarn |
| `zp` | ereignis | Böiger Wind auf dem Grat | Körper | Zugang zur Aussichtsklippe |
| `zp_2` | ereignis | Ein enger Durchschlupf | Geschick | |
| `zp_3` | ereignis | Ein rutschiger Felsvorsprung | Klettern | Teil des „Quellbecken"-Dreiecks |
| `zp_4` | ereignis | Schlammiger Boden | Geschick | Teil des „Quellbecken"-Dreiecks |
| `zp_5` | ereignis | Zirpen aus dem Unterholz | Wahrnehmung | Teil des „Quellbecken"-Dreiecks |
| `zp_6` | ereignis | Ein Mückenschwarm | Körper | |
| `wrack` | ort → `wrackteile` | Wrackteile am Riff | Klettern/Körper | |
| `versteckte_grotte` | ort → `versteckte_grotte` | Die versteckte Grotte | Int (Rätsel) | Urzeitliches Steinbauwerk, Rätsel + steinerne Klappe |
| `die_aussichtsklippe` | ort → `aussichtsklippe` | Die Aussichtsklippe | Klettern | Session-Schluss-Beat |
| `suesswasserquelle` | ort → `suesswasserquelle` | Die Süßwasserquelle | Instinkt/Survival | Zentraler Knotenpunkt (6 Nachbarn) |

### 6.2 Kantenübersicht (42 Kanten = 21 Wegepaare, alle zweiseitig)

Der komplette Graph ist nach dem Fehlerdurchgang (Abschnitt 11) **vollständig bidirektional** —
jeder Nachbar ist von jedem Nachbarn aus direkt erreichbar, nicht nur über die Zurück-Historie.
Die 21 begehbaren Wegepaare:

```
Strand ↔ Ein Krabbenschwarm
Strand ↔ Ungewöhnliche Abdrücke
Ein Krabbenschwarm ↔ Wrackteile am Riff
Ein Krabbenschwarm ↔ Herabhängende Lianen
Herabhängende Lianen ↔ Die versteckte Grotte
Herabhängende Lianen ↔ Dichtes Dornengestrüpp
Herabhängende Lianen ↔ Ein enger Durchschlupf
Die versteckte Grotte ↔ Dichtes Dornengestrüpp
Ungewöhnliche Abdrücke ↔ Ein enger Durchschlupf
Ungewöhnliche Abdrücke ↔ Ein Mückenschwarm
Ein enger Durchschlupf ↔ Dichtes Dornengestrüpp
Dichtes Dornengestrüpp ↔ Böiger Wind auf dem Grat
Böiger Wind auf dem Grat ↔ Die Aussichtsklippe
Böiger Wind auf dem Grat ↔ Ein rutschiger Felsvorsprung
Ein rutschiger Felsvorsprung ↔ Schlammiger Boden
Ein rutschiger Felsvorsprung ↔ Die Süßwasserquelle
Ein rutschiger Felsvorsprung ↔ Zirpen aus dem Unterholz (Dreieck)
Schlammiger Boden ↔ Zirpen aus dem Unterholz (Dreieck)
Schlammiger Boden ↔ Die Süßwasserquelle
Zirpen aus dem Unterholz ↔ Die Süßwasserquelle
Zirpen aus dem Unterholz ↔ Ein Mückenschwarm
Ein Mückenschwarm ↔ Die Süßwasserquelle
```

Geografisch bildet die Insel damit zwei grobe Zonen, die über `zp1l`/`zwischenpunkt2` bzw. über
`zp3`↔`zp` (Dornengestrüpp zum Grat) miteinander verbunden sind: eine Küsten-/Dschungelroute
(Strand, Krabbenschwarm, Wrackteile, Lianen, Grotte, Dornengestrüpp, Durchschlupf) und ein
Hochland-„Quellbecken" (Süßwasserquelle als zentraler Knotenpunkt, umgeben vom
Felsvorsprung/Schlammboden/Zirpen-Dreieck, dazu der Aufstieg über den windigen Grat zur
Aussichtsklippe).

### 6.3 Die vier Fundstellen (Marker + Ort-Knoten)

Jeder der vier `ort`-Marker startet in `hiddenMarkersLive` versteckt und wird sichtbar, sobald die
SL die Bewegung dorthin freigibt (`revealOrtMarker()`; kein neues Feature, bestehender
Sichtbarkeits-Schalter, Bibel 13.10, über den sich das jederzeit rückgängig machen lässt). Die
angegebene Probe ist Erzählmaterial, keine Bedingung fürs Auffinden. Story-Inhalt je Fundstelle,
aus `js/regie.js`:

- **Süßwasserquelle** (Instinkt/Survival) — Josiah Pryce füllt Wasserfässer, ein ruhiger
  Charaktermoment abseits der Kombüse, erzählt auf Nachfrage kurz von Wales. Kein Wurf, kein
  Ruf-Effekt — reiner Rollenspielmoment.
- **Wrackteile am Riff** (Klettern/Körper) — Dirk van Hoorn und Sam Oakley bergen brauchbares
  Ausbesserungsmaterial aus einem alten Wrack, Mithilfe ohne Probe möglich, eine freiwillige
  Mechanik-Probe kann einen besonders guten Fund liefern.
- **Aussichtsklippe** (Klettern) — **der eigentliche Zweck des Aufstiegs** (Hendriks Vorgabe,
  2026-08-22): von hier oben, und nur von hier oben, ist zu sehen, wie das spanische Kriegsschiff
  aus Szene 10.1 auf entgegengesetztem Kurs abzieht und am Horizont verschwindet — die Finte aus
  der Nacht hat funktioniert. Amos Hale hält dort Wache und hat es vor der Gruppe gesehen. Wer nie
  hochsteigt, erfährt es nicht und bricht ohne diese Gewissheit auf. Session-Schluss-Beat. (Bis
  2026-08-22 war der Beat umgekehrt: der Verfolger nur abgelenkt, nicht weg.)
- **Versteckte Grotte** (Int) — **kein Naturhohlraum und keine Truhe** (Hendriks Korrektur,
  2026-08-22): die Grotte ist selbst das Bauwerk, aus dem Fels geschlagen, urzeitlich schwer, alles
  aus einem Stück Stein — kein Holz, kein Metall, kein Mörtel, nichts Europäisches. Zeichentafel
  und eine fugengenaue **steinerne Klappe** sind Teil der Wand; die vier Siegelsteine in ihren
  Mulden sind die einzigen beweglichen Teile im Raum. Gewalt ist ausdrücklich kein Weg (massiver
  Fels, kein Scharnier, kein Schloss).
  **Hendriks Rätsel** (Reim und Symbole von ihm; löst das frühere „Tiger"-Rätsel ab): die sechs
  Symbolzeilen der Tafel ergeben bei erfolgreicher Intelligenz-Probe einen Reim, der den **Jaguar**
  beschreibt — Rosetten auf goldenem Fell („Ringe aus Nacht, die Sonne wohnt"), als einziger seiner
  Familie nicht wasserscheu, tötet mit dem Schädelbiss, lautlos, Herrscher der Unterwelt bei Nacht.
  Von vier Siegelsteinen (Eule/Katze/Schlange/Maus) ist die **Katze** der richtige, weil sie als
  einzige den Jaguar abbildet. In die Vertiefung gedrückt fährt die Klappe auf; dahinter eine
  flache Nische mit einem verzierten Säbel, in dessen Klinge ein Jaguar eingraviert ist — ohne
  jede Erklärung dazu (Bibel 7.4: „ein Vorteil, den die Spieler haben, ohne ihn zu kennen").
  Falscher Stein: ein Knall und ein Fauchen wie von einer Großkatze, aus dem Stein selbst, beliebig
  oft erneut versuchbar — SL-Ermessen koppelt wiederholten Lärm an ein früheres Eintreffen der
  Affen (siehe 6.4).

### 6.4 Der Zeitdruck: „Die Stimmung kippt" → „Die Affen greifen an"

Kein Timer-Code, sondern SL-Ermessen, seit 2026-08-22 in zwei Stufen (Hendriks Vorgabe; ersetzt
die früheren feindlichen Ureinwohner vollständig — auf der Insel gibt es keine Menschen):

1. **„Die Stimmung kippt"** — über mehrere Stationen hinweg in kleinen Dosen eingestreut, sobald
   die Gruppe eine Weile unterwegs ist: Geräusche setzen kurz aus, in den Wipfeln bewegt sich
   etwas mit, eine angebissene Frucht mit noch feuchtem Fleisch, aufgewühlter Boden an einer schon
   besuchten Stelle. Jeweils ein, zwei Sätze, keine Probe, keine Konsequenz, **keine Deutung durch
   die SL** — die Spieler entscheiden selbst, ob sie das ernst nehmen.
2. **„Die Affen greifen an"** — sobald die SL die Gruppe forttreiben will (grober Richtwert 30–60
   Minuten reale Erkundungszeit, Stoppuhr im Adminpanel). Aus dem Blätterdach bricht eine
   unzählbare Menge Affen hervor; ausdrücklich kein gewinnbarer Kampf, sondern eine Flucht zurück
   Richtung Strand und Boot, Schaden nach SL-Ermessen (Kratzer und Bisse, nichts
   Lebensbedrohliches). Praktisch bildet der bestehende „↺ Zurücksetzen"-Knopf (Abschnitt 4.3)
   diesen erzwungenen Rückzug technisch ab.

Die Erkundung endet damit bewusst vorzeitig, nicht jede Fundstelle muss in einem Durchgang
entdeckt werden. Zwei optionale Anknüpfungspunkte: die „Ungewöhnlichen Abdrücke" (`zp1l`, seit dem
Wechsel handförmige Abdrücke statt menschengroßer Fußspuren) als mögliche Vorwarnung im Rückblick,
und wiederholte laute Fehlversuche am Rätsel der Grotte als plausibler Grund, den Zeitpunkt
vorzuziehen.

---

## 7. Vorgeschaltete Szene: „Golden Lion — Die Flucht" (10.1)

Die Riffinsel ist die Fortsetzung von Szene `10.1` (`js/golden_lion_scenes.js`, neuer Zustand der
bestehenden Golden-Lion-Karte, kein neues Kartenbild): die Flucht vor dem spanischen Verfolger aus
Bibel 7.4, mit der Licht-Finte (Master-and-Commander-Anlehnung: falscher Mast mit Laterne aufs
Beiboot), striktem Feuerverbot trotz geladener Kanonen, und Harwicks Zustand nach dem Verrat,
verzweigt nach dem Ausgang der Kinder-Rettung im Artefakthandel (Bibel 12, permanente Konsequenz).
Der Übergang von `10.1` zu `11.1` markiert laut Bibel das Ende von Session 2.

---

## 8. Erweiterung auf neue Szenen — Checkliste

Um das System auf eine neue Örtlichkeit zu übertragen:

1. Neuen Eintrag in `EXPLORATION_GRAPHS` (`js/exploration_graphs.js`) unter der Szenen-ID anlegen
   — am einfachsten mit `graph_editor.html` direkt auf dem echten Kartenbild bauen, dann Export
   reinkopieren.
2. **Jede gewünschte Zweiwege-Verbindung braucht zwei Kanten** (siehe Abschnitt 2.3/11) — der
   Editor fragt seit dem Fix danach, aber bei manuellen Änderungen direkt im Code leicht zu
   vergessen.
3. `ort`-Knoten brauchen einen passenden, existierenden Marker in der Szene (`ortId`) — keine
   eigenen `top`/`left`-Werte eintragen.
4. Auf der zugehörigen Karte (`karte.html`) braucht es nichts Neues — Ring/Pfeile/Fog/Flavortext
   greifen automatisch, sobald `getExplorationGraph(sceneId)` einen Treffer liefert.
5. Im Adminpanel (`regie.html`/`js/regie_vault.js`) ebenfalls automatisch, solange die Szene über
   die normale Registry eingebunden ist (`getAllSceneEntries`/`getMarkersForScene`).
6. Vor dem Test: Node/vm-Validierungsskript auf Kanten-Validität (alle `from`/`to` existieren)
   und Erreichbarkeit aller Knoten vom Startknoten aus laufen lassen (siehe Abschnitt 9).
7. Mit Playwright gegen `python3 -m http.server` testen (kein Firebase nötig, Skill
   `pnp-safe-test`) — Debug-Overlay (`?erkundungDebug`) für die visuelle Kontrolle nutzen.

---

## 9. Validierungs-Snippet

Wird in diesem Projekt wiederholt genutzt, um nach jeder Kantenänderung sofort zu prüfen, ob der
Graph noch wohlgeformt ist (alle Referenzen gültig, alles vom Start erreichbar) und ob noch
einseitige Kantenpaare übrig sind:

```js
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('js/exploration_graphs.js', 'utf8') + '\nglobalThis.__G = EXPLORATION_GRAPHS;';
const ctx = { globalThis: undefined };
vm.createContext(ctx);
ctx.globalThis = ctx;
vm.runInContext(code, ctx);
const g = ctx.__G['11.1'];

// 1. Alle from/to-Referenzen gültig?
const bad = [];
for (const [id, e] of Object.entries(g.edges)) {
  if (!g.nodes[e.from]) bad.push('BAD from: ' + id);
  if (!g.nodes[e.to]) bad.push('BAD to: ' + id);
}

// 2. Alle Knoten vom Start erreichbar?
const seen = new Set([g.startNode]);
let queue = [g.startNode];
while (queue.length) {
  const cur = queue.shift();
  for (const e of Object.values(g.edges)) {
    if (e.from === cur && !seen.has(e.to)) { seen.add(e.to); queue.push(e.to); }
  }
}
const unreachable = Object.keys(g.nodes).filter(id => !seen.has(id));

// 3. Einseitige Kantenpaare?
const pairs = new Set();
Object.values(g.edges).forEach(e => pairs.add([e.from, e.to].sort().join('|')));
const oneWay = [];
pairs.forEach(p => {
  const [a, b] = p.split('|');
  const ab = Object.values(g.edges).some(e => e.from === a && e.to === b);
  const ba = Object.values(g.edges).some(e => e.from === b && e.to === a);
  if (ab !== ba) oneWay.push(a + ' <-> ' + b);
});

console.log('Ungültige Referenzen:', bad.length ? bad : 'keine');
console.log('Unerreichbare Knoten:', unreachable.length ? unreachable : 'keine');
console.log('Einseitige Paare:', oneWay.length ? oneWay : 'keine');
```

---

## 10. Bewusst zurückgestellte Features

Mit Hendrik besprochen, aber **nicht** Teil dieses Systems (eigenes künftiges Vorhaben, betrifft
alle künftigen Szenen, nicht nur die Riffinsel):

- Eine automatische Mehrheitsentscheidung für die Bewegungsrichtung (aktuell bewusst gar keine:
  die SL gibt jede Bewegung von Hand frei, siehe 4.2).
- Ein eingebauter Zeit-Mechanismus/Timer-Code (aktuell: SL-Ermessen + Stoppuhr im Adminpanel).
- Echte Mini-Rätsel-Widgets direkt auf der Karte (aktuell: Ereignis-Knoten bleiben Text + Probe,
  das Kisten-Rätsel läuft rein am Tisch, kein UI-Element).
- Eine visuelle Graph-Darstellung/ein GM-Editor für den Graphen selbst im laufenden Adminpanel
  (existiert nur als separates Offline-Tool, `graph_editor.html`).

---

## 11. Fehlergeschichte (Post-Mortem)

Dieser Abschnitt ist bewusst ausführlich, weil die eigentliche Lehre aus diesem Projekt eine
**strukturelle** ist, keine einmalige Textkorrektur.

### 11.1 Marker-Kalibrierung

Mehrere Marker (Süßwasserquelle, Wrackteile, Aussichtsklippe, versteckte Grotte, später auch
Riffstrand) mussten nach Einbindung des echten Referenzbilds (`images/riffinsel.webp`, Gemini-
generiert) iterativ per Playwright-Screenshot gegen das Bild nachjustiert werden — anfängliche
Koordinaten waren Platzhalter/Augenmaß. Kein Graph-Problem, aber wichtig für Abschnitt 11.2:
solange Marker und Graph-Knoten getrennte Koordinaten pflegen (was bei `start`-Knoten der Fall
ist, siehe 2.2), können sie auseinanderlaufen.

Konkret geschah genau das beim Startknoten: der `riffstrand`-Marker stand bei `top:46,left:49`
(im Wasser, neben dem eigentlichen Landepunkt), während der `strand`-Graphknoten korrekt bei
`top:56.4,left:54.2` auf dem Sand lag. Hendriks Meldung „der Ortpunkt ist nicht an der
Startposition des Graphen" wurde beim ersten Versuch **falsch interpretiert** — der Graph wurde
an den (falschen) Marker angeglichen statt umgekehrt. Erst ein Bildvergleich (beide Kandidaten-
Koordinaten als Overlay auf das echte Kartenbild gelegt) zeigte eindeutig: die Graph-Koordinate
lag richtig, der Marker musste verschoben werden. **Lehre: bei einer Positions-Diskrepanz zuerst
gegen das tatsächliche Bild prüfen, nicht annehmen, welche der beiden Quellen „automatisch"
korrekt ist.**

### 11.2 Die einseitigen Kanten — die eigentliche Ursache

Der mit Abstand größte Fehlerblock: Hendrik meldete über mehrere Nachrichten hinweg wiederholt
„diese Verbindung fehlt" an ganz unterschiedlichen Stellen des Graphen (`zp_5`, dann
`zwischenpunkt2`/`zp3`, am Ende ein kompletter Vollcheck mit 10 weiteren betroffenen Paaren).
Jedes Mal dieselbe Struktur: eine Kante `A → B` existierte, die von Hendrik ebenfalls gewollte
Kante `B → A` fehlte.

Die Ursache war **kein Fehler im Graph-Datenmodell und keine Unklarheit in Hendriks Route**,
sondern ein Werkzeug-Bug in `graph_editor.html`: eine per Klick-Klick gezogene Kante legte immer
nur die eine angeklickte Richtung an. Da der Regelfall dieses Graphen ein zweiseitig begehbarer
Pfad ist (man kann eine Insel in beide Richtungen erkunden), musste die Gegenrichtung bisher
separat gezogen werden — und wurde das beim Bau des Graphen wiederholt vergessen, ohne dass das
beim Bauen selbst auffiel (der Editor zeigte pro Klick nur „Kante erstellt", ohne auf eine fehlende
Rückrichtung hinzuweisen).

Der erste Korrekturversuch fügte dazu noch eine falsche Kante hinzu (`zp_5 → zp_3`, von Hendrik
nicht vorgesehen), weil zu diesem Zeitpunkt aus Screenshots allein geraten wurde, welche exakte
Verbindung gemeint war. Erst als Hendrik für die betroffenen Knoten **jeden einzeln explizit
aufschlüsselte** („Zwischen Wrack und Grotte muss verbunden sein mit: ZP, Versteckte Grotte,
ZP_Jungle und Mitte_Jungle"), ließ sich die exakt richtige Kantenmenge ohne weiteres Raten
herstellen. Ein anschließender **Vollcheck des gesamten Graphen** (Abschnitt 9, Skript-Teil 3)
deckte auf, dass praktisch jede vor dem Editor-Fix gezogene Kante nur einseitig war — nicht nur
die bereits gemeldeten Cluster. Auf Nachfrage wurden alle verbleibenden 10 Paare in einem Zug
nachgetragen.

**Konkrete Lehren daraus, die für jede künftige Erweiterung dieses Systems gelten:**

1. **Nie eine Kante ohne Prüfung der Gegenrichtung anlegen.** Der Editor fragt seit dem Fix
   danach — bei direkten Code-Änderungen (wie bei den Nachträgen hier) muss das weiterhin von
   Hand mitgedacht werden.
2. **Bei einer gemeldeten „Verbindung fehlt" nicht aus Screenshots/Koordinaten raten, wenn eine
   präzisere Quelle verfügbar ist.** Sobald Hendrik die exakte Nachbarschaftsliste eines Knotens
   ausschreibt, ist das die verbindliche Quelle — kein Grund mehr, geografisch zu interpretieren.
3. **Nach jedem gemeldeten Fehler an einer Stelle den GANZEN Graphen auf dasselbe Muster prüfen**
   (Abschnitt 9, Skript-Teil 3), statt nur die gemeldete Stelle zu fixen. Hier wurden nach den
   ersten beiden Fixes noch 10 weitere betroffene Paare per Vollcheck gefunden, die sonst
   vermutlich in denselben Einzelmeldungen weitergegangen wären.
4. **Root Cause vor Symptom-Fix:** die eigentliche Behebung war nicht nur, fehlende Kanten
   einzeln nachzutragen, sondern den Editor selbst zu fixen (Abschnitt 5), damit derselbe
   Fehlertyp bei künftigen Graphen gar nicht erst entsteht.

---

## 12. Kurzreferenz: relevante Dateien

| Datei | Rolle |
|---|---|
| `js/exploration_graphs.js` | Generisches Graph-Datenmodell + Helper-Funktionen + der eigentliche Riffinsel-Graph |
| `js/riffinsel_scenes.js` | Marker/Hintergrundbild der Szene `11.1` |
| `js/regie.js` (`ORTE.riffstrand` etc.) | GM-Story-Inhalte je Fundstelle, Fallback-Referenztext |
| `karte.html` | Spieler-Rendering: Ring, Pfeile, Flavor-Text, Fog of War, Debug-Overlay |
| `js/regie_vault.js` | Adminpanel-Logik: 🧭-Panel, Abstimmung, Probe-Auflösung, Reset, Firebase-Schreibzugriffe |
| `graph_editor.html` | Eigenständiges Offline-Werkzeug zum visuellen Bauen/Bearbeiten eines Graphen |
| `js/golden_lion_scenes.js` (`"10.1"`) | Vorgeschaltete Fluchtszene, führt in die Riffinsel |
