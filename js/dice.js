// Szenenübergreifender Würfel-Feed mit Spielernamen.
//
// Läuft identisch auf karte.html UND regie.html - initDiceRoller(db) wird von
// beiden Seiten direkt nach dem erfolgreichen `db = firebase.database();`
// aufgerufen. `db` kommt als Parameter herein statt aus geteiltem Scope
// gelesen zu werden, damit es keine Rolle spielt, in welcher Reihenfolge
// die beiden Seiten ihre eigenen Skripte laden (kein TDZ-Risiko).
//
// Firebase-Pfad `diceRolls/{pushId}` (siehe KAMPAGNEN-BIBEL.md 13.3/13.6):
//   { name, count, sides, results: [...], total, ts: ServerValue.TIMESTAMP }
//
// Zeigt bewusst NUR die rohe Zahl - keine automatische Erfolgsgrad-Berechnung
// nach dem d100-Probensystem (4.1). Einordnung bleibt Sache von Spieler/SL.
//
// "Prune on read": jeder Client mit offenem Feed räumt bei jedem Snapshot
// Einträge auf, die älter als MAX_AGE_MS sind - kein Cron/Cloud-Function
// nötig. .remove() auf einen bereits entfernten Key ist ein No-Op, mehrere
// Clients können also gleichzeitig aufräumen, ohne dass sich das ins Gehege
// kommt. `ts` wird über ServerValue.TIMESTAMP gesetzt (nicht Date.now()),
// weil hier - anders als bei gmTimer, das nur die GM-Seite selbst schreibt -
// mehrere Spieler-Geräte mit potenziell abweichenden Uhren Einträge anlegen.

const DICE_MAX_AGE_MS = 90000;      // Einträge werden nach 90s aus Firebase entfernt
const DICE_VISIBLE_MS = 60000;      // Toast bleibt 60s sichtbar, bevor er ausblendet
const DICE_FADE_MS = 400;           // Fade-Dauer, passend zur bestehenden opacity-Transition
const DICE_NAME_MAX_LEN = 24;
const DICE_COUNT_MIN = 1, DICE_COUNT_MAX = 20;
const DICE_SIDES_MIN = 2, DICE_SIDES_MAX = 1000;

function initDiceRoller(db, options) {
  if (!db) return; // keine Firebase-Verbindung - Feature bleibt inert, kein Crash

  // `allowPrivate` wird nur von regie.html mit true übergeben - nur dort gibt
  // es die Checkbox "Privat würfeln". Ein privater Wurf geht NIE über
  // Firebase (diceRolls/), sondern wird nur lokal im eigenen Feed angezeigt -
  // Spieler auf karte.html bekommen ihn dadurch grundsätzlich nie zu sehen,
  // ganz ohne Firebase-Regeln/Auth dafür zu brauchen.
  const allowPrivate = !!(options && options.allowPrivate);

  // ---------- Spielername ----------
  function getSavedName() {
    return (localStorage.getItem('korsaren_playername') || '').trim() || null;
  }

  function promptForName(existing) {
    const input = window.prompt('Dein Spielername für den Würfel-Verlauf:', existing || '');
    if (input === null) return null; // abgebrochen
    const trimmed = input.trim().slice(0, DICE_NAME_MAX_LEN);
    if (!trimmed) return null;
    localStorage.setItem('korsaren_playername', trimmed);
    updateNameLabel(trimmed);
    return trimmed;
  }

  // Blockierend: liefert erst dann einen Namen, wenn einer gesetzt ist.
  // Leere/abgebrochene Eingabe -> null, Aufrufer bricht den Wurf einfach ab.
  function ensurePlayerName() {
    const saved = getSavedName();
    if (saved) return saved;
    return promptForName('');
  }

  function updateNameLabel(name) {
    if (nameLabelEl) nameLabelEl.textContent = 'Würfle als: ' + (name || '–');
  }

  // ---------- Würfel-Logik ----------
  function rollDice(count, sides) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * sides) + 1);
    }
    const total = results.reduce(function (a, b) { return a + b; }, 0);
    return { results: results, total: total };
  }

  function submitRoll(count, sides) {
    const name = ensurePlayerName();
    if (!name) return; // kein Name -> kein Wurf

    count = Math.min(DICE_COUNT_MAX, Math.max(DICE_COUNT_MIN, count));
    sides = Math.min(DICE_SIDES_MAX, Math.max(DICE_SIDES_MIN, sides));

    const rolled = rollDice(count, sides);
    const roll = { name: name, count: count, sides: sides, results: rolled.results, total: rolled.total };

    const isPrivate = allowPrivate && !!(privateCheckboxEl && privateCheckboxEl.checked);
    if (isPrivate) {
      // Bewusst KEIN Firebase-Schreibzugriff - bleibt rein lokal in diesem
      // Browser-Tab, Spieler sehen davon nichts.
      addToast(formatRollText(roll), true);
      return;
    }

    db.ref('diceRolls').push(Object.assign({}, roll, {
      ts: firebase.database.ServerValue.TIMESTAMP
    }));
  }

  // ---------- UI: Steuerung ----------
  const privateCheckboxHtml = allowPrivate
    ? '<label id="dicePrivateLabel"><input type="checkbox" id="dicePrivate"> Privat</label>'
    : '';

  const controlsEl = document.createElement('div');
  controlsEl.id = 'diceControls';
  controlsEl.innerHTML =
    '<div id="diceNameLabel" title="Namen ändern">Würfle als: –</div>' +
    '<button id="diceD100Btn" type="button">🎲 1×100</button>' +
    '<form id="diceForm">' +
    '<input id="diceCount" type="number" min="' + DICE_COUNT_MIN + '" max="' + DICE_COUNT_MAX + '" value="1">' +
    '<span>×</span>' +
    '<input id="diceSides" type="number" min="' + DICE_SIDES_MIN + '" max="' + DICE_SIDES_MAX + '" value="20">' +
    '<button type="submit">Würfeln</button>' +
    '</form>' +
    privateCheckboxHtml;
  document.body.appendChild(controlsEl);

  const privateCheckboxEl = allowPrivate ? document.getElementById('dicePrivate') : null;

  const feedEl = document.createElement('div');
  feedEl.id = 'diceFeed';
  document.body.appendChild(feedEl);

  const nameLabelEl = document.getElementById('diceNameLabel');
  updateNameLabel(getSavedName());
  nameLabelEl.addEventListener('click', function () {
    promptForName(getSavedName() || '');
  });

  document.getElementById('diceD100Btn').addEventListener('click', function () {
    submitRoll(1, 100);
  });

  document.getElementById('diceForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const count = parseInt(document.getElementById('diceCount').value, 10);
    const sides = parseInt(document.getElementById('diceSides').value, 10);
    if (isNaN(count) || isNaN(sides)) return;
    submitRoll(count, sides);
  });

  // ---------- UI: Feed (stapelbare, einzeln ausblendende Toasts) ----------
  // Bewusst KEIN Voll-Rerender bei jedem Snapshot (anders als gmTimer/charRail) -
  // jeder Toast braucht seinen eigenen, unabhängigen Fade-Timer, den ein
  // Rerender zurücksetzen würde. Deshalb child_added/child_removed statt value.
  const toastNodes = {};

  function formatRollText(roll) {
    // Probenwurf aus dem Heldenbrief: Der hoehere der beiden Wuerfe
    // gegen Ziel 4, je volle 4 darueber eine Steigerung.
    // Der Kopf dieser Datei sagt noch, der Feed zeige "bewusst NUR die rohe
    // Zahl" - das galt fuers alte W100-System, wo die Einordnung mehrdeutig
    // war. Freie Wuerfe aus der Leiste laufen weiter ueber den Zweig darunter.
    if (roll.probe && roll.band) {
      const zahl = (roll.ergebnis === undefined || roll.ergebnis === null)
        ? '' : ' (' + roll.ergebnis + ')';
      return roll.name + ' — ' + roll.probe + ': ' + roll.band + zahl;
    }
    const diceLabel = roll.count + '×' + roll.sides;
    const detail = (roll.results && roll.results.length > 1)
      ? ' (' + roll.results.join(', ') + ')'
      : '';
    return roll.name + ' würfelt ' + diceLabel + ': ' + roll.total + detail;
  }

  // Gemeinsam für Firebase-Würfe (child_added) und private, rein lokale
  // Würfe genutzt - `key` ist optional (private Würfe haben keinen
  // Firebase-Key und können daher nie per child_removed vorzeitig entfernt
  // werden, das ist bei rein lokalen Toasts kein Problem).
  function addToast(text, isPrivate, key) {
    const node = document.createElement('div');
    node.className = 'dice-toast' + (isPrivate ? ' private' : '');
    node.textContent = (isPrivate ? '🔒 ' : '') + text;
    feedEl.appendChild(node);
    if (key) toastNodes[key] = node;

    setTimeout(function () { node.classList.add('fade'); }, DICE_VISIBLE_MS);
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
      if (key) delete toastNodes[key];
    }, DICE_VISIBLE_MS + DICE_FADE_MS);
  }

  db.ref('diceRolls').on('child_added', function (snap) {
    const roll = snap.val();
    if (!roll) return;
    addToast(formatRollText(roll), false, snap.key);
  });

  db.ref('diceRolls').on('child_removed', function (snap) {
    // Ein anderer Client hat diesen Eintrag zuerst aufgeräumt - Toast sofort
    // entfernen, statt auf den eigenen (evtl. noch nicht abgelaufenen) Timer
    // zu warten, damit kein verwaister Toast stehen bleibt.
    const node = toastNodes[snap.key];
    if (node && node.parentNode) node.parentNode.removeChild(node);
    delete toastNodes[snap.key];
  });

  // ---------- Aufräumen ("prune on read") ----------
  db.ref('diceRolls').on('value', function (snap) {
    const now = Date.now();
    snap.forEach(function (child) {
      const roll = child.val();
      if (roll && roll.ts && (now - roll.ts) > DICE_MAX_AGE_MS) {
        db.ref('diceRolls/' + child.key).remove();
      }
    });
  });
}
