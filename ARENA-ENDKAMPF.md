# Handbuch: Kampf-Arena für den Endkampf (Szene 15.1)

Ausführliche Dokumentation zur taktischen Kampf-Arena, mit der der Endkampf in der Ritualkammer
gespielt wird. Ziel: nachvollziehbar machen, **wie** sie funktioniert, **warum** sie so gebaut
ist und **wo weitergearbeitet werden muss** — als Referenz für eine Fortsetzung in einer anderen
Session.

Aufgebaut wie das Schwesterdokument [RIFFINSEL-ERKUNDUNGSGRAPH.md](RIFFINSEL-ERKUNDUNGSGRAPH.md).
Technischer Kontext: [CLAUDE.md](CLAUDE.md). Regel- und Story-Kontext:
[KAMPAGNEN-BIBEL.md](KAMPAGNEN-BIBEL.md), Abschnitte 4 (Regelwerk) und 12.1 (Das Finale).

**Stand: 2026-08-23.** Erste lauffähige Fassung, noch nicht am Tisch erprobt.

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
| `js/arena.js` | **Regel-Engine.** Kein DOM, kein Firebase. Wird von beiden Seiten benutzt und ist mit Node testbar. |
| `js/arena_scenes.js` | Szenen-Definition `15.1`: Feldgröße, Regelwerte, Figuren-Vorlagen. |
| `karte.html` | Spieleransicht: Raster, Figuren, Bewegung, Angriff, Kampf-Log. |
| `js/regie_vault.js` | SL-Panel: Runde, Freigabe, Figuren setzen/entfernen, HP, Säbelträger. |
| `regie.html` | Nur der `<script>`-Tag. |

Die Trennung der Engine ist Absicht: Die Regeln sind der Teil, der **stimmen muss**, und sie
lassen sich so ohne Browser gegen die Bibel prüfen (siehe Abschnitt 7).

---

## 3. Das Regelwerk (Bibel 4)

Alles rechnet nach dem Probensystem der Bibel. `js/arena.js` bildet es 1:1 ab:

### 3.1 Probe (Bibel 4.1)

```
Schwelle = Wert × 10

Guter Erfolg       1 .. Schwelle/2
Normaler Erfolg    Schwelle/2+1 .. Schwelle
Schlechter Erfolg  Schwelle+1 .. Schwelle + (100−Schwelle)/2
Misserfolg         Rest
```

Beispiel aus der Bibel (Wert 5, Schwelle 50): `1–25 gut · 26–50 normal · 51–75 schlecht ·
76–100 Miss`. Der Test in Abschnitt 7 gleicht **alle 100 Würfe** dagegen ab.

### 3.2 Mastery (Bibel 4.2)

Ohne Mastery entfällt das Band „schlechter Erfolg" und fällt in den Misserfolg — **die
Zahlenschwellen verschieben sich dabei nicht.** In `arenaBand()` genau so umgesetzt: die
Grenzen kommen aus `arenaSchwellen()`, Mastery entscheidet nur, ob das dritte Band zugeteilt wird.

### 3.3 Bedrängnis (Bibel 4.4)

Jeder **zusätzliche** Angreifer im Nahkampf verschiebt das Ergebnis um ein Band nach unten.
`arenaBedraengnis()` zählt die angrenzenden Feinde des Angreifers und zieht 1 ab (der erste
Gegner zählt nicht als Bedrängnis). `arenaVerschiebe()` schiebt dann entsprechend.

### 3.4 Schaden

Die Bibel kennt **keine Kampfwerte** — nur „Schadenspunkte" als kleine ganze Zahlen (z. B.
„Misserfolg → 1 Schadenspunkt", Bibel 10.11). Die Schadenstabelle ist deshalb ein Aufschlag:

| Band | Schaden |
|---|---|
| gut | Grundschaden × 2 (an „Guter Erfolg zählt doppelt" angelehnt) |
| normal | Grundschaden |
| schlecht | Grundschaden ÷ 2, mindestens 1 |
| Misserfolg | 0 |

---

## 4. Ablauf und Bedienung

### 4.1 Zugfolge

Die SL gibt im Panel **eine** Figur frei. Solange sie freigegeben ist, darf **jeder** Spieler
sie bewegen und mit ihr angreifen (Hendriks Vorgabe — es gibt keine Zuordnung Spieler↔Figur).
Ohne freigegebene Figur ist in der Spieleransicht **nichts** anklickbar.

Pro Figur und Runde: **eine** Bewegung (`hatGezogen`) und **ein** Angriff (`hatAngegriffen`).
Beide Marker setzt der Rundenwechsel zurück.

### 4.2 Angriffsart

Die Entfernung entscheidet, es gibt keine Wahl:

- Distanz ≤ `nahkampfReichweite` (1, also angrenzend inkl. diagonal) → **Nahkampf**
- Distanz ≤ `fernkampfReichweite` (6) → **Fernkampf**
- darüber → kein Angriff möglich

Entfernungen sind **Chebyshev-Distanz**: diagonal zählt wie gerade. Das ist am Tisch die
unstrittigste Variante — „angrenzend" heißt genau Distanz 1, egal ob schräg oder gerade.

### 4.3 Nachladen

Ein Fernkampfangriff setzt `geladen: false` und merkt sich `entladenSeitRunde`. Der Rundenwechsel
lädt erst nach, wenn die Runde **größer** als `entladenSeitRunde` ist — also eine volle Runde
später. Am Token erscheint eine „leer"-Marke, aber nur bei Figuren mit `fernWert > 0` (bei einem
Diener wäre „leer" keine Aussage).

### 4.4 Der Seelenlose als Quelle

Er schlägt selbst zu und ist zugleich der Grund, warum die Toten nicht liegen bleiben. **Solange
er lebt:**

- normal getötete Diener stehen nach `wiederauferstehenNach` (2) Runden wieder auf
- alle `nachschubAlle` (3) Runden erscheinen `nachschubAnzahl` (2) neue Diener auf freien
  Randfeldern

**Fällt er, hört beides sofort auf** (`arenaBossLebt()`). Damit ist er das eigentliche Ziel des
Kampfes und nicht bloß der dickste Gegner — ohne dass dafür eine Siegbedingung nötig wäre.

### 4.5 Der Jaguar-Säbel

Nur der Träger tötet Diener **endgültig**: das Token wird gelöscht statt auf `tot` gesetzt, es
kann also nicht wieder aufstehen. Bei allen anderen Zielen (auch beim Seelenlosen) hat der Säbel
keine Sonderwirkung.

**Wer ihn trägt, setzt allein die SL** (`arenaSaebel()`), und es wird den Spielern **nirgends
angezeigt**:

- kein Marker am Token
- das Kampf-Log erwähnt den Säbel bewusst nicht — sonst ließe sich der Träger daran ablesen

Beim Weiterbauen daran denken: **jede neue Log-Zeile und jede neue Anzeige muss das einhalten.**

---

## 5. Datenmodell

### 5.1 Szenen-Konfiguration (`js/arena_scenes.js`)

```js
regeln: {
  breite: 16, hoehe: 16,        // Feldgröße
  bewegung: 2,                  // Felder pro Runde
  nahkampfReichweite: 1,
  fernkampfReichweite: 6,
  wiederauferstehenNach: 2,     // Runden
  nachschubAlle: 3,             // Runden
  nachschubAnzahl: 2
}
```

Figuren-Vorlagen (`vorlagen.spieler` / `.diener` / `.seelenloser`) — aktuelle Werte:

| | Spieler | Diener | Seelenloser |
|---|---|---|---|
| Symbol / Farbe | ☘ gold | ☠ grün | ✦ rot |
| `hpMax` | 6 | 3 | 18 |
| `nahWert` / `nahSchaden` | 5 / 2 | 4 / 1 | 7 / 3 |
| `fernWert` / `fernSchaden` | 5 / 3 | 0 / 0 | 0 / 0 |
| `mastery` | ja | nein | ja |

**Diese Zahlen sind ein Aufschlag, kein Kanon.** Sie sind bewusst zentral einstellbar; einzelne
Figuren lassen sich im Panel abweichend setzen.

### 5.2 Firebase (`arenaState/{sceneId}`)

```
arenaState/15-1/
  runde          Zahl
  freigegeben    Token-ID oder null
  saebeltraeger  Token-ID oder null   ← nur SL, nie an Spieler
  tokens/{id}/
    typ            "spieler" | "diener" | "seelenloser"
    name, symbol, farbe
    x, y           Feldkoordinaten
    hp, hpMax
    nahWert, fernWert, nahSchaden, fernSchaden, mastery
    geladen        bool
    entladenSeitRunde  Runde des Schusses (fürs Nachladen)
    hatGezogen, hatAngegriffen   je Runde
    tot, totSeitRunde, endgueltig
  log/{pushId}/  { text, zeit }
```

Der Pfad folgt der Konvention aus Bibel 13.3 (Punkte in Szenen-IDs werden per `fbKey()` zu
Bindestrichen: `15.1` → `15-1`).

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

> **Hinweis:** Die Firebase-Sicherheitsregeln liegen nicht im Repo. Damit Spieler schreiben
> können, muss `arenaState` in den Regeln freigegeben sein — sonst funktioniert die Arena live
> nicht, obwohl sie offline korrekt läuft.

---

## 6. API-Überblick

### 6.1 Engine (`js/arena.js`)

| Funktion | Zweck |
|---|---|
| `arenaSchwellen(wert)` | Bandgrenzen zu einem Wert |
| `arenaBand(wurf, wert, mastery)` | Wurf → Band |
| `arenaVerschiebe(band, stufen)` | Bedrängnis anwenden |
| `arenaSchaden(band, grundschaden)` | Schadenstabelle |
| `arenaDistanz(a, b)` | Chebyshev-Distanz |
| `arenaAngriffsart(a, ziel, regeln)` | `'nah'` \| `'fern'` \| `null` |
| `arenaBedraengnis(a, tokens, regeln)` | Zahl der zusätzlichen Nahkampfgegner |
| `arenaAngriff(a, ziel, tokens, regeln, saebeltraegerId, wurfVorgabe?)` | **Kernfunktion.** Reines Ergebnisobjekt, verändert nichts. |
| `arenaBewegungErlaubt(token, ziel, regeln, tokens)` | Prüft Reichweite, Rand, Besetzung, „schon gezogen" |
| `arenaBossLebt(tokens)` | Lebt der Seelenlose? |
| `arenaRundenwechsel(tokens, regeln, alteRunde)` | Liefert flaches Änderungsobjekt + Nachschubzahl |
| `arenaFreieRandfelder(tokens, regeln, anzahl)` | Zufällige freie Randfelder für Nachschub |

`arenaAngriff()` nimmt optional einen festen Wurf (`wurfVorgabe`) — dafür gedacht, die Regeln
deterministisch zu testen.

### 6.2 SL-Seite (`js/regie_vault.js`)

`arenaAufbauen` · `arenaFigurHinzu` · `arenaFreigeben` · `arenaRundeWeiter` · `arenaSaebel` ·
`arenaEntferne` · `arenaSetzeHp` · `renderArenaPanelHTML`

`arenaSetzeHp()` ist der Hebel für die festen Beats: HP auf 0 setzen tötet, ein Wert > 0 holt eine
gefallene Figur zurück.

### 6.3 Spieler-Seite (`karte.html`)

`startArena` / `stopArena` · `renderArena` · `arenaBewege` · `arenaGreifeAn` · `arenaTokenEl`

---

## 7. Testen

Testskripte gehören **nicht ins Repo** (Skill `pnp-safe-test`) — sie liegen im Scratchpad der
jeweiligen Session. In dieser Session existierten zwei:

**a) Regel-Engine, reines Node, ohne Browser.** Lädt `js/arena.js` per `require()` und prüft:
Bandgrenzen gegen das Bibel-Beispiel über alle 100 Würfe, Mastery-Verhalten, Bedrängnis,
Schadenstabelle, Reichweiten, Nachladesperre, Säbel-Sonderregel (inkl. „gilt nicht für den
Seelenlosen"), Bewegungsgrenzen, Rundenwechsel mit und ohne lebenden Boss, Randfeldsuche.

**b) Integrationstest über beide Ansichten** mit lokalem HTTP-Server, abgefangener
`firebase-config.js` und einem **Fake-Firebase im Speicher** (`ref().on/off/update/set/push`,
Multi-Path-`update()` von der Wurzel). Prüft: Registrierung der Szene, Aufbau, Panel-Inhalt,
Rasterrendering (256 Felder), keine Marker in der Arena, Freigabe → erreichbare Felder, Bewegung
inkl. Sperre danach, Angriff mit Log (und dass das Log den Säbel **nicht** verrät),
Figur-Hinzufügen inkl. Prüfung auf doppelt belegte Felder, Rundenwechsel, Aufräumen beim
Szenenwechsel.

**Vor jeder Interaktion `db === null` prüfen** — die echte Firebase-Datenbank ist produktiv.

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

---

## 9. Was noch offen ist

### 9.1 Von Hendrik zu entscheiden

- **Werte.** HP, Schaden und Reichweiten sind ein Aufschlag ohne Kanon-Grundlage. Erst ein
  Testlauf zeigt, ob der Kampf zu leicht oder zu zäh ist. Stellschrauben in dieser Reihenfolge:
  `nachschubAlle` / `nachschubAnzahl` (Druck), `hpMax` des Seelenlosen (Länge),
  `nahSchaden` der Diener (Gefahr).
- **Fernkampfreichweite 6.** Bei der Vergrößerung auf 16×16 von 4 angehoben, weil die Fläche sich
  vervierfacht hat, die Bewegung aber bei 2 blieb. **Vorschlag, keine Vorgabe.**
- **Hat der Seelenlose eigene Fähigkeiten** jenseits von Zuschlagen und Beschwören? Aktuell ist er
  mechanisch nur ein starker Nahkämpfer.

### 9.2 Bekannte Lücken

- **Gegner werden von der SL bewegt wie Spielerfiguren** — es gibt keine Gegner-KI und bewusst
  auch keinen Auto-Zug. Ob das am Tisch angenehm ist, muss der erste Durchlauf zeigen.
- **Kein Rückgängig.** Ein Fehlklick beim Bewegen lässt sich nur über „HP setzen" bzw. erneutes
  Freigeben grob korrigieren.
- **Keine Sichtlinien, keine Deckung, keine Zonen** — die Ritualkammer ist als offene Fläche
  modelliert, obwohl das Bild Pfeiler zeigt.
- **Spielerfiguren tragen die Namen aus `js/characters.js`**, wenn `arenaAufbauen()` benutzt wird.
  Ob das die richtigen Namen sind (Spielercharaktere vs. NSC), ist ungeprüft.
- **Firebase-Regeln** für `arenaState` müssen freigegeben werden, siehe 5.3.

### 9.3 Sinnvolle nächste Schritte

1. Einen Probekampf durchspielen und die Werte justieren.
2. Entscheiden, ob der Seelenlose eine Sonderfähigkeit bekommt.
3. Erst danach über Komfort nachdenken (Rückgängig, Deckung, Gegner-Automatik) — vorher weiß
   niemand, ob es das überhaupt braucht.
