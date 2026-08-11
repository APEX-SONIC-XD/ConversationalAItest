// AI comparison chat (initFavoritesPage runs from app.js).
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('favorites-root');
  if (!root) return;

  const table = document.getElementById('fav-table');
  const foot = document.getElementById('fav-foot');
  const form = document.getElementById('fav-chat-form');
  const input = document.getElementById('fav-chat-input');
  const log = document.getElementById('fav-chat-log');
  const wrap = document.getElementById('fav-compare-wrap');
  if (!table || !foot || !form || !input || !log || !wrap || wrap.hidden) return;

  const CARS = (window.FAVORITES_CARS || []).map(c => Object.assign({}, c, {
    dist: c.distMin != null ? c.distMin : (c.dist || 0),
  }));
  if (CARS.length < 2) return;

  const METRICS = {
    price: { dir: 'min', label: 'lowest price', phrase: c => '$' + c.price.toLocaleString() },
    mpg:   { dir: 'max', label: 'best fuel economy', phrase: c => c.mpg + ' mpg' },
    hp:    { dir: 'max', label: 'most horsepower', phrase: c => c.hp + ' hp' },
    zero:  { dir: 'min', label: 'quickest 0–60', phrase: c => c.zero + 's 0–60' },
    miles: { dir: 'min', label: 'lowest mileage', phrase: c => c.miles.toLocaleString() + ' mi' },
    dist:  { dir: 'min', label: 'closest location', phrase: c => (c.dist === 0 ? 'at your dealer' : c.dist + ' mi away') },
    value: { dir: 'max', label: 'best value vs market', phrase: c => (c.value ? '$' + c.value.toLocaleString() + ' below market' : 'at market') },
  };

  const originalFoot = foot.innerHTML;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function push(role, html) {
    const el = document.createElement('div');
    el.className = `cmp-msg cmp-msg-${role}`;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function parseMetrics(text) {
    const t = ' ' + text.toLowerCase() + ' ';
    const found = [];
    const add = m => { if (!found.includes(m)) found.push(m); };
    if (/cheap|cheapest|price|budget|afford|inexpensive|low cost|save money|lowest|location/.test(t)) add('price');
    if (/kbb|blue book|value|deal|below market|discount|worth/.test(t)) add('value');
    if (/mpg|fuel|economy|efficien|gas mileage/.test(t)) add('mpg');
    if (/horsepower|\bhp\b|power|powerful/.test(t)) add('hp');
    if (/0-60|0–60|accelerat|quick|fastest|\bfast\b|sporty/.test(t)) add('zero');
    if (/low mile|fewest mile|least mile|lowest mile|odometer|new(est)?\b/.test(t)) add('miles');
    if (/close|closest|nearest|near me|nearby|distance|local/.test(t)) add('dist');
    if (!found.length && /best|overall|pick|recommend/.test(t)) { add('price'); add('value'); }
    return found;
  }

  function bestOf(metricKey) {
    const dir = METRICS[metricKey].dir;
    return CARS.slice().sort((a, b) => dir === 'min' ? a[metricKey] - b[metricKey] : b[metricKey] - a[metricKey])[0];
  }

  function scoreCars(metricKeys) {
    const points = {};
    CARS.forEach(c => points[c.key] = 0);
    metricKeys.forEach(mk => {
      const dir = METRICS[mk].dir;
      const ranked = CARS.slice().sort((a, b) => dir === 'min' ? a[mk] - b[mk] : b[mk] - a[mk]);
      ranked.forEach((c, i) => { points[c.key] += (CARS.length - i); });
    });
    return CARS.slice().sort((a, b) => points[b.key] - points[a.key]);
  }

  function clearHighlight() {
    table.querySelectorAll('.xdc-rec').forEach(el => el.classList.remove('xdc-rec'));
    const badge = table.querySelector('.xdc-rec-badge');
    if (badge) badge.remove();
  }

  function highlightColumn(col) {
    clearHighlight();
    table.querySelectorAll('tr').forEach(tr => {
      const cell = tr.children[col];
      if (cell && !cell.classList.contains('xdc-rowlabel')) cell.classList.add('xdc-rec');
    });
    const th = table.querySelector(`thead th:nth-child(${col + 1})`);
    if (th) {
      const badge = document.createElement('div');
      badge.className = 'xdc-rec-badge';
      badge.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI pick';
      th.appendChild(badge);
    }
  }

  function handle(text) {
    text = (text || '').trim();
    if (!text) return;
    push('user', esc(text));

    if (/\b(reset|clear|start over|show all|original)\b/i.test(text)) {
      clearHighlight();
      foot.innerHTML = originalFoot;
      push('ai', 'Reset to the default analysis.');
      return;
    }

    const metrics = parseMetrics(text);
    if (!metrics.length) {
      push('ai', 'I can re-rank your favorites on price, KBB value, mileage, location, or overall deal. Try <em>“best price by location”</em> or <em>“best KBB value.”</em>');
      return;
    }

    const winner = scoreCars(metrics)[0];
    highlightColumn(winner.col);

    const priorityLabels = metrics.map(m => METRICS[m].label).join(' + ');
    const reasons = metrics.map(m => {
      const champ = bestOf(m);
      const tag = champ.key === winner.key ? '' : ` (best: ${champ.name})`;
      return `${METRICS[m].phrase(winner)}${tag}`;
    }).join(', ');

    foot.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Based on <strong>${priorityLabels}</strong>, the AI pick is <strong>${winner.name}</strong> — ${reasons}.`;
    push('ai', `For <strong>${priorityLabels}</strong>, I'd go with the <strong>${winner.name}</strong>. Highlighted in the table below.`);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    handle(input.value);
    input.value = '';
  });
  document.querySelectorAll('#fav-chat-chips .cmp-chip').forEach(chip => {
    chip.addEventListener('click', () => handle(chip.textContent));
  });

  const profilePriors = (typeof Profile !== 'undefined' && Profile.priorities)
    ? Profile.priorities().filter(m => METRICS[m])
    : ['price', 'value'];

  if (profilePriors.length) {
    const winner = scoreCars(profilePriors)[0];
    highlightColumn(winner.col);
    const priorityLabels = profilePriors.map(m => METRICS[m].label).join(' + ');
    foot.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Based on <strong>${priorityLabels}</strong>, the AI pick is <strong>${winner.name}</strong>.`;
    push('ai', `Comparing your <strong>${CARS.length} favorites</strong> — starting with <strong>${winner.name}</strong> on <strong>${priorityLabels}</strong>. Ask me to weigh anything differently.`);
  } else {
    push('ai', `Comparing <strong>${CARS.length} favorites</strong>. Tell me what matters — e.g. <em>“best KBB value”</em> or <em>“cheapest near NYC.”</em>`);
  }
});
