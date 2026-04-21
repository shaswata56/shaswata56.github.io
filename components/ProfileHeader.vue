<template>
  <header class="flex items-start sm:items-center justify-between">
    <div class="left-side">
      <h2 class="text-3xl font-bold name">Shaswata Das</h2>
      <div class="mini-content">
        <p class="text-base">Software Engineer & Hacker</p>
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
    </div>
    <div class="image-container">
      <img
        src="@/assets/images/profile_picture.jpg"
        alt="Shaswata Das"
        class="profile-image"
      />
    </div>
  </header>
</template>

<script>
export default {
  name: "ProfileHeader",
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
  width: 150px;
  height: 150px;
  align-items: flex-end;
}

.left-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.social-link {
  font-size: 27px;
  background-color: var(--accent-color);
  color: var(--accent-text-color);
  margin: 0 4px 0 0;
  border-radius: 5px;
  display: flex;
  min-height: 36px;
  min-width: 36px;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.social-link:hover {
  transform: translateY(-1px);
  box-shadow: var(--box-shadow);
  background-color: var(--link-color-hover);
  color: var(--accent-color);
}

.social-links {
  list-style-type: none;
  display: flex;
  flex-direction: row;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
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
