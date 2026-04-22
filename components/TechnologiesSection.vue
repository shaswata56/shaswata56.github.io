<template>
  <section class="technologies" id="technologies">
    <a href="#technologies">
      <h2 class="text-2xl font-bold name">Technologies</h2>
    </a>

    <!-- Tabs -->
    <div class="tech-buttons">
      <button
        v-for="(tech, index) in technologies"
        :key="index"
        @click="toggleTech(index)"
        :class="{ active: activeTech === index }"
      >
        {{ tech.category }}
      </button>
    </div>

    <!-- Tech List with fade transition -->
    <transition name="tab-fade" mode="out-in">
      <div :key="activeTech" class="tech-list">
        <div
          v-for="(item, i) in technologies[activeTech].items"
          :key="item.name"
          class="tech-item"
          :title="item.name"
        >
          <i :class="item.logo + ' tech-icon'"></i>
          <b>
            <span class="tech-text">{{ item.name }}</span>
          </b>
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
export default {
  name: "TechnologiesSection",
  data() {
    return {
      activeTech: 0,
      technologies: [
        {
          category: "Languages",
          items: [
            { name: "Python", logo: "devicon-python-plain colored" },
            { name: "C#", logo: "devicon-csharp-plain-wordmark colored" },
            { name: "Go", logo: "devicon-go-original-wordmark colored" },
            { name: "C++", logo: "devicon-cplusplus-plain colored" },
            { name: "C", logo: "devicon-c-plain-wordmark colored" },
            { name: "Java", logo: "devicon-java-plain colored" },
            { name: "Bash", logo: "devicon-bash-plain colored" },
            { name: "PowerShell", logo: "devicon-powershell-plain colored" },
            { name: "TypeScript", logo: "devicon-typescript-plain colored" },
            { name: "JavaScript", logo: "devicon-javascript-plain colored" },
            { name: "Solidity", logo: "devicon-solidity-plain colored" },
          ],
        },
        {
          category: "Frameworks",
          items: [
            { name: ".NET Framework", logo: "devicon-dot-net-plain colored" },
            { name: ".NET Core", logo: "devicon-dotnetcore-plain colored" },
            { name: "RabbitMQ", logo: "devicon-rabbitmq-original colored" },
            { name: "Angular", logo: "devicon-angularjs-plain colored" },
            { name: "TensorFlow", logo: "devicon-tensorflow-original colored" },
            { name: "PyTorch", logo: "devicon-pytorch-original colored" },
          ],
        },
        {
          category: "Databases",
          items: [
            { name: "MongoDB", logo: "devicon-mongodb-plain colored" },
            { name: "Microsoft SQL Server", logo: "devicon-microsoftsqlserver-plain colored" },
            { name: "Qdrant", logo: "qdrant-icon" },
          ],
        },
        {
          category: "DevOps",
          items: [
            { name: "GitHub Actions", logo: "devicon-githubactions-plain colored" },
            { name: "Docker", logo: "devicon-docker-plain colored" },
            { name: "Kubernetes", logo: "devicon-kubernetes-plain colored" },
            { name: "Google Cloud Platform", logo: "devicon-googlecloud-plain colored" },
            { name: "Amazon Web Services", logo: "devicon-amazonwebservices-plain-wordmark colored" },
            { name: "Azure", logo: "devicon-azure-plain colored" },
          ],
        },
        {
          category: "Development Tools",
          items: [
            { name: "Visual Studio", logo: "devicon-visualstudio-plain colored" },
            { name: "Visual Studio Code", logo: "devicon-vscode-plain colored" },
            { name: "IntelliJ IDEA", logo: "devicon-intellij-plain colored" },
            { name: "Postman", logo: "devicon-postman-plain colored" },
            { name: "Chrome DevTools", logo: "devicon-chrome-plain colored" },
            { name: "Vim", logo: "devicon-vim-plain colored" },
            { name: "Git", logo: "devicon-git-plain colored" },
            { name: "Arch Linux", logo: "devicon-archlinux-plain colored" },
            { name: "Windows 11", logo: "devicon-windows11-original colored" },
            { name: "GCC", logo: "devicon-gcc-plain colored" },
          ],
        },
      ],
    };
  },
  methods: {
    toggleTech(index) {
      this.activeTech = index;
    },
  },
};
</script>

<style scoped>
.tech-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-buttons button {
  background-color: var(--accent-color);
  color: var(--accent-text-color);
  border: 1px solid var(--border-color);
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tech-buttons button:hover,
.tech-buttons button.active {
  border-color: var(--link-color);
  color: var(--link-color);
  background-color: transparent;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tech-text {
  padding-top: 5px;
  max-width: 90px;
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  color: var(--text-color);
}

.tech-item {
  position: relative;
  padding-top: 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 70px;
  width: auto;
  font-size: 11px;
  justify-content: center;
  cursor: default;
  border: 1px solid var(--border-color);
  background-color: transparent;
  border-radius: 6px;
  transition: border-color var(--transition-duration) ease, opacity 0.35s ease, transform 0.35s ease;
}

.tech-item:hover {
  border-color: var(--link-color);
}

.tech-item:hover .tech-icon,
.tech-item:hover i {
  filter: drop-shadow(0 0 5px var(--link-color));
  transform: scale(1.1);
}

.tech-icon {
  font-size: 48px;
  padding-bottom: 4px;
  transition: filter 0.2s ease, transform 0.2s ease;
}


.qdrant-icon {
  background: url("@/assets/icons/qdrant.svg");
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  height: 56px;
  width: 48px;
}

/* Tab fade transition */
.tab-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.tab-fade-leave-active { transition: opacity 0.15s ease; }
.tab-fade-enter-from   { opacity: 0; transform: translateY(4px); }
.tab-fade-leave-to     { opacity: 0; }
</style>
