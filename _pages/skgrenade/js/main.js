var canvas = document.getElementById('canvas')

var playerX
var playerY
var targetX
var targetY

function reset() {
	playerX = -1
	playerY = -1
	targetX = -1
	targetY = -1

	for (tileY = 0; tileY < 8; tileY++) {
		for (tileX = 0; tileX < 8; tileX++) {
			tile = getTileButton(tileX, tileY)
			tile.css('backgroundColor', '')
			tile.text('')
		}
	}
}

function getProbabilityOfHit(aimX, aimY) {
	let bouncePower = Math.sqrt(Math.pow(aimX - playerX, 2) + Math.pow(aimY - playerY, 2)) * 8 + 8
	bounces = []
	while (bouncePower > 20) {
		bounces.push(bouncePower > 42)
		bouncePower *= 0.5
	}
	
	positions = [[aimX, aimY]]
	for (let isBigBounce of bounces) {
		newPositions = []
		for (let position of positions) {
			n = isBigBounce ? 2 : 1
			x = position[0]
			y = position[1]

			newPositions.push([x - n, y - n])
			newPositions.push([x, y - n])
			newPositions.push([x + n, y - n])
			newPositions.push([x - n, y])
			newPositions.push([x + n, y])
			newPositions.push([x - n, y + n])
			newPositions.push([x, y + n])
			newPositions.push([x + n, y + n])

			if (!isBigBounce) {
				newPositions.push([x, y])
			}
		}

		positions = []
		for (let position of newPositions) {
			x = position[0]
			y = position[1]
			if (x >= 0 && x < 8 && y >= 0 && y < 8) {
				positions.push(position)
			}
		}
	}

	hitCount = 0
	for (let position of positions) {
		dx = position[0] - targetX
		dy = position[1] - targetY
		if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
			hitCount++
		}
	}
	return hitCount / positions.length
}

function getGradientColor(value, maxValue) {
	intensity0 = (Math.floor(255 - value / maxValue * 255)).toString(16).padStart(2, '0')
	intensity1 = (Math.floor(255 - value / maxValue * 80)).toString(16).padStart(2, '0')
	return '#' + intensity0 + intensity1 + intensity0
}

function getTileButton(x, y) {
	return $('#tile_' + x + '_' + y)
}

function onClickTile(x, y) {
	if (playerX == -1) {
		playerX = x
		playerY = y

		tile = getTileButton(x, y)
		tile.css('backgroundColor', '#0066ff')
		tile.text('King')
	}
	else {
		if (x == playerX && y == playerY) {
			return
		}

		if (targetX != -1) {
			getTileButton(targetX, targetY).css('backgroundColor', '')
		}

		targetX = x
		targetY = y

		getTileButton(x, y).css('backgroundColor', 'red')

		maxValue = 0
		values = Array.from(Array(8), () => new Array(8))
		for (tileY = 0; tileY < 8; tileY++) {
			for (tileX = 0; tileX < 8; tileX++) {
				if (tileX != playerX || tileY != playerY) {
					tile = getTileButton(tileX, tileY)

					value = getProbabilityOfHit(tileX, tileY)
					if (value > maxValue) {
						maxValue = value
					}
					values[tileY][tileX] = value

					tile.text((value * 100).toFixed(2) + '%')
				}
			}
		}

		for (tileY = 0; tileY < 8; tileY++) {
			for (tileX = 0; tileX < 8; tileX++) {
				if (tileX != playerX || tileY != playerY) {
					tile = getTileButton(tileX, tileY)
					value = values[tileY][tileX]
					tile.css('backgroundColor', getGradientColor(value, maxValue))
					console.log(tileX, tileY, value, maxValue, getGradientColor(value, maxValue))
				}
			}
		}
	}
}

reset()
