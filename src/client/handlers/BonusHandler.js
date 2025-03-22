import { BonusType } from '../class/Bonus.js';
import { applyBonusEffect } from '../class/Bonus.js';

const theBonus = [];

export const RandomBonus = () => {
	theBonus.length = 0;
	while (theBonus.length < 3) {
		const randomBonus = BonusType[ Object.keys(BonusType)[Math.floor(Math.random() * Object.keys(BonusType).length)] ];
		console.log('randomBonus', randomBonus);
		if (!theBonus.includes(randomBonus)) {
			theBonus.push(randomBonus);
		}
	}
	return theBonus;
};

export function showBonus(bonusList, player) {
	const container = document.querySelector('.BonusList');

	if (!container) return;
	container.innerHTML = '';
	container.style.display = 'flex';

	bonusList.forEach(bonus => {
		if (!bonus) return;

		const bonusItem = document.createElement('div');
		bonusItem.className = 'bonus-item';

		const img = document.createElement('img');
		img.src = 'CarteBonus.png';

		const text = document.createElement('p');
		text.innerText = bonus;

		bonusItem.appendChild(img);
		bonusItem.appendChild(text);
		container.appendChild(bonusItem);

		bonusItem.addEventListener('click', () => {
			applyBonusEffect(bonus, player);
			container.style.display = 'none';
			container.innerHTML = '';
		});
	});
}
