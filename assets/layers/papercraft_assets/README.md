# Layered papercraft reconstruction

Open catalog/contact_sheet.jpg to inspect the assets, and catalog/stack_preview.jpg for the assembled result.

full/ contains registered 720×1280 RGBA PNGs. Place all at left:0; top:0 and draw in filename order.
trimmed/ contains losslessly cropped RGBA PNGs. Use manifest.json bounding_box.width/height for dimensions and offset.x/y for CSS position. Bounding boxes include shadow alpha. Both versions use the same filenames.

All PNGs use lossless DEFLATE level 9. Original paper grain is intentionally retained, so some broad layers remain sizeable. For a phone app, ship only trimmed/ plus manifest.json; full/ is the authoring alternative.

## Fidelity and reconstruction

This is an APPROXIMATE RECONSTRUCTION from one flattened JPEG, not recovered source layers. Visible pixels are preserved through manually traced contour masks and color-guided forest masks. Thin branches, antialiasing, JPEG fringes, embedded shading and occluded contours may need manual cleanup. Some finer forest fragments are grouped by their apparent paper depth rather than individual tree identity.

Covered areas are filled with generated paper texture swatches matching the source palette. Door interiors use continuation from visible source strips. These are plausible fills, not recovered details. Moon halos use concealed filled discs to avoid holes when moved. Deep disocclusion can reveal approximate branch or building continuations.

Each caster includes a reconstructed soft dark alpha shadow. Visible source shading is retained, with a small inverse adjustment to prevent doubled estimated shadows in the assembled stack. A single JPEG does not permit exact separation of its original shadows.

The JSON records assumptions and verification results. The stack preview is a useful registration check, but does not demonstrate correctness under large independent movement. Start with subtle parallax (2–8px); inspect revealed areas in your app.

## Example

```js
const pack = await (await fetch('manifest.json')).json();
for (const asset of pack.assets) {
  const img = new Image();
  img.src = asset.trimmed_path;
  Object.assign(img.style, {
    position: 'absolute', left: `${asset.offset.x}px`,
    top: `${asset.offset.y}px`, zIndex: asset.z_order,
    width: `${asset.bounding_box.width}px`,
    height: `${asset.bounding_box.height}px`,
  });
  document.querySelector('.scene').append(img);
}
// Parent .scene: position:relative; width:720px; height:1280px; overflow:hidden.
// Scale the entire parent uniformly for the phone viewport.
```

reference/source.jpg is included for comparison.
