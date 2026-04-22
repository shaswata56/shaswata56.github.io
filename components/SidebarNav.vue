<template>
  <nav class="sidebar-nav">
    <a
      v-for="s in sections"
      :key="s.id"
      :href="'#' + s.id"
      :class="{ active: activeSection === s.id }"
    >
      <span class="dot" />
      <span class="label">{{ s.label }}</span>
    </a>
  </nav>
</template>

<script>
export default {
  name: "SidebarNav",
  data() {
    return {
      activeSection: "about",
      sections: [
        { id: "about", label: "About" },
        { id: "projects", label: "Projects" },
        { id: "technologies", label: "Technologies" },
        { id: "experience", label: "Experience" },
        { id: "education", label: "Education" },
        { id: "hobbies", label: "Hobbies" },
      ],
    };
  },
  mounted() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    this.sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    this._observer = observer;

    // Fallback: activate last section when scrolled to bottom
    this._scrollHandler = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 80) {
        this.activeSection = 'hobbies';
      }
    };
    window.addEventListener('scroll', this._scrollHandler, { passive: true });
  },
  beforeUnmount() {
    if (this._observer) this._observer.disconnect();
    window.removeEventListener('scroll', this._scrollHandler);
  },
};
</script>

<style scoped>
.sidebar-nav {
  position: fixed;
  left: calc(50% - 420px); /* right edge of nav = left edge of 760px content - ~20px gap */
  top: 50%;
  transform: translate(-100%, -50%); /* shift entire nav left by its own width — no overlap ever */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.25rem;
  z-index: 100;
  padding-right: 20px;
  will-change: transform;
}

@media (max-width: 1199px) {
  .sidebar-nav {
    display: none;
  }
}

a {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--accent-text-color);
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

a.active,
a:hover {
  color: var(--link-color);
}

a:hover .label,
a.active .label {
  opacity: 1;
  transform: translateX(0);
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

a.active .dot {
  transform: scale(1.5);
}

.label {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0;
  transform: translateX(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}
</style>
