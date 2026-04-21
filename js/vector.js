// public/js/vector.js
export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    distance(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }

    normalize() {
        const magnitude = Math.hypot(this.x, this.y);
        return magnitude === 0 ? new Vector2(0, 0) : new Vector2(this.x / magnitude, this.y / magnitude);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
}