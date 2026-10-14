# CLAUDE.md — Projekt-Gedächtnis

Kurzer technischer Leitfaden für dieses Repo. **Für Regelfragen am Tisch:
[REGELREFERENZ.md](REGELREFERENZ.md)** — Spickzettel plus alle Listen (Talente, Schwächen,
Fertigkeiten, Ausrüstung), die Listen daraus erzeugt aus `js/regelwerk.js`. Die Regel selbst
steht in `KAMPAGNEN-BIBEL.md` §4. Die eigentliche Story-/Design-Doku steht in
`KAMPAGNEN-BIBEL.md` — vor inhaltlicher Arbeit lesen, v. a. Abschnitt 13 „Technischer Stack"
und Abschnitt 17 „Arbeitsweise". Dieses Dokument hier ist rein technisch/prozessual und hält
zusätzlich einen laufenden Changelog. Für das Erkundungs-Graph-System (Riffinsel, `11.1`) siehe
das ausführliche **[RIFFINSEL-ERKUNDUNGSGRAPH.md](RIFFINSEL-ERKUNDUNGSGRAPH.md)** — Datenmodell,
Design-Begründung und vollständige Fehlergeschichte, vor jeder Erweiterung dieses Systems lesen.
Für die **Kampf-Arena des Endkampfs** (`15.1`) gibt es das ebenso ausführliche
**[ARENA-ENDKAMPF.md](ARENA-ENDKAMPF.md)** — Regelabbildung, Datenmodell, offene Punkte und die
zentrale Design-Regel, dass die Arena nur bestimmt, *wie teuer* der Weg wird, nicht *ob* die
Kernbeats des Finales geschehen. Vor jeder Arbeit an der Arena lesen.

> **Würfelsystem fertig (14.10.2026):** Leiste beim Spieler, Anforderung und Protokoll in der
> Regie, Würfe im Session-Export. Offen am Regelsystem bleibt der **Abenteuertext**
> (311 alte Wertenamen in `js/regie.js`, 24 verwaiste „Schlechter Erfolg"-Passagen) und
> **`js/arena.js`**, das weiter nach W100 rechnet.
>
> **Laufender Arbeitsstand (WIP):** Der **Codex** (`codex.html`) ist noch in Arbeit — Einstiegspunkt,
> nächster Schritt und Arbeitsweise dafür stehen in **`ARBEITSSTAND.md`** (dort weiterlesen, bevor
> an diesem Strang gearbeitet wird). Der **Schatzinsel-Szenen-Durchgang** ist seit August 2026
> abgeschlossen (siehe Changelog unten) — die **Übergangsszenen nach der Insel**
> (`5.1`/`6.1`/`7.1`/`8.1`) sind damit ebenfalls alle vier fertig. Der **Artefakthandel** (`9.1`)
> und die anschließende **Flucht + Riffinsel** (`10.1`/`11.1`) sind ebenfalls fertig — damit ist
> **Session 2 (Bibel 7.4) inhaltlich abgeschlossen**. Die **Grabesinsel (`13.1`) inkl. komplettem
> Finale** (Bibel 12.1: Ritual, Untote, Wat/Josiah, Der Seelenlose, drei Ausgänge je nach
> Jaguar-Säbel-Übergabe) ist seit 2026-08-23 inhaltlich fertig ausformuliert (`js/regie.js`,
> `ORTE.die_ritualkammer`). Die **Kampf-Arena dazu (`15.1`) steht seit 2026-08-23 als erste
> lauffähige Fassung**, ist aber noch nicht am Tisch erprobt — Werte, mögliche Sonderfähigkeiten
> des Seelenlosen und die offenen Punkte stehen in **`ARENA-ENDKAMPF.md`**, Abschnitt 9. Nächster
> Schritt offen (Codex, oder Probekampf + Feinschliff der Arena).

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
- **Regelreferenz:** `REGELREFERENZ.md` wird zur Hälfte erzeugt. Nach jeder Änderung an
  `js/regelwerk.js` (neues Talent, neue Ausrüstung, geänderte Werte)
  `node tools/regelreferenz.js` laufen lassen. `tests/t_regelreferenz.js` schlägt an, wenn die
  eingecheckte Datei veraltet ist. **Der Spickzettel oben in der Datei ist handgeschrieben** und
  wird vom Generator nicht angefasst — er steht außerhalb der `ERZEUGT:`-Marken.
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

**Regelfragen gehen gegen die Savage-Worlds-Regeln** (Hendriks stehende Anweisung vom
14.10.2026). Reihenfolge der Quellen: **Savage Worlds → Bibel §4 → `js/regelwerk.js`.** Der
Code ist nur die Ausführung — eine Messung an ihm zeigt, *was* er tut, nie *ob er recht hat*,
und taugt deshalb nie als Beleg für eine Regel. Erst nachlesen, dann messen, ob die Umsetzung
dazu passt. Steht eine Regel im Projekt nirgends, ist **das** der Befund: in Bibel §4
nachtragen, statt die Lücke über den Code zu umgehen. Bewusste Abweichungen (etwa die Arena,
die noch nach W100 rechnet) ausdrücklich als solche kennzeichnen.

## Changelog

### 2026-10-14 (Fortsetzung 9) — Der Hub-Knopf geht unter den Bogen, der im Bogen führt hinaus
- **Hendriks Meldung mit Screenshot:** Der neue Hub-Knopf der Karte klebte auf der Kopfzeile des
  aufgeschlagenen Bogens. Er soll **dahinter verschwinden** — und der Hub-Knopf **im Bogen** soll
  die **ganze Seite** ins Hub führen, nicht nur das Charakterfach.
- **Ich hatte ihn absichtlich nach oben gelegt** (z-index 380 über dem Drawer 370), mit der
  Begründung „der Weg hinaus darf nie verstellt sein“. Die Begründung war richtig, der Schluss
  falsch: **Der Bogen hat seinen eigenen Hub-Knopf.** Der Weg hinaus ist also gar nicht verstellt
  — er führte nur an die falsche Stelle. Jetzt z-index **340**, unter Backdrop und Drawer.
- **`target="_top"` für die Links des Bogens.** Der Bogen läuft auf der Karte in einem **iframe**.
  Ohne das sprang nur der Rahmen ins Hub — der Spieler säße dann vor einer Karte, in deren
  Charakterfach das Hub steckt. Betroffen waren **drei** Stellen, nicht eine:
  - der Hub-Knopf und **„Figur ändern“** in `heldenbrief.html`,
  - **`sitzungsSperre()`** in `js/sitzung.js` — die Sperre erscheint ebenfalls im Charakterfach,
    und ihr „Zum Hub“ hätte den Spieler genauso im Rahmen gelassen. Diese dritte Stelle war
    nicht gemeldet, hat aber denselben Fehler.
  - Steht die Seite für sich, verhält sich `_top` wie ein normaler Link — es gibt also keinen
    zweiten Fall zu pflegen.
- **Dritter Fund aus demselben Screenshot, nicht gemeldet:** Das **Schließen-Kreuz des Drawers**
  (oben rechts) lag **genau auf dem Hub-Knopf** des Bogens — im Bild nur noch als „Hu…“ zu sehen.
  Der Knopf war damit nicht anklickbar, also ausgerechnet der Weg, den Hendrik benutzen wollte.
  Die Kopfzeile lässt jetzt Platz, **aber nur im Rahmen** (`.imRahmen`, gesetzt über
  `window.top !== window.self`) — für sich allein braucht die Seite ihn nicht.
- **Getestet: 57 Prüfungen in `tests/t_bogen.js`, 0 Fehler** (6 neue). Die Ebenenprüfung ist
  **umgedreht** statt entfernt: Der Knopf muss jetzt nachweislich **unter** Backdrop und Drawer
  liegen, aber weiterhin über der Karte. Direkt daneben steht die Prüfung auf `target="_top"` —
  die beiden gehören zusammen, und wer das eine zurücknimmt, soll über das andere stolpern.
- **Wieder in die Heredoc-Falle getappt**, zum wiederholten Mal: Ein maskiertes Anführungszeichen
  in einem Python-Skript per Bash-Heredoc zerlegte die Testzeile und machte die Datei unparsebar.
  Erst beim zweiten Anlauf den im Projekt dokumentierten Weg genommen (Write-Werkzeug,
  Backslash über `chr(92)`).

### 2026-10-14 (Fortsetzung 8) — Klick auf ein Talent öffnet die ganze Erklärung
- **Hendriks Vorgabe:** Man soll ein Talent bzw. eine Schwäche auch **anklicken** können und
  dann ein richtiges Overlay bekommen.
- **Warum das Hover-Feld allein nicht reicht** — drei Gründe, und der erste ist der tragende:
  1. **Auf dem Tablet am Tisch gibt es überhaupt kein Hovern.** Dort war die Erklärung bis jetzt
     schlicht unerreichbar.
  2. Das Hover-Feld verschwindet beim kleinsten Mausruckeln — zum Lesen eines längeren Textes
     taugt es nicht.
  3. Im Overlay ist Platz für das, was ins Hover-Feld nicht hineinpasst.
- **Das Overlay zeigt mehr, nicht dasselbe größer** — sonst wäre der Klick nur ein zweiter Weg
  zur selben Zeile:
  - **Talent:** seine **Voraussetzungen** im Klartext, dazu der Mindestrang mit dem Hinweis, dass
    **der Rang eine harte Sperre ist, die Werte aber nicht**.
  - **Schwäche:** ob sie ein **Haken** ist — und **warum das kein Nachteil ohne Gegenwert ist**:
    Sie senkt keinen Würfel, sondern gibt der Spielleitung etwas, woran sie die Figur aufhängt.
    Dazu, wie viele Punkte sie einbringt und was ein Talent davon kostet.
- **Bedienung:** Klick, Enter oder Leertaste öffnen; ✕, Klick auf den Hintergrund oder **Escape**
  schließen. Der Schließen-Knopf bekommt den Fokus. Die Chips tragen `role="button"` — wer sie
  mit der Tastatur erreicht, soll sie auch auslösen können.
- **Das Hover-Feld sagt jetzt, dass es weitergeht** („Anklicken für die ganze Erklärung“) — ein
  Overlay, von dem niemand weiß, nützt nichts. Beim Öffnen wird es abgeräumt, sonst kläbte es
  darüber.
- **Ein Talent, das es im Regelwerk nicht mehr gibt**, öffnet das Overlay trotzdem — aber **ohne
  erfundenen Zusatz**: Voraussetzungen, die niemand kennt, wären schlimmer als gar keine Angabe.
- **Bewusst NICHT in `regie_figuren.html`.** Dort bleibt es beim Tooltip am Mauszeiger: Die Seite
  ist ein breites Raster auf einem Rechner, kein schmaler iframe auf einem Tablet, und ein Overlay
  würde beim Durchsehen mehrerer Figuren ständig im Weg stehen. Falls doch gewünscht, ist es
  dieselbe Mechanik.
- **Getestet: 51 Prüfungen in `tests/t_bogen.js`, 0 Fehler** (18 neue). Der geschnittene Code
  reicht jetzt bis einschließlich der Lauscher, und die Ereignisse werden **wirklich gefeuert**:
  Klick öffnet, Escape schließt, Enter und Leertaste öffnen und schlucken die Taste, ein Klick
  daneben öffnet nichts. Dazu, dass das Hover-Feld beim Öffnen verschwindet und dass ein
  unbekanntes Talent keinen Zusatz erfindet.

### 2026-10-14 (Fortsetzung 7) — Bogen über der Leiste, Talente erklären sich, Weg zurück ins Hub
Drei Vorgaben Hendriks auf einmal.

- **Der aufgeklappte Charakterbogen liegt jetzt über der Würfelleiste.** Backdrop 290→360,
  Drawer 300→370, beide damit über den 350 der Leiste.
  - **Die alte Reihenfolge war begründet — und die Begründung trägt nicht mehr.** Im Code stand
    ausdrücklich, die Leiste müsse oben liegen, weil sonst der Backdrop Klicks auf die Würfel
    abfängt. Das stimmt, war aber am Schreibtisch gedacht: Der Drawer nimmt **70 vw von links**
    ein, die Leiste sitzt **unten links** — sie lag also mitten im aufgeschlagenen Bogen und
    verdeckte ihn. Und gewürfelt wird im Bogen selbst, dort ist jeder Wert anklickbar. Die
    Leiste wird gar nicht gebraucht, solange er offen ist. Der alte Kommentar ist durch die neue
    Begründung ersetzt, nicht einfach gelöscht.
  - **Der Griff bleibt bei 300** — er sitzt am linken Rand und kläbte sonst über dem Bogen.
- **Talente und Schwächen erklären sich beim Hovern** (`heldenbrief.html`). Ein `title` stand
  dort zwar schon, aber der native Tooltip kommt erst nach rund einer Sekunde, bricht lange Texte
  schlecht um und verschwindet beim kleinsten Mausruckeln — für eine Talentwirkung, die man
  **während einer Probe** nachliest, taugt er nicht. Jetzt ein eigenes Feld.
  - **Es nennt die Einordnung, nicht nur die Wirkung:** beim Talent Kategorie und Mindestrang,
    bei der Schwäche schwer/leicht samt Punktwert — und ob sie ein **Haken** ist, also
    verpflichtet statt Würfel zu senken. Ohne das liest sich „du verpflichtest dich“ wie ein
    Nachteil ohne Gegenwert.
  - **Klappt am Rand um statt abgeschnitten zu werden.** Der Bogen läuft auf der Karte in einem
    schmalen iframe; rechts und unten ist dort schnell Schluss.
  - Mit der **Tastatur** erreichbar (`tabindex`, Anzeige auch bei Fokus), und ein Talent, das es
    im Regelwerk nicht mehr gibt, bricht den Bogen nicht.
- **Dieselbe Lücke in `regie_figuren.html` mitgeschlossen** — dort stand bisher **nur der nackte
  Name**, ohne jede Erklärung. Die Spielleitung muss im Zweifel sagen können, was das Talent
  eines Spielers tut.
- **Von der Karte führt ein Weg zurück ins Hub.** Sie war für Spieler eine Sackgasse: Wer einmal
  drin war, kam nur über den Zurück-Knopf des Browsers oder die Adresszeile wieder heraus.
  - **Oben links**, weil dort als einziger Ecke nichts liegt — unten links die Würfelleiste,
    unten rechts der Ton, rechts die Charakterleiste, links mittig der Bogen-Griff.
  - **z-index 380, also über dem offenen Bogen (370)**: Der Weg hinaus darf nie verstellt sein.
  - Ein **echter `<a href>`**, kein `onclick` — so funktionieren Mittelklick und „in neuem Tab
    öffnen“. In der Vorschau der Spielleitung ausgeblendet, wie Leiste und Bogen auch.
- **Neues `tests/t_bogen.js` (33 Prüfungen, 0 Fehler).** Die Tooltip-Funktionen werden **aus dem
  Quelltext von `heldenbrief.html` geschnitten und wirklich ausgeführt** — eine nachgebaute
  Kopie würde genau das nicht prüfen, was gemeldet war. Darunter: das Feld steht unter dem Chip,
  rückt am rechten Rand nach innen und klappt unten nach oben, und es bleibt in beiden Fällen im
  Bild. Die Ebenen werden als **Verhältnis** geprüft (Drawer > Backdrop > Leiste), nicht gegen
  feste Zahlen — sonst müsste der Test bei jeder Verschiebung mitgepflegt werden.
  - Die Hilfsfunktion, die einen `z-index` aus dem Stylesheet holt, gibt bei einem Fehlgriff
    `null` zurück statt 0 — ein stiller Nulltreffer hätte jede Ebenenprüfung wertlos gemacht
    (dieselbe Lehre wie beim Extraktionsmuster vom 07.09.2026).

### 2026-10-14 (Fortsetzung 6) — Neue `REGELREFERENZ.md` für schnelle Regelfragen
- **Hendriks Frage:** „Gibt es das Regelwerk komplett, was wir im Git hinterlegen können für
  schnelle Fragen und Antworten?“
- **Als fertiges Dokument: nein, und das ist keine Förmelei.** Savage Worlds hat **keinen SRD**,
  und die **Fan License** erlaubt ausdrücklich nicht, Regeltext aus dem Buch zu reproduzieren.
  Entscheidend ist dabei weniger das Lizenzrecht als die Lage: **dieses Repo ist öffentlich**
  (GitHub Pages). Hendriks Einordnung vom 06.09.2026 — für eine private Runde spielt Copyright
  keine Rolle — gilt für den Tisch, nicht für ein öffentliches Repository.
- **Stattdessen der Weg, den das Projekt bei Talenten und Schwächen längst geht** (06.09.2026):
  **Mechanik übernehmen, Texte selbst schreiben.** Neue **`REGELREFERENZ.md`**, 316 Zeilen,
  zweigeteilt:
  - **Spickzettel, handgeschrieben:** Probe · Ass · Wild Die · Steigerung · Erschwernis ·
    Wunden · Bennies · Patzer · ungelernt. Mit beiden Verwechslungen dieses Tages ausdrücklich
    aufgelöst: Ein Würfel explodiert bei **seiner eigenen** Höchstzahl, und eine Steigerung hat
    **nichts** mit dem Maximalwurf zu tun.
  - **Tabellen, erzeugt** aus `js/regelwerk.js`: 5 Attribute · 16 Fertigkeiten · 41 Talente ·
    20 Schwächen · 24 Ausrüstungsgegenstände · 5 Ränge · 5 Steigerungsarten, dazu die exakt
    gerechneten Erfolgsquoten je Würfelstufe.
- **Warum die Trennung, und sie ist der eigentliche Punkt:** Die **Regel** kommt aus Savage
  Worlds und wird von Hand geschrieben. Die **Tabellen** sind unsere eigenen Inhalte und stehen
  schon im Code — sie dort abzuschreiben heißt nur, zwei Fassungen auseinanderlaufen zu lassen.
  Der Generator ersetzt deshalb **ausschließlich** den Block zwischen `ERZEUGT:ANFANG` und
  `ERZEUGT:ENDE`; der Spickzettel liegt davor und bleibt unangetastet.
- **Fehlen die Marken, bricht der Generator ab**, statt die Datei neu zu schreiben — sonst wäre
  der handgeschriebene Teil genau dann weg, wenn jemand die Marken versehentlich gelöscht hat.
- **Neues `tools/regelreferenz.js`** (`--pruefen` schreibt nicht, `--ziel` lässt es auf einer
  Kopie laufen) und **`tests/t_regelreferenz.js`** (24 Prüfungen, 0 Fehler).
  - **Eine veraltete Referenz ist schlimmer als keine** — man liest sie, glaubt ihr und spielt
    nach einer Regel, die nicht mehr gilt. Deshalb läuft die Aktualitätsprüfung bei jedem
    Testlauf mit. **Gegengeprüft:** ein geänderter Talentname lässt drei Prüfungen anschlagen.
  - Der Schutz des handgeschriebenen Teils wird **auf einer Kopie wirklich ausgeführt**, nicht im
    Quelltext gesucht: Satz einfügen, Generator laufen lassen, Satz muss stehen und der erzeugte
    Block unverändert sein.
  - Dazu inhaltlich: **jedes** Talent, jede Schwäche, jede Fertigkeit und jeder Gegenstand kommt
    vor, und die Zahlen des Spickzettels (Zielwert, Steigerungsschwellen, Wild Die, ungelernt,
    Wunden, Startgeld) sind gegen `js/regelwerk.js` nachgerechnet — ein Spickzettel mit falschen
    Zahlen lehrt Falsches.
- **Eigener Fehler beim Prüfen, festgehalten:** Ich wollte belegen, dass die Veraltungsprüfung
  anschlägt, und habe dafür `n: 'Seebein'` ersetzt — im Quelltext steht aber `n:'Seebein'` ohne
  Leerzeichen. Die Ersetzung fand nichts, die Datei blieb unverändert, und die Prüfung meldete
  korrekt „aktuell“. Beinahe als Testlücke fehlgedeutet. **Konsequenz:** eine Ersetzung in einem
  Prüfskript immer mit `assert s.count(alt) == 1` absichern — dieselbe Lehre wie bei den
  Extraktionsmustern, die bei leerer Eingabe „OK“ melden (07.09.2026).

### 2026-10-14 (Fortsetzung 5) — Das Regelwerk stand noch auf W100 (Bibel §4 umgeschrieben)
- **Hendriks Einwand, und er sitzt:** „Du sollst die Regel im Regelwerk nachlesen, nicht im
  Code.“ Ich hatte die Explosionsregel über 200.000 Würfe „bewiesen“ — also die Umsetzung
  gegen sich selbst geprüft. Ein Messwert sagt, **was** der Code tut, nie **ob er recht hat**.
- **Beim Nachschlagen kam der eigentliche Fund:** Bibel §4 beschrieb noch das **W100-System**.
  Seit dem Systemwechsel am 07.09.2026 war das die **falsche Auskunft** — fünf Wochen lang, und
  als offener Punkt zwar vermerkt, aber nirgends sichtbar, wo jemand nachliest. Explodierende
  Würfel und der Wild Die kamen dort überhaupt nicht vor. **Es gab also nichts nachzulesen.**
- **Die Regel selbst hat Hendrik beigebracht** (Suchergebnis zu Savage Worlds). Sie bestätigt
  alle fünf Punkte, und die Engine trifft jeden: Ass bei der Höchstzahl **dieses** Würfels ·
  Kettenreaktion mit Addition · Wild Die als **separater W6**, unabhängig explodierend · das
  **höhere** der beiden Gesamtergebnisse zählt · Zielwert 4, je volle 4 eine Steigerung.
- **Bibel §4 neu geschrieben**, jetzt das tatsächlich gespielte System: 4.1 Die Probe ·
  **4.2 Explodierende Würfel** · **4.3 Der Wild Die** · 4.4 Erschwernisse, Wunden, Bennies ·
  4.5 Ränge · 4.6 das alte W100 · 4.7 Weiteres. Mit dem ausdrücklichen Satz, dass bei einem
  Widerspruch **die Bibel gilt und nicht der Code**.
  - **Die Verwechslung steht als Regel drin**, nicht nur als Fehlerbericht: Maßgeblich ist die
    Höchstzahl **dieses einen Würfels**, nicht die des eigenen Werts — wer W8 hat, dessen Wild
    Die ist trotzdem ein W6 und explodiert bei einer 6.
  - **Das alte W100-System ist nicht gelöscht, sondern nach 4.6 verschoben.** Es beschreibt
    weiterhin echten Code: `js/arena.js` rechnet unverändert danach. Es zu entfernen hätte den
    Endkampf undokumentiert gelassen.
  - Die **Archetypen** (§4.3 alt) sind als entfallen gekennzeichnet; ihr Design-Ziel — jede
    Figur bekommt einmal ihren großen Moment — bleibt stehen.
- **Jede Zahl im neuen Text gegen `js/regelwerk.js` nachgerechnet** (Zielwert 4, Schritt 4,
  Wild Die W6, ungelernt W4−2, Kettendeckel 50, 3 Bennies, höchstens 3 Wunden) — eine
  Regeldoku, die falsche Zahlen nennt, ist schlimmer als keine.
- **Damit ist der offene Punkt vom 07.09.2026 geschlossen** („Bibel 4.1/4.2 ist ebenfalls noch
  nicht umgeschrieben“).
- **[OFFEN] bleibt die Arena.** `js/arena.js` rechnet weiter nach W100 — jetzt wenigstens an
  einer Stelle dokumentiert, statt als Widerspruch zwischen zwei Systemen herumzuliegen.

### 2026-10-14 (Fortsetzung 4) — „Explodiert schon bei 6“: die Regel stimmte, die Anzeige log
- **Hendriks Meldung mit Screenshot:** „Obwohl ich d8 habe, explodiert der Würfel schon bei
  einer 6.“
- **Nachgerechnet, nicht geschätzt — und die Regel ist richtig:** Explodiert war nicht sein
  Wertwürfel, sondern der **Wild Die**, und der ist **immer ein d6**, egal ob der eigene Wert d4
  oder d12 ist. Über 40.000 Würfe je Stufe: **kein einziger Nachwurf bei einer anderen Zahl als
  der eigenen Höchstzahl**, keine Zahl außerhalb des Würfels.
- **Falsch war die Anzeige.** Dort stand ein blankes „**explodiert!**“ — das liest sich als
  Aussage über den eigenen Würfel, und der Zusatz „Wild Die: d6“ ging daneben unter. Zwei
  Änderungen:
  - Die Explosion **nennt ihre Zahl**: „d6 6 + 4 = 10 **explodiert bei 6**“. Damit beantwortet die
    Zeile die Frage „warum bei 6?“ selbst.
  - Der Wild Die heißt jetzt „**Wild Die (immer d6)**“. Das steht **fest da und nicht nur als
    Tooltip**: Die Verwechslung mit dem eigenen Wert passiert genau in dem Moment, in dem man das
    Ergebnis liest, und dort greift niemand zur Maus. Der Tooltip erklärt zusätzlich, wozu der
    Würfel überhaupt da ist.
- **Auf Hendriks Nachfrage („Ist das sicher?“) ein zweites Mal gemessen**, und diesmal die
  schärfere Frage: Ist der Würfel, der als d6 **beschriftet** ist, auch wirklich einer? Eine
  falsche Beschriftung hätte exakt wie der gemeldete Fehler ausgesehen. Geprüft wird deshalb
  nicht die Beschriftung gegen die Konstante, sondern gegen die **tatsächlich gefallenen
  Augenzahlen**: Der Wertwürfel zeigt 1..4 / 1..8 / 1..12 je nach Stufe, der Wild Die bleibt bei
  **1..6 und nutzt alle sechs Seiten** — auf jeder Stufe.
- **Getestet: 93 Prüfungen in `t_wuerfel.js`, 0 Fehler** (33 neue). Geprüft wird beides — die
  Regel und der Text, den sie erzeugt. **Hendriks Wurf ist dabei exakt nachgestellt** (Willenskraft
  d8 zeigt 7, der Wild Die explodiert auf 6 und wirft 4 nach), indem die Zufallszahlen gesetzt
  werden: Die Zeile nennt die 6, der Wertwürfel explodiert nachweislich **nicht**, und ein blankes
  „explodiert!“ kommt nirgends mehr vor.

### 2026-10-14 (Fortsetzung 3) — Der Privat-Haken bleibt stehen
- **Hendriks Meldung:** „Wenn ich einen Wurf als SL privat stelle, geht der Haken nach dem Wurf
  sofort wieder raus … ich würde öfter privat als öffentlich.“
- **Ursache:** Der Haken lebte **nur im Markup**. `istPrivat()` las ihn per `getElementById` aus
  dem DOM, und `zeichneLeiste()` zeichnet die Leiste nach **jedem** Wurf neu — dabei wurde die
  Checkbox jedes Mal leer gerendert. Er musste also vor jedem einzelnen Wurf neu gesetzt werden.
- **Behoben:** „Privat“ ist jetzt ein **Zustand**, kein DOM-Fund. Er wird im Markup gesetzt,
  über das `change`-Ereignis gepflegt und in `localStorage.korsaren_wuerfel_privat` gemerkt —
  **er überlebt damit auch das Neuladen der Seite**. Das ist die ehrlichere Abbildung: Verdeckt zu
  würfeln ist eine Haltung, keine Einzelentscheidung.
- **Die Spielerleiste erbt den Merker NICHT.** `allowPrivate` wird ausschließlich von
  `regie_vault.js` gesetzt; ein im selben Browser gesetzter Merker macht einen Spielerwurf nicht
  heimlich. Steht als eigene Prüfung da, weil der Schlüssel im localStorage für beide Seiten
  derselbe ist.
- **Getestet: 60 Prüfungen in `t_wuerfel.js`, 0 Fehler** (9 neue). Der Haken wird dabei so
  umgelegt, wie ein Mensch es tut — über das `change`-Ereignis, nicht durch Griff in den Zustand;
  sonst prüfte der Test genau den Weg nicht, um den es geht. Darunter: er steht nach dem Wurf
  noch, der zweite Wurf bleibt privat, er überlebt jedes Neuzeichnen und das Neuladen, Abwählen
  wirkt sofort — und ein Spieler würfelt trotz gesetztem Merker öffentlich. **Mit dem alten
  Verhalten gegengeprüft:** drei der Prüfungen schlagen dann an.

### 2026-10-14 (Fortsetzung 2) — Die fünf Würfel standen im Zickzack
- **Hendriks Meldung mit Screenshot:** „Die 4 und die 12 sind nicht auf der gleichen Höhe."
- **Ursache:** Jede Form trug ihren **eigenen** Mittelpunkt (`mitte`), und der war der
  **Flächenschwerpunkt** — beim Dreieck 62, beim Fünfeck 56, beim Drachen 46. Jede Zahl saß damit
  schön in ihrer Form, aber **nebeneinander las sich die Reihe als Zickzack**.
- **Behoben:** eine gemeinsame Linie (`DICE_ZAHL_Y = 50`) für alle fünf; die Einzel-Mittelpunkte
  sind ersatzlos weg. Dreieck und Fünfeck sind dafür minimal breiter und tiefer gezeichnet, damit
  die Zahl auf der neuen Höhe nicht an die Kante stößt. **Nebeneinander wiegt die gemeinsame Linie
  schwerer als die optische Mitte der einzelnen Form** — steht so als Begründung im Code.
- **Getestet: 9 neue Prüfungen** (t_wuerfel jetzt 51, 0 Fehler). Geprüft wird beides: dass alle
  fünf dieselbe Höhe tragen **und** dass die Zahl trotzdem in jede Form passt — sonst wäre die
  Linie durch Überstehen erkauft. Dafür schneidet der Test den Umriss jeder Form am oberen und
  unteren Rand des Schriftbands und misst die Breite (zweistellig nur bei der 12).

### 2026-10-14 — Die Spielleitung fordert Würfe an, und das Protokoll trägt den Abend
- **Zweite Hälfte des Würfel-Umbaus** (die Leiste stand seit gestern, `js/dice.js`). Gebaut nach
  Hendriks „passt. So bitte einbauen" — alles davon in `regie_figuren.html`.
- **Jeder Wert ist anklickbar und fordert den Wurf an.** Ein Klick öffnet zwei Wege: **nur diese
  Figur** oder **von allen (n)**. Geschrieben wird nach `figuren/{schlüssel}/anfrage`; die Leiste
  des Spielers horcht dort, zeigt den Wert groß an und **räumt die Bitte selbst weg**, sobald
  gewürfelt wurde.
  - Die Gruppenanforderung geht ausdrücklich **auch an die Figur, die den Wert nicht gelernt
    hat** — sie würfelt dann d4−2. Bliebe die Bitte aus, wüsste der Spieler aus dem Ausbleiben,
    dass er hier nichts kann.
  - Eine offene Bitte steht an der Karte („Wartet auf **Kämpfen** — nötig 8 (−4)") und lässt sich
    **zurücknehmen**.
- **Erschwernis als Modifikator UND als vorgelesene Zahl, am selben Knopf:** `+2 nötig 2 ·
  0 nötig 4 · −2 nötig 6 · −4 nötig 8`. Das ist keine Doppelung, sondern der Punkt: In Savage
  Worlds **ist** „du brauchst eine 8" der Modifikator −4, weil das Ziel immer 4 bleibt. Stehen
  die beiden Zahlen nicht beieinander, rechnet die Spielleitung mit der einen und liest die
  andere vor — genau der Fehler, der am 13.10. im Heldenbrief gefunden wurde.
- **Das Protokoll ist das Gedächtnis des Abends.** Eigene Ansicht „Würfe", gruppiert nach
  **Szene → Ort**, in zeitlicher Reihenfolge, Szenen- und Ortsnamen im Klartext.
  - Es liegt unter `sitzungen/{sid}/protokoll`, **nicht** unter dem Spielstand — damit übersteht
    es einen Szenenwechsel und ein Zurücksetzen. Kein neuer Top-Level-Pfad, **keine
    Regeländerung** nötig.
  - **Jeder Wurf lässt sich kommentieren** (`notiz`). Die Zahl allein sagt nach zwei Wochen
    nichts; der Kommentar ist das, was den Wurf zur Erinnerung macht. Enter sichert, Escape
    bricht ab — der Betrachter zeigt ohnehin kein `prompt()`, und wer am Tisch tippt, greift
    nicht zur Maus.
- **Die Seite war bewusst rein lesend, und bleibt es für die FIGUR.** Sie schreibt jetzt an genau
  zwei Stellen, und beide fassen keinen Wert an: die **Bitte** daneben und die **Notiz** am Wurf.
  Eine Anforderung ist eine Nachricht an den Spieler, keine Änderung an seiner Figur — gewürfelt
  wird weiterhin ausschließlich bei ihm. Per Test erhoben über **alle** Schreibzugriffe, die
  tatsächlich stattfinden, nicht über eine Liste bekannter Stellen.
- **Neuer Abschnitt „Würfe" im Session-Export** (`wuerfeSection()` in `js/regie_vault.js`), in der
  schon bestehenden Struktur Szene → Ort, mit dem Kommentar als eingerückte Kursivzeile. Reine
  Funktion wie der übrige Export, also offline prüfbar.
  - **Die Ortsreihenfolge folgt der Karte, nicht der Uhrzeit** — der Export soll sich lesen wie
    die Szene.
  - Würfe aus Szenen **außerhalb** des gewählten Bereichs werden gezählt und benannt statt
    verschwiegen („3 weitere Würfe aus anderen Szenen").
- **Echter Fehler im Regelwerk gefunden, älter als diese Arbeit:** `alsFigur()` klemmte `wunden`
  auf `MAX_WUNDEN` (3), während `ausserGefecht()` ausdrücklich auf **> 3** prüft und
  `wundenAbzug()` ohnehin selbst klemmt. **Der Zustand „außer Gefecht" war damit nach jedem Laden
  der Figur still weg** — der Heldenbrief setzt 4 (`setWunden(4)`), beim nächsten Öffnen stand die
  Figur wieder mit drei Wunden im Spiel, und die SL-Übersicht zeigte das Abzeichen nie. Aufgefallen
  ist es erst, weil die Gruppenanforderung die Figur überspringen soll. Auf `MAX_WUNDEN + 1`
  korrigiert; die Prüfung schlägt auf dem alten Code nachweislich an.
- **Zwei eigene Fehler im Export, beide vom Test gefunden:**
  1. **Ein Wurf an einem Ort, den die Szene nicht (mehr) kennt, fiel stillschweigend aus dem
     Export** (umbenannter Marker, gelöschter Sub-Ort). Genau die Lücke, gegen die der Zähler für
     fremde *Szenen* schon abgesichert war. Unbekannte Orte bekommen jetzt ihre eigene Gruppe.
  2. „3 weitere **Wurfe**" — falsche Mehrzahl, Umlaut fehlte.
- **Getestet: 671 Prüfungen über sechs Skripte** (neues `tests/t_regie_wuerfel.js` mit 106).
  Die Seite wird dabei **wirklich ausgeführt**, nicht nur geparst — dieselbe Begründung wie bei
  `t_wuerfel.js`: Ein nackter Bezeichner ist gültiges JavaScript und knallt erst zur Laufzeit.
  `wuerfeSection()` wird **aus dem Quelltext von `js/regie_vault.js` geschnitten** statt
  nachgebaut, sonst liefen Export und Anzeige auseinander. In `t_figuren.js` fällt weiterhin die
  eine bekannte Prüfung durch („vor dem ersten Ergebnis ist die Kachel zu"), unverändert seit dem
  13.10.
- **[OFFEN] Das Protokoll ist für Spieler nicht verborgen.** `sitzungen` ist als Ganzes lesbar —
  über die Browser-Konsole käme ein Spieler an die Notizen. Dasselbe Schutzniveau wie bei den
  SL-Seiten, die allein durch ihre unbekannte Adresse geschützt sind. Eine echte Trennung bräuchte
  die anonyme Anmeldung, die ohnehin aussteht.

### 2026-10-14 (Fortsetzung) — Fehler: Wurf und Schwelle widersprachen sich
- **Hendriks Fund an der Würfelleisten-Vorschau:** Bei −4 stand dort „Wert: d6 5 … Ergebnis 1 …
  das reicht nicht (nötig: 4)". Drei Zahlen, die nicht zueinander passen.
- **Der Fehler steckte nicht nur in der Vorschau, sondern im ausgelieferten
  `heldenbrief.html`** (Zeile 681): Dort stand fest `nötig: ZIELZAHL`, also immer 4 — während
  `r.ergebnis` den Modifikator bereits enthielt. Solange es keinen Modifikator gab, fiel das nie
  auf. **Mit Wunden zeigt der echte Bogen seit dem 07.09. dasselbe Durcheinander.**
- **Ursache: zwei gleichwertige Lesarten desselben Wurfs vermischt.**
  - „Wurf 5, davon 4 Abzug → 1, nötig war 4"
  - „Wurf 5, nötig war 8"

  Beide sind **mathematisch identisch**, weil die Steigerung immer bei Ziel + 4 liegt — ein
  Abzug und eine höhere Zielzahl verschieben beide Schwellen gleich weit. Angezeigt wurden aber
  die **rohen** Würfel aus der ersten Lesart und die **feste 4** aus der zweiten.
- **Behoben an der Wurzel, nicht in der Anzeige:** `wurf()` in `js/regelwerk.js` liefert jetzt
  zusätzlich `roh` (der höhere Wurf, unverrechnet), `ziel` und `zielSteigerung`. Der Heldenbrief
  zeigt damit, was am Tisch verständlich ist: **Die Würfel zeigen, was sie zeigen, und die
  Schwelle wandert.** „Ergebnis 5 — das reicht nicht (nötig: 8)."
- **Geprüft:** über vier Modifikatoren je 60.000 Würfe **null Widersprüche** zwischen
  `roh >= ziel` und dem ausgewiesenen Band, und `ziel` ist immer `4 − mod`.
- **Dazu in der Vorschau:** eine Reihe **Erschwernis** (`+2 · 0 · −2 · −4`), die zu jedem Abzug
  gleich die Zielzahl nennt — so trifft die Ansage der Spielleitung („du brauchst eine 8") genau
  einen Knopf. Die Engine konnte Modifikatoren längst; es fehlte nur die Bedienung.
- **Nebenbei beantwortet:** Würfe sind **öffentlich**. `diceRolls` ist ein gemeinsamer Pfad, der
  Feed läuft auf `karte.html` und `regie.html`, jeder sieht jeden Wurf (90 s in der Datenbank,
  60 s sichtbar). Nur die Spielleitung hat „Privat würfeln" (`allowPrivate` wird ausschließlich
  von `regie_vault.js` gesetzt) — ein privater Wurf geht nie über Firebase.

### 2026-10-14 — Fehler: keine Musik im gestarteten Spiel
- **Hendriks Meldung:** „Es läuft keine Musik im gestarteten Spiel."
- **Ursache war nicht die Tonwiedergabe, sondern WO die Zuordnung lag.** **Neun von dreizehn
  Szenen hatten überhaupt kein `soundFile` im Code** — darunter die Vorgabe-Szene Grimsgate
  (1.1), das Schiff (2.1) und sämtliche Übergangsszenen. Ihre Musik kam ausschließlich aus der
  Sound-Leiste der Regie, und die schreibt nach `sceneAudioFile` in die Datenbank.
  - Per REST gegengeprüft: In der **Wurzel** liegen **15 Zuordnungen**
    (`1-1: Grimgate1.ogg`, `11-1: jungle.ogg`, `7-1: flamenco.ogg` …) — über Monate gesetzt.
    Die laufende Sitzung (`aktiveSitzung: "test"`) hat unter `stand/sceneAudioFile` **`null`**.
  - **Das ist eine Folge des Sitzungs-Umbaus, die ich nicht genannt habe.** Ich habe gesagt, der
    Spielstand bleibe in der Wurzel liegen und lasse sich kopieren — aber nicht, dass die
    komplette Musikzuordnung dazugehört und ohne Übernahme jede neue Sitzung stumm ist.
- **Behoben, und zwar an der richtigen Stelle:** Die Musik einer Szene ist **Inhalt des
  Abenteuers, kein Spielstand.** Sie gehört ins Szenenfile. Acht Szenen haben ihr `soundFile`
  jetzt im Code — die Werte sind Hendriks eigene aus der Wurzel übernommen:
  1.1 Grimgate1.ogg · 2.1/5.1/12.1 ship1.ogg · 7.1 flamenco.ogg · 8.1 BBay.ogg ·
  9.1 mystic.ogg · 11.1 jungle.ogg.
  - **Kein Datenbankschreiben nötig**, und es wirkt in **jeder** Sitzung sofort, auch in künftigen.
    Die Sound-Leiste bleibt für den Live-Wechsel (Finale: ritual → temple → ending) und
    überschreibt den statischen Wert weiterhin — `karte.html` gibt dem Firebase-Wert Vorrang und
    fällt nur zurück, wenn keiner da ist.
- **Ein eigener Fehler beim Eintragen:** Bei `2.1` stand `soundFile` schon auskommentiert hinter
  `imgOverrides: {}` **ohne** nachfolgendes Komma. Aus dem Kommentar ein echtes Feld zu machen
  brach die Datei. Die Syntaxprüfung hat es sofort gemeldet.
- **Neues `tests/t_musik.js`** (34 Prüfungen, 0 Fehler): jede Szene bringt ihre Musik selbst mit
  (Ausnahmen stehen mit Begründung in einer Liste, derzeit nur 6.1), **jede genannte Datei liegt
  wirklich in `audio/`** — ein Dateiname ins Leere ist schlimmer als keiner, weil es wie ein
  Tonproblem aussieht statt wie ein Tippfehler — und `karte.html` fällt nachweislich auf den
  statischen Wert zurück, wenn keine Datenbank da ist oder das Lesen scheitert.
- **Bestand:** `t_syntax.js` 37, `t_termine.js` 144, `t_figuren.js` 308 mit **einem** Fehlschlag
  („vor dem ersten Ergebnis ist die Kachel zu") — derselbe, der schon am 13.10. vermerkt ist,
  nicht von dieser Änderung.
- **[OFFEN] `6.1`** (Golden Lion in der Flaute) hat als einzige Szene keine Musik — hatte auch in
  der Wurzel nie eine. Zuordnung ist Hendriks Entscheidung.
- **[OFFEN] `15.1`** (Arena) steht im Code auf `ritual.ogg`, in der Wurzel stand `temple.ogg` —
  offenbar am Tisch live umgeschaltet. Nicht angefasst: welche die Vorgabe sein soll, entscheidet
  Hendrik.

### 2026-10-13 — Fehler: alle Spieler standen als „nichts eingetragen" da
- **Hendriks Meldung mit Screenshot:** Unter dem Kalender trug jeder Name „· nichts eingetragen",
  während „Beste Fenster" direkt darunter dieselben Leute mit 3/5 fand.
- **Ursache:** `renderWhoList()` hing nur am Lauscher auf `termine/spieler`, nicht an dem auf
  `termine/verfuegbar`. Die Spielerliste kommt meist zuerst an, die Namen wurden also gegen noch
  leere Zeiten gezeichnet und danach nie wieder. Die Daten waren die ganze Zeit richtig, falsch
  war nur die Anzeige.
- **Behoben:** Der Zeiten-Lauscher zeichnet die Liste jetzt neu, ebenso „Alle meine Zeiten
  löschen". Eine neue Prüfung in `tests/t_termine.js` schlägt auf dem alten Code nachweislich an.
  144 + 37 Prüfungen ohne Fehler. In `t_figuren.js` fällt weiterhin eine Prüfung durch („vor dem
  ersten Ergebnis ist die Kachel zu“). Sie fiel schon vor dieser Änderung durch und ist hier nicht
  angefasst.
- **Nebenbei:** Das Kampagnenjahr ist auf **1701** festgelegt (Bibel, Kopf). Begründung: zwischen
  den Kriegen. Spanien ist feindselig, aber ein spanischer Hafen ist noch anlaufbar (`7.1`), und
  Harwicks Kaperbrief stammt aus dem letzten Krieg, ist also rechtlich fragwürdig.

### 2026-10-12 (Fortsetzung 8) — Bennies tun endlich etwas: Wurf wiederholen
- **Anlass war Hendriks Frage** „Was ist in dem Regelwerk Glückspilz ein zusätzlicher Bennie?"
  Antwort auf die Frage selbst: 3 Bennies je Sitzung, mit dem Talent 4. Beim Nachsehen kam aber
  heraus, dass das **die ganze Mechanik war** — der Bennie war ein reiner Zähler mit einem Knopf
  „ausgeben". **Nirgends im Projekt stand, was man damit anfängt:** nicht in `js/regelwerk.js`,
  nicht im Heldenbrief, nicht in der Kampagnen-Bibel.
- **Zwei Stellen setzten die Wirkung längst voraus** und hingen damit in der Luft: der
  Steckbrief-Hilfetext zum Antrieb („Kostet er dich einmal etwas, bekommst du dafür einen Bennie")
  und das Talent **Anfeuern** („Einmal je Szene gibst du einem Verbündeten einen deiner Bennies").
- **Eingebaut ist der Gebrauch, den man am Tisch wirklich braucht** (Hendriks Wahl aus den drei
  angebotenen): Unter jedem Wurf im Heldenbrief steht **„Mit Bennie wiederholen"**. Die Probe wird
  komplett neu geworfen, beide Würfe stehen danach nebeneinander, und der zählende ist markiert.
  - **Gewürfelt wird weiterhin in `js/regelwerk.js`** (`wurf()`), nicht in der Seite — dieselbe
    Funktion wie beim ersten Wurf. Die Seite stellt nur dar.
  - **Der Bennie wird VOR dem Wurf abgezogen.** Bricht etwas dazwischen ab, ist lieber ein Bennie
    zu viel weg als ein Wurf umsonst.
  - **Nur einmal je Probe**, und ohne Bennie erscheint das Angebot gar nicht erst, sondern ein
    Satz, warum. Nichts geht ins Minus.
  - Das Ergebnis geht erneut in den Würfel-Feed, mit `(Bennie)` im Namen — die Spielleitung soll
    sehen, dass hier ein Glückspunkt verbrannt wurde.
- **„Das bessere zählt" heißt: erst das Band, dann die Zahl.** Ein Erfolg mit 5 schlägt einen
  Misserfolg mit 3, obwohl die Zahlen nah beieinander liegen. Steht als Kommentar an
  `besserer()`, samt dem Hinweis, dass die andere Lesart (der neue Wurf ersetzt den alten) eine
  Zeile weiter unten wäre — falls am Tisch anders gespielt wird.
- **Der Zähler erklärt sich jetzt selbst:** „Bennies sind dein Glück. Einen davon gibst du aus, um
  eine misslungene Probe komplett neu zu würfeln — das bessere Ergebnis zählt … Zum Start der
  Sitzung hast du 3, und deine Spielleitung gibt dir für gutes Spiel weitere dazu." Die Zahl kommt
  aus `bennies(F)`, zeigt mit Glückspilz also 4.
- **Getestet: 489 Prüfungen über drei Skripte, 0 Fehler** (26 neue). Der Ablauf wird wirklich
  ausgeführt: normaler Wurf kostet nichts, Wiederholen zieht genau einen Bennie, beide Würfe
  erscheinen, **genau einer** ist als zählend markiert, ein zweites Wiederholen zieht nichts mehr,
  ohne Bennies gibt es kein Angebot und nichts rutscht ins Minus. Dazu fünf Vergleichsfälle für
  „das bessere zählt".
- **[OFFEN] Die beiden anderen Verwendungen** (Schaden abfangen, „Angeschlagen" sofort loswerden)
  sind bewusst nicht eingebaut: Beide passieren im Kampf, und solange `js/arena.js` nach dem alten
  W100-System rechnet, hingen sie in der Luft.


### 2026-10-12 (Fortsetzung 7) — Fehler: Zeiten verschoben sich beim Ändern des Rasters
- **Hendriks Beobachtung, und sie war genau richtig:** „Wenn ich das Zeitfenster ändere,
  verschieben sich diese. Demnach hängen die Zeiten nicht direkt auf einem Zeitslot, sondern
  dieser Slot ist relativ zur Größe des gesamten Tages?" — Ja. Der gespeicherte Bitstring begann
  bei `cfg.vonStunde` und hatte **keinen eigenen Anker**. Derselbe String bedeutete bei `von=16`
  die Zeit 18:00–20:00 und bei `von=17` plötzlich 19:00–21:00.
- **Das war kein Schönheitsfehler, sondern stiller Datenverfall.** Stellt die Spielleitung das
  Raster um, verschieben sich **rückwirkend alle schon eingetragenen Zeiten** — ohne Meldung, und
  bemerkbar erst daran, dass die Terminvorschläge nicht mehr passen.
- **Beim Nachsehen in der laufenden Sitzung stand es schon gemischt da:** `kairasy` und `sl` mit
  20 Zeichen (Raster 14–24, das aktuelle), `lucie` mit 16 (das alte 16–24). Ihre Einträge wurden
  also bereits zwei Stunden verschoben gelesen. **Zum Glück ohne Schaden: alle vier Tage von
  `lucie` waren leer.**
- **Gespeichert wird jetzt absolut:** 48 Zeichen je Tag, Zeichen 0 ist **immer 00:00**. Das
  Raster ist damit **reine Ansicht** — es lässt sich beliebig verstellen, ohne eine einzige
  eingetragene Minute zu bewegen. Neue `tagAbsolut()`, `setzeAusschnitt()` und `TAG_SLOTS` in
  `js/termine.js`; `holeTag()` liefert weiterhin den angezeigten Ausschnitt, **alle Aufrufer
  bleiben unverändert**.
  - `setzeAusschnitt()` lässt beim Schreiben alles **außerhalb** des Fensters stehen. Sonst würde
    ein verkleinertes Raster die Zeiten davor und danach stillschweigend löschen.
  - Alte Einträge werden weiter richtig gelesen: Ist ein String kürzer als 48, wird angenommen,
    dass sein Fenster bei 24:00 endete — das traf auf alle Bestandsdaten zu.
- **Die Bestandsdaten sind einmalig umgestellt** (42 Felder). Geprüft wurde dabei nicht die
  Zeichenfolge, sondern die **Uhrzeiten**: Für jeden Spieler und Tag muss vorher und nachher
  dieselbe Menge an Halbstunden belegt sein. Ergebnis: **0 Bedeutungsabweichungen.** Vorher wurde
  der komplette `termine`-Knoten gesichert.
  - Reihenfolge war dabei wichtig: **erst den Code ausliefern, dann die Daten umstellen.** Der
    neue Code liest beide Formate; der alte hätte einen 48-Zeichen-String als Fenster ab 14:00
    gelesen und Unsinn angezeigt.
- **Getestet: 464 Prüfungen über drei Skripte, 0 Fehler** (16 neue). Der tragende Nachweis:
  dieselbe gespeicherte Zeit wird über vier verschiedene Raster hinweg (9–18, 14–24, 16–24, 0–24)
  **identisch** gelesen. Dazu, dass alte 16er- und 20er-Strings weiterhin auf dieselbe Uhrzeit
  führen, dass `setzeAusschnitt()` nur im Fenster löscht und außerhalb nichts anfasst, und dass
  die Fenstersuche die absolute Zeit findet.


### 2026-10-12 (Fortsetzung 6) — Attributs- und Fertigkeitspunkte: erklärt und begrenzt
- **Hendriks Vorgabe:** Auch die Punkte bei Attributen und Fertigkeiten sollen erklärt werden, und
  **nur das mögliche Maximum** vergeben werden können. Vorher klemmten `chgAttr()` und `setFert()`
  nur auf die Würfelstufen (d4…d12), **nicht aufs Budget** — überziehen ging, es gab nur eine rote
  Zahl in der Fußleiste.
- **Die unauffällige Stelle war nicht das Hochklicken, sondern die Hintertür.** Ein Attribut zu
  **senken** macht die Fertigkeiten darüber teurer (1 Punkt bis zur Höhe des Attributs, 2 darüber).
  Wer also erst Fertigkeiten kauft und dann das Attribut senkt, **sprengt das Fertigkeitsbudget,
  ohne eine einzige Fertigkeit angefasst zu haben.** Deshalb prüfen `probeAttr()`/`probeFert()` die
  Folgen einer Änderung, **bevor** sie geschieht — nur so lässt sich der Knopf vorher sperren,
  statt hinterher zu meckern.
- **Gesperrt wird sichtbar, nicht stumm.** Ein erschöpfter Knopf ist ausgegraut und trägt den Grund
  als Titel: „Keine Attributspunkte mehr — senk ein anderes Attribut.", „Die nächste Stufe kostet
  2 Punkte — so viel hast du nicht mehr.", „Senken würde deine Fertigkeiten teurer machen, als du
  Punkte hast." Auch die Chips der ungelernten Fertigkeiten gehen zu, wenn kein Punkt mehr da ist.
- **Beide Hilfetexte erklären jetzt die Rechnung**, nicht nur die Zahl:
  - **Attribute:** „5 Punkte auf fünf Attribute. Alles beginnt bei d4, und jeder Punkt hebt ein
    Attribut um eine Würfelstufe — d4 → d6 → d8 → d10 → d12. … Attribute entscheiden außerdem, wie
    teuer deine Fertigkeiten werden: Bis zur Höhe ihres Attributs kostet eine Fertigkeitsstufe
    1 Punkt, darüber 2. Ein hohes Attribut macht also alles billiger, was daran hängt."
  - **Fertigkeiten:** mit ausgerechnetem Beispiel — „Kämpfen auf d8 kostet also 3 Punkte, wenn
    Geschicklichkeit auf d8 steht, aber 5, wenn sie nur auf d4 steht. Lohnt sich eine Fertigkeit,
    lohnt oft erst ihr Attribut."
  - Dazu je ein Stand in Worten („Noch 3 Punkte zu vergeben." / „Alle 5 Punkte vergeben.") und der
    Hinweis, dass Reste verfallen.
- **Getestet: 447 Prüfungen über drei Skripte, 0 Fehler** (32 neue). Darunter: 30 Klicks auf ein
  Attribut und sechs auf jede Fertigkeit sprengen nichts, **alle** Punkte lassen sich aber
  vergeben; die Hintertür ist zu; Herunterregeln geht immer, damit niemand feststeckt. Und das
  Rechenbeispiel im Hilfetext ist **gegen `fertKosten()` nachgerechnet** (3 bzw. 5) — ein Beispiel,
  das falsch rechnet, lehrt Falsches.


### 2026-10-12 (Fortsetzung 5) — Der Schwächen-Schritt erklärt den Tausch
- **Hendriks Vorgabe:** Der obere Text soll besser erklären, **wie Schwächen sich auswirken**, **wie
  sie Punkte freischalten**, dass sie **freiwillig** sind und dass sie **mehr Talente ermöglichen**.
  Vorher stand dort ein statischer Satz über „die Punkte, aus denen deine Talente bezahlt werden"
  plus die Obergrenze — **der Tausch war daraus nicht abzulesen**, und wie viele Talente man
  gerade hat, erst recht nicht.
- **Der Text ist jetzt dynamisch** (`hndLead`, gerendert in `renderHnd()`) und sagt vier Dinge,
  bevor jemand klickt:
  1. **Freiwillig** — „eine Figur ohne Schwächen ist regelkonform. Sie hat dann das eine freie
     Talent und sonst keines."
  2. **Was sie bewirken** — die einen drücken Würfel oder schränken ein, die anderen (mit *Haken*)
     kosten keinen Wert, sondern **verpflichten**: Sie geben der Spielleitung etwas, woran sie die
     Figur aufhängt.
  3. **Was sie bringen** — eine schwere 2 Punkte, eine leichte 1, höchstens 1 schwere und
     2 leichte, also nie mehr als 4.
  4. **Wofür das gut ist** — als **Leiter**, bei der die gerade zutreffende Stufe leuchtet:

         keine → 1 Talent  ·  1 schwere oder 2 leichte → 2 Talente  ·  1 schwere + 2 leichte → 3 Talente

- **Dazu der eigene Stand in Worten:** „Du hast 1 schwere und 1 leichte, also 3 Punkte — damit sind
  2 Talente möglich." Trifft es zu, hängt der Verfall-Hinweis dran.
- **Der Hinweis unten erklärte den *Haken* ein zweites Mal** — das steht jetzt oben, wo es
  hingehört. Unten steht dafür, was vorher nirgends stand: dass sich eine Schwäche jederzeit
  wieder abwählen lässt, solange kein Talent mehr daran hängt.
- **Zwei Sprachfehler in meinem eigenen Text, beim Gegenlesen des gerenderten Ergebnisses
  gefunden:** „bekommt ihr eines freies Talent" und „damit **sind** 1 Talent möglich". Beide
  behoben; Einzahl/Mehrzahl hängt jetzt an der Zahl, und eine Null wird gar nicht erst genannt
  („1 schwere" statt „1 schwere und 0 leichte").
- **Getestet: 415 Prüfungen über drei Skripte, 0 Fehler** (14 neue). Der Text wird dabei wirklich
  gerendert und auf Inhalt geprüft: beide Sorten erklärt, Punktwerte und Obergrenze genannt, alle
  drei Leiterstufen da, die zutreffende hervorgehoben — und Einzahl/Mehrzahl stimmt bei 1 Talent,
  2 Talenten und 1 Punkt.


### 2026-10-12 (Fortsetzung 4) — Talente sind bezahlt, bevor man sie nimmt
- **Anlass war Hendriks Frage:** „Muss ich alle Schwächen nehmen? Und kann ich auch mehr Talente
  nehmen, als meine Schwäche-Punkte erlauben?" Antwort auf die erste: nein, Schwächen sind
  **vollständig optional** (höchstens 1 schwere und 2 leichte, null ist erlaubt) — das war schon
  richtig und hart begrenzt. Antwort auf die zweite: **ja, man konnte.** `toggleTal()` sperrte nur
  den **Rang**; bei den Punkten durfte man überziehen, es gab nur eine rote Zahl und den Hinweis
  „Talente nicht bezahlt" — und **abschicken ließ sich die Figur trotzdem.**
- **Hendriks Vorgabe darauf:** „Dann sollten wir das in der Auswahl auch dynamisch begrenzen und
  im Hilfetext oben klar machen."
- **Die Auswahl ist jetzt die Grenze**, nicht die Nachkontrolle. Neue `talenteErlaubt()`
  (`GRATIS_TALENTE + ⌊Punkte / TALENT_KOSTEN⌋`), `toggleTal()` steigt darüber hinaus aus, und
  erschöpfte Karten sind zu.
  - **Die beiden Sperrgründe sind getrennt beschriftet.** Vorher stand an jeder gesperrten Karte
    „gesperrt: ab ⟨Rang⟩" — bei einer Punktesperre hätte man den Fehler an der völlig falschen
    Stelle gesucht. Jetzt: „keine Punkte mehr — nimm eine Schwäche dazu oder wähle ein Talent ab".
    Der Rang ist nicht zu kaufen, die Punkte schon; das muss man unterscheiden können.
- **Der Hilfetext rechnet jetzt vor**, statt nur Restpunkte zu nennen: „Du hast 2 Punkte und darfst
  damit 2 Talente nehmen (noch 1 frei)."
- **Der verfallende Punkt wird ausgesprochen.** Handicap-Punkte kaufen in dieser Fassung
  **ausschließlich** Talente, und eines kostet 2 — ein **ungerader Punkt ist wertlos**. Eine
  einzelne leichte Schwäche bringt mechanisch gar nichts, und „1 schwere + 1 leichte" ist exakt so
  gut wie „1 schwere" allein. Steht jetzt orange im Hilfetext, sobald es zutrifft: „1 Punkt bleibt
  übrig und verfällt … Eine weitere Schwäche bringt dir das nächste." Vorher hätte man ihn für
  bare Münze genommen.
  - **Die eigentliche Ursache ist damit nicht behoben, nur sichtbar.** Im Original kauft ein Punkt
    auch einen Fertigkeitspunkt oder Startgeld; diese Verwendungen gibt es hier nicht. Das zu
    ändern wäre eine Regelentscheidung — Hendrik hat sie (noch) nicht getroffen.
- **Der Rückweg löscht nichts hinter dem Rücken.** Wählt man eine Schwäche ab, die ein Talent
  trägt, **bleibt sie stehen** und die Seite sagt, warum: „„Seekrank" trägt eines deiner Talente.
  Wähl erst im nächsten Schritt ein Talent ab." Bewusst anders als beim Rang, wo ein zu hohes
  Talent automatisch abfällt — hier soll der Spieler selbst entscheiden, **welches** Talent weicht.
- **Getestet: 401 Prüfungen über drei Skripte, 0 Fehler** (33 neue). Darunter die ganze
  Rechentabelle Zeile für Zeile (0/0→1, 0/1→1, 0/2→2, 1/0→2, 1/1→2, 1/2→3) und ein
  durchgespielter Ablauf: erstes Talent frei, zweites ohne Punkte gesperrt **mit dem richtigen
  Grund**, nach einer schweren Schwäche geht es, nach einer leichten weiterhin nicht (aber der
  Hinweis erscheint), nach der zweiten leichten geht das dritte — und der Rückweg bleibt stehen,
  bis das Talent weg ist. Am Ende steht nachweislich nie „Talente nicht bezahlt".


### 2026-10-12 (Fortsetzung 3) — Neue Figuren sind Novize, außer die SL gibt mehr frei
- **Hendriks Vorgabe:** „Diese sind immer Novize außer die SL gibt explizit das anders frei."
  Vorher durfte jeder Spieler seinen Rang im Konzept-Schritt frei wählen (eingebaut am 06.09.,
  „wer die gespielte Kampagne als Vorgeschichte zählt, steigt höher ein") — die Entscheidung lag
  damit beim Spieler statt bei der Spielleitung.
- **Die eigentliche Falle lag aber nicht in der Oberfläche, sondern im Regelwerk.**
  `steigerungAnwenden()` rechnete den Rang aus den **Steigerungen** zurück
  (`figur.rang = rangVon(figur.steigerungen).id`). Eine Figur, die als Veteran beginnt, hat null
  Steigerungen — **die erste Steigerung hätte sie zum Novizen gemacht.** Das wäre genau in dem
  Moment aufgefallen, in dem Hendrik die Freigabe zum ersten Mal benutzt.
  - Neues Feld **`startRang`** an der Figur und **`rangJetzt(figur)`** =
    `max(startRang, rangVon(steigerungen))`. Die Steigerungen können den Rang damit nur **heben,
    nie senken**. `alsFigur()` übernimmt und klemmt ihn.
- **Die Freigabe liegt je Sitzung in `sitzungen/{sid}/meta/startRang`** — eine Vorgabe für die
  Runde, kein Zustand, der sich im Spiel ändert. `sitzungen` ist ohnehin beschreibbar: **kein
  neuer Pfad, keine Regeländerung.**
- **Freigegeben wird eine OBERGRENZE, kein fester Rang.** Wer lieber als Novize anfängt, darf das
  auch dann — die Freigabe nimmt niemandem etwas weg.
- **Im Assistenten** steht ohne Freigabe schlicht „Novize — so startet in dieser Runde jede Figur.
  Höher einsteigen gibt die Spielleitung frei." **Nichts anklickbar**: Eine Auswahl mit genau einem
  Eintrag wäre eine Frage, die keine ist. Mit Freigabe erscheinen genau die erlaubten Ränge plus
  der Hinweis, bis wohin freigegeben ist.
  - Die Freigabe wird **beobachtet, nicht einmal gelesen**: Ändert die SL sie, zieht der Assistent
    sofort nach. Steht eine Figur dann höher als erlaubt, **fällt sie zurück** — sonst trüge sie
    eine Freigabe weiter, die es nicht mehr gibt.
  - `waehleRang()` klemmt zusätzlich **im Code**, nicht nur in der Anzeige: Auch ein von Hand
    abgesetzter Aufruf kommt nicht über die Freigabe hinaus.
- **Im Regie-Hub** eine Zeile **Startrang** je Sitzung mit allen fünf Rängen und einem Satz, was
  das bedeutet („Neue Figuren sind Novize." / „… dürfen bis Veteran einsteigen — niedriger geht
  auch.").
- **Getestet: 368 Prüfungen über drei Skripte, 0 Fehler** (36 neue). Der tragende Nachweis ist die
  Falle oben: Eine Figur mit `startRang: 2` ist nach einer Steigerung **immer noch Veteran**.
  Dazu: vier Steigerungen machen einen Novizen zu Erfahren, erspielter Rang **überholt** den
  Startrang statt ihn zu ersetzen, `rangJetzt` senkt nie, `alsFigur` klemmt Unsinn
  (`startRang: 99` und `-5`). Die Anzeige wird wirklich ausgeführt: ohne Freigabe **kein einziges
  `onclick`**, mit Freigabe genau die erlaubten Ränge und die übrigen nicht; Wahl bis zur Grenze
  geht, darüber wird geklemmt, darunter bleibt erlaubt. Und der Würfelkern samt Budgets ist
  unverändert.


### 2026-10-12 (Fortsetzung 2) — Jede Anfangszeit eines Tages wählbar
- **Hendriks Meldung:** „Ich kann nur eine Zeit am Tag wählen. Auch wenn von 18 Uhr zb verfügbar
  ist." Zu Recht — das war kein Fehler, sondern eine Regel, die zu weit ging: `besteFenster()`
  zeigt je Tag **nur das beste** Fenster („sonst stünden hier zwölf Varianten desselben Abends").
  Für die Übersicht richtig, aber es nimmt der Spielleitung die Wahl. Kann jemand von 17 bis 23
  Uhr, ist 19:00–22:30 nur **ein** Schnitt daraus.
- **Neue `fensterAmTag()` in `js/termine.js`:** alle Anfangszeiten eines Tages, an denen überhaupt
  jemand die volle Sitzungsdauer durchhält — nach Uhrzeit sortiert, damit man sie lesen kann wie
  einen Abendplan. `besteFenster()` bleibt unverändert und trägt weiter die Übersicht.
- **Im Regie-Hub ist jede Fensterzeile jetzt aufklappbar** („▾ 5 andere Zeiten an diesem Tag").
  Aufgeklappt steht jede Anfangszeit mit Namen, Zähler und eigenem **„veröffentlichen"** da; das
  Fenster, von dem aus man aufgeklappt hat, ist markiert. Bei einem Tag mit nur einer möglichen
  Zeit erscheint **kein** Umschalter — dort gibt es nichts zu wählen.
  - Welche Tage offen sind, liegt wie die übrige Aufklapperei **nur im Speicher**, nicht in der
    Datenbank.
- **An Hendriks Beispiel nachgerechnet** (Peter 17:00–23:00, SL 17:30–21:30, Sitzung 3,5 h):

      17:00–20:30  1/2    18:30–22:00  1/2
      17:30–21:00  2/2    19:00–22:30  1/2
      18:00–21:30  2/2    19:30–23:00  1/2

  **18:00 ist damit wählbar** — vorher stand dort nur 17:30–21:00, weil das als „bestes" galt.
  Dass auch Zeiten erscheinen, an denen nur einer kann, ist Absicht: Die Spielleitung entscheidet,
  ob ihr das reicht, nicht die Rechnung.
- **Der Schlusshinweis der Ansicht ist nachgezogen** — er behauptete noch „Je Tag steht nur das
  beste Fenster", was jetzt nur noch die halbe Wahrheit wäre.
- **Getestet: 332 Prüfungen über drei Skripte, 0 Fehler** (21 neue). Darunter: die Liste ist nach
  Uhrzeit sortiert, jedes Fenster hat mindestens einen, der kann, **das beste Fenster kommt in der
  Tagesliste vor** (sonst fände man den Vorschlag von oben unten nicht wieder) und keines ist
  besser als das beste; dazu Hendriks konkreter Fall — 18:00 ist wählbar und sagt richtig, dass
  beide können. Grenzen: ein Tag ohne Eintrag, ein vergangener Tag, keine Spieler und eine
  Sitzungsdauer, die länger ist als der angezeigte Zeitraum, ergeben jeweils nichts.
  - **Ein Testfehler, meiner:** Die Prüfung „bei nur einer möglichen Zeit kein Umschalter" suchte
    nach dem Wortlaut „andere Zeit" — und stolperte über meinen eigenen, neu geschriebenen
    Schlusshinweis. Prüft jetzt auf den Knopf statt auf den Text.


### 2026-10-12 (Fortsetzung) — Auch die Zeiten hängen am Namen
- **Hendriks Meldung mit Screenshot:** Nach erneuter Anmeldung als „Peter" im abgesicherten Modus
  stand **Peter zweimal** in der Liste — einmal mit seinen Zeiten, einmal als „nichts
  eingetragen". Dazu seine Vorgabe: *„Können die abgegebenen Zeiten und die Charaktere einfach
  immer an den Namen der Session gehangen werden? Dann kann man natürlich auch in das ‚Konto' von
  anderen, aber P&P Runden sind ja lokal und da brauchen wir solchen Schutz nicht."*
- **Ursache:** Der Schlüssel war `pnp_player_id` — eine **Zufallskennung, die je Browser neu
  entsteht** (`'p' + Math.random()…`). Zweiter Browser, privates Fenster, gelöschte Browserdaten:
  jedes Mal ein neuer Mensch für das System. Die Figuren hingen seit dem 11.10. schon am Namen,
  die Termine noch nicht — das war die letzte Stelle.
- **Jetzt am Namen, wie die Figuren:**

      termine/spieler/{spielerKennung(name)}
      termine/verfuegbar/{spielerKennung(name)}

  Neue `meinKey()` im Hub; die Browser-Kennung bleibt nur noch als Vermerk, welcher Browser sich
  zuletzt gemeldet hat.
- **Hendriks Entscheidung ausdrücklich festgehalten:** Wer denselben Namen eintippt, sieht und
  ändert dieselben Zeiten und dieselbe Figur. Das ist **gewollt**, nicht übersehen — eine
  P&P-Runde ist eine Handvoll eingeladener Freunde, und derselbe Mensch soll von jedem Gerät an
  seine Sachen kommen, ohne ein Konto zu haben. Ein Schutz gegeneinander wäre hier Aufwand ohne
  Nutzen. Steht so als Begründung im Code, damit es niemand später „repariert".
- **Die schon entstandenen Doppeleinträge räumen sich beim nächsten Anmelden selbst auf**
  (`umzugAlterEintraege()`):
  - **Erkannt wird ein Alteintrag daran, dass sein SCHLÜSSEL nicht zu seinem NAMEN passt.** Das
    ist genau und braucht kein Raten über das Format der Kennung — ein Name wie „peter" fängt
    schließlich genauso mit `p` an wie eine Zufallskennung.
  - **Zusammengeführt wird tagweise, und der Eintrag am Namen gewinnt.** Ohne diese Regel hinge
    das Ergebnis davon ab, welcher Browser sich zuletzt gemeldet hat.
  - **Erst zusammenführen, dann löschen** — bricht es dazwischen ab, steht jemand doppelt da statt
    mit leerem Kalender.
- **Hendriks Lage aus dem Screenshot durchgespielt** (zwei Peter-Einträge unter Zufallskennungen,
  die Zeiten beim älteren, dazu „SL" als anderer Mensch):

      VORHER   Spieler: p7xk21mabc, p9qq44zdef, sl   ·   Peter-Einträge: 2
      NACHHER  Spieler: sl, peter
               peter: {"2026-10-12":"111100","2026-10-13":"001111"}
               sl:    {"2026-10-12":"110000"}

  Also ein Peter, seine Zeiten vollständig mitgekommen, **SL unberührt**, keine Reste.
- **Getestet: 311 Prüfungen über drei Skripte, 0 Fehler.** Die Regel „jeder Schreibzugriff liegt
  unter dem eigenen Schlüssel" ist dabei schärfer geworden: Sie erhebt alle vier Schreibzugriffe
  aus dem Quelltext, verlangt, dass **keiner** die Browser-Kennung benutzt, und prüft bei den
  zwei, die über eine lokale Variable laufen, zusätzlich nach, dass diese aus `meinKey()` stammt —
  sonst ließe sich die Regel durch bloßes Umbenennen aushebeln.
  - **Drei Testfehler, alle veraltete Erwartungen statt echter Fehler:** Die Prüfungen suchten
    noch wörtlich nach `meinePid`.


### 2026-10-12 — Fehler: gelöschte Figur kam als leere Hülle zurück
- **Hendriks Meldung mit Screenshot:** „Trotz ich den Charakter gelöscht habe, ist der Heldenbrief
  immer noch klickbar und ruft einen leeren Charakterbogen auf, den man theoretisch wieder löschen
  kann." Der Screenshot trug den Beweis schon in sich: Die Kachel zeigte den „hat Figur"-Text,
  aber **ohne Namen** — es lag also ein Figurenknoten ohne Inhalt da.
- **Ursache, und sie war ein Kreis, den ich selbst gebaut habe:**
  1. Der Heldenbrief leitet nach dem Löschen zur Erschaffung weiter (richtig so).
  2. `startUebernahme()` im Assistenten rief am Ende **immer** `nachFirebase()` — ein Erbe vom
     07.09. mit der Begründung „damit die Spielleitung von einer fertigen Figur erfährt, auch wenn
     ihr Spieler nichts mehr anfasst".
  3. Also legte **das bloße Öffnen** des Assistenten im selben Moment eine **leere Hülle** an:
     Vorgabewerte, kein Name.
  4. Für den Hub war das eine Figur — Kachel wieder auf, Bogen öffnet sich leer, dieselbe
     Nicht-Figur erneut löschbar. **Löschen war damit faktisch wirkungslos.**
- **Zwei Schranken, bewusst beide:**
  - **Der Assistent legt beim bloßen Öffnen nichts mehr an.** Hochgeschrieben wird nur noch, wenn
    schon ein Knoten existierte (dann weiter synchronisieren, auch wenn es eine Hülle aus der Zeit
    vor diesem Fix ist) **oder** der Spieler tatsächlich angefangen hat. Der ursprüngliche Zweck
    bleibt damit erhalten.
  - **Neue `istFigurEcht()` in `js/sitzung.js`: geprüft wird auf INHALT, nicht auf Existenz.**
    Benutzt von der Hub-Kachel, der Sperre des Heldenbriefs **und** dessen lokalem Rückfall. Damit
    ist die Lücke grundsätzlich zu — eine Hülle gilt nirgends als Figur, egal wer sie anlegt.
    Bewusst **ohne** `js/regelwerk.js`: Diese Datei kennt die Regeln nicht und soll sie nicht
    kennen müssen. Eine frische Figur hat alle Attribute auf 1 (d4) und fünf Kernfertigkeiten auf
    1 — alles darüber ist eine Entscheidung, die jemand getroffen hat.
  - `hatLokaleFigur()` im Heldenbrief hatte seine **eigene** Vorstellung davon, was eine Figur ist
    (Name, Talente, Schwächen, Steigerungen). Zwei Vorstellungen laufen auseinander, und dann
    sperrt die eine Seite, während die andere aufmacht — jetzt dieselbe Funktion.
- **Der gemeldete Ablauf ist Schritt für Schritt durchgespielt** (eigene Simulation über alle drei
  Seiten mit gefälschter Datenbank):

      1-2. Löschen im Heldenbrief   LOESCHT anna · Weiterleitung · DB: (keine)
      3.   Assistent geöffnet       keine Schreibzugriffe · DB: (keine)   ← vorher: Hülle
      4.   Hub                      Kachel AUSGEGRAUT
      5.   Heldenbrief direkt       Seite sperrt statt leeres Blatt

- **Gegenprobe, dass ich nicht zu viel abgeschaltet habe** — vier Fälle: leerer Assistent schreibt
  **nicht**; liegt schon eine Figur in der Datenbank, wird **sofort** geschrieben; hat der Browser
  lokal schon einen Namen, ebenso; und wer nach dem Öffnen einen Namen eintippt, löst den
  Schreibvorgang wie immer aus.
- **Getestet: 297 Prüfungen über drei Skripte, 0 Fehler** (28 neue). Darunter jede Einzelheit, die
  eine Figur echt macht (Name, Talent, Schwäche, Ausrüstung, Steigerung, Rang, Wunde,
  angeschlagen, Notiz, Steckbrief-Feld, gesteigertes Attribut, gesteigerte Fertigkeit, auch als
  Firebase-Objekt statt Array) — und dass ein Name aus lauter Leerzeichen **nicht** zählt.
- **Die schon entstandenen Hüllen brauchen nichts.** Sie liegen unter demselben Schlüssel wie die
  künftige Figur: Baut der Spieler neu, werden sie gefüllt. Bis dahin gelten sie als „keine Figur",
  die Kachel bleibt grau, und die Regie listet sie als „ohne Namen" zum Löschen.


### 2026-10-11 (Fortsetzung 5) — Heldenbrief nur mit Figur
- **Hendriks Vorgabe:** Den Heldenbrief soll es nur geben, wenn auch eine Figur da ist —
  „sonst sollte er halt auch ausgegraut sein wie die Karte". Also genau dasselbe Verhalten wie bei
  der Kartenkachel, solange die Sitzung nicht gestartet ist: **ausgegraut, nicht versteckt**
  (Deckkraft .4, nicht klickbar, kein Ziel, Erklärung am Mauszeiger).
- **Als Lauscher, nicht als einmaliger Blick** (`beobachteFigur()` auf `figuren/{schlüssel}`):
  Baut der Spieler seine Figur in einem anderen Tab fertig, geht die Kachel **von selbst** auf;
  löscht er sie, geht sie von selbst zu. Dasselbe Muster wie bei der Freigabe der Karte.
  - Der Lauscher **hängt beim Namenswechsel um** (`figurRef.off()`): Meldet sich jemand erst nach
    dem Laden an, lief er sonst weiter auf den leeren Namen, und die Kachel wäre bis zum Neuladen
    grau geblieben. An- und Abmelden hängen ihn jetzt neu ein.
  - Vor dem ersten Ergebnis ist die Kachel **zu**. Andernfalls blitzt sie offen auf und geht gleich
    wieder zu, was wie ein Fehler aussieht.
  - Die Kachel nennt die Figur beim Namen („Mara Quint" am Tisch führen), sobald es eine gibt.
- **Die Seite selbst sperrt ebenfalls** — die Adresse kann jeder direkt aufrufen. Liegt unter Name
  und Sitzung nichts, kommt „Noch keine Figur" mit dem Knopf zur Erschaffung. **Das ist nicht
  Kosmetik:** Ein Bogen ohne Figur ist nicht nur ein leeres Blatt mit Knöpfen, sondern **wer darauf
  etwas anklickt, legt damit eine leere Figur an.**
  - **Nicht gesperrt wird, wenn lokal eine Figur liegt** (`hatLokaleFigur()`): Ohne Verbindung ist
    der Rückfall die einzige Wahrheit, und der Spieler soll seinen Bogen dann trotzdem führen
    können. „Brauchbar" heißt dabei mehr als ein leeres Gerüst — sonst sperrte ein einmal
    geöffneter, nie gefüllter Bogen den Spieler aus.
  - **Ein Datenbankfehler sperrt nicht**, sondern lässt den Bogen offen; die Seite sagt ohnehin
    selbst, woran es liegt.
  - **Die 8-Sekunden-Frist wird bei der Sperre abgeräumt.** Sie gibt das Schreiben frei, wenn die
    Datenbank hängt — nach einer Sperre hätte sie es doch noch freigegeben.
- **Nebenbei korrigiert:** Die Beschreibung der Erschaffungs-Kachel versprach noch eine „Regelwahl
  zwischen Savage Worlds und der Korsaren-Variante". Die Wahl ist im September entfallen, es gibt
  nur ein System — der Text stand seit vier Wochen falsch auf der Startseite.
- **Getestet: 269 Prüfungen über drei Skripte, 0 Fehler** (33 neue). Die Umschaltfunktion wird
  dabei wirklich ausgeführt, nicht nur im Quelltext gesucht: ohne Figur ausgegraut, nicht klickbar,
  ohne Ziel, mit Erklärung; mit Figur offen, Ziel gesetzt, Erklärung weg, Name im Text; eine Figur
  **ohne** Namen bricht nicht; und nach dem Löschen geht die Kachel wieder zu. Dazu, dass es ein
  `on()` und kein `once()` ist, dass An- und Abmelden neu einhängen, und dass dieselben Mittel zum
  Ausgrauen benutzt werden wie bei der Karte.


### 2026-10-11 (Fortsetzung 4) — Figur löschen
- **Hendriks Vorgabe:** Man soll seine Figur auch wieder löschen können. Eingebaut an beiden
  Stellen, an denen es Sinn hat: **„Figur löschen"** in der Kopfleiste des Heldenbriefs und
  **„Verwerfen und neu anfangen"** auf dem Abschluss-Schritt des Assistenten — dort ist Löschen ja
  gleichbedeutend mit „von vorn".
- **Die Falle war nicht das Löschen, sondern die Wiederauferstehung.** `speichern()` plant den
  Upload **800 ms später** ein. Ändert ein Spieler etwas und löscht sofort danach, legt der noch
  laufende Upload die Figur **wieder an** — und niemand versteht, warum sie zurück ist. Deshalb
  wird zuerst `syncTimer` abgeräumt und eine Flagge `geloescht` gesetzt, die jeden weiteren
  Schreibzugriff sperrt; **erst dann** wird gelöscht. Per Test ist belegt, dass beides **vor** dem
  Löschaufruf steht.
- **Drei Stellen, und das Vergessen EINER macht das Löschen rückgängig** — deshalb liegt
  `figurLoeschen()` in `js/sitzung.js` und nicht in den Seiten:
  1. der Knoten in der Datenbank,
  2. der lokale Rückfall `kors_figur_{sid}`,
  3. der gemerkte Schlüssel `pnp_figur_{sid}`.
  Bleibt (2) stehen, liest die Seite beim nächsten Öffnen den alten Stand und **schreibt ihn
  zurück**. Reihenfolge: **erst lokal, dann die Datenbank** — bricht es dazwischen ab, ist die
  Figur noch da und nur dieser Browser hat sie vergessen. Das ist der harmlosere halbe Zustand;
  andersherum wäre sie weg und der Browser schriebe sie aus dem Rückfall wieder hoch.
- **Zwei Schritte vor dem Löschen**, weil an einer Figur Stunden Arbeit hängen und es **kein
  Backup** gibt: eine Rückfrage, die die Figur **namentlich** nennt und auflistet, was verloren
  geht — danach muss der Figurenname **abgetippt** werden. Ein Fehlgriff auf den Knopf reicht
  nicht. Bei einer namenlosen Figur wird „löschen" bzw. „verwerfen" verlangt.
- **Ein Fehlschlag wird ehrlich gemeldet, nicht als Erfolg.** Verweigert die Datenbank (keine
  Verbindung, Regeln), ist die Figur lokal schon vergessen, in der Datenbank aber noch da. Die
  Seite sagt genau das, nennt den Grund und verweist auf einen erneuten Versuch oder die
  Spielleitung — und `geloescht` fällt zurück, damit danach wieder geschrieben werden darf.
- **Die Regie kann jetzt JEDE Figur löschen**, nicht mehr nur verwaiste. Das war eine Folge des
  eigenen Fehlertexts: Wenn er auf die Spielleitung verweist, muss sie es auch können.
  `zeichneAltfiguren()` ist zu `zeichneFiguren()` geworden und listet alle Figuren der Sitzung mit
  Name, Spieler und Datum; verwaiste stehen oben, tragen „zuordnen" und färben die Umrandung
  orange. Löschen fragt auch hier nach.
- **Getestet: 236 Prüfungen über drei Skripte, 0 Fehler** (40 neue). Dazu ein durchgespielter
  Ablauf mit echten Timern über vier Fälle:
  - **Ändern, dann sofort löschen:** Figur weg, lokaler Rückfall weg, und der geplante Upload hat
    sie **nicht** wieder angelegt (`REMOVE figuren/anna`, kein `UPLOAD`).
  - **Rückfrage abgelehnt:** nichts passiert.
  - **Name falsch abgetippt:** „Das stimmt nicht überein — es wurde nichts gelöscht."
  - **Datenbank verweigert:** Fehlschlag gemeldet, danach wieder schreibbar.
  - Dazu auf Funktionsebene: fremde Figuren bleiben unberührt, ohne Schlüssel wird nichts
    gelöscht, und ein Datenbankfehler wird durchgereicht statt verschluckt.
- **Eigener Fehler im Prüfaufbau, erst beim zweiten Blick gesehen:** Die Simulation meldete „lokaler
  Rückfall: STEHT NOCH". Ursache war nicht der Code, sondern dass `js/sitzung.js` als Modul auf das
  **globale** `localStorage` zugreift, nicht auf den Kontext der Seite — im Browser dasselbe
  Objekt, in der Simulation zwei. Nach dem Teilen des Speichers: „weg". Die Prüfung in
  `tests/t_figuren.js` war von Anfang an korrekt, weil sie `global.localStorage` setzt.


### 2026-10-11 (Fortsetzung 3) — Der Figurencode ist weg: Name + Sitzung IST der Schlüssel
- **Hendriks Vorgabe:** „Wir sollten irgendwie verhindern, dass man überhaupt mehr erstellen kann.
  Es reicht, wenn Charakter einfach auf Name und Session verbunden sind." Genau so gebaut — und
  damit ist der Vormittags-Umbau (Besitzer-Feld als Index) wieder abgelöst. **Der Unterschied ist
  grundsätzlich:** Vorher war „höchstens eine Figur" eine Regel, die der Code einhalten musste;
  jetzt ist es eine Eigenschaft des Pfades. Eine zweite Figur kann nicht entstehen, weil es
  dieselbe Stelle wäre.

      sitzungen/{sid}/stand/figuren/{spielerKennung(name)}

- **Welcher Name — das war die eine Stelle, an der es hätte scheitern können.** Das Feld
  „Spieler" im Assistenten ist **editierbar**. Hätte der Schlüssel daran gehangen, wäre ein
  Tippfehler genau die zweite Figur gewesen, die hier verhindert werden soll. Der Schlüssel kommt
  deshalb aus dem **Anmeldenamen** (`localStorage.korsaren_playername`, `js/identitaet.js`), und
  das Feld ist jetzt `readonly` — es zeigt den Anmeldenamen, mit dem Hinweis, dass er im Hub
  geändert wird. Es ist dieselbe normalisierte Form, unter der ein Spieler schon in
  `sitzungen/{sid}/spieler/{k}` steht.
- **Ohne Namen kein Schlüssel.** Assistent und Heldenbrief sperren jetzt mit dem Hinweis, sich
  einmal im Hub anzumelden — unter `''` zu schreiben wäre eine Figur, die allen gehört und
  niemandem. Die Sperre steht per Test nachweislich **vor** `initializeApp`.
- **Entfallen, bewusst vollständig** (Hendriks „nicht halb halb" vom September):
  - **Der Figurencode selbst.** Niemand muss sich mehr etwas aufschreiben: derselbe Name auf einem
    anderen Gerät öffnet dieselbe Figur. Die Karte am Ende des Assistenten zeigt jetzt
    „Name · Sitzung" statt `K7M-3QP`.
  - **„Figur laden" im Heldenbrief.** Es war der Weg, eine Figur per Code zu holen — und zugleich
    der Weg, eine **fremde** zu öffnen und zu ändern. Beides fällt weg. Will die Spielleitung eine
    Figur einsehen, tut sie das in `regie_figuren.html`, dort nur lesend.
  - **Das `besitzer`-Feld** vom Vormittag. Der Pfad sagt, wem die Figur gehört; ein zweites Feld
    daneben könnte ihm widersprechen.
  - **Sechs tote Funktionen** aus `js/sitzung.js` (`neuerFigurCode`, `figurCodeNormal`,
    `figurCodeGueltig`, `freienFigurCode`, `figurVonBesitzer`, `figurenDoppelt`).
- **Alte Figuren gehen nicht verloren.** Neue `figurUmzug()` in `js/sitzung.js`: Liegt unter dem
  Namen nichts, kennt der Browser aber noch einen Zufallscode, zieht die Figur beim ersten Öffnen
  um. **Erst schreiben, dann löschen** — bricht es dazwischen ab, steht sie zweimal da statt
  nirgends. Und **niemals über eine bestehende Figur am Namen**: die ist die gültige.
  - Liegt in `js/sitzung.js` und nicht in den Seiten, weil Assistent **und** Heldenbrief sie
    brauchen. Zwei Kopien dieser Reihenfolge würden auseinanderlaufen, und ein Fehler darin kostet
    eine Figur.
- **Die Regie räumt auf, was niemand mehr kennt.** `zeichneAltfiguren()` zeigt Figuren, die noch
  unter einem Zufallscode liegen (erkannt über `istAltSchluessel()`), mit Namen, Datum und zwei
  Knöpfen: **zuordnen** (Spieler aus der Sitzung wählen; schreibt erst, löscht dann, und weigert
  sich, wenn der Spieler schon eine Figur hat) oder **löschen** mit Rückfrage. Der Sitzungseintrag
  trägt bei Bedarf „· ohne Spieler". Automatisch wird nichts angefasst.
- **Zwei Fallen, die ich mir beim Bauen selbst gestellt und gefunden habe:**
  1. **Ein Wettlauf im Heldenbrief.** Ich hatte Umzug und Lesen gleichzeitig gestartet. Das Lesen
     konnte vor dem Umzug ankommen, der Bogen wäre leer geblieben — **und der nächste
     Schreibzugriff hätte ihn so gespeichert.** Jetzt steht das Lesen im Callback des Umzugs, und
     ein Test prüft genau diese Reihenfolge. Dazu eine Ladesperre (`ladeBereit`), damit vor dem
     ersten Lesen überhaupt nicht geschrieben wird — dieselbe Vorsichtsmaßnahme wie
     `startBereit` im Assistenten.
  2. **Zwei hängende Referenzen beim Entfernen des toten Codes:** `setzeFigurCode` rief die
     gelöschte `figurCodeNormal`, und der Export nannte `figurCodeGueltig`. **Die Syntaxprüfung sah
     beides nicht** — die Dateien waren ja heil. Im Browser hätte es zur Laufzeit geknallt.
- **`tests/t_syntax.js` prüft deshalb jetzt auch hängende Referenzen:** Es lädt die vier
  Node-fähigen Module per `require()` (das führt den Export-Block aus, ein unbekannter Name wirft
  sofort) und verlangt, dass kein Export `undefined` ist. **Mit einem absichtlich eingebauten
  Fehler gegengeprüft** — die Prüfung meldet ihn.
- **Getestet: 196 Prüfungen über drei Skripte, 0 Fehler.** Der tragende Nachweis ist ein
  durchgespielter Ablauf über **drei Geräte mit demselben Anmeldenamen** (Laptop baut, Handy leer,
  Tablet mit „  ANNA  " anders geschrieben) plus einen zweiten Spieler:

      Laptop: anna          (Kämpfen=3)
      Handy:  anna          geladen="Mara Quint" Kämpfen=3
      Tablet: anna          geladen="Mara Quint"
      Bert:   anna,bert

  Also **eine** Figur für Anna, unversehrt, und Bert hat seine eigene. Dazu der Umzug in vier
  Varianten: er zieht um und vermerkt die Herkunft, er schreibt **erst** und löscht **dann**, er
  fasst eine bestehende Figur am Namen **nicht** an (und schreibt dabei gar nichts), und ein Code,
  der auf nichts zeigt, räumt sich auf.


### 2026-10-11 (Fortsetzung 2) — Höchstens eine Figur je Spieler und Sitzung
- **Anlass war Hendriks Frage** „Wie sind die Charaktere erstellt? Jeder Spieler in jeder Session
  kann maximal einen Charakter haben oder eben keinen" — gedacht war es so, **erzwungen war es
  nicht.** Der Schlüssel einer Figur ist ihr Code (`figuren/{code}`), die Verbindung „dieser
  Mensch → diese Figur" lag allein in `localStorage.pnp_figur_{sid}`. Auf einem zweiten Gerät war
  sie weg: `mitCode()` fand keinen Code, erzeugte einen neuen — **dieselbe Person hatte zwei
  Figuren in derselben Sitzung**, beide mit ihrem Namen. Der Regie-Hub meldete dann „2 Figur(en)"
  bei einem Spieler. Dasselbe nach gelöschten Browserdaten oder in einem privaten Fenster.
- **Die Figur trägt jetzt ihren Besitzer** (`figuren/{code}.besitzer = spielerKennung(name)`).
  `mitCode()` sucht ihn, bevor es einen neuen Code erzeugt — ein zweites Gerät findet die
  bestehende Figur also wieder, **ohne dass der Spieler seinen Code kennen muss**.
  - **Der Name ist der Schlüssel**, weil er über Geräte stabil ist; `pnp_player_id` wäre dafür
    untauglich, die entsteht je Browser neu. Es ist dieselbe normalisierte Form, unter der ein
    Spieler schon in `sitzungen/{sid}/spieler/{k}` steht.
  - **Bewusst am Figurenknoten und NICHT als eigener Pfad `figurVon/{kennung}`:** Ein neuer
    Top-Level-Pfad müsste in `SITZUNGS_PFADE` **und** in `firebase-rules.json` stehen, und die
    Regeln müssen von Hand in der Konsole veröffentlicht werden — bis dahin schlägt jeder
    Schreibzugriff **still** fehl. So kommt die Regel ohne Regeländerung aus.
- **Der eigentliche Fallstrick war nicht das Finden, sondern was danach geschieht.** Findet der
  Assistent auf dem Handy die Figur vom Laptop, ist der lokale Stand aber leer — und der erste
  Schreibzugriff hätte **aus der fertigen Figur eine leere gemacht.** Genau dieselbe Falle wie
  beim `set()`/`update()`-Fehler im September, nur eine Ebene höher.
  - Neue `startUebernahme()` läuft einmal **vor** dem ersten Schreibzugriff: Code klären,
    gefundene Figur **laden**, erst dann schreiben. `nachFirebase()` steigt aus, solange
    `startBereit` nicht steht; per Test ist belegt, dass die Sperre **vor** dem Schreibzugriff
    liegt und `initFirebase()` nicht mehr direkt `nachFirebase()` ruft.
  - Eine Frist von 8 s verhindert, dass die Seite stumm bleibt, wenn die Datenbank hängt.
  - **Der Spieler erfährt davon:** Ein Hinweis oben sagt, dass schon eine Figur existiert, dass
    sie geladen ist und dass es je Sitzung nur eine gibt. Stillschweigend etwas Fertiges
    vorzusetzen, nachdem jemand „Figur erschaffen" geklickt hat, wäre unheimlich.
  - `angelegt` wird **nur beim Anlegen** gesetzt — sonst verschöbe sich der Stichtag, nach dem im
    Zweifel entschieden wird, welche Figur „die" ist.
- **Die Regie sieht, was schon entstanden ist.** `figurenDoppelt()` gruppiert nach Besitzer; der
  Sitzungseintrag zeigt bei Mehrfachvergabe eine orange Warnung mit beiden Codes, Namen und
  Datum, markiert die **älteste als „(gilt)"** (genau die lädt der Assistent) und bietet je Figur
  einen Löschknopf mit Rückfrage. **Automatisch wird nichts gelöscht** — per Test abgesichert,
  dass der Löschpfad genau einmal vorkommt, im Körper von `figurWeg()` liegt und hinter der
  Rückfrage steht.
- **Der Heldenbrief bleibt der bewusste Ausweg:** „Figur laden" per Code ist weiter möglich und
  **fasst den Besitzer nicht an**. Der Index bindet den Assistenten, nicht den Bogen — so kann die
  Spielleitung jemandem gezielt eine andere Figur geben.
- **Getestet: 176 Prüfungen über drei Skripte, 0 Fehler** (neues `tests/t_figuren.js` mit 51).
  Darunter zwei durchgespielte Abläufe mit gefälschter Datenbank:
  - **Zweites Gerät:** Anna hat `K7M3QP` („Mara Quint", Kämpfen d8), das Handy ist leer. Ergebnis:
    **keine zweite Figur**, die bestehende **unversehrt**, und der Assistent zeigt sie an. Der
    einzige Schreibzugriff ging auf `K7M3QP` mit dem richtigen Inhalt.
  - **Neuer Spieler:** genau eine Figur, Besitzer gesetzt, `angelegt` gesetzt, Code sechsstellig.
  - Dazu: bei zwei Figuren gewinnt **immer** die ältere (ohne Zeitstempel entscheidet der Code,
    nicht die Laune), Figuren **ohne** Besitzer gelten nicht als doppelt (sie sind nur alt, kein
    Problem), und Figuren- wie Spielernamen werden in der Warnung maskiert.
- **[OFFEN] Bestehende Figuren tragen noch keinen Besitzer.** Sie bekommen ihn beim nächsten
  Speichern durch ihren Spieler. Bis dahin greift für sie die alte Logik (Code aus dem Browser),
  und sie erscheinen nicht in der Doppelt-Warnung. Bewusst keine Migration über alle Sitzungen:
  Der Besitzer wird aus einem **Namen** abgeleitet, und ob „Anna" in Sitzung A dieselbe Person wie
  „anna" in Sitzung B ist, kann nur Hendrik entscheiden.


### 2026-10-11 (Fortsetzung) — Kalender blättert unbegrenzt weiter
- **Hendriks Vorgabe:** Der Kalender soll sich erweitern lassen — Schaltflächen, um in
  Zwei-Wochen-Schritten weiterzugehen, **unbegrenzt**.
- **Der eigentliche Fehler lag nicht in der Anzeige, sondern in der Suche.** `besteFenster()` lief
  über `tagListe(cfg)`, also über die ersten `cfg.tage` Tage ab heute. Hätte ich nur Knöpfe
  gebaut, wäre genau das entstanden: Ein Spieler blättert vier Wochen vor, trägt dort ein, es
  **wird gespeichert — und nie gefunden.** Still, ohne Fehlermeldung, und am Tisch erst dann
  bemerkt, wenn jemand sagt „ich hatte doch eingetragen".
- **Neue `datenTage()` in `js/termine.js`:** Gesucht wird jetzt über die Tage, zu denen
  **tatsächlich etwas eingetragen ist** (vergangene weg, sortiert, ohne Dubletten) statt über
  einen festen Horizont. Damit ist die Suche von sich aus unbegrenzt und kostet nichts, wenn
  niemand weit vorausgeplant hat. `cfg.tage` ist dadurch die **Seitengröße**, nicht mehr der
  Horizont.
  - `spielerPlan()` läuft ebenfalls darüber — sonst stünde in der Regie nicht, was ein Spieler
    weiter vorn eingetragen hat.
- **Blättern im Spieler-Hub** (`blaettern()`, `blaetternHeute()`, `setzePager()`): „‹ 2 Wochen",
  die angezeigte Spanne, „2 Wochen ›" und ein „heute"-Knopf, der nur erscheint, wenn man nicht
  auf der ersten Seite steht.
  - **Nach vorn unbegrenzt, nach hinten bei heute abgeriegelt** (`Math.max(0, …)`). Ein Raster in
    der Vergangenheit könnte man bemalen, es würde gespeichert und wäre für jede Terminsuche
    wertlos.
  - **Der Versatz ist reine Ansichtssache dieses Browsers** und liegt bewusst **nicht** in `cfg`:
    `cfg` gilt für alle und wird von der Spielleitung gesetzt. Blättert ein Spieler, sieht kein
    anderer etwas davon.
  - Die Suche benutzt den Versatz **nicht** — per Test abgesichert, denn ihn dort einzubauen wäre
    genau der Rückfall in den begrenzten Horizont.
- **Getestet: 125 Prüfungen über zwei Skripte, 0 Fehler** (22 neue). Darunter: ein Eintrag 30 Tage
  vorn wird gefunden, einer **400 Tage** vorn auch, der Horizont hängt nachweislich nicht an
  `cfg.tage` (`tage: 1` findet den Eintrag trotzdem), gestern ergibt kein Fenster, Seiten
  überschneiden sich nicht, ein negativer Versatz wird auf heute geklemmt, und ein Tag ohne eine
  einzige `1` zählt nicht als Datentag.
  - **Die Gleichheit mit der alten Fassung bleibt bewiesen:** derselbe Vergleich über 90
    Zufallsfälle läuft weiter mit 0 Abweichungen — der Umbau erweitert den Horizont, er ändert
    innerhalb von 14 Tagen nichts.
- **Beschriftung über den Jahreswechsel gegengeprüft** (Versatz 70 ergibt „20.12.–02.01."), weil
  die Spanne aus zwei Datumsangaben ohne Jahr gebaut wird.


### 2026-10-11 — Die Spielleitung sieht die Zeiten je Spielrunde
- **Hendriks Vorgabe:** Termine gelten pro Spielrunde — zwei Runden haben getrennte Termine —, und
  **in der Regie** muss je Spielrunde sichtbar sein, was die Spieler eingetragen haben, damit sich
  von dort ein Termin veröffentlichen lässt. Vorher ging das nicht: `termine` kam im ganzen Repo
  **ausschließlich** in `index.html` vor. Die SL musste den Spieler-Hub öffnen und sah dort nur
  den Kalender *ihrer eigenen* festgelegten Sitzung.
- **Neue `js/termine.js` als gemeinsamer Kern** (ohne DOM, ohne Firebase, ohne globalen Zustand).
  **Das ist der eigentliche Punkt dieser Änderung, nicht die Ansicht.** Hätte der Regie-Hub die
  Fenstersuche nachgebaut, wäre genau das passiert, was bei `spielerKennung()` schon passiert ist:
  zwei Fassungen laufen auseinander. Die Folge wäre hier aber schlimmer als eine doppelte Zeile in
  einer Liste — **die SL hätte einen Termin veröffentlicht, den der Hub der Spieler gar nicht für
  den besten hält.** Jetzt gibt es die Rechnung genau einmal.
- **`index.html` rechnet nicht mehr selbst**, sondern hält nur noch **dünne Hüllen** auf den Kern —
  dasselbe Vorgehen wie bei der Sitzungs-Hülle, die 84 `db.ref()`-Aufrufe unberührt gelassen hat.
  Alle **20 Aufrufstellen der Seite bleiben wörtlich**, geändert wurden die Definitionen.
- **Regie-Hub: Terminansicht je Sitzung** (`zeichneTermine()`), aufklappbar an jedem
  Sitzungseintrag. Sie zeigt drei Dinge:
  - die **besten Fenster** mit Namen derer, die können, durchgestrichenen Namen derer, die nicht
    können, Zähler `3/4` — und je Fenster einen Knopf **„veröffentlichen"**;
  - die Zeiten **im Klartext je Spieler** („Anna · Di. 13.10. 18:00–24:00 · Fr. 16.10. 16:00–24:00").
    Das hat der Spieler-Hub überhaupt nicht — dort sind die Zeiten nur eine Dichtekarte, gut zum
    Finden eines Fensters, unbrauchbar zum Vorlesen;
  - wer **nichts eingetragen** hat, ausdrücklich benannt. Ohne diese Zeile sieht die SL einen
    Zähler `3/4` und weiß nicht, ob jemand abgesagt oder nur geschwiegen hat.
- **Festlegen ist jetzt allein Sache der Regie** (Hendriks Korrektur: „Nicht der Spieler kann
  einen Tag festlegen, sondern die Regie"). Das war vorher nicht nur unsauber verteilt, sondern
  ein echtes Loch: **jeder Spieler konnte den Termin der ganzen Gruppe setzen und wieder
  umwerfen** — der „festlegen"-Knopf stand an jedem Fenster, `waehle()` schrieb direkt nach
  `termine/gewaehlt`, und die einzige Spur war ein „von <Name>" daneben.
  - `waehle()` und der Knopf sind **ersatzlos entfernt**. Der Spieler-Hub **liest** den Termin
    weiter und zeigt ihn an; das von der SL gewählte Fenster ist in der Liste mit „✓ gesetzt"
    markiert, und wo vorher „noch nicht festgelegt" stand, steht jetzt „legt die Spielleitung
    fest". Ohne diesen Hinweis wäre das Verschwinden des Knopfs als Fehler lesbar.
  - Damit schreibt der Spieler-Hub nur noch, **was ihm gehört**: seinen Namen
    (`termine/spieler/{pid}`) und seine eigenen Zeiten (`termine/verfuegbar/{pid}`).
  - Per Test abgesichert, nicht nur per Augenschein: kein schreibender Zugriff auf
    `termine/gewaehlt`, keine Funktion und kein Handler `waehle` mehr, der Lesezugriff aber
    nachweislich erhalten.
- **Geschrieben wird genau dorthin, wo der Spieler-Hub liest** (`sitzungen/{sid}/stand/termine/
  gewaehlt`) — „Nächste Sitzung" erscheint damit sofort bei allen, ohne dass jemand neu lädt.
  **Keine Regeländerung nötig:** `sitzungen` ist bereits voll beschreibbar, es kommt kein neuer
  Top-Level-Pfad dazu. Auch kein neuer Lauscher — `db.ref('sitzungen')` lädt den Teilbaum samt
  `stand.termine` ohnehin schon.
- **Aufklappen liegt bewusst nur im Speicher** (`termineOffen`), nicht in der Datenbank: Das ist
  eine Ansichtssache dieses Browsers.
- **Getestet: 103 Prüfungen über zwei Skripte, 0 Fehler.** Die tragende Prüfung ist der
  **Regressionsbeweis für den Umbau**: Die alte Rechnung wurde aus dem Backup von `index.html`
  und die neue aus der umgebauten Seite **im Quelltext geschnitten** (nicht nachgebaut) und auf
  **90 Zufallsfällen** über fünf Konfigurationen verglichen — `besteFenster`, `fensterText`,
  `holeTag`, `slotZeit`, `langDatum` **alle identisch, 0 Abweichungen**. Dazu: Regie und
  Spieler-Hub finden in 40 weiteren Fällen dieselben Fenster, die Ansicht wird wirklich
  ausgeführt (zugeklappt nennt sie keine Namen, aufgeklappt stimmt der Zähler), Spielernamen
  werden maskiert, und kaputte oder fehlende Daten brechen sie nicht.
- **Die Testskripte liegen jetzt im Repo** (`tests/`). **Sie waren vorher nie eingecheckt** —
  der Changelog nennt für September zehn Skripte mit 462 Prüfungen, `git log --diff-filter=A`
  zeigt aber keines davon, und das Scratchpad ist seither geleert worden. Damit war unter anderem
  `t_syntax.js` weg, also genau die Prüfung, die nach dem `karte.html`-Vorfall gebaut wurde, weil
  `node --check` für dieses Repo nicht reicht (blind für top-level `return`). `tests/t_syntax.js`
  ist neu geschrieben und **bricht jetzt ab, wenn sie nichts findet** — eine Prüfung, die bei
  leerer Eingabe „OK" sagt, war der zweite Teil jenes Fehlers.
- **Dreimal in dieselbe dokumentierte Falle getappt** und erst beim dritten Mal den im Projekt
  vermerkten Weg genommen: Bash-Heredocs verschlucken hier Backslashes, ein `\\s` im Python-Text
  wird zu `\s` und das Suchmuster findet stillschweigend nichts. Jetzt ohne Regex gelöst
  (`indexOf`). Dazu erneut die TDZ-Falle: Der Versuch, `index.html` komplett im `vm` auszuführen,
  scheitert, **bevor** `let cfg` initialisiert ist — jede Zuweisung von außen ist dann ein
  TDZ-Fehler. Deshalb werden im Test nur die gebrauchten Funktionen geschnitten.
- **Auch die Kalender-Einstellung gehört jetzt der Regie** (Hendriks Regel: „Man sollte nur seine
  eigenen Zeiten ändern können"). `cfgAendern()` ließ vorher **jeden Spieler** den angezeigten
  Zeitraum und die **Fensterdauer für die ganze Sitzung** umstellen. Das ist keine eigene Zeit —
  es ist das Raster, in das alle eintragen.
  - **Das war nicht kosmetisch, sondern wirkte direkt auf die Spielleitung.** Nachgemessen an
    denselben drei Spielern: bei 2 h schlägt die Rechnung „Di. 19:00–21:00 (3/3)" vor, bei 3,5 h
    „Di. 19:00–22:30 (3/3)", bei 5 h „Di. 18:00–23:00 (**2/3**)". Ein Spieler am Auswahlfeld
    hätte also bestimmt, welche Fenster die SL überhaupt zum Veröffentlichen vorgelegt bekommt —
    und ob jemand darin fehlt.
  - Im Spieler-Hub ist die Einstellung **nur noch Anzeige** („16:00–24:00 · Sitzung 3,5 h"),
    im Regie-Hub eine eigene Zeile **Raster** je Sitzung (ab/bis/Sitzungsdauer), die nach
    `sitzungen/{sid}/stand/termine/config` schreibt. Ein Zeitraum, dessen Ende vor dem Anfang
    liegt, wird abgelehnt statt gespeichert — er würde das Raster unbrauchbar machen.
- **Damit gilt die Regel im Spieler-Hub lückenlos:** Die Prüfung erhebt **jeden** schreibenden
  Zugriff auf `termine/...` aus dem Quelltext und verlangt, dass er unter `meinePid` liegt —
  als generelle Regel, nicht als Liste bekannter Stellen. Übrig sind genau zwei: der eigene Name
  und die eigenen Zeiten. Gegengeprüft wurde außerdem, dass `schreibeTag()` fest auf `meinePid`
  verdrahtet ist, ein Spieler also auch beim Malen nicht an fremde Zeiten kommt.
- **[OFFEN] Terminfindung vor dem Beitritt.** Seit dem Beitritt per Sitzungs-ID (07.09.) kommt ein
  Spieler erst **nach** dem Beitritt an den Kalender. Für eine Runde, die noch keine Sitzung hat,
  geht Terminfindung also nicht — die Sitzung muss zuerst angelegt und die ID verteilt werden.
  Das war beim Bau des Kalenders (05.09.) noch nicht so; der Beitrittszwang kam später dazu.
  Bewusst nicht eigenmächtig geändert: Ein Kalender außerhalb jeder Sitzung wäre eine
  Struktur-Entscheidung, nicht eine Anzeigefrage.
- **[OFFEN] Die übrigen Testskripte fehlen weiter.** Regelwerk, Heldenbrief, Assistent,
  SL-Übersicht, Sitzung und Senden sind weiterhin nur als Prüfungen im Changelog beschrieben,
  nicht als Code. Beim Prüflauf am 15.09. habe ich Regelkern (49), Umgebung (69) und Pfade (15)
  neu geschrieben und mit 0 Fehlern laufen lassen — auch diese Skripte lagen im Scratchpad und
  sind weg. Wiederherstellen lohnt, ist aber ein eigener Schritt.

### 2026-09-07 (Fortsetzung 10) — Figuren hingen doch nicht ganz an der Sitzung
- **Anlass war Hendriks Frage:** „Die Charaktere sind jetzt auch in die Sitzung gebunden oder?"
  Firebase-seitig ja — `sitzungen/{sid}/stand/figuren/{code}`, und der Figurencode liegt unter
  `pnp_figur_{sid}`. **Der lokale Rückfall aber nicht:** `kors_figur` war ein fester Schlüssel
  für alle Sitzungen.
- **Das war keine Schönheitsfrage, sondern ein Datenleck zwischen Sitzungen.** Der Ablauf:
  Ein Spieler baut in Sitzung A eine Figur. Er wechselt nach B. `ausLokal()` lädt A's Figur aus
  dem festen Schlüssel. Firebase findet unter B's Code noch nichts, überschreibt also nichts —
  **A's Figur bleibt stehen, als wäre sie B's.** Der nächste Klick löst `speichern()` aus, und
  damit landet A's Figur unter B's Code in der fremden Sitzung.
- **Behoben:** `figurCacheKey(sid)` in `js/sitzung.js`, benutzt von Assistent und Heldenbrief.
  Damit hängen jetzt **alle drei** Teile an der Sitzung — Firebase-Pfad, Figurencode und lokaler
  Rückfall.
- **Einmalige Übernahme** (`figurCacheUebernehmen`): Wer gerade offline an einer Figur baut,
  soll sie nicht verlieren, nur weil der Schlüssel wandert. Der alte Stand zieht beim ersten
  Öffnen in die aktuelle Sitzung um; ein zweiter Lauf tut nichts, und **keine andere Sitzung
  erbt etwas**.
- **Getestet: 9 neue Prüfungen, 0 Fehler** (462 über zehn Skripte). Darunter, dass keine Seite
  den festen Schlüssel mehr benutzt, und der komplette Umzug samt Wiederholungslauf.

### 2026-09-07 (Fortsetzung 9) — Fehler: Spielerkarte verband nicht mehr
- **Hendriks Meldung:** „Die Session läuft aber die Spielerkarte verbindet nicht."
- **Ursache, mein Fehler:** Die Sitzungssperre, die ich am selben Tag in `karte.html` eingebaut
  hatte, bricht mit `return` ab. Der Hauptskriptblock dieser Datei ist aber **kein IIFE**, sondern
  Code auf oberster Ebene — und dort ist `return` im Browser ein **Syntaxfehler**. Nicht die
  Sperre schlug fehl: **die gesamte Datei wurde nicht ausgeführt.** Deshalb kam nicht einmal eine
  Fehlermeldung, die Karte hing schlicht auf „verbinde".
- **Behoben:** Der Verbindungsaufbau ist jetzt in `(function verbinde() { … })()` gekapselt.
  `let db` bleibt bewusst außerhalb — es wird weiter unten noch gebraucht.
- **Der eigentliche Skandal war meine Prüfung.** Sie hätte das finden müssen und konnte es aus
  zwei Gründen prinzipiell nicht:
  1. **`node --check` prüft als CommonJS-Modul**, und das ist in eine Funktion gewickelt. Ein
     `return` auf oberster Ebene ist dort **erlaubt**. Diese Fehlerklasse ist damit für
     `node --check` grundsätzlich unsichtbar.
  2. Mein `awk`-Muster `/^<script>$/` traf den **eingerückten** Tag `  <script>` von `karte.html`
     nicht und extrahierte **null Zeilen**. Die Prüfung lief also über eine leere Datei und
     meldete zuverlässig „OK" — bei jedem einzelnen Lauf der letzten Tage.
- **Neues Testskript `t_syntax.js`**, das prüft, wie der Browser parst: `new vm.Script(...)` über
  **jeden** Inline-Block jeder HTML-Seite (11 Blöcke) und **jede** `.js`-Datei (23) — als Skript,
  nicht als Modul, denn genau so lädt eine Seite sie per `<script src=…>`. Eine Selbstprobe
  stellt sicher, dass die Prüfung ein top-level `return` auch wirklich meldet.
- **Getestet: 38 Prüfungen im neuen Skript, 0 Fehler** (453 über zehn Skripte).
- **Merke fürs Projekt:** `node --check` reicht für dieses Repo **nicht**. Es ist blind für
  top-level `return`, und jedes Extraktionsmuster, das nichts findet, meldet stillschweigend
  Erfolg. Ein Test, der bei leerer Eingabe „OK" sagt, ist schlimmer als keiner.

### 2026-09-07 (Fortsetzung 8) — Fehler: gelöschte Sitzung kam bei jedem Refresh zurück
- **Hendriks Meldung:** „Es öffnet sich jetzt jedes Mal, wenn ich den Spielerhub refreshe, eine
  Testsitzung."
- **Ursache, und sie ist lehrreich:** **Firebase legt fehlende Knoten beim Schreiben einfach an.**
  Der Spieler-Hub schreibt bei *jedem* Laden — `anmeldenBeiDb()` in Zeile 346 und die
  Termin-Lauscher. Zeigte der Browser also auf eine Sitzung, die es nicht (mehr) gibt, **legte er
  sie bei jedem Neuladen wieder an.** Eine in der Verwaltung gelöschte Sitzung stand Sekunden
  später wieder in der Liste — ohne `meta`, als Rest.
  - Niemand prüfte, ob die beigetretene Sitzung überhaupt existiert. Der Beitritt tat es, das
    spätere Laden nicht.
- **Behoben: erst prüfen, dann schreiben.** `initFirebase()` liest jetzt zuerst
  `sitzungen/{id}/meta`. Fehlt es, wird die Festlegung gelöst und der Spieler landet mit einer
  klaren Meldung wieder beim Beitritt („Die Sitzung … gibt es nicht mehr"). **Kein Schreibzugriff
  und kein Lauscher vorher** — alles Weitere liegt in der neuen `sitzungStarten()`.
  - **Bei einem Prüf-Fehler wird bewusst NICHT weitergemacht**, sondern offline gemeldet. Blind
    weiterzuschreiben würde die Sitzung genau wieder anlegen.
  - Ein zweiter Lauscher fängt den Fall, dass die Sitzung **während** des Spielens gelöscht wird.
- **Die Spielleitung sieht solche Reste jetzt**: Ein Sitzungsknoten ohne `angelegt` bekommt im
  Regie-Hub das Abzeichen **„Rest"** und den Hinweis „Kann weg." — die schon entstandenen lassen
  sich damit aufräumen.
- **Getestet: 9 neue Prüfungen, 0 Fehler** (415 über neun Skripte). Darunter der Nachweis über
  die Position im Quelltext, dass die Prüfung **vor** dem ersten Schreibzugriff steht, und dass
  `anmeldenBeiDb()` in `sitzungStarten()` gewandert ist statt in `initFirebase()` zu bleiben.

### 2026-09-07 (Fortsetzung 7) — Beitritt per Sitzungs-ID, Karte erst nach dem Start
- **Hendriks Vorgabe:** Ein Spieler ist nicht mehr automatisch dabei, nur weil er die Adresse
  kennt. Er trägt eine **Sitzungs-ID** ein, die die Spielleitung ihm schickt. Und: *„Erst wenn
  sie Teil einer Sitzung sind, können sie auch erst einen Charakter erstellen, da wir sonst ja
  noch gar nicht wissen um welches Spiel es geht."* Genau so gebaut — die Begründung ist der
  Grund, nicht die Ordnung: Regeln und Inhalt hängen am Spiel, nicht am Browser.
- **Der Spieler-Hub hat jetzt DREI Zustände** statt zwei:
  1. kein Name → Anmeldung
  2. **keine Sitzung → „Noch kein Spiel offen", Sitzungs-ID eintragen**
  3. Sitzung da → Hub
- **Zwei Stufen, bewusst getrennt** (`js/sitzung.js`):
  - **Beigetreten** — der Spieler gehört zur Sitzung, kann eine Figur bauen und führen.
  - **Freigegeben** — die Spielleitung hat gestartet (`aktiveSitzung` zeigt darauf). **Erst
    jetzt öffnet die Karte.** Vorher gäbe es dort nichts zu sehen, und die Szene stünde auf dem
    Stand einer fremden Runde.
  - Die Kachel im Hub und die Karte selbst **gehen von selbst auf**, sobald gestartet wird — der
    Lauscher bleibt hängen, niemand muss neu laden.
- **`sitzungBeitreten()` prüft gegen die Datenbank.** Ein Tippfehler soll nicht in einer Sitzung
  enden, die es gar nicht gibt. Nimmt die reine ID, Groß-/Kleinschreibung, Leerraum — und einen
  **ganzen Link**, den man einfach hineinkopiert.
- **Sperren auf drei Seiten** (`karte.html`, `charaktererstellung.html`, `heldenbrief.html`),
  jede **vor** `initializeApp` und alle mit demselben Hinweis (`sitzungsSperre()` in
  `js/sitzung.js`, einmal geschrieben statt dreimal). **Die Vorschau der Spielleitung
  (`karte.html?preview=1`) ist ausgenommen** — sie schaut in ihre eigene Sitzung, auch wenn die
  noch nicht läuft.
- **Die Sitzungs-ID steht jetzt an jedem Eintrag im Regie-Hub** und lässt sich anklicken zum
  Kopieren. Ohne sie kommt niemand in die Sitzung, und sie stand vorher nirgends.
- **Getestet: 39 neue Prüfungen, 0 Fehler** (406 über neun Skripte). Darunter: ein Tippfehler
  wird abgelehnt **und nicht gemerkt**, eine *andere* laufende Sitzung gibt nicht frei, die
  Sperren stehen nachweislich **vor** `initializeApp`, und der Freigabe-Lauscher bleibt hängen.
  - **Drei Bestandstests brachen**, alle mit veralteten Erwartungen statt echten Fehlern: Die
    beiden Figurenseiten steigen jetzt korrekt früh aus, wenn keine Sitzung gesetzt ist (die
    Tests setzen jetzt eine). Und `index.html` braucht bewusst **beides** — die Hülle für den
    Spielstand, die nackte Datenbank für Beitritt und Zeiger, die außerhalb jeder Sitzung liegen.
    Dafür prüft der Test jetzt zusätzlich, dass über die nackte Datenbank **kein** Spielstand
    geschrieben wird.
- **Entschieden (Hendrik): Das ist so in Ordnung.** Die Sitzungs-ID ist kein Geheimnis — wer sie
  errät, kommt hinein. Für eine Runde eingeladener Freunde reicht das; dasselbe Schutzniveau wie
  bei den SL-Seiten, die allein durch ihre unbekannte Adresse geschützt sind. Kein offener Punkt.
  Eine echte Hürde (Sitzungspasswort beim Beitritt) bliebe möglich, sobald die anonyme Anmeldung
  steht — sie ist dann eine Erweiterung, kein Nachholen.

### 2026-09-07 (Fortsetzung 6) — Regie-Hub: erst die Sitzung, dann hinein
- **Nachtrag: `spielerKennung()` entdoppelt.** Die Umwandlung eines Namens in einen
  Firebase-Schlüssel stand zweimal da — einmal in der Verwaltung (vorgemerkter Name), einmal im
  Spieler-Hub (Selbstanmeldung). Heute identisch, aber genau so laufen zwei Fassungen
  auseinander: Driftet eine, erzeugt derselbe Mensch zwei Schlüssel und steht doppelt in der
  Liste — einmal vorgemerkt, einmal anwesend, ohne dass jemand sieht, dass es dieselbe Person
  ist. Liegt jetzt in `js/sitzung.js`, beide Seiten rufen sie auf. 12 Prüfungen sichern das ab.
- **Hendriks Einwand: „Irgendwie stimmt der Aufbau noch nicht."** Zu Recht — er war verkehrt
  herum. Man landete in `regie.html`, einer **Szenenansicht**, und verwaltete Sitzungen in einem
  Unterpunkt davon. Richtig ist die Reihenfolge des Spieler-Hubs: erst wählen, dann hinein.
- **`regie_sitzungen.html` → `regie_hub.html`**, zum Einstieg der Spielleitung ausgebaut:
  Werkzeuge (Regie, Figuren, Schlachtfeld, Graph-Editor, Besatzung, Codex, Spieleransicht) ·
  Spiele · Sitzungen mit Spielern · der alte Wurzel-Spielstand. **Ein Klick auf eine Sitzung
  führt direkt in ihre Regie** (`regie.html?sitzung=…`).
- **Die tragende Unterscheidung, die vorher fehlte:**
  - **Öffnen** (Klick auf die Sitzung) — nur *dieser* Browser schaut hinein. Schreibt **nichts**
    in die Datenbank, die Spieler merken nichts.
  - **Für Spieler starten** — der Zeiger `aktiveSitzung` wandert, alle Spieler wechseln mit, und
    die Spielleitung geht gleich mit hinein.
  Ohne diese Trennung hätte ein Blick in eine ruhende Runde die ganze Gruppe mitgezogen — und
  das wäre erst aufgefallen, wenn die Spieler nichts mehr sehen.
- **Dafür neu in `js/sitzung.js`:** `pnp_sitzung_fest` als **bewusste Wahl dieses Browsers**, die
  den globalen Zeiger schlägt und ihm nicht mehr folgt. Dazu `?sitzung=…` in der Adresse — so
  kommt man aus dem Hub in die richtige Ansicht, und später ein eingeladener Spieler per
  Beitrittslink.
- **`regie.html` zeigt jetzt ihre Sitzung** in der Kopfleiste und **warnt in Orange, wenn diese
  nicht die laufende ist.** Ohne das wäre von außen nicht zu unterscheiden, ob man in der aktiven
  Runde sitzt oder in einer alten — ein Szenenwechsel in der falschen Sitzung fällt sonst erst
  auf, wenn die Spieler nichts sehen.
- **Getestet: 45 neue Prüfungen, 0 Fehler** (354 über acht Skripte). Darunter: Öffnen schreibt
  nachweislich nichts, eine Festlegung beobachtet den Zeiger **nicht** mehr (die SL wird nicht
  herausgerissen), ohne Festlegung lädt ein Zeigerwechsel weiterhin neu, die Knöpfe im
  Sitzungseintrag schlucken den Klick, und der Spieler-Hub nennt weiterhin keine SL-Seite.
  - **Wieder die Heredoc-Falle, zweimal** — Backslashes in einem Python-Skript per Bash-Heredoc
    zerlegten die Suchmuster. Beim zweiten Mal endlich den dokumentierten Weg genommen: Skript
    mit dem Write-Werkzeug schreiben und Backslashes über `chr(92)` bauen. Die Datei blieb beide
    Male unversehrt, weil der Schreibvorgang am Ende steht.

### 2026-09-07 (Fortsetzung 5) — Die Figur bekommt eine eigene Adresse
- **Hendriks Vorschlag:** „Man könnte den Charakter mit einer ID versehen, die man einfach laden
  kann." Damit fällt der Haken weg, den ich zuvor nennen musste: Ohne Konten galt **ein Browser =
  ein Spieler**. Wer am Laptop baute und am Handy öffnete, stand vor einem leeren Bogen.
- **Der Code IST der Pfad der Figur:** `sitzungen/{sid}/stand/figuren/{code}`. Vorher stand dort
  `pnp_player_id`, eine Kennung, die im localStorage entsteht und den Browser nie verlässt.
- **Sechs Zeichen im Crockford-Base32-Alphabet** (ohne I, L, O, U), angezeigt als `K7M-3QP`.
  Der Code wird am Tisch vorgelesen und abgetippt — deshalb liegt das Gewicht auf dem, was
  Menschen falsch machen: Klein-/Großschreibung, Bindestriche, Leerzeichen und vor allem die
  vier klassischen Verwechslungen werden beim Eintippen **eindeutig zurückgeführt** (I und L → 1,
  O und U → 0). 32^6 ≈ 1,07 Milliarden Möglichkeiten, dazu ein Kollisionstest gegen die Datenbank.
- **Je Sitzung ein eigener Code** (`pnp_figur_{sid}`) — dieselbe Person spielt in zwei Runden
  zwei Figuren, und die Sitzung steckt ohnehin schon im Pfad.
- **Wo er auftaucht:** Der Assistent zeigt ihn am Ende groß mit der Bitte, ihn aufzuschreiben.
  Der Heldenbrief trägt ihn in der Kopfleiste und hat einen Knopf **„Figur laden"**. Die
  SL-Übersicht zeigt ihn je Figur, damit die Spielleitung ihn vorlesen kann, wenn ihn jemand
  verlegt hat.
- **Der Code ist ausdrücklich KEIN Passwort.** Wer ihn hat, kann die Figur öffnen und ändern. In
  einer Runde eingeladener Freunde ist das richtig — am Tisch sagt man ihn sich ohnehin laut.
- **Alte Figuren gehen nicht verloren:** Liegt für die Sitzung kein Code vor, aber unter der alten
  Spielerkennung eine Figur, gilt diese Kennung weiter als Code.
- **Getestet: 36 neue Prüfungen, 0 Fehler** (309 über sieben Skripte insgesamt). Darunter alle
  vier Verwechslungen, 20.000 erzeugte Codes ohne Dublette, und dass ein Code Anzeige und
  Rückgabe unverändert übersteht.
  - **Drei eigene Fehler beim Bauen, alle vom Prüfen gefunden:** (1) Ich verwies in der
    SL-Übersicht auf `id`, während die Schleife `pid` heißt — das hätte zur Laufzeit die ganze
    Übersicht lahmgelegt. (2) und (3) **zweimal die dokumentierte Heredoc-Falle**: Backslashes in
    einem Python-Skript per Bash-Heredoc zerlegten erst einen String, dann ein Style-Attribut.
    Beim zweiten Mal die Anführungszeichen ganz vermieden und eine CSS-Klasse genommen.

### 2026-09-07 (Fortsetzung 4) — Etappe 2: Spiele, Sitzungen, Spieler
Das Gerüst für mehrere Runden. Bisher lag der gesamte Spielstand flach in der Wurzel — es gab
also genau EINE Runde, und zwei Gruppen hätten sich gegenseitig die Szene umgeschaltet.

- **Neue `js/sitzung.js`.** Aller Spielstand hängt jetzt unter `sitzungen/{sid}/stand/…`, ein
  einziger Zeiger `aktiveSitzung` sagt, welche läuft.
  - **Der entscheidende Kniff: eine Hülle statt 84 Änderungen.** Im Projekt stehen 84 Aufrufe der
    Form `db.ref('currentScene')`. Die einzeln umzuschreiben wären 84 Gelegenheiten, eine zu
    vergessen — und eine vergessene schreibt still in die Wurzel zurück, wo sie niemand sucht.
    Stattdessen wird **das `db`-Objekt selbst ausgetauscht**: gleiche Form, aber es stellt jedem
    bekannten Spielstands-Pfad das Präfix voran. **Jeder Aufrufer bleibt wörtlich, wie er ist**;
    geändert wurde eine Zeile je Seite.
  - Die Wurzel-Sammel-Updates (`db.ref().update(paket)`, 3 Stellen) hängen **jeden Schlüssel
    einzeln** um — sonst schriebe ein einziger Aufruf den halben Spielstand zurück in die Wurzel.
  - **Der Zeiger kommt aus dem localStorage**, nicht aus einem Firebase-Lesezugriff. Sonst hätte
    in sieben Dateien der Ablauf von synchron auf asynchron umgebaut werden müssen. Weicht der
    Cache ab, lädt die Seite neu — ein Sitzungswechsel ist ohnehin ein Einschnitt.
- **Neue `regie_sitzungen.html`** (SL-Seite, **nicht** im Hub verlinkt): Spiele anlegen ·
  Sitzungen anlegen, starten, beenden, fortsetzen, umbenennen, löschen · Spieler je Sitzung.
  Arbeitet bewusst auf der **echten** Datenbank, nicht auf der Hülle — sie verwaltet ja die
  Sitzungen und muss über ihnen stehen.
  - **Spiel und Sitzung sind zwei Ebenen:** Ein Spiel ist das Abenteuer (der Inhalt), eine
    Sitzung eine Gruppe, die es spielt. Dasselbe Spiel kann mehrfach laufen.
  - Spieler tragen sich beim Anmelden im Hub **selbst** in die laufende Sitzung ein. Ohne das
    wäre die Liste eine Karteileiche: Die SL kann Namen vormerken, aber wer da ist, weiß nur der
    Browser des Spielers. Ein Punkt am Namen zeigt, wer schon eine Figur hat.
- **Passwort je Sitzung liegt in einem eigenen Ast `geheimnisse/{sid}/pw`, NICHT unter
  `sitzungen/`.** Grund: In Firebase **kaskadiert `".read": true` nach unten und lässt sich tiefer
  nicht mehr zurücknehmen** — ein Passwort unterhalb des lesbaren Sitzungsknotens wäre für jeden
  Client lesbar gewesen. So ist es für keinen lesbar, Regeln dürfen es trotzdem vergleichen.
- **`rundenId()` ist entfallen** (`js/identitaet.js`). Der Pfad `figuren/{runde}/{pid}` trug die
  Runde selbst; mit der Hülle wäre das doppelt gemoppelt. Jetzt `figuren/{pid}` unter der Sitzung.
- **`firebase-rules.json` auf 24 Pfade** (`aktiveSitzung`, `spiele`, `sitzungen`, `geheimnisse`,
  `anspruch` neu). **⚠ Muss in der Konsole veröffentlicht werden**, sonst schlägt jeder
  Schreibzugriff auf die neuen Pfade still fehl.
- **Bestehender Spielstand wird NICHT automatisch verschoben.** Die Verwaltungsseite erkennt, was
  noch flach in der Wurzel liegt, und bietet an, es in eine Sitzung zu **kopieren** — die Wurzel
  bleibt unangetastet. Das ist die gespielte Kampagne; ein Verschieben wäre nicht ohne Weiteres
  rückgängig zu machen und ist Hendriks Entscheidung, nicht meine.
- **Getestet: 267 Prüfungen über sechs Skripte, 0 Fehler.** Die tragende Prüfung zieht die
  benutzten Pfade **aus dem echten Code** statt aus meiner Erinnerung und stellt sicher, dass die
  Hülle jeden einzelnen kennt — und dass kein toter Eintrag in der Liste steht. Dazu: ein
  Sammel-Update hängt jeden Schlüssel um, zwei Sitzungen überschneiden sich nirgends, das
  Passwort landet nachweislich nicht unter `sitzungen/`, und die Übernahme löscht nichts.
  - **Zwei Bestandstests brachen** (Heldenbrief, Senden) — beide, weil ihr vm-Kontext
    `js/sitzung.js` nicht lud. Die Seiten selbst fingen das sauber ab („nur lokal" statt Absturz),
    was den im September gebauten Schutz bestätigt. Beide Skripte prüfen jetzt zusätzlich, dass
    die Schreibvorgänge einer echten Seite unter `sitzungen/korsaren/stand/…` landen.
- **[OFFEN] Anonyme Anmeldung und der Passwort-Anspruch fehlen noch.** Bewusst getrennt: Eine
  Struktur-Migration und eine Rechte-Umstellung gleichzeitig zu machen heißt, bei einem Fehler
  nicht mehr sagen zu können, welche der beiden schuld war. `geheimnisse` ist heute schon
  unlesbar, aber noch frei beschreibbar.

### 2026-09-07 (Fortsetzung 3) — Hausregel gestrichen, Savage Worlds pur
- **Nachtrag: Der Wurf zeigt jetzt, WELCHER Würfel gezählt hat.** Hendriks Frage nach dem
  Screenshot — „Was ist der Wild Die? Den braucht es doch gar nicht mehr" — war berechtigt gegen
  die Anzeige, nicht gegen die Regel: Beide Würfel standen gleichberechtigt untereinander, ohne
  Hinweis, dass der höhere zählt. Der zählende Würfel ist jetzt markiert, der andere abgeblendet.
  Ausgerechnet in dem Screenshot trug der Wild Die alles: Wert-Würfel 6 (Erfolg ohne Steigerung),
  Wild Die auf 16 explodiert (drei Steigerungen).
  - **Der Wild Die ist nach dem Wechsel wichtiger, nicht unwichtiger** — er ist das Einzige, was
    eine Spielerfigur von einem Statisten trennt. Gelingt/Patzer mit ihm gegen ohne: d4
    62,5 %/4,2 % gegen 25 %/25 % · d8 81,3 %/2,1 % gegen 62,5 %/12,5 % · d12 87,5 %/1,4 % gegen
    75 %/8,3 %. Auf d8 wird fast jeder fünfte Wurf allein von ihm gerettet.
- **Hendriks Entscheidung:** „Schlechte Erfolge zu spielen macht keinen Spaß." Die vier Bänder
  fliegen raus, das Original wird komplett übernommen, kein eigenes Süppchen mehr.
- **Was die Messung vorher zeigte** (sie hat die Entscheidung getragen): Weil der Wild Die ein
  fester d6 ist, waren **genau 50 % aller gelungenen Proben ein „guter Erfolg" — auf jeder
  Würfelstufe.** Steigern erhöhte nur, wie oft man trifft, nie wie gut. Und der „schlechte
  Erfolg" war auf d4 mit 37,5 % der häufigste Ausgang überhaupt, traf also frische Figuren am
  härtesten.
- **`js/regelwerk.js` auf das Original umgebaut:** explodierende Würfel, der **höhere** der
  beiden zählt (nicht die Summe), Ziel 4, je volle 4 darüber eine Steigerung, kritischer Patzer
  bei zwei natürlichen Einsen. Ungelernt ist **d4 mit −2** statt gar kein Würfel — vorher konnte
  eine ungelernte Probe **überhaupt nie** gelingen (0 %), jetzt zu 32,3 %. Erschwernisse sind
  flache Zahlen statt Würfelstufen; Wunden ziehen flach ab, statt die Stufe zu senken.
- **Bänder neu:** `steigerung` · `erfolg` · `miss` · `patzer`.
- **Der Wurf liegt jetzt im Regelwerk** (`wurf()`), nicht mehr in `heldenbrief.html`. Die Seite
  hatte die Logik nachgebaut, mit dem Kommentar, sie müsse „Zeile für Zeile" zur
  Wahrscheinlichkeitsrechnung passen — eine Einladung an zwei Fassungen, auseinanderzulaufen.
- **Gegen die veröffentlichten Werte geprüft**, das ist der eigentliche Prüfstein: d4 schafft 4+
  zu 25 %, d6 zu 50 %, d8 zu 62,5 %, d10 zu 70 %, d12 zu 75 %; d4 erreicht 8+ zu 6,25 %; eine
  Spielerfigur mit d4 plus Wild Die gelingt zu 62,5 %. Alle exakt getroffen.
- **Neue Erfolgsquoten** (Steigerung / Erfolg / Miss / Patzer): ungelernt 12,6–19,7–63,5–4,2 ·
  d4 19,3–43,2–33,3–4,2 · d6 25,9–49,2–22,2–2,8 · d8 24,7–56,6–16,7–2,1 · d12 49,8–37,7–11,1–1,4.
- **Eine echte Eigenheit des Originals, die am Tisch auffallen wird:** **d6 holt öfter eine
  Steigerung als d8** (13,9 % zu 12,5 %), weil ein d6 häufiger explodiert. Per Simulation
  gegengeprüft — das steht so im Regelwerk und ist kein Fehler im Code. Im Dateikopf vermerkt.
- **Getestet:** 45 Prüfungen des neuen Kerns, 0 Fehler — darunter 600.000 echte Würfe gegen die
  exakte Rechnung (Abweichung < 0,6 Prozentpunkte), „der höhere zählt, nie die Summe", Patzer
  ausschließlich bei zwei natürlichen Einsen, und dass kein „schlechter Erfolg" mehr existiert.
  Dazu die Bestandstests (Heldenbrief 51, Senden 14, Hub 22).
- **[OFFEN] Der Abenteuertext ist noch nicht umgehängt.** In `js/regie.js` stehen 38 „Guter
  Erfolg", 25 „Normaler Erfolg", 104 „Misserfolg" — die lesen sich unverändert als Steigerung /
  Erfolg / Misserfolg. Aber **24 × „Schlechter Erfolg" haben kein Band mehr.** Das ist der
  bereits vorgesehene, eigene Schritt („erst das Charaktersystem, dann das Abenteuer").
- **[OFFEN] `js/arena.js` rechnet weiter nach W100** (`arenaSchwellen`/`arenaBand`) und kennt die
  vier alten Bänder — sichtbar in `karte.html:1708`, `arena_admin.html:298`. Der Abstand zum
  Charaktersystem ist damit größer geworden, nicht kleiner.

### 2026-09-07 (Fortsetzung 2) — Besatzung und Codex aus dem Spieler-Hub
- **Hendriks Anweisung:** Beide Kacheln raus aus der Übersicht. Spieler dürfen die Seiten nicht
  sehen — dort stehen die Hintergründe im Detail.
- **`index.html`** verlinkt jetzt nur noch **Karte · Heldenbrief · Figur erschaffen**. Die
  Dateinamen stehen auch **nicht** im Quelltext der Seite, wie bei allen SL-Seiten — der Hub ist
  für jeden Spieler über „Seitenquelltext anzeigen" lesbar.
- **`regie.html`** verlinkt beide in der Kopfleiste, neben Figuren und Schlachtfeld.
- **Getestet:** 22 Prüfungen, 0 Fehler — keine der sechs SL-Seiten taucht in `index.html` auf,
  die Regie erreicht alle vier verlinkten, die drei Spielerkacheln stehen, und jeder verlinkte
  Pfad existiert.
- **Rest:** `crew_manifest.html` ist eine alte Weiterleitung und nennt `besatzung.html` im
  Klartext. Nirgends verlinkt; Löschen bleibt Hendriks Entscheidung.

### 2026-09-07 (Fortsetzung) — "Wird gesendet ..." blieb stehen
- **Hendriks Meldung:** Der Knopf „An die Spielleitung senden" hing ewig bei „Wird gesendet …".
  Erste Frage war, ob eine Firebase-Regel fehlt — **nein.** Per REST gegengeprüft: ein `PUT` auf
  `figuren/korsaren/_probe` antwortet **200**, Lesen und Löschen ebenso. Aufschlussreicher war,
  dass `figuren` **`null`** ist: Die Anwendung hat also **noch nie** etwas geschrieben, auch nicht
  vor der Pfadumstellung. Der Fehler saß im Browser, nicht in den Regeln.
- **Ursache:** Weder `.then` noch `.catch` liefen — das Versprechen fiel nie. Genau das tut die
  Realtime Database ohne Verbindung: Sie legt den Schreibvorgang **lokal in die Warteschlange**
  und meldet sich nie zurück. Ein abgelehnter Zugriff hätte `.catch` ausgelöst, ein kaputter
  Aufruf hätte geworfen; ein ewiges Warten heißt „keine Verbindung".
- **Die Anzeige log dabei.** `setzeSync('verbunden')` stand direkt hinter
  `firebase.initializeApp()` — das baut nur ein Objekt auf und berührt das Netz mit keinem Byte.
  Die Seite behauptete also „verbunden", ohne es je geprüft zu haben. Jetzt horchen beide Seiten
  auf **`.info/connected`**, das die Datenbank selbst führt, und melden „verbinde …" → „verbunden"
  bzw. „offline".
- **Kein stummes Hängen mehr:** `jetztSenden()` bekommt eine **Frist von 8 Sekunden**. Läuft sie
  ab, sagt die Seite, was los ist, beruhigt ausdrücklich („liegt sicher in diesem Browser, geht
  nicht verloren, wird von selbst gesendet") und nennt den wahrscheinlichsten Grund (Werbe-/
  Skriptblocker). Erfolg und Ablehnung räumen die Frist ab.
- **Beide Seiten gegen Ausnahmen abgesichert** (Assistent und Heldenbrief): `update()` kann auch
  **werfen** statt abzulehnen; dann floh die Ausnahme bisher am `.catch` vorbei und fror die
  Meldung ein. Jetzt umschlossen, mit eigener Meldung für den Fall einer veralteten Fassung aus
  dem Browser-Cache. Der `catch`-Zweig von `initFirebase()` setzt `syncBereit` wieder auf `false` —
  vorher blieb es stehen und jeder spätere Aufruf lief in dieselbe Ausnahme.
- **Getestet:** 14 neue Prüfungen mit einem Versprechen, das absichtlich nie fällt (Anzeige bei
  offener/geschlossener Verbindung, die Meldung hängt nach der Frist nicht mehr, der Erfolgsfall
  bleibt heil, eine Ablehnung nennt ihren Grund), dazu die 51 des Heldenbriefs — 0 Fehler.
- **Merke fürs Projekt:** Ein Firebase-Versprechen, das weder erfüllt noch abgelehnt wird, ist
  **immer** „keine Verbindung" — nie eine Regelfrage. Und `initializeApp()` ist kein Beleg für
  irgendetwas; nur `.info/connected` ist es.

### 2026-09-07 — Charaktersystem fertig: Heldenbrief, Steigerungen, Ausrüstung
Etappe 1 des Plans „PnP-Desk: von einer Kampagne zur Umgebung". Die Erschaffung stand, aber
es gab nichts, worauf man die Figur weiterführt.

- **Neue `heldenbrief.html`** — ein Blatt zum Führen, kein Assistent zum Durchklicken. Drei
  Reiter: Bogen · Steigerung · Ausrüstung.
  - **Zustand**: Angeschlagen + 3 Wunden + außer Gefecht. Jede Wunde senkt alle Würfel eine
    Stufe (`wundenAbzug()`); die Werteliste zeigt den gedrückten Würfel direkt an („d8 → d6").
    Angeschlagen kostet bewusst **keine** Würfelstufe — das ist eine Zeitstrafe, keine
    Werteinbuße.
  - **Bennies** zum Ausgeben, Zurücknehmen und Auffüllen (`benniesUebrig`, `null` = unangetastet).
  - **Würfeln per Klick auf jeden Wert.** Wert-Würfel und Wild Die getrennt gelesen, Ergebnis
    eingeordnet und gedeutet („Nur der Wild Die. Du hattest Glück, nicht Können."). 400
    Testwürfe auf d8 treffen die exakte Erwartung aus `chancen()`.
  - Steckbrief und freie Notizen.
- **Steigerungen gebaut** (`STEIGERUNG_ARTEN`, `steigerungArten()`, `steigerungAnwenden()`).
  Die Regel stand seit dem Systemwechsel nur als Kommentar in `js/regelwerk.js`. Alle fünf
  Arten, nur die gerade erlaubten anklickbar, mit Begründung bei den gesperrten. Neues Feld
  `attributImRang` trägt die Bremse „Attribut nur einmal je Rang"; beim Rangaufstieg lebt das
  Kontingent wieder auf. `steigerungAnwenden()` ändert die Figur **nur im Erfolgsfall** — eine
  halb angewandte Steigerung wäre schlimmer als gar keine.
  - **Echter Regelfehler dabei gefunden:** Ich hatte geprüft, ob eine Fertigkeit *nach* dem
    Anheben noch unter ihrem Attribut liegt. Savage Worlds prüft den *aktuellen* Stand („at or
    below"). Mit meiner Fassung hätte eine frische Figur die günstige Doppel-Steigerung **nie**
    nutzen können — alle Kernfertigkeiten stehen ja schon auf ihrem Attribut, und genau dann
    braucht man sie am dringendsten. Behoben, umbenannt zu `fertAufOderUnterAttribut()`.
- **Ausrüstung** (`AUSRUESTUNG`, 23 Gegenstände in vier Arten). Waffen bringen einen **eigenen
  Schadenswürfel** mit statt eines Bonus — in diesem System wird nichts addiert. Rüstung hebt
  die Robustheit, Traglast hängt an der Stärke (doppelte Seitenzahl). **Überladung kostet eine
  Würfelstufe** und läuft deshalb durch dieselbe Funktion wie Wunden. Kaufen und Ablegen im
  Bogen, halber Preis beim Verkauf; Startgeld 500 Münzen.
- **Figurenpfad vorwärtskompatibel**: `figuren/{spielerId}` → **`figuren/{rundenId}/{spielerId}`**.
  Neue `rundenId()` in `js/identitaet.js`, vorerst eine Konstante — in Etappe 2 wird daraus ein
  Lesezugriff auf `aktiveRunde`, ohne dass ein Aufrufer sich ändert. **Keine Regeländerung
  nötig**: `figuren` gibt den ganzen Teilbaum frei, per REST gegengeprüft (`figuren/korsaren/…`
  antwortet 200, ein nicht freigegebener Pfad weiterhin 401).
- **Datenverlust-Fehler behoben, bevor er auftrat:** Der Assistent schrieb mit `set()`. Sobald
  der Heldenbrief unter demselben Knoten Wunden, Bennies, Ausrüstung und Notizen ablegt, hätte
  das nächste Öffnen des Assistenten all das stillschweigend gelöscht — er kennt diese Felder
  gar nicht. Beide Seiten schreiben jetzt mit `update()` und fassen nur ihre eigenen Felder an;
  `bogenFelder()` und `figurFuerDb()` überschneiden sich bewusst nicht (per Test abgesichert:
  der Bogen fasst Handicaps, Steckbrief und Namen **nicht** an).
- **`alsFigur()` entdoppelt**: stand als eigene Kopie in `regie_figuren.html`, liegt jetzt in
  `js/regelwerk.js` und wird von Übersicht **und** Bogen genutzt. Nimmt zusätzlich Firebase-
  Objekte statt Arrays entgegen — Firebase macht aus einem lückenhaften Array ein Objekt mit
  Zahlenschlüsseln, sonst wäre eine Liste stillschweigend verschwunden.
- **Würfel-Feed ordnet jetzt ein** (`js/dice.js`, `formatRollText`): Trägt ein Wurf `probe` und
  `band`, meldet der Feed „Anna — Kämpfen d8: Guter Erfolg (7 / Wild 3)" statt einer rohen Zahl.
  Der Kopf der Datei dokumentierte die alte Kapitulation („zeigt bewusst NUR die rohe Zahl") —
  die galt fürs W100-System, wo die Einordnung mehrdeutig war. Freie Würfe aus der Leiste laufen
  unverändert.
- **SL-Übersicht zeigt den Spielzustand**: Wunden, Angeschlagen, Überladung, der resultierende
  Würfelabzug und die getragene Ausrüstung. Bennies als **Stand**, nicht als Maximum. Eine
  unversehrte Figur bekommt bewusst keine Zustandszeile.
- **Verdrahtung**: Hub verlinkt den Heldenbrief; `karte.html` zeigt im Charakter-Fach jetzt den
  Bogen statt des Assistenten — das ist das Blatt, das man am Tisch braucht.
- **Getestet** (Node, kein Browser): **201 Prüfungen, 0 Fehler** über fünf Testskripte
  (Regelwerk 36 + 59, Assistent 34, Übersicht 21, Heldenbrief 51).
  - **Zwei Testfehler, beide durch echte Änderungen ausgelöst:** Der Assistenten-Test stubbte
    nur `set()` und lud `js/identitaet.js` nicht — nach der Umstellung auf `update()` und den
    Rundenpfad lief er ins Leere. Und erneut die dokumentierte Heredoc-Falle: ein Testskript
    mit Backslashes ließ sich nicht per Bash-Heredoc schreiben, es musste über das Write-Werkzeug.
- **[OFFEN]** Die **Würfelaufforderung** (SL klickt in der Übersicht auf einen Wert → Spieler
  wird zum Wurf aufgefordert) ist weiterhin offen. Der Feed kann die Einordnung jetzt anzeigen,
  die Anfrage selbst (`figuren/{rid}/{pid}/anfrage`) fehlt noch.
- **[OFFEN]** Der Assistent hat keinen Ausrüstungsschritt — gekauft wird im Bogen. Das ist
  bewusst so (erst Geld, dann einkaufen), weicht aber vom Plan ab, der Startgeld bei der
  Erschaffung vorsah.

### 2026-09-06 (Fortsetzung 5) — Figuren gehen zur Spielleitung
- **Steckbrief auf die Prämisse der ersten Sitzung umgestellt.** Hendriks Korrektur: Die Fragen
  „Mit wem aus der Crew hast du Geschichte?" und „Wie hat die Gruppe dich kennengelernt?" setzen
  voraus, was die Figur beim Erschaffen nicht wissen kann — Grimsgate ist das Intro, niemand
  kennt einander, niemand weiß vom Schiff. Kanon nachgelesen (`SZENEN_REGIE["1.1"]`,
  Bibel 9): Im Hafen liegt eine **Siedlungsfahrt in die Neue Welt**, die Schiffe sind voll,
  Szenenziel ist überhaupt an Bord zu kommen, angeheuert wird „freiwillig oder gepresst".
  - Neu: **Antrieb** (warum in die neue Welt) · **Ballast** (was du zurücklässt) · **Mittel**
    (womit du dir einen Platz verschaffen willst) · Geheimnis · Marke.
  - Als Prüfstein im Dateikopf verankert: **Jede Frage muss zum Zeitpunkt der Erschaffung
    beantwortbar sein.** Zwei Tests sichern das ab (keine Frage darf ein Schiff oder die Gruppe
    voraussetzen) — ich hatte denselben Fehler zweimal gemacht.
- **Figuren liegen jetzt in Firebase** (`figuren/{spielerId}`) statt nur im Browser des
  jeweiligen Spielers. Das behebt ein seit August dokumentiertes Problem: Die SL kam an die Werte
  nicht heran und musste sie für die Arena von Hand abtippen.
  - `localStorage` bleibt der Rückfall und wird **immer zuerst** geschrieben — ohne Netz geht
    nichts verloren. Der Firebase-Schreibzugriff ist um 800 ms entprellt, sonst ginge jeder Klick
    an einem Stepper durchs Netz. Statusanzeige in der Kopfleiste: verbunden / gespeichert /
    nur lokal.
- **Neue `js/identitaet.js`**: Hub und Assistent teilen sich jetzt eine Datei für Name
  (`korsaren_playername`, derselbe Schlüssel wie `js/dice.js`) und Kennung (`pnp_player_id`).
  Vorher hatte `index.html` eine eigene Kopie — wäre eine davon abgewichen, hätte derselbe
  Spieler zwei Kennungen bekommen und seine Figur wäre die eines Fremden gewesen.
- **Neue `regie_figuren.html`** — Übersicht für die Spielleitung: alle Figuren nebeneinander mit
  abgeleiteten Werten, Attributen, Fertigkeiten, Talenten, Schwächen und **Steckbrief**.
  Umschaltbar: Steckbrief aus, alle statt nur gelernte Fertigkeiten. **Nur lesend** — geändert
  wird eine Figur ausschließlich von ihrem Spieler, sonst gäbe es zwei Quellen für denselben Wert.
  **Nicht verlinkt**, wie die übrigen SL-Seiten; sie zeigt die Geheimnisse der Figuren.
- **Neuer Firebase-Pfad `figuren`** in `firebase-rules.json` (jetzt **19 Pfade**), von Hendrik in
  der Konsole veröffentlicht und per REST gegengeprüft: `figuren` antwortet 200, ein nicht
  freigegebener Pfad weiterhin 401.
- **Getestet** (Node, kein Browser): 15 Prüfungen der Übersicht, 26 des Assistenten, 36 des
  Regelwerks — 0 Fehler. Darunter: eine halb gespeicherte Figur sprengt die Übersicht nicht,
  Parade und Robustheit stimmen mit dem Regelwerk überein, und keine SL-Seite taucht in
  `index.html` auf.
- **[OFFEN]** Zweite Etappe: Die SL klickt in der Übersicht auf einen Wert und fordert damit den
  Spieler zum Wurf auf. Vorgesehen unter `figuren/{pid}/anfrage`, also ohne weiteren
  Firebase-Pfad. Dabei fällt ein Nebengewinn an: `js/dice.js` zeigt bewusst nur die rohe Zahl,
  weil die Einordnung unter W100 mehrdeutig war — mit zwei Würfeln und vier Ausgängen ist sie
  eindeutig, der Feed kann künftig „Guter Erfolg" melden statt „17".

### 2026-09-06 (Fortsetzung 4) — Zwölf neue Talente mit Seefahrtsdrall
- **Anlass:** Hendriks Frage, ob eine neue Figur wirklich nur aus 12 Talenten wählen kann.
  Ja — und die Prüfung deckte einen echten Fehler auf: **Führung und Unheimliches waren für
  Novizen komplett zu** (0 von 4 bzw. 0 von 3). Ausgerechnet die beiden Zweige, die ergänzt
  worden waren, weil sie fehlten. Kampf hatte 2, Umgang 1 — dünn für eine Kampagne, in der
  Kämpfen und Reden das Kerngeschäft sind.
- **Netzsuche nach Savage-Worlds-Seefahrtsmaterial** (auf Hendriks Bitte): **50 Fathoms** und
  **Pirates of the Spanish Main** sind die einschlägigen Settings. 50 Fathoms bringt 16 eigene
  Talente, die meisten davon in jedem Piratenspiel brauchbar (Close Fighting, Dirty Fighter,
  Natural Swimmer, Master & Commander). Stoßrichtung übernommen, Wirkung und Texte eigene.
- **Zwölf neue Talente, zwei je Kategorie** (29 → 41): Wassergänger · Eiserner Magen ·
  Kanonier · Schiffszimmermann · Enger Raum · Kein Kodex · Shanty-Sänger · Glatte Zunge ·
  Bootsmann · Herr über Schiff und Mannschaft · Seemannsgarn · Totenstill.
- **Jede Kategorie hat jetzt mindestens ein Novizen-Talent.** Neue Verteilung (Novize/gesamt):
  Hintergrund 7/8 · Handwerk 5/8 · Kampf 4/9 · Umgang 2/5 · Führung 1/6 · Unheimliches 1/5.
  Eine neue Figur wählt damit aus **20 statt 12** Talenten.
- **Getestet:** 36 Prüfungen des Regelwerks und 26 des Assistenten, 0 Fehler. Neu darunter:
  keine doppelten IDs *und* keine doppelten Namen, alle Voraussetzungen zeigen auf existierende
  Werte, jedes Talent ist von irgendeiner legalen Figur erreichbar, und keine Kategorie ist für
  Novizen mehr geschlossen.
- **Entschieden (Hendrik):** Die zuvor vorgeschlagene Verschiebung von fünf Talenten auf Novize
  (Kommandostimme, Standhaft, Vorahnung, Beidhändig, Drohende Gegenwart) findet **nicht** statt.
  Mit 20 wählbaren Talenten für eine neue Figur ist die Auswahl groß genug; die Rangstaffelung
  bleibt wie sie ist. Kein offener Punkt mehr.

### 2026-09-06 (Fortsetzung 3) — Kompletter Schnitt: alles Alte entfernt
- **Hendriks Ansage, zum dritten Mal:** „Ich möchte das System komplett umstellen. Nicht halb
  halb." Ich hatte trotz zweier vorheriger Ansagen Reste stehen lassen — die Archetypen als
  „Abkürzung", den toten Bogen und den alten W100-Bogen als „Archiv". Jetzt vollständig weg.
- **Archetypen ersatzlos entfernt** aus `js/regelwerk.js` (`ARCHETYPES`, `archetypSetzen`,
  `pruefeVorlagen`) und aus dem Assistenten. `leereFigur()` nimmt kein Argument mehr, das Feld
  `arch` an der Figur ist weg. Begründung im Code: Ein Paket, das Attribute und Fertigkeiten
  vorab füllt, überspringt genau den Weg, um den es bei dieser Reihenfolge geht.
- **`charakterbogen_sw.html` gelöscht** — stand auf dem gestrichenen Wertemodell und hätte jede
  Figur falsch angezeigt.
- **`charakterbogen.html` gelöscht** (der alte W100-Bogen). Dabei fiel auf, dass `karte.html` ihn
  im Charakter-Fach per iframe lädt (Zeile ~2051) — ein reines Löschen hätte die Spieleransicht
  gebrochen. Der Drawer zeigt jetzt `charaktererstellung.html`; bis ein eigener Bogen für das
  neue System steht, trägt der Assistent selbst die Übersicht am Ende.
  - **Folge, die Hendrik kennen sollte:** Figuren, die Spieler unter `localStorage.kors_s`
    gespeichert haben, sind damit nicht mehr aufrufbar. Das ist die Konsequenz des
    Systemwechsels, nicht ein Versehen.
- **Hub bereinigt:** verlinkt nur noch Karte, Figur erschaffen, Besatzung, Codex. Im gesamten
  Repo gibt es keine Referenz auf `charakterbogen*` mehr.
- **Getestet:** 36 Prüfungen des Regelwerks und 26 des Assistenten, 0 Fehler; alle Links in
  `index.html` und `karte.html` zeigen auf existierende Dateien.

### 2026-09-06 (Fortsetzung 2) — Geführte Erschaffung in Einsteiger-Reihenfolge
- **Anlass:** Hendrik hat „Charaktererstellung #2 | Savage Worlds" gesehen und will diese
  Reihenfolge: **erst Schwächen und Talente**, die auf ihre Attribute verweisen, **am Ende die
  Fertigkeiten aus einer Liste**. (Das Video selbst konnte ich nicht ansehen — gebaut wurde nach
  Hendriks Beschreibung; sie deckt sich mit der gängigen Einsteiger-Empfehlung.)
- **Neue Schrittfolge:** Konzept → **Schwächen → Talente → Attribute → Fertigkeiten** →
  Steckbrief → Fertig. Bewusst nicht die Reihenfolge des Regelbuchs: Erst entscheidet man, WER
  die Figur ist, und diese Wahl sagt dann selbst, welche Werte nötig sind.
- **Weiche Voraussetzungen** (`talentWaehlbar` / `verlangtVon` / `offeneVoraussetzungen` in
  `js/regelwerk.js`). Der Kern des Umbaus, weil ein Talent jetzt gewählt wird, *bevor* seine
  Werte stehen:
  - **Rang bleibt harte Sperre** — den kann man sich mit Punkten nicht kaufen.
  - **Wert-Voraussetzungen werden zum Ziel.** Das Talent ist wählbar, und die Schritte Attribute
    und Fertigkeiten zeigen an, was noch fehlt: ein Banner „Deine Talente verlangen noch
    Kämpfen d8 — du hast — · für Duellant", ein Abzeichen an der betroffenen Zeile
    („braucht d8" → „✓ d8"), die Zeile selbst hervorgehoben, und ein Zähler „Ziele offen" in
    der Fußleiste.
  - Eine von einem Talent verlangte Fertigkeit erscheint automatisch in der Liste, auch wenn sie
    noch ungelernt ist — sonst müsste man sie suchen.
- **Fertigkeiten als Auswahlliste** statt 16 fester Zeilen: Gezeigt wird, was gelernt ist oder
  was ein Talent verlangt; alles Übrige steht als anklickbare Chips nach Attribut gruppiert
  darunter und wird per Klick auf d4 dazugenommen. Ein ✕ verlernt wieder.
- **Archetypen zur Abkürzung degradiert:** Sie stehen als optionale Chips auf dem Konzept-Schritt
  mit dem ausdrücklichen Hinweis, dass der geführte Weg ohne sie läuft. Ein Paket, das Attribute
  und Fertigkeiten vorab füllt, widerspricht sonst genau dem Prinzip dieser Reihenfolge.
- **Getestet** (Node, kein Browser): 25 Prüfungen des Assistenten und 39 des Regelwerks,
  0 Fehler. Darunter: die Schrittreihenfolge selbst, dass eine fehlende **Wert**-Voraussetzung
  nicht sperrt (Marktkenner, Rang 0), dass ein Rang zu niedrig weiterhin sperrt, dass ein
  gewähltes Talent zum offenen Ziel wird und nach Erfüllen verschwindet, und der
  Hinzufügen/Verlernen-Kreis in der Fertigkeitsliste.
  - **Zwei Testfehler, beide meine:** Die Prüfung „Wert-Voraussetzung sperrt nicht" lief gegen
    Duellant, während die Figur noch Novize war — dort sperrte korrekt der *Rang*; jetzt gegen
    Marktkenner (Rang 0). Und `class="row` traf als Regex auch `row-n`/`row-sub`.

### 2026-09-06 (Fortsetzung) — Altes Wertegerüst gestrichen, ein einziges Regelwerk
- **Hendriks Ansage: „wir vergessen das alte System vollständig."** Ich hatte die alten
  Wertenamen mehrfach mit dem Szenentext verteidigt (Körper 51×, Wahrnehmung 36× in
  `js/regie.js`) und damit das Charaktersystem aus den Zwängen des Abenteuers abgeleitet —
  genau das war nicht gewollt. Die Zuordnung der Proben im Abenteuertext ist ein **späterer,
  eigener Schritt**.
- **`js/regelwerk.js` neu gebaut.** Entfallen: die vier Grundwerte (Körper/INT/Auftreten/
  Wahrnehmung), die sechs Fertigkeiten, die acht Wissensgebiete — und die Umschaltung zwischen
  zwei Regelsätzen. Hendriks Frage „Savage Worlds mit unserer Zwei-Würfel-Logik?" hatte den
  Vergleich bereits entschieden; es gibt jetzt **genau ein System**.
  - **Fünf Attribute:** Geschicklichkeit · Verstand · Willenskraft · Stärke · Konstitution.
    Stärke und Konstitution tragen bewusst **keine** Fertigkeiten (werden direkt gewürfelt),
    wie im Original.
  - **16 Fertigkeiten, jede an genau EINEM Attribut.** Das behebt den gemessenen Fehler des
    alten Gerüsts, wo ein Wert Leitwert für 11 von 14 Fertigkeiten und damit Zwangskauf war.
    Verteilung jetzt 6 / 7 / 3 / 0 / 0. Fünf Kernfertigkeiten starten frei auf d4.
  - **Budgets:** 5 Attributs-, 12 Fertigkeitspunkte; eine Stufe kostet 1 bis zum Attribut,
    darüber 2. Sechs Archetypen als Startpakete, alle innerhalb des Budgets.
- **Die Würfellogik ist Hendriks Verschmelzung** und die einzige bewusste Hausregel: Savage
  Worlds gibt Spielerfiguren ohnehin zwei Würfel (Wert + Wild Die d6). Statt „nimm den besseren"
  wird gelesen, **welcher** getroffen hat — beide = guter Erfolg, nur der Wert = Erfolg, nur der
  Wild Die = schlechter Erfolg, keiner = Misserfolg. Kein Addieren, kein Explodieren, keine
  8er-Schwelle, kein Nachwurf. Ungelernt gibt es keinen Wert-Würfel: dann trägt allein der Wild
  Die, es kann also höchstens ein schlechter Erfolg herauskommen.
  - Ergebnis (gut / Erfolg / schlecht / Miss): d4 12,5–12,5–37,5–37,5 · d6 je 25 ·
    d8 31,3–31,3–18,8–18,8 · d12 37,5–37,5–12,5–12,5. **Der Anfänger schafft die Dinge
    überwiegend mit Glück, der Meister überwiegend mit Können** — dieselbe Handlung, eine andere
    Geschichte. Stellschraube ist `WILD_DIE`: ein d4 dort halbiert die guten Erfolge.
  - Statisten würfeln ohne Wild Die (`chancen(stufe,{wild:false})`) und kennen nur Erfolg/Miss.
- **Steckbrief neu** (`STECKBRIEF`): fünf Pflichtfelder ohne Zahlen — Antrieb, Band, Geheimnis,
  Marke, Erste Szene, je mit Hilfetext und einem übernehmbaren Beispiel. Das ist der Teil, den
  Savage Worlds nicht liefert und der Hendriks eigentliches Ziel trägt.
- **`charaktererstellung.html` neu gebaut**: sieben Schritte (Konzept · Attribute ·
  Fertigkeiten · Handicaps · Talente · Steckbrief · Fertig). Fertigkeiten nach Attribut
  gruppiert mit dem Leitwert in der Kopfzeile; Kosten oberhalb des Attributs orange markiert.
  Talente nach Kategorie, gesperrte mit Begründung statt versteckt. Nimmt man einem Talent die
  Voraussetzung wieder weg (Wert senken, Rang senken, Archetyp wechseln), fällt es automatisch
  ab. Die Seite kennt selbst **keine** Regeln — alles kommt aus `js/regelwerk.js`.
- **Getestet** (Node, kein Browser): 39 Prüfungen des Regelwerks und 25 des Assistenten,
  0 Fehler. Darunter: jede Fertigkeit hängt an genau einem Attribut, kein alter Wertename mehr
  vorhanden, alle Bänder summieren auf 1, schlechter Erfolg sinkt und guter Erfolg steigt
  monoton mit dem Würfel, alle Voraussetzungen zeigen auf existierende Werte, jedes Talent ist
  erreichbar, Archetypen im Budget, mehrfaches Setzen summiert nicht.
- **Hub angepasst:** Die Kachel „Heldenbrief" ist entfernt — `charakterbogen_sw.html` steht auf
  dem gestrichenen Modell und würde eine Figur falsch anzeigen. `charakterbogen.html` bleibt als
  „Archiv" verlinkt (die gespielte Runde hängt daran).
- **[OFFEN]** `charakterbogen_sw.html` ist damit verwaist und sollte gelöscht werden, sobald ein
  neuer Bogen auf `js/regelwerk.js` steht — bewusst nicht eigenmächtig entfernt.
- **[OFFEN]** Ausrüstung fehlt noch (Startgeld, Traglast an der Stärke, Waffen mit eigenem
  Schadenswürfel, Rüstung erhöht die Robustheit). Die Struktur ist dafür vorgesehen.
- **[OFFEN]** Die Zuordnung der Proben in `js/regie.js` auf die neuen Werte steht aus. Das ist
  Absicht: erst das Charaktersystem, dann das Abenteuer daran anpassen.

### 2026-09-06 — Talente und Handicaps auf Savage-Worlds-Struktur, mit Rängen
- **Anlass:** Hendriks Frage, ob man die offiziellen Listen übernimmt oder eigene schreibt.
  **Antwort und Vorgehen: Mechanik übernehmen, Texte selbst schreiben.** Wirkung, Rangstufen
  und Mindestvoraussetzungen folgen dem Savage-Worlds-Muster (über Jahre austariert, das
  nachzuerfinden wäre töricht); die Beschreibungen sind eigene, weil die offiziellen für ein
  generisches System von Fantasy bis Science-Fiction geschrieben sind und deshalb bewusst
  farblos bleiben — genau das Gegenteil des Ziels „mehr Pen-and-Paper-Gefühl".
  - Der zuerst von mir angeführte Copyright-Aspekt war **nicht** der tragende Grund und wurde
    auf Hendriks Einwand fallen gelassen: Für eine private Runde spielt er keine Rolle.
- **Ränge neu** (`RAENGE` in `js/regelwerk.js`): Novize → Erfahren → Veteran → Heroisch →
  Legendär, je vier Steigerungen ein Rang, dazu `rangVon()`/`rangName()`. Der Rang ist kein
  Selbstzweck: **daran hängen die Talente**, und genau das gibt Spielern zwischen den Sitzungen
  ein Ziel.
- **Talente 12 → 29**, erstmals mit `kat`/`rang`/`vor` (Kategorie, Mindestrang, Mindestwerte).
  Verteilung: Hintergrund 6 · Handwerk 6 · Kampf 7 · Umgang 3 · **Führung 4** · **Unheimliches 3**.
  Die beiden letzten Zweige fehlten komplett — bei einem Schiff mit 120 Mann und einem
  übernatürlichen Finale eine echte Lücke. Nach Rang: 12 Novize, 12 Erfahren, 4 Veteran,
  1 Heroisch.
- **Handicaps 14 → 20** und inhaltlich verschoben: neu `Schwur`, `Erzfeind`, `Getrieben`,
  `Verpflichtung`, `Treu`, `Stolz`. **15 der 20 tragen jetzt das Merkmal `haken`** — sie lösen
  Szenen aus, statt Würfel zu senken. Vorher war die Liste mehrheitlich Malus; die Stärke der
  offiziellen Vorlage liegt aber genau bei den Verpflichtungen.
- **Assistent** (`charaktererstellung.html`): Talente nach Kategorien gruppiert, Rangabzeichen
  an höheren Talenten, gesperrte Karten **mit Begründung** („gesperrt: ab Erfahren · Kampf d8")
  statt sie zu verstecken — man soll sehen, worauf man hinarbeitet. Neue **Rangwahl** im
  Konzept-Schritt (Vorgabe Novize; wer die gespielte Kampagne als Vorgeschichte zählt, steigt
  höher ein). Senkt man den Rang, fallen dadurch unerlaubt gewordene Talente automatisch weg.
- **Getestet** (Node, kein Browser): 27 Prüfungen des Regelwerks und 14 des Assistenten,
  0 Fehler. Darunter: alle Voraussetzungen zeigen auf tatsächlich existierende Werte, jedes
  Talent ist von irgendeiner legalen Figur erreichbar, keine doppelten IDs, die Sperrlogik
  nennt Rang und Wert getrennt, und ein Rangaufstieg gibt gezielt das richtige Talent frei.
  - **Drei Testfehler, alle meine, alle dieselbe Sorte falscher Erwartung:** (1) „höherer Rang
    sperrt weniger" schlug fehl, weil eine frische Figur alle Werte auf Minimum hat — die
    Wert-Voraussetzungen scheitern dann auch als Legendär, das Verhalten war korrekt.
    (2) `Kampf d8` gibt **zwei** Talente frei (Duellant *und* Ruhige Hand), nicht eines.
    (3) Erneut die vm-Falle: `const TALENTE` im Skript-Scope ist von außen nicht als
    `ctx.TALENTE` sichtbar — Daten jetzt über `require()` des Moduls statt über den Kontext.
- **[OFFEN]** Die Voraussetzungen zeigen auf die **derzeitigen** Wertenamen (Körper/INT/
  Auftreten/Wahrnehmung plus die vierzehn Fertigkeiten). Wird die vorgeschlagene Umstellung auf
  fünf Savage-Worlds-Attribute mit eigener Fertigkeitsliste beschlossen, müssen rund 30
  Voraussetzungen umgehängt werden — rein mechanisch, der teure Teil (Namen, Texte, Wirkungen,
  Rangstaffelung) bleibt davon unberührt.
- **[OFFEN]** Legendär trägt bisher kein Talent (die Kampagne erreicht den Rang ohnehin nicht).
  `charakterbogen_sw.html` nutzt `js/regelwerk.js` weiterhin nicht und kennt daher weder Ränge
  noch die neuen Talente.

### 2026-09-05 (Fortsetzung 2) — Geführte Charaktererschaffung mit zwei Regelsätzen
- **Hendriks Auftrag:** eine geführte Erschaffung nach Savage-Worlds-Regeln, und zwar in **zwei
  Fassungen** zum Vergleich — einmal Savage Worlds pur, einmal unsere Variante.
- **Umgesetzt als EIN Assistent mit Regelwahl an Schritt 1**, nicht als zwei Dateien: zwei
  Kopien derselben Logik driften auseinander, und zum Vergleichen müsste man zwischen zwei URLs
  springen. Nach Hendriks Entscheidung fliegt der unterlegene Regelsatz als **ein Objekt** aus
  `REGELWERKE` — mehr ist dann nicht zu tun.
- **Neue `js/regelwerk.js`** als gemeinsame Regelbasis: Würfelstufen, die Kanon-Werte (vier
  Grundwerte, sechs Fertigkeiten, acht Wissensgebiete), Talente, Handicaps, Kostenrechnung,
  abgeleitete Werte und die exakte Wahrscheinlichkeitsrechnung **beider** Regelsätze.
  - `savage`: explodierende Würfel (rekursiv exakt gerechnet, nicht simuliert), Wild Die d6 bei
    jeder Probe, Steigerung ab 8, Patzer bei doppelter 1, Erschwernis als −2, 12 Fertigkeits-
    punkte mit fünf Gratis-Fertigkeiten auf d4 (Athletik→Geschick, Aufmerksamkeit→Instinkt,
    Überreden→Rhetorik, Heimlichkeit→Geheim, Allgemeinwissen→Geschichte), ein Gratis-Talent.
  - `korsaren`: wie am selben Tag gebaut — gekaufte Meisterschaft, kein Explodieren, Nachwurf
    erzeugt den schlechten Erfolg, Erschwernis als Würfelstufe, 15 Fertigkeitspunkte.
- **Neue `charaktererstellung.html`** — sieben Schritte (Regeln, Konzept, Grundwerte,
  Fertigkeiten, Handicaps, Talente, Fertig), Budgetleiste dauerhaft am unteren Rand, am Ende
  eine Chancen-Tabelle für die tatsächlich gelernten Fertigkeiten und die Übergabe an den
  Heldenbrief (`localStorage.kors_sw`, vorhandene Notizen/Ausrüstung/Bild bleiben erhalten).
- **Vom Hub verlinkt** als eigene Kachel „Figur erschaffen"; der Heldenbrief verliert die
  Kennzeichnung „neu" und heißt jetzt sinngemäß „fertige Figur führen".
- **Getestet** (Node, kein Browser verfügbar): 22 Prüfungen des Assistenten und 24 des
  Regelwerks, 0 Fehler. Darunter die bekannten Savage-Worlds-Werte als Referenz (d4 schafft 4+
  zu 25 %, 8+ zu 6,25 %; d12 zu 75 %), Summe aller Bänder = 1,0 über **beide** Regelsätze und
  alle Würfelstufen, Erschwernis wirkt je Regelsatz unterschiedlich (d4 wird in der
  Korsaren-Variante unmöglich, im Savage-Satz nicht), Kostenregel diesseits/jenseits des
  Leitwerts, und der Regelwechsel räumt korrekt auf (Meisterschaft fällt weg, Gratis-
  Fertigkeiten werden angehoben, gesteigerte Werte bleiben).
  - **Ein echter Fund:** Der Archetyp-Wechsel summierte die Grundwert-Boni auf — wer dreimal
    klickte, hatte drei Stufen geschenkt. Der alte Bonus wird jetzt zurückgenommen, bevor der
    neue gesetzt wird; drei Prüfungen sichern das ab.
- **[OFFEN]** `charakterbogen_sw.html` rechnet weiterhin fest nach der Korsaren-Variante und
  nutzt `js/regelwerk.js` noch nicht. Eine im Savage-Satz gebaute Figur wird dort also mit den
  falschen Erfolgsstufen angezeigt (Werte und Talente stimmen). Der Assistent **warnt beim
  Übernehmen ausdrücklich davor**. Bewusst nicht vorher zusammengeführt: Der Bogen wird nach
  Hendriks Regelentscheidung ohnehin auf den einen verbleibenden Satz umgestellt, ein
  Refactoring davor wäre doppelte Arbeit an einer 1000-Zeilen-Datei.

### 2026-09-05 (Fortsetzung) — `index.html` wird der Spieler-Hub
- **Bisher** leitete `index.html` nur per `<meta refresh>` auf `karte.html` weiter. Jetzt ist die
  Wurzel-URL (https://xevvll.github.io/PnP-Desk/) die Startseite: Anmeldung mit Namen,
  Kacheln zu den Spielerseiten, Verfügbarkeits-Kalender.
- **Anmeldung ohne Konto:** Der Name landet unter dem **bereits existierenden** Schlüssel
  `localStorage.korsaren_playername` — demselben, den `js/dice.js` bisher per `prompt()`
  abgefragt hat. Wer sich im Hub anmeldet, wird von der Würfelleiste auf der Karte also ohne
  zweite Abfrage erkannt. Dazu neu: `pnp_player_id` (dauerhaft, im Gegensatz zur bestehenden
  `sessionStorage.korsaren_session_id`, die nur pro Tab-Sitzung gilt und für Terminplanung
  deshalb nicht taugt).
- **Verfügbarkeits-Kalender statt Terminabstimmung** (Hendriks Vorgabe): Raster über die
  nächsten 14 Tage in 30-Minuten-Schritten, mit der Maus bzw. per Wischen zu bemalen. Der Hub
  sucht daraus das **beste zusammenhängende Fenster** (Vorgabe 3,5 h, umstellbar 2–5 h):
  für jeden Tag und jeden möglichen Start wird gezählt, wer das *ganze* Fenster über kann.
  Sortierung: mehr Leute schlägt früher. Je Tag wird nur das beste Fenster gezeigt, sonst
  stünden dort ein Dutzend sich überlappender Varianten desselben Abends. Ein Fenster lässt
  sich als „Nächste Sitzung" festlegen (`termine/gewaehlt`).
- **Neuer Firebase-Pfad `termine`** (config / spieler / verfuegbar / gewaehlt) — in
  `firebase-rules.json` ergänzt, damit sind es **18 freigegebene Pfade**.
  **⚠ Muss in der Firebase-Konsole neu veröffentlicht werden**, sonst schlagen alle
  Termin-Schreibzugriffe still fehl. Der Hub erkennt genau diesen Fall und zeigt statt eines
  stummen Fehlers einen Hinweis mit Verweis auf die Regeldatei.
- **Fehlende Verfügbarkeit heißt „kann nicht", nicht „unbekannt"** — bewusst so, weil ein
  Kalender, der Schweigen als Zustimmung deutet, falsche Termine vorschlägt. Wer nichts
  einträgt, taucht in der Anwesenden-Liste als „nichts eingetragen" auf.
- **SL-Seiten bewusst nicht verlinkt** und **ihre Dateinamen stehen auch nicht im Quelltext**:
  Sie sind allein durch ihre unbekannte Adresse geschützt, und `index.html` ist für jeden
  Spieler über „Seitenquelltext anzeigen" lesbar. Ein erster Kommentar im Code nannte sie
  ausdrücklich — beim Prüflauf aufgefallen und entfernt.
- **Getestet** (Node/`vm`, kein Browser verfügbar): 14 Prüfungen der Fenstersuche mit 0 Fehlern —
  Slot-Rechnung, genau passende vs. zu kurze Blöcke, Lücken brechen ein Fenster, bei Gleichstand
  gewinnt das frühere Fenster, fehlende Einträge zählen nicht mit, kurze Bitstrings werden
  aufgefüllt. Der Testlauf lässt `firebase.initializeApp` absichtlich werfen und belegt damit
  zugleich, dass die Seite ohne Datenbank nicht abstürzt.
  - **Zwei Testfehler, beide meine:** eine Erwartung war schlicht falsch (bei 2 h passt auch der
    frühere Block, das Ergebnis war korrekt), und `python` sieht den Pfad `/tmp` anders als die
    Git-Bash — Skriptdateien dort lassen sich nicht per Python-Heredoc nachbearbeiten.
- **[OFFEN]** Der Hub zeigt noch nicht an, ob gerade eine Sitzung läuft (`currentScene` wäre
  lesbar, bräuchte aber alle Szenendateien für den Klartext-Namen — für eine Startseite zu viel
  Ladelast). Ebenfalls offen, ob der Kalender-Horizont von 14 Tagen einstellbar sein soll.

### 2026-09-05 — Neuer Charaktererschaffer auf Savage-Worlds-Kern (`charakterbogen_sw.html`)
- **Anlass:** Das W100-System (Bibel 4.1) ist am Tisch nicht intuitiv, und der „schlechte Erfolg"
  war als bloßer Zahlenbereich nicht erzählbar. Neues System nach Hendriks Vorgabe: Werte sind
  **Würfelstufen d4–d12**, Zielzahl ist **immer 4**, nichts wird addiert.
- **Bänder (Hendriks eigener Entwurf, 1:1 übernommen):** Meisterschaft = **zwei Würfel**; beide
  ≥ 4 = guter Erfolg, einer = Erfolg, keiner → **einmal nachwürfeln** → gelingt er, ist es der
  **schlechte Erfolg**, sonst Misserfolg. Ungelernt = d4, und ein Erfolg zählt dort *immer nur*
  als schlechter Erfolg. Erschwernis/Bedrängnis senkt den Würfel je eine Stufe (statt Bandshift).
- **Warum die vier Bänder erhalten bleiben mussten:** In `js/regie.js` stehen **39× „Guter
  Erfolg", 26× „Normaler Erfolg", 24× „Schlechter Erfolg"** — rund 90 ausformulierte Ausgänge.
  Ein Drei-Stufen-System (Savage Worlds pur) hätte 24 davon verwaisen lassen. Ebenso sind die
  **Wertenamen Kanon** und wurden unverändert übernommen (Kampf 44×, Geschick 44×, Mechanik 40×,
  Handel 56×, Wahrnehmung 47× im Szenentext). Der Systemwechsel tauscht damit **nur die
  Mathematik, nicht den Abenteuertext**.
- **Neue Datei statt Umbau:** `charakterbogen.html` bleibt unangetastet (die gespielte Runde
  hängt daran), eigener localStorage-Schlüssel `kors_sw` statt `kors_s` — beide Bögen können
  nebeneinander existieren, ohne sich zu überschreiben.
- **Inhalt:** Punktbudget 5 Grundwerte / 15 Fertigkeiten / 2 Talentpunkte; Fertigkeiten kosten
  1 Punkt bis zum Leitwert, darüber 2 (Savage-Worlds-Prinzip). **12 Talente und 14 Handicaps**
  neu für das Setting geschrieben (Aufschlag, noch nicht abgesegnet) — mehrere greifen bewusst
  in bestehende Beats (`Aufbrausend` ↔ Provokation im spanischen Hafen, `Ehrenwort` ↔
  Säbel-Entscheidung). Abgeleitet: Parade, Robustheit, Seemannsglück; Zustand als
  Angeschlagen + 3 Wunden.
- **`GUT_AB_8` als abschaltbare Variante:** Voreinstellung `false` — der gute Erfolg gehört
  allein der Meisterschaft. Auf `true` erlaubt zusätzlich „ein Würfel zeigt 8+", öffnet die
  Stufe auch für Rohlinge, treibt Meisterschaft bei d10/d12 aber auf ~67/77 % gute Erfolge.
  **Offene Entscheidung Hendriks**, eine Zeile.
- **Getestet ohne Browser** (Playwright ist in dieser Umgebung nicht mehr installiert): Regelkern
  und Render-Funktionen per Node/`vm` mit aufzeichnendem DOM-Stub. 4 Vorlagen exakt im Budget
  (5/15), alle 11 Würfel-/Meisterschafts-Kombinationen summieren auf 1,0, Erschwernis unter d4
  macht die Probe unmöglich, 18 Struktur-Prüfungen im gerenderten Markup. 0 Fehler.
  - **Zwei echte Funde im Bau:** (1) Ich hatte eigenmächtig „ein Würfel ≥ 8 = gut" in die
    Meisterschaft eingebaut — das trieb den guten Erfolg bei d12 auf 77 % und entwertete das
    Band; auf Hendriks Regel zurückgeschnitten. (2) Alle vier Archetyp-Vorlagen lagen mit 18–22
    über dem 15-Punkte-Budget. Die Selbstkontrolle `pruefeVorlagen()` meldet so etwas jetzt in
    der Konsole und ist für Node-Tests exportiert.
  - **Testfehler dabei, zweimal derselbe Mechanismus:** Der `let`-deklarierte State `S` ist aus
    dem vm-Kontext heraus **nicht** überschreibbar (`ctx.S = …` legt nur eine Kontext-Eigenschaft
    an, die die Funktionen nicht sehen) — der erste Testlauf maß deshalb viermal dieselbe
    Vorlage. Verwandt mit der bereits dokumentierten TDZ-Falle. Prüfung läuft jetzt über die
    exportierte Funktion statt über direktes Setzen von `S`.
- **[OFFEN]** `karte.html` lädt weiterhin `charakterbogen.html` in den Spieler-Iframe (Zeile
  ~2051). Der Umschalter auf den neuen Bogen ist bewusst **nicht** gesetzt, solange die
  `GUT_AB_8`-Frage offen und das System nicht am Tisch erprobt ist.
- **[OFFEN]** `js/arena.js` rechnet weiter nach W100 (`arenaSchwellen`/`arenaBand`). Der Umbau
  gehört **vor** den geplanten Arena-Umbau (feste Zugreihenfolge, Spieler übernehmen Figuren per
  Code), sonst wird zweimal gebaut. (Bibel 4.1/4.2 ist am 14.10.2026 umgeschrieben.)

### 2026-08-25 — Firebase-Sicherheitsregeln als Datei (Testmodus lief ab)
- **Anlass:** Hendriks Meldung, der Firebase-Zugang laufe ab. Ursache sind die
  Standard-Testmodus-Regeln, die ein hartes Ablaufdatum enthalten
  (`".read": "now < <timestamp>"`); danach verweigert die Datenbank JEDEN Zugriff und
  `karte.html`/`regie.html` waeren tot. Es laeuft also kein Konto und kein Schluessel ab,
  sondern nur diese Regel.
- **Neue `firebase-rules.json`** als Referenz/Doku im Repo (wird NICHT automatisch deployt -
  Einspielen von Hand in der Firebase-Konsole). Kein Ablaufdatum mehr; Wurzel gesperrt, explizit
  freigegeben sind die **17 Pfade**, die die Anwendung tatsaechlich nutzt (aus dem Code
  erhoben: currentScene, sceneAudioFile, sceneCharacters, charStatus, hiddenMarkersLive,
  markerVariant, openMarkers, diceRolls, gmTimer, players, pcRuf, questDone, extraNpcs,
  extraGhosts, regie, graphState, arenaState).
  **Wichtig fuer kuenftige Features: jeder neue Top-Level-Pfad muss dort ergaenzt werden**,
  sonst schlaegt sein Schreibzugriff still fehl.
- Der Multi-Path-`update()`-Stil der Arena (ein `db.ref().update()` von der Wurzel) funktioniert
  mit den gescopeten Regeln: Firebase prueft jeden Pfad der Sammel-Aktualisierung einzeln, ein
  Schreibrecht auf der Wurzel ist dafuer nicht noetig.
- **Bewusst weiterhin ohne Anmeldung:** `js/firebase-config.js` liegt im oeffentlichen Repo, die
  Datenbank-URL ist also bekannt - die Regeln begrenzen nur, WOHIN geschrieben werden kann, nicht
  VON WEM. Nachruestbar mit anonymer Firebase-Anmeldung (`signInAnonymously()` je Seite +
  `"auth != null"` in den Regeln); als offener Punkt in ARENA-ENDKAMPF.md 9.2 vermerkt.

### 2026-08-23 (Fortsetzung 7) — Schlachtfeld-Hintergrund eingebunden
- **`BattleField.jpg` -> `interior_ritualkammer_schlachtfeld.webp`** (2,1 MB -> 101 KB,
  **1600x1600** - quadratisch wie das 16x16-Brett) und als `hintergrund` in
  `ARENA_SCENES["15.1"]` eingetragen. Das Bild trifft den Prompt: senkrechte Draufsicht,
  ruhiger dunkler Boden, Pfeilerfuesse als Rahmen, Anhoehe mit Jessica im unteren Drittel als
  hellster Punkt. Die bisherige Seitenansicht (interior_ritualkammer.webp) bleibt das Marker-
  Bild der Szene 13.1 - sie passte perspektivisch nicht unter senkrecht stehende Spielfiguren.
- Roh-JPG nach Sichtpruefung entfernt. Der Hintergrund-Tausch fasst arenaState nicht an -
  laufender Kampfstand und eingetragene Werte bleiben erhalten (siehe Fortsetzung 4).

### 2026-08-23 (Fortsetzung)
- **Porträt des Seelenlosen eingebunden** (von Hendrik generiert, nach dem Prompt in
  `BILD-PROMPTS.md`, Abschnitt „4. Der Seelenlose"): `Seelenloser.jpg` → auf die
  Porträt-Namenskonvention umbenannt (`Der_Seelenlose.jpg`, **ohne** `interior_`-Präfix, damit
  `cap_for()` korrekt auf 900px statt 1600px kappt) → `images/Der_Seelenlose.webp`
  (2,4 MB → **49 KB**, 672×900). Als achter Eintrag in `js/characters.js` registriert und damit in
  der Charakter-Leiste von `13.1` ein-/ausblendbar. **Bewusst kein `charaktere`-Feld an
  `SZENEN_REGIE["13.1"]`** — die Szene schränkt die Leiste nicht ein, er ist dort also ohnehin
  wählbar; eine Einschränkung hätte umgekehrt die übrigen Figuren aus der Leiste geworfen.
- **Kopf-Ausschnitt als Arena-Token**: `images/token_seelenloser.webp` (256×256, 7 KB), aus dem
  Porträt geschnitten (Schädel inkl. Kapuze). Dafür ein neues **optionales `bild`-Feld an
  Arena-Figuren**: `arenaTokenEl()` (`karte.html`) und `tokenEl()` (`arena_admin.html`) rendern ein
  `<img>`, das den runden Token ausfüllt, statt des Textsymbols; `symbol` bleibt als Rückfallwert
  bestehen und alle übrigen Figuren verhalten sich unverändert. Eingetragen in
  `ARENA_SCENES["15.1"].vorlagen.seelenloser` (`js/arena_scenes.js`). Der farbige Rand, das
  Namensschild und die HP-Leiste liegen weiterhin über bzw. um das Bild.
  - Offline mit Playwright verifiziert (`pnp-safe-test`, 0 Fehler): beide Bilder per HTTP
    erreichbar, `CHARACTERS` enthält den Eintrag, `13.1` listet ihn, alle sieben
    Ritualkammer-Interaktionen vorhanden, und beide Token-Renderer liefern mit `bild` ein `<img>`
    und ohne `bild` weiterhin das Symbol. Zusätzlich per Screenshot gegengeprüft.
  - Die Roh-JPG `images/Der_Seelenlose.jpg` liegt weiterhin unversioniert im Ordner — nach eigener
    Sichtprüfung **nicht** committet (2,4 MB), Löschen bleibt wie üblich Hendriks Handgriff.

### 2026-08-23 (Fortsetzung 5) — Saebel: jeder Treffer toetet Diener sofort
- **Hendriks Regel:** Mit dem Jaguar-Saebel ist jeder Treffer gegen normale Diener sofort
  toedlich - unabhaengig von Schadenswert und Rest-HP, sobald das Band kein Misserfolg ist.
  Vorher musste der Saebel die HP regulaer auf 0 bringen. Umgesetzt in arenaAngriff()
  (js/arena.js), gilt damit in allen drei Ansichten. Misserfolg toetet weiterhin nicht, gegen
  den Seelenlosen zaehlt der Saebel normal, und der endgueltige Tod (Token verschwindet, kein
  Wiederaufstehen) bleibt wie gehabt.
- Engine-Test um vier Faelle erweitert (Treffer mit "schlechtem Erfolg" toetet vollen Diener /
  Miss toetet nicht / ohne Saebel normaler Schaden / Boss nimmt normalen Schaden). Handbuch 4.5
  entsprechend umgeschrieben. 0 Fehler in allen Arena-Tests.

### 2026-08-23 (Fortsetzung 4) — Kampfwerte je Figur editierbar
- **Anlass Hendriks Einwand "Aber Spieler haben ja unterschiedliche Kampfwerte"** - bis dahin
  bekam jede Spieler-Figur die Einheitswerte der Vorlage. Die Charakterboegen liegen nur im
  localStorage der jeweiligen Spieler-Browser (charakterbogen.html), die SL kommt an die Werte
  nicht heran - also traegt sie sie einmal pro Figur ein.
- Schlachtfeld-Auswahlpanel (arena_admin.html): Zahlenfelder fuer nahWert/nahSchaden/fernWert/
  fernSchaden/hpMax plus Mastery-Haken, onchange direkt nach Firebase (wertSetzen()/
  masteryUmschalten()). Grenzwert-Klemmung (Werte 0-10, Schaden 0-20, hpMax 1-99); hpMax
  runtersetzen kappt aktuelle HP mit. Anzeige der Trefferchance (Wert x 10 %) zur Kontrolle,
  inkl. "Fern 0 = kann nicht schiessen".
- Test erweitert: Werte setzen, Klemmung, hpMax-Kappung, und dass die Engine den editierten
  Wert tatsaechlich nutzt (Wurf 99 bei Wert 10 = Schwelle 100 -> kein Miss). 0 Fehler.

### 2026-08-23 (Fortsetzung 3) — Namensschilder, Harwick mittig, Engine-Fix
- **Helden-Seite immer beschriftet** (Hendriks Vorgabe "die Namen sollten dran stehen, zumindest
  von den freundlichen"): Spieler + Verbuendete tragen ihr Namensschild jetzt in BEIDEN Ansichten
  dauerhaft; Gegner ("Diener") bleiben Tooltip - ihre Schilder wuerden bei 16x16 nur
  uebereinanderliegen.
- **Harwick startet beim "Aufbauen" in der Feldmitte** (beide Aufbau-Funktionen: arena_admin.html
  und regie_vault.js) - er steht beim Ritual an der Anhoehe, nicht bei der Gruppe am Eingang.
- Der Wunsch "neue Spieler erst mal frei platzieren" ist durch den vorhandenen Versetzen-Modus
  abgedeckt (von Hendrik bestaetigt), keine Zusatzmechanik gebaut.
- **Engine-Fix, vom erweiterten Test aufgedeckt:** Figuren mit fernWert 0 konnten auf Distanz
  "schiessen" - Schwelle 0 laesst zwar nie gut/normal zu, aber mit Mastery blieb das Band
  "schlechter Erfolg" (1-50) offen; der Seelenlose schoss mit Mindestschaden, obwohl er keine
  Fernwaffe hat (Logzeile "Der Seelenlose schiesst auf Harwick"). Fix in arenaAngriffsart():
  Fernkampf setzt fernWert > 0 voraus - wirkt auf alle drei Ansichten. Fehlergeschichte Nr. 6 in
  ARENA-ENDKAMPF.md.

### 2026-08-23 (Fortsetzung 2) — SL-Schlachtfeld und Steuerungshoheit
- **Neue Seite `arena_admin.html`** (Hendriks Wunsch: eine eigene Battlefield-Adminseite fuer den
  Endkampf). Vollbild-Schlachtfeld fuer die SL: Entitaet anklicken -> ausgewaehlt -> markierte
  Felder anklicken = bewegen, umrandete Gegner anklicken = angreifen. Seitenpanel mit HP (+/-,
  setzen), Waffe laden/entladen, Freigabe (nur Spieler-Figuren), Saebel geben/wegnehmen,
  Entfernen. Kopfleiste: Runde weiter, Aufbauen, Nachsetzen aller vier Typen, und ein
  **Versetzen-Modus** (Figur frei auf ein beliebiges Feld, ohne Bewegungsregel, ohne
  Zugverbrauch) - zugleich Ersatz fuer das fehlende Rueckgaengig und Werkzeug fuer die
  Aufstellung. Zugriffsschutz wie regie.html (nur ueber die bekannte URL). Anders als die
  Spieleransicht zeigt die Seite den Saebeltraeger offen an (SL-exklusiv).
- **Steuerungshoheit klar getrennt** (Hendriks Vorgabe "Spieler sollen nur Spieler bewegen
  koennen"): `karte.html` laesst Spieler nur noch Figuren vom Typ `spieler` steuern - selbst
  wenn versehentlich ein Gegner freigegeben wuerde, sehen Spieler nur "... handelt ..." und
  koennen nichts anklicken. Alles andere zieht die SL auf dem Schlachtfeld.
- **Neuer Figurentyp `verbuendeter`** (mitkaempfende NSC wie Harwick/Cormac): kaempft per
  `arenaSeite()` auf der Helden-Seite (Freund/Feind- und Bedraengnis-Logik), wird aber
  ausschliesslich von der SL gesteuert. Symbol ⚓, eigene Vorlage in `arena_scenes.js`; Saebel
  kann auch einem Verbuendeten gegeben werden (laut Finale wird er ggf. Harwick in die Hand
  gedrueckt). `arenaIstFeind()` haengt jetzt an der Seite statt an `typ === 'spieler'`;
  `arenaIstSpieler()` bleibt fuer die Steuerungsfrage.
- Kompakt-Panel in `regie_vault.js` entsprechend: Freigabe-Knoepfe nur noch an Spieler-Figuren
  (Rest als "SL"-Zeilen ohne Klick), "+ Verbuendeter"-Knopf, Link auf das Schlachtfeld.
- Neuer Playwright-Test fuer die Adminseite (Aufbau, Verbuendeter landet auf der Helden-Seite,
  Gegner-Auswahl ohne Freigabe-Knopf, SL-Bewegung und -Angriff per Klick, Versetzen,
  Log-Verdeckung des Saebels, und in der Spieleransicht: freigegebener Spieler steuerbar,
  freigegebener Gegner NICHT). Engine-Test um die Seiten-Logik erweitert. Alle 6 Testskripte
  mit 0 Fehlern. **Testfehler dabei:** der Boss hatte im Test genau den Spieler getoetet, der
  anschliessend freigegeben wurde - tot ist zurecht nicht steuerbar; Test nimmt jetzt einen
  lebenden.
- ARENA-ENDKAMPF.md nachgezogen: Dateien-Tabelle, neue Sektion Steuerungshoheit (4.1),
  Vorlagen-Tabelle mit Verbuendetem, Saebel-Ausnahme fuer die SL-Seite.

### 2026-08-23 (Fortsetzung) — Audit von ARENA-ENDKAMPF.md
- **Handbuch gegen den Code geprueft** (jede pruefbare Behauptung nachgerechnet: Interaktionskette
  des Finales, Engine-Exporte, Regelwerte, Vorlagen-Tabelle, Bibel-Beispiel, Saebel-Regel,
  Boss-Kopplung, Registry-Verdrahtung, TDZ-Fix, fbKey, Log-Verdeckung). Zwei echte Funde:
  - **`arenaBossLebt()` fehlte in `module.exports`** von `js/arena.js` - per Edit nach dem
    Export-Block ergaenzt und dort nie nachgetragen. Im Browser unauffaellig, fuer Node-Tests
    unerreichbar. Nachgetragen; als Fehlergeschichte Nr. 4 im Handbuch dokumentiert.
  - **`arenaAufbauen()` stellte NSC als Spielerfiguren auf**: `CHARACTERS` (js/characters.js)
    sind die sieben NSC, nicht die Spielercharaktere - sichtbar an Testzuegen wie "James Harwick
    schiesst auf Der Seelenlose". Aufbau setzt jetzt generische "Spieler 1-4" (die SL benennt
    ueber "+ Spieler" selbst; mitkaempfende NSC kommen auf demselben Weg). Der in Handbuch 9.2
    als "ungeprueft" markierte Punkt ist damit geklaert und dort als behoben vermerkt
    (Fehlergeschichte Nr. 5).

### 2026-08-23 — Kampf-Arena für den Endkampf (Szene `15.1`)
- **Neuer Szenentyp „Arena"** (Hendriks Wunsch: den Endkampf wie in einem CRPG spielen).
  `arena: true` in `js/arena_scenes.js` schaltet `karte.html` auf ein Raster statt der
  Marker-Karte um — dasselbe Muster wie beim Abspann, MAP_REGISTRY bleibt unangetastet.
  Hintergrund ist das Ritualkammer-Bild.
- **Verhältnis zum Text-Finale (wichtig):** Die Arena ersetzt den Ablauf aus
  `ORTE.die_ritualkammer` nicht. Die Kernbeats (Wats und Josiahs Tod, Harwicks Anklage, die
  Entscheidung um den Säbel) bleiben fest und werden von der SL ausgelöst — **die Arena bestimmt
  nur, wie teuer der Weg dorthin wird, nicht ob die Beats geschehen.** Deshalb gibt es bewusst
  keine Siegbedingung und keinen Automatismus, der den Kampf beendet, und die SL kann jederzeit
  Figuren setzen, entfernen und HP von Hand ändern.
- **Regel-Engine als eigene Datei** (`js/arena.js`, ohne DOM und ohne Firebase): rechnet nach dem
  Probensystem der Bibel (4.1) — `Schwelle = Wert × 10`, vier Bänder, ohne Mastery entfällt
  „schlechter Erfolg" ohne die Zahlenschwellen zu verschieben (4.2), Bedrängnis verschiebt je
  zusätzlichem angrenzenden Gegner um ein Band (4.4). Per Node-Test gegen das Bibel-Beispiel
  (Wert 5 → 1-25/26-50/51-75/76-100) auf allen 100 Würfen abgeglichen, 0 Abweichungen.
- **Ablauf:** Die SL gibt reihum **eine** Figur frei; solange sie frei ist, darf **jeder** Spieler
  sie bewegen (Reichweite) und mit ihr angreifen. Die Angriffsart ergibt sich aus der Entfernung —
  angrenzend Nahkampf, sonst Fernkampf; es gibt keine Wahl. Nach einem Schuss ist die Waffe leer
  (Anzeige am Token) und erst in der übernächsten Runde wieder bereit.
- **Der Seelenlose ist die Quelle des Nachschubs** (Hendriks Vorgabe): solange er lebt, stehen
  normal getötete Diener nach 2 Runden wieder auf und alle 3 Runden erscheinen neue. **Fällt er,
  hört beides auf** — damit ist er das eigentliche Ziel und nicht nur der dickste Gegner.
- **Der Jaguar-Säbel** tötet Diener endgültig (sie verschwinden statt aufzustehen). Wer ihn
  trägt, trägt die SL im Panel ein; **den Spielern wird das nie angezeigt** und das Kampf-Log
  erwähnt ihn bewusst nicht — sonst ließe sich der Träger daran ablesen.
- **Spieler schreiben hier erstmals echten Spielzustand** (`arenaState/{sceneId}`: `runde`,
  `freigegeben`, `saebeltraeger`, `tokens/{id}`, `log/{id}`) — anders als beim Erkundungs-Graphen,
  wo nur die SL `currentNode` setzt. Sonst müsste die SL jeden Schritt nachklicken, was den Sinn
  der Arena aufhöbe; die Kontrolle bleibt über die Freigabe (ohne freigegebene Figur ist nichts
  anklickbar). Alle Schreibvorgänge laufen als **ein** `update()` von der Wurzel, damit der
  Live-Listener nicht auf halben Zwischenständen feuert.
- **Zahlen:** 8×8-Feld, 2 Felder Bewegung (Hendriks Vorgabe); Reichweiten, HP und Schaden sind
  ein erster Aufschlag in `ARENA_SCENES['15.1'].regeln`/`vorlagen` und je Figur im Panel änderbar
  — die Bibel kennt keine Kampfwerte, nur „Schadenspunkte" als kleine ganze Zahlen.
- **Wieder in die TDZ-Falle getappt** (steht seit 08/2026 in diesem Changelog): die neuen
  `let`-State-Variablen standen zunächst bei den Arena-Funktionen weiter unten in
  `js/regie_vault.js` — der Firebase-Init-catch-Zweig ruft `renderAll()` aber synchron auf, und
  das Adminpanel brach mit „Cannot access 'arenaStateScene' before initialization" ab. Nach oben
  zu den übrigen State-Variablen verschoben.
- Zwei Testskripte: Regel-Engine gegen die Bibel (Node, 0 Fehler) und ein Integrationstest über
  beide Ansichten mit Fake-Firebase (Aufbau, Freigabe, Bewegung inkl. Sperre nach dem Zug,
  Angriff mit Log, Rundenwechsel, Aufräumen beim Szenenwechsel — 8 Prüfungen, 0 Fehler), dazu
  Screenshot-Kontrolle.
- **[OFFEN]** Feinschliff nach dem ersten Testlauf: Werte (HP/Schaden), und ob der Seelenlose
  eigene Fähigkeiten jenseits des Zuschlagens und Beschwörens bekommt.

#### Nachtrag am selben Tag: 16×16 und Figuren nachsetzen
- **Feld von 8×8 auf 16×16** (Hendriks Vorgabe), Bewegung bleibt bei 2 Feldern. Mitgezogen:
  - **Fernkampfreichweite 4 → 6.** Das Brett hat die vierfache Fläche, die Bewegung ist gleich
    geblieben — 4 Felder wären dort sehr kurz. Ist ein Vorschlag, keine Vorgabe, und steht als
    solcher im Kommentar.
  - Startaufstellung verteilt sich jetzt über die Grundlinie statt zusammengedrängt am linken
    Rand zu stehen (bei 16 Feldern Breite wäre eine Viererkette unbrauchbar).
  - Darstellung: mehr Bildhöhe für das Brett, Mindest-Feldgröße 18px. **Namensschilder erscheinen
    nur noch ab 44px Feldgröße** — bei 16×16 überlagerten sie sich sonst gegenseitig; der Rest
    bekommt den Namen als Tooltip. **Ausnahme: die gerade freigegebene Figur ist immer
    beschriftet** — wer am Zug ist, muss man sehen können, ohne zu raten.
- **Figuren lassen sich jederzeit nachsetzen** (Hendriks Anforderung „Ich muss Spieler hinzufügen
  können"): drei Knöpfe im Panel (+ Spieler mit Namensabfrage, + Diener, + Seelenloser).
  `arenaFigurHinzu()` sucht ein freies Feld auf der passenden Seite — Spieler von der unteren
  Grundlinie nach innen, Gegner von der oberen — und weicht bei Bedarf aus. Damit ist die Arena
  auch dann brauchbar, wenn Spieler später dazustoßen oder im Finale Figuren mitten im Kampf
  hinzutreten.
- Tests erweitert (Feldzahl 256, Hinzufügen inkl. Prüfung auf doppelt belegte Felder und richtige
  Spielfeldhälfte). **Testfehler dabei:** die Randfeld-Prüfung war auf 8×8 hartcodiert und schlug
  nach der Vergrößerung fehl — auf `regeln.breite/hoehe` umgestellt.

### 2026-08-23
- **Grabesinsel-Finale (Bibel 12.1) komplett ausformuliert** — Inhalt in einer reinen
  Sparring-Session mit Hendrik entwickelt (keine Codeänderungen während des Sparrings; erst danach
  in `js/regie.js` übertragen). Sechs neue Interaktionen an `ORTE.die_ritualkammer`:
  `der_beginn_des_rituals` (Cormac drückt Jessica vor dem Ritual ein Holzschwert in die Hand —
  „Was auch immer gleich passiert. Hiermit kämpfst du dich zurück, wie es schon immer war." —,
  Harwick beginnt das Ritual mit dem Artefakt aus `9.1`, es scheitert) → `die_ersten_wellen`
  (Kampfbeginn, der Jaguar-Säbel schickt Seelen zurück, aber die Zahl der Toten schwindet nicht) →
  `wat_und_josiah_fallen` (Wat opfert sich für einen bedrängten Spieler, Der Seelenlose spricht
  zum ersten Mal — „Kein Toter verlässt je diese Insel." —, Josiah stirbt beim Versuch, Wat zu
  helfen) → `die_zermuerbung` (modulare Ereignisse, u. a. ein Introll-Hinweis für den Löser des
  Riffinsel-Grotten-Rätsels: der Jaguar als „Wandler zwischen den Welten") → `harwicks_anklage`
  (Rückzugsbefehl, Der Seelenlose wirft Harwick vor, seine Trauer sei Egoismus, der seine Tochter
  nicht ruhen lässt) → `die_entscheidung_um_den_saebel` (drei gleichwertige Ausgänge je nachdem,
  wem der Säbel übergeben wird: an Jessica — sie befreit sich selbst, Harwick überlebt und begräbt
  die Toten eigenhändig; an Harwick — er dominiert kurz, opfert sich dann, Jessicas Schicksal
  bleibt bewusst unausgesprochen; an niemanden — Harwick stirbt unter dem Spott Der Seelenlosen).
  - Zusätzlich: Josiahs Entschluss, trotz fehlender Kampferfahrung mit auf die Insel zu kommen, als
    neuer, nicht verhandelbarer Beat in `ORTE.grabesstrand.die_letzte_frage` ergänzt (keine Probe
    hält ihn zurück — Rollenspiel-Versuche sind erlaubt, ändern das Ergebnis aber nicht).
  - **Bewusst NICHT Teil dieser Änderung:** eine interaktive Kampf-„Arena" (Positionen/Zonen, in
    denen Spieler während des Endkampfs aktiv wie in einem CRPG agieren können) — Hendrik baut
    diese separat in einer anderen, technischen Session. Als inhaltliche Leitplanke dafür
    festgehalten (siehe Kommentar-Header in `js/grabesinsel_scenes.js` und das Sparring-
    Plandokument `in-einer-anderen-session-idempotent-lynx.md`): Die Kernbeats (Wats/Josiahs Tod,
    die Anklage-Rede, die Drei-Wege-Entscheidung) sollen fix bleiben, unabhängig von taktischem
    Spiel — die Arena soll nur steuern, wie teuer der Weg dahin wird, nicht OB diese Beats
    geschehen.
  - `node --check js/regie.js` sauber. Kein Playwright-Test nötig (keine neuen Marker/Szenen,
    reine `ORTE.interaktionen`-Ergänzung, Fall 1 aus Skill `pnp-scene`).

### 2026-08-22 (Fortsetzung 29)
- **Abspann-Bildliste entfällt — die Bilder werden automatisch gesammelt** (Hendriks Frage: „muss
  das für jedes einzelne definiert sein?"). Antwort: nein. `sammleSzenenBilder()` in `karte.html`
  läuft über alle geladenen Szenendateien und nimmt Hintergründe, Marker-Bilder, Bildvarianten
  und `imgOverrides` mit, dazu `GOLDEN_LION_MARKERS_BASE`. Ergebnis: **51 von 51** Nicht-Porträt-
  Bildern aus `images/` — keines fehlt, keiner der Pfade ist verwaist. Neue Szenen und neue
  Ortsbilder tauchen ab sofort von selbst im Abspann auf.
  - **Den `images/`-Ordner direkt auslesen geht nicht**: die Seite ist statisch (GitHub Pages),
    ein Browser bekommt kein Verzeichnis-Listing. Der Umweg über die Szenendaten liefert dieselbe
    Menge und lässt verwaiste Dateien zusätzlich draußen.
  - `js/abspann_scenes.js` ist dadurch von ~120 auf ~65 Zeilen geschrumpft, die Szene wird jetzt
    über `abspann: true` erkannt statt über das Vorhandensein der Liste. Optional weiterhin
    möglich: `mitPortraits` (nimmt die 7 NSC-Porträts dazu → 58 Bilder), `zusatzBilder`,
    `ohneBilder`, und `slideshow` als feste Liste, die die Automatik ganz ersetzt.
  - **Zwei Bugs beim Bauen, beide vom Vergleichs-Test gefunden:**
    1. *Flacher Scan übersah `marker.variants.leer.img`* (zwei Ebenen tief,
       `interior_frachtraum_leer.webp`) — Scan rekursiv gemacht.
    2. *`forEach(ausMarker)` reicht den Index als zweites Argument durch.* Der landete im neuen
       Tiefen-Parameter, wodurch **alles ab dem fünften Marker einer Szene stillschweigend
       übersprungen** wurde (4 Bilder fehlten). Auf `forEach(function (m) { ausMarker(m, 0); })`
       umgestellt.
  - Test um zwei Prüfungen erweitert: Abgleich der Automatik gegen das tatsächliche
    Verzeichnis (keine übersehenen, keine nicht existierenden Pfade) und dass `mitPortraits`
    zusätzliche Bilder liefert. 10 Prüfungen, 0 Fehler.

### 2026-08-22 (Fortsetzung 28)
- **Abspann-Feinjustage** (Hendriks Vorgaben): `gleichzeitig` von 4 auf **6**, Standzeit von 7 auf
  **11 s**, Ein-/Ausblendzeit von 2,5 auf **4 s** — die Bilder stehen länger und tauchen deutlich
  langsamer auf.
- **Neuer fester Schriftzug „Vielen Dank"** unten im Bild (`dankText` in
  `js/abspann_scenes.js`, also pro Szene änderbar): Georgia kursiv, gold, weit gesperrt, mit
  dunklem Verlauf darunter, damit er auch über einem hellen Bild lesbar bleibt. Blendet einmalig
  über 3,5 s ein und bleibt dann stehen. Liegt mit `z-index: 40` über allen Bildebenen (1–10).
- **Zwei Layout-Korrekturen, die dabei nötig wurden:**
  - *Bildgröße skaliert jetzt mit der Ebenenzahl* (`Math.sqrt(4 / anzahl)`, 4 Ebenen als
    Referenz). Bei 6 gleichzeitigen Bildern in Originalgröße hätten sie einander zugedeckt statt
    sich nur zu überlappen.
  - *Vertikale Verteilung über abwechselnde Bänder* (gerade Ebenen oben, ungerade unten). Bei rein
    zufälliger Höhe landeten regelmäßig fast alle Bilder in derselben Bildhälfte und die andere
    blieb leer — per Screenshot aufgefallen. Unten bleibt zusätzlich Platz für den Schriftzug
    (Bilder enden spätestens bei 78 vh).
- Test um eine Prüfung auf den Schriftzug erweitert (Text, Einblendung, Verankerung am unteren
  Rand) — 8 Prüfungen, 0 Fehler. **Testfehler dabei:** die Prüfung stand zunächst hinter dem
  Szenenwechsel-Test, wo der Abspann längst abgebaut war; nach hinten verschoben.

### 2026-08-22 (Fortsetzung 27)
- **Abspann von Diashow auf Collage umgebaut** (Hendriks Korrektur: „mehrere Bilder gleichzeitig
  in zufälliger Reihenfolge ein- und ausblenden, sich ein wenig überlappen, aber vor allem
  szenenübergreifend"). Der erste Entwurf zeigte ein Bild nach dem anderen in
  Kampagnen-Chronologie — genau das Gegenteil.
  - **Mehrere Ebenen gleichzeitig** (`gleichzeitig: 4`, pro Szene einstellbar). Die Ebenen werden
    dynamisch erzeugt statt fest im Markup zu stehen. Jede läuft in **ihrem eigenen Rhythmus**:
    versetzter Start (`slot * stand/anzahl`) und je Ebene um ±25 % variierte Standzeit — sonst
    wäre es wieder eine Diashow, nur mit mehreren Bildern gleichzeitig.
  - **Zufällig und szenenübergreifend**: Fisher-Yates über die **ganze** Bildliste, nicht
    innerhalb der Szenen. Ist die Liste durch, wird neu gemischt — damit kommt garantiert jedes
    Bild vor, bevor sich etwas wiederholt. `abspannSichtbar` verhindert, dass dasselbe Bild
    zweimal gleichzeitig hängt.
  - **Überlappung**: jede Ebene bekommt zufällige Größe (30–46 vw × 34–50 vh), eine über die
    Breite verteilte Grundposition mit Streuung, leichte Drehung (±2,5°) und zufälligen
    `z-index`. Schlagschatten, damit sich überlappende Bilder auf Schwarz voneinander abheben.
  - Die Sequenz **läuft endlos**, bis die SL die Szene wechselt — bei einer Collage gibt es kein
    natürliches Ende wie bei einer Diashow. Die Bildliste ist damit nur noch ein Vorrat; sie steht
    weiterhin chronologisch da, aber ausschließlich der Pflege wegen.
  - Test entsprechend umgebaut (7 Prüfungen, 0 Fehler): max. 4 gleichzeitig sichtbar, **nie ein
    Bild doppelt**, alle 51 Bilder innerhalb des Testfensters gesehen, **9 verschiedene
    Szenengruppen** vertreten (Beleg für „szenenübergreifend"), sauberes Aufräumen beim
    Szenenwechsel, Ton-Steuerung erreichbar. Per Screenshot gegengeprüft.

### 2026-08-22 (Fortsetzung 26)
- **Neue Abschluss-/Erinnerungsszene `14.1` „Abspann"** (Hendriks Wunsch): Nach dem Finale laufen
  alle Bilder des Abenteuers noch einmal durch und blenden ineinander.
- **Dafür ein neuer Szenentyp** (`js/abspann_scenes.js`): Die Szene hat **keine Marker und keinen
  Hintergrund**, sondern ein Feld `slideshow` (Liste von Bildpfaden) plus `slideDauer`/
  `blendDauer`. `renderScene()` in `karte.html` erkennt das Feld und zeigt statt der Marker-Karte
  eine bildschirmfüllende Überblend-Sequenz (`startSlideshow()`, zwei gestapelte `<img>`-Ebenen,
  die sich abwechseln). Das MAP_REGISTRY-Muster bleibt unangetastet — jede andere Szene verhält
  sich unverändert; `getMarkers` liefert für diese Szene bewusst `[]` statt `null`, damit sie als
  bekannte Szene gilt, aber keine Marker rendert.
  - **51 Bilder in Kampagnen-Chronologie**, nicht in Dateiordnung: Grimsgate → Golden Lion →
    Sturm → Schatzinsel → Spanischer Hafen → Schmugglernest → Artefakthandel → Riffinsel →
    Einberufung → Grabesinsel. Alle Pfade per Test gegen das Dateisystem geprüft (0 fehlend,
    keine Doppelten). Am Ende blendet die Sequenz nach Schwarz und **bleibt dort stehen** (kein
    Loop) — ein Abspann soll enden.
  - `soundFile: "ending.ogg"` als Voreinstellung; zusammen mit dem Live-Wechsel aus Fortsetzung 25
    läuft der Ton beim Umschalten automatisch über.
  - **`#audioControl` von `z-index: 60` auf `410` gehoben** — der Abspann liegt bei 400, und die
    Spieler müssen ausgerechnet während einer 7-Minuten-Musiksequenz stummschalten und die
    Lautstärke regeln können. Per Test mit `elementFromPoint` abgesichert.
  - Beim Betreten der Szene werden Marker, offene Overlays und der Erkundungs-Listener sauber
    abgeräumt (`clearMarkers()`, `clearOpenMarker()`, `attachGraphStateListener(null)`) — sonst
    blieben die Marker der Vorszene unsichtbar im DOM liegen, samt Präsenz-Einträgen. Beim
    Verlassen stoppt `stopSlideshow()` Timer und Ebenen.
  - `SZENEN_REGIE["14.1"]` mit SL-Hinweisen (nichts anklicken lassen, laufen lassen, Tempo über
    `slideDauer`/`blendDauer` regelbar — Standard ergibt bei 51 Bildern gut 7 Minuten).
  - Registry an allen sechs Stellen ergänzt; neuer Playwright-Test (6 Prüfungen, 0 Fehler) und
    Screenshot-Kontrolle.
  - **[OFFEN]** Hendrik wollte „eventuell noch 2-3 extra erstellte" Abschlussbilder — dafür ist
    am Ende der Liste ein kommentierter Platz vorgesehen, Inhalte stehen noch aus.

### 2026-08-22 (Fortsetzung 25)
- **Musik lässt sich jetzt LIVE wechseln, ohne dass Spieler neu laden** (Hendriks Wunsch für das
  Finale: erst `ritual`, dann `temple`, am Ende `ending`). Das Adminpanel schrieb den Wechsel
  schon immer nach `sceneAudioFile/{szene}` — `karte.html` las den Wert aber mit **`.once()`**,
  also nur beim Szenenwechsel. Ein Wechsel innerhalb derselben Szene kam bei laufenden
  Spieler-Seiten schlicht nicht an.
  - `resolveSoundForScene()` durch **`attachSceneAudioListener()`** ersetzt: ein `on('value')`
    auf `sceneAudioFile/{szene}`, sauber ab-/angehängt beim Szenenwechsel (gleiches Muster wie
    `renderCharacterRail()`). Firebase-Wert hat weiter Vorrang; wird er gelöscht, greift wieder
    das statische `soundFile` der Szene.
  - **Sanftes Überblenden statt hartem Schnitt** (`runAudioFade()`, 1,2 s aus / 1,2 s ein) —
    mitten in einer laufenden Szene wäre ein harter Wechsel sonst unangenehm auffällig.
  - **Zwei echte Bugs, die der Test gefunden hat:**
    1. *Fade zählte feste Schritte.* Browser drosseln `setInterval` in nicht sichtbaren Tabs auf
       ~1×/Sekunde — 24 Schritte hätten dort 24 Sekunden gedauert. Jetzt zeitbasiert über
       `Date.now()`: notfalls in wenigen groben Sprüngen, aber nach 1,2 s Wandzeit sicher fertig.
    2. *Verspätete `play()`-Promises haben den Wechsel verschluckt.* Das Promise des VORIGEN
       Titels löste erst nach dem nächsten Wechsel auf, startete seinen Einblend-Fade, killte
       damit den laufenden Ausblend-Fade **samt dessen Callback** — und der Titelwechsel fiel
       still unter den Tisch. Genau der Fall, wenn die SL zügig hintereinander umschaltet. Behoben
       mit einem Generations-Token (`audioSwapToken`), das verspätete Callbacks verwerfen lässt.
  - Neuer Playwright-Test (Fake-`db`, rein lokal) prüft: Offline-Fallback aufs statische Feld,
    Live-Wechsel `ritual`→`temple`→`ending` ohne Reload, Rückfall auf den Default beim Löschen des
    Werts, sauberes `off()` beim Szenenwechsel, und dass ein identischer Wert keinen Fade auslöst.
    0 Fehler. **Testhinweis:** feste Sleeps taugen hier nicht (Timer-Drosselung), es wird aktiv
    gepollt.
- **`ending.ogg` auf 45 Minuten gekürzt** (Hendriks Vorgabe): `ffmpeg -t 2700 -c copy`, also
  **verlustfreier Stream-Copy ohne Neukodierung** — 88,9 MB → 21 MB, Länge exakt 2700,02 s. Damit
  ist auch die Warnung „nah am 100-MB-Limit" vom Tisch. Kein Ausblenden am Ende, weil die Datei
  im Player ohnehin geloopt wird; ein Fade zu Stille vor dem Neustart klänge dort falscher als
  ein Schnitt.

### 2026-08-22 (Fortsetzung 24)
- **`ritual.ogg` konvertiert** (Opus, 64 kbps VBR) aus `ritual.mp3`: 28,6 MB → 8,1 MB (-72 %),
  Länge unverändert bei 936,55 s (per `ffprobe` gegen die Quelle geprüft). Quell-MP3 bewusst
  **nicht** gelöscht — anders als bei `jungle.mp3` (110 MB, riss GitHubs Hardlimit) besteht hier
  kein Zwang, und die Konvention sieht vor, dass Hendrik erst hört und dann von Hand entfernt.
  Auf Hendriks Freigabe dann doch beides erledigt: **`soundFile: "ritual.ogg"` in
  `GRABESINSEL_SCENES["13.1"]`** eingetragen (erste Szene der Grabesinsel mit Ton) und die
  Quell-MP3 gelöscht, nachdem geprüft war, dass die `.ogg` bereits committet ist. Offline
  verifiziert, dass `resolveSoundForScene('13.1')` auf den statischen Wert zurückfällt und
  `audio/ritual.ogg` erreichbar ist (HTTP 200) — der Firebase-Wert aus der Sound-Leiste hat
  weiterhin Vorrang, das Feld ist nur der Default.
- **`ending.ogg` und `temple.ogg` konvertiert** (Opus, 64 kbps VBR), auf Hendriks Ansage ohne
  Gegenprüfung direkt hochgeladen: `Ending.mp3` 357,1 MB → **88,9 MB** (-75 %, Länge 11701,93 s
  ≈ 3:15 h), `temple.mp3` 114,4 MB → 30,1 MB (-74 %, Länge 3748,33 s ≈ 1:02 h). Längen per
  `ffprobe` gegen die Quellen geprüft, beide identisch. Quell-MP3s gelöscht. Noch keiner Szene
  zugeordnet.
  - **Achtung `ending.ogg`:** mit 89 MB die zweitgrößte Datei im Repo (nach `mystic.ogg`, 94 MB)
    und nah am 100-MB-Hardlimit. Bei noch längeren Stücken künftig die Bitrate senken statt
    stumpf zu konvertieren.
- **Eigener Fehler, festgehalten: `git add -A` hat zwei frisch abgelegte MP3s (357 MB und 114 MB)
  mit in einen Commit gezogen**, der Push wurde vom GitHub-Hook abgelehnt (`GH001: Large files
  detected`). Behoben mit `git reset --soft HEAD~1` + `git restore --staged` — die Blobs waren nie
  auf dem Remote. **Konsequenz: bei Commits in diesem Repo keine pauschalen `git add -A`-Läufe
  mehr, sondern Pfade einzeln stagen** — im `audio/`-Ordner liegen regelmäßig Quelldateien weit
  über dem Limit (siehe Faustregel vom 14.08.). Ein `git status` in derselben Befehlszeile hilft
  nicht, weil die Ausgabe erst nach dem Commit sichtbar wird.

  **Damit sind `jungle`/`mystic`/`BBay`/`flamenco`/`ending`/`temple` die noch unzugeordneten
  Tondateien.**

### 2026-08-22 (Fortsetzung 23)
- **Grabesinsel auf zwei Orte reduziert** (Hendriks Vorgabe): nur noch `grabesstrand` und
  `die_ritualkammer`. Die Marker `der_schwarze_weg` und `das_kathedralenherz` sind entfallen —
  sie trugen weder eine Entscheidung noch einen eigenen Aufenthalt, sondern nur den Marsch
  dazwischen.
  - **Kein Textverlust:** Beide Inhalte (Talboden ohne Abzweig, Pfeiler-/Bogenformen, das
    Leuchten, das beim Zugehen nicht heller wird, und die Öffnung ohne Schwelle am Ende) sind zu
    einer Übergangs-Interaktion `der_weg_zur_hoehle` („Der Weg zur Höhle") in
    `ORTE.grabesstrand` zusammengezogen — 6 Trigger, mit dem ausdrücklichen Schlusshinweis, danach
    auf den Kammer-Marker umzuschalten. Die beiden alten Top-Level-`ORTE`-Einträge sind gelöscht.
  - Begründung im Dateikopf von `js/grabesinsel_scenes.js` festgehalten, damit die Marker nicht
    versehentlich wieder angelegt werden.
  - Nebeneffekt: der Höhleneingang braucht damit **kein eigenes Bild mehr** — die offene
    Bildaufgabe der Grabesinsel entfällt ersatzlos, alle verbliebenen Orte haben ihr Artwork.

### 2026-08-22 (Fortsetzung 22)
- **Ritualkammer-Bild eingebunden**: `Ritualkammer.jpg` → `interior_ritualkammer.webp`
  (2,7 MB → **63 KB**, 1600×893 — die kleinste Datei im Projekt, weil das Bild fast nur aus
  dunklen Flächen besteht und WebP das extrem gut komprimiert). Der nachgeschärfte Prompt hat
  getroffen: Pfeiler laufen oben aus dem Bild, keine sichtbare Decke, Tiefenstaffelung im Dunst,
  spitz zulaufende Nischen im gewachsenen Fels (Mensch-oder-Natur bleibt unentscheidbar), und die
  weiche Anhöhe als einziges Runde in der Halle, mit dem winzigen Kind darauf als Maßstab.
  Roh-JPG nach Sichtprüfung entfernt.
- **Bildstand Grabesinsel:** Übersichtskarte, Strand und Ritualkammer sind da. Einzig der
  **Höhleneingang** hat noch kein eigenes Bild und zeigt weiterhin das Kartenbild — Dateikopf in
  `js/grabesinsel_scenes.js` entsprechend aktualisiert.

### 2026-08-22 (Fortsetzung 21)
- **Ritualkammer nachgeschärft: gigantisch statt Höhle, und bewusst mehrdeutig** (Hendriks
  Korrektur: „aktuell ist es eine kleine Höhle, es muss gigantisch wirken — gerne mit scharfen
  behauenen Kanten, die an Kirchen/Tempel erinnern, alles nicht ganz klar ob Mensch oder
  natürlich"). Zwei Punkte, in denen der erste Entwurf danebenlag:
  - **Maßstab.** „Enormous cavern" allein erzeugt keine Größe. Der Prompt hat jetzt einen eigenen
    SCALE-Block mit konkreten Bauanweisungen: **das Kind ist der Maßstab** und muss winzig in der
    Mitteldistanz liegen (wer die Anhöhe formatfüllend malt, hat eine kleine Höhle gemalt); das
    obere Bilddrittel bleibt Dunkelheit **ohne sichtbare Decke**; Tiefenstaffelung aus mehreren
    Felsrändern hintereinander mit Dunst dazwischen, sodass das Ende „sich auflöst statt
    aufzuhören"; riesige Felsschäfte, die oben aus dem Bild laufen.
  - **Mensch oder Natur.** Draußen musste alles natürlich wirken — drinnen ist das Gegenteil
    gewollt: scharf behauene Rippen, Pfeilerformen und spitz zulaufende Nischen neben rohem
    Bruch im selben Gestein, aber **kein Ornament, keine Inschrift, keine Fuge, keine
    Werkzeugspur**. Die Geometrie ist zu absichtlich für Zufall und zu schmucklos für ein
    Bauwerk; die Entscheidung soll unmöglich bleiben.
  - Zwei neue Nachfass-Zeilen (zu kleine Halle als „häufigster Fehler", eindeutig gebaut/eindeutig
    natürlich). Marker-`desc` und das Vorlese-Tableau in `ORTE.die_ritualkammer` entsprechend neu
    geschrieben (9 statt 7 Absätze, 7 statt 6 Trigger, neuer Trigger
    `kanten_mensch_oder_natur`). Die Anhöhe ist jetzt bewusst als **einziges Sanfte** in einer
    Halle voller scharfer Kanten beschrieben — der Kontrast trägt den Moment.

### 2026-08-22 (Fortsetzung 20)
- **Grabesinsel-Karte und Strandbild eingebunden, Marker gegen das echte Bild kalibriert.**
  `Ritualinsel.jpg` → `grabesinsel.webp` (3,4 MB → 261 KB, **1920×1072** — der vorsorgliche
  `MAP_NAMES`-Eintrag hat gegriffen) und `schwarzerStrand.jpg` → `interior_grabesstrand.webp`
  (2,8 MB → 139 KB, 1600×893). Der zweite Karten-Anlauf trifft die Vorgabe: erodiertes Gebirge
  statt gestanzter Form, unregelmäßige Küste, die Höhle mit dem Leuchten am Ende des Tals. Das
  Strandbild zeigt Boot, Kisten, den Talboden und das Leuchten in der Ferne — es wird deshalb
  auch vom `der_schwarze_weg`-Marker genutzt. Marker per Playwright-Screenshot gegen das
  Kartenbild nachjustiert (Strand auf die schwarze Felsplatte am Wasser, Weg auf den Talboden,
  Eingang in die Höhlenöffnung, Kammer in den Berg dahinter). Roh-JPGs nach Sichtprüfung entfernt.
- **Neuer Ort „Die Ritualkammer"** (`die_ritualkammer`, vierter Marker) — Tableau von Hendrik
  vorgegeben: eine gewaltige Halle, in der Mitte eine kaum kniehohe Anhöhe, aus dem Fels
  geschlagen, aber mit so weichen Kanten, dass sie gewachsen wirkt; darauf Jessica, wie schlafend,
  **kein sichtbarer Schaden am Kind**. `ORTE.die_ritualkammer` mit der Interaktion „Das Kind auf
  dem Stein" (6 Trigger): ein Vorlese-Tableau in fünf Schritten, das ausschließlich beschreibt,
  was zu sehen ist.
  - **Bewusst keine Probe an dieser Stelle** — es gibt nichts zu entdecken, was nicht ohnehin
    jeder sieht, und Mechanik würde den Moment zerreden (Bibel 2.6). Stattdessen ein expliziter
    SL-Hinweis, nach dem Tableau eine echte Pause zu lassen und die Spieler zuerst sprechen zu
    lassen.
  - Zwei Figuren-Hinweise verknüpft: Harwicks Reaktion hängt am Ausgang der Kinder-Rettung
    (in der gespielten Runde gerettet → nicht dauerhaft manisch, also eher still als fiebrig),
    und Cormac trägt die Schuld an ihrem Tod (Bibel 8.1) — das geknotete Seil darf laut Bibel 2.7
    nur noch einmal auftauchen, hier ODER in `12.1`, nicht beides.
  - Marker-`desc` nennt bewusst **keinen Namen** — die Spieler sehen „ein Kind", nicht „Jessica".
  - Bildprompt in `BILD-PROMPTS.md`: Maßstab der Halle und das Kind sind die einzigen Bildinhalte,
    keine weiteren Figuren. Drei Nachfass-Zeilen gegen die naheliegenden Fehlgriffe (Aufbahrung/
    Grab-Ästhetik mit gefalteten Händen und Kerzen, verletzt/tot dargestelltes Kind, zu kleine
    Halle).
  - Der Marker sollte beim Szenenstart über `hiddenMarkersLive` ausgeblendet bleiben, sonst
    verrät der Pin den Fund vorzeitig — steht als Kommentar in der Szenendatei.
  - **[OFFEN]** bleibt, was danach geschieht: Ritual, Scheitern, Untote, Endkampf (Bibel 12.1).

### 2026-08-22 (Fortsetzung 19)
- **Grabesinsel-Karte nachgeschärft nach Hendriks Bildkritik** („zu plastisch, als wäre das Kreuz
  eingestanzt — sieht nach gestanzter Knete aus"). Der erzeugte Entwurf hatte eine gleichmäßig
  tiefe, glattrandige Kreuzform mit umlaufendem Wall, also eher Gussform als Geologie. Der
  Karten-Prompt hat jetzt einen eigenen TERRAIN-Block: Bergrücken mit ständig wechselnder Höhe,
  Breite und Abstand, Schutthalden, Felsnasen, die ins Tal vorspringen und es teilweise verdecken,
  wechselnde Talbreite, ausgefranste Ränder, Talboden mit Stufen und Blockfeldern statt flacher
  Wanne, dazu eine unregelmäßig eingeschnittene Küstenlinie. Leitsatz: der Kreuz-Grundriss soll
  **allmählich erkennbar** werden, kein aufgelegtes Symbol. Ergänzt um „painted as a landscape,
  not as a model" (Dunst, Erosion, Verwitterung) und eine eigene Nachfass-Zeile gegen den
  Modell-/Knete-Eindruck. Die beiden bekannten Fehlschläge stehen jetzt oben im Abschnitt
  dokumentiert, damit sie beim nächsten Anlauf nicht wiederkehren.
- **Neuer Ort „Der Höhleneingang" (`das_kathedralenherz`)** — Hendriks Vorgabe: das Tal mündet in
  eine Höhle, und diese Höhle ist das Kathedralenherz. Damit ist auch das Leuchten neu verortet:
  es kommt **aus der Höhle heraus** statt flächig auf dem Talboden zu liegen (Prompt und
  Marker-Texte entsprechend angepasst, inkl. Nachfass-Zeile). Dritter Marker in
  `js/grabesinsel_scenes.js` (`top:38`), `ORTE.das_kathedralenherz` mit der Interaktion
  „Am Höhleneingang" (4 Trigger): der Talboden läuft ohne Absatz und ohne Schwelle hinein, kein
  Tor, keine bearbeitete Kante; das Licht kommt aus der Tiefe, der Gang führt nach unten. Weiter
  reicht der Blick nicht. **[OFFEN]** bleibt, was drinnen liegt (Ritualort/Finale, Bibel 12.1).
- **Wiederholter Werkzeug-Fehler festgehalten:** Bash-Heredocs verschlucken in dieser Umgebung
  Backslashes, auch bei quotiertem Delimiter (`<<'PYEOF'`) — `\n` in einem Python-Skript landete
  dadurch als echter Zeilenumbruch in den JS-Strings und hat `js/regie.js` zweimal unparsebar
  gemacht. **Konsequenz für künftige Skript-Ersetzungen in JS-Strings: Backslashes über
  `chr(92)` bauen oder die Ersetzung mit dem Write-Tool statt per Heredoc schreiben.** Jeweils per
  `node --check` lokalisiert und repariert, Absatzstruktur danach gegengeprüft.

### 2026-08-22 (Fortsetzung 18)
- **Grabesinsel-Form nach Hendriks Skizze korrigiert — natürlicher Fels statt Bauwerk.** Der erste
  Entwurf (Fortsetzung 17) hatte die Kathedralen-Anmutung als *gebaute* Struktur beschrieben
  („Stufen zu gleichmäßig, Türme zu gerade, Proportionen zu absichtlich"). Hendriks Skizze zeigt
  etwas anderes: **scharfkantige Bergrücken umschließen ein Tal, dessen Grundriss ein Kreuz
  bildet** — Langhaus vom Meer nach innen, zwei Querarme, runder Kopf am Ende. Genau EIN Zugang
  zum Meer am Fuß des Langhauses, das Leuchten sitzt an der Vierung. Ausdrücklich **kein Hinweis
  auf Zivilisation**: der Weg ist gewachsener schwarzer Fels, kein Pflaster; nur minimale
  Tempel-Andeutungen, die mit dem Gestein verschmelzen.
  - Karten-Prompt in `BILD-PROMPTS.md` komplett neu geschrieben: steile Schrägaufsicht (hoch genug,
    dass der Kreuz-Grundriss lesbar wird, aber im Stil der übrigen Grundkarten), Ringgebirge mit
    einer einzigen Bucht, Talboden aus gewachsenem Fels „reads as rock, not as a road", nur
    zufällige Pfeiler-/Bogenformen. Drei Nachfass-Zeilen: gegen Ruinen/Mauerwerk, für die
    Lesbarkeit des Kreuz-Grundrisses, gegen zu warme Farbigkeit. Der Strand-Prompt entsprechend
    angeglichen.
  - Marker-`desc` beider Orte und beide `ORTE`-Interaktionen umgeschrieben: kein „gebaut" mehr,
    stattdessen gewachsener Fels ohne Werkzeugspur, Fuge oder Mörtel. Neuer Trigger
    `pfeiler_und_bogen`. Der Kirchengrundriss wird jetzt ausdrücklich **nicht** von der SL
    erklärt — wer selbst darauf kommt, soll es selbst aussprechen (Design-Regel 2.8).
  - Marker-Positionen an die Skizze angepasst (Strand unten am Fuß des Langhauses `top:84`, Weg
    darüber `top:62`), mit Kommentar, dass sie gegen das echte Bild nachjustiert werden müssen.
  - **`grabesinsel.png` vorsorglich in `MAP_NAMES`** (`tools/optimize_images.py`) eingetragen, damit
    die Übersichtskarte auf 1920px statt 900px gekappt wird — geprüft, dass `cap_for()` jetzt für
    `.png` UND `.jpg` 1920 liefert. Genau dieser Fehler ist bei `riffinsel.png` schon einmal
    passiert.
  - **Zwischenfehler:** Der Skript-Ersetzungslauf für die GM-Texte hat an zwei Stellen echte
    Zeilenumbrüche statt `\n` in die JS-Strings geschrieben und `js/regie.js` damit unparsebar
    gemacht. Per `node --check` lokalisiert und repariert; Absatzstruktur danach gegengeprüft
    (5 Absätze je Interaktion).

### 2026-08-22 (Fortsetzung 17)
- **Neue Örtlichkeit `13.1` „Grabesinsel" angelegt** (Bibel 7.1, Station 5: Ritual + Finale) —
  neue Datei `js/grabesinsel_scenes.js`, Inhalt der Ankunft von Hendrik vorgegeben. Zwei Marker im
  flachen Muster: `grabesstrand` (schwarzer Stein statt Sand, Kathedralen-Silhouette, die letzte
  Frage an jeden Einzelnen, Kisten von Bord) und `der_schwarze_weg` (der einzige gangbare Weg, das
  grünlich-türkise Leuchten in der Ferne).
  - **Bewusst KEIN Erkundungs-Graph** (anders als die Riffinsel): Es gibt genau einen gangbaren
    Weg, also nichts zu erkunden und nichts zu wählen — ein Graph mit einem einzigen Pfad wäre
    Mechanik ohne Entscheidung.
  - `ORTE.grabesstrand` (Interaktion „Die letzte Frage am Strand", 5 Trigger) und
    `ORTE.der_schwarze_weg` („Das Glühen in der Ferne", 4 Trigger). Beide halten sich strikt an
    Beobachtung ohne Deutung: das Leuchten wird nirgends erklärt, und eine Wahrnehmungsprobe
    liefert bewusst nur Details zum Weg, keine Auflösung. `SZENEN_REGIE["13.1"]` mit
    `uebergeordnetesZiel` + `stimmung`, **ohne `ghosts`** — an Land geht nur mit, wer sich in
    `12.1` einzeln dafür entschieden hat; anonyme Statisten würden genau diese Entscheidung
    entwerten.
  - Registry an allen sechs Stellen ergänzt: `<script>`-Tag in `karte.html` UND `regie.html`,
    `MAP_REGISTRY` in `karte.html`, sowie `getAllSceneEntries`/`getSceneLabel`/`getMarkersForScene`
    und `SCENE_ORDER` in `js/regie_vault.js`.
  - **Kein Artwork vorhanden** — Hintergrund und beide Marker zeigen vorerst
    `images/schatzinsel.webp` als Platzhalter (leeres `img` würde „Kein Bild hinterlegt." zeigen).
    Zwei Prompts dafür neu in `BILD-PROMPTS.md` (Übersichtskarte + Strand-Ortsbild), bewusst kalt
    und entsättigt gehalten, mit dem Leitgedanken „sieht aus wie ein Bauwerk, ist aber keins —
    das Unbehagen kommt daher, dass nichts kaputt ist" und einer Nachfass-Zeile gegen die
    naheliegende Ruinen-Fehlinterpretation. **Hinweis dort vermerkt:** die Übersichtskarte braucht
    zusätzlich einen `MAP_NAMES`-Eintrag in `tools/optimize_images.py`, sonst greift die
    900px-Kappung statt 1920px (derselbe Fehler wie seinerzeit bei `riffinsel.png`).
  - Offline mit Playwright verifiziert (`pnp-safe-test`, 0 Fehler): `13.1` erscheint in der
    Szenenliste beider Seiten mit korrektem Label, beide Marker werden gerendert, die Interaktion
    ist am Ort erreichbar.
  - **[OFFEN]** Was am Ende des Wegs liegt (Ritualort, Finale nach Bibel 12.1), ist noch nicht
    ausgearbeitet und bekommt eigene Marker, sobald Hendrik es vorgibt.

### 2026-08-22 (Fortsetzung 16)
- **Bild für Szene `12.1` eingebunden**: `interior_kapitaenskajuete_einberufung.webp` (2,7 MB JPG →
  147 KB WebP, 1600×893), erzeugt mit dem Kajüten-Außenbild und den sieben NSC-Porträts als
  Bildeingabe. Trifft die Vorlage: Mahagoni mit Goldleisten, burgunderrote Vorhänge mit Goldmuster,
  Bücherregal, Globus auf Standfuß, eingebaute Koje, verzierte Goldtruhe, hängende Messinglampen,
  dazu der zur Seite geräumte Schreibtisch mit Karten — und zwei gesichtslose Gestalten im
  Vordergrund als Platzhalter für die Spielercharaktere.
  - Eingetragen als `imgOverrides.kapitaenskajuete` **nur** in `"12.1"` — geprüft, dass `2.1`/
    `5.1`/`10.1` weiterhin das Außenbild aus `GOLDEN_LION_MARKERS_BASE` zeigen. Damit ist der
    Zustandswechsel auch visuell da: verriegelte Tür mit Harwick allein → offener Raum voller
    Leute.
  - Roh-JPG nach Sichtprüfung entfernt (Konvention wie bei den Riffinsel-Bildern).
  - Offline-Test der Szene weiterhin mit 0 Fehlern.

### 2026-08-22 (Fortsetzung 15)
- **Einberufungs-Prompt auf Mehrfach-Bildeingabe umgebaut** (Hendriks Wunsch: Kajütenbild UND
  Personen anhängen, mit Anweisungen dazu im Prompt). Alle acht Anhänge sind vorhanden und geprüft
  (`interior_kapitaenskajuete.webp` + die sieben NSC-Porträts). Der Prompt beginnt jetzt mit einem
  Anhang-Block, der jedes Bild **nummeriert** anspricht und sagt, was daraus übernommen wird:
  - Bild 1 = Raum. Ausdrücklich: Architektur/Material/Farbigkeit übernehmen, **aber nicht die
    Kameraposition** — die Vorlage schaut von außen auf die Kajüte, das neue Bild spielt drinnen.
    Ohne diesen Satz reproduziert Gemini erfahrungsgemäß die Außenansicht.
  - Bilder 2–8 = Figuren, jede mit Rolle und Platzierung (Harwick spricht, Cormac am Rand mit
    Blick zu Boden, Wat etwas abseits). Ausdrücklich: **Hintergründe der Porträts ignorieren**,
    nur die Männer übernehmen — sonst wandert das Deck aus den Porträts in die Kajüte.
  - **Zwei Sorten Anwesende, klar getrennt:** die sieben NSC bekommen erkennbare Gesichter (ihre
    Porträts existieren, die Runde soll sie wiedererkennen), die Spielercharaktere bleiben
    gesichtslos im Vordergrund von hinten — damit sich jeder Spieler selbst hineindenken kann.
    Das ersetzt die vorherige pauschale Regel „keine erkennbaren Gesichter".
  - Vier Nachfass-Zeilen für die typischen Fehlschläge (zu heroisch, Kajüte weicht ab, Gesichter
    treffen die Porträts nicht, Gemini gibt allen Figuren Gesichter) und ein Fallback auf vier
    Anhänge, falls acht die Ähnlichkeiten vermischen.
  - Die Variante mit identischer Kameraposition braucht nur Bild 1 — auf die Distanz wären
    Porträt-Ähnlichkeiten ohnehin nicht lesbar; entsprechend ergänzt.
- **Neue allgemeine Regel oben in `BILD-PROMPTS.md`:** Sollen benannte Figuren ins Bild, deren
  Porträts mit anhängen, die Anhänge durchnummeriert ansprechen und je Bild sagen, was übernommen
  wird — sonst mischt Gemini Porträt-Hintergründe in die Szene oder verteilt Gesichter beliebig.

### 2026-08-22 (Fortsetzung 14)
- **Kajüten-Prompt an das bestehende Bild als Vorlage gebunden** (Hendriks Hinweis: „Es gibt ja
  bereits dieses Bild von außen, das sollte irgendwie als Vorlage dienen"). Der erste Entwurf
  beschrieb eine generische Kapitänskajüte und hätte einen Raum erzeugt, den niemand als denselben
  Ort wiedererkennt. `images/interior_kapitaenskajuete.webp` legt die Einrichtung bereits konkret
  fest — der Prompt listet sie jetzt als verbindliche Tabelle (Mahagoni mit Goldleisten,
  burgunderrote Vorhänge mit Goldmuster, Bücherregal mit Lederbänden, Globus auf Standfuß,
  eingebaute Koje mit cremegoldener Bettwäsche, verzierte Truhe, hängende Messing-Öllampe) und
  verweist im Prompttext ausdrücklich auf das Referenzbild. Harwick trägt denselben dunkelblauen
  bestickten Rock wie dort.
- **Neue allgemeine Regel oben in `BILD-PROMPTS.md`:** Hat ein Ort schon ein Bild, das bestehende
  Bild Gemini als **Bildeingabe** mitgeben statt es nur zu beschreiben — ein zweites Bild desselben
  Orts wird sonst fast nie wiedererkennbar.
- **Variante ergänzt:** identische Kameraposition wie die Vorlage (von Deck auf die Kajütenwand),
  nur mit offener Tür und hell erleuchtetem, vollem Innenraum. Erhält die Wiedererkennbarkeit
  maximal, zeigt die Versammlung aber nur ausschnitthaft. Passt zum bereits gesetzten
  `descOverrides`-Text der Szene („Die Tür zur Kapitänskajüte steht offen, zum ersten Mal seit
  langem"), der den Zustandswechsel gegenüber dem Vorlagenbild (verriegelt, Harwick allein)
  beschreibt.

### 2026-08-22 (Fortsetzung 13)
- **Neue Szene `12.1` „Golden Lion — Die Einberufung"** als Ersatz für die Offizierskonferenz
  (Bibel 7.5) — Inhalt komplett von Hendrik vorgegeben, hier nur ausformuliert. Harwick ruft die
  Spieler und seine engen Vertrauten in die Kajüte und macht reinen Tisch: Jessica, Schmerz und
  Schuld, das erhandelte Artefakt als Ritual-Schlüssel, die freiwillige Frage, wer ihm auf die
  Insel folgt. Er legt dabei dem Spieler die Hand auf die Schulter, der ihm beim Artefakthandel
  die Ohrfeige verpasst hat. Sein Schlusssatz steht wörtlich in der Interaktion.
  - **Nur EIN sichtbarer Marker** (Kapitänskajüte), alle übrigen Schiffsorte über `hiddenMarkers`
    ausgeblendet — die Szene ist ein Gespräch in einem Raum, kein Herumlaufen. Ausnahmsweise
    deshalb ein langer `hiddenMarkers`-Eintrag statt eines kurzen.
  - `ORTE.kapitaenskajuete`: neue Interaktion `die_einberufung` (`nurSzenen: ["12.1"]`, 8 Trigger)
    plus erstmals ein `szenenUeberschreibungen`-Eintrag für diesen Ort (`personen`/`kurz`/
    `ortHinweis`). Die bestehenden drei Interaktionen tragen alle `nurSzenen` und lecken daher
    nicht in die neue Szene.
  - `SZENEN_REGIE["12.1"]` mit `uebergeordnetesZiel` + `stimmung`, **bewusst ohne `ghosts`**: es
    stehen ausschließlich namentlich gerufene Figuren im Raum, ein Pool anonymer Statisten wäre
    hier falsch. Die Namensliste steht stattdessen in `personen`.
  - Registry: `SCENE_ORDER` in `js/regie_vault.js` um `12.1` ergänzt; sonst nichts nötig, da
    `GOLDEN_LION_SCENES` längst registriert ist.
  - **Zwischenfehler vermieden:** Erst hatte die Anwesenden-Liste als frei erfundenes Feld
    `anwesend` in `SZENEN_REGIE` gestanden — das rendert nirgends. Nach Prüfung von
    `resolveOrtForScene()` in die dafür vorgesehene `szenenUeberschreibungen.personen` verschoben.
  - Bild: Hendrik baut ein eigenes Kajüten-Bild mit der versammelten Runde. Bis dahin bleibt
    bewusst das bestehende `interior_kapitaenskajuete.webp` stehen (leeres `img` würde „Kein Bild
    hinterlegt." zeigen). Prompt dafür neu in `BILD-PROMPTS.md` — anders als die Riffinsel-Orte
    bewusst MIT Figuren, aber ohne erkennbare Gesichter, damit sich die Spieler hineindenken
    können.
  - Bibel 7.5 um einen `[ERSETZT]`-Kasten ergänzt: Verzweigung 3 wird in dieser Kampagne nicht
    gespielt, die Überfahrt löst die SL erzählerisch. Die Routen-Tabelle bleibt als Entwurf für
    einen künftigen Durchgang stehen (Design-Prinzip 2.3). Der „intime Weg" aus Bibel 12 ist damit
    eingelöst — für alle Anwesenden zugleich statt nur für eine hochrangige Figur.
  - Offline mit Playwright verifiziert (`pnp-safe-test`, 0 Fehler): `regie.html` listet `12.1`,
    zeigt genau einen Marker, die `szenenUeberschreibungen` greifen und die Interaktion ist da;
    `karte.html` rendert die Szene mit genau einem Marker auf dem Golden-Lion-Hintergrund.

### 2026-08-22 (Fortsetzung 12)
- **Zwei Kanon-Festlegungen von Hendrik in die Bibel übernommen** (auf die Frage, ob zwischen
  Riffinsel und Grabesinsel noch eine Schiffspassage gespielt werden soll — Antwort: nein, wird
  erzählerisch gelöst):
  - **Kein offener Seekampf gegen die Spanier** (Bibel 7.5, Kasten unter der Routen-Tabelle): Die
    Golden Lion ist als kleine Fregatte einem königlichen spanischen Kriegsschiff nie gewachsen;
    eine Begegnung ist immer Flucht, Entkommen bei Nacht die einzige Möglichkeit. Damit entfällt
    der frühere Clou von Route A („sicher, falls der Spanier-Kampf schon früher stattfand — der
    Kampf kann hier nachgeholt werden") — ein solcher Kampf findet nirgends statt. Tabellenzeile
    entsprechend gekürzt.
  - **Der Jaguar-Säbel ist schlicht eine sehr gute Waffe** (Bibel 12.1, neuer Absatz neben dem
    Schutz-Anhänger): keine Sonderregel, kein Rätsel-Artefakt — er vereinfacht den Endkampf. Damit
    ist eingelöst, was 7.4 für den Riffinsel-Weg als „zufällige Vorräte/Ressourcen — ein Vorteil,
    den die Spieler haben, ohne ihn zu kennen" vorsieht. Der Trigger `belohnung_saebel` in
    `ORTE.versteckte_grotte` entsprechend präzisiert.
- **Noch nicht festgehalten:** Hendriks Bericht aus der gespielten Session (Kinder eindrucksvoll
  gerettet, Ohrfeige des körperlich stärksten Spielers an Harwick, Cormacs bewusstes
  Nicht-Eingreifen, Wats Überraschung, Harwick lenkt ein). Das entscheidet den Verzweigungspunkt
  aus `9.1`/`10.1` — Harwick bleibt NICHT dauerhaft manisch — betrifft also den Finale-Strang
  direkt. Bewusst noch nirgends abgelegt: die Bibel hält Verzweigungen offen (Design-Prinzip 2.3,
  Wiederspielbarkeit), ein eigener Ort für gespielte Session-Historie existiert bisher nicht.
  Rückfrage an Hendrik läuft.

### 2026-08-22 (Fortsetzung 11)
- **`jungle.ogg` konvertiert** (Opus, 64 kbps VBR) aus `jungle.mp3`: 109,9 MB → 25,7 MB (-77 %),
  Länge unverändert bei 3601,04 s (per `ffprobe` gegen die Quelle geprüft, beide identisch).
  Quell-MP3 anschließend auf Hendriks Anweisung gelöscht — bei 110 MB hätte sie ohnehin nie
  committet werden dürfen (GitHub-Hardlimit 100 MB, siehe Faustregel im Eintrag vom 14.08.).
  **Noch keiner Szene zugeordnet** — wie bei `mystic`/`BBay`/`flamenco` bleibt die Zuordnung
  Hendriks Entscheidung; naheliegender Kandidat wäre `soundFile` in `RIFFINSEL_SCENES["11.1"]`
  (die Riffinsel hat bisher gar keinen hinterlegten Ton), alternativ live über die Sound-Leiste
  im Adminpanel.

### 2026-08-22 (Fortsetzung 10)
- **Grotten-Bild eingebunden, Riffinsel-Bildersatz damit komplett.** `Grotte.jpg` →
  `interior_grotte.webp` (3,2 MB → 138 KB, 1600×893), an `versteckte_grotte` eingetragen. Damit
  hat jeder der fünf Riffinsel-Marker sein eigenes Ortsbild; keiner zeigt mehr auf das
  Übersichtsbild `riffinsel.webp`. Das Bild trifft die Vorgabe aus der Grotten-Überarbeitung genau:
  bearbeitete Steinkammer, Zeichentafel mit den sechs Symbolzeilen, die vier Siegelscheiben
  (Eule/Katze/Schlange/Maus, alle lesbar) und rechts daneben die steinerne Klappe mit runder
  Vertiefung — keine Truhe, kein Holz, kein Metall.
- **Rohe JPG-Quelldateien entfernt** (nach Hendriks Freigabe und Sichtprüfung, ~17 MB): vorher
  geprüft, dass zu jeder Datei das konvertierte WebP existiert. `images/riffinsel.png` (7,6 MB)
  bleibt vorerst liegen — war nicht Teil der Freigabe.

### 2026-08-22 (Fortsetzung 9)
- **Vier von Hendrik generierte Riffinsel-Ortsbilder eingebunden** (Strand, Wrack, Süßwasserquelle,
  Aussichtsklippe — Grotte fehlt noch, wird nach der Überarbeitung neu generiert). Lagen als
  `Riffstrand.jpg` etc. in `images/`, umbenannt auf die `interior_`-Konvention (sonst 900px-
  Portrait-Kappung statt 1600px) und dabei den Umlaut aus `Süßwasserquelle.jpg` entfernt.
  Konvertiert: 3,3–3,9 MB JPG → 163–278 KB WebP bei 1600×893. In `js/riffinsel_scenes.js` als
  `img` der vier Marker eingetragen (vorher zeigten alle fünf auf das Übersichtsbild
  `riffinsel.webp`); die Grotte bleibt vorerst darauf. Rohe JPGs bewusst nicht committet
  (Konvention: erst nach Sichtprüfung von Hand entfernen).
- **`tools/optimize_images.py` nimmt jetzt auch JPG/JPEG** (`SOURCE_EXTS`). Gemini liefert je nach
  Exportweg PNG oder JPG — beim Sammellauf ohne Argumente wurden JPGs bisher stillschweigend
  übersprungen, was genau in diesem Durchgang aufgefallen ist. Zusätzlich normalisiert `cap_for()`
  jetzt die Endung gegen `MAP_NAMES` (das historisch nur `.png`-Namen führt), damit ein als JPG
  geliefertes Kartenbild nicht fälschlich auf 900px gekappt wird. Ausgabetexte entsprechend von
  „PNG" auf „Quelldatei" umgestellt.

### 2026-08-22 (Fortsetzung 8)
- **Grotte überarbeitet: urzeitliches Steinbauwerk statt Truhe** (Hendriks Korrektur — „das Ganze
  ist nicht einfach eine Truhe, sondern wirklich eine Grotte, alles aus Stein und urzeitlich; das
  Siegel öffnet eine steinerne Klappe"). Die versiegelte Kiste ist ersatzlos entfallen; die Grotte
  selbst ist jetzt das Bauwerk:
  - `ORTE.versteckte_grotte.der_fund_in_der_grotte` neu geschrieben — kein Naturhohlraum, sondern
    aus dem Fels geschlagen (Wände zu gerade, Boden zu eben), alles aus einem Stück dunklem Stein,
    an den Kanten von Alter und Feuchtigkeit rund geschliffen, **kein Holz, kein Metall, kein
    Mörtel, nichts Europäisches**. An der Rückwand drei Dinge, alle Teil des Bauwerks: eine aus
    der Wand gehauene Zeichentafel, vier steinerne Siegelscheiben in flachen Mulden (die einzigen
    beweglichen Teile im Raum) und eine fugengenau eingelassene steinerne Klappe mit leerer runder
    Vertiefung. 6 statt 3 Trigger.
  - `das_raetsel_der_kiste` → **`das_raetsel_der_grotte`** umbenannt (Interaktions-Keys werden
    nirgends in Firebase persistiert, nur Trigger-IDs — Umbenennung daher unkritisch). Auflösung
    jetzt: der richtige Siegelstein in der Vertiefung lässt die Klappe auffahren (schweres Mahlen,
    im Boden spürbar), dahinter eine flache Nische mit dem Jaguar-Säbel. Neu ergänzt: Gewalt ist
    ausdrücklich kein Weg (massiver Fels, kein Scharnier, kein Schloss) — Aufbrechversuche machen
    nur Lärm und zahlen damit aufs Affen-Risiko ein. Falscher Stein: Knall und Fauchen jetzt „aus
    dem Stein selbst, nicht aus einer benennbaren Richtung".
  - Marker-`desc` (`js/riffinsel_scenes.js`) entsprechend angepasst — vermittelt den bearbeiteten
    Stein als reine Beobachtung, ohne das Rätsel vorwegzunehmen (Design-Regel 2.8).
  - Grotten-Prompt in `BILD-PROMPTS.md` neu geschrieben (Steinkammer statt Kammer mit Truhe, Tafel
    und Klappe als Teil der Wand), plus zwei Nachfass-Zeilen, falls Gemini doch eine Truhe oder
    Holz/Metall hineinbaut.
  - Bibel gegengeprüft: 7.4 fordert nur „zufällige Vorräte/Ressourcen — ein Vorteil, den die
    Spieler haben, ohne ihn zu kennen"; eine Kiste war nie Vorgabe, der Säbel deckt das ab.

### 2026-08-22 (Fortsetzung 7)
- **Neue `BILD-PROMPTS.md`**: Sammelstelle für die Gemini-Prompts der Referenzbilder. Anlass war
  Hendriks Bedarf an Prompts für die fünf Riffinsel-Orte (Strand, Wrack, Grotte, Süßwasserquelle,
  Aussichtsklippe) — die Datei behebt zugleich eine schon dokumentierte Lücke: der Prompt fürs
  Riffinsel-Übersichtsbild war nur „im Gespräch" vorhanden und damit verloren. Aufbau: gemeinsamer
  Stil-Kopf/-Fuß (Dutch Golden Age, 16:9, „no text or labels"), fünf Orts-Prompts, dazu Hendriks
  Stammesdorf-Prompt als Stilvorlage. Inhalte folgen strikt den bestehenden Marker-`desc`-Texten
  aus `js/riffinsel_scenes.js`, damit Bild und Text nicht auseinanderlaufen; Bilder bewusst
  menschenleer (Design-Regel 2.8), NSC-Figuren je als optionale Zusatzzeile. Der Grotten-Prompt
  zeigt Steinplatte, die vier Tier-Steine (Eule/Katze/Schlange/Maus) und die Kiste, der
  Klippen-Prompt hat eine optionale Zeile für das abziehende Kriegsschiff. Enthält außerdem den
  Hinweis auf die `interior_`-Namenskonvention — ohne dieses Präfix kappt
  `tools/optimize_images.py` auf 900px (Portrait-Annahme) statt auf 1600px, ein Fehler, der in
  diesem Projekt schon einmal passiert ist.

### 2026-08-22 (Fortsetzung 6)
- **Hendriks überarbeiteter Riffinsel-Graph übernommen** (aus `graph_editor.html` exportiert und
  eingereicht). Diff gegen den bisherigen Stand geprüft: Struktur unverändert (15 Knoten, 42
  Kanten, keine Kante/kein Knoten hinzu oder weg), geändert hat sich ausschließlich der
  Grotten-Knoten — `probe` von „Wahrnehmung" auf „Int" (bezieht sich jetzt aufs Rätsel, nicht
  mehr aufs Finden des Spalts), `erfolgText` trägt das komplette neue Rätsel, `misserfolgText`
  den Knall mit Großkatzen-Fauchen.
- **Neues Grotten-Rätsel ausgearbeitet** (Reim und Symbole von Hendrik, wörtlich übernommen;
  löst das frühere „Tiger"-Rätsel in `ORTE.versteckte_grotte` vollständig ab). Der Reim beschreibt
  den **Jaguar**; von den vier Tier-Steinen (Eule/Katze/Schlange/Maus) ist die **Katze** die
  richtige Lösung — auf Rückfrage von Hendrik bestätigt, statt sie zu raten. Belohnung: ein
  verzierter Säbel mit eingraviertem Jaguar. SL-Fassung enthält jetzt zusätzlich eine
  Zeile-für-Zeile-Auflösung zum Nachhelfen (Rosetten auf goldenem Fell, als einziger seiner
  Familie nicht wasserscheu, Schädelbiss, lautlos, Herrscher der Unterwelt bei Nacht).
- **Feindliche Ureinwohner durch Affen ersetzt** (Hendriks Vorgabe, auf Rückfrage: ersetzen
  komplett, auf der Insel gibt es keine Menschen). Der Abbruch der Erkundung läuft jetzt in zwei
  Stufen: neue Interaktion `die_bedrohliche_stimmung` („Die Stimmung kippt") als Vorlauf — über
  mehrere Stationen eingestreute Kurzbeobachtungen (Geräusche setzen aus, Bewegung in den Wipfeln,
  angebissene Frucht), bewusst ohne Probe, ohne Konsequenz und ohne Deutung durch die SL — und
  `die_affen` („Die Affen greifen an") als eigentlicher Abbruch: unzählbar viele Affen aus dem
  Blätterdach, ausdrücklich kein gewinnbarer Kampf, sondern Flucht zum Boot. `die_eingeborenen`
  entfernt. Der Vorausdeutungs-Knoten `zp1l` heißt jetzt „Ungewöhnliche Abdrücke" (handförmige
  Abdrücke statt menschengroßer Fußspuren) — Text angepasst, da die alte Formulierung
  („deutlich zu groß für einen Menschen") auf die entfallenen Ureinwohner zeigte.
- **Aussichtsklippe umgedreht** (Hendriks Vorgabe): der Aufstieg dient jetzt dazu zu sehen, wie
  das spanische Kriegsschiff in entgegengesetzter Richtung abzieht und am Horizont verschwindet —
  die Finte hat funktioniert. Vorher war der Beat umgekehrt (Verfolger nur abgelenkt, nicht weg).
  Wer nicht hochsteigt, erfährt es nicht.
- **`regie.html`: `white-space: pre-line` für `.sh-graph-ereignis-text`/`.sh-graph-ort-text`** —
  ohne das fiel Hendriks mehrzeiliges Rätsel (Reim, Symbolliste, Steinliste) im 🧭-Panel zu einem
  unlesbaren Block zusammen. Per Screenshot gegengeprüft.
- Regression: bestehende Playwright-Tests (Bewegungsfreigabe, Editor-Import/Round-Trip) sowie der
  Graph-Vollcheck weiterhin mit 0 Fehlern (15 Knoten, 42 Kanten, alle beidseitig, alle erreichbar).

### 2026-08-22 (Fortsetzung 5)
- **Aktueller Riffinsel-Graph als Editor-fertiger Snapshot herausgezogen** (Hendriks Wunsch, um
  ihn in `graph_editor.html` weiterzubearbeiten). Neues `tools/export_graph_snapshot.js`
  (`node tools/export_graph_snapshot.js 11.1`) schreibt `riffinsel_graph_snapshot.js` ins
  Wurzelverzeichnis: 15 Knoten, 42 Kanten, in genau der Form, die der Editor einliest. Ergänzt für
  die vier `ort`-Knoten die `top`/`left` ihrer Marker aus `js/riffinsel_scenes.js` — sonst landen
  die im Editor als Platzhalter bei 50/50 und müssten jedes Mal von Hand gezogen werden; beim
  Export AUS dem Editor fällt das automatisch wieder weg, die echte Datei behält ihr Format. Der
  Snapshot wird von der Anwendung nicht geladen und ist jederzeit neu erzeugbar.
- **Fix in `graph_editor.html`: der Editor konnte seinen eigenen Export nicht wieder einlesen.**
  `importGraph()` akzeptierte nur `"11.1": {…}` bzw. das reine Objekt — die komplette Datei
  (`const EXPLORATION_GRAPHS = { "11.1": {…} };`), also genau das Format, das „JS generieren" /
  „Als Datei speichern" ausgibt, scheiterte, weil auf oberster Ebene kein `nodes` steht. Der
  Fehlschlag war zudem still, solange man nicht auf die Knotenzahl schaute. Jetzt werden alle drei
  Formen akzeptiert (inkl. führendem Kommentarkopf und Zuweisung); bei mehreren Szenen im
  Container wird die im Feld „Szenen-ID" eingestellte bevorzugt, sonst die erste. Offline mit
  Playwright verifiziert (alle drei Formen laden 15/42; Round-Trip Export→Import→Export
  verlustfrei, geprüft gegen einen zwischenzeitlich geleerten Graphen, damit ein stiller
  Fehlschlag nicht als Erfolg durchgeht; keine Fehler-Dialoge) sowie per Screenshot gegengeprüft.

### 2026-08-22 (Fortsetzung 4)
- **Neue Stilregel für Kanten-Sinneshinweise: reine Wegbeschreibung, keine Einordnung**
  (Hendriks Vorgabe). Formulierungen wie „führt zurück Richtung Küste", „ein zweiter Abzweig"
  oder „der Pfad führt weiter" erschienen auch Spielern, die diesen Weg nie gegangen waren —
  seit der Graph vollständig beidseitig ist, erreicht man jeden Knoten über mehrere Routen, und
  eine solche Formulierung behauptet dann etwas Falsches über den eigenen Weg. **Alle 42
  `hinweis`-Texte** in `js/exploration_graphs.js` neu geschrieben: nur noch, wie der Weg aussieht
  bzw. sich anfühlt (z. B. „Ein Abzweig, auf dem das Unterholz immer dorniger wird." statt „Ein
  zweiter Abzweig führt tiefer in den Dschungel."), 42 eindeutige Texte, kein „zurück/weiter/
  zweiter/erneut" mehr. Auch der Text der synthetischen Zurück-Option und das „↩"-Präfix am
  Spieler-Label in `karte.html` entsprechend neutralisiert (die gedämpfte `.back`-Farbe bleibt,
  im SL-Panel bleibt das Präfix als Kennzeichnung der Fallback-Option). Stilregel als Kommentar
  in `js/exploration_graphs.js` und in `RIFFINSEL-ERKUNDUNGSGRAPH.md` (2.3) verankert, damit sie
  bei künftigen Graphen mitgedacht wird. Per Skript auf verbotene Formulierungen geprüft,
  bestehende Playwright-Regression weiterhin mit 0 Fehlern.

### 2026-08-22 (Fortsetzung 3)
- **Riffinsel-Erkundung umgestellt: SL gibt jede Bewegung frei, kein Wurf blockiert je einen Weg**
  (Hendriks Vorgabe). Drei zusammengehörige Änderungen:
  - **Auto-Advance ersatzlos entfernt** (`AUTO_ADVANCE_THRESHOLD`/`maybeAutoAdvance()` in
    `js/regie_vault.js`). Spieler-Stimmen sind jetzt reine Willensbekundung — die SL sieht nur die
    Verteilung und gibt jede Bewegung selbst per Klick frei. Vorher zog schon eine einzige Stimme
    die Gruppe sofort weiter (ursprünglich ein Testmodus).
  - **Probe-Gate an `ort`-Knoten entfernt** (`pendingOrtEdge`/`graphResolveOrt()` samt der beiden
    „✓ Erfolg — aufdecken"/„✗ Misserfolg"-Knöpfe). `graphSelectEdge()` zieht jetzt für **jede**
    Kante direkt weiter; die Ankunft an einem `ort`-Knoten deckt den Marker automatisch auf (neu:
    `revealOrtMarker()`, auch beim Zurückgehen). `probe`/`erfolgText`/`misserfolgText` bleiben als
    Vorlese-Referenz im 🧭-Panel stehen, ausdrücklich als „nur Erzählung, kein Weg-Gate"
    ausgewiesen. Begründung: die SL entscheidet ohnehin von Hand, ein Wurf soll die Bewegung nie
    verhindern — Misserfolg färbt nur die Erzählung.
  - **Jede Verbindung ist jetzt tatsächlich einzeln anklickbar.** Zwei echte Fehler dabei gefunden:
    (1) Da der Graph seit gestern durchgehend beidseitig ist, dupliziert die synthetische
    Zurück-Option (`getPlayableOptions()`) **immer** eine echte Rückweg-Kante — auf der Karte zwei
    Pfeile mit exakt identischer Richtung übereinander, die untere Verbindung war nicht mehr
    klickbar. Die Zurück-Option wird jetzt nur noch angehängt, wenn keine echte Kante zum selben
    Ziel existiert (bleibt als Notausgang für echte Einbahnstraßen). (2) Pfeilrichtungen wurden aus
    den rohen `top`/`left`-Prozentwerten berechnet, obwohl das Bild 1920×1047 ist — systematisch zu
    flach; jetzt mit Seitenverhältnis korrigiert. Zusätzlich neue Winkel-Relaxation
    (`spreadAngles()`, `MIN_ARROW_SEP = 42°`) in `karte.html`: geografisch fast gleich gerichtete
    Wege (bis herab zu 17° Abstand, z. B. an der Süßwasserquelle) werden so weit auseinander
    geschoben, dass jeder Pfeil frei liegt, bleiben dabei aber so nah wie möglich an ihrer echten
    Richtung.
  - Vorab **Vollcheck des Graphen** (Node/vm): 15 Knoten, 42 Kanten, keine ungültigen/doppelten
    Referenzen, keine unerreichbaren Knoten, keine einseitigen Paare — das Datenmodell selbst war
    in Ordnung, die Fehler lagen in der Darstellung/Freigabe-Logik. Offline mit Playwright
    verifiziert (`pnp-safe-test`, 0 Fehler): alle 42 Kanten lösen bei SL-Klick genau ein atomares
    Update auf den richtigen Zielknoten aus, alle 8 Ort-Kanten decken den Marker auf, an allen 15
    Knoten stimmt die Pfeilzahl und jeder Pfeil ist per `elementFromPoint` einzeln treffbar
    (Mindestabstand 49 px), Spieler-Klicks ändern `currentNode` nicht, Stimmen allein lösen 0
    Schreibzugriffe aus. Zusätzlich per Screenshot mit Debug-Overlay gegengeprüft.

### 2026-08-22 (Fortsetzung 2)
- **Fix: „Zwischen Wrack und Grotte" (`zwischenpunkt2`) und „ZP_Jungle" (`zp3`) sollten je vier
  gegenseitige Wege haben**, hatten aber (gleiche Ursache wie beim zp_3/zp_4/zp_5-Fix oben, vor
  dem Editor-Fix gezogen) jede Kante nur einseitig. Nach Hendriks Vorgabe fünf fehlende
  Rückrichtungen ergänzt: `zwischenpunkt2->zwischenpunkt1`, `zwischenpunkt2->zp3`,
  `zwischenpunkt2->zp_2`, `zp3->versteckte_grotte`, `zp3->zp_2`. Mit Node/vm-Skript auf
  Kanten-Validität/Erreichbarkeit geprüft, Debug-Overlay-Screenshot gegengeprüft, bestehende
  Playwright-Regression weiterhin mit 0 Fehlern. **Ein Vollcheck des gesamten Graphen zeigt noch
  10 weitere einseitige Kantenpaare aus derselben Vor-Editor-Fix-Ära** (u. a. `strand<->
  zwischenpunkt1`, `strand<->zp1l`, `zp<->die_aussichtsklippe`) - noch nicht angefasst, siehe
  Rückfrage an Hendrik im Gespräch, ob diese ebenfalls durchgehend beidseitig sein sollen — auf
  "ja, alle" ergänzt: fehlende Rückrichtung für alle 10 Paare nachgetragen (u. a.
  `zwischenpunkt1<->strand`, `wrack<->zwischenpunkt1`, `zp1l<->strand`, `zp<->zp3`,
  `die_aussichtsklippe<->zp`, `suesswasserquelle<->zp_3`, `suesswasserquelle<->zp_6`,
  `zp_6<->zp1l`). Voll-Check danach: 0 verbleibende einseitige Paare, 42 Kanten/15 Knoten
  insgesamt, alle vom Start erreichbar. Der ganze Riffinsel-Graph ist damit jetzt vollständig
  beidseitig begehbar (jeder Nachbar von jedem Nachbar aus erreichbar, kein Weg mehr nur per
  Zurück-Historie).

### 2026-08-22 (Fortsetzung)
- **`graph_editor.html`: Kante-Ziehen fragt jetzt nach der Gegenrichtung.** Ursache der oben
  beschriebenen zp_3/zp_4/zp_5-Fehler: eine gezogene Kante legte bisher immer nur die eine
  angeklickte Richtung an, der begehbare Standardfall in diesem Graphen ist aber ein Weg in
  beide Richtungen — die Gegenrichtung musste bisher separat gezogen werden und wurde dabei
  wiederholt vergessen. Nach dem Setzen einer Kante fragt der Editor jetzt per `confirm()`, ob
  auch die Gegenrichtung angelegt werden soll (mit eigenem, separat abgefragtem Sinneshinweis) -
  "Abbrechen" für den Fall, dass wirklich eine echte Einbahnstraße gewollt ist. Mit Playwright
  verifiziert (Zustimmen legt beide Kanten mit unterschiedlichem Hinweistext an, Ablehnen nur
  die eine), bestehender Test `test_graph_editor.js` weiterhin mit 0 Fehlern.

### 2026-08-22
- **Fix: drei Lücken in Hendriks Riffinsel-Graph** (`js/exploration_graphs.js`), anhand von
  Screenshots aus dem laufenden Test identifiziert und per Debug-Overlay/Koordinaten-Abgleich
  exakt lokalisiert (Knoten „zp_5", „Zirpen aus dem Unterholz" — einziger Knoten mit genau einer
  ausgehenden Kante, Position stimmte mit dem gemeldeten Fundort überein):
  - `zp_5` hatte keine Kante zur Süßwasserquelle, obwohl die Quelle umgekehrt zu `zp_5` führt
    (`suesswasserquelle -> zp_5` existierte, die Gegenrichtung fehlte) — neue Kante
    `e_zp_5_suesswasserquelle` ergänzt.
  - `zp_5`/`zp_4`/`zp_3` („Ein rutschiger Felsvorsprung") sollten laut Hendrik ein Dreieck mit
    gegenseitigen Wegen bilden (jeder der drei erreicht die beiden anderen), zusätzlich hängt
    `zp_3` weiter oben an `zp` („Böiger Wind auf dem Grat", Zugang zur Aussichtsklippe) und `zp_5`
    an `zp_6`. Im Graphen, wie er aus `graph_editor.html` exportiert wurde, existierte jede dieser
    Kanten aber nur in EINER Richtung (z. B. nur `suesswasserquelle -> zp_5`, nie umgekehrt; nur
    `zp_3 -> zp_4`, nie umgekehrt) — vermutlich, weil der Editor beim Ziehen einer Kante nur die
    angeklickte Richtung anlegt und die Gegenrichtung separat gezogen werden müsste. Ein erster
    Fixversuch hatte hier noch eine falsche Kante (`zp_5 -> zp_3`, von Hendrik nicht vorgesehen)
    ergänzt statt der tatsächlich fehlenden Gegenrichtungen. Nach Hendriks expliziter Aufschlüsselung
    (jeder Knoten einzeln benannt, wohin er zeigen soll) korrigiert: fünf fehlende Rückrichtungen
    ergänzt (`zp_3->zp`, `zp_4->suesswasserquelle`, `zp_4->zp_3`, `zp_4->zp_5`,
    `zp_5->suesswasserquelle`, `zp_5->zp_6`), die eine falsche Kante (`zp_5->zp_3`) wieder entfernt.
  - Der „Riffstrand"-Marker (`js/riffinsel_scenes.js`) saß bei `top:46,left:49` im Wasser statt am
    Strand, während der Startknoten `strand` im Graphen mit `top:56.4,left:54.2` schon korrekt auf
    dem Sand lag (Hendriks eigene, direkt am Referenzbild gebaute Koordinate). Erster Versuch ging
    fälschlich in die andere Richtung (Graph an den falschen Marker angeglichen, von Hendrik sofort
    korrigiert) — richtig ist umgekehrt: der Marker wurde auf die Graph-Koordinate `56.4/54.2`
    verschoben. Mit beiden Kandidaten-Positionen als Overlay auf dem echten Bild
    (`images/riffinsel.webp`) visuell gegengeprüft, bevor korrigiert wurde.
  - Mit einem Node/vm-Skript auf Kanten-Validität (alle `from`/`to` existieren) und Erreichbarkeit
    aller Knoten vom Startknoten aus geprüft (beides sauber), außerdem mit Playwright den Graphen
    über `renderScene('11.1')` gerendert und die neuen Kanten sowie die korrigierte Start-Position
    per Debug-Overlay-Screenshot gegen die Meldung verifiziert. Bestehende Playwright-Regression
    (`test_riffinsel.js` u. a.) läuft weiterhin mit 0 Fehlern.

### 2026-08-21 (Fortsetzung 10)
- **Ereignis-Flavortext an den Bildrand verschoben** (Hendriks Feedback: der bisherige kleine
  Text direkt am Positions-Ring war praktisch unlesbar). Neues, fest am unteren Bildrand
  verankertes `#erkFlavorText` in `karte.html` statt eines kleinen `.erk-pos-label`-Tooltips direkt
  am Ring — deutlich größer (21px statt 13px), eigener Kasten mit Goldrand, unabhängig davon, wo
  der Ring gerade auf der Karte sitzt. Zeigt weiterhin ausschließlich `node.text`, nie
  `erfolgText`/`misserfolgText`. Wird jetzt in jedem Rückkehr-/Fehlerpfad von
  `renderErkundungOnMap()` explizit aus-/eingeblendet, damit kein alter Text stehen bleibt, wenn
  keine Szene/kein Knoten (mehr) aktiv ist. Per Screenshot verifiziert.

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
