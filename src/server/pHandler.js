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

export function updatePlayerSheet(player) {
    const playerSheetBody = document.getElementById("playersheet-body");
    if (!playerSheetBody) return;

    playerSheetBody.innerHTML = "";


    const nameRow = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = `Name: ${player.name}`;
    nameCell.colSpan = 2;
    nameRow.appendChild(nameCell);

		const levelRow = document.createElement("tr");
		const levelCell = document.createElement("td");
		levelRow.textContent = `Level: ${player.score.level}`;
		levelCell.colSpan = 2;
		levelRow.appendChild(nameCell);

    const sizeRow = document.createElement("tr");
    const sizeCell = document.createElement("td");
    sizeCell.textContent = `Size: ${player.size.toFixed(2)}`;
    sizeCell.colSpan = 2;
    sizeRow.appendChild(sizeCell);

    const scoreRow = document.createElement("tr");
    const scoreCell = document.createElement("td");
		scoreCell.textContent = `Score: ${player.score.getTotalScore().toFixed(2)}`;
    scoreCell.colSpan = 2;
    scoreRow.appendChild(scoreCell);

    playerSheetBody.appendChild(nameRow);
		playerSheetBody.appendChild(levelRow)
    playerSheetBody.appendChild(sizeRow);
    playerSheetBody.appendChild(scoreRow);
}