import { canvas, player } from "../Game.js";

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
	console.log(event.key);
	keyStack.add(event.key);
	computeTargetAngle();
}

export function handleKeyUp(event) {
	console.log(event.key);
	keyStack.delete(event.key);
	computeTargetAngle();
}

function computeTargetAngle() {
	const keys = Array.from(keyStack);

	if (keys.length === 0) {
		player.targetDeg = player.deg; // Defaults to current angle
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
}

export function handleMouseDirection(event) {
	const rect = canvas.getBoundingClientRect();
	const canvasMiddleX = rect.width / 2;
	const canvasMiddleY = rect.height / 2;
	player.targetDeg = Math.atan2(event.clientY - canvasMiddleY, event.clientX - canvasMiddleX);
}