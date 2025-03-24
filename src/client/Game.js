import { COLORS, Player } from '../entities/Player.js';
import { GameMap } from '../entities/Map.js';
import { updateScoreboard, simulateScores } from './handlers/ScoreHandler.js';
import {
	computeTargetAngle,
	handleKeyDown,
	handleKeyUp,
	handleMouseDirection,
} from './handlers/MovementPlayerHandler.js';
import { Food } from '../entities/Food.js';
import { io } from 'socket.io-client';
import { updatePlayerSheet } from '../entities/Player.js';
import { showBonus } from './handlers/BonusHandler.js';
import { movePlayer } from '../utils/movement.js';
import { soundManager } from './handlers/SoundHandler.js';
import { FoodManager } from '../utils/FoodManager.js';
import { KillHandler } from '../utils/KillHandler.js';
import {PlayerPersonalisationHandler} from "./handlers/PlayerPersonalisationHandler";


export const canvas = document.querySelector('.gameCanvas');
const fpsDiv = document.querySelector('#fps');
const pingDiv = document.querySelector('#ping');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);
const lobbyForm=document.querySelectorAll(".choice-lobby");
const startForm=document.querySelector(".start-menu");
const buttonCredit=document.querySelector(".credit-button");
const sheetCredit=document.querySelector(".credit-sheet");
const buttonReplay=document.querySelector(".replay-button");

let startTime;
const players = [];
const playerPersonalisationHandler = new PlayerPersonalisationHandler();
let foodManager;
let killHandler;
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
		const allRoom=document.querySelector(".select select");
		allRoom.innerHTML="";
		rooms.forEach((room)=>{
			allRoom.innerHTML+=`<option value="${room}">${room}</option>`
		});
	});
}


function showSpectatorBadge() {
	document.querySelector('#spectator').style.display = 'block';
}


function showMenu() {
	showSpectatorBadge();
	playerPersonalisationHandler.showColorSelector();
}

function hideSpectatorBadge() {
	document.querySelector('#spectator').style.display = 'none';
}


function hideMenu() {
	hideSpectatorBadge();
	playerPersonalisationHandler.hideColorSelector();
}
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

function addNewPlayer(newPlayer) {
	console.log('New player in room:', newPlayer.name);
	addUser(newPlayer);
}

function initialiseMap(m, socket) {
	map = new GameMap(m.width, m.height);
	socket.emit('init:mapReceived');
	console.log('Map received');
	socket.on('init:food', food => {
		foodManager = new FoodManager(map.width, map.height, -1, -1);
		food.forEach(f => {
			foodManager.forceAddFood(new Food(f.bonus, f.x, f.y));
		});
		socket.emit('init:foodReceived');
		console.log('Food received');
	});
}

function initialiseCurrentPlayers(newPlayers, socket) {
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
	console.log('Game is ready');
	socket.on('game:start', () => {
		updInter = setInterval(updateGame, 1000 / 60);
		hideMenu();
		console.log('Game started');
	});
}

function setupUser(socket) {
	socket.emit('init:ready');

	socket.on('room:newPlayer', newPlayer => addNewPlayer(newPlayer));

	socket.on('init:map', m => initialiseMap(m, socket));

	socket.on('room:players', newPlayers => initialiseCurrentPlayers(newPlayers, socket));
}
let gameEnded = false;

function setPing(ping) {
	pingDiv.textContent = `Ping: ${ping} ms`;
}

function computePing() {
	socket.emit('ping', '');
	const startPing = performance.now();
	socket.on('pong', () => {
		setPing(Math.round((performance.now() - startPing) * 1000) / 1000);
	});
}

function onFoodAte(data) {
	const p = players.find(p => p.id === data.playerId);
	if (!p) return;
	const food = foodManager.getFoodAtPosition(data.food.x, data.food.y);
	if (food) {
		foodManager.removeFood(food);
	}
	const res = p.addFood(data.food.bonus);
	if (p.id === player.id) {
		soundManager.playEatSound();
		if (res) {
			socket.emit('level:up', '');
		}
	}
}

function onBotReplaced(content) {
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
}

function onPlayerMoved(content) {
	const p = players.find(p => p.id === content.playerId);
	if (p) {
		p.x = content.x;
		p.y = content.y;
	}
}

function onPlayerKilled(content, scInter) {
	soundManager.playKillSound();
	const killer = players.find(p => p.id === content.playerId);
	const target = players.find(p => p.id === content.targetId);
	if (!target || !killer) {
		return;
	}
	killHandler.forceKillPlayer(target, killer);
	killer.addKill(target.size);
	players.splice(players.indexOf(target), 1);
	console.log(`Player ${killer.name} killed ${target.name}`);
	if (target === player) {
		soundManager.playLoseTheme();
		console.log('You were killed');
		clearInterval(updInter);
		clearInterval(scInter);
		gameEnded = true;
		showReplayButton();
	}
}

function onFoodSpawn(content) {
	for (let i = 1; i < content.length; i++) {
		const bonus = content[i].bonus;
		const x = content[i].x;
		const y = content[i].y;
		const newFood = new Food(bonus, x, y);
		newFood.img = content[i].img;
		foodManager.forceAddFood(newFood);
	}
}

function onInvicibilityStart(id) {
	const p = players.find(p => p.id === id);
	if (p) {
		p.invincibility = true;
		if (!p.oldImg) {
			p.oldImg = p.image;
		}
		p.image = '/img/invincible.webp';
	}
}

function onInvicibiltyEnd(id) {
	const p = players.find(p => p.id === id);
	if (p) {
		p.invincibility = false;
		p.image = p.oldImg;
	}
}

function onGameEnd(scInter, id) {
	console.log('Game ended');
	clearInterval(scInter);
	clearInterval(updInter);
	gameEnded = true;
	soundManager.stopTheme();
	if (id === player.id) {
		soundManager.playVictoryTheme();
	} else {
		soundManager.playLoseTheme();
	}
	showReplayButton();
}

function onBonus(content) {
	soundManager.playBonusSound();
	const listBonus = content;
	showBonus(listBonus, player, socket);
}

function initGameListeners(scInter) {
	socket.on('food:ate', data => onFoodAte(data));

	socket.on('room:replaceBot', content => onBotReplaced(content));

	socket.on('player:moved', content => onPlayerMoved(content));

	socket.on('player:killed', content => onPlayerKilled(content, scInter));

	socket.on('food:spawn', content => onFoodSpawn(content));

	socket.on('invincibility:start', id => onInvicibilityStart(id));

	socket.on('invincibility:end', id => onInvicibiltyEnd(id));

	socket.on('game:end', id => onGameEnd(scInter, id));

	socket.on('player:bonus', content => onBonus(content));

	socket.on("upd:food", content => foodManager.update(content));
}

function setFps() {
	fpsDiv.textContent = `FPS: ${fps}`;
}

function launchClientGame() {
	const scoreAndStatInterval = setInterval(() => {
		simulateScores(players);
		updateScoreboard(players);
		computePing();
		setFps();
	}, 1000);
	initGameListeners(scoreAndStatInterval);
	requestAnimationFrame(render);
}

// Update player sheet every second and force theme start
setInterval(() => {
	if (player) {
		updatePlayerSheet(player);
	}
	soundManager.forceThemeStart();
}, 1000);

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

let zoomLevel = 1; // Initial zoom level
const zoomStep = 0.1; // How much to zoom in/out each time



function render() {
	computeFps();
	fps = times.length;

	if (gameEnded) {
		drawGameOverScreen();
		return;
	}

	if (!zoomViaScroll) {
		zoomLevel = calculateZoomLevel(player.size);
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.scale(zoomLevel, zoomLevel);

	const widthZoom =canvas.width / (2 * zoomLevel);
	const heightZoom =canvas.height / (2 * zoomLevel);

	const offsetX = (-(player.x) + widthZoom);
	const offsetY = (-(player.y) + heightZoom);
	context.translate(offsetX, offsetY);

	// Draw map and entities
	map.drawDecor(
		context,
		player,
		widthZoom + player.size,
		heightZoom + player.size
	);
	map.drawFood(
		context,
		foodManager,
		player,
		widthZoom,
		heightZoom
	);

	players.forEach(p => {
		if (
			map.drawPlayer(
				context,
				p,
				player,
				widthZoom,
				heightZoom
			)
		) {
			map.drawName(context, p);
		}
	});

	context.resetTransform();
	requestAnimationFrame(render);
}

function drawGameOverScreen() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.font = `${FONT_SIZE} ${FONT_FAMILY}`;
	context.fillStyle = 'white';
	context.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 200);
	// afficahge du temps je jeux, le score et la taille
	context.font = `30px ${FONT_FAMILY}`;
	const time = Math.round((performance.now() - startTime) / 1000);
	const stringTime = `Game time: ${time} s`;
	context.fillText(stringTime, canvas.width / 2 - 100, canvas.height / 2 + 50);
	const score = Math.round(player.score.getTotalScore());
	const size = Math.round(player.size);
	context.fillText(`Score: ${score}`,canvas.width / 2 - 100, canvas.height / 2 + 100);
	context.fillText(`Size: ${size}`, canvas.width / 2 - 100, canvas.height / 2 + 150);
}

function sendPosition() {
	socket.emit('player:move', {
		playerId: player.id,
		x: player.x,
		y: player.y,
	});
}

function updateGame() {
	computeTargetAngle();
	movePlayer(player, map);
	sendPosition();
	handleBonus(player);
	handleKill(player, players);
	players.sort((a, b) => a.size - b.size);
	detectInviciblePlayers();
}

function handleBonus(p) {
	foodManager.getFoodNearPlayer(p)
		.forEach(food => {
			if (foodManager.CanEat(p, food)) {
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
		if (killHandler.canKillPlayer(other, p)) {
			socket.emit('player:kill', {
				playerId: p.id,
				targetId: other.id,
			});
		}
	}
}

document.addEventListener('mousemove', handleMouseDirection);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);




lobbyForm.forEach((f)=>{
	const form=f.querySelector("form");
	form.addEventListener("submit", (event )=>{
		const formData=new FormData(form);
		const room=formData.get("lobby");
		event.preventDefault();
		startForm.style.display="block";
		document.querySelector("#menu").style.display="none";
		lobbyForm.forEach((lobby)=>{lobby.style.display="none"});
		socket.emit('room:join', room);

			socket.on('room:joined', () => {
				console.log('Joined room:', room);
				killHandler = new KillHandler();
				setupUser(socket);
			});
		})
});

startForm.addEventListener('submit', event => {
	const formData = new FormData(startForm.querySelector('form'));
	const username = formData.get('pseudo');
	event.preventDefault();
	startForm.style.display = 'none';
	document.querySelector("#menu").style.display="none";
	socket.emit('init:player', {
		name: username || 'Anonymous',
		color: playerPersonalisationHandler.choosenColor,
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
	startTime = performance.now();
});
buttonCredit.addEventListener('click',(event)=>{
	if (sheetCredit.style.display==="none"){
		sheetCredit.style.display='block';
	} else {
		sheetCredit.style.display="none";
	}
});
const closeCredit=document.querySelector(".reload");
closeCredit.addEventListener("click",()=>{
	if (sheetCredit.style.display==="none"){
		sheetCredit.style.display='block';
	} else {
		sheetCredit.style.display="none";
	}
})
const ScoreBtn = document.querySelector('#ScoresButton');
const ScoreDiv = document.querySelector('#scores');
const table = document.querySelector('#scores-body');

socket.on('bestScores', data => {
	console.log('received best scores', data);
	data.sort((a, b) => b.score - a.score);
	data.forEach(score => {
		const row = document.createElement('tr');
		const nameTd = document.createElement('td');
		const scoreTd = document.createElement('td');
		const dateTd = document.createElement('td');
		nameTd.textContent = score.name;
		scoreTd.textContent = Math.round(score.score) + ' points';
		dateTd.textContent = new Date(score.date).toLocaleString();
		row.appendChild(nameTd);
		row.appendChild(scoreTd);
		row.appendChild(dateTd);
		table.appendChild(row);
	});
});

function showScores() {
	socket.emit('get:bestScores');
}

ScoreBtn.addEventListener('click', () => {
	if (ScoreDiv.style.display === 'none') {
		ScoreDiv.style.display = 'block';
		table.innerHTML = '';
		showScores();
	} else {
		ScoreDiv.style.display = 'none';
	}
});

buttonReplay.querySelector("button").addEventListener("click",()=>{
	window.location.reload();
})
function showReplayButton(){
	buttonReplay.style.display="block";
}

function detectInviciblePlayers() {
	let play = false;
	players.forEach(otherPlayer => {
		if (!otherPlayer.invincibility) return;
		const distance = Math.hypot(
			otherPlayer.x - player.x,
			otherPlayer.y - player.y
		);
		const maxDistance = canvas.height / (2 * zoomLevel);
		if (distance <= maxDistance) {
			play = true;
		}
	});
	if (play) {
		soundManager.playStarSound();
	} else {
		soundManager.stopStar();
	}
}

