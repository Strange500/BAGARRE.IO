import { canvas, player } from '../Game.js';
import { MAX_SPEED, SPEED_LEVEL } from '../../server/movement';

const maxDistanceToReachMaxSpeed = 100;
let isKeyboardControl = false;
const lastMousePosition = { x: 0, y: 0 };

const angles = {
	"up": -Math.PI / 2,
	"down": Math.PI / 2,
	"left": Math.PI,
	"right": 0,
	"upLeft": -3 * Math.PI / 4,
	"upRight": -Math.PI / 4,
	"downLeft": 3 * Math.PI / 4,
	"downRight": Math.PI / 4
};

const keyBindings = {
	'z': 'up', 'ArrowUp': 'up',
	's': 'down', 'ArrowDown': 'down',
	'q': 'left', 'ArrowLeft': 'left',
	'd': 'right', 'ArrowRight': 'right'
};

const keyStack = new Set(); // Use a Set for unique keys

export function handleKeyDown(event) {
	keyStack.add(event.key);
	isKeyboardControl = true;
}

export function handleKeyUp(event) {
	keyStack.delete(event.key);
}

export function computeTargetAngle() {

	if (!isKeyboardControl) {
		player.targetDeg = Math.atan2(lastMousePosition.y - canvas.height / 2, lastMousePosition.x - canvas.width / 2);
		const targetSpeed = (Math.hypot(lastMousePosition.y - canvas.height / 2, lastMousePosition.x - canvas.width / 2) / maxDistanceToReachMaxSpeed) * MAX_SPEED;
		player.speed = Math.min(MAX_SPEED, player.speed + (targetSpeed - player.speed) * SPEED_LEVEL);
		return;
	}
	const keys = Array.from(keyStack);

	if (keys.length === 0) {
		player.targetDeg = player.deg; // Defaults to current angle
		player.speed = Math.max(0, player.speed - SPEED_LEVEL);
		return;
	}

	const lastKey = keyBindings[keys[keys.length - 1]];
	const secondLastKey = keys.length > 1 ? keyBindings[keys[keys.length - 2]] : null;

	if (lastKey === 'up') {
		player.targetDeg = secondLastKey === 'left' ? angles.upLeft :
			secondLastKey === 'right' ? angles.upRight :
				angles.up;
	} else if (lastKey === 'down') {
		player.targetDeg = secondLastKey === 'left' ? angles.downLeft :
			secondLastKey === 'right' ? angles.downRight :
				angles.down;
	} else if (lastKey === 'left') {
		player.targetDeg = secondLastKey === 'up' ? angles.upLeft :
			secondLastKey === 'down' ? angles.downLeft :
				angles.left;
	} else if (lastKey === 'right') {
		player.targetDeg = secondLastKey === 'up' ? angles.upRight :
			secondLastKey === 'down' ? angles.downRight :
				angles.right;
	}

	player.speed = Math.min(MAX_SPEED, player.speed + SPEED_LEVEL);
}

export function handleMouseDirection(event) {
	isKeyboardControl = false;
	lastMousePosition.x = event.clientX;
	lastMousePosition.y = event.clientY;
}
