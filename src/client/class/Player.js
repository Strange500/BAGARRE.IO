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
