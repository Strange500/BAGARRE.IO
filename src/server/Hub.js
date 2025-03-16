import { Circle, Quadtree, Rectangle } from '@timohausmann/quadtree-ts';
import { GameMap } from '../client/class/Map.js';
import { Player } from '../client/class/Player.js';
import { Bot } from '../client/class/Bot.js';
import { Food } from '../client/class/Food.js';

const MAX_PLAYERS = 10;
const MAX_FOOD = 1000;
const MAX_FOOD_BONUS = 15;

export class Hub {
    players;
    bots;
    food;
    map;
    io;
    name;

    constructor({ maxSizeX, maxSizeY }, ioServer, roomName) {
        this.map = new GameMap(maxSizeX, maxSizeY);
        this.players = [];
        this.bots = [];
        this.food = new Quadtree({
            width: this.map.width,
            height: this.map.height
        });
        this.io = ioServer; // Socket.io server instance
        this.name = roomName; // Room identifier
        this.initializeFood();
    }

    _genRandomFood() {
        return new Food(
          Math.random() * MAX_FOOD_BONUS,
          Math.random() * this.map.width,
          Math.random() * this.map.height
        );
    }

    initializeFood() {
        for (let i = 0; i < MAX_FOOD; i++) {
            const food = this._genRandomFood();
            this.food.insert(food);
        }
    }

    getAllFood() {
        return this.food.retrieve(new Rectangle({
            x: 0,
            y: 0,
            width: this.map.width,
            height: this.map.height
        }));
    }

    _sendToRoom(event, data) {
        this.io.to(this.name).emit(event, data);
    }

    _onRoomEvent(event, callback) {
        this.io.to(this.name).on(event, callback);
    }

    handleDisconnect(socket) {
        console.log('A user disconnected from room', this.name);
        this._sendToRoom('playerDisconnected', socket.id);
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
        while (this.players.length + this.bots.length < MAX_PLAYERS) {
            this._spawnBot();
        }
        this.bots.forEach(bot => {
            this._addBot(bot);
        });
    }

    async handleIoConnection(socket) {
        console.log('A user is connected to room', this.name);
        socket.emit('room:joined');

        socket.on('init:ready', (playerName) => {
            this.addPlayer(socket, playerName);
        });
    }

    addPlayer(socket, playerName) {
        if (this.players.length < MAX_PLAYERS) {
            const player = new Player(
              playerName,
              Math.random() * this.map.width,
              Math.random() * this.map.height,
              socket.id
            );

            this.players.push(player);
            this._sendToRoom('room:newPlayer', player);
            socket.emit('room:players', this.players);

            this.setupPlayerInitListeners(socket);
        } else if (this.bots.length > 0) {

        }
    }

    _addBot(bot) {
        if (this.players.length < MAX_PLAYERS) {
            this.players.push(bot);
            this._sendToRoom('room:newPlayer', bot);
        }
    }

    // Set up initialization listeners for the new player
    setupPlayerInitListeners(socket) {
        socket.on('init:receivedPlayers', () => {
            console.log('Player received players');
            socket.emit('init:map', this.map);

            socket.on('init:mapReceived', () => {
                console.log('Map received');
                socket.emit('init:food', this.getAllFood());

                socket.on('init:foodReceived', () => {
                    console.log('Food received');

                    socket.on('init:go', () => {
                        console.log('Player is ready');
                        const player = this.players.find(p => p.id === socket.id);
                        if (player) {
                            player.ready = true;
                        }

                        let allReady = true;
                        this.players.forEach(p => {
                            if (!p.ready) {
                                allReady = false;
                            }
                        });
                        this._setListeners(socket);
                        if (allReady) {
                            this._start();
                        }
                    });
                });
            });
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
            distance: nearestDistance
        }
    }

    async _setListeners(socket) {
        socket.on('player:eat', (content) => {
            const food = new Food(content.bonus, content.x, content.y);
            const player = this.players.find(p => p.id === content.playerId);
            if (player) {
                const serverFood = this.food.retrieve(new Circle({
                    x: player.x,
                    y: player.y,
                    r: player.size
                }));
                const nearest = serverFood.find(f => f.x === food.x && f.y === food.y);
                const distance = Math.hypot(nearest.x - player.x, nearest.y - player.y);
                if (nearest && distance < player.size) {
                    console.log(`Player ${player.name} ate food`);
                    this.food.remove(nearest);
                    player.addFood(nearest.bonus);
                    this._sendToRoom('food:ate', {
                        food: nearest,
                        playerId: player.id
                    });
                }
            }
        });

        socket.on('player:move', (content) => {
            const player = this.players.find(p => p.id === content.playerId);
            if (player) {
                player.x = content.x;
                player.y = content.y;
            }
            this._sendToRoom('player:moved', content);
        });
    }

    _start() {
        this._fillWithBots();
        this._sendToRoom('game:start');
    }


    // Stop the Hub and clean up resources
    stop() {
        this.io = null;
        this.players = [];
        this.bots = [];
        this.map = null;
    }
}