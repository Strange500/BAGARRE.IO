import {Quadtree} from "@timohausmann/quadtree-ts";
import {GameMap} from "../client/class/Map.js";
import {Player} from "../client/class/Player.js";

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
        this.foodQuadTree = new Quadtree({
            width: this.map.width,
            height: this.map.height,
            maxLevels: 4,
        });
        this.io = ioServer;
        this.handleIoConnection(this.io);
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
                this.players.push(player);
                socket.emit('player', player);
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
        });
    }







}