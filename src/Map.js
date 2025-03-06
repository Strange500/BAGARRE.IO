

export class GameMap {
    width;
    height;

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    drawCoordinates(context, playerPosition) {
        context.moveTo(0, 0);
        context.font = '20px Arial';
        context.fillStyle = 'black';
        context.fillText(`x: ${playerPosition.x}, y: ${playerPosition.y}`, 10, 20);

    }

    drawDecor(context, fromX, fromY, width, height) {
        context.moveTo(0, 0);
        for (let i = 0; i < this.width; i += 100) {
            if (i < fromX) continue;
            context.beginPath();
            context.moveTo(i, fromY);
            context.lineTo(i, fromY + height);
            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.stroke();
        }

        for (let i = 0; i < this.height; i += 100) {
            if (i < fromY) continue
            context.beginPath();
            context.moveTo(fromX, i);
            context.lineTo(fromX + width, i);
            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.stroke();
        }

    }


    drawPlayer(context, playerPosition) {
        context.beginPath();
        context.arc(playerPosition.x, playerPosition.y, 10, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
        context.strokeStyle = 'green';
        context.stroke();
    }
}