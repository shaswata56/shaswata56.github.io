<template>
  <section class="experience" id="experience">
    <a href="#experience">
      <h2 class="text-2xl font-bold name">Experience</h2>
    </a>
    <div class="experience-list">
      <div
        v-for="(exp, index) in experiences"
        :key="index"
        class="experience-item"
      >
        <div class="experience-header">
          <div class="left">
            <h3 class="role">{{ exp.role }}</h3>
            <p class="company">{{ exp.company }}</p>
          </div>
          <div class="right">
            <p class="timeframe">{{ exp.timeframe }}</p>
          </div>
        </div>
        <p class="description">{{ exp.description }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ExperienceSection",
  data() {
    return {
      experiences: [
        {
          role: "Software Engineer",
          company: "Orbitax",
          timeframe: "Mar 2024 - Present",
          description:
            "Working on backend services, integrating SAML SSO, developing AI-driven tools, and ensuring secure, scalable system architectures.",
        },
        {
          role: "Associate Software Engineer",
          company: "Orbitax",
          timeframe: "Mar 2022 - Feb 2024",
          description:
            "During this time, I focused on enhancing the functionality of the system by implementing essential business logic. Additionally, I developed a few important features to improve the overall user experience. To ensure optimal performance, I made significant improvements to the administration and security. Lastly, I worked diligently to identify and squash critical bugs that were impacting system stability and reliability.",
        },
        {
          role: "Software Engineer Intern",
          company: "Orbitax",
          timeframe: "Sep 2021 - Feb 2022",
          description:
            "Ported an existing .NET microservices in Go for R&D purposes, which decreased response latency by 60% and reduced memory usage by 70%.",
        },
      ],
    };
  },
};
</script>

<style scoped>
.experience {
  margin-bottom: 2rem;
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.experience-item {
  padding: 0.5rem 0;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.experience-header .role,
.experience-header .company,
.experience-header .timeframe {
  color: var(--accent-text-color);
  font-family: "ui-sans-serif", system-ui, sans-serif, Apple Color Emoji,
    Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
}

.experience-header .role {
  color: var(--link-color-hover);
}

.role {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
}

.company {
  margin: 0.25rem 0 0;
  font-size: 1.1rem;
}

.timeframe {
  font-size: 1rem;
  text-align: right;
}

.description {
  line-height: 1.4;
  margin: 0.5rem 0 0;
}
</style>
