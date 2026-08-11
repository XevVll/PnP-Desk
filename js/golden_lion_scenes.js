// Szenen-Definition für die Golden-Lion-Schiffskarte.
//
// ANDERS ALS BEI GRIMSGATE (scenes.js): Positionen, Titel und Beschreibung
// jedes Markers werden hier NUR EINMAL in GOLDEN_LION_MARKERS_BASE
// definiert. Jede Szene (Basis, Sturm, Karibik, ...) überschreibt in
// GOLDEN_LION_SCENES nur das, was sich für diese Szene tatsächlich
// ändert (meistens: welches Bild angezeigt wird).
//
// WARUM DAS SO GEBAUT IST (statt wie bei Grimsgate jede Szene komplett
// neu aufzulisten):
//
//   Ohne Basis/Override müsstet ihr bei jeder neuen Szene (z.B. "Sturm")
//   alle 10 Marker mit Position, Titel und Beschreibung erneut komplett
//   hinschreiben - auch wenn sich nur das Bild von 3 der 10 Marker
//   ändert. Bei 5 Szenen wären das 50 Marker-Einträge, bei denen sich
//   die Positionsdaten 47 Mal wortwörtlich wiederholen. Vertippt sich
//   dabei jemand bei einer "top"/"left"-Zahl, wandert der Marker in
//   genau dieser einen Szene minimal von der Stelle, an der er in allen
//   anderen Szenen sitzt - ein Fehler, der leicht unbemerkt bleibt,
//   weil er nur beim Durchklicken dieser einen Szene auffällt.
//
//   Mit Basis/Override gibt es die Position jedes Markers nur an EINER
//   Stelle im Code. Eine neue Szene braucht im einfachsten Fall nur:
//
//     "3.1": {
//       label: "Golden Lion im Sturm",
//       background: "images/golden_lion_cutaway_sturm.webp",
//       imgOverrides: { oberdeck: "images/interior_oberdeck_sturm.webp" }
//     }
//
//   Alle 10 Marker existieren automatisch weiter, an derselben Stelle,
//   mit demselben Titel/Text - nur "oberdeck" zeigt ein anderes Bild.
//   Ändert sich später eine Marker-POSITION (z.B. weil ihr die
//   Koordinate nachjustiert), passiert das an einer einzigen Stelle
//   und wirkt sich auf alle Szenen gleichzeitig aus.
//
// Nutzung: getGoldenLionMarkers(sceneId) liefert die fertig
// zusammengeführte Marker-Liste für eine Szene - Basis-Daten plus
// alle Overrides dieser Szene, in dieser Reihenfolge angewendet.

const GOLDEN_LION_MARKERS_BASE = {
  bug: {
    top: 20, left: 83,
    title: "Bug / Vorschiff",
    desc: "Vorderster Teil des offenen Oberdecks, Bugspriet und vorderes Tauwerk.",
    img: "images/interior_bug.webp"
  },
  oberdeck: {
    top: 24, left: 55,
    title: "Oberdeck",
    desc: "Offene Decksmitte um den Hauptmast, Taljen, arbeitende Crew.",
    img: "images/interior_oberdeck.webp"
  },
  achterdeck: {
    top: 22, left: 21,
    title: "Achterdeck",
    desc: "Erhöhtes Deck am Heck. Tom Fletcher hält lässig das Ruder — scheinbar mühelos auf Kurs.",
    img: "images/interior_achterdeck.webp"
  },
  kapitaenskajuete: {
    top: 41, left: 30,
    title: "Kapitänskajüte",
    desc: "Die Tür zur Kapitänskajüte ist verriegelt. Durch die Fenster daneben fällt warmes Lampenlicht — drinnen sitzt Harwick über Papieren am Schreibtisch, den Kopf gesenkt, konzentriert. Wer anklopft, bekommt keine Antwort.",
    img: "images/interior_kapitaenskajuete.webp"
  },
  offiziersquartier: {
    top: 54, left: 23,
    title: "Offiziersquartier",
    desc: "Zwei knapp geschnittene Kammern liegen Tür an Tür. Die eine ist geschlossen und verriegelt — schlicht, ohne Ornament, der Gang davor aufgeräumt. Die andere steht offen: eine Hängematte statt fester Koje, zerwühlte Decken, Würfel und Karten verstreut auf Tisch und Boden, ein paar leere Flaschen, ein achtlos weggekickter Stiefel. Über einem Hocker hängt ein blaues Halstuch.",
    img: "images/interior_offiziersquartier.webp"
  },
  batteriedeck: {
    top: 55, left: 60,
    title: "Batteriedeck",
    desc: "Durchgehende Kanonenreihe, aber wenig Ordnung — Werkzeug und Pulverreste liegen, wie sie zuletzt gebraucht wurden. So viele Kanonen für ein einfaches Begleitschiff?",
    img: "images/interior_batteriedeck.webp"
  },
  unterdeck: {
    top: 66, left: 48,
    title: "Unterdeck (Mannschaft)",
    desc: "Enge Reihen fester Kojen, dicht an dicht eingebaut, Vorhänge davor für ein wenig Privatsphäre — mehr Komfort, als man auf einem Schiff erwarten würde. Es ist der einzige wirklich ruhige Ort auf dem ganzen Schiff: gedämpfte Stimmen, gleichmäßiges Atmen, irgendwo ein leises Schnarchen. Die Crew schläft in Schichten, rotierend — hier liegt immer irgendwer, während andere Wache stehen.",
    img: "images/interior_unterdeck.webp"
  },
  werkstatt: {
    top: 66, left: 68,
    title: "Werkstatt",
    desc: "Mehrere Männer bei der Arbeit — hier läuft es merklich ordentlicher als im Rest des Schiffs. Werkzeug hat seinen Platz, nichts liegt achtlos herum. Wer genau hinsieht (oder selbst etwas vom Handwerk versteht), erkennt: Das sind keine einfachen Matrosen, sondern gelernte Leute.",
    img: "images/interior_werkstatt.webp"
  },
  frachtraum: {
    top: 70, left: 82,
    title: "Frachtraum / Laderaum",
    desc: "Dunkel, still, vollgestopft: Fässer und Kisten dicht gestaut, Tauwerk und Segeltuch verzurrt. Kein offenes Feuer erlaubt — nur gedämpftes Licht, das durch eine Gitterluke von einem Deck darüber hereinfällt. Ein Ort, an dem sich niemand lange aufhält.",
    img: "images/interior_frachtraum.webp",
    // Optionales Feld "variants": mehrere benannte Bildzustände für
    // denselben Ort, unabhängig von der Szene/Trigger-Logik. Die aktive
    // Variante wird im Admin-Panel manuell umgeschaltet und in Firebase
    // unter markerVariant/<markerId> gespeichert (nicht unter regie/,
    // da sie - anders als Trigger - direkt das Spieler-Bild beeinflusst).
    // Fehlt "variants" bei einem Marker, ändert sich am Verhalten nichts.
    //
    // Varianten können optional ein eigenes "desc" mitbringen (zusätzlich
    // zum img). Ist bei der aktiven Variante kein "desc" gesetzt, wird
    // der Basistext oben (marker.desc) angezeigt - siehe karte.html,
    // openOverlay(). So kann z.B. "Standard" einen Zusatzsatz zeigen, den
    // "Leer" bewusst nicht hat, ohne den Basistext zu duplizieren.
    variants: {
      standard: {
        label: "Standard (versteckt)",
        img: "images/interior_frachtraum.webp",
        desc: "Dunkel, still, vollgestopft: Fässer und Kisten dicht gestaut, Tauwerk und Segeltuch verzurrt. Kein offenes Feuer erlaubt — nur gedämpftes Licht, das durch eine Gitterluke von einem Deck darüber hereinfällt. Ein Ort, an dem sich niemand lange aufhält.\n\nHabe ich da gerade etwas gehört? Bestimmt nur das Schiff."
      },
      leer: { label: "Leer (Junge weg/gefunden)", img: "images/interior_frachtraum_leer.webp" }
    }
  },
  kombuese: {
    top: 76, left: 52,
    title: "Kombüse",
    desc: "Ein freundlicher, wie es sich für einen guten Koch gehört etwas rundlicher Mann mit Lachfalten steht am Herd und summt leise vor sich hin. Es duftet fantastisch.",
    img: "images/interior_kombuese.webp"
  }
};

// Szenen-Feld "soundFile" (optional, gleiches Prinzip wie in scenes.js):
//   Dateiname einer selbst gehosteten Audiodatei (mp3/ogg/wav/m4a/aac).
//   Dient nur als Fallback - im Admin-Panel gesetzte Werte (Firebase)
//   haben Vorrang. Fehlt das Feld UND ist im Admin-Panel nichts gesetzt,
//   läuft kein Ton für diese Szene.

const GOLDEN_LION_SCENES = {
  "2.1": {
    label: "Golden Lion (Basis)",
    background: "images/golden_lion_cutaway.webp",
    imgOverrides: {}      // nutzt für alle Marker einfach die img aus BASE
    // descOverrides: {}  // optional, falls in einer Szene auch Texte abweichen sollen
    // soundFile: "meeresrauschen.mp3"
  },

  "3.1": {
    label: "Golden Lion im Sturm",
    background: "images/golden_lion_cutaway_sturm.webp",
    // Bug, Offiziersquartier, Unterdeck, Werkstatt und Kombüse spielen in
    // dieser Szene nicht mit - dort passiert nichts Sturmrelevantes.
    hiddenMarkers: ["bug", "offiziersquartier", "unterdeck", "werkstatt", "kombuese"],
    imgOverrides: {
      oberdeck: "images/interior_oberdeck_sturm.webp",
      achterdeck: "images/interior_achterdeck_sturm.webp",
      kapitaenskajuete: "images/interior_kapitaenskajuete_sturm.webp",
      batteriedeck: "images/interior_batteriedeck_sturm.webp",
      frachtraum: "images/interior_frachtraum_sturm.webp"
    },
    descOverrides: {
      oberdeck: "Regen peitscht fast waagerecht über das Deck, Blitze zerreißen den Himmel. Cormac steht mitten im Chaos und ruft Befehle — die Segel sind noch zu weit draußen, und wenn sie nicht bald eingeschnürt werden, droht der Mast abzureißen. Männer hängen in den Wanten, kämpfen mit den nassen Leinen, während andere sich nur noch am Deck festkrallen, von der letzten Welle niedergeworfen.",
      achterdeck: "Tom kämpft mit dem Ruder, beide Hände fest um die Speichen, Muskeln sichtbar angespannt — von der lässigen Mühelosigkeit sonst keine Spur. Jede Welle versucht, ihm das Ruder aus der Hand zu reißen.",
      kapitaenskajuete: "Trotz des tobenden Sturms sitzt Harwick unbewegt über Karte und Kompass, den Blick auf den Kurs gerichtet, während das Schiff um ihn herum ächzt und schlingert. Regenwasser läuft in Bahnen die Fenster herab, ein Blitz zuckt durch die Scheiben — er scheint es kaum zu bemerken.",
      batteriedeck: "Wasser strömt in Schwällen von oben herein, das Deck liegt unter einer rutschigen Wasserschicht. Eine der Kanonen hat sich losgerissen und rollt bei jeder Welle bedrohlich hin und her. Lärm und Chaos, so weit man hört.",
      frachtraum: "Der Frachtraum steht knöcheltief unter Wasser — bei jeder Welle schwappt es zwischen den Fässern hin und her. Irgendwo dringt Wasser ein, das hier nicht hingehört. Wenn niemand bald etwas unternimmt, wird es mehr."
    },
    soundFile: "storm1.ogg" // war "sturm.mp3" - passte nie zur tatsaechlich abgelegten Datei
  },

  "5.1": {
    label: "Golden Lion — Nach der Insel",
    background: "images/golden_lion_cutaway.webp",
    imgOverrides: {} // optisch bewusst identisch zur Basis-Szene (2.1) - Hendriks Auftrag: "optisch die Golden Lion Basis Szene kopieren"
    // descOverrides: {} - keine nötig, Marker-Texte aus BASE passen weiterhin
  },

  "6.1": {
    label: "Golden Lion in der Flaute",
    background: "images/golden_lion_cutaway.webp",
    imgOverrides: {} // ebenfalls wie Basis-Szene - kein Wetterumschwung, der eigenes Bildmaterial rechtfertigt (nur Windstille)
  }

  // Nächste freie führende Ziffer für eine weitere neue Örtlichkeit/einen
  // weiteren Golden-Lion-Zustand: "9.1" ("7.1" Spanischer Hafen und "8.1"
  // Schmugglernest sind seit der Übergangsszene nach der Insel vergeben,
  // siehe spanischer_hafen_scenes.js/schmugglernest_scenes.js).
};

// ID der Szene, die angezeigt wird, falls (noch) keine Verbindung zu
// Firebase besteht oder noch nichts gesetzt wurde.
const DEFAULT_GOLDEN_LION_SCENE = "2.1";

// Führt Basis-Marker-Daten und die Overrides einer Szene zusammen.
// Gibt ein Array von Markern zurück, wie es scenes.js/SCENES[...].markers
// bisher direkt geliefert hat - damit ist die Kartenseite/Admin-Seite
// unverändert nutzbar, sie muss nur diese Funktion statt eines direkten
// Feldzugriffs aufrufen.
//
// Szenen-Feld "hiddenMarkers" (optional, z.B. bei "3.1" - Sturm genutzt):
//   Liste von Marker-IDs, die in DIESER Szene nicht auftauchen sollen
//   (z.B. Kombüse/Werkstatt/Unterdeck/Offiziersquartier/Bug im Sturm -
//   dort spielt in dieser Szene nichts). Fehlt das Feld, sind wie bisher
//   alle Marker aus GOLDEN_LION_MARKERS_BASE sichtbar.
//
// Sonderfall Varianten + imgOverride zusammen (z.B. Frachtraum):
//   Hat ein Marker in BASE ein "variants"-Feld (Frachtraum: Standard/Leer
//   für den blinden Passagier) UND überschreibt die aktuelle Szene sein
//   Bild zusätzlich per imgOverrides (z.B. Sturm-Bild), würden sonst die
//   BASE-Varianten weiter aktiv bleiben - inklusive einer evtl. in
//   Firebase gespeicherten Variantenwahl aus einer ANDEREN Szene. Das
//   Sturm-Bild würde dann von der (für den Sturm gar nicht mehr
//   relevanten) Varianten-Auswahl überschrieben. Deshalb: Hat eine Szene
//   für einen Marker ein eigenes imgOverride gesetzt, gilt das als
//   bewusste Festlegung auf GENAU dieses eine Bild - die Varianten dieses
//   Markers werden für diese Szene deaktiviert (variants: null).
function getGoldenLionMarkers(sceneId) {
  const scene = GOLDEN_LION_SCENES[sceneId];
  if (!scene) return [];

  const imgOverrides = scene.imgOverrides || {};
  const descOverrides = scene.descOverrides || {};
  const hiddenMarkers = scene.hiddenMarkers || [];

  return Object.keys(GOLDEN_LION_MARKERS_BASE)
    .filter(function (id) { return hiddenMarkers.indexOf(id) === -1; })
    .map(function (id) {
      const base = GOLDEN_LION_MARKERS_BASE[id];
      const hasImgOverride = Object.prototype.hasOwnProperty.call(imgOverrides, id);
      return {
        id: id,
        top: base.top,
        left: base.left,
        title: base.title,
        desc: descOverrides[id] || base.desc,
        img: imgOverrides[id] || base.img,
        variants: hasImgOverride ? null : (base.variants || null)
      };
    });
}
