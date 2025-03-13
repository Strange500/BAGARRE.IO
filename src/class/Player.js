import { Score } from "./Score.js";
export class Player {
	name;
	size;
	score;
	x;
	y;

	constructor(name, x, y) {
		this.name = name;
		this.size = 20;
		this.score = new Score();
		this.x =  x;
		this.y = y;
	}

	increaseSize(amount) {
		this.size += amount;
		this.score.gainExp(amount);
	}

	addFood(amount) {
		this.score.addFoodScore(amount);
		this.increaseSize(amount * 0.1);
	}

	addBonus(amount) {
		this.score.addBonusScore(amount);
	}

	addKill(amount) {
		this.score.addKillScore(amount);
		this.increaseSize(amount * 0.2);
	}

	applyDecay(rate) {
		this.score.applyScoreDecay(rate);
	}

	reset() {
		this.size = 1;
		this.score.reset();
	}
}
