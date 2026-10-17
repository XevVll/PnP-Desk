/* ============================================================
   ECHTE WUERFELKOERPER (js/dice3d.js)

   Hendriks Wunsch vom 17.10.2026: "Es müsste aber ein 3d Würfel
   erstellt werden, der sich dreht." Vorher war es ein flaches Polygon
   mit vorgetaeuschter Dicke - jetzt ein Koerper aus echten Flaechen im
   Raum (CSS 3D, kein WebGL, keine Bibliothek).

   WARUM DIE FLAECHEN GERECHNET UND NICHT GETIPPT WERDEN:
   Ein Dodekaeder hat 12 Fuenfecke aus 20 Ecken. Diese Liste aus dem
   Kopf zu schreiben heisst, sich zu verschreiben - und ein falsch
   gewickeltes Fuenfeck faellt am Bildschirm kaum auf, es sieht nur
   "irgendwie kaputt" aus. Deshalb steht hier NUR die Eckenliste, und
   die Flaechen werden daraus abgeleitet: Jede Ebene, auf deren einer
   Seite alle uebrigen Ecken liegen, ist eine Flaeche. Das ist die
   Definition eines konvexen Koerpers, und sie kann sich nicht irren.

   Geprueft wird das in tests/t_dice3d.js gegen die Geometrie selbst
   (Flaechenzahl, Ecken je Flaeche, Planaritaet, Eulersche Formel
   V - E + F = 2), nicht gegen eine abgeschriebene Tabelle.

   KOORDINATEN sind bereits CSS-Koordinaten: x nach rechts, y nach
   UNTEN, z zum Betrachter. Die Ecktabellen unten sind in Mathe-
   Konvention (y nach oben) notiert, weil sie so in jedem Nachschlage-
   werk stehen - umgedreht wird beim Einlesen, an genau einer Stelle.
   ============================================================ */

const D3_EPS = 1e-6;

/* Der goldene Schnitt - traegt Dodekaeder und Trapezoeder. */
const D3_PHI = (1 + Math.sqrt(5)) / 2;

/* ---------- Die Ecken der fuenf Koerper ----------
   Mehr steht hier bewusst nicht: keine Flaechen, keine Kanten. */
function d3Ecken(seiten) {
  const e = [];
  let i, k;

  if (seiten === 4) {
    // Tetraeder: vier Ecken eines Wuerfels, immer die diagonal gegenueber.
    return [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  }
  if (seiten === 6) {
    // Wuerfel: alle acht Vorzeichenkombinationen.
    for (i = 0; i < 8; i++) {
      e.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1]);
    }
    return e;
  }
  if (seiten === 8) {
    // Oktaeder: die sechs Achsenpunkte.
    return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  }
  if (seiten === 12) {
    // Dodekaeder: Wuerfel plus drei goldene Rechtecke.
    for (i = 0; i < 8; i++) {
      e.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1]);
    }
    const a = 1 / D3_PHI, b = D3_PHI;
    for (i = 0; i < 4; i++) {
      const s = (i & 1) ? 1 : -1, t = (i & 2) ? 1 : -1;
      e.push([0, s * a, t * b]);
      e.push([s * a, t * b, 0]);
      e.push([s * b, 0, t * a]);
    }
    return e;
  }
  if (seiten === 10) {
    /* Pentagonales Trapezoeder - der echte W10: zwei Spitzen und zwei
       um 36 Grad versetzte Fuenferringe, dazwischen zehn Drachen.

       ZWEI Groessen haengen zusammen, und beide sind nicht frei:
       Liegen die Ringe im Abstand c von der Mitte, dann liegen die
       vier Ecken eines Drachens nur bei EINER Spitzenhoehe h in einer
       Ebene. Dieses h waechst linear mit c (h = faktor * c).

       Frei ist also nur EINES von beiden - und genau da ist der erste
       Anlauf gescheitert: Mit einem geratenen c = 0,38 wurde die
       Spitze 3,6 hoch, der Koerper also 7,2 tief bei 2 breit. Ein
       geometrisch tadelloses Trapezoeder - aber ein DORN, kein
       Wuerfel. (Hendriks Meldung vom 17.10.2026, am Bild sofort zu
       sehen.)

       Deshalb wird jetzt die HOEHE vorgegeben und c zurueckgerechnet:
       so hoch wie der Ring weit ist, wie bei einem echten W10. */
    const r = 1, zielHoehe = r;
    /* h ist linear in c, also genuegt eine Messung bei c = 1, um den
       Faktor zu kennen. Nachgerechnet statt nachgeschlagen. */
    const faktor = d3SpitzeFuerEbene(
      [r, 0, 1],
      [r * Math.cos(Math.PI / 5), r * Math.sin(Math.PI / 5), -1],
      [r * Math.cos(2 * Math.PI / 5), r * Math.sin(2 * Math.PI / 5), 1], 1);
    const c = zielHoehe / faktor;
    const o = [], u = [];
    for (k = 0; k < 5; k++) {
      const w = (2 * Math.PI * k) / 5;
      o.push([r * Math.cos(w), r * Math.sin(w), c]);
      u.push([r * Math.cos(w + Math.PI / 5), r * Math.sin(w + Math.PI / 5), -c]);
    }
    const h = d3SpitzeFuerEbene(o[0], u[0], o[1], c);
    return o.concat(u, [[0, 0, h], [0, 0, -h]]);
  }
  return null;
}

/* Wie hoch muss die Spitze liegen, damit Spitze, zwei Ringecken oben
   und eine unten in EINER Ebene liegen? Aufgeloest statt geraten. */
function d3SpitzeFuerEbene(o0, u0, o1, c) {
  /* Die Ebene durch o0, o1 und u0 schneidet die z-Achse bei genau
     einem Punkt - und das ist die gesuchte Spitze. */
  const n = d3Kreuz(d3Minus(o1, o0), d3Minus(u0, o0));
  const d = d3Punkt(n, o0);
  if (Math.abs(n[2]) < D3_EPS) return 1;   // entartet, sollte nie vorkommen
  return d / n[2];
}

/* ---------- Vektor-Kleinkram ---------- */
function d3Minus(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function d3Punkt(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function d3Kreuz(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function d3Laenge(a) { return Math.sqrt(d3Punkt(a, a)); }
function d3Norm(a) {
  const l = d3Laenge(a);
  return l < D3_EPS ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l];
}

/* ---------- Flaechen aus den Ecken ableiten ----------
   Jede Ebene durch drei Ecken, auf deren EINER Seite alle uebrigen
   liegen, traegt eine Flaeche. Mehr ist ein konvexer Koerper nicht. */
function d3Flaechen(ecken) {
  const n = ecken.length, flaechen = [], gesehen = {};
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        let nor = d3Kreuz(d3Minus(ecken[j], ecken[i]), d3Minus(ecken[k], ecken[i]));
        if (d3Laenge(nor) < D3_EPS) continue;           // drei auf einer Geraden
        nor = d3Norm(nor);
        let d = d3Punkt(nor, ecken[i]);
        if (d < 0) { nor = [-nor[0], -nor[1], -nor[2]]; d = -d; }  // nach aussen
        if (d < D3_EPS) continue;                        // Ebene durch den Mittelpunkt

        // Liegen wirklich ALLE anderen Ecken auf einer Seite?
        let drauf = [], aussen = false;
        for (let m = 0; m < n; m++) {
          const w = d3Punkt(nor, ecken[m]) - d;
          if (w > D3_EPS) { aussen = true; break; }
          if (w > -D3_EPS) drauf.push(m);
        }
        if (aussen || drauf.length < 3) continue;

        const schluessel = drauf.join(',');
        if (gesehen[schluessel]) continue;
        gesehen[schluessel] = true;
        flaechen.push({ normale: nor, abstand: d, ecken: d3Ringen(drauf, ecken, nor) });
      }
    }
  }
  return flaechen;
}

/* Die Ecken einer Flaeche im Kreis sortieren - unsortiert waere das
   Vieleck ein Stern. */
function d3Ringen(indizes, ecken, nor) {
  const mitte = [0, 0, 0];
  indizes.forEach(function (i) {
    mitte[0] += ecken[i][0] / indizes.length;
    mitte[1] += ecken[i][1] / indizes.length;
    mitte[2] += ecken[i][2] / indizes.length;
  });
  const u = d3Norm(d3Minus(ecken[indizes[0]], mitte));
  const v = d3Kreuz(nor, u);
  return indizes.slice().sort(function (a, b) {
    const pa = d3Minus(ecken[a], mitte), pb = d3Minus(ecken[b], mitte);
    return Math.atan2(d3Punkt(pa, v), d3Punkt(pa, u)) -
           Math.atan2(d3Punkt(pb, v), d3Punkt(pb, u));
  });
}

/* ---------- Der fertige Koerper ---------- */
function dice3dKoerper(seiten) {
  const roh = d3Ecken(seiten);
  if (!roh) return null;
  /* Mathe-Konvention (y nach oben) auf CSS (y nach unten) drehen -
     an genau DIESER Stelle, damit weiter unten nichts mehr kippt. */
  const ecken = roh.map(function (p) { return [p[0], -p[1], p[2]]; });
  const flaechen = d3Flaechen(ecken);
  /* Auf eine gemeinsame Groesse bringen: der weiteste Punkt bestimmt
     den Massstab, sonst waere der Wuerfel klobiger als das Oktaeder. */
  let weit = 0;
  ecken.forEach(function (p) { weit = Math.max(weit, d3Laenge(p)); });
  return { ecken: ecken, flaechen: flaechen, radius: weit };
}

/* Das Markup: eine <div> je Flaeche, mit matrix3d an ihren Platz und
   in ihre Lage gedreht, per clip-path auf ihren Umriss beschnitten. */
function dice3dMarkup(seiten, groesse) {
  const k = dice3dKoerper(seiten);
  if (!k) return '';
  const s = (groesse || 44) / 2 / k.radius;       // Skalierung auf Pixel
  let html = '';

  k.flaechen.forEach(function (f, nr) {
    const mitte = [0, 0, 0];
    f.ecken.forEach(function (i) {
      mitte[0] += k.ecken[i][0] * s / f.ecken.length;
      mitte[1] += k.ecken[i][1] * s / f.ecken.length;
      mitte[2] += k.ecken[i][2] * s / f.ecken.length;
    });
    const nor = f.normale;
    const u = d3Norm(d3Minus([k.ecken[f.ecken[0]][0] * s, k.ecken[f.ecken[0]][1] * s,
                              k.ecken[f.ecken[0]][2] * s], mitte));
    const v = d3Kreuz(nor, u);

    /* Die Flaeche in ihre eigene Ebene projizieren - daraus wird der
       clip-path. */
    let weit = 0;
    const flach = f.ecken.map(function (i) {
      const p = d3Minus([k.ecken[i][0] * s, k.ecken[i][1] * s, k.ecken[i][2] * s], mitte);
      const xy = [d3Punkt(p, u), d3Punkt(p, v)];
      weit = Math.max(weit, Math.abs(xy[0]), Math.abs(xy[1]));
      return xy;
    });
    const kasten = Math.ceil(weit * 2) + 2;
    const punkte = flach.map(function (p) {
      return (kasten / 2 + p[0]).toFixed(2) + 'px ' + (kasten / 2 + p[1]).toFixed(2) + 'px';
    }).join(', ');

    /* Festes Streiflicht im Koerpersystem: Flaechen, die im Modell
       nach oben zeigen, sind heller. Das Licht dreht sich mit - fuer
       echtes Licht braeuchte es WebGL. Es macht die Kanten sichtbar,
       und genau darum geht es. */
    const licht = 0.5 + 0.5 * Math.max(0, d3Punkt(nor, d3Norm([0.35, -0.8, 0.5])));

    const m = [u[0], u[1], u[2], 0, v[0], v[1], v[2], 0,
               nor[0], nor[1], nor[2], 0, mitte[0], mitte[1], mitte[2], 1];
    html += '<div class="wa-flaeche" data-f="' + nr + '" style="' +
      'width:' + kasten + 'px;height:' + kasten + 'px;' +
      'margin-left:' + (-kasten / 2) + 'px;margin-top:' + (-kasten / 2) + 'px;' +
      'clip-path:polygon(' + punkte + ');' +
      '--hell:' + licht.toFixed(3) + ';' +
      'transform:matrix3d(' + m.map(function (z) { return z.toFixed(4); }).join(',') + ')' +
      '"></div>';
  });
  return html;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    D3_PHI: D3_PHI, d3Ecken: d3Ecken, d3Flaechen: d3Flaechen,
    d3Norm: d3Norm, d3Punkt: d3Punkt, d3Kreuz: d3Kreuz, d3Minus: d3Minus,
    d3Laenge: d3Laenge, dice3dKoerper: dice3dKoerper, dice3dMarkup: dice3dMarkup
  };
}
