<template>
  <NuxtRouteAnnouncer />
  <Home />
</template>

<script setup lang="ts">
useHead({
  title: "Shaswata Das",
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    {
      name: "description",
      content:
        "Portfolio of Shaswata Das. Software Enginner, Developer, Hacker. Currently Software Engineer at Orbitax Bangladesh Limited, sister concern of Orbitax LLC. B.Eng from Shahjalal University of Science and Technology, Sylhet, Bangladesh.",
    },
  ],
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "icon",
      type: "image/icon",
      href: "/favicon.ico",
    },
  ],
});
useSeoMeta({
  title: "Shaswata Das",
  ogTitle: "Shaswata Das",
  description:
    "Portfolio of Shaswata Das. Software Enginner, Developer, Hacker. Currently Software Engineer at Orbitax Bangladesh Limited, sister concern of Orbitax LLC. B.Eng from Shahjalal University of Science and Technology, Sylhet, Bangladesh.",
  ogDescription:
    "Portfolio of Shaswata Das. Software Enginner, Developer, Hacker. Currently Software Engineer at Orbitax Bangladesh Limited, sister concern of Orbitax LLC. B.Eng from Shahjalal University of Science and Technology, Sylhet, Bangladesh.",
  ogImage: "https://shaswata56.github.io/assets/profile_picture.DNMGGUvM.jpg",
  ogUrl: "shaswata56.github.io",
  twitterCard: "summary_large_image",
  twitterTitle: "Shaswata Das",
  twitterDescription: "Portfolio of Shaswata Das",
  twitterImage:
    "https://shaswata56.github.io/assets/profile_picture.DNMGGUvM.jpg",
});
</script>


<style>
@import url("https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
@import url("https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css");

:root {
  --background-color: #1a1917;
  --accent-color: #242220;
  --border-color: #4a4440;
  --link-color: #c4a67a;
  --text-color: #d4c9bb;
  --accent-text-color: #7a6a5a;
  --link-color-hover: #d9bc94;
  --text-color-secondary: #7a6a5a;
  --box-shadow: none;
  --transition-duration: 0.2s;
}

[data-theme="light"] {
  --background-color: #faf9f7;
  --accent-color: #f0ece6;
  --border-color: #d6cfc8;
  --link-color: #a07840;
  --text-color: #2a2420;
  --accent-text-color: #7a6a5a;
  --link-color-hover: #c4891e;
  --text-color-secondary: #7a6a5a;
  --box-shadow: none;
}

html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: "Merriweather", Georgia, serif;
  font-weight: 400;
  font-size: 16px;
  color: var(--text-color);
  background-color: var(--background-color);
  scroll-behavior: smooth;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

::-moz-selection {
  color: var(--background-color);
  background: var(--border-color);
}

::selection {
  color: var(--background-color);
  background: var(--border-color);
}

a {
  color: var(--link-color);
  text-decoration: none;
  transition: color var(--transition-duration) ease;
}

a:hover {
  color: var(--link-color-hover);
  text-decoration: none;
}

h1,
h2,
h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
  font-weight: 600;
}

p {
  color: var(--text-color);
  line-height: 1.8;
  font-size: 1rem;
  margin: 0 0 1rem;
  text-align: left;
}

section {
  margin-bottom: 2rem;
}

.name {
  font-family: "Merriweather", Georgia, serif;
}

h3 {
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
}

::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	border-radius: 13px;
	background-color: var(--background-color);
}

::-webkit-scrollbar
{
	width: 12px;
	background-color: var(--background-color);
}

::-webkit-scrollbar-thumb
{
	border-radius: 13px;
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
	background-color: var(--accent-text-color);
}
</style>
