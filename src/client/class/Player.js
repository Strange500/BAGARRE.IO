import { Score } from './Score.js';


export const START_SIZE = 20;
export const COLORS = ["red", "black", "white", "green", "yellow", "pink"]
const ImageMap = {
	'doge': "img/doge.webp",
	'trump': "img/trump.webp",
	'biden': "img/biden.webp",
	'putin': "img/putin.webp",
	'kim': "img/kim.webp",
	'elon': "img/elon.webp",
	"pepe": "img/pepe.webp",
	"melenchon": "img/melenchon.png",
	//"zemmour": "img/zemmour.webp",
	//"castex": "img/castex.webp",
	//"hollande": "img/hollande.webp",
	//"sarkozy": "img/sarkozy.webp",
	//"fillon": "img/fillon.webp",
	//"valls": "img/valls.webp",
	//"hidalgo": "img/hidalgo.webp",
}


export class Player {
	id;
	name;
	size;
	score;
	x;
	y;
	xDirection;
	yDirection;
	speed;
	ready;
	deg;
	keyPressed;
	color;

	constructor(name, x, y, id) {
		this.name = name;
		this.size = START_SIZE;
		this.score = new Score();
		this.x = x;
		this.y = y;
		this.xDirection = 0;
		this.yDirection = 0;
		this.id = id;
		this.speed = 0;
		this.ready = false;
		this.keyPressed = [];
		this.deg = Math.random() * 2 * Math.PI;
		this.targetDeg = this.deg;
		this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
		this.image = null;
		if (ImageMap.hasOwnProperty(name)) {
			this.image = ImageMap[name];
		}
	}

	increaseSize(amount) {
		this.size += amount;
	}

	addFood(amount) {
		this.score.addFoodScore(amount / 10);
		this.increaseSize(amount / 10);
		return this.score.gainExp(amount);

	}

	addBonus(amount) {
		this.score.addBonusScore(amount);
	}

	addKill(amount) {
		this.score.addKillScore(amount);
		this.increaseSize(amount * 0.2);
		return this.score.gainExp(amount);
	}

	applyDecay(rate) {
		this.score.applyScoreDecay(rate);
	}

	reset() {
		this.size = 1;
		this.score.reset();
	}
}