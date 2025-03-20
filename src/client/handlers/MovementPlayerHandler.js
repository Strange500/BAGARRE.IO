import { player } from "../Game.js";


export function handleKeydown(event) {
	switch (event.key) {
		case 'ArrowUp':
		case 'z':
			player.yDirection = -1;
			break;
		case 'ArrowDown':
		case 's':
			player.yDirection = 1;
			break;
		case 'ArrowLeft':
		case 'q':
			player.xDirection = -1;
			break;
		case 'ArrowRight':
		case 'd':
			player.xDirection = 1;
			break;
	}
}

export function handleKeyup(event) {
	switch (event.key) {
		case 'ArrowUp':
		case 'z':
		case 'ArrowDown':
		case 's':
			player.yDirection = 0;
			break;
		case 'ArrowLeft':
		case 'q':
		case 'ArrowRight':
		case 'd':
			player.xDirection = 0;
			break;
	}
}

export function movePlayer(player, map) {
	const newX = player.x + (player.speed * player.xDirection);
	const newY = player.y + (player.speed * player.yDirection);
	if (newX < 0) {
		player.x = 0;
	}else if (newX > map.width) {
		player.x = map.width;
	}else {
		player.x = newX;
	}
	if (newY < 0) {
		player.y = 0;
	}else if (newY > map.height) {
		player.y = map.height;
	} else {
		player.y = newY;
	}
}