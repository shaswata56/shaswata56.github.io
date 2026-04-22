<template>
  <section class="hobbies" id="hobbies">
    <a href="#hobbies">
      <h2 class="text-2xl font-bold name">Hobbies</h2>
    </a>
    <div class="hobby-container">
      <div
        v-for="(hobby, index) in displayHobbies"
        :key="index"
        class="hobby-item"
        :title="hobby.title || undefined"
      >
        <font-awesome-icon :icon="hobby.icon" class="hobby-icon" />
        <span class="hobby-text">{{ hobby.name }}</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "HobbiesSection",
  data() {
    return {
      hobbies: [
        { name: "Pool",    icon: "fa-solid fa-bullseye" },
        { name: "Cards",   icon: "fa-solid fa-clone" },
        { name: "Coding",  icon: "fa-solid fa-code" },
        { name: "Gaming",  icon: "fa-solid fa-gamepad" },
        { name: "Hiking",  icon: "fa-solid fa-person-hiking" },
        { name: "Cycling", icon: "fa-solid fa-person-biking" },
        { name: "Kayaking",icon: "fa-solid fa-water" },
        { name: "Boating", icon: "fa-solid fa-sailboat" },
      ],
    };
  },
  computed: {
    displayHobbies() {
      const h = new Date().getHours();
      if (h >= 2 && h < 5) {
        const list = [...this.hobbies];
        const idx = Math.floor(Math.random() * list.length);
        list[idx] = { name: 'Sleeping', icon: 'fa-solid fa-bed', title: "shouldn't you be in bed?" };
        return list;
      }
      return this.hobbies;
    },
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
  gap: 0.65rem;
  padding: 0.5rem 1rem;
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  font-size: 0.9rem;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: transparent;
  transition: border-color var(--transition-duration) ease, opacity 0.35s ease, transform 0.35s ease;
}

.hobby-item:hover {
  border-color: var(--link-color);
}

.hobby-item:hover .hobby-icon {
  transform: rotate(12deg) scale(1.2);
  color: var(--link-color);
}

.hobby-icon {
  font-size: 1.2rem;
  color: var(--accent-text-color);
  width: 1.2rem;
  text-align: center;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
}

.hobby-text {
  color: var(--text-color);
  font-weight: 500;
}
</style>
