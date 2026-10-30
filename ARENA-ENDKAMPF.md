# Handbuch: Kampf-Arena für den Endkampf (Szene 15.1)

Ausführliche Dokumentation zur taktischen Kampf-Arena, mit der der Endkampf in der Ritualkammer
gespielt wird. Ziel: nachvollziehbar machen, **wie** sie funktioniert, **warum** sie so gebaut
ist und **wo weitergearbeitet werden muss** — als Referenz für eine Fortsetzung in einer anderen
Session.

Aufgebaut wie das Schwesterdokument [RIFFINSEL-ERKUNDUNGSGRAPH.md](RIFFINSEL-ERKUNDUNGSGRAPH.md).
Technischer Kontext: [CLAUDE.md](CLAUDE.md). Regel- und Story-Kontext:
[KAMPAGNEN-BIBEL.md](KAMPAGNEN-BIBEL.md), Abschnitte 4 (Regelwerk) und 12.1 (Das Finale).

**Stand: 2026-10-30.** Am 30.10.2026 von W100 auf **Savage Worlds** umgestellt — die Arena
war die letzte Stelle im Projekt, die noch nach dem alten System rechnete. Weiterhin **nicht am
Tisch erprobt.**

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
| `js/arena.js` | **Das Brett.** Kein DOM, kein Firebase. Raster, Entfernung, Bewegung, Rundenwechsel, Wiederauferstehung, Nachschub, Jaguar-Säbel. **Rechnet die Regeln nicht selbst** (siehe 3). |
| `js/regelwerk.js` | Die Probe selbst (`wurf()`), die Würfelstufen, `parade()`/`robustheit()`. |
| `js/kampf.js` | Der Regelkern des Kampfes: `angriffsMod()`, `fernkampfMod()`, `wirkung()`, `schadensWuerfel()`. Dieselbe Datei, die den Kampfmodus in `regie_figuren.html` speist. |
| `js/arena_scenes.js` | Szenen-Definition `15.1`: Feldgröße, Regelwerte, Figuren-Vorlagen. |
| `karte.html` | Spieleransicht: Raster, Figuren, Bewegung/Angriff **nur für Spieler-Figuren nach Freigabe**, Kampf-Log. |
| `arena_admin.html` | **SL-Schlachtfeld** (seit 2026-08-23): eigene Vollbild-Seite für den Kampf. Entität anklicken → auswählen → per Klick bewegen/angreifen, Freigabe, HP, Säbel, Nachsetzen, Versetzen-Modus, Runde. Zugriffsschutz wie `regie.html` (nur über die bekannte URL). |
| `js/regie_vault.js` | Kompakt-Panel im Adminpanel: Überblick, Freigabe (nur Spieler-Figuren), Runde, Nachsetzen — verlinkt aufs Schlachtfeld. |
| `regie.html` | Nur die `<script>`-Tags. |

> **⚠ Jede Arena-Seite braucht DREI Script-Tags: `regelwerk.js`, `kampf.js`, `arena.js`.** Die
> Reihenfolge ist beliebig (alle Aufrufe stehen in Funktionen), aber fehlt eines, bricht die
> Arena erst zur **Laufzeit** und still. `arena_admin.html` lud bis zum 30.10.2026 **keines von
> beiden** — das war die erste Baustelle der Umstellung.

Die Trennung der Engine ist Absicht: Die Regeln sind der Teil, der **stimmen muss**, und sie
lassen sich so ohne Browser gegen die Bibel prüfen (siehe Abschnitt 7).

---

## 3. Das Regelwerk (Bibel 4 und 4.4a)

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

### 3.5 Die drei bewussten Abweichungen, zusammengefasst

1. **Angeschlagen** ohne Willenskraft-Probe (siehe 3.4).
2. Beim **Gang Up** wird nicht geprüft, ob ein mithelfender Verbündeter selbst gebunden ist —
   die Art Buchhaltung, die das Projekt weglässt (vgl. Bibel 4.5).
3. Der **Wunden-Abzug** ist bei 3 gedeckelt, auch wenn eine Figur mehr tragen kann.

Alles Weitere — Wiederauferstehung, Nachschub, Säbel — ist **Kampagnenregel**, nicht Abweichung:
Sie steht in Bibel 12.1 und hat in Savage Worlds kein Gegenstück.

---

## 4. Ablauf und Bedienung

### 4.1 Zugfolge und Steuerungshoheit

**Wer steuert wen (Hendriks Vorgabe, 2026-08-23):**

| Typ | Seite | Steuerung |
|---|---|---|
| `spieler` | Helden | Spieler — aber nur nach Freigabe durch die SL |
| `verbuendeter` | Helden | **nur die SL** (`arena_admin.html`) |
| `diener`, `seelenloser` | Gegner | **nur die SL** (`arena_admin.html`) |

Die SL gibt **eine** Spieler-Figur frei. Solange sie freigegeben ist, darf **jeder** Spieler sie
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
Eingang (Hendriks Vorgabe) —, der Seelenlose oben mittig, vier Diener davor.

**Namensschilder:** Die Helden-Seite (Spieler + Verbündete) ist in beiden Ansichten **immer**
beschriftet — man muss sehen, wer wer ist. Gegner sind austauschbare „Diener" und tragen ihren
Namen nur als Tooltip (in der Spieleransicht zusätzlich ab großer Feldgröße); ihre Schilder
würden bei 16×16 nur übereinanderliegen.

### 4.2 Angriffsart

Die Entfernung entscheidet, es gibt keine Wahl:

- Distanz ≤ `nahkampfReichweite` (1, also angrenzend inkl. diagonal) → **Nahkampf**
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

### 4.3 Nachladen

Ein Fernkampfangriff setzt `geladen: false` und merkt sich `entladenSeitRunde`. Der Rundenwechsel
lädt erst nach, wenn die Runde **größer** als `entladenSeitRunde` ist — also eine volle Runde
später. Am Token erscheint eine „leer"-Marke, aber nur bei Figuren mit `fernWert > 0` (bei einem
Diener wäre „leer" keine Aussage).

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
| `kaempfen` | d8 | **d10** | d6 | **d12** |
| `schiessen` | d8 | d6 | — | — |
| `staerke` | d8 | d10 | d6 | d12 |
| `waffe` / `fernwaffe` | d6 / d6 | d6 / — | d4 / — | d6 / — |
| `reichweite` | 5 | — | — | — |
| `parade` / `robustheit` | 6 / 6 | **7 / 7** | 5 / 5 | **8 / 8** |
| `wild` (Wild Card) | ja | ja | **nein** | ja |
| `wundenMax` | 3 | 3 | **0** | 3 |

**Diese Zahlen sind seit dem 30.10.2026 NICHT mehr gegriffen, sondern GEMESSEN.** Vorher trug
die Arena eigene W100-Kampfwerte, und derselbe Mann hatte im Endkampf andere Werte als in
`besatzung.html` — das war der offene Punkt vom 15.10.2026. Jetzt stammen sie aus den Blättern in
`js/npcs.js`, gerechnet mit `parade()`/`robustheit()` und der besten getragenen Waffe:

| Vorlage | Blatt | warum dieses |
|---|---|---|
| `spieler` | **Harwick** | Die Spielerbögen liegen nur im `localStorage` der Spieler. Harwick ist der Maßstab einer erfahrenen Figur — im Finale angemessen. |
| `verbuendeter` | **Cormac** | Bester Kämpfer an Bord; „Kampf 7 gegen Harwicks 6" ist Kanon und steht damit auch hier. |
| `diener` | wie ein Mannschaftsmitglied | Ein Statist: kein Wild Die, die erste Wunde nimmt ihn raus. Gefährlich in der Menge (Gang Up). |
| `seelenloser` | **sein eigenes Blatt** | Legendär, der einzige d12 der Kampagne. Parade 8 kostet −4 — genau das, was Gang Up zurückholt. |

`tests/t_arena.js` **rechnet diese Herkunft nach** statt sie zu behaupten: Parade, Robustheit und
Kämpfen-Wert der Vorlagen müssen mit den Blättern übereinstimmen.

Je Figur sind die Werte im Schlachtfeld weiter **einzeln editierbar** — und dort lässt sich
zusätzlich **ein echtes NSC-Blatt auf ein Token stempeln** („Blatt → übernehmen"): Name, Werte,
Waffe, Parade und Robustheit kommen aus `js/npcs.js`, gerechnet, nicht abgeschrieben.

### 5.2 Firebase (`arenaState/{sceneId}`)

```
arenaState/15-1/
  runde          Zahl
  freigegeben    Token-ID oder null
  saebeltraeger  Token-ID oder null   ← nur SL, nie an Spieler
  tokens/{id}/
    typ            "spieler" | "verbuendeter" | "diener" | "seelenloser"
    name, symbol, farbe
    x, y           Feldkoordinaten
    wunden         Zahl (fehlt = unversehrt)
    angeschlagen   true/fehlt  - kostet die Handlung, nicht den Wuerfel
    wundenMax      Tragfaehigkeit (0 Statist, 3 Wild Card)
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

### 6.2 SL-Seite (`js/regie_vault.js`)

`arenaAufbauen` · `arenaFigurHinzu` · `arenaFreigeben` · `arenaRundeWeiter` · `arenaSaebel` ·
`arenaEntferne` · `arenaSetzeHp` · `renderArenaPanelHTML`

`arenaSetzeHp()` ist der Hebel für die festen Beats: HP auf 0 setzen tötet, ein Wert > 0 holt eine
gefallene Figur zurück.

### 6.3 Spieler-Seite (`karte.html`)

`startArena` / `stopArena` · `renderArena` · `arenaBewege` · `arenaGreifeAn` · `arenaTokenEl`

---

## 7. Testen

**`tests/t_arena.js`, 174 Prüfungen, im Repo.** Reines Node, kein Browser. Am 30.10.2026 für die
Umstellung komplett neu geschrieben (vorher 30 Prüfungen gegen das W100-System).

**Geladen wird wie im Browser**, nicht per `require()`: `js/regelwerk.js`, `js/kampf.js`,
`js/arena.js`, `js/arena_scenes.js` und `js/npcs.js` laufen in **einem** `vm`-Kontext. Unter
`require()` wäre jede Datei ihr eigener Scope, und `arena.js` sähe die anderen nicht.

**Geprüft wird gegen die REGEL, nicht gegen den Code.** Die vier Prüffelder:

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

Dazu: angeschlagen sperrt den Angriff und nicht die Bewegung · Nachladen erst die Runde darauf ·
eine liegende Figur ist kein Ziel · die Vorlagen stimmen mit den NSC-Blättern überein · die alten
W100-Funktionen existieren nachweislich **nicht mehr** · und die gemessenen Trefferchancen
(24,7 % allein, 81,3 % mit vollem Gang Up).

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

**Ein Integrationstest über die Ansichten gehört nicht ins Repo** (Skill `pnp-safe-test`) und
liegt im Scratchpad der jeweiligen Session: lokaler HTTP-Server, abgefangene
`firebase-config.js`, **Fake-Firebase im Speicher**. **Vor jeder Interaktion `db === null`
prüfen** — die echte Firebase-Datenbank ist produktiv.

---

## 8. Fehlergeschichte

Drei Fehler beim Bau, alle vom Test gefunden:

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

---

## 9. Was noch offen ist

### 9.1 Von Hendrik zu entscheiden

- **Werte.** Sie stammen jetzt aus den Blättern (5.1) und sind damit nicht mehr frei gegriffen —
  aber **ob der Kampf sich gut anfühlt, zeigt erst ein Durchlauf.** Die Rechnung, die man dabei
  im Kopf haben sollte: Der Seelenlose hat Robustheit 8, eine Wunde braucht also **12 Schaden**,
  und Waffe + Stärke (d6 + d8) kommt im Mittel auf 8 — ohne Ass wird er **nicht** verwundet.
  Mit drei Wunden fällt er; realistisch sind das viele Treffer. Stellschrauben in dieser
  Reihenfolge:
  1. `wundenMax` des Seelenlosen (Länge des Kampfes — der ehrlichste Hebel),
  2. `nachschubAlle` / `nachschubAnzahl` (Druck),
  3. seine `robustheit` (ob er überhaupt verwundbar ist),
  4. `waffe`/`staerke` der Spieler (ihre Durchschlagskraft).
- **Hat der Seelenlose eigene Fähigkeiten** jenseits von Zuschlagen und Beschwören? Mechanisch
  ist er ein sehr starker Nahkämpfer mit Parade 8. Savage Worlds hätte dafür Talente (er trägt
  in `js/npcs.js` bereits *Drohende Gegenwart*, *Standhaft*, *Totenstill*, *Vorahnung*) — die
  wirken in der Arena **nicht**, weil das Brett nur die Zahlen kennt.
- **Darf der Säbelträger einen liegenden Diener nachstoßen**, damit er nicht wieder aufsteht
  (siehe 4.2)? Das wäre eine echte neue Taktik. Bewusst nicht eingebaut.
- **Angeschlagen ohne Willenskraft-Probe** (3.4) — die bewusste Abweichung. Falls es am Tisch
  fehlt, ist es ein Wurf je angeschlagener Figur beim Rundenwechsel.

### 9.2 Bekannte Lücken

- **Gegner werden von der SL bewegt wie Spielerfiguren** — es gibt keine Gegner-KI und bewusst
  auch keinen Auto-Zug. Ob das am Tisch angenehm ist, muss der erste Durchlauf zeigen.
- **Keine Initiative.** Die Arena gibt reihum **eine** Figur frei; das Aktionsdeck aus
  `js/kampf.js` (Karten, Joker) wird hier **nicht** benutzt. Das ist Absicht — die SL bestimmt
  die Reihenfolge —, aber es ist ein Unterschied zum Kampfmodus, und wer beides am selben Abend
  spielt, merkt ihn.
- **Talente wirken nicht.** Das Brett kennt nur die Zahlen am Token (siehe 9.1).
- **Kein Rückgängig.** Ein Fehlklick beim Bewegen lässt sich nur über „HP setzen" bzw. erneutes
  Freigeben grob korrigieren.
- **Keine Sichtlinien, keine Deckung, keine Zonen** — die Ritualkammer ist als offene Fläche
  modelliert, obwohl das Bild Pfeiler zeigt.
- ~~Spielerfiguren tragen die Namen aus `js/characters.js`~~ — **geklärt und behoben** (siehe
  Fehlergeschichte Nr. 5): `CHARACTERS` sind die NSC, der Aufbau setzt jetzt generische
  „Spieler 1–4". Die Namen der echten Spielercharaktere stehen nirgends im Repo; die SL vergibt
  sie beim Nachsetzen über „+ Spieler".
- **Firebase-Regeln** für `arenaState` müssen freigegeben werden, siehe 5.3
  ([firebase-rules.json](firebase-rules.json)).
- **Kein Zugriffsschutz auf der Datenbank.** Die Regeln erlauben Lesen und Schreiben ohne
  Anmeldung, und die Datenbank-URL steht im öffentlichen Repo. Praktisch muss jemand das Repo
  finden und die Pfade kennen; der Schaden wäre verlorener Kampagnenstand, keine
  personenbezogenen Daten. Nachrüstbar mit anonymer Firebase-Anmeldung — eine Zeile
  `signInAnonymously()` je Seite und `"auth != null"` statt `true` in den Regeln.

### 9.3 Sinnvolle nächste Schritte

1. Einen Probekampf durchspielen und die Werte justieren.
2. Entscheiden, ob der Seelenlose eine Sonderfähigkeit bekommt.
3. Erst danach über Komfort nachdenken (Rückgängig, Deckung, Gegner-Automatik) — vorher weiß
   niemand, ob es das überhaupt braucht.
