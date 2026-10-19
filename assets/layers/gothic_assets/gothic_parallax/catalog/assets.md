# Gothic parallax asset catalog

Canvas: **941 × 1672 pixels**. All positions use a top-left origin. Files are numbered in back-to-front draw order.

| Order | Layer | Trim x | Trim y | Width | Height | Web bytes |
|---:|---|---:|---:|---:|---:|---:|
| 01 | 01_sky_stars.png | 0 | 0 | 941 | 1672 | 1,225,023 |
| 02 | 02_moon.png | 110 | 47 | 335 | 335 | 69,908 |
| 03 | 03_spiral_hill_body_trees_fence.png | 0 | 156 | 941 | 418 | 187,914 |
| 04 | 04_spiral_tip.png | 534 | 152 | 179 | 173 | 15,128 |
| 05 | 05_town_back_buildings.png | 0 | 303 | 941 | 366 | 186,349 |
| 06 | 06_clock_tower_body.png | 500 | 316 | 108 | 289 | 14,045 |
| 07 | 07_clock_face_hands.png | 541 | 432 | 32 | 36 | 2,048 |
| 08 | 08_town_left_front_buildings.png | 36 | 342 | 363 | 325 | 63,771 |
| 09 | 09_biggest_house_purple_roof.png | 626 | 429 | 312 | 284 | 41,332 |
| 10 | 10_biggest_house_open_shutters.png | 708 | 573 | 106 | 86 | 5,316 |
| 11 | 11_town_wall_fences_stairs_path_jackolanterns.png | 0 | 494 | 941 | 314 | 158,270 |
| 12 | 12_dark_background_forest.png | 0 | 575 | 941 | 1097 | 558,867 |
| 13 | 13_big_door_tree_trunk_arched_frame.png | 19 | 682 | 887 | 640 | 204,781 |
| 14 | 14_door_interior_snowy_christmas.png | 401 | 927 | 203 | 318 | 42,732 |
| 15 | 15_green_christmas_door_panel.png | 399 | 924 | 207 | 323 | 39,479 |
| 16 | 16_front_steps_two_lanterns.png | 343 | 1174 | 334 | 169 | 25,074 |
| 17 | 17_left_bushes_pumpkin.png | 0 | 1125 | 433 | 488 | 92,861 |
| 18 | 18_right_bushes_pumpkin.png | 510 | 1187 | 431 | 434 | 85,653 |
| 19 | 19_stone_path.png | 147 | 1311 | 787 | 361 | 103,074 |
| 20 | 20_left_foreground_trunk.png | 0 | 0 | 355 | 1672 | 131,228 |
| 21 | 21_left_foreground_upper_branches.png | 0 | 0 | 475 | 338 | 39,440 |
| 22 | 22_right_foreground_trunk.png | 651 | 0 | 290 | 1672 | 107,712 |
| 23 | 23_right_foreground_upper_branches.png | 499 | 0 | 442 | 207 | 26,886 |
| 24 | 24_foreground_bottom_leaves.png | 0 | 1404 | 941 | 268 | 46,111 |

## Previews

- `catalog/contact_sheet.jpg`: all 24 layers on checkerboard backgrounds at their original positions.
- `catalog/stack_preview.png`: lossless full-canvas layers recomposited in order.
- `catalog/door_open_preview.png`: the same stack with the green door panel hidden.
- `catalog/web_stack_preview.jpg`: the optimized trimmed set recomposited at manifest coordinates.

## Interaction map

`hotspots.json` records all coordinates in full-canvas pixels. The nine colored spherical ornaments form four rows, counted from the bottom: 3, 2, 2, 2. The star is separate. The clock face includes its hands; its hand pivot is supplied for subsequent rigging. The two shutters share layer 10, with individual crop rectangles and hinge segments supplied for splitting or separate drawing.

The green door has a left hinge. The right-hand handle stays on the door panel. The two swaying crowns have separate pivots; the spiral tip also has a suggested neck pivot. Lanterns, village windows and four glowing jack-o’-lanterns have center/radius entries. Unlit foreground pumpkins are included in the bush layers and are not listed as glowing jack-o’-lanterns.

## Reconstruction and provenance

Visible source object surfaces were retained during hand-traced separation. The sky was reconstructed as a complete clean starfield so no object fragments remain behind moving pieces. Hidden surfaces use reconstructed artwork, source texture continuation and matching background plates. Reconstruction is intended for small parallax offsets and gentle swaying; unseen geometry is an artistic approximation. The original contains no shutters, so the requested open wooden pair was painted beside the largest window of the right-hand house. The snowy Christmas interior is new artwork and is concealed by layer 15 in the default stack.

The sky, hidden moon, hill and forest plates, Christmas doorway and shutters were developed with the built-in image-generation tool using the source as the style and composition reference. Cutouts, coordinate mapping, texture continuation, web optimization and previews were assembled locally. No added text or watermarks appear in the scene artwork.
