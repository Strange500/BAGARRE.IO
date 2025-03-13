export class Food {
	bonus;
	x;
	y;


	constructor(bonus,  x,  y) {
		this.bonus = bonus* 10;
		this.size = bonus*10;
		this.x = x;
		this.y = y;
	}
}