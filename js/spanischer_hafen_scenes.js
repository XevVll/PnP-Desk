// Szenen-Definition für den Spanischen Hafen (Bibel 7.2, Verzweigung 1 -
// einer von drei freien Wegen nach der Schatzinsel: Ezra Coombes Wundbrand
// braucht Amputation + entgiftende Arznei, siehe js/regie.js ORTE.unterdeck,
// Interaktion "ezras_wundbrand").
//
// Gleiches flaches Muster wie Grimsgate (js/scenes.js): die Szene selbst
// ist der Hintergrund (kein Container-Marker fürs "Ganze" nötig), Arzt/
// Kneipe/Markt liegen als eigenständige Haupt-Marker direkt darauf. Das
// allgemeine Hafen-Atmosphäre-Bild steckt in SZENEN_REGIE["7.1"].stimmung
// (js/regie.js), nicht in einem eigenen Marker-desc - genau wie bei
// Grimsgate.
//
// Szenen-ID "7.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x) und Schatzinsel (4.x) - siehe CLAUDE.md,
// Szenen-ID-Konvention, und der Hinweis am Ende von golden_lion_scenes.js.
//
// Bilder (August 2026): "spanischer_hafen_map.webp" ist das Szenen-
// Hintergrundbild (Kartenstil, siehe tools/optimize_images.py MAP_NAMES).
// Arzt/Kneipe/Markt haben je ein eigenes Nahaufnahme-Bild ("interior_"-
// Präfix, 1600px-Kappung).
const SPANISCHER_HAFEN_SCENES = {
  "7.1": {
    label: "Spanischer Hafen",
    background: "images/spanischer_hafen_map.webp",
    markers: [
      {
        id: "hafen_arzt",
        top: 53, left: 84,
        title: "Die Arztpraxis",
        desc: "Ein schmales Haus abseits der belebten Gassen, ein verblasstes Schild mit einem Aderlass-Symbol über der niedrigen Tür. Drinnen riecht es streng nach Alkohol und getrockneten Kräutern, chirurgische Instrumente liegen fein säuberlich auf einem Leinentuch ausgerichtet.",
        img: "images/interior_hafen_arzt.webp"
      },
      {
        id: "hafen_kneipe",
        top: 79, left: 65,
        title: "Die Kneipe",
        desc: "Eine verrauchte, überfüllte Schänke unweit des Kais — Fässer als Tische, klebriger Boden, lautes Stimmengewirr in mehreren Sprachen. An einem der vorderen Tische sitzt eine Gruppe uniformierter Soldaten, Krüge griffbereit, Blicke, die jeden Fremden abschätzend mustern.",
        img: "images/interior_hafen_kneipe.webp"
      },
      {
        id: "hafen_markt",
        top: 46, left: 58,
        title: "Der Markt",
        desc: "Ein enger Marktplatz zwischen den Gassen, dicht gedrängte Stände mit Obst, Stoffen und frischem Fisch, feilschende Stimmen von allen Seiten. Uniformierte Wachen patrouillieren in kleinen Gruppen zwischen den Ständen, ihre Blicke bleiben an jedem fremden Gesicht länger hängen als nötig.",
        img: "images/interior_hafen_markt.webp"
      }
    ]
  }
};

const DEFAULT_SPANISCHER_HAFEN_SCENE = "7.1";
