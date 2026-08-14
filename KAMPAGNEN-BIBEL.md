# Korsaren — Kampagnen-Bibel

**Stand:** 29. Juli 2026
**Spielleiter:** Hendrik
**System:** Eigenentwicklung (d100, siehe Regelwerk-Kern)
**Setting:** Karibik / englische Küste, 1690er Jahre

---

## 0. Über dieses Dokument

Diese Datei ist die zentrale, dauerhafte Referenz für die Kampagne. Sie existiert, weil ein
erheblicher Teil des Kampagnenwissens bisher nur in verstreuten Chatverläufen lag und dort
schwer wiederauffindbar war.

**Zweck:**
- Nachschlagewerk für den Spielleiter während der Vorbereitung und am Tisch
- Kontextgrundlage für KI-Werkzeuge (z. B. Claude Code in VS Code), die sonst nur den
  reinen Code sehen und die Design-Prinzipien dahinter nicht kennen würden
- Schutz gegen Wissensverlust zwischen Sessions

**Konvention:** Abschnitte, die mit **[OFFEN]** markiert sind, bezeichnen bewusst noch nicht
entschiedene Punkte. Abschnitte mit **[ÜBERHOLT]** dokumentieren frühere Festlegungen, die
inzwischen ersetzt wurden — sie bleiben stehen, damit alte Notizen einordbar bleiben.

---

## 1. Kernprämisse

Die Spieler heuern — freiwillig oder gepresst — in der englischen Hafenstadt **Grimsgate** auf
der **Golden Lion** an, einem vermeintlich legitimen Konvoi-Begleitschiff unter
**Kapitän James Harwick**.

Was sie nicht wissen: Harwick ist Freibeuter mit Kaperbrief, und die Piraterie ist für ihn nur
Mittel zum Zweck. Sein eigentliches Ziel ist die **Wiederbelebung seiner toten Tochter**, die
Jahre zuvor an Bord ums Leben kam — vor den Augen des inneren Zirkels. Auf einer geheimen
Grabesinsel liegt sie in geweihtem Boden konserviert. Mit übernatürlichen Artefakten, die er
über den gesamten Kampagnenbogen hinweg zusammenkauft, will er das Ritual vollziehen.

**Das Ritual scheitert.** Es entfesselt eine übernatürliche Bedrohung, die im Finale von
Session 3 kulminiert.

Die zentrale emotionale Spannung: Harwicks Liebe zu seiner Tochter macht ihn sympathisch,
auch wenn er brutal durchgreift. Die Spieler sollen ihn nicht eindeutig einordnen können.

---

## 2. Design-Prinzipien

Diese Prinzipien sind über die gesamte Entwicklung hinweg konstant geblieben und sollen bei
jeder neuen Szene mitgedacht werden.

### 2.1 Verdeckte Systeme
Bestimmte Mechaniken (Crew-Ruf, Initiativlogik, Zeit-Trigger) werden den Spielern **nicht**
erklärt. Sie sollen sie im Spiel selbst entdecken. Der Aha-Moment gehört den Spielern, nicht
dem Regelwerk.

### 2.2 Erster Eindruck vs. Wahrheit
Jede wichtige Figur wird um einen bewussten Widerspruch herum gebaut. Was man beim ersten
Kontakt sieht, ist nicht, was die Figur ist. Siehe Charaktertabelle in Abschnitt 8.

### 2.3 Wiederspielbarkeit durch Verpassen
Die Spieler sollen am Ende überlegen, **was sie übersehen haben** — nicht bereuen, sondern
neugierig sein. Deshalb: mehr Inhalt als in der verfügbaren Zeit erreichbar ist, kombiniert
mit künstlicher Verknappung (siehe Zeit-Trigger).

### 2.4 Historische Plausibilität als Gerüst
Historische Genauigkeit ist kein Dekor, sondern Fundament. Schiffsklassifizierung,
Crewgrößen, Stauungspraxis (Dunnage), Brandschutz an Bord, Logleinen-Terminologie — alles
recherchiert und konsistent gehalten. **Keine Anachronismen.** (Negativbeispiel aus der
Entwicklung: „Luftblasen für die Wasserwaage" als Neulings-Streich wurde verworfen, weil
Wasserwaagen dieser Bauart nicht in die Zeit passen.)

### 2.5 NPC-Wünsche statt vorgeplanter Trigger
**Wichtige Kurskorrektur (Juli 2026).** Ursprünglich war geplant, Szenen als
Wenn-Spieler-X-dann-Y-Trigger zu bauen. Das wurde verworfen: Bei völliger Spielerfreiheit und
späteren Verzweigungen bricht ein solches System.

**Stattdessen:** Jeder feste Charakter an einem Ort hat ein oder zwei Dinge, die **er** von
den Spielern will. Die Spieler können darauf eingehen oder nicht. Kein Ablaufplan, sondern
Figuren mit eigenen Bedürfnissen.

### 2.6 Gutes Rollenspiel schlägt Mechanik
Bei Konditionen kann überzeugendes Rollenspiel ein mechanisches Ergebnis überschreiben. Das
muss nicht in `regie.js` dokumentiert werden — es ist eine generelle Spielleiter-Freiheit.

### 2.7 Sparsamkeit bei starken Motiven
Hochwirksame Symbole werden bewusst selten eingesetzt. **Cormacs Knoten** (das geknotete Seil,
das die Tochter ihm beibrachte) darf in **maximal zwei Szenen** auftauchen. Ein drittes Mal
würde es abnutzen.

### 2.8 Marker-Beschreibungen: Ort statt Plot
`desc`-Felder in den `*_scenes.js`-Dateien geben ausschließlich Ort und Stimmung wieder. Sie
dürfen **nicht** zu Handlungen anstiften, Aufgaben formulieren, Plot-Wissen unterstellen, das
Spieler zu diesem Zeitpunkt noch nicht haben können, oder NPC-Ziele vorwegnehmen. Alles
Hintergrundwissen für den Spielleiter gehört in GM-Notizen (`regie.js`), sobald diese
ausgearbeitet werden — nicht in den spielersichtbaren Marker-Text.

### 2.9 Übergeordnetes Ziel + explizite Quests pro Szene
Jede Szene braucht ein **übergeordnetes Ziel**, dem alles untergeordnet ist (z. B. Grimsgate: an
Bord der Golden Lion gelangen; Schatzinsel: Harwicks Schatz der Thahal holen und die Insel wieder
verlassen). Innerhalb dieses Rahmens bekommen die Spieler **mindestens einen klar ausgesprochenen
Auftrag** — kein System-Hinweis, sondern eine Figur, die im Gespräch explizit sagt, worum es geht.
Jeder Auftrag hat zwei Teile: **Warum** (narrativ, wieso soll ich das tun) und **Was** (praktisch,
was ist konkret zu tun). Ob und wie die Spieler den Auftrag erfüllen, bleibt ihre Entscheidung —
kein Zwang, kein automatischer Fehlschlag. Aufträge können sich verketten (Person A verweist an
Person B), müssen es aber nicht.

**Verhältnis zu 2.5:** ersetzt NPC-Wünsche (2.5) nicht — NPCs behalten ihre eigenen, organischen
Bedürfnisse, an denen Spieler frei andocken können. 2.9 stellt nur sicher, dass **mindestens
einer** dieser Momente pro Szene als klarer, aktiv verfolgbarer Auftrag ausgesprochen wird, statt
sich rein implizit aus der Atmosphäre zu ergeben. Auslöser für diese Regel: die
Lagerfeuer-Session auf der Schatzinsel (August 2026), in der die Spieler über eine lange Phase
hinweg keine aktive Aufgabe hatten außer „der Gruppe folgen" — bei Figuren wie dem Kapitän oder in
einem fremden Dorf blieb kaum aktives Eingreifen möglich.

Technisch: `SZENEN_REGIE[sceneId].uebergeordnetesZiel` (Freitext) und `grantsQuest: {warum, was}`
auf einzelnen Trigger-Objekten in `regie.js` (siehe 13.2), sichtbar in der „Szenen-Kopf"-Leiste im
Admin-Panel. Gilt ab August 2026 für neue Inhalte — kein rückwirkendes Nacharbeiten bereits
geschriebener Szenen-Prosa.

---

## 3. Die Golden Lion

### 3.1 Schiffsdaten (aktuell gültig)

| Merkmal | Wert |
|---|---|
| Typ | Kleine Fregatte |
| Geschützdeck | Ein durchgehendes Batteriedeck |
| Klassifizierung | Rang 5/6 |
| Bewaffnung | ca. 20–28 Kanonen |
| Besatzung | ca. 120 Mann |

Bewusst realistisch gewählt und an historischen Vorbildern orientiert.

**[ÜBERHOLT]** Frühere Notizen (bis ca. Mai/Juni 2026) nennen eine *Brigantine mit ~30 Mann und
14–16 Kanonen*. Diese Angabe ist ersetzt. Alte Dokumente mit diesen Zahlen sind entsprechend
zu lesen.

### 3.2 Registrierung
Die Golden Lion trägt ihren echten Namen — sie ist **nicht umbenannt oder getarnt**. Das
Problem ist ein anderes: Sie steht schlicht **nicht im Hafenregister** von Grimsgate. Das ist
die Spur, die in den Lagerhäusern gelegt wird und zur Hafenmeisterei führt.

> **Achtung bei künftigen Szenen:** Der Gedanke „übermalter alter Schiffsname" ist ausdrücklich
> verworfen — er widerspricht dieser Festlegung und dupliziert außerdem das
> Register-Motiv.

### 3.3 Decks und Räume (Marker auf der Schiffskarte)

Bug · Oberdeck · Achterdeck · Kapitänskajüte · Offiziersquartier · Batteriedeck ·
Unterdeck (Mannschaft) · Werkstatt · Frachtraum · Kombüse

Ausstattungsdetails, die konsistent bleiben müssen:
- **Ziegel gibt es ausschließlich an der Kombüsen-Feuerstelle** (Brandschutz, erhöhte
  Plattform über Ballast/Bilge). Alle anderen Räume sind reines Schiffsholz.
- Die **durchgehende Heckgalerie-Verglasung** ist Prestige der Kapitänskajüte — und laut
  Cutaway-Bild auch der Offiziersräume. Sie bedeutet ausdrücklich *nicht*, dass jemand
  ständig nach achtern Ausschau halten muss.
- **Seegangssicherung ist Pflicht** in jeder Innenraumdarstellung: Werkzeug in Halterungen,
  Fässer verkeilt (Dunnage), Kisten verzurrt, Geschirr in Lattenrahmen. Ein loses,
  „gemütliches" Interieur wäre auf See falsch.
- Im **Frachtraum kein offenes Feuer** (Tauwerk, Segeltuch, trockener Proviant). Licht fällt
  gedämpft durch eine Gitterluke von einem darüberliegenden Innendeck.

---

## 4. Regelwerk-Kern

### 4.1 Probensystem (d100)

`Schwelle = Wert × 10`

| Band | Bereich |
|---|---|
| Guter Erfolg | 1 bis Schwelle/2 |
| Normaler Erfolg | Schwelle/2 + 1 bis Schwelle |
| Schlechter Erfolg | Schwelle + 1 bis Schwelle + (100 − Schwelle)/2 |
| Misserfolg | Rest |

**Beispiel** (Wert 5 + Mastery, Schwelle 50): 1–25 Gut · 26–50 Normal · 51–75 Schlecht ·
76–100 Miss.

**Ohne Mastery** (Rohling) entfällt das Band „Schlechter Erfolg" — es fällt in den Misserfolg.
Die Zahlenschwellen selbst verschieben sich dabei **nicht**.

### 4.2 Mastery
- Fertigkeiten: schaltet bei Wert 4 frei, kostet 3 EP
- Grundwerte: schaltet bei GW 5 frei
- Mastery verschiebt keine Schwellen, sie schaltet lediglich das Band „Schlechter Erfolg" frei

### 4.3 Archetypen
Vier Archetypen: **Seemann · Gelehrter · Fuchs · Schatten**
Jeder kostet exakt 30 EP, dazu 10 freie EP zur Individualisierung.

Design-Ziel: Über den gesamten Abenteuerbogen soll **jeder der vier Archetypen mindestens
einmal seinen großen Moment** bekommen. (Beispiel: Der Gelehrte bekommt seinen bei der
Entschlüsselung der Ritual-Schriftrollen nach dem Artefakthandel.)

### 4.4 Weitere Mechaniken
- **Bedrängnis:** Jeder zusätzliche Angreifer verschiebt das Ergebnis um ein Band nach unten.
- **Fortschritt** ist an Fertigkeitsschwellen gekoppelt, nicht direkt kaufbar — soll sich
  verdient und nicht linear anfühlen.
- **Meiern / Liar's Dice** (Tavernen-Würfelspiel): `!roll 2d6`, Paare schlagen Summen,
  (2,1) „Mariner" schlägt alles.

---

## 5. Das Ruf-System

**Verdeckt.** Die Spieler bekommen keine Zahlen und keine Leiste zu sehen.

### 5.1 Stufen
`Unbekannt → Bemerkt → Respektiert → Vertraut → Unverzichtbar`

### 5.2 Was die Stufen bewirken

| Stufe | Wirkung |
|---|---|
| Unbekannt | Bekommt Befehle, keine Rückfragen |
| Bemerkt | Crew hilft aktiv im Kampf |
| Respektiert | Darf bei Entscheidungen eine Meinung äußern |
| Vertraut | Kapitän hört zu, Crew folgt auch in Gefahr |
| Unverzichtbar | Zugang zur Offizierskonferenz (Routenwahl), Kapitän teilt Informationen proaktiv, Crew-NPCs werden zu persönlichen Kontakten |

### 5.3 Ruf ist figurenspezifisch
Es gibt **nicht einen** globalen Ruf-Wert, sondern mehrere parallele: Ruf bei Tom, bei
Ezra/Ned, bei Dirk, bei Harwick, bei der Crew allgemein.

> **[OFFEN] Bekannte Schwachstelle:** Diese parallelen Werte liegen aktuell verteilt in
> `regie.js`-Notizen und im Kopf des Spielleiters. Eine konsolidierte Tracking-Übersicht im
> Admin-Panel wäre sinnvoll, existiert aber noch nicht.

---

## 6. Trigger-Architektur

Drei Mechaniken greifen ineinander:

### 6.1 Zeit-Trigger
Ereignisse feuern **unabhängig vom Spielerhandeln** zu festgelegten Zeitpunkten (in der
Anfangsphase minutenbasiert, im weiteren Verlauf stündlich). Wird den Spielern nicht
kommuniziert.

Ziel: Die Spieler sollen das Muster idealerweise selbst zwischen Stunde 2 und 3 durchschauen.
Verantwortung dabei: Ereignisse müssen rückwirkend als Muster erkennbar sein, nie wie ein
billiger Trick wirken.

**Konkrete Zeit-Trigger der ersten Bordstunde:**
- **T+30 Minuten:** Wat findet den blinden Passagier, falls die Spieler es bis dahin nicht
  getan haben (siehe Abschnitt 11)
- **T+60 Minuten:** Der Sturm beginnt

Beide Zeitfenster sind **bewusst zu knapp**, damit realistisch niemand alles findet.

### 6.2 Szenen-Trigger
Pro Hauptszene (außer am Hafen) mindestens drei. Unterschieden in Sofort-Trigger und
verzögerte Trigger. Die stärksten sind die, die in Session 3 an Session 1 erinnern.

Leitbeispiel: **Mundharmonika** eines Matrosen finden → zurückbringen ergibt
Dankbarkeit/Fest mit Musik; einstecken kann als Diebstahl ausgelegt werden. Moralisch
neutral, erzeugt organische Spannung innerhalb der Gruppe.

### 6.3 Ruf-Trigger
Verändern Kampfunterstützung, Informationszugang und Einfluss auf den Kapitän.

---

## 7. Struktur des Abenteuers

### 7.1 Gesamtübersicht

```
1. AUSGANGSHAFEN (fest) ......................... Grimsgate + erste Bordstunde
                    │
2. STURM (fest) ................................. Trennung vom Konvoi
                    │
3. SCHATZINSEL (fest) ........................... Truhen kommen an Bord
                    │
        ┌───────────┼───────────┐
        │           │           │           VERZWEIGUNG 1 (freie Wahl)
   Spanischer   Seeweg /    Schmuggler-
     Hafen       Flaute        nest
   (Heilkräuter) (passiv,   (Untergrund-
                Harwicks Weg)  wissen)
        └───────────┼───────────┘
                    │
4. ARTEFAKTBUCHT / HANDEL (fest) ................ Auftakt Session 2
                    │
        ┌───────────┼───────────┐
        │           │           │           VERZWEIGUNG 2 (gekoppelt an V1,
   Spanischer   Schamanen-   Hafen zur                     keine freie Wahl)
    Angriff →     Insel     Vorbereitung
    Riffinsel                                Ende Session 2
        └───────────┼───────────┘
                    │
   ═══ OFFIZIERSKONFERENZ (nur bei hohem Ruf) ═══ zwischen Session 2 und 3
                    │
        ┌───────────┼───────────┐
     Route A     Route B     Route C        VERZWEIGUNG 3 (Ruf-gebunden)
   (spanisches  (Sirenen-   (langer Weg
     Gebiet)     Passage)   ohne Hafen)
        └───────────┼───────────┘
                    │
5. GRABESINSEL (fest) ........................... Ritual + Finale, Session 3
```

### 7.2 Verzweigung 1 — nach der Schatzinsel

Freie Spielerwahl. Alle drei Wege laufen bei der Artefaktbucht wieder zusammen.

| Weg | Charakter | Folge |
|---|---|---|
| **Spanischer Hafen** | Suche nach Heilkräutern | Risiko: Begegnung mit dem spanischen Offizier. Kann später Route A entschärfen |
| **Seeweg / Flaute** | Passiver Weg, Harwicks eigene Route | Während der Flaute stoßen die Spieler in Harwicks Unterlagen auf die Warnung vor einem übernatürlichen Kampf |
| **Schmugglernest** | Untergrundwissen / Artefakt | Kontakte und Recherche, die später die Schamanen-Insel freischalten |

> **Umgesetzt (August 2026):** Die Wildschwein-Verletzung (Ezra Coombes Wundbrand) liefert jetzt
> die Dringlichkeit für den spanischen Hafen, aber nicht als reiner Ruf-Zwangsstopp — siehe
> Übergangsszene `5.1` (`js/regie.js`, `ORTE.kapitaenskajuete` und `ORTE.unterdeck`). Der
> spanische Hafen bleibt der Default-Kurs (wegen Ezra), das Schmugglernest erfordert aktive
> Überzeugung Harwicks (echtes Argument, keine reine Ruf-Zahl), und bei völliger Untätigkeit
> treibt das Schiff stattdessen führungslos in die Flaute (`6.1`). SL-Ermessen entscheidet den
> Ausgang anhand des tatsächlichen Spielerverhaltens, nicht anhand eines festen Ruf-Schwellwerts.

### 7.3 Der Artefakthandel (fest)

Wuchtiger **Auftakt** von Session 2, nicht deren Abschluss. Enthält NPC-Drama und ein
mögliches Massaker.

Nach dem Handel stellt Harwick fest, dass das **Ritual noch nicht vollständig** ist — etwas
fehlt, oder es gibt Komplikationen, die er nicht auf Anhieb lösen kann. Genau das rechtfertigt
erzählerisch die gesamte Post-Handel-Phase (sonst müsste er sofort zur Grabesinsel rasen).

Wie viel die Spieler über das Fehlende wissen, hängt vom Weg aus Verzweigung 1 ab: Über das
Schmugglernest haben sie bereits Informationen und können gezielter agieren; sonst müssen sie
es mühsam herausfinden.

**Notausgang (Zwangstrigger):** Falls sich die Gruppe kaum sozial mit Crew und Kapitän
einlässt, verteilt Harwick — zunehmend verzweifelt — das **Ritual-Lesematerial an die gesamte
Crew** („helft mir, das zu entschlüsseln"). Das bringt die Wahrheit auch ohne soziales
Engagement ans Licht und gibt dem Gelehrten seinen großen Moment.

### 7.4 Verzweigung 2 — nach dem Handel

**Keine freie Wahl**, sondern gekoppelt an Verzweigung 1. Ende von Session 2.

| Station | Freigeschaltet durch | Was sie liefert |
|---|---|---|
| **Spanischer Angriff → Riffinsel** | Vorheriger Kontakt mit den Spaniern | Bedrohung statt Entscheidung: Ein spanisches Kriegsschiff holt die Golden Lion ein. Flucht zu einer riffgeschützten Insel, an der das große spanische Schiff nicht anlegen kann. Szene bewusst an *Master and Commander* angelehnt — bei Nacht/Nebel Lichter-Finte mit falschem Mast und Laterne auf einem Beiboot. **Keine Ritual-Information**, dafür zufällige Vorräte/Ressourcen auf der Insel — ein Vorteil, den die Spieler haben, ohne ihn zu kennen |
| **Schamanen-Insel** | Kontakte und Recherche aus dem Schmugglernest | Informant/Schamane. Kulturelle Variante: der zentraleuropäische Blick trifft auf eine fremde, ursprüngliche Tradition. Liefert **konkrete Ritual-Informationen**: Schwächen der Untoten, wie sich der Finalkampf entschärfen lässt — Grundlage für ein gutes Ende |
| **Hafen zur Vorbereitung** | Weg über die Flaute | **Emergenter Ort** — die Spieler fordern ihn selbst ein, weil sie in Harwicks Unterlagen von der übernatürlichen Gefahr gelesen haben. Ausrüstung und Proviant, etwa Kanonen vom Schiff für das Ritual |

> **[OFFEN] Zukunfts-Faden (August 2026):** Ist die Kneipen-Provokation im spanischen Hafen (`7.1`,
> `ORTE.hafen_kneipe`) eskaliert und Ezra Coombe blieb unabgeholt zurück, haben die Spanier ihn in
> ihrer Gewalt. Wenn hier das spanische Kriegsschiff die Golden Lion einholt, könnte das eine
> grausame Szene liefern: Ezra wird von den Spaniern als Spott aufgeknüpft ausgehängt. Nur als
> Faden vermerkt (Hendriks Idee), noch nicht ausformuliert.

### 7.5 Offizierskonferenz & Verzweigung 3

**Zugang:** Ein Spieler, der sich bis dahin einen so guten Ruf erarbeitet hat, dass er zwar
nicht zum Offiziersstab gehört, aber Einblick in dessen Kreis hat, darf an der
Routenbesprechung teilnehmen. Idealerweise **zwischen den Terminen** — er bekommt eine Karte
und wählt den Heimweg.

Drei sich gegenseitig ausschließende Routen. **Jede hat einen kommunizierten Nachteil**, damit
die Wahl echtes Gewicht hat und nicht einfach „die offensichtlich sichere" gewählt werden kann:

| Route | Vorteil | Preis |
|---|---|---|
| **A — Spanisches Gebiet** | Direkter Weg | Begegnung mit den Spaniern wahrscheinlich. **Der Clou:** sicher, falls der Spanier-Kampf schon früher stattfand — gefährlich (mit Kampf), falls nicht. Die Spanier sind eine grundsätzliche Bedrohung, der Kampf kann hier also auch nachgeholt werden |
| **B — Sirenen-Passage** | Schneller | Seeleute meiden sie. Übernatürliche, unkalkulierbare Gefahr; Legenden von Sirenen. Crew erzählt entsprechende Gruselgeschichten |
| **C — Langer Weg ohne Hafen** | Geografisch sicher | Ohne Anlaufhafen werden die Rationen knapp, die Crew unruhig — **Meuterei-Risiko** |

Mehrheit entscheidet, der Kapitän hat ein selten genutztes Vetorecht.

**Design-Absicht:** Der aufgestiegene Spieler erlebt unmittelbar, dass sein Aufstieg reale,
teils unvorhersehbare Folgen hat. Jede Entscheidung für etwas ist zugleich eine gegen etwas
anderes.

Session 3 setzt auf der gewählten Route auf, spielt deren Szenario und führt zur Grabesinsel.

---

## 8. Die Charaktere

### 8.1 Kernbesetzung — Widerspruchs-Prinzip

| Name | Rolle | Erster Eindruck vs. Wahrheit |
|---|---|---|
| **James Harwick** | Kapitän | Charismatischer Ex-Freibeuter mit Kaperbrief, pragmatisch — innerlich von Trauer und Obsession zerfressen |
| **Cormac Daly** | Quartiermeister | Wortkarg, prinzipientreu — trägt Schuld am Tod der Tochter, besitzt das geknotete Seil, das sie ihm beibrachte |
| **Tom Fletcher** | Steuermann (Engländer) | Versteckt frühere Feigheit hinter Humor und scheinbarer Unzuverlässigkeit — bei echter Gefahr verlässlich |
| **Dirk van Hoorn** | Kanonenmeister (Ex-Niederländische Marine) | Emotional ausgehöhlt, definiert sich über präzises Ritual und Handwerk |
| **Francesco „Frasco" Almeida** | Bootsmann | Charmant, floh aus der Heimat; sozial begabt, der emotionale Verbinder der Crew |
| **Josiah Pryce** | Schiffskoch (Waliser) | Breit, sanft, warmherzig — der Einzige, den Wat nie anpöbelt. Der Grund dafür ist an Bord niemandem bekannt |
| **Walter „Wat" Crozier** | Presser / Shanghaiing | Bedrohlich und rau — knickt einzig vor Josiah ein |
| **Spanischer Offizier** | Antagonist | Wiederkehrend; getrieben von **Stolz** — nicht überlistbar, nur besänftigen, überwältigen oder fliehen |

### 8.2 Nebenfiguren

| Name | Rolle |
|---|---|
| **Ezra Coombe · Ned Sharpe** | Crewmitglieder, treten im Bordell und am Bug auf |
| **Trewin-Zwillinge** | Trinkwettbewerb in der Taverne, später auf dem Batteriedeck |
| **Constance Wrey** | Bordell-Madame in Grimsgate |
| **Bartholomew Ashworth** | Hafenmeister von Grimsgate. Gute Familie, mangels Talent für eine Londoner Karriere vor ~30 Jahren nach Grimsgate versetzt. Alt, phlegmatisch, auf Äußerlichkeiten bedacht |
| **Junger Schreiber** | Ashworths tollpatschiger Assistent, komische Figur |
| **Schiffszimmermann** | Unbenannt, einfaches Crewmitglied, kein Hauptcharakter. Arbeitsplatz: Werkstatt |
| **Der blinde Passagier** | Siehe Abschnitt 11 |

### 8.3 Konstruktionsreihenfolge für neue NPCs

Verbindliche Reihenfolge, in der Figuren entwickelt werden:

`Herkunft → Ziel → berufliche Rolle → soziale Position → erster Eindruck → Kondition →
moralische Disposition → was ihnen wichtig ist → Fähigkeiten/Schwächen → Selbsteinschätzung →
Statblock`

### 8.4 Francescos Einschätzungen anderer Figuren

Francesco gibt auf **direkte Nachfrage** seine ehrliche Meinung — nie von sich aus. Nützlich
als Werkzeug, um Spielern Charakterinformationen zuzuspielen:

| Über | Einschätzung |
|---|---|
| Harwick | Warm, respektvoll, fast bewundernd |
| Cormac | Freundlich-distanziert, „zu streng" |
| Wat | Reserviert, spürbares Unbehagen, hält nicht viel von ihm |
| Tom | „Der ehrlichste Betrüger, den er kennt" |
| Josiah | „Eine gute Seele" — empfiehlt einen Besuch in der Kombüse |
| Dirk | „Fast mit dem Schiff verwachsen", lieber in Gesellschaft von Kanonen als Menschen. Bester Ansprechpartner bei Reparaturen — er beeilt sich dabei nur, um die Spieler wieder loszuwerden |

**[OFFEN]** Noch zu entwickeln: der unqualifizierte Schiffs-„Medicus" (stand als Nächster in
der Warteschlange).

---

## 9. Grimsgate — der Ausgangshafen

Fiktive englische Küstenstadt. Die Stadtkarte wird den Spielern **vorab** ausgehändigt, damit
sie sich orientieren und eventuell schon Wege planen können, bevor sie wissen, wohin es geht.

### 9.1 Zur letzten Heuer (Taverne) — zentraler Rekrutierungsort

Vier Wege an Bord:

1. **Francesco** — Charme / Überzeugung
2. **Tom Fletcher** — Liar's Dice (Meiern-Regeln)
3. **Trewin-Zwillinge** — Trinkwettbewerb (Körper)
4. **Wat** — erzwungenes Shanghaiing (Rückfalloption, falls alles andere scheitert)

Zwischen Francesco und Tom existiert eine etablierte Rückfallschleife.

### 9.2 Weitere Orte

| Ort | Inhalt |
|---|---|
| **Markt** | Handel, Menschenmengen, Gerüchte. Improvisationsarm gehalten |
| **Lagerhäuser** | Schlüsselszene: Bei gelungener Wahrnehmung belauschen die Spieler einen Wachmann und einen gut gekleideten Mann (Harwick) — Thema: das Fehlen der Golden Lion im Hafenregister. Bewusste Brotkrume Richtung Hafenmeisterei |
| **Krämerladen** | Freundlicher alter Ladenbesitzer, deutet an, dass die Schiffe fast voll sind |
| **Hafenmeisterei** | Ashworth + Schreiber. Optionale Szene, nur bei aktiver Nachfrage: Alle Schiffe gelten als voll; der Schreiber erwähnt beiläufig, dass „Zur letzten Heuer" noch anwirbt — Ashworth ist irritiert, weil die Golden Lion nicht registriert ist. Endet in einer mild komischen Bloßstellung des Schreibers (der offenbar selbst in der Taverne war) |
| **Bordell** | Constance Wrey. Zusätzlicher Shanghaiing-Vektor für Wat (kein fünfter eigenständiger Rekrutierungsweg): Die Frauen arbeiten für Wat, fixieren den Spieler, Wat holt ihn später ab. Fluchtmöglichkeiten über gutes Auftreten oder Freireden im fixierten Zustand |

### 9.3 Hafenmeisterei — Trigger-Mechanik

Geht ein Spieler **vor** der Taverne zur Hafenmeisterei, schickt Ashworth einen Wachmann, der
ihn beschattet, bis das Schiff identifiziert ist. Am nächsten Morgen stellt Ashworth Harwick
mit Wachen vor dem Schiff — Harwick löst das üblicherweise geschmeidig (Charme, Bestechung).

Wird der Spieler als derjenige erkannt, der die Wache hinführte: Ruf-Verlust bei der Crew.

> **[OFFEN]** Die Erkennungs-Mechanik (Probe? Automatisch?) ist noch nicht festgelegt.
> Wichtig: **Kein** eigenständiger Zugang zum Schiff über diese Route — die Rekrutierung
> bleibt ausschließlich über die vier Tavernenwege.

### 9.4 Bordell — Raubein-Szene

Ein grober Gast belästigt die Frauen, die Madame will ihn draußen haben, er eskaliert.
Erreichbar aus zwei Richtungen (Spieler im Empfangsbereich bei Ezra/Ned hört es direkt;
Spieler oben hört den Streit und kann hinunterstürzen).

| Lösung | Wirkung |
|---|---|
| Sofortiges körperliches Eingreifen (Ezra + Ned helfen) | Ruf-Gewinn bei Ezra und Ned |
| Soziale Deeskalation (Auftreten / Rhetorik) | Neutral |
| Nicht eingreifen | Konsequenz — **[OFFEN]**, Ruf-Malus oder verpasste Gelegenheit |

Diese Entscheidung wirkt später am Bug der Golden Lion nach (siehe 10.3).

---

## 10. Die Golden Lion — Ortsinhalte

Die erste Stunde an Bord ist bewusst überfüllt: viele klar visualisierte Möglichkeiten, die
Neugier wecken. Eine Tür, die jetzt zu ist, kann später offen sein. Verändern sich im Sturm
Bilder, bleibt die Frage: *Wo hat sich was geändert? Welchen Ort müssen wir neu besuchen?*

### 10.1 Achterdeck — Tom Fletcher ✅ ausgearbeitet

**Standard:** Tom am Ruder, wirkt nebenbei bei der Sache, hält aber mühelos Kurs.

**Wunsch 1 — Der Knoten-Streich.** Tom liest die Gruppe und schickt den Spieler mit dem
**niedrigsten Seefahrt-Wert** (objektiver Vergleich der Charakterbögen) in den Frachtraum:

> „Wir sind zu langsam. Lauf runter in den Frachtraum, hol mir ein paar Knoten mehr."

Der Witz basiert auf echtem Fachjargon: Geschwindigkeit wurde mit der **Logleine** gemessen,
einer Leine mit in festen Abständen eingeknüpften Knoten. Daher stammt die Einheit „Knoten".
Man kann Geschwindigkeit also nicht „nachfüllen" — ein erfahrener Seemann würde sofort lachen.

| Reaktion | Effekt |
|---|---|
| Durchschaut, reagiert locker/witzig | Kleiner Ruf-Plus bei Tom |
| Durchschaut, reagiert genervt/vorwurfsvoll | Neutral |
| Ignoriert | Neutral |
| Läuft tatsächlich los | Kleiner Ruf-Minus bei Tom |

**Verzahnung:** Wer tatsächlich losläuft, landet im Frachtraum — und trifft dort je nach
Timer-Stand auf den versteckten Jungen oder auf einen leeren Raum.

**Wunsch 2 — Ruder halten.** Läuft jemand los, bittet Tom einen zufälligen der Verbliebenen,
kurz zu übernehmen, und verschwindet.

| Reaktion | Effekt |
|---|---|
| Greift sofort zu, Seefahrt-Probe gelingt (bei Körper ≤ 2 zusätzlich Körper-Probe, beide müssen gelingen) | Ruf-Plus bei Tom |
| Greift zu, verliert die Kontrolle | Ruf-Minus bei Tom |
| Lehnt ab / zögert | Neutral |

### 10.2 Oberdeck — Francesco Almeida ✅ ausgearbeitet

**Standard:** Francesco lehnt an der Reeling und faulenzt, statt die Deckarbeit zu
beaufsichtigen. Er hängt sich freundlich bei herumstehenden Spielern ein, wird aber von sich
aus nicht aktiv.

**Kein Auftrag.** Er teilt nur mit, dass man sich bei Fragen oder Bedarf an ihn wenden kann.

**Auskunft:** Auf Nachfrage ehrliche Einschätzungen zu anderen Figuren (Tabelle 8.4).

**Ohne Ansprache:** Sehnt sich hörbar nach Sonne und warmer Luft — „nicht wie hier in diesem
traurigen, grauen England". **Zahlt sich später in der Karibik aus**, wo sein ganzes Wesen
sichtbar aufgehen kann.

### 10.3 Bug — Ned Sharpe & Ezra Coombe ✅ ausgearbeitet

**Standard:** Die beiden unterhalten sich über den Bordellbesuch — konkret über den Vorfall
mit dem groben Gast und Constance' Reaktion.

| Vorgeschichte des Spielers | Reaktion |
|---|---|
| War dort, griff körperlich ein | Warm, fast bewundernd; erzählen die Geschichte nach, mit kleinen Übertreibungen |
| War dort, deeskalierte sozial | Anerkennend, ruhiger, würdigend |
| War dort, griff nicht ein | Erkennen ihn, aber kühler; knapper, leicht distanzierter Kommentar ohne offenen Vorwurf |
| War nicht dort | Ned wird sichtlich unangenehm berührt, wechselt das Thema — reine Verlegenheit, keine Folge |

### 10.4 Batteriedeck — Dirk van Hoorn & Trewin-Zwillinge ✅ ausgearbeitet

**Dirk — Standard:** Arbeitet allein an Kanonen und Werkzeug, will nicht gestört werden,
einsilbig bei Small Talk.

**Dirk — Auslöser:** Nur eine **echte Mechanik-/Handwerks-Probe oder ein konkretes kaputtes
Objekt** weckt Interesse. Fachlich klingendes Gerede allein reicht nicht.

**Dirk — Payoff:** Bei Erfolg taut er kurz auf und **merkt sich den Spieler**. Erst später,
**nach der Sturm-Szene** (eigener, noch auszuarbeitender Programmpunkt), kommt Dirk mit einem
kniffligen mechanischen Problem auf genau diesen Spieler zu — dort besteht die Chance auf
einen **großen** Ruf-Gewinn.

> **Korrektur (Juli 2026):** Ursprünglich stand hier „in der Sturm-Szene" — Dirks Payoff liegt
> aber **nach** dem Sturm, nicht während. Während des Sturms selbst hat das Batteriedeck eine
> eigene, davon unabhängige Szene (siehe 10.11) — dort bleibt Dirk bewusst unbenannt.

**Trewin-Zwillinge:**

| Ausgang des Trinkwettbewerbs | Zustand |
|---|---|
| Spieler hat gewonnen | Über Kreuz übereinander in einer Hängematte verkeilt, stöhnen vor Übelkeit, zanken sich gegenseitig an, dass der andere Platz machen soll — können sich kaum bewegen |
| Spieler hat verloren | Triumphierend, spöttisch |
| Nie angetreten | Neutral, ignorieren den Spieler |

### 10.5 Kombüse — Josiah Pryce ✅ ausgearbeitet

**Flavortext (Spieler-Hinweis):** Ein freundlicher, wie es sich für einen guten Koch gehört
etwas rundlicher Mann mit Lachfalten steht am Herd und summt leise vor sich hin. Es duftet
fantastisch.

Bewusst **kein Aufforderungssatz** im Flavortext (kein „begrüßt neue Gesichter..."). Reiner
Raumeindruck — was Josiah tut, sollen die Spieler spielen und selbst herausfinden, nicht
vorgelesen bekommen.

**SL-Verhalten (nicht für Spieler sichtbar):** Josiah begrüßt jeden, der die Kombüse betritt,
herzlich — unabhängig vom Ruf, unabhängig davon, ob der Spieler freiwillig oder durch
Erpressung/Gewalt an Bord ist. Bietet von sich aus etwas zu essen oder Ähnliches an.
Beantwortet Fragen offen und ehrlich.

**Charakterzug:** Josiah sieht in jedem das Gute — redet über niemanden schlecht, egal wer
gerade Zielscheibe ist. Lästern Spieler vor ihm über irgendjemanden an Bord, widerspricht er
warm und automatisch, nie belehrend, einfach weil er es so empfindet. (Ersetzt eine frühere,
zu mechanische Fassung im Crew-Manifest, die Rufgewinn/-verlust an einzelne Trigger koppelte —
siehe Korrektur unten.)

Bewusst **kein aktiver Wunsch und keine Ruf-Mechanik** hier — anders als Tom, Dirk oder die
Werkstatt. Reiner Charakter zum Spielen. Sein großer Moment ist die Wat-Konfrontationsszene
(11.1, Pfad B). Anlaufstelle für den blinden Passagier (siehe 11).

> **Korrektur (Juli 2026):** Das Crew-Manifest enthielt einen früheren Entwurf mit direkten
> Ruftriggern für Josiah (Freundlichkeit → Rufgewinn, Lästern über Harwick speziell →
> betrübt, etc.). Das wurde verworfen — zu mechanisch für einen Charakter, der bewusst nicht
> über Trigger, sondern über Rollenspiel funktioniert. Ersetzt durch die Charakternotiz oben.

### 10.6 Frachtraum ✅ ausgearbeitet

**Basis-Flavortext:** Dunkel, still, vollgestopft: Fässer und Kisten dicht gestaut, Tauwerk
und Segeltuch verzurrt. Kein offenes Feuer erlaubt — nur gedämpftes Licht, das durch eine
Gitterluke von einem Deck darüber hereinfällt. Ein Ort, an dem sich niemand lange aufhält.

**Kein dauerhafter Aufenthaltsort** — er wird nur sporadisch aufgesucht (Nachschub holen,
umschichten, gezielt etwas suchen). Genau deshalb der ideale Ort für den blinden Passagier und
für heimliche Aktionen.

Zwei Bildzustände über das Varianten-System (siehe 13.3): mit sichtbaren Händen hinter einer
Kiste (**Standard**) und ohne (**Leer**). Die Standard-Variante trägt zusätzlich einen beiläufigen
Zusatzsatz, bewusst kein Hinweisschild:

> „Habe ich da gerade etwas gehört? Bestimmt nur das Schiff."

Technisch dafür das Varianten-System um ein eigenes `desc`-Feld pro Variante erweitert
(zusätzlich zu `img`) — siehe 13.4.

**Fund des blinden Passagiers:** Kein Wurf nötig. Ist die Standard-Variante aktiv und sagt ein
Spieler sinngemäß „ich durchsuche den Raum", wird der Junge automatisch gefunden. Ausführliche
Mechanik siehe 11.1.

### 10.7 Offiziersquartier ✅ abgeschlossen

**Zwei eigene, knapp geschnittene Zimmer** für Cormac und Tom, nebeneinander, mit Blick aus
dem Gang. Die Türen erzählen die Charaktere:

- **Cormacs Tür ist geschlossen** und verriegelt: schlicht, ohne Ornament, davor aufgeräumt.
  Nichts zu sehen, nichts zu zeigen — disziplinierte Kontrolle.
- **Toms Tür steht offen**: Hängematte statt fester Koje, zerwühlte Decken, Würfel und Karten
  auf Tisch und Boden verstreut, leere Flaschen, ein achtlos weggekickter Stiefel — und ein
  **blaues Halstuch** über einem Hocker, das sich als Wiedererkennungs-Requisit für ihn
  anbietet.

**Finaler Flavortext:** Zwei knapp geschnittene Kammern liegen Tür an Tür. Die eine ist
geschlossen und verriegelt — schlicht, ohne Ornament, der Gang davor aufgeräumt. Die andere
steht offen: eine Hängematte statt fester Koje, zerwühlte Decken, Würfel und Karten verstreut
auf Tisch und Boden, ein paar leere Flaschen, ein achtlos weggekickter Stiefel. Über einem
Hocker hängt ein blaues Halstuch.

Bewusst ohne Namen im Text — die Zuordnung (Cormac/Tom) erschließt sich aus dem, was die
Spieler über beide schon wissen. **Reiner Flavor-Ort**, keine eigene NPC-Wunsch-Szene.

Die alte Marker-Beschreibung in `golden_lion_scenes.js` ist ersetzt — passt jetzt zum Bild.

### 10.8 Kapitänskajüte ✅ abgeschlossen

Durch die Fenster neben der verriegelten Tür ist Harwick sichtbar: warmes Lampenlicht, er
sitzt über Papieren am Schreibtisch, konzentriert. Wer anklopft, bekommt keine Antwort.

**Finaler Flavortext:** Die Tür zur Kapitänskajüte ist verriegelt. Durch die Fenster daneben
fällt warmes Lampenlicht — drinnen sitzt Harwick über Papieren am Schreibtisch, den Kopf
gesenkt, konzentriert. Wer anklopft, bekommt keine Antwort.

Bewusst ohne zusätzliches NPC-Element (kein Wachposten, keine Erklärung) — passt zur
Design-Entscheidung, dass es hier keinen Zugang und keine Szene gibt, nur die
Außenwahrnehmung. **Reiner Flavor-Ort**, keine eigene Szene.

### 10.9 Werkstatt — Schiffszimmermann & Handwerker ✅ ausgearbeitet

**Standard:** Mehrere Männer bei der Arbeit, spürbar ordentlicher als im Rest des Schiffs.
Gute Wahrnehmung oder Mechanik erkennt: gelernte Handwerker, keine einfachen Matrosen.

**Finaler Flavortext:** Mehrere Männer bei der Arbeit — hier läuft es merklich ordentlicher
als im Rest des Schiffs. Werkzeug hat seinen Platz, nichts liegt achtlos herum. Wer genau
hinsieht (oder selbst etwas vom Handwerk versteht), erkennt: Das sind keine einfachen
Matrosen, sondern gelernte Leute.

**Der erste Spieler, der den Raum betritt**, wird direkt eingespannt: „Schnapp dir den
Fuchsschwanz und gib mir das auf 30 Zoll raus." (Fuchsschwanz = Handsäge, benannt nach der
spitz zulaufenden, fuchsrutenartigen Blattform — historisch seit dem Mittelalter gebräuchlich,
kein Anachronismus.) Der Mann am Tisch reicht ein Kanthol, schaut kaum auf, bleibt bei seiner
eigenen Arbeit. Mechanik-Probe:

| Ergebnis | Ausgang |
|---|---|
| Guter Erfolg | Schnitt exakt auf Maß, kurzes Nicken. **Ruf-Gewinn** |
| Normaler Erfolg | Brauchbar, kein Kommentar. Neutral |
| Schlechter Erfolg | Sichtbar daneben, wortlos beiseitegelegt. Neutral |
| Misserfolg | Splittert oder grob falsches Maß — einziger Moment, wo er aufsieht. **Ruf-Malus** |

Namenlose Crewmitglieder, bewusst **kein Wiedererkennungs-Bogen** — anders als Dirk auf dem
Batteriedeck (dessen Payoff nach dem Sturm folgt) kein späterer Zahltag.

**Nachkommende Spieler** bekommen keine eigene Aufgabe. Auf Nachfrage: „Wir kommen zurecht,
geh zu Cormac, wenn du Arbeit suchst."

### 10.10 Unterdeck (Mannschaft) ✅ ausgearbeitet

Bewusst als **Falle** angelegt, die eigentlich harmlos ist: rotierende, feste Schlafplätze,
der einzig ruhige Ort auf dem ganzen Schiff.

**Finaler Flavortext:** Enge Reihen fester Kojen, dicht an dicht eingebaut, Vorhänge davor für
ein wenig Privatsphäre — mehr Komfort, als man auf einem Schiff erwarten würde. Es ist der
einzige wirklich ruhige Ort auf dem ganzen Schiff: gedämpfte Stimmen, gleichmäßiges Atmen,
irgendwo ein leises Schnarchen. Die Crew schläft in Schichten, rotierend — hier liegt immer
irgendwer, während andere Wache stehen.

> **Bewusste Korrektur:** Feste, eingebaute Kojen mit Vorhängen — **keine Hängematten**.
> Ursprünglicher Entwurf ging von Hängematten aus, per Referenzbild korrigiert.

Spieler, die den Raum durchqueren, würfeln auf **Geschick oder Geheim**:

| Ergebnis | Ausgang |
|---|---|
| Erfolg | Nichts. Unauffällig durch |
| Misserfolg | Gemecker von den Gestörten, **Ruf-Malus für alle anwesenden Spieler** |

### 10.11 Die Sturm-Szene (3.1) ✅ ausgearbeitet

Szene `"3.1"` in `golden_lion_scenes.js`, T+60 (siehe 6.1). **Nur fünf der zehn Orte spielen
mit** — die übrigen fünf sind für den Sturm inhaltlich irrelevant:

> **Ausgeblendet:** Bug, Offiziersquartier, Unterdeck, Werkstatt, Kombüse.
> **Aktiv:** Oberdeck, Achterdeck, Kapitänskajüte, Batteriedeck, Frachtraum.

Technisch umgesetzt über ein neues Szenen-Feld `hiddenMarkers` (Liste von Marker-IDs, die in
dieser Szene nicht erscheinen) — Erweiterung des Basis/Override-Prinzips aus 13.3, ohne die
Grundarchitektur anzutasten.

> **Korrektur (Juli 2026):** Das `descOverrides`-Prinzip (s. u.) galt bisher nur für den
> Spieler-Text. Im Admin-Panel (`regie.html`) zeigten die vier aktiven Orte mit hinterlegten
> `personen`/`kurz`/`ortHinweis`-Feldern (Achterdeck, Oberdeck, Batteriedeck, Frachtraum) für
> 3.1 weiterhin exakt dieselbe Zusammenfassung wie für 2.1 — obwohl 3.1 inhaltlich eine
> komplett andere Szene ist und außer dem Ortsnamen selbst nichts übernommen werden sollte.
> Behoben über ein neues, analoges Feld `szenenUeberschreibungen` in `regie.js` (siehe 13.2),
> mit eigenständigem Text für alle vier Orte. Batteriedeck und Frachtraum bleiben konsistent
> zum Design-Prinzip „keine Namen im Sturm-Chaos" (s. u.) namenlos (Dirk/Trewin-Zwillinge/
> blinder Passagier fehlen dort bewusst); Achterdeck behält Tom und Oberdeck bekam mit Cormac
> und Ned eigene, namentlich benannte Sturm-Interaktionen (siehe unten), da beide im
> Flavortext selbst auftauchen.

**Finale Flavortexte (alle fünf Orte mit eigenem `_sturm`-Bild):**

> **Oberdeck:** Regen peitscht fast waagerecht über das Deck, Blitze zerreißen den Himmel.
> Cormac steht mitten im Chaos und ruft Befehle — die Segel sind noch zu weit draußen, und
> wenn sie nicht bald eingeschnürt werden, droht der Mast abzureißen. Männer hängen in den
> Wanten, kämpfen mit den nassen Leinen, während andere sich nur noch am Deck festkrallen, von
> der letzten Welle niedergeworfen.

> **Achterdeck:** Tom kämpft mit dem Ruder, beide Hände fest um die Speichen, Muskeln sichtbar
> angespannt — von der lässigen Mühelosigkeit sonst keine Spur. Jede Welle versucht, ihm das
> Ruder aus der Hand zu reißen.

> **Kapitänskajüte:** Trotz des tobenden Sturms sitzt Harwick unbewegt über Karte und Kompass,
> den Blick auf den Kurs gerichtet, während das Schiff um ihn herum ächzt und schlingert.
> Regenwasser läuft in Bahnen die Fenster herab, ein Blitz zuckt durch die Scheiben — er
> scheint es kaum zu bemerken. Bewusster Kontrast: Während draußen alles kämpft, bleibt er
> drinnen gefasst — nicht Ignoranz, sondern Kontrolle. Navigation/Kursentscheidung ist ohnehin
> seine Aufgabe, während Ruder und Segel bei der Crew liegen — nautisch stimmige
> Arbeitsteilung.

> **Batteriedeck:** Wasser strömt in Schwällen von oben herein, das Deck liegt unter einer
> rutschigen Wasserschicht. Eine der Kanonen hat sich losgerissen und rollt bei jeder Welle
> bedrohlich hin und her. Lärm und Chaos, so weit man hört.

> **Frachtraum:** Der Frachtraum steht knöcheltief unter Wasser — bei jeder Welle schwappt es
> zwischen den Fässern hin und her. Irgendwo dringt Wasser ein, das hier nicht hingehört. Wenn
> niemand bald etwas unternimmt, wird es mehr.

**Oberdeck — Cormac & das Segel:** Kommen Spieler in Cormacs Nähe, schickt er die zwei mit dem
höchsten Geschick-Wert hoch in die Takelage, um das noch zu weit draußen stehende Segel
einzuschnüren, bevor der Mast abreißt. Der Aufstieg bei diesem Wetter ist gefährlich — Regen
und Wind reißen an den Spielern.

- Probe: **Geschick+10**
- **Guter Erfolg** beeindruckt Cormac sichtbar — normaler/schlechter Erfolg neutral,
  **Misserfolg [OFFEN]** (Konsequenz noch nicht festgelegt)
- Gleichzeitig würfeln die übrigen Spieler an Deck **Körper-Proben**, um sich festzuhalten

**Oberdeck — Ned stürzt:** Ned Sharpe rutscht vorne am Bug aus und wird übers ganze Deck
geschliffen. Spieler können versuchen, ihn aufzufangen (Probe **[OFFEN]** — Körper oder
Geschick, welche genau bzw. ob wahlweise ist noch nicht entschieden).

- **Aufgefangen** → Ned hat einen Freund fürs Leben gewonnen — großer, dauerhafter
  Ruf-Gewinn bei Ned
- **Nicht aufgefangen [OFFEN]** (Konsequenz noch nicht festgelegt)

**Oberdeck — Der Höhepunkt des Sturms:** Ein paar Minuten in den Sturm hinein (SL-Ermessen)
eskaliert die Lage weiter: Der Mast reißt — obwohl die Segel eingezogen wurden, reicht das
gegen die Wucht des Sturms nicht. Das Ruder klemmt (Achterdeck), Tom kann dort nichts mehr
ausrichten und kommt aufs Oberdeck. Praktisch die gesamte wichtige Crew versammelt sich dort.

Jetzt zeigt sich, was wirklich in Tom steckt — **reiner Erzählmoment, bewusst kein Wurf,
keine Spieler-Aufgabe:** Er springt übers Deck, checkt immer wieder seinen kleinen Kompass,
zieht Seile über verschiedene Winden zum Bug, lehnt sich über die Reling, zählt leise, checkt
wieder den Kompass — und hält so durch gezieltes Anker lassen (rechts/links) den Kurs auf
eine tropische Insel.

Auflösung: Der Sturm lichtet sich, die übrigen Segel werden gehisst, Tom und Cormac dirigieren
die Crew wie ein Orchester.

**Vielsagende Blicke (optional):** Während dessen bleibt Harwick über seinen Karten in der
Kapitänskajüte, schaut ernst hinaus. Optionale Wahrnehmungs-Probe (keine Erschwernis, analog
zur Lagerhäuser-Beobachtung in Grimsgate) — bei Erfolg bemerkt ein aufmerksamer Spieler
vielsagende Blicke zwischen Harwick und seinen Offizieren.

> **Zukunfts-Notiz:** Fast alle an Bord denken, sie seien einfach gestrandet — tatsächlich
> war das genau der Ort, den Harwick über Tom ansteuern ließ. Dieser Reveal ist noch nicht
> ausformuliert und Teil der Schatzinsel-Ausarbeitung (siehe Abschnitt 16).

**Achterdeck — Toms loses Mundwerk:** Tom ist Steuermann und kann/wird seinen Posten während
des Sturms **nicht verlassen** — Harwick verlässt sich blind auf ihn. Trotzdem bleibt er er
selbst: Kommen Spieler in seine Nähe, hat er noch einen lockeren Spruch auf den Lippen —
„Halt dich fest, ich spring für dich bestimmt nicht ins Wasser!“ Kam der Knoten-Streich (2.1)
bei diesem Spieler gut an, spielt er zusätzlich darauf an.

Da er selbst nicht vom Ruder weg kann, lotst er die Spieler stattdessen dorthin, wo Hilfe
gebraucht wird (Oberdeck/Cormac, Batteriedeck/Kanone oder Frachtraum/Wassereinbruch) — welche
Stelle er nennt, liegt im **Ermessen des Spielleiters**. Bewusst **keine Probe, kein
Ruf-Effekt** — reiner Charaktermoment (vgl. Josiah in der Kombüse), passend zum
Design-Prinzip „Gutes Rollenspiel schlägt Mechanik" (2.6).

**Batteriedeck — Losgerissene Kanone:** Bewusst **keine Namen, keine vorweggenommenen
Handlungen** im Flavortext — Dirk hilft zwar mit und ruft Anweisungen, wird aber nicht genannt
(die Spieler kennen zu diesem Zeitpunkt seine Position nicht). Mechanik:

- Mindestens **3 kumulative erfolgreiche Körperproben**, um die Kanone zurück auf den Sockel
  zu stemmen — mehrere Spieler können gemeinsam beitragen
- **Guter Erfolg zählt doppelt** (reiner Fluff-Moment: die Wucht beeindruckt sichtbar die
  Crew, keine mechanische Zusatzregel)
- **Misserfolg → 1 Schadenspunkt**
- **Kein Ruf-Fokus** — bleibt anonym im Chaos

> **Zukunfts-Notiz:** Schaden aus dieser Szene bleibt bestehen und wirkt sich später auf der
> Schatzinsel aus — kann dort gefährlich werden oder einen Spieler ganz von der Schatzsuche
> ausschließen. Details folgen, wenn die Insel-Stationen ausgearbeitet werden.

**Frachtraum — Wassereinbruch:** Löst für diese Szene das Varianten-System (Standard/Leer, der
blinde Passagier ist zu diesem Zeitpunkt kein Thema mehr im Raum) ab — reines Sturm-Bild ohne
Varianten-Bezug. Zwei nötige Schritte:

1. **Pumpen** — Spieler mit Seefahrt-Wissen wissen ohne Probe, wo die schiffseigene Pumpe
   sitzt (historisch korrekt: fest verbaute Lenzpumpen gehören seit dem 15. Jahrhundert zur
   Standardausstattung jedes Kriegsschiffs). Das Pumpen selbst: **Körper-Probe** — hält den
   Wasserstand nur im Zaum, dichtet aber nichts ab.
2. **Abdichten** — aktive Nachfrage nach Planken in der Werkstatt (keine Probe), dann
   **Mechanik-Probe** (alternativ Geschick), um das Leck zu stopfen.

Ruf hängt am WIE:

| Verlauf | Ruf |
|---|---|
| Selbstorganisiert (Spieler erkennen's, bringen beides selbst in Gang) | **Ruf-Gewinn bei der Crew allgemein** |
| Auf Anweisung von Cormac oder Dirk | Neutral |
| Misserfolg bei Pumpen/Abdichten | **Kein Malus** — geht im Chaos unter |

Dirks eigentlicher Sturm-Payoff (10.4) bleibt ein separates, späteres Ereignis **nach** dem
Sturm — nicht dieses hier.

---

## 11. Der blinde Passagier — durchgehender Faden

**Wer:** Waisenjunge aus Grimsgate, ca. 8–10 Jahre. Keine Eltern mehr, schlägt sich seit
Jahren allein oder in einer losen Gruppe Straßenkinder am Hafen durch. Kennt jeden Winkel der
Stadt, aber nie das Meer — nur Schiffe von außen, im Hafen liegend.

**Ziel:** Reine Abenteuerlust, kein Plan, kein Zielort. Er läuft nicht **vor** etwas weg,
sondern **auf** etwas zu, das er sich nie erlauben durfte zu wollen. Diese Naivität steht in
bewusstem Kontrast zu Harwicks alles andere als naiven Beweggründen.

**Funktion:** Katalysator — er bringt die Spieler mit Figuren in Kontakt, wo die Gruppe es
gerade braucht. Zusätzlich ein Baustein für das große Bild von Harwick: **Herzlichkeit, die
man nicht mit Schwäche verwechseln sollte.**

### 11.1 Ablauf

**Pfad A — Spieler finden ihn zuerst.** Kein Wurf nötig: Ist die Bildvariante „Standard"
aktiv (Frachtraum) und durchsucht ein Spieler aktiv den Raum, wird der Junge automatisch
gefunden. Danach vier mögliche Verläufe:

| Verhalten | Konsequenz |
|---|---|
| Spieler holen ihn aus dem Frachtraum heraus | Wat bekommt es mit → **Pfad-B-Trigger startet** |
| Spieler lassen ihn dort, gehen vor T+30 direkt zu **Josiah, Francesco, Cormac oder Tom** | Wat findet ihn **nicht** |
| Spieler lassen ihn dort, unternehmen lange Zeit nichts | Er findet irgendwann aus Hunger von selbst zu Josiah |

Vier gleichwertige Vertrauenspersonen statt nur Josiah als einzigem Weg — löst die frühere
offene Frage, an wen genau sich die Spieler wenden dürfen.

> **SL-Ermessen:** Ob und wie hart Pfad B (Wat-Konfrontation) ausfällt, liegt im Spielraum des
> Spielleiters — abhängig z. B. davon, ob die Gruppe Wat schon kennengelernt hat, ob eine
> härtere Version gerade der Charakterbildung nützt, oder ob die Gruppe ohnehin aggressiv
> gestimmt ist und eskalieren würde. Keine feste Regel, reine Spielleiter-Freiheit (vgl. 2.6).

**Pfad B — T+30 verstreicht ergebnislos** (oder Spieler holen ihn selbst heraus): Wat findet
ihn. Die Konfrontationsszene läuft fest ab:

1. Wat hält den Jungen an einem Bein über die Reeling
2. Cormac redet auf ihn ein — **ohne Wirkung**, trotz formaler Autorität als Quartiermeister
3. Selbst Tom knickt ein
4. Statt zum Kapitän läuft jemand aus der Crew zu **Josiah**
5. Josiah kommt **schwer atmend** an Deck (die Kombüse liegt tief unten, er ist kein schneller
   Mann — man merkt, dass er sich beeilt hat)
6. Mit ruhigen Worten bringt er Wat dazu, den Jungen zurück an Deck zu holen

**Warum diese Szene wichtig ist:** Sie macht live sichtbar, was bisher nur behauptet war —
Wat hört auf Josiah, und **auf niemanden sonst**, nicht einmal auf Cormac. Der Grund dafür
bleibt weiterhin ungelüftet.

### 11.2 Danach

Harwick wird weich und setzt den Jungen je nach Fähigkeiten ein — bei Josiah in der Kombüse
wäre er gut aufgehoben.

---

## 12. Enthüllungsfäden — das Tochter-Geheimnis

Die Wahrheit über die tote Tochter verdichtet sich in der Phase nach dem Artefakthandel. Drei
parallele Wege, damit sie nicht an einer einzigen Bedingung hängt:

1. **Der intime Weg** — höchste Rufstufe beim Kapitän (Ende Session 2 / Anfang Session 3)
2. **Der intellektuelle Weg** — entschlüsselte Schriftrollen aus den gekauften Artefakten,
   sprechen womöglich vom „liebenden Vater". Der große Moment des Gelehrten
3. **Der beiläufige Weg** — Crew-Fragmente wie Ezras „früher war der Käpt'n ein anderer"

**Dramaturgische Absicht:** Das Massaker beim Handel zeigt Harwick als **gefährlich**, die
Tochter-Wahrheit kurz darauf als **menschlich**. Diese zeitliche Nähe erzeugt die komplexe
Emotion, die den ganzen Schluss trägt.

### 12.1 Das Finale

Das Ritual scheitert und entfesselt Untote/Geister, die die Spieler massiv bedrohen.

**Die Qualität des Endkampfes hängt vom eingeschlagenen Weg ab:**

| Weg | Art des Finalkampfes |
|---|---|
| Schmugglernest → Schamanen-Insel | **Kluger Kampf** — man kennt die Schwächen der Untoten |
| Flaute → Vorbereitungshafen | **Gerüsteter Kampf** — Kanonen, Ausrüstung, Proviant |
| Spanier-Route → Riffinsel | **Improvisierter Kampf** — kein Wissen, aber zufällige Ressourcen |
| Einfach Harwicks Weg, ohne Wissen und ohne Vorbereitung | **Niederlage** — entweder opfert sich Harwick für die Spieler, oder die Spieler sterben |

**Die moralische Umkehrung (zentral):** Der moralisch schwerste Weg — das Schmugglernest, bei
dem man ein verletztes Crewmitglied bewusst sterben lässt — ist mechanisch der **beste** und
eröffnet als Einziger die Chance auf ein gutes Ende. Ausgerechnet nach einer harten,
unmenschlich wirkenden Entscheidung könnte am Schluss die schönste Auflösung stehen.

**Grundsatz:** Kein Weg ist eine Strafe. Jeder ist ein anderer Trade-off. Die Spieler sollen
spüren, dass sie etwas verpasst haben — es aber nicht bereuen.

**Der Schutz-Anhänger (nur über den Schmugglernest-Weg, August 2026):** Beim Artefakthändler in
der Schmugglernest-Höhlenstadt (Szene `8.1`, `ORTE.schmuggler_artefakthaendler`) erhält die
Gruppe einen einzelnen Anhänger, der vor der Magie der Geisterwelt schützt — nur ein Exemplar,
kein zweites vorhanden. Im Finale stehen zwei Verwendungen offen, sich gegenseitig
ausschließend:

- **Von einem Kämpfer getragen:** schützt seinen Träger tatsächlich vor Schaden im Endkampf.
- **Der Tochter gegeben:** Das Ritual gelingt dadurch — aber nur kurz. Kurz genug, dass sie
  ihrem Vater sagt, dass ihn keine Schuld trifft, dass sie durch seine Trauer im Zwischen
  gefangen ist, und dass er sie loslassen muss, damit sie die Ruhe findet, die sie verdient.

Damit ist die vorherige offene Frage entschieden: Die Tochter wird **nicht** dauerhaft
wiederbelebt — das kurze Gelingen des Rituals ist ein Abschied, kein zweites Leben.

**Alternatives Ende:** Bei höchstem Ruf opfert sich Harwick für die Spieler. Andernfalls
können sie mit ihm zusammen überleben — als gebrochener Mann, der schmerzlich erkennt, dass
er bei allem Übernatürlichen den Tod nicht bezwingen kann.

---

## 13. Technischer Stack

### 13.1 Hosting & Dateien

**GitHub Pages:** `https://xevvll.github.io/PnP-Desk/`
(Benutzername „xevvll" — zwei kleine L; Repo hieß bis August 2026 „Korsaren-Map")

> **Restrukturierung (Juli 2026):** Das Projekt lag bisher komplett flach im
> Hauptordner mit uneinheitlichen Namen (u. a. `grimsgate_admin.html`, obwohl
> die Seite längst beide Karten — Grimsgate UND Golden Lion — verwaltet).
> Seiten liegen weiterhin im Hauptordner (stabile URLs), Bilder liegen jetzt
> unter `images/`, die Daten-/Logik-Dateien unter `js/`. An den alten
> Dateinamen (`grimsgate_admin.html`, `korsaren_szenen.html`,
> `crew_manifest.html`) liegen dünne Weiterleitungs-Seiten, damit alte
> Lesezeichen weiter funktionieren. Audiodateien bleiben bewusst im
> Hauptordner (nicht in einem Unterordner): Ihr Dateiname kann pro Szene live
> im Admin-Panel in Firebase hinterlegt sein (`sceneAudioFile/{sceneId}`) —
> das ist von hier aus nicht einsehbar oder migrierbar, ein Verschieben in
> einen Unterordner hätte lautlos bereits gesetzte Szenen-Töne brechen
> können. Das Dateiformat selbst wurde trotzdem geändert, siehe 13.1b.

| Datei/Ordner | Funktion |
|---|---|
| `index.html` | Reine Weiterleitung auf `karte.html` — bewusst ohne sichtbare Links zu `regie.html`/`besatzung.html`, damit Spieler auf der Wurzel-URL nie versehentlich das Spielleiter-Panel zu sehen bekommen |
| `karte.html` | Vereinheitlichte Spieler-Kartenseite (war `korsaren_szenen.html`) |
| `regie.html` | Admin-/Spielleiter-Panel (war `grimsgate_admin.html`) |
| `besatzung.html` | Filterbare NPC-Karten (war `crew_manifest.html`) |
| `js/scenes.js` | Szenendefinitionen Grimsgate |
| `js/golden_lion_scenes.js` | Szenendefinitionen Schiff (Basis/Override-Architektur) |
| `js/regie.js` | Spielleiter-Inhalte: Interaktionen, Trigger, Hinweise, Notizen — flache Struktur, ein Eintrag pro Ort-ID |
| `js/characters.js` | Charakterdaten und Portraitpfade |
| `js/firebase-config.js` | Firebase-Zugangsdaten |
| `images/` | Alle Karten-, Innenraum- und Portraitbilder (WebP, siehe 13.1a) |
| `tools/optimize_images.py` | Skript zum Verkleinern/Konvertieren neuer Bilder vor dem Commit |
| `*.ogg` (Hauptordner) | Szenen-Hintergrundtöne (Opus, siehe 13.1b), Zuordnung läuft über das Admin-Panel/Firebase |
| `tools/optimize_audio.py` | Skript zum Konvertieren neuer Audiodateien (mp3/wav/…) nach Opus/OGG vor dem Commit |
| `grimsgate_admin.html` · `korsaren_szenen.html` · `crew_manifest.html` | Nur noch Weiterleitungs-Stubs auf die neuen Seitennamen |

**[OFFEN]** `korsaren.html` (Charakterbogen / Charaktererstellung, localStorage-Persistenz)
ist weiterhin nur geplant, aber noch nicht angelegt — bisher in keinem Stand des Repos
vorhanden. Frühere Fassungen dieser Tabelle führten die Datei bereits, obwohl sie nie
existierte; das bleibt hier als offener Punkt vermerkt statt stillschweigend entfernt.

Zwei aufgeräumte Karteileichen wurden im Zuge der Restrukturierung entfernt (Git-Historie
bleibt erhalten, falls doch nochmal gebraucht):
- `grimsgate_karte.html` + `grimsgate_karte.png` — die ältere Grimsgate-Seite war laut dieser
  Tabelle bereits durch `korsaren_szenen.html`/`karte.html` abgelöst und wurde von keiner
  anderen Datei mehr referenziert.
- `interior_offiziersquartie.png` — verwaister Tippfehler-Duplikat von
  `interior_offiziersquartier.png` (fehlendes „r"), nirgends referenziert.

### 13.1a Bildoptimierung (Juli 2026)

**Auslöser:** Spürbare Lags/Ladezeiten auf der Karte. Ursache: `images/` lag bei
**132 MB** — einzelne PNGs (v. a. `interior_batteriedeck*`, `interior_frachtraum*`,
`interior_werkstatt`, `interior_oberdeck_sturm`, `interior_kapitaenskajuete_sturm`,
`interior_unterdeck`, `interior_offiziersquartier`, `Josiah_Pryce`) lagen bei 7-9 MB,
teils mit doppelt so hoher Auflösung wie vergleichbare Bilder (2816×1536 statt 1408×768) —
vermutlich ein Gemini-Generierungsartefakt, keine bewusste Entscheidung. Zusätzlich trugen
alle Bilder einen vollständig deckenden (also nutzlosen) Alpha-Kanal, was verlustfreie
PNG-Kompression zusätzlich erschwert.

**Maßnahme:** Alle Bilder zu **WebP** konvertiert (Qualität 82, `method=6`), Alpha-Kanal
entfernt (war überall zu 100 % deckend) und auf sinnvolle Kantenlänge gedeckelt, orientiert
an der tatsächlichen Darstellungsgröße:
- Portraits (Charakterleiste, max. ~220 CSS-px breit): Kappung 900px
- Innenraum-/Ortsbilder (Overlay-Karte, max. 720px breit): Kappung 1600px
- Kartenbilder Stadt/Schiff (ggf. bildschirmfüllend): Kappung 1920px

**Ergebnis:** 132 MB → 4,5 MB (**-96,6 %**), keine sichtbaren Kompressionsartefakte
(stichprobenartig geprüft, u. a. `Josiah_Pryce` und `interior_unterdeck`, die stärksten
Reduktionen mit -99 %).

**Für neue Bilder (wichtig, sonst wächst images/ wieder zu):** Jedes neu von Gemini
generierte Bild vor dem Commit durch `python3 tools/optimize_images.py` schicken (verkleinert
+ konvertiert alle PNGs in `images/` zu WebP), das Ergebnis sichten, dann PNG löschen und den
neuen `.webp`-Dateinamen in `js/scenes.js`/`js/golden_lion_scenes.js`/`js/characters.js`
eintragen. Das Skript löscht die PNGs bewusst nicht automatisch, damit vor dem Löschen visuell
geprüft werden kann.

### 13.1b Audiooptimierung (Juli 2026)

**Auslöser:** Dieselben Lags wie 13.1a. `Grimgate1.mp3`, `ship1.mp3` und `storm1.mp3` lagen
zusammen bei **242 MB** (67–91 MB pro Datei, 149–192 kbps MP3, 60–83 Minuten lange
Atmo-Loops) — für reine Hintergrundtöne unnötig hoch aufgelöst.

**Maßnahme:** Alle drei nach **Opus** (in einer `.ogg`-Datei, 64 kbps, VBR) konvertiert,
Metadaten/eingebettetes Cover-Art entfernt. Länge bewusst **nicht** gekürzt (`ffprobe`-Dauer
vor/nach verglichen, exakt gleich).

**Ergebnis:** 242 MB → 93 MB (**-61 %**) — geringer als bei den Bildern (-96,6 %), weil MP3 für
Audio schon deutlich effizienter komprimiert als PNG für Bilder. Vor dem Einbau per
Hörprobe geprüft (volle Länge an Hendrik geschickt, freigegeben).

**Wichtige Nebenkorrektur:** `golden_lion_scenes.js` (Szene `"3.1"`) hatte als statisches
`soundFile`-Fallback `"sturm.mp3"` eingetragen — das passte noch nie zur tatsächlich
abgelegten Datei (`storm1.mp3`, jetzt `storm1.ogg`). Auf den korrekten Dateinamen korrigiert.

> **[WICHTIG] Manueller Schritt nach diesem Umbau:** Ist für eine Szene bereits ein
> Ton-Dateiname live im Admin-Panel (Sound-Leiste) in Firebase hinterlegt
> (`sceneAudioFile/{sceneId}`), zeigt der noch auf den alten `.mp3`-Namen — Firebase weiß
> nichts von der Umbenennung. Nach dem Deploy einmal jede Szene mit gesetztem Ton im
> Admin-Panel öffnen und den Dateinamen auf die neue `.ogg`-Datei aktualisieren.

**Für neue Audiodateien:** Vor dem Commit durch `python3 tools/optimize_audio.py <datei>`
schicken (Details und die Firebase-Falle siehe Docstring im Skript).

### 13.2 Architektur-Entscheidungen

- **Firebase Realtime Database** für Live-Synchronisation zwischen Spielleiter- und
  Spieleransicht
- **`fbKey()`-Sanitisierung ist Pflicht.** Punkte und andere illegale Zeichen in IDs
  (z. B. Szene „1.1") müssen vor dem Schreiben ersetzt werden — sonst schlägt das Speichern
  **stillschweigend** fehl
- **MAP_REGISTRY-Muster** statt `window[]`-Lookups (wegen `const`/`let`-Scoping)
- **Basis/Override** in `golden_lion_scenes.js`: Marker-Positionen existieren nur an *einer*
  Stelle; neue Szenen überschreiben per `imgOverrides`/`descOverrides` nur das, was sich
  ändert
- **`hiddenMarkers`** (neu, Juli 2026): optionales Szenen-Feld, Liste von Marker-IDs, die in
  dieser einen Szene nicht auftauchen sollen (z. B. Kombüse/Werkstatt/Unterdeck/
  Offiziersquartier/Bug in der Sturm-Szene 3.1, siehe 10.11). Bleibt konsistent mit dem
  Basis/Override-Prinzip — keine Wiederholung der übrigen Marker-Daten nötig
- **`szenenUeberschreibungen`** (neu, Juli 2026, in `regie.js`): dasselbe Override-Prinzip wie
  `descOverrides`, aber für die admin-seitigen `personen`/`kurz`/`ortHinweis`-Felder eines
  Ortes. Ohne dieses Feld zeigte das Admin-Panel für 3.1 weiterhin die 2.1-Zusammenfassung an
  (siehe Korrektur in 10.11) — jetzt pro Ort optional `szenenUeberschreibungen: { "3.1": {...} }`,
  aufgelöst über `resolveOrtForScene()` in `regie.html`. `interaktionen` bleibt davon unberührt
  und weiterhin über `nurSzenen`/`nichtInSzenen` gesteuert
- **Dritte Kartenquelle (neu, Juli 2026):** `js/schatzinsel_scenes.js` (`SCHATZINSEL_SCENES`,
  Szene `4.1` — neue führende Ziffer, da `3.x` schiffsintern für Golden-Lion-Zustände reserviert
  ist (2.1 Basis, 3.1 Sturm) und die Schatzinsel eine eigenständige neue Örtlichkeit ist) folgt
  dem flachen `scenes.js`-Muster (nicht Basis/Override wie Golden Lion), da bisher nur ein
  einziger Szenen-Zustand existiert. Über `MAP_REGISTRY` (`karte.html`) bzw.
  `getAllSceneEntries()`/`getSceneLabel()`/`getMarkersForScene()` (`regie.html`) als dritte
  Quelle angehängt — genau wie in den bestehenden Code-Kommentaren als Beispiel vorgesehen.
  Bisher nur ein Marker (`schiffswrack`, die gestrandete Golden Lion) — weitere Orte der Insel
  (Höhle, knorriger Baum, Felsformationen) folgen erst in einem späteren Schritt. Der Marker
  hat inzwischen ein eigenes Nahaufnahme-Bild (`interior_schiffswrack.webp` — Crew bei
  Reparaturarbeiten am gestrandeten Schiff), anfangs zeigte er noch behelfsmäßig dasselbe
  Bild wie der Kartenhintergrund
- **Varianten + imgOverride zusammen:** Überschreibt eine Szene das Bild eines Markers, der in
  BASE ein `variants`-Feld hat (z. B. Frachtraum), werden die Varianten für diese Szene
  automatisch deaktiviert (`variants: null`). Sonst könnte eine in einer ANDEREN Szene aktiv
  geschaltete Variante (z. B. „Leer" aus der Basis-Szene) das Szenen-Override überschreiben —
  ein Bug, der beim Bauen der Sturm-Szene auffiel, bevor er in Erscheinung getreten wäre
- **Audio** über HTML5-`<audio>`-Elemente, nicht YouTube (Werbung, Adblocker-Probleme).
  Dateinamen in Firebase unter `sceneAudioFile/{sceneId}`
- **Portraitleiste** nutzt `db.ref().on('value')` (nicht `.once()`), damit Änderungen ohne
  Reload erscheinen. `z-index: 150`, damit sie über Ortsoverlays sichtbar bleibt.
  `object-position: top`, damit bei knappem Platz nur unten beschnitten wird und Gesichter
  vollständig bleiben
- **`uebergeordnetesZiel`/`grantsQuest`** (neu, August 2026, siehe 2.9): `uebergeordnetesZiel`
  (Freitext) auf `SZENEN_REGIE[sceneId]`, `grantsQuest: {warum, was}` optional auf einzelnen
  Trigger-Objekten in `regie.js`. Beides rein statisch (keine Spielerdaten), zusammen mit dem
  Live-Zustand (ausgelöst? erledigt?) in der neuen „Szenen-Kopf"-Leiste im Admin-Panel
  angezeigt. Abschluss eines Auftrags ist bewusst SL-Handarbeit (`questDone`, siehe 13.3), nicht
  automatisch aus Spielverhalten abgeleitet
- **Sub-Orte innerhalb eines Ortes** (neu, August 2026, `karte.html`): ein Marker kann ein
  optionales `parentId`-Feld bekommen. Marker mit `parentId` erscheinen nicht auf der
  Hauptkarte, sondern als kleine Pins im Overlay ihres Eltern-Markers (z. B. mehrere anklickbare
  Stellen innerhalb eines Dorfbildes), inklusive „← Zurück"-Navigation. Bleiben im selben
  flachen `markers[]`-Array wie bisher — kein neues Nest-Konzept, dadurch funktionieren
  `ORTE`/Vault-Baum/Export/`hiddenMarkersLive`/`openMarkers` automatisch mit, da sie ohnehin
  flach über Marker-IDs iterieren. Erstes Beispiel: die vier Dorf-Sub-Orte auf der Schatzinsel
  (`dorf_platz`/`dorf_markt`/`dorf_heilerin`/`dorf_tempel`, `parentId: "stammesdorf"`)

### 13.3 Firebase-Pfade

| Pfad | Inhalt |
|---|---|
| `currentScene` | Aktuell live geschaltete Szene |
| `regie/…` | Spielleiter-Notizen und Trigger-Status (**nur Admin**, Spieler sehen das nie) |
| `sceneAudioFile/{sceneId}` | Hintergrundton pro Szene |
| `sceneCharacters/{sceneId}/{charId}` | Sichtbare Portraits in der Seitenleiste |
| `markerVariant/{markerId}` | **Aktive Bildvariante eines Ortes** — wirkt direkt auf die Spieleransicht |
| `gmTimer/…` | Stoppuhr: `running`, `startedAt`, `elapsedBeforeStart`, `marks` |
| `diceRolls/{pushId}` | Live-Würfel-Feed, selbst-verfallend nach ~90s (siehe 13.6) |
| `openMarkers/{sceneId}/{markerId}/{sessionId}` | Live-Präsenz: wer hat welchen Ort gerade offen (siehe 13.9) |
| `hiddenMarkersLive/{sceneId}/{markerId}` | Vom SL live ausgeblendete Marker (siehe 13.10) |
| `questDone/{sceneId}/{triggerId}` | Vom SL manuell als erledigt markierte Aufträge (siehe 2.9) |

### 13.4 Bildvarianten-System

Ein Marker kann optional ein Feld `variants` definieren (z. B. Frachtraum: `standard` mit
sichtbaren Händen, `leer` ohne). Der Spielleiter schaltet manuell im Admin-Panel um, die
Spieleransicht folgt sofort.

**Bewusst getrennt vom Trigger-System:** Trigger sind reine Admin-Dokumentation und beeinflussen
die Spieleransicht nicht. Bildvarianten tun genau das. Marker ohne `variants` verhalten sich
unverändert.

**Erweiterung (Juli 2026):** Varianten können zusätzlich zu `img` ein eigenes `desc` tragen.
Fehlt `desc` bei der aktiven Variante, greift der Basistext des Markers unverändert — so
zeigt z. B. beim Frachtraum nur die Variante „Standard" den Zusatzsatz „Habe ich da gerade
etwas gehört? Bestimmt nur das Schiff.", während „Leer" beim reinen Basistext bleibt. Umgesetzt
in `karte.html` (vor der Umbenennung im Zuge der Projekt-Reorg: `korsaren_szenen.html`) über
`resolveActiveVariant()` (ersetzt die frühere `resolveMarkerImage()`, die nur Bilder auflöste).

### 13.5 Spielleiter-Stoppuhr

Rein admin-seitig. Start/Pause/Reset, Zustand in Firebase (überlebt Seitenneuladen).

**Bewusste Entscheidung gegen fest programmierte Zeitpunkte:** Der Spielleiter legt **frei
benannte Merker** (Label + Minute) live in der Session an. Sobald die Uhr die Zielminute
erreicht, pulsiert der Merker rot. Begründung: Sobald sich die Handlung nach der Insel in drei
Wege verzweigt, würden im Code hinterlegte Zeitpunkte Fehler produzieren.

### 13.6 Würfel-Feed (Juli 2026)

Szenenübergreifendes Feature auf **beiden** Seiten (`karte.html` UND `regie.html`, identisch),
umgesetzt in `js/dice.js` (`initDiceRoller(db)`), einem neuen gemeinsamen Verhaltens-Modul —
bisher waren geteilte `.js`-Dateien in diesem Projekt reine Datendateien (`scenes.js`,
`characters.js` etc.), keine Logik. Lohnt sich hier, weil das Feature auf beiden Seiten absolut
identisch laufen soll und zwei separate Kopien sonst hätten auseinanderdriften können.

**Spielername:** Jeder Besucher vergibt sich selbst einen Namen, gespeichert unter
`localStorage`-Key `korsaren_playername` (gleiches Muster wie `korsaren_volume`/
`korsaren_muted`). Namenspflicht: Der erste Würfel-Versuch ohne gesetzten Namen öffnet einen
blockierenden `prompt()` — ohne Eingabe wird nicht gewürfelt. Ein klickbares Namens-Label
erlaubt jederzeit eine Korrektur.

**Würfeln:** Ein Schnellknopf für „1×100" sowie ein Formular für frei wählbare Anzahl Würfel
(1–20) × Augenzahl (2–1000). Zeigt bewusst **nur die rohe Zahl** — keine automatische
Erfolgsgrad-Berechnung nach dem d100-Probensystem (4.1). Die Einordnung (Gut/Normal/Schlecht/
Miss) bleibt Sache von Spieler und Spielleiter.

**Firebase-Datenmodell** (`diceRolls/{pushId}`):
```
{ name, count, sides, results: [...], total, ts: ServerValue.TIMESTAMP }
```
`ts` wird bewusst über `ServerValue.TIMESTAMP` gesetzt statt `Date.now()` — anders als bei
`gmTimer` (das nur die eine GM-Session schreibt) schreiben hier potenziell viele
Spieler-Geräte mit abweichenden Client-Uhren.

**„Prune on read" statt Server-Job:** Jeder Client mit offenem Feed räumt bei jedem
`on('value', …)`-Snapshot Einträge auf, die älter als 90 Sekunden sind, per `.remove()`. Ein
`.remove()` auf einen bereits entfernten Eintrag ist ein No-Op — mehrere Clients können also
gleichzeitig aufräumen, ohne dass sich das ins Gehege kommt. Kein Cron/Cloud-Function nötig,
passt zum „kein Build-Schritt"-Prinzip des Projekts.

**Anzeige:** Jeder Wurf erscheint als eigene Karte in einem Feed (oben links), bleibt 60
Sekunden sichtbar und blendet dann aus (gleiches `opacity`-Übergangsprinzip wie der
Verbindungs-Toast `#status`, aber als stapelbare Liste statt Einzelelement — jeder Toast
braucht einen eigenen Fade-Timer). Die Würfel-Steuerung selbst sitzt unten links (bisher freie
Ecke auf `karte.html`; `#audioControl` unten rechts, `#charRail` rechter Rand, `#status` oben
mittig).

**Private Würfe (nur Admin, Juli 2026):** `regie.html` ruft `initDiceRoller(db, { allowPrivate:
true })` auf (`karte.html` weiterhin ohne dieses Flag) — nur dadurch erscheint dort zusätzlich
eine Checkbox „Privat". Ist sie beim Würfeln aktiv, wird **überhaupt nicht** nach
`diceRolls/` geschrieben — der Wurf wird nur lokal im eigenen Feed angezeigt (🔒-Präfix,
gestrichelter Rahmen). Damit sehen Spieler auf `karte.html` einen privaten Wurf grundsätzlich
nie, ganz ohne Firebase-Regeln/Auth: Sie lesen nur `diceRolls/`, und dort landet ein privater
Wurf schlicht nicht.

### 13.7 Charakterbogen-Drawer (Juli 2026)

`charakterbogen.html` (neue, eigenständige Seite) ist ein von Hendrik gebauter
Charakter-Creator + Charakterbogen + Kurzregelwerk, komplett unabhängig vom Rest des Projekts:
eigenes Design (eigene `:root`-Variablen, teils gleiche Namen wie `karte.html`/`regie.html`
z. B. `--gold`/`--line`, aber andere Werte), eigene Google-Fonts, keine Firebase-Anbindung.

**Datenhaltung: bewusst nur `localStorage`, kein Firebase.** Zwei Schlüssel — `kors_s` (Werte-
Aufbau: Archetyp, Fertigkeiten/Wissen samt Mastery) und `kors_sh` (Bogen: Name, Spieler,
Notizen, Ruf, Ausrüstung, Crew-Ansehen, Körperpunkte, Portraitbild als Base64). Jeder Spieler
hat also seinen eigenen, rein lokalen Bogen auf seinem eigenen Gerät — analog zum
Spielernamen des Würfel-Feeds (13.6), nur mit sehr viel mehr Daten. Eine Migration auf
Firebase (damit z. B. der Spielleiter oder andere Spieler mitlesen könnten) wäre ein großer,
eigenständiger Umbau (jedes Feld müsste synchronisiert werden, plus Sichtbarkeits-
Entscheidungen) und war nicht der eigentliche Wunsch — der eigentliche Wunsch war schneller
Zugriff UND Bearbeitung direkt von der Karte aus, beides löst der Drawer unten ohne
Architektur-Änderung am Bogen selbst.

**Einbindung in `karte.html` — Slide-in-Drawer per iframe, kein Inline-Einbau:** Ein schmaler
Griff am linken Bildschirmrand (`#charSheetHandle`, vertikal zentriert, `z-index: 300`) öffnet
ein von links hereinfahrendes Panel (`#charSheetDrawer`, `transform: translateX(-100%)` →
`translateX(0)`), das `charakterbogen.html` per `<iframe>` lädt. Ein eigenes Dokument im
iframe statt direktem HTML-Einbau vermeidet die CSS-Variablen-Kollision (s. o.) komplett —
kein Sonderfall im Bogen-Code nötig. Das iframe bekommt seine `src` erst beim ersten Öffnen
(Lazy-Load), damit die Seite (samt Google-Fonts-Ladeversuch) nicht bei jedem Kartenaufruf
mitgeladen wird, wenn niemand den Bogen öffnet. Da `karte.html` und `charakterbogen.html`
auf demselben Origin liegen (dieselbe GitHub-Pages-Domain), teilen sie sich denselben
`localStorage` — eine Änderung im iframe (z. B. Körperpunkte anpassen) landet direkt und
zuverlässig im selben Speicher, den `charakterbogen.html` auch bei direktem Aufruf nutzt.
**Nur auf `karte.html`**, nicht auf `regie.html` (reine Spieler-Funktion).

**Layout-Zwang:** Der Bogen hat keine Responsive-Breakpoints außer `@media print` — mehrere
Grids brauchen realistisch mindestens ~500–600px Breite. Der Drawer ist deshalb deutlich
breiter als schmale Elemente wie `#charRail` (70vw, gedeckelt bei 900px auf Desktop; volle
Bildschirmbreite unter 700px Viewport-Breite), kein schmaler Seitenstreifen.

**Datenumzug (Export/Import):** Da jeder Spieler schon eine lokal ausgefüllte Version dieser
Datei nutzt (anderer Origin als die jetzt gehostete Version), wandern bestehende Daten nicht
automatisch mit — Browser trennen `localStorage` strikt pro Origin. Neuer Knopf
„⇄ Export/Import" im Bogen selbst: Export lädt eine kleine `.json`-Datei herunter
(`JSON.stringify({s: S, sh: SHEET})` als Blob), Import öffnet einen Datei-Dialog für genau
diese Datei und schreibt sie zurück in `localStorage`. Jeder Spieler muss diesen Umzug
einmalig selbst durchführen (alte Datei öffnen → exportieren → gehostete Version öffnen →
importieren).

> **Verworfen:** PDF-Export lesbar machen (Hendrik schlug vor, dass Spieler stattdessen den
> bereits vorhandenen Druck-Knopf nutzen und die PDF-Datei importiert wird). Geprüft an einem
> echten Beispiel (`pdftotext`/`pdfimages`) — die PDF enthält **keinen echten Text**, Windows’
> „Drucken als PDF" rastert die ganze Seite zu JPEG-Streifen. Rückgewinnung der Werte würde
> OCR brauchen, was bei exakten Zahlen/Mastery-Badges/Kästchen ein echtes Korruptionsrisiko für
> Charakterdaten ist (eine falsch erkannte Ziffer fällt nicht auf). Deshalb bei der
> Datei-Export/Import-Lösung oben geblieben statt PDF-Text-Extraktion.

**Würfeln bei geöffnetem Bogen:** `#diceControls`/`#diceFeed` liegen bewusst auf `z-index: 350`
— höher als Drawer (300) und dessen Backdrop (290). Ohne das würde der vollflächige,
transparente Backdrop (fängt Klicks zum Schließen des Drawers ab) auch Klicks auf die
Würfel-Steuerung abfangen, sobald der Bogen offen ist.

### 13.8 Live-Vorschau im Admin-Panel (Juli 2026)

`regie.html` bekommt ein schwebendes, ein-/ausklappbares Widget unten rechts (`#previewWidget`,
freie Ecke — `#diceControls` unten links, `#diceFeed` oben links). Ausgeklappt zeigt ein
kompaktes Panel (380×300px) `karte.html` per `<iframe>` — bewusst keine eigene Render-Logik,
da so exakt das zu sehen ist, was Spieler gerade wirklich sehen (bleibt über dieselbe
Firebase-`currentScene`-Anbindung automatisch synchron). Bewusst klein und in der Ecke statt
volle Breite, damit die Szenen-Spalten (Orte/Details) gleichzeitig lesbar bleiben. iframe-`src`
wird erst beim ersten Ausklappen gesetzt (Lazy-Load). Zustand (auf/zu) wird in `localStorage`
gemerkt (`korsaren_regie_preview_open`) — rein UI-Komfort für diesen einen Admin-Browser, kein
Firebase-Pfad nötig.

**Vorschau-Modus (`?preview=1`):** In dem kleinen 380×300px-Panel wirkten Audio-Regler,
Würfel-Steuerung und der Charakterbogen-Griff überdimensioniert und lenken vom eigentlichen
Kartenbild ab. Das Live-Vorschau-Widget lädt deshalb `karte.html?preview=1` statt
`karte.html` — `karte.html` prüft diesen Query-Parameter beim Laden und setzt die Klasse
`preview-mode` auf `<html>`, die per CSS `#status`, `#audioControl`, `#diceControls`,
`#diceFeed`, `#charSheetHandle`, `#charSheetDrawer` und `#charSheetBackdrop` ausblendet.
Betrifft nur diesen einen Aufruf mit Query-Parameter — die normale Spieleransicht (ohne
`?preview=1`) bleibt unverändert vollständig interaktiv.

### 13.9 Live-Anzeige: wer hat welchen Ort offen (Juli 2026)

Jeder Marker-Overlay-Klick auf `karte.html` schreibt eine Präsenz nach
`openMarkers/{fbKey(sceneId)}/{markerId}/{sessionId} = true`. Die `sessionId` wird pro **Tab**
erzeugt (`sessionStorage`, nicht `localStorage`) — bewusst, damit zwei offene Tabs auch als
zwei Betrachter zählen, nicht als einer. `regie.html` zählt die Kinder pro Marker und zeigt
sie als kleines Badge neben dem Ort-Titel in der Orte-Spalte (`.ort-open-count`, nur sichtbar
wenn > 0).

**Aufräumen über zwei Wege:** Aktives Schließen des Overlays entfernt den Eintrag sofort
(`clearOpenMarker()`). Zusätzlich registriert jeder Eintrag `.onDisconnect().remove()` —
Firebase' Standard-Präsenzmuster, das den Eintrag automatisch entfernt, wenn der Tab
geschlossen wird oder die Verbindung abbricht, ohne dass der Client sich aktiv abmelden muss.
Ein Szenenwechsel räumt ebenfalls sofort auf (`renderScene()` ruft `clearOpenMarker()`), damit
kein Eintrag unter der alten Szene hängen bleibt, falls jemand beim Wechsel gerade ein Overlay
offen hatte.

**Admin-eigene Live-Vorschau zählt bewusst nicht mit:** Der `?preview=1`-Modus (13.8) lädt
`karte.html` ebenfalls per iframe, und Marker-Klicks funktionieren dort weiterhin (nur die
UI-Chrome ist ausgeblendet, das Overlay selbst nicht). `setOpenMarker()` prüft deshalb zuerst
`document.documentElement.classList.contains('preview-mode')` und schreibt in diesem Fall gar
nicht erst — sonst würde ein Marker-Klick des Spielleiters in seiner eigenen Vorschau die
Zählung für echte Spieler verfälschen.

**Listener-Muster in `regie.html`:** `attachOpenMarkersListener(sceneId)` folgt demselben
An-/Abhäng-Prinzip wie `renderCharacterRail()` in `karte.html` (`ref.off()` vor jedem
Neu-Verbinden), mit einem zusätzlichen Guard (`if (sceneId === openMarkersScene) return;`) —
nötig, weil `renderOrte()` (und damit dieser Aufruf) über `renderAll()` sehr häufig läuft, im
Unterschied zu `karte.html`, wo der Aufruf schon durch den `currentScene`-Listener selbst
gedrosselt ist.

### 13.10 Live-Sichtbarkeit: Marker schrittweise aufdecken (Juli 2026)

Standardmäßig sind alle Marker einer Szene sichtbar. Der SL kann in `regie.html` in der
Orte-Spalte pro Ort auf den Schalter "sichtbar"/"ausgeblendet" klicken
(`toggleMarkerVisibility()`) — das schreibt `hiddenMarkersLive/{fbKey(sceneId)}/{markerId} =
true` (bzw. entfernt den Eintrag wieder). `karte.html` hört live auf diesen Pfad
(`attachHiddenMarkersListener()`, gleiches An-/Abhäng-Muster wie `renderCharacterRail()`) und
blendet den entsprechenden Marker sofort bei allen Spielern aus bzw. wieder ein — ohne
Szenenwechsel und ohne Codedeploy.

**Zweck:** Neue Orte innerhalb einer bestehenden Szene lassen sich so schrittweise freigeben
(z.B. Schatzinsel 4.1: Stammesdorf und Höhle existieren bereits als Marker, bleiben aber bis
zum passenden Moment in der Sitzung ausgeblendet, statt für jede Freigabe eine neue Szene
oder einen neuen Deploy zu brauchen). Diese Live-Ebene ist unabhängig vom statischen
`hiddenMarkers`-Feld einzelner Szenen-Definitionen (13.2, genutzt z.B. beim Sturm) — jenes
blendet Marker fest pro Szene aus, dies hier blendet sie live und pro Session um.

Im Admin-Panel selbst bleibt ein ausgeblendeter Ort weiterhin sichtbar (nur abgedunkelt,
`.ort-card.ausgeblendet`) — der SL soll ihn jederzeit vorbereiten und anklicken können, auch
bevor er live geht.

---

## 14. Visueller Stil & Bild-Pipeline

**Stil:** Niederländische Barockmalerei (Dutch Golden Age), Öl auf Leinwand, rissiger Firnis,
warme gealterte Töne. Durchgängig für **alle** Innenraum- und Portraitbilder.

**Werkzeug:** Gemini. Claude schreibt die Prompts, Hendrik generiert und lädt zurück, dann
gemeinsame Bewertung und iterative Korrektur. **Danach zwingend durch
`tools/optimize_images.py` schicken** (WebP-Konvertierung + Größenkappung, siehe 13.1a),
bevor das Bild committet wird — Gemini liefert unnötig große PNGs.

### 14.1 Standardbausteine für Innenraum-Prompts

- Cutaway-Bild (`images/golden_lion_cutaway.webp`) als Stil- und Konstruktionsreferenz mitgeben
- Kadrierung: enge Innenansicht, ca. 85–90 % der Leinwand füllend, wenig Leerraum
- „no modern elements, no text or labels anywhere in the image"
- Ausschließlich Schiffsholz; **Ziegel nur** an der Kombüsen-Feuerstelle
- Seegangssicherung explizit fordern
- Lichtquelle bewusst wählen (Herdfeuer, Laterne, gedämpftes Lukenlicht)

### 14.2 Portraits

Dateinamenkonvention: voller Name mit Unterstrichen, z. B. `Walter_Wat_Crozier.webp`,
`Cormac_Daly.webp`, `Josiah_Pryce.webp` (ursprünglich von Gemini als PNG geliefert, vor dem
Commit per `tools/optimize_images.py` nach WebP konvertiert, siehe 13.1a).

### 14.3 Bekannte Artefakte

Gemini setzt gelegentlich eine **gemalte Fantasie-Signatur** unten rechts sowie ein kleines
funkelndes Wasserzeichen. Beides wurde als unproblematisch akzeptiert.

---

## 15. Zeitplanung & Prioritäten

**Ziel:** Die ersten beiden Akte sollen zeitnah fertig sein.

**Begründung für die Detailtiefe beim Schiff:** Das Schiff ist kein einmaliger Schauplatz wie
die Inselstationen, sondern der **durchgehende Handlungsraum**. Über die Flaute und andere
Anlässe kehrt die Handlung immer wieder dorthin zurück. Jede Tür, die jetzt geschlossen ist,
und jedes Bild, das sich im Sturm ändert, ist eine Investition, die sich mehrfach auszahlt.
Die Inselstationen kommen dagegen mit je drei Stationen aus.

Die erste freie Stunde an Bord ist bewusst überfüllt: Die Spieler haben alle Freiheiten,
kennen sich auf einem Schiff aber nicht aus. Die Fülle an Möglichkeiten ist die Voraussetzung
dafür, dass die **künstliche Verknappung** (30 Minuten bis Wat, 60 Minuten bis zum Sturm)
überhaupt greift.

---

## 16. Offene Punkte — Sammelübersicht

### Regeln & Mechanik
- Konsolidiertes Tracking der parallelen Ruf-Werte (aktuell verteilt)
- Erkennungs-Mechanik Hafenmeisterei (Probe oder automatisch?)
- Konsequenz bei Nicht-Eingreifen in der Bordell-Raubein-Szene
- Ob die Spieler das Zeit-Trigger-Muster später **aktiv nutzen** können
- Konsequenz bei Misserfolg beim Segel-Einschnüren (Oberdeck, Sturm-Szene)
- Welche Probe (Körper/Geschick/wahlweise) zum Auffangen von Ned zählt, und Konsequenz bei
  Nicht-Auffangen (Oberdeck, Sturm-Szene)

### Struktur
> **Erledigt (August 2026):** Koexistenz von freier Wahl und Zwangsstopp (spanischer Hafen bei
> schlechtem Ruf) — siehe 7.2, umgesetzt über die Übergangsszene `5.1`.
- Ruf-Preis für einen Schatten-Meuchelmord beim Artefakthandel
- Schicksal des niedergemetzelten Schmugglerschiffs: versenkt oder als treibendes Totenschiff
  wiederkehrend?
- Ob die Tochter tatsächlich wiederbelebt wird
- Reveal, dass die vermeintlich zufällige Strandungs-Insel nach dem Sturm in Wahrheit
  Harwicks über Tom angesteuertes Ziel war (siehe 10.11, Oberdeck-Höhepunkt) — hat jetzt einen
  ersten GM-Hinweis in der Landungs-Interaktion (`ORTE.schiffswrack`, Tom/Harwick-Blickkontakt
  beim Auflaufen), bleibt für die Spieler aber weiterhin unausgesprochen. Ob/wie es je
  explizit aufgelöst wird, ist offen.

### Inhalte
- Ausformulierung der Hafenmeisterei-Szene (blockiert nichts mehr, Schiffskarte ist fertig)
- Der unqualifizierte Schiffs-„Medicus" als NPC
- Schatzinsel-Ausarbeitung: 4 von 5 Stationen haben jetzt GM-Inhalt in `regie.js`
  (Schiffswrack, Dschungelpfad, Dorf, Nachtlager) — nur die Wasserhöhle (`hoehle`) hat noch
  keinen GM-Inhalt (Referenzbild existiert bereits). Artefaktbucht und Grabesinsel bleiben
  vollständig offen.
- Konkrete Mechanik der drei Siegel-Routen (Diebstahl/Aufhetzen/Gewalt) — bisher nur benannt,
  nicht ausgestaltet. Diebstahl/Aufhetzen laufen über den Thahal-Helfer (der junge Mann aus
  der Dorf-Ankunfts-Szene, ruft dort „Vanthei!" und wird zurückgehalten) — er soll die Gruppe
  nachts im Nachtlager heimlich kontaktieren, diese Kontakt-Szene selbst ist aber noch nicht
  geschrieben.
- Wildschwein-Angriff auf dem Rückweg über den Dschungelpfad (wer verletzt wird, ist offen) —
  hat jetzt eine Vorausdeutung beim Hinweg (Cormacs „die sind keine Gefahr"), die eigentliche
  Angriffsszene fehlt aber noch.
- Schaden aus der Kanonen-Szene (Sturm) muss auf der Schatzinsel noch konkret ausgestaltet
  werden (kann gefährlich werden oder von der Schatzsuche ausschließen — Details offen)
- Spanischer Hafen (`7.1`, `js/spanischer_hafen_scenes.js`) und Schmugglernest (`8.1`,
  `js/schmugglernest_scenes.js`) sind seit August 2026 als eigene Karten registriert (Marker,
  Platzhalterbild), aber inhaltlich noch komplett offen — kein Referenzbild, keine NPCs, keine
  Interaktionen. Die Übergangsszene davor (`5.1`) und die Flaute (`6.1`) sind dagegen fertig
  ausgearbeitet.

> **Erledigt (Juli 2026):** Alle Ortsinhalte der Golden Lion sind jetzt ausgearbeitet —
> Achterdeck, Oberdeck, Bug, Batteriedeck, Werkstatt, Unterdeck, Kombüse, Frachtraum,
> Offiziersquartier, Kapitänskajüte (siehe Abschnitt 10). Kombüse und Frachtraum sind in
> `regie.js` nachgetragen. Die Frage, an wen Spieler den blinden Passagier bringen dürfen, ist
> beantwortet (11.1: Josiah, Francesco, Cormac oder Tom, gleichwertig). Der Marker-Text
> Offiziersquartier passt jetzt zum Bild. Die Sturm-Szene (3.1) ist inhaltlich fertig (siehe
> 10.11) — fünf Orte mit eigenen Sturm-Bildern/-Texten, Kanonen- und Wassereinbruch-Mechanik.
> Dirks Payoff wurde von „in der Sturm-Szene" auf „nach der Sturm-Szene" korrigiert.
>
> **Erledigt (29.07.2026):** Admin-Panel-Duplikat zwischen Sturm-Szene (3.1) und Basis-Szene
> (2.1) behoben (`szenenUeberschreibungen`, siehe 10.11-Korrektur/13.2). Projekt-Reorg
> abgeschlossen: Ordnerstruktur, einheitliche Dateinamen, Redirect-Stubs auf alte URLs,
> Admin-Panel gegen versehentlichen Spieler-Zugriff über die Root-URL abgesichert. Performance-
> Problem (Lags/Ladezeiten) behoben: alle Bilder PNG→WebP (132 MB → 4,5 MB), alle Audiodateien
> MP3→Opus/OGG (242 MB → 93 MB, volle Länge erhalten) über die wiederverwendbaren Skripte
> `tools/optimize_images.py`/`tools/optimize_audio.py`. Sturm-Szene inhaltlich erweitert:
> Oberdeck (Cormac & Segel, Ned stürzt, Sturm-Höhepunkt mit Mastbruch/Ruderklemme/Toms
> Anker-Highlight/Harwicks vielsagenden Blicken), Achterdeck (Toms loses Mundwerk) — siehe
> 10.11. Redundantes „(nur Sturm-Szene 3.1)" aus Interaktions-Titeln entfernt. Schatzinsel-
> Referenzbild und `island1.ogg` eingebaut; neue Szene `4.1` mit erstem Ort (Schiffswrack)
> angelegt (siehe 13.2) — zunächst versehentlich als `3.2` (Kollision mit der
> Schiffs-Nummerierung), korrigiert auf `4.1`.

> **Erledigt (01.08.2026):** Golden-Lion-Ankunft ausformuliert (Ashworth/Harwick/Cormac-
> Szene am Anleger, `ORTE.golden_lion`), Golden Lion (2.1) bekam Stimmung + 5 Ghosts für die
> ~120-Mann-Besatzung. Dirks Sturm-Payoff eingelöst (siehe 10.4) — nicht mehr offen. Der
> Schatzinsel-Szenen-Durchgang ist deutlich vorangekommen: Landung am Schiffswrack (inkl.
> Tom/Harwick-Reveal-Andeutung), Zurückgebliebenen-Szene (loser Balken mit
> Ausweichen-vs-Eingreifen-Wahl + Erste-Hilfe, Wat-/Josiah-Rollenspielmomente),
> Dschungelpfad (Metallschmuck-Verbot als gezielte Gegenmaßnahme gegen den Fluch-Verdacht,
> Ezra Coombes Ehering, Cormacs Beinahe-Verrat über Harwicks toten Tochter,
> Wildschwein-Vorausdeutung), Dorf-Ankunft (Häuptling Ta'ahal — Titel, kein Eigenname —
> weist Harwick alias „Vanthei" öffentlich zurück, Dorf erkennbar gespalten), Nachtlager
> (Jagd auf ein Wildschwein mit echten Geschicklichkeits-/Mechanik-Proben). Codex Kapitel
> III um „Das Volk der Thahal" erweitert, Höhlen-Referenzbild eingebaut.

### Technik
_(aktuell keine offenen Punkte — die frühere Lücke „Fehlerbehandlung für fehlende Bilder"
ist erledigt, siehe Erledigt-Vermerk unten)_

---

## 17. Arbeitsweise

**Rollenverteilung:** Hendrik entwickelt die Ideen selbst. Claude ist Sparringspartner und
Umsetzungswerkzeug — keine proaktiven Inhaltsvorschläge, keine Materialgenerierung ohne
konkrete Anweisung.

**Muster:**
- **Inhalt vor Implementierung** — erst konzeptionell festlegen, dann technisch umsetzen
- **Sequenziell und bestätigend** — ein Element nach dem anderen, in die Tiefe statt in die
  Breite
- **Direkt und methodisch** — klare Anweisungen, ungeschönte Einschätzung erwartet,
  einschließlich Benennung eigener Fehler. Lieber handeln als bei jedem Schritt rückfragen —
  echte Designentscheidungen aber zurückspielen
- **Präzise bei Mechanik, andeutend bei Erzählung** — Regellogik wird eng spezifiziert;
  Trigger-/Bedingungslogik für Erzählszenen bleibt oft unterspezifiziert, bis die
  Implementierung die Lücke sichtbar macht
- **Null-Fehler-Erwartung bei Code** — Syntaxfehler sind ein wiederkehrender Ärgernispunkt.
  Ausgaben werden vor der Übergabe validiert

**Zur Nutzung mit Claude Code:** Für strukturelle und technische Aufgaben (Gerüste anlegen,
Refactoring, Konsistenzprüfungen) ist der Automodus gut geeignet. Für kreative
Story-Entscheidungen ausdrücklich **nicht** — die besten Ergebnisse dieses Projekts
(Knoten-Wortwitz, Josiahs Rettung, Türen-Kontrast im Offiziersquartier) entstanden über
mehrere Korrekturrunden, nicht im ersten Wurf.
