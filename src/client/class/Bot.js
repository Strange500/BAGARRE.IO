import {Player} from "./Player.js";
import {Rectangle} from "@timohausmann/quadtree-ts";


const viewLength = 500;
const viewHeight = 500;
export class Bot extends Player{
    constructor(name, x, y, id) {
        super(name, x, y, id);
        this.x =  x;
        this.y = y;
    }

    nextMove(foodQuadTree, players) {
        const latency = Math.random() * 1000 + 200; // Random latency between 200 and 1200 ms
        setTimeout(() => {
            let deltaXNearestPlayer = 0;
            let deltaYNearestPlayer = 0;
            let distanceToNearestPlayer = Infinity;
            let nearestPlayer = null;
            players.forEach(p => {
                if (p === this) return;
                const deltaXp = p.x - this.x;
                const deltaYp = p.y - this.y;
                const distanceToPlayer = Math.sqrt(deltaXp * deltaXp + deltaYp * deltaYp);
                if (distanceToPlayer < distanceToNearestPlayer && this.size !== p.size) {
                    deltaXNearestPlayer = deltaXp;
                    deltaYNearestPlayer = deltaYp;
                    distanceToNearestPlayer = distanceToPlayer;
                    nearestPlayer = p;
                }
            })

            const distanceThreshold = 300; // Threshold to chase the player

            if (distanceToNearestPlayer <= distanceThreshold) {
                const normalizedDistance = Math.sqrt(deltaXNearestPlayer * deltaXNearestPlayer + deltaYNearestPlayer * deltaYNearestPlayer);
                if (normalizedDistance > 0) {
                    if (this.size > nearestPlayer.size) {
                        this.xDirection = (deltaXNearestPlayer / normalizedDistance);
                        this.yDirection = (deltaYNearestPlayer / normalizedDistance);

                    }else if (this.size < nearestPlayer.size) {
                        this.xDirection = -(deltaXNearestPlayer / normalizedDistance);
                        this.yDirection = -(deltaYNearestPlayer / normalizedDistance);

                    }
                } else {
                    this.xDirection = 0;
                    this.yDirection = 0;
                }
            }
            else {
                let nearestFood = null;
                let deltaXFood = 0;
                let deltaYFood = 0;
                let distance = Infinity;
                const nearestFoods = foodQuadTree.retrieve(
                    new Rectangle({
                        x: this.x - viewLength,
                        y: this.y - viewHeight,
                        width: viewLength * 2,
                        height: viewHeight * 2
                    })
                )
                nearestFoods.forEach(food => {
                    const deltaX = food.x - this.x;
                    const deltaY = food.y - this.y;
                    const d = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    if (d < distance) {
                        deltaXFood = deltaX;
                        deltaYFood = deltaY;
                        distance = d;
                        nearestFood = food;
                    }
                })
                if (distance > 0) {
                    this.xDirection = deltaXFood / distance;
                    this.yDirection = deltaYFood / distance;
                }
                else {
                    this.xDirection = 0;
                    this.yDirection = 0;
                }

            }
        }, latency);
    }

    }
