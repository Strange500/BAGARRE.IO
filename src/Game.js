import { Player } from './class/Player.js';
import { GameMap } from './class/Map.js';
import { updateScoreboard, simulateScores } from './handlers/ScoreHandler.js';
import { players } from './handlers/PlayerHandler.js';
import {
	handleKeydown,
	handleKeyup,
	movePlayer,
} from './handlers/MovementPlayerHandler.js';
import { Food } from './Food';
import {Bot} from "./class/Bot";

const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);
const MAX_JOUEURS = 10;
canvasResizeObserver.observe(canvas);

function resampleCanvas() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

const mapConfig = {
	maxSizeX: 5000,
	maxSizeY: 5000,
};


const viewLength = canvas.clientWidth;
const viewHeight = canvas.clientHeight;

const map = new GameMap(mapConfig.maxSizeX, mapConfig.maxSizeY);

export const player = new Player('GigaChad',map.width / 2, map.height / 2);


const foods = [
]


function genRandomFood() {
	const x = Math.floor(Math.random() * map.width);
	const y = Math.floor(Math.random() * map.height);
	return new Food(0.5, x, y);
}

for (let i = 0; i < 1000; i++) {
	foods.push(genRandomFood());
}

const bots = [];
for (let i = players.length; i < MAX_JOUEURS; i++) {
	const bot = new Bot(`Bot ${i}`, Math.random() * map.width, Math.random() * map.height);
	bots.push(bot);
	players.push(bot);
}

players.push(player);


function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	const offsetX = -player.x + viewLength / 2;
	const offsetY = -player.y + viewHeight / 2;
	context.translate(offsetX, offsetY);
	map.drawDecor(context, player, viewLength, viewHeight);

	map.drawFood(context, foods, player, viewLength, viewHeight);

	players.forEach((player) => {
		map.drawPlayer(context, player);
		map.drawCoordinates(context, player);
	});


	context.resetTransform();


	requestAnimationFrame(render);
}

function handleBonus(p) {
	foods.forEach((food, index) => {
			if (Math.abs(p.x - food.x) < p.size && Math.abs(p.y - food.y) < p.size) {
				p.addFood(food.bonus);
				foods.splice(index, 1);
			}
		}
	)
}


function handleKill(p, players) {
	players.forEach((pl, index) => {
			if (Math.abs(p.x - pl.x) < p.size && Math.abs(p.y - pl.y) < p.size && p.size > pl.size) {
				p.addKill(pl.size);
				players.splice(index, 1);
			}
		}
	)
}

function computeBestFoodDensityPosition(foods, currentPosition, maxDistance, cellSize) {
	// Create an object to hold the food counts in each grid cell
	const foodDensity = {};

	// Destructure currentPosition for easier access
	const { x: currentX, y: currentY } = currentPosition;

	// Filter foods that are within the max distance
	const filteredFoods = foods.filter(food => {
		const distance = Math.sqrt((food.x - currentX) ** 2 + (food.y - currentY) ** 2);
		return distance <= maxDistance;
	});

	filteredFoods.forEach(food => {
		// Determine which grid cell this food item belongs to
		const cellX = Math.floor(food.x / cellSize);
		const cellY = Math.floor(food.y / cellSize);

		// Create a unique key for each cell
		const key = `${cellX},${cellY}`;

		// Increment the food count for this cell
		if (!foodDensity[key]) {
			foodDensity[key] = 0;
		}
		foodDensity[key]++;
	});

	// Now find the cell with the maximum food count
	let maxCount = 0;
	let bestPosition = { x: currentX, y: currentY }; // Default to the current position

	for (const key in foodDensity) {
		if (foodDensity[key] > maxCount) {
			maxCount = foodDensity[key];

			// Convert the key back to coordinates
			const [cellX, cellY] = key.split(',').map(Number);
			const candidatePosition = {
				x: cellX * cellSize + cellSize / 2, // Center of the cell
				y: cellY * cellSize + cellSize / 2  // Center of the cell
			};

			const candidateDistance = Math.sqrt((candidatePosition.x - currentX) ** 2 + (candidatePosition.y - currentY) ** 2);

			// Ensure the candidate position is within the max distance
			if (candidateDistance <= maxDistance) {
				bestPosition = candidatePosition; // Update best position
			}
		}
	}

	return bestPosition;
}

function updateGame() {
	bots.forEach(bot => {
		const bestDensityPosition = computeBestFoodDensityPosition(foods, bot, viewHeight, 500);
		bot.nextMove(bestDensityPosition, foods, players);
	});
	players.forEach(p => {
		movePlayer(p, map);
		handleBonus(p);
		handleKill(p, players);
	});

	players.sort((a, b) => a.size - b.size);
}

function handleCanvasMouseDown(event) {
	context.beginPath();
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);
canvas.addEventListener('mousedown', handleCanvasMouseDown);

setInterval(() => {
	updateGame()
}, 1000 / 60);

setInterval(() => {
	simulateScores(players);
	updateScoreboard(players);
}, 1000);

requestAnimationFrame(render);
