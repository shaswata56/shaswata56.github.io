<template>
  <section class="projects" id="projects">
    <a href="#projects">
      <h2 class="text-2xl font-bold name">Projects</h2>
    </a>

    <!-- Active tag filter chip -->
    <div v-if="activeTag" class="filter-bar">
      <span class="filter-chip">
        {{ activeTag }}
        <button class="filter-clear" @click="activeTag = null">×</button>
      </span>
    </div>

    <div class="project-list">
      <div
        v-for="(project, index) in projects"
        v-show="!activeTag || project.tags.includes(activeTag)"
        :key="index"
        class="project-row"
        @mouseenter="onRowEnter(index, project)"
        @mouseleave="onRowLeave(project)"
      >
        <div class="project-main">
          <div class="project-left">
            <span class="project-num">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="project-info">
              <div class="project-title-row">
                <h3 class="project-title">{{ project.title }}</h3>
                <span class="project-year">{{ project.year }}</span>
              </div>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-tags" v-if="project.tags && project.tags.length">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="tag"
                  :class="{ active: activeTag === tag }"
                  @click="activeTag = activeTag === tag ? null : tag"
                >{{ tag }}</span>
              </div>
            </div>
          </div>
          <div class="project-links">
            <a
              v-if="project.codeLink"
              :href="project.codeLink"
              target="_blank"
              rel="noopener noreferrer"
              class="project-link"
            >Code ↗</a>
            <a
              v-if="project.liveLink"
              :href="project.liveLink"
              target="_blank"
              rel="noopener noreferrer"
              class="project-link"
            >Live ↗</a>
          </div>
        </div>
        <div
          v-if="project.image"
          class="project-image-hover"
          :class="{ visible: hoveredProject === index }"
        >
          <img :src="project.image" :alt="project.title" />
        </div>
      </div>
    </div>

    <!-- klogger easter egg toast -->
    <transition name="toast">
      <div v-if="toastVisible" class="klogger-toast">{{ toastMessage }}</div>
    </transition>
  </section>
</template>

<script>
export default {
  name: "ProjectsSection",
  data() {
    return {
      hoveredProject: null,
      toastVisible: false,
      toastMessage: '',
      activeTag: null,
      _hoverTimer: null,
      _toastTimer: null,
      projects: [
        {
          title: "GenericAI",
          year: "2024",
          description: "Agentic AI assistant built on the ReAct framework. Integrates LangChain, Gradio, and MongoDB — capable of web browsing, PDF analysis, image interpretation, and persistent memory across sessions.",
          tags: ["Python", "LangChain", "RAG", "MongoDB"],
          codeLink: "https://github.com/shaswata56/GenericAI",
          image: "https://raw.githubusercontent.com/shaswata56/GenericAI/refs/heads/master/assets/demo.png",
        },
        {
          title: "Facial Expression Recognition",
          year: "2022",
          description: "CNN-based vision system for real-time facial expression and mood classification. Built during university — trained and competed in Vision AI contests and Kaggle challenges.",
          tags: ["Python", "PyTorch", "CNN", "OpenCV"],
          codeLink: "https://github.com/shaswata56/Facial_Expression_Recognition",
          image: "https://raw.githubusercontent.com/shaswata56/Facial_Expression_Recognition/master/res/test.gif",
        },
        {
          title: "microOS",
          year: "2020",
          description: "Minimal OS built from scratch — custom bootloader, IDT interrupt handling, VGA display, and keyboard driver. Runs on QEMU or bare metal via USB.",
          tags: ["C", "Assembly", "Kernel", "QEMU"],
          codeLink: "https://github.com/shaswata56/microOS",
          image: "https://raw.githubusercontent.com/shaswata56/microOS/master/res/screenplay.gif",
        },
        {
          title: "klogger",
          year: "2020",
          description: "Linux kernel module keylogger that captures all keystrokes system-wide, fully undetectable — no syslog traces, no process visibility.",
          tags: ["C", "Linux", "LKM", "Rootkit"],
          codeLink: "https://github.com/shaswata56/klogger",
          image: "",
        },
        {
          title: "Tao's Adventure",
          year: "2019",
          description: "Cross-platform 2D platformer built from scratch with 200+ commits. Multi-world level design, physics, collision, and keyboard controls — no engine, just C++ and SFML.",
          tags: ["C++", "SFML", "Game", "Physics"],
          codeLink: "https://github.com/shaswata56/Taos-Adventure",
          image: "https://a.fsdn.com/con/app/proj/taos-adventure/screenshots/Screenshot%20from%202019-02-14%2021-56-13.png",
        },
      ],
    };
  },
  methods: {
    onRowEnter(index, project) {
      this.hoveredProject = index;
      if (project.title === 'klogger') {
        this._hoverTimer = setTimeout(() => {
          this.toastMessage = '⌨ keylogging initiated...';
          this.toastVisible = true;
          this._toastTimer = setTimeout(() => {
            this.toastMessage = 'just kidding. probably.';
            setTimeout(() => { this.toastVisible = false; }, 1500);
          }, 1200);
        }, 600);
      }
    },
    onRowLeave(project) {
      this.hoveredProject = null;
      if (project.title === 'klogger') {
        clearTimeout(this._hoverTimer);
      }
    },
  },
};
</script>

<style scoped>
.projects {
  margin-bottom: 2rem;
}

.filter-bar {
  margin-bottom: 0.75rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--link-color);
  background: var(--accent-color);
  border: 1px solid var(--link-color);
  border-radius: 3px;
  padding: 0.15rem 0.5rem;
}

.filter-clear {
  background: none;
  border: none;
  color: var(--link-color);
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0;
}

.project-list {
  display: flex;
  flex-direction: column;
}

.project-row {
  position: relative;
  padding: 1.25rem 0.75rem;
  margin: 0 -0.75rem;
  border-bottom: 1px solid var(--border-color);
  border-radius: 6px;
  transition: background 0.2s ease, opacity 0.35s ease, transform 0.35s ease;
}

.project-row:first-child {
  border-top: 1px solid var(--border-color);
}

.project-row:hover {
  background: var(--accent-color);
}

.project-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.project-left {
  display: flex;
  gap: 1.25rem;
  flex: 1;
}

.project-num {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--accent-text-color);
  padding-top: 0.35rem;
  flex-shrink: 0;
  min-width: 1.5rem;
  opacity: 0.6;
}

.project-info {
  flex: 1;
}

.project-title-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.project-title {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.15rem;
}

.project-year {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--accent-text-color);
  opacity: 0.7;
}

.project-description {
  font-size: 0.9rem;
  color: var(--accent-text-color);
  line-height: 1.6;
  margin: 0.25rem 0 0.5rem;
}

.project-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.62rem;
  color: var(--accent-text-color);
  background: var(--accent-color);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 0.15rem 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.tag:hover,
.tag.active {
  border-color: var(--link-color);
  color: var(--link-color);
}

.project-links {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
  padding-top: 0.25rem;
}

.project-link {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--accent-text-color);
  text-decoration: none;
  transition: color 0.2s ease, transform 0.15s ease;
  white-space: nowrap;
  display: inline-block;
}

.project-link:hover {
  color: var(--link-color-hover);
  transform: translateX(2px);
}

/* Hover image — floats right outside content column */
.project-image-hover {
  position: absolute;
  right: -220px;
  top: 0;
  width: 200px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  z-index: 10;
}

.project-image-hover.visible {
  opacity: 1;
}

.project-image-hover img {
  width: 100%;
  display: block;
}

@media (max-width: 1100px) {
  .project-image-hover {
    display: none;
  }
}

.klogger-toast {
  position: fixed;
  bottom: 4.5rem;
  right: 1.5rem;
  background: var(--accent-color);
  border: 1px solid var(--link-color);
  color: var(--link-color);
  font-family: "Fira Mono", "Courier New", monospace;
  font-size: 0.78rem;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  z-index: 500;
  pointer-events: none;
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(8px); }
.toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
