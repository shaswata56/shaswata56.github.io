// public/js/tower.js
import { Vector2 } from './vector.js';

export class Tower {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.level = 1;
        this.lastShot = 0;
        this.target = null;
        this.size = 20;

        // Base stats
        this.baseDamage = type.damage;
        this.baseRange = type.range;
        this.baseFireRate = type.fireRate;
        this.color = type.color;

        // Current stats (will be updated by level)
        this.updateStats();
        this.upgradeCost = Math.floor(type.cost * 0.6);
    }

    updateStats() {
        const multiplier = 1 + (this.level - 1) * 0.25; // 25% increase per level
        this.damage = Math.floor(this.baseDamage * multiplier);
        this.range = this.baseRange;
        this.fireRate = this.baseFireRate;
    }

    update(deltaTime, enemies, projectiles) {
        this.lastShot += deltaTime;

        // Clear invalid target
        if (!this.target || !this.target.alive || this.position.distance(this.target.position) > this.range) {
            this.target = this.findTarget(enemies);
        }

        // Shoot if ready and has target
        if (this.target && this.lastShot >= 1 / this.fireRate) {
            this.shoot(projectiles);
            this.lastShot = 0;
        }
    }

    findTarget(enemies) {
        let bestTarget = null;
        let maxProgress = -1;

        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            const distance = this.position.distance(enemy.position);
            if (distance <= this.range) {
                // Prioritize enemies that have traveled farthest (closest to base)
                if (enemy.distanceTraveled > maxProgress) {
                    maxProgress = enemy.distanceTraveled;
                    bestTarget = enemy;
                }
            }
        }

        return bestTarget;
    }

    shoot(projectiles) {
        projectiles.push(new Projectile(
            this.position,
            this.target,
            this.damage,
            400,
            this.type.projectileColor,
            4
        ));
    }

    upgrade() {
        if (game.gold >= this.upgradeCost) {
            game.gold -= this.upgradeCost;
            this.level++;
            this.updateStats();
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5); // Increasing cost
            return true;
        }
        return false;
    }

    draw(ctx) {
        // Highlight if hovered
        if (typeof game !== "undefined" && game && game.hoveredTower === this) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw tower
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Draw level indicator
        if (this.level > 1) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.level.toString(),
                this.position.x,
                this.position.y + 4
            );
        }

        // Draw targeting line
        if (this.target && this.target.alive) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.target.position.x, this.target.position.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

// Forward declaration for game reference
let game = null;
export function setGameReference(gameRef) {
    game = gameRef;
}