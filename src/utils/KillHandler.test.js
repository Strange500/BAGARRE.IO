import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Player } from '../client/class/Player.js';
import { KillHandler } from './KillHandler.js';



describe('KillHandler', () => {
	let alice = new Player('Alice', 10, 20, 1);
	let bob = new Player('Bob', 0, 0, 2);
	let charlie = new Player('Charlie', 0, 0, 3);
	let dave = new Player('Dave', 0, 0, 4);
	let eve = new Player('Eve', 0, 0, 5);

	const players = [];

	let killHandler;

	// Before each test, we instantiate a new FoodManager
	const initialize = () => {
		alice = new Player('Alice', 10, 20, 1);
		bob = new Player('Bob', 0, 0, 2);
		charlie = new Player('Charlie', 0, 0, 3);
		dave = new Player('Dave', 0, 0, 4);
		eve = new Player('Eve', 0, 0, 5);
		players.filter(player => player.size = -1);
		players.push(alice, bob, charlie, dave, eve);
		killHandler = new KillHandler();
	};

	it('should initialize with the correct parameters', callback => {
		initialize();
	});

	it('should tell if I can kill a player if I am bigger', () => {
		initialize();

		// make sure alice is bigger than bob
		alice.size = 50;
		bob.size = 40;

		// make sure alice is close enough to bob
		alice.x = 0;
		alice.y = 0;
		alice.invincibility = false;
		bob.x = 0;
		bob.y = 0;
		bob.invincibility = false;

		// assert alice can kill bob
		const canKill = killHandler.canKillPlayer(bob, alice);
		assert.strictEqual(canKill, true);

		// assert bob can't kill alice
		const canKill2 = killHandler.canKillPlayer(alice, bob);
		assert.strictEqual(canKill2, false);
	});

	it("should tell me who killed who", () => {
		initialize();
		alice.size = 50;
		bob.size = 40;
		alice.x = 0;
		alice.y = 0;
		alice.invincibility = false;
		bob.x = 0;
		bob.y = 0;
		bob.invincibility = false;
		killHandler.killPlayer(bob, alice);
		assert.deepStrictEqual(killHandler.getKills(alice), [bob]);
		assert.deepStrictEqual(killHandler.getKills(bob), []);
	})

	it("should tell me if a player is alive", () => {
		initialize();
		alice.size = 50;
		bob.size = 40;
		alice.x = 0;
		alice.y = 0;
		alice.invincibility = false;
		bob.x = 0;
		bob.y = 0;
		bob.invincibility = false;
		assert.strictEqual(killHandler.isPlayerAlive(bob), true);
		killHandler.killPlayer(bob, alice);
		assert.strictEqual(killHandler.isPlayerAlive(bob), false);
		assert.strictEqual(killHandler.isPlayerAlive(alice), true);
	})


});