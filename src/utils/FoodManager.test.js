import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FOOD_BATCH, FoodManager } from './FoodManager.js';
import { Food } from '../client/class/Food.js';
import { Rectangle } from '@timohausmann/quadtree-ts';



describe('FoodManager', () => {
	const width = 1000;
	const height = 1000;
	const maxFoodBonus = 10;
	const maxFood = 200;

	let foodManager;

	// Before each test, we instantiate a new FoodManager
	const initialize = () => {
		foodManager = new FoodManager(width, height, maxFoodBonus, maxFood);
	};

	it('should initialize with the correct parameters', callback => {
		initialize();
		assert.strictEqual(foodManager._width, width);
		assert.strictEqual(foodManager._height, height);
		assert.strictEqual(foodManager._maxFoodBonus, maxFoodBonus);
		assert.strictEqual(foodManager._maxFood, maxFood);
		assert.strictEqual(foodManager.getAllFood().length, maxFood);
	});

	it('should generate random food with correct bonus', () => {
		initialize();
		const food = foodManager._genRandomFood();
		assert.ok(food instanceof Food);
		assert.ok(food.bonus > 0 && food.bonus <= maxFoodBonus);
		assert.ok(food.x >= 0 && food.x <= width);
		assert.ok(food.y >= 0 && food.y <= height);
	});

	it('should retrieve all food in the area defined by Rectangle', () => {
		initialize();
		const foodItems = foodManager.getAllFood();
		assert.ok(Array.isArray(foodItems));
		assert.strictEqual(foodItems.length, maxFood);

		const retrievedFood = foodManager.getFoodForRectangle(new Rectangle(
			{ x: 0, y: 0, width: width, height: height }
		));
		assert.deepStrictEqual(retrievedFood.length, foodItems.length);
	});

	it('should validate if a player can eat food', () => {
		initialize();
		const player = { x: 500, y: 500, size: 50 };
		const foodItems = foodManager.getFoodNearPlayer(player);

		if (foodItems.length > 0) {
			const foodToEat = foodItems[0];
			const canEat = Math.hypot(foodToEat.x - player.x, foodToEat.y - player.y) < player.size;
			const canEatFood = foodManager.getFoodIfCanEat(player, foodToEat);
			assert.deepStrictEqual(canEatFood, canEat ? foodToEat : null);
		} else {
			assert.strictEqual(foodManager.getFoodIfCanEat(player, new Food(1, 500, 500)), null);
		}
	});

	it('should add food in batches', () => {
		initialize();
		let addedFood = [];
		foodManager.addFood((newFoodItems) => {
			addedFood = newFoodItems;
		});

		assert.strictEqual(addedFood.length, 0); // not added because not enough food need to be added
		assert.strictEqual(foodManager.getAllFood().length, maxFood );

		initialize();
		for (let i = 0; i < FOOD_BATCH; i++) {
			foodManager.addFood(() => {});
		}
		assert.strictEqual(foodManager.getAllFood().length, maxFood + FOOD_BATCH); // reached max food so added

	});

	it('should call the callback with the added food', () => {
		initialize();
		let addedFood = false;
		for (let i = 0; i < maxFood; i++) {
			foodManager.addFood(() => {
				addedFood = true;
				console.log('Added food');
			});
		}
		assert.strictEqual(addedFood, true);
	});

	it('should force add food' , ()=> {
		initialize();
		foodManager.forceAddFood(new Food(1, 500, 500));
		const foodItems = foodManager.getAllFood();
		assert.strictEqual(foodItems.length, maxFood + 1);
	});

});