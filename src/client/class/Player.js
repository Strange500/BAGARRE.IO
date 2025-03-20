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
	deg;
	keyPressed;

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
		this.deg = 0;
		this.keyPressed = [];
	}

	increaseSize(amount) {
		this.size += amount;
	}

	addFood(amount) {
		this.score.addFoodScore(amount / 10);
		this.increaseSize(amount / 10);
		return this.score.gainExp(amount);

	}

	addBonus(amount) {
		this.score.addBonusScore(amount);
	}

	addKill(amount) {
		this.score.addKillScore(amount);
		this.increaseSize(amount * 0.2);
		return this.score.gainExp(amount);
	}

	applyDecay(rate) {
		this.score.applyScoreDecay(rate);
	}

	reset() {
		this.size = 1;
		this.score.reset();
	}
}