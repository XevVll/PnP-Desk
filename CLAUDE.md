# CLAUDE.md — Projekt-Gedächtnis

Kurzer technischer Leitfaden für dieses Repo. Die eigentliche Story-/Design-Doku steht in
`KAMPAGNEN-BIBEL.md` — vor inhaltlicher Arbeit lesen, v. a. Abschnitt 13 „Technischer Stack"
und Abschnitt 17 „Arbeitsweise". Dieses Dokument hier ist rein technisch/prozessual und hält
zusätzlich einen laufenden Changelog.

> **Laufender Arbeitsstand (WIP):** Der **Codex** (`codex.html`) und der **Schatzinsel-Szenen-
> Durchgang** sind gerade in Arbeit. Einstiegspunkt, nächster Schritt und Arbeitsweise dafür
> stehen in **`ARBEITSSTAND.md`** — dort weiterlesen, bevor an diesem Strang gearbeitet wird.

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
