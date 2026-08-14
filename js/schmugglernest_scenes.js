// Szenen-Definition für das Schmugglernest (Bibel 7.2, Verzweigung 1 -
// einer von drei freien Wegen nach der Schatzinsel: "Untergrundwissen /
// Artefakt", schaltet später die Schamanen-Insel frei, Bibel 7.4; Bibel 12:
// moralisch schwerster, aber mechanisch bester Weg - kostet Ezra Coombes
// beste Überlebenschance, siehe js/regie.js ORTE.kapitaenskajuete/unterdeck).
//
// Gleiches flaches Muster wie schatzinsel_scenes.js für die Szene selbst,
// aber Sub-Orte-Muster (Bibel 13.2, parentId) innerhalb - analog zu
// spanischer_hafen_scenes.js.
//
// Szenen-ID "8.1": nächste freie führende Ziffer, siehe Kommentar in
// spanischer_hafen_scenes.js und golden_lion_scenes.js.
//
// WICHTIG (Hendriks Vorgabe): der Eltern-Marker "schmuggler_lager" zeigt sich
// den Spielern zunächst NUR als unauffälliges Fischerdorf - title/desc
// verraten bewusst nichts vom Schmugglernest darunter (Design-Regel 2.8,
// Marker-desc = Ort/Stimmung, kein Plot). Die auffälligen Wohlstands-Details
// an den drei Dorfbewohnern sind rein sensorisch beschrieben, ihre Bedeutung
// erschließt sich den Spielern selbst.
//
// Der Eisschrank (Kohle-Rätsel, Treppe, Stahltür, Waffenkontrolle) bekommt
// bewusst KEINEN eigenen Marker (Hendriks Korrektur) - läuft als zweite
// Interaktion am Marker "schmuggler_lager" (js/regie.js), analog zum "Weg
// durch die Straßen" in 7.1. Der Artefakthändler dagegen bekommt einen
// eigenen Punkt, weil er als Zielort der Diebstahl/Verfolgungsjagd-Szene
// (ORTE.schmuggler_hoehlenstadt) eigenständig anwählbar sein soll.
//
// Technischer Hinweis: Sub-Orte können nur EINE Ebene tief verschachtelt
// werden (karte.html rendert Kind-Marker nur für den gerade geöffneten
// Eltern-Marker, kein rekursives Öffnen). Deshalb hängt "schmuggler_
// artefakthaendler" trotz inhaltlicher Nähe zur Höhlenstadt technisch direkt
// an "schmuggler_lager", nicht an "schmuggler_hoehlenstadt".
//
// Bilder (August 2026): "schmugglernest_map.webp" ist das Szenen-
// Hintergrundbild (Kartenstil, siehe tools/optimize_images.py MAP_NAMES).
// "schmuggler_lager" (der Eltern-Marker) zeigt beim Anklicken bewusst ein
// EIGENES Nahaufnahme-Bild (interior_schmuggler_dorf.webp - die Fischerdorf-
// Szene mit den drei auffälligen Dorfbewohnern aus der Marker-Beschreibung),
// nicht das Kartenbild. Die zwei Sub-Orte haben je ihr eigenes
// Nahaufnahme-Bild.
const SCHMUGGLERNEST_SCENES = {
  "8.1": {
    label: "Schmugglernest",
    background: "images/schmugglernest_map.webp",
    markers: [
      {
        id: "schmuggler_lager",
        top: 50, left: 50,
        title: "Kleines Fischerdorf",
        desc: "Ein verschlafenes Fischerdorf zwischen kargen Feldern und Küste — windschiefe Hütten, Netze zum Trocknen aufgehängt, der Geruch von Salz und Fisch in der Luft. Eine Frau entsorgt am Ufer Fischköpfe, um ihren Hals blitzt eine auffällig prunkvolle, juwelenbesetzte Kette. Vor der kleinen Backstube sitzt ein Bäcker, seine Brille in einen goldenen Rahmen gefasst. Ein alter Mann stützt sich auf einen Gehstock, dessen Knauf im Licht wie seltenes Metall schimmert. Alle grüßen freundlich, bleiben aber bei oberflächlichen Floskeln. In unregelmäßigen Abständen ist ein dumpfes Donnern zu hören, der Boden bebt für einen Moment — niemand im Dorf scheint das zu bemerken.",
        img: "images/interior_schmuggler_dorf.webp"
      },
      {
        id: "schmuggler_hoehlenstadt",
        parentId: "schmuggler_lager",
        top: 42, left: 68,
        title: "Die Höhlenstadt",
        desc: "Eine gewaltige Höhle öffnet sich im Innern des Felsens, ein großer See erstreckt sich über einen Großteil der Fläche, über eine schmale Zufahrt mit dem offenen Meer verbunden. Auf Holzgerüsten, halb an die Felswand gebaut, halb über dem Wasser, drängen sich Buden und Häuser dicht an dicht, erhellt von unzähligen Fackeln und Lampen. Mehrere Schiffe liegen vertäut, eines mitten auf dem See beschießt in regelmäßigen Abständen entfernte Ziele auf hohen Pfählen — das dumpfe Donnern und leichte Beben von oben. Stimmengewirr, Musik und geschäftiges Feilschen erfüllen die Luft, ein ausladender Markt zieht sich durch die Gassen.",
        img: "images/interior_schmuggler_hoehlenstadt.webp"
      },
      {
        id: "schmuggler_artefakthaendler",
        parentId: "schmuggler_lager",
        top: 60, left: 78,
        title: "Der Artefakthändler",
        desc: "Ein kleiner Laden, eingeklemmt zwischen zwei größeren Buden am Rand der Holzstadt, die Fensterläden nur angelehnt. Drinnen stapeln sich Kisten und Regale voller ungewöhnlicher Fundstücke, das Licht einer einzelnen Lampe wirft lange Schatten zwischen den Objekten.",
        img: "images/interior_schmuggler_artefakthaendler.webp"
      }
    ]
  }
};

const DEFAULT_SCHMUGGLERNEST_SCENE = "8.1";
