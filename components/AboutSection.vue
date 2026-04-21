<template>
  <section class="about" id="about">
    <a href="#about">
      <h2 class="text-2xl font-bold name">About Me</h2>
    </a>
    <p>
      Software engineer based in Dhaka. I've been writing code since high school,
      started with C and Linux, and gradually worked my way up the stack.
      These days I work on backend systems, security, and AI tooling — mostly
      in C#, Python, and Go.
    </p>
    <p>
      I enjoy understanding how things work at a low level, and equally how
      different systems integrate, communicate, and give rise to something new.
      Outside of work I'm into the outdoors, reading, and the occasional
      late-night rabbit hole.
    </p>
    <div class="stats-row" ref="statsRow">
      <div class="stat">
        <span class="stat-num">{{ displayStats[0] }}+</span>
        <span class="stat-label">Years Exp</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ displayStats[1] }}+</span>
        <span class="stat-label">Projects</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ displayStats[2] }}+</span>
        <span class="stat-label">Languages</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "AboutSection",
  data() {
    return {
      targets: [4, 15, 10],
      displayStats: [0, 0, 0],
      _animated: false,
    };
  },
  mounted() {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this._animated) {
        this._animated = true;
        this.runCountUp();
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(this.$refs.statsRow);
  },
  methods: {
    runCountUp() {
      const duration = 800;
      const start = performance.now();
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const e = easeOut(t);
        this.displayStats = this.targets.map(v => Math.floor(e * v));
        if (t < 1) requestAnimationFrame(tick);
        else this.displayStats = [...this.targets];
      };
      requestAnimationFrame(tick);
    },
  },
};
</script>

<style scoped>
p {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.95rem;
  line-height: 1.75;
}

.stats-row {
  display: flex;
  gap: 2rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.stat-num {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--link-color);
  line-height: 1;
}

.stat-label {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-text-color);
}
</style>
