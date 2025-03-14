import {Circle} from "@timohausmann/quadtree-ts";

export class Food extends Circle{
	bonus;
	x;
	y;


	constructor(bonus,  x,  y) {
		super({
			x: x,
			y: y,
			r: bonus*10
		});
		this.bonus = bonus* 10;
		this.size = bonus*10;
		this.x = x;
		this.y = y;
	}
}