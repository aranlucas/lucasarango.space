# Martian Mono web font

`MartianMono-wght400-700-wdth87.woff2` is Martian Mono 1.000 with its width axis
pinned to the site's existing `wdth: 87` and its weight axis limited to 400–700.
The site uses normal, medium, semibold, and bold. Pixelify Sans remains unchanged.

The file is **29,720 bytes**, compared with **38,392 bytes** for the previous
Latin-only, two-axis Google Fonts download. It retains all 511 Unicode codepoints
in the full upstream font, including every codepoint across the previous Google
Fonts subsets. No character subsetting, overlap removal, or hinting removal was
performed.

FontTools instancing preserves the horizontal advances and vertical metrics at
the weights used by the site. Instancing rounds outline coordinates by less than
two units out of 1,000 units per em. The explicit `Martian Mono Fallback` face in
`globals.css` preserves the previous Google loader's Arial fallback descriptors:
63.69% ascent, 12.74% descent, zero line gap, and 157.02% size adjustment.

## Source and license

- [Upstream variable font](https://github.com/google/fonts/blob/2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc/ofl/martianmono/MartianMono%5Bwdth,wght%5D.ttf)
- [Upstream OFL license](https://github.com/google/fonts/blob/2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc/ofl/martianmono/OFL.txt), copied to [OFL.txt](./OFL.txt)
- Source commit: `2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc`
- The license has no Reserved Font Name declaration after its copyright notice.

SHA-256:

```text
c3467843ec1c2574b05fbcfd7147c7bfbcf63ddca8fc2bcb9d117f1bfb1b22e7  upstream TTF
ddafd2c3f37ef1d83ef284ca63e159befd3820850c5e9eded14ca52eee92c256  OFL.txt
db22f8758af4bced93c48698ef78fbf426a8fb7dfec5c290461682a80505d3e8  MartianMono-wght400-700-wdth87.woff2
```

## Reproduce

Run from the repository root. These are one-time native FontTools commands; the
application build only needs the checked-in WOFF2 file.

```bash
python3 -m venv /tmp/lucas-fonts-venv
/tmp/lucas-fonts-venv/bin/pip install 'fonttools[woff]==4.68.0' 'brotli==1.2.1' 'zopfli==0.4.3'
curl -fL 'https://raw.githubusercontent.com/google/fonts/2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc/ofl/martianmono/MartianMono%5Bwdth,wght%5D.ttf' -o /tmp/lucas-martian-full.ttf
curl -fL 'https://raw.githubusercontent.com/google/fonts/2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc/ofl/martianmono/OFL.txt' -o src/app/fonts/OFL.txt
/tmp/lucas-fonts-venv/bin/fonttools varLib.instancer /tmp/lucas-martian-full.ttf wdth=87 wght=400:700 --no-recalc-timestamp -o /tmp/lucas-martian-full-87.ttf
/tmp/lucas-fonts-venv/bin/fonttools ttLib.woff2 compress /tmp/lucas-martian-full-87.ttf -o src/app/fonts/MartianMono-wght400-700-wdth87.woff2
sha256sum /tmp/lucas-martian-full.ttf src/app/fonts/OFL.txt src/app/fonts/MartianMono-wght400-700-wdth87.woff2
```
