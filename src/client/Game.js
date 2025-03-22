import { COLORS, Player } from './class/Player.js';
import { GameMap } from './class/Map.js';
import { updateScoreboard, simulateScores } from './handlers/ScoreHandler.js';
import {
	computeTargetAngle,
	handleKeyDown,
	handleKeyUp,
	handleMouseDirection,
} from './handlers/MovementPlayerHandler.js';
import { Food } from './class/Food.js';
import { Circle, Quadtree } from '@timohausmann/quadtree-ts';
import { io } from 'socket.io-client';
import { updatePlayerSheet } from './class/Player.js';
import { showBonus } from './handlers/BonusHandler.js';
import { movePlayer } from '../server/movement.js';
import { soundManager } from './handlers/SoundHandler';

export const canvas = document.querySelector('.gameCanvas');
const fpsDiv = document.querySelector('#fps');
const pingDiv = document.querySelector('#ping');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);

const players = [];
let foodQuadTree;
let map;
let updInter;

export let socket;
export let player;

const ZOOM_LEVEL_THRESHOLDS = [50, 100, 200, 400, 800];
const FONT_SIZE = '48px';
const FONT_FAMILY = 'serif';

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

let chooseColor = "red";

function showSpectatorBadge() {
	document.querySelector('#spectator').style.display = 'block';
}

function addImageSelector() {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'image/*';
	fileInput.onchange = (event) => {
		event.preventDefault();
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			// emit as imaage in base64
			socket.emit('init:customImage', e.target.result);
		};
		reader.readAsDataURL(file);
	};
	return fileInput;
}

function showColorSelector() {
	const colorChooser = document.querySelector('#colorChooser');
	COLORS.forEach(color => {
		const sec = document.createElement('section');
		sec.style.backgroundColor = color;
		sec.style.width = '50px';
		sec.style.height = '50px';
		sec.style.border = '1px solid black';
		sec.style.display = 'inline-block';
		sec.style.cursor = 'pointer';
		sec.onclick = () => {
			const secs = colorChooser.querySelectorAll('section');
			secs.forEach(s => s.style.border = '1px solid black');
			sec.style.border = '3px solid white';
			chooseColor = color;
		};
		colorChooser.appendChild(sec);
	});
	// add a file input for a custom image
	const fileInput = addImageSelector();
	fileInput.style.display = 'none';
	fileInput.id = 'fileInput';
	const label = document.createElement('label');
	label.htmlFor = 'fileInput';
	label.textContent = 'Upload an Image';
	label.style.display = 'block';
	colorChooser.appendChild(fileInput);
	colorChooser.appendChild(label);
}

function showMenu() {
	showSpectatorBadge();
	showColorSelector();

}

function hideSpectatorBadge() {
	document.querySelector('#spectator').style.display = 'none';
}

function hideColorSelector() {
	const colorChooser = document.querySelector('#colorChooser');
	colorChooser.innerHTML = '';
	colorChooser.style.display = 'none';
}

function hideMenu() {
	hideSpectatorBadge();
	hideColorSelector();
}

function setupUser(socket) {
	socket.emit('init:ready');
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
			player.image = newPlayer.image;
			player.color = newPlayer.color;
			player.size = newPlayer.size;
			players.push(player);
		} else {
			const p = new Player(
				newPlayer.name,
				newPlayer.x,
				newPlayer.y,
				newPlayer.id
			);
			p.image = newPlayer.image;
			p.color = newPlayer.color;
			p.size = newPlayer.size;
			players.push(p);
		}
	}
	socket.on('room:newPlayer', newPlayer => {
		console.log('New player in room:', newPlayer.name);
		addUser(newPlayer);
	});
	socket.on('init:map', m => {
		map = new GameMap(m.width, m.height);
		socket.emit('init:mapReceived');
		console.log('Map received');
		socket.on('init:food', food => {
			foodQuadTree = new Quadtree({
				width: map.width,
				height: map.height,
			});
			food.forEach(f => {
				foodQuadTree.insert(new Food(f.bonus, f.x, f.y));
			});
			socket.emit('init:foodReceived');
			console.log('Food received');
		});
	});
	socket.on('room:players', newPlayers => {
		console.log(
			'Players in room:',
			newPlayers.map(p => p.name)
		);
		newPlayers.forEach(newPlayer => {
			addUser(newPlayer);
		});

			socket.emit('init:receivedPlayers');

		player =
			players.length > 0
				? players[Math.floor(Math.random() * players.length)]
				: new Player('Anonymous', map.width / 2, map.height / 2, 2937);
		showMenu();
		launchClientGame(socket);
		setTimeout(() => {
			const usrname = prompt('Enter your username: ');
			socket.emit('init:player', {
					name: usrname || 'Anonymous',
					color: chooseColor,
			});
			socket.on('you:player', content => {
				player = new Player(content.name, content.x, content.y, content.id);
				player.image = content.image;
				player.color = content.color;
				player.size = content.size;
				if (players.some(p => p.id === player.id)) {
					return;
				}
				players.push(player);
			});
			socket.emit('init:go');
		}, 10000);

			//socket.emit('init:go');
			console.log('Game is ready');
			socket.on('game:start', () => {
				updInter = setInterval(updateGame, 1000 / 60);
				hideMenu();
				console.log('Game started');
			});
	});
}
let stop = false;

let startPing;

function launchClientGame() {
	const scInter = setInterval(() => {
		simulateScores(players);
		updateScoreboard(players);
		socket.emit('ping', '');
		startPing = performance.now();
		socket.on('pong', () => {
			// round to 3 decimal
			pingDiv.textContent = `Ping: ${Math.round((performance.now() - startPing) * 1000) / 1000} ms`;
		});
		fpsDiv.textContent = `FPS: ${fps}`;
	}, 1000);

	requestAnimationFrame(render);
	let foodRemoveCpt = 0;

	socket.on('food:ate', data => {
		foodRemoveCpt++;
		const p = players.find(p => p.id === data.playerId);
		if (!p) return;
		const f = new Food(data.food.bonus, data.food.x, data.food.y);
		const food = foodQuadTree.retrieve(
			new Circle({ x: f.x, y: f.y, r: f.size })
		);
		if (food.length > 0) {
			const f = food.find(fo => fo.x === data.food.x && fo.y === data.food.y);
			if (f) {
				if (foodRemoveCpt === 100) {
					foodQuadTree.remove(f);
					foodRemoveCpt = 0;
				}
				foodQuadTree.remove(f, true);
			}
		}
		const res = p.addFood(data.food.bonus);
		if (p.id === player.id) {
			soundManager.playEatSound();
			if (res) {
				socket.emit('level:up', '');
			}
		}
	});

	socket.on('room:replaceBot', (content) => {
		const botid = content.botId;
		const newPlayer = content.player;
		const bot = players.find(p => p.id === botid);
		if (bot) {
			players.splice(players.indexOf(bot), 1);
			const p = new Player(
				newPlayer.name,
				newPlayer.x,
				newPlayer.y,
				newPlayer.id
			);
			p.image = newPlayer.image;
			p.color = newPlayer.color;
			p.size = newPlayer.size;
			players.push();
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
		soundManager.playKillSound();
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

	socket.on('food:spawn', content => {
		for (let i = 1; i < content.length; i++) {
			const bonus = content[i].bonus;
			const x = content[i].x;
			const y = content[i].y;
			foodQuadTree.insert(new Food(bonus, x, y));
		}
	});

	socket.on('game:end', id => {
		console.log('Game ended');
		clearInterval(scInter);
		clearInterval(updInter);
		stop = true;
		soundManager.stopTheme();
		if (id === player.id) {
			soundManager.playVictoryTheme();
		} else {
			soundManager.playLoseTheme();
		}
	});

	socket.on('player:bonus', content => {
		soundManager.playBonusSound();
		const listBonus = content;
		showBonus(listBonus, player);
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

function calculateZoomLevel(size) {
	for (let i = 0; i < ZOOM_LEVEL_THRESHOLDS.length; i++) {
		if (size < ZOOM_LEVEL_THRESHOLDS[i]) {
			return 1 - (i * 0.1);
		}
	}
	return 0.6;
}

let zoomLevel = 1; // Initial zoom level
const zoomStep = 0.1; // How much to zoom in/out each time

function drawGameOverScreen() {
	context.font = `${FONT_SIZE} ${FONT_FAMILY}`;
	context.fillStyle = 'black';
	context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
}

function render() {
	computeFps();
	fps = times.length;

	if (stop) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawGameOverScreen();
		return;
	}

	if (!zoomViaScroll) {
		zoomLevel = calculateZoomLevel(player.size);
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.scale(zoomLevel, zoomLevel);

	const offsetX = (-(player.x) + (canvas.width / (2 * zoomLevel)));
	const offsetY = (-(player.y) + (canvas.height / (2 * zoomLevel)));
	context.translate(offsetX, offsetY);

	// Draw map and entities
	map.drawDecor(
		context,
		player,
		canvas.width / (2 * zoomLevel) + player.size,
		canvas.height / (2 * zoomLevel) + player.size
	);
	map.drawFood(
		context,
		foodQuadTree,
		player,
		canvas.width / (2 * zoomLevel),
		canvas.height / (2 * zoomLevel)
	);

	players.forEach(p => {
		if (
			map.drawPlayer(
				context,
				p,
				player,
				canvas.width / (2 * zoomLevel),
				canvas.height / (2 * zoomLevel)
			)
		) {
			map.drawName(context, p);
		}
	});

	context.resetTransform();
	requestAnimationFrame(render);
}

function zoomIn() {
	zoomLevel = Math.min(zoomLevel + zoomStep, 2);
}

function zoomOut() {
	zoomLevel = Math.max(zoomLevel - zoomStep, 0.5); // Limit minimum zoom
}

document.addEventListener('wheel', (event) => {
	zoomViaScroll = true;
	(event.deltaY > 0) ? zoomOut() : zoomIn(); // Zoom in/out based on scroll direction
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
		if (other === p || other.invincibility) continue;

		const deltaXPlayer = other.x - p.x;
		const deltaYPlayer = other.y - p.y;
		const distanceToPlayer = Math.hypot(deltaXPlayer, deltaYPlayer);

		if (p.size > other.size && distanceToPlayer < p.size) {
			socket.emit('player:kill', {
				playerId: p.id,
				targetId: other.id,
			});
		}
	}
}

function updateGame() {
	computeTargetAngle();
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
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

setInterval(() => {
	if (player) {
		updatePlayerSheet(player);
	}
	soundManager.forceThemeStart();
}, 1000);

