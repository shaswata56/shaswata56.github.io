/* qrng.js — quantum randomness helper for the Ψ cartridge.
   True quantum bytes (ANU QRNG, photon/vacuum) served by the "qrng"
   Cloud Run API. Draw() falls back to Math.random() whenever the service
   is unreachable, cold, or honestly serving crypto bytes — the game then
   reports "local". No draw ever blocks: bytes are prefetched at load and
   topped up in the background after each collapse. */
(function () {
    'use strict';

    /* THE one constant to change when the qrng service moves: */
    var QRNG_URL = 'https://qrng-766350032397.us-central1.run.app';

    var PREFETCH_BYTES = 512;    // one warm fetch covers roughly a dozen collapses
    var FETCH_TIMEOUT_MS = 1500; // give up fast — a collapse never waits on this
    var LOW_BYTES = 128;         // top up below this many buffered bytes

    var quantumBytes = [];       // only ever holds bytes the server labeled "anu-qrng"
    var inflight = false;

    function fetchQuantum(n) {   // → {source, data:[ints]} | null on any failure
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);
        return fetch(QRNG_URL + '/int?n=' + n, { signal: ctrl.signal })
            .then(function (res) { return res.ok ? res.json() : null; })
            .catch(function () { return null; })
            .then(function (j) { return (j && Array.isArray(j.data) && j.data.length) ? j : null; })
            .finally(function () { clearTimeout(timer); });
    }

    function topUp() {           // fire-and-forget background refill
        if (inflight) return;
        inflight = true;
        fetchQuantum(PREFETCH_BYTES).then(function (j) {
            if (j && j.source === 'anu-qrng') quantumBytes = quantumBytes.concat(j.data);
        }).catch(function () { /* buffer stays as-is; draws fall back */ })
            .finally(function () { inflight = false; });
    }
    topUp();                     // prefetch at game load to hide latency

    window.qrng = {
        fetchQuantum: fetchQuantum,
        topUp: topUp,
        topUpIfLow: function () { if (quantumBytes.length < LOW_BYTES) topUp(); },
        /* Draw-session state: `quantum` stays true only while every draw of
           the session came from the quantum buffer. */
        state: function () { return { quantum: quantumBytes.length >= 2 }; },
        draw: function (st) {    // one [0,1) float; 2 bytes → 16-bit resolution
            if (quantumBytes.length >= 2) {
                var b0 = quantumBytes.shift(), b1 = quantumBytes.shift();
                return ((b0 << 8) | b1) / 65536;
            }
            st.quantum = false;
            return Math.random();
        },
        sourceLabel: function (st) { return st.quantum ? 'quantum (ANU)' : 'local'; }
    };
})();
