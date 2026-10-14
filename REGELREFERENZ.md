# Regelreferenz — Korsaren

Schnelles Nachschlagen am Tisch. **Die Regel selbst steht in
[KAMPAGNEN-BIBEL.md](KAMPAGNEN-BIBEL.md), Abschnitt 4** — hier steht ihre Kurzfassung plus
alle Listen dieser Kampagne.

> Gespielt wird **Savage Worlds**. Savage Worlds hat keinen SRD, und die Fan License erlaubt
> nicht, Regeltext aus dem Buch zu übernehmen — dieses Repo ist öffentlich. Alles hier ist
> deshalb selbst geschrieben: Mechanik übernommen, Worte eigene. Für Regelfragen, die hier
> nicht beantwortet sind, gilt das Original.

---

## Spickzettel

**Die Probe.** Ein Würfel, Zielwert **immer 4**. Nichts wird addiert. Dazu wirft jede
Heldenfigur einen **Wild Die** (separater d6) — **das höhere der beiden Gesamtergebnisse
zählt**, nie die Summe. Statisten haben keinen Wild Die.

**Ass (explodierender Würfel).** Zeigt ein Würfel **seine eigene Höchstzahl**, wird er sofort
erneut geworfen und addiert — Kettenreaktion möglich. Maßgeblich ist die Höchstzahl *dieses
einen Würfels*: Wer d8 hat, dessen Wild Die ist trotzdem ein d6 und explodiert bei einer 6.

**Steigerung.** Je **volle 4 Punkte über dem Zielwert**:

| Ergebnis | 4–7 | 8–11 | 12–15 | 16+ |
|---|---|---|---|---|
| | Erfolg | 1 Steigerung | 2 Steigerungen | 3 Steigerungen |

Eine Steigerung hat **nichts** mit dem Maximalwurf zu tun. Ein d12 mit einer 8 bringt eine,
ohne zu explodieren; ein d4, der auf 4 explodiert und 3 nachwirft, bringt mit 7 keine.
Im Kampf heißt eine Steigerung beim Schadenswurf mehr Schaden.

**Erschwernis** ist ein **flacher Modifikator**, keine höhere Zielzahl und keine gesenkte
Würfelstufe. „Du brauchst eine 8" **ist** −4, weil der Zielwert immer 4 bleibt:

| Modifikator | +2 | 0 | −2 | −4 |
|---|---|---|---|---|
| nötig | 2 | 4 | 6 | 8 |

**Wunden.** Jede zieht flach **1** ab, höchstens 3; die vierte ist *außer Gefecht*.
Überladung zieht ebenso ab. **Angeschlagen** kostet **keinen** Abzug — das ist eine
Zeitstrafe, keine Werteinbuße.

**Bennie.** 3 je Sitzung (mit *Glückspilz* 4). Einer wiederholt eine misslungene Probe
vollständig — das bessere Ergebnis zählt, wobei erst das Band zählt und dann die Zahl.

**Schießen.** 1701 ist alles Vorderlader: **ein Schuss**, dann nachladen — das dauert (in der Arena: erst in der übernächsten Runde wieder bereit). Jeder Schuss verbraucht **eine Ladung**; der Vorrat steht an der Figur, nicht an der Waffe. Ohne Ladungen ist die Waffe ein teurer Knüppel. Abgezogen wird von Hand — nicht jede Schießen-Probe ist ein Schuss.

**Kritischer Patzer.** Beide Würfel zeigen eine natürliche 1.

**Ungelernt** ist d4 mit **−2** — nicht „gar kein Würfel". Gelingt also, nur selten.

---
<!-- ERZEUGT:ANFANG — alles bis ERZEUGT:ENDE kommt aus js/regelwerk.js. Nicht von Hand ändern, sondern `node tools/regelreferenz.js` laufen lassen. -->

## Attribute

Fünf Stück, jedes beginnt auf d4. Stärke und Konstitution tragen bewusst **keine**
Fertigkeiten — sie werden direkt gewürfelt.

| Attribut | Kurz | Wofür | Fertigkeiten daran |
|---|---|---|---|
| **Geschicklichkeit** | Ges | Schnell und sicher in der Bewegung. | 6 |
| **Verstand** | Ver | Gebildet, aufmerksam, schlagfertig. | 7 |
| **Willenskraft** | Wil | Mutig, standhaft, überzeugend. | 3 |
| **Stärke** | Stä | Roh und körperlich durchsetzungsfähig. | 0 |
| **Konstitution** | Kon | Zäh. Hält aus, was andere umwirft. | 0 |

## Fertigkeiten

Jede hängt an **genau einem** Attribut. Eine Stufe kostet 1 Punkt bis zur Höhe ihres
Attributs, darüber 2 — ein hohes Attribut macht also alles billiger, was daran hängt.
**Kernfertigkeiten** (Athletik, Heimlichkeit, Aufmerksamkeit, Allgemeinwissen, Überreden) starten frei auf d4.

| Fertigkeit | Attribut | Kern | Wofür |
|---|---|---|---|
| **Athletik** | Geschicklichkeit | ja | Klettern, springen, Gleichgewicht halten. |
| **Diebeskunst** | Geschicklichkeit | — | Schlösser, Taschen, fremde Schubladen. |
| **Heimlichkeit** | Geschicklichkeit | ja | Ungesehen bleiben, lautlos gehen. |
| **Kämpfen** | Geschicklichkeit | — | Klinge, Faust, alles auf Armlänge. |
| **Schießen** | Geschicklichkeit | — | Pistole, Muskete, Kanone. |
| **Segeln** | Geschicklichkeit | — | Takelage, Ruder, ein Schiff am Wind halten. |
| **Allgemeinwissen** | Verstand | ja | Was ein gebildeter Mensch eben weiß. |
| **Aufmerksamkeit** | Verstand | ja | Sehen, hören, bemerken, was nicht stimmt. |
| **Gassenwissen** | Verstand | — | Wer wen kennt, und wo man besser nicht fragt. |
| **Handel** | Verstand | — | Werte einschätzen, feilschen, Geschäfte machen. |
| **Handwerk** | Verstand | — | Reparieren, bauen, aufbrechen. |
| **Heilkunde** | Verstand | — | Blut stillen, Knochen richten, Fieber senken. |
| **Navigation** | Verstand | — | Karten, Sterne, Strömungen, Wetter. |
| **Einschüchtern** | Willenskraft | — | Jemanden dazu bringen, klein beizugeben. |
| **Provozieren** | Willenskraft | — | Jemanden aus der Fassung bringen. |
| **Überreden** | Willenskraft | ja | Jemanden auf deine Seite bringen. |

## Ränge

Je vier Steigerungen ein Rang. Am Rang hängen die Talente — das ist sein eigentlicher
Zweck. Neue Figuren sind Novize, sofern die Spielleitung nichts anderes freigibt.

| Rang | ab Steigerung | Talente, die er freischaltet |
|---|---|---|
| **Novize** | 0 | 20 |
| **Erfahren** | 4 | 15 |
| **Veteran** | 8 | 5 |
| **Heroisch** | 12 | 1 |
| **Legendär** | 16 | 0 |

## Was eine Steigerung kaufen kann

| Art | Einschränkung |
|---|---|
| **Ein Attribut eine Stufe höher** | Nur einmal je Rang — danach ist dieser Weg bis zum nächsten Rang zu. |
| **Ein neues Talent** | Rang und Mindestwerte müssen erfüllt sein. |
| **Zwei Fertigkeiten je eine Stufe** | Nur solange beide danach ihr Attribut nicht übersteigen. |
| **Eine Fertigkeit über ihrem Attribut** | Kostet die ganze Steigerung — dafür geht es dort weiter, wo es sonst nicht weitergeht. |
| **Eine neue Fertigkeit auf d4** | Etwas, das du bisher gar nicht konntest. |

## Talente (41)

Eine neue Figur hat 1 freies Talent; jedes weitere kostet 2 Punkte aus Schwächen.
Der **Rang ist eine harte Sperre** — den kauft man sich nicht. Eine fehlende
**Wert**-Voraussetzung sperrt bei der Erschaffung dagegen nicht, sie wird zum Ziel.

### Hintergrund — 8, davon 7 für Novizen

| Talent | ab Rang | Voraussetzung | Wirkung |
|---|---|---|---|
| **Seebein** | Novize | Segeln d6 | Schwankender Untergrund erschwert dir nichts. An Bord darfst du eine misslungene Segeln-Probe einmal nachwürfeln. |
| **Scharfes Auge** | Novize | Aufmerksamkeit d6 | Auf Entfernung und im Ausguck: Aufmerksamkeit eine Würfelstufe höher. |
| **Grobschlächtig** | Novize | Konstitution d8 | Robustheit +1. Du steckst ein, was andere umwirft. |
| **Glückspilz** | Novize | — | Ein zusätzlicher Bennie je Sitzung. Manche Leute fallen ins Wasser und kommen mit einem Fisch heraus. |
| **Sprachbegabt** | Novize | Verstand d6 | Du verstehst Spanisch, Französisch und Portugiesisch bruchstückhaft — genug, um das Wichtigste mitzubekommen. |
| **Zäh wie Tauwerk** | Erfahren | Konstitution d8 | Gehst du außer Gefecht, würfle Konstitution. Gelingt der Wurf, bist du nur bewusstlos — nicht tot. Man hat dich schon öfter abgeschrieben. |
| **Wassergänger** | Novize | Athletik d6 | Du schwimmst, wie andere gehen. Über Bord zu gehen ist für dich ein Ärgernis, kein Todesurteil. |
| **Eiserner Magen** | Novize | Konstitution d6 | Pökelfleisch am Rand, brackiges Wasser, Zwieback mit Bewohnern — dir wird davon nichts. Gegen Verdorbenes und schwache Gifte würfelst du eine Stufe höher. |

### Handwerk — 8, davon 5 für Novizen

| Talent | ab Rang | Voraussetzung | Wirkung |
|---|---|---|---|
| **Klettermaat** | Novize | Athletik d6 | In der Takelage und an jeder Wand: Athletik eine Würfelstufe höher. |
| **Marktkenner** | Novize | Handel d8 | Du erkennst Wert und Herkunft einer Ware auf einen Blick: Handel eine Stufe höher. |
| **Feldscher** | Novize | Heilkunde d8 | Bei der Versorgung frischer Wunden: Heilkunde eine Stufe höher. Du hast mehr Männer zusammengeflickt, als dir lieb ist. |
| **Schlitzohr** | Novize | Diebeskunst d8 | Schlösser, Taschen, unbeobachtete Wege: Diebeskunst eine Stufe höher. |
| **Sterndeuter** | Erfahren | Navigation d8 | Nacht, Nebel und schwere See erschweren dir die Navigation nicht. Einmal je Sitzung findest du einen verlorenen Kurs wieder. |
| **Improvisierer** | Erfahren | Handwerk d8 | Einmal je Szene hast du genau das dabei, was jetzt nötig wäre — oder baust es aus dem, was herumliegt. |
| **Kanonier** | Novize | Schießen d6 | Laden, richten, abfeuern — an einem Geschütz bist du zu Hause. Schießen mit schwerem Gerät eine Stufe höher. |
| **Schiffszimmermann** | Erfahren | Handwerk d8 | Lecks stopfen, Masten fischen, Planken flicken — auch während geschossen wird. Reparaturen an einem Schiff gelingen dir unter Beschuss ohne Erschwernis. |

### Kampf — 9, davon 4 für Novizen

| Talent | ab Rang | Voraussetzung | Wirkung |
|---|---|---|---|
| **Enterhaken** | Novize | Kämpfen d6 | Im ersten Zug nach dem Übersetzen auf ein fremdes Deck kämpfst du eine Stufe höher. Du bist gern der Erste drüben. |
| **Kaltblütig** | Novize | Willenskraft d6 | Bedrängnis trifft dich eine Stufe schwächer. Zwei Gegner sind für dich wie einer. |
| **Duellant** | Erfahren | Kämpfen d8 | Steht dir genau ein Gegner gegenüber, kämpfst du eine Stufe höher. Im Getümmel nützt dir das nichts. |
| **Beidhändig** | Erfahren | Geschicklichkeit d8 | Säbel in der einen, Pistole in der anderen Hand — die zweite Waffe bringt dir keinen Abzug. |
| **Ruhige Hand** | Erfahren | Schießen d8 | Auf Entfernung erschwert dir die Distanz eine Stufe weniger. Du schießt, wenn die anderen noch zielen. |
| **Erster Streich** | Veteran | Kämpfen d10 | Wer in deine Reichweite tritt, kassiert einen freien Angriff, bevor er selbst zuschlägt. |
| **Meisterfechter** | Heroisch | Kämpfen d12 | Einmal je Kampf wird ein Treffer von dir zum guten Erfolg, ohne dass du dafür würfelst. |
| **Enger Raum** | Novize | Kämpfen d6 | Unter Deck, in Gängen, an der Luke: wo lange Klingen und weite Ausholbewegungen im Weg sind, kämpfst du eine Stufe höher. |
| **Kein Kodex** | Novize | Kämpfen d6 | Sand, Tritte, der Krug ins Gesicht. Einmal je Kampf verschaffst du dir einen Vorteil aus etwas, das kein Ehrenmann täte. |

### Umgang — 5, davon 2 für Novizen

| Talent | ab Rang | Voraussetzung | Wirkung |
|---|---|---|---|
| **Zungenfertig** | Novize | Überreden d6 | Einmal je Szene darfst du eine misslungene Überreden-Probe wiederholen. Dir fällt immer noch etwas ein. |
| **Überall bekannt** | Erfahren | Gassenwissen d8 | In jedem größeren Hafen kennst du jemanden, der dir noch etwas schuldet. Wie gern er zahlt, steht auf einem anderen Blatt. |
| **Drohende Gegenwart** | Erfahren | Einschüchtern d8 | Wo andere überreden müssen, genügt bei dir, dass du im Raum stehst. Einschüchtern ersetzt Überreden. |
| **Shanty-Sänger** | Novize | Überreden d6 | Du hältst den Takt und die Laune. Bei stumpfer Arbeit und langer Fahrt hebst du die Stimmung der ganzen Mannschaft — die Spielleitung weiß, was das wert ist. |
| **Glatte Zunge** | Erfahren | Überreden d8 | Eine Lüge, die du selbst glaubst, hält jeder Prüfung stand. Einmal je Sitzung nimmt man dir eine Geschichte ab, die niemandem sonst abgekauft würde. |

### Führung — 6, davon 1 für Novizen

| Talent | ab Rang | Voraussetzung | Wirkung |
|---|---|---|---|
| **Kommandostimme** | Erfahren | Willenskraft d8 | Deine Befehle sind auch im Getümmel zu hören. Verbündete in Rufweite dürfen einen misslungenen Wurf gegen Furcht wiederholen. |
| **Anfeuern** | Erfahren | Überreden d8 | Einmal je Szene gibst du einem Verbündeten einen deiner Bennies — mit einem Satz, der im richtigen Moment kommt. |
| **Zusammenhalt** | Veteran | Willenskraft d8 | Verbündete, die neben dir stehen, wehren Bedrängnis eine Stufe besser ab. Rücken an Rücken hält länger. |
| **Taktischer Blick** | Veteran | Verstand d8, Kämpfen d8 | Zu Beginn eines Kampfes darf die Gruppe zwei Figuren in der Zugreihenfolge tauschen. Du siehst, wer zuerst dran sein muss. |
| **Bootsmann** | Novize | Willenskraft d6 | Du bringst eine Handvoll Leute dazu, gleichzeitig anzupacken. Wo viele Hände nötig sind — Segel, Anker, Kanone, Pumpe —, arbeitet die Gruppe unter dir eine Stufe stärker. |
| **Herr über Schiff und Mannschaft** | Veteran | Segeln d10, Einschüchtern d8 | Im Gefecht führst du das Schiff, als wäre es dein eigener Körper. Solange du an Deck stehst und befiehlst, gelingt der Mannschaft jedes Manöver eine Stufe besser. |

### Unheimliches — 5, davon 1 für Novizen

| Talent | ab Rang | Voraussetzung | Wirkung |
|---|---|---|---|
| **Vorahnung** | Erfahren | Aufmerksamkeit d8 | Bevor du in etwas Tödliches läufst, wird dir kalt. Die Spielleitung muss dich warnen — nicht sagen, was es ist. |
| **Standhaft** | Erfahren | Willenskraft d8 | Gegen Furcht und gegen das, was nicht tot bleibt: eine Stufe höher. Du hast entschieden, nicht wegzulaufen. |
| **Zeichenleser** | Veteran | Allgemeinwissen d8 | Einmal je Sitzung fragst du, ob ein Vorhaben unter einem guten Zeichen steht. Die Antwort ist ehrlich: gut, schlecht oder unklar. |
| **Seemannsgarn** | Novize | Allgemeinwissen d6 | Du kennst die Geschichten — welche Insel man meidet, was man einem Ertrunkenen nicht nachruft. Einmal je Sitzung darfst du fragen, ob es zu einer Sache eine alte Geschichte gibt. |
| **Totenstill** | Erfahren | Willenskraft d8 | Was von den Toten kommt, wählt dich zuletzt. Solange ein anderes Ziel in Reichweite steht, gehen Untote und Geister an dir vorbei. |

## Schwächen (20)

Vollständig **freiwillig**. Höchstens 1 schwere (2 Punkte) und 2 leichte (1 Punkt), also nie mehr als 4 Punkte.
Punkte kaufen in dieser Fassung **ausschließlich** Talente — ein ungerader Punkt
verfällt also.

**Haken** heißt: Die Schwäche senkt keinen Würfel, sondern verpflichtet. Sie gibt der
Spielleitung etwas, woran sie die Figur aufhängt. 15 der 20 sind von dieser Art.

### Schwer (2 Punkte) — 9

| Schwäche | Art | Wirkung |
|---|---|---|
| **Landratte** | Wert | An Bord und auf See: Segeln und Athletik eine Würfelstufe niedriger. Warum bist du überhaupt hier? |
| **Aufbrausend** | Haken | Wirst du ernsthaft provoziert, brauchst du eine Willenskraft-Probe — sonst schlägst du zu. |
| **Alter Knochen** | Wert | Wo Ausdauer und rohe Kraft zählen: Stärke eine Stufe niedriger. |
| **Gesucht** | Haken | In jedem größeren Hafen kann dich jemand erkennen. Und einer wird es. |
| **Trunksüchtig** | Haken | Ohne Rum am Abend ist der ganze folgende Tag eine Stufe niedriger. |
| **Blutschuld** | Haken | Jemand an Bord weiß etwas über dich, das niemand wissen darf. |
| **Schwur** | Haken | Du hast jemandem etwas geschworen und hältst dich daran — auch wenn es die Gruppe teuer zu stehen kommt. Sag beim Erschaffen, wem und was. |
| **Erzfeind** | Haken | Jemand sucht dich, seit Jahren, und gibt nicht auf. Er wird auftauchen, wenn es am wenigsten passt. |
| **Getrieben** | Haken | Etwas treibt dich, und du kannst nicht wegsehen, wenn sich die Gelegenheit bietet. Was es ist, bestimmst du. |

### Leicht (1 Punkt) — 11

| Schwäche | Art | Wirkung |
|---|---|---|
| **Aberglaube** | Haken | Zeichen, Omen, Rituale — du hältst sie ein, auch wenn es gerade nicht passt. |
| **Seekrank** | Wert | Bei schwerer See ist deine erste Szene eine Stufe niedriger. |
| **Schulden** | Haken | Ein Teil jeder Beute ist längst vergeben. Der Gläubiger vergisst nicht. |
| **Neugierig** | Haken | Eine verschlossene Tür lässt dich nicht in Ruhe. |
| **Loses Mundwerk** | Haken | Du sagst das Falsche — und zwar zur falschen Person. |
| **Nachtblind** | Wert | Bei Dunkelheit: Aufmerksamkeit eine Stufe niedriger. |
| **Ehrenwort** | Haken | Ein gegebenes Versprechen bindet dich, koste es, was es wolle. |
| **Narbe** | Wert | Bei Fremden und bei Hofe: Überreden eine Stufe niedriger. |
| **Verpflichtung** | Haken | Jemand an Land hängt von deinem Anteil ab — eine Familie, ein Kind, ein Gläubiger. Du musst regelmäßig etwas schicken. |
| **Treu** | Haken | Du lässt niemanden zurück, auch wenn es klüger wäre. Besonders nicht die, die zu dir gehören. |
| **Stolz** | Haken | Eine Beleidigung deiner Ehre erträgst du nicht schweigend. Widerworte sind das Mindeste. |

## Ausrüstung (53)

Startgeld 500 Münzen. **Waffen bringen einen eigenen Schadenswürfel**
mit, keinen Bonus — in diesem System wird nichts addiert. Rüstung hebt die Robustheit.
Die Traglast hängt an der Stärke (doppelte Seitenzahl); **Überladung kostet eine
Würfelstufe**, genau wie eine Wunde.

### Nahkampf

| Gegenstand | Schaden | Rüstung | Schuss/Ladungen | Gewicht | Preis | Anmerkung |
|---|---|---|---|---|---|---|
| **Bloße Fäuste** | d4 | — | — | 0 | 0 | Hast du immer dabei. Reicht selten. |
| **Messer** | d4 | — | — | 1 | 25 | Unauffällig, überall dabei, im Ernstfall zu kurz. |
| **Belegnagel** | d4 | — | — | 2 | 10 | Liegt an jeder Reling. Keiner nimmt dir übel, dass du ihn in der Hand hast. |
| **Entermesser** | d6 | — | — | 4 | 200 | Kurz, schwer, für den engen Raum unter Deck gemacht. |
| **Säbel** | d6 | — | — | 3 | 250 | Die Waffe dessen, der fechten gelernt hat — oder so tun will. |
| **Enteraxt** | d6 | — | — | 5 | 150 | Öffnet Türen, Luken und Menschen. Nicht elegant. |
| **Pike** | d6 | — | — | 8 | 100 | Hält den Gegner auf Abstand — an Deck oft im Weg. |

### Fernkampf

| Gegenstand | Schaden | Rüstung | Schuss/Ladungen | Gewicht | Preis | Anmerkung |
|---|---|---|---|---|---|---|
| **Wurfmesser** | d4 | — | — | 1 | 30 | Leise. Danach hat es der andere. |
| **Steinschlosspistole** | d6 | — | 1 Schuss | 3 | 350 | Ein Schuss. Danach ist sie ein schlechter Knüppel — Nachladen dauert eine Runde. |
| **Donnerbüchse** | d6 | — | 1 Schuss | 6 | 400 | Streut breit, trifft alles vor der Mündung. Nachladen dauert zwei Runden. |
| **Muskete** | d8 | — | 1 Schuss | 8 | 500 | Auf Entfernung tödlich, an Deck unhandlich. Nachladen dauert zwei Runden. |

### Munition

| Gegenstand | Schaden | Rüstung | Schuss/Ladungen | Gewicht | Preis | Anmerkung |
|---|---|---|---|---|---|---|
| **Pulverhorn mit Blei** | — | — | 20 Ladungen | 2 | 40 | Horn, Pfropfen, ein Beutel Kugeln. Zwanzig Ladungen, wenn man nicht kleckert. |
| **Papierpatronen, ein Dutzend** | — | — | 12 Ladungen | 1 | 60 | Pulver und Kugel schon abgemessen, in Papier gedreht. Teurer, aber man lädt schneller und im Regen. |
| **Feuersteine, fünf Stück** | — | — | — | 0 | 15 | Ein Stein hält etwa dreißig Schuss, dann zündet er nicht mehr. Daran denkt niemand, bis es klickt. |
| **Kugelform und Bleibarren** | — | — | — | 4 | 90 | Blei einschmelzen, Kugeln gießen. Braucht Feuer, Zeit und ruhige Hände — dafür nie wieder leer. |

### Schutz

| Gegenstand | Schaden | Rüstung | Schuss/Ladungen | Gewicht | Preis | Anmerkung |
|---|---|---|---|---|---|---|
| **Lederwams** | — | +1 | — | 5 | 200 | Robustheit +1. Fällt an Bord niemandem auf. |
| **Kettenhemd** | — | +2 | — | 12 | 800 | Robustheit +2. Wer damit über Bord geht, geht unter. |
| **Brustharnisch** | — | +3 | — | 20 | 2000 | Robustheit +3. Spanische Soldatenware. Man sieht dich kommen und hören kann man dich auch. |

### Gerät

| Gegenstand | Schaden | Rüstung | Schuss/Ladungen | Gewicht | Preis | Anmerkung |
|---|---|---|---|---|---|---|
| **Enterhaken mit Tau** | — | — | — | 6 | 80 | Der kürzeste Weg auf ein fremdes Deck. |
| **Fernrohr** | — | — | — | 2 | 400 | Sieht, was andere erst später sehen. |
| **Kompass** | — | — | — | 1 | 300 | Bei Nebel und Nacht der Unterschied zwischen Kurs und Raten. |
| **Laterne** | — | — | — | 3 | 60 | Licht, das dich auch verrät. |
| **Dietriche** | — | — | — | 1 | 120 | Wer sie bei dir findet, hat schon eine Meinung über dich. |
| **Verbandszeug** | — | — | — | 2 | 90 | Nadel, Faden, Leinen, Branntwein. Reicht für drei Männer. |
| **Seil, zwanzig Schritt** | — | — | — | 5 | 40 | Man braucht es immer dann, wenn man es nicht hat. |
| **Proviant für drei Tage** | — | — | — | 4 | 30 | Zwieback, Pökelfleisch, Wasser. Schmeckt nach nichts. |
| **Flasche Rum** | — | — | — | 2 | 50 | Betäubungsmittel, Desinfektion, Zahlungsmittel, Freundschaftsangebot. |
| **Schreibzeug** | — | — | — | 2 | 150 | Feder, Tinte, Papier. Wer schreiben kann, gilt schon als halber Herr. |
| **Lederner Wasserschlauch** | — | — | — | 2 | 25 | Schmeckt nach Leder. Besser als der Durst. |
| **Ölzeug** | — | — | — | 4 | 70 | Steif, stinkt, hält trocken. Auf See mehr wert als ein guter Rock. |
| **Wolldecke** | — | — | — | 3 | 35 | Nass wärmt sie immer noch. Das ist der ganze Trick an Wolle. |
| **Hängematte** | — | — | — | 3 | 30 | An Bord schläft man so oder gar nicht. |
| **Zunderbüchse** | — | — | — | 1 | 20 | Stahl, Stein, Zunder. Ohne sie gibt es kein Feuer, und mit nassem Zunder auch nicht. |
| **Talgkerzen, ein Bund** | — | — | — | 1 | 10 | Riechen beim Brennen nach dem Tier, aus dem sie sind. |
| **Nähzeug und Pech** | — | — | — | 1 | 30 | Segeltuchnadel, gewachster Faden. Flickt Segel, Zelte und im Notfall Menschen. |
| **Zimmermannswerkzeug** | — | — | — | 8 | 180 | Beil, Bohrer, Stemmeisen in einer Rolle. Schwer, aber damit repariert man ein Schiff. |
| **Topf Pech** | — | — | — | 3 | 20 | Dichtet Fugen, klebt Verbände, brennt hervorragend. Macht alles schwarz, was es berührt. |
| **Angelzeug** | — | — | — | 1 | 25 | Schnur, Haken, ein Stück Blei. Auf einer langen Flaute das Wertvollste an Bord. |
| **Senklot** | — | — | — | 3 | 70 | Blei an geknoteter Leine. Misst, wie tief es unter dem Kiel noch ist — kurz bevor es zu spät wäre. |
| **Sanduhr, halbe Stunde** | — | — | — | 2 | 120 | An Bord misst sie die Wache. Sonst misst sie, wie lange man schon wartet. |
| **Signalhorn** | — | — | — | 1 | 55 | Trägt weiter als jede Stimme. Verrät dafür auch jedem, wo man ist. |
| **Abgegriffene Seekarte** | — | — | — | 1 | 200 | Die Küsten stimmen ungefähr. Was dahinter liegt, hat der Zeichner sich gedacht. |
| **Brennglas** | — | — | — | 1 | 140 | Macht Feuer ohne Zunder und kleine Schrift groß. Bei Regen nutzlos. |
| **Seemannskiste** | — | — | — | 10 | 40 | Schwer, eckig, abschließbar. Alles, was man besitzt, passt hinein — und bleibt an Bord. |

### Allerlei

| Gegenstand | Schaden | Rüstung | Schuss/Ladungen | Gewicht | Preis | Anmerkung |
|---|---|---|---|---|---|---|
| **Spielkarten** | — | — | — | 0 | 20 | Abgegriffen, eine Ecke fehlt. An Bord sind sie trotzdem Gold wert. |
| **Würfelbecher** | — | — | — | 0 | 15 | Drei Würfel, Leder, ein Filzboden. Für Meiern reicht es. |
| **Tabak und Pfeife** | — | — | — | 1 | 35 | Macht niemanden stärker. Aber jemandem eine Pfeife zu stopfen hat schon Türen geöffnet. |
| **Handspiegel aus Zinn** | — | — | — | 1 | 35 | Verzerrt ein wenig. Man sieht trotzdem mehr, als einem lieb ist. |
| **Schnur Glasperlen** | — | — | — | 0 | 25 | Der Krämer schwört, so etwas sei anderswo ein Vermögen wert. Er war nie anderswo. |
| **Billiges Amulett** | — | — | — | 0 | 10 | Zinn, Schnur, irgendein Heiliger. Der Hausierer verspricht Schutz vor dem Ertrinken. Es tut nichts. |
| **Leere Flasche mit Korken** | — | — | — | 1 | 5 | Grünes Glas, dicker Boden. Wofür man sie braucht, weiß man vorher nie. |
| **Ein Schlüssel ohne Schloss** | — | — | — | 0 | 10 | Lag in einer Kiste, die der Krämer billig bekam. Er hat nie herausgefunden, wozu er gehört. |
| **Rosenkranz** | — | — | — | 0 | 15 | Holzperlen, abgegriffen. Hilft manchen Leuten. Nicht gegen Klingen. |

## Steckbrief

Fünf Felder ohne Zahlen. **Prüfstein: Jede Frage muss zum Zeitpunkt der Erschaffung
beantwortbar sein** — die Figur kennt weder die Gruppe noch ein Schiff.

| Feld | Frage |
|---|---|
| **Antrieb** | Warum willst du in die neue Welt? |
| **Ballast** | Was oder wen lässt du zurück? |
| **Mittel** | Womit willst du dir einen Platz verschaffen? |
| **Geheimnis** | Was darf niemand wissen? |
| **Marke** | Woran erkennt man dich wieder? |

## Wie oft gelingt eine Probe?

Gegen Zielwert 4, ohne Erschwernis, mit Wild Die. Aus `chancen()`,
also exakt gerechnet und nicht simuliert.

| Wert | Steigerung | Erfolg | Misserfolg | Patzer |
|---|---|---|---|---|
| ungelernt (d4−2) | 12,6 % | 19,7 % | 63,5 % | 4,2 % |
| d4 | 19,3 % | 43,2 % | 33,3 % | 4,2 % |
| d6 | 25,8 % | 49,2 % | 22,2 % | 2,8 % |
| d8 | 24,7 % | 56,6 % | 16,7 % | 2,1 % |
| d10 | 39,7 % | 45,3 % | 13,3 % | 1,7 % |
| d12 | 49,8 % | 37,7 % | 11,1 % | 1,4 % |

Eine Eigenheit des Originals, die am Tisch auffällt: **d6 holt öfter eine Steigerung
als d8**, weil ein d6 häufiger explodiert. Das ist kein Fehler im Code.

---

_Erzeugt aus `js/regelwerk.js` durch `node tools/regelreferenz.js`._
<!-- ERZEUGT:ENDE -->
