/* ==========================================================
   NSC-BLÄTTER — die Besatzung nach Savage Worlds
   ----------------------------------------------------------
   WOHER DIE WERTE KOMMEN. Nichts hier ist frei erfunden: Alle
   sieben Kernfiguren trugen in besatzung.html bereits
   vollständige Spielwerte — im alten W100-System (Körper, INT,
   Auftreten, Wahrnehmung plus Fertigkeiten und Wissensgebiete).
   Diese Datei ist deren Übersetzung, nicht deren Ersatz. Wer
   Cormac für den besseren Kämpfer hält als seinen Kapitän,
   findet das hier wieder, weil es dort schon stand (Kampf 7
   gegen 6).

   WAS NEU DAZUKAM, und zwar auf Hendriks Vorgabe vom
   15.10.2026 ("Sei ruhig etwas vielfältiger … die müssen nicht
   so stark sein … eventuell einzigartige Schwächen und
   Talente"):
     - Die alten vier Grundwerte kannten keine Geschicklichkeit
       und keine Konstitution. Beide sind aus dem abgeleitet,
       was über die Figur dasteht.
     - Fertigkeiten über die alten elf hinaus: Schießen,
       Diebeskunst, Navigation, Provozieren und so fort. Das
       alte Blatt kannte sie nicht, die Figuren schon.
     - Ränge. Harwick ist kein Novize mehr, und Josiah war es
       nie.
     - Talente und Schwächen, je aus dem Kanon abgeleitet. Die
       figurspezifischen tragen in js/regelwerk.js nurNsc:true
       und sind damit für Spieler nicht wählbar.

   BEWUSST MASSVOLL, und seit dem 15.10.2026 noch einmal
   deutlicher: **d12 trägt in dieser Kampagne nur Der
   Seelenlose.** Vorher hatten sieben von acht Figuren
   mindestens einen d12, vierzehn Stück insgesamt — in einem
   System, in dem d12 die Spitze der Skala ist, war das zu
   viel. Die Mannschaft hört jetzt bei d10 auf.
   Was dadurch an Unterschied verlorenging, kommt NICHT über
   eine Zahl zurück, sondern über Talente und über die
   Rangfolge, die schon im Kanon steht: Cormac kämpft besser
   als sein Kapitän, weil dort Kampf 7 gegen 6 steht — nicht,
   weil einer von beiden an der Decke klebt.
   Eine frische Spielerfigur kommt auf Robustheit 6, Parade 6;
   die Crew liegt bei 4 bis 7. Sie sollen erfahren wirken,
   nicht unerreichbar.

   WILD CARDS UND STATISTEN. Die sieben Kernfiguren und Der
   Seelenlose sind Wild Cards: Sie würfeln den Wild Die mit und
   haben drei Wunden. Die übrige Mannschaft (MANIFEST_EXTRA in
   js/npc_roster.js) sind Extras — kein Wild Die, eine Wunde.
   Das steht je Eintrag als "wild" dran.

   Die Zahlen sind Würfelstufen wie in js/regelwerk.js:
   1=d4 2=d6 3=d8 4=d10 5=d12. Fehlt eine Fertigkeit, ist sie
   ungelernt (d4−2).
   ========================================================== */

const NSC = {

  /* ---------- Kapitän ----------
     Alt: Körper 5★ INT 4 Auftreten 5★ Wahrnehmung 4, Kampf 6,
     Seefahrt 6, Rhetorik 5, Menschenkenntnis 5.
     Gebildeter als die meisten an Bord, führt ohne laute Worte. */
  harwick: {
    name: 'James Harwick', rolle: 'Kapitän der Golden Lion',
    /* Kapitaen mit Kaperbrief: Saebel an der Seite, Pistole im Guertel. */
    ausr: ['saebel', 'pistole'],
    wild: true, rang: 2,              // Veteran
    attr: { 'Geschicklichkeit': 2, 'Verstand': 3, 'Willenskraft': 4, 'Stärke': 3, 'Konstitution': 3 },
    fert: {
      'Kämpfen': 3, 'Schießen': 3, 'Segeln': 4, 'Navigation': 3,
      'Überreden': 3, 'Einschüchtern': 3, 'Aufmerksamkeit': 3,
      'Allgemeinwissen': 3, 'Handel': 2, 'Athletik': 2, 'Heilkunde': 1
    },
    tal: ['nsc_vanthei', 'kommando', 'kapitaen', 'zaeh'],
    hnd: ['nsc_jessica', 'stolz'],
    notiz: 'Spricht wenig, aber treffsicher. Die Autorität steht nie zur Debatte — ' +
           'genau deshalb fällt es auf, wenn sie bröckelt.'
  },

  /* ---------- Quartiermeister ----------
     Alt: Körper 5★ INT 2 Auftreten 4 Wahrnehmung 4, Kampf 7 (der
     höchste Kampfwert an Bord), Seefahrt 7.
     Der niedrige INT ist Kanon und bleibt: Cormac ist nicht dumm,
     aber er denkt mit den Händen. */
  cormac: {
    name: 'Cormac Daly', rolle: 'Quartiermeister',
    /* Kaempft besser als sein Kapitaen (Kampf 7 gegen 6) und fuehrt die
       Enterkommandos - zwei Klingen, eine davon fuer den engen Raum. */
    ausr: ['entermesser', 'saebel'],
    wild: true, rang: 2,
    attr: { 'Geschicklichkeit': 3, 'Verstand': 2, 'Willenskraft': 3, 'Stärke': 4, 'Konstitution': 4 },
    fert: {
      'Kämpfen': 4, 'Segeln': 4, 'Athletik': 3, 'Aufmerksamkeit': 3,
      'Einschüchtern': 3, 'Überreden': 2, 'Heilkunde': 2, 'Handwerk': 2,
      'Gassenwissen': 2, 'Schießen': 2
    },
    tal: ['nsc_knoten', 'entern', 'zaeh', 'bootsmann'],
    hnd: ['nsc_schuld', 'glaube'],   // irischer Katholik, Bibel 8.1
    notiz: 'Schaut neue Leute einmal an und ignoriert sie dann, bis sie ihm einen Grund geben. ' +
           'Der beste Kämpfer an Bord — besser als sein Kapitän.'
  },

  /* ---------- Steuermann ----------
     Alt: Körper 3 INT 4 Auftreten 4 Wahrnehmung 5★, Geschick 6,
     Seefahrt 7. Schmächtig, rastlos, loses Mundwerk. */
  tom: {
    name: 'Tom Fletcher', rolle: 'Steuermann',
    /* Steuermann, loses Mundwerk, kein Schlaeger - was er traegt, passt in
       den Guertel und hilft auch beim Tauwerk. */
    ausr: ['messer', 'wurfmesser'],
    wild: true, rang: 1,             // Erfahren
    attr: { 'Geschicklichkeit': 4, 'Verstand': 3, 'Willenskraft': 3, 'Stärke': 2, 'Konstitution': 2 },
    fert: {
      'Segeln': 4, 'Navigation': 4, 'Athletik': 4, 'Aufmerksamkeit': 4,
      'Überreden': 3, 'Provozieren': 3, 'Heimlichkeit': 2, 'Kämpfen': 2,
      'Gassenwissen': 2, 'Diebeskunst': 1
    },
    tal: ['nsc_ruder', 'sterne', 'seebein', 'zunge'],
    hnd: ['mundwerk', 'trunk'],
    notiz: 'Hinterfragt den Kapitän offen und provoziert Cormacs Seitenblicke manchmal mit Absicht. ' +
           'Die Alten wissen, was er wert ist.'
  },

  /* ---------- Kanonenmeister ----------
     Alt: Körper 4 INT 4 Auftreten 2 Wahrnehmung 5★, Mechanik 6,
     Seefahrt 7. Ehemaliger Marinesoldat, sitzt oft allein.
     Als Kanonenmeister bekommt er Schiessen - das alte Blatt
     hatte die Fertigkeit gar nicht. */
  dirk: {
    name: 'Dirk van Hoorn', rolle: 'Kanonenmeister',
    /* Kanonenmeister. Wer Geschuetze richtet, trifft auch auf Entfernung;
       die Muskete ist die groesste Reichweite, die es hier gibt. */
    ausr: ['muskete', 'messer'],
    wild: true, rang: 2,
    attr: { 'Geschicklichkeit': 3, 'Verstand': 3, 'Willenskraft': 2, 'Stärke': 3, 'Konstitution': 3 },
    fert: {
      'Schießen': 4, 'Handwerk': 4, 'Segeln': 3, 'Aufmerksamkeit': 4,
      'Athletik': 3, 'Kämpfen': 3, 'Allgemeinwissen': 2, 'Navigation': 2,
      'Heilkunde': 1, 'Überreden': 1
    },
    tal: ['kanonier', 'nsc_abgeschaltet', 'ruhig', 'bastler'],
    hnd: ['nsc_leer', 'narbe'],
    notiz: 'Keine verschwendete Energie. Die Augen sind wach, aber irgendwie leer dahinter.'
  },

  /* ---------- Dolmetscher und Händler ----------
     Alt: Körper 2 INT 3 Auftreten 5★ Wahrnehmung 3, Rhetorik 7,
     Menschenkenntnis 7. Der einzige, der mehr redet als handelt. */
  francesco: {
    name: 'Francesco Benedetto Almeida', rolle: 'Dolmetscher, Händler, Gelegenheitslügner',
    /* Drei Namen, drei Paesse. Wer so reist, traegt nichts Offenes, aber
       immer etwas dabei. */
    ausr: ['messer', 'pistole'],
    wild: true, rang: 1,
    attr: { 'Geschicklichkeit': 2, 'Verstand': 3, 'Willenskraft': 4, 'Stärke': 1, 'Konstitution': 1 },
    fert: {
      'Überreden': 4, 'Handel': 4, 'Aufmerksamkeit': 3, 'Gassenwissen': 4,
      'Allgemeinwissen': 3, 'Provozieren': 3, 'Heimlichkeit': 2, 'Diebeskunst': 2,
      'Kämpfen': 2, 'Segeln': 2
    },
    tal: ['sprach', 'zunge', 'nsc_namen', 'markt'],
    hnd: ['schulden', 'landratte'],
    notiz: 'Verhandelt in vier Sprachen und schuldet in dreien Geld. Körperlich die schwächste ' +
           'Figur an Bord — er weiß das und richtet sich danach.'
  },

  /* ---------- Waffenmeister ----------
     Alt: Körper 5★ INT 1 Auftreten 3 Wahrnehmung 3, Kampf 6,
     Rhetorik 1. Ein Bär von einem Mann, Gesicht aus Narben.
     INT 1 ist Kanon und bleibt bei d4. */
  wat: {
    name: 'Walter „Wat“ Crozier', rolle: 'Waffenmeister',
    /* Der Brocken, der am Waldrand den Holztrupp fuehrt und zeigt, wo die
       Axt ansetzen muss (js/regie.js). Dieselbe Axt nimmt er mit an Bord. */
    ausr: ['enteraxt'],
    wild: true, rang: 2,
    attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 2, 'Stärke': 4, 'Konstitution': 4 },
    fert: {
      'Kämpfen': 3, 'Einschüchtern': 4, 'Athletik': 3, 'Schießen': 3,
      'Aufmerksamkeit': 2, 'Gassenwissen': 2, 'Segeln': 2, 'Handwerk': 2
    },
    tal: ['nsc_kein_gewissen', 'nsc_dreien', 'grob', 'kalt', 'drohend'],
    hnd: ['nsc_grenzland', 'blut'],
    notiz: 'Die Crew behandelt ihn wie das Wetter. Schläft sofort ein, tief, überall — ' +
           'kein Gewissen, das ihn wachhält. Wörtlich zu nehmen.'
  },

  /* ---------- Schiffskoch ----------
     Alt: Körper 3 INT 3 Auftreten 5★ Wahrnehmung 3, Erste Hilfe 4,
     Heilkunde 3, Kampf 1. Formal weit unten, informell einer der
     einflussreichsten Männer an Bord. */
  josiah: {
    name: 'Josiah Pryce', rolle: 'Schiffskoch',
    /* Koch und Feldscher, Kampf 1. Sein Messer ist Werkzeug, keine Waffe -
       dass es trotzdem schneidet, ist ein Nebeneffekt. */
    ausr: ['messer'],
    wild: true, rang: 1,
    attr: { 'Geschicklichkeit': 2, 'Verstand': 3, 'Willenskraft': 4, 'Stärke': 3, 'Konstitution': 2 },
    fert: {
      'Heilkunde': 4, 'Überreden': 4, 'Handel': 3, 'Aufmerksamkeit': 3,
      'Allgemeinwissen': 3, 'Handwerk': 2, 'Segeln': 2, 'Kämpfen': 1
    },
    tal: ['nsc_kombuese', 'feldscher', 'anfeuern', 'magen'],
    hnd: ['pflicht', 'knochen'],   // kurzatmig bei Anstrengung
    notiz: 'Drückt jedem, der die Kombüse betritt, binnen Sekunden etwas zu essen in die Hand. ' +
           'Streit vor ihm endet friedlicher als sonst. Kein Kämpfer, und er weiß es.'
  },

  /* ---------- Der Antagonist ----------
     Ohne Vorlage: Für ihn gab es nie ein Blatt, nur eigene
     Kampfwerte in der Arena. Dies ist ein Aufschlag entlang
     dessen, was in Bibel 12.1 über ihn steht — bewusst
     ausserhalb der Spielerskala, aber nicht beliebig.
     Er ist KEIN Teil der Besatzung und erscheint erst in 13.1.
     Seit dem 30.10.2026 ist DIESES Blatt auch sein Blatt in der
     Arena: js/arena_scenes.js leitet seine Vorlage daraus ab
     (Kämpfen d12, Stärke d12, Parade 8, Robustheit 8), und
     tests/t_arena.js rechnet das nach. */
  seelenloser: {
    name: 'Der Seelenlose', rolle: 'Wächter der Grabesinsel',
    /* Er fuehrt die Toten und schlaegt selbst zu. Die Klinge ist das
       Wenigste an ihm - gefaehrlich ist, was dahintersteht. */
    ausr: ['saebel'],
    wild: true, rang: 4,              // Legendär
    attr: { 'Geschicklichkeit': 4, 'Verstand': 4, 'Willenskraft': 5, 'Stärke': 5, 'Konstitution': 5 },
    fert: {
      'Kämpfen': 5, 'Einschüchtern': 5, 'Aufmerksamkeit': 4,
      'Allgemeinwissen': 4, 'Überreden': 3, 'Athletik': 3
    },
    tal: ['drohend', 'standhaft', 'totenstill', 'omen'],
    hnd: [],
    notiz: 'Spricht zum ersten Mal, wenn Wat fällt: „Kein Toter verlässt je diese Insel.“ ' +
           'Seine Werte in der Arena kommen seit dem 30.10.2026 aus diesem Blatt — Parade 8, ' +
           'Robustheit 8, Kämpfen d12. Parade 8 kostet jeden Angriff -4; genau +4 holt die Gruppe ' +
           'zurück, wenn sie ihn gemeinsam stellt (Gang Up).'
  }
};

/* ---------- Die übrige Mannschaft ----------
   Extras: kein Wild Die, eine Wunde. Sie bekommen kein volles
   Blatt, sondern das, wofür man sie am Tisch wirklich anwürfelt -
   ihr Handwerk und eine Besonderheit. Alles Übrige ist d4.
   Die Rollen stammen aus besatzung.html / js/npc_roster.js. */
const NSC_MANNSCHAFT = {
  ned:      { name: 'Ned Sharpe', rolle: 'Matrose',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 2, 'Stärke': 3, 'Konstitution': 3 }, fert: { 'Segeln': 2, 'Athletik': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Stürzt im Sturm vom Want (Szene 3.1).' },
  ezra:     { name: 'Ezra Coombe', rolle: 'Vollmatrose',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 2, 'Willenskraft': 1, 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Segeln': 3, 'Kämpfen': 2, 'Athletik': 2, 'Aufmerksamkeit': 3 },
              notiz: 'Wundbrand nach der Insel; bleibt im spanischen Hafen zurück (7.1).' },
  silas:    { name: 'Silas Pott', rolle: 'Wundversorgung',
              attr: { 'Geschicklichkeit': 1, 'Verstand': 2, 'Willenskraft': 2, 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Heilkunde': 3, 'Segeln': 2, 'Aufmerksamkeit': 1 },
              notiz: 'Kein Arzt. Näht zu, was zu ist.' },
  eli:      { name: 'Eli Trewin', rolle: 'Matrose (Zwilling)',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 3, 'Konstitution': 3 }, fert: { 'Segeln': 2, 'Provozieren': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Nie ohne Job. Die beiden sind nur zusammen ein Problem.' },
  job:      { name: 'Job Trewin', rolle: 'Matrose (Zwilling)',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 3, 'Konstitution': 3 }, fert: { 'Segeln': 2, 'Provozieren': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Nie ohne Eli.' },
  mara:     { name: 'Marisol „Mara“ Vega', rolle: 'Vollmatrosin',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 3, 'Stärke': 4, 'Konstitution': 4 }, fert: { 'Segeln': 3, 'Heimlichkeit': 2, 'Kämpfen': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Fällt erst auf, wenn sie etwas sagt — und dann stimmt es.' },
  cookie:   { name: 'Bartholomew „Cookie“ Crup', rolle: 'Smutje',
              attr: { 'Geschicklichkeit': 2, 'Verstand': 2, 'Willenskraft': 2, 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Handel': 2, 'Heilkunde': 1, 'Segeln': 1, 'Aufmerksamkeit': 2 },
              notiz: 'Josiahs Gehilfe. Zählt mit, was aus der Vorratskammer verschwindet.' },
  rufus:    { name: 'Rufus Katt', rolle: 'Böttcher',
              attr: { 'Geschicklichkeit': 2, 'Verstand': 2, 'Willenskraft': 1, 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Handwerk': 3, 'Handel': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Fässer, Deckel, Dichtung. Wasser und Pulver hängen an ihm.' },
  osei:     { name: 'Osei', rolle: 'Segelmacher',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Handwerk': 3, 'Segeln': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Flickt, was der Sturm aufreißt. Spricht wenig Englisch, versteht alles.' },
  diego:    { name: 'Diego Vaz', rolle: 'Zimmermannsmaat',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 2, 'Willenskraft': 1, 'Stärke': 3, 'Konstitution': 3 }, fert: { 'Handwerk': 3, 'Athletik': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Hält den Rumpf dicht, solange Holz da ist.' },
  bram:     { name: 'Bram Tuck', rolle: 'Waffenmeistergehilfe',
              attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 4, 'Konstitution': 4 }, fert: { 'Kämpfen': 3, 'Schießen': 2, 'Aufmerksamkeit': 1 },
              notiz: 'Wats Schatten. Will sein wie er und ist es nicht.' },
  pip:      { name: 'Pip', rolle: 'Schiffsjunge / Pulveraffe',
              attr: { 'Geschicklichkeit': 1, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 1, 'Konstitution': 1 }, fert: { 'Athletik': 3, 'Heimlichkeit': 3, 'Diebeskunst': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Kommt überall durch, wo ein Erwachsener stecken bliebe. Trägt Pulver zu den Geschützen.' },
  jory:     { name: 'Jory Pell', rolle: 'Matrose',
              attr: { 'Geschicklichkeit': 2, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Segeln': 2, 'Gassenwissen': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Weiß immer schon, was an Bord geredet wird.' },
  anselm:   { name: 'Anselm Frei', rolle: 'Matrose',
              attr: { 'Geschicklichkeit': 2, 'Verstand': 1, 'Willenskraft': 2, 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Segeln': 2, 'Allgemeinwissen': 2, 'Aufmerksamkeit': 2 },
              notiz: 'Liest. Das allein macht ihn an Bord zur Auffälligkeit.' }
};

/* Ein NSC-Blatt in dieselbe Form bringen, die js/regelwerk.js fuer
   Spielerfiguren benutzt - dann rechnen parade(), robustheit() und
   wurf() ohne Sonderweg damit. */
function nscAlsFigur(eintrag) {
  if (typeof alsFigur !== 'function') return null;
  const f = alsFigur({
    name: eintrag.name,
    attr: eintrag.attr || {},
    fert: eintrag.fert || {},
    tal: eintrag.tal || [],
    hnd: eintrag.hnd || [],
    /* Ohne diese Zeile bleibt jede Waffe im Datensatz liegen: Das Blatt
       traegt dann nichts, und die Robustheit rechnet ohne Ruestung. */
    ausr: eintrag.ausr || [],
    rang: eintrag.rang || 0,
    startRang: eintrag.rang || 0
  });
  f.wild = (eintrag.wild !== false);
  return f;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NSC, NSC_MANNSCHAFT, nscAlsFigur };
}
