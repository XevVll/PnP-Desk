/* ==========================================================
   DIE HARTSKLEIN-SCHLEUSE - Regie (Orte, Interaktionen, Szenenziel)
   ----------------------------------------------------------
   Eigene deutsche Fassung nach "Come Drown With Me" (One Shots of
   the Reikland, S. 4-9). Kein Buchtext: Ablauf, Proben und Werte
   sind Spielregeln und uebernommen, die Saetze sind neu geschrieben.

   Wird NACH js/regie.js geladen und traegt in dessen ORTE und
   SZENEN_REGIE ein. Jede Kennung beginnt mit "hk_" bzw. "hk", ein
   Zusammenstoss mit Korsaren bricht deshalb sofort ab, statt still
   einen Ort zu ueberschreiben.

   SCHREIBWEISE DER PROBEN: deutscher Fertigkeitsname aus
   js/wfrp_daten.js, dann die Schwierigkeit aus js/wfrp_regelwerk.js,
   z. B. "Selbstbeherrschung, Herausfordernd (+0)". Eigennamen der
   Spielwelt bleiben im Original (Hendriks Regel vom 26.11.2026):
   Kurgorn Three-Eyes, Unberogen, Black Fire Pass, Band of the
   Three-Eyed, die Zaubernamen.

   REGELN, DIE DAS PNP-DESK NOCH NICHT RECHNET (Zustaende, Furcht,
   Ertrinken, Zauber), stehen als Text am Trigger, mit Seitenverweis
   auf das Regelwerk (englische Ausgabe). Gebaut werden sie in den
   Etappen B und C (WFRP-REGELWERK.md).
   ========================================================== */

(function () {
  function eintragen(ziel, neu, name) {
    Object.keys(neu).forEach(function (k) {
      if (ziel[k]) throw new Error('Hartsklein: ' + name + '["' + k + '"] gibt es schon.');
      ziel[k] = neu[k];
    });
  }

  /* ---------- Die Figuren, einmal geschrieben ----------
     Sie stehen an mehreren Orten. Zwei Abschriften derselben Werte
     laufen auseinander - deshalb hier einmal und dort nur verwiesen. */
  var HENRIETTA = {
    name: 'Henrietta Garland',
    rolle: 'Schleusenwärterin, Halbling (Messing 5)',
    verfassung: 'Weit über neunzig und damit für einen Halbling nur „in den Jahren“. Gebückt, kaum drei Fuß groß mit Hut. Redet ohne Punkt und Komma, hört aber genau zu. Herzlich, gastfreundlich, raucht Pfeife.',
    beduerfnis: 'Ihr Haus, ihr Garten, ihre Pasteten — und dass das alles hier sofort aufhört.',
    wfrp: {
      profil: { b: 3, kg: 25, bf: 45, st: 28, wi: 31, i: 34, gw: 25, gs: 35, 'in': 45, wk: 35, ch: 45, lep: 9 },
      eigenschaften: 'Größe (Klein), Fernkampf (Schleuder) +7',
      fertigkeiten: 'Bestechen 55, Tratschen 65, Wahrnehmung 44, Fernkampf (Schleuder) 75',
      besitz: 'Pfeife und Tabak, Schleuder mit 12 Bleikugeln',
      besonderes: 'Trifft mit der Schleuder sicher, hält einen langen Kampf aber nicht durch.'
    }
  };
  var TOTE = {
    name: 'Die Toten aus dem Kanal',
    rolle: 'Zombies, alte Unberogen-Krieger',
    verfassung: 'Ledrige, eingeschrumpfte Haut, behängt mit Wasserkraut und Schlamm. Grobe Felle, Waffen mit fremden Mustern. Langsam, aber es werden immer mehr.',
    beduerfnis: 'Die Lebenden.',
    wfrp: {
      profil: { b: 4, kg: 15, bf: '', st: 30, wi: 30, i: 5, gw: 10, gs: 15, 'in': '', wk: '', ch: '', lep: 12 },
      eigenschaften: 'Konstrukt, Dunkelsicht, Furcht 2, Schmerzfrei, Untot, Instabil, Waffe +7',
      besonderes: 'Werte aus dem Regelwerk, S. 328 (das Abenteuer nennt keine eigenen).'
    }
  };
  var RABEN = {
    name: 'Die Rabenschar',
    rolle: 'Ausgeburt von Kurgorns Zorn',
    verfassung: 'Große Raben, wo die Augen sein müssten, flackern kalte blaue Flammen. Jeder von ihnen starrt den an, der zu ihnen hinsieht.',
    beduerfnis: 'Wachen. Sie greifen nicht an, solange niemand sie angreift — außer im Garten.',
    wfrp: {
      profil: { b: 2, kg: 25, bf: '', st: 6, wi: 15, i: 25, gw: 40, gs: '', 'in': 15, wk: 20, ch: 15, lep: 10 },
      eigenschaften: 'Furcht 2, Fliegen 150, Schreckhaft, Schwarm, Waffe (Schnabel und Krallen) +1',
      besonderes: 'Wer durch sie mindestens 1 LeP verliert, versteht und spricht für den Rest des Abenteuers einfaches Klassisch. Vernichtet oder vertrieben, sammelt sich die Schar nach ein paar Minuten neu, sobald niemand hinsieht.'
    }
  };
  var KURGORN = {
    name: 'Kurgorn Three-Eyes',
    rolle: 'Halbtoter Häuptling der Unberogen',
    verfassung: 'Gut zwei Meter groß, schwarze ledrige Haut straff über den Knochen, in den Augenhöhlen himmelblaue Flammen. Rüstung und Waffen von Alter zerfressen. Kaum noch bei Verstand, aber verschlagen und mächtig — er hat das Haus aus der Welt gerissen.',
    beduerfnis: 'Weiterschlafen. Vorher Rache für sein geflutetes Grab, oder etwas, das ihn besänftigt. Böse ist er nicht, nur aufgeweckt.',
    wfrp: {
      profil: { b: 4, kg: 75, bf: '', st: 40, wi: 50, i: 30, gw: 30, gs: 30, 'in': 45, wk: 55, ch: 25, lep: 19 },
      eigenschaften: 'Rüstung 3, Champion, Dunkelsicht, Furcht 3, Schmerzfrei, Zauberkundig (Nekromantie), Untot, Waffe (Schwert) +8',
      zauber: 'Reanimate, Screaming Skull, Vanhel’s Call (Nekromantie)',
      besitz: 'Band of the Three-Eyed: ein Reif aus Blei mit einem grünen Stein, darin ein Obsidiansplitter wie die Pupille eines dritten Auges. Wer ihn trägt, sieht die Winde der Magie (wie das Talent Zweites Gesicht) — und ist dabei blind. Kurgorn selbst nicht.'
    }
  };

  eintragen(ORTE, {

    /* ================= TEIL 1: EIN LANGER ABSCHIED ================= */
    'hk_schleuse': {
      personen: 'Henrietta Garland · die Toten aus dem Kanal',
      kurz: 'Hier beginnt alles. Die Gruppe verabschiedet sich, legt ab — und steht kurz darauf wieder an derselben Schleuse, auf der falschen Seite. Dann steigen die Toten aus dem Wasser, und der einzige Ausweg ist Henriettas Haus.',
      ortHinweis: 'Das Bild der Schleuse umschalten, sobald die Toten aufsteigen („Die Toten steigen auf“). Wer zu Fuß fliehen will, landet im Nebel nach ein paar Augenblicken wieder hier.',
      npcs: [HENRIETTA, TOTE],
      interaktionen: {
        'hk_abschied': {
          title: 'Ein langer Abschied',
          kurz: 'Kalter Nebelmorgen. Henrietta redet ohne Pause, schenkt eine Gemüsepastete und winkt der Gruppe hinterher.',
          details: 'Ein kalter, nebliger Morgen am Weissbruck-Kanal. Die Gruppe ist mit einem Lastkahn unterwegs und hat gerade die Hartsklein-Schleuse passiert. Wer Flussvolk ist, hat Henrietta vielleicht an den Toren geholfen; sie bedankt sich mit einer ihrer Gemüsepasteten für unterwegs.\n\nHenrietta redet. Viel. Über das Wetter, ihren Garten, über diese neumodischen Dampf-Schleusenräder, von denen sie gehört hat. Wer Geduld hat, merkt: Sie hört genauso aufmerksam zu, wie sie redet.\n\nSind die Tore offen, winkt sie dem Kahn fröhlich nach: „Kommt bald wieder!“ Nach wenigen Längen hat der Nebel sie und ihr Haus verschluckt.',
          trigger: [
            { id: 'nebelmorgen', label: 'Kalter Nebelmorgen an der Schleuse', info: 'Die Gruppe hat die Schleuse passiert und verabschiedet sich von Henrietta.' },
            { id: 'an_den_toren', label: 'Jemand hilft Henrietta an den Toren', info: 'Wer zupackt, macht ihr eine Freude — die Tore sind für den gebückten Halbling schwere Arbeit.' },
            { id: 'pastete', label: 'Henrietta schenkt eine Gemüsepastete', info: 'Für hilfsbereite Reisende, als Wegzehrung.' },
            { id: 'abschied', label: '„Kommt bald wieder!“ — der Nebel verschluckt das Haus', info: 'Sie winkt, bis der Nebel sie verschluckt. Die Gruppe richtet sich auf eine ruhige Fahrt ein.' }
          ]
        },
        'hk_zurueck': {
          title: 'Wieder an der Schleuse',
          kurz: 'Der Kahn stößt gegen ein Schleusentor, obwohl das nächste meilenweit entfernt sein müsste. Vorn schimpft Henrietta — und begreift dann, dass die Gruppe auf der falschen Seite steht.',
          details: 'Eine Weile gleitet der Kahn ruhig durch den Nebel. Dann ein Ruck: Der Bug ist gegen etwas gestoßen. Wer an Deck ist, sieht ein Schleusentor, der Bug hat eine Schramme abbekommen. Nur: Das nächste Tor liegt Meilen voraus.\n\nVon vorn kommt eine Stimme, die alle kennen. Henrietta, und sie ist wütend — sie schimpft über Tölpel, die ihr die Tore verbeulen, beschwört sämtliches Gebäck des Mootlands und bricht dann mitten im Satz ab.\n\nSie schaut zur anderen Seite der Schleuse, wo sie den Kahn eben noch verabschiedet hat, dann wieder auf die Gruppe, die unmöglich hier stehen kann. Alle haben einen Moment, um zu begreifen, dass hier etwas nicht stimmt.',
          trigger: [
            { id: 'aufprall', label: 'Der Kahn rammt ein Schleusentor', info: 'Kleiner Schaden am Bug. Das nächste Tor müsste Meilen voraus liegen.' },
            { id: 'henrietta_schimpft', label: 'Henrietta schimpft — und bricht mitten im Satz ab', info: 'Sie erkennt die Gruppe, die sie gerade auf der anderen Seite verabschiedet hat.' },
            { id: 'verwirrung', label: 'Ein Moment der Verwirrung', info: 'Kurz Zeit zum Staunen und Fragen, bevor aus dem Wasser ein tiefes, gurgelndes Stöhnen aufsteigt.' }
          ]
        },
        'hk_untote': {
          title: 'Die Toten steigen auf',
          kurz: 'Zombies ziehen sich aus dem Kanal. Mindestens einer je Figur, jede Runde mehr. Henrietta ruft die Gruppe ins Haus und verriegelt nach ein, zwei Runden die Tür.',
          details: 'Aus dem Wasser kommen sie: ledrige, eingeschrumpfte Leiber, behängt mit Wasserkraut und Schlamm. Sie greifen nach dem Kahn und ziehen sich an der Kanalmauer hoch. Werte: Steckbrief „Die Toten aus dem Kanal“.\n\nIm dichten Nebel und nach dem, was gerade geschehen ist, überraschen die sonst langsamen Toten die Gruppe vermutlich (Überrascht, Regelwerk S. 169). Mindestens ein Zombie je Figur, und jede Runde steigen neue aus dem Wasser — genug, um die Gruppe auf Dauer zu überrennen.\n\nWer sich unter Deck verkriecht, hört, wie die Toten den Kahn in Stücke reißen. Henrietta ruft der Gruppe zu, ins Haus zu kommen, und wartet ein, zwei Runden, bevor sie die Tür vor Angst zuschlägt. Wer woanders hin flieht, irrt ein paar Augenblicke durch den Nebel und steht wieder hier — genau wie vorhin der Kahn.\n\nWer ins Wasser springt, hat Hände an sich: jede Runde Schwimmen, Herausfordernd (+0), sonst packt ein Zombie zu (Umschlungen, S. 168). Das kann schnell tödlich enden.',
          trigger: [
            { id: 'untote_steigen', label: 'Die Toten steigen aus dem Wasser', info: 'Bild der Schleuse jetzt auf „Die Toten steigen auf“ umschalten.' },
            { id: 'ueberraschung', label: 'Überraschung im Nebel', info: 'Wahrscheinlich ist die Gruppe überrascht (S. 169): keine Aktion, keine Bewegung, Gegner +20 im Nahkampf.' },
            { id: 'mehr_jede_runde', label: 'Jede Runde mehr', info: 'Mindestens einer je Figur, dazu jede Runde neue. Bleiben heißt untergehen.' },
            { id: 'unter_deck', label: 'Unter Deck verkrochen → der Kahn wird zerrissen', info: 'Die Toten reißen den Kahn in Stücke. Kein Versteck.' },
            { id: 'im_wasser', label: 'Ins Wasser → Schwimmen, Herausfordernd (+0) je Runde', info: 'Misslingt es, packt ein Zombie zu: Umschlungen. Kann schnell tödlich werden.' },
            { id: 'flucht_im_kreis', label: 'Flucht in den Nebel → zurück an der Schleuse', info: 'Nach ein paar Augenblicken Nebel steht man wieder hier.' },
            { id: 'ruf_zum_haus', label: 'Henrietta ruft die Gruppe ins Haus', info: 'Sie wartet ein, zwei Runden.' },
            { id: 'tuer_zu', label: 'Henrietta schlägt die Tür zu', info: 'Wer bis dahin nicht drin ist, steht draußen bei den Toten.' }
          ]
        }
      }
    },

    /* ======== FLUR UND TREPPE: Zuflucht, Botschaften, der Boden ======== */
    'hk_flur': {
      personen: 'Henrietta Garland',
      kurz: 'Hier kommt die Gruppe an und hier liegt die Lösung: Das Grab ist genau unter der Treppe. An Wand und Spiegel erscheinen Drohungen auf Klassisch. Teil 3 beginnt hier mit dem Aufreißen des Bodens.',
      ortHinweis: 'Teil 2 (Das Haus) hat keine feste Reihenfolge: Räume und die Ereignisse „Raus hier!“, „Kopf an die Wand“ (Garten) und „Albträume“ (Salon) frei kombinieren, bis die Gruppe ahnt, dass die Antwort unter dem Haus liegt. Den Marker „Unter dem Haus“ erst aufdecken, wenn der Boden offen ist.',
      npcs: [HENRIETTA],
      interaktionen: {
        'hk_zuflucht': {
          title: 'Zuflucht im Haus',
          kurz: 'Henrietta verriegelt die Tür, Eisengitter halten die Toten an den Fenstern draußen. Sie bietet Essen, Ruhe und einen kräftigen Schluck an und führt die Gruppe nach oben in den Salon.',
          details: 'Henrietta schiebt den Riegel vor. Vor den Fenstern sitzen massive Eisengitter, die Toten kommen nicht herein, aber das Glas klirrt überall auf den Boden.\n\nSchwer atmend bietet sie an, was sie hat: Essen, ein Lager, einen ordentlichen Schluck. Sie bittet alle nach oben in den Salon und versorgt dort Wunden (weiter im Salon: „Der Mittagsschlag“).\n\nDraußen stöhnen die Toten weiter. Es werden mehr.',
          trigger: [
            { id: 'riegel_vor', label: 'Die Tür ist verriegelt', info: 'Eisengitter an den Fenstern, überall Glassplitter.' },
            { id: 'gastfreundschaft', label: 'Henrietta bietet Essen, Ruhe und einen Schluck an', info: 'Sie führt die Gruppe nach oben in den Salon.' },
            { id: 'draussen_mehr', label: 'Draußen werden es mehr', info: 'Das Stöhnen hört nicht auf.' }
          ]
        },
        'hk_blick_auf_die_toten': {
          title: 'Ein Blick auf die Toten',
          kurz: 'Wahrnehmung zeigt, wie seltsam die Toten aussehen; Wissen erkennt Unberogen-Schmiedearbeit. Henrietta erinnert sich an Gerüchte über alte Gräber beim Kanalbau.',
          details: 'Wer einen Moment innehält und die Toten durch die Gitter betrachtet:\n\nWahrnehmung, Durchschnittlich (+20): Die Haut ist ledrig und eingeschrumpft, die zerlumpte Kleidung aus grobem Tuch und Fell, Rüstung und Waffen tragen fremde Muster.\n\nWissen (Geschichte, Theologie oder Reikland), Schwierig (−10): Das ist sehr frühe Schmiedearbeit der Unberogen — des alten Stammes, aus dem vor über 2.500 Jahren Sigmar hervorging.\n\nDas verwirrt Henrietta. Ihr fällt ein, was Kahnführer erzählt haben: Beim Bau des Kanals seien die Arbeiter auf alte Gräber gestoßen. Sie hat sich nie etwas dabei gedacht. Wenn sie hier herauskommen, will sie Soldaten herholen, die sich das ansehen.\n\nWie der Kahn auf die falsche Seite der Schleuse kam, versteht sie nicht. Sie ist sich aber völlig sicher, dass Magie dahintersteckt — obwohl sie von Magie nicht das Geringste versteht. Hat die Gruppe schon gemerkt, dass man zu Fuß nicht wegkommt, macht ihr das noch mehr Angst.',
          trigger: [
            { id: 'wahrnehmung_tote', label: 'Wahrnehmung, Durchschnittlich (+20): seltsame Tote', info: 'Ledrige Haut, grobes Tuch und Fell, fremde Muster auf Rüstung und Waffen.' },
            { id: 'wissen_unberogen', label: 'Wissen, Schwierig (−10): Unberogen-Arbeit', info: 'Geschichte, Theologie oder Reikland. Sehr alte Schmiedearbeit des Stammes, aus dem Sigmar kam.' },
            { id: 'henrietta_graeber', label: 'Henrietta erinnert sich an alte Gräber beim Kanalbau', info: 'Kahnführer haben davon erzählt. Sie will Soldaten holen, wenn sie hier herauskommen.' },
            { id: 'henrietta_magie', label: 'Henrietta ist sich sicher: Magie', info: 'Ohne jede Ahnung von Magie, aber felsenfest überzeugt.' }
          ]
        },
        'hk_raus_hier': {
          title: 'Raus hier!',
          kurz: 'Ereignis, keinem Raum fest zugeordnet: Auf Wänden und Spiegel im Flur neben der Treppe erscheinen Drohungen auf Klassisch, wie in beschlagenes Glas geschrieben oder in Blut.',
          details: 'An den Wänden und auf dem Spiegel im Flur, gleich neben der Treppe, stehen plötzlich Worte. Als hätte sie jemand in beschlagenes Glas gezogen, manche wie mit Blut geschrieben. Die Sprache ist Klassisch.\n\nKann niemand Klassisch lesen, versteht Henrietta ein wenig und übersetzt Bruchstücke. Es sind Anklagen und Drohungen, etwa: „Ertränker der Toten!“ oder „Die Erde wird euch verschlingen!“. Manche beschreiben genau, was mit den Lebenden geschehen soll. Die übersetzt Henrietta nicht, egal wer fragt.\n\nWer von der Rabenschar verwundet wurde, kann sie selbst lesen.\n\nDass die Worte ausgerechnet neben der Treppe stehen, ist ein Hinweis. Die Spielleitung erklärt ihn nicht.',
          trigger: [
            { id: 'worte_erscheinen', label: 'Worte auf Wand und Spiegel neben der Treppe', info: 'Beschlagen oder blutig, auf Klassisch.' },
            { id: 'henrietta_uebersetzt', label: 'Henrietta übersetzt Bruchstücke', info: 'Nur, wenn niemand sonst Klassisch kann. Die grausigsten übersetzt sie nicht.' },
            { id: 'rabenwunde_liest', label: 'Wer von den Raben verwundet wurde, liest selbst', info: 'Die Gabe der Rabenschar: einfaches Klassisch.' }
          ]
        },
        'hk_der_boden': {
          title: 'Der Boden',
          kurz: 'Teil 3 beginnt: Henriettas Boden muss aufgerissen werden. Das dauert Stunden — kürzer mit den Gartengeräten aus der Zelle oder wenn jemand aus dem Albtraum weiß, wo. Darunter Steinplatten und eine Treppe in die Tiefe.',
          details: 'Wenn die Gruppe begriffen hat, dass die Antwort unter dem Haus liegt, muss der Boden auf. Henrietta gefällt das gar nicht, aber sie lässt es zu.\n\nOhne Hinweis dauert es Stunden. Schneller geht es mit Henriettas Gartengeräten (sie liegen in der Zelle) oder wenn jemand aus den Albträumen weiß, dass das Grab unter der Treppe liegt.\n\nUnter den Dielen kommen staubige Steinplatten zum Vorschein. Eine große Platte hat zwei Griffe zum Anheben. Darunter windet sich eine schmale Treppe in die Dunkelheit.\n\nWer keine Nachtsicht hat, braucht Fackeln oder eine Probe Athletik, Schwer (−20), sonst stolpert er und stürzt einen Schritt tief (Fallen, S. 166). Die Treppe führt gut zwanzig Meter hinab.',
          trigger: [
            { id: 'boden_auf', label: 'Die Gruppe reißt den Boden auf', info: 'Henrietta widerwillig, aber einverstanden.' },
            { id: 'schneller', label: 'Schneller: Gartengeräte oder Wissen aus dem Albtraum', info: 'Ohne beides dauert es Stunden.' },
            { id: 'steinplatte', label: 'Steinplatten, eine große mit zwei Griffen', info: 'Darunter eine schmale, gewundene Treppe.' },
            { id: 'grab_aufdecken', label: 'Marker „Unter dem Haus“ aufdecken', info: 'Ab jetzt sehen die Spieler den Ort auf der Karte.' },
            { id: 'abstieg', label: 'Abstieg: Fackeln oder Athletik, Schwer (−20)', info: 'Ohne Nachtsicht. Misslingt es: Sturz um einen Schritt (S. 166).' }
          ]
        },
        'hk_kurgorn_kommt': {
          title: 'Wenn niemand gräbt: Kurgorn kommt',
          kurz: 'Rückfall, falls die Gruppe nicht darauf kommt: Nach einigen Tagen bricht Kurgorn mit acht Zombies unter der Treppe hervor. Die Gruppe ist erschöpft, und er ist besonders übler Laune.',
          details: 'Findet die Gruppe den Weg nach unten nicht, kommt Kurgorn zu ihr. Nach einigen Tagen im Haus kracht es unter der Treppe: Stein bricht, Holz splittert. Kurgorn Three-Eyes steigt mit einem Gefolge von acht Zombies aus der Erde.\n\nJede Figur legt eine Probe Ausdauer, Herausfordernd (+0) ab. Die Tage im Haus haben sie mitgenommen: Jede hat zwei Zustände Erschöpft, einen weniger je Erfolgsgrad (Erschöpft, S. 169).\n\nKurgorn ist in besonders übler Stimmung: Alle Proben auf Charisma, um mit ihm umzugehen, sind um −20 erschwert. Werte: Steckbrief „Kurgorn Three-Eyes“ (am Ort „Unter dem Haus“).',
          trigger: [
            { id: 'krachen', label: 'Stein und Holz brechen unter der Treppe', info: 'Erst nach einigen Tagen, wenn die Gruppe nicht selbst gräbt.' },
            { id: 'kurgorn_mit_gefolge', label: 'Kurgorn mit acht Zombies', info: 'Er will Rache an den Lebenden.' },
            { id: 'ausdauer_erschoepft', label: 'Ausdauer, Herausfordernd (+0): zwei Erschöpft, −1 je EG', info: 'Die Tage im Haus fordern ihren Preis.' },
            { id: 'charisma_minus20', label: 'Charisma gegen Kurgorn −20', info: 'Er ist in besonders übler Stimmung.' }
          ]
        }
      }
    },

    /* ======================= TEIL 2: DAS HAUS ======================= */
    'hk_buero': {
      personen: '—',
      kurz: 'Eng, knarrend, die grüne Farbe blättert ab wie Haut. Wer bei Selbstbeherrschung scheitert, hört Schlachtlärm und sieht Blut aus den Wänden steigen — bis zum Ertrinken.',
      interaktionen: {
        'hk_blut_an_den_waenden': {
          title: 'Blut an den Wänden',
          kurz: 'Selbstbeherrschung, Herausfordernd (+0). Misslingt sie: fernes Schlachtgetöse, Blut steigt aus den Wänden. Steht es über dem Kopf, ertrinkt die Figur, bis sie den Raum verlässt.',
          details: 'Für alle außer Henrietta oder einen anderen Halbling ist das Büro beklemmend eng. Die Dielen knarren bei jedem Schritt bedrohlich, und die einst feine grüne Farbe löst sich wie abschälende Haut — sehr zu Henriettas Entsetzen.\n\nJede Figur, die eintritt, legt eine Probe Selbstbeherrschung, Herausfordernd (+0) ab.\n\nWer scheitert, hört bald fernen Schlachtlärm und sieht Blut aus den Wänden sickern, in immer stärkeren Strömen. Man kann es für Einbildung halten, vor allem wenn andere bestanden haben und nichts sehen. Sobald das Blut aber über den Kopf steigt, beginnt jeder, der es sieht, zu ertrinken (Ertrinken, S. 181), bis er den Raum verlässt.\n\nWer überlebt, hat einen Zustand Erschöpft, der bleibt, bis er sich ausruht.',
          trigger: [
            { id: 'enge', label: 'Enge, knarrende Dielen, abblätternde Farbe', info: 'Henrietta ist entsetzt über ihre Wände.' },
            { id: 'selbstbeherrschung', label: 'Selbstbeherrschung, Herausfordernd (+0)', info: 'Jede Figur, die eintritt.' },
            { id: 'blut_steigt', label: 'Misslungen: Schlachtlärm, Blut aus den Wänden', info: 'Andere sehen vielleicht nichts.' },
            { id: 'ertrinken', label: 'Blut über dem Kopf → Ertrinken bis zum Verlassen', info: 'S. 181.' },
            { id: 'erschoepft', label: 'Überlebt: ein Erschöpft bis zur Rast', info: 'S. 169.' }
          ]
        }
      }
    },

    'hk_zelle': {
      personen: '—',
      kurz: 'Durch das Sichtfenster sieht jeder einen gehenkten Unberogen. Wer die Tür öffnet und vorher an Selbstbeherrschung gescheitert ist, wird gewürgt. Sonst: Gartengeräte und Pilze — die Geräte beschleunigen das Graben.',
      interaktionen: {
        'hk_der_gehenkte': {
          title: 'Der Gehenkte',
          kurz: 'Blick durchs Fenster: Selbstbeherrschung, Herausfordernd (+0) — und in jedem Fall ein Toter am Strick. Was beim Öffnen passiert, hängt davon ab, ob der Öffnende bestanden hat.',
          details: 'Eine kleine Kammer mit breiter Holztür und einem vergitterten Sichtfenster — für alle, die größer sind als Henrietta.\n\nWer durch das Fenster schaut, legt Selbstbeherrschung, Herausfordernd (+0) ab. Ob bestanden oder nicht: Drinnen hängt ein Toter in der Kleidung der Unberogen an einem Strick von den Dachbalken.\n\nÖffnet jemand die Tür:\n\nHat der Öffnende bestanden, ist die Kammer leer bis auf Henriettas Gartengeräte und ein paar Töpfe mit Pilzen. (Sie benutzt die Zelle seit Jahren so, die Flusswächter bringen ihre Gefangenen lieber zu einer anderen Schleuse.)\n\nHat er versagt, ist der Tote noch da. Er zuckt, schreit und würgt den, der geöffnet hat. Solange er festhält, bekommt die Figur einen Zustand Erschöpft und verliert jede Runde 1 LeP. Zu Beginn jeder Runde Selbstbeherrschung, Herausfordernd (+0). Gelingt sie, ist die Erscheinung fort — und die Figur stellt fest, dass es ihre eigenen Hände sind, die um ihren Hals liegen.',
          trigger: [
            { id: 'fenster', label: 'Blick durchs Fenster: Selbstbeherrschung, Herausfordernd (+0)', info: 'In jedem Fall: ein gehenkter Unberogen.' },
            { id: 'tuer_bestanden', label: 'Tür auf, Öffnender hat bestanden → leer', info: 'Gartengeräte und Pilze.' },
            { id: 'tuer_versagt', label: 'Tür auf, Öffnender hat versagt → er wird gewürgt', info: 'Erschöpft, −1 LeP je Runde, jede Runde Selbstbeherrschung (+0).' },
            { id: 'eigene_haende', label: 'Erscheinung fort: die eigenen Hände am Hals', info: 'Sobald die Probe gelingt.' },
            { id: 'gartengeraete', label: 'Gartengeräte gefunden', info: 'Damit geht das Aufreißen des Bodens viel schneller (Flur, „Der Boden“).' }
          ]
        }
      }
    },

    'hk_wohnstube': {
      personen: '—',
      kurz: 'Flüstern in einer uralten Sprache, eindeutig feindselig. Wer hier rasten will, muss Selbstbeherrschung bestehen.',
      interaktionen: {
        'hk_fluestern': {
          title: 'Das Flüstern',
          kurz: 'Wer sich hier aufhält, hört leises Flüstern in einer alten Sprache. Rasten nur mit Selbstbeherrschung, Herausfordernd (+0).',
          details: 'Im Wohnzimmer flüstert es. Leise, in einer uralten Sprache, die niemand versteht — und doch spürt jeder sofort, dass die Worte feindselig sind.\n\nWer hier rasten will, muss zuerst Selbstbeherrschung, Herausfordernd (+0) bestehen, um das Flüstern auszublenden. Für jede Rast gilt außerdem die Regel aus „Schlaf und Albträume“ (Salon).',
          trigger: [
            { id: 'fluestern', label: 'Feindseliges Flüstern in alter Sprache', info: 'Jeder spürt die Feindseligkeit, niemand versteht die Worte.' },
            { id: 'rast_hier', label: 'Rasten: Selbstbeherrschung, Herausfordernd (+0)', info: 'Sonst findet niemand hier Ruhe.' }
          ]
        }
      }
    },

    'hk_vorrat': {
      personen: '—',
      kurz: 'Henriettas Vorräte verfaulen im Zeitraffer. Der Gestank wird von Minute zu Minute schlimmer.',
      interaktionen: {
        'hk_faeulnis': {
          title: 'Fäulnis',
          kurz: 'Fleisch und Gemüse verderben vor den Augen der Gruppe. Bleiben: Ausdauer, erst Durchschnittlich (+20), dann Herausfordernd (+0), dann Schwer (−20).',
          details: 'Fleisch, Gemüse, alles, was Henrietta eingelagert hat, verfault in rasender Geschwindigkeit. Der Gestank ist überwältigend.\n\nWer länger als einen Moment bleiben will, legt Ausdauer, Durchschnittlich (+20) ab. Je länger man bleibt, desto schwerer wird es: dann Herausfordernd (+0), zuletzt Schwer (−20).',
          trigger: [
            { id: 'verfall', label: 'Die Vorräte verfaulen im Zeitraffer', info: 'Henriettas Wintervorrat.' },
            { id: 'ausdauer_1', label: 'Bleiben: Ausdauer, Durchschnittlich (+20)', info: 'Erste Minuten.' },
            { id: 'ausdauer_2', label: 'Länger: Ausdauer, Herausfordernd (+0)', info: '' },
            { id: 'ausdauer_3', label: 'Noch länger: Ausdauer, Schwer (−20)', info: '' }
          ]
        }
      }
    },

    'hk_garten': {
      personen: 'Die Rabenschar',
      kurz: 'Wer den Garten betritt, wird von der Rabenschar angegriffen. Wer dabei verwundet wird, versteht ihr Krächzen: Kurgorns Leben. Hier spielt auch das Ereignis „Kopf an die Wand“.',
      npcs: [RABEN],
      interaktionen: {
        'hk_raben_greifen_an': {
          title: 'Die Raben greifen an',
          kurz: 'Die Rabenschar fällt über jeden her, der den Garten betritt. Wer mindestens 1 LeP an sie verliert, versteht ihr Krächzen und erfährt Kurgorns Geschichte.',
          details: 'Kaum betritt jemand den Garten, stürzt sich die Rabenschar auf ihn. Die Vögel reißen Fleisch aus und schlingen es gierig hinunter. Werte: Steckbrief „Die Rabenschar“.\n\nWer dabei mindestens 1 LeP verliert, beginnt ihr Krächzen zu verstehen. Jeder Rabe schreit von einem anderen Teil aus Kurgorns Leben: wie er sein Volk zum Sieg über die Nachbarstämme führte, wie er dem großen Häuptling Sigmar die Treue schwor, wie er schließlich durch eine Orkbande fiel, die vor der Vernichtung am Black Fire Pass floh.\n\nDiese Figuren sprechen und verstehen von nun an einfaches Klassisch — und damit auch Kurgorn selbst.',
          trigger: [
            { id: 'angriff', label: 'Die Rabenschar greift an', info: 'Jeden, der den Garten betritt.' },
            { id: 'verwundet', label: 'Mindestens 1 LeP verloren → versteht das Krächzen', info: 'Und spricht ab jetzt einfaches Klassisch.' },
            { id: 'sieg_ueber_staemme', label: 'Krächzen: Sieg über die Nachbarstämme', info: '' },
            { id: 'treue_sigmar', label: 'Krächzen: der Treueschwur an Sigmar', info: '' },
            { id: 'tod_durch_orks', label: 'Krächzen: sein Tod durch fliehende Orks', info: 'Eine Bande auf der Flucht vom Black Fire Pass.' }
          ]
        },
        'hk_kopf_an_die_wand': {
          title: 'Kopf an die Wand',
          kurz: 'Ereignis, keinem Raum fest zugeordnet: Kampflärm aus dem Garten. Draußen — die Raben sind verdächtig fort — schlägt ein Unberogen den Kopf eines Feindes gegen die Hauswand, genau dort, wo innen die Treppe an die Mauer stößt.',
          details: 'Aus dem Garten kommt Kampflärm. Wer nachsieht, findet keine Raben — verdächtig.\n\nLinks neben der Tür, genau dort, wo innen die Treppe an die Mauer stößt, steht ein Mann in Unberogen-Tracht. Er schlägt den Kopf eines Mannes aus einem fremden Stamm wieder und wieder gegen die Steinwand, bis der Schädel mit einem nassen Knacken nachgibt.\n\nDer Unberogen reckt sich und brüllt: „Für Kurgorn Three-Eyes!“ Dann bricht die Rabenschar aus dem Blut an der Wand hervor.\n\nDer Ort an der Wand ist ein Hinweis auf das Grab unter der Treppe. Die Spielleitung erklärt ihn nicht.',
          trigger: [
            { id: 'kampflaerm', label: 'Kampflärm aus dem Garten, keine Raben', info: '' },
            { id: 'unberogen_an_der_wand', label: 'Ein Unberogen zerschmettert einen Schädel an der Wand', info: 'Wo innen die Treppe an die Mauer stößt.' },
            { id: 'fuer_kurgorn', label: '„Für Kurgorn Three-Eyes!“', info: 'Der erste Name, den die Gruppe hört.' },
            { id: 'raben_aus_dem_blut', label: 'Die Rabenschar bricht aus dem Blut hervor', info: '' }
          ]
        }
      }
    },

    'hk_salon': {
      personen: 'Henrietta Garland',
      kurz: 'Hier versorgt Henrietta die Wunden, und die Uhr schlägt Mittag: Für einen Moment ist etwas Bösartiges im Raum. Später in Teil 2 wird die Decke zur Wasseroberfläche, unter der man ertrinkt. Die Regel für Schlaf und Albträume steht hier.',
      npcs: [HENRIETTA],
      interaktionen: {
        'hk_mittagsschlag': {
          title: 'Der Mittagsschlag',
          kurz: 'Henrietta verbindet Wunden, die Prunkuhr schlägt Mittag. Der Raum verdunkelt sich, Schatten kriechen aus den Ecken, eine bösartige Gegenwart — dann ist sie fort.',
          details: 'Henrietta verbindet, wer verletzt ist. An der Wand hängt ihre Uhr, ein aufwendiges Stück mit einer derben Szene: ein Middenländer, der einem Ork ans Bein pinkelt.\n\nDie Uhr schlägt Mittag. Schlagartig wird es dunkel im Raum. Schatten quellen aus den Ecken und unter den Möbeln hervor, und alle spüren eine ungeheuer bösartige Gegenwart. So plötzlich, wie sie kam, ist sie wieder fort. Die Stille danach ist ganz normal — und gerade deshalb kaum auszuhalten.\n\nHenrietta, kreidebleich und zitternd: „Bei Esmeraldas Schürze … was war das?“',
          trigger: [
            { id: 'wunden_versorgt', label: 'Henrietta versorgt die Wunden', info: 'Mit Essen und einem kräftigen Schluck.' },
            { id: 'uhr_schlaegt', label: 'Die Uhr schlägt Mittag', info: 'Die derbe Prunkuhr mit dem Middenländer und dem Ork.' },
            { id: 'gegenwart', label: 'Dunkelheit, Schatten, eine bösartige Gegenwart', info: 'Nur einen Augenblick.' },
            { id: 'was_war_das', label: 'Henrietta: „Was war das?“', info: 'Danach: Wahrnehmung für die Raben (Wachturm).' }
          ]
        },
        'hk_decke_aus_wasser': {
          title: 'Die Decke aus Wasser',
          kurz: 'Erst in Teil 2: Die Decke sieht aus wie eine Wasseroberfläche von unten, Schiffsrümpfe ziehen darüber. Selbstbeherrschung, Durchschnittlich (+20), sonst ertrinkt die Figur, bis sie den Raum verlässt.',
          details: 'Wenn die Gruppe den Salon in Teil 2 wieder betritt: Die Decke ist zur Wasseroberfläche geworden, von unten gesehen. Oben gleiten Schiffsrümpfe vorüber.\n\nWer das zum ersten Mal sieht, legt Selbstbeherrschung, Durchschnittlich (+20) ab. Wer scheitert, beginnt sofort zu ertrinken (Ertrinken, S. 181), bis er den Raum verlässt, und bekommt dabei einen Zustand Erschöpft.\n\nStirbt eine Figur so, „treibt“ ihr Körper zur Decke hinauf und verschwindet. Solange das geschieht, wirkt der aufsteigende Leichnam wie Grauen (Terror 1, S. 191).',
          trigger: [
            { id: 'wasserdecke', label: 'Die Decke als Wasseroberfläche, Schiffsrümpfe darüber', info: 'Erst in Teil 2.' },
            { id: 'probe', label: 'Selbstbeherrschung, Durchschnittlich (+20)', info: 'Beim ersten Anblick.' },
            { id: 'ertrinken', label: 'Misslungen: Ertrinken bis zum Verlassen, +1 Erschöpft', info: 'S. 181.' },
            { id: 'leiche_steigt', label: 'Tod: der Körper treibt zur Decke (Grauen 1)', info: 'S. 191.' }
          ]
        },
        'hk_schlaf_und_albtraum': {
          title: 'Schlaf und Albträume',
          kurz: 'Gilt im ganzen Haus: Wer rastet, muss Ausdauer bestehen, sonst schläft er ein und träumt, lebendig begraben zu werden. Die Initiative-Probe danach verrät, wo das Grab liegt.',
          details: 'Für das ganze Abenteuer gilt: Wer sich ausruht, etwa um Erschöpft loszuwerden, legt Ausdauer, Herausfordernd (+0) ab. Misslingt sie, übermannt ihn der Schlaf — und wer schläft, träumt.\n\nDer Traum: lebendig begraben. Erde wird auf ihn geschaufelt, dann Stein, zuletzt ein hohes Holzhaus. Dann sickert Wasser ins Grab, er ertrinkt halb. Er wacht auf mit dem Mund voll nasser Erde, die nach dem Kanal stinkt.\n\nInitiative, Durchschnittlich (+20): Das Haus im Traum ist das Schleusenhaus. Bei +2 Erfolgsgraden oder mehr: Das Grab liegt unter dem Treppenhaus.',
          trigger: [
            { id: 'rast_ausdauer', label: 'Rasten: Ausdauer, Herausfordernd (+0)', info: 'Misslungen: Schlaf, und damit der Traum.' },
            { id: 'traum', label: 'Der Traum: lebendig begraben, Wasser dringt ein', info: 'Erde, Stein, ein hohes Holzhaus darüber.' },
            { id: 'nasse_erde', label: 'Erwachen mit nasser Kanalerde im Mund', info: '' },
            { id: 'initiative_haus', label: 'Initiative, Durchschnittlich (+20): das Schleusenhaus', info: '' },
            { id: 'initiative_treppe', label: '+2 EG: das Grab liegt unter der Treppe', info: 'Damit geht das Graben schneller (Flur, „Der Boden“).' }
          ]
        }
      }
    },

    'hk_schlafzimmer': {
      personen: '—',
      kurz: 'Es stinkt wie ein fauliger Teich. Wer länger bleibt, braucht Widerstand, sonst Übelkeit — und vielleicht die Galloping Trots.',
      interaktionen: {
        'hk_teichgestank': {
          title: 'Teichgestank',
          kurz: 'Widerstand, Herausfordernd (+0), sonst Übelkeit. Wen es erwischt, kann sich die Galloping Trots einfangen.',
          details: 'Das Zimmer stinkt wie ein stehender Teich. Wer länger als ein paar Augenblicke hier steht, legt Widerstand, Herausfordernd (+0) ab — sonst füllt sich sein Magen mit dem fauligen Schleimwasser, das in Kurgorns Grab sickert: Übelkeit (S. 189).\n\nWen es erwischt, der kann sich die Galloping Trots einfangen (S. 187).',
          trigger: [
            { id: 'gestank', label: 'Gestank wie ein stehender Teich', info: '' },
            { id: 'widerstand', label: 'Widerstand, Herausfordernd (+0)', info: 'Nach ein paar Augenblicken im Raum.' },
            { id: 'uebelkeit', label: 'Misslungen: Übelkeit', info: 'S. 189.' },
            { id: 'trots', label: 'Gefahr: Galloping Trots', info: 'S. 187.' }
          ]
        }
      }
    },

    'hk_kueche': {
      personen: '—',
      kurz: 'Ein grässlicher Chor singt. Mit Wissen oder Rabenwunde versteht man ein Unberogen-Kriegslied über einen weitsichtigen Anführer. In Löffeln und Kellen spiegelt sich eine Horde toter Krieger.',
      interaktionen: {
        'hk_der_chor': {
          title: 'Der Chor der Toten',
          kurz: 'Ein Chor singt erbärmlich. Wissen, Schwierig (−10), oder eine Rabenwunde: ein Kriegslied über Kurgorn und Sigmar. Wer die Toten in den Spiegelungen sieht, legt Selbstbeherrschung wie gegen Grauen 2 ab.',
          details: 'In der Küche singt ein Chor, und zwar entsetzlich.\n\nWissen (Geschichte, Theologie oder Reikland), Schwierig (−10), oder eine Wunde von der Rabenschar: Man versteht ein Kriegslied der Unberogen über einen klugen, weitsichtigen Anführer, der gegen Sigmar kämpfte und schließlich an seiner Seite.\n\nIn den blanken Löffeln, Kellen und Pfannen sieht man die Küche voller toter Unberogen-Krieger, das ausgedörrte Fleisch gibt ihrem Gesang etwas Rasselndes, Ungeheuerliches. Wer diese Horde um sich herum erblickt, legt Selbstbeherrschung ab wie gegen ein Wesen mit Grauen 2 (S. 191).',
          trigger: [
            { id: 'chor', label: 'Ein grässlicher Chor singt', info: '' },
            { id: 'kriegslied', label: 'Wissen, Schwierig (−10), oder Rabenwunde: das Kriegslied', info: 'Ein weitsichtiger Anführer, erst gegen, dann mit Sigmar.' },
            { id: 'spiegelungen', label: 'In Löffeln und Kellen: eine Horde toter Krieger', info: '' },
            { id: 'grauen2', label: 'Selbstbeherrschung wie gegen Grauen 2', info: 'S. 191.' }
          ]
        }
      }
    },

    'hk_turm': {
      personen: 'Die Rabenschar',
      kurz: 'Von hier sieht man die Raben auf dem Dach. Sie greifen nicht an, solange niemand sie angreift. Und die Toten unten werden Hunderte: Wer nur wartet, stirbt.',
      npcs: [RABEN],
      interaktionen: {
        'hk_die_rabenschar': {
          title: 'Die Rabenschar',
          kurz: 'Wahrnehmung, Herausfordernd (+0): Das Stöhnen ist verstummt, vom Dach kommt Krächzen. Die Toten stehen still und starren hinauf. Auf dem Dach sitzen Raben mit blauen Flammen statt Augen.',
          details: 'Hat sich die Gruppe ein wenig erholt und beratschlagt, legt jede Figur Wahrnehmung, Herausfordernd (+0) ab. Wer besteht, merkt: Das leise Stöhnen der Toten hat aufgehört. Vom Dach kommt Krächzen.\n\nDie Toten sind noch da und greifen jeden an, der hinausgeht. Aber sie stehen still und starren alle hinauf zum Dach.\n\nWer in den Wachturm steigt (oder töricht genug ist, nach draußen zu gehen), sieht: Das Haus ist übersät mit großen Raben, wo ihre Augen sein müssten, flackern kalte blaue Flammen. Jeder starrt den an, der ihn ansieht. Sie sind zutiefst unheimlich, greifen aber nicht an, solange niemand sie angreift. Werden sie vernichtet, kehren sie aus dem Nebel zurück, sobald niemand hinsieht.\n\nDie Rabenschar ist Kurgorns Zorn, der Gestalt annimmt. Je stärker er wird, desto weiter reicht sein Einfluss durchs Haus.',
          trigger: [
            { id: 'wahrnehmung_stille', label: 'Wahrnehmung, Herausfordernd (+0): das Stöhnen ist verstummt', info: 'Vom Dach kommt Krächzen.' },
            { id: 'tote_starren', label: 'Die Toten stehen still und starren aufs Dach', info: 'Sie greifen trotzdem jeden an, der hinausgeht.' },
            { id: 'raben_auf_dem_dach', label: 'Raben mit blauen Flammen statt Augen', info: 'Sie starren zurück. Kein Angriff, solange man sie in Ruhe lässt.' },
            { id: 'kehren_zurueck', label: 'Vernichtet → zurück, sobald niemand hinsieht', info: '' }
          ]
        },
        'hk_warten_heisst_sterben': {
          title: 'Warten heißt sterben',
          kurz: 'Die Toten nehmen den Angriff auf Tür und Mauern wieder auf, bald sind es Hunderte. Den Spielern klar machen: Wer nur wartet, stirbt. Die einzige Hoffnung liegt im Haus selbst.',
          details: 'Nach einer Weile hämmern die Toten wieder gegen Tür und Mauern, und ihre Zahl wächst, bis es Hunderte sind.\n\nDie Spielleitung macht den Spielern ausdrücklich klar: Wer nur abwartet, den holt hier der Tod. Ihre einzige Hoffnung ist, das Haus zu erkunden und sich dem, was hier vorgeht, zu stellen. Damit beginnt Teil 2.',
          trigger: [
            { id: 'angriff_wieder', label: 'Die Toten hämmern wieder gegen Tür und Mauern', info: 'Bald sind es Hunderte.' },
            { id: 'klar_machen', label: 'Klar machen: Warten heißt sterben', info: 'Übergang zu Teil 2 — das Haus erkunden.' }
          ]
        }
      }
    },

    /* ================= TEIL 3: ABSTIEG IN DIE DUNKELHEIT ================= */
    'hk_grab': {
      personen: 'Kurgorn Three-Eyes',
      kurz: 'Gut zwanzig Meter unter dem Haus: eine Kammer in blassblauem Fackellicht, auf einem Granitthron ein Skelett mit Bleikrone. Kurgorn ist wütend, aber nicht böse — er will schlafen. Man kann ihn besänftigen oder vernichten.',
      ortHinweis: 'Dieser Marker ist zu Beginn verborgen und wird erst aufgedeckt, wenn der Boden offen ist (Flur, „Der Boden“).',
      npcs: [KURGORN, TOTE],
      interaktionen: {
        'hk_die_grabkammer': {
          title: 'Die Grabkammer',
          kurz: 'Fackeln, die von selbst blassblau brennen. Auf dem Granitthron Kurgorn mit der Bleikrone. Fauliges Kanalwasser tropft von der Decke in Gold, Silber und Edelsteine.',
          details: 'Gut zwanzig Meter unter der Erde endet die Treppe in einer Kammer. Fackeln in den Wänden brennen, obwohl sie niemand entzündet hat, und tauchen alles in ein fahles, blassblaues Licht.\n\nVor der Gruppe sitzt ein Skelett auf einem Thron aus Granit, gekleidet in prächtigere Fassungen der Felle und des Leders, das die Toten oben tragen. Auf der Stirn eine Krone aus Blei, in der Mitte ein leuchtend grüner Stein, darin ein Obsidiansplitter wie die Pupille eines dritten Auges.\n\nVon der Decke tropft fauliges, schlammiges Wasser, das nach dem Kanal stinkt. Es hat Rinnen in kleine Haufen aus Gold, Silber und Edelsteinen gegraben und in den uralten Staub, der auf allem liegt.\n\nDas ist Kurgorn Three-Eyes, und er ist wütend.',
          trigger: [
            { id: 'blaue_fackeln', label: 'Blassblaue Fackeln, die von selbst brennen', info: '' },
            { id: 'thron', label: 'Kurgorn auf dem Granitthron, die Bleikrone', info: 'Der Band of the Three-Eyed.' },
            { id: 'tropfwasser', label: 'Kanalwasser tropft in die Grabbeigaben', info: 'Das ist die Kränkung: Sein Grab läuft voll.' }
          ]
        },
        'hk_mit_kurgorn_reden': {
          title: 'Mit Kurgorn reden',
          kurz: 'Wer Respekt zeigt, Mitgefühl hat oder ihn auf Klassisch anspricht, wird angehört. Wer von den Raben verwundet wurde, versteht ihn. Angebot: das Grab ausbessern, die Lecks stopfen, ihn wieder einschließen.',
          details: 'Mit Geschick lässt sich mit Kurgorn reden. Gehör findet, wer Respekt zeigt, wer Verständnis für seinen Zorn hat oder wer ihn auf Klassisch anspricht. Alle, die von der Rabenschar verwundet wurden, verstehen ihn und werden verstanden.\n\nEin Angebot, das ihn erreichen kann: das Grab ausbessern, die Lecks stopfen und ihn wieder einschließen. Kurgorn ist nicht böse. Er will nur sehr dringend weiterschlafen.\n\nIst er aus dem Boden hervorgebrochen (Flur, „Wenn niemand gräbt“), sind alle Charisma-Proben gegen ihn um −20 erschwert.',
          trigger: [
            { id: 'gehoer', label: 'Gehör durch Respekt, Mitgefühl oder Klassisch', info: 'Rabenwunde = versteht und wird verstanden.' },
            { id: 'angebot', label: 'Angebot: Grab ausbessern, Lecks stopfen, versiegeln', info: '' },
            { id: 'besaenftigt', label: 'Kurgorn ist besänftigt und legt sich wieder schlafen', info: 'Weiter mit „Ausgang und Belohnung“.' }
          ]
        },
        'hk_kurgorn_vernichten': {
          title: 'Kurgorn vernichten',
          kurz: 'Der andere Weg, und er funktioniert genauso. Dazu gibt es die Grabbeigaben: Schätze für 5W10 GK und Kurgorns Besitz samt Krone.',
          details: 'Kurgorn zu vernichten löst das Problem genauso — mit dem Vorteil, dass sich danach die Grabbeigaben plündern lassen. Werte: Steckbrief „Kurgorn Three-Eyes“, Zauber im Original: Reanimate, Screaming Skull, Vanhel’s Call.\n\nBeute: Edelsteine, Gold- und Silberstücke im Wert von 5W10 Goldkronen, dazu Kurgorns eigener Besitz, darunter der Band of the Three-Eyed.\n\nDer Reif zeigt die Winde der Magie wie das Talent Zweites Gesicht, macht seinen Träger dabei aber blind.',
          trigger: [
            { id: 'kampf', label: 'Kampf gegen Kurgorn', info: 'Furcht 3. Er wirkt Nekromantie.' },
            { id: 'vernichtet', label: 'Kurgorn ist vernichtet', info: 'Weiter mit „Ausgang und Belohnung“.' },
            { id: 'beute', label: 'Beute: 5W10 GK in Schätzen', info: 'Und Kurgorns Besitz.' },
            { id: 'krone', label: 'Die Krone geborgen (Band of the Three-Eyed)', info: 'Zweites Gesicht, aber blind, solange man sie trägt.' }
          ]
        },
        'hk_ausgang': {
          title: 'Ausgang und Belohnung',
          kurz: 'Ruht Kurgorn wieder oder ist er vernichtet, hebt sich der Nebel, die Raben verschwinden, die Toten fallen um. Darunter die Erfahrungspunkte zum Abhaken.',
          details: 'Es gibt nur zwei Wege hinaus: Kurgorn zurück in den Schlaf reden oder ihn vernichten. Dann hebt sich der Nebel, die Raben verschwinden, die Toten sinken in sich zusammen, und Haus und Schleuse kehren in die Alte Welt zurück.\n\nÜberlebt Henrietta, ist sie der Gruppe auf ewig dankbar — ihren Anteil an der Weissbruck-Schleusengebühr müssen sie nie wieder zahlen. Sie erzählt jedem, der vorbeikommt, wie eine Kahnbesatzung sie vor den Toten gerettet hat. Auf dem Fluss gibt es viele Seemannsgarne, und kaum jemand glaubt es ihr.\n\nStirbt Henrietta, übernimmt ihr nächster Verwandter das Schleusenhaus: Harold Garland, ein besonders mürrischer Halbling, der Reisenden selten mehr als ein Grunzen gönnt.\n\nErfahrungspunkte am Ende, zusätzlich zu den üblichen je Sitzung: siehe Trigger.',
          trigger: [
            { id: 'nebel_hebt_sich', label: 'Der Nebel hebt sich, Haus und Schleuse kehren zurück', info: 'Raben fort, die Toten sinken zusammen.' },
            { id: 'henrietta_dankbar', label: 'Henrietta lebt: nie wieder Schleusengebühr', info: 'Und eine Geschichte, die ihr niemand glaubt.' },
            { id: 'harold', label: 'Henrietta tot: Harold Garland übernimmt', info: 'Mürrisch, einsilbig.' },
            { id: 'ep_rollenspiel', label: '50 EP: gutes Rollenspiel, alle hatten Spaß', info: '' },
            { id: 'ep_besaenftigt', label: '50 EP: Kurgorn zurück in den Schlaf geredet', info: '' },
            { id: 'ep_vorher_gegraben', label: '25 EP: die Treppe gefunden, bevor er hervorbrach', info: '' },
            { id: 'ep_henrietta', label: '25 EP: Henrietta gerettet', info: '' },
            { id: 'ep_vernichtet', label: '25 EP: Kurgorn vernichtet', info: '' },
            { id: 'ep_krone', label: '15 EP: Kurgorns Krone geborgen', info: '' }
          ]
        }
      }
    }
  }, 'ORTE');

  eintragen(SZENEN_REGIE, {
    'hk1.1': {
      uebergeordnetesZiel: 'Aus der verfluchten Schleuse entkommen. Unter dem Haus liegt der Unberogen-Häuptling Kurgorn Three-Eyes, dessen Grab der Kanal flutet; erst wenn er wieder schläft oder vernichtet ist, hebt sich der Nebel. Drei Teile: der Abschied und die Toten aus dem Wasser (Schleuse), das Haus, das gegen die Gruppe arbeitet (Räume frei kombinieren), der Abstieg ins Grab (Flur). Das Grab ist auf der Karte zu Beginn verborgen.',
      stimmung: 'Kalter Nebel über dem Weissbruck-Kanal, so dicht, dass das nächste Tor nur zu ahnen ist. Das Schleusenhaus ist gemütlich und eng, für einen Halbling gebaut: niedrige Türen, knarrende Dielen, Pfeifenrauch, Pastetenduft. Draußen das Stöhnen der Toten und, später, das Krächzen der Raben.'
    }
  }, 'SZENEN_REGIE');
})();
