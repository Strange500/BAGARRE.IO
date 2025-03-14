import { Player } from './class/Player.js';
import { GameMap } from './class/Map.js';
import { updateScoreboard, simulateScores } from './handlers/ScoreHandler.js';
import {
	handleKeydown,
	handleKeyup,
	movePlayer,
} from './handlers/MovementPlayerHandler.js';
import { Food } from './class/Food';
import {Bot} from "./class/Bot";
import {Circle, Quadtree} from "@timohausmann/quadtree-ts";
import { io } from 'socket.io-client';




const players = [];
const canvas = document.querySelector('.gameCanvas');
const fpsDiv = document.querySelector('#fps');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);
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

export let player = new Player('GigaChad',map.width / 2, map.height / 2);

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



//players.push(player);

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
		socket.emit('foodEaten', p);
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
	fpsDiv.innerHTML = "FPS: " + nbFrame;
	nbFrame = 0;
	const start = performance.now();
	handleBonus(player);
	const end = performance.now();
	simulateScores(players);
	updateScoreboard(players);
}, 1000);

requestAnimationFrame(render);

const username = prompt('Enter your username');

const socket = io(window.location.hostname + ':3000');
socket.on('connect', () => {
	socket.emit('join', {
		username: username,
	});

	socket.on('player', (p) => {
		player = new Player(p.name, p.x, p.y, p.id);
		console.log('Received player', player);
		players.push(player);
	});

	socket.on("players", (p) => {
		p.filter(p => p.id !== player.id).forEach(p => {
			players.push(new Player(p.name, p.x, p.y, p.id));
		});
	});

	setInterval(() => {
		socket.emit('move', {
			xDirection: player.xDirection,
			yDirection: player.yDirection,
		});
	}, 10);

	socket.on('playerMoved', (p) => {
		const movedPlayer = players.find((player) => player.id === p.id);
		if (!movedPlayer) return;
		movedPlayer.x = p.x;
		movedPlayer.y = p.y;
	});

	socket.on('playerSizeChanged', (p) => {
		console.log('Received player size changed', p);
		const movedPlayer = players.find((player) => player.id === p.id);
		if (!movedPlayer) return;
		movedPlayer.size = p.size;
	});
});


socket.on('disconnect', () => {
	console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
	console.error('Failed to connect to server');
	console.error(error);
});

