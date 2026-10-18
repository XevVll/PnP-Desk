# Eine Aufgabe für die Gruppe: Schiff vor dem Sturm

**Arbeitsdokument, kein Kanon.** Es sammelt den gemessenen IST-Zustand, die Randbedingungen
und die Entscheidungen, die Hendrik treffen muss — damit die Aufgabe entschieden und dann
gebaut werden kann. Was hier als Vorschlag steht, ist als Vorschlag gekennzeichnet.

Betroffene Szenen: **`2.1` Golden Lion (Basis)** und **`3.1` Golden Lion im Sturm**
(`js/golden_lion_scenes.js`, `js/regie.js`). Bibel §6.1, §6.2, §10.1–10.11.

---

## 1. Der Auftrag

> „Ich würde gerne das Schiff und den Sturm etwas mehr streamlinen bzw. den Spielern eine
> Aufgabe geben, die in ihrer freien Zeit bzw. vor allem im Sturm zu lösen ist."
> — Hendrik, 17.10.2026

Zwei Dinge, die zusammenhängen, aber nicht dasselbe sind:

1. **Eine Aufgabe**, die in der freien Zeit anläuft und spätestens im Sturm zählt.
2. **Streamlinen** — der Sturm hat vier Aufgaben, die nebeneinander herlaufen und
   voneinander nichts wissen.

---

## 2. Der IST-Zustand, gemessen

### 2.1 — elf Interaktionen, keine davon eine Aufgabe

| Ort | Interaktion | Was es ist |
|---|---|---|
| Achterdeck | `knoten_streich` | Toms Streich, Reaktion entscheidet Ruf |
| Achterdeck | `ruder_halten` | Segeln-Probe, wenn jemand losläuft |
| Oberdeck | `einschaetzungen` | Francesco über die Crew — reine Charakterinfo |
| Bug | `bordell_nachklang` | Rückwirkung aus Grimsgate |
| Batteriedeck | `dirk_vertrauen` | Dirk merkt sich einen Spieler, **Payoff nach dem Sturm** |
| Batteriedeck | `trewin_kater` | Rückwirkung aus dem Trinkwettbewerb |
| Werkstatt | `eingespannt` | Erster Spieler wird eingespannt, Handwerks-Probe |
| Unterdeck | `durchqueren` | Heimlichkeit-Probe beim Durchgehen |
| Frachtraum | `blinder_passagier` | Fund mit vier Folgen (Zeit-Trigger T+30) |
| Frachtraum | `knoten_streich` | Landepunkt von Toms Streich |
| Kombüse | `standardverhalten` | **0 Trigger** — leere Interaktion |

Alles davon ist **Reaktion, Charaktermoment oder Einzelwurf**. Keine Aufgabe, die über
mehrere Orte läuft, keine, die über die Zeit anwächst, keine, die der Sturm einlöst.

Das Spielwiesen-Muster mit acht kleinen Wettbewerben (Würfelspiel, Knotenwettstreit,
Weitspucken, Schnitzen, Blindverkostung, Kartenrunde) steht erst in **`5.1`** — also auf der
**Rückfahrt**, nicht auf der Hinfahrt.

### 3.1 — vier Aufgaben, parallel und unverbunden

| Ort | Aufgabe | Probe (noch im alten System) |
|---|---|---|
| Oberdeck | Cormac schickt die zwei Geschicktesten ins Rigg | Geschick+10, Körper zum Festhalten |
| Oberdeck | Ned rutscht übers Deck, auffangen | **[OFFEN]** Körper *oder* Geschick |
| Batteriedeck | Losgerissene Kanone, 3 kumulative Erfolge | Körper |
| Frachtraum | Wassereinbruch: pumpen + abdichten | Körper, dann Mechanik/Geschick |

Dazu drei reine Erzählmomente (Toms Lotsen am Ruder, der Sturm-Höhepunkt, Harwicks
vielsagende Blicke) und Wats Rettung.

### Das Zeitfenster ist hart — und knapp

Bibel §6.1:

- **T+30** Wat findet den blinden Passagier, falls die Spieler es nicht getan haben
- **T+60** Der Sturm beginnt
- ausdrücklich: *„Beide Zeitfenster sind bewusst zu knapp, damit realistisch niemand alles
  findet."*

Die freie Zeit ist also **eine reale Stunde**, und sie ist schon jetzt überbucht. Eine
Aufgabe, die eine halbe Stunde Aufmerksamkeit braucht, hat keinen Platz.

---

## 3. Die Bibel nennt die Aufgabe bereits — gebaut ist sie nicht

Bibel §6.2, Abschnitt Szenen-Trigger, wörtlich:

> Leitbeispiel: **Mundharmonika** eines Matrosen finden → zurückbringen ergibt
> Dankbarkeit/Fest mit Musik; einstecken kann als Diebstahl ausgelegt werden. Moralisch
> neutral, erzeugt organische Spannung innerhalb der Gruppe.

**Im gesamten Repo kommt „Mundharmonika" genau einmal vor: in dieser Zeile.** Nicht in
`js/regie.js`, nicht in den Szenendateien, nirgends im Code.

Das ist der Befund, der diesen Auftrag am stärksten trägt: Das Leitbeispiel für einen
Szenen-Trigger auf dem Schiff steht seit Monaten in der Bibel und ist nie umgesetzt worden.
Es ist Hendriks eigener Entwurf, nicht erfunden, und es hat genau die Form, die hier fehlt —
Fund in der freien Zeit, Entscheidung in der Gruppe, Einlösung später.

**Nicht verfügbar** als Kandidat: **Dirks kniffliges Problem**. Bibel §10.4 legt ausdrücklich
fest, dass sein Payoff **nach** dem Sturm liegt, und korrigiert dort eine frühere Fassung, die
„in der Sturm-Szene" sagte. Es bleibt ein eigener, noch auszuarbeitender Programmpunkt — aber
hinter dem Sturm, nicht davor.

---

## 4. Randbedingungen, die eine Aufgabe erfüllen muss

Abgeleitet aus Bibel und bestehendem Material, nicht aus Geschmack:

1. **Sie muss in Minuten laufen, nicht in einer halben Stunde.** Eine reale Stunde, in der
   schon elf Interaktionen und der blinde Passagier liegen.
2. **Sie darf nicht scheitern können, ohne dass es weitergeht.** Der Sturm kommt bei T+60,
   unabhängig vom Spielerhandeln (§6.1). Eine Aufgabe, die gelöst sein *muss*, blockiert.
3. **Sie muss ohne sie gelesen werden können.** Wer sie gar nicht anfasst, soll nichts
   vermissen — nur weniger haben.
4. **Sie gehört mehreren.** „Organische Spannung innerhalb der Gruppe" (§6.2) heißt: die
   Entscheidung darüber fällt zwischen Spielern, nicht zwischen Spieler und Regel.
5. **Keine Namen im Sturm-Chaos.** Bibel §10.11 hält das als Design-Prinzip fest — zahlt die
   Aufgabe im Sturm aus, darf sie dort niemanden benennen, der dort nicht ohnehin steht
   (Cormac, Ned, Tom).
6. **Deutung bleibt bei den Spielern.** Design-Regel 2.8: Ortstexte geben Beobachtung, keine
   Handlungsaufträge. Die Aufgabe darf nirgends als Auftrag an einer Wand hängen.

---

## 5. Technisch ist alles schon da

Eine Aufgabe dieser Größe braucht **keine neue Mechanik und keine Firebase-Regeländerung**.
Verfügbar in `SITZUNGS_PFADE` (liegt also unter `sitzungen/{sid}/stand/`):

| Baustein | Was er leistet |
|---|---|
| `questDone/{szene}/{triggerId}` | Haken je Trigger, überlebt Neuladen — der Fortschritt der Aufgabe |
| `hiddenMarkersLive` | Ort live ein-/ausblenden |
| `markerVariant` | Bildvariante je Ort (der Frachtraum hat schon `standard`/`leer`) |
| `gmTimer` | Stoppuhr der Spielleitung — trägt die T+30/T+60-Achse bereits |
| `eigeneWaren` + `figuren/{pid}/zuteilung` | Die Spielleitung erfindet einen Gegenstand und übergibt ihn ins Postfach |
| `pcRuf` | Ruf je Spieler |

Ein Fundstück ist damit eine `sl_`-Ware, die die Spielleitung anlegt und übergibt; der
Fortschritt sind Trigger-Haken. Mehr ist nicht nötig.

**Trigger-IDs bleiben, was sie sind.** Sie liegen als `questDone/{szene}/{triggerId}` in
Firebase; ein umbenannter Trigger nimmt der laufenden Kampagne lautlos ihre Haken.

---

## 6. Kandidatenraum — drei Formen, nicht drei Geschichten

Vorschläge. Die Entscheidung gehört Hendrik.

### Form A — Fund und Rückgabe *(fertig im Kanon)*
Die **Mundharmonika** aus §6.2. Liegt irgendwo auf dem Schiff, gehört einem namentlich
unbekannten Matrosen. Zurückbringen oder behalten — beides geht, beides hat Folgen.
Einlösung nach dem Sturm, wenn die Crew wieder Luft hat (das Fest mit Musik).
**Vorteil:** Es ist Hendriks eigener Entwurf, erfüllt alle sechs Randbedingungen, und die
Einlösung liegt genau dort, wo bisher nichts steht.
**Zu klären:** wer der Matrose ist (es gibt vierzehn Mannschafts-Extras in `js/npcs.js`), wo
sie liegt und was sie im Sturm bedeutet — oder ob sie den Sturm bewusst überspringt.

### Form B — Vorbereitung, die im Sturm zählt
Der Sturm sagt selbst, was er braucht: **Planken aus der Werkstatt** (Wassereinbruch),
Pumpen, eine Kanone, die nicht gesichert ist. Wer vorher aufgeräumt, befestigt oder
nachgefragt hat, hat im Sturm eine Aufgabe weniger oder einen Bonus.
**Vorteil:** verbindet die beiden Szenen, ohne eine neue Geschichte zu erfinden — die
Gegenstände stehen schon in `3.1`.
**Haken:** Es belohnt Vorsicht, und das ist schwer zu vermitteln, ohne es anzukündigen
(Design-Regel 2.8). Außerdem würde es den Sturm leichter machen, nicht reicher.

### Form C — laufende Beobachtung
Über mehrere Orte verteilte Kleinbeobachtungen, die erst zusammen etwas ergeben. Das Muster
existiert schon zweimal: `die_bedrohliche_stimmung` auf der Riffinsel (Geräusche setzen aus,
Bewegung in den Wipfeln) und `harwick_blicke_sturm` im Sturm selbst.
**Vorteil:** passt zum Zeit-Trigger-Ziel aus §6.1 — die Spieler sollen das Muster selbst
durchschauen.
**Haken:** Es ist keine Aufgabe, die man *löst*, sondern eine, die man *merkt*. Ob das
Hendriks „Aufgabe" meint, ist offen.

---

## 7. Was entschieden werden muss

1. **Welche Form** — A, B, C oder etwas anderes.
2. **Wird die Mundharmonika gebaut, wie sie in §6.2 steht**, oder ist das Leitbeispiel
   inzwischen überholt?
3. **Zahlt die Aufgabe IM Sturm aus oder NACH dem Sturm?** Der Auftrag sagt „vor allem im
   Sturm"; §10.11 sagt, dass der Sturm niemanden benennt, der dort nicht steht, und Dirks
   Payoff liegt bewusst dahinter. Beides gleichzeitig geht nicht ohne eine Entscheidung.
4. **Was heißt „streamlinen" für die vier Sturm-Aufgaben?** Weniger werden? Aufeinander
   aufbauen? Oder bleibt es bei vier, und nur die neue Aufgabe verbindet sie?

---

## 8. Was beim Bauen mitgezogen werden muss

Das steht unabhängig von der Aufgabe im Weg und ist fällig, sobald diese Szenen angefasst
werden:

1. **`2.1` und `3.1` rechnen noch nach dem alten Wertesystem** (Körper, Geschick, Mechanik,
   Seefahrt, Geheim, Wahrnehmung). Am Tisch werden Werte vorgelesen, die auf keinem
   Charakterbogen stehen. Die Golden-Lion-Gruppe (`2.1`/`3.1`/`5.1`/`6.1`/`10.1`/`12.1`) teilt
   sich dieselben Orte und ist in einem Durchgang erledigt; `tests/t_szenen.js` führt die Liste
   `UMGESTELLT` mit, die dabei wächst. Schablone ist Grimsgate (Changelog 16.10.2026).
2. **`3.1` hat kein `uebergeordnetesZiel` und keine `stimmung`** — die einzige Szene im
   Projekt ohne beides. Das Regie-Panel sagt für den Sturm nicht, worum es geht. (`2.1` und
   `9.1` fehlt das Ziel ebenfalls, Stimmung haben sie.)
3. **Sechs `[OFFEN]` stecken in den zwei Oberdeck-Aufgaben:** Cormac-Segel-Misserfolg, Neds
   Probe (Körper *oder* Geschick), Ned-nicht-aufgefangen. Genau die Stellen, an denen am Tisch
   eine Entscheidung fällig wird.
4. **Echter Widerspruch:** Der Wassereinbruch verlangt „Planken aus der Werkstatt holen" — die
   **Werkstatt steht in `3.1` auf `hiddenMarkers`**. Auf der Spielerkarte gibt es den Ort im
   Sturm nicht. Entweder ist die Nachfrage rein verbal gemeint (dann sollte es dastehen), oder
   der Marker muss sichtbar werden.
5. **`kombuese.standardverhalten` hat 0 Trigger** — eine leere Interaktion, die in jeder Szene
   auftaucht.

---

## 9. Fertig ist es, wenn

- Die Aufgabe steht in `js/regie.js` als Interaktion mit `nurSzenen`, Triggern und `kurz`.
- Sie läuft in der freien Zeit an und ist in `3.1` **oder** danach eingelöst — entschieden,
  nicht beides offen.
- Wer sie ignoriert, kommt durch die Szene, ohne etwas zu vermissen.
- Beide Szenen rechnen nach dem neuen Wertesystem, `UMGESTELLT` in `tests/t_szenen.js` ist
  gewachsen, und die Prüfung läuft grün.
- `3.1` hat ein `uebergeordnetesZiel` und eine `stimmung`.
- Der Werkstatt-Widerspruch ist aufgelöst.
- Die sechs `[OFFEN]` sind entschieden oder als bewusst offen gekennzeichnet.
- Die Trigger-IDs der bestehenden Interaktionen sind unverändert.
