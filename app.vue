<template>
  <NuxtRouteAnnouncer />
  <shader-wallpaper
    id="wallpaper-element"
    preset="plasma"
    intensity="0.7"
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; opacity: 0; transition: opacity 0.6s ease; pointer-events: none"
  ></shader-wallpaper>
  <Home style="position: relative; z-index: 2" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const wallpaperActive = ref(false);

onMounted(() => {
  // Scroll reveal
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('section').forEach((s) => obs.observe(s));

  // Console easter egg
  console.log(
    '%c\n  ╔══════════════════════════════════════╗\n  ║  hey. you opened devtools.           ║\n  ║  respect.                            ║\n  ║                                      ║\n  ║  github.com/shaswata56               ║\n  ║  shaswata.me                         ║\n  ╚══════════════════════════════════════╝\n',
    'color: #c4a67a; font-family: monospace; font-size: 12px;'
  );

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:0%;background:var(--link-color);z-index:9999;transition:width 0.1s linear;pointer-events:none';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });

  // Triple-click name → matrix rain
  window.addEventListener('portfolio:matrix', () => triggerMatrixRain());

  // Type "sudo" anywhere → matrix rain
  let sudoBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    sudoBuffer = (sudoBuffer + e.key).slice(-4);
    if (sudoBuffer === 'sudo') { sudoBuffer = ''; triggerMatrixRain(); }
  });

  function triggerMatrixRain() {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;pointer-events:none';
    c.width = window.innerWidth; c.height = window.innerHeight;
    document.body.appendChild(c);
    const cx = c.getContext('2d');
    const cols = Math.floor(c.width / 16);
    const drops = Array(cols).fill(1);
    const chars = 'ABCDEF0123456789アイウエオカキクケコ';
    let elapsed = 0;
    const rain = setInterval(() => {
      elapsed += 50;
      cx.fillStyle = 'rgba(26,25,23,0.05)';
      cx.fillRect(0, 0, c.width, c.height);
      cx.fillStyle = '#c4a67a';
      cx.font = '14px monospace';
      drops.forEach((y, i) => {
        cx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
        if (y * 16 > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      if (elapsed >= 3000) {
        clearInterval(rain);
        c.style.transition = 'opacity 0.5s ease';
        c.style.opacity = '0';
        setTimeout(() => c.remove(), 500);
      }
    }, 50);
    showGlobalToast('cheat code activated.');
  }

  // Load shader-wallpaper script
  const scriptTag = document.createElement('script');
  scriptTag.src = '/shader-wallpaper.global.js';
  scriptTag.onload = () => {
    // Script loaded, wallpaper element now available
  };
  document.head.appendChild(scriptTag);

  const checkAllSectionsMoved = () => {
    const allSectionIds = Array.from(document.querySelectorAll('section[id]')).map(s => (s as HTMLElement).id);
    return allSectionIds.length > 0 && allSectionIds.every(id => {
      const pos = savedPos[id];
      return pos && (pos.x !== 0 || pos.y !== 0);
    });
  };

  const showWallpaper = () => {
    if (checkAllSectionsMoved()) {
      const wp = document.getElementById('wallpaper-element') as HTMLElement;
      if (wp && !wallpaperActive.value) {
        wallpaperActive.value = true;
        wp.style.opacity = '1';
        wp.style.pointerEvents = 'auto';
        document.body.classList.add('hide-text');
        showGlobalToast('all sections aligned.');

        setTimeout(() => {
          wp.style.opacity = '0';
          wp.style.pointerEvents = 'none';
          document.body.classList.remove('hide-text');
          wallpaperActive.value = false;
        }, 20000);
      }
    }
  };

  const hideWallpaper = () => {
    const wp = document.getElementById('wallpaper-element') as HTMLElement;
    if (wp && wallpaperActive.value) {
      wallpaperActive.value = false;
      wp.style.opacity = '0';
      wp.style.pointerEvents = 'none';
      document.body.classList.remove('hide-text');
    }
  };

  // Draggable sections — drag by h2 heading
  const savedPos: Record<string, {x:number,y:number}> = JSON.parse(localStorage.getItem('section-positions') || '{}');
  let activeDrag: { section: HTMLElement, handle: HTMLElement, sx: number, sy: number, cx: number, cy: number } | null = null;

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'reset layout';
  resetBtn.style.cssText = 'position:fixed;bottom:1.75rem;left:1.5rem;background:var(--accent-color);border:1px solid var(--border-color);color:var(--accent-text-color);font-family:"Fira Mono","Courier New",monospace;font-size:0.68rem;padding:0.35rem 0.75rem;border-radius:999px;cursor:pointer;z-index:200;opacity:0;pointer-events:none;transition:opacity 0.3s ease';
  document.body.appendChild(resetBtn);

  const updateResetBtn = () => {
    const anyMoved = Object.values(savedPos).some(p => p.x !== 0 || p.y !== 0);
    resetBtn.style.opacity = anyMoved ? '1' : '0';
    resetBtn.style.pointerEvents = anyMoved ? 'all' : 'none';
  };

  document.querySelectorAll<HTMLElement>('section[id]').forEach(section => {
    const id = section.id;
    const handle = section.querySelector<HTMLElement>('a h2');
    if (!handle) return;

    const init = savedPos[id] ?? { x: 0, y: 0 };
    if (init.x || init.y) section.style.transform = `translate(${init.x}px,${init.y}px)`;

    handle.style.cursor = 'grab';
    handle.title = 'drag to move · double-click to reset';

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const cx = savedPos[id]?.x ?? 0;
      const cy = savedPos[id]?.y ?? 0;
      activeDrag = { section, handle, sx: e.clientX - cx, sy: e.clientY - cy, cx, cy };
      handle.style.cursor = 'grabbing';
      section.style.transition = 'opacity 0.45s ease';
      section.style.zIndex = '50';
      showWallpaper();
    });

    handle.closest('a')?.addEventListener('click', (e) => {
      if (activeDrag || (savedPos[id] && (savedPos[id].x !== 0 || savedPos[id].y !== 0))) {
        e.preventDefault();
      }
    });

    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      section.style.transition = 'transform 0.35s ease, opacity 0.45s ease';
      section.style.transform = 'translate(0,0)';
      section.style.zIndex = '';
      delete savedPos[id];
      localStorage.setItem('section-positions', JSON.stringify(savedPos));
      updateResetBtn();
    });
  });

  window.addEventListener('mousemove', (e) => {
    if (!activeDrag) return;
    activeDrag.cx = e.clientX - activeDrag.sx;
    activeDrag.cy = e.clientY - activeDrag.sy;
    activeDrag.section.style.transform = `translate(${activeDrag.cx}px,${activeDrag.cy}px)`;
  });

  // Reset layout button click handler
  updateResetBtn();

  resetBtn.addEventListener('click', () => {
    document.querySelectorAll<HTMLElement>('section[id]').forEach(s => {
      s.style.transition = 'transform 0.4s ease, opacity 0.45s ease';
      s.style.transform = 'translate(0,0)';
      s.style.zIndex = '';
      const h = s.querySelector<HTMLElement>('a h2');
      if (h) h.style.cursor = 'grab';
    });
    Object.keys(savedPos).forEach(k => delete savedPos[k]);
    localStorage.removeItem('section-positions');
    updateResetBtn();
    hideWallpaper();
  });

  window.addEventListener('mouseup', () => {
    if (!activeDrag) return;
    const { section, handle, cx, cy } = activeDrag;
    const id = section.id;
    handle.style.cursor = 'grab';
    section.style.zIndex = '';
    savedPos[id] = { x: cx, y: cy };
    localStorage.setItem('section-positions', JSON.stringify(savedPos));
    activeDrag = null;
    updateResetBtn();
    showWallpaper();
  });

  // Idle 60s toast
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  const resetIdle = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => showGlobalToast('still there?', true), 60000);
  };
  window.addEventListener('mousemove', resetIdle, { passive: true });
  window.addEventListener('keydown', resetIdle);
  resetIdle();

  function showGlobalToast(msg: string, center = false) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `position:fixed;${center ? 'bottom:2rem;left:50%;transform:translateX(-50%)' : 'bottom:4.5rem;right:1.5rem'};background:var(--accent-color);border:1px solid var(--link-color);color:var(--link-color);font-family:"Fira Mono","Courier New",monospace;font-size:0.78rem;padding:0.5rem 0.9rem;border-radius:6px;z-index:500;pointer-events:none;opacity:0;transition:opacity 0.3s ease`;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    const dismiss = () => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
      window.removeEventListener('mousemove', dismiss);
      window.removeEventListener('keydown', dismiss);
    };
    if (center) {
      window.addEventListener('mousemove', dismiss, { once: true, passive: true });
      window.addEventListener('keydown', dismiss, { once: true });
    } else {
      setTimeout(dismiss, 2800);
    }
  }
});

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
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

section.revealed {
  opacity: 1;
  transform: none;
}

section > a {
  display: inline-block;
  text-decoration: none;
}

section > a h2::before {
  content: '·';
  color: var(--link-color);
  margin-right: 0.4rem;
  font-weight: 400;
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

/* Stagger children when parent section reveals */
.project-row,
.hobby-item,
.tech-item,
.experience-item,
.education-item {
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

section.revealed .project-row,
section.revealed .hobby-item,
section.revealed .tech-item,
section.revealed .experience-item,
section.revealed .education-item {
  opacity: 1;
  transform: none;
}

/* Stagger delays */
.project-row:nth-child(1)  { transition-delay: 0.05s; }
.project-row:nth-child(2)  { transition-delay: 0.10s; }
.project-row:nth-child(3)  { transition-delay: 0.15s; }
.project-row:nth-child(4)  { transition-delay: 0.20s; }
.project-row:nth-child(5)  { transition-delay: 0.25s; }

.hobby-item:nth-child(1)   { transition-delay: 0.04s; }
.hobby-item:nth-child(2)   { transition-delay: 0.08s; }
.hobby-item:nth-child(3)   { transition-delay: 0.12s; }
.hobby-item:nth-child(4)   { transition-delay: 0.16s; }
.hobby-item:nth-child(5)   { transition-delay: 0.20s; }
.hobby-item:nth-child(6)   { transition-delay: 0.24s; }
.hobby-item:nth-child(7)   { transition-delay: 0.28s; }
.hobby-item:nth-child(8)   { transition-delay: 0.32s; }

.experience-item:nth-child(1) { transition-delay: 0.05s; }
.experience-item:nth-child(2) { transition-delay: 0.12s; }
.experience-item:nth-child(3) { transition-delay: 0.19s; }

.education-item:nth-child(1) { transition-delay: 0.05s; }
.education-item:nth-child(2) { transition-delay: 0.12s; }

body.hide-text, body.hide-text * {
  color: transparent !important;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
