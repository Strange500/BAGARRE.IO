export const BonusType = {
	EXTRA_LIFE: 'Extra Life',
	DOUBLE_POINTS: 'Double Points',
	SPEED_BOOST: 'Speed Boost',
	SHIELD: 'Shield',
	INVINCIBILITY: 'Invincibility',
	TIME_FREEZE: 'Time Freeze',
};

export class Bonus {
	constructor(text) {
		this.text = text;
	}
}
