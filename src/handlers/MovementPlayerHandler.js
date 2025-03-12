export let xDirection = 0;
export let yDirection = 0;
export let speed = 5;

export function handleKeydown(event) {
	switch (event.key) {
		case 'ArrowUp':
		case 'z':
			yDirection = -1;
			break;
		case 'ArrowDown':
		case 's':
			yDirection = 1;
			break;
		case 'ArrowLeft':
		case 'q':
			xDirection = -1;
			break;
		case 'ArrowRight':
		case 'd':
			xDirection = 1;
			break;
	}
}

export function handleKeyup(event) {
	switch (event.key) {
		case 'ArrowUp':
		case 'z':
		case 'ArrowDown':
		case 's':
			yDirection = 0;
			break;
		case 'ArrowLeft':
		case 'q':
		case 'ArrowRight':
		case 'd':
			xDirection = 0;
			break;
	}
}

export function movePlayer(player, playerPosition, canvas) {
	playerPosition.x += speed * xDirection;
	playerPosition.y += speed * yDirection;

	// Limites du canvas
	if (playerPosition.x < 0) {
		playerPosition.x = 0;
	} else if (playerPosition.x > canvas.width - player.size) {
		playerPosition.x = canvas.width - player.size;
	}

	if (playerPosition.y < 0) {
		playerPosition.y = 0;
	} else if (playerPosition.y > canvas.height - player.size) {
		playerPosition.y = canvas.height - player.size;
	}
}
