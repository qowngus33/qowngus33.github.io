/* Decorative, bounded canvas: type code, then erase the completed line in place. */
(() => {
  const shell = document.querySelector('.game-shell');
  const tabs = document.querySelector('.editor-tabs');
  const viewport = document.getElementById('gameViewport');
  if (!shell || !tabs || !viewport) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'code-background';
  canvas.setAttribute('aria-hidden', 'true');
  shell.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'code-effects-toggle';
  tabs.appendChild(toggle);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  let width = 0, height = 0, lanes = [], previous = 0, frame = 0;
  const palette = ['#bba5ff', '#86e6be', '#82bfff', '#f5b8d9', '#f1ca86'];
  const snippets = [
    'const journey = await explore("computer vision");',
    'for (const year of memories) { collect(star); }',
    'motion = camera.pose(t) + local.residual(t);',
    'const blur = render(sharp, trajectory);',
    'await train({ curiosity: Infinity, coffee: true });',
    'if (bug.detected) { jump(); keepGoing(); }',
    'git commit -m "one more step forward"',
    'model.learn(); ideas.grow(); dreams.compile();',
    'return { stars, coins, next: "AI engineer" };'
  ];
  function makeLane(i, stagger = true) {
    const text = snippets[Math.floor(Math.random() * snippets.length)];
    const columns = Math.max(18, Math.min(text.length, Math.floor((width - 48) / 9)));
    return { text: text.slice(0, columns), x: 24 + Math.random() * Math.max(0, width - columns * 9 - 64),
      y: 30 + i * 80, age: stagger ? Math.random() * 5 : -Math.random(), speed: 12 + Math.random() * 6,
      color: palette[i % palette.length], seed: Math.random() * 8 };
  }
  function resize() {
    width = viewport.clientWidth;
    height = viewport.clientHeight;
    canvas.style.top = `${viewport.offsetTop}px`;
    canvas.style.height = `${height}px`;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    lanes = Array.from({length: Math.max(2, Math.min(5, Math.floor((height - 110) / 80)))}, (_, i) => makeLane(i));
    if (!enabled) ctx.clearRect(0, 0, width, height);
  }
  function draw(now) {
    frame = 0;
    if (!enabled || document.hidden) return;
    if (now - previous < 32) { frame = requestAnimationFrame(draw); return; }
    const dt = previous ? Math.min((now - previous) / 1000, .06) : .033;
    previous = now;
    ctx.clearRect(0, 0, width, height);
    ctx.font = '13px ui-monospace, SFMono-Regular, Consolas, monospace';
    lanes.forEach((lane, i) => {
      lane.age += dt;
      const eraseStart = lane.text.length / lane.speed + 2;
      const eraseSpeed = 22;
      const count = lane.age < eraseStart
        ? Math.min(lane.text.length, Math.floor(Math.max(0, lane.age) * lane.speed))
        : Math.max(0, lane.text.length - Math.floor((lane.age - eraseStart) * eraseSpeed));
      ctx.fillStyle = lane.color;
      ctx.shadowColor = lane.color; ctx.shadowBlur = 2;
      ctx.globalAlpha = .28;
      ctx.fillText(lane.text.slice(0, count), lane.x, lane.y);
      if (lane.age >= 0 && count > 0) {
        ctx.globalAlpha = .35;
        ctx.fillRect(lane.x + ctx.measureText(lane.text.slice(0, count)).width + 2, lane.y - 11, 2, 13);
      }
      if (lane.age > eraseStart + lane.text.length / eraseSpeed + 1.5) lanes[i] = makeLane(i, false);
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    toggle.textContent = enabled ? '✦ FX ON' : '✦ FX OFF';
    toggle.setAttribute('aria-label', 'Animated code background');
    toggle.setAttribute('aria-pressed', String(enabled));
    if (enabled && !document.hidden) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, width, height);
  }
  toggle.addEventListener('click', () => { enabled = !enabled; sync(); });
  reduced.addEventListener('change', () => { enabled = !reduced.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize);
  resize(); sync();
})();
