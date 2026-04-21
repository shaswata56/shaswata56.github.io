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
  font-size: 1.1rem;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--accent-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hobby-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
  background-color: var(--link-color);
}

.hobby-item:hover .hobby-text {
  color: var(--background-color) !important;
}

.hobby-icon {
  font-size: 1.2rem;
  color: var(--text-color);
  height: 50px;
  justify-content: center;
  align-content: center;
}

.hobby-text {
  color: var(--text-color);
  font-weight: 500;
}
</style>
