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
      {
        id: "grabesstrand",
        top: 62, left: 46,
        title: "Der schwarze Strand",
        desc: "Kein Sand, sondern schwarzer Stein, glatt geschliffen und bis ans Wasser reichend. Die Insel dahinter steigt in Stufen und schmalen Türmen auf, so regelmäßig, dass die Form von See aus an eine Kathedrale erinnert. Pflanzen sind kaum zu sehen, und die wenigen sind grau. Vom Strand führt ein gerader Weg aus demselben schwarzen Stein landeinwärts.",
        img: "images/schatzinsel.webp" // PLATZHALTER
      },
      {
        id: "der_schwarze_weg",
        top: 44, left: 52,
        title: "Der schwarze Weg",
        desc: "Ein gerader, gleichmäßig breiter Weg aus schwarzem Stein, ohne Abzweig und ohne Stufen, landeinwärts. Rechts und links steht der Fels zu steil, um daneben zu gehen. Weit vorn, dort wo der Weg zwischen den Felsen verschwindet, liegt ein grünlich-türkises Leuchten über dem Stein, das mit keiner Tageszeit zu tun hat.",
        img: "images/schatzinsel.webp" // PLATZHALTER
      }
    ]
  }
};

const DEFAULT_GRABESINSEL_SCENE = "13.1";
