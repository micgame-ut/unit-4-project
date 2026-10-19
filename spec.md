# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep a concise, testable description of the experience currently being built.

## Working agreement

Developer: Begin with the running prototype, approve the intended behavior, test it directly, and update this file when the intended result changes.

Agent: Read `AGENTS.md`, `brief.md`, `research.md`, and this file, then inspect the project. Turn decisions into acceptance checks without inventing product choices or freezing details that still require testing.

Start a fresh chat with:

`Read the project documents, inspect the running prototype, and help me specify the next useful build checkpoint.`

## Current build contract

Define only enough to build and verify the current direction:

- the intended User experience and chosen scene, ambience, and story behavior
- the system structure, shared rules, and states that keep audiovisual behavior and interaction coordinated
- the assets and layout needed for that structure, linking to sources and credits in `research.md`
- acceptance checks for the chosen behavior and every requirement in `brief.md`, including accessibility and failure behavior

Reference the brief's fixed requirements rather than copying them. Specify your decisions precisely enough that the Developer and Agent can judge the same result. Leave untested details open until they are needed, and distinguish provisional ideas from approved behavior.

### Approved Phase 1 direction

- Create an original, vertical papercraft/storybook scene in three connected zones: a moonlit hill, a small town, and woods containing doors to other holidays. Use the supplied screenshots as broad references for a cozy palette, layered depth, a winding path, and clear phone-sized presentation—not as artwork or a source for copied characters or distinctive designs.
- The original scene concept used three doors integrated into tree trunks: an evergreen, a pumpkin, and a friendly turkey. The active Phase 1 scene now follows the evergreen-only revision below.
- Phase 1 contains one discoverable story, triggered by a holiday door. Its approved sequence is a 5–10 second glow, opening, playful seasonal reveal, and closing, followed by a clear return to exploration. Which door and what it reveals remain open until the scene is built and reviewed.
- The first build checkpoint is only the responsive static composition and Enter screen. Do not treat ambience, Play/Pause, reduced-motion behavior, story interaction, deployment, or phone testing as complete until implemented and verified.

### Revision: AI-generated layered art (2026-10-19)

- The CSS-drawn composition is replaced by AI-generated papercraft art, following the course's demonstrated workflow (generate variations → select → cut into layers → rebuild). The Developer selected `assets/concepts/grok-concept-04.jpg` (copied as `chosen-scene.jpg`); its 36 extracted layers live in `assets/layers/papercraft_assets/`. Sources and credits are in `research.md`.
- **Developer decision:** keep the spiral hill as generated. It closely resembles a famous film silhouette, which conflicts with the originality guidance above; this risk is accepted for now and should be revisited before delivery.
- The app loads only the active `trimmed/` PNG layers, `manifest.json`, and the local evergreen grove mask. `full/`, `catalog/`, and `reference/` are authoring material.
- Hidden areas behind each layer are AI-inferred fills, so movement between layers should stay subtle (roughly 2–8px) until revealed areas are checked.

### Approved Checkpoint 2 behavior (2026-10-19)

- If the device requests reduced motion, explain that on the start screen and keep the ambient effects still; otherwise let the effects animate after Enter.
- Enter starts the looping, locally bundled CC0 forest ambience and the scene together. A single Play/Pause button controls the ambience and all three ambient effects: drifting grove mist, fireflies, and gently glowing town windows. The effects are CSS-only, so there are no independent timers to keep in sync.
- Pausing freezes the effects and audio together; resuming continues the audio from its paused position. Audio start/load failures remain paused and are reported in a live status message with a Play-to-retry path.
- Story interactions remain out of scope for this checkpoint; they will use the shared running/paused state when implemented.

### Approved First Story behavior (2026-10-19)

- The evergreen door is the first story trigger. To keep the sequence reliable at phone size, it uses one accessible hit target: each of three taps advances a different glimmer from lowest to highest, with distinct light-and-sound feedback and visible progress. The soft chimes are original Web Audio.
- Progressive hints become more specific while the scene is idle. The global Play/Pause control pauses and resumes the story, hint timing, audio, and available input together.
- Completing the sequence starts a roughly 7-second reveal: the tree lifts above the still-closed door and holds; the door then opens in warm light; after a short hold, it closes before the tree lands with a gentle squash-and-stretch. Exploration is clearly restored, and the story can be replayed without reloading.
- Under reduced motion, preserve the story's cues and timing without the lift, door swing, or squash-and-stretch. Story chimes are synthesized in the browser; no additional external story-audio files are bundled.

### Revision: centered evergreen-only scene and staged reveal

- The active scene contains one centered evergreen door and its tree character. The pumpkin and turkey doors and characters are retired from the composition and are not to be restored.
- The generated front-tree layer has two additional arch frames baked into its pixels; `assets/masks/evergreen-only-grove.svg` removes those retired side frames and reveals the existing forest layers beneath.
- The complete Phase 1 story uses distinct visual beats within about 7 seconds: tree lift and hold (0–2.2s), door opening (2.2–3.2s), warm-light hold (3.2–5s), door closing (5–5.8s), and tree landing/squash (5.8–7s). This keeps the lift visibly complete before the door starts to open.
- Reduced motion keeps the story timing and audiovisual cues but uses a static raised-tree/open-door reveal.
- The brief still calls for three stories overall. The two later stories need newly selected triggers that do not reuse the retired pumpkin/turkey characters or doors; their designs remain open for Phase 2.

### Revision: gothic stop-motion redo (2026-10-19, approved direction)

- **Developer decision:** redo the scene with higher fidelity in a gothic stop-motion style inspired by the classic holiday film, following each zone's reference loosely — "inspired, not copied" (option A). Recognizable designs are reinterpreted, never reproduced exactly; prompts do not name the film. This supersedes the papercraft art and the originality wording above where they conflict.
- Zones top to bottom: moon and spiral-peaked hill → crooked gothic town → forest clearing with **only** the Christmas-tree door. No pumpkin or turkey doors or characters.
- Workflow (instructor's): prompts in `assets/concepts/prompts-v2.md` → Developer generates variations in Grok → Developer selects → ChatGPT cuts layers + catalog + trimmed set → Agent rebuilds to match. Concept art is generated without fog; fog is added in code later.
- Before the rebuild, the current papercraft build is moved to `archive/papercraft-scene/`. Enter screen, Play/Pause, and audio behavior are kept.
- **Selected concept:** `assets/concepts/gothic-02.png` (ChatGPT image generation, 941×1672) — arched tree frame, large Christmas-tree door. Grok's free tier was exhausted, so ChatGPT replaced Grok for generation.
- **First story (approved design, timing provisional):** the player taps the door four times; each tap lights one row of ornaments, lowest row first, as visible progress. On the fourth tap the door swings open on its hinge to a glimpse of a snowy Christmas world, a gust of snow bursts out and covers the whole scene, then clears and the scene resets (door closed, lights off) so the story can replay. One shared timeline drives the sequence so Play/Pause and interaction locking apply to all of it.
- **Layer-cut requirements from the story:** separate door panel, door frame/trunk, and a painted "snowy Christmas world" interior behind the door; ornament positions grouped into four rows (lowest to highest) as JSON coordinates. Ornament glows are code overlays, not cut layers. Other interactions will be animated the same way and may add cut requirements.
- **Story 1 finale:** the star lights up as the door opens.
- **Ambient set (approved):** layered fog, clock chimes (sound), wind (sound), moon glow, house shutters, window and lantern flicker, small tree-branch sway.
- **Story 2 — clock tower (approved concept, Phase 2):** interacting with the clock transitions to a separate close-up scene of the clock tower; in the close-up the player drags the clock hands to midnight; on success the view backs out to the original scene and the midnight animation plays. The close-up is its own generated image and layer set. Trigger tap count/hints still open.
- **Story 3 — the spiral uncurls (approved concept, Phase 2):** tapping the moon makes the hill's spiral uncurl, a silhouette of Santa's sleigh and reindeer flies across the moon, and the spiral curls back up. Uncurl frames and the sleigh silhouette come from ChatGPT. The pumpkin-choir idea is rejected.
- **Shutters** are on the biggest house (right, purple roof) and bang in the wind as ambient motion. **Branch sway** applies to the two large frame trees only.
- **Asset rule:** visuals an animation needs (frames, extra pieces, close-ups) are generated or animated through ChatGPT first, then built from its output; the Agent does not cut or draw them itself.
- **Done when:** the rebuild matches the selected source at 390×844 and 320×568, every layer loads with no 404s, Enter still works by touch and keyboard, and credits are updated in `research.md`. Fog, clouds, secondary motion, and stories are out of scope for this checkpoint.

### Acceptance checks

- The scene is a single, vertically composed screen with no scrolling and all three zones, the path, and the centered evergreen door visible together.
- The moonlit hill, town, and centered evergreen-door grove are visually distinct and readable at phone size.
- The layered rebuild follows the current centered evergreen-only composition at phone size, with no missing or misaligned active layers; intentionally retired pumpkin/turkey layers are not displayed. Every AI-generated asset is credited in `research.md`.
- The Enter screen precedes the scene and its button works with touch and keyboard.
- The device's reduced-motion preference is communicated before Enter and prevents ambient animation; without that preference, Enter starts ambience and all three effects. Play/Pause coordinates audio and effects, and audio failures are announced.
- The evergreen story's ordered trigger, progressive hints, success/reset feedback, approximately 7-second reveal, reduced-motion behavior, replay, and return to exploration work with touch and keyboard. The global control pauses and resumes the story and its timing as well as ambience.
- The Phase 1 story is discoverable, gives audiovisual feedback, lasts 5–10 seconds, can be replayed without reloading, and returns clearly to the interactive scene.
- Before Phase 1 delivery, verify the brief's complete start/audio, reduced-motion, unified Play/Pause, accessibility, HTTPS deployment, physical-phone, and project-file requirements. Track evidence and remaining work in `plan.md`.

## Scope and revisions

Record excluded ideas, the next behavior that must work, and consequential requirement changes with their evidence.

## Saving the transcript

When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
