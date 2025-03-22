import { Circle, Quadtree, Rectangle } from '@timohausmann/quadtree-ts';
import { Food } from '../client/class/Food.js';

export const FOOD_BATCH = 100;

export class FoodManager {
	_foodTree;
	_maxFoodBonus;
	_maxFood;
	_foodAddCpt = 0;
	_foodRemoveCpt = 0;



	constructor(width, height, maxFoodBonus, maxFood) {
		this._width = width;
		this._height = height;
		this._foodTree = new Quadtree({
			width: width,
			height: height,
		})
		this._maxFoodBonus = maxFoodBonus;
		this._maxFood = maxFood;
		this._initializeFood();
	}

	getAllFood() {
		return this._foodTree.retrieve(new Rectangle({
			x: 0,
			y: 0,
			width: this._width,
			height: this._height
		}));
	}

	_initializeFood() {
		for (let i = 0; i < this._maxFood; i++) {
			const food = this._genRandomFood();
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

	getFoodForRectangle(rectangle) {
		return this._foodTree.retrieve(rectangle);
	}

	getFoodIfCanEat(player, food) {
		if (player) {
			const serverFood = this._foodTree.retrieve(new Circle({
				x: player.x,
				y: player.y,
				r: player.size
			}));
			const nearest = serverFood.find(f => f.x === food.x && f.y === food.y);
			if (!nearest) return;
			const distance = Math.hypot(nearest.x - player.x, nearest.y - player.y);
			if (nearest && distance < player.size) {
				return nearest;
			}
		}
		return null;
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
			}
			onAdd && onAdd(array);
		}
	}

	removeFood(food, onRemove) {
		this._foodRemoveCpt++;
		if (this._foodRemoveCpt >= FOOD_BATCH) {
			this._foodRemoveCpt = 0;
			this._foodTree.remove(food);
		}else {
			this._foodTree.remove(food, true);
		}
		onRemove && onRemove();
	}


}