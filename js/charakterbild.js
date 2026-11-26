/* ==========================================================
   Gemeinsam fuer heldenbrief.html (Savage Worlds) und
   wfrp_heldenbrief.html (Warhammer), seit 26.11.2026. Vorher
   stand der Block nur im Savage-Worlds-Bogen - eine Kopie im
   WFRP-Bogen waere die zweite Fassung desselben Uploads gewesen.

   Die Seite stellt bereit, was der Block braucht: db, syncBereit,
   geloescht, codeJetzt(), META.name, setzeSync(), esc() - und
   die Knoten bildVor, bildStand, bildWeg (siehe Markup im Bogen).
   ========================================================== */

/* ==========================================================
   CHARAKTERBILD
   ----------------------------------------------------------
   Das Bild liegt NICHT in der Figur, sondern daneben, unter
   pcLeiste/{schluessel}. Drei Gruende, und der erste genuegt:

   1. bogenFelder() geht bei JEDER Aenderung hoch, entprellt mit
      800 ms. Laege das Bild darin, gingen bei jedem Klick auf
      einen Stepper ~50 KB durchs Netz.
   2. karte.html braucht nur Namen und Bild, nicht Steckbrief,
      Notizen und Ausruestung jeder Figur. So horcht die Karte
      auf einen kleinen Knoten statt auf alle Figuren.
   3. Die Spielleitung darf ausblenden (Feld "aus"), ohne einen
      WERT der Figur anzufassen - der Bogen bleibt ihr einziger
      Schreiber. Beide Seiten schreiben per update() auf eigene
      Schluessel und koennen sich deshalb nicht ueberschreiben.

   pcLeiste steht in SITZUNGS_PFADE, liegt also unter
   sitzungen/{sid}/stand/ - KEIN neuer Top-Level-Pfad, also
   auch keine Firebase-Regel, die von Hand zu veroeffentlichen
   waere.
   ========================================================== */

// So gross, wie die Leiste auf der Karte es braucht: dort ist eine
// Karte hoechstens 220 px breit, also reichen 450x600 auch auf einem
// Bildschirm mit doppelter Pixeldichte. Alles darueber waere Ballast,
// den jeder Spieler bei jedem Laden mit herunterzieht.
const BILD_B = 450, BILD_H = 600;
const BILD_MAX = 140 * 1024;   // Notbremse: so viel darf der Data-URI wiegen

let meinBild = '';
let bildMeldung = '';

function renderBild() {
  const vor = document.getElementById('bildVor');
  const stand = document.getElementById('bildStand');
  const weg = document.getElementById('bildWeg');
  if (!vor || !stand || !weg) return;

  vor.innerHTML = meinBild
    ? '<img src="' + esc(meinBild) + '" alt="Dein Charakterbild">'
    : '<span class="bild-leer">kein Bild</span>';
  weg.disabled = !meinBild;

  if (bildMeldung) {
    stand.textContent = bildMeldung;
    stand.className = 'bild-stand warn';
    return;
  }
  stand.className = 'bild-stand';
  stand.textContent = meinBild
    ? 'Steht am linken Rand der Karte. (' + Math.round(meinBild.length / 1024) + ' KB)'
    : 'Noch keins — ohne Bild steht dort nichts von dir.';
}

/* Verkleinern im Browser. Zugeschnitten wird auf 3:4 (cover), damit die
   Leiste nicht entscheiden muss, was sie wegschneidet - und damit die
   Vorschau hier zeigt, was dort ankommt. */
function bildVerkleinern(img) {
  const c = document.createElement('canvas');
  c.width = BILD_B; c.height = BILD_H;
  const ctx = c.getContext('2d');
  const s = Math.max(BILD_B / img.width, BILD_H / img.height);
  const b = img.width * s, h = img.height * s;
  // Waagerecht mittig, senkrecht OBEN ansetzen: Bei einem Portraet ist
  // der Kopf oben, und genau der soll im Ausschnitt bleiben.
  ctx.drawImage(img, (BILD_B - b) / 2, 0, b, h);
  // WebP ist kleiner; kann der Browser es nicht, liefert toDataURL
  // stillschweigend PNG zurueck - dann lieber JPEG als ein PNG, das
  // dreimal so schwer waere.
  let u = c.toDataURL('image/webp', 0.82);
  if (u.indexOf('data:image/webp') !== 0) u = c.toDataURL('image/jpeg', 0.82);
  if (u.length > BILD_MAX) {
    const art = u.indexOf('data:image/webp') === 0 ? 'image/webp' : 'image/jpeg';
    u = c.toDataURL(art, 0.6);
  }
  return u;
}

function bildGewaehlt(input) {
  const datei = input && input.files && input.files[0];
  input.value = '';            // damit dieselbe Datei erneut waehlbar bleibt
  if (!datei) return;
  if (String(datei.type || '').indexOf('image/') !== 0) {
    bildMeldung = 'Das ist kein Bild.'; renderBild(); return;
  }
  bildMeldung = 'wird verkleinert …'; renderBild();

  const leser = new FileReader();
  leser.onerror = function () { bildMeldung = 'Die Datei ließ sich nicht lesen.'; renderBild(); };
  leser.onload = function () {
    const img = new Image();
    img.onerror = function () { bildMeldung = 'Das Bild ließ sich nicht öffnen.'; renderBild(); };
    img.onload = function () {
      let u;
      try { u = bildVerkleinern(img); }
      catch (e) { bildMeldung = 'Verkleinern ging nicht: ' + e; renderBild(); return; }
      if (u.length > BILD_MAX) {
        // Lieber sagen, dass es nicht geht, als es stillschweigend
        // hochzuladen und die Datenbank damit vollzustellen.
        bildMeldung = 'Das Bild bleibt auch verkleinert zu groß. Nimm ein einfacheres.';
        renderBild(); return;
      }
      meinBild = u;
      bildMeldung = '';
      renderBild();
      bildHoch();
    };
    img.src = leser.result;
  };
  leser.readAsDataURL(datei);
}

function bildEntfernen() {
  if (!meinBild) return;
  meinBild = '';
  bildMeldung = '';
  renderBild();
  bildHoch();
}

/* Geschrieben wird mit update() auf genau zwei Schluessel - "aus"
   gehoert der Spielleitung und darf hier nicht mitgeloescht werden. */
function bildHoch() {
  if (!db || !syncBereit || geloescht) return;
  const paket = { bild: meinBild || null, name: META.name || '' };
  try {
    db.ref('pcLeiste/' + codeJetzt()).update(paket)
      .then(function () {
        bildMeldung = '';
        renderBild();
        setzeSync('gespeichert', '#4caf7d');
      })
      .catch(function (e) {
        bildMeldung = 'Nicht gesendet: ' + (e && e.message ? e.message : e);
        renderBild();
      });
  } catch (e) {
    bildMeldung = 'Nicht gesendet: ' + e;
    renderBild();
  }
}

/* Beim Oeffnen einmal holen. Eigener Lesezugriff, weil das Bild
   bewusst nicht in der Figur liegt. */
function bildHolen() {
  if (!db) { renderBild(); return; }
  db.ref('pcLeiste/' + codeJetzt()).once('value').then(function (s) {
    const v = s.val() || {};
    meinBild = v.bild || '';
    renderBild();
  }).catch(function () { renderBild(); });
}
