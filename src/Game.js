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
	map.drawDecor(context, player, viewLength / 2, viewHeight / 2);

	map.drawFood(context, foods, player, viewLength / 2, viewHeight / 2);

	players.forEach((p) => {
		map.drawPlayer(context, p, player, viewLength / 2, viewHeight / 2);
		map.drawName(context, p);
	});


	context.resetTransform();


	requestAnimationFrame(render);
}

function handleBonus(p) {
	foods.forEach((food, index) => {
		const distance = Math.hypot(p.x - food.x, p.y - food.y);
		if (distance < p.size) {
			p.addFood(food.size);
			foods.splice(index, 1);
			foods.push(genRandomFood());
		}
	});
}


function handleKill(p, players) {
	players.forEach((pl, index) => {
		const distance = Math.hypot(p.x - pl.x, p.y - pl.y);
			if (distance < p.size && p.size > pl.size) {
				p.addKill(pl.size);
				players.splice(index, 1);
			}
		}
	)
}



function updateGame() {
	bots.forEach(bot => {
		bot.nextMove(foods, players);
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
