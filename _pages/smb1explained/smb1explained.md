---
layout: default
title: Super Mario Bros. 1 bugs explained
---

# Incorrect player size (aka. "small fire mario")
Two variables control the player's powerup state:
- `PlayerStatus` (0 = no powerup, 1 = mushroom, 2 = fire flower)
- `PlayerSize` (0 = small, 1 = big)

There are 3 ways the player's powerup state is intended to change:
- No powerup → mushroom: `PlayerStatus` is changed from 0 to 1 and, after a delay, `PlayerSize` is flipped from 0 to 1.
- Mushroom → fire flower: `PlayerStatus` is changed from 1 to 2.
- Mushroom/fire flower → no powerup: `PlayerStatus` is changed from 1 or 2 to 0 and, after a delay, `PlayerSize` is flipped from 1 to 0.

In the first and third case, the delayed `PlayerSize` change happens as such: first, at the same time `PlayerStatus` is written to, a timer (`TimerControl`) starts counting down by 1 every frame from $ff. Then, normally, when that timer reaches $f8 (growing) or $f0 (shrinking), `PlayerSize` is XOR-ed with 1, flipping the value.

A problem arises when an axe is touched at the same time the player has a powerup and gets hit. `PlayerStatus` gets changed immediately and as intended, but the code to change `PlayerSize` when `TimerControl` has reached a certain value no longer gets run. Touching the axe causes the start of the end-of-castle cutscene, setting `OperMode` to 2 and stopping the handling of many gameplay events. Meanwhile, `TimerControl` ticks down to 0 during the cutscene and the "taking damage" state (`GameEngineSubroutine == 2`) is overridden before the start of the next level, and so the size change doesn't ever happen.

`PlayerStatus` and `PlayerSize` are always assumed to be in sync (either both equal to 0 or both non-zero), so there is nothing in place to check for or fix a desync. Taking damage at the same time as touching an axe creates a desync, where `PlayerStatus` is 0 but `PlayerSize` is 1. This desync persists through normal gameplay, because any time `PlayerSize` is changed, it is always flipped to the other value, rather than explicitly being set to the intended value. The final result of this is the following powerup progression for the player: big + no powerup → small + has mushroom → small + has fire flower. Performing the bug a second time sets everything back to normal, for similar reasons as before.
\
&nbsp;

# Powerup jump
When you collect a powerup that changes your powerup status, `Player_State` gets set to 0, meaning that even if you are in the air, you will actualy be considered to be on the ground for some checks. This stems from sharing code between the powering up animation and the death animation, the latter of which alters `Player_State` when making the player jump up upon death. After a frame of movement, `Player_State` gets updated to the correct value, but prior to that there is one frame where you can turn around or jump, even in the air. The jump can be buffered during the powering up animation, giving much more than a frame to perform this trick.
\
&nbsp;

# Left + right
Whenever the player is holding left or right without holding down and also on the ground or swimming, the lowest 2 bits of the controller input data are copied over to `PlayerFacingDir`. The intended written values are 1 when facing right (the right button is bit 0) and 2 when facing left (the left button is bit 1). However, if both left and right are held at the same time (which is not usually possible on a NES controller), bit 0 and bit 1 will both be set, causing 3 to be written to `PlayerFacingDir`.

Another situation where the player's inputs can affect the player's facing direction is on a vine, with certain other conditions met. In that case, the lowest 2 bits of the controller data are flipped before being copied to `PlayerFacingDir`. This has the intended effect of making the player face left on a right press, and right on a left press, but by holding left+right you can use this to achieve a 4th direction value of 0.

Both 0 and 3 are not intended values for `PlayerFacingDir`, thus they cause some anomalies:
- Being on a vine places the player at an unintended horizontal offset from the vine due to out-of-bounds indexing, cancelling the climbing state (if the player has not climbed high enough to trigger the cutscene) and essentially teleporting the player. For most vines, the destination will be far right (direction 0) or inside the vine (direction 3), but for vines right at the start of a page boundary (such as in 4-2), an additional change to the player's page location causes the player to end up all the way to the left of the screen. 
- When holding left+right on the ground at near-standstill, `PlayerFacingDir` and `Player_MovingDir` are not equal, causing a constant horizontal speed reset, after which rightwards friction is applied due to holding right, finally resulting in a constant horizontal speed of 1 to the right.
- The player always skids with direction 0, and never skids with direction 3.
- The player fires fireballs to the left even faster than with direction 2, due to out-of-bounds indexing for the fireball speed.
- The player's sprite looks strange underwater when off the ground.
- Various discrepancies between visual facing direction and expected behavior.
\
&nbsp;

# Random Number Generation
Super Mario Bros. 1 uses a 7-byte / 56-bit linear feedback shift register (`PseudoRandomBitReg`) to generate random numbers, used for all pseudorandom events in the game. When the game is powered on or reset, the first byte gets initialized as $a5, and the rest as zeroes. After that, all 7 bytes are updated every frame as such: all 56 bits are first shifted to the right by 1 (with the rightmost bit being discarded), and the new leftmost bit 55 is set to bit 40 XNOR bit 48.

Although 7 bytes is enough to store 2^56 different states, the random number generator loops after only 2^15 - 1 = 32767 iterations (and this loop is entered after 39 iterations from initialization). This is because the 15 most significant bits are enough to dictate the long-term future of the register.

The pseudorandom number is used in these instances:
- spawning and moving bubbles
- spawning Cheep Cheeps (both underwater and flying)
- spawning Bullet Bills from launchers
- spawning hammers by Hammer Bros and Bowsers
- spawning Spinies by Lakitus
- spawning Bowser flames (both from offscreen and from Bowsers' mouths)
- Podoboo movement
- Hammer Bro movement
- Blooper movement
- Bowser movement
