/* Phonetics illustrations: a side view of the mouth for consonants (place of articulation)
   and a vowel chart for monophthongs and diphthongs. Original, simplified drawings. */
(function (root) {
  const C = { ink: 'var(--ink)', soft: 'var(--ink-2)', hl: 'var(--maroon)', fill: 'var(--sky)', tongue: 'var(--rose)', gold: 'var(--gold)' };
  const PLACES = {
    bilabial: [38, 98, 'both lips'], 'bilabial (labial-velar)': [38, 98, 'lips rounded + back of tongue raised'],
    labiodental: [46, 92, 'lower lip + upper teeth'], dental: [56, 92, 'tongue tip + upper teeth'],
    alveolar: [68, 78, 'tongue tip + ridge behind teeth'], postalveolar: [84, 70, 'tongue blade behind the ridge'],
    palatal: [108, 64, 'tongue front + hard palate'], velar: [142, 76, 'back of tongue + soft palate'],
    glottal: [168, 168, 'vocal folds (glottis)']
  };
  function mouth(ph) {
    const pl = PLACES[ph.place] || PLACES.alveolar, nasal = ph.manner === 'nasal';
    return `<svg viewBox="0 0 220 210" role="img" aria-label="Side view of the mouth: ${ph.place} ${ph.manner}, ${ph.v ? 'voiced' : 'voiceless'}">
  <path d="M20 20 Q30 40 26 60 L14 74 Q22 80 28 82 L30 88 Q24 94 30 98 L28 104 Q22 112 30 120 Q26 140 40 150 L60 160 Q70 180 72 205" fill="none" stroke="${C.soft}" stroke-width="2"/>
  <path d="M40 66 Q90 30 160 58 Q176 66 176 80" fill="none" stroke="${C.soft}" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="98" y="40" font-size="9" fill="${C.soft}" text-anchor="middle" font-family="var(--ui)">nasal cavity</text>
  <path d="M36 88 Q50 86 56 84 Q64 74 74 74 Q100 58 130 62 Q148 66 156 76" fill="none" stroke="${C.ink}" stroke-width="2.5"/>
  <path d="M156 76 Q166 84 162 ${nasal ? 98 : 88}" fill="none" stroke="${nasal ? C.hl : C.ink}" stroke-width="3"/>
  <rect x="50" y="84" width="6" height="10" rx="1" fill="${C.ink}"/><rect x="50" y="100" width="6" height="9" rx="1" fill="${C.ink}"/>
  <path d="M58 106 Q70 92 100 86 Q140 80 156 100 Q164 120 160 150" fill="${C.tongue}" stroke="${C.ink}" stroke-width="2"/>
  <path d="M176 80 L176 196 M156 150 L160 196" stroke="${C.soft}" stroke-width="1.5"/>
  <line x1="160" y1="170" x2="176" y2="166" stroke="${ph.v ? C.hl : C.soft}" stroke-width="${ph.v ? 3 : 1.5}"/>
  ${ph.v ? `<path d="M182 160 q4 3 0 6 q-4 3 0 6 q4 3 0 6" fill="none" stroke="${C.hl}" stroke-width="1.6"/>` : ''}
  ${nasal ? `<path d="M150 70 Q100 44 30 64" fill="none" stroke="${C.hl}" stroke-width="2" marker-end="url(#ah)"/>` : ''}
  <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="${C.hl}"/></marker></defs>
  <circle cx="${pl[0]}" cy="${pl[1]}" r="9" fill="none" stroke="${C.hl}" stroke-width="3"/>
  <circle cx="${pl[0]}" cy="${pl[1]}" r="3" fill="${C.hl}"/>
  <text x="110" y="204" font-size="10.5" fill="${C.ink}" text-anchor="middle" font-family="var(--ui)" font-weight="700">${pl[2]}</text>
  <text x="200" y="150" font-size="9" fill="${C.soft}" text-anchor="middle" font-family="var(--ui)">${ph.v ? 'voice on' : 'voice off'}</text>
</svg>`;
  }
  const HY = { close: 0, 'near-close': .14, 'close-mid': .33, mid: .5, 'open-mid': .66, 'near-open': .85, open: 1 };
  const BX = { front: 0, 'near-front': .2, central: .5, 'near-back': .8, back: 1 };
  const X0 = 30, X1 = 200, Y0 = 26, Y1 = 186;
  function pos(v) { const y = HY[v.h] ?? .5, left = X0 + 60 * y; return [left + (X1 - left) * (BX[v.b] ?? .5), Y0 + (Y1 - Y0) * y]; }
  function vowelChart(all, sel) {
    const byS = {}; all.monophthongs.forEach(v => byS[v.s] = v);
    let s = `<svg viewBox="-16 0 246 214" role="img" aria-label="Vowel chart showing where the tongue is for /${sel.s}/">
  <path d="M${X0} ${Y0} H${X1} V${Y1} H${X0 + 60}z" fill="${C.fill}" stroke="${C.ink}" stroke-width="1.5"/>
  <line x1="${X0 + 20}" y1="${Y0 + 53}" x2="${X1}" y2="${Y0 + 53}" stroke="${C.soft}" stroke-dasharray="3 3"/>
  <line x1="${X0 + 40}" y1="${Y0 + 106}" x2="${X1}" y2="${Y0 + 106}" stroke="${C.soft}" stroke-dasharray="3 3"/>
  <text x="${X0}" y="16" font-size="10" fill="${C.soft}" font-family="var(--ui)">front</text>
  <text x="${X1}" y="16" font-size="10" fill="${C.soft}" text-anchor="end" font-family="var(--ui)">back</text>
  <text x="${X0 - 4}" y="${Y0 + 4}" font-size="10" fill="${C.soft}" text-anchor="end" font-family="var(--ui)">close</text>
  <text x="${X0 + 56}" y="${Y1 + 4}" font-size="10" fill="${C.soft}" text-anchor="end" font-family="var(--ui)">open</text>
  <text x="115" y="208" font-size="10" fill="${C.soft}" text-anchor="middle" font-family="var(--ui)">tongue position (mouth facing left)</text>`;
    all.monophthongs.forEach(v => { const [x, y] = pos(v), on = v.s === sel.s;
      s += `<circle cx="${x}" cy="${y}" r="${on ? 13 : 9}" fill="${on ? C.hl : 'var(--page)'}" stroke="${C.ink}" stroke-width="1"/><text x="${x}" y="${y + 4}" font-size="${on ? 12 : 10}" text-anchor="middle" fill="${on ? 'var(--page)' : C.ink}" font-family="var(--ipa)" font-weight="700">${v.s}</text>`; });
    if (sel.from) { const a = byS[sel.from], b = byS[sel.to] || byS[sel.to + 'ː']; if (a && b) { const [x1, y1] = pos(a), [x2, y2] = pos(b);
      s += `<defs><marker id="vh" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="${C.gold}"/></marker></defs><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.gold}" stroke-width="4" marker-end="url(#vh)" opacity=".9"/>`; } }
    return s + '</svg>';
  }
  root.Illus = { mouth, vowelChart };
})(window);
