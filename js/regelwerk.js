/* ==========================================================
   REGELWERK — Savage Worlds, unveraendert
   ----------------------------------------------------------
   Eigenstaendig. Haengt an NICHTS aus der laufenden Kampagne -
   nicht an js/regie.js, nicht an den Szenendateien, nicht an
   Firebase. Die Zuordnung der Proben im Abenteuertext auf
   diese Werte ist ein spaeterer, eigener Schritt und findet
   NICHT hier statt.

   Das alte W100-Wertegeruest (vier Grundwerte "Koerper/INT/
   Auftreten/Wahrnehmung" ueber vierzehn Fertigkeiten) ist
   vollstaendig entfallen.

   ---- Kein eigenes Sueppchen mehr ----
   Bis September 2026 stand hier eine Hausregel: Wert-Wuerfel
   und Wild Die wurden GETRENNT gelesen, woraus sich vier
   Baender ergaben - guter / normaler / schlechter Erfolg und
   Misserfolg. Der "schlechte Erfolg" (es gelingt, aber nur
   durch Glueck) hat am Tisch keine Freude gemacht: Die
   Spielleitung musste jedes Mal einen halben Erfolg erzaehlen,
   den niemand wollte, und ausgerechnet frische Figuren landeten
   dort am haeufigsten (37,5 % auf d4). Hendriks Entscheidung:
   ganz weg, und das Original uebernehmen.

   ---- Der Kern ----
   Jeder Wert ist ein Wuerfel: d4 · d6 · d8 · d10 · d12.
   Spielerfiguren werfen ihren Wert-Wuerfel UND den Wild Die (d6).
   Beide explodieren. Der HOEHERE der beiden zaehlt.

     unter 4                   -> Misserfolg
     4 und mehr                -> Erfolg
     8 / 12 / ...              -> Erfolg mit 1 / 2 / ... Steigerungen
     beide zeigen eine 1       -> Kritischer Patzer

   Ungelernt ist d4 mit -2 - moeglich, nur schlecht. (Unter der
   alten Hausregel konnte ungelernt UEBERHAUPT NIE gelingen.)
   Erschwernisse sind flache Zahlen, keine Wuerfelstufen.
   Wunden ziehen flach ab, statt den Wuerfel zu senken.

   Der Rechenkern (chancen/pMind) ist gegen die veroeffentlichten
   Werte des Regelwerks geprueft: d4 schafft 4+ zu 25 %, d8 zu
   62,5 %, d12 zu 75 %, d4 erreicht 8+ zu 6,25 %, und eine
   Spielerfigur mit d4 plus Wild Die gelingt zu 62,5 %.

   Eine echte Eigenheit des Originals, die am Tisch auffallen
   wird: d6 holt etwas OEFTER eine Steigerung als d8 (13,9 % zu
   12,5 %), weil ein d6 haeufiger explodiert. Das ist so gewollt
   im Regelwerk und kein Fehler dieser Datei.
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
const MAX_WUNDEN = 3;      // die vierte nimmt die Figur aus dem Spiel

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

   PRAEMISSE (Kanon, SZENEN_REGIE["1.1"] und Bibel 9):
   Die erste Sitzung spielt in Grimsgate. Im Hafen liegt eine
   Siedlungsfahrt in die Neue Welt, die halbe Stadt will mit -
   und die Schiffe sind voll. Uebergeordnetes Ziel der Szene:
   ueberhaupt an Bord zu gelangen; angeheuert wird "freiwillig
   oder gepresst".

   Bei der Erschaffung steht die Figur also IN GRIMSGATE, ohne
   Platz, ohne Schiff und ohne die anderen zu kennen. Deshalb
   fragt hier nichts nach dem Schiff, nach gemeinsamer
   Vorgeschichte oder nach der ersten Begegnung der Gruppe -
   das alles weiss die Figur noch nicht oder es entsteht am
   Tisch. Jede Frage hier muss zum Zeitpunkt der Erschaffung
   beantwortbar sein.
   ========================================================== */
const STECKBRIEF = [
  { id:'antrieb',   n:'Antrieb',    frage:'Warum willst du in die neue Welt?',
    hilfe:'Ein Satz. Kostet er dich einmal etwas, bekommst du dafür einen Bennie.',
    beispiel:'Zu Hause bin ich der zweite Sohn und erbe nichts. Drüben fragt danach niemand.' },
  { id:'ballast',   n:'Ballast',    frage:'Was oder wen lässt du zurück?',
    hilfe:'Die andere Hälfte deines Antriebs. Was hinter dir liegt, holt Figuren gern wieder ein.',
    beispiel:'Eine Frau, der ich gesagt habe, ich komme wieder. Ich weiß nicht, ob es stimmt.' },
  { id:'mittel',    n:'Mittel',     frage:'Womit willst du dir einen Platz verschaffen?',
    hilfe:'Die Schiffe sind voll und die halbe Stadt will mit. Geld, ein Handwerk, eine Bekanntschaft — oder gar nichts, und du hoffst auf Glück.',
    beispiel:'Zwei Wochen Lohn, gespart. Das reicht vermutlich nicht, aber es ist alles, was ich habe.' },
  { id:'geheimnis', n:'Geheimnis',  frage:'Was darf niemand wissen?',
    hilfe:'Etwas, das herauskommen kann. Sag es der Spielleitung, nicht dem Tisch.',
    beispiel:'Das Schiff, auf dem ich vorher fuhr, ist nicht gesunken. Ich habe es verkauft.' },
  { id:'marke',     n:'Marke',      frage:'Woran erkennt man dich wieder?',
    hilfe:'Eine Narbe, ein Tick, ein Gegenstand, den du nie ablegst.',
    beispiel:'Ein abgegriffener Messingring am kleinen Finger, den ich beim Denken drehe.' }
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
   AUSRUESTUNG
   ----------------------------------------------------------
   "schaden" ist eine Wuerfelstufe wie jeder andere Wert
   (1..5 = d4..d12) - in diesem System wird nichts addiert,
   eine Waffe bringt also ihren eigenen Wuerfel mit statt einen
   Bonus auf einen anderen.

   "ruest" hebt die Robustheit. "gew" ist Gewicht gegen die
   Traglast, die an der Staerke haengt.

   Preise in Muenzen. Die Zahlen sind ein Aufschlag und als
   Stellschraube gedacht - was ein Saebel 1720 in der Karibik
   gekostet hat, weiss niemand genau, und fuers Spiel zaehlt
   nur das Verhaeltnis zueinander.
   ========================================================== */
const AUSR_ARTEN = ['Nahkampf', 'Fernkampf', 'Schutz', 'Gerät'];
const STARTGELD = 500;

const AUSRUESTUNG = [
  /* ---- Nahkampf ---- */
  { id:'faust',      n:'Bloße Fäuste',      art:'Nahkampf', schaden:1, gew:0,  preis:0,
    d:'Hast du immer dabei. Reicht selten.' },
  { id:'messer',     n:'Messer',            art:'Nahkampf', schaden:1, gew:1,  preis:25,
    d:'Unauffällig, überall dabei, im Ernstfall zu kurz.' },
  { id:'belegnagel', n:'Belegnagel',        art:'Nahkampf', schaden:1, gew:2,  preis:10,
    d:'Liegt an jeder Reling. Keiner nimmt dir übel, dass du ihn in der Hand hast.' },
  { id:'entermesser',n:'Entermesser',       art:'Nahkampf', schaden:2, gew:4,  preis:200,
    d:'Kurz, schwer, für den engen Raum unter Deck gemacht.' },
  { id:'saebel',     n:'Säbel',             art:'Nahkampf', schaden:2, gew:3,  preis:250,
    d:'Die Waffe dessen, der fechten gelernt hat — oder so tun will.' },
  { id:'enteraxt',   n:'Enteraxt',          art:'Nahkampf', schaden:2, gew:5,  preis:150,
    d:'Öffnet Türen, Luken und Menschen. Nicht elegant.' },
  { id:'pike',       n:'Pike',              art:'Nahkampf', schaden:2, gew:8,  preis:100,
    d:'Hält den Gegner auf Abstand — an Deck oft im Weg.' },

  /* ---- Fernkampf ---- */
  { id:'wurfmesser', n:'Wurfmesser',        art:'Fernkampf', schaden:1, gew:1, preis:30,  reichweite:3,
    d:'Leise. Danach hat es der andere.' },
  { id:'pistole',    n:'Steinschlosspistole',art:'Fernkampf',schaden:2, gew:3, preis:350, reichweite:5,
    d:'Ein Schuss. Danach ist sie ein schlechter Knüppel — Nachladen dauert eine Runde.' },
  { id:'tromblon',   n:'Donnerbüchse',      art:'Fernkampf', schaden:2, gew:6, preis:400, reichweite:3,
    d:'Streut breit, trifft alles vor der Mündung. Nachladen dauert zwei Runden.' },
  { id:'muskete',    n:'Muskete',           art:'Fernkampf', schaden:3, gew:8, preis:500, reichweite:12,
    d:'Auf Entfernung tödlich, an Deck unhandlich. Nachladen dauert zwei Runden.' },

  /* ---- Schutz ---- */
  { id:'lederwams',  n:'Lederwams',         art:'Schutz', ruest:1, gew:5,  preis:200,
    d:'Robustheit +1. Fällt an Bord niemandem auf.' },
  { id:'kettenhemd', n:'Kettenhemd',        art:'Schutz', ruest:2, gew:12, preis:800,
    d:'Robustheit +2. Wer damit über Bord geht, geht unter.' },
  { id:'harnisch',   n:'Brustharnisch',     art:'Schutz', ruest:3, gew:20, preis:2000,
    d:'Robustheit +3. Spanische Soldatenware. Man sieht dich kommen und hören kann man dich auch.' },

  /* ---- Gerät ---- */
  { id:'enterhaken', n:'Enterhaken mit Tau',art:'Gerät', gew:6, preis:80,
    d:'Der kürzeste Weg auf ein fremdes Deck.' },
  { id:'fernrohr',   n:'Fernrohr',          art:'Gerät', gew:2, preis:400,
    d:'Sieht, was andere erst später sehen.' },
  { id:'kompass',    n:'Kompass',           art:'Gerät', gew:1, preis:300,
    d:'Bei Nebel und Nacht der Unterschied zwischen Kurs und Raten.' },
  { id:'laterne',    n:'Laterne',           art:'Gerät', gew:3, preis:60,
    d:'Licht, das dich auch verrät.' },
  { id:'dietriche',  n:'Dietriche',         art:'Gerät', gew:1, preis:120,
    d:'Wer sie bei dir findet, hat schon eine Meinung über dich.' },
  { id:'verband',    n:'Verbandszeug',      art:'Gerät', gew:2, preis:90,
    d:'Nadel, Faden, Leinen, Branntwein. Reicht für drei Männer.' },
  { id:'seil',       n:'Seil, zwanzig Schritt', art:'Gerät', gew:5, preis:40,
    d:'Man braucht es immer dann, wenn man es nicht hat.' },
  { id:'proviant',   n:'Proviant für drei Tage', art:'Gerät', gew:4, preis:30,
    d:'Zwieback, Pökelfleisch, Wasser. Schmeckt nach nichts.' },
  { id:'rum',        n:'Flasche Rum',       art:'Gerät', gew:2, preis:50,
    d:'Betäubungsmittel, Desinfektion, Zahlungsmittel, Freundschaftsangebot.' },
  { id:'schreibzeug',n:'Schreibzeug',       art:'Gerät', gew:2, preis:150,
    d:'Feder, Tinte, Papier. Wer schreiben kann, gilt schon als halber Herr.' }
];

const AUSR_BY_ID = {}; AUSRUESTUNG.forEach(function (a) { AUSR_BY_ID[a.id] = a; });
function ausruestungDerArt(art) { return AUSRUESTUNG.filter(function (a) { return a.art === art; }); }

/* Traglast haengt an der Staerke: doppelte Seitenzahl des Wuerfels.
   d4 = 8 · d6 = 12 · d8 = 16 · d10 = 20 · d12 = 24 */
function traglast(figur) { return SIDES[figur.attr['Stärke'] || 1] * 2; }
function getragen(figur) {
  let g = 0;
  (figur.ausr || []).forEach(function (id) { const a = AUSR_BY_ID[id]; if (a) g += a.gew || 0; });
  return g;
}
function ueberladen(figur) { return getragen(figur) > traglast(figur); }
function ruestbonus(figur) {
  let r = 0;
  (figur.ausr || []).forEach(function (id) { const a = AUSR_BY_ID[id]; if (a && a.ruest) r += a.ruest; });
  return r;
}
function ausgabenMuenzen(figur) {
  let m = 0;
  (figur.ausr || []).forEach(function (id) { const a = AUSR_BY_ID[id]; if (a) m += a.preis || 0; });
  return m;
}

/* ==========================================================
   FIGUR
   ========================================================== */
// Eine Figur beginnt leer. Es gibt bewusst KEINE Startpakete: die
// Erschaffung laeuft ueber Schwaechen und Talente, und ein Paket, das
// Attribute und Fertigkeiten vorab fuellt, wuerde genau diesen Weg
// ueberspringen.
function leereFigur() {
  const f = {
    rang:0, steigerungen:0,
    attributImRang:false,          // "Attribut nur einmal je Rang" braucht einen Merker
    attr:{}, fert:{}, tal:[], hnd:[], brief:{},
    ausr:[], muenzen:STARTGELD,    // Ausruestung als Liste von IDs
    angeschlagen:false, wunden:0,  // Zustand im Spiel
    benniesUebrig:null,            // null = noch nicht angefasst, dann gilt bennies(figur)
    notizen:''
  };
  ATTR_NAMEN.forEach(function (a) { f.attr[a] = 1; });                       // alles d4
  FERTIGKEITEN.forEach(function (s) { f.fert[s.name] = s.kern ? 1 : UNGELERNT; });
  STECKBRIEF.forEach(function (b) { f.brief[b.id] = ''; });
  return f;
}

/* Baut aus rohen Firebase-Daten eine vollstaendige Figur. Fehlende Felder
   werden aufgefuellt, damit eine halb gespeicherte Figur keine Seite sprengt.
   Stand hier vorher doppelt in regie_figuren.html - eine Wahrheit genuegt. */
function alsFigur(roh) {
  roh = roh || {};
  const f = leereFigur();
  ATTR_NAMEN.forEach(function (a) {
    if (roh.attr && roh.attr[a]) f.attr[a] = roh.attr[a];
  });
  FERTIGKEITEN.forEach(function (s) {
    if (roh.fert && roh.fert[s.name] != null) f.fert[s.name] = roh.fert[s.name];
  });
  // Firebase macht aus einem Array mit Luecken ein Objekt mit Zahlenschluesseln -
  // deshalb beide Formen annehmen, sonst faellt eine Liste stillschweigend weg.
  function alsListe(v) {
    if (Array.isArray(v)) return v.filter(function (x) { return x != null; });
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
  }
  f.tal  = alsListe(roh.tal);
  f.hnd  = alsListe(roh.hnd);
  f.ausr = alsListe(roh.ausr);
  f.brief = roh.brief || {};
  f.rang = roh.rang || 0;
  f.steigerungen = roh.steigerungen || 0;
  f.attributImRang = !!roh.attributImRang;
  f.muenzen = (roh.muenzen == null) ? STARTGELD : roh.muenzen;
  f.angeschlagen = !!roh.angeschlagen;
  f.wunden = Math.max(0, Math.min(MAX_WUNDEN, roh.wunden || 0));
  f.benniesUebrig = (roh.benniesUebrig == null) ? null : roh.benniesUebrig;
  f.notizen = roh.notizen || '';
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
function robustheit(figur) {
  return 2 + halbe(figur.attr['Konstitution'] || 1)
           + (figur.tal.indexOf('grob') >= 0 ? 1 : 0)
           + ruestbonus(figur);
}
function bennies(figur)    { return BENNIES + (figur.tal.indexOf('glueck') >= 0 ? 1 : 0); }
function bewegung()        { return BEWEGUNG; }

/* ---------- Zustand ----------
   Jede Wunde senkt ALLE Wuerfel um eine Stufe. Ueberladung kommt
   obendrauf. "Angeschlagen" kostet die naechste Handlung und wirkt
   deshalb nicht auf die Wuerfel - das ist eine Zeitstrafe, keine
   Werteinbusse. */
/* Flacher Abzug auf jede Probe - wie im Regelwerk. Frueher senkte
   jede Wunde eine WUERFELSTUFE; das war die Hausregel und ist mit
   dem Systemwechsel entfallen. Je Wunde -1, Ueberladung -1. */
function wundenAbzug(figur) {
  return Math.min(MAX_WUNDEN, figur.wunden || 0) + (ueberladen(figur) ? 1 : 0);
}
function ausserGefecht(figur) { return (figur.wunden || 0) > MAX_WUNDEN; }
function benniesStand(figur) {
  return (figur.benniesUebrig == null) ? bennies(figur) : figur.benniesUebrig;
}

/* ==========================================================
   STEIGERUNGEN
   ----------------------------------------------------------
   Eine Steigerung erlaubt genau EINE der fuenf Arten. Die Regel
   stand bisher nur als Kommentar am Kopf dieser Datei - hier ist
   sie ausgefuehrt.

   Die Bremse "Attribut nur einmal je Rang" haelt die Attribute im
   Spiel: wer breit aufsteigen will, muss irgendwann das Attribut
   nachziehen, kann das aber nicht in jeder Sitzung tun.
   ========================================================== */
const STEIGERUNG_ARTEN = [
  { id:'attribut', n:'Ein Attribut eine Stufe höher',
    d:'Nur einmal je Rang — danach ist dieser Weg bis zum nächsten Rang zu.' },
  { id:'talent',   n:'Ein neues Talent',
    d:'Rang und Mindestwerte müssen erfüllt sein.' },
  { id:'zweiFert', n:'Zwei Fertigkeiten je eine Stufe',
    d:'Nur solange beide danach ihr Attribut nicht übersteigen.' },
  { id:'eineFert', n:'Eine Fertigkeit über ihrem Attribut',
    d:'Kostet die ganze Steigerung — dafür geht es dort weiter, wo es sonst nicht weitergeht.' },
  { id:'neueFert', n:'Eine neue Fertigkeit auf d4',
    d:'Etwas, das du bisher gar nicht konntest.' }
];

// Steht die Fertigkeit AKTUELL auf oder unter ihrem Attribut?
// Gemessen wird der Stand VOR dem Anheben, wie im Original ("at or below").
// Zaehlte man den Stand danach, koennte eine frische Figur die guenstige
// Steigerung nie nutzen - alle Kernfertigkeiten stehen ja schon auf ihrem
// Attribut, und genau dann braucht man sie am dringendsten.
function fertAufOderUnterAttribut(figur, name) {
  const def = FERT_BY_NAME[name];
  if (!def) return false;
  return (figur.fert[name] || 0) <= (figur.attr[def.attr] || 1);
}
function kannAttributSteigern(figur) {
  if (figur.attributImRang) return false;
  return ATTR_NAMEN.some(function (a) { return (figur.attr[a] || 1) < MAXD; });
}

/* Welche Arten stehen gerade offen? Liefert je Art { ok, grund }. */
function steigerungArten(figur) {
  const guenstige = FERTIGKEITEN.filter(function (s) {
    return (figur.fert[s.name] || 0) > 0 && (figur.fert[s.name] || 0) < MAXD
        && fertAufOderUnterAttribut(figur, s.name);
  });
  const teure = FERTIGKEITEN.filter(function (s) {
    return (figur.fert[s.name] || 0) > 0 && (figur.fert[s.name] || 0) < MAXD
        && !fertAufOderUnterAttribut(figur, s.name);
  });
  const neue = FERTIGKEITEN.filter(function (s) { return (figur.fert[s.name] || 0) === 0; });
  const talente = TALENTE.filter(function (t) {
    return figur.tal.indexOf(t.id) < 0 && talentVerfuegbar(figur, t).ok;
  });

  return STEIGERUNG_ARTEN.map(function (a) {
    let ok = true, grund = '';
    if (a.id === 'attribut') {
      ok = kannAttributSteigern(figur);
      grund = figur.attributImRang
        ? 'In diesem Rang schon genutzt'
        : (ok ? '' : 'Alle Attribute stehen auf d12');
    } else if (a.id === 'talent') {
      ok = talente.length > 0;
      grund = ok ? '' : 'Kein Talent erfüllt gerade Rang und Mindestwerte';
    } else if (a.id === 'zweiFert') {
      ok = guenstige.length >= 2;
      grund = ok ? '' : 'Dafür braucht es zwei Fertigkeiten unter ihrem Attribut';
    } else if (a.id === 'eineFert') {
      ok = teure.length > 0;
      grund = ok ? '' : 'Keine Fertigkeit liegt über ihrem Attribut';
    } else if (a.id === 'neueFert') {
      ok = neue.length > 0;
      grund = ok ? '' : 'Du hast jede Fertigkeit mindestens angefangen';
    }
    return { id:a.id, n:a.n, d:a.d, ok:ok, grund:grund,
             auswahl:{ guenstige:guenstige, teure:teure, neue:neue, talente:talente } };
  });
}

/* Wendet eine Steigerung an. "ziele" ist je nach Art ein Name oder
   ein Array von Namen. Liefert { ok, fehler } und aendert die Figur nur
   im Erfolgsfall - eine halb angewandte Steigerung waere schlimmer als
   gar keine. */
function steigerungAnwenden(figur, artId, ziele) {
  const z = Array.isArray(ziele) ? ziele : [ziele];
  const vorherRang = rangVon(figur.steigerungen || 0).id;

  if (artId === 'attribut') {
    if (!kannAttributSteigern(figur)) return { ok:false, fehler:'In diesem Rang schon genutzt' };
    const a = z[0];
    if (!istAttribut(a)) return { ok:false, fehler:'Kein Attribut: ' + a };
    if ((figur.attr[a] || 1) >= MAXD) return { ok:false, fehler:a + ' steht schon auf d12' };
    figur.attr[a]++;
    figur.attributImRang = true;

  } else if (artId === 'talent') {
    const t = TAL_BY_ID[z[0]];
    if (!t) return { ok:false, fehler:'Unbekanntes Talent' };
    if (figur.tal.indexOf(t.id) >= 0) return { ok:false, fehler:'Talent schon vorhanden' };
    const p = talentVerfuegbar(figur, t);
    if (!p.ok) return { ok:false, fehler:p.gruende.join(' · ') };
    figur.tal.push(t.id);

  } else if (artId === 'zweiFert') {
    if (z.length !== 2 || z[0] === z[1]) return { ok:false, fehler:'Genau zwei verschiedene Fertigkeiten' };
    for (const n of z) {
      if (!FERT_BY_NAME[n]) return { ok:false, fehler:'Unbekannte Fertigkeit: ' + n };
      if ((figur.fert[n] || 0) === 0) return { ok:false, fehler:n + ' ist ungelernt — dafür gibt es „neue Fertigkeit"' };
      if ((figur.fert[n] || 0) >= MAXD) return { ok:false, fehler:n + ' steht schon auf d12' };
      if (!fertAufOderUnterAttribut(figur, n)) return { ok:false, fehler:n + ' liegt schon über seinem Attribut' };
    }
    z.forEach(function (n) { figur.fert[n]++; });

  } else if (artId === 'eineFert') {
    const n = z[0];
    if (!FERT_BY_NAME[n]) return { ok:false, fehler:'Unbekannte Fertigkeit' };
    if ((figur.fert[n] || 0) === 0) return { ok:false, fehler:n + ' ist ungelernt' };
    if ((figur.fert[n] || 0) >= MAXD) return { ok:false, fehler:n + ' steht schon auf d12' };
    figur.fert[n]++;

  } else if (artId === 'neueFert') {
    const n = z[0];
    if (!FERT_BY_NAME[n]) return { ok:false, fehler:'Unbekannte Fertigkeit' };
    if ((figur.fert[n] || 0) !== 0) return { ok:false, fehler:n + ' ist bereits gelernt' };
    figur.fert[n] = 1;

  } else {
    return { ok:false, fehler:'Unbekannte Art: ' + artId };
  }

  figur.steigerungen = (figur.steigerungen || 0) + 1;
  const neuerRang = rangVon(figur.steigerungen).id;
  figur.rang = neuerRang;
  // Neuer Rang: das Attribut-Kontingent lebt wieder auf.
  if (neuerRang > vorherRang) figur.attributImRang = false;

  return { ok:true, fehler:'', rangGestiegen: neuerRang > vorherRang, rang: neuerRang };
}

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
  // Startgeld. Ueberladung ist bewusst KEIN Problem, sondern erlaubt -
  // sie kostet eine Wuerfelstufe (siehe wundenAbzug), und das ist die Strafe.
  const mOffen = STARTGELD - ausgabenMuenzen(figur);
  if (mOffen < 0) p.push('Startgeld überzogen');
  return { ok:p.length === 0, probleme:p,
           attrOffen:aOffen, fertOffen:fOffen, talentOffen:tOffen, muenzenOffen:mOffen };
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
/* ==========================================================
   DER WURF - Savage Worlds, unveraendert uebernommen
   ----------------------------------------------------------
   Kein eigenes Sueppchen mehr. Die frueheren vier Baender
   (guter / normaler / schlechter Erfolg / Misserfolg) sind weg.
   Der "schlechte Erfolg" hat am Tisch keine Freude gemacht: Er
   zwang die Spielleitung, einen halben Erfolg zu erzaehlen, den
   niemand wollte - und er war ausgerechnet bei frischen Figuren
   der haeufigste Ausgang (37,5 % auf d4).

   Der Wurf, wie er im Regelwerk steht:
     1. Wert-Wuerfel + Wild Die (d6). Nur Spielerfiguren bekommen
        den Wild Die - er IST das Kennzeichen einer Heldenfigur.
        Statisten werfen ohne ihn.
     2. Beide Wuerfel EXPLODIEREN: faellt die hoechste Zahl, wird
        erneut geworfen und dazugezaehlt, beliebig oft.
     3. Der HOEHERE der beiden Wuerfe zaehlt - nicht die Summe.
     4. Ziel ist 4. Je volle 4 darueber eine Steigerung (8, 12, ...).
     5. Zeigen BEIDE Wuerfel eine natuerliche 1, ist es ein
        kritischer Patzer.
     6. Ungelernt: d4 mit 2 Abzug. Es geht also, nur schlecht -
        vorher konnte man ungelernt ueberhaupt nie gelingen.
     7. Erschwernisse sind flache Zahlen (-2 fuer schwierig),
        keine Wuerfelstufen mehr.
   ========================================================== */
const UNGELERNT_WUERFEL  = 4;   // d4 ...
const UNGELERNT_ABZUG    = 2;   // ... mit -2
const STEIGERUNG_SCHRITT = 4;   // je 4 ueber dem Ziel eine Steigerung
const PATZER_GRENZE      = 50;  // Sicherung: so oft darf ein Wuerfel hoechstens explodieren

/* Wahrscheinlichkeit, dass ein EXPLODIERENDER Wuerfel mindestens
   "ziel" erreicht. Exakt gerechnet, nicht simuliert: Die Flaechen
   1..seiten-1 bleiben stehen, die hoechste Flaeche wirft erneut -
   daher der Rueckgriff auf sich selbst mit einem um "seiten"
   gesenkten Ziel. Die Rekursion endet, weil ziel dabei faellt. */
function pMind(seiten, ziel) {
  if (seiten < 2) return ziel <= 1 ? 1 : 0;
  if (ziel <= 1) return 1;
  let halten = 0;
  for (let v = 1; v < seiten; v++) if (v >= ziel) halten++;
  return halten / seiten + (1 / seiten) * pMind(seiten, ziel - seiten);
}

function wuerfelSeiten(stufe) {
  const st = Math.max(0, Math.min(MAXD, stufe || 0));
  return st < 1 ? UNGELERNT_WUERFEL : SIDES[st];
}
/* Ungelernt schlaegt als Abzug zu Buche, nicht als fehlender Wuerfel. */
function ungelerntAbzug(stufe) {
  return (Math.max(0, stufe || 0) < 1) ? UNGELERNT_ABZUG : 0;
}
function gesamtMod(stufe, opts) {
  return ((opts && opts.mod) || 0) - ungelerntAbzug(stufe);
}

/* Die exakten Aussichten einer Probe. opts.mod ist eine flache Zahl
   (negativ = schwerer), opts.wild=false fuer Statisten. */
function chancen(stufe, opts) {
  opts = opts || {};
  const wild = (opts.wild === undefined) ? true : !!opts.wild;
  const mod  = gesamtMod(stufe, opts);
  const sT   = wuerfelSeiten(stufe);
  const zielErfolg = ZIELZAHL - mod;
  const zielSteig  = ZIELZAHL + STEIGERUNG_SCHRITT - mod;

  const pTe = pMind(sT, zielErfolg), pTs = pMind(sT, zielSteig);
  let pGelingt, pSteigert, pPatzerRoh;
  if (wild) {
    const pWe = pMind(WILD_DIE, zielErfolg), pWs = pMind(WILD_DIE, zielSteig);
    // Der hoehere zaehlt: gelingt, sobald WENIGSTENS EINER das Ziel erreicht.
    pGelingt   = 1 - (1 - pTe) * (1 - pWe);
    pSteigert  = 1 - (1 - pTs) * (1 - pWs);
    pPatzerRoh = 1 / (sT * WILD_DIE);        // beide natuerlich 1
  } else {
    pGelingt   = pTe;
    pSteigert  = pTs;
    pPatzerRoh = 1 / sT;                     // Statisten: eine natuerliche 1
  }
  const patzer = Math.min(pPatzerRoh, Math.max(0, 1 - pGelingt));
  return {
    steigerung: pSteigert,
    erfolg:     Math.max(0, pGelingt - pSteigert),
    miss:       Math.max(0, 1 - pGelingt - patzer),
    patzer:     patzer,
    gelingt:    pGelingt,
    ungelernt:  ungelerntAbzug(stufe) > 0
  };
}

/* Ein explodierender Wuerfel. Liefert die Summe UND die erste
   geworfene Zahl - die natuerliche 1 entscheidet ueber den Patzer
   und darf deshalb nicht in der Summe untergehen. */
function wuerfelWurf(seiten) {
  if (seiten < 2) return { summe: 1, erste: 1, teile: [1] };
  const teile = [];
  let teil;
  do {
    teil = 1 + Math.floor(Math.random() * seiten);
    teile.push(teil);
  } while (teil === seiten && teile.length < PATZER_GRENZE);
  return { summe: teile.reduce(function (a, b) { return a + b; }, 0),
           erste: teile[0], teile: teile };
}

/* Der tatsaechliche Wurf. Bewusst HIER und nicht in der Seite:
   Der Heldenbrief hatte die Logik nachgebaut, mit dem Hinweis, sie
   muesse "Zeile fuer Zeile" zu chancen() passen - genau so laufen
   zwei Fassungen auseinander. Jetzt gibt es nur eine. */
function wurf(stufe, opts) {
  opts = opts || {};
  const wild = (opts.wild === undefined) ? true : !!opts.wild;
  const mod  = gesamtMod(stufe, opts);
  const sT   = wuerfelSeiten(stufe);

  const wWert = wuerfelWurf(sT);
  const wWild = wild ? wuerfelWurf(WILD_DIE) : null;
  const summeWert = wWert.summe + mod;
  const summeWild = wWild ? wWild.summe + mod : null;
  const ergebnis  = (summeWild === null) ? summeWert : Math.max(summeWert, summeWild);

  const istPatzer = wild ? (wWert.erste === 1 && wWild.erste === 1)
                         : (wWert.erste === 1);
  let band, steigerungen = 0;
  if (istPatzer) band = 'patzer';
  else if (ergebnis >= ZIELZAHL) {
    steigerungen = Math.floor((ergebnis - ZIELZAHL) / STEIGERUNG_SCHRITT);
    band = steigerungen > 0 ? 'steigerung' : 'erfolg';
  } else band = 'miss';

  return {
    band: band, ergebnis: ergebnis, steigerungen: steigerungen, mod: mod,
    seiten: sT, wildSeiten: wild ? WILD_DIE : null,
    wert: wWert, wildWurf: wWild,
    zaehlt: (summeWild !== null && summeWild > summeWert) ? 'wild' : 'wert'
  };
}

const BAENDER = ['steigerung', 'erfolg', 'miss', 'patzer'];
const BAND_NAMEN = {
  steigerung: 'Erfolg mit Steigerung',
  erfolg:     'Erfolg',
  miss:       'Misserfolg',
  patzer:     'Kritischer Patzer'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SIDES, DLBL, MAXD, UNGELERNT, WILD_DIE, ZIELZAHL,
    UNGELERNT_WUERFEL, UNGELERNT_ABZUG, STEIGERUNG_SCHRITT,
    pMind, wurf, wuerfelWurf, wuerfelSeiten, gesamtMod,
    ATTRIBUTE, ATTR_NAMEN, FERTIGKEITEN, FERT_NAMEN, FERT_BY_NAME, ATTR_BY_NAME,
    fertigkeitenVon, istAttribut,
    ATTR_PUNKTE, FERT_PUNKTE, GRATIS_TALENTE, TALENT_KOSTEN, MAX_SCHWER, MAX_LEICHT,
    BENNIES, BEWEGUNG, MAX_WUNDEN, RAENGE, rangVon, rangName, STECKBRIEF, CREW_STEPS,
    TALENT_KATEGORIEN, TALENTE, HANDICAPS, TAL_BY_ID, HND_BY_ID, talenteDerKategorie,
    AUSRUESTUNG, AUSR_ARTEN, AUSR_BY_ID, STARTGELD, ausruestungDerArt,
    traglast, getragen, ueberladen, ruestbonus, ausgabenMuenzen,
    leereFigur, alsFigur, startStufe, fertKosten, ausgabenAttr, ausgabenFert,
    handicapPunkte, ausgabenTalent, zaehleSchwer, zaehleLeicht,
    parade, robustheit, bennies, bewegung, wertVon, talentVerfuegbar, pruefeFigur,
    wundenAbzug, ausserGefecht, benniesStand,
    STEIGERUNG_ARTEN, steigerungArten, steigerungAnwenden, kannAttributSteigern,
    fertAufOderUnterAttribut,
    talentWaehlbar, verlangtVon, offeneVoraussetzungen,
    chancen, BAENDER, BAND_NAMEN
  };
}
