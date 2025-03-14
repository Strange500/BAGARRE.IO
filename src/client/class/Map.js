import {Rectangle} from "@timohausmann/quadtree-ts";

export class GameMap {
    width;
    height;

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    drawName(context, player) {
        context.moveTo(player.x, player.y);
        context.font = '20px Arial';
        context.fillStyle = 'black';
        context.fillText(`${player.name} \nx: ${player.x}\ny: ${player.y}`, player.x, player.y);
    }

    drawDecor(context, playerPosition, width, height) {
        const { x, y} = playerPosition;
        const yLimit = Math.min(y + height, this.height);
        const xLimit = Math.min(x + width, this.width);
        const xStart = Math.max(x - width, 0);
        const yStart = Math.max(y - height, 0);
        for (let i = 0; i < yLimit; i+=100) {
            if (i < y - height) continue;
            context.beginPath();
            context.moveTo(xStart, i);
            context.lineTo(xLimit, i);
            context.stroke();
        }
        for (let i = 0; i <xLimit; i+=100) {
            if (i < x - width) continue;
            context.beginPath();
            context.moveTo(i, yStart);
            context.lineTo(i, yLimit);
            context.stroke();
        }
    }

    drawFood(context, foodQuadTree, player, viewLength, viewHeight) {
        const foods = foodQuadTree.retrieve(new Rectangle({
            x: player.x - viewLength,
            y: player.y - viewHeight,
            width: viewLength * 2,
            height: viewHeight * 2
        }));
        foods.forEach(food => {
                context.beginPath();
                context.arc(food.x, food.y, food.size, 0, 2 * Math.PI);
                context.fillStyle = 'blue';
                context.fill();
                context.strokeStyle = 'black';
                context.stroke();
        });
    }

    drawPlayer(context, player, mainPlayer, viewLength, viewHeight) {
        const minX = mainPlayer.x - viewLength;
        const maxX = mainPlayer.x + viewLength;
        const minY = mainPlayer.y - viewHeight;
        const maxY = mainPlayer.y + viewHeight;

        // Check if the player is visible based on their position and size
        const playerIsXVisible = (player.x - player.size < maxX) && (player.x + player.size > minX);
        const playerIsYVisible = (player.y - player.size < maxY) && (player.y + player.size > minY);

        if (playerIsXVisible && playerIsYVisible) {
            context.beginPath();
            context.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
            context.fillStyle = 'red';
            context.fill();
            context.strokeStyle = 'green';
            context.stroke();
            return true;
        }
        return false;
    }
}