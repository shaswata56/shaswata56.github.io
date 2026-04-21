// public/js/enemy.js
import { Vector2 } from './vector.js';

export class Enemy {
    constructor(type, path, wave, state = null) {
        this.type = type;
        this.path = path;
        this.pathIndex = 0;
        this.alive = true;
        this.distanceTraveled = 0;

        if (state) {
            // Restore from saved state
            this.position = new Vector2(state.position.x, state.position.y);
            this.health = state.health;
            this.maxHealth = state.maxHealth;
            this.speed = state.speed;
            this.reward = state.reward;
            this.damage = state.damage;
            this.color = state.color;
            this.size = state.size;
            this.alive = state.alive;
            this.distanceTraveled = state.distanceTraveled;
            this.pathIndex = state.pathIndex;
        } else {
            // Fresh spawn with wave scaling
            const baseStats = ENEMY_TYPES[type];
            const scaling = 1 + (wave - 1) * 0.1; // 10% stronger per wave

            this.maxHealth = Math.floor(baseStats.health * scaling);
            this.health = this.maxHealth;
            this.speed = baseStats.speed;
            this.reward = baseStats.reward;
            this.damage = baseStats.damage;
            this.color = baseStats.color;
            this.size = baseStats.size;
            this.position = new Vector2(path[0].x, path[0].y);
        }
    }

    update(deltaTime) {
        if (!this.alive || this.pathIndex >= this.path.length - 1) return;

        const target = this.path[this.pathIndex + 1];
        const direction = new Vector2(target.x - this.position.x, target.y - this.position.y);
        const distance = Math.hypot(direction.x, direction.y);

        if (distance < 2) {
            this.pathIndex++;
            if (this.pathIndex >= this.path.length - 1) {
                this.reachedEnd();
                return;
            }
        } else {
            const moveDistance = this.speed * deltaTime;
            const normalizedDir = direction.normalize();
            this.position = this.position.add(normalizedDir.multiply(moveDistance));
            this.distanceTraveled += moveDistance;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
            return true; // Enemy died
        }
        return false;
    }

    reachedEnd() {
        this.alive = false;
        // This will be handled by the game class
    }

    draw(ctx) {
        if (!this.alive) return;

        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar
        const barWidth = 30;
        const barHeight = 4;
        const barY = this.position.y - this.size - 10;
        const barX = this.position.x - barWidth / 2;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#48bb78' : healthPercent > 0.25 ? '#f6ad55' : '#f56565';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}

// Enemy type definitions
export const ENEMY_TYPES = {
    goblin: { health: 50, speed: 60, reward: 10, damage: 1, color: '#68d391', size: 8 },
    orc: { health: 150, speed: 40, reward: 25, damage: 2, color: '#f6ad55', size: 12 },
    ogre: { health: 500, speed: 25, reward: 50, damage: 5, color: '#fc8181', size: 16 },
    demon: { health: 1000, speed: 35, reward: 100, damage: 10, color: '#b794f4', size: 14 }
};