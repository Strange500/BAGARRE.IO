export class Score {
	foodScore;
	bonusScore;
	coefScore;
	killScore;
	exp;
	level;

	constructor() {
		this.foodScore = 0;
		this.bonusScore = 0;
		this.coefScore = 1;
		this.killScore = 0;
		this.exp = 0;
		this.level = 1;
	}

	addFoodScore(amount) {
		this.foodScore += amount * this.coefScore;
	}

	addBonusScore(amount) {
		this.bonusScore += amount * this.coefScore;
	}

	addKillScore(amount) {
		this.killScore += amount * this.coefScore;
	}

	updateCoef(coef) {
		this.coefScore = coef;
	}

	applyScoreDecay(rate) {
		this.foodScore = Math.max(0, this.foodScore - rate);
		this.bonusScore = Math.max(0, this.bonusScore - rate);
		this.killScore = Math.max(0, this.killScore - rate);
	}

	gainExp(amount) {
		this.exp += amount;
		if (this.exp >= this.level * 50) {
			this.exp = 0;
			this.level++;
			return true;
		}
		return false;
	}

	getTotalScore() {
		return this.foodScore + this.bonusScore + this.killScore;
	}

	reset() {
		this.foodScore = 0;
		this.bonusScore = 0;
		this.killScore = 0;
		this.exp = 0;
		this.level = 1;
		this.coefScore = 1;
	}
}
