import {Quadtree} from "@timohausmann/quadtree-ts";
import {GameMap} from "../client/class/Map.js";
import {Player} from "../client/class/Player.js";
import {Bot} from "../client/class/Bot.js";

const MAX_JOUEURS = 10;

export class Hub {
    foodQuadTree;
    map;
    players;
    bots;
    io;
    constructor({maxSizeX, maxSizeY}, ioServer) {
        this.map = new GameMap(maxSizeX, maxSizeY);
        this.players = [];
        this.bots = [];
        for (let i = 0; i < MAX_JOUEURS; i++) {
            const bot = new Bot(`Bot ${i}`, Math.random() * this.map.width, Math.random() * this.map.height, i);
            this.bots.push(bot);
            this.players.push(bot);
        }
        this.foodQuadTree = new Quadtree({
            width: this.map.width,
            height: this.map.height,
            maxLevels: 4,
        });
        this.io = ioServer;
        this.handleIoConnection(this.io);

        setInterval(() => {
            this.bots.forEach((bot) => {
                bot.nextMove(this.foodQuadTree, this.players);
                this.io.emit('playerMoved', bot);
            });
        }, 1000 / 60);

    }

    handleIoConnection(io) {
        io.on('connection', (socket) => {
            console.log('a user connected');
            socket.on('disconnect', () => {
                console.log('user disconnected');
                this.players = this.players.filter((player) => player.id !== socket.id);
            });

            socket.on('join', (content) => {
                const player = new Player(content.username, this.map.width / 2, this.map.height / 2, socket.id);
                if (this.bots.length > 0) {
                    const b = this.bots.shift();
                    this.players.filter((bot) => bot.id !== b.id);
                }
                this.players.push(player);
                socket.emit('player', player);
                console.log(this.players);
                this.io.emit('players', this.players);
            });

            socket.on('move', (content) => {
                const player = this.players.find((player) => player.id === socket.id);
                if (player) {
                    player.x += player.speed * content.xDirection;
                    player.y += player.speed * content.yDirection;
                    this.io.emit('playerMoved', player);
                }
            });

            socket.on('foodEaten', (p) => {
                const player = this.players.find((player) => player.id === p.id);
                if (player) {
                    player.size = p.size;
                    this.io.emit('playerSizeChanged', player);
                }
            });


        });
    }









}