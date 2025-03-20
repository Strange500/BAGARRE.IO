import { canvas, player } from "../Game.js";



export function handleMouseDirection(event) {
	const rect = canvas.getBoundingClientRect();
	const canvasMiddleX = rect.width / 2;
	const canvasMiddleY = rect.height / 2;

	player.targetDeg = Math.atan2(event.clientY - canvasMiddleY, event.clientX - canvasMiddleX);
}

