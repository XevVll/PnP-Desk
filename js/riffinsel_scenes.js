// Szenen-Definition für die Riffinsel (Bibel 7.4, "Spanischer Angriff ->
// Riffinsel"): Zufluchtsort am Ende der Flucht vor dem spanischen
// Kriegsschiff (siehe GOLDEN_LION_SCENES["10.1"], "Die Flucht"). Eine kleine,
// von einem Riff umschlossene Insel, an der das große spanische Schiff
// mangels Tiefgang nicht anlegen kann. Markiert laut Bibel das Ende von
// Session 2.
//
// Flaches Muster, 5 Marker direkt auf dem Szenenhintergrund, KEIN
// Container-Marker (siehe CLAUDE.md/Skill pnp-scene, Schritt 3).
//
// Skill-gated Erkundung (mit Hendrik abgestimmt): "riffstrand" ist von
// Anfang an sichtbar (Landepunkt/Basislager). Die vier übrigen Marker
// sollen erst auftauchen, wenn die jeweils passende Probe gelingt (siehe
// js/regie.js, ORTE-Einträge unten). Technisch KEIN neues Feature - der
// SL blendet diese vier Marker beim Szenenstart einmal manuell über den
// bestehenden Live-Sichtbarkeits-Schalter aus (hiddenMarkersLive, Bibel
// 13.10, im Adminpanel per Klick auf den Ort) und schaltet jeden einzeln
// wieder sichtbar, sobald die Gruppe ihn per Probe findet. Anders als bei
// GOLDEN_LION_SCENES gibt es hier kein statisches "hiddenMarkers"-Feld -
// das ist eine Golden-Lion-spezifische Eigenheit der Basis/Override-
// Funktion (getGoldenLionMarkers), keine generische Karten-Funktion.
//
// Szenen-ID "11.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x/10.x), Schatzinsel (4.x), Spanischer Hafen
// (7.x), Schmugglernest (8.x) und Artefakthandel (9.x) - siehe CLAUDE.md,
// Szenen-ID-Konvention.
//
// Bild: echtes Referenzbild seit 2026-08-21 (Gemini, images/riffinsel.webp) -
// zeigt eine kleine, fast vollständig vom Riff umschlossene Insel mit
// Lagune, die Golden Lion dort vor Anker, Sandstrand als Landepunkt, im
// Dschungel dahinter Quell-Becken mit Wasserfall, eine Höhle unter einem
// Wurzelvorhang, Wrackteile am Riff unten rechts und einen Felsvorsprung
// oben rechts. Marker-Koordinaten unten sind auf dieses Bild abgestimmt
// (Augenmaß anhand der Bildkomposition, siehe CLAUDE.md-Changelog
// 2026-08-21 - bei Bedarf feinjustieren).
const RIFFINSEL_SCENES = {
  "11.1": {
    label: "Riffinsel",
    background: "images/riffinsel.webp",
    markers: [
      {
        id: "riffstrand",
        top: 46, left: 49,
        title: "Der Riffstrand",
        desc: "Ein schmaler Sandstreifen, von einem vorgelagerten Riff wie von einer Mauer geschützt — dahinter tost noch immer die Brandung, hier drinnen liegt das Wasser fast still. Die Golden Lion liegt vor Anker in der kleinen Lagune, dicht genug am Ufer, dass ein Boot reicht. Der Himmel im Osten hellt sich langsam auf.",
        img: "images/riffinsel.webp"
      },
      {
        id: "suesswasserquelle",
        top: 35, left: 59,
        title: "Die Süßwasserquelle",
        desc: "Zwischen moosbewachsenen Felsen sickert klares Wasser in ein natürliches Becken, gespeist von einer kleinen Quelle weiter oben im Fels. Farne und breitblättrige Pflanzen wuchern rundherum, der Boden ist feucht und weich.",
        img: "images/riffinsel.webp"
      },
      {
        id: "wrackteile",
        top: 62, left: 71,
        title: "Wrackteile am Riff",
        desc: "Am äußeren Rand der Lagune ragen verwitterte Planken und ein halb im Sand vergrabener Rumpfteil aus dem Wasser — die Reste eines weit älteren Schiffs, das hier vor langer Zeit auf demselben Riff zerschellte. Muscheln und Algen haben sich über das meiste gelegt.",
        img: "images/riffinsel.webp"
      },
      {
        id: "aussichtsklippe",
        top: 23, left: 78,
        title: "Die Aussichtsklippe",
        desc: "Ein schroffer Felsvorsprung erhebt sich über den Rest der Insel, steil und mit nassem Gestein — aber von oben reicht der Blick weit übers offene Meer hinaus, bis dorthin, wo sich Wasser und Nebel am Horizont treffen.",
        img: "images/riffinsel.webp"
      },
      {
        id: "versteckte_grotte",
        top: 48, left: 74,
        title: "Die versteckte Grotte",
        desc: "Hinter einem Vorhang aus Luftwurzeln und dichtem Bewuchs, leicht zu übersehen, öffnet sich ein schmaler Spalt im Fels zu einer kleinen, trockenen Grotte. Drinnen ist es kühl und still, das Licht von draußen reicht nur wenige Schritte hinein.",
        img: "images/riffinsel.webp"
      }
    ]
  }
};

const DEFAULT_RIFFINSEL_SCENE = "11.1";
