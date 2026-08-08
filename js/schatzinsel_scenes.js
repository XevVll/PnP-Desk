// Szenen-Definition für die Schatzinsel-Karte.
//
// Gleiches flaches Muster wie scenes.js (nicht das Basis/Override-Muster
// aus golden_lion_scenes.js) - bisher gibt es nur einen einzigen Szenen-
// Zustand für diese Insel, daher lohnt sich die Basis/Override-Abstraktion
// (noch) nicht. Sollte die Insel später mehrere Zustände bekommen (z.B.
// "bei Tag" / "bei Nacht" mit abweichenden Bildern pro Ort), kann sie bei
// Bedarf auf das golden_lion_scenes.js-Muster umgebaut werden.
//
// Szenen-ID "4.1" (nicht "3.x"): "3.x" ist im Code bereits für Zustände
// DES SCHIFFS reserviert (2.1 Basis, 3.1 Sturm) - die Schatzinsel ist aber
// eine komplett neue Karte/Örtlichkeit, kein weiterer Schiffszustand.
// Jede neue Örtlichkeit bekommt daher eine neue führende Ziffer, genau wie
// beim Sprung von Grimsgate (1.x) zum Schiff (2.x).
//
// Marker-Felder: siehe scenes.js (id/top/left/title/desc/img/variants).
//
// WICHTIG für "desc"-Texte: reine Ort-/Stimmungsbeschreibung, kein
// Handlungsauftrag, kein Plot-Wissen, das Spieler an diesem Punkt noch
// nicht haben können, keine vorweggenommenen NPC-Ziele - siehe
// KAMPAGNEN-BIBEL 2.8 ("Marker-Beschreibungen: Ort statt Plot"). GM-only
// Hintergrundwissen gehört in regie.js (Ort-Notizen), sobald diese Orte
// dort ausgearbeitet werden - nicht hierher.
//
// Ablaufreihenfolge der Dorf-Expedition (siehe Bewegung auf der Karte):
// schiffswrack -> zwischenstation -> stammesdorf -> (danach erst) lager.
// Fünf Marker: Schiffswrack (Strand, unten rechts), Zwischenstation (Pfad
// landeinwärts, Höhe des toten Baums), Stammesdorf (beim knorrigen Baum,
// oben mittig), Nachtlager (dicht neben dem Dorf, erst nach dem ersten
// Dorfbesuch relevant) und Höhle (Felshöhlen an der Westklippe, unten
// links) - Positionen anhand von images/schatzinsel.webp geschätzt, bei
// Bedarf im Admin-Panel live nachjustieren.
//
// Alle fünf Marker haben inzwischen eigene Referenzbilder (Gemini-Pipeline,
// KAMPAGNEN-BIBEL 14) und ausformulierte Beschreibungen.
//
// Alle fünf Marker sind über den Sichtbarkeits-Schalter im Admin-Panel
// (regie.html) einzeln live ein-/ausblendbar (KAMPAGNEN-BIBEL 13.10,
// "hiddenMarkersLive") - so lässt sich die Dorf-Expedition schrittweise
// aufdecken, ohne dass jeder neue Ort einen Codedeploy braucht.
//
// Bewusst KEINE Interaktionen/Trigger in regie.js für die neuen Marker -
// Diebstahl/Aufhetzen-Handel/Gewalt laufen über das normale
// Erfolg/Misserfolg-Probensystem (Bibel 4.1), Schwierigkeit legt Hendrik
// spontan am Tisch fest, nicht der Code.

const SCHATZINSEL_SCENES = {
  "4.1": {
    label: "Schatzinsel (Strandung)",
    background: "images/schatzinsel.webp",
    soundFile: "island1.ogg",
    markers: [
      {
        id: "schiffswrack",
        top: 70, left: 73,
        title: "Die gestrandete Golden Lion",
        desc: "Die Golden Lion liegt zerzaust in einer sandigen Bucht auf der Seite, der vordere Mast gebrochen, der Rumpf übel zugerichtet. Tauwerk und Trümmer verteilen sich über den Strand. Die Crew ist bereits mitten in den Reparaturarbeiten — Balken werden herangeschafft, der Schmied schlägt am improvisierten Amboss Beschläge zurecht, Leitern lehnen am Rumpf. Für die meisten an Bord wirkt es wie reines Glück, hier überhaupt festen Boden unter den Füßen zu haben.",
        img: "images/interior_schiffswrack.webp"
      },
      {
        id: "zwischenstation",
        top: 45, left: 62,
        title: "Der Pfad zum toten Baum",
        desc: "Ein schmaler Trampelpfad schneidet sich durch dichtes Unterholz, von Farnen und breiten Palmwedeln fast überwuchert. Hohe Bäume schließen sich über dem Weg zu einem grünen Dach, nur vereinzelt fällt Licht schräg durchs Blätterwerk. Insekten surren, schwere, feuchte Luft hängt zwischen den Stämmen. Voraus hellt sich der Wald auf, dort, wo der Pfad auf eine Lichtung zuläuft.",
        img: "images/interior_zwischenstation.webp"
      },
      {
        id: "stammesdorf",
        top: 24, left: 59,
        title: "Das Dorf am knorrigen Baum",
        desc: "Zwischen kunstvoll gebauten Hütten aus Holz und Palmblatt, in geschwungenen, fast organischen Formen, öffnet sich die Lichtung um einen tempelartigen Steinbau. Kein Stück Metall ist zu sehen — Schmuck und Werkzeug sind durchweg aus Holz gearbeitet. Am Fuß der Freitreppe steht der Häuptling, unbewegt, den Blick wenig freundlich auf die Fremden gerichtet.",
        img: "images/interior_stammesdorf.webp"
      },
      // Vier Sub-Orte INNERHALB des Dorfbildes (parentId: "stammesdorf") -
      // erscheinen nicht auf der Hauptkarte, sondern als Hotspots im
      // Dorf-Overlay (siehe karte.html, renderSubMarkers). Bibel 2.9: das
      // Dorf soll sich wie ein "Haufen Mini-Quests" anfühlen statt einer
      // einzigen langen Erzählphase. Positionen anhand des echten
      // Referenzbilds (interior_stammesdorf.webp) mit Hendrik abgestimmt
      // (08/2026) - Tempel auf dem Steinbau, Dorfplatz bei der Hütte mit
      // Feuer im Vordergrund links, Heilerin beim Baumhaus-Cluster oben,
      // Markt zentral/tiefer im Dorf (eigene Fläche, kein markierter Punkt
      // im Referenzbild). "img" ist bewusst vorerst das Dorf-Übersichtsbild
      // selbst als Platzhalter (statt unpassender fremder Marker-Bilder) -
      // eigene Detailbilder pro Sub-Ort folgen über die Asset-Pipeline.
      {
        id: "dorf_platz",
        parentId: "stammesdorf",
        top: 47, left: 27,
        title: "Der Dorfplatz",
        desc: "Der freie Platz vor der Freitreppe des Steinbaus ist das Herz des Dorfes — hier wird gekocht, gearbeitet, erzählt. Kinder flitzen zwischen den Beinen der Erwachsenen hindurch, während Alte im Schatten der Hütten sitzen und jede Bewegung der Fremden beobachten.",
        img: "images/interior_stammesdorf.webp"
      },
      {
        id: "dorf_markt",
        parentId: "stammesdorf",
        top: 55, left: 48,
        title: "Der Handelsbereich",
        desc: "Geflochtene Matten liegen ausgebreitet, beladen mit getrockneten Früchten, geschnitzten Werkzeugen und Fanggerät. Ein reger, informeller Tauschhandel läuft zwischen den Ständen — Blicke wandern neugierig zu den Fremden und ihrer ungewohnten Ausrüstung.",
        img: "images/interior_stammesdorf.webp"
      },
      {
        id: "dorf_heilerin",
        parentId: "stammesdorf",
        top: 8, left: 44,
        title: "Die Hütte der Heilerin",
        desc: "Getrocknete Kräuterbündel hängen dicht unter dem Dach, der Geruch von Rauch und bitteren Pflanzenölen liegt schwer im Raum. Schalen mit zerstoßenen Blättern und Wurzeln stehen aufgereiht neben einer niedrigen Feuerstelle.",
        img: "images/interior_stammesdorf.webp"
      },
      {
        id: "dorf_tempel",
        parentId: "stammesdorf",
        top: 32, left: 48,
        title: "Der Tempel",
        desc: "Der tempelartige Steinbau, teilweise aus behauenem Fels errichtet, wirkt neben den Holzhütten fremd und alt. Durch eine schmale Öffnung im Dach fällt Licht auf eine Wasserfläche im Inneren — Sonne und Mond spiegeln sich darin und werfen einen Schimmer, der an Gold und Silber erinnert.",
        img: "images/interior_stammesdorf.webp"
      },
      {
        // Erst NACH dem ersten Dorfbesuch relevant/aufzuschlagen, nicht auf
        // dem Hinweg (siehe Ablaufreihenfolge oben). Funktional künftig
        // wichtig: hier kontaktiert der Thahal-Helfer die Spieler nachts
        // heimlich (einziger Zugang zu den Routen "Diebstahl" und
        // "Aufhetzen") - bewusst noch kein Trigger/Mechanik dafür, nur als
        // Notiz vermerkt.
        id: "lager",
        top: 27, left: 52,
        title: "Nachtlager am Dorfrand",
        desc: "Eine drückende Stille liegt über dem improvisierten Lager. Am Feuer starrt Cormac seit geraumer Zeit den Kapitän an, der gedankenverloren seinen Degen betrachtet. Dahinter liegt der Dschungel vollkommen dunkel und still.",
        img: "images/interior_lager.webp"
      },
      {
        id: "hoehle",
        top: 58, left: 14,
        title: "Die Wasserhöhle",
        desc: "In die zerklüfteten Klippen an der Westseite der Insel fressen sich zwei Öffnungen, die sich im Inneren zu einer einzigen, weitläufigen Höhle verbinden — die trennende Wand ist längst der Brandung zum Opfer gefallen. Nur mit dem Boot und bei ablaufendem Wasser ist der Zugang zu wagen.",
        img: "images/interior_hoehle.webp"
      }
    ]
  }
};

// ID der Szene, die angezeigt wird, falls (noch) keine Verbindung zu
// Firebase besteht oder noch nichts gesetzt wurde. Wird von karte.html/
// regie.html NICHT automatisch als globaler Fallback genutzt (das bleibt
// DEFAULT_SCENE = "1.1", siehe karte.html) - dient hier nur als
// Referenzwert für eine mögliche künftige Verwendung.
const DEFAULT_SCHATZINSEL_SCENE = "4.1";
