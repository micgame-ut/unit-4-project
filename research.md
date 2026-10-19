# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep the evidence and creative decisions that currently guide the build.

## Working agreement

Developer: Run the starter first. Direct the inquiry, judge sources and options, make consequential decisions, and keep this file current.

Agent: Read `AGENTS.md`, `brief.md`, and this file, then inspect the project. Help compare possibilities, test assumptions quickly, and verify external sources without delaying the prototype for exhaustive research.

Start a fresh chat with:

`Read brief.md and research.md, inspect the running project, and help me develop the scene and three spooky stories.`

## Inquiry and decisions

Record only what informs the next build decisions:

- creative alternatives for the scene, stories, and audiovisual direction, with reasons for your choices
- useful sources and references, what they support, and important limitations
- experiments that resolve uncertainty, the results, and consequential trade-offs

Investigate unfamiliar techniques or asset sources as needed. Verify usage terms and keep source links and required credits here. Distinguish evidence from assumptions; the Agent's recommendation alone is not evidence.

### Phase 1 visual reference

The Developer supplied two phone screenshots from the example video. The first shows a centered title, short invitation, and prominent Enter button; the second shows a large moon, layered cottage-and-garden scene, winding path, friendly ghost, and a small pause control. These support borrowing a clear mobile hierarchy, cozy storybook mood, layered depth, and restrained text. They do not define the new scene's art or content: the approved direction is an original hill, town, and holiday-door woods. The video itself was not available for inspection, so these stills are the only visual evidence used.

The Developer also supplied reference images of a dramatic moonlit hill, a dense miniature-style town, and a decorated tree in a forest, plus a Holiday Doors wiki link that could not be accessed. The Developer clarified the three portal motifs: evergreen/holiday tree, pumpkin, and turkey, each set into a tree trunk that opens. These references informed the broad concept only. The chosen art direction is original layered papercraft, with a newly designed hill silhouette, town architecture, and tree-door shapes; do not reproduce the film's exact hill, set, door designs, characters, or compositions.

For concept exploration, generate several separate vertical 9:16 variations from a text prompt, with no interface or lettering. Prefer clear, distinct foreground/middle/background forms and restrained overlap so the selected image can be separated into layers. Review the generated options before choosing the composition or beginning asset extraction; the image itself remains provisional until the Developer selects it.

### Concept generation and layer extraction (2026-10-19)

Followed the instructor's demonstrated workflow: generate many variations quickly, choose one, have an AI cut it into layers with a catalog, then rebuild it in code.

- **Generation — Grok Imagine (xAI), grok.com/imagine, Speed mode, 9:16.** The Developer's full papercraft prompt (three zones; moon and crooked hill; quirky town; grove with tree, pumpkin, and turkey doors; navy/plum/teal/amber palette; no text; explicit originality instructions) produced four images before the free tier stopped. Saved as `assets/concepts/grok-concept-01.jpg` through `-04.jpg` (720×1280).
- **Result:** all four ignored the instruction to avoid a spiral hill. The Developer chose `grok-concept-04.jpg` (oval grove frame, ringed moon) and decided to keep the spiral hill — see `spec.md`.
- **Layer extraction — ChatGPT (OpenAI), Work mode, GPT-6.1 Sol.** Produced 36 numbered RGBA layers (full-canvas and trimmed), a contact sheet, a stack preview, and JSON/Markdown manifests: `assets/layers/papercraft_assets/`. ChatGPT describes it as an approximate reconstruction: hidden areas use generated paper-texture fills, shadows are estimated, and thin branches and edges may need cleanup. Its own check reports a mean recomposition error of about 0.1/255 against the source.
- **Size:** 9.4 MB zip; the shippable `trimmed/` set is about 3.7 MB as lossless PNG. Converting to WebP could shrink it further but needs a local image tool.
- **Credits:** "Scene artwork generated with Grok Imagine (xAI); layers separated with ChatGPT (OpenAI)."
- **Not yet verified:** xAI's and OpenAI's current terms for using generated images in a course project. Check them before delivery.

### Gothic stop-motion concepts (2026-10-19)

- **Grok Imagine:** both Quality and Speed modes showed a subscription prompt and generated nothing; the free allowance appears exhausted. The Developer chose ChatGPT as the generator instead.
- **Generation — ChatGPT image generation (OpenAI), Chat mode.** Prompts: `assets/concepts/prompts-v2.md` (base prompt; variation 2 = moon left, arched tree frame, larger door; variation 3 = colder palette, tall striped town, low camera). Results: `assets/concepts/gothic-01.png` to `-03.png`, each 941×1672 PNG.
- **Selected:** `gothic-02.png` — large, tappable door with four ornament rows under the star. Observation: all three outputs drew the hill very close to the film's spiral hill even though the prompt did not name it; the Developer's "inspired, not copied" decision applies.
- **Credits (update):** "Scene artwork generated with ChatGPT image generation (OpenAI)."
- **Layer cut — ChatGPT (OpenAI), Work mode, GPT-6.1 Sol Medium**, prompt `assets/concepts/layer-cut-prompt-v2.md`. Output: `assets/layers/gothic_assets/gothic_parallax/` — 24 full-canvas RGBA masters, 24 trimmed web PNGs (3.47 MB, indexed-palette), `manifest.json`, `hotspots.json` (9 ornaments in 4 rows, star, door with left hinge, moon, clock pivot, branch/spiral pivots, shutter hinges, 2 lanterns, 22 windows, 4 jack-o'-lanterns), contact sheet, stack and open-door previews. ChatGPT reports mean error 0.74/255 vs. source; Agent check: all 24 trimmed sizes match the manifest and fit the canvas; stack preview visually matches `gothic-02.png`. Shutters were painted in (the source had none); the snowy interior is newly generated. The spiral-tip layer holds only the inner curl, so the uncurl frames will need their own ChatGPT pass.

### Evergreen-only scene revision

- The Developer chose to make the centered evergreen door the only active door and retire the pumpkin/turkey characters and doors from the composition. Their extracted source layers remain in the authoring set but are not referenced by the scene.
- The generated foreground-tree layer also contains two baked-in side-door arches. `assets/masks/evergreen-only-grove.svg` masks those arches so the forest layers beneath show through; the original extracted PNG is preserved.
- The brief's two remaining stories still need new triggers that do not use the retired motifs.

### Ambient audio source (2026-10-19)

- **Selected sound:** ["sfx_amb_forest_winter_night.wav" by bajko](https://freesound.org/people/bajko/sounds/378048), from Freesound. The local app uses the 1.16 MB MP3 preview at `assets/audio/forest-winter-night.mp3`; Openverse metadata lists it as 50.626 seconds.
- **License evidence:** Openverse's [audio record](https://api.openverse.org/v1/audio/aa38cde0-8e82-491e-a8c2-6a8fb4b2eaad/) identifies the Freesound source as CC0 1.0 and links the [CC0 deed](https://creativecommons.org/publicdomain/zero/1.0/). The deed permits copying, modification, distribution, and performance without asking permission. Freesound's landing page presented an account-verification prompt during this review, so the license classification was verified through Openverse's Freesound metadata rather than the landing page itself.
- **Runtime:** the audio is bundled locally, loops, and begins only after Enter. The app provides a shared pause/resume control and an accessible message/retry path if playback fails.

### First-story sound investigation (2026-10-19)

- Openverse search identified CC0 Freesound candidates: ["4-tone chime UP" and "4-tone chime DOWN" by mpaol2023](https://freesound.org/people/mpaol2023/sounds/370182) / [DOWN recording](https://freesound.org/people/mpaol2023/sounds/370177), and ["Wooden door creaking" by TheBuilder15](https://freesound.org/people/TheBuilder15/sounds/367052). Openverse metadata labels each CC0 1.0 and links the [CC0 deed](https://creativecommons.org/publicdomain/zero/1.0/).
- Their Freesound preview URLs returned HTTP 403 through both PowerShell and curl, so no candidate was bundled. The approved story uses short, original Web Audio chimes instead; the existing locally bundled ambience remains its licensed background audio.

## Revisions

Update decisions when new evidence changes the direction, linking to playtest observations in `plan.md` rather than copying them. Keep chosen behavior and asset requirements in `spec.md`. The Developer confirms when the inquiry is sufficient to continue building; exhaustive research is not a prerequisite.

## Saving the transcript

When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
