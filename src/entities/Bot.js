import {Player} from "./Player.js";
import {Rectangle} from "@timohausmann/quadtree-ts";
import { MAX_SPEED, SPEED_LEVEL } from '../utils/movement.js';


const viewLength = 500;
const viewHeight = 500;
export class Bot extends Player{
    constructor(name, x, y, id) {
        super(name, x, y, id);
        this.x =  x;
        this.y = y;
    }

    nextMove(foodManager, players) {
            let deltaXNearestPlayer = 0;
            let deltaYNearestPlayer = 0;
            let distanceToNearestPlayer = Infinity;
            let nearestPlayer = null;
            players.forEach(p => {
                if (p === this) return;
                const deltaXp = p.x - this.x;
                const deltaYp = p.y - this.y;
                const distanceToPlayer = Math.sqrt(deltaXp * deltaXp + deltaYp * deltaYp);
                if (distanceToPlayer < distanceToNearestPlayer) {
                    deltaXNearestPlayer = deltaXp;
                    deltaYNearestPlayer = deltaYp;
                    distanceToNearestPlayer = distanceToPlayer;
                    nearestPlayer = p;
                }
            })


            const distanceThreshold = 300; // Threshold to chase the player
            if (distanceToNearestPlayer <= distanceThreshold) {
                this.speed = Math.min(MAX_SPEED, this.speed + SPEED_LEVEL);
                if (distanceToNearestPlayer > 0) {
                    if (this.size > nearestPlayer.size) {
                        this.targetDeg = Math.atan2(deltaYNearestPlayer, deltaXNearestPlayer);
                    }else if (this.size < nearestPlayer.size) {
                        this.targetDeg = Math.atan2(-deltaYNearestPlayer, -deltaXNearestPlayer);
                    }
                } else {
                    this.targetDeg = Math.random() * 2 * Math.PI;
                }
            }
            else {
                let nearestFood = null;
                let deltaXFood = 0;
                let deltaYFood = 0;
                let distance = Infinity;
                const nearestFoods = foodManager.getFoodForRectangle(
                    new Rectangle({
                        x: this.x - viewLength,
                        y: this.y - viewHeight,
                        width: viewLength * 2,
                        height: viewHeight * 2
                    })
                );
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
                   // slow down to reduce inertia if food is near
                    if (distance < 100) {
                        this.speed = Math.max(3, this.speed - SPEED_LEVEL);
                    } else {
                      this.speed = Math.min(MAX_SPEED, this.speed + SPEED_LEVEL);
                    }
                   this.targetDeg = Math.atan2(deltaYFood, deltaXFood);
                }
                else {
                    this.targetDeg = Math.random() * 2 * Math.PI;
                }

            }
    }

    }
