import {player} from "../Game";


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
	player.x += player.speed * player.xDirection;
	player.y += player.speed * player.yDirection;
}
