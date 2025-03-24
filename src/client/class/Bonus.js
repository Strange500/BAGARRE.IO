import { updatePlayerSheet } from './Player.js';

export const BonusType = {
	DOUBLE_POINTS: 'Double Points',
	SPEED_BOOST: 'Speed Boost',
	INVINCIBILITY: 'Invincibility',
};

export function applyBonusEffect(bonusType, player, socket) {
	console.log('Applying bonus:', bonusType, 'to player:', player);
	if (!player) return;

	player.activeBonuses.push({ type: bonusType });
	updatePlayerSheet(player);

	switch (bonusType) {
		case BonusType.DOUBLE_POINTS:
			socket.emit('Double_point:start', player.id);
			player.score.updateCoef(2);
			setTimeout(() => {
				console.log('Suppression du bonus:', bonusType);
				socket.emit('Double_point:end', player.id);
				player.score.updateCoef(1);
				const index = player.activeBonuses.findIndex(b => b.type === bonusType);
				if (index !== -1) {
					player.activeBonuses.splice(index, 1);
				}
				updatePlayerSheet(player);
			}, 10000);
			break;
		case BonusType.SPEED_BOOST:
			player.speedMultiplier = 3;

			setTimeout(() => {
				console.log('Suppression du bonus:', bonusType);
				player.speedMultiplier = 3;

				const index = player.activeBonuses.findIndex(b => b.type === bonusType);
				if (index !== -1) {
					player.activeBonuses.splice(index, 1);
				}
				updatePlayerSheet(player);
			}, 20000);
			break;
		case BonusType.INVINCIBILITY:
			socket.emit('invincibility:start', player.id);
			setTimeout(() => {
				console.log('Suppression du bonus:', bonusType);
				socket.emit('invincibility:end', player.id);
				const index = player.activeBonuses.findIndex(b => b.type === bonusType);
				if (index !== -1) {
					player.activeBonuses.splice(index, 1);
				}
				updatePlayerSheet(player);
			}, 10000);
			break;
	}

	updatePlayerSheet(player);
}
