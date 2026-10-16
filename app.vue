<template>
  <NuxtRouteAnnouncer />
  <Home style="position: relative; z-index: 2" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const wallpaperActive = ref(false);

onMounted(() => {
  // Scroll reveal. Sections already on screen are left untouched (they're visible in the
  // server-rendered HTML, so first paint isn't gated on hydration); only sections below the
  // fold are hidden and faded in as they scroll into view.
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove('reveal-pending');
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('section').forEach((s) => {
    if (s.getBoundingClientRect().top < window.innerHeight) {
      s.classList.add('revealed');
    } else {
      s.classList.add('reveal-pending');
      obs.observe(s);
    }
  });

  // Console easter egg
  console.log(
    '%c\n  ╔══════════════════════════════════════╗\n  ║  hey. you opened devtools.           ║\n  ║  respect.                            ║\n  ║                                      ║\n  ║  github.com/shaswata56               ║\n  ║  shaswata.me                         ║\n  ╚══════════════════════════════════════╝\n',
    'color: #c4a67a; font-family: monospace; font-size: 12px;'
  );

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:100%;background:var(--link-color);z-index:9999;transform-origin:0 0;transform:scaleX(0);will-change:transform;pointer-events:none';
  document.body.appendChild(bar);
  let barTicking = false;
  window.addEventListener('scroll', () => {
    if (barTicking) return;
    barTicking = true;
    requestAnimationFrame(() => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${Math.min(pct, 1)})`;
      barTicking = false;
    });
  }, { passive: true });

  // Triple-click name → matrix rain
  window.addEventListener('portfolio:matrix', () => triggerMatrixRain());

  // Right-click profile picture → liquid metal
  window.addEventListener('portfolio:liquidmetal', () => showWallpaperForced());

  // Game button → hyperspace warp into the arcade
  window.addEventListener('portfolio:arcade', () => warpToArcade());

  // Seedling button → a seed falls and sprouts; it grows you into the garden
  window.addEventListener('portfolio:garden', () => bloomToGarden());

  function warpToArcade() {
    if ((window as any).__ceremony || (window as any).__arcadeWarp) return;
    (window as any).__ceremony = true;   // one ceremony at a time, site-wide
    (window as any).__arcadeWarp = true;
    let cancelled = false;   // a bfcache restore (Back during the warp) cancels the ceremony instead of finishing it
    const go = () => { if (!cancelled) window.location.href = 'arcade.html'; };
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#04030e;opacity:0;transition:opacity .25s ease;overflow:hidden';
    const label = document.createElement('div');
    label.innerHTML = '<div class="warp-line">ENTERING&nbsp;ARCADE</div><div class="warp-sub">initializing sector //ARCADE</div>';
    label.style.cssText = 'position:absolute;left:0;right:0;bottom:16%;text-align:center;color:#00e5ff;font-family:"Fira Mono","Courier New",monospace;letter-spacing:4px;text-shadow:0 0 18px rgba(0,229,255,.6);z-index:2';
    overlay.appendChild(label);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    // bfcache: Back during the warp restores this page with the overlay up and the rAF
    // frozen — tear the overlay down, release the ceremony flags, and let the loop die
    // so the dice button works again without a reload.
    window.addEventListener('pageshow', (ev) => {
      if (ev.persisted) {
        cancelled = true;
        overlay.remove();
        (window as any).__ceremony = false;
        delete (window as any).__arcadeWarp;
      }
    }, { once: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTimeout(go, 320); return; }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    const ctx = c.getContext('2d')!; ctx.scale(dpr, dpr);
    overlay.insertBefore(c, label);

    const cols = ['#00e5ff', '#ff2d95', '#b14bff'];
    const N = 340, stars: any[] = [];
    for (let i = 0; i < N; i++) stars.push({ x: (Math.random() - 0.5) * innerWidth, y: (Math.random() - 0.5) * innerHeight, z: Math.random() * innerWidth, pz: 0, c: cols[i % 3] });
    const t0 = performance.now(), dur = 1400;
    const W = () => innerWidth, H = () => innerHeight, cx = () => innerWidth / 2, cy = () => innerHeight / 2;

    function frame(now: number) {
      if (cancelled) return;
      const t = Math.min(1, (now - t0) / dur);
      const speed = 6 + t * t * 130;
      ctx.fillStyle = 'rgba(4,3,14,' + (0.22 + 0.22 * t) + ')'; ctx.fillRect(0, 0, W(), H());
      ctx.lineCap = 'round';
      for (const s of stars) {
        s.pz = s.z; s.z -= speed;
        if (s.z < 1) { s.z = W(); s.x = (Math.random() - 0.5) * innerWidth; s.y = (Math.random() - 0.5) * innerHeight; s.pz = s.z; }
        const k = 130;
        const sx = cx() + s.x / s.z * k, sy = cy() + s.y / s.z * k;
        const px = cx() + s.x / s.pz * k, py = cy() + s.y / s.pz * k;
        const a = Math.min(1, (1 - s.z / W()) * 1.3);
        ctx.strokeStyle = s.c; ctx.globalAlpha = a; ctx.lineWidth = Math.max(.6, (1 - s.z / W()) * 2.6);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const gg = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), 120 + t * 280);
      gg.addColorStop(0, 'rgba(0,229,255,' + (0.05 + 0.55 * t) + ')'); gg.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W(), H());
      if (t >= 1) {
        const fl = document.createElement('div');
        fl.style.cssText = 'position:absolute;inset:0;background:#dffaff;opacity:0;transition:opacity .16s ease;z-index:3';
        overlay.appendChild(fl); requestAnimationFrame(() => { fl.style.opacity = '0.85'; });
        if (!cancelled) setTimeout(go, 170);
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function bloomToGarden() {
    if ((window as any).__ceremony || (window as any).__gardenBloom) return;
    (window as any).__ceremony = true;   // one ceremony at a time, site-wide
    (window as any).__gardenBloom = true;
    let cancelled = false;   // a bfcache restore (Back during the bloom) cancels the ceremony instead of finishing it
    const go = () => { if (!cancelled) window.location.href = '/garden/'; };
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#04100a;opacity:0;transition:opacity .25s ease;overflow:hidden';
    const label = document.createElement('div');
    label.innerHTML = '<div class="warp-line">ENTERING&nbsp;THE&nbsp;GARDEN</div><div class="warp-sub">germinating //GARDEN</div>';
    label.style.cssText = 'position:absolute;left:0;right:0;bottom:16%;text-align:center;color:#a7e8c4;font-family:"Fira Mono","Courier New",monospace;letter-spacing:4px;text-shadow:0 0 18px rgba(167,232,196,.6);z-index:2';
    overlay.appendChild(label);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    // bfcache: Back during the bloom restores this page with the overlay up and the rAF
    // frozen — tear the overlay down, release the ceremony flags, and let the loop die
    // so the seedling button works again without a reload.
    window.addEventListener('pageshow', (ev) => {
      if (ev.persisted) {
        cancelled = true;
        overlay.remove();
        (window as any).__ceremony = false;
        delete (window as any).__gardenBloom;
      }
    }, { once: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTimeout(go, 320); return; }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    const ctx = c.getContext('2d')!; ctx.scale(dpr, dpr);
    overlay.insertBefore(c, label);

    // motes converge on the landing point; a glowing seed falls; then it sprouts
    const N = 90, motes: any[] = [];
    for (let i = 0; i < N; i++) motes.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: .6 + Math.random() * 1.6, ph: Math.random() * 6.28 });
    const stems = 5;
    const t0 = performance.now(), dur = 1500;
    const W = () => innerWidth, H = () => innerHeight, cx = () => innerWidth / 2, cy = () => innerHeight * .52;
    const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);

    function frame(now: number) {
      if (cancelled) return;
      const t = Math.min(1, (now - t0) / dur);
      ctx.fillStyle = 'rgba(4,16,10,.28)'; ctx.fillRect(0, 0, W(), H());
      ctx.fillStyle = '#b9f0d2';
      for (const m of motes) {
        const pull = t * .4;
        const x = m.x + (cx() - m.x) * pull + Math.sin(now / 700 + m.ph) * 6 * (1 - t);
        const y = m.y + (cy() - m.y) * pull + Math.cos(now / 900 + m.ph) * 6 * (1 - t);
        ctx.globalAlpha = Math.max(0, .18 + .5 * (1 - Math.hypot(x - cx(), y - cy()) / W()));
        ctx.beginPath(); ctx.arc(x, y, m.r * (1 + t * .4), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      const fall = Math.min(1, t / .45);
      const gy = fall >= 1 ? cy() : (-H() * .08 + (cy() + H() * .08) * fall * fall);
      const sx = cx() + Math.sin(fall * 3.1) * 14 * (1 - fall);
      if (fall < 1) {
        const trail = ctx.createLinearGradient(sx, gy - 90, sx, gy);
        trail.addColorStop(0, 'rgba(167,232,196,0)'); trail.addColorStop(1, 'rgba(167,232,196,.55)');
        ctx.strokeStyle = trail; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(sx, gy - 90); ctx.lineTo(sx, gy); ctx.stroke();
      }
      const gr = Math.max(0, (t - .42) / .58);
      if (gr > 0) {
        const e = easeOut(gr);
        for (let i = 0; i < stems; i++) {
          const a = -Math.PI / 2 + (i - (stems - 1) / 2) * .55 + Math.sin(now / 560 + i * 1.7) * .07;
          const len = (H() * .22 + i * H() * .02) * e;
          const ex = cx() + Math.cos(a) * len, ey = cy() + Math.sin(a) * len;
          const mx = cx() + Math.cos(a) * len * .5 - Math.sin(a) * len * .22;
          const my = cy() + Math.sin(a) * len * .5 + Math.cos(a) * len * .22;
          ctx.strokeStyle = 'rgba(185,240,210,.9)'; ctx.lineWidth = 2.1; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(cx(), cy()); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
          const bud = ctx.createRadialGradient(ex, ey, 0, ex, ey, 9);
          bud.addColorStop(0, 'rgba(234,255,242,.95)'); bud.addColorStop(1, 'rgba(167,232,196,0)');
          ctx.fillStyle = bud; ctx.beginPath(); ctx.arc(ex, ey, 9, 0, 6.283); ctx.fill();
        }
      }
      const glowR = 18 + (gr > 0 ? easeOut(gr) * 30 : 0);
      const g = ctx.createRadialGradient(sx, gy, 0, sx, gy, glowR);
      g.addColorStop(0, 'rgba(234,255,242,' + (.8 + .2 * t) + ')'); g.addColorStop(1, 'rgba(167,232,196,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, gy, glowR, 0, 6.283); ctx.fill();
      const amb = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), 140 + t * 340);
      amb.addColorStop(0, 'rgba(167,232,196,' + (.06 + .4 * t) + ')'); amb.addColorStop(1, 'rgba(167,232,196,0)');
      ctx.fillStyle = amb; ctx.fillRect(0, 0, W(), H());
      if (t >= 1) {
        const fl = document.createElement('div');
        fl.style.cssText = 'position:absolute;inset:0;background:#eafff2;opacity:0;transition:opacity .16s ease;z-index:3';
        overlay.appendChild(fl); requestAnimationFrame(() => { fl.style.opacity = '0.85'; });
        if (!cancelled) setTimeout(go, 470);   // hold the sprout's final pose a beat before the flash hands off to the garden
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

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

  const removeWallpaperEl = () => {
    const existing = document.getElementById('wallpaper-element');
    if (existing) existing.remove();
  };

  const showWallpaper = () => {
    if (!checkAllSectionsMoved() || wallpaperActive.value) return;
    wallpaperActive.value = true;

    const wp = document.createElement('shader-wallpaper');
    wp.id = 'wallpaper-element';
    wp.setAttribute('preset', 'metal');
    wp.setAttribute('intensity', '0.7');
    wp.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9998;opacity:0;transition:opacity 0.6s ease;pointer-events:auto';
    document.body.appendChild(wp);
    requestAnimationFrame(() => { wp.style.opacity = '1'; });

    document.body.classList.add('wallpaper-active');
    showGlobalToast('all sections aligned.');

    setTimeout(() => {
      wp.style.opacity = '0';
      document.body.classList.remove('wallpaper-active');
      setTimeout(() => {
        removeWallpaperEl();
        wallpaperActive.value = false;
      }, 600);
    }, 10000);
  };

  const showWallpaperForced = () => {
    if (wallpaperActive.value) return;
    wallpaperActive.value = true;

    const wp = document.createElement('shader-wallpaper');
    wp.id = 'wallpaper-element';
    wp.setAttribute('preset', 'metal');
    wp.setAttribute('intensity', '0.7');
    wp.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9998;opacity:0;transition:opacity 0.6s ease;pointer-events:auto';
    document.body.appendChild(wp);
    requestAnimationFrame(() => { wp.style.opacity = '1'; });

    document.body.classList.add('wallpaper-active');
    showGlobalToast('liquid metal activated.');

    setTimeout(() => {
      wp.style.opacity = '0';
      document.body.classList.remove('wallpaper-active');
      setTimeout(() => {
        removeWallpaperEl();
        wallpaperActive.value = false;
      }, 600);
    }, 10000);
  };

  const hideWallpaper = () => {
    if (!wallpaperActive.value) return;
    wallpaperActive.value = false;
    document.body.classList.remove('wallpaper-active');
    removeWallpaperEl();
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
    handle.style.touchAction = 'none';

    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
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

  window.addEventListener('pointermove', (e) => {
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

  const endDrag = () => {
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
  };

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

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
      "http-equiv": "Content-Security-Policy",
      content:
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cloud.umami.is; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://cloud.umami.is; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
    },
    {
      name: "description",
      content:
        "Portfolio of Shaswata Das. Software Engineer, Developer, Hacker. Currently Software Engineer at Orbitax Bangladesh Limited, sister concern of Orbitax LLC. B.Eng from Shahjalal University of Science and Technology, Sylhet, Bangladesh.",
    },
  ],
  htmlAttrs: {
    lang: "en",
  },
  link: [
    // Inter carries most of the body text; Merriweather (headings, 180 KB) is left to load normally
    { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/inter-latin.woff2", crossorigin: "anonymous" },
    {
      rel: "icon",
      type: "image/icon",
      href: "/favicon.ico?v=2",
    },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2" },
    { rel: "manifest", href: "/site.webmanifest" },
  ],
  script: [
    {
      src: "https://cloud.umami.is/script.js",
      defer: true,
      "data-website-id": "62618430-ebcb-4777-a26f-fc295df24b26",
    },
  ],
});
useSeoMeta({
  title: "Shaswata Das",
  ogTitle: "Shaswata Das",
  description:
    "Portfolio of Shaswata Das. Software Engineer, Developer, Hacker. Currently Software Engineer at Orbitax Bangladesh Limited, sister concern of Orbitax LLC. B.Eng from Shahjalal University of Science and Technology, Sylhet, Bangladesh.",
  ogDescription:
    "Portfolio of Shaswata Das. Software Engineer, Developer, Hacker. Currently Software Engineer at Orbitax Bangladesh Limited, sister concern of Orbitax LLC. B.Eng from Shahjalal University of Science and Technology, Sylhet, Bangladesh.",
  ogImage: "https://shaswata.me/og-image.jpg",
  ogUrl: "https://shaswata.me",
  twitterCard: "summary_large_image",
  twitterTitle: "Shaswata Das",
  twitterDescription: "Portfolio of Shaswata Das",
  twitterImage:
    "https://shaswata.me/og-image.jpg",
});
</script>


<style>

:root {
  --background-color: #1a1917;
  --accent-color: #242220;
  --border-color: #4a4440;
  --link-color: #c4a67a;
  --text-color: #d4c9bb;
  --accent-text-color: #9c8c7a;
  --link-color-hover: #d9bc94;
  --text-color-secondary: #9c8c7a;
  --box-shadow: none;
  --transition-duration: 0.2s;
}

[data-theme="light"] {
  --background-color: #faf9f7;
  --accent-color: #f0ece6;
  --border-color: #d6cfc8;
  --link-color: #a07840;
  --text-color: #2a2420;
  --accent-text-color: #705f4f;
  --link-color-hover: #c4891e;
  --text-color-secondary: #705f4f;
  --box-shadow: none;
}

html,
body {
  margin: 0;
  padding: 0;
  overflow-x: clip;
  font-family: "Merriweather", "Merriweather Fallback", Georgia, serif;
  font-weight: 400;
  font-size: 16px;
  color: var(--text-color);
  background-color: var(--background-color);
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

.section > a > h2,
section > a > h2 {
  font-size: 1.5rem;
  letter-spacing: -0.01em;
}

/* No text-align here: this unlayered rule outranks Tailwind v4's layered
   utilities, and an explicit left silently defeated `text-center` on the
   hero subtitle/tagline inside the mobile centering media query. */
p {
  color: var(--text-color);
  line-height: 1.8;
  font-size: 1rem;
  margin: 0 0 1rem;
}

section {
  margin-bottom: 2rem;
  transition: opacity 0.45s ease, transform 0.45s ease;
}

section.reveal-pending {
  opacity: 0;
  transform: translateY(8px);
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
  font-family: "Merriweather", "Merriweather Fallback", Georgia, serif;
}

h3 {
  font-family: "Inter", "Inter Fallback", "ui-sans-serif", system-ui, sans-serif;
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
  transition: opacity 0.35s ease, transform 0.35s ease;
}

section.reveal-pending .project-row,
section.reveal-pending .hobby-item,
section.reveal-pending .tech-item,
section.reveal-pending .experience-item,
section.reveal-pending .education-item {
  opacity: 0;
  transform: translateY(6px);
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

body.wallpaper-active,
html:has(body.wallpaper-active) {
  overflow: hidden !important;
}

body.wallpaper-active > *:not(#wallpaper-element) {
  visibility: hidden !important;
}

.warp-line { font-size: clamp(20px, 4vw, 34px); font-weight: 700; }
.warp-sub { font-size: 12px; opacity: .7; margin-top: 8px; animation: warpblink 1s step-end infinite; }
@keyframes warpblink { 50% { opacity: .2; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
