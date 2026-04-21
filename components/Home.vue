<template>
  <div class="home">
    <Theme />
    <SectionPill />
    <div class="content-wrapper">
      <div class="main-content">
        <ProfileHeader />
        <AboutSection />
        <ProjectsSection />
        <TechnologiesSection />
        <ExperienceSection />
        <EducationSection />
        <HobbiesSection />
        <FooterSection />
      </div>
    </div>
  </div>
</template>

<script>
import Theme from "./Theme.vue";
import ProfileHeader from "./ProfileHeader.vue";
import AboutSection from "./AboutSection.vue";
import TechnologiesSection from "./TechnologiesSection.vue";
import ExperienceSection from "./ExperienceSection.vue";
import ProjectsSection from "./ProjectsSection.vue";
import FooterSection from "./FooterSection.vue";
import EducationSection from "./EducationSection.vue";
import HobbiesSection from "./HobbiesSection.vue";
import SectionPill from "./SectionPill.vue";

export default {
  name: "Home",
  components: {
    Theme,
    SectionPill,
    ProfileHeader,
    AboutSection,
    TechnologiesSection,
    ExperienceSection,
    EducationSection,
    ProjectsSection,
    FooterSection,
    HobbiesSection,
  },
};
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  position: relative;
}

header {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .home {
    padding: 3rem 1.25rem;
  }

  .content-wrapper {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  header {
    margin-bottom: 1rem;
  }
}
</style>
