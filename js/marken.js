/* ==========================================================
   MARKEN — Talente und Schwächen erklären sich
   ----------------------------------------------------------
   Zwei Stufen, und beide braucht es:
     Hovern  - der schnelle Blick während einer Probe.
     Klicken - das Nachlesen, mit allem, was ins Hover-Feld
               nicht hineinpasst (Voraussetzungen, was ein
               "Haken" bedeutet). Auf einem Tablet am Tisch
               gibt es gar kein Hovern — dort ist der Klick
               der einzige Weg.

   Die Mechanik stand bis zum 15.10.2026 in heldenbrief.html.
   Sie liegt jetzt hier, weil besatzung.html dieselbe braucht:
   Dort stehen die NSC-Talente, und die will man genauso
   nachlesen können. Zwei Kopien davon würden auseinanderlaufen
   — dieselbe Lehre wie bei spielerKennung() im September.

   BENUTZUNG. Die Seite rendert ihre Chips mit diesen Feldern:

     <span class="tag" tabindex="0" role="button"
           data-tipid="seebein" data-tipart="tal"
           data-tipn="Seebein" data-tipk="Hintergrund · ab Novize"
           data-tipt="Wirkung …">Seebein</span>

   und ruft einmal markenAktivieren() auf. Alles Weitere -
   Lauscher, Feld, Overlay, Stil - macht diese Datei.
   Erwartet TAL_BY_ID, HND_BY_ID, RAENGE, DLBL und
   TALENT_KOSTEN aus js/regelwerk.js.
   ========================================================== */

const MARKEN_STIL = [
  '#tagTip{position:fixed;z-index:200;max-width:min(26rem,calc(100vw - 24px));',
  '  background:#16242b;border:1px solid #c9a84c;border-radius:6px;',
  '  padding:.5rem .7rem;font-size:.78rem;line-height:1.55;color:#fefcf8;',
  '  box-shadow:0 6px 24px rgba(0,0,0,.55);pointer-events:none;display:none}',
  '#tagTip b{display:block;font-family:Cinzel,serif;font-size:.72rem;letter-spacing:.06em;',
  '  color:#c9a84c;margin-bottom:.2rem}',
  '#tagTip i{font-style:normal;color:#9a9080;font-size:.7rem}',
  '#tagTip u{display:block;text-decoration:none;color:#9a9080;font-size:.66rem;margin-top:.35rem}',
  '#tagModal{position:fixed;inset:0;z-index:300;display:none;',
  '  align-items:center;justify-content:center;padding:1rem}',
  '#tagModal.auf{display:flex}',
  '#tagModalBg{position:absolute;inset:0;background:rgba(8,14,17,.72)}',
  '#tagModalCard{position:relative;width:min(30rem,100%);max-height:80vh;overflow:auto;',
  '  background:#1a2e35;border:1px solid #c9a84c;border-radius:8px;',
  '  box-shadow:0 12px 48px rgba(0,0,0,.6);padding:1.1rem 1.2rem 1.2rem}',
  '#tagModalCard h3{font-family:Cinzel,serif;color:#c9a84c;font-size:1.15rem;',
  '  letter-spacing:.04em;margin:0 0 .15rem;padding-right:2rem}',
  '#tagModalCard .kat{font-size:.72rem;color:#9a9080;font-style:italic;margin-bottom:.8rem}',
  '#tagModalCard .wirkung{font-size:.9rem;line-height:1.65;color:#fefcf8}',
  '#tagModalCard .zusatz{margin-top:.9rem;padding-top:.7rem;border-top:1px solid rgba(201,168,76,.22);',
  '  font-size:.78rem;line-height:1.6;color:#9a9080}',
  '#tagModalCard .zusatz b{color:#fefcf8;font-weight:400}',
  '#tagModalZu{position:absolute;top:.6rem;right:.6rem;width:28px;height:28px;border-radius:50%;',
  '  background:transparent;border:1px solid rgba(201,168,76,.22);color:#9a9080;',
  '  cursor:pointer;font-size:.9rem;line-height:1}',
  '#tagModalZu:hover{border-color:#c9a84c;color:#fefcf8}',
  '.tag[data-tipt]{cursor:help}',
  '.tag[data-tipt]:focus-visible{outline:2px solid #c9a84c;outline-offset:2px}'
].join('\n');

function markenEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

/* ---------- Das Hover-Feld ----------
   Ein einziges Feld fuer alle Chips, per Delegation - sonst haengen an
   vierzig Talenten achtzig Lauscher. */
function tipFeld() {
  let el = document.getElementById('tagTip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'tagTip';
    document.body.appendChild(el);
  }
  return el;
}

function tipZeigen(chip) {
  const el = tipFeld();
  el.innerHTML = '<b>' + markenEsc(chip.dataset.tipn) + '</b>' +
    '<i>' + markenEsc(chip.dataset.tipk) + '</i><br>' + markenEsc(chip.dataset.tipt) +
    '<u>Anklicken für die ganze Erklärung</u>';
  el.style.display = 'block';
  // Erst zeigen, dann messen: Vorher hat das Feld keine Hoehe.
  const r = chip.getBoundingClientRect(), m = el.getBoundingClientRect();
  let x = r.left, y = r.bottom + 7;
  // Am Rand umklappen statt abgeschnitten zu werden - der Bogen laeuft in
  // karte.html in einem schmalen iframe, dort ist rechts schnell Schluss.
  if (x + m.width > window.innerWidth - 10) x = Math.max(10, window.innerWidth - m.width - 10);
  if (y + m.height > window.innerHeight - 10) y = Math.max(10, r.top - m.height - 7);
  el.style.left = x + 'px';
  el.style.top = y + 'px';
}

function tipWeg() {
  const el = document.getElementById('tagTip');
  if (el) el.style.display = 'none';
}

/* ---------- Das Overlay ----------
   Zeigt mehr als das Hover-Feld, nicht dasselbe groesser - sonst waere der
   Klick nur ein zweiter Weg zur selben Zeile. */
function markenVorText(vor) {
  if (!vor || !vor.length) return 'keine';
  return vor.map(function (v) { return v[0] + ' ' + DLBL[v[1]]; }).join(', ');
}

function tagModal() {
  let el = document.getElementById('tagModal');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'tagModal';
  el.innerHTML = '<div id="tagModalBg"></div><div id="tagModalCard" role="dialog" ' +
    'aria-modal="true" aria-labelledby="tagModalName">' +
    '<button id="tagModalZu" aria-label="Schließen">✕</button>' +
    '<h3 id="tagModalName"></h3><div class="kat"></div>' +
    '<div class="wirkung"></div><div class="zusatz"></div></div>';
  document.body.appendChild(el);
  el.querySelector('#tagModalBg').onclick = tagModalZu;
  el.querySelector('#tagModalZu').onclick = tagModalZu;
  return el;
}

function tagModalAuf(chip) {
  tipWeg();                       // sonst klebt das Hover-Feld über dem Overlay
  const el = tagModal();
  const id = chip.dataset.tipid, art = chip.dataset.tipart;
  const x = art === 'tal' ? TAL_BY_ID[id] : (art === 'hnd' ? HND_BY_ID[id] : null);

  el.querySelector('#tagModalName').textContent = chip.dataset.tipn;
  el.querySelector('.kat').textContent = chip.dataset.tipk;
  el.querySelector('.wirkung').textContent = chip.dataset.tipt;

  let zu = '';
  if (x && art === 'tal') {
    zu = '<b>Voraussetzung:</b> ' + markenEsc(markenVorText(x.vor)) + '<br>' +
      '<b>Ab Rang:</b> ' + markenEsc(RAENGE[x.rang] ? RAENGE[x.rang].name : '—') +
      ' — der Rang ist eine harte Sperre, die Werte sind es nicht.';
    /* Figurgebundene Talente sagen das auch: Sonst sucht jemand sie in der
       Charaktererschaffung und findet sie nie. */
    if (x.nurNsc) zu += '<br><b>Nur für diese Figur.</b> Nicht wählbar — gehört zu ihr.';
  } else if (x && art === 'hnd') {
    zu = x.haken
      ? '<b>Haken.</b> Diese Schwäche senkt keinen Würfel. Sie verpflichtet dich und gibt ' +
        'deiner Spielleitung etwas, woran sie dich aufhängen kann — darin liegt ihr Wert.'
      : '<b>Wertschwäche.</b> Sie wirkt sich direkt auf Würfe oder Möglichkeiten aus.';
    zu += '<br><b>Bringt:</b> ' + (x.schwer ? '2 Punkte (schwer)' : '1 Punkt (leicht)') +
      ' — davon werden Talente bezahlt, eines kostet ' + TALENT_KOSTEN + '.';
    if (x.nurNsc) zu += '<br><b>Nur für diese Figur.</b> Nicht wählbar — gehört zu ihr.';
  }
  const zEl = el.querySelector('.zusatz');
  zEl.innerHTML = zu;
  zEl.style.display = zu ? '' : 'none';

  el.classList.add('auf');
  const knopf = el.querySelector('#tagModalZu');
  if (knopf && knopf.focus) knopf.focus();
}

function tagModalZu() {
  const el = document.getElementById('tagModal');
  if (el) el.classList.remove('auf');
}

/* ---------- Einhaengen ----------
   Einmal je Seite aufrufen. Mehrfach schadet nicht. */
let markenAktiv = false;
function markenAktivieren() {
  if (markenAktiv) return;
  markenAktiv = true;

  const stil = document.createElement('style');
  stil.textContent = MARKEN_STIL;
  document.head.appendChild(stil);

  function chipVon(ev) {
    return (ev.target && ev.target.closest) ? ev.target.closest('.tag[data-tipt]') : null;
  }

  document.addEventListener('click', function (ev) {
    const chip = chipVon(ev);
    if (chip) tagModalAuf(chip);
  });
  // Tastatur: ein role="button" muss auf Enter und Leertaste hoeren.
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { tagModalZu(); return; }
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const chip = chipVon(ev);
    if (chip) { ev.preventDefault(); tagModalAuf(chip); }
  });
  document.addEventListener('mouseover', function (ev) {
    const chip = chipVon(ev);
    if (chip) tipZeigen(chip);
  });
  document.addEventListener('mouseout', function (ev) {
    if (chipVon(ev)) tipWeg();
  });
  document.addEventListener('focusin', function (ev) {
    const chip = chipVon(ev);
    if (chip) tipZeigen(chip);
  });
  document.addEventListener('focusout', tipWeg);
  document.addEventListener('scroll', tipWeg, true);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { markenAktivieren, tagModalAuf, tagModalZu, tipZeigen, tipWeg, MARKEN_STIL };
}
