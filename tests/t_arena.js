/* ==========================================================
   DIE ARENA DES ENDKAMPFS (js/arena.js)

   Neu geschrieben am 30.10.2026, weil die Arena an diesem Tag von
   W100 auf SAVAGE WORLDS umgestellt wurde - die letzte Stelle im
   Projekt, die noch nach dem alten System rechnete.

   Geprueft wird GEGEN DIE REGEL, nicht gegen den Code. Reihenfolge
   der Quellen wie immer: Savage Worlds -> Bibel 4 -> Code.

   Die vier Prueffelder, auf die es ankommt:

   1. DER ANGRIFF ist eine normale Probe. Nahkampf gegen die PARADE
      des Ziels (4 - Parade), Fernkampf gegen die 4 mit
      Entfernungsabzug - die Parade zaehlt dort NICHT.
   2. GANG UP, und das ist die GEDREHTE Regel: Savage Worlds gibt
      dem Angreifer +1 je zusaetzlichem Angreifer AM ZIEL (max +4).
      Vorher stand hier das Gegenteil - "Bedraengnis" verschlechterte
      das Ergebnis dessen, der UMGEBEN war. Die Gegenprobe dazu ist
      die aussagekraeftigste Pruefung dieses Skripts.
   3. HP SIND WEG. Eine Figur traegt "angeschlagen" und Wunden; ein
      Statist faellt bei der ersten Wunde, eine Wild Card traegt drei.
   4. DER JAGUAR-SAEBEL gilt unveraendert weiter (Hendrik,
      18.10.2026) - nur haengt er jetzt an der Wirkung statt an HP.
      Die wichtigste Pruefung bleibt: Solange der Seelenlose nur AM
      BODEN liegt, laufen Auferstehung und Nachschub weiter. Haengte
      das an "der Boss lebt" statt an "der Boss ist gebannt", wuerde
      ein normaler Niederschlag das Gefecht beenden - und die
      Pflichtwaffe waere wirkungslos, ohne dass es auffaellt.

   LADEN: js/arena.js rechnet seit der Umstellung nicht mehr selbst,
   sondern ruft js/regelwerk.js und js/kampf.js auf. Per require()
   waere jede Datei ihr eigener Modul-Scope und arena.js saehe die
   anderen nicht - genau wie im Browser liegen hier deshalb alle drei
   in EINEM gemeinsamen Scope.
   ========================================================== */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const WURZEL = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
['js/regelwerk.js', 'js/kampf.js', 'js/arena.js', 'js/arena_scenes.js', 'js/npcs.js']
  .forEach(function (p) {
    vm.runInContext(fs.readFileSync(path.join(WURZEL, p), 'utf8'), ctx, { filename: p });
  });
vm.runInContext('this.X = {' + [
  'arenaDistanz', 'arenaAngriffsart', 'arenaGangUp', 'arenaAngriffMod', 'GANG_UP_MAX',
  'arenaSeite', 'arenaIstFeind', 'arenaWundenMax', 'arenaWundenAbzug', 'arenaWundenAnteil',
  'arenaKannAngreifen', 'arenaZustandText', 'arenaSchadensWuerfel', 'arenaSchadenWerfen',
  'arenaAngriff', 'arenaBewegungErlaubt', 'arenaBossLebt', 'arenaBossGebannt',
  'arenaRundenwechsel', 'arenaFreieRandfelder', 'arenaLogZeile',
  'angriffsMod', 'fernkampfMod', 'wirkung', 'chancen', 'parade', 'robustheit',
  'nscAlsFigur', 'NSC', 'ARENA_SCENES', 'KAMPF_REGELN', 'DLBL'
].join(',') + '};', ctx);
const A = ctx.X;

let f = 0, anzahl = 0;
const chk = (n, c, x) => {
  anzahl++;
  console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x)));
  if (!c) f++;
};

const REGELN = {
  breite: 16, hoehe: 16, bewegung: 2,
  nahkampfReichweite: 1, fernkampfReichweite: 16,
  wiederauferstehenNach: 2, nachschubAlle: 3, nachschubAnzahl: 2
};

/* Figuren mit den Feldern des NEUEN Modells. Bewusst von Hand gebaut und
   nicht aus den Vorlagen gezogen: Eine Pruefung, die ihre Eingabe aus dem
   Prueflisting holt, macht jede Aenderung einfach mit. */
function diener(id, opts) {
  return Object.assign({
    id: id, typ: 'diener', x: 5, y: 5,
    kaempfen: 2, schiessen: 0, staerke: 2, waffe: 1, fernwaffe: 0,
    parade: 5, robustheit: 5, wild: false, wundenMax: 0
  }, opts || {});
}
function boss(opts) {
  return Object.assign({
    id: 'boss', typ: 'seelenloser', x: 6, y: 5,
    kaempfen: 5, schiessen: 0, staerke: 5, waffe: 2, fernwaffe: 0,
    parade: 8, robustheit: 8, wild: true, wundenMax: 3
  }, opts || {});
}
function held(id, opts) {
  return Object.assign({
    id: id, typ: 'spieler', x: 5, y: 6,
    kaempfen: 3, schiessen: 3, staerke: 3, waffe: 2, fernwaffe: 2, reichweite: 5,
    parade: 6, robustheit: 6, wild: true, wundenMax: 3, geladen: true
  }, opts || {});
}

/* ==========================================================
   1. DER ANGRIFFSWURF - eine normale Probe (Bibel 4.1)
   ========================================================== */
(function probe() {
  // Nahkampf: der Zielwert ist die Parade, als Modifikator auf die 4.
  chk('gegen Parade 4 ist der Angriff unmodifiziert', A.angriffsMod(4) === 0, A.angriffsMod(4));
  chk('gegen Parade 6 kostet der Angriff -2', A.angriffsMod(6) === -2, A.angriffsMod(6));
  chk('gegen Parade 8 kostet der Angriff -4', A.angriffsMod(8) === -4, A.angriffsMod(8));
  chk('gegen Parade 2 gibt es +2', A.angriffsMod(2) === 2, A.angriffsMod(2));

  const h = held('h1', { x: 5, y: 5 });
  const b = boss({ x: 6, y: 5 });
  const tokens = { h1: h, boss: b };
  chk('Nahkampf gegen den Seelenlosen: -4 aus seiner Parade 8',
    A.arenaAngriffMod(h, b, 'nah', tokens, REGELN) === -4,
    A.arenaAngriffMod(h, b, 'nah', tokens, REGELN));

  /* DIE PARADE IST EINE NAHKAMPFGROESSE. Geschossen wird gegen die 4,
     modifiziert allein durch die Entfernung - sonst waere ein Ziel mit
     Parade 8 auch fuer einen Schuetzen schwer zu treffen, und das ist
     nicht die Regel. */
  const fern = held('h2', { x: 0, y: 5 });
  const bFern = boss({ x: 5, y: 5 });
  chk('Fernkampf nimmt die Parade NICHT (Reichweite genau erreicht: mod 0)',
    A.arenaAngriffMod(fern, bFern, 'fern', { h2: fern, boss: bFern }, REGELN) === 0,
    A.arenaAngriffMod(fern, bFern, 'fern', { h2: fern, boss: bFern }, REGELN));

  // Entfernungsbaender aus der Waffenreichweite (js/kampf.js).
  chk('Reichweite erreicht: kein Abzug', A.fernkampfMod(5, 5) === 0, A.fernkampfMod(5, 5));
  chk('doppelte Reichweite: -2', A.fernkampfMod(5, 10) === -2, A.fernkampfMod(5, 10));
  chk('vierfache Reichweite: -4', A.fernkampfMod(5, 20) === -4, A.fernkampfMod(5, 20));
  chk('jenseits der vierfachen Reichweite: kein Schuss',
    A.fernkampfMod(5, 21) === null, A.fernkampfMod(5, 21));

  // Wunden ziehen flach ab (Bibel 4.4), gedeckelt.
  chk('eine Wunde zieht 1 ab', A.arenaWundenAbzug(held('x', { wunden: 1 })) === 1);
  chk('zwei Wunden ziehen 2 ab', A.arenaWundenAbzug(held('x', { wunden: 2 })) === 2);
  chk('der Wundenabzug ist bei 3 gedeckelt',
    A.arenaWundenAbzug(held('x', { wunden: 9 })) === 3,
    A.arenaWundenAbzug(held('x', { wunden: 9 })));
  /* Wunden kommen zum Paradeabzug hinzu. Gegen einen Diener (Parade 5) ist
     das 4-5 = -1, mit zwei Wunden also -3. (Meine erste Erwartung hier war
     -4 und schlicht falsch gerechnet - der Code hatte recht.) */
  const verwundet = held('h3', { x: 5, y: 5, wunden: 2 });
  const d5 = diener('d', { x: 6, y: 5 });
  chk('zwei Wunden kommen zum Paradeabzug hinzu (-1 -2 = -3)',
    A.arenaAngriffMod(verwundet, d5, 'nah', { h3: verwundet }, REGELN)
      === A.angriffsMod(d5.parade) - 2,
    A.arenaAngriffMod(verwundet, d5, 'nah', { h3: verwundet }, REGELN));
})();

/* ==========================================================
   2. GANG UP - und die Gegenprobe zur abgeloesten Hausregel
   ========================================================== */
(function gangUp() {
  const z = diener('ziel', { x: 8, y: 8 });
  const a1 = held('a1', { x: 7, y: 8 });

  chk('allein gibt es kein Gang Up',
    A.arenaGangUp(a1, z, { a1: a1, ziel: z }, REGELN) === 0,
    A.arenaGangUp(a1, z, { a1: a1, ziel: z }, REGELN));

  const a2 = held('a2', { x: 9, y: 8 });
  chk('ein zweiter Angreifer am Ziel gibt +1',
    A.arenaGangUp(a1, z, { a1: a1, a2: a2, ziel: z }, REGELN) === 1,
    A.arenaGangUp(a1, z, { a1: a1, a2: a2, ziel: z }, REGELN));

  // Sechs Angreifer rundherum - der Bonus ist bei +4 gedeckelt.
  const viele = { ziel: z, a1: a1 };
  [[7, 7], [8, 7], [9, 7], [7, 9], [8, 9], [9, 9]].forEach(function (p, i) {
    viele['m' + i] = held('m' + i, { x: p[0], y: p[1] });
  });
  chk('Gang Up ist bei +4 gedeckelt',
    A.arenaGangUp(a1, z, viele, REGELN) === A.GANG_UP_MAX,
    A.arenaGangUp(a1, z, viele, REGELN));

  // Ein Verbuendeter des Ziels, der beim Ziel steht, hebt einen Punkt auf.
  const schild = diener('schild', { x: 8, y: 7 });
  chk('ein Verbuendeter des Ziels hebt einen Punkt Gang Up auf',
    A.arenaGangUp(a1, z, { a1: a1, a2: a2, ziel: z, schild: schild }, REGELN) === 0,
    A.arenaGangUp(a1, z, { a1: a1, a2: a2, ziel: z, schild: schild }, REGELN));

  // Ein Toter hilft niemandem.
  const toter = held('tot1', { x: 9, y: 8, tot: true });
  chk('eine gefallene Figur zaehlt nicht fuer Gang Up',
    A.arenaGangUp(a1, z, { a1: a1, tot1: toter, ziel: z }, REGELN) === 0,
    A.arenaGangUp(a1, z, { a1: a1, tot1: toter, ziel: z }, REGELN));

  /* DIE GEGENPROBE ZUR ALTEN REGEL, und sie ist der Beleg, dass die
     Richtung wirklich gedreht ist: Zwei Gegner, die am ANGREIFER stehen,
     aber nicht am Ziel. Unter "Bedraengnis" hatten sie sein Ergebnis um
     zwei Baender VERSCHLECHTERT. Savage Worlds kennt dafuer gar nichts -
     gezaehlt wird um das ZIEL. */
  const weitDrueben = diener('fern_ziel', { x: 1, y: 1 });
  const bedraenger1 = diener('b1', { x: 7, y: 8 });
  const bedraenger2 = diener('b2', { x: 7, y: 7 });
  const umgeben = held('u', { x: 8, y: 8 });
  const nahziel = diener('nah_ziel', { x: 9, y: 8 });
  const szene = { u: umgeben, b1: bedraenger1, b2: bedraenger2, nah_ziel: nahziel };
  chk('Gegner am ANGREIFER verschlechtern seinen Angriff nicht mehr',
    A.arenaGangUp(umgeben, nahziel, szene, REGELN) === 0,
    A.arenaGangUp(umgeben, nahziel, szene, REGELN));
  chk('und sie tauchen auch im Angriffsmodifikator nicht auf (nur 4-Parade)',
    A.arenaAngriffMod(umgeben, nahziel, 'nah', szene, REGELN) === A.angriffsMod(nahziel.parade),
    A.arenaAngriffMod(umgeben, nahziel, 'nah', szene, REGELN));
  chk('weit entfernte Figuren wurden ohnehin nie mitgezaehlt',
    A.arenaGangUp(umgeben, weitDrueben, szene, REGELN) === 0);

  // Gang Up gilt nur im Nahkampf.
  const schuetze = held('s', { x: 2, y: 8, reichweite: 5 });
  const mitSchuetze = Object.assign({}, { s: schuetze, a1: a1, a2: a2, ziel: z });
  chk('im Fernkampf gibt es kein Gang Up',
    A.arenaAngriffMod(schuetze, z, 'fern', mitSchuetze, REGELN) === A.fernkampfMod(5, 6),
    A.arenaAngriffMod(schuetze, z, 'fern', mitSchuetze, REGELN));
})();

/* ==========================================================
   3. DIE WIRKUNG - angeschlagen und Wunden statt HP
   ========================================================== */
(function wirkungen() {
  const w = (s, r, z) => A.wirkung(s, r, z);
  chk('Schaden unter der Robustheit wirkt nicht',
    w(4, 5, {}).text === 'keine Wirkung' && !w(4, 5, {}).angeschlagen, w(4, 5, {}));
  chk('Schaden gleich der Robustheit macht angeschlagen',
    w(5, 5, {}).angeschlagen && w(5, 5, {}).neueWunden === 0, w(5, 5, {}));
  chk('vier ueber der Robustheit ist eine Wunde',
    w(9, 5, {}).neueWunden === 1, w(9, 5, {}));
  chk('acht ueber der Robustheit sind zwei Wunden',
    w(13, 5, {}).neueWunden === 2, w(13, 5, {}));
  chk('wer schon angeschlagen ist, nimmt eine Wunde statt des zweiten Hakens',
    w(5, 5, { angeschlagen: true }).neueWunden === 1, w(5, 5, { angeschlagen: true }));

  // Statist gegen Wild Card.
  chk('ein Statist faellt bei der ersten Wunde',
    w(9, 5, { extra: true, wundenMax: 0 }).ausserGefecht,
    w(9, 5, { extra: true, wundenMax: 0 }));
  chk('eine Wild Card traegt drei Wunden',
    !w(9, 5, { wunden: 2, wundenMax: 3 }).ausserGefecht,
    w(9, 5, { wunden: 2, wundenMax: 3 }));
  chk('die vierte Wunde nimmt eine Wild Card heraus',
    w(9, 5, { wunden: 3, wundenMax: 3 }).ausserGefecht,
    w(9, 5, { wunden: 3, wundenMax: 3 }));
  chk('wundenMax am Token ueberschreibt die Regel',
    !w(9, 5, { wunden: 3, wundenMax: 5 }).ausserGefecht,
    w(9, 5, { wunden: 3, wundenMax: 5 }));

  // Tragfaehigkeit aus dem Token ableiten.
  chk('ein Diener traegt keine Wunde', A.arenaWundenMax(diener('d')) === 0);
  chk('eine Wild Card ohne eigene Angabe traegt die Regelzahl',
    A.arenaWundenMax({ wild: true }) === A.KAMPF_REGELN.wundenWildCard,
    A.arenaWundenMax({ wild: true }));
  chk('ein Statist ohne eigene Angabe traegt die Regelzahl',
    A.arenaWundenMax({ wild: false }) === A.KAMPF_REGELN.wundenStatist);

  // Die Leiste am Token: ein Statist hat nichts zu fuellen.
  chk('ein Statist hat keine Wundenleiste', A.arenaWundenAnteil(diener('d')) === null);
  chk('eine unversehrte Wild Card hat eine volle Leiste',
    A.arenaWundenAnteil(held('h')) === 1);
  chk('nach zwei von drei Wunden ist die Leiste zu einem Drittel voll',
    Math.abs(A.arenaWundenAnteil(held('h', { wunden: 2 })) - 1 / 3) < 1e-9,
    A.arenaWundenAnteil(held('h', { wunden: 2 })));

  // Zustandstext fuer die Anzeige.
  chk('unversehrt steht als solches da', A.arenaZustandText(held('h')) === 'unversehrt');
  chk('eine Wunde wird mit Tragfaehigkeit genannt',
    A.arenaZustandText(held('h', { wunden: 1 })) === '1 Wunde von 3',
    A.arenaZustandText(held('h', { wunden: 1 })));
  chk('am Boden und endgueltig tot sind zu unterscheiden',
    A.arenaZustandText(diener('d', { tot: true })) === 'am Boden'
    && A.arenaZustandText(diener('d', { tot: true, endgueltig: true })) === 'endgültig tot');
})();

/* ==========================================================
   4. DER JAGUAR-SAEBEL (Hendrik, 18.10.2026)
   ========================================================== */
(function saebel() {
  const h = held('h1', { x: 5, y: 5 });
  const d = diener('d1', { x: 6, y: 5 });
  const tokens = { h1: h, d1: d };

  /* Jeder TREFFER toetet einen Diener - gezaehlt wird der Treffer, nicht
     die Wirkung. Schaden 1 waere gegen Robustheit 5 wirkungslos. */
  const mit = A.arenaAngriff(h, d, tokens, REGELN, 'h1',
    { probeBand: 'erfolg', schaden: 1 });
  chk('mit Saebel toetet jeder Treffer einen Diener, auch ohne Wirkung',
    mit.toetet === true, mit);
  chk('und er faellt ENDGUELTIG', mit.endgueltig === true, mit.endgueltig);

  const miss = A.arenaAngriff(h, d, tokens, REGELN, 'h1',
    { probeBand: 'miss' });
  chk('ein Misserfolg toetet auch mit Saebel nicht',
    miss.toetet === false && miss.endgueltig === false, miss);
  chk('ein Patzer ebenso nicht',
    A.arenaAngriff(h, d, tokens, REGELN, 'h1', { probeBand: 'patzer' }).toetet === false);

  const ohne = A.arenaAngriff(h, d, tokens, REGELN, null,
    { probeBand: 'erfolg', schaden: 1 });
  chk('ohne Saebel wirkt Schaden 1 gegen Robustheit 5 gar nicht',
    ohne.toetet === false && !ohne.wirkung.angeschlagen, ohne.wirkung);
  const ohneHart = A.arenaAngriff(h, d, tokens, REGELN, null,
    { probeBand: 'erfolg', schaden: 9 });
  chk('ohne Saebel faellt ein Diener bei echter Wunde - aber NICHT endgueltig',
    ohneHart.toetet === true && ohneHart.endgueltig === false, ohneHart);

  /* Gegen den Seelenlosen zaehlt der Schaden ganz normal: Der Saebel ist
     die Bedingung, nicht die Abkuerzung. Eine Beruehrung legt ihn nicht
     nieder - sonst waere das Finale mit einem Treffer vorbei. */
  const b = boss({ x: 6, y: 5 });
  const bt = { h1: h, boss: b };
  const leicht = A.arenaAngriff(h, b, bt, REGELN, 'h1', { probeBand: 'erfolg', schaden: 8 });
  chk('der Saebel legt den Seelenlosen nicht mit einer Beruehrung nieder',
    leicht.toetet === false, leicht);
  chk('ein Treffer auf seiner Robustheit macht ihn aber angeschlagen',
    leicht.wirkung.angeschlagen === true, leicht.wirkung);

  const schwerVerwundet = boss({ x: 6, y: 5, wunden: 3 });
  const tot = A.arenaAngriff(h, schwerVerwundet, { h1: h, boss: schwerVerwundet },
    REGELN, 'h1', { probeBand: 'erfolg', schaden: 12 });
  chk('mit Saebel und genug Schaden faellt der Seelenlose endgueltig',
    tot.toetet === true && tot.endgueltig === true, tot);
  const totOhne = A.arenaAngriff(h, schwerVerwundet, { h1: h, boss: schwerVerwundet },
    REGELN, null, { probeBand: 'erfolg', schaden: 12 });
  chk('ohne Saebel geht er nur zu Boden, nicht endgueltig',
    totOhne.toetet === true && totOhne.endgueltig === false, totOhne);

  // Ein anderer Traeger hilft nicht.
  const fremd = A.arenaAngriff(h, d, tokens, REGELN, 'jemand_anderes',
    { probeBand: 'erfolg', schaden: 1 });
  chk('nur der TRAEGER hat die Wirkung', fremd.toetet === false, fremd);

  // Das Log verraet den Saebel nicht.
  const zeile = A.arenaLogZeile(h, d, mit);
  chk('das Kampflog nennt den Saebel nirgends',
    !/[Ss]äbel|[Ss]aebel|[Jj]aguar/.test(zeile), zeile);
  chk('das Log nennt dafuer Treffer und Folge',
    zeile.indexOf('h1') < 0 && /greift/.test(zeile), zeile);
})();

/* ==========================================================
   5. ANGESCHLAGEN kostet die Handlung, nicht den Wuerfel
   ========================================================== */
(function angeschlagen() {
  const h = held('h1', { x: 5, y: 5, angeschlagen: true });
  const d = diener('d1', { x: 6, y: 5 });
  const erg = A.arenaAngriff(h, d, { h1: h, d1: d }, REGELN, null, { probeBand: 'erfolg' });
  chk('wer angeschlagen ist, greift nicht an',
    erg.ok === false && erg.grund === 'angeschlagen', erg);
  chk('bewegen darf er trotzdem',
    A.arenaBewegungErlaubt(h, { x: 6, y: 6 }, REGELN, { h1: h }).ok === true);
  chk('arenaKannAngreifen sagt dasselbe',
    A.arenaKannAngreifen(h) === false && A.arenaKannAngreifen(held('h2')) === true);

  // Der Rundenwechsel raeumt den Haken ab (bewusste Abweichung: Savage
  // Worlds wuerfelt dafuer Willenskraft, siehe Kopf von js/arena.js).
  const erg2 = A.arenaRundenwechsel({ h1: h }, REGELN, 3);
  chk('der Rundenwechsel schuettelt "angeschlagen" ab',
    erg2.aenderungen['tokens/h1/angeschlagen'] === null, erg2.aenderungen);
  chk('und nennt, wer sich erholt hat', erg2.erholt.indexOf('h1') >= 0, erg2.erholt);
  chk('eine gefallene Figur erholt sich nicht',
    A.arenaRundenwechsel({ d1: diener('d1', { tot: true, angeschlagen: true }) },
      REGELN, 3).erholt.length === 0);
})();

/* ==========================================================
   6. ANGRIFFSART, REICHWEITE, NACHLADEN
   ========================================================== */
(function reichweite() {
  const h = held('h1', { x: 5, y: 5 });
  chk('Distanz 1 schraeg ist Nahkampf',
    A.arenaAngriffsart(h, diener('d', { x: 6, y: 6 }), REGELN) === 'nah');
  chk('Distanz 5 mit Pistole ist Fernkampf',
    A.arenaAngriffsart(h, diener('d', { x: 10, y: 5 }), REGELN) === 'fern');

  /* Fehler Nr. 6 der Fehlergeschichte bleibt behoben: Ohne Schusswaffe
     wird nicht geschossen. Dass "Schiessen" ungelernt waere, hindert
     dagegen NIEMANDEN - eine ungelernte Probe ist gueltig (d4-2). Nur die
     fehlende WAFFE verbietet den Schuss. */
  chk('ohne Schusswaffe kein Schuss auf Distanz',
    A.arenaAngriffsart(boss({ x: 5, y: 5 }), held('z', { x: 10, y: 5 }), REGELN) === null);
  const ungelernt = held('u', { x: 5, y: 5, schiessen: 0, fernwaffe: 2, reichweite: 5 });
  chk('ungelernt im Schiessen hindert den Schuss nicht',
    A.arenaAngriffsart(ungelernt, diener('d', { x: 10, y: 5 }), REGELN) === 'fern');

  /* Die Waffe setzt die Grenze, nicht das Brett - und arenaAngriffsart
     muss dasselbe sagen wie der Angriff, sonst zeigt die Oberflaeche einen
     Schuss an, der beim Klick abgelehnt wird. */
  const wurfmesser = held('w', { x: 0, y: 0, fernwaffe: 1, reichweite: 3 });
  const weit = diener('d', { x: 13, y: 0 });
  chk('jenseits der vierfachen Waffenreichweite sagt die Angriffsart null',
    A.arenaAngriffsart(wurfmesser, weit, REGELN) === null,
    A.arenaAngriffsart(wurfmesser, weit, REGELN));
  chk('und der Angriff lehnt mit demselben Grund ab',
    A.arenaAngriff(wurfmesser, weit, { w: wurfmesser, d: weit }, REGELN, null,
      { probeBand: 'erfolg' }).grund === 'ausser_reichweite');
  chk('innerhalb der vierfachen Reichweite geht es',
    A.arenaAngriffsart(wurfmesser, diener('d', { x: 12, y: 0 }), REGELN) === 'fern');

  // Nachladen: ein Schuss, dann leer (Bibel 4.5).
  const leer = held('l', { x: 5, y: 5, geladen: false });
  chk('ohne geladene Waffe kein Schuss',
    A.arenaAngriff(leer, diener('d', { x: 10, y: 5 }), { l: leer }, REGELN, null,
      { probeBand: 'erfolg' }).grund === 'nicht_geladen');
  const geschossen = A.arenaAngriff(h, diener('d', { x: 10, y: 5 }),
    { h1: h }, REGELN, null, { probeBand: 'erfolg', schaden: 3 });
  chk('ein Schuss leert die Waffe', geschossen.entlaedt === true);
  chk('ein Nahkampfschlag nicht',
    A.arenaAngriff(h, diener('d', { x: 6, y: 5 }), { h1: h }, REGELN, null,
      { probeBand: 'erfolg', schaden: 3 }).entlaedt === false);
  const nachladen = A.arenaRundenwechsel(
    { l: held('l', { geladen: false, entladenSeitRunde: 3 }) }, REGELN, 3);
  chk('nachgeladen wird erst die Runde DARAUF',
    nachladen.aenderungen['tokens/l/geladen'] === true, nachladen.aenderungen);
  const zuFrueh = A.arenaRundenwechsel(
    { l: held('l', { geladen: false, entladenSeitRunde: 4 }) }, REGELN, 3);
  chk('in derselben Runde nicht',
    zuFrueh.aenderungen['tokens/l/geladen'] === undefined, zuFrueh.aenderungen);

  // Eine liegende Figur ist kein Ziel.
  chk('ein am Boden liegender Diener ist kein Ziel',
    A.arenaAngriff(h, diener('d', { x: 6, y: 5, tot: true }), { h1: h }, REGELN, null,
      { probeBand: 'erfolg' }).grund === 'ziel_liegt');
})();

/* ==========================================================
   7. SCHADENSWUERFEL - die Regel kommt aus js/kampf.js
   ========================================================== */
(function schaden() {
  const h = held('h1');
  const nah = A.arenaSchadensWuerfel(h, 'nah', false);
  chk('Nahkampfschaden ist Waffe + Staerke', nah.length === 2, nah);
  chk('die Waffe steht vorn, die Staerke dahinter',
    nah[0].was === 'Waffe' && nah[1].was === 'Stärke', nah.map(x => x.was));
  const mitSteig = A.arenaSchadensWuerfel(h, 'nah', true);
  chk('eine Steigerung gibt einen dritten Wuerfel (+1W6)',
    mitSteig.length === 3 && mitSteig[2].stufe === 2, mitSteig);
  const fern = A.arenaSchadensWuerfel(h, 'fern', false);
  chk('im Fernkampf zaehlt die Staerke NICHT mit',
    fern.length === 1 && fern[0].was === 'Schusswaffe', fern);

  // Vorgegebener Schaden fuer deterministische Pruefungen.
  chk('eine Schadensvorgabe ersetzt das Werfen',
    A.arenaSchadenWerfen(nah, 11).summe === 11);
  // Echt geworfen: die Summe liegt im moeglichen Bereich (d6 + d8, explodierend).
  let min = 99, max = 0;
  for (let i = 0; i < 400; i++) {
    const s = A.arenaSchadenWerfen(nah).summe;
    if (s < min) min = s;
    if (s > max) max = s;
  }
  chk('ein echter Schadenswurf liegt nie unter 2 (je Wuerfel mindestens 1)',
    min >= 2, min);
  chk('und er kann explodieren (ueber 14 kommt nur mit Ass zustande)',
    max > 14, max);
})();

/* ==========================================================
   8. RUNDENWECHSEL, Auferstehung, Nachschub
   ========================================================== */
(function runden() {
  const state = {
    boss: boss(),
    d1: diener('d1', { tot: true, totSeitRunde: 1, wunden: 1, angeschlagen: true }),
    h1: held('h1', { hatGezogen: true, hatAngegriffen: true })
  };
  const erg = A.arenaRundenwechsel(state, REGELN, 2);
  chk('die Runde zaehlt weiter', erg.runde === 3);
  chk('die Freigabe wird zurueckgenommen', erg.aenderungen.freigegeben === null);
  chk('Zuege werden zurueckgesetzt',
    erg.aenderungen['tokens/h1/hatGezogen'] === null
    && erg.aenderungen['tokens/h1/hatAngegriffen'] === null);
  chk('ein normal gefallener Diener steht wieder auf',
    erg.auferstanden.indexOf('d1') >= 0, erg.auferstanden);
  chk('und zwar UNVERSEHRT - Wunden und Haken fallen weg',
    erg.aenderungen['tokens/d1/wunden'] === null
    && erg.aenderungen['tokens/d1/angeschlagen'] === null, erg.aenderungen);
  chk('HP werden dabei nicht mehr angefasst (es gibt keine)',
    erg.aenderungen['tokens/d1/hp'] === undefined, erg.aenderungen);
  chk('solange der Boss nicht gebannt ist, kommt Nachschub',
    erg.nachschub === REGELN.nachschubAnzahl, erg.nachschub);

  /* DER KERN: Liegt der Seelenlose nur AM BODEN, laeuft alles weiter -
     er richtet sich selbst wieder auf. */
  const amBoden = {
    boss: boss({ tot: true, totSeitRunde: 1 }),
    d1: diener('d1', { tot: true, totSeitRunde: 1 })
  };
  const ergBoden = A.arenaRundenwechsel(amBoden, REGELN, 2);
  chk('ein nur niedergeschlagener Boss zaehlt NICHT als gebannt',
    ergBoden.bossGebannt === false && ergBoden.bossLebt === false, ergBoden);
  chk('er richtet sich selbst wieder auf',
    ergBoden.auferstanden.indexOf('boss') >= 0, ergBoden.auferstanden);
  chk('und der Nachschub laeuft weiter',
    ergBoden.nachschub === REGELN.nachschubAnzahl, ergBoden.nachschub);

  const gebannt = {
    boss: boss({ tot: true, endgueltig: true, totSeitRunde: 1 }),
    d1: diener('d1', { tot: true, totSeitRunde: 1 })
  };
  const ergG = A.arenaRundenwechsel(gebannt, REGELN, 2);
  chk('gebannt: kein Nachschub', ergG.nachschub === 0, ergG.nachschub);
  chk('gebannt: niemand steht mehr auf', ergG.auferstanden.length === 0, ergG.auferstanden);

  const saebelTot = {
    boss: boss(),
    d1: diener('d1', { tot: true, endgueltig: true, totSeitRunde: 1 })
  };
  chk('ein vom Saebel gefallener Diener steht nie wieder auf',
    A.arenaRundenwechsel(saebelTot, REGELN, 2).auferstanden.length === 0);

  const frisch = { boss: boss(), d1: diener('d1', { tot: true, totSeitRunde: 2 }) };
  chk('eine Runde zu frueh steht niemand auf',
    A.arenaRundenwechsel(frisch, REGELN, 2).auferstanden.length === 0);

  // Ohne Boss-Token gilt "gebannt" - sonst stuenden Diener endlos auf.
  chk('ohne Seelenlosen im Feld gilt gebannt',
    A.arenaBossGebannt({ d1: diener('d1') }) === true);
})();

/* ==========================================================
   9. BEWEGUNG UND SEITEN (unveraendert, aber weiter gueltig)
   ========================================================== */
(function brett() {
  const h = held('h1', { x: 5, y: 5 });
  chk('zwei Felder sind erlaubt',
    A.arenaBewegungErlaubt(h, { x: 7, y: 5 }, REGELN, { h1: h }).ok === true);
  chk('drei Felder nicht',
    A.arenaBewegungErlaubt(h, { x: 8, y: 5 }, REGELN, { h1: h }).grund === 'zu_weit');
  chk('nicht vom Brett',
    A.arenaBewegungErlaubt(h, { x: -1, y: 5 }, REGELN, { h1: h }).grund === 'ausserhalb');
  chk('nicht auf ein besetztes Feld',
    A.arenaBewegungErlaubt(h, { x: 6, y: 5 }, REGELN,
      { h1: h, d1: diener('d1', { x: 6, y: 5 }) }).grund === 'besetzt');
  chk('wer gezogen hat, zieht nicht nochmal',
    A.arenaBewegungErlaubt(held('h2', { hatGezogen: true }), { x: 6, y: 6 }, REGELN,
      {}).grund === 'schon_gezogen');
  chk('Verbuendete stehen auf der Helden-Seite',
    A.arenaSeite({ typ: 'verbuendeter' }) === 'helden');
  chk('der Seelenlose auf der Gegner-Seite',
    A.arenaSeite({ typ: 'seelenloser' }) === 'gegner');
  chk('auf die eigene Seite wird nicht eingeschlagen',
    A.arenaIstFeind({ typ: 'spieler' }, { typ: 'verbuendeter' }) === false);
})();

/* ==========================================================
   10. DIE VORLAGEN SIND GEMESSEN, NICHT GEGRIFFEN
   ----------------------------------------------------------
   Vorher trug js/arena_scenes.js eigene W100-Kampfwerte, und
   dasselbe Crewmitglied hatte im Endkampf andere Werte als in
   besatzung.html. Seit der Umstellung kommen sie aus den
   Blaettern - das wird hier nachgerechnet statt behauptet.
   ========================================================== */
(function vorlagen() {
  const V = A.ARENA_SCENES['15.1'].vorlagen;
  const sl = A.nscAlsFigur(A.NSC.seelenloser);
  chk('der Seelenlose traegt die Parade aus seinem Blatt',
    V.seelenloser.parade === A.parade(sl), [V.seelenloser.parade, A.parade(sl)]);
  chk('und die Robustheit aus seinem Blatt',
    V.seelenloser.robustheit === A.robustheit(sl), [V.seelenloser.robustheit, A.robustheit(sl)]);
  chk('und seinen Kaempfen-Wert (d12, der einzige der Kampagne)',
    V.seelenloser.kaempfen === A.NSC.seelenloser.fert['Kämpfen']
    && A.DLBL[V.seelenloser.kaempfen] === 'd12', V.seelenloser.kaempfen);

  const cor = A.nscAlsFigur(A.NSC.cormac);
  chk('der Verbuendete traegt Cormacs Parade',
    V.verbuendeter.parade === A.parade(cor), [V.verbuendeter.parade, A.parade(cor)]);
  chk('und Cormacs Robustheit',
    V.verbuendeter.robustheit === A.robustheit(cor));
  const har = A.nscAlsFigur(A.NSC.harwick);
  chk('die Spielervorlage nimmt Harwick als Massstab',
    V.spieler.parade === A.parade(har) && V.spieler.robustheit === A.robustheit(har),
    [V.spieler.parade, V.spieler.robustheit]);

  chk('Cormac kaempft besser als sein Kapitaen - das ist Kanon und steht noch',
    V.verbuendeter.kaempfen > V.spieler.kaempfen,
    [V.verbuendeter.kaempfen, V.spieler.kaempfen]);
  chk('der Seelenlose kaempft besser als alle',
    V.seelenloser.kaempfen > V.verbuendeter.kaempfen);

  // Keine Vorlage traegt noch ein Feld des alten Systems.
  const alt = ['nahWert', 'fernWert', 'nahSchaden', 'fernSchaden', 'hpMax', 'hp', 'mastery'];
  Object.keys(V).forEach(function (k) {
    alt.forEach(function (feld) {
      chk('Vorlage "' + k + '" traegt kein "' + feld + '" mehr',
        V[k][feld] === undefined, Object.keys(V[k]));
    });
  });
  // ... und jede traegt, was das neue Modell braucht.
  ['kaempfen', 'staerke', 'parade', 'robustheit'].forEach(function (feld) {
    Object.keys(V).forEach(function (k) {
      chk('Vorlage "' + k + '" traegt "' + feld + '"', V[k][feld] != null, V[k]);
    });
  });
  chk('nur der Diener ist ein Statist',
    V.diener.wild === false && V.spieler.wild && V.verbuendeter.wild && V.seelenloser.wild);
})();

/* ==========================================================
   11. DAS ALTE SYSTEM IST WIRKLICH WEG
   ========================================================== */
(function altWeg() {
  ['arenaSchwellen', 'arenaBand', 'arenaVerschiebe', 'arenaSchaden', 'arenaBedraengnis',
   'ARENA_BAENDER'].forEach(function (n) {
    chk('"' + n + '" (W100) gibt es nicht mehr', ctx[n] === undefined, n);
  });
  const quelle = fs.readFileSync(path.join(WURZEL, 'js', 'arena.js'), 'utf8');
  chk('js/arena.js rechnet nirgends mehr "Wert x 10"',
    quelle.indexOf('wert * 10') < 0 && quelle.indexOf('wert*10') < 0);
  /* "mastery" darf im KOMMENTAR weiter vorkommen - dort steht, wohin das
     alte Feld gewandert ist (naemlich nach "wild"), und genau das soll der
     naechste Leser finden. Verboten ist die VERWENDUNG. Die Pruefung wurde
     deshalb geschaerft statt gelockert: Eine, die nur das Wort zaehlt,
     meldet meinen eigenen Kommentar als Fehler und laesst beim naechsten
     Mal eine echte Verwendung durch (Lehre vom 23.10.). */
  chk('js/arena.js VERWENDET "mastery" nirgends mehr',
    !/\.mastery\b|mastery\s*:|mastery\s*=/.test(quelle),
    (quelle.match(/.{0,40}mastery.{0,40}/g) || []));
})();

/* ==========================================================
   12. WAS DIE ZAHLEN BEDEUTEN
   ----------------------------------------------------------
   Keine Geschmacksfrage, sondern eine Folge der Regel: Parade 8
   kostet -4, und genau +4 holt Gang Up zurueck. Wenn das nicht
   stimmt, ist der Seelenlose entweder unangreifbar oder die
   Gruppentaktik wertlos.
   ========================================================== */
(function aussichten() {
  const allein = A.chancen(3, { mod: -4, wild: true });     // d8, gegen Parade 8
  const zusammen = A.chancen(3, { mod: 0, wild: true });    // dasselbe mit +4 Gang Up
  chk('allein trifft ein Spieler den Seelenlosen selten (unter 35 %)',
    allein.gelingt < 0.35, Math.round(allein.gelingt * 1000) / 10);
  chk('zu fuenft um ihn herum trifft er meistens (ueber 70 %)',
    zusammen.gelingt > 0.70, Math.round(zusammen.gelingt * 1000) / 10);
  chk('Gang Up verdoppelt die Trefferchance mindestens',
    zusammen.gelingt >= 2 * allein.gelingt,
    [Math.round(allein.gelingt * 1000) / 10, Math.round(zusammen.gelingt * 1000) / 10]);
  console.log('     (gemessen: allein ' + Math.round(allein.gelingt * 1000) / 10
    + ' %, mit vollem Gang Up ' + Math.round(zusammen.gelingt * 1000) / 10 + ' %)');
})();

/* ==========================================================
   13. DER ECHTE WURFPFAD
   ----------------------------------------------------------
   Alle Pruefungen oben geben das Band per "vorgabe" vor, damit sich jede
   Regelverzweigung einzeln festnageln laesst. Damit laeuft aber der PFAD DURCH
   wurf() nie - und genau der laeuft am Tisch. Hier einmal hundert echte
   Angriffe, Nah und Fern, mit allen Beteiligten.
   ========================================================== */
(function echt() {
  const h = held('h1', { x: 5, y: 5 });
  const d = diener('d1', { x: 6, y: 5 });
  const b = boss({ x: 6, y: 6 });
  const tokens = { h1: h, d1: d, boss: b };
  const baender = {};
  let fehler = null, logs = 0;
  for (let i = 0; i < 100 && !fehler; i++) {
    try {
      ['nah', 'fern'].forEach(function (welche) {
        const ziel = welche === 'nah' ? d : diener('weit', { x: 9, y: 5 });
        const alle = welche === 'nah' ? tokens : { h1: h, weit: ziel };
        const erg = A.arenaAngriff(h, ziel, alle, REGELN, i % 3 === 0 ? 'h1' : null);
        if (!erg.ok) throw new Error('abgelehnt: ' + erg.grund + ' (' + welche + ')');
        baender[erg.band] = (baender[erg.band] || 0) + 1;
        if (erg.trifft && !(erg.schaden > 0)) throw new Error('Treffer ohne Schadenswurf');
        if (!erg.trifft && erg.schaden !== 0) throw new Error('Misserfolg mit Schaden');
        const zeile = A.arenaLogZeile(h, ziel, erg);
        if (!zeile || /undefined|NaN/.test(zeile)) throw new Error('Logzeile: ' + zeile);
        if (/[Ss]äbel|[Jj]aguar/.test(zeile)) throw new Error('Logzeile verraet den Saebel');
        logs++;
      });
      // Und einmal gegen den Boss, mit seiner Parade 8.
      const gegenBoss = A.arenaAngriff(h, b, tokens, REGELN, null);
      if (!gegenBoss.ok) throw new Error('Boss abgelehnt: ' + gegenBoss.grund);
      if (gegenBoss.mod !== A.angriffsMod(8) + A.arenaGangUp(h, b, tokens, REGELN)) {
        throw new Error('Mod gegen den Boss: ' + gegenBoss.mod);
      }
    } catch (e) { fehler = e.message; }
  }
  chk('hundert echte Angriffe laufen ohne Ausnahme durch', fehler === null, fehler);
  chk('und erzeugen 200 brauchbare Logzeilen', logs === 200, logs);
  chk('dabei kommen Treffer UND Misserfolge vor - sonst prueft das hier zu wenig',
    (baender.erfolg || 0) + (baender.steigerung || 0) > 0 && (baender.miss || 0) > 0,
    baender);
  Object.keys(baender).forEach(function (bn) {
    chk('"' + bn + '" ist ein gueltiges Band des neuen Systems',
      ['steigerung', 'erfolg', 'miss', 'patzer'].indexOf(bn) >= 0, bn);
  });
})();

console.log((f ? 'FEHLER: ' + f : 'OK') + ' / ' + anzahl + ' Pruefungen');
process.exit(f ? 1 : 0);
