/* ==========================================================
   WFRP 4e — ERSCHAFFUNG (Logik zu wfrp_erschaffung.html)
   ----------------------------------------------------------
   Ohne DOM und ohne Firebase. Die Seite haelt einen Zustand W
   (die Entscheidungen des Spielers) und rechnet daraus ueber
   wfrpErsFigur() die Figur. Die Figur wird NIE von Hand
   veraendert, nur neu gerechnet - so kann ein Zurueckgehen im
   Assistenten nichts doppelt eintragen.

   Ablauf nach Kapitel 2 des Regelwerks (S. 24-43):
     1 Spezies          wuerfeln (+20 EP) oder waehlen
     2 Karriere         ein Wurf (+50), drei zur Wahl (+25), frei
     3 Attribute        2W10 je Attribut: so behalten (+50),
                        getauscht (+25), neu gewuerfelt oder
                        100 Punkte verteilt (0)
                        dazu 5 Steigerungen auf die drei
                        Karriere-Attribute der Stufe 1
     4 Spezies          3 Fertigkeiten +5, 3 Fertigkeiten +3,
                        die Talente der Spezies
     5 Karriere         40 Steigerungen auf die 8 Fertigkeiten
                        (hoechstens 10 je Fertigkeit), 1 Talent
     6 Ausruestung      Klasse + Stufe 1, Startgeld nach Status
     7 Details          Name, Aussehen, Ambitionen
   Die Bonus-EP gibt man im Heldenbrief aus - dort steht dieselbe
   Steigerungsrechnung ohnehin, eine zweite hier waere die Kopie,
   die auseinanderlaeuft.
   ========================================================== */

var WFRP_ERS_SCHRITTE = [
  { id: 'spezies', n: 'Spezies' },
  { id: 'karriere', n: 'Karriere' },
  { id: 'attribute', n: 'Attribute' },
  { id: 'spezies2', n: 'Herkunft' },
  { id: 'karriere2', n: 'Ausbildung' },
  { id: 'ausr', n: 'Ausrüstung' },
  { id: 'details', n: 'Details' },
  { id: 'fertig', n: 'Fertig' }
];

function wfrpErsLeer() {
  return {
    schritt: 0,
    spezies: '', speziesWurf: null,
    karriere: '', karrWuerfe: [], karrModus: '',     // '', 'erster', 'drei', 'frei'
    attrWuerfe: null, attrZuord: null, attrModus: '', // 'gewuerfelt', 'getauscht', 'neu', 'punkte'
    attrPunkte: null, attrKarr: {},
    extraS: null, motivation: '',
    spFert5: [], spFert3: [], spez: {},
    spTalWahl: {}, tSpez: {}, zufall: [],
    karrFert: {}, karrTal: '',
    geld: null,
    name: '', alter: '', groesse: '', augen: '', haare: '', ambKurz: '', ambLang: '', hintergrund: ''
  };
}

function wfrpErsSpezies(W) { return WFRP_SPEZIES[W.spezies] || null; }
function wfrpErsKarriere(W) { return WFRP_KARR_BY_ID[W.karriere] || null; }

/* ---------------- Bezuege mit Wahl ----------------
   Ein Bezug wie "wissen/*" oder "schleichen/Land|Stadt" braucht
   eine Entscheidung, bevor er ein Schluessel der Figur wird.
   Feste Bezuege ("wissen/Recht") werden direkt einer. */
function wfrpErsBrauchtWahl(ref) {
  var r = wfrpRefTeile(ref);
  return r.spez === '*' || (Array.isArray(r.spez) && r.spez.length > 1);
}
function wfrpErsKey(W, ref, wahlen) {
  var r = wfrpRefTeile(ref);
  if (!r.spez) return r.id;
  if (!wfrpErsBrauchtWahl(ref)) return wfrpKey(r.id, r.spez[0]);
  var w = String(((wahlen || W.spez) || {})[ref] || '').trim();
  if (!w) return null;
  if (Array.isArray(r.spez) && r.spez.indexOf(w) < 0) return null;
  return wfrpKey(r.id, w);
}

/* ---------------- Attribute ---------------- */
function wfrpErsAttrRoh(W) {
  var o = {};
  WFRP_ATTR_IDS.forEach(function (a, i) {
    if (W.attrModus === 'punkte') o[a] = W.attrPunkte ? (+W.attrPunkte[a] || 0) : null;
    else if (W.attrWuerfe) o[a] = W.attrWuerfe[W.attrZuord ? W.attrZuord[a] : i];
    else o[a] = null;
  });
  return o;
}
function wfrpErsAttrAnfang(W) {
  var sp = wfrpErsSpezies(W), roh = wfrpErsAttrRoh(W), o = {};
  WFRP_ATTR_IDS.forEach(function (a) {
    o[a] = (sp && roh[a] !== null) ? sp.attr[a] + roh[a] : null;
  });
  return o;
}

/* Punkte verteilen (S. 33): 100 Punkte, je Attribut 4 bis 18. */
var WFRP_PUNKTE_SUMME = 100, WFRP_PUNKTE_MIN = 4, WFRP_PUNKTE_MAX = 18;
function wfrpErsPunkteSumme(W) {
  var s = 0;
  WFRP_ATTR_IDS.forEach(function (a) { s += +((W.attrPunkte || {})[a]) || 0; });
  return s;
}

/* Die drei Attribute der ersten Karrierestufe. */
function wfrpErsKarrAttr(W) {
  var k = wfrpErsKarriere(W);
  return k ? WFRP_ATTR_IDS.filter(function (a) { return k.schema[a] === 1; }) : [];
}
function wfrpErsSumme(o) {
  var s = 0; Object.keys(o || {}).forEach(function (k) { s += +o[k] || 0; }); return s;
}

/* ---------------- EP-Boni ---------------- */
function wfrpErsEp(W) {
  var e = { spezies: 0, karriere: 0, attribute: 0 };
  if (W.speziesWurf !== null && W.spezies && wfrpSpeziesAusWurf(W.speziesWurf) === W.spezies) e.spezies = WFRP_EP_BONUS.spezies;
  if (W.karriere && W.karrWuerfe.length) {
    if (W.karrModus === 'erster' && W.karrWuerfe[0] === W.karriere) e.karriere = WFRP_EP_BONUS.karriereErste;
    else if (W.karrModus === 'drei' && W.karrWuerfe.slice(0, 3).indexOf(W.karriere) >= 0) e.karriere = WFRP_EP_BONUS.karriereDrei;
  }
  if (W.attrModus === 'gewuerfelt') e.attribute = WFRP_EP_BONUS.attributeGewuerfelt;
  else if (W.attrModus === 'getauscht') e.attribute = WFRP_EP_BONUS.attributeGetauscht;
  e.summe = e.spezies + e.karriere + e.attribute;
  return e;
}

/* ---------------- Talente ---------------- */
/* Die festen Spezies-Talente, mit der getroffenen Wahl. */
function wfrpErsSpeziesTalente(W) {
  var sp = wfrpErsSpezies(W);
  if (!sp) return [];
  return sp.tal.map(function (t, i) {
    return Array.isArray(t) ? (W.spTalWahl[i] || null) : t;
  });
}

function wfrpErsTalKey(W, ref) { return wfrpErsKey(W, ref, W.tSpez); }

/* ---------------- Die Figur ---------------- */
function wfrpErsFigur(W, meta) {
  meta = meta || {};
  var F = wfrpLeereFigur();
  var sp = wfrpErsSpezies(W), k = wfrpErsKarriere(W);
  F.spezies = W.spezies || '';
  F.karriere = W.karriere || '';
  F.klasse = k ? k.klasse : '';
  F.stufe = 1;
  F.name = W.name || '';
  F.spieler = meta.spieler || '';

  var anf = wfrpErsAttrAnfang(W);
  WFRP_ATTR_IDS.forEach(function (a) {
    F.attrAnfang[a] = anf[a] === null ? 0 : anf[a];
    F.attrSteig[a] = wfrpErsKarrAttr(W).indexOf(a) >= 0 ? (+W.attrKarr[a] || 0) : 0;
  });

  // Fertigkeiten: Spezies und Karriere zaehlen zusammen.
  function plus(key, n) { if (key && n) F.fert[key] = (F.fert[key] || 0) + n; }
  W.spFert5.forEach(function (r) { plus(wfrpErsKey(W, r), 5); });
  W.spFert3.forEach(function (r) { plus(wfrpErsKey(W, r), 3); });
  Object.keys(W.karrFert || {}).forEach(function (r) { plus(wfrpErsKey(W, r), +W.karrFert[r] || 0); });

  // Talente
  function tal(ref) {
    var key = ref ? wfrpErsTalKey(W, ref) : null;
    if (key) F.tal[key] = (F.tal[key] || 0) + 1;
  }
  wfrpErsSpeziesTalente(W).forEach(tal);
  (W.zufall || []).forEach(tal);
  tal(W.karrTal || null);

  if (sp) {
    var extra = (W.extraS === null || W.extraS === undefined) ? 0 : +W.extraS;
    F.schicksal = sp.schicksal + extra;
    F.zaehigkeit = sp.zaehigkeit + (sp.extra - extra);
  }
  F.glueck = wfrpGlueckMax(F);
  F.entschlossenheit = wfrpEntschlossenheitMax(F);
  F.motivation = W.motivation || '';
  F.wunden = wfrpWundenMax(F);

  if (k) {
    var kl = WFRP_KLASSE_BY_ID[k.klasse];
    F.ausr = (kl ? kl.ausr : []).concat(k.stufen[0].ausr);
  }
  F.geld = W.geld ? Object.assign({ gk: 0, s: 0, d: 0 }, W.geld) : { gk: 0, s: 0, d: 0 };
  F.epGesamt = wfrpErsEp(W).summe;
  F.epAusgegeben = 0;
  ['alter', 'groesse', 'augen', 'haare', 'ambKurz', 'ambLang'].forEach(function (x) { F[x] = W[x] || ''; });
  F.notizen = W.hintergrund || '';
  return F;
}

/* ---------------- Was fehlt noch? ----------------
   Je Schritt eine Liste in Klartext. Leer heisst: fertig. Die
   Seite zeigt das am Schritt an und laesst erst abschliessen,
   wenn ALLES leer ist - weiterblaettern geht immer. */
function wfrpErsOffen(W) {
  var o = {}, sp = wfrpErsSpezies(W), k = wfrpErsKarriere(W);
  WFRP_ERS_SCHRITTE.forEach(function (s) { o[s.id] = []; });

  if (!sp) o.spezies.push('Wähle eine Spezies.');
  if (!k) o.karriere.push('Wähle eine Karriere.');
  else if (sp && k.spezies.indexOf(W.spezies) < 0) o.karriere.push(k.n + ' steht deiner Spezies normalerweise nicht offen — sprich mit der Spielleitung.');

  if (W.attrModus === 'punkte') {
    var summe = wfrpErsPunkteSumme(W);
    if (summe !== WFRP_PUNKTE_SUMME) o.attribute.push('Verteile genau 100 Punkte (jetzt ' + summe + ').');
    WFRP_ATTR_IDS.forEach(function (a) {
      var v = +((W.attrPunkte || {})[a]) || 0;
      if (v < WFRP_PUNKTE_MIN || v > WFRP_PUNKTE_MAX) o.attribute.push(WFRP_ATTR_BY_ID[a].n + ': 4 bis 18 Punkte.');
    });
  } else if (!W.attrWuerfe) o.attribute.push('Würfle deine Attribute aus.');
  if (k) {
    var ks = wfrpErsSumme(W.attrKarr);
    if (ks !== 5) o.attribute.push('Verteile 5 Steigerungen auf deine Karriere-Attribute (jetzt ' + ks + ').');
  }
  if (sp && (W.extraS === null || W.extraS === undefined)) o.attribute.push('Verteile deine Extrapunkte auf Schicksal und Zähigkeit.');
  if (!String(W.motivation || '').trim()) o.attribute.push('Gib deiner Figur eine Motivation.');

  if (sp) {
    if (W.spFert5.length !== 3) o.spezies2.push('Wähle 3 Fertigkeiten mit +5 (jetzt ' + W.spFert5.length + ').');
    if (W.spFert3.length !== 3) o.spezies2.push('Wähle 3 Fertigkeiten mit +3 (jetzt ' + W.spFert3.length + ').');
    W.spFert5.concat(W.spFert3).forEach(function (r) {
      if (!wfrpErsKey(W, r)) o.spezies2.push(wfrpRefText(r) + ': Wähle die Spezialisierung.');
    });
    sp.tal.forEach(function (t, i) {
      if (Array.isArray(t) && !W.spTalWahl[i]) o.spezies2.push('Wähle: ' + t.map(wfrpRefText).join(' oder ') + '.');
    });
    if ((W.zufall || []).length < sp.zufall) o.spezies2.push('Würfle ' + (sp.zufall - (W.zufall || []).length) + ' Zufallstalent(e).');
    wfrpErsSpeziesTalente(W).concat(W.zufall || []).forEach(function (r) {
      if (r && !wfrpErsTalKey(W, r)) o.spezies2.push(wfrpRefText(r) + ': Wähle die Spezialisierung.');
    });
  }

  if (k) {
    var s = wfrpErsSumme(W.karrFert);
    if (s !== 40) o.karriere2.push('Verteile 40 Steigerungen auf deine Karrierefertigkeiten (jetzt ' + s + ').');
    Object.keys(W.karrFert || {}).forEach(function (r) {
      if ((+W.karrFert[r] || 0) > 10) o.karriere2.push(wfrpRefText(r) + ': höchstens 10.');
      if ((+W.karrFert[r] || 0) > 0 && !wfrpErsKey(W, r)) o.karriere2.push(wfrpRefText(r) + ': Wähle die Spezialisierung.');
    });
    if (!W.karrTal) o.karriere2.push('Wähle ein Talent deiner Karriere.');
    else if (!wfrpErsTalKey(W, W.karrTal)) o.karriere2.push(wfrpRefText(W.karrTal) + ': Wähle die Spezialisierung.');
  }
  /* Ein Talent oefter, als es geht: Ein Zufallstalent kann dasselbe sein
     wie das gewaehlte Karrieretalent ("Lesen und Schreiben" steht in
     beiden). Das faellt erst beim Zusammenrechnen auf - also hier. */
  var F = wfrpErsFigur(W);
  Object.keys(F.tal).forEach(function (key) {
    var max = wfrpTalentMax(F, key);
    if (max !== null && F.tal[key] > max) {
      o.karriere2.push(wfrpKeyText(key) + ' hast du schon' + (max === 1 ? '' : ' ' + max + '-mal') +
        ' — wähle ein anderes Talent.');
    }
  });

  if (k && !W.geld) o.ausr.push('Würfle dein Startgeld aus.');
  if (!String(W.name || '').trim()) o.details.push('Gib deiner Figur einen Namen.');
  return o;
}
function wfrpErsFertig(W) {
  var o = wfrpErsOffen(W);
  return Object.keys(o).every(function (k) { return !o[k].length; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WFRP_ERS_SCHRITTE, WFRP_PUNKTE_SUMME, WFRP_PUNKTE_MIN, WFRP_PUNKTE_MAX,
    wfrpErsLeer, wfrpErsSpezies, wfrpErsKarriere, wfrpErsBrauchtWahl, wfrpErsKey,
    wfrpErsAttrRoh, wfrpErsAttrAnfang, wfrpErsPunkteSumme, wfrpErsKarrAttr, wfrpErsSumme,
    wfrpErsEp, wfrpErsSpeziesTalente, wfrpErsTalKey, wfrpErsFigur, wfrpErsOffen, wfrpErsFertig
  };
}
