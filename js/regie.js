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
    interaktionen: {}
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
        nichtInSzenen: ["3.1"], // setzt voraus, dass Tom entspannt am Ruder steht - im Sturm kämpft er laut Szenentext mit dem Ruder
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
        nichtInSzenen: ["3.1"], // im Sturm hält Tom das Ruder selbst mit beiden Händen fest - er gibt es nicht kurz ab
        details: "Läuft ein Spieler los (z.B. wegen des Knoten-Streichs) und bleiben andere zurück, bittet Tom beiläufig einen zufälligen der Verbliebenen, kurz zu übernehmen — und verschwindet dann selbst.\n\n„Halt mal kurz, ja? Nur geradeaus. Bin gleich wieder da.“\n\n— Greift sofort zu, Seefahrt-Probe gelingt (bei Körper ≤2 zusätzlich Körper-Probe nötig, beide müssen gelingen) → Ruf-Plus bei Tom\n— Greift zu, Probe(n) misslingen, Kontrolle verloren (Ruder schlägt aus o.ä.) → Ruf-Minus bei Tom\n— Lehnt ab / zögert → neutral, kein Risiko",
        trigger: [
          { id: "angefragt", label: "Tom fragt nach Ruder-Übernahme", info: "Tom bittet beiläufig einen zufälligen der Verbliebenen: „Halt mal kurz, ja? Nur geradeaus. Bin gleich wieder da.“ — und verschwindet selbst." },
          { id: "angenommen_erfolg", label: "Angenommen, Probe(n) erfolgreich → Ruf-Plus", info: "Greift sofort zu, Seefahrt-Probe gelingt (bei Körper ≤2 zusätzlich Körper-Probe nötig, beide müssen gelingen) → Ruf-Plus bei Tom." },
          { id: "angenommen_misserfolg", label: "Angenommen, Kontrolle verloren → Ruf-Minus", info: "Greift zu, Probe(n) misslingen, Kontrolle verloren (Ruder schlägt aus o.ä.) → Ruf-Minus bei Tom." },
          { id: "abgelehnt", label: "Abgelehnt / gezögert → neutral", info: "Lehnt ab oder zögert → neutral, kein Risiko." }
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
        nichtInSzenen: ["3.1"], // Ruhiges Gespräch - passt nicht zum Sturm, in dem laut Szenentext alle mit den Segeln kämpfen
        details: "Fragt man Francesco gezielt nach jemandem, gibt er seine ehrliche Einschätzung — nie von sich aus, nur auf Nachfrage.\n\n— Harwick: warm, respektvoll, fast bewundernd\n— Cormac: freundlich-distanziert, \"zu streng\"\n— Wat: reserviert, spürbares Unbehagen, hält nicht viel von ihm\n— Tom: \"Der ehrlichste Betrüger, den er kennt\" — durchschaut ihn, mag ihn trotzdem\n— Josiah: \"Eine gute Seele\" — schlägt vor, ihn in der Kombüse zu besuchen, falls die Spieler ihn noch nicht kennen (organische Weiterleitung)\n— Dirk: \"Fast mit dem Schiff verwachsen\", lieber in Gesellschaft von Kanonen/Werkzeug als Menschen — bester Ansprechpartner bei Reparaturen, beeilt sich dabei nur, um die Spieler wieder loszuwerden",
        trigger: [
          { id: "gefragt_harwick", label: "Nach Harwick gefragt", info: "Harwick: warm, respektvoll, fast bewundernd." },
          { id: "gefragt_cormac", label: "Nach Cormac gefragt", info: "Cormac: freundlich-distanziert, \"zu streng\"." },
          { id: "gefragt_wat", label: "Nach Wat gefragt", info: "Wat: reserviert, spürbares Unbehagen, hält nicht viel von ihm." },
          { id: "gefragt_tom", label: "Nach Tom gefragt", info: "Tom: \"Der ehrlichste Betrüger, den er kennt\" — durchschaut ihn, mag ihn trotzdem." },
          { id: "gefragt_josiah", label: "Nach Josiah gefragt (Kombüse-Hinweis gegeben)", info: "Josiah: \"Eine gute Seele\" — schlägt vor, ihn in der Kombüse zu besuchen, falls die Spieler ihn noch nicht kennen." },
          { id: "gefragt_dirk", label: "Nach Dirk gefragt", info: "Dirk: \"Fast mit dem Schiff verwachsen\", lieber in Gesellschaft von Kanonen/Werkzeug als Menschen — bester Ansprechpartner bei Reparaturen." }
        ]
      }
    }
  },

  "bug": {
    personen: "Ned Sharpe · Ezra Coombe",
    kurz: "Unterhalten sich über den Bordellbesuch. Reaktion hängt vom Bordell-Ausgang des jeweiligen Spielers ab (vier Varianten).",
    ortHinweis: "Beziehen sich konkret auf den Raubein-Vorfall im Bordell (der raue Gast, Constance' Reaktion) — kein allgemeines, unverfängliches Geplauder.",
    interaktionen: {
      "bordell_nachklang": {
        title: "Ned & Ezra — Nachklang aus dem Bordell",
        kurz: "Reaktion variiert je nachdem, wie der Spieler die Raubein-Szene im Bordell gelöst hat (oder ob er überhaupt dort war).",
        details: "Ned und Ezra reden über den Bordellbesuch, konkret über den Vorfall mit dem groben Gast und Constance' Reaktion darauf. Erkennen einen vorbeikommenden Spieler, falls der dort war — mit deutlich unterschiedlichem Ton je nach Ausgang:\n\n— War dort, hat physisch eingegriffen (Raubein-Szene, Bordell): warm, fast bewundernd — erzählen die Geschichte nochmal nach, mit kleinen Übertreibungen\n— War dort, hat sozial deeskaliert: anerkennend, ruhiger, würdigend, weniger überschwänglich\n— War dort, hat nicht eingegriffen: erkennen den Spieler, aber kühler — knapper, leicht distanzierter Kommentar, kein offener Vorwurf\n— War nicht dort: Ned wird sichtlich unangenehm berührt, wechselt das Thema — reine Verlegenheit, keine Folge",
        trigger: [
          { id: "physisch", label: "Spieler hatte Raubein-Szene physisch gelöst → warm/bewundernd", info: "War dort, hat physisch eingegriffen: warm, fast bewundernd — erzählen die Geschichte nochmal nach, mit kleinen Übertreibungen." },
          { id: "sozial", label: "Spieler hatte sozial deeskaliert → anerkennend", info: "War dort, hat sozial deeskaliert: anerkennend, ruhiger, würdigend, weniger überschwänglich." },
          { id: "nicht_eingegriffen", label: "War dort, nicht eingegriffen → kühl/distanziert", info: "War dort, hat nicht eingegriffen: erkennen den Spieler, aber kühler — knapper, leicht distanzierter Kommentar, kein offener Vorwurf." },
          { id: "nicht_dort", label: "War nicht dort → Ned unangenehm, Themawechsel", info: "War nicht dort: Ned wird sichtlich unangenehm berührt, wechselt das Thema — reine Verlegenheit, keine Folge." }
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
      }
    },
    interaktionen: {
      "dirk_vertrauen": {
        title: "Dirk van Hoorn — Vertrauen durch Fachkenntnis",
        kurz: "Arbeitet allein, will nicht gestört werden. Nur echte Mechanik-/Handwerks-Probe oder kaputtes Objekt weckt Interesse — mit Payoff NACH der Sturm-Szene.",
        nichtInSzenen: ["3.1"],
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
        nichtInSzenen: ["3.1"], // Kater-Szene passt nicht zum Sturm-Chaos mit der losgerissenen Kanone am selben Ort
        details: "Die Trewin-Zwillinge sind hier anzutreffen, ihr Zustand hängt vom Ausgang des Trinkspiels in der Taverne ab:\n\n— Gewonnen (Spieler hat sie unter den Tisch gesoffen): über Kreuz übereinander in einer Hängematte verkeilt, stöhnen vor Übelkeit, zanken sich gegenseitig an, dass der andere Platz machen soll — können sich kaum bewegen\n— Verloren: triumphierend, spöttisch gegenüber dem Spieler\n— Nie angetreten: neutral, ignorieren den Spieler weitgehend",
        trigger: [
          { id: "gewonnen", label: "Spieler hat Zwillinge besiegt → Kater-Szene", info: "Gewonnen (Spieler hat sie unter den Tisch gesoffen): über Kreuz übereinander in einer Hängematte verkeilt, stöhnen vor Übelkeit, zanken sich, dass der andere Platz machen soll." },
          { id: "verloren", label: "Spieler hat verloren → triumphierend/spöttisch", info: "Verloren: triumphierend, spöttisch gegenüber dem Spieler." },
          { id: "nie_angetreten", label: "Nie angetreten → neutral", info: "Nie angetreten: neutral, ignorieren den Spieler weitgehend." }
        ]
      }
    }
  },

  "werkstatt": {
    personen: "Schiffszimmermann · weitere Handwerker (namenlos)",
    kurz: "Ordentlicher als der Rest des Schiffs. Erster Spieler im Raum wird direkt eingespannt — Mechanik-Probe, nur die Extreme wirken sich auf den Ruf aus.",
    ortHinweis: "Mehrere gelernte Handwerker bei der Arbeit, spürbar ordentlicher als sonst auf dem Schiff. Gute Wahrnehmung oder Mechanik erkennt: keine einfachen Matrosen, sondern Leute vom Fach. Namenlose Crewmitglieder — bewusst kein Wiedererkennungs-Bogen, kein späterer Zahltag (anders als bei Dirk auf dem Batteriedeck).",
    interaktionen: {
      "eingespannt": {
        title: "Erster Spieler im Raum — direkt eingespannt",
        kurz: "Nur der erste Spieler, der den Raum betritt. Mechanik-Probe: Guter Erfolg = Ruf-Plus, Misserfolg = Ruf-Malus, beide mittleren Bänder neutral.",
        details: "Der erste Spieler, der die Werkstatt betritt, wird ohne Umschweife eingespannt:\n\n„Schnapp dir den Fuchsschwanz und gib mir das auf 30 Zoll raus.“\n\n(Fuchsschwanz = Handsäge, benannt nach der spitz zulaufenden Blattform.) Der Mann am Tisch reicht ein Kanthol, schaut kaum auf, bleibt bei seiner eigenen Arbeit.\n\nMechanik-Probe:\n— Guter Erfolg: Schnitt exakt auf Maß, kurzes Nicken → Ruf-Gewinn\n— Normaler Erfolg: brauchbar, kein Kommentar → neutral\n— Schlechter Erfolg: sichtbar daneben, wortlos beiseitegelegt → neutral\n— Misserfolg: Kanthol splittert oder grob falsches Maß — einziger Moment, in dem er wirklich aufsieht → Ruf-Malus\n\nNachkommende Spieler bekommen keine eigene Aufgabe. Auf Nachfrage: „Wir kommen zurecht, geh zu Cormac, wenn du Arbeit suchst.“",
        trigger: [
          { id: "erster_eingespannt", label: "Erster Spieler eingespannt", info: "Der erste Spieler, der die Werkstatt betritt, wird ohne Umschweife eingespannt: „Schnapp dir den Fuchsschwanz und gib mir das auf 30 Zoll raus.“ Der Mann am Tisch reicht ein Kanthol, schaut kaum auf." },
          { id: "guter_erfolg", label: "Guter Erfolg → Ruf-Plus", info: "Guter Erfolg: Schnitt exakt auf Maß, kurzes Nicken → Ruf-Gewinn." },
          { id: "normaler_erfolg", label: "Normaler Erfolg → neutral", info: "Normaler Erfolg: brauchbar, kein Kommentar → neutral." },
          { id: "schlechter_erfolg", label: "Schlechter Erfolg → neutral", info: "Schlechter Erfolg: sichtbar daneben, wortlos beiseitegelegt → neutral." },
          { id: "misserfolg", label: "Misserfolg → Ruf-Malus", info: "Misserfolg: Kanthol splittert oder grob falsches Maß — einziger Moment, in dem er wirklich aufsieht → Ruf-Malus. Nachkommende Spieler bekommen keine eigene Aufgabe: „Wir kommen zurecht, geh zu Cormac, wenn du Arbeit suchst.“" }
        ]
      }
    }
  },

  "unterdeck": {
    personen: "Crew (namenlos, rotierend schlafend)",
    kurz: "Der einzige ruhige Ort auf dem Schiff — als Falle angelegt. Durchqueren verlangt Geschick-/Geheim-Probe, Misserfolg kostet Ruf bei allen Anwesenden.",
    ortHinweis: "Enge Reihen fester Kojen (bewusst KEINE Hängematten), Vorhänge für ein wenig Privatsphäre — mehr Komfort, als man auf einem Schiff erwarten würde. Crew schläft in Schichten, rotierend, während andere Wache stehen. Wirkt wie ein Fettnäpfchen-Ort, ist aber außer im Misserfolgsfall folgenlos.",
    interaktionen: {
      "durchqueren": {
        title: "Durchqueren des Unterdecks",
        kurz: "Geschick- oder Geheim-Probe. Erfolg = nichts passiert, Misserfolg = Gemecker + Ruf-Malus für alle anwesenden Spieler.",
        details: "Spieler, die das Unterdeck durchqueren, während dort geschlafen wird, würfeln auf Geschick oder Geheim.\n\n— Erfolg: nichts, unauffällig durch\n— Misserfolg: Gemecker von den Gestörten, Ruf-Malus für alle anwesenden Spieler (nicht nur für den Verursacher)",
        trigger: [
          { id: "erfolg", label: "Erfolg → unauffällig durch", info: "Erfolg: nichts, unauffällig durch." },
          { id: "misserfolg", label: "Misserfolg → Gemecker, Ruf-Malus für alle Anwesenden", info: "Misserfolg: Gemecker von den Gestörten, Ruf-Malus für alle anwesenden Spieler (nicht nur für den Verursacher)." }
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
      }
    },
    interaktionen: {
      "blinder_passagier": {
        title: "Der blinde Passagier — Fund im Frachtraum (Abschnitt 11, Pfad A)",
        kurz: "Kein Wurf nötig — aktive Suche bei Variante \"Standard\" findet ihn automatisch. Vier mögliche Folgen je nach Spielerverhalten danach.",
        nichtInSzenen: ["3.1"], // T+30 (spätestens Wat) liegt vor T+60 (Sturm) - Subplot ist bis dahin immer durch
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
        nichtInSzenen: ["3.1"], // dito - Frachtraum-Varianten spielen im Sturm keine Rolle mehr, siehe "wassereinbruch_sturm"
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
      }
    }
  },

  "kombuese": {
    personen: "Josiah Pryce",
    kurz: "Herzlicher Empfang für jeden, unabhängig vom Ruf. Bewusst kein aktiver Wunsch, keine Ruf-Mechanik — reiner Charakter zum Spielen.",
    ortHinweis: "Anlaufstelle für den blinden Passagier (siehe Frachtraum-Interaktion „Der blinde Passagier“ und Abschnitt 11).",
    interaktionen: {
      "standardverhalten": {
        title: "Josiah — Herzlicher Empfang (kein aktiver Wunsch)",
        kurz: "Begrüßt jeden herzlich, unabhängig vom Ruf oder davon, ob der Spieler freiwillig/gepresst an Bord ist. Bewusst keine Ruf-Mechanik, kein Trigger-Automat.",
        details: "Josiah begrüßt jeden, der die Kombüse betritt, herzlich — unabhängig vom Ruf, unabhängig davon, ob der Spieler freiwillig oder durch Erpressung/Gewalt an Bord ist. Bietet von sich aus etwas zu essen oder Ähnliches an. Beantwortet Fragen offen und ehrlich.\n\nSieht in jedem das Gute — redet über niemanden schlecht, egal wer gerade Zielscheibe ist. Lästern Spieler vor ihm über irgendjemanden an Bord, widerspricht er warm und automatisch, nie belehrend, einfach weil er es so empfindet.\n\nBewusst kein aktiver Wunsch und keine Ruf-Mechanik hier — anders als Tom, Dirk oder die Werkstatt. Reiner Charakter zum Spielen, kein Trigger-Automat.\n\nSein großer Moment: die Wat-Konfrontationsszene (Frachtraum-Interaktion „Der blinde Passagier“, Pfad B) — kommt schwer atmend an Deck (die Kombüse liegt tief unten, er ist kein schneller Mann) und hält Wat auf.",
        trigger: []
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
  }
};
