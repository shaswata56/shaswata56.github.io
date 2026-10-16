/* presence-smoke.mjs — two supabase clients on the same Realtime channel;
 * asserts they see each other's presence within 5s and that a broadcast
 * position message crosses the wire. Exits 0 on PASS, 1 on FAIL, 2 on bad env.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/presence-smoke.mjs
 */
import { createClient } from '@supabase/supabase-js';

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY;
if (!URL_ || !KEY) {
  console.error('FAIL env: set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(2);
}

const CHANNEL = process.env.SMOKE_CHANNEL || 'shaswata-arcade-smoke';
const TIMEOUT_MS = 5000;

function makeClient(name) {
  const sb = createClient(URL_, KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const seen = new Set();
  const gotBroadcastFrom = new Set();
  const ch = sb.channel(CHANNEL, {
    config: { presence: { key: name }, broadcast: { self: false } },
  });
  ch.on('presence', { event: 'sync' }, () => {
    const state = ch.presenceState();
    for (const k of Object.keys(state)) if (k !== name) seen.add(k);
  });
  ch.on('broadcast', { event: 'pos' }, (msg) => {
    if (msg.payload && msg.payload.i && msg.payload.i !== name) gotBroadcastFrom.add(msg.payload.i);
  });
  return { sb, ch, name, seen, gotBroadcastFrom };
}

const a = makeClient('smoke-a');
const b = makeClient('smoke-b');
const results = { aSubscribed: false, bSubscribed: false, aSawB: false, bSawA: false, broadcast: false };

function sub(client, flag) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('subscribe ' + client.name + ' timed out')), TIMEOUT_MS);
    client.ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(t);
        results[flag] = true;
        client.ch.track({ p: [1.234, -0.5, 2], h: 180 }).catch(() => {});
        resolve();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(t);
        reject(new Error('subscribe ' + client.name + ' → ' + status));
      }
    });
  });
}

async function cleanup() {
  for (const c of [a, b]) {
    try { await c.ch.unsubscribe(); } catch {}
    try { c.sb.removeChannel(c.ch); } catch {}
    try { c.sb.removeAllChannels(); } catch {}
  }
}

const deadline = Date.now() + TIMEOUT_MS + 1500;
try {
  await Promise.all([sub(a, 'aSubscribed'), sub(b, 'bSubscribed')]);
  // both joined; now check mutual presence visibility
  while (Date.now() < deadline && !(a.seen.has('smoke-b') && b.seen.has('smoke-a'))) {
    await new Promise((r) => setTimeout(r, 100));
  }
  results.aSawB = a.seen.has('smoke-b');
  results.bSawA = b.seen.has('smoke-a');

  // exchange a broadcast both ways
  const bDead = Date.now() + 3000;
  await a.ch.send({ type: 'broadcast', event: 'pos', payload: { i: 'smoke-a', p: [0, 0, 0], h: 10 } });
  await b.ch.send({ type: 'broadcast', event: 'pos', payload: { i: 'smoke-b', p: [1, 1, 1], h: 200 } });
  while (Date.now() < bDead && !(a.gotBroadcastFrom.has('smoke-b') && b.gotBroadcastFrom.has('smoke-a'))) {
    await new Promise((r) => setTimeout(r, 100));
  }
  results.broadcast = a.gotBroadcastFrom.has('smoke-b') && b.gotBroadcastFrom.has('smoke-a');
} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await cleanup();
}

console.log('subscribe A ..............', results.aSubscribed ? 'ok' : 'FAIL');
console.log('subscribe B ..............', results.bSubscribed ? 'ok' : 'FAIL');
console.log('A sees B presence ........', results.aSawB ? 'ok' : 'FAIL');
console.log('B sees A presence ........', results.bSawA ? 'ok' : 'FAIL');
console.log('broadcast pos A<->B ......', results.broadcast ? 'ok' : 'FAIL');
const pass = results.aSubscribed && results.bSubscribed && results.aSawB && results.bSawA && results.broadcast;
console.log(pass ? 'SMOKE TEST PASS' : 'SMOKE TEST FAIL');
process.exit(pass ? 0 : 1);
