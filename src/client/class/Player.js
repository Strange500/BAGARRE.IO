import { Score } from './Score.js';
export class Player {
	id;
	name;
	size;
	score;
	x;
	y;
	xDirection;
	yDirection;
	speed;
	ready;

	constructor(name, x, y, id) {
		this.name = name;
		this.size = 20;
		this.score = new Score();
		this.x = x;
		this.y = y;
		this.xDirection = 0;
		this.yDirection = 0;
		this.id = id;
		this.speed = 5;
		this.ready = false;
	}

	increaseSize(amount) {
		this.size += amount;
	}

	addFood(amount) {
		this.score.addFoodScore(amount / 10);
		this.increaseSize(amount / 10);
		this.score.gainExp(amount);

	}

	addBonus(amount) {
		this.score.addBonusScore(amount);
	}

	addKill(amount) {
		this.score.addKillScore(amount);
		this.increaseSize(amount * 0.2);
		this.score.gainExp(amount);

	}

	applyDecay(rate) {
		this.score.applyScoreDecay(rate);
	}

	reset() {
		this.size = 1;
		this.score.reset();
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