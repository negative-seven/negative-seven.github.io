---
layout: default
title: Shotgun King grenade calculator
---
First select the position of the king, then select the position of the target enemy. The percentage displayed on a given tile indicates the probability of hitting the target if the grenade is aimed at that tile.

<link rel="stylesheet" href="css/style.css">

<div class="board">
	{% for y in (0..7) %}
		<div class="row">
			{% for x in (0..7) %}
				<button class="tile" id="tile_{{x}}_{{y}}" onclick="onClickTile({{x}}, {{y}})"></button>
			{% endfor %}
		</div>
	{% endfor %}
</div>

<div class="resetContainer">
	<button class="reset" onclick="reset()">Reset</button>
</div>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="js/main.js"></script>
