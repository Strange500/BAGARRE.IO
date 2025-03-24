import { Circle, Quadtree } from '@timohausmann/quadtree-ts';
import { Food } from '../entities/Food.js';

export const FOOD_BATCH = 100;

export class FoodManager {
	_foodTree;
	_maxFoodBonus;
	_maxFood;
	_foodAddCpt = 0;
	_foodRemoveCpt = 0;
	_foodArray;



	constructor(width, height, maxFoodBonus, maxFood) {
		this._width = width;
		this._height = height;
		this._foodTree = new Quadtree({
			width: width,
			height: height,
		})
		this._foodArray = [];
		this._maxFoodBonus = maxFoodBonus;
		this._maxFood = maxFood;

		this._initializeFood();
	}

	getAllFood() {
		return this._foodArray;
	}

	_initializeFood() {
		for (let i = 0; i < this._maxFood; i++) {
			const food = this._genRandomFood();
			this._foodArray.push(food);
			this._foodTree.insert(food);
		}
	}

	_genRandomFood() {
		return new Food(
			(Math.random() * (this._maxFoodBonus -1)) + 1,
			Math.random() * this._width,
			Math.random() * this._height
		);
	}

	getFoodNearPlayer(player) {
		return this._foodTree.retrieve(new Circle({
			x: player.x,
			y: player.y,
			r: player.size
		}));
	}

	getFoodAtPosition(x, y) {
		const results = this._foodTree.retrieve(new Circle({
			x: x,
			y: y,
			r: 1
		}));
		return results.find(f => f.x === x && f.y === y);
	}


	getFoodForRectangle(rectangle) {
		return this._foodTree.retrieve(rectangle);
	}

	CanEat(player, food) {
		if (player && food) {
			const distance = Math.hypot(food.x - player.x, food.y - player.y);
			if (distance < player.size) {
				return true;
			}
		}
		return null;
	}

	getFoodIfCanEat(player, food) {
			if (this.CanEat(player, food)) {
				return this._foodTree.retrieve(new Circle({
					x: food.x,
					y: food.y,
					r: 1
				})).find(f => f.x === food.x && f.y === food.y && f.bonus === food.bonus);
				}
				return null;
	}

	update(foodArray) {
		this._foodArray = foodArray;
		this._foodTree.clear();
		this._foodArray.forEach(food => {
			const f = new Food(food.bonus, food.x, food.y);
			f.img = food.img;
			this._foodTree.insert(f);
		});
	}



	addFood(onAdd) {
		this._foodAddCpt++;
		if (this._foodAddCpt >= FOOD_BATCH) {
			this._foodAddCpt = 0;
			const array = []
			for (let i = 0; i < FOOD_BATCH; i++) {
				const f = this._genRandomFood();
				array.push(f);
				this._foodTree.insert(f);
				this._foodArray.push(f);
			}
			onAdd && onAdd(array);
		}
	}

	forceAddFood(food) {
		this._foodTree.insert(food);
		this._foodArray.push(food);
	}

	removeFood(food, onRemove) {
		this._foodRemoveCpt++;
		if (this._foodRemoveCpt >= FOOD_BATCH) {
			this._foodRemoveCpt = 0;
			this._foodTree.remove(food);
		}else {
			this._foodTree.remove(food, true);
		}
		this._foodArray = this._foodArray.filter(f => f !== food);
		onRemove && onRemove();
	}

}