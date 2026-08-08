# Arbeitsstand (WIP) — Codex & Schatzinsel-Durchgang

Stand: 2026-08-01. Dieses Dokument hält den laufenden Arbeitsstrang fest, damit wir an genau
dieser Stelle weitermachen können. Rein prozessual/inhaltlich — der Kampagnen-Kanon steht in
`KAMPAGNEN-BIBEL.md`, die technische Projekt-Doku in `CLAUDE.md`.

---

## 1. Worum es geht

Zwei zusammenhängende Stränge:

- **Der Codex** (`codex.html`) — eine neue eigenständige GM-Seite zum **Vorbereiten / Nachschlagen
  / Schmökern** (nicht fürs hektische Tisch-Geschehen). Ausführlicher Fließtext pro Ort/Szene,
  plus abgesetzte historische Einordnungen. Pergament-Optik im Stil von `besatzung.html`, mit
  Kapitel-Navigation (TOC).
- **Der Schatzinsel-Durchgang** — wir gehen die Schatzinsel Station für Station durch (wie damals
  bei Grimsgate): pro Station erst die **Grundstimmung**, dann **wer dort ist** (NPCs + Ghosts).
  Aus diesem gesammelten Material entstehen sowohl das Codex-Kapitel III als auch das
  Szenen-Material im Admin-Panel (`js/regie.js`).

## 2. Arbeitsweise für diesen Strang (wichtig)

- Auf Hendriks ausdrücklichen Wunsch **entwickelt Claude hier Inhalte als Aufschlag** (Stimmungs-
  texte, Ghost-Vorschläge); **Hendrik schärft und segnet ab**. Das ist eine bewusste Abweichung
  von der allgemeinen Regel in `CLAUDE.md` („keine proaktiven Inhaltsvorschläge ohne Anweisung") —
  sie gilt für diesen Strang, weil so beauftragt.
- **Text-Prinzip (Hendrik, zentral):** Stimmungs-/Szenentexte **geben Information und Stimmung** —
  die **Interpretation daraus ist Sache der Spieler**. Also keine vorgekauten Schlüsse, keine
  Deutungs-Labels („mit falschem Unterton"), kein Plot-Wissen, das Spieler noch nicht haben.
  Sensorische/atmosphärische Fakten, aus denen sich die Deutung von selbst ergibt. (Verwandt mit
  Bibel 2.8 „Ort statt Plot".)
- **Codex-Ton (abgesegnet):** lebendiger Fließtext + abgesetzte **„⚓ Historisch"-Kästen** (reale
  Geschichte, faktisch akkurat — Bibel 2.4), klar getrennt vom Fließtext. Etwas mehr Atlas-Tiefe
  als die Tisch-Texte erlaubt, aber der Stimmungs-Kern bleibt informativ.
- **Steckbrief-Felder** (Ghosts & verankerte NPCs): **Name · Rolle · Verfassung · Bedürfnis**.
  Ghosts = generische, szenenweit frei platzierbare Statisten (plot-neutral, reines Atmosphäre-/
  Rollenspiel-Futter). Verankerte NPCs sitzen an einem Ort.

## 3. Was fertig & in `main` gemergt ist

- **Codex Kapitel I – Grimsgate** (Stadt + Orte Heuer, Hafenmeisterei, Lagerhäuser, Markt/Krämer,
  Bordell) — je mit ⚓-Kästen. (PRs #32)
- **Codex Kapitel II – Golden Lion** (Schiff/Geheimnis, An Deck, Kajüte, Batteriedeck, Unter Deck,
  Frachtraum) — je mit ⚓-Kästen. (PR #33)
- **Schiffstyp korrigiert:** Golden Lion ist **kleine Fregatte** (Bibel 3.1: Rang 5/6, ~20–28
  Kanonen, ~120 Mann), NICHT mehr Brigantine/30-Mann. Codex + `besatzung.html` angepasst. (PR #34)
- **Regie-Hinweis** (`.ort-hinweis`) von 12,5 px auf 14 px vergrößert. (PR #32)
- **Schatzinsel Station 1** im Admin-Panel: `SZENEN_REGIE["4.1"]` (Strand-Grundstimmung + 4
  Crew-Ghosts) und `ORTE["schiffswrack"].npcs` (der Schmied). (PR #35)
- **Golden-Lion-Ankunft** (`ORTE.golden_lion`): Ashworth/Harwick/Cormac-Szene am Anleger,
  verknüpft mit Hafenmeisterei/Heuer. **Golden Lion (2.1):** Stimmung + 5 Ghosts für die
  Besatzung.
- **Zurückgebliebenen-Szene am Schiff** (`ORTE.schiffswrack`): Landung, Dirks Sturm-Payoff
  (10.4) eingelöst, loser Balken (Ausweichen-vs-Eingreifen + Erste Hilfe), Wat/Josiah.
- **Dschungelpfad** (`ORTE.zwischenstation`): Metallschmuck-Verbot, Ezra Coombes Ehering,
  Cormacs Beinahe-Verrat, Wildschwein-Vorausdeutung.
- **Dorf-Ankunft** (`ORTE.stammesdorf`): Häuptling Ta'ahal weist Harwick alias "Vanthei"
  öffentlich zurück, Dorf erkennbar gespalten (Thahal-Helfer identifiziert, s.u.).
- **Nachtlager** (`ORTE.lager`): Jagd auf ein Wildschwein (Geschicklichkeits-/Mechanik-Proben).
- **Codex Kapitel III** um "Das Volk der Thahal" erweitert (Höhlenwache, Bevölkerung,
  Baumfrucht-Ökonomie). **Höhlen-Referenzbild** eingebaut.
- Neue eigenständige **Spieler-Demo-Seite** `grimsgate_demo.html` (ohne Golden Lion, ohne
  Firebase).

## 4. Wo wir weitermachen — der Schatzinsel-Durchgang

Die Insel (Szene `4.1`) hat **fünf Stationen** in fester Expeditionsreihenfolge
(`js/schatzinsel_scenes.js`). Stamm = die **Thahal**.

| # | Station (Marker) | Status |
|---|---|---|
| 1 | **Strand / gestrandete Golden Lion** (`schiffswrack`) | ✅ Landung + Zurückgebliebenen-Szene fertig |
| 2 | **Der Pfad zum toten Baum** / Dschungelpfad (`zwischenstation`) | ✅ fertig |
| 3 | **Das Dorf am knorrigen Baum** / Thahal (`stammesdorf`) | ✅ Ankunft/Zurückweisung fertig — weitere Dorf-Interaktionen (Handel/Verhandlung) noch offen |
| 4 | **Nachtlager am Dorfrand** (`lager`) | Jagd-Teil ✅ fertig · **← NÄCHSTER SCHRITT:** Thahal-Kontakt-Szene (Diebstahl/Aufhetzen) noch offen |
| 5 | **Die Wasserhöhle** (`hoehle`) | offen (Referenzbild existiert bereits) |

**Etablierte Namen/Fakten (neu seit 31.07.):**
- **Vanthei** — Thahal-Name/Beiname für Harwick ("Ihr Getreuer"), von den Dorfbewohnern
  geraunt, vom Häuptling öffentlich mit Abscheu benutzt.
- **Ta'ahal** — kein Eigenname, sondern der Titel jedes Thahal-Anführers (von "Thahal"/
  "Bewahrer" abgeleitet, "der, der erhält").
- **Der Thahal-Helfer** = der junge Mann aus der Dorf-Ankunfts-Szene (ruft "Vanthei!", wird
  zurückgehalten) — soll die Gruppe im Nachtlager nachts heimlich kontaktieren. Für die
  Spieler bisher nur als Sympathie erkennbar, kein Name.
- **Ezra Coombe** (bereits als Bordell-Stammgast etabliert) ist der Ehering-Träger im
  Dschungelpfad — trauert um seine tote Frau, kein Widerspruch zum Bordellbesuch (2.2).

**Station 1 im Detail (Ghosts, noch zu schärfen):** **Eliot Pike** (erleichtert/redselig),
**Abel Crane** (erschöpft/verletzt), **Malachi Fenn** (misstraut dem Landstrich), **Sam
Oakley** (Reparatur, keine Zeit — jetzt auch Ziel des losen Balkens). Verankert: **Der
Schmied** am Amboss. Optionaler 5. Ghost weiterhin offen: jemand, der am Waldrand Wasser/
Früchte sammelt.

**Beim Weitermachen:** Thahal-Kontakt-Szene im Nachtlager (Station 4) fertigstellen —
Diebstahl/Aufhetzen-Mechanik ist noch inhaltlich leer, nur die Namen stehen fest. Danach
Station 5 (Höhle) und die übrigen Dorf-Interaktionen.

## 5. Offene Story-Punkte (brauchen Hendriks Entscheidung, an der jeweiligen Station)

- Genaue **Thahal-Kontakt-Szene im Nachtlager** — wie spricht der Helfer die Spieler an, was
  bietet er konkret an, welches Risiko trägt er selbst? Die drei Routen **Diebstahl /
  Aufhetzen / Gewalt** sind weiterhin nur benannt, nicht ausgestaltet. Schwierigkeit legt
  Hendrik am Tisch fest, kein Code-Trigger.
- **Wer beim Wildschwein-Angriff verletzt wird** (passiert auf dem RÜCKweg über den
  Dschungelpfad) — jetzt mit Vorausdeutung versehen (Cormacs "die sind keine Gefahr" beim
  Hinweg), Angriffsszene selbst fehlt noch.
- Weitere Dorf-Interaktionen (Handel/Verhandlung mit dem Häuptling, falls die Spieler das
  direkt versuchen) — bisher nur die Ankunfts-/Zurückweisungsszene geschrieben.
- **Grimsgate/frühe Szenen nach Bibel 2.9 überarbeiten** — zurückgestellt, bis der aktuelle
  Durchgang (Höhle etc.) fertig ist. Wird vor einem zweiten Kampagnendurchlauf mit einer neuen
  Gruppe nötig: übergeordnetes Ziel + mindestens ein explizit ausgesprochener Auftrag pro Szene
  fehlen dort noch (Regel kam erst im August 2026 dazu). Bewusst nicht jetzt schon angegangen,
  siehe Entscheidung vom 2026-08-08.

## 6. Datei-Wegweiser

- **Codex:** `codex.html` — Kapitel als `<section class="chapter">`, TOC oben (Sub-Links pro Ort).
  Muster/Optik: `besatzung.html`. Schatzinsel = noch Platzhalter-Kapitel III.
- **Szenen-Material (GM):** `js/regie.js` — `SZENEN_REGIE[sceneId]` (`stimmung` / `ghosts` /
  optional `charaktere`) und `ORTE[ortId]` (`personen` / `kurz` / `ortHinweis` / `npcs` /
  `interaktionen`). Das Admin-Panel (`regie.html`) rendert beides **generisch** pro Szene/Marker —
  ein neuer `SZENEN_REGIE["4.x"]`- bzw. `ORTE["<markerId>"]`-Eintrag taucht automatisch auf.
- **Schatzinsel-Marker:** `js/schatzinsel_scenes.js` (5 Marker, Reihenfolge im Datei-Kopf).
- **Crew-Steckbriefe:** `besatzung.html`. **Kanon:** `KAMPAGNEN-BIBEL.md` (Schiff 3.1,
  Marker-Prinzip 2.8, Arbeitsweise 17).

## 7. Merge-Flow (wie in dieser Session genutzt)

Branch: `claude/kampagnen-bibel-lesen-6ycozg`. Wegen früherer Squash-Merges liegt der Branch
historisch weit vor `main`, inhaltlich aber = nur die jeweils neuen Dateien. Sauber halten:

```
git fetch origin main
git checkout -B claude/kampagnen-bibel-lesen-6ycozg origin/main
git cherry-pick <neuer-commit>
git push --force-with-lease=<branch>:<remote-head> -u origin <branch>
```

Dann PR gegen `main`, auf Hendriks „merge" warten, **squash**-mergen.
