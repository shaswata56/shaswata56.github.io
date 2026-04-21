<template>
  <footer>
    <div class="footer">
      Made by
      <a
        href="https://github.com/shaswata56"
        target="_blank"
        rel="noopener noreferrer"
      >
        <b>Shaswata Das</b>
      </a>
      with Nuxt 3 and
      <span class="heart">
        <img
          src="@/assets/icons/RedHeart.png"
          alt="Red Heart"
          width="23"
          height="23"
        />
      </span>
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterSection",
};
</script>

<style scoped>
.footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.85rem;
  color: var(--accent-text-color);
  gap: 0.35rem;
}

.footer b,
.footer a {
  color: var(--accent-text-color);
  margin: 0 0.1rem;
}

.footer a:hover b {
  color: var(--link-color-hover);
}

img {
  margin: 0 0.25rem;
  vertical-align: middle;
}

.heart {
  display: inline-flex;
  align-items: center;
  animation: heartbeat 1.8s ease infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.25); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.1); }
}
</style>
