import { Circle, Quadtree, Rectangle } from '@timohausmann/quadtree-ts';
import { GameMap } from '../client/class/Map.js';
import { Player } from '../client/class/Player.js';
import { Bot } from '../client/class/Bot.js';
import { Food } from '../client/class/Food.js';

const MAX_PLAYERS = 10;
const MAX_FOOD = 1000;
const MAX_FOOD_BONUS = 0.1;

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
        } else {
            socket.emit('room:full');
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
                        if (allReady) {
                            this._sendToRoom('game:start');
                        }
                    });
                });
            });
        });
    }

    // Stop the Hub and clean up resources
    stop() {
        this.io = null;
        this.players = [];
        this.bots = [];
        this.map = null;
    }
}