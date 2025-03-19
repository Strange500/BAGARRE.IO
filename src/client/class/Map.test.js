import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GameMap } from './Map.js';
import { Rectangle } from '@timohausmann/quadtree-ts';

class FakeMap {
    constructor() {
        this.actions = [];
    }

    moveTo(x, y) {
        this.actions.push(`moveTo(${x}, ${y})`);
    }

    beginPath() {
        this.actions.push('beginPath()');
    }

    arc(x, y, radius, startAngle, endAngle) {
        this.actions.push(`arc(${x}, ${y}, ${radius}, ${startAngle}, ${endAngle})`);
    }

    fillText(text, x, y) {
        this.actions.push(`fillText(${text}, ${x}, ${y})`);
    }

    fill() {
        this.actions.push('fill()');
    }

    stroke() {
        this.actions.push('stroke()');
    }

    strokeStyle = '';
    fillStyle = '';
    font = '';
}

describe('GameMap', () => {
    it('should initialize correctly', () => {
        const gameMap = new GameMap(500, 500);
        assert.strictEqual(gameMap.width, 500);
        assert.strictEqual(gameMap.height, 500);
    });

    it('should draw player name correctly', () => {
        const gameMap = new GameMap(500, 500);
        const context = new FakeMap();
        const player = { name: 'Alice', x: 100, y: 150 };
        gameMap.drawName(context, player);
        assert.ok(context.actions.includes("fillText(Alice \nx: 100\ny: 150, 100, 150)"));
    });

    it('should correctly determine player visibility', () => {
        const gameMap = new GameMap(500, 500);
        const context = new FakeMap();
        const mainPlayer = { x: 250, y: 250 };
        const visiblePlayer = { x: 260, y: 260, size: 10 };
        const invisiblePlayer = { x: 600, y: 600, size: 10 };
        
        assert.strictEqual(gameMap.drawPlayer(context, visiblePlayer, mainPlayer, 100, 100), true);
        assert.strictEqual(gameMap.drawPlayer(context, invisiblePlayer, mainPlayer, 100, 100), false);
    });
});