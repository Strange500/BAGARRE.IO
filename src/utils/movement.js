import { START_SIZE } from '../entities/Player.js';

const INERTIA = 0.07;
export const MAX_SPEED = 5;
export const SPEED_LEVEL = 0.1;


export function getMaxSpeed(p) {
	const decayFactor = 0.99;
	const speedFactor = Math.max(0.1,Math.pow(decayFactor, (p.size - START_SIZE)));
	return MAX_SPEED * speedFactor;
}

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
	// reduce speed when player get bigger
	const decayFactor = 0.99;
	const speedFactor = Math.max(0.1,Math.pow(decayFactor, (player.size - START_SIZE)));
	const speed = player.speed * speedFactor * player.speedMultiplier;
	player.velocityX = Math.cos(player.deg) * speed;
	player.velocityY = Math.sin(player.deg) * speed;

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