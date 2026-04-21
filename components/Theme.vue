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
  top: 20px;
  right: 20px;
}

.theme-button {
  background-color: var(--accent-color);
  color: var(--accent-text-color);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.theme-button:hover {
  transform: scale(1.1);
  transition: all 0.7s ease;
  box-shadow: 0 0 10px var(--accent-color);
}

.theme-button svg {
  font-size: 23px;
}

@media (max-width: 920px) {
  .theme-switcher {
    top: 10px;
    right: 10px;
  }
}

@media (max-width: 768px) {
  .theme-button {
    width: 29px;
    height: 29px;
  }

  .theme-button svg {
    font-size: 19px;
  }
}

@media (max-width: 430px) {
  .theme-button {
    width: 19px;
    height: 19px;
  }

  .theme-button svg {
    font-size: 13px;
  }
}
</style>
