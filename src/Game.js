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
import {Circle, Quadtree} from "@timohausmann/quadtree-ts";

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


export const viewLength = canvas.clientWidth;
export const viewHeight = canvas.clientHeight;

const map = new GameMap(mapConfig.maxSizeX, mapConfig.maxSizeY);

export const player = new Player('GigaChad',map.width / 2, map.height / 2);

const foodQuadTree = new Quadtree({
	width: map.width,
	height: map.height,
	maxLevels: 4,
});


function genRandomFood() {
	const x = Math.floor(Math.random() * map.width);
	const y = Math.floor(Math.random() * map.height);
	return new Food(0.5, x, y);
}

for (let i = 0; i < 1000; i++) {
	foodQuadTree.insert(genRandomFood());
}

const bots = [];
for (let i = players.length; i < MAX_JOUEURS; i++) {
	const bot = new Bot(`Bot ${i}`, Math.random() * map.width, Math.random() * map.height);
	bots.push(bot);
	players.push(bot);
}

players.push(player);

let nbFrame = 0;

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	const offsetX = -player.x + viewLength / 2 ;
	const offsetY = -player.y + viewHeight / 2 ;
	context.translate(offsetX, offsetY);
	map.drawDecor(context, player, viewLength / 2, viewHeight / 2);
	map.drawFood(context, foodQuadTree, player, viewLength / 2, viewHeight / 2);

	players.forEach((p) => {
		if (map.drawPlayer(context, p, player, viewLength / 2, viewHeight / 2)) {
			map.drawName(context, p);
		}
	});


	context.resetTransform();

	nbFrame++;
	requestAnimationFrame(render);
}

function handleBonus(p) {
	foodQuadTree.retrieve(new Circle({
		x: p.x,
		y: p.y,
		r: p.size,
	})).forEach(food => {
		const deltaX = food.x - p.x;
		const deltaY = food.y - p.y;
		const distance = Math.hypot(deltaX, deltaY);
		if (distance > p.size) return;
		p.addFood(food.bonus);
		foodQuadTree.remove(food);
		foodQuadTree.insert(genRandomFood());
	});
}


function handleKill(p, players) {
	for (let i = players.length - 1; i >= 0; i--) {
		const other = players[i];
		if (other === p) continue;

		const deltaXPlayer = other.x - p.x;
		const deltaYPlayer = other.y - p.y;
		const distanceToPlayer = Math.hypot(deltaXPlayer, deltaYPlayer);

		if (p.size > other.size && distanceToPlayer < p.size) {
			p.addKill(other.size);
			players.splice(i, 1);
		}
	}
}



function updateGame() {
	bots.forEach(bot => {
		bot.nextMove(foodQuadTree, players);
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
	console.log('FPS:', nbFrame);
	nbFrame = 0;
	const start = performance.now();
	handleBonus(player);
	const end = performance.now();
	console.log('Time to handle bonus:', end - start);
	simulateScores(players);
	updateScoreboard(players);
}, 1000);

requestAnimationFrame(render);
