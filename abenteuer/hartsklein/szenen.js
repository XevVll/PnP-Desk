/* ==========================================================
   DIE HARTSKLEIN-SCHLEUSE - Szenen (Spielerkarte und Regie)
   ----------------------------------------------------------
   Eigene deutsche Fassung nach "Come Drown With Me" (One Shots
   of the Reikland, S. 4-9). Kein Buchtext, keine Originalbilder.
   Regelwerk: Warhammer Fantasy (4. Ed.).

   Alle Kennungen tragen das Praefix "hk", damit nichts mit
   einem anderen Abenteuer in ORTE oder SZENEN_REGIE
   zusammenstoesst. Szenen-IDs: hk{Oertlichkeit}.{Zustand}.

   Angemeldet ueber js/abenteuer.js - die Datei braucht deshalb
   KEINEN Eintrag in MAP_REGISTRY oder getAllSceneEntries().
   ========================================================== */

abenteuerSzenenRegistrieren('hartsklein', {
  'hk1.1': {
    label: 'Die Hartsklein-Schleuse',
    background: null,   // [OFFEN] eigener Grundriss
    markers: []         // [OFFEN] folgt mit dem Inhalt
  }
});
