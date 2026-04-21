// public/js/game.js
import { Vector2 } from './vector.js';
import { Enemy, ENEMY_TYPES } from './enemy.js';
import { Projectile } from './projectile.js';
import { Tower, setGameReference } from './tower.js';

// Tower type definitions
export const TOWER_TYPES = {
    archer: {
        name: 'Archer Tower',
        cost: 50,
        damage: 20,
        range: 100,
        fireRate: 2,
        color: '#48bb78',
        projectileColor: '#68d391',
        description: 'Fast, low damage'
    },
    cannon: {
        name: 'Cannon Tower',
        cost: 100,
        damage: 50,
        range: 80,
        fireRate: 0.8,
        color: '#f56565',
        projectileColor: '#fc8181',
        description: 'Slow, high damage'
    },
    magic: {
        name: 'Magic Tower',
        cost: 150,
        damage: 35,
        range: 120,
        fireRate: 1.5,
        color: '#9f7aea',
        projectileColor: '#b794f4',
        description: 'Long range, medium damage'
    },
    sniper: {
        name: 'Sniper Tower',
        cost: 200,
        damage: 100,
        range: 180,
        fireRate: 0.5,
        color: '#4a5568',
        projectileColor: '#718096',
        description: 'Very long range, very slow'
    }
};

// Wave definitions
export const WAVES = [
    { enemies: [{ type: 'goblin', count: 5, delay: 1000 }] },
    { enemies: [{ type: 'goblin', count: 8, delay: 800 }] },
    { enemies: [{ type: 'goblin', count: 5, delay: 600 }, { type: 'orc', count: 3, delay: 1200 }] },
    { enemies: [{ type: 'orc', count: 5, delay: 1000 }] },
    { enemies: [{ type: 'goblin', count: 10, delay: 500 }, { type: 'ogre', count: 1, delay: 0 }] },
    { enemies: [{ type: 'orc', count: 8, delay: 800 }, { type: 'goblin', count: 5, delay: 400 }] },
    { enemies: [{ type: 'ogre', count: 2, delay: 2000 }, { type: 'orc', count: 5, delay: 600 }] },
    { enemies: [{ type: 'demon', count: 1, delay: 0 }, { type: 'goblin', count: 15, delay: 300 }] },
    { enemies: [{ type: 'ogre', count: 3, delay: 1500 }, { type: 'demon', count: 1, delay: 0 }] },
    { enemies: [{ type: 'demon', count: 2, delay: 2000 }, { type: 'ogre', count: 5, delay: 1000 }, { type: 'orc', count: 10, delay: 500 }] }
];

export class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        // Game state
        this.health = 20;
        this.gold = 200;
        this.wave = 0;
        this.score = 0;

        // Game objects
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];

        // Game world
        this.path = this.generatePath();
        this.towerSpots = this.generateTowerSpots();

        // UI state
        this.selectedTowerType = null;
        this.hoveredTower = null;
        this.isPaused = true;
        this.isWaveActive = false;
        this.gameOver = false;
        this.autoPlay = true;

        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.waveStartTime = 0;

        // Enemy spawning
        this.enemySpawnQueue = [];
        this.lastSpawnTime = 0;

        // Difficulty
        this.difficulty = 'normal';
        this.goldMultiplier = 1.0;

        // Set up game reference for towers
        setGameReference(this);

        this.init();
    }

    init() {
        this.loadState();
        this.setupEventListeners();
        this.createTowerCards();
        this.updateUI();
        this.gameLoop(0);
    }

    generatePath() {
        // Create a winding path from left to right
        const points = [];
        const segments = 8;
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = 50 + t * (width - 100);
            const y = 100 + Math.sin(t * Math.PI * 2) * 60 + Math.sin(t * Math.PI * 4) * 30;
            points.push(new Vector2(x, y));
        }

        return points;
    }

    generateTowerSpots() {
        const spots = [];
        const spacing = 60;
        const pathBuffer = 50;

        for (let x = spacing; x < this.canvas.width; x += spacing) {
            for (let y = spacing; y < this.canvas.height; y += spacing) {
                const pos = new Vector2(x, y);

                // Check if spot is too close to path
                let tooClose = false;
                for (let i = 0; i < this.path.length - 1; i++) {
                    if (this.distanceToLineSegment(pos, this.path[i], this.path[i + 1]) < pathBuffer) {
                        tooClose = true;
                        break;
                    }
                }

                if (!tooClose) {
                    spots.push(pos);
                }
            }
        }

        return spots;
    }

    distanceToLineSegment(point, a, b) {
        const A = point.x - a.x;
        const B = point.y - a.y;
        const C = b.x - a.x;
        const D = b.y - a.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const t = lenSq !== 0 ? Math.max(0, Math.min(1, dot / lenSq)) : 0;

        const xx = a.x + t * C;
        const yy = a.y + t * D;

        return Math.hypot(point.x - xx, point.y - yy);
    }

    setupEventListeners() {
        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));

        // UI buttons
        document.getElementById('playPauseBtn')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('newGameBtn')?.addEventListener('click', () => this.showDifficultyModal());
        document.getElementById('backBtn')?.addEventListener('click', () => window.location.href = "/");

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (e.target instanceof HTMLInputElement) return;

        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'p':
                this.togglePause();
                break;
            case 'escape':
                this.selectedTowerType = null;
                this.refreshShopAffordability();
                break;
        }
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById("playPauseBtn");
        if (btn) {
            btn.textContent = this.isPaused ? "▶️ Play" : "⏸️ Pause";
        }

        if (this.isPaused) {
            this.saveState();
        } else if (!this.isWaveActive) {
            this.startWave();
        }
    }

    handleCanvasClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        const pos = new Vector2(x, y);

        // Check for tower clicks
        for (const tower of this.towers) {
            if (pos.distance(tower.position) < 30) {
                this.showUpgradeOption(tower);
                return;
            }
        }

        // Place tower if one is selected
        if (this.selectedTowerType) {
            this.placeTower(pos);
        }
    }

    handleCanvasHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        const pos = new Vector2(x, y);

        this.hoveredTower = null;
        for (const tower of this.towers) {
            if (pos.distance(tower.position) < 30) {
                this.hoveredTower = tower;
                break;
            }
        }
    }

    showUpgradeOption(tower) {
        const modal = document.getElementById("upgradeModal");
        const title = document.getElementById("upgradeTitle");
        const costText = document.getElementById("upgradeCostText");
        const confirmBtn = document.getElementById("confirmUpgradeBtn");
        const cancelBtn = document.getElementById("cancelUpgradeBtn");

        if (!modal || !title || !costText || !confirmBtn || !cancelBtn) return;

        title.textContent = `${tower.type.name} (Level ${tower.level})`;
        costText.textContent = `Upgrade to Level ${tower.level + 1} for ${tower.upgradeCost} gold?`;

        modal.style.display = "flex";

        // Remove old listeners
        const newConfirm = confirmBtn.cloneNode(true);
        const newCancel = cancelBtn.cloneNode(true);

        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

        newConfirm.addEventListener("click", () => {
            if (tower.upgrade()) {
                this.updateUI();
                this.saveState();
            }
            modal.style.display = "none";
        });

        newCancel.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    placeTower(clickPos) {
        const towerType = TOWER_TYPES[this.selectedTowerType];
        if (this.gold < towerType.cost) {
            this.showToast('Not enough gold!', 'error');
            return;
        }

        // Find nearest valid spot
        let nearest = null;
        let minDistance = Infinity;

        for (const spot of this.towerSpots) {
            const distance = clickPos.distance(spot);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = spot;
            }
        }

        if (nearest && minDistance < 40) {
            // Check if spot is occupied
            const occupied = this.towers.some(tower => tower.position.distance(nearest) < 1);
            if (!occupied) {
                this.towers.push(new Tower(towerType, nearest));
                this.gold -= towerType.cost;
                this.updateUI();
                this.saveState();
                this.showToast(`Placed ${towerType.name}!`, 'success');
            } else {
                this.showToast('Spot already occupied!', 'warning');
            }
        } else {
            this.showToast('Invalid placement location!', 'warning');
        }
    }

    createTowerCards() {
        const container = document.getElementById('towerCards');
        if (!container) return;

        container.innerHTML = '';

        Object.keys(TOWER_TYPES).forEach(key => {
            const towerType = TOWER_TYPES[key];
            const card = document.createElement('div');
            card.className = 'tower-card';
            card.dataset.type = key;

            card.innerHTML = `
                <div class="tower-name">${towerType.name}</div>
                <div class="tower-stats">
                    <div>💥 ${towerType.damage} damage</div>
                    <div>🎯 ${towerType.range} range</div>
                    <div>⚡ ${towerType.fireRate}/s</div>
                    <div class="tower-description">${towerType.description}</div>
                </div>
                <div class="tower-cost">💰 ${towerType.cost}</div>
            `;

            card.addEventListener('click', () => {
                // Deselect all cards
                document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));

                if (this.selectedTowerType === key) {
                    this.selectedTowerType = null;
                } else {
                    this.selectedTowerType = key;
                    card.classList.add('selected');
                }

                this.refreshShopAffordability();
            });

            container.appendChild(card);
        });

        this.refreshShopAffordability();
    }

    refreshShopAffordability() {
        document.querySelectorAll('.tower-card').forEach(card => {
            const type = card.dataset.type;
            const towerType = TOWER_TYPES[type];
            const canAfford = this.gold >= towerType.cost;
            const isSelected = this.selectedTowerType === type;

            card.classList.toggle('disabled', !canAfford && !isSelected);
        });
    }

    showDifficultyModal() {
        const modal = document.getElementById('difficultyModal');
        if (!modal) return;

        modal.style.display = "flex";

        modal.querySelectorAll('button[data-diff]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                this.setDifficulty(this.difficulty);
                modal.style.display = "none";
                this.startNewGame();
            });
        });
    }

    setDifficulty(diff) {
        switch(diff) {
            case 'easy':
                this.health = 30;
                this.gold = 300;
                this.goldMultiplier = 1.2;
                break;
            case 'normal':
                this.health = 20;
                this.gold = 200;
                this.goldMultiplier = 1.0;
                break;
            case 'hard':
                this.health = 10;
                this.gold = 150;
                this.goldMultiplier = 0.8;
                break;
        }
    }

    startNewGame() {
        // Reset game state
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.wave = 0;
        this.score = 0;
        this.isWaveActive = false;
        this.gameOver = false;
        this.enemySpawnQueue = [];

        this.updateUI();
        this.saveState();
    }

    updateUI() {
        // Update stats display
        const healthEl = document.getElementById('health');
        const goldEl = document.getElementById('gold');
        const waveEl = document.getElementById('wave');
        const scoreEl = document.getElementById('score');

        if (healthEl) healthEl.textContent = this.health;
        if (goldEl) goldEl.textContent = this.gold;
        if (waveEl) waveEl.textContent = this.wave;
        if (scoreEl) scoreEl.textContent = this.score;

        this.refreshShopAffordability();
    }

    addGold(amount) {
        this.gold += Math.floor(amount * this.goldMultiplier);
        this.score += Math.floor(amount * 10); // Score based on gold earned
        this.updateUI();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.endGame();
        }
        this.updateUI();
    }

    startWave() {
        if (this.wave >= WAVES.length) {
            // Endless mode
            this.generateEndlessWave(this.wave + 1);
        }

        this.wave++;
        this.isWaveActive = true;
        this.waveStartTime = performance.now();
        this.enemySpawnQueue = [];
        this.lastSpawnTime = 0;

        // Generate spawn queue
        const waveData = WAVES[this.wave - 1] || this.generateEndlessWave(this.wave);
        let spawnTime = 0;

        waveData.enemies.forEach(enemyGroup => {
            for (let i = 0; i < enemyGroup.count; i++) {
                this.enemySpawnQueue.push({
                    type: enemyGroup.type,
                    spawnTime: spawnTime
                });
                spawnTime += enemyGroup.delay;
            }
        });

        this.showToast(`Wave ${this.wave} started!`, 'info');
        this.updateUI();
    }

    generateEndlessWave(waveNumber) {
        const enemyTypes = Object.keys(ENEMY_TYPES);
        const enemyCount = Math.min(5 + Math.floor(waveNumber / 3), 20);
        const enemies = [];

        for (let i = 0; i < enemyCount; i++) {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            enemies.push({
                type: type,
                count: 1,
                delay: 800 - Math.min(waveNumber * 20, 400) // Faster spawning over time
            });
        }

        return { enemies };
    }

    spawnDueEnemies(currentTime) {
        const waveTime = currentTime - this.waveStartTime;

        while (this.enemySpawnQueue.length > 0 && waveTime >= this.enemySpawnQueue[0].spawnTime) {
            const enemyData = this.enemySpawnQueue.shift();
            this.enemies.push(new Enemy(enemyData.type, this.path, this.wave));
        }
    }

    checkWaveComplete() {
        if (!this.isWaveActive) return;

        const enemiesRemaining = this.enemies.filter(e => e.alive).length;
        const enemiesQueued = this.enemySpawnQueue.length;

        if (enemiesRemaining === 0 && enemiesQueued === 0) {
            this.isWaveActive = false;
            this.addGold(50 + this.wave * 10); // Wave completion bonus
            this.showToast(`Wave ${this.wave} complete! +${50 + this.wave * 10} gold`, 'success');

            if (this.autoPlay && !this.gameOver) {
                setTimeout(() => this.startWave(), 2000);
            }
        }
    }

    endGame() {
        this.gameOver = true;
        this.isPaused = true;
        document.getElementById('finalWave').textContent = this.wave;
        document.getElementById('gameOverOverlay').style.display = 'flex';
        this.saveState();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.showToast(this.isPaused ? 'Game Paused' : 'Game Resumed', 'info');
    }

    showToast(message, type = 'info') {
        // Create or update toast
        let toast = document.getElementById('gameToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'gameToast';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }

        const colors = {
            success: '#48bb78',
            error: '#f56565',
            warning: '#f6ad55',
            info: '#4299e1'
        };

        toast.style.backgroundColor = colors[type] || colors.info;
        toast.textContent = message;
        toast.style.opacity = '1';

        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    gameLoop(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        if (!this.isPaused && !this.gameOver) {
            this.update(this.deltaTime);
        }

        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Spawn enemies
        if (this.isWaveActive) {
            this.spawnDueEnemies(performance.now());
        }

        // Update game objects
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.towers.forEach(tower => tower.update(deltaTime, this.enemies, this.projectiles));
        this.projectiles.forEach(projectile => projectile.update(deltaTime));

        // Clean up dead objects
        this.enemies = this.enemies.filter(enemy => enemy.alive);
        this.projectiles = this.projectiles.filter(projectile => projectile.alive);

        // Check for enemies reaching the end
        this.enemies.forEach(enemy => {
            if (!enemy.alive && enemy.pathIndex >= enemy.path.length - 1) {
                this.takeDamage(enemy.damage);
            }
        });

        // Award gold for killed enemies
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.alive && enemy.health <= 0) {
                this.addGold(enemy.reward);
                return false;
            }
            return true;
        });

        // Check wave completion
        this.checkWaveComplete();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw path
        this.drawPath();

        // Draw tower spots
        this.drawTowerSpots();

        // Draw game objects
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));

        // Draw UI overlays
        if (this.selectedTowerType) {
            this.drawTowerPlacementPreview();
        }
    }

    drawPath() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);

        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }

        this.ctx.stroke();

        // Draw path border
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 44;
        this.ctx.stroke();
    }

    drawTowerSpots() {
        this.ctx.fillStyle = 'rgba(74, 85, 104, 0.3)';

        this.towerSpots.forEach(spot => {
            this.ctx.beginPath();
            this.ctx.arc(spot.x, spot.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawTowerPlacementPreview() {
        if (!this.selectedTowerType) return;

        const towerType = TOWER_TYPES[this.selectedTowerType];
        this.ctx.strokeStyle = towerType.color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);

        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, towerType.range, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.setLineDash([]);
    }

    saveState() {
        const state = {
            health: this.health,
            gold: this.gold,
            wave: this.wave,
            score: this.score,
            difficulty: this.difficulty,
            towers: this.towers.map(tower => ({
                type: tower.type,
                position: tower.position,
                level: tower.level
            })),
            enemies: this.enemies.map(enemy => ({
                type: enemy.type,
                position: enemy.position,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                speed: enemy.speed,
                reward: enemy.reward,
                damage: enemy.damage,
                color: enemy.color,
                size: enemy.size,
                alive: enemy.alive,
                distanceTraveled: enemy.distanceTraveled,
                pathIndex: enemy.pathIndex
            })),
            projectiles: this.projectiles.map(projectile => ({
                position: projectile.position,
                damage: projectile.damage,
                speed: projectile.speed,
                color: projectile.color,
                size: projectile.size,
                alive: projectile.alive
            }))
        };

        localStorage.setItem("towerDefenseSave", JSON.stringify(state));
    }

    loadState() {
        const saved = localStorage.getItem("towerDefenseSave");
        if (!saved) return;

        try {
            const state = JSON.parse(saved);

            this.health = state.health || 20;
            this.gold = state.gold || 200;
            this.wave = state.wave || 0;
            this.score = state.score || 0;
            this.difficulty = state.difficulty || 'normal';

            // Recreate towers
            this.towers = (state.towers || []).map(towerData => {
                const tower = new Tower(towerData.type, new Vector2(towerData.position.x, towerData.position.y));
                tower.level = towerData.level;
                tower.updateStats();
                return tower;
            });

            // Recreate enemies
            this.enemies = (state.enemies || []).map(enemyData => {
                const enemy = new Enemy(
                    enemyData.type,
                    this.path,
                    this.wave,
                    {
                        position: new Vector2(enemyData.position.x, enemyData.position.y),
                        health: enemyData.health,
                        maxHealth: enemyData.maxHealth,
                        speed: enemyData.speed,
                        reward: enemyData.reward,
                        damage: enemyData.damage,
                        color: enemyData.color,
                        size: enemyData.size,
                        alive: enemyData.alive,
                        distanceTraveled: enemyData.distanceTraveled,
                        pathIndex: enemyData.pathIndex
                    }
                );
                return enemy;
            });

            // Recreate projectiles
            this.projectiles = (state.projectiles || []).map(projectileData => {
                const projectile = new Projectile(
                    new Vector2(projectileData.position.x, projectileData.position.y),
                    null, // Will be set by update logic
                    projectileData.damage,
                    projectileData.speed,
                    projectileData.color,
                    projectileData.size,
                    projectileData
                );
                return projectile;
            });

            this.setDifficulty(this.difficulty);
        } catch (error) {
            console.warn("Failed to load save state:", error);
        }
    }
}