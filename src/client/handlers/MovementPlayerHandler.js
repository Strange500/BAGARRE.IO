import {player} from "../Game";

export let speed = 5;

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
	player.x += speed * player.xDirection;
	player.y += speed * player.yDirection;

	if (player.x < 0) {
		player.x = 0;
	} else if (player.x > map.width - player.size) {
		player.x = map.width - player.size;
	}

	if (player.y < 0) {
		player.y = 0;
	} else if (player.y > map.height - player.size) {
		player.y = map.height - player.size;
	}
}
