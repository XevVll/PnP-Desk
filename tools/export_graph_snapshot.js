// Erzeugt einen Import-fertigen Stand-Snapshot eines Erkundungs-Graphen
// aus js/exploration_graphs.js, zum Weiterbearbeiten in graph_editor.html.
//
//   node tools/export_graph_snapshot.js            (Standard: Szene 11.1)
//   node tools/export_graph_snapshot.js 11.1       (Szene explizit)
//
// Schreibt <szene>_graph_snapshot.js ins Repo-Wurzelverzeichnis (Punkt in
// der Szenen-ID wird zu "_", also 11.1 -> riffinsel_graph_snapshot.js bzw.
// generisch szene_11_1_graph_snapshot.js, siehe SNAPSHOT_NAMES).
//
// Warum ueberhaupt ein eigener Snapshot statt js/exploration_graphs.js
// direkt einzufuegen: "ort"-Knoten tragen in der echten Datei bewusst KEIN
// top/left - ihre Position kommt im Betrieb vom verknuepften Marker
// (getGraphNodePosition()). Im Editor landen sie dadurch als Platzhalter
// bei 50/50 und muessten jedes Mal von Hand an die richtige Stelle gezogen
// werden. Dieser Export ergaenzt die Marker-Position, damit der Graph
// sofort stimmt; beim Export AUS dem Editor faellt top/left fuer "ort"
// automatisch wieder weg, die echte Datei bleibt also unveraendert im
// bisherigen Format.
//
// Der Snapshot ist ein reiner Arbeitsstand: er wird von der Anwendung nicht
// geladen und veraltet, sobald js/exploration_graphs.js sich aendert -
// dann einfach neu erzeugen.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Szene -> Datei/Variable mit den Markern (fuer die Position der "ort"-Knoten)
// und gewuenschter Dateiname des Snapshots. Neue Graph-Szene hier ergaenzen.
const SCENE_SOURCES = {
  '11.1': { markerFile: 'js/riffinsel_scenes.js', markerVar: 'RIFFINSEL_SCENES', snapshot: 'riffinsel_graph_snapshot.js' }
};

function loadJs(relFile, varName) {
  const ctx = { globalThis: undefined };
  vm.createContext(ctx);
  ctx.globalThis = ctx;
  vm.runInContext(fs.readFileSync(path.join(ROOT, relFile), 'utf8') + '\nglobalThis.__X = ' + varName + ';', ctx);
  return ctx.__X;
}

const sceneId = process.argv[2] || '11.1';
const src = SCENE_SOURCES[sceneId];
if (!src) {
  console.error('Unbekannte Szene "' + sceneId + '". Bekannt: ' + Object.keys(SCENE_SOURCES).join(', ') + ' (SCENE_SOURCES in dieser Datei ergaenzen).');
  process.exit(1);
}

const graph = loadJs('js/exploration_graphs.js', 'EXPLORATION_GRAPHS')[sceneId];
if (!graph) { console.error('Kein EXPLORATION_GRAPHS-Eintrag fuer "' + sceneId + '".'); process.exit(1); }
const markers = loadJs(src.markerFile, src.markerVar)[sceneId].markers;

const nodesOut = {};
let ortMitPosition = 0;
Object.keys(graph.nodes).forEach(function (id) {
  const n = graph.nodes[id];
  const out = { type: n.type, label: n.label };
  if (typeof n.top === 'number' && typeof n.left === 'number') {
    out.top = n.top; out.left = n.left;
  } else if (n.ortId) {
    const m = markers.find(function (m) { return m.id === n.ortId; });
    if (m) { out.top = m.top; out.left = m.left; ortMitPosition++; }
    else console.warn('WARNUNG: kein Marker "' + n.ortId + '" fuer Knoten "' + id + '" - landet im Editor bei 50/50.');
  }
  ['probe', 'ortId', 'text', 'erfolgText', 'misserfolgText'].forEach(function (k) {
    if (n[k] !== undefined) out[k] = n[k];
  });
  nodesOut[id] = out;
});

const body = JSON.stringify({ startNode: graph.startNode, nodes: nodesOut, edges: graph.edges }, null, 2).replace(/\n/g, '\n  ');
const out = [
  '// STAND-SNAPSHOT Erkundungsgraph, Szene ' + sceneId + ' — erzeugt am ' + new Date().toISOString().slice(0, 10),
  '// Erzeugt mit: node tools/export_graph_snapshot.js ' + sceneId,
  '//',
  '// Zum Weiterbearbeiten in graph_editor.html: kompletten Inhalt dieser Datei',
  '// kopieren, unten bei "Bestehenden Graph laden" einfuegen, "Laden" klicken.',
  '//',
  '// Die "ort"-Knoten tragen hier zusaetzlich top/left aus ihren Markern',
  '// (' + src.markerFile + '), damit sie im Editor sofort an der richtigen',
  '// Stelle liegen. Beim Export AUS dem Editor faellt das automatisch wieder',
  '// weg — im Betrieb kommt die Position vom Marker.',
  '//',
  '// Diese Datei wird von der Anwendung NICHT geladen. Reiner Arbeitsstand,',
  '// veraltet sobald js/exploration_graphs.js sich aendert — dann neu erzeugen.',
  '',
  'const EXPLORATION_GRAPHS = {',
  '  "' + sceneId + '": ' + body,
  '};',
  ''
].join('\n');

fs.writeFileSync(path.join(ROOT, src.snapshot), out, 'utf8');
console.log('Geschrieben: ' + src.snapshot);
console.log('  Knoten: ' + Object.keys(nodesOut).length + ' | Kanten: ' + Object.keys(graph.edges).length + ' | Startknoten: ' + graph.startNode);
console.log('  "ort"-Knoten mit Marker-Position versorgt: ' + ortMitPosition);
