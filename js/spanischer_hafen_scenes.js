// Szenen-Definition für den Spanischen Hafen (Bibel 7.2, Verzweigung 1 -
// einer von drei freien Wegen nach der Schatzinsel: Ezra Coombes Wundbrand
// braucht Amputation + entgiftende Arznei, siehe js/regie.js ORTE.unterdeck,
// Interaktion "ezras_wundbrand").
//
// Gleiches flaches Muster wie schatzinsel_scenes.js für die Szene selbst -
// bisher nur ein einziger Szenen-Zustand, lohnt sich (noch) nicht als Basis/
// Override wie beim Schiff.
//
// Szenen-ID "7.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x) und Schatzinsel (4.x) - siehe CLAUDE.md,
// Szenen-ID-Konvention, und der Hinweis am Ende von golden_lion_scenes.js.
//
// Struktur (August 2026, Hendriks Korrektur): Arzt/Kneipe/Markt sind eigene
// Haupt-Marker, direkt auf der Hauptkarte sichtbar - kein Sub-Orte-Overlay
// mehr. "hafen_anlegestelle" existiert als Marker WEITER (trägt die
// Interaktionen "Francesco vorher fragen" und "Der Weg durch die Straßen",
// js/regie.js), soll aber selbst KEIN eigener Punkt auf der Karte sein.
//
// WICHTIG für die Spielleitung: "hafen_anlegestelle" über den Live-
// Sichtbarkeits-Schalter (hiddenMarkersLive, regie.html) dauerhaft vor
// Spielern ausblenden. Der Marker bleibt nur bestehen, damit seine beiden
// Interaktionen im Admin-Panel erreichbar sind (Panel listet Interaktionen
// je Marker der Szene, siehe js/regie_vault.js getMarkersForScene) - für
// Spieler soll er nie als klickbarer Punkt erscheinen.
//
// Bilder (August 2026): "spanischer_hafen_map.webp" ist das Szenen-
// Hintergrundbild (Kartenstil, siehe tools/optimize_images.py MAP_NAMES),
// dient zugleich als img-Platzhalter für den unsichtbaren
// "hafen_anlegestelle"-Marker. Arzt/Kneipe/Markt haben je ein eigenes
// Nahaufnahme-Bild ("interior_"-Präfix, 1600px-Kappung).
const SPANISCHER_HAFEN_SCENES = {
  "7.1": {
    label: "Spanischer Hafen",
    background: "images/spanischer_hafen_map.webp",
    markers: [
      {
        id: "hafen_anlegestelle",
        top: 50, left: 50,
        title: "Anlegestelle",
        desc: "Ein spanischer Hafen — Handelsschiffe liegen dicht an dicht am Kai, gestapelte Fässer und Ballen versperren stellenweise den Weg. Möwen kreischen über den Ständen der Fischer, fremde Zungen mischen sich ins allgemeine Stimmengewirr. Enge, verwinkelte Gassen ziehen sich vom Kai landeinwärts, dicht gedrängt mit niedrigen Häusern.",
        img: "images/spanischer_hafen_map.webp"
      },
      {
        id: "hafen_arzt",
        top: 35, left: 55,
        title: "Die Arztpraxis",
        desc: "Ein schmales Haus abseits der belebten Gassen, ein verblasstes Schild mit einem Aderlass-Symbol über der niedrigen Tür. Drinnen riecht es streng nach Alkohol und getrockneten Kräutern, chirurgische Instrumente liegen fein säuberlich auf einem Leinentuch ausgerichtet.",
        img: "images/interior_hafen_arzt.webp"
      },
      {
        id: "hafen_kneipe",
        top: 60, left: 75,
        title: "Die Kneipe",
        desc: "Eine verrauchte, überfüllte Schänke unweit des Kais — Fässer als Tische, klebriger Boden, lautes Stimmengewirr in mehreren Sprachen. An einem der vorderen Tische sitzt eine Gruppe uniformierter Soldaten, Krüge griffbereit, Blicke, die jeden Fremden abschätzend mustern.",
        img: "images/interior_hafen_kneipe.webp"
      },
      {
        id: "hafen_markt",
        top: 65, left: 40,
        title: "Der Markt",
        desc: "Ein enger Marktplatz zwischen den Gassen, dicht gedrängte Stände mit Obst, Stoffen und frischem Fisch, feilschende Stimmen von allen Seiten. Uniformierte Wachen patrouillieren in kleinen Gruppen zwischen den Ständen, ihre Blicke bleiben an jedem fremden Gesicht länger hängen als nötig.",
        img: "images/interior_hafen_markt.webp"
      }
    ]
  }
};

const DEFAULT_SPANISCHER_HAFEN_SCENE = "7.1";
