# Gothic parallax scene

24 layers, in the requested stacking order, on a 941 × 1672 canvas.

- `full/`: 24 full-canvas, lossless RGBA master PNGs. Align every file at (0, 0).
- `trimmed/`: 24 web-optimized transparent PNGs. Total: **3,473,002 bytes (3.47 MB)**.
- `manifest.json`: filenames, stacking order and each trimmed rectangle in full-canvas pixels.
- `hotspots.json`: ornament rows, star, door, moon, clock face/hand pivot, branch pivots, shutter hinges, lanterns, windows and glowing pumpkins.
- `catalog/`: asset table, contact sheet, closed/open-door previews, source reference and validation results.

## Drawing

Draw ascending `stackingOrder`. For the masters, draw each at (0, 0).
For the optimized files, draw each at `trimmed.x, trimmed.y` without rescaling its individual width or height:

```js
for (const layer of manifest.layers) {
  const image = await loadImage(layer.trimmedFile);
  context.drawImage(image, layer.trimmed.x, layer.trimmed.y);
}
```

Scale the entire 941 × 1672 scene uniformly to the device. Scale hotspots by that same factor. When rotating a trimmed image, subtract its trimmed x/y from the full-canvas pivot to obtain the pivot inside the trimmed image.

## Rigging

Hide or rotate layer 15 to expose the snowy Christmas interior on layer 14. The tree frame (13) has a transparent doorway. The clock body (6) has a transparent face recess, and layer 7 supplies the face and hands. Layer 4 is the separate curled hill tip. Layers 21 and 23 are the upper framing branches. Layer 10 contains both open shutters; use the two shutter bounds and hinge edges to draw them independently.

## Formats and quality

The full masters retain their RGBA pixels without color quantization. The trimmed web PNGs use per-object RGBA palettes (indexed PNG with transparency) for the size target, and browsers decode them to RGBA. Master and web previews are both supplied for comparison. Use the masters for further editing or if lossless source colors are needed.

Hidden areas are plausible reconstructions from a single flattened image. Gentle motion is intended; large displacements can expose approximated textures. The static stack closely retains the supplied scene, with the requested shutters added. The Christmas insert appears in the open-door preview.
