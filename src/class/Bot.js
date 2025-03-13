import { Score } from "./Score.js";
import {Player} from "./Player";
import {player} from "../Game";
export class Bot extends Player{
    constructor(name, x, y) {
        super(name, x, y);
        this.x =  x;
        this.y = y;
    }

    nextMove(foodBestDensityPosition, foods, players) {
        const latency = Math.random() * 1000 + 200; // Random latency between 200 and 1200 ms
        setTimeout(() => {
            // Calculate distances to the player
            let deltaXNearestPlayer = 0;
            let deltaYNearestPlayer = 0;
            let distanceToNearestPlayer = 1000000000;
            players.forEach(p => {
                const deltaXp = player.x - this.x;
                const deltaYp = player.y - this.y;
                const distanceToPlayer = Math.sqrt(deltaXp * deltaXp + deltaYp * deltaYp);
                if (distanceToPlayer < distanceToNearestPlayer && this.size !== p.size) {
                    deltaXNearestPlayer = deltaXp;
                    deltaYNearestPlayer = deltaYp;
                    distanceToNearestPlayer = distanceToPlayer;
                }
            })

            // Define thresholds
            const distanceThreshold = 300; // Threshold to chase the player

            if (distanceToNearestPlayer <= distanceThreshold) {
                // Normalize direction if within threshold
                const normalizedDistance = Math.sqrt(deltaXNearestPlayer * deltaXNearestPlayer + deltaYNearestPlayer * deltaYNearestPlayer);
                if (normalizedDistance > 0) {
                    if (this.size > player.size) {
                        this.xDirection = (deltaXNearestPlayer / normalizedDistance);
                        this.yDirection = (deltaYNearestPlayer / normalizedDistance);

                    }else if (this.size < player.size) {
                        this.xDirection = -(deltaXNearestPlayer / normalizedDistance);
                        this.yDirection = -(deltaYNearestPlayer / normalizedDistance);

                    }
                } else {
                    this.xDirection = 0;
                    this.yDirection = 0;
                }
            }
            else {
                // If not close to the player, calculate distance to the density point
                const deltaXDensity = foodBestDensityPosition.x - this.x;
                const deltaYDensity = foodBestDensityPosition.y - this.y;
                const distanceToDensity = Math.sqrt(deltaXDensity * deltaXDensity + deltaYDensity * deltaYDensity);

                // If the bot is within range of the density point
                if (distanceToDensity < 500) { // Pursue the nearest food item
                    const nearestFood = foods.sort((a, b) => {
                        const distanceA = Math.sqrt((a.x - this.x) ** 2 + (a.y - this.y) ** 2);
                        const distanceB = Math.sqrt((b.x - this.x) ** 2 + (b.y - this.y) ** 2);
                        return distanceA - distanceB;
                    })[0];

                    const deltaXFood = nearestFood.x - this.x;
                    const deltaYFood = nearestFood.y - this.y;
                    const normalizedDistanceFood = Math.sqrt(deltaXFood * deltaXFood + deltaYFood * deltaYFood);

                    if (normalizedDistanceFood > 0) {
                        this.xDirection = (deltaXFood / normalizedDistanceFood);
                        this.yDirection = (deltaYFood / normalizedDistanceFood);
                    } else {
                        this.xDirection = 0;
                        this.yDirection = 0;
                    }
                } else if (distanceToDensity > 0) {
                    // Move toward the density point if it's outside the distance threshold
                    this.xDirection = (deltaXDensity / distanceToDensity);
                    this.yDirection = (deltaYDensity / distanceToDensity);
                } else {
                    this.xDirection = 0;
                    this.yDirection = 0;
                }
            }
        }, latency);
    }

}
