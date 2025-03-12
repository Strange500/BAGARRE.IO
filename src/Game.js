import { Player } from './Player.js';
import { GameMap } from './Map.js';
import { updateScoreboard, simulateScores } from './ScoreHandler.js';
import { players } from './PlayerHandler.js';
import { handleKeydown, handleKeyup, movePlayer } from './MovementPlayerHandler.js';

const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);
canvasResizeObserver.observe(canvas);

function resampleCanvas() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

const mapConfig = {
	maxSizeX: 800,
	maxSizeY: 600,
};

const map = new GameMap(mapConfig.maxSizeX, mapConfig.maxSizeY);

const player = new Player('Player 1');
const playerPosition = {
	x: map.width / 2,
	y: map.height / 2,
};

const viewLength = canvas.clientWidth / 10;
const viewHeight = canvas.clientHeight / 10;

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.scale(10, 10);
	context.translate(
		-playerPosition.x + viewLength / 2,
		-playerPosition.y + viewHeight / 2
	);
	map.drawDecor(
		context,
		playerPosition.x - viewLength,
		playerPosition.y - viewHeight,
		viewLength * 10,
		viewHeight * 10
	);
	map.drawPlayer(context, playerPosition);

	context.translate(
		playerPosition.x - viewLength / 2,
		playerPosition.y - viewHeight / 2
	);

	map.drawCoordinates(context, playerPosition);
	context.resetTransform();

	requestAnimationFrame(render);
}

function handleCanvasMouseDown(event) {
	context.beginPath();
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);
canvas.addEventListener('mousedown', handleCanvasMouseDown);

setInterval(() => {
	movePlayer(player, playerPosition, canvas);
	updateScoreboard(players);
}, 1000 / 60);

setInterval(() => {
	simulateScores(players);
	updateScoreboard(players);
}, 1000);

requestAnimationFrame(render);
