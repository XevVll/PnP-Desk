---
name: pnp-scene
description: Führt Schritt für Schritt durch das Anlegen einer neuen Szene, eines neuen Orts/Markers oder einer neuen Interaktion in diesem PnP-Kampagnentool (js/scenes.js, js/golden_lion_scenes.js, js/schatzinsel_scenes.js, js/regie.js bzw. die analogen Dateien einer geforkten Kampagne). Nutzen, wenn eine neue Örtlichkeit, ein neuer Szenen-Zustand einer bestehenden Örtlichkeit, oder eine neue GM-Interaktion an einem Ort ausformuliert werden soll.
---

# Neue Szene / neuen Ort / neue Interaktion anlegen

Diese Skill kodifiziert das MAP_REGISTRY-Muster aus `CLAUDE.md` als konkreten Ablauf. Sie ist
Teil des generischen Kampagnentool-Baukastens dieses Repos (Firebase-synchronisierte
GM/Spieler-Kartenansicht) — die konkreten Beispiele unten stammen aus der aktuell laufenden
Korsaren-Kampagne, das MUSTER (Dateistruktur, Objekt-Formen, Registry-Mechanik) gilt unverändert
für jede über eine Kopie/Fork dieses Repos geleitete Kampagne. Bei Unklarheit über exakte
Feldnamen: `reference.md` in diesem Skill-Ordner enthält echte, unveränderte Code-Beispiele aus
dem Repo.

**Grundregel (Bibel 17):** Hendrik entwickelt Story-Inhalte selbst. Diese Skill hilft bei der
technischen Umsetzung eines bereits von Hendrik vorgegebenen Inhalts — sie erfindet keine neue
Handlung. Fehlt an einer Stelle Story-Substanz, `[OFFEN]` markieren statt selbst zu erfinden.

## Schritt 1: Was wird angelegt?

Frage zuerst, welcher der drei folgenden Fälle vorliegt — das bestimmt, wie viele Dateien
angefasst werden müssen:

1. **Neue Interaktion an einem bestehenden Ort** → nur `js/regie.js` (`ORTE[ortId].interaktionen`)
   ändern. Kein Registry-Eintrag nötig.
2. **Neuer Szenen-Zustand einer bestehenden Örtlichkeit** (z. B. eine dritte Golden-Lion-Szene
   nach "2.1" Basis und "3.1" Sturm) → nur die passende `*_scenes.js`-Datei ändern (neuer Eintrag
   im dortigen `SCENES`/`GOLDEN_LION_SCENES`/`SCHATZINSEL_SCENES`-Objekt). Kein Registry-Eintrag
   nötig — die Szene wird automatisch von `getAllSceneEntries()` (`js/regie_vault.js`) und
   `MAP_REGISTRY` (`karte.html`) mit erfasst, weil beide über `Object.keys(...)` iterieren.
   **Vor dem Anlegen prüfen:** Reicht eventuell der Live-Sichtbarkeits-Schalter
   (`hiddenMarkersLive`, im Vault-Adminpanel per Klick auf einen Ort togglebar) statt einer neuen
   Szene? Historisch wurde Szene "1.2" genau deshalb wieder in "1.1" gemergt (siehe CLAUDE.md
   Changelog 2026-07-30) — nur eine neue Szene anlegen, wenn sich wirklich mehr als nur
   Marker-Sichtbarkeit ändert (z. B. andere Bilder/Texte an mehreren Orten gleichzeitig).
3. **Komplett neue Örtlichkeit** (neue Karte/Kartenquelle, z. B. eine vierte Location nach
   Grimsgate/Golden-Lion/Schatzinsel) → neue `js/<name>_scenes.js`-Datei nach dem flachen Muster
   (siehe unten) **plus** einen Registry-Eintrag in **beiden** Dateien:
   - `karte.html`: neuer Eintrag im `MAP_REGISTRY`-Array (`getScene`/`getMarkers`-Funktionspaar,
     siehe `reference.md`)
   - `js/regie_vault.js`: neuer `if (typeof ... !== 'undefined')`-Block in `getAllSceneEntries()`,
     `getSceneLabel()`, `getMarkersForScene()`
   - Neue Script-Includes in `karte.html` UND `regie.html` (`<script src="js/<name>_scenes.js">`)

## Schritt 2: Szenen-ID vergeben

Führende Ziffer = Örtlichkeit, zweite Ziffer = Zustand dieser Örtlichkeit (z. B. `"3.1"` = dritte
Örtlichkeit, erster Zustand). Aktuell vergeben: `1.x` Grimsgate, `2.x`/`3.x` Golden Lion, `4.x`
Schatzinsel. Eine **neue Örtlichkeit** bekommt immer die nächste freie **führende** Ziffer — nie
einfach am Ende der bestehenden Zählung weiterzählen. Ein bereits vorbereiteter Kommentar in
`js/golden_lion_scenes.js` (ca. Zeile 162) markiert `"5.1"` als nächste freie Golden-Lion-Ziffer,
falls dort weitergemacht wird — für eine wirklich neue Örtlichkeit trotzdem die nächste komplett
freie führende Ziffer nehmen, nicht `5.x`.

## Schritt 3: Flaches Muster oder Basis/Override?

- **Flach** (wie `js/scenes.js`, `js/schatzinsel_scenes.js`): jede Szene listet ihre Marker
  komplett selbst auf. Passt, solange die Örtlichkeit nur einen Szenen-Zustand hat oder bekommen
  wird.
- **Basis/Override** (wie `js/golden_lion_scenes.js`): Marker-Position/Titel/Bild/Text nur EINMAL
  in `<NAME>_MARKERS_BASE`, jede Szene überschreibt nur `imgOverrides`/`descOverrides`/
  `hiddenMarkers`. Nötig, sobald eine Örtlichkeit mehrere Szenen-Zustände hat oder bekommen wird —
  sonst müssten bei jeder neuen Szene alle Marker-Positionen erneut abgetippt werden (Fehlerquelle
  bei `top`/`left`).

Bei einer neuen Örtlichkeit mit heute nur einem geplanten Zustand: flach anfangen. Kommt später
ein zweiter Zustand dazu, auf Basis/Override umbauen (wie es bei Golden Lion passiert ist).

**Mehrere Orte innerhalb einer neuen Szene → trotzdem FLACH, kein Container-Marker.** Hat die
neue Örtlichkeit mehrere Gebäude/Plätze (z. B. ein Hafen mit Arztpraxis, Kneipe, Markt), bekommt
JEDER dieser Orte einen eigenen Haupt-Marker direkt auf dem Szenen-Hintergrund — genau wie bei
Grimsgate (`heuer`/`taverne`/`markt`/... liegen direkt auf `grimsgate_map.webp`). **Kein**
zusätzlicher Marker, der nur die ganze Szene/Örtlichkeit als solche repräsentiert (z. B. eine
„Anlegestelle", die bloß das Kartenbild nochmal zeigt) — die Szene selbst ist über `background`
schon der Hintergrund für alle ihre Orte.

`parentId`-Sub-Orte (Bibel 13.2) sind die Ausnahme davon, nicht der Standardfall: Sie lohnen sich
nur, wenn EIN EINZELNER bereits bestehender Ort selbst so detailreich ist, dass er mehrere klar
unterscheidbare Klickstellen innerhalb seines EIGENEN Nahaufnahme-Bilds braucht (Beispiel: das
Thahal-Dorf auf der Schatzinsel mit vier Hotspots im Dorfbild). Nicht als erster Ansatz beim
Anlegen einer komplett neuen Szene mit mehreren Orten verwenden — genau dieser Fehler passierte
im August 2026 bei zwei neuen Szenen (`7.1`/`8.1`), wurde nach Korrektur wieder auf das flache
Muster zurückgebaut. Im Zweifel: erst flach anlegen, nur bei echtem Bedarf (ein Ort wird selbst zu
groß für einen einzigen Marker) auf Sub-Orte umbauen.

## Schritt 4: Marker-Felder ausfüllen

Siehe `reference.md` für ein vollständiges Beispiel. Kern-Felder pro Marker: `id`, `top`/`left`
(Position in %), `title`, `desc`, `img`. Optional: `variants` (mehrere umschaltbare Bildzustände
für denselben Marker, unabhängig von Szene/Trigger — Firebase-Pfad `markerVariant/<markerId>`).

**Design-Regel 2.8 (verbindlich):** `desc` ist reine Ort-/Stimmungsangabe für Spieler — kein
Plot-Wissen, kein Handlungsauftrag, keine Vorwegnahme dessen, was der GM eigentlich selbst
enthüllen soll. GM-Hintergrundwissen gehört ausschließlich nach `js/regie.js`. Siehe auch Skill
`pnp-content-style` zum Gegenlesen.

Fehlt ein `img`, zeigt `karte.html` „Kein Bild hinterlegt." — lieber ein Platzhalterbild (z. B.
das Kartenbild selbst) setzen als das Feld leer zu lassen.

## Schritt 5: GM-Inhalt in js/regie.js ausformulieren

Ein Ort ohne `interaktionen`-Eintrag in `ORTE` erscheint im Admin-Panel als „noch nicht
ausformuliert". `ORTE` ist FLACH (eine Definition pro Ort-ID, unabhängig von der Szene) — siehe
`reference.md` für die volle Objektform (`personen`, `kurz`, `ortHinweis`, optional `npcs[]`,
`interaktionen{}`).

Pro Interaktion: `title`, `kurz` (Kurzfassung für die Übersicht), `details` (ausführlicher
Fließtext für den SL), `trigger[]` — jeder Trigger-Punkt hat `id` (Firebase-Pfad-Bezeichner,
eindeutig innerhalb der Interaktion), `label` (Anzeigetext der Checkbox) und `info` (ein direkt an
diesem Ablauf-Punkt angehefteter Textausschnitt aus `details`, keine neue Formulierung — reine
Umgliederung des bereits von Hendrik freigegebenen Wortlauts). Alle 178 realen Trigger im Projekt
haben inzwischen ein `info`-Feld — bei neuen Interaktionen von Anfang an mitgeben.

**Wenn derselbe Ort in mehreren Szenen mit unterschiedlichem Inhalt vorkommt** (z. B. Batteriedeck
ruhig vs. im Sturm):
- `nurSzenen: ["3.1"]` an einer Interaktion → taucht NUR in dieser Szene auf.
- `nichtInSzenen: ["3.1"]` an einer Interaktion → taucht in JEDER Szene außer dieser auf
  (bevorzugt, wenn eine Interaktion in zukünftigen Szenen standardmäßig weiter gelten soll, ohne
  die Liste pflegen zu müssen).
- `szenenUeberschreibungen: { "3.1": { personen?, kurz?, ortHinweis? } }` am Ort selbst (nicht an
  der Interaktion) → überschreibt nur die angegebenen Anzeige-Felder für diese Szene, Rest fällt
  auf den Basiswert zurück. Wird in `regie.html`/`js/regie_vault.js` über `resolveOrtForScene()`
  aufgelöst — ohne diesen Eintrag zeigt das Panel für die neue Szene weiterhin den Text der
  Basis-Szene, auch wenn der Ort inhaltlich ganz anders ist.

## Schritt 6: Szenen-weites Material (optional)

`SZENEN_REGIE[sceneId]` in `js/regie.js` (nicht pro Ort, sondern pro Szene) — nur anlegen, wenn
gewünscht:
- `stimmung`: Vorlese-Grundton der ganzen Örtlichkeit.
- `ghosts[]`: generische, szenenweit frei platzierbare Statisten (`name`, `rolle`, `verfassung`,
  `beduerfnis`, optional `koerperlich: true` für kampffähige Ghosts). Plot-neutral, reines
  Atmosphäre-Futter — nicht mit `ORTE[ortId].npcs` verwechseln (die sind an einem festen Ort
  verankert).
- `charaktere: [...]`: optionale Liste von `CHARACTERS`-IDs (`js/characters.js`), die die
  Charakter-Leiste im Admin-Panel auf diese Figuren einschränkt. Fehlt das Feld, werden alle
  Figuren gezeigt.

## Schritt 7: Definition of Done

- [ ] Marker-Objekt vollständig (`id`/`top`/`left`/`title`/`desc`/`img`), `desc` nach Design-Regel
      2.8 geprüft
- [ ] Bei mehreren Orten in einer neuen Szene: FLACH, kein künstlicher Container-Marker fürs
      Ganze (siehe Schritt 3) — jeder Ort ein eigener Haupt-Marker direkt auf dem Hintergrund
- [ ] Bei neuer Örtlichkeit: `js/<name>_scenes.js` erstellt, Registry-Einträge in `karte.html`
      (`MAP_REGISTRY`) UND `js/regie_vault.js` (`getAllSceneEntries`/`getSceneLabel`/
      `getMarkersForScene`) ergänzt, Script-Include in beiden HTML-Dateien
- [ ] `js/regie.js`: `ORTE[ortId]` mit `interaktionen` befüllt, jeder Trigger hat `id`/`label`/
      `info`
- [ ] Bei Mehrfachvorkommen desselben Orts in mehreren Szenen: `nurSzenen`/`nichtInSzenen`/
      `szenenUeberschreibungen` korrekt gesetzt
- [ ] Neue Bilder durch `tools/optimize_images.py` gelaufen (siehe Skill `pnp-assets`)
- [ ] Mit `pnp-safe-test`-Methode offline geprüft, dass die neue Szene im Admin-Panel und in
      `karte.html` ohne Fehler erscheint
