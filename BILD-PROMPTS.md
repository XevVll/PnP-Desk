# Bild-Prompts (Gemini)

Sammlung der Prompts, mit denen die Referenzbilder dieses Projekts erzeugt wurden — damit sie
nicht in Gesprächsverläufen verloren gehen und ein Nachgenerieren im gleichen Stil möglich bleibt.

**Nach dem Generieren:** PNG oder JPG in `images/` ablegen, dann `python tools/optimize_images.py`.
Die Dateinamen der Ortsbilder **müssen mit `interior_` beginnen** — sonst greift die 900px-Kappung
für Portraits statt der 1600px für Ortsbilder (`cap_for()` in `tools/optimize_images.py`). Die
Quelldatei wird nicht automatisch gelöscht und der neue Dateiname nicht automatisch in die
`js/`-Dateien eingetragen, beides bleibt Handarbeit.

**Wenn ein Ort schon ein Bild hat:** das bestehende Bild Gemini als **Bildeingabe** mitgeben, nicht
nur im Prompt beschreiben. Ein zweites Bild desselben Orts (andere Perspektive, anderer Zustand)
wird sonst fast nie wiedererkennbar — siehe die Kajüten-Einberufung unten.

**Wenn benannte Figuren im Bild sein sollen:** deren Porträts aus `images/` ebenfalls anhängen.
Anhänge im Prompt **durchnummeriert ansprechen** („Image 1 is the room, images 2 to 8 are
characters…") und je Bild sagen, was daraus übernommen wird — sonst mischt Gemini die
Hintergründe der Porträts mit in die Szene oder verteilt die Gesichter beliebig. Muster dafür:
der Einberufungs-Prompt unten.

---

## Gemeinsamer Stil-Kopf

Steht wörtlich am Anfang jedes Orts-Prompts, damit die Bilder als Serie zusammenpassen:

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.
```

Und am Ende jedes Prompts:

```
Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

---

## Riffinsel (Szene 11.1)

Die fünf Orte von `js/riffinsel_scenes.js`. Die Beschreibungen folgen den dort hinterlegten
Marker-Texten, damit Bild und Text nicht auseinanderlaufen. Alle fünf spielen auf **derselben**
kleinen, vom Riff umschlossenen Insel wie `images/riffinsel.webp` — der Satz dazu steht bewusst in
jedem Prompt.

Die Bilder sind **menschenleer** gehalten, passend zu den Marker-Texten (Design-Regel 2.8: Ort und
Stimmung, kein Plot). Für jeden Ort steht unten eine optionale Zusatzzeile, falls doch die
jeweilige NSC-Figur mit drauf soll.

Vorgeschlagene Dateinamen: `interior_riffstrand.png`, `interior_wrack.png`, `interior_grotte.png`,
`interior_quelle.png`, `interior_aussichtsklippe.png`.

---

### 1. Der Riffstrand

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.

The setting is a small tropical island fully enclosed by a coral reef, the same island seen in the
other images of this location set.

View from ground level, standing on a narrow strip of pale sand at the water's edge, looking out
across a small sheltered lagoon. A short way offshore, a coral reef runs across the entire width of
the frame like a low natural wall: beyond it the open sea breaks against the rock in white surf and
spray, while the water inside the lagoon lies almost completely still, glassy and dark, reflecting
the sky.

A small frigate lies at anchor in the lagoon, close enough to shore that a single ship's boat can
cover the distance — sails furled, hull dark and weathered, riding motionless on the flat water. In
the near foreground a ship's boat has been drawn up onto the sand, its keel cutting a shallow furrow
in the beach.

To the left and right the beach gives way quickly to dense jungle, framing the view: palms leaning
out over the sand, tangled undergrowth, a closed wall of green shutting off the island's interior.
Driftwood and broken coral scattered along the tideline.

Early dawn. The sky low in the east is just beginning to brighten, pale gold and rose above the
horizon, while the upper sky is still deep blue-grey. Long soft light, low contrast, thin mist
lying over the water. No people in the scene.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Optionale Zusatzzeile:* `A handful of sailors in simple 17th-century seamen's clothing stand near
the drawn-up boat, small in the frame, none of them facing the viewer directly.`

---

### 2. Wrackteile am Riff

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.

The setting is a small tropical island fully enclosed by a coral reef, the same island seen in the
other images of this location set.

View from ground level, standing on wet reef rock at the outer edge of the lagoon, looking down and
across at the remains of a wrecked ship. Weathered grey planks jut out of shallow water at broken
angles; a large section of hull lies half-buried in wet sand and coral, its exposed ribs curving up
like the bones of a dead animal.

The wreck is clearly ancient — decades old, long ago driven onto the same reef that now shelters the
lagoon. Barnacles, mussel shells and dark green algae have grown over most of the exposed timber.
Some planks are bleached almost white by sun and salt; others still hold a trace of old black tar.
A few iron fittings, rust-eaten and shapeless.

Sharp, wet reef rock fills the foreground, with shallow tide pools caught between the stones and
spray drifting in the air from the surf breaking on the seaward side of the reef. Beyond the wreck
lies the open sea; behind and to one side rises the green mass of the island.

Bright, hazy tropical daylight, strong wet reflections on stone and timber, salt haze softening the
distance. No people in the scene.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Optionale Zusatzzeile:* `Two sailors in simple 17th-century working clothes crouch among the
timbers, prying loose a usable plank, absorbed in the work and not looking toward the viewer.`

---

### 3. Die versteckte Grotte

**Kein Naturhohlraum und keine Truhe** (Hendriks Korrektur): Die Grotte ist selbst das Bauwerk —
alles aus dem Fels geschlagen, urzeitlich schwer, kein Holz und kein Metall. Zeichentafel und
Klappe sind Teil der Wand, die vier Siegelsteine sind die einzigen beweglichen Teile. Die vier
Tiere sind die des Rätsels: Eule, Katze, Schlange, Maus.

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.

The setting is a small tropical island fully enclosed by a coral reef, the same island seen in the
other images of this location set.

Interior view from ground level, standing inside a small chamber cut into solid rock, looking
toward its rear wall. This is not a natural cave: the walls are too straight, the floor too level,
the corners deliberate. Everything — walls, floor, ceiling — is hewn from the same dark stone,
edges worn round by enormous age and damp. Heavy, massive, primeval construction, with no
ornament for its own sake, but an unmistakable precision beneath the roughness. No wood, no metal,
no mortar, nothing European anywhere in the room.

Behind and beside the viewer, the entrance is a narrow vertical crevice half curtained by hanging
aerial roots and creepers. A single shaft of warm daylight falls through it and reaches only a few
paces in, leaving the back of the chamber in cool blue-grey shadow.

The rear wall carries three things, all carved directly into the stone and clearly visible:
a large tablet hewn out of the wall itself, densely covered with deeply struck carved signs
arranged in six rows; below it, at hand height, four round stone seal-discs resting loose in
shallow scooped hollows, each bearing the relief of a different animal, each one clearly readable
— an owl, a cat, a snake, and a mouse; and beside them a rectangular stone hatch set flush into
the wall with hairline joints, a single empty round recess at its centre, plainly closed and
plainly not meant to be forced.

Cool, dust-dry, absolutely still air. Dust motes hanging in the shaft of light. Deep shadow,
strong single light source, high contrast between the lit carvings and the dark stone behind
them. A sense of great age and of a place untouched for a very long time. No people in the scene.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Falls Gemini die vier Steine verschluckt oder falsche Tiere baut:* die Tier-Zeile ans Ende
wiederholen, z. B. `Important: exactly four round carved seal-stones are visible in their hollows
— owl, cat, snake, mouse — one animal per stone.`

*Falls Gemini doch eine Truhe oder Holz/Metall hineinbaut:* `Important: there is no chest, no
wooden object and no metal anywhere. Every object in the room is carved stone and part of the rock
itself, except the four loose stone seal-discs.`

---

### 4. Die Süßwasserquelle

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.

The setting is a small tropical island fully enclosed by a coral reef, the same island seen in the
other images of this location set.

View from ground level, standing at the edge of a natural rock basin deep in the jungle interior,
looking toward the rock face that feeds it. Clear water seeps and trickles out from between
moss-covered stones higher up in the rock and falls in a thin, soft cascade into the pool below.
The basin is still and clear enough that the pale stones on its bottom are visible through the
water.

The rocks around the basin are thick with deep green moss and small ferns growing from every crack.
Broad-leaved tropical plants crowd in from all sides, some leaning far out over the water. The
ground underfoot is dark, damp and soft, marked with shallow puddles and mossy roots.

Overhead the jungle canopy closes almost completely, so the light arrives only as scattered warm
shafts and dappled patches falling through the leaves, striking the falling water and breaking on
the surface of the pool. Humid air, faint green haze, the greens deepened and enriched by the aged
varnish of the painting. No people in the scene.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Optionale Zusatzzeile:* `A lone ship's cook in simple 17th-century clothing kneels at the edge of
the basin, filling a wooden water cask, calm and unhurried, not looking toward the viewer.`

---

### 5. Die Aussichtsklippe

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.

The setting is a small tropical island fully enclosed by a coral reef, the same island seen in the
other images of this location set.

View from ground level, standing on the flat top of a steep rocky outcrop that rises well above the
rest of the island, looking out over the open sea. The rock underfoot is bare, dark and wet,
cracked and streaked with rain, and falls away sharply at the front edge of the frame into empty
air. A few wind-bent shrubs and tufts of coarse grass cling in the cracks.

Far below and behind, the green canopy of the island and the pale ring of the reef are visible from
above, the sheltered lagoon a patch of lighter water within it. Ahead there is nothing but open
ocean, stretching out to a horizon where the water and a low band of mist blur into one another.

Bright, high tropical daylight with a strong sea wind — scattered cloud, hazy distance, sunlight
glittering in broken patches on the water far below. Great sense of height and exposure. No people
in the scene.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Optionale Zusatzzeile — das abziehende Kriegsschiff* (der eigentliche Zweck des Aufstiegs, siehe
`ORTE.aussichtsklippe`; vor `Bright, high tropical daylight` einfügen):
`Far out toward the horizon, small and already half lost in the haze, a large warship under full
sail runs away from the island on the opposite course — barely more than a pale silhouette, clearly
not a focal point of the composition.`

*Optionale Zusatzzeile — Amos auf Wache:* `A single lookout in simple 17th-century clothing stands
at the cliff edge with his back to the viewer, gazing out to sea.`

---

## Golden Lion — Die Einberufung (Szene 12.1)

Die Kapitänskajüte mit der versammelten Runde. Dateiname:
`interior_kapitaenskajuete_einberufung.jpg` → wird zu `.webp`; danach in
`js/golden_lion_scenes.js` unter `"12.1"` als `imgOverrides: { kapitaenskajuete: … }` eintragen
(steht dort als Kommentar schon vorbereitet).

Bewusst **mit** Figuren, anders als die Riffinsel-Orte — die Versammlung ist der Inhalt des
Bildes. Dabei zwei Sorten Anwesende, klar getrennt:

- **Die sieben NSC bekommen erkennbare Gesichter** — ihre Porträts existieren bereits und werden
  als Bildeingabe mitgegeben, damit die Runde sie am Tisch wiedererkennt.
- **Die Spielercharaktere bleiben gesichtslos** — drei, vier Gestalten im Vordergrund, von hinten
  gesehen. So kann sich jeder Spieler selbst hineindenken, statt eine fremde Visage vorgesetzt zu
  bekommen.

### Vorlage: das bestehende Außenbild

**`images/interior_kapitaenskajuete.webp` ist die verbindliche Vorlage** und sollte Gemini nach
Möglichkeit **als Bildeingabe mitgegeben** werden (Bild + Prompt), nicht nur beschrieben — das ist
der zuverlässigste Weg, die Kajüte wiederzuerkennen.

Das Außenbild zeigt die Kajüte von Deck aus: verriegelte Tür, links und rechts Sprossenfenster,
und **durch das rechte Fenster sitzt Harwick allein am Schreibtisch und schreibt**. Genau dieser
Zustand kippt in `12.1` — dieselbe Kajüte, aber die Tür steht offen und der Raum ist voll.

Was das Bild an Einrichtung festlegt und im neuen Bild wiederkehren muss:

| Element | Wie es aussieht |
|---|---|
| Wände/Rahmen | Rotbraunes Mahagoni, kräftig lasiert, mit **goldenen Zierleisten** |
| Vorhänge | Tief **burgunderrot**, mit goldenem Muster, seitlich gerafft |
| Bücherregal | Dunkles Holz, dicht mit **ledergebundenen Bänden** |
| Globus | Auf eigenem hölzernem Standfuß, hell, in Griffweite des Regals |
| Koje | Eingebaut, mit **blassgoldener/cremefarbener** Bettwäsche |
| Truhe | Kleine, verzierte Truhe mit Goldbeschlägen auf einem Stuhl/Tischchen |
| Licht | Eine **hängende Messing-Öllampe** mit Glaszylinder, warmes Licht |
| Schreibtisch | Harwicks Platz: Papiere, Tintenfass, gerollte Karten |
| Decke | Niedrig, dunkle Balken |

### Anhänge — in dieser Reihenfolge mitgeben

Der Prompt unten spricht die Bilder **nummeriert** an. Also genau in dieser Reihenfolge anhängen,
sonst zeigen die Anweisungen auf die falsche Datei:

| # | Datei | Rolle im Bild |
|---|---|---|
| 1 | `images/interior_kapitaenskajuete.webp` | Der Raum — Architektur, Material, Farbigkeit |
| 2 | `images/James_Harwick.webp` | Harwick, spricht, Bildmitte |
| 3 | `images/Cormac_Daly.webp` | Cormac, am Rand, Blick zu Boden |
| 4 | `images/Tom_Fletcher.webp` | Tom |
| 5 | `images/Francesco_Benedetto_Almeida.webp` | Francesco |
| 6 | `images/Dirk_van_Hoorn.webp` | Dirk |
| 7 | `images/Josiah_Pryce.webp` | Josiah |
| 8 | `images/Walter_Wat_Crozier.webp` | Wat, etwas abseits |

**Falls Gemini bei acht Anhängen die Ähnlichkeiten vermischt:** auf Bild 1–4 reduzieren (Raum,
Harwick, Cormac, Wat) und die übrigen im Prompt nur als „weitere Seeleute" führen. Lieber vier
klar erkennbare Figuren als acht verwaschene.

### Der Prompt

```
Attached images and how to use them — read this first:
  Image 1 is the ROOM reference. Reproduce its architecture, materials and palette exactly:
    reddish-brown mahogany panelling with gilded trim mouldings, deep burgundy curtains with gold
    patterning, the dark bookcase of leather-bound volumes, the pale globe on its wooden stand,
    the built-in bunk with cream-gold bedding, the small ornate gold-fitted chest, the hanging
    brass oil lamp with its glass chimney, and the low dark ceiling beams. Do NOT copy its camera
    angle — that image looks at the cabin from outside; this new image is inside the same room.
  Images 2 to 8 are CHARACTER references. Each shows one specific man. Reproduce each man's face,
    hair, beard, build and clothing faithfully and recognisably, so that a viewer who knows these
    portraits identifies each of them at a glance. Ignore the backgrounds of those portraits
    entirely — only the men themselves carry over.
      Image 2 — the captain: speaking, at the focus of the group, centre of frame.
      Image 3 — an older, taciturn man: standing at the edge of the group, looking down at the
        floor rather than at the captain.
      Image 4, 5, 6, 7 — listening, gathered close, turned inward toward the captain.
      Image 8 — a heavy, rough-looking man standing slightly apart from the others, near the wall.
  In addition to these eight named men, include three or four further figures whose faces are NOT
    visible — seen from behind or fully turned away, in plain seamen's clothing. These stand in
    the foreground closest to the viewer. Do not invent recognisable faces for them.

The image itself:

Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.

The interior of the same captain's cabin shown in image 1, now seen from inside.
Keep the established furnishings and materials exactly: rich reddish-brown mahogany panelling with
gilded trim mouldings, deep burgundy curtains with gold patterning gathered at the sides, a dark
bookcase full of leather-bound volumes, a pale globe on its own wooden stand, a built-in bunk with
cream-gold bedding, a small ornate gold-fitted chest, and a hanging brass oil lamp with a glass
chimney as the main light source. Low dark ceiling beams throughout.

The view is from just inside the doorway at standing height, as if the viewer had entered last and
is part of the gathering. The heavy writing desk — where the captain normally sits alone — has
been pushed aside against the panelling, its charts and papers stacked and weighted down, to make
floor space.

More lamps than usual have been lit, so the cabin is unusually warm and bright, every face
catching some of the light, deep shadow in the corners and under the beams.

Eleven or twelve men are gathered close together in the confined space, standing rather than
seated, all in plain, worn 17th-century seafaring clothing — no uniforms, no finery. Everyone is
turned inward toward the captain.

The captain stands at the focus, not raised on anything, at the same level as the others,
speaking. His posture is open and tired rather than commanding: no gesture of authority, no raised
hand. One arm reaches across to rest on the shoulder of one of the faceless younger men beside
him. The listeners' attention is complete and quiet.

Close, hushed, intimate atmosphere — a private conversation in a crowded small room, not a speech
to a crew.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Falls Gemini es zu feierlich/heroisch macht:* `Important: this is not a heroic or ceremonial
scene. No raised arms, no dramatic poses, no one standing on a table or step. Everyone is tired,
plainly dressed, and standing at the same level.`

*Falls die Kajüte nicht wie Bild 1 aussieht:* `Important: match image 1's cabin exactly — mahogany
panelling with gilded trim, deep burgundy curtains, the bookcase of leather-bound books, the globe
on its stand, the built-in bunk, and the hanging brass oil lamp.`

*Falls die Gesichter nicht den Porträts entsprechen:* `Important: images 2 to 8 are likeness
references, not style references. Each of those eight men must be individually recognisable as the
man in his portrait — same face, same hair and beard, same clothing.`

*Falls Gemini allen Figuren Gesichter gibt:* `Important: only the eight men from images 2 to 8 have
visible faces. The three or four additional figures in the foreground must be seen from behind,
with their faces completely hidden.`

### Variante: gleiche Außenansicht, Tür offen

Falls du die Wiedererkennbarkeit über alles stellen willst, geht auch die **identische
Kameraposition wie im Vorlagenbild** — von Deck aus auf die Kajütenwand — nur mit offener Tür,
hell erleuchtetem Innenraum und Gestalten, die sich darin drängen. Das erhält die Vorlage
maximal, zeigt die Versammlung aber nur ausschnitthaft durch Tür und Fenster:

Hier reicht **Bild 1 als einziger Anhang** — bei dieser Distanz wären Porträt-Ähnlichkeiten
ohnehin nicht mehr zu erkennen.

```
Attached image 1 is the reference. Reproduce its camera position, framing, architecture and
materials exactly.

Same view, same camera position and same framing as image 1: the captain's cabin seen from the
deck, its mahogany wall with gilded trim, leaded windows left and right, and the plank door at the
centre. Everything identical — except the door now stands wide open, the cabin inside is lit far
more brightly than usual, and the room is crowded with standing men, their figures visible through
the open doorway and through the windows on both sides. At this distance the men are silhouettes
and half-lit shapes, not portraits — no individual face needs to be readable. No one is looking
out. The deck in the foreground is empty and quiet.
```

---

## Grabesinsel (Szene 13.1)

Das Finale. Zwei Bilder: die Übersichtskarte der Insel (Szenen-Hintergrund) und der schwarze
Strand als Ortsbild. Der schwarze Weg kann sich vorerst das Strandbild teilen.

Dateinamen: `grabesinsel.jpg` (Karte) und `interior_grabesstrand.jpg` (Ort). **Achtung:** die
Übersichtskarte braucht zusätzlich einen Eintrag in `MAP_NAMES` in `tools/optimize_images.py`,
sonst wird sie auf 900px gekappt statt auf 1920px — genau wie damals bei `riffinsel.png`.

Bis beide existieren zeigt die Szene `images/schatzinsel.webp` als Platzhalter.

**Leitgedanke (Hendriks Vorgabe, mit Skizze):** Die Kathedralen-Form entsteht **nicht durch ein
Bauwerk**, sondern durch scharfkantige Bergrücken, die ein kreuzförmiges Tal umschließen. Es soll
**nicht nach Zivilisation aussehen** — der Weg darin ist natürlicher schwarzer Fels, keine
gepflasterte Straße. Nur **minimale Andeutungen** von Tempel/Kirche, die mit dem natürlichen
Gesteinsbild verschmelzen. Also ausdrücklich **keine Ruine, kein Mauerwerk, keine Treppen**.

Grundriss nach der Skizze: ein langes Langhaus, das unten am Meer beginnt, links und rechts zwei
Querarme, oben ein abschließender Kopf. **Genau ein Zugang zum Meer**, am Fuß des Langhauses —
sonst fällt der Fels ringsum steil ins Wasser.

**Am inneren Ende mündet das Tal in eine Höhle** — sie ist das Kathedralenherz. Das
grünlich-türkise Leuchten kommt **aus dieser Höhle heraus** und liegt nicht flächig über dem
ganzen Talboden.

**Zwei Fehler, die der erste Durchgang produziert hat (22.08.):**
1. *„Zu plastisch, wie gestanzte Knete"* — das Kreuz sah aus wie eine saubere Form, die in eine
   weiche Masse gedrückt wurde: gleichmäßige Tiefe, glatte Ränder, umlaufender Wall wie ein
   Krater. Gegenmittel: **erodiertes Gebirge mit unregelmäßiger Höhe, Zacken, Schutthalden und
   vorspringenden Felsnasen**, die das Tal stellenweise verdecken. Der Kreuz-Grundriss soll etwas
   sein, das man **allmählich erkennt**, kein sauberes Symbol.
2. Das Leuchten lag als Fläche auf dem Talboden statt aus der Höhle zu kommen.

### 1. Übersichtskarte der Insel (Grundszene)

```
Dutch Golden Age oil painting, cracked varnish, aged canvas texture, painted in the style of
17th-century Dutch masters — matching the other island maps in this set in technique and framing,
but far colder and more desaturated in palette: black and dark grey stone, cold grey-green sea,
a heavy overcast sky with no warmth in it.

Wide landscape format, approx. 16:9. A whole small island seen from high above at a steep oblique
angle — high enough that the shape of the island's interior reads clearly as a plan, but still
tilted enough to show the height and faces of the rock. Open sea all around, the island filling
most of the frame.

THE TERRAIN — read this carefully, it is the hardest part: the island is an eroded black
mountain massif, and the valleys between its ridges happen to form a cross. It must look like real
weathered geology, NOT like a shape stamped, cut, moulded or embossed into a soft mass.

Concretely: the ridges vary constantly in height, width and spacing — jagged summits, broken
crests, deep gullies, fans of scree spilling down their inner faces, fractured slabs, spurs of
rock jutting out into the valley and partly hiding it from view. Nothing about the enclosure is
uniform. The valley itself changes width along its length, narrows and widens, and its edges are
ragged rather than clean. The valley floor is not a flat basin of even depth: it rises and falls,
with steps of broken rock, boulders and rubble fields.

The cross plan should be something a viewer gradually recognises after looking for a moment — not
an obvious symbol laid on the landscape. One long valley running inland from the shore, two
shorter valleys branching left and right partway along it, and a broader hollow closing it at the
far end. The shape is formed ENTIRELY by natural rock — not built, not carved, not paved.

The surrounding ridges fall directly into the sea on every side but one, with an irregular, deeply
indented coastline of stacks and inlets. There is exactly ONE opening into the interior: a narrow
gap at the foot of the long valley, with a small shelf of black rock at the waterline — the only
place a boat could land.

At the far inner end of the valley the rock face opens into a large CAVE MOUTH — a natural
opening in the cliff, irregular in outline, dark inside. This is where the valley leads and where
it stops.

Only the faintest suggestions of a temple anywhere — a few places where the rock happens to stand
in tall narrow forms like pillars, or where a ridge face falls in a way that suggests an arch.
These must look like natural rock formations that merely resemble architecture, never like
built or carved structures. No walls, no masonry, no ruins, no rubble piles of worked stone, no
carvings.

Vegetation is almost absent: a few sparse grey stalks in cracks, nothing green, no palms, no
jungle.

An unnatural greenish-turquoise glow comes OUT OF THE CAVE MOUTH and spills onto the stone
directly in front of it, lighting the rock faces around the opening — cold, steady, not firelight.
The glow is concentrated at the cave; it does NOT lie spread across the whole valley floor. It is
the only colour in the painting.

A small ship lies at anchor outside the sea gap, tiny in the frame.

Painted as a landscape, not as a model: atmospheric haze softening the far side of the island,
varied rock texture, visible weathering and erosion, broken light under the overcast sky.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Falls es wieder wie gestanzt/wie ein Modell aussieht:* `Important: the island must not look like a
shape pressed into clay or a 3D model. The cross is not stamped, extruded or embossed. Break up
every edge: uneven ridge heights, scree slopes, rock spurs jutting into the valley and partly
hiding it, an irregular valley width, a valley floor with steps and boulders. Real eroded geology,
painted with atmospheric depth.`

*Falls Gemini ein Bauwerk oder eine Ruine baut:* `Important: there is no building and no ruin on
this island. No walls, no masonry, no columns, no steps, no carvings. Everything is natural rock.
The cathedral shape exists only as the outline of the valleys between the mountain ridges.`

*Falls das Leuchten wieder flächig auf dem Talboden liegt:* `Important: the glow comes only from
inside the cave mouth at the far end of the valley and lights the rock immediately around that
opening. The rest of the valley floor is unlit black stone.`

*Falls es zu warm/freundlich wird:* `Important: keep the palette cold and desaturated. No warm
sunlight, no blue tropical water, no green foliage, no sandy beach. The only colour in the image
is the greenish-turquoise glow at the centre.`

### 2. Der schwarze Strand (Ortsbild)

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters — but cold and desaturated in palette: black stone, grey-green water,
heavy overcast sky.

Wide landscape format, horizontally composed (approx. 16:9). View from ground level, standing on
the shore itself, looking inland toward the island's interior.

There is no sand. The shore is bare black stone, worn naturally smooth by the sea, sloping
straight down into the water. A ship's boat has been drawn up onto it, and several wooden crates
stand unloaded beside it on the bare rock.

Ahead, the ground continues inland as a broad floor of the same black stone, running between two
steep walls of jagged black rock that rise high on either side and leave no way around. It reads
as a natural valley floor, not as a road — uneven edges, natural fracture lines, no paving, no
kerbs, no steps, nothing built.

Here and there the rock walls happen to stand in tall narrow forms suggesting pillars, and one
opening between them suggests an arch — but these are clearly natural formations that merely
resemble architecture. No walls, no masonry, no carvings, no ruins.

Vegetation is almost absent: a few sparse grey stalks in the cracks, nothing green. No birds, no
surf breaking, no movement.

Far inland, where the valley narrows between the rocks, a faint greenish-turquoise glow lies over
the stone — cold, steady, the only colour in the scene.

No people in the scene. Tight framing filling roughly 85-90% of the canvas, little empty space.
No modern elements, no text or labels anywhere in the image.
```

*Falls Gemini ein Bauwerk oder eine Ruine baut:* `Important: there is no building and no ruin.
No walls, no masonry, no columns, no steps, no carvings, no rubble. Everything is natural rock
that only happens to resemble architecture.`

*Falls es zu warm/freundlich wird:* `Important: keep the palette cold and desaturated. No warm
sunlight, no blue tropical water, no green foliage, no sandy beach. The only colour in the image
is the greenish-turquoise glow in the distance.`

---

## Vorlage: Stammesdorf (Schatzinsel)

Der Prompt, an dem sich die obigen orientieren — als Referenz für den Stil aufbewahrt.

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.
View from ground level, standing right at the entrance to a tribal village, looking inward toward
its center. The huts nearest the viewer are seen mostly from the side or back, since their doorways
face inward toward the village center rather than outward — a few curious faces peer out through
small window openings.
The architecture is varied and organically grown, not uniform: not every structure is round, but
nearly all share a flowing, curved building style — sweeping, branch-like beams, tapering supports,
structures that seem to echo the form of trees themselves rather than straight, rigid carpentry.
Wood in a rich saturated orange tone, pale thatched roofs, an unexpected elegance in the joinery.
Some huts stand on stilts with small attached terraces. Others are built higher still, using the
platforms of lower dwellings beneath them as structural support, connected here and there by simple
flexible rope-and-plank bridges.
Toward the center of the village rise a few larger, temple-like structures — richly decorated with
painted carvings and colorful ornamentation, clearly more significant than the surrounding
dwellings, some with stone foundations and sections of stone construction blended into the
tree-like wooden framework.
Off to the right side of the frame, rising up behind and above that portion of the village, the
dead tree looms — large in scale and clearly the dominant natural feature on that side of the
composition, but positioned in the middle distance rather than close foreground: less sharply
detailed than the huts in front of it, its bare gray branches softened slightly by distance and
haze, without competing for the viewer's primary attention. It occupies its own side of the frame
rather than spanning the whole horizon.
Many villagers stand and look directly toward the viewer with open curiosity — Caribbean-Indigenous
in appearance, dark-skinned, universally slim and wiry build. They wear simple wooden jewelry and
ornaments only — no metal of any kind visible anywhere on their bodies or in the scene.
In the center of the frame, slightly more prominent than the others, stands the tribe's young chief
— early thirties, standing his ground, expression skeptical and unwelcoming, arms not raised in
greeting, a clear note of distrust directed at the viewer.
Warm, humid tropical daylight, dappled by surrounding jungle canopy at the clearing's edge. Tight
framing filling roughly 85–90% of the canvas, little empty space. No modern elements, no text or
labels anywhere in the image.
```
