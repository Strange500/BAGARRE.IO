import { Player } from '../client/class/Player';

const KILL_EVENT = 'kill';
const EAT_EVENT = 'eat';


export class pHandler {
	player;
	socket;

	constructor(player, socket) {
		this.player = player;
		this.socket = socket;


		this.socket.on('kill', (content) => {
			this.handleKill(content);
		});

		this.socket.on('eat', (content) => {
			this.handleEat(content);
		});
	}




}