---
layout: default
title: Super Mario Bros. 1 ACE FAQ
---

* 
{:toc}

# What is arbitrary code execution?
Arbitrary code execution (often abbreviated as ACE) is the abuse of a vulnerability in software to execute user-constructed code during runtime. In the case of NES games, it requires the program counter (which points to the currently executed instruction) to escape the confines of the intended code flow. This can happen in a few ways, e.g.due to: the [wrong ROM bank being loaded](https://tasvideos.org/4567M), inducing an [unintended indirect jump](https://tasvideos.org/2868M) or corrupting the stack and returning to a corrupted address. The end goal is usually to jump execution to RAM, in which data can be set up as valid code instructions to run desired code. However, what is difficult in practice is actually finding a bug in the game which allows for any of this. Even if a bug is glitchy-looking and game-breaking, it does not mean that it can allow for ACE.
\
&nbsp;

# Isn't the game too simple for ACE?
Without either performing or ruling out ACE, this will have to be a subjective answer, but... not really, no. Super Mario Bros. has a multitude of different bugs, and new discoveries are still being made (such as [this](https://www.youtube.com/watch?v=WJC17L9aYp8) and [this](https://www.youtube.com/watch?v=BLlZ0OhrSb4)). New applications of known bugs are also not out of the question. It's true that the game is smaller in size than most NES games and has a complete disassembly, but despite these facts research has not stagnated.
\
&nbsp;

# Can you use the same trick that was used to beat Super Mario Bros. 3 from the title screen?
[The run in question](https://tasvideos.org/4567M) uses a trick which will be referred to as the "DPCM conflict workaround exploit" - a slightly convoluted but apt name. The Famicom and NTSC NES have a hardware bug which can cause DPCM audio samples to corrupt controller data reads. The bug was known about by NES developers early on in the console's lifecycle and many games which used DPCM samples implemented a workaround where controller data is polled repeatedly until two consecutive reads match - the read data is then assumed to be correct, which is the case most of the time. Super Mario Bros. does not use this feature of the console and thus the input reading code does not have the workaround, which means that this trick cannot be used here.
\
&nbsp;

# Can the bug in 1-2 that causes a crash lead to ACE?
Perhaps surprisingly... maybe! I would not personally count on it, but technically, as far as I know, it hasn't been shown that this bug can't cause more than just graphical glitches or a game freeze. The problem is that many of the variables that can be corrupted this way are in fact graphics-related, so this isn't a very promising avenue. You can read more about the intricacies of this bug [here](/smb1explained).
\
&nbsp;

# Is there *any* promising lead on ACE?
Kind of. There is a not-too-unlikely way using so-called "glitched worlds".

Whenever the game is powered on or reset, a check is run to see whether that action was a reset or not. This check involves comparing bytes in RAM to specific values or ranges of values. Resetting the game is the most obvious way to pass this check, but if the state of memory is just right, it can also be passed from a poweron. The console's memory can be set up by [swapping out cartridges while the console is powered on](https://www.youtube.com/watch?v=eEEnEoKSgQs) or just getting lucky (yes, really, but also not really - see [this page](https://tasvideos.org/HomePages/Nach/MemoryInit) for more details). In either of these cases, the byte that tracks the world the player died on can also potentially be manipulated, and with the reset check passed, this value will be respected, and the world can be loaded into with the A + start continue code. In this way, it's possible to reach not just the 8 intended worlds, but also 248 unintended, "glitched" worlds. Note that this alone can be used to save time in any% speedruns, as starting from world 8 skips half of the required levels, but under current speedrun community rules and TASvideos rules this does not count as a valid completion. Consequently, any runs utilizing glitched worlds by setting up the game's power-on state may also be disallowed.

World 253 (252 when 0-indexed) has equivalents to the levels 3-2, 3-3 and 3-4 in that order. In these levels, it's possible to get a fire flower and then defeat a Bowser with fireballs. When a Bowser is killed by a fireball, it reveals its true form by changing to another enemy, according to a table. This table is indexed by the world number and contains only 8 entries, so in world 253 it ends up being indexed out of bounds. This world's Bowser turns out to be an enemy with ID 101 in disguise! Unsurprisingly, this is not an intended enemy ID, and the pointer for its update function is fetched using yet another out-of-bounds index. Execution eventually jumps to $2060, from where, in some cases, some convenient return instructions may eventually set the program counter to $5a. This is right in the middle of gameplay-related RAM, which can be controlled through gameplay to some extent.

The setup here sounds quite good, but there are unfortunately caveats to making this sequence work:
- Reads in the $2000-$3fff range are [not completely deterministic](https://www.nesdev.org/wiki/PPU_registers#Ports), and [may differ between different consoles and emulators](https://forums.nesdev.org/viewtopic.php?t=12549). The above sequence was found through testing with BizHawk 2.8.
- Successfully executing a useful payload is difficult and has not been done, as level 3-4 / 253-3 does not allow for too much control over relevant parts of memory.
- The aforementioned problems with requiring power-on state setup.

Regardless, this is, as far as I am aware, the best known lead for ACE in Super Mario Bros.
\
&nbsp;
