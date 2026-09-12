(() => {
  const viewport = document.getElementById('gameViewport');
  const world = document.getElementById('gameWorld');
  const player = document.getElementById('player');
  const progressFill = document.getElementById('progressFill');
  const statusYear = document.getElementById('statusYear');
  const hint = document.getElementById('interactionHint');
  const intro = document.getElementById('introOverlay');
  const modal = document.getElementById('projectModal');
  const completionModal = document.getElementById('completionModal');
  const stations = [...document.querySelectorAll('.timeline-station')];
  const openButton = document.getElementById('openProject');
  const starCounter = document.getElementById('starCounter');
  const starCount = document.getElementById('starCount');
  const starAward = document.getElementById('starAward');
  const coinCount = document.getElementById('coinCount');
  let coinBalance = 0;
  let coinsEarned = 0;
  let coinsLost = 0;
  let runSaved = false;
  const coins = [];
  // Replaces the old decorative coins with collectible jump arcs.
  document.querySelectorAll('.coin-row').forEach(row => row.remove());
  [1300, 2230, 3180, 4090, 5100, 6180, 6990].forEach(center => {
    [-100, -50, 0, 50, 100].forEach((offset, i) => {
      const element = document.createElement('i');
      element.className = 'collectible-coin';
      const x = center + offset;
      const y = [35, 80, 110, 80, 35][i];
      element.style.left = `${x}px`;
      element.style.setProperty('--coin-y', `${y}px`);
      world.appendChild(element);
      coins.push({element, x, y, collected:false});
    });
  });

  function collectCoins() {
    coins.forEach(coin => {
      if (coin.collected || Math.abs(coin.x - playerX) > 30 ||
          coin.y < jumpY + 12 || coin.y > jumpY + 98) return;
      coin.collected = true;
      coinBalance++; coinsEarned++;
      coin.element.classList.add('taken');
    });
    coinCount.textContent = coinBalance;
  }

  const stationPositions = stations.map((station) => ({
    element: station,
    x: Number.parseFloat(station.style.getPropertyValue('--x')),
    year: station.dataset.year
  }));

  const bugConfigs = [
    { x: 1360, min: 1180, max: 1510, speed: 58 },
    { x: 2290, min: 2070, max: 2470, speed: 72 },
    { x: 3260, min: 3070, max: 3430, speed: 64 },
    { x: 4160, min: 3970, max: 4330, speed: 82 },
    { x: 5100, min: 4920, max: 5350, speed: 67 },
    { x: 6240, min: 6030, max: 6510, speed: 78 },
    { x: 7040, min: 6900, max: 7120, speed: 88 }
  ];

  const bugs = bugConfigs.map((config, index) => {
    const element = document.createElement('div');
    element.className = `game-bug bug-${(index % 3) + 1}`;
    element.innerHTML = '<span class="bug-antenna left"></span><span class="bug-antenna right"></span><span class="bug-body"><i></i><i></i></span><span class="bug-legs"></span>';
    document.getElementById('bugLayer').appendChild(element);
    element.style.left = `${config.x}px`;
    return { ...config, element };
  });

  let playerX = 420;
  let jumpY = 0;
  let jumpVelocity = 0;
  let direction = 1;
  let nearestStation = null;
  let lastFrame = performance.now();
  let gameStarted = false;
  let hitUntil = 0;
  let completionShown = false;
  const keys = new Set();
  const collectedStars = new Set();
  const maxX = 8110;
  const finishX = stationPositions[stationPositions.length - 1].x + 340;
  const speed = 360;
  const gravity = 1750;
  const jumpStrength = 690;

  function overlayOpen() {
    return modal.classList.contains('open') || completionModal.classList.contains('open');
  }

  function updateNearest() {
    let closest = null;
    let distance = Infinity;
    stationPositions.forEach((station) => {
      const currentDistance = Math.abs(station.x - playerX);
      if (currentDistance < distance) {
        closest = station;
        distance = currentDistance;
      }
    });

    stations.forEach((station) => station.classList.remove('nearby'));
    nearestStation = distance < 65 && jumpY === 0 ? closest : null;
    if (nearestStation) {
      nearestStation.element.classList.add('nearby');
      hint.textContent = `Press Space to explore ${nearestStation.year}`;
      hint.classList.add('visible');
      openButton.textContent = 'OPEN';
      openButton.classList.add('active');
    } else {
      hint.classList.remove('visible');
      openButton.textContent = 'JUMP';
      openButton.classList.add('active');
    }
  }

  function updateStatus() {
    const progress = Math.max(0, Math.min(100, ((playerX - 420) / (finishX - 420)) * 100));
    progressFill.style.width = `${progress}%`;
    const reached = stationPositions.filter((station) => playerX >= station.x - 260);
    statusYear.textContent = reached.length ? reached.at(-1).year : '2020';
  }

  function updatePlayerPosition() {
    player.style.left = `${playerX}px`;
    player.style.setProperty('--jump-y', `${jumpY}px`);
    player.style.setProperty('--shadow-y', `${-jumpY}px`);
    player.style.setProperty('--facing', direction);
    const targetScroll = Math.max(0, playerX - viewport.clientWidth * 0.42);
    viewport.scrollLeft = targetScroll;
    updateNearest();
    updateStatus();
  }

  function movePlayer(delta) {
    if (!delta || performance.now() < hitUntil) {
      player.classList.remove('walking');
      return;
    }
    direction = Math.sign(delta);
    playerX = Math.max(260, Math.min(maxX, playerX + delta));
    player.classList.add('walking');
    updatePlayerPosition();
  }

  function jump() {
    if (!gameStarted || overlayOpen() || jumpY > 1) return;
    jumpVelocity = jumpStrength;
    player.classList.add('jumping');
  }

  function updateJump(dt) {
    if (jumpY <= 0 && jumpVelocity <= 0) return;
    jumpVelocity -= gravity * dt;
    jumpY += jumpVelocity * dt;
    if (jumpY <= 0) {
      jumpY = 0;
      jumpVelocity = 0;
      player.classList.remove('jumping');
    }
    updatePlayerPosition();
  }

  function updateBugs(dt) {
    bugs.forEach((bug) => {
      bug.x -= bug.speed * dt;
      // Never wrap inside the visible playfield. Respawn beyond its right edge.
      if (bug.x < -100) bug.x = Math.max(8500, viewport.scrollLeft + viewport.clientWidth + 180);
      bug.element.style.left = `${bug.x}px`;
    });
  }

  function showHitFeedback(loss) {
    const feedback = document.createElement('div');
    feedback.className = 'hit-feedback';
    feedback.textContent = `OUCH!  −${loss} COINS · KNOCKBACK`;
    document.body.appendChild(feedback);
    window.setTimeout(() => feedback.remove(), 900);
  }

  function checkBugCollisions(now) {
    if (now < hitUntil || jumpY > 42) return;
    const collision = bugs.find((bug) => Math.abs(bug.x - playerX) < 47);
    if (!collision) return;

    hitUntil = now + 1050;
    playerX = Math.max(260, playerX - 240);
    jumpVelocity = 230;
    jumpY = 8;
    player.classList.add('hit', 'jumping');
    const loss = Math.min(3, coinBalance);
    coinBalance -= loss;
    coinsLost += loss;
    coinCount.textContent = coinBalance;
    showHitFeedback(loss);
    updatePlayerPosition();
    window.setTimeout(() => player.classList.remove('hit'), 650);
  }

  function animateStar(station) {
    const from = station.getBoundingClientRect();
    const to = starCounter.getBoundingClientRect();
    const flyingStar = document.createElement('span');
    flyingStar.className = 'flying-star';
    flyingStar.textContent = '★';
    flyingStar.style.left = `${from.left + from.width / 2}px`;
    flyingStar.style.top = `${from.top + 52}px`;
    document.body.appendChild(flyingStar);

    requestAnimationFrame(() => {
      flyingStar.style.left = `${to.left + to.width / 2}px`;
      flyingStar.style.top = `${to.top + to.height / 2}px`;
      flyingStar.style.transform = 'translate(-50%,-50%) scale(.35) rotate(540deg)';
      flyingStar.style.opacity = '0';
    });
    window.setTimeout(() => {
      flyingStar.remove();
      starCounter.classList.add('pulse');
      window.setTimeout(() => starCounter.classList.remove('pulse'), 420);
    }, 780);
  }

  function collectStar(station) {
    const id = station.dataset.starId;
    if (collectedStars.has(id)) return false;
    collectedStars.add(id);
    station.classList.add('collected');
    starCount.textContent = String(collectedStars.size);
    animateStar(station);
    return true;
  }

  function openProject(station) {
    if (!station) return;
    const data = station.dataset;
    const isNewStar = collectStar(station);

    document.getElementById('modalTag').textContent = data.tag;
    document.getElementById('modalYear').textContent = data.year;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalSubtitle').textContent = data.subtitle;
    document.getElementById('modalBody').textContent = data.body;
    const image = document.getElementById('modalImage');
    image.src = data.image;
    image.alt = data.title;

    const metric = document.getElementById('modalMetric');
    metric.textContent = data.metric || '';
    metric.classList.toggle('visible', Boolean(data.metric));

    const skillContainer = document.getElementById('modalSkills');
    skillContainer.replaceChildren(...data.skills.split(',').map((skill) => {
      const chip = document.createElement('span');
      chip.textContent = skill;
      return chip;
    }));

    starAward.innerHTML = isNewStar ? '<span>★</span><b>MEMORY STAR +1</b>' : '<span>★</span><b>MEMORY REVISITED</b>';
    modal.classList.toggle('new-star', isNewStar);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    keys.clear();
    window.setTimeout(() => document.querySelector('.modal-close').focus(), 260);
  }

  function closeModal() {
    if (modal.classList.contains('closing')) return;
    modal.classList.add('closing');
    window.setTimeout(() => {
      modal.classList.remove('open', 'closing', 'new-star');
      modal.setAttribute('aria-hidden', 'true');
      viewport.focus({ preventScroll: true });
    }, 260);
  }

  function showCompletion() {
    completionShown = true;
    const stars = document.getElementById('completionStars');
    stars.replaceChildren(...stations.map((station) => {
      const item = document.createElement('span');
      const collected = collectedStars.has(station.dataset.starId);
      item.textContent = collected ? '★' : '☆';
      item.className = collected ? 'collected' : '';
      item.title = `${station.dataset.year} · ${station.dataset.title}`;
      return item;
    }));
    document.getElementById('completionScore').textContent = `${collectedStars.size} / ${stations.length} STARS`;
    document.getElementById('completionCoins').textContent = `${coinBalance} COINS · collected ${coinsEarned} / ${coins.length} · lost ${coinsLost}`;
    renderGuestbook();
    document.getElementById('completionMessage').textContent = collectedStars.size === stations.length
      ? 'Every chapter discovered. The next problem awaits.'
      : `${stations.length - collectedStars.size} memories are still waiting behind you.`;
    completionModal.classList.add('open');
    completionModal.setAttribute('aria-hidden', 'false');
    keys.clear();
    document.getElementById('visitorName').focus({preventScroll:true});
  }

  function closeCompletion() {
    completionModal.classList.remove('open');
    completionModal.setAttribute('aria-hidden', 'true');
    playerX = Math.min(playerX, finishX - 180);
    completionShown = false;
    updatePlayerPosition();
    viewport.focus({ preventScroll: true });
  }

  function useSpaceAction() {
    if (completionModal.classList.contains('open')) {
      closeCompletion();
    } else if (modal.classList.contains('open')) {
      closeModal();
    } else if (nearestStation) {
      openProject(nearestStation.element);
    } else {
      jump();
    }
  }

  function loop(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.04);
    lastFrame = now;
    if (gameStarted && !overlayOpen()) {
      const left = keys.has('ArrowLeft') || keys.has('a') || keys.has('A');
      const right = keys.has('ArrowRight') || keys.has('d') || keys.has('D');
      movePlayer(((right ? 1 : 0) - (left ? 1 : 0)) * speed * dt);
      updateJump(dt);
      updateBugs(dt);
      checkBugCollisions(now);
      collectCoins();
      if (playerX >= finishX && !completionShown) showCompletion();
    }
    requestAnimationFrame(loop);
  }

  function bindHold(button, key) {
    const start = (event) => {
      event.preventDefault();
      keys.add(key);
    };
    const stop = (event) => {
      event.preventDefault();
      keys.delete(key);
    };
    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
  }

  document.addEventListener('keydown', (event) => {
    if (event.target?.matches('input, textarea, [contenteditable="true"]')) return;
    if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(event.key)) {
      event.preventDefault();
      keys.add(event.key);
    }
    if (event.code === 'Space') {
      event.preventDefault();
      if (gameStarted && !event.repeat) useSpaceAction();
    }
    if (event.key === 'Escape') {
      if (completionModal.classList.contains('open')) closeCompletion();
      else if (modal.classList.contains('open')) closeModal();
    }
  });
  document.addEventListener('keyup', (event) => keys.delete(event.key));
  window.addEventListener('blur', () => keys.clear());

  let pendingVisit = null;
  let submitting = false;
  async function renderGuestbook() {
    const list = document.getElementById('guestbookEntries');
    list.replaceChildren();
    try {
      const rows = await window.journeyGuestbook.list();
      if (!rows.length) {
        const li = document.createElement('li');
        li.textContent = 'No visits yet. Be the first!';
        list.appendChild(li);
      }
      rows.forEach(row => {
        const li = document.createElement('li');
        li.textContent = `${row.name} — ★ ${row.stars} · ${row.coins} coins · ${new Date(row.created_at).toLocaleDateString()}${row.message ? ' — ' + row.message : ''}`;
        list.appendChild(li);
      });
    } catch {
      const li = document.createElement('li');
      li.textContent = 'Guestbook could not load. Check the connection or try again later.';
      list.appendChild(li);
    }
  }
  document.getElementById('guestbookForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (runSaved || submitting || !completionModal.classList.contains('open')) return;
    const name = document.getElementById('visitorName').value.trim().slice(0,24);
    if (!name) return;
    const button = document.getElementById('saveVisit');
    const status = document.getElementById('guestbookStatus');
    submitting = true;
    button.disabled = true;
    status.textContent = 'Sending your visit…';
    try {
      // Keep the same ID and payload on retries after an ambiguous network failure.
      pendingVisit ||= {p_id:crypto.randomUUID(), p_name:name,
        p_message:document.getElementById('visitorMessage').value.trim().slice(0,160),
        p_stars:collectedStars.size, p_coins:coinBalance};
      await window.journeyGuestbook.submit(pendingVisit);
      runSaved = true;
      status.textContent = 'Published! Thank you for playing.';
      await renderGuestbook();
    } catch (error) {
      status.textContent = window.journeyGuestbook.errorMessage(error);
    } finally {
      submitting = false;
      button.disabled = runSaved;
    }
  });

  document.getElementById('startGame').addEventListener('click', () => {
    intro.classList.add('hidden');
    gameStarted = true;
    viewport.focus({ preventScroll: true });
  });
  stations.forEach((station) => station.addEventListener('click', () => openProject(station)));
  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
  document.getElementById('keepExploring').addEventListener('click', closeCompletion);
  openButton.addEventListener('click', useSpaceAction);
  bindHold(document.getElementById('moveLeft'), 'ArrowLeft');
  bindHold(document.getElementById('moveRight'), 'ArrowRight');

  world.style.width = getComputedStyle(document.documentElement).getPropertyValue('--world-width');
  updatePlayerPosition();
  requestAnimationFrame(loop);
})();
