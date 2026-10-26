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

### R2 wind and clock-chime sounds (2026-10-26)

- Freesound CDN previews that returned 403 on 2026-10-19 downloaded normally on 2026-10-26 (HTTP 200, valid MP3s). Candidates came from the Openverse audio API filtered to `license=cc0`, source Freesound; each record's `license` field reads `cc0`, version 1.0, linking the [CC0 deed](https://creativecommons.org/publicdomain/zero/1.0/). Freesound's own pages were not opened, so license evidence is Openverse's metadata, as for the forest bed.
- **Wind:** ["Wind Howling thru window crack.mp3" by DAVESTALKER](https://freesound.org/people/DAVESTALKER/sounds/331527), 40.5 s, bundled as `assets/audio/wind-howl.mp3` (0.93 MB preview). Loops at volume 0.3 beneath the forest bed.
- **Clock chime:** ["thirteen clock chimes high.ogg" by thebelltollsforthee](https://freesound.org/people/thebelltollsforthee/sounds/234726), 27 s, bundled as `assets/audio/clock-chime-13.mp3` (0.59 MB preview). Plays at volume 0.5, first after 25 s of running time and every 75 s after. At the Developer's request only the first 9 s (about five strikes) play, with a 1.5 s fade, because the full 27 s was too long (no audio editor installed, so it is trimmed in `app.js`); the schedule counts only running seconds, so Pause holds it.
- Credit as requested by neither author (CC0 needs none); recorded here for provenance.

### Story 2 clock art (2026-10-26)

- **Generator:** ChatGPT (OpenAI) image generation, Chat mode, with `assets/concepts/gothic-02.png` attached as the style reference. Prompts are in `assets/concepts/story2-clock-prompts.md`; the hands were requested in two follow-up messages in the same chat. Of two close-up candidates, the Developer approved candidate 1 (candidate 2 had a drawn center cap, against the prompt). ChatGPT's "which image do you like more?" prompt was skipped.
- **Outputs kept as sources:** `assets/concepts/clock-closeup-01.png` (941x1672), `clock-hand-hour.png` and `clock-hand-minute.png` (RGBA, transparent backgrounds verified by alpha measurement).
- **Web versions** (`assets/story2/`): the close-up converted to WebP (343 KB); each hand trimmed to its visible pixels and scaled to 34% (about 25 KB each), with hub pivots recorded in `clock-hands.json`. Conversion was format and size only, done in the browser; no art was redrawn or cut by the Agent.
- Generator terms of use for the images remain unverified (see earlier notes).

### Story 3 sleigh art (2026-10-26)

- **Generator:** ChatGPT (OpenAI), Work mode (GPT-6.1 Sol Medium), with `gothic-02.png` and the moon, hill and spiral-tip layers attached. The prompt is in `assets/concepts/story3-spiral-prompts.md`; the first attempt failed with "image-processing workspace unavailable" and a single retry succeeded after about 11.5 minutes. Output: a zip of five curl frames and a sleigh sprite (near-black sleigh and eight reindeer, 520x115 RGBA).
- **Used:** `assets/story3/sleigh.png` (the sprite, unchanged).
- **Not used:** the five curl-uncurl frames. The Developer judged that the uncurled hill did not line up with the scene, so the uncurl was dropped and the story became a sleigh crossing the moon with screen effects. The frames and the original pack stay uncommitted.
- Screen effects (moon flare, vignette, glitter trail, star glints) and the wind and jingle-bell sounds are generated in code; no audio files were added.
- Generator terms of use for the images remain unverified (see earlier notes).

### Generator terms of use check (2026-10-26)

- **OpenAI (ChatGPT images):** the primary terms page (openai.com/policies/row-terms-of-use) returned HTTP 403 to automated fetch, so it was **not** read directly. Secondary sources ([terms.law comparison](https://terms.law/ai-output-rights/comparison), an [OpenAI community thread quoting the terms](https://community.openai.com/t/can-i-sell-images-that-dall-e-created/595044), and a [2026 explainer](https://blog.kaboompics.com/can-you-use-ai-generated-images-for-commercial-use/)) consistently report that OpenAI assigns its rights in Output to the user, usable for any purpose including commercial, subject to compliance with the terms. They also note that ownership is contractual, purely machine-generated output may lack copyright protection, and similar output can go to other users. The sources are mostly law-firm marketing and forums and conflict on free-tier details. **Status: not confirmed from the primary source; the Developer should read OpenAI's current Terms of Use before delivery.** This is a class project and the art is credited as generated with ChatGPT (OpenAI).
- **xAI (Grok):** concepts `grok-concept-01..04` came from Grok Imagine's free tier before it ran out. Its terms were not checked; the final scene uses the ChatGPT-generated `gothic-02.png`, and the Grok concepts are archived sources only.

## Revisions

Update decisions when new evidence changes the direction, linking to playtest observations in `plan.md` rather than copying them. Keep chosen behavior and asset requirements in `spec.md`. The Developer confirms when the inquiry is sufficient to continue building; exhaustive research is not a prerequisite.

## Saving the transcript

When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
