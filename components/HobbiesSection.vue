<template>
  <section class="hobbies" id="hobbies">
    <a href="#hobbies">
      <h2 class="text-2xl font-bold name">Hobbies</h2>
    </a>
    <div class="hobby-container">
      <div v-for="(hobby, index) in hobbies" :key="index" class="hobby-item">
        <img
          v-if="hobby.icon"
          :src="hobby.icon"
          alt="icon"
          class="hobby-icon"
        />
        <span class="hobby-text">{{ hobby.name }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import eightBallIcon from "~/assets/icons/8-ball.svg";
import cardsIcon from "~/assets/icons/cards.svg";
import codeIcon from "~/assets/icons/code.svg";
import gamepadIcon from "~/assets/icons/gamepad.svg";

export default {
  name: "HobbiesSection",
  data() {
    return {
      hobbies: [
        { name: "Pool", icon: eightBallIcon },
        { name: "Cards", icon: cardsIcon },
        { name: "Coding", icon: codeIcon },
        { name: "Gaming", icon: gamepadIcon },
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

.hobbies {
  margin-bottom: 2rem;
}

.hobby-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.hobby-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: transparent;
  transition: border-color var(--transition-duration) ease;
}

.hobby-item:hover {
  border-color: var(--link-color);
}

.hobby-icon {
  height: 28px;
  width: 28px;
  opacity: 0.75;
  justify-content: center;
  align-content: center;
}

.hobby-text {
  color: var(--text-color);
  font-weight: 500;
}
</style>
