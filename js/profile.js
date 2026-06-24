/* ============================================================
   DriveClear — Participant Profile  (live co-creation study)
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for what the participant has told us.
   The facilitator updates PARTICIPANT below (by prompting Cursor);
   the participant sees the result on refresh. No backend, no API
   key, and NO on-screen controls (invisible to the participant).

   PLUG-IN CONTRACT — every AI feature (current or future) should:
     • on init, read one or more of:
         Profile.toParams()    -> intent {body,maxPrice,make,minYear,
                                   maxMiles,drive,minMpg,maxDist}
         Profile.apr()         -> APR % derived from the credit tier
         Profile.priorities()  -> ordered ranking keys (compare page)
         Profile.summary()     -> short human phrase for greetings
         PARTICIPANT.homepage  -> index AI rec, test drive visit, compare table
         (picks: name, price, copy; year/make/model for optional VDP link)
         Profile.visitWhen/Where() -> test-drive-confirmation.html
         Profile.compareCars()     -> compare.html ranking
         Profile.srpHref()         -> SRP link from intent (auto if footLinkHref omitted)
         Profile.lotLocations()    -> inventory lot cities (applyToInventory on load)
         Profile.pickLocation()    -> homepage pick location badge
     • optionally call Profile.subscribe(fn) to react to live changes
       (primary flow is read-on-load + participant refresh).

   A field set to null / [] means "not stated yet".

   Between sessions: reset from js/profile.blank.js (copy PARTICIPANT block).
   ============================================================ */

const PARTICIPANT = {
  // ── Core shopping intent (SRP, VDP payments, finance, compare, nav search) ──
  // TEST SESSION — Honda/Toyota SUVs, $28k budget, fair credit
  maxPrice: 28000,
  maxApproved: null,
  maxMonthly: null,
  body: 'SUV',
  makes: ['Honda', 'Toyota'],
  minYear: 2020,
  maxMiles: null,
  drivetrain: null,
  minMpg: null,
  maxDist: null,

  needs: ['family'],

  tradeIn: null,

  creditTier: 'fair',
  journeyStage: 'Prepared',

  // ── Market / region (inventory lot cities, distance context) ──
  // Facilitator: set label + lotCities when participant is shopping in a new area.
  market: {
    label: 'Charlotte, NC',
    lotCities: [
      'Charlotte, NC', 'Huntersville, NC', 'Matthews, NC', 'Fort Mill, SC',
      'Rock Hill, SC', 'Gastonia, NC', 'Mooresville, NC', 'Concord, NC',
      'Indian Trail, NC', 'Pineville, NC',
    ],
  },

  // ── Homepage AI recommendations (index.html) ──
  // Facilitator: edit display copy here — name, price, expert blurbs, drawer text.
  // VDP link (optional): set year + make + model, or vdpId as fallback.
  homepage: {
    titleAccent: 'DriveClear Charlotte',
    appointment: 'Saturday, 10:30 AM',
    dealerAddress: '1234 South Tryon St, Charlotte, NC',
    criteriaText: null,
    footText: 'Ranked by fit to your criteria, expert reviews, and verified owner sentiment.',
    footLinkText: null,
    footLinkHref: null,
    compare: {
      title: 'European AWD sedans — compared on what matters',
      subtitle: "Skipping the frills. Here's <strong>engine performance, drivetrain, year, mileage, price, and value</strong> for your shortlisted sedans across nearby dealers. Best in each row is highlighted.",
      footDefault: 'AI pick: <strong>BMW 330i xDrive</strong> balances strongest value with near-best performance; <strong>Volvo S60</strong> is the lowest price and most efficient.',
    },
    picks: [
      {
        key: 'audi',
        name: '2023 Audi A4 quattro',
        price: '$42,990',
        year: 2023,
        make: 'Audi',
        model: 'A4',
        match: '98% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Premium Plus · AWD Sedan',
        warrantyBadge: 'Factory warranty active',
        specs: [
          { icon: 'gauge-high', text: '261 hp' },
          { icon: 'snowflake', text: 'quattro AWD' },
          { icon: 'gas-pump', text: '27 mpg' },
        ],
        expert: 'Critics praise the refined cabin and composed ride; the 2.0T quattro is the sweet spot for all-weather grip without thirst.',
        ownersRating: '4.7/5',
        ownersText: 'Owners love interior quality and winter confidence; a few note higher routine service costs.',
        compareMetrics: { price: 42990, mpg: 27, hp: 261, zero: 5.2, miles: 18400, distMin: 0, value: 0 },
        drawer: {
          dealer: 'DriveClear Charlotte',
          distance: 'At your appointment dealer',
          value: 'At market',
          valueClass: 'at',
          intro: "Here's the full picture on the <strong>2023 Audi A4 quattro</strong> at your appointment dealer. It's a strong fit for European AWD sedans in your range, with factory warranty still active.",
          specs: [
            ['Engine', '2.0L Turbo I4'], ['Horsepower', '261 hp'], ['0–60 mph', '5.2 s'],
            ['Drivetrain', 'quattro AWD'], ['Year', '2023'], ['Mileage', '18,400 mi'],
            ['MPG (comb.)', '27'], ['Warranty', 'Factory until 2027 / 50k mi'],
          ],
          fit: 'Matches all four must-haves: European make, AWD, sedan, and $30k–$50k. Quickest 0–60 of your shortlist and the only one physically at your appointment dealer.',
          watch: 'Routine maintenance runs higher than mainstream brands — budget for premium service intervals.',
          chips: ['Is the price fair?', 'How reliable is it?', 'What will service cost?'],
        },
      },
      {
        key: 'bmw',
        name: '2022 BMW 330i xDrive',
        price: '$39,850',
        year: 2022,
        make: 'BMW',
        model: '330i',
        match: '95% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Sport Line · AWD Sedan',
        warrantyBadge: 'Factory warranty active',
        specs: [
          { icon: 'gauge-high', text: '255 hp' },
          { icon: 'snowflake', text: 'xDrive AWD' },
          { icon: 'gas-pump', text: '30 mpg' },
        ],
        expert: "Widely called the driver's pick in the class — sharp handling with xDrive traction and a strong, efficient turbo four.",
        ownersRating: '4.6/5',
        ownersText: 'Praised for fun-to-drive feel and tech; some wish for more rear-seat space.',
        compareMetrics: { price: 39850, mpg: 30, hp: 255, zero: 5.3, miles: 24100, distMin: 25, value: 1800 },
        drawer: {
          dealer: 'Lake Norman BMW · Huntersville',
          distance: '25 min away',
          value: '$1,800 below market',
          valueClass: 'great',
          intro: "Here's the breakdown on the <strong>2022 BMW 330i xDrive</strong>. It's my best-value pick on your shortlist — priced about $1,800 under comparable listings, with factory warranty active.",
          specs: [
            ['Engine', '2.0L Turbo I4'], ['Horsepower', '255 hp'], ['0–60 mph', '5.3 s'],
            ['Drivetrain', 'xDrive AWD'], ['Year', '2022'], ['Mileage', '24,100 mi'],
            ['MPG (comb.)', '30'], ['Warranty', 'Factory until 2026 / 50k mi'],
          ],
          fit: 'Hits every criterion and leads on value. Best efficiency of the gas models and the sharpest driving feel — strong if performance is your priority.',
          watch: 'Tighter rear seat and a firmer ride than the Audi or Volvo — worth a test sit if you carry passengers.',
          chips: ['Why is it below market?', 'Compare to the Audi', 'Is mileage a concern?'],
        },
      },
      {
        key: 'volvo',
        name: '2023 Volvo S60 B5',
        price: '$38,500',
        year: 2023,
        make: 'Volvo',
        model: 'S60',
        match: '93% match',
        location: null,
        locationIcon: 'route',
        trimLabel: 'Plus · AWD Sedan',
        warrantyBadge: 'Factory warranty active',
        specs: [
          { icon: 'gauge-high', text: '247 hp' },
          { icon: 'snowflake', text: 'AWD' },
          { icon: 'gas-pump', text: '29 mpg' },
        ],
        expert: 'Standout safety scores and a calm, upscale cabin; the mild-hybrid B5 AWD is smooth and quietly quick.',
        ownersRating: '4.8/5',
        ownersText: 'Owners rate comfort and seats highly; infotainment has a slight learning curve.',
        compareMetrics: { price: 38500, mpg: 31, hp: 247, zero: 5.9, miles: 15900, distMin: 45, value: 900 },
        drawer: {
          dealer: 'Volvo Cars South Charlotte',
          distance: '45 min away',
          value: '$900 below market',
          valueClass: 'good',
          intro: "Here's the detail on the <strong>2023 Volvo S60 B5 AWD</strong>. It's the lowest price and most efficient on your shortlist, with the highest owner rating — but it's the farthest drive.",
          specs: [
            ['Engine', '2.0L Turbo + Mild Hybrid'], ['Horsepower', '247 hp'], ['0–60 mph', '5.9 s'],
            ['Drivetrain', 'AWD'], ['Year', '2023'], ['Mileage', '15,900 mi'],
            ['MPG (comb.)', '31'], ['Warranty', 'Factory until 2027 / 50k mi'],
          ],
          fit: 'Meets all four criteria at the lowest price, with the best fuel economy and top safety scores. Trade-off is a 3-hour round trip to see it.',
          watch: 'Least sporty of the three and the longest drive to inspect — factor the distance into your Saturday plan.',
          chips: ['Is the drive worth it?', 'How safe is it?', 'Can a closer dealer get one?'],
        },
      },
    ],
  },
};

// Qualitative need -> concrete filter presets. Presets only fill gaps;
// anything set explicitly on PARTICIPANT wins.
const NEED_PRESETS = {
  family:    { body: 'SUV' },
  kids:      { body: 'SUV' },
  commuter:  { body: 'Sedan', minMpg: 33 },
  commute:   { body: 'Sedan', minMpg: 33 },
  firstcar:  { maxPrice: 20000, maxMiles: 60000 },
  budget:    { maxPrice: 22000 },
  efficient: { minMpg: 33 },
  fuel:      { minMpg: 33 },
  hauling:   { body: 'Truck' },
  work:      { body: 'Truck' },
  winter:    { drive: 'AWD' },
  snow:      { drive: 'AWD' },
  safe:      {},
  reliable:  {},
  sporty:    {},
};

const APR_BY_TIER = { great: 4.9, good: 6.9, fair: 9.9, poor: 12.9 };

const Profile = {
  data: PARTICIPANT,

  toParams() {
    const P = {};
    (PARTICIPANT.needs || []).forEach(n => {
      const preset = NEED_PRESETS[String(n).toLowerCase().replace(/[^a-z]/g, '')];
      if (preset) for (const k in preset) { if (preset[k] != null && P[k] == null) P[k] = preset[k]; }
    });
    if (PARTICIPANT.maxPrice != null) P.maxPrice = PARTICIPANT.maxPrice;
    if (PARTICIPANT.body) P.body = PARTICIPANT.body;
    if (PARTICIPANT.makes && PARTICIPANT.makes.length) {
      P.make = PARTICIPANT.makes.length === 1 ? PARTICIPANT.makes[0] : PARTICIPANT.makes.slice();
    }
    if (PARTICIPANT.minYear != null) P.minYear = PARTICIPANT.minYear;
    if (PARTICIPANT.maxMiles != null) P.maxMiles = PARTICIPANT.maxMiles;
    if (PARTICIPANT.drivetrain && (!Array.isArray(PARTICIPANT.drivetrain) || PARTICIPANT.drivetrain.length)) {
      P.drive = Array.isArray(PARTICIPANT.drivetrain)
        ? (PARTICIPANT.drivetrain.length === 1 ? PARTICIPANT.drivetrain[0] : PARTICIPANT.drivetrain.slice())
        : PARTICIPANT.drivetrain;
    }
    if (PARTICIPANT.minMpg != null) P.minMpg = PARTICIPANT.minMpg;
    if (PARTICIPANT.maxDist != null) P.maxDist = PARTICIPANT.maxDist;
    return P;
  },

  hasData() {
    return Object.keys(this.toParams()).length > 0 ||
      (PARTICIPANT.needs || []).length > 0 || !!PARTICIPANT.creditTier;
  },

  apr() {
    return APR_BY_TIER[PARTICIPANT.creditTier] || 6.9;
  },

  priorities() {
    const out = [];
    const add = m => { if (!out.includes(m)) out.push(m); };
    const needs = (PARTICIPANT.needs || []).map(n => String(n).toLowerCase());
    if (PARTICIPANT.maxPrice != null || needs.some(n => /budget|cheap|afford|first/.test(n))) add('price');
    if (PARTICIPANT.maxDist != null || needs.some(n => /near|close|local|distance/.test(n))) add('dist');
    if (PARTICIPANT.minMpg != null || needs.some(n => /mpg|fuel|efficien|eco|commut/.test(n))) add('mpg');
    if (PARTICIPANT.maxMiles != null || needs.some(n => /mileage|newer|low mile/.test(n))) add('miles');
    if (needs.some(n => /sporty|fun|fast|performance|power/.test(n))) { add('hp'); add('zero'); }
    if (needs.some(n => /value|deal|worth/.test(n))) add('value');
    return out;
  },

  summary() {
    const P = this.toParams();
    const parts = [];
    if (P.drive) parts.push(Array.isArray(P.drive) ? P.drive.join('/') : P.drive);
    if (P.minYear) parts.push(P.minYear + '+');
    if (Array.isArray(P.make)) parts.push(P.make.join('/'));
    else if (P.make) parts.push(P.make);
    if (P.body === 'SUV') parts.push('SUVs');
    else if (P.body === 'Truck') parts.push('trucks');
    else if (P.body === 'Sedan') parts.push('sedans');
    else if (P.body === 'Coupe') parts.push('coupes');
    else if (P.body === 'Hatchback') parts.push('hatchbacks');
    else if (P.body === 'Minivan') parts.push('minivans');
    else parts.push('vehicles');
    let s = parts.join(' ');
    const extra = [];
    if (P.maxPrice) extra.push('under $' + P.maxPrice.toLocaleString());
    if (P.maxMiles) extra.push('under ' + (P.maxMiles / 1000) + 'k mi');
    if (P.maxDist) extra.push('within ' + P.maxDist + ' mi');
    if (P.minMpg) extra.push(P.minMpg + '+ mpg');
    if (extra.length) s += ' ' + extra.join(', ');
    return s;
  },

  homepageSubtitle() {
    const hp = PARTICIPANT.homepage;
    if (!hp) return '';
    if (hp.subtitle) return hp.subtitle;
    const criteria = hp.criteriaText || this.summary();
    const appt = hp.appointment
      ? `Based on your appointment <strong>${hp.appointment}</strong> and what you told me`
      : 'Based on what you told me';
    const tier = PARTICIPANT.creditTier
      ? `, ${PARTICIPANT.creditTier} credit (est. ${this.apr()}% APR)`
      : '';
    return `${appt} — <strong>${criteria}${tier}</strong> — here's what's in stock at your dealer (plus a few within a short drive). I've folded in expert reviews and verified owner sentiment.`;
  },

  visitWhen() {
    const hp = PARTICIPANT.homepage;
    return (hp && hp.appointment) || 'your scheduled time';
  },

  visitWhere() {
    const hp = PARTICIPANT.homepage;
    if (!hp) return 'your DriveClear dealer';
    const dealer = hp.titleAccent || 'your DriveClear dealer';
    return hp.dealerAddress ? `${dealer} · ${hp.dealerAddress}` : dealer;
  },

  visitPlaceShort() {
    if (PARTICIPANT.market && PARTICIPANT.market.label) {
      return PARTICIPANT.market.label.split(',')[0].trim();
    }
    const hp = PARTICIPANT.homepage;
    if (!hp || !hp.titleAccent) return 'your dealer';
    return hp.titleAccent.replace(/^DriveClear\s+/i, '').trim() || hp.titleAccent;
  },

  lotLocations() {
    const m = PARTICIPANT.market;
    if (m && m.lotCities && m.lotCities.length) return m.lotCities.slice();
    const hp = PARTICIPANT.homepage;
    if (hp && hp.dealerAddress) {
      const match = String(hp.dealerAddress).match(/,\s*([^,]+,\s*[A-Z]{2})\s*$/);
      if (match) return [match[1]];
    }
    if (m && m.label) return [m.label];
    return null;
  },

  primaryLotCity() {
    const cities = this.lotLocations();
    return cities && cities.length ? cities[0] : null;
  },

  applyToInventory() {
    const cities = this.lotLocations();
    if (!cities || !cities.length || typeof VEHICLES === 'undefined') return;
    VEHICLES.forEach((v, i) => {
      v.location = cities[i % cities.length];
    });
  },

  pickLocation(pick) {
    if (!pick) return 'In stock';
    if (pick.location) return pick.location;
    const d = pick.drawer || {};
    const distMin = pick.compareMetrics && pick.compareMetrics.distMin;
    if (distMin === 0 || /appointment|your dealer|at your/i.test(d.distance || '')) {
      return `At ${this.visitPlaceShort()}`;
    }
    if (d.distance) return d.distance;
    if (distMin != null && distMin > 0) return `${distMin} min away`;
    return 'In stock';
  },

  homepageFootLinkText() {
    const hp = PARTICIPANT.homepage;
    if (hp && hp.footLinkText) return hp.footLinkText;
    const P = this.toParams();
    const parts = [];
    if (Array.isArray(P.make) && P.make.length) parts.push(P.make.join('/'));
    else if (P.make) parts.push(P.make);
    if (P.body === 'SUV') parts.push('SUVs');
    else if (P.body === 'Truck') parts.push('trucks');
    else if (P.body === 'Sedan') parts.push('sedans');
    else if (P.body) parts.push(String(P.body).toLowerCase() + 's');
    else parts.push('matches');
    return `See all ${parts.join(' ')} →`;
  },

  srpHref() {
    const hp = PARTICIPANT.homepage;
    if (hp && hp.footLinkHref) return hp.footLinkHref;
    const P = this.toParams();
    const q = new URLSearchParams();
    if (P.body) q.set('body', P.body);
    if (P.drive) {
      const d = Array.isArray(P.drive) ? P.drive[0] : P.drive;
      if (d) q.set('drive', d);
    }
    if (P.minYear) q.set('minYear', P.minYear);
    if (P.maxPrice) q.set('maxPrice', P.maxPrice);
    if (Array.isArray(P.make) && P.make.length === 1) q.set('make', P.make[0]);
    const qs = q.toString();
    return qs ? `srp.html?${qs}` : 'srp.html';
  },

  compareMeta() {
    const hp = PARTICIPANT.homepage;
    const c = (hp && hp.compare) || {};
    return {
      title: c.title || 'Your shortlist — compared on what matters',
      subtitle: c.subtitle || 'Side-by-side on price, performance, mileage, and value.',
      footDefault: c.footDefault || '',
    };
  },

  compareCars() {
    const hp = PARTICIPANT.homepage;
    if (!hp || !hp.picks || !hp.picks.length) return [];
    return hp.picks.map((pick, i) => {
      const cm = pick.compareMetrics || {};
      const d = pick.drawer || {};
      const specMap = Object.fromEntries((d.specs || []).map(row => [row[0], row[1]]));
      const priceFromLabel = parseInt(String(pick.price || '').replace(/\D/g, ''), 10);
      const shortName = String(pick.name || pick.key).replace(/^\d{4}\s+/, '');
      return {
        key: pick.key,
        col: i + 1,
        name: shortName,
        displayName: pick.name || shortName,
        trimLabel: pick.trimLabel || '',
        dealer: d.dealer || pick.location || '—',
        distance: this.pickLocation(pick),
        price: cm.price != null ? cm.price : (priceFromLabel || 0),
        mpg: cm.mpg != null ? cm.mpg : parseInt(String(specMap['MPG (comb.)'] || '0'), 10),
        hp: cm.hp != null ? cm.hp : parseInt(String(specMap['Horsepower'] || '0'), 10),
        zero: cm.zero != null ? cm.zero : parseFloat(String(specMap['0–60 mph'] || specMap['0-60 mph'] || '0').replace(/[^\d.]/g, '')) || 0,
        miles: cm.miles != null ? cm.miles : parseInt(String(specMap['Mileage'] || '0').replace(/\D/g, ''), 10),
        distMin: cm.distMin != null ? cm.distMin : 0,
        value: cm.value != null ? cm.value : 0,
        year: pick.year || parseInt(String(pick.name).match(/^(\d{4})/)?.[1], 10) || null,
        engine: specMap['Engine'] || '—',
        drivetrain: specMap['Drivetrain'] || '—',
        valueLabel: d.value || 'At market',
        valueClass: d.valueClass || 'at',
        vdpId: pick.vdpId != null ? pick.vdpId : null,
      };
    });
  },

  _subs: [],
  subscribe(fn) { if (typeof fn === 'function') this._subs.push(fn); },
  set(patch) {
    Object.assign(PARTICIPANT, patch || {});
    this._subs.forEach(fn => { try { fn(PARTICIPANT); } catch (e) { /* noop */ } });
  },
};

if (typeof window !== 'undefined') {
  window.Profile = Profile;
  window.PARTICIPANT = PARTICIPANT;
}
