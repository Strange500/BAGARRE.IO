import { START_SIZE } from '../client/class/Player.js';


export class KillHandler{


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
		const distance = Math.hypot(target.x - killer.x, target.y - killer.y);
		return distance < killer.size;
	}


}