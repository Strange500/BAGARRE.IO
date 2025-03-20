import { Bonus, BonusType } from '../class/Bonus.js';

const theBonus = [];

export const RandomBonus = () => {
	const bonusKeys = Object.keys(BonusType);
	theBonus.length = 0;
	while (theBonus.length < 3) {
		const randomBonus =
			BonusType[bonusKeys[Math.floor(Math.random() * bonusKeys.length)]];
		theBonus.push(new Bonus(randomBonus));
	}
	return theBonus;
};

export function showBonus(bonusList) {
	const container = document.querySelector('.BonusList');

	if (container.querySelectorAll('div').length >= 3) {
		return;
	}

	console.log('MERDE');

	container.style.display = 'flex';
	bonusList.forEach(bonus => {
		const bonusItem = document.createElement('div');
		bonusItem.className = 'bonus-item';

		const img = document.createElement('img');
		img.src = 'CarteBonus.png';

		const text = document.createElement('p');
		text.innerText = bonus.text;

		bonusItem.appendChild(img);
		bonusItem.appendChild(text);
		container.appendChild(bonusItem);
	});
}
