# Ein PDF-Abenteuer ins PnP-Desk bringen (Arbeitsdokument)

Stand: 27.11.2026. **Kein Kanon und noch kein Skill.** Hier sammeln wir, was beim ersten Abenteuer
(Pilot: *Come Drown With Me*, One Shots of the Reikland, S. 4–9) wirklich anfällt. Erst wenn der
Pilot steht und ein zweites Abenteuer ihn bestätigt hat, wird daraus ein Skill.

## Feste Entscheidungen

- **Wir schreiben das Abenteuer auf Deutsch um.** Kein Buchtext, keine Originaldaten. Werte und
  Mechanik (Proben, Schwierigkeiten, NSC-Profile) sind Spielregeln und werden übernommen.
  Bilder: noch offen (Hendrik, 27.11.2026).
- **Jedes Abenteuer liegt getrennt** in `abenteuer/{id}/` und ist mit `js/abenteuer.js`
  angemeldet. Eine Sitzung sieht nur die Szenen ihres Abenteuers. Das Abenteuer hängt am
  **Spiel** (`spiele/{id}/abenteuer`), nicht an der Sitzung. Ein Spiel ohne Feld ist Korsaren.
- **Jedes Abenteuer gehört zu genau einem Regelwerk** (`ABENTEUER[id].regelwerk`). Ein Spiel
  wählt erst das Regelwerk, dann eines seiner Abenteuer; die Sitzung übernimmt das Regelwerk
  vom Spiel und hat keine eigene Wahl mehr (Hendrik, 27.11.2026).
- **Jede Kennung trägt ein Präfix** (`hk1.1`, `hk_kueche`). Ein Zusammenstoß mit einem
  anderen Abenteuer bricht beim Laden ab, statt still zu überschreiben.
- **Eine Örtlichkeit, Zustände über live verborgene Marker** (etwa das Grab, bis der Boden
  aufgerissen ist), statt einer eigenen Szene je Abschnitt.
- **Regeln, die das PnP-Desk noch nicht kennt** (Zustände, Furcht, Ertrinken, Zauber),
  stehen als SL-Text am Trigger, mit Seitenverweis aufs Regelwerk. Gebaut werden sie in den
  Etappen B und C (`WFRP-REGELWERK.md`).

## Schritt 1: Das PDF lesen

1. Abschnitt finden (Inhaltsverzeichnis, `pypdf`-Lesezeichen) und den Text ziehen
   (`pdftotext -enc UTF-8`).
2. **Die Seiten zusätzlich als Bild ansehen** (PyMuPDF, 80 dpi). Beim reinen Textauslesen
   laufen Spalten und Kästen durcheinander. Im Pilot stand ein Satz aus Teil 1 mitten in
   einem anderen Absatz.
3. Querverweise auf andere Bücher nachschlagen. Der Pilot verweist auf *Buildings of the
   Reikland*, S. 10. Dort stehen der Grundriss, Hintergrund zur Hauptfigur und weitere
   Aufhänger.

## Schritt 2: Bestand aufnehmen

Eine Tabelle je Sorte. Im Pilot:

| Sorte | Was dazugehört |
|---|---|
| Ablauf | Teile, Übergänge, Rückfall, falls die Gruppe hängen bleibt |
| Orte | Raumnummern aus dem Plan, **und Orte, die nur im Text vorkommen** (Flur/Treppe hat keine Nummer und ist der wichtigste Ort) |
| Proben | Fertigkeit, Schwierigkeit, Folge. Im Pilot 19 |
| Lösungswege | alle Wege zum Ziel, und welcher Hinweis wohin zeigt |
| SL-Hinweise | Hintergrund, Druckmittel, Ausgänge |
| NSC | Profil, Eigenschaften, Fertigkeiten, Besitz. **Fehlende Werte notieren** (Zombies nur als Verweis aufs Regelwerk) |
| Belohnungen | EP-Liste, Beute |
| Bilder | was es im PDF gibt und was fehlt |
| Regelverweise | alles, was das PnP-Desk noch nicht abbildet |

## Schritt 3: Abbilden

| Im Buch | Im PnP-Desk |
|---|---|
| ein Schauplatz | eine Szene in `abenteuer/{id}/szenen.js` |
| Raum / Ort | Marker mit Präfix |
| verborgener Ort | Marker, live verborgen (`hiddenMarkersLive`) |
| Abschnitt, Ereignis | Interaktion mit Triggern in `abenteuer/{id}/regie.js` |
| Probe | Trigger mit WFRP-Schreibweise und deutschem Fertigkeitsnamen aus `js/wfrp_daten.js` |
| Hintergrund, Druck | `uebergeordnetesZiel`, `stimmung`, `ortHinweis` |

## [OFFEN]

- **NSC-Blätter im WFRP-Format.** `js/npcs.js` ist Savage Worlds.
- **Belohnungen** haben noch keinen Ort an der Szene.
- **Bilder:** eigener Grundriss und Porträts, oder Originale nur für den Besitzer?
- **Alle Abenteuer werden immer geladen** und nur gefiltert. Bei vielen Abenteuern sollten
  die Seiten nur die Dateien des laufenden laden.
