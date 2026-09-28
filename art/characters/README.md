# Reusable Advent cast · draft v3

Generated with the built-in image_gen tool using the supplied book cover and family photo. No original photos, character masters or scenes have been uploaded/published. `art/` is excluded from Docker deployment context. These are likeness drafts for review, not an assertion that the depicted people approved publication.

## Files

- `sources/book-character-reference.jpeg`: unmodified original cover reference.
- `sources/family-reference.jpg`: unmodified full-resolution family photo.
- `v1/mike-christian-turnaround-v1.png`: true-alpha transparent master, 1024×1536. Top row Mike; bottom row Christian. Front, three-quarter and profile views.
- `v1/family-cast-v1.png`: twelve numbered portraits, 1214×1295, opaque white background. Adults/older family members 01–11 follow their left-to-right position in the supplied photo; baby is 12. Names have now been confirmed; the current v2 sheet removes John’s hat.
- `v1/advent-crafting-scene-v1.png`: sample new scene using the host master as the image reference.
- `v1/prompts.json`: exact prompts, generation method and version.
- `v1/checksums.json`: SHA-256 integrity values for the three generated masters.
- `v1/preview.html`: local gallery with reversible view/background selection.
- `../../lib/characters/catalog.json` (repository-root `lib/characters/catalog.json`): stable character IDs and non-destructive display viewports.
- `components/CharacterAvatar.tsx` at repository root: reusable React renderer for these master sheets, accepting an explicit asset URL.

## Identity rules

Mike: stocky adult silhouette, round/broad face, receding short brown hair, burgundy polo, blue jeans, brown shoes. Christian: slender adult silhouette, narrow face, short sandy hair, rectangular glasses, sage shirt, blue jeans, brown shoes. Keep adult ages and facial structures. Change wardrobe only when requested; preserve underlying build, hairline and glasses. Do not substitute the family photo for the established book identity without an explicit decision.

Family portraits preserve the visible hair, glasses, face and clothing differences as a first pass. Numbered asset IDs remain stable; names are confirmed by the user. Portrait 07 and the book host Mike share identityId `mike`. The photo includes a baby; the drawing is an age-at-photo reference, not a claim about current age.

## How modifications work

1. Use the selected master image as an image reference, not just a text description.
2. Specify stable character ID, expression, outfit and pose changes separately. Explicitly preserve identity features.
3. Save a new version or variant; do not overwrite approved masters. Record the prompt, parent reference and output checksum.
4. Review the face/build against the master before approving a new scene. Generation improves consistency but cannot guarantee pixel-identical faces.
5. After review, publish appropriate rendered assets under versioned S3 keys such as `celebrations/characters/v1/`. Supply approved URLs to CharacterAvatar; never expose the original family photograph or reference cover through a public route.
6. For surprise scenes, the existing calendar API must authorize the day's reveal before returning a signed media URL. Public host avatars and locked-door scenes are different assets.

These PNGs are editable through reference-based image generation or a raster editor. They are **not layered vector files, skeletal rigs, or separately movable face/body parts**. The React component can change view, size and surrounding background without editing the PNG. If animation or fully deterministic outfit swaps become necessary, commission/build a layered vector character rig from the approved masters as a separate deliverable. Do not label a flattened PNG as an editable SVG master merely because the renderer uses an SVG viewport.

Example (URL supplied by your configured media service):

```tsx
<CharacterAvatar characterId="mike" view="threeQuarter" assetUrl={approvedHostsSheetUrl} width={180} />
<CharacterAvatar characterId="family-01" assetUrl={approvedFamilySheetUrl} width={96} />
```

The family sheet remains opaque white; changing a page background will not remove that white. Individual transparent family cutouts and expression/outfit packs should follow likeness review and name mapping.

## Confirmed cast and current revision

Current sheet: `v3/family-cast-v3.png`. Current gallery: `v3/preview.html`. Original v1 files are preserved.

- 01: Zoe
- 02: Andrew — blonde hair, no hat by default; hats optional.
- 03: Mikey — brown hair, no hat by default; hats optional.
- 04: Hannah
- 05: Lani
- 06: John — brown hair, no hat.
- 07: Mike — same person as book host Mike.
- 08: Melissa
- 09: Maddie
- 10: Mia
- 11: Bekah
- 12: Baby Isaac

Names are editable catalog text, not baked into the artwork. Mikey and Mike remain separate identities. The v2 prompt is in `v2/prompts.json`.

Revision v3 removes Andrew’s and Mikey’s hats. Andrew’s hair is blonde; Mikey’s is brown like Mike’s and John’s. Their hats remain optional accessories, not identity features. Exact edit prompt: `v3/prompts.json`. All earlier masters are preserved.
