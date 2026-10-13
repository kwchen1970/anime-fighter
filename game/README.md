# Neon Rivals / Animefighter

A two-player side-view fighting game using Kathleen's original Procreate animations. Run through a 7,200-unit arena; the camera follows and widens to keep both fighters visible.

## Neon circuit

Start adventure to fight the computer through three solo stages: Neon Mall (Easy), Cat & Moto Street (Medium), and Skyline Plaza (Hard). Win a round, then choose Run to the next setting. Both fighters run through a 2.6-second transition before arriving at the next illustrated stage. Losses and ties let you retry the current stage. Completing the plaza finishes the solo circuit.

Computer difficulty increases through movement speed, reaction timing, attack frequency and health. The arena is twice as long as the original, with mostly flat pavement, gentle ramps and raised sections. The scenery crossfades from the anime mall to a motorcycle street and skyline as you traverse the arena. Ground height is shared by the server and both clients. Subtle blue light, reflections, petals and character edge lighting retain clear silhouettes. The mall has ice cream and bubble tea shops with people painted into the background. The motorcycle street has parked bikes, three sitting cats and a Gojo statue behind the combat lane.

Room-code multiplayer is the main mode. Difficulty levels and stage unlocking apply only to solo play. Multiplayer rematches restart a fair two-player duel; changing districts depends on where both players run.

## Play

Create a room and share the five-character code. The second player joins on their own device. Mika is player one; Yuna is player two. No player accounts are required when the site is public.

- Move: A / D or left / right arrows
- Punch: J (10 damage, short range)
- Kick: K (17 damage, longer range, slower recovery)
- Phones: hold the arrow buttons; tap Punch or Kick
- First knockout wins. After 90 seconds, higher health wins. Equal health is a tie.
- Both players must request a rematch. Disconnects pause the match; rooms expire after 24 hours without activity.

Practice mode provides a local bot. Names are temporary labels and can be changed.

## Files

Your original art folders sit beside `game/` and are preserved. `public/assets/` contains the animation frames extracted without resizing from the APNG exports. Their duration and facing metadata are in `animations.json`.

`lib/game.ts` is the combat simulation. `app/page.tsx` contains the game UI, canvas renderer, controls, and local practice mode. `app/api/game/route.ts` runs the shared authoritative simulation with version-checked D1 updates. Every client submits inputs and receives the same room state, with short visual movement prediction between updates.

## Development

Requires Node 22.13 or newer. Run `npm run dev`, then open the local address. Generate schema migrations with `npm run db:generate`. Apply local migrations using the starter's Wrangler instructions before testing multiplayer locally.

Combat checks: `node --experimental-strip-types tests/combat.ts`

Campaign checks: `node --experimental-strip-types tests/campaign.ts`

The first version uses frequent HTTP state updates rather than a dedicated low-latency WebSocket game server. Connection quality affects competitive timing; test on two devices before using it as a contest demo.
