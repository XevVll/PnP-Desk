// Regie-Daten für die Admin-Ansicht: Inhalte pro Ort.
//
// Orte sind FLACH definiert (eine Definition pro Ort-ID), nicht pro Szene -
// ein Ort wie "heuer" bleibt inhaltlich gleich, unabhängig davon, in
// welcher Szene die Karte gerade ist. WELCHE Orte in einer Szene auftauchen,
// bestimmt weiterhin allein scenes.js (SCENES[sceneId].markers) - die
// Admin-Ansicht zeigt für die gewählte Szene also automatisch nur die dort
// vorhandenen Marker, nachgeschlagen in ORTE.
//
// WICHTIG: Diese Datei enthält nur STATISCHE Inhalte (Texte, Trigger-
// Definitionen). Der dynamische Teil (welcher Trigger ausgelöst wurde,
// was in den Notizfeldern steht) liegt in Firebase unter
// "regie/{szeneId}/{ortId}/..." - pro Szene getrennt gespeichert, falls
// z.B. ein Ort in mehreren Szenen mit unterschiedlichem Zustand vorkommt.
//
// Um einen Ort auszuformulieren: "interaktionen" befüllen. Orte ohne
// Interaktionen werden in der Admin-Ansicht als "noch nicht ausformuliert"
// angezeigt.
//
// Trigger-Felder:
//   id    - eindeutiger Bezeichner innerhalb der Interaktion (Firebase-Pfad)
//   label - Anzeigetext in der Admin-Ansicht
//
// Interaktions-Feld "nurSzenen" (optional, z.B. bei "kanone_sturm" genutzt):
//   Liste von Szenen-IDs, z.B. ["3.1"]. Ist das Feld gesetzt, taucht diese
//   Interaktion im Admin-Panel NUR auf, wenn genau eine dieser Szenen
//   gerade betrachtet wird (gefiltert in regie.html über
//   getSceneInteraktionen()). Fehlt das Feld, ist die Interaktion wie
//   bisher in JEDER Szene sichtbar - wichtig für Orte wie Batteriedeck
//   oder Frachtraum, die in mehreren Szenen vorkommen, aber dort
//   TEILWEISE unterschiedliche Interaktionen haben (z.B. Dirks
//   Fachkenntnis-Vertrauen gilt immer, die losgerissene Kanone nur im
//   Sturm).
//
// Interaktions-Feld "nichtInSzenen" (Gegenstück, z.B. bei "dirk_vertrauen"
// genutzt): Liste von Szenen-IDs, in denen diese Interaktion AUSGESETZT
// ist, sonst aber überall gilt. Dirk ist im Sturm mit anderem beschäftigt
// (siehe "kanone_sturm") und daher während "3.1" nicht für seine normale
// Fachkenntnis-Prüfung ansprechbar - in jeder anderen Szene (auch
// zukünftigen) aber schon, ohne dass die Liste dafür gepflegt werden muss.
//
// Ort-Feld "szenenUeberschreibungen" (optional, Juli 2026, z.B. bei
// "achterdeck"/"oberdeck"/"batteriedeck"/"frachtraum" für Szene "3.1"
// genutzt): { [sceneId]: { personen?, kurz?, ortHinweis? } }. Ein Ort
// bleibt zwar weiterhin FLACH definiert (s.o.), aber personen/kurz/
// ortHinweis beschreiben oft nur den ruhigen Grundzustand - in einer
// inhaltlich komplett anderen Szene (z.B. dem Sturm) wäre es irreführend,
// dieselbe Zusammenfassung weiter anzuzeigen. Ist für die aktuelle Szene
// ein Override gesetzt, ersetzt er NUR die angegebenen Felder (gefiltert
// in regie.html über resolveOrtForScene()); fehlende Felder fallen auf
// den Basiswert zurück. "interaktionen" ist davon unabhängig und bleibt
// weiterhin über nurSzenen/nichtInSzenen gesteuert.

const ORTE = {
  "heuer": {
    personen: "Francesco · Tom Fletcher · Trewin-Zwillinge · Wat",
    kurz: "Ort zum Rekrutieren. Vier Wege an Bord, mit Fallback-Loop und Wat als letzte Instanz.",
    ortHinweis: "Fallback-Loop: Lehnt der Spieler Tom ab, fängt Francesco ihn ein zweites Mal ab (Gewinn feiern / Verlust ertränken). Erst wenn auch das scheitert, steht der Spieler draußen Walter gegenüber.",
    interaktionen: {
      "francesco": {
        title: "Francesco — Verlockung",
        kurz: "Rum, Charme, beschönigte Fahrt. Freiwilliger Zugang. Kein Ruf.",
        details: "Ein südländischer Mann, weißes Hemd, buntes Halstuch, spricht Spieler proaktiv an. Schenkt hochwertigen Rum aus eigener Flasche, beschönigt die Fahrt (schnelles Geld, kaum Risiko, fast Urlaub in den Tropen). Kein Druck, kein Zeitlimit.\n\n„Setz dich, mein Freund — der hier ist besser als alles, was du unten bestellen würdest.“\n\nNimmt der Spieler an → Anheuerung, gute Konditionen.\nLehnt ab → Francesco lässt locker, bleibt sichtbar (Fallback-Loop nach Tom).",
        trigger: [
          { id: "angenommen", label: "Angebot angenommen", info: "Ein südländischer Mann, weißes Hemd, buntes Halstuch, spricht proaktiv an, schenkt hochwertigen Rum aus eigener Flasche: „Setz dich, mein Freund — der hier ist besser als alles, was du unten bestellen würdest.“ Nimmt der Spieler an → Anheuerung, gute Konditionen." },
          { id: "abgelehnt_1", label: "Angebot abgelehnt (erstes Mal)", info: "Lehnt der Spieler ab, lässt Francesco locker — bleibt aber sichtbar." },
          { id: "fallback", label: "Fallback-Loop ausgelöst (nach Tom)", info: "Fallback-Loop: Francesco fängt den Spieler ein zweites Mal ab, nachdem auch Tom gescheitert ist (Gewinn feiern / Verlust ertränken)." }
        ]
      },
      "tom": {
        title: "Tom Fletcher — Liar's Dice",
        kurz: "Gezinktes Würfelspiel (Meiern-Regeln), Eskalation, Anheuerung als Schuldentilgung. Kein Ruf.",
        details: "Tom spielt mit ranghöheren Männern eines anderen Schiffes „Liar's Dice“ — jeder würfelt verdeckt (`!roll 2d6`), nennt dann laut ein Ergebnis, das er selbst gewürfelt haben will. Pasch schlägt Summe, (2,1)/„Mariner“ schlägt alles. Wer dem Vorgänger nicht glaubt, deckt auf: stimmt die Angabe, verliert der Zweifler; lügt der Vorgänger, verliert er. Tom hat gezinkte Würfel und lügt bei Bedarf schamlos weiter, auch wenn aufgedeckt wird.\n\nSpieler verliert 1-2× harmlos, Tom erhöht den Einsatz, lässt zwischendurch gewinnen, dann Alles-oder-Nichts.\n\n„Junge! Heute ist dein Glückstag! Du kannst doch jetzt nicht aufhören!“\n\nEchter Ausstieg vor dem finalen Einsatz jederzeit möglich. Verliert final → Angebot übersteigt den Verlust, Aufforderung mit an Bord zu kommen.",
        trigger: [
          { id: "einstieg", label: "Spieler steigt ein", info: "Tom spielt mit ranghöheren Männern eines anderen Schiffes „Liar's Dice“ — jeder würfelt verdeckt, nennt dann laut ein Ergebnis, das er selbst gewürfelt haben will. Tom hat gezinkte Würfel und lügt bei Bedarf schamlos weiter." },
          { id: "vorzeitig_aus", label: "Spieler steigt vorzeitig aus", info: "Ein echter Ausstieg vor dem finalen Einsatz ist jederzeit möglich." },
          { id: "finaler_verlust", label: "Finaler Verlust — Angebot gemacht", info: "Spieler verliert 1-2× harmlos, Tom erhöht den Einsatz, lässt zwischendurch gewinnen, dann Alles-oder-Nichts: „Junge! Heute ist dein Glückstag! Du kannst doch jetzt nicht aufhören!“" },
          { id: "angebot_reaktion", label: "Angebot angenommen / abgelehnt", info: "Verliert der Spieler final, übersteigt das Angebot den Verlust — Aufforderung, mit an Bord zu kommen." }
        ]
      },
      "zwillinge": {
        title: "Trewin-Zwillinge — Trinkspiel",
        kurz: "Probe: Körper (alt. Auftreten). Einziger Weg mit Rufgewinn.",
        details: "Zwei baugleiche, laute Brüder ziehen komödiantisch Aufmerksamkeit auf sich, fordern zum Trinkspiel heraus. Schaulustige feuern an.\n\n„He, du da! Bist du ein Mann oder ein Fass mit Beinen? Zeig's uns!“\n\nProbe: Körper (Standhaltevermögen)\n— Guter Erfolg: Zwillinge begeistert, rufen es laut durch die Kneipe → Angebot + erhöhter Rufgewinn\n— Normaler Erfolg: besteht → Angebot + normaler Rufgewinn\n— Schlechter Erfolg: kostet 1 Körper, hält sich gerade so → Angebot trotzdem, kein Rufgewinn\n— Misserfolg: Ohnmacht — aber nicht nur der Spieler kippt. In der finalen Trinkrunde werden alle drei (Spieler + beide Zwillinge) gemeinsam bewusstlos. Der Wirt weckt sie irgendwann, wenn die Kneipe schon leer ist; alle drei können nur noch lachen und schwanken gemeinsam zum Schiff — noch am selben Abend, nicht erst am nächsten Morgen. Schlechte Konditionen, kein Ruf über diesen Weg — aber ein echtes Band zu den Zwillingen. Eine spürbare Beeinträchtigung danach liegt im Ermessen des SL, keine feste Mechanik.\n\nAlternative Probe: Auftreten (rhetorisch/unterhaltsam statt trinken)\n— Guter/Normaler Erfolg → gleiches Ergebnis wie Standhalten (Angebot + Ruf je nach Bandstufe)\n— Schlechter/Misserfolg → Zwillinge verlieren Interesse, kein Angebot über diesen Weg, aber auch kein Malus",
        trigger: [
          { id: "koerper_gut", label: "Körper-Probe: Guter Erfolg", info: "„He, du da! Bist du ein Mann oder ein Fass mit Beinen? Zeig's uns!“ Guter Erfolg (Körper/Standhaltevermögen): Zwillinge begeistert, rufen es laut durch die Kneipe → Angebot + erhöhter Rufgewinn." },
          { id: "koerper_normal", label: "Körper-Probe: Normaler Erfolg", info: "Normaler Erfolg: besteht → Angebot + normaler Rufgewinn." },
          { id: "koerper_schlecht", label: "Körper-Probe: Schlechter Erfolg", info: "Schlechter Erfolg: kostet 1 Körper, hält sich gerade so → Angebot trotzdem, kein Rufgewinn." },
          { id: "auftreten_versucht", label: "Auftreten-Probe versucht (statt Trinken)", info: "Alternative Probe: Auftreten (rhetorisch/unterhaltsam statt trinken) — guter/normaler Erfolg wie beim Standhalten, schlechter Erfolg/Misserfolg → Zwillinge verlieren Interesse, kein Angebot über diesen Weg, aber auch kein Malus." },
          { id: "ohnmacht", label: "Misserfolg — Ohnmacht", info: "In der finalen Trinkrunde werden alle drei (Spieler + beide Zwillinge) gemeinsam bewusstlos. Der Wirt weckt sie, wenn die Kneipe schon leer ist; alle drei schwanken lachend zum Schiff, noch am selben Abend. Schlechte Konditionen, kein Ruf über diesen Weg — aber ein echtes Band zu den Zwillingen." }
        ]
      },
      "wat": {
        title: "Wat — Zwangsrekrutierung (draußen, nachts)",
        kurz: "Letzte Instanz. Nur wenn kein anderer Weg genutzt wurde. Kein Ruf.",
        details: "Verlässt der Spieler nachts die Kneipe, ohne einen der drei Wege angenommen zu haben: Überfall im Dunkeln, niedergeschlagen. Shanghaiing nach Drake'schem Vorbild.\n\nAufwachen am nächsten Morgen an Bord, ohne Erinnerung an den Übergang.",
        trigger: [
          { id: "verlassen_ohne", label: "Spieler verlässt Kneipe nachts ohne Anheuerung", info: "Verlässt der Spieler nachts die Kneipe, ohne einen der drei Wege angenommen zu haben..." },
          { id: "ueberfall", label: "Überfall ausgelöst", info: "...Überfall im Dunkeln, niedergeschlagen (Shanghaiing nach Drake'schem Vorbild). Aufwachen am nächsten Morgen an Bord, ohne Erinnerung an den Übergang." }
        ]
      }
    }
  },

  "hafenmeisterei": {
    personen: "Bartholomew Ashworth (Hafenmeister) · Gehilfe (namenlos, tollpatschig)",
    npcs: [
      {
        name: "Bartholomew Ashworth",
        rolle: "Hafenmeister von Grimsgate",
        verfassung: "Phlegmatisch, auf Fassade bedacht, nicht dumm — ein Mann aus gutem Hause, der es nie zu Größerem brachte und sich seit 30 Jahren mit Anlegerechten begnügt.",
        beduerfnis: "Seine Ruhe und den Anschein von Ordnung. Kein Ärger, der Arbeit macht."
      },
      {
        name: "Der Gehilfe",
        rolle: "Ashworths junger Schreiber",
        verfassung: "Eifrig, notorisch überfordert, mischt sich öfter ein, als es ihm zusteht.",
        beduerfnis: "Dazugehören und sich beweisen — und plaudert dabei aus, was er besser für sich behielte."
      }
    ],
    kurz: "Verwaltet Anlegerechte, Fracht und Papiere. Zwei Wege: normale Nachfrage oder Sonderfall bei Besuch vor der Kneipe.",
    ortHinweis: "Ein bescheidener Verwaltungsbau, mehr Aktenstaub als Amtswürde. Ashworth sitzt meist hinter einem überladenen Schreibtisch, den Blick eher auf seine Fingernägel als auf die Besucher gerichtet — ein Mann aus gutem Hause, der es nie zu etwas Größerem gebracht hat und sich seit rund 30 Jahren mit Anlegerechten und Frachtpapieren in Grimsgate begnügt. Phlegmatisch, auf Fassade bedacht, aber nicht dumm. Sein Gehilfe — jung, eifrig, notorisch überfordert — sitzt meist mit einem Klemmbrett im Hintergrund und mischt sich öfter ein, als es ihm zusteht.",
    interaktionen: {
      "nachfrage": {
        title: "Normalfall — Spieler fragt aktiv nach",
        kurz: "Nur auf aktive Nachfrage. Gehilfe verrät versehentlich die Kneipe, Ashworth bemerkt die Unstimmigkeit.",
        details: "Nur wenn der Spieler aktiv nachfragt (kein automatischer Trigger). Ashworth lässt sich die Schiffslisten geben, blättert lustlos:\n\n„Alle voll. Tut mir leid, mein Guter — falscher Zeitpunkt, um in Grimsgate anzuheuern.“\n\nSein Gehilfe, bisher stumm im Hintergrund, platzt dazwischen, zu eifrig, um nachzudenken:\n\n„Äh — Sir, 'Zur letzten Heuer' sucht doch noch, oder? Ich hab da gestern noch—“\n\nEr verstummt, wird rot, als ihm auffällt, was er gerade preisgegeben hat. Ashworth runzelt die Stirn, mehr verwirrt als misstrauisch:\n\n„'Zur letzten Heuer'? Welches Schiff heuert denn dort an? Steht mir nichts davon in der Meldeliste.“\n\nKleiner komödiantischer Moment: Ashworth durchschaut allmählich, dass sein Gehilfe selbst in der Kneipe war (vermutlich privat), ohne Konsequenzen für den Spieler. Für den Spieler bestätigt sich hier höchstens: Die Golden Lion ist nicht offiziell registriert — eine Information, kein Zugang. Kein direkter Schiffszugang über diesen Weg — die Information setzt aber trotzdem etwas in Gang: Ashworth lässt die Sache mit der nicht gelisteten Golden Lion nicht los und taucht am nächsten Morgen selbst am Anleger auf (siehe Szene 2.1).",
        trigger: [
          { id: "nachfrage_aktiv", label: "Spieler fragt aktiv nach Anheuerung", info: "Ashworth lässt sich die Schiffslisten geben, blättert lustlos: „Alle voll. Tut mir leid, mein Guter — falscher Zeitpunkt, um in Grimsgate anzuheuern.“" },
          { id: "gehilfe_verraet", label: "Gehilfe verrät \"Zur letzten Heuer\"", info: "Der Gehilfe platzt dazwischen, zu eifrig: „Äh — Sir, 'Zur letzten Heuer' sucht doch noch, oder? Ich hab da gestern noch—“ Er verstummt, wird rot." },
          { id: "ashworth_unstimmigkeit", label: "Ashworth registriert Unstimmigkeit (Golden Lion nicht gelistet)", info: "Ashworth runzelt die Stirn, mehr verwirrt als misstrauisch: „'Zur letzten Heuer'? Welches Schiff heuert denn dort an? Steht mir nichts davon in der Meldeliste.“ Kein direkter Schiffszugang über diesen Weg — aber Ashworth lässt die Sache nicht los und taucht am nächsten Morgen selbst am Anleger auf." }
        ]
      },
      "sonderfall": {
        title: "Sonderfall — Spieler kommt vor der Kneipe",
        kurz: "Ashworth schickt eine Wache mit, Konfrontation mit Harwick am nächsten Morgen.",
        details: "Wenn der Spieler die Hafenmeisterei aufsucht, bevor er in der Kneipe war: Ashworth registriert die Anfrage als ungewöhnlich (jemand, der offensichtlich anheuern will, aber kein Schiff nennen kann) und schickt diskret eine Wache los, die dem Spieler unauffällig folgt — mit dem Auftrag, herauszufinden, zu welchem Schiff er am Ende gehört. Nicht misstrauisch im Sinne von \"verdächtig\", eher pflichtbewusst-bürokratisch: Jemand ohne Schiff, der anheuern will, gehört registriert.\n\nAm nächsten Morgen erscheint Ashworth mit der Wache am Anleger der Golden Lion und stellt Harwick zur Rede — offiziell, aber nicht feindselig. Harwick löst die Situation routiniert mit Charme und/oder diskreter Bestechung, Ashworth zieht zufrieden ab. Für den Spieler bleibt das meist im Hintergrund, es sei denn, er wird von der Wache als derjenige erkannt, der sie hergeführt hat.\n\nErkennungsmechanik: Wahrnehmungs-Probe der Wache gegen Auftreten/Gewandtheit des Spielers (opponierter Wurf). Besteht die Wache, erinnert sie sich an das Gesicht. Konsequenz bei Erkennung: kleiner Rufmalus bei der Crew — der Spieler hat den Beamten persönlich zum Schiff geführt, das kommt nicht gut an. Kein hartes Strafsystem, eher sozialer Dämpfer.",
        trigger: [
          { id: "besuch_vor_kneipe", label: "Spieler besucht Hafenmeisterei vor der Kneipe", info: "Ashworth registriert die Anfrage als ungewöhnlich (jemand, der offensichtlich anheuern will, aber kein Schiff nennen kann)." },
          { id: "wache_losgeschickt", label: "Wache wird losgeschickt", info: "Ashworth schickt diskret eine Wache los, die dem Spieler unauffällig folgt — mit dem Auftrag, herauszufinden, zu welchem Schiff er am Ende gehört. Pflichtbewusst-bürokratisch, nicht misstrauisch." },
          { id: "konfrontation_morgen", label: "Konfrontation am nächsten Morgen (Harwick löst es)", info: "Am nächsten Morgen erscheint Ashworth mit der Wache am Anleger der Golden Lion und stellt Harwick zur Rede — offiziell, aber nicht feindselig. Harwick löst es routiniert mit Charme und/oder diskreter Bestechung." },
          { id: "erkannt_rufmalus", label: "Spieler von Wache erkannt → Rufmalus", info: "Erkennungsmechanik: Wahrnehmungs-Probe der Wache gegen Auftreten/Gewandtheit des Spielers (opponierter Wurf). Bei Erkennung: kleiner Rufmalus bei der Crew — der Spieler hat den Beamten persönlich zum Schiff geführt." }
        ]
      }
    }
  },
  "lagerhaeuser": {
    personen: "Wachen · Belader (namenlos, abweisend)",
    kurz: "Von außen chaotisch, im Kern strikt organisiert. Abweisender Ort — Wachen lassen kaum durch, Belader haben keine Zeit für Fremde.",
    ortHinweis: "Von außen wirkt es wie ein einziges Durcheinander — Kisten, Fässer, Männer, die sich im Laufschritt kreuzen. Wer genauer hinsieht, erkennt: Das hier läuft wie ein Uhrwerk, jeder Handgriff sitzt, der Konvoi muss beladen werden, und dafür bleibt keine Zeit für Ablenkung.\n\nWachen stehen an den Eingängen und lassen Fremde kaum durch — wer keinen erkennbaren Grund hat, wird höflich, aber bestimmt abgewiesen. Die Belader selbst sind kaum ansprechbar: kurze, einsilbige Antworten, wenn überhaupt, und ein Blick, der sagt, dass man hier niemanden kennt und auch keine Zeit hat, das zu ändern. Alle sind sichtbar im Stress, den Konvoi rechtzeitig fertig zu bekommen.",
    interaktionen: {
      "beobachtung": {
        title: "Zufallsbeobachtung — Wache trifft Kapitän",
        kurz: "Optionale Wahrnehmungs-Probe (keine Erschwernis). Teaser auf die Golden Lion, Wink zur Hafenmeisterei.",
        details: "Am Rand der Lagerhäuser, halb hinter gestapelten Fässern, steht eine Wache im Gespräch mit einem auffällig gut gekleideten Mann — selbstsicheres Auftreten, ein Charme, der nicht so recht zur Nüchternheit des Ortes passen will (Harwick, dem Spieler zu diesem Zeitpunkt unbekannt). Die Wache wirkt zunächst angespannt, blättert in einem Papierstapel, schüttelt den Kopf — bis der Fremde ihm etwas zusteckt (Münzen? ein gefaltetes Papier? aus der Distanz nicht sicher zu erkennen) und die Wache sich sichtlich entspannt, nickend.\n\nNur wahrnehmbar, wenn der Spieler aktiv die Szenerie beobachtet (nicht automatisch, muss selbst aktiv werden). Probe: Wahrnehmung, keine Erschwernis.\n\nBei Erfolg schnappt der Spieler einen Gesprächsfetzen auf:\n„…die Golden Lion steht nirgends auf der Meldeliste, aber wenn Ihr sagt, das regelt sich…“\n\nDient als Wink zur nächsten Station (Hafenmeisterei) — die Meldeliste wird dort relevant.",
        trigger: [
          { id: "probe_versucht", label: "Wahrnehmungsprobe versucht", info: "Am Rand der Lagerhäuser steht eine Wache im Gespräch mit einem auffällig gut gekleideten Mann (Harwick, dem Spieler unbekannt) — nur wahrnehmbar, wenn der Spieler aktiv beobachtet. Probe: Wahrnehmung, keine Erschwernis." },
          { id: "erfolg_gehoert", label: "Erfolg — Gesprächsfetzen \"Golden Lion\" gehört", info: "Der Spieler schnappt auf: „…die Golden Lion steht nirgends auf der Meldeliste, aber wenn Ihr sagt, das regelt sich…“ — Wink zur nächsten Station (Hafenmeisterei)." },
          { id: "ignoriert", label: "Spieler ignoriert die Szene / würfelt nicht", info: "Ohne aktive Beobachtung bleibt die Szene unbemerkt." }
        ]
      }
    }
  },
  "markt": {
    personen: "Vereinzelt Crew-Mitglieder anderer Schiffe (reine Atmosphäre, keine feste Interaktion)",
    kurz: "Handel, Menschenmengen, guter Ort für Gerüchte und Zufallsbegegnungen. Kein fester Inhalt.",
    ortHinweis: "Der Marktplatz ist der lauteste Ort in Grimsgate — Händler rufen ihre Ware aus, Kisten mit Fisch, Obst, getrocknetem Fleisch stapeln sich neben improvisierten Ständen. Zwischen den Käufern schieben sich immer wieder Männer in Seemannskleidung, manche mit dem Abzeichen eines bestimmten Schiffs auf der Jacke, die meisten einfach nur durstig nach frischer Ware vor der nächsten Fahrt. Gesprächsfetzen wehen vorbei — Klagen über Preise, Gerüchte über die nächste Abfahrt, ein Streit um verdorbene Ware.\n\nKein fester Inhalt — Ort für freie Improvisation, Gerüchte und Zufallsbegegnungen nach Bedarf. Crew-Mitglieder anderer Schiffe (nicht der Golden Lion) können hier auftauchen, rein als Farbe, keine Anheuerungsfunktion.",
    interaktionen: {}
  },
  "kraemerladen": {
    personen: "Krämer (namenlos)",
    npcs: [
      {
        name: "Der Krämer",
        rolle: "Ladenbesitzer",
        verfassung: "Resigniert-pragmatisch, verramscht gerade alles zu Schleuderpreisen — ab morgen ist die Stadt tot.",
        beduerfnis: "Seinen Bestand loswerden, solange noch Publikum da ist."
      }
    ],
    kurz: "Ausrüstung und Grundbedarf. Krämer verkauft gerade alles zu Schleuderpreisen, weil morgen ohnehin nichts mehr los ist.",
    ortHinweis: "Ein vollgestopfter kleiner Laden, in dem sich Kisten, Fässer und Regale bis unter die Decke stapeln — Seile, Werkzeug, Konserven, Ersatzkleidung, alles, was man kurz vor einer Abfahrt noch braucht und vergessen hat. Der Krämer kennt jeden Winkel seines Ladens auswendig und findet auch im Chaos sofort, wonach man fragt.\n\nSpieler können hier Ausrüstung kaufen, an die sie vorher nicht gedacht haben. Fragt man ihn grob, wo man hier anheuert, winkt er ab: die meisten Schiffe seien schon voll, und ab morgen sei ohnehin nichts mehr los in Grimsgate — deswegen haut er gerade alles zu Schleuderpreisen raus, solange noch Publikum da ist.\n\n„Frag mich nicht nach 'nem Schiff, frag mich, was du noch brauchst, bevor's zu spät ist — das hier wird nach morgen keiner mehr kaufen wollen.“\n\nKein fester Interaktions-Ablauf — freie Improvisation, ähnlich dem Markt, nur mit Kaufmöglichkeit und dieser einen wiederkehrenden Grundhaltung des Krämers.",
    interaktionen: {}
  },
  "bordell": {
    personen: "Constance Wrey (Madame) · Ezra Coombe · Ned Sharpe · diverse Frauen (namenlos, teils für Wat tätig)",
    npcs: [
      {
        name: "Constance Wrey",
        rolle: "Madame des Hauses",
        verfassung: "Ruhige, unmissverständliche Autorität — nichts geschieht hier ohne ihr Wissen.",
        beduerfnis: "Kontrolle über ihr Haus. Kein Ärger, der die Geschäfte stört."
      }
    ],
    kurz: "Sozialer Zugang + Wat-Falle + 'Raubein'-Zusatzszene mit Rufmechanik bei Ezra/Ned.",
    ortHinweis: "Etwas abseits der Stadt, unauffällig von außen, drinnen wärmer und aufwendiger eingerichtet als der Rest von Grimsgate — rote Vorhänge, gedämpftes Licht, der Lärm der Docks bleibt vor der Tür. Constance Wrey führt das Haus mit ruhiger, unmissverständlicher Autorität; nichts passiert hier ohne ihr Wissen. Im Empfangsbereich sitzen häufig Ezra Coombe und Ned Sharpe, zwei Crew-Mitglieder, die das Haus als eine Art zweites Zuhause behandeln.",
    interaktionen: {
      "wat_falle": {
        title: "Wats Falle",
        kurz: "Manche Frauen arbeiten für Wat. Fesselung, Fluchtoptionen vor Wats Ankunft.",
        details: "Manche Frauen im Haus arbeiten (mehr oder weniger freiwillig, mehr oder weniger für den Spieler erkennbar) für Wat. Lässt sich der Spieler auf eine ein, führt sie ihn in einen abgelegeneren Raum — dort wird er überrascht und festgehalten/gefesselt, bis Wat ihn abholen kommt.\n\nFluchtoptionen während der Fesselung:\n— Gutes Auftreten: Spieler redet sich frei, bevor Wat eintrifft — Frau lässt ihn ziehen, ggf. aus Mitleid, Zweifel oder weil er sie überzeugt, dass sich der Ärger nicht lohnt.\n— Freireden trotz Fesselung: Sind die Fesseln nicht sicher genug (Probe auf Körper/Geschick, Feinjustierung offen), kann sich der Spieler befreien, bevor Wat kommt.\n— Keine Flucht: Wat holt ihn ab → identisch zum \"Wat\"-Ausgang der Kneipe (Zwangsrekrutierung, Aufwachen an Bord).",
        trigger: [
          { id: "einlassen", label: "Spieler lässt sich auf eine Frau ein", info: "Manche Frauen im Haus arbeiten (mehr oder weniger freiwillig, mehr oder weniger erkennbar) für Wat." },
          { id: "hinterraum", label: "Frau führt ihn in den Hinterraum", info: "Sie führt ihn in einen abgelegeneren Raum — dort wird er überrascht und festgehalten/gefesselt, bis Wat ihn abholen kommt." },
          { id: "flucht_auftreten", label: "Fluchtversuch (Auftreten) — Erfolg/Misserfolg", info: "Gutes Auftreten: Spieler redet sich frei, bevor Wat eintrifft — Frau lässt ihn ziehen, ggf. aus Mitleid, Zweifel oder weil er sie überzeugt." },
          { id: "flucht_fesseln", label: "Fluchtversuch (Fesseln lösen) — Erfolg/Misserfolg", info: "Sind die Fesseln nicht sicher genug (Probe auf Körper/Geschick), kann sich der Spieler befreien, bevor Wat kommt." },
          { id: "wat_holt_ab", label: "Wat holt Spieler ab (keine Flucht)", info: "Keine Flucht: Wat holt ihn ab → identisch zum \"Wat\"-Ausgang der Kneipe (Zwangsrekrutierung, Aufwachen an Bord)." }
        ]
      },
      "raubein": {
        title: "Raubein-Zusatzszene",
        kurz: "Grober Gast belästigt eine Frau. Physisches Eingreifen = Rufgewinn bei Ezra/Ned.",
        details: "Ein grober Gast belästigt eine der Frauen. Constance will ihn draußen haben, er eskaliert.\n\nZwei Zugänge:\n— Spieler sitzt im Empfangsbereich mit Ezra/Ned → bekommt es direkt mit\n— Spieler ist oben → hört den Tumult, kann herunterstürmen\n\nAuflösung:\n— Physisches Eingreifen (sofort): Kampf, Ezra+Ned helfen mit → Rufgewinn bei Ezra/Ned (einzige Variante mit Belohnung)\n— Soziale Lösung (Auftreten/Rhetorik, Deeskalation): neutral, kein Gewinn, kein Verlust\n— Nicht-Eingreifen: Constance oder ihre eigenen Männer regeln es selbst, ohne den Spieler → kleiner Rufmalus bei Ezra/Ned (Zögern wird als Desinteresse an der Crew-Gemeinschaft gewertet, nicht als Feigheit im engeren Sinn — nur unmittelbares Eingreifen zählt)",
        trigger: [
          { id: "ausgeloest", label: "Raubein-Szene ausgelöst (Empfang oder von oben gehört)", info: "Ein grober Gast belästigt eine der Frauen. Constance will ihn draußen haben, er eskaliert." },
          { id: "physisch", label: "Physisches Eingreifen → Rufgewinn", info: "Physisches Eingreifen (sofort): Kampf, Ezra+Ned helfen mit → Rufgewinn bei Ezra/Ned (einzige Variante mit Belohnung)." },
          { id: "sozial", label: "Soziale Lösung → neutral", info: "Soziale Lösung (Auftreten/Rhetorik, Deeskalation): neutral, kein Gewinn, kein Verlust." },
          { id: "kein_eingreifen", label: "Kein Eingreifen → Rufmalus", info: "Constance oder ihre eigenen Männer regeln es selbst, ohne den Spieler → kleiner Rufmalus bei Ezra/Ned (Zögern wird als Desinteresse gewertet)." }
        ]
      }
    }
  },
  "golden_lion": {
    personen: "James Harwick · Cormac Daly · Bartholomew Ashworth (nur nach vorherigem Hafenmeisterei-Besuch)",
    kurz: "Ankunft am Anleger. Ashworth stellt Harwick wegen der nicht registrierten Golden Lion zur Rede, danach Übergabe an Cormac und zügiges Ablegen.",
    ortHinweis: "Die Ankunft an Bord hängt vom Rekrutierungsweg ab (Heuer, Bibel 9.1):\n\n— Regulär angeheuert (Francesco/Tom/Zwillinge-Erfolg): zu Fuß, früh am nächsten Morgen.\n— Wat (Zwangsrekrutierung): wacht erst auf, wenn das Schiff schon unterwegs ist — verpasst die Szene unten komplett.\n— Zwillinge-Ohnmacht: kommt schon am Vorabend an Bord, direkt aus der Kneipenszene heraus (siehe Heuer/Zwillinge).\n\nFür alle, die morgens zu Fuß ankommen: War vorher ein Spieler in der Hafenmeisterei (Nachfrage oder Sonderfall), steht Ashworth bereits am Anleger und befragt hitzig die rumlungernde Crew nach dem Kapitän — die Golden Lion ist ja nicht registriert. Harwick kommt heraus, wickelt ihn mit Münzen und Charme ab: freundliches, einladendes Lächeln. Die Miene fällt ihm kurz, sobald Ashworth abzieht — aber nur Amtspersonen gegenüber, nie den Spielern. Er begrüßt die Neuen, stellt sie Cormac vor, übergibt sie ihm. Kurz danach wird abgelegt.\n\n(Beim Sonderfall zusätzlich: die Wache erkennt den Spieler wieder, der sie zum Schiff geführt hat → persönlicher Rufmalus, siehe Hafenmeisterei.)",
    // 5.1/6.1 (nach der Insel / Flaute): komplett eigene Rahmung statt der
    // Ankunfts-Beschreibung oben - die zentralen Inhalte dieser beiden Szenen
    // liegen an der Kapitänskajüte und am Unterdeck (siehe dortige Einträge),
    // hier nur die übergeordnete Einordnung/Kursfrage für den SL.
    szenenUeberschreibungen: {
      "5.1": {
        personen: "James Harwick (in der Kajüte) · Cormac Daly",
        kurz: "Übergangsszene nach der Schatzinsel: Spieler haben Freizeit, keine angeordnete Aufgabe. Zwei Stränge ziehen in Gegenrichtungen: Ezra Coombes Wundbrand (Unterdeck) Richtung spanischem Hafen, Harwicks Artefakt-Gespräch bei Wein (Kapitänskajüte) Richtung Schmugglernest. Beide Ziele liegen NICHT auf Harwicks eigener Route und brauchen jeweils echte Überzeugung — bleibt beides aus, hält er seinen Kurs und das Schiff treibt in die Flaute (Szene 6.1).",
        ortHinweis: "Freies Bewegen wie in 2.1, keine angeordnete Aufgabe (bewusste Entscheidung: die beiden Stränge tragen die Szene von selbst). Die Erleichterung über den Schatz mischt sich mit wachsender Sorge um Ezra. Spieler, die mit Harwick auf der Insel unterwegs waren (Dorf/Dschungelpfad/Nachtlager/Höhle), werden jetzt sichtbar anders behandelt — von Crew UND von Harwick selbst.\n\nDie eigentliche Weggabelung dieser Szene liegt bei der Kapitänskajüte (Interaktion \"Harwick — Wein und die Karten auf dem Schreibtisch\") und beim Unterdeck (\"Ezra Coombe — Der Wundbrand verschlimmert sich\"), siehe dort. Beide Ziele — spanischer Hafen wie Schmugglernest — sind gleichrangig aktiv zu erkämpfende Kursänderungen, keines ist der Default. SL-Ermessen anhand des tatsächlichen Spielerverhaltens: glaubwürdig zum Schmugglernest überzeugt / glaubwürdig zum spanischen Hafen überzeugt / kein Versuch bei beidem → Flaute (6.1)."
      },
      "6.1": {
        personen: "James Harwick (in der Kajüte)",
        kurz: "Die Flaute — Harwicks eigener, passiver Kurs, falls in 5.1 niemand aktiv eingegriffen hat (Bibel 7.2). Kein Wind, drückende Stille. In Harwicks Unterlagen findet sich eine Warnung vor einem übernatürlichen Kampf.",
        ortHinweis: "Die Segel hängen schlaff, kein Windhauch, das Schiff liegt fast bewegungslos auf spiegelglatter See.\n\nZentral: siehe Kapitänskajüte, Interaktion \"Die Warnung in Harwicks Unterlagen\"."
      }
    },
    interaktionen: {}
  },

  // Neu (Übergangsszene nach der Insel): Marker "kapitaenskajuete" existiert
  // schon lange auf der Golden-Lion-Karte (GOLDEN_LION_MARKERS_BASE), hatte
  // bisher aber keinen eigenen ORTE-Eintrag - die Tür war in 2.1/3.1 laut
  // Marker-Text verriegelt, kein GM-Inhalt nötig. Beide Interaktionen hier
  // sind scharf auf ihre jeweilige Szene begrenzt (nurSzenen).
  "kapitaenskajuete": {
    personen: "James Harwick",
    kurz: "5.1: Harwick honoriert die Loyalität der Gruppe aus dem Thahal-Dorf mit Wein und ehrlichen Antworten — Artefakte fallen dabei über Wahrnehmung/Instinkt/Interesse auf, der Schmugglernest-Tipp über Handels-/Untergrundwissen. Echte Überzeugung kann ihn zum spanischen Hafen ODER zum Schmugglernest bewegen. 6.1 (nur falls 5.1 in die Flaute lief): Warnung vor einem übernatürlichen Kampf in seinen Unterlagen. 10.1 (Die Flucht): dunkel, regungslos, Zustand hängt vom Ausgang des Artefakthandels ab.",
    interaktionen: {
      "harwick_artefakt_dokumente": {
        title: "Harwick — Wein und die Karten auf dem Schreibtisch",
        kurz: "Harwick honoriert die Loyalität der Gruppe aus dem Thahal-Dorf mit einer Einladung zu Wein und beantwortet ab jetzt ehrlich fast jede Frage. Wer die ausliegenden Karten beachtet, stößt auf die Artefakte; Handels-/Untergrundwissen liefert dabei den Schmugglernest-Tipp. Echtes Argument (kein Wurf) kann ihn zum spanischen Hafen ODER zum Schmugglernest bewegen.",
        nurSzenen: ["5.1"],
        details: "Harwick sucht das Gespräch mit der Gruppe — vor allem, aber nicht nur, mit denen, die mit ihm im Dorf der Thahal unterwegs waren. Sie haben sich dort als loyal, diszipliniert und vertrauenswürdig erwiesen, und das honoriert er sichtbar: eine Einladung in seine Kajüte, guter Wein wird eingeschenkt, der Ton ist offen wie selten. Ab jetzt beantwortet er nahezu jede Frage ehrlich — kein Ausweichen, keine Floskeln.\n\nAuf seinem Schreibtisch liegen Karten und Notizen, unaufgeräumt, so wie er sie zuletzt liegen ließ. Er präsentiert nichts davon aktiv — wer aber gute Wahrnehmung oder Instinkt mitbringt, oder einfach von sich aus echtes Interesse an den Karten zeigt, erkennt schnell: Es geht um bestimmte Artefakte.\n\nWird das Gespräch vertieft, bekommt ein Spieler mit Handels- oder Untergrundwissen abseits der anderen einen Hinweis zugeflüstert — geheim, nur an diesen einen Spieler, der es dann selbst der Gruppe vorschlagen muss:\n\n„Man weiß, wo die Küste sich duckt und verbirgt — nur sind es wenige Kiele, die diese Gewässer je durchpflügen, und was kaum einer mit eigenen Augen sah, bleibt Gerücht, und sei es noch so oft erzählt. Ein altes Schmugglerlied kennt trotzdem den Weg: Achtzehn Grad gen Norden, einundzwanzig obendrauf, vierundsechzig Grad nach Westen, fünfunddreißig dazu — folgt der Küste, wo der tote Fels die Flut bricht. Und fütter das Eis mit Feuer, dann öffnet sich der Fisch.“\n\nDer Sinn der letzten Zeile erschließt sich erst vor Ort (siehe Szene 8.1) — bewusst kryptisch gehalten.\n\nWichtig: Harwicks eigener Kurs führt derzeit weder zum einen noch zum anderen Ziel. Beide Ziele — spanischer Hafen wie Schmugglernest — sind Abweichungen von seiner Route und brauchen echte Überzeugung. Kein Würfelwurf entscheidet das, sondern gutes Rollenspiel: ein Spieler, der glaubwürdig argumentiert (sei es mit Ezras Zustand, sei es mit dem, was er über die Artefakte erfahren hat), kann Harwick umstimmen.\n\nSL-Ermessen für den Ausgang: Überzeugen Spieler ihn glaubwürdig zum Schmugglernest, ändert sich der Kurs dorthin — was bedeutet, den spanischen Hafen und damit Ezras beste Überlebenschance aufzugeben (moralisches Gewicht siehe Bibel 12, \"moralische Umkehrung\"). Überzeugen sie ihn stattdessen zum spanischen Hafen, hält er darauf Kurs. Bleibt beides aus — niemand argumentiert glaubwürdig für die eine oder andere Seite —, behält Harwick seinen eigenen Kurs bei, und das Schiff treibt in die Flaute (Szene 6.1).",
        trigger: [
          { id: "einladung_wein", label: "Harwick lädt zu Wein, honoriert die Loyalität aus dem Thahal-Dorf", info: "Er sucht das Gespräch, vor allem mit den Insel-Begleitern — Wein wird eingeschenkt, der Ton offen wie selten. Ab jetzt beantwortet er nahezu jede Frage ehrlich." },
          { id: "artefakte_bemerkt", label: "Wahrnehmung/Instinkt/Interesse: Artefakte auf den ausliegenden Karten bemerkt", info: "Er präsentiert nichts aktiv — wer gute Wahrnehmung oder Instinkt hat, oder einfach echtes Interesse an den Karten zeigt, erkennt: Es geht um bestimmte Artefakte." },
          { id: "schmugglernest_tipp", label: "Handels-/Untergrundwissen: geheimer Hinweis auf das Schmugglernest (Schmugglerlied)", info: "Geheim, nur an einen Spieler mit Handels-/Untergrundwissen zugeflüstert: „Man weiß, wo die Küste sich duckt und verbirgt — nur sind es wenige Kiele, die diese Gewässer je durchpflügen, und was kaum einer mit eigenen Augen sah, bleibt Gerücht, und sei es noch so oft erzählt. Ein altes Schmugglerlied kennt trotzdem den Weg: Achtzehn Grad gen Norden, einundzwanzig obendrauf, vierundsechzig Grad nach Westen, fünfunddreißig dazu — folgt der Küste, wo der tote Fels die Flut bricht. Und fütter das Eis mit Feuer, dann öffnet sich der Fisch.“ Dieser Spieler muss den Vorschlag selbst in die Gruppe tragen." },
          { id: "ueberzeugung_versucht", label: "Spieler versuchen, Harwick mit einem echten Argument umzustimmen (kein Wurf)", info: "Gutes Rollenspiel entscheidet, kein Würfelwurf — ein glaubwürdiges Argument (Ezras Zustand oder Artefakt-Wissen) hat eine echte Chance." },
          { id: "kurs_schmugglernest", label: "Erfolgreich zum Schmugglernest überzeugt (kostet Ezra die beste Überlebenschance)", info: "Kurs ändert sich aufs Schmugglernest — bedeutet, den spanischen Hafen aufzugeben. Moralisches Gewicht siehe Bibel 12 (\"moralische Umkehrung\")." },
          { id: "kurs_spanischer_hafen", label: "Erfolgreich zum spanischen Hafen überzeugt", info: "Kurs ändert sich Richtung spanischem Hafen — genauso das Ergebnis aktiver Überzeugung wie beim Schmugglernest, kein Default." },
          { id: "kurs_flaute", label: "Keine glaubwürdige Überzeugung bei beidem → Schiff bleibt auf Harwicks eigenem Kurs, treibt in die Flaute (6.1)", info: "Ohne glaubwürdiges Argument für die eine oder andere Seite bleibt Harwick auf seinem eigenen Kurs — das Schiff treibt in die Flaute." }
        ]
      },
      "warnung_in_unterlagen": {
        title: "Die Warnung in Harwicks Unterlagen",
        kurz: "Nur relevant, wenn Szene 6.1 (Flaute) aktiv ist. Während der erzwungenen Untätigkeit verbringt Harwick auffällig viel Zeit über seinen Unterlagen — wer genau hinsieht, findet eine vage Warnung vor einem kommenden übernatürlichen Kampf.",
        nurSzenen: ["6.1"],
        details: "Bibel 7.2: Während der Flaute stoßen die Spieler in Harwicks Unterlagen auf die Warnung vor einem übernatürlichen Kampf. Wie genau der Zugang zustande kommt, liegt im Ermessen des Spielleiters — z.B. weil Harwick in der erzwungenen Untätigkeit sichtbar auffällig viel Zeit grübelnd über seinen Papieren verbringt und dabei unvorsichtig wird, oder weil ein Spieler mit gutem Grund direkt nachfragt und er in seiner Anspannung mehr preisgibt als sonst.\n\nDie Warnung selbst bleibt an dieser Stelle bewusst vage — keine Details zum Gegner oder zum Ritual, nur die Gewissheit, dass etwas Übernatürliches bevorsteht und dass Vorbereitung nötig sein wird. Zukunfts-Notiz: Dieser Faden führt später zum \"Hafen zur Vorbereitung\" (Bibel 7.4, freigeschaltet über den Weg durch die Flaute) — Ausarbeitung dieser Folgestation steht noch aus.",
        trigger: [
          { id: "harwick_gruebelt", label: "Harwick verbringt auffällig viel Zeit grübelnd über seinen Unterlagen", info: "Die erzwungene Untätigkeit der Flaute lässt ihm zu viel Zeit zum Nachdenken — er wird dabei unvorsichtiger als sonst." },
          { id: "warnung_entdeckt", label: "Warnung vor einem übernatürlichen Kampf entdeckt (noch vage, keine Details)", info: "Wahrnehmungs-/Wissen-Probe oder direktes Nachfragen legt eine vage Warnung offen: Etwas Übernatürliches steht bevor, Vorbereitung wird nötig sein. Keine Details zu Gegner oder Ritual an dieser Stelle." }
        ]
      },
      "harwick_nach_dem_verrat": {
        title: "Harwick nach dem Verrat",
        kurz: "Verzweigt nach dem Ausgang von \"Die Kinder retten\" (Artefakthandel, 9.1). Kinder gerettet: erschüttert, zurückgezogen. Kinder gestorben: dauerhaft manisch, kalte, unnahbare Befehle.",
        nurSzenen: ["10.1"],
        details: "Die Kajütentür steht einen Spalt offen, kein Licht drinnen. Wie Harwick jetzt wirkt, hängt direkt davon ab, wie die Kinder-Rettung beim Artefakthandel ausgegangen ist (siehe ORTE.handelstreffen, Interaktion \"kinder_retten\"):\n\n— Wurden die Kinder gerettet: Harwick sitzt regungslos, den Blick auf einen Punkt gerichtet, den nur er sieht. Kein Wutausbruch mehr, keine Befehle im Ton von vorhin — nur eine tiefe, erschöpfte Stille. Wer das Gespräch sucht, bekommt zum ersten Mal einen echten Riss in seiner Fassade zu sehen: kurz, roh, sofort wieder verschlossen.\n\n— Starben die Kinder mit den übrigen an Bord: Harwick ist seit der Szene nicht mehr derselbe. Er gibt Befehle knapp, kalt, ohne die sonstige Wärme — als hätte etwas in ihm endgültig den Halt verloren. Auf Ansprache reagiert er unnahbar, fast abwesend. Diese Verfassung bleibt ab jetzt dauerhaft (Bibel 12, permanente Konsequenz) — kein Gespräch, kein Ereignis macht das rückgängig.\n\nBeide Varianten sind reine Charaktermomente ohne Probe — SL-Ermessen, wie viel Harwick preisgibt, falls überhaupt.",
        trigger: [
          { id: "kinder_gerettet_variante", label: "Kinder gerettet → erschüttert, zurückgezogen, kurzer echter Riss in der Fassade", info: "Harwick sitzt regungslos, kein Wutausbruch mehr — nur tiefe, erschöpfte Stille. Wer das Gespräch sucht, bekommt kurz einen echten Riss in seiner Fassade zu sehen." },
          { id: "kinder_gestorben_variante", label: "Kinder gestorben → dauerhaft manisch, kalte Befehle (permanente Konsequenz)", info: "Harwick gibt Befehle knapp, kalt, ohne die sonstige Wärme. Auf Ansprache reagiert er unnahbar, fast abwesend. Diese Verfassung bleibt ab jetzt dauerhaft — kein Gespräch macht das rückgängig." }
        ]
      }
    }
  },

  // Neu: Marker "offiziersquartier" existiert schon lange auf der Golden-
  // Lion-Karte, hatte aber noch nie einen ORTE-Eintrag - bisher nur
  // Marker-Beschreibung ohne GM-Inhalt. 5.1 bekommt hier einen reinen
  // Flavor-Zusatz, kein Plot-Gewicht (Hendriks Auftrag: "kleine lustige
  // simple Storys, die nichts Besonderes zur Geschichte beitragen").
  "offiziersquartier": {
    szenenUeberschreibungen: {
      "5.1": {
        ortHinweis: "Toms Kammer hat neuen Zuwachs bekommen: An einer Schnur von der Deckenbalken baumelt ein getrocknetes, reichlich fragwürdig aussehendes exotisches Fruchtstück, dazu ein paar bunte Federn, achtlos über den Würfeltisch verteilt. Niemand weiß so recht, was das Fruchtstück eigentlich ist oder werden soll — Tom behauptet steif und fest, es bringe Glück, und wehrt sich energisch dagegen, es „auch nur anzufassen, geschweige denn wegzuwerfen“."
      }
    },
    interaktionen: {
      "kartenrunde": {
        title: "Kartenrunde unter Deck",
        kurz: "Ein paar Crewmitglieder pokern um Kleinigkeiten. Menschenkenntnis- oder Rhetorik-Probe zum Bluffen, rein für Spaß, kein Ruf-Effekt.",
        nurSzenen: ["5.1"],
        details: "Ein paar off-duty Crewmitglieder sitzen um den kleinen Tisch, Karten in der Hand — gespielt wird um Knöpfe, Tabak und andere Kleinigkeiten, nicht um echtes Geld. Wer mitspielen will, ist willkommen, einer rückt bereitwillig zur Seite.\n\nMenschenkenntnis- oder Rhetorik-Probe (Bluffen).\n\n— Guter Erfolg: Meisterhaft geblufft, räumt den kleinen Pott ab — johlender Beifall.\n— Normaler Erfolg: Solides Spiel, am Ende ungefähr ein Nullsummenspiel.\n— Schlechter Erfolg: Durchschaut, verliert den Einsatz, wird freundlich aufgezogen.\n— Misserfolg: Komplett durchschaut, verliert deutlich mehr als geplant — großes Gelächter, aber gutmütig.\n\nKein Ruf-Effekt, kein echter Verlust (Knöpfe und Tabak, keine Wertsachen) — reiner Zeitvertreib.",
        trigger: [
          { id: "mitgespielt", label: "Spieler steigt in die Kartenrunde ein", info: "Gespielt wird um Knöpfe, Tabak und andere Kleinigkeiten, nicht um echtes Geld. Einer rückt bereitwillig zur Seite." },
          { id: "guter_erfolg", label: "Guter Erfolg → meisterhaft geblufft, räumt den Pott ab", info: "Meisterhaft geblufft, räumt den kleinen Pott ab — johlender Beifall." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → ungefähr Nullsummenspiel", info: "Solides Spiel, am Ende ungefähr ein Nullsummenspiel." },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → durchschaut, verliert Einsatz", info: "Durchschaut, verliert den Einsatz, wird freundlich aufgezogen." },
          { id: "misserfolg", label: "Misserfolg → komplett durchschaut, deutlicher Verlust", info: "Komplett durchschaut, verliert deutlich mehr als geplant — großes Gelächter, aber gutmütig." }
        ]
      }
    }
  },

  "achterdeck": {
    personen: "Tom Fletcher",
    kurz: "Tom am Ruder, wirkt nebenbei, hält aber mühelos Kurs. Zwei NPC-Wünsche statt fester Trigger.",
    ortHinweis: "Kein Auftrag im klassischen Sinn — Tom initiiert selbst, wenn Spieler in seiner Nähe herumstehen. Wunsch 1 (Knoten-Streich) funktioniert unabhängig von Wunsch 2 (Ruder halten) und kann beide in derselben Szene auftreten, wenn ein Spieler wegen des Streichs losläuft und Tom sich daraufhin an die übrigen wendet.",
    // 3.1 (Sturm): komplett eigener Zustand statt der ruhigen 2.1-Beschreibung -
    // Tom kämpft mit dem Ruder, keine der beiden Wunsch-Interaktionen passt hierher
    // (siehe nichtInSzenen bei "knoten_streich"/"ruder_halten" unten).
    szenenUeberschreibungen: {
      "3.1": {
        personen: "Tom Fletcher (kämpft mit dem Ruder)",
        kurz: "Tom kämpft mit dem Ruder, sichtlich angestrengt — hat aber trotzdem einen Spruch auf den Lippen und lotst Spieler weiter, wo sie gebraucht werden.",
        ortHinweis: "Tom kämpft mit dem Ruder, beide Hände fest um die Speichen, Muskeln sichtbar angespannt — von der lässigen Mühelosigkeit sonst keine Spur. Jede Welle versucht, ihm das Ruder aus der Hand zu reißen.\n\nKein Auftrag, kein Small Talk im bisherigen Sinn — Tom ist vollständig mit dem Ruder beschäftigt und verlässt seinen Posten nicht (Harwick verlässt sich blind auf ihn). Knoten-Streich und Ruder-Bitte setzen beide voraus, dass er entspannt bei der Sache ist, und sind für diese Szene deshalb ausgesetzt. Stattdessen: reiner Charaktermoment, siehe Interaktion \"Am Ruder, mit losem Mundwerk\"."
      },
      "5.1": {
        // Reiner Flavor-Zusatz, kein Plot-Gewicht (Hendriks Auftrag: "kleine
        // lustige simple Storys, die nichts Besonderes zur Geschichte
        // beitragen"). Knoten-Streich/Ruder-Bitte bleiben unverändert aktiv
        // (kein nichtInSzenen für 5.1), dieser Text ergänzt nur den ortHinweis.
        ortHinweis: "Tom hält mühelos Kurs, auffällig gut gelaunt — summt vor sich hin, fast schon einen Ton daneben. Wer fragt, was ihn so freut, bekommt nur ein breites Grinsen und den Satz: „Ruhiges Wasser, volle Truhen, und keiner will gerade mein Ruder. Was soll da nicht gut sein?“ Er wiederholt die Zeile im Laufe der Szene mit stoischer Freude noch mindestens zweimal, für jeden neuen Spieler in Hörweite."
      },
      "10.1": {
        personen: "Tom Fletcher (angespannt am Ruder)",
        kurz: "Tom hält Kurs auf ein riffgeschütztes Eiland, den Blick abwechselnd auf Kompass und Verfolger — kein Small Talk, volle Konzentration.",
        ortHinweis: "Von der sonstigen Lässigkeit keine Spur: Tom hält das Ruder mit beiden Händen, den Blick abwechselnd auf den Kompass und zurück über die Reling gerichtet, wo irgendwo im Nebel das fremde Schiff steckt. Kein Raum für Small Talk — Knoten-Streich und Ruder-Bitte sind für diese Szene deshalb ausgesetzt, genau wie im Sturm."
      }
    },
    interaktionen: {
      "tom_lotse_sturm": {
        title: "Tom — Am Ruder, mit losem Mundwerk",
        kurz: "Reiner Rollenspiel-Moment, keine Probe. Lockerer Spruch, ggf. Callback auf den Knoten-Streich, schickt Spieler weiter zu einer Sturm-Stelle, die Hilfe braucht.",
        nurSzenen: ["3.1"],
        details: "Tom bleibt fest am Ruder — er kann und wird seinen Posten nicht verlassen, Harwick verlässt sich blind auf ihn. Kommen Spieler trotzdem in seine Nähe, hat er selbst jetzt noch einen lockeren Spruch auf den Lippen:\n\n„Halt dich fest, ich spring für dich bestimmt nicht ins Wasser!“\n\nCallback: Kam der Knoten-Streich (siehe Interaktion \"Der Knoten-Streich\") bei diesem Spieler gut an (Trigger \"durchschaut_witzig\" war gesetzt), spielt Tom zusätzlich darauf an.\n\nDa er selbst nicht vom Ruder weg kann, schickt er die Spieler stattdessen dorthin, wo gerade tatsächlich Hilfe gebraucht wird — er hat als Steuermann den besten Überblick übers Deck. Welche Stelle er nennt (Cormacs Segel-Notlage am Oberdeck, die losgerissene Kanone am Batteriedeck, oder der Wassereinbruch im Frachtraum), liegt im Ermessen des Spielleiters, z.B. je nachdem, was gerade noch ungelöst ist (vgl. Design-Prinzip \"Gutes Rollenspiel schlägt Mechanik\").\n\nBewusst keine Probe und kein Ruf-Effekt — reiner Charaktermoment, ähnlich wie Josiah in der Kombüse.",
        trigger: [
          { id: "ausgeloest", label: "Moment ausgelöst (Spieler in Toms Nähe)", info: "Tom bleibt fest am Ruder — er kann und wird seinen Posten nicht verlassen. Kommen Spieler in seine Nähe: „Halt dich fest, ich spring für dich bestimmt nicht ins Wasser!“" },
          { id: "callback_gebracht", label: "Callback auf Knoten-Streich gebracht (falls zutreffend)", info: "Kam der Knoten-Streich bei diesem Spieler gut an (Trigger \"durchschaut_witzig\"), spielt Tom zusätzlich darauf an." },
          { id: "weitergeschickt", label: "Spieler zu einer Sturm-Stelle weitergeschickt", info: "Er schickt die Spieler dorthin, wo Hilfe gebraucht wird (Cormacs Segel-Notlage, die losgerissene Kanone, oder der Wassereinbruch) — SL-Ermessen, je nachdem was noch ungelöst ist. Bewusst keine Probe, kein Ruf-Effekt." }
        ]
      },
      "knoten_streich": {
        title: "Tom Fletcher — Der Knoten-Streich",
        kurz: "Schickt den Spieler mit dem niedrigsten Seefahrt-Wert los, um \"mehr Knoten\" aus dem Frachtraum zu holen. Reaktion entscheidet über Ruf.",
        nichtInSzenen: ["3.1", "10.1"], // setzt voraus, dass Tom entspannt am Ruder steht - im Sturm/auf der Flucht kämpft/konzentriert er sich aufs Ruder
        details: "Tom hält Kurs, wirkt dabei kaum bei der Sache. Er liest die Gruppe schnell und wendet sich beiläufig an den Spieler mit dem niedrigsten Seefahrt-Wert (objektiver Vergleich der Charakterbögen, kein Bauchgefühl).\n\n„Wir sind zu langsam. Lauf runter in den Frachtraum, hol mir ein paar Knoten mehr.“\n\nSpielt mit dem echten Fachbegriff (Geschwindigkeit wird per Logleine mit Knoten gemessen) — kein erfundener Unsinn, sondern Fachjargon als Falle. Ein erfahrener Seemann würde sofort erkennen, dass man Geschwindigkeit nicht „nachfüllen“ kann.\n\nReaktion des angesprochenen Spielers entscheidet:\n— Durchschaut den Witz, reagiert locker/witzig → kleiner Ruf-Plus bei Tom\n— Durchschaut, reagiert genervt/vorwurfsvoll → neutral\n— Ignoriert/geht nicht drauf ein → neutral\n— Läuft tatsächlich los, um Knoten zu holen → kleiner Ruf-Minus bei Tom\n\nVerbindung: Läuft der Spieler tatsächlich in den Frachtraum, trifft er dort je nach Timer-Stand entweder auf die versteckten Hände des Jungen oder einen leeren Raum (siehe Frachtraum-Bildvariante).",
        trigger: [
          { id: "streich_ausgeloest", label: "Streich ausgelöst", info: "Tom wendet sich an den Spieler mit dem niedrigsten Seefahrt-Wert: „Wir sind zu langsam. Lauf runter in den Frachtraum, hol mir ein paar Knoten mehr.“ Fachjargon als Falle — Geschwindigkeit lässt sich nicht „nachfüllen“." },
          { id: "durchschaut_witzig", label: "Durchschaut, reagiert witzig/locker → Ruf-Plus", info: "Durchschaut den Witz, reagiert locker/witzig → kleiner Ruf-Plus bei Tom." },
          { id: "durchschaut_genervt", label: "Durchschaut, reagiert genervt/ignoriert → neutral", info: "Durchschaut, reagiert genervt/vorwurfsvoll, oder ignoriert es → neutral." },
          { id: "losgelaufen", label: "Spieler läuft tatsächlich los → Ruf-Minus", info: "Läuft tatsächlich los, um Knoten zu holen → kleiner Ruf-Minus bei Tom. Im Frachtraum trifft er je nach Timer-Stand entweder auf den versteckten Jungen oder einen leeren Raum." }
        ]
      },
      "ruder_halten": {
        title: "Tom Fletcher — Ruder kurz halten",
        kurz: "Bittet einen zufälligen verbleibenden Spieler, das Ruder zu übernehmen, wenn jemand losläuft. Seefahrt-Probe entscheidet über Ruf.",
        nichtInSzenen: ["3.1", "10.1"], // im Sturm/auf der Flucht hält Tom das Ruder selbst mit beiden Händen fest - er gibt es nicht kurz ab
        details: "Läuft ein Spieler los (z.B. wegen des Knoten-Streichs) und bleiben andere zurück, bittet Tom beiläufig einen zufälligen der Verbliebenen, kurz zu übernehmen — und verschwindet dann selbst.\n\n„Halt mal kurz, ja? Nur geradeaus. Bin gleich wieder da.“\n\n— Greift sofort zu, Seefahrt-Probe gelingt (bei Körper ≤2 zusätzlich Körper-Probe nötig, beide müssen gelingen) → Ruf-Plus bei Tom\n— Greift zu, Probe(n) misslingen, Kontrolle verloren (Ruder schlägt aus o.ä.) → Ruf-Minus bei Tom\n— Lehnt ab / zögert → neutral, kein Risiko",
        trigger: [
          { id: "angefragt", label: "Tom fragt nach Ruder-Übernahme", info: "Tom bittet beiläufig einen zufälligen der Verbliebenen: „Halt mal kurz, ja? Nur geradeaus. Bin gleich wieder da.“ — und verschwindet selbst." },
          { id: "angenommen_erfolg", label: "Angenommen, Probe(n) erfolgreich → Ruf-Plus", info: "Greift sofort zu, Seefahrt-Probe gelingt (bei Körper ≤2 zusätzlich Körper-Probe nötig, beide müssen gelingen) → Ruf-Plus bei Tom." },
          { id: "angenommen_misserfolg", label: "Angenommen, Kontrolle verloren → Ruf-Minus", info: "Greift zu, Probe(n) misslingen, Kontrolle verloren (Ruder schlägt aus o.ä.) → Ruf-Minus bei Tom." },
          { id: "abgelehnt", label: "Abgelehnt / gezögert → neutral", info: "Lehnt ab oder zögert → neutral, kein Risiko." }
        ]
      },
      "knotenwettstreit": {
        title: "Tom — Der Knotenwettstreit",
        kurz: "Tom fordert zum Wettstreit im schnellen Knotenbinden heraus. Geschick-Probe, rein für Spaß und Prahlrecht — kein Ruf-Effekt, keine Story-Relevanz.",
        nurSzenen: ["5.1"],
        details: "In der ruhigen Fahrt hat Tom sichtlich Langeweile — und Zeit für Unfug. Er wirft einem Spieler ein Stück Tauwerk zu: „Zeig mir einen Palstek, bevor ich bis fünf zähle. Los!“\n\nGeschick-Probe.\n\n— Guter Erfolg: Der Knoten sitzt tadellos, noch bevor Tom fertig gezählt hat. Er nickt anerkennend, verlangt sofort eine Revanche.\n— Normaler Erfolg: Knoten hält, aber knapp zu spät. Tom grinst: „Nicht schlecht — für einen Landbewohner.“\n— Schlechter Erfolg: Der Knoten hält gerade so, sieht aber aus wie ein Vogelnest. Tom lacht sich kaputt, bindet ihn demonstrativ in zwei Sekunden neu.\n— Misserfolg: Das Tauwerk verheddert sich komplett, Tom muss es selbst entwirren. „Also DAS lernt ihr an Land wohl nicht, was?“\n\nRein für den Spaß — kein Ruf-Effekt, keine weiteren Folgen. Kann beliebig oft wiederholt werden, wenn Tom gerade Lust hat.",
        trigger: [
          { id: "herausgefordert", label: "Tom fordert zum Knotenwettstreit heraus", info: "Er wirft einem Spieler ein Stück Tauwerk zu: „Zeig mir einen Palstek, bevor ich bis fünf zähle. Los!“" },
          { id: "guter_erfolg", label: "Guter Erfolg → Tom verlangt sofort Revanche", info: "Der Knoten sitzt tadellos, noch bevor Tom fertig gezählt hat. Er nickt anerkennend, verlangt sofort eine Revanche." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → knapp zu spät, hält aber", info: "Knoten hält, aber knapp zu spät. Tom grinst: „Nicht schlecht — für einen Landbewohner.“" },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → hält kaum, sieht chaotisch aus", info: "Der Knoten hält gerade so, sieht aber aus wie ein Vogelnest. Tom lacht sich kaputt." },
          { id: "misserfolg", label: "Misserfolg → Tauwerk verheddert sich komplett", info: "Das Tauwerk verheddert sich komplett, Tom muss es selbst entwirren." }
        ]
      },
      "kurs_aufs_riff": {
        title: "Tom — Kurs aufs Riff",
        kurz: "Tom erkennt: Die Golden Lion ist objektiv langsamer als der Verfolger, kennt aber ein riffgeschütztes Eiland in Reichweite, an dem das große Schiff nicht anlegen kann, und hält darauf zu. Reiner Erzählmoment, kein Wurf.",
        nurSzenen: ["10.1"],
        details: "Tom wirft einen Blick zurück in den Nebel, dann auf seine Karte, rechnet kurz im Kopf. Das Ergebnis gefällt ihm sichtlich nicht: „Die sind schneller. Nicht viel — aber genug.“\n\nEr hat trotzdem einen Plan: Ein kleines, riffgeschütztes Eiland liegt in erreichbarer Nähe — flaches Wasser, ein Riff, an dem ein Schiff mit dem Tiefgang des Verfolgers nicht anlegen kann. Kein Zufluchtsort auf Dauer, aber genug, um dem Kriegsschiff zu entkommen. Er legt das Ruder um und hält darauf zu.\n\nBewusst kein Wurf, keine Spieler-Aufgabe — Toms Entscheidung, die Spieler erleben sie nur mit.",
        trigger: [
          { id: "golden_lion_langsamer", label: "Tom erkennt: die Golden Lion ist objektiv langsamer", info: "„Die sind schneller. Nicht viel — aber genug.“ Ein Blick zurück in den Nebel, dann auf die Karte." },
          { id: "riffinsel_erkannt", label: "Tom kennt ein riffgeschütztes Eiland in Reichweite, hält darauf zu", info: "Flaches Wasser, ein Riff, an dem ein Schiff mit dem Tiefgang des Verfolgers nicht anlegen kann. Kein Zufluchtsort auf Dauer, aber genug, um zu entkommen." }
        ]
      },
      "ezra_am_mast": {
        title: "Ezra am Mast",
        kurz: "Optionale Wahrnehmungsprobe (keine Erschwernis, Muster wie \"Vielsagende Blicke\" im Sturm). Durchs Fernrohr wird erkennbar: der Verfolger hat eine Gestalt am Mast aufgeknüpft — Ezra Coombe, als Spott/Warnung ausgehängt.",
        nurSzenen: ["10.1"],
        details: "Nur wahrnehmbar, wenn ein Spieler aktiv das Fernrohr nimmt und den Verfolger genauer ansieht — nicht automatisch. Probe: Wahrnehmung, keine Erschwernis.\n\nBei Erfolg zeichnet sich durch den Nebel eine Gestalt am Mast des fremden Schiffs ab, hoch oben aufgeknüpft. Ein zweiter Blick lässt keinen Zweifel: Ezra Coombe, unabgeholt im spanischen Hafen zurückgeblieben (siehe ORTE.hafen_kneipe), jetzt als Spott und Warnung an den eigenen Mast gehängt. Der spanische Offizier lässt keinen Zweifel daran, dass er weiß, wen er da vor sich herjagt.\n\nKein Dialog, keine Erklärung an dieser Stelle — reiner, roher Schockmoment. SL-Ermessen, wie die Gruppe reagiert (Wut, Schuld, Entschlossenheit) und ob/wie das später aufgegriffen wird.",
        trigger: [
          { id: "fernrohr_probe", label: "Wahrnehmungsprobe versucht (Fernrohr auf den Verfolger)", info: "Nur wahrnehmbar, wenn ein Spieler aktiv das Fernrohr nimmt und den Verfolger genauer ansieht. Probe: Wahrnehmung, keine Erschwernis." },
          { id: "ezra_erkannt", label: "Erfolg — Ezra Coombe aufgeknüpft am Mast des Verfolgers erkannt", info: "Eine Gestalt zeichnet sich am Mast ab, hoch oben aufgeknüpft. Ein zweiter Blick: Ezra Coombe, als Spott und Warnung ausgehängt — der Offizier weiß, wen er verfolgt." }
        ]
      },
      "finte_gelingt": {
        title: "Die Finte gelingt",
        kurz: "Auflösungs-Beat: Der Verfolger nimmt den Köder der Licht-Finte (siehe Werkstatt), dreht ab. Golden Lion schlüpft dunkel ins Riff — Übergang zu Szene 11.1 (Riffinsel).",
        nurSzenen: ["10.1"],
        details: "Setzt voraus, dass die Licht-Finte aus der Werkstatt bereits ausgesetzt wurde (siehe dortige Interaktion). Minuten vergehen in völliger Stille, nur das Knarren des Rumpfs und gedämpfte Kommandos.\n\nDann: Weit hinten im Nebel hält das fremde Schiff plötzlich auf die treibende Laterne zu, statt weiter geradeaus. Die Finte hat funktioniert. An Bord der Golden Lion wagt niemand, laut aufzuatmen — noch nicht.\n\nTom hält Kurs, dunkel und lautlos, während sich vor ihnen langsam die Umrisse eines Riffs aus dem Nebel schälen. Die Golden Lion gleitet hindurch in ruhigeres Wasser dahinter. Übergang zur nächsten Szene (11.1, Riffinsel).",
        trigger: [
          { id: "verfolger_dreht_ab", label: "Der Verfolger nimmt den Köder, dreht auf die Laterne zu", info: "Weit hinten im Nebel hält das fremde Schiff plötzlich auf die treibende Laterne zu, statt weiter geradeaus — die Finte hat funktioniert." },
          { id: "golden_lion_schluepft_durch", label: "Golden Lion schlüpft dunkel durchs Riff — Übergang zu 11.1", info: "Tom hält Kurs, dunkel und lautlos, während sich die Umrisse eines Riffs aus dem Nebel schälen. Die Golden Lion gleitet hindurch in ruhigeres Wasser." }
        ]
      }
    }
  },

  "oberdeck": {
    personen: "Francesco Almeida",
    kurz: "Francesco lehnt an der Reeling, faulenzt statt zu beaufsichtigen. Kein Auftrag — freundliche Präsenz, ehrliche Einschätzungen auf Nachfrage.",
    ortHinweis: "Francesco hängt sich bei Spielern ein, die hier herumstehen, macht aber von sich aus nicht viel. Ohne Ansprache sehnt er sich hörbar nach Sonne und warmer Luft — \"nicht wie hier in diesem traurigen, grauen England\". Zahlt sich später aus, sobald die Golden Lion in der Karibik ankommt (deutliche Kontraständerung in seinem Auftreten möglich).",
    // 3.1 (Sturm): Francesco tritt hier nicht auf (siehe nichtInSzenen bei
    // "einschaetzungen" unten) - stattdessen zwei eigene Sturm-Interaktionen mit
    // Cormac und Ned (Juli 2026, Inhalt von Hendrik).
    szenenUeberschreibungen: {
      "3.1": {
        personen: "Cormac Daly · Ned Sharpe (situativ, stürzt) · Tom Fletcher (kommt später dazu) · Wat Crozier (situativ, rettet einen Spieler)",
        kurz: "Cormac ruft Befehle, schickt die geschicktesten Spieler zum Segel-Einschnüren hoch. Ned rutscht am Bug aus und wird übers Deck geschliffen — auffangbar. Später eskaliert es weiter: Mast reißt, Tom kommt vom Achterdeck dazu und steuert das Schiff per Anker auf eine Insel zu.",
        ortHinweis: "Regen peitscht fast waagerecht über das Deck, Blitze zerreißen den Himmel. Cormac steht mitten im Chaos und ruft Befehle — die Segel sind noch zu weit draußen, es droht, den Mast abzureißen, wenn sie nicht bald eingeschnürt werden.\n\nKommen Spieler in seine Nähe, schickt er die zwei mit dem höchsten Geschick-Wert hoch in die Takelage (siehe Interaktion \"Segel einschnüren\").\n\nEin paar Minuten später (SL-Ermessen) eskaliert die Lage weiter: Der Mast reißt trotzdem, das Ruder klemmt, und Tom kommt vom Achterdeck aufs Oberdeck — siehe Interaktion \"Der Höhepunkt des Sturms\"."
      },
      "5.1": {
        // Reiner Flavor-Zusatz, kein Plot-Gewicht.
        ortHinweis: "Francesco lehnt an der Reling und blickt der schwindenden Insel hinterher, als würde er einem Liebsten nachtrauern — übertrieben theatralisch, eine Hand aufs Herz gepresst. „Ein paar Tage Sonne, und schon soll es vorbei sein? Grausames Schicksal.“ Wer ihn direkt anspricht, bekommt eine kleine, komplett improvisierte Trauerrede auf die Insel zu hören, inklusive einer imaginären Rose, die er theatralisch über die Reling ins Kielwasser wirft."
      },
      "10.1": {
        personen: "Cormac Daly",
        kurz: "Cormac befiehlt volle Segel und sämtliche Lichter aus, sobald der Verfolger gesichtet ist. Kein Raum für Francescos übliche Präsenz.",
        ortHinweis: "Volle Segel, so viel Tuch wie der Mast hergibt — und trotzdem kein einziges Licht an Bord. Cormac geht selbst von Laterne zu Laterne und löscht, was die Crew nicht schnell genug findet. Befehle werden nur noch geflüstert oder mit Handzeichen gegeben."
      }
    },
    interaktionen: {
      "sturm_hoehepunkt_tom": {
        title: "Der Höhepunkt des Sturms — Toms großer Moment",
        kurz: "Ein paar Minuten in den Sturm hinein: Mast reißt trotz eingezogener Segel, Ruder klemmt, Tom kommt aufs Oberdeck und steuert das Schiff per Anker auf eine Insel zu. Reiner Erzählmoment, kein Wurf.",
        nurSzenen: ["3.1"],
        details: "Ein paar Minuten in den Sturm hinein (Zeitpunkt liegt im Ermessen des Spielleiters) eskaliert die Lage weiter: Der Mast reißt — obwohl die Segel eingezogen wurden (siehe Interaktion \"Cormac — Segel einschnüren\"), reicht das gegen die Wucht des Sturms nicht. Gleichzeitig verzieht sich irgendetwas am Achterdeck so, dass das Ruder klemmt (siehe Achterdeck) — Tom kann dort nichts mehr ausrichten und kommt aufs Oberdeck. Praktisch die gesamte wichtige Crew versammelt sich dort.\n\nJetzt zeigt sich, was wirklich in Tom steckt — er ist kaum wiederzuerkennen: Er springt übers Deck, schaut immer wieder auf seinen kleinen Kompass, zieht Seile über verschiedene Winden und bringt sie richtig zum Bug. Er lehnt sich über die Reling, zählt leise in sich hinein, checkt wieder den Kompass. Irgendwie hält er so den Kurs — durch gezieltes Anker lassen rechts oder links steuert er das Schiff auf eine tropische Insel zu.\n\nBewusst kein Wurf, keine Spieler-Aufgabe — das ist Toms Moment, den die Spieler nur miterleben.\n\nAuflösung: Irgendwann lichtet sich der Sturm. Die übrigen Segel werden gehisst, Tom und Cormac dirigieren die Crew wie ein Orchester.\n\nZukunfts-Notiz: Fast alle an Bord denken, sie seien einfach gestrandet — tatsächlich war das genau der Ort, den Harwick über Tom ansteuern ließ. Der Reveal ist Teil der noch auszuarbeitenden Schatzinsel-Inhalte, nicht dieser Interaktion.",
        trigger: [
          { id: "mast_gerissen", label: "Mast reißt trotz eingezogener Segel", info: "Ein paar Minuten in den Sturm hinein eskaliert die Lage: Der Mast reißt — obwohl die Segel eingezogen wurden, reicht das gegen die Wucht des Sturms nicht." },
          { id: "ruder_klemmt", label: "Ruder klemmt, Tom kommt aufs Oberdeck", info: "Gleichzeitig verzieht sich irgendetwas am Achterdeck so, dass das Ruder klemmt — Tom kann dort nichts mehr ausrichten und kommt aufs Oberdeck. Praktisch die gesamte wichtige Crew versammelt sich dort." },
          { id: "tom_highlight", label: "Toms Anker-Manöver gezeigt (kein Wurf)", info: "Jetzt zeigt sich, was wirklich in Tom steckt: Er springt übers Deck, schaut immer wieder auf seinen Kompass, zieht Seile über verschiedene Winden. Durch gezieltes Anker lassen rechts oder links steuert er das Schiff auf eine tropische Insel zu. Bewusst kein Wurf, keine Spieler-Aufgabe — das ist Toms Moment." },
          { id: "sturm_endet", label: "Sturm lichtet sich, Tom & Cormac dirigieren die Crew", info: "Irgendwann lichtet sich der Sturm. Die übrigen Segel werden gehisst, Tom und Cormac dirigieren die Crew wie ein Orchester." }
        ]
      },
      "harwick_blicke_sturm": {
        title: "Vielsagende Blicke — Harwick und seine Offiziere",
        kurz: "Optionale Wahrnehmungs-Probe (keine Erschwernis). Harwick bleibt über seinen Karten, tauscht ernste Blicke mit seinen Offizieren — Vorahnung auf den späteren Reveal.",
        nurSzenen: ["3.1"],
        details: "Während an Deck der Höhepunkt des Sturms tobt, bleibt Harwick über seinen Karten in der Kapitänskajüte (siehe dortiger Sturm-Flavortext). Er schaut ernst hinaus.\n\nNur wahrnehmbar, wenn ein Spieler aktiv genau hinsieht (nicht automatisch). Probe: Wahrnehmung, keine Erschwernis.\n\nBei Erfolg bemerkt der Spieler vielsagende Blicke zwischen Harwick und seinen Offizieren — eine stille Verständigung, die andeutet, dass hier mehr im Gange ist, als es scheint. Kein Dialog, keine Erklärung an dieser Stelle, reine Vorahnung auf den späteren Reveal (dass die \"gestrandete\" Insel in Wahrheit Harwicks Ziel war).",
        trigger: [
          { id: "probe_versucht", label: "Wahrnehmungsprobe versucht", info: "Harwick bleibt über seinen Karten in der Kapitänskajüte, schaut ernst hinaus. Nur wahrnehmbar, wenn ein Spieler aktiv genau hinsieht. Probe: Wahrnehmung, keine Erschwernis." },
          { id: "erfolg_blicke", label: "Erfolg — vielsagende Blicke bemerkt", info: "Der Spieler bemerkt vielsagende Blicke zwischen Harwick und seinen Offizieren — eine stille Verständigung, die andeutet, dass hier mehr im Gange ist. Kein Dialog, keine Erklärung, reine Vorahnung." },
          { id: "ignoriert", label: "Spieler ignoriert die Szene / würfelt nicht", info: "Ohne aktives Hinsehen bleibt der Moment unbemerkt." }
        ]
      },
      "cormac_segel_sturm": {
        title: "Cormac — Segel einschnüren",
        kurz: "Cormac schickt die 2 Spieler mit dem höchsten Geschick-Wert in die Takelage. Geschick+10-Probe, um das Segel oben einzuschnüren. Guter Erfolg beeindruckt Cormac.",
        nurSzenen: ["3.1"],
        details: "Cormac steht an Deck und ruft Befehle — die Segel sind noch zu weit draußen, der Mast droht abgerissen zu werden, wenn sie nicht bald eingeschnürt werden. Kommen Spieler in seine Nähe, schickt er die zwei mit dem höchsten Geschick-Wert hoch in die Takelage (objektiver Vergleich der Charakterbögen).\n\nDer Aufstieg in der Takelage ist bei diesem Wetter gefährlich — Regen und Wind reißen an den Spielern, während oben das Segel eingeschnürt werden muss.\n\nProbe: Geschick+10.\n\n— Guter Erfolg: beeindruckt Cormac sichtbar\n— Normaler/Schlechter Erfolg: geschafft, kein besonderer Kommentar → neutral\n— Misserfolg: [OFFEN] Konsequenz noch nicht festgelegt\n\nGleichzeitig würfeln die übrigen Spieler an Deck Körper-Proben, um sich festzuhalten.",
        trigger: [
          { id: "ausgeloest", label: "Cormac schickt 2 Spieler hoch (höchstes Geschick)", info: "Cormac ruft Befehle — die Segel sind noch zu weit draußen, der Mast droht abgerissen zu werden. Er schickt die zwei Spieler mit dem höchsten Geschick-Wert hoch in die Takelage (objektiver Vergleich der Charakterbögen)." },
          { id: "aufstieg_gut", label: "Aufstieg: Guter Erfolg → beeindruckt Cormac", info: "Der Aufstieg in der Takelage ist bei diesem Wetter gefährlich. Probe: Geschick+10. Guter Erfolg: beeindruckt Cormac sichtbar." },
          { id: "aufstieg_normal", label: "Aufstieg: Normaler/Schlechter Erfolg → neutral", info: "Normaler/Schlechter Erfolg: geschafft, kein besonderer Kommentar → neutral." },
          { id: "aufstieg_misserfolg", label: "Aufstieg: Misserfolg", info: "Misserfolg: [OFFEN] Konsequenz noch nicht festgelegt." },
          { id: "deck_koerper", label: "Übrige Spieler: Körper-Probe zum Festhalten gewürfelt", info: "Gleichzeitig würfeln die übrigen Spieler an Deck Körper-Proben, um sich festzuhalten." }
        ]
      },
      "ned_sturz_sturm": {
        title: "Ned — Rutscht über das Deck",
        kurz: "Ned rutscht vorne am Bug aus und wird übers ganze Deck geschliffen. Auffangen möglich → Freund fürs Leben.",
        nurSzenen: ["3.1"],
        details: "Ned Sharpe rutscht vorne am Bug aus und wird übers ganze Deck geschliffen. Spieler können versuchen, ihn aufzufangen (Probe: Körper oder Geschick, [OFFEN] welche genau bzw. ob wahlweise).\n\n— Aufgefangen: Ned hat einen Freund fürs Leben gewonnen — großer, dauerhafter Ruf-Gewinn bei Ned\n— Nicht aufgefangen: [OFFEN] Konsequenz noch nicht festgelegt",
        trigger: [
          { id: "ausgeloest", label: "Ned rutscht aus und wird übers Deck geschliffen", info: "Ned Sharpe rutscht vorne am Bug aus und wird übers ganze Deck geschliffen. Spieler können versuchen, ihn aufzufangen (Probe: Körper oder Geschick, [OFFEN] welche genau)." },
          { id: "aufgefangen", label: "Aufgefangen → Freund fürs Leben (großer Ruf-Gewinn bei Ned)", info: "Aufgefangen: Ned hat einen Freund fürs Leben gewonnen — großer, dauerhafter Ruf-Gewinn bei Ned." },
          { id: "nicht_aufgefangen", label: "Nicht aufgefangen", info: "Nicht aufgefangen: [OFFEN] Konsequenz noch nicht festgelegt." }
        ]
      },
      "wat_rettung_sturm": {
        title: "Wat — Rettung über Bord",
        kurz: "SL bestimmt gezielt einen Spieler (keine Probe, keine Wahl) — er geht über Bord, bis Wat ihn im letzten Moment packt und zurückzieht. Reiner Erzählmoment, kein Wurf.",
        nurSzenen: ["3.1"],
        details: "Ein Spieler — vom Spielleiter gezielt bestimmt, keine Probe, keine Wahl — bekommt etwas gegen den Kopf oder wird von einer Welle erwischt. Alles wird schwarz und kalt. Über Bord zu gehen ist in diesem Sturm ein Todesurteil.\n\nDoch dann: etwas schließt sich fest wie ein Schraubstock um Arm oder Bein. Mit einem Ruck wird der Spieler zurück in die Realität gerissen — schmerzhaft, roh. Wats Gesicht erscheint an der Reling, der Griff eisern.\n\nFür besseren Halt hat er sich sogar selbst losgebunden. (GM-Hinweis: Ein erfahrener Seemann sichert sich bei einem solchen Sturm eigentlich immer irgendwo fest, um nicht selbst über Bord zu gehen — Wat gibt genau das auf, um den Spieler zu erreichen.) Er zieht den Spieler zurück an Bord.\n\nStatt sich selbst wieder zu sichern, nutzt er das Seil, um den Spieler festzuzurren — und eilt sofort weiter, um mit einem anderen Seemann Taue zum Absichern des Hauptmasts zu spannen.",
        trigger: [
          { id: "spieler_ueber_bord", label: "SL bestimmt einen Spieler — er geht über Bord, alles wird schwarz", info: "Ein vom Spielleiter gezielt bestimmter Spieler (keine Probe, keine Wahl) bekommt etwas gegen den Kopf oder wird von einer Welle erwischt. Über Bord zu gehen ist in diesem Sturm ein Todesurteil." },
          { id: "wats_griff", label: "Etwas packt Arm/Bein fest wie ein Schraubstock — Wat zieht ihn zurück", info: "Etwas schließt sich fest wie ein Schraubstock um Arm oder Bein. Mit einem Ruck wird der Spieler zurückgerissen — Wats Gesicht erscheint an der Reling, der Griff eisern." },
          { id: "wat_bindet_sich_los", label: "Wat hat sich für besseren Halt selbst losgebunden, um zu retten", info: "Für besseren Halt hat er sich sogar selbst losgebunden (GM-Hinweis: ein erfahrener Seemann sichert sich eigentlich immer fest — Wat gibt genau das auf, um den Spieler zu erreichen)." },
          { id: "spieler_gesichert", label: "Wat zurrt den Spieler fest, statt sich selbst zu sichern, und eilt weiter zum Hauptmast", info: "Statt sich selbst wieder zu sichern, nutzt er das Seil, um den Spieler festzuzurren — und eilt sofort weiter, um mit einem anderen Seemann Taue zum Absichern des Hauptmasts zu spannen." }
        ]
      },
      "einschaetzungen": {
        title: "Francesco — Ehrliche Einschätzungen",
        kurz: "Auf direkte Frage nach anderen Personen: ehrliche, nie proaktiv genannte Meinung. Kein Trigger/Ruf-Effekt, reine Charakterinfo.",
        nichtInSzenen: ["3.1", "10.1"], // Ruhiges Gespräch - passt weder zum Sturm noch zur Flucht, in denen laut Szenentext alle beschäftigt sind
        details: "Fragt man Francesco gezielt nach jemandem, gibt er seine ehrliche Einschätzung — nie von sich aus, nur auf Nachfrage.\n\n— Harwick: warm, respektvoll, fast bewundernd\n— Cormac: freundlich-distanziert, \"zu streng\"\n— Wat: reserviert, spürbares Unbehagen, hält nicht viel von ihm\n— Tom: \"Der ehrlichste Betrüger, den er kennt\" — durchschaut ihn, mag ihn trotzdem\n— Josiah: \"Eine gute Seele\" — schlägt vor, ihn in der Kombüse zu besuchen, falls die Spieler ihn noch nicht kennen (organische Weiterleitung)\n— Dirk: \"Fast mit dem Schiff verwachsen\", lieber in Gesellschaft von Kanonen/Werkzeug als Menschen — bester Ansprechpartner bei Reparaturen, beeilt sich dabei nur, um die Spieler wieder loszuwerden",
        trigger: [
          { id: "gefragt_harwick", label: "Nach Harwick gefragt", info: "Harwick: warm, respektvoll, fast bewundernd." },
          { id: "gefragt_cormac", label: "Nach Cormac gefragt", info: "Cormac: freundlich-distanziert, \"zu streng\"." },
          { id: "gefragt_wat", label: "Nach Wat gefragt", info: "Wat: reserviert, spürbares Unbehagen, hält nicht viel von ihm." },
          { id: "gefragt_tom", label: "Nach Tom gefragt", info: "Tom: \"Der ehrlichste Betrüger, den er kennt\" — durchschaut ihn, mag ihn trotzdem." },
          { id: "gefragt_josiah", label: "Nach Josiah gefragt (Kombüse-Hinweis gegeben)", info: "Josiah: \"Eine gute Seele\" — schlägt vor, ihn in der Kombüse zu besuchen, falls die Spieler ihn noch nicht kennen." },
          { id: "gefragt_dirk", label: "Nach Dirk gefragt", info: "Dirk: \"Fast mit dem Schiff verwachsen\", lieber in Gesellschaft von Kanonen/Werkzeug als Menschen — bester Ansprechpartner bei Reparaturen." }
        ]
      },
      "wuerfelspiel": {
        title: "Francesco — Ein Würfelspiel",
        kurz: "Francesco schlägt ein simples Würfelspiel vor (höher gewürfelt gewinnt), reiner Zufall, kleine imaginäre Einsätze — nichts Ernstes, kein Ruf-Effekt.",
        nurSzenen: ["5.1"],
        details: "Francesco holt zwei abgewetzte Würfel aus der Tasche, wedelt einladend damit: „Ein Spielchen? Wer höher würfelt, hat gewonnen — wer verliert, erzählt eine peinliche Geschichte.“ Reiner Zufall, keine Probe nötig, einfach würfeln (SL-Ermessen, z.B. zwei W6 oder ein einfacher d100-Vergleich).\n\n— Spieler gewinnt deutlich: Francesco verliert sichtbar unwillig, muss eine (frei erfundene) peinliche Geschichte aus seiner Heimat zum Besten geben.\n— Knappes Ergebnis, egal wer gewinnt: Beide lachen, Francesco schlägt sofort eine Revanche vor.\n— Francesco gewinnt deutlich: Grinst triumphierend, verlangt vom Spieler die versprochene peinliche Geschichte — und hört mit ehrlichem Interesse zu, ganz ohne Spott.\n\nRein für die Stimmung, keine mechanischen Folgen, kein Ruf-Effekt.",
        trigger: [
          { id: "vorschlag", label: "Francesco schlägt das Würfelspiel vor", info: "Er holt zwei abgewetzte Würfel aus der Tasche: „Ein Spielchen? Wer höher würfelt, hat gewonnen — wer verliert, erzählt eine peinliche Geschichte.“" },
          { id: "spieler_gewinnt", label: "Spieler gewinnt deutlich → Francesco erzählt eine peinliche Geschichte", info: "Francesco verliert sichtbar unwillig, muss eine (frei erfundene) peinliche Geschichte aus seiner Heimat zum Besten geben." },
          { id: "unentschieden", label: "Knappes Ergebnis → Francesco fordert Revanche", info: "Beide lachen, Francesco schlägt sofort eine Revanche vor." },
          { id: "francesco_gewinnt", label: "Francesco gewinnt deutlich → Spieler muss erzählen", info: "Francesco verlangt die versprochene peinliche Geschichte — und hört mit ehrlichem Interesse zu, ganz ohne Spott." }
        ]
      },
      "volle_segel_lichter_aus": {
        title: "Cormac — Volle Segel, Lichter aus",
        kurz: "Direkt nach der Sichtung: Cormacs Befehl an die gesamte Crew — jedes Segel setzen, jede Laterne löschen, ab jetzt nur noch geflüsterte Befehle.",
        nurSzenen: ["10.1"],
        details: "Kaum ist klar, dass das fremde Schiff der Golden Lion folgt, hallt Cormacs Stimme knapp über Deck — das letzte Mal, dass heute Nacht jemand laut ruft: „Alle Segel setzen! Jedes Licht aus, sofort!“\n\nDie Crew reagiert sofort und routiniert. Segel um Segel geht hoch, bis der Mast so viel Tuch trägt, wie er hergibt. Gleichzeitig löschen Männer eine Laterne nach der anderen oder decken sie ab — wer nicht schnell genug ist, bekommt sie von Cormac persönlich aus der Hand genommen.\n\nAb jetzt läuft alles im Dunkeln: Befehle nur noch geflüstert oder per Handzeichen, jeder Handgriff an Tauwerk und Winden praktisch blind. Spieler, die mit anpacken wollen, können das ohne Probe — es gibt hier genug zu tun für jeden.",
        trigger: [
          { id: "befehl_volle_segel", label: "Cormacs Befehl: alle Segel setzen, jedes Licht aus", info: "„Alle Segel setzen! Jedes Licht aus, sofort!“ — das letzte Mal, dass heute Nacht jemand laut ruft." },
          { id: "lichter_geloescht", label: "Jede Laterne wird gelöscht oder abgedeckt", info: "Wer nicht schnell genug ist, bekommt seine Laterne von Cormac persönlich aus der Hand genommen." },
          { id: "ab_jetzt_dunkel_gefluestert", label: "Ab jetzt: nur noch geflüsterte Befehle, Arbeit im Dunkeln", info: "Befehle nur noch geflüstert oder per Handzeichen, jeder Handgriff praktisch blind. Spieler können ohne Probe mit anpacken." }
        ]
      }
    }
  },

  "bug": {
    personen: "Ned Sharpe · Ezra Coombe",
    kurz: "Unterhalten sich über den Bordellbesuch. Reaktion hängt vom Bordell-Ausgang des jeweiligen Spielers ab (vier Varianten).",
    ortHinweis: "Beziehen sich konkret auf den Raubein-Vorfall im Bordell (der raue Gast, Constance' Reaktion) — kein allgemeines, unverfängliches Geplauder.",
    // 5.1 (nach der Insel): Ezra liegt krank im Unterdeck, kann hier nicht
    // mit Ned zusammenstehen - siehe "bordell_nachklang" (nichtInSzenen)
    // und den ortHinweis-Ersatz. Reiner Flavor-Zusatz, kein Plot-Gewicht.
    szenenUeberschreibungen: {
      "5.1": {
        personen: "Ned Sharpe (allein)",
        kurz: "Ned lungert ohne Ezra am Bug — und ohne sein übliches Publikum.",
        ortHinweis: "Ned Sharpe lungert allein am Bug — ohne Ezra fehlt ihm offenbar das Publikum. Er fängt bei jedem Vorbeigehenden dieselbe Sturm-Geschichte an, jedes Mal ein bisschen dramatischer als beim letzten Mal (inzwischen hat er angeblich drei Mann im Alleingang aus den Wellen gezogen). Irgendwann brüllt Tom quer übers Deck: „Beim letzten Mal warst du selbst derjenige, der gerettet werden musste!“ — Ned zieht sich kurz beleidigt zurück, fängt bei der nächsten Gelegenheit aber wieder von vorne an."
      },
      "10.1": {
        personen: "Ausguck (namenlos)",
        kurz: "Kein Platz für Bordell-Geplauder — vorderster, dunkler Ausguck-Posten, kein Licht erlaubt.",
        ortHinweis: "Vorderster Punkt des Schiffs, Ausguck in beide Richtungen. Kein Licht ist hier erlaubt — jede Laterne würde die eigene Position verraten. Nebelschwaden ziehen dicht über das Wasser, dahinter, kaum auszumachen, dunkle Formen, die Riffe sein könnten. Oder auch nicht."
      }
    },
    interaktionen: {
      "bordell_nachklang": {
        title: "Ned & Ezra — Nachklang aus dem Bordell",
        kurz: "Reaktion variiert je nachdem, wie der Spieler die Raubein-Szene im Bordell gelöst hat (oder ob er überhaupt dort war).",
        nichtInSzenen: ["5.1", "10.1"], // 5.1: Ezra liegt krank im Unterdeck. 10.1: Ezra ist beim Spanier zurückgeblieben, siehe "ezra_am_mast" (achterdeck)
        details: "Ned und Ezra reden über den Bordellbesuch, konkret über den Vorfall mit dem groben Gast und Constance' Reaktion darauf. Erkennen einen vorbeikommenden Spieler, falls der dort war — mit deutlich unterschiedlichem Ton je nach Ausgang:\n\n— War dort, hat physisch eingegriffen (Raubein-Szene, Bordell): warm, fast bewundernd — erzählen die Geschichte nochmal nach, mit kleinen Übertreibungen\n— War dort, hat sozial deeskaliert: anerkennend, ruhiger, würdigend, weniger überschwänglich\n— War dort, hat nicht eingegriffen: erkennen den Spieler, aber kühler — knapper, leicht distanzierter Kommentar, kein offener Vorwurf\n— War nicht dort: Ned wird sichtlich unangenehm berührt, wechselt das Thema — reine Verlegenheit, keine Folge",
        trigger: [
          { id: "physisch", label: "Spieler hatte Raubein-Szene physisch gelöst → warm/bewundernd", info: "War dort, hat physisch eingegriffen: warm, fast bewundernd — erzählen die Geschichte nochmal nach, mit kleinen Übertreibungen." },
          { id: "sozial", label: "Spieler hatte sozial deeskaliert → anerkennend", info: "War dort, hat sozial deeskaliert: anerkennend, ruhiger, würdigend, weniger überschwänglich." },
          { id: "nicht_eingegriffen", label: "War dort, nicht eingegriffen → kühl/distanziert", info: "War dort, hat nicht eingegriffen: erkennen den Spieler, aber kühler — knapper, leicht distanzierter Kommentar, kein offener Vorwurf." },
          { id: "nicht_dort", label: "War nicht dort → Ned unangenehm, Themawechsel", info: "War nicht dort: Ned wird sichtlich unangenehm berührt, wechselt das Thema — reine Verlegenheit, keine Folge." }
        ]
      },
      "weitspuckwettbewerb": {
        title: "Ned — Der Weitspuckwettbewerb",
        kurz: "Ned fordert zum Weitspucken über die Reling heraus. Geschick-Probe, rein alberner Zeitvertreib, kein Ruf-Effekt.",
        nurSzenen: ["5.1"],
        details: "Zwischen zwei Sturmgeschichten kommt Ned auf eine seiner Ansicht nach brillante Idee: „Wetten, ich spuck weiter als du?“ Er tritt an die Reling, spuckt theatralisch weit hinaus, wischt sich stolz den Mund ab — und fordert jeden Vorbeikommenden zum Duell.\n\nGeschick-Probe.\n\n— Guter Erfolg: Der Spieler übertrifft Ned deutlich — der ist ehrlich beeindruckt und fast ein bisschen eingeschnappt.\n— Normaler Erfolg: Ordentliches Ergebnis, Ned erklärt sich trotzdem knapp zum Sieger („Wind stand ungünstig für dich“).\n— Schlechter Erfolg: Kläglicher Versuch, kaum über die Reling hinaus. Ned feiert sich lautstark selbst.\n— Misserfolg: Der Wind dreht im ungünstigsten Moment. Ned lacht Tränen, erzählt es garantiert noch beim Abendessen weiter.\n\nRein albern, kein Ruf-Effekt, keine Folgen.",
        trigger: [
          { id: "herausgefordert", label: "Ned fordert zum Weitspuckwettbewerb heraus", info: "„Wetten, ich spuck weiter als du?“ Er tritt an die Reling, spuckt theatralisch weit hinaus." },
          { id: "guter_erfolg", label: "Guter Erfolg → Ned ehrlich beeindruckt", info: "Der Spieler übertrifft Ned deutlich — der ist ehrlich beeindruckt und fast ein bisschen eingeschnappt." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → Ned erklärt sich trotzdem zum Sieger", info: "Ordentliches Ergebnis, Ned erklärt sich trotzdem knapp zum Sieger: „Wind stand ungünstig für dich.“" },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → kläglicher Versuch", info: "Kläglicher Versuch, kaum über die Reling hinaus. Ned feiert sich lautstark selbst." },
          { id: "misserfolg", label: "Misserfolg → Wind dreht im ungünstigsten Moment", info: "Der Wind dreht im ungünstigsten Moment. Ned lacht Tränen, erzählt es garantiert noch beim Abendessen weiter." }
        ]
      },
      "riff_ausguck": {
        title: "Riff-Ausguck",
        kurz: "Wahrnehmungs-/Seefahrtsprobe, das Riff im Nebel rechtzeitig zu erkennen. Misserfolg = kein Abbruch, aber 1 Schadenspunkt (Schramme am Rumpf).",
        nurSzenen: ["10.1"],
        details: "Wer am Bug Ausguck hält, ist der oder die Erste, die etwas von der Gefahr voraus sieht — nicht der Verfolger, sondern das eigene Riff, auf das die Golden Lion zuhält. Im Nebel und der Dunkelheit ist das keine leichte Aufgabe.\n\nProbe: Wahrnehmung oder Seefahrt.\n\n— Erfolg: Das Riff wird rechtzeitig erkannt und ausgerufen (leise!) — Tom kann sauber gegensteuern, kein Schaden.\n— Misserfolg: kein Abbruch, die Golden Lion findet den Weg trotzdem, aber streift dabei Fels — 1 Schadenspunkt (Muster wie die losgerissene Kanone im Sturm: Schaden bleibt bestehen, kann sich später auswirken).\n\nMehrere Spieler können nacheinander oder gemeinsam Ausguck halten, falls die erste Probe misslingt.",
        trigger: [
          { id: "ausguck_probe", label: "Wahrnehmungs-/Seefahrtsprobe versucht", info: "Wer am Bug Ausguck hält, muss im Nebel und der Dunkelheit das eigene Riff rechtzeitig erkennen." },
          { id: "riff_erkannt", label: "Erfolg → Riff rechtzeitig erkannt, Tom steuert sauber gegen", info: "Das Riff wird rechtzeitig erkannt und leise ausgerufen — Tom kann sauber gegensteuern, kein Schaden." },
          { id: "riff_gestreift", label: "Misserfolg → Rumpf streift Fels, 1 Schadenspunkt", info: "Kein Abbruch, die Golden Lion findet den Weg trotzdem, streift dabei aber Fels — 1 Schadenspunkt, kann sich später auswirken." }
        ]
      }
    }
  },

  "batteriedeck": {
    personen: "Dirk van Hoorn · Trewin-Zwillinge",
    kurz: "Dirk nur bei echter Mechanik-Probe/kaputtem Objekt zugänglich, mit Payoff in der Sturm-Szene. Trewin-Zwillinge reagieren auf den Trinkwettbewerb-Ausgang.",
    ortHinweis: "Durchgehende Kanonenreihe, wenig Ordnung — passt zum Marker-Hinweis \"so viele Kanonen für ein einfaches Begleitschiff?\".",
    // 3.1 (Sturm): bewusst OHNE Dirk/Trewin-Zwillinge namentlich - siehe
    // "kanone_sturm" unten ("Bewusst keine Namen... Dirk hilft zwar mit, wird
    // aber nicht genannt"). Dirks Vertrauens-Interaktion und der Zwillinge-Kater
    // sind ohnehin per nichtInSzenen ausgesetzt.
    szenenUeberschreibungen: {
      "3.1": {
        personen: "Anonyme Crew (keine benannte Figur, siehe Hinweis)",
        kurz: "Losgerissene Kanone im Sturmchaos — anonyme Crew, keine benannten Figuren.",
        ortHinweis: "Wasser strömt in Schwällen von oben herein, das Deck liegt unter einer rutschigen Wasserschicht. Eine der Kanonen hat sich losgerissen und rollt bei jeder Welle bedrohlich hin und her. Lärm und Chaos, so weit man hört.\n\nBewusst keine Namen im Flavortext - Dirk hilft zwar mit und ruft Anweisungen, wird aber nicht genannt (siehe Interaktion \"Losgerissene Kanone\")."
      },
      "5.1": {
        // Reiner Flavor-Zusatz, kein Plot-Gewicht.
        ortHinweis: "Die Trewin-Zwillinge streiten sich lautstark darüber, wer von ihnen auf der Insel eigentlich die größere Krabbe „bezwungen“ hat — mit jeder Wiederholung wächst das Tier um eine Handbreit, mittlerweile sind sie bei „fast so groß wie ein Hund“ angelangt. Dirk poliert daneben stoisch eine Kanone und ignoriert beide komplett, bis einer der Zwillinge ihn als Zeugen aufrufen will — dann hebt er nur kurz den Blick, sagt kein Wort, und poliert weiter."
      },
      "10.1": {
        personen: "Dirk van Hoorn",
        kurz: "Kanonen geladen und bereit, aber striktes Feuerverbot — ein Schuss würde die Position verraten.",
        ortHinweis: "Die Kanonen sind geladen, die Lunten bereit — und trotzdem soll keine einzige abgefeuert werden. Jeder Blitz, jeder Knall würde verraten, wo genau sie sind. Dirk geht die Reihe entlang, prüft jede Lunte still, sagt kein Wort mehr als nötig."
      }
    },
    interaktionen: {
      "dirk_vertrauen": {
        title: "Dirk van Hoorn — Vertrauen durch Fachkenntnis",
        kurz: "Arbeitet allein, will nicht gestört werden. Nur echte Mechanik-/Handwerks-Probe oder kaputtes Objekt weckt Interesse — mit Payoff NACH der Sturm-Szene.",
        nichtInSzenen: ["3.1", "10.1"],
        details: "Dirk arbeitet für sich an Kanonen und Werkzeug, einsilbig und abweisend bei reinem Small Talk.\n\nAuslöser: eine echte Mechanik-/Handwerks-Probe oder ein konkretes kaputtes Objekt, das der Spieler mitbringt oder anspricht — reines fachlich klingendes Gerede reicht nicht.\n\nBei Erfolg taut er kurz auf, einigermaßen interessiert — und merkt sich den Spieler intern. Kein sofortiger großer Lohn: Erst später, NACH der Sturm-Szene (eigener, noch auszuarbeitender Programmpunkt), kommt Dirk mit einem kniffligen mechanischen Problem auf genau diesen Spieler zu — dort besteht dann die Chance auf einen großen Ruf-Gewinn.\n\n> Korrektur (Juli 2026): Ursprünglich stand hier \"in der Sturm-Szene\" — Dirks Payoff liegt aber NACH dem Sturm, nicht während. Die Kanonen-Szene während des Sturms selbst (siehe Interaktion \"kanone_sturm\" unten) bleibt bewusst anonym, ohne Dirk namentlich zu erwähnen.",
        trigger: [
          { id: "ausloeser_erfolgreich", label: "Mechanik-Probe/kaputtes Objekt erfolgreich → Dirk merkt sich Spieler", info: "Auslöser: eine echte Mechanik-/Handwerks-Probe oder ein konkretes kaputtes Objekt, das der Spieler mitbringt. Bei Erfolg taut Dirk kurz auf, einigermaßen interessiert — und merkt sich den Spieler intern." },
          { id: "sturm_payoff", label: "NACH der Sturm-Szene: Dirk kommt auf Spieler zu → große Ruf-Chance", info: "Kein sofortiger Lohn: Erst später, NACH der Sturm-Szene, kommt Dirk mit einem kniffligen mechanischen Problem auf genau diesen Spieler zu — dort besteht die Chance auf einen großen Ruf-Gewinn (siehe \"Dirks Zielinstrument\", Schiffswrack)." }
        ]
      },
      "kanone_sturm": {
        title: "Losgerissene Kanone",
        kurz: "Nur relevant, wenn Szene 3.1 aktiv ist. Mind. 3 kumulative Körper-Erfolge, um die Kanone zurück auf den Sockel zu stemmen. Guter Erfolg zählt doppelt (Fluff). Misserfolg = 1 Schaden.",
        nurSzenen: ["3.1"],
        details: "Nur relevant in der Sturm-Szene (3.1). Eine Kanone hat sich losgerissen und rollt bei jeder Welle bedrohlich hin und her (siehe Sturm-Flavortext des Batteriedecks).\n\nBewusst keine Namen, keine vorweggenommenen Handlungen im Flavortext — die Spieler wissen zu diesem Zeitpunkt nicht, wessen Position das ist oder wer die Aktion leitet. Dirk hilft zwar mit und ruft Anweisungen, wird aber nicht genannt.\n\nMehrere Spieler können gemeinsam beitragen, es muss nicht einer allein schaffen. Mindestens 3 kumulative erfolgreiche Körperproben nötig, um die Kanone zurück auf den Sockel zu stemmen.\n\n— Normaler oder Guter Erfolg zählt als ein Erfolg\n— Guter Erfolg zählt DOPPELT — reiner Fluff-Moment, keine mechanische Zusatzregel: Die Wucht beeindruckt sichtbar die umstehende Crew. Fällt irgendwann ein Guter Erfolg, braucht es danach nur noch einen weiteren normalen Erfolg\n— Misserfolg → 1 Schadenspunkt (von der Kanone gestreift / auf nassem Deck hingeschlagen)\n\nKein Ruf-Fokus — bleibt anonym im Chaos des Sturms.\n\nZukunfts-Notiz: Schaden aus dieser Szene bleibt bestehen und wirkt sich später auf der Schatzinsel aus — kann dort gefährlich werden oder einen Spieler ganz von der Schatzsuche ausschließen. Details folgen, wenn die Insel-Stationen ausgearbeitet werden.",
        trigger: [
          { id: "erfolg_gewertet", label: "Normaler/Guter Erfolg gewertet", info: "Mindestens 3 kumulative erfolgreiche Körperproben nötig, um die Kanone zurück auf den Sockel zu stemmen. Mehrere Spieler können gemeinsam beitragen." },
          { id: "erfolg_gut_doppelt", label: "Guter Erfolg → zählt doppelt (Fluff)", info: "Guter Erfolg zählt DOPPELT — reiner Fluff-Moment: Die Wucht beeindruckt sichtbar die umstehende Crew. Fällt ein Guter Erfolg, braucht es danach nur noch einen weiteren normalen Erfolg." },
          { id: "kanone_gesichert", label: "3 Erfolge erreicht → Kanone gesichert", info: "Die Kanone ist zurück auf dem Sockel gestemmt." },
          { id: "misserfolg_schaden", label: "Misserfolg → 1 Schadenspunkt (wirkt sich später auf Schatzinsel aus)", info: "Misserfolg → 1 Schadenspunkt (von der Kanone gestreift / auf nassem Deck hingeschlagen). Zukunfts-Notiz: Schaden bleibt bestehen und wirkt sich später auf der Schatzinsel aus." }
        ]
      },
      "trewin_kater": {
        title: "Trewin-Zwillinge — Nachwehen des Trinkwettbewerbs",
        kurz: "Reaktion hängt vom Ausgang des Trinkwettbewerbs in der Taverne ab (gewonnen / verloren / nie angetreten).",
        nichtInSzenen: ["3.1", "10.1"], // Kater-Szene passt weder zum Sturm-Chaos noch zur angespannten Flucht am selben Ort
        details: "Die Trewin-Zwillinge sind hier anzutreffen, ihr Zustand hängt vom Ausgang des Trinkspiels in der Taverne ab:\n\n— Gewonnen (Spieler hat sie unter den Tisch gesoffen): über Kreuz übereinander in einer Hängematte verkeilt, stöhnen vor Übelkeit, zanken sich gegenseitig an, dass der andere Platz machen soll — können sich kaum bewegen\n— Verloren: triumphierend, spöttisch gegenüber dem Spieler\n— Nie angetreten: neutral, ignorieren den Spieler weitgehend",
        trigger: [
          { id: "gewonnen", label: "Spieler hat Zwillinge besiegt → Kater-Szene", info: "Gewonnen (Spieler hat sie unter den Tisch gesoffen): über Kreuz übereinander in einer Hängematte verkeilt, stöhnen vor Übelkeit, zanken sich, dass der andere Platz machen soll." },
          { id: "verloren", label: "Spieler hat verloren → triumphierend/spöttisch", info: "Verloren: triumphierend, spöttisch gegenüber dem Spieler." },
          { id: "nie_angetreten", label: "Nie angetreten → neutral", info: "Nie angetreten: neutral, ignorieren den Spieler weitgehend." }
        ]
      },
      "schiedsrichter_gesucht": {
        title: "Die Trewin-Zwillinge — Schiedsrichter gesucht",
        kurz: "Die Zwillinge bitten einen Spieler, eine krude Seemannsweisheit per Wissens-Probe zu schlichten. Rein komödiantisch, kein Ruf-Effekt.",
        nurSzenen: ["5.1"],
        details: "Die Zwillinge streiten mal wieder — diesmal darüber, ob ein Albatros an Bord Unglück bringt oder Glück. Keiner gibt nach, also greifen sie sich den nächstbesten Spieler als Schiedsrichter: „Du wirkst gebildet. Sag ihm, dass ich recht habe.“\n\nWissen-Probe.\n\n— Guter Erfolg: Überzeugende, detailreiche Antwort — beide Zwillinge sind gleichermaßen beeindruckt und einigen sich sofort auf eine dritte, noch absurdere Theorie.\n— Normaler Erfolg: Brauchbare Antwort, einer der Zwillinge fühlt sich bestätigt, der andere schmollt kurz.\n— Schlechter Erfolg: Unsichere, vage Antwort — beide Zwillinge erklären sich gegenseitig für bestätigt und streiten munter weiter.\n— Misserfolg: Hörbar frei erfunden. Beide Zwillinge starren nur, dann streiten sie weiter, als wäre nichts gewesen.\n\nDirk (falls anwesend) verdreht bei alldem sichtbar die Augen, sagt aber kein Wort. Kein Ruf-Effekt, keine Folgen.",
        trigger: [
          { id: "schiedsrichter_gebeten", label: "Zwillinge bitten um Schlichtung (Albatros-Streit)", info: "„Du wirkst gebildet. Sag ihm, dass ich recht habe“ — Streit, ob ein Albatros an Bord Unglück oder Glück bringt." },
          { id: "guter_erfolg", label: "Guter Erfolg → beide beeindruckt, neue gemeinsame Theorie", info: "Überzeugende, detailreiche Antwort — beide Zwillinge einigen sich sofort auf eine dritte, noch absurdere Theorie." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → einer bestätigt, einer schmollt", info: "Brauchbare Antwort, einer der Zwillinge fühlt sich bestätigt, der andere schmollt kurz." },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → beide fühlen sich bestätigt, Streit geht weiter", info: "Unsichere, vage Antwort — beide Zwillinge erklären sich gegenseitig für bestätigt und streiten munter weiter." },
          { id: "misserfolg", label: "Misserfolg → hörbar frei erfunden, Streit geht unbeeindruckt weiter", info: "Hörbar frei erfunden. Beide Zwillinge starren nur, dann streiten sie weiter, als wäre nichts gewesen." }
        ]
      },
      "kanonen_bereithalten_kein_schuss": {
        title: "Kanonen bereit, striktes Feuerverbot",
        kurz: "Dirk lässt die Kanonen laden und die Lunten bereitmachen — Cormacs Befehl ist trotzdem eindeutig: nicht abfeuern. Ein Schuss würde die Position verraten.",
        nurSzenen: ["10.1"],
        details: "Für den Fall, dass die Finte nicht reicht, lässt Dirk die Kanonen laden und die Lunten bereitmachen — reine Vorsichtsmaßnahme, wortlos und routiniert. Cormacs Befehl dazu ist unmissverständlich: Es wird nicht geschossen, ganz gleich wie nah der Verfolger kommt. Jeder Blitz, jeder Knall würde in der Dunkelheit sofort verraten, wo genau die Golden Lion steckt — und damit die ganze Finte zunichtemachen.\n\nFür einen kampflustigen Spieler eine echte Zerreißprobe: die Kanonen sind griffbereit, der Gegner ist near — und trotzdem gilt eiserne Disziplin. Feuert jemand trotzdem (SL-Ermessen, ob ein Spieler das überhaupt versucht), hat das einen echten Preis: Die Position ist verraten, die Finte ist wertlos, der Verfolger hält direkt auf die Golden Lion zu.",
        trigger: [
          { id: "kanonen_geladen", label: "Kanonen geladen, Lunten bereit — reine Vorsichtsmaßnahme", info: "Dirk lässt die Kanonen laden und die Lunten bereitmachen, wortlos und routiniert." },
          { id: "feuerverbot", label: "Cormacs striktes Feuerverbot — ein Schuss würde die Position verraten", info: "Es wird nicht geschossen, ganz gleich wie nah der Verfolger kommt — jeder Blitz, jeder Knall würde die Position verraten und die Finte zunichtemachen." },
          { id: "verstoss_konsequenz", label: "Falls doch geschossen wird: Position verraten, Finte wertlos (SL-Ermessen)", info: "Feuert jemand trotzdem, hat das einen echten Preis: Die Position ist verraten, die Finte ist wertlos, der Verfolger hält direkt auf die Golden Lion zu." }
        ]
      }
    }
  },

  "werkstatt": {
    personen: "Schiffszimmermann · weitere Handwerker (namenlos)",
    kurz: "Ordentlicher als der Rest des Schiffs. Erster Spieler im Raum wird direkt eingespannt — Mechanik-Probe, nur die Extreme wirken sich auf den Ruf aus.",
    ortHinweis: "Mehrere gelernte Handwerker bei der Arbeit, spürbar ordentlicher als sonst auf dem Schiff. Gute Wahrnehmung oder Mechanik erkennt: keine einfachen Matrosen, sondern Leute vom Fach. Namenlose Crewmitglieder — bewusst kein Wiedererkennungs-Bogen, kein späterer Zahltag (anders als bei Dirk auf dem Batteriedeck).",
    // 5.1 (nach der Insel): reiner Flavor-Zusatz, kein Plot-Gewicht.
    szenenUeberschreibungen: {
      "5.1": {
        ortHinweis: "Die Handwerker sind hörbar zufrieden mit sich — wer hier hereinkommt, bekommt ungefragt erzählt, wessen Idee der entscheidende Hebel beim Freirollen von der Sandbank war. Jeder erzählt eine andere Version, jede macht ihn selbst zum eigentlichen Kopf der Aktion. Der Streit ist gutmütig, wird aber mit wachsender Lautstärke geführt, je länger man zuhört."
      },
      "10.1": {
        personen: "Sam Oakley · weitere Handwerker (namenlos)",
        kurz: "Kein normales Tageswerk — mit gedämpfter Stimme wird an einer Licht-Finte gebaut: ein behelfsmäßiger Mast mit Laterne fürs Beiboot.",
        ortHinweis: "Kein normales Tageswerk heute — mit gedämpfter Stimme und Behelfswerkzeug wird hier etwas zusammengebaut, das auf den ersten Blick keinen Sinn ergibt: ein Bündel Latten, grob zu einer Mastform gebunden, dazu eine einzige Laterne. Sam Oakley, der Zimmermannsgehilfe, hat die Arbeit übernommen — konzentriert, schnell, ohne unnötige Worte."
      }
    },
    interaktionen: {
      "eingespannt": {
        title: "Erster Spieler im Raum — direkt eingespannt",
        kurz: "Nur der erste Spieler, der den Raum betritt. Mechanik-Probe: Guter Erfolg = Ruf-Plus, Misserfolg = Ruf-Malus, beide mittleren Bänder neutral.",
        nichtInSzenen: ["10.1"], // in 10.1 arbeitet die Werkstatt konzentriert an der Licht-Finte, kein Raum fuer normale Alltagsauftraege
        details: "Der erste Spieler, der die Werkstatt betritt, wird ohne Umschweife eingespannt:\n\n„Schnapp dir den Fuchsschwanz und gib mir das auf 30 Zoll raus.“\n\n(Fuchsschwanz = Handsäge, benannt nach der spitz zulaufenden Blattform.) Der Mann am Tisch reicht ein Kanthol, schaut kaum auf, bleibt bei seiner eigenen Arbeit.\n\nMechanik-Probe:\n— Guter Erfolg: Schnitt exakt auf Maß, kurzes Nicken → Ruf-Gewinn\n— Normaler Erfolg: brauchbar, kein Kommentar → neutral\n— Schlechter Erfolg: sichtbar daneben, wortlos beiseitegelegt → neutral\n— Misserfolg: Kanthol splittert oder grob falsches Maß — einziger Moment, in dem er wirklich aufsieht → Ruf-Malus\n\nNachkommende Spieler bekommen keine eigene Aufgabe. Auf Nachfrage: „Wir kommen zurecht, geh zu Cormac, wenn du Arbeit suchst.“",
        trigger: [
          { id: "erster_eingespannt", label: "Erster Spieler eingespannt", info: "Der erste Spieler, der die Werkstatt betritt, wird ohne Umschweife eingespannt: „Schnapp dir den Fuchsschwanz und gib mir das auf 30 Zoll raus.“ Der Mann am Tisch reicht ein Kanthol, schaut kaum auf." },
          { id: "guter_erfolg", label: "Guter Erfolg → Ruf-Plus", info: "Guter Erfolg: Schnitt exakt auf Maß, kurzes Nicken → Ruf-Gewinn." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → neutral", info: "Normaler Erfolg: brauchbar, kein Kommentar → neutral." },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → neutral", info: "Schlechter Erfolg: sichtbar daneben, wortlos beiseitegelegt → neutral." },
          { id: "misserfolg", label: "Misserfolg → Ruf-Malus", info: "Misserfolg: Kanthol splittert oder grob falsches Maß — einziger Moment, in dem er wirklich aufsieht → Ruf-Malus. Nachkommende Spieler bekommen keine eigene Aufgabe: „Wir kommen zurecht, geh zu Cormac, wenn du Arbeit suchst.“" }
        ]
      },
      "schnitzwettbewerb": {
        title: "Handwerker — Kleiner Schnitzwettbewerb",
        kurz: "Ein gelangweilter Handwerker fordert zum Schnitzen einer möglichst überzeugenden Miniatur heraus. Geschick-Probe, reiner Zeitvertreib, kein Ruf-Effekt.",
        nurSzenen: ["5.1"],
        details: "Einer der Handwerker hat sichtlich Zeit übrig und ein Stück Treibholz in der Hand. „Schnitz was Ordentliches draus, und ich sag dir, dass du Talent hast.“ Reicht Messer und Holz herüber.\n\nGeschick-Probe.\n\n— Guter Erfolg: Eine erstaunlich detaillierte kleine Figur (SL-Ermessen, was genau) — der Handwerker ist ernsthaft beeindruckt, bietet an, sie zu behalten und in seiner Kammer auszustellen.\n— Normaler Erfolg: Erkennbare Form, nicht perfekt, aber solide. Anerkennendes Nicken.\n— Schlechter Erfolg: Unförmiger Klumpen, kaum als irgendetwas erkennbar. Herzhaftes Lachen, aber wohlwollend.\n— Misserfolg: Das Holz splittert komplett, vielleicht sogar ein kleiner Schnitt in den Finger. Der Handwerker nimmt kommentarlos Messer und Rest zurück.\n\nKein Ruf-Effekt, keine Folgen.",
        trigger: [
          { id: "herausgefordert", label: "Handwerker fordert zum Schnitzwettbewerb heraus", info: "„Schnitz was Ordentliches draus, und ich sag dir, dass du Talent hast.“ Reicht Messer und ein Stück Treibholz herüber." },
          { id: "guter_erfolg", label: "Guter Erfolg → Handwerker ernsthaft beeindruckt", info: "Eine erstaunlich detaillierte kleine Figur — der Handwerker bietet an, sie in seiner Kammer auszustellen." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → erkennbare, solide Form", info: "Erkennbare Form, nicht perfekt, aber solide. Anerkennendes Nicken." },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → unförmiger Klumpen", info: "Unförmiger Klumpen, kaum als irgendetwas erkennbar. Herzhaftes, wohlwollendes Lachen." },
          { id: "misserfolg", label: "Misserfolg → Holz splittert komplett", info: "Das Holz splittert komplett, vielleicht sogar ein kleiner Schnitt in den Finger." }
        ]
      },
      "die_lichter_finte": {
        title: "Die Licht-Finte",
        kurz: "Sam Oakley und die Handwerker bauen einen behelfsmäßigen Mast mit Laterne, montiert aufs Beiboot — als Köder ausgesetzt, während die Golden Lion selbst dunkel bleibt (Master-and-Commander-Trick).",
        nurSzenen: ["10.1"],
        details: "Sam Oakley hat die Idee, kaum dass Cormacs Befehl zu den Lichtern die Runde macht: Wenn die Golden Lion dunkel bleiben muss, soll wenigstens irgendwo ein Licht zu sehen sein — nur eben nicht an Bord.\n\nMit ein paar Latten, grobem Tauwerk und einer einzigen Laterne baut er zusammen mit den übrigen Handwerkern einen behelfsmäßigen Mast — grob, aber aus der Ferne im Nebel durchaus passabel. Interessierte Spieler können mithelfen (optionale Mechanik-Probe, kein Zwang, kein Fehlschlag-Ende — auch ohne Probe wird die Finte rechtzeitig fertig, ein guter Erfolg macht sie nur überzeugender).\n\nDer fertige Aufbau wird aufs Beiboot montiert, die Laterne entzündet, das Boot dann still zu Wasser gelassen und in eine andere Richtung als die geplante Fluchtroute treiben gelassen. Ob die Finte tatsächlich zieht, zeigt sich erst später (siehe Achterdeck, Interaktion \"Die Finte gelingt\").",
        trigger: [
          { id: "idee_lichter_finte", label: "Sam Oakleys Idee: ein Köder-Licht, aber nicht an Bord", info: "Kaum macht Cormacs Befehl zu den Lichtern die Runde, hat Sam die Idee: Wenn die Golden Lion dunkel bleiben muss, soll wenigstens irgendwo ein Licht zu sehen sein — nur nicht an Bord." },
          { id: "bau_der_finte", label: "Behelfsmäßiger Mast mit Laterne gebaut (optionale Mechanik-Probe, kein Fehlschlag-Ende)", info: "Aus Latten, grobem Tauwerk und einer Laterne entsteht ein behelfsmäßiger Mast — grob, aber im Nebel aus der Ferne passabel. Mithilfe optional, auch ohne Probe rechtzeitig fertig." },
          { id: "beiboot_ausgesetzt", label: "Aufbau aufs Beiboot montiert, Laterne entzündet, still zu Wasser gelassen", info: "Der fertige Aufbau wird aufs Beiboot montiert, die Laterne entzündet, das Boot still zu Wasser gelassen und in eine andere Richtung treiben gelassen als die geplante Fluchtroute." }
        ]
      }
    }
  },

  "unterdeck": {
    personen: "Crew (namenlos, rotierend schlafend)",
    kurz: "Der einzige ruhige Ort auf dem Schiff — als Falle angelegt. Durchqueren verlangt Geschick-/Geheim-Probe, Misserfolg kostet Ruf bei allen Anwesenden.",
    ortHinweis: "Enge Reihen fester Kojen (bewusst KEINE Hängematten), Vorhänge für ein wenig Privatsphäre — mehr Komfort, als man auf einem Schiff erwarten würde. Crew schläft in Schichten, rotierend, während andere Wache stehen. Wirkt wie ein Fettnäpfchen-Ort, ist aber außer im Misserfolgsfall folgenlos.",
    // 5.1 (nach der Insel): Ezra Coombe liegt hier, siehe schiffswrack-
    // Interaktion "eber_und_wundbrand" (Ausgangspunkt: Wildschwein-Verletzung,
    // Wundbrand/Sepsis, Amputation am Oberschenkel technisch unmöglich).
    // Diese Szene führt den Faden fort, statt ihn neu zu erfinden.
    szenenUeberschreibungen: {
      "5.1": {
        personen: "Ezra Coombe (im Krankenlager) · Silas Pott",
        kurz: "Silas Pott beschwichtigt Harwick nach außen (\"kleine Verletzung, komme klar\") — wer sich tatsächlich Zugang zum Krankenlager verschafft, sieht: das stimmt nicht.",
        ortHinweis: "Zwischen den sonst ruhigen, rotierend schlafenden Kojen liegt abseits ein zusätzliches Lager: Ezra Coombe, das Bein bandagiert, im Fieber. Silas Pott wechselt sichtlich ratlos die Umschläge — nach außen, Harwick gegenüber, spielt er die Lage herunter."
      }
    },
    interaktionen: {
      "durchqueren": {
        title: "Durchqueren des Unterdecks",
        kurz: "Geschick- oder Geheim-Probe. Erfolg = nichts passiert, Misserfolg = Gemecker + Ruf-Malus für alle anwesenden Spieler.",
        nichtInSzenen: ["5.1"], // in 5.1 ist das Unterdeck kein Fettnäpfchen-Ort mehr, sondern Ezras Krankenlager - siehe "ezras_wundbrand"
        details: "Spieler, die das Unterdeck durchqueren, während dort geschlafen wird, würfeln auf Geschick oder Geheim.\n\n— Erfolg: nichts, unauffällig durch\n— Misserfolg: Gemecker von den Gestörten, Ruf-Malus für alle anwesenden Spieler (nicht nur für den Verursacher)",
        trigger: [
          { id: "erfolg", label: "Erfolg → unauffällig durch", info: "Erfolg: nichts, unauffällig durch." },
          { id: "misserfolg", label: "Misserfolg → Gemecker, Ruf-Malus für alle Anwesenden", info: "Misserfolg: Gemecker von den Gestörten, Ruf-Malus für alle anwesenden Spieler (nicht nur für den Verursacher)." }
        ]
      },
      "ezras_wundbrand": {
        title: "Ezra Coombe — Der Wundbrand verschlimmert sich",
        kurz: "Fortsetzung von \"Der Eber und der Wundbrand\" (Schiffswrack). Zugang über Rhetorik/interessierten Austausch mit Silas Pott ODER Cormacs Befehl. Vor Ort: Amputation + entgiftende Arznei nötig, kleine Heilkräuter reichen nicht mehr — der nächste Hafen liegt nicht auf Harwicks Route.",
        nurSzenen: ["5.1"],
        details: "Harwick erkundigt sich bei Silas Pott nach Ezra, der seit dem Wildschwein-Angriff im Fieber liegt (siehe Schiffswrack-Interaktion \"Der Eber und der Wundbrand\"). Silas beruhigt den Kapitän: eine kleine Verletzung, damit komme er zurecht — konsistent mit seiner Angst um seinen Posten, die ihn schon bei der ersten Amputationsverweigerung getrieben hat.\n\nEin interessierter Spieler verschafft sich auf zwei möglichen Wegen Zugang zum Patienten: durch Rhetorik und einen interessierten Austausch mit Silas selbst, oder durch einen Befehl von Cormac. Vor Ort wird schnell klar, dass an Silas' Beschwichtigung nichts dran ist — er ist mit der Lage hoffnungslos überfordert. Das Bein hätte längst abgenommen werden müssen. Lila Adern ziehen sich das Bein hoch. Ezra schwitzt, bringt außer Stöhnen kaum ein Wort heraus.\n\nSchnell wird klar: Wenn nichts weiter unternommen wird, übersteht Ezra die Fahrt nicht. Das Bein muss ab, dazu braucht es entgiftende Arznei — kleine Heilkräuter helfen hier nicht mehr. Der nächste Hafen liegt allerdings nicht auf Harwicks Route (siehe Kapitänskajüte). Ob Ezra auch nur einen weiteren Tag übersteht, ist offen.\n\nDieser Moment ist bewusst die emotionale Gegenseite zur Kapitänskajüte-Interaktion \"Harwick — Wein und die Karten auf dem Schreibtisch\": Wer hier steht und sieht, wie es um Ezra bestellt ist, trägt dieses Wissen mit in ein mögliches Überzeugungs-Gespräch bei Harwick.",
        trigger: [
          { id: "zugang_rhetorik", label: "Zugang über Rhetorik/interessierten Austausch mit Silas Pott", info: "Ein interessierter Spieler verschafft sich durch Rhetorik und Austausch mit Silas Zugang zum Krankenlager." },
          { id: "zugang_cormac", label: "ODER: Zugang durch Cormacs Befehl", info: "Alternativ verschafft ein Befehl von Cormac Zugang zum Patienten." },
          { id: "silas_beschwichtigt_harwick", label: "Silas beschwichtigt Harwick nach außen — stimmt nicht", info: "Silas versichert dem Kapitän, es sei nur eine kleine Verletzung, mit der er zurechtkomme — konsistent mit seiner Angst um seinen Posten. Vor Ort zeigt sich: das stimmt nicht." },
          { id: "zustand_verschlechtert", label: "Bein hätte längst ab müssen, lila Adern, Ezra kaum ansprechbar", info: "Das Bein hätte längst abgenommen werden müssen. Lila Adern ziehen sich das Bein hoch. Ezra schwitzt, bringt außer Stöhnen kaum ein Wort heraus." },
          { id: "erkenntnis_todesnah", label: "Klar: Amputation + entgiftende Arznei nötig, nächster Hafen liegt nicht auf der Route", info: "Kleine Heilkräuter reichen nicht mehr. Ob Ezra auch nur einen weiteren Tag übersteht, ist offen.", grantsQuest: {
            warum: "Ohne Amputation und entgiftende Arznei übersteht Ezra die Fahrt nicht — kleine Heilkräuter reichen nicht mehr, und der nötige Hafen liegt nicht auf Harwicks derzeitigem Kurs.",
            was: "Harwick glaubwürdig überzeugen, Kurs auf den spanischen Hafen zu nehmen — oder in Kauf nehmen, dass Ezra die Fahrt nicht übersteht."
          } }
        ]
      }
    }
  },

  "frachtraum": {
    personen: "Der blinde Passagier (Waisenjunge, situativ) · Wat (situativ, bei Pfad B)",
    kurz: "Kein dauerhafter Aufenthaltsort, nur sporadisch besucht. Zentral für den blinden Passagier (Abschnitt 11) und Toms Knoten-Streich (Achterdeck).",
    ortHinweis: "Dunkel, still, vollgestopft — kein offenes Feuer erlaubt (Tauwerk, Segeltuch, trockener Proviant), nur gedämpftes Lukenlicht von oben. Zwei Bildvarianten: \"Standard\" (Hände hinter einer Kiste sichtbar, blinder Passagier versteckt, inkl. Zusatzsatz \"Habe ich da gerade etwas gehört? Bestimmt nur das Schiff.\") und \"Leer\" (Junge weg/gefunden, reiner Basistext). Umschaltung manuell im Admin-Panel unter Bildvarianten — wirkt sich sowohl auf das Spieler-Bild als auch auf den angezeigten Hinweistext aus.",
    // 3.1 (Sturm): löst das Varianten-System (Standard/Leer, blinder Passagier)
    // komplett ab - der Junge ist laut "wassereinbruch_sturm" kein Thema mehr im
    // Raum. Personen/kurz/ortHinweis daher komplett unabhängig vom Basiszustand.
    szenenUeberschreibungen: {
      "3.1": {
        personen: "–",
        kurz: "Wassereinbruch im Sturm — kein Bezug mehr zum blinden Passagier. Zwei Schritte nötig (Pumpen + Abdichten).",
        ortHinweis: "Der Frachtraum steht knöcheltief unter Wasser — bei jeder Welle schwappt es zwischen den Fässern hin und her. Irgendwo dringt Wasser ein, das hier nicht hingehört. Wenn niemand bald etwas unternimmt, wird es mehr.\n\nDie Bildvarianten (Standard/Leer) und der blinde Passagier spielen hier keine Rolle mehr, siehe Interaktion \"Wassereinbruch\"."
      },
      "5.1": {
        // Blinder Passagier ist zu diesem Zeitpunkt der Kampagne längst kein
        // Thema mehr (Subplot früh im Spiel, siehe nichtInSzenen unten).
        // Reiner Flavor-Zusatz, kein Plot-Gewicht.
        personen: "Ein Crewmitglied beim Zählen der Truhen",
        kurz: "Der geborgene Schatz lagert jetzt hier — ein sichtlich überforderter Crewmann versucht, ihn zu zählen.",
        ortHinweis: "Der geborgene Schatz der Thahal lagert jetzt hier, Truhe an Truhe gestapelt. Ein einzelnes Crewmitglied wurde offenbar zum Zählen abgestellt — laut murmelnd, mit dem Finger auf die Münzstapel zeigend. Bei jeder Ablenkung (ein Geräusch, eine Frage, das Schiff, das leicht schlingert) verliert er den Faden und fängt laut fluchend wieder bei eins an. Nach eigener Aussage ist er jetzt schon zum siebten Mal von vorne dran."
      }
    },
    interaktionen: {
      "blinder_passagier": {
        title: "Der blinde Passagier — Fund im Frachtraum (Abschnitt 11, Pfad A)",
        kurz: "Kein Wurf nötig — aktive Suche bei Variante \"Standard\" findet ihn automatisch. Vier mögliche Folgen je nach Spielerverhalten danach.",
        nichtInSzenen: ["3.1", "5.1"], // T+30 (spätestens Wat) liegt vor T+60 (Sturm) - Subplot ist bis dahin immer durch, in 5.1 lagert hier ohnehin der Schatz statt des Jungen
        details: "Ist die Bildvariante \"Standard\" aktiv und durchsucht ein Spieler gezielt den Raum (z.B. „ich durchsuche den Raum“), wird der Junge ohne Probe gefunden.\n\nDanach, drei mögliche Verläufe:\n— Spieler holen ihn aus dem Frachtraum heraus → Wat bekommt es mit, die Konfrontationsszene an Deck (Pfad B) startet\n— Spieler lassen ihn dort, gehen aber vor T+30 direkt zu Josiah, Francesco, Cormac oder Tom → Wat findet ihn nicht\n— Spieler lassen ihn dort, unternehmen lange Zeit nichts → er findet irgendwann aus Hunger von selbst zu Josiah\n\nSL-Ermessen: Ob und wie hart Pfad B (Wat-Konfrontation) tatsächlich ausfällt, liegt im Spielraum des Spielleiters — abhängig z.B. davon, ob die Gruppe Wat schon kennengelernt hat, ob eine härtere Version gerade der Charakterbildung nützt, oder ob die Gruppe ohnehin aggressiv gestimmt ist und eskalieren würde. Keine feste Regel, reine Spielleiter-Freiheit (vgl. Design-Prinzip \"Gutes Rollenspiel schlägt Mechanik\").",
        trigger: [
          { id: "gefunden", label: "Junge im Frachtraum gefunden", info: "Ist die Bildvariante \"Standard\" aktiv und durchsucht ein Spieler gezielt den Raum, wird der Junge ohne Probe gefunden." },
          { id: "rausgeholt", label: "Spieler holen ihn raus → Wat bemerkt es, Pfad B startet", info: "Spieler holen ihn aus dem Frachtraum heraus → Wat bekommt es mit, die Konfrontationsszene an Deck (Pfad B) startet." },
          { id: "vertrauensperson", label: "Josiah/Francesco/Cormac/Tom vor T+30 informiert → Wat findet ihn nicht", info: "Spieler lassen ihn dort, gehen aber vor T+30 direkt zu Josiah, Francesco, Cormac oder Tom → Wat findet ihn nicht." },
          { id: "untaetig", label: "Spieler bleiben untätig → Junge findet von selbst zu Josiah", info: "Spieler lassen ihn dort, unternehmen lange Zeit nichts → er findet irgendwann aus Hunger von selbst zu Josiah." }
        ]
      },
      "knoten_streich": {
        title: "Knoten-Streich — Anlaufpunkt (ausgelöst vom Achterdeck)",
        kurz: "Wer wegen Toms Streich in den Frachtraum läuft, trifft je nach aktiver Bildvariante auf den versteckten Jungen oder einen leeren Raum.",
        nichtInSzenen: ["3.1", "5.1"], // dito - Frachtraum-Varianten spielen im Sturm keine Rolle mehr, siehe "wassereinbruch_sturm"; in 5.1 lagert hier der Schatz
        details: "Siehe Achterdeck-Interaktion „Knoten-Streich“: Tom schickt den Spieler mit dem niedrigsten Seefahrt-Wert in den Frachtraum, um „ein paar Knoten mehr“ zu holen. Trifft der Spieler dort ein, hängt der Zustand von der aktiven Bildvariante ab — versteckter Junge (Standard) oder leerer Raum (Leer).",
        trigger: [
          { id: "angekommen", label: "Spieler wegen Knoten-Streich im Frachtraum angekommen", info: "Trifft der Spieler dort ein, hängt der Zustand von der aktiven Bildvariante ab — versteckter Junge (Standard) oder leerer Raum (Leer)." }
        ]
      },
      "wassereinbruch_sturm": {
        title: "Wassereinbruch",
        kurz: "Nur relevant, wenn Szene 3.1 aktiv ist. Zwei nötige Schritte (Pumpen + Abdichten). Ruf nur bei Selbstorganisation, kein Malus bei Misserfolg.",
        nurSzenen: ["3.1"],
        details: "Nur relevant in der Sturm-Szene (3.1) — löst die Frachtraum-Varianten (Standard/Leer) für diese Szene ab, der blinde Passagier ist zu diesem Zeitpunkt kein Thema mehr im Raum. Der Frachtraum steht knöcheltief unter Wasser, sofort sichtbar beim Betreten (kein Wurf).\n\nZwei nötige Schritte, um das Problem zu lösen:\n1. Pumpen — Spieler mit Seefahrt-Wissen wissen sofort, wo die schiffseigene Pumpe sitzt und wie man sie bedient (kein Wurf, reines Fachwissen). Das Pumpen selbst ist eine Körper-Probe. Hält den Wasserstand nur im Zaum, dichtet aber nichts ab.\n2. Abdichten — jemand muss aktiv in der Werkstatt nach Planken fragen (keine Probe, reine Handlung), dann Mechanik-Probe (alternativ Geschick), um das Leck zu stopfen.\n\nRuf hängt am WIE, nicht am WOHER der Lösung:\n— Selbstorganisiert (Spieler erkennen das Problem, bringen Pumpen + Planken von sich aus in Gang) → Ruf-Gewinn bei der Crew allgemein\n— Auf Anweisung von Cormac oder Dirk (falls Spieler nicht selbst aktiv werden) → neutral\n— Misserfolg bei Pumpen/Abdichten → kein Malus, geht im allgemeinen Chaos des Sturms unter\n\nDirks eigentlicher Sturm-Payoff (siehe Batteriedeck-Interaktion „dirk_vertrauen“) ist ein separates, späteres Ereignis NACH dem Sturm — nicht dieses hier.",
        trigger: [
          { id: "erkannt", label: "Wassereinbruch erkannt", info: "Der Frachtraum steht knöcheltief unter Wasser, sofort sichtbar beim Betreten (kein Wurf). Zwei nötige Schritte: Pumpen (Körper-Probe, hält den Wasserstand nur im Zaum) und Abdichten (Planken aus der Werkstatt holen, dann Mechanik- oder Geschick-Probe zum Leck stopfen)." },
          { id: "selbstorganisiert", label: "Spieler organisieren sich selbst → Ruf-Gewinn Crew", info: "Selbstorganisiert (Spieler erkennen das Problem, bringen Pumpen + Planken von sich aus in Gang) → Ruf-Gewinn bei der Crew allgemein." },
          { id: "auf_anweisung", label: "Auf Anweisung (Cormac/Dirk) → neutral", info: "Auf Anweisung von Cormac oder Dirk (falls Spieler nicht selbst aktiv werden) → neutral." },
          { id: "geloest", label: "Pumpen + Abdichten erfolgreich → Problem gelöst", info: "Misserfolg bei Pumpen/Abdichten → kein Malus, geht im allgemeinen Chaos des Sturms unter." }
        ]
      },
      "beim_zaehlen_helfen": {
        title: "Beim Zählen helfen",
        kurz: "Das überforderte Crewmitglied bittet um Hilfe beim Zählen des Schatzes. Wissen- oder Handel-Probe, rein komödiantisch, keine Story-Relevanz.",
        nurSzenen: ["5.1"],
        details: "Der zum Zählen abgestellte Crewmann (siehe ortHinweis) sieht jeden Vorbeikommenden mit unverhohlener Hoffnung an. „Bitte. Hilf mir. Ich krieg die Zahl einfach nicht zusammen.“\n\nWissen- oder Handel-Probe (Münzen/Wertgegenstände einschätzen und sauber zählen).\n\n— Guter Erfolg: Eine saubere, plausible Zahl steht — der Crewmann ist überglücklich, fast den Tränen nahe vor Erleichterung.\n— Normaler Erfolg: Eine grobe Schätzung reicht ihm fürs Erste, auch wenn beide wissen, dass sie nicht ganz exakt ist.\n— Schlechter Erfolg: Am Ende sind sich beide nicht mehr sicher, ob es dieselbe Zahl war wie vorhin. Der Crewmann seufzt, fängt sichtbar innerlich wieder von vorne an.\n— Misserfolg: Ein Münzstapel kippt um, verteilt sich klirrend über den Boden. Gemeinsames Aufsammeln, die Zählung beginnt komplett neu.\n\nKein Ruf-Effekt — reine Randnotiz, keine tatsächliche Konsequenz für den späteren Artefakthandel (die Schiffsbuchhaltung ist ohnehin nicht das, was dort zählt).",
        trigger: [
          { id: "um_hilfe_gebeten", label: "Crewmann bittet um Hilfe beim Zählen", info: "„Bitte. Hilf mir. Ich krieg die Zahl einfach nicht zusammen.“" },
          { id: "guter_erfolg", label: "Guter Erfolg → saubere Zahl, Crewmann überglücklich", info: "Eine saubere, plausible Zahl steht — der Crewmann ist überglücklich, fast den Tränen nahe vor Erleichterung." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → grobe Schätzung reicht", info: "Eine grobe Schätzung reicht ihm fürs Erste, auch wenn beide wissen, dass sie nicht ganz exakt ist." },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → Unsicherheit, fängt innerlich neu an", info: "Am Ende sind sich beide nicht mehr sicher, ob es dieselbe Zahl war wie vorhin. Der Crewmann seufzt." },
          { id: "misserfolg", label: "Misserfolg → Münzstapel kippt um, komplett neu zählen", info: "Ein Münzstapel kippt um, verteilt sich klirrend über den Boden. Gemeinsames Aufsammeln, die Zählung beginnt komplett neu." }
        ]
      }
    }
  },

  "kombuese": {
    personen: "Josiah Pryce",
    kurz: "Herzlicher Empfang für jeden, unabhängig vom Ruf. Bewusst kein aktiver Wunsch, keine Ruf-Mechanik — reiner Charakter zum Spielen.",
    ortHinweis: "Anlaufstelle für den blinden Passagier (siehe Frachtraum-Interaktion „Der blinde Passagier“ und Abschnitt 11).",
    // 5.1 (nach der Insel): reiner Flavor-Zusatz, kein Plot-Gewicht.
    szenenUeberschreibungen: {
      "5.1": {
        ortHinweis: "Aus der Kombüse zieht ein Geruch, den noch niemand an Bord einordnen kann — irgendwo zwischen süß und beunruhigend. Josiah experimentiert mit einer unbekannten Frucht, die jemand von der Insel mitgebracht hat, und verrät partout nicht, was genau er da eigentlich kocht. „Vertraut mir einfach.“ Wer probiert, findet es überraschend gut — was die Sache irgendwie nur unheimlicher macht."
      }
    },
    interaktionen: {
      "standardverhalten": {
        title: "Josiah — Herzlicher Empfang (kein aktiver Wunsch)",
        kurz: "Begrüßt jeden herzlich, unabhängig vom Ruf oder davon, ob der Spieler freiwillig/gepresst an Bord ist. Bewusst keine Ruf-Mechanik, kein Trigger-Automat.",
        details: "Josiah begrüßt jeden, der die Kombüse betritt, herzlich — unabhängig vom Ruf, unabhängig davon, ob der Spieler freiwillig oder durch Erpressung/Gewalt an Bord ist. Bietet von sich aus etwas zu essen oder Ähnliches an. Beantwortet Fragen offen und ehrlich.\n\nSieht in jedem das Gute — redet über niemanden schlecht, egal wer gerade Zielscheibe ist. Lästern Spieler vor ihm über irgendjemanden an Bord, widerspricht er warm und automatisch, nie belehrend, einfach weil er es so empfindet.\n\nBewusst kein aktiver Wunsch und keine Ruf-Mechanik hier — anders als Tom, Dirk oder die Werkstatt. Reiner Charakter zum Spielen, kein Trigger-Automat.\n\nSein großer Moment: die Wat-Konfrontationsszene (Frachtraum-Interaktion „Der blinde Passagier“, Pfad B) — kommt schwer atmend an Deck (die Kombüse liegt tief unten, er ist kein schneller Mann) und hält Wat auf.",
        trigger: []
      },
      "blindverkostung": {
        title: "Josiah — Die Blindverkostung",
        kurz: "Josiah lässt die mysteriöse Insel-Frucht probieren und die Zutat erraten. Wahrnehmungs- oder Wissen-Probe, komödiantische Reaktionen, keine Story-Relevanz.",
        nurSzenen: ["5.1"],
        details: "Josiah hält einen Löffel mit etwas Dampfendem hin, Augen erwartungsvoll. „Na los, koste — und sag mir, was du schmeckst.“ Verrät selbst nichts.\n\nWahrnehmungs- oder Wissen-Probe.\n\n— Guter Erfolg: Erkennt tatsächlich mehrere Zutaten korrekt (SL-Ermessen, welche) — Josiah ist ehrlich baff, verlangt sofort zu wissen, wie das gemacht wurde.\n— Normaler Erfolg: Erkennt vage „irgendwas Süßes, irgendwas Scharfes“ — Josiah nickt zufrieden, mehr wollte er auch nicht hören.\n— Schlechter Erfolg: Kann nichts Genaues benennen, nur dass es „ungewöhnlich, aber gut“ schmeckt. Josiah lacht, bleibt bei seinem Geheimnis.\n— Misserfolg: Verschluckt sich, muss husten — die Würze war stärker als erwartet. Josiah klopft mitleidig auf den Rücken, grinst dabei aber breit.\n\nKein Ruf-Effekt, keine Folgen — Josiah bleibt bei jedem Ergebnis genauso freundlich wie immer.",
        trigger: [
          { id: "angeboten", label: "Josiah bietet die Blindverkostung an", info: "„Na los, koste — und sag mir, was du schmeckst.“ Verrät selbst nichts." },
          { id: "guter_erfolg", label: "Guter Erfolg → mehrere Zutaten korrekt erkannt", info: "Josiah ist ehrlich baff, verlangt sofort zu wissen, wie das gemacht wurde." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → vage Beschreibung reicht", info: "Erkennt vage „irgendwas Süßes, irgendwas Scharfes“ — Josiah nickt zufrieden." },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → nichts Genaues benennbar", info: "Kann nichts Genaues benennen, nur dass es „ungewöhnlich, aber gut“ schmeckt." },
          { id: "misserfolg", label: "Misserfolg → verschluckt sich", info: "Verschluckt sich, muss husten — die Würze war stärker als erwartet." }
        ]
      }
    }
  },

  "schiffswrack": {
    personen: "Der Schmied (am improvisierten Amboss) · Reparaturcrew · Silas Pott (Schiffsarzt) · Ezra Coombe (situativ, verletzt)",
    ortHinweis: "Die Regenzeit naht (August 2026, Abschluss Insel-Durchgang) — kein akuter Stundendruck wie bei den Gezeiten, aber ein Grund, warum die ganze Insel-Unternehmung (Reparatur, Dorf, Höhle) nicht beliebig lange dauern darf. Der genaue Zeitrahmen (Tage, nicht Stunden) liegt bei Hendrik am Tisch.",
    npcs: [
      {
        name: "Der Schmied",
        rolle: "Schiffsschmied, leitet die Reparatur am Strand",
        verfassung: "Ruhig und geübt, konzentriert am improvisierten Amboss — das Herz der Reparatur.",
        beduerfnis: "Kohle, Metall und Platz zum Arbeiten; natürlicher Anlaufpunkt für alles, was geschmiedet oder gerichtet werden muss."
      }
    ],
    interaktionen: {
      "landung": {
        title: "Die Landung",
        kurz: "Die Golden Lion läuft mit gebrochenem Mast auf den Strand auf. Reiner Erzählmoment, kein Wurf — Spieler können jederzeit eingreifen, SL entscheidet.",
        details: "Mit Knarren und Zittern schleppt sich die Golden Lion auf den Strand. Niemand traut sich mehr, am angeknacksten Mast die Segel zu bergen — der gibt beim abrupten Stopp ohnehin nach und knickt einfach ein, Holz, so dick wie ein Mensch, bricht wie ein Streichholz. Das Schiff schlingert zur Seite und frisst sich trotzdem tief in den Sand. Eins ist klar: Hier kommen sie so schnell nicht wieder weg.\n\nEin großer Teil der Crew blickt sich verunsichert um. Tom, ganz vorn am Bug — das Ruder war schon eine Weile nutzlos —, schaut auf seinen Kompass, blickt auf und sucht Augenkontakt mit Harwick, der inzwischen sein Quartier verlassen hat. Ein kurzes Nicken von Harwick, und Tom bricht in lautes Lachen aus. (GM-Hinweis: Das ist der Moment, der den Sturm-Reveal bestätigt, dass Tom das Schiff absichtlich hierher gesteuert hat — siehe 10.11/Bibel 16 \"Reveal\". Bleibt für die Spieler unerklärt, nur der Blick zählt.)\n\nWer hier nicht versteht, was gerade passiert ist, ist nicht allein. Cormac nickt den Leuten anerkennend zu, die sich im Sturm nützlich gemacht haben, und auch Tom. Weil das Ausmaß noch niemand richtig begriffen hat, steht die Crew wie eingefroren — bis Harwick die Stille mit seiner charismatischen, freundlichen Stimme durchbricht. Er reibt sich die Hände: „Dann wollen wir mal!“ Schneidet ein Seil an einer Winde durch und lässt sich damit vom Deck ab.\n\nUnten am Strand, weit unterhalb aller, die noch an Deck stehen, kratzt er sich am Hinterkopf und blickt zurück nach oben. „Das haben wir aber auch schon ruhiger hierhergeschafft, Tom!“ Kopfschüttelnd geht er ums Schiff, um es zu inspizieren.\n\nDie Crew erwacht langsam aus der Starre und beginnt, das Schiff zu verlassen — mit Hilfe der Zimmerer werden Leitern gebaut, manche klettern direkt aus dem Frachtraum ins Freie. Schnell wird klar: Hier liegt eine Menge Arbeit vor allen. Trotzdem stellt Harwick auf einmal eine kleine Gruppe zusammen und ordert bestimmte Leute zu sich.",
        trigger: [
          { id: "aufgelaufen", label: "Schiff läuft mit gebrochenem Mast auf den Strand auf", info: "Mit Knarren und Zittern schleppt sich die Golden Lion auf den Strand. Der angeknackste Mast gibt beim abrupten Stopp nach und knickt ein. Das Schiff frisst sich tief in den Sand — hier kommt niemand so schnell wieder weg." },
          { id: "blickkontakt", label: "Tom & Harwick tauschen einen Blick, Tom lacht auf", info: "Tom, ganz vorn am Bug, sucht Augenkontakt mit Harwick. Ein kurzes Nicken, und Tom bricht in lautes Lachen aus. (GM-Hinweis: bestätigt später den Sturm-Reveal, dass Tom das Schiff absichtlich hierher gesteuert hat — bleibt für die Spieler unerklärt.)" },
          { id: "abgeseilt", label: "Harwick durchtrennt ein Seil, seilt sich vom Deck ab", info: "Harwick durchbricht die Stille: „Dann wollen wir mal!“ Schneidet ein Seil an einer Winde durch und lässt sich damit vom Deck ab." },
          { id: "seitenhieb", label: "Harwicks Seitenhieb an Tom (\"...auch schon ruhiger hierhergeschafft\")", info: "Unten am Strand kratzt er sich am Hinterkopf, blickt zurück nach oben: „Das haben wir aber auch schon ruhiger hierhergeschafft, Tom!“ Kopfschüttelnd geht er ums Schiff, um es zu inspizieren." },
          { id: "crew_verlaesst_schiff", label: "Crew verlässt langsam das Schiff (Leitern/Frachtraum)", info: "Cormac nickt den Leuten anerkennend zu, die sich im Sturm nützlich gemacht haben. Die Crew erwacht langsam aus der Starre — mit Hilfe der Zimmerer werden Leitern gebaut, manche klettern direkt aus dem Frachtraum ins Freie." },
          { id: "gruppe_zusammengestellt", label: "Harwick stellt eine kleine Gruppe zusammen, ordert Leute zu sich", info: "Trotzdem stellt Harwick auf einmal eine kleine Gruppe zusammen und ordert bestimmte Leute zu sich." }
        ]
      },
      "dirk_payoff": {
        title: "Dirks Zielinstrument",
        kurz: "Nur für den EINEN Spieler, der Dirk beim Batteriedeck (Bibel 10.4) überzeugt hat — SL weiß, wer das war. Kniffliges Handwerksproblem, großer Ruf-Gewinn bei Erfolg.",
        details: "Etwas abseits vom Trubel, dort wo das Werkzeug liegt, winkt Dirk den Spieler heran — knapp, ohne Umschweife. Aus einem ölig glänzenden Lederbeutel holt er ein kleines Messinginstrument hervor, ein Schusswinkelmesser, wie es auf keinem Handelsschiff zu finden ist. Der Zeiger ist verbogen, das Gehäuse eingedrückt — vom Sturm, oder vom Sturz danach. Seine Finger sind zu grob für die Feinarbeit, seine Werkzeuge hier am Strand zu roh. Er schiebt es dem Spieler wortlos hin. Erst auf Nachfrage, einsilbig: „Von meinem ersten Schiff. Kriegsmarine. Vor eurer Zeit.“ Mehr sagt er nicht — es ist bereits mehr, als er sonst über sich verliert.\n\nErfolg (Handwerk/Geschick-Probe): Das Instrument lässt sich wieder ausrichten. Dirk prüft es lange, bevor er nickt — dann, kaum hörbar: „Hätte nicht gedacht, dass hier einer weiß, wie man sowas anfasst.“ Für einen Moment ist die harte Schale weg. Großer Ruf-Gewinn bei Dirk.\n\nMisserfolg: Das Instrument bleibt kaputt. Dirk nimmt es zurück, zuckt mit den Schultern, sagt nichts weiter dazu. Kein Malus — er hat nichts anderes erwartet.",
        trigger: [
          { id: "dirk_sucht_auf", label: "Dirk sucht den Spieler abseits vom Trubel auf", info: "Etwas abseits vom Trubel, dort wo das Werkzeug liegt, winkt Dirk den Spieler heran — knapp, ohne Umschweife." },
          { id: "problem_gezeigt", label: "Zeigt das beschädigte Zielinstrument, bittet indirekt um Hilfe", info: "Aus einem ölig glänzenden Lederbeutel holt er ein kleines Messinginstrument hervor, Zeiger verbogen, Gehäuse eingedrückt. Er schiebt es wortlos hin. Auf Nachfrage: „Von meinem ersten Schiff. Kriegsmarine. Vor eurer Zeit.“" },
          { id: "erfolg_aufgetaut", label: "Reparatur gelingt — Dirk taut kurz auf, großer Ruf-Gewinn", info: "Dirk prüft es lange, bevor er nickt — dann, kaum hörbar: „Hätte nicht gedacht, dass hier einer weiß, wie man sowas anfasst.“ Für einen Moment ist die harte Schale weg. Großer Ruf-Gewinn bei Dirk." },
          { id: "misserfolg_kein_malus", label: "Reparatur gelingt nicht — Dirk nimmt es hin, kein Malus", info: "Das Instrument bleibt kaputt. Dirk nimmt es zurück, zuckt mit den Schultern, sagt nichts weiter dazu. Kein Malus — er hat nichts anderes erwartet." }
        ]
      },
      "loser_balken": {
        title: "Der lose Balken",
        kurz: "Ein Baumstamm gerät an der Seilwinde außer Kontrolle und schwingt auf einen Spieler zu. Weicht er aus, trifft es Sam Oakley stattdessen — daraus folgt eine Erste-Hilfe-Probe.",
        details: "Ein frisch gefällter Stamm hängt in der Seilwinde, halb hochgezogen zum Trockengestell. Das Tau ist nass, die Knoten improvisiert. Ein Ruck — die Winde rutscht durch, der Stamm schwingt lose durch die Luft, direkt auf einen der Spieler zu. Nur wenige Schritte hinter ihm arbeitet Sam Oakley, in seine Aufgabe vertieft, den Rücken zur Gefahr.\n\nWeicht der Spieler aus (Körper/Reflex-Probe): Er selbst kommt unversehrt davon — der Stamm schwingt weiter und trifft Sam an Schulter oder Rücken. Er geht zu Boden, blutet aus einer Platzwunde, humpelt fortan. Jetzt zählt schnelles Handeln: Ohne Erste Hilfe (Probe) blutet die Wunde unschön weiter, wird aber nicht lebensbedrohlich; bei Erfolg ist Sam rasch versorgt und dankbar — kleiner Ruf-Gewinn.\n\nWirft sich der Spieler stattdessen dazwischen, um Sam aus der Bahn zu ziehen oder den Stamm selbst abzufangen (schwerere Probe): Bei Erfolg werden beide verschont — spürbarer Ruf-Gewinn bei der Crew, die das mitbekommt. Bei Misserfolg trifft es stattdessen den Spieler selbst.",
        trigger: [
          { id: "ausser_kontrolle", label: "Balken gerät an der Winde außer Kontrolle, schwingt auf einen Spieler zu", info: "Ein frisch gefällter Stamm hängt in der Seilwinde. Das Tau ist nass, die Knoten improvisiert. Ein Ruck — die Winde rutscht durch, der Stamm schwingt lose auf einen Spieler zu. Nur wenige Schritte hinter ihm arbeitet Sam Oakley, den Rücken zur Gefahr." },
          { id: "ausgewichen", label: "Spieler weicht aus — Sam Oakley wird getroffen", info: "Weicht der Spieler aus (Körper/Reflex-Probe): Er selbst kommt unversehrt davon — der Stamm schwingt weiter und trifft Sam an Schulter oder Rücken. Er geht zu Boden, blutet aus einer Platzwunde, humpelt fortan." },
          { id: "erste_hilfe", label: "Erste-Hilfe-Probe an Sam — Erfolg/Misserfolg", info: "Jetzt zählt schnelles Handeln: Ohne Erste Hilfe blutet die Wunde unschön weiter, wird aber nicht lebensbedrohlich; bei Erfolg ist Sam rasch versorgt und dankbar — kleiner Ruf-Gewinn." },
          { id: "eingegriffen", label: "Spieler wirft sich dazwischen, versucht Sam zu schützen oder den Stamm abzufangen", info: "Wirft sich der Spieler stattdessen dazwischen, um Sam aus der Bahn zu ziehen oder den Stamm selbst abzufangen (schwerere Probe)." },
          { id: "beide_verschont", label: "Erfolg beim Eingreifen — beide verschont, Ruf-Gewinn bei der Crew", info: "Bei Erfolg werden beide verschont — spürbarer Ruf-Gewinn bei der Crew, die das mitbekommt." },
          { id: "spieler_getroffen", label: "Misserfolg beim Eingreifen — Spieler selbst wird getroffen", info: "Bei Misserfolg trifft es stattdessen den Spieler selbst." }
        ]
      },
      "wat_holzfaellen": {
        title: "Wat beim Holzhacken",
        kurz: "Reiner Rollenspiel-Moment, kein Wurf — Wat zeigt beim Holzfällen eine ruhige, kompetente Seite, ein Kontrast zu seinem Auftritt in der Taverne.",
        details: "Am Waldrand, wo das Holz gefällt wird, führt Wat den Trupp — ruhig, methodisch, ganz anders als der Mann aus der Kneipe. Er zeigt, wo die Axt ansetzen muss, korrigiert mit knappen Handbewegungen statt Worten. Kämpft jemand sichtlich mit dem Gewicht oder trifft daneben, übernimmt er kurz selbst, ohne ein Wort des Spotts — und gibt das Werkzeug danach kommentarlos zurück.",
        trigger: [
          { id: "beobachtet", label: "Spieler arbeitet mit der Holzfäll-Gruppe / beobachtet Wat", info: "Am Waldrand führt Wat den Trupp — ruhig, methodisch, ganz anders als der Mann aus der Kneipe. Er zeigt, wo die Axt ansetzen muss, korrigiert mit knappen Handbewegungen statt Worten." },
          { id: "hilft_leise", label: "Wat hilft still jemandem, der mit der Arbeit kämpft, ohne Spott", info: "Kämpft jemand sichtlich mit dem Gewicht oder trifft daneben, übernimmt er kurz selbst, ohne ein Wort des Spotts — und gibt das Werkzeug danach kommentarlos zurück." }
        ]
      },
      "josiahs_feuerstelle": {
        title: "Josiahs Feuerstelle",
        kurz: "Niedrigschwelliger Rollenspiel-Moment, kein Wurf — Josiah bittet um Hilfe beim Bau einer improvisierten Feuerstelle.",
        details: "Josiah klatscht in die Hände und schaut sich nach Freiwilligen um: „Kein Feuer, kein Essen — und ohne Essen macht mir hier keiner mehr die Arbeit!“ Wer hilft, bekommt sein loses, aufmunterndes Geplauder ab — und die feste Zusage, als Erster an die Pfanne zu kommen, sobald es wieder etwas zu kochen gibt.",
        trigger: [
          { id: "angesprochen", label: "Josiah bittet aktiv um Hilfe beim Feuerstellenbau", info: "Josiah klatscht in die Hände und schaut sich nach Freiwilligen um: „Kein Feuer, kein Essen — und ohne Essen macht mir hier keiner mehr die Arbeit!“" },
          { id: "geholfen", label: "Spieler hilft mit — kleiner warmer Moment mit Josiah", info: "Wer hilft, bekommt sein loses, aufmunterndes Geplauder ab — und die feste Zusage, als Erster an die Pfanne zu kommen, sobald es wieder etwas zu kochen gibt." }
        ]
      },
      "josiahs_geschichte_haendler": {
        title: "Josiahs Geschichte & der Händler",
        kurz: "Für die Zurückgebliebenen (nicht ins Dorf mitgegangen): Josiah erzählt eine stark verkürzte, zweite-Hand-Version von Vanthei/Jessica. Kein Sorathi, kein Wat-Geheimnis, kein emotionaler Moment. Ein Thahal-Händler bringt etwas oberflächlichen Insel-Kontakt.",
        details: "Josiah erzählt am Feuer, warmherzig wie immer: Harwick ist den Thahal seit Jahren als „Vanthei“ bekannt, ein Freund, der mit ihnen handelt — er lagert dort angeblich glänzendes Gut, das eines Tages der Inselgöttin übergeben werden soll, sobald genug davon zusammengekommen ist. Es gab eine Tochter, Jessica, die vor einigen Jahren gestorben ist. Mehr weiß — oder sagt — Josiah dazu nicht.\n\nNichts von alldem erreicht die Tiefe der Geschichte, die sich gerade im Dorf abspielt: Sorathi, Wats Verbindung zu ihm, der Moment, in dem Harwicks Fassung bricht — das bleibt allein denen vorbehalten, die mitgegangen sind.\n\nTrotzdem bleibt der Strand nicht ganz ohne Thahal-Kontakt: Ein Händler aus dem Dorf sucht das Wrack auf, tauscht dort hergestellte Gegenstände gegen Tuch und Werkzeug. Er ist freundlich, geschäftsmäßig, und plaudert nebenbei ein wenig über die Insel — nichts, was er nicht auch einem x-beliebigen Fremden erzählen würde.",
        trigger: [
          { id: "josiah_erzaehlt", label: "Josiah erzählt die verkürzte Vanthei/Jessica-Geschichte am Feuer", info: "Josiah erzählt am Feuer, warmherzig wie immer: Harwick ist den Thahal seit Jahren als „Vanthei“ bekannt, ein Freund, der mit ihnen handelt — er lagert dort angeblich glänzendes Gut, das eines Tages der Inselgöttin übergeben werden soll." },
          { id: "grobe_eckpunkte_nur", label: "Nur grobe Eckpunkte — kein Sorathi, kein Wat-Geheimnis, keine Emotion", info: "Es gab eine Tochter, Jessica, die vor einigen Jahren gestorben ist. Mehr weiß — oder sagt — Josiah dazu nicht. Nichts von alldem erreicht die Tiefe der Geschichte, die sich gerade im Dorf abspielt." },
          { id: "haendler_kommt", label: "Ein Thahal-Händler sucht das Wrack auf", info: "Der Strand bleibt trotzdem nicht ganz ohne Thahal-Kontakt: Ein Händler aus dem Dorf sucht das Wrack auf." },
          { id: "handel_tuch_werkzeug", label: "Handel: Dorf-Gegenstände gegen Tuch und Werkzeug", info: "Er tauscht dort hergestellte Gegenstände gegen Tuch und Werkzeug." },
          { id: "oberflaechliche_infos", label: "Händler plaudert nur oberflächlich über die Insel", info: "Er ist freundlich, geschäftsmäßig, und plaudert nebenbei ein wenig über die Insel — nichts, was er nicht auch einem x-beliebigen Fremden erzählen würde." }
        ]
      },
      "eber_und_wundbrand": {
        title: "Der Eber und der Wundbrand",
        kurz: "Auf dem Rückweg vom Dorf erwischt ein Wildschwein Ezra Coombe (2 Treffer erlegen es). Zurück am Schiff verweigert Schiffsarzt Silas Pott aus Angst um seinen Posten die nötige Amputation — Wundbrand und Sepsis zwingen zum dringenden Kurs auf einen Hafen.",
        details: "Auf dem Rückweg raschelt es plötzlich im Gebüsch — ein großer Eber stürmt aus dem Unterholz auf die Gruppe zu. Er erwischt Ezra Coombe, der in hohem Bogen zu Boden fliegt.\n\nDas Tier bleibt kampfbereit stehen. Die Spieler haben jetzt die Chance, es anzugreifen — zwei Treffer reichen, um es zu erlegen. Erlegt, kann die Crew das Fleisch mitnehmen, was die angeschlagene Stimmung im Lager spürbar hebt.\n\nEzra selbst ist schwer verletzt und muss getragen werden — den Rest des Weges zurück zum Schiff.\n\nDort übernimmt Silas Pott die Versorgung der Verletzten — er hat schon einige nach dem Sturm behandelt und gilt als Schiffsarzt, so unqualifiziert er auch sein mag. Hat ein Spieler selbst medizinische Erfahrung, entsteht schnell ein Gegenpol: Silas spürt, dass dieser Spieler vermutlich der bessere Arzt wäre — und das ängstigt ihn. Er lässt sich kaum von der körperlichen Arbeit abnehmen, außer dem gelegentlichen Amputieren.\n\nSchlägt der Spieler eine Amputation vor oder greift generell ein, spielt sich Silas auf: Er könne diese kleine Verletzung auch ohne Amputation heilen, erklärt er Harwick und Cormac gegenüber — und macht unmissverständlich klar, dass er sich von „diesen dilettantischen Spielern“ nicht dreinreden lassen will.\n\nDas ist der Auftakt zur Katastrophe: Wundbrand setzt ein, die Sepsis wandert bereits den Oberschenkel hoch. Ein erfahrener Spieler erkennt eindeutig: Das Bein muss ab. Doch es geht nicht am Oberschenkel — die Hauptschlagader lässt sich hier nicht sauber abklemmen. An Bord der Golden Lion fehlen sowohl das nötige Werkzeug als auch die Arznei dafür.\n\nEs bleibt keine Wahl: Ein Hafen muss dringend angesteuert werden.",
        trigger: [
          { id: "eber_greift_an", label: "Ein Wildschwein stürmt aus dem Gebüsch, erwischt Ezra Coombe", info: "Auf dem Rückweg raschelt es plötzlich im Gebüsch — ein großer Eber stürmt aus dem Unterholz auf die Gruppe zu. Er erwischt Ezra Coombe, der in hohem Bogen zu Boden fliegt." },
          { id: "kampf_gegen_eber", label: "Kampf gegen den Eber — 2 Treffer erlegen ihn", info: "Das Tier bleibt kampfbereit stehen. Die Spieler haben jetzt die Chance, es anzugreifen — zwei Treffer reichen, um es zu erlegen." },
          { id: "eber_erbeutet", label: "Erlegtes Schwein hebt die Stimmung im Lager", info: "Erlegt, kann die Crew das Fleisch mitnehmen, was die angeschlagene Stimmung im Lager spürbar hebt. Ezra selbst ist schwer verletzt und muss getragen werden — den Rest des Weges zurück zum Schiff." },
          { id: "silas_uebernimmt", label: "Silas Pott übernimmt die Versorgung der Verletzten", info: "Silas Pott übernimmt die Versorgung — er hat schon einige nach dem Sturm behandelt und gilt als Schiffsarzt, so unqualifiziert er auch sein mag." },
          { id: "gegenpol_spieler", label: "Gegenpol zum medizinisch erfahrenen Spieler — Silas fürchtet um seinen Posten", info: "Hat ein Spieler selbst medizinische Erfahrung, entsteht schnell ein Gegenpol: Silas spürt, dass dieser Spieler vermutlich der bessere Arzt wäre — und das ängstigt ihn. Er lässt sich kaum von der körperlichen Arbeit abnehmen." },
          { id: "silas_verweigert", label: "Silas verweigert die Amputation, spielt sich vor Harwick/Cormac auf", info: "Schlägt der Spieler eine Amputation vor oder greift ein, spielt sich Silas auf: Er könne diese kleine Verletzung auch ohne Amputation heilen, erklärt er Harwick und Cormac — und macht klar, dass er sich von „diesen dilettantischen Spielern“ nicht dreinreden lassen will." },
          { id: "wundbrand_sepsis", label: "Wundbrand setzt ein, Sepsis wandert den Oberschenkel hoch", info: "Das ist der Auftakt zur Katastrophe: Wundbrand setzt ein, die Sepsis wandert bereits den Oberschenkel hoch. Ein erfahrener Spieler erkennt eindeutig: Das Bein muss ab." },
          { id: "amputation_unmoeglich", label: "Amputation am Oberschenkel technisch unmöglich (Hauptschlagader)", info: "Doch es geht nicht am Oberschenkel — die Hauptschlagader lässt sich hier nicht sauber abklemmen. An Bord der Golden Lion fehlen sowohl das nötige Werkzeug als auch die Arznei dafür." },
          { id: "kurs_auf_hafen", label: "Ein Hafen muss dringend angesteuert werden", info: "Es bleibt keine Wahl: Ein Hafen muss dringend angesteuert werden." }
        ]
      },
      // Optionaler Lückenfüller (August 2026), während das Schiff noch
      // repariert wird bzw. auf den richtigen Wasserstand für die Höhle
      // gewartet wird - kein Pflichtinhalt, aber mit echtem Story-Haken
      // (Schmugglernest-Hinweis, Bibel 7.2 Verzweigung 1).
      "kajuete_unterlagen": {
        title: "Unterlagen aus der Kapitänskajüte",
        kurz: "Harwick will wichtige Unterlagen aus seiner beschädigten Kajüte — Weg dorthin versperrt (Klettern, ein Balken), Tür verschlossen (Toms Würfelspiel ODER Mechanik-Probe statt Eintreten, ausdrückliche Anweisung Harwicks). In den Unterlagen: ein Hinweis aufs Schmugglernest.",
        details: "Harwick nimmt jemanden kurz zur Seite: Wichtige Unterlagen liegen noch in seiner Kajüte, unangetastet seit der Strandung. Er will sie zurück, bevor es weitergeht — die Regenzeit naht, viel Zeit bleibt der ganzen Insel-Unternehmung ohnehin nicht mehr. Eine klare Bedingung setzt er dabei: die Tür soll geöffnet werden, nicht eingetreten. Warum, sagt er nicht — nur, dass es ihm wichtig ist.\n\nDer Weg zur Kajüte ist alles andere als sicher: das Deck hängt schief, ein Teilstück des Gangs ist eingebrochen. Wer hinüber will, muss klettern (Probe: Geschick) — und stößt kurz danach auf einen schweren, herabgestürzten Balken, der den restlichen Weg komplett versperrt (Probe: Körper, um ihn beiseitezuwuchten).\n\nVor der Kajütentür angekommen: verschlossen. Der Kapitän selbst hat seinen Schlüssel beim Schiffbruch verloren — nur Tom besitzt noch einen zweiten. Der rückt ihn aber nicht einfach raus: ein Spiel muss es sein, ganz wie bei der Anwerbung in der Taverne. Wer gewinnt, bekommt den Schlüssel; wer verliert, muss sich etwas anderes einfallen lassen.\n\nAlternativ lässt sich die Tür auch ohne Tom öffnen — mit der richtigen Kenntnis (Probe: Mechanik) lässt sich das Schloss knacken, ohne die Tür selbst zu beschädigen, ganz wie von Harwick verlangt.\n\nDrinnen, zwischen verrutschten Möbeln und umgekippten Regalen, finden sich Harwicks Unterlagen — Frachtlisten, Briefe, Notizen. Wer genauer liest (Probe: Wissen oder Wahrnehmung), stößt auf wiederkehrende Hinweise zu Handelsgeschäften im Untergrund — Namen, Orte, Andeutungen, die sich mit etwas Nachdenken einem Begriff zuordnen lassen: einem Schmugglernest.",
        trigger: [
          { id: "harwick_bittet", label: "Harwick bittet um die Unterlagen — Tür öffnen, nicht eintreten", info: "Harwick nimmt jemanden kurz zur Seite: Wichtige Unterlagen liegen noch in seiner Kajüte. Eine klare Bedingung: die Tür soll geöffnet werden, nicht eingetreten. Warum, sagt er nicht." },
          { id: "weg_klettern", label: "Der Weg zur Kajüte ist eingebrochen — klettern nötig (Geschick)", info: "Das Deck hängt schief, ein Teilstück des Gangs ist eingebrochen. Wer hinüber will, muss klettern." },
          { id: "balken_im_weg", label: "Ein herabgestürzter Balken versperrt den restlichen Weg (Körper)", info: "Kurz danach ein schwerer, herabgestürzter Balken, der den restlichen Weg komplett versperrt — beiseitewuchten (Probe: Körper)." },
          { id: "tuer_verschlossen", label: "Kajütentür verschlossen — Harwicks eigener Schlüssel ist verloren", info: "Der Kapitän selbst hat seinen Schlüssel beim Schiffbruch verloren." },
          { id: "toms_spiel_gewonnen", label: "Toms Würfelspiel gewonnen — zweiter Schlüssel erhalten", info: "Nur Tom besitzt noch einen zweiten Schlüssel — der rückt ihn aber nicht einfach raus: ein Spiel muss es sein, ganz wie bei der Anwerbung in der Taverne. Gewonnen: Schlüssel erhalten." },
          { id: "toms_spiel_verloren", label: "Toms Würfelspiel verloren — Mechanik-Weg bleibt offen", info: "Verloren: Tom rückt nichts raus. Die Mechanik-Probe an der Tür bleibt als zweiter Weg weiterhin möglich." },
          { id: "mechanik_alternative", label: "ODER: Mechanik-Probe knackt das Schloss ohne Tom", info: "Alternativ lässt sich die Tür auch ohne Tom öffnen — mit der richtigen Kenntnis (Probe: Mechanik) lässt sich das Schloss knacken, ohne die Tür zu beschädigen, ganz wie von Harwick verlangt." },
          { id: "unterlagen_gefunden", label: "Harwicks Unterlagen liegen zwischen verrutschten Möbeln", info: "Drinnen, zwischen verrutschten Möbeln und umgekippten Regalen, finden sich Harwicks Unterlagen — Frachtlisten, Briefe, Notizen." },
          { id: "schmugglernest_hinweis", label: "Wissen/Wahrnehmung: Hinweise auf Handel im Untergrund — Schmugglernest", info: "Wer genauer liest, stößt auf wiederkehrende Hinweise zu Handelsgeschäften im Untergrund — Namen, Orte, Andeutungen, die sich einem Begriff zuordnen lassen: einem Schmugglernest (Bibel 7.2, Verzweigung 1 nach der Insel)." }
        ]
      }
    }
  },

  "zwischenstation": {
    personen: "James Harwick · Cormac Daly · Ezra Coombe",
    interaktionen: {
      "unterwegs_zum_dorf": {
        title: "Auf dem Weg zum Dorf",
        kurz: "Reiner Erzählmoment, kein Wurf (außer optional Wahrnehmung) — Harwick lässt Metallschmuck ablegen, löst Ezra Coombes festsitzenden Ehering mit einem Schreckmoment, Cormac deutet beinahe einen früheren Verlust Harwicks an, Wildschwein-Fehlalarm am Ende.",
        details: "Die Gruppe ist schon eine Weile unterwegs, als Harwick auf dem Weg bittet, sämtlichen Metallschmuck auszuziehen und zu verstauen. Er scheint es ernst zu meinen und kontrolliert jeden persönlich. (GM-Hinweis: Das ist keine allgemeine Vorsicht, sondern eine gezielte Gegenmaßnahme — Harwick weiß bereits von den Gerüchten, dass der neue Häuptling der Crew einen Fluch zuschreibt, weil sie selbst Metallschmuck trägt, was der Thahal-Theologie widerspricht. Er versucht, genau diesen Verdacht zu entschärfen, bevor er am Dorf ankommt.)\n\nEzra Coombe hat seinen Ehering noch an der Hand und versucht, ihn vor Harwick zu verstecken. Dieser starrt ihn ernst an, bis Ezra versucht, den Ring vom Finger zu lösen. Doch der sitzt fest. Ezra zuckt mit den Schultern: „Den habe ich seit ihrem Tod nicht mehr abgenommen“ — und lächelt verlegen.\n\nHarwick schaut ernst zu Cormac und zieht dann mit einem Ruck seinen Degen. Selbst Cormac zuckt einen Moment zusammen — bis er Harwicks Gesicht sieht und sich wieder entspannt.\n\nHarwick zerrt Ezras Hand zu sich und schneidet ein Stück von dessen Hemd ab — alles in einer Bewegung. Ezra kneift die Augen zusammen und schreit kurz auf, bis er merkt, dass Harwick ihn nicht verletzt hat.\n\nHarwick steckt den Degen zurück, fädelt den Stoff durch den Ring und bindet ihn eng um Ezras Finger. Mit dem anderen Ende umkreist er den Finger in die Gegenrichtung und wickelt den Stoff dabei ab — der Ring bewegt sich Stück für Stück über den Finger. Ezra gerät kurz ins Taumeln, ist aber froh, noch in einem Stück zu sein. Als der Ring ab ist, küsst er ihn und schaut mit einer Mischung aus Furcht und Erleichterung zu Harwick.\n\nAls sich dieser mit einem leichten Lächeln und einem Klopfen auf die Schulter abwendet, sagt Ezra zur Seite: „Für eine Sekunde dachte ich…“ Cormac legt den Kopf schräg: „Für eine Sekunde dachtest du was? Kapitän Harwick hat noch nie jemanden aus seiner Crew verloren!“ Nach kurzem Stocken schaut er zu Boden und fasst sich an die Seite: „Na ja, fast…“, mehr zu sich selbst.\n\nEin Spieler mit guter Wahrnehmung sieht, wie die Miene des Kapitäns für einen Moment entgleist — bevor er sich fängt und ernst, gerade nach vorne geht. Im ernsten Ton: „Weiter geht's…“ (GM-Hinweis: unausgesprochene Anspielung auf seine tote Tochter — die Kernprämisse der Kampagne. Bleibt für die Spieler unerklärt.)\n\nCormacs sonst so kraftvolle Gestalt wirkt jetzt behutsam. Er folgt dem Kapitän, man hört ihn vorsichtig fragen: „War das mit dem Degen wirklich nötig?“\n\nAuf einmal ein Rascheln! Viele machen sich kampfbereit, Spannung liegt in der Luft. Auch Cormac fängt sich kurz, dann lacht er: „Entspannt euch! Hier gibt's nur Wildschweine. Die sind keine Gefahr.“ (GM-Hinweis: bewusstes Setup — Cormacs Einschätzung wird auf dem Rückweg widerlegt, wenn der echte Wildschwein-Angriff passiert, siehe ARBEITSSTAND.md 5. Wer verletzt wird, ist dort weiterhin offen.)",
        trigger: [
          { id: "metallschmuck_angesagt", label: "Harwick lässt die Gruppe Metallschmuck ablegen, kontrolliert jeden", info: "Harwick bittet auf dem Weg, sämtlichen Metallschmuck auszuziehen und zu verstauen. Er scheint es ernst zu meinen und kontrolliert jeden persönlich. (GM-Hinweis: gezielte Gegenmaßnahme gegen den Metallschmuck-Fluch-Verdacht der Thahal.)" },
          { id: "ring_festgeklemmt", label: "Ezra Coombes Ehering sitzt fest, er versucht ihn zu verstecken", info: "Ezra Coombe hat seinen Ehering noch an der Hand und versucht, ihn vor Harwick zu verstecken. Dieser starrt ihn ernst an, bis Ezra versucht, den Ring vom Finger zu lösen. Doch der sitzt fest. Ezra zuckt mit den Schultern: „Den habe ich seit ihrem Tod nicht mehr abgenommen“ — und lächelt verlegen." },
          { id: "degen_schreckmoment", label: "Harwick zieht abrupt den Degen — auch Cormac zuckt zusammen", info: "Harwick schaut ernst zu Cormac und zieht dann mit einem Ruck seinen Degen. Selbst Cormac zuckt einen Moment zusammen — bis er Harwicks Gesicht sieht und sich wieder entspannt." },
          { id: "ring_geloest", label: "Harwick löst den Ring mit dem Tuchtrick, ohne Ezra zu verletzen", info: "Harwick schneidet ein Stück Hemd ab, fädelt es durch den Ring und wickelt ihn Stück für Stück über den Finger. Als der Ring ab ist, küsst Ezra ihn und schaut mit einer Mischung aus Furcht und Erleichterung zu Harwick." },
          { id: "cormacs_beinahe_verrat", label: "Cormacs \"Naja, fast...\" — Andeutung auf einen früheren Verlust", info: "Ezra: „Für eine Sekunde dachte ich…“ Cormac: „Für eine Sekunde dachtest du was? Kapitän Harwick hat noch nie jemanden aus seiner Crew verloren!“ Nach kurzem Stocken, mehr zu sich selbst: „Na ja, fast…“" },
          { id: "wahrnehmung_maske", label: "Nur bei guter Wahrnehmung: Harwicks Fassung rutscht kurz", info: "Ein Spieler mit guter Wahrnehmung sieht, wie die Miene des Kapitäns für einen Moment entgleist — bevor er sich fängt und ernst sagt: „Weiter geht's…“ (GM-Hinweis: unausgesprochene Anspielung auf seine tote Tochter.)" },
          { id: "cormacs_nachfrage", label: "Cormac fragt leise, ob der Degen wirklich nötig war", info: "Cormacs sonst so kraftvolle Gestalt wirkt jetzt behutsam. Man hört ihn vorsichtig fragen: „War das mit dem Degen wirklich nötig?“" },
          { id: "wildschwein_fehlalarm", label: "Rascheln im Gebüsch — Fehlalarm, nur Wildschweine", info: "Auf einmal ein Rascheln! Viele machen sich kampfbereit. Cormac lacht: „Entspannt euch! Hier gibt's nur Wildschweine. Die sind keine Gefahr.“ (GM-Hinweis: bewusstes Setup — wird auf dem Rückweg widerlegt.)" }
        ]
      }
    }
  },

  "stammesdorf": {
    personen: "James Harwick (\"Vanthei\") · Cormac Daly · Häuptling Ta'ahal",
    interaktionen: {
      "ankunft_vanthei": {
        title: "Vanthei ist nicht mehr willkommen",
        kurz: "Reiner Erzählmoment, kein Wurf (außer optional Wahrnehmung/Menschenkenntnis) — der Häuptling weist Harwick öffentlich zurück, das Dorf ist erkennbar gespalten.",
        details: "Kaum betritt die Gruppe die Lichtung, geht ein Raunen durch die Menge. Ein Wort läuft von Mund zu Mund, kaum lauter als ein Atemzug: „Vanthei.“ Manche senken den Kopf, andere weichen einen Schritt zurück.\n\nJe näher die Gruppe kommt, desto ernster wird der Blick des Häuptlings auf sie gerichtet. Harwick bleibt vorsichtig, breitet aber trotzdem — fast einstudiert — die Arme aus, wie zur Begrüßung eines alten Bekannten.\n\nHäuptling Ta'ahal (GM-Hinweis: kein Eigenname, sondern der Titel jedes Thahal-Anführers — von \"Thahal\"/\"Bewahrer\" abgeleitet, bedeutet \"der, der erhält\") lässt ihn ausreden. Dann sagt er, scharf, absichtlich laut und für jeden im Dorf deutlich hörbar, mit unverhohlenem Abscheu: „Vanthei! Du bist hier nicht länger willkommen!“\n\nNiemand im Dorf trägt eine Waffe — nur der Häuptling einen Speer. Er stößt ihn in den Boden, dreht sich um und geht.\n\nEinige Dorfbewohner starren mit großen Augen zu Harwick. Der steht da wie bestellt und nicht abgeholt, blickt sich ernst um.\n\nEin junger Mann ruft: „Vanthei!“ — und macht einen Schritt auf ihn zu, wird aber sofort von anderen festgehalten und in eine Hütte gezogen.\n\nWer gute Wahrnehmung oder Menschenkenntnis hat, erkennt den Zwiespalt, in dem die Dorfbewohner stecken. Niemand kommt der Gruppe zu nahe. Jeder Versuch, Kontakt aufzunehmen, verschreckt die Leute nur.\n\nHarwick spricht einen alten Mann direkt an — in Worten, die die Spieler nicht verstehen. Der alte Mann schüttelt traurig den Kopf und verlässt den Platz.\n\nHarwick dreht sich um, geht mit ernster Miene durch die Gruppe hindurch und verlässt das Dorf. Der junge Mann von vorhin ruft ihm in gebrochenem Englisch nach: „Er hätte gewollt, dass du es zu ihr bringst!“ (GM-Hinweis: \"Er\" = der verstorbene alte Häuptling, \"sie\" = die Göttin/das Heiligtum. Dieser junge Mann ist der spätere Thahal-Helfer im Nachtlager — Station 4, kontaktiert die Gruppe dort heimlich nachts, einziger Zugang zu Diebstahl/Aufhetzen. Für die Spieler bleibt das hier nur Sympathie, kein Versprechen.)\n\nLangsam wird es dunkel. In gebührendem Abstand zum Dorf macht Harwick klar, dass hier das Lager aufgeschlagen wird.",
        trigger: [
          { id: "geraunt", label: "Menge raunt \"Vanthei\", manche weichen zurück", info: "Kaum betritt die Gruppe die Lichtung, geht ein Raunen durch die Menge. Ein Wort läuft von Mund zu Mund, kaum lauter als ein Atemzug: „Vanthei.“ Manche senken den Kopf, andere weichen einen Schritt zurück." },
          { id: "haeuptling_ablehnung", label: "Häuptling Ta'ahal weist Harwick laut und mit Abscheu zurück", info: "Harwick breitet fast einstudiert die Arme aus, wie zur Begrüßung eines alten Bekannten. Häuptling Ta'ahal sagt scharf, absichtlich laut, mit unverhohlenem Abscheu: „Vanthei! Du bist hier nicht länger willkommen!“" },
          { id: "speer_geste", label: "Häuptling stößt den Speer in den Boden und geht", info: "Niemand im Dorf trägt eine Waffe — nur der Häuptling einen Speer. Er stößt ihn in den Boden, dreht sich um und geht." },
          { id: "junger_mann_zurueckgehalten", label: "Ein junger Mann ruft \"Vanthei\", wird zurückgehalten und weggezogen", info: "Ein junger Mann ruft: „Vanthei!“ — und macht einen Schritt auf ihn zu, wird aber sofort von anderen festgehalten und in eine Hütte gezogen." },
          { id: "zwiespalt_wahrnehmung", label: "Nur bei Wahrnehmung/Menschenkenntnis: Zwiespalt im Dorf erkennbar", info: "Wer gute Wahrnehmung oder Menschenkenntnis hat, erkennt den Zwiespalt, in dem die Dorfbewohner stecken. Niemand kommt der Gruppe zu nahe; jeder Kontaktversuch verschreckt nur." },
          { id: "alter_mann_thahal", label: "Harwick spricht mit einem alten Mann auf Thahal, dieser lehnt traurig ab", info: "Harwick spricht einen alten Mann direkt an — in Worten, die die Spieler nicht verstehen. Der alte Mann schüttelt traurig den Kopf und verlässt den Platz." },
          { id: "abschiedsruf", label: "Junger Mann ruft Harwick in gebrochenem Englisch nach: \"Er hätte gewollt, dass du es zu ihr bringst!\"", info: "Harwick verlässt mit ernster Miene das Dorf. Der junge Mann ruft ihm in gebrochenem Englisch nach: „Er hätte gewollt, dass du es zu ihr bringst!“ (GM-Hinweis: \"er\" = der verstorbene alte Häuptling, \"sie\" = die Göttin. Für die Spieler bleibt das nur Sympathie, kein Versprechen.)" },
          { id: "lager_aufgeschlagen", label: "Bei Einbruch der Dunkelheit schlägt die Gruppe in gebührendem Abstand das Nachtlager auf", info: "Langsam wird es dunkel. In gebührendem Abstand zum Dorf macht Harwick klar, dass hier das Lager aufgeschlagen wird." }
        ]
      },
      // Klimax des Dorf-Durchgangs (Bibel 2.9, August 2026). Auslöser ist
      // SL-Ermessen, kein Code-Trigger (Muster wie an anderer Stelle im
      // Projekt): 10 der 16 Dorf-Aufgaben erledigt, ODER eine von Hendrik
      // am Tisch spontan entschiedene Zeit läuft ab. redeTeile enthält den
      // vollständigen, von Hendrik geschriebenen Wortlaut für die Gegenrede
      // (3 Teile x 4 Erfolgsstufen) - wird von js/regie_vault.js in einer
      // eigenen, schnell kopierbaren Anzeige dargestellt, damit die
      // passende Passage während der Session manuell per Discord an den
      // redenden Spieler geschickt werden kann (kein Auto-Push an Spieler).
      "die_gegenrede": {
        title: "Sorathis Unterbrechung — Die Gegenrede",
        kurz: "SL-Ermessen: bei 10 von 16 Dorf-Aufgaben ODER wenn die Zeit abläuft, unterbricht Sorathi. Bei genug Unterstützung: Häuptling spricht gegen Vanthei, Spieler müssen mit einer Gegenrede reagieren (3 Rhetorik-Würfe, Sorathi übersetzt). Sonst/bei Misserfolg: Diebstahl-Plan.",
        details: "Sobald genug Dorfbewohner überzeugt sind (SL-Ermessen, ca. 10 der 16 Aufgaben) oder die am Tisch spontan gesetzte Zeit abläuft, unterbricht Sorathi die aktuelle Aktion der Spieler.\n\nBei genug Unterstützung: eine Menschenmenge bildet sich auf dem Dorfplatz, eine Fraktion gegen die andere, offene Diskussion. Der Häuptling nutzt den Moment für eine Rede GEGEN Vanthei. Die Spieler müssen sofort reagieren — eine Gegenrede halten. Sorathi übersetzt für den sprechenden Spieler (Thahal-Sprache wurde bisher nur geraunt/nicht verstanden).\n\nOhne genug Unterstützung (Zeit läuft ab): Sorathi drängt stattdessen zum Diebstahl-Plan.\n\nDie Gegenrede besteht aus 3 Rhetorik-Würfen (einer je Redeteil, volle Texte in redeTeile). Verrechnung: 1 Misserfolg wird ausgeglichen durch 2 Normale Erfolge ODER 1 Guten Erfolg an anderer Stelle; bei 2 Misserfolgen rettet nur noch ein Guter Erfolg auf dem dritten Wurf die Rede. Eine Rettung pro Rede durch einen ANDEREN Spieler: Auftreten (komödiantische Ablenkung vor der Menge) ODER Drohen — nicht gegen die Menge, sondern gegen einen Störer/eine eingreifende Wache, die den Redner zum Schweigen bringen will.\n\nMisslingt die Gegenrede, fällt es ebenfalls auf \"jetzt Diebstahl planen\" zurück — mit denselben Erschwernissen wie beim Zeitablauf (z. B. schwerer ohne Toma'ru überzeugt zu haben).",
        trigger: [
          { id: "sorathi_unterbricht", label: "Sorathi unterbricht (SL-Ermessen: 10 Aufgaben ODER Zeit abgelaufen)", info: "Sobald genug Dorfbewohner überzeugt sind (ca. 10 der 16 Aufgaben) oder die am Tisch gesetzte Zeit abläuft, unterbricht Sorathi die aktuelle Aktion der Spieler." },
          { id: "menge_bildet_sich", label: "Menschenmenge bildet sich auf dem Dorfplatz, Fraktionen gegeneinander", info: "Eine Menschenmenge bildet sich, eine Fraktion gegen die andere, offene Diskussion bricht aus." },
          { id: "haeuptling_rede_gegen_vanthei", label: "Häuptling nutzt den Moment für eine Rede GEGEN Vanthei", info: "Der Häuptling nutzt die Zusammenkunft, um öffentlich gegen Vanthei zu sprechen — die Spieler müssen sofort reagieren." },
          { id: "gegenrede_erfolg", label: "Gegenrede gelingt — Dorf fordert das Siegel für Vanthei", info: "Die Gegenrede gelingt (Verrechnung der 3 Würfe, siehe Details) — die Menge wendet sich zugunsten von Vanthei, das Siegel wird ihm überlassen." },
          { id: "gegenrede_misslingt", label: "Gegenrede misslingt — Diebstahl-Plan nötig", info: "Die Gegenrede misslingt — fällt auf \"jetzt Diebstahl planen\" zurück, mit denselben Erschwernissen wie bei Zeitablauf." },
          { id: "zeit_abgelaufen_diebstahl", label: "Ohne genug Unterstützung: Sorathi drängt zum Diebstahl-Plan", info: "Die Zeit läuft ab, ohne dass genug Dorfbewohner überzeugt wurden — Sorathi drängt die Spieler, stattdessen einen Diebstahl zu planen. Schwieriger ohne z. B. Toma'ru überzeugt zu haben." }
        ],
        redeTeile: [
          {
            titel: "Teil 1 — Einleitung",
            gut: "(Geste zu Frauen und Kindern) „Meine Freunde! Großes Leid ist widerfahren, eine fest sitzende Trauer, die einen Schleier über uns legt. Ob beim Zubereiten der Nahrung oder harter körperlicher Arbeit (Geste zu den Männern) und selbst bei der Wacht (einladende große Geste)“",
            normal: "„Liebe Gemeinde! Ich weiß von eurer Trauer, die selbst mich berührt.“",
            schlecht: "(zeigt auf den Baum) „Leute! Ich weiß, euch fehlt dieser Baum“",
            miss: "„Hallo! Ich weiß schon, hier sind einige ganz schön mimosig, wegen diesem ollen Baum da!“"
          },
          {
            titel: "Teil 2 — Anliegen",
            gut: "(Geste, die die ganze Insel einschließt) „In eurer eigenen Geschichte steht es geschrieben: Ein Fremder wird eure Trauer nehmen. Diesen Mann kennt ihr — Vanthai, der sich stets für eure Göttin aufgeopfert hat und euch noch immer Freund nennt. (ernster, mitfühlender Blick in die Menge) Doch auch er musste erst selbst verlieren, um euch wirklich befreien zu können: Jessica wurde auch uns genommen.“",
            normal: "(Geste zur Insel) „Es steht geschrieben: Ein Fremder nimmt eure Trauer. Ihr kennt ihn — Vanthai, der sich für eure Göttin verzehrt hat. (Pause, ernst) Auch ihm wurde genommen. Jessica ist auch unser Verlust.“",
            schlecht: "„Der große Vanthai ist da, um diese Trauer endlich von euch zu nehmen!“",
            miss: "„Und wenn wir diesen riesigen Schatz da bei euch aus der Höhle ins Meer kippen, ist doch wieder alles gut, oder?“"
          },
          {
            titel: "Teil 3 — Abschluss/Aufruf",
            gut: "(Arme geöffnet, an die ganze Menge gewandt) „Ihr habt es selbst gesagt — die Prophezeiung gehört euch, nicht nur einer Stimme in eurem Rat. Wenn ihr eure Trauer wirklich enden sehen wollt, dann sprecht es jetzt gemeinsam aus, laut genug, dass auch euer Häuptling es hört: Gebt Vanthai das Siegel!“ (hält inne, lässt der Menge den Moment, es aufzugreifen)",
            normal: "(Geste zum Häuptling, dann zur Menge) „Die Geschichte gehört euch allen — nicht nur einem Mann im Tempel. Wenn ihr an die Prophezeiung glaubt, dann verlangt jetzt, dass das Siegel an Vanthai geht!“",
            schlecht: "(zeigt auf den Häuptling) „Warum entscheidet einer allein über eure Erlösung? Fordert das Siegel — jetzt!“",
            miss: "„Also, wer ist jetzt eigentlich hier der Boss? Gebt uns einfach das Ding, dann ist auch gut!“"
          }
        ]
      }
    }
  },

  "lager": {
    personen: "James Harwick · Cormac Daly · Sorathi",
    interaktionen: {
      "jagd_in_der_daemmerung": {
        title: "Jagd in der Dämmerung",
        kurz: "Cormac hält die Stimmung hoch, während Harwick sich zurückzieht, und schickt die Spieler auf Wildschwein-Jagd — Geschicklichkeit zum Schießen, Mechanik zum Nachladen, mehrere Versuche bis zur völligen Dunkelheit. Danach: nächtliches Erwachen, der Thahal-Kontakt kündigt sich an (siehe eigene, noch offene Interaktion).",
        details: "Die Männer erreichen einen geeigneten Platz und schlagen ihr Lager auf. Einer aus der Crew fragt etwas ängstlich, ob es hier giftige Schlangen oder Ähnliches gibt.\n\nHarwick hat sich etwas zurückgezogen. Cormac erkennt das und hält die Meute in Schach. Er ermuntert sie: Hier gebe es nur dicke Käfer und ein paar Spinnen. Unzählig viel Obst — und, dabei grinst er sie an (das Grinsen erreicht seine Augen allerdings nie) — vor allem Wildschwein.\n\n„Bereitet ein Feuer vor. Die Thahal werden uns heute nicht versorgen.“ Er deutet auf die Spieler. „Schnappt euch zwei Musketen und stabile Säbel und erlegt uns ein Schwein.“\n\nWegen der beginnenden Dämmerung braucht es Proben, die beim Jagen helfen — keine leichte Aufgabe. Wer glaubhaft macht, Übung im Schießen zu haben, kann mit einer Geschicklichkeits-Probe feuern. Ein Fehlschuss verlangt eine Mechanik-Probe zum Nachladen — sonst ist das Schwein weg. Mehrere Versuche sind möglich, bis die Dunkelheit so dicht ist, dass man die eigene Hand vor Augen nicht mehr sieht.\n\nKommen die Spieler ohne erlegtes Tier zurück — und kommen sie auch nicht auf die Idee, wenigstens Früchte zu sammeln —, sinkt die Stimmung im Camp weiter.\n\nTief in der Nacht raschelt es im Gebüsch. Niemand hat Wachen eingeteilt. Nur wer auf Wahrnehmung würfelt, wird davon wach. (SL-Hinweis: wie die Spieler reagieren, bleibt bewusst offen.)\n\nEs ist der junge Mann aus dem Dorf, der aus dem Dschungel kommt. Wer jetzt wach ist, sieht: Harwick sitzt noch immer am erloschenen Feuer.",
        trigger: [
          { id: "lager_bezogen", label: "Crew erreicht den Lagerplatz, jemand fragt ängstlich nach giftigen Tieren", info: "Die Männer erreichen einen geeigneten Platz und schlagen ihr Lager auf. Einer aus der Crew fragt etwas ängstlich, ob es hier giftige Schlangen oder Ähnliches gibt." },
          { id: "cormac_haelt_stimmung", label: "Cormac hält die Stimmung hoch, während Harwick sich zurückzieht", info: "Harwick hat sich etwas zurückgezogen. Cormac erkennt das und hält die Meute in Schach: Hier gebe es nur dicke Käfer und ein paar Spinnen, unzählig viel Obst — und vor allem Wildschwein (das Grinsen erreicht seine Augen allerdings nie)." },
          { id: "jagdauftrag", label: "Cormac schickt die Spieler mit Musketen/Säbeln auf Wildschwein-Jagd", info: "„Bereitet ein Feuer vor. Die Thahal werden uns heute nicht versorgen.“ Er deutet auf die Spieler. „Schnappt euch zwei Musketen und stabile Säbel und erlegt uns ein Schwein.“" },
          { id: "jagd_proben", label: "Geschicklichkeit zum Schießen, Mechanik zum Nachladen, mehrere Versuche bis zur Dunkelheit", info: "Wegen der beginnenden Dämmerung braucht es Proben: Geschicklichkeits-Probe zum Feuern, bei Fehlschuss eine Mechanik-Probe zum Nachladen — sonst ist das Schwein weg. Mehrere Versuche möglich, bis die Dunkelheit zu dicht wird." },
          { id: "jagd_erfolglos", label: "Ohne Beute und ohne gesammeltes Obst sinkt die Stimmung weiter", info: "Kommen die Spieler ohne erlegtes Tier zurück — und kommen sie auch nicht auf die Idee, wenigstens Früchte zu sammeln —, sinkt die Stimmung im Camp weiter." },
          { id: "raunen_nachts", label: "Rascheln im Gebüsch tief in der Nacht — nur bei Wahrnehmung wach", info: "Tief in der Nacht raschelt es im Gebüsch. Niemand hat Wachen eingeteilt. Nur wer auf Wahrnehmung würfelt, wird davon wach." },
          { id: "junge_mann_erscheint", label: "Der junge Mann aus dem Dorf kommt aus dem Dschungel, Harwick sitzt noch am erloschenen Feuer", info: "Es ist der junge Mann aus dem Dorf, der aus dem Dschungel kommt. Wer jetzt wach ist, sieht: Harwick sitzt noch immer am erloschenen Feuer." }
        ]
      },
      "sorathis_besuch": {
        title: "Sorathis Besuch",
        kurz: "Sorathi sucht die Gruppe nachts heimlich auf — Wiedersehen mit Harwick, Geschichten über die Crew (v.a. Wat), die Frage nach Jessica bricht Harwicks Fassade auf. Endet mit einer offenen, spielergetriebenen Diskussion über den Weg zum Siegel.",
        details: "<strong>Die Annäherung</strong><br>\nNachts bemerken Spieler mit einem erfolgreichen Wahrnehmungswurf, dass sich jemand ans Lager anschleicht. Wie sie darauf reagieren, bleibt ihnen frei überlassen. Harwick sitzt noch immer wach am längst erloschenen Feuer, unnatürlich ruhig — er zeigt keine Angst, dreht sich nicht einmal zu den Geräuschen um. Rufen die Spieler oder richten Waffen in die Richtung, ruft eine leise Stimme, dass sie keine Angst haben sollen — Sorathi, wechselnd zwischen der Sprache der Thahal und gebrochenem Englisch.\n\n<strong>Wiedersehen</strong><br>\nSorathi wendet sich direkt an Vanthei und macht ihn auf sich aufmerksam. Aus seinen Gedanken gerissen, zeigt Harwicks Gesicht im Mondschein ein Lächeln, seine Stimme eine Wärme, die die Spieler bisher nicht an ihm kannten. Die beiden sprechen davon, dass Sorathi vor zwei Mondläufen den Kupferritus abgeschlossen hat — Harwick war offenbar lange nicht mehr auf der Insel. Fragen die Spieler nach, erklärt er den Ritus bereitwillig und erzählt dabei auch vom Heiligtum. Sorathi begegnet Vanthei ohne jede Angst oder Zurückhaltung — für ihn ist er schlicht ein Freund der Thahal, der ihnen hilft. In gebrochenem Englisch spricht er über Harwicks Aufgabe und davon, wie dieser schon unter dem alten Ta'ahal in Ehren gehalten wurde. Das Feuer wird neu entfacht, und sie sitzen eine Weile friedlich beisammen.\n\n<strong>Sorathi und die Crew</strong><br>\nHarwick hatte einst Sorathis Mutter geholfen, nachdem ein Wildschwein sie aufgeschlitzt hatte — er nahm beide mit an Bord. Sorathi kennt daher große Teile der Crew:\n<ul>\n  <li>Er fragt aktiv nach Josiah und Tom.</li>\n  <li>Als auch Cormac zum Gespräch dazustößt, freut er sich kindlich und umarmt den alten Seebären — der zunächst sichtlich überfordert ist, bis sich tiefe innere Zufriedenheit auf seinem Gesicht breitmacht.</li>\n</ul>\n\n<strong>Die Geschichte mit Wat</strong><br>\n<ul>\n  <li>Wat war es, der die verletzte Mutter und den damals kleinen Jungen beim Jagen im Dschungel fand.</li>\n  <li>Sorathi hatte Angst — bis seine Mutter, trotz ihrer Schmerzen, keine Spur davon zeigte, nur Wärme für ihr Kind. Etwas daran erreichte Wat, ähnlich wie Josiahs vorbehaltlose Art ihn erreicht.</li>\n  <li>Er kniete vor dem verängstigten Jungen und versprach rau: „Sie wird wieder gesund.“</li>\n  <li>Sorathi verstand die Worte damals nicht — kein Englisch, nur ein bewaffneter Fremder in einer fremden Sprache — und genau deshalb wollte er seither Englisch lernen; über die Jahre bekam er immer wieder ein Buch geschenkt.</li>\n  <li>Selbst Harwick und Cormac haben keine wirkliche Erklärung für Wats Verhalten — auf Nachfrage damals schaute er nur mürrisch und wies sie ab, weshalb niemand weiter bohrte.</li>\n  <li>Wat selbst ließ sich nie im Dorf blicken und blieb auch bei späteren Besuchen distanziert — nickte Sorathi aber jedes Mal anerkennend zu.</li>\n</ul>\n<em>GM-Hinweis: Vorgriff für eine spätere Szene — konfrontiert man Wat später damit, bleibt er schroff, aber bei der Nachricht von Sorathis Kupferritus oder seiner Hilfe kann selbst er sich ein kleines Lächeln nicht verkneifen.</em>\n\n<strong>Die Frage nach Jessica</strong><br>\nIrgendwann fragt Sorathi, wo Jessica sei. Das Gespräch gerät ins Stocken. Cormac versucht abzulenken und bringt noch einmal den Kupferritus ins Spiel — vergeblich. Harwick wird ernst: „Sie ist heute nicht bei uns.“ Er wird nicht sagen, dass sie tot ist. Sorathi kann die Andeutung nicht lesen und fragt weiter nach, bis Harwick keinen Ausweg mehr hat. Die Spieler bemerken Tränen in seinen Augen. Er bedankt sich für Sorathis Besuch, verabschiedet sich, geht zu den Zelten und starrt in den Wald.\n\n<strong>Cormacs Tribut</strong><br>\nCormac erzählt von ihr — mit Bewunderung und Trauer in der Stimme. Dabei hält er den Knoten an seinem Gürtel fest, den er immer bei sich trägt, und streicht mit dem Daumen über das Seil. Sorathi versteht und wird sichtlich traurig: Sie wäre jetzt auch 14, und der alte Ta'ahal hatte davon gesprochen, dass auch sie den Kupferritus hätte ablegen können. Sie war immer so stark und aufgeweckt.\n\n<strong>Sorathis Erkenntnis</strong><br>\nSorathi begreift in diesem Moment etwas: Jessicas Tod und Harwicks nie überwundene Trauer markieren für ihn den Zeitpunkt, an dem Vanthei das Geschenk der Göttin überbringen sollte. Die Thahal fürchten, seit der Baum starb, die Verbindung zur Göttin verloren zu haben — Harwick trägt dieselbe Wunde durch Jessica. Sorathi weiß, dass die Göttin niemals ein Leben zurückbringen kann — dieser Gedanke wäre den Thahal unvorstellbar —, aber sie heilt die Wunden der Seele. In den Thahal, und auch in Harwick.\n\n<strong>Offene Diskussion: Der Weg zum Siegel</strong><br>\nVon hier aus entwickelt sich ein offenes Gespräch, in das die Spieler stark eingebunden werden: was der beste Weg ist, an das Siegel zu kommen. Bewusst nicht vorgeskriptet — das entscheidet sich am Tisch.",
        trigger: [
          { id: "anschleichen_bemerkt", label: "Wahrnehmungswurf: Spieler bemerken, dass sich jemand anschleicht", info: "Nachts bemerken Spieler mit einem erfolgreichen Wahrnehmungswurf, dass sich jemand ans Lager anschleicht. Wie sie reagieren, bleibt ihnen frei überlassen." },
          { id: "harwick_ungeruehrt", label: "Harwick zeigt keine Angst, dreht sich nicht um", info: "Harwick sitzt noch immer wach am längst erloschenen Feuer, unnatürlich ruhig — er zeigt keine Angst, dreht sich nicht einmal zu den Geräuschen um." },
          { id: "sorathi_ruft", label: "Bei Rufen/Waffen: Sorathi beruhigt leise, wechselt Sprache", info: "Rufen die Spieler oder richten Waffen in die Richtung, ruft eine leise Stimme, dass sie keine Angst haben sollen — Sorathi, wechselnd zwischen der Sprache der Thahal und gebrochenem Englisch." },
          { id: "vanthei_erkannt_warm", label: "Sorathi spricht Vanthei an — Harwicks Lächeln/Wärme wird sichtbar", info: "Sorathi wendet sich direkt an Vanthei. Aus seinen Gedanken gerissen, zeigt Harwicks Gesicht im Mondschein ein Lächeln, seine Stimme eine Wärme, die die Spieler bisher nicht an ihm kannten." },
          { id: "kupferritus_erwaehnt", label: "Sorathis kürzlich abgeschlossener Kupferritus wird erwähnt, Harwick erklärt auf Nachfrage", info: "Die beiden sprechen davon, dass Sorathi vor zwei Mondläufen den Kupferritus abgeschlossen hat. Fragen die Spieler nach, erklärt Harwick ihn bereitwillig und erzählt dabei vom Heiligtum." },
          { id: "feuer_neu_entfacht", label: "Feuer wird neu entfacht, alle sitzen friedlich zusammen", info: "Das Feuer wird neu entfacht, und sie sitzen eine Weile friedlich beisammen." },
          { id: "sorathi_fragt_crew", label: "Sorathi fragt nach Josiah/Tom, freut sich kindlich über Cormac, umarmt ihn", info: "Er fragt aktiv nach Josiah und Tom. Als auch Cormac dazustößt, freut er sich kindlich und umarmt den alten Seebären — der zunächst überfordert ist, bis tiefe innere Zufriedenheit sich auf seinem Gesicht breitmacht." },
          { id: "wat_rettungsgeschichte", label: "Sorathi erzählt, wie Wat seine Mutter fand und ihr Genesung versprach", info: "Wat war es, der die verletzte Mutter und den damals kleinen Jungen im Dschungel fand. Er kniete vor dem verängstigten Jungen und versprach rau: „Sie wird wieder gesund.“ Deshalb wollte Sorathi seither Englisch lernen." },
          { id: "jessica_frage", label: "Sorathi fragt, wo Jessica sei — Gespräch gerät ins Stocken", info: "Irgendwann fragt Sorathi, wo Jessica sei. Das Gespräch gerät ins Stocken. Cormac versucht abzulenken und bringt den Kupferritus noch einmal ins Spiel — vergeblich." },
          { id: "harwicks_rueckzug", label: "Harwick weicht aus, wird in die Enge getrieben, zieht sich mit Tränen in den Augen zurück", info: "Harwick wird ernst: „Sie ist heute nicht bei uns.“ Er wird nicht sagen, dass sie tot ist. Sorathi fragt weiter, bis Harwick keinen Ausweg mehr hat. Die Spieler bemerken Tränen in seinen Augen; er bedankt sich, verabschiedet sich, geht zu den Zelten und starrt in den Wald." },
          { id: "cormacs_tribut", label: "Cormac erzählt von Jessica, hält seinen Knoten fest — Sorathi wird traurig", info: "Cormac erzählt von ihr — mit Bewunderung und Trauer in der Stimme, hält dabei den Knoten an seinem Gürtel fest. Sorathi wird sichtlich traurig: Sie wäre jetzt auch 14, der alte Ta'ahal hatte davon gesprochen, dass auch sie den Kupferritus hätte ablegen können." },
          { id: "sorathis_erkenntnis", label: "Sorathi erkennt: jetzt ist der Zeitpunkt, das Geschenk der Göttin zu überbringen", info: "Sorathi begreift: Jessicas Tod und Harwicks nie überwundene Trauer markieren den Zeitpunkt, an dem Vanthei das Geschenk der Göttin überbringen sollte. Die Göttin kann kein Leben zurückbringen — aber sie heilt die Wunden der Seele." },
          {
            id: "offene_diskussion_siegel", label: "Offene, spielergetriebene Diskussion: der beste Weg zum Siegel", info: "Von hier aus entwickelt sich ein offenes Gespräch, in das die Spieler stark eingebunden werden: was der beste Weg ist, an das Siegel zu kommen. Bewusst nicht vorgeskriptet — das entscheidet sich am Tisch.",
            grantsQuest: { // Bibel 2.9 - erstes Beispiel
              warum: "Es gibt andere im Dorf, die wie Sorathis denken und dieselbe Möglichkeit sehen: das Siegel zu stehlen, statt es Harwick öffentlich zu überlassen.",
              was: "Einen Weg finden, an das Siegel zu kommen."
            }
          }
        ]
      }
    }
  },

  // Dorf-Sub-Orte (Bibel 2.9, August 2026): 16 kompakte Aufgaben, verteilt
  // auf 4 Orte innerhalb des Dorfbildes (siehe schatzinsel_scenes.js,
  // parentId "stammesdorf"). Ziel: 10 der 16 reichen, damit sich genug
  // Dorfbewohner der Gruppe anschließen - danach unterbricht Sorathi (siehe
  // "stammesdorf".die_gegenrede weiter unten). Die genaue Zahl bleibt den
  // Spielern verborgen (Bibel 2.1) - rein SL-seitige Fortschrittsanzeige.
  // NPC-Namen (Kelo/Staaf/Venari/Toma'ru) sind Vorschlag/Aufschlag, von
  // Hendrik noch zu schärfen/freizugeben.
  "dorf_platz": {
    personen: "Kelo · Staaf · verschiedene Dorfbewohner",
    kurz: "Zentraler Versammlungsort, sieben Aufgaben. Später auch Schauplatz der Gegenrede.",
    ortHinweis: "Die meisten Ein-Wurf-Beats des Dorf-Durchgangs sitzen hier - kurz halten, nur bei Kelo (Der Zweifler) und der späteren Gegenrede echte Szenen-Zeit einplanen.",
    interaktionen: {
      "der_zweifler": {
        title: "Kelo — Der Zweifler",
        kurz: "Ein junger Mann, der aus Angst vor Konsequenzen (noch) nicht zu Sorathis Seite steht. Rhetorik/Auftreten ODER Körper (alternative Probe, wie beim Trewin-Zwillinge-Trinkspiel).",
        details: "Kelo hält sich am Rand der Menge, beobachtet die Fremden, spricht aber niemanden direkt an. Fragt man ihn, windet er sich: er glaubt Sorathis Worten, aber was, wenn der Häuptling am Ende doch Recht behält und alles nur schlimmer wird? Er will überzeugt werden, nicht überredet.",
        trigger: [
          { id: "angesprochen", label: "Kelo lässt sich auf ein Gespräch ein", info: "Kelo hält sich am Rand der Menge, beobachtet die Fremden, spricht aber niemanden direkt an. Fragt man ihn, windet er sich: er glaubt Sorathis Worten, aber was, wenn der Häuptling am Ende doch Recht behält?" },
          { id: "rhetorik_erfolg", label: "Überzeugt per Rhetorik/Auftreten", info: "Ein gutes Gespräch nimmt ihm die Angst - er sieht ein, dass Schweigen ihn nicht schützt." },
          { id: "koerper_erfolg", label: "Überzeugt per Körper (Demonstration von Verlässlichkeit)", info: "Statt Worten zeigt der Spieler durch eine handfeste Tat, dass man sich auf ihn verlassen kann - das überzeugt Kelo mehr als jede Rede es könnte." },
          { id: "misserfolg", label: "Kelo bleibt beim Schweigen", info: "Kelo zuckt zusammen und zieht sich zurück - für heute ist hier nichts mehr zu holen." }
        ]
      },
      "der_trauernde": {
        title: "Der Trauernde",
        kurz: "Ein Dorfbewohner trauert um die Verbindung zur Göttin (toter heiliger Baum). Rhetorik, kurzer Beat.",
        details: "Am Rand des Platzes sitzt jemand still vor sich hin, den Blick auf die Stelle gerichtet, wo früher der heilige Baum stand. Ein tröstendes Wort reicht - keine große Verhandlung.",
        trigger: [
          { id: "erfolg", label: "Tröstendes Wort gefunden", info: "Ein tröstendes Wort reicht - keine große Verhandlung. Der Dorfbewohner nickt dankbar." },
          { id: "misserfolg", label: "Trost verfehlt Wirkung", info: "Die Worte landen falsch, der Trauernde zieht sich in sich zurück." }
        ]
      },
      "wer_steht_wirklich_wo": {
        title: "Wer steht wirklich wo?",
        kurz: "Instinkt/Menschenkenntnis: beim Beobachten des Dorflebens erkennen, wer wirklich hinter Ta'ahal steht und wer nur schweigt.",
        details: "Wer das Dorfleben eine Weile beobachtet - Blicke, wer mit wem redet, wer sich fernhält - kann lesen, wo die Gräben wirklich verlaufen, nicht nur, wo sie öffentlich behauptet werden.",
        trigger: [
          { id: "erfolg", label: "Verdeckten Verbündeten erkannt", info: "Ein Dorfbewohner hält sich auffällig zurück, wenn Ta'ahal spricht - ein möglicher stiller Verbündeter." },
          { id: "misserfolg", label: "Nichts Eindeutiges erkannt", info: "Die Beobachtung bleibt ohne klaren Befund." }
        ]
      },
      "die_luege_durchschauen": {
        title: "Die Lüge durchschauen",
        kurz: "Instinkt/Menschenkenntnis: jemand gibt sich neutral, verbirgt aber etwas (Bibel 2.2).",
        details: "Ein Dorfbewohner gibt sich betont gleichgültig gegenüber der ganzen Sache - zu betont, um echt zu sein.",
        trigger: [
          { id: "erfolg", label: "Lüge erkannt, Gespräch öffnet sich", info: "Die aufgesetzte Gleichgültigkeit fällt auf - konfrontiert damit, gibt der Dorfbewohner zu, dass ihn die Sache doch beschäftigt, und redet." },
          { id: "misserfolg", label: "Fassade bleibt intakt", info: "Die Gleichgültigkeit wirkt überzeugend genug, das Gespräch bleibt oberflächlich." }
        ]
      },
      "der_wissbegierige": {
        title: "Staaf — Der Wissbegierige",
        kurz: "Ein Dorfbewohner, generell an jeglichem Fachwissen interessiert. Offener Int-/Fachwissen-Wurf auf das, was der Charakter zufällig draufhat.",
        details: "Staaf ist fasziniert von allem, was die Fremden über die Welt jenseits der Insel wissen - gleich zu welchem Thema. Er stellt Fragen, hört aufmerksam zu, will verstehen. Der genaue Themenbereich ergibt sich aus dem Charakter am Tisch - bewusst nicht festgelegt, damit die Aufgabe für jede Gruppe funktioniert.",
        trigger: [
          { id: "erfolg", label: "Staaf ist begeistert", info: "Eine verständliche, richtige Antwort auf ein Fachgebiet, das der Charakter beherrscht, begeistert Staaf sichtlich - er wird zum Verbündeten." },
          { id: "misserfolg", label: "Staaf bleibt unbeeindruckt", info: "Die Erklärung verwirrt mehr, als sie erklärt - Staaf bleibt höflich, aber unbeeindruckt." }
        ]
      },
      "kraftprobe_unter_zeugen": {
        title: "Kraftprobe unter Zeugen",
        kurz: "Ein junger, stolzer Thahal fordert zum Kräftemessen vor kleinem Publikum. Körper-Probe.",
        details: "Vor ein paar Zuschauern fordert ein junger Thahal zum Kräftemessen heraus - Baumstamm-Heben oder Ringen, was sich gerade anbietet. Erfolg verdient sichtbaren Respekt, nicht nur beim Gegner selbst.",
        trigger: [
          { id: "guter_erfolg", label: "Guter Erfolg — Respekt vor der ganzen Gruppe", info: "Ein überlegener Sieg sorgt für anerkennendes Raunen in der ganzen Zuschauermenge, nicht nur beim Herausforderer." },
          { id: "normaler_erfolg", label: "Normaler Erfolg — knapper Sieg", info: "Ein knapper, aber klarer Sieg - der Herausforderer erkennt es an." },
          { id: "misserfolg", label: "Misserfolg — Niederlage", info: "Der Herausforderer gewinnt, freundschaftlich, aber unmissverständlich." }
        ]
      },
      "kletter_aufgabe": {
        title: "Kletter-Aufgabe",
        kurz: "An einem Haus hochklettern, aus Spaß/als Mutprobe. Geschick-Probe.",
        details: "Ein paar Dorfkinder fordern spielerisch zu einer Mutprobe heraus: an einer der kunstvoll gebauten Hütten hochklettern. Leichtfüßiger Moment, kein Ernstfall.",
        trigger: [
          { id: "erfolg", label: "Mutprobe gemeistert", info: "Sauber hochgeklettert - die Kinder johlen begeistert." },
          { id: "misserfolg", label: "Abgerutscht", info: "Ein unrühmlicher Abstieg, aber niemand nimmt es ernst - die Kinder lachen mit, nicht aus." }
        ]
      }
    }
  },

  "dorf_markt": {
    personen: "Verschiedene Händler",
    kurz: "Handelsbereich, fünf Aufgaben - hier stehen manchmal echte Besitztümer der Spieler auf dem Spiel.",
    interaktionen: {
      "der_pistolen_wunsch": {
        title: "Der Pistolen-Wunsch",
        kurz: "Ein Dorfbewohner hat ein Auge auf die Pistole eines Spielers geworfen. Handel-Probe mit echtem Risiko.",
        details: "Ein Händler entdeckt die Pistole eines Spielers und lässt nicht locker - er will sie unbedingt eintauschen. Ein guter Handel-Wurf lenkt sein Interesse auf etwas Entbehrlicheres (Schuhe, Hemd); bei Misserfolg bleibt die Pistole hartnäckig im Gespräch.",
        trigger: [
          { id: "umgelenkt", label: "Interesse erfolgreich umgelenkt", info: "Ein guter Handel-Wurf lenkt sein Interesse auf etwas Entbehrlicheres - Schuhe, ein Hemd. Die Pistole bleibt, wo sie ist." },
          { id: "misserfolg", label: "Pistole bleibt im Gespräch", info: "Der Händler lässt nicht locker - die Pistole bleibt im Gespräch, echtes Risiko, sie am Ende doch herzugeben." }
        ]
      },
      "der_preis_fuer_ein_geheimnis": {
        title: "Der Preis für ein Geheimnis",
        kurz: "Ein Dorfbewohner weiß etwas Wichtiges, verlangt aber im Gegenzug etwas, das dem Spieler selbst wichtig ist.",
        details: "Ein Dorfbewohner deutet an, etwas Nützliches zu wissen - verlangt aber im Gegenzug etwas Persönliches (ein Ausrüstungsstück, ein Andenken). Handel-Wurf entscheidet, wie viel tatsächlich hergegeben werden muss.",
        trigger: [
          { id: "guter_erfolg", label: "Guter Erfolg — Information für wenig Gegenwert", info: "Ein geschickter Handel-Wurf drückt den Preis fast auf nichts herunter." },
          { id: "normaler_erfolg", label: "Normaler Erfolg — fairer Tausch", info: "Ein fairer Tausch - etwas Persönliches gegen die Information." },
          { id: "misserfolg", label: "Misserfolg — kein Deal", info: "Kein Deal zustande gekommen, das Geheimnis bleibt eines." }
        ]
      },
      "der_haendler": {
        title: "Der Händler",
        kurz: "Kleiner Gefallen/Information gegen etwas Charme. Rhetorik, kurz.",
        details: "Ein Händler ist für einen kleinen Gefallen zu haben, wenn man ihn charmant genug anspricht - nichts, das lange dauert.",
        trigger: [
          { id: "erfolg", label: "Gefallen erwirkt", info: "Ein bisschen Charme reicht - der Händler hilft gerne weiter." },
          { id: "misserfolg", label: "Kein Gefallen", info: "Der Händler bleibt beschäftigt, kein Interesse an einem Gespräch." }
        ]
      },
      "wurf_wettkampf": {
        title: "Wurf-Wettkampf",
        kurz: "Freundlicher Wettkampf gegen einen Dorfbewohner. Geschick-Probe, kein Fehlschlag-Malus.",
        details: "Am Rand des Marktes wird gewettet, wer am treffsichersten wirft - ein freundschaftlicher Wettkampf ohne Konsequenzen bei Misserfolg.",
        trigger: [
          { id: "erfolg", label: "Wettkampf gewonnen", info: "Ein sauberer Sieg, begleitet von anerkennendem Gelächter." },
          { id: "misserfolg", label: "Wettkampf verloren", info: "Verloren, aber mit gutem Sport - kein Malus, nur ein bisschen Spott." }
        ]
      },
      "das_fallende_regal": {
        title: "Das fallende Regal",
        kurz: "Ein schweres Regal fällt auf einen Menschen - spontane Rettungsaktion. Körper-Probe.",
        details: "Ohne Vorwarnung kippt ein schwer beladenes Warenregal auf einen Marktstand-Betreiber zu. Sofortiges Handeln ist gefragt, kein Zögern.",
        trigger: [
          { id: "erfolg", label: "Rettung gelungen", info: "Das Regal wird rechtzeitig aufgefangen/weggestemmt - der Betreiber kommt mit dem Schrecken davon, sichtlich dankbar." },
          { id: "misserfolg", label: "Rettung misslingt teilweise", info: "Nicht schnell genug - leichte Blessuren, aber nichts Ernstes. Die Dankbarkeit fällt entsprechend verhaltener aus." }
        ]
      }
    }
  },

  "dorf_heilerin": {
    personen: "Venari (Heilerin)",
    kurz: "Hütte der Heilerin, drei Aufgaben - zwei Heilkunde, eine Geschichte/Latein.",
    npcs: [
      {
        name: "Venari",
        rolle: "Heilerin des Dorfes",
        verfassung: "Ruhig, aufmerksam, prüft jeden Fremden erst mit den Augen, bevor sie ein Wort wechselt.",
        beduerfnis: "Echtes Können sehen, nicht nur Behauptungen - wer ihr etwas beweist, gewinnt ihr Vertrauen schnell."
      }
    ],
    interaktionen: {
      "sam_oakleys_wunde": {
        title: "Sam Oakleys Wunde",
        kurz: "Die Wunde vom losen Balken (Station 1) ist noch nicht richtig verheilt - echte Behandlung statt nur Erste Hilfe.",
        details: "Sam Oakley humpelt noch immer sichtbar von der Verletzung am Schiffswrack. Venari bietet ihre Hütte für eine ordentliche Behandlung an, wenn jemand mit Heilkunde-Kenntnissen mit anpackt.",
        trigger: [
          { id: "guter_erfolg", label: "Guter Erfolg — Wunde vollständig versorgt", info: "Eine saubere, kundige Behandlung - Sam ist sichtlich erleichtert und Venari beeindruckt von echtem Können." },
          { id: "normaler_erfolg", label: "Normaler Erfolg — Wunde versorgt", info: "Solide Behandlung, Sam geht es merklich besser." },
          { id: "misserfolg", label: "Misserfolg — kein Fortschritt", info: "Die Behandlung hilft kaum - Venari übernimmt selbst, mit einem stillen, wenig beeindruckten Blick." }
        ]
      },
      "die_richtige_heilpflanze": {
        title: "Die richtige Heilpflanze",
        kurz: "Venari testet die Pflanzenkenntnis: die richtige Heilpflanze unter mehreren ähnlichen erkennen/sammeln.",
        details: "Venari legt mehrere ähnlich aussehende getrocknete Pflanzen nebeneinander und fragt, welche wirklich heilt und welche nur ähnlich aussieht - eine stille Prüfung, kein Verhör.",
        trigger: [
          { id: "erfolg", label: "Richtige Pflanze erkannt", info: "Die richtige Pflanze wird sicher erkannt - Venari nickt anerkennend." },
          { id: "misserfolg", label: "Falsche Pflanze gewählt", info: "Eine falsche Wahl - Venari korrigiert wortlos, ohne Spott, aber auch ohne Lob." }
        ]
      },
      "die_figur_der_goettin": {
        title: "Die Figur der Göttin",
        kurz: "Eine geschnitzte Figur mit Schmuck (gehört einem Dorfbewohner, nicht Venari) trägt eine lateinische Inschrift. Geschichte-Wurf übersetzt sie - Bezug zu Vanthei.",
        details: "Ein Dorfbewohner besitzt eine geschnitzte Figur, die er seiner Göttin zuschreibt - die Gesichtszüge ähneln eher den Inselbewohnern als Europäern, sie trägt Schmuck. Am Sockel ist eine Inschrift eingeritzt, in einer Sprache, die niemand im Dorf deuten kann. Er zeigt sie den Spielern in der Hoffnung, dass sie mehr wissen. Ein Geschichte-Wurf (Latein-/Bildungswissen) übersetzt die Inschrift: „Vertraut den Vorzeichen“ (o. ä.) - ein Satz, der sich mit Vanthei in Verbindung bringen lässt und in der Gegenrede wiederverwendet werden kann.",
        trigger: [
          { id: "gezeigt", label: "Figur wird gezeigt", info: "Ein Dorfbewohner zeigt die Figur den Spielern in der Hoffnung, dass sie mehr über die Inschrift wissen als er selbst." },
          { id: "uebersetzt", label: "Inschrift übersetzt — Bezug zu Vanthei", info: "„Vertraut den Vorzeichen“ (o. ä.) - ein Satz, der sich unmittelbar mit Vanthei in Verbindung bringen lässt. Spannender Bruch zwischen dem, was die Figur zu sein scheint (Göttin), und ihrem tatsächlichen, vermutlich europäischen Ursprung." },
          { id: "misserfolg", label: "Inschrift bleibt unübersetzt", info: "Die Zeichen bleiben ein Rätsel - der Dorfbewohner nimmt die Figur enttäuscht wieder an sich." }
        ]
      }
    }
  },

  "dorf_tempel": {
    personen: "Toma'ru (Wachposten) · Das Siegel",
    kurz: "Der eigentliche Zielort des Dorf-Durchgangs — hier wird das Siegel bewacht, das für den Zugang zur Höhle nötig ist.",
    ortHinweis: "Sonne/Mond scheinen durch eine schmale Dachöffnung auf Wasser im Inneren, der Schimmer erinnert an Gold und Silber. Das Siegel selbst zu bekommen (Überzeugen/Diebstahl/Gewalt) ist NICHT Teil dieser Aufgabe hier - das entscheidet sich erst bei der Gegenrede bzw. den später geplanten Höhlen-Zugängen.",
    npcs: [
      {
        name: "Toma'ru",
        rolle: "Wachposten am Tempel",
        verfassung: "Wachsam, aber nicht unfreundlich - Pflichtbewusstsein statt Feindseligkeit.",
        beduerfnis: "Anerkennung für seine Aufgabe, sei es durch Gespräch/Kameradschaft oder durch ehrlichen Respekt vor Stärke."
      }
    ],
    interaktionen: {
      "der_wachposten": {
        title: "Toma'ru — Der Wachposten",
        kurz: "Bewacht das Siegel. Rhetorik/Auftreten (Kameradschaft/Ablenkung) ODER Körper (Respekt durch Kraftprobe) - erleichtert einen späteren Diebstahl-Versuch.",
        details: "Toma'ru steht Wache vor dem Tempeleingang, aufmerksam, aber gesprächsbereit. Zwei Wege, ihn dazu zu bringen, heute Abend „nicht so aufmerksam“ zu sein: ein gutes Gespräch (Kameradschaft, Ablenkung) oder eine Demonstration von Stärke, die seinen Respekt verdient statt seiner Worte zu bedürfen. Erfolg setzt einen Vorteil für einen späteren Schleichversuch - die eigentliche Schleich-Mechanik selbst ist Teil eines separaten, späteren Planungsschritts (Höhlen-Zugänge).",
        trigger: [
          { id: "angesprochen", label: "Toma'ru lässt sich auf ein Gespräch ein", info: "Toma'ru steht Wache, aufmerksam, aber gesprächsbereit - kein unfreundlicher Wächter, nur pflichtbewusst." },
          { id: "rhetorik_erfolg", label: "Überzeugt per Rhetorik/Auftreten", info: "Kameradschaft/Ablenkung überzeugt ihn, heute Abend ein Auge zuzudrücken." },
          { id: "koerper_erfolg", label: "Überzeugt per Körper (Respekt durch Kraftprobe)", info: "Eine beeindruckende Demonstration von Stärke verdient seinen Respekt - er lässt sich darauf ein, ohne dass viele Worte nötig wären." },
          { id: "misserfolg", label: "Toma'ru bleibt wachsam", info: "Weder Worte noch Taten überzeugen ihn - er bleibt heute Abend besonders aufmerksam, ein späterer Schleichversuch wird dadurch schwerer." }
        ]
      }
    }
  },

  // Station 5 - letzte Station der Insel-Expedition. Bewusst kaum Dialog mit
  // den Thahal (Wächter bleibt namenlos/wortkarg, siehe Codex "Das Volk der
  // Thahal" - die Höhlenwache ist eine rein religiöse, stille Pflicht) -
  // Kern der Szene ist die Ankunft in der Schatzkammer selbst.
  "hoehle": {
    personen: "James Harwick (\"Vanthei\") · Cormac Daly · Ein Wächter (namenlos)",
    interaktionen: {
      "die_kammer_der_goettin": {
        title: "Die Kammer der Göttin",
        kurz: "Übergabe des Siegels an einen Wächter, stille Gänge mit Raum für Gespräche, dann die eigentliche Schatzkammer: der silberne Stein, Licht durch ein Deckenloch, ringsum Schätze — darunter, bei genauem Hinsehen, auch Harwicks eigenes, nie ans Meer gegebenes Gut. Ein Teil des Schatzes steckt hinter einem Stein-Hebel-Mechanismus fest (Körper zum Aktivieren, Komplikation, Mechanik ODER Körper zur Lösung) — parallel wird der Wächter am Sockel misstrauisch (Rhetorik/Menschenkenntnis/Instinkt aus der Ferne, echter Split-Fokus), während die Flut langsam zurückkommt (SL-Ermessen, kein fester Rundenzähler). Danach: verfeinerte Truhen-Probe zu zweit.",
        details: "Nur bei ablaufendem Wasser und mit dem Boot lässt sich die Höhle überhaupt erreichen — ein enges Zeitfenster, das die Gruppe knapp einhält. Am Eingang wartet bereits ein Wächter, Langbogen und Standschild wie gewohnt, das Gesicht hinter zeremonieller Bemalung kaum zu lesen. Worte werden kaum gewechselt — hier zählt nicht, was gesagt wird, sondern was übergeben wird.\n\nHarwick reicht das Siegel wortlos weiter — ein runder Vulkanstein, verziert und glänzend glatt poliert, kühl und schwer in der Hand. Der Wächter nimmt es entgegen, prüft es mit einem kurzen, geübten Blick und führt die Gruppe tiefer in den Fels — dorthin, wo ein eigens dafür ausgehauener Sockel wartet. Mit beiden Händen setzt er das Siegel ein; ein trockenes, hallendes Klacken, dann Stille. Er tritt zur Seite und lässt die Gruppe passieren, ohne ein weiteres Wort — von hier an sind sie auf sich gestellt.\n\nDahinter ziehen sich mehrere schmale Gänge durch den nassen Fels, das Licht der mitgebrachten Fackeln wirft lange Schatten. Der Boden ist vom stetigen Wasser glattgeschliffen — wer nicht aufpasst, rutscht (Probe: Geschick oder Körper, keine Erschwernis; bei Misserfolg nichts Schlimmes, nur ein nasser, unwürdiger Sturz). Genug Zeit bleibt für ein Gespräch, wenn die Spieler eines suchen wollen.\n\nHarwick geht auffallend zügig voran, den Blick starr nach vorn gerichtet — Jahre der Vorbereitung, jetzt nur noch wenige Schritte entfernt. Wer genau hinsieht, erkennt in seinem Gesicht nicht nur Erleichterung, sondern auch etwas Angespannteres, das er nicht benennt.\n\nCormac bleibt dicht bei ihm, wortkarg wie immer — bis er, kaum hörbar, sagt: „Egal, was da drin liegt. Nichts davon bringt sie zurück.“ Harwick antwortet nicht.\n\nDie Gänge münden unvermittelt in eine hohe, weite Kammer. Durch ein schmales Loch in der Decke bricht Tageslicht herein, gebündelt wie durch ein Brennglas, und trifft mitten im Raum auf einen mannshohen, silbernen Stein — der das Licht auffängt und in alle Richtungen zurückwirft, bis die ganze Kammer in einem kühlen, flirrenden Schimmer steht.\n\nRingsum: Truhen, Kisten, aufgeschichtete Haufen. Schätze, so weit das Licht reicht.\n\nWer genauer hinsieht (Probe: Wahrnehmung oder Wissen, keine Erschwernis), erkennt: Nicht alles hier ist von den Thahal gearbeitet. Zwischen geschnitztem Holz, Muscheln und rohem Gold liegen europäische Münzen, ein Kompass, Ringe fremder Machart — Fracht, keine Opfergabe. Was Harwick über die Jahre angeblich für die Göttin verwahrt hat, liegt hier unübersehbar zwischen dem, was tatsächlich ihr gehört. Harwick selbst bewegt sich auffällig zielsicher durch den Haufen, als wüsste er genau, wo er zuletzt hingegriffen hat.\n\nEin Teil des Schatzes liegt jedoch nicht einfach da: Hinter einem schweren Steinblock, eingefasst in eine morsche, aber kunstvolle Holzkonstruktion aus Balken und Seilzügen, verbirgt sich der Großteil der Truhen. Harwick deutet knapp auf einen der Hebel — offenbar kein Geheimnis für ihn, nur eine Frage der Kraft.\n\nWer sich daran versucht (Probe: Körper), setzt den Mechanismus in Bewegung — der Stein beginnt sich zu heben, quietschend, staublösend. Doch mitten in der Bewegung reißt ein Seil, oder ein Balken splittert: Die Konstruktion droht, sich selbst zu zerlegen und den Stein unkontrolliert zurückfallen zu lassen. Jetzt zählt schnelles Handeln — entweder wird der Schaden notdürftig repariert (Probe: Mechanik) oder jemand stemmt sich mit bloßer Kraft dagegen und hält die Konstruktion, bis sie wieder greift (Probe: Körper, alternativer Weg zur Mechanik-Lösung).\n\nDer Lärm hallt durch die Gänge zurück bis zum Wächter am Sockel. Was zuerst wie beiläufiges Poltern klingt, wird ihm zunehmend unheimlich — ein Zeichen? Eine Strafe der Göttin für das, was hier geschieht? Wer ihn beruhigen will (Probe: Rhetorik, Menschenkenntnis oder Instinkt — sein Zweifel liest sich eher aus seiner Haltung als aus Worten, wortkarg wie er ist), muss das aus der Ferne tun, während andere sich um die Konstruktion kümmern — echter Split-Fokus, niemand kann beides gleichzeitig.\n\nDie ganze Zeit über kommt das Wasser zurück. Wie viel Zeit bleibt, entscheidet der SL spontan am Tisch, je nachdem wie zäh sich die Gruppe anstellt — es gibt keine feste Rundenzahl. Gelingt es rechtzeitig, gibt der Stein den restlichen Schatz frei. Zieht sich alles zu lange hin, bleibt ein Teil davon zurück, wenn das Wasser steigt — mit Folgen, die sich erst beim Artefakthandel zeigen, wenn das Mitgebrachte für den erhofften Handel nicht ganz reicht.\n\nWie die Spieler mit dem Fund umgehen — ehrfürchtig oder gierig, wählerisch oder wahllos —, bleibt ganz ihnen überlassen. Es gibt hier keine Wache mehr, die zusieht, kein Urteil von außen. Nur der Stein, der weiter leise glänzt.\n\nDie Truhen sind schwer, der Rückweg eng und rutschig. Zu zweit wird je eine Kiste getragen — beide würfeln Körper; ein Misserfolg wird durch den Erfolg des Partners ausgeglichen, scheitern aber beide, fällt die Kiste ins Wasser und ist verloren.\n\nAls die Gruppe wieder ins Tageslicht hinaustritt, wartet das Boot bei ablaufendem Wasser genau da, wo sie es zurückgelassen haben. Die Schatzinsel liegt hinter ihnen — was als Schiffbruch begann, endet mit vollen Truhen und einem Kapitän, der genau bekommen hat, wonach er kam. Was das für ihn bedeutet, wird sich erst noch zeigen.",
        trigger: [
          { id: "ankunft_hoehle", label: "Ankunft bei ablaufendem Wasser, ein Wächter erwartet die Gruppe", info: "Nur bei ablaufendem Wasser und mit dem Boot lässt sich die Höhle überhaupt erreichen — ein enges Zeitfenster. Am Eingang wartet bereits ein Wächter, Langbogen und Standschild, das Gesicht hinter zeremonieller Bemalung kaum zu lesen." },
          { id: "siegel_uebergabe", label: "Harwick übergibt das Siegel wortlos, der Wächter setzt es in den Sockel", info: "Harwick reicht das Siegel wortlos weiter — ein runder Vulkanstein, kühl und schwer in der Hand. Der Wächter führt die Gruppe zu einem eigens ausgehauenen Sockel und setzt es mit beiden Händen ein; ein trockenes, hallendes Klacken, dann Stille." },
          { id: "waechter_laesst_passieren", label: "Wächter tritt zur Seite, lässt die Gruppe unbegleitet passieren", info: "Er tritt zur Seite und lässt die Gruppe passieren, ohne ein weiteres Wort — von hier an sind sie auf sich gestellt." },
          { id: "gaenge_gespraeche", label: "Schmale, glatte Gänge geben Raum für Gespräche mit Harwick/Cormac", info: "Harwick geht auffallend zügig voran, den Blick starr nach vorn. Cormac bleibt dicht bei ihm — bis er, kaum hörbar, sagt: „Egal, was da drin liegt. Nichts davon bringt sie zurück.“ Harwick antwortet nicht." },
          { id: "boden_probe", label: "Optionale Geschick/Körper-Probe auf dem glattgeschliffenen Boden", info: "Der Boden ist vom stetigen Wasser glattgeschliffen — wer nicht aufpasst, rutscht (Probe: Geschick oder Körper, keine Erschwernis; bei Misserfolg nur ein nasser, unwürdiger Sturz)." },
          { id: "kammer_enthuellt", label: "Die Gänge münden in die vom silbernen Stein erhellte Schatzkammer", info: "Die Gänge münden in eine hohe, weite Kammer. Durch ein schmales Loch in der Decke bricht Tageslicht herein und trifft auf einen mannshohen, silbernen Stein, der es in alle Richtungen zurückwirft. Ringsum: Truhen, Kisten, Schätze, so weit das Licht reicht." },
          { id: "fremdes_gut_entdeckt", label: "Wahrnehmung/Wissen: europäisches Gut zwischen den Thahal-Schätzen erkennbar", info: "Wer genauer hinsieht (Probe: Wahrnehmung oder Wissen, keine Erschwernis), erkennt: Zwischen geschnitztem Holz, Muscheln und rohem Gold liegen europäische Münzen, ein Kompass, Ringe fremder Machart — Fracht, keine Opfergabe." },
          { id: "harwick_zielsicher", label: "Harwick bewegt sich auffällig zielsicher durch den Schatzhaufen", info: "Harwick selbst bewegt sich auffällig zielsicher durch den Haufen, als wüsste er genau, wo er zuletzt hingegriffen hat." },
          { id: "mechanismus_entdeckt", label: "Ein Steinblock in einer Holzkonstruktion versperrt einen Teil des Schatzes", info: "Hinter einem schweren Steinblock, eingefasst in eine morsche, aber kunstvolle Holzkonstruktion aus Balken und Seilzügen, verbirgt sich der Großteil der Truhen. Harwick deutet knapp auf einen der Hebel — offenbar kein Geheimnis für ihn, nur eine Frage der Kraft." },
          { id: "koerper_aktiviert", label: "Körper-Probe setzt den Hebel-Mechanismus in Bewegung", info: "Wer sich daran versucht, setzt den Mechanismus in Bewegung — der Stein beginnt sich zu heben, quietschend, staublösend." },
          { id: "komplikation_bricht", label: "Ein Seil reißt/ein Balken splittert — die Konstruktion droht zu versagen", info: "Mitten in der Bewegung reißt ein Seil, oder ein Balken splittert: Die Konstruktion droht, sich selbst zu zerlegen und den Stein unkontrolliert zurückfallen zu lassen. Jetzt zählt schnelles Handeln." },
          { id: "mechanik_reparatur", label: "Mechanik-Probe repariert den Schaden notdürftig", info: "Der Schaden wird notdürftig repariert (Probe: Mechanik)." },
          { id: "koerper_gegenhalten", label: "ODER: Körper-Probe hält die Konstruktion mit bloßer Kraft", info: "Alternativ stemmt sich jemand mit bloßer Kraft dagegen und hält die Konstruktion, bis sie wieder greift (Probe: Körper, alternativer Weg zur Mechanik-Lösung)." },
          { id: "waechter_zweifel", label: "Der Lärm erreicht den Wächter am Sockel — er wird unruhig, abergläubisch", info: "Der Lärm hallt durch die Gänge zurück bis zum Wächter am Sockel. Was zuerst wie beiläufiges Poltern klingt, wird ihm zunehmend unheimlich — ein Zeichen? Eine Strafe der Göttin für das, was hier geschieht?" },
          { id: "waechter_beruhigen", label: "Rhetorik/Menschenkenntnis/Instinkt beruhigt ihn aus der Ferne — Split-Fokus", info: "Wer ihn beruhigen will (sein Zweifel liest sich eher aus seiner Haltung als aus Worten, wortkarg wie er ist), muss das aus der Ferne tun, während andere sich um die Konstruktion kümmern — echter Split-Fokus, niemand kann beides gleichzeitig." },
          { id: "flut_naht", label: "SL-Ermessen: die Flut kommt währenddessen zurück, keine feste Rundenzahl", info: "Die ganze Zeit über kommt das Wasser zurück. Wie viel Zeit bleibt, entscheidet der SL spontan am Tisch, je nachdem wie zäh sich die Gruppe anstellt." },
          { id: "schatz_teilweise_verloren", label: "Bei zu langsamer Lösung bleibt ein Teil des Schatzes zurück — fehlt beim Artefakthandel", info: "Zieht sich alles zu lange hin, bleibt ein Teil des Schatzes zurück, wenn das Wasser steigt — mit Folgen, die sich erst beim Artefakthandel zeigen, wenn das Mitgebrachte für den erhofften Handel nicht ganz reicht." },
          { id: "truhen_tragen", label: "Zu zweit: Körper-Probe je Kiste, ein Misserfolg wird durch den Partner ausgeglichen", info: "Die Truhen sind schwer, der Rückweg eng und rutschig. Zu zweit wird je eine Kiste getragen — beide würfeln Körper; ein Misserfolg wird durch den Erfolg des Partners ausgeglichen, scheitern aber beide, fällt die Kiste ins Wasser und ist verloren." },
          { id: "abfahrt", label: "Rückkehr ans Licht, Boot wartet — die Insel liegt hinter der Gruppe", info: "Als die Gruppe wieder ins Tageslicht hinaustritt, wartet das Boot bei ablaufendem Wasser genau da, wo sie es zurückgelassen haben. Was als Schiffbruch begann, endet mit vollen Truhen." }
        ]
      }
    }
  },

  // Spanischer Hafen (Bibel 7.2, Verzweigung 1): ausgearbeitet nach Hendriks
  // Vorgaben (Dialog, nicht von Claude erfunden) - drei Orte, FLACH direkt
  // auf der Kartenszene (kein Container-Marker fürs "Ganze", genau wie
  // Grimsgate/js/scenes.js: die Szene selbst ist der Hintergrund, Arzt/
  // Kneipe/Markt liegen als eigenständige Haupt-Marker direkt darauf, siehe
  // js/spanischer_hafen_scenes.js). "hafen_anlegestelle" existierte
  // zwischenzeitlich als eigener (unsichtbarer) Marker nur für Francesco-
  // Frage + Straßen-Passage - auf Hendriks Korrektur ersatzlos entfernt,
  // beide Interaktionen hängen jetzt an "hafen_arzt" (ihr eigentliches Ziel).
  // Reihenfolge dort: Francesco fragen -> Straßen-Passage -> Ablehnung/
  // Umschwung beim Arzt.
  "hafen_arzt": {
    personen: "Der Wundarzt (unbenannt) · Ezra Coombe (im Sterben liegend) · Francesco Almeida (falls mitgenommen)",
    kurz: "Vorher: Francesco kann gebeten werden mitzukommen (übersetzt hier), dann trägt die Gruppe Ezra durch die vollen Gassen hierher (Proben unterwegs, kein Fehlschlag-Ende). Der Wundarzt selbst: alt, kauzig, anfänglich deutliche Abneigung gegen Engländer — sieht er den Ernst von Ezras Zustand, lenkt er ein und behandelt mit vollem Einsatz. Ohne Francesco Verständigungsprobleme. Die Rettung selbst ist medizinisch sicher.",
    interaktionen: {
      "francesco_mitnehmen": {
        title: "Francesco vorher fragen",
        kurz: "Bevor die Gruppe mit Ezra von Bord geht, kann sie Francesco Almeida bitten mitzukommen — er übersetzt später beim Arzt. Fragt niemand, sitzt er stattdessen in der Kneipe.",
        details: "Noch während an Deck alles für den Landgang mit Ezra vorbereitet wird, ist auch Francesco im Aufbruch begriffen. Ein Spieler kann ihn direkt bitten mitzukommen. Er sagt ohne Zögern zu, wenn gefragt wird, und begleitet die Gruppe die ganze Station über.\n\nFragt ihn niemand, verschwindet er auf eigene Faust in die Stadt — die Gruppe trifft ihn später in der Kneipe wieder (siehe dort), nur eben nicht als verfügbaren Dolmetscher beim Arzt.",
        trigger: [
          { id: "gefragt", label: "Francesco wird gebeten mitzukommen", info: "Ein Spieler bittet Francesco direkt, mit an Land zu kommen, bevor die Gruppe mit Ezra losläuft." },
          { id: "zugesagt", label: "Francesco sagt zu, begleitet die Gruppe", info: "Er sagt ohne Zögern zu und begleitet die Gruppe die ganze Station über — übersetzt später beim Arzt." },
          { id: "nicht_gefragt", label: "Niemand fragt Francesco → er geht eigene Wege", info: "Fragt ihn niemand, verschwindet er auf eigene Faust in die Stadt. Die Gruppe trifft ihn später in der Kneipe wieder, aber nicht als Dolmetscher beim Arzt." }
        ]
      },
      "weg_durch_die_strassen": {
        title: "Der Weg durch die Straßen",
        kurz: "Die Gruppe trägt Ezra auf den Schultern durch die vollen Gassen zum Arzt. Körper-/Geschick-Proben, um ihn nicht fallen zu lassen; Wahrnehmung/Instinkt warnt vor Hindernissen. Kein Fehlschlag-Ende — sie kommen so oder so an.",
        details: "Vier tragen, so gut es eben geht — Ezra auf improvisierter Trage aus Segeltuch und Rudern, mitten durch enge, überfüllte Gassen. Passanten weichen nur widerwillig aus, Karren und Stände versperren immer wieder den direkten Weg.\n\nKörper- und Geschick-Proben der Tragenden halten Ezra ruhig und sicher oben, ohne ihn bei einem Stoß oder Ausweichmanöver fallen zu lassen. Wer gute Wahrnehmung oder Instinkt mitbringt, erkennt Hindernisse (ein Karren, eine enge Ecke, eine Menschentraube) rechtzeitig genug, um die Gruppe vorbei zu lotsen.\n\nMisslingt eine Probe, ist das keine Katastrophe — kurzes Stolpern, ein schmerzerfüllter Aufschrei von Ezra, ein paar Sekunden Verzögerung, vielleicht ein böser Blick von einem Passanten, dem sie zu nah gekommen sind. Die Gruppe kommt in jedem Fall an der Arztpraxis an — hier entscheidet sich nur, wie glatt oder holprig der Weg dorthin war.",
        trigger: [
          { id: "aufbruch", label: "Die Gruppe bricht mit Ezra auf den Schultern auf", info: "Vier tragen, so gut es eben geht — Ezra auf improvisierter Trage aus Segeltuch und Rudern, mitten durch enge, überfüllte Gassen.", grantsQuest: {
            warum: "Ohne Amputation und entgiftende Arznei übersteht Ezra die Fahrt nicht (siehe Golden Lion 5.1) — jetzt, im Hafen angekommen, zählt jede Minute.",
            was: "Ezra sicher und rechtzeitig zum Arzt bringen."
          } },
          { id: "koerper_geschick_proben", label: "Körper-/Geschick-Proben durch die vollen Gassen", info: "Halten Ezra ruhig und sicher oben, ohne ihn bei einem Stoß oder Ausweichmanöver fallen zu lassen." },
          { id: "warnung_hindernis", label: "Wahrnehmung/Instinkt warnt rechtzeitig vor Hindernissen", info: "Wer gute Wahrnehmung oder Instinkt mitbringt, erkennt Hindernisse (Karren, enge Ecke, Menschentraube) rechtzeitig genug, um die Gruppe vorbei zu lotsen." },
          { id: "komplikation", label: "Bei Misserfolg: kurze Komplikation, kein Abbruch", info: "Kurzes Stolpern, ein schmerzerfüllter Aufschrei von Ezra, ein paar Sekunden Verzögerung — keine Katastrophe, die Gruppe kommt so oder so an." },
          { id: "ankunft_arzt", label: "Ankunft an der Arztpraxis", info: "Die Gruppe erreicht die Arztpraxis — wie glatt oder holprig der Weg war, entscheidet sich hier, nicht ob sie ankommen." }
        ]
      },
      "ablehnung_und_umschwung": {
        title: "Der Wundarzt — erste Ablehnung, dann voller Einsatz",
        kurz: "Reserviert-schroffer Empfang wegen der Engländer-Abneigung des Arztes, Verständigung ohne Francesco nur mühsam. Sobald er Ezras Wunde sieht, kippt seine Haltung vollständig.",
        details: "Ein alter Mann öffnet, fleckige Schürze, misstrauischer Blick. Sein Ton wird sofort kühl, kaum dass er die englische Sprache oder Kleidung erkennt — ein paar scharfe, abweisende Worte, fast so, als wolle er die Tür wieder schließen.\n\nOhne Francesco ist die Verständigung mühsam — Pantomime, einzelne Brocken, viel Zeigen auf Ezras Bein. Mit Francesco geht es deutlich schneller: er übersetzt, findet die richtigen Worte, um die Dringlichkeit klarzumachen.\n\nWas den Arzt tatsächlich umstimmt, ist nicht das Argument, sondern der Anblick selbst: Sobald er den Verband löst und die Wunde sieht, verschwindet die Abweisung sofort. Sein Gesicht wird ernst, professionell — er scheucht alle beiseite, die ihm im Weg stehen, und macht sich mit vollem Elan an die Arbeit.\n\nDie Behandlung gelingt — Ezra überlebt. Was an dieser Stelle offen bleibt, ist nicht seine Rettung, sondern ob die Gruppe ihn hinterher auch abholt (siehe ORTE.hafen_kneipe).",
        trigger: [
          { id: "empfang_ablehnend", label: "Empfang reserviert/ablehnend (Engländer-Abneigung)", info: "Ein alter Mann öffnet, misstrauischer Blick, sein Ton wird sofort kühl, kaum dass er Sprache oder Kleidung erkennt — fast, als wolle er die Tür wieder schließen." },
          { id: "sprachbarriere", label: "Ohne Francesco: Verständigung nur mühsam", info: "Pantomime, einzelne Brocken, viel Zeigen auf Ezras Bein." },
          { id: "mit_francesco", label: "Mit Francesco: reibungslose Übersetzung", info: "Er übersetzt, findet die richtigen Worte, um die Dringlichkeit klarzumachen — deutlich schneller als ohne ihn." },
          { id: "umschwung", label: "Anblick der Wunde lässt die Abweisung sofort verschwinden", info: "Sobald er den Verband löst und die Wunde sieht, wird sein Gesicht ernst, professionell — er scheucht alle beiseite und macht sich mit vollem Elan an die Arbeit." },
          { id: "rettung_gesichert", label: "Behandlung gelingt — Ezra überlebt", info: "Was offen bleibt, ist nicht seine Rettung, sondern ob die Gruppe ihn hinterher auch abholt." }
        ]
      }
    }
  },

  "hafen_kneipe": {
    personen: "Francesco Almeida (falls nicht vorher mitgenommen) · Mehrere spanische Soldaten",
    kurz: "Falls nicht schon mitgenommen, sitzt Francesco hier. Eine Gruppe spanischer Soldaten provoziert Spieler und Crew spürbar — bewusst stark genug für eine mögliche Eskalation. Eskaliert es wirklich, erscheint der Offizier mit Garde: Flucht ohne Ezra, der beim Arzt zurückbleibt.",
    interaktionen: {
      "francesco_in_der_kneipe": {
        title: "Francesco in der Kneipe",
        kurz: "Falls niemand ihn vorher gefragt hat, sitzt Francesco bereits hier — kann sich noch anschließen, kommt aber zu spät für die Übersetzung beim Arzt.",
        details: "Wurde Francesco nicht vorher gefragt (siehe ORTE.hafen_arzt, Interaktion \"francesco_mitnehmen\"), findet die Gruppe ihn hier wieder — an einem ruhigeren Tisch, gut gelaunt, mitten im Gespräch mit Einheimischen. Er schließt sich gern an, wenn die Gruppe ihn jetzt noch braucht, aber die Übersetzung beim Arzt ist zu diesem Zeitpunkt bereits gelaufen (siehe ORTE.hafen_arzt).",
        trigger: [
          { id: "francesco_gefunden", label: "Francesco in der Kneipe gefunden (falls vorher nicht gefragt)", info: "Er sitzt an einem ruhigeren Tisch, gut gelaunt, mitten im Gespräch mit Einheimischen." }
        ]
      },
      "provokation_soldaten": {
        title: "Die Soldaten am Tisch",
        kurz: "Eine Gruppe spanischer Soldaten provoziert Spieler und Crew spürbar — anrempeln, auslachen, bedrängen. Deeskaliert die Gruppe, läuft alles normal weiter. Eskaliert es wirklich, erscheint der Offizier mit Garde, Flucht ohne Ezra.",
        details: "An einem der vorderen Tische sitzt eine Gruppe Soldaten, bereits einige Krüge tief. Sie haben die Fremden längst bemerkt — erst abschätzende Blicke, dann offene Kommentare, dann handfestes Anrempeln, wenn jemand an ihrem Tisch vorbeimuss. Auch Crewmitglieder, die zufällig hier sind, bleiben nicht verschont.\n\nDie Provokation ist bewusst deutlich genug angelegt, dass eine Eskalation eine nachvollziehbare Reaktion wäre, kein Zufall — dieser Moment liefert später den Grund für die persönliche Feindschaft des wiederkehrenden spanischen Offiziers (Bibel 8.1).\n\nHalten die Spieler stand oder deeskalieren sie glaubwürdig (Rhetorik, Menschenkenntnis, einfach Ignorieren und Gehen), bleibt es bei der Provokation — die Gruppe holt Ezra normal beim Arzt ab, kehrt vollständig zum Schiff zurück.\n\nKippt die Situation dagegen wirklich — Fäuste fliegen, ein Soldat wird niedergeschlagen oder Ähnliches —, dauert es nicht lange, bis der Offizier mit seiner Garde erscheint. Der Gruppe bleibt nur die fluchtartige Flucht zurück zum Schiff. Für Ezra, der noch beim Arzt liegt, bleibt keine Zeit mehr — er wird nicht abgeholt und bleibt zurück. Erst nachdem das Schiff schon abgelegt hat, fällt jemandem auf, dass er fehlt.",
        trigger: [
          { id: "anrempeln", label: "Soldaten rempeln an, lästern über die Fremden", info: "Erst abschätzende Blicke, dann offene Kommentare, dann handfestes Anrempeln — auch anwesende Crewmitglieder bleiben nicht verschont." },
          { id: "eskalationsdruck", label: "Provokation steigert sich spürbar", info: "Bewusst deutlich genug angelegt, dass eine Eskalation eine nachvollziehbare Reaktion wäre, kein Zufall." },
          { id: "deeskaliert", label: "Deeskaliert/standgehalten → Ezra wird normal abgeholt", info: "Rhetorik, Menschenkenntnis, oder einfach Ignorieren und Gehen — die Gruppe holt Ezra normal beim Arzt ab, kehrt vollständig zurück." },
          { id: "eskaliert", label: "Eskaliert wirklich → Offizier erscheint mit Garde", info: "Fäuste fliegen, ein Soldat wird niedergeschlagen oder Ähnliches — der Offizier erscheint mit seiner Garde." },
          { id: "flucht_ohne_ezra", label: "Fluchtartiger Rückzug ohne Ezra", info: "Der Gruppe bleibt nur die Flucht zurück zum Schiff. Für Ezra, der noch beim Arzt liegt, bleibt keine Zeit mehr — er wird nicht abgeholt." },
          { id: "vermisst_bemerkt", label: "Erst nach dem Ablegen fällt auf, dass Ezra fehlt", info: "Erst nachdem das Schiff schon abgelegt hat, fällt jemandem auf, dass er fehlt." }
        ]
      }
    }
  },

  "hafen_markt": {
    personen: "Mehrere spanische Wachen (patrouillierend)",
    kurz: "Bewusst kurz gehalten: wiederholte kleine Reibung — Anrempeln, Auslachen, misstrauische Blicke, auch von offiziellen Wachen. Kein Eskalationsrisiko wie in der Kneipe.",
    interaktionen: {
      "kleine_reibung": {
        title: "Kleine Reibungen auf dem Markt",
        kurz: "Wiederholte kleine Unfreundlichkeiten beim Durchqueren des Markts, ausdrücklich von den patrouillierenden Wachen — Anrempeln, Auslachen, misstrauisches Beäugen. Kein Wurf nötig, keine Eskalation.",
        details: "Der Markt ist eng, laut, dicht gedrängt — und die Fremden fallen auf. Patrouillierende Wachen rempeln beim Vorbeigehen an, ohne sich umzudrehen. Von einer anderen Stelle folgt ihnen Gelächter und ein spöttischer Kommentar. Wieder woanders hält eine Wache mitten in der Bewegung inne und mustert sie einen Moment zu lang, bevor sie weitergeht.\n\nBewusst kurz gehalten — die Gruppe soll hier nicht lange verweilen. Keine Proben, keine Eskalation, kein Ruf-Effekt — reine wiederholte kleine Reibung, die den Spanien-Konflikt spürbar macht, ohne selbst zum großen Moment zu werden (der liegt in der Kneipe, siehe ORTE.hafen_kneipe).",
        trigger: [
          { id: "angerempelt", label: "Eine Wache rempelt im Vorbeigehen an", info: "Rempelt beim Vorbeigehen an, ohne sich umzudrehen." },
          { id: "ausgelacht", label: "Gelächter und ein spöttischer Kommentar", info: "Von einer anderen Stelle folgt ihnen Gelächter und ein spöttischer Kommentar." },
          { id: "beaeugt", label: "Eine Wache mustert sie misstrauisch", info: "Hält mitten in der Bewegung inne und mustert sie einen Moment zu lang, bevor sie weitergeht." }
        ]
      }
    }
  },

  // Schmugglernest (Bibel 7.2, Verzweigung 1): ausgearbeitet nach Hendriks
  // Vorgaben (Dialog, nicht von Claude erfunden) - drei Orte. Fischerdorf und
  // Höhlenstadt sind beide eigene Haupt-Marker, der Artefakthändler hängt als
  // Sub-Ort an der Höhlenstadt (parentId in js/schmugglernest_scenes.js).
  // Reihenfolge: Fischerdorf (Beobachtung + Kohle-Zugang) -> Höhlenstadt
  // (Artefakt-Kenner suchen, Diebstahl, Verfolgungsjagd) -> Artefakthändler
  // (Belohnung/Konsequenz). Der Eisschrank-Zugang bekommt bewusst KEINEN
  // eigenen Marker (Hendriks Korrektur) - läuft als zweite Interaktion am
  // Fischerdorf-Marker, analog zum "Weg durch die Straßen" in 7.1.
  "schmuggler_lager": {
    personen: "Drei auffällige Dorfbewohner (unbenannt): die Frau am Ufer, der Bäcker, der alte Mann",
    kurz: "Von außen ein unauffälliges Fischerdorf — wer genau hinsieht, bemerkt Wohlstands-Details, die nicht zu einfachen Fischern passen. Alle sind freundlich, aber einsilbig. Der Zugang zur Höhlenstadt liegt in einem alten Eisschrank, der nur auf ein Stück Kohle reagiert.",
    interaktionen: {
      "das_dorf": {
        title: "Das Dorf genauer betrachten",
        kurz: "Wahrnehmung deckt auffällige Wohlstands-Details an den drei Dorfbewohnern auf; direkte Fragen laufen ins Leere. Ungewiss, ob der Hinweis überhaupt stimmt.",
        details: "Von der See aus wirkt es wie jedes andere kleine Fischerdorf. Erst wer auf der Suche nach dem gehörten Hinweis wirklich genau hinsieht, bemerkt: die Halskette der Frau am Ufer ist zu prunkvoll für ihre Arbeit, die Brille des Bäckers zu wertvoll gefasst, der Gehstock-Knauf des alten Mannes schimmert wie seltenes Metall. Kleine Details, die nicht zusammenpassen — aber nichts Beweisendes.\n\nWer die Dorfbewohner direkt anspricht, bekommt freundliche, aber einsilbige Antworten. Niemand ist unhöflich, niemand hilft weiter. Fragen nach Fremden, nach Handel, nach irgendetwas Ungewöhnlichem verlaufen im Sand.\n\nIn unregelmäßigen Abständen ist ein dumpfes Donnern zu hören, der Boden bebt kurz — niemand im Dorf reagiert darauf, als wäre es völlig normal.\n\nEs bleibt bewusst ungewiss, ob der Hinweis aus Harwicks Kajüte überhaupt stimmt, oder ob der Spieler, der ihn weitergegeben hat, sich geirrt oder etwas erfunden hat — erst der gefundene Zugang (siehe Interaktion \"Der Eisschrank\") gibt Gewissheit.",
        trigger: [
          { id: "wohlstand_bemerkt", label: "Wahrnehmung: auffällige Wohlstands-Details an den drei Dorfbewohnern", info: "Die Halskette der Frau am Ufer ist zu prunkvoll, die Brille des Bäckers zu wertvoll gefasst, der Gehstock-Knauf des alten Mannes schimmert wie seltenes Metall." },
          { id: "einsilbig", label: "Direkte Fragen laufen ins Leere", info: "Freundliche, aber einsilbige Antworten — niemand hilft weiter, Fragen nach Fremden oder Handel verlaufen im Sand." },
          { id: "donnern_bemerkt", label: "Das periodische Donnern/Beben fällt auf", info: "Niemand im Dorf reagiert darauf, als wäre es völlig normal." },
          { id: "ungewissheit", label: "Ungewiss, ob der Hinweis überhaupt stimmt", info: "Erst der gefundene Zugang gibt Gewissheit, ob der Tipp aus Harwicks Kajüte echt war." }
        ]
      },
      "der_eisschrank": {
        title: "Der Eisschrank — Zugang zur Höhlenstadt",
        kurz: "Nähern sich Spieler, öffnet sich eine kleine Luke — sonst passiert nichts. Erst ein hineingelegtes Stück Kohle öffnet die eigentliche Tür zu einer Treppe, die zu einer massiven Stahltür führt. Vor dem Einlass: vollständige Durchsuchung, Waffen müssen abgegeben werden.",
        details: "Der Eisschrank wirkt beim genauen Hinsehen zu massiv, zu stabil beschlagen für seinen vorgeblichen Zweck. Nähert sich die Gruppe, öffnet sich lautlos eine kleine Luke seitlich am Container — dahinter nur Dunkelheit, kein Wort, keine weitere Reaktion. Bleibt es dabei, geschieht nichts weiter.\n\nErst wer sich an den Hinweis aus Harwicks Kajüte erinnert („fütter das Eis mit Feuer\") und ein Stück Kohle durch die Luke reicht, bekommt eine Reaktion: irgendwo im Innern rastet etwas ein, eine verborgene Tür in der Rückwand des Containers schwingt auf. Dahinter führt eine schmale Treppe ins Erdreich, bis sie vor einer massiven Stahltür endet.\n\nAn der Stahltür werden alle vollständig durchsucht — Waffen müssen abgegeben werden, niemand kommt bewaffnet weiter. Erst danach öffnet sich der Weg in die Höhlenstadt (siehe ORTE.schmuggler_hoehlenstadt).",
        trigger: [
          { id: "luke_oeffnet", label: "Luke öffnet sich beim Nähern — sonst passiert nichts", info: "Eine kleine Luke öffnet sich lautlos, dahinter nur Dunkelheit. Ohne die Kohle bleibt es dabei." },
          { id: "kohle_eingelegt", label: "Ein Stück Kohle wird durch die Luke gereicht", info: "Etwas rastet im Innern ein, eine verborgene Tür in der Rückwand schwingt auf." },
          { id: "treppe_stahltuer", label: "Schmale Treppe führt zu einer massiven Stahltür", info: "Die Treppe endet vor einer massiven Stahltür." },
          { id: "durchsuchung", label: "Vollständige Durchsuchung, Waffen müssen abgegeben werden", info: "Niemand kommt bewaffnet weiter — erst danach öffnet sich der Weg in die Höhlenstadt." }
        ]
      }
    }
  },

  "schmuggler_hoehlenstadt": {
    personen: "Ein Straßenkind (Dieb, unbenannt)",
    kurz: "Die eigentliche Aufgabe: jemanden finden, der sich mit Artefakten auskennt. Beim Zeigen von Harwicks Unterlagen stiehlt ein Straßenkind die Karte — Verfolgungsjagd, kaum zu gewinnen (SL-Ermessen lässt den Fang oft zu).",
    interaktionen: {
      "artefaktkenner_gesucht": {
        title: "Auf der Suche nach einem Artefakt-Kenner",
        kurz: "Die Gruppe fragt sich mit Harwicks Unterlagen durch den Markt durch, auf der Suche nach jemandem, der sich mit Artefakten auskennt.",
        details: "Der Markt der Höhlenstadt bietet buchstäblich alles — und mit ein wenig Nachfragen auch Zugang zu Leuten, die sich mit den ungewöhnlicheren Dingen auskennen. Zeigt die Gruppe Harwicks Unterlagen herum und fragt gezielt nach jemandem, der sich mit Artefakten auskennt, wird sie schnell fündig — zumindest fast.",
        trigger: [
          { id: "nachgefragt", label: "Die Gruppe fragt mit Harwicks Unterlagen nach einem Artefakt-Kenner", info: "Zeigt die Unterlagen herum, fragt gezielt nach jemandem, der sich mit Artefakten auskennt." }
        ]
      },
      "der_diebstahl": {
        title: "Das Straßenkind — Diebstahl und Verfolgungsjagd",
        kurz: "Ein Straßenkind schnappt sich die Unterlagen und rennt los. Verfolgungsjagd durch die fremde Stadt, kaum zu gewinnen — nur ein sehr geschickter Spieler hat eine echte Chance (SL-Ermessen lässt den Fang oft trotzdem zu).",
        details: "Mitten im Gedränge ist es ein Straßenkind, das zuschlägt — eines von unzähligen hier, die täglich um die nächste Mahlzeit kämpfen. Ein schneller Griff, und Harwicks Unterlagen sind weg, verschwunden zwischen den Ständen.\n\nEs folgt eine Verfolgungsjagd durch enge Gassen, über Stege und Warenstapel einer Stadt, die das Kind in- und auswendig kennt, die Gruppe aber zum ersten Mal sieht. Die Jagd ist bewusst kaum zu gewinnen — nur ein Spieler mit außergewöhnlichem Geschick hat eine echte Chance, tatsächlich aufzuschließen.\n\nSL-Hinweis: Auch wenn die Jagd mechanisch fast unmöglich angelegt ist, spricht viel dafür, den Fang in der tatsächlichen Runde oft zuzulassen — der eigentliche Wert der Szene liegt im Nervenkitzel der Verfolgung, nicht in einer harten Fehlschlagsquote.\n\nGefangen oder nicht, es geht danach an derselben Stelle weiter: dem Artefakthändler (siehe ORTE.schmuggler_artefakthaendler).",
        trigger: [
          { id: "diebstahl", label: "Das Kind schnappt sich die Unterlagen und rennt los", info: "Ein schneller Griff mitten im Gedränge, die Unterlagen sind weg." },
          { id: "verfolgungsjagd", label: "Verfolgungsjagd durch die fremde Stadt, kaum zu gewinnen", info: "Nur ein Spieler mit außergewöhnlichem Geschick hat eine echte Chance. SL-Hinweis: den Fang in der Praxis oft zulassen — der Nervenkitzel trägt die Szene, nicht die Fehlschlagsquote." },
          { id: "gefangen", label: "Kind gefangen — untersucht die Unterlagen, kann etwas dazu sagen", info: "Aus Angst, dass ihm etwas passiert, lässt sich das Kind die Unterlagen genauer ansehen — und kann tatsächlich etwas dazu sagen." },
          { id: "nicht_gefangen", label: "Nicht gefangen — Kind entkommt direkt zu den älteren Männern", info: "Das Kind rennt geradewegs zu den 3-4 älteren Männern, die es später ohnehin auf die Gruppe hetzen würde — siehe ORTE.schmuggler_artefakthaendler." }
        ]
      }
    }
  },

  "schmuggler_artefakthaendler": {
    personen: "Der Artefakthändler (unbenannt) · Ein Straßenkind (Dieb, unbenannt) · 3-4 ältere Männer (unbenannt)",
    kurz: "Der Händler ordnet das Artefakt einer fremden Zivilisation zu, nennt Koordinaten zur Schamaneninsel, warnt vor der Geisterwelt und gibt der Gruppe einen einzelnen Schutz-Anhänger mit (Verwendung im Finale, siehe Bibel 12.1). Vorher: Gefangen und beruhigt, führt das Straßenkind die Gruppe hierher und verlangt eine Belohnung — verweigert, hetzt es später 3-4 ältere Männer auf sie.",
    interaktionen: {
      "der_artefaktkenner": {
        title: "Der Artefakthändler — Herkunft, Warnung, der Anhänger",
        kurz: "Der Händler ordnet das Artefakt anhand von Harwicks Unterlagen einer fremden Zivilisation zu, nennt Koordinaten zu einer Schamaneninsel und warnt eindringlich: solche Artefakte berühren die Geisterwelt. Er gibt der Gruppe einen einzigen Schutz-Anhänger mit.",
        details: "Der Händler studiert Harwicks Unterlagen lange, bevor er überhaupt etwas sagt. Was er darin erkennt, ordnet er einer fremden, den Spielern bislang unbekannten Zivilisation zu — mehr über deren Herkunft verrät er nicht, verweist aber auf eine Schamaneninsel und nennt Koordinaten dorthin.\n\nSeine Warnung ist unmissverständlich: Artefakte dieser Art berühren die Geisterwelt. Wer sich darauf einlässt, muss sich wappnen.\n\nAls einziges konkretes Hilfsmittel gibt er der Gruppe einen Anhänger mit — nur ein Exemplar, kein zweites vorhanden. Er soll Schutz vor genau dieser Art von Magie bieten.\n\nSpätere Verwendung (außerhalb dieser Szene, im Finale — siehe KAMPAGNEN-BIBEL.md 12.1): Der Anhänger schützt seinen Träger tatsächlich vor Schaden. Er kann stattdessen aber auch der Tochter übergeben werden — dann gelingt das Ritual, wenn auch nur kurz: lange genug, dass sie ihrem Vater sagt, dass ihn keine Schuld trifft, dass sie durch seine Trauer im Zwischen gefangen ist, und dass er sie loslassen muss, damit sie ihre Ruhe findet.",
        trigger: [
          { id: "artefakt_zugeordnet", label: "Der Händler ordnet das Artefakt einer fremden Zivilisation zu", info: "Studiert Harwicks Unterlagen lange, bevor er überhaupt etwas sagt — erkennt die Herkunft, verrät aber nicht mehr darüber." },
          { id: "koordinaten_schamaneninsel", label: "Koordinaten zu einer Schamaneninsel", info: "Verweist auf eine Schamaneninsel und nennt Koordinaten dorthin.", grantsQuest: {
            warum: "Harwicks Ritual ist unvollständig, und der Weg über das Schmugglernest liefert als einziger konkrete Ritual-Informationen (Bibel 7.4).",
            was: "Kurs auf die Schamaneninsel nehmen."
          } },
          { id: "warnung_geisterwelt", label: "Eindringliche Warnung: Artefakte dieser Art berühren die Geisterwelt", info: "Wer sich darauf einlässt, muss sich wappnen." },
          { id: "anhaenger_erhalten", label: "Die Gruppe erhält einen einzigen Schutz-Anhänger", info: "Nur ein Exemplar, kein zweites vorhanden. Soll Schutz vor dieser Art Magie bieten — spätere Verwendung im Finale, siehe Bibel 12.1." }
        ]
      },
      "die_belohnung": {
        title: "Die Belohnung des Straßenkinds",
        kurz: "Gefangen und beruhigt, führt das Kind die Gruppe zum Laden des Artefakthändlers — und streckt dann die Hand aus. Wird es belohnt, zieht es zufrieden ab. Wird es nicht belohnt, greifen später 3-4 ältere Männer die Gruppe an, vom Kind aufgehetzt.",
        details: "Hat die Gruppe das Kind gefangen und sich die Unterlagen angesehen, führt es sie — erleichtert, dass ihm nichts passiert ist — genau hierher, zu einem kleinen Laden, an dem tatsächlich jemand sitzt, der sich mit Artefakten auskennt.\n\nAls Dank für die Hilfe streckt das Kind danach die Hand aus, unmissverständlich, eine Belohnung erwartend.\n\nWird es belohnt, verschwindet es zufrieden in der Menge. Wird es abgewiesen oder vergessen, greifen auf dem Rückweg unvermittelt 3-4 ältere Männer die Gruppe an — offensichtlich vom Kind gegen sie aufgehetzt.",
        trigger: [
          { id: "laden_gefunden", label: "Kind führt die Gruppe zum Laden des Artefakthändlers", info: "Erleichtert, dass ihm nichts passiert ist, führt es sie genau hierher." },
          { id: "belohnung_gefordert", label: "Kind streckt die Hand aus, erwartet eine Belohnung", info: "Als Dank für die Hilfe, unmissverständlich." },
          { id: "belohnt", label: "Belohnt — Kind zieht zufrieden ab", info: "Verschwindet zufrieden in der Menge." },
          { id: "nicht_belohnt", label: "Nicht belohnt — Überfall durch 3-4 ältere Männer auf dem Rückweg", info: "Auf dem Rückweg greifen unvermittelt 3-4 ältere Männer an — offensichtlich vom Kind gegen sie aufgehetzt." }
        ]
      }
    }
  },

  // Artefakthandel (Bibel 7.3, fest): Ankunfts-Beat UND Kernszene (der
  // Verrat) nach Hendriks Vorgabe ausformuliert (Dialog, nicht von Claude
  // erfunden) - die Enthüllung, die Bibel 7.3/12.1 seit langem ankündigt
  // ("Das Massaker zeigt Harwick als gefährlich"). Tom ist bewusst NICHT
  // Teil dieser Szene (Hendrik: "passt nicht in so eine gewaltvolle
  // Szene"). Die Kinder-Rettung (Interaktion "kinder_retten") hat einen
  // echten Fehlschlag-Ausgang mit dauerhafter Konsequenz für Harwicks
  // weiteren Handlungsbogen (Bibel 12) - SL-Ermessen, siehe dort.
  "handelstreffen": {
    personen: "James Harwick · Cormac Daly · Walter „Wat“ Crozier",
    kurz: "Windstille, Nebel zieht auf, spürbare Anspannung. Fast lautlos erscheint ein fremdartiges Schiff aus dem Nebel und hält direkt auf die Golden Lion zu. Harwick, Cormac und Wat werden in der fremden Kajüte gefangen genommen — die Gruppe muss sich freikämpfen, entdeckt dabei versklavte Kinder an Bord, und erlebt Harwicks Absturz in manischen Blutrausch wegen seiner toten Tochter.",
    interaktionen: {
      "das_fremde_schiff": {
        title: "Das fremde Schiff erscheint",
        kurz: "Fast lautlos kommt ein fremdartiges Schiff aus dem Nebel — ungewöhnliche Form und Segel, Crew in merkwürdigen Rüstungen an Bord. Es hält direkt auf die Golden Lion zu.",
        details: "Die Golden Lion liegt bei Windstille reglos auf dem Wasser. Harwick steht am Bug, den Blick unverwandt aufs offene Meer gerichtet — er wartet auf etwas. Nebel zieht auf, verschluckt langsam den Horizont. Noch ist kein Schiff zu sehen, aber die Anspannung an Bord ist förmlich zu greifen.\n\nDann, fast lautlos, löst sich eine Silhouette aus dem Nebel: ein fremdartiges Schiff, ungewöhnliche Formen, fremde Segel — nichts, was der Crew der Golden Lion vertraut vorkommt. An Bord sind Männer in merkwürdigen Rüstungen zu erkennen. Das Schiff hält direkt auf die Golden Lion zu.",
        trigger: [
          { id: "windstille_anspannung", label: "Windstille, Harwick blickt aufs offene Wasser, spürbare Anspannung", info: "Die Golden Lion liegt bei Windstille reglos auf dem Wasser. Harwick steht am Bug, den Blick unverwandt aufs offene Meer gerichtet — er wartet auf etwas." },
          { id: "nebel_zieht_auf", label: "Nebel zieht auf, noch kein Schiff in Sicht", info: "Nebel zieht auf, verschluckt langsam den Horizont. Noch ist kein Schiff zu sehen, aber die Anspannung an Bord ist förmlich zu greifen." },
          { id: "schiff_erscheint", label: "Fast lautlos löst sich ein fremdes Schiff aus dem Nebel", info: "Eine Silhouette löst sich fast lautlos aus dem Nebel." },
          { id: "fremde_form", label: "Ungewöhnliche Formen und Segel, unbekannte Bauart", info: "Nichts, was der Crew der Golden Lion vertraut vorkommt." },
          { id: "ruestungen_gesichtet", label: "Männer in merkwürdigen Rüstungen an Bord erkennbar", info: "An Bord sind Männer in merkwürdigen Rüstungen zu erkennen." },
          { id: "kurs_golden_lion", label: "Das fremde Schiff hält direkt auf die Golden Lion zu", info: "Das Schiff hält direkt auf die Golden Lion zu." }
        ]
      },
      "verrat_gefangen": {
        title: "Verrat — Harwick, Cormac und Wat gefangen",
        kurz: "Kampflärm vom fremden Schiff verrät: Harwick, Cormac und Wat werden in der fremden Kajüte festgehalten — angeblich hat der Handel nicht genug gebracht, um die Kosten zu decken. Die Gruppe muss sich den Weg dorthin freikämpfen.",
        details: "Die Minuten der Vorbereitung ziehen sich, dann reißt plötzlich Lärm die Stille auf — dumpfe Schläge, gedämpfte Stimmen, ein Schuss. Vom fremden Schiff herüber wird schnell klar: Etwas ist furchtbar schiefgelaufen. Harwick, Cormac und Wat sind in der Kajüte des anderen Kapitäns gefangen — der Vorwand: Der Handel habe angeblich nicht genug gebracht, um die Kosten zu decken.\n\nEs gibt keine Zeit für Verhandlungen. Wer noch an Bord der Golden Lion oder in der Nähe ist, muss sich jetzt entscheiden, an Bord des fremden Schiffs zu gehen und sich den Weg zur Kajüte freizukämpfen.",
        trigger: [
          { id: "laerm_verraet_verrat", label: "Kampflärm vom fremden Schiff verrät, dass etwas schiefgelaufen ist", info: "Dumpfe Schläge, gedämpfte Stimmen, ein Schuss reißen die Stille auf." },
          { id: "gefangene_bekannt", label: "Harwick, Cormac und Wat werden in der fremden Kajüte festgehalten", info: "Der Vorwand: Der Handel habe angeblich nicht genug gebracht, um die Kosten zu decken." },
          { id: "entscheidung_eingreifen", label: "Die Gruppe entscheidet, an Bord zu gehen und sich freizukämpfen", info: "Keine Zeit für Verhandlungen — wer noch in der Nähe ist, muss jetzt handeln." }
        ]
      },
      "erster_kampf": {
        title: "Der erste echte Kampf",
        kurz: "Das erste Mal in der Kampagne geht es wirklich zur Sache — Pistolen werden geladen, es wird ernsthaft gekämpft, um sich den Weg durchs Schiff zur Kajüte freizukämpfen.",
        details: "Was bisher an Kämpfen vorkam, war Vorgeplänkel dagegen. Hier, zum ersten Mal, geht es wirklich zur Sache: Pistolen werden geladen, Klingen gezogen, es wird ernsthaft und blutig gekämpft, während sich die Gruppe Schritt für Schritt durchs fremde Schiff in Richtung Kajüte vorkämpft.",
        trigger: [
          { id: "erster_ernster_kampf", label: "Der erste wirklich ernste, blutige Kampf der Kampagne", info: "Pistolen werden geladen, Klingen gezogen — ernsthaft und blutig, kein Vorgeplänkel mehr." },
          { id: "weg_freikaempfen", label: "Die Gruppe kämpft sich durchs Schiff Richtung Kajüte", info: "Schritt für Schritt geht es durchs fremde Schiff in Richtung Kajüte." }
        ]
      },
      "kinder_entdeckt": {
        title: "Die Kinder an Bord",
        kurz: "Mitten im Kampf entdecken die Spieler Kinder an Bord — sie sollen als Sklaven verkauft werden.",
        details: "Zwischen Kampflärm, Rauch und umkämpften Gängen stoßen die Spieler auf etwas, das den Kampf für einen Moment stillstehen lässt: Kinder, eingesperrt, verängstigt. Schnell wird klar, wofür sie an Bord sind — sie sollen verkauft werden, als Sklaven.",
        trigger: [
          { id: "kinder_entdeckt", label: "Kinder an Bord entdeckt, sollen als Sklaven verkauft werden", info: "Eingesperrt, verängstigt — sie sollen als Sklaven verkauft werden." }
        ]
      },
      "harwicks_wahn": {
        title: "Harwicks Wahn",
        kurz: "Harwick glaubt zunächst, das Artefakt sei gar nicht an Bord, und will das Schiff niederbrennen. Erfährt er von den Kindern, denkt er an seine für immer verlorene Tochter und gerät außer sich — will alle an Bord töten. Wat gehorcht ohne Murren, Cormac hält nur bei den Kindern inne.",
        details: "In der Kajüte befreit, ist Harwicks erster Gedanke nicht Erleichterung, sondern blanke Wut: Er geht davon aus, dass das Artefakt gar nicht an Bord dieses Schiffs ist — der ganze Handel war eine Falle, nichts weiter. Am liebsten würde er das Schiff auf der Stelle niederbrennen.\n\nDann erreicht ihn die Nachricht von den Kindern. Etwas in ihm kippt. Er denkt an seine eigene Tochter, die er nie wiedersehen wird — und gerät außer sich vor Wut und Verzweiflung. Er will jeden an Bord töten, ausnahmslos.\n\nWat macht sich bereit, diesen Befehl ohne Murren auszuführen. Cormac hat kein Problem damit, sich an den erwachsenen Gegnern zu vergreifen — aber als die Information über die Kinder fällt, hält er inne, sichtlich zerrissen.\n\nHarwick selbst ist davon unbeeindruckt. Wie im Wahn schlachtet er sich durch die Wächter, die sich ihm in den Weg stellen.",
        trigger: [
          { id: "artefakt_bezweifelt", label: "Harwick glaubt zunächst, das Artefakt sei nicht an Bord, will niederbrennen", info: "Er geht davon aus, dass der ganze Handel eine Falle war, nichts weiter — am liebsten würde er das Schiff niederbrennen." },
          { id: "nachricht_von_kindern", label: "Harwick erfährt von den versklavten Kindern", info: "Die Nachricht erreicht ihn, etwas in ihm kippt." },
          { id: "harwicks_wahn", label: "Denkt an seine für immer verlorene Tochter, gerät außer sich, will alle töten", info: "Er denkt an seine eigene Tochter, die er nie wiedersehen wird — und will jeden an Bord töten, ausnahmslos." },
          { id: "wat_gehorcht", label: "Wat ist bereit, den Befehl ohne Murren auszuführen", info: "Macht sich bereit, den Befehl ohne Murren auszuführen." },
          { id: "cormac_haelt_inne", label: "Cormac hat kein Problem mit den Erwachsenen, hält aber bei den Kindern inne", info: "Sichtlich zerrissen, sobald die Information über die Kinder fällt." },
          { id: "harwick_schlachtet_wachen", label: "Harwick kämpft sich wie im Wahn durch die Wächter", info: "Von alldem unbeeindruckt schlachtet er sich durch jeden Wächter, der sich ihm in den Weg stellt." }
        ]
      },
      "kinder_retten": {
        title: "Die Kinder retten",
        kurz: "Drastisches Rollenspiel, starkes Einschreiten notwendig, um die Kinder vor Harwick zu retten. SL-Ermessen: Scheitert das Einschreiten, sterben die Kinder — Harwick bleibt dann dauerhaft manisch, nicht mehr zu retten.",
        details: "Zwischen einem wahnsinnigen Kapitän, der gerade dabei ist, ein ganzes Schiff auszulöschen, und den Kindern, die er mit einschließen will, bleibt den Spielern nur eines: drastisches, entschlossenes Einschreiten. Reden allein wird hier nicht reichen — Harwick ist in diesem Moment nicht mehr ansprechbar wie sonst.\n\nSL-Ermessen entscheidet über den Ausgang, abhängig davon, wie entschlossen und klug die Spieler eingreifen: Gelingt es ihnen, sich zwischen Harwick und die Kinder zu stellen, ihn aufzuhalten oder abzulenken, werden die Kinder gerettet. Greifen sie nicht stark genug oder gar nicht ein, sterben die Kinder mit den übrigen an Bord — und Harwick ist von diesem Moment an nicht mehr zu retten. Er bleibt bis zum Ende der Kampagne manisch.",
        trigger: [
          { id: "starkes_einschreiten_noetig", label: "Nur drastisches, entschlossenes Einschreiten kann die Kinder retten", info: "Reden allein reicht nicht — Harwick ist in diesem Moment nicht mehr ansprechbar wie sonst." },
          { id: "kinder_gerettet", label: "Erfolg (SL-Ermessen) — die Kinder werden gerettet", info: "Gelingt es, sich zwischen Harwick und die Kinder zu stellen, ihn aufzuhalten oder abzulenken, werden die Kinder gerettet." },
          { id: "kinder_sterben_harwick_verloren", label: "Misserfolg (SL-Ermessen) — Kinder sterben, Harwick bleibt dauerhaft manisch", info: "Greifen die Spieler nicht stark genug ein, sterben die Kinder mit den übrigen an Bord — Harwick ist von diesem Moment an nicht mehr zu retten, bleibt bis zum Ende der Kampagne manisch." }
        ]
      },
      "artefakt_und_uebergabe": {
        title: "Das Artefakt und die Übergabe des Schiffs",
        kurz: "Das Artefakt ist tatsächlich an Bord und kann geborgen werden. Wurden die Kinder gerettet, verlangen sie die Übergabe des Schiffs — Harwick und Crew lenken ein. Optional: Spieler setzen sich für einen Schatz-Anteil der Kinder ein (starker Ruf-Gewinn bei Cormac). Fest: alle Erwachsenen an Bord werden getötet.",
        details: "Entgegen Harwicks anfänglicher Überzeugung stellt sich heraus: Das Artefakt ist tatsächlich an Bord und kann geborgen werden.\n\nWurden die Kinder gerettet, verlangen sie selbst die Übergabe des Schiffs — kein Almosen, eine Forderung. Harwick und seine Crew lenken ein und überlassen es ihnen.\n\nSpieler, die sich zusätzlich dafür einsetzen, dass die Kinder auch einen Teil des geborgenen Schatzes bekommen, können damit extrem im Ruf bei Cormac steigen.\n\nEines steht unabhängig vom Verhalten der Spieler fest: Alle Erwachsenen an Bord des fremden Schiffs werden getötet. Darüber lässt Harwick nicht mit sich reden.",
        trigger: [
          { id: "artefakt_gefunden", label: "Das Artefakt ist tatsächlich an Bord, kann geborgen werden", info: "Entgegen Harwicks anfänglicher Überzeugung." },
          { id: "kinder_verlangen_schiff", label: "Gerettete Kinder verlangen die Übergabe des Schiffs", info: "Kein Almosen, eine Forderung." },
          { id: "harwick_lenkt_ein", label: "Harwick und Crew lenken ein, überlassen den Kindern das Schiff", info: "Harwick und seine Crew lenken ein und überlassen es ihnen." },
          { id: "schatz_fuer_kinder", label: "Optional: Spieler setzen sich für einen Schatz-Anteil der Kinder ein → extremer Ruf-Gewinn bei Cormac", info: "Wer sich zusätzlich dafür einsetzt, dass die Kinder auch einen Teil des geborgenen Schatzes bekommen, kann damit extrem im Ruf bei Cormac steigen." },
          { id: "alle_erwachsenen_getoetet", label: "Fest: alle Erwachsenen an Bord werden getötet", info: "Unabhängig vom Verhalten der Spieler — darüber lässt Harwick nicht mit sich reden." }
        ]
      }
    }
  },

  // Riffinsel (Bibel 7.4, Szene "11.1", riffinsel_scenes.js). "riffstrand"
  // ist von Anfang an sichtbar, die vier übrigen Marker starten ausgeblendet
  // (hiddenMarkersLive, siehe "die_erkundung" unten) und werden vom SL live
  // eingeblendet, sobald die passende Probe gelingt - siehe Skill pnp-scene/
  // CLAUDE.md Architektur-Muster.
  "riffstrand": {
    personen: "James Harwick · Cormac Daly",
    kurz: "Ankunft in der geschützten Lagune, kurze Erleichterung, dann Cormacs offene Erkundungsaufgabe (Wasser/Material/Sicherheit). Referenz für die vier Fundstellen in \"Die Erkundung\" — die Zeit dafür ist begrenzt, siehe \"Die Stimmung kippt\" und \"Die Affen greifen an\".",
    interaktionen: {
      "ankunft_und_auftrag": {
        title: "Ankunft — Cormacs Auftrag",
        kurz: "Ankunft in der geschützten Lagune bei Tagesanbruch, kurze Erleichterung, dann Cormacs offene Erkundungsaufgabe: Wasser, Ausbesserungsmaterial, Sicherheit. Kein fester Weg, Gruppen können sich frei aufteilen.",
        details: "Die Golden Lion gleitet durchs Riff in ruhigeres Wasser dahinter und wirft Anker in einer kleinen, geschützten Lagune. Der Himmel im Osten hellt sich auf. Für einen Moment sagt niemand etwas — die Erleichterung ist förmlich zu greifen, aber niemand traut sich, sie laut auszusprechen, solange der Verfolger noch irgendwo dort draußen sein könnte.\n\nCormac ist der Erste, der die Stille bricht. Praktisch wie immer, verteilt er die Aufgaben: Süßwasser wird knapp, die Flucht hat dem Schiff sichtbar zugesetzt, und niemand weiß, ob die Insel wirklich so verlassen ist, wie sie aussieht. Sein Auftrag an die Gruppe ist bewusst offen gehalten: „Sucht die Insel ab. Wasser, brauchbares Material, und haltet die Augen offen. Teilt euch auf, wenn ihr wollt — nur nicht allein.“\n\nWeder Route noch Reihenfolge sind vorgegeben — die Spieler entscheiden selbst, wohin sie zuerst aufbrechen (siehe Interaktion \"Die Erkundung\" für die einzelnen Fundstellen).",
        trigger: [
          { id: "ankunft_lagune", label: "Golden Lion gleitet durchs Riff, wirft Anker in der Lagune", info: "Die Golden Lion gleitet durchs Riff in ruhigeres Wasser dahinter und wirft Anker in einer kleinen, geschützten Lagune. Der Himmel im Osten hellt sich auf." },
          { id: "kurze_erleichterung", label: "Ein Moment der Stille — Erleichterung, die niemand laut ausspricht", info: "Die Erleichterung ist förmlich zu greifen, aber niemand traut sich, sie laut auszusprechen, solange der Verfolger noch irgendwo dort draußen sein könnte." },
          { id: "cormacs_auftrag", label: "Cormac erteilt die offene Erkundungsaufgabe: Wasser, Material, Sicherheit", info: "„Sucht die Insel ab. Wasser, brauchbares Material, und haltet die Augen offen. Teilt euch auf, wenn ihr wollt — nur nicht allein.“" },
          { id: "keine_feste_route", label: "Weder Route noch Reihenfolge vorgegeben, Gruppe kann sich aufteilen", info: "Die Spieler entscheiden selbst, wohin sie zuerst aufbrechen." }
        ]
      },
      "die_erkundung": {
        title: "Die Erkundung — vier Fundstellen (SL-Referenz)",
        kurz: "SL-Referenz/Ausfalltext: die vier möglichen Ziele der Erkundung, jeweils mit eigener Probe. Läuft jetzt primär über den Erkundungs-Graphen im Adminpanel (🧭-Bereich unter dem Szenenkopf, js/exploration_graphs.js) — dort werden Proben aufgelöst und Marker automatisch per hiddenMarkersLive aufgedeckt. Dieser Text bleibt als Referenz/Fallback (z.B. bei Firebase-Ausfall).",
        details: "Diese Insel hat mehr zu bieten als den Landepunkt — aber die weiteren Orte finden sich nicht von selbst. Seit dem Erkundungs-Graphen (🧭, Adminpanel) läuft der Weg dorthin über verdeckte Wegabschnitte mit Gabelungen/Ereignissen statt direkter freier Wahl — die vier Proben selbst sind unverändert:\n\n— Süßwasserquelle: Instinkt/Survival. Erfolg blendet den Marker ein. Misserfolg: Zeit verloren, dazu ein kleiner Schaden (übles, brackiges Wasser probiert) — ein zweiter Versuch ist jederzeit möglich.\n\n— Wrackteile am Riff: Klettern/Körper (über scharfes, nasses Riffgestein). Erfolg blendet den Marker ein. Misserfolg: Zeit verloren, ein kleiner Schaden (Schnittwunde am Riffgestein) — zweiter Versuch möglich.\n\n— Aussichtsklippe: Klettern. Erfolg blendet den Marker ein. Misserfolg: Zeit verloren, ein kleiner Schaden (abgerutscht) — zweiter Versuch möglich.\n\n— Versteckte Grotte: Wahrnehmung. Erfolg blendet den Marker ein. Misserfolg: bewusst folgenlos — man übersieht den Eingang einfach, kein Sturz möglich, jederzeit ein zweiter Versuch.\n\nOhne funktionierende Firebase-Verbindung (oder falls der Graph im Einzelfall nicht passt) kann diese Tabelle weiterhin manuell als Fallback genutzt werden — direkt Probe ansagen, Marker per Sichtbarkeits-Schalter aufdecken.",
        trigger: [
          { id: "quelle_probe", label: "Süßwasserquelle: Instinkt-/Survival-Probe versucht", info: "Ein Gespür dafür, wo im dichten Gelände Wasser zu finden ist." },
          { id: "quelle_erfolg", label: "Quelle gefunden → Marker live einblenden", info: "Erfolg blendet den Marker \"Süßwasserquelle\" ein (hiddenMarkersLive)." },
          { id: "quelle_misserfolg", label: "Misserfolg → Zeit verloren, 1 Schaden (übles Wasser probiert)", info: "Zeit verloren, dazu ein kleiner Schaden — übles, brackiges Wasser probiert. Ein zweiter Versuch ist jederzeit möglich." },
          { id: "wrackteile_probe", label: "Wrackteile: Klettern-/Körper-Probe versucht", info: "Über scharfes, nasses Riffgestein zu den Wrackteilen." },
          { id: "wrackteile_erfolg", label: "Wrackteile gefunden → Marker live einblenden", info: "Erfolg blendet den Marker \"Wrackteile am Riff\" ein." },
          { id: "wrackteile_misserfolg", label: "Misserfolg → Zeit verloren, 1 Schaden (Schnittwunde)", info: "Zeit verloren, dazu ein kleiner Schaden — Schnittwunde am Riffgestein. Zweiter Versuch möglich." },
          { id: "klippe_probe", label: "Aussichtsklippe: Klettern-Probe versucht", info: "Die Klippe hochkommen." },
          { id: "klippe_erfolg", label: "Klippe erklommen → Marker live einblenden", info: "Erfolg blendet den Marker \"Aussichtsklippe\" ein." },
          { id: "klippe_misserfolg", label: "Misserfolg → Zeit verloren, 1 Schaden (abgerutscht)", info: "Zeit verloren, dazu ein kleiner Schaden — abgerutscht. Zweiter Versuch möglich." },
          { id: "grotte_probe", label: "Versteckte Grotte: Wahrnehmungsprobe versucht", info: "Der gut versteckte Spalt im Fels ist leicht zu übersehen." },
          { id: "grotte_erfolg", label: "Grotte gefunden → Marker live einblenden", info: "Erfolg blendet den Marker \"Versteckte Grotte\" ein." },
          { id: "grotte_misserfolg", label: "Misserfolg → folgenlos, jederzeit erneut versuchbar", info: "Man übersieht den Eingang einfach — kein Sturz möglich, kein Schaden. Jederzeit ein zweiter Versuch." }
        ]
      },
      "die_bedrohliche_stimmung": {
        title: "Die Stimmung kippt (Vorlauf zum Angriff)",
        kurz: "SL-Ermessen, über mehrere Stationen hinweg einstreuen: die Insel wird nach und nach spürbar bedrohlich, ohne dass sich eine Ursache zeigt. Reine Stimmung, keine Probe, keine Konsequenz — der Vorlauf zu \"Die Affen greifen an\".",
        details: "Nicht als einzelne Szene spielen, sondern in kleinen Dosen zwischen die normalen Erkundungsstationen streuen, sobald die Gruppe eine Weile unterwegs ist (SL-Ermessen, kein fester Zeitpunkt). Jeweils nur ein, zwei Sätze, dann normal weiterspielen.\n\nMögliche Einwürfe, beliebig oft und in beliebiger Reihenfolge:\n— Das Zirpen und Vogelgeschrei setzt für ein paar Atemzüge komplett aus und beginnt dann wieder.\n— In den Wipfeln bewegt sich etwas mit, immer ein Stück voraus, immer außer Sicht.\n— Zweige knacken oberhalb des Weges, nicht daneben.\n— Auf einem Ast liegt eine angebissene Frucht, das Fruchtfleisch noch feucht.\n— Ein einzelner, kurzer Schrei weit oben im Blätterdach, dann nichts mehr.\n— Die Gruppe kommt an einer Stelle vorbei, an der sie schon war, und der Boden ist dort aufgewühlt.\n\nWichtig: keine Erklärung, keine Deutung durch die SL, keine Probe und keine Konsequenz. Die Spieler sollen selbst entscheiden, ob sie das ernst nehmen. Wer eine Wahrnehmungsprobe verlangt, bekommt Details zum Beobachteten, aber keine Auflösung — was da ist, zeigt sich erst beim Angriff.",
        trigger: [
          { id: "geraeusche_setzen_aus", label: "Zirpen und Vogelgeschrei setzen für ein paar Atemzüge aus", info: "Danach beginnt es wieder, als wäre nichts gewesen." },
          { id: "bewegung_in_den_wipfeln", label: "In den Wipfeln bewegt sich etwas mit — immer voraus, immer außer Sicht", info: "Zweige knacken oberhalb des Weges, nicht daneben." },
          { id: "spuren_von_praesenz", label: "Angebissene Frucht mit feuchtem Fleisch, aufgewühlter Boden an bekannter Stelle", info: "Hinweise auf Anwesenheit, ohne dass sich etwas zeigt." },
          { id: "keine_aufloesung", label: "Keine Deutung, keine Probe, keine Konsequenz — nur Stimmung", info: "Wer eine Wahrnehmungsprobe verlangt, bekommt Details, aber keine Auflösung." }
        ]
      },
      "die_affen": {
        title: "Die Affen greifen an",
        kurz: "SL-Ermessen: sobald du die Gruppe forttreiben willst (grober Richtwert 30-60 Minuten reale Erkundungszeit, Stoppuhr im Adminpanel), bricht aus dem Blätterdach eine unzählbare Menge Affen hervor und jagt die Gruppe zurück zum Boot. Beendet die Erkundung bewusst vorzeitig. Wiederholter Lärm am Rätsel der Kiste kann den Zeitpunkt vorziehen.",
        details: "Der Abbruch der Erkundung, jederzeit auslösbar — kein fester Trigger an einem Fund oder Knoten. Grober Richtwert sind 30 bis 60 Minuten reale Erkundungszeit (Stoppuhr im Adminpanel), aber ausschlaggebend ist allein, wann du die Gruppe forttreiben willst. Sinnvoll ist es, vorher eine Weile die Interaktion \"Die Stimmung kippt\" eingestreut zu haben, damit der Angriff nicht aus dem Nichts kommt.\n\nDann bricht es los: Aus dem Blätterdach kommen Affen — nicht eine Handvoll, sondern so viele, dass sich keine Zahl mehr angeben lässt. Sie kommen von oben und von allen Seiten, kreischend, springend, in einer Dichte, gegen die Zurückschlagen keinen Unterschied macht. Wer eines der Tiere trifft, hat drei andere am Arm.\n\nEs ist ausdrücklich kein Kampf, den die Gruppe gewinnen oder verlieren kann, sondern eine Flucht: Die Gruppe wird zurück Richtung Strand und Boot gedrängt, ohne Zeit, sich zu wehren oder das Vorhaben fortzusetzen. Schaden nach SL-Ermessen — Kratzer und Bisse, nichts Lebensbedrohliches, aber genug, dass niemand stehen bleiben will (praktisch: der bestehende \"↺ Zurücksetzen\"-Knopf im 🧭-Bereich des Adminpanels bildet den erzwungenen Rückzug technisch ab).\n\nDamit endet die Erkundung dieser Insel bewusst vorzeitig — nicht jede Fundstelle muss oder soll in diesem Durchgang entdeckt werden. Zwei optionale Anknüpfungspunkte (SL-Ermessen, keine Pflicht): die Abdrücke, auf die die Gruppe unterwegs möglicherweise gestoßen ist (siehe Erkundungs-Graph, Ereignis \"Ungewöhnliche Abdrücke\"), lassen sich im Rückblick als frühe Vorwarnung lesen. Und: wiederholte laute Fehlversuche beim Rätsel der Kiste (versteckte Grotte, Interaktion \"Das Rätsel der Kiste\") sind ein plausibler Grund, den Zeitpunkt vorzuziehen — der Lärm hat sie schneller aufmerksam gemacht.",
        trigger: [
          { id: "sl_entscheidet_zeitpunkt", label: "SL-Ermessen: sobald du die Gruppe forttreiben willst (Richtwert 30-60 Min.)", info: "Kein fester Trigger an einem bestimmten Fund oder Knoten — Stoppuhr im Adminpanel als grobe Orientierung." },
          { id: "affen_brechen_hervor", label: "Aus dem Blätterdach bricht eine unzählbare Menge Affen hervor", info: "Von oben und von allen Seiten, kreischend, springend — keine Zahl mehr angebbar." },
          { id: "kein_gewinnbarer_kampf", label: "Kein gewinnbarer Kampf — wer eines trifft, hat drei andere am Arm", info: "Ausdrücklich kein Kampf, den die Gruppe gewinnen oder verlieren kann." },
          { id: "flucht_zum_boot", label: "Flucht Richtung Strand und Boot, Schaden nach SL-Ermessen", info: "Kratzer und Bisse, nichts Lebensbedrohliches, aber genug, dass niemand stehen bleiben will." },
          { id: "rueckzug_erzwungen", label: "Erzwungener Rückzug zum Ausgangspunkt (praktisch: \"Zurücksetzen\"-Knopf)", info: "Die Erkundung endet bewusst vorzeitig — nicht jede Fundstelle muss in diesem Durchgang entdeckt werden." }
        ]
      }
    }
  },

  "suesswasserquelle": {
    personen: "Josiah Pryce",
    kurz: "Nur sichtbar nach erfolgreicher Instinkt-/Survival-Probe (siehe Riffstrand, \"Die Erkundung\"). Ein ruhiger Charaktermoment mit Josiah Pryce abseits der Kombüse.",
    interaktionen: {
      "josiah_am_wasser": {
        title: "Josiah — Ein ruhiger Moment am Wasser",
        kurz: "Josiah füllt in Ruhe Wasserfässer, ein seltener ruhiger Moment mit ihm abseits der Kombüse. Auf Nachfrage erzählt er kurz von Wales. Kein Wurf, kein Ruf-Effekt.",
        details: "Wer die Quelle findet, trifft dort nicht auf einen leeren Ort: Josiah Pryce ist schon da, kniet am Beckenrand und füllt in aller Ruhe ein Fass nach dem anderen, summt dabei leise vor sich hin — dieselbe Melodie, die er sonst in der Kombüse pfeift.\n\nEr ist erkennbar erleichtert, mal nicht in der engen Kombüse zu stehen. Auf Ansprache bleibt er derselbe warme, sanfte Mann wie immer — hilft gerne beim Fassfüllen, hat für jeden ein freundliches Wort. Fragt jemand direkt nach ihm selbst, seiner Heimat, wird er nachdenklich, erzählt kurz und unaufgeregt von Wales, von einer Küche, die er dort zurückgelassen hat — ohne Selbstmitleid, eher wie eine ferne, freundliche Erinnerung.\n\nKein Wurf, kein Ruf-Effekt — reiner Charaktermoment, eine seltene Gelegenheit, Josiah außerhalb seiner Rolle als Koch kennenzulernen.",
        trigger: [
          { id: "josiah_am_becken", label: "Josiah kniet am Beckenrand, füllt Fässer, summt leise vor sich hin", info: "Dieselbe Melodie, die er sonst in der Kombüse pfeift." },
          { id: "hilfsbereit", label: "Hilft gerne beim Fassfüllen, freundliches Wort für jeden", info: "Erkennbar erleichtert, mal nicht in der engen Kombüse zu stehen." },
          { id: "ueber_wales", label: "Auf Nachfrage: erzählt kurz und unaufgeregt von Wales", info: "Von einer Küche, die er dort zurückgelassen hat — ohne Selbstmitleid, eher wie eine ferne, freundliche Erinnerung." }
        ]
      }
    }
  },

  "wrackteile": {
    personen: "Dirk van Hoorn · Sam Oakley",
    kurz: "Nur sichtbar nach erfolgreicher Klettern-/Körper-Probe. Dirk und Sam bergen brauchbares Ausbesserungsmaterial aus einem alten Wrack am Riff.",
    interaktionen: {
      "material_bergen": {
        title: "Material aus dem alten Wrack",
        kurz: "Dirk und Sam sind schon vor Ort, bergen trockenes Holz und brauchbare Beschläge — genug für Ausbesserungen. Mithilfe ohne Probe möglich, freiwillige Mechanik-Probe kann einen besonders guten Fund liefern.",
        details: "Wer sich zu den Wrackteilen durchkämpft, findet Dirk van Hoorn und Sam Oakley bereits dort vor — beide sind offenbar auf eigene Faust losgezogen, kaum dass Cormacs Auftrag die Runde machte. Sie untersuchen die verwitterten Planken mit dem geübten Blick von Leuten, die genau wissen, was sich noch verwenden lässt und was nicht.\n\nDas Wrack ist alt, vielleicht Jahrzehnte, längst vom Riff zermahlen — aber ein Teil des Holzes ist trocken und noch tragfähig, dazu ein paar brauchbare Beschläge und Nägel. Genug, um die Schäden der Flucht auszubessern (siehe \"Riff-Ausguck\", Bug, Szene 10.1, falls die Golden Lion dort Schaden genommen hat).\n\nDirk arbeitet wortkarg wie immer, knappe Anweisungen an Sam, ab und zu ein zufriedenes Grunzen bei einem guten Fund. Spieler, die mithelfen wollen, können das ohne Probe — hier ist genug zu tun. Eine echte, freiwillige Mechanik-/Handwerksprobe eines Spielers kann einen besonders guten Fund liefern (SL-Ermessen, z. B. ein Stück Metall, das sich später als nützlich erweist).",
        trigger: [
          { id: "dirk_und_sam_vor_ort", label: "Dirk und Sam sind schon da, untersuchen die Wrackteile fachmännisch", info: "Beide sind offenbar auf eigene Faust losgezogen, kaum dass Cormacs Auftrag die Runde machte." },
          { id: "material_gefunden", label: "Trockenes Holz und brauchbare Beschläge gefunden — genug für Ausbesserungen", info: "Ein Teil des Holzes ist trocken und noch tragfähig, dazu ein paar brauchbare Beschläge und Nägel." },
          { id: "mithilfe_moeglich", label: "Mithilfe ohne Probe möglich, freiwillige Mechanik-Probe kann besonders guten Fund liefern", info: "Wer mithelfen will, kann das ohne Probe. Eine freiwillige Mechanik-/Handwerksprobe kann einen besonders guten Fund liefern (SL-Ermessen)." }
        ]
      }
    }
  },

  "aussichtsklippe": {
    personen: "Amos Hale",
    kurz: "Der eigentliche Zweck des Aufstiegs (Hendriks Vorgabe): von hier oben sieht die Gruppe das spanische Kriegsschiff in entgegengesetzter Richtung abziehen und am Horizont verschwinden. Amos hält dort Wache. Session-Schluss-Beat.",
    interaktionen: {
      "wache_und_horizont": {
        title: "Amos Hale — Der Verfolger zieht ab",
        kurz: "Der Grund, hier hochzusteigen: von oben ist zu sehen, wie das spanische Kriegsschiff in die entgegengesetzte Richtung abdreht und am Horizont verschwindet. Amos hält bereits Wache und hat es vor der Gruppe gesehen.",
        details: "Oben auf der Klippe steht bereits Amos Hale, den Blick übers offene Meer gerichtet, als wäre er nie woanders gewesen. Kein Erstaunen, kein Kommentar dazu, dass jemand den Aufstieg geschafft hat — nur ein knappes Nicken und eine Kopfbewegung aufs Wasser hinaus.\n\nVon hier oben, und nur von hier oben, ist es zu sehen: das spanische Kriegsschiff, unter vollen Segeln, auf entgegengesetztem Kurs. Es wird kleiner, während die Gruppe zusieht, bis es am Horizont zwischen Wasser und Himmel verschwindet. Es sucht woanders.\n\nDas ist der eigentliche Ertrag des Aufstiegs — die Information, dass die Golden Lion fürs Erste nicht verfolgt wird, und dass die Finte aus der Nacht funktioniert hat. Wer sie hat, kann sie mit zurück ans Schiff bringen; wer nie hier hochsteigt, erfährt sie nicht (die Gruppe bricht dann ohne diese Gewissheit auf).\n\nAmos bleibt dabei trocken und ungerührt wie immer, macht keine große Sache daraus und deutet nichts. Wie viel Erleichterung das wert ist, entscheiden die Spieler selbst.",
        trigger: [
          { id: "amos_auf_wache", label: "Amos hält bereits Wache, den Blick übers offene Meer gerichtet", info: "Kein Erstaunen, kein Kommentar dazu, dass jemand den Aufstieg geschafft hat — nur ein knappes Nicken und eine Kopfbewegung aufs Wasser hinaus." },
          { id: "kriegsschiff_zieht_ab", label: "Das spanische Kriegsschiff läuft auf entgegengesetztem Kurs, unter vollen Segeln", info: "Von hier oben, und nur von hier oben, ist es zu sehen." },
          { id: "verschwindet_am_horizont", label: "Es wird kleiner und verschwindet am Horizont — es sucht woanders", info: "Der eigentliche Ertrag des Aufstiegs: die Golden Lion wird fürs Erste nicht verfolgt, die Finte aus der Nacht hat funktioniert." },
          { id: "information_nur_hier_oben", label: "Wer nicht hochsteigt, erfährt es nicht", info: "Die Gruppe bricht dann ohne diese Gewissheit auf." }
        ]
      }
    }
  },

  "versteckte_grotte": {
    kurz: "Ein echtes Rätsel (Steinplatte + vier Tier-Steine, Reim von Hendrik) sichert die Kiste — Lösung ist die Katze/der Jaguar, Belohnung ein verzierter Säbel mit Jaguar-Gravur. Der Inhalt der Kiste selbst bleibt bewusst offen (Bibel 7.4: \"ein Vorteil, den die Spieler haben, ohne ihn zu kennen\").",
    interaktionen: {
      "der_fund_in_der_grotte": {
        title: "Der Fund in der Grotte",
        kurz: "Eine alte, versiegelte Kiste mit einem unbekannten Symbol, daneben eine beschriftete Steinplatte und vier lose Steine — siehe Interaktion \"Das Rätsel der Kiste\" für die Auflösung. Was drin ist, bleibt bewusst offen.",
        details: "Wer den Spalt im Fels findet und sich hindurchzwängt, steht in einer kleinen, trockenen Grotte — kühl, still, das Licht von draußen reicht nur wenige Schritte hinein. Auf den ersten Blick wirkt sie leer.\n\nErst beim genaueren Hinsehen zeigt sich: Ganz hinten, halb im Schatten, liegt etwas, das hier nicht hingehört — eine alte, mit Wachs versiegelte Kiste, gebrandmarkt mit einem Symbol, das niemand hier kennt. Zu schwer, um sie allein zu tragen. Direkt daneben liegt eine flache Steinplatte, dicht mit eingeritzten Zeichen bedeckt, und vier lose, kunstvoll gearbeitete Steine (siehe Interaktion \"Das Rätsel der Kiste\").\n\nWas genau in der Kiste ist und wofür es später gut sein wird, verrät sich den Spielern in diesem Moment nicht — nur, dass sie dort ist, unversehrt, offenbar schon lange (Bibel 7.4: \"ein Vorteil, den die Spieler haben, ohne ihn zu kennen\"). Bewusst kein Aha-Moment, keine Erklärung an dieser Stelle — die Bedeutung zeigt sich erst in einer späteren Szene.",
        trigger: [
          { id: "grotte_betreten", label: "Der Spalt im Fels wird gefunden, die Grotte betreten", info: "Kühl, still, das Licht von draußen reicht nur wenige Schritte hinein. Auf den ersten Blick wirkt sie leer." },
          { id: "kiste_entdeckt", label: "Eine versiegelte Kiste mit unbekanntem Symbol entdeckt — Bedeutung bleibt offen", info: "Halb im Schatten, zu schwer für eine Person allein. Was darin ist, verrät sich jetzt noch nicht." },
          { id: "raetsel_entdeckt", label: "Steinplatte mit Zeichen und vier lose Steine liegen direkt daneben", info: "Eine flache Steinplatte, dicht mit eingeritzten Zeichen bedeckt, und vier lose, kunstvoll gearbeitete Steine mit je einem Tier-Relief." }
        ]
      },
      "das_raetsel_der_kiste": {
        title: "Das Rätsel der Kiste",
        kurz: "Eine Intelligenz-Probe an der Steinplatte gibt dem Spieler den Reim (wörtlich vorlesen/aushändigen). Lösung ist der Jaguar — von vier Tier-Steinen (Eule/Katze/Schlange/Maus) ist die KATZE der richtige. Erfolg: ein verzierter Säbel mit eingraviertem Jaguar. Falscher Stein: Knall und ein Fauchen wie von einer Großkatze, beliebig oft erneut versuchbar — SL-Ermessen: wiederholter Lärm kann die Affen früher auf die Gruppe aufmerksam machen.",
        details: "Reim und Symbole stammen von Hendrik, wörtlich übernommen. Die Zeichen auf der Steinplatte ergeben auf den ersten Blick keinen Sinn — erst eine erfolgreiche Intelligenz-Probe setzt genug davon zusammen. Wer sie schafft, bekommt DIESEN Text (am besten wörtlich vorlesen oder ausgedruckt aushändigen):\n\n„In Ringen aus Nacht, die Sonne wohnt,\nein anderer als ich, das Wasser meidet.\nKnack ich den Schädel ungeschont,\nkein Laut der durch die Stille schneidet.\nAlleine wachend zum Licht gebracht,\nHerrscher der Welt unter bei Nacht.“\n\nDie Symbole auf der Platte, Zeile für Zeile (so beschreiben, falls jemand die Platte selbst lesen statt den Reim hören will):\n— Ring · Nacht · Sonne\n— Familie · Wasser · X\n— Kaputter Schädel\n— Wellen · Geräusche · X\n— Sonne · Figur (Wächter)\n— Nacht (Linie darüber, Sterne) · eine Figur (Herrscher)\n\nVor den Spielern liegen vier Steine mit Tier-Symbolen: Eule, Katze, Schlange, Maus.\n\nLÖSUNG: die KATZE. Der Reim beschreibt den Jaguar, und die Katze ist von den vieren das einzige Symbol, das ihn abbildet. Auflösung Zeile für Zeile, falls die Gruppe hängt und du nachhelfen willst: „Ringe aus Nacht, in denen die Sonne wohnt“ sind die Rosetten auf goldenem Fell. „Ein anderer als ich meidet das Wasser“ — anders als der Rest seiner Familie scheut der Jaguar das Wasser nicht, er schwimmt. Der Schädelbiss ist seine Art zu töten. Lautlos, einzelgängerisch, und Herrscher der Unterwelt bei Nacht.\n\nBei richtiger Wahl öffnet sich der Mechanismus: die Gruppe bekommt einen verzierten Säbel, in den ein Jaguar eingraviert ist.\n\nBei einem falschen Stein ertönt ein Knall und ein Fauchen, wie von einer Großkatze — der Mechanismus bleibt zu, nichts geht kaputt, ein erneuter Versuch mit einem anderen Stein ist jederzeit möglich.\n\nSL-Ermessen: Der Lärm bleibt nicht zwangsläufig folgenlos — wiederholte laute Fehlversuche können das Risiko erhöhen, dass die Affen früher als sonst auf die Gruppe aufmerksam werden (siehe ORTE.riffstrand, Interaktion \"Die Affen greifen an\").",
        trigger: [
          { id: "zeichen_uebersetzt", label: "Erfolgreiche Intelligenz-Probe → Reim an den Spieler aushändigen", info: "„In Ringen aus Nacht, die Sonne wohnt, / ein anderer als ich, das Wasser meidet. / Knack ich den Schädel ungeschont, / kein Laut der durch die Stille schneidet. / Alleine wachend zum Licht gebracht, / Herrscher der Welt unter bei Nacht.“" },
          { id: "vier_steine_vorhanden", label: "Vier Steine mit Tier-Symbolen liegen bereit: Eule, Katze, Schlange, Maus", info: "Dazu die Steinplatte mit den sechs Symbolzeilen, falls jemand sie selbst lesen will." },
          { id: "richtiger_stein_katze", label: "Richtige Lösung: die KATZE (der Reim beschreibt den Jaguar)", info: "Rosetten auf goldenem Fell, scheut als einziger seiner Familie das Wasser nicht, tötet mit dem Schädelbiss, lautlos, Herrscher der Unterwelt bei Nacht." },
          { id: "belohnung_saebel", label: "Belohnung: verzierter Säbel mit eingraviertem Jaguar", info: "Der Mechanismus öffnet sich." },
          { id: "falscher_stein_knall", label: "Falscher Stein → Knall und ein Fauchen wie von einer Großkatze, erneut versuchbar", info: "Der Mechanismus bleibt zu, nichts geht kaputt — ein erneuter Versuch mit einem anderen Stein ist jederzeit möglich." },
          { id: "sl_ermessen_laerm_affen", label: "SL-Ermessen: wiederholter Lärm kann die Affen früher aufmerksam machen", info: "Wiederholte laute Fehlversuche können das Risiko erhöhen, dass die Affen früher als sonst angreifen (siehe ORTE.riffstrand, \"Die Affen greifen an\")." }
        ]
      }
    }
  }
};

// Regie-Daten pro SZENE (nicht pro Ort) - anders als ORTE, das flach pro
// Ort-ID definiert ist. Hält das szenen-weite GM-Material, das keinem
// einzelnen Marker gehört:
//   stimmung - Vorlese-Grundton der ganzen Örtlichkeit (Grundstimmung +
//              aktuelle Lage), zum Vorlesen / Spieler-Hinlocken.
//   ghosts   - generische, szenen-weit frei platzierbare Statisten
//              ("Scheincharaktere"), die die Stimmung verkörpern. Plot-
//              neutral, reines Atmosphäre-/Rollenspiel-Futter. Felder je
//              Ghost: name, rolle, verfassung, beduerfnis, koerperlich?
//              (koerperlich: true markiert einen Ghost, an dem sich ein
//              kampflustiger Spieler gefahrlos reiben kann - fehlt es,
//              ist der Ghost rein sozial).
//   charaktere - optionale Liste von CHARACTERS-IDs (characters.js), die in
//              dieser Szene relevant sind. Steuert die kontextbezogene
//              Charakter-Leiste im Admin-Panel: ist das Feld gesetzt, zeigt
//              die Leiste nur diese Figuren (plus einen "+ weitere"-Knopf für
//              den Rest). Fehlt es, werden wie bisher ALLE Figuren gezeigt
//              (abwärtskompatibel).
// Verankerte NPCs (an EINEM Ort) stehen dagegen in ORTE[ortId].npcs.
// Angezeigt wird beides im Admin-Panel (regie.html): stimmung+ghosts über
// den Szenen-Kopf in der Orte-Spalte, npcs im jeweiligen Ort-Detail.
const SZENEN_REGIE = {
  "1.1": {
    charaktere: ["francesco", "tom", "wat"], // in Grimsgate präsente Crew-Portraits (Taverne-Rekrutierer, Bibel 9.1)
    uebergeordnetesZiel: "An Bord der Golden Lion gelangen.", // Bibel 2.9
    stimmung: "Grimsgate lebt über seine Verhältnisse. Im Hafen liegt der größte Geleitzug, den die Stadt je gesehen hat — keine Handelsflotte, sondern eine Siedlungsfahrt in die Neue Welt. Wer drüben von Bord geht, dem versprechen sie Land, Arbeit für jede Hand, ein Leben, das bei null beginnt — und man muss nicht einmal reich sein, ein Platz an Deck genügt. Die halbe Stadt redet von nichts anderem. Man spürt es an jeder Ecke: die fiebrige Euphorie derer, die morgen gehen und alles hinter sich lassen; die stille Angst derer, die bleiben und sich gegen das Versprechen von Sonne und Freiheit wappnen müssen; der Frust derer, die mitwollten — doch die Schiffe sind voll. Nichts davon ist Politik oder ferne Macht. Für jeden Einzelnen steht ganz persönlich der nächste Schritt auf dem Spiel: bleiben, wer man ist — oder sich in ein paar Wochen drüben völlig neu würfeln.",
    ghosts: [
      {
        name: "Silas Coote",
        rolle: "Böttcher, morgen an Bord",
        verfassung: "Fiebrig aufgekratzt, hat Haus und Werkstatt verkauft, redet von nichts als drüben.",
        beduerfnis: "Jemand, der seinen Rausch teilt — oder ihm bestätigt, dass er das Richtige tut."
      },
      {
        name: "Reuben Slade",
        rolle: "Tagelöhner, kein Platz mehr bekommen",
        verfassung: "Verbittert, kurz angebunden, das Fenster schließt sich vor seiner Nase.",
        beduerfnis: "Irgendwie doch an Bord — oder wenigstens einen, an dem er seinen Zorn auslässt.",
        koerperlich: true
      },
      {
        name: "Ambrose Tench",
        rolle: "Alteingesessener Fassmacher, bleibt",
        verfassung: "Betont gelassen, drückt aber jedem ungefragt auf, warum drüben alle am Fieber krepieren.",
        beduerfnis: "Zustimmung — dass Bleiben Klugheit ist, nicht Feigheit."
      },
      {
        name: "Jory Vane",
        rolle: "Fliegender Händler",
        verfassung: "Glattzüngig, blendend gelaunt, wittert das Geschäft seines Lebens.",
        beduerfnis: "Auswanderern „unverzichtbares“ Zeug für die Neue Welt andrehen — Fiebertinkturen, Wunderwerkzeug, Schutzamulette."
      },
      {
        name: "Nell Alderton",
        rolle: "Näherin, verwitwet",
        verfassung: "Tapferes Lächeln über echter Angst — ihr einziger Sohn geht morgen und kommt wohl nie zurück.",
        beduerfnis: "Dem Jungen ein Andenken mitgeben — oder das Versprechen, dass jemand auf ihn achtgibt."
      }
    ]
  },

  // Golden Lion (Basis). Ghosts = generischer Statisten-Pool aus der ~120
  // Mann starken Besatzung, frei platzierbar, plot-neutral (Claude-Aufschlag,
  // von Hendrik freigegeben).
  "2.1": {
    stimmung: "Gut hundert Mann auf engem Raum — kein Handelsschiff, bei dem man nach einer Woche jedes Gesicht kennt. Über und unter Deck greifen Routinen ineinander: Wachablösung, Kommandos, das ewige Schrubben, Nachziehen, Instandhalten, das ein Kriegsschiff vom Frachter unterscheidet. Tauwerk knarrt, Rufe hallen über die Decks, irgendwo wird immer gerade etwas geschleppt, geflickt oder verstaut. Wer neu an Bord ist, verliert sich leicht in der Menge — die meisten Gesichter sieht man genau einmal, tauscht ein Wort, verschwindet wieder in der Mannschaft. Nach außen ein braver Geleitschutz; wer genau hinsieht, erkennt den Takt einer Kampfmannschaft darunter.",
    ghosts: [
      {
        name: "Amos Hale",
        rolle: "Altgedienter Toppmann, seit 20 Jahren auf See",
        verfassung: "Nichts überrascht ihn mehr, kommentiert alles trocken und ungefragt.",
        beduerfnis: "Seine Pfeife, seine Ruhe, und dass niemand ihn nach seiner Meinung zu Dingen fragt, die ihn nichts angehen."
      },
      {
        name: "Toby Rennick",
        rolle: "Grüner Rekrut, erste Fahrt",
        verfassung: "Überängstlich bemüht, alles richtig zu machen, hält sich meist zu nah an erfahreneren Leuten auf.",
        beduerfnis: "Nicht als Landratte auffallen — und wenigstens einmal für etwas gelobt werden."
      },
      {
        name: "Corwin Ashby",
        rolle: "Abergläubischer Zimmermannsgehilfe",
        verfassung: "Sieht in jedem Zufall ein Omen, murmelt Beschwörungen gegen Unglück.",
        beduerfnis: "Dass seine Warnungen ernst genommen werden — oder wenigstens niemand ihn dafür auslacht."
      },
      {
        name: "Jonas Teague",
        rolle: "Verschuldeter Kartenspieler",
        verfassung: "Nervös-fahrig, schuldet halbem Unterdeck Geld, redet sich mit Versprechen heraus.",
        beduerfnis: "Irgendwo schnell an Münzen kommen, bevor die Sache eskaliert.",
        koerperlich: true
      },
      {
        name: "Edmund Grey",
        rolle: "Heimwehkranker Familienvater",
        verfassung: "Wehmütig, hält an einem abgegriffenen Andenken von zuhause fest, erzählt bei jeder Gelegenheit von seinen Kindern.",
        beduerfnis: "Jemand, der ihm zuhört — oder verspricht, im Zweifel eine Nachricht heimzubringen."
      }
    ]
  },

  // Golden Lion im Sturm. Bisher ohne eigenen SZENEN_REGIE-Eintrag (Nachtrag,
  // August 2026, Claude-Aufschlag/von Hendrik freizugeben) - gleicher
  // Ghost-Pool wie 2.1/5.1/6.1 (dieselbe Crew), nur die Verfassung an den
  // Sturm angepasst, exakt wie beim Umbau für 5.1/6.1 gehandhabt.
  "3.1": {
    ghosts: [
      {
        name: "Amos Hale",
        rolle: "Altgedienter Toppmann, seit 20 Jahren auf See",
        verfassung: "Oben in der Takelage im Einsatz, klammert sich mit routinierter Ruhe fest — kommentiert den Sturm trotzdem trocken, weil es ohne den Spruch nicht ginge.",
        beduerfnis: "Seine Pfeife, seine Ruhe, und dass niemand ihn nach seiner Meinung zu Dingen fragt, die ihn nichts angehen."
      },
      {
        name: "Toby Rennick",
        rolle: "Grüner Rekrut, erste Fahrt",
        verfassung: "Kreidebleich, hält sich an jedem erreichbaren Tau fest, kämpft sichtlich mit Übelkeit und Angst zugleich.",
        beduerfnis: "Nicht als Landratte auffallen — und wenigstens einmal für etwas gelobt werden."
      },
      {
        name: "Corwin Ashby",
        rolle: "Abergläubischer Zimmermannsgehilfe",
        verfassung: "Der Sturm ist für ihn ein klares Zeichen — murmelt ununterbrochen Beschwörungen, während er verzweifelt versucht, ein Leck abzudichten.",
        beduerfnis: "Dass seine Warnungen ernst genommen werden — oder wenigstens niemand ihn dafür auslacht."
      },
      {
        name: "Jonas Teague",
        rolle: "Verschuldeter Kartenspieler",
        verfassung: "Selbst er hat für einmal die Karten weggesteckt — hilft mit zitternden Händen beim Festzurren der Ladung, sichtlich außerhalb seiner Komfortzone.",
        beduerfnis: "Irgendwo schnell an Münzen kommen, bevor die Sache eskaliert.",
        koerperlich: true
      },
      {
        name: "Edmund Grey",
        rolle: "Heimwehkranker Familienvater",
        verfassung: "Betet leise vor sich hin zwischen den Kommandos, die Gedanken sichtbar bei seiner Familie — macht trotzdem zuverlässig jeden Handgriff.",
        beduerfnis: "Jemand, der ihm zuhört — oder verspricht, im Zweifel eine Nachricht heimzubringen."
      }
    ]
  },

  // Schatzinsel-Landung. stimmung = Grundton der ERSTEN Station (Strand/Wrack);
  // die weiteren Insel-Stationen (Dschungelpfad, Dorf der Thahal, Nachtlager,
  // Wasserhöhle) folgen im laufenden Szenen-Durchgang. Ghosts hier = generische
  // Crew bei den Reparaturen. Personen-Aufschlag, noch nicht final geschärft.
  "4.1": {
    uebergeordnetesZiel: "Harwicks Schatz der Thahal holen und die Insel wieder verlassen.", // Bibel 2.9
    stimmung: "Fester Boden nach dem Sturm — für die meisten an Bord grenzt das an reines Glück. Der Strand ist voller Betrieb: Balken werden herangeschleppt, der Schmied schlägt am improvisierten Amboss Beschläge zurecht, Leitern lehnen am Rumpf. Die Golden Lion liegt auf der Seite in der sandigen Bucht, der vordere Mast gebrochen, Tauwerk und Trümmer über den Sand verstreut. Ringsum dichter, grüner Dschungel — Vogelrufe, Insektensurren, feuchte Wärme. Unbekanntes Land hinter der Brandung.",
    ghosts: [
      {
        name: "Eliot Pike",
        rolle: "Matrose, heil durch den Sturm gekommen",
        verfassung: "Aufgekratzt, redselig, kann kaum stillsitzen vor Erleichterung.",
        beduerfnis: "Jemand, der die Erleichterung mit ihm teilt — erzählt jedem, wie knapp es war."
      },
      {
        name: "Abel Crane",
        rolle: "Matrose, in der Sturmnacht übel zugerichtet",
        verfassung: "Erschöpft, eine Hand bandagiert, sitzt abseits im Sand.",
        beduerfnis: "Ruhe und Wasser — oder jemanden, der ihm einen Handgriff abnimmt."
      },
      {
        name: "Malachi Fenn",
        rolle: "Decksmann, dem der Landstrich nicht geheuer ist",
        verfassung: "Unruhig, blickt immer wieder zum Dschungelrand, bleibt nah am Rumpf.",
        beduerfnis: "Ein Zeichen, dass hier alles mit rechten Dingen zugeht — hält sich lieber beim Schiff."
      },
      {
        name: "Sam Oakley",
        rolle: "Zimmermannsgehilfe, mitten in der Reparatur",
        verfassung: "Angespannt, wortkarg, keine Zeit für Gespräche.",
        beduerfnis: "Werkzeug und Hände — der Rumpf muss dicht werden."
      }
    ]
  },

  // Übergangsszene nach der Insel. Gleicher Ghost-Pool wie 2.1 (dieselbe
  // Crew, kein Szenenwechsel des Schiffs selbst) - Verfassung unverändert,
  // da die Ghosts reine Statisten sind und die eigentliche Stimmungs-
  // verschiebung über die konkreten Personen (Harwick, Ezra) läuft, nicht
  // über den Statisten-Pool.
  "5.1": {
    uebergeordnetesZiel: "Den weiteren Kurs bestimmen — frei, ohne Anweisung von oben —, während Ezra Coombes Wundbrand Richtung spanischem Hafen und Harwicks Artefakt-Wissen Richtung Schmugglernest ziehen.", // Bibel 2.9
    stimmung: "Ein Dutzend abgeschlagener Bäume und die zurückkehrende Flut rollen die Golden Lion zurück ins Wasser — noch einmal zeigt sich das Geschick der Zimmermänner an Bord, das Schiff wirkt fast wie neu. Nur der fehlende Lack erinnert daran, dass die Arbeit im nächsten sicheren Hafen fortgesetzt werden muss. An Bord geht es ruhig zu, die Segel stehen seicht im Wind, das Schiff hat wieder Fahrt aufgenommen.\n\nZurück auf See, mit vollen Laderäumen und einer Crew, die spürbar anders wirkt als beim Ablegen aus Grimsgate. Wer mit Harwick ins Inselinnere gezogen ist, bekommt jetzt andere Blicke — ein Nicken im Vorbeigehen, Fragen, die vorher niemand gestellt hätte. Unter der Erleichterung über den geborgenen Schatz liegt eine wachsende Unruhe: Unten liegt Ezra Coombe mit einem Bein, das nicht heilen will, und wer genau hinhört, hört, wie die Crew leise darüber tuschelt.",
    ghosts: [
      {
        name: "Amos Hale",
        rolle: "Altgedienter Toppmann, seit 20 Jahren auf See",
        verfassung: "Nichts überrascht ihn mehr, kommentiert alles trocken und ungefragt.",
        beduerfnis: "Seine Pfeife, seine Ruhe, und dass niemand ihn nach seiner Meinung zu Dingen fragt, die ihn nichts angehen."
      },
      {
        name: "Toby Rennick",
        rolle: "Grüner Rekrut, erste Fahrt",
        verfassung: "Sturm und Insel liegen jetzt hinter ihm — merklich weniger überängstlich als noch in Grimsgate, aber Ezras Zustand macht ihm sichtbar zu schaffen.",
        beduerfnis: "Nicht als Landratte auffallen — und wenigstens einmal für etwas gelobt werden."
      },
      {
        name: "Corwin Ashby",
        rolle: "Abergläubischer Zimmermannsgehilfe",
        verfassung: "Sieht in Ezras Wundbrand ein Omen, murmelt Beschwörungen gegen weiteres Unglück.",
        beduerfnis: "Dass seine Warnungen ernst genommen werden — oder wenigstens niemand ihn dafür auslacht."
      },
      {
        name: "Jonas Teague",
        rolle: "Verschuldeter Kartenspieler",
        verfassung: "Nervös-fahrig, schuldet halbem Unterdeck Geld, redet sich mit Versprechen heraus.",
        beduerfnis: "Irgendwo schnell an Münzen kommen, bevor die Sache eskaliert.",
        koerperlich: true
      },
      {
        name: "Edmund Grey",
        rolle: "Heimwehkranker Familienvater",
        verfassung: "Wehmütig, hält an einem abgegriffenen Andenken von zuhause fest, erzählt bei jeder Gelegenheit von seinen Kindern.",
        beduerfnis: "Jemand, der ihm zuhört — oder verspricht, im Zweifel eine Nachricht heimzubringen."
      }
    ]
  },

  // Flaute (Bibel 7.2: "passiver Weg, Harwicks eigene Route") - nur relevant,
  // falls in 5.1 niemand aktiv eingegriffen hat (siehe ORTE.golden_lion,
  // szenenUeberschreibungen "6.1"). Gleicher Ghost-Pool wie 5.1/2.1.
  "6.1": {
    uebergeordnetesZiel: "Die drückende Windstille überstehen, während das Schiff führungslos Harwicks eigenem Kurs folgt.", // Bibel 2.9
    stimmung: "Kein Windhauch, seit Tagen. Die Segel hängen schlaff, das Schiff liegt fast bewegungslos auf spiegelglatter See. Die sonst allgegenwärtigen Geräusche von Wind und Tauwerk fehlen komplett — ungewohnt still, fast bedrückend. Die Hitze staut sich unter Deck, die Vorräte werden knapper besprochen als sonst. Niemand sagt es laut, aber alle rechnen im Kopf mit, wie viele Tage das noch gutgeht.",
    ghosts: [
      {
        name: "Amos Hale",
        rolle: "Altgedienter Toppmann, seit 20 Jahren auf See",
        verfassung: "Auch ihn beunruhigt eine Flaute dieser Länge sichtlich — kommentiert es trotzdem trocken: „Hab Schlimmeres gesehen. Meistens.“",
        beduerfnis: "Seine Pfeife, seine Ruhe, und dass niemand ihn nach seiner Meinung zu Dingen fragt, die ihn nichts angehen."
      },
      {
        name: "Corwin Ashby",
        rolle: "Abergläubischer Zimmermannsgehilfe",
        verfassung: "Für ihn ist eine Flaute dieser Länge kein Zufall, sondern ein Zeichen — murmelt ununterbrochen Beschwörungen, meidet bestimmte Decksstellen.",
        beduerfnis: "Dass seine Warnungen ernst genommen werden — oder wenigstens niemand ihn dafür auslacht."
      },
      {
        name: "Jonas Teague",
        rolle: "Verschuldeter Kartenspieler",
        verfassung: "Bei so viel erzwungener Untätigkeit blüht sein Kartenspiel erst richtig auf — die Schulden wachsen entsprechend schneller.",
        beduerfnis: "Irgendwo schnell an Münzen kommen, bevor die Sache eskaliert.",
        koerperlich: true
      },
      {
        name: "Edmund Grey",
        rolle: "Heimwehkranker Familienvater",
        verfassung: "Die erzwungene Stille lässt ihm zu viel Zeit zum Grübeln — wehmütiger als sonst, hält sein Andenken fast ständig in der Hand.",
        beduerfnis: "Jemand, der ihm zuhört — oder verspricht, im Zweifel eine Nachricht heimzubringen."
      }
    ]
  },

  // Spanischer Hafen (Bibel 7.2). stimmung trägt die allgemeine Hafen-
  // Atmosphäre (früher im jetzt entfernten "hafen_anlegestelle"-Marker,
  // siehe CLAUDE.md-Changelog) - genau wie bei Grimsgate liegt sie hier auf
  // Szenen-Ebene, nicht an einem einzelnen Marker. uebergeordnetesZiel hält
  // fest, wofür die ganze Station eigentlich da ist (Hendriks Vorgabe).
  // Ghosts (Nachtrag, August 2026, Claude-Aufschlag/von Hendrik
  // freizugeben): plot-neutrale Statisten des Hafenviertels, bewusst
  // eigenständig von den bereits verankerten NPCs (Wundarzt/Soldaten/
  // Wachen) - ein koerperlicher Ghost (Mateo) für Proben, die einen
  // kräftigen Statisten brauchen.
  "7.1": {
    uebergeordnetesZiel: "Der Konflikt mit den Spaniern — Ezra rechtzeitig zum Arzt bringen, während Provokationen im Hafen echt genug sind, um eine Eskalation nachvollziehbar zu machen.", // Bibel 2.9
    stimmung: "Ein spanischer Hafen — Handelsschiffe liegen dicht an dicht am Kai, gestapelte Fässer und Ballen versperren stellenweise den Weg. Möwen kreischen über den Ständen der Fischer, fremde Zungen mischen sich ins allgemeine Stimmengewirr. Enge, verwinkelte Gassen ziehen sich vom Kai landeinwärts, dicht gedrängt mit niedrigen Häusern.",
    ghosts: [
      {
        name: "Rosa Vega",
        rolle: "Fischverkäuferin am Kai",
        verfassung: "Laut, geschäftstüchtig, feilscht mit jedem, der auch nur in die Nähe ihres Standes kommt.",
        beduerfnis: "Den Tagesfang loswerden, bevor er in der Hitze verdirbt."
      },
      {
        name: "Padre Anselmo",
        rolle: "Alter Priester auf seiner Runde durchs Viertel",
        verfassung: "Freundlich-distanziert, mustert Fremde mit stiller Neugier, ohne aufdringlich zu werden.",
        beduerfnis: "Ein Gespräch, das über Höflichkeiten hinausgeht — oder wenigstens eine kleine Spende für die Kirche."
      },
      {
        name: "Diego Ruiz",
        rolle: "Überlasteter Zollschreiber",
        verfassung: "Gehetzt, ein Papierstapel unterm Arm, hat für nichts Zeit außer seine Listen.",
        beduerfnis: "Dass ihn niemand aufhält — er ist ohnehin schon spät dran."
      },
      {
        name: "Constanza",
        rolle: "Bettlerin vor der Kirche",
        verfassung: "Ruhig, beobachtet mehr, als sie sagt, kennt jedes Gesicht im Viertel.",
        beduerfnis: "Eine Münze — oder einfach, dass man sie nicht übersieht."
      },
      {
        name: "Mateo",
        rolle: "Lastenträger am Kai",
        verfassung: "Breite Schultern, wortkarg, schleppt schwerste Fässer, als wären sie leer.",
        beduerfnis: "Der nächste Auftrag, der nächste Lohn — keine Zeit für Small Talk.",
        koerperlich: true
      }
    ]
  },

  // Schmugglernest (Bibel 7.2, 12.1). uebergeordnetesZiel hält fest, wofür
  // die Station da ist. Ghosts (Nachtrag, August 2026, Claude-Aufschlag/von
  // Hendrik freizugeben): plot-neutrale Statisten, passend sowohl fürs
  // Fischerdorf als auch die Höhlenstadt (Szenen-weit, nicht Marker-fest) -
  // ein koerperlicher Ghost (Boas) für Proben, die einen kräftigen
  // Statisten brauchen.
  "8.1": {
    uebergeordnetesZiel: "Einen Artefakt-Kenner im verborgenen Schmugglernest finden — auf Kosten von Ezra Coombes bester Überlebenschance (Bibel 12, \"moralische Umkehrung\").", // Bibel 2.9
    ghosts: [
      {
        name: "Perico",
        rolle: "Händler mit zwielichtiger Ware",
        verfassung: "Aalglatt, wechselt ständig den Standort, immer ein Auge auf mögliche Käufer.",
        beduerfnis: "Die Ware endlich loswerden, bevor unbequeme Fragen kommen."
      },
      {
        name: "Greta Vance",
        rolle: "Ehemalige Seefahrerin, jetzt an Land",
        verfassung: "Vernarbt, wortkarg, mustert jeden Neuankömmling erst lange, bevor sie überhaupt reagiert.",
        beduerfnis: "Respekt — und dass niemand nach ihrer Vergangenheit fragt."
      },
      {
        name: "Junger Nico",
        rolle: "Laufbursche zwischen den Ständen",
        verfassung: "Flink, neugierig, hört mehr mit, als ihm zusteht.",
        beduerfnis: "Ein paar Münzen für Botengänge — oder etwas Aufregendes zu erleben."
      },
      {
        name: "Boas",
        rolle: "Fassbinder am Rand der Höhlenstadt",
        verfassung: "Ruhig, kräftig, arbeitet unbeirrt weiter, egal was um ihn herum passiert.",
        beduerfnis: "Seine Arbeit erledigen — Ärger geht er lieber aus dem Weg.",
        koerperlich: true
      }
    ]
  },

  // Artefakthandel (Bibel 7.3). Ghosts (Nachtrag, August 2026, Claude-
  // Aufschlag/von Hendrik freizugeben): gleicher Golden-Lion-Crew-Pool wie
  // 2.1/3.1/5.1/6.1 (dieselbe Crew, kein Szenenwechsel des Schiffs selbst),
  // Verfassung an die angespannte Wartesituation vor dem Handelstreffen
  // angepasst - Rest der Szene noch Grundgerüst, siehe ORTE.handelstreffen.
  "9.1": {
    stimmung: "Windstille. Die Golden Lion liegt reglos auf spiegelglattem Wasser, kein Lufthauch in den Segeln. Harwick steht am Bug, den Blick unverwandt aufs offene Meer gerichtet — er wartet auf etwas, das er niemandem erklärt. Nebel zieht auf, verschluckt langsam den Horizont, dämpft jedes Geräusch. Die Anspannung an Bord ist förmlich zu greifen, noch bevor irgendjemand weiß, worauf.\n\nDann, fast lautlos, löst sich eine Silhouette aus dem Nebel: ein fremdartiges Schiff, ungewöhnliche Formen, fremde Segel — nichts, was der Crew vertraut vorkommt. An Bord sind Gestalten in merkwürdigen Rüstungen zu erkennen. Das Schiff hält direkt auf die Golden Lion zu.",
    ghosts: [
      {
        name: "Amos Hale",
        rolle: "Altgedienter Toppmann, seit 20 Jahren auf See",
        verfassung: "Ungewohnt still für seine Verhältnisse, mustert das fremde Schiff lange, bevor er überhaupt etwas sagt.",
        beduerfnis: "Seine Pfeife, seine Ruhe, und dass niemand ihn nach seiner Meinung zu Dingen fragt, die ihn nichts angehen."
      },
      {
        name: "Toby Rennick",
        rolle: "Grüner Rekrut, erste Fahrt",
        verfassung: "Blass, wagt kaum zu atmen, starrt hinüber zum fremden Schiff, als könnte allein das Hinsehen etwas auslösen.",
        beduerfnis: "Nicht als Landratte auffallen — und wenigstens einmal für etwas gelobt werden."
      },
      {
        name: "Corwin Ashby",
        rolle: "Abergläubischer Zimmermannsgehilfe",
        verfassung: "Sieht in der Stille auf dem Wasser ein schlechtes Omen, murmelt so leise Beschwörungen, dass ihn kaum jemand hört.",
        beduerfnis: "Dass seine Warnungen ernst genommen werden — oder wenigstens niemand ihn dafür auslacht."
      },
      {
        name: "Jonas Teague",
        rolle: "Verschuldeter Kartenspieler",
        verfassung: "Sogar er hat für den Moment die Karten weggesteckt, die Hand unruhig am Gürtel.",
        beduerfnis: "Irgendwo schnell an Münzen kommen, bevor die Sache eskaliert.",
        koerperlich: true
      },
      {
        name: "Edmund Grey",
        rolle: "Heimwehkranker Familienvater",
        verfassung: "Denkt sichtbar an seine Familie, während er gebannt zum fremden Schiff hinüberblickt.",
        beduerfnis: "Jemand, der ihm zuhört — oder verspricht, im Zweifel eine Nachricht heimzubringen."
      }
    ]
  },

  // Die Flucht (Bibel 7.4). Ghosts: gleicher Golden-Lion-Crew-Pool wie
  // 2.1/3.1/5.1/6.1/9.1, Verfassung an die Verfolgung bei Nacht angepasst
  // (Claude-Aufschlag, von Hendrik freizugeben).
  "10.1": {
    uebergeordnetesZiel: "Der spanischen Verfolgung entkommen, unentdeckt die Riffinsel erreichen.", // Bibel 2.9
    stimmung: "Kein Licht mehr an Bord, kein lauter Befehl mehr. Die Golden Lion läuft mit vollen Segeln durch Nebel und Dunkelheit, während irgendwo hinter ihr, kaum zu unterscheiden vom Nebel selbst, der Verfolger bleibt. Jedes Knarren des Rumpfs klingt lauter als sonst. Niemand spricht mehr als nötig — und wenn, dann geflüstert.",
    ghosts: [
      {
        name: "Amos Hale",
        rolle: "Altgedienter Toppmann, seit 20 Jahren auf See",
        verfassung: "Selbst er ist für einmal ganz still, arbeitet lautlos und routiniert an den Segeln — kein Spruch, kein Kommentar.",
        beduerfnis: "Seine Pfeife, seine Ruhe, und dass niemand ihn nach seiner Meinung zu Dingen fragt, die ihn nichts angehen."
      },
      {
        name: "Toby Rennick",
        rolle: "Grüner Rekrut, erste Fahrt",
        verfassung: "Zitternde Hände an den Leinen, presst die Lippen zusammen, um nicht laut zu werden — die Angst ist ihm deutlich anzusehen.",
        beduerfnis: "Nicht als Landratte auffallen — und wenigstens einmal für etwas gelobt werden."
      },
      {
        name: "Corwin Ashby",
        rolle: "Abergläubischer Zimmermannsgehilfe",
        verfassung: "Murmelt lautlos, nur die Lippen bewegen sich — für ihn ist die Verfolgung längst mehr als nur ein Kriegsschiff.",
        beduerfnis: "Dass seine Warnungen ernst genommen werden — oder wenigstens niemand ihn dafür auslacht."
      },
      {
        name: "Jonas Teague",
        rolle: "Verschuldeter Kartenspieler",
        verfassung: "Die Karten bleiben stecken, wo sie sind — arbeitet stattdessen verbissen und überraschend zuverlässig mit.",
        beduerfnis: "Irgendwo schnell an Münzen kommen, bevor die Sache eskaliert.",
        koerperlich: true
      },
      {
        name: "Edmund Grey",
        rolle: "Heimwehkranker Familienvater",
        verfassung: "Presst sein Andenken so fest in der Hand, dass die Fingerknöchel weiß werden, arbeitet aber lautlos weiter mit.",
        beduerfnis: "Jemand, der ihm zuhört — oder verspricht, im Zweifel eine Nachricht heimzubringen."
      }
    ]
  },

  // Riffinsel (Bibel 7.4, Folgeszene zu 10.1). Ghosts: gleicher Pool,
  // Verfassung jetzt auf Erschöpfung/Erleichterung nach der Flucht
  // umgestellt (Claude-Aufschlag, von Hendrik freizugeben).
  "11.1": {
    uebergeordnetesZiel: "Die Insel absuchen — Wasser, Ausbesserungsmaterial und Sicherheit finden —, bevor die Zeit ausgeht (SL-Ermessen: die Stimmung kippt nach und nach, dann vertreibt ein Schwarm Affen die Gruppe, siehe ORTE.riffstrand, \"Die Affen greifen an\").", // Bibel 2.9
    stimmung: "Erschöpfung, so weit man hinsieht — aber auch echte Erleichterung. Die Golden Lion liegt vor Anker in einer kleinen, vom Riff geschützten Lagune, der Himmel hellt sich auf. Niemand redet über die vergangene Nacht, noch nicht. Stattdessen macht sich die Crew an die Arbeit: Fässer werden an Land gebracht, kleine Gruppen brechen auf, um die Insel abzusuchen.",
    ghosts: [
      {
        name: "Amos Hale",
        rolle: "Altgedienter Toppmann, seit 20 Jahren auf See",
        verfassung: "Wieder ganz der Alte, kommentiert die durchwachte Nacht trocken: „Hab Schlimmeres gesehen. Meistens.“",
        beduerfnis: "Seine Pfeife, seine Ruhe, und dass niemand ihn nach seiner Meinung zu Dingen fragt, die ihn nichts angehen."
      },
      {
        name: "Toby Rennick",
        rolle: "Grüner Rekrut, erste Fahrt",
        verfassung: "Sichtlich erleichtert, fast euphorisch — seine erste echte Verfolgungsjagd überstanden, erzählt jedem in Hörweite davon.",
        beduerfnis: "Nicht als Landratte auffallen — und wenigstens einmal für etwas gelobt werden."
      },
      {
        name: "Corwin Ashby",
        rolle: "Abergläubischer Zimmermannsgehilfe",
        verfassung: "Sieht in der sicher erreichten Insel ein gutes Omen für einmal — deutlich entspannter, murmelt trotzdem sicherheitshalber weiter.",
        beduerfnis: "Dass seine Warnungen ernst genommen werden — oder wenigstens niemand ihn dafür auslacht."
      },
      {
        name: "Jonas Teague",
        rolle: "Verschuldeter Kartenspieler",
        verfassung: "Schon wieder mit den Karten in der Hand, sucht Mitspieler für die Wartezeit am Strand.",
        beduerfnis: "Irgendwo schnell an Münzen kommen, bevor die Sache eskaliert.",
        koerperlich: true
      },
      {
        name: "Edmund Grey",
        rolle: "Heimwehkranker Familienvater",
        verfassung: "Erleichtert, aber sichtlich mitgenommen — sitzt eine Weile einfach nur da, das Andenken in der Hand, bevor er sich wieder an die Arbeit macht.",
        beduerfnis: "Jemand, der ihm zuhört — oder verspricht, im Zweifel eine Nachricht heimzubringen."
      }
    ]
  }
};
