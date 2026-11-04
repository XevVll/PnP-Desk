# Handbuch: Kampf-Arena für den Endkampf (Szene 15.1)

Ausführliche Dokumentation zur taktischen Kampf-Arena, mit der der Endkampf in der Ritualkammer
gespielt wird. Ziel: nachvollziehbar machen, **wie** sie funktioniert, **warum** sie so gebaut
ist und **wo weitergearbeitet werden muss** — als Referenz für eine Fortsetzung in einer anderen
Session.

Aufgebaut wie das Schwesterdokument [RIFFINSEL-ERKUNDUNGSGRAPH.md](RIFFINSEL-ERKUNDUNGSGRAPH.md).
Technischer Kontext: [CLAUDE.md](CLAUDE.md). Regel- und Story-Kontext:
[KAMPAGNEN-BIBEL.md](KAMPAGNEN-BIBEL.md), Abschnitte 4 (Regelwerk) und 12.1 (Das Finale).

**Stand: 2026-10-30 (Fortsetzung).** Am 30.10.2026 zuerst von W100 auf **Savage Worlds**
umgestellt — die Arena war die letzte Stelle im Projekt, die noch nach dem alten System
rechnete. Am selben Tag dazu **Initiative über das Aktionsdeck** (3.6) und die
**Diener-Automatik** (3.7): Die Reihe bestimmt, wer am Zug ist, und die Wiedergänger gehen von
selbst auf den nächstgelegenen Gegner los — ihr **Weg wird gesucht**, nicht geraten (3.7a).
Die Spielerfiguren kommen seit demselben Tag **aus der Sitzung** statt als
„Spieler 1–4" (5.4), und jeder Spieler steuert **seine eigene** Figur und beendet seinen Zug
selbst (4.1a). Weiterhin **nicht am Tisch erprobt.**

---

## 1. Die wichtigste Regel: die Arena entscheidet nichts Dramatisches

Der eigentliche Ablauf des Finales steht als **sieben Interaktionen** an `ORTE.die_ritualkammer`
(`js/regie.js`), aus einer separaten Inhalts-Session:

```
das_kind_auf_dem_stein → der_beginn_des_rituals → die_ersten_wellen →
wat_und_josiah_fallen → die_zermuerbung → harwicks_anklage →
die_entscheidung_um_den_saebel
```

Die Arena **ersetzt das nicht**. Sie ist die taktische Ebene darunter. Die Kernbeats — Wats und
Josiahs Tod, Harwicks Anklage, die Drei-Wege-Entscheidung um den Säbel — bleiben fest und werden
von der Spielleitung ausgelöst.

> **Die Arena bestimmt nur, wie teuer der Weg dorthin wird, nicht ob diese Beats geschehen.**

Daraus folgt direkt, wie sie gebaut ist:

- **Keine Siegbedingung.** Nichts beendet den Kampf automatisch. Es gibt keinen „Game Over"- und
  keinen „Sieg"-Zustand.
- **Kein Automatismus, der Figuren tötet.** Die SL kann jederzeit HP von Hand setzen — wenn Wat
  und Josiah fallen sollen, fallen sie, unabhängig von den Würfeln.
- **Figuren jederzeit setz- und entfernbar**, auch mitten im Kampf.

Wer hier weiterbaut: **keine automatische Kampfauflösung einbauen.** Das würde dem Finale die
Dramaturgie aus der Hand nehmen.

---

## 2. Dateien und Zuständigkeiten

| Datei | Rolle |
|---|---|
| `js/arena.js` | **Das Brett.** Kein DOM, kein Firebase. Raster, Entfernung, Bewegung, Rundenwechsel, Wiederauferstehung, Nachschub, Jaguar-Säbel — dazu **Initiative** (3.6) und die **Diener-Automatik** (3.7). **Rechnet die Kampfregeln nicht selbst** (siehe 3). |
| `js/regelwerk.js` | Die Probe selbst (`wurf()`), die Würfelstufen, `parade()`/`robustheit()`. |
| `js/kampf.js` | Der Regelkern des Kampfes: `angriffsMod()`, `fernkampfMod()`, `wirkung()`, `schadensWuerfel()` — **und das Aktionsdeck** (`neuesDeck`, `austeilen`, `kartenVergleich`, `jokerBonus`). Dieselbe Datei, die den Kampfmodus in `regie_figuren.html` speist. |
| `js/arena_scenes.js` | Szenen-Definition `15.1`: Feldgröße, Regelwerte, Figuren-Vorlagen. |
| `karte.html` | Spieleransicht: Raster, Figuren, Bewegung/Angriff **nur für Spieler-Figuren nach Freigabe**, Kampf-Log. |
| `arena_admin.html` | **SL-Schlachtfeld** (seit 2026-08-23): eigene Vollbild-Seite für den Kampf. Entität anklicken → auswählen → per Klick bewegen/angreifen, **Initiative-Leiste**, „Nächste Figur", Karten austeilen, Wunden, Säbel, Nachsetzen, Versetzen-Modus, Runde. Zugriffsschutz wie `regie.html` (nur über die bekannte URL). |
| `js/regie_vault.js` | Kompakt-Panel im Adminpanel: Überblick, Initiative-Leiste, „Nächste Figur", Freigabe (nur Spieler-Figuren), Runde, Nachsetzen — verlinkt aufs Schlachtfeld. |
| `regie.html` | Nur die `<script>`-Tags. |

> **⚠ Jede Arena-Seite braucht DREI Script-Tags: `regelwerk.js`, `kampf.js`, `arena.js`.** Die
> Reihenfolge ist beliebig (alle Aufrufe stehen in Funktionen), aber fehlt eines, bricht die
> Arena erst zur **Laufzeit** und still. `arena_admin.html` lud bis zum 30.10.2026 **keines von
> beiden** — das war die erste Baustelle der Umstellung.

Die Trennung der Engine ist Absicht: Die Regeln sind der Teil, der **stimmen muss**, und sie
lassen sich so ohne Browser gegen die Bibel prüfen (siehe Abschnitt 7).

---

## 3. Das Regelwerk (Bibel 4, 4.4a und 4.4b)

**Die tragende Entscheidung der Umstellung: `js/arena.js` rechnet die Regeln nicht selbst.**

Ein dritter Regelkern neben `js/regelwerk.js` und `js/kampf.js` wäre genau der Fehler, gegen den
beide Dateien geschrieben sind — zwei Fassungen derselben Rechnung laufen auseinander, und hier
wäre der Preis, dass das Finale nach anderen Regeln läuft als jeder Kampf davor.

| gebraucht | kommt aus |
|---|---|
| Probe / Angriffswurf | `wurf()` — `js/regelwerk.js` |
| Zielwert Nahkampf | `angriffsMod()` — `js/kampf.js` |
| Entfernungsabzug | `fernkampfMod()` — `js/kampf.js` |
| Schadenswürfel | `schadensWuerfel()` — `js/kampf.js` |
| Schadenswurf (explodierend) | `wuerfelWurf()` — `js/regelwerk.js` |
| Wirkung am Ziel | `wirkung()` — `js/kampf.js` |

In `js/arena.js` bleibt das Brett: Raster, Entfernung, Bewegung, Rundenwechsel — und die drei
Kampagnenregeln, die Savage Worlds nicht kennt: **Wiederauferstehung, Nachschub und der
Jaguar-Säbel** (Bibel 12.1).

### 3.1 Der Angriff

Eine ganz normale Probe (Bibel 4.1): ein Würfel, Ziel 4, explodierend, Wild Die bei Wild Cards.

- **Nahkampf gegen die PARADE des Ziels**, als Modifikator (`4 − Parade`). Gewürfelt wird
  `kaempfen`.
- **Fernkampf NICHT gegen die Parade** — die ist eine Nahkampfgröße. Geschossen wird gegen die
  4, modifiziert allein durch die Entfernung (`fernkampfMod`: Waffenreichweite 0, das Doppelte
  −2, das Vierfache −4, darüber kein Schuss). Gewürfelt wird `schiessen`.
- **Jede Wunde zieht flach 1 ab**, gedeckelt bei 3.

### 3.2 Gang Up — und was aus „Bedrängnis" wurde

**Jeder zusätzliche Angreifer im Nahkampf AM ZIEL gibt +1, höchstens +4.** Jeder Verbündete des
Ziels, der beim Ziel steht, hebt einen Punkt auf. Nur im Nahkampf.

> **⚠ Das ist die GEGENRICHTUNG der alten Hausregel.** Bis zum 30.10.2026 stand hier
> „Bedrängnis": zusätzliche Gegner **neben dem Angreifer** verschoben **dessen** Ergebnis um ein
> Band nach unten — umgeben zu sein machte den eigenen Angriff schlechter. Savage Worlds dreht
> beides um: Es ist ein **Bonus** für den Angreifer, und gezählt wird um das **Ziel**.
>
> In Bibel 4 stand die Regel überhaupt nicht (4.4 kannte nur Erschwernisse, Wunden, Bennies) —
> das war der eigentliche Befund der Umstellung. Sie ist dort als **4.4a** nachgetragen.

**Praktisch ist Gang Up die taktische Antwort auf den Seelenlosen.** Seine Parade 8 kostet jeden
Angriff −4, und genau +4 holt die Gruppe zurück, wenn sie ihn gemeinsam stellt. Gemessen an
einer Figur mit Kämpfen d8 (`tests/t_arena.js` rechnet es nach):

| | Trefferchance |
|---|---|
| allein gegen Parade 8 | **24,7 %** |
| zu fünft um ihn herum (+4) | **81,3 %** |

### 3.3 Schaden und Wirkung

- **Nahkampf: Waffe + Stärke**, Fernkampf **nur die Waffe**; eine Steigerung gibt **+1W6**.
  Alle Würfel explodieren, **kein Wild Die** darauf (Bibel 4.3).
- **Gegen die Robustheit:** darunter nichts · gleich oder darüber **angeschlagen** · je volle 4
  darüber **eine Wunde**. Wer schon angeschlagen ist, nimmt statt des zweiten Hakens eine Wunde.
- **Ein Statist (Diener) trägt KEINE Wunde** — die erste nimmt ihn heraus. Eine Wild Card trägt
  drei.

**HP sind ersatzlos entfallen.** Eine Figur trägt `angeschlagen` und `wunden`; wie viele sie
trägt, entscheidet `wild` bzw. das optionale `wundenMax` am Token.

### 3.4 Angeschlagen

**Angeschlagen kostet die Handlung, nicht den Würfel:** bewegen ja, angreifen nein. Der
Rundenwechsel räumt den Haken ab, die Figur verliert also genau eine Handlung.

> **Bewusste Abweichung.** Savage Worlds würfelt dafür **Willenskraft** zu Beginn des Zuges. Auf
> diesem Brett stehen bis zu einem Dutzend Diener — das wären ein Dutzend Würfe je Runde, nur um
> einen Zustand zu verwalten. Ein **Bennie**, der den Haken sofort wegnimmt, bleibt möglich: Der
> Spieler sagt es an, die SL klickt „Haken weg".

### 3.5 Die sechs bewussten Abweichungen, zusammengefasst

1. **Angeschlagen** ohne Willenskraft-Probe (siehe 3.4).
2. Beim **Gang Up** wird nicht geprüft, ob ein mithelfender Verbündeter selbst gebunden ist —
   die Art Buchhaltung, die das Projekt weglässt (vgl. Bibel 4.5).
3. Der **Wunden-Abzug** ist bei 3 gedeckelt, auch wenn eine Figur mehr tragen kann.
4. **Der Seelenlose trägt sechs Wunden** statt der drei, die Savage Worlds einer Wild Card gibt
   (31.10.2026, Hendriks Vorgabe). Siehe den Kasten darunter.
5. Beim **Schuss aus der Nähe** (4.2a) wird der Fehlschuss in die eigenen Reihen nicht
   ausgewürfelt (*Innocent Bystanders*) — dieselbe Buchhaltung, die schon Nummer 2 weglässt.
6. **Jede Figur hält genau eine Nahkampf- und eine Fernkampfwaffe** (Bibel 4.5a), und das
   **Umhängen kostet keine Handlung**. Savage Worlds kennt keine Ausrüstungs-Slots, und das
   Ziehen einer Waffe kostet dort normalerweise eine Handlung (*Quick Draw* macht es frei).
   Siehe 4.6.

> **Zu Nummer 4.** In Savage Worlds trägt eine Wild Card genau **drei** Wunden, die vierte ist
> *außer Gefecht*; der Weg des Regelwerks für ein Monster, das mehr wegsteckt, ist die
> **Größenklasse** — und Größen bildet dieses Projekt nirgends ab. Ein eigenes Feld
> (`wundenMax` am Token, ausgewertet von `wirkung()` in `js/kampf.js`) war der kleinere Eingriff,
> als eine Größen-Mechanik für genau eine Figur zu bauen.
>
> **Gemessen, warum es nötig war:** Mit drei Wunden schlagen ihn fünf Spieler in **1,7 Runden**
> nieder. Nicht weil er leicht zu treffen wäre — allein 24,5 %, zu fünft 81,4 % —, sondern weil
> ein Treffer, der die Robustheit um 8 übersteigt, nach „je volle 4 darüber" **gleich zwei
> Wunden** macht. Mit sechs sind es 2,6 Runden, mit acht 3,2.
>
> **Die Robustheit ist bewusst NICHT der Hebel** und bleibt bei 8: Eine Wunde braucht dort schon
> 12 Schaden, und Waffe + Stärke (d6 + d8) liegt im Mittel bei 8 — ohne Ass wird er gar nicht
> verwundet. Einen Punkt höher, und er ist gegen eine normale Gruppe praktisch unverwundbar.
> `tests/t_arena.js` hält beides fest, **samt der Gegenrichtung**: Ohne das Feld gilt die Regel
> für alle anderen unverändert, die Abweichung läuft nicht aus.

Alles Weitere — Wiederauferstehung, Nachschub, Säbel — ist **Kampagnenregel**, nicht Abweichung:
Sie steht in Bibel 12.1 und hat in Savage Worlds kein Gegenstück.

---

### 3.6 Initiative — das Aktionsdeck (30.10.2026)

Hendriks Vorgabe: *„Initiative kann über Karten verteilt werden und dann sollte es wirklich
reihum gehen."*

**Das Deck ist DASSELBE wie im Kampfmodus** (`js/kampf.js`: `neuesDeck`, `austeilen`,
`kartenVergleich`, `jokerBonus`). Ein zweites Aktionsdeck hier wäre derselbe Fehler wie ein
zweiter Regelkern. Die Regel selbst steht in **Bibel 4.4b** — sie stand dort bis heute
überhaupt nicht, obwohl das Deck seit dem 15.10.2026 benutzt wird; derselbe Befund wie bei 4.4a.

**Wer eine Karte bekommt, ist die Savage-Worlds-Regel:** jede Wild Card eine eigene, jede
Gegner-SORTE eine gemeinsame.

| Auf dem Brett | Karten |
|---|---|
| `spieler`, `verbuendeter`, `seelenloser` | je **eine eigene** |
| **alle `diener` zusammen** | **EINE** |
| am Boden liegende Figuren | **keine** |

Zwölf Wiedergänger sind damit **ein** Eintrag in der Reihe, nicht zwölf — und genau das ist der
Grund, warum die Leiste am Tisch lesbar bleibt.

**Die Diener-Gruppe hält keine feste Liste.** Welche Figuren auf ihrer Karte handeln, beantwortet
`arenaIniTokens()` erst, wenn die Karte dran ist. Nur so handelt **Nachschub, der mitten in der
Runde erscheint**, noch auf derselben Karte; eine beim Austeilen eingefrorene Liste würde ihn
bis zur nächsten Runde stillstehen lassen.

**„Wirklich reihum" heißt, dass die Runde sich selbst weiterschaltet.** „Nächste Figur ▸" geht
einen Eintrag weiter; ist die Reihe durch, ist das der **Rundenwechsel** — Karten werden neu
ausgeteilt (auf dem Stand **nach** dem Wechsel, sonst bekommen Auferstandene und frischer
Nachschub keine Karte), und die Reihe beginnt von vorn. Ein Eintrag, dessen Figuren alle
gefallen sind, wird **übersprungen**; in der Leiste bleibt er durchgestrichen stehen, damit man
sieht, **wer** gefallen ist.

**Der Joker wirkt wirklich** (+2 auf Wurf **und** Schaden, `arenaIniBonus()` →
`arenaAngriff(..., bonus)`). Ohne diese Stelle wäre die Jokerkarte ein rotes Zeichen in der
Leiste ohne Wirkung — dann könnte man das Deck auch weglassen. Ist er gefallen, wird nach der
Runde neu gemischt; sonst wird das **Restdeck weitergereicht**.

**Die Leiste sehen auch die Spieler** (`karte.html`, unter dem Rundenkopf, nicht anklickbar).
Wer weiß, dass er nach dem Seelenlosen dran ist, kann sich seinen Zug überlegen, statt auf die
Freigabe zu warten. Geschaltet wird ausschließlich auf der SL-Seite.

#### Kein Phantom-Zug (31.10.2026)

`arenaIniAmZug()` liefert **genau den Eintrag, auf dem die Reihe steht** — ohne vorwärts
aufzulösen. Dass der gespeicherte Index auf einen bespielbaren Eintrag zeigt, sichert
`arenaIniLanden()` beim **Schreiben**: Ein übergebener Index wird vorwärts aufgelöst und der
aufgelöste geschrieben; ist ab dort niemand mehr übrig, ist die Runde durch und es wird niemand
freigegeben.

> **Vorher sprang `arenaIniAmZug()` selbst zum nächsten Eintrag mit lebenden Figuren.** Fiel die
> Figur, die gerade handelte, zeigte die Leiste damit sofort die **nächste** als „am Zug", während
> `freigegeben` noch auf der Gefallenen stand — ein Zug, den niemand spielen konnte. Und weil
> „weiter" von dort aus zählte, wurde diese Figur anschließend **übersprungen**. Gemessen: Index 1,
> Bert gefallen → Leiste sagt „Cord", freigegeben ist weiter `b`, und „Nächste Figur" landet hinter
> Cord. Zwei Quellen für „wer ist dran", die auseinanderlaufen.
>
> Bleibt der Fall, dass die Figur **während ihres eigenen Zuges** fällt — dann steht sie
> durchgestrichen als „am Zug" da, und das ist die Wahrheit: Ihr Zug ist vorbei, die Spielleitung
> oder der Spieler schaltet weiter.

### 3.7 Die Wiedergänger handeln von selbst (30.10.2026)

Hendriks Vorgabe: *„Ich steuer den Seelenlosen, aber die kleinen Untoten sollten automatisch auf
den nächstgelegenen gehen."*

Landet die Reihe auf der **Diener-Karte**, handeln sie **sofort und alle** — ein Klick der SL,
ein atomares Update, mehrere Logzeilen. Der Seelenlose bleibt davon **unberührt**; ihn zieht die
SL wie bisher.

**Die Regel ist bewusst dumm, und das ist der Punkt.** Ein Wiedergänger geht auf den
**nächsten** — nicht auf den schwächsten, nicht auf den gefährlichsten, nicht auf den schon
verwundeten. Er sucht sich kein Ziel aus, er geht los. Alles Klügere wäre Taktik, und Taktik
gehört der SL und den Spielern, nicht dem Brett.

| Frage | Antwort |
|---|---|
| Ziel | nächster lebender Gegner (Chebyshev), bei Gleichstand die kleinere Token-Kennung |
| Weg | der **kürzeste gesuchte** Weg bis an das Ziel heran (3.7a) |
| bringt kein Feld etwas | **stehen bleiben** statt hin und her wackeln |
| Angriff | nach der Bewegung, wenn das Ziel angrenzt (Bewegung **und** Handlung, wie bei jeder Figur) |
| angeschlagen | läuft trotzdem los, schlägt aber nicht zu (3.4) |
| hat schon gehandelt | wird übersprungen — ein zweiter Klick wiederholt nichts |

**Die Züge werden SEQUENZIELL gerechnet**, nicht gleichzeitig: `arenaDienerRunde()` schreibt die
Tokenkarte zwischen den Zügen mit `arenaAnwenden()` fort. Ohne das rechnet jeder Diener auf dem
alten Stand — zwei landen auf demselben Feld, und der zweite schlägt auf einen Toten ein. Dafür
steht eine eigene Prüfung da (7).

Daneben steht ein eigener Knopf **„☠ Wiedergänger handeln"** (Schlachtfeld und Kompakt-Panel)
für den Fall, dass die SL sie außerhalb der Reihe braucht.

### 3.7a Der Weg wird gesucht, nicht geraten (30.10.2026, Fortsetzung 4)

Im ersten Anlauf lief die Automatik einen **gierigen Schritt**: das angrenzende freie Feld, das
dem Ziel näher liegt als das eigene. Das stand hier als bewusste Grenze — *„kann vor einer
geschlossenen Reihe hängen bleiben, die SL versetzt sie dann"*.

**Die Begründung trug nicht.** Auf einem Brett, auf dem bis zu einem Dutzend Diener herumsteht,
ist „eine geschlossene Reihe" nicht der Ausnahmefall, sondern der Normalfall, sobald es eng
wird — und eine Automatik, die genau dann aufgibt, wenn sie gebraucht wird, nimmt der
Spielleitung die Arbeit nicht ab, sondern gibt sie ihr zurück.

**`arenaWeg()` sucht jetzt mit einer Breitensuche** den kürzesten Weg bis zu einem Feld, das am
Ziel **angrenzt**; gelaufen werden die ersten `bewegung` Schritte dieses Weges.

- **Breitensuche, nicht A\*.** Das Brett hat 256 Felder — die Heuristik ist gespart. Was zählt,
  ist die Sperrung: besetzte Felder sind Mauern, **das Ziel selbst ist keine** (auf es soll ja
  eingeschlagen werden).
- **Die Nachbarreihenfolge ist fest** (`ARENA_NACHBARN`, gerade Richtungen vor den Diagonalen).
  Sie entscheidet, welcher von mehreren gleich kurzen Wegen gefunden wird, ist also kein Beiwerk:
  Derselbe Stand ergibt immer denselben Weg, und ein Weg, der geradeaus geht, wo er geradeaus
  gehen kann, sieht am Tisch richtig aus.
- **Gibt es gar keinen Weg** (komplett eingemauert), bleibt der gierige Schritt als **Rückfall**
  (`arenaSchrittGierig()`) — lieber ein Feld näher als gar nichts. Steht auch dort nichts offen,
  bleibt die Figur stehen.

Die aussagekräftigste Prüfung dazu lässt **beide Fassungen nebeneinander** laufen: eine Mauer
quer über das Brett mit einer einzigen Lücke. Der Wegfinder findet einen Zug durch die Lücke, der
gierige Schritt findet **keinen**. Liegt die Lücke links, dreht der Weg mit.

---

## 4. Ablauf und Bedienung

### 4.1 Zugfolge und Steuerungshoheit

**Wer steuert wen (Hendriks Vorgabe, 2026-08-23):**

| Typ | Seite | Steuerung |
|---|---|---|
| `spieler` | Helden | Spieler — nach Freigabe, und **nur der zugeteilte** (4.1a) |
| `verbuendeter` | Helden | **nur die SL** (`arena_admin.html`) |
| `diener`, `seelenloser` | Gegner | **nur die SL** (`arena_admin.html`) |

**Bewegung und Angriff je einmal, in beliebiger Folge** (Savage Worlds): erst laufen und dann
schlagen, oder erst schlagen und dann noch ein Feld weiter. Geprüft wird das **in `js/arena.js`**
— `arenaBewegungErlaubt()` lehnt `tot` und `hatGezogen` ab, `arenaAngriff()` seit dem 31.10.2026
`tot`, `angeschlagen` und `hatAngegriffen`.

> **Vorher prüfte den Angriff nur die Oberfläche.** `arenaAngriff()` sah allein `ziel.tot` und
> `angreifer.angeschlagen` — eine **gefallene** Figur konnte zuschlagen, und eine, die schon
> angegriffen hatte, ein **zweites Mal**. Dass es am Tisch nicht auffiel, lag daran, dass
> `karte.html` und `arena_admin.html` die Klickziele versteckten. `arenaKannAngreifen()` gab es
> für genau diese Frage schon — und wurde **nirgends** gerufen. Dieselbe Linie wie bei
> `arenaDarfSteuern()`: entschieden wird in der Engine, nicht in der Oberfläche.

**Die Auswahl im Schlachtfeld folgt der Reihe** (31.10.2026, Hendriks Vorgabe „die Figur, die
gerade dran ist, sollte automatisch auch ausgewählt sein"). `auswahlDerReiheFolgen()` zieht sie
**nur beim Wechsel des Eintrags** (`iniZuletzt`) — der Firebase-Lauscher feuert nach jedem
Schreibvorgang, und eine Auswahl, die dabei jedes Mal zurückspringt, wäre unbenutzbar: Man könnte
keine andere Figur mehr ansehen. Auf der **Diener-Karte** wird sie geleert, weil dort niemand
einzeln handelt; der **Versetzen-Modus** endet beim Zugwechsel mit, sonst setzte der nächste Klick
die neue Figur frei herum statt sie regelkonform zu bewegen.

**Seit dem 30.10.2026 bestimmt die INITIATIVE, wer am Zug ist** (3.6), nicht mehr die Hand der
SL: „Nächste Figur ▸" schaltet einen Eintrag weiter und gibt dessen Figur frei. Der
Freigabe-Knopf je Figur bleibt daneben bestehen — als Rückfall und für den Fall, dass die SL
bewusst von der Reihe abweichen will. Auf der **Diener-Karte** wird **niemand** freigegeben; dort
handelt die Gruppe von selbst (3.7).

Solange eine Figur freigegeben ist, darf **jeder** Spieler sie
bewegen und mit ihr angreifen (es gibt keine Zuordnung Spieler↔Figur). Ohne freigegebene Figur
ist in der Spieleransicht **nichts** anklickbar — und `karte.html` prüft zusätzlich den Typ:
selbst wenn versehentlich ein Nicht-Spieler freigegeben würde, könnten die Spieler ihn nicht
steuern (Hinweis „… handelt …", Züge der SL kommen nur als Live-Update an).

Der Unterschied zwischen `spieler` und `verbuendeter` ist **nicht die Seite, sondern die
Steuerung**: Verbündete (Harwick, Cormac, …) kämpfen mit den Spielern und zählen für
Freund/Feind-Logik und Gang Up zur Helden-Seite (`arenaSeite()`), werden aber ausschließlich
von der SL gezogen.

Pro Figur und Runde: **eine** Bewegung (`hatGezogen`) und **ein** Angriff (`hatAngegriffen`).
Wer **angeschlagen** ist, darf sich bewegen, aber nicht angreifen (3.4) — der Rundenwechsel
räumt den Haken ab.
Beide Marker setzt der Rundenwechsel zurück. Das gilt auch für SL-gesteuerte Figuren — die SL
spielt nach denselben Regeln, kann aber im **Versetzen-Modus** (Schlachtfeld-Kopfleiste) jede
Figur frei auf ein beliebiges Feld setzen, ohne Bewegungsregel und ohne den Zug zu verbrauchen.
Das ist zugleich der Ersatz für das fehlende „Rückgängig" und das Werkzeug für die Aufstellung —
auch für frisch nachgesetzte Spieler, die die SL erst einmal frei platzieren will.

**Aufstellung bei „Aufbauen":** vier generische Spieler an der unteren Grundlinie, **Harwick
(Verbündeter) in der Feldmitte** — er steht beim Ritual an der Anhöhe, nicht bei der Gruppe am
Eingang (Hendriks Vorgabe) —, der Seelenlose oben mittig, vier Diener davor. **Karten werden
dabei gleich mit ausgeteilt, aber NICHT gelandet:** In Runde 1 steht die Aufstellung, und ein
Dienerangriff vor dem ersten Wort der SL wäre ein Überfall.

**Namensschilder:** Die Helden-Seite (Spieler + Verbündete) ist in beiden Ansichten **immer**
beschriftet — man muss sehen, wer wer ist. Gegner sind austauschbare „Diener" und tragen ihren
Namen nur als Tooltip (in der Spieleransicht zusätzlich ab großer Feldgröße); ihre Schilder
würden bei 16×16 nur übereinanderliegen.

### 4.1a Zuteilung: jeder steuert seine eigene Figur (30.10.2026)

Hendriks Vorgabe: *„Können wir einem Spieler direkt seine Figur zuteilen, dass dieser Spieler
auch selbstständig seine Figur steuern kann und auch die Runde beenden kann?"*

**Bis dahin galt die Regel vom 23.08.2026:** Die Spielleitung gibt **eine** Figur frei, und
solange sie frei ist, darf sie **jeder** Spieler bewegen — es gab nämlich keine Zuordnung
Spieler↔Figur. Seit dem 30.10.2026 trägt ein Token die Spielerkennung `pid` (5.4), und damit
ist sie da.

| Token | wer steuert es in `karte.html` |
|---|---|
| `spieler` **mit** `pid` | **nur dieser Spieler** |
| `spieler` **ohne** `pid` | jeder (die alte Regel) |
| `verbuendeter`, `diener`, `seelenloser` | niemand — die Spielleitung |

**Die Fallback-Regel ist die wichtigere Hälfte.** Stünde hier „ohne Zuordnung steuert niemand",
wäre jede Platzhalter-Figur („Spieler 1") **lautlos unspielbar** — mitten im Gefecht, ohne dass
am Tisch jemand den Grund sieht. Lieber eine Figur, die zu viele bewegen können, als eine, die
niemand bewegen kann. Beides entscheidet `arenaDarfSteuern()` in `js/arena.js`, nicht die
Oberfläche: Auch ein von Hand abgesetzter Aufruf kommt daran nicht vorbei.

**Zuteilen tut die Spielleitung** im Auswahlpanel des Schlachtfelds über ein Feld **„Steuert"**.
Das ist bewusst **getrennt** von „+ Spieler aus der Sitzung": Jenes stellt eine Figur **mit
ihren Blattwerten** aufs Brett, dieses beantwortet nur die Frage, **wer sie zieht** — eine
Platzhalter-Figur, eine von Hand eingetragene oder eine, die den Besitzer wechselt, soll
zuteilbar sein, ohne dass ihre Werte dabei überschrieben werden. Sonst wäre „zuteilen" ein
versteckter Werte-Reset. Zwei Figuren an denselben Spieler gehen nicht.

**Die Spielleitung kann jede Figur weiterhin selbst ziehen** — die Zuteilung bindet nur die
Spieleransicht.

#### „Zug beenden ▸"

Der einzige Knopf, den Spieler in der Arena haben. Er erscheint **nur**, wenn die eigene Figur
wirklich **am Zug** ist — nicht schon, wenn sie bloß freigegeben ist. Geschaltet wird über
genau dieselbe Glue wie bei der Spielleitung (`arenaIniWeiter` + `arenaIniLanden`); zwei
Fassungen desselben Ablaufs liefen auseinander, und dann schaltete die Karte anders weiter als
das Schlachtfeld. Landet die Reihe dadurch auf der **Diener-Karte**, handeln die Wiedergänger
sofort (3.7) — wie bei jedem anderen Weiterschalten auch.

Drei Wachen, und jede hat einen Grund:

| Wache | ohne sie |
|---|---|
| nur die **eigene** Figur | jeder am Tisch könnte die Reihe weiterschalten, während ein anderer nachdenkt |
| nur, wenn sie **am Zug** ist | eine freigegebene, aber nicht aktive Figur würde die Reihe verschieben |
| der Knopf trägt den **gesehenen Index** | ein Doppelklick (oder ein Klick, nachdem die Spielleitung geschaltet hat) überspringt eine Figur |

**Die RUNDE beendet der Spieler NICHT.** Als Letzter in der Reihe bleibt der Knopf aus, und der
Hinweis sagt, warum („die Spielleitung schließt die Runde ab"). Zwei Gründe: Am Rundenwechsel
stehen **Auferstehung und Nachschub** — ein Beat, den die Spielleitung ansagt und kein Spieler
nebenbei auslöst. Und technisch: Ohne diese Wache würde der Klick `initiative/index` auf `null`
setzen, **ohne** den Rundenwechsel auszuführen — das Brett stünde dann ohne Figur am Zug da, bis
jemand „Runde weiter ▸" drückt. Dafür steht eine eigene Prüfung da (7).

### 4.2 Angriffsart

Die Entfernung entscheidet, mit **einer** Ausnahme (4.2a):

- Distanz ≤ `nahkampfReichweite` (1, also angrenzend inkl. diagonal) → **Nahkampf** — oder, auf
  Wunsch und mit pistolengroßer Waffe, ein **Schuss aus der Nähe** (4.2a)
- darüber, mit einer Schusswaffe (`fernwaffe > 0`) → **Fernkampf**, solange die Waffe trägt
- sonst → kein Angriff möglich

Entfernungen sind **Chebyshev-Distanz**: diagonal zählt wie gerade. Das ist am Tisch die
unstrittigste Variante — „angrenzend" heißt genau Distanz 1, egal ob schräg oder gerade.

**Die Grenze setzt seit dem 30.10.2026 die WAFFE, nicht das Brett.** `fernkampfMod()` gibt
jenseits der vierfachen Waffenreichweite `null` zurück, und `arenaAngriffsart()` prüft das
**mit** — sonst zeigte die Oberfläche einen Schuss an, der beim Klick abgelehnt wird. Diese
Funktion ist die **eine** Stelle, die „kann der den überhaupt angreifen" beantwortet.

`regeln.fernkampfReichweite` ist dadurch nur noch eine Bremse fürs Brett (16; auf 16×16 liegen
nie mehr als 15 Felder zwischen zwei Figuren, sie bindet also nicht). Vorher stand sie auf 6,
weil es **überhaupt keinen** Entfernungsabzug gab und unbegrenzte Reichweite ohne Abzug kaputt
wäre.

Eine **liegende** Figur ist kein Ziel (`grund: 'ziel_liegt'`). Vorher lief ein solcher Angriff
stillschweigend ins Leere; jetzt sagt er, warum. **[OFFEN]** Ob der Säbelträger einen bereits
niedergeschlagenen Diener *nachstoßen* darf, damit er nicht wieder aufsteht, ist bewusst **nicht**
eingebaut — das wäre eine echte neue Taktik und Hendriks Entscheidung, nicht meine.

### 4.2a Der Schuss aus der Nähe (31.10.2026)

**Das ist die einzige Stelle der Arena, an der die Angriffsart eine WAHL ist.** Auf Distanz
entscheidet weiter allein die Entfernung; angrenzend darf eine pistolengroße Waffe trotzdem
abgedrückt werden (Bibel 4.4a, dort am 31.10.2026 nachgetragen).

| | Nahkampf | Schuss aus der Nähe | Fernkampf auf Distanz |
|---|---|---|---|
| Fertigkeit | Kämpfen | **Schießen** | Schießen |
| Zielzahl | Parade des Ziels | **Parade des Ziels** | 4 + Entfernungsabzug |
| Gang Up | ja, bis +4 | **nein** | nein |
| Schaden | Waffe + Stärke | **nur die Waffe** | nur die Waffe |
| Waffe danach | unverändert | **leer** | leer |

- **Gewählt** wird über `vorgabe.art = 'fern'` an `arenaAngriff()`; `arenaAngriffsart()` nimmt den
  Wunsch als vierten Parameter und gibt ihn **nur angrenzend** heraus.
- **Die Größengrenze trägt `fernHandlich` am Token**, abgeleitet aus dem Gewicht der Ware
  (`ARENA_NAHSCHUSS_GEWICHT = 3` Pfund: Wurfmesser 1, Steinschlosspistole 3 — Donnerbüchse 6 und
  Muskete 8 fallen heraus). **Fehlt das Feld, gilt NEIN**: Der Nahschuss ist die neue Fähigkeit,
  und ein stillschweigend erlaubter Musketenschuss aus zwei Schritt wäre schlimmer als ein
  fehlender Knopf. Im Schlachtfeld ist das Feld je Figur umstellbar.
- **Bedient** wird es als Umschalter — in `karte.html` der Knopf „Aus der Nähe schießen" neben
  „Zug beenden", in `arena_admin.html` einer im Auswahlpanel. Er erscheint nur, wenn er auch
  wirkt (handliche Waffe, geladen, noch nicht angegriffen, ein Gegner steht wirklich daneben), und
  **gilt nur für die eine Figur**: Wechselt die Freigabe bzw. die Auswahl, fällt der Wunsch weg —
  sonst schießt die nächste Figur, obwohl sie zuschlagen wollte.
- Kann eine Figur es grundsätzlich nicht, sagt das Panel **warum** („Die Waffe ist zu groß …")
  statt den Knopf nur weglassen.

### 4.3 Nachladen

Ein Fernkampfangriff setzt `geladen: false` und merkt sich `entladenSeitRunde`. Der Rundenwechsel
lädt erst nach, wenn die Runde **größer als `entladenSeitRunde` + 1** ist — also **erst in der
übernächsten** Runde: Schuss in Runde 3, Runde 4 bleibt leer, ab Runde 5 wieder bereit. Am Token
erscheint eine „leer"-Marke, aber nur bei Figuren mit einer Schusswaffe (bei einem Diener wäre
„leer" keine Aussage).

> **Korrigiert am 31.10.2026.** Hier stand `runde > entladenSeitRunde`, also **schon die nächste
> Runde** — damit kostete das Nachladen gar nichts und eine Steinschlosspistole feuerte **jede
> Runde**. Bibel 4.5, der Spickzettel in `REGELREFERENZ.md` und der Dateikopf von
> `js/arena_scenes.js` sagten alle drei „erst in der übernächsten Runde". Der Code widersprach
> der Bibel, und dann gilt die Bibel. Gefunden beim vollständigen Abfolge-Audit auf Hendriks
> Hinweis „irgendwie stimmt die Abfolge noch nicht".

### 4.4 Der Seelenlose als Quelle

Er schlägt selbst zu und ist zugleich der Grund, warum die Toten nicht liegen bleiben. **Solange
er lebt:**

- normal getötete Diener stehen nach `wiederauferstehenNach` (2) Runden wieder auf, und zwar
  **unversehrt** (Wunden und Haken fallen weg)
- alle `nachschubAlle` (3) Runden erscheinen `nachschubAnzahl` (2) neue Diener auf freien
  Randfeldern

Der Seelenlose ist eine reine Nahkampf-Figur (`fernwaffe 0`) — auf Distanz kann er nicht
angreifen, nur heranrücken (siehe Fehlergeschichte Nr. 6).

**Fällt er, hört beides sofort auf** (`arenaBossLebt()`). Damit ist er das eigentliche Ziel des
Kampfes und nicht bloß der dickste Gegner — ohne dass dafür eine Siegbedingung nötig wäre.

### 4.5 Der Jaguar-Säbel — die Pflichtwaffe

> **Hendriks Vorgabe vom 18.10.2026 — die wichtigste Regel des Finales:** „Die Waffe wird
> zwingend notwendig sein, um den Endboss zu besiegen. Nur mit dem Säbel sterben die
> Wiedergänger und auch der Boss selbst."
>
> Das löst die vorherige Fassung ab, in der der Säbel beim Seelenlosen **keine** Sonderwirkung
> hatte und Bibel 12.1 ihn ausdrücklich als „keine Rätselwaffe" führte. Wer ältere Stellen liest,
> die das noch so sagen: **diese hier gilt.**

**Nur der Säbel tötet endgültig — Diener wie Seelenlosen.** Alles, was ohne ihn fällt, geht
lediglich **zu Boden** und steht nach `wiederauferstehenNach` Runden wieder auf. Das gilt seit
dem 18.10. auch für den Seelenlosen selbst: Man kann ihn niederschlagen, aber er richtet sich
auf, und die Toten kommen weiter.

| | ohne Säbel | mit Säbel |
|---|---|---|
| **Diener** | fällt bei der ersten Wunde, steht wieder auf | **jeder Treffer** zerfällt ihn sofort, endgültig |
| **Seelenloser** | fällt außer Gefecht, **richtet sich wieder auf** | Schaden zählt normal, **außer Gefecht = endgültig** |

**Gezählt wird beim Diener der TREFFER, nicht die Wirkung:** Auch ein Schlag, der die Robustheit
gar nicht erreicht hätte, lässt ihn zu Staub fallen. Das ist dieselbe Regel wie am 23.08., nur
in der neuen Währung — „sobald das Band kein Misserfolg ist".

**Der Säbel ist die Bedingung, nicht die Abkürzung.** Gegen den Seelenlosen zählt der Schaden
weiter ganz normal — eine Berührung legt ihn *nicht* nieder, sonst wäre das Finale mit einem
einzigen Treffer vorbei. Er trägt drei Wunden wie jede Wild Card, und bei Robustheit 8 braucht
eine Wunde **12 Schaden** — das kommt mit Waffe + Stärke nur mit einem Ass zustande. Wird er
damit zu zäh oder zu weich, ist `wundenMax` am Token der erste Hebel.

**`arenaBossGebannt()` statt `arenaBossLebt()` — daran hängt alles.** Wiederauferstehung und
Nachschub laufen, solange der Seelenlose **nicht gebannt** ist; „gebannt" heißt endgültig tot und
kann nur der Säbel. Hingen sie weiter an „der Boss lebt", würde ein normaler Niederschlag den
Nachschub stoppen — und die Pflichtwaffe wäre wirkungslos, ohne dass es am Tisch auffällt. Genau
dieser Fall steht als Prüfung in `tests/t_arena.js` und schlägt mit der alten Fassung an
(5 Prüfungen). Liegt **kein** Boss-Token im Feld, gilt „gebannt" — sonst stünden Diener in einem
Gefecht ohne Seelenlosen endlos wieder auf.

Dass Diener unter dem Säbel „zu Staub zerfallen", ist für alle sichtbar (in-fiction entdeckt der
Träger die Eigenschaft ja gerade so, siehe `die_ersten_wellen`) — nur *benannt* wird der Säbel
nirgends.

> **Was, wenn die Gruppe den Säbel nicht hat? Dann verliert sie — entschieden, nicht offen.**
> Seit er Pflicht ist, ist der Endkampf ohne ihn nicht zu gewinnen: Der Seelenlose steht immer
> wieder auf. Hendriks Festlegung vom 18.10.2026 dazu, wörtlich: *„Wenn die Spieler zu viel Zeit
> auf der Insel verbringen und den Säbel nicht bekommen, werden sie den Endkampf nicht schaffen.
> Das ist dann halt so."*
>
> Drei Routen führen zur Insel (Bibel 7.4: Spanier-Flucht, Schmuggler-Hinweis, Harwicks
> Unterlagen in der Flaute) — mindestens eine greift immer. **Was danach passiert, liegt bei der
> Gruppe:** Die Affen (`ORTE.riffstrand.die_affen`) können die Erkundung beenden, bevor die
> Grotte gefunden ist, und dieser Zeitdruck bleibt bewusst stehen.
>
> **Damit gilt die Design-Regel aus Abschnitt 1 nicht mehr vollständig.** Die Arena hat weiterhin
> keine Siegbedingung, aber sie hat jetzt eine **Verlustbedingung**, die sie vorher nicht hatte:
> Ohne Säbel bestimmt sie doch, *ob* das Finale aufgeht, nicht nur wie teuer es wird. Das ist der
> Preis der Pflichtwaffe und als solcher gewollt.

**Wer ihn trägt, setzt allein die SL** (im Schlachtfeld per „Säbel geben" — möglich für Spieler
UND Verbündete, denn laut Finale kann er auch Harwick in die Hand gedrückt werden), und es wird
den Spielern **nirgends angezeigt**:

- kein Marker am Token in der Spieleransicht
- das Kampf-Log erwähnt den Säbel bewusst nicht — sonst ließe sich der Träger daran ablesen
- **Ausnahme:** `arena_admin.html` zeigt den Träger offen (⚔-Marke + Kasten) — die Seite ist
  SL-exklusiv, Spieler sehen sie nie

Beim Weiterbauen daran denken: **jede neue Log-Zeile und jede neue Anzeige muss das einhalten.**

### 4.5a Woher das Brett weiß, wer ihn hält (04.11.2026)

> **Hendriks Auftrag:** „Ich brauche den JaguarSäbel noch als Item, was ich zuweisen
> kann.“

Der Säbel ist seit dem 04.11.2026 eine **kanonische Ware** in `js/regelwerk.js`
(`JAGUAR_SAEBEL_ID`), nicht mehr eine von der Spielleitung erfundene. Das war der
eigentliche Grund der Umstellung: Eine erfundene Ware fällt ohne
`eigeneWarenSetzen()` **still** weg (4.6) — ausgerechnet bei der Pflichtwaffe.

`arenaWerteAusFigur()` setzt daraus am Token das Feld **`jaguarSaebel`**. Es sagt nur,
was der **Bogen** sagt, und zählt nur **Getragenes**: Ein Jaguar-Säbel in der
Seemannskiste bannt niemanden (Bibel 4.5a). Wer ihn auf dem Brett **hält**, steht
weiterhin in `saebeltraeger` — die Spielleitung setzt es, und den Spielern wird es nie
angezeigt (4.5).

**`arenaSaebeltraegerAusTokens(tokens, aktuell)` füllt nur die Lücke:**

| Lage | Ergebnis |
|---|---|
| `saebeltraeger` gesetzt, Token steht | **bleibt unangetastet** |
| nichts gesetzt, eine Figur trägt ihn laut Bogen | diese Figur |
| nichts gesetzt, niemand trägt ihn | nichts |
| Träger-Token ist weg | neu gesucht |
| zwei Träger (im Kanon unmöglich) | erste Kennung, reproduzierbar |

**Die erste Zeile ist die wichtigere Hälfte.** Im Finale wird der Säbel
weitergegeben — an Jessica, an Harwick oder an niemanden (Bibel 12.1, drei Ausgänge).
Eine Automatik, die ihn stur dem zurückgibt, der ihn laut Bogen trägt, würde genau
diesen Beat überschreiben. Abgeleitet wird deshalb nur, wo noch **nichts** steht — und
das sowohl beim Aufbauen (beide Wege) als auch beim Setzen eines Spielers.

Das Auswahlpanel sagt zusätzlich, **was der Bogen sagt**: „Laut Bogen trägt sie den
Jaguar-Säbel — auf dem Brett hält ihn gerade jemand anderes.“ Bei mehreren Figuren
sieht man sonst nicht, wer ihn mitgebracht hat, und eine Weitergabe läge nur im
Firebase-Feld.

**Verkaufen kann der Spieler ihn nicht** (`unverkaeuflich` an der Ware): „Ablegen“
verkauft im Heldenbrief ohne Rückfrage zum halben Preis, und ein Fehlgriff hätte das
Finale lautlos unlösbar gemacht. Einziehen kann allein die Spielleitung.

---

### 4.6 Welche Waffe aufs Brett kommt (04.11.2026)

Hendriks Vorgabe: *„Dann wäre es noch gut, wenn man Waffen anlegen kann. Eine Nahkampfwaffe und
auch eine Fernkampfwaffe."*

**Die Arena entscheidet das NICHT selbst.** `waffeInHand(figur, art)` in `js/regelwerk.js` ist
die einzige Auflösung — die angelegte Waffe, sonst die stärkste getragene. `arenaBesteWaffe()`
behält nur seinen Namen und reicht weiter.

| | ohne Wahl | mit Wahl |
|---|---|---|
| Schaden am Token | stärkste getragene | die angelegte, auch die schwächere |
| Reichweite | stärkste getragene | die angelegte |
| Nahschuss erlaubt (`fernHandlich`) | nach der stärksten | **nach der angelegten** |
| verstaut (`lager`) | zählt nie | zählt nie, auch wenn angelegt |

**Die letzte Zeile ist die gefährliche Richtung** und steht als Prüfung da: Eine angelegte, aber
verstaute Muskete darf im Endkampf nicht in der Hand liegen. Am Tisch fiele das **nicht** auf —
die Figur stünde mit einer Waffe auf dem Brett, und niemand sähe, woher sie kommt.

**`fernHandlich` ist die Zeile, an der am meisten hängt:** Wer die Pistole angelegt hat, darf im
Handgemenge abdrücken (4.2a), wer die Muskete angelegt hat, nicht. Dieselben zwei Waffen im
Gepäck, zwei verschiedene Erlaubnisse — entschieden allein durch den Klick im Heldenbrief.

> **DER BEFUND VOR DEM BAU, und er ist der Grund für die Zusammenlegung:** Es gab **vier** eigene
> Waffenwahlen — `arenaBesteWaffe()` hier und `besteWaffe()`, der Filter in `fernMoeglich()` und
> `waffeVon()` in `regie_figuren.html` — und sie waren **uneinig**. Gemessen an einer Figur mit
> Wurfmesser und Muskete:
>
> ```
> ARENA nimmt      : Muskete
> KAMPFMODUS nimmt : Wurfmesser   (waffen[0], ungesortiert)
> ```
>
> Die eine Fassung sortierte nach Schaden, die andere nahm das erste Fundstück. Am Tisch fällt so
> etwas nicht auf, es rechnet nur anders — die Spielleitung sah eine andere Waffe als das Brett.

---

### 4.7 Was auf dem Brett markiert ist (04.11.2026)

Hendriks Vorgabe: *„Können wir eine Markierung setzen für Nah und Fernkampf Angriff und
Bewegung?"*

| Zeichen | Form | Farbe | Bedeutung |
|---|---|---|---|
| Fläche mit Punkt | — | Gold | **dorthin kannst du laufen** |
| Umrandung ⚔ | **durchgezogen** | Rostrot | **Nahkampf** — gegen seine Parade, Gang Up zählt |
| Umrandung ⌖ | **gestrichelt** | Stahlblau | **Schuss** — Entfernungsabzug, danach ist die Waffe leer |
| Umrandung ⌖, **blinkend** | gestrichelt | blau/gold | **Schuss aus der Nähe** (4.2a) — teuer |

**Jede Markierung trägt Form UND Symbol, nicht nur Farbe.** Rund jeder zwanzigste Mann am Tisch
unterscheidet Rot und Blau nicht zuverlässig; eine Markierung, die allein über die Farbe
funktioniert, ist für ihn keine. Dieselbe Linie wie bei der Tastatur-Erreichbarkeit (15.10.2026).

**Beide Ansichten markieren gleich** — `karte.html` und `arena_admin.html` benutzen dieselben
Klassen, dieselben Zeichen und dieselbe Schussfarbe. Zwei Ansichten, die dasselbe Brett
verschieden markieren, wären am Tisch schlimmer als keine Markierung, und das steht als Prüfung
da.

**Keine feste Legende.** Der Hinweis in der Spieleransicht nennt die Zeichen, die *gerade*
dastehen („⚔ Nahkampf · ⌖ Schuss"). Eine feste Legende kostet auf einem engen Schirm Platz und
erklärt auch das, was nicht vorkommt.

> **Der Befund vorweg:** Bewegung und Ziele waren beide schon markiert — aber **alle Ziele
> gleich.** Die Art stand längst in `angreifbar[id]` und wurde weggeworfen; der Unterschied
> steckte allein im `title`, und **am Tablet am Tisch gibt es kein Hovern.** Im Schlachtfeld
> stand er nicht einmal dort. Dieselbe Sorte Verlust wie beim abgelehnten Angriff (Fehler 24):
> Die Engine weiß es, die Anzeige verschweigt es.

---

---

## 5. Datenmodell

### 5.1 Szenen-Konfiguration (`js/arena_scenes.js`)

```js
regeln: {
  breite: 16, hoehe: 16,        // Feldgröße
  bewegung: 2,                  // Felder pro Runde
  nahkampfReichweite: 1,
  fernkampfReichweite: 16,      // nur eine Bremse fürs Brett, siehe 4.2
  wiederauferstehenNach: 2,     // Runden
  nachschubAlle: 3,             // Runden
  nachschubAnzahl: 2
}
```

Die Felder einer Figuren-Vorlage sind **Würfelstufen** wie in `js/regelwerk.js`
(1 = d4 · 2 = d6 · 3 = d8 · 4 = d10 · 5 = d12 · 0 = ungelernt, d4−2):

| | Spieler | Verbündeter | Diener | Seelenloser |
|---|---|---|---|---|
| Symbol / Farbe | ☘ gold | ⚓ blaugrau | ☠ grün | ✦ rot |
| `kaempfen` | d8 | **d10** | **d4** | **d12** |
| `schiessen` | d8 | d6 | — | — |
| `staerke` | d8 | d10 | d6 | d12 |
| `waffe` / `fernwaffe` | d6 / d6 | d6 / — | d4 / — | d6 / — |
| `reichweite` | 5 | — | — | — |
| `parade` / `robustheit` | 6 / 6 | **7 / 7** | **4 / 4** | **8 / 8** |
| `wild` (Wild Card) | ja | ja | **nein** | ja |
| `wundenMax` | 3 | 3 | **0** | **6** |

**Diese Zahlen sind seit dem 30.10.2026 NICHT mehr gegriffen, sondern GEMESSEN.** Vorher trug
die Arena eigene W100-Kampfwerte, und derselbe Mann hatte im Endkampf andere Werte als in
`besatzung.html` — das war der offene Punkt vom 15.10.2026. Jetzt stammen sie aus den Blättern in
`js/npcs.js`, gerechnet mit `parade()`/`robustheit()` und der besten getragenen Waffe:

| Vorlage | Blatt | warum dieses |
|---|---|---|
| `spieler` | **Harwick** | Die Spielerbögen liegen nur im `localStorage` der Spieler. Harwick ist der Maßstab einer erfahrenen Figur — im Finale angemessen. |
| `verbuendeter` | **Cormac** | Bester Kämpfer an Bord; „Kampf 7 gegen Harwicks 6" ist Kanon und steht damit auch hier. |
| `diener` | Mannschafts-Median, abgeschwächt | Ein Statist: kein Wild Die, die erste Wunde nimmt ihn raus. Gefährlich in der Menge (Gang Up). Seit dem 31.10.2026 abgeschwächt — siehe den Kasten darunter. |
| `seelenloser` | **sein eigenes Blatt** | Legendär, der einzige d12 der Kampagne. Parade 8 kostet −4 — genau das, was Gang Up zurückholt. |

`tests/t_arena.js` **rechnet diese Herkunft nach** statt sie zu behaupten: Parade, Robustheit und
Kämpfen-Wert der Vorlagen müssen mit den Blättern übereinstimmen.

> **Zwei Zahlen sind seit dem 31.10.2026 bewusst NICHT gemessen** (Hendriks Vorgabe: *„Wie können
> wir die Gesundheit des Seelenlosen höher machen und die kleinen Zombies schwächer?"*) — der
> `wundenMax` des Seelenlosen (6, siehe 3.5) und die Werte der Diener.
>
> **Bei den Dienern ist das aber keine Abweichung, sondern eine Korrektur.** Nachgerechnet wurden
> alle 14 Blätter aus `NSC_MANNSCHAFT`: **zehn von vierzehn haben Parade 4**, und **elf von
> vierzehn können überhaupt nicht kämpfen** (Kämpfen ungelernt). Mit d6 / 5 / 5 stand der Diener
> damit am **oberen** Ende der Mannschaft; der vorher hier stehende Satz „wie ein
> Mannschaftsmitglied" war großzügig gerundet. Jetzt: **Kämpfen d4** (schlägt zu, ist aber kein
> geschulter Fechter — immer noch mehr als die typischen 0), **Parade 4** (genau der Median),
> **Robustheit 4** (ein Punkt darunter, Pip-Niveau — der einzige Wert, der wirklich unter der
> Mannschaft liegt).
>
> **Gemessen** (drei Diener um einen Spieler, ein Schlag): vorher 50,1 % Treffer und 16,4 % Wunde,
> jetzt 25,1 % und 8,1 %. Umgekehrt räumen Spieler sie schneller weg: aus 66,3 % Treffer /
> 39,1 % gefallen wird 81,2 % / 54,8 %.
>
> `tests/t_arena.js` **misst die 14 Blätter selbst** und vergleicht — eine Prüfung, die bloß die
> Zahl in der Vorlage liest, bestätigt sich selbst. Gegengeprüft: Dreht man beide Änderungen
> zurück, schlagen **9 Prüfungen** an, und die erste nennt den Fehler wörtlich
> (`der Seelenlose traegt mehr als die drei Wunden der Regel` → `3`).

Je Figur sind die Werte im Schlachtfeld weiter **einzeln editierbar** — und dort lässt sich
zusätzlich **ein echtes NSC-Blatt auf ein Token stempeln** („Blatt → übernehmen"): Name, Werte,
Waffe, Parade und Robustheit kommen aus `js/npcs.js`, gerechnet, nicht abgeschrieben.

### 5.2 Firebase (`arenaState/{sceneId}`)

```
arenaState/15-1/
  runde          Zahl
  freigegeben    Token-ID oder null   ← folgt seit 30.10. der Initiative
  saebeltraeger  Token-ID oder null   ← nur SL, nie an Spieler
  initiative/
    reihe[]/     { key, name, tokens[], karte: {wert, farbe, joker} }
                 key: "t:{tokenId}" oder "diener" (die Gruppenkarte)
    index        Position in der Reihe (null = Runde durch)
    deck[]       Restdeck, wird in die naechste Runde weitergereicht
    mischenNoetig  true, wenn der Joker gefallen ist
  tokens/{id}/
    typ            "spieler" | "verbuendeter" | "diener" | "seelenloser"
    name, symbol, farbe
    x, y           Feldkoordinaten
    wunden         Zahl (fehlt = unversehrt)
    angeschlagen   true/fehlt  - kostet die Handlung, nicht den Wuerfel
    wundenMax      Tragfaehigkeit (0 Statist, 3 Wild Card)
    pid            Spielerkennung: wer diese Figur steuern darf (4.1a)
    kaempfen, schiessen, staerke, waffe, fernwaffe, reichweite
    parade, robustheit, wild
    geladen        bool
    entladenSeitRunde  Runde des Schusses (fürs Nachladen)
    hatGezogen, hatAngegriffen   je Runde
    tot, totSeitRunde, endgueltig
  log/{pushId}/  { text, zeit }
```

Der Pfad folgt der Konvention aus Bibel 13.3 (Punkte in Szenen-IDs werden per `fbKey()` zu
Bindestrichen: `15.1` → `15-1`).

> **⚠ Ein `arenaState` von VOR dem 30.10.2026 trägt die alten Felder** (`hp`, `hpMax`,
> `nahWert`, `mastery`). Die Engine ist tolerant und fällt auf Vorgaben zurück, aber die Werte
> stimmen dann nicht. Es gibt bewusst **keine Migration**: Ein Gefecht ist zu Ende, wenn es zu
> Ende ist, und „Aufbauen" setzt alle Tokens neu. Die Arena war ohnehin nie am Tisch.

### 5.4 Die echten Spielerfiguren der Sitzung (30.10.2026)

Hendriks Frage: *„Kann man die Spieler direkt mit den wirklich vorhandenen Spielern in dieser
Session verknüpfen?"*

**Ja — und zwar erst seit dem 15.10.2026.** Bis dahin lagen die Charakterbögen nur im
`localStorage` der jeweiligen Spieler, die Spielleitung kam an die Werte nicht heran, und die
Arena stellte deshalb „Spieler 1–4" mit **Harwicks** Werten als Maßstab auf. Seitdem liegt jede
Figur unter `sitzungen/{sid}/stand/figuren/{kennung}` — also genau dort, wo das Schlachtfeld
ohnehin liest (`sitzungsDbJetzt()`).

| Wo | Was |
|---|---|
| Kopfleiste des Schlachtfelds | Auswahlfeld **„+ Spieler aus der Sitzung …"** — eine echte Figur mit ihren eigenen Werten aufs Brett |
| **„↺ Aufbauen"** | nimmt die Figuren der Sitzung, wenn es welche gibt; sonst die generischen Platzhalter |
| Auswahlpanel | zeigt **🔗 Name**, dazu **„↻ Werte nachziehen"** und „Verknüpfung lösen" |
| Token | trägt `pid`, die Spielerkennung |

**Die Verknüpfung ist bewusst EINE RICHTUNG: gelesen wird aus dem Bogen, geschrieben wird nie
hinein.** `heldenbrief.html` liest die Figur genau einmal und schreibt danach bei jeder Änderung
**seine eigene Fassung** hoch — ein direkter Schreibzugriff der Arena wäre beim nächsten Klick
des Spielers lautlos weg (Lehre vom 14.10.2026). Wunden auf dem Brett bleiben deshalb **auf dem
Brett**; was in den Bogen soll, geht über das **Postfach** (`figuren/{pid}/zuteilung`) im
Figuren-Panel, das `wunde` und `angeschlagen` seit dem 15.10.2026 kennt.

**Was übernommen wird** (`arenaWerteAusFigur()` in `js/arena.js` — **eine** Ableitung für
Spielerbögen *und* NSC-Blätter, vorher stand sie nur für die NSC in `arena_admin.html`):

| Token | woraus |
|---|---|
| `kaempfen`, `schiessen` | `fert['Kämpfen']`, `fert['Schießen']` |
| `staerke` | `attr['Stärke']` |
| `waffe`, `fernwaffe`, `reichweite` | die **beste getragene** Waffe je Art |
| `parade`, `robustheit` | **gerechnet** mit `parade()`/`robustheit()` |
| `wild` | Spielerfigur immer, NSC laut Blatt |
| `wunden`, `angeschlagen` | der Zustand aus dem Bogen, geklemmt auf die Tragfähigkeit |

Die Waffe ist die **beste** getragene ihrer Art: Wer Säbel und Messer trägt, schlägt mit dem
Säbel. Auf dem Brett gibt es keine Waffenwahl, und die Alternative wäre, bei jedem Angriff zu
fragen.

> **⚠ Die stille Falle: erfundene Waren.** Trägt eine Figur eine von der Spielleitung
> **erfundene** Ware (`eigeneWaren`) — und der **Jaguar-Säbel** ist genau so eine —, findet
> `AUSR_BY_ID` sie nur, wenn die Seite vorher `eigeneWarenSetzen()` gerufen hat. Sonst fällt die
> Waffe **weg, ohne dass es auffällt**: Die Figur steht mit der Faust auf dem Brett und niemand
> sieht den Grund. Beide Seiten lesen `eigeneWaren` deshalb, **bevor** sie ein Blatt übernehmen
> — dieselbe Reihenfolge wie in `heldenbrief.html` und `regie_figuren.html`. Dafür steht eine
> eigene Prüfung da (7).

**Doppelt geht nicht:** Eine Figur, die schon auf dem Brett steht, ist im Auswahlfeld gesperrt
(„steht schon") — zweimal dieselbe wäre im Gefecht nicht auseinanderzuhalten. Eine Figur, die
laut Bogen **außer Gefecht** ist, wird genannt, lässt sich aber setzen: Sie steht dann mit voller
Wundenzahl da, aber nicht schon gefallen — ob sie überhaupt mitkämpft, entscheidet die
Spielleitung und nicht die Buchhaltung.

### 5.3 Wer schreibt was

**Hier schreiben erstmals die Spieler echten Spielzustand.** Beim Erkundungs-Graphen der
Riffinsel setzen Spieler nur ihre Stimme, und die SL bewegt; hier bewegen und kämpfen die Spieler
selbst. Anders ginge es nicht — die SL müsste sonst jeden einzelnen Schritt nachklicken, was den
Sinn der Arena aufhöbe.

Die Kontrolle bleibt trotzdem bei der SL: **ohne freigegebene Figur ist gar nichts anklickbar**,
und die Freigabe kann nur die SL setzen.

**Alle Schreibvorgänge laufen als ein einziges `update()` von der Wurzel aus** (`arenaSchreibe()`
bzw. `arenaUpdate()`). Grund ist derselbe wie beim Erkundungs-Graphen: mit mehreren `set()`-Aufrufen
feuert der Live-Listener mehrfach auf halben Zwischenständen, was sich als Springen und
Flackern zeigt.

> **Hinweis:** `arenaState` muss in den Firebase-Sicherheitsregeln freigegeben sein, sonst
> funktioniert die Arena live nicht, obwohl sie offline korrekt läuft. Die Regeln stehen als
> Referenz in **[firebase-rules.json](firebase-rules.json)** (dort auch der Grund, warum die
> Testmodus-Regeln ersetzt werden mussten) — einspielen in der Firebase-Konsole, die Datei wird
> nicht automatisch deployt. **Jeder neue Top-Level-Pfad muss dort ergänzt werden**, sonst
> schlägt sein Schreibzugriff still fehl.
>
> Die Regeln kennen **keine Anmeldung**: `js/firebase-config.js` ist im öffentlichen Repo, wer
> die Datenbank-URL kennt, kann die freigegebenen Pfade lesen und schreiben. Für echten Schutz
> wäre anonyme Firebase-Anmeldung nötig (`signInAnonymously()` auf jeder Seite plus
> `"auth != null"` in den Regeln) — das ist bewusst noch nicht gebaut, siehe 9.2.

---

## 6. API-Überblick

### 6.1 Das Brett (`js/arena.js`)

| Funktion | Zweck |
|---|---|
| `arenaDistanz(a, b)` | Chebyshev-Distanz |
| `arenaAngriffsart(a, ziel, regeln)` | `'nah'` \| `'fern'` \| `null` — **die eine Stelle**, die „geht das überhaupt" beantwortet (inkl. Waffenreichweite) |
| `arenaGangUp(a, ziel, tokens, regeln)` | +0 bis +4, um das **Ziel** gezählt |
| `arenaAngriffMod(a, ziel, art, tokens, regeln)` | der komplette Modifikator des Angriffswurfs; eigene Funktion, damit er **einzeln prüfbar** ist |
| `arenaWundenMax(t)` / `arenaWundenAbzug(t)` | Tragfähigkeit · flacher Abzug (gedeckelt bei 3) |
| `arenaWundenAnteil(t)` | Füllung der Leiste am Token; **`null` bei einem Statisten** (dort gibt es nichts zu füllen) |
| `arenaKannAngreifen(t)` / `arenaZustandText(t)` | angeschlagen-Sperre · Anzeigetext |
| `arenaSchadensWuerfel(a, art, steigerung)` | Adapter auf `schadensWuerfel()` — ein Token ist keine Figur |
| `arenaSchadenWerfen(wuerfel, vorgabe?)` | wirft sie explodierend; `vorgabe` setzt die Summe fest |
| `arenaAngriff(a, ziel, tokens, regeln, saebeltraegerId, vorgabe?)` | **Kernfunktion.** Reines Ergebnisobjekt, verändert nichts. |
| `arenaBewegungErlaubt(t, ziel, regeln, tokens)` | Reichweite, Rand, Besetzung, „schon gezogen" |
| `arenaBossLebt(tokens)` / `arenaBossGebannt(tokens)` | steht er noch · ist er **endgültig** tot |
| `arenaRundenwechsel(tokens, regeln, alteRunde)` | flaches Änderungsobjekt + Nachschubzahl + wer sich erholt hat |
| `arenaFreieRandfelder(tokens, regeln, anzahl)` | zufällige freie Randfelder für Nachschub |
| `arenaLogZeile(a, ziel, erg)` | **die** Logzeile für alle drei Ansichten — damit die Regel „der Säbel wird nirgends benannt" an einer Stelle einzuhalten ist |

`arenaAngriff()` nimmt optional eine `vorgabe` (`{ probeBand, steigerungen, schaden }}`) — dafür
gedacht, jede Regelverzweigung deterministisch zu testen.

> **Das `module.exports` am Dateiende ist nur für Tests und `t_syntax.js`.** Per `require()`
> allein ist `js/arena.js` **nicht funktionsfähig**: Es ruft `js/regelwerk.js` und `js/kampf.js`
> auf, und unter Node ist jede Datei ihr eigener Modul-Scope. `tests/t_arena.js` lädt deshalb
> alle drei in **einen** `vm`-Kontext, genau wie der Browser.

**Initiative und Automatik (30.10.2026):**

| Funktion | Zweck |
|---|---|
| `arenaIniEintraege(tokens)` | die Teilnehmer einer Runde (Wild Cards einzeln, Diener als eine Gruppe) |
| `arenaIniTokens(eintrag, tokens)` | wer auf diesem Eintrag JETZT handelt (live, nicht eingefroren) |
| `arenaAusteilen(tokens, deck, zufall)` | → `{ reihe, index, deck, mischenNoetig }` |
| `arenaIniAmZug(ini, tokens)` / `arenaIniWeiter(...)` | aktueller bzw. nächster Eintrag, Gefallene übersprungen |
| `arenaIniFreigabe(eintrag, tokens)` | welche Figur freigegeben wird (auf der Diener-Karte: niemand) |
| `arenaIniBonus(ini, tokenId, tokens)` | der Joker-Zuschlag für diese Figur |
| `arenaNaechstesZiel(figur, tokens)` | nächster lebender Gegner |
| `arenaWeg(von, ziel, tokens, regeln, ausserId)` | kürzester Weg bis ans Ziel heran (Breitensuche); `[]` = steht schon dort, `null` = kein Weg |
| `arenaSchrittGierig(...)` | der alte gierige Schritt, jetzt nur noch Rückfall |
| `arenaSchrittZu(figur, ziel, tokens, regeln)` | ein Zug Bewegung, oder null fürs Stehenbleiben |
| `arenaDienerZug(id, ...)` / `arenaDienerRunde(...)` | ein Diener bzw. alle; liefert Änderungen, Logzeilen und den fortgeschriebenen Stand |
| `arenaIniLanden(...)` / `arenaIniNeueRunde(...)` | der Ablauf („wir landen auf Karte i", „neue Runde, neue Karten") |
| `arenaAngriffAenderungen(...)` / `arenaAngriffText(...)` | Firebase-Pfade und Logzeile eines Angriffs — **eine** Stelle für alle drei Ansichten |
| `arenaAnwenden(tokens, aenderungen)` | flache Pfade auf eine lokale Tokenkarte ziehen |
| `arenaMischen(ziel, quelle)` | zwei Änderungspakete **pfadsicher** zusammenlegen (siehe 8, Fehler 12) |
| `arenaWerteAusFigur(figur, name)` | Blatt → Token-Werte; **eine** Ableitung für Spielerbögen und NSC (5.4) |
| `arenaZustandAusFigur(figur, wundenMax)` | Wunden und „angeschlagen" aus dem Bogen, geklemmt |
| `arenaBesteWaffe(figur, art)` | die ANGELEGTE Waffe dieser Art, sonst die beste getragene — reicht nur noch an `waffeInHand()` in `js/regelwerk.js` weiter (04.11.2026) |
| `arenaDarfSteuern(token, meineKennung)` | darf **dieser** Spieler diese Figur ziehen? (4.1a) |
| `arenaFremdeFigur(token, meineKennung)` | gehört sie ausdrücklich jemand anderem? (nur für den Hinweistext) |

### 6.2 SL-Seite (`js/regie_vault.js`)

`arenaAufbauen` · `arenaFigurHinzu` · `arenaFreigeben` · `arenaRundeWeiter` · `arenaSaebel` ·
`arenaEntferne` · `arenaSetzeHp` · `renderArenaPanelHTML`

`arenaSetzeHp()` ist der Hebel für die festen Beats: HP auf 0 setzen tötet, ein Wert > 0 holt eine
gefallene Figur zurück.

### 6.3 Spieler-Seite (`karte.html`)

`startArena` / `stopArena` · `renderArena` · `arenaBewege` · `arenaGreifeAn` · `arenaTokenEl`

---

## 7. Testen

**`tests/t_arena.js`, 380 Prüfungen, im Repo.** Reines Node, kein Browser. Am 30.10.2026 für die
Umstellung komplett neu geschrieben (vorher 30 Prüfungen gegen das W100-System) und am selben
Tag um 88 Prüfungen für Initiative und Diener-Automatik erweitert; am 31.10.2026 um 52 für die
gedrehten Werte, das Abfolge-Audit und die Auswahl, die der Reihe folgt.

**Geladen wird wie im Browser**, nicht per `require()`: `js/regelwerk.js`, `js/kampf.js`,
`js/arena.js`, `js/arena_scenes.js` und `js/npcs.js` laufen in **einem** `vm`-Kontext. Unter
`require()` wäre jede Datei ihr eigener Scope, und `arena.js` sähe die anderen nicht.

**Geprüft wird gegen die REGEL, nicht gegen den Code.** Die Prüffelder:

0. **Die Abfolge einer Runde** (31.10.2026) — Bewegung und Angriff je **einmal**, in beliebiger
   Folge; eine gefallene oder angeschlagene Figur greift nicht an, bewegen darf sich die
   angeschlagene aber; nachgeladen wird erst in der **übernächsten** Runde; `arenaIniAmZug()`
   springt **nicht** vorwärts, `arenaIniLanden()` löst den Index beim Schreiben auf. Dazu der
   **Schuss aus der Nähe**: gegen die Parade, **ohne** Gang Up, nur mit handlicher Waffe, und ein
   fehlendes `fernHandlich` heißt NEIN. Die Auswahl im Schlachtfeld wird dafür **aus
   `arena_admin.html` geschnitten und ausgeführt**.

1. **Der Angriffswurf** — `4 − Parade` im Nahkampf, und dass der Fernkampf die Parade **nicht**
   nimmt; die drei Entfernungsbänder; der flache Wundenabzug samt Deckel.
2. **Gang Up** — allein 0, einer dazu +1, gedeckelt bei +4, ein Verbündeter des Ziels hebt einen
   Punkt auf, Tote zählen nicht, im Fernkampf gar nichts. Dazu die **Gegenprobe zur alten
   Hausregel**: Gegner, die am *Angreifer* stehen, dürfen seinen Angriff nicht mehr
   verschlechtern.
3. **Die Wirkung** — angeschlagen/Wunde/zweiter Haken wird zur Wunde, Statist fällt bei der
   ersten, Wild Card trägt drei, `wundenMax` überschreibt.
4. **Der Jaguar-Säbel** — jeder Treffer zerfällt einen Diener (auch ohne Wirkung), ein Misserfolg
   nicht, ohne Säbel nichts endgültig, gegen den Seelenlosen zählt der Schaden normal, und das
   **Log nennt den Säbel nirgends**.

5. **Die Initiative** (3.6) — vier Wild Cards plus **eine** Dienerkarte sind fünf Einträge; die
   Reihe ist nach Karte sortiert; das Deck wird kleiner; Gefallene bekommen keine Karte und
   werden beim Weiterschalten übersprungen; frischer Nachschub handelt auf der Dienerkarte mit;
   auf ihr wird **niemand** freigegeben, **auch nicht der letzte übrige Diener**; der Joker gibt
   nachweislich +2 auf Wurf *und* Schaden.
6. **Die Diener-Automatik** (3.7) — sie geht auf den **nächsten**, nicht auf den verwundeten und
   nicht auf den mit der schwächeren Parade; eigene Leute und Gefallene sind keine Ziele; sie
   läuft **geradeaus**, bleibt eingekesselt stehen, betritt kein besetztes Feld und verlässt das
   Brett nicht; ein angeschlagener Diener läuft, schlägt aber nicht zu; wer schon gehandelt hat,
   wird übersprungen; **kein Feld ist doppelt belegt**; der Seelenlose und die Spieler werden von
   der Automatik nicht angefasst.
7. **Das Blatt auf dem Token** (5.4) — die tragende Prüfung hier vergleicht die **von Hand
   gerechneten Vorlagen** in `js/arena_scenes.js` mit der mechanischen Ableitung: Harwick muss
   die `spieler`-Vorlage treffen, Cormac die `verbuendeter`-, der Seelenlose seine eigene. Driftet
   eines von beiden, ist eine Seite falsch, und am Tisch fällt es nicht auf. Dazu: Parade und
   Robustheit werden **gerechnet** statt abgeschrieben, die **beste** Waffe je Art gewinnt (das
   Messer steht im Testbogen absichtlich **vor** dem Säbel — sonst wäre „die erste" dasselbe wie
   „die beste"), ohne Waffe steht eine Null da und die Figur kann nicht schießen, eine unbekannte
   Ware bricht nichts, und eine **erfundene** Ware zählt **erst nach** `eigeneWarenSetzen()` —
   davor fällt sie still weg. Am Ende trägt die gestempelte Figur einen **echten Angriff**, sonst
   wäre nur geprüft, dass die Zahlen stimmen, nicht dass die Arena mit ihnen rechnen kann.
8. **Wer steuert welche Figur** (4.1a) — die eigene ja, eine fremde nein, eine **ohne
   Zuordnung jeder** (die Fallback-Regel als eigene Prüfung), Verbündete und Gegner nie. Dazu
   **„Zug beenden" aus `karte.html` geschnitten und wirklich ausgeführt**: Anna beendet ihren Zug
   und die Reihe steht auf Bert · **Bert kann Annas Zug nicht beenden** · eine freigegebene, aber
   nicht aktive Figur beendet nichts · ein veralteter Knopf schreibt nichts · der Letzte in der
   Reihe beendet die **Runde** nicht · landet die Reihe auf der Diener-Karte, handeln die
   Wiedergänger · ohne ausgeteilte Karten geht gar nichts.
9. **Der Wegfinder** (3.7a) — eine Mauer mit einer Lücke: Der Weg führt **durch die Lücke**,
   endet am Ziel angrenzend, besteht aus lauter freien und lauter angrenzenden Feldern, und
   derselbe Stand ergibt denselben Weg. Liegt die Lücke links, dreht er mit. Ohne Lücke gibt es
   keinen Weg, und dann greift der **Rückfall** — der geht wenigstens ein Feld näher, wenn noch
   eines frei ist. Das Ziel selbst sperrt den Weg nicht.

Dazu: angeschlagen sperrt den Angriff und nicht die Bewegung · Nachladen erst die Runde darauf ·
eine liegende Figur ist kein Ziel · die Vorlagen stimmen mit den NSC-Blättern überein · die alten
W100-Funktionen existieren nachweislich **nicht mehr** · und die gemessenen Trefferchancen
(24,7 % allein, 81,3 % mit vollem Gang Up).

**Eine Prüfung auf die FORM der Pakete, nicht nur auf ihren Inhalt:** In keinem erzeugten
Änderungspaket darf ein Pfad Vorfahre eines anderen sein. Firebase lehnt so ein `update()`
**komplett** ab, und zwar erst am Tisch — siehe Fehler 12.

**Zuletzt hundert ECHTE Angriffe** (Abschnitt 13 des Skripts). Alle Prüfungen davor geben das
Band per `vorgabe` vor, damit sich jede Regelverzweigung einzeln festnageln lässt — damit liefe
der Pfad durch `wurf()` aber **nie**, und genau der läuft am Tisch. Geprüft wird, dass nichts
wirft, dass ein Treffer immer einen Schadenswurf hat und ein Misserfolg keinen, dass alle 200
Logzeilen brauchbar sind und **keine den Säbel verrät** — und dass dabei wirklich Treffer *und*
Misserfolge vorkommen, sonst prüft der Block zu wenig.

**Zwei Gegenproben belegen, dass die Prüfungen greifen** — beide Male nennt der Fehlertext den
Fehler wörtlich:

| Gegenprobe | Ergebnis |
|---|---|
| alte „Bedrängnis"-Richtung eingesetzt | **7 Prüfungen** schlagen an, darunter *„Gegner am ANGREIFER verschlechtern seinen Angriff nicht mehr"* → `-2` |
| Parade fälschlich auch im Fernkampf | **2 Prüfungen**, *„Fernkampf nimmt die Parade NICHT"* → `-4` |
| Diener gehen auf den **entferntesten** | **3 Prüfungen**, *„geht auf den NAECHSTEN, nicht auf den verwundeten"* → `"p_fern"` |
| jeder Diener bekommt eine **eigene** Karte | **11 Prüfungen**, die erste listet alle acht Einträge statt fünf |
| die Dienerzüge rechnen auf dem **alten** Stand | **2 Prüfungen**, darunter *„kein Feld ist doppelt belegt"* → `["b_d2","c_d3","6:4"]` |
| die Dienerkarte gibt doch jemanden frei | **2 Prüfungen**, *„auch der letzte übrige Diener wird nicht freigegeben"* |
| Schritt ohne Luftlinien-Entscheid | **1 Prüfung**, *„und geradeaus, nicht schräg daneben"* |
| Joker zählt nicht auf den Schaden | **1 Prüfung** → `[7,7]` |
| `arenaMischen()` weist stumpf zu | **7 Prüfungen**, darunter *„Nachschub, der sofort losläuft: kein Pfadkonflikt"* → `["tokens/neu","tokens/neu/x"]` |
| wieder nur der gierige Schritt statt des Wegfinders | **5 Prüfungen**, darunter *„die Figur läuft los, statt stehen zu bleiben"* → `null` |
| erste statt beste Waffe | **2 Prüfungen**, *„die bessere Nahkampfwaffe gewinnt"* → `1` |
| Parade abgeschrieben statt gerechnet | **4 Prüfungen**, darunter alle drei Vorlagen: *`["parade: 4 statt 6"]`* |
| Spielerfigur ist keine Wild Card | **1 Prüfung** |
| jeder darf jede Spielerfigur ziehen | **3 Prüfungen**, darunter *„Bert kann Annas Zug NICHT beenden"* |
| Fallback-Regel entfernt (ohne Zuordnung darf niemand) | **2 Prüfungen** |
| Wettlauf-Schutz am Knopf entfernt | **1 Prüfung**, der veraltete Klick springt auf `index: 2` |
| Spieler schließt die Runde selbst ab | **1 Prüfung** → `{"initiative/index":null}` **ohne** Rundenwechsel |
| Prüfung „ist diese Figur am Zug" entfernt | **1 Prüfung** |

**Ein Integrationstest über die Ansichten gehört nicht ins Repo** (Skill `pnp-safe-test`) und
liegt im Scratchpad der jeweiligen Session: lokaler HTTP-Server, abgefangene
`firebase-config.js`, **Fake-Firebase im Speicher**. **Vor jeder Interaktion `db === null`
prüfen** — die echte Firebase-Datenbank ist produktiv.

---

## 8. Fehlergeschichte

Die Fehler beim Bau, alle vom Test gefunden:

1. **TDZ im Adminpanel.** Die neuen `let`-State-Variablen (`arenaStateRef` usw.) standen zunächst
   bei den Arena-Funktionen weiter unten in `js/regie_vault.js`. Der Firebase-Init-catch-Zweig
   ruft `renderAll()` aber **synchron** auf — das Panel brach mit *„Cannot access
   'arenaStateScene' before initialization"* ab. Lösung: nach oben zu den übrigen
   State-Variablen. **Das ist in diesem Projekt schon zum zweiten Mal passiert** (siehe
   CLAUDE.md-Changelog 2026-08-20) — bei jedem neuen Live-Listener in `regie_vault.js` daran
   denken.
2. **Feldzahl im Test hartcodiert.** Nach der Vergrößerung auf 16×16 schlug die Randfeld-Prüfung
   fehl, weil sie `x === 7 || y === 7` erwartete. Auf `regeln.breite/hoehe` umgestellt.
3. (Aus derselben Session, verwandt:) `forEach(funktion)` reicht den **Index** als zweites
   Argument durch. Beim Abspann landete der in einem Tiefen-Parameter und ließ alles ab dem
   fünften Element ausfallen. Wenn eine Funktion optionale Zweitparameter hat, **nie** direkt an
   `forEach` übergeben.
4. **Nachträglich ergänzte Funktion fehlte in `module.exports`.** `arenaBossLebt()` kam per Edit
   nach dem ursprünglich geschriebenen Export-Block dazu und wurde dort nicht nachgetragen — im
   Browser unauffällig (globale Funktion), aber für Node-Tests unerreichbar. Beim Audit des
   Handbuchs gefunden, weil die API-Tabelle (6.1) sie auflistete. **Bei jeder neuen Funktion in
   `js/arena.js` den Export-Block am Dateiende mitpflegen.**
5. **`arenaAufbauen()` stellte NSC als Spielerfiguren auf.** `CHARACTERS` (`js/characters.js`)
   enthält die sieben **NSC** der Kampagne, nicht die Spielercharaktere — der Aufbau zog diese
   Namen und produzierte Züge wie „James Harwick schießt auf Der Seelenlose". In 9.2 stand das
   zunächst als „ungeprüft"; das Audit hat es bestätigt. Jetzt setzt der Aufbau vier generische
   „Spieler 1–4", die die SL über „+ Spieler" selbst benennt; mitkämpfende NSC (Harwick, Cormac)
   kommen auf demselben Weg dazu.
6. **Figuren ohne Fernkampfwert konnten auf Distanz „schießen".** `arenaAngriffsart()` prüfte nur
   die Entfernung; bei `fernWert 0` ist die Schwelle zwar 0 (nie gut/normal), aber **mit Mastery
   blieb das Band „schlechter Erfolg" (1–50) offen** — der Seelenlose schoss mit Mindestschaden,
   obwohl er keine Fernwaffe hat. Im Test an der Logzeile „Der Seelenlose schießt auf Harwick"
   aufgefallen. Fix: Fernkampf setzt eine Schusswaffe voraus (in `arenaAngriffsart()`, wirkt damit
   auf alle drei Ansichten gleichzeitig). **Bleibt nach der Umstellung nötig und ist dort schärfer
   begründet:** „Schießen" ist auch ungelernt eine gültige Probe (d4−2), ein fehlender
   Fertigkeitswert hindert also niemanden am Abdrücken — nur die fehlende **Waffe** tut das.

### Aus der Umstellung auf Savage Worlds (30.10.2026)

7. **`arena_admin.html` lud weder `js/regelwerk.js` noch `js/kampf.js`**, und `karte.html` kein
   `kampf.js`. Solange die Arena ihre Regeln selbst rechnete, brauchte sie nichts davon; mit der
   Umstellung wäre sie **zur Laufzeit still gebrochen**. Gefunden, weil ich vor dem Umbau die
   Script-Tags aller drei Seiten nachgesehen habe — genau die hängende Referenz, die dieses
   Projekt schon einmal gekostet hat.
8. **Namenskollision mit `js/kampf.js`.** `karte.html` hatte eine eigene globale Funktion
   `mischen()` (der Abspann-Mischer), und `kampf.js` bringt eine für das Aktionsdeck mit. Zwei
   Funktionsdeklarationen gleichen Namens im globalen Scope überschreiben sich **still** — die
   später geladene gewinnt. Vor dem Einbau per `grep` über alle Exporte von `kampf.js` gesucht;
   die Abspann-Funktion heißt jetzt `abspannMischen()`. **Bei jeder neuen gemeinsam genutzten
   Datei auf Kollisionen prüfen, nicht hoffen.**
9. **Zwei meiner eigenen Prüfungen waren falsch, nicht der Code.** Ich erwartete gegen einen
   Diener (Parade 5) einen Modifikator von −4 statt −3 — schlicht falsch gerechnet. Und eine
   Prüfung verbot das Wort „mastery" in `js/arena.js` und meldete damit meinen **eigenen
   Kommentar**, der erklärt, wohin das Feld gewandert ist. Sie ist **geschärft statt gelockert**
   (verboten ist jetzt die *Verwendung*: `.mastery`, `mastery:`) — eine Prüfung, die man für den
   eigenen Text aufweicht, lässt beim nächsten Mal eine echte Verwendung durch (Lehre vom
   23.10.).
10. **Eine neue Prüfung hat dem nachfolgenden Block den Zustand umgeworfen.** Mein erster Einschub
    in `tests/t_regie_wuerfel.js` rief `setKampf()` mitten in einer laufenden Kette, worauf drei
    spätere Prüfungen anschlugen. Sie steht jetzt in **eigener Umgebung am Dateiende**. Dazu hatte
    ich bei `angriffAnsagen(art, von, ziel)` Angreifer und Ziel getauscht. Dieselbe Sorte Fehler
    wie am 17.10.
11. **Die CRLF/LF-Falle, wieder.** `karte.html`, `arena_admin.html` und `js/regie_vault.js` haben
    CRLF, meine Skript-Literale LF — der erste Lauf fand nichts und brach vor dem Schreiben ab.
    Die Ersetzungs-Helfer rechnen die Zeilenenden jetzt zentral um.

### Aus der Initiative und der Diener-Automatik (30.10.2026, Fortsetzung)

12. **Zwei Pfade, von denen einer Vorfahre des anderen war — und Firebase lehnt so ein `update()`
    KOMPLETT ab.** Beim Austeilen schreibt die Arena `initiative` (das ganze Objekt), beim Landen
    auf einer Karte `initiative/index`; beides landet im **selben** atomaren Paket. Derselbe Fall
    noch unauffälliger bei den Tokens: Der Rundenwechsel setzt frischen Nachschub als ganzes
    `tokens/t7`, und derselbe Diener läuft auf der Dienerkarte derselben Runde los →
    `tokens/t7/x`. Es wäre **nicht halb** schiefgegangen, sondern ganz, und erst am Tisch.
    Behoben mit **`arenaMischen()`**: Gibt es den Vorfahren schon als Objekt, wandert das Feld
    hinein; ist er auf `null` gesetzt, wird das Feld verworfen. Dazu eine Prüfung auf die **Form**
    jedes Pakets, nicht nur auf seinen Inhalt — gefunden habe ich es beim Gegenlesen der
    Schreibpfade, nicht durch einen Test.
13. **Die Dienerkarte gab den letzten übrigen Diener frei.** `arenaIniFreigabe()` hing allein an
    „genau eine Figur auf diesem Eintrag" — bei einem einzigen verbliebenen Wiedergänger wurde er
    damit an die Spieler durchgereicht. Praktisch hätte `karte.html` ihn wegen des Typs nicht
    steuerbar gemacht, aber die Anzeige hätte gelogen und das Schlachtfeld ihn als freigegeben
    markiert. **Die Dienerkarte ist die Karte der GRUPPE; wie viele darauf stehen, ändert daran
    nichts.** Von meiner eigenen Prüfung gemeldet, bevor etwas falsch wurde.
14. **Die Diener drifteten sichtbar zur Seite.** Chebyshev zählt diagonal wie gerade, also sind
    „schräg weg in x, näher in y" und „geradeaus" **gleich weit**. Der Entscheid lief über die
    Token-Kennung, und damit zog die ganze Reihe nach links, obwohl das Ziel genau vor ihr stand.
    Jetzt entscheidet bei gleicher Entfernung die **Luftlinie**, die Kennung erst danach.
    **Aufgefallen ist es an einer Gegenprobe, nicht beim Hinsehen** — die Prüfungen waren alle
    grün, weil keine nach der Richtung gefragt hatte.
15. **Zwei eigene Prüfungen waren nicht in der Lage, ihren Fehler zu sehen.** Die Kollisionsprüfung
    las `erg.tokens` statt den Stand, den das `update()` erzeugt — in der kaputten Variante ist
    das schlicht der unveränderte Ausgangsstand, also meldete sie OK. Und eine zweite prüfte
    „x ist nicht mehr 2" und war damit auch auf dem kaputten Code grün. Beide prüfen jetzt das
    Ergebnis des Pakets. **Eine Prüfung, die den Fehler nicht sehen KANN, prüft nichts.**
16. **Eine falsche Erwartung, nicht der Code:** Ich hatte „drei Felder weg, Bewegung 2, also
    kommt er nicht an" notiert — nach zwei Feldern steht er angrenzend und schlägt im **selben**
    Zug zu. Bewegung und Handlung, wie bei jeder anderen Figur auch.
17. **Zweimal eine Waren-ID erfunden** (`dolch` statt `messer`, `steinschlosspistole` statt
    `pistole`). `arenaWerteAusFigur()` ignoriert eine unbekannte Ware korrekt — **deshalb war das
    gefährlich**: Die Prüfung „die bessere Waffe gewinnt" hätte bestanden, ohne dass überhaupt
    zwei Waffen im Spiel waren. Jetzt prüft eine eigene Zeile vorher, dass es alle drei Waren
    wirklich gibt.
18. **Und dieselbe Sorte noch einmal, eine Ebene tiefer:** Im Testbogen stand der **Säbel
    zuerst**. Damit war „die erste Waffe" dasselbe wie „die beste", und die Gegenprobe (Code
    nimmt die erste) schlug **nicht** an. Das Messer steht jetzt absichtlich vorn — danach schlägt
    sie an. **Eine Prüfung, deren beide Seiten zusammenfallen, prüft nichts** (dieselbe Lehre wie
    bei der blinden Parade-Prüfung vom 30.10. Mittag).

### Aus dem Abfolge-Audit (31.10.2026)

19. **`arenaAngriff()` prüfte weder `hatAngegriffen` noch `angreifer.tot`** — nur die Oberfläche
    tat es, indem sie die Klickziele versteckte. Eine gefallene Figur konnte zuschlagen, eine, die
    schon angegriffen hatte, ein zweites Mal. `arenaBewegungErlaubt()` prüfte beides seit je
    selbst, und `arenaKannAngreifen()` gab es für genau diese Frage — **sie wurde nirgends
    gerufen.** Behoben, dieselbe Linie wie bei `arenaDarfSteuern()`.
20. **Das Nachladen war wirkungslos.** `runde > entladenSeitRunde` lud schon in der *nächsten*
    Runde nach, womit eine Steinschlosspistole **jede Runde** feuerte. Drei Dokumente sagten
    „übernächste". Siehe 4.3.
21. **Der Phantom-Zug.** `arenaIniAmZug()` löste vorwärts auf und lief damit der Freigabe voraus —
    und „weiter" zählte von dort, wodurch die Figur anschließend **übersprungen** wurde. Siehe
    3.6, „Kein Phantom-Zug".
22. **Mein erster Fix machte es schlimmer.** Ich hatte `arenaIniWeiter()` auf den *aufgelösten*
    Index umgestellt und die Vorwärtsauflösung in `arenaIniAmZug()` stehen lassen. Gemessen: Cord
    wurde dann **wirklich übersprungen** (`rundeFertig: true`, obwohl er noch stand). Die Ursache
    lag nicht beim Weiterzählen, sondern bei der Auflösung selbst — **erst die Messung nach dem
    Fix hat das gezeigt**, nicht das Nachdenken davor.
23. **Eine Gegenprobe, die nichts bewies.** „Der Versetzen-Modus endet beim Zugwechsel" stand im
    Test, ohne ihn vorher **einzuschalten** — beide Seiten standen auf `false`, und das Entfernen
    des Zurücksetzens schlug nicht an. Jetzt wird er erst gesetzt; danach schlägt sie an.
    **Eine Gegenprobe, die nicht anschlägt, kann auch eine schlechte Probe sein** (dieselbe Lehre
    wie am 15.10. bei der CSS-Prüfung).
24. **Der abgelehnte Angriff schwieg.** Hendriks Meldung: *„Ich kann manchmal nicht
    angreifen. Woran liegt das?"* Die Engine nennt **sieben** Gründe — und beide Ansichten
    warfen sie weg (`if (!erg.ok) return;`, ohne ein Wort). **Gemessen war es ein Fall, und
    zwar der häufigste:** Eine **angeschlagene** Figur las in der Spieleransicht *„Gegner
    anklicken zum Angreifen"*, weil der Hinweisblock nur `hatAngegriffen` prüfte und
    `angeschlagen` dort **gar nicht vorkam** — die Oberfläche forderte zu etwas auf, das die
    Engine ablehnt. **Die Regel selbst war richtig** (Bibel 4.4a: angeschlagen heißt Bewegung
    ja, Angriff nein), und der Code hielt sich daran; falsch war allein die Anzeige. Das ist
    der Unterschied zu den Befunden der Vortage, wo die Regel nirgends stand.
    Behoben in zwei Richtungen: Der Grund wird jetzt **vorher** gesagt (die Aufforderung hängt
    an `arenaKannAngreifen()`, derselben Funktion, die die Engine fragt) **und hinterher**, als
    Meldung statt Schweigen. Die Sätze stehen in `arenaAngriffGrundText()` in `js/arena.js` —
    es gibt drei Ansichten, und drei Fassungen derselben Begründung laufen auseinander.
25. **`arenaKannAngreifen()` beantwortete ihre eigene Frage nicht.** Sie prüfte `tot` und
    `angeschlagen`, **nicht** `hatAngegriffen` — obwohl `arenaAngriff()` das direkt danach
    prüfte. Eine Funktion mit diesem Namen, die die Rundenbeschränkung nicht kennt, lädt jede
    Oberfläche dazu ein, sie zu vergessen, und **genau das ist mir beim Umbau des
    Spieler-Hinweises passiert**: Mein erster Fix hätte einer Figur, die schon zugeschlagen
    hat, wieder *„Gegner anklicken"* gezeigt. Jetzt kennt sie alle drei, und die Wache lebt an
    **einer** Stelle statt an zwei.
26. **Und der Folgefehler daraus, von der Bestandsprüfung gefangen:** Die Grundzuordnung in
    `arenaAngriff()` lautete `angreifer.tot ? 'tot' : 'angeschlagen'` — mit der erweiterten
    Wache fiel `hatAngegriffen` in denselben Zweig und hätte den Satz *„ist angeschlagen"* zu
    lesen bekommen. **Seit die Oberfläche den Grund anzeigt, ist eine falsche Kennung eine
    falsche Auskunft am Tisch**, nicht bloß ein internes Detail.
27. **Eine Prüfung, die an ihrem eigenen Erklärtext anschlug.** „`arena_admin.html` verwirft den
    Grund nicht mehr stillschweigend" suchte nach `if (!erg.ok) return;` — und fand es im
    **Kommentar**, der die alte Zeile zitiert. **Geschärft statt gelockert** (dieselbe Lehre wie
    am 30.10.): Sie blendet Kommentare aus, bevor sie sucht. Verboten ist die *Verwendung*,
    nicht die Erwähnung.
28. **`var(--accent)` ohne Definition.** `karte.html` benutzte die Variable **zweimal** und
    definierte sie **nie**. Eine ungültige `var()` ohne Fallback macht die ganze Eigenschaft
    *invalid at computed-value time*, und der Browser nimmt den **Initialwert** — bei
    `outline-color` ist das `currentColor`. **Die Angriffs-Umrandung hatte damit die Farbe des
    Tokens, um das sie liegt**, also praktisch keine. Unsichtbar, und in der Konsole steht
    nichts. Insgesamt **elf** solche Stellen über drei Seiten, gefunden von einer neuen Prüfung
    in `tests/t_syntax.js`: Die vom 15.10. fragt nur, ob jede benutzte **Klasse** eine Regel hat
    — Variablen kannte sie nicht.
29. **Die hängende Referenz, zum dritten Mal in diesem Projekt.** Mein erster Anlauf griff in
    `tokenEl()` auf `sel` zu; die Funktion bekommt nur `id`, `t` und `angreifbar`. Es wäre beim
    ersten angreifbaren Ziel geworfen, wie `tokens` in `arenaTokenEl()` am 31.10. Der Stand
    kommt jetzt aus `snap`, und eine Prüfung schneidet den Funktionskörper und verbietet `sel`
    darin.
30. **`el.textContent = t.symbol` löscht alle Kindknoten.** Ich hatte das Zielzeichen **davor**
    angehängt — bei jedem Token **ohne** eigenes Bild wäre es damit sofort wieder weg gewesen,
    und das ist die Mehrzahl. **Nur durch Nachlesen der Reihenfolge zu finden**, nicht durch
    Hinsehen. Eine Prüfung nagelt jetzt fest, dass das Zeichen hinter dem `textContent`-Zweig
    hängt.

---

## 9. Was noch offen ist

### 9.1 Von Hendrik zu entscheiden

- **Werte.** Sie stammen aus den Blättern (5.1), mit zwei bewusst gedrehten Zahlen seit dem
  31.10.2026 — **aber ob der Kampf sich gut anfühlt, zeigt erst ein Durchlauf.**
  - **Entschieden am 31.10.2026** (Hendrik, nach der Messung): Der Seelenlose trägt
    **`wundenMax` 6** statt 3 → rund **2,6 statt 1,7 Runden**, bis fünf Spieler ihn niederschlagen.
    Die Diener gehen auf **Kämpfen d4 · Parade 4 · Robustheit 4** → ein Schlag trifft noch zu
    25,1 % statt 50,1 % und verwundet zu 8,1 % statt 16,4 %; umgekehrt fallen sie bei 54,8 %
    statt 39,1 % der Spielertreffer.
  - Die Rechnung, die man dabei im Kopf haben sollte: Der Seelenlose hat Robustheit 8, eine Wunde
    braucht also **12 Schaden**, und Waffe + Stärke (d6 + d8) kommt im Mittel auf 8 — ohne Ass
    wird er **nicht** verwundet.
  - **Der eigentliche Hebel ist aber die Menge, nicht der Einzelwert:** Gang Up gibt +4, und daran
    hängt der Sprung von 16,6 % auf 83,3 % Treffer gegen einen umstellten Spieler. Wird es am
    Tisch zu hart oder zu lasch, dreht `nachschubAlle` / `nachschubAnzahl` mehr als jede
    Würfelstufe.
  - Stellschrauben in dieser Reihenfolge:
  1. `nachschubAlle` / `nachschubAnzahl` (Druck — der stärkste Hebel),
  2. `wundenMax` des Seelenlosen (Länge des Kampfes),
  3. `waffe`/`staerke` der Spieler (ihre Durchschlagskraft),
  4. seine `robustheit` — **zuletzt und mit Vorsicht:** ein Punkt mehr macht ihn gegen eine
     normale Gruppe praktisch unverwundbar.
- **Hat der Seelenlose eigene Fähigkeiten** jenseits von Zuschlagen und Beschwören? Mechanisch
  ist er ein sehr starker Nahkämpfer mit Parade 8. Savage Worlds hätte dafür Talente (er trägt
  in `js/npcs.js` bereits *Drohende Gegenwart*, *Standhaft*, *Totenstill*, *Vorahnung*) — die
  wirken in der Arena **nicht**, weil das Brett nur die Zahlen kennt.
- **Darf der Säbelträger einen liegenden Diener nachstoßen**, damit er nicht wieder aufsteht
  (siehe 4.2)? Das wäre eine echte neue Taktik. Bewusst nicht eingebaut.
- **Angeschlagen ohne Willenskraft-Probe** (3.4) — die bewusste Abweichung. Falls es am Tisch
  fehlt, ist es ein Wurf je angeschlagener Figur beim Rundenwechsel.

### 9.2 Bekannte Lücken

- ~~Gegner werden von der SL bewegt wie Spielerfiguren, es gibt keine Gegner-KI~~ — **gilt seit
  dem 30.10.2026 nur noch für den Seelenlosen** (Hendriks Vorgabe: er steuert ihn selbst). Die
  **Wiedergänger handeln von selbst** (3.7). Ob sich das am Tisch gut anfühlt, muss der erste
  Durchlauf zeigen.
- ~~Keine Initiative~~ — **behoben am 30.10.2026** (3.6, Bibel 4.4b): Dasselbe Aktionsdeck wie
  der Kampfmodus, eine Karte je Wild Card, eine für alle Diener, und die Reihe schaltet die Runde
  selbst weiter.
- ~~Der Weg der Diener ist ein gieriger Schritt, kein Wegfinder~~ — **behoben am 30.10.2026
  (Fortsetzung 4), siehe 3.7a.** Gesucht wird mit einer Breitensuche; der gierige Schritt ist nur
  noch der Rückfall für den Fall, dass es gar keinen Weg gibt. **Was bleibt:** keine Deckung,
  keine Sichtlinien, keine Zonen — und eine Figur, die *vollständig* eingemauert ist, bleibt
  stehen. Das ist dann auch richtig.
- **Der Joker wirkt nur auf Wurf und Schaden**, nicht auf „handelt, wann er will": Die Reihe steht
  fest, sobald sie ausgeteilt ist. Die SL kann aber jeden Eintrag anklicken und damit von Hand
  vorziehen — das ist der Joker in der Praxis.
- **Talente wirken nicht.** Das Brett kennt nur die Zahlen am Token (siehe 9.1).
- **Kein Rückgängig.** Ein Fehlklick beim Bewegen lässt sich nur über „HP setzen" bzw. erneutes
  Freigeben grob korrigieren.
- **Keine Sichtlinien, keine Deckung, keine Zonen** — die Ritualkammer ist als offene Fläche
  modelliert, obwohl das Bild Pfeiler zeigt.
- ~~Spielerfiguren tragen die Namen aus `js/characters.js`~~ · ~~die Namen der echten
  Spielercharaktere stehen nirgends im Repo~~ — **beides überholt.** `CHARACTERS` sind die NSC
  (Fehlergeschichte Nr. 5), und seit dem 15.10.2026 liegen die Charakterbögen in der Sitzung:
  Das Schlachtfeld holt die echten Figuren mit ihren eigenen Werten (5.4). **Was bleibt:** Die
  Werte werden **gestempelt**, nicht live gespiegelt — steigert ein Spieler mitten im Gefecht,
  braucht es „↻ Werte nachziehen".
- ~~Solange eine Figur freigegeben ist, darf sie JEDER Spieler bewegen~~ — **behoben am
  30.10.2026** (4.1a): Mit Zuteilung steuert nur der eigene Spieler. **Was bleibt:** Eine Figur
  **ohne** Zuteilung bleibt für jeden beweglich, und das ist Absicht (siehe die Fallback-Regel).
- **Wunden der Spieler fließen nicht in ihre Bögen zurück.** Das ist Absicht (der Heldenbrief ist
  der einzige Schreiber auf einer Figur, 5.4), aber es heißt auch: Was im Finale passiert, steht
  danach nicht im Bogen. Der Weg dafür wäre das **Postfach**, das `wunde` und `angeschlagen`
  schon kennt — ob eine Wunde auf dem Brett eine Wunde im Bogen sein soll, ist eine
  Spielentscheidung und keine technische.
- **Firebase-Regeln** für `arenaState` müssen freigegeben werden, siehe 5.3
  ([firebase-rules.json](firebase-rules.json)).
- **Kein Zugriffsschutz auf der Datenbank.** Die Regeln erlauben Lesen und Schreiben ohne
  Anmeldung, und die Datenbank-URL steht im öffentlichen Repo. Praktisch muss jemand das Repo
  finden und die Pfade kennen; der Schaden wäre verlorener Kampagnenstand, keine
  personenbezogenen Daten. Nachrüstbar mit anonymer Firebase-Anmeldung — eine Zeile
  `signInAnonymously()` je Seite und `"auth != null"` statt `true` in den Regeln.

### 9.3 Sinnvolle nächste Schritte

1. Einen Probekampf durchspielen und die Werte justieren (9.1) — jetzt mit Initiative und
   handelnden Wiedergängern, also erstmals ein Ablauf, der sich von selbst trägt.
2. Entscheiden, ob der Seelenlose eine Sonderfähigkeit bekommt.
3. Erst danach über Komfort nachdenken (Rückgängig, Deckung, Wegfinder) — vorher weiß
   niemand, ob es das überhaupt braucht.
