const INERTIA = 0.07;
const MAX_SPEED = 5;

export function movePlayer(player, map) {
	const angleDiff = player.targetDeg - player.deg;
	if (Math.abs(angleDiff) > Math.PI) {
		if (angleDiff > 0) {
			player.deg += (angleDiff - 2 * Math.PI) * INERTIA;
		} else {
			player.deg += (angleDiff + 2 * Math.PI) * INERTIA;
		}
	} else {
		player.deg += angleDiff * INERTIA;
	}

	player.deg = (player.deg + 2 * Math.PI) % (2 * Math.PI);

	player.velocityX = Math.cos(player.deg) * MAX_SPEED;
	player.velocityY = Math.sin(player.deg) * MAX_SPEED;

	const newX = player.x + player.velocityX;
	const newY = player.y + player.velocityY;

	if (newX < 0) {
		player.x = 0;
	} else if (newX > map.width) {
		player.x = map.width;
	} else {
		player.x = newX;
	}

	if (newY < 0) {
		player.y = 0;
	} else if (newY > map.height) {
		player.y = map.height;
	} else {
		player.y = newY;
	}
}