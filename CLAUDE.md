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

### 2026-10-25 (Fortsetzung 3) — Das Szenenziel lässt sich ein- und ausklappen
- **Hendriks Wunsch:** „Ich würde das übergeordnete Ziel gerne ein und ausklappen können."
- **Ein Klick auf die Überschrift klappt es zu**, ein zweiter wieder auf. Eingeklappt bleibt die
  **erste Zeile als Kurzfassung** stehen (bis 90 Zeichen, an der Wortgrenze geschnitten) — ein
  blankes Label allein sähe aus wie ein leeres Feld, und man muss am Tisch sehen können, was dort
  steckt, ohne es aufzuklappen.
- **Geklappt wird per CSS-Klasse, NICHT per Neuzeichnen**, und das ist die tragende Entscheidung:
  `renderSceneHead()` hängt an mehreren Firebase-Lauschern (Trigger, Notizen, Sichtbarkeit,
  Graph, Arena). Beide Textfassungen stehen deshalb **immer** im Markup, `.sh-goal.zu` entscheidet,
  welche zu sehen ist. Das Klappen muss von diesen Lauschern nichts wissen und sie nicht von ihm.
- **Der Zustand liegt im `localStorage`**, nicht nur im Speicher. Die Regie wird am Abend mehrfach
  neu geladen; ein Ziel, das dabei jedes Mal wieder aufklappt, wäre genau das Ärgernis, das hier
  weggehen soll. Dieselbe Linie wie beim Privat-Haken der Würfelleiste (14.10.) — ein Klapp-Zustand
  ist eine Haltung, keine Einzelentscheidung.
  - **Die Vorgabe ist OFFEN.** Eingeklappt als Vorgabe würde Information vor jemandem verbergen,
    der von der Klappe nichts weiß.
  - **Jeder Zugriff ist in `try/catch`** — in einem privaten Fenster oder bei geblockten
    Seitendaten wirft `localStorage`, und daran darf die Regie nicht hängen. Steht als eigene
    Prüfung da.
- **Mit der Tastatur erreichbar** (`tabindex`, `role="button"`, Enter und Leertaste,
  `aria-expanded` wandert mit) — dasselbe Muster wie bei den Marken-Chips (14.10.).
- **Der Zustand steht ganz oben bei den übrigen State-Variablen**, nicht bei den Klapp-Funktionen
  tausend Zeilen weiter unten: Der Firebase-Init-catch-Zweig ruft `renderAll()` **synchron** auf,
  und eine später deklarierte `let`-Variable ist dort noch in der TDZ. Genau diese Falle hat am
  23.08.2026 das Adminpanel gebrochen.
- **Getestet: 343 Prüfungen in `t_regie_wuerfel.js`, 0 Fehler** (18 neue, 1727 über vierzehn
  Skripte, ein Fehlschlag — der bekannte aus `t_figuren.js`).
  - Der Code wird **aus `js/regie_vault.js` geschnitten und ausgeführt**, nicht nachgebaut.
    **Zwei Schnitte**, weil Zustand und Funktionen aus dem TDZ-Grund weit auseinander liegen.
  - Geprüft wird das Verhalten, nicht eine Zeile: beide Textfassungen im Markup, der gemerkte
    Zustand sitzt **schon beim Zeichnen** an der Klasse, Klick schaltet um und schreibt mit,
    `aria-expanded` folgt, die Kurzfassung schneidet an der Wortgrenze und wirft Zeilenumbrüche
    weg, und ein gesperrter `localStorage` bricht nichts.
  - **Gegengeprüft:** Nimmt man das Merken heraus, schlagen zwei Prüfungen an — der eingeklappte
    Zustand käme ein Neuladen nicht hinüber.
- **Ein eigener Fehler, zweimal dieselbe Sorte:** Mein erster Schnitt-Endanker
  (`function renderSceneTree`) existiert nicht, und danach schlug die Korrektur fehl, weil
  `tests/t_regie_wuerfel.js` **CRLF** hat und mein Suchtext LF. Beides vor dem Schreiben gefangen.
- **[OFFEN] Die `Stimmung` darunter kann genauso lang werden** und ist weiter fest aufgeklappt —
  bei `4.1` sind es sechs Zeilen. Die Mechanik wäre dort dieselbe Klasse; nicht eingebaut, weil
  nicht beauftragt.

### 2026-10-25 (Fortsetzung 2) — Fehler: ich hatte ein Design-Dokument ins Szenenziel geschrieben
- **Hendriks Meldung, mit dem Panel-Text als Beleg:** „Das ist doch unsinn das so hinzuschreiben.
  Es sollte ein Ziel formuliert werden und etwas drumrum. Aber nicht so!"
- **Er hat recht, und die Zahlen sagen es deutlich.** `uebergeordnetesZiel` ist ein Ziel-Feld. Die
  übrigen Szenen liegen bei **33 bis 239 Zeichen** — `1.1` schlicht „An Bord der Golden Lion
  gelangen." `4.1` stand bei **2387**. Ich hatte die ganze Bibel-Sektion samt Zwei-Tage-Ablauf,
  Marken-Aufschlüsselung, beiden Ausgängen und Trigger-Statistik in ein einzelnes Feld kopiert,
  das am Tisch oben im Panel steht und mit einem Blick lesbar sein muss.
- **Jetzt 476 Zeichen** und in der Form, die er verlangt hat — ein Ziel, dann das Nötigste:

      Harwicks Schatz der Thahal holen und die Insel wieder verlassen. Der Weg dorthin
      führt über das Dorf: es muss auf Harwicks Seite gezogen werden, daran hängen
      Siegel, Höhle und Schatz. Die 15 Begegnungen mit der Marke [DORF-AUFGABE] sind
      der Punktestand — 5 bis 7 reichen, welche, entscheidet die Gruppe. Höhepunkt ist
      die Rede am Höhleneingang, nicht die Höhle selbst. Zwei Spieltage, rund
      zweieinhalb Stunden; Ablauf, Schwelle und beide Ausgänge stehen in Bibel 7.1a.

- **Nichts davon ist verloren**, und das war die Vorbedingung: Zwei-Tage-Tabelle, Punktestand,
  Rede mit beiden Pfaden und die Streichliste stehen seit heute Vormittag in **Bibel 7.1a**, der
  Ablauf zusätzlich an den Triggern von `ankunft_vanthei` und `die_warnung`. Das Feld verweist
  jetzt dorthin, statt es zu wiederholen.
- **Die Schwelle steht bewusst als ZIFFERN da** („5 bis 7"), nicht ausgeschrieben: Nur so kann
  `tests/t_szenen.js` weiter prüfen, dass sie überhaupt erreichbar ist — und genau diese Prüfung
  ist der Schutz gegen meinen Fehler von heute Vormittag.
- **Die Prüfung ist mitgezogen, nicht gelockert:**
  - Die Zahl der Aufgaben wird jetzt aus „Die 15 Begegnungen mit der Marke" gelesen, die Schwelle
    aus „5 bis 7 reichen".
  - **Die Aufschlüsselung je Ort wird nicht mehr gegen das Ziel geprüft** — sie steht dort nicht
    mehr, und eine Markdown-Tabelle in der Bibel zu parsen wäre fragiler als nützlich. Die Zahlen
    je Ort werden weiter **gezählt** und in der Fehlermeldung der Gesamtzahl mitgegeben, gehen
    also nicht verloren. Begründung samt Datum steht als Kommentar an der Stelle.
  - **Gegengeprüft:** Dreht man zehn Marken auf `[BEIWERK]` zurück, schlagen weiterhin
    13 Prüfungen an, darunter die entscheidende: `Schwelle 5-7 ist erreichbar (<= 5)` →
    `{"schwelle":"7","aufgaben":5}`.
- **Getestet: 1709 Prüfungen über vierzehn Skripte**, ein Fehlschlag — der bekannte aus
  `t_figuren.js`, unverändert seit dem 13.10.
- **Ein eigener Fehler beim Kürzen:** Mein Anker suchte sechs Leerzeichen Einrückung,
  `SZENEN_REGIE` hat aber vier. Das `assert` brach vor dem Schreiben ab, die Datei blieb
  unversehrt.
- **[OFFEN] `3.1` ist mit 531 Zeichen der nächstlängste** und ebenfalls von mir — die sieben
  Sturm-Stationen als Abhakliste. Deutlich kürzer als `4.1` vorher, aber doppelt so lang wie das
  nächste. Nicht angefasst, weil nicht beauftragt; falls es am Tisch auch dort stört, ist es
  dieselbe Kürzung.

### 2026-10-25 (Fortsetzung) — Die Insel ist umgebaut: ein Punktestand, eine Rede, eine Session
- **Hendriks Freigabe:** „Wunde durch den Balken kommt weg. passt. Umsetzen bitte." Damit ist der
  Umbau aus dem Vormittag ausgeführt — Inhalte von Hendrik, hier die Umsetzung.
- **Gemessen: 161 → 140 Trigger**, davon je Durchgang rund **118 gespielt** (nur 5–7 der 15
  Dorf-Aufgaben). Nachgezählt, nicht geschätzt.
- **Die Höhle hat jetzt einen Höhepunkt statt einer Mechanik-Kette** (2 Interaktionen mit 27
  Triggern → 4 mit 29):
  - **`die_gegenrede` ist von `stammesdorf` an `hoehle` umgezogen.** Alle sechs Trigger-IDs und
    alle drei `redeTeile` unverändert übernommen — sie liegen als `questDone/4.1/{id}` in
    Firebase, ein umbenannter nimmt der laufenden Kampagne lautlos ihre Haken.
  - **Neu `ankunft_von_see`** (6 Trigger): die Bühne. Beide Fraktionen stehen schon da, der
    Häuptling versperrt den Eingang, er ergreift das Wort — **die Spieler müssen sofort
    antworten**, ohne Vorbereitung.
  - **Neu `das_handgemenge`** (6 Trigger): der Fehlschlag-Pfad. **Bewusst kein Kampfmodus** — der
    Ausgang steht fest, beweglich ist nur der Preis. Die Spieler gewinnen körperlich, aber es ist
    ein Kampf, den alle verlieren.
  - **Die Kammer der Göttin: 18 → 11 Trigger.** Hebel, Seil, Reparatur-Komplikation, Gegenhalten
    und Boden-Probe sind weg. `siegel_uebergabe` und `waechter_laesst_passieren` gewinnen dadurch
    Gewicht, ohne dass eine Zeile daran geändert wurde.
  - **Mein Rätsel am silbernen Stein vom 23.10. ist gelöscht.** Es war die Abkürzung statt der
    Pflicht, und seine Lösung war 1-aus-4-Raten nach einer GM-Beschreibung. Die spielerische
    Lösung der Insel ist das Dorf und die Rede; ein zweites Rätsel konkurriert damit.
- **Der Auftrag, der gefehlt hat, steht jetzt im Dorf** (`ankunft_vanthei`, 8 → 11 Trigger):
  Harwick wird weggeschickt, **die Crew nicht**, und er bittet herauszufinden, wer zu ihm steht.
  **Erst dieser Satz macht aus den fünfzehn Aufgaben eine Aufgabe** statt einer Sammlung von
  Begegnungen. Dazu die bruchstückhafte Verständigung — sie ist zugleich der Grund, warum die
  Rede ohne Sorathi nicht funktioniert.
- **Neu `stammesdorf.die_warnung`** (7 Trigger) als Scharnier in den zweiten Tag: Ta'ahal will die
  heilige Stätte abschotten, das hat es noch nie gegeben, die Überzeugten wollen Vanthai den Stein
  geben und ihn an der Höhle treffen. Harwick bricht sofort zum Schiff auf — **Fremde kommen von
  See.** Ein Trigger nennt ausdrücklich die Reihenfolge Dorf → Schiff → Höhle.
- **Der Strand: 52 → 26 Trigger.** `dirk_payoff`, `loser_balken`, `lagerleben_am_strand` und
  `kajuete_unterlagen` sind weg; `landung` bekommt Wats Abwinken samt Hendriks Wortlaut und den
  Grundstein zum Nachbohren („nicht zufällig angesteuert", direkte Fragen werden abgeblockt).
  - **`eber_und_wundbrand` und `sorathi_auf_dem_rueckweg` bleiben** — das ist der Rückweg am
    zweiten Tag, und der liegt in Hendriks Reihenfolge **vor** der Höhle. Damit ist mein eigener
    Haupteinwand von heute Vormittag (31 Trigger hinter dem Höhepunkt) von selbst erledigt, und
    der Rückweg speist die Höhle sogar: Sorathi ist dadurch an Bord und kann übersetzen.
- **Das Lager ist zugespitzt** (12 → 15 Trigger, nichts gelöscht): Die Frage nach Jessica **beendet
  die Szene** — Harwick ist danach zu keinem Gespräch mehr zu bewegen, und das steht jetzt am
  Trigger. `cormacs_tribut` ist umgeschrieben: **Cormac sagt nichts**, er schaut Harwick nach und
  hält seinen Knoten. Neu dazu: Sorathi bietet von sich aus seine Hilfe an, und es gibt
  Dorfbewohner, die an Vanthai glauben.
- **`sam_oakleys_wunde` ist weg** (Hendriks Entscheidung) — sie verwies auf die Wunde vom losen
  Balken und verlor mit ihm ihre Prämisse. Damit **15 statt 16 Dorf-Aufgaben**: Dorfplatz 7 ·
  Markt 5 · Heilerin 2 · Tempel 1.
- **Der Diebstahl des Siegels ist an fünf Stellen abgelöst**, und zwar **gekennzeichnet statt
  gelöscht:** `gegenrede_misslingt` (hieß „Diebstahl-Plan nötig"), `zeit_abgelaufen_diebstahl`,
  der `ortHinweis` am Tempel („Überzeugen/Diebstahl/Gewalt"), die `kurz` des Wachpostens
  („erleichtert einen späteren Diebstahl-Versuch" → zahlt in den Punktestand) und Sorathis
  Vorstellung in `ankunft_vanthei` („einziger Zugang zu Diebstahl/Aufhetzen" → über ihn kommen
  Warnung und Übersetzung).
  - **`offene_diskussion_siegel` ist umgelenkt, nicht entfernt** — der Trigger hält das einzige
    `grantsQuest`-Beispiel der Bibel (2.9). Die Diskussion bleibt, ihr Gegenstand wechselt: wen
    man morgen noch gewinnen muss und wer vor der Höhle sprechen soll.
- **Zwei verwaiste Kommentarblöcke gefunden, weil ein `assert` nicht aufging** — nicht durch
  Hinsehen. Einer beschrieb die Rede noch im Dorf und nannte „10 der 16", der andere erklärte mein
  gelöschtes Rätsel samt dem entfernten Hebel-Weg. Beide bereinigt, die Rede-Erklärung ist an
  ihren jetzigen Ort umgezogen. **Eine Doku, die etwas anderes sagt als der Code, ist genau der
  Fehler vom 14.10.** (fünf Wochen falsche Auskunft) — und Kommentare sind Doku.
- **Neue Prüfung in `tests/t_szenen.js` (66 neue), und sie ist der eigentliche Gewinn:** Sie hält
  drei Dinge zusammen, die auseinanderlaufen können — jede Dorf-Aufgabe trägt ihre Marke, die Zahl
  im Szenenziel stimmt mit der gezählten, und **die genannte Schwelle ist überhaupt erreichbar.**
  Dazu: keine Insel-Interaktion ohne Marke, die Rede liegt an `hoehle` und **nicht mehr** an
  `stammesdorf`, alle sechs Rede-Trigger-IDs als **Kopie** festgenagelt.
  - **Gegengeprüft auf einer Kopie, und das ist der Beleg:** Dreht man zehn Marken auf
    `[BEIWERK]` zurück — also den Stand vom 23.10. —, schlagen **15 Prüfungen** an, und die
    entscheidende nennt den Fehler wörtlich: `Schwelle 5-7 ist erreichbar (<= 5)` →
    `{"schwelle":"7","aufgaben":5}`.
  - **Eine Prüfung habe ich wieder herausgenommen, bevor sie jemandem im Weg stand:** Sie zählte
    das Wort „Diebstahl" im Inselteil und versuchte, lebende von gekennzeichneten Vorkommen zu
    unterscheiden. Das prüft Formulierung, nicht Verhalten — und eine Prüfung, deren Logik ich
    selbst nicht in einem Satz erklären kann, ist schlechter als keine.
- **Getestet: 1713 Prüfungen über vierzehn Skripte**, ein Fehlschlag — der bekannte aus
  `t_figuren.js`, unverändert seit dem 13.10.
- **Bibel 7.1a ist komplett neu**, mit der Gewichtung vom 23.10. als **abgelöst gekennzeichnet
  statt gelöscht**, samt der Begründung, warum sie falsch war. Dazu steht dort die
  Zwei-Tage-Tabelle, der Punktestand, die Rede an der Höhle mit beiden Ausgängen und die Liste
  des Gestrichenen.
- **Ein Nachtrag war unnötig, und das ist eine Korrektur an mir:** Ich hatte heute Vormittag
  notiert, Bibel 2.7 erlaube den Knoten nur **einmal**. Nachgelesen: dort steht seit je **„maximal
  zwei Szenen"**. Hendriks Wunsch war also immer schon Kanon. Ergänzt ist nur, **welche zwei
  Plätze jetzt belegt sind** (Nachtlager der Insel, nachts auf dem Schiff) — damit ein drittes
  Auftauchen beim Artefakthandel nicht nebenbei passiert, sondern als Entscheidung gegen die
  Regel.
- **Bibel 10.4 trägt jetzt eine Schuld statt einer Zusage:** Dort stand, Dirks Payoff komme
  „nach der Sturm-Szene" — die Einlösung war `schiffswrack.dirk_payoff` und ist gestrichen. Als
  `[OFFEN]` eingetragen, mit `5.1` als naheliegendem Ort, aber nicht eigenmächtig verschoben.
- **`INSEL-IN-EINER-SESSION.md` ist gelöscht**, wie es im Dokument selbst vorgesehen war: der
  Inhalt steht jetzt in Bibel 7.1a. Ein Arbeitsdokument, das „16 Dorf-Aufgaben" sagt, während der
  Code 15 hat, ist schlimmer als keines.
- **Vier eigene Fehler beim Bauen, alle vor dem Schreiben gefangen:**
  1. **Ein Blindgänger im eigenen Skript:** `loeschen('sorathis_erkenntnis') if False else None` —
     die Zeile tat nichts. Und sie sollte es auch nicht: **`sorathis_erkenntnis` ist der Grund,
     warum Sorathi hilft und warum die Dorfbewohner Vanthai den Stein geben wollen.** Mein Plan
     hatte ihn zum Streichen vorgesehen; nachgelesen trägt er die Verbindung vom Lager zur Höhle.
     Außerdem gab es `offene_diskussion_siegel` in meiner Streichliste als „nicht vorhanden" —
     vorhanden war er, nur in anderer Formatierung, weshalb mein `grep`-Muster ihn übersah.
     **Merke: eine regexbasierte Trigger-Liste ist keine Bilanz, die Formatierung wechselt.**
  2. **Die Heredoc-Falle, zum vierten Mal im Projekt** — `—` in einem Python-Suchtext kam
     durch das Bash-Heredoc nicht an. Danach dieselbe Sorte Verwechslung umgekehrt: im Quelltext
     steht an manchen Stellen der **Escape** `·`, nicht das Zeichen, und mein Suchtext trug
     das Zeichen.
  3. **Ein doppeltes Komma** (`},,`) — mein Einschub setzte ein Komma, das `spanne()` längst
     mitgenommen hatte. Gezielt repariert statt `git checkout`: an der Datei hingen drei
     ungesicherte Schritte. Am 23.10. hatte ich mit genau diesem Befehl uncommittete Arbeit
     vernichtet.
  4. Die bekannte vm-Falle: `const SZENEN_REGIE` ist von außen nicht als Kontext-Eigenschaft
     sichtbar — im Kontext geholt. Dazu die `/tmp`-Falle: Python sieht den Pfad anders als die
     Git-Bash, die Gegenprobe läuft deshalb im Scratchpad.
- **[OFFEN] Was „der Baum" in Wats Abwinken bedeutet, steht nirgends im Kanon.** Hendriks Wortlaut
  ist übernommen („Wenn dein Scheiß mit dem Baum raus kommt, möchte ich hier nicht
  festhängen."), und am Trigger steht, dass die Spielleitung es **nicht** erklärt (Design-Regel
  2.8). Als Vorgeschichte zwischen Wat und Harwick auf dieser Insel ist es aber eine echte Lücke.
- **[OFFEN] Der Hinweis aufs Schmugglernest** kam diegetisch aus `kajuete_unterlagen`, und die
  ist gestrichen. Es gibt einen zweiten Weg (das Schmugglerlied mit Koordinaten in
  `kapitaenskajuete`, Szene `5.1`) — ob der allein trägt, ist am Tisch zu sehen.
- **[OFFEN] `4.1` steht weiter auf dem alten Wertesystem.** Der neue Text ist sauber, die rund 45
  übrigen Probennennungen der Szene sind es nicht. Eigener Durchgang, hier nicht beauftragt.

### 2026-10-25 — Fehler: ich hatte den Punktestand der Insel als Beiwerk markiert
- **Hendriks Auftrag:** „Die Insel ist immer noch zu lang und zu starr und das Ende hat quasi
  keine spielerische Lösung. Ich würde die Insel gerne in einer Session 2 bis 2,5 h
  durchspielen." Dazu, nach dem Messen: **„Wir sollten ein mal festlegen, welche Station wofür
  ist und was/ob Spieler hier eine explizite Aufgabe haben."**
- **Erst gemessen, und die Zahl widerlegt meinen eigenen Changelog von vorgestern:** Die Insel
  hat **161 Trigger, davon 123 in den tragenden**. Bei 150 Minuten wären das **1,2 Minuten pro
  Trigger**. Meine Behauptung vom 23.10. — „die tragenden plus drei Beiwerk sind rund
  zweieinhalb Stunden" — war eine Schätzung ohne Rechnung und schlicht falsch.
- **DER BEFUND, und er ist ein schwerer Fehler von mir:** `stammesdorf.die_gegenrede` sagt
  wörtlich *„ca. 10 der 16 Aufgaben"*. Und es sind **genau 16** — Dorfplatz 7 · Markt 5 ·
  Heilerin 3 · Tempel 1. **Das Dorf ist ein Überzeugungsspiel mit Punktestand**, und sein
  Ergebnis gabelt in zwei echte Wege.
  - **Am 23.10. habe ich zehn dieser 16 mit `[BEIWERK]` beklebt** und ins `uebergeordnetesZiel`
    von `4.1` geschrieben: *„Spiel drei bis vier Beiwerk-Begegnungen, den Rest lass liegen:
    niemand verpasst etwas."*
  - **Bei 3 von 16 ist die Schwelle von 10 nie erreichbar.** Meine Anweisung hätte die Gegenrede
    **garantiert** ausfallen lassen und jede Gruppe in den Fehlschlag-Pfad gezwungen — lautlos,
    und für die Spielleitung nicht als Fehler erkennbar, weil es sich wie ihre eigene
    Entscheidung anfühlt. **„Niemand verpasst etwas" war die exakte Umkehrung der Wahrheit:**
    man verpasst den Hauptpfad der Insel.
  - **Das ist dieselbe Fehlerklasse wie der `arenaBossLebt()`-Fall vom 18.10.** — eine
    Pflichtmechanik, die lautlos wirkungslos wird, statt sichtbar zu brechen.
- **Behoben: alle 16 tragen jetzt `[DORF-AUFGABE]`** statt `[TRAGEND]`/`[BEIWERK]`. Nachgezählt:
  16 Dorf-Aufgaben, 12 tragend, 2 Beiwerk, keine ohne Marke.
- **Die Antwort auf Hendriks Frage stand damit im Code, nicht in meinem Kopf:** Die Insel hat
  **genau eine** Kernaufgabe — *das Dorf auf Harwicks Seite ziehen* — mit Punktestand, einer Rede
  als Finale und einem Scheiter-Pfad, der nicht in eine Sackgasse führt.
- **Mein Erkundungs-Graph-Vorschlag ist damit zurückgezogen.** „Zu starr" entstand nicht aus der
  Struktur: **10 von 16 wählen ist Spielerentscheidung** und war immer eingebaut — ich hatte die
  Wahl zugeklebt. Der Graph wäre der große Eingriff gewesen und ist nicht nötig.
- **Hendriks Umbau, der daraus folgt** (Inhalte von ihm, hier nur festgehalten):
  - **Zwei Spieltage.** Tag 1: Strand (kurz) → Weg → Dorfankunft → 3–4 Aufgaben → Lager.
    Tag 2: 2–3 Aufgaben → Warnung → Schiff → See → Höhle. **Reihenfolge Dorf → Schiff → Höhle →
    fertig.**
  - **Der Auftrag, der gefehlt hat:** Harwick wird weggeschickt, **die Crew nicht** — er bittet
    herauszufinden, wer zu ihm steht. Erst damit sind die 16 Aufgaben eine Aufgabe und nicht eine
    Sammlung von Begegnungen.
  - **Die Rede findet nicht im Dorf statt, sondern an der Höhle.** Die Dorfbewohner warnen, dass
    der Häuptling die heilige Stätte abschotten will, und wollen Vanthai dort treffen. Damit
    **wird der Punktestand sichtbar**: die Überzeugten laufen mit und stellen sich gegen ihren
    eigenen Häuptling.
  - **Crew und Spieler kommen von See**, weil sie Fremde sind — Tradition. Sorathi begleitet sie
    und übersetzt.
  - **Die Rede wird unverändert übernommen.** Alle drei Teile samt vier Güteklassen bleiben; das
    Siegel bleibt ihr Preis. Nachgeprüft: Teil 2 setzt voraus, dass die Spieler von Jessica
    wissen — das geschieht in der Nacht zuvor im Lager, die Reihenfolge trägt. Der Patzer-Satz
    referenziert bereits die Höhle.
  - **Misserfolg:** Handgemenge zwischen den beiden Dorffraktionen. Die Spieler gewinnen
    körperlich, aber es ist **ein Kampf, den alle verlieren** — verletzte Dorfbewohner, gedrückte
    Stimmung. **Kein Kampfmodus:** der Ausgang steht fest, beweglich ist nur der Preis.
  - **Was Hendrik streicht:** loser Balken, Dirks Payoff, Lagerleben, Kajüten-Unterlagen (Strand)
    sowie Hebel, Seil, Reparatur, Gegenhalten, Boden-Probe (Höhle). **Und mein Rätsel am
    silbernen Stein vom 23.10. fliegt komplett** — es war die Abkürzung statt der Pflicht, und
    seine Lösung war 1-aus-4-Raten nach GM-Beschreibung. Die spielerische Lösung der Insel ist
    das Dorf und die Rede; ein zweites Rätsel konkurriert damit, statt es zu belohnen.
- **Mein ursprünglicher Haupteinwand ist durch Hendriks Neuordnung von selbst erledigt:** Ich
  hatte kritisiert, dass **31 Trigger hinter dem Höhepunkt** liegen (Eber, Sorathi, Kajüte,
  Dirk — alle am Strand, alle nach dem Schatz). In seiner Reihenfolge liegt der Weg zum Schiff
  **davor** und speist die Höhle sogar, weil Sorathi dadurch an Bord ist und die Rede übersetzen
  kann. Die Insel endet jetzt mit ihrem Höhepunkt.
- **Neue `INSEL-IN-EINER-SESSION.md`** — Arbeitsdokument, kein Kanon: gemessener Ausgangszustand,
  die eine Kernaufgabe, die Kette über zwei Tage mit Trigger-Budget (**~88 Trigger, rund 150
  Minuten**), die Rede mit beiden Pfaden, was gestrichen wird, die Kanon-Nachträge und vier
  offene Punkte. Wandert nach der Umsetzung in Bibel 7.1a.
- **Das Szenenziel von `4.1` ist neu geschrieben** und trägt jetzt die Zwei-Tage-Struktur, die
  16 Aufgaben als Punktestand, die 5–7er-Schwelle und beide Pfade — statt meiner falschen
  Anweisung.
- **Getestet: 1626 Prüfungen über vierzehn Skripte**, ein Fehlschlag — der bekannte aus
  `t_figuren.js`, unverändert seit dem 13.10. Nachgezählt wird aus den **Markern der Szene
  `4.1`**, nicht aus einer Namensliste.
- **[OFFEN] Drei Kanon-Stellen müssen nachgezogen werden:** Bibel 10.4 verspricht Dirks Payoff
  ausdrücklich nach dem Sturm — fällt er weg, steht dort eine Schuld, die nie eingelöst wird.
  Bibel 2.7 sagt, der Knoten dürfe nur **einmal** auftauchen; Hendrik will ihn zweimal (Lager und
  nachts auf dem Schiff), die Regel braucht also eine begründete Ausnahme. Und Bibel 7.1a muss
  komplett neu, mit der alten Fassung als abgelöst gekennzeichnet statt gelöscht.
- **[OFFEN] `sam_oakleys_wunde` verliert seine Prämisse** — die Aufgabe bei der Heilerin verweist
  auf die Wunde vom losen Balken, und der fällt weg. Entweder andere Herkunft oder **15 statt 16**
  Dorf-Aufgaben.
- **[OFFEN] Schritt 3, der eigentliche Umbau**, steht noch: Strand kürzen, Dorfankunft als
  Auftrag, Lager-Verschmelzung, `die_gegenrede` nach `hoehle` umhängen, Höhle entschlacken.

### 2026-10-24 — Wat wird weich, und Josiah findet sein Vertrauen wieder
- **Anlass war Hendriks Bericht aus der gespielten Sitzung** (Tag auf dem Schiff + Sturm), kein
  Transkript und kein Export — sein eigener Rückblick. Daraus zwei Korrekturen an mir und eine
  neue Szene.
- **Der Abgleich hat drei Kanon-Stellen bestätigt, die am Tisch genau so gespielt wurden:**
  **Pip** trägt in `js/npcs.js` `Athletik 3 · Heimlichkeit 3` bei Attributen auf 1 und die Notiz
  „Kommt überall durch, wo ein Erwachsener stecken bliebe" — dass der Spieler kaum mithielt, ist
  sein Blatt. **Ezra und Ned am Bug** sind Bibel 10.3 wörtlich („unterhalten sich über den
  Bordellbesuch — konkret über den Vorfall"). **Dirk** ist Bibel 10.4 punktgenau: nur eine echte
  Handwerks-Probe weckt ihn, „bei Erfolg taut er kurz auf und merkt sich den Spieler".
- **Hendriks Korrektur 1: die Waffenkammer.** Ich hatte sie aus der Decksliste (Bibel 3.3)
  hergeleitet, wo sie **gar nicht vorkommt** — dort steht nur „Licht fällt gedämpft durch eine
  Gitterluke von einem darüberliegenden Innendeck". Hendrik verortet sie **hinter der Werkstatt**,
  als **fiktiven Raum ohne eigene Funktion**: kein Marker, keine Szene, kein Inhalt. Der Frachtraum
  liegt **teilweise darunter, ist aber ausschließlich von oben zugänglich** — kein Durchgang nach
  unten. In Bibel 3.3 nachgetragen, weil genau das erklärt, warum das Geräusch oben zu hören war,
  ohne dass jemand hinabsteigen konnte.
- **Hendriks Korrektur 2, und sie dreht den Finale-Beat:** Ich hatte aus seinem Bericht gelesen,
  Josiah habe Wat aufgegeben („tote Augen, zeigten nichts"), und das als bitteren Vorgriff auf
  `wat_und_josiah_fallen` gefeiert. **Falsch.** Hendrik: „Josiah wird nicht von Wat ablassen. Er
  wird wieder die Stärke finden, um Wat zu vertrauen." Damit stirbt Josiah im Finale für einen
  Mann, in dem er das Gute **wiedergefunden** hat — nicht für einen, den er abgeschrieben hatte.
  Wärmer, und es trägt besser.
- **Der eigentliche Fund: Hendriks „Junge auf der Insel" ist SORATHI, und die Szene löst eine
  Schuld ein, die er sich selbst notiert hat.** Die ganze Vorgeschichte steht längst in
  `ORTE.lager.sorathis_besuch`: Wat fand die vom Wildschwein aufgeschlitzte Mutter und den kleinen
  Jungen beim Jagen, kniete vor dem verängstigten Kind und versprach rau „Sie wird wieder gesund",
  ließ sich danach nie im Dorf blicken — nickte Sorathi aber jedes Mal anerkennend zu. Und dort
  steht wörtlich:

      GM-Hinweis: Vorgriff fuer eine spaetere Szene - konfrontiert man Wat spaeter damit,
      bleibt er schroff, aber bei der Nachricht von Sorathis Kupferritus ODER seiner Hilfe
      kann selbst er sich ein kleines Laecheln nicht verkneifen.

  **Hendriks Szene erfüllt beide Bedingungen auf einmal** — der Ritus ist der **Kupferritus**, den
  Sorathi vor zwei Mondläufen abgeschlossen hat (ebenfalls schon Kanon), und die Hilfe ist das
  Mittragen des verletzten Ezra. Nichts davon musste erfunden werden.
- **Neue Interaktion `schiffswrack.sorathi_auf_dem_rueckweg`** (9 Trigger, `[TRAGEND]`): Sorathi
  begleitet die Gruppe zum Schiff, fasst bei Ezra mit an **ohne dass ihn jemand auffordert**,
  erzählt unterwegs vom Kupferritus. Wat hört zu, seine Züge werden weicher — fast Stolz —, dann
  der raue Spruch: **„Dass du kleiner Scheißer mal wirklich in der Lage sein wirst, dein Dorf zu
  beschützen, hätte ich nicht gedacht."**
  - **Platziert an `schiffswrack`, hinter `eber_und_wundbrand`** — dessen `kurz` sagt bereits „Auf
    dem Rückweg vom Dorf erwischt ein Wildschwein Ezra Coombe". Die beiden Szenen greifen
    ineinander, statt nebeneinander zu stehen.
  - **Kein Wurf.** Es gibt nichts zu entdecken und nichts zu schaffen; Mechanik würde den Moment
    zerreden (Bibel 2.6).
  - **Der Merkposten ist der Kern:** Wer Wat nicht kennt, hört eine Beleidigung an einem Jungen,
    der gerade einen Verletzten mitgetragen hat. Sorathi, Josiah und jeder, der Wat kennt, hört
    das Größte, was dieser Mensch zu geben hat. **Die Spielleitung erklärt das ausdrücklich NICHT**
    — sie spielt es und lässt die Spieler selbst entscheiden, was sie gehört haben
    (Design-Regel 2.8).
  - **Wat wird dadurch nicht warm**, und das steht als eigener Trigger da: Kanon ist, dass er
    distanziert bleibt. Der Spruch ist ein Augenblick, keine Wandlung — wer ihn darauf anspricht,
    bekommt Schroffheit zurück.
  - Ein Trigger `zahlt_ins_finale` nennt die Zahlstelle, damit sie am Tisch nicht untergeht.
- **Die Zahlen von gestern sind nachgezogen, an BEIDEN Stellen.** Mit der neuen Szene sind es
  **30 Interaktionen, 18 tragend, 12 Beiwerk** — gegengezählt, nicht geschätzt. Geändert im
  `uebergeordnetesZiel` von `4.1` **und** in Bibel 7.1a (Tabelle, Fließtext, Stundenangabe). Eine
  Doku, die etwas anderes sagt als der Code, ist genau der Fehler vom 14.10. (fünf Wochen falsche
  Auskunft) — und ich hatte die Zahlen erst gestern selbst dort hineingeschrieben.
- **Getestet: 1626 Prüfungen über vierzehn Skripte**, ein Fehlschlag — der bekannte aus
  `t_figuren.js`, unverändert seit dem 13.10. Die Szene wird dabei **wirklich aufgelöst** (Titel,
  9 Trigger, Vorlese-Spruch mit echten Umlauten), und die Insel-Zählung wird aus den **Markern der
  Szene `4.1`** abgeleitet statt aus einer Namensliste.
- **Zwei eigene Fehler, beide in derselben Datei und beide vermeidbar:**
  1. **Unmaskierte Anführungszeichen im `details`-Text.** Mein `js()`-Helfer wandelte nur
     Zeilenumbrüche, nicht die geraden `"` um die Szenentitel — `js/regie.js` war unparsebar
     (`SyntaxError: Unexpected identifier 'Sorathis'`). Jetzt maskiert der Helfer sie, **und** im
     Text stehen ohnehin nur typografische „…" wie bei den Nachbar-Interaktionen.
  2. **Die Heredoc-Falle, am zweiten Tag in Folge und diesmal beim Reparieren.** Ich wollte das
     Skript per `python - << 'PYEOF'` nachpatchen; der Backslash in `'\n'` kam nicht an, das
     `assert` meldete „0 Treffer" — und weil ich beides in einer Befehlskette hatte, lief danach
     **das unveränderte Skript ein zweites Mal** und brach die Datei erneut. **Merke, jetzt
     wirklich scharf: kein Heredoc für Python mit Backslashes, auch nicht mit quotiertem
     Delimiter — und eine fehlgeschlagene Reparatur nicht mit dem Folgebefehl verketten.**
  - **Vor dem `git checkout -- js/regie.js` geprüft, ob fremde Arbeit dranhängt** (`git status`,
    `git diff --stat`: nur meine 20 Zeilen). Am 23.10. hatte ich mit genau diesem Befehl
    uncommittete Arbeit vernichtet.
- **[OFFEN] Drei Nachträge aus dem Kontinuitäts-Check stehen noch**, Hendriks Entscheidung:
  (a) Trigger 4 von `wat_und_der_junge` heißt „Jemand läuft zu Josiah — **nicht zum Kapitän**",
  aber am Tisch war Harwick anwesend, hat Cormac und Tom zum Festhalten befehligt, Wat direkt
  befohlen — und Wat hat **auch ihn** ignoriert. Das widerlegt den Beat nicht, es schärft ihn, aber
  der Trigger-Text liest sich jetzt falsch. (b) Wats Begründung aus dem Spiel („Wenn das Balg uns
  in die Fässer gepisst hat, werden wir auf dem Meer verdursten!") gibt ihm ein Motiv, das die
  Szene im Kanon **gar nicht hat**. (c) Neds Gewissheit, einen Doppelgänger eines Spielers im
  Bordell gesehen zu haben, verwandelt die Kanon-Zeile „reine Verlegenheit, **keine Folge**" in
  einen laufenden Faden.
- **[OFFEN] Ohne Export bleibt der Kontinuitäts-Check unvollständig:** welche Trigger wirklich
  abgehakt sind und wie der Ruf-Stand aussieht, ist nicht nachprüfbar. Relevant vor allem bei Pip,
  dessen Blatt sagt: „Spieler sind freundlich zu ihm oder beschützen ihn → die ganze Crew taut auf."
- **[OFFEN] `4.1` steht weiter auf dem alten Wertesystem.** Die neue Szene ist davon nicht
  betroffen — sie hat **keine Probe** —, die rund 45 übrigen Probennennungen der Insel aber schon.

### 2026-10-23 (Fortsetzung) — Die Insel ist gewichtet, und das Ende hat ein Rätsel
- **Hendriks Frage:** „Wie kann ich die Insel irgendwie streamlinen und kürzer bauen?" Dazu nach
  der Auswahl: **„Das Ende muss auch noch ein Rätsel bekommen oder irgendwie etwas, was die
  Spieler spielerisch lösen können."**
- **Erst gemessen, dann gebaut — und die Messung hat die Aufgabe geändert:** Die Schatzinsel hat
  **29 Interaktionen auf neun Orten**, mehr als Grimsgate und das Schiff. **Das Problem ist die
  ANZAHL, nicht die Länge der einzelnen Szene.** Also gewichten statt kürzen.
- **Eine geführte Kette wie im Sturm wäre hier falsch**, und das ist der tragende Gedanke: Der
  Sturm ist ein Korridor — alle an Deck, die Reihenfolge **ist** die Dramaturgie. Die Insel ist
  das Gegenteil: Die Gruppe teilt sich auf, wählt Wege, und das Dorf **soll** offen bleiben
  (Design-Prinzip 2.3, Wiederspielbarkeit durch Verpassen). Eine erzwungene Reihenfolge hätte
  genau das zerstört.
- **1. Jede der 29 trägt jetzt eine Marke, und nichts ist gelöscht.** Vorne im `kurz`-Feld, also
  genau dort, wo das Panel sie zuerst zeigt: **17 [TRAGEND], 12 [BEIWERK]**, keine ohne.
  - **Die Marke allein nützt nichts** — deshalb steht die Anweisung im `uebergeordnetesZiel` der
    Szene `4.1`, wo die Spielleitung sie vor Augen hat: **drei Beiwerk-Begegnungen, vier
    höchstens**, welche entscheidet die Gruppe durch das, wohin sie geht. **Alle 29 sind gut
    vier Stunden, die tragenden plus drei etwa zweieinhalb — und es fehlt nichts.**
  - **„Den Rest lass liegen" steht ausdrücklich dabei.** Die zwölf sind ein Vorrat, aus dem man
    greift, keine Liste, die abzuarbeiten ist. Ohne diesen Satz spielt die Spielleitung im
    Zweifel doch alles.
  - **Die Einordnung ist mein Aufschlag**, und das steht so da: Eine Beiwerk-Begegnung, die am
    Tisch wichtiger ist, wird umsortiert — es ist eine Zeile.
- **2. Der Strand ist gebündelt, 8 → 6.** Wat beim Holzhacken, Josiahs Feuerstelle und Josiahs
  Geschichte am Feuer standen als **drei gleichrangige** Interaktionen am Wrack — und waren
  damit nicht als das zu erkennen, was sie sind: **der Parallelstrang für die, die NICHT ins
  Dorf mitgehen.** Eine von ihnen sagte das sogar wörtlich im Titel. Jetzt ein Block
  `lagerleben_am_strand` mit drei abgesetzten Momenten.
  - **Alle neun Trigger-IDs unverändert übernommen** — sie liegen als `questDone/{szene}/{id}` in
    Firebase, ein umbenannter nimmt der laufenden Kampagne lautlos ihre Haken.
    **Interaktions-Keys werden dagegen nicht persistiert** (Changelog 22.08.2026), das
    Zusammenlegen selbst ist deshalb unkritisch.
  - **Nicht weiter als auf 6**, obwohl mein eigenes Auswahl-Label „8 → 4" sagte: Die übrigen fünf
    sind tragend (Landung, loser Balken, Dirks Sturm-Payoff, Ezras Wundbrand → führt nach `7.1`,
    Kajüten-Unterlagen → Hinweis aufs Schmugglernest). Weiter zu bündeln hätte Beats
    zusammengeworfen, die nichts miteinander zu tun haben.
- **3. Ein Faden in der Höhle ist gestrichen.** Die Kammer der Göttin trug **drei parallele Fäden
  gleichzeitig**: Hebel-Mechanismus, Reparatur-Komplikation und eine Split-Fokus-Beruhigung der
  Wächter aus der Ferne. Der dritte ist weg — er verlangte, dass sich die Gruppe **mitten im
  Mechanismus-Problem** aufteilt, und das hat am Tisch niemand gleichzeitig im Kopf.
  - **Dass die Wächter passieren lassen, bleibt** (`waechter_laesst_passieren`) — das ist Kanon
    (Codex Kapitel III, Höhlenwache-Dienstsystem der Thahal). Gestrichen ist die **Probe** darauf,
    nicht der Beat. Kammer: **19 → 18 Trigger, 16 → 9 Proben.**
- **4. Das Rätsel am silbernen Stein** (neue Interaktion `hoehle.das_raetsel_am_silbernen_stein`,
  9 Trigger). Die Höhle endete bisher in reiner Mechanik: Hebel, Körperproben, Truhen tragen.
  - **Gebaut ausschließlich aus Vorhandenem**, nichts dazuerfunden: das gebündelte Licht auf dem
    silbernen Stein wandert im Tagesverlauf über vier Mulden, und die Inschrift am Sockel der
    Göttinnenfigur — **„Vertraut den Vorzeichen"**, längst Kanon in `dorf_heilerin` — sagt, welche
    Mulde den Stein aufnehmen muss.
  - **Das Rätsel ist die ABKÜRZUNG, nicht die Pflicht.** Der alte Weg über Hebel und Körperkraft
    bleibt vollständig erhalten. Wer löst, spart sich die Komplikation; wer nicht löst oder es gar
    nicht findet, kommt trotzdem an den Schatz. **Ein Rätsel, das den Zugang blockiert, wäre ein
    Fehlschlag-Ende — und die Insel ist eine Pflichtstation.**
  - **Die vier Zeichen sind ein Aufschlag** (Fisch über Wellen · Vogel mit ausgebreiteten
    Schwingen · Hand mit gespreizten Fingern · ein Ring mit drei Punkten = die Lösung, passend
    zum Sockel der Figur) und ausdrücklich als solcher im `details`-Feld gekennzeichnet.
  - **Nebenwirkung, die mitdokumentiert ist:** `dorf_heilerin.die_figur_der_goettin` ist damit
    **tragend** geworden — wer die Heilerin überspringt, kann das Rätsel nur noch durch eigenes
    Nachdenken lösen.
- **Bibel 7.1a ist neu** (die Insel hatte überhaupt keinen eigenen Abschnitt, nur eine Zeile in
  der Gesamtübersicht): Marken-Tabelle, die Drei-Begegnungen-Regel, die Begründung gegen die
  geführte Kette, die Bündelung, der gestrichene Faden und das Rätsel. **Zum Wächter-Faden stand
  in der Bibel nichts** — es gab also keine abgelöste Kanon-Stelle zu kennzeichnen, sondern eine
  Lücke zu füllen.
- **Getestet: 1647 Prüfungen über vierzehn Skripte**, ein Fehlschlag — der bekannte aus
  `t_figuren.js`, unverändert seit dem 13.10. Die Insel wird dabei **wirklich aufgelöst**: 29
  Interaktionen, 17 tragend, 12 Beiwerk, **keine ohne Marke**, und die Zahl im Szenenziel stimmt
  mit der gezählten überein.
  - **Die Orte der Insel werden aus den MARKERN der Szene `4.1` abgeleitet**, nicht aus einer
    Namensliste. Mein erster Anlauf filterte per Teilstring und meldete sechs Interaktionen „ohne
    Marke" — `lagerhaeuser` traf auf „lager", `hafen_markt` auf „markt", `schmuggler_lager` auf
    beides. **Die Prüfung war falsch, nicht die Daten.**
- **Drei eigene Fehler, zwei davon dieselbe dokumentierte Falle:**
  1. **Ein `assert` war falsch, nicht die Datei:** Ich erwartete ein langes `uebergeordnetesZiel`
     bei `4.1` und brach bei 65 Zeichen ab. Es ist ein Einzeiler mit nachgestelltem Kommentar —
     die Prüfung hatte eine Erwartung, die Datei hatte recht.
  2. **Die Heredoc-Falle, und diesmal bei QUOTIERTEM Delimiter** (`<< 'PYEOF'`): Ein `\n` im
     Python-Text kam als echter Zeilenumbruch an und stand damit **mitten im JS-String** —
     `js/regie.js` war unparsebar. Reparatur über das Write-Werkzeug mit `chr(92)`, also genau den
     im Projekt vermerkten Weg. **Merke, schärfer als bisher: der quotierte Delimiter schützt
     hier NICHT.**
  3. Die bekannte vm-Falle: `const SZENEN_REGIE` im Skript-Scope ist von außen nicht als
     Kontext-Eigenschaft sichtbar — die Prüfung reicht die Namen jetzt im Skript selbst heraus.
- **[OFFEN] Die Insel steht weiter auf dem ALTEN Wertesystem.** Der neue Rätseltext ist sauber
  (Allgemeinwissen, Aufmerksamkeit), die rund 45 übrigen Probennennungen der Szene `4.1` sind es
  nicht — `4.1` ist die dickste der elf noch nicht umgestellten Szenen. Das ist ein eigener
  Durchgang und war hier nicht beauftragt.

### 2026-10-23 - Der Sturm ist jetzt eine gefuehrte Kette in sieben Stationen
- **Hendriks Vorgabe:** "Den Sturm wuerde ich gerne etwas guiden" - mit dem kompletten
  Ablauf: Sturm zieht auf, alle an Deck, Meldung Wasser im Frachtraum \u2192 Cormac
  schickt runter, Pumpraeder fuer die Kraeftigen, die anderen holzholen und flicken
  \u2192 auf dem Weg hoch die Kanone \u2192 Vordersegel losgerissen, Mast droht zu
  reissen \u2192 Welle ueber das Deck, Wat faengt einen auf \u2192 Steuerkette gerissen,
  Tom dirigiert mit den Ankern \u2192 Ankunft.
- **Erst gemessen, dann gebaut - und der Befund hat die Arbeit halbiert: fuenf der sieben
  Beats lagen schon da**, nur unverbunden und in anderer Reihenfolge. `wat_rettung_sturm`
  war Beat 5 **vollstaendig**, inklusive des Details, dass Wat sich selbst losbindet und
  danach weitereilt, **um Taue am Hauptmast zu spannen** - was direkt in Hendriks
  Segel-Beat greift. Neu geschrieben werden musste nur der **Auftakt**, die
  **Arbeitsteilung unten** und die **Ankunft**.
- **Die Regel, die die Szene jetzt traegt:** Die Gruppe entscheidet nicht, WOHIN sie geht -
  das sagt die Lage. Sie entscheidet, **WIE sie die Arbeit verteilt**. Wer an die
  Pumpraeder geht und wer das Holz holt, wer hochklettert und wer die Seile haelt.
- **Neue Interaktion `oberdeck.der_sturm_ablauf`** als Regie-Faden: die sieben Stationen
  als Abhakliste, dazu der Auftakt und die Meldung von unten. Sie erfindet keinen Inhalt,
  **sie ordnet** - die Stationen selbst liegen weiter an ihren Orten.
- **Die Kosten der Kette sind ZEIT, nicht Schaden.** Braucht die Gruppe unten lange, biegt
  sich der Mast in Station 4 schon bedenklich, wenn sie ankommt - das sagt die
  Spielleitung ausdruecklich an. Ein Misserfolg im Frachtraum und an der Steuerkette
  kostet deshalb **keinen** Schadenspunkt. Nur die Kanone verletzt, und dieser Schaden
  bleibt bis zur Schatzinsel. **Damit haengen die Stationen zusammen, ohne dass ein
  verpatzter Wurf die Kette abreissen laesst.**
- **Zwei Stellen widersprachen Hendriks Vorgabe, und beide waren echter Kanon:**
  1. **Die Werkstatt.** `wassereinbruch_sturm` verlangte "Planken aus der Werkstatt holen"
     - und die Werkstatt steht in `3.1` auf `hiddenMarkers`, in Bibel 10.11 ausdruecklich
     als "fuer den Sturm inhaltlich irrelevant". Der Text beschrieb also einen Ort, den es
     auf der Spielerkarte im Sturm **nicht gibt**. Hendriks "die anderen runter,
     holzholen" loest es: Fassdauben, Verschlagbretter, Werg und ein Topf Pech liegen
     jetzt **in der Ladung des Frachtraums**. Ein seit dem 18.10. dokumentierter
     Widerspruch ist damit geschlossen.
  2. **Toms Moment.** Dort stand woertlich "reiner Erzaehlmoment, **bewusst kein Wurf,
     keine Spieler-Aufgabe**" - in Code UND Bibel. Hendrik will dort jetzt "ein paar
     Proben, ein wenig gemeinsames Rollenspiel". **Geloest, ohne Toms Moment zu nehmen:**
     Tom haelt den Kompass, rechnet und **ruft** - fuer ihn wird weiter nicht gewuerfelt,
     er irrt sich nicht. Die **Spieler** sind seine Haende: Anker fallen lassen (Segeln),
     an der Winde einholen (Staerke), Rufe uebers Deck weitergeben (Ueberreden/
     Einschuechtern). Drei bis vier Proben, ein Rhythmus statt eines Rechenspiels.
     **Vier Minuten Zuschauen am Ende einer Kette, in der die Gruppe gerade alles
     getragen hat, waere der falsche Schluss.** Die alte Fassung steht in Bibel 10.11 als
     abgeloest zitiert, nicht geloescht - genau der Fehler vom 14.10. (fuenf Wochen
     falsche Auskunft).
- **`3.1` hatte weder `uebergeordnetesZiel` noch `stimmung`** - die einzige Szene im
  Projekt ohne beides, seit dem 18.10. als offener Punkt vermerkt. Beide sind jetzt da;
  das Ziel traegt die Kette in einer Zeile, die Stimmung den Ton (es ist **laut**, und das
  ist das Mittel der Szene: jeder Befehl kommt als Ruf).
- **`3.1` ist komplett aufs neue Wertesystem umgestellt** - die zweite der dreizehn
  Szenen. Die Zuordnung, als Schablone fuer die Golden-Lion-Gruppe:

      Geschick+10 (Takelage)      -> Athletik, Erschwernis -2
      Koerper (festhalten)        -> Athletik
      Koerper (Pumpraeder)        -> Konstitution   <- Durchhalten, nicht Anheben
      Koerper (Kanone stemmen)    -> Staerke        <- Gewicht gegen Kraft
      Mechanik (flicken)          -> Handwerk
      Seefahrt (Pumpe/Knoten)     -> Segeln
      Wahrnehmung (Harwick)       -> Aufmerksamkeit

  Die **Pumpraeder** sind der feinste Fall: Ausgewaehlt werden die zwei **Staerksten**
  (Hendriks "die zwei kraeftigen", objektiver Vergleich wie bei Cormacs Segel-Auswahl),
  gewuerfelt wird aber **Konstitution** - es geht ums Durchhalten. Wer vorher schon
  Schaden hat, merkt es dort zuerst.
- **Zwei alte `[OFFEN]`-Stellen entschieden, vier weitere waren schon weg:** Neds Sturz
  hatte "Konsequenz noch nicht festgelegt" - jetzt: Er schlaegt gegen die Reling, zwei
  Matrosen ziehen ihn weg. **Kein Ruf-Gewinn, kein Malus, es bleibt einfach aus.** Und
  Cormacs Segel-Misserfolg fuehrt jetzt **direkt in Station 5**: Wer oben scheitert, ist
  genau der, den die Welle erwischt und den Wat auffaengt. Damit ist kein Misserfolg mehr
  eine Sackgasse. In `3.1` steht jetzt **kein einziges `[OFFEN]`** mehr.
- **Einfaelle zaehlen an der Kanone** (Hendriks "Einfaelle zum einfangen"): Ein Tau in die
  Speichen, eine Haengematte als Fangnetz, Keile unter die Raeder - Handwerk oder
  Allgemeinwissen ersetzt einen der drei Kraft-Erfolge. **Das gibt den koerperlich
  Schwachen in dieser Station ueberhaupt etwas zu tun**, und ein guter Einfall ist hier
  ausdruecklich besser als ein guter Wurf.
- **Drei Momente sind zu Einschueben geworden statt Stationen:** Ned, Tom am Ruder und
  Harwicks Blicke. Sie duerfen ausfallen, und das steht an ihnen dran. **Tom am Ruder
  schickte vorher "dorthin, wo gerade Hilfe gebraucht wird" - in einer gefuehrten Kette
  gibt es diese freie Wahl nicht mehr**; er nennt jetzt die laufende Station und gibt der
  Spielleitung damit nur eine diegetische Stimme.
- **TRIGGER-IDs sind alle erhalten** - nachgemessen, keine einzige verloren. Sie liegen
  als `questDone/{szene}/{triggerId}` in Firebase; ein umbenannter Haken nimmt der
  laufenden Kampagne lautlos ihren Stand. Gewachsen ist `3.1` von **8 Interaktionen mit
  30 Triggern auf 9 mit 60**.
- **Eine echte Luecke in der Pruefung, die erst dabei auffiel:** `tests/t_szenen.js`
  sammelte **alle** Interaktionen der sichtbaren Orte - auch die, die per `nurSzenen` nur
  in `2.1` gelten und noch auf dem alten System stehen. **Eine Szene, die ihre Orte mit
  einer nicht umgestellten teilt, waere damit nie eintragbar gewesen, obwohl sie selbst
  sauber ist.** Jetzt filtert sie nach `nurSzenen`/`nichtInSzenen`.
  - Dazu ein zweiter Fund an derselben Funktion: `markerVon()` nahm an,
    `GOLDEN_LION_MARKERS_BASE` sei ein **Array**. Es ist ein **Objekt** (Basis/Override-
    Muster). Der Code war nie gelaufen, weil in `UMGESTELLT` bisher nur Grimsgate stand -
    flaches Muster, echtes Array. Sie versteht jetzt beide.
- **Getestet: 1647 Pruefungen ueber vierzehn Skripte**, ein Fehlschlag - der bekannte aus
  `t_figuren.js`, unveraendert seit dem 13.10.
  - **Gegengeprueft, und das ist der Beleg:** Auf dem alten Sturm-Text schlagen in
    `t_szenen.js` **9 Pruefungen** an, und die Fehlertexte nennen woertlich, was dort
    stand - `Koerper-Probe` siebenmal, `Probe: Wahrnehmung` zweimal, `Geschick-Probe`,
    `Mechanik` sowie die beiden alten Baender "Guter Erfolg" und "Schlechter Erfolg".
- **Zwei eigene Fehler beim Bauen, beide vom `assert` vor dem Schreiben gefangen:**
  1. Ich suchte Titel mit `\u2014`-Escapes, die Datei traegt dort **echte Zeichen** - die
     Escapes stehen nur in den Bloecken, die ich heute selbst geschrieben habe. Dieselbe
     Sorte Verwechslung dann **umgekehrt**: Mein eigener Text stand als `K\u00f6rper` im
     Quelltext, weshalb die Suche nach dem echten Wort nichts fand.
  2. **Ein falsch positiver Treffer in meinem eigenen Text:** "Probe ATHLETIK (wer sich
     mit dem ganzen K\u00f6rper dagegenwirft)" - dort ist K\u00f6rper Prosa, nicht der
     abgeschaffte Wertename. **Ich habe umformuliert statt die Pruefung zu lockern:** Eine
     Pruefung, die ich fuer meinen eigenen Text aufweiche, laesst beim naechsten Mal einen
     echten alten Wertenamen durch (Lehre vom 16.10.).
- **[OFFEN] `2.1` hat weiterhin kein `uebergeordnetesZiel`** (Stimmung ist da). Mit der
  Stunde vor dem Sturm und vierzehn Stationen waere eines sinnvoll - aber was dort als
  Ziel steht, ist eine inhaltliche Entscheidung und gehoert Hendrik.


### 2026-10-20 - Fehler: ein entfernter Spieler blieb in den Zeiten stehen
- **Hendriks Meldung:** "Ich hatte mich zum Testen noch mal eingetragen und kann den Spieler
  „pnpgang“ jetzt nicht mehr vollständig aus der Session entfernen ... in den Zeiten ist er
  immer noch aufgelistet."
- **Erst nachgesehen, nicht geraten** (per REST in der laufenden Kampagne) - und sein
  Entfernen **hatte gewirkt**, nur eben halb:

      sitzungen/pnpgang/spieler               6 Eintraege, "pnpgang" WEG
      .../stand/termine/spieler               7 Eintraege, "pnpgang" DRIN   <- der Rest
      .../stand/termine/verfuegbar            6 Eintraege (er hatte nie Zeiten gemalt)

- **Ursache: ein Spieler liegt an DREI Stellen, `spielerWeg()` räumte EINE.** Die beiden
  Termin-Pfade schreibt der **Spieler-Hub selbst** - er darf nur unter seinem eigenen
  Schlüssel schreiben (Regel vom 11.10.2026). Also kann die Regie sie nicht weglassen; sie
  muss sie beim Entfernen miträumen, sonst räumt sie **niemand**.
- **Der Fehler war nicht nur kosmetisch.** `st.spieler` ist die Grundmenge für die ganze
  Rechnung in `js/termine.js` - `besteFenster`, `fensterAmTag`, der Zähler. Ein Phantom dort
  **verschlechtert jedes Fenster**: aus "3/6" wird "3/7", und die Spielleitung sucht einen
  Termin gegen einen Spieler, den es nicht mehr gibt.
- **Zwei Fixe, und der zweite ist der tragende:**
  1. **`spielerWeg()` räumt alle drei Stellen** - als **EIN** `update()` von
     `sitzungen/{id}` aus, nicht drei `remove()`. Sonst feuert der Lauscher dreimal, jedes
     Mal auf einem halben Stand (Lehre vom 20.08.2026, Erkundungs-Graph). Die Rückfrage sagt
     jetzt auch, dass die eingetragenen Zeiten mitgehen - aber nur, wenn es welche gibt.
  2. **`terminStand()` nimmt die MITGLIEDER als Grundmenge** (`sitzungen/{id}/spieler`) statt
     `stand/termine/spieler`. **Damit ist ein Rest sofort unsichtbar, ohne dass jemand die
     Datenbank anfassen muss** - und es gibt wieder genau EINE Quelle für die Frage, wer zur
     Sitzung gehört. Die zweite Liste liefert nur noch den Namen.
- **Ein Nebengewinn, der vorher fehlte:** Ein von der Regie **vorgemerkter** Spieler, der die
  Zeiten-Seite nie geöffnet hat, stand bisher **gar nicht** in der Terminansicht. Jetzt steht
  er als "nichts eingetragen" da - genau das soll die Spielleitung sehen (die Karteileichen-
  Frage vom 07.09.2026).
- **AUSNAHME, bewusst:** Ist die Mitgliederliste leer, wird **nicht** gefiltert. Das heißt
  "wir wissen es nicht" (eine Sitzung von vor dieser Liste), nicht "niemand gehört dazu" -
  sonst wäre die Ansicht plötzlich leer. Dieselbe Linie wie "ohne Verbindung wird nicht
  gesperrt" (14.10.2026).
- **Der Rest ist aus der laufenden Kampagne entfernt** (vorher der ganze `termine`-Knoten
  gesichert). Danach stimmen alle drei Listen überein: moe, kevin, kairasy, vesc, lucie, sl -
  sechs Spieler, und `gewaehlt` ist unberührt.
- **Getestet: 159 Prüfungen in `t_termine.js`, 0 Fehler** (15 neue, 1628 über vierzehn
  Skripte, ein Fehlschlag - der bekannte aus `t_figuren.js`, unverändert seit dem 13.10.).
  Hendriks Fall ist dabei **nachgestellt und wirklich ausgeführt**, nicht im Quelltext
  gesucht: drei Mitglieder, ein Rest namens `pnpgang` nur in den Zeiten.
  - **Gegengeprüft, und das ist der Beleg: mit dem alten Code schlagen 10 Prüfungen an**, und
    die Fehlertexte nennen den gemeldeten Zustand wörtlich - `[a,b,c,pnpgang]` und
    `sitzungen/s1/spieler/pnpgang / "REMOVE"`.
  - Dazu: das Entfernen schreibt **genau einmal**, alle drei Pfade auf `null`, eine
    abgelehnte Rückfrage schreibt **nichts**, und das Sicherheitsnetz ohne Mitgliederliste
    greift nachweislich.
- **Zweimal dieselbe Werkzeug-Falle an einem Tag, beide dokumentiert:** Ein mehrzeiliger
  `confirm()`-Aufruf zerbrach mitten im Python-Literal (jetzt Triple-Quote mit
  Zeilenende-Ersetzung), und ein `\n` im Anker-Suchtext kam durch das Bash-Heredoc als
  echter Zeilenumbruch an - der Anker fand nichts. Jetzt über `rindex` ohne Backslash.


### 2026-10-18 (Fortsetzung 6) - Die zwei Abschriften sind geschrieben
- **Hendriks Vorgabe:** zwei konkrete Abschriften statt einer losen Liste. Die erste ungenau
  (eine Steintafel, Symbole nur grob beschrieben), die zweite das Blatt mit den Notizen und
  den beiden Strophen. **"Die erste Abschrift kann bei einem guten Erfolg kommen oder nach
  dem zweiten Tag bei einem normalen Erfolg."**
  - "Guter Erfolg" heisst im neuen System **Steigerung** (Umstellung vom 16.10.2026) - so
    steht es jetzt im Text.
- **ABSCHRIFT I, die Steintafel.** Ein Abschreiber berichtet von einer Tafel aus gewachsenem
  Fels mit sechs Zeichen und nimmt sie ab, "so gut es das Licht erlaubte". Alle sechs
  Zeichen aus Hendriks Symbolliste sind da, aber **grob und mit eingebauter Unschaerfe**:
  "ein Ring, und darin etwas Helles. **Eine Sonne vielleicht. Oder ein Auge.**"
  - Dieser eine Halbsatz haelt die **Eulen-Lesart offen** und ist der Grund, warum die
    Abschrift das Raetsel nicht vorwegnimmt. Steht als Warnung dabei, dass die Ungenauigkeit
    Absicht ist und nicht wegerklaert werden darf.
  - Schlusssatz des Abschreibers: "Der Alte sagte, man muesse der Tafel ANTWORTEN, nicht sie
    lesen. Ich habe nicht gefragt, womit." - zeigt auf die vier Siegelsteine, ohne sie zu
    nennen.
- **ABSCHRIFT II, die Strophen** - unveraendert wie gestern entworfen: zwei Zeilen, zwei
  Deutungen nebeneinander (Grosskatze/Geisterwelt ODER Eule), keine durchgestrichen.
- **Die Staffelung ist jetzt grosszuegig statt streng:** Eine Steigerung bringt Abschrift I
  **sofort, auch am ersten Tag**; ab Tag 2 genuegt ein einfacher Erfolg. Wer Glueck hat,
  bekommt sie frueh - wer dranbleibt, bekommt sie ohnehin. Die uebrigen Erfolge verteilen
  vier Rest-Bruchstuecke (Insel hinter Riffen, vier Siegel, Warnung vor dem Laerm, die
  Randnotiz zur Klinge).
- **Ehrlich vermerkt, was die beiden Blaetter ZUSAMMEN hergeben:** Ein scharfer Spieler kann
  die Loesung herleiten - das zweite Zeichen (Gestalten, Wasser durchgestrichen) passt zu
  einer Katzenfamilie, nicht zu einer Eule. **Das ist bewusst erlaubt:** Wer drei Tage
  gewuerfelt und zwei Dokumente verglichen hat, hat es sich verdient. Wer es schwerer will,
  laesst das zweite Zeichen weg - steht als Stellschraube in den Details.
- **Der Querverweis in der Grotte nennt jetzt beide Blaetter** und sagt der Spielleitung
  genau, was dem Spieler **fehlt**: die zwei Zeilen, die zwischen Eule und Katze entscheiden.
- **Getestet: t_syntax 60, t_szenen 33, t_musik 34, t_regie_wuerfel 325, t_arena 30,
  t_nsc 60 - 0 Fehler.** Beide Vorlese-Texte werden dabei wirklich aufgeloest und mit
  echten Umlauten ausgegeben (der Fehler von vorhin).


### 2026-10-18 (Fortsetzung 5) - Das Buendel: der erste laufende Faden der Schiffsszene
- **Hendriks Mechanik, woertlich:** "Der Spieler bekommt ein ganzes Buendel an Schriften.
  Diese kann er ein Mal am Tag mit einem Verstand-Roll abfragen und findet je nach Ergebnis
  mehr oder weniger heraus. Wenn er dieses Buendel 3 Tage in Folge abfragt, unabhaengig vom
  Erfolg, bekommt er beim naechsten Erfolg das Blatt mit dem Raetsel."
- **Damit hat die Schiffsszene zum ersten Mal eine Aufgabe, die LAEUFT.** Bis heute waren
  alle dreizehn Stationen in sich abgeschlossen oder zahlten rueckwaerts nach Grimsgate aus;
  einzig Dirk reichte weiter, und sein Payoff liegt hinter dem Sturm. Genau die Luecke, die
  in `AUFGABE-SCHIFF-VOR-DEM-STURM.md` beschrieben ist.
- **Nachgerechnet, bevor gebaut:** EINE Probe pro **Tag**, nicht pro Szene - in `2.1` ist
  also genau eine drin, denn dort vergeht eine reale Stunde bis zum Sturm (Bibel 6.1, T+60).
  Die Kajuete gibt es als Marker nur auf der Golden Lion, nicht auf der Schatzinsel.
  **Realistisch faellt das Raetselblatt damit zwischen `5.1` und `6.1`** - nach der Insel,
  VOR der Riffinsel. Genau dort wird es gebraucht. `nurSzenen: ["2.1", "5.1", "6.1"]`.
- **Die Baender tragen die Mechanik:** Steigerung zwei Bruchstuecke \u00b7 Erfolg eines \u00b7
  **Misserfolg nichts, aber der Tag zaehlt trotzdem** (das ist der Kern - sonst waere der
  Dreitage-Zaehler eine Wurf-Lotterie) \u00b7 Patzer setzt einen falschen Schluss fest.
- **Neun Bruchstuecke** in den Details, eines je Erfolg: die Steintafel, die vier Siegel mit
  je einem Tier, vier einzeln beschriebene Zeichen, die Insel hinter Riffen, die Warnung vor
  dem Laerm beim Fehlgriff, und die Randnotiz zur Klinge ("was in SEINEM Namen geschmiedet
  sei, schicke sie zurueck; alles andere lege sie bloss schlafen" - wer "sie" sind, steht
  nicht da).
- **Das Raetselblatt loest das Raetsel NICHT, und das ist der Trick.** Es traegt zwei Zeilen
  und zwei Deutungen nebeneinander, keine durchgestrichen: **Grosskatze** (Naturvoelker
  schreiben ihnen zu, Menschen in die Geisterwelt zu bringen) **ODER Eule** (sitzt hoch oben,
  bewacht die Nacht). **Die zwei Zeilen, die zwischen beiden entscheiden, fehlen** - "ein
  anderer als ich, das Wasser meidet" und "Knack ich den Schaedel ungeschont". Die liest der
  Spieler erst in der Grotte vollstaendig. Er kommt also vorbereitet an, nicht fertig.
  - Der Grosskatzen-Hinweis ist kein Zufall: Dieselbe Idee steht im Finale als
    Introll-Hinweis fuer den Loeser des Grotten-Raetsels ("der Jaguar als Wandler zwischen
    den Welten", `die_zermuerbung`). Das Blatt saet, was das Finale erntet.
- **Symbole werden BESCHRIEBEN, nie gezeigt** (Hendriks Vorgabe, als eigener Merkposten-
  Trigger). Kein Handout mit Zeichnungen - der Spieler soll die Zeichen in der Grotte
  wiedererkennen, nicht abgleichen. Sonst wird aus dem Moment eine Suchaufgabe.
- **Querverweis in der Grotte** (`das_raetsel_der_grotte`, neuer Trigger `kennt_das_blatt`):
  Er sagt der Spielleitung am Tisch, was der Spieler schon kennt - und vor allem, was ihm
  fehlt. Ohne den haette sie zwei Interaktionen im Kopf zusammenhalten muessen.
- **[OFFEN] Technische Einschraenkung, im `details`-Feld vermerkt:** Die Haken liegen als
  `questDone` an der SZENE, in der sie gesetzt werden. Werden die drei Tage in
  verschiedenen Szenen abgefragt, stehen sie verteilt - einen szenenuebergreifenden Zaehler
  gibt es nicht. Behelf: das Szenen-Notizfeld.
- **Zwei eigene Fehler, beide korrigiert, bevor etwas falsch wurde:**
  1. **Ich hatte den Text in ASCII-Umschrift geschrieben** ("Naturvoelker", "Grosskatzen",
     "Einzelgaenger") - in einem Text, der am Tisch **vorgelesen** wird. Nachgezogen, und
     zwar nur im neuen Block, mit einer Pruefung, dass der Interaktions-Schluessel
     `das_buendel` dabei unberuehrt bleibt.
  2. Dritter Treffer der Backtick-Falle an einem Tag, siehe Fortsetzung 4.
- **Getestet: t_syntax 60, t_szenen 33, t_musik 34, t_regie_wuerfel 325, t_arena 30 -
  0 Fehler.** Die Interaktion wird dabei wirklich aufgeloest (10 Trigger, `nurSzenen`,
  Vorlese-Text).


### 2026-10-18 (Fortsetzung 4) - Das Offiziersquartier bekommt seine GM-Seite
- **Hendrik:** "Das Offiziersquartier ist Cormac abgeschlossen und offensichtlich Toms Tuer
  zeigt einen unordentlichen Raum. Das reicht."
- **Der Spielertext sagt das laengst woertlich** (Marker-desc, Bibel 10.7: verriegelte schlichte
  Kammer, daneben Haengematte, Wuerfel, Karten, Flaschen, blaues Halstuch). **Im Panel stand
  dort aber gar nichts** - kein `kurz`, keine `personen`, kein `ortHinweis`. Nachgetragen,
  **ohne Interaktion**: Der Ort bleibt ausdruecklich ein reiner Flavor-Ort (Bibel 10.7).
- Im `ortHinweis` stehen die drei Dinge, die am Tisch zaehlen: Im Spielertext fallen **keine
  Namen** - nicht aufloesen, wenn niemand fragt, sondern bestaetigen statt erklaeren. Das blaue
  Halstuch ist Toms Wiedererkennungs-Requisit. Und Cormacs Tuer aufzubrechen ist keine
  vorgesehene Handlung, sondern ein Vergehen am Quartiermeister.
- Die bestehende `5.1`-Ueberschreibung (Toms Fruchtstueck) und die Kartenrunde bleiben
  unberuehrt. `t_syntax` 60, 0 Fehler.
- **Eigener Werkzeug-Fehler, zum dritten Mal derselbe:** Die Backticks dieses Eintrags sind,
  per `python -c` durch die Shell geschickt, als **Befehlsersetzung ausgefuehrt** worden -
  die Wortinhalte fehlten danach im Text. Steht seit dem 17.10.2026 genau so im Changelog.
  **Konsequenz, jetzt scharf: Changelog-Text NIE ueber `python -c` auf der Kommandozeile,
  sondern immer als Skriptdatei mit dem Write-Werkzeug.**


### 2026-10-18 (Fortsetzung 3) - Francesco und Josiah antworten, und Pfad B steht endlich im Panel
- **Hendriks Vorgabe:** "Ich moechte Francesco und Josiah dazu nutzen, um den Spielern
  saemtliche Fragen zu beantworten und kleine Hints zu geben. Hier muessen die Spieler aber
  aktiv werden. Der blinde Passagier wird die Spieler direkt zu Josiah fuehren. Wenn sie den
  Passagier nicht finden, werden sie Walter kennen lernen und die dramatische Szene an Deck
  wird stattfinden."
- **Das meiste davon stand schon im Kanon** - Bibel 11.1 beschreibt genau diese Gabelung:
  Pfad A fuehrt zu Josiah (der hungrige Junge landet von selbst bei ihm), Pfad B ist Wat.
  Hendrik hat sie zugespitzt, nicht neu erfunden. **Zwei echte Luecken kamen beim Messen
  heraus:**
- **1. Pfad B war NIRGENDS ausformuliert.** Die Szene an Deck stand ausschliesslich in der
  Bibel - die Spielleitung haette sie am Tisch dort nachlesen muessen, waehrend die Gruppe
  wartet. Im Panel gab es nur die Zeile "Wat bemerkt es, Pfad B startet".
  - Neue Interaktion **`oberdeck.wat_und_der_junge`** (`nurSzenen: ["2.1"]`), die sechs festen
    Schritte aus Bibel 11.1 als Trigger: Wat haelt den Jungen an einem Bein ueber die Reeling
    \u2192 Cormac redet ein, **ohne Wirkung** \u2192 selbst Tom knickt ein \u2192 jemand
    laeuft zu **Josiah, nicht zum Kapitaen** \u2192 Josiah kommt schwer atmend an Deck
    \u2192 holt den Jungen mit ruhigen Worten zurueck.
  - **Siebter Trigger fuer den Fall, den die Bibel nicht nennt:** Spieler, die selbst
    eingreifen. Wat laesst sich nicht umstimmen - aber wer es **ruhig und ohne Drohung**
    versucht, bekommt den stillen fruehen Rufgewinn, der in `besatzung.html` an ihm steht
    ("ruhiger Respekt statt Misstrauen, Wat vergisst das nicht"). Wer droht, hat ab hier ein
    Problem. Sonst waere Eingreifen mechanisch wertlos, obwohl es die naheliegendste
    Spielerreaktion ueberhaupt ist.
  - **Die Gegenrichtung ist jetzt sichtbar:** Wer den Jungen findet, lernt **Josiah** kennen;
    wer ihn nicht findet, lernt **Wat** kennen. Beide Wege fuehren zu einer Figur - nur zu
    einer ganz anderen.
- **2. Josiah hatte keinen Fragenkatalog.** Francesco hat seit Langem einen (sechs Personen,
  "nie proaktiv genannt"), Josiah nur Prosa - am Tisch nichts, was die Spielleitung abarbeiten
  kann. Neue Interaktion **`kombuese.josiah_fragen`**, 7 Fragen.
  - **Die Antworten zeigen auf Inhalte, die es ohnehin gibt** - kein neuer Plot, nur
    Wegweiser: Dirk hoert nicht auf Worte, sondern auf Handwerk (\u2192 `dirk_vertrauen`,
    die sonst am leichtesten uebersehene Probe der Szene) \u00b7 Toms Streiche \u00b7 leise
    durchs Unterdeck (\u2192 `durchqueren`).
  - **Arbeitsteilung der beiden, damit sie sich nicht doppeln:** Francesco urteilt ueber
    **Menschen**, Josiah sagt, **wie man mit ihnen umgeht** - und redet ueber niemanden
    schlecht. Dieselbe Frage bekommt bei den zwei zwei verschiedene Antworten, und keine ist
    falsch. Steht jetzt in beiden `kurz`-Feldern.
  - **Kein Ruf, kein Haken.** Die Trigger sind eine Abhakliste fuer die Spielleitung, genau
    wie bei Francesco - Josiah bleibt "reiner Charakter zum Spielen", wie es in seiner
    bestehenden Interaktion ausdruecklich steht.
  - **Was er NICHT sagt**, und das steht als Warnung dabei: Warum Wat auf ihn hoert, kann er
    selbst nicht erklaeren (Bibel 11: bleibt ungelueftet). Ueber Harwicks Papiere sagt er nur,
    was er **sieht** - "ich bring ihm was zu essen hin, meistens steht es noch da" - nie, was
    darin steht. Jessica und das Ritual gehoeren der Einberufung (12.1).
- **Ein eigener Fehler, und `t_syntax.js` hat ihn in derselben Minute gemeldet:** Beim
  Umbrechen einer langen Zeile im Skript landete ein **Anfuehrungszeichen mitten im Wort**
  ("bee\"ilt"). Damit endete der JS-String zu frueh, und `js/regie.js` war unparsebar.
  Genau die Fehlerklasse, fuer die diese Pruefung nach dem `karte.html`-Vorfall gebaut wurde -
  sie meldete `SyntaxError: Unexpected identifier 'ilt'` samt Zeilennummer.
- **Getestet: t_syntax 60, t_szenen 33, t_musik 34, t_regie_wuerfel 325, t_nsc 60, t_arena 30
  - 0 Fehler.** Beide Interaktionen werden dabei wirklich aufgeloest (Titel, `nurSzenen`,
  je 7 Trigger, Antworttexte).
- **[OFFEN] Francescos Katalog ist unangetastet.** Er deckt die sechs NSC ab; Fragen zum
  Schiff, zur Fahrt oder zu Grimsgate hat er nicht. Ob er die bekommen soll, ist Hendriks
  Entscheidung - bei Josiah ist "ich koch, mir sagt das keiner" die ehrliche Antwort, bei
  Francesco waere es eine inhaltliche.


### 2026-10-18 (Fortsetzung 2) - Die Flaute gibt die Insel her, und der Zeitdruck bleibt
- **Hendriks Vorgabe:** "Waehrend der Flaute bekommen die Spieler die Chance, die Position der
  Insel durch die Unterlagen von Harwick heraus zu finden." Damit ist der dritte Weg zur
  Riffinsel geschlossen - der Zweig, der weder Spanierkontakt noch Schmugglerhinweis hat und
  seit der Saebel Pflicht ist (12.1) sonst ohne die Waffe ins Finale gelaufen waere.
- **Neue Interaktion `inselposition_aus_unterlagen`** (`ORTE.kapitaenskajuete`,
  `nurSzenen: ["6.1"]`, 7 Trigger): **Navigation ODER Allgemeinwissen** an Harwicks Papieren.
  - **Heraus kommt eine POSITION, kein Grund.** Warum die Insel ihn beschaeftigt, sagt er
    nicht - das bleibt der Einberufung (`12.1`), die sonst ihr Gewicht verliert. Und
    ausdruecklich **keine** Ritual-Information: die liefert nur die Schamanen-Insel (7.4).
  - **Zwei Wege hinein:** fragen (er gibt die Unterlagen heraus, ohne den Grund zu nennen)
    oder heimlich mitlesen, waehrend er an Deck ist. Wer in `2.1` schon einmal wegen der
    Schriften in der Kajuete war, hat den kurzen Weg.
  - **Ein Misserfolg kostet nur Zeit.** Die Flaute haelt an, beliebig oft erneut versuchbar -
    und kommt die Gruppe gar nicht darauf, nennt Harwick die Lage am Ende selbst, laut vor
    sich hin gerechnet. **Der Weg zur Pflichtinsel darf nicht an einem Wurf scheitern.**
- **Eigener Kajuetentext fuer die Flaute** (`descOverrides` in `6.1`): Die Basis-Szene sagt
  "verriegelt ... wer anklopft, bekommt keine Antwort" - damit waere niemand auf die Idee
  gekommen, es an den Unterlagen zu versuchen. Jetzt steht die Tuer bei der Hitze einen Spalt
  offen und Harwick sitzt sichtbar ueber den Papieren. **Reine Beobachtung, kein
  Handlungsauftrag** (Design-Regel 2.8), und **`2.1` bleibt unberuehrt** - dort ist die Tuer
  weiter zu. Beim Einbau genau an der Stelle aufgepasst, an der am 14.10. die Datei brach:
  hinter `imgOverrides: {}` steht ein Kommentar und kein Komma.
- **ENTSCHIEDEN (Hendrik), und als Entscheidung eingetragen statt als Luecke:** "Wenn die
  Spieler zu viel Zeit auf der Insel verbringen und den Saebel nicht bekommen, werden sie den
  Endkampf nicht schaffen. Das ist dann halt so."
  - Die **Affen bleiben unveraendert** (`ORTE.riffstrand.die_affen` beendet die Erkundung
    "bevor alles gefunden werden kann"). Mein Vorschlag von vorhin, sie erst nach dem
    Grottenfund kommen zu lassen, ist damit **abgelehnt** - und das steht so in Bibel 7.4,
    damit es niemand spaeter "repariert" und der Erkundung ihren Einsatz nimmt.
  - Die Kehrseite steht ebenso dort: Eine Gruppe kann sich in `11.1` um das Finale bringen,
    ohne es zu merken. Bewusst in Kauf genommen.
- **Ein alter Wertename, den meine eigene Messung uebersehen hatte:** In
  `warnung_in_unterlagen` stand "Wahrnehmungs-/Wissen-Probe". Mein Suchmuster sucht den
  Probenzusammenhang (`Wort-Probe`), und darauf passt diese Schreibweise nicht - der Treffer
  fiel durch. Jetzt "Aufmerksamkeit oder Allgemeinwissen". **Merke: Die Zahl der alten
  Wertenennungen ist eine Untergrenze, keine Bilanz.**
- **Getestet: t_arena 30, t_syntax 60, t_szenen 33, t_musik 34, t_regie_wuerfel 325 - 0 Fehler.**
  Die neue Interaktion wird dabei wirklich aufgeloest (Titel, `nurSzenen`, 7 Trigger), der
  `descOverride` greift in `6.1` und nachweislich **nicht** in `2.1`.


### 2026-10-18 (Fortsetzung) - Der Jaguar-Saebel ist Pflicht, und die Arena hat endlich Tests
- **Hendriks Festlegung:** "Ich moechte das Abenteuer umschreiben, dass die Spieler zwingend
  zur Raetselinsel kommen. Entweder durch die Flucht vor den Spaniern oder durch den Hinweis
  der Schmugglerinsel." Dazu: "Die Waffe wird zwingend notwendig sein, um den Endboss zu
  besiegen. Nur mit dem Saebel sterben die Wiedergaenger und auch der Boss selbst."
- **Der Befund, der die Reihenfolge bestimmt hat: fuer die Arena gab es KEINEN Test.** Dreizehn
  Skripte in `tests/`, keines fuers Gefecht - die Arena-Tests von August lagen im Scratchpad
  und sind nie eingecheckt worden, dieselbe Luecke wie am 11.10. Die folgenschwerste
  Regelaenderung der Kampagne waere in ungepruefte Zeilen gefallen. **Neues
  `tests/t_arena.js`, 30 Pruefungen, 0 Fehler** - zuerst geschrieben, dann geaendert.
- **Die Regel, und zwar genau so weit wie noetig:**

      |               | ohne Saebel                   | mit Saebel
      | Diener        | faellt, steht wieder auf      | jeder Treffer toetet, endgueltig
      | Seelenloser   | faellt, RICHTET SICH AUF      | Schaden normal, bei 0 HP endgueltig

  - **Der Saebel ist die Bedingung, nicht die Abkuerzung.** Gegen den Seelenlosen zaehlt der
    Schaden weiter ganz normal - eine Beruehrung legt ihn nicht nieder. Sonst waere das Finale
    mit einem einzigen Treffer vorbei, und aus der Pflichtwaffe wuerde ein Knopf.
  - Beim **Diener** bleibt die Regel vom 23.08. unveraendert.
- **Der Knackpunkt lag NICHT beim Toeten, sondern beim Rundenwechsel.** Wiederauferstehung und
  Nachschub hingen an `arenaBossLebt()`. Schlaegt die Gruppe den Seelenlosen ohne Saebel
  nieder, ist er damit "nicht am Leben" - **der Nachschub haette aufgehoert und das Gefecht
  waere gewonnen gewesen, ohne den Saebel.** Die Pflichtwaffe waere wirkungslos, und zwar
  lautlos. Neue **`arenaBossGebannt()`**: Alles laeuft weiter, solange er nicht **endgueltig**
  tot ist - er richtet sich selbst wieder auf, und die Toten kommen nach.
  - **Ohne Boss-Token im Feld gilt "gebannt"** - sonst stuenden Diener in einem Gefecht ohne
    Seelenlosen endlos wieder auf. Das ist das Verhalten von vorher, bewusst erhalten.
  - **Gegengeprueft, und das ist der Beleg:** Haengt man beides zurueck an `arenaBossLebt()`,
    schlagen **5 Pruefungen** an, und im Fehlertext steht der Fehler woertlich da:
    `{"nachschub":0,"bossLebt":false,"gebannt":false}`.
- **Zwei Logzeilen behaupteten etwas Falsches** (`js/regie_vault.js`, `arena_admin.html`):
  "Der Seelenlose ist gefallen - nichts steht mehr auf." Das stimmt nur, wenn er **gebannt**
  ist. Jetzt sagt die Zeile beim blossen Niederschlag "liegt am Boden - es geht weiter".
- **Die Dokumente sind mitgezogen, nicht nachgelassen** - eine Bibel, die etwas anderes sagt
  als der Code, ist genau der Fehler vom 14.10. (fuenf Wochen falsche Auskunft):
  - **Bibel 12.1** sagte woertlich, der Saebel sei "keine Raetselwaffe und kein Artefakt mit
    Sonderregel" und die Gruppe trage ihn "ohne zu wissen, wozu er spaeter gut ist". **Beides
    gilt nicht mehr.** Die alte Fassung steht als abgeloest im Text, nicht geloescht.
  - **Bibel 7.4** fuehrt die Riffinsel jetzt als **Pflicht** mit zwei Routen (Spanier-Flucht /
    Schmuggler-Hinweis) statt als eine Variante von drei.
  - **ARENA-ENDKAMPF.md 4.5** komplett neu, mit der Tabelle und der Begruendung zu
    `arenaBossGebannt()`.
- **Getestet: 1613 Pruefungen ueber vierzehn Skripte** (30 neue), ein Fehlschlag - der
  bekannte aus `t_figuren.js`, unveraendert seit dem 13.10.
- **[OFFEN] Die dritte Route hat keinen Saebel.** Bleibt `5.1` unbeachtet, treibt das Schiff in
  die Flaute (`6.1`) - dort gibt es **weder** Spanierkontakt **noch** Schmugglerhinweis. Zwei
  Wege, das zu schliessen, stehen in Bibel 7.4; beides Hendriks Entscheidung.
- **[OFFEN] Die Affen koennen die Kampagne unloesbar machen.** `die_affen` beendet die
  Erkundung ausdruecklich "bevor alles gefunden werden kann". Treiben sie die Gruppe weg,
  **bevor** sie die Grotte findet, fehlt im Finale die Pflichtwaffe. Vorschlag in Bibel 7.4:
  die Affen erst nach dem Grottenfund. Nicht eigenmaechtig eingebaut.
- **[OFFEN] Die Arena hat jetzt eine Verlustbedingung**, die sie vorher nicht hatte. Die
  Design-Regel aus `ARENA-ENDKAMPF.md` 1 ("die Arena bestimmt nur, wie teuer der Weg wird,
  nicht ob die Kernbeats geschehen") gilt damit nicht mehr vollstaendig - dort als solches
  gekennzeichnet.
- **[OFFEN] Harwicks Schriften in `2.1`** (der Wegweiser zum Saebel) sind noch nicht gebaut -
  drei Fragen dazu sind offen, siehe Gespraech.


### 2026-10-18 - Arbeitsdokument: eine Aufgabe fuer das Schiff vor dem Sturm
- **Hendriks Auftrag (17.10.):** "Das Schiff und den Sturm etwas mehr streamlinen bzw. den
  Spielern eine Aufgabe geben, die in ihrer freien Zeit bzw. vor allem im Sturm zu loesen
  ist." Dazu: "Schreibe eine Task-Datei, um fuer die Schiffszene vor dem Sturm eine kleine
  Aufgabe fuer die Gruppe zu finden."
- **Neue `AUFGABE-SCHIFF-VOR-DEM-STURM.md`** - Arbeitsdokument, kein Kanon: gemessener
  IST-Zustand von `2.1`/`3.1`, das Zeitfenster, sechs Randbedingungen, die vorhandene
  Mechanik, der Kandidatenraum, Hendriks offene Entscheidungen und die Definition of Done.
  **Keine Inhalte erfunden** - die Entscheidung gehoert Hendrik (Bibel 17).
- **Der tragende Fund: die Mundharmonika steht im Kanon und ist nie gebaut worden.**
  Bibel 6.2 fuehrt sie als **Leitbeispiel** fuer einen Szenen-Trigger auf dem Schiff -
  finden, zurueckbringen oder einstecken, "moralisch neutral, erzeugt organische Spannung
  innerhalb der Gruppe". **Im ganzen Repo kommt das Wort genau einmal vor: in dieser Zeile
  der Bibel.** Nicht in `js/regie.js`, nicht in den Szenendateien, nirgends im Code. Sie hat
  genau die Form, die hier fehlt, und sie ist Hendriks eigener Entwurf.
- **Die freie Zeit ist eine reale Stunde, und sie ist ueberbucht.** Bibel 6.1: T+30 findet
  Wat den blinden Passagier, **T+60 beginnt der Sturm**, ausdruecklich "bewusst zu knapp,
  damit realistisch niemand alles findet". Darin liegen schon **elf** Interaktionen. Das
  begrenzt den Kandidatenraum haerter als jede Geschmacksfrage - eine Aufgabe, die eine
  halbe Stunde Aufmerksamkeit braucht, hat dort keinen Platz.
- **Dirks kniffliges Problem ist NICHT verfuegbar**, obwohl es naheliegt: Bibel 10.4 legt
  fest, dass sein Payoff **nach** dem Sturm liegt - und korrigiert dort ausdruecklich eine
  frueher dort stehende Fassung, die "in der Sturm-Szene" sagte.
- **Der Sturm hat vier Aufgaben, die voneinander nichts wissen** (Rigg, Ned, Kanone,
  Wassereinbruch) - vier Orte, vier Einzelwuerfe, nichts baut aufeinander auf, nichts kommt
  aus der Zeit davor. Genau die Luecke, die Hendrik beschreibt.
- **Echter Widerspruch gefunden:** Der Wassereinbruch verlangt "Planken aus der Werkstatt
  holen" - die **Werkstatt steht in `3.1` auf `hiddenMarkers`**. Auf der Spielerkarte gibt es
  den Ort im Sturm nicht.
- **Technisch braucht eine solche Aufgabe nichts Neues:** `questDone` (Haken je Trigger),
  `hiddenMarkersLive`, `markerVariant`, `gmTimer` (traegt die T+30/T+60-Achse schon),
  `eigeneWaren` + `figuren/{pid}/zuteilung` fuer ein Fundstueck. Alle stehen in
  `SITZUNGS_PFADE`, also **keine Firebase-Regelaenderung**.
- **[OFFEN] Vier Entscheidungen, alle Hendriks** (Abschnitt 7 der Datei): welche Form; ob die
  Mundharmonika so gebaut wird, wie 6.2 sie beschreibt; **ob die Aufgabe IM Sturm oder NACH
  dem Sturm ausgezahlt wird** (der Auftrag sagt "vor allem im Sturm", 10.11 sagt, der Sturm
  benennt niemanden, der dort nicht ohnehin steht - beides gleichzeitig geht nicht); und was
  "streamlinen" fuer die vier Sturm-Aufgaben heissen soll.
- **[OFFEN] Was beim Bauen ohnehin mitmuss** (Abschnitt 8): beide Szenen rechnen noch nach
  dem alten Wertesystem; **`3.1` hat kein `uebergeordnetesZiel` und keine `stimmung`** - die
  einzige Szene im Projekt ohne beides; sechs `[OFFEN]` in den zwei Oberdeck-Aufgaben;
  `kombuese.standardverhalten` hat **0 Trigger**.


### 2026-10-17 (Fortsetzung 9) — Der eigene Ergebnisblock wartet jetzt auch
- **Hendriks Meldung:** „Wenn ich eine Fertigkeit oder Attribut rolle, steht das Ergebnis schon
  im Highlight-Kasten, bevor es im Profilbild angezeigt wird."
- **Das war meine eigene Entscheidung vom 16.10., und sie trägt nicht.** Dort stand: „Wer
  klickt, soll nicht auf sich selbst warten." Der Haken daran: **Der Ergebnisblock ist die
  auffälligste Stelle auf dem Schirm.** Wer dort schon die Zahl liest, während der Würfel noch
  dreht, für den ist die Animation Zierde — genau das, was beim Feed am 16.10. als Begründung
  fürs Warten galt.
- **Jetzt warten alle drei Anzeigen dieselben zwei Sekunden:** Porträt, Streifen oben und der
  eigene Block. Solange zeigt er **„würfelt …"** samt Probe und Würfelgröße — dasselbe, was im
  Porträt steht.
- **Der Wurf merkt sich den Augenblick** (`ab`), ab dem er gezeigt werden darf, statt dass die
  Anzeige mitzählt. Ein Timer zeichnet einmal neu, wenn die Zeit um ist — sonst bliebe
  „würfelt …" stehen, bis jemand irgendwo hinklickt.
- **Ein alter Eintrag ohne `ab` zeigt sofort.** Kein Warten auf etwas, das längst gefallen ist.
- **Die Regie wartet mit, und das ist richtig so:** Ihr **Feed wartet seit dem 16.10. ohnehin**
  diese zwei Sekunden. Wartete der Block dort nicht, liefen die beiden Anzeigen derselben Seite
  auseinander.
- **Getestet: 125 Prüfungen in `t_wuerfel.js`, 0 Fehler** (1 neue, 1590 über dreizehn Skripte).
  **Gegengeprüft:** Baut man das Warten aus, schlägt die Prüfung an.
- **Vier Bestandsprüfungen brachen, keine war ein Fehler im Code:** Sie lesen den Block
  unmittelbar nach dem Klick und sahen jetzt „würfelt …". `tests/t_wuerfel.js` hat deshalb eine
  **stellbare Uhr** bekommen (`u.vor()`), wie `t_bogen.js` sie längst hat — mit der echten Uhr
  müsste jede dieser Prüfungen zwei Sekunden lang wirklich warten.
- **Zweimal dieselbe Werkzeug-Falle an einem Tag:** Ein mehrzeiliger Suchtext per `python -c`
  durch die Shell zerlegte sich am Quoting, danach fand ein Suchtext wegen der Zeilenenden
  nichts. Beide Male stand der im Projekt vermerkte Weg daneben — Skript mit dem Write-Werkzeug,
  Ersetzung über den Helfer, der jede Zeile einzeln maskiert.


### 2026-10-17 (Fortsetzung 8) — Ein Klick auf das Ergebnis zeigt den Würfelweg
- **Hendriks Vorgabe:** „wenn man auf das obere Ergebnis klickt, dass sich dann der Würfelweg
  aufzeigt. Also explodiert oder wild die etc."
- **Die Rechnung gab es längst, der Feed trug sie nur nicht mit.** `wurf()` liefert seit jeher
  beide Ketten, die Würfelgrößen, wer gezählt hat und was nötig war — das blieb aber **im Bogen
  des Spielers liegen**. Niemand sonst konnte nachvollziehen, wie eine 17 zustande kam. Jeder
  Wurf trägt das jetzt als Feld `weg` mit.
- **Die Teilwürfe als LISTE, nicht als fertiger Satz.** Wer den Text speichert, kann ihn später
  nicht mehr anders anzeigen — die Zahlen bleiben Zahlen.
- **Was der Weg zeigt**, am Beispiel eines Wurfs, den die Prüfung genau kennt:

      Kai · Kämpfen d8
      Wert d8: 8 + 3 = 11  — explodiert bei 8      ← gezählt
      Wild Die (immer d6): 1
      Erfolg mit Steigerung — Steigerung (nötig war 8)

  - **Der Würfel, der NICHT gezählt hat, wird abgeblendet statt weggelassen** — man soll sehen,
    dass er gefallen ist.
  - **„immer d6" steht fest da**, nicht im Tooltip: Die Verwechslung mit dem eigenen Wert
    passiert genau beim Lesen des Ergebnisses (Bibel 4.3, Hendriks Meldung vom 14.10.).
  - Ein **Schadenswurf** zeigt seine Aufschlüsselung (Waffe, Stärke, Steigerungswürfel), ein
    **freier Würfel** jeden einzelnen Würfel samt Explosion.
  - Ein **alter Feed-Eintrag** ohne das Feld sagt das ehrlich („Zu diesem Wurf liegt kein Weg
    vor.") statt etwas zu erfinden.
- **Solange jemand liest, blendet der Eintrag nicht aus** — und nach dem Schließen läuft die
  Standzeit weiter. Ein Eintrag, der für immer stehen bliebe, nur weil ihn jemand einmal
  angesehen hat, wäre genauso falsch.
- **Mit der Tastatur erreichbar** (`tabindex`, `role="button"`, Enter/Leertaste, Escape
  schließt): Auf dem Tablet am Tisch gibt es kein Hovern, und der Streifen selbst fängt
  weiterhin keine Klicks ab — nur die Einträge, damit die Karte dazwischen anklickbar bleibt.
- **Getestet: 292 Prüfungen in `t_bogen.js`, 0 Fehler** (21 neue, 1589 über dreizehn Skripte).
  Der Klick wird **wirklich gefeuert**, nicht im Quelltext gesucht.
- **Drei eigene Fehler, und der dritte ist der lehrreichste:**
  1. **Der ältere Leisten-Test schnitt bis `attachPcRail`** und zog damit den ganzen neuen Code
     mit hinein, der Dinge braucht, die jener Kontext zu Recht nicht hat. Er schneidet jetzt
     nur noch die Leiste. **Ein Schnitt, der mehr mitnimmt als nötig, bricht bei jeder fremden
     Änderung.**
  2. **Der Stub kannte keine Ereignis-Lauscher.** Jetzt zeichnet er sie auf, statt sie ins
     Leere laufen zu lassen — sonst ließe sich der Klick gar nicht prüfen.
  3. **Zwei meiner Gegenproben waren selbst falsch.** Die erste erzeugte einen Syntaxfehler
     statt eines Fehlschlags (und „0 Fehler" sah aus wie Erfolg). Die zweite traf die falsche
     Zeile: Den Eintrag halten **zwei** Mechanismen — der Timer wird beim Öffnen gelöscht
     *und* er prüft beim Auslösen selbst, ob gerade jemand liest. Jeder allein genügt, deshalb
     schlug das Entfernen eines einzelnen nicht an. **Erst das Entfernen BEIDER lässt die
     Prüfung anschlagen** — sie schützt damit das Verhalten, nicht eine bestimmte Zeile.


### 2026-10-17 (Fortsetzung 7) — Die Ergebnisse oben blenden nach zwölf Sekunden aus
- **Hendriks Vorgabe:** „Die Würfelergebnisse sollten sich nach einigen Sekunden ausfaden."
- **Zwölf Sekunden** (`WB_STANDZEIT_MS`, eine Zahl an **einer** Stelle, damit sie sich am Tisch
  nachstellen lässt): lang genug, um das Ergebnis vorzulesen und darüber zu reden, kurz genug,
  dass der Streifen zwischen zwei Szenen wieder leer ist.
- **Ausblenden und Verdrängen sind ZWEI Bewegungen**, und das ist Absicht: Wer verdrängt wird,
  geht **zur Seite**; wer seine Zeit abgelaufen hat, **blendet nach oben weg**. So sieht man,
  *warum* ein Eintrag geht.
- **Der Timer hängt AM EINTRAG**, nicht in einer Liste daneben — wird er vorher verdrängt,
  lässt er sich dort wieder abräumen. Sonst liefe ein Timer auf einem Knoten, den es nicht
  mehr gibt.
- **Wer geht, zählt nicht mehr mit.** Ein ausblendender Eintrag wird bei der Grenze nicht
  mitgezählt — sonst würfe ein neuer Wurf Einträge hinaus, die ohnehin gerade verschwinden.
- **Drei Bestandsprüfungen brachen, und keine war ein Fehler im Code:** Der Limit-Test schob je
  Wurf **sechs Sekunden** vor, nach zwei Würfen war die Standzeit um und der Streifen beim
  Zählen leer. Er setzt die Würfe jetzt **dicht hintereinander** — und das ist ohnehin der
  Fall, den die Grenze regeln soll: mehrere Würfe kurz nacheinander.
- **Ein echter Fund am Prüfaufbau, und es ist der DRITTE lügende Stub dieser Sitzung:**
  `remove()` machte `splice(indexOf(this), 1)` — bei einem längst abgehängten Knoten ist
  `indexOf` **−1**, und `splice(-1, 1)` wirft das **letzte** Kind heraus, also einen
  **unschuldigen** Eintrag. Ein Timer eines verschwundenen Eintrags löschte damit einen
  aktuellen. Im Browser tut `remove()` auf einem abgehängten Knoten schlicht nichts; der Stub
  tut das jetzt auch. **Merke, zum dritten Mal: Ein Stub, der mehr tut als das Original, lügt.**
- **Getestet: 271 Prüfungen in `t_bogen.js`, 0 Fehler** (7 neue, 1568 über dreizehn Skripte).
  Mit gestellter Uhr durchgespielt: nach sechs Sekunden steht das Ergebnis noch, nach zwölf
  blendet es aus, danach ist es wirklich aus dem Baum.
  **Gegengeprüft:** Baut man die Standzeit aus, schlagen zwei Prüfungen an; räumt man den Timer
  beim Verdrängen nicht ab, eine dritte.


### 2026-10-17 (Fortsetzung 6) — Fehler: Der W10 war ein Dorn, kein Würfel
- **Hendriks Meldung mit Bild:** „Der 10er Würfel ist leider verbuggd." Im Porträt stand ein
  schmaler Splitter statt eines Körpers.
- **Nachgemessen statt geraten — und die Zahlen sind eindeutig:** Der W10 war
  **2,00 breit und 7,20 tief**, ein Verhältnis von **3,8 : 1**. Weil auf den Radius normiert
  wird, schrumpfte der Fünferring auf nichts zusammen; übrig blieb die Spitze.
- **Die Ursache ist ein frei geratener Wert von mir.** Beim Trapezoeder hängen zwei Größen
  zusammen: Liegen die Ringe im Abstand `c`, liegen die vier Ecken eines Drachens nur bei
  **einer** Spitzenhöhe `h` in einer Ebene — und `h` wächst **linear** mit `c`
  (`h = 9,47 · c`). **Frei ist nur eines von beiden.** Ich hatte `c = 0,38` gesetzt, womit die
  Spitze auf 3,6 schoss.
- **Jetzt wird die HÖHE vorgegeben und `c` zurückgerechnet** — so hoch wie der Ring weit ist,
  wie bei einem echten W10. Der Faktor wird dafür **gemessen** (eine Auswertung bei `c = 1`),
  nicht nachgeschlagen. Ergebnis: **2,00 × 1,90 × 2,00**, Verhältnis 1,05.
- **Der eigentliche Befund ist, dass ALLE 65 Prüfungen grün waren**, während am Bildschirm ein
  Splitter stand. Und sie hatten recht: Es war ein **geometrisch tadelloses Trapezoeder** —
  zehn Flächen, alle eben, Euler stimmte, jede Kante trug zwei Flächen. **Nur hat keine
  gefragt, ob die Proportion stimmt.** Ein Körper kann perfekt sein und trotzdem kein Würfel.
- **Zehn neue Prüfungen schließen genau diese Lücke**, für alle fünf Körper:
  - **keine Achse länger als das 1,3-fache der kürzesten** — das fängt den Dorn;
  - **keine Fläche ein Splitter** (längste gegen kürzeste Kante höchstens 2,2) — das fängt die
    langen dünnen Schlitze, die man im Porträt gesehen hat.
- **Gegengeprüft, und das ist der Beleg:** Setzt man `c = 0,38` zurück, schlagen beide an — und
  die Fehlermeldung nennt die Form wörtlich: **`3.78 (2.00 x 1.90 x 7.20)`**.
- **Getestet: 75 Prüfungen in `t_dice3d.js`, 0 Fehler** (10 neue, 1561 über dreizehn Skripte).


### 2026-10-17 (Fortsetzung 5) — Der Würfel-Feed oben links ist auf der Karte weg
- **Hendriks Vorgabe, auf Nachfrage präzisiert:** „die Würfelergebnisse links am Rand
  entfernen … Ich meine nur die Ergebnisse links oben. In den Charakterbildern soll das
  Ergebnis und der Würfel weiterhin stehen."
- **Er war die dritte Stelle für dieselbe Sache.** Seit heute stehen die Ergebnisse im
  **Porträt** (wer) und **oben mittig** (was) — der Feed oben links sagte es ein drittes Mal.
- **Die REGIE behält ihn, und das ist der eigentliche Punkt dieser Änderung.** Dort gibt es
  den Streifen nicht; der Feed ist die **einzige Live-Anzeige der Spielleitung**. Eine
  Änderung, die ihn dort mitgenommen hätte, wäre am Tisch sofort zu spüren gewesen —
  deshalb steht genau das jetzt als Prüfung da.
- **Abgeschaltet, nicht ausgeblendet.** Neue Option `ohneFeed` an `initDiceRoller()`, die nur
  `karte.html` übergibt: Ohne sie wird **gar kein Knoten gebaut und kein Lauscher eingehängt**.
  Ein per CSS verstecktes Element hätte weiter Knoten und Timer für Einblendungen erzeugt,
  die niemand sieht — toter Code, der aussieht, als liefe er.
- **Was NICHT mitgeht:** das Aufräumen alter Feed-Einträge (`on('value')`, 90 Sekunden). Ginge
  es mit, wüchse `diceRolls` in Firebase unbegrenzt. Steht als eigene Prüfung da.
- **Der tote Stil ist mitgegangen**, nicht liegengeblieben: die `#diceFeed`-Regel und die Zeile
  im Vorschau-Ausblender der Spielleitung. Nach der Änderung kommt `diceFeed` in `karte.html`
  **null**-mal vor.
- **Getestet: 124 Prüfungen in `t_wuerfel.js`, 0 Fehler** (8 neue, 1551 über dreizehn Skripte).
  **Gegengeprüft:** Übergibt man `ohneFeed` auch in `js/regie_vault.js`, schlägt die Prüfung an
  — die Spielleitung behält ihren Feed nachweislich.


### 2026-10-17 (Fortsetzung 4) — Die Ergebnisse stehen oben in der Mitte
- **Hendriks Vorgaben:** „Die Würfel noch ein wenig größer und die Ergebnisse oben in der Mitte
  anzeigen. Maximal Spieleranzahl Stück. Jeder weitere schiebt den ersten aus dem Bildschirm
  raus."
- **Die Würfel sind größer** (56 → 72 px, der Körper 44 → 58, die Zahl 25 → 31 px).
- **Neuer Ergebnis-Streifen oben mittig.** Die Arbeitsteilung ist der Punkt: Das **Porträt sagt
  WER**, der **Streifen behält WAS**. Ein Wurf im Gesicht eines Spielers ist nach vier Sekunden
  weg — oben bleibt er stehen, bis ihn ein neuer verdrängt.
  - **Oben mittig, weil dort als einziger Stelle nichts liegt:** links der Hub-Knopf, rechts die
    NSC-Leiste, unten Würfelleiste und Ton.
  - Er liegt **unter dem Backdrop des Bogens** (355 gegen 360) — schlägt jemand seinen Bogen
    auf, wird der Streifen mit abgedunkelt, genau wie die Würfelleiste.
  - **`pointer-events: none`**, sonst finge er Klicks auf die Karte ab.
- **Die Grenze ist die Spielerzahl**, gezählt über die Porträtleiste — und zwar **jeder
  Eintrag, auch wer kein Bild hochgeladen hat**: Er würfelt ja trotzdem. Ohne jeden Eintrag
  bleibt es bei vier; **eine Grenze von null hieße, es stünde nie etwas da.**
- **Verdrängt wird SICHTBAR.** Der neue kommt von rechts herein, der älteste geht nach **links
  hinaus** — erst nach der Bewegung fällt er aus dem Baum. Wer sofort entfernt, zeigt kein
  Verdrängen, sondern ein Springen.
- **Ein echter Fund dabei, und er lag quer zur Aufgabe:** `wuerfelImPortraet()` brach ab, wenn
  es keine Porträtkarte gab — **der Wurf eines Spielers ohne hochgeladenes Bild wäre also gar
  nicht oben erschienen.** Das Fehlen einer Karte lässt jetzt nur noch die Animation aus, nicht
  den Eintrag. **Gegengeprüft:** Stellt man den alten Abbruch wieder her, schlagen zwei
  Prüfungen an.
- **Getestet: 264 Prüfungen in `t_bogen.js`, 0 Fehler** (16 neue, 1543 über dreizehn Skripte).
  Der Ablauf wird mit **gestellter Uhr** durchgespielt: vor dem Ausrollen steht oben nichts,
  danach das Ergebnis; bei zwei Spielern bleiben **zwei** Einträge, und zwar die **jüngsten**.
  - **Die wichtigste Gegenprobe ist die Reihenfolge:** Wirft man den jüngsten statt den ältesten
    hinaus, schlägt die Prüfung an und nennt im Fehlertext `["A","B"]` statt `["C","D"]`. **Eine
    Grenze, die das Falsche wegwirft, wäre schlimmer als gar keine.**
- **Drei eigene Fehler beim Bauen:**
  1. **Der Knoten-Stub kannte `.children` nicht** — der echte Code liest es. Richtig so: Der
     Stub wächst mit dem Code, nicht der Code mit dem Stub.
  2. **Der Testschnitt begann zu spät.** Die Grenze hängt an der Spielerzahl, die
     `renderPcRail()` setzt — beides lag außerhalb des Schnitts, und der Test hätte eine
     **nachgebaute** Grenze geprüft statt der echten. Der Schnitt beginnt jetzt bei `pcAnzahl`.
  3. **Eine Prüfung maß zum falschen Zeitpunkt:** Sie suchte den Verdrängten, nachdem die Uhr
     schon über die 340 ms der Hinaus-Bewegung gelaufen war — da ist er aus dem Baum. Sie
     schaut jetzt **währenddessen** hin, und eine zweite prüft, dass er danach wirklich weg ist.


### 2026-10-17 (Fortsetzung 3) — Jetzt ein echter Körper: Tetraeder bis Dodekaeder
- **Hendriks Einwand, und er sitzt:** „Jetzt dreht sich eine 2d geometrische Form. Es müsste
  aber ein 3d Würfel erstellt werden, der sich dreht." Meine drei gestapelten Lagen waren
  **vorgetäuschte Dicke**, kein Körper — eine Scheibe mit Schattenkeil.
- **Neue `js/dice3d.js`:** echte Polyeder aus Flächen im Raum, je eine `<div>` mit `matrix3d`
  an ihrem Platz und `clip-path` auf ihrem Umriss. **d4 Tetraeder · d6 Würfel · d8 Oktaeder ·
  d10 pentagonales Trapezoeder · d12 Dodekaeder.**
- **Kein three.js, und das ist eine Entscheidung:** Die Bibliothek wären **600 KB plus ein
  WebGL-Kontext je Porträt** — bei vier Spielern vier Kontexte, für 56 px und zwei Sekunden.
  CSS 3D kostet nichts und kann es.
- **Die Flächen werden GERECHNET, nicht getippt.** Ein Dodekaeder hat 12 Fünfecke aus 20 Ecken;
  diese Liste aus dem Kopf zu schreiben heißt, sich zu verschreiben — und ein falsch gewickeltes
  Fünfeck sieht am Bildschirm nur „irgendwie kaputt" aus. In der Datei steht deshalb **nur die
  Eckenliste**, die Flächen leitet `d3Flaechen()` daraus ab: *jede Ebene, auf deren einer Seite
  alle übrigen Ecken liegen, ist eine Fläche.* Das ist die Definition eines konvexen Körpers,
  und sie kann sich nicht verschreiben.
- **Beim W10 wird sogar die Höhe der Spitze ausgerechnet.** Sie ist nicht frei: Nur bei einem
  bestimmten Wert liegen die vier Ecken eines Drachens in einer Ebene. **Gegengeprüft, und das
  ist der eindrucksvollste Beleg des Tages:** Setzt man statt der Rechnung eine geratene Höhe
  ein, zerfallen die **zehn Drachen in zwanzig Dreiecke** — der Körper wäre geknickt.
- **Neues `tests/t_dice3d.js`, 65 Prüfungen, 0 Fehler** — und zwar **gegen die Geometrie, nicht
  gegen eine abgeschriebene Tabelle**: Flächenzahl, Ecken je Fläche, **Planarität**,
  **Eulersche Formel V − E + F = 2**, jede Kante trägt genau zwei Flächen, alle Normalen zeigen
  nach außen, keine Ecke hängt in der Luft. Dazu zwei Prüfsteine, deren Zahlen man kennt: beim
  Würfel stehen die Flächen senkrecht aufeinander, und das Tetraeder hat **70,53°** zwischen
  den Flächen.
- **Ein eigener Fehler, und er war lehrreich:** Diese 70,53 meldeten zuerst **109,47** — ich
  hatte den Winkel zwischen den **Außennormalen** gemessen und mit dem **Flächenwinkel**
  verglichen. Die beiden ergänzen sich zu 180°. **Der Code hatte recht, meine Erwartung nicht.**
- **Die Normalen zeigen nach außen, und das ist keine Formalie:** Eine abgewandte Fläche wird
  vom Browser weggeblendet (`backface-visibility: hidden`) — zeigte eine nach innen, hätte der
  Würfel ein Loch.
- **Das `<script>`-Tag hätte ich fast vergessen.** Die Datei war eingebaut, überall referenziert
  — und nirgends geladen. Genau die hängende Referenz, die dieses Projekt schon einmal gekostet
  hat; gefunden, weil ich nach dem Einbau auf `grep 'js/dice3d.js'` gesehen habe und dort **nur
  Kommentare** standen.
- **Die Zahl steht weiterhin DAVOR, nicht auf einer Fläche.** Bei 56 px wäre eine mitgedrehte
  Ziffer auf einer Dodekaeder-Fläche nicht zu lesen.
- **Das Licht ist fest im Körpersystem** (je Fläche eine Helligkeit aus ihrer Normalen). Es
  dreht sich also mit — für wanderndes Licht bräuchte es WebGL. Es macht die Kanten sichtbar,
  und genau dafür ist es da.
- **Getestet: 248 Prüfungen in `t_bogen.js`** (die Formprüfungen zählen jetzt **Flächen** statt
  Umrisse — das unterscheidet einen Körper von einer Scheibe), **1527 über dreizehn Skripte**.
- **Drei eigene Fehler beim Umbau, alle gefunden:** eine Klammer zu viel; eine Prüfung, die
  **vom Wurf des vorigen Blocks lebte** und nach dessen Entfernung auf `null` lief (sie hat
  jetzt ihren eigenen); und zum wiederholten Mal die **Heredoc-Falle** — ein `\n` im Suchmuster
  kam als echter Zeilenumbruch an und zerlegte die Regex. Statt den Backslash zu reparieren,
  schneidet die Prüfung jetzt **ohne Regex**.
- **[OFFEN] Ein Polyeder, aber ohne Augen.** Die Flächen sind leer; die Zahl steht als
  Einblendung davor. Zahlen auf die Flächen zu legen wäre der nächste Schritt — bei dieser
  Größe aber eher Zierde als Gewinn.


### 2026-10-17 (Fortsetzung 2) — Der Würfel taumelt im Raum statt in der Bildebene
- **Hendriks Wunsch:** „Aktuell dreht diese sich nur in eine Achse. Es wäre schön, wenn eine
  dreidimensionale Sicht wäre, wie bei Baldur's Gate 3."
- **Er hat recht, und zwar wörtlich:** Die Animation war ein `rotate()` — eine Drehung um die
  **Bildachse**. Das ist ein Kreisel, kein Würfel. Drei Dinge fehlten, und keines allein hätte
  gereicht:
  1. **Perspektive** (`perspective: 220px`) — ohne sie bleibt jede Drehung flach.
  2. **Drei Drehachsen** statt einer. Die Umlaufzahlen sind bewusst **verschieden**
     (X 1,5 · Y 1 · Z 1): Bei gleichen Zahlen kehrt dieselbe Lage ständig wieder, und man sieht
     die Schleife.
  3. **Dicke.** Ein flaches Polygon wird beim Kippen durch 90° zu einem **Strich** und
     verschwindet. Der Körper besteht deshalb aus **drei gestaffelten Lagen** desselben
     Umrisses (`translateZ` −7 / −3,5 / 0), die hinteren dunkler — das ist der Schattenkeil, der
     die Tiefe überhaupt sichtbar macht.
- **Die Zahl liegt AUSSERHALB des taumelnden Körpers.** Sie ist jetzt ein eigenes Element davor
  statt ein `<text>` im SVG — sonst taumelte sie mit und wäre unlesbar.
- **Am Ende fällt er in die Lage, statt im Stehen einzufrieren:** ein kurzes Überschwingen
  (`cubic-bezier(.22,1.5,.38,1)`), dann liegt er flach. Ein Würfel, der mitten in der Drehung
  stehen bleibt, sieht nach Fehler aus.
- **Der Umriss bleibt derselbe** — `DICE_FORMEN` aus `js/dice.js`, dreimal gestapelt. Die
  Formen von gestern gelten unverändert weiter, der d4 ist weiterhin das Dreieck.
- **Ehrlich zur Grenze:** Das ist ein **Körper mit Dicke**, kein echtes Polyeder — ein d8
  taumelt als Raute mit Tiefe, nicht als Oktaeder mit acht Flächen. Dafür bräuchte es echte 3D,
  und bei 56 px für zwei Sekunden wäre der Unterschied kaum zu sehen. Falls doch gewünscht, ist
  das eine eigene Runde.
- **Getestet: 243 Prüfungen in `t_bogen.js`, 0 Fehler** (18 neue, 1455 über zwölf Skripte).
  Geprüft wird genau das, was den Unterschied macht: Perspektive, `preserve-3d`, drei Lagen
  Dicke, das Hinlegen am Ende — und dass **jede der fünf Zwischenlagen** alle drei Achsen trägt.
- **Die erste Fassung dieser Prüfung war zu lasch, und die Gegenprobe hat es gezeigt:** Sie
  verlangte nur, dass `rotateX` **irgendwo** im Block vorkommt. Nimmt man einer Zwischenlage
  zwei Achsen weg, taumelt der Würfel dort flach — und sie schlug trotzdem nicht an. Jetzt
  zählt sie je Achse fünf Vorkommen. **Gegengeprüft:** Mit der flachen Zwischenlage schlagen
  zwei Prüfungen an, ohne die Tiefe eine dritte.
- **Wieder die Heredoc-Falle**, diesmal im Testskript: Ein `backslash-n` im Suchmuster kam als
  echter Zeilenumbruch an und zerlegte die Regex („Invalid regular expression"). Statt den
  Backslash zu reparieren, schneidet die Prüfung den Block jetzt **ohne Regex** — dann gibt es
  nichts zu maskieren.


### 2026-10-17 (Fortsetzung) — Der Würfel-Feed nennt die Figur
- **Hendriks Wunsch:** In der Aufzählung soll auch der Charaktername stehen.
- **Der Feed kannte ihn gar nicht.** Alle drei Zeilen begannen mit `roll.name`, und das ist der
  **Spieler**name („Peter"). Das **Protokoll** trug den Figurennamen längst mit — der Feed nicht.
  Genau dieselbe Lücke war gestern schon der Knackpunkt bei der Würfel-Animation: Ein Wurf
  trägt den Spieler, die Porträtleiste die Figur.
- **Jetzt: „Kai (Peter) — Kämpfen d8: Erfolg (7)".** Die **Figur steht vorn**, weil der Feed
  beschreibt, was in der Szene geschieht; der Spielername daneben sagt, wen man ansehen muss.
- **Drei Fälle, in denen keine Figur dasteht** — und in keinem darf eine leere Klammer
  erscheinen:
  - Die **Spielleitung** würfelt ohne Figur → „SL — Schaden: 11".
  - Ein Name aus lauter **Leerzeichen** zählt nicht als Figur.
  - Heißt die Figur **wie der Spieler**, bleibt es bei einem Namen — „Kai (Kai)" wäre albern.
  - Ein **alter Feed-Eintrag** ohne das Feld sieht aus wie vorher.
- `figurName()` steht an **einer** Stelle und wird von allen drei Wurfarten benutzt: „mal mit,
  mal ohne" wäre im Feed schlimmer als gar nicht.
- **Getestet: 116 Prüfungen in `t_wuerfel.js`, 0 Fehler** (12 neue, 1439 über zwölf Skripte).
  Die Zeile wird **aus `js/dice.js` geschnitten und ausgeführt**, nicht nachgebaut. Darunter
  alle vier Ausnahmefälle und die Prüfung, dass die Figur an **allen drei** Schreibstellen
  mitgeht. **Gegengeprüft:** Nimmt man den Schutz gegen den Doppelnamen heraus, schlägt eine
  Prüfung an.
- **Ein Testschnitt musste mitwachsen:** `t_wuerfel.js` schneidet `formatRollText()` aus dem
  Quelltext. Die Funktion hat jetzt einen Helfer davor, und ohne ihn lief die geschnittene
  Fassung ins Leere. Der Schnitt beginnt deshalb bei `werfer()`.


### 2026-10-17 — Der Würfel im Porträt trägt die Form seiner Größe
- **Hendriks Wunsch:** „wenn der Würfel in der Form seiner Höhe gerollt wird. Also 4er 6er 8er
  10er oder 12er."
- **Die Formen gab es längst** — `DICE_FORMEN` in `js/dice.js` zeichnet seit dem 14.10.2026
  Dreieck, Quadrat, Raute, Drachen und Fünfeck für die Würfelleiste. **Sie werden benutzt, nicht
  nachgebaut:** Zwei Fassungen derselben Polygone liefen auseinander, und dann zeigte die Leiste
  einen anderen d10 als das Porträt.
- **Gefehlt hat nur die Angabe, WELCHE Größe ein Wurf hatte.** Bei einer Probe steckte sie
  allein im Fließtext („Kämpfen d8") — den zu zerlegen wäre geraten gewesen, zumal dort bei
  einem ungelernten Wert **„ungelernt (d4−2)"** steht. Jeder Wurf trägt jetzt ein eigenes Feld
  `seiten`.
  - Beim **Schadenswurf** fallen mehrere Würfel (Waffe + Stärke, bei einer Steigerung noch 1W6).
    Gezeigt wird der **größte** — er ist der, den man vor sich sieht, wenn jemand „Säbel und
    Stärke" sagt.
  - Ein **alter Feed-Eintrag** von vor dieser Änderung hat kein `seiten` und fällt auf den W6
    zurück. Eine Form muss es geben, sonst stünde dort ein Loch.
- **Nur der Körper dreht sich, die Zahl bleibt aufrecht.** Eine mitrotierende Ziffer ist nicht
  zu lesen — deshalb trägt das Polygon die Animation und der Text nicht.
- **Geflackert wird im Zahlenraum DIESES Würfels:** Ein d4, der beim Rollen eine 11 zeigt, wäre
  Unsinn.
- **Getestet: 233 Prüfungen in `t_bogen.js`, 0 Fehler** (10 neue, 1427 über zwölf Skripte).
  Alle fünf Größen einzeln: **d4 bekommt nachweislich das Dreieck, d12 das Fünfeck** — geprüft
  gegen `DICE_FORMEN`, das der Test **aus `js/dice.js` lädt** statt es abzuschreiben.
  **Gegengeprüft:** Klemmt man die Form fest auf d6, schlagen **fünf** Prüfungen an.
- **Ein eigener Fehler am Prüfaufbau, und er ist der lehrreichste des Tages:** Mein Knoten-Stub
  gab für **jeden** unbekannten Selektor einen Platzhalter zurück — damit sah „nicht gefunden"
  aus wie „gefunden", und der Code rief `remove()` auf etwas, das es nie gab. **Ein Stub, der
  immer etwas liefert, lügt.** Jetzt gibt er nur noch für die beiden SVG-Internas einen
  Platzhalter, sonst ehrlich `null`.
- **Dazu zweimal dieselbe Werkzeug-Falle:** Backticks in einem Changelog-Text, per `python -c`
  durch die Shell geschickt, wurden als Befehlsersetzung ausgeführt. Der im Projekt vermerkte
  Weg (Write-Werkzeug) stand die ganze Zeit daneben.


### 2026-10-16 (Fortsetzung) — Die Leiste geht in die Mitte, der Würfel rollt im Porträt
- **Hendriks Screenshot:** Würfelleiste und Lautstärkeregler lagen **über den Porträtleisten** —
  links verdeckte die Leiste den untersten Spielernamen, rechts der Regler den untersten NSC.
  Dazu der Wunsch: „eine kleine Würfelanimation im Charakterbild des Spielers … darf ruhig
  2 Sekunden laufen, bevor man das Ergebnis sieht."
- **Die Leiste steht jetzt mittig unten** (`left:50%` statt `left:16px`). Sie läuft auf **zwei**
  Seiten, deshalb liegt der Stil in `js/dice.js` und nicht in den Seiten — zwei Kopien liefen
  sonst auseinander.
- **Der Lautstärkeregler ist eingeklappt** und zeigt nur noch das Lautsprecher-Symbol (Deckkraft
  .45). Der Schieber fährt bei **Hover ODER Fokus** aus.
  - **Fokus ist kein Beiwerk:** Auf dem Tablet am Tisch gibt es kein Hovern, und ein Regler, der
    nur mit der Maus aufgeht, wäre dort **gar nicht erreichbar**.
  - Eingeklappt über `width:0`, nicht `display:none` — so bleibt er für die Tastatur erreichbar
    und lässt sich animieren.
- **Der Würfel rollt im Porträt des Spielers**, zwei Sekunden, danach steht das Ergebnis da:
  Zahl groß, Probe und Band klein darunter, grün bei Erfolg, rot bei Misserfolg. Nach vier
  Sekunden räumt es sich ab — sonst klebte das Ergebnis den ganzen Abend über dem Gesicht.
- **Der Knackpunkt war die ZUORDNUNG, nicht die Animation.** Ein Wurf trägt den **Spielernamen**
  („Peter"), die Leiste den **Figurennamen** („Kai"). Verbunden werden sie über
  **`spielerKennung(roll.name)`** — denselben Schlüssel, unter dem auch die Figur liegt. Die
  Karte trägt ihn jetzt als `data-pid`. **Gegengeprüft:** Nimmt man `spielerKennung()` heraus
  und vergleicht die Namen direkt, findet der Wurf keine Karte mehr und die Prüfung schlägt an.
- **Der Feed wartet mit.** Ein frischer Wurf erscheint in der Einblendung erst nach denselben
  zwei Sekunden — sonst stünde das Ergebnis schon da, während der Würfel noch dreht, und die
  Animation wäre Zierde statt Spannung. **Alte Würfe warten nicht:** Beim Neuladen reicht
  Firebase alles aus 90 Sekunden nach, und darauf soll niemand warten. `DICE_ANIM_MS` steht
  deshalb in `js/dice.js` und wird von beiden Seiten gelesen.
- **Nur frische Würfe lösen aus** (6 Sekunden). Ohne diese Schranke ruckelte beim Betreten der
  Karte die halbe Leiste gleichzeitig los — Firebase reicht den ganzen Feed nach.
- **Ein zweiter Wurf ersetzt den ersten**, statt sich darüberzulegen; alte Timer werden dabei
  abgeräumt. Und wer **kein Bild hochgeladen hat**, hat keine Karte — das bricht nichts, der
  Feed zeigt den Wurf trotzdem.
- **Getestet: 223 Prüfungen in `t_bogen.js`, 0 Fehler** (22 neue, 1417 über zwölf Skripte, ein
  bekannter Fehlschlag in `t_figuren.js`). Der Ablauf wird mit **gestellter Uhr** wirklich
  durchgespielt: Bei 1999 ms steht nachweislich **kein** Ergebnis, bei 2001 ms steht es da.
  Dazu zwei Karten in der Leiste, damit sich zeigt, dass die **richtige** getroffen wird.
- **Zwei eigene Fehler beim Bauen:**
  1. **Zwei Testnamen waren schon vergeben** (`karte`, `anzahl`) — und beim Umbenennen habe ich
     mit einer pauschalen Ersetzung **die Schlusszeile des Tests miterwischt**, die denselben
     Zähler benutzt. Der Lauf meldete danach „OK: 1". **Merke:** eine Ersetzung über den
     ganzen Dateirest trifft auch das, was nicht gemeint war — und ein Testzähler, der plötzlich
     1 sagt, ist kein grüner Lauf.
  2. **Der Knoten-Stub des älteren Leisten-Tests kannte kein `dataset`** und brach, sobald der
     echte Code eines setzte. Richtig so: Der Stub muss mit dem Code mitwachsen, nicht der Code
     mit dem Stub.


### 2026-10-16 — Grimsgate auf das neue Wertesystem (erste von dreizehn Szenen)
- **Hendriks Auftrag:** „Wir müssen die ganzen Szenen jetzt noch auf das neue System
  umschreiben. Kannst du das automatisch tun? Starte erst mal mit Grimsgate.“
- **Antwort auf „automatisch“: zur Hälfte, und der Rest ist der gefährliche Teil.** Erst
  gemessen, dann gebaut: **182 alte Wertenennungen, 480 Trigger, 13 verwaiste „Schlechter
  Erfolg“-Stellen** im ganzen Abenteuertext.
  - **Mechanisch (Skript genügt):** `Wahrnehmung → Aufmerksamkeit` · `Mechanik → Handwerk` ·
    `Seefahrt → Segeln` · `Geheim → Heimlichkeit` · `Klettern → Athletik`.
  - **NICHT mechanisch:** `Körper` (36×), `Geschick` (23×) und `Auftreten` (11×) zerfallen je
    nach Szene. **Allein in Grimsgate heißt `Körper` zweimal Verschiedenes** — im
    Trinkwettbewerb **Konstitution** (durchhalten), beim Fesseln-Lösen **Athletik** (sich
    winden). Ein blindes Suchen-und-Ersetzen hätte das festgeschrieben.
- **Zwei Regeln, die für die ganze Umstellung gelten:**
  1. **TRIGGER-IDs BLEIBEN.** Sie liegen als `questDone/{szene}/{triggerId}` in Firebase — ein
     umbenanntes `koerper_gut` nimmt der laufenden Kampagne **lautlos** ihre gesetzten Haken.
     Geändert sind nur `label`, `info`, `kurz` und `details`. Der Trigger heißt im Code weiter
     `koerper_gut` und zeigt am Tisch „Konstitution: Steigerung“.
  2. **„Schlechter Erfolg“ wird „Erfolg“, der Text bleibt als Farbe** (Hendriks Entscheidung).
     Deckt sich mit seiner Ansage vom 07.09.2026, schlechte Erfolge nicht mehr auszuspielen —
     und **kein Text geht verloren.**
- **Die Zuordnung in Grimsgate, als Schablone für die übrigen zwölf Szenen:**

      Körper   (Trinkwettbewerb)   -> Konstitution    heuer/zwillinge
      Körper   (Fesseln lösen)     -> Athletik        bordell/wat_falle
      Auftreten (überzeugen)       -> Überreden       zwillinge, bordell ×2
      Auftreten (nicht auffallen)  -> Heimlichkeit    hafenmeisterei
      Wahrnehmung                  -> Aufmerksamkeit  lagerhaeuser

- **„kostet 1 Körper“ hat im neuen System keine Entsprechung** — alter Attributsschaden wird zu
  **„angeschlagen“**, und zwar als **Angebot** an die Spielleitung, nicht als Pflicht. Es war
  der **einzige** solche Fall im ganzen Abenteuer.
- **Zwei Stellen bleiben bewusst stehen:** „keine feste **Mechanik**“ und Harwicks
  „selbstsicheres **Auftreten**“ sind Prosa, keine Werte. **Meine erste Prüfung hat beide als
  Fehler gemeldet** — sie sucht jetzt nach dem Probenzusammenhang (`X-Probe`, `Probe auf X`),
  nicht nach dem Wort. Genau diese zwei hätte ein Skript zerschossen.
- **Neues `tests/t_szenen.js`, 33 Prüfungen, 0 Fehler.** Es führt eine Liste `UMGESTELLT`, die
  **mit der Arbeit wächst** — sonst stünde es von Anfang an rot und sagte damit nichts mehr.
  Die Trigger-IDs sind als **Kopie** festgenagelt, nicht aus dem Code abgeleitet: Eine Prüfung,
  die ihre Erwartung aus dem Prüfling zieht, macht jede Umbenennung einfach mit.
  - **Gegengeprüft gegen den Stand davor: 9 Prüfungen schlagen an**, darunter alle drei alten
    Bänder und jeder der vier alten Wertenamen.
- **Eigener Fehler, der den Tisch gekostet hätte:** Ich habe committet und **nicht gepusht** —
  und danach eine Rückfrage gestellt, statt auszuliefern. Hendrik sah deshalb im Browser
  weiterhin „Probe: Körper (alt. Auftreten)“, obwohl die Datei lokal längst umgestellt war.
  **Merke: GitHub Pages liefert `origin/main`, nicht den lokalen Commit.** Ein „fertig“ ohne
  Push ist für ihn kein Fertig.
- **[OFFEN] Zwölf Szenen**, rund 160 Wertenennungen, 12 der 13 „Schlechter Erfolg“-Stellen. Die
  **Schatzinsel** ist die dickste (die Höhlen-Kammer allein hat ein halbes Dutzend Proben). Die
  **Golden Lion** wäre der nächste sinnvolle Schritt: `2.1`/`3.1`/`5.1`/`6.1`/`10.1`/`12.1`
  teilen sich dieselben Orte und sind damit in einem Durchgang erledigt.


### 2026-10-15 (Fortsetzung 18) — Spieler laden ihr Charakterbild hoch, es steht links
- **Hendriks Wunsch:** „Gibt es eine Möglichkeit, in der Spieler Bilder ihres Charakters
  hochladen können und diese dann am linken Bildschirmrand teilen? (So wie ich mit NSC am
  rechten Rand)“ — und nach Rückfrage: **über die Datenbank, Spieler laden selbst hoch.**
- **Ohne Firebase Storage, und das ist der tragende Punkt.** Storage bräuchte ein zweites SDK
  **und eigene Regeln, die von Hand in der Konsole zu veröffentlichen wären** — bis dahin
  schlägt jeder Upload **still** fehl. Genau die Falle, die in diesem Repo mehrfach
  dokumentiert ist.
  - Stattdessen: Das Bild wird **im Browser des Spielers verkleinert** (Canvas → WebP,
    450×600) und als Data-URI geschrieben. Nachgemessen an den vorhandenen Porträts
    (Harwick 502×900 bei 85 KB) und an der Leiste, die höchstens `clamp(108px, 8vw, 220px)`
    breit ist: 450×600 reicht auch bei doppelter Pixeldichte und landet bei **rund 14 KB**.
- **Das Bild liegt NICHT in der Figur, sondern daneben — `pcLeiste/{schlüssel}`.** Drei Gründe,
  und der erste allein genügt:
  1. **`bogenFelder()` geht bei JEDER Änderung hoch**, entprellt mit 800 ms. Läge das Bild
     darin, gingen bei jedem Klick auf einen Stepper ~50 KB durchs Netz — unbemerkt, für immer.
  2. **Die Karte braucht nur Name und Bild.** Auf `figuren` zu horchen hieße, jedem Spieler bei
     jeder Änderung an irgendeiner Figur deren Steckbrief, Notizen und Ausrüstung
     mitzuschicken.
  3. **Die Spielleitung darf ausblenden, ohne einen WERT der Figur anzufassen.** Der Bogen
     bleibt ihr einziger Schreiber — dieselbe Linie wie bei Anfrage, Notiz und Postfach.
  - **`pcLeiste` steht in `SITZUNGS_PFADE`**, liegt also unter `sitzungen/{sid}/stand/`.
    **Kein neuer Top-Level-Pfad, also keine Regeländerung.**
  - Beide Seiten schreiben per **`update()` auf eigene Schlüssel**: der Spieler `bild`/`name`,
    die Spielleitung `aus`. Ein `set()` von einer Seite würde die andere mitlöschen.
- **Die Leiste hängt NICHT an der Szene** — anders als die der NSC, und das ist Absicht: Ein
  NSC betritt eine Szene und geht wieder, **die Spieler sind den ganzen Abend da.** Sie steht
  also, sobald jemand ein Bild hochgeladen hat; einzelne nimmt die Spielleitung in
  `regie_figuren.html` per Knopf von der Karte (beschriftet nach Zustand — „ausblenden“ bzw.
  „einblenden“, sonst klickt man es versehentlich wieder an).
  - **Links sitzt mittig der Bogen-Griff.** Ohne eigenen Abstand (`padding-left`) läge die
    Leiste genau darüber, und der Griff wäre nicht mehr anklickbar. In der Vorschau der
    Spielleitung ist der Griff ausgeblendet — dort fällt der Abstand weg.
- **Beim Löschen einer Figur geht das Bild mit** (`figurLoeschen()`): **erst die Leiste, dann
  die Figur.** Wer nur die Figur löscht, lässt das Porträt eines gelöschten Charakters an der
  Karte hängen — und niemand findet mehr die Stelle, an der es abzuschalten wäre.
- **Getestet: 1303 Prüfungen über elf Skripte** (46 neue), **ein** Fehlschlag — der bekannte
  aus `t_figuren.js` („vor dem ersten Ergebnis ist die Kachel zu“), unverändert seit dem 13.10.
  - **Die wichtigste Prüfung ist die billigste:** *das Bild reitet nicht in `bogenFelder()`
    mit.* **Gegengeprüft** — baut man es dort ein, schlägt sie an, und mit ihr die Prüfung,
    dass der Upload nach `pcLeiste` geht und nicht in die Figur.
  - **Die stehende Regel ist erweitert, nicht aufgeweicht:** Jetzt sind **fünf** Ziele erlaubt,
    aber die Prüfung „kein Schreibzugriff fasst einen WERT der Figur an“ steht unverändert —
    **und der neue Zugriff wird in ihrem Block wirklich ausgeführt.** Eine Regel, die den
    neuen Zugriff gar nicht auslöst, schützt vor ihm auch nicht. **Gegengeprüft:** Stellt man
    den Umschalter auf `set()` auf den ganzen Knoten um, schlagen **vier** Prüfungen an.
  - Dazu: der Spielername wird mit **`textContent`** gesetzt, nicht als HTML — er kommt von
    einem Spieler, nicht aus dem Code; die Reihenfolge der Leiste ist **fest**, weil
    `Object.keys` keine Zusage ist und eine springende Leiste unbrauchbar wäre; ohne WebP wird
    **JPEG** genommen und nicht das PNG, das `toDataURL` stillschweigend liefert.
  - **Ein Durchgang über alle drei Seiten** mit einer gemeinsamen gefälschten Datenbank:
    hochladen → 14 KB unter `pcLeiste/anna`, `figuren/anna` **unberührt** → die Leiste zeigt
    „Mara Quint“ → ausblenden → leer, **`bild` und `name` stehen noch** → einblenden → wieder da.
- **Ein echter Fund am Werkzeug, nicht am Code:** Mein Ersetzungs-Helfer probierte „erst alles
  LF, dann alles CRLF“. In `js/sitzung.js` steht aber wörtlich `'eigeneWaren',\n  'kampf'\r\n`
  — **die Zeilenenden wechseln MITTEN IM BLOCK.** So etwas findet er nie und bricht ab (die
  Datei blieb unversehrt, das `assert` steht vor dem Schreiben). Der Helfer maskiert jetzt
  **jede Zeile einzeln** und erlaubt dazwischen `\r?\n`; geschrieben wird mit dem Zeilenende,
  das an der **Fundstelle** steht — so ändert eine Ersetzung keine fremde Zeile.
  **Merke, schärfer als bisher:** Nicht „das“ Zeilenende einer Datei bestimmen, auch nicht
  „beide probieren“ — eine einzelne Stelle kann beide enthalten.
- **Drei eigene Fehler beim Bauen, alle gefunden, bevor etwas falsch wurde:**
  1. **Ein Testname war schon vergeben** (`gezeichnet`) — dieselbe Sorte Zusammenstoß wie
     `lctx`/`W`/`gb` zuvor.
  2. **Der Schnitt endete am Wort „STEIGERUNG“** und damit **mitten in einem Kommentar** — der
     geschnittene Code war unparsebar. Jetzt endet er am Kommentar-Anfang.
  3. **Eine veraltete Erwartung in `t_figuren.js`:** Sie verlangte „genau ein Löschvorgang“,
     während jetzt zwei Knoten geräumt werden. Sie prüft jetzt, dass der Zähler **nicht
     wächst** statt auf einer festen Zahl zu stehen — eine feste Zahl hing am Aufbau, nicht am
     Verhalten. Drei neue Prüfungen dazu, darunter die **Reihenfolge** erst Bild, dann Figur.
- **[OFFEN] Zwei Geräte desselben Spielers.** Lädt jemand auf dem Handy ein Bild hoch, während
  der Bogen auf dem Laptop offen steht, gewinnt der zuletzt geschriebene Stand. Für ein Feld,
  das man einmal setzt, ist das kein Problem — es steht hier nur, damit niemand es später für
  übersehen hält.
- **[OFFEN] Kein Zuschnitt durch den Spieler.** Geschnitten wird fest auf 3:4, waagerecht
  mittig und senkrecht oben (bei einem Porträt sitzt der Kopf oben). Wer ein Querformat
  hochlädt, bekommt dessen Mitte. Ein Rahmen zum Verschieben wäre der nächste Schritt, falls
  es am Tisch stört.


### 2026-10-15 (Fortsetzung 17) — „Ungelernt“ sagt jetzt, was es heißt
- **Hendriks Frage am Screenshot:** „Test hat keinen Kampf-Skill. Worauf würfelt er?“ Dort
  stand **„KÄMPFEN — · NÖTIG 8“**.
- **Die Regel war richtig, die Anzeige schwieg.** Der Gedankenstrich ist `DLBL[0]`, die
  Beschriftung für „ungelernt“. In einer **Tabelle** ist er richtig; im **Ergebnis eines
  Wurfs** liest er sich wie ein Fehler — und die Regel dahinter (**d4 mit −2**, Bibel 4.1)
  stand dort nirgends.
- **Neue `stufeText()` in `js/regelwerk.js`:** ein gelernter Wert bleibt „d6“, ein ungelernter
  heißt **„ungelernt (d4−2)“**. Benutzt an den drei Stellen, an denen ein WURF beschrieben
  wird: die Bitte der Spielleitung, der Ergebnisblock und der Würfel-Feed. In den Tabellen
  (Bogen, SL-Übersicht) bleibt der Gedankenstrich — dort ist er die richtige Kurzform.
- **Dazu Hendriks zweite Frage — „Was sind Wild Die? Wann kommen die? Bitte mit dem Regelwerk
  abgleichen.“** Nachgelesen im offiziellen Text, mit Bibel §4.3 und `js/regelwerk.js`
  verglichen: **alles deckungsgleich** (nur Wild Cards, immer d6, beide explodieren unabhängig,
  das höhere Gesamtergebnis zählt, Modifikatoren auf beide, Patzer bei zwei natürlichen Einsen).
  - **Eine Zeile fehlte in der Bibel**, und seit dem Kampfmodus ist sie nicht mehr theoretisch:
    *„Heroes don't get Wild Dice on damage rolls — those only apply to Traits."* Der Wild Die
    gilt **nur auf Proben**, nie auf Schadenswürfe und nie auf Würfe, die keine Probe sind
    (etwa das 1W6 fürs Laufen). Dazu **ein Wild Die je Handlung**, auch wenn mehrere Würfel
    fallen. **Der Code hielt sich schon daran** — `wuerfleSchaden()` und die freien Würfel
    werfen keinen; jetzt steht es auch da, wo man nachliest.
- **Getestet: 104 Prüfungen in `t_wuerfel.js`, 0 Fehler** (6 neue, 1315 über elf Skripte).
  Darunter, dass der blanke Gedankenstrich aus **allen drei** Wurf-Anzeigen verschwunden ist —
  sonst taucht er beim nächsten Umbau wieder auf.

### 2026-10-15 (Fortsetzung 16) — Jede Figur lässt sich auf die andere Seite ziehen
- **Hendriks Vorgabe:** „Spieler auf den Seiten verschieben — James Harwick etc. sind ja eher
  auf der Seite der Spieler.“
- **Die Seite ist jetzt dieselbe Geste wie die Entfernung:** Eine Figur auf ein Band ziehen
  stellt die Entfernung um, auf **„Deine Seite“** ziehen stellt die **Seite** um. Das gilt für
  **jede** Figur, nicht mehr nur für Gegner — und der ⚓/⚔-Knopf an der Reihenfolge tut jetzt
  dasselbe, für das Tablet und für alle, die lieber klicken.
- **Auch eine Spielerfigur kann auf der anderen Seite stehen.** Bezaubert, besessen,
  übergelaufen — im Finale ist genau das denkbar. **Die Abweichung liegt beim KAMPF, nicht an
  der Figur** (`kampf/seiten/{pid}` und `kampf/baender/{pid}`): Sie ist mit dem Gefecht vorbei
  und **fasst den Bogen des Spielers nicht an.** Dieselbe Linie wie überall sonst — sein Bogen
  bleibt der einzige Schreiber auf seinen Werten.
- **Folge, die mitgezogen werden musste:** Seit auch Spielerfiguren in einem Band stehen
  können, ist die Entfernung der **Abstand zwischen beiden** — also das weiter entfernte der
  zwei Bänder. Vorher zählte das Band des Gegners allein; ein Schütze, der sich zurückzieht,
  wäre damit weiterhin im Nahkampf erreichbar gewesen.
- **Getestet: 317 Prüfungen in `t_regie_wuerfel.js`, 0 Fehler** (1309 über elf Skripte,
  9 neue). Darunter Harwick, der auf die eigene Seite gezogen wird und dabei nach vorn rückt,
  und der Schütze, der zurücksteht: **im Nahkampf nicht mehr erreichbar**, mit dem Abzug des
  weiteren Bandes beschossen.
- **Eine Prüfung von gestern ist umgedreht statt gelöscht:** „ein Spieler lässt sich nicht
  umstellen“ war richtig, bis Hendrik genau das verlangt hat. Jetzt steht dort, dass es geht —
  **und dass dabei kein `figuren/…`-Pfad angefasst wird.**
- **Ein Testfehler, meiner:** Die Prüfung des Rückwegs ließ den **Hinweg nicht wirken** — ohne
  den zurückgespielten Stand stand die Figur noch auf Band 0, und „zurückstellen“ war gar
  keine Änderung. Dieselbe Lehre wie heute Mittag: auf dem prüfen, was der Code wirklich
  schreibt.

### 2026-10-15 (Fortsetzung 15) — Waffen für die Bekannten, Gegner von der Stange, Würfe im Log
- **Drei Vorgaben Hendriks:** den bekannten Leuten Ausrüstung geben · eigene Gegner bauen
  können („stark oder schwach und eine Waffe in die Hand“) · und: „Die Würfelergebnisse stehen
  nicht im Kampflog.“
- **1. Die acht Kernfiguren tragen jetzt etwas** — und zwar **abgeleitet aus ihrer Rolle, die im
  Kanon steht**; die Waffen selbst stehen dort nämlich nirgends (nachgesehen in `besatzung.html`,
  `js/regie.js` und der Bibel):
  - **Wat die Enteraxt** — er führt am Waldrand den Holztrupp und zeigt, wo die Axt ansetzen
    muss (`js/regie.js`). **Dirk die Muskete** — wer Geschütze richtet, trifft auch auf
    Entfernung. **Josiah nur ein Messer** — Kampf 1, das Ding ist Werkzeug. Harwick Säbel und
    Pistole, Cormac zwei Klingen, Francesco etwas Verstecktes, Tom Messer und Wurfmesser.
  - Sie stehen auch **auf der Karte in `besatzung.html`**, mit demselben Klick-Overlay wie
    Talente — eine Ausrüstung, die nur im Kampfmodus auftaucht, ist halb da.
  - **Ein Fehler kam dabei heraus, den die Prüfung gefangen hat:** `nscAlsFigur()` hat `ausr`
    **gar nicht übernommen**. Die frisch vergebenen Waffen lagen damit im Datensatz und kamen
    nirgends an — Wat hätte weiter mit einem Allerweltswürfel zugeschlagen.
- **2. Eigene Gegner: Name, Stufe, Waffe, Anzahl.** Zwei Stufen, und das ist Absicht — der
  Unterschied, den man am Tisch wirklich macht, ist „fällt beim ersten Treffer“ gegen „hält
  etwas aus“:
  - **Schwach** (Parade 5, Robustheit 5, Kämpfen d6, **Statist**) · **Stark** (Parade 6,
    Robustheit 6, Kämpfen d8, **Wild Card**). Die Werte rechnet `parade()`/`robustheit()` aus,
    nichts ist eingetippt.
  - Die Waffe kommt aus der **normalen Ausrüstungsliste** — ein Gegner mit Säbel schlägt mit
    demselben d6 zu wie ein Spieler mit Säbel. Eine Schusswaffe landet im Feld `fernwaffe`, und
    **ohne Schusswaffe schießt niemand**, auch wenn er es könnte.
- **3. Die Würfe des Spielers standen nicht im Log**, und der Grund erklärt den schiefen
  Eindruck: Die Würfe, die das Panel **selbst** wirft (Gegner), schrieb es mit; die des Spielers
  kommen über das **Protokoll** herein — und dort hat sie niemand mitgeschrieben.
  - Neu ist **`kampfPruefeWuerfe()`**, aufgerufen vom Lauscher: Sobald ein Wurf hereinkommt,
    wird er **festgehalten** (an der Ansage, nicht in einer Merkliste im Speicher — die wäre
    nach einem Neuladen weg) und **einmal** ins Log geschrieben.
  - **Das passiert im Lauscher und nicht beim Zeichnen.** Eine Anzeige, die schreibt, schreibt
    bei jedem Neuzeichnen wieder — und das Protokoll ändert sich ständig.
- **Getestet: 308 Prüfungen in `t_regie_wuerfel.js`, 60 in `t_nsc.js`, 0 Fehler** (1300 über elf
  Skripte, 33 neue). Darunter ausdrücklich, dass der Wurf **genau einmal** im Log landet, auch
  wenn dasselbe Protokoll dreimal hereinkommt.
- **Die Prüfung „Art und Kennung passen zusammen“ kannte nur zwei Arten** und schlug bei der
  neuen dritten (`ausr`) an. Sie geht jetzt über ein Verzeichnis statt über ein Entweder-oder —
  die nächste Art bricht sie nicht mehr.

### 2026-10-15 (Fortsetzung 14) — Einen Gegner fragt niemand
- **Hendriks Frage:** „Harwick hat Test getroffen. Wie wird jetzt der Schaden ausgerollt?“
  **Gar nicht** — da war nur das Zahlenfeld. Bei einem Spieler-Angriff fordert das Panel den
  Schaden an; bei einem **Gegner** gab es diesen Weg nicht, und das ist eine echte Lücke:
  **Ein Gegner hat keinen Bogen und wartet auf nichts.**
- **Jetzt steht dort „Schaden würfeln“** statt „anfordern“, samt der Würfel, die geworfen
  werden („d6 + Stärke d8“). Gerechnet wird nach **derselben Regel wie beim Spieler**: Waffe +
  Stärke, bei einer Steigerung +1W6, explodierend, ohne Wild Die — dieselbe Funktion
  (`schadensWuerfel()`), kein zweiter Weg.
- **Dass NSC keine Waffe haben, ist der Grund für eine Vorgabe:** In `js/npcs.js` steht
  Ausrüstung nicht — die Blätter tragen Attribute und Fertigkeiten. Ein angelegter Gegner
  bringt deshalb **Stärke aus seinem Blatt** und **Schaden d6** als Aufschlag mit (Säbel,
  Entermesser, Knüppel — das Gros dieser Kampagne). Beides steht am Gegner und ist damit
  je Figur änderbar, statt im Code festzustehen.
- **Der Wurf steht im Kampflog, aufgeschlüsselt:** „James Harwick würfelt Schaden: 14
  (Waffe d6: 5 + Stärke d8: 6 + Steigerung d6: 3)“. Die Summe landet im Feld, die Wirkung
  darunter — und **gilt erst mit dem Klick**, wie bei allem anderen auch.
- **Getestet: 283 Prüfungen in `t_regie_wuerfel.js`, 0 Fehler** (7 neue, 1288 über elf
  Skripte). Darunter ausdrücklich, dass beim Gegner **„würfeln“ und nicht „anfordern“**
  dasteht, dass alle drei Würfel im Log auftauchen und dass danach die Wirkung zum Bestätigen
  bereitsteht.

### 2026-10-15 (Fortsetzung 13) — Zwei Fehler: ein Feldname zweimal vergeben, eine Feed-Zeile ohne Würfel
- **Hendriks Meldung mit zwei Screenshots:** „Der Wurf wurde angefordert, scheint aber nicht
  übermittelt zu werden.“ Die Ansage blieb auf **„wartet auf den Wurf …“** stehen, obwohl das
  Kampflog daneben schon „Pete trifft James Harwick mit Steigerung — Schadenswurf angefordert“
  meldete. Im Würfel-Feed stand dazu **„SL würfelt 1×dundefined: 6“**.
- **Fehler 1, und er ist meiner von gestern: „band“ hieß in der Ansage ZWEI Dinge.**
  Ursprünglich war es das **Ergebnisband** (`erfolg` / `steigerung`); beim Einbau der drei
  Distanzen habe ich dasselbe Feld für das **Distanzband** (0/1/2) benutzt. Ein Gegner im
  Nahband schrieb damit `band: 0` — und das las die Anzeige als „noch kein Ergebnis“.
  Die Distanz heißt jetzt **`dist`**.
- **Fehler 2 an derselben Stelle, unabhängig und älter: Das Ergebnis des Angriffswurfs wurde
  nie gespeichert.** Es entstand nur **beim Zeichnen** aus dem Protokoll. Sobald die Ansage auf
  „Schaden“ stand, suchte niemand mehr danach — der Treffer war vergessen. `schadenAnfordern()`
  schreibt `band` und `roh` jetzt mit.
- **Fehler 3, der Feed:** Ein angeforderter Schadenswurf hat ein `probe`, aber **kein `band`** —
  damit fiel er in den Zweig für **freie Würfel**, und der erwartet `count` und `sides`. Er ist
  aber weder Probe noch freier Würfel und hat jetzt seine eigene Zeile:
  **„SL — Schaden: 11 (6 + 5)“**.
- **Der eigentliche Befund ist aber, dass die Prüfungen das NICHT gefunden haben** — 266 Stück,
  alle grün, während der Modus am Tisch stehen blieb. Der Grund ist lehrreich: **Sie haben die
  Ansage von Hand gebaut** (`band: 'steigerung'`), statt die zu nehmen, die der Code schreibt
  (`band: 0`). Eine Prüfung, die ihre Eingabe selbst erfindet, prüft die Erfindung.
  - Neu ist deshalb eine **Kette über den ganzen Ablauf, ausschließlich auf dem, was der Code
    selbst erzeugt und in die Datenbank schreibt**: ansagen → die geschriebene Ansage
    übernehmen → Wurf aus dem Protokoll → Schaden anfordern → **so zurückspielen, wie Firebase
    es täte** → die Anzeige muss den Treffer zeigen, nicht „wartet“.
  - **Gegengeprüft:** Mit dem alten Code schlagen fünf dieser Prüfungen an, und die Anzeige
    steht im Fehlertext **wortwörtlich so da, wie Hendrik sie gesehen hat.**
  - Ebenso beim Feed: Die Zeile wird aus `js/dice.js` **geschnitten und ausgeführt**; ohne den
    Fix liefert sie **„SL würfelt 1×dundefined: 11 (6, 5)“** — genau der Screenshot.
- **Getestet: 276 Prüfungen in `t_regie_wuerfel.js`, 98 in `t_wuerfel.js`, 0 Fehler** (1281 über
  elf Skripte, 15 neue).

### 2026-10-15 (Fortsetzung 12) — Die Aufstellung: ziehen schlägt, klicken schießt
- **Hendriks Wunsch:** „Eine visuelle Kampfmöglichkeit, in der beide Parteien sich
  gegenüberstehen — ich ziehe den Spieler auf sein Ziel für einen Nahkampfangriff, und mit
  Klick wird ein Fernkampfangriff ausgeführt, wenn möglich.“ Dazu seine Lösung für die
  Entfernung: „Gegner stehen einfach immer in 3 Distanzen zueinander.“
- **Das ist NICHT die Arena, und der Unterschied ist der Punkt.** Die Arena ist ein Brett:
  16×16 Felder, Bewegung, Reichweiten in Feldern, eigener W100-Kern. Hier gibt es **keine
  Felder und keine Bewegung** — zwei Seiten, drei Bänder, und die **Geste ist die Ansage**.
  Eine Aufstellung, kein Schlachtfeld.
- **Und es wirft nichts weg:** Regelkern, Kampfstand, Bitte an den Spieler, Protokoll-Aufgreifen
  und Log bleiben unverändert. Ersetzt wurden **die zwei Auswahlfelder** — die daneben stehen
  bleiben, als Rückfall und weil Ziehen auf einem Tablet fummelig ist.
- **Drei Distanzen statt einer Rückfrage je Schuss** (`FERN_BAENDER` in `js/kampf.js`):
  **Nah 0 · Mittel −2 · Fern −4**. Wo ein Gegner **steht**, ist die Entfernung — damit schreibt
  die Aufstellung die Regel, statt sie zu erfragen.
  - **Nahkampf geht nur im ersten Band.** Das ist keine Willkür, sondern dieselbe Regel: Wer
    nicht angrenzt, kann nicht zuschlagen. Der Versuch wird abgelehnt und **sagt, warum**.
  - Einen Gegner auf ein anderes Band zu ziehen stellt ihn um — die einzige „Bewegung“, die es
    hier gibt, und ohne Brett braucht es auch nicht mehr.
  - Neue Gegner stehen im **Nahband**: In dieser Kampagne fängt fast jeder Kampf als Enterkampf
    an, und wer Abstand will, zieht sie zurück.
- **„Wenn möglich" ist ausbuchstabiert.** Ein Klick schießt nur, wenn der Angreifer eine
  Fernkampfwaffe trägt **und Pulver dafür hat** — das ist die Munitionsregel aus Bibel 4.5, die
  bisher nur im Bogen stand. Geht es nicht, steht da **warum** („trägt keine Schusswaffe“,
  „hat kein Pulver mehr“) statt eines Klicks, der nichts tut. Bei NSC entscheidet ihr
  Schießen-Wert; **Ladungen zählt bei ihnen niemand** — das erzählt die Spielleitung.
- **Verbündete ohne dritten Typ.** Jeder angelegte NSC ist zunächst Feind und lässt sich per
  Knopf auf die eigene Seite stellen. Damit können Cormac und Wat im Finale mitkämpfen, ohne
  Spielerfiguren zu sein — und ein Angriff auf die **eigene** Seite wird abgelehnt.
- **Getestet: 266 Prüfungen in `t_regie_wuerfel.js`, 0 Fehler** (1266 über elf Skripte,
  24 neue). Geprüft werden die **Funktionen hinter den Gesten**, nicht die Geste selbst:
  Ziehen sagt den richtigen Angriff an, auf Entfernung wird er **abgelehnt mit Begründung**,
  ohne Schusswaffe und ohne Pulver wird **nicht** geschossen, mit Pulver schon — und dann mit
  dem **Abzug des Bandes**. Dazu: Ein Spieler lässt sich nicht umstellen, und auf die eigene
  Seite wird nicht eingeschlagen.
- **Ehrlicher Vorbehalt:** Ob sich das **Ziehen** am Tisch gut anfühlt, kann keine dieser
  Prüfungen sagen — das sieht nur Hendrik im Browser. Deshalb bewusst klein gehalten: erst die
  beiden Gesten, dann schauen, was fehlt.

### 2026-10-15 (Fortsetzung 11) — Die Bitte sagt, worum es geht; der Schaden kommt von selbst
- **Drei Nachträge Hendriks nach dem ersten Blick auf den Kampfmodus:** In der Bitte soll
  stehen, **wer wen angreift**; bei einem Treffer soll die **Aufforderung zum Schadenswurf**
  von selbst kommen; und er braucht ein **Kampflog**.
- **1. Der Grund steht jetzt IN der Bitte.** „Kämpfen — nötig 4“ sagt nicht, worum es geht, und
  am Tisch wird genau danach gefragt. Die Würfelleiste zeigt darüber **„Angriff auf Anselm
  Frei 1“**. Das Feld `grund` wurde schon seit gestern geschrieben — **angezeigt hat es
  niemand.**
- **2. Der Schadenswurf wird angefordert, nicht abgetippt.** Neue Art von Bitte:
  `{ art:'schaden', wuerfel:[…], grund }`. Der Bogen würfelt sie als das, was sie ist —
  **kein Zielwert, kein Wild Die, und die Wunden ziehen nichts ab**: Der Säbel wird nicht
  stumpfer, weil man blutet.
  - Welche Würfel, entscheidet das Blatt: **beste getragene Nahkampfwaffe + Stärke**, bei einer
    Steigerung **+1W6**. Wer nichts trägt, schlägt mit der Faust.
  - **Ein angeforderter Schadenswurf steht im PROTOKOLL**, ein freier Würfel nicht. Das ist
    eine bewusste Änderung an der Regel von gestern („nur Wertproben“): Er ist die **Antwort
    auf eine Bitte** und gehört zum Abend — und **nur so findet der Kampfmodus ihn wieder**.
    Die Zahl erscheint dann von selbst in der Ansage, das Feld zum Abtippen bleibt für alles,
    was am Tisch laut vorgelesen wird.
- **3. Das Kampflog.** Unter der Reihenfolge, **neueste Zeile oben**, mit der Runde an jeder:
  wer auftritt, welche Runde beginnt (samt Joker-Hinweis), wer wen angreift und mit welchem
  Ergebnis, wie viel Schaden gegen welche Robustheit und was daraus folgte.
  - **Es liegt beim Kampfstand und verschwindet mit ihm.** Ein Gefecht ist zu Ende, wenn es zu
    Ende ist. **Was den Abend überdauern soll, steht ohnehin im Protokoll** — dort landet jeder
    Wurf samt Szene, Ort und Kommentar. Zwei Gedächtnisse für dieselbe Sache wären eins zu
    viel; dieses hier ist das kurze für den laufenden Kampf.
  - Ein leeres Log zeigt **gar nichts** — eine leere Überschrift wäre Zierde.
- **Getestet: 242 Prüfungen in `t_regie_wuerfel.js`, 0 Fehler** (1242 über elf Skripte,
  18 neue). Darunter: die Schadensbitte trägt **drei** Würfel (Waffe, Stärke, Steigerung), die
  Ansage merkt sich, dass sie wartet, der Wurf wird aus dem Protokoll aufgegriffen **ohne dass
  jemand tippt**, und das Leeren räumt **genau** das Log weg.
- **Sechs Prüfungen brachen beim Einbau des Logs** — alle mit derselben Ursache und keine ein
  echter Fehler: Sie zählen Schreibzugriffe, und das Log schreibt mit. Sie trennen den
  Log-Eintrag jetzt ab, statt ihn mitzuzählen — **und prüfen ihn gleich mit.**

### 2026-10-15 (Fortsetzung 10) — Der Kampfmodus steht
- **Vierte Ansicht in `regie_figuren.html`:** Figuren · Würfe · Gegenstände · **Kampf**. Die
  Spieler bekommen **nichts Neues zu sehen** — nur die Bitte in ihrer Würfelleiste, die es seit
  dem 14.10. gibt. Damit kommt keine neue Spieler-Oberfläche dazu und nichts kann bei ihnen
  kaputtgehen.
- **Der Ablauf, wie Hendrik ihn beschrieben hat:**
  1. **Gegner anlegen** aus den Blättern in `js/npcs.js` — Vorlage wählen, Anzahl, fertig
     („Anselm Frei 1–3“). Parade, Robustheit und Kämpfen kommen **aus dem Blatt**, hier wird
     nichts erfunden.
  2. **Karten austeilen.** Neue Reihenfolge je Runde, Joker inbegriffen. **Wer außer Gefecht
     ist, bekommt keine Karte** — sonst wartet der Tisch auf einen Bewusstlosen.
  3. **„Angreifer → Ziel → Angriff ansagen."** Der Spieler bekommt die Bitte mit dem
     **Modifikator aus der Parade des Ziels** und dem Satz, worum es geht („Angriff auf Anselm
     Frei 1“). Ein **Gegner** würfelt sofort, der wartet auf niemanden.
  4. **Der Wurf kommt über das Protokoll zurück** — dort steht er ohnehin mit Figur, Wert und
     Band. Die Ansage liest ihn als **Treffer / Treffer mit Steigerung / Daneben**.
  5. **Schaden eintragen**, die Wirkung steht als **Vorschlag** da — und **erst ein Klick auf
     „gilt" trägt sie ein.**
- **Drei Regeln bestimmen den Zuschnitt, und sie stehen so im Code:**
  1. **Das Werkzeug rechnet, die Spielleitung entscheidet.** Nichts wird von selbst eingetragen.
     Dieselbe Linie wie in `ARENA-ENDKAMPF.md`.
  2. **Gegner gehören uns, Spieler nicht.** Der Gegnerzustand liegt unter
     `sitzungen/{sid}/stand/kampf`. Eine Wunde beim **Spieler** geht über das **Postfach** —
     sein Bogen ist der einzige Schreiber auf seiner Figur, ein direkter Zugriff wäre beim
     nächsten Klick lautlos weg. `zuteilungAnnehmen()` kennt dafür jetzt `wunde` und
     `angeschlagen`; der Spieler sieht „Von der Spielleitung · eine Wunde“.
  3. **Der Kampfstand liegt in der Datenbank**, nicht nur im Browser der Spielleitung: Ein
     versehentliches Neuladen mitten im Gefecht wäre sonst das Gefecht.
- **Die Arena bleibt draußen** (Hendriks ausdrückliche Vorgabe). Kein Brett, keine Bewegung,
  keine Felder — sie bleibt das Werkzeug für den Endkampf und rechnet weiter nach W100.
- **Getestet: 224 Prüfungen in `t_regie_wuerfel.js`, 0 Fehler** (1218 über elf Skripte, 66
  neue). Der **ganze Ablauf wird ausgeführt**: Gegner anlegen → austeilen → ansagen → Wurf aus
  dem Protokoll → Wirkung → „gilt". Darunter die drei, auf die es ankommt:
  - **Ein fremder und ein ALTER Wurf beantworten die Ansage nicht** — sonst beantwortet ein
    Wurf von vorhin die Frage von jetzt.
  - **Vor dem Klick auf „gilt" wird nachweislich NICHTS geschrieben.**
  - **Kein Schreibzugriff fasst einen Wert einer Spielerfigur an** — die Regel von gestern,
    unverändert gültig, jetzt mit einer vierten erlaubten Stelle.
- **Ein echter Fund an der eigenen Prüfumgebung:** Die gefälschte Datenbank **verschluckte den
  Pfad des refs** — ein `update()` unter `db.ref('kampf')` wurde als `gegner/x` aufgezeichnet
  statt als `kampf/gegner/x`. Firebase macht es andersherum, und **genau diese Pfade prüft die
  Regel „kein Zugriff auf einen Wert der Figur“**. Der Stub war damit zu nachsichtig; jetzt
  präfixiert er wie das Original.
- **Zwei eigene Fehler, beide von den Prüfungen gefangen:** Ein Feldname, den es nicht gab
  (`kaempfenStufe` statt `kaempfen`), und meine Erwartung „sieben Karten“, wo es **sechs** sein
  müssen — Cord liegt mit vier Wunden außer Gefecht. Der Code hatte recht, die Erwartung nicht.
- **[OFFEN] Bedrängnis** (mehrere Gegner an einem Ziel) rechnet noch niemand mit — bewusst
  zurückgestellt, bis der Modus einmal am Tisch lief. Ebenso der **Schadenswurf des Spielers**:
  Er würfelt ihn als freien Würfel, und die Spielleitung trägt die Zahl ein. Automatisch
  aufgreifen ginge — freie Würfel stehen aber bewusst **nicht** im Protokoll, und aus dem Feed
  den richtigen herauszufischen wäre Raten.

### 2026-10-15 (Fortsetzung 9) — Der Regel-Kern des Kampfmodus
- **Hendriks Entscheidung:** Kampf als **eigener Modus** in `regie_figuren.html`, den **nur die
  Spielleitung sieht**. Gegner anlegen, „Spieler A greift Gegner 3 an“ sagen, der Spieler wird
  zum Würfeln aufgefordert. **Initiative mit Karten** („A passt“). Die **Arena bleibt
  ausdrücklich draußen.**
- **Gebaut ist zuerst der Regel-Kern, nicht die Oberfläche:** neue **`js/kampf.js`** — ohne
  DOM, ohne Firebase, ohne globalen Zustand, wie `js/termine.js`. **Aus demselben Grund:** Zwei
  Fassungen derselben Rechnung laufen auseinander, und hier wäre der Preis, dass die Regie
  etwas anderes ausrechnet, als die Probe des Spielers ergibt.
- **Drin ist, was gerechnet werden muss:**
  - **Das Aktionsdeck.** 54 Karten, Ass abwärts, bei Gleichstand Pik · Herz · Karo · Kreuz.
    Der **Joker** steht über dem Ass, gibt **+2 auf jede Probe und auf den Schaden** und
    verlangt danach neues Mischen. Das Deck wird **weitergereicht**, nicht je Runde neu
    gemischt — und mischt von selbst nach, wenn es leer läuft.
  - **`angriffsMod(parade)`** — der Zielwert ist die **Parade des Ziels**, unser System rechnet
    gegen 4, also wird die Differenz zum Modifikator. **Damit ist der tägliche Schmerz weg:**
    Gegen Parade 5 sind es **−1**, und das ließ sich mit den Knöpfen (+2/0/−2/−4) gar nicht
    einstellen.
  - **`fernkampfMod()`** — 0 / −2 / −4 nach Distanzband. Unsere Waffen tragen **eine**
    Reichweitenzahl: Sie ist das kurze Band, das Doppelte das mittlere, das Vierfache das
    lange. Darüber hinaus **kein Schuss**.
  - **`wirkung(schaden, robustheit, zustand)`** — darunter nichts, gleich oder darüber
    angeschlagen, je volle 4 darüber eine Wunde. Dazu die Regel, die den Kampf trägt: **Wer
    schon angeschlagen ist, nimmt statt des zweiten Hakens eine Wunde.**
  - **`schadensWuerfel()`** — welche Würfel ein Schadenswurf wirft und warum.
- **Die drei offenen Regelentscheidungen stehen als Schalter an EINER Stelle** (`KAMPF_REGELN`),
  nicht verstreut im Code: `schadenMitStaerke` · `bonusWuerfelBeiSteigerung` · `wundenStatist` /
  `wundenWildCard`. **Vorgabe ist jeweils die Originalregel** — eine Abweichung ist damit eine
  Zeile und kein Umbau, und **beide Stellungen werden geprüft**, damit eine Hausregel nicht
  irgendwann ins Leere greift.
- **Getestet: neues `tests/t_kampf.js`, 58 Prüfungen, 0 Fehler** (1152 über elf Skripte).
  Geprüft wird **gegen die Regel, nicht gegen den Code** — darunter das Beispiel aus dem
  Regelwerk selbst (Robustheit 5, erst 7 Schaden, dann 13), die Farbreihenfolge, das
  nachmischende Deck und ein Angriff auf **Anselm Frei** aus der echten Testsitzung.
- **Zwei eigene Fehler, beide von den eigenen Prüfungen gefangen:**
  1. **„Statisten haben eine Wunde“ heißt, dass sie gar keine TRAGEN** — die erste nimmt sie
     raus. Ich hatte `wundenStatist: 1` als Tragfähigkeit gelesen, womit ein Matrose eine Wunde
     überstanden hätte. Der Schalter nennt jetzt die **Tragfähigkeit** (Statist **0**, Wild Card
     3), und die Null steht mit genau dieser Begründung im Kommentar.
  2. Die Wertetabelle heißt `w`, gesucht wurde nach `wert` — das Ass hieß deshalb **„14♠“**.
- **[OFFEN] Die Oberfläche.** Gegnerliste, Ansage „A greift 3 an“, Rückmeldung Treffer/Wirkung,
  Zustand der Gegner unter `sitzungen/{sid}/stand/kampf`. Dazu zwei Dinge, die vorher
  entschieden sein müssen: ob die **Wunden der Spieler** über das Postfach laufen (der Bogen
  ist der einzige Schreiber auf einer Figur) und ob **Bedrängnis** mitgerechnet wird.

### 2026-10-15 (Fortsetzung 8) — Alle Gegenstände, durchsuchbar
- **Hendriks Vorgabe:** eine Liste mit allen Items und Textsuche — „vollumfänglich,
  Buchstabenfolge muss im Wort vorkommen“.
- **Dritte Ansicht „Gegenstände“** in `regie_figuren.html`, neben Figuren und Würfen. Alle
  **53** Waren (plus die erfundenen), **nach Warenart gruppiert** — 53 Stück am Stück liest
  niemand — je mit Schaden, Reichweite, Schuss, Robustheit, Gewicht, Preis und Beschreibung.
- **Die Suche ist ausdrücklich keine Wortanfangs-Suche:** `indexOf` auf der ganzen Zeichenkette.
  „**ulver**“ findet das Pulverhorn, „**aebel**“ den Säbel.
  - **Gesucht wird über alles, was an der Ware steht:** Name, Beschreibung, Art **und Kennung**.
    Das Letzte ist kein Zufall — die erfundenen Waren tragen das Präfix `sl_`, also findet
    „**sl_**“ sie alle auf einmal.
  - **Umlaute werden vereinheitlicht** (ä→ae, ö→oe, ü→ue, ß→ss), in beide Richtungen: Wer
    „saebel“ tippt, meint den Säbel, und wer „büchse“ tippt, findet sie auch. Ohne das
    fände eine deutsche Suche die halbe Liste nicht.
  - **Die Fundstelle wird markiert**, sonst sucht man im Treffer noch einmal mit den Augen.
    Markiert wird auf der **normalisierten** Fassung, ausgegeben das **Original** — beide sind
    gleich lang, also passen die Stellen.
- **Aus der Liste heraus vergeben:** oben ein Feld „Übergeben an“, danach hat jede Zeile einen
  **geben**-Knopf. Suchen, finden, geben — ohne vorher zu wissen, in welcher Warenart der
  Gegenstand steckt. Ohne gewählte Figur erscheint der Knopf gar nicht erst.
  - Dazu **`gutMeldung()`**: `warnung()` färbt rot und ist für Fehler da — eine gelungene
    Übergabe ist keine Warnung, braucht aber eine Rückmeldung, sonst klickt man und nichts
    geschieht sichtbar.
- **Der Kopf wird einmal gezeichnet, die Liste danach für sich** (`warenListeZeichnen()` füllt
  nur `#warenListe`). Hängte die Suche am allgemeinen `render()`, verlöre das Feld **bei jedem
  Tastendruck den Fokus**.
- **Getestet: 188 Prüfungen in `t_regie_wuerfel.js`, 0 Fehler** (32 neue, 1110 über zehn
  Skripte). Die Ansicht wird **wirklich gezeichnet und wirklich durchsucht**, nicht nur die
  Suchfunktion aufgerufen: Liste filtert, Zähler stimmt, leere Fächer fallen weg, ohne Treffer
  steht da warum, spitze Klammern bleiben maskiert, und die Übergabe landet im Postfach.
- **Eine Prüfung war falsch, nicht der Code:** Ich suchte im Treffer nach „Pulverhorn“ — dort
  steht aber **`P<mark>ulver</mark>horn`**, weil die Fundstelle markiert wird. Die Liste war die
  ganze Zeit richtig. **Erst die Diagnose, dann das Urteil:** Ich habe die Fehlermeldung um den
  tatsächlichen Inhalt erweitert, statt am Code zu drehen.

### 2026-10-15 (Fortsetzung 7) — Die Ausrüstung sagt, was sie tut
- **Hendriks Frage:** „Kann ich irgendwie die Ausrüstung der Spieler sehen? Also auch was
  Items machen — Angriff/Schaden etc.“
- **Sehen konnte er sie, verstehen nicht.** In `regie_figuren.html` stand je Gegenstand der
  **Name plus eine nackte Zahl** („Säbel d6“), und der Mauszeiger sagte nur „anklicken, um
  ihn einzuziehen“. **Nicht zu sehen waren:** Reichweite, Schusszahl, Gewicht, Wert, die
  Beschreibung — und, am wichtigsten im Kampf, **Traglast und Ladungen**, die auf dieser Seite
  überhaupt nicht vorkamen. Ein Schütze ohne Pulver sah aus wie jeder andere.
- **Jetzt:**
  - **Kurzwerte am Chip:** `Säbel d6` · `Steinschlosspistole d6 · Reichw. 5 · 1 Schuss` ·
    `Lederwams +1`.
  - **Eine Zeile darüber:** „Gewicht **8** von 12 · Ladungen **0** — kann nicht schießen.“
    Die Ladungszeile erscheint nur bei einer Figur, die überhaupt eine Schusswaffe trägt.
  - **Klick öffnet die ganze Erklärung** — dieselbe Mechanik wie im Spielerbogen, dritte Art
    `ausr` in `js/marken.js`. Sie nennt Schaden, Reichweite, Schuss, Robustheit, Gewicht, Wert
    und die Beschreibung, dazu den Satz, der am Tisch wirklich zählt: **Der Schadenswürfel ist
    ein eigener Würfel, es wird nichts dazugezählt** (Bibel 4.1).
- **Damit ist meine Festlegung vom 14.10. zurückgenommen**, und zwar ausdrücklich: Dort stand
  „bewusst NICHT in `regie_figuren.html`, ein Overlay stünde beim Durchsehen mehrerer Figuren
  ständig im Weg“. **Die Begründung trägt nicht** — das Overlay öffnet auf **Klick**, nicht
  beim Hovern, steht also nur im Weg, wenn man es ruft. Talente und Schwächen laufen jetzt
  ebenfalls darüber; der native `title`, der dort stand, kommt erst nach einer Sekunde und
  bricht lange Texte schlecht um.
- **Einziehen geht jetzt über ein Kreuz am Chip und fragt nach.** Vorher löste **jeder** Klick
  auf den Chip das Einziehen aus — ein Fehlgriff kostete der Figur ihre Waffe, ohne Rückfrage.
  Seit der Chip selbst die Erklärung öffnet, wäre das erst recht falsch.
- **Ein Gegenstand, den es nicht mehr gibt, wird GENANNT statt verschluckt** („`sl_xyz`
  unbekannt“). Vorher verschwand er stillschweigend — die Figur trug etwas, das niemand sah.
  Betrifft genau den Fall, dass die Spielleitung eine erfundene Ware löscht.
- **Nebenbei im Spielerbogen:** Die Liste nennt jetzt auch die **Schusszahl**. Dass eine Waffe
  nach einem Schuss leer ist, ist die Regel (Bibel 4.5) und stand dort nicht.
- **Getestet: 170 Prüfungen in `t_bogen.js`, 156 in `t_regie_wuerfel.js`, 0 Fehler** (1078 über
  zehn Skripte, 16 neue). Die Seite wird dabei **wirklich gerendert**, mit einer Figur, die
  Säbel, Pistole und Lederwams trägt — **und null Ladungen hat**, weil das am Tisch der
  häufigere Fall ist, als man denkt.
- **Zwei eigene Fehler, beide von den eigenen Prüfungen gefunden:**
  1. **„d6 · 5 · 1 Schuss“** — die blanke 5 war die Reichweite und zwischen den beiden anderen
     Angaben **nicht zu deuten**. Jetzt „Reichw. 5“.
  2. **Der Marken-Vertrag stand an zwei Stellen**, weil ich den Gegenstands-Chip von Hand
     gebaut hatte statt durch den gemeinsamen Bauer. Genau das sollte die Prüfung
     „Vertrag an genau einer Stelle“ verhindern — und sie hat angeschlagen. `markeChip()`
     nimmt jetzt einen Zusatz entgegen, alle drei Arten laufen durch ihn.
  - Dazu vier Prüfungen mit **veralteten Erwartungen** (eine vierte Figur in der Vorlage
    ändert Zähler und Gruppengröße) und zwei, in denen ich die Werte des Säbels schlicht falsch
    erinnert hatte — d6, nicht d8. **Nachgesehen statt geraten**, dann korrigiert.

### 2026-10-15 (Fortsetzung 6) — Die Spielleitung erfindet Gegenstände
- **Hendriks Vorgabe:** „Eine Möglichkeit, dass ich als SL eventuell auch Items erstellen kann
  und diese einem Charakter zuweise.“
- **Die Lücke war echt:** Übergeben konnte die Spielleitung seit dem 14.10. — aber nur, was
  `js/regelwerk.js` kennt. Der **Jaguar-Säbel**, ein Brief, die Kiste aus der Grotte: alles,
  was das Abenteuer selbst hervorbringt, musste der Spieler sich bisher selbst eintippen.
- **Erfundene Waren können nicht im Code stehen** — das ist Code, und am Tisch schreibt
  niemand welchen. Sie liegen deshalb **je Sitzung in der Datenbank**
  (`sitzungen/{sid}/stand/eigeneWaren`) und werden beim Laden ins Regelwerk **nachgetragen**.
  - **Danach sind sie ganz normale Ware:** Traglast, Robustheit und Verkauf rechnen **ohne
    Sonderweg** mit ihnen, weil alles über `AUSR_BY_ID` läuft. Das ist der Grund für diesen
    Weg — die Alternative wäre gewesen, den Gegenstand in die Figur zu schreiben, und dann
    hätte **jede** Funktion, die Ausrüstung anfasst, zwei Fälle gekannt.
  - **Kein neuer Top-Level-Pfad, keine Regeländerung:** `sitzungen` ist längst beschreibbar.
- **Zwei Regeln, die nicht verhandelbar sind** (stehen so im Code):
  1. **Eine erfundene Ware überschreibt NIE eine aus dem Regelwerk.** Sonst könnte eine
     Sitzung den Säbel umdefinieren, und niemand fände den Grund. Die Kennung trägt dafür
     das Präfix **`sl_`** — daran erkennt auch jeder Leser, woher sie stammt.
  2. **Eine Figur trägt weiterhin nur IDs.** Ein Gegenstand, dessen Beschreibung nicht geladen
     ist, verschwindet in der Anzeige **stillschweigend** (überall steht `if (a)`). Deshalb
     tragen **alle drei** Seiten die Waren ein, **bevor** sie zeichnen — auch `karte.html`,
     denn die Traglast geht dort in den Würfelabzug ein. Ohne das wäre eine Figur auf der
     Karte leichter als in ihrem Bogen.
- **Die Werkstatt in `regie_figuren.html`:** Knopf **„+ Gegenstand“** in der Kopfleiste, darunter
  ein Formular (Name, Art, Schaden als **Würfelstufe**, Robustheit, Gewicht, Wert,
  Beschreibung) und die Liste des schon Erfundenen zum Löschen.
  - **Anlegen und Übergeben sind zwei Schritte, und das ist Absicht:** Die **Beschreibung**
    gehört der Sitzung, die **Übergabe** der Figur. Derselbe Gegenstand lässt sich mehreren
    geben — vier Dolche für vier Spieler sind ein Eintrag, nicht vier.
  - In der Übergabe-Auswahl steht das Erfundene **ganz oben**: Wer es gerade angelegt hat,
    will es jetzt vergeben und nicht erst durch sechs Warenarten scrollen.
  - **Löschen fragt nach und sagt, wer ihn trägt.** Die Figur behält die ID; der Gegenstand
    verschwindet dort nur aus der Anzeige. Das ist der Preis dafür, dass Waren nicht in jeder
    Figur doppelt liegen — also wird es gesagt statt verschwiegen.
- **Getestet: 168 Prüfungen in `t_bogen.js`, 141 in `t_regie_wuerfel.js`, 0 Fehler** (1062 über
  zehn Skripte, 42 neue).
  - **Der ganze Weg wird ausgeführt**, nicht gelesen: Formular ausfüllen → anlegen → die Ware
    kommt über den Lauscher zurück → sie steht in der Auswahl → übergeben → löschen. Dazu,
    dass sie **wirklich wiegt** und die **Robustheit hebt**.
  - **Die Regel über die Schreibziele ist erweitert, nicht aufgeweicht:** Jetzt sind es vier,
    das neue liegt **gar nicht bei einer Figur**, sondern bei der Sitzung. Die Prüfung „kein
    Schreibzugriff fasst einen WERT der Figur an“ steht unverändert.
- **Ein echter Fehler, gefunden von der eigenen Prüfung:** `ruest: -4` ist in JavaScript
  **truthy** — der Wert wurde also auf das **Minimum 1** geklemmt, und aus einer unsinnigen
  Angabe wurde eine Rüstung. Geklemmt wird jetzt **ab null** und erst danach gesetzt: Eine
  negative Angabe heißt „keine Rüstung“, nicht „die kleinste“.
- **Zwei vm-Fallen, beide bekannt, beide wieder getreten:** `const AUSR_BY_ID` im vm ist von
  außen **nicht** als Kontext-Eigenschaft sichtbar (die Prüfung fragt jetzt die Seite selbst),
  und die Erfolgsmeldung hängt am Firebase-Versprechen — sie steht erst, wenn der synchrone
  Lauf durch ist. Diese beiden Prüfungen laufen deshalb am Ende in einem `.then`.

### 2026-10-15 (Fortsetzung 5) — Der Einkaufs-Hinweis im Bogen ist weg
- **Hendriks Vorgabe:** „Der Hinweis zum Einkaufen im Charakterblatt unter Ausrüstung soll
  bitte weg.“ Ersatzlos entfernt.
- **Und er hat recht:** Wer am Markt steht, sieht den Laden dort. Ein Schild im
  Charakterfenster, das auf einen Ort zeigt, an dem man gerade ohnehin ist, sagt niemandem
  etwas — und wer nicht dort steht, kann damit erst recht nichts anfangen.
- **Mitgegangen ist alles, was NUR dieser Hinweis gebraucht hat** — sonst bliebe toter Code
  stehen, den später jemand für gültig hält (dieselbe Regel wie am 14.10. beim Katalog):
  - **Die zehn Szenendateien.** Der Bogen hat sie **allein dafür** geladen, um zu wissen, wo
    die Gruppe steht — **rund 64 KB reine Daten bei jedem Öffnen**, auf der Karte zusätzlich
    zu denen, die dort ohnehin liegen. Das ist der eigentliche Gewinn dieser Streichung.
  - Der Lauscher auf `currentScene`, die Zustände `aktuelleSzene`/`szeneGehoert`, die
    Funktionen `alleSzenen()`, `laedenDerSzene()`, `ladenName()` und die Stilregeln `.ladenzu`.
  - **Der Bogen hört damit überhaupt nicht mehr auf den Spielstand.** Er kennt nur noch seine
    eigene Figur — das ist die ehrlichere Abgrenzung.
- **Die Laden-Prüfungen bleiben, sie lesen jetzt nur woanders.** `tests/t_bogen.js` lieh sich
  bisher zwei Helfer aus `heldenbrief.html`; es liest die Szenendateien jetzt direkt.
  **Richtig so:** Der Laden gehört den Szenendaten, nicht einer Seite, die ihn zufällig
  anzeigt. Alle Prüfungen von gestern gelten unverändert weiter (jede Ware gibt es wirklich,
  kein Fach ist leer, keine Dublette, Schusswaffen nur bei den Schmugglern).
- **Die Prüfung ist umgedreht statt gelöscht:** Wo „der Bogen sagt, wo gekauft wird“ stand,
  steht jetzt, dass er es **nicht** mehr tut — und dazu, dass er die Szenendateien nicht mehr
  lädt und die Szene nicht mehr kennt. Wer das zurücknimmt, soll darüber stolpern.
- **Getestet: 149 Prüfungen in `t_bogen.js`, 0 Fehler** (1013 über zehn Skripte).
- **Wieder in die Heredoc-Falle getappt**, und diesmal in genau der dokumentierten Form: Ein
  `
` im Suchtext kam als echter Zeilenumbruch in der Python-Datei an, das `assert` fand
  nichts und brach ab. Beim zweiten Anlauf den vermerkten Weg genommen (`chr(92)`).

### 2026-10-15 (Fortsetzung 4) — Markup ohne Stil, und ein Kauf, der schwieg
- **Hendriks Screenshot** zeigte drei Dinge auf einmal im Heldenbrief, dazu eine Vorgabe:
  „Das ist noch buggy — und beim Kaufen sollte es ein Feedback geben, dass dieser Gegenstand
  gekauft wurde.“
- **1. „[object Object] · [object Object]“.** Das Feld `laden` am Marker ist seit dem
  14.10.2026 ein **Objekt** (`{ name, was, gruppen }`), der Bogen las es noch als Namen.
  - **Behoben in der ANZEIGE, nicht in der Funktion.** Mein erster Anlauf ließ
    `laedenDerSzene()` Namen zurückgeben — und brach damit die Prüfungen, die daraus das
    Sortiment lesen. **Der Test hatte recht:** Die Funktion liefert den *Laden*, nicht seinen
    Namen. Jetzt gibt es ein `ladenName(l)` daneben, das beide Schreibweisen verträgt.
- **2. Drei Blöcke liefen als nackter Fließtext ineinander** („Ladungen0−+Du trägst keine
  Schusswaffe“). **Ursache: Markup ohne Stil.** Die Klassen `.lad`, `.ladenzu` und
  `#uebergabe` standen im HTML — **im Stylesheet gab es sie nie.** Die Übergabe-Meldung der
  Spielleitung hängte deshalb unformatiert unter der Seite statt als Einblendung darüber.
  - **Das ist eine eigene Fehlerklasse:** Ungültiges CSS ist ein Fehler, **fehlendes CSS ist
    nur unsichtbar.** Nichts im Projekt hat je in diese Richtung geschaut.
  - **Neue Prüfung in `tests/t_syntax.js`, und sie gilt für JEDE Seite:** Zu jeder benutzten
    Klasse muss das Stylesheet eine Regel haben. **15 von 15 Seiten sauber** — nach vier
    weiteren Funden, die dabei herausfielen: `.btn-sm` im Heldenbrief (der Bennie-Knopf sollte
    kleiner sein und war es nie), **`class="btn"` am neuen Lösen-Knopf des Regie-Hubs** (dort
    heißt die Klasse `klein` — mein eigener Fehler von vorhin), sowie `.nsc-werte` und
    `.fehlt` in `besatzung.html`.
  - Die Klasse `sitzLink` von vorhin ist **ersatzlos weg**: Sie war nur ein Haken zum Finden,
    und `[data-ziel]` sagt dasselbe, ohne eine Klasse ohne Stil zu hinterlassen.
- **3. Beim Kaufen passierte sichtbar nichts** — und das lag in der Natur der Sache: Der Klick
  legt die Ware ins **Postfach**, verbucht wird sie im **Bogen**, und der steht zugeklappt
  hinter der Karte. Ein zu teurer Klick tat sogar **buchstäblich gar nichts** (`return` ohne
  Meldung).
  - **Jetzt drei Zustände im Laden selbst**, wo gerade geklickt wurde:
    „*Säbel — wird verbucht …*“ → „**Gekauft: Säbel (−250 M.)**“ → oder, nach 8 Sekunden,
    „Säbel wurde nicht verbucht. Schlag deinen Heldenbrief auf.“ Zu teuer sagt jetzt, woran es
    liegt, mit beiden Zahlen.
  - **Der mittlere Zustand ist der ehrliche:** „wird verbucht“ ist genau das, was in dem Moment
    stimmt. **Gemeldet wird der Erfolg erst, wenn die Ware wirklich in der Figur steht** — und
    zwar über die **Stückzahl des Gegenstands**, nicht über den Geldstand: Eine Übergabe der
    Spielleitung kann im selben Moment ebenfalls Münzen bewegen.
- **Getestet: 146 Prüfungen in `t_bogen.js`, 55 in `t_syntax.js`, 0 Fehler** (1010 über zehn
  Skripte). Der Kauf-Code wird **aus `karte.html` geschnitten und wirklich ausgeführt**, mit
  allen drei Ausgängen — darunter der Fall **zweimal dasselbe Stück**, bei dem der zweite Kauf
  nicht vom ersten bestätigt werden darf.
- **Drei eigene Fehler beim Bauen, alle gefunden:**
  1. **Die Gegenprobe zur CSS-Prüfung schlug zweimal nicht an**, und beide Male war die
     *Probe* falsch, nicht die Prüfung: `.ladenzu` enthält `.lad`, und ich hatte nur **eine**
     von fünf `.lad`-Regeln umbenannt. Seitdem muss hinter dem Namen ein Zeichen stehen, das
     kein Namenszeichen ist (`.w.d4` zählt für `w`, `.ladenzu` **nicht** für `lad`). Mit allen
     entfernten Regeln schlägt sie nachweislich an. **Merke: Eine Gegenprobe, die nicht
     anschlägt, kann auch eine schlechte Probe sein.**
  2. **Das erste Suchmuster las Variablennamen als Klassen** (`schritt`, `erschwernis`,
     `selectedNodeId`): `class="st' + (i === schritt ? …` läuft bis zum nächsten `"`, also
     mitten durch den JavaScript-Code. Es endet jetzt am ersten Anführungszeichen beider Sorten.
  3. **`let kaufMeld` im `vm` ist von außen nicht als `ctx.kaufMeld` sichtbar** — dieselbe
     Falle wie am 05.09.2026. Der Test liest den Zustand jetzt über Funktionen, die im Kontext
     selbst stehen.
- **[OFFEN] Zwei geöffnete Bögen desselben Spielers** könnten eine Postfach-Zeile beide
  verbuchen — beim Kauf hieße das **zweimal zahlen**. Unverändert seit dem 14.10.; die neue
  Rückmeldung macht es immerhin sichtbar.

### 2026-10-15 (Fortsetzung 3) — Fehler: die gesetzte Sitzung blieb nicht
- **Hendriks Meldung:** „Irgendwie bleibt die gesetzte Sitzung nicht. Ich werde ständig von der
  Sitzung Test wieder in die pnpgang geholt.“
- **Erst nachgesehen, nicht geraten** (per REST): `aktiveSitzung` steht auf **`test`**. Der Zeiger
  war also richtig gesetzt — der Fehler lag nicht dort.
  - **`pnpgang`** ist die echte Kampagne (4 Spieler, Regie-Notizen, Charakter-Status),
    **`test`** trägt nur `sl`. Es gibt genau diese zwei Sitzungen.
- **Ursache: zwei Zustände, die beide „die Sitzung“ hießen — und nur einer war sichtbar.**
  - **`aktiveSitzung`** — der Zeiger. Dort sind die Spieler.
  - **`pnp_sitzung_fest`** — die **Festlegung dieses Browsers**. Sie **schlägt den Zeiger und
    folgt ihm nicht** (`sitzungsDbJetzt()` steigt bei gesetzter Festlegung aus, bevor es den
    Lauscher einhängt).
  - **Dass die Festlegung gewinnt, ist Absicht** und bleibt so: Sonst würde ein Blick in eine
    ruhende Runde die ganze Gruppe mitnehmen (Begründung vom 07.09.2026).
  - **Der Fehler war, dass sie nirgends stand.** Der Hub zeigte **nur den Zeiger** („Test
    läuft“), während seine eigenen Werkzeug-Links (`regie.html` ohne `?sitzung=`) der
    **Festlegung** folgten. Der Hinweistext sagte das sogar — „Sie zeigen immer die Sitzung, die
    du zuletzt geöffnet hast“ — aber **welche das ist, stand nirgendwo.** Beide Wege in die Regie
    widersprachen sich damit, und aus dem Haus sah es aus, als bliebe die Einstellung nicht.
  - **Dazu kommt:** Jedes `?sitzung=` in der Adresse legt den **ganzen Browser** neu fest — ein
    alter Tab oder ein Lesezeichen auf `regie.html?sitzung=pnpgang` zieht beim Neuladen alle
    anderen Seiten mit. Und **lösen konnte man die Festlegung nur im SPIELER-Hub**; die
    Spielleitung kam an ihre eigene gar nicht heran.
- **Behoben, indem der unsichtbare Zustand sichtbar wird** — nicht durch anderes Verhalten:
  - **Zweites Abzeichen in der Kopfleiste des Regie-Hubs:** „du: PnPGang“ neben „Test läuft“,
    **orange, sobald die beiden auseinanderliegen**, mit dem Hinweis, dass die Spieler woanders
    sind und wohin die Werkzeug-Seiten führen.
  - **Knopf „Festlegung lösen“** — danach folgt der Browser wieder der laufenden Sitzung.
  - **Die Werkzeug-Links tragen die Sitzung ausdrücklich** (`?sitzung=…`) und sagen im Titel,
    wohin sie führen. Ein Link, der von unsichtbarem Zustand abhängt, ist genau die Falle, die
    hier zugeschnappt ist. Ohne jede Sitzung tragen sie keine und der Hinweis sagt, was zu tun
    ist.
  - **Die Sitzungsliste markiert die festgelegte** („du schaust hier hinein“), nicht mehr nur die
    laufende.
- **Zweiter Fund, nicht gemeldet, aber dieselbe Klasse:** **`regie_figuren.html` und
  `arena_admin.html` zeigten überhaupt nicht, in welcher Sitzung sie stehen** — nur `regie.html`
  tat das. Man konnte also die Figuren oder den **Endkampf einer ruhenden Runde** vor sich haben
  und es erst merken, wenn die Spieler nichts sehen. Beide haben jetzt dasselbe Abzeichen samt
  Warnung.
  - Die Anzeige liegt deshalb als **`sitzungBadge()` in `js/sitzung.js`** statt dreimal in den
    Seiten; `js/regie_vault.js` ruft sie auf, statt seine eigene Kopie zu behalten. Dieselbe
    Lehre wie heute Vormittag bei `js/marken.js`.
- **Getestet: neues `tests/t_sitzung.js`, 36 Prüfungen, 0 Fehler** (999 über zehn Skripte).
  - **Der gemeldete Fall ist nachgestellt** und läuft wirklich durch (`vm`, geschnittener
    Hub-Code): Zeiger auf `test`, Browser auf `pnpgang` festgelegt — das Abzeichen nennt
    PnPGang, ist orange, der Hinweis nennt beide Sitzungen, und **jeder Werkzeug-Link zeigt
    nachweislich auf `?sitzung=pnpgang`**. Nach „Lösen“ zeigen sie auf `test`, und der
    Schlüssel ist wirklich weg — nicht nur die Anzeige.
  - Das **gewollte** Verhalten steht ebenfalls als Prüfung da: Eine Festlegung gewinnt gegen den
    Zeiger, folgt ihm nachweislich nicht und hängt **gar keinen Lauscher** ein. Wer das
    zurücknimmt, soll darüber stolpern.
- **Zwei eigene Fehler im Test, beide waren falsche Erwartungen, nicht Fehler im Code:** Ich hatte
  erwartet, dass eine Seite **ohne** Festlegung sofort die laufende Sitzung zeigt. Sie zeigt
  zunächst den **Cache** (ohne Cache die Vorgabe `korsaren`) und korrigiert sich durch ein
  Neuladen — genau so dokumentiert am 07.09.2026, weil der Zeiger synchron gebraucht wird.
  Steht jetzt als Prüfung da, samt dem zweiten Aufruf, der dann ohne Umweg trifft.
- **[OFFEN] Die Festlegung gilt für den ganzen Browser, gesetzt von einer Adresse.** Ein alter
  Tab mit `?sitzung=…` legt beim Neuladen weiterhin alles neu fest. Zwei mögliche Wege: die
  Adresse nach dem Festlegen per `history.replaceState` entfernen, oder die Festlegung der
  Spielleitung **pro Tab** halten (`sessionStorage`) statt pro Browser. Beides ändert Verhalten
  und ist Hendriks Entscheidung — sichtbar ist der Zustand jetzt in jedem Fall.

### 2026-10-15 (Fortsetzung 2) — Die Marken liegen jetzt in einer Datei
- **Hendriks Vorgabe:** „Im Besatzungsbereich, lass mich bitte die Talente und Schwächen sehen,
  wenn ich drauf klicke. Genau wie beim Spielerbogen.“
- **Statt die Mechanik ein zweites Mal zu schreiben, ist sie herausgezogen:** neue
  **`js/marken.js`** (Hover-Feld, Overlay, Lauscher, Stil). `heldenbrief.html` benutzt sie jetzt
  ebenso, der eingebaute Code dort ist ersatzlos weg.
  - **Der Grund ist nicht Ordnungsliebe, sondern die Lehre von `spielerKennung()`:** Zwei
    Fassungen derselben Erklärung laufen auseinander — und dann sagt der Spielerbogen etwas
    anderes über ein Talent als die Seite, auf die die Spielleitung am Tisch schaut.
  - Der Vertrag steht im Dateikopf: Die Seite rendert ihre Chips mit `class="tag"` und
    `data-tipid`/`-tipart`/`-tipn`/`-tipk`/`-tipt` und ruft **einmal** `markenAktivieren()` auf.
    Alles Weitere macht die Datei, per **Delegation** — an 22 NSC-Blättern hängen sonst
    Hunderte Einzel-Lauscher.
- **`besatzung.html` zeigt damit dieselben zwei Stufen** wie der Bogen: Hovern nennt Name,
  Einordnung und Wirkung, Klicken (oder Enter/Leertaste) öffnet die ganze Erklärung mit
  Voraussetzungen, Mindestrang und der Bedeutung eines *Hakens*. Vorher stand dort nur ein
  nativer `title` — der kommt nach einer Sekunde, bricht lange Texte schlecht um, und **auf
  dem Tablet am Tisch gibt es ihn gar nicht.**
  - **Die figurgebundenen Talente sagen jetzt, dass sie niemand wählen kann**
    („· nur für diese Figur“ in der Einordnung, dazu ein eigener Absatz im Overlay). Ohne das
    sucht jemand „Kein Gewissen“ in der Charaktererschaffung und findet es nie.
  - Ein Talent, das es im Regelwerk nicht mehr gibt, steht als nackter Name da — ohne
    erfundenen Zusatz, wie im Bogen.
- **Getestet: 56 Prüfungen in `tests/t_nsc.js`, 0 Fehler** (10 neue), 963 über neun Skripte.
  - **Der Renderblock von `besatzung.html` wird WIRKLICH ausgeführt** (`vm` + DOM-Stub), nicht
    im Quelltext durchsucht: Ein fehlendes `data-tipart` ist gültiges HTML und fällt erst am
    Tisch auf, wenn das Overlay leer bleibt. Geprüft wird jeder einzelne Chip — alle fünf
    Felder, `tabindex`/`role`, und dass **Art und Kennung zusammenpassen** (`tal` muss in
    `TAL_BY_ID` liegen). **Gegengeprüft:** Nimmt man `data-tipart` heraus, schlagen zwei
    Prüfungen an.
  - Dazu die Prüfung, dass die Seite die Mechanik **nicht als eigene Kopie** mitbringt — wer
    sie dort wieder einbaut, soll darüber stolpern.
  - `tests/t_bogen.js` schneidet die Chips weiter aus `heldenbrief.html`, lädt die Mechanik
    aber aus `js/marken.js` — dieselben 135 Prüfungen laufen unverändert durch.
- **Eigener Fehler, und er ist festzuhalten:** `besatzung.html` hat **gemischte Zeilenenden**
  (856 CRLF, rund 105 LF — der NSC-Renderblock von heute kam als LF dazu). Mein Skript hat das
  Zeilenende der Datei einmal bestimmt und daran alle Ersetzungen ausgerichtet; die eine, die
  LF brauchte, fand nichts und das `assert` brach ab. **Die Datei blieb unversehrt**, weil
  geschrieben wird erst am Ende. Merke, schärfer als der Eintrag von gestern: Nicht „das“
  Zeilenende einer Datei bestimmen — es kann mehrere geben, also beide probieren.
- **Bewusst NICHT angefasst:** `regie_figuren.html` zeigt weiter den Tooltip am Mauszeiger
  (Begründung vom 14.10.: breites Raster am Rechner, ein Overlay stände beim Durchsehen
  mehrerer Figuren im Weg). Jetzt, da die Mechanik geteilt ist, wäre es allerdings ein
  Dreizeiler.
- **Noch zu prüfen am Bildschirm:** Overlay und Hover-Feld tragen die dunklen Farben des
  Bogens, `besatzung.html` ist eine helle Pergamentseite. „Genau wie beim Spielerbogen“ heißt
  genau das — falls es dort fremd wirkt, sind es die Farbwerte in `MARKEN_STIL`.

### 2026-10-15 (Fortsetzung) — d12 trägt nur noch Der Seelenlose
- **Hendriks Einwand, und er ist berechtigt:** „d12-Werte sind etwas zu stark in diesem Regelwerk,
  und hier hat nahezu jeder d12. Ich würde das lieber mit einzigartigen Talenten und Schwächen
  lösen.“
- **Nachgezählt, und es war schlimmer als „nahezu jeder“:** **7 von 8 Figuren** trugen mindestens
  einen d12, **14 Stück insgesamt.** In einem System, in dem d12 das Ende der Skala ist, hatte
  damit fast jeder NSC irgendwo das Maximum.
- **Jetzt: 5 d12 — alle beim Seelenlosen.** Die Mannschaft hört bei **d10** auf, die
  Mannschafts-Extras ohnehin.
- **Der Unterschied kommt nicht über eine andere Zahl zurück, sondern aus zwei Quellen:**
  1. **Die Rangfolge, die schon im Kanon steht.** Cormac kämpft weiterhin besser als sein
     Kapitän — nicht weil einer an der Decke klebt, sondern weil in `besatzung.html` Kampf 7
     gegen 6 steht. Dasselbe bei Francesco gegen Harwick im Reden (7 gegen 5).
  2. **Talente.** Wat verliert Kampf d12 und Stärke d12 und bekommt dafür **„Nimmt es mit dreien
     auf“** (Bedrängnis erschwert ihm nichts). Seine Robustheit 8 kommt jetzt aus Konstitution 7
     **plus 1 aus Grobschlächtig** — genau die Bauweise, die Hendrik wollte.
- **Ein älterer Fehler kam dabei heraus:** Cormac und Wat hatten nach der Absenkung **identische
  Attribute**. Das war schon vorher ungenau — der Kanon gibt Cormac INT 2 und Auftreten 4, Wat
  INT 1 und Auftreten 3. Jetzt bildet das Blatt auch diesen Unterschied ab (Cormac Verstand d6
  und Willenskraft d8, Wat d4 und d6). **Die Prüfung „keine zwei Kernfiguren haben dieselben
  Attribute“ hat das gefangen** — geschrieben worden war sie gegen Nachlässigkeit, gefunden hat
  sie eine Ungenauigkeit im Kanonabgleich.
- **Getestet: 46 Prüfungen in `tests/t_nsc.js`, 0 Fehler** (4 neue). Die neue Regel steht als
  Prüfung da — kein Crewmitglied und kein Extra hat einen d12, der Seelenlose mindestens drei.
  **Dazu die Gegenprobe:** Die Crew muss trotzdem unterscheidbar bleiben; eine flache Absenkung,
  die alle gleich macht, wäre genauso falsch wie die Decke vorher.

### 2026-10-15 — Alle 22 NSC im neuen System
- **Hendriks Vorgabe:** Alle NSC ins neue System bringen — „vielfältiger, müssen nicht so stark
  sein, wichtige Leute wie Harwick sind auch nicht mehr Novize, eventuell einzigartige Schwächen
  und Talente“.
- **Der Befund vor dem Bauen ändert die Aufgabe:** Die sieben Kernfiguren trugen in
  `besatzung.html` **bereits vollständige Spielwerte** — im alten W100-System, also seit dem
  Systemwechsel im September **falsche**. Es ging damit um **Umrechnung, nicht Erfindung.** Die
  Charakterisierung stammt aus Hendriks Zahlen, nicht von mir.
- **Neue `js/npcs.js`** mit 8 Kernfiguren (Wild Cards) und 14 Mannschaftsmitgliedern (Extras,
  kein Wild Die). Jedes Blatt rechnet durch `js/regelwerk.js` — `parade()`, `robustheit()` und
  `wurf()` arbeiten ohne Sonderweg damit.
- **Was aus den alten Zahlen wurde**, und warum es stimmt:
  - **Cormac schlägt besser zu als sein Kapitän** (alt: Kampf 7 gegen 6) und **denkt mit den
    Händen** (INT 2 → Verstand d4).
  - **Francesco redet am besten und hält am wenigsten aus** (Rhetorik 7, Körper 2).
  - **Wat ist der Brocken und redet nicht** (Körper 5★, Rhetorik 1).
  - **Dirk kann nicht mit Menschen** (Auftreten 2 → Willenskraft d4).
  - **Josiah heilt am besten und kämpft am schlechtesten** (Kampf 1).
  - Jede dieser Sätze steht als eigene Prüfung da. **Geht eine kaputt, ist nicht der Code falsch,
    sondern die Figur.**
- **Neu dazu, auf die Vorgabe hin:**
  - **Geschicklichkeit und Konstitution** gab es im alten Blatt gar nicht — abgeleitet aus dem,
    was über die Figur dasteht.
  - **Fertigkeiten über die alten elf hinaus:** Schießen (Dirk ist Kanonenmeister und hatte
    keinen Schusswert!), Navigation, Diebeskunst, Provozieren, Einschüchtern. **14 der 16**
    kommen jetzt vor.
  - **Ränge:** Harwick, Cormac, Dirk und Wat sind **Veteran**, Tom/Francesco/Josiah **Erfahren**,
    Der Seelenlose **Legendär**. Keine Kernfigur ist mehr Novize.
- **Sieben figurgebundene Talente und vier Schwächen**, je aus dem Kanon abgeleitet: *Kein
  Gewissen* (Wat — wörtlich aus besatzung.html), *Jessicas Schatten* (Harwick), *Der Knoten am
  Gürtel* (Cormac), *Fühlt das Ruder* (Tom), *Abgeschaltet* (Dirk), *Niemand geht hungrig*
  (Josiah), *Drei Namen, drei Pässe* (Francesco).
  - Sie tragen **`nurNsc: true`** und sind für Spieler **nicht wählbar** — geprüft in
    `talentWaehlbar()`, nicht nur in der Oberfläche, damit auch ein von Hand abgesetzter Aufruf
    nicht daran vorbeikommt. Jedes gehört **genau einer** Figur; auch das wird geprüft.
  - Aus der **Regelreferenz** bleiben sie draußen: Ein Katalog möglicher Talente, in dem
    unwählbare stehen, lehrt Falsches. Wieder bei 41 Talenten und 20 Schwächen.
- **Maßvoll statt mächtig** („müssen nicht so stark sein“): Eine frische Spielerfigur kommt auf
  Robustheit 6 — **kein Crewmitglied liegt mehr als 2 darüber**, und wo einer oben steht, kommt
  es vom **Talent**, nicht vom Attribut: Wats 8 sind 7 aus Konstitution plus 1 aus
  *Grobschlächtig*. Steht als Prüfung da, damit es bei der nächsten Änderung nicht abdriftet.
- **`besatzung.html` rendert die Werte jetzt aus `js/npcs.js`** statt sie als festes Markup zu
  tragen — **21 Platzhalter**, kein „Körper/INT/Auftreten“ und kein „Mastery“ mehr im Quelltext.
  Zwei Fassungen derselben Zahlen laufen sonst auseinander, und die auf dieser Seite ist die, auf
  die am Tisch jemand schaut.
- **Getestet: 42 Prüfungen im neuen `tests/t_nsc.js`, 0 Fehler** (939 über neun Skripte).
  Darunter: keine erfundene Fertigkeit, kein erfundenes Talent, keine Stufe außerhalb d4–d12,
  jeder Platzhalter in `besatzung.html` zeigt auf ein Blatt.
- **Drei eigene Fehler beim Bauen, alle gefunden:**
  1. **Ein durchlaufendes Suchmuster hat Werte der falschen Figur zugeordnet.** Weil die sieben
     Hauptfiguren ihre alte `gw-row` nicht mehr hatten, griff es auf die der *nächsten* Karte
     über — drei Mannschaftsmitglieder fielen hinten runter. Pro Karte parsen statt global.
  2. **Die erste Umrechnung machte alle gleich** (2 und 3 beide zu d6): vierzehn
     Mannschaftsmitglieder mit identischen Werten — das Gegenteil von „vielfältiger“. Skala
     gespreizt.
  3. **Mein Dateikommentar behauptete „die stärksten NSC liegen bei 7“**, während Wat auf 8 stand.
     Korrigiert statt Wat zu beschneiden — die 8 ist richtig, der Satz war falsch.
- **Nebenbei:** `tools/regelreferenz.js` filtert `nurNsc`, und zwei Zeilenende-Fallen
  (CRLF/LF) haben je einen Anlauf gekostet. **Merke:** vor einer Ersetzung das Zeilenende der
  Zieldatei prüfen, nicht annehmen.
- **[OFFEN] Die Arena kennt die Blätter nicht.** `js/arena_scenes.js` führt weiterhin eigene
  Kampfwerte (`nahWert`, `hpMax`) nach W100. Ein Verbündeter im Endkampf hat damit andere Werte
  als dieselbe Figur in `besatzung.html`. Das ist der nächste logische Schritt.

### 2026-10-14 (Fortsetzung 13) — Munition als Regel, 29 neue Waren
- **Hendriks Vorgaben:** Munition einbauen, dazu allerlei Gerät — **1701-tauglich**, an diesem
  Ort **plausibel zu bekommen**, und **manches darf ausdrücklich nutzlos sein**.
- **Erst nachgelesen, dann gebaut** (stehende Regel seit heute Mittag): Savage Worlds führt je
  Fernwaffe eine Zahl **Shots** — so viele Schuss, dann wird nachgeladen. 1701 heißt das: **ein
  Schuss.** Und das Projekt bildete es längst ab, nur an einer Stelle: Die Arena sagt seit August
  „nach einem Schuss ist die Waffe leer und erst in der übernächsten Runde wieder bereit“.
  **Gefehlt hat nur der Vorrat** — woher kommt die nächste Ladung?
- **Die Regel steht in Bibel §4.5** (neu), der Spickzettel in `REGELREFERENZ.md` nennt sie:
  - Jede Schusswaffe hat **einen** Schuss. Ein Schuss verbraucht **eine Ladung**.
  - Der Vorrat steht **an der Figur**, nicht am Gegenstand — wer zwei Pistolen trägt, schießt
    trotzdem aus demselben Pulverhorn.
  - **Abgezogen wird von Hand.** Nicht jede Schießen-Probe ist ein Schuss (Zielen, Drohen,
    Warten) — eine Automatik wäre öfter falsch als richtig.
  - **Bewusst NICHT abgebildet:** Kaliber, Fehlzündung, Pulverqualität. Eine Ladung ist eine
    Ladung; Savage Worlds zählt Schuss je Gefecht, nicht je Kampagne.
- **29 neue Waren, 24 → 53**, in zwei neuen Arten:
  - **Munition (4):** Pulverhorn mit Blei (20 Ladungen) · Papierpatronen (12, dafür schneller und
    auch bei Regen) · Feuersteine (einer hält etwa dreißig Schuss) · Kugelform mit Bleibarren
    (bringt **keine** fertigen Ladungen — man gießt sie erst).
  - **Gerät (+16):** Ölzeug, Hängematte, Zunderbüchse, Nähzeug und Pech, Zimmermannswerkzeug,
    Senklot, Sanduhr, Signalhorn, Seekarte, Brennglas, Seemannskiste, Angelzeug … — durchweg
    Dinge, die es 1701 in einem Hafen wirklich gab.
  - **Allerlei (9):** Spielkarten, Würfelbecher, Tabak, Handspiegel, Glasperlen, billiges Amulett,
    leere Flasche, **ein Schlüssel ohne Schloss**, Rosenkranz. **Diese Art tut nichts** — kein
    verstecktes Talent, kein Bonus. Sie steht als eigene Art da, damit niemand glaubt, etwas
    übersehen zu haben; was daraus wird, entscheidet die Spielleitung oder niemand.
- **Die dünnen Schubladen sind gefüllt.** Vorher hielten **8 von 20 Fächern genau ein Stück** —
  eine Schublade aufzuziehen, in der ein Gegenstand liegt, fühlt sich nach Fehler an. Jetzt
  **26 Fächer, 116 Warenplätze**, und nur noch eines mit einem einzigen Stück (der
  Wurfeisenkarren — das ist der Stand, nicht die Lücke).
  - Neue Fächer: **„Der Hausierer“** und **„Der Trödelkarren“** (Markt) · **„Die Ecke für
    Seeleute“** und **„Hinter dem Vorhang“** (Krämer — Pulver hält er nicht im Laden) ·
    **„Vor der Kirche“** (Hafen) · **„Der Tisch mit dem Krempel“** und **„Werkstatt am Rand“**
    (Höhlenstadt).
- **Getestet: 133 Prüfungen in `tests/t_bogen.js`, 0 Fehler** (20 neue).
  - **Die Dubletten-Prüfung von gestern hat sofort zugeschlagen:** Beim Verteilen hatte ich
    `rosenkranz` und `kerzen` am Hafen je zweimal gelegt. Genau wofür sie gebaut war.
  - **Zwei eigene Fehler im Test selbst**, beide gefunden, bevor etwas falsch wurde: „Schusswaffe“
    ist **nicht** dasselbe wie „Fernkampf“ — das Wurfmesser ist Fernkampf und braucht kein Pulver;
    die Prüfung geht jetzt über das Feld `schuss`, in beide Richtungen. Und die Kauf-Prüfungen
    standen **vor** ihrer Umgebung.
  - Dazu: der Bogen **speichert** die Ladungen (ein Feld, das die Figur kennt und der Bogen nicht
    hochschreibt, ist der häufigste stille Datenverlust), ein geschenktes Pulverhorn füllt
    ebenso auf wie ein gekauftes, und die Kugelform bringt nachweislich keine.
- **Zwei Werkzeug-Fehler, beide dokumentiert und beide wieder gemacht:**
  1. Ein Index-Sprung hat den neuen Warenblock **mitten in `leereFigur()`** eingefügt. Statt zu
     operieren: Datei zurücksetzen und die Skripte neu laufen lassen — das erste war
     reproduzierbar.
  2. Ein Python-Schreibzugriff hat `REGELREFERENZ.md` **von LF auf CRLF** umgestellt, worauf die
     Aktualitätsprüfung die ganze Datei für verändert hielt. **Merke:** Dateien dieses Repos mit
     `newline=''` lesen und schreiben, sonst ändert ein Einzeiler jede Zeile.
- **[OFFEN] Die Arena kennt die Ladungen nicht.** `js/arena.js` rechnet weiter nach W100 und hat
  seine eigene Waffenlogik („Waffe leer, in der übernächsten Runde bereit“). Beides passt
  inhaltlich zusammen, ist aber nicht verbunden — im Endkampf zählt niemand Ladungen.

### 2026-10-14 (Fortsetzung 12) — Schubladen beim Krämer, Stände auf dem Markt
- **Hendriks Vorgabe:** Die Waren kategorisieren und **ausklappbar** machen — beim Krämer wie
  **Schubladen**, auf dem Markt nach dem **jeweils passenden Stand**.
- **Aus `waren: […]` ist `gruppen: [{ n, d, waren }]` geworden.** Die Gruppen sind nicht
  Warenarten („Nahkampf“, „Gerät“) — das wäre wieder ein Katalog. Sie sind **Orte im Laden**:
  - **Krämer:** „Die Schublade mit dem Tauwerk“ (klemmt, er tritt einmal dagegen) · „Das Regal
    über der Theke“ · „Die Kisten an der Rückwand“ · „Das Fach unter der Theke“ (Werkzeug —
    was davon auch eine Waffe ist, sagt er nicht dazu) · „Die Vitrine beim Fenster“ (das Teure,
    er wischt sie ab, bevor er aufschließt) · „Der Kasten mit dem roten Kreuz“.
  - **Marktplatz:** Klingenhändler · Gerber · Wurfeisenkarren · „Fisch, Brot, Fässer“ ·
    „Taue und Netze“.
  - **Hafen (`7.1`):** „Puesto de víveres“ · Schiffsbedarf · Tuch und Leder · beim Bader.
  - **Höhlenstadt (`8.1`):** „Unter der Plane: Pulver und Blei“ (zeigt sie erst, wenn man fragt)
    · Klingenreihe · Panzer und Leder · „Was von Bord kommt“.
  - Namen und Zuordnung sind mein Aufschlag entlang der vorhandenen Ortstexte — jede Zeile
    einzeln änderbar.
- **Zu, bis man sie aufzieht.** Alles auf einmal zu zeigen wäre eine Preisliste; so geht man hin
  und fragt. Jedes Fach nennt die Stückzahl **und wie viel davon bezahlbar ist** — vor einer
  geschlossenen Schublade will man wissen, ob sich das Aufziehen lohnt.
- **Beim Ortswechsel sind wieder alle zu.** Man kommt an einen neuen Laden und steht davor, nicht
  vor den Schubladen des letzten. Welches Fach offen ist, liegt **nur im Speicher dieser Seite** —
  das ist Ansichtssache dieses Spielers, kein Spielstand.
- **Getestet: 113 Prüfungen in `tests/t_bogen.js`, 0 Fehler** (11 neue). Neu darunter: kein Fach
  ist leer, jedes hat einen Namen, und **keine Ware liegt zweimal im selben Laden** — ein
  Kopierfehler beim Aufteilen hätte am Tisch wie ein zweites Angebot ausgesehen. Die Prüfung
  „jede Ware gibt es wirklich“ zieht die Gruppen jetzt flach und gilt unverändert weiter.

### 2026-10-14 (Fortsetzung 11) — Der Laden steht am Ort und führt sein eigenes Sortiment
- **Hendriks Korrektur am Vormittagsstand:** Nicht aus dem Charakterfenster aufmachen, sondern
  **direkt im Krämerladen oder auf dem Markt** — und **die Waren passend zum Laden**.
- **Der Katalog im Heldenbrief ist ersatzlos entfallen.** Ein Katalog im Charakterfenster ist ein
  **Menü**; ein Laden an einem Ort ist eine **Szene**. Der Bogen sagt jetzt nur noch, **wo**
  gekauft werden kann, und führt weiter Getragenes, Ablegen und Verkaufen.
- **Jeder Händler führt sein eigenes Sortiment.** Aus `laden: "Name"` ist
  `laden: { name, was, waren: […] }` am Marker geworden:
  - **Krämerladen** — Werkzeug, Seile, Konserven, Laterne, Verbandszeug, Kompass. **Keine
    Kriegswaffen.** Das ist genau die Liste, die `ORTE.kraemerladen` seit August nennt.
  - **Marktplatz** — Stände mit Gebrauchtem: Klingen aus zweiter Hand, Leder, Vorrat.
  - **Markt am Hafen** (`7.1`) — Vorrat und Gerät, **bewusst keine Waffen**: Die verkauft in
    einem spanischen Kriegshafen niemand an eine englische Crew.
  - **Markt der Höhlenstadt** (`8.1`) — **der einzige Ort der Kampagne mit Schusswaffen und
    Rüstung.** Das ist eine Aussage über die Welt, nicht nur eine Liste, und wird als solche
    geprüft.
  - Die Zuordnung ist mein Aufschlag entlang der vorhandenen Ortstexte — änderbar in je einer
    Zeile.
- **Gekauft wird im Ort-Fenster auf der Karte**: Name des Ladens, was er führt, der eigene
  Geldstand, dann die Waren mit Werten und Preis. Zu teures ist ausgegraut.
- **Ein Kauf schreibt NICHT in die Figur, sondern ins Postfach** — derselbe Grund wie bei der
  Übergabe durch die Regie, und hier wäre er noch teurer gewesen: Der Bogen hätte den Kauf beim
  nächsten Klick überschrieben, das Geld wäre weg und die Ware auch.
  - **Das Geld prüft der BOGEN, nicht der Laden.** Der Laden sieht einen Stand, der eine Sekunde
    alt sein kann; maßgeblich ist die Stelle, an der die Figur steht. Reicht es nicht, wird der
    Kauf verworfen und der Spieler bekommt es gesagt — statt ins Minus zu gehen.
  - **Der Bogen wird auf der Karte jetzt im Voraus geladen** (1,2 s nach dem Start), nicht erst
    beim Aufklappen. Er ist der einzige Schreiber auf der Figur und verbucht die Käufe; läge er
    bis zum ersten Aufklappen brach, bliebe ein Kauf einfach liegen, **ohne dass jemand sieht
    warum**. Kostet eine zusätzliche Seitenladung je Spieler.
- **Toter Code entfernt statt liegen gelassen:** `kaufen()`, `ladenAufschlagen()`,
  `ladenMoeglich()` und `ausruestungDerArt()` sind weg, der Kommentarkopf, der die abgelöste
  Lösung beschrieb, ist neu geschrieben. Beides hätte sauber geparst und wäre genau deshalb
  gefährlich gewesen — wer es später liest, hält es für gültig.
- **Getestet: 102 Prüfungen in `tests/t_bogen.js`, 0 Fehler.** Die tragende neue Prüfung:
  **jede Ware muss es wirklich geben.** Beim Schreiben der Sortimente hatte ich eine ID erfunden
  (`verbandszeug_platzhalter` statt `verband`) — ein Laden mit einer toten ID zeigt sie einfach
  nicht an, und niemand merkt, dass die Ware fehlt. Dazu: Krämer und Markt führen nachweislich
  Verschiedenes, der Krämer keine Kriegswaffen, Schusswaffen ausschließlich im Schmugglernest —
  und die Karte schreibt nachweislich **weder `ausr` noch `muenzen`**.
- **[OFFEN] Zwei geöffnete Bögen desselben Spielers** (Karte und eigener Tab) könnten dieselbe
  Postfach-Zeile beide verbuchen. Bewusst in Kauf genommen: Die Reihenfolge ist *erst eintragen,
  dann räumen*, weil ein verlorener Fund schlimmer wäre als ein doppelter. Beim Kauf hieße
  doppelt allerdings **zweimal zahlen** — falls das am Tisch vorkommt, wäre eine Transaktion auf
  dem Postfach die saubere Lösung.

### 2026-10-14 (Fortsetzung 10) — Eingekauft wird beim Krämer, nicht im Menü
- **Hendriks Vorschlag:** Die Ausrüstung eventuell leer lassen und etwas davon auf **Markt und
  Krämer in Grimsgate** verschieben. **Seine Entscheidung nach dem Nachmessen:** Startgeld
  bleibt, und **die Spieler machen den Laden am Ort selbst auf** — nicht die Spielleitung.
- **Zwei Drittel davon gab es schon, nur nicht sichtbar:** Eine frische Figur trägt bereits
  **nichts** (`ausr: []`), und gekauft wird **nicht** bei der Erschaffung, sondern jederzeit im
  Heldenbrief — der Assistent hat seit dem 07.09. gar keinen Ausrüstungsschritt. Und
  `ORTE.kraemerladen` sagt wörtlich: „Spieler können hier Ausrüstung kaufen, an die sie vorher
  nicht gedacht haben“, samt Begründung für günstige Preise. **Offen war nur, dass der Katalog
  immer offen stand** — auch mitten auf See.
- **Der Laden hängt jetzt am Ort.** Ein Marker trägt `laden: "…"` und wird damit zum Händler;
  gekennzeichnet sind **Marktplatz** und **Krämerladen** (`1.1`), **Markt am Hafen** (`7.1`) und
  der **Markt der Höhlenstadt** (`8.1`).
  - **Die Kennzeichnung sitzt am Marker**, nicht in einer Liste anderswo — sonst wäre eine neue
    Szene mit Laden eine Stelle zum Vergessen.
  - `heldenbrief.html` hört auf `currentScene` (**nur lesend**) und zeigt drei Zustände, von
    denen jeder sagt warum: „Hier gibt es nichts zu kaufen“ · „**Krämerladen** — hier kannst du
    einkaufen“ mit Knopf · der offene Katalog. **Ein Szenenwechsel schließt ihn wieder** — man
    kauft nicht weiter ein, während das Schiff ablegt.
  - **Ohne Verbindung wird NICHT gesperrt.** Dann wissen wir nicht, wo die Gruppe steht, und eine
    Sperre aus Unwissen wäre schlimmer als ein offener Laden — der Bogen soll offline benutzbar
    bleiben.
  - Dass der Laden offen ist, liegt **nur im Speicher dieser Seite**. Wohin die Gruppe geht, steht
    in der Datenbank; ob jemand den Katalog aufschlägt, geht niemanden etwas an.
- **Die Spielleitung kann jetzt Ausrüstung und Münzen übergeben** (`regie_figuren.html`) — das
  fehlte bisher ganz: Es gab nur „kaufen“ im Bogen, und für Beute oder den Jaguar-Säbel keinen
  Weg außer „der Spieler tippt es sich selbst ein“. Getragenes anklicken zieht es wieder ein.
- **Der Grund für das Postfach ist ein echter Datenverlust, kein Stilempfinden.**
  `heldenbrief.html` liest die Figur genau **einmal** (`once`) und schreibt danach bei jeder
  Änderung **seine eigene Fassung** hoch — `bogenFelder()` enthält `ausr` und `muenzen`. Ein
  direkter Schreibzugriff der Regie wäre **beim nächsten Klick des Spielers lautlos weg**
  gewesen. Deshalb `figuren/{pid}/zuteilung`: Die Regie legt daneben, der Bogen nimmt an, trägt
  in seine Fassung ein und räumt das Postfach. **Es bleibt bei genau einem Schreiber auf der
  Figur** — dasselbe Muster wie bei der Würfel-Anfrage. **Keine Regeländerung nötig**, `figuren`
  ist schon freigegeben.
  - **Erst eintragen, dann räumen** — bricht es dazwischen ab, bekommt der Spieler das Stück
    lieber zweimal angeboten als gar nicht.
  - **Vor dem ersten Lesen der Figur wird nichts angenommen**, sonst trüge der Bogen etwas in
    eine Figur ein, die er noch gar nicht kennt.
  - Der Spieler **sieht die Übergabe** („Von der Spielleitung · Säbel“). Stillschweigend etwas
    in einen fremden Bogen zu legen wäre unheimlich.
- **An Markt und Krämer steht jetzt ein `[MECHANIK]`-Hinweis** für die Spielleitung: dass der
  Laden hier aufgeht, wo die Preise stehen und wie man etwas verschenkt. Rein prozedural, kein
  Inhalt.
- **Getestet: 206 Prüfungen in den beiden betroffenen Skripten, 0 Fehler** (28 neue).
  - **Die Regel „jeder Schreibzugriff liegt neben der Figur“ ist erweitert, nicht aufgeweicht:**
    Jetzt sind drei Ziele erlaubt (Anfrage, Notiz, Postfach), aber die Prüfung, dass **kein
    WERT** der Figur angefasst wird, steht unverändert.
  - Zuerst geprüft wird, dass es **überhaupt Händler-Orte gibt** — eine Kennzeichnung, die
    nirgends gesetzt ist, wäre eine Sperre ohne Ausweg, und niemand könnte je kaufen.
  - Dazu: mehrere Übergaben auf einmal, Münzen rutschen nie ins Minus, ein unbekannter
    Gegenstand wird nicht eingetragen — aber das Postfach trotzdem geräumt, sonst bliebe es
    für immer liegen.
- **Zwei eigene Fehler beim Bauen, beide vom `assert` gefangen:** Eine Ersetzung zielte auf eine
  Export-Zeile, die anders lautete — das Skript brach ab, **bevor** es schrieb, die Datei blieb
  unversehrt. Danach habe ich dieses Skript per Shell-Quoting nachpatchen wollen und es dabei
  zerlegt; richtig war, ein frisches zu schreiben. **Die Lehre vom Vormittag hat gegriffen**
  (`assert s.count(alt) == 1`), die über Heredocs noch nicht ganz.

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
