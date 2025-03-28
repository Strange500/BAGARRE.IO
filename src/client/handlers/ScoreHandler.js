export function updateScoreboard(players) {
	const scoreboardBody = document.getElementById('scoreboard-body');
	scoreboardBody.innerHTML = '';

	const sortedPlayers = players
		.sort((a, b) => b.score.getTotalScore() - a.score.getTotalScore())
		.slice(0, 10);

	sortedPlayers.forEach(player => {
		const row = document.createElement('tr');
		row.innerHTML = `<td>${player.name}</td><td>${player.score.getTotalScore().toFixed(2)}</td>`;
		scoreboardBody.appendChild(row);
	});
}

export function simulateScores(players) {
	players.forEach(player => {
		const randomIncrease = Math.floor(1);
		player.score.addFoodScore(randomIncrease);
	});
}
