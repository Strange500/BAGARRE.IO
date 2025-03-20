class SoundManager {
	constructor() {
		this.audioElements = {
			kill: document.querySelector('#audioKill'),
			eat: document.querySelector('#audioEat'),
			bonus: document.querySelector('#audioBonus'),
			theme: document.querySelector('#theme'),
			gun: document.querySelector('#gun'),
			lose: document.querySelector('#lose'),
			win: document.querySelector('#win'),
		};

		this.configureTheme();
	}

	configureTheme() {
		const { theme } = this.audioElements;
		theme.loop = true;
		theme.volume = 0.6;
	}

	playSound(soundKey) {
		const sound = this.audioElements[soundKey];
		if (sound) {
			sound.play().catch((error) => {
				console.error(`Error playing sound: ${soundKey}`, error);
			});
		} else {
			console.warn(`Sound not defined: ${soundKey}`);
		}
	}

	playEatSound() {
		this.playSound('eat');
	}

	playKillSound() {
		this.playSound('kill');
	}

	playBonusSound() {
		this.playSound('bonus');
	}

	playTheme() {
		this.playSound('theme');
	}

	stopTheme() {
		const theme = this.audioElements.theme;
		theme.pause();
		theme.currentTime = 0;
	}

	forceThemeStart() {
		if (this.audioElements.theme.paused) {
			this.playSound('theme');
		}
	}

	playVictoryTheme() {
		this.playSound('gun');
		this.playDelayedSound('win', this.audioElements.gun.duration);
	}

	playLoseTheme() {
		this.playSound('gun');
		this.playDelayedSound('lose', this.audioElements.gun.duration);
	}

	playDelayedSound(soundKey, delay) {
		setTimeout(() => {
			this.playSound(soundKey);
		}, delay * 1000);
	}
}

export const soundManager = new SoundManager();