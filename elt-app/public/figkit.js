/* figkit: renders a compact JSON figure spec as a house-style SVG string.
   Works in browser (window.FigKit) and Node (module.exports). */
(function (root) {
  const W = 640;
  const DEF = { a: 'var(--fa)', b: 'var(--fb)', g: 'var(--fg)', l: 'var(--fl)', s: 'var(--fs)', t: 'var(--ft)', m: 'var(--fm)', p: 'var(--fp)', font: "'Source Sans 3','Segoe UI',Arial,sans-serif" };
  const PRINT = { a: '#1F2A44', b: '#7A2E2E', g: '#B5842E', l: '#EEF1F6', s: '#F3ECDD', t: '#1F2A44', m: '#5A6378', p: '#FFFFFF', font: "'Source Sans 3','Segoe UI',Arial,sans-serif" };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function wrap(text, maxW, fs) {
    const cw = fs * 0.5; const max = Math.max(4, Math.floor(maxW / cw));
    const words = String(text || '').split(/\s+/).filter(Boolean); const lines = []; let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  /* ---------- icons: 24x24 stroke drawings ---------- */
  const I = {
    person: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
    people: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20v-2a6 6 0 0 1 12 0v2M14 20v-1.5a4.5 4.5 0 0 1 8 -2.5"/>',
    teacher: '<circle cx="8" cy="7" r="3"/><path d="M2 21v-3a6 6 0 0 1 9 -5M14 4h8v7h-8zM11 12l3 -3"/>',
    book: '<path d="M3 5c3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0zM12 5c3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    speech: '<path d="M4 5h16v10H10l-4 4v-4H4z"/>',
    speech2: '<path d="M2 4h12v8H7l-3 3v-3H2zM10 14v2h7l3 3v-3h2V8h-6"/>',
    board: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20l4-4 4 4M7 9h6M7 12h9"/>',
    desk: '<path d="M3 10h18M5 10v9M19 10v9M8 10V6h8v4"/>',
    pencil: '<path d="M4 20l1-5L16 4l4 4L9 19zM14 6l4 4"/>',
    ear: '<path d="M8 9a5 5 0 1 1 9 3c-1.5 2-3 2.5-3 5a3 3 0 0 1-6 0"/><path d="M11 9a2 2 0 1 1 3 1.7"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    mouth: '<path d="M4 11c4 5 12 5 16 0M4 11c4-2 12-2 16 0"/>',
    hand: '<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 10V4a1.5 1.5 0 0 1 3 0v7M14 10V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 15"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18z"/>',
    star: '<path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.5l6.2-.9z"/>',
    bridge: '<path d="M2 16h20M4 16v-3M20 16v-3M2 13c5-6 15-6 20 0M8 16v-4M12 16v-5M16 16v-4"/>',
    road: '<path d="M8 21L10 3M16 21L14 3M12 6v2M12 11v2M12 16v2"/>',
    building: '<path d="M4 21V8l8-5 8 5v13zM9 21v-5h6v5M8 10h2M14 10h2"/>',
    steps: '<path d="M3 20h5v-4h5v-4h5V8h3"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    bulb: '<path d="M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4z"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 16.5v.5"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    laptop: '<rect x="5" y="5" width="14" height="10" rx="1"/><path d="M2 19h20l-2-4H4z"/>',
    house: '<path d="M3 11l9-7 9 7M5 9v11h14V9M10 20v-5h4v5"/>',
    tree: '<path d="M12 21v-7M12 14l-4-3M12 12l4-3"/><circle cx="12" cy="8" r="5"/>',
    plant: '<path d="M12 21v-9M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 15c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
    door: '<rect x="6" y="3" width="12" height="18"/><circle cx="15" cy="12" r="1"/>',
    key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/>',
    scales: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
    ladder: '<path d="M7 3v18M17 3v18M7 7h10M7 11h10M7 15h10M7 19h10"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    puzzle: '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4v-4a2 2 0 1 0 0-4z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9h18M3 15h18M8 5v4M16 5v4M8 15v4M16 15v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6l9 7 9-7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    folder: '<path d="M3 7h6l2 2h10v10H3z"/>',
    doc: '<path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l2-3h4l2 3"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
    robot: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
    wave: '<path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-1"/>',
    seed: '<path d="M12 20c-5 0-7-5-7-9 4 0 7 3 7 9zM12 20c0-6 3-9 7-9 0 4-2 9-7 9z"/>',
    mountain: '<path d="M2 20l7-12 4 6 3-4 6 10z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    tools: '<path d="M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 0-2-2z"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>'
  };
  const ICONS = Object.keys(I);
  function icon(name, x, y, size, col) {
    if (!name || !I[name]) return '';
    const s = size / 24;
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${col}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[name]}</g>`;
  }
  /* ---------- primitives ---------- */
  function txt(lines, x, y, fs, col, anchor = 'middle', weight = 400, C, lh = 1.25) {
    return lines.map((l, i) => `<text x="${x}" y="${(y + i * fs * lh).toFixed(1)}" font-size="${fs}" font-weight="${weight}" fill="${col}" text-anchor="${anchor}" font-family="${C.font}">${esc(l)}</text>`).join('');
  }
  function arrow(x1, y1, x2, y2, col, w = 1.8) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    const p1 = [x2 - h * Math.cos(a - .4), y2 - h * Math.sin(a - .4)], p2 = [x2 - h * Math.cos(a + .4), y2 - h * Math.sin(a + .4)];
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(x2 - 2 * Math.cos(a)).toFixed(1)}" y2="${(y2 - 2 * Math.sin(a)).toFixed(1)}" stroke="${col}" stroke-width="${w}"/><path d="M${x2.toFixed(1)} ${y2.toFixed(1)} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}z" fill="${col}"/>`;
  }
  const node = n => typeof n === 'string' ? { label: n } : (n || { label: '' });
  function box(n, x, y, w, C, opt = {}) {
    n = node(n); const fs = opt.fs || 14, pad = 10, ic = n.icon && I[n.icon] ? 30 : 0;
    const L = wrap(n.label, w - 2 * pad, fs), S = n.sub ? wrap(n.sub, w - 2 * pad, fs - 2.5) : [];
    const h = opt.h || (pad * 2 + (ic ? ic + 6 : 0) + L.length * fs * 1.25 + (S.length ? 4 + S.length * (fs - 2.5) * 1.25 : 0));
    const fill = n.hl ? C.s : (opt.fill || C.l), stroke = n.hl ? C.b : C.a;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${n.hl ? 2.4 : 1.4}"/>`;
    let cy = y + pad;
    const content = (ic ? ic + 6 : 0) + L.length * fs * 1.25 + (S.length ? 4 + S.length * (fs - 2.5) * 1.25 : 0);
    cy = y + (h - content) / 2;
    if (ic) { s += icon(n.icon, x + w / 2 - ic / 2, cy, ic, n.hl ? C.b : C.a); cy += ic + 6; }
    s += txt(L, x + w / 2, cy + fs * .95, fs, C.t, 'middle', 600, C); cy += L.length * fs * 1.25;
    if (S.length) s += txt(S, x + w / 2, cy + 4 + (fs - 2.5) * .95, fs - 2.5, C.m, 'middle', 400, C);
    return { s, h };
  }
  function boxH(n, w, opt = {}) { return box(n, 0, 0, w, PRINT, opt).h; }

  /* ---------- types ---------- */
  const T = {};
  T.flow = (f, C) => {
    const ns = (f.nodes || []).map(node); const n = ns.length; const dir = f.dir || (n > 5 ? 'v' : 'h');
    let s = '', H;
    if (dir === 'h') {
      const gap = f.edges && f.edges.some(Boolean) ? 58 : 34, w = (W - 40 - (n - 1) * gap) / n, hmax = Math.max(...ns.map(x => boxH(x, w)));
      const y0 = 30;
      ns.forEach((x, i) => { const bx = 20 + i * (w + gap); s += box(x, bx, y0, w, C, { h: hmax }).s;
        if (i < n - 1) { s += arrow(bx + w + 4, y0 + hmax / 2, bx + w + gap - 4, y0 + hmax / 2, C.b);
          if (f.edges && f.edges[i]) s += txt(wrap(f.edges[i], gap + 6, 10.5), bx + w + gap / 2, y0 + hmax / 2 - 12, 10.5, C.m, 'middle', 600, C); } });
      H = y0 + hmax + 20;
      if (f.loop) { const yb = y0 + hmax + 14; s += `<path d="M${20 + (n - 1) * (w + gap) + w / 2} ${y0 + hmax} V${yb + 14} H${20 + w / 2} V${y0 + hmax + 10}" fill="none" stroke="${C.b}" stroke-width="1.6" stroke-dasharray="5 4"/>` + arrow(20 + w / 2, yb + 4, 20 + w / 2, y0 + hmax + 2, C.b);
        if (f.loopLabel) s += txt([f.loopLabel], W / 2, yb + 28, 12, C.m, 'middle', 400, C); H = yb + 40; }
    } else {
      const w = 380, x = (W - w) / 2; let y = 20;
      ns.forEach((nd, i) => { const b = box(nd, x, y, w, C); s += b.s; y += b.h;
        if (i < n - 1) { s += arrow(W / 2, y + 3, W / 2, y + 27, C.b); if (f.edges && f.edges[i]) s += txt([f.edges[i]], W / 2 + 14, y + 19, 11.5, C.m, 'start', 400, C); y += 30; } });
      H = y + 20;
      if (f.loop) { s += `<path d="M${x + w} ${H - 40} H${x + w + 40} V${40} H${x + w}" fill="none" stroke="${C.b}" stroke-width="1.6" stroke-dasharray="5 4"/>` + arrow(x + w + 20, 40, x + w + 3, 40, C.b);
        if (f.loopLabel) s += txt(wrap(f.loopLabel, 90, 11.5), x + w + 46, H / 2, 11.5, C.m, 'start', 400, C); }
    }
    return { s, h: H };
  };
  T.cycle = (f, C) => {
    const ns = (f.nodes || []).map(node), n = ns.length, cx = W / 2, R = n > 5 ? 160 : 140, bw = n > 5 ? 130 : 150;
    const hmax = Math.max(...ns.map(x => boxH(x, bw, { fs: 13 })));
    const cy = R + hmax / 2 + 20; let s = '';
    ns.forEach((x, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; const px = cx + R * Math.cos(a) * 1.25, py = cy + R * Math.sin(a);
      const a2 = -Math.PI / 2 + 2 * Math.PI * (i + .5) / n; const r2 = R * .98;
      const aa = a + .35, ab = a + 2 * Math.PI / n - .35;
      s += `<path d="M${(cx + r2 * 1.25 * Math.cos(aa)).toFixed(1)} ${(cy + r2 * Math.sin(aa)).toFixed(1)} Q${(cx + r2 * 1.32 * Math.cos(a2)).toFixed(1)} ${(cy + r2 * 1.06 * Math.sin(a2)).toFixed(1)} ${(cx + r2 * 1.25 * Math.cos(ab)).toFixed(1)} ${(cy + r2 * Math.sin(ab)).toFixed(1)}" fill="none" stroke="${C.b}" stroke-width="1.6"/>`;
      const ex = cx + r2 * 1.25 * Math.cos(ab), ey = cy + r2 * Math.sin(ab), dx = -Math.sin(ab) * 1.25, dy = Math.cos(ab);
      s += arrow(ex - dx * 6, ey - dy * 6, ex, ey, C.b);
    });
    ns.forEach((x, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; const px = cx + R * Math.cos(a) * 1.25, py = cy + R * Math.sin(a);
      s += box(x, px - bw / 2, py - hmax / 2, bw, C, { fs: 13, h: hmax, fill: C.p }).s; });
    if (f.center) { const L = wrap(f.center, 120, 14); s += `<circle cx="${cx}" cy="${cy}" r="${Math.max(44, L.length * 10 + 20)}" fill="${C.s}" stroke="${C.g}" stroke-width="1.6"/>` + txt(L, cx, cy - (L.length - 1) * 8.5 + 5, 14, C.t, 'middle', 700, C); }
    return { s, h: cy + R + hmax / 2 + 20 };
  };
  T.timeline = (f, C) => {
    const y = 120, x0 = 50, x1 = W - 50; let s = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.a}" stroke-width="2.4"/>` + arrow(x1 - 10, y, x1 + 6, y, C.a, 2.4);
    if (f.start) s += txt(wrap(f.start, 100, 12), x0, y + 26, 12, C.m, 'start', 600, C);
    if (f.end) s += txt(wrap(f.end, 100, 12), x1, y + 26, 12, C.m, 'end', 600, C);
    const X = at => x0 + (x1 - x0 - 20) * Math.max(0, Math.min(1, at));
    (f.spans || []).forEach((sp, i) => { const a = X(sp.from), b = X(sp.to), yy = 58 - i * 0; s += `<path d="M${a} ${yy + 8} V${yy} H${b} V${yy + 8}" fill="none" stroke="${C.g}" stroke-width="2"/>` + txt(wrap(sp.label, b - a + 40, 12.5), (a + b) / 2, yy - 8, 12.5, C.g, 'middle', 700, C); });
    (f.points || []).forEach((p, i) => { const x = X(p.at), up = p.above != null ? p.above : i % 2 === 1;
      s += p.mark === 'dot' ? `<circle cx="${x}" cy="${y}" r="6" fill="${C.b}"/>` : p.mark === 'bar' ? `<rect x="${x - 3}" y="${y - 12}" width="6" height="24" fill="${C.b}"/>` : `<path d="M${x - 6} ${y - 6}l12 12M${x + 6} ${y - 6}l-12 12" stroke="${C.b}" stroke-width="2.6"/>`;
      const L = wrap(p.label, 120, 12.5); s += txt(L, x, up ? y - 18 - (L.length - 1) * 15.6 : y + 30, 12.5, C.t, 'middle', 600, C); });
    if (f.now != null) { const x = X(f.now); s += `<line x1="${x}" y1="${y - 34}" x2="${x}" y2="${y + 34}" stroke="${C.b}" stroke-width="3"/>` + txt(['NOW'], x, y + 52, 13, C.b, 'middle', 700, C); }
    return { s, h: 200 };
  };
  T.matrix = (f, C) => {
    const x0 = 110, y0 = 30, w = 480, h = 300, cells = f.cells || [['', ''], ['', '']]; let s = '';
    const r = cells.length, c = cells[0].length, cw = w / c, ch = h / r;
    cells.forEach((row, i) => row.forEach((cell, j) => { const n = node(cell); const hl = n.hl;
      s += `<rect x="${x0 + j * cw}" y="${y0 + i * ch}" width="${cw}" height="${ch}" fill="${hl ? C.s : (i + j) % 2 ? C.p : C.l}" stroke="${C.a}" stroke-width="1.2"/>`;
      const L = wrap(n.label, cw - 24, 13.5); const ic = n.icon ? 28 : 0; const tot = ic + L.length * 17;
      let cy = y0 + i * ch + (ch - tot) / 2; if (ic) { s += icon(n.icon, x0 + j * cw + cw / 2 - 14, cy, 28, hl ? C.b : C.a); cy += ic + 4; }
      s += txt(L, x0 + j * cw + cw / 2, cy + 13, 13.5, C.t, 'middle', 600, C); }));
    if (f.x) { s += txt([f.x[0]], x0, y0 + h + 20, 12, C.m, 'start', 600, C) + txt([f.x[1]], x0 + w, y0 + h + 20, 12, C.m, 'end', 600, C); }
    if (f.xName) s += arrow(x0, y0 + h + 34, x0 + w, y0 + h + 34, C.b, 1.4) + txt([f.xName], x0 + w / 2, y0 + h + 52, 13, C.b, 'middle', 700, C);
    if (f.y) { s += txt(wrap(f.y[1], 80, 12), x0 - 10, y0 + 14, 12, C.m, 'end', 600, C) + txt(wrap(f.y[0], 80, 12), x0 - 10, y0 + h - 4, 12, C.m, 'end', 600, C); }
    if (f.yName) s += arrow(x0 - 40, y0 + h - 40, x0 - 40, y0 + 60, C.b, 1.4) + `<text x="${x0 - 50}" y="${y0 + h / 2}" font-size="13" font-weight="700" fill="${C.b}" text-anchor="middle" transform="rotate(-90 ${x0 - 50} ${y0 + h / 2})" font-family="${C.font}">${esc(f.yName)}</text>`;
    return { s, h: y0 + h + (f.xName ? 64 : 34) };
  };
  T.panels = (f, C) => {
    const ps = f.panels || [], k = ps.length, gap = f.join ? 44 : 16, w = (W - 30 - (k - 1) * gap) / k; let s = '';
    const fs = k > 3 ? 12 : 13.5;
    const hs = ps.map(p => { let h = 44 + (p.icon ? 44 : 6); (p.items || []).forEach(it => h += wrap(it, w - 34, fs).length * fs * 1.3 + 7); return h + 10; });
    const H = Math.max(...hs);
    ps.forEach((p, i) => { const x = 15 + i * (w + gap), tone = p.tone === 'b' ? C.b : p.tone === 'g' ? C.g : C.a;
      s += `<rect x="${x}" y="20" width="${w}" height="${H}" rx="6" fill="${C.p}" stroke="${tone}" stroke-width="1.6"/><path d="M${x} 26 a6 6 0 0 1 6 -6 h${w - 12} a6 6 0 0 1 6 6 v24 h-${w} z" fill="${tone}"/>`;
      s += txt(wrap(p.title, w - 16, 14).slice(0, 2), x + w / 2, 40, 14, C.p, 'middle', 700, C);
      let y = 60; if (p.icon) { s += icon(p.icon, x + w / 2 - 17, y, 34, tone); y += 44; } else y += 6;
      (p.items || []).forEach(it => { const L = wrap(it, w - 34, fs); s += `<circle cx="${x + 14}" cy="${y + fs * .6}" r="2.6" fill="${tone}"/>` + txt(L, x + 24, y + fs, fs, C.t, 'start', 400, C, 1.3); y += L.length * fs * 1.3 + 7; });
      if (i < k - 1 && f.join) { const jx = x + w + gap / 2, jy = 20 + H / 2;
        s += f.join === 'vs' ? `<circle cx="${jx}" cy="${jy}" r="16" fill="${C.s}" stroke="${C.g}"/>` + txt(['vs'], jx, jy + 5, 13, C.t, 'middle', 700, C) : f.join === '+' ? txt(['+'], jx, jy + 9, 26, C.b, 'middle', 700, C) : arrow(jx - 14, jy, jx + 14, jy, C.b, 2.2); } });
    return { s, h: H + 40 };
  };
  T.wheel = (f, C) => {
    const cx = W / 2, cy = 190, R1 = 170, R2 = 100, R3 = 44; let s = '';
    const seg = (r0, r1, a0, a1, fill) => { const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`; const lg = a1 - a0 > Math.PI ? 1 : 0;
      return `<path d="M${p(r1, a0)} A${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)}z" fill="${fill}" stroke="${C.a}" stroke-width="1.4"/>`; };
    const ring = (items, r0, r1, fillA, fillB, fs) => { const n = items.length; items.forEach((it, i) => { const a0 = -Math.PI / 2 + 2 * Math.PI * i / n, a1 = a0 + 2 * Math.PI / n, am = (a0 + a1) / 2, rm = (r0 + r1) / 2;
      s += seg(r0, r1, a0, a1, i % 2 ? fillA : fillB); const L = wrap(it, (r1 - r0) * (r0 > 60 ? 1.5 : 1.1), fs); s += txt(L, cx + rm * Math.cos(am), cy + rm * Math.sin(am) - (L.length - 1) * fs * .62 + fs * .35, fs, C.t, 'middle', 700, C); }); };
    ring(f.outer || [], R2, R1, C.l, C.p, 13.5);
    if ((f.inner || []).length) ring(f.inner, R3, R2, C.s, C.p, 10.5);
    s += `<circle cx="${cx}" cy="${cy}" r="${R3}" fill="${C.s}" stroke="${C.g}" stroke-width="1.6"/>`;
    if (f.center) s += txt(wrap(f.center, 80, 12), cx, cy + 4, 12, C.t, 'middle', 700, C);
    return { s, h: 380 };
  };
  T.ladder = (f, C) => {
    const r = f.rungs || [], n = r.length, step = 46, x0 = 170, x1 = 250, top = 40; let s = '';
    const H = top + n * step + 20;
    s += `<line x1="${x0}" y1="${top - 10}" x2="${x0}" y2="${H - 10}" stroke="${C.a}" stroke-width="3"/><line x1="${x1}" y1="${top - 10}" x2="${x1}" y2="${H - 10}" stroke="${C.a}" stroke-width="3"/>`;
    r.forEach((lab, i) => { const y = H - 30 - i * step, nd = node(lab), hl = nd.hl || f.marker === i;
      s += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${hl ? C.b : C.a}" stroke-width="${hl ? 4 : 2.4}"/>`;
      s += txt(wrap(nd.label, 330, 13.5), x1 + 20, y + 5, 13.5, hl ? C.b : C.t, 'start', hl ? 700 : 600, C);
      if (f.marker === i) s += arrow(x0 - 50, y, x0 - 8, y, C.b, 2) + (f.markerLabel ? txt(wrap(f.markerLabel, 110, 12), x0 - 56, y - 8, 12, C.b, 'end', 700, C) : ''); });
    if (f.top) s += txt([f.top], (x0 + x1) / 2, top - 16, 12.5, C.m, 'middle', 700, C);
    if (f.bottom) s += txt([f.bottom], (x0 + x1) / 2, H + 6, 12.5, C.m, 'middle', 700, C);
    return { s, h: H + 18 };
  };
  T.tree = (f, C) => {
    const kids = (f.children || []).map(c => typeof c === 'string' ? { label: c } : c), k = kids.length; let s = '';
    const rw = 240, rb = box(f.root, (W - rw) / 2, 16, rw, C, { fill: C.s }); s += rb.s; const ry = 16 + rb.h;
    const gap = 12, w = (W - 20 - (k - 1) * gap) / k, hmax = Math.max(...kids.map(x => boxH(x, w, { fs: 13 })));
    const cy = ry + 50; let maxY = cy + hmax;
    kids.forEach((c, i) => { const x = 10 + i * (w + gap); s += `<path d="M${W / 2} ${ry} V${ry + 22} H${x + w / 2} V${cy}" fill="none" stroke="${C.a}" stroke-width="1.4"/>`;
      s += box(c, x, cy, w, C, { fs: 13, h: hmax }).s;
      let y = cy + hmax + 14; (c.children || []).forEach(g => { const b = box(g, x + 10, y, w - 20, C, { fs: 12, fill: C.p }); s += `<line x1="${x + w / 2}" y1="${y - 14}" x2="${x + w / 2}" y2="${y}" stroke="${C.a}" stroke-width="1.2"/>` + b.s; y += b.h + 14; });
      maxY = Math.max(maxY, y); });
    return { s, h: maxY + 10 };
  };
  T.bars = (f, C) => {
    const b = f.bars || [], max = f.max || Math.max(...b.map(x => +x.value || 0), 1), lw = 210, x0 = 20 + lw, bw = W - x0 - 70; let s = '', y = 20;
    b.forEach(x => { const L = wrap(x.label, lw - 12, 13); const h = Math.max(26, L.length * 16 + 6);
      s += txt(L, x0 - 10, y + h / 2 - (L.length - 1) * 8 + 4.5, 13, C.t, 'end', 600, C);
      const v = +x.value || 0, wv = bw * v / max; s += `<rect x="${x0}" y="${y + 3}" width="${wv.toFixed(1)}" height="${h - 6}" rx="3" fill="${x.hl ? C.b : C.a}"/>` + txt([String(x.value) + (f.unit || '')], x0 + wv + 6, y + h / 2 + 4.5, 12.5, C.m, 'start', 700, C); y += h + 8; });
    s += `<line x1="${x0}" y1="14" x2="${x0}" y2="${y}" stroke="${C.m}" stroke-width="1"/>`;
    if (f.illustrative) s += txt(['Illustrative values'], W - 20, y + 16, 11, C.m, 'end', 400, C);
    return { s, h: y + 24 };
  };
  T.venn = (f, C) => {
    const sets = f.sets || [], n = sets.length, cy = 170; let s = '';
    const pos = n === 3 ? [[260, 140], [380, 140], [320, 240]] : [[250, cy], [390, cy]], r = n === 3 ? 105 : 130;
    pos.forEach(([x, y], i) => s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${[C.a, C.b, C.g][i]}" fill-opacity=".12" stroke="${[C.a, C.b, C.g][i]}" stroke-width="2"/>`);
    sets.forEach((st, i) => { const [x, y] = pos[i], o = n === 3 ? [[-38, -42], [38, -42], [0, 58]][i] : [[-55, 0], [55, 0]][i]; const nd = node(st);
      s += txt(wrap(nd.label, n === 3 ? 88 : 110, 13), x + o[0], y + o[1], 13, C.t, 'middle', 700, C);
      if (nd.sub) s += txt(wrap(nd.sub, 100, 11.5), x + o[0], y + o[1] + 34, 11.5, C.m, 'middle', 400, C); });
    if (f.overlap) { const cx = n === 3 ? 320 : 320, oy = n === 3 ? 172 : cy; s += txt(wrap(f.overlap, 80, 12.5), cx, oy, 12.5, C.b, 'middle', 700, C); }
    return { s, h: n === 3 ? 360 : 320 };
  };
  T.table = (f, C) => {
    const head = f.head || [], rows = f.rows || [], c = Math.max(head.length, ...rows.map(r => r.length)), cw = (W - 20) / c; let s = '', y = 14;
    const rowH = r => Math.max(28, ...r.map(x => wrap(x, cw - 14, 12.5).length * 16 + 12));
    const all = head.length ? [head, ...rows] : rows;
    all.forEach((r, i) => { const h = rowH(r), isH = head.length && i === 0;
      for (let j = 0; j < c; j++) { const v = r[j] || ''; const mark = v === '✓' || v === '✗' || v === '☐';
        s += `<rect x="${10 + j * cw}" y="${y}" width="${cw}" height="${h}" fill="${isH ? C.a : (i % 2 ? C.p : C.l)}" stroke="${C.a}" stroke-width="1"/>`;
        s += txt(wrap(v, cw - 14, 12.5), mark ? 10 + j * cw + cw / 2 : 10 + j * cw + 7, y + 18, mark ? 15 : 12.5, isH ? C.p : (v === '✓' ? C.b : C.t), mark ? 'middle' : 'start', isH ? 700 : 400, C); }
      y += h; });
    return { s, h: y + 14 };
  };
  T.stack = (f, C) => {
    const L = f.layers || [], n = L.length, lh = 52, top = 20; let s = '';
    L.slice().reverse().forEach((lab, k) => { const i = n - 1 - k, y = top + k * lh, nd = node(lab);
      if (f.shape === 'pyramid') { const wTop = 220 + (k) * (340 / n), wBot = 220 + (k + 1) * (340 / n);
        s += `<path d="M${W / 2 - wTop / 2} ${y} H${W / 2 + wTop / 2} L${W / 2 + wBot / 2} ${y + lh - 4} H${W / 2 - wBot / 2}z" fill="${nd.hl ? C.s : (i % 2 ? C.p : C.l)}" stroke="${nd.hl ? C.b : C.a}" stroke-width="1.4"/>`; }
      else s += `<rect x="${W / 2 - 220}" y="${y}" width="440" height="${lh - 6}" rx="4" fill="${nd.hl ? C.s : (i % 2 ? C.p : C.l)}" stroke="${nd.hl ? C.b : C.a}" stroke-width="1.4"/>`;
      const T2 = wrap(nd.label, 360, 13.5); s += txt(T2, W / 2, y + lh / 2 - (T2.length - 1) * 8 + 2, 13.5, C.t, 'middle', 700, C);
      if (nd.sub) s += txt(wrap(nd.sub, 150, 11.5), W / 2 + 240, y + lh / 2, 11.5, C.m, 'start', 400, C); });
    if (f.arrow) s += arrow(40, top + n * lh - 10, 40, top + 6, C.b, 2) + `<text x="30" y="${top + n * lh / 2}" font-size="12" font-weight="700" fill="${C.b}" text-anchor="middle" transform="rotate(-90 30 ${top + n * lh / 2})" font-family="${C.font}">${esc(f.arrow)}</text>`;
    return { s, h: top + n * lh + 14 };
  };
  T.spectrum = (f, C) => {
    const y = 90, x0 = 70, x1 = W - 70; let s = `<defs><linearGradient id="sg${f._id || ''}" x1="0" x2="1"><stop offset="0" stop-color="${C.a}"/><stop offset="1" stop-color="${C.b}"/></linearGradient></defs><rect x="${x0}" y="${y - 5}" width="${x1 - x0}" height="10" rx="5" fill="url(#sg${f._id || ''})"/>`;
    s += txt(wrap(f.left, 130, 13), x0, y + 32, 13, C.a, 'start', 700, C) + txt(wrap(f.right, 130, 13), x1, y + 32, 13, C.b, 'end', 700, C);
    (f.marks || []).forEach((m, i) => { const x = x0 + (x1 - x0) * m.at; s += `<circle cx="${x}" cy="${y}" r="8" fill="${C.p}" stroke="${C.t}" stroke-width="2"/>`;
      const L = wrap(m.label, 120, 12.5); s += txt(L, x, i % 2 ? y + 34 + 26 : y - 18 - (L.length - 1) * 15.6, 12.5, C.t, 'middle', 600, C); });
    return { s, h: 190 };
  };
  T.web = (f, C) => {
    const sp = (f.spokes || []).map(node), n = sp.length, cx = W / 2, cy = 200, rx = 225, ry = 150, bw = 130; let s = '';
    const pts = sp.map((x, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
    pts.forEach(([x, y]) => s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${C.a}" stroke-width="1.4"/>`);
    const hmax = Math.max(...sp.map(x => boxH(x, bw, { fs: 12.5 })));
    sp.forEach((x, i) => s += box(x, pts[i][0] - bw / 2, pts[i][1] - hmax / 2, bw, C, { fs: 12.5, h: hmax, fill: C.p }).s);
    const c = node(f.center); const cb = box({ ...c, hl: true }, cx - 80, cy - 34, 160, C, { fs: 14 }); s += cb.s;
    return { s, h: cy + ry + hmax / 2 + 20 };
  };
  T.plan = (f, C) => {
    const R = f.rows || 5, K = f.cols || 6, dw = 64, dh = 26, gx = f.groups === 'pairs' ? [] : null; let s = '';
    const gridW = K * dw + (K - 1) * 16, x0 = (W - gridW) / 2, y0 = 84;
    s += `<rect x="${W / 2 - 150}" y="16" width="300" height="12" fill="${C.a}"/>` + txt([f.front || 'Board'], W / 2, 46, 12, C.m, 'middle', 600, C);
    if (f.teacher !== false) s += icon('teacher', W / 2 - 14, 50, 28, C.b);
    const hl = new Set((f.hl || []).map(p => p.join(',')));
    for (let r = 0; r < R; r++) for (let c = 0; c < K; c++) { const x = x0 + c * (dw + 16), y = y0 + r * (dh + 22), on = hl.has(r + ',' + c);
      s += `<rect x="${x}" y="${y}" width="${dw}" height="${dh}" rx="3" fill="${on ? C.s : C.l}" stroke="${on ? C.b : C.a}" stroke-width="${on ? 2.2 : 1.2}"/>`;
      s += `<circle cx="${x + dw * .3}" cy="${y + dh + 8}" r="5" fill="${on ? C.b : C.m}"/><circle cx="${x + dw * .7}" cy="${y + dh + 8}" r="5" fill="${on ? C.b : C.m}"/>`; }
    (f.arrows || []).forEach(a => { const p = ([r, c]) => [x0 + c * (dw + 16) + dw / 2, y0 + r * (dh + 22) + dh / 2]; const [x1, y1] = p(a[0]), [x2, y2] = p(a[1]); s += arrow(x1, y1, x2, y2, C.b, 2); });
    const H = y0 + R * (dh + 22) + 10;
    if (f.note) s += txt(wrap(f.note, 560, 12.5), W / 2, H + 8, 12.5, C.m, 'middle', 400, C);
    return { s, h: H + (f.note ? 30 : 10) };
  };
  T.dialogue = (f, C) => {
    let s = '', y = 18; const who = {}; let k = 0;
    (f.turns || []).forEach(t => { if (!(t.who in who)) who[t.who] = k++ % 2; const left = who[t.who] === 0, bw = 400, L = wrap(t.text, bw - 30, 14), h = L.length * 18 + 18;
      const x = left ? 80 : W - 80 - bw, col = left ? C.a : C.b;
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="12" fill="${left ? C.l : C.s}" stroke="${col}" stroke-width="1.4"/>`;
      s += left ? `<path d="M${x} ${y + 14} l-12 6 l12 6" fill="${C.l}" stroke="${col}" stroke-width="1.4"/>` : `<path d="M${x + bw} ${y + 14} l12 6 l-12 6" fill="${C.s}" stroke="${col}" stroke-width="1.4"/>`;
      s += `<circle cx="${left ? 40 : W - 40}" cy="${y + 20}" r="18" fill="${C.p}" stroke="${col}" stroke-width="1.6"/>` + txt([String(t.who).slice(0, 4)], left ? 40 : W - 40, y + 25, 12, col, 'middle', 700, C);
      s += txt(L, x + 15, y + 23, 14, C.t, 'start', 400, C, 1.28); y += h + 12; });
    return { s, h: y + 6 };
  };
  T.form = (f, C) => {
    const x = 110, w = 420; let s = '', y = 50;
    const fields = f.fields || [], boxes = f.boxes || [];
    let inner = ''; fields.forEach(fl => { inner += txt([fl], x + 24, y + 4, 12.5, C.m, 'start', 600, C) + `<line x1="${x + 24}" y1="${y + 18}" x2="${x + w - 24}" y2="${y + 18}" stroke="${C.m}" stroke-width="1" stroke-dasharray="2 3"/>`; y += 40; });
    boxes.forEach(b => { inner += `<rect x="${x + 24}" y="${y - 9}" width="14" height="14" fill="${C.p}" stroke="${C.a}" stroke-width="1.4"/>` + txt(wrap(b, w - 80, 13), x + 48, y + 3, 13, C.t, 'start', 400, C); y += 30; });
    const H = y + 6;
    s += `<rect x="${x + 5}" y="15" width="${w}" height="${H - 10}" fill="${C.m}" fill-opacity=".15"/><rect x="${x}" y="10" width="${w}" height="${H - 10}" fill="${C.p}" stroke="${C.a}" stroke-width="1.4"/>`;
    s += txt(wrap(f.heading || f.title || '', w - 40, 15).slice(0, 2), x + w / 2, 34, 15, C.t, 'middle', 700, C) + inner;
    return { s, h: H + 14 };
  };
  T.icons = (f, C) => {
    const it = f.items || [], n = it.length, per = Math.min(n, 5), rows = Math.ceil(n / per), cw = (W - 20) / per; let s = '', y = 16;
    for (let r = 0; r < rows; r++) { const row = it.slice(r * per, r * per + per), off = (W - 20 - row.length * cw) / 2; let hmax = 0;
      row.forEach((x, i) => { const cx = 10 + off + i * cw + cw / 2, nd = node(x); s += `<circle cx="${cx}" cy="${y + 34}" r="32" fill="${nd.hl ? C.s : C.l}" stroke="${nd.hl ? C.b : C.a}" stroke-width="1.4"/>` + icon(nd.icon, cx - 18, y + 16, 36, nd.hl ? C.b : C.a);
        const L = wrap(nd.label, cw - 16, 13); s += txt(L, cx, y + 88, 13, C.t, 'middle', 700, C); const S = nd.sub ? wrap(nd.sub, cw - 16, 11.5) : []; if (S.length) s += txt(S, cx, y + 92 + L.length * 16, 11.5, C.m, 'middle', 400, C);
        hmax = Math.max(hmax, 92 + L.length * 16 + S.length * 14);
        if (f.arrows && i < row.length - 1) s += arrow(cx + 38, y + 34, cx + cw - 38, y + 34, C.b, 1.8); });
      y += hmax + 14; }
    return { s, h: y };
  };
  T.compare = T.panels;
  function render(spec, opts = {}) {
    const C = opts.print ? PRINT : DEF; const t = T[spec.type];
    if (!t) throw new Error('Unknown figure type: ' + spec.type);
    const r = t(spec, C); const h = Math.ceil(r.h);
    const label = esc(spec.alt || spec.title || 'Figure');
    const bg = opts.print ? `<rect width="${W}" height="${h}" fill="#FFFFFF"/>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="${label}">${bg}${r.s}</svg>`;
  }
  const api = { render, ICONS, TYPES: Object.keys(T) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FigKit = api;
})(typeof window !== 'undefined' ? window : this);

