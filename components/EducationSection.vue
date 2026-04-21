<template>
  <section class="education" id="education">
    <a href="#education">
      <h2 class="text-2xl font-bold name">Education</h2>
    </a>
    <div class="timeline">
      <div
        class="education-item"
        v-for="(edu, index) in educations"
        :key="index"
      >
        <div class="timeline-dot" />
        <div class="education-content">
          <div class="education-details">
            <h3 class="institution">{{ edu.institution }}</h3>
            <p class="degree">{{ edu.degree }}</p>
            <p class="timeframe">{{ edu.timeframe }}</p>
          </div>
          <div class="education-body" v-if="edu.activities">
            <p class="activities">{{ edu.activities }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
  
  <script>
export default {
  name: "EducationSection",
  data() {
    return {
      educations: [
        {
          institution: "Shahjalal University of Science and Technology",
          degree: "Bachelor of Engineering, Software Engineering",
          timeframe: "Feb 2018 - Jun 2023",
          activities: null,
        },
        {
          institution: "St. Joseph Higher Secondary School",
          degree: "HSC, Science",
          timeframe: "Jul 2015 - Dec 2017",
          activities:
            "Activities and societies: Executive Member of Josephite Debating Club",
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

.education {
  margin-bottom: 2rem;
}

.timeline {
  position: relative;
  padding-left: 1.25rem;
  border-left: 2px solid var(--border-color);
}

.education-item {
  position: relative;
  display: flex;
}

.timeline-dot {
  position: absolute;
  left: -6px;
  top: 0.45rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  border: 2px solid var(--background-color);
  flex-shrink: 0;
  transform: scale(0);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

section.revealed .timeline-dot { transform: scale(1); }
section.revealed .education-item:nth-child(1) .timeline-dot { transition-delay: 0.10s; }
section.revealed .education-item:nth-child(2) .timeline-dot { transition-delay: 0.17s; }

.education-content {
  padding: 0 0 1.75rem 1rem;
  flex: 1;
}

.education-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.institution {
  color: var(--link-color-hover);
  font-family: "ui-sans-serif", system-ui, sans-serif, Apple Color Emoji,
    Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
}

.degree {
  font-size: 1rem;
  margin: 0;
  color: var(--accent-text-color);
}

.timeframe {
  font-size: 1rem;
  color: var(--accent-text-color);
  margin: 0;
}

.education-body {
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.8;
  margin-top: 0.5rem;
}
</style>
  