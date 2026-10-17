/* ============================================================
   DIE WUERFELKOERPER — js/dice3d.js

   Geprueft wird gegen die GEOMETRIE, nicht gegen eine Tabelle, die
   ich abgeschrieben habe: Flaechenzahl, Ecken je Flaeche, Planaritaet,
   Eulersche Formel, Aussennormalen. Eine Pruefung, die ihre Erwartung
   aus dem Prueflingen zieht, bestaetigt jeden Fehler.
   ============================================================ */
const path = require('path');
const BASIS = path.join(__dirname, '..');
const D = require(path.join(BASIS, 'js/dice3d.js'));

let f = 0, anzahl = 0;
function chk(name, ok, wert) {
  anzahl++;
  if (ok) { console.log('OK   ' + name); return; }
  f++;
  console.log('FAIL ' + name + (wert === undefined ? '' : '  <<< ' + JSON.stringify(wert)));
}

console.log('=== DIE FUENF KOERPER ===');

/* Was ein Wuerfel dieser Groesse sein MUSS - aus dem Regelwerk der
   Geometrie, nicht aus dem Code abgelesen. */
const SOLL = {
  4:  { flaechen: 4,  ecken: 4,  proFlaeche: 3, name: 'Tetraeder' },
  6:  { flaechen: 6,  ecken: 8,  proFlaeche: 4, name: 'Wuerfel' },
  8:  { flaechen: 8,  ecken: 6,  proFlaeche: 3, name: 'Oktaeder' },
  10: { flaechen: 10, ecken: 12, proFlaeche: 4, name: 'Trapezoeder' },
  12: { flaechen: 12, ecken: 20, proFlaeche: 5, name: 'Dodekaeder' }
};

Object.keys(SOLL).forEach(function (sStr) {
  const s = Number(sStr), soll = SOLL[s];
  const k = D.dice3dKoerper(s);
  console.log('');
  console.log('--- d' + s + ' (' + soll.name + ') ---');

  chk('d' + s + ': der Koerper entsteht', !!k);
  if (!k) return;

  chk('d' + s + ': ' + soll.ecken + ' Ecken', k.ecken.length === soll.ecken, k.ecken.length);
  /* Die tragende Pruefung: Ein W10 mit 9 Flaechen ist kein W10. */
  chk('d' + s + ': ' + soll.flaechen + ' Flaechen', k.flaechen.length === soll.flaechen,
    k.flaechen.length);

  const proFlaeche = k.flaechen.map(function (fl) { return fl.ecken.length; });
  chk('d' + s + ': jede Flaeche hat ' + soll.proFlaeche + ' Ecken',
    proFlaeche.every(function (n) { return n === soll.proFlaeche; }), proFlaeche);

  /* PLANARITAET. Beim W10 ist das keine Formalie: Die Hoehe der Spitze
     wird ausgerechnet, und waere die Rechnung falsch, waeren die
     Drachen windschief - der Koerper saehe geknickt aus. */
  let maxAbw = 0;
  k.flaechen.forEach(function (fl) {
    fl.ecken.forEach(function (i) {
      maxAbw = Math.max(maxAbw, Math.abs(D.d3Punkt(fl.normale, k.ecken[i]) - fl.abstand));
    });
  });
  chk('d' + s + ': alle Flaechen sind wirklich eben', maxAbw < 1e-6, maxAbw);

  /* Jede Ecke muss zu mindestens drei Flaechen gehoeren - eine Ecke,
     die nirgends vorkommt, ist ein Loch im Koerper. */
  const benutzt = {};
  k.flaechen.forEach(function (fl) {
    fl.ecken.forEach(function (i) { benutzt[i] = (benutzt[i] || 0) + 1; });
  });
  const waisen = [];
  for (let i = 0; i < k.ecken.length; i++) {
    if (!benutzt[i] || benutzt[i] < 3) waisen.push(i);
  }
  chk('d' + s + ': keine Ecke haengt in der Luft', waisen.length === 0, waisen);

  /* EULER: V - E + F = 2 gilt fuer jeden geschlossenen Koerper. Sie
     faellt um, sobald eine Flaeche fehlt oder doppelt gezaehlt wird. */
  const kanten = {};
  k.flaechen.forEach(function (fl) {
    for (let i = 0; i < fl.ecken.length; i++) {
      const a = fl.ecken[i], b = fl.ecken[(i + 1) % fl.ecken.length];
      kanten[Math.min(a, b) + '-' + Math.max(a, b)] = true;
    }
  });
  const E = Object.keys(kanten).length;
  chk('d' + s + ': Euler V-E+F = 2', k.ecken.length - E + k.flaechen.length === 2,
    k.ecken.length + ' - ' + E + ' + ' + k.flaechen.length);

  /* Jede Kante gehoert genau zwei Flaechen - sonst ist der Koerper
     offen oder faltet sich in sich selbst. */
  const kantenZahl = {};
  k.flaechen.forEach(function (fl) {
    for (let i = 0; i < fl.ecken.length; i++) {
      const a = fl.ecken[i], b = fl.ecken[(i + 1) % fl.ecken.length];
      const sch = Math.min(a, b) + '-' + Math.max(a, b);
      kantenZahl[sch] = (kantenZahl[sch] || 0) + 1;
    }
  });
  const schief = Object.keys(kantenZahl).filter(function (sch) { return kantenZahl[sch] !== 2; });
  chk('d' + s + ': jede Kante traegt genau zwei Flaechen', schief.length === 0, schief);

  /* Alle Normalen zeigen nach AUSSEN. Zeigte eine nach innen, waere
     die Flaeche im Browser weggeblendet (backface-visibility) und der
     Koerper haette ein Loch. */
  const innen = k.flaechen.filter(function (fl) { return fl.abstand <= 0; });
  chk('d' + s + ': alle Normalen zeigen nach aussen', innen.length === 0, innen.length);

  /* Das Markup traegt genau so viele Flaechen, wie der Koerper hat. */
  const markup = D.dice3dMarkup(s, 44);
  const divs = (markup.match(/class="wa-flaeche"/g) || []).length;
  chk('d' + s + ': das Markup zeigt alle ' + soll.flaechen + ' Flaechen',
    divs === soll.flaechen, divs);
  chk('d' + s + ': jede Flaeche ist im Raum gedreht',
    (markup.match(/matrix3d\(/g) || []).length === soll.flaechen);
  chk('d' + s + ': jede Flaeche ist auf ihren Umriss beschnitten',
    (markup.match(/clip-path:polygon\(/g) || []).length === soll.flaechen);
});

console.log('');
console.log('=== WAS DEN KOERPER ZUM KOERPER MACHT ===');

/* Alle fuenf sind gleich gross - sonst waere der W12 ein Klotz neben
   dem Tetraeder. */
const radien = [4, 6, 8, 10, 12].map(function (s) {
  const m = D.dice3dMarkup(s, 44);
  let weit = 0;
  (m.match(/width:(\d+)px/g) || []).forEach(function (t) {
    weit = Math.max(weit, Number(t.replace(/\D/g, '')));
  });
  return weit;
});
chk('kein Koerper sprengt seinen Platz', radien.every(function (r) { return r <= 50; }), radien);

/* Der Wuerfel ist der Pruefstein, weil man seine Zahlen kennt: sechs
   Quadrate, und jede Flaeche steht senkrecht auf ihren Nachbarn. */
const w = D.dice3dKoerper(6);
let rechteWinkel = 0;
w.flaechen.forEach(function (a) {
  w.flaechen.forEach(function (b) {
    if (Math.abs(D.d3Punkt(a.normale, b.normale)) < 1e-9) rechteWinkel++;
  });
});
chk('beim Wuerfel stehen die Flaechen senkrecht aufeinander', rechteWinkel === 24, rechteWinkel);

/* Und das Tetraeder hat den bekannten Flaechenwinkel von 70,53 Grad.
   ACHTUNG, hier ist meine erste Fassung hereingefallen: Zwischen den
   AUSSENNORMALEN liegen 109,47 Grad - der Flaechenwinkel ist der
   Ergaenzungswinkel dazu. Der Code hatte recht, die Erwartung nicht. */
const t = D.dice3dKoerper(4);
const nWinkel = Math.acos(D.d3Punkt(t.flaechen[0].normale, t.flaechen[1].normale)) * 180 / Math.PI;
const winkel = 180 - nWinkel;
chk('das Tetraeder hat 70,53 Grad zwischen den Flaechen',
  Math.abs(winkel - 70.5288) < 0.01, winkel.toFixed(4));

/* Ein unbekannter Wuerfel darf nichts kaputtmachen. */
chk('ein unbekannter Wuerfel liefert nichts', D.dice3dKoerper(7) === null);
chk('und bricht das Markup nicht', D.dice3dMarkup(7, 44) === '');

console.log('');
console.log('OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);
