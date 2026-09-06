/* ==========================================================
   REGELWERK — Savage Worlds mit unserer Zwei-Würfel-Lesart
   ----------------------------------------------------------
   Eigenstaendig. Haengt an NICHTS aus der laufenden Kampagne -
   nicht an js/regie.js, nicht an den Szenendateien, nicht an
   Firebase. Die Zuordnung der Proben im Abenteuertext auf
   diese Werte ist ein spaeterer, eigener Schritt und findet
   NICHT hier statt.

   Das alte W100-Wertegeruest (vier Grundwerte "Koerper/INT/
   Auftreten/Wahrnehmung" ueber vierzehn Fertigkeiten) ist
   vollstaendig entfallen. Ebenso die frueher hier stehende
   Umschaltung zwischen zwei Regelsaetzen - es gibt genau ein
   System.

   ---- Der Kern in vier Zeilen ----
   Jeder Wert ist ein Wuerfel: d4 · d6 · d8 · d10 · d12.
   Zielzahl ist immer 4. Nichts wird addiert.
   Spielerfiguren werfen ihren Wert-Wuerfel UND den Wild Die
   (d6). Gelesen wird, WELCHER der beiden getroffen hat:

     beide >= 4          -> Guter Erfolg
     nur der Wert        -> Erfolg              (du konntest es)
     nur der Wild Die    -> Schlechter Erfolg   (du hattest Glueck)
     keiner              -> Misserfolg

   Daraus ergibt sich von selbst das Gefaelle, um das es geht:
   der Anfaenger schafft die Dinge ueberwiegend mit Glueck,
   der Meister ueberwiegend mit Koennen - dieselbe Handlung,
   eine andere Geschichte.
   ========================================================== */

/* ---------- Wuerfelstufen ----------
   0 = ungelernt, 1..5 = d4,d6,d8,d10,d12 */
const SIDES = [4, 4, 6, 8, 10, 12];
const DLBL  = ['—', 'd4', 'd6', 'd8', 'd10', 'd12'];
const MAXD  = 5;
const UNGELERNT = 0;

const WILD_DIE = 6;        // Stellschraube: ein d4 macht gute Erfolge halb so haeufig
const ZIELZAHL = 4;

/* ==========================================================
   ATTRIBUTE
   Fuenf, wie im Original. Jedes ist ein Satz ueber einen
   Menschen - genau darin liegt ihr Wert fuers Spiel.
   Staerke und Konstitution tragen bewusst KEINE Fertigkeiten:
   sie werden direkt gewuerfelt (Heben, Gift, Erschoepfung,
   Wunden wegstecken) und sind deshalb reine Koerperwerte.
   ========================================================== */
const ATTRIBUTE = [
  { name:'Geschicklichkeit', kurz:'Ges', d:'Schnell und sicher in der Bewegung.' },
  { name:'Verstand',         kurz:'Ver', d:'Gebildet, aufmerksam, schlagfertig.' },
  { name:'Willenskraft',     kurz:'Wil', d:'Mutig, standhaft, überzeugend.' },
  { name:'Stärke',           kurz:'Stä', d:'Roh und körperlich durchsetzungsfähig.' },
  { name:'Konstitution',     kurz:'Kon', d:'Zäh. Hält aus, was andere umwirft.' }
];
const ATTR_NAMEN = ATTRIBUTE.map(function (a) { return a.name; });

/* ==========================================================
   FERTIGKEITEN — jede haengt an GENAU EINEM Attribut
   Das ist der Unterschied zum alten Geruest, wo eine
   Fertigkeit zwei Leitwerte hatte und der hoehere zaehlte:
   ein Attribut war dadurch Leitwert fuer 11 von 14
   Fertigkeiten und damit ein Zwangskauf.

   "kern" = jeder kann das ein wenig, startet frei auf d4.
   ========================================================== */
const FERTIGKEITEN = [
  { name:'Kämpfen',         attr:'Geschicklichkeit', kern:false, d:'Klinge, Faust, alles auf Armlänge.' },
  { name:'Schießen',        attr:'Geschicklichkeit', kern:false, d:'Pistole, Muskete, Kanone.' },
  { name:'Athletik',        attr:'Geschicklichkeit', kern:true,  d:'Klettern, springen, Gleichgewicht halten.' },
  { name:'Heimlichkeit',    attr:'Geschicklichkeit', kern:true,  d:'Ungesehen bleiben, lautlos gehen.' },
  { name:'Diebeskunst',     attr:'Geschicklichkeit', kern:false, d:'Schlösser, Taschen, fremde Schubladen.' },
  { name:'Segeln',          attr:'Geschicklichkeit', kern:false, d:'Takelage, Ruder, ein Schiff am Wind halten.' },

  { name:'Aufmerksamkeit',  attr:'Verstand', kern:true,  d:'Sehen, hören, bemerken, was nicht stimmt.' },
  { name:'Allgemeinwissen', attr:'Verstand', kern:true,  d:'Was ein gebildeter Mensch eben weiß.' },
  { name:'Navigation',      attr:'Verstand', kern:false, d:'Karten, Sterne, Strömungen, Wetter.' },
  { name:'Heilkunde',       attr:'Verstand', kern:false, d:'Blut stillen, Knochen richten, Fieber senken.' },
  { name:'Handwerk',        attr:'Verstand', kern:false, d:'Reparieren, bauen, aufbrechen.' },
  { name:'Gassenwissen',    attr:'Verstand', kern:false, d:'Wer wen kennt, und wo man besser nicht fragt.' },
  { name:'Handel',          attr:'Verstand', kern:false, d:'Werte einschätzen, feilschen, Geschäfte machen.' },

  { name:'Überreden',       attr:'Willenskraft', kern:true,  d:'Jemanden auf deine Seite bringen.' },
  { name:'Einschüchtern',   attr:'Willenskraft', kern:false, d:'Jemanden dazu bringen, klein beizugeben.' },
  { name:'Provozieren',     attr:'Willenskraft', kern:false, d:'Jemanden aus der Fassung bringen.' }
];

const FERT_NAMEN   = FERTIGKEITEN.map(function (f) { return f.name; });
const FERT_BY_NAME = {}; FERTIGKEITEN.forEach(function (f) { FERT_BY_NAME[f.name] = f; });
const ATTR_BY_NAME = {}; ATTRIBUTE.forEach(function (a) { ATTR_BY_NAME[a.name] = a; });

function fertigkeitenVon(attrName) {
  return FERTIGKEITEN.filter(function (f) { return f.attr === attrName; });
}
function istAttribut(name) { return !!ATTR_BY_NAME[name]; }

/* ==========================================================
   BUDGETS
   ========================================================== */
const ATTR_PUNKTE    = 5;   // je Punkt eine Wuerfelstufe, Start d4
const FERT_PUNKTE    = 12;  // 1 bis zum Attribut, 2 darueber
const GRATIS_TALENTE = 1;   // im Original bekommen Menschen ein Talent geschenkt
const TALENT_KOSTEN  = 2;
const MAX_SCHWER = 1, MAX_LEICHT = 2;
const BENNIES  = 3;
const BEWEGUNG = 6;

/* ==========================================================
   RAENGE UND STEIGERUNGEN
   Eine Steigerung etwa pro Sitzung, vier ergeben einen Rang.
   Der Rang ist kein Selbstzweck - die Talente haengen daran,
   und das gibt Spielern zwischen den Sitzungen ein Ziel.

   Eine Steigerung erlaubt genau EINES:
     - ein Attribut eine Stufe hoeher (nur einmal je Rang)
     - ein neues Talent
     - zwei Fertigkeiten je eine Stufe, solange sie ihr
       Attribut nicht uebersteigen
     - eine Fertigkeit, die schon darueber liegt
     - eine neue Fertigkeit auf d4
   ========================================================== */
const RAENGE = [
  { id:0, name:'Novize',   abSteigerung:0 },
  { id:1, name:'Erfahren', abSteigerung:4 },
  { id:2, name:'Veteran',  abSteigerung:8 },
  { id:3, name:'Heroisch', abSteigerung:12 },
  { id:4, name:'Legendär', abSteigerung:16 }
];
function rangVon(steigerungen) {
  let r = RAENGE[0];
  RAENGE.forEach(function (x) { if ((steigerungen || 0) >= x.abSteigerung) r = x; });
  return r;
}
function rangName(id) { return (RAENGE[id] || RAENGE[0]).name; }

/* ==========================================================
   DER STECKBRIEF
   Fuenf Felder ohne jede Zahl. Sie kosten nichts und wiegen
   mehr als jede Fertigkeit: sie sind der Grund, warum ein
   Spieler zwischen den Sitzungen ueber seine Figur nachdenkt -
   und sie geben der Spielleitung sofort einen Haken zum
   Einhaengen.
   ========================================================== */
const STECKBRIEF = [
  { id:'antrieb',    n:'Antrieb',     frage:'Warum bist du an Bord?',
    hilfe:'Ein Satz. Kostet er dich einmal etwas, bekommst du dafür einen Bennie.',
    beispiel:'Ich suche den Mann, der meinen Bruder hat hängen lassen.' },
  { id:'band',       n:'Band',        frage:'Mit wem aus der Crew hast du Geschichte?',
    hilfe:'Ein Name und ein Halbsatz, woher. Die Spielleitung baut darauf auf.',
    beispiel:'Cormac hat mich aus dem Wasser gezogen. Er redet nicht darüber, ich auch nicht.' },
  { id:'geheimnis',  n:'Geheimnis',   frage:'Was darf niemand wissen?',
    hilfe:'Etwas, das herauskommen kann. Sag es der Spielleitung, nicht dem Tisch.',
    beispiel:'Das Schiff, auf dem ich vorher fuhr, ist nicht gesunken. Ich habe es verkauft.' },
  { id:'marke',      n:'Marke',       frage:'Woran erkennt man dich wieder?',
    hilfe:'Eine Narbe, ein Tick, ein Gegenstand, den du nie ablegst.',
    beispiel:'Ein abgegriffener Messingring am kleinen Finger, den ich beim Denken drehe.' },
  { id:'ersteszene', n:'Erste Szene', frage:'Wie hat die Gruppe dich kennengelernt?',
    hilfe:'Ein Bild, kein Lebenslauf. Zwei Sätze genügen.',
    beispiel:'Halb betrunken auf der Kaimauer, dabei, einer Möwe etwas zu erklären.' }
];

/* ==========================================================
   TALENTE
   Kategorie, Mindestrang und Mindestwerte folgen dem
   Savage-Worlds-Muster. Die Texte sind eigene: die
   offiziellen muessen von Fantasy bis Science-Fiction ueberall
   passen und bleiben deshalb farblos - hier soll man beim
   Lesen eine Figur vor sich sehen.

   "vor": Mindestwerte als [Name, Stufe]; der Name darf ein
   Attribut ODER eine Fertigkeit sein.
   Stufe 2 = d6, 3 = d8, 4 = d10, 5 = d12.
   ========================================================== */
const TALENT_KATEGORIEN = ['Hintergrund', 'Handwerk', 'Kampf', 'Umgang', 'Führung', 'Unheimliches'];

const TALENTE = [
  /* ---- Hintergrund ---- */
  { id:'seebein',   n:'Seebein',            kat:'Hintergrund', rang:0, vor:[['Segeln',2]],
    d:'Schwankender Untergrund erschwert dir nichts. An Bord darfst du eine misslungene Segeln-Probe einmal nachwürfeln.' },
  { id:'auge',      n:'Scharfes Auge',      kat:'Hintergrund', rang:0, vor:[['Aufmerksamkeit',2]],
    d:'Auf Entfernung und im Ausguck: Aufmerksamkeit eine Würfelstufe höher.' },
  { id:'grob',      n:'Grobschlächtig',     kat:'Hintergrund', rang:0, vor:[['Konstitution',3]],
    d:'Robustheit +1. Du steckst ein, was andere umwirft.' },
  { id:'glueck',    n:'Glückspilz',         kat:'Hintergrund', rang:0, vor:[],
    d:'Ein zusätzlicher Bennie je Sitzung. Manche Leute fallen ins Wasser und kommen mit einem Fisch heraus.' },
  { id:'sprach',    n:'Sprachbegabt',       kat:'Hintergrund', rang:0, vor:[['Verstand',2]],
    d:'Du verstehst Spanisch, Französisch und Portugiesisch bruchstückhaft — genug, um das Wichtigste mitzubekommen.' },
  { id:'zaeh',      n:'Zäh wie Tauwerk',    kat:'Hintergrund', rang:1, vor:[['Konstitution',3]],
    d:'Gehst du außer Gefecht, würfle Konstitution. Gelingt der Wurf, bist du nur bewusstlos — nicht tot. Man hat dich schon öfter abgeschrieben.' },

  /* ---- Handwerk ---- */
  { id:'kletter',   n:'Klettermaat',        kat:'Handwerk', rang:0, vor:[['Athletik',2]],
    d:'In der Takelage und an jeder Wand: Athletik eine Würfelstufe höher.' },
  { id:'markt',     n:'Marktkenner',        kat:'Handwerk', rang:0, vor:[['Handel',3]],
    d:'Du erkennst Wert und Herkunft einer Ware auf einen Blick: Handel eine Stufe höher.' },
  { id:'feldscher', n:'Feldscher',          kat:'Handwerk', rang:0, vor:[['Heilkunde',3]],
    d:'Bei der Versorgung frischer Wunden: Heilkunde eine Stufe höher. Du hast mehr Männer zusammengeflickt, als dir lieb ist.' },
  { id:'schlitz',   n:'Schlitzohr',         kat:'Handwerk', rang:0, vor:[['Diebeskunst',3]],
    d:'Schlösser, Taschen, unbeobachtete Wege: Diebeskunst eine Stufe höher.' },
  { id:'sterne',    n:'Sterndeuter',        kat:'Handwerk', rang:1, vor:[['Navigation',3]],
    d:'Nacht, Nebel und schwere See erschweren dir die Navigation nicht. Einmal je Sitzung findest du einen verlorenen Kurs wieder.' },
  { id:'bastler',   n:'Improvisierer',      kat:'Handwerk', rang:1, vor:[['Handwerk',3]],
    d:'Einmal je Szene hast du genau das dabei, was jetzt nötig wäre — oder baust es aus dem, was herumliegt.' },

  /* ---- Kampf ---- */
  { id:'entern',    n:'Enterhaken',         kat:'Kampf', rang:0, vor:[['Kämpfen',2]],
    d:'Im ersten Zug nach dem Übersetzen auf ein fremdes Deck kämpfst du eine Stufe höher. Du bist gern der Erste drüben.' },
  { id:'kalt',      n:'Kaltblütig',         kat:'Kampf', rang:0, vor:[['Willenskraft',2]],
    d:'Bedrängnis trifft dich eine Stufe schwächer. Zwei Gegner sind für dich wie einer.' },
  { id:'duell',     n:'Duellant',           kat:'Kampf', rang:1, vor:[['Kämpfen',3]],
    d:'Steht dir genau ein Gegner gegenüber, kämpfst du eine Stufe höher. Im Getümmel nützt dir das nichts.' },
  { id:'beidhand',  n:'Beidhändig',         kat:'Kampf', rang:1, vor:[['Geschicklichkeit',3]],
    d:'Säbel in der einen, Pistole in der anderen Hand — die zweite Waffe bringt dir keinen Abzug.' },
  { id:'ruhig',     n:'Ruhige Hand',        kat:'Kampf', rang:1, vor:[['Schießen',3]],
    d:'Auf Entfernung erschwert dir die Distanz eine Stufe weniger. Du schießt, wenn die anderen noch zielen.' },
  { id:'erster',    n:'Erster Streich',     kat:'Kampf', rang:2, vor:[['Kämpfen',4]],
    d:'Wer in deine Reichweite tritt, kassiert einen freien Angriff, bevor er selbst zuschlägt.' },
  { id:'meister',   n:'Meisterfechter',     kat:'Kampf', rang:3, vor:[['Kämpfen',5]],
    d:'Einmal je Kampf wird ein Treffer von dir zum guten Erfolg, ohne dass du dafür würfelst.' },

  /* ---- Umgang ---- */
  { id:'zunge',     n:'Zungenfertig',       kat:'Umgang', rang:0, vor:[['Überreden',2]],
    d:'Einmal je Szene darfst du eine misslungene Überreden-Probe wiederholen. Dir fällt immer noch etwas ein.' },
  { id:'hafen',     n:'Überall bekannt',    kat:'Umgang', rang:1, vor:[['Gassenwissen',3]],
    d:'In jedem größeren Hafen kennst du jemanden, der dir noch etwas schuldet. Wie gern er zahlt, steht auf einem anderen Blatt.' },
  { id:'drohend',   n:'Drohende Gegenwart', kat:'Umgang', rang:1, vor:[['Einschüchtern',3]],
    d:'Wo andere überreden müssen, genügt bei dir, dass du im Raum stehst. Einschüchtern ersetzt Überreden.' },

  /* ---- Führung ---- */
  { id:'kommando',  n:'Kommandostimme',     kat:'Führung', rang:1, vor:[['Willenskraft',3]],
    d:'Deine Befehle sind auch im Getümmel zu hören. Verbündete in Rufweite dürfen einen misslungenen Wurf gegen Furcht wiederholen.' },
  { id:'anfeuern',  n:'Anfeuern',           kat:'Führung', rang:1, vor:[['Überreden',3]],
    d:'Einmal je Szene gibst du einem Verbündeten einen deiner Bennies — mit einem Satz, der im richtigen Moment kommt.' },
  { id:'zusammen',  n:'Zusammenhalt',       kat:'Führung', rang:2, vor:[['Willenskraft',3]],
    d:'Verbündete, die neben dir stehen, wehren Bedrängnis eine Stufe besser ab. Rücken an Rücken hält länger.' },
  { id:'taktik',    n:'Taktischer Blick',   kat:'Führung', rang:2, vor:[['Verstand',3],['Kämpfen',3]],
    d:'Zu Beginn eines Kampfes darf die Gruppe zwei Figuren in der Zugreihenfolge tauschen. Du siehst, wer zuerst dran sein muss.' },

  /* ---- Unheimliches ---- */
  { id:'vorahnung', n:'Vorahnung',          kat:'Unheimliches', rang:1, vor:[['Aufmerksamkeit',3]],
    d:'Bevor du in etwas Tödliches läufst, wird dir kalt. Die Spielleitung muss dich warnen — nicht sagen, was es ist.' },
  { id:'standhaft', n:'Standhaft',          kat:'Unheimliches', rang:1, vor:[['Willenskraft',3]],
    d:'Gegen Furcht und gegen das, was nicht tot bleibt: eine Stufe höher. Du hast entschieden, nicht wegzulaufen.' },
  { id:'omen',      n:'Zeichenleser',       kat:'Unheimliches', rang:2, vor:[['Allgemeinwissen',3]],
    d:'Einmal je Sitzung fragst du, ob ein Vorhaben unter einem guten Zeichen steht. Die Antwort ist ehrlich: gut, schlecht oder unklar.' },

  /* ==========================================================
     Zwoelf Talente mit Seefahrtsdrall, zwei je Kategorie.
     Stossrichtung angelehnt an die nautischen Talente der
     Savage-Worlds-Settings "50 Fathoms" und "Pirates of the
     Spanish Main" (enger Raum, unsauberer Kampf, Schwimmen,
     Schiffsfuehrung); Wirkung und Texte sind eigene.

     WICHTIG: Jede Kategorie hat dadurch mindestens ein
     Novizen-Talent. Vorher waren Fuehrung und Unheimliches
     fuer neue Figuren komplett zu - ausgerechnet die beiden
     Zweige, die ergaenzt wurden, weil sie fehlten.
     ========================================================== */

  /* ---- Hintergrund ---- */
  { id:'schwimmer', n:'Wassergänger',        kat:'Hintergrund', rang:0, vor:[['Athletik',2]],
    d:'Du schwimmst, wie andere gehen. Über Bord zu gehen ist für dich ein Ärgernis, kein Todesurteil.' },
  { id:'magen',     n:'Eiserner Magen',      kat:'Hintergrund', rang:0, vor:[['Konstitution',2]],
    d:'Pökelfleisch am Rand, brackiges Wasser, Zwieback mit Bewohnern — dir wird davon nichts. Gegen Verdorbenes und schwache Gifte würfelst du eine Stufe höher.' },

  /* ---- Handwerk ---- */
  { id:'kanonier',  n:'Kanonier',            kat:'Handwerk', rang:0, vor:[['Schießen',2]],
    d:'Laden, richten, abfeuern — an einem Geschütz bist du zu Hause. Schießen mit schwerem Gerät eine Stufe höher.' },
  { id:'zimmerer',  n:'Schiffszimmermann',   kat:'Handwerk', rang:1, vor:[['Handwerk',3]],
    d:'Lecks stopfen, Masten fischen, Planken flicken — auch während geschossen wird. Reparaturen an einem Schiff gelingen dir unter Beschuss ohne Erschwernis.' },

  /* ---- Kampf ---- */
  { id:'enge',      n:'Enger Raum',          kat:'Kampf', rang:0, vor:[['Kämpfen',2]],
    d:'Unter Deck, in Gängen, an der Luke: wo lange Klingen und weite Ausholbewegungen im Weg sind, kämpfst du eine Stufe höher.' },
  { id:'unfair',    n:'Kein Kodex',          kat:'Kampf', rang:0, vor:[['Kämpfen',2]],
    d:'Sand, Tritte, der Krug ins Gesicht. Einmal je Kampf verschaffst du dir einen Vorteil aus etwas, das kein Ehrenmann täte.' },

  /* ---- Umgang ---- */
  { id:'shanty',    n:'Shanty-Sänger',       kat:'Umgang', rang:0, vor:[['Überreden',2]],
    d:'Du hältst den Takt und die Laune. Bei stumpfer Arbeit und langer Fahrt hebst du die Stimmung der ganzen Mannschaft — die Spielleitung weiß, was das wert ist.' },
  { id:'luegner',   n:'Glatte Zunge',        kat:'Umgang', rang:1, vor:[['Überreden',3]],
    d:'Eine Lüge, die du selbst glaubst, hält jeder Prüfung stand. Einmal je Sitzung nimmt man dir eine Geschichte ab, die niemandem sonst abgekauft würde.' },

  /* ---- Führung ---- */
  { id:'bootsmann', n:'Bootsmann',           kat:'Führung', rang:0, vor:[['Willenskraft',2]],
    d:'Du bringst eine Handvoll Leute dazu, gleichzeitig anzupacken. Wo viele Hände nötig sind — Segel, Anker, Kanone, Pumpe —, arbeitet die Gruppe unter dir eine Stufe stärker.' },
  { id:'kapitaen',  n:'Herr über Schiff und Mannschaft', kat:'Führung', rang:2, vor:[['Segeln',4],['Einschüchtern',3]],
    d:'Im Gefecht führst du das Schiff, als wäre es dein eigener Körper. Solange du an Deck stehst und befiehlst, gelingt der Mannschaft jedes Manöver eine Stufe besser.' },

  /* ---- Unheimliches ---- */
  { id:'garn',      n:'Seemannsgarn',        kat:'Unheimliches', rang:0, vor:[['Allgemeinwissen',2]],
    d:'Du kennst die Geschichten — welche Insel man meidet, was man einem Ertrunkenen nicht nachruft. Einmal je Sitzung darfst du fragen, ob es zu einer Sache eine alte Geschichte gibt.' },
  { id:'totenstill',n:'Totenstill',          kat:'Unheimliches', rang:1, vor:[['Willenskraft',3]],
    d:'Was von den Toten kommt, wählt dich zuletzt. Solange ein anderes Ziel in Reichweite steht, gehen Untote und Geister an dir vorbei.' }
];

/* ==========================================================
   HANDICAPS
   Die Staerke der offiziellen Liste liegt nicht bei den
   Wuerfel-Abzuegen, sondern bei den Verpflichtungen: Schwur,
   Erzfeind, Getrieben, Treu. Die loesen Szenen aus, statt
   Werte zu senken. "haken" markiert diese Sorte.
   ========================================================== */
const HANDICAPS = [
  /* ---- schwer ---- */
  { id:'landratte', n:'Landratte',      schwer:true,  haken:false,
    d:'An Bord und auf See: Segeln und Athletik eine Würfelstufe niedriger. Warum bist du überhaupt hier?' },
  { id:'aufbraus',  n:'Aufbrausend',    schwer:true,  haken:true,
    d:'Wirst du ernsthaft provoziert, brauchst du eine Willenskraft-Probe — sonst schlägst du zu.' },
  { id:'knochen',   n:'Alter Knochen',  schwer:true,  haken:false,
    d:'Wo Ausdauer und rohe Kraft zählen: Stärke eine Stufe niedriger.' },
  { id:'gesucht',   n:'Gesucht',        schwer:true,  haken:true,
    d:'In jedem größeren Hafen kann dich jemand erkennen. Und einer wird es.' },
  { id:'trunk',     n:'Trunksüchtig',   schwer:true,  haken:true,
    d:'Ohne Rum am Abend ist der ganze folgende Tag eine Stufe niedriger.' },
  { id:'blut',      n:'Blutschuld',     schwer:true,  haken:true,
    d:'Jemand an Bord weiß etwas über dich, das niemand wissen darf.' },
  { id:'schwur',    n:'Schwur',         schwer:true,  haken:true,
    d:'Du hast jemandem etwas geschworen und hältst dich daran — auch wenn es die Gruppe teuer zu stehen kommt. Sag beim Erschaffen, wem und was.' },
  { id:'erzfeind',  n:'Erzfeind',       schwer:true,  haken:true,
    d:'Jemand sucht dich, seit Jahren, und gibt nicht auf. Er wird auftauchen, wenn es am wenigsten passt.' },
  { id:'getrieben', n:'Getrieben',      schwer:true,  haken:true,
    d:'Etwas treibt dich, und du kannst nicht wegsehen, wenn sich die Gelegenheit bietet. Was es ist, bestimmst du.' },

  /* ---- leicht ---- */
  { id:'glaube',    n:'Aberglaube',     schwer:false, haken:true,
    d:'Zeichen, Omen, Rituale — du hältst sie ein, auch wenn es gerade nicht passt.' },
  { id:'seekrank',  n:'Seekrank',       schwer:false, haken:false,
    d:'Bei schwerer See ist deine erste Szene eine Stufe niedriger.' },
  { id:'schulden',  n:'Schulden',       schwer:false, haken:true,
    d:'Ein Teil jeder Beute ist längst vergeben. Der Gläubiger vergisst nicht.' },
  { id:'neugier',   n:'Neugierig',      schwer:false, haken:true,
    d:'Eine verschlossene Tür lässt dich nicht in Ruhe.' },
  { id:'mundwerk',  n:'Loses Mundwerk', schwer:false, haken:true,
    d:'Du sagst das Falsche — und zwar zur falschen Person.' },
  { id:'nachtblind',n:'Nachtblind',     schwer:false, haken:false,
    d:'Bei Dunkelheit: Aufmerksamkeit eine Stufe niedriger.' },
  { id:'ehrenwort', n:'Ehrenwort',      schwer:false, haken:true,
    d:'Ein gegebenes Versprechen bindet dich, koste es, was es wolle.' },
  { id:'narbe',     n:'Narbe',          schwer:false, haken:false,
    d:'Bei Fremden und bei Hofe: Überreden eine Stufe niedriger.' },
  { id:'pflicht',   n:'Verpflichtung',  schwer:false, haken:true,
    d:'Jemand an Land hängt von deinem Anteil ab — eine Familie, ein Kind, ein Gläubiger. Du musst regelmäßig etwas schicken.' },
  { id:'treu',      n:'Treu',           schwer:false, haken:true,
    d:'Du lässt niemanden zurück, auch wenn es klüger wäre. Besonders nicht die, die zu dir gehören.' },
  { id:'stolz',     n:'Stolz',          schwer:false, haken:true,
    d:'Eine Beleidigung deiner Ehre erträgst du nicht schweigend. Widerworte sind das Mindeste.' }
];

const TAL_BY_ID = {}; TALENTE.forEach(function (t) { TAL_BY_ID[t.id] = t; });
const HND_BY_ID = {}; HANDICAPS.forEach(function (h) { HND_BY_ID[h.id] = h; });
function talenteDerKategorie(kat) { return TALENTE.filter(function (t) { return t.kat === kat; }); }

const CREW_STEPS = ['Unbekannt','Bemerkt','Respektiert','Vertraut','Unverzichtbar'];

/* ==========================================================
   FIGUR
   ========================================================== */
// Eine Figur beginnt leer. Es gibt bewusst KEINE Startpakete: die
// Erschaffung laeuft ueber Schwaechen und Talente, und ein Paket, das
// Attribute und Fertigkeiten vorab fuellt, wuerde genau diesen Weg
// ueberspringen.
function leereFigur() {
  const f = { rang:0, steigerungen:0, attr:{}, fert:{}, tal:[], hnd:[], brief:{} };
  ATTR_NAMEN.forEach(function (a) { f.attr[a] = 1; });                       // alles d4
  FERTIGKEITEN.forEach(function (s) { f.fert[s.name] = s.kern ? 1 : UNGELERNT; });
  STECKBRIEF.forEach(function (b) { f.brief[b.id] = ''; });
  return f;
}

/* ---------- Kosten ---------- */
function startStufe(fertName) {
  const f = FERT_BY_NAME[fertName];
  return (f && f.kern) ? 1 : UNGELERNT;
}
// Eine Stufe kostet 1, solange die Fertigkeit ihr Attribut nicht uebersteigt, sonst 2.
function fertKosten(figur, fertName, stufe) {
  const def = FERT_BY_NAME[fertName];
  if (!def) return 0;
  const cap = figur.attr[def.attr] || 1;
  let c = 0;
  for (let t = startStufe(fertName) + 1; t <= stufe; t++) c += (t <= cap) ? 1 : 2;
  return c;
}
function ausgabenAttr(figur) {
  let t = 0; ATTR_NAMEN.forEach(function (a) { t += (figur.attr[a] || 1) - 1; }); return t;
}
function ausgabenFert(figur) {
  let t = 0;
  FERTIGKEITEN.forEach(function (s) { t += fertKosten(figur, s.name, figur.fert[s.name] || 0); });
  return t;
}
function handicapPunkte(figur) {
  let t = 0;
  figur.hnd.forEach(function (id) { const h = HND_BY_ID[id]; if (h) t += h.schwer ? 2 : 1; });
  return t;
}
function ausgabenTalent(figur) {
  return Math.max(0, figur.tal.length - GRATIS_TALENTE) * TALENT_KOSTEN;
}
function zaehleSchwer(figur) { return figur.hnd.filter(function (i) { return HND_BY_ID[i] && HND_BY_ID[i].schwer; }).length; }
function zaehleLeicht(figur) { return figur.hnd.filter(function (i) { return HND_BY_ID[i] && !HND_BY_ID[i].schwer; }).length; }

/* ---------- Abgeleitete Werte ---------- */
function halbe(stufe) { return stufe >= 1 ? SIDES[stufe] / 2 : 2; }
function parade(figur)     { return 2 + halbe(figur.fert['Kämpfen'] || 0); }
function robustheit(figur) { return 2 + halbe(figur.attr['Konstitution'] || 1) + (figur.tal.indexOf('grob') >= 0 ? 1 : 0); }
function bennies(figur)    { return BENNIES + (figur.tal.indexOf('glueck') >= 0 ? 1 : 0); }
function bewegung()        { return BEWEGUNG; }

/* ---------- Voraussetzungen ---------- */
function wertVon(figur, name) {
  if (istAttribut(name)) return figur.attr[name] || 1;
  return figur.fert[name] || 0;
}
function talentVerfuegbar(figur, talent) {
  const gruende = [];
  if ((talent.rang || 0) > (figur.rang || 0)) gruende.push('ab ' + rangName(talent.rang));
  (talent.vor || []).forEach(function (v) {
    if (wertVon(figur, v[0]) < v[1]) gruende.push(v[0] + ' ' + DLBL[v[1]]);
  });
  return { ok: gruende.length === 0, gruende: gruende };
}

/* ----------------------------------------------------------
   WEICHE VORAUSSETZUNGEN
   ----------------------------------------------------------
   Die Erschaffung laeuft in der Reihenfolge Schwaechen ->
   Talente -> Attribute -> Fertigkeiten. Ein Talent wird also
   gewaehlt, BEVOR die Werte dafuer stehen - es sagt der Figur
   erst, welche Werte sie braucht.

   Deshalb zwei Sorten Voraussetzung:
     Rang   - harte Sperre. Laesst sich mit Punkten nicht
              kaufen, also darf man das Talent gar nicht erst
              waehlen.
     Werte  - weiches Ziel. Waehlbar, und die spaeteren
              Schritte zeigen an, was noch fehlt.
   ---------------------------------------------------------- */
function talentWaehlbar(figur, talent) {
  const rangOk = (talent.rang || 0) <= (figur.rang || 0);
  return { ok: rangOk, gruende: rangOk ? [] : ['ab ' + rangName(talent.rang)] };
}

// Hoechster Wert, den die gewaehlten Talente fuer "name" verlangen (0 = keiner).
function verlangtVon(figur, name) {
  let hoch = 0;
  figur.tal.forEach(function (id) {
    const t = TAL_BY_ID[id];
    if (!t) return;
    (t.vor || []).forEach(function (v) { if (v[0] === name && v[1] > hoch) hoch = v[1]; });
  });
  return hoch;
}

// Alles, was die gewaehlten Talente verlangen und noch nicht erreicht ist.
function offeneVoraussetzungen(figur) {
  const noetig = {};
  figur.tal.forEach(function (id) {
    const t = TAL_BY_ID[id];
    if (!t) return;
    (t.vor || []).forEach(function (v) {
      if (!noetig[v[0]] || v[1] > noetig[v[0]].noetig) {
        noetig[v[0]] = { wert:v[0], noetig:v[1], attribut:istAttribut(v[0]), von:[] };
      }
    });
  });
  figur.tal.forEach(function (id) {
    const t = TAL_BY_ID[id];
    if (!t) return;
    (t.vor || []).forEach(function (v) {
      if (noetig[v[0]] && noetig[v[0]].von.indexOf(t.n) < 0) noetig[v[0]].von.push(t.n);
    });
  });
  return Object.keys(noetig).map(function (k) {
    const e = noetig[k];
    e.ist = wertVon(figur, k);
    e.erfuellt = e.ist >= e.noetig;
    return e;
  }).filter(function (e) { return !e.erfuellt; });
}

function pruefeFigur(figur) {
  const p = [];
  const aOffen = ATTR_PUNKTE - ausgabenAttr(figur);
  const fOffen = FERT_PUNKTE - ausgabenFert(figur);
  const tOffen = handicapPunkte(figur) - ausgabenTalent(figur);
  if (aOffen < 0) p.push('Attributspunkte überzogen');
  if (fOffen < 0) p.push('Fertigkeitspunkte überzogen');
  if (tOffen < 0) p.push('Talente nicht bezahlt');
  if (zaehleSchwer(figur) > MAX_SCHWER) p.push('höchstens ein schweres Handicap');
  if (zaehleLeicht(figur) > MAX_LEICHT) p.push('höchstens zwei leichte Handicaps');
  figur.tal.forEach(function (id) {
    const t = TAL_BY_ID[id];
    if (t && !talentVerfuegbar(figur, t).ok) p.push(t.n + ': Voraussetzung fehlt');
  });
  return { ok:p.length === 0, probleme:p, attrOffen:aOffen, fertOffen:fOffen, talentOffen:tOffen };
}

/* ==========================================================
   WAHRSCHEINLICHKEITEN — exakt gerechnet, nicht simuliert
   ----------------------------------------------------------
   Wert-Wuerfel und Wild Die werden getrennt gelesen:
     beide    -> gut        nur Wert -> normal
     nur Wild -> schlecht   keiner   -> miss
   Ungelernt gibt es keinen Wert-Wuerfel: dann traegt allein
   der Wild Die, es kann also hoechstens ein schlechter Erfolg
   herauskommen. "Du hast kein Handwerk, nur Glueck."
   ========================================================== */
function pTrifft(seiten) { return Math.max(0, seiten - ZIELZAHL + 1) / seiten; }

function chancen(stufe, opts) {
  opts = opts || {};
  const wild = (opts.wild === undefined) ? true : !!opts.wild;   // Statisten werfen ohne Wild Die
  const eff = Math.max(0, (stufe || 0) - Math.max(0, opts.erschwernis || 0));
  const leer = { gut:0, normal:0, schlecht:0, miss:0 };

  if (!wild) {
    if (eff < 1) return Object.assign({}, leer, { miss:1 });
    const p = pTrifft(SIDES[eff]);
    return Object.assign({}, leer, { normal:p, miss:1 - p });
  }

  const pW = pTrifft(WILD_DIE);
  if (eff < 1) return Object.assign({}, leer, { schlecht:pW, miss:1 - pW, ungelernt:true });

  const pT = pTrifft(SIDES[eff]);
  return {
    gut:      pT * pW,
    normal:   pT * (1 - pW),
    schlecht: (1 - pT) * pW,
    miss:     (1 - pT) * (1 - pW)
  };
}

const BAENDER = ['gut', 'normal', 'schlecht', 'miss'];
const BAND_NAMEN = { gut:'Guter Erfolg', normal:'Erfolg', schlecht:'Schlechter Erfolg', miss:'Misserfolg' };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SIDES, DLBL, MAXD, UNGELERNT, WILD_DIE, ZIELZAHL,
    ATTRIBUTE, ATTR_NAMEN, FERTIGKEITEN, FERT_NAMEN, FERT_BY_NAME, ATTR_BY_NAME,
    fertigkeitenVon, istAttribut,
    ATTR_PUNKTE, FERT_PUNKTE, GRATIS_TALENTE, TALENT_KOSTEN, MAX_SCHWER, MAX_LEICHT,
    BENNIES, BEWEGUNG, RAENGE, rangVon, rangName, STECKBRIEF, CREW_STEPS,
    TALENT_KATEGORIEN, TALENTE, HANDICAPS, TAL_BY_ID, HND_BY_ID, talenteDerKategorie,
    leereFigur, startStufe, fertKosten, ausgabenAttr, ausgabenFert,
    handicapPunkte, ausgabenTalent, zaehleSchwer, zaehleLeicht,
    parade, robustheit, bennies, bewegung, wertVon, talentVerfuegbar, pruefeFigur,
    talentWaehlbar, verlangtVon, offeneVoraussetzungen,
    pTrifft, chancen, BAENDER, BAND_NAMEN
  };
}
