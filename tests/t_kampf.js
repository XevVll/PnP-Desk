/* ==========================================================
   KAMPF — Initiative, Angriff, Wirkung
   ----------------------------------------------------------
   Geprüft wird gegen die Regel, nicht gegen den Code: Jede
   Behauptung hier steht so im offiziellen Savage-Worlds-Text
   (frei veröffentlichter Test Drive, Pinnacle). Wo das Projekt
   bewusst abweicht, steht die Abweichung als Schalter in
   KAMPF_REGELN — und beide Stellungen werden geprüft, damit
   eine Regelentscheidung eine Zeile bleibt.
   ========================================================== */
const path = require('path');
const BASIS = path.join(__dirname, '..');
const R = require(path.join(BASIS, 'js/regelwerk.js'));
global.ZIELZAHL = R.ZIELZAHL;
const K = require(path.join(BASIS, 'js/kampf.js'));

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

console.log('=== DAS AKTIONSDECK ===');
const deck = K.neuesDeck();
chk('54 Karten', deck.length === 54, deck.length);
chk('zwei Joker', deck.filter(k => k.joker).length === 2);
chk('jede Farbe dreizehnmal',
  K.KARTEN_FARBEN.every(fa => deck.filter(k => k.farbe === fa.id).length === 13));
chk('keine Karte doppelt',
  new Set(deck.map(k => k.wert + '-' + k.farbe + '-' + k.joker)).size === 54);
chk('Mischen verliert nichts', K.mischen(deck).length === 54);

/* Ass zuerst, abwaerts bis zur Zwei - bei Gleichstand Pik, Herz,
   Karo, Kreuz. Genau so steht es im Original. */
console.log('');
console.log('=== DIE REIHENFOLGE ===');
const karte = (w, fa) => ({ wert: w, farbe: fa, joker: false });
chk('Ass schlägt König', K.kartenVergleich(karte(14, 'kreuz'), karte(13, 'pik')) < 0);
chk('bei Gleichstand gewinnt Pik', K.kartenVergleich(karte(7, 'pik'), karte(7, 'herz')) < 0);
chk('Herz schlägt Karo', K.kartenVergleich(karte(7, 'herz'), karte(7, 'karo')) < 0);
chk('Karo schlägt Kreuz', K.kartenVergleich(karte(7, 'karo'), karte(7, 'kreuz')) < 0);
chk('der Joker steht über dem Ass',
  K.kartenVergleich({ wert: K.JOKER_WERT, joker: true }, karte(14, 'pik')) < 0);
chk('eine Karte schlägt keine Karte', K.kartenVergleich(karte(2, 'kreuz'), null) < 0);

const sortiert = [karte(3, 'herz'), karte(14, 'kreuz'), karte(3, 'pik'), karte(9, 'karo')]
  .sort(K.kartenVergleich).map(K.kartenText);
chk('eine ganze Hand sortiert sich richtig',
  sortiert.join(' ') === 'A♣ 9♦ 3♠ 3♥', sortiert.join(' '));

console.log('');
console.log('=== AUSTEILEN ===');
/* Gezinktes Deck: nur so laesst sich pruefen, was der Zufall sonst
   verdeckt. Die Zufallsquelle ist genau dafuer austauschbar. */
const leute = [{ id: 'pete', name: 'Pete' }, { id: 'g1', name: 'Matrose 1' },
               { id: 'g2', name: 'Matrose 2' }, { id: 'anselm', name: 'Anselm' }];
const gezinkt = [karte(5, 'kreuz'), karte(14, 'herz'), karte(5, 'pik'), karte(10, 'karo')]
  .concat(K.neuesDeck());
const runde = K.austeilen(leute, gezinkt);
chk('jeder bekommt genau eine Karte',
  runde.reihe.length === 4 && runde.reihe.every(t => !!t.karte));
chk('und zwar in der Reihenfolge des Decks, dann sortiert',
  runde.reihe.map(t => t.name).join(' · ') === 'Matrose 1 · Anselm · Matrose 2 · Pete',
  runde.reihe.map(t => t.name + ' ' + K.kartenText(t.karte)));
chk('der Name bleibt am Teilnehmer', runde.reihe[0].id === 'g1');
chk('das Deck ist um vier Karten kürzer', runde.deck.length === gezinkt.length - 4);
chk('ohne Joker wird nicht neu gemischt', runde.mischenNoetig === false);

/* Der Joker: handelt wann er will, +2 auf alles UND auf Schaden,
   danach wird neu gemischt. */
const mitJoker = K.austeilen([{ id: 'a', name: 'A' }],
  [{ wert: K.JOKER_WERT, farbe: 'rot', joker: true }].concat(K.neuesDeck()));
chk('ein Joker verlangt neues Mischen', mitJoker.mischenNoetig === true);
chk('der Joker gibt +2', K.jokerBonus(mitJoker.reihe[0]) === 2);
chk('eine normale Karte gibt nichts', K.jokerBonus(runde.reihe[0]) === 0);
chk('der Joker heißt auch so', K.kartenText(mitJoker.reihe[0].karte) === 'Joker');

/* Ein Deck, das leer laeuft, mischt von selbst nach - sonst stuende
   die sechste Runde ohne Karten da. */
const vieleLeute = [];
for (let i = 0; i < 60; i++) vieleLeute.push({ id: 'x' + i, name: 'X' + i });
const gross = K.austeilen(vieleLeute, K.neuesDeck());
chk('ein leer laufendes Deck mischt nach',
  gross.reihe.length === 60 && gross.reihe.every(t => !!t.karte));

console.log('');
console.log('=== DER ANGRIFF GEHT GEGEN DIE PARADE ===');
/* "Roll a Fighting skill roll and compare it to the opponent's Parry."
   Unser Probensystem rechnet gegen 4, also wird die Differenz zum
   Modifikator - und zwar auch, wenn sie ungerade ist. Genau das ging
   mit den alten Knoepfen (+2/0/-2/-4) nicht. */
chk('gegen Parade 4 ist es ein glatter Wurf', K.angriffsMod(4) === 0);
chk('gegen Parade 5 sind es −1', K.angriffsMod(5) === -1);
chk('gegen Parade 6 sind es −2', K.angriffsMod(6) === -2);
chk('gegen Parade 2 ist es +2', K.angriffsMod(2) === 2);
chk('Deckung kommt obendrauf', K.angriffsMod(5, -2) === -3);
chk('Unsinn bricht nicht', K.angriffsMod(null) === 4 && K.angriffsMod(-9) === 4);

/* Fernkampf: 0 / −2 / −4 nach Distanzband. Unsere Waffen tragen EINE
   Zahl; sie ist das kurze Band, das Doppelte das mittlere, das
   Vierfache das lange. */
chk('auf kurze Distanz ohne Abzug', K.fernkampfMod(5, 5) === 0);
chk('auf mittlere −2', K.fernkampfMod(5, 10) === -2);
chk('auf lange −4', K.fernkampfMod(5, 20) === -4);
chk('darüber hinaus gar kein Schuss', K.fernkampfMod(5, 21) === null);
chk('direkt davor ist auch kurz', K.fernkampfMod(5, 1) === 0);

console.log('');
console.log('=== DIE WIRKUNG ===');
const W = (s, rob, z) => K.wirkung(s, rob, z);
chk('unter der Robustheit passiert nichts', W(4, 5).text === 'keine Wirkung');
chk('und es ändert den Zustand nicht',
  W(4, 5).angeschlagen === false && W(4, 5).wunden === 0);
chk('gleich der Robustheit: angeschlagen', W(5, 5).text === 'angeschlagen');
chk('drei darüber immer noch nur angeschlagen', W(8, 5).text === 'angeschlagen');
chk('vier darüber: eine Wunde', W(9, 5).neueWunden === 1, W(9, 5));
chk('acht darüber: zwei Wunden', W(13, 5).neueWunden === 2, W(13, 5));

/* Die Regel, die den Kampf traegt. */
chk('wer schon angeschlagen ist, nimmt stattdessen eine Wunde',
  W(5, 5, { angeschlagen: true }).neueWunden === 1);
chk('eine Wunde macht immer auch angeschlagen',
  W(9, 5).angeschlagen === true);
chk('Wunden zählen zum Bestand dazu',
  W(9, 5, { wunden: 1 }).wunden === 2, W(9, 5, { wunden: 1 }));

/* Statist gegen Wild Card - die zweite Stellschraube. */
chk('ein Statist ist nach einer Wunde draußen',
  W(9, 5, { extra: true }).ausserGefecht === true);
chk('ein Wild Card nicht', W(9, 5).ausserGefecht === false);
chk('ein Wild Card hält drei aus',
  W(9, 5, { wunden: 2 }).ausserGefecht === false &&
  W(9, 5, { wunden: 3 }).ausserGefecht === true);
chk('und wird dabei nicht über das Maximum gezählt',
  W(21, 5, { wunden: 2 }).wunden === 3, W(21, 5, { wunden: 2 }));
/* Virginia Dare aus dem Regelwerk, Robustheit 5: erst 7 Schaden
   (angeschlagen), dann 13 (zwei Steigerungen = zwei Wunden). */
chk('das Beispiel des Regelwerks stimmt', W(7, 5).text === 'angeschlagen' &&
  W(13, 5, { angeschlagen: true }).neueWunden === 2);

console.log('');
console.log('=== WIE VIELE WÜRFEL EIN SCHADENSWURF WIRFT ===');
const pete = R.alsFigur({ attr: { 'Stärke': 2, 'Konstitution': 2 }, fert: { 'Kämpfen': 2 } });
const saebel = R.AUSR_BY_ID['saebel'], pistole = R.AUSR_BY_ID['pistole'];
const nah = K.schadensWuerfel(pete, saebel);
chk('Nahkampf: Waffe und Stärke', nah.length === 2 &&
  nah.some(w => w.was === 'Stärke'), nah);
chk('Fernkampf: nur die Waffe',
  K.schadensWuerfel(pete, pistole).length === 1, K.schadensWuerfel(pete, pistole));
chk('ohne Waffe die bloße Stärke',
  K.schadensWuerfel(pete, null).length === 1 &&
  K.schadensWuerfel(pete, null)[0].was === 'Stärke');
chk('eine Steigerung bringt einen Würfel mehr',
  K.schadensWuerfel(pete, saebel, { steigerung: true }).length === 3);
chk('und der ist ein d6',
  K.schadensWuerfel(pete, saebel, { steigerung: true })
    .filter(w => w.was === 'Steigerung')[0].stufe === 2);
/* Beide Stellungen der Stellschraube pruefen - sonst merkt niemand,
   wenn die Hausregel sie nicht mehr erreicht. */
K.KAMPF_REGELN.schadenMitStaerke = false;
chk('als Hausregel zählt nur die Waffe',
  K.schadensWuerfel(pete, saebel).length === 1, K.schadensWuerfel(pete, saebel));
K.KAMPF_REGELN.schadenMitStaerke = true;
K.KAMPF_REGELN.wundenStatist = 3;
chk('und ein Statist hält so viel aus, wie die Regel sagt',
  W(9, 5, { extra: true }).ausserGefecht === false);
K.KAMPF_REGELN.wundenStatist = 0;
chk('zurückgestellt gilt wieder das Original',
  W(9, 5, { extra: true }).ausserGefecht === true);

console.log('');
console.log('=== GEGEN DIE ECHTEN BLÄTTER ===');
/* Pete gegen Anselm Frei - die Figuren aus der Testsitzung. */
global.alsFigur = R.alsFigur;
const N = require(path.join(BASIS, 'js/npcs.js'));
const anselm = N.nscAlsFigur(N.NSC_MANNSCHAFT['anselm']);
chk('Anselms Parade ist bekannt', R.parade(anselm) >= 2, R.parade(anselm));
chk('ein Angriff auf ihn ist rechenbar',
  typeof K.angriffsMod(R.parade(anselm)) === 'number');
const maxSchaden = 4 + 6;   // Säbel d6 + Stärke d6, ohne Ass
chk('ein guter Treffer reicht gegen seine Robustheit',
  K.wirkung(maxSchaden, R.robustheit(anselm)).text !== 'keine Wirkung');

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);
