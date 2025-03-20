import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Player } from './Player.js';
import { Score } from './Score.js';

describe('Player', () => {
	it('should initialize correctly', () => {
		const player = new Player('Alice', 10, 20, 1);
		assert.strictEqual(player.name, 'Alice');
		assert.strictEqual(player.x, 10);
		assert.strictEqual(player.y, 20);
		assert.strictEqual(player.id, 1);
		assert.strictEqual(player.size, 20);
		assert.strictEqual(player.speed, 5);
		assert.strictEqual(player.ready, false);
		assert.ok(player.score instanceof Score);
	});

	it('should increase size', () => {
		const player = new Player('Bob', 0, 0, 2);
		player.increaseSize(5);
		assert.strictEqual(player.size, 25);
	});

	it('should add food and update score and size', () => {
		const player = new Player('Charlie', 0, 0, 3);
		player.addFood(10);
		assert.strictEqual(player.size, 21);
	});

	it('should add bonus score', () => {
		const player = new Player('Dave', 0, 0, 4);
		player.addBonus(50);
		assert.strictEqual(player.score.bonusScore, 50);
	});

	it('should add kill and increase size accordingly', () => {
		const player = new Player('Eve', 0, 0, 5);
		player.addKill(10);
		assert.strictEqual(player.size, 22);
	});

	it('should apply decay to score', () => {
		const player = new Player('Frank', 0, 0, 6);
		player.score.updateCoef(1);
		player.score.addFoodScore(10);
		player.score.addBonusScore(5);
		player.score.addKillScore(2);
		player.applyDecay(1);
		assert.strictEqual(player.score.getTotalScore(), 14);
	});

	it('should reset the player', () => {
		const player = new Player('Grace', 0, 0, 7);
		player.size = 30;
		player.score.addFoodScore(10);
		player.score.addBonusScore(5);
		player.score.addKillScore(2);
		player.score.updateCoef(2);
		const expectedTotalScoreBeforeReset = (10 + 5 + 2) * 2;
		assert.strictEqual(
			player.score.getTotalScore(),
			expectedTotalScoreBeforeReset
		);
		player.reset();
		assert.strictEqual(player.size, 1);
		assert.strictEqual(player.score.getTotalScore(), 0);
	});
});
