# Higgsfield prompt pack

Model: **Nano Banana Pro** for everything except the walk cycles (**AutoSprite**).
Always attach `assets/map/souq.jpg` (or the newer map from step 1) as the reference image.
Generate in the order below. Later steps use earlier results as references.

## Style lock

Paste this at the start of every prompt:

```
Match the art style of the attached image exactly: the same hand-inked brown outlines, the same warm watercolor-and-gouache shading, the same sun-baked sand and cream palette with teal, terracotta and saffron accents, the same soft light from the upper left, the same cozy storybook game look. Do not change the art style.
```

---

## 1. The new map (do this first)

16:9, 2k, attach `souq.jpg`.

```
[STYLE LOCK] Edit the attached image. Keep the whole picture identical: same camera, same framing, every building, street, wall, palm tree, stall and the fountain in exactly the same place and size. Change only the decoration of these three buildings, keeping each building's outline and footprint exactly the same:
1. The large white building with the rooftop garden just left of the fountain becomes the Jamia, a small old university: a carved stone arched entrance, a green tile band under the roofline, a row of arched windows with wooden shutters, a small green dome, stacks of books and scroll tubes on the rooftop terrace, a green banner.
2. The white house with purple bougainvillea and laundry at the top, beside the big gate, becomes the mayor's palace: a gilded double door, red-and-gold banners, a golden finial on the roof, a crenellated roofline, potted orange trees, a rich carpet at the door. Remove the laundry.
3. The house with the carved wooden window just below the fountain becomes a madrasa for Arabic study: geometric tile patterns framing the door, a small wooden book stand by the entrance, a hanging brass lantern.
No people. No readable text.
```

Name the result **map-day**. It replaces the current map. Use **map-day** as the reference for all of section 2.

## 2. The same map at other times and in other weather

16:9, 2k, attach **map-day**. Begin each one with:

```
[STYLE LOCK] Edit the attached image. Keep everything exactly in place: same camera, same framing, every building, street, stall, palm and the fountain unchanged in position and size. Change only the lighting and weather:
```

Then add one of these:

| Name | Ending |
|---|---|
| **map-morning** | `Early morning just after sunrise. Soft pink-gold light from the left, long cool blue shadows, light haze over the desert, lanterns off, some stall awnings still rolled up.` |
| **map-sunset** | `Golden hour at sunset. Deep orange light from the left, long purple shadows, warm glow on the white walls, lanterns just starting to glow.` |
| **map-night** | `Night. Deep blue moonlit tones over everything, a crescent moon and stars over the desert, every lantern lit with warm pools of light on the ground, warm light in windows and in the coffee house arches, fountain reflecting lamplight, stalls closed.` |
| **map-rain** | `A rainy afternoon. Overcast gray-blue light, darker wet sand with puddles reflecting the buildings, soft rain streaks, awnings dripping, still cozy and pretty.` |
| **map-rain-night** | `A rainy night. Every lantern lit and reflected in wet streets and puddles, warm windows, soft rain streaks, deep blue tones.` |
| **map-fog** | `A foggy early morning. Soft white mist drifting between buildings, distant walls and the gate faded into the fog, muted colors, lanterns faintly glowing.` |
| **map-snow** | `A rare light snowfall. A thin layer of white snow on roofs, domes, wall tops and palm fronds, sand dusted white, cold clear light, a few flakes falling.` |

If any version moves or changes a building, regenerate it. The streets are traced to the exact pixels.

## 3. Characters

Square 1:1, 2k. Attach **map-day**. Use one prompt per character:

```
[STYLE LOCK] A character sheet for one person who lives in the souq in the attached image: [DESCRIPTION]. Show the same character 4 times in a row, evenly spaced and not touching, full body, seen from slightly above at the same 3/4 angle as the buildings, facing toward the lower right: (1) standing relaxed, (2) working: [WORK POSE], (3) waving hello, (4) walking mid-step. About 3 heads tall, cute but not chibi, friendly expressive face. Flat solid pure magenta #FF00FF background, no shadow on the background, no text.
```

Then, attaching that sheet:

```
[STYLE LOCK] A head-and-shoulders portrait of the character in the attached sheet, smiling, looking at the viewer, on a warm parchment background with a soft teal arched niche behind the head. Square.
```

### Muhammad, the postman (email)
- **DESCRIPTION:** `Muhammad, the souq's cheerful postman: mid-30s, neat black mustache, warm tan skin, a red tarboosh fez with a black tassel, a deep indigo-blue tunic with brass buttons and a saffron sash, loose cream trousers, leather sandals, a big brown leather mail satchel stuffed with letters and wax-sealed envelopes worn across his chest, a white carrier pigeon on his shoulder`
- **WORK POSE:** `sorting a fan of envelopes and stamping one with a brass seal`

### Ahmed, the sheikh of Arabic
- **DESCRIPTION:** `Ahmed, a gentle sheikh who teaches Arabic: about 60, neatly trimmed silver-white beard, kind smiling eyes, a crisp white thobe, a flowing brown bisht cloak with gold embroidered edges, a white turban, amber prayer beads in one hand, a reed qalam pen tucked behind his ear`
- **WORK POSE:** `reading aloud from an open leather-bound book with one finger raised as if explaining grammar`

### Othman, the mayor
- **DESCRIPTION:** `Othman, the town mayor dressed like a kindly Arab king: about 50, full well-groomed black beard touched with gray, a jeweled white-and-gold turban with a small emerald, a deep burgundy velvet robe with wide gold embroidery over a white thobe, a gold sash, gold rings, a carved ebony staff topped with gold, a proud but warm smile`
- **WORK POSE:** `holding open a long scroll decree and pressing a gold seal ring onto it`

### Mustafa, the scholar of the Jamia (school)
- **DESCRIPTION:** `Mustafa, a young scholar who runs the town university: late 20s, short dark beard, round brass spectacles, a small white kufi cap, an olive-green jubba coat over a cream shirt, ink-stained fingers, a leather satchel full of note cards and a rolled map, a stack of books under one arm`
- **WORK POSE:** `pointing at a small wooden easel board showing a diagram while holding a fan of flash cards`

### Muse, keeper of Bayt al-Hikma (the library)
- **DESCRIPTION:** `Muse, the keeper of Bayt al-Hikma, the town library: an elderly scholar with a long white beard, half-moon spectacles, a deep teal robe with gold geometric trim, a cream turban, a huge leather ledger under one arm, a quill pen, and a small wise brown owl perched on his shoulder`
- **WORK POSE:** `writing in the open ledger with the quill while the owl watches`

### You
- **DESCRIPTION:** `[your hair, skin, build, glasses, beard…] dressed as a curious traveler visiting the souq: a light linen shirt, a cream keffiyeh scarf loose around the neck, a canvas shoulder bag, comfortable boots`
- **WORK POSE:** `studying a small paper map`

### Ideas for the next agents
Use the same template. Each has a spare building waiting.
- **Khalil the baker** (meals, groceries, recipes): flour-dusted apron, round flatbreads on a wooden paddle. *Work:* pulling bread from an oven paddle.
- **Yasmin the spice merchant** (money, budget, subscriptions): embroidered dress, a coin purse, a brass balance scale. *Work:* weighing saffron on the scale. (Khalil and Yasmin could be the married couple.)
- **Samir the timekeeper** (calendar, reminders): a star-patterned blue robe, a brass astrolabe, an hourglass on his belt. *Work:* reading the astrolabe against the sky.
- **Hakima the healer** (health, sleep, workouts): a sage-green dress and headscarf, a satchel of herbs, a mortar and pestle. *Work:* grinding herbs.

## 4. Walking (AutoSprite)

For each character, cut out pose (1) "standing relaxed". On iPhone, long-press it in Photos and choose "Copy Subject". Then run **AutoSprite** on that image three times:

| kind | settings |
|---|---|
| `iso_walk_southeast` | frame_count 16, frame_size 256, video_tier turbo, remove_bg default |
| `iso_walk_northeast` | same |
| `iso_idle_southeast` | same |

I mirror these for the west directions. Do one character first to check the result before spending credits on everyone.

## 5. Room interiors

16:9, 2k. Attach **map-day**:

```
[STYLE LOCK] The cozy interior of [PLACE] from the souq in the attached image, seen from above at the same isometric angle: a room corner with two walls and the floor, [DETAILS]. An arched window on the right wall showing a little sky. Leave the middle of the floor open and empty so characters can stand there. No people, no text.
```

| Name | PLACE | DETAILS |
|---|---|---|
| **room-library** | Bayt al-Hikma, the library | floor-to-ceiling bookshelves in arched niches, a rolling wooden ladder, a celestial globe and a brass astrolabe, racks of scrolls, a big reading desk with open ledgers, a wooden owl perch, blue tile dado, a hanging brass lamp |
| **room-post** | the post office | a wall of wooden pigeonholes full of letters, a sorting counter, a brass scale, parcels tied with twine, wax seals and stamps, a cage of white pigeons, blue painted shutters |
| **room-jamia** | the Jamia, a small old university | a little lecture hall with low wooden desks and cushions, a large wooden easel board with a diagram, shelves of bound notebooks and card boxes, a carved lectern, maps and charts pinned to the walls, green tile accents |
| **room-madrasa** | the madrasa where Arabic is taught | a quiet study with a folding wooden book stand, reed pens and inkwells on a low desk, decorative calligraphy-style panels on the walls (no readable text), floor cushions in a circle, stacks of manuscripts, a brass lantern |
| **room-palace** | the mayor's palace | a small throne room: a carved wooden chair with red velvet cushions on a low step, red-and-gold banners, a big painted map of the town on the wall, a writing desk with seals and scrolls, a brass incense burner, a rich patterned carpet |
| **room-qahwa** | the coffee house | brass dallah coffee pots on a tiled counter, a charcoal brazier, low tables with cushions, pierced brass lanterns hanging from the ceiling, a backgammon board, curls of steam |
| **room-house-1** | a cozy family home | low majlis cushions along the walls, a round brass tea tray table, shelves of painted pottery, woven baskets, a potted plant |
| **room-house-2** | a two-story home | a carved wooden mashrabiya window, a bed alcove with a curtain, a low writing table, a hanging lamp, plants on the sill |

## 6. Extras

**Village emblem** (home-screen icon, page icon). 1:1, attach **map-day**:
```
[STYLE LOCK] A round emblem for the village: a crescent moon above a little skyline of the souq's domed library and gate, inside a teal geometric tile border, on a plain parchment background. No text.
```

**Title card** (shown while the village loads). 16:9, attach **map-day**:
```
[STYLE LOCK] A wide view of the souq's great gate at dusk, lanterns glowing, a crescent moon, palm trees, warm and inviting, with empty sky across the top third for a title. No people, no text.
```

## 7. Setting up Muse (Meta)

Use the Muse portrait from section 3 as its picture, then give Muse these instructions:

```
You are Muse, keeper of Bayt al-Hikma, the library of Souq al-Qamar. Every morning, check my school sites: [list them]. Email what you find to i.am.richardmaier+muse@gmail.com. Send one email per course. Subject: "<Course>: <short summary>", for example "ARAB 201: 2 due dates this week". In the body list: due dates (date, title, link), new announcements, grade changes. Write calmly and precisely, and always say where each fact came from. Sign off "Muse, Bayt al-Hikma". Never email any other address.
```
