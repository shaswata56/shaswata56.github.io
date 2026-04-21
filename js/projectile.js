// public/js/projectile.js
import { Vector2 } from './vector.js';

export class Projectile {
    constructor(position, target, damage, speed, color, size, state = null) {
        this.alive = true;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.size = size;

        if (state) {
            // Restore from saved state
            this.position = new Vector2(state.position.x, state.position.y);
            this.target = null; // Will reacquire later if needed
        } else {
            this.position = position.clone();
            this.target = target;
        }
    }

    update(deltaTime) {
        if (!this.alive || !this.target || !this.target.alive) {
            this.alive = false;
            return;
        }

        const direction = this.target.position.subtract(this.position);
        const distance = direction.distance(new Vector2(0, 0));

        if (distance < 10) {
            // Hit target
            this.target.takeDamage(this.damage);
            this.alive = false;
        } else {
            // Move towards target
            const moveDistance = this.speed * deltaTime;
            const normalizedDir = direction.normalize();
            this.position = this.position.add(normalizedDir.multiply(moveDistance));
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add a subtle glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}