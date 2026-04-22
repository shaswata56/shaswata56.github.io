<template>
  <div
    class="theme-switcher"
    :style="{ top: pos.y + 'px', left: pos.x + 'px' }"
    @mousedown="startDrag"
    @touchstart.passive="startDragTouch"
  >
    <button @click="handleClick" class="theme-button" :class="{ dragging, spinning }">
      <font-awesome-icon
        :icon="currentTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
      />
    </button>
  </div>
</template>

<script>
const COOKIE_KEY = 'theme-btn-pos';

function savePosTocookie(x, y) {
  const val = encodeURIComponent(JSON.stringify({ x, y }));
  document.cookie = `${COOKIE_KEY}=${val};path=/;max-age=31536000`;
}

function loadPosFromCookie() {
  const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(COOKIE_KEY + '='));
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('='))); } catch { return null; }
}

export default {
  data() {
    return {
      currentTheme: 'dark',
      pos: { x: 0, y: 0 },
      dragging: false,
      spinning: false,
      _dragStart: null,
      _moved: false,
    };
  },
  mounted() {
    this.setInitialTheme();
    this.applyTheme();
    this.initPos();
    this._onMouseMove = this.onDragMove.bind(this);
    this._onMouseUp = this.stopDrag.bind(this);
    this._onTouchMove = this.onDragMoveTouch.bind(this);
    this._onTouchEnd = this.stopDrag.bind(this);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
  },
  methods: {
    initPos() {
      const saved = loadPosFromCookie();
      if (saved && saved.x >= 0 && saved.y >= 0) {
        this.pos = { x: Math.min(saved.x, window.innerWidth - 40), y: Math.min(saved.y, window.innerHeight - 40) };
      } else {
        this.pos = { x: window.innerWidth - 60, y: 20 };
      }
    },
    setInitialTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.currentTheme = savedTheme;
      } else {
        this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    },
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      localStorage.setItem('theme', this.currentTheme);
    },
    toggleTheme() {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme();
      this.spinning = true;
      setTimeout(() => { this.spinning = false; }, 400);
    },
    startDrag(e) {
      this.dragging = true;
      this._moved = false;
      this._dragStart = { mx: e.clientX, my: e.clientY, px: this.pos.x, py: this.pos.y };
    },
    startDragTouch(e) {
      const t = e.touches[0];
      this.dragging = true;
      this._moved = false;
      this._dragStart = { mx: t.clientX, my: t.clientY, px: this.pos.x, py: this.pos.y };
    },
    onDragMove(e) {
      if (!this.dragging || !this._dragStart) return;
      const dx = e.clientX - this._dragStart.mx;
      const dy = e.clientY - this._dragStart.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._moved = true;
      this.pos = {
        x: Math.max(0, Math.min(window.innerWidth - 40, this._dragStart.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 40, this._dragStart.py + dy)),
      };
    },
    onDragMoveTouch(e) {
      if (!this.dragging || !this._dragStart) return;
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - this._dragStart.mx;
      const dy = t.clientY - this._dragStart.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._moved = true;
      this.pos = {
        x: Math.max(0, Math.min(window.innerWidth - 40, this._dragStart.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 40, this._dragStart.py + dy)),
      };
    },
    stopDrag() {
      if (this.dragging) {
        savePosTocookie(this.pos.x, this.pos.y);
      }
      this.dragging = false;
    },
    handleClick() {
      if (!this._moved) this.toggleTheme();
      this._moved = false;
    },
  },
};
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  z-index: 1000;
  user-select: none;
  touch-action: none;
  will-change: transform;
}

.theme-button {
  background-color: var(--accent-color);
  color: var(--accent-text-color);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: grab;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: color var(--transition-duration) ease, box-shadow var(--transition-duration) ease;
}

.theme-button.dragging {
  cursor: grabbing;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.theme-button:hover {
  color: var(--link-color-hover);
  box-shadow: 0 0 8px var(--border-color);
}

.theme-button svg {
  font-size: 16px;
}

@keyframes spin-once { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.theme-button.spinning svg { animation: spin-once 0.4s ease; }
</style>
