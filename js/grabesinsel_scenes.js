// Szenen-Definition für die Grabesinsel (Bibel 7.1, Station 5: "GRABESINSEL
// (fest) - Ritual + Finale, Session 3"). Das Ziel der ganzen Kampagne:
// Harwicks Ritual, das laut Bibel 12.1 scheitert und Untote/Geister
// entfesselt. Vorgeschaltet ist Szene "12.1" (Golden Lion - Die
// Einberufung), in der jeder einzeln entscheidet, ob er überhaupt mitkommt.
//
// Flaches Muster, Marker direkt auf dem Szenenhintergrund, KEIN
// Container-Marker (siehe CLAUDE.md/Skill pnp-scene, Schritt 3).
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
// STAND: Ausgearbeitet ist bisher nur die ANKUNFT (Hendriks Vorgabe vom
// 2026-08-22): der schwarze Strand mit der letzten Rückfrage, und der eine
// gangbare Weg, an dessen Ende in der Ferne ein grünlich-türkises Glühen
// steht. Was am Ende des Wegs liegt (Ritualort, Finale) ist noch nicht
// beschrieben und bekommt eigene Marker, sobald Hendrik es vorgibt.
//
// BILD: Es gibt noch kein Artwork. Bis dahin steht bewusst ein Platzhalter
// (images/schatzinsel.webp) statt eines leeren Felds - ein Marker ohne
// gueltiges img zeigt in karte.html sonst "Kein Bild hinterlegt." (siehe
// CLAUDE.md, Bild-Overlay-Fallback). Prompt fuer das echte Bild steht in
// BILD-PROMPTS.md; geplante Dateinamen: images/grabesinsel.webp
// (Uebersichtskarte) und images/interior_grabesstrand.webp /
// images/interior_schwarzer_weg.webp (Ortsbilder).
const GRABESINSEL_SCENES = {
  "13.1": {
    label: "Grabesinsel",
    background: "images/schatzinsel.webp", // PLATZHALTER, siehe Kopf
    markers: [
      // Positionen folgen Hendriks Skizze (Meereszugang unten am Fuß des
      // "Langhauses", der Weg von dort nach innen). Sobald das echte
      // Kartenbild existiert, gegen das Bild nachjustieren - siehe die
      // Marker-Kalibrierung der Riffinsel, RIFFINSEL-ERKUNDUNGSGRAPH.md 11.1.
      {
        id: "grabesstrand",
        top: 84, left: 50,
        title: "Der schwarze Strand",
        desc: "Kein Sand, sondern blanker schwarzer Fels, vom Wasser rund geschliffen. Es ist die einzige Stelle, an der man anlegen kann — ringsum fällt das Gestein steil ins Meer. Landeinwärts öffnet sich ein Tal zwischen zwei hohen, scharfkantigen Felswänden, der Boden dazwischen aus demselben schwarzen Stein. Pflanzen sind kaum zu sehen, und die wenigen sind grau.",
        img: "images/schatzinsel.webp" // PLATZHALTER
      },
      {
        id: "der_schwarze_weg",
        top: 62, left: 50,
        title: "Der schwarze Weg",
        desc: "Der Talboden aus schwarzem Fels, breit genug für mehrere nebeneinander, mit unregelmäßigen Kanten und natürlichen Bruchlinien. Rechts und links stehen die Wände zu steil, um daneben zu gehen — es gibt keinen Abzweig. Stellenweise steht der Fels in hohen schmalen Formen, die an Pfeiler denken lassen, und eine Öffnung dazwischen an einen Bogen. Weit vorn, wo das Tal endet, liegt ein grünlich-türkises Leuchten auf dem Stein, das nicht von oben kommt, sondern von irgendwo weiter unten.",
        img: "images/schatzinsel.webp" // PLATZHALTER
      },
      // Das "Kathedralenherz" (Hendriks Begriff): Das Tal endet nicht im
      // Freien, sondern muendet in eine Hoehle - dort kommt das Leuchten her.
      // Was DRINNEN liegt (Ritualort, Finale nach Bibel 12.1), ist noch nicht
      // vorgegeben; dieser Marker beschreibt vorerst nur, was von aussen zu
      // sehen ist.
      {
        id: "das_kathedralenherz",
        top: 38, left: 50,
        title: "Der Höhleneingang",
        desc: "Am Ende des Tals steht die Felswand geschlossen — bis auf eine Öffnung, hoch und unregelmäßig, in die der Talboden ohne Absatz hineinläuft. Aus ihr kommt das grünlich-türkise Licht, gleichmäßig und ohne zu flackern, und legt sich auf den Stein davor. Weiter hinein reicht der Blick nicht.",
        img: "images/schatzinsel.webp" // PLATZHALTER
      }
    ]
  }
};

const DEFAULT_GRABESINSEL_SCENE = "13.1";
