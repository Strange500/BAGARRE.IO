import { START_SIZE } from '../client/class/Player.js';


export class KillHandler{
	_mapKill;

	constructor() {
		this._mapKill = new Map();
	}

	canKillPlayer(target, killer){
		if (!target || !killer) {
			return false;
		}
		if (killer.id === target.id) {
			return false;
		}
		if (target.invincibility || target.size > killer.size || target.size === START_SIZE) {
			return false;
		}
		if (!this.isPlayerAlive(target)) {
			return false;
		}
		const distance = Math.hypot(target.x - killer.x, target.y - killer.y);
		return distance < killer.size;
	}
	
	killPlayer(target, killer, onKill){
		if (this.canKillPlayer(target, killer)) {
			this._mapKill.set(killer, [...(this._mapKill.get(killer) || []), target]);
			onKill && onKill(target, killer);
			return true;
		}
		return false;
	}

	forceKillPlayer(target, killer){
		this._mapKill.set(killer, [...(this._mapKill.get(killer) || []), target]);
	}
	
	isPlayerAlive(player){
		return !this._mapKill.values().some(killedPlayers => killedPlayers.includes(player));
	}

	getKills(player){
		return this._mapKill.get(player) || [];
	}
	
	


}