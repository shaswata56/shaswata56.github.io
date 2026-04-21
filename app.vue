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
@import url("https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap");
@import url("https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css");

:root {
  --background-color: #1c1b19;
  --accent-color: #3a3432;
  --border-color: #6d4f3a;
  --link-color: #9e8a6d;
  --text-color: #d3c8bd;
  --accent-text-color: #d3c8bd;
  --link-color-hover: #c4a67a;
  --box-shadow: 0 5px 10px rgba(210, 190, 170, 0.2);
  --transition-duration: 0.3s;
}

[data-theme="light"] {
  --background-color: #f7f9fb; /* Soft light blue for a clean base */
  --accent-color: #dce7f2; /* Muted cool blue for accents */
  --border-color: #a5c3dc; /* Mid-tone blue for subtle contrast */
  --link-color: #7894ac; /* Deep blue for links */
  --text-color: #35475a; /* Dark blue-gray for readable text */
  --accent-text-color: #5c7d99; /* Cool, muted blue-gray for emphasis */
  --link-color-hover: #4685ac;
  --box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: "Fira Mono", Consolas, Liberation Mono, monospace;
  font-weight: 400;
  font-size: 12px;
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
  color: var(--link-color-hover);
  margin-bottom: 1rem;
  font-weight: 600;
}

h2 {
  color: #ffffff;
}

[data-theme="light"] h2 {
  color: #000000;
}

p {
  color: var(--text-color);
  line-height: 1.3;
  font-size: 14px;
  margin: 0 0 10px;
  text-align: justify;
}

section {
  margin-bottom: 2rem;
}

.name,
h3 {
  font-family: "ui-sans-serif", system-ui, sans-serif, Apple Color Emoji,
    Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
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
