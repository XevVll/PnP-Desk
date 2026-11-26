/* ==========================================================
   WFRP 4e — DATEN UND REGELKERN (js/wfrp_daten.js, js/wfrp_regelwerk.js)

   Geprueft wird GEGEN DAS REGELWERK, nicht gegen den Code: Die
   Probe-Beispiele stehen woertlich so im Buch (S. 152-154), die
   EP-Rechnung ebenso (S. 47). Stimmt eine davon nicht, ist der
   Code falsch, nicht die Pruefung.

   Die Daten wurden einmal aus dem PDF gelesen. Die gefaehrlichste
   Fehlerklasse dabei ist ein LESEFEHLER, der gueltig aussieht: eine
   verrutschte Zahl in der Wurftabelle, eine Karriere mit drei statt
   vier Stufen. Deshalb pruefen die Datenbloecke Eigenschaften, die
   das Buch garantiert - jede Wurftabelle deckt 01-00 genau einmal
   ab, jedes Attributsschema hat dreimal Stufe 1 und je einmal 2/3/4.

   LADEN wie im Browser: beide Dateien in EINEM Kontext.
   ========================================================== */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const WURZEL = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
['js/wfrp_daten.js', 'js/wfrp_regelwerk.js'].forEach(function (p) {
  vm.runInContext(fs.readFileSync(path.join(WURZEL, p), 'utf8'), ctx, { filename: p });
});
/* Beide Dateien deklarieren mit var und function - das landet als
   Eigenschaft im Kontext. (const/let waeren von aussen unsichtbar.) */
const R = ctx;

let f = 0, anzahl = 0;
const chk = (n, c, x) => {
  anzahl++;
  console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x)));
  if (!c) f++;
};

/* ---------------- Die Probe: Beispiele aus dem Buch ---------------- */
(function () {
  // S. 152: Ride (Horse) 41, Wurf 29 -> +2 EG, gelungen.
  let p = R.wfrpProbe(41, { wurf: 29 });
  chk('Reiten 41, Wurf 29: gelungen mit +2 EG', p.ok && p.eg === 2, p);
  // S. 152: Perception 39, Wurf 82 -> -5 EG.
  p = R.wfrpProbe(39, { wurf: 82 });
  chk('Wahrnehmung 39, Wurf 82: misslungen mit -5 EG', !p.ok && p.eg === -5, p);
  // S. 153: Valentyn, Spurenlesen 41, sehr schwer -30 -> 11; Wurf 35 misslingt.
  p = R.wfrpProbe(41, { wurf: 35, mod: -30 });
  chk('Spurenlesen 41 bei -30: Wurf 35 misslingt', !p.ok && p.ziel === 11, p);
  // S. 154: Molli, Schloesser knacken 58 - Wuerfe 63, 11, 42.
  chk('Schlösser 58, Wurf 63: -1 EG', R.wfrpProbe(58, { wurf: 63 }).eg === -1);
  chk('Schlösser 58, Wurf 11: +4 EG', R.wfrpProbe(58, { wurf: 11 }).eg === 4);
  chk('Schlösser 58, Wurf 42: +1 EG', R.wfrpProbe(58, { wurf: 42 }).eg === 1);

  // S. 153: vergleichend. Einschuechtern 47 Wurf 04 (+4) gegen Fuehrung 46 Wurf 16 (+3).
  let a = R.wfrpProbe(47, { wurf: 4 }), b = R.wfrpProbe(46, { wurf: 16 });
  chk('Einschüchtern +4 gegen Führung +3', a.eg === 4 && b.eg === 3, [a.eg, b.eg]);
  chk('… Salundra gewinnt', R.wfrpVergleich(a, b).sieger === 'a');
  // S. 154: Ausdauer 45 Wurf 51 (-1) gegen 63 Wurf 91 (-3): gewinnt um 2 EG, obwohl misslungen.
  a = R.wfrpProbe(45, { wurf: 51 }); b = R.wfrpProbe(63, { wurf: 91 });
  const v = R.wfrpVergleich(a, b);
  chk('Ausdauer -1 gegen -3: gewonnen mit 2 EG Abstand', v.sieger === 'a' && v.eg === 2, v);
  // Gleichstand der EG: der hoehere Wert gewinnt.
  a = R.wfrpProbe(45, { wurf: 41 }); b = R.wfrpProbe(48, { wurf: 42 });
  chk('gleiche EG: der höhere geprüfte Wert gewinnt', a.eg === b.eg && R.wfrpVergleich(a, b).sieger === 'b');
  chk('völliger Gleichstand: Patt', R.wfrpVergleich(R.wfrpProbe(40, { wurf: 30 }), R.wfrpProbe(40, { wurf: 31 })).sieger === null);

  // S. 150/152: 01-05 gelingt immer (mind. +1), 96-00 misslingt immer (hoechstens -1).
  p = R.wfrpProbe(2, { wurf: 3 });
  chk('01-05 gelingt immer, auch gegen Wert 2', p.ok && p.eg === 1 && p.auto === 'erfolg', p);
  p = R.wfrpProbe(120, { wurf: 97 });
  chk('96-00 misslingt immer, auch gegen Wert 120', !p.ok && p.eg <= -1 && p.auto === 'misserfolg', p);
  p = R.wfrpProbe(99, { wurf: 97 });
  chk('… und mit höchstens -1 EG', p.eg === -1, p);
  p = R.wfrpProbe(30, { wurf: 100 });
  chk('ein Wurf von 00 zählt als 100', !p.ok && p.wurf === 100 && p.eg === -7, p);
  p = R.wfrpProbe(80, { wurf: 4 });
  chk('ein Autoerfolg behält höhere EG', p.eg === 8, p);

  // Knapp: +0 und -0 unterscheiden sich nur durch ok.
  const plus = R.wfrpProbe(41, { wurf: 40 }), minus = R.wfrpProbe(41, { wurf: 45 });
  chk('+0 EG ist ein knapper Erfolg', plus.ok && plus.eg === 0 && plus.stufe.n === 'Knapper Erfolg', plus);
  chk('-0 EG ist ein knapper Misserfolg', !minus.ok && minus.eg === 0 && minus.stufe.n === 'Knapper Misserfolg', minus);
  chk('… und die Anzeige unterscheidet sie', R.wfrpEgText(0, true) === '+0' && R.wfrpEgText(0, false) === '−0');

  // Ergebnistabelle S. 152
  chk('+6 EG: herausragend', R.wfrpErgebnisStufe(6, true).n === 'Herausragender Erfolg');
  chk('+4 EG: beeindruckend', R.wfrpErgebnisStufe(4, true).n === 'Beeindruckender Erfolg');
  chk('+2 EG: Erfolg', R.wfrpErgebnisStufe(2, true).n === 'Erfolg');
  chk('-2 EG: Misserfolg', R.wfrpErgebnisStufe(-2, false).n === 'Misserfolg');
  chk('-4 EG: beeindruckender Misserfolg', R.wfrpErgebnisStufe(-4, false).n === 'Beeindruckender Misserfolg');
  chk('-6 EG: katastrophal', R.wfrpErgebnisStufe(-6, false).n === 'Katastrophaler Misserfolg');

  // Pasch: kritisch bei Erfolg, Patzer bei Misserfolg.
  chk('33 gegen 50 ist kritisch', R.wfrpProbe(50, { wurf: 33 }).kritisch);
  chk('77 gegen 50 ist ein Patzer', R.wfrpProbe(50, { wurf: 77 }).patzer);
  chk('00 ist ein Pasch', R.wfrpIstPasch(100));
  chk('34 ist kein Pasch', !R.wfrpIstPasch(34));

  // Trefferzone S. 159: 23 -> 32 -> rechter Arm.
  chk('Wurf 23 trifft den rechten Arm (32)', R.wfrpTrefferzone(23).n === 'Rechter Arm' && R.wfrpTrefferzone(23).wurf === 32);
  chk('Wurf 10 -> 01 -> Kopf', R.wfrpTrefferzone(10).n === 'Kopf');
  chk('Wurf 100 -> 00 -> rechtes Bein', R.wfrpTrefferzone(100).n === 'Rechtes Bein');
  chk('Wurf 97 -> 79 -> Körper', R.wfrpTrefferzone(97).n === 'Körper');

  // Echte Wuerfe: alle 1..100 kommen vor, nichts ausserhalb.
  const gesehen = new Set();
  for (let i = 0; i < 20000; i++) gesehen.add(R.wfrpW100());
  chk('W100 liefert genau 1 bis 100', gesehen.size === 100 && Math.min(...gesehen) === 1 && Math.max(...gesehen) === 100);
})();

/* ---------------- Erfahrung, S. 47 ---------------- */
(function () {
  let s = 0; for (let i = 0; i < 9; i++) s += R.wfrpKostenFert(i);
  chk('9 Schleichen-Steigerungen kosten 5x10 + 4x15 = 110', s === 110, s);
  s = 0; for (let i = 0; i < 4; i++) s += R.wfrpKostenAttr(i);
  chk('4 Gewandtheit-Steigerungen kosten 4x25 = 100', s === 100, s);
  chk('die 6. Attributsteigerung kostet 30', R.wfrpKostenAttr(5) === 30);
  chk('über 70 Steigerungen: 520 / 440', R.wfrpKostenAttr(90) === 520 && R.wfrpKostenFert(90) === 440);
  chk('Talent: 100, dann 200, dann 300', R.wfrpKostenTalent(0) === 100 && R.wfrpKostenTalent(1) === 200 && R.wfrpKostenTalent(2) === 300);
  chk('Stärke 39 = ST-Bonus 3', R.wfrpBonus(39) === 3);
  chk('Willenskraft 51 = WK-Bonus 5', R.wfrpBonus(51) === 5);
})();

/* ---------------- Daten: was das Buch garantiert ---------------- */
(function () {
  const K = R.WFRP_KARRIEREN;
  chk('64 Karrieren', K.length === 64, K.length);
  chk('8 Klassen mit je 8 Karrieren', R.WFRP_KLASSEN.length === 8 &&
    R.WFRP_KLASSEN.every(kl => K.filter(k => k.klasse === kl.id).length === 8));
  chk('jede Karriere hat 4 Stufen', K.every(k => k.stufen.length === 4));
  chk('jedes Attributsschema: dreimal Stufe 1, je einmal 2, 3, 4',
    K.every(k => JSON.stringify(Object.values(k.schema).sort()) === '[1,1,1,2,3,4]'),
    K.filter(k => JSON.stringify(Object.values(k.schema).sort()) !== '[1,1,1,2,3,4]').map(k => k.id));
  chk('Stufe 1 hat immer 8 Fertigkeiten und 4 Talente',
    K.every(k => k.stufen[0].fert.length === 8 && k.stufen[0].tal.length === 4),
    K.filter(k => k.stufen[0].fert.length !== 8 || k.stufen[0].tal.length !== 4).map(k => [k.id, k.stufen[0].fert.length, k.stufen[0].tal.length]));
  chk('jede Stufe hat 4 Talente', K.every(k => k.stufen.every(s => s.tal.length === 4)),
    K.filter(k => k.stufen.some(s => s.tal.length !== 4)).map(k => k.id));
  chk('Status ist Messing, Silber oder Gold', K.every(k => k.stufen.every(s => ['messing', 'silber', 'gold'].indexOf(s.stand) >= 0)));
  chk('jede Karriere hat einen deutschen Namen und das Original',
    K.every(k => k.n && k.en && k.stufen.every(s => s.n && s.en)));

  // Bezuege zeigen auf etwas, das es gibt.
  const fehlF = [], fehlT = [];
  K.forEach(k => k.stufen.forEach(s => {
    s.fert.forEach(r => { if (!R.WFRP_FERT_BY_ID[R.wfrpRefTeile(r).id]) fehlF.push(k.id + ':' + r); });
    s.tal.forEach(r => { if (!R.WFRP_TAL_BY_ID[R.wfrpRefTeile(r).id]) fehlT.push(k.id + ':' + r); });
  }));
  chk('jede Fertigkeit einer Karriere existiert', !fehlF.length, fehlF);
  chk('jedes Talent einer Karriere existiert', !fehlT.length, fehlT);

  // Wurftabellen: jede Spalte deckt 01-00 genau einmal ab.
  Object.keys(R.WFRP_SPEZIES).forEach(sp => {
    const zahl = new Array(101).fill(0);
    K.forEach(k => { const b = k.wurf[sp]; if (b) for (let i = b[0]; i <= b[1]; i++) zahl[i]++; });
    const loch = [], doppelt = [];
    for (let i = 1; i <= 100; i++) { if (!zahl[i]) loch.push(i); if (zahl[i] > 1) doppelt.push(i); }
    chk('Karriere-Wurftabelle ' + sp + ' deckt 01-00 genau einmal ab', !loch.length && !doppelt.length, { loch, doppelt });
  });
  // Und die Spezies einer Karriere sind genau die Spalten, in denen sie steht.
  const abw = K.filter(k => JSON.stringify(k.spezies.slice().sort()) !== JSON.stringify(Object.keys(k.wurf).sort()))
    .map(k => [k.id, k.spezies, Object.keys(k.wurf)]);
  chk('Spezies einer Karriere = Spalten der Wurftabelle', !abw.length, abw);

  const sp = new Array(101).fill(0);
  Object.values(R.WFRP_SPEZIES).forEach(s => { for (let i = s.w100[0]; i <= s.w100[1]; i++) sp[i]++; });
  chk('Spezies-Wurf deckt 01-00 genau einmal ab', sp.slice(1).every(x => x === 1));
  const zt = new Array(101).fill(0);
  R.WFRP_ZUFALLSTALENTE.forEach(z => { for (let i = z[0]; i <= z[1]; i++) zt[i]++; });
  chk('Zufallstalente decken 01-00 genau einmal ab', zt.slice(1).every(x => x === 1));
  chk('jedes Zufallstalent existiert', R.WFRP_ZUFALLSTALENTE.every(z => R.WFRP_TAL_BY_ID[R.wfrpRefTeile(z[2]).id]));

  // Spezies (S. 33)
  const m = R.WFRP_SPEZIES.mensch, z = R.WFRP_SPEZIES.zwerg, h = R.WFRP_SPEZIES.halbling;
  chk('Mensch: alles 20, Schicksal 2, Zähigkeit 1, Extra 3, Bewegung 4',
    Object.values(m.attr).every(x => x === 20) && m.schicksal === 2 && m.zaehigkeit === 1 && m.extra === 3 && m.bewegung === 4);
  chk('Zwerg: WK 40, GW 10, CH 10, Bewegung 3', z.attr.wk === 40 && z.attr.gw === 10 && z.attr.ch === 10 && z.bewegung === 3);
  chk('Halbling: BF 30, KG 10, Lebenspunkte ohne ST-Bonus', h.attr.bf === 30 && h.attr.kg === 10 && h.wunden === 'halbling');
  chk('Elfen: I 40, Bewegung 5', R.WFRP_SPEZIES.hochelf.attr.i === 40 && R.WFRP_SPEZIES.waldelf.bewegung === 5);
  chk('jede Spezies hat 12 Fertigkeiten zur Wahl', Object.values(R.WFRP_SPEZIES).every(s => s.fert.length === 12));

  // Talente
  chk('167 Talente', R.WFRP_TALENTE.length === 167, R.WFRP_TALENTE.length);
  chk('jedes Talent hat Name, Original und Beschreibung', R.WFRP_TALENTE.every(t => t.n && t.en && t.d && t.d.length > 10));
  chk('keine doppelten deutschen Talentnamen',
    new Set(R.WFRP_TALENTE.map(t => t.n)).size === R.WFRP_TALENTE.length,
    R.WFRP_TALENTE.map(t => t.n).filter((n, i, a) => a.indexOf(n) !== i));
  chk('45 Fertigkeiten', R.WFRP_FERTIGKEITEN.length === 45);
  chk('jede Fertigkeit hängt an einem Attribut', R.WFRP_FERTIGKEITEN.every(f => R.WFRP_ATTR_BY_ID[f.attr]));

  /* Warhammer-Eigennamen bleiben im Original (Hendrik, 26.11.2026). Eine
     Uebersetzung, die beim naechsten Umbau zurueckkommt, soll auffallen. */
  const alles = JSON.stringify([R.WFRP_FERTIGKEITEN, R.WFRP_KARRIEREN, R.WFRP_SPEZIES]);
  const eigen = ['Weirdroot', 'Heartkill', 'Demigryph', 'Great Wolf', 'Wolfship', 'Grey Order',
    'Shipsword', 'Huffer', 'Greenfish', 'Battle Tongue', 'Wastelander', 'Mootish'];
  chk('Warhammer-Eigennamen stehen im Original da', eigen.every(n => alles.indexOf(n) >= 0),
    eigen.filter(n => alles.indexOf(n) < 0));
  const deutsch = ['Wurzelrausch', 'Herztod', 'Halbgreif', 'Großwolf', 'Wolfsschiff', 'Grauer Orden',
    'Schiffsschwert', 'Flusslotse', 'Grünfisch', 'Schlachtsprache', 'Ödländisch', 'Mootisch'];
  chk('… und keine eingedeutschte Fassung davon', deutsch.every(n => alles.indexOf(n) < 0),
    deutsch.filter(n => alles.indexOf(n) >= 0));
  chk('Ländersprachen bleiben deutsch', ['Bretonisch', 'Tileanisch', 'Estalisch'].every(n => alles.indexOf(n) >= 0));

  // Errata vom 28.02. (stichprobenhaft): sie muessen eingearbeitet sein.
  const st = (id, n) => R.WFRP_KARR_BY_ID[id].stufen[n];
  chk('Errata: Kaufmann steigert KG ab Stufe 2, WK ab Stufe 1',
    R.WFRP_KARR_BY_ID.kaufmann.schema.kg === 2 && R.WFRP_KARR_BY_ID.kaufmann.schema.wk === 1);
  chk('Errata: Fallensteller hat Fernkampf (Schleuder)', st('jaeger', 0).fert.indexOf('fernkampf/Schleuder') >= 0);
  chk('Errata: Dorfbewohner hat Ausweichen', st('dorfbewohner', 1).fert.indexOf('ausweichen') >= 0);
  chk('Errata: Meisterdieb ohne Wurfmesser', st('dieb', 2).ausr.indexOf('Wurfmesser') < 0);
  chk('Errata: Hexe hat Zweites Gesicht', st('hexe', 1).tal.indexOf('zweites_gesicht') >= 0);
  chk('Errata: Grabräuber hat Fahren statt Ausdauer',
    st('grabraeuber', 1).fert.indexOf('fahren') >= 0 && st('grabraeuber', 1).fert.indexOf('ausdauer') < 0);
})();

/* ---------------- Die Figur ---------------- */
function figur(over) {
  const F = R.wfrpAlsFigur(Object.assign({
    regelwerk: 'wfrp4', name: 'Molli', spezies: 'mensch', klasse: 'gelehrte', karriere: 'advokat', stufe: 1,
    attrAnfang: { kg: 30, bf: 28, st: 33, wi: 35, i: 31, gw: 29, gs: 34, in: 38, wk: 42, ch: 36 }
  }, over || {}));
  return F;
}
(function () {
  let F = figur();
  chk('Lebenspunkte Mensch: SB 3 + 2x WB 3 + WKB 4 = 13', R.wfrpWundenMax(F) === 13, R.wfrpWundenMax(F));
  F = figur({ spezies: 'halbling' });
  chk('Lebenspunkte Halbling: 2x WB 3 + WKB 4 = 10', R.wfrpWundenMax(F) === 10, R.wfrpWundenMax(F));
  F = figur({ tal: { zaeh: 1 } });
  chk('Zäh gibt den WI-Bonus dazu', R.wfrpWundenMax(F) === 16);
  F = figur({ tal: { gewitzt: 1 } });
  chk('Gewitzt: +5 Intelligenz', R.wfrpAttrWert(F, 'in') === 43);
  chk('… zählt aber nicht als Steigerung', (F.attrSteig.in || 0) === 0);
  F = figur({ attrSteig: { kg: 4 } });
  chk('Steigerungen heben den Wert', R.wfrpAttrWert(F, 'kg') === 34);
  chk('Bewegung Mensch 4: gehen 8, rennen 16', JSON.stringify(R.wfrpBewegung(F)) === '{"bewegung":4,"gehen":8,"rennen":16}');

  // Grund- und fortgeschrittene Fertigkeiten (S. 117 f.)
  F = figur();
  let w = R.wfrpFertWert(F, 'athletik');
  chk('Athletik ohne Steigerung: Grundfertigkeit, prüfbar am Attribut', w.kann && w.wert === 29, w);
  w = R.wfrpFertWert(F, 'heilkunde');
  chk('Heilkunde ohne Steigerung: nicht prüfbar', !w.kann && w.wert === null, w);
  F = figur({ fert: { 'wissen:Recht': 8 } });
  w = R.wfrpFertWert(F, 'wissen:Recht');
  chk('Wissen (Recht) mit 8 Steigerungen: IN 38 + 8 = 46', w.kann && w.wert === 46, w);
  const liste = R.wfrpFertigkeitenListe(F).map(x => x.key);
  chk('die Liste zeigt Gelerntes und alle Grundfertigkeiten', liste.indexOf('wissen:Recht') >= 0 &&
    liste.indexOf('athletik') >= 0 && liste.indexOf('heilkunde') < 0);

  // Bezuege
  chk('"wissen/*" passt auf wissen:Recht', R.wfrpRefPasst('wissen/*', 'wissen:Recht'));
  chk('"schleichen/Land|Stadt" passt auf Stadt, nicht auf Unterirdisch',
    R.wfrpRefPasst('schleichen/Land|Stadt', 'schleichen:Stadt') && !R.wfrpRefPasst('schleichen/Land|Stadt', 'schleichen:Unterirdisch'));
  chk('"nahkampf/Einfach" passt nicht auf nahkampf:Fechten', !R.wfrpRefPasst('nahkampf/Einfach', 'nahkampf:Fechten'));
  chk('Bezug als Text', R.wfrpRefText('schleichen/Land|Stadt') === 'Schleichen (Land oder Stadt)' &&
    R.wfrpRefText('wissen/*') === 'Wissen (beliebig)');

  // Verfuegbar: Fertigkeiten kumulativ, Talente nur die aktuelle Stufe.
  F = figur({ stufe: 2 });
  const v = R.wfrpVerfuegbar(F);
  chk('Advokat Stufe 2: 14 Fertigkeiten (8 + 6)', v.fert.length === 14, v.fert.length);
  chk('… aber nur die 4 Talente der Stufe 2', v.tal.length === 4 && v.tal.indexOf('streitbar') >= 0 && v.tal.indexOf('schwadronieren') < 0);
  chk('… und 4 Attribute (drei aus Stufe 1, WI aus Stufe 2)', JSON.stringify(v.attr) === '["wi","i","gs","in"]', v.attr);

  // Steigern
  F = figur({ epGesamt: 100 });
  let r = R.wfrpSteigern(F, 'fert', 'wissen:Recht');
  chk('Karrierefertigkeit steigern: 10 EP', r.ok && r.kosten === 10 && F.fert['wissen:Recht'] === 1, r);
  r = R.wfrpSteigern(F, 'fert', 'klettern');
  chk('außerhalb der Karriere nur mit ausdrücklicher Zustimmung', !r.ok && r.grund === 'außerhalb der Karriere', r);
  r = R.wfrpSteigern(F, 'fert', 'klettern', { ausserhalb: true });
  chk('… und dann zum doppelten Preis (20)', r.ok && r.kosten === 20, r);
  r = R.wfrpSteigern(F, 'tal', 'krimineller');
  chk('ein Talent einer anderen Stufe ist gesperrt', !r.ok, r);
  r = R.wfrpSteigern(F, 'tal', 'lesen_schreiben');
  chk('ein Talent der Stufe kostet 100 - zu teuer bei 70 frei', !r.ok && r.grund === 'zu wenig EP' && F.tal.lesen_schreiben === undefined, r);
  F.epGesamt = 1000;
  chk('… mit genug EP geht es', R.wfrpSteigern(F, 'tal', 'lesen_schreiben').ok);
  chk('Lesen und Schreiben ist einmalig: ein zweites Mal geht nicht', !R.wfrpSteigern(F, 'tal', 'lesen_schreiben').ok);
  const vorher = F.epAusgegeben;
  R.wfrpSteigern(F, 'attr', 'gs');
  chk('ein Karriereattribut kostet 25', F.epAusgegeben - vorher === 25 && F.attrSteig.gs === 1);

  // Abschluss der Stufe
  F = figur({ attrSteig: { i: 5, gs: 5, in: 5 }, tal: { schwadronieren: 1 },
    fert: { zechen: 5, ausdauer: 5, feilschen: 5, 'sprache:Klassisch': 5, 'wissen:Recht': 5,
            'wissen:Theologie': 5, wahrnehmung: 5, recherche: 4 } });
  let ab = R.wfrpKarriereAbgeschlossen(F);
  chk('7 von 8 Fertigkeiten reichen nicht', !ab.ok && ab.fehlt.length === 1, ab);
  F.fert.recherche = 5;
  ab = R.wfrpKarriereAbgeschlossen(F);
  chk('mit 8 Fertigkeiten, 3 Attributen und einem Talent ist Stufe 1 abgeschlossen', ab.ok, ab);
  chk('Wechsel in die nächste Stufe: 100 EP', R.wfrpWechselKosten(F, 'advokat').kosten === 100);
  chk('in eine andere Klasse: 200 EP', R.wfrpWechselKosten(F, 'soldat').kosten === 200);
  F.fert.recherche = 0;
  chk('unabgeschlossen in eine andere Klasse: 300 EP', R.wfrpWechselKosten(F, 'soldat').kosten === 300);

  // Erschaffung
  chk('Spezieswurf 90: Mensch, 91: Halbling, 99: Hochelf, 100: Waldelf',
    R.wfrpSpeziesAusWurf(90) === 'mensch' && R.wfrpSpeziesAusWurf(91) === 'halbling' &&
    R.wfrpSpeziesAusWurf(99) === 'hochelf' && R.wfrpSpeziesAusWurf(100) === 'waldelf');
  chk('Karrierewurf Mensch 03: Advokat', R.wfrpKarriereAusWurf('mensch', 3) === 'advokat');
  chk('Karrierewurf Zwerg 97: Slayer', R.wfrpKarriereAusWurf('zwerg', 97) === 'slayer');
  chk('Karrierewurf Mensch 100: Kriegerpriester', R.wfrpKarriereAusWurf('mensch', 100) === 'kriegerpriester');
  const g = R.wfrpStartgeld({ stand: 'messing', standing: 3 }, () => 0.999);
  chk('Messing 3: 6W10 Pfennige (höchstens 60)', g.d === 60 && !g.s && !g.gk, g);
  chk('Gold 2: 2 Kronen', R.wfrpStartgeld({ stand: 'gold', standing: 2 }).gk === 2);
  chk('Geld als Text', R.wfrpGeldText({ gk: 1, s: 4, d: 0 }) === '1 GK 4 S' && R.wfrpGeldText({}) === '0 P');
})();

console.log((f ? 'FEHLER: ' + f : 'OK') + ' / ' + anzahl + ' Pruefungen');
process.exit(f ? 1 : 0);
