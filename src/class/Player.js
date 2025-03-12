import { Score } from "./Score.js";
export class Player {
	name;
	size;
	score;

	constructor(name) {
		this.name = name;
		this.size = 1;
		this.score = new Score();
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
