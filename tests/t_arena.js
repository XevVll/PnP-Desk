/* ==========================================================
   DIE ARENA DES ENDKAMPFS (js/arena.js)

   Es gab fuer die Arena bis zum 18.10.2026 KEINEN eingecheckten
   Test. Die Skripte von August lagen im Scratchpad und sind
   verloren - dieselbe Luecke wie am 11.10. bei den uebrigen
   Skripten. Dieses Skript holt das nach, weil an diesem Tag die
   folgenschwerste Regel der Kampagne geaendert wurde:

     "Nur mit dem Saebel sterben die Wiedergaenger und auch
      der Boss selbst."  (Hendrik, 18.10.2026)

   Geprueft wird GEGEN DIE REGEL, nicht gegen den Code:
   - die vier Baender gegen das Beispiel aus Bibel 4.1
     (Wert 5 -> 1-25 / 26-50 / 51-75 / 76-100),
   - dass ohne Saebel NICHTS endgueltig faellt,
   - dass der Saebel den Seelenlosen NICHT mit einer Beruehrung
     niederlegt (er ist die Bedingung, nicht die Abkuerzung),
   - und der Kern: solange der Seelenlose nur AM BODEN liegt,
     laufen Auferstehung und Nachschub weiter.

   Die letzte Pruefung ist die wichtigste. Haengte der Nachschub
   weiter an "der Boss lebt" statt an "der Boss ist gebannt",
   wuerde ein normaler Niederschlag das Gefecht beenden - und die
   Pflichtwaffe waere wirkungslos, ohne dass es auffaellt.
   ========================================================== */
const path = require('path');
const A = require(path.join(__dirname, '..', 'js', 'arena.js'));

let f = 0, anzahl = 0;
const chk = (n, c, x) => {
  anzahl++;
  console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x)));
  if (!c) f++;
};

/* ---------- Die Baender, gegen das Bibel-Beispiel (4.1) ---------- */
// Wert 5 -> Schwelle 50. Mit Mastery: 1-25 gut, 26-50 normal,
// 51-75 schlecht, 76-100 Miss. Alle 100 Wuerfe einzeln.
(function baender() {
  let falsch = 0, ersterFehler = null;
  for (let w = 1; w <= 100; w++) {
    const soll = w <= 25 ? 'gut' : w <= 50 ? 'normal' : w <= 75 ? 'schlecht' : 'miss';
    const ist = A.arenaBand(w, 5, true);
    if (ist !== soll) { falsch++; if (!ersterFehler) ersterFehler = { w, soll, ist }; }
  }
  chk('Wert 5 trifft auf allen 100 Wuerfen die Baender der Bibel', falsch === 0, ersterFehler);

  // Ohne Mastery faellt "schlecht" in den Misserfolg - die ZAHLEN
  // verschieben sich dabei nicht (Bibel 4.2).
  chk('ohne Mastery wird aus 51-75 ein Misserfolg', A.arenaBand(60, 5, false) === 'miss',
    A.arenaBand(60, 5, false));
  chk('ohne Mastery bleibt 26-50 ein normaler Erfolg', A.arenaBand(40, 5, false) === 'normal',
    A.arenaBand(40, 5, false));
})();

/* ---------- Werkzeug ---------- */
function diener(id, hp) {
  return { id: id, typ: 'diener', x: 5, y: 5, hp: hp == null ? 4 : hp, hpMax: 4, nahWert: 5, nahSchaden: 2 };
}
function boss(hp) {
  return { id: 'boss', typ: 'seelenloser', x: 6, y: 5, hp: hp == null ? 18 : hp, hpMax: 18,
    nahWert: 7, fernWert: 0, nahSchaden: 3, mastery: true };
}
function held(id) {
  return { id: id, typ: 'spieler', x: 5, y: 6, hp: 10, hpMax: 10, nahWert: 6, nahSchaden: 3, geladen: true };
}
const REGELN = { breite: 16, hoehe: 16, bewegung: 2, nahkampfReichweite: 1,
  fernkampfReichweite: 6, wiederauferstehenNach: 2, nachschubAlle: 3, nachschubAnzahl: 2 };

// Wurf 10 ist bei Wert 6 ein guter Erfolg - also sicher ein Treffer.
const TREFFER = 10;
// Wurf 99 ist bei jedem unserer Werte ein Misserfolg.
const DANEBEN = 99;

/* ---------- Diener: nur der Saebel toetet endgueltig ---------- */
(function dienerRegel() {
  const h = held('h1'), d = diener('d1');
  const tokens = { h1: h, d1: d };

  const ohne = A.arenaAngriff(h, d, tokens, REGELN, null, TREFFER);
  chk('Diener ohne Saebel: faellt', ohne.toetet === true, ohne);
  chk('Diener ohne Saebel: NICHT endgueltig', ohne.endgueltig === false, ohne);

  // Mit Saebel: jeder Treffer ist sofort toedlich, auch bei vollen HP und
  // selbst beim schwaechsten Band (Hendriks Regel vom 23.08.2026).
  const mit = A.arenaAngriff(h, diener('d1'), tokens, REGELN, 'h1', TREFFER);
  chk('Diener mit Saebel: endgueltig', mit.endgueltig === true, mit);
  chk('Diener mit Saebel: HP auf 0, egal wie viel Schaden', mit.zielHpNeu === 0, mit);

  const dick = A.arenaAngriff(h, diener('d1', 99), tokens, REGELN, 'h1', TREFFER);
  chk('Saebel toetet den Diener auch mit 99 Rest-HP', dick.endgueltig === true, dick);

  const miss = A.arenaAngriff(h, diener('d1'), tokens, REGELN, 'h1', DANEBEN);
  chk('Saebel toetet bei einem Misserfolg NICHT', miss.toetet === false && miss.endgueltig === false, miss);
})();

/* ---------- Der Seelenlose: die neue Regel ---------- */
(function bossRegel() {
  const h = held('h1');
  const tokens = { h1: h, boss: boss() };

  // Ohne Saebel bis auf 0 gebracht: er faellt, aber nicht endgueltig.
  const ohne = A.arenaAngriff(h, boss(1), tokens, REGELN, null, TREFFER);
  chk('Seelenloser ohne Saebel: faellt', ohne.toetet === true, ohne);
  chk('Seelenloser ohne Saebel: NICHT endgueltig', ohne.endgueltig === false, ohne);

  // Mit Saebel bis auf 0 gebracht: endgueltig.
  const mit = A.arenaAngriff(h, boss(1), tokens, REGELN, 'h1', TREFFER);
  chk('Seelenloser mit Saebel: endgueltig', mit.endgueltig === true, mit);

  // DER PUNKT, der das Finale traegt: Der Saebel ist die Bedingung, nicht
  // die Abkuerzung. Ein einziger Treffer auf den vollen Boss toetet nicht.
  const einTreffer = A.arenaAngriff(h, boss(18), tokens, REGELN, 'h1', TREFFER);
  chk('Saebel legt den vollen Seelenlosen NICHT mit einem Treffer nieder',
    einTreffer.toetet === false && einTreffer.zielHpNeu > 0, einTreffer);
  chk('Saebel-Schaden am Seelenlosen zaehlt normal (guter Erfolg = doppelt)',
    einTreffer.schaden === 6, einTreffer.schaden);
})();

/* ---------- Gebannt oder nur am Boden ---------- */
(function gebannt() {
  chk('voller Boss ist nicht gebannt',
    A.arenaBossGebannt({ boss: boss() }) === false);
  chk('Boss am Boden (ohne Saebel gefallen) ist NICHT gebannt',
    A.arenaBossGebannt({ boss: Object.assign(boss(0), { tot: true }) }) === false);
  chk('Boss vom Saebel ist gebannt',
    A.arenaBossGebannt({ boss: Object.assign(boss(0), { tot: true, endgueltig: true }) }) === true);
  // Ohne Boss im Feld gilt gebannt - sonst stuenden Diener in einem Gefecht
  // ohne Seelenlosen endlos wieder auf (Verhalten wie vor dieser Regel).
  chk('ohne Boss-Token gilt gebannt', A.arenaBossGebannt({ d1: diener('d1') }) === true);
  chk('leeres Feld gilt gebannt', A.arenaBossGebannt({}) === true);
})();

/* ---------- Rundenwechsel: der Kern der Aenderung ---------- */
(function rundenwechsel() {
  // Boss liegt seit Runde 1 am Boden, NICHT endgueltig. Dazu ein Diener,
  // ebenfalls normal gefallen. Runde 2 -> 3 (nachschubAlle = 3).
  const amBoden = {
    boss: Object.assign(boss(0), { tot: true, totSeitRunde: 1 }),
    d1: Object.assign(diener('d1', 0), { tot: true, totSeitRunde: 1 })
  };
  const erg = A.arenaRundenwechsel(amBoden, REGELN, 2);

  chk('Boss am Boden: Nachschub laeuft WEITER', erg.nachschub === REGELN.nachschubAnzahl,
    { nachschub: erg.nachschub, bossLebt: erg.bossLebt, gebannt: erg.bossGebannt });
  chk('Boss am Boden: der Diener steht wieder auf',
    erg.auferstanden.indexOf('d1') >= 0, erg.auferstanden);
  chk('Boss am Boden: er richtet sich selbst wieder auf',
    erg.auferstanden.indexOf('boss') >= 0, erg.auferstanden);
  chk('Boss am Boden: seine HP sind wieder voll',
    erg.aenderungen['tokens/boss/hp'] === 18, erg.aenderungen['tokens/boss/hp']);
  // arenaBossLebt() sagt hier "nein" - genau deshalb durfte der Nachschub
  // nicht daran haengen.
  chk('arenaBossLebt() meldet ihn als gefallen, gebannt ist er aber nicht',
    erg.bossLebt === false && erg.bossGebannt === false, erg);

  // Gebannt: nichts steht mehr auf, kein Nachschub.
  const gebanntState = {
    boss: Object.assign(boss(0), { tot: true, endgueltig: true, totSeitRunde: 1 }),
    d1: Object.assign(diener('d1', 0), { tot: true, totSeitRunde: 1 })
  };
  const erg2 = A.arenaRundenwechsel(gebanntState, REGELN, 2);
  chk('gebannt: kein Nachschub', erg2.nachschub === 0, erg2.nachschub);
  chk('gebannt: niemand steht mehr auf', erg2.auferstanden.length === 0, erg2.auferstanden);
  chk('gebannt: der Boss selbst bleibt liegen',
    erg.aenderungen['tokens/boss/hp'] !== undefined && erg2.aenderungen['tokens/boss/hp'] === undefined,
    erg2.aenderungen['tokens/boss/hp']);

  // Ein vom Saebel gefallener Diener steht nie wieder auf, auch wenn der
  // Boss noch steht.
  const saebelTot = {
    boss: boss(),
    d1: Object.assign(diener('d1', 0), { tot: true, endgueltig: true, totSeitRunde: 1 })
  };
  const erg3 = A.arenaRundenwechsel(saebelTot, REGELN, 2);
  chk('vom Saebel gefallener Diener bleibt liegen', erg3.auferstanden.length === 0, erg3.auferstanden);
  chk('solange der Boss steht, kommt Nachschub', erg3.nachschub === REGELN.nachschubAnzahl, erg3.nachschub);

  // Die Wartezeit wird eingehalten: eine Runde zu frueh steht niemand auf.
  const frisch = { boss: boss(), d1: Object.assign(diener('d1', 0), { tot: true, totSeitRunde: 2 }) };
  const erg4 = A.arenaRundenwechsel(frisch, REGELN, 2);
  chk('eine Runde zu frueh steht niemand auf', erg4.auferstanden.length === 0, erg4.auferstanden);
})();

console.log((f ? 'FEHLER: ' + f : 'OK') + ' / ' + anzahl + ' Pruefungen');
process.exit(f ? 1 : 0);
