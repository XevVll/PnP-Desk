// Szenen-Definition für die Grabesinsel (Bibel 7.1, Station 5: "GRABESINSEL
// (fest) - Ritual + Finale, Session 3"). Das Ziel der ganzen Kampagne:
// Harwicks Ritual, das laut Bibel 12.1 scheitert und Untote/Geister
// entfesselt. Vorgeschaltet ist Szene "12.1" (Golden Lion - Die
// Einberufung), in der jeder einzeln entscheidet, ob er überhaupt mitkommt.
//
// Flaches Muster, Marker direkt auf dem Szenenhintergrund, KEIN
// Container-Marker (siehe CLAUDE.md/Skill pnp-scene, Schritt 3).
//
// GENAU ZWEI ORTE (Hendriks Vorgabe, 2026-08-22): der schwarze Strand und die
// Ritualkammer. Der Weg dorthin und der Hoehleneingang hatten kurzzeitig
// eigene Marker, haben aber keine eigene Entscheidung und keinen eigenen
// Aufenthalt getragen - beides laeuft jetzt als Uebergangs-Interaktion
// "Der Weg zur Hoehle" am Strand (js/regie.js, ORTE.grabesstrand).
//
// BEWUSST KEIN Erkundungs-Graph (anders als die Riffinsel, "11.1"): Auf
// dieser Insel gibt es laut Hendriks Vorgabe genau EINEN gangbaren Weg -
// es gibt nichts zu erkunden und nichts zu wählen. Ein Graph mit einem
// einzigen Pfad wäre nur Mechanik ohne Entscheidung.
//
// Szenen-ID "13.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x/10.x/12.x), Schatzinsel (4.x), Spanischer
// Hafen (7.x), Schmugglernest (8.x), Artefakthandel (9.x) und Riffinsel
// (11.x) - siehe CLAUDE.md, Szenen-ID-Konvention.
//
// FORM DER INSEL (Hendriks Skizze, 2026-08-22): Scharfkantige Bergruecken
// umschliessen ein Tal, dessen Grundriss ein Kreuz bildet - ein langes
// "Langhaus" vom Meer nach innen, zwei kuerzere Querarme, ein runder Kopf am
// Ende. Die Kathedralen-Anmutung entsteht damit AUS DER NATUERLICHEN
// GELAENDEFORM, nicht aus einem Bauwerk: kein Mauerwerk, keine Treppen,
// keine Ruine, nur minimale Andeutungen (Fels, der zufaellig wie Pfeiler
// oder ein Bogen steht) und die verschmelzen mit dem Gestein. Genau EIN
// Zugang zum Meer, am Fuss des Langhauses; das Leuchten sitzt an der
// Vierung. Bildprompt dazu in BILD-PROMPTS.md.
//
// STAND: Ausgearbeitet ist der Weg bis zur Ritualkammer (Hendriks Vorgaben
// vom 2026-08-22): schwarzer Strand mit der letzten Rückfrage, der eine
// gangbare Weg, der Höhleneingang, und die Kammer mit Jessica auf der
// steinernen Anhöhe. Was DANN geschieht - das Ritual selbst, sein Scheitern,
// die Untoten und der Endkampf (Bibel 12.1) - ist noch nicht vorgegeben und
// bekommt eigene Interaktionen, sobald Hendrik es liefert.
//
// BILDER: Übersichtskarte (images/grabesinsel.webp, 1920px - dafür steht
// 'grabesinsel.png' in MAP_NAMES, tools/optimize_images.py) und Strandbild
// (images/interior_grabesstrand.webp) sind da; das Strandbild zeigt das Tal
// mit Blick auf das Leuchten und wird deshalb auch vom Weg-Marker genutzt.
// Die Ritualkammer hat ihr eigenes Bild (images/interior_ritualkammer.webp).
// Nur der Höhleneingang hat noch KEINS und zeigt vorerst das Kartenbild -
// ein Marker ohne gueltiges img zeigt in karte.html sonst "Kein Bild
// hinterlegt." (siehe CLAUDE.md, Bild-Overlay-Fallback). Alle Prompts stehen
// in BILD-PROMPTS.md.
const GRABESINSEL_SCENES = {
  "13.1": {
    label: "Grabesinsel",
    background: "images/grabesinsel.webp",
    markers: [
      // Positionen folgen Hendriks Skizze (Meereszugang unten am Fuß des
      // "Langhauses", der Weg von dort nach innen). Sobald das echte
      // Kartenbild existiert, gegen das Bild nachjustieren - siehe die
      // Marker-Kalibrierung der Riffinsel, RIFFINSEL-ERKUNDUNGSGRAPH.md 11.1.
      {
        id: "grabesstrand",
        top: 79, left: 44,
        title: "Der schwarze Strand",
        desc: "Kein Sand, sondern blanker schwarzer Fels, vom Wasser rund geschliffen. Es ist die einzige Stelle, an der man anlegen kann — ringsum fällt das Gestein steil ins Meer. Landeinwärts öffnet sich ein Tal zwischen zwei hohen, scharfkantigen Felswänden, der Boden dazwischen aus demselben schwarzen Stein. Pflanzen sind kaum zu sehen, und die wenigen sind grau.",
        img: "images/interior_grabesstrand.webp"
      },
      // Die Ritualkammer im Inneren (Hendriks Vorgabe, 2026-08-22). Sollte
      // beim Szenenstart ueber hiddenMarkersLive ausgeblendet sein und erst
      // eingeblendet werden, wenn die Gruppe die Hoehle tatsaechlich betritt -
      // sonst verraet der Pin auf der Karte den Fund vorzeitig (gleiches
      // Vorgehen wie bei den Riffinsel-Fundstellen, Bibel 13.10).
      {
        id: "die_ritualkammer",
        top: 17, left: 71,
        title: "Die Ritualkammer",
        desc: "Der Gang öffnet sich in eine Halle, die größer ist als alles, was auf diese Insel passt. Kein Ende, keine Decke — der Fels steigt in Rippen und Pfeilern auf und verliert sich, lange bevor das Licht ihn erreicht. Die Kanten sind scharf und gerade, wie geschlagen, und brechen daneben roh aus dem Stein. Weit drinnen erhebt sich eine flache Anhöhe aus dem Boden, kaum kniehoch, mit weichen Kanten. Darauf liegt ein Kind.",
        img: "images/interior_ritualkammer.webp"
      }
    ]
  }
};

const DEFAULT_GRABESINSEL_SCENE = "13.1";
