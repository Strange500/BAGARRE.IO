import { Player } from './class/Player.js';
import { GameMap } from './class/Map.js';
import { updateScoreboard, simulateScores } from './handlers/ScoreHandler.js';
import { handleKeydown, handleKeyup, movePlayer } from './handlers/MovementPlayerHandler.js';
import { Food } from './class/Food';
import { Circle, Quadtree } from "@timohausmann/quadtree-ts";
import { io } from 'socket.io-client';


// DOM Elements
const canvas = document.querySelector('.gameCanvas');
const fpsDiv = document.querySelector('#fps');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);
const players = [];
let foodQuadTree;
let map;
let socket;
// Player-related variables
export let player;
let nbFrame = 0;

// Initialize the game map and player
initializeGame();

// Resize the canvas based on the window size
canvasResizeObserver.observe(canvas);

// Function Definitions
function resampleCanvas() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

function initializeGame() {
	setupSocket();
}

function setupSocket() {
	socket = io(`${window.location.hostname}:3000`);

	// Set up socket event listeners
	socket.on('connect', () => {
		console.log('Connected to server');
		requestRoomChoices(socket);
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from server');
	});

	socket.on('connect_error', (error) => {
		console.error('Failed to connect to server:', error);
	});
}

// Request available rooms and allow user to join one
function requestRoomChoices(socket) {
	socket.on('room:choices', (rooms) => {
		console.log('Available rooms:', rooms);
		const room = prompt('Enter room name: ' + rooms.join(', '));
		socket.emit('room:join', room);

		// Listen for acknowledgment of successfully joining the room
		socket.on('room:joined', () => {
			console.log('Joined room:', room);
			setupUser(socket);
		});
	});
}

// Set up the user and prompt for username
function setupUser(socket) {
	const usrname = prompt('Enter your username: ');
	socket.emit('init:ready', usrname || 'Anonymous');

	function addUser(newPlayer) {
		if (players.some(p => p.id === newPlayer.id)) {
			return;
		}
		if (newPlayer.id === socket.id) {
			if (player) return;
			player = new Player(newPlayer.name, newPlayer.x, newPlayer.y, newPlayer.id);
			players.push(player);
		} else {
			players.push(new Player(newPlayer.name, newPlayer.x, newPlayer.y, newPlayer.id));
		}
	}
	socket.on('room:newPlayer', (newPlayer) => {
		console.log('New player in room:', newPlayer.name);
		addUser(newPlayer);

	});
	socket.on('room:players', (newPlayers) => {
		console.log('Players in room:', newPlayers.map(p => p.name));
		newPlayers.forEach((newPlayer) => {
			addUser(newPlayer);
		});
		if (player) {
			socket.emit('init:receivedPlayers');
			socket.on('init:map', (m) => {
				map = new GameMap(m.width, m.height);
				socket.emit('init:mapReceived');
				socket.on('init:food', (food) => {
					foodQuadTree = new Quadtree({
						width: map.width,
						height: map.height
					});
					food.forEach(f => {
						foodQuadTree.insert(new Food(f.bonus, f.x, f.y));
					});
					socket.emit('init:foodReceived');
					let ready = prompt('type OK when you are ready to start the game');
					while (ready !== 'OK') {
						ready = prompt('type OK when you are ready to start the game');
					}
					socket.emit('init:go');
					console.log('Game is ready');
					socket.on('game:start', () => {
						console.log('Game started');
						launchClientGame(socket);
					});
				});

			});
		}
	});
}


function launchClientGame() {
	setInterval(updateGame, 1000 / 60);
	setInterval(() => {
		simulateScores(players);
		updateScoreboard(players);
	}, 1000);

	requestAnimationFrame(render);

	socket.on("food:ate", (data) => {
		const p = players.find(p => p.id === data.playerId);
		if (p === player) return;
		const f = new Food(data.food.bonus, data.food.x, data.food.y);
		const food = foodQuadTree.retrieve(new Circle({ x: f.x, y: f.y, r: f.size }));
		if (food.length > 0) {
			const f = food.find(fo => fo.x === data.food.x && fo.y === data.food.y);
			if (f) {
				foodQuadTree.remove(f);
			}
		}
		p.addFood(data.food.bonus);
	});

	socket.on('player:moved', (content) => {
		const p = players.find(p => p.id === content.playerId);
		if (p) {
			p.x = content.x;
			p.y = content.y;
		}
	});
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	const offsetX = -player.x + canvas.width / 2;
	const offsetY = -player.y + canvas.height / 2;

	context.translate(offsetX, offsetY);

	map.drawDecor(context, player, canvas.width / 2, canvas.height / 2);
	map.drawFood(context, foodQuadTree, player, canvas.width / 2, canvas.height / 2);

	players.forEach(p => {
		if (map.drawPlayer(context, p, player, canvas.width / 2, canvas.height / 2)) {
			map.drawName(context, p);
		}
	});

	context.resetTransform();
	nbFrame++;


	requestAnimationFrame(render);
}

function handleBonus(p) {
	foodQuadTree.retrieve(new Circle({ x: p.x, y: p.y, r: p.size })).forEach(food => {
		const distance = Math.hypot(food.x - p.x, food.y - p.y);
		if (distance <= p.size) {
			p.addFood(food.bonus);
			foodQuadTree.remove(food);
			socket.emit('player:eat', {
				playerId: p.id,
				x: food.x,
				y: food.y,
				bonus: food.bonus
			});
		}
	});
}

function updateGame() {
	const movementData = {
		xDirection: player.xDirection,
		yDirection: player.yDirection,
	};
	movePlayer(player, map);
	socket.emit('player:move', {
		playerId: player.id,
		x: player.x,
		y: player.y,
	});
	handleBonus(player);
	players.sort((a, b) => a.size - b.size);
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);
canvas.addEventListener('mousedown', (event) => context.beginPath());