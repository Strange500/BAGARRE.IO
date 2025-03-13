import { Score } from "./Score.js";
import {Player} from "./Player";
import {player} from "../Game";
export class Bot extends Player{
    constructor(name, x, y) {
        super(name, x, y);
        this.x =  x;
        this.y = y;
    }

    nextMove(foodBestDensitiePosition) {
        const latency = (Math.random() * 1000) + 2000; // Random latency between 0 and 1000 ms
        setTimeout(() => {
            // Calculate distances
            const deltaX = player.x - this.x;
            const deltaY = player.y - this.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Define a distance threshold
            const distanceThreshold = 300; // Example threshold distance

            if (distance <= distanceThreshold) {
                // Normalize direction if within threshold
                const normalizedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (normalizedDistance > 0) {
                    this.xDirection = (deltaX / normalizedDistance) + (Math.random() * 0.2 - 0.1); // Adding a random offset
                    this.yDirection = (deltaY / normalizedDistance) + (Math.random() * 0.2 - 0.1); // Adding a random offset
                } else {
                    this.xDirection = 0;
                    this.yDirection = 0;
                }
            } else {
                // Reset direction if player is too far away
                this.xDirection = 0;
                this.yDirection = 0;
            }
        }, latency);
    }

}
