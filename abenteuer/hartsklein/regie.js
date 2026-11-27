/* ==========================================================
   DIE HARTSKLEIN-SCHLEUSE - Regie (Orte, Interaktionen, Szenenziel)
   ----------------------------------------------------------
   Wird NACH js/regie.js geladen und traegt in dessen ORTE und
   SZENEN_REGIE ein. Jede Kennung beginnt mit "hk_" bzw. "hk",
   ein Zusammenstoss mit Korsaren bricht deshalb sofort ab,
   statt still einen Ort zu ueberschreiben.
   ========================================================== */

(function () {
  function eintragen(ziel, neu, name) {
    Object.keys(neu).forEach(function (k) {
      if (ziel[k]) throw new Error('Hartsklein: ' + name + '["' + k + '"] gibt es schon.');
      ziel[k] = neu[k];
    });
  }

  eintragen(ORTE, {
    // [OFFEN] folgt mit dem Inhalt
  }, 'ORTE');

  eintragen(SZENEN_REGIE, {
    'hk1.1': {
      uebergeordnetesZiel: '[OFFEN] folgt mit dem Inhalt.'
    }
  }, 'SZENEN_REGIE');
})();
