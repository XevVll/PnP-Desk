# Bild-Prompts (Gemini)

Sammlung der Prompts, mit denen die Referenzbilder dieses Projekts erzeugt wurden — damit sie
nicht in Gesprächsverläufen verloren gehen und ein Nachgenerieren im gleichen Stil möglich bleibt.

**Nach dem Generieren:** PNG in `images/` ablegen, dann `python tools/optimize_images.py`. Die
Dateinamen der Ortsbilder **müssen mit `interior_` beginnen** — sonst greift die 900px-Kappung für
Portraits statt der 1600px für Ortsbilder (`cap_for()` in `tools/optimize_images.py`). Das PNG wird
nicht automatisch gelöscht und der neue Dateiname nicht automatisch in die `js/`-Dateien
eingetragen, beides bleibt Handarbeit.

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
Bildes. Keine Gesichter der Spielercharaktere zeigen: der Blick steht mit im Raum, die Anwesenden
sind teils von hinten oder halb abgewandt zu sehen, damit sich jeder Spieler selbst hineindenken
kann.

```
Dutch Golden Age oil painting, cracked varnish, warm aged tones, painted in the style of
17th-century Dutch masters. Wide landscape format, horizontally composed (approx. 16:9), to match
the framing of the other location images.

Interior of the great cabin of a small 17th-century frigate, seen from just inside the doorway at
standing height, as if the viewer had entered last and is part of the gathering. Low beamed
ceiling, dark polished wood, a wall of small leaded stern windows across the back with grey
daylight and open sea behind them. The heavy writing desk has been pushed aside against one wall
to make floor space, its charts and papers stacked and weighted down.

More oil lamps are lit than the room needs — five or six, hung and standing — so the cabin is
unusually bright and warm against the cold light from the windows, and every face catches some of
it.

Eight or nine men are gathered close together in the confined space, standing rather than seated:
weathered sailors and officers in plain, worn 17th-century seafaring clothing, no uniforms, no
finery. They are turned inward toward one man. Several are seen from behind or in three-quarter
profile, faces partly hidden — the composition deliberately does not present them as portraits.

At the focus stands the captain, in his forties, not raised on anything, at the same level as the
others, speaking. His posture is open and tired rather than commanding: no gesture of authority,
no raised hand, one arm reaching across to rest on the shoulder of a younger man beside him. The
listeners' attention is complete and quiet; one older man near the edge of the group looks at the
floor rather than at the captain.

Close, hushed, intimate atmosphere — the feeling of a private conversation in a crowded small
room, not a speech to a crew. Strong warm lamplight, deep shadow in the corners and under the
beams, high contrast.

Tight framing filling roughly 85-90% of the canvas, little empty space. No modern elements, no
text or labels anywhere in the image.
```

*Falls Gemini es zu feierlich/heroisch macht:* `Important: this is not a heroic or ceremonial
scene. No raised arms, no dramatic poses, no one standing on a table or step. Everyone is tired,
plainly dressed, and standing at the same level.`

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
