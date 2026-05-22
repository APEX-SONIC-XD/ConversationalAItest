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
      if (this.parentElement) this.parentElement.style.background = 'linear-gradient(135deg,#1a2640 0%,#243352 100%)';
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

  // SRP init
  if (document.getElementById('srp-grid')) initSRP();

  // VDP init
  if (document.getElementById('vdp-root')) initVDP();

  // Render homepage featured vehicles
  const featGrid = document.getElementById('featured-grid');
  if (featGrid) renderCards(VEHICLES.slice(0, 6), featGrid);
});

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
  const monthly = calcMonthly(v.price);
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
      <div class="v-monthly">Est. <b>${formatPrice(monthly)}/mo</b> · 6.9% APR, 60 mo</div>
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
    minYear: parseInt(urlP.get('minYear')) || 2018,
    maxYear: parseInt(urlP.get('maxYear')) || 2023,
    minPrice: parseInt(urlP.get('minPrice')) || 0,
    maxPrice: parseInt(urlP.get('maxPrice')) || 50000,
    maxMiles: parseInt(urlP.get('maxMiles')) || 100000,
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

  // Price inputs
  const minPriceIn = document.getElementById('fp-min-price');
  const maxPriceIn = document.getElementById('fp-max-price');
  const maxMilesIn = document.getElementById('fp-max-miles');
  if (minPriceIn) minPriceIn.value = state.minPrice || '';
  if (maxPriceIn) maxPriceIn.value = state.maxPrice < 50000 ? state.maxPrice : '';
  if (maxMilesIn) maxMilesIn.value = state.maxMiles < 100000 ? state.maxMiles : '';

  function readFilters() {
    state.make = [...document.querySelectorAll('.fp-make:checked')].map(c => c.value);
    state.body = [...document.querySelectorAll('.fp-body:checked')].map(c => c.value);
    state.minPrice = parseInt(minPriceIn?.value) || 0;
    state.maxPrice = parseInt(maxPriceIn?.value) || 50000;
    state.maxMiles = parseInt(maxMilesIn?.value) || 100000;
    state.query = searchInput?.value.trim().toLowerCase() || '';
    state.sort = sortSel?.value || 'recommended';
  }

  function applyAndRender() {
    readFilters();
    let results = VEHICLES.filter(v => {
      if (state.make.length && !state.make.includes(v.make)) return false;
      if (state.body.length && !state.body.includes(v.body)) return false;
      if (v.price < state.minPrice || v.price > state.maxPrice) return false;
      if (v.mileage > state.maxMiles) return false;
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
  document.querySelectorAll('.fp-make, .fp-body').forEach(cb => {
    cb.addEventListener('change', applyAndRender);
  });
  [minPriceIn, maxPriceIn, maxMilesIn].forEach(inp => {
    if (inp) inp.addEventListener('input', debounce(applyAndRender, 400));
  });
  if (searchInput) searchInput.addEventListener('input', debounce(applyAndRender, 300));
  if (sortSel) sortSel.addEventListener('change', applyAndRender);
  if (clearBtn) clearBtn.addEventListener('click', () => {
    document.querySelectorAll('.fp-make, .fp-body').forEach(cb => cb.checked = false);
    if (minPriceIn) minPriceIn.value = '';
    if (maxPriceIn) maxPriceIn.value = '';
    if (maxMilesIn) maxMilesIn.value = '';
    if (searchInput) searchInput.value = '';
    state.make = []; state.body = []; state.minPrice = 0; state.maxPrice = 50000; state.maxMiles = 100000; state.query = '';
    applyAndRender();
  });

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
  const monthly = calcMonthly(v.price);
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
  if (text.includes('apr') || text.includes('rate') || text.includes('interest')) {
    return `<p>A lower APR means a smaller share of each payment goes to interest. On a 60-month loan, every <strong>1% lower APR</strong> typically drops your monthly payment by about <strong>$10–$15</strong> per $10K financed.</p>
            <p>Getting pre-approved is the fastest way to see your real rate — it's a soft pull and won't affect your credit.</p>`;
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
    return `<p>A common guideline is to keep your auto payment under <strong>10–15% of your monthly take-home pay</strong>, and total transportation costs under 20%.</p>
            <p>Adjust the term and down payment in the calculator to land at a payment that fits your budget.</p>`;
  }
  return `<p>Great question — a DriveClear finance specialist can walk you through the details for your specific situation.</p>
          <p>You can also adjust the inputs in the <a href="#payment-calc">Payment Calculator</a> below, or call <strong>(800) 555-1234</strong>.</p>`;
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
  document.getElementById('ct-compare')?.addEventListener('click', openCompareModal);
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

// ─── Init compare on page load ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Render tray if there's already a saved compare list from a previous session
  setTimeout(() => {
    refreshCompareButtons();
    if (getCompareList().length) renderCompareTray();
  }, 100);
});
