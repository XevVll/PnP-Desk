/* ==========================================================
   KORSAREN — Regelwerk
   ----------------------------------------------------------
   Gemeinsame Regelbasis fuer die gefuehrte Charaktererstellung
   (charaktererstellung.html) und den Heldenbrief
   (charakterbogen_sw.html). Enthaelt ZWEI Regelsaetze, die
   sich zum Vergleich umschalten lassen:

     "savage"   - Savage Worlds so nah wie moeglich am Original
     "korsaren" - unsere Variante mit gekaufter Meisterschaft
                  und der dritten Stufe "schlechter Erfolg"

   Hendrik entscheidet nach dem Vergleich. Der unterlegene
   Satz wird danach ersatzlos aus REGELWERKE geloescht - alles
   andere in dieser Datei ist gemeinsam und bleibt.

   KANON, NICHT AENDERN: die vier Grundwerte, die sechs
   Fertigkeiten und die acht Wissensgebiete samt Schreibweise.
   Diese Namen stehen hunderte Male in js/regie.js als
   Probenaufforderung ("Wahrnehmungs-Probe", "Mechanik"). Wer
   sie umbenennt, entwertet den kompletten Szenentext.
   ========================================================== */

/* ---------- Wuerfelstufen ----------
   0 = ungelernt, 1..5 = d4,d6,d8,d10,d12 */
const SIDES = [4, 4, 6, 8, 10, 12];
const DLBL  = ['—', 'd4', 'd6', 'd8', 'd10', 'd12'];
const MAXD  = 5;
const SLOT_UNGELERNT = 0;

/* ---------- Werte (Kanon) ---------- */
const GW = ['Körper', 'INT', 'Auftreten', 'Wahrnehmung'];

const FERT = [
  { name:'Kampf',       gw:['Körper','Auftreten'] },
  { name:'Geschick',    gw:['Körper','Wahrnehmung'] },
  { name:'Geheim',      gw:['Körper','Wahrnehmung'] },
  { name:'Erste Hilfe', gw:['Körper','INT'] },
  { name:'Rhetorik',    gw:['INT','Auftreten'] },
  { name:'Instinkt',    gw:['INT','Wahrnehmung'] }
];

const WISS = [
  { name:'Seefahrt',         gw:['INT','Wahrnehmung'] },
  { name:'Heilkunde',        gw:['INT','Körper'] },
  { name:'Untergrund',       gw:['INT','Wahrnehmung'] },
  { name:'Handel',           gw:['INT','Auftreten'] },
  { name:'Geschichte',       gw:['INT'] },
  { name:'Menschenkenntnis', gw:['INT','Auftreten'] },
  { name:'Mechanik',         gw:['INT','Körper'] },
  { name:'Eigener Slot',     gw:['INT'], custom:true }
];

const ALL_SKILLS = FERT.concat(WISS);
const SKILL_BY_NAME = {};
ALL_SKILLS.forEach(function (s) { SKILL_BY_NAME[s.name] = s; });

const ARCHETYPES = [
  { name:'Seemann',   gw:'Körper',      desc:'Auf See geboren' },
  { name:'Gelehrter', gw:'INT',         desc:'Arzt & Forscher' },
  { name:'Fuchs',     gw:'Auftreten',   desc:'Händler & Schmuggler' },
  { name:'Schatten',  gw:'Wahrnehmung', desc:'Dieb & Spion' }
];

const CREW_STEPS = ['Unbekannt','Bemerkt','Respektiert','Vertraut','Unverzichtbar'];

/* ==========================================================
   DIE ZWEI REGELSAETZE
   ========================================================== */
const REGELWERKE = {

  savage: {
    id: 'savage',
    name: 'Savage Worlds',
    unter: 'nah am Original',
    beschreibung: 'Explodierende Würfel, ein Wild Die bei jeder Probe, Steigerung ab 8. ' +
                  'Bewährt und erprobt — dafür entfällt der schlechte Erfolg.',
    gwPunkte: 5,
    fertPunkte: 12,
    // Savage Worlds schenkt ein paar Grundfertigkeiten auf d4. Zuordnung auf
    // unsere Namen: Athletik->Geschick, Aufmerksamkeit->Instinkt,
    // Ueberreden->Rhetorik, Heimlichkeit->Geheim, Allgemeinwissen->Geschichte.
    gratisFertigkeiten: ['Geschick', 'Instinkt', 'Rhetorik', 'Geheim', 'Geschichte'],
    gratisTalente: 1,          // Menschen bekommen im Original ein Talent geschenkt
    talentPunkte: 0,
    talentKosten: 2,
    meisterschaft: false,
    explodierend: true,
    wildDie: 6,
    steigerungAb: 8,
    patzer: true,              // beide Wuerfel zeigen 1
    erschwernis: 'wurf',       // -2 auf das Ergebnis je Stufe
    erschwernisWert: 2,
    baender: ['gut', 'normal', 'miss'],
    bandNamen: { gut:'Erfolg mit Steigerung', normal:'Erfolg', miss:'Fehlschlag', patzer:'Patzer' },
    glueckName: 'Bennies',
    glueck: 3
  },

  korsaren: {
    id: 'korsaren',
    name: 'Korsaren-Variante',
    unter: 'unser Entwurf',
    beschreibung: 'Kein Addieren, kein Explodieren. Meisterschaft wird gekauft und gibt ' +
                  'den zweiten Würfel; ein misslungener Wurf darf einmal nachgewürfelt werden.',
    gwPunkte: 5,
    fertPunkte: 15,
    gratisFertigkeiten: [],
    gratisTalente: 1,
    talentPunkte: 3,           // damit Meisterschaft auch ohne Handicaps erreichbar ist
    talentKosten: 2,
    meisterschaft: true,
    meisterschaftKosten: 3,
    meisterschaftAb: 3,        // ab d8
    explodierend: false,
    wildDie: 0,
    steigerungAb: 0,           // guter Erfolg entsteht ueber den zweiten Wuerfel
    patzer: false,
    erschwernis: 'stufe',      // eine Wuerfelstufe niedriger je Stufe
    erschwernisWert: 1,
    baender: ['gut', 'normal', 'schlecht', 'miss'],
    bandNamen: { gut:'Guter Erfolg', normal:'Erfolg', schlecht:'Schlechter Erfolg', miss:'Misserfolg' },
    glueckName: 'Seemannsglück',
    glueck: 3
  }
};

/* ==========================================================
   TALENTE & HANDICAPS (fuer beide Regelsaetze gleich)
   ========================================================== */
const TALENTE = [
  { id:'seebein',   n:'Seebein',        d:'Schwankender Untergrund erschwert dir nichts. An Bord darfst du eine misslungene Seefahrt-Probe einmal nachwürfeln.' },
  { id:'kletter',   n:'Klettermaat',    d:'In der Takelage und an jeder Wand: Geschick eine Würfelstufe höher.' },
  { id:'auge',      n:'Scharfes Auge',  d:'Auf Entfernung und im Ausguck: Wahrnehmung eine Würfelstufe höher.' },
  { id:'kalt',      n:'Kaltblütig',     d:'Bedrängnis trifft dich eine Stufe schwächer. Zwei Gegner sind für dich wie einer.' },
  { id:'zunge',     n:'Zungenfertig',   d:'Einmal je Szene darfst du eine misslungene Rhetorik-Probe wiederholen.' },
  { id:'markt',     n:'Marktkenner',    d:'Du erkennst Wert und Herkunft einer Ware auf einen Blick: Handel eine Stufe höher.' },
  { id:'feldscher', n:'Feldscher',      d:'Bei der Versorgung von Wunden: Erste Hilfe eine Stufe höher.' },
  { id:'schlitz',   n:'Schlitzohr',     d:'Schlösser, Taschen, unbeobachtete Wege: Geheim eine Stufe höher.' },
  { id:'duell',     n:'Duellant',       d:'Steht dir genau ein Gegner gegenüber, kämpfst du eine Stufe höher.' },
  { id:'grob',      n:'Grobschlächtig', d:'Robustheit +1. Du steckst ein, was andere umwirft.' },
  { id:'glueck',    n:'Glückspilz',     d:'Ein zusätzlicher Punkt Glück je Sitzung.' },
  { id:'sprach',    n:'Sprachbegabt',   d:'Du verstehst Spanisch, Französisch und Portugiesisch bruchstückhaft — genug, um das Wichtigste mitzubekommen.' }
];

const HANDICAPS = [
  { id:'landratte', n:'Landratte',      schwer:true,  d:'An Bord und auf See: Seefahrt und Balance eine Würfelstufe niedriger.' },
  { id:'aufbraus',  n:'Aufbrausend',    schwer:true,  d:'Wirst du ernsthaft provoziert, brauchst du eine Instinkt-Probe — sonst schlägst du zu.' },
  { id:'knochen',   n:'Alter Knochen',  schwer:true,  d:'Wo Ausdauer und rohe Kraft zählen: Körper eine Stufe niedriger.' },
  { id:'gesucht',   n:'Gesucht',        schwer:true,  d:'In jedem größeren Hafen kann dich jemand erkennen. Und einer wird es.' },
  { id:'trunk',     n:'Trunksüchtig',   schwer:true,  d:'Ohne Rum am Abend ist der ganze folgende Tag eine Stufe niedriger.' },
  { id:'blut',      n:'Blutschuld',     schwer:true,  d:'Jemand an Bord weiß etwas über dich, das niemand wissen darf.' },
  { id:'glaube',    n:'Aberglaube',     schwer:false, d:'Zeichen, Omen, Rituale — du hältst sie ein, auch wenn es gerade nicht passt.' },
  { id:'seekrank',  n:'Seekrank',       schwer:false, d:'Bei schwerer See ist deine erste Szene eine Stufe niedriger.' },
  { id:'schulden',  n:'Schulden',       schwer:false, d:'Ein Teil jeder Beute ist längst vergeben. Der Gläubiger vergisst nicht.' },
  { id:'neugier',   n:'Neugierig',      schwer:false, d:'Eine verschlossene Tür lässt dich nicht in Ruhe.' },
  { id:'mundwerk',  n:'Loses Mundwerk', schwer:false, d:'Du sagst das Falsche — und zwar zur falschen Person.' },
  { id:'nachtblind',n:'Nachtblind',     schwer:false, d:'Bei Dunkelheit: Wahrnehmung eine Stufe niedriger.' },
  { id:'ehrenwort', n:'Ehrenwort',      schwer:false, d:'Ein gegebenes Versprechen bindet dich, koste es, was es wolle.' },
  { id:'narbe',     n:'Narbe',          schwer:false, d:'Bei Fremden und bei Hofe: Auftreten eine Stufe niedriger.' }
];

const TAL_BY_ID = {}; TALENTE.forEach(function (t) { TAL_BY_ID[t.id] = t; });
const HND_BY_ID = {}; HANDICAPS.forEach(function (h) { HND_BY_ID[h.id] = h; });

const MAX_SCHWER = 1, MAX_LEICHT = 2;

/* ==========================================================
   KOSTEN
   ========================================================== */
function leitwert(figur, skillName) {
  const def = SKILL_BY_NAME[skillName];
  if (!def) return 1;
  let cap = 1;
  def.gw.forEach(function (g) { cap = Math.max(cap, figur.gw[g] || 1); });
  return cap;
}

// Startstufe: im Savage-Satz sind ein paar Fertigkeiten gratis auf d4.
function startStufe(regel, skillName) {
  return regel.gratisFertigkeiten.indexOf(skillName) >= 0 ? 1 : 0;
}

// Kosten, eine Fertigkeit von ihrer Startstufe auf "stufe" zu bringen.
// Jede Stufe kostet 1, solange sie den Leitwert nicht uebersteigt, sonst 2.
function fertKosten(regel, figur, skillName, stufe) {
  const cap = leitwert(figur, skillName);
  let c = 0;
  for (let t = startStufe(regel, skillName) + 1; t <= stufe; t++) c += (t <= cap) ? 1 : 2;
  return c;
}

function ausgabenGw(figur) {
  let t = 0; GW.forEach(function (g) { t += (figur.gw[g] || 1) - 1; }); return t;
}
function ausgabenFert(regel, figur) {
  let t = 0;
  ALL_SKILLS.forEach(function (s) { t += fertKosten(regel, figur, s.name, figur.sk[s.name] || 0); });
  return t;
}
function handicapPunkte(figur) {
  let t = 0;
  figur.hnd.forEach(function (id) { const h = HND_BY_ID[id]; if (h) t += h.schwer ? 2 : 1; });
  return t;
}
function ausgabenTalent(regel, figur) {
  const frei = regel.gratisTalente || 0;
  const bezahlt = Math.max(0, figur.tal.length - frei);
  return bezahlt * regel.talentKosten +
         (regel.meisterschaft ? figur.mast.length * regel.meisterschaftKosten : 0);
}
function budgetTalent(regel, figur) {
  return (regel.talentPunkte || 0) + handicapPunkte(figur);
}
function zaehleSchwer(figur)  { return figur.hnd.filter(function (i) { return HND_BY_ID[i] && HND_BY_ID[i].schwer; }).length; }
function zaehleLeicht(figur)  { return figur.hnd.filter(function (i) { return HND_BY_ID[i] && !HND_BY_ID[i].schwer; }).length; }

/* ==========================================================
   ABGELEITETE WERTE
   ========================================================== */
function halbe(stufe) { return stufe >= 1 ? SIDES[stufe] / 2 : 2; }
function parade(figur)     { return 2 + halbe(figur.sk['Kampf'] || 0); }
function robustheit(figur) { return 2 + halbe(figur.gw['Körper'] || 1) + (figur.tal.indexOf('grob') >= 0 ? 1 : 0); }
function glueck(regel, figur) { return regel.glueck + (figur.tal.indexOf('glueck') >= 0 ? 1 : 0); }

/* ==========================================================
   WAHRSCHEINLICHKEITEN
   Beide Regelsaetze exakt gerechnet, nicht simuliert.
   ========================================================== */

// P(explodierender Wuerfel mit s Seiten erreicht mindestens t)
// Rekursion: unter der Hoechstzahl zaehlt der Wurf direkt, auf der
// Hoechstzahl wird erneut geworfen und addiert.
function pExplodiert(s, t) {
  if (t <= 1) return 1;
  let treffer = 0;
  for (let r = 1; r < s; r++) if (r >= t) treffer++;
  return treffer / s + (1 / s) * pExplodiert(s, t - s);
}

// P(einfacher Wuerfel mit s Seiten erreicht mindestens t)
function pEinfach(s, t) {
  if (t <= 1) return 1;
  if (t > s) return 0;
  return (s - t + 1) / s;
}

function pMind(regel, s, t) {
  return regel.explodierend ? pExplodiert(s, t) : pEinfach(s, t);
}

/* Liefert { gut, normal, schlecht, miss, patzer, unmoeglich } */
function chancen(regel, stufe, opts) {
  opts = opts || {};
  const mastery = !!opts.mastery;
  const stufen = Math.max(0, opts.erschwernis || 0);

  let eff = stufe, abzug = 0;
  if (regel.erschwernis === 'stufe') eff = stufe - stufen;
  else abzug = stufen * regel.erschwernisWert;

  const leer = { gut:0, normal:0, schlecht:0, miss:0, patzer:0 };

  if (stufe >= 1 && eff < 1) return Object.assign({}, leer, { miss:1, unmoeglich:true });

  const s = SIDES[Math.max(0, eff)];
  const ziel = 4 + abzug;
  const zielGut = (regel.steigerungAb || 0) + abzug;

  /* ---- Savage Worlds ---- */
  if (regel.id === 'savage') {
    const pT = pMind(regel, s, ziel);
    const pW = regel.wildDie ? pMind(regel, regel.wildDie, ziel) : 0;
    const erfolg = regel.wildDie ? 1 - (1 - pT) * (1 - pW) : pT;

    const gT = pMind(regel, s, zielGut);
    const gW = regel.wildDie ? pMind(regel, regel.wildDie, zielGut) : 0;
    const gut = regel.wildDie ? 1 - (1 - gT) * (1 - gW) : gT;

    // Ungelernt wird im Original mit Abzug gewuerfelt; hier bilden wir das
    // wie in der Korsaren-Variante ab: der Erfolg bleibt bescheiden.
    if (stufe === SLOT_UNGELERNT) {
      const p = regel.wildDie ? 1 - (1 - pMind(regel, 4, ziel)) * (1 - pW) : pMind(regel, 4, ziel);
      return Object.assign({}, leer, { normal:p, miss:1 - p });
    }
    const patzer = regel.patzer && regel.wildDie ? (1 / s) * (1 / regel.wildDie) : 0;
    return {
      gut: gut,
      normal: Math.max(0, erfolg - gut),
      schlecht: 0,
      miss: Math.max(0, 1 - erfolg - patzer),
      patzer: patzer
    };
  }

  /* ---- Korsaren-Variante ---- */
  const pS = pEinfach(s, 4), pF = 1 - pS;
  if (stufe === SLOT_UNGELERNT) return Object.assign({}, leer, { schlecht:pS, miss:pF });
  if (!mastery) return Object.assign({}, leer, { normal:pS, miss:pF });

  let gut = 0, normal = 0, keiner = 0;
  for (let a = 1; a <= s; a++) {
    for (let b = 1; b <= s; b++) {
      const aOk = a >= 4, bOk = b >= 4;
      if (aOk && bOk) gut++;
      else if (aOk || bOk) normal++;
      else keiner++;
    }
  }
  const n = s * s;
  return {
    gut: gut / n,
    normal: normal / n,
    schlecht: (keiner / n) * pS,
    miss: (keiner / n) * pF,
    patzer: 0
  };
}

/* ==========================================================
   FIGUR
   ========================================================== */
function leereFigur(regelId, arch) {
  const regel = REGELWERKE[regelId] || REGELWERKE.korsaren;
  const f = { regel: regel.id, arch: arch || 'Seemann', gw:{}, sk:{}, mast:[], tal:[], hnd:[], eigenName:'' };
  GW.forEach(function (g) { f.gw[g] = 1; });
  ALL_SKILLS.forEach(function (s) { f.sk[s.name] = startStufe(regel, s.name); });
  return f;
}

// Wechselt den Regelsatz und zieht die Fertigkeiten auf die neuen
// Startstufen hoch, damit im Savage-Satz die Gratis-Fertigkeiten nicht
// unter ihrem Minimum stehen.
function regelWechseln(figur, regelId) {
  const regel = REGELWERKE[regelId];
  if (!regel) return figur;
  figur.regel = regel.id;
  ALL_SKILLS.forEach(function (s) {
    const min = startStufe(regel, s.name);
    if ((figur.sk[s.name] || 0) < min) figur.sk[s.name] = min;
  });
  if (!regel.meisterschaft) figur.mast = [];
  return figur;
}

function pruefeFigur(regel, figur) {
  const p = [];
  const gwOff = regel.gwPunkte - ausgabenGw(figur);
  const skOff = regel.fertPunkte - ausgabenFert(regel, figur);
  const taOff = budgetTalent(regel, figur) - ausgabenTalent(regel, figur);
  if (gwOff < 0) p.push('Grundwerte überzogen');
  if (skOff < 0) p.push('Fertigkeiten überzogen');
  if (taOff < 0) p.push('Talentpunkte überzogen');
  if (zaehleSchwer(figur) > MAX_SCHWER) p.push('höchstens ein schweres Handicap');
  if (zaehleLeicht(figur) > MAX_LEICHT) p.push('höchstens zwei leichte Handicaps');
  return { ok: p.length === 0, probleme: p, gwOffen: gwOff, fertOffen: skOff, talentOffen: taOff };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SIDES, DLBL, MAXD, GW, FERT, WISS, ALL_SKILLS, SKILL_BY_NAME, ARCHETYPES, CREW_STEPS,
    REGELWERKE, TALENTE, HANDICAPS, TAL_BY_ID, HND_BY_ID, MAX_SCHWER, MAX_LEICHT,
    leitwert, startStufe, fertKosten, ausgabenGw, ausgabenFert, handicapPunkte,
    ausgabenTalent, budgetTalent, zaehleSchwer, zaehleLeicht,
    parade, robustheit, glueck, chancen, pExplodiert, pEinfach,
    leereFigur, regelWechseln, pruefeFigur
  };
}
