import { GameMap } from '../client/class/Map.js';
import { Player } from '../client/class/Player.js';
import { Bot } from '../client/class/Bot.js';
import { Food } from '../client/class/Food.js';
import { RandomBonus } from '../client/handlers/BonusHandler.js';
import { getMaxSpeed, movePlayer } from './movement.js';
import fs from 'fs';
import { FoodManager } from '../utils/FoodManager.js';
import { KillHandler } from '../utils/KillHandler.js';

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export class Hub {
	players;
	bots;
	food;
	map;
	io;
	name;
	status;
	maxPlayers;
	deadPlayers;
	foodManager;
	killHandler;

	constructor(
		{ maxSizeX, maxSizeY },
		ioServer,
		roomName,
		maxPlayers,
		MaxFood,
		MaxFoodBonus
	) {
		this.map = new GameMap(maxSizeX, maxSizeY);
		this.players = [];
		this.bots = [];
		this.deadPlayers = [];
		this.io = ioServer; // Socket.io server instance
		this.name = roomName; // Room identifier
		this.status = 'waiting'; // 'waiting', 'started', 'ended'
		this.maxPlayers = maxPlayers;
		this.foodManager = new FoodManager(
			this.map.width,
			this.map.height,
			MaxFoodBonus,
			MaxFood
		);
		this.killHandler = new KillHandler();
	}

	_saveTempImage(image) {
		// received image is a base64 string
		const acceptedFormats = ['png', 'jpeg', 'jpg', 'webp'];
		if (!fs.existsSync('./public/img/temp')) {
			fs.mkdirSync('./public/img/temp');
		}
		const currentFormat = image.substring(11, image.indexOf(';'));
		if (!acceptedFormats.includes(currentFormat)) {
			return null;
		}
		const path = `./public/img/temp/${Date.now()}.${currentFormat}`;
		const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
		fs.writeFileSync(path, base64Data, 'base64');
		return path.substring(8);
	}

	sendToRoom(event, data) {
		this.io.to(this.name).emit(event, data);
	}

	handleDisconnect(socket) {
		console.log('A user disconnected from room', this.name);
		this.sendToRoom('playerDisconnected', socket.id);
		this.players = this.players.filter(player => player.id !== socket.id);
		this._spawnBot();
	}

	_spawnBot() {
		const bot = new Bot(
			`Bot ${this.bots.length + 1}`,
			Math.random() * this.map.width,
			Math.random() * this.map.height,
			this.bots.length
		);
		this.bots.push(bot);
	}

	_fillWithBots() {
		while (this.players.length + this.bots.length < this.maxPlayers) {
			this._spawnBot();
		}
		this.bots.forEach(bot => {
			this._addBot(bot);
		});
	}

	async handleIoConnection(socket) {
		console.log('A user is connected to room', this.name);
		socket.emit('room:joined');
		if (this.status === 'ended') {
			socket.emit('game:end');
			return;
		}
		socket.on('init:ready', () => {
			this.setupPlayerInitListeners(socket);
			socket.on('init:foodReceived', () => {
				console.log('Food received');
				socket.emit('room:players', this.players);
				socket.on('init:receivedPlayers', () => {
					console.log('Players received');
					let customImage = null;
					socket.on('init:customImage', image => {
						customImage = this._saveTempImage(image);
					});
					socket.on('init:player', content => {
						this.addPlayer(socket, content.name, content.color, customImage);
						socket.emit(
							'you:player',
							this.players.find(p => p.id === socket.id)
						);
						socket.on('init:go', () => {
							console.log('Player is ready');
							const player = this.players.find(p => p.id === socket.id);
							if (player) {
								player.ready = true;
							}
							if (this.status === 'started') {
								player.ready = true;
								socket.emit('game:start');
								this._setListeners(socket);
								return;
							}
							let allReady = true;
							this.players.forEach(p => {
								if (!p.ready) {
									allReady = false;
								}
							});
							this._setListeners(socket);
							if (allReady) {
								this.start();
							}
						});
					});
				});
			});
		});
	}

	_canReplaceABot() {
		return this.bots.length > 0;
	}

	addPlayer(socket, playerName, color, image) {
		const replaceBot = this._canReplaceABot();
		if (this.players.length < this.maxPlayers || replaceBot) {
			const player = new Player(
				playerName,
				Math.random() * this.map.width,
				Math.random() * this.map.height,
				socket.id
			);
			if (color) {
				player.color = color;
			}
			if (image) {
				player.image = image;
			}
			if (replaceBot) {
				player.ready = true;
				const bot = this.bots.pop();
				this.players.splice(this.players.indexOf(bot), 1);
				console.log(`Bot ${bot.name} replaced by player ${player.name}`);
				this.sendToRoom('room:replaceBot', {
					botId: bot.id,
					player: player,
				});
			}
			this.players.push(player);
			this.sendToRoom('room:newPlayer', player);
		}
	}

	_addBot(bot) {
		if (this.players.length < this.maxPlayers) {
			this.players.push(bot);
			this.sendToRoom('room:newPlayer', bot);
		}
	}

	setupPlayerInitListeners(socket) {
		socket.emit('init:map', this.map);
		socket.on('init:mapReceived', () => {
			console.log('Map received');
			console.log('Food', this.foodManager.getAllFood());
			socket.emit('init:food', this.foodManager.getAllFood());
		});
	}

	_getNearestObject({ x, y }, objects) {
		let nearest = null;
		let nearestDistance = Infinity;
		objects.forEach(obj => {
			const distance = Math.hypot(obj.x - x, obj.y - y);
			if (distance < nearestDistance) {
				nearest = obj;
				nearestDistance = distance;
			}
		});
		return {
			nearest: nearest,
			distance: nearestDistance,
		};
	}

	_onFoodAdd = foods => {
		this.sendToRoom('food:spawn', foods);
	};

	_onFoodRemove = food => {
		this.sendToRoom('food:remove', food);
	};

	_onKill = (target, killer) => {
		console.log(`Player ${killer.name} killed ${target.name}`);
		killer.addKill(target.size);
		this.players.splice(this.players.indexOf(target), 1);
		this.sendToRoom('player:killed', {
			playerId: killer.id,
			targetId: target.id,
		});
	};

	async _setListeners(socket) {
		socket.on('player:eat', content => {
			const food = new Food(content.bonus, content.x, content.y);
			const player = this.players.find(p => p.id === content.playerId);
			const realFood = this.foodManager.getFoodIfCanEat(player, food);
			if (realFood) {
				this.foodManager.addFood(this._onFoodAdd);
				this.foodManager.removeFood(realFood, this._onFoodRemove);
				player.addFood(realFood.bonus);
				this.sendToRoom('food:ate', {
					food: realFood,
					playerId: player.id,
				});
			}
		});

		socket.on('player:move', content => {
			const player = this.players.find(p => p.id === content.playerId);
			if (player) {
				if (Math.hypot(content.x - player.x, content.y - player.y) <= getMaxSpeed(player)*3*1.2) {
					player.x = content.x;
					player.y = content.y;
				} else {
					console.log('Player', player.name, 'is cheating');
					this.killHandler.killPlayer(player, new Player('Cheater', 0, 0, 'cheater'), this._onKill);
				}
			}
			this.sendToRoom('player:moved', content);
		});

		socket.on('player:kill', content => {
			const player = this.players.find(p => p.id === content.playerId);
			const target = this.players.find(p => p.id === content.targetId);
			this.killHandler.killPlayer(target, player, this._onKill);
		});

		socket.on('invincibility:start', playerId => {
			const player = this.players.find(p => p.id === playerId);
			if (player) {
				player.invincibility = true;
				console.log('Player', player.name, 'is invincible');
				this.sendToRoom('invincibility:start', playerId);
			}
		});

		socket.on('invincibility:end', playerId => {
			const player = this.players.find(p => p.id === playerId);
			if (player) {
				player.invincibility = false;
				console.log('Player', player.name, 'is no longer invincible');
				this.sendToRoom('invincibility:end', playerId);
			}
		});

		socket.on('ping', content => {
			socket.emit('pong', content);
		});

		socket.on('level:up', content => {
			const p = this.players.find(p => p.id === content.playerId);
			socket.emit('player:bonus', RandomBonus());
		});

		socket.on('Double_point:start', content => {
			const p = this.players.find(p => p.id === content);
			if (!p) return;
			p.score.updateCoef(2);
		});

		socket.on('Double_point:end', content => {
			const p = this.players.find(p => p.id === content);
			if (!p) return;
			p.score.updateCoef(1);
			socket.emit('Double_point:end', content);
		});
	}

	startGameLoop() {
		return setInterval(() => {
			this.bots.forEach(bot => {
				bot.nextMove(this.foodManager, this.players);
				movePlayer(bot, this.map);
				this.sendToRoom('player:moved', {
					x: bot.x,
					y: bot.y,
					playerId: bot.id,
				});
			});

			this.bots.forEach(bot => {
				const food = this.foodManager.getFoodNearPlayer(bot);
				const nearest = this._getNearestObject(bot, food);
				if (nearest.nearest && nearest.distance < bot.size) {
					this.foodManager.removeFood(nearest.nearest, this._onFoodRemove);
					this.foodManager.addFood(this._onFoodAdd);
					bot.addFood(nearest.nearest.bonus);
					this.sendToRoom('food:ate', {
						food: nearest.nearest,
						playerId: bot.id,
					});
				}
			});

			this.bots.forEach(bot => {
				this.players.forEach(player => {
					this.killHandler.killPlayer(player, bot, this._onKill);
				});
			});
		}, 1000 / 60);
	}

	async start() {
		this._fillWithBots();
		const loop = this.startGameLoop();
		this.sendToRoom('game:start');
		this.status = 'started';

		while (!this.isGameEnded()) {
			await sleep(1000);
		}
		console.log('Game ended');
		clearInterval(loop);
		this.sendToRoom('game:end', this.players[0].id);
	}

	getScores() {
		const realPlayers = this.players.filter(player => !(player instanceof Bot));
		return realPlayers.map(player => {
			return {
				name: player.name,
				score: player.score.getTotalScore(),
				date: new Date(),
			};
		});
	}

	/**
	 * Check if the game has ended
	 * if there are no players left
	 * or if there is only one player left
	 * or if there are only bots left
	 */
	isGameEnded() {
		return this.players.length === 1;
	}

	// Stop the Hub and clean up resources
	stop() {
		this.io = null;
		this.players = [];
		this.bots = [];
		this.map = null;
	}
}
