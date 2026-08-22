#!/usr/bin/env python3
"""Verkleinert neu abgelegte Bilder in images/ und wandelt sie nach WebP um.

Hintergrund: Die von Gemini generierten Bilder kommen oft in absurd hoher
Auflösung (teils >2800px Kantenlaenge) und als verlustfreies PNG mit
ungenutztem Alpha-Kanal daher - einzelne Dateien lagen bei 7-9 MB, obwohl
sie auf der Karte nie groesser als ein paar hundert Pixel dargestellt
werden. Das hat spuerbare Ladezeiten/Lags verursacht (siehe Juli 2026).

Nutzung: Neues PNG/JPG (von Gemini) in images/ ablegen, dann:

    python3 tools/optimize_images.py

Wandelt jedes *.png/*.jpg/*.jpeg in images/ in ein gleichnamiges *.webp um
(Gemini liefert je nach Export mal PNG, mal JPG). Alpha wird
entfernt, falls ohnehin voll deckend; Kantenlaenge wird je nach vermuteter
Kategorie gedeckelt), loescht danach die Quelldatei NICHT automatisch (bewusst -
erst pruefen, ob das Ergebnis gut aussieht), und traegt den neuen
Dateinamen nicht automatisch in js/*.js ein - das bleibt manuell, da nur
Hendrik/Claude wissen, zu welchem Marker/Charakter ein neues Bild gehoert.

Kategorie-Zuordnung (nur nach Dateiname, bei Bedarf hier anpassen):
  - "interior_*"                        -> Innenraum-/Ortsbilder, Kappung 1600px
    (Anzeige: Overlay-Karte max. 720px breit, siehe korsaren_szenen-Overlay)
  - bekannte Kartenbilder (Stadt/Schiff) -> Kappung 1920px
    (Anzeige: ggf. bildschirmfuellend)
  - alles andere (Annahme: Portraits)    -> Kappung 900px
    (Anzeige: Charakterleiste, max. ~220 CSS-px breit)
"""

import os
import sys
from PIL import Image

IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'images')

MAP_NAMES = {
    'grimsgate_map.png', 'golden_lion.png', 'golden_lion_cutaway.png',
    'golden_lion_cutaway_sturm.png', 'schatzinsel.png',
    'spanischer_hafen_map.png', 'schmugglernest_map.png', 'scene_artefakthandel.png',
    'riffinsel.png'
}

WEBP_QUALITY = 82  # bei sichtbaren Artefakten hochsetzen, siehe Bibel 14.4

# Gemini exportiert je nach Weg PNG oder JPG - beide akzeptieren, sonst wird
# ein frisch generiertes Bild beim Sammellauf stillschweigend uebersprungen.
SOURCE_EXTS = ('.png', '.jpg', '.jpeg')


def cap_for(fname):
    if fname.startswith('interior_'):
        return 1600
    # MAP_NAMES ist historisch mit .png-Endungen gepflegt - Endung normalisieren,
    # damit ein als .jpg geliefertes Kartenbild nicht auf 900px gekappt wird.
    stem = os.path.splitext(fname)[0]
    if fname in MAP_NAMES or (stem + '.png') in MAP_NAMES:
        return 1920
    return 900  # Annahme: Portrait


def optimize(path):
    fname = os.path.basename(path)
    before = os.path.getsize(path)

    im = Image.open(path)
    if im.mode in ('RGBA', 'LA', 'P'):
        rgba = im.convert('RGBA')
        fully_opaque = rgba.split()[-1].getextrema() == (255, 255)
        im = rgba.convert('RGB') if fully_opaque else rgba
    else:
        im = im.convert('RGB')

    cap = cap_for(fname)
    w, h = im.size
    longest = max(w, h)
    if longest > cap:
        scale = cap / longest
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    out_path = os.path.splitext(path)[0] + '.webp'
    im.save(out_path, 'WEBP', quality=WEBP_QUALITY, method=6)
    after = os.path.getsize(out_path)
    print(f"{fname} -> {os.path.basename(out_path)}  "
          f"{before/1024:.0f} KB -> {after/1024:.0f} KB "
          f"(-{100*(1-after/before):.0f}%), {im.size[0]}x{im.size[1]}")


def main():
    targets = sys.argv[1:] or [
        os.path.join(IMAGES_DIR, f) for f in os.listdir(IMAGES_DIR)
        if f.lower().endswith(SOURCE_EXTS)
    ]
    if not targets:
        print("Keine PNG/JPG-Dateien in images/ gefunden - nichts zu tun.")
        return
    for path in targets:
        optimize(path)
    print("\nFertig. Quelldateien wurden NICHT geloescht - nach Sichtpruefung von Hand "
          "entfernen und den neuen .webp-Dateinamen in js/scenes.js, "
          "js/golden_lion_scenes.js bzw. js/characters.js eintragen.")


if __name__ == '__main__':
    main()
