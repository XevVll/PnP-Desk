# CLAUDE.md — Projekt-Gedächtnis

Kurzer technischer Leitfaden für dieses Repo. Die eigentliche Story-/Design-Doku steht in
`KAMPAGNEN-BIBEL.md` — vor inhaltlicher Arbeit lesen, v. a. Abschnitt 13 „Technischer Stack"
und Abschnitt 17 „Arbeitsweise". Dieses Dokument hier ist rein technisch/prozessual und hält
zusätzlich einen laufenden Changelog.

> **Laufender Arbeitsstand (WIP):** Der **Codex** (`codex.html`) ist noch in Arbeit — Einstiegspunkt,
> nächster Schritt und Arbeitsweise dafür stehen in **`ARBEITSSTAND.md`** (dort weiterlesen, bevor
> an diesem Strang gearbeitet wird). Der **Schatzinsel-Szenen-Durchgang** ist seit August 2026
> abgeschlossen (siehe Changelog unten) — die **Übergangsszenen nach der Insel**
> (`5.1`/`6.1`/`7.1`/`8.1`) sind damit ebenfalls alle vier fertig. Der **Artefakthandel** (`9.1`)
> und die anschließende **Flucht + Riffinsel** (`10.1`/`11.1`) sind ebenfalls fertig — damit ist
> **Session 2 (Bibel 7.4) inhaltlich abgeschlossen**. Nächster Schritt offen (Session 3 /
> Offizierskonferenz, Bibel 7.5, oder Codex).

## Projekt in Kürze

Statische GM/Spieler-Toolseite für eine Piraten/Kaperfahrer-Pen&Paper-Kampagne („Korsaren"),
gehostet über GitHub Pages, kein Build-Schritt. Firebase Realtime Database synchronisiert die
Spielleiter-Ansicht (`regie.html`) live mit der Spieler-Kartenansicht (`karte.html`).

## Architektur-Muster (Details: Bibel 13.2)

- **MAP_REGISTRY-/`getAllSceneEntries()`-Muster:** Jede Karte/Örtlichkeit (Grimsgate-Stadt,
  Golden-Lion-Schiff, Schatzinsel) ist eine eigene Datei (`js/scenes.js`,
  `js/golden_lion_scenes.js`, `js/schatzinsel_scenes.js`) mit direkten Funktionsreferenzen statt
  `window[]`-Lookups (wegen `const`/`let`-Scoping). Neue Karte = neue Datei + ein
  Registry-Eintrag in `karte.html` UND `regie.html`, sonst nichts.
- **Zwei Marker-Muster:**
  - *Flach* (`scenes.js`, `schatzinsel_scenes.js`): jede Szene listet ihre Marker komplett
    selbst. Passt, solange eine Örtlichkeit nur einen Szenen-Zustand hat.
  - *Basis/Override* (`golden_lion_scenes.js`): Marker-Position/Titel/Bild nur EINMAL in
    `..._MARKERS_BASE`, Szenen überschreiben nur `imgOverrides`/`descOverrides`/`hiddenMarkers`.
    Nötig, sobald eine Örtlichkeit mehrere Szenen-Zustände bekommt.
- **DER STANDARD-FALL für eine neue Szene mit mehreren Orten ist FLACH, kein Sub-Orte-Container:**
  Die Szene selbst ist der Hintergrund (`background`), jeder Ort ein eigener Haupt-Marker direkt
  darauf — genau wie Grimsgate (`heuer`/`taverne`/`markt`/... direkt auf `grimsgate_map.webp`,
  KEIN Marker, der „Grimsgate" selbst nochmal repräsentiert). `parentId`-Sub-Orte (siehe unten)
  sind die Ausnahme, gerechtfertigt nur wenn EIN EINZELNER dieser Orte selbst mehrere klar
  unterscheidbare Klickstellen innerhalb seines eigenen Nahaufnahme-Bilds braucht (Thahal-Dorf,
  Schmugglernest-Höhlenstadt) — nicht als Standard-Wrapper für eine ganze neue Szene. Fehler
  passiert im August 2026 bei `7.1`/`8.1`: ein künstlicher „Container"-Marker für die ganze
  Szene wurde angelegt, obwohl die Szene selbst schon der Hintergrund ist — auf Hendriks
  Korrektur ersatzlos entfernt, siehe Changelog.
- **Szenen-ID-Konvention:** führende Ziffer = Örtlichkeit (1.x Grimsgate, 2.x/3.x Golden Lion,
  4.x Schatzinsel), zweite Ziffer = Zustand dieser Örtlichkeit. Eine NEUE Örtlichkeit bekommt
  eine NEUE führende Ziffer, statt einfach weiterzuzählen — Fehler ist am 29.07. passiert
  (Schatzinsel fälschlich als `3.2` statt `4.1`, siehe Changelog).
- **Szenen-Label ohne Nummer (seit 30.07.):** Die ID (z.B. `"2.1"`) bleibt intern nötig
  (Firebase-Pfade, Szenen-Zuordnung), taucht aber im `label`-Text nicht mehr auf — nur noch
  Ortsname (+ Zustand, falls das für Unterscheidbarkeit nötig ist, z.B. „Golden Lion im
  Sturm"). Grund: Seit Marker einzeln live ein-/ausblendbar sind (`hiddenMarkersLive`),
  brauchen unterschiedliche „Zustände" derselben Örtlichkeit oft keine eigene Szene mehr —
  die Nummer suggerierte eine Reihenfolge/Feingranularität, die es im Admin-Panel gar nicht
  mehr braucht.
- **`szenenUeberschreibungen`** (`regie.js`): analoges Override-Prinzip für die GM-Felder
  `personen`/`kurz`/`ortHinweis`, aufgelöst über `resolveOrtForScene()` in `regie.html`. Ohne
  dieses Feld zeigt das Admin-Panel für eine neue Szene weiterhin den Text der Basis-Szene.
- **`nurSzenen`/`nichtInSzenen`** (`regie.js`, pro Interaktion): steuert, in welchen Szenen eine
  GM-Interaktion im Admin-Panel auftaucht.
- **Bild-Overlay-Fallback:** Marker ohne `img` zeigen in `karte.html` automatisch „Kein Bild
  hinterlegt." — kein Crash, wirkt für Spieler/GM aber wie ein Fehler. Lieber ein
  Platzhalter-Bild setzen (z. B. das Kartenbild selbst) als das Feld leer zu lassen.

## Workflow-Eigenheiten

- **Bilder:** Neues PNG in `images/` ablegen, dann `python3 tools/optimize_images.py` (WebP,
  Kantenlänge je nach Namensmuster gekappt). Löscht das PNG NICHT automatisch, trägt den neuen
  Dateinamen NICHT automatisch in `.js`-Dateien ein — beides bleibt manuell.
- **Audio:** Datei in `audio/` ablegen, dann `python3 tools/optimize_audio.py <datei.mp3>`
  (Opus/OGG, 64 kbps VBR, volle Länge bleibt erhalten). Hendrik hört jede konvertierte Datei
  komplett an — nicht ohne explizites „passt" mergen.
- **Git-Push-Eigenheit:** Der Remote-Feature-Branch behält oft eine veraltete Spitze von vor
  einem früheren Squash-Merge, wodurch `git push` als „non-fast-forward" abgelehnt wird, obwohl
  der Inhalt längst in `main` gemergt ist. Fix: `git fetch origin <branch>`, dann
  `git diff FETCH_HEAD origin/main --stat` (bestätigt: kein echter Unterschied), dann
  `git merge --no-edit FETCH_HEAD`. Bei Konflikten (kommt vor, wenn dieselben Zeilen mehrfach
  angefasst wurden): `git checkout --ours <datei>` — die eingehende Seite ist immer die
  veraltete.
- **Testen ohne Firebase:** `python3 -m http.server` + Playwright/Chromium headless, Szenen-
  Funktionen direkt per `page.evaluate()` aufrufen (z. B. `getMarkersForScene('4.1')`), da ohne
  echte Firebase-Verbindung nichts live geschaltet werden kann.
- **Merge-Ablauf:** Branch → Commit → Push → PR → auf Hendriks explizites „merge" warten →
  Squash-Merge. Nie ungefragt mergen. **Ausnahme (seit 08/2026):** kleine Fix-Branches (Korrektur
  an etwas gerade Gebautem, z. B. Positions-/Verhaltens-Korrekturen) werden nach Test direkt
  gemergt, ohne jedes Mal auf ein explizites „merge" zu warten — gilt nicht für neue
  Features/Inhalte, da bleibt der normale Ablauf.

## Arbeitsweise (siehe Bibel 17)

Hendrik entwickelt Story-Inhalte selbst — keine proaktiven Inhaltsvorschläge ohne Anweisung.
Bei Story-Lücken lieber `[OFFEN]` in der Bibel vermerken als selbst etwas erfinden.

## Changelog

### 2026-08-21 (Fortsetzung 9)
- **Fix: Keine Bewegungspfeile mehr sichtbar nach dem Graph-Neubau.** Ursache: `graphState/11.1/
  currentNode` stand in Firebase noch auf einer Knoten-ID aus einer früheren Graph-Version (z. B.
  `weg_sued`), die es im neu gebauten Graphen gar nicht mehr gibt - `renderErkundungOnMap()`/
  `renderFogOfWar()` (`karte.html`) und `currentGraphNodeId()` (`js/regie_vault.js`) brachen daran
  mangels Treffer im `if (!node) return`-Guard komplett ab, weder Ring noch Pfeile noch Fog
  erschienen. Fix: neue gemeinsame Fallback-Logik (`resolveCurrentNodeId()` in `karte.html`,
  Inline-Fix in `currentGraphNodeId()`) - eine `currentNode`-ID, die im aktuellen Graphen nicht
  (mehr) existiert, wird jetzt genauso behandelt wie eine fehlende: Rückfall auf `startNode`, statt
  komplett zu verschwinden. Betrifft grundsätzlich jeden künftigen Graph-Neubau, nicht nur diesen
  Fall. Offline mit Playwright verifiziert (künstlich veraltete `currentNode`-ID gesetzt, Ring/
  Pfeile erscheinen trotzdem korrekt am Startknoten).

### 2026-08-21 (Fortsetzung 8)
- **Marker-Feinjustage der vier Riffinsel-Fundstellen** (Hendriks Vorgabe: "müssen deckungsgleich
  sein"). Süßwasserquelle, Wrackteile, Aussichtsklippe und versteckte Grotte in
  `js/riffinsel_scenes.js` per Playwright-Screenshot gegen das echte Bild (`images/riffinsel.webp`,
  1920×1047) pixelgenau nachjustiert — vorher lagen Quelle und Aussichtsklippe sichtbar daneben
  (Quelle am oberen Rand des Wasserfalls statt im Becken, Klippe im offenen Himmel rechts neben
  dem Fels statt auf dem Fels selbst). Da "ort"-Knoten im Erkundungs-Graphen ihre Position bereits
  vom Marker übernehmen (`getGraphNodePosition()`), wirkt sich das automatisch auch dort aus,
  keine Änderung an `exploration_graphs.js` nötig.

### 2026-08-21 (Fortsetzung 7)
- **Erkundungs-Graph nach Hendriks Referenz-Skizze neu aufgebaut** — diesmal von Hendrik selbst
  direkt mit `graph_editor.html` auf dem echten Kartenbild gebaut und als fertiger Code
  eingereicht, statt (wie zuvor) aus einer handgezeichneten Skizze abgeleitet. 15 Knoten (1 Start,
  10 Ereignisse, 4 Orte), 21 Kanten, alle vom Start erreichbar. Texte/Proben/Sinneshinweise für
  alle 10 Ereignis-Knoten und 21 Kanten im Dialog ausformuliert (Claude-Aufschlag, von Hendrik
  freizugeben) — 8 der 10 Ereignisse sind bekannte Konzepte aus dem vorherigen Durchgang
  (Krabbenschwarm, Fußspuren, Lianen, Dornengestrüpp, Wind, Durchschlupf, Felsvorsprung,
  Schlamm, Mückenschwarm), "Zirpen aus dem Unterholz" ist neu.
- **Echtes Rätsel in der versteckten Grotte** (Hendriks Vorgabe, eigener Reim-Text von Hendrik,
  nur zur Verwendung ins Deutsche übertragen): neue Interaktion
  `ORTE.versteckte_grotte.das_raetsel_der_kiste`. Eine Steinplatte mit Zeichen ergibt bei
  erfolgreicher Intelligenz-/Wissens-Probe einen Reim, dessen Antwort "Tiger" ist; von vier losen
  Tier-Steinen (Fisch/Vogel/Schlange/gestreiftes Raubtier) öffnet nur der gestreifte (Tiger) die
  Kiste. Falscher Stein: lauter Knall, Mechanismus bleibt zu, beliebig oft erneut versuchbar.
  SL-Ermessen-Kopplung an die Eingeborenen-Bedrohung: wiederholter Lärm kann deren Auftauchen
  vorziehen (`ORTE.riffstrand.die_eingeborenen` entsprechend ergänzt). Reines Text-/Logik-Rätsel
  für den Tisch, keine neue Software (Mini-Rätsel-Widgets bleiben bewusst zurückgestellt).

### 2026-08-21 (Fortsetzung 6)
- **Fog of War für Erkundungs-Graph-Szenen** (Hendriks Frage: Spieler sahen bisher das komplette
  Kartenbild inkl. aller Fundstellen auf einen Blick, obwohl der Graph selbst verdeckt war — der
  Nebel selbst hat den Zweck also unterlaufen). Neues `<canvas id="fogCanvas">` in `#mapWrap`
  (`karte.html`), `renderFogOfWar()`: dunkle Fläche über der ganzen Karte, weiche Kreis-Löcher
  (Radial-Gradient + `destination-out`) nur um Start + bereits besuchte Knoten (`history` +
  aktueller Knoten) - der Rest der Insel bleibt schwarz, bis die Gruppe dort war. Nur aktiv in
  Szenen mit definiertem `EXPLORATION_GRAPHS`-Eintrag (`getExplorationGraph()`), andere Karten
  unverändert voll sichtbar. `.marker` bekam ein explizites `z-index`, damit normale Marker
  zuverlässig UNTER dem Nebel liegen (vorher unklare DOM-Reihenfolge). Neu berechnet bei jedem
  Zug, Fenster-Resize und sobald das Kartenbild geladen ist (Canvas-Pixelgröße muss zur
  gerenderten Bildgröße passen). **Nebenbei zurückgesetzt:** `ERK_DEBUG` (komplette Graph-
  Sichtbarkeit zum Testen) war seit der letzten Runde versehentlich standardmäßig an — mit Fog of
  War würde das den ganzen Zweck sofort aushebeln, deshalb zurück auf Opt-in per
  `?erkundungDebug`. Offline mit Playwright verifiziert (Nebel erscheint nur bei Szenen mit Graph,
  wächst korrekt mit dem erkundeten Pfad) sowie per Screenshot gegengeprüft.

### 2026-08-21 (Fortsetzung 5)
- **Neues Werkzeug: `graph_editor.html`** (Hendriks Wunsch, nachdem das Ablesen einer
  handgezeichneten Routen-Skizze fehleranfällig war). Eigenständiges, lokales Tool ohne Firebase
  zum visuellen Anlegen/Bearbeiten eines `EXPLORATION_GRAPHS`-Eintrags direkt auf dem echten
  Kartenbild: Knoten per Klick setzen (Typ Start/Ereignis/Ort, alle Textfelder inkl. Probe/Erfolg/
  Misserfolg), per Ziehen neu positionieren, Kanten per Klick-Klick mit Sinneshinweis verbinden,
  bestehenden Graph-Code einfügen zum Weiterbearbeiten, fertigen JS-Code exportieren (Textfeld,
  Datei-Download, Zwischenablage). "Ort"-Knoten bekommen beim Export bewusst KEIN top/left (im
  echten Betrieb kommt ihre Position vom verknüpften Marker, `getGraphNodePosition()`) - beim
  Import bestehender Graphen ohne top/left landen sie als Platzhalter bei 50/50 und müssen einmal
  von Hand an die richtige Stelle gezogen werden. Offline mit Playwright verifiziert (Knoten/
  Kanten anlegen, Felder bearbeiten, Export-Struktur, Import des echten Riffinsel-Graphen mit
  14 Knoten/18 Kanten) sowie per Screenshot gegengeprüft.

### 2026-08-21 (Fortsetzung 4)
- **Ereignis-Flavortext jetzt auch für Spieler sichtbar** (Hendriks Wunsch). Neues, dauerhaft
  sichtbares Label unter der Positions-Markierung in `karte.html` (`.erk-pos-label`) zeigt
  `node.text` eines Ereignis-Knotens (z. B. "Ein dichter Schwarm Mücken empfängt jeden, der hier
  durchmuss.") - bewusst NUR das, niemals `erfolgText`/`misserfolgText` (bleiben SL-exklusiv in
  `regie.html`). Per Screenshot verifiziert.

### 2026-08-21 (Fortsetzung 3)
- **Erkundungs-Graph komplett nach Hendriks Referenz-Skizze neu aufgebaut** (handgezeichnete
  Route direkt auf dem echten Kartenbild). Knoten-Modell vereinfacht: der bisherige dritte Typ
  "Gabelung ohne Aufgabe" entfällt, jeder Nicht-Start-/Nicht-Ort-Knoten ist jetzt ein "ereignis"
  mit echter Probe UND ganz normalen Wegoptionen danach (Hendriks Skizze kennt nur Grün=Aufgabe
  und Blau=echter Ort). `karte.html`/`js/regie_vault.js` entsprechend angepasst — Ereignis-Knoten
  zeigen jetzt Pfeile/Optionen wie jeder andere Entscheidungspunkt, nicht mehr nur eine "Weiter"-
  Sackgasse. Neuer Graph: 14 Knoten (1 Start, 9 Ereignisse, 4 Orte), 18 Kanten, alle vier
  Ort-Knoten bewusst Sackgassen (keine Weiterführung nach dem Fund, wie in der Skizze). Fünf neue
  Ereignis-Knoten mit eigener Probe (rutschiger Felsvorsprung/Klettern, Dornengestrüpp/Körper,
  enger Durchschlupf/Geschick, schlammiger Boden/Geschick, herabhängende Lianen/Geschick) ergänzen
  die vier bestehenden. **Achtung:** Positionen/Kanten sind Claudes bestmögliche Ableitung aus der
  Skizze (viele kreuzende Linien, nicht pixelgenau garantiert) — mit dem Debug-Overlay gegen das
  Original gegengeprüft, aber noch nicht von Hendrik freigegeben.
- **Neue Bedrohung: Die Eingeborenen** (Hendriks Vorgabe, nicht von Claude erfunden). Neue
  Interaktion `ORTE.riffstrand.die_eingeborenen`: SL-Ermessen, nach ca. 30-60 Minuten realer
  Erkundungszeit (Stoppuhr im Adminpanel) tauchen feindliche Ureinwohner auf, jagen die Gruppe
  zurück zum Schiff — beendet die Erkundung bewusst vorzeitig, bevor alles gefunden werden kann.
  Praktisch bildet der bestehende "↺ Zurücksetzen"-Knopf (🧭-Bereich) den erzwungenen Rückzug ab,
  keine neue Technik nötig. `SZENEN_REGIE["11.1"].uebergeordnetesZiel` entsprechend ergänzt.

### 2026-08-21 (Fortsetzung 2)
- **Bewegungspfeile deutlicher sichtbar** (Hendriks Feedback: gingen im detailreichen Artwork
  unter). `.erk-arrow` in `karte.html` von 30px auf 48px vergrößert, kräftigeres Blau
  (`#4a90e2`), plus pulsierender Hintergrundkreis (`.erk-arrow-bg`, gleiches Pulsieren-Prinzip
  wie `.marker .pin`) für Kontrast gegen das Kartenbild. Abstand zur Positions-Markierung
  entsprechend von 56px auf 68px erhöht. Stimmen-Badge größer/fetter (`.erk-arrow-votes`).
- **Ereignis-Knoten bekommen echte Proben statt "optional"** (Hendriks Feedback: kaum
  Würfelproben zu lösen). Alle vier Riffinsel-Ereignisse (Mückenschwarm/Fußspuren/Wind/Krabben,
  `js/exploration_graphs.js`) haben jetzt eine verbindliche Probe mit `erfolgText`/
  `misserfolgText` (SL-Referenz zum Vorlesen, analog zu den vier Ort-Proben) statt der bisherigen
  unverbindlichen "(optional)"-Markierung ohne echte Konsequenz — Misserfolg bleibt bewusst leicht
  (meist 1 Schadenspunkt oder rein folgenlos bei der Wahrnehmungs-Probe), nie ein hartes
  Fehlschlag-Ende, der Weg selbst verzweigt an einem Ereignis-Knoten weiterhin nicht.
  `renderGraphPanelHTML()` (`js/regie_vault.js`) zeigt beide Texte jetzt zusätzlich zum
  Ereignis-Text an, bevor die SL auf "Weiter" klickt (gleiche `.sh-graph-ort-probe`-Darstellung
  wie bei den Ort-Proben). Offline mit Playwright verifiziert (Erfolg-/Misserfolg-Text im Panel,
  Pfeil-Struktur unverändert funktionsfähig) sowie per Screenshot gegengeprüft.

### 2026-08-21 (Fortsetzung)
- **Fix: On-Map-Pfeile zeigten in falsche Richtungen.** Seit dem echten Referenzbild haben alle
  Graph-Knoten echte, aussagekräftige Koordinaten (siehe voriger Eintrag) - der bisherige
  Auto-Fächer (`renderErkundungOnMap()`, `karte.html`) verteilte Pfeile aber weiterhin blind über
  einen festen oberen Bogen statt zur tatsächlichen Zielposition zu zeigen. Sichtbarer Fehler:
  am Startpunkt zeigte ein Pfeil Richtung offenes Wasser/Schiff statt beide ins Inselinnere.
  Fix: jeder Pfeil (Vorwärts-Kante UND die Zurück-Option) bekommt jetzt die per `atan2()`
  berechnete tatsächliche Richtung zu `getGraphNodePosition()` des Zielknotens - der bisherige
  Fächer-Sonderfall für die Zurück-Option war dadurch überflüssig und wurde entfernt, eine
  einzige Schleife behandelt jetzt beide Fälle einheitlich. Per Playwright-Screenshot an zwei
  Knoten gegengeprüft (Start, Lichtung-Gabelung mit 3 Kanten + Zurück).

### 2026-08-21
- **Echtes Referenzbild für die Riffinsel eingebunden** (`images/riffinsel.webp`, von Hendrik via
  Gemini generiert, siehe Prompt-Vorlage aus dem Gespräch). PNG->WebP über
  `tools/optimize_images.py` (7,7 MB -> 402 KB, 1920×1047) - `riffinsel.png` dafür neu in
  `MAP_NAMES` aufgenommen (sonst würde die 900px-Portrait-Kappung statt 1920px greifen).
  `js/riffinsel_scenes.js`: `background` und alle 5 Marker-`img`-Felder von `schatzinsel.webp`
  (Platzhalter) auf das neue Bild umgestellt, Marker-Koordinaten (`top`/`left`) auf die tatsächliche
  Bildkomposition abgestimmt (Riffstrand am Ankerplatz neben dem Schiff, Süßwasserquelle am
  Wasserfall-Becken, Wrackteile an den sichtbaren Rumpfresten unten rechts, Aussichtsklippe am
  Felsvorsprung oben rechts, versteckte Grotte am Höhleneingang unter dem Wurzelvorhang).
  `js/exploration_graphs.js`: alle Start-/Gabelungs-/Ereignis-Knoten-Koordinaten ebenfalls auf die
  echte Insel-Geografie umgestellt (vorher grobe Platzhalter-Verteilung). Per Playwright-Screenshot
  mit aktivem Debug-Overlay (siehe 2026-08-20 Fortsetzung 4) visuell gegen das Referenzbild
  geprüft und nachjustiert (Wrackteile-Position einmal korrigiert). Rohes `riffinsel.png` bewusst
  nicht gelöscht (Konvention: erst nach Sichtprüfung von Hand entfernen, siehe
  `tools/optimize_images.py`-Docstring).

### 2026-08-20 (Fortsetzung 5)
- **Erkundungs-Graph: SL-Reset, Fix für "springt wild rum", Debug-Overlay standardmäßig an**
  (Hendriks Bug-Reports nach dem ersten Testlauf).
  - **Ursache des wilden Springens gefunden und behoben:** `graphAdvance()`/`graphGoBack()`
    schrieben bisher drei einzelne Firebase-Werte nacheinander (`currentNode.set()`,
    `history.set()`, `votes.remove()`) - der Listener in `attachGraphStateListener()` feuerte
    dadurch bis zu dreimal pro Zug, jedes Mal mit einem nur teilweise aktualisierten
    Zwischenstand. Bei aktivem Auto-Advance-Testmodus (`AUTO_ADVANCE_THRESHOLD = 1`) konnte
    `maybeAutoAdvance()` auf so einem Zwischenstand nochmal auslösen. Fix: ein einziges
    `db.ref('graphState/...').update({currentNode, history, votes: null})` - atomare
    Schreiboperation, der Listener feuert nur noch einmal mit bereits konsistentem Endstand.
  - **Neuer `graphReset()`**: SL-Button "↺ Zurücksetzen" im 🧭-Panel (`regie.html`) löscht
    `graphState/{szene}` komplett - Gruppe fällt automatisch auf den Startknoten zurück
    (`currentGraphNodeId()` nutzt bei leerem Snapshot ohnehin `startNode` als Fallback). Deckt
    bereits gefundene Orte NICHT wieder ab (`hiddenMarkersLive` bleibt unberührt) - betrifft nur
    die Position im Graphen, nicht bereits erzählte Entdeckungen.
  - **Debug-Overlay jetzt standardmäßig sichtbar** (`ERK_DEBUG` in `karte.html`) - Hendrik hatte
    den nötigen `?erkundungDebug`-Parameter übersehen. Umgedreht auf Opt-out
    (`?erkundungHideDebug`), da für die laufende Testphase ohnehin fast immer sichtbar gewünscht.
    Vor echtem Session-Beginn wieder umstellen/entfernen (Kommentar im Code).
  - Offline mit Playwright verifiziert: `graphAdvance()`/`graphReset()` mit Fake-`db` auf genau
    einen atomaren Schreibzugriff geprüft (statt vormals drei), Reset-Button-Präsenz,
    Debug-Overlay-Default-Verhalten.

### 2026-08-20 (Fortsetzung 4)
- **Erkundungs-Graph: Debug-Overlay zum Testen** (Hendriks Wunsch, "Pfad + Eventpunkte sichtbar
  lassen"). Neuer Query-Parameter `?erkundungDebug` auf `karte.html` zeigt den kompletten
  verdeckten Graphen sichtbar auf der Karte — alle Knoten als farbige Punkte (Lila=Start,
  Gelb=Gabelung, Grün=Ereignis, Blau=Ort, gleiche Farbcodierung wie Hendriks Skizze) mit
  Namens-Label, alle Kanten als rote Linien (neues `<svg id="erkDebugSvg">` in `#mapWrap`, viewBox
  0–100 im selben %-Koordinatenraum wie Marker/Positions-Ring). Ohne den Parameter bleibt alles
  wie vorgesehen verdeckt — reine Testhilfe, keine Spieler-Funktion, an keiner Stelle mit
  Firebase verknüpft. Offline mit Playwright verifiziert (12 Knoten/16 Kanten sichtbar mit
  Parameter, nichts sichtbar ohne, normale Positions-/Pfeil-Anzeige bleibt unverändert darüber)
  sowie per Screenshot gegengeprüft.

### 2026-08-20 (Fortsetzung 3)
- **Erkundungs-Graph: Spieler können jetzt immer umkehren** (Hendriks Vorgabe). Neues
  `graphState/{szene}/history`-Array (Firebase, gepflegt von `graphAdvance()`/neu
  `graphGoBack()` in `js/regie_vault.js`) hält den bisherigen Weg fest. Sobald `history` nicht
  leer ist, hängt die neue Funktion `getPlayableOptions()` (`js/exploration_graphs.js`) eine
  synthetische Zurück-Option (`BACK_EDGE_ID = "__back__"`) an die normalen Kanten an — führt ohne
  Probe/Fund-Gate zum jeweils letzten besuchten Knoten zurück (man war ja schon dort), auch an
  Ereignis-Knoten (dort sonst keine Spieler-Wahl). `karte.html`: der Zurück-Pfeil bekommt, wo
  möglich, die tatsächliche Richtung zum vorherigen Knoten (statt in den Vorwärts-Fächer
  eingereiht zu werden) und ist farblich abgesetzt (gedämpftes Grau statt Blau). `regie.html`:
  gestrichelter "↩ Zurück"-Button im 🧭-Panel. `maybeAutoAdvance()` berücksichtigt die Zurück-
  Option ebenso wie normale Kanten. Offline mit Playwright verifiziert (kein Zurück-Button am
  Start, korrekte Options-Liste inkl. Zurück-Ziel, Panel- und On-Map-Rendering, Ereignis-Knoten
  mit nur der Zurück-Option) sowie per Screenshot gegengeprüft.

### 2026-08-20 (Fortsetzung 2)
- **Erkundungs-Graph, Spieler-Ansicht auf On-Map-Pfeile umgestellt** (Hendriks Vorgabe: Optionen
  direkt am aktuellen Punkt zeigen statt als Liste). `karte.html` zeigt jetzt eine Positions-
  Markierung (Ring) direkt auf der Karte an der Koordinate des aktuellen Graph-Knotens, umgeben
  von Pfeil-Buttons (einer pro Kante, im oberen Bogen gefächert, Sinneshinweis als Hover-Label wie
  bei normalen Markern) statt der vorherigen Panel-Liste (`#erkundungPanel` entfernt). "Ort"-Knoten
  übernehmen ihre Position vom verknüpften Marker (`getGraphNodePosition()`, neu in
  `js/exploration_graphs.js`) statt sie zu duplizieren — die Ring-Markierung sitzt dadurch schon
  vor der Aufdeckung an derselben Stelle wie der später erscheinende echte Marker. Alle Knoten
  bekamen dafür vorläufige `top`/`left`-Koordinaten (Platzhalter-Layout, an kein echtes Artwork
  gebunden, siehe Kommentar in der Datei).
- **Auto-Advance zum Testen: schon ab 1 Stimme bewegt sich die Gruppe weiter** (Hendriks
  ausdrücklicher Test-Wunsch), statt auf eine echte Mehrheit zu warten — es gibt aktuell keine
  verlässliche Grundlage, wie viele Spieler insgesamt aktiv sind (kein Presence-Konzept über die
  reine Marker-Ansicht hinaus). Neue Konstante `AUTO_ADVANCE_THRESHOLD` (aktuell `1`) in
  `js/regie_vault.js`, geprüft bei jeder Stimmen-Änderung (`maybeAutoAdvance()`) — ignoriert dabei
  Stimmen für Kanten, die nicht tatsächlich vom aktuellen Knoten ausgehen (Schutz vor kurzzeitig
  veralteten Stimmen während eines Übergangs). Bei einer noch nicht aufgedeckten "ort"-Kante öffnet
  das automatisch die Probe-Auflösung (Erfolg/Misserfolg bleibt SL-Handsache), bei allen anderen
  Kanten wird direkt weitergezogen. Schwelle bewusst als einzelne Konstante ausgelagert, um sie
  später leicht zu erhöhen bzw. an ein echtes Mehrheits-Konzept zu koppeln.
- Offline mit Playwright verifiziert (Positions-/Pfeil-Struktur, Ort-Koordinaten-Übernahme vom
  Marker, Ereignis-Knoten ohne Pfeile, Auto-Advance inkl. Stale-Stimmen-Schutz) sowie per
  Screenshot visuell gegengeprüft.

### 2026-08-20 (Fortsetzung)
- **Neues generisches Feature: Erkundungs-Graph** (`js/exploration_graphs.js`) — eine für Spieler
  verdeckte Knoten-/Kanten-Struktur (Start/Gabelung/Ereignis/Ort) für Szenen mit freier Erkundung,
  erstmals genutzt für die Riffinsel (`11.1`). An Entscheidungspunkten sehen Spieler nur einen
  kurzen Sinneshinweis pro Weg (Design-Regel 2.8), keine Karte/keinen Graphen. Erste Nutzung
  eines echten Spieler-Schreibzugriffs auf Firebase (`graphState/{szene}/votes/{sessionId}`,
  dieselbe `mySessionId` wie beim bestehenden `openMarkers`-Präsenz-Feature, Bibel 13.9,
  `onDisconnect().remove()`-Muster übernommen) — die eigentliche Bewegung (`currentNode` setzen,
  Marker per `hiddenMarkersLive` aufdecken) bleibt bewusst SL-exklusiv (`regie.html`), damit kein
  einzelner Spieler-Client den Szenenfortschritt direkt bestimmen kann. Ort-Knoten tragen eine
  Probe (Erfolg = aufdecken + weiterziehen, Misserfolg = am Ausgangsknoten bleiben, Konsequenztext,
  jederzeit erneut versuchbar) und werden nach Entdeckung selbst zu Entscheidungspunkten (weitere
  `edges`); Ereignis-Knoten sind reine Ein-Weg-Zwischenstopps mit Text (+optionaler Probe), kein
  neues Rätsel-Widget (bewusst als eigenes, späteres Vorhaben abgegrenzt, siehe unten). Riffinsel-
  Graph: 12 Knoten/16 Kanten, alle vier bestehenden Fundstellen über mehrere Routen erreichbar,
  vier neue reine Flavor-Ereignisse (Mückenschwarm, Fußspuren, Wind, Krabben). Admin-Panel
  (`regie.html`/`js/regie_vault.js`): neuer 🧭-Bereich im Szenenkopf (`renderSceneHead()`) mit
  Live-Stimmverteilung je Weg (jede Option direkt anklickbar, unabhängig von der Mehrheit), Probe-
  Auflösung (Erfolg/Misserfolg-Buttons) bei noch nicht entdeckten Ort-Knoten. Die alte, rein
  textuelle SL-Referenz (`ORTE.riffstrand`, Interaktion "die_erkundung") bleibt als Fallback
  erhalten (z.B. bei Firebase-Ausfall), Titel/Text entsprechend angepasst. Offline mit Playwright
  verifiziert (direkte Funktionsaufrufe für Knoten-Render/Probe-Fluss, siehe Skill
  `pnp-safe-test`), inklusive einer TDZ-Falle beim ersten Anlauf (neue `let`-State-Variablen
  mussten vor den bereits bestehenden Firebase-Init-catch-Zweig, der `renderAll()` synchron
  aufruft — exakt der schon dokumentierte Fall am Kopf von `js/regie_vault.js`).
- **Bewusst weiterhin zurückgestellt:** echte Mini-Rätsel-Widgets direkt auf der Karte (Ereignis-
  Knoten bleiben Text+Probe) sowie eine visuelle Graph-Darstellung/ein GM-Editor für den Graphen
  selbst (aktuell reines JS-Datenmodell wie bei Markern) — beides eigene, spätere Vorhaben.

### 2026-08-20
- **Session 2 zu Ende erzählt: Szene `10.1` "Golden Lion — Die Flucht" und neue Szene `11.1`
  "Riffinsel" ausformuliert** (Bibel 7.4, "Spanischer Angriff → Riffinsel"), Inhalt im Dialog mit
  Hendrik entwickelt und mehrfach verfeinert. Ausgangslage: Die Spieler haben den Artefakthandel
  (`9.1`) abgeschlossen (Massaker, Kinder gerettet, Artefakt geborgen) und werden vom spanischen
  Kriegsschiff verfolgt — derselbe wiederkehrende Offizier aus `7.1`, der seit der dortigen
  Kneipen-Eskalation Ezra Coombe gefangen hält.
  - **`10.1`** (neuer Golden-Lion-Zustand, `js/golden_lion_scenes.js`, optisch identisch zur
    Basis, Text trägt die Nacht-/Nebelstimmung): Cormacs Befehl "volle Segel, Lichter aus"
    (Oberdeck), Toms Kurs aufs rettende Riff (Achterdeck), ein optionaler Wahrnehmungs-Reveal —
    Ezra Coombe vom Verfolger als Spott/Warnung an den Mast gehängt (Achterdeck), die Licht-Finte
    mit falschem Mast und Laterne aufs Beiboot (Werkstatt, Master-and-Commander-Anlehnung), ein
    Riff-Ausguck mit Schadensrisiko bei Misserfolg (Bug), striktes Feuerverbot trotz geladener
    Kanonen (Batteriedeck), die gelungene Finte als Übergangs-Beat (Achterdeck) sowie Harwicks
    Zustand nach dem Verrat, verzweigt nach dem Ausgang von "Kinder retten" (Kapitänskajüte,
    permanente Konsequenz bei Bibel 12).
  - **`11.1`** (komplett neue Örtlichkeit, neue Datei `js/riffinsel_scenes.js`, flaches Muster,
    5 Marker, Platzhalterbild `schatzinsel.webp` bis echtes Artwork existiert): `riffstrand` ist
    von Anfang an sichtbar (Ankunft, Cormacs offene Erkundungsaufgabe), die vier übrigen Marker
    sind bewusst als Skill-gated Entdeckung angelegt — der SL blendet sie beim Szenenstart über
    den bestehenden `hiddenMarkersLive`-Schalter aus und erst bei erfolgreicher Probe wieder ein
    (keine neue Technik, siehe `ORTE.riffstrand`, Interaktion "Die Erkundung" für die SL-Referenz-
    Tabelle aller vier Proben). Süßwasserquelle (Instinkt/Survival, Charaktermoment mit Josiah
    Pryce), Wrackteile (Klettern/Körper, Dirk van Hoorn/Sam Oakley bergen Ausbesserungsmaterial),
    Aussichtsklippe (Klettern, Amos Hale — Schluss-Beat: Verfolger am Horizont nur abgelenkt, nicht
    weg, Haken für Session 3), versteckte Grotte (Wahrnehmung, eine versiegelte Kiste als Bibel-
    7.4-"Vorteil, den die Spieler noch nicht kennen", Bedeutung bewusst offengelassen).
  - Übliche Registry-Arbeit für die neue Örtlichkeit (`karte.html`/`regie.html`/
    `js/regie_vault.js`: `getAllSceneEntries`/`getSceneLabel`/`getMarkersForScene`,
    `SCENE_ORDER`), `SZENEN_REGIE["10.1"]`/`["11.1"]` mit `uebergeordnetesZiel` + wiederverwendetem
    Crew-Ghost-Pool. Offline mit Playwright verifiziert (Skill `pnp-safe-test`, 0 Fehler in
    `regie.html` und `karte.html`).
  - **Bewusst zurückgestellt:** Eine interaktive Karte (bewegliches Gruppen-Icon, Mehrheits-
    Entscheidung für Bewegungsrichtung, eingebauter Zeit-Mechanismus, On-Map-Rätsel-Widgets) wurde
    mit Hendrik besprochen, aber explizit als eigenes künftiges Vorhaben abgegrenzt — betrifft alle
    künftigen Szenen, nicht nur diese, und verdient eine eigene Planungsrunde.

### 2026-08-14 (Fortsetzung 3)
- **Szene `9.1` (Artefakthandel) — Ankunfts-Beat und Kernszene ausformuliert**, Inhalt im
  Dialog mit Hendrik entwickelt (nicht von Claude erfunden): Windstille, Nebel, ein
  fremdartiges Schiff erscheint fast lautlos und hält auf die Golden Lion zu (`ORTE.
  handelstreffen`, Interaktion `das_fremde_schiff`). Danach die Kernszene — die Enthüllung, die
  Bibel 7.3/12.1 seit langem ankündigt ("Das Massaker zeigt Harwick als gefährlich"): Harwick,
  Cormac und Wat werden in der fremden Kajüte gefangen genommen (angeblich zu wenig Handelsware
  gebracht; Tom bewusst nicht Teil der Szene), die Gruppe kämpft sich im ersten wirklich
  ernsten Kampf der Kampagne frei, entdeckt dabei versklavte Kinder an Bord. Harwick denkt an
  seine für immer verlorene Tochter und gerät in manischen Blutrausch, will alle an Bord töten
  — Wat gehorcht ohne Murren, Cormac hält nur bei den Kindern inne. Die Kinder-Rettung hat einen
  echten SL-Ermessen-Fehlschlag: gelingt das Einschreiten nicht, sterben die Kinder und Harwick
  bleibt dauerhaft manisch, nicht mehr zu retten (permanente Konsequenz für seinen weiteren
  Handlungsbogen). Auflösung: Das Artefakt ist tatsächlich an Bord, gerettete Kinder verlangen
  die Übergabe des Schiffs (Harwick/Crew lenken ein), optionaler starker Ruf-Weg bei Cormac
  (Schatz-Anteil für die Kinder einfordern) — fest und unabhängig vom Spielerverhalten: alle
  Erwachsenen an Bord werden getötet. Offline mit Playwright verifiziert (siehe Skill
  `pnp-safe-test`).

### 2026-08-14 (Fortsetzung 2)
- **Neue Szene `9.1` „Artefakthandel" (Bibel 7.3) als Dummy angelegt**: ein Marker „Das
  Handelstreffen", flaches Muster (bewusst keine Sub-Orte, Hendriks Vorgabe), bereits mit
  echtem Referenzbild (`scene_artefakthandel.webp`, seit dem 14.08. vorbereitet) statt
  Platzhalter. Registry-Einträge in `karte.html`/`regie.html`/`js/regie_vault.js`
  (`getAllSceneEntries`/`getSceneLabel`/`getMarkersForScene`, `SCENE_ORDER`). `ORTE.
  handelstreffen` bewusst nur ein `[OFFEN]`-Rahmenhinweis, Ausarbeitung folgt in eigener Runde.
- **Ghosts für alle bisher leeren Szenen ergänzt** (Claude-Aufschlag, von Hendrik freizugeben):
  `3.1` (Golden Lion im Sturm — hatte bisher gar keinen `SZENEN_REGIE`-Eintrag, jetzt derselbe
  Crew-Pool wie `2.1`/`5.1`/`6.1` mit sturmgerechter Verfassung), `7.1` (neue, ortstypische
  Statisten für den spanischen Hafen), `8.1` (neue Statisten fürs Schmugglernest), `9.1`
  (wieder der Golden-Lion-Crew-Pool, Verfassung an die angespannte Wartesituation vor dem
  Handelstreffen angepasst).
- **`mystic.ogg` neu konvertiert** (Opus, 64 kbps) aus `mystic.mp3` (183 MB) — Quelldatei
  bewusst nicht committet (zu groß fürs Repo-Limit, wird laut Workflow ohnehin nicht
  dauerhaft gehalten), noch keiner Szene zugeordnet.
- **Zwei weitere Hintergrundtöne eingebunden**, `BBay.ogg` und `flamenco.ogg` (aus `BBay.mp3`/
  `flamenco.mp3` konvertiert) — ebenfalls noch keiner Szene zugeordnet. Beim Pushen fiel auf,
  dass `flamenco.mp3` (134 MB) GitHubs 100-MB-Hardlimit reißt, obwohl die Datei in einem
  späteren Commit schon wieder gelöscht war — Git überträgt trotzdem den vollen
  Objekt-Verlauf. Mehrere lokale Einzel-Commits (u. a. von GitHub Desktop) mussten dafür zu
  einem sauberen Commit zusammengefasst werden (`git reset --soft` auf den letzten bereits
  gepushten Stand, neu committet) — nur möglich, weil diese Commits noch nirgends gepusht
  waren. Faustregel für künftige Audio-Uploads: Quelldateien über 100 MB nie einzeln
  committen, auch nicht kurzzeitig.
- **ffmpeg nachinstalliert** (`winget install Gyan.FFmpeg`) — war für `tools/optimize_audio.py`
  nicht im PATH vorhanden.

### 2026-08-14 (Fortsetzung)
- **Marker-Feinjustage 7.1/8.1** nach Hendriks Sichtprüfung der Kartenvorlagen: Arztpraxis/
  Kneipe/Markt in `7.1` neu positioniert, Fischerdorf/Höhlenstadt-Punkte in `8.1` getauscht.
- **`karte.html`: Sub-Orte respektieren jetzt `hiddenMarkersLive`** — vorher wurde ein
  Sub-Ort (z. B. der Artefakthändler) im Overlay immer angezeigt, unabhängig vom Live-
  Sichtbarkeits-Schalter im Admin-Panel. `renderSubMarkers` filtert jetzt danach, inklusive
  Live-Update, falls das Overlay beim Umschalten schon offen ist.
- **Bug-Fix: Werkzeugleiste folgte nicht der im Baum navigierten Szene** (Hendriks Bug-Report:
  Sound-Auswahl/Charakterleiste ließen sich für einzelne Szenen nicht mehr anpassen).
  Ursache: `viewState.szene` (`js/regie_vault.js`) wurde nur einmal beim Laden der Seite
  gesetzt und nie wieder aktualisiert, obwohl Sound-/Charakterleiste sowie die Live-Listener
  (`hiddenMarkersLive`/`openMarkers`/Szenen-Notizen) direkt daran hängen. Kein Folgefehler der
  heutigen Marker-Arbeiten, sondern ein eigenständiger, vorbestehender Bug — `vOpenSceneFolder`/
  `vOpenOrtFolder` aktualisieren `viewState.szene` jetzt bei jeder Navigation im Baum.

### 2026-08-14
- **Szene `8.1` (Schmugglernest) ausgearbeitet**, Inhalt im Dialog mit Hendrik entwickelt
  (nicht von Claude erfunden): drei Orte als Sub-Orte unter `schmuggler_lager`
  (`schmuggler_hoehlenstadt`/`schmuggler_artefakthaendler`, `parentId`-Muster wie beim
  Thahal-Dorf und `7.1`). Von außen ein unauffälliges Fischerdorf mit stillen
  Wohlstands-Indizien an drei Dorfbewohnern (Halskette/Brille/Gehstock) und einem
  periodischen Donnern — der Zugang liegt in einem als Fischkühlung getarnten Eisschrank,
  der nur auf ein hineingelegtes Stück Kohle reagiert (Hinweis dazu als geheimes
  Schmugglerlied mit echten Koordinaten, Dead Chest Island BVI, in `ORTE.kapitaenskajuete`
  Szene `5.1`). Dahinter: Treppe, Stahltür, Waffenkontrolle, dann die gewaltige Höhlenstadt
  (See, angelegte Schiffe, Zielübungen als Donnern-Quelle, Markt). Kernaufgabe: einen
  Artefakt-Kenner finden — ein Straßenkind stiehlt dabei Harwicks Unterlagen
  (Verfolgungsjagd bewusst kaum zu gewinnen, SL-Hinweis: Fang in der Praxis oft zulassen),
  führt bei Erfolg zum Artefakthändler, verlangt dort eine Belohnung — verweigert, hetzt es
  3-4 ältere Männer auf die Gruppe. `SZENEN_REGIE["8.1"]` neu mit `uebergeordnetesZiel`.
  Technischer Nebenbefund: Sub-Orte lassen sich nur eine Ebene tief verschachteln
  (`karte.html` öffnet Kind-Marker nicht rekursiv) — der Artefakthändler hängt deshalb
  direkt an `schmuggler_lager`, nicht an `schmuggler_hoehlenstadt`. Offline mit Playwright
  verifiziert (siehe Skill `pnp-safe-test`). Damit sind alle vier Übergangsszenen nach der
  Insel (`5.1`/`6.1`/`7.1`/`8.1`) fertig.
- **Artefaktkenner-Begegnung beim Artefakthändler nachgereicht** (`ORTE.schmuggler_artefakthaendler`,
  Interaktion `der_artefaktkenner`): ordnet das Artefakt anhand von Harwicks Unterlagen einer
  fremden Zivilisation zu, nennt Koordinaten zu einer Schamaneninsel (schaltet sie frei, Bibel
  7.4) und warnt eindringlich vor der Geisterwelt. Gibt der Gruppe einen einzelnen
  Schutz-Anhänger mit — **löst damit den bisher offenen Punkt in Bibel 12.1** (ob die Tochter
  wiederbelebt wird): der Anhänger schützt im Finale entweder einen Kämpfer vor Schaden, oder
  ermöglicht, der Tochter gegeben, ein kurzes Gelingen des Rituals als Abschied (sie spricht
  ihren Vater von der Schuld frei, kein zweites Leben). Bibel 12.1 entsprechend aktualisiert,
  `[OFFEN]`-Vermerk entfernt.
- **Referenzbilder für `7.1`/`8.1` eingebaut**, Platzhalter ersetzt: neun Bilder (PNG→WebP)
  auf die passenden Marker verteilt (Kartenbilder für den jeweiligen Szenen-Hintergrund,
  Nahaufnahmen je Sub-Ort). Umbenannt auf die `interior_`/Kartenbild-Namenskonvention, damit
  `tools/optimize_images.py` die richtige Größen-Kappung anwendet (`MAP_NAMES` erweitert). Ein
  bereits konvertiertes Bild (`scene_artefakthandel.webp`) liegt noch ungenutzt bereit für die
  künftige Artefakthandel-Szene.
- **Marker-Hierarchie in `7.1`/`8.1` nachträglich korrigiert** (Hendriks Vorgabe): In `8.1`
  ist die Höhlenstadt jetzt ein eigener Haupt-Marker statt Sub-Ort des Fischerdorfs, der
  Artefakthändler hängt als Sub-Ort an der Höhlenstadt statt am Fischerdorf. In `7.1` sind
  Arzt/Kneipe/Markt jetzt eigene Haupt-Marker direkt auf der Karte statt Sub-Orte der
  Anlegestelle. Zwischenstand (Anlegestelle bleibt als unsichtbarer Marker bestehen) wurde
  noch am selben Tag verworfen, siehe nächster Punkt.
- **„Anlegestelle"-Marker in `7.1` komplett entfernt, Ursache dokumentiert:** Statt eines
  unsichtbaren Marker-Rests für Francesco-Frage + Straßen-Passage wies Hendrik auf den
  eigentlichen Fehler hin — ein künstlicher Marker, der nur die ganze Szene nochmal
  repräsentiert, widerspricht dem Grimsgate-Standard (Szene = Hintergrund, jeder Ort ein
  eigener Haupt-Marker direkt darauf, kein Container). Beide Interaktionen hängen jetzt an
  `hafen_arzt` (ihrem eigentlichen Ziel), die allgemeine Hafen-Atmosphäre liegt jetzt in
  `SZENEN_REGIE["7.1"].stimmung` statt in einem Marker-`desc`. **Sub-Orte (`parentId`) sind
  die Ausnahme, nicht der Standard** — nur gerechtfertigt, wenn ein einzelner, bereits
  bestehender Ort selbst mehrere Klickstellen im eigenen Nahaufnahme-Bild braucht
  (Thahal-Dorf, Schmugglernest-Höhlenstadt), nicht als Wrapper für eine neue Szene mit
  mehreren Orten. Diese Klarstellung jetzt auch in Bibel 13.2 und Skill `pnp-scene`
  (Schritt 3 + Definition of Done) verankert, plus eine Memory-Notiz, damit der Fehler nicht
  wiederkehrt.

### 2026-08-13
- **Szene `7.1` (Spanischer Hafen) ausgearbeitet**, Inhalt im Dialog mit Hendrik entwickelt
  (nicht von Claude erfunden): vier Orte als Sub-Orte unter `hafen_anlegestelle`
  (`hafen_arzt`/`hafen_kneipe`/`hafen_markt`, `parentId`-Muster wie beim Thahal-Dorf). Ablauf:
  Francesco kann vor dem Landgang als Dolmetscher gefragt werden (sonst taucht er später in der
  Kneipe wieder auf), die Gruppe trägt Ezra Coombe durch die Straßen zum Arzt (Körper-/
  Geschick-Proben, kein Fehlschlag-Ende), ein kauziger Wundarzt mit anfänglicher
  Engländer-Abneigung rettet ihn sicher. In der Kneipe provozieren spanische Soldaten spürbar —
  eskaliert das wirklich, erscheint der Offizier mit Garde, die Gruppe flieht ohne Ezra, der
  unabgeholt zurückbleibt (Grundlage für dessen spätere persönliche Feindschaft, Bibel 8.1;
  Zukunfts-Faden dazu in Bibel 7.4 vermerkt: Ezra könnte beim späteren spanischen Angriff
  aufgeknüpft ausgehängt werden). Markt bekam nur kurze, wiederholte Wachen-Reibung
  (bewusst kein Eskalationsrisiko). `SZENEN_REGIE["7.1"]` neu mit `uebergeordnetesZiel`.
  Offline mit Playwright verifiziert (siehe Skill `pnp-safe-test`).

### 2026-08-11
- **Schatzinsel-Durchgang abgeschlossen:** neue Interaktion `kajuete_unterlagen`
  (`ORTE.schiffswrack`) als Lückenfüller vor der Höhle — Kapitänskajüte noch unrepariert
  (Klettern, Balken im Weg), Tür nicht eintreten (Harwicks Anweisung), zwei alternative Wege
  hinein (Toms Würfelspiel um den Zweitschlüssel ODER Mechanik-Probe am Schloss), gefundene
  Unterlagen liefern den ersten diegetischen Hinweis auf das Schmugglernest. Dazu ein
  `ortHinweis` zur nahenden Regenzeit als grober SL-Zeitrahmen für die ganze Insel-Unternehmung
  (separat von der bestehenden Gezeiten-Logik der Höhle). „Die Kammer der Göttin"
  (`ORTE.hoehle`) bekam 9 neue Trigger: Hebel-Mechanismus (Körper), Komplikation mit zwei
  Reparaturwegen (Mechanik ODER Körper-Gegenhalten), Wächter-Zweifel als Split-Fokus-
  Beruhigung aus der Ferne (Rhetorik/Menschenkenntnis/Instinkt), Flut als SL-Timer im
  Hintergrund, Misserfolg = Schatz-Fehlbetrag später beim Artefakthandel. `truhen_tragen`
  verfeinert: zwei Personen pro Kiste, ein Körper-Misserfolg wird vom Partner-Erfolg
  ausgeglichen.
- **Vier neue Szenen nach der Insel angelegt** (Bibel 7.2, Verzweigung 1): `5.1`
  „Golden Lion — Nach der Insel" und `6.1` „Golden Lion in der Flaute"
  (`js/golden_lion_scenes.js`, optisch identisch zur Basis-Szene `2.1`, wie beauftragt) sowie
  zwei neue eigenständige Karten `7.1` Spanischer Hafen (`js/spanischer_hafen_scenes.js`) und
  `8.1` Schmugglernest (`js/schmugglernest_scenes.js`, je ein Marker, Platzhalterbild —
  inhaltlich noch offen, siehe Bibel 16). In `5.1` zeigt Harwick den Insel-Begleitern die
  Artefakt-Unterlagen (neuer `ORTE`-Eintrag `kapitaenskajuete`, Marker existierte auf der
  Golden-Lion-Karte schon lange, hatte aber noch keinen GM-Inhalt) — echte Überzeugung (kein
  reiner Wurf) kann Harwick zum Schmugglernest umstimmen, was den Plan kostet, wegen Ezra
  Coombes Wundbrand (neue Unterdeck-Interaktion `ezras_wundbrand`, Fortsetzung von
  `eber_und_wundbrand`) den spanischen Hafen anzulaufen. Bleibt die Szene unbeachtet, treibt
  das Schiff stattdessen in die Flaute (`6.1`) — dort finden sich in Harwicks Unterlagen erste
  Warnungen vor einem übernatürlichen Kampf (Bibel 7.2). Löst die alte `[OFFEN] Designspannung`
  in Bibel 7.2 (Koexistenz freie Wahl/Ruf-Zwangsstopp) auf: SL-Ermessen anhand des tatsächlichen
  Spielerverhaltens statt fester Ruf-Schwelle. Die beiden neuen Karten-Dateien brauchten
  zusätzlich je einen Registry-Eintrag in `karte.html` UND `regie.html` sowie in den drei
  Scene-Lookup-Funktionen in `js/regie_vault.js` (`getAllSceneEntries`/`getSceneLabel`/
  `getMarkersForScene`) — `5.1`/`6.1` brauchten das nicht, da sie nur neue Einträge in der
  bereits registrierten `GOLDEN_LION_SCENES` sind.

### 2026-08-08
- **Audiodateien in eigenen `audio/`-Ordner verschoben** (analog zu `images/`): `Grimgate1.ogg`,
  `island1.ogg`, `ship1.ogg`, `storm1.ogg` liegen jetzt in `audio/` statt im Hauptordner.
  `tools/optimize_audio.py` liest/schreibt jetzt dort. In `karte.html`/`grimsgate_demo.html` wird
  das `audio/`-Präfix zentral beim Setzen von `bgAudio.src` ergänzt — die gespeicherten
  Dateinamen selbst (in den Szenen-Dateien UND live in Firebase unter
  `sceneAudioFile/{sceneId}`) bleiben unverändert als bloße Dateinamen (z. B. `"storm1.ogg"`),
  daher war keine Migration bestehender Firebase-Werte nötig.

### 2026-08-01
- **Golden-Lion-Ankunft ausformuliert:** neue Interaktion in `ORTE.golden_lion`
  (Grimsgate-Marker „Schiff sichtbar") — Ashworth/Harwick/Cormac-Szene am Anleger, verknüpft
  mit `ORTE.hafenmeisterei` (`nachfrage`/`sonderfall`) und `ORTE.heuer.zwillinge`
  (Misserfolg jetzt als Kater-Bond-Szene statt nur „kein Ruf"). Ursprünglich fälschlich als
  eigene `SZENEN_REGIE["2.1"]` abgelegt (nur sichtbar bei Szenenwechsel, nicht am
  Grimsgate-Marker) — korrigiert.
- **Golden Lion (Szene `2.1`) bekam `SZENEN_REGIE`-Eintrag:** Stimmung + 5 Ghosts
  (Amos Hale, Toby Rennick, Corwin Ashby, Jonas Teague, Edmund Grey) für die ~120-Mann-
  Besatzung — bisher hatten nur Grimsgate (`1.1`) und Schatzinsel (`4.1`) so einen Eintrag.
- **Neue eigenständige Spieler-Demo-Seite** `grimsgate_demo.html`: Grimsgate-Karte ohne
  Golden-Lion-Marker, komplett ohne Firebase-Anbindung (Musik/Würfel lokal), damit
  Spieler-Testinteraktionen nicht mit der laufenden Kampagnen-Datenbank kollidieren.
- **Schatzinsel-Szenen-Durchgang deutlich vorangetrieben** (4 von 5 Stationen haben jetzt
  GM-Inhalt in `regie.js`, nur `hoehle` fehlt noch): Landung am Schiffswrack, Dirks
  Sturm-Payoff eingelöst, Zurückgebliebenen-Szene (loser Balken: Ausweichen-vs-Eingreifen-
  Wahl, Wat/Josiah-Rollenspielmomente), Dschungelpfad (Metallschmuck-Verbot, Ezra Coombes
  Ehering, Wildschwein-Vorausdeutung), Dorf-Ankunft (Häuptling Ta'ahal weist Harwick alias
  „Vanthei" öffentlich zurück), Nachtlager (Jagd auf ein Wildschwein mit echten
  Geschicklichkeits-/Mechanik-Proben statt reiner Erzählung).
- **Höhlen-Referenzbild eingebaut** (`interior_hoehle.webp`) — Pillow war für
  `tools/optimize_images.py` nicht installiert, nachinstalliert (`pip install pillow`).
- **Codex Kapitel III** um Unterabschnitt „Das Volk der Thahal" erweitert (Höhlenwache-
  Dienstsystem, Bevölkerungsherleitung, Baumfrucht-Ökonomie, ⚓-Kasten Tabak/Kakao) — war
  zuvor reiner Platzhalter.
- Marker-Texte `stammesdorf`/`lager` (`schatzinsel_scenes.js`) überarbeitet/gekürzt, nachdem
  die finalen Referenzbilder auffielen, dass der Text nicht mehr passte.

### 2026-07-31
- Neuer **Codex/Weltatlas** (`codex.html`): eigenständige GM-Schmöker-/Nachschlage-Seite
  (Pergament-Optik wie `besatzung.html`, Kapitel-TOC mit Lese-Fortschritt, responsiv).
  Kapitel I Grimsgate + II Golden Lion vollständig, je mit abgesetzten „⚓ Historisch"-Kästen;
  Schatzinsel als Platzhalter-Kapitel III. Inhalt konsistent aus den Szenen-/Regie-Daten gezogen.
- **Golden Lion Schiffstyp korrigiert:** Brigantine → **kleine Fregatte** (Bibel 3.1) in
  `codex.html` und `besatzung.html` (Harwicks Rolle)
- Regie-Referenz-Hinweis (`.ort-hinweis`) von 12,5 px auf 14 px vergrößert (Lesbarkeit am Tisch)
- **Schatzinsel-Szenen-Durchgang** gestartet (Grimsgate-Stil, Stimmung + Leute je Station):
  Station 1 (Strand) im Panel — `SZENEN_REGIE["4.1"]` (Grundstimmung + 4 Crew-Ghosts) und
  `ORTE["schiffswrack"].npcs` (Schmied). Fortschritt/nächster Schritt in `ARBEITSSTAND.md`
- Neues **Text-Prinzip** (Hendrik): Stimmungstexte geben Information/Stimmung, die Interpretation
  ist Sache der Spieler (verwandt mit Bibel 2.8) — siehe `ARBEITSSTAND.md`

### 2026-07-30
- Live-Sichtbarkeits-Schalter für Marker (`hiddenMarkersLive/{sceneId}/{markerId}`): SL kann
  in `regie.html` jeden Ort per Klick live aus-/wieder einblenden, ohne Szenenwechsel oder
  Codedeploy (KAMPAGNEN-BIBEL 13.10)
- Schatzinsel (Szene `4.1`) inhaltlich erweitert: Marker `stammesdorf`, `hoehle`,
  `zwischenstation`, `lager` ergänzt (letztere zwei mit Platzhaltertext/-bild, bis
  Referenzbilder existieren); `hoehle`-Text um vorweggenommenes Plot-Wissen bereinigt
- Neue Design-Regel 2.8 in der Bibel: Marker-`desc`-Texte sind reine Ort-/Stimmungsangaben,
  kein Plot-Wissen/Handlungsauftrag
- Szene `1.2` ("Golden Lion sichtbar") in `1.1` gemergt — der einzige Unterschied (ein
  zusätzlicher Marker) lässt sich jetzt über den Sichtbarkeits-Schalter abbilden, keine
  eigene Szene mehr nötig
- Szenen-Label ohne Nummer (siehe Architektur-Muster oben) — betrifft alle drei
  Szenen-Dateien
- Referenzbilder für `zwischenstation`, `stammesdorf`, `lager` eingebaut (PNG→WebP,
  7-10 MB → 130-315 KB via `tools/optimize_images.py`), Platzhaltertexte durch
  ausformulierte Stimmungsbeschreibungen ersetzt

### 2026-07-29
- Admin-Panel-Duplikat behoben: Sturm-Szene (3.1) zeigte identische GM-Zusammenfassung wie
  Basis-Szene (2.1) → `szenenUeberschreibungen` + `resolveOrtForScene()` eingeführt
- Projekt-Reorg: Ordnerstruktur, einheitliche Dateinamen, Redirect-Stubs für alte URLs,
  Admin-Panel gegen versehentlichen Spieler-Zugriff über die Root-URL abgesichert
- Performance-Fix (Lags/Ladezeiten): alle Bilder PNG→WebP (132 MB → 4,5 MB), alle Audiodateien
  MP3→Opus/OGG (242 MB → 93 MB, volle Länge erhalten) — Pipeline in `tools/optimize_images.py`
  und `tools/optimize_audio.py`
- Sturm-Szene (3.1) inhaltlich ausgearbeitet: Oberdeck (Cormac & Segel, Ned stürzt, Sturm-
  Höhepunkt mit Mastbruch/Ruderklemme/Toms Anker-Highlight/Harwicks vielsagenden Blicken),
  Achterdeck (Toms loses Mundwerk)
- Redundantes „(nur Sturm-Szene 3.1)" aus Interaktions-Titeln entfernt
- Schatzinsel-Referenzbild (`images/schatzinsel.webp`) und `island1.ogg` eingebaut/komprimiert
- Neue Schatzinsel-Szene (dritte Kartenquelle, `js/schatzinsel_scenes.js`) mit erstem Ort
  (`schiffswrack`, die gestrandete Golden Lion) — bewusst noch ohne weitere Orte/GM-Inhalt.
  Zunächst fälschlich als `3.2` angelegt (Kollision mit der Schiffs-Nummerierung), auf `4.1`
  korrigiert; Schiffswrack-Marker bekam ein Platzhalter-Bild statt leerem `img`-Feld
