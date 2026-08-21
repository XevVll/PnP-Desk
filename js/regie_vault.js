// Regie-Admin, Vault-Ansicht: Szene→Orte→Ort→Interaktion als Klapp-Baum,
// zwei Notiz-Panes, Charaktere (Crew/Ghosts/Spielercharaktere) fest am
// rechten Rand. Ersetzt die alte 3-Spalten-Ansicht (Szenen/Orte/Detail).
//
// Wiederverwendet UNVERÄNDERT aus der alten regie.html: alle Firebase-Pfade
// für Trigger/Notizen/Sichtbarkeit/Varianten/Sound/Timer/Charaktere sowie
// die Kernfunktionen getAllSceneEntries/getSceneLabel/getMarkersForScene/
// fbKey/getSceneInteraktionen/resolveOrtForScene - bestehende, in Firebase
// bereits gespeicherte Sessions bleiben dadurch vollständig kompatibel.
//
// Bewusster Umfang dieser ersten Fassung: reale Interaktionen sind FLACHE
// Trigger-Listen (kein Verzweigungs-Datenmodell wie in den Mockups) - das
// wird hier 1:1 respektiert statt eine Struktur zu erzwingen, die im
// echten regie.js gar nicht existiert. Ein optionales Info-Feld pro Beat
// (siehe Mockup) ist vorbereitet (chk(), Feld "info"), aber noch bei
// keinem echten Trigger gesetzt - das wäre ein eigener, von Hendrik zu
// begleitender Inhalts-Durchgang durch alle ~40 Interaktionen.

const statusEl = document.getElementById('status');
let db = null;
let liveScene = null;
let viewState = { szene: null };
let paneA = { type: 'ort', sceneId: null, ortId: null };
let paneB = { type: 'npc', npcId: 'tom' };

const soundLinkInput = document.getElementById('soundLinkInput');
const soundLinkHint = document.getElementById('soundLinkHint');
const soundBarLabel = document.getElementById('soundBarLabel');
let soundBarScene = null;
const charCheckboxesEl = document.getElementById('charCheckboxes');
let charBarScene = null;

let openMarkersRef = null, openMarkersListener = null, openMarkersScene = null, openMarkerCounts = {};
let hiddenMarkersRef = null, hiddenMarkersListener = null, hiddenMarkersScene = null, hiddenMarkerIds = {};
let sceneRegieRef = null, sceneRegieListener = null, sceneRegieScene = null, sceneRegieSnapshot = {};
let graphStateRef = null, graphStateListener = null, graphStateScene = null, graphStateSnapshot = {};
let pendingOrtEdge = null; // { edgeId, fromNode, toNode } - rein lokal, kein Firebase-State (Erkundungs-Graph)

let extraGhosts = {};   // { [fbKey(sceneId)]: { [ghostId]: {name,rolle,verfassung,beduerfnis} } }
let extraNpcIds = {};   // { [npcId]: true }
let players = {};       // { [pcId]: {name} }
let pcRuf = {};         // { [pcId]: { [npcKey]: tier(0-4) } }
let charStatus = {};    // { [charKey]: Freitext } - siehe charKeyFor(), global statt pro Szene
let questDone = {};     // { [fbKey(sceneId)]: { [triggerId]: true } } - SL-Ermessen, Bibel 2.9
let vOpenNodes = new Set();
let vShowAdd = null;    // 'npc' | 'pc' | null

// Reihenfolge im Regie-Baum orientiert sich am tatsächlichen Handlungsablauf
// (Bibel 7.1), NICHT an der Datei-Gruppierung oder der Szenen-ID-Nummer -
// z.B. steht die Flaute ("6.1") trotz kleinerer Nummer hinter dem Spanischen
// Hafen ("7.1"), weil Bibel 7.2 die drei Wege der Verzweigung 1 in dieser
// Reihenfolge auflistet (Spanischer Hafen / Seeweg-Flaute / Schmugglernest).
// Neue Szenen hier manuell einsortieren, nicht einfach anhängen. Fehlt eine
// ID hier (vergessen bei einer künftigen Szene), taucht sie trotzdem auf -
// nur am Ende statt an der eigentlich richtigen Stelle. MUSS vor dem
// Firebase-Init weiter unten stehen (dessen catch-Zweig ruft renderAll() ->
// getAllSceneEntries() synchron auf, noch bevor eine spätere const-Deklaration
// in diesem Modul ausgeführt wäre - Temporal Dead Zone).
const SCENE_ORDER = ['1.1', '2.1', '3.1', '4.1', '5.1', '7.1', '6.1', '8.1', '9.1', '10.1', '11.1'];

// ---------- Live-Vorschau (Spieleransicht) ----------
(function () {
  const toggle = document.getElementById('previewToggle');
  const panel = document.getElementById('previewPanel');
  const frame = document.getElementById('previewFrame');
  const STORAGE_KEY = 'korsaren_regie_preview_open';
  let loaded = false;
  function setOpen(open) {
    panel.classList.toggle('open', open);
    toggle.textContent = (open ? '▼' : '▶') + ' Live-Vorschau (Spieleransicht)';
    localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
    if (open && !loaded) { frame.src = 'karte.html?preview=1'; loaded = true; }
  }
  toggle.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
  setOpen(localStorage.getItem(STORAGE_KEY) === '1');
})();

// ---------- Firebase-Verbindung ----------
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  initDiceRoller(db, { allowPrivate: true });

  db.ref('currentScene').on('value', function (snapshot) {
    liveScene = snapshot.val() || DEFAULT_SCENE;
    if (!viewState.szene) {
      viewState.szene = liveScene;
      paneA = { type: 'ort', sceneId: viewState.szene, ortId: firstOrtOf(viewState.szene) };
      vOpenNodes.add('scene:' + viewState.szene);
      vOpenNodes.add('scene:' + viewState.szene + ':orte');
    }
    statusEl.textContent = 'Verbunden — live für Spieler: ' + getSceneLabel(liveScene);
    statusEl.className = 'status connected';
    renderAll();
  }, function (err) {
    statusEl.textContent = 'Fehler beim Verbinden: ' + err.message;
    statusEl.className = 'status error';
  });

  db.ref('extraGhosts').on('value', function (s) { extraGhosts = s.val() || {}; renderAll(); });
  db.ref('extraNpcs').on('value', function (s) { extraNpcIds = s.val() || {}; renderAll(); });
  db.ref('players').on('value', function (s) { players = s.val() || {}; renderAll(); });
  db.ref('pcRuf').on('value', function (s) { pcRuf = s.val() || {}; renderAll(); });
  db.ref('charStatus').on('value', function (s) { charStatus = s.val() || {}; renderAll(); });
  db.ref('questDone').on('value', function (s) { questDone = s.val() || {}; renderAll(); });
} catch (e) {
  statusEl.textContent = 'Firebase-Konfiguration fehlt oder ist fehlerhaft. Bitte js/firebase-config.js prüfen.';
  statusEl.className = 'status error';
  viewState.szene = DEFAULT_SCENE;
  paneA = { type: 'ort', sceneId: viewState.szene, ortId: firstOrtOf(viewState.szene) };
  vOpenNodes.add('scene:' + viewState.szene);
  vOpenNodes.add('scene:' + viewState.szene + ':orte');
  renderAll();
}

function setLiveScene(sceneId) {
  if (!db) { alert('Keine Verbindung zu Firebase — js/firebase-config.js prüfen.'); return; }
  db.ref('currentScene').set(sceneId);
}

function firstOrtOf(sceneId) {
  const markers = getMarkersForScene(sceneId);
  if (!markers || markers.length === 0) return null;
  return markers[0].id;
}

function getAllSceneEntries() {
  const bySource = {};
  Object.keys(SCENES).forEach(function (id) { bySource[id] = { label: SCENES[id].label, source: 'town' }; });
  if (typeof GOLDEN_LION_SCENES !== 'undefined') {
    Object.keys(GOLDEN_LION_SCENES).forEach(function (id) { bySource[id] = { label: GOLDEN_LION_SCENES[id].label, source: 'ship' }; });
  }
  if (typeof SCHATZINSEL_SCENES !== 'undefined') {
    Object.keys(SCHATZINSEL_SCENES).forEach(function (id) { bySource[id] = { label: SCHATZINSEL_SCENES[id].label, source: 'island' }; });
  }
  if (typeof SPANISCHER_HAFEN_SCENES !== 'undefined') {
    Object.keys(SPANISCHER_HAFEN_SCENES).forEach(function (id) { bySource[id] = { label: SPANISCHER_HAFEN_SCENES[id].label, source: 'spanischer_hafen' }; });
  }
  if (typeof SCHMUGGLERNEST_SCENES !== 'undefined') {
    Object.keys(SCHMUGGLERNEST_SCENES).forEach(function (id) { bySource[id] = { label: SCHMUGGLERNEST_SCENES[id].label, source: 'schmugglernest' }; });
  }
  if (typeof ARTEFAKTHANDEL_SCENES !== 'undefined') {
    Object.keys(ARTEFAKTHANDEL_SCENES).forEach(function (id) { bySource[id] = { label: ARTEFAKTHANDEL_SCENES[id].label, source: 'artefakthandel' }; });
  }
  if (typeof RIFFINSEL_SCENES !== 'undefined') {
    Object.keys(RIFFINSEL_SCENES).forEach(function (id) { bySource[id] = { label: RIFFINSEL_SCENES[id].label, source: 'riffinsel' }; });
  }
  const ordered = SCENE_ORDER.filter(function (id) { return bySource[id]; }).map(function (id) { return Object.assign({ id: id }, bySource[id]); });
  const remaining = Object.keys(bySource).filter(function (id) { return SCENE_ORDER.indexOf(id) === -1; }).map(function (id) { return Object.assign({ id: id }, bySource[id]); });
  return ordered.concat(remaining);
}

function getSceneLabel(sceneId) {
  if (SCENES[sceneId]) return SCENES[sceneId].label;
  if (typeof GOLDEN_LION_SCENES !== 'undefined' && GOLDEN_LION_SCENES[sceneId]) return GOLDEN_LION_SCENES[sceneId].label;
  if (typeof SCHATZINSEL_SCENES !== 'undefined' && SCHATZINSEL_SCENES[sceneId]) return SCHATZINSEL_SCENES[sceneId].label;
  if (typeof SPANISCHER_HAFEN_SCENES !== 'undefined' && SPANISCHER_HAFEN_SCENES[sceneId]) return SPANISCHER_HAFEN_SCENES[sceneId].label;
  if (typeof SCHMUGGLERNEST_SCENES !== 'undefined' && SCHMUGGLERNEST_SCENES[sceneId]) return SCHMUGGLERNEST_SCENES[sceneId].label;
  if (typeof ARTEFAKTHANDEL_SCENES !== 'undefined' && ARTEFAKTHANDEL_SCENES[sceneId]) return ARTEFAKTHANDEL_SCENES[sceneId].label;
  if (typeof RIFFINSEL_SCENES !== 'undefined' && RIFFINSEL_SCENES[sceneId]) return RIFFINSEL_SCENES[sceneId].label;
  return sceneId;
}

function getMarkersForScene(sceneId) {
  if (SCENES[sceneId]) return SCENES[sceneId].markers;
  if (typeof getGoldenLionMarkers === 'function' && typeof GOLDEN_LION_SCENES !== 'undefined' && GOLDEN_LION_SCENES[sceneId]) return getGoldenLionMarkers(sceneId);
  if (typeof SCHATZINSEL_SCENES !== 'undefined' && SCHATZINSEL_SCENES[sceneId]) return SCHATZINSEL_SCENES[sceneId].markers;
  if (typeof SPANISCHER_HAFEN_SCENES !== 'undefined' && SPANISCHER_HAFEN_SCENES[sceneId]) return SPANISCHER_HAFEN_SCENES[sceneId].markers;
  if (typeof SCHMUGGLERNEST_SCENES !== 'undefined' && SCHMUGGLERNEST_SCENES[sceneId]) return SCHMUGGLERNEST_SCENES[sceneId].markers;
  if (typeof ARTEFAKTHANDEL_SCENES !== 'undefined' && ARTEFAKTHANDEL_SCENES[sceneId]) return ARTEFAKTHANDEL_SCENES[sceneId].markers;
  if (typeof RIFFINSEL_SCENES !== 'undefined' && RIFFINSEL_SCENES[sceneId]) return RIFFINSEL_SCENES[sceneId].markers;
  return [];
}

function fbKey(str) { return String(str).replace(/[.#$\[\]]/g, '-'); }

function getSceneInteraktionen(ort, sceneId) {
  const all = ort.interaktionen || {};
  return Object.keys(all).filter(function (iaId) {
    const ia = all[iaId];
    if (ia.nurSzenen && ia.nurSzenen.indexOf(sceneId) === -1) return false;
    if (ia.nichtInSzenen && ia.nichtInSzenen.indexOf(sceneId) !== -1) return false;
    return true;
  });
}

function resolveOrtForScene(ort, sceneId) {
  const override = (ort.szenenUeberschreibungen && ort.szenenUeberschreibungen[sceneId]) || {};
  return {
    personen: override.personen !== undefined ? override.personen : ort.personen,
    kurz: override.kurz !== undefined ? override.kurz : ort.kurz,
    ortHinweis: override.ortHinweis !== undefined ? override.ortHinweis : ort.ortHinweis,
    npcs: override.npcs !== undefined ? override.npcs : ort.npcs,
    interaktionen: ort.interaktionen
  };
}

function debounce(fn, ms) {
  let t = null;
  return function (...args) { clearTimeout(t); t = setTimeout(function () { fn.apply(null, args); }, ms); };
}

function saveField(path, value, hintEl) {
  if (!db || !hintEl) return;
  db.ref(path).set(value).then(function () {
    hintEl.className = 'v-save-hint saved';
    hintEl.textContent = 'gespeichert';
    setTimeout(function () { if (hintEl) { hintEl.textContent = ''; hintEl.className = 'v-save-hint'; } }, 1500);
  }).catch(function (err) {
    hintEl.className = 'v-save-hint error';
    hintEl.textContent = 'NICHT gespeichert — ' + err.message;
  });
}

function steckbriefCardsHTML(list) {
  return (list || []).map(function (p) {
    return '<div class="v-sb"><div class="v-sb-head"><span class="v-sb-name">' + (p.name || '') + '</span>' +
      (p.rolle ? '<span class="v-sb-rolle">' + p.rolle + (p.koerperlich ? ' · ✊ körperlich' : '') + '</span>' : '') + '</div>' +
      (p.verfassung ? '<div class="v-sb-line"><b>Verfassung</b> ' + p.verfassung + '</div>' : '') +
      (p.beduerfnis ? '<div class="v-sb-line"><b>Bedürfnis</b> ' + p.beduerfnis + '</div>' : '') +
      '</div>';
  }).join('');
}

// ---------- Live-Präsenz & Sichtbarkeit (unverändert aus der alten Ansicht) ----------
function attachOpenMarkersListener(sceneId) {
  if (sceneId === openMarkersScene) return;
  if (openMarkersRef && openMarkersListener) openMarkersRef.off('value', openMarkersListener);
  openMarkersScene = sceneId; openMarkerCounts = {};
  if (!db || !sceneId) return;
  openMarkersRef = db.ref('openMarkers/' + fbKey(sceneId));
  openMarkersListener = openMarkersRef.on('value', function (snap) {
    const data = snap.val() || {}; openMarkerCounts = {};
    Object.keys(data).forEach(function (markerId) { openMarkerCounts[markerId] = Object.keys(data[markerId] || {}).length; });
    renderTree();
  });
}
function attachHiddenMarkersListener(sceneId) {
  if (sceneId === hiddenMarkersScene) return;
  if (hiddenMarkersRef && hiddenMarkersListener) hiddenMarkersRef.off('value', hiddenMarkersListener);
  hiddenMarkersScene = sceneId; hiddenMarkerIds = {};
  if (!db || !sceneId) return;
  hiddenMarkersRef = db.ref('hiddenMarkersLive/' + fbKey(sceneId));
  hiddenMarkersListener = hiddenMarkersRef.on('value', function (snap) { hiddenMarkerIds = snap.val() || {}; renderAll(); });
}
function attachSceneRegieListener(sceneId) {
  if (sceneId === sceneRegieScene) return;
  if (sceneRegieRef && sceneRegieListener) sceneRegieRef.off('value', sceneRegieListener);
  sceneRegieScene = sceneId; sceneRegieSnapshot = {};
  if (!db || !sceneId) return;
  sceneRegieRef = db.ref('regie/' + fbKey(sceneId));
  sceneRegieListener = sceneRegieRef.on('value', function (snap) { sceneRegieSnapshot = snap.val() || {}; renderAll(); });
}

// ---------- Erkundungs-Graph (js/exploration_graphs.js) ----------
// SL-Sicht auf graphState/{sceneId} (currentNode, votes). Spieler stimmen
// live über karte.html ab (mySessionId, gleiches Muster wie openMarkers) -
// die eigentliche Bewegung (currentNode setzen, Marker aufdecken) passiert
// aber ausschließlich hier, damit ein einzelner Spieler-Client nicht
// direkt den Szenenfortschritt bestimmen kann. Variablen-Deklaration ganz
// oben in der Datei (vor dem Firebase-Init-catch-Zweig, TDZ, siehe dortiger
// Kommentar) - hier nur die Funktionen.
function attachGraphStateListener(sceneId) {
  if (sceneId === graphStateScene) return;
  if (graphStateRef && graphStateListener) graphStateRef.off('value', graphStateListener);
  graphStateScene = sceneId; graphStateSnapshot = {}; pendingOrtEdge = null;
  if (!db || !sceneId || typeof getExplorationGraph !== 'function' || !getExplorationGraph(sceneId)) return;
  graphStateRef = db.ref('graphState/' + fbKey(sceneId));
  graphStateListener = graphStateRef.on('value', function (snap) {
    graphStateSnapshot = snap.val() || {};
    maybeAutoAdvance(sceneId);
    renderSceneHead();
  });
}

function currentGraphNodeId(sceneId) {
  const g = getExplorationGraph(sceneId);
  if (!g) return null;
  return graphStateSnapshot.currentNode || g.startNode;
}

// TESTEN (Hendriks Anfrage, 2026-08-20): schon ab EINER Stimme automatisch
// weiterziehen, statt auf eine echte Mehrheit zu warten - es gibt aktuell
// keine verlässliche Grundlage dafür, wie viele Spieler insgesamt aktiv
// sind (siehe CLAUDE.md-Notiz zum Erkundungs-Graphen). Später ggf. erhöhen
// oder an eine echte Präsenz-Zahl koppeln.
const AUTO_ADVANCE_THRESHOLD = 1;

// Prüft nach jeder Stimmen-Änderung, ob eine Option (Kante ODER die
// synthetische Zurück-Option, siehe getPlayableOptions) die Schwelle
// erreicht hat, und zieht dann automatisch weiter - ruft dafür einfach
// graphSelectEdge auf, dieselbe Funktion wie ein manueller SL-Klick.
// Stimmen, die nicht zu einer tatsächlich vom AKTUELLEN Knoten aus
// wählbaren Option gehören (z.B. kurzzeitig veraltete Stimmen während
// eines Übergangs), werden ignoriert.
function maybeAutoAdvance(sceneId) {
  if (pendingOrtEdge) return; // SL löst gerade eine Probe auf, nicht dazwischenfunken
  const currentId = currentGraphNodeId(sceneId);
  const history = graphStateSnapshot.history || [];
  const optionIds = getPlayableOptions(sceneId, currentId, history).map(function (e) { return e.id; });
  if (!optionIds.length) return;
  const votes = graphStateSnapshot.votes || {};
  const voteCounts = {};
  Object.keys(votes).forEach(function (sid) {
    const eid = votes[sid];
    if (optionIds.indexOf(eid) === -1) return;
    voteCounts[eid] = (voteCounts[eid] || 0) + 1;
  });
  const leadingEdgeId = Object.keys(voteCounts).find(function (eid) { return voteCounts[eid] >= AUTO_ADVANCE_THRESHOLD; });
  if (leadingEdgeId) graphSelectEdge(sceneId, leadingEdgeId);
}

// Bewegt die Gruppe vorwärts zu toNodeId und hängt den bisherigen Knoten an
// graphState/{szene}/history an - Grundlage für graphGoBack(). Wird auch
// von graphResolveOrt() bei Erfolg genutzt (Ort-Ankunft zählt als normale
// Bewegung).
function graphAdvance(sceneId, toNodeId) {
  if (!db) return;
  pendingOrtEdge = null;
  const fromNodeId = currentGraphNodeId(sceneId);
  const history = (graphStateSnapshot.history || []).concat([fromNodeId]);
  db.ref('graphState/' + fbKey(sceneId) + '/currentNode').set(toNodeId);
  db.ref('graphState/' + fbKey(sceneId) + '/history').set(history);
  db.ref('graphState/' + fbKey(sceneId) + '/votes').remove();
}

// Hendriks Vorgabe: Spieler sollen IMMER umkehren können. Springt zum
// letzten Eintrag in history zurück (kein Fund-/Probe-Gate - der Ort war
// ja schon besucht) und kürzt history um diesen Eintrag, sodass erneutes
// Zurückgehen weiter rückwärts durch den bisherigen Weg führt.
function graphGoBack(sceneId) {
  if (!db) return;
  const history = (graphStateSnapshot.history || []).slice();
  if (!history.length) return;
  const prevNode = history.pop();
  pendingOrtEdge = null;
  db.ref('graphState/' + fbKey(sceneId) + '/currentNode').set(prevNode);
  db.ref('graphState/' + fbKey(sceneId) + '/history').set(history);
  db.ref('graphState/' + fbKey(sceneId) + '/votes').remove();
}

// Klick auf eine Option im Adminpanel (Kante ODER die synthetische Zurück-
// Option). Führt eine "ort"-Kante zu einem noch nicht aufgedeckten Ort,
// wird statt direkter Navigation erst die Erfolg/Misserfolg-Auflösung
// angezeigt (siehe graphResolveOrt) - bereits aufgedeckte "ort"-Knoten
// verhalten sich wie eine normale Gabelung.
function graphSelectEdge(sceneId, edgeId) {
  if (edgeId === BACK_EDGE_ID) { graphGoBack(sceneId); return; }
  const g = getExplorationGraph(sceneId);
  if (!g) return;
  const edge = g.edges[edgeId];
  if (!edge) return;
  const targetNode = g.nodes[edge.to];
  if (targetNode && targetNode.type === 'ort' && targetNode.ortId && hiddenMarkerIds[targetNode.ortId]) {
    pendingOrtEdge = { edgeId: edgeId, fromNode: edge.from, toNode: edge.to };
    renderSceneHead();
    return;
  }
  graphAdvance(sceneId, edge.to);
}

function graphResolveOrt(sceneId, success) {
  if (!pendingOrtEdge || !db) return;
  const toNode = pendingOrtEdge.toNode;
  if (success) {
    const node = getGraphNode(sceneId, toNode);
    if (node && node.ortId) db.ref('hiddenMarkersLive/' + fbKey(sceneId) + '/' + node.ortId).remove();
    graphAdvance(sceneId, toNode);
  } else {
    pendingOrtEdge = null;
    db.ref('graphState/' + fbKey(sceneId) + '/votes').remove();
    renderSceneHead();
  }
}

function renderGraphPanelHTML(sceneId) {
  const g = (typeof getExplorationGraph === 'function') ? getExplorationGraph(sceneId) : null;
  if (!g) return '';
  const currentId = currentGraphNodeId(sceneId);
  const node = getGraphNode(sceneId, currentId);
  if (!node) return '';

  const votes = graphStateSnapshot.votes || {};
  const voteCounts = {};
  Object.keys(votes).forEach(function (sid) { const eid = votes[sid]; voteCounts[eid] = (voteCounts[eid] || 0) + 1; });
  const totalVotes = Object.keys(votes).length;
  const maxVotes = Math.max.apply(null, Object.keys(voteCounts).map(function (k) { return voteCounts[k]; }).concat([0]));

  let html = '<div class="sh-graph"><div class="sh-graph-label">🧭 Erkundung — ' + node.label + '</div>';

  if (pendingOrtEdge) {
    const targetNode = getGraphNode(sceneId, pendingOrtEdge.toNode);
    html += '<div class="sh-graph-ort-probe">' +
      '<div class="sh-graph-ort-title">Versuch: ' + targetNode.label + ' <span class="sh-graph-probe">(Probe: ' + targetNode.probe + ')</span></div>' +
      '<div class="sh-graph-ort-text"><b>Erfolg:</b> ' + targetNode.erfolgText + '</div>' +
      '<div class="sh-graph-ort-text"><b>Misserfolg:</b> ' + targetNode.misserfolgText + '</div>' +
      '<div class="sh-graph-ort-buttons">' +
      '<button class="sh-graph-btn sh-graph-btn-erfolg" onclick="graphResolveOrt(\'' + sceneId + '\', true)">✓ Erfolg — aufdecken</button>' +
      '<button class="sh-graph-btn sh-graph-btn-misserfolg" onclick="graphResolveOrt(\'' + sceneId + '\', false)">✗ Misserfolg</button>' +
      '</div></div>';
  } else if (node.type === 'ereignis') {
    html += '<div class="sh-graph-ereignis-text">' + node.text + (node.probe ? ' <i>(' + node.probe + ')</i>' : '') + '</div>';
    const forwardEdge = getOutgoingEdges(sceneId, currentId)[0];
    if (forwardEdge) html += '<button class="sh-graph-btn" onclick="graphSelectEdge(\'' + sceneId + '\', \'' + forwardEdge.id + '\')">Weiter</button>';
    if ((graphStateSnapshot.history || []).length) {
      html += ' <button class="sh-graph-btn sh-graph-btn-back" onclick="graphSelectEdge(\'' + sceneId + '\', \'' + BACK_EDGE_ID + '\')">↩ Zurück</button>';
    }
  } else {
    const options = getPlayableOptions(sceneId, currentId, graphStateSnapshot.history || []);
    if (!options.length) {
      html += '<div class="sh-graph-ereignis-text">Kein weiterer Weg von hier bekannt.</div>';
    } else {
      html += '<div class="sh-graph-options">';
      options.forEach(function (e) {
        const count = voteCounts[e.id] || 0;
        const isLeader = count > 0 && count === maxVotes;
        html += '<button class="sh-graph-btn sh-graph-option' + (isLeader ? ' sh-graph-leader' : '') + (e.isBack ? ' sh-graph-btn-back' : '') + '" onclick="graphSelectEdge(\'' + sceneId + '\', \'' + e.id + '\')">' +
          '<span class="sh-graph-hinweis">' + (e.isBack ? '↩ ' : '') + e.hinweis + '</span>' +
          '<span class="sh-graph-votes">' + count + ' Stimme' + (count === 1 ? '' : 'n') + '</span></button>';
      });
      html += '</div>';
      if (totalVotes) html += '<div class="sh-graph-total">' + totalVotes + ' Stimme(n) insgesamt — jede Option ist direkt anklickbar, unabhängig von der Mehrheit.</div>';
    }
  }
  html += '</div>';
  return html;
}

function toggleQuestDone(sceneId, triggerId) {
  if (!db) return;
  const ref = db.ref('questDone/' + fbKey(sceneId) + '/' + triggerId);
  const isDone = !!(questDone[fbKey(sceneId)] && questDone[fbKey(sceneId)][triggerId]);
  if (isDone) ref.remove(); else ref.set(true);
}
function toggleMarkerVisibility(sceneId, markerId) {
  if (!db) return;
  const ref = db.ref('hiddenMarkersLive/' + fbKey(sceneId) + '/' + markerId);
  if (hiddenMarkerIds[markerId]) ref.remove(); else ref.set(true);
}

// ---------- Text-Suche für automatische Erwähnungen (Backlinks) ----------
function textOfIa(ort, iaId) {
  const ia = ort.interaktionen[iaId];
  let t = ia.title + ' ' + ia.kurz + ' ' + ia.details;
  if (ia.trigger) t += ' ' + ia.trigger.map(function (x) { return x.label; }).join(' ');
  return t;
}
function slugify(s) { return (String(s).toLowerCase().replace(/[^a-z0-9äöüß]+/g, '_').replace(/^_+|_+$/g, '')) || ('x' + Date.now()); }
function ghostsOfScene(sceneId) {
  const sr = (typeof SZENEN_REGIE !== 'undefined') ? SZENEN_REGIE[sceneId] : null;
  const base = (sr && sr.ghosts) ? sr.ghosts.map(function (g) { return Object.assign({ id: slugify(g.name), sceneId: sceneId }, g); }) : [];
  const extra = extraGhosts[fbKey(sceneId)] || {};
  const extraList = Object.keys(extra).map(function (gid) { return Object.assign({ id: gid, sceneId: sceneId }, extra[gid]); });
  return base.concat(extraList);
}
function ghostById(sceneId, ghostId) { return ghostsOfScene(sceneId).find(function (g) { return g.id === ghostId; }); }
function npcRecord(npcId) { return CREW.find(function (c) { return c.id === npcId; }) || MANIFEST_EXTRA.find(function (m) { return m.id === npcId; }); }
function trackableNpcs() {
  return CREW.concat(MANIFEST_EXTRA.filter(function (m) { return extraNpcIds[m.id]; })).concat([{ id: 'crew_allgemein', name: 'Die Crew allgemein' }]);
}
// Backlinks für eine Interaktion: welche Crew/Zusatz-NPCs/Ghosts der Szene
// im Interaktionstext namentlich vorkommen - automatisch berechnet, nicht
// von Hand gepflegt (wie Obsidians "Linked mentions").
function backlinksForIa(ort, sceneId, iaId) {
  const text = textOfIa(ort, iaId);
  const crewHits = CREW.filter(function (c) { return text.indexOf(c.name.split(' ')[0]) !== -1 || text.indexOf(c.name) !== -1; })
    .map(function (c) { return { label: c.name, sub: '👤 Crew', ref: { type: 'npc', npcId: c.id } }; });
  const extraHits = MANIFEST_EXTRA.filter(function (m) { return extraNpcIds[m.id] && text.indexOf(m.name) !== -1; })
    .map(function (m) { return { label: m.name, sub: '👤 Crew', ref: { type: 'npc', npcId: m.id } }; });
  const ghostHits = ghostsOfScene(sceneId).filter(function (g) { return text.indexOf(g.name) !== -1; })
    .map(function (g) { return { label: g.name, sub: '👻 Ghost', ref: { type: 'ghost', sceneId: sceneId, ghostId: g.id } }; });
  return crewHits.concat(extraHits, ghostHits);
}
// Backlinks für einen NPC/Crew-Namen: alle Interaktionen (über ALLE Orte
// hinweg, campaignweit, da Crew wiederkehrt) die ihn erwähnen.
// Findet für einen Ort/Interaktion-Treffer eine Szene, in der dieser Ort
// tatsächlich vorkommt UND die Interaktion dort sichtbar ist (ein Ort kann
// über mehrere Szenen hinweg auftauchen, z.B. "achterdeck" in "2.1"/"3.1").
function firstSceneShowingIa(ortId, ort, iaId) {
  let found = null;
  getAllSceneEntries().some(function (entry) {
    const markers = getMarkersForScene(entry.id);
    if (!markers.some(function (mk) { return mk.id === ortId; })) return false;
    const resolved = resolveOrtForScene(ort, entry.id);
    if (getSceneInteraktionen(resolved, entry.id).indexOf(iaId) === -1) return false;
    found = entry.id;
    return true;
  });
  return found;
}
function iaMentioningNpc(npcName) {
  const hits = [];
  Object.keys(ORTE).forEach(function (ortId) {
    const ort = ORTE[ortId];
    Object.keys(ort.interaktionen || {}).forEach(function (iaId) {
      if (textOfIa(ort, iaId).indexOf(npcName) === -1) return;
      const sceneId = firstSceneShowingIa(ortId, ort, iaId);
      const marker = sceneId ? (getMarkersForScene(sceneId) || []).find(function (mk) { return mk.id === ortId; }) : null;
      hits.push({ ortId: ortId, iaId: iaId, sceneId: sceneId, title: ort.interaktionen[iaId].title, ortTitle: marker ? marker.title : ortId });
    });
  });
  return hits;
}
function iaMentioningGhost(sceneId, ghostId) {
  const g = ghostById(sceneId, ghostId); if (!g) return [];
  const hits = [];
  getMarkersForScene(sceneId).forEach(function (marker) {
    const ortRaw = ORTE[marker.id]; if (!ortRaw) return;
    const ort = resolveOrtForScene(ortRaw, sceneId);
    getSceneInteraktionen(ort, sceneId).forEach(function (iaId) {
      if (textOfIa(ort, iaId).indexOf(g.name) !== -1) hits.push({ sceneId: sceneId, ortId: marker.id, iaId: iaId, title: ort.interaktionen[iaId].title, ortTitle: marker.title });
    });
  });
  return hits;
}

// ---------- Charaktere hinzufügen (aus dem Crew-Manifest bzw. frei anlegen) ----------
function vToggleAdd(kind) { vShowAdd = vShowAdd === kind ? null : kind; renderAll(); }
function vAddManifest(npcId) { if (db) db.ref('extraNpcs/' + npcId).set(true); }
function vSubmitGhost(form, sceneId) {
  const fd = new FormData(form);
  const name = (fd.get('name') || '').trim();
  if (!name || !db) return;
  const gid = 'g_' + slugify(name) + '_' + Math.floor(Math.random() * 1000);
  db.ref('extraGhosts/' + fbKey(sceneId) + '/' + gid).set({
    name: name,
    rolle: (fd.get('rolle') || '').trim() || '—',
    verfassung: (fd.get('verfassung') || '').trim() || '—',
    beduerfnis: (fd.get('beduerfnis') || '').trim() || '—'
  });
  vShowAdd = null; renderAll();
}
function vSubmitPc(form) {
  const fd = new FormData(form);
  const name = (fd.get('name') || '').trim();
  if (!name || !db) return;
  const pid = 'pc_' + slugify(name) + '_' + Math.floor(Math.random() * 1000);
  db.ref('players/' + pid).set({ name: name });
  vShowAdd = null; renderAll();
}
function nudgePcRuf(pcId, npcKey, tier) { if (db) db.ref('pcRuf/' + pcId + '/' + npcKey).set(tier); }
function getPcRuf(pcId, npcKey) { const v = pcRuf[pcId] && pcRuf[pcId][npcKey]; return v === undefined ? 0 : v; }
function rufTrackHtml(pcId, npcKey, tier) {
  return '<span class="v-ruf-track">' + RUF_TIERS.map(function (_, i) {
    return '<button class="v-ruf-seg' + (i <= tier ? ' on' : '') + '" onclick="nudgePcRuf(\'' + pcId + '\',\'' + npcKey + '\',' + i + ')" title="' + RUF_TIERS[i] + '"></button>';
  }).join('') + '</span>';
}

// ---------- Baum: Szene → Orte → Ort → Interaktionen ----------
function vToggleNode(key) { vOpenNodes.has(key) ? vOpenNodes.delete(key) : vOpenNodes.add(key); renderAll(); }
// Ort-Zeile im Baum hat zwei Funktionen in einem Klick: auf-/zuklappen UND
// die Übersicht (Ort-Notiz) in Pane A zeigen - ersetzt die vorherige
// separate "📄 Übersicht"-Datei darunter, ein Klick auf den Ordner selbst
// reicht jetzt.
function vOpenOrtFolder(key, sceneId, ortId) {
  vOpenNodes.has(key) ? vOpenNodes.delete(key) : vOpenNodes.add(key);
  paneA = { type: 'ort', sceneId: sceneId, ortId: ortId };
  // viewState.szene folgt der im Baum angeklickten Szene (nicht nur der
  // live-geschalteten) - sonst bleiben Werkzeugleiste (Sound/Charaktere)
  // und die Live-Listener (hiddenMarkersLive/openMarkers/regie) auf der
  // Szene hängen, die beim Laden der Seite gerade live war (Hendriks
  // Bug-Report: "Werkzeuge lassen sich bei einzelnen Szenen nicht mehr
  // anpassen").
  viewState.szene = sceneId;
  renderAll();
}
// Gleiches Prinzip wie vOpenOrtFolder, eine Ebene höher: Klick auf die
// Szenen-Zeile selbst klappt auf UND zeigt die Szenen-Hauptseite (Ziel/
// Stimmung/Ghosts) in Pane A - vorher passierte beim Klick nur das Aufklappen,
// keine Übersicht öffnete sich (Hendriks Bug-Report).
function vOpenSceneFolder(key, sceneId) {
  vOpenNodes.has(key) ? vOpenNodes.delete(key) : vOpenNodes.add(key);
  paneA = { type: 'scene', sceneId: sceneId };
  viewState.szene = sceneId; // siehe Kommentar in vOpenOrtFolder
  renderAll();
}
function paneMatches(paneRef, ref) {
  if (!paneRef || paneRef.type !== ref.type) return false;
  return Object.keys(ref).every(function (k) { return paneRef[k] === ref[k]; });
}
function vFileRow(ref, label, icon, level) {
  // Bewusst kein "in Pane B öffnen"-Knopf hier - der Baum öffnet immer in
  // Pane A, Pane B ist für Charaktere reserviert (über die rechte Leiste),
  // plus die Backlink-Buttons in den Notizen selbst.
  const inA = paneMatches(paneA, ref), inB = paneMatches(paneB, ref);
  return '<div class="v-file lvl' + level + (inA ? ' inA' : '') + (inB ? ' inB' : '') + '" onclick="paneA=' + JSON.stringify(ref).replace(/"/g, '&quot;') + '; renderAll();">' +
    '<span class="v-file-icon">' + icon + '</span><span class="v-file-label">' + label + '</span>' +
    '</div>';
}
function renderTree() {
  attachOpenMarkersListener(viewState.szene);
  attachHiddenMarkersListener(viewState.szene);
  attachSceneRegieListener(viewState.szene);
  attachGraphStateListener(viewState.szene);
  const el = document.getElementById('v-tree');
  let html = '<div class="v-tree-head">VAULT</div>';
  getAllSceneEntries().forEach(function (entry) {
    const sceneId = entry.id;
    const sKey = 'scene:' + sceneId, oKey = sKey + ':orte', sOpen = vOpenNodes.has(sKey);
    const sceneActive = paneMatches(paneA, { type: 'scene', sceneId: sceneId });
    html += '<div class="v-node lvl0' + (sceneActive ? ' active' : '') + '" onclick="vOpenSceneFolder(\'' + sKey + '\',\'' + sceneId + '\')"><span class="v-caret">' + (sOpen ? '▾' : '▸') + '</span>' +
      (sceneId === liveScene ? '<span class="v-live-dot" title="aktuell live"></span>' : '<span style="width:6px"></span>') +
      '<span class="v-file-label">' + entry.label + '</span>' +
      '<button class="v-live-btn' + (sceneId === liveScene ? ' is-live' : '') + '" style="margin-left:auto" onclick="event.stopPropagation(); setLiveScene(\'' + sceneId + '\')">' + (sceneId === liveScene ? 'live' : 'live setzen') + '</button></div>';
    if (!sOpen) return;
    const oOpen = vOpenNodes.has(oKey);
    html += '<div class="v-node lvl1" onclick="vToggleNode(\'' + oKey + '\')"><span class="v-caret">' + (oOpen ? '▾' : '▸') + '</span><span class="v-file-icon">📁</span><span class="v-file-label">Orte</span></div>';
    if (!oOpen) return;
    getMarkersForScene(sceneId).forEach(function (marker) {
      const ortRaw = ORTE[marker.id] || { interaktionen: {} };
      const ort = resolveOrtForScene(ortRaw, sceneId);
      const iaKeys = getSceneInteraktionen(ort, sceneId);
      const lKey = oKey + ':' + marker.id, lOpen = vOpenNodes.has(lKey);
      const openCount = openMarkerCounts[marker.id] || 0;
      const hidden = !!hiddenMarkerIds[marker.id];
      const ortActive = paneMatches(paneA, { type: 'ort', sceneId: sceneId, ortId: marker.id });
      html += '<div class="v-node lvl2' + (ortActive ? ' active' : '') + '" onclick="vOpenOrtFolder(\'' + lKey + '\',\'' + sceneId + '\',\'' + marker.id + '\')" style="opacity:' + (hidden ? '.55' : '1') + '"><span class="v-caret">' + (lOpen ? '▾' : '▸') + '</span><span class="v-file-icon">📁</span><span class="v-file-label">' + marker.title + '</span>' +
        (openCount > 0 ? '<span class="v-tag" style="margin-left:auto">' + openCount + '</span>' : '') + '</div>';
      if (!lOpen) return;
      iaKeys.forEach(function (iaId) {
        html += vFileRow({ type: 'ia', sceneId: sceneId, ortId: marker.id, iaId: iaId }, ort.interaktionen[iaId].title, '📄', 3);
      });
    });
  });
  el.innerHTML = html;
}

// ---------- Notiz-Panes ----------
function paneLabel(ref) {
  if (ref.type === 'ia') { const ort = ORTE[ref.ortId]; return '📄 ' + ((ort && ort.interaktionen[ref.iaId]) ? ort.interaktionen[ref.iaId].title : '?'); }
  if (ref.type === 'scene') return '🎬 ' + getSceneLabel(ref.sceneId);
  if (ref.type === 'ort') { const marker = (getMarkersForScene(ref.sceneId) || []).find(function (m) { return m.id === ref.ortId; }); return '📄 ' + (marker ? marker.title : ref.ortId); }
  if (ref.type === 'npc') { const n = npcRecord(ref.npcId); return '👤 ' + (n ? n.name : '?'); }
  if (ref.type === 'ghost') { const g = ghostById(ref.sceneId, ref.ghostId); return '👻 ' + (g ? g.name : '?'); }
  if (ref.type === 'pc') { return '🎭 ' + ((players[ref.pcId] || {}).name || '?'); }
  return '?';
}

// Ein Trigger-Punkt = Checkbox + Label, exakt wie im bisherigen Admin
// (regie/{szene}/{ort}/interaktionen/{iaId}/trigger/{triggerId} = bool).
// Notizen liegen weiterhin EINE gemeinsame Ebene höher, pro Interaktion
// (nicht pro Trigger) - siehe renderIaNote() - genau wie im alten Schema.
//
// "info" (optional, viertes Argument) ist der Lesetext-Ausschnitt, der zu
// GENAU diesem Punkt gehört - steht direkt darunter, statt gesammelt als
// ein großer Block oben in der Notiz. Fehlt "info" (noch nicht für jede
// der ~40 echten Interaktionen aufgeteilt), zeigt renderIaNote() als
// Rückfall weiterhin den kompletten "details"-Text oben an.
// basePath ist der Interaktions-Pfad (.../interaktionen/{iaId}), t das
// Trigger-Objekt ({id,label,info?}). Zwei Firebase-Werte je Punkt:
//   .../trigger/{id}          - bool, ob ausgelöst (wie bisher)
//   .../trigger_notizen/{id}  - freier Kommentar GENAU zu diesem Punkt
// (zusätzlich zur bestehenden, interaktionsweiten "notizen" darunter).
function chk(basePath, t, fired, noteVal) {
  const triggerPath = basePath + '/trigger/' + t.id;
  const notePath = basePath + '/trigger_notizen/' + t.id;
  const key = 'tn_' + notePath.replace(/[^a-z0-9]/gi, '_');
  const noteOpen = !!(noteVal && noteVal.trim());
  return '<div class="v-chk' + (fired ? ' on' : '') + '">' +
    '<button class="box' + (fired ? ' on' : '') + '" onclick="vToggleTrigger(\'' + triggerPath + '\',' + (fired ? 'false' : 'true') + ')">' + (fired ? '✓' : '') + '</button>' +
    '<div class="v-chk-main">' +
      '<div class="v-chk-lbl-row"><span class="lbl">' + t.label + '</span>' +
      '<button class="pencil' + (noteOpen ? ' has' : '') + '" onclick="vToggleEl(\'' + key + '\')" title="Kommentar zu diesem Punkt">✎</button></div>' +
      (t.info ? '<div class="v-chk-info">' + t.info + '</div>' : '') +
      '<div class="v-chk-note" id="' + key + '" style="display:' + (noteOpen ? 'block' : 'none') + '">' +
        '<textarea class="v-note-field" placeholder="Kommentar zu diesem Punkt…" data-path="' + notePath + '">' + (noteVal || '') + '</textarea><div class="v-save-hint"></div>' +
      '</div>' +
    '</div></div>';
}
function vToggleEl(id) { const el = document.getElementById(id); if (el) el.style.display = (el.style.display === 'none' ? 'block' : 'none'); }
function vToggleTrigger(path, val) {
  if (!db) return;
  db.ref(path).set(val).then(renderAll).catch(function (err) { alert('NICHT gespeichert — ' + err.message); });
}
function bindNoteFields(container) {
  container.querySelectorAll('textarea[data-path]').forEach(function (ta) {
    const hint = ta.nextElementSibling;
    const save = debounce(function () { saveField(ta.dataset.path, ta.value, hint); }, 600);
    ta.addEventListener('input', save);
    ta.addEventListener('blur', function () { saveField(ta.dataset.path, ta.value, hint); });
  });
}

// Szenen-Hauptseite: Ziel/Stimmung/Ghosts/aktive Aufträge auf einen Blick,
// analog zu renderOrtNote eine Ebene höher. Zeigt inhaltlich dasselbe wie
// der immer sichtbare #sceneHead oben (Bibel 2.9), aber gezielt für die im
// Baum angeklickte Szene statt nur für viewState.szene (die "live"/zuletzt
// gewählte Szene) - man kann so eine ANDERE Szene als die gerade laufende
// vorab durchlesen, ohne sie live zu schalten.
function renderSceneNote(ref, target) {
  const sceneId = ref.sceneId;
  const sr = (typeof SZENEN_REGIE !== 'undefined') ? SZENEN_REGIE[sceneId] : null;
  const ghosts = ghostsOfScene(sceneId);
  const quests = activeQuestsForScene(sceneId, (sceneId === sceneRegieScene) ? sceneRegieSnapshot : {});
  const dynPath = 'regie/' + fbKey(sceneId) + '/szenenNotizen';

  let html = '<h1 class="v-h1">' + getSceneLabel(sceneId) + '</h1>';
  if (sr && sr.uebergeordnetesZiel) html += '<div class="v-callout"><div class="v-callout-title">🎯 Übergeordnetes Ziel</div>' + sr.uebergeordnetesZiel + '</div>';
  if (sr && sr.stimmung) html += '<div class="v-callout"><div class="v-callout-title">Stimmung</div>' + sr.stimmung + '</div>';
  if (quests.length) {
    html += '<div class="v-callout"><div class="v-callout-title">📜 Aktive Aufträge (' + quests.length + ')</div>' +
      quests.map(function (q) { return '<div class="v-sb"><div class="v-sb-line"><b>Was</b> ' + q.was + '</div><div class="v-sb-line"><b>Warum</b> ' + q.warum + '</div><div class="v-sb-line">' + q.ortTitle + ' — ' + q.iaTitle + '</div></div>'; }).join('') +
      '</div>';
  }
  if (ghosts.length) html += '<div class="v-callout"><div class="v-callout-title">Ghosts (' + ghosts.length + ')</div>' + steckbriefCardsHTML(ghosts) + '</div>';
  html += '<div class="v-callout"><div class="v-callout-title">Notizen zur Szene</div><textarea class="v-note-field" placeholder="z.B. wie die Szene tatsächlich verlief, Abweichungen vom Text…" data-path="' + dynPath + '"></textarea><div class="v-save-hint"></div></div>';

  target.innerHTML = html;
  bindNoteFields(target);
  if (!db) return;
  db.ref(dynPath).once('value').then(function (snap) {
    if (typeof snap.val() === 'string') {
      const ta = target.querySelector('textarea[data-path="' + dynPath + '"]');
      if (ta) ta.value = snap.val();
    }
  });
}

function renderOrtNote(ref, target) {
  const sceneId = ref.sceneId, ortId = ref.ortId;
  const marker = (getMarkersForScene(sceneId) || []).find(function (m) { return m.id === ortId; });
  const ortRaw = ORTE[ortId] || { personen: '', kurz: '', interaktionen: {} };
  const ort = resolveOrtForScene(ortRaw, sceneId);
  const hidden = !!hiddenMarkerIds[ortId];
  const dynPath = 'regie/' + fbKey(sceneId) + '/' + fbKey(ortId);

  let html = '<h1 class="v-h1">' + (marker ? marker.title : ortId) +
    '<button class="v-vis-btn' + (hidden ? ' is-hidden' : '') + '" onclick="toggleMarkerVisibility(\'' + sceneId + '\',\'' + ortId + '\')">' + (hidden ? 'ausgeblendet' : 'sichtbar') + '</button></h1>';
  html += '<dl class="v-prop"><dt>szene</dt><dd>' + getSceneLabel(sceneId) + '</dd>' + (ort.personen ? '<dt>personen</dt><dd>' + ort.personen + '</dd>' : '') + '</dl>';
  if (ort.ortHinweis) html += '<div class="v-callout hinweis"><div class="v-callout-title">Hinweis (Regie-Referenz)</div>' + ort.ortHinweis + '</div>';
  if (ort.npcs && ort.npcs.length) html += '<div class="v-callout"><div class="v-callout-title">Vor Ort</div>' + steckbriefCardsHTML(ort.npcs) + '</div>';
  if (marker && marker.variants) html += '<div class="v-callout"><div class="v-callout-title">Aktives Bild (unabhängig von Szene/Trigger)</div><div id="v-variant-target"></div></div>';
  html += '<div class="v-callout"><div class="v-callout-title">Notizen zum Ort</div><textarea class="v-note-field" placeholder="z.B. allgemeine Stimmung, Vorfälle ohne Bezug zu einer einzelnen Interaktion…" data-path="' + dynPath + '/ortNotizen"></textarea><div class="v-save-hint"></div></div>';

  target.innerHTML = html;
  bindNoteFields(target);
  if (marker && marker.variants) renderVariantButtons(marker, target.querySelector('#v-variant-target'));

  if (!db) return;
  db.ref(dynPath + '/ortNotizen').once('value').then(function (snap) {
    if (typeof snap.val() === 'string') {
      const ta = target.querySelector('textarea[data-path="' + dynPath + '/ortNotizen"]');
      if (ta) ta.value = snap.val();
    }
  });
}

// Rede-Bausteine (Bibel 2.9, "Gegenrede"-Interaktion): 3 Redeteile x 4
// Erfolgsstufen als eigener, farblich unterscheidbarer Anzeige-Block mit
// Kopieren-Knopf pro Stufe - Hendrik schickt die passende Passage je nach
// Wurf manuell per Discord an den redenden Spieler, kein Auto-Push an
// Spieler. Reiner Anzeige-Helfer, kein Firebase-Bezug (ia.redeTeile ist
// statischer GM-Text wie details/trigger.info).
const REDE_STUFEN_LABELS = { gut: 'Guter Erfolg', normal: 'Normaler Erfolg', schlecht: 'Schlechter Erfolg', miss: 'Misserfolg' };
function redeTeileHtml(redeTeile) {
  return '<div class="v-callout"><div class="v-callout-title">🎤 Rede-Bausteine (nach Erfolgsstufe)</div>' +
    redeTeile.map(function (teil, i) {
      return '<div class="v-rede-teil"><div class="v-rede-teil-titel">' + teil.titel + '</div>' +
        ['gut', 'normal', 'schlecht', 'miss'].map(function (stufe) {
          const elId = 'rede-' + i + '-' + stufe;
          return '<div class="v-rede-stufe v-rede-' + stufe + '"><div class="v-rede-stufe-head"><span>' + REDE_STUFEN_LABELS[stufe] + '</span><button class="v-rede-copy" onclick="vCopyRedeText(this,\'' + elId + '\')" title="Kopieren">📋</button></div><div class="v-rede-text" id="' + elId + '">' + teil[stufe] + '</div></div>';
        }).join('') +
        '</div>';
    }).join('') +
    '</div>';
}
function vCopyRedeText(btn, elId) {
  const text = document.getElementById(elId).textContent;
  navigator.clipboard.writeText(text).then(function () {
    const original = btn.textContent;
    btn.textContent = '✓';
    setTimeout(function () { btn.textContent = original; }, 1200);
  }).catch(function () {});
}
function renderIaNote(ref, target) {
  const sceneId = ref.sceneId, ortId = ref.ortId, iaId = ref.iaId;
  const marker = (getMarkersForScene(sceneId) || []).find(function (m) { return m.id === ortId; });
  const ortRaw = ORTE[ortId]; const ia = ortRaw && ortRaw.interaktionen[iaId];
  if (!ia) { target.innerHTML = '<div class="v-empty">Nicht gefunden.</div>'; return; }
  const ort = resolveOrtForScene(ortRaw, sceneId);
  const basePath = 'regie/' + fbKey(sceneId) + '/' + fbKey(ortId) + '/interaktionen/' + iaId;
  const backlinks = backlinksForIa(ort, sceneId, iaId);

  // Sobald mindestens ein Trigger ein "info"-Feld hat, gilt die Interaktion
  // als "aufgeteilt" - der große Lesetext oben entfällt zugunsten von "kurz"
  // als knappem Einstieg, der Rest hängt direkt an den jeweiligen Punkten.
  // Ohne "info" (noch nicht aufgeteilte Interaktionen) bleibt "details" oben
  // als vollständiger Rückfall erhalten, damit nichts verloren geht.
  const hasInfo = (ia.trigger || []).some(function (t) { return !!t.info; });

  function triggerListHtml(dynTrigger, dynTriggerNotizen) {
    return (ia.trigger || []).map(function (t) { return chk(basePath, t, !!dynTrigger[t.id], (dynTriggerNotizen || {})[t.id]); }).join('');
  }

  function draw(dyn) {
    let html = '<h1 class="v-h1">' + ia.title + '</h1>';
    html += '<dl class="v-prop"><dt>ort</dt><dd>' + (marker ? marker.title : ortId) + '</dd><dt>tags</dt><dd><span class="v-tag">#' + fbKey(sceneId) + '</span></dd></dl>';
    html += '<div class="v-callout readaloud"><div class="v-callout-title">📖 ' + (hasInfo ? 'Kurz' : 'Lesetext') + '</div>' + (hasInfo ? ia.kurz : ia.details) + '</div>';
    html += '<div class="v-callout"><div class="v-callout-title">☑ Ablauf</div>' + triggerListHtml(dyn.trigger || {}, dyn.trigger_notizen || {}) + '</div>';
    if (ia.redeTeile) html += redeTeileHtml(ia.redeTeile);
    html += '<div class="v-callout"><div class="v-callout-title">✎ Notiz zur Interaktion</div><textarea class="v-note-field" placeholder="z.B. besondere Reaktionen, Würfe, Abweichungen vom Skript…" data-path="' + basePath + '/notizen">' + (dyn.notizen || '') + '</textarea><div class="v-save-hint"></div></div>';
    html += '<div class="v-backlinks"><h5>Erwähnt' + (backlinks.length ? ' (' + backlinks.length + ')' : '') + '</h5>' +
      (backlinks.length ? backlinks.map(function (b) { return '<button class="v-backlink-item" onclick="paneB=' + JSON.stringify(b.ref).replace(/"/g, '&quot;') + '; renderAll();"><b>' + b.label + '</b> <span>' + b.sub + '</span></button>'; }).join('') : '<div class="v-empty">Keine Verknüpfungen gefunden.</div>') +
      '</div>';
    target.innerHTML = html;
    bindNoteFields(target);
  }

  draw({}); // sofort mit unbearbeitetem Ausgangsstand zeichnen, nie leer bei langsamer Verbindung
  if (!db) return;
  db.ref(basePath).once('value').then(function (snap) { draw(snap.val() || {}); })
    .catch(function (err) { console.error('Fehler beim Laden von', basePath, err); });
}

// Freitext-Status je Charakter (NPC/Ghost/PC) - liegt unter charStatus/{key}
// in Firebase, GLOBAL (nicht pro Szene), damit der Zustand einer Person
// tatsächlich von Szene zu Szene mitgenommen wird, statt bei jedem
// Szenenwechsel verloren zu gehen. Ergänzt "Erwähnt in" (was die Person
// betrifft), nicht ersetzt es.
function charKeyFor(ref) {
  if (ref.type === 'npc') return 'npc_' + ref.npcId;
  if (ref.type === 'ghost') return 'ghost_' + fbKey(ref.sceneId) + '_' + ref.ghostId;
  if (ref.type === 'pc') return 'pc_' + ref.pcId;
  return null;
}
function statusBlockHtml(charKey) {
  return '<div class="v-callout"><div class="v-callout-title">📌 Aktueller Status</div>' +
    '<textarea class="v-note-field" placeholder="z.B. verletzt am Bein, weiß von X, misstraut Y…" data-path="charStatus/' + charKey + '">' + (charStatus[charKey] || '') + '</textarea><div class="v-save-hint"></div></div>';
}

function renderNpcNote(ref, target) {
  const n = npcRecord(ref.npcId);
  if (!n) { target.innerHTML = '<div class="v-empty">Nicht gefunden.</div>'; return; }
  let html = '<h1 class="v-h1">' + n.name + '</h1>';
  html += '<dl class="v-prop"><dt>rolle</dt><dd>' + n.role + '</dd></dl>';
  html += statusBlockHtml(charKeyFor(ref));
  html += '<div class="v-callout"><div class="v-callout-title">± Trigger &amp; Ruf-Verbindungen</div>' +
    (n.triggers || []).map(function (t) { return '<div class="v-sb-line">◆ ' + t + '</div>'; }).join('') + '</div>';
  const pcs = Object.keys(players).map(function (id) { return Object.assign({ id: id }, players[id]); });
  let rufHtml = '<div class="v-callout"><div class="v-callout-title">☆ Ruf pro Spielercharakter</div>';
  rufHtml += pcs.length ? pcs.map(function (pc) {
    const t = getPcRuf(pc.id, n.id);
    return '<div class="v-ruf-row"><span class="v-ruf-name">' + pc.name + '</span>' + rufTrackHtml(pc.id, n.id, t) + '<span class="v-ruf-tier">' + RUF_TIERS[t] + '</span></div>';
  }).join('') : '<div class="v-empty">Noch kein Spielercharakter angelegt.</div>';
  rufHtml += '</div>';
  html += rufHtml;
  const mentions = iaMentioningNpc(n.name);
  html += '<div class="v-backlinks"><h5>Erwähnt in' + (mentions.length ? ' (' + mentions.length + ')' : '') + '</h5>' +
    (mentions.length ? mentions.map(function (m) {
      return m.sceneId
        ? '<button class="v-backlink-item" onclick="paneB={type:\'ia\',sceneId:\'' + m.sceneId + '\',ortId:\'' + m.ortId + '\',iaId:\'' + m.iaId + '\'}; renderAll();"><b>' + m.title + '</b> <span>· ' + m.ortTitle + '</span></button>'
        : '<div class="v-backlink-item" style="cursor:default"><b>' + m.title + '</b> <span>· ' + m.ortTitle + '</span></div>';
    }).join('') : '<div class="v-empty">Keine Verknüpfungen gefunden.</div>') +
    '</div>';
  target.innerHTML = html;
  bindNoteFields(target);
}

function renderGhostNote(ref, target) {
  const g = ghostById(ref.sceneId, ref.ghostId);
  if (!g) { target.innerHTML = '<div class="v-empty">Nicht gefunden.</div>'; return; }
  let html = '<h1 class="v-h1">' + g.name + ' <span class="v-tag">👻 Ghost</span></h1>';
  html += '<dl class="v-prop"><dt>rolle</dt><dd>' + g.rolle + '</dd><dt>szene</dt><dd>' + getSceneLabel(ref.sceneId) + '</dd></dl>';
  html += statusBlockHtml(charKeyFor(ref));
  html += '<div class="v-callout"><div class="v-callout-title">Verfassung &amp; Bedürfnis</div>' + g.verfassung + '<div class="v-sb-line" style="margin-top:4px"><b>Bedürfnis</b> ' + g.beduerfnis + '</div></div>';
  const mentions = iaMentioningGhost(ref.sceneId, ref.ghostId);
  html += '<div class="v-backlinks"><h5>Erwähnt in' + (mentions.length ? ' (' + mentions.length + ')' : '') + '</h5>' +
    (mentions.length ? mentions.map(function (m) { return '<button class="v-backlink-item" onclick="paneB={type:\'ia\',sceneId:\'' + m.sceneId + '\',ortId:\'' + m.ortId + '\',iaId:\'' + m.iaId + '\'}; renderAll();"><b>' + m.title + '</b> <span>· ' + m.ortTitle + '</span></button>'; }).join('') : '<div class="v-empty">Keine Verknüpfungen gefunden.</div>') +
    '</div>';
  target.innerHTML = html;
  bindNoteFields(target);
}

function renderPcNote(ref, target) {
  const pc = players[ref.pcId];
  if (!pc) { target.innerHTML = '<div class="v-empty">Nicht gefunden.</div>'; return; }
  let html = '<h1 class="v-h1">' + pc.name + ' <span class="v-tag">🎭 Spielercharakter</span></h1>';
  html += statusBlockHtml(charKeyFor(ref));
  html += '<div class="v-callout"><div class="v-callout-title">☆ Ruf bei den NPCs</div>' +
    trackableNpcs().map(function (n) {
      const t = getPcRuf(ref.pcId, n.id);
      return '<div class="v-ruf-row"><span class="v-ruf-name">' + n.name + '</span>' + rufTrackHtml(ref.pcId, n.id, t) + '<span class="v-ruf-tier">' + RUF_TIERS[t] + '</span></div>';
    }).join('') + '</div>';
  target.innerHTML = html;
  bindNoteFields(target);
}

function renderPane(ref, target) {
  if (ref.type === 'scene') return renderSceneNote(ref, target);
  if (ref.type === 'ort') return renderOrtNote(ref, target);
  if (ref.type === 'ia') return renderIaNote(ref, target);
  if (ref.type === 'npc') return renderNpcNote(ref, target);
  if (ref.type === 'ghost') return renderGhostNote(ref, target);
  if (ref.type === 'pc') return renderPcNote(ref, target);
  target.innerHTML = '<div class="v-empty">Nichts ausgewählt.</div>';
}

function renderVariantButtons(markerInfo, wrap) {
  if (!wrap) return;
  const variantKeys = Object.keys(markerInfo.variants);
  const implicitDefault = variantKeys.find(function (k) { return markerInfo.variants[k].img === markerInfo.img; }) || variantKeys[0];
  function draw(activeKey) {
    wrap.innerHTML = '';
    variantKeys.forEach(function (key) {
      const variant = markerInfo.variants[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'v-variant-btn' + (key === activeKey ? ' active' : '');
      btn.textContent = variant.label || key;
      btn.onclick = function () {
        if (!db) { alert('Keine Verbindung zu Firebase — js/firebase-config.js prüfen.'); return; }
        db.ref('markerVariant/' + fbKey(markerInfo.id)).set(key).then(function () { draw(key); });
      };
      wrap.appendChild(btn);
    });
  }
  draw(implicitDefault);
  if (!db) return;
  db.ref('markerVariant/' + fbKey(markerInfo.id)).once('value').then(function (snap) {
    const saved = snap.val();
    if (saved && markerInfo.variants[saved]) draw(saved);
  });
}

// ---------- Charaktere fest am rechten Rand ----------
function currentFocusSceneId() {
  if (paneA.type === 'ia' || paneA.type === 'ort') return paneA.sceneId;
  if (paneB.type === 'ia' || paneB.type === 'ort') return paneB.sceneId;
  return viewState.szene;
}
function vRailItem(ref, label, icon) {
  const inA = paneMatches(paneA, ref), inB = paneMatches(paneB, ref);
  return '<button class="v-rail-item' + (inA ? ' inA' : '') + (inB ? ' inB' : '') + '" onclick="paneB=' + JSON.stringify(ref).replace(/"/g, '&quot;') + '; renderAll();">' + icon + ' <span>' + label + '</span></button>';
}
function renderRail() {
  const el = document.getElementById('v-rail');
  const npcs = CREW.concat(MANIFEST_EXTRA.filter(function (m) { return extraNpcIds[m.id]; }));
  const focusScene = currentFocusSceneId();
  const ghosts = focusScene ? ghostsOfScene(focusScene) : [];
  const pcs = Object.keys(players).map(function (id) { return Object.assign({ id: id }, players[id]); });

  let html = '<div class="v-rail-head">Charaktere</div>';
  html += '<div class="v-rail-sub v-folder-row"><span class="v-rail-sub-label">NPCs</span><button class="v-add-btn" onclick="vToggleAdd(\'npc\')" title="NPC hinzufügen">+</button></div>';
  if (vShowAdd === 'npc') {
    const avail = MANIFEST_EXTRA.filter(function (m) { return !extraNpcIds[m.id]; });
    html += '<div class="v-add-panel"><div class="v-add-sub">Aus dem Crew-Manifest</div>' +
      (avail.length ? avail.map(function (m) { return '<button class="v-add-item" onclick="vAddManifest(\'' + m.id + '\')">+ ' + m.name + ' <i>(' + m.role + ')</i></button>'; }).join('') : '<div class="v-empty">alle bereits hinzugefügt</div>') +
      '</div>';
  }
  html += npcs.map(function (n) { return vRailItem({ type: 'npc', npcId: n.id }, n.name, '👤'); }).join('');

  if (focusScene) {
    html += '<div class="v-rail-sub v-folder-row"><span class="v-rail-sub-label">Ghosts · ' + getSceneLabel(focusScene) + '</span><button class="v-add-btn" onclick="vToggleAdd(\'ghost\')" title="Ghost anlegen">+</button></div>';
    if (vShowAdd === 'ghost') {
      html += '<div class="v-add-panel"><form class="v-form" onsubmit="event.preventDefault(); vSubmitGhost(this,\'' + focusScene + '\');">' +
        '<input name="name" placeholder="Name" required>' +
        '<input name="rolle" placeholder="Rolle">' +
        '<input name="verfassung" placeholder="Verfassung">' +
        '<input name="beduerfnis" placeholder="Bedürfnis">' +
        '<button type="submit">Ghost anlegen (' + getSceneLabel(focusScene) + ')</button></form></div>';
    }
    html += ghosts.length ? ghosts.map(function (g) { return vRailItem({ type: 'ghost', sceneId: focusScene, ghostId: g.id }, g.name, '👻'); }).join('') : '<div class="v-empty">keine in dieser Szene</div>';
  }

  html += '<div class="v-rail-sub v-folder-row"><span class="v-rail-sub-label">Spielercharaktere</span><button class="v-add-btn" onclick="vToggleAdd(\'pc\')" title="Spielercharakter anlegen">+</button></div>';
  if (vShowAdd === 'pc') {
    html += '<div class="v-add-panel"><form class="v-form" onsubmit="event.preventDefault(); vSubmitPc(this);"><input name="name" placeholder="Name" required><button type="submit">Anlegen</button></form></div>';
  }
  html += pcs.length ? pcs.map(function (pc) { return vRailItem({ type: 'pc', pcId: pc.id }, pc.name, '🎭'); }).join('') : '<div class="v-empty">noch keine angelegt</div>';

  el.innerHTML = html;
}

// ---------- Alles zusammen ----------
// Baut je Pane ein festes Tab-Label ("was ist hier offen") + einen separat
// scrollbaren Body-Container - vorher landete der Inhalt direkt im äußeren
// .v-pane (overflow:hidden), wodurch lange Interaktionen (z.B. "Sorathis
// Besuch", 13 Trigger) abgeschnitten statt scrollbar waren.
function mountPane(ref, containerEl) {
  containerEl.innerHTML = '<div class="v-pane-tab"></div><div class="v-pane-body"></div>';
  containerEl.querySelector('.v-pane-tab').textContent = paneLabel(ref);
  renderPane(ref, containerEl.querySelector('.v-pane-body'));
}
// Bibel 2.9: übergeordnetes Ziel + explizite, vom SL ausgesprochene Aufträge.
// Reine Funktion (nimmt den Szenen-Regie-Teilbaum als Parameter statt selbst
// zu lesen) - dadurch von renderSceneHead() (live, sceneRegieSnapshot) UND
// buildSessionExportMarkdown() (Snapshot aus db.ref('regie').once()) gleichermaßen
// nutzbar, und offline testbar wie buildSessionExportMarkdown().
function activeQuestsForScene(sceneId, sceneRegie) {
  const snap = sceneRegie || {};
  const quests = [];
  getMarkersForScene(sceneId).forEach(function (marker) {
    const ortRaw = ORTE[marker.id] || { interaktionen: {} };
    const ort = resolveOrtForScene(ortRaw, sceneId);
    const iaKeys = getSceneInteraktionen(ort, sceneId);
    const ortRegie = snap[marker.id] || {};
    iaKeys.forEach(function (iaId) {
      const ia = ort.interaktionen[iaId];
      const iaRegie = (ortRegie.interaktionen && ortRegie.interaktionen[iaId]) || {};
      (ia.trigger || []).forEach(function (t) {
        if (!t.grantsQuest) return;
        if (!(iaRegie.trigger && iaRegie.trigger[t.id])) return;
        if (questDone[fbKey(sceneId)] && questDone[fbKey(sceneId)][t.id]) return;
        quests.push({
          sceneId: sceneId, triggerId: t.id, ortTitle: marker.title, iaTitle: ia.title,
          warum: t.grantsQuest.warum, was: t.grantsQuest.was
        });
      });
    });
  });
  return quests;
}
function renderSceneHead() {
  const el = document.getElementById('sceneHead');
  if (!el || !viewState.szene) return;
  const sr = (typeof SZENEN_REGIE !== 'undefined') ? SZENEN_REGIE[viewState.szene] : null;
  const quests = activeQuestsForScene(viewState.szene, sceneRegieSnapshot);
  let html = '';
  if (sr && sr.uebergeordnetesZiel) {
    html += '<div class="sh-goal"><span class="sh-goal-label">🎯 Übergeordnetes Ziel</span><span class="sh-goal-text">' + sr.uebergeordnetesZiel + '</span></div>';
  }
  if (sr && sr.stimmung) {
    html += '<div class="sh-mood"><span class="sh-mood-label">Stimmung</span><span class="sh-mood-text">' + sr.stimmung + '</span></div>';
  }
  if (quests.length) {
    html += '<div class="sh-quests"><span class="sh-quests-label">📜 Aktive Aufträge (' + quests.length + ')</span>' +
      quests.map(function (q) {
        return '<div class="sh-quest"><div class="sh-quest-body">' +
          '<div class="sh-quest-was"><b>Was:</b> ' + q.was + '</div>' +
          '<div class="sh-quest-warum"><b>Warum:</b> ' + q.warum + '</div>' +
          '<div class="sh-quest-src">' + q.ortTitle + ' — ' + q.iaTitle + '</div></div>' +
          '<button class="sh-quest-done" onclick="toggleQuestDone(\'' + q.sceneId + '\',\'' + q.triggerId + '\')">✓ erledigt</button></div>';
      }).join('') + '</div>';
  }
  html += renderGraphPanelHTML(viewState.szene);
  el.classList.toggle('has-content', !!html);
  el.innerHTML = html;
}
function renderAll() {
  if (!viewState.szene) return;
  renderTree();
  renderSceneHead();
  mountPane(paneA, document.getElementById('v-paneA'));
  mountPane(paneB, document.getElementById('v-paneB'));
  renderRail();
  document.getElementById('v-status').innerHTML =
    Object.keys(ORTE).length + ' Orte im Datenmodell';
  renderSoundBar();
  renderCharBar();
}

// ---------- Session-Export ----------
// buildSessionExportMarkdown() ist bewusst eine reine Funktion (nimmt den
// bereits geladenen regie/-Teilbaum als Parameter, statt selbst db.ref(...)
// aufzurufen) - dadurch offline testbar (siehe Skill pnp-safe-test), ohne
// echte Firebase-Verbindung zu brauchen. Der Firebase-Zugriff selbst passiert
// getrennt in refreshExportPreview().
function characterStatusSection() {
  const lines = [];
  trackableNpcs().forEach(function (n) {
    const val = (charStatus[charKeyFor({ type: 'npc', npcId: n.id })] || '').trim();
    if (val) lines.push('- **' + n.name + '** (NPC): ' + val);
  });
  getAllSceneEntries().forEach(function (entry) {
    ghostsOfScene(entry.id).forEach(function (g) {
      const val = (charStatus[charKeyFor({ type: 'ghost', sceneId: entry.id, ghostId: g.id })] || '').trim();
      if (val) lines.push('- **' + g.name + '** (Ghost, ' + getSceneLabel(entry.id) + '): ' + val);
    });
  });
  Object.keys(players).forEach(function (pcId) {
    const val = (charStatus[charKeyFor({ type: 'pc', pcId: pcId })] || '').trim();
    if (val) lines.push('- **' + ((players[pcId] && players[pcId].name) || pcId) + '** (Spielercharakter): ' + val);
  });
  return lines;
}
function reputationSection() {
  const blocks = [];
  Object.keys(players).forEach(function (pcId) {
    const pcName = (players[pcId] && players[pcId].name) || pcId;
    const npcLines = [];
    trackableNpcs().forEach(function (n) {
      const tier = getPcRuf(pcId, n.id);
      if (tier > 0) npcLines.push('- ' + n.name + ': ' + RUF_TIERS[tier]);
    });
    if (npcLines.length) blocks.push('### ' + pcName + '\n' + npcLines.join('\n'));
  });
  return blocks;
}
function buildSessionExportMarkdown(scopeAllScenes, regieSnapshot) {
  const snap = regieSnapshot || {};
  const sceneIds = scopeAllScenes ? getAllSceneEntries().map(function (e) { return e.id; }) : [viewState.szene];
  const sceneLabels = sceneIds.map(getSceneLabel).join(', ');
  const dateStr = new Date().toLocaleDateString('de-DE');
  let md = '# Session-Export — ' + sceneLabels + ' (' + dateStr + ')\n\n';

  let goalsQuestsMd = '';
  sceneIds.forEach(function (sceneId) {
    const sr = (typeof SZENEN_REGIE !== 'undefined') ? SZENEN_REGIE[sceneId] : null;
    const quests = activeQuestsForScene(sceneId, snap[fbKey(sceneId)] || {});
    if ((sr && sr.uebergeordnetesZiel) || quests.length) {
      goalsQuestsMd += '### ' + getSceneLabel(sceneId) + '\n\n';
      if (sr && sr.uebergeordnetesZiel) goalsQuestsMd += '**Übergeordnetes Ziel:** ' + sr.uebergeordnetesZiel + '\n\n';
      quests.forEach(function (q) {
        goalsQuestsMd += '- **Was:** ' + q.was + ' — **Warum:** ' + q.warum + ' _(' + q.ortTitle + ' — ' + q.iaTitle + ')_\n';
      });
      goalsQuestsMd += '\n';
    }
  });
  md += '## Übergeordnetes Ziel & Aktive Aufträge\n\n';
  md += goalsQuestsMd || '_Kein übergeordnetes Ziel gesetzt, keine aktiven Aufträge im gewählten Bereich._\n\n';

  let eventsMd = '';
  let notesMd = '';
  sceneIds.forEach(function (sceneId) {
    const sceneRegie = snap[fbKey(sceneId)] || {};
    getMarkersForScene(sceneId).forEach(function (marker) {
      const ortRaw = ORTE[marker.id] || { interaktionen: {} };
      const ort = resolveOrtForScene(ortRaw, sceneId);
      const iaKeys = getSceneInteraktionen(ort, sceneId);
      const ortRegie = sceneRegie[marker.id] || {};
      let ortEvents = '';
      iaKeys.forEach(function (iaId) {
        const ia = ort.interaktionen[iaId];
        const iaRegie = (ortRegie.interaktionen && ortRegie.interaktionen[iaId]) || {};
        const firedTriggers = (ia.trigger || []).filter(function (t) { return iaRegie.trigger && iaRegie.trigger[t.id]; });
        const iaNote = ((iaRegie.notizen || '') + '').trim();
        if (!firedTriggers.length && !iaNote) return;
        ortEvents += '**' + ia.title + '**\n';
        firedTriggers.forEach(function (t) {
          const note = ((iaRegie.trigger_notizen && iaRegie.trigger_notizen[t.id]) || '').trim();
          ortEvents += '- [x] ' + t.label + (note ? ' — ' + note : '') + '\n';
        });
        if (iaNote) ortEvents += '\n' + iaNote + '\n';
        ortEvents += '\n';
      });
      if (ortEvents) eventsMd += '### ' + marker.title + '\n\n' + ortEvents;

      const ortNote = ((ortRegie.ortNotizen || '') + '').trim();
      if (ortNote) notesMd += '### ' + marker.title + '\n\n' + ortNote + '\n\n';
    });
  });

  md += '## Ausgelöste Ereignisse\n\n';
  md += eventsMd || '_Keine ausgelösten Ereignisse im gewählten Bereich._\n\n';

  md += '## Notizen zu Orten\n\n';
  md += notesMd || '_Keine Ort-Notizen im gewählten Bereich._\n\n';

  md += '## Charakter-Status\n\n';
  const statusLines = characterStatusSection();
  md += statusLines.length ? statusLines.join('\n') + '\n\n' : '_Kein Status gesetzt._\n\n';

  md += '## Ruf-Stand (Spielercharaktere)\n\n';
  const rufBlocks = reputationSection();
  md += rufBlocks.length ? rufBlocks.join('\n\n') + '\n' : '_Keine Spielercharaktere angelegt oder kein Ruf gesetzt._\n';

  return md;
}
function downloadMarkdown(text, filename) {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function refreshExportPreview() {
  const scopeAllScenes = document.querySelector('input[name="exportScope"]:checked').value === 'all';
  const previewEl = document.getElementById('exportPreview');
  const msgEl = document.getElementById('exportMsg');
  if (!db) {
    previewEl.value = buildSessionExportMarkdown(scopeAllScenes, {});
    msgEl.textContent = 'Keine Firebase-Verbindung — Ereignisse/Notizen fehlen, Status/Ruf sind trotzdem aktuell.';
    msgEl.className = 'save-hint error';
    return;
  }
  msgEl.textContent = 'Lädt…'; msgEl.className = 'save-hint';
  db.ref('regie').once('value').then(function (snap) {
    previewEl.value = buildSessionExportMarkdown(scopeAllScenes, snap.val() || {});
    msgEl.textContent = 'Aktualisiert.'; msgEl.className = 'save-hint saved';
  }).catch(function (err) {
    msgEl.textContent = 'Fehler: ' + err.message; msgEl.className = 'save-hint error';
  });
}
(function initExportPanel() {
  const overlay = document.getElementById('exportOverlay');
  const toggle = document.getElementById('exportToggle');
  const close = document.getElementById('exportClose');
  const regen = document.getElementById('exportRegen');
  const copyBtn = document.getElementById('exportCopyBtn');
  const downloadBtn = document.getElementById('exportDownloadBtn');
  if (!overlay || !toggle) return;
  toggle.addEventListener('click', function () {
    overlay.classList.add('open');
    refreshExportPreview();
  });
  close.addEventListener('click', function () { overlay.classList.remove('open'); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
  regen.addEventListener('click', refreshExportPreview);
  document.querySelectorAll('input[name="exportScope"]').forEach(function (el) {
    el.addEventListener('change', refreshExportPreview);
  });
  copyBtn.addEventListener('click', function () {
    const msgEl = document.getElementById('exportMsg');
    navigator.clipboard.writeText(document.getElementById('exportPreview').value).then(function () {
      msgEl.textContent = 'In Zwischenablage kopiert.'; msgEl.className = 'save-hint saved';
    }).catch(function () {
      msgEl.textContent = 'Kopieren fehlgeschlagen (Berechtigung?).'; msgEl.className = 'save-hint error';
    });
  });
  downloadBtn.addEventListener('click', function () {
    const scopeAllScenes = document.querySelector('input[name="exportScope"]:checked').value === 'all';
    const slug = scopeAllScenes ? 'alle-szenen' : slugify(getSceneLabel(viewState.szene));
    const dateSlug = new Date().toISOString().slice(0, 10);
    downloadMarkdown(document.getElementById('exportPreview').value, 'sitzung-export-' + slug + '-' + dateSlug + '.md');
  });
})();

// ---------- Stoppuhr (unverändert aus dem alten Admin) ----------
const timerDisplayEl = document.getElementById('timerDisplay');
const timerTickerTimeEl = document.getElementById('timerTickerTime');
const timerTickerAlertEl = document.getElementById('timerTickerAlert');
const timerStartPauseBtn = document.getElementById('timerStartPause');
const timerResetBtn = document.getElementById('timerReset');
const timerMarkForm = document.getElementById('timerMarkForm');
const timerMarkLabelInput = document.getElementById('timerMarkLabel');
const timerMarkMinutesInput = document.getElementById('timerMarkMinutes');
const timerMarksEl = document.getElementById('timerMarks');

let gmTimerState = { running: false, startedAt: null, elapsedBeforeStart: 0, marks: {} };
let timerTickInterval = null;

function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return hh + ':' + mm + ':' + ss;
}
function currentElapsedSeconds() {
  let sec = gmTimerState.elapsedBeforeStart || 0;
  if (gmTimerState.running && gmTimerState.startedAt) sec += (Date.now() - gmTimerState.startedAt) / 1000;
  return sec;
}
function renderTimerTick() {
  const elapsedSec = currentElapsedSeconds();
  timerDisplayEl.textContent = formatElapsed(elapsedSec);
  const elapsedMin = elapsedSec / 60;
  let anyDue = false;
  timerMarksEl.querySelectorAll('.timer-mark').forEach(function (el) {
    const due = elapsedMin >= parseFloat(el.dataset.minutes);
    el.classList.toggle('due', due);
    if (due) anyDue = true;
  });
  timerTickerTimeEl.textContent = timerDisplayEl.textContent;
  timerTickerAlertEl.classList.toggle('on', anyDue);
}
function renderTimerBar() {
  timerStartPauseBtn.textContent = gmTimerState.running ? 'Pause' : 'Start';
  timerStartPauseBtn.classList.toggle('running', gmTimerState.running);
  timerMarksEl.innerHTML = '';
  Object.keys(gmTimerState.marks || {}).forEach(function (markId) {
    const mark = gmTimerState.marks[markId];
    const chip = document.createElement('div');
    chip.className = 'timer-mark';
    chip.dataset.minutes = mark.minutes;
    chip.textContent = mark.label + ' (' + mark.minutes + ' Min)';
    chip.title = 'Klicken zum Entfernen';
    chip.onclick = function () { if (db) db.ref('gmTimer/marks/' + markId).remove(); };
    timerMarksEl.appendChild(chip);
  });
  renderTimerTick();
  clearInterval(timerTickInterval);
  if (gmTimerState.running) timerTickInterval = setInterval(renderTimerTick, 1000);
}
if (db) {
  db.ref('gmTimer').on('value', function (snap) {
    const val = snap.val() || {};
    gmTimerState = { running: !!val.running, startedAt: val.startedAt || null, elapsedBeforeStart: val.elapsedBeforeStart || 0, marks: val.marks || {} };
    renderTimerBar();
  });
} else { renderTimerBar(); }
timerStartPauseBtn.onclick = function () {
  if (!db) { alert('Keine Verbindung zu Firebase — js/firebase-config.js prüfen.'); return; }
  if (gmTimerState.running) db.ref('gmTimer').update({ running: false, elapsedBeforeStart: currentElapsedSeconds(), startedAt: null });
  else db.ref('gmTimer').update({ running: true, startedAt: Date.now() });
};
timerResetBtn.onclick = function () {
  if (!db) { alert('Keine Verbindung zu Firebase — js/firebase-config.js prüfen.'); return; }
  db.ref('gmTimer').update({ running: false, startedAt: null, elapsedBeforeStart: 0 });
};
timerMarkForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!db) { alert('Keine Verbindung zu Firebase — js/firebase-config.js prüfen.'); return; }
  const label = timerMarkLabelInput.value.trim();
  const minutes = parseFloat(timerMarkMinutesInput.value);
  if (!label || isNaN(minutes)) return;
  db.ref('gmTimer/marks').push({ label: label, minutes: minutes });
  timerMarkLabelInput.value = ''; timerMarkMinutesInput.value = ''; timerMarkLabelInput.focus();
});

// ---------- Sound-Leiste (unverändert aus dem alten Admin) ----------
function isPlausibleAudioFilename(input) {
  if (!input) return false;
  return /\.(mp3|ogg|wav|m4a|aac)$/i.test(input.trim());
}
function renderSoundBar() {
  soundBarScene = viewState.szene;
  soundBarLabel.textContent = 'Szene: ' + (soundBarScene ? getSceneLabel(soundBarScene) : '–');
  soundLinkInput.value = ''; soundLinkHint.textContent = ''; soundLinkHint.className = 'save-hint';
  if (!db || !soundBarScene) return;
  db.ref('sceneAudioFile/' + fbKey(soundBarScene)).once('value').then(function (snap) {
    const savedFile = snap.val();
    if (savedFile && soundBarScene === viewState.szene) soundLinkInput.value = savedFile;
  });
}
soundLinkInput.addEventListener('blur', saveSoundLink);
soundLinkInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); soundLinkInput.blur(); } });
function saveSoundLink() {
  if (!db || !soundBarScene) return;
  const raw = soundLinkInput.value.trim();
  if (!raw) {
    db.ref('sceneAudioFile/' + fbKey(soundBarScene)).remove().then(function () {
      soundLinkHint.textContent = 'entfernt'; soundLinkHint.className = 'save-hint saved';
      setTimeout(function () { soundLinkHint.textContent = ''; soundLinkHint.className = 'save-hint'; }, 1500);
    });
    return;
  }
  if (!isPlausibleAudioFilename(raw)) {
    soundLinkHint.textContent = 'Kein gültiger Dateiname (.mp3/.ogg/.wav/.m4a/.aac erwartet)';
    soundLinkHint.className = 'save-hint error';
    return;
  }
  db.ref('sceneAudioFile/' + fbKey(soundBarScene)).set(raw).then(function () {
    soundLinkHint.textContent = 'gespeichert'; soundLinkHint.className = 'save-hint saved';
    setTimeout(function () { soundLinkHint.textContent = ''; soundLinkHint.className = 'save-hint'; }, 1500);
  }).catch(function (err) { soundLinkHint.textContent = 'NICHT gespeichert — ' + err.message; soundLinkHint.className = 'save-hint error'; });
}

// ---------- Charakter-Portrait-Leiste (unverändert aus dem alten Admin) ----------
function renderCharBar() {
  charBarScene = viewState.szene;
  charCheckboxesEl.innerHTML = '';
  if (typeof CHARACTERS === 'undefined' || !charBarScene) return;
  const szeneRegie = (typeof SZENEN_REGIE !== 'undefined') ? SZENEN_REGIE[charBarScene] : null;
  const relevant = (szeneRegie && Array.isArray(szeneRegie.charaktere)) ? szeneRegie.charaktere : null;
  function renderList(active, showAll) {
    charCheckboxesEl.innerHTML = '';
    const primary = (relevant && !showAll) ? CHARACTERS.filter(function (ch) { return relevant.indexOf(ch.id) !== -1 || !!active[ch.id]; }) : CHARACTERS;
    primary.forEach(function (ch) { charCheckboxesEl.appendChild(buildCharToggle(ch, !!active[ch.id])); });
    if (relevant && !showAll && primary.length < CHARACTERS.length) {
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button'; moreBtn.className = 'char-more-btn';
      moreBtn.textContent = '+ weitere (' + (CHARACTERS.length - primary.length) + ')';
      moreBtn.onclick = function () { renderList(active, true); };
      charCheckboxesEl.appendChild(moreBtn);
    }
  }
  if (!db) { renderList({}, false); return; }
  db.ref('sceneCharacters/' + fbKey(charBarScene)).once('value').then(function (snap) {
    if (charBarScene !== viewState.szene) return;
    renderList(snap.val() || {}, false);
  });
}
function buildCharToggle(ch, isActive) {
  const label = document.createElement('label');
  label.className = 'char-toggle' + (isActive ? ' active' : '');
  label.innerHTML = '<input type="checkbox"' + (isActive ? ' checked' : '') + '> ' + ch.name;
  const checkbox = label.querySelector('input');
  checkbox.addEventListener('change', function () {
    label.classList.toggle('active', checkbox.checked);
    if (!db || !charBarScene) return;
    db.ref('sceneCharacters/' + fbKey(charBarScene) + '/' + ch.id).set(checkbox.checked);
  });
  return label;
}

// ---------- Werkzeug-Fach ein-/ausklappbar (unverändert aus dem alten Admin) ----------
(function initToolDrawer() {
  const drawer = document.getElementById('toolDrawer');
  const toggle = document.getElementById('toolDrawerToggle');
  if (!drawer || !toggle) return;
  const OPEN_KEY = 'korsaren_tooldrawer_open';
  function apply(open) { drawer.classList.toggle('open', open); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  let open = false;
  try { open = localStorage.getItem(OPEN_KEY) === '1'; } catch (e) {}
  apply(open);
  toggle.addEventListener('click', function () {
    const nowOpen = !drawer.classList.contains('open');
    apply(nowOpen);
    try { localStorage.setItem(OPEN_KEY, nowOpen ? '1' : '0'); } catch (e) {}
  });
})();
