import {Circle} from "@timohausmann/quadtree-ts";

export class Food extends Circle{
	bonus;
	x;
	y;


	constructor(bonus,  x,  y) {
		super({
			x: x,
			y: y,
			r: bonus
		});
		this.bonus = bonus;
		this.size = bonus;
		this.x = x;
		this.y = y;
	}
}