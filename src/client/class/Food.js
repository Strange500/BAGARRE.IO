import {Circle} from "@timohausmann/quadtree-ts";
const IMG = [
	"img/bottle.svg",
	"img/gloves.svg",
]
export class Food extends Circle{
	bonus;
	x;
	y;
	img;


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
		this.img = IMG[Math.floor(Math.random() * IMG.length)];
	}
}