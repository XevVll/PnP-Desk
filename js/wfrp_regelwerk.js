/* ==========================================================
   WARHAMMER FANTASY ROLLENSPIEL (4. Edition) — REGELKERN
   ----------------------------------------------------------
   Die Mechanik zu js/wfrp_daten.js. Ohne DOM, ohne Firebase,
   ohne globalen Zustand - wie js/regelwerk.js fuer Savage
   Worlds. Aus demselben Grund: Zwei Fassungen derselben Rechnung
   laufen auseinander, und dann rechnet der Heldenbrief anders als
   die Wuerfelleiste.

   Quelle ist das Regelwerk (Kapitel 2 Charakter, 3 Karrieren,
   5 Regeln). Seitenangaben beziehen sich auf die PDF-Fassung 4.

   ---- Die Probe (S. 149-153) ----
   W100 gegen den Wert. Gleich oder darunter gelingt.
     Erfolgsgrade (EG) = Zehner des Werts - Zehner des Wurfs.
     01-05 gelingt IMMER (mindestens +1 EG),
     96-00 misslingt IMMER (hoechstens -1 EG).
     Ein Pasch (11, 22 ... 00) ist im Kampf ein kritischer Treffer
     bzw. ein Patzer; ausserhalb des Kampfes ist das eine
     Zusatzregel, die die Seite nur anzeigt.
   Ein Ergebnis von 0 EG gibt es zweimal: +0 (knapp gelungen) und
   -0 (knapp misslungen). Deshalb traegt jedes Ergebnis "ok" mit -
   die Zahl allein reicht nicht.

   ---- Die Figur ----
   So liegt sie unter figuren/{schluessel}:
     regelwerk: 'wfrp4'
     spezies, klasse, karriere (id), stufe (1-4), verlauf: [{karriere, stufe}]
     attrAnfang {kg..ch}   - gewuerfelt + Spezies-Grundwert
     attrSteig  {kg..ch}   - gekaufte Steigerungen
     fert {schluessel: steigerungen}   schluessel = "id" oder "id:Spez"
     tal  {schluessel: stufe}
     schicksal, glueck, zaehigkeit, entschlossenheit, motivation
     epGesamt, epAusgegeben, wunden (aktuelle)
   Spezialisierungen stehen mit DOPPELPUNKT im Schluessel, weil
   Firebase den Schraegstrich als Pfad liest. In den Daten steht
   der Schraegstrich (wfrpRef), in der Figur der Doppelpunkt.
   ========================================================== */

var WFRP_REGELWERK = 'wfrp4';

/* ---------------- Nachschlagen ---------------- */
var WFRP_ATTR_BY_ID = {};
var WFRP_FERT_BY_ID = {};
var WFRP_TAL_BY_ID = {};
var WFRP_KARR_BY_ID = {};
var WFRP_KLASSE_BY_ID = {};
(function () {
  WFRP_ATTRIBUTE.forEach(function (a) { WFRP_ATTR_BY_ID[a.id] = a; });
  WFRP_FERTIGKEITEN.forEach(function (f) { WFRP_FERT_BY_ID[f.id] = f; });
  WFRP_TALENTE.forEach(function (t) { WFRP_TAL_BY_ID[t.id] = t; });
  WFRP_KARRIEREN.forEach(function (k) { WFRP_KARR_BY_ID[k.id] = k; });
  WFRP_KLASSEN.forEach(function (k) { WFRP_KLASSE_BY_ID[k.id] = k; });
})();

var WFRP_ATTR_IDS = ['kg', 'bf', 'st', 'wi', 'i', 'gw', 'gs', 'in', 'wk', 'ch'];

/* Schwierigkeit (S. 153). "Herausfordernd" ist die Vorgabe - eine
   vergleichende Probe ohne Angabe gilt als herausfordernd. */
var WFRP_SCHWIERIGKEITEN = [
  { id: 'sehr_leicht', n: 'Sehr leicht', en: 'Very Easy', mod: 60 },
  { id: 'leicht', n: 'Leicht', en: 'Easy', mod: 40 },
  { id: 'durchschnittlich', n: 'Durchschnittlich', en: 'Average', mod: 20 },
  { id: 'herausfordernd', n: 'Herausfordernd', en: 'Challenging', mod: 0 },
  { id: 'schwierig', n: 'Schwierig', en: 'Difficult', mod: -10 },
  { id: 'schwer', n: 'Schwer', en: 'Hard', mod: -20 },
  { id: 'sehr_schwer', n: 'Sehr schwer', en: 'Very Hard', mod: -30 }
];

/* ---------------- Bezuege ---------------- */
/* "wissen/Recht" -> {id:'wissen', spez:['Recht']}
   "wissen/*"     -> {id:'wissen', spez:'*'}
   "nahkampf"     -> {id:'nahkampf', spez:null} */
function wfrpRefTeile(ref) {
  var s = String(ref || '');
  var i = s.indexOf('/');
  if (i < 0) return { id: s, spez: null };
  var rest = s.slice(i + 1);
  return { id: s.slice(0, i), spez: rest === '*' ? '*' : rest.split('|') };
}

/* Schluessel in der Figur: "id" oder "id:Spez" */
function wfrpKey(id, spez) { return spez ? id + ':' + spez : id; }
function wfrpKeyTeile(key) {
  var s = String(key || '');
  var i = s.indexOf(':');
  return i < 0 ? { id: s, spez: null } : { id: s.slice(0, i), spez: s.slice(i + 1) };
}

/* Passt ein Schluessel der Figur zu einem Bezug aus den Daten? */
function wfrpRefPasst(ref, key) {
  var r = wfrpRefTeile(ref), k = wfrpKeyTeile(key);
  if (r.id !== k.id) return false;
  if (!r.spez) return !k.spez;
  if (r.spez === '*') return true;
  return r.spez.indexOf(k.spez) >= 0;
}

/* Eine selbst eingetippte Spezialisierung ("Geschichte"). Heraus muss,
   was Firebase in einem Schluessel verbietet (. # $ [ ] /), unser
   Trenner (:) und alles, was einen Aufruf im Markup zerbrechen kann. */
function spezSauber(v) {
  return String(v == null ? '' : v).replace(/[.#$\[\]\/:'"\\<>]/g, '').trim().slice(0, 40);
}

function wfrpName(id) {
  var f = WFRP_FERT_BY_ID[id] || WFRP_TAL_BY_ID[id];
  return f ? f.n : id;
}
function wfrpRefText(ref) {
  var r = wfrpRefTeile(ref);
  var n = wfrpName(r.id);
  if (!r.spez) return n;
  if (r.spez === '*') return n + ' (beliebig)';
  return n + ' (' + r.spez.join(' oder ') + ')';
}
function wfrpKeyText(key) {
  var k = wfrpKeyTeile(key);
  return wfrpName(k.id) + (k.spez ? ' (' + k.spez + ')' : '');
}

/* ---------------- Wuerfel ---------------- */
function wfrpW(seiten, rng) {
  return 1 + Math.floor((rng || Math.random)() * seiten);
}
function wfrpW100(rng) { return wfrpW(100, rng); }

function wfrpBonus(wert) { return Math.max(0, Math.floor((+wert || 0) / 10)); }

/* Zehner und Einer eines W100-Wurfs. 100 ist "00": beide Ziffern 0. */
function wfrpZiffern(wurf) {
  var w = +wurf;
  if (w >= 100) return { z: 0, e: 0 };
  return { z: Math.floor(w / 10), e: w % 10 };
}
function wfrpIstPasch(wurf) {
  var d = wfrpZiffern(wurf);
  return d.z === d.e;
}

/* Der Zehner eines WURFS fuer die EG-Rechnung: 100 zaehlt als 10. */
function wfrpZehnerWurf(wurf) { return (+wurf >= 100) ? 10 : Math.floor(+wurf / 10); }

/* ---------------- Die Probe ---------------- */
/* ziel: Fertigkeits- oder Attributswert. opt.mod: Schwierigkeit
   (+60 ... -30) plus alles andere. opt.wurf: fester Wurf fuer
   Pruefungen und fuer "Ich werde nicht scheitern!". */
function wfrpProbe(ziel, opt) {
  opt = opt || {};
  var mod = +opt.mod || 0;
  var basis = Math.round(+ziel || 0);
  var z = basis + mod;
  var wurf = (opt.wurf !== undefined && opt.wurf !== null) ? +opt.wurf : wfrpW100(opt.rng);
  var ok = wurf <= z;
  var eg = Math.floor(Math.max(0, z) / 10) - wfrpZehnerWurf(wurf);
  var auto = null;
  if (wurf <= 5) { ok = true; eg = Math.max(1, eg); auto = 'erfolg'; }
  else if (wurf >= 96) { ok = false; eg = Math.min(-1, eg); auto = 'misserfolg'; }
  /* Zusatzregel "Proben ueber 100 %" (S. 151) ist bewusst NICHT
     eingebaut - sie ist optional, und Werte ueber 100 kommen bei
     Spielerfiguren praktisch nicht vor. */
  var pasch = wfrpIstPasch(wurf);
  return {
    wurf: wurf, basis: basis, mod: mod, ziel: z, ok: ok, eg: eg, auto: auto,
    pasch: pasch, kritisch: pasch && ok, patzer: pasch && !ok,
    stufe: wfrpErgebnisStufe(eg, ok)
  };
}

/* Ergebnistabelle (S. 152). Das Vorzeichen bei 0 kommt aus "ok". */
var WFRP_ERGEBNISSE = [
  { min: 6, ok: true, n: 'Herausragender Erfolg', d: 'Ja, perfekt!', klasse: 'gut' },
  { min: 4, ok: true, n: 'Beeindruckender Erfolg', d: 'Ja, und …', klasse: 'gut' },
  { min: 2, ok: true, n: 'Erfolg', d: 'Ja.', klasse: 'gut' },
  { min: -99, ok: true, n: 'Knapper Erfolg', d: 'Ja, aber …', klasse: 'gut' },
  { min: -1, ok: false, n: 'Knapper Misserfolg', d: 'Nein, aber …', klasse: 'schlecht' },
  { min: -3, ok: false, n: 'Misserfolg', d: 'Nein.', klasse: 'schlecht' },
  { min: -5, ok: false, n: 'Beeindruckender Misserfolg', d: 'Nein, und …', klasse: 'schlecht' },
  { min: -99, ok: false, n: 'Katastrophaler Misserfolg', d: 'Nein, auf keinen Fall!', klasse: 'schlecht' }
];
function wfrpErgebnisStufe(eg, ok) {
  for (var i = 0; i < WFRP_ERGEBNISSE.length; i++) {
    var s = WFRP_ERGEBNISSE[i];
    if (s.ok === !!ok && eg >= s.min) return s;
  }
  return WFRP_ERGEBNISSE[WFRP_ERGEBNISSE.length - 1];
}

/* "+2 EG", "−0 EG" - das Minuszeichen ist ein echtes, kein Bindestrich. */
function wfrpEgText(eg, ok) {
  if (eg > 0) return '+' + eg;
  if (eg < 0) return '−' + Math.abs(eg);
  return ok ? '+0' : '−0';
}

/* Vergleichende Probe (S. 153): mehr EG gewinnt; bei Gleichstand der
   hoehere gepruefte Wert; sonst Patt (null). Die Differenz ist das
   Ergebnis, wenn es darauf ankommt, wie deutlich gewonnen wurde. */
function wfrpVergleich(a, b) {
  var sieger = null;
  if (a.eg !== b.eg) sieger = a.eg > b.eg ? 'a' : 'b';
  else if (a.ziel !== b.ziel) sieger = a.ziel > b.ziel ? 'a' : 'b';
  return { sieger: sieger, eg: a.eg - b.eg };
}

/* Trefferzone (S. 159): der Angriffswurf mit vertauschten Ziffern. */
var WFRP_TREFFERZONEN = [
  { bis: 9, n: 'Kopf' }, { bis: 24, n: 'Linker Arm' }, { bis: 44, n: 'Rechter Arm' },
  { bis: 79, n: 'Körper' }, { bis: 89, n: 'Linkes Bein' }, { bis: 100, n: 'Rechtes Bein' }
];
function wfrpUmdrehen(wurf) {
  var d = wfrpZiffern(wurf);
  var r = d.e * 10 + d.z;
  return r === 0 ? 100 : r;
}
function wfrpTrefferzone(wurf) {
  var r = wfrpUmdrehen(wurf);
  for (var i = 0; i < WFRP_TREFFERZONEN.length; i++) {
    if (r <= WFRP_TREFFERZONEN[i].bis) return { wurf: r, n: WFRP_TREFFERZONEN[i].n };
  }
  return { wurf: r, n: 'Rechtes Bein' };
}

/* ---------------- Die Figur ---------------- */
function wfrpLeereFigur() {
  var leer = {};
  WFRP_ATTR_IDS.forEach(function (a) { leer[a] = 0; });
  return {
    regelwerk: WFRP_REGELWERK, name: '', spieler: '', spezies: '', klasse: '', karriere: '', stufe: 1,
    verlauf: [], attrAnfang: Object.assign({}, leer), attrSteig: Object.assign({}, leer),
    fert: {}, tal: {}, schicksal: 0, glueck: 0, zaehigkeit: 0, entschlossenheit: 0, motivation: '',
    epGesamt: 0, epAusgegeben: 0, wunden: null, ausr: [], geld: { gk: 0, s: 0, d: 0 },
    ambKurz: '', ambLang: '', alter: '', groesse: '', augen: '', haare: '', notizen: ''
  };
}

/* Aus Firebase kommt manches als Objekt statt Array, und fehlende
   Felder sind einfach weg. Danach ist die Figur vollstaendig. */
function wfrpAlsFigur(roh) {
  var f = wfrpLeereFigur();
  if (!roh || typeof roh !== 'object') return f;
  Object.keys(roh).forEach(function (k) { f[k] = roh[k]; });
  f.attrAnfang = Object.assign(wfrpLeereFigur().attrAnfang, roh.attrAnfang || {});
  f.attrSteig = Object.assign(wfrpLeereFigur().attrSteig, roh.attrSteig || {});
  f.fert = Object.assign({}, roh.fert || {});
  f.tal = Object.assign({}, roh.tal || {});
  f.ausr = alsListe(roh.ausr);
  f.verlauf = alsListe(roh.verlauf);
  f.geld = Object.assign({ gk: 0, s: 0, d: 0 }, roh.geld || {});
  f.stufe = Math.max(1, Math.min(4, +roh.stufe || 1));
  ['schicksal', 'glueck', 'zaehigkeit', 'entschlossenheit', 'epGesamt', 'epAusgegeben']
    .forEach(function (k) { f[k] = Math.max(0, +f[k] || 0); });
  return f;

  function alsListe(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x.filter(function (e) { return e !== null && e !== undefined; });
    return Object.keys(x).sort(function (a, b) { return +a - +b; }).map(function (k) { return x[k]; });
  }
}

function wfrpIstWfrp(roh) { return !!roh && roh.regelwerk === WFRP_REGELWERK; }

/* Wie oft hat die Figur ein Talent? Ueber alle Spezialisierungen
   hinweg, wenn keine genannt ist. */
function wfrpTalentStufe(F, id, spez) {
  var n = 0;
  Object.keys(F.tal || {}).forEach(function (k) {
    var t = wfrpKeyTeile(k);
    if (t.id !== id) return;
    if (spez && t.spez !== spez) return;
    n += +F.tal[k] || 0;
  });
  return n;
}

/* Talente, die ein Attribut dauerhaft um +5 heben (S. 132 ff.).
   Das zaehlt NICHT als Steigerung - fuer die EP-Kosten zaehlt
   weiter nur attrSteig. */
var WFRP_TALENT_ATTR = {
  kuehler_kopf: 'wk', blitzreflexe: 'gw', scharfschuetze: 'bf', geschickte_finger: 'gs',
  gewitzt: 'in', aufmerksam: 'i', gewandt: 'ch', sehr_widerstandsfaehig: 'wi',
  sehr_stark: 'st', geborener_krieger: 'kg'
};

function wfrpAttrWert(F, a) {
  var w = (+F.attrAnfang[a] || 0) + (+F.attrSteig[a] || 0);
  Object.keys(WFRP_TALENT_ATTR).forEach(function (tid) {
    if (WFRP_TALENT_ATTR[tid] === a && wfrpTalentStufe(F, tid) > 0) w += 5;
  });
  return w;
}
function wfrpAttrWerte(F) {
  var o = {};
  WFRP_ATTR_IDS.forEach(function (a) { o[a] = wfrpAttrWert(F, a); });
  return o;
}

/* Lebenspunkte ("Wounds", S. 33): ST-Bonus + 2 x WI-Bonus + WK-Bonus;
   Halblinge ohne den ST-Bonus. "Zaeh" gibt je Stufe den WI-Bonus dazu. */
function wfrpWundenMax(F) {
  var w = wfrpAttrWerte(F);
  var sb = wfrpBonus(w.st), tb = wfrpBonus(w.wi), wpb = wfrpBonus(w.wk);
  var sp = WFRP_SPEZIES[F.spezies];
  var basis = (sp && sp.wunden === 'halbling') ? 2 * tb + wpb : sb + 2 * tb + wpb;
  return basis + wfrpTalentStufe(F, 'zaeh') * tb;
}

function wfrpBewegung(F) {
  var sp = WFRP_SPEZIES[F.spezies];
  var b = (sp ? sp.bewegung : 4) + (wfrpTalentStufe(F, 'leichtfuessig') > 0 ? 1 : 0);
  return { bewegung: b, gehen: 2 * b, rennen: 4 * b };
}

/* Hoechstwerte der Punkte-Vorraete (S. 170 f.) */
function wfrpGlueckMax(F) { return (+F.schicksal || 0) + wfrpTalentStufe(F, 'glueck'); }
function wfrpEntschlossenheitMax(F) { return (+F.zaehigkeit || 0) + wfrpTalentStufe(F, 'willensstark'); }

/* Traglast (S. 292): ST-Bonus + WI-Bonus, dazu Staemmig (x2) und
   Starker Ruecken. */
function wfrpTraglast(F) {
  var w = wfrpAttrWerte(F);
  return wfrpBonus(w.st) + wfrpBonus(w.wi) + 2 * wfrpTalentStufe(F, 'stabil') +
         wfrpTalentStufe(F, 'starker_ruecken');
}

/* Der Wert einer Fertigkeit. Grundfertigkeiten darf jeder pruefen
   (am Attribut), fortgeschrittene nur mit mindestens einer
   Steigerung - dann ist "kann" false und "wert" null. */
function wfrpFertWert(F, key) {
  var k = wfrpKeyTeile(key);
  var def = WFRP_FERT_BY_ID[k.id];
  if (!def) return null;
  var steig = +((F.fert || {})[key]) || 0;
  var kann = def.basis || steig > 0;
  var wert = wfrpAttrWert(F, def.attr) + steig;
  return { key: key, id: k.id, spez: k.spez, def: def, attr: def.attr, steig: steig,
           kann: kann, wert: kann ? wert : null };
}

/* Was die Figur pruefen kann: alles Gelernte, dazu jede
   Grundfertigkeit. Eine gruppierte Grundfertigkeit ohne gelernte
   Spezialisierung steht als ein Eintrag da ("Nahkampf"). */
function wfrpFertigkeitenListe(F) {
  var keys = Object.keys(F.fert || {}).filter(function (k) { return (+F.fert[k] || 0) > 0; });
  var hat = {};
  keys.forEach(function (k) { hat[wfrpKeyTeile(k).id] = true; });
  WFRP_FERTIGKEITEN.forEach(function (f) {
    if (f.basis && !hat[f.id]) keys.push(f.id);
  });
  return keys.map(function (k) { return wfrpFertWert(F, k); }).filter(Boolean)
    .sort(function (a, b) { return wfrpKeyText(a.key).localeCompare(wfrpKeyText(b.key), 'de'); });
}

/* ---------------- Karriere ---------------- */
function wfrpKarriere(F) { return WFRP_KARR_BY_ID[F.karriere] || null; }
function wfrpStufe(F) {
  var k = wfrpKarriere(F);
  return k ? k.stufen[(F.stufe || 1) - 1] : null;
}
function wfrpStatusText(stufe) {
  if (!stufe) return '';
  var n = { messing: 'Messing', silber: 'Silber', gold: 'Gold' }[stufe.stand] || stufe.stand;
  return n + ' ' + stufe.standing;
}

/* Was die aktuelle Stufe zu steigern erlaubt (S. 47):
   Attribute bis zur eigenen Stufe, Fertigkeiten aus dieser UND
   allen niedrigeren Stufen, Talente NUR aus der aktuellen. */
function wfrpVerfuegbar(F) {
  var k = wfrpKarriere(F);
  var L = F.stufe || 1;
  if (!k) return { attr: [], fert: [], tal: [] };
  var attr = WFRP_ATTR_IDS.filter(function (a) { return k.schema[a] && k.schema[a] <= L; });
  var fert = [];
  for (var i = 0; i < L; i++) k.stufen[i].fert.forEach(function (r) { fert.push(r); });
  return { attr: attr, fert: fert, tal: k.stufen[L - 1].tal.slice() };
}

function wfrpFertImKarriere(F, key) {
  return wfrpVerfuegbar(F).fert.some(function (r) { return wfrpRefPasst(r, key); });
}
function wfrpTalImKarriere(F, key) {
  return wfrpVerfuegbar(F).tal.some(function (r) { return wfrpRefPasst(r, key); });
}

/* ---------------- Erfahrung (S. 47) ---------------- */
/* Preis der NAECHSTEN Steigerung, abhaengig davon, wie viele schon
   gekauft sind: die ersten fuenf zum ersten Preis, die naechsten
   fuenf zum zweiten usw. (Beispiel S. 47: 9 Schleichen-Steigerungen
   = 5 x 10 + 4 x 15). */
var WFRP_EP_ATTR = [25, 30, 40, 50, 70, 90, 120, 150, 190, 230, 280, 330, 390, 450, 520];
var WFRP_EP_FERT = [10, 15, 20, 30, 40, 60, 80, 110, 140, 180, 220, 270, 320, 380, 440];
function wfrpKostenStufe(tabelle, bisher) {
  return tabelle[Math.min(tabelle.length - 1, Math.floor(Math.max(0, bisher) / 5))];
}
function wfrpKostenAttr(bisher) { return wfrpKostenStufe(WFRP_EP_ATTR, bisher); }
function wfrpKostenFert(bisher) { return wfrpKostenStufe(WFRP_EP_FERT, bisher); }
function wfrpKostenTalent(bisher) { return 100 * ((+bisher || 0) + 1); }

function wfrpEpFrei(F) { return (+F.epGesamt || 0) - (+F.epAusgegeben || 0); }

/* Was kostet die naechste Steigerung? Ausserhalb der Karriere das
   Doppelte (S. 48) - Talente ausserhalb der Karriere gar nicht. */
function wfrpSteigerKosten(F, art, key) {
  if (art === 'attr') {
    var imK = wfrpVerfuegbar(F).attr.indexOf(key) >= 0;
    var k = wfrpKostenAttr(+F.attrSteig[key] || 0);
    return { kosten: imK ? k : 2 * k, imKarriere: imK };
  }
  if (art === 'fert') {
    var imF = wfrpFertImKarriere(F, key);
    var kf = wfrpKostenFert(+F.fert[key] || 0);
    return { kosten: imF ? kf : 2 * kf, imKarriere: imF };
  }
  if (art === 'tal') {
    var imT = wfrpTalImKarriere(F, key);
    var t = WFRP_TAL_BY_ID[wfrpKeyTeile(key).id];
    var bisher = +F.tal[key] || 0;
    var max = wfrpTalentMax(F, key);
    if (!imT) return { kosten: null, imKarriere: false, grund: 'nicht in deiner Karrierestufe' };
    if (max !== null && bisher >= max) return { kosten: null, imKarriere: true, grund: 'Höchststufe erreicht (' + max + ')' };
    return { kosten: wfrpKostenTalent(bisher), imKarriere: true, talent: t };
  }
  return { kosten: null };
}

/* Wie oft darf man ein Talent nehmen? Zahl, Attributsbonus oder
   unbegrenzt (null). */
function wfrpTalentMax(F, key) {
  var t = WFRP_TAL_BY_ID[wfrpKeyTeile(key).id];
  if (!t || t.max === null || t.max === undefined) return null;
  if (typeof t.max === 'number') return t.max;
  return Math.max(1, wfrpBonus(wfrpAttrWert(F, t.max)));
}

/* Steigern. Aendert die Figur NUR im Erfolgsfall. */
function wfrpSteigern(F, art, key, opt) {
  opt = opt || {};
  var k = wfrpSteigerKosten(F, art, key);
  if (k.kosten === null) return { ok: false, grund: k.grund || 'nicht möglich' };
  if (!k.imKarriere && !opt.ausserhalb) return { ok: false, grund: 'außerhalb der Karriere', kosten: k.kosten };
  if (wfrpEpFrei(F) < k.kosten) return { ok: false, grund: 'zu wenig EP', kosten: k.kosten };
  if (art === 'attr') F.attrSteig[key] = (+F.attrSteig[key] || 0) + 1;
  else if (art === 'fert') F.fert[key] = (+F.fert[key] || 0) + 1;
  else F.tal[key] = (+F.tal[key] || 0) + 1;
  F.epAusgegeben = (+F.epAusgegeben || 0) + k.kosten;
  return { ok: true, kosten: k.kosten };
}

/* Ist die Karrierestufe abgeschlossen (S. 48)?
     - jedes Attribut der Stufe mit mindestens 5 x Stufe Steigerungen,
     - acht der verfuegbaren Fertigkeiten ebenso,
     - mindestens ein Talent der aktuellen Stufe.
   Gezaehlt wird, was die Figur HAT - auch aus frueheren Karrieren. */
function wfrpKarriereAbgeschlossen(F) {
  var L = F.stufe || 1, soll = 5 * L;
  var v = wfrpVerfuegbar(F);
  var fehlt = [];
  v.attr.forEach(function (a) {
    if ((+F.attrSteig[a] || 0) < soll) fehlt.push(WFRP_ATTR_BY_ID[a].n + ' ' + (+F.attrSteig[a] || 0) + '/' + soll);
  });
  var benutzt = {};
  var fertigeFert = 0;
  v.fert.forEach(function (ref) {
    var treffer = Object.keys(F.fert || {}).filter(function (k) {
      return !benutzt[k] && wfrpRefPasst(ref, k) && (+F.fert[k] || 0) >= soll;
    })[0];
    if (treffer) { benutzt[treffer] = true; fertigeFert++; }
  });
  if (fertigeFert < 8) fehlt.push('Fertigkeiten ' + fertigeFert + '/8 mit je ' + soll);
  var hatTal = v.tal.some(function (ref) {
    return Object.keys(F.tal || {}).some(function (k) { return wfrpRefPasst(ref, k) && (+F.tal[k] || 0) > 0; });
  });
  if (!hatTal) fehlt.push('ein Talent dieser Stufe');
  return { ok: fehlt.length === 0, fehlt: fehlt, soll: soll };
}

/* Karrierewechsel (S. 48): 100 EP abgeschlossen, 200 sonst,
   +100 in eine andere Klasse. */
function wfrpWechselKosten(F, zielKarriere) {
  var abg = wfrpKarriereAbgeschlossen(F).ok;
  var k = wfrpKarriere(F), z = WFRP_KARR_BY_ID[zielKarriere];
  var kosten = abg ? 100 : 200;
  if (k && z && k.klasse !== z.klasse) kosten += 100;
  return { kosten: kosten, abgeschlossen: abg, andereKlasse: !!(k && z && k.klasse !== z.klasse) };
}

function wfrpWechseln(F, zielKarriere, zielStufe) {
  var z = WFRP_KARR_BY_ID[zielKarriere];
  if (!z) return { ok: false, grund: 'unbekannte Karriere' };
  var k = wfrpWechselKosten(F, zielKarriere);
  if (wfrpEpFrei(F) < k.kosten) return { ok: false, grund: 'zu wenig EP', kosten: k.kosten };
  F.verlauf = (F.verlauf || []).concat([{ karriere: F.karriere, stufe: F.stufe }]);
  F.karriere = zielKarriere;
  F.klasse = z.klasse;
  F.stufe = Math.max(1, Math.min(4, zielStufe || 1));
  F.epAusgegeben = (+F.epAusgegeben || 0) + k.kosten;
  return { ok: true, kosten: k.kosten };
}

/* ---------------- Erschaffung ---------------- */
function wfrpAusTabelle(wurf, tabelle) {
  for (var i = 0; i < tabelle.length; i++) {
    if (wurf >= tabelle[i][0] && wurf <= tabelle[i][1]) return tabelle[i][2];
  }
  return null;
}

/* Spezies (S. 24): 01-90 Mensch, 91-94 Halbling, 95-98 Zwerg,
   99 Hochelf, 00 Waldelf. */
function wfrpSpeziesAusWurf(wurf) {
  var id = null;
  Object.keys(WFRP_SPEZIES).forEach(function (k) {
    var b = WFRP_SPEZIES[k].w100;
    if (wurf >= b[0] && wurf <= b[1]) id = k;
  });
  return id;
}

/* Klasse und Karriere (S. 30): je Spezies eine eigene Spalte. */
function wfrpKarriereAusWurf(spezies, wurf) {
  for (var i = 0; i < WFRP_KARRIEREN.length; i++) {
    var b = WFRP_KARRIEREN[i].wurf[spezies];
    if (b && wurf >= b[0] && wurf <= b[1]) return WFRP_KARRIEREN[i].id;
  }
  return null;
}

function wfrpZufallsTalent(wurf) { return wfrpAusTabelle(wurf, WFRP_ZUFALLSTALENTE); }

/* Attribute (S. 33): je 2W10 plus Spezies-Grundwert. */
function wfrpAttributWuerfe(rng) {
  return WFRP_ATTR_IDS.map(function () { return wfrpW(10, rng) + wfrpW(10, rng); });
}

/* Startgeld (S. 37): Messing 2W10 Pfennige je Stellung, Silber 1W10
   Schillinge je Stellung, Gold 1 Krone je Stellung. */
function wfrpStartgeld(stufe, rng) {
  var g = { gk: 0, s: 0, d: 0 }, n = +stufe.standing || 0, i;
  if (stufe.stand === 'messing') for (i = 0; i < 2 * n; i++) g.d += wfrpW(10, rng);
  else if (stufe.stand === 'silber') for (i = 0; i < n; i++) g.s += wfrpW(10, rng);
  else g.gk = n;
  return g;
}

/* 1 Goldkrone = 20 Silberschillinge = 240 Messingpfennige (S. 288) */
function wfrpGeldText(g) {
  g = g || {};
  var t = [];
  if (+g.gk) t.push(g.gk + ' GK');
  if (+g.s) t.push(g.s + ' S');
  if (+g.d || !t.length) t.push((+g.d || 0) + ' P');
  return t.join(' ');
}

/* EP-Boni der Erschaffung (S. 24-33) */
var WFRP_EP_BONUS = {
  spezies: 20,
  karriereErste: 50, karriereDrei: 25,
  attributeGewuerfelt: 50, attributeGetauscht: 25
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WFRP_REGELWERK, WFRP_ATTR_IDS, WFRP_SCHWIERIGKEITEN, WFRP_ERGEBNISSE, WFRP_TREFFERZONEN,
    WFRP_ATTR_BY_ID, WFRP_FERT_BY_ID, WFRP_TAL_BY_ID, WFRP_KARR_BY_ID, WFRP_KLASSE_BY_ID,
    WFRP_TALENT_ATTR, WFRP_EP_ATTR, WFRP_EP_FERT, WFRP_EP_BONUS,
    wfrpRefTeile, wfrpKey, wfrpKeyTeile, wfrpRefPasst, spezSauber, wfrpName, wfrpRefText, wfrpKeyText,
    wfrpW, wfrpW100, wfrpBonus, wfrpZiffern, wfrpIstPasch, wfrpProbe, wfrpErgebnisStufe, wfrpEgText,
    wfrpVergleich, wfrpUmdrehen, wfrpTrefferzone,
    wfrpLeereFigur, wfrpAlsFigur, wfrpIstWfrp, wfrpTalentStufe, wfrpAttrWert, wfrpAttrWerte,
    wfrpWundenMax, wfrpBewegung, wfrpGlueckMax, wfrpEntschlossenheitMax, wfrpTraglast,
    wfrpFertWert, wfrpFertigkeitenListe,
    wfrpKarriere, wfrpStufe, wfrpStatusText, wfrpVerfuegbar, wfrpFertImKarriere, wfrpTalImKarriere,
    wfrpKostenAttr, wfrpKostenFert, wfrpKostenTalent, wfrpEpFrei, wfrpSteigerKosten, wfrpTalentMax,
    wfrpSteigern, wfrpKarriereAbgeschlossen, wfrpWechselKosten, wfrpWechseln,
    wfrpAusTabelle, wfrpSpeziesAusWurf, wfrpKarriereAusWurf, wfrpZufallsTalent, wfrpAttributWuerfe,
    wfrpStartgeld, wfrpGeldText
  };
}
