import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Score } from './Score.js';

describe('Score', () => {
	it('should initialize correctly', () => {
		const score = new Score();
		assert.strictEqual(score.foodScore, 0);
		assert.strictEqual(score.bonusScore, 0);
		assert.strictEqual(score.killScore, 0);
		assert.strictEqual(score.exp, 0);
		assert.strictEqual(score.level, 1);
		assert.strictEqual(score.coefScore, 1);
	});

	it('should add food score', () => {
		const score = new Score();
		score.addFoodScore(10);
		assert.strictEqual(score.foodScore, 10);
	});

	it('should add bonus score', () => {
		const score = new Score();
		score.addBonusScore(5);
		assert.strictEqual(score.bonusScore, 5);
	});

	it('should add kill score', () => {
		const score = new Score();
		score.addKillScore(3);
		assert.strictEqual(score.killScore, 3);
	});

	it('should update coefficient score', () => {
		const score = new Score();
		score.updateCoef(2);
		assert.strictEqual(score.coefScore, 2);
	});

	it('should apply score decay', () => {
		const score = new Score();
		score.addFoodScore(10);
		score.addBonusScore(5);
		score.applyScoreDecay(3);
		assert.strictEqual(score.foodScore, 7);
		assert.strictEqual(score.bonusScore, 2);
	});

	it('should level up when gaining enough experience', () => {
		const score = new Score();
		score.gainExp(10);
		assert.strictEqual(score.level, 2);
		assert.strictEqual(score.exp, 0);
	});

	it('should calculate total score correctly', () => {
		const score = new Score();
		score.addFoodScore(10);
		score.addBonusScore(5);
		score.addKillScore(2);
		score.updateCoef(2);
		assert.strictEqual(score.getTotalScore(), 34);
	});

	it('should reset the score', () => {
		const score = new Score();
		score.addFoodScore(10);
		score.addBonusScore(5);
		score.addKillScore(2);
		score.updateCoef(2);
		const expectedTotalScoreBeforeReset = (10 + 5 + 2) * 2;
		assert.strictEqual(score.getTotalScore(), expectedTotalScoreBeforeReset);
		score.reset();
		assert.strictEqual(score.getTotalScore(), 0);
	});
});
