// Szenen-Definition für den Spanischen Hafen (Bibel 7.2, Verzweigung 1 -
// einer von drei freien Wegen nach der Schatzinsel: Ezra Coombes Wundbrand
// braucht Amputation + entgiftende Arznei, siehe js/regie.js ORTE.unterdeck,
// Interaktion "ezras_wundbrand").
//
// Gleiches flaches Muster wie schatzinsel_scenes.js für die Szene selbst -
// bisher nur ein einziger Szenen-Zustand, lohnt sich (noch) nicht als Basis/
// Override wie beim Schiff. Innerhalb der Szene aber Sub-Orte-Muster
// (Bibel 13.2, parentId) analog zum Thahal-Dorf auf der Schatzinsel: drei
// Marker (Arzt/Kneipe/Markt) sitzen als Hotspots im Anlegestelle-Overlay.
//
// Szenen-ID "7.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x) und Schatzinsel (4.x) - siehe CLAUDE.md,
// Szenen-ID-Konvention, und der Hinweis am Ende von golden_lion_scenes.js.
//
// Der "Weg durch die Straßen" (Ezra wird von der Anlegestelle zum Arzt
// getragen) bekommt bewusst KEINEN eigenen Marker - läuft als Interaktion
// am Eltern-Marker "hafen_anlegestelle" (js/regie.js), auf Hendriks
// ausdrücklichen Wunsch nicht als eigene Station.
//
// Bilder aller vier Marker weiterhin Platzhalter (bestehendes Grimsgate-
// Hafenmeisterei-Bild) bis eigene Referenzbilder existieren - siehe
// CLAUDE.md, "Bild-Overlay-Fallback".
const SPANISCHER_HAFEN_SCENES = {
  "7.1": {
    label: "Spanischer Hafen",
    background: "images/interior_hafenmeisterei.webp", // Platzhalter, siehe Kommentar oben
    markers: [
      {
        id: "hafen_anlegestelle",
        top: 50, left: 50,
        title: "Anlegestelle",
        desc: "Ein spanischer Hafen — Handelsschiffe liegen dicht an dicht am Kai, gestapelte Fässer und Ballen versperren stellenweise den Weg. Möwen kreischen über den Ständen der Fischer, fremde Zungen mischen sich ins allgemeine Stimmengewirr. Enge, verwinkelte Gassen ziehen sich vom Kai landeinwärts, dicht gedrängt mit niedrigen Häusern.",
        img: "images/interior_hafenmeisterei.webp" // Platzhalter, siehe Kommentar oben
      },
      {
        id: "hafen_arzt",
        parentId: "hafen_anlegestelle",
        top: 28, left: 24,
        title: "Die Arztpraxis",
        desc: "Ein schmales Haus abseits der belebten Gassen, ein verblasstes Schild mit einem Aderlass-Symbol über der niedrigen Tür. Drinnen riecht es streng nach Alkohol und getrockneten Kräutern, chirurgische Instrumente liegen fein säuberlich auf einem Leinentuch ausgerichtet.",
        img: "images/interior_hafenmeisterei.webp" // Platzhalter, siehe Kommentar oben
      },
      {
        id: "hafen_kneipe",
        parentId: "hafen_anlegestelle",
        top: 62, left: 72,
        title: "Die Kneipe",
        desc: "Eine verrauchte, überfüllte Schänke unweit des Kais — Fässer als Tische, klebriger Boden, lautes Stimmengewirr in mehreren Sprachen. An einem der vorderen Tische sitzt eine Gruppe uniformierter Soldaten, Krüge griffbereit, Blicke, die jeden Fremden abschätzend mustern.",
        img: "images/interior_hafenmeisterei.webp" // Platzhalter, siehe Kommentar oben
      },
      {
        id: "hafen_markt",
        parentId: "hafen_anlegestelle",
        top: 66, left: 30,
        title: "Der Markt",
        desc: "Ein enger Marktplatz zwischen den Gassen, dicht gedrängte Stände mit Obst, Stoffen und frischem Fisch, feilschende Stimmen von allen Seiten. Uniformierte Wachen patrouillieren in kleinen Gruppen zwischen den Ständen, ihre Blicke bleiben an jedem fremden Gesicht länger hängen als nötig.",
        img: "images/interior_hafenmeisterei.webp" // Platzhalter, siehe Kommentar oben
      }
    ]
  }
};

const DEFAULT_SPANISCHER_HAFEN_SCENE = "7.1";
