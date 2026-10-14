// Szenen-Definition für die Grimsgate-Karte.
//
// Jede Szene hat eine ID, ein Label (für das Admin-Panel) und eine Liste
// von Markern, die in dieser Szene sichtbar sein sollen.
//
// Um eine neue Szene hinzuzufügen: einfach ein neues Objekt in SCENES
// ergänzen. Um einen neuen Marker (Ort) hinzuzufügen: einfach ein neues
// Objekt in die "markers"-Liste einer Szene einfügen.
//
// Marker-Felder:
//   id     - eindeutiger Bezeichner (frei wählbar, aber pro Marker einmalig)
//   top    - Position von oben in % (wie bisher per Augenmaß/Pixel ermittelt)
//   left   - Position von links in %
//   title  - Überschrift im Tooltip/Overlay
//   desc   - Beschreibungstext im Tooltip/Overlay
//   img    - Pfad des Innenraumbilds, relativ zur HTML-Seite
//            (liegt im images/-Ordner, z.B. "images/interior_heuer.webp")
//   variants (optional) - mehrere benannte Bildzustände für denselben
//            Ort, z.B. { standard: {label, img}, leer: {label, img} }.
//            Die aktive Variante wird im Admin-Panel manuell umgeschaltet
//            und wirkt sich sofort auf die Spieler-Ansicht aus - unabhängig
//            von Szenen und vom (admin-only) Trigger-System. Fehlt das
//            Feld, verhält sich der Marker exakt wie bisher.
//
// Szenen-Feld "background":
//   Pfad des Kartenbilds, auf dem die Marker dieser Szene liegen, relativ
//   zur HTML-Seite (images/-Ordner). Grimsgate (Szene "1.1") nutzt
//   images/grimsgate_map.webp. Andere Karten (z.B. das Golden-Lion-Schiff,
//   siehe golden_lion_scenes.js) haben eigene Hintergrundbilder - die
//   Spieler-Seite karte.html liest dieses Feld pro Szene aus und lädt
//   automatisch das passende Bild.
//
// Szenen-Label ohne Nummer: Die Szenen-ID (z.B. "1.1") bleibt intern
// nötig (Firebase-Pfade etc.), taucht aber im Admin-Panel nicht mehr im
// "label"-Text auf - nur noch der Ortsname (+ Zustand, falls mehrere
// Szenen sich sonst nicht unterscheiden ließen). Siehe CLAUDE.md.
//
// Frühere Szene "1.2" ("Golden Lion sichtbar") wurde hierher gemergt: Der
// einzige Unterschied zu "1.1" war ein zusätzlicher Marker
// (golden_lion) - jetzt, wo Marker einzeln live ein-/ausblendbar sind
// (hiddenMarkersLive, KAMPAGNEN-BIBEL 13.10), braucht es dafür keine
// eigene Szene mehr.

// Szenen-Feld "soundFile" (optional):
//   Dateiname einer selbst gehosteten Audiodatei (mp3/ogg/wav/m4a/aac,
//   liegt im Hauptordner, nicht in images/), die als Hintergrundgeräusch
//   für diese Szene läuft. Dient nur als Fallback/Standardwert - im
//   Admin-Panel gesetzte Werte (Firebase) haben Vorrang und übersteuern
//   dieses Feld, ohne dass die Datei hier geändert werden muss.
//   Fehlt das Feld UND ist im Admin-Panel nichts gesetzt, läuft kein Ton.
//   Beispiel: soundFile: "hafen_ambience.mp3"

const SCENES = {
  "1.1": {
    label: "Grimsgate",
    background: "images/grimsgate_map.webp",
    // Musik dieser Szene. Gehoert ins Szenenfile, nicht in die Datenbank:
    // Sie ist Inhalt des Abenteuers, kein Spielstand. Lag sie nur unter
    // sceneAudioFile in der Datenbank, hat eine neue Sitzung keine Musik.
    // Die Sound-Leiste der Regie ueberschreibt diesen Wert weiterhin live.
    soundFile: "Grimgate1.ogg",   // Hafenstadt bei Nacht
    markers: [
      {
        id: "heuer",
        top: 58.3, left: 40,
        title: "Zur letzten Heuer",
        desc: "Raue Hafenkneipe. Kaum Stammgäste — die meisten, die hier trinken, sieht man Jahre nicht wieder. Wer anheuern will, landet früher oder später hier.",
        img: "images/interior_heuer.webp"
      },
      {
        id: "hafenmeisterei",
        top: 27.5, left: 9.4,
        title: "Hafenmeisterei",
        desc: "Verwaltet Anlegerechte, Fracht und Papiere. Ordnungsmacht des Hafens.",
        img: "images/interior_hafenmeisterei.webp"
      },
      {
        id: "lagerhaeuser",
        top: 26.7, left: 26.3,
        title: "Lagerhäuser",
        desc: "Von außen chaotisch, im Kern strikt organisiert. Hier läuft die Beladung des Konvois wie ein Uhrwerk.",
        img: "images/interior_lagerhaeuser.webp"
      },
      {
        id: "markt",
        // Ein Laden: Name plus das, was er wirklich fuehrt. Staende und
        // Gebrauchtes - Waffen aus zweiter Hand, Kleidung, Vorrat. Keine
        // Feinmechanik und nichts Teures, dafuer ist der Kraemer da.
        // Auf einem Markt geht man von Stand zu Stand - deshalb Staende und
        // keine Warenarten. Die Namen sind aenderbar, die Zuordnung auch.
        laden: {
          name: "Marktplatz",
          was: "Stände, so weit man sieht. Man geht von einem zum nächsten.",
          gruppen: [
            { n: "Der Stand des Klingenhändlers",
              d: "Gebrauchtes aus Nachlässen. Er behauptet, jedes Stück habe eine Geschichte.",
              waren: ["messer", "belegnagel", "entermesser", "saebel", "enteraxt", "pike"] },
            { n: "Beim Gerber",
              d: "Riecht man, bevor man ihn sieht. Leder, Stiefel, Ölzeug.",
              waren: ["lederwams", "oelzeug", "wasserschlauch"] },
            { n: "Der Wurfeisenkarren",
              d: "Ein Alter mit einem Brett voller Klingen, die er niemandem erklärt.",
              waren: ["wurfmesser"] },
            { n: "Fisch, Brot, Fässer",
              d: "Die halbe Reihe verkauft dasselbe, und jeder schwört auf seins.",
              waren: ["proviant", "rum", "tabak"] },
            { n: "Taue und Netze",
              d: "Ein Stand für die Fischer, aber Tau ist Tau.",
              waren: ["seil", "angel", "naehzeug", "teer"] },
            { n: "Der Hausierer",
              d: "Hat keinen Stand, nur ein Brett am Bauch. Redet schneller, als man zuhören kann.",
              waren: ["amulett", "glasperlen", "spiegel", "rosenkranz", "spielkarten",
                      "wuerfelbecher"] },
            { n: "Der Trödelkarren",
              d: "Nachlässe und Strandgut. Der Händler weiß bei der Hälfte nicht, was es ist.",
              waren: ["flasche", "schluessel", "kerzen", "decke", "haengematte", "kiste"] }
          ]
        },
        top: 74.6, left: 53.2,
        title: "Marktplatz",
        desc: "Handel, Menschenmengen, guter Ort für Gerüchte und Zufallsbegegnungen.",
        img: "images/interior_markt.webp"
      },
      {
        id: "kraemerladen",
        // Was man kurz vor einer Abfahrt noch braucht und vergessen hat -
        // genau die Liste aus ORTE.kraemerladen. Keine Waffen ausser dem,
        // was ohnehin Werkzeug ist.
        // Beim Kraemer stapelt sich alles bis unter die Decke, und er findet
        // trotzdem sofort, wonach man fragt (ORTE.kraemerladen). Deshalb
        // Schubladen und Regale statt Warenarten - man fragt, er zieht auf.
        laden: {
          name: "Krämerladen",
          was: "Bis unter die Decke vollgestopft. Frag ihn, und er zieht die richtige Schublade auf.",
          gruppen: [
            { n: "Die Schublade mit dem Tauwerk",
              d: "Klemmt. Er tritt einmal dagegen, dann geht sie.",
              waren: ["seil", "enterhaken", "naehzeug", "teer"] },
            { n: "Das Regal über der Theke",
              d: "Licht und Feuer. Er langt ohne hinzusehen danach.",
              waren: ["laterne", "kerzen", "zunder"] },
            { n: "Die Kisten an der Rückwand",
              d: "Konserven, Pökelfleisch, Zwieback. Und der Rum, den er nie dazuzählt.",
              waren: ["proviant", "rum", "wasserschlauch", "tabak"] },
            { n: "Das Fach unter der Theke",
              d: "Werkzeug. Was davon auch eine Waffe ist, sagt er nicht dazu.",
              waren: ["messer", "belegnagel", "dietriche", "werkzeug"] },
            { n: "Die Vitrine beim Fenster",
              d: "Das Teure. Er wischt sie ab, bevor er aufschließt.",
              waren: ["kompass", "fernrohr", "schreibzeug", "sanduhr", "brennglas", "seekarte"] },
            { n: "Die Ecke für Seeleute",
              d: "Was an Bord gehört und sonst nirgends. Dafür kommen sie her.",
              waren: ["haengematte", "decke", "oelzeug", "kiste", "lot", "signalhorn"] },
            { n: "Hinter dem Vorhang",
              d: "Pulver hält er nicht im Laden. „Dafür gehört sich ein eigener Raum.“",
              waren: ["pulverhorn", "feuersteine"] },
            { n: "Der Kasten mit dem roten Kreuz",
              d: "„Hoffentlich brauchst du's nicht.“",
              waren: ["verband", "flasche"] }
          ]
        },
        top: 58.9, left: 49.8,
        title: "Krämerladen",
        desc: "Ausrüstung und Grundbedarf. Der Krämer hört viel — und vergisst wenig.",
        img: "images/interior_kraemerladen.webp"
      },
      {
        id: "bordell",
        top: 50.5, left: 85.1,
        title: "Bordell",
        desc: "Etwas abseits der Stadt gelegen, unauffällig. Rote Fenster, wenig Fragen.",
        img: "images/interior_bordell.webp"
      },
      {
        // Vormals eigene Szene "1.2" ("Golden Lion sichtbar") - jetzt Teil
        // von "1.1", live per Sichtbarkeits-Schalter in regie.html
        // ein-/ausblendbar (siehe Kommentar am Dateianfang). Nach diesem
        // Merge zunächst SICHTBAR wie jeder andere Marker - falls das
        // Schiff zu diesem Zeitpunkt der Kampagne noch nicht auftauchen
        // soll, im Admin-Panel einmalig ausblenden.
        id: "golden_lion",
        top: 40, left: 15,   // PLATZHALTER - Position später anpassen
        title: "Golden Lion",
        desc: "Ein stolzes kleines Kriegsschiff, mitten im Konvoi vor Anker.",
        img: "images/golden_lion.webp"
      }
    ]
  }
};

// ID der Szene, die angezeigt wird, falls (noch) keine Verbindung zu
// Firebase besteht oder noch nichts gesetzt wurde.
const DEFAULT_SCENE = "1.1";
