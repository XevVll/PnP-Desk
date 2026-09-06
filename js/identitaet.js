/* ==========================================================
   IDENTITAET — wer sitzt hier vor dem Browser?
   ----------------------------------------------------------
   Gemeinsam genutzt von index.html (Hub) und
   charaktererstellung.html. Bewusst eine eigene Datei: Wenn
   beide Seiten ihre eigenen Kopien dieser Schluessel haetten
   und einer davon abwiche, bekaeme derselbe Spieler zwei
   verschiedene Kennungen - und seine Figur waere ploetzlich
   die eines Fremden.

   Kein Konto, kein Passwort. Der Name liegt im Browser des
   Spielers, die Kennung ebenso. Das reicht fuer eine private
   Runde und ist ausdruecklich KEINE Anmeldung: Wer die Werte
   im localStorage aendert, gibt sich als jemand anderes aus.
   ========================================================== */

// Derselbe Schluessel, den js/dice.js seit jeher fuer die Wuerfelleiste
// benutzt - wer sich im Hub anmeldet, wird dort ohne zweite Abfrage erkannt.
const ID_NAME_KEY = 'korsaren_playername';
// Dauerhaft, im Gegensatz zu sessionStorage.korsaren_session_id (gilt nur
// pro Tab-Sitzung und taugt deshalb nicht, um eine Figur zuzuordnen).
const ID_PID_KEY  = 'pnp_player_id';

function idLies(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function idSchreib(k, v) {
  try { localStorage.setItem(k, v); } catch (e) {}
  return v;
}

function spielerName() { return (idLies(ID_NAME_KEY) || '').trim(); }
function setzeSpielerName(v) {
  const n = String(v || '').trim().slice(0, 24);
  if (n) idSchreib(ID_NAME_KEY, n);
  return n;
}
function loescheSpielerName() { try { localStorage.removeItem(ID_NAME_KEY); } catch (e) {} }

function spielerId() {
  let p = idLies(ID_PID_KEY);
  if (!p) {
    p = 'p' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
    idSchreib(ID_PID_KEY, p);
  }
  return p;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ID_NAME_KEY, ID_PID_KEY, spielerName, setzeSpielerName, loescheSpielerName, spielerId };
}
