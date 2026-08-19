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
  maxPrice: 26000,
  maxApproved: null,
  maxMonthly: null,
  body: 'SUV',
  makes: [],
  preferredMakes: ['Honda', 'Mazda'],
  minYear: 2020,
  maxMiles: 20000,
  drivetrain: null,
  minMpg: null,
  maxDist: null,

  needs: ['firstcar', 'safe', 'reliable', 'cleanhistory', 'blindspot'],

  // Safety features the participant wants called out
  safetyMustHave: ['blindSpotMonitoring'],

  // Vehicle history requirements
  history: {
    cleanTitle: true,
    accidentFree: true,
  },

  // Other kid in the household — used for sibling-aware rec copy
  siblingCars: ['Honda HR-V', 'Mazda CX-5', 'Toyota Corolla Cross'],

  tradeIn: null,

  creditTier: null,
  journeyStage: 'Prepared',

  // ── Payment method (VDP, Fast Track, test drive prep, cards) ──
  payment: {
    method: 'cash', // 'cash' | 'finance'
  },

  // ── Insurance context (teen / first-car estimates site-wide) ──
  insurance: {
    driverAge: 16,
    state: 'GA',
    onParentPolicy: true,
  },

  // ── Market / region (inventory lot cities, distance context) ──
  // Facilitator: set label + lotCities when participant is shopping in a new area.
  market: {
    label: 'Atlanta, GA',
    zip: '30324',
    stores: [
      { name: 'DriveClear Atlanta', city: 'Atlanta, GA', address: '1600 Piedmont Ave NE', miles: 3 },
      { name: 'DriveClear · Decatur', city: 'Decatur, GA', address: '250 E Ponce de Leon Ave', miles: 6 },
      { name: 'DriveClear · Sandy Springs', city: 'Sandy Springs, GA', address: '6400 Roswell Rd', miles: 8 },
      { name: 'DriveClear · Smyrna', city: 'Smyrna, GA', address: '2551 Cumberland Pkwy SE', miles: 10 },
      { name: 'DriveClear · Marietta', city: 'Marietta, GA', address: '1140 Roswell St', miles: 14 },
      { name: 'DriveClear · Roswell', city: 'Roswell, GA', address: '8911 Watts Rd', miles: 16 },
      { name: 'DriveClear · Alpharetta', city: 'Alpharetta, GA', address: '5456 Atlanta Hwy', miles: 22 },
      { name: 'DriveClear · Duluth', city: 'Duluth, GA', address: '3280 Peachtree Industrial Blvd', miles: 24 },
    ],
    lotCities: [
      'Atlanta, GA',
      'Marietta, GA',
      'Decatur, GA',
      'Sandy Springs, GA',
      'Alpharetta, GA',
      'Roswell, GA',
      'Duluth, GA',
      'Smyrna, GA',
    ],
  },

  // ── Favorites page (favorites.html) ──
  favorites: {
    title: 'My Favorites',
    subtitle: null,
  },

  // ── Fast Track Purchase (vdp.html → fast-track-confirmation.html) ──
  fastTrack: {
    etaMinutes: 45,
    appointment: 'Saturday at 11am',
    subtitle: 'We pre-filled your profile so you can pay cash and drive home in about 45 minutes — no finance desk, no loan paperwork.',
    preFilled: [
      'Cash payment method confirmed',
      'Insurance verified on parent policy',
      'Out-the-door price locked',
      'Title & registration docs ready',
    ],
    vehicles: [
      {
        vdpId: 391,
        year: 2022,
        make: 'Honda',
        model: 'HR-V',
        storeLine: 'DriveClear Atlanta',
      },
      {
        vdpId: 411,
        year: 2022,
        make: 'Mazda',
        model: 'CX-30',
        storeLine: 'DriveClear · Roswell',
      },
    ],
  },

  // ── Test drive prep chat (test-drive-confirmation.html → Ask before you go) ──
  testDrive: {
    askIntro: 'You\'re putting a new driver on the road — I\'ll help you ask the questions that get straight answers, so you can tell when a dealership is being transparent.',
    askPlaceholder: 'Ask what builds trust at the dealership…',
    askChips: [
      { label: 'Full price upfront?', q: 'What should I ask so I know the full price upfront with no hidden fees?' },
      { label: 'Prove clean history?', q: 'How do I ask the dealer to prove clean title and no accidents?' },
      { label: 'Explain blind spot safety?', q: 'What should I ask so the dealer explains blind spot monitoring clearly for my teen?' },
      { label: 'What extras are optional?', q: 'How do I ask which add-ons are truly optional without hurting the deal?' },
      { label: 'What\'s in the total?', q: 'What should I ask so the out-the-door cash total includes everything with no surprises?' },
      { label: 'Can we decide later?', q: 'How do I know the dealer will respect our time and not pressure us to buy today?' },
    ],
  },

  // ── Homepage AI recommendations (index.html) ──
  // Facilitator: edit display copy here — name, price, expert blurbs, drawer text.
  // VDP link (optional): set year + make + model, or vdpId as fallback.
  homepage: {
    titleAccent: 'DriveClear Atlanta',
    appointment: null,
    dealerAddress: null,
    criteriaText: 'a safe compact SUV for a new 16-year-old — blind spot monitoring, clean title, no accidents, IIHS Top Safety Pick picks, GM Teen Driver options, and sizes like your other kid\'s HR-V, Mazda CX, and Corolla Cross',
    footText: 'Ranked for blind spot monitoring, clean title and no accidents, IIHS Top Safety Pick ratings, GM Teen Driver where available, and sibling-comparable compact SUVs — all under 20k miles and $26k.',
    footLinkText: 'See all blind-spot-equipped matches under $26k →',
    footLinkHref: null,
    compare: {
      title: 'Compact SUV shortlist — blind spot monitoring + IIHS safety',
      subtitle: 'Side-by-side on blind spot monitoring, clean title history, IIHS crash-test ratings, GM Teen Driver tech, mileage, and insurance.',
      footDefault: 'All three include blind spot monitoring — clean title, no accidents, IIHS Top Safety Pick rated, under 20k miles, under $26k, and one-owner. The GMC includes GM\'s Teen Driver mode.',
    },
    picks: [
      {
        key: 'hrv-22-ex',
        name: '2022 Honda HR-V EX',
        price: '$24,488',
        year: 2022,
        make: 'Honda',
        model: 'HR-V',
        trim: 'EX',
        vdpId: 391,
        lotCity: 'Atlanta, GA',
        match: '98% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Compact SUV · blind spot · like sibling HR-V',
        warrantyBadge: 'Blind spot monitoring',
        specs: [
          { icon: 'road', text: '17,050 mi' },
          { icon: 'eye', text: 'Blind spot monitoring' },
          { icon: 'shield-halved', text: 'IIHS Top Safety Pick' },
        ],
        expert: 'Blind spot monitoring with Honda Sensing — same HR-V family your other kid drives, with IIHS Top Safety Pick proof and clean title history.',
        ownersRating: '4.7/5',
        ownersText: 'Owners love blind spot alerts for Atlanta highway driving; families with multiple Honda SUVs appreciate the familiar controls.',
        compareMetrics: { price: 24488, mpg: 29, hp: 141, zero: 9.0, miles: 17050, distMin: 10, distMiles: 3, value: 1200 },
        drawer: {
          dealer: 'DriveClear Atlanta',
          value: '$1,200 below market',
          valueClass: 'great',
          intro: 'Sibling-comparable <strong>2022 Honda HR-V EX AWD</strong> — blind spot monitoring, 17,050 miles, Honda Sensing, and <strong>IIHS Top Safety Pick</strong>.',
          specs: [
            ['Safety', 'Blind spot monitoring · Honda Sensing · rear cross-traffic'],
            ['Crash tests', 'IIHS Top Safety Pick · NHTSA 5-star overall'],
            ['Mileage', '17,050 mi'],
            ['Drivetrain', 'AWD'],
            ['MPG (comb.)', '29 MPG'],
            ['History', 'Clean title · no accidents'],
          ],
          fit: 'Blind spot monitoring in the same Honda size class your household already trusts — top crash-test scores included.',
          watch: 'No GM Teen Driver here — blind spot monitoring and Honda Sensing cover the lane-change alerts instead.',
          chips: ['How does blind spot monitoring work?', 'HR-V vs sibling\'s trim?', 'Compare all three'],
        },
      },
      {
        key: 'terrain-21-slt',
        name: '2021 GMC Terrain SLT',
        price: '$25,488',
        year: 2021,
        make: 'GMC',
        model: 'Terrain',
        trim: 'SLT',
        vdpId: 201,
        lotCity: 'Sandy Springs, GA',
        match: '97% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Compact SUV · blind spot · GM Teen Driver',
        warrantyBadge: 'Blind spot monitoring',
        specs: [
          { icon: 'road', text: '17,500 mi' },
          { icon: 'eye', text: 'Blind spot monitoring' },
          { icon: 'child', text: "GM's Teen Driver mode" },
        ],
        expert: 'Blind spot monitoring standard — paired with GM Teen Driver and IIHS Top Safety Pick in a slightly more upscale GM compact SUV.',
        ownersRating: '4.5/5',
        ownersText: 'Parents highlight blind spot alerts for highway merges; families also value Teen Driver alongside the IIHS safety badge.',
        compareMetrics: { price: 25488, mpg: 27, hp: 170, zero: 8.3, miles: 17500, distMin: 18, distMiles: 8, value: 900 },
        drawer: {
          dealer: 'DriveClear · Sandy Springs',
          value: '$900 below market',
          valueClass: 'great',
          intro: 'Upscale look at a <strong>2021 GMC Terrain SLT AWD</strong> — blind spot monitoring, 17,500 miles, <strong>IIHS Top Safety Pick</strong>, and <strong>GM\'s Teen Driver</strong>.',
          specs: [
            ['Safety', 'Blind spot monitoring · GM Teen Driver · Lane Keep Assist'],
            ['Crash tests', 'IIHS Top Safety Pick · NHTSA 5-star overall'],
            ['Mileage', '17,500 mi'],
            ['Drivetrain', 'AWD'],
            ['MPG (comb.)', '27 MPG'],
            ['History', 'Clean title · no accidents'],
          ],
          fit: 'Blind spot monitoring plus GM Teen Driver — the only pick here with parental driving reports built in.',
          watch: 'GM Teen Driver is software, not a crash-test rating — pair it with blind spot alerts and IIHS scores.',
          chips: ['Blind spot vs lane assist?', "How does GM's Teen Driver work?", 'Compare all three'],
        },
      },
      {
        key: 'cx30-22-preferred',
        name: '2022 Mazda CX-30 Preferred',
        price: '$24,888',
        year: 2022,
        make: 'Mazda',
        model: 'CX-30',
        trim: 'Preferred',
        vdpId: 411,
        lotCity: 'Roswell, GA',
        match: '96% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Compact SUV · blind spot · Mazda CX family',
        warrantyBadge: 'Blind spot monitoring',
        specs: [
          { icon: 'road', text: '16,050 mi' },
          { icon: 'eye', text: 'Blind spot monitoring' },
          { icon: 'shield-halved', text: 'IIHS Top Safety Pick' },
        ],
        expert: 'Blind spot monitoring with i-ACTIVSENSE — same Mazda CX family your other kid drives, with IIHS Top Safety Pick scores in an easy-to-park package.',
        ownersRating: '4.6/5',
        ownersText: 'Owners praise blind spot alerts on highway merges; families with a Mazda CX already know the i-ACTIVSENSE controls.',
        compareMetrics: { price: 24888, mpg: 27, hp: 186, zero: 7.8, miles: 16050, distMin: 16, distMiles: 16, value: 1300 },
        drawer: {
          dealer: 'DriveClear · Roswell',
          value: '$1,300 below market',
          valueClass: 'great',
          intro: 'Mazda CX sibling-match <strong>2022 CX-30 Preferred AWD</strong> — blind spot monitoring, 16,050 miles, i-ACTIVSENSE, and <strong>IIHS Top Safety Pick</strong>.',
          specs: [
            ['Safety', 'Blind spot monitoring · i-ACTIVSENSE · smart brake support'],
            ['Crash tests', 'IIHS Top Safety Pick · NHTSA 5-star overall'],
            ['Mileage', '16,050 mi'],
            ['Drivetrain', 'AWD'],
            ['MPG (comb.)', '27 MPG'],
            ['History', 'Clean title · no accidents'],
          ],
          fit: 'Blind spot monitoring plus i-ACTIVSENSE in the Mazda CX feel your household already likes — strong IIHS scores with a nicer cabin.',
          watch: 'CX-30 is smaller than a CX-5 — confirm blind spot alerts feel right on a test drive before deciding.',
          chips: ['How does blind spot monitoring work?', 'CX-30 vs sibling\'s Mazda CX?', 'Compare all three'],
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
  cleanhistory: { accidentFree: true, cleanTitle: true },
  cleantitle:   { cleanTitle: true, accidentFree: true },
  blindspot:    { blindSpot: true },
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
    const hist = PARTICIPANT.history;
    if (hist) {
      if (hist.accidentFree != null) P.accidentFree = hist.accidentFree;
      if (hist.cleanTitle != null) P.cleanTitle = hist.cleanTitle;
    }
    if ((PARTICIPANT.safetyMustHave || []).includes('blindSpotMonitoring')) P.blindSpot = true;
    return P;
  },

  /** Default SRP filter state derived from participant intent. */
  srpFilters() {
    const P = this.toParams();
    return {
      make: [].concat(P.make || []),
      body: P.body ? [P.body] : [],
      drive: P.drive ? (Array.isArray(P.drive) ? P.drive : [P.drive]) : [],
      minPrice: 0,
      maxPrice: P.maxPrice != null ? P.maxPrice : 50000,
      maxMiles: P.maxMiles != null ? P.maxMiles : 100000,
      minYear: P.minYear != null ? P.minYear : 2010,
      maxYear: P.maxYear != null ? P.maxYear : 2024,
      minMpg: P.minMpg || 0,
      maxDist: P.maxDist || 0,
      accidentFree: P.accidentFree === true,
      cleanTitle: P.cleanTitle === true,
      blindSpot: P.blindSpot === true,
      query: '',
    };
  },

  preferredMakes() {
    if (PARTICIPANT.preferredMakes && PARTICIPANT.preferredMakes.length) {
      return PARTICIPANT.preferredMakes.slice();
    }
    if (PARTICIPANT.makes && PARTICIPANT.makes.length) {
      return PARTICIPANT.makes.slice();
    }
    return [];
  },

  hasData() {
    return Object.keys(this.toParams()).length > 0 ||
      (PARTICIPANT.needs || []).length > 0 || !!PARTICIPANT.creditTier ||
      this.isPayingCash();
  },

  apr() {
    if (this.isPayingCash()) return null;
    return APR_BY_TIER[PARTICIPANT.creditTier] || 6.9;
  },

  paymentMethod() {
    return (PARTICIPANT.payment && PARTICIPANT.payment.method) || 'finance';
  },

  isPayingCash() {
    return this.paymentMethod() === 'cash';
  },

  estimateOutTheDoor(price) {
    const vehicle = price || PARTICIPANT.maxPrice || 25000;
    const tax = Math.round(vehicle * 0.07);
    const titleReg = 425;
    return {
      vehicle,
      tax,
      titleReg,
      fees: 0,
      total: vehicle + tax + titleReg,
    };
  },

  insuranceEstimate(v) {
    const ins = PARTICIPANT.insurance;
    if (!ins || ins.driverAge == null) return null;
    const price = typeof v === 'number' ? v : (v?.price ?? PARTICIPANT.maxPrice ?? 25000);
    const body = (v && v.body) || PARTICIPANT.body || 'Sedan';
    let monthly = 138;
    const age = ins.driverAge;
    if (age <= 17) monthly += 42;
    else if (age <= 21) monthly += 24;
    else if (age <= 25) monthly += 10;
    if (body === 'SUV') monthly += 16;
    else if (body === 'Truck') monthly += 26;
    else if (body === 'Coupe') monthly += 12;
    if (price >= 26000) monthly += 7;
    else if (price <= 22000) monthly -= 8;
    if (ins.onParentPolicy !== false) monthly -= 14;
    if (PARTICIPANT.market && PARTICIPANT.market.zip) monthly += 5;
    monthly = Math.max(115, Math.round(monthly / 5) * 5);
    const low = Math.round((monthly * 0.9) / 5) * 5;
    const high = Math.round((monthly * 1.1) / 5) * 5;
    const zip = PARTICIPANT.market && PARTICIPANT.market.zip;
    return {
      monthly,
      low,
      high,
      range: `$${low}–$${high}/mo`,
      note: age <= 17
        ? `${age}-yr-old on parent policy · ${ins.state || 'GA'}${zip ? ' · ' + zip : ''}`
        : `est. · ${ins.state || 'GA'}`,
    };
  },

  insuranceLabel(v) {
    const est = this.insuranceEstimate(v);
    return est ? est.range : null;
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
    if (needs.some(n => /blindspot|blind.?spot/.test(n)) || (PARTICIPANT.safetyMustHave || []).includes('blindSpotMonitoring')) add('safety');
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
    if (PARTICIPANT.history?.cleanTitle && PARTICIPANT.history?.accidentFree) {
      extra.push('clean title, no accidents');
    }
    if (extra.length) s += ' ' + extra.join(', ');
    return s;
  },

  favoritesSubtitle() {
    const fav = PARTICIPANT.favorites;
    if (fav && fav.subtitle) return fav.subtitle;
    return null;
  },

  favoritesTitle() {
    const fav = PARTICIPANT.favorites;
    return (fav && fav.title) || 'My Favorites';
  },

  homepageSubtitle() {
    const hp = PARTICIPANT.homepage;
    if (!hp) return '';
    if (hp.subtitle) return hp.subtitle;
    const criteria = hp.criteriaText || this.summary();
    const appt = hp.appointment
      ? `Based on your appointment <strong>${hp.appointment}</strong> and what you told me`
      : 'Based on what you told me';
    const tier = PARTICIPANT.creditTier && !this.isPayingCash()
      ? `, ${PARTICIPANT.creditTier} credit (est. ${this.apr()}% APR)`
      : this.isPayingCash()
        ? ', paying cash'
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

  zipCode() {
    return PARTICIPANT.market && PARTICIPANT.market.zip ? String(PARTICIPANT.market.zip) : null;
  },

  storesNearZip() {
    const stores = PARTICIPANT.market && PARTICIPANT.market.stores;
    if (!stores || !stores.length) return [];
    return stores.slice().sort((a, b) => a.miles - b.miles);
  },

  storeForCity(city) {
    if (!city) return null;
    const stores = PARTICIPANT.market && PARTICIPANT.market.stores;
    if (!stores) return null;
    return stores.find(s => s.city === city) || null;
  },

  milesFromZip(city) {
    const store = this.storeForCity(city);
    return store ? store.miles : null;
  },

  locationLabel(city) {
    if (!city) return 'In stock';
    const zip = this.zipCode();
    const miles = this.milesFromZip(city);
    if (zip && miles != null) return `${miles} mi from ${zip}`;
    return city;
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
    if (pick.lotCity && typeof this.locationLabel === 'function') {
      return this.locationLabel(pick.lotCity);
    }
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
    const f = this.srpFilters();
    const q = new URLSearchParams();
    f.make.forEach(m => q.append('make', m));
    if (f.body.length) q.set('body', f.body[0]);
    f.drive.forEach(d => q.set('drive', d));
    if (f.minYear > 2010) q.set('minYear', f.minYear);
    if (f.maxPrice < 50000) q.set('maxPrice', f.maxPrice);
    if (f.maxMiles < 100000) q.set('maxMiles', f.maxMiles);
    if (f.accidentFree) q.set('accidentFree', '1');
    if (f.cleanTitle) q.set('cleanTitle', '1');
    if (f.blindSpot) q.set('blindSpot', '1');
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

  fastTrackConfig() {
    return PARTICIPANT.fastTrack || null;
  },

  fastTrackVehicleEntry(v) {
    const ft = this.fastTrackConfig();
    if (!ft || !v) return null;
    const list = ft.vehicles || [];
    if (list.length) {
      for (const entry of list) {
        if (entry.vdpId != null && v.id === entry.vdpId) return Object.assign({}, ft, entry);
        if (entry.make && !entry.model && v.make === entry.make) return Object.assign({}, ft, entry);
        if (entry.year && entry.make && entry.model
          && v.year === entry.year && v.make === entry.make && v.model === entry.model) {
          return Object.assign({}, ft, entry);
        }
      }
      return null;
    }
    if (ft.vdpId != null && v.id === ft.vdpId) return ft;
    if (ft.year && ft.make && ft.model
      && v.year === ft.year && v.make === ft.make && v.model === ft.model) return ft;
    return null;
  },

  fastTrackForVehicle(v) {
    return this.fastTrackVehicleEntry(v);
  },

  fastTrackDefaultId() {
    const ft = this.fastTrackConfig();
    if (!ft) return null;
    if (ft.vehicles && ft.vehicles.length && ft.vehicles[0].vdpId != null) return ft.vehicles[0].vdpId;
    if (ft.vdpId != null) return ft.vdpId;
    return null;
  },

  fastTrackMeta(v) {
    const ft = this.fastTrackConfig() || {};
    const entry = v ? this.fastTrackVehicleEntry(v) : null;
    const merged = entry || ft;
    return {
      title: merged.title || ft.title || 'Fast Track Purchase — walk in ready',
      subtitle: merged.subtitle || ft.subtitle || 'We pre-filled your profile so you can finish in store in about 45 minutes.',
      etaMinutes: merged.etaMinutes || ft.etaMinutes || 45,
      appointment: merged.appointment || ft.appointment || this.visitWhen(),
      storeLine: merged.storeLine || ft.storeLine || this.visitWhere(),
      preFilled: merged.preFilled || ft.preFilled || [],
    };
  },

  testDriveAskChips() {
    const td = PARTICIPANT.testDrive;
    return (td && td.askChips && td.askChips.length) ? td.askChips : [];
  },

  testDriveAskIntro() {
    const td = PARTICIPANT.testDrive;
    return (td && td.askIntro)
      || 'You\'re putting a new driver on the road — I\'ll help you ask the questions that get straight answers, so you can tell when a dealership is being transparent.';
  },

  testDriveAskPlaceholder() {
    const td = PARTICIPANT.testDrive;
    return (td && td.askPlaceholder) || 'Ask what builds trust at the dealership…';
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
        insuranceMonthly: (() => {
          if (typeof findVehicleForPick !== 'function' || !Profile.insuranceEstimate) return null;
          const v = pick.vdpId != null && typeof getVehicleById === 'function'
            ? getVehicleById(pick.vdpId)
            : findVehicleForPick(pick);
          const est = v ? Profile.insuranceEstimate(v) : Profile.insuranceEstimate(cm.price || priceFromLabel);
          return est ? est.monthly : null;
        })(),
        insuranceRange: (() => {
          if (typeof findVehicleForPick !== 'function' || !Profile.insuranceEstimate) return null;
          const v = pick.vdpId != null && typeof getVehicleById === 'function'
            ? getVehicleById(pick.vdpId)
            : findVehicleForPick(pick);
          const est = v ? Profile.insuranceEstimate(v) : Profile.insuranceEstimate(cm.price || priceFromLabel);
          return est ? est.range : null;
        })(),
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
