import { Player } from './class/Player.js';
import { GameMap } from './class/Map.js';
import { updateScoreboard, simulateScores } from './handlers/ScoreHandler.js';
import {
	handleMouseDirection,
} from './handlers/MovementPlayerHandler.js';
import { Food } from './class/Food.js';
import { Circle, Quadtree } from '@timohausmann/quadtree-ts';
import { io } from 'socket.io-client';
import { updatePlayerSheet } from '../server/pHandler.js';
import { showBonus } from './handlers/BonusHandler.js';
import { movePlayer } from '../server/movement.js';

export const canvas = document.querySelector('.gameCanvas');
const fpsDiv = document.querySelector('#fps');
const pingDiv = document.querySelector('#ping');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);

const audiKill = document.querySelector('#audioKill');
const audiEat = document.querySelector('#audioEat');
const audiBonus = document.querySelector('#audioBonus');
const theme = document.querySelector('#theme');
const gun = document.querySelector('#gun');
const lose = document.querySelector('#lose');
const win = document.querySelector('#win');


const players = [];
let foodQuadTree;
let map;
export let socket;
export let player;
let nbFrame = 0;

initializeGame();

canvasResizeObserver.observe(canvas);

function resampleCanvas() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

function initializeGame() {
	setupSocket();
}

function setupSocket() {
	socket = io(`${window.location.hostname}:3000`);
	socket.on('connect', () => {
		console.log('Connected to server');
		requestRoomChoices(socket);
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from server');
	});

	socket.on('connect_error', error => {
		console.error('Failed to connect to server:', error);
	});
}

function requestRoomChoices(socket) {
	socket.on('room:choices', rooms => {
		console.log('Available rooms:', rooms);
		const room = prompt('Enter room name: ' + rooms.join(', '));
		socket.emit('room:join', room);

		socket.on('room:joined', () => {
			console.log('Joined room:', room);
			setupUser(socket);
		});
	});
}

function setupUser(socket) {
	const usrname = prompt('Enter your username: ');
	socket.emit('init:ready', usrname || 'Anonymous');

	function addUser(newPlayer) {
		if (players.some(p => p.id === newPlayer.id)) {
			return;
		}
		if (newPlayer.id === socket.id) {
			if (player) return;
			player = new Player(
				newPlayer.name,
				newPlayer.x,
				newPlayer.y,
				newPlayer.id
			);
			players.push(player);
		} else {
			players.push(
				new Player(newPlayer.name, newPlayer.x, newPlayer.y, newPlayer.id)
			);
		}
	}
	socket.on('room:newPlayer', newPlayer => {
		console.log('New player in room:', newPlayer.name);
		addUser(newPlayer);
	});
	socket.on('room:players', newPlayers => {
		console.log(
			'Players in room:',
			newPlayers.map(p => p.name)
		);
		newPlayers.forEach(newPlayer => {
			addUser(newPlayer);
		});
		if (player) {
			socket.emit('init:receivedPlayers');
			socket.on('init:map', m => {
				map = new GameMap(m.width, m.height);
				socket.emit('init:mapReceived');
				socket.on('init:food', food => {
					foodQuadTree = new Quadtree({
						width: map.width,
						height: map.height,
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
let stop = false;

let startPing;

function launchClientGame() {
	const updInter = setInterval(updateGame, 1000 / 60);
	const scInter = setInterval(() => {
		simulateScores(players);
		updateScoreboard(players);
		socket.emit('ping', '')
		startPing = performance.now();
		socket.on('pong', () => {
			// round to 3 decimal
			pingDiv.textContent = `Ping: ${Math.round((performance.now() - startPing) * 1000) / 1000} ms`;
		});
		fpsDiv.textContent = `FPS: ${fps}`;
	}, 1000);

	requestAnimationFrame(render);

	socket.on('food:ate', data => {
		const p = players.find(p => p.id === data.playerId);
		if (!p) return;
		const f = new Food(data.food.bonus, data.food.x, data.food.y);
		const food = foodQuadTree.retrieve(
			new Circle({ x: f.x, y: f.y, r: f.size })
		);
		if (food.length > 0) {
			const f = food.find(fo => fo.x === data.food.x && fo.y === data.food.y);
			if (f) {
				foodQuadTree.remove(f);
			}
		}

		const res = p.addFood(data.food.bonus);
		console.log(`new size: ${p.size}`);
		if (p.id === player.id) {
			audiEat.play();
			if (res) {
				socket.emit('level:up', '');
			}

		}
	});

	socket.on('player:moved', content => {
		const p = players.find(p => p.id === content.playerId);
		if (p) {
			p.x = content.x;
			p.y = content.y;
		}
	});

	socket.on('player:killed', content => {
		audiKill.play();
		const p = players.find(p => p.id === content.playerId);
		const target = players.find(p => p.id === content.targetId);
		if (p && target) {
			p.addKill(target.size);
			players.splice(players.indexOf(target), 1);
			console.log(`Player ${p.name} killed ${target.name}`);
			if (target === player) {
				console.log('You were killed');
				clearInterval(updInter);
				clearInterval(scInter);
				stop = true;
			}
		}
	});

	socket.on('game:end', (id) => {
		console.log('Game ended');
		setTimeout(() => {
			gun.play().then(
				() => {
					setTimeout(() => {
						console.log(id, player.id);
						if (id === player.id) {
							win.play();
						} else {
							lose.play();
						}
					}, gun.duration * 1000);

				}
			)

			clearInterval(updInter);
			clearInterval(scInter);
			stop = true;
		}, 1000);
	});

	socket.on('player:bonus', content => {
		audiBonus.play();
		const listBonus = content;
		showBonus(listBonus);
	});
}

const times = [];
let fps = 0;
let zoomViaScroll = false;


function computeFps() {
	const now = performance.now();
	while (times.length > 0 && times[0] <= now - 1000) {
		times.shift();
	}
	times.push(now);
}

let zoomLevel = 1; // Initial zoom level
const zoomStep = 0.1; // How much to zoom in/out each time

function render() {
	computeFps();
	fps = times.length;

	if (stop) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '48px serif';
		context.fillStyle = 'black';
		context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
		return;
	}
	if (!zoomViaScroll) {
		if (player.size < 50) {
			zoomLevel = 1;
		} else if (player.size < 100) {
			zoomLevel = 0.9;
		} else if (player.size < 200) {
			zoomLevel = 0.8;
		} else if (player.size < 400) {
			zoomLevel = 0.7;
		} else if (player.size < 800) {
			zoomLevel = 0.6;
		}
	}

	context.clearRect(0, 0, canvas.width, canvas.height);

	context.scale(zoomLevel, zoomLevel);

	const offsetX = (-(player.x) + (canvas.width / (2 * zoomLevel)));
	const offsetY = (-(player.y) + (canvas.height / (2 * zoomLevel)));

	context.translate(offsetX, offsetY);

	map.drawDecor(context, player, canvas.width / (2 * zoomLevel) + player.size, canvas.height / (2 * zoomLevel) + player.size);
	map.drawFood(context, foodQuadTree, player, canvas.width / (2 * zoomLevel), canvas.height / (2 * zoomLevel));

	players.forEach(p => {
		if (map.drawPlayer(context, p, player, canvas.width / (2 * zoomLevel), canvas.height / (2 * zoomLevel))) {
			map.drawName(context, p);
		}
	});

	context.resetTransform();
	requestAnimationFrame(render);
}

function zoomIn() {
	zoomLevel += zoomStep;
	if (zoomLevel > 2) zoomLevel = 2;
}

function zoomOut() {
	zoomLevel -= zoomStep;
	if (zoomLevel < 0.5) zoomLevel = 0.5; // Limit minimum zoom
}

document.addEventListener('wheel', (event) => {
	zoomViaScroll = true;
	if (event.deltaY > 0) {
		zoomOut(); // Zoom out on scroll down
	} else {
		zoomIn(); // Zoom in on scroll up
	}
});

function handleBonus(p) {
	foodQuadTree
		.retrieve(new Circle({ x: p.x, y: p.y, r: p.size }))
		.forEach(food => {
			const distance = Math.hypot(food.x - p.x, food.y - p.y);
			if (distance <= p.size) {
				socket.emit('player:eat', {
					playerId: p.id,
					x: food.x,
					y: food.y,
					bonus: food.bonus,
				});
			}
		});
}

function handleKill(p, players) {
	for (let i = 0; i < players.length; i++) {
		const other = players[i];
		if (other === p) continue;

		const deltaXPlayer = other.x - p.x;
		const deltaYPlayer = other.y - p.y;
		const distanceToPlayer = Math.hypot(deltaXPlayer, deltaYPlayer);

		if (p.size > other.size && distanceToPlayer < p.size) {
			p.addKill(other.size);
			socket.emit('player:kill', {
				playerId: p.id,
				targetId: other.id,
			});
		}
	}
}

function updateGame() {
	movePlayer(player, map);
	socket.emit('player:move', {
		playerId: player.id,
		x: player.x,
		y: player.y,
	});
	handleBonus(player);
	handleKill(player, players);
	players.sort((a, b) => a.size - b.size);
}

document.addEventListener('mousemove', handleMouseDirection);
setInterval(() => {
	if (player) {
		updatePlayerSheet(player);
	}
	if (theme.paused) {
		theme.play();
		theme.loop = true;
		theme.volume = 0.5;
	}
}, 1000);
