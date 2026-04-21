<template>
  <header class="flex items-start sm:items-center justify-between">
    <div class="left-side">
      <h2 class="text-3xl font-bold name" @click="onNameClick" style="cursor:default;user-select:none">Shaswata Das</h2>
      <div class="mini-content">
        <p class="text-base">Software Engineer & Hacker</p>
        <p class="tagline">{{ typedTagline }}<span class="cursor" v-if="typing">|</span></p>
        <p class="items-center gap-1.5 inline-flex location">
          <font-awesome-icon icon="fa-solid fa-location-dot" />
          Dhaka, Bangladesh
        </p>
      </div>
      <div class="social-links">
        <a
          href="https://github.com/shaswata56"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <font-awesome-icon icon="fa-brands fa-github" title="GitHub" titleId="github-icon-title"/>
        </a>
        <a
          href="https://linkedin.com/in/shaswata56"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <font-awesome-icon icon="fa-brands fa-linkedin" title="LinkedIn" titleId="linkedin-icon-title"/>
        </a>
        <a
          href="https://blog.shaswata.me"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <font-awesome-icon icon="fa-solid fa-blog" title="Blog" titleId="blog-icon-title"/>
        </a>
        <a
          href="mailto:shaswata56@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <font-awesome-icon icon="fa-solid fa-envelope" title="Email" titleId="email-icon-title"/>
        </a>
        <a
          href="Shaswata_Das-Résumé.pdf"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
        <font-awesome-icon icon="fa-solid fa-file-pdf" title="Résumé" titleId="resume-icon-title"/>
        </a>
        <a
          href="TowerDefense.html"
          target="_self"
          class="social-link"
        >
        <font-awesome-icon icon="fa-solid fa-dice" title="Game: Tower Defense" titleId="game-icon-title"/>
        </a>
      </div>
      <span class="status-pill">⬡ Polyglot Systems Engineer · Orbitax</span>
    </div>
    <div class="image-container">
      <img
        src="@/assets/images/profile_picture.jpg"
        alt="Shaswata Das"
        class="profile-image"
        :class="{ bounce: imageBounce }"
        title="click me"
        style="cursor: pointer"
        @click="cycleTagline"
      />
    </div>
  </header>
</template>

<script>
export default {
  name: "ProfileHeader",
  data() {
    return {
      taglines: [
        'bits to emergence.',
        "git commit -m 'fixed everything'",
        'It works on my machine.',
        'sudo make me a pizza',
        'Have you tried turning it off and on again?',
      ],
      taglineIndex: 0,
      typedTagline: '',
      typing: false,
      imageBounce: false,
      _typeTimer: null,
      _nameClicks: 0,
      _nameTimer: null,
    };
  },
  mounted() {
    this.typeTagline();
  },
  beforeUnmount() {
    clearTimeout(this._typeTimer);
  },
  methods: {
    typeTagline() {
      const full = this.taglines[this.taglineIndex];
      this.typedTagline = '';
      this.typing = true;
      let i = 0;
      const tick = () => {
        if (i < full.length) {
          this.typedTagline += full[i++];
          this._typeTimer = setTimeout(tick, 45);
        } else {
          this.typing = false;
        }
      };
      tick();
    },
    onNameClick() {
      clearTimeout(this._nameTimer);
      this._nameClicks++;
      if (this._nameClicks >= 3) {
        this._nameClicks = 0;
        window.dispatchEvent(new CustomEvent('portfolio:matrix'));
      } else {
        this._nameTimer = setTimeout(() => { this._nameClicks = 0; }, 500);
      }
    },
    cycleTagline() {
      this.taglineIndex = (this.taglineIndex + 1) % this.taglines.length;
      clearTimeout(this._typeTimer);
      this.imageBounce = true;
      setTimeout(() => { this.imageBounce = false; }, 300);
      this.typeTagline();
    },
  },
};
</script>

<style scoped>
/* Styles specific to the profile header */
.mini-content {
  margin-bottom: 0.25rem;
  margin-top: 0.25rem;
}

.location {
  font-size: 0.9rem;
  line-height: 1rem;
  vertical-align: middle;
}

.image-container {
  display: flex;
  flex-direction: row;
  width: 180px;
  height: 180px;
  align-items: flex-end;
}

.left-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.social-link {
  font-size: 1.4rem;
  background-color: transparent;
  color: var(--accent-text-color);
  margin: 0 0.75rem 0 0;
  border-radius: 0;
  min-height: unset;
  min-width: unset;
  display: inline-flex;
  align-items: center;
  transition: color var(--transition-duration) ease, transform 0.15s ease;
}

.social-link:hover {
  color: var(--link-color-hover);
  transform: translateY(-3px);
  box-shadow: none;
  background-color: transparent;
}

.social-links {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  padding: 0;
  margin-top: 0.5rem;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  box-shadow: 0 0 0 2px var(--border-color);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.profile-image:hover {
  box-shadow: 0 0 0 3px var(--link-color);
}

.profile-image.bounce {
  transform: scale(1.08);
}

.tagline {
  font-size: 0.85rem;
  color: var(--accent-text-color);
  font-style: italic;
  margin: 0 0 0.25rem;
  font-family: "Fira Mono", "Courier New", monospace;
}

.cursor {
  display: inline-block;
  animation: blink 0.7s step-end infinite;
  color: var(--link-color);
}

@keyframes blink {
  50% { opacity: 0; }
}

.status-pill {
  display: inline-block;
  margin-top: 0.75rem;
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  font-size: 0.72rem;
  color: var(--accent-text-color);
  background: var(--accent-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 0.2rem 0.65rem;
  letter-spacing: 0.03em;
}

.left-side h2 {
  font-family: "Merriweather", Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.mini-content p {
  font-size: 0.9rem;
  color: var(--accent-text-color);
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .home {
    padding: 2rem;
  }

  .main-content {
    padding-right: 0;
  }

  .image-container {
    position: static;
    width: 140px;
    height: 140px;
    margin: 0 auto 1.5rem;
    order: -1;
  }

  header {
    flex-direction: column;
    align-items: center;
  }

  .left-side {
    align-items: center;
    text-align: center;
    margin-bottom: 1rem;
  }

  .tech-buttons {
    justify-content: center;
  }

  .tech-list {
    justify-content: center;
  }
}
</style>
