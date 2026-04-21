<template>
  <div class="theme-switcher">
    <button @click="toggleTheme" class="theme-button">
      <font-awesome-icon
        :icon="currentTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
      />
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTheme: "dark",
    };
  },
  mounted() {
    this.setInitialTheme();
    this.applyTheme();
  },
  methods: {
    setInitialTheme() {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        this.currentTheme = savedTheme;
      } else {
        // Set default theme based on system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        this.currentTheme = prefersDark ? "dark" : "light";
      }
    },
    applyTheme() {
      document.documentElement.setAttribute("data-theme", this.currentTheme);
      localStorage.setItem("theme", this.currentTheme);
    },
    toggleTheme() {
      this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
      this.applyTheme();
    },
  },
};
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 1.25rem;
  right: 1.5rem;
  z-index: 1000;
}

.theme-button {
  background-color: var(--accent-color);
  color: var(--accent-text-color);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: color var(--transition-duration) ease, box-shadow var(--transition-duration) ease;
}

.theme-button:hover {
  color: var(--link-color-hover);
  box-shadow: 0 0 8px var(--border-color);
  transform: none;
}

.theme-button svg {
  font-size: 16px;
}
</style>
