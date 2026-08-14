// Szenen-Definition für den Artefakthandel (Bibel 7.3, fest - "wuchtiger
// Auftakt" von Session 2, kein freier Weg wie 7.1/8.1). Golden Lion trifft
// ein fremdes, exotisch wirkendes Schiff zum Handel.
//
// Flaches Muster, EIN einziger Marker - auf Hendriks ausdrücklichen Wunsch
// bewusst KEINE Sub-Orte für diese Szene ("Hier gibt es keine Unterorte").
//
// Szenen-ID "9.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x), Schatzinsel (4.x), Spanischer Hafen (7.x)
// und Schmugglernest (8.x) - siehe CLAUDE.md, Szenen-ID-Konvention.
//
// STAND: Ankunfts-Beat ausformuliert (siehe ORTE.handelstreffen,
// js/regie.js) - Windstille, Nebel, das fremde Schiff erscheint. Weiterhin
// offen: die eigentliche Verhandlung/das NPC-Drama und die Eskalations-/
// Massaker-Frage (Bibel 7.3/12.1). Aus dem bisherigen Gespräch mit Hendrik
// schon feststehend, noch nicht in Interaktionen gegossen: Harwick geht mit
// Cormac/Wat/Tom in die Kajüte des anderen Schiffs, während der Rest der
// Gruppe ein paar Minuten Zeit zur Vorbereitung hat, ohne zu wissen, was
// kommt.
//
// Bild: "scene_artefakthandel.webp" existiert bereits (PNG->WebP schon
// konvertiert, siehe CLAUDE.md-Changelog 14.08.) - zeigt Golden Lion neben
// dem fremden Schiff, bisher nur noch nicht verknüpft.
const ARTEFAKTHANDEL_SCENES = {
  "9.1": {
    label: "Artefakthandel",
    background: "images/scene_artefakthandel.webp",
    markers: [
      {
        id: "handelstreffen",
        top: 50, left: 50,
        title: "Das Handelstreffen",
        desc: "Die Golden Lion liegt bei Windstille reglos auf spiegelglattem Wasser. Harwick steht am Bug, den Blick unverwandt aufs offene Meer gerichtet. Nebel zieht auf, verschluckt langsam den Horizont — noch ist kein Schiff zu sehen, doch die Anspannung an Bord ist deutlich zu spüren.",
        img: "images/scene_artefakthandel.webp"
      }
    ]
  }
};

const DEFAULT_ARTEFAKTHANDEL_SCENE = "9.1";
