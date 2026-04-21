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
      <img
        src="@/assets/icons/RedHeart.png"
        alt="Red Heart"
        width="23"
        height="23"
      />
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterSection",
};
</script>

<style scoped>
/* Styles for footer section */
.footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
}

[data-theme="light"] .footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000000;
}

.footer b {
  color: #ffffff;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
}

[data-theme="light"] .footer b {
  color: #000000;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
}

img {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  vertical-align: middle;
}
</style>
