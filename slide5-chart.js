/* Interactive multi-line unemployment chart for slide 5 (dark theme).
   Hover the plot for a year readout; hover/click the legend to isolate a role. */
(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const YEARS = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
  const SERIES = [
    { key:'designer', label:'UX 設計師',  en:'UX Designer',     color:'#ff7c1a', group:'rise',
      data:[3.1,2.8,2.6,2.5,2.4,5.3,3.0,2.7,5.0,6.5,7.7] },
    { key:'frontend', label:'前端工程師', en:'Frontend Eng',    color:'#ff5d6c', group:'rise',
      data:[2.4,2.3,2.3,2.2,2.1,3.4,2.1,2.5,4.6,5.4,6.1] },
    { key:'uxr',      label:'UX 研究員',  en:'User Researcher', color:'#ffb84d', group:'rise',
      data:[2.6,2.5,2.4,2.3,2.2,4.6,2.6,2.6,4.0,5.2,5.8] },
    { key:'pm',       label:'產品經理',   en:'Product Manager', color:'#8a93a3', group:'stable',
      data:[2.5,2.4,2.4,2.3,2.2,2.7,2.3,2.4,2.7,2.9,3.0] },
    { key:'backend',  label:'後端工程師', en:'Backend Eng',     color:'#5e6675', group:'stable',
      data:[2.0,2.0,1.9,1.9,1.8,2.5,1.2,1.8,2.6,2.8,2.9] },
  ];

  const W = 980, H = 470, ML = 46, MR = 22, MT = 18, MB = 42;
  const PW = W - ML - MR, PH = H - MT - MB, YMAX = 8.5;
  const x = i => ML + (i / (YEARS.length - 1)) * PW;
  const y = v => MT + (1 - v / YMAX) * PH;
  const el = (n, a) => { const e = document.createElementNS(SVGNS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

  function build(container) {
    container.innerHTML = '';
    container.style.position = 'relative';

    // ---- Legend ----
    const legend = document.createElement('div');
    legend.className = 'uc-legend';
    SERIES.forEach(s => {
      const b = document.createElement('button');
      b.className = 'uc-leg'; b.dataset.key = s.key; b.type = 'button';
      b.innerHTML = '<span class="uc-dot" style="background:' + s.color + '"></span>' +
                    '<span class="uc-leg-tx">' + s.label + '</span>';
      legend.appendChild(b);
    });
    container.appendChild(legend);

    // ---- SVG ----
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'uc-svg' });
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // aggregation-era shaded region (2022.5 -> 2025)
    svg.appendChild(el('rect', { x: x(7.5), y: MT, width: x(10) - x(7.5), height: PH, fill: '#ff7c1a', opacity: 0.07 }));
    const eraTx = el('text', { x: (x(7.5) + x(10)) / 2, y: MT + 22, 'text-anchor': 'middle', class: 'uc-era' });
    eraTx.textContent = '大聚合時代';
    svg.appendChild(eraTx);
    // covid band (2020)
    svg.appendChild(el('rect', { x: x(4.62), y: MT, width: x(5.38) - x(4.62), height: PH, fill: '#ffffff', opacity: 0.05 }));

    // gridlines + y labels
    for (let v = 0; v <= 8; v += 2) {
      svg.appendChild(el('line', { x1: ML, y1: y(v), x2: ML + PW, y2: y(v), stroke: '#ffffff', 'stroke-opacity': v === 0 ? 0.22 : 0.09, 'stroke-width': 1 }));
      const t = el('text', { x: ML - 12, y: y(v) + 5, 'text-anchor': 'end', class: 'uc-axis' });
      t.textContent = v + '%';
      svg.appendChild(t);
    }
    // x labels
    YEARS.forEach((yr, i) => {
      const t = el('text', { x: x(i), y: H - 14, 'text-anchor': 'middle', class: 'uc-axis' });
      t.textContent = yr;
      svg.appendChild(t);
    });

    // hover guide
    const guide = el('line', { x1: 0, y1: MT, x2: 0, y2: MT + PH, stroke: '#ff7c1a', 'stroke-width': 1.5, 'stroke-dasharray': '4 5', opacity: 0 });
    svg.appendChild(guide);

    // series paths + dots
    const paths = {}, dotsByKey = {};
    SERIES.forEach(s => {
      const d = s.data.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
      const p = el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'uc-line', 'data-key': s.key });
      svg.appendChild(p); paths[s.key] = p;
      const g = el('g', { 'data-key': s.key });
      s.data.forEach((v, i) => g.appendChild(el('circle', { cx: x(i), cy: y(v), r: 3.2, fill: '#15161c', stroke: s.color, 'stroke-width': 2.6, class: 'uc-dot-pt', 'data-i': i })));
      svg.appendChild(g); dotsByKey[s.key] = g;
    });

    // end-value labels
    SERIES.forEach(s => {
      const t = el('text', { x: x(10) + 8, y: y(s.data[10]) + 5 + (s.key === 'backend' ? 17 : s.key === 'uxr' ? 11 : 0), class: 'uc-end', fill: s.color, 'data-key': s.key });
      t.textContent = s.data[10].toFixed(1) + '%';
      svg.appendChild(t);
    });

    // hover capture
    const hit = el('rect', { x: ML, y: MT, width: PW, height: PH, fill: 'transparent', style: 'cursor:crosshair' });
    svg.appendChild(hit);
    container.appendChild(svg);

    // tooltip
    const tip = document.createElement('div');
    tip.className = 'uc-tip'; tip.style.opacity = '0';
    container.appendChild(tip);

    // ---------- interactions ----------
    let hidden = {};
    function applyState(hoverKey) {
      SERIES.forEach(s => {
        const off = hidden[s.key];
        const dim = hoverKey && hoverKey !== s.key;
        const op = off ? 0.12 : (dim ? 0.16 : 1);
        paths[s.key].style.opacity = op;
        dotsByKey[s.key].style.opacity = off ? 0.12 : (dim ? 0.16 : 1);
        paths[s.key].style.strokeWidth = (hoverKey === s.key) ? 4.6 : 3.4;
        container.querySelector('.uc-leg[data-key="' + s.key + '"]').classList.toggle('off', !!off);
        const endL = svg.querySelector('.uc-end[data-key="' + s.key + '"]');
        if (endL) endL.style.opacity = off ? 0 : (dim ? 0.2 : 1);
      });
    }
    legend.querySelectorAll('.uc-leg').forEach(btn => {
      const k = btn.dataset.key;
      btn.addEventListener('mouseenter', () => applyState(k));
      btn.addEventListener('mouseleave', () => applyState(null));
      btn.addEventListener('click', () => { hidden[k] = !hidden[k]; applyState(null); });
    });

    function showAt(i) {
      guide.setAttribute('x1', x(i)); guide.setAttribute('x2', x(i)); guide.setAttribute('opacity', 1);
      SERIES.forEach(s => {
        dotsByKey[s.key].querySelectorAll('circle').forEach((c, idx) => c.setAttribute('r', idx === i ? 6 : 3.2));
      });
      const rows = SERIES.filter(s => !hidden[s.key]).sort((a, b) => b.data[i] - a.data[i])
        .map(s => '<div class="uc-tip-row"><span class="uc-dot" style="background:' + s.color + '"></span>' +
                  '<span class="uc-tip-l">' + s.label + '</span><span class="uc-tip-v">' + s.data[i].toFixed(1) + '%</span></div>').join('');
      tip.innerHTML = '<div class="uc-tip-h">' + YEARS[i] + '</div>' + rows;
      const rect = container.getBoundingClientRect();
      const px = (x(i) / W) * rect.width;
      tip.style.opacity = '1';
      tip.style.left = Math.min(Math.max(px + 14, 8), rect.width - tip.offsetWidth - 8) + 'px';
      tip.style.top = '62px';
    }
    function hideTip() {
      guide.setAttribute('opacity', 0); tip.style.opacity = '0';
      SERIES.forEach(s => dotsByKey[s.key].querySelectorAll('circle').forEach(c => c.setAttribute('r', 3.2)));
    }
    hit.addEventListener('mousemove', ev => {
      const r = svg.getBoundingClientRect();
      const mx = (ev.clientX - r.left) / r.width * W;
      let i = Math.round((mx - ML) / PW * (YEARS.length - 1));
      i = Math.max(0, Math.min(YEARS.length - 1, i));
      showAt(i);
    });
    hit.addEventListener('mouseleave', hideTip);

    // ---------- draw animation ----------
    function setup() {
      SERIES.forEach((s, idx) => {
        const p = paths[s.key]; const len = p.getTotalLength();
        p.style.transition = 'none';
        p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
        dotsByKey[s.key].style.transition = 'none'; dotsByKey[s.key].style.opacity = 0;
      });
    }
    function draw() {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      SERIES.forEach((s, idx) => {
        const p = paths[s.key]; const len = p.getTotalLength();
        const g = dotsByKey[s.key];
        if (reduce) { p.style.strokeDashoffset = 0; g.style.opacity = 1; return; }
        // reflow then transition
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 1.15s cubic-bezier(.22,.68,0,1) ' + (idx * 0.12) + 's';
        p.style.strokeDashoffset = 0;
        g.style.transition = 'opacity .5s ease ' + (0.6 + idx * 0.12) + 's';
        g.style.opacity = 1;
        // safety net: guarantee final visible state even if the transition is throttled
        clearTimeout(p._ucT);
        p._ucT = setTimeout(() => { p.style.strokeDashoffset = 0; g.style.opacity = 1; }, 1600 + idx * 120);
      });
    }
    container._ucReplay = function () { setup(); requestAnimationFrame(() => requestAnimationFrame(draw)); };
    // initial: if its slide is already active, animate; else show fully drawn
    const slide = container.closest('section');
    if (slide && slide.hasAttribute('data-deck-active')) container._ucReplay();
    else { SERIES.forEach(s => { paths[s.key].style.strokeDashoffset = 0; dotsByKey[s.key].style.opacity = 1; }); }
  }

  function init() {
    const c = document.getElementById('unemp-chart');
    if (!c) return;
    build(c);
    document.addEventListener('slidechange', e => {
      if (e.detail && e.detail.slide && e.detail.slide.contains(c) && c._ucReplay) c._ucReplay();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
