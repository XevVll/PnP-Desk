// Abschluss-/Erinnerungsszene (Hendriks Wunsch, 2026-08-22): Nach dem Finale
// auf der Grabesinsel laufen alle Bilder des Abenteuers noch einmal als
// Erinnerung durch und blenden ineinander - eine Art Abspann.
//
// NEUER SZENENTYP: Diese Szene hat KEINE Marker und KEINEN Hintergrund im
// ueblichen Sinn, sondern ein Feld "slideshow" (Liste von Bildpfaden).
// karte.html erkennt das Feld und zeigt statt der Marker-Karte eine
// bildschirmfuellende Ueberblend-Sequenz (siehe dort: startSlideshow()).
// Damit bleibt das MAP_REGISTRY-Muster unangetastet - jede andere Szene
// verhaelt sich unveraendert.
//
// Szenen-ID "14.1": naechste freie fuehrende Ziffer nach der Grabesinsel
// (13.x) - siehe CLAUDE.md, Szenen-ID-Konvention.
//
// REIHENFOLGE ist die Chronologie der Kampagne, nicht die Dateiordnung:
// Grimsgate -> Golden Lion -> Sturm -> Schatzinsel -> Verzweigung 1
// (Spanischer Hafen / Schmugglernest) -> Artefakthandel -> Riffinsel ->
// Einberufung -> Grabesinsel. So liest sich die Sequenz als Rueckblick auf
// die tatsaechlich gespielte Reise.
//
// TEMPO: "slideDauer" ist die Standzeit je Bild in ms, "blendDauer" die
// Ueberblendzeit. Beide hier zentral einstellbar - bei 51 Bildern ergibt
// 6500/2000 gut 5,5 Minuten, passt zur Laenge von ending.ogg.
//
// Am Ende blendet die Sequenz nach Schwarz und bleibt dort stehen (kein
// Loop) - der Abspann soll enden, nicht von vorn beginnen.
const ABSPANN_SCENES = {
  "14.1": {
    label: "Abspann — Erinnerungen",
    slideDauer: 6500,
    blendDauer: 2000,
    soundFile: "ending.ogg",
    slideshow: [
      // --- Grimsgate: der Ausgangshafen ---
      "images/grimsgate_map.webp",
      "images/interior_heuer.webp",
      "images/interior_hafenmeisterei.webp",
      "images/interior_markt.webp",
      "images/interior_kraemerladen.webp",
      "images/interior_lagerhaeuser.webp",
      "images/interior_bordell.webp",
      "images/golden_lion.webp",

      // --- Die Golden Lion, erste Bordstunden ---
      "images/golden_lion_cutaway.webp",
      "images/interior_oberdeck.webp",
      "images/interior_achterdeck.webp",
      "images/interior_bug.webp",
      "images/interior_batteriedeck.webp",
      "images/interior_unterdeck.webp",
      "images/interior_kombuese.webp",
      "images/interior_werkstatt.webp",
      "images/interior_offiziersquartier.webp",
      "images/interior_frachtraum.webp",
      "images/interior_frachtraum_leer.webp",
      "images/interior_kapitaenskajuete.webp",

      // --- Der Sturm ---
      "images/golden_lion_cutaway_sturm.webp",
      "images/interior_oberdeck_sturm.webp",
      "images/interior_achterdeck_sturm.webp",
      "images/interior_batteriedeck_sturm.webp",
      "images/interior_frachtraum_sturm.webp",
      "images/interior_kapitaenskajuete_sturm.webp",

      // --- Die Schatzinsel ---
      "images/schatzinsel.webp",
      "images/interior_schiffswrack.webp",
      "images/interior_zwischenstation.webp",
      "images/interior_stammesdorf.webp",
      "images/interior_lager.webp",
      "images/interior_hoehle.webp",

      // --- Verzweigung 1: Spanischer Hafen ---
      "images/spanischer_hafen_map.webp",
      "images/interior_hafen_arzt.webp",
      "images/interior_hafen_kneipe.webp",
      "images/interior_hafen_markt.webp",

      // --- Verzweigung 1: Schmugglernest ---
      "images/schmugglernest_map.webp",
      "images/interior_schmuggler_dorf.webp",
      "images/interior_schmuggler_hoehlenstadt.webp",
      "images/interior_schmuggler_artefakthaendler.webp",

      // --- Der Artefakthandel ---
      "images/scene_artefakthandel.webp",

      // --- Die Riffinsel ---
      "images/riffinsel.webp",
      "images/interior_riffstrand.webp",
      "images/interior_wrack.webp",
      "images/interior_quelle.webp",
      "images/interior_aussichtsklippe.webp",
      "images/interior_grotte.webp",

      // --- Die Einberufung ---
      "images/interior_kapitaenskajuete_einberufung.webp",

      // --- Die Grabesinsel ---
      "images/grabesinsel.webp",
      "images/interior_grabesstrand.webp",
      "images/interior_ritualkammer.webp"

      // --- PLATZ FUER EIGENS ERSTELLTE ABSCHLUSSBILDER ---
      // Hendrik wollte "eventuell noch 2-3 extra erstellte" Bilder am Ende.
      // Einfach hier anhaengen (mit Komma nach der Zeile darueber), z.B.:
      // "images/interior_abschied.webp",
      // Konvention: Dateiname mit "interior_" beginnen lassen, sonst kappt
      // tools/optimize_images.py auf 900px statt 1600px.
    ]
  }
};

const DEFAULT_ABSPANN_SCENE = "14.1";
