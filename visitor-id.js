/*
 * Shared visitor identity for shaswata.me.
 *
 * One stable anonymous id per browser, stored in localStorage under
 * "shaswata-visitor-id". Used by The Permanent Garden (/garden) for the
 * one-mark-per-visitor rule; the multiplayer room and anything else that
 * needs "who is this browser" should adopt the same key + helper so a
 * visitor is one person across every experience on the site.
 *
 * Include from any static page:  <script src="/visitor-id.js"></script>
 * Then:  const id = window.shaswataVisitorId();
 */
(function () {
    'use strict';
    var KEY = 'shaswata-visitor-id';

    function randomId() {
        try {
            var bytes = new Uint8Array(16);
            (window.crypto || window.msCrypto).getRandomValues(bytes);
            var s = '';
            for (var i = 0; i < bytes.length; i++) s += (bytes[i] + 0x100).toString(16).slice(1);
            return s;
        } catch (e) {
            // last resort: non-crypto fallback (still unique enough for a garden mark)
            return 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        }
    }

    function getVisitorId() {
        try {
            var v = null;
            try { v = window.localStorage.getItem(KEY); } catch (e) { /* private mode */ }
            if (v && /^[a-z0-9]{8,64}$/.test(v)) return v;
            v = randomId();
            try { window.localStorage.setItem(KEY, v); } catch (e) { /* private mode */ }
            return v;
        } catch (e) {
            return randomId();
        }
    }

    window.SHASWATA_VISITOR_KEY = KEY;
    window.shaswataVisitorId = getVisitorId;
})();
