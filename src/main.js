import { Player } from "./Player";
import { GameMap } from "./Map";

const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);
canvasResizeObserver.observe(canvas);

function resampleCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

const mapConfig = {
    maxSizeX: 800,
    maxSizeY: 600,
};

const map = new GameMap(mapConfig.maxSizeX, mapConfig.maxSizeY);

const player = new Player('Player 1');
const playerPosition = {
    x: map.width / 2,
    y: map.height / 2,
};


const viewLength = canvas.clientWidth / 10;
const viewHeight = canvas.clientHeight / 10;

let lineWidth = 5;
let speed = 5;
let xDirection = 0;
let yDirection = 0;

function handleKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
        case'z' :
            yDirection = -1;
            break;
        case 'ArrowDown':
        case's':
            yDirection = 1;
            break;
        case 'ArrowLeft':
        case 'q':
            xDirection = -1;
            break;
        case 'ArrowRight': 
        case'd':
            xDirection = 1;
            break;
    }
}

function handleKeyup(event) {
    switch (event.key) {
        case 'ArrowUp':
        case'z' :
        case 'ArrowDown':
        case 's' :
            yDirection = 0;
            break;
        case 'ArrowLeft':
        case 'q' :
        case 'ArrowRight':
        case 'd' :
            xDirection = 0;
            break;
    }
}

function movePlayer() {
    playerPosition.x += speed * xDirection;
    playerPosition.y += speed * yDirection;

    // Boundary checking
    if (playerPosition.x < 0) {
        playerPosition.x = 0;
    } else if (playerPosition.x > canvas.width - player.size) {
        playerPosition.x = canvas.width - player.size;
    }

    if (playerPosition.y < 0) {
        playerPosition.y = 0;
    } else if (playerPosition.y > canvas.height - player.size) {
        playerPosition.y = canvas.height - player.size;
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(10, 10);
    context.translate(-playerPosition.x + viewLength / 2, -playerPosition.y + viewHeight / 2);
    map.drawDecor(context, playerPosition.x - viewLength, playerPosition.y - viewHeight, viewLength * 10, viewHeight * 10);
    map.drawPlayer(context, playerPosition);

    context.translate(playerPosition.x - viewLength / 2, playerPosition.y - viewHeight / 2);

    map.drawCoordinates(context, playerPosition);
    context.resetTransform();

    requestAnimationFrame(render);
}

function handleCanvasMouseDown(event) {
    context.beginPath();
	
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);
canvas.addEventListener('mousedown', handleCanvasMouseDown);
setInterval(movePlayer, 1000 / 60);
requestAnimationFrame(render);