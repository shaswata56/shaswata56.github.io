<template>
  <section class="projects" id="projects">
    <a href="#projects">
      <h2 class="text-2xl font-bold name">Projects</h2>
    </a>
    <div class="project-list">
      <div
        class="project-card"
        v-for="(project, index) in projects"
        :key="index"
      >
        <div class="project-info">
          <div class="project-header">
            <h3 class="project-title">{{ project.title }}</h3>
            <span class="project-year">{{ project.year }}</span>
          </div>
          <p class="project-description">{{ project.description }}</p>
          <div class="project-links">
            <a
              v-if="project.codeLink"
              :href="project.codeLink"
              target="_blank"
              rel="noopener noreferrer"
              class="project-button"
              >Code</a
            >
            <a
              v-if="project.liveLink"
              :href="project.liveLink"
              target="_blank"
              rel="noopener noreferrer"
              class="project-button"
              >Live</a
            >
          </div>
        </div>
        <div v-if="project.image" class="project-image-wrapper">
          <img
            :src="project.image"
            :alt="project.title + ' screenshot'"
            class="project-image"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ProjectsSection",
  data() {
    return {
      projects: [
        {
          title: "GenericAI",
          year: "2024",
          description: "GenericAI is a versatile AI assistant developed using the ReAct (Reasoning and Acting) framework. It is capable of reasoning through complex queries and executing actions to deliver accurate and well-rounded responses.",
          codeLink: "https://github.com/shaswata56/GenericAI",
          image:
            "https://raw.githubusercontent.com/shaswata56/GenericAI/refs/heads/master/assets/demo.png",
        },
        {
          title: "microOS",
          year: "2020",
          description: "Absolutely minimal Kernel and OS.",
          codeLink: "https://github.com/shaswata56/microOS",
          image:
            "https://raw.githubusercontent.com/shaswata56/microOS/master/res/screenplay.gif",
        },
        {
          title: "klogger",
          year: "2020",
          description:
            "A Linux Kernel module keylogger that logs all keystrokes. Fully undetectable and no logs in Syslog.",
          codeLink: "https://github.com/shaswata56/klogger",
          image: "",
        },
        {
          title: "Tao's Adventure",
          year: "2019",
          description:
            "A game project built from scratch using C++ and SFML for the 2nd semester in my university.",
          codeLink: "https://github.com/shaswata56/Taos-Adventure",
          image:
            "https://a.fsdn.com/con/app/proj/taos-adventure/screenshots/Screenshot%20from%202019-02-14%2021-56-13.png",
        },
      ],
    };
  },
};
</script>

<style scoped>
.section-label {
  font-size: 0.7rem;
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent-text-color);
  margin-bottom: 0.75rem;
  margin-top: 0;
}

.projects {
  margin-bottom: 2rem;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project-card {
  display: flex;
  justify-content: space-between;
  background-color: transparent;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1rem;
  gap: 1rem;
  transition: border-color var(--transition-duration) ease;
}

.project-card:hover {
  border-color: var(--link-color);
}

.project-info {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.project-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  color: var(--text-color);
}

.project-year {
  font-size: 0.85rem;
  font-family: "Inter", sans-serif;
  color: var(--accent-text-color);
  margin-left: 1rem;
}

.project-description {
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.project-links {
  display: flex;
  gap: 0.5rem;
}

.project-button {
  background-color: var(--background-color);
  color: var(--link-color);
  text-decoration: none;
  border: 1px solid var(--border-color);
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  font-size: 1rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.project-button:hover {
  background-color: var(--accent-color);
  color: var(--link-color-hover);
}

.project-image-wrapper {
  flex: 1 1 50%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.project-image {
  max-width: 100%;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  object-fit: cover;
}
</style>
