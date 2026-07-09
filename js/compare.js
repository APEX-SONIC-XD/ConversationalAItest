// Conversational compare — re-ranks the cross-dealer analysis from chat input.
// Client-side only (no backend): parses the shopper's priorities, re-highlights
// the recommended vehicle column, and rewrites the AI pick summary.
document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('.xdc-table');
  const foot = document.getElementById('xdc-foot');
  const form = document.getElementById('cmp-chat-form');
  const input = document.getElementById('cmp-chat-input');
  const log = document.getElementById('cmp-chat-log');
  if (!table || !foot || !form || !input || !log) return;

  const rawCars = window.COMPARE_CARS
    || (typeof Profile !== 'undefined' && Profile.compareCars ? Profile.compareCars() : []);
  const CARS = rawCars.map(c => Object.assign({}, c, {
    dist: c.distMin != null ? c.distMin : (c.dist || 0),
  }));
  if (!CARS.length) return;

  // dir: 'min' = lower is better, 'max' = higher is better
  const METRICS = {
    price: { dir: 'min', label: 'lowest price',       phrase: c => '$' + c.price.toLocaleString() },
    mpg:   { dir: 'max', label: 'best fuel economy',  phrase: c => c.mpg + ' mpg' },
    hp:    { dir: 'max', label: 'most horsepower',    phrase: c => c.hp + ' hp' },
    zero:  { dir: 'min', label: 'quickest 0–60',      phrase: c => c.zero + 's 0–60' },
    miles: { dir: 'min', label: 'lowest mileage',     phrase: c => c.miles.toLocaleString() + ' mi' },
    dist:  { dir: 'min', label: 'closest dealer',     phrase: c => (c.dist === 0 ? 'at your dealer' : c.dist + ' min away') },
    value: { dir: 'max', label: 'best value vs market', phrase: c => (c.value ? '$' + c.value.toLocaleString() + ' below market' : 'at market') },
    crReliability: { dir: 'max', label: 'best Consumer Reports reliability', phrase: c => (c.crReliability ? c.crReliability + '/5 CR reliability' : '—') },
    crOwnerSat: { dir: 'max', label: 'highest owner satisfaction', phrase: c => (c.crOwnerSat ? c.crOwnerSat + '/5 owner satisfaction' : '—') },
    estValue3yr: { dir: 'max', label: 'best projected value in 3 years', phrase: c => (c.estValue3yr ? '$' + c.estValue3yr.toLocaleString() : '—') },
    estValue5yr: { dir: 'max', label: 'best projected value in 5 years', phrase: c => (c.estValue5yr ? '$' + c.estValue5yr.toLocaleString() : '—') },
    insAnnual: { dir: 'min', label: 'lowest insurance cost', phrase: c => (c.insAnnual ? '~$' + c.insAnnual.toLocaleString() + '/yr insurance' : '—') },
    monthlyEst: { dir: 'min', label: 'lowest monthly payment', phrase: c => (c.monthlyEst ? '~$' + c.monthlyEst + '/mo payment' : '—') },
    expertScore: { dir: 'max', label: 'best expert reviews', phrase: c => (c.expertScore ? c.expertScore + '/5 expert score' : '—') },
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

    if (/cheap|cheapest|price|budget|afford|inexpensive|low cost|save money|lowest/.test(t)) add('price');
    if (/insur|premium/.test(t)) add('insAnnual');
    if (/payment|monthly|financ|loan|apr/.test(t)) add('monthlyEst');
    if (/expert|editor|review|car and driver|edmunds|kbb/.test(t)) add('expertScore');
    if (/owner|satisf/.test(t)) add('crOwnerSat');
    if (/\bawd\b|xdrive|quattro|all.?wheel|sh-awd/.test(t)) { add('hp'); add('zero'); }
    if (/consumer report|\bcr\b|reliab|dependab/.test(t)) { add('crReliability'); add('crOwnerSat'); }
    if (/source|where.*data|where.*from|who provides/.test(t)) { add('crReliability'); add('price'); }
    if (/depreciat|resale|hold value|retain|worth later/.test(t)) { add('estValue3yr'); add('estValue5yr'); add('monthlyEst'); }
    if (/mpg|fuel|economy|efficien|gas mileage|eco|green/.test(t)) add('mpg');
    if (/horsepower|\bhp\b|power|powerful|strong engine/.test(t)) add('hp');
    if (/0-60|0–60|accelerat|quick|fastest|\bfast\b|sporty|fun to drive|performance/.test(t)) add('zero');
    if (/low mile|fewest mile|least mile|lowest mile|odometer|new(est)?\b/.test(t)) add('miles');
    if (/close|closest|nearest|near me|nearby|distance|local|short drive/.test(t)) add('dist');
    if (/value|deal|below market|discount|bang for|worth/.test(t)) add('value');

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
      push('ai', `Reset to the default analysis.`);
      return;
    }

    if (/source|where does|where is this|where.*data|who provides|consumer report/i.test(text)) {
      const sources = (typeof PARTICIPANT !== 'undefined' && PARTICIPANT.homepage?.research?.sources) || [];
      if (sources.length) {
        const list = sources.map(s => `<strong>${esc(s.metric)}</strong> — ${esc(s.provider)} (${esc(s.updated)})`).join('<br>');
        push('ai', `Here is where each data point comes from:<br><br>${list}<br><br>See the full source panel below the table for details on each provider.`);
      } else {
        push('ai', `Sources include <strong>Consumer Reports</strong> (reliability), <strong>ALG</strong> (depreciation), <strong>RepairPal</strong> (maintenance), and <strong>DriveClear inventory</strong> (listing prices).`);
      }
      return;
    }

    const metrics = parseMetrics(text);
    if (!metrics.length) {
      push('ai', `I can re-rank these on insurance, mpg, monthly payment, expert reviews, Consumer Reports scores, resale value, price, horsepower, 0–60, mileage, or dealer distance. Try <em>"lowest insurance with good mpg"</em> or <em>"best expert reviews."</em>`);
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
    push('ai', `For <strong>${priorityLabels}</strong>, I'd go with the <strong>${winner.name}</strong>. I've highlighted it in the table and updated the analysis below.`);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    handle(input.value);
    input.value = '';
  });
  document.querySelectorAll('.cmp-chip').forEach(chip => {
    chip.addEventListener('click', () => handle(chip.textContent));
  });

  const profilePriors = (typeof Profile !== 'undefined' && Profile.priorities)
    ? Profile.priorities().filter(m => METRICS[m])
    : [];

  if (profilePriors.length) {
    const winner = scoreCars(profilePriors)[0];
    highlightColumn(winner.col);
    const priorityLabels = profilePriors.map(m => METRICS[m].label).join(' + ');
    foot.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Based on <strong>${priorityLabels}</strong>, the AI pick is <strong>${winner.name}</strong>.`;
    push('ai', `Based on what you've shared (<strong>${priorityLabels}</strong>), I'd start with the <strong>${winner.name}</strong> — highlighted in the table. Tell me to weigh anything differently.`);
  } else {
    push('ai', `Want a recommendation? Tell me what matters most and I'll re-rank these — e.g. <em>“I want the cheapest with good gas mileage.”</em>`);
  }
});
