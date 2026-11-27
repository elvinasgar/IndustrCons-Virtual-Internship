/* IndustrCons credential check (Phase 1). Tamper detection only — see verify.html note. */
window.IC = window.IC || {};
IC.verify = (function () {
  const SALT = 'IRE3|industrcons|v1';
  function sha256(str) {
    const K = [];
    for (let n = 2, c = 0; c < 64; n++) { let p = true; for (let i = 2; i * i <= n; i++) if (n % i === 0) { p = false; break; } if (p) { K[c++] = (Math.cbrt(n) % 1 * 4294967296) | 0; } }
    const H = []; for (let n = 2, c = 0; c < 8; n++) { let p = true; for (let i = 2; i * i <= n; i++) if (n % i === 0) { p = false; break; } if (p) { H[c++] = (Math.sqrt(n) % 1 * 4294967296) | 0; } }
    const b = unescape(encodeURIComponent(str)); const w = [];
    for (let i = 0; i < b.length; i++) w[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
    const bl = b.length * 8; w[bl >> 5] |= 0x80 << (24 - bl % 32); w[(((bl + 64) >> 9) << 4) + 15] = bl;
    const rot = (x, n) => (x >>> n) | (x << (32 - n));
    for (let j = 0; j < w.length; j += 16) {
      const a = H.slice(), W = [];
      for (let i = 0; i < 64; i++) {
        if (i < 16) W[i] = w[j + i] | 0; else {
          const g0 = rot(W[i - 15], 7) ^ rot(W[i - 15], 18) ^ (W[i - 15] >>> 3), g1 = rot(W[i - 2], 17) ^ rot(W[i - 2], 19) ^ (W[i - 2] >>> 10);
          W[i] = (W[i - 16] + g0 + W[i - 7] + g1) | 0;
        }
        const e = a[4], s1 = rot(e, 6) ^ rot(e, 11) ^ rot(e, 25), ch = (e & a[5]) ^ (~e & a[6]);
        const t1 = (a[7] + s1 + ch + K[i] + W[i]) | 0;
        const s0 = rot(a[0], 2) ^ rot(a[0], 13) ^ rot(a[0], 22), mj = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]);
        const t2 = (s0 + mj) | 0;
        a.pop(); a.unshift((t1 + t2) | 0); a[4] = (a[4] + t1) | 0;
      }
      for (let i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    return H.map(x => ('00000000' + (x >>> 0).toString(16)).slice(-8)).join('');
  }
  const norm = f => [f.c, f.t, f.n, f.d].map(v => String(v == null ? '' : v).trim()).join('|');
  function sign(f) { return sha256(SALT + '|' + norm(f)).slice(0, 10).toUpperCase(); }
  function ymd(ts) { const d = new Date(ts); return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function buildUrl(base, f) {
    const q = 'c=' + encodeURIComponent(f.c) + '&t=' + encodeURIComponent(f.t) + '&n=' + encodeURIComponent(f.n) + '&d=' + f.d + '&k=' + sign(f);
    return base + '?' + q;
  }
  function parse(search) {
    const p = new URLSearchParams(search);
    return { c: p.get('c') || '', t: p.get('t') || '', n: p.get('n') || '', d: p.get('d') || '', k: (p.get('k') || '').toUpperCase() };
  }
  return { sha256, sign, ymd, buildUrl, parse };
})();
