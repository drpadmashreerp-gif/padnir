/* @ds-bundle: {"format":4,"namespace":"PadnirCanvas","components":[{"name":"Button"},{"name":"Frame"},{"name":"TopicCircle"},{"name":"PathBar"},{"name":"DataTable"}]} */
(function () {
  var d = document;
  function el(tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var NS = {
    Button: function (o) {
      o = o || {};
      var b = el('button', 'pc-btn pc-btn-' + (o.variant || 'quiet'), o.label);
      b.type = 'button'; if (o.disabled) b.disabled = true;
      if (o.onClick) b.addEventListener('click', o.onClick);
      return b;
    },
    Frame: function (o) {
      o = o || {};
      var f = el('article', 'pc-frame pc-hue-' + (o.hue || 'blue') + (o.quiet ? ' pc-frame-quiet' : '') + (o.zoom ? ' pc-zoom' : ''));
      if (o.eyebrow) f.appendChild(el('p', 'pc-eyebrow', o.eyebrow));
      if (o.numeral) f.appendChild(el('p', 'pc-numeral', o.numeral));
      if (o.title) f.appendChild(el('h3', 'pc-title', o.title));
      if (o.body) f.appendChild(el('p', 'pc-body', o.body));
      if (o.source) f.appendChild(el('p', 'pc-caption', o.source));
      return f;
    },
    TopicCircle: function (o) {
      o = o || {};
      var b = el('button', 'pc-topic pc-hue-' + (o.hue || 'blue'));
      b.type = 'button';
      if (o.current) b.setAttribute('aria-current', 'true');
      b.appendChild(el('span', 'pc-topic-num', String(o.number || '')));
      b.appendChild(el('span', 'pc-topic-label', o.label || ''));
      if (o.onClick) b.addEventListener('click', o.onClick);
      return b;
    },
    PathBar: function (o) {
      o = o || {};
      var steps = o.steps || [], cur = o.current || 0, nav = el('nav', 'pc-path');
      nav.setAttribute('aria-label', 'Presentation path');
      var prev = el('button', 'pc-path-arrow', '‹'), next = el('button', 'pc-path-arrow', '›'), ol = el('ol'), label = el('span', 'pc-path-label');
      prev.setAttribute('aria-label', 'Previous'); next.setAttribute('aria-label', 'Next');
      function go(i) {
        cur = Math.max(0, Math.min(steps.length - 1, i));
        Array.prototype.forEach.call(ol.children, function (li, k) { var b = li.firstChild; if (k === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
        label.textContent = steps[cur] || ''; prev.disabled = cur === 0; next.disabled = cur === steps.length - 1;
        if (o.onChange) o.onChange(cur);
      }
      steps.forEach(function (s, i) { var li = el('li'), b = el('button', null, String(i + 1)); b.setAttribute('aria-label', s); b.addEventListener('click', function () { go(i); }); li.appendChild(b); ol.appendChild(li); });
      prev.addEventListener('click', function () { go(cur - 1); }); next.addEventListener('click', function () { go(cur + 1); });
      nav.appendChild(prev); nav.appendChild(ol); nav.appendChild(label); nav.appendChild(next);
      go(cur);
      return nav;
    },
    DataTable: function (o) {
      o = o || {};
      var t = el('table', 'pc-table'), cols = o.columns || [];
      if (o.caption) t.appendChild(el('caption', null, o.caption));
      var hr = el('tr'); cols.forEach(function (c) { var th = el('th', c.numeric ? 'pc-num' : null, c.label); th.scope = 'col'; hr.appendChild(th); });
      t.appendChild(el('thead')).appendChild(hr);
      var tb = t.appendChild(el('tbody'));
      (o.rows || []).forEach(function (r) {
        var tr = tb.appendChild(el('tr'));
        cols.forEach(function (c, i) { var cls = [c.numeric ? 'pc-num' : '', (i === 0 && r.flag) ? 'pc-flag' : ''].join(' ').trim(); tr.appendChild(el('td', cls || null, String(r.cells[i]))); });
      });
      return t;
    }
  };
  window.PadnirCanvas = Object.assign(window.PadnirCanvas || {}, NS);
})();
