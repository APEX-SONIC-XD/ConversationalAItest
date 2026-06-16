/* ============================================================
   DriveClear — App Logic
   ============================================================ */

// ─── Mobile Nav ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    }));
  }

  // Image error fallback
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      if (this.parentElement) this.parentElement.style.background = 'linear-gradient(135deg,#eef2f7 0%,#dfe6ee 100%)';
    });
  });

  // Hero make/model chaining
  const hMake = document.getElementById('hero-make');
  const hModel = document.getElementById('hero-model');
  if (hMake && hModel) {
    hMake.addEventListener('change', () => updateHeroModels(hMake.value, hModel));
  }

  // Hero search form
  const heroForm = document.getElementById('hero-search-form');
  if (heroForm) {
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      const params = new URLSearchParams();
      const make = document.getElementById('hero-make')?.value;
      const body = document.getElementById('hero-body')?.value;
      const maxPrice = document.getElementById('hero-price')?.value;
      if (make) params.set('make', make);
      if (body) params.set('body', body);
      if (maxPrice) params.set('maxPrice', maxPrice);
      window.location.href = 'srp.html?' + params.toString();
    });
  }

  // Conversational nav search suggestions (all pages)
  initNavSearchSuggest();

  // SRP init
  if (document.getElementById('srp-grid')) initSRP();

  // VDP init
  if (document.getElementById('vdp-root')) initVDP();

  // Render homepage featured vehicles
  const featGrid = document.getElementById('featured-grid');
  if (featGrid) renderCards(VEHICLES.slice(0, 6), featGrid);

  // Personalize the homepage AI recommendation banner from the profile
  initHomeRec();

  // Interior pages
  if (document.getElementById('sell-trade-form')) initSellTradePage();
  if (document.getElementById('fin-calc-root')) initFinancingPage();
  if (document.getElementById('fin-prep')) initFinancePrep();
  if (document.getElementById('trade-prep')) initTradePrep();
});

// ─── Homepage AI recommendation banner (reads participant profile) ───
function initHomeRec() {
  const sub = document.querySelector('.ai-rec-sub');
  if (!sub || typeof Profile === 'undefined' || !Profile.hasData()) return;
  const summary = Profile.summary();
  const tier = PARTICIPANT.creditTier
    ? `, ${PARTICIPANT.creditTier} credit (est. ${Profile.apr()}% APR)`
    : '';
  sub.innerHTML = `Based on what you told me — <strong>${summary}${tier}</strong> — here's what's in stock at your dealer (plus a few within a short drive). I've folded in expert reviews and verified owner sentiment.`;
}

// ─── Make/Model Dropdown ──────────────────────────────────
const MODEL_MAP = {
  Honda: ['Accord','CR-V','Civic','Pilot','Odyssey','HR-V'],
  Toyota: ['Camry','RAV4','Highlander','Corolla','Tacoma','4Runner'],
  Ford: ['F-150','Escape','Explorer','Edge','Mustang','Bronco'],
  Chevrolet: ['Equinox','Silverado','Malibu','Traverse','Blazer','Colorado'],
  Hyundai: ['Sonata','Tucson','Santa Fe','Elantra','Palisade','Kona'],
  Mazda: ['CX-5','Mazda3','CX-9','CX-30','MX-5 Miata'],
  Volkswagen: ['Jetta','Tiguan','Atlas','Passat','Golf','ID.4'],
  Nissan: ['Altima','Rogue','Sentra','Pathfinder','Murano','Frontier'],
  Kia: ['Sportage','Sorento','Telluride','Forte','Stinger','EV6'],
};

function updateHeroModels(make, modelSel) {
  const opts = MODEL_MAP[make] || [];
  modelSel.innerHTML = '<option value="">All Models</option>' +
    opts.map(m => `<option value="${m}">${m}</option>`).join('');
}

// ─── Card Rendering ───────────────────────────────────────
function renderCards(vehicles, container) {
  if (!vehicles.length) {
    container.innerHTML = `<div class="no-results">
      <i class="fa-regular fa-face-frown"></i>
      <p>No vehicles match your filters.</p>
      <p style="margin-top:8px;font-size:14px;">Try adjusting your search criteria.</p>
    </div>`;
    return;
  }
  container.innerHTML = vehicles.map(v => cardHTML(v)).join('');
  container.querySelectorAll('.v-save').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    if (isSaved(id)) btn.classList.add('saved');
    btn.innerHTML = isSaved(id)
      ? '<i class="fa-solid fa-heart"></i>'
      : '<i class="fa-regular fa-heart"></i>';
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      toggleSave(id);
      const saved = isSaved(id);
      btn.classList.toggle('saved', saved);
      btn.innerHTML = saved ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
    });
  });
  container.querySelectorAll('.v-compare').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      toggleCompare(id);
    });
  });
  refreshCompareButtons();
}

function cardHTML(v) {
  const apr = (typeof Profile !== 'undefined' && Profile.apr) ? Profile.apr() : 6.9;
  const monthly = calcMonthly(v.price, 0, apr);
  const badgeClass = v.dealBadge ? `badge-${v.dealBadge}` : '';
  const mktHtml = v.marketSavings > 0
    ? `<span class="v-mkt mkt-below">$${v.marketSavings.toLocaleString()} Below Market</span>`
    : '';
  return `
  <a class="v-card" href="vdp.html?id=${v.id}">
    <div class="v-img">
      <img src="${v.images[0]}" alt="${v.year} ${v.make} ${v.model}" loading="lazy">
      ${v.dealBadge ? `<span class="v-badge ${badgeClass}">${v.dealLabel}</span>` : ''}
      <span class="v-photo-count"><i class="fa-regular fa-image"></i> ${v.images.length + 12} Photos</span>
      <button class="v-save" data-id="${v.id}" title="Save vehicle" aria-label="Save vehicle">
        <i class="fa-regular fa-heart"></i>
      </button>
    </div>
    <div class="v-body">
      <div class="v-title">${v.year} ${v.make} ${v.model}</div>
      <div class="v-trim">${v.trim} · ${v.extColor}</div>
      <div class="v-price-row">
        <span class="v-price">${formatPrice(v.price)}</span>
        ${mktHtml}
      </div>
      <div class="v-monthly">Est. <b>${formatPrice(monthly)}/mo</b> · ${apr}% APR, 60 mo</div>
      <div class="v-meta">
        <span class="v-meta-item"><i class="fa-solid fa-gauge"></i> ${formatMileage(v.mileage)}</span>
        <span class="v-meta-item"><i class="fa-solid fa-car-side"></i> ${v.body}</span>
        <span class="v-meta-item"><i class="fa-solid fa-gear"></i> ${v.drivetrain}</span>
      </div>
      <div class="v-flags">
        ${v.owners === 1 ? '<span class="v-flag flag-owner"><i class="fa-solid fa-circle-check"></i> 1 Owner</span>' : ''}
        ${v.accidentFree ? '<span class="v-flag flag-clean"><i class="fa-solid fa-shield-halved"></i> Accident Free</span>' : ''}
        <span class="v-flag flag-carfax"><i class="fa-solid fa-file-shield"></i> Carfax</span>
      </div>
      <button class="v-compare" data-id="${v.id}" aria-pressed="false" type="button">
        <i class="fa-solid fa-scale-balanced"></i>
        <span class="v-compare-label">Add to Compare</span>
      </button>
    </div>
  </a>`;
}

// ─── Saved / Favorites ───────────────────────────────────
function getSaved() { return JSON.parse(localStorage.getItem('dc_saved') || '[]'); }
function isSaved(id) { return getSaved().includes(id); }
function toggleSave(id) {
  const saved = getSaved();
  const idx = saved.indexOf(id);
  if (idx > -1) saved.splice(idx, 1); else saved.push(id);
  localStorage.setItem('dc_saved', JSON.stringify(saved));
}

// ─── SRP ─────────────────────────────────────────────────
function initSRP() {
  const grid = document.getElementById('srp-grid');
  const countEl = document.getElementById('srp-count');
  const sortSel = document.getElementById('srp-sort');
  const searchInput = document.getElementById('srp-search-input');
  const clearBtn = document.getElementById('fp-clear');
  const filterToggle = document.getElementById('filter-toggle');
  const filterPanel = document.getElementById('filter-panel');
  const activeTagsEl = document.getElementById('active-tags');

  const urlP = new URLSearchParams(window.location.search);
  const state = {
    make: urlP.getAll('make'),
    body: urlP.getAll('body'),
    drive: urlP.getAll('drive'),
    minYear: parseInt(urlP.get('minYear')) || 2010,
    maxYear: parseInt(urlP.get('maxYear')) || 2024,
    minPrice: parseInt(urlP.get('minPrice')) || 0,
    maxPrice: parseInt(urlP.get('maxPrice')) || 50000,
    maxMiles: parseInt(urlP.get('maxMiles')) || 100000,
    minMpg: parseInt(urlP.get('minMpg')) || 0,
    maxDist: parseInt(urlP.get('maxDist')) || 0,
    sort: urlP.get('sort') || 'recommended',
    query: urlP.get('q') || '',
  };

  // Pre-fill search input
  if (searchInput) searchInput.value = state.query;
  if (sortSel) sortSel.value = state.sort;

  // Pre-check filter checkboxes from URL params
  if (state.make.length) {
    state.make.forEach(m => {
      const cb = document.querySelector(`.fp-make[value="${m}"]`);
      if (cb) cb.checked = true;
    });
  }
  if (state.body.length) {
    state.body.forEach(b => {
      const cb = document.querySelector(`.fp-body[value="${b}"]`);
      if (cb) cb.checked = true;
    });
  }
  if (state.drive.length) {
    state.drive.forEach(d => {
      const cb = document.querySelector(`.fp-drive[value="${d}"]`);
      if (cb) cb.checked = true;
    });
  }

  // Price inputs
  const minPriceIn = document.getElementById('fp-min-price');
  const maxPriceIn = document.getElementById('fp-max-price');
  const maxMilesIn = document.getElementById('fp-max-miles');
  const minYearIn = document.getElementById('fp-min-year');
  const maxYearIn = document.getElementById('fp-max-year');
  if (minPriceIn) minPriceIn.value = state.minPrice || '';
  if (maxPriceIn) maxPriceIn.value = state.maxPrice < 50000 ? state.maxPrice : '';
  if (maxMilesIn) maxMilesIn.value = state.maxMiles < 100000 ? state.maxMiles : '';
  if (minYearIn && urlP.get('minYear')) minYearIn.value = state.minYear;
  if (maxYearIn && urlP.get('maxYear')) maxYearIn.value = state.maxYear;

  // Seed from the participant profile when the page wasn't opened with explicit filters.
  const URL_FILTER_KEYS = ['make', 'body', 'drive', 'minYear', 'maxYear', 'minPrice', 'maxPrice', 'maxMiles', 'minMpg', 'maxDist', 'q'];
  if (typeof Profile !== 'undefined' && Profile.toParams && !URL_FILTER_KEYS.some(k => urlP.has(k))) {
    const pp = Profile.toParams();
    [].concat(pp.make || []).forEach(m => { const cb = document.querySelector(`.fp-make[value="${m}"]`); if (cb) cb.checked = true; });
    if (pp.body) { const cb = document.querySelector(`.fp-body[value="${pp.body}"]`); if (cb) cb.checked = true; }
    if (pp.drive) { const cb = document.querySelector(`.fp-drive[value="${pp.drive}"]`); if (cb) cb.checked = true; }
    if (pp.maxPrice && maxPriceIn) maxPriceIn.value = pp.maxPrice;
    if (pp.maxMiles && maxMilesIn) maxMilesIn.value = pp.maxMiles;
    if (pp.minYear && minYearIn) minYearIn.value = pp.minYear;
    state.minMpg = pp.minMpg || 0;
    state.maxDist = pp.maxDist || 0;
  }

  function readFilters() {
    state.make = [...document.querySelectorAll('.fp-make:checked')].map(c => c.value);
    state.body = [...document.querySelectorAll('.fp-body:checked')].map(c => c.value);
    state.drive = [...document.querySelectorAll('.fp-drive:checked')].map(c => c.value);
    state.minPrice = parseInt(minPriceIn?.value) || 0;
    state.maxPrice = parseInt(maxPriceIn?.value) || 50000;
    state.maxMiles = parseInt(maxMilesIn?.value) || 100000;
    state.minYear = parseInt(minYearIn?.value) || 2010;
    state.maxYear = parseInt(maxYearIn?.value) || 2024;
    state.query = searchInput?.value.trim().toLowerCase() || '';
    state.sort = sortSel?.value || 'recommended';
  }

  function applyAndRender() {
    readFilters();
    let results = VEHICLES.filter(v => {
      if (state.make.length && !state.make.includes(v.make)) return false;
      if (state.body.length && !state.body.includes(v.body)) return false;
      if (state.drive.length && !state.drive.includes(v.drivetrain)) return false;
      if (v.price < state.minPrice || v.price > state.maxPrice) return false;
      if (v.mileage > state.maxMiles) return false;
      if (v.year < state.minYear || v.year > state.maxYear) return false;
      if (state.minMpg && v.mpgHwy < state.minMpg) return false;
      if (state.maxDist && vehicleDistance(v) > state.maxDist) return false;
      if (state.query) {
        const q = state.query;
        const haystack = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.body} ${v.extColor}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    // Sort
    switch (state.sort) {
      case 'price-asc': results.sort((a,b) => a.price - b.price); break;
      case 'price-desc': results.sort((a,b) => b.price - a.price); break;
      case 'year-desc': results.sort((a,b) => b.year - a.year); break;
      case 'miles-asc': results.sort((a,b) => a.mileage - b.mileage); break;
      default: results.sort((a,b) => (b.marketSavings||0) - (a.marketSavings||0));
    }

    if (countEl) countEl.innerHTML = `Showing <strong>${results.length}</strong> vehicles`;
    renderCards(results, grid);
    renderActiveTags(activeTagsEl, state);
    renderPagination(results.length);
    return results.length;
  }

  // Filter collapse toggles
  document.querySelectorAll('.fp-title').forEach(title => {
    title.addEventListener('click', () => {
      title.classList.toggle('collapsed');
      const section = title.nextElementSibling;
      if (section) section.style.display = title.classList.contains('collapsed') ? 'none' : '';
    });
  });

  // Filter change listeners
  document.querySelectorAll('.fp-make, .fp-body, .fp-drive').forEach(cb => {
    cb.addEventListener('change', applyAndRender);
  });
  [minPriceIn, maxPriceIn, maxMilesIn, minYearIn, maxYearIn].forEach(inp => {
    if (inp) inp.addEventListener('input', debounce(applyAndRender, 400));
  });
  if (searchInput) searchInput.addEventListener('input', debounce(applyAndRender, 300));
  if (sortSel) sortSel.addEventListener('change', applyAndRender);
  if (clearBtn) clearBtn.addEventListener('click', () => {
    document.querySelectorAll('.fp-make, .fp-body, .fp-drive').forEach(cb => cb.checked = false);
    if (minPriceIn) minPriceIn.value = '';
    if (maxPriceIn) maxPriceIn.value = '';
    if (maxMilesIn) maxMilesIn.value = '';
    if (minYearIn) minYearIn.value = 2018;
    if (maxYearIn) maxYearIn.value = 2024;
    if (searchInput) searchInput.value = '';
    state.make = []; state.body = []; state.drive = [];
    state.minPrice = 0; state.maxPrice = 50000; state.maxMiles = 100000;
    state.minYear = 2010; state.maxYear = 2024; state.minMpg = 0; state.maxDist = 0; state.query = '';
    applyAndRender();
  });

  initShopChat();

  // Filter mode switch (AI conversation vs manual filters)
  if (filterPanel) {
    document.querySelectorAll('.fp-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.fp-mode-btn').forEach(b => {
          const on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        filterPanel.classList.remove('mode-ai', 'mode-manual');
        filterPanel.classList.add('mode-' + btn.dataset.mode);
      });
    });
  }

  // Mobile filter toggle
  if (filterToggle && filterPanel) {
    filterToggle.addEventListener('click', () => {
      filterPanel.classList.toggle('open');
      filterToggle.textContent = filterPanel.classList.contains('open') ? 'Hide Filters' : 'Show Filters';
    });
  }

  // Body style quick-filter from URL
  if (urlP.get('body')) {
    const cb = document.querySelector(`.fp-body[value="${urlP.get('body')}"]`);
    if (cb) cb.checked = true;
  }

  // ─── AI shopping chat (client-side intent parser, no backend) ───
  function initShopChat() {
    const form = document.getElementById('fp-chat-form');
    const input = document.getElementById('fp-chat-input');
    const log = document.getElementById('fp-chat-log');
    if (!form || !input || !log) return;

    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function push(role, html) {
      const el = document.createElement('div');
      el.className = `fp-msg fp-msg-${role}`;
      el.innerHTML = html;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }

    function parseIntent(text) {
      const t = ' ' + text.toLowerCase().replace(/\s+/g, ' ') + ' ';
      const intent = { makes: [], bodies: [], drives: [] };

      if (t.includes('honda')) intent.makes.push('Honda');
      if (t.includes('toyota')) intent.makes.push('Toyota');
      if (t.includes('ford')) intent.makes.push('Ford');
      if (t.includes('chevy') || t.includes('chevrolet')) intent.makes.push('Chevrolet');
      if (t.includes('hyundai')) intent.makes.push('Hyundai');
      if (t.includes('mazda')) intent.makes.push('Mazda');
      if (t.includes('volkswagen') || /\bvw\b/.test(t)) intent.makes.push('Volkswagen');
      if (t.includes('nissan')) intent.makes.push('Nissan');
      if (t.includes('kia')) intent.makes.push('Kia');

      if (/\b(suv|crossover|cuv)s?\b/.test(t)) intent.bodies.push('SUV');
      if (/\bsedans?\b/.test(t)) intent.bodies.push('Sedan');
      if (/\b(truck|pickup)s?\b/.test(t)) intent.bodies.push('Truck');

      if (/\bawd\b|all[- ]?wheel/.test(t)) intent.drives.push('AWD');
      if (/\bfwd\b|front[- ]?wheel/.test(t)) intent.drives.push('FWD');
      if (/\b4wd\b|4x4|four[- ]?wheel/.test(t)) intent.drives.push('4WD');

      const ym = t.match(/\b(20[1-2]\d)\b/);
      if (ym) intent.minYear = parseInt(ym[1]);

      if (/low (mile|mileage)/.test(t)) intent.maxMiles = 30000;
      const milesM = t.match(/(\d{1,3}(?:,\d{3})?)\s*(k?)\s*(?:miles|mi)\b/);
      if (milesM) {
        let n = parseInt(milesM[1].replace(/,/g, ''));
        if (milesM[2] === 'k' || n < 1000) n *= 1000;
        intent.maxMiles = n;
      }

      // Price — strip year + mileage tokens first so they aren't read as dollars
      let pctx = t;
      if (ym) pctx = pctx.replace(ym[0], ' ');
      pctx = pctx.replace(/(\d{1,3}(?:,\d{3})?)\s*k?\s*(?:miles|mi)\b/g, ' ');
      let pm = pctx.match(/\$?\s*(\d{1,3})\s*k\b/);
      if (pm) intent.maxPrice = parseInt(pm[1]) * 1000;
      else {
        pm = pctx.match(/\$\s*(\d{1,3}(?:,\d{3})+)/) ||
             pctx.match(/(?:under|below|less than|up to|max|budget|around)\s*\$?\s*(\d{4,6})\b/);
        if (pm) intent.maxPrice = parseInt(pm[1].replace(/,/g, ''));
      }
      return intent;
    }

    function applyIntent(intent) {
      intent.makes.forEach(m => { const cb = document.querySelector(`.fp-make[value="${m}"]`); if (cb) cb.checked = true; });
      intent.bodies.forEach(b => { const cb = document.querySelector(`.fp-body[value="${b}"]`); if (cb) cb.checked = true; });
      intent.drives.forEach(d => { const cb = document.querySelector(`.fp-drive[value="${d}"]`); if (cb) cb.checked = true; });
      if (intent.maxPrice && maxPriceIn) maxPriceIn.value = intent.maxPrice;
      if (intent.maxMiles && maxMilesIn) maxMilesIn.value = intent.maxMiles;
      if (intent.minYear && minYearIn) minYearIn.value = intent.minYear;
    }

    function buildReply(intent, count) {
      const crit = [];
      if (intent.drives.length) crit.push(intent.drives.join('/'));
      if (intent.makes.length) crit.push(intent.makes.join(' or '));
      if (intent.bodies.length) crit.push(intent.bodies.join(' or '));
      if (intent.maxPrice) crit.push('under ' + formatPrice(intent.maxPrice));
      if (intent.maxMiles) crit.push('under ' + intent.maxMiles.toLocaleString() + ' mi');
      if (intent.minYear) crit.push(intent.minYear + ' or newer');

      if (!crit.length) {
        return `I can filter by make, body style, price, mileage, drivetrain, and year. Try <em>“AWD SUV under $30k, low miles.”</em>`;
      }
      const desc = crit.join(', ');
      if (count === 0) {
        return `No matches for <strong>${desc}</strong> right now. Want to loosen the price or mileage?`;
      }
      return `Showing <strong>${count}</strong> ${count === 1 ? 'match' : 'matches'} for <strong>${desc}</strong> — filters updated on the left.`;
    }

    function handle(text) {
      text = (text || '').trim();
      if (!text) return;
      push('user', esc(text));

      if (/\b(reset|clear|start over|show all|show everything)\b/i.test(text)) {
        if (clearBtn) clearBtn.click();
        push('ai', `Cleared every filter — showing the full inventory.`);
        return;
      }

      const intent = parseIntent(text);
      applyIntent(intent);
      const count = applyAndRender();
      push('ai', buildReply(intent, count));
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      handle(input.value);
      input.value = '';
    });
    document.querySelectorAll('.fp-chip').forEach(chip => {
      chip.addEventListener('click', () => handle(chip.textContent));
    });

    const sum = (typeof Profile !== 'undefined' && Profile.hasData && Profile.hasData()) ? Profile.summary() : '';
    push('ai', sum
      ? `Hi! Based on what you've shared, I'm showing <strong>${sum}</strong>. Tell me what to change — e.g. <em>“add AWD”</em> or <em>“cheaper.”</em>`
      : `Hi! Tell me what you're after and I'll filter these results — e.g. <em>“AWD SUV under $30k.”</em>`);
  }

  applyAndRender();
}

function renderActiveTags(container, state) {
  if (!container) return;
  const tags = [];
  state.make.forEach(m => tags.push({ label: m, remove: () => { const cb = document.querySelector(`.fp-make[value="${m}"]`); if(cb) cb.checked=false; } }));
  state.body.forEach(b => tags.push({ label: b, remove: () => { const cb = document.querySelector(`.fp-body[value="${b}"]`); if(cb) cb.checked=false; } }));
  if (state.maxPrice < 50000) tags.push({ label: `Under ${formatPrice(state.maxPrice)}`, remove: () => { document.getElementById('fp-max-price').value=''; } });
  if (state.maxMiles < 100000) tags.push({ label: `Under ${state.maxMiles.toLocaleString()} mi`, remove: () => { document.getElementById('fp-max-miles').value=''; } });

  container.innerHTML = tags.map((t,i) =>
    `<span class="a-tag">${t.label}<button data-idx="${i}" aria-label="Remove filter">&times;</button></span>`
  ).join('');

  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      tags[parseInt(btn.dataset.idx)].remove();
      // Trigger re-render via the sort selector change (cheapest path)
      document.getElementById('srp-sort')?.dispatchEvent(new Event('change'));
    });
  });
}

function renderPagination(total) {
  const el = document.getElementById('pagination');
  if (!el) return;
  const pages = Math.ceil(total / 9);
  if (pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <button class="pg-btn" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
    ${Array.from({length: Math.min(pages,5)}, (_,i) =>
      `<button class="pg-btn${i===0?' active':''}">${i+1}</button>`).join('')}
    ${pages > 5 ? '<span style="padding:0 4px;color:var(--text-light)">…</span><button class="pg-btn">' + pages + '</button>' : ''}
    <button class="pg-btn" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
  `;
  el.querySelectorAll('.pg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.pg-btn').forEach(b => b.classList.remove('active'));
      if (!isNaN(parseInt(btn.textContent))) btn.classList.add('active');
    });
  });
}

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ─── VDP ─────────────────────────────────────────────────
function initVDP() {
  const id = new URLSearchParams(window.location.search).get('id') || '1';
  const v = getVehicleById(id);
  if (!v) {
    document.getElementById('vdp-root').innerHTML = `
      <div style="text-align:center;padding:80px 24px;color:var(--text-light)">
        <i class="fa-solid fa-car" style="font-size:48px;margin-bottom:16px;display:block"></i>
        <p style="font-size:18px;font-weight:700;color:var(--text-dark);margin-bottom:8px">Vehicle Not Found</p>
        <p>This vehicle may have been sold. <a href="srp.html" style="color:var(--teal);font-weight:600">Browse all vehicles →</a></p>
      </div>`;
    return;
  }

  populateVDP(v);
  initGallery(v.images);
  initPayCalc(v.price);
  renderSimilar(v);
  updateVDPSaveBtn(v.id);
  initVDPAiMode(v);

  // Breadcrumb
  const bc = document.getElementById('bc-vehicle');
  if (bc) bc.textContent = `${v.year} ${v.make} ${v.model} ${v.trim}`;

  // Floating CTA
  const fcPrice = document.getElementById('fc-price');
  const fcMo = document.getElementById('fc-mo');
  if (fcPrice) fcPrice.textContent = formatPrice(v.price);
  if (fcMo) fcMo.textContent = `Est. ${formatPrice(calcMonthly(v.price))}/mo`;
}

function populateVDP(v) {
  const apr = (typeof Profile !== 'undefined' && Profile.apr) ? Profile.apr() : 6.9;
  const monthly = calcMonthly(v.price, 0, apr);
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };

  set('vdp-year', v.year);
  set('vdp-make-model', `${v.make} ${v.model}`);
  set('vdp-trim', `${v.trim} · ${v.extColor}`);
  set('vdp-price', formatPrice(v.price));
  set('vdp-monthly', `Est. <a href="#payment-calc">${formatPrice(monthly)}/mo</a> · <a href="#payment-calc">Payment Options</a> <button type="button" class="pa-trigger" id="pa-trigger" aria-label="What does this mean? Ask the assistant" aria-expanded="false"><i class="fa-solid fa-circle-question"></i></button>`);
  initPaymentAssistant();
  set('vdp-mileage-stat', formatMileage(v.mileage));
  set('vdp-engine-stat', v.engine);
  set('vdp-mpg-stat', `${v.mpgCity} / ${v.mpgHwy}`);
  set('vdp-drivetrain-stat', v.drivetrain);

  // Market pill
  const pill = document.getElementById('vdp-mkt-pill');
  if (pill) {
    if (v.marketSavings > 0) {
      pill.className = 'vdp-mkt-pill mkt-pill-below';
      pill.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${formatPrice(v.marketSavings)} Below Market`;
    } else {
      pill.className = 'vdp-mkt-pill mkt-pill-at';
      pill.innerHTML = `<i class="fa-solid fa-equals"></i> At Market Price`;
    }
  }

  // Flags
  const flags = document.getElementById('vdp-flags');
  if (flags) {
    flags.innerHTML = `
      ${v.owners===1?'<span class="vdp-flag flag-owner"><i class="fa-solid fa-circle-check"></i> 1 Owner</span>':''}
      ${v.accidentFree?'<span class="vdp-flag flag-clean"><i class="fa-solid fa-shield-halved"></i> Accident Free</span>':''}
      <span class="vdp-flag flag-carfax"><i class="fa-solid fa-file-shield"></i> Carfax Available</span>
      <span class="vdp-flag" style="background:#f5f3ff;color:#6d28d9"><i class="fa-solid fa-map-marker-alt"></i> ${v.location}</span>
    `;
  }

  // Specs
  const specsEl = document.getElementById('vdp-specs');
  if (specsEl) {
    const specs = [
      ['Year', v.year], ['Make', v.make], ['Model', v.model], ['Trim', v.trim],
      ['Body Style', v.body], ['Mileage', formatMileage(v.mileage)],
      ['Engine', v.engine], ['Horsepower', `${v.hp} HP`], ['Transmission', v.transmission],
      ['Drivetrain', v.drivetrain], ['Ext. Color', v.extColor], ['Int. Color', v.intColor],
      ['Fuel Economy', `${v.mpgCity} City / ${v.mpgHwy} Hwy`], ['Owners', `${v.owners} Owner${v.owners>1?'s':''}`],
      ['Stock #', v.stockNum], ['VIN', v.vin.substring(0,10)+'...'],
      ['Location', v.location], ['Title', 'Clean Title'],
    ];
    specsEl.innerHTML = specs.map(([l,val]) => `
      <div class="spec-item">
        <div class="spec-l">${l}</div>
        <div class="spec-v">${val}</div>
      </div>`).join('');
  }

  // Features
  const featEl = document.getElementById('vdp-features');
  if (featEl) {
    featEl.innerHTML = v.features.map(f =>
      `<div class="feat-item"><i class="fa-solid fa-check"></i> ${f}</div>`
    ).join('');
  }

  // Description
  const descEl = document.getElementById('vdp-desc');
  if (descEl) descEl.textContent = v.description;

  // Page title
  document.title = `${v.year} ${v.make} ${v.model} ${v.trim} — DriveClear`;
}

// ─── Payment Options AI Assistant ────────────────────────
function initPaymentAssistant() {
  const trigger = document.getElementById('pa-trigger');
  const popover = document.getElementById('pa-popover');
  const closeBtn = document.getElementById('pa-close');
  const form = document.getElementById('pa-form');
  const input = document.getElementById('pa-input');
  const body = document.getElementById('pa-body');
  const chips = document.getElementById('pa-chips');

  if (!trigger || !popover || trigger.dataset.bound === '1') return;
  trigger.dataset.bound = '1';

  const open = () => {
    popover.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => popover.classList.add('open'));
    setTimeout(() => input && input.focus(), 180);
  };
  const close = () => {
    popover.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    setTimeout(() => { popover.hidden = true; }, 160);
  };
  const toggle = () => (popover.hidden ? open() : close());

  trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  closeBtn && closeBtn.addEventListener('click', close);

  document.addEventListener('click', (e) => {
    if (popover.hidden) return;
    if (popover.contains(e.target) || trigger.contains(e.target)) return;
    close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popover.hidden) close();
  });

  const scrollToEnd = () => { body.scrollTop = body.scrollHeight; };

  const addUserMsg = (text) => {
    const el = document.createElement('div');
    el.className = 'pa-msg pa-msg-user';
    el.innerHTML = `<div class="pa-msg-bubble">${escapeHtml(text)}</div>`;
    body.appendChild(el);
    scrollToEnd();
  };

  const addTyping = () => {
    const el = document.createElement('div');
    el.className = 'pa-msg pa-msg-bot pa-typing';
    el.innerHTML = `
      <div class="pa-msg-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
      <div class="pa-msg-bubble"><span class="pa-typing-dots"><span></span><span></span><span></span></span></div>`;
    body.appendChild(el);
    scrollToEnd();
    return el;
  };

  const addBotMsg = (html) => {
    const el = document.createElement('div');
    el.className = 'pa-msg pa-msg-bot';
    el.innerHTML = `
      <div class="pa-msg-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
      <div class="pa-msg-bubble">${html}</div>`;
    body.appendChild(el);
    scrollToEnd();
  };

  const sendQuestion = (text) => {
    const q = (text || '').trim();
    if (!q) return;
    addUserMsg(q);
    input.value = '';
    if (chips) chips.style.display = 'none';
    const typing = addTyping();
    setTimeout(() => {
      typing.remove();
      addBotMsg(generateMockAnswer(q));
    }, 700);
  };

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendQuestion(input.value);
  });

  chips && chips.querySelectorAll('.pa-chip').forEach(c => {
    c.addEventListener('click', () => sendQuestion(c.dataset.q || c.textContent));
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

// Canned UI-only responses — purely for demoing the chat surface.
function generateMockAnswer(q) {
  const text = q.toLowerCase();
  const tier = (typeof PARTICIPANT !== 'undefined') ? PARTICIPANT.creditTier : null;
  const apr = (typeof Profile !== 'undefined' && Profile.apr) ? Profile.apr() : 6.9;
  const budget = (typeof PARTICIPANT !== 'undefined') ? PARTICIPANT.maxPrice : null;
  if (text.includes('apr') || text.includes('rate') || text.includes('interest')) {
    const lead = tier
      ? `<p>Based on your <strong>${tier} credit</strong>, your estimated APR is about <strong>${apr}%</strong>. `
      : `<p>`;
    return `${lead}A lower APR means a smaller share of each payment goes to interest. On a 60-month loan, every <strong>1% lower APR</strong> typically drops your monthly payment by about <strong>$10–$15</strong> per $10K financed.</p>
            <p>Getting pre-approved is the fastest way to confirm your real rate — it's a soft pull and won't affect your credit.</p>`;
  }
  if (text.includes('down') || text.includes('cash')) {
    return `<p>A larger down payment lowers your monthly payment and total interest paid. We generally suggest <strong>10–20%</strong> down if it's comfortable for you.</p>
            <p>Try the slider in the <a href="#payment-calc">Payment Calculator</a> to see how different amounts change your estimate.</p>`;
  }
  if (text.includes('trade')) {
    return `<p>Yes — you can apply your trade-in value as down payment. We'll appraise your vehicle in minutes with a free instant offer.</p>
            <p>Want me to start a trade-in estimate?</p>`;
  }
  if (text.includes('afford') || text.includes('budget')) {
    const lead = budget
      ? `<p>Keeping you under your <strong>$${budget.toLocaleString()}</strong> budget — at about ${apr}% APR over 60 months that's roughly <strong>${formatPrice(calcMonthly(budget, 0, apr))}/mo</strong> before any down payment. `
      : `<p>`;
    return `${lead}A common guideline is to keep your auto payment under <strong>10–15% of your monthly take-home pay</strong>, and total transportation costs under 20%.</p>
            <p>Adjust the term and down payment in the calculator to land at a payment that fits your budget.</p>`;
  }
  return `<p>Great question — a DriveClear finance specialist can walk you through the details for your specific situation.</p>
          <p>You can also adjust the inputs in the <a href="#payment-calc">Payment Calculator</a> below, or call <strong>(800) 555-1234</strong>.</p>`;
}

// ─── VDP AI Assist Mode ──────────────────────────────────
// A toggle that turns the page into an "ask anything" surface: hovering any
// explained element shows a quick snippet; clicking opens a chat sidebar.
function initVDPAiMode(v) {
  const toggle = document.getElementById('ai-toggle');
  const stateLbl = document.getElementById('ai-toggle-state');
  const tip = document.getElementById('ai-tip');
  const tipTitle = document.getElementById('ai-tip-title');
  const tipText = document.getElementById('ai-tip-text');
  const tipMore = document.getElementById('ai-tip-more');
  const tipClose = document.getElementById('ai-tip-close');
  const drawer = document.getElementById('ai-drawer');
  const scrim = document.getElementById('ai-drawer-scrim');
  const drawerClose = document.getElementById('ai-drawer-close');
  const drawerTopic = document.getElementById('ai-drawer-topic');
  const drawerBody = document.getElementById('ai-drawer-body');
  const drawerChips = document.getElementById('ai-drawer-chips');
  const drawerForm = document.getElementById('ai-drawer-form');
  const drawerInput = document.getElementById('ai-drawer-input');
  if (!toggle || !tip || !drawer) return;

  // Mark every element we can explain.
  const tag = (el, topic) => { if (el) el.setAttribute('data-ai-topic', topic); };
  tag(document.getElementById('vdp-price'), 'price');
  tag(document.getElementById('vdp-monthly'), 'payment');
  tag(document.getElementById('vdp-mkt-pill'), 'market');
  document.querySelectorAll('.vdp-stat').forEach(el => tag(el, 'stat'));
  document.querySelectorAll('.vdp-flag').forEach(el => tag(el, 'flag'));
  document.querySelectorAll('.hist-item').forEach(el => tag(el, 'history'));
  document.querySelectorAll('.spec-item').forEach(el => tag(el, 'spec'));
  document.querySelectorAll('.feat-item').forEach(el => tag(el, 'feature'));
  tag(document.getElementById('payment-calc'), 'calc');
  tag(document.querySelector('.gallery .g-main'), 'photos');

  let aiOn = false;
  let activeTarget = null;
  let activeInfo = null;
  let hideTimer = null;
  let pinned = false;   // ADA: a clicked snippet stays open until dismissed

  // Build a {title, text, key, chips} snippet for whatever element is hovered.
  const aiInfo = (el) => {
    const topic = el.getAttribute('data-ai-topic');
    const T = (txt) => (el.querySelector(txt)?.textContent || '').trim();
    switch (topic) {
      case 'price':
        return { key: 'price', title: 'One price, no haggle',
          text: `The ${formatPrice(v.price)} you see is exactly what you pay — no dealer or doc fees.${v.marketSavings > 0 ? ` That's about ${formatPrice(v.marketSavings)} below market for a comparable ${v.year} ${v.make} ${v.model}.` : ''}`,
          chips: ['Is this price negotiable?', 'How was this price set?', 'Are there any extra fees?'] };
      case 'payment':
        return { key: 'payment', title: 'Estimated monthly payment',
          text: `This estimate assumes a 60-month loan${(typeof Profile !== 'undefined' && Profile.apr) ? ` at about ${Profile.apr()}% APR` : ''} with $0 down. Change the term, rate, or down payment in the calculator to see your real number.`,
          chips: ['How does APR affect this?', 'What down payment should I put?', 'Can I lower the monthly payment?'] };
      case 'market':
        return { key: 'market', title: 'How pricing compares',
          text: v.marketSavings > 0
            ? `We benchmark every car against similar listings nearby. This one is priced ${formatPrice(v.marketSavings)} under the local average.`
            : `This car is priced right at the local market average for its year, trim, and mileage.`,
          chips: ['What is it compared against?', 'Will the price drop?', 'Is this a good deal?'] };
      case 'stat': {
        const label = T('.vdp-stat-l'), val = T('.vdp-stat-v');
        if (/mileage/i.test(label)) {
          const perYr = Math.round(v.mileage / Math.max(1, (new Date().getFullYear() - v.year)));
          return { key: 'mileage', title: 'Mileage', text: `${val} on the odometer — roughly ${perYr.toLocaleString()} mi/year, ${perYr <= 13500 ? 'a bit below' : 'around'} the U.S. average of ~13,500.`,
            chips: ['Is this high mileage?', 'How long will it last?', 'Does mileage affect the warranty?'] };
        }
        if (/engine/i.test(label)) return { key: 'engine', title: 'Engine', text: `${val} — paired with ${v.hp} HP and a ${v.transmission}.`, chips: ['Is this engine reliable?', 'What fuel does it take?', 'How does it perform?'] };
        if (/mpg/i.test(label)) return { key: 'mpg', title: 'Fuel economy', text: `${val} MPG city/highway. Real-world mileage varies with driving style, but this is efficient for a ${v.body.toLowerCase()}.`, chips: ['What will gas cost me?', 'City vs highway?', 'How does it compare?'] };
        if (/drivetrain/i.test(label)) {
          const d = v.drivetrain;
          const exp = d === 'AWD' ? 'All-wheel drive sends power to all four wheels for better grip in rain and snow.'
            : d === '4WD' ? 'Four-wheel drive adds capability for towing and rougher terrain.'
            : d === 'FWD' ? 'Front-wheel drive is efficient and predictable — great for everyday driving.'
            : 'Rear-wheel drive favors balance and performance.';
          return { key: 'drivetrain', title: `${d} drivetrain`, text: exp, chips: ['Do I need AWD?', 'How is it in snow?', 'Does it affect MPG?'] };
        }
        return { key: 'stat', title: label || 'Detail', text: `${label}: ${val}.`, chips: ['Tell me more', 'Why does this matter?'] };
      }
      case 'flag': {
        const txt = el.textContent.trim();
        if (/owner/i.test(txt)) return { key: 'owner', title: 'Ownership history', text: 'A single previous owner usually means more consistent maintenance and fewer surprises.', chips: ['Was it a personal car?', 'How does this affect value?'] };
        if (/accident/i.test(txt)) return { key: 'accident', title: 'Accident-free', text: 'No accidents or structural damage are reported on this vehicle’s history record.', chips: ['How do you verify this?', 'Can I see the report?'] };
        if (/carfax/i.test(txt)) return { key: 'carfax', title: 'Vehicle history report', text: 'A full history report is available — ownership, service records, title status, and more.', chips: ['What’s in the report?', 'Is it free?'] };
        return { key: 'location', title: 'Where this car is', text: `This vehicle is located at ${v.location}. We can arrange delivery or a transfer.`, chips: ['Can it be delivered?', 'How far is it?'] };
      }
      case 'history': {
        const title = T('.hist-title'), sub = T('.hist-sub');
        return { key: 'history', title: title || 'Vehicle history', text: sub || 'Part of this car’s verified history record.', chips: ['Why does this matter?', 'How is this verified?'] };
      }
      case 'spec': {
        const label = T('.spec-l'), val = T('.spec-v');
        return { key: 'spec', title: label || 'Specification', text: `${label}: ${val}.`, chips: [`Why does ${label.toLowerCase()} matter?`, 'How does this compare?'] };
      }
      case 'feature': {
        const f = el.textContent.trim();
        return { key: 'feature', title: f, text: `${f} is included on this vehicle. Want to know how it works or whether it’s worth it?`, chips: [`How does ${f} work?`, 'Is this common in this class?'] };
      }
      case 'calc':
        return { key: 'payment', title: 'Payment calculator', text: 'Slide your down payment, pick a term, and set a rate to see how your monthly payment changes — all estimates, no credit check.', chips: ['What term should I choose?', 'How much down is smart?', 'What’s my real rate?'] };
      case 'photos':
        return { key: 'photos', title: 'Photos & condition', text: `Real photos of this exact ${v.year} ${v.make} ${v.model}. Every car gets a 150-point inspection before listing.`, chips: ['What does the inspection cover?', 'Any cosmetic flaws?'] };
      default:
        return { key: 'general', title: 'About this vehicle', text: 'Ask me anything about this car.', chips: ['Is this a good deal?', 'Tell me about reliability'] };
    }
  };

  // ── Hover tooltip ──────────────────────────────────────
  const positionTip = (el) => {
    const r = el.getBoundingClientRect();
    tip.hidden = false;
    const tr = tip.getBoundingClientRect();
    let top = r.bottom + 10;
    if (top + tr.height > window.innerHeight - 12) top = r.top - tr.height - 10;
    let left = r.left + r.width / 2 - tr.width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tr.width - 12));
    tip.style.top = `${Math.max(12, top)}px`;
    tip.style.left = `${left}px`;
  };

  const showTip = (el) => {
    activeTarget = el;
    activeInfo = aiInfo(el);
    tipTitle.textContent = activeInfo.title;
    tipText.textContent = activeInfo.text;
    tip.hidden = false;
    clearTimeout(hideTimer);
    requestAnimationFrame(() => { positionTip(el); tip.classList.add('show'); });
  };
  const hideTip = () => {
    pinned = false;
    tip.classList.remove('show', 'pinned');
    hideTimer = setTimeout(() => { tip.hidden = true; }, 140);
  };
  // ADA: clicking pins the snippet so it stays put for click / keyboard users.
  const pinTip = (el) => {
    clearTimeout(hideTimer);
    showTip(el);
    pinned = true;
    tip.classList.add('pinned');
    setTimeout(() => tipMore.focus(), 60);
  };

  document.addEventListener('mouseover', (e) => {
    if (!aiOn || pinned) return;
    const el = e.target.closest('[data-ai-topic]');
    if (!el || el === activeTarget) return;
    clearTimeout(hideTimer);
    showTip(el);
  });
  document.addEventListener('mouseout', (e) => {
    if (!aiOn || pinned) return;
    const to = e.relatedTarget;
    if (to && (to.closest?.('[data-ai-topic]') === activeTarget || tip.contains(to))) return;
    if (activeTarget && (!to || !activeTarget.contains(to))) { activeTarget = null; hideTip(); }
  });
  tip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  tip.addEventListener('mouseleave', () => { if (!pinned) { activeTarget = null; hideTip(); } });

  // ── Chat drawer ────────────────────────────────────────
  const addMsg = (cls, html) => {
    const el = document.createElement('div');
    el.className = `pa-msg ${cls}`;
    el.innerHTML = cls === 'pa-msg-bot'
      ? `<div class="pa-msg-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div><div class="pa-msg-bubble">${html}</div>`
      : `<div class="pa-msg-bubble">${html}</div>`;
    drawerBody.appendChild(el);
    drawerBody.scrollTop = drawerBody.scrollHeight;
    return el;
  };
  const renderChips = (list) => {
    drawerChips.innerHTML = (list || []).map(q => `<button type="button" class="pa-chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('');
  };

  const askDrawer = (text) => {
    const q = (text || '').trim();
    if (!q) return;
    addMsg('pa-msg-user', escapeHtml(q));
    drawerInput.value = '';
    const typing = addMsg('pa-msg-bot pa-typing', `<span class="pa-typing-dots"><span></span><span></span><span></span></span>`);
    setTimeout(() => { typing.remove(); addMsg('pa-msg-bot', generateVdpAnswer(activeInfo?.key, q, v)); }, 650);
  };

  const openDrawer = (info) => {
    activeInfo = info || activeInfo || aiInfo(document.getElementById('vdp-price'));
    drawerTopic.innerHTML = `<span class="pa-dot"></span> ${escapeHtml(activeInfo.title)}`;
    drawerBody.innerHTML = '';
    addMsg('pa-msg-bot', `<div class="pa-msg-label">${escapeHtml(activeInfo.title)}</div><p>${activeInfo.text}</p>`);
    renderChips(activeInfo.chips);
    scrim.hidden = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => scrim.classList.add('show'));
    setTimeout(() => drawerInput.focus(), 220);
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('show');
    setTimeout(() => { scrim.hidden = true; }, 200);
  };

  tipMore.addEventListener('click', () => { hideTip(); openDrawer(activeInfo); });
  tipClose && tipClose.addEventListener('click', () => { activeTarget = null; hideTip(); });
  document.addEventListener('click', (e) => {
    if (!aiOn) return;
    if (tip.contains(e.target)) return;               // interacting with the open snippet
    const el = e.target.closest('[data-ai-topic]');
    if (!el) {                                        // clicked empty space → dismiss a pinned snippet
      if (pinned) { activeTarget = null; hideTip(); }
      return;
    }
    if (e.target.closest('a, button, input, select, textarea')) return; // let real controls work
    e.preventDefault();
    pinTip(el);
  });
  drawerClose.addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  drawerForm.addEventListener('submit', (e) => { e.preventDefault(); askDrawer(drawerInput.value); });
  drawerChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.pa-chip');
    if (chip) askDrawer(chip.dataset.q || chip.textContent);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (drawer.classList.contains('open')) closeDrawer();
    else if (pinned) { activeTarget = null; hideTip(); }
  });

  // ── Toggle ─────────────────────────────────────────────
  const setMode = (on) => {
    aiOn = on;
    document.body.classList.toggle('ai-mode', on);
    toggle.classList.toggle('on', on);
    toggle.setAttribute('aria-checked', on ? 'true' : 'false');
    if (stateLbl) stateLbl.textContent = on ? 'On' : 'Off';
    if (!on) { activeTarget = null; hideTip(); closeDrawer(); }
  };
  toggle.addEventListener('click', () => setMode(!aiOn));
}

// Topic-aware canned follow-ups for the VDP AI drawer (UI-only demo content).
function generateVdpAnswer(key, q, v) {
  const t = (q || '').toLowerCase();
  if (t.includes('apr') || t.includes('rate') || t.includes('interest') || t.includes('down') || t.includes('afford') || t.includes('budget') || t.includes('trade'))
    return generateMockAnswer(q);
  switch (key) {
    case 'price': case 'market':
      return `<p>Every DriveClear price is set by comparing this exact ${v.year} ${v.make} ${v.model} ${v.trim} against recent local sales — then we remove dealer and doc fees. It's a fixed, no-haggle price.</p><p>${v.marketSavings > 0 ? `Right now it's about <strong>${formatPrice(v.marketSavings)} below</strong> the local average.` : `It's priced right at the local average.`}</p>`;
    case 'mileage':
      return `<p>At ${formatMileage(v.mileage)}, this ${v.year} ${v.make} is well within a healthy range — modern vehicles routinely run past 150,000 miles with regular maintenance.</p><p>It also passed our 150-point inspection.</p>`;
    case 'mpg':
      return `<p>Rated ${v.mpgCity} city / ${v.mpgHwy} hwy. For ~12,000 miles a year of mixed driving, expect a moderate monthly fuel cost — efficient for a ${v.body.toLowerCase()}.</p>`;
    case 'drivetrain':
      return `<p>This vehicle is <strong>${v.drivetrain}</strong>. ${v.drivetrain === 'AWD' || v.drivetrain === '4WD' ? 'Great for confidence in rain, snow, and light off-pavement.' : 'Efficient and easy to live with for everyday commuting.'}</p>`;
    case 'engine':
      return `<p>It's a ${v.engine} making ${v.hp} HP through a ${v.transmission}. Smooth, proven, and easy to service.</p>`;
    case 'owner': case 'accident': case 'carfax': case 'history':
      return `<p>This car has a verified history: ${v.owners} owner${v.owners > 1 ? 's' : ''}${v.accidentFree ? ', no reported accidents' : ''}, and a clean title. A full report is available on request.</p>`;
    case 'feature': case 'spec':
      return `<p>Happy to dig in — this ${v.year} ${v.make} ${v.model} comes well equipped for its class. Want me to compare it with a similar vehicle in stock?</p>`;
    case 'photos':
      return `<p>The photos show this exact car. Our 150-point inspection covers brakes, tires, fluids, electronics, and cosmetics — and anything notable is disclosed.</p>`;
    default:
      return `<p>Great question about the ${v.year} ${v.make} ${v.model}. A DriveClear specialist can give you the full detail, or you can call <strong>(800) 555-1234</strong>.</p>`;
  }
}

// ─── Gallery ────────────────────────────────────────────
function initGallery(images) {
  let current = 0;
  const mainImg = document.getElementById('g-main-img');
  const counter = document.getElementById('g-counter');
  const thumbs = document.getElementById('g-thumbs');
  const totalPhotos = images.length + 12;

  if (!mainImg) return;

  // Build extra placeholder images to reach a more realistic count
  const allImages = [...images];
  while (allImages.length < 5) allImages.push(images[allImages.length % images.length]);

  function goTo(idx) {
    current = (idx + allImages.length) % allImages.length;
    mainImg.src = allImages[current];
    if (counter) counter.textContent = `${current + 1} / ${totalPhotos}`;
    thumbs?.querySelectorAll('.g-thumb').forEach((t, i) => t.classList.toggle('active', i === current));
  }

  // Render thumbnails
  if (thumbs) {
    thumbs.innerHTML = allImages.slice(0, 5).map((src, i) => `
      <div class="g-thumb ${i===0?'active':''}">
        <img src="${src}" alt="Photo ${i+1}" loading="lazy">
      </div>`).join('');
    thumbs.querySelectorAll('.g-thumb').forEach((t, i) => t.addEventListener('click', () => goTo(i)));
  }

  document.getElementById('g-prev')?.addEventListener('click', () => goTo(current - 1));
  document.getElementById('g-next')?.addEventListener('click', () => goTo(current + 1));

  goTo(0);
}

// ─── Payment Calculator ─────────────────────────────────
function initPayCalc(vehiclePrice) {
  const downIn = document.getElementById('calc-down');
  const downSlider = document.getElementById('calc-down-slider');
  const rateIn = document.getElementById('calc-rate');
  const termSel = document.getElementById('calc-term');
  const resultEl = document.getElementById('calc-result');
  const downLabel = document.getElementById('calc-down-label');

  if (!downIn || !resultEl) return;

  function update() {
    const down = parseInt(downIn.value) || 0;
    const rate = parseFloat(rateIn?.value) || 6.9;
    const months = parseInt(termSel?.value) || 60;
    const monthly = calcMonthly(vehiclePrice, down, rate, months);
    resultEl.innerHTML = `
      <div class="calc-mo">${formatPrice(monthly)}</div>
      <div class="calc-mo-label">Estimated Monthly Payment</div>`;
    if (downLabel) downLabel.textContent = formatPrice(down);
    if (downSlider && downSlider.value !== String(down)) downSlider.value = down;
    if (downIn && downSlider && document.activeElement !== downIn) downIn.value = down;
  }

  if (downSlider) {
    downSlider.max = Math.round(vehiclePrice * 0.5);
    downSlider.addEventListener('input', () => { downIn.value = downSlider.value; update(); });
  }
  downIn.addEventListener('input', () => { if(downSlider) downSlider.value = downIn.value; update(); });
  rateIn?.addEventListener('input', update);
  termSel?.addEventListener('change', update);
  update();
}

// ─── Similar Vehicles ────────────────────────────────────
function renderSimilar(current) {
  const grid = document.getElementById('similar-grid');
  if (!grid) return;
  const similar = VEHICLES
    .filter(v => v.id !== current.id && (v.body === current.body || v.make === current.make))
    .slice(0, 3);
  const fallback = VEHICLES.filter(v => v.id !== current.id).slice(0, 3);
  renderCards(similar.length >= 3 ? similar : fallback, grid);
}

// ─── VDP Save Button ─────────────────────────────────────
function updateVDPSaveBtn(id) {
  const btn = document.getElementById('vdp-save-btn');
  if (!btn) return;
  function refresh() {
    const saved = isSaved(id);
    btn.innerHTML = saved
      ? '<i class="fa-solid fa-heart"></i> Saved'
      : '<i class="fa-regular fa-heart"></i> Save Vehicle';
    btn.classList.toggle('btn-outline', !saved);
    btn.classList.toggle('btn-ghost', saved);
  }
  refresh();
  btn.addEventListener('click', () => { toggleSave(id); refresh(); });
}

/* ============================================================
   COMPARE FEATURE
   ============================================================ */

const MAX_COMPARE = 4;

function getCompareList() {
  try { return JSON.parse(localStorage.getItem('dc_compare') || '[]'); }
  catch (_) { return []; }
}
function isInCompare(id) { return getCompareList().includes(parseInt(id)); }
function setCompareList(list) {
  localStorage.setItem('dc_compare', JSON.stringify(list));
}
function toggleCompare(id) {
  id = parseInt(id);
  const list = getCompareList();
  const idx = list.indexOf(id);
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    if (list.length >= MAX_COMPARE) {
      showCompareToast(`You can compare up to ${MAX_COMPARE} cars. Remove one to add another.`);
      return;
    }
    list.push(id);
  }
  setCompareList(list);
  refreshCompareButtons();
  renderCompareTray();
}
function clearCompare() {
  setCompareList([]);
  refreshCompareButtons();
  renderCompareTray();
}

function refreshCompareButtons() {
  document.querySelectorAll('.v-compare').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    const checked = isInCompare(id);
    btn.classList.toggle('checked', checked);
    btn.setAttribute('aria-pressed', checked);
    const labelEl = btn.querySelector('.v-compare-label');
    const iconEl = btn.querySelector('i');
    if (labelEl) labelEl.textContent = checked ? 'In Compare' : 'Add to Compare';
    if (iconEl) iconEl.className = checked ? 'fa-solid fa-check' : 'fa-solid fa-scale-balanced';
  });
}

function showCompareToast(msg) {
  let toast = document.getElementById('compare-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'compare-toast';
    toast.className = 'compare-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── Compare Tray ──────────────────────────────────────
function ensureCompareTray() {
  let tray = document.getElementById('compare-tray');
  if (!tray) {
    tray = document.createElement('div');
    tray.id = 'compare-tray';
    tray.className = 'compare-tray';
    document.body.appendChild(tray);
  }
  return tray;
}

function renderCompareTray() {
  const tray = ensureCompareTray();
  const list = getCompareList();
  if (list.length === 0) {
    tray.classList.remove('open');
    return;
  }
  const vehicles = list.map(id => getVehicleById(id)).filter(Boolean);
  const slotCount = Math.max(2, vehicles.length);
  const emptySlots = Math.max(0, slotCount - vehicles.length);

  tray.innerHTML = `
    <div class="ct-inner">
      <div class="ct-label">
        <div class="ct-label-icon"><i class="fa-solid fa-scale-balanced"></i></div>
        <div>
          <div class="ct-label-title">Compare <strong>${vehicles.length}</strong> ${vehicles.length === 1 ? 'car' : 'cars'}</div>
          <div class="ct-label-sub">${vehicles.length < 2 ? 'Add at least one more to compare' : 'Ready to see them side-by-side'}</div>
        </div>
      </div>
      <div class="ct-slots">
        ${vehicles.map(v => `
          <div class="ct-slot" data-id="${v.id}">
            <div class="ct-slot-img">
              <img src="${v.images[0]}" alt="${v.year} ${v.make} ${v.model}">
            </div>
            <div class="ct-slot-info">
              <div class="ct-slot-title">${v.year} ${v.make}</div>
              <div class="ct-slot-sub">${v.model} · ${formatPrice(v.price)}</div>
            </div>
            <button class="ct-slot-remove" data-id="${v.id}" aria-label="Remove from compare" type="button">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
        `).join('')}
        ${Array.from({length: emptySlots}).map(() => `
          <div class="ct-slot ct-slot-empty">
            <i class="fa-solid fa-plus"></i>
            <span>Add a car</span>
          </div>
        `).join('')}
      </div>
      <div class="ct-actions">
        <button class="ct-clear-btn" id="ct-clear" type="button">Clear</button>
        <button class="btn btn-primary ct-compare-btn" id="ct-compare" type="button" ${vehicles.length < 2 ? 'disabled' : ''}>
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          Compare ${vehicles.length >= 2 ? 'Now' : ''}
        </button>
      </div>
    </div>
  `;
  tray.classList.add('open');

  tray.querySelectorAll('.ct-slot-remove').forEach(btn => {
    btn.addEventListener('click', () => toggleCompare(parseInt(btn.dataset.id)));
  });
  document.getElementById('ct-clear')?.addEventListener('click', clearCompare);
  document.getElementById('ct-compare')?.addEventListener('click', () => {
    const ids = getCompareList();
    if (ids.length < 2) return;
    window.location.href = 'compare.html?ids=' + ids.join(',');
  });
}

// ─── Compare Modal ────────────────────────────────────
function ensureCompareModal() {
  let modal = document.getElementById('compare-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'compare-modal';
    modal.className = 'compare-modal';
    document.body.appendChild(modal);
  }
  return modal;
}

function openCompareModal() {
  const list = getCompareList();
  if (list.length < 2) return;
  const vehicles = list.map(id => getVehicleById(id)).filter(Boolean);
  if (vehicles.length < 2) return;

  const modal = ensureCompareModal();
  const insights = generateAIInsights(vehicles);
  const rows = compareRows(vehicles);

  modal.innerHTML = `
    <div class="cm-backdrop"></div>
    <div class="cm-panel" role="dialog" aria-modal="true" aria-label="Vehicle comparison">
      <div class="cm-header">
        <div>
          <div class="cm-eyebrow">Side-by-Side</div>
          <h2 class="cm-title">Comparing ${vehicles.length} Vehicles</h2>
        </div>
        <button class="cm-close" aria-label="Close comparison" type="button">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="cm-body">

        <!-- ─── AI Insights ─── -->
        <div class="ai-insights">
          <div class="ai-header">
            <div class="ai-spark"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <div class="ai-header-text">
              <div class="ai-tag">AI INSIGHTS · BETA</div>
              <div class="ai-title">Smart Comparison Analysis</div>
            </div>
            <div class="ai-status">
              <span class="ai-dot"></span> Generated for you
            </div>
          </div>

          <div class="ai-content">
            <div class="ai-top-pick">
              <div class="ai-section-title"><i class="fa-solid fa-star"></i> Top Pick</div>
              <p class="ai-top-pick-text">${insights.topPick}</p>
            </div>

            <div class="ai-bests">
              ${insights.bests.map(b => `
                <div class="ai-best">
                  <div class="ai-best-emoji">${b.emoji}</div>
                  <div class="ai-best-text">
                    <div class="ai-best-label">${b.label}</div>
                    <div class="ai-best-car">${b.car}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            ${insights.differences.length ? `
              <div class="ai-section">
                <div class="ai-section-title"><i class="fa-solid fa-lightbulb"></i> Key Differences</div>
                <ul class="ai-list">
                  ${insights.differences.map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${insights.watchOuts.length ? `
              <div class="ai-section ai-section-warn">
                <div class="ai-section-title"><i class="fa-solid fa-triangle-exclamation"></i> Things to Watch</div>
                <ul class="ai-list">
                  ${insights.watchOuts.map(w => `<li>${w}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="ai-disclaimer">
              <i class="fa-solid fa-circle-info"></i>
              AI-generated summary based on the listing data above. Always inspect the vehicle and review the full Carfax before buying.
            </div>
          </div>
        </div>

        <!-- ─── Side-by-side spec grid ─── -->
        <div class="cm-grid-wrap">
          <div class="cm-grid" style="--cols:${vehicles.length}">

            <!-- Header row: vehicle cards -->
            <div class="cm-row cm-row-head">
              <div class="cm-cell cm-cell-label"></div>
              ${vehicles.map(v => `
                <div class="cm-cell cm-cell-head">
                  <button class="cm-veh-remove" data-id="${v.id}" aria-label="Remove from comparison" type="button">
                    <i class="fa-solid fa-times"></i>
                  </button>
                  <div class="cm-veh-img">
                    <img src="${v.images[0]}" alt="${v.year} ${v.make} ${v.model}">
                  </div>
                  <div class="cm-veh-title">${v.year} ${v.make} ${v.model}</div>
                  <div class="cm-veh-trim">${v.trim}</div>
                  <div class="cm-veh-price">${formatPrice(v.price)}</div>
                  <div class="cm-veh-mo">Est. ${formatPrice(calcMonthly(v.price))}/mo</div>
                  ${v.marketSavings > 0 ? `<div class="cm-veh-savings"><i class="fa-solid fa-arrow-trend-down"></i> ${formatPrice(v.marketSavings)} below market</div>` : ''}
                  <a href="vdp.html?id=${v.id}" class="btn btn-outline btn-sm cm-veh-cta">View Details</a>
                </div>
              `).join('')}
            </div>

            ${rows.map(r => `
              <div class="cm-row ${r.group ? 'cm-row-group' : ''}">
                <div class="cm-cell cm-cell-label">${r.label}</div>
                ${r.values.map(val => `
                  <div class="cm-cell ${val.highlight ? 'cm-highlight' : ''}">
                    ${val.html}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  modal.querySelector('.cm-close')?.addEventListener('click', closeCompareModal);
  modal.querySelector('.cm-backdrop')?.addEventListener('click', closeCompareModal);
  modal.querySelectorAll('.cm-veh-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      toggleCompare(id);
      const remaining = getCompareList();
      if (remaining.length < 2) {
        closeCompareModal();
      } else {
        openCompareModal();
      }
    });
  });
  document.addEventListener('keydown', escCompareHandler);
}

function escCompareHandler(e) {
  if (e.key === 'Escape') closeCompareModal();
}

function closeCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', escCompareHandler);
}

// ─── Compare table row builder ────────────────────────
function compareRows(vehicles) {
  const isBest = (vals, val, dir = 'max') => {
    const allSame = vals.every(x => x === vals[0]);
    if (allSame) return false;
    if (dir === 'max') return val === Math.max(...vals);
    return val === Math.min(...vals);
  };
  const prices = vehicles.map(v => v.price);
  const years = vehicles.map(v => v.year);
  const miles = vehicles.map(v => v.mileage);
  const hps = vehicles.map(v => v.hp);
  const mpgC = vehicles.map(v => v.mpgCity);
  const mpgH = vehicles.map(v => v.mpgHwy);
  const owners = vehicles.map(v => v.owners);
  const savings = vehicles.map(v => v.marketSavings || 0);

  return [
    { label: 'Price', values: vehicles.map(v => ({ html: `<strong>${formatPrice(v.price)}</strong>`, highlight: isBest(prices, v.price, 'min') })) },
    { label: 'Est. Monthly', values: vehicles.map(v => ({ html: `${formatPrice(calcMonthly(v.price))}/mo`, highlight: false })) },
    { label: 'Below Market', values: vehicles.map(v => ({
      html: v.marketSavings > 0 ? `<span class="cm-pos">${formatPrice(v.marketSavings)}</span>` : '<span class="cm-muted">—</span>',
      highlight: isBest(savings, v.marketSavings || 0, 'max') && (v.marketSavings || 0) > 0
    })) },

    { label: 'Year', values: vehicles.map(v => ({ html: v.year, highlight: isBest(years, v.year, 'max') })) },
    { label: 'Mileage', values: vehicles.map(v => ({ html: formatMileage(v.mileage), highlight: isBest(miles, v.mileage, 'min') })) },
    { label: 'Body Style', values: vehicles.map(v => ({ html: v.body, highlight: false })) },
    { label: 'Owners', values: vehicles.map(v => ({ html: `${v.owners} owner${v.owners > 1 ? 's' : ''}`, highlight: isBest(owners, v.owners, 'min') })) },
    { label: 'Accident History', values: vehicles.map(v => ({
      html: v.accidentFree
        ? '<span class="cm-yes"><i class="fa-solid fa-check"></i> Accident-free</span>'
        : '<span class="cm-no"><i class="fa-solid fa-triangle-exclamation"></i> Reported</span>',
      highlight: false
    })) },

    { label: 'Engine', values: vehicles.map(v => ({ html: v.engine, highlight: false })) },
    { label: 'Horsepower', values: vehicles.map(v => ({ html: `${v.hp} HP`, highlight: isBest(hps, v.hp, 'max') })) },
    { label: 'Transmission', values: vehicles.map(v => ({ html: v.transmission, highlight: false })) },
    { label: 'Drivetrain', values: vehicles.map(v => ({ html: v.drivetrain, highlight: false })) },
    { label: 'City MPG', values: vehicles.map(v => ({ html: v.mpgCity, highlight: isBest(mpgC, v.mpgCity, 'max') })) },
    { label: 'Highway MPG', values: vehicles.map(v => ({ html: v.mpgHwy, highlight: isBest(mpgH, v.mpgHwy, 'max') })) },

    { label: 'Exterior', values: vehicles.map(v => ({ html: v.extColor, highlight: false })) },
    { label: 'Interior', values: vehicles.map(v => ({ html: v.intColor, highlight: false })) },
    { label: 'Location', values: vehicles.map(v => ({ html: `<i class="fa-solid fa-location-dot" style="color:var(--text-light)"></i> ${v.location}`, highlight: false })) },

    { label: 'Key Features', values: vehicles.map(v => ({
      html: `<ul class="cm-feat-list">
        ${v.features.slice(0, 6).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
        ${v.features.length > 6 ? `<li class="cm-feat-more">+${v.features.length - 6} more</li>` : ''}
      </ul>`,
      highlight: false
    })) },
  ];
}

// ─── AI Insights generator (mock) ─────────────────────
function generateAIInsights(vehicles) {
  const vName = v => `${v.year} ${v.make} ${v.model}`;
  const cheapest = vehicles.reduce((a, b) => a.price < b.price ? a : b);
  const newest = vehicles.reduce((a, b) => a.year > b.year ? a : b);
  const lowestMiles = vehicles.reduce((a, b) => a.mileage < b.mileage ? a : b);
  const bestMpg = vehicles.reduce((a, b) => (a.mpgCity + a.mpgHwy) > (b.mpgCity + b.mpgHwy) ? a : b);
  const mostPowerful = vehicles.reduce((a, b) => a.hp > b.hp ? a : b);
  const bestSavings = vehicles.reduce((a, b) => (a.marketSavings || 0) > (b.marketSavings || 0) ? a : b);

  // Composite value score
  const scored = vehicles.map(v => ({
    v,
    score: (v.marketSavings || 0) / 100
         + (v.year - 2018) * 8
         - v.mileage / 1500
         + (v.owners === 1 ? 8 : 0)
         + (v.accidentFree ? 4 : -6)
  }));
  const bestValue = scored.reduce((a, b) => a.score > b.score ? a : b).v;

  // Top Pick narrative
  const reasons = [];
  if ((bestValue.marketSavings || 0) > 500) reasons.push(`it's priced <strong>${formatPrice(bestValue.marketSavings)}</strong> below market`);
  if (bestValue.owners === 1) reasons.push(`it's a single-owner vehicle`);
  if (bestValue === lowestMiles && vehicles.length > 1) reasons.push(`it has the lowest mileage of the group at <strong>${formatMileage(bestValue.mileage)}</strong>`);
  if (bestValue === newest && newest.year > Math.min(...vehicles.map(v => v.year))) reasons.push(`it's the newest model year (<strong>${bestValue.year}</strong>)`);
  if (bestValue === bestMpg && vehicles.length > 1) reasons.push(`it leads on fuel economy with <strong>${bestValue.mpgCity}/${bestValue.mpgHwy} MPG</strong>`);
  const reasonText = reasons.length
    ? ' Standouts here: ' + reasons.slice(0, 3).join('; ') + '.'
    : '';
  const topPick = `Our top pick is the <strong>${vName(bestValue)} ${bestValue.trim}</strong> at ${formatPrice(bestValue.price)}.${reasonText} It strikes the best overall balance of price, condition, and equipment in this group.`;

  // Best-of categories
  const bests = [];
  bests.push({ emoji: '💰', label: 'Best Price', car: `${vName(cheapest)} — ${formatPrice(cheapest.price)}` });
  bests.push({ emoji: '⛽', label: 'Best Fuel Economy', car: `${vName(bestMpg)} — ${bestMpg.mpgCity}/${bestMpg.mpgHwy} MPG` });
  bests.push({ emoji: '🚀', label: 'Most Powerful', car: `${vName(mostPowerful)} — ${mostPowerful.hp} HP` });
  bests.push({ emoji: '🆕', label: 'Newest', car: `${vName(newest)} — ${newest.year}` });
  bests.push({ emoji: '📉', label: 'Lowest Miles', car: `${vName(lowestMiles)} — ${formatMileage(lowestMiles.mileage)}` });
  if ((bestSavings.marketSavings || 0) > 0) {
    bests.push({ emoji: '💎', label: 'Biggest Discount', car: `${vName(bestSavings)} — ${formatPrice(bestSavings.marketSavings)} off` });
  }

  // Key differences
  const differences = [];
  const prices = vehicles.map(v => v.price);
  const priceSpread = Math.max(...prices) - Math.min(...prices);
  if (priceSpread >= 1000) {
    differences.push(`Price ranges from <strong>${formatPrice(Math.min(...prices))}</strong> to <strong>${formatPrice(Math.max(...prices))}</strong> — a <strong>${formatPrice(priceSpread)}</strong> spread.`);
  }
  const milesArr = vehicles.map(v => v.mileage);
  const milesSpread = Math.max(...milesArr) - Math.min(...milesArr);
  if (milesSpread >= 5000) {
    differences.push(`Mileage varies by <strong>${milesSpread.toLocaleString()} miles</strong> — meaningful for resale value and remaining warranty.`);
  }
  const mpgArr = vehicles.map(v => v.mpgCity + v.mpgHwy);
  const mpgSpread = Math.max(...mpgArr) - Math.min(...mpgArr);
  if (mpgSpread >= 6) {
    const yearlyFuelDiff = Math.round((mpgSpread / 2) * 60);
    differences.push(`Combined fuel economy varies by up to <strong>${Math.round(mpgSpread / 2)} MPG</strong> — roughly <strong>$${yearlyFuelDiff}/year</strong> in fuel cost at 12k miles.`);
  }
  const drivetrains = [...new Set(vehicles.map(v => v.drivetrain))];
  if (drivetrains.length > 1) {
    differences.push(`Mixed drivetrains in this group: <strong>${drivetrains.join(', ')}</strong>. AWD/4WD adds capability in snow but typically costs 1–3 MPG.`);
  }
  const bodies = [...new Set(vehicles.map(v => v.body))];
  if (bodies.length > 1) {
    differences.push(`Different body styles: <strong>${bodies.join(', ')}</strong> — pick based on priorities for cargo, passengers, and efficiency.`);
  }
  const hpArr = vehicles.map(v => v.hp);
  const hpSpread = Math.max(...hpArr) - Math.min(...hpArr);
  if (hpSpread >= 30) {
    differences.push(`Horsepower swings by <strong>${hpSpread} HP</strong> across the group — noticeable if highway merging or towing matters to you.`);
  }

  // Watch-outs
  const watchOuts = [];
  const multiOwner = vehicles.filter(v => v.owners > 1);
  if (multiOwner.length && multiOwner.length < vehicles.length) {
    watchOuts.push(`${multiOwner.map(v => `<strong>${vName(v)}</strong>`).join(', ')} ${multiOwner.length === 1 ? 'has' : 'have'} multiple previous owners. Review the Carfax for service consistency.`);
  }
  const highMiles = vehicles.filter(v => v.mileage > 40000);
  if (highMiles.length && highMiles.length < vehicles.length) {
    watchOuts.push(`${highMiles.map(v => `<strong>${vName(v)}</strong>`).join(', ')} ${highMiles.length === 1 ? 'is' : 'are'} over 40k miles — factor in upcoming maintenance like brakes, fluids, and tires.`);
  }
  const noSavings = vehicles.filter(v => !v.marketSavings || v.marketSavings === 0);
  if (noSavings.length && noSavings.length < vehicles.length) {
    watchOuts.push(`${noSavings.map(v => `<strong>${vName(v)}</strong>`).join(', ')} ${noSavings.length === 1 ? 'is' : 'are'} priced at market — there may be room to negotiate compared to the discounted options here.`);
  }

  return { topPick, bests, differences, watchOuts };
}

// ─── Sell / Trade Page ───────────────────────────────────
function initSellTradePage() {
  const form = document.getElementById('sell-trade-form');
  const intentInput = document.getElementById('st-intent');
  const tabs = document.querySelectorAll('.option-tab[data-intent]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (intentInput) intentInput.value = tab.dataset.intent;
    });
  });

  // Go straight to the confirmation page on click — no required fields needed.
  // Stash whatever the participant entered so the confirmation page can
  // personalize the trade estimate (graceful defaults fill any gaps).
  form?.querySelector('button[type="submit"]')?.addEventListener('click', e => {
    e.preventDefault();
    try {
      const data = {
        intent: form.querySelector('#st-intent')?.value || 'trade',
        year: form.querySelector('#st-year')?.value || '',
        make: form.querySelector('#st-make')?.value || '',
        model: form.querySelector('#st-model')?.value || '',
        mileage: form.querySelector('#st-mileage')?.value || '',
        condition: form.querySelector('#st-condition')?.value || '',
      };
      sessionStorage.setItem('dcTrade', JSON.stringify(data));
    } catch (err) { /* sessionStorage unavailable — confirmation page uses defaults */ }
    window.location.href = 'trade-confirmation.html';
  });
}

// ─── Financing Page ──────────────────────────────────────
function initFinancingPage() {
  const priceIn = document.getElementById('fin-price');
  const downIn = document.getElementById('fin-down');
  const downSlider = document.getElementById('fin-down-slider');
  const rateIn = document.getElementById('fin-rate');
  const termSel = document.getElementById('fin-term');
  const resultEl = document.getElementById('fin-calc-result');
  const downLabel = document.getElementById('fin-down-label');

  // Seed rate from the participant's credit tier and price from their budget.
  if (typeof Profile !== 'undefined') {
    if (rateIn && PARTICIPANT.creditTier) rateIn.value = Profile.apr();
    if (priceIn && PARTICIPANT.maxPrice) priceIn.value = PARTICIPANT.maxPrice;
  }

  function updateCalc() {
    const price = parseInt(priceIn?.value) || 25000;
    const down = parseInt(downIn?.value) || 0;
    const rate = parseFloat(rateIn?.value) || 6.9;
    const months = parseInt(termSel?.value) || 60;
    const monthly = calcMonthly(price, down, rate, months);

    if (resultEl) {
      resultEl.innerHTML = `
        <div class="calc-mo">${formatPrice(monthly)}</div>
        <div class="calc-mo-label">Estimated Monthly Payment</div>`;
    }
    if (downLabel) downLabel.textContent = formatPrice(down);
    if (downSlider) {
      downSlider.max = Math.round(price * 0.5);
      if (parseInt(downSlider.value) !== down) downSlider.value = Math.min(down, downSlider.max);
    }
  }

  if (downSlider) {
    downSlider.addEventListener('input', () => {
      if (downIn) downIn.value = downSlider.value;
      updateCalc();
    });
  }
  priceIn?.addEventListener('input', updateCalc);
  downIn?.addEventListener('input', () => {
    if (downSlider) downSlider.value = downIn.value;
    updateCalc();
  });
  rateIn?.addEventListener('input', updateCalc);
  termSel?.addEventListener('change', updateCalc);
  updateCalc();

  document.querySelectorAll('#fin-faq .faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item?.classList.contains('open');
      document.querySelectorAll('#fin-faq .faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item?.classList.add('open');
    });
  });
}

// ─── Dealership Finance Prep (confirmation pages) ─────────
function initFinancePrep() {
  const root = document.getElementById('fin-prep');
  if (!root) return;
  const mode = root.dataset.prepMode || 'finance';
  const apr = (typeof Profile !== 'undefined' && Profile.apr) ? Profile.apr() : 6.9;
  const tier = (typeof PARTICIPANT !== 'undefined') ? PARTICIPANT.creditTier : null;
  const budget = (typeof PARTICIPANT !== 'undefined' && PARTICIPANT.maxPrice) ? PARTICIPANT.maxPrice : null;
  // Max the participant is approved to finance (falls back to their budget guideline).
  const approved = (typeof PARTICIPANT !== 'undefined' && PARTICIPANT.maxApproved) ? PARTICIPANT.maxApproved : budget;
  const price = budget || approved || 25000;

  // Live "AI is generating" placeholder, then reveal the personalized content.
  const fpGen = (el, delay, buildHtml) => {
    if (!el) return;
    el.innerHTML = '<div class="fp-generating"><span class="pa-typing-dots"><span></span><span></span><span></span></span><span>Personalizing from your profile…</span></div>';
    setTimeout(() => { el.innerHTML = buildHtml(); el.classList.add('fp-reveal-item'); }, delay);
  };

  // AI byline shown on each generated card, drawn from the participant profile.
  const bits = [];
  if (tier) bits.push(tier + ' credit');
  if (budget) bits.push('~' + formatPrice(budget) + ' budget');
  const profileLine = bits.join(' · ');
  const byline = profileLine
    ? `<i class="fa-solid fa-wand-magic-sparkles"></i> Generated for you · <span>${profileLine}</span>`
    : '<i class="fa-solid fa-wand-magic-sparkles"></i> AI-generated for your visit';
  ['fp-numbers-byline', 'fp-questions-byline'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = byline;
  });

  // ── 1. "Know your numbers" — interactive payment explorer ──
  const numbersEl = document.getElementById('fp-numbers-body');
  const takeawayEl = document.getElementById('fp-numbers-takeaway');
  const mo60 = calcMonthly(price, 0, apr, 60);
  const tierLabel = tier ? ` · ${tier} credit` : '';
  const priceLabel = (budget || approved) ? formatPrice(price) : '$25,000';
  const downMax = Math.max(5000, Math.round((price * 0.3) / 500) * 500);

  if (numbersEl) {
    numbersEl.innerHTML = '<div class="fp-generating"><span class="pa-typing-dots"><span></span><span></span><span></span></span><span>Personalizing from your profile…</span></div>';
    setTimeout(() => {
      let term = 60;
      let down = 0;
      numbersEl.innerHTML = `
        <div class="fp-controls">
          <div class="fp-control">
            <span class="fp-control-label">Loan term</span>
            <div class="fp-term-toggle" role="group" aria-label="Loan term">
              <button type="button" data-term="48">48 mo</button>
              <button type="button" data-term="60" class="active">60 mo</button>
              <button type="button" data-term="72">72 mo</button>
            </div>
          </div>
          <div class="fp-control">
            <span class="fp-control-label">Down payment · <strong id="fp-down-label">$0</strong></span>
            <input type="range" id="fp-down-slider" class="fp-slider" min="0" max="${downMax}" step="500" value="0" aria-label="Down payment">
          </div>
        </div>
        <div class="fp-primary">
          <div class="fp-primary-v" id="fp-monthly"></div>
          <div class="fp-primary-l" id="fp-monthly-sub"></div>
        </div>
        <div class="fp-numbers fp-numbers-3">
          <div class="fp-num">
            <div class="fp-num-v">${apr}% APR</div>
            <div class="fp-num-l">Your estimated rate${tierLabel} — your anchor if they quote higher</div>
          </div>
          <div class="fp-num">
            <div class="fp-num-v" id="fp-interest"></div>
            <div class="fp-num-l" id="fp-interest-sub"></div>
          </div>
          <div class="fp-num">
            <div class="fp-num-v">${formatPrice(approved || price)}</div>
            <div class="fp-num-l">The most you're approved to finance — keep the out-the-door price under this</div>
          </div>
        </div>
        <div class="fp-afford">
          <div class="fp-afford-title"><i class="fa-solid fa-gauge-high"></i> How much car each monthly payment buys</div>
          <div class="fp-afford-sub">Pick a monthly loan payment you're comfortable with to see the car price it reaches — at ${apr}% over <span id="fp-afford-term">60</span> months. Any down payment is added on top of what the loan covers.</div>
          <div class="fp-afford-rows" id="fp-afford"></div>
        </div>`;
      numbersEl.classList.add('fp-reveal-item');

      const monthlyV = numbersEl.querySelector('#fp-monthly');
      const monthlySub = numbersEl.querySelector('#fp-monthly-sub');
      const interestV = numbersEl.querySelector('#fp-interest');
      const interestSub = numbersEl.querySelector('#fp-interest-sub');
      const affordEl = numbersEl.querySelector('#fp-afford');
      const affordTerm = numbersEl.querySelector('#fp-afford-term');
      const downLabel = numbersEl.querySelector('#fp-down-label');
      const slider = numbersEl.querySelector('#fp-down-slider');
      const termBtns = numbersEl.querySelectorAll('.fp-term-toggle button');

      const recompute = () => {
        const monthly = calcMonthly(price, down, apr, term);
        const financed = Math.max(0, price - down);
        const interest = Math.max(0, Math.round(monthly * term - financed));
        const allIn = Math.round(monthly * term + down);
        monthlyV.textContent = `${formatPrice(monthly)}/mo`;
        monthlySub.textContent = `estimated payment · ${term} mo · ${formatPrice(down)} down on ${priceLabel}`;
        interestV.textContent = formatPrice(interest);
        interestSub.textContent = `Total interest over ${term} mo · ${formatPrice(allIn)} all-in`;
        affordTerm.textContent = term;
        affordEl.innerHTML = [300, 400, 500].map(m => {
          const total = Math.round(fpMaxPrice(m, apr, term, down) / 500) * 500;
          const financed = total - down;
          const cap = down > 0
            ? `${formatPrice(financed)} financed + ${formatPrice(down)} down`
            : 'car price';
          return `<div class="fp-afford-cell"><span class="fp-afford-m">If you pay $${m}/mo</span><span class="fp-afford-p">≈ ${formatPrice(total)}</span><span class="fp-afford-cap">${cap}</span></div>`;
        }).join('');
      };

      termBtns.forEach(b => b.addEventListener('click', () => {
        term = parseInt(b.dataset.term, 10) || 60;
        termBtns.forEach(x => x.classList.toggle('active', x === b));
        recompute();
      }));
      slider.addEventListener('input', () => {
        down = parseInt(slider.value, 10) || 0;
        downLabel.textContent = formatPrice(down);
        recompute();
      });
      recompute();
    }, 450);
  }

  // AI "my take" — a short reasoning callout tuned to the credit tier.
  if (takeawayEl) {
    let take;
    if (tier === 'great' || tier === 'good')
      take = `Your ${apr}% rate is already strong — make the dealer match or beat it, and keep the focus on the out-the-door price so add-ons don't creep into your ${formatPrice(mo60)}/mo.`;
    else if (tier === 'fair' || tier === 'poor')
      take = `At ${apr}%, a bigger down payment or a co-signer could lower your rate — ask what specifically moves you to a better tier before you sign.`;
    else
      take = `Anchor on your ${apr}% estimate and the out-the-door price, not the monthly payment. A longer term lowers the payment but quietly adds thousands in interest.`;
    setTimeout(() => {
      takeawayEl.innerHTML = `<i class="fa-solid fa-lightbulb"></i><div><strong>My take:</strong> ${take}</div>`;
      takeawayEl.hidden = false;
      takeawayEl.classList.add('fp-reveal-item');
    }, 950);
  }

  // ── 2. "Questions to ask the finance manager" (AI-generated + expandable) ──
  const qEl = document.getElementById('fp-questions');
  const faqItem = o => `<div class="faq-item"><button type="button" class="faq-q">${o.q} <i class="fa-solid fa-chevron-down"></i></button><div class="faq-a">${o.a}</div></div>`;
  const tailored = [];
  if (mode === 'prequal')
    tailored.push({ q: `I'm pre-qualified around ${apr}% — can you beat that rate?`, a: `You walked in with a real number, so make them compete. If they can't beat ${apr}%, you can simply finance through DriveClear instead.` });
  if (tier === 'fair' || tier === 'poor')
    tailored.push({ q: 'What would help me qualify for a lower rate?', a: 'A larger down payment, a co-signer, or a shorter term can each lower your rate. Ask which one actually moves your tier.' });
  const baseQs = [
    { q: "What's the out-the-door price?", a: "It bundles tax, title, fees, and any add-ons — the only number that matters. Negotiate this total, never the monthly payment." },
    { q: 'Is this my buy rate, or is it marked up?', a: "Dealers can add points to the lender's rate (dealer reserve) and keep the difference. Ask to see the buy rate and which lender approved you." },
    { q: 'Can I see the amount financed and total interest?', a: 'The monthly payment hides the real cost. Total interest over the full term tells you what the loan actually costs.' },
    { q: 'Which add-ons are optional?', a: "GAP, extended warranties, and paint/fabric protection are optional. You can decline them or buy later — don't let them get packed into the payment." },
  ];
  const initialQs = tailored.concat(baseQs);
  const morePool = [
    { q: 'Is there a prepayment penalty?', a: 'You want the freedom to pay early or refinance later without being charged a fee for it.' },
    { q: 'Can I get the final offer in writing?', a: 'A written offer protects you from "yo-yo" financing, where the rate quietly changes after you\'ve driven off the lot.' },
    { q: 'How is my trade-in being valued separately?', a: 'Keep the trade a separate negotiation from the car price and the financing — dealers can blur them together to hide a weak number.' },
    { q: 'What will this loan cost me in total?', a: 'Ask for the car price + all interest + all fees combined, so you can see the true lifetime cost — not just the monthly.' },
  ];
  fpGen(qEl, 950, () => initialQs.map(faqItem).join(''));

  // Single-open accordion via delegation (covers questions added later).
  qEl?.addEventListener('click', e => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const wasOpen = item?.classList.contains('open');
    qEl.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item?.classList.add('open');
  });

  // "Generate more questions" — AI reveals additional tailored questions.
  const moreBtn = document.getElementById('fp-more-q');
  if (moreBtn) moreBtn.disabled = true;
  setTimeout(() => { if (moreBtn && morePool.length) moreBtn.disabled = false; }, 1000);
  moreBtn?.addEventListener('click', () => {
    if (!morePool.length) return;
    moreBtn.disabled = true;
    const loading = document.createElement('div');
    loading.className = 'fp-generating';
    loading.innerHTML = '<span class="pa-typing-dots"><span></span><span></span><span></span></span><span>Generating more questions…</span>';
    qEl.appendChild(loading);
    setTimeout(() => {
      loading.remove();
      morePool.splice(0, 2).forEach(o => {
        const wrap = document.createElement('div');
        wrap.innerHTML = faqItem(o);
        const item = wrap.firstElementChild;
        item.classList.add('fp-reveal-item');
        qEl.appendChild(item);
      });
      if (!morePool.length) {
        moreBtn.innerHTML = '<i class="fa-solid fa-check"></i> That\'s every key question';
        moreBtn.classList.add('done');
      } else {
        moreBtn.disabled = false;
      }
    }, 700);
  });

  // ── 4. Finance jargon decoder chat ──
  const body = document.getElementById('fp-chat-body');
  const form = document.getElementById('fp-chat-form');
  const input = document.getElementById('fp-chat-input');
  const chips = document.getElementById('fp-chat-chips');
  if (!body || !form) return;

  const addMsg = (cls, html) => {
    const el = document.createElement('div');
    el.className = `pa-msg ${cls}`;
    el.innerHTML = cls.includes('pa-msg-bot')
      ? `<div class="pa-msg-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div><div class="pa-msg-bubble">${html}</div>`
      : `<div class="pa-msg-bubble">${html}</div>`;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  };

  const ask = q => {
    const text = (q || '').trim();
    if (!text) return;
    addMsg('pa-msg-user', escapeHtml(text));
    if (input) input.value = '';
    const typing = addMsg('pa-msg-bot pa-typing', '<span class="pa-typing-dots"><span></span><span></span><span></span></span>');
    setTimeout(() => {
      typing.remove();
      addMsg('pa-msg-bot', generateFinancePrepAnswer(text));
    }, 550);
  };

  form.addEventListener('submit', e => { e.preventDefault(); ask(input?.value); });
  chips?.addEventListener('click', e => {
    const chip = e.target.closest('.pa-chip');
    if (chip) ask(chip.dataset.q || chip.textContent);
  });

  const greeting = mode === 'prequal'
    ? '<div class="pa-msg-label">Before you shop</div><p>You\'re pre-qualified — that\'s real leverage. Ask me to translate any finance term so nothing in the dealership catches you off guard.</p>'
    : '<div class="pa-msg-label">Before you sign</div><p>Your application is in. Let\'s make sure no finance-office jargon trips you up — tap a term below or ask me anything.</p>';
  addMsg('pa-msg-bot', greeting);
}

// ─── Trade-in Insights (trade confirmation page) ─────────
function initTradePrep() {
  const root = document.getElementById('trade-prep');
  if (!root) return;

  // Read whatever the participant entered on the sell/trade form; fall back
  // to a sensible default vehicle so empty submits still produce a real demo.
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem('dcTrade') || '{}'); } catch (e) { saved = {}; }
  const NOW_YEAR = new Date().getFullYear();
  const car = {
    year: parseInt(saved.year, 10) || 2019,
    make: saved.make || 'Honda',
    model: saved.model || 'Accord',
    mileage: parseInt(saved.mileage, 10) || 60000,
    condition: saved.condition || 'good',
  };
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const signed = n => n === 0 ? '$0' : (n > 0 ? '+' : '−') + '$' + Math.abs(n).toLocaleString('en-US');

  // ── Mock valuation (deterministic, client-side) ──
  const age = Math.min(15, Math.max(0, NOW_YEAR - car.year));
  const base = Math.round(34000 * Math.pow(0.90, age));
  const expectedMiles = age * 12000;
  const milesDiff = expectedMiles - car.mileage; // + means fewer miles than average
  let mileageAdj = Math.round(milesDiff * 0.05);
  const cap25 = Math.round(base * 0.25);
  mileageAdj = Math.max(-cap25, Math.min(cap25, mileageAdj));
  const condPct = { excellent: 0.06, good: 0, fair: -0.10 }[car.condition] ?? 0;
  const condAdj = Math.round(base * condPct);
  const popular = ['Honda', 'Toyota', 'Mazda'];
  const demandAdj = popular.includes(car.make) ? Math.round(base * 0.03) : 0;
  const V0 = Math.max(500, Math.round((base + mileageAdj + condAdj + demandAdj) / 100) * 100);

  // ── Trade-vs-sell economics ──
  const TAX_RATE = 0.07;
  const PRIVATE_PREMIUM = 0.12;
  const privatePrice = Math.round((V0 * (1 + PRIVATE_PREMIUM)) / 100) * 100;
  const taxSavings = Math.round((V0 * TAX_RATE) / 10) * 10;
  const privateExtra = privatePrice - V0;
  const netPrivateAdvantage = privateExtra - taxSavings; // >0 → private still ahead

  // ── Shared AI byline + generating reveal ──
  const byline = `<i class="fa-solid fa-wand-magic-sparkles"></i> Based on your car · <span>${car.year} ${car.make} ${car.model} · ${Math.round(car.mileage / 1000)}k mi · ${car.condition} condition</span>`;
  ['tp-offer-byline', 'tp-timing-byline', 'tp-compare-byline'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = byline;
  });
  const tpGen = (el, delay, buildHtml) => {
    if (!el) return;
    el.innerHTML = '<div class="fp-generating"><span class="pa-typing-dots"><span></span><span></span><span></span></span><span>Analyzing your vehicle…</span></div>';
    setTimeout(() => { el.innerHTML = buildHtml(); el.classList.add('fp-reveal-item'); }, delay);
  };

  // ── C. "How we built your offer" transparency waterfall ──
  const milesDesc = milesDiff >= 0
    ? `${Math.round(milesDiff / 1000)}k under average`
    : `${Math.round(-milesDiff / 1000)}k over average`;
  const demandLabel = demandAdj > 0 ? signed(demandAdj) : 'Stable';
  tpGen(document.getElementById('tp-offer-body'), 450, () => `
    <div class="tp-water">
      <div class="tp-water-row"><span>Base market value · ${car.year} ${car.make} ${car.model}</span><span>${formatPrice(base)}</span></div>
      <div class="tp-water-row"><span>Mileage · ${car.mileage.toLocaleString('en-US')} mi (${milesDesc})</span><span class="${mileageAdj >= 0 ? 'pos' : 'neg'}">${signed(mileageAdj)}</span></div>
      <div class="tp-water-row"><span>Condition · ${cap(car.condition)}</span><span class="${condAdj >= 0 ? 'pos' : 'neg'}">${signed(condAdj)}</span></div>
      <div class="tp-water-row"><span>Local demand · ${car.make}</span><span class="pos">${demandLabel}</span></div>
      <div class="tp-water-total"><span>Your no-haggle offer</span><span>${formatPrice(V0)}</span></div>
    </div>
    <p class="calc-note">Transparent by design — no haggling, and the offer is guaranteed for 7 days.</p>`);

  // ── A. Timing & depreciation explorer (interactive) ──
  const timingEl = document.getElementById('tp-timing-body');
  if (timingEl) {
    timingEl.innerHTML = '<div class="fp-generating"><span class="pa-typing-dots"><span></span><span></span><span></span></span><span>Analyzing your vehicle…</span></div>';
    setTimeout(() => {
      let months = 0;
      let milesPerMo = 1000;
      const ageRate = 0.008;     // monthly value decay from age
      const perMileLoss = 0.05;  // $ lost per mile driven
      timingEl.innerHTML = `
        <div class="fp-controls">
          <div class="fp-control">
            <span class="fp-control-label">When will you trade?</span>
            <div class="fp-term-toggle" role="group" aria-label="Trade timing">
              <button type="button" data-mo="0" class="active">Now</button>
              <button type="button" data-mo="3">3 mo</button>
              <button type="button" data-mo="6">6 mo</button>
              <button type="button" data-mo="12">12 mo</button>
            </div>
          </div>
          <div class="fp-control">
            <span class="fp-control-label">Miles you drive / month · <strong id="tp-miles-label">1,000</strong></span>
            <input type="range" id="tp-miles" class="fp-slider" min="0" max="2500" step="100" value="1000" aria-label="Miles driven per month">
          </div>
        </div>
        <div class="fp-primary">
          <div class="fp-primary-v" id="tp-value"></div>
          <div class="fp-primary-l" id="tp-value-sub"></div>
        </div>
        <div class="tp-delta" id="tp-delta"></div>`;
      timingEl.classList.add('fp-reveal-item');

      const valueV = timingEl.querySelector('#tp-value');
      const valueSub = timingEl.querySelector('#tp-value-sub');
      const deltaEl = timingEl.querySelector('#tp-delta');
      const milesLabel = timingEl.querySelector('#tp-miles-label');
      const milesSlider = timingEl.querySelector('#tp-miles');
      const moBtns = timingEl.querySelectorAll('.fp-term-toggle button');

      const valueAt = (t, mpm) => Math.max(0, Math.round((V0 * Math.pow(1 - ageRate, t) - mpm * t * perMileLoss) / 50) * 50);

      const recompute = () => {
        const v = valueAt(months, milesPerMo);
        valueV.textContent = formatPrice(v);
        if (months === 0) {
          valueSub.textContent = "Today's locked offer — guaranteed 7 days, zero obligation";
          deltaEl.className = 'tp-delta tp-delta-good';
          deltaEl.innerHTML = '<i class="fa-solid fa-lock"></i> Lock this in now and the number can\'t drop on you.';
        } else {
          const loss = V0 - v;
          const perMo = Math.round(loss / months);
          valueSub.textContent = `Estimated offer if you wait ${months} months`;
          deltaEl.className = 'tp-delta tp-delta-warn';
          deltaEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> About <strong>−${formatPrice(loss)}</strong> vs today (~${formatPrice(perMo)}/mo of value slipping away).`;
        }
      };

      moBtns.forEach(b => b.addEventListener('click', () => {
        months = parseInt(b.dataset.mo, 10) || 0;
        moBtns.forEach(x => x.classList.toggle('active', x === b));
        recompute();
      }));
      milesSlider.addEventListener('input', () => {
        milesPerMo = parseInt(milesSlider.value, 10) || 0;
        milesLabel.textContent = milesPerMo.toLocaleString('en-US');
        recompute();
      });
      recompute();
    }, 700);
  }

  // ── B. Trade-in vs. sell-it-yourself decision tool ──
  let verdict;
  if (netPrivateAdvantage <= 0)
    verdict = `<i class="fa-solid fa-circle-check"></i> Once the <strong>${formatPrice(taxSavings)}</strong> tax break is counted, trading in actually comes out <strong>ahead by about ${formatPrice(Math.abs(netPrivateAdvantage))}</strong> — with none of the hassle.`;
  else
    verdict = `<i class="fa-solid fa-scale-balanced"></i> Selling yourself might net about <strong>${formatPrice(netPrivateAdvantage)}</strong> more after the tax break — worth it only if you're up for weeks of listing, calls, and test drives.`;
  tpGen(document.getElementById('tp-compare-body'), 950, () => `
    <div class="tp-compare">
      <div class="tp-col tp-col-trade">
        <div class="tp-col-tag"><i class="fa-solid fa-handshake"></i> Trade it in</div>
        <div class="tp-col-v">${formatPrice(V0)}</div>
        <ul class="tp-col-list">
          <li><i class="fa-solid fa-plus"></i> ~${formatPrice(taxSavings)} sales-tax savings on your next car</li>
          <li><i class="fa-solid fa-bolt"></i> Paid instantly — no listing or strangers</li>
          <li><i class="fa-solid fa-lock"></i> Offer locked for 7 days</li>
        </ul>
      </div>
      <div class="tp-col tp-col-sell">
        <div class="tp-col-tag"><i class="fa-solid fa-tag"></i> Sell it yourself</div>
        <div class="tp-col-v">${formatPrice(privatePrice)}</div>
        <ul class="tp-col-list">
          <li><i class="fa-solid fa-plus"></i> ~${formatPrice(privateExtra)} more before costs</li>
          <li><i class="fa-solid fa-minus"></i> No trade-in tax break (≈ −${formatPrice(taxSavings)})</li>
          <li><i class="fa-solid fa-clock"></i> Weeks of listing, calls & test drives</li>
        </ul>
      </div>
    </div>
    <div class="tp-verdict">${verdict}</div>`);

  // ── E. AI "My take" synthesis ──
  const takeawayEl = document.getElementById('tp-takeaway');
  if (takeawayEl) {
    const waitNote = `waiting even six months could shave roughly ${formatPrice(V0 - Math.round((V0 * Math.pow(0.992, 6) - 1000 * 6 * 0.05) / 50) * 50)} off it`;
    const verdictNote = netPrivateAdvantage <= 0
      ? `selling privately wouldn't beat it once the ${formatPrice(taxSavings)} tax break is in`
      : `selling privately could net a bit more, but only if you've got weeks to spare`;
    const take = `Your ${formatPrice(V0)} offer is locked for 7 days — ${verdictNote}, and ${waitNote}. Locking it in now is the confident move.`;
    setTimeout(() => {
      takeawayEl.innerHTML = `<i class="fa-solid fa-lightbulb"></i><div><strong>My take:</strong> ${take}</div>`;
      takeawayEl.hidden = false;
      takeawayEl.classList.add('fp-reveal-item');
    }, 1150);
  }
}

// Reverse amortization: the most a given monthly payment can finance,
// plus the down payment, at a fixed APR over N months.
function fpMaxPrice(monthly, annualRate, months, down = 0) {
  const i = annualRate / 100 / 12;
  if (i <= 0) return monthly * months + down;
  const principal = monthly * (1 - Math.pow(1 + i, -months)) / i;
  return principal + down;
}

// Plain-English answers for common dealership finance jargon.
function generateFinancePrepAnswer(q) {
  const t = (q || '').toLowerCase();
  const apr = (typeof Profile !== 'undefined' && Profile.apr) ? Profile.apr() : 6.9;

  if (t.includes('money factor') || (t.includes('apr') && t.includes('factor')))
    return '<p><strong>APR</strong> is your loan\'s yearly interest cost as a percent. <strong>Money factor</strong> is the leasing version — multiply it by 2,400 to get the rough APR equivalent. For a purchase loan, keep the focus on APR.</p>';
  if (t.includes('buy rate') || t.includes('markup') || t.includes('reserve'))
    return '<p>The <strong>buy rate</strong> is the rate the lender gives the dealer. Dealers can mark it up (called <em>dealer reserve</em>) and pocket the difference. Ask: "Is this the buy rate, and which lender approved me?"</p>';
  if (t.includes('apr') || t.includes('interest') || (t.includes('rate') && !t.includes('great') && !t.includes('accurate')))
    return `<p><strong>APR</strong> is the yearly cost of borrowing. Your estimate is about <strong>${apr}%</strong> — every 1% lower saves roughly $10–$15/mo per $10k financed. If they quote higher, ask why.</p>`;
  if (t.includes('gap'))
    return '<p><strong>GAP</strong> covers the gap between what you owe and the car\'s value if it\'s totaled early in the loan. It\'s optional — handy with a small down payment, but often cheaper through your own insurer.</p>';
  if (t.includes('warranty') || t.includes('vsc') || t.includes('service contract'))
    return '<p>An <strong>extended warranty / VSC</strong> is an optional service contract. It\'s negotiable and can be added later — don\'t let it get folded into your monthly payment without a clear standalone price.</p>';
  if (t.includes('out the door') || t.includes('out-the-door') || t.includes('otd') || t.includes('monthly') || t.includes('payment'))
    return '<p>Always negotiate the <strong>out-the-door (OTD) price</strong> — the full total with tax, title, and fees — never the monthly payment. A low monthly can hide a longer term or padded add-ons.</p>';
  if (t.includes('down'))
    return '<p>A larger <strong>down payment</strong> lowers your loan and total interest. 10–20% is a common target — but keep an emergency cushion; don\'t drain your savings.</p>';
  if (t.includes('72') || t.includes('60') || t.includes('48') || t.includes('term') || t.includes('length'))
    return '<p>Longer <strong>terms</strong> (72+ months) shrink the monthly payment but cost far more interest and risk going "underwater." Pick the shortest term whose payment you can comfortably afford.</p>';
  if (t.includes('trade'))
    return '<p>Keep your <strong>trade-in</strong> a separate conversation from the car price and the financing — dealers can blur them together. Know your trade\'s value first (DriveClear gives a no-haggle offer).</p>';
  if (t.includes('credit') || t.includes('score') || t.includes('fico'))
    return '<p>Your <strong>credit score</strong> sets your rate tier. Pre-qualification uses a soft pull (no impact); a full application is a hard pull. Try not to let several dealers run your credit separately.</p>';
  if (t.includes('doc') || t.includes('fee'))
    return '<p><strong>Doc/processing fees</strong> are often padded. Ask for an itemized breakdown and question anything vague. DriveClear charges zero dealer fees.</p>';
  if (t.includes('add-on') || t.includes('addon') || t.includes('packing') || t.includes('protection'))
    return '<p>Watch for <strong>payment packing</strong> — optional add-ons (GAP, warranties, paint/fabric protection) slipped into the monthly number. Ask the price of each item and decline what you don\'t want.</p>';
  if (t.includes('prequal') || t.includes('pre-qual') || t.includes('approv'))
    return '<p><strong>Pre-qualification</strong> is a soft-pull estimate of your rate and budget — no credit impact and no obligation. A full <strong>approval/application</strong> is a hard pull that locks in real terms.</p>';

  return '<p>Good question. The golden rule: negotiate the <strong>out-the-door price</strong>, confirm your <strong>APR isn\'t marked up</strong>, and treat every add-on as optional. Want me to explain GAP, extended warranties, or buy rate?</p>';
}

// ─── Init compare on page load ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Render tray if there's already a saved compare list from a previous session
  setTimeout(() => {
    refreshCompareButtons();
    if (getCompareList().length) renderCompareTray();
  }, 100);
});

// ─── Conversational nav search suggestions ────────────────
function initNavSearchSuggest() {
  if (typeof VEHICLES === 'undefined') return;
  document.querySelectorAll('form.nav-search').forEach(setupNavSuggest);
}

const MAKE_WORDS = {
  honda: 'Honda', toyota: 'Toyota', ford: 'Ford', chevy: 'Chevrolet', chevrolet: 'Chevrolet',
  hyundai: 'Hyundai', mazda: 'Mazda', volkswagen: 'Volkswagen', nissan: 'Nissan', kia: 'Kia',
};

// Turn a free-text / conversational query into structured search params.
function parseSearchParams(q) {
  const t = ' ' + q + ' ';
  const P = {};
  if (/\b(suv|crossover|cuv|family|families|kids)\b/.test(t)) P.body = 'SUV';
  else if (/\b(sedan|sedans|commuter|commute|daily driver)\b/.test(t)) P.body = 'Sedan';
  else if (/\b(truck|trucks|pickup|haul|hauling|tow|towing|work)\b/.test(t)) P.body = 'Truck';

  for (const k in MAKE_WORDS) { if (t.includes(k)) { P.make = MAKE_WORDS[k]; break; } }
  if (/\bvw\b/.test(t)) P.make = 'Volkswagen';

  if (/\bawd\b|all[- ]?wheel|four season|snow/.test(t)) P.drive = 'AWD';
  else if (/\bfwd\b|front[- ]?wheel/.test(t)) P.drive = 'FWD';
  else if (/\b4wd\b|4x4|four[- ]?wheel/.test(t)) P.drive = '4WD';

  let pm = t.match(/\$?\s*(\d{1,3})\s*k\b/) ||
           t.match(/(?:under|below|less than|up to|max|budget|around)\s*\$?\s*(\d{4,6})\b/) ||
           t.match(/\$\s*(\d{4,6})\b/);
  if (pm) P.maxPrice = (/k\b/.test(pm[0]) && pm[1].length <= 3) ? parseInt(pm[1]) * 1000 : parseInt(pm[1]);
  if (!P.maxPrice && /\b(cheap|cheapest|budget|affordable|inexpensive)\b/.test(t)) P.maxPrice = 22000;

  const milesMatch = t.match(/(?:under|below|less than|up to|max)\s*(\d{1,3})\s*k?\s*(?:mi|mile|miles)/);
  if (milesMatch) P.maxMiles = parseInt(milesMatch[1]) * (milesMatch[1].length <= 3 ? 1000 : 1);
  if (!P.maxMiles && /low mile|low mileage|fewest mile|lowest mile|barely used/.test(t)) P.maxMiles = 30000;

  const ym = t.match(/\b(20[12]\d)\b/);
  if (ym) {
    if (/newer|or up|and up|\+|after|since/.test(t)) P.minYear = parseInt(ym[1]);
    else P.year = parseInt(ym[1]);
  } else if (/\b(newer|newest|late model|recent)\b/.test(t)) P.minYear = 2021;

  const distMatch = t.match(/within\s*(\d{2,3})\s*(?:mi|mile|miles)/);
  if (distMatch) P.maxDist = parseInt(distMatch[1]);
  else if (/\b(near me|nearby|close by|close to me|local|around me)\b/.test(t)) P.maxDist = 50;

  if (/\b(mpg|fuel|economy|economical|efficient|efficiency|gas|eco|hybrid)\b/.test(t)) P.minMpg = 33;

  return P;
}

// Deterministic synthetic distance (miles) per vehicle — stable across the app.
function vehicleDistance(v) {
  return ((v.id * 7) % 12) * 9 + 6; // ~6–105 miles
}

function paramMatches(v, P) {
  if (P.make && v.make !== P.make) return false;
  if (P.body && v.body !== P.body) return false;
  if (P.drive && v.drivetrain !== P.drive) return false;
  if (P.maxPrice && v.price > P.maxPrice) return false;
  if (P.maxMiles && v.mileage > P.maxMiles) return false;
  if (P.year && v.year !== P.year) return false;
  if (P.minYear && v.year < P.minYear) return false;
  if (P.maxYear && v.year > P.maxYear) return false;
  if (P.minMpg && v.mpgHwy < P.minMpg) return false;
  if (P.maxDist && vehicleDistance(v) > P.maxDist) return false;
  return true;
}

function paramLabel(P) {
  const parts = [];
  if (P.drive) parts.push(P.drive);
  if (P.year) parts.push(P.year);
  else if (P.minYear) parts.push(P.minYear + '+');
  if (P.make) parts.push(P.make);
  if (P.body === 'SUV') parts.push('SUVs');
  else if (P.body === 'Truck') parts.push('Trucks');
  else if (P.body === 'Sedan') parts.push('Sedans');
  else parts.push('vehicles');
  let s = parts.join(' ');
  const extra = [];
  if (P.minMpg) extra.push('great MPG');
  if (P.maxMiles) extra.push('under ' + (P.maxMiles / 1000) + 'k mi');
  if (P.maxDist) extra.push('within ' + P.maxDist + ' mi');
  if (P.maxPrice) extra.push('under ' + formatPrice(P.maxPrice));
  if (extra.length) s += ' · ' + extra.join(', ');
  return s;
}

function paramHref(P) {
  const u = new URLSearchParams();
  if (P.make) [].concat(P.make).forEach(m => u.append('make', m));
  if (P.body) u.set('body', P.body);
  if (P.drive) u.set('drive', P.drive);
  if (P.maxPrice) u.set('maxPrice', P.maxPrice);
  if (P.maxMiles) u.set('maxMiles', P.maxMiles);
  if (P.year) { u.set('minYear', P.year); u.set('maxYear', P.year); }
  if (P.minYear) u.set('minYear', P.minYear);
  if (P.maxYear) u.set('maxYear', P.maxYear);
  if (P.minMpg) u.set('minMpg', P.minMpg);
  if (P.maxDist) u.set('maxDist', P.maxDist);
  if (P.sort) u.set('sort', P.sort);
  return 'srp.html?' + u.toString();
}

function coreParams(P) {
  const c = {};
  if (P.body) c.body = P.body;
  if (P.drive) c.drive = P.drive;
  if (P.maxPrice) c.maxPrice = P.maxPrice;
  if (P.minMpg) c.minMpg = P.minMpg;
  return c;
}

function paramIcon(P) {
  if (P.body === 'Truck') return 'fa-truck-pickup';
  if (P.body) return 'fa-car-side';
  if (P.minMpg) return 'fa-gas-pump';
  if (P.drive) return 'fa-snowflake';
  if (P.maxPrice) return 'fa-dollar-sign';
  if (P.make) return 'fa-tag';
  if (P.maxMiles) return 'fa-gauge';
  return 'fa-layer-group';
}

function buildSearchSuggestions(rawQ) {
  const q = rawQ.trim().toLowerCase();
  const out = { vehicles: [], groups: [] };
  if (q.length < 2) return out;

  // Exact / close vehicle matches by name (make/model/trim/year) → detail page.
  // Segment words (e.g. "suv") deliberately don't list individual cars here —
  // those drive the recommendation groups instead.
  const words = q.split(/\s+/).filter(Boolean);
  out.vehicles = VEHICLES.filter(v => {
    const name = `${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase();
    return name.includes(q) || (words.length <= 3 && words.every(w => name.includes(w)));
  }).slice(0, 3).map(v => ({
    title: `${v.year} ${v.make} ${v.model}`,
    sub: `${v.trim} · ${formatPrice(v.price)}`,
    href: `vdp.html?id=${v.id}`,
  }));

  // Conversational → grouped searches
  const toSample = v => ({
    title: `${v.year} ${v.make} ${v.model}`,
    sub: `${v.mileage.toLocaleString()} mi · ${formatPrice(v.price)}`,
    href: `vdp.html?id=${v.id}`,
    img: (v.images && v.images[0]) || '',
  });

  // Start from the participant profile (budget/body always anchor the groups),
  // then let anything typed override or add to it.
  const base = (typeof Profile !== 'undefined' && Profile.toParams) ? Profile.toParams() : {};
  const typed = parseSearchParams(q);
  const P = Object.assign({}, base, typed);
  const facets = Object.keys(P);

  // Core pool — constraints that never relax. Reused by discovery fill below.
  const coreOf = v =>
    (!P.body || v.body === P.body) &&
    (!P.drive || v.drivetrain === P.drive) &&
    (!P.maxPrice || v.price <= P.maxPrice) &&
    (!P.minMpg || v.mpgHwy >= P.minMpg);
  const corePool = facets.length ? VEHICLES.filter(coreOf) : VEHICLES.slice();

  const usedSigs = new Set();
  const pushGroup = (label, note, icon, pool, hrefParams) => {
    if (!pool.length) return;
    const sig = pool.slice(0, 3).map(v => v.id).join('-');
    if (usedSigs.has(sig)) return;       // skip groups that preview the same cars
    usedSigs.add(sig);
    out.groups.push({
      label, note, icon,
      href: paramHref(hrefParams),
      count: pool.length,
      samples: pool.slice(0, 3).map(toSample),
    });
  };

  if (facets.length) {
    const coreCars = corePool;
    const anchored = !!(P.body || P.maxPrice); // need a functional anchor to relax around

    // 1) Exactly what they asked for
    pushGroup(paramLabel(P), 'Matches your search', paramIcon(P),
      VEHICLES.filter(v => paramMatches(v, P)), P);

    // 2) Better value — price exception: cheaper than the budget, equal/better car
    if (P.maxPrice) {
      const cheaper = coreCars
        .filter(v => v.price < P.maxPrice)
        .sort((a, b) => (b.marketSavings || 0) - (a.marketSavings || 0) || a.price - b.price || a.mileage - b.mileage);
      pushGroup('Better value below your budget', `More car for less than ${formatPrice(P.maxPrice)}`,
        'fa-piggy-bank', cheaper, Object.assign(coreParams(P), { sort: 'price-asc' }));
    }

    // 3) Other brands — make is flexible
    if (P.make && anchored) {
      const alts = coreCars.filter(v => v.make !== P.make);
      const altMakes = [...new Set(alts.map(v => v.make))].slice(0, 3);
      pushGroup('Other brands to consider', altMakes.join(', ') || 'Alternative makes',
        'fa-shuffle', alts, Object.assign(coreParams(P), { make: altMakes }));
    }

    // 4) Nearby model years — year is flexible (±2)
    if (P.year && anchored) {
      const near = coreCars.filter(v => Math.abs(v.year - P.year) <= 2 && v.year !== P.year);
      pushGroup('Similar model years', `${P.year - 2}–${P.year + 2}`,
        'fa-calendar-days', near, Object.assign(coreParams(P), { minYear: P.year - 2, maxYear: P.year + 2 }));
    }

    // 5) A little more mileage — mileage is flexible (up to +20%)
    if (P.maxMiles && anchored) {
      const relaxed = Math.round((P.maxMiles * 1.2) / 1000) * 1000;
      const more = coreCars.filter(v => v.mileage > P.maxMiles && v.mileage <= relaxed);
      pushGroup('A little more mileage', `Up to ${relaxed / 1000}k mi`,
        'fa-gauge-high', more, Object.assign(coreParams(P), { maxMiles: relaxed }));
    }

    // 6) Worth a short drive — location is flexible (out to 2× the radius)
    if (P.maxDist && anchored) {
      const far = coreCars.filter(v => {
        const d = vehicleDistance(v);
        return d > P.maxDist && d <= P.maxDist * 2;
      });
      pushGroup('Worth a short drive', `${P.maxDist}–${P.maxDist * 2} mi away`,
        'fa-location-dot', far, Object.assign(coreParams(P), { maxDist: P.maxDist * 2 }));
    }
  }

  // Plain text search — only when nothing structured was understood (no profile/facets).
  if (!out.groups.length && !facets.length) {
    const textHits = VEHICLES.filter(v => {
      const hay = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.body} ${v.extColor}`.toLowerCase();
      return hay.includes(q) || (words.length <= 3 && words.every(w => hay.includes(w)));
    });
    if (textHits.length) {
      pushGroup(`Search “${rawQ.trim()}”`, 'All matches', 'fa-magnifying-glass',
        textHits, { /* href below */ });
      out.groups[out.groups.length - 1].href = 'srp.html?q=' + encodeURIComponent(rawQ.trim());
    }
  }

  // Top up to three recommendation groups with discovery angles.
  // Keep the budget ceiling (the non-negotiable) but relax body if the strict
  // pool is too thin, so we can still surface three groups — hrefs match the pool.
  let discPool = corePool, discParams = coreParams(P);
  if (discPool.length < 3) {
    const priced = VEHICLES.filter(v =>
      (!P.maxPrice || v.price <= P.maxPrice) &&
      (!P.drive || v.drivetrain === P.drive) &&
      (!P.minMpg || v.mpgHwy >= P.minMpg));
    if (priced.length >= 3) {
      discPool = priced;
      discParams = {};
      if (P.maxPrice) discParams.maxPrice = P.maxPrice;
      if (P.drive) discParams.drive = P.drive;
      if (P.minMpg) discParams.minMpg = P.minMpg;
    } else {
      discPool = VEHICLES.slice();
      discParams = {};
    }
  }
  const discoveries = [
    { label: 'Biggest savings', note: 'Most below market', icon: 'fa-tags',
      sort: (a, b) => (b.marketSavings || 0) - (a.marketSavings || 0), params: { sort: 'recommended' } },
    { label: 'Lowest mileage', note: 'Gently driven', icon: 'fa-gauge-high',
      sort: (a, b) => a.mileage - b.mileage, params: { sort: 'miles-asc' } },
    { label: 'Newest model years', note: 'Latest arrivals', icon: 'fa-calendar-days',
      sort: (a, b) => b.year - a.year, params: { sort: 'year-desc' } },
  ];
  for (const d of discoveries) {
    if (out.groups.length >= 3) break;
    pushGroup(d.label, d.note, d.icon, discPool.slice().sort(d.sort), Object.assign({}, discParams, d.params));
  }

  out.groups = out.groups.slice(0, 3);
  return out;
}

function setupNavSuggest(form) {
  const input = form.querySelector('input');
  if (!input) return;
  const panel = document.createElement('div');
  panel.className = 'nav-suggest';
  panel.setAttribute('role', 'listbox');
  form.appendChild(panel);

  let actions = [];   // ordered hrefs for keyboard nav
  let active = -1;

  const close = () => { panel.classList.remove('open'); active = -1; };
  const setActive = i => {
    const opts = panel.querySelectorAll('[data-i]');
    if (!opts.length) return;
    active = (i + opts.length) % opts.length;
    opts.forEach((o, idx) => o.classList.toggle('active', idx === active));
    opts[active].scrollIntoView({ block: 'nearest' });
  };

  const miniCar = s => {
    const i = actions.push(s.href) - 1;
    return `<a class="ns-car" role="option" data-i="${i}" href="${s.href}">
      <span class="ns-car-img" style="background-image:url('${s.img}')"></span>
      <span class="ns-car-info">
        <span class="ns-car-name">${s.title}</span>
        <span class="ns-car-spec">${s.sub}</span>
      </span>
    </a>`;
  };

  const render = () => {
    const data = buildSearchSuggestions(input.value);
    actions = [];
    if (!data.vehicles.length && !data.groups.length) { panel.innerHTML = ''; close(); return; }
    let html = '';
    if (data.vehicles.length) {
      html += `<div class="ns-head">Matching vehicles</div>`;
      data.vehicles.forEach(v => {
        const i = actions.push(v.href) - 1;
        html += `<a class="ns-item" role="option" data-i="${i}" href="${v.href}">
          <span class="ns-ic"><i class="fa-solid fa-car"></i></span>
          <span class="ns-main"><span class="ns-title">${v.title}</span><span class="ns-sub">${v.sub}</span></span>
        </a>`;
      });
    }
    if (data.groups.length) {
      html += `<div class="ns-head">Suggested searches</div>`;
      data.groups.forEach(g => {
        const i = actions.push(g.href) - 1;
        html += `<div class="ns-group">
          <a class="ns-group-head" role="option" data-i="${i}" href="${g.href}">
            <span class="ns-ic"><i class="fa-solid ${g.icon}"></i></span>
            <span class="ns-group-main">
              <span class="ns-group-label">${g.label}</span>
              ${g.note ? `<span class="ns-group-note">${g.note}</span>` : ''}
            </span>
            <span class="ns-count">${g.count}</span>
          </a>
          <div class="ns-cars">${g.samples.map(miniCar).join('')}</div>
          <a class="ns-shop" href="${g.href}">Shop all ${g.count} <i class="fa-solid fa-arrow-right"></i></a>
        </div>`;
      });
    }
    panel.innerHTML = html;
    active = -1;
    panel.classList.add('open');
  };

  input.addEventListener('input', debounce(render, 130));
  input.addEventListener('focus', () => { if (input.value.trim().length >= 2) render(); });
  // Submitting the search parses the query into real SRP filters — merged with the
  // participant profile — instead of a raw text search. Note: parseSearchParams expects
  // lowercase input.
  const submitSearch = () => {
    const text = input.value.trim();
    const base = (typeof Profile !== 'undefined' && Profile.toParams) ? Profile.toParams() : {};
    const P = Object.assign({}, base, parseSearchParams(text.toLowerCase()));
    if (Object.keys(P).length) window.location.href = paramHref(P);
    else if (text) window.location.href = 'srp.html?q=' + encodeURIComponent(text);
    else window.location.href = 'srp.html';
  };

  input.addEventListener('keydown', e => {
    const isOpen = panel.classList.contains('open');
    if (e.key === 'ArrowDown' && isOpen) { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp' && isOpen) { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Escape') { close(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && active >= 0 && actions[active]) window.location.href = actions[active];
      else submitSearch();
    }
  });

  form.addEventListener('submit', e => { e.preventDefault(); submitSearch(); });

  // Prevent blur from firing before an option click registers
  panel.addEventListener('mousedown', e => e.preventDefault());
  document.addEventListener('click', e => { if (!form.contains(e.target)) close(); });
}
