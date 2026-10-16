/* arcade-room.js — multiplayer presence orbs for the arcade hub (arcade.html).
 *
 * Visitors of the arcade see each other as small glowing orbs drifting in a
 * shared 3D space rendered with the vendored three.js r128. No names, no PII —
 * each visitor is a random id in localStorage and a hue hashed from it.
 *
 * Transport: supabase-js v2 Realtime PRESENCE + BROADCAST on one channel.
 * No database tables, no auth, anon public key only (RLS-safe by design).
 *
 * GRACEFUL DEGRADATION: everything below is wrapped so that any failure —
 * blocked websocket (ad-blockers), unreachable project, channel error,
 * 5s timeout, missing WebGL context — silently disables the feature and the
 * page behaves exactly as it did before. Nothing here can throw into the
 * host page (the boot sequence, games rail, etc. are untouched).
 *
 * Quota notes (Supabase Realtime free tier): each visitor broadcasts at most
 * 4 messages/sec ({i,p,h} ≈ 45 bytes; eventsPerSecond limit is 10) and
 * re-tracks presence at most 1×/sec; presence heartbeats are server-driven
 * (~1 keepalive per 25s per client). Worst case with the 50-orb cap ≈
 * 200 broadcasts/s ≈ 9 KB/s aggregate — comfortably inside the free tier
 * (2M realtime messages/month). three.js (~150 KB gz, already cached from the
 * games) is injected lazily, and only once another visitor is actually
 * present, so solo visitors pay nothing.
 */
(function () {
    'use strict';

    var SUPABASE_URL = 'https://zbdyvftkwapyockzxmwq.supabase.co'; // Personal org -> Portfolio project
    var SUPABASE_ANON_KEY = 'sb_publishable_3dfjDFiomVV4B1lGtz9YHA_8UAz0vy0'; // public-by-design publishable key
    var CHANNEL_NAME = 'shaswata-arcade';
    var MAX_ORBS = 50;            // concurrent remote orbs; newest beyond the cap are dropped
    var SEND_INTERVAL_MS = 250;   // position broadcast throttle ("at most every 250ms")
    var TRACK_INTERVAL_MS = 1000; // presence payload re-track (carries last pos for late joiners)
    var MOVE_EPSILON = 0.08;      // world units a position must move before it is worth sending
    var READY_TIMEOUT_MS = 5000;  // no presence sync within 5s → silently disable

    var SECTORS = 7;              // number of game cartridges (depth planes in the shared space)
    var X_SPAN = 5, Y_SPAN = 3;   // pointer maps to ±X_SPAN / ±Y_SPAN world units

    var visitorId = null, hue = 0, sb = null, channel = null;
    var ready = false, dead = false, sendTimer = 0, readyTimer = 0;
    var myPos = null, lastSentPos = null, lastSentAt = 0, lastTrackAt = 0;
    var sector = 0, px = 0, py = 0;
    var peers = {};               // visitorId -> { p:[x,y,z], h:hue }
    var hidden = false, threeState = null, threeLoading = false;
    var ui = { here: null, toggle: null };

    function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
    function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

    function hash(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
        return h;
    }
    function hashHue(s) { return ((hash(s) % 360) + 360) % 360; }

    function dist2(a, b) {
        var dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    function round3(n) { return Math.round(n * 1000) / 1000; }

    /* ---------- my position in the shared space ----------
     * The hub has no avatar/camera of its own — "where I am" is my pointer on
     * the page (x/y) plus the cartridge I'm browsing (depth plane). Browsing a
     * different game slides my orb to that sector; other visitors at the same
     * cartridge cluster at the same depth. Idle visitors keep a stable,
     * id-hashed home position so two people who never move still appear at
     * distinct spots. */
    function computePos() {
        return [
            round3(px * X_SPAN),
            round3(py * Y_SPAN),
            round3((sector - (SECTORS - 1) / 2) * 2)
        ];
    }

    function maybeSend() {
        if (!ready || dead || !myPos) return;
        var now = Date.now();
        if (lastSentPos && dist2(myPos, lastSentPos) < MOVE_EPSILON) return;   // not a meaningful move
        if (now - lastSentAt < SEND_INTERVAL_MS) return;                        // 250ms cap
        lastSentAt = now; lastSentPos = myPos.slice();
        try {
            var r = channel.send({ type: 'broadcast', event: 'pos', payload: { i: visitorId, p: lastSentPos, h: hue } });
            if (r && typeof r.catch === 'function') r.catch(function () { }); // never surface unhandled rejections
        } catch (e) { return; }
        if (now - lastTrackAt > TRACK_INTERVAL_MS) {  // presence payload carries last position for late joiners
            lastTrackAt = now;
            try {
                var t = channel.track({ p: lastSentPos, h: hue });
                if (t && typeof t.catch === 'function') t.catch(function () { });
            } catch (e2) { }
        }
    }

    /* ---------- presence ---------- */
    function peerCount() {
        var n = 0;
        for (var k in peers) if (Object.prototype.hasOwnProperty.call(peers, k)) n++;
        return n + 1; // + self
    }

    function sanPos(p) { // NaN/missing-safe [x,y,z]
        return [
            isFinite(+p[0]) ? +p[0] : 0,
            isFinite(+p[1]) ? +p[1] : 0,
            isFinite(+p[2]) ? +p[2] : 0
        ];
    }

    function applyPresenceState() {
        var state;
        try { state = channel.presenceState(); } catch (e) { return; }
        var fresh = {}, n = 0;
        for (var key in state) {
            if (!Object.prototype.hasOwnProperty.call(state, key) || key === visitorId) continue;
            if (n >= MAX_ORBS) break; // cap: drop newest beyond 50
            var arr = state[key];
            var pl = arr && arr.length ? arr[arr.length - 1] : null;
            if (pl && pl.p) { fresh[key] = { p: sanPos(pl.p), h: Number(pl.h) || hashHue(key) }; n++; }
        }
        peers = fresh;
        refreshUI();
        renderPeers();
    }

    function onJoin(ctx) {
        var key = ctx && ctx.key;
        if (!key || key === visitorId || dead) return;
        var arr = ctx.newPresences || [];
        var pl = arr.length ? arr[arr.length - 1] : null;
        if (pl && pl.p) {
            if (!peers[key] && orbCount() >= MAX_ORBS) { refreshUI(); return; } // cap: drop newest beyond 50
            peers[key] = { p: sanPos(pl.p), h: Number(pl.h) || hashHue(key) };
        }
        refreshUI();
        renderPeers();
    }

    function onLeave(ctx) {
        var key = ctx && ctx.key;
        if (!key) return;
        delete peers[key];
        refreshUI();
        renderPeers();
    }

    function onPos(msg) {
        var pl = msg && msg.payload;
        if (!pl || !pl.i || pl.i === visitorId || dead) return;
        var peer = peers[pl.i];
        if (!peer) return; // not joined yet; presence sync will add them
        peer.p = sanPos(pl.p);
        peer.h = Number(pl.h) || peer.h;
    }

    function refreshUI() {
        var n = peerCount();
        if (ui.here) {
            if (n >= 2) {
                ui.here.innerHTML = 'HERE NOW <b>' + n + '</b>';
                ui.here.hidden = false;
            } else {
                ui.here.hidden = true; // "N here now" hidden when N <= 1
            }
        }
        if (ui.toggle) ui.toggle.hidden = !(n >= 2 && ready); // nothing to toggle when you're alone
    }

    /* ---------- three.js r128 orb scene (lazy) ---------- */
    function orbCount() {
        var n = 0;
        for (var k in peers) if (Object.prototype.hasOwnProperty.call(peers, k)) n++;
        return n;
    }

    function loadThree(cb) {
        if (threeState) { cb(threeState); return; }
        if (threeLoading) return;
        threeLoading = true;
        var s = document.createElement('script');
        s.src = '/vendor/three.r128.min.js'; // same vendored build the games use (cached)
        s.onload = function () {
            try { cb(initThree()); } catch (e) { threeLoading = false; }
        };
        s.onerror = function () { threeLoading = false; }; // orbs just never appear; presence count still works
        document.head.appendChild(s);
    }

    function initThree() {
        var THREE = window.THREE;
        if (!THREE) { threeLoading = false; return null; }
        var canvas = document.createElement('canvas');
        canvas.id = 'orbs3d';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = 'position:fixed;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;';
        document.body.appendChild(canvas);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
        camera.position.set(0, 0, 14);

        // soft radial glow texture shared by all orb sprites (additive → emissive look, no lights)
        var texCanvas = document.createElement('canvas');
        texCanvas.width = texCanvas.height = 64;
        var tctx = texCanvas.getContext('2d');
        var g = tctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.25, 'rgba(255,255,255,.6)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        tctx.fillStyle = g;
        tctx.fillRect(0, 0, 64, 64);
        var glowTex = new THREE.CanvasTexture(texCanvas);

        var geo = new THREE.SphereGeometry(0.3, 14, 10); // r128 BufferGeometry-based
        var group = new THREE.Group();
        group.visible = !hidden;
        scene.add(group);

        function resize() {
            var w = window.innerWidth, h = window.innerHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / Math.max(1, h);
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', resize, { passive: true });
        resize();

        threeState = {
            THREE: THREE, renderer: renderer, scene: scene, camera: camera,
            group: group, geo: geo, glowTex: glowTex, orbs: {}, raf: 0, last: 0, phase: 0
        };
        return threeState;
    }

    function orbFor(t, key, hueDeg) {
        var THREE = t.THREE;
        var o = t.orbs[key];
        if (o) return o;
        var color = new THREE.Color().setHSL((hueDeg % 360) / 360, 0.85, 0.6);
        var core = new THREE.Mesh(t.geo, new THREE.MeshBasicMaterial({ color: color })); // emissive look without lights
        var glow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: t.glowTex, color: color.clone(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
        }));
        glow.scale.set(1.7, 1.7, 1);
        var holder = new THREE.Group();
        holder.add(core); holder.add(glow);
        t.group.add(holder);
        o = t.orbs[key] = { obj: holder, target: [0, 0, 0], phase: (hash(key) % 628) / 100 };
        return o;
    }

    function renderPeers() {
        if (dead || hidden || orbCount() === 0) { stopLoop(); if (threeState && threeState.group) threeState.group.visible = false; return; }
        loadThree(function (t) {
            if (!t || dead) return;
            threeLoading = false;
            t.group.visible = !hidden;
            // add/update orbs for current peers, drop the rest
            var keep = {};
            var n = 0;
            for (var key in peers) {
                if (!Object.prototype.hasOwnProperty.call(peers, key)) continue;
                if (++n > MAX_ORBS) break;
                keep[key] = true;
                var o = orbFor(t, key, peers[key].h);
                o.obj.visible = true;
                o.target = peers[key].p;
            }
            for (var k in t.orbs) {
                if (!keep[k]) {
                    t.group.remove(t.orbs[k].obj);
                    delete t.orbs[k];
                } else {
                    t.orbs[k].obj.visible = !!keep[k];
                }
            }
            startLoop();
        });
    }

    function startLoop() {
        var t = threeState;
        if (!t || t.raf || dead || hidden) return;
        t.last = performance.now();
        t.raf = requestAnimationFrame(tick);
    }
    function stopLoop() {
        if (threeState && threeState.raf) { cancelAnimationFrame(threeState.raf); threeState.raf = 0; }
    }
    function tick(now) {
        var t = threeState;
        if (!t) return;
        t.raf = 0;
        var dt = Math.min(0.05, (now - t.last) / 1000 || 0.016);
        t.last = now;
        var time = now / 1000;
        var k = 1 - Math.exp(-dt * 4); // exponential smoothing toward last broadcast position
        for (var key in t.orbs) {
            var o = t.orbs[key];
            o.obj.position.x += (o.target[0] - o.obj.position.x) * k;
            o.obj.position.z += (o.target[2] - o.obj.position.z) * k;
            var bob = Math.sin(time * 1.3 + o.phase) * 0.15; // gentle float bob
            o.obj.position.y += (o.target[1] + bob - o.obj.position.y) * k;
        }
        t.renderer.render(t.scene, t.camera);
        if (!dead && !hidden && t.group.visible) t.raf = requestAnimationFrame(tick);
    }

    /* ---------- connect / teardown ---------- */
    function connect() {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
            realtime: { params: { eventsPerSecond: 10 } }
        });
        channel = sb.channel(CHANNEL_NAME, {
            config: { presence: { key: visitorId }, broadcast: { self: false } }
        });
        channel.on('presence', { event: 'sync' }, function () {
            if (dead) return;
            if (!ready) {
                ready = true;
                if (readyTimer) { clearTimeout(readyTimer); readyTimer = 0; }
                maybeSend(); // announce immediately once live
            }
            applyPresenceState();
        });
        channel.on('presence', { event: 'join' }, onJoin);
        channel.on('presence', { event: 'leave' }, onLeave);
        channel.on('broadcast', { event: 'pos' }, onPos);
        channel.subscribe(function (status) {
            if (status === 'SUBSCRIBED') {
                try {
                    var tr = channel.track({ p: myPos || [0, 0, 0], h: hue });
                    if (tr && typeof tr.catch === 'function') tr.catch(function () { });
                } catch (e) { }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                teardown(); // silently degrade — site behaves as before
            }
        });
        readyTimer = setTimeout(function () { if (!ready) teardown(); }, READY_TIMEOUT_MS);
    }

    function teardown() {
        if (dead) return;
        dead = true;
        if (readyTimer) { clearTimeout(readyTimer); readyTimer = 0; }
        if (sendTimer) { clearInterval(sendTimer); sendTimer = 0; }
        stopLoop();
        if (threeState && threeState.group) threeState.group.visible = false;
        if (ui.here) ui.here.hidden = true;
        if (ui.toggle) ui.toggle.hidden = true;
        var ch = channel;
        channel = null;
        if (ch) {
            try { ch.unsubscribe(); } catch (e) { }
            if (sb) { try { sb.removeChannel(ch); } catch (e) { } }
        }
    }

    /* ---------- boot ---------- */
    function init() {
        try {
            visitorId = load('arcade_visitor_id');
            if (!visitorId) {
                visitorId = 'v' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
                store('arcade_visitor_id', visitorId);
            }
            hue = hashHue(visitorId);
            hidden = load('arcade_orbs_hidden') === '1';
            // stable per-visitor home position so idle visitors are still distinct
            px = (hashHue(visitorId + 'x') / 180) - 1;
            py = (hashHue(visitorId + 'y') / 180) - 1;
        } catch (e) { return; }

        ui.here = document.getElementById('tHere');
        ui.toggle = document.getElementById('orbsToggle');
        if (ui.toggle) {
            ui.toggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
            ui.toggle.classList.toggle('off', hidden);
            ui.toggle.addEventListener('click', function () {
                hidden = !hidden;
                store('arcade_orbs_hidden', hidden ? '1' : '0');
                ui.toggle.classList.toggle('off', hidden);
                ui.toggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
                renderPeers();
            });
        }

        myPos = computePos();
        sector = 0; // arcade.html dispatches 'arcade:select' on every cartridge change

        window.addEventListener('pointermove', function (e) {
            px = Math.max(-1, Math.min(1, (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1));
            py = Math.max(-1, Math.min(1, 1 - (e.clientY / Math.max(1, window.innerHeight)) * 2));
            myPos = computePos();
        }, { passive: true });

        window.addEventListener('arcade:select', function (e) {
            var i = e && e.detail ? Number(e.detail.i) : NaN;
            if (isFinite(i)) { sector = Math.max(0, Math.min(SECTORS - 1, i)); myPos = computePos(); maybeSend(); }
        });

        sendTimer = setInterval(maybeSend, SEND_INTERVAL_MS);

        var leave = function () { teardown(); };
        window.addEventListener('pagehide', leave);        // fires on tab close AND navigation to a game page
        window.addEventListener('beforeunload', leave);    // belt & braces for older browsers

        try {
            if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') return;
            connect();
        } catch (e) { teardown(); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
