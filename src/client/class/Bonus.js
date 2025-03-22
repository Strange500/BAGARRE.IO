import { updatePlayerSheet } from './Player.js';

export const BonusType = {
	DOUBLE_POINTS: 'Double Points',
	SPEED_BOOST: 'Speed Boost',
	INVINCIBILITY: 'Invincibility',
};

export function applyBonusEffect(bonusType, player) {
	console.log('Applying bonus:', bonusType, 'to player:', player);
	if (!player) return;

	player.activeBonuses.push({ type: bonusType });
	updatePlayerSheet(player);

	switch (bonusType) {
		case BonusType.DOUBLE_POINTS:
			player.score.updateCoef(2);
			setTimeout(() => {
				console.log('Suppression du bonus:', bonusType);
				player.score.updateCoef(1);
				player.activeBonuses = player.activeBonuses.filter(
					b => b.type !== bonusType
				);
				updatePlayerSheet(player);
			}, 10000);
			break;
		case BonusType.SPEED_BOOST:
			player.speedMultiplier = 3;
			setTimeout(() => {
				console.log('Suppression du bonus:', bonusType);
				player.speedMultiplier = 1;
				player.activeBonuses = player.activeBonuses.filter(
					b => b.type !== bonusType
				);
				updatePlayerSheet(player);
			}, 20000);
			break;
		case BonusType.INVINCIBILITY:
			player.invincible = true;
			setTimeout(() => {
				console.log('Suppression du bonus:', bonusType);
				player.invincible = false;
				player.activeBonuses = player.activeBonuses.filter(
					b => b.type !== bonusType
				);
				updatePlayerSheet(player);
			}, 5000);
			break;
	}

	updatePlayerSheet(player);
}
