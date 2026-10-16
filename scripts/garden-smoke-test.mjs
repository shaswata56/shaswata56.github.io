// Smoke test for The Permanent Garden data contract.
//
//   node scripts/garden-smoke-test.mjs
//
// Targets whatever Supabase project public/garden/garden-config.js currently
// points at (read-only SELECT) — run it only against a project you are allowed
// to touch. Proves the client wiring (anon key + PostgREST) is correct and
// that the ONLY missing piece is the migration (expected: 42P01 / PGRST205
// before it runs, rows after). Also probes the quantum randomness service.
// Exits 0 either way — it is a diagnostic, not a gate.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfgSrc = readFileSync(join(root, 'public/garden/garden-config.js'), 'utf8');

const pick = (name) => {
    const m = cfgSrc.match(new RegExp(name + "\\s*:\\s*'([^']+)'"));
    if (!m) throw new Error(name + ' not found in public/garden/garden-config.js');
    return m[1];
};

const SUPABASE_URL = pick('SUPABASE_URL');
const SUPABASE_ANON_KEY = pick('SUPABASE_ANON_KEY');
const QRNG_URL = pick('QRNG_URL');

const safeHost = (u) => { try { return new URL(u).host; } catch { return '(invalid url)'; } };

console.log('--- garden smoke test ---');
console.log('supabase host :', safeHost(SUPABASE_URL), '(anon key loaded, not printed)');

// (a)+(b)+(c): anon-key select against garden_marks
try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/garden_marks?select=id,visitor_id,x,z,hue,form,size,glow,message,source,planted_at&limit=5`, {
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Accept: 'application/json'
        }
    });
    const body = await res.text();
    console.log('garden_marks  : HTTP', res.status);
    console.log('postgrest body:', body.slice(0, 500));
    if (res.ok) {
        console.log('=> table exists and anon can read it (migration already ran).');
    } else {
        let code = '';
        try { code = JSON.parse(body).code || ''; } catch { /* non-json */ }
        if (code === '42P01' || code === 'PGRST205' || /does not exist|Could not find the table/i.test(body)) {
            console.log('=> WIRING OK. Expected pre-migration state: relation does not exist (42P01).');
            console.log('   Run supabase/garden-migration.sql in the Supabase SQL Editor to open the garden.');
        } else if (res.status === 401 || res.status === 403) {
            console.log('=> auth/RLS layer answered — wiring OK; check key/RLS if this persists after migration.');
        } else {
            console.log('=> unexpected status; see body above.');
        }
    }
} catch (err) {
    console.log('garden_marks  : network error —', err.message);
}

// QRNG probe
try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 2000);
    const res = await fetch(`${QRNG_URL.replace(/\/+$/, '')}/int?n=8`, { signal: ctl.signal });
    clearTimeout(to);
    const body = await res.text();
    console.log('qrng service :', safeHost(QRNG_URL), 'HTTP', res.status);
    console.log('qrng body    :', body.slice(0, 200));
    const j = JSON.parse(body);
    const arr = Array.isArray(j) ? j : j.data;
    console.log('=> usable as quantum bytes:', Array.isArray(arr) && arr.length >= 8 && arr.every(Number.isFinite));
} catch (err) {
    console.log('qrng service : unreachable —', err.message, '(page will use the honest local fallback)');
}
