# Ein PDF-Abenteuer ins PnP-Desk bringen (Arbeitsdokument)

Stand: 28.11.2026. **Kein Kanon und noch kein Skill.** Hier sammeln wir, was beim ersten Abenteuer
(Pilot: *Come Drown With Me*, One Shots of the Reikland, S. 4–9) wirklich anfällt. Erst wenn der
Pilot steht und ein zweites Abenteuer ihn bestätigt hat, wird daraus ein Skill.

**Pilot: fertig umgesetzt** (`abenteuer/hartsklein/`): eine Szene, 12 Orte, 25 Interaktionen,
105 Trigger, vier Figuren mit WFRP-Werten.

## Feste Entscheidungen

- **Wir schreiben das Abenteuer auf Deutsch um.** Kein Buchtext: Ablauf, Proben und Werte sind
  Spielregeln und werden übernommen, die Sätze werden neu geschrieben.
- **Bilder werden aus dem PDF übernommen** (Hendrik, 28.11.2026: „ich möchte die Bilder/Szene
  extrahiert haben, damit diese genutzt werden“). Karte, Grundrisse und Illustrationen.
  Achtung: Das Repo ist öffentlich, die Bilder liegen damit offen im Netz.
- **Jedes Abenteuer liegt getrennt** in `abenteuer/{id}/` und ist mit `js/abenteuer.js`
  angemeldet. Eine Sitzung sieht nur die Szenen ihres Abenteuers.
- **Jedes Abenteuer gehört zu genau einem Regelwerk** (`ABENTEUER[id].regelwerk`). Ein Spiel
  wählt erst das Regelwerk, dann eines seiner Abenteuer; die Sitzung übernimmt das Regelwerk
  vom Spiel (Hendrik, 27.11.2026).
- **Jede Kennung trägt ein Präfix** (`hk1.1`, `hk_kueche`, auch Interaktionen: `hk_abschied`).
  Ein Zusammenstoß mit einem anderen Abenteuer bricht beim Laden ab, statt still zu überschreiben.
- **Eine Örtlichkeit, flach wie Grimsgate:** die Karte als Hintergrund, jeder Raum ein Marker auf
  seiner Nummer im Plan. Kein Container-Marker für „das Haus“.
- **Was die Gruppe erst finden soll, trägt `verborgen: true`** (das Grab). Der Marker ist dann zu
  Beginn ausgeblendet, bis die Spielleitung ihn aufdeckt. Ohne das Feld verrät die Karte die
  Lösung, sobald jemand vergisst, ihn von Hand auszublenden.
- **Regeln, die das PnP-Desk noch nicht rechnet** (Zustände, Furcht, Ertrinken, Zauber), stehen
  als Text am Trigger, mit Seitenverweis aufs Regelwerk. Gebaut werden sie in den Etappen B und
  C (`WFRP-REGELWERK.md`).
- **Eigennamen der Spielwelt bleiben im Original** (Kurgorn Three-Eyes, Unberogen, Black Fire
  Pass, Band of the Three-Eyed, Zaubernamen, Galloping Trots). Allgemeine Begriffe werden deutsch
  (Rabenschar, Klassisch, Erschöpft).

## Schritt 1: Das PDF lesen

1. Abschnitt finden (Inhaltsverzeichnis, `pypdf`-Lesezeichen) und den Text ziehen
   (`pdftotext -enc UTF-8` oder PyMuPDF `get_text()`).
2. **Die Seiten zusätzlich als Bild ansehen** (PyMuPDF, 80 dpi). Beim reinen Textauslesen
   laufen Spalten und Kästen durcheinander. Im Pilot stand ein Satz aus Teil 1 mitten in
   einem anderen Absatz.
3. Querverweise auf andere Bücher nachschlagen. Der Pilot verweist auf *Buildings of the
   Reikland*, S. 10. Dort stehen der Grundriss, Hintergrund zur Hauptfigur und weitere
   Aufhänger.
4. **Werte, die nur als Verweis dastehen, im Regelwerk nachschlagen** (Zombies: S. 328). Ebenso
   jede Seitenangabe für Zustände nachprüfen, nicht aus dem Gedächtnis übernehmen.

## Schritt 2: Bestand aufnehmen

| Sorte | Was dazugehört |
|---|---|
| Ablauf | Teile, Übergänge, Rückfall, falls die Gruppe hängen bleibt |
| Orte | Raumnummern aus dem Plan, **und Orte, die nur im Text vorkommen** (Flur/Treppe hat keine Nummer und ist der wichtigste Ort) |
| Proben | Fertigkeit, Schwierigkeit, Folge. Im Pilot 19 |
| Lösungswege | alle Wege zum Ziel, und welcher Hinweis wohin zeigt |
| SL-Hinweise | Hintergrund, Druckmittel, Ausgänge |
| NSC | Profil, Eigenschaften, Fertigkeiten, Besitz. **Fehlende Werte notieren** |
| Belohnungen | EP-Liste, Beute |
| Bilder | was es im PDF gibt und was fehlt |
| Regelverweise | alles, was das PnP-Desk noch nicht abbildet |

## Schritt 3: Bilder aus dem PDF

1. Alle Bilder einer Seite mit Lage ansehen: `page.get_image_info()` (PyMuPDF).
2. **Eine Karte nicht als Einzelbild ziehen, sondern die Seite rendern.** Im PDF liegt sie oft in
   mehreren Ebenen: Das einzeln gezogene Bild der Hartsklein-Karte hatte kein Haus. Gerendert
   wird der Ausschnitt mit `page.get_pixmap(clip=Rect, dpi=300)`.
3. Für die Marker Ausschnitte aus derselben Karte schneiden (Grundriss Erdgeschoss,
   Obergeschoss, Außenansicht, Schleuse), dazu die freistehenden Illustrationen.
4. Namen: Kartenbild in `MAP_NAMES` von `tools/optimize_images.py` eintragen (sonst 900 px statt
   1920), Ausschnitte mit `interior_`-Präfix. Dann umwandeln, die PNGs löschen.

## Schritt 4: Abbilden

| Im Buch | Im PnP-Desk |
|---|---|
| ein Schauplatz | eine Szene in `abenteuer/{id}/szenen.js` |
| Raum / Ort | Marker mit Präfix, auf seiner Nummer im Plan |
| verborgener Ort | Marker mit `verborgen: true` |
| Zustand eines Orts (die Toten steigen auf) | `variants` am Marker, die Spielleitung schaltet um |
| Abschnitt, Ereignis | Interaktion mit Triggern in `abenteuer/{id}/regie.js` |
| Ereignis ohne festen Raum | an den Ort, an dem es spielt oder auf den es hinweist |
| Probe | Text „Fertigkeit, Schwierigkeit (+n)“, Namen aus `js/wfrp_daten.js` |
| NSC | `npcs` am Ort, mit Feld `wfrp` (Profil, Eigenschaften, Fertigkeiten, Zauber, Besitz); einmal als Variable, an mehreren Orten verwendet |
| Belohnungen | eine Interaktion „Ausgang und Belohnung“, jede EP-Zeile ein Trigger zum Abhaken |
| „Getting Started“, Zusammenfassung | **erste Interaktion am Startort** „Einleitung: Worum es geht“: was wirklich los ist (nur SL), der Ablauf in einem Satz, Gründe für die Anwesenheit der Gruppe, ein Einstieg zum Vorlesen |
| benannte NSC mit Beziehung | `abenteuerFigurenRegistrieren(id, { figuren, portraits })` am Ende von `regie.js`. Sonst zeigt die Charakterleiste der Regie die Korsaren-Crew. Gegner ohne Ruf (Zombies, Raben) gehören nicht hinein |
| Hintergrund, Druck | `uebergeordnetesZiel` (kurz!), `stimmung`, `ortHinweis` |

## Schritt 5: Prüfen

`tests/t_abenteuer.js`, Block 8, zeigt das Muster: jeder Marker hat eine GM-Seite, jedes Bild
liegt in `images/`, Trigger sind eindeutig, kein `[OFFEN]` bleibt stehen, und **jede Probe im Text
nennt eine echte WFRP-Fertigkeit mit der richtigen Zahl** zur Schwierigkeit.

## [OFFEN]

- **Alle Abenteuer werden immer geladen** und nur gefiltert. Bei vielen Abenteuern sollten
  die Seiten nur die Dateien des laufenden laden.
- **Kein Probekampf in WFRP:** Arena und Kampfmodus rechnen Savage Worlds. Kämpfe gegen die
  Toten und Kurgorn laufen am Tisch, die Werte stehen im Steckbrief.
- **Keine Porträts für Henrietta und Kurgorn**, das PDF hat keine. Die Porträtleiste der
  Spielerkarte bleibt in der Hartsklein-Schleuse deshalb leer.
