import { Player } from "./Player";
import { GameMap } from "./Map";
import { Food } from './Food';

const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');
const canvasResizeObserver = new ResizeObserver(resampleCanvas);
canvasResizeObserver.observe(canvas);

function resampleCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}


const viewLength = canvas.clientWidth;
const viewHeight = canvas.clientHeight;

const mapConfig = {
    maxSizeX: 5000,
    maxSizeY: 5000,
};

const map = new GameMap(mapConfig.maxSizeX, mapConfig.maxSizeY);

const player = new Player('Player 1',map.width / 2, map.height / 2);

const foods = [
]


function genRandomFood() {
  const x = Math.floor(Math.random() * map.width);
  const y = Math.floor(Math.random() * map.height);
  return new Food(0.5, x, y);
}

for (let i = 0; i < 1000; i++) {
  foods.push(genRandomFood());
}


let lineWidth = 5;
let speed = 10;
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

function updateGame() {
    movePlayer();
    handleBonus(player, foods);
}

function movePlayer() {
    player.x += speed * xDirection;
    player.y += speed * yDirection;

    if (player.x < 0) {
        player.x = 0;
    } else if (player.x > map.width - player.size) {
        player.x = map.width - player.size;
    }

    if (player.y < 0) {
        player.y = 0;
    } else if (player.y > map.height - player.size) {
        player.y = map.height - player.size;
    }
}

function render() {
    context.clearRect(0, 0, map.width, map.height);

    const offsetX = -player.x + viewLength / 2;
    const offsetY = -player.y + viewHeight / 2;
    context.translate(offsetX, offsetY);

    map.drawDecor(context, player, viewLength, viewHeight);

    map.drawFood(context, foods, player, viewLength, viewHeight);

    map.drawPlayer(context, player, player.size);
    map.drawCoordinates(context, player);
    context.resetTransform();
    requestAnimationFrame(render);
}

function handleCanvasMouseDown(event) {
    context.beginPath();
}

function handleBonus() {
    foods.forEach((food, index) => {
        if (Math.abs(player.x - food.x) < player.size && Math.abs(player.y - food.y) < player.size) {
            player.size += food.bonus;
            foods.splice(index, 1);
        }
    }
    )
}



document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);
canvas.addEventListener('mousedown', handleCanvasMouseDown);
setInterval(updateGame, 1000 / 60);
requestAnimationFrame(render);