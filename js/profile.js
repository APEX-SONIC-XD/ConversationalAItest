/* ============================================================
   DriveClear — Participant Profile  (live co-creation study)
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for what the participant has told us.
   The facilitator updates PARTICIPANT below (by prompting Cursor);
   the participant sees the result on refresh. No backend, no API
   key, and NO on-screen controls (invisible to the participant).

   PLUG-IN CONTRACT — every AI feature (current or future) should:
     • on init, read one or more of:
         Profile.toParams()    -> intent {body,maxPrice,make,minYear,maxYear,
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
  // ── P1 — NYC + Philadelphia / PA · Jeep Wrangler Unlimited ──
  maxPrice: null,
  maxApproved: null,
  maxMonthly: null,
  body: null,
  makes: ['Jeep'],
  minYear: 2015,
  maxYear: 2022,
  maxMiles: 75000,
  drivetrain: null,
  minMpg: null,
  maxDist: 150,

  features: ['sunroof', 'leather', 'navigation'],

  needs: ['bluetooth', 'reliable', 'value', 'kbb', 'locationprice'],

  tradeIn: null,

  creditTier: null,
  journeyStage: null,

  market: {
    label: 'New York City & Pennsylvania',
    lotCities: [
      'Queens, NY', 'Long Island City, NY', 'Brooklyn, NY', 'Manhattan, NY',
      'Bronx, NY', 'Staten Island, NY', 'Flushing, NY', 'Jamaica, NY',
      'Astoria, NY', 'Yonkers, NY', 'White Plains, NY', 'New Rochelle, NY',
      'Jersey City, NJ', 'Newark, NJ', 'Edison, NJ', 'Stamford, CT',
      'Hicksville, NY', 'Huntington, NY', 'Princeton, NJ', 'Greenwich, CT',
      'Philadelphia, PA', 'King of Prussia, PA', 'Allentown, PA', 'Reading, PA',
      'Harrisburg, PA', 'Lancaster, PA', 'Bethlehem, PA', 'Wilkes-Barre, PA',
      'Scranton, PA', 'Pittsburgh, PA',
    ],
  },

  homepage: {
    titleAccent: 'DriveClear NYC',
    appointment: null,
    dealerAddress: '4520 Northern Blvd, Long Island City, NY 11101',
    criteriaText: null,
    selections: {
      groups: [
        {
          key: 'priority',
          label: 'Rank by',
          default: 'price',
          options: [
            { id: 'price', label: 'Best price', icon: 'tag' },
            { id: 'kbb', label: 'KBB value', icon: 'book' },
            { id: 'near', label: 'Closest', icon: 'location-dot' },
          ],
        },
        {
          key: 'hardTop',
          label: 'Hard top',
          default: 'flexible',
          options: [
            { id: 'flexible', label: 'Flexible', icon: 'wind' },
            { id: 'required', label: 'Required', icon: 'car-side' },
          ],
        },
        {
          key: 'market',
          label: 'Markets',
          default: 'all',
          options: [
            { id: 'all', label: 'All areas', icon: 'globe' },
            { id: 'nyc', label: 'NYC', icon: 'city' },
            { id: 'pa', label: 'Philadelphia & PA', icon: 'map' },
          ],
        },
      ],
    },
    footText: 'Sorted by lowest price and KBB spread first — cheaper markets (Philadelphia & PA) rank ahead of higher-priced NYC lots when the deal is better.',
    footLinkText: 'See cheapest Jeeps by location →',
    footLinkHref: 'srp.html?make=Jeep&minYear=2015&maxYear=2022&maxMiles=75000&maxDist=150&q=wrangler&feat=sunroof&feat=leather&feat=navigation&sort=price-asc',
    compare: {
      title: 'Jeep Wrangler — best price by location',
      subtitle: 'You are shopping across <strong>NYC, Philadelphia, and Pennsylvania</strong> and want to <strong>prioritize locations with better prices</strong> — not just what is closest. Distance matters less than the deal. Each row compares <strong>list price, KBB fair purchase, and market</strong> so you can see where the savings are.',
      footDefault: 'AI pick: <strong>2019 Sport, Astoria ($28,990)</strong> is the lowest ask overall; <strong>2018 Sport, Philadelphia ($31,990)</strong> is the best hard-top price if PA undercuts NYC; <strong>2020 Sport S, Brooklyn ($33,990)</strong> costs more — only pick it if you need a newer year and will not travel for savings.',
    },
    picks: [
      {
        key: 'softtop19',
        name: '2019 Jeep Wrangler Unlimited Sport',
        price: '$28,990',
        year: 2019,
        make: 'Jeep',
        model: 'Wrangler',
        trim: 'Unlimited Sport Soft Top',
        match: '97% match',
        recTags: { hardTop: false, market: 'nyc' },
        location: 'Astoria, NY',
        locationIcon: 'location-dot',
        trimLabel: 'Lowest price · Astoria, NY · Soft Top',
        warrantyBadge: 'Best price in region',
        specs: [
          { icon: 'tag', text: 'Lowest ask: $28,990' },
          { icon: 'map-location-dot', text: 'NYC · $2,100 below KBB' },
          { icon: 'bluetooth-b', text: 'Bluetooth' },
        ],
        expert: 'Lowest-priced Unlimited on your board — Astoria asks $28,990, about $2,100 under KBB. NYC lots run higher on hard-top trims; this soft-top Sport leads on location-adjusted price.',
        ownersRating: '4.3/5',
        ownersText: 'Shoppers comparing NYC vs. PA often start here — lowest sticker in the tri-state search, even if Philadelphia hard-tops come close on KBB spread.',
        compareMetrics: { price: 28990, mpg: 21, hp: 285, zero: 7.1, miles: 43800, distMin: 10, value: 2100 },
        drawer: {
          dealer: 'DriveClear Astoria',
          distance: '10 min · Astoria, NY',
          value: '$2,100 below KBB · lowest list price',
          valueClass: 'great',
          intro: 'Here is the <strong>lowest-priced match</strong> in your search — <strong>2019 Wrangler Unlimited Sport</strong> in <strong>Astoria, NY</strong> at <strong>$28,990</strong>, about <strong>$2,100 under Kelley Blue Book</strong>.',
          specs: [
            ['List price', '$28,990 · lowest in search'], ['KBB fair purchase', '~$31,100'], ['vs. KBB', '$2,100 below'],
            ['Market', 'Astoria, NY'], ['Top', 'Premium soft top'], ['Bluetooth', 'Yes'],
            ['Engine', '3.6L V6'], ['Year', '2019'], ['Mileage', '43,800 mi'],
          ],
          fit: '#1 on price by location — if the deal matters most, this is the floor before you trade features or drive to PA.',
          watch: 'Soft top, not removable hard top — Philadelphia hard-tops start ~$3k higher but include bolt-off hardware.',
          chips: ['Cheapest market overall?', 'NYC vs Philly on price?', 'Soft top vs hard top cost?'],
        },
      },
      {
        key: 'sport18',
        name: '2018 Jeep Wrangler Unlimited Sport',
        price: '$31,990',
        year: 2018,
        make: 'Jeep',
        model: 'Wrangler',
        trim: 'Unlimited Sport',
        match: '95% match',
        recTags: { hardTop: true, market: 'pa' },
        location: 'Philadelphia, PA',
        locationIcon: 'location-dot',
        trimLabel: 'Best hard-top price · Philadelphia, PA',
        warrantyBadge: 'PA market · below KBB',
        specs: [
          { icon: 'tag', text: 'Hard top · $31,990' },
          { icon: 'map-location-dot', text: 'Philadelphia · $1,200 below KBB' },
          { icon: 'car-side', text: 'Removable hard top' },
        ],
        expert: 'Philadelphia often undercuts NYC on the same hard-top Sport trim — this one lists at $31,990, about $2k less than comparable Brooklyn Sport S inventory and $1,200 under KBB fair purchase for the Philly market.',
        ownersRating: '4.2/5',
        ownersText: 'Buyers prioritizing price over proximity say PA is worth the drive when hard-top Unlimiteds run $1,500–$2,500 cheaper than NYC lots.',
        compareMetrics: { price: 31990, mpg: 21, hp: 285, zero: 7.2, miles: 47200, distMin: 95, value: 1200 },
        drawer: {
          dealer: 'DriveClear Philadelphia',
          distance: '95 mi · Philadelphia, PA',
          value: '$1,200 below KBB · best hard-top price',
          valueClass: 'great',
          intro: 'Here is the <strong>best-priced hard-top Unlimited</strong> in your search — <strong>2018 Sport</strong> in <strong>Philadelphia, PA</strong> at <strong>$31,990</strong>, where PA listings undercut NYC on the same equipment.',
          specs: [
            ['List price', '$31,990 · best hard-top ask'], ['KBB fair purchase', '~$33,200'], ['vs. KBB', '$1,200 below'],
            ['Market', 'Philadelphia, PA'], ['Top', 'Removable hard top'], ['Bluetooth', 'Yes'],
            ['Engine', '3.6L V6'], ['Year', '2018'], ['Mileage', '47,200 mi'],
          ],
          fit: 'Lead pick if you need a hard top and want the cheapest market — PA beats NYC on this trim by about $2k vs. the Brooklyn Sport S.',
          watch: '~95 miles from NYC — only skip it if local convenience outweighs $2k+ in savings.',
          chips: ['Is Philly worth the drive?', 'PA vs NYC price gap?', '2018 vs 2020 for savings?'],
        },
      },
      {
        key: 'sports20',
        name: '2020 Jeep Wrangler Unlimited Sport S',
        price: '$33,990',
        year: 2020,
        make: 'Jeep',
        model: 'Wrangler',
        trim: 'Unlimited Sport S',
        match: '91% match',
        recTags: { hardTop: true, market: 'nyc' },
        location: 'Brooklyn, NY',
        locationIcon: 'location-dot',
        trimLabel: 'Higher NYC price · Brooklyn · Hard Top',
        warrantyBadge: '$1,400 below KBB',
        specs: [
          { icon: 'tag', text: 'NYC ask: $33,990' },
          { icon: 'map-location-dot', text: 'Brooklyn · +$2k vs Philly' },
          { icon: 'car-side', text: 'Removable hard top' },
        ],
        expert: 'Brooklyn lists this Sport S at $33,990 — still $1,400 under KBB, but roughly $2k more than the Philadelphia hard-top Sport for a newer year. NYC convenience premium shows up here.',
        ownersRating: '4.3/5',
        ownersText: 'Local buyers pay up for newer years in NYC; cross-market shoppers often skip Brooklyn listings when Philadelphia has the same hardware for less.',
        compareMetrics: { price: 33990, mpg: 22, hp: 285, zero: 7.0, miles: 35200, distMin: 12, value: 1400 },
        drawer: {
          dealer: 'DriveClear Brooklyn',
          distance: '12 min · Brooklyn, NY',
          value: '$1,400 below KBB · higher NYC price',
          valueClass: 'good',
          intro: 'Here is the <strong>2020 Sport S in Brooklyn</strong> — convenient and under KBB, but <strong>$2k more</strong> than the Philadelphia hard-top option because NYC lots price newer years higher.',
          specs: [
            ['List price', '$33,990 · NYC premium'], ['KBB fair purchase', '~$35,400'], ['vs. KBB', '$1,400 below'],
            ['Market', 'Brooklyn, NY'], ['Top', 'Removable hard top'], ['Bluetooth', 'Yes'],
            ['Engine', '3.6L V6'], ['Year', '2020'], ['Mileage', '35,200 mi'],
          ],
          fit: 'Pick this only if you need a 2020 close to home and will not travel to PA for a better location price.',
          watch: 'Highest price on the board — location-based shopping favors Philadelphia or the Astoria soft-top first.',
          chips: ['Why is Brooklyn $2k more?', 'Worth staying local?', 'Compare to Philly hard top'],
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
    if (PARTICIPANT.maxYear != null) P.maxYear = PARTICIPANT.maxYear;
    if (PARTICIPANT.maxMiles != null) P.maxMiles = PARTICIPANT.maxMiles;
    if (PARTICIPANT.drivetrain && (!Array.isArray(PARTICIPANT.drivetrain) || PARTICIPANT.drivetrain.length)) {
      P.drive = Array.isArray(PARTICIPANT.drivetrain)
        ? (PARTICIPANT.drivetrain.length === 1 ? PARTICIPANT.drivetrain[0] : PARTICIPANT.drivetrain.slice())
        : PARTICIPANT.drivetrain;
    }
    if (PARTICIPANT.minMpg != null) P.minMpg = PARTICIPANT.minMpg;
    if (PARTICIPANT.maxDist != null) P.maxDist = PARTICIPANT.maxDist;
    if (PARTICIPANT.features && PARTICIPANT.features.length) P.features = PARTICIPANT.features.slice();
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
    const priceByLocation = needs.some(n => /locationprice|marketprice|cheapermarket/.test(n));
    if (PARTICIPANT.maxPrice != null || needs.some(n => /budget|cheap|afford|first|value|kbb|blue book/.test(n)) || priceByLocation) {
      add('price');
    }
    if (needs.some(n => /value|deal|worth|kbb|blue book/.test(n))) add('value');
    if (!priceByLocation && (PARTICIPANT.maxDist != null || needs.some(n => /near|close|local|distance/.test(n)))) add('dist');
    if (PARTICIPANT.minMpg != null || needs.some(n => /mpg|fuel|efficien|eco|commut/.test(n))) add('mpg');
    if (PARTICIPANT.maxMiles != null || needs.some(n => /mileage|newer|low mile/.test(n))) add('miles');
    if (needs.some(n => /sporty|fun|fast|performance|power/.test(n))) { add('hp'); add('zero'); }
    return out;
  },

  summary() {
    const P = this.toParams();
    const parts = [];
    if (P.drive) parts.push(Array.isArray(P.drive) ? P.drive.join('/') : P.drive);
    if (P.minYear && PARTICIPANT.maxYear) parts.push(P.minYear + '–' + PARTICIPANT.maxYear);
    else if (P.minYear) parts.push(P.minYear + '+');
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
    if (hp.selections && hp.selections.groups && hp.selections.groups.length) {
      return 'Adjust what matters below — your matches re-rank instantly.';
    }
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
    if (P.maxYear) q.set('maxYear', P.maxYear);
    if (P.maxMiles) q.set('maxMiles', P.maxMiles);
    if (P.maxDist) q.set('maxDist', P.maxDist);
    if (P.features && P.features.length) P.features.forEach(f => q.append('feat', f));
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
