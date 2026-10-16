/*
 * ============================================================================
 * The Permanent Garden — configuration (/garden)
 * Loaded by public/garden/index.html BEFORE the page script.
 * ============================================================================
 *
 * >>> SWAP POINT <<<
 * The two constants below currently point at the chonky.cam Supabase project
 * as a TEMPORARY placeholder. The Garden is moving to its own personal
 * Supabase project; when it exists, replace the two marked lines and nothing
 * else — every consumer reads them from here.
 *
 *   SUPABASE_URL      -> line 24 below
 *   SUPABASE_ANON_KEY -> line 25 below
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------
     * DATABASE — swap these two lines when the personal Supabase project
     * exists (Dashboard -> Settings -> API: Project URL + anon public key).
     * Public-by-design values (anon key; the table is RLS-protected).
     * ------------------------------------------------------------------ */
    var SUPABASE_URL      = 'https://episirdmzjubqrvvkbnv.supabase.co';   // TODO: replace with personal project URL
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwaXNpcmRtemp1YnFydnZrYm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzMxNTcsImV4cCI6MjA5ODIwOTE1N30.lA_qiwonKCONW_RI84y0D_RJQUcSVR3douoqJiBkS2c';   // TODO: replace with personal project anon key

    /* Quantum randomness API (Cloud Run) — GET {QRNG_URL}/int?n=8
     * -> { source, data: [8 bytes] }. If unreachable the garden falls back
     * to crypto.getRandomValues and honestly labels those marks 'local'. */
    var QRNG_URL = 'https://qrng-sfh4sayehq-uc.a.run.app';

    /* Render at most this many marks in the scene (oldest first); the
     * counter in the corner always shows the true total from the DB. */
    var MAX_RENDERED_MARKS = 5000;

    window.GARDEN_CONFIG = {
        SUPABASE_URL: SUPABASE_URL,
        SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
        QRNG_URL: QRNG_URL,
        MAX_RENDERED_MARKS: MAX_RENDERED_MARKS
    };
})();
