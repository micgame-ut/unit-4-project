# Layer-cut prompt — v2 (for ChatGPT, Work mode, with gothic-02.png attached)

Cut the attached image (941×1672) into separate transparent PNG layers for a 2D parallax web
scene, and produce an asset catalog. Requirements:

**Canvas and files**
- Every layer: RGBA PNG at the full 941×1672 canvas, plus a trimmed version (cropped to its
  visible pixels). Number files in back-to-front stacking order.
- `manifest.json`: for each layer, its file name, stacking order, and the trimmed x, y, width,
  height on the full canvas.
- A contact sheet of all layers and a stack preview (all layers recomposited) to verify the
  result matches the original.
- Optimize the trimmed set for the web (target under ~4 MB total) without visible quality loss.

**Layers (back to front)**
1. Sky with stars
2. Moon
3. Spiral hill body with its bare trees and fence (the curl removed; fill the sky behind it)
4. Spiral tip: the curled top of the hill on its own, so it can later be animated uncurling
5. Town — back buildings
6. Clock tower body (clock face area left transparent)
7. Clock face with its hands on its own
8. Town — left front buildings
9. Biggest house (right, purple roof) without its window shutters
10. Shutters of the biggest house, on their own
11. Town wall, iron fences, stone stairs, curving path, and jack-o'-lanterns
12. Dark background forest behind the big tree
13. Big door tree: trunk and arched door frame, with the doorway itself left **empty/transparent**
14. Door interior: paint a new scene that fills the doorway opening — a glimpse of a snowy
    Christmas world (snow-covered ground, a few snowy evergreens, soft warm lights, falling
    snow), lit warmly, in the same handcrafted stop-motion style
15. Door panel only: the green wooden door with the painted Christmas tree, star, and
    ornaments, cut cleanly along its arched edge and the glowing outline
16. Front steps and the two lanterns
17. Left bushes and pumpkin
18. Right bushes and pumpkin
19. Stone path
20. Left foreground framing tree trunk
21. Left framing tree's upper branches on their own (for gentle swaying)
22. Right foreground framing tree trunk
23. Right framing tree's upper branches on their own (for gentle swaying)
24. Foreground leaves along the bottom edge

If the house has no visible shutters, paint a matching pair of open wooden shutters beside its
largest windows on layer 10.

Hidden areas revealed by cutting should be filled plausibly in the same style.

**Interaction coordinates (`hotspots.json`, full-canvas pixels)**
- `ornaments`: every ornament on the door as {x, y, radius}, grouped into **four rows from
  lowest (row 1) to highest (row 4)**
- `star`: the star at the top of the door tree {x, y, radius}
- `moon`: center and radius; `clockFace`: center, radius, and the pivot point of the hands
- `branchPivots`: the point where each swaying branch layer joins its trunk
- `shutterHinges`: the hinge edge of each shutter
- `door`: the door panel's bounding box and which edge is the hinge side
- `lanterns`, `windows`, `jackolanterns`, `clock`: center points {x, y, radius} of each glowing
  light source, for flicker overlays

No text or watermarks. Deliver everything as one zip.
