/* ==========================================================
   DIE HARTSKLEIN-SCHLEUSE - Szenen (Spielerkarte und Regie)
   ----------------------------------------------------------
   Eigene deutsche Fassung nach "Come Drown With Me" (One Shots
   of the Reikland, S. 4-9). Kein Buchtext. Regelwerk: Warhammer
   Fantasy (4. Ed.).

   BILDER: Karte, Grundrisse und die beiden Illustrationen stammen
   aus dem PDF (Hendriks Entscheidung vom 28.11.2026: "ich moechte
   die Bilder extrahiert haben, damit diese genutzt werden"). Die
   Karte ist die Seite 7 des Abenteuers, in hoher Aufloesung neu
   gerendert - einzeln aus dem PDF gezogen fehlten ihr Ebenen (das
   Haus). Die Ausschnitte sind aus derselben Seite geschnitten.

   Alle Kennungen tragen das Praefix "hk", damit nichts mit einem
   anderen Abenteuer in ORTE oder SZENEN_REGIE zusammenstoesst.

   EINE Szene, flach wie Grimsgate: Die Karte ist der Hintergrund,
   jeder Raum ein eigener Marker auf seiner Nummer im Plan. Das Grab
   traegt "verborgen: true" und ist zu Beginn ausgeblendet, bis die
   Spielleitung es aufdeckt (js/abenteuer.js, markerVerborgen) -
   sonst verriete die Karte die Loesung des Abenteuers.

   Nicht als Marker angelegt: Wehr (1), Schleusentore (2) und
   Geldkammer (5). Zu ihnen hat das Abenteuer keinen Inhalt; die
   Tore gehoeren zur Schleuse.

   Angemeldet ueber js/abenteuer.js - die Datei braucht deshalb
   KEINEN Eintrag in MAP_REGISTRY oder getAllSceneEntries().
   ========================================================== */

abenteuerSzenenRegistrieren('hartsklein', {
  'hk1.1': {
    label: 'Die Hartsklein-Schleuse',
    background: 'images/hartsklein_karte.webp',
    markers: [
      {
        id: 'hk_schleuse',
        top: 65, left: 47,
        title: 'Die Schleuse',
        desc: 'Eine gemauerte Kammer im Kanal, an beiden Enden ein Tor aus schwerem, nassem Holz mit einem Rad zum Kurbeln. Das Wasser darin steht trüb und still. Nebel liegt so dicht über dem Kanal, dass man das nächste Tor nur ahnt.',
        img: 'images/interior_hk_schleuse.webp',
        // Die Spielleitung schaltet um, sobald die Toten aus dem Wasser
        // steigen (Teil 1). Vorher verraet das Bild nichts.
        variants: {
          ruhig: { label: 'Ruhig (vor dem Angriff)', img: 'images/interior_hk_schleuse.webp' },
          untote: {
            label: 'Die Toten steigen auf',
            img: 'images/interior_hk_untote.webp',
            desc: 'Aus dem Kanal ziehen sich Gestalten die Mauer hinauf. Ledrige, eingeschrumpfte Haut, behängt mit Wasserkraut und Schlamm. Grobe Felle, Waffen mit fremden Mustern. Es werden mehr.'
          }
        }
      },
      {
        id: 'hk_flur',
        top: 21.5, left: 48.5,
        title: 'Flur und Treppe',
        desc: 'Ein enger Flur mit knarrenden Dielen. Eine Holztreppe führt nach oben, darunter ein dunkler Winkel. An der Wand hängt ein Spiegel in einem verzierten Rahmen.',
        img: 'images/interior_hk_haus.webp'
      },
      {
        id: 'hk_buero',
        top: 29.3, left: 47.9,
        title: 'Das Büro',
        desc: 'Eine winzige Schreibstube, gebaut für jemanden von halber Menschengröße. Ein niedriges Pult, Kassenbücher, ein Tintenfass. Die grüne Wandfarbe war einmal fein.',
        img: 'images/interior_hk_erdgeschoss.webp'
      },
      {
        id: 'hk_zelle',
        top: 27.4, left: 44.3,
        title: 'Die Zelle',
        desc: 'Eine schmale Kammer hinter einer breiten Holztür. In der Tür ein kleines Sichtfenster mit Eisenstäben, so hoch angebracht, dass ein Halbling sich strecken muss.',
        img: 'images/interior_hk_erdgeschoss.webp'
      },
      {
        id: 'hk_wohnstube',
        top: 18.9, left: 41.3,
        title: 'Die Wohnstube',
        desc: 'Ein warm eingerichtetes Zimmer: Sessel mit Häkeldecken, ein Kamin, ein niedriger Tisch voller Pfeifenzubehör. Es riecht nach kaltem Tabak.',
        img: 'images/interior_hk_erdgeschoss.webp'
      },
      {
        id: 'hk_vorrat',
        top: 13.9, left: 49.3,
        title: 'Die Vorratskammer',
        desc: 'Regale bis unter die Decke: Würste, Schinken, Säcke voller Gemüse, Gläser mit Eingemachtem. Für einen einzelnen Halbling reicht das einen Winter lang.',
        img: 'images/interior_hk_erdgeschoss.webp'
      },
      {
        id: 'hk_garten',
        top: 22.9, left: 56.3,
        title: 'Der Garten',
        desc: 'Ein ummauerter Garten hinter dem Haus. Gepflegte Beete, Kohl und Bohnen, ein Pfad aus Trittsteinen. Über allem liegt der Nebel.',
        img: 'images/interior_hk_erdgeschoss.webp'
      },
      {
        id: 'hk_salon',
        top: 26.6, left: 76.5,
        title: 'Der Salon',
        desc: 'Das größte Zimmer im Obergeschoss. Polstermöbel, Teppiche, an der Wand eine aufwendige Uhr mit einer derben Szene als Schmuck. Von hier führt eine Wendeltreppe in den Turm.',
        img: 'images/interior_hk_obergeschoss.webp'
      },
      {
        id: 'hk_schlafzimmer',
        top: 14.1, left: 72.3,
        title: 'Das Schlafzimmer',
        desc: 'Ein kleines Bett mit dicker Daunendecke, ein Nachttisch, ein Waschkrug.',
        img: 'images/interior_hk_obergeschoss.webp'
      },
      {
        id: 'hk_kueche',
        top: 13.9, left: 79,
        title: 'Die Küche',
        desc: 'Ein gemauerter Herd, Töpfe und Pfannen an Haken, an der Wand eine Reihe blank geputzter Löffel und Kellen. Auf dem Tisch Teig unter einem Tuch.',
        img: 'images/interior_hk_obergeschoss.webp'
      },
      {
        id: 'hk_turm',
        top: 32.1, left: 92.8,
        title: 'Der Wachturm',
        desc: 'Ein enges Turmzimmer über einer Wendeltreppe. Ringsum Fenster, von denen aus man den Kanal in beide Richtungen sehen könnte, wäre da nicht der Nebel.',
        img: 'images/interior_hk_haus.webp'
      },
      {
        id: 'hk_grab',
        top: 43, left: 19,
        title: 'Unter dem Haus',
        // Zu Beginn ausgeblendet. Aufdecken, sobald die Gruppe den Boden
        // unter der Treppe aufgerissen hat (ORTE.hk_flur, "Der Boden").
        verborgen: true,
        desc: 'Unter den Dielen liegen staubige Steinplatten. Eine davon ist größer als die anderen und hat zwei eiserne Griffe. Darunter windet sich eine schmale Treppe in die Dunkelheit.',
        img: 'images/interior_hk_grab.webp'
      }
    ]
  }
});
