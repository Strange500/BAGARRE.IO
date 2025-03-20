import { canvas, player } from "../Game.js";

const toTopAngle = -Math.PI / 2;
const toRightAngle = 0;
const toBottomAngle =  Math.PI / 2;
const toLeftAngle = Math.PI;
const toTopRightAngle = -Math.PI / 4;
const toBottomRightAngle =  Math.PI / 4;
const toBottomLeftAngle =3 * Math.PI / 4;
const toTopLeftAngle =   -3 * Math.PI / 4;


// use stack to store the key pressed
const keyStack = [];
export function handleKeyDown(event) {
	console.log(event.key);
	if (keyStack.indexOf(event.key) === -1) {
		keyStack.push(event.key);
	}
	computeTargetAngle();
}

export function handleKeyUp(event) {
	const index = keyStack.indexOf(event.key);
	console.log(event.key);
	if (index !== -1) {
		keyStack.splice(index, 1);
	}
	computeTargetAngle();
}

// consider only the last 2 keys pressed
function computeTargetAngle() {
	if (keyStack.length === 0) {
		player.targetDeg = player.deg;
		return;
	}

	const lastKey = keyStack[keyStack.length - 1];
	const secondLastKey = keyStack.length > 1 ? keyStack[keyStack.length - 2] : null;

	if (lastKey === 'z' || lastKey === 'ArrowUp') {
		if (secondLastKey === 'q' || secondLastKey === 'ArrowLeft') {
			player.targetDeg = toTopLeftAngle;
		} else if (secondLastKey === 'd' || secondLastKey === 'ArrowRight') {
			player.targetDeg = toTopRightAngle;
		} else {
			player.targetDeg = toTopAngle;
		}
	} else if (lastKey === 's' || lastKey === 'ArrowDown') {
		if (secondLastKey === 'a' || secondLastKey === 'ArrowLeft') {
			player.targetDeg = toBottomLeftAngle;
		} else if (secondLastKey === 'd' || secondLastKey === 'ArrowRight') {
			player.targetDeg = toBottomRightAngle;
		} else {
			player.targetDeg = toBottomAngle;
		}
	} else if (lastKey === 'q' || lastKey === 'ArrowLeft') {
		if (secondLastKey === 'z' || secondLastKey === 'ArrowUp') {
			player.targetDeg = toTopLeftAngle;
		} else if (secondLastKey === 's' || secondLastKey === 'ArrowDown') {
			player.targetDeg = toBottomLeftAngle;
		} else {
			player.targetDeg = toLeftAngle;
		}
	} else if (lastKey === 'd' || lastKey === 'ArrowRight') {
		if (secondLastKey === 'z' || secondLastKey === 'ArrowUp') {
			player.targetDeg = toTopRightAngle;
		} else if (secondLastKey === 's' || secondLastKey === 'ArrowDown') {
			player.targetDeg = toBottomRightAngle;
		} else {
			player.targetDeg = toRightAngle;
		}
	}
}




export function handleMouseDirection(event) {
	const rect = canvas.getBoundingClientRect();
	const canvasMiddleX = rect.width / 2;
	const canvasMiddleY = rect.height / 2;

	player.targetDeg = Math.atan2(event.clientY - canvasMiddleY, event.clientX - canvasMiddleX);
}

