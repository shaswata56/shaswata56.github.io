<template>
  <div class="section-pill" :class="{ visible: scrolled }">
    <div class="pill-dots">
      <a
        v-for="s in sections"
        :key="s.id"
        :href="'#' + s.id"
        :title="s.label"
        class="pill-dot"
        :class="{ active: activeSection === s.id }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "SectionPill",
  data() {
    return {
      activeSection: "about",
      scrolled: false,
      sections: [
        { id: "about",        label: "About" },
        { id: "projects",     label: "Projects" },
        { id: "technologies", label: "Technologies" },
        { id: "experience",   label: "Experience" },
        { id: "education",    label: "Education" },
        { id: "hobbies",      label: "Hobbies" },
      ],
    };
  },
  computed: {
    activeLabel() {
      return this.sections.find(s => s.id === this.activeSection)?.label ?? '';
    },
  },
  mounted() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) this.activeSection = e.target.id; });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    this.sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    this._observer = observer;

    this._scrollHandler = () => {
      this.scrolled = window.scrollY > 80;
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
.section-pill {
  position: fixed;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--accent-color);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.45rem 1rem;
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  will-change: transform, opacity;
}

.section-pill.visible {
  opacity: 1;
  pointer-events: all;
}

.pill-label {
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--link-color);
  min-width: 5rem;
  text-align: right;
}

.pill-dots {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border-color);
  transition: background 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.pill-dot.active {
  background: var(--link-color);
  transform: scale(1.4);
}

.pill-dot:hover {
  background: var(--link-color-hover);
}
</style>
