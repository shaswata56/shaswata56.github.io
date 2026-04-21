<template>
  <section class="education" id="education">
    <a href="#education">
      <h2 class="text-2xl font-bold name">Education</h2>
    </a>
    <div class="education-list">
      <div
        class="education-item"
        v-for="(edu, index) in educations"
        :key="index"
      >
        <div class="education-header">
          <div class="education-details">
            <h3 class="institution">{{ edu.institution }}</h3>
            <p class="degree">{{ edu.degree }}</p>
            <p class="timeframe">{{ edu.timeframe }}</p>
          </div>
        </div>
        <div class="education-body" v-if="edu.activities">
          <p class="activities">{{ edu.activities }}</p>
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
.education {
  margin-bottom: 2rem;
}

.education-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.education-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 0.5rem;
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
  font-size: 1.1rem;
  margin: 0;
  color: var(--text-color-secondary);
}

.timeframe {
  font-size: 1.1rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.education-body {
  font-size: 1.1rem;
  color: var(--text-color);
  line-height: 1.4;
  margin-top: 0.5rem;
}
</style>
  