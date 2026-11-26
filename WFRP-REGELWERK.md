# Warhammer Fantasy Rollenspiel (4. Edition) im PnP-Desk

Stand: 26.11.2026, **Etappe A** (Regelkern, Daten, Erschaffung, Heldenbrief, Würfelleiste).
Vor jeder Arbeit an diesem Strang lesen.

## Was es gibt

Eine Sitzung läuft entweder nach **Savage Worlds** (Korsaren) oder nach **Warhammer Fantasy**.
Die Spielleitung wählt das Regelwerk beim Anlegen der Sitzung im Regie-Hub. Solange noch keine
Figur existiert, lässt es sich dort umstellen.

| Datei | Inhalt |
|---|---|
| `js/wfrp_daten.js` | Spezies, Klassen, 64 Karrieren × 4 Stufen, 45 Fertigkeiten, 167 Talente, Tabellen |
| `js/wfrp_regelwerk.js` | Probe, Erfolgsgrade, Trefferzone, Werte der Figur, EP-Kosten, Karriere |
| `js/wfrp_erschaffung.js` | Logik der Erschaffung (EP-Boni, was noch fehlt, Figur aus den Entscheidungen) |
| `wfrp_erschaffung.html` | der Assistent, 8 Schritte |
| `wfrp_heldenbrief.html` | Bogen, Steigerung, Ausrüstung |
| `tests/t_wfrp.js` | Regelkern und Daten gegen das Buch |
| `tests/t_wfrp_seiten.js` | beide Seiten und die Würfelleiste wirklich ausgeführt |

Angepasst wurden außerdem: `js/sitzung.js` (Regelwerk der Sitzung, Weiche), `regie_hub.html`
(Auswahl), `index.html` (Kacheln), `charaktererstellung.html` / `heldenbrief.html` (Weiche),
`js/dice.js` (W100-Modus der Leiste), `karte.html` (WFRP-Figur, Würfelweg, Laden),
`regie_figuren.html` (WFRP-Karte). Arena und Kampfmodus der Regie lassen WFRP-Figuren bewusst
draußen, beide rechnen Savage Worlds.

## Die Weiche

Die Figurenseiten gibt es je Regelwerk einmal. Jede fragt beim Laden das Regelwerk der Sitzung ab
(`regelwerkPruefen`) und leitet, falls sie die falsche ist, weiter (`regelwerkWeiter`), und zwar
**bevor** sie etwas schreibt. Eine Savage-Worlds-Seite, die eine WFRP-Figur liest, würde sonst ihre
eigenen Felder hineinschreiben. Alle Links im Projekt bleiben dadurch unverändert.

Figuren liegen wie bisher unter `sitzungen/{sid}/stand/figuren/{Spielername}`. Eine WFRP-Figur
trägt `regelwerk: 'wfrp4'`. Es gibt keinen neuen Firebase-Pfad und keine Regeländerung.

## Herkunft der Daten

Einmal aus dem Regelwerk ausgelesen (PDF Version 4, im Ordner `PNP/Warhammer Fantasy/01 Regelwerk`).
Die Errata vom 28. Februar sind eingearbeitet. Die meisten standen schon im PDF, die übrigen wurden
beim Auslesen angewendet und sind in `tests/t_wfrp.js` stichprobenhaft festgenagelt. Seither werden
die Daten **in der JS-Datei gepflegt**. Das Ausleseskript lag im Scratchpad und gehört nicht ins
Repo, weil es den Buchtext verarbeitet.

- **Die Attributsschemata der Karrieren** (welches Attribut ab welcher Stufe steigt) stehen im
  Buch als farbige Symbole und gehen beim Textauslesen verloren. Sie wurden über die Hintergrundfarbe
  der Tabellenzellen bestimmt. Gelb heißt Stufe 2, Grau Stufe 3, Kupfer Stufe 4. Drei Karrieren sind
  von Hand gegen das Bild geprüft.
- **Gesichert durch Eigenschaften, die das Buch garantiert:** Jede Wurftabelle deckt 01–00 genau
  einmal ab, jedes Schema hat dreimal Stufe 1 und je einmal 2/3/4, jede Stufe hat vier Talente, die
  erste Stufe acht Fertigkeiten. Ein Lesefehler, der gültig aussieht, fällt dort auf.

## Urheberrecht

Das Repo ist **öffentlich**. Hier stehen Mechanik und Namen, also welche Karriere was steigern darf,
Werte und Tabellen. Die **Beschreibungen der Talente sind eigene Kurzfassungen** der Wirkung, kein
Buchtext. Abenteuertexte aus den gekauften Büchern gehören nicht hierher (Gespräch vom 25.11.2026).

## Deutsch, mit dem Original daneben

Hendriks Entscheidung vom 26.11.2026: **deutsche Begriffe**. Die Übersetzung ist unsere eigene. Sie
deckt sich nicht zwangsläufig mit der deutschen Ausgabe von Ulisses, deren Begriffe uns nicht
vorliegen. Jeder Eintrag trägt deshalb sein englisches Original im Feld `en`, damit man im Buch
nachschlagen kann. Abweichungen zur offiziellen Ausgabe sind eine Zeile in `js/wfrp_daten.js`.

| Kürzel | Attribut | Buch |
|---|---|---|
| KG | Kampfgeschick | WS |
| BF | Ballistische Fertigkeit | BS |
| ST | Stärke | S |
| WI | Widerstand | T |
| I | Initiative | I |
| GW | Gewandtheit | Ag |
| GS | Geschicklichkeit | Dex |
| IN | Intelligenz | Int |
| WK | Willenskraft | WP |
| CH | Charisma | Fel |

**Warhammer-Eigennamen bleiben im Original** (Hendriks Entscheidung, ebenfalls 26.11.2026):
Wortschöpfungen der Spielwelt werden nicht übersetzt – Weirdroot, Heartkill, Demigryph, Great Wolf,
Wolfship, Grey Order, Shipsword, Huffer, Greenfish, Battle Tongue, Wastelander, Mootish, dazu
ohnehin Altdorf, Reikland, Khazalid, Eltharin, die Winde der Magie, Wyrd, Slayer. Deutsch sind nur
allgemeine Begriffe (Kampfgeschick, Schleichen, Advokat) und Ländersprachen (Bretonisch,
Tileanisch, Estalisch). `tests/t_wfrp.js` prüft, dass die Eigennamen so bleiben.

Weitere Begriffe: Erfolgsgrade (EG) = Success Levels, Lebenspunkte = Wounds, Schicksal/Glück =
Fate/Fortune, Zähigkeit/Entschlossenheit = Resilience/Resolve, Status Messing/Silber/Gold =
Brass/Silver/Gold, Währung GK/S/P = Goldkrone/Silberschilling/Messingpfennig.

## Regeln, wie sie umgesetzt sind

- **Probe:** W100 ≤ Wert + Schwierigkeit. EG = Zehner des Werts − Zehner des Wurfs. 01–05 gelingt
  immer (mindestens +1 EG), 96–00 misslingt immer (höchstens −1 EG). 00 zählt als 100.
- **+0 und −0** sind verschiedene Ergebnisse (knapper Erfolg/Misserfolg). Jedes Ergebnis trägt
  deshalb `ok` mit, die Zahl allein reicht nicht.
- **Pasch** wird angezeigt (im Kampf kritisch bzw. Patzer). Die Zusatzregel, das auch außerhalb des
  Kampfes zu werten, ist nicht eingebaut.
- **Vergleichend:** mehr EG gewinnt, dann der höhere Wert, sonst Patt.
- **Glück:** je Probe einmal entweder neu würfeln (nur bei Misserfolg) oder +1 EG.
- **EP:** Preis der nächsten Steigerung nach Zahl der bisherigen (je fünf eine Preisstufe),
  außerhalb der Karriere doppelt. Talente kosten 100 × (bisherige Stufen + 1), nur aus der
  aktuellen Karrierestufe.
- **Karriere:** Fertigkeiten aller Stufen bis zur aktuellen, Talente nur der aktuellen. Abschluss
  verlangt 5 × Stufe Steigerungen in allen Attributen der Stufe und in acht Fertigkeiten, dazu ein
  Talent der Stufe. Wechsel kostet 100 EP (abgeschlossen) oder 200 EP, in eine andere Klasse
  100 mehr.
- **Erschaffung:** Spezies gewürfelt +20 EP, Karriere erster Wurf +50 oder eine von dreien +25,
  Attribute so behalten +50 oder getauscht +25. Die Bonus-EP gibt man im Heldenbrief aus.

## Bewusst nicht umgesetzt (Etappe A)

- **Optionale Regeln** des Buchs: Proben über 100 %, schnelle EG, Kritisch/Patzer außerhalb des Kampfes.
- **Status-Auswirkungen** auf Proben, Verdienen zwischen Abenteuern (Endeavours), Verderbnis,
  Krankheiten, Psychologie.
- **Talentwirkungen** rechnet der Bogen nur dort mit, wo sie Werte ändern: +5-Talente, Zäh,
  Leichtfüßig, Glück, Willensstark, Stämmig, Starker Rücken. Alles andere steht als Text am Talent,
  und die Spielleitung wendet es an.

## [OFFEN] Nächste Etappen

- **B – Kampf:** Waffen und Rüstungen als Daten, Vorteil, Trefferzone mit Rüstung, kritische
  Wunden, Zustände. Danach der Kampfmodus der Regie für WFRP.
- **C – Magie und Glaube:** Winde, Zauberlisten, Segnungen, Wunder.
- **Würfe im Protokoll:** WFRP-Würfe gehen in den Feed, aber noch nicht ins Protokoll der Sitzung.
  Die Würfe-Ansicht und der Session-Export lesen Savage-Worlds-Felder.
- **Anforderung durch die Spielleitung:** Die Wertchips in `regie_figuren.html` fordern
  Savage-Worlds-Proben an. Eine WFRP-Figur zeigt dort nur ihre Karte.
- **Abenteuer:** auf Hendriks Wunsch vorerst aufgeschoben. Die Gedanken dazu (Pakete als Daten,
  Firebase hinter Anmeldung, gekaufte Inhalte nur für den Besitzer) stehen im Gespräch vom 25.11.2026.
