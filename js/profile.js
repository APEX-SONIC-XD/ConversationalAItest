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

// CX-5 trim copy — used on compare page and VDPs (must be above PARTICIPANT).
const TRIM_DESCRIPTIONS = {
  'Grand Touring': 'Turbocharged trim with leather (heated/ventilated), power sunroof, Bose audio, and head-up display. 256 hp — the sportier pick when you want leather + sunroof plus premium tech.',
  '2.5 S Premium Plus': 'Value trim with leather, heated seats, and power sunroof on the 187 hp engine. Hits your must-haves at the lowest price — no turbo, runs on regular fuel.',
  'Premium Plus': 'Value trim with leather, heated seats, and power sunroof on the 187 hp engine. Hits your must-haves at the lowest price — no turbo, runs on regular fuel.',
  'Turbo Signature': 'Top-tier turbo with Nappa leather, ventilated seats, adaptive headlights, and power sunroof. Steps above Grand Touring with softer leather and extra luxury details.',
  '2.5 S Carbon Edition': 'Sport-styled trim with black accents, leather, and power sunroof. Same 187 hp as Premium Plus with a more aggressive look — leather + sunroof without turbo pricing.',
  'Carbon Edition': 'Sport-styled trim with black accents, leather, and power sunroof. Same 187 hp as Premium Plus with a more aggressive look.',
  'Big Bend': 'Entry Bronco Sport 4WD with the 1.5L turbo (181 hp), Ford Co-Pilot360, and cloth/leatherette seats. Capable daily SUV with light trail hardware — lowest Bronco Sport price tier.',
  'Outer Banks': 'Comfort-focused Bronco Sport with leather, heated seats, and a panoramic roof. 181 hp 1.5L turbo — more premium cabin than Big Bend, less trail hardware than Badlands.',
  'Badlands': 'Trail-ready Bronco Sport with the 2.0L turbo (250 hp), off-road suspension, and advanced 4WD. Top trim for capability — leather + sunroof with the most power in the lineup.',
};

// Trim-level differentiators shown in compare table when multiple trims are saved.
const TRIM_COMPARE_DIFFS = {
  'mazda|cx-5': {
    'Grand Touring': '256 hp turbo — Premium Plus is 187 hp without turbo · Adds Bose + head-up display',
    '2.5 S Premium Plus': '187 hp, regular fuel — Grand Touring adds turbo (256 hp) and Bose',
    'Premium Plus': '187 hp, regular fuel — Grand Touring adds turbo (256 hp) and Bose',
    'Turbo Signature': 'Nappa leather + adaptive headlights — Grand Touring has standard leather turbo',
    '2.5 S Carbon Edition': 'Sport black accents, 187 hp — same engine as Premium Plus, bolder styling',
    'Carbon Edition': 'Sport black accents, 187 hp — same engine as Premium Plus, bolder styling',
  },
  'ford|bronco sport': {
    'Big Bend': '181 hp 1.5L · Entry 4WD — Outer Banks adds leather + panoramic roof',
    'Outer Banks': '181 hp comfort trim — Badlands steps up to 250 hp 2.0L with trail hardware',
    'Badlands': '250 hp 2.0L · Most off-road capable — Outer Banks is comfort-focused at 181 hp',
  },
};

// Lot contact info — keyed by city name (before state).
const DEALERSHIP_CONTACTS = {
  'White Plains': {
    name: 'DriveClear White Plains',
    address: '150 Mamaroneck Ave, White Plains, NY 10605',
    phone: '(914) 555-0142',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Yonkers': {
    name: 'DriveClear · Yonkers',
    address: '1234 Central Park Ave, Yonkers, NY 10704',
    phone: '(914) 555-0178',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'New Rochelle': {
    name: 'DriveClear · New Rochelle',
    address: '100 Main St, New Rochelle, NY 10801',
    phone: '(914) 555-0191',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Mount Vernon': {
    name: 'DriveClear · Mount Vernon',
    address: '450 South Columbus Ave, Mount Vernon, NY 10553',
    phone: '(914) 555-0165',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Scarsdale': {
    name: 'DriveClear · Scarsdale',
    address: '888 White Plains Rd, Scarsdale, NY 10583',
    phone: '(914) 555-0156',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Harrison': {
    name: 'DriveClear · Harrison',
    address: '550 Westchester Ave, Harrison, NY 10528',
    phone: '(914) 555-0183',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Port Chester': {
    name: 'DriveClear · Port Chester',
    address: '200 Westchester Ave, Port Chester, NY 10573',
    phone: '(914) 555-0149',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Greenwich': {
    name: 'DriveClear · Greenwich',
    address: '75 East Putnam Ave, Greenwich, CT 06830',
    phone: '(203) 555-0124',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Stamford': {
    name: 'DriveClear · Stamford',
    address: '920 Hope St, Stamford, CT 06907',
    phone: '(203) 555-0137',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
  'Tarrytown': {
    name: 'DriveClear · Tarrytown',
    address: '300 South Broadway, Tarrytown, NY 10591',
    phone: '(914) 555-0112',
    hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
  },
};

const PARTICIPANT = {
  // ── 2022–2024 · ~$25k ± $5k · SUV · CX-5 · leather + sunroof · great credit ──
  maxPrice: 30000,
  maxApproved: null,
  maxMonthly: null,
  body: 'SUV',
  makes: ['Mazda', 'Ford'],
  model: ['CX-5', 'Bronco Sport'],
  minYear: 2022,
  maxYear: 2025,
  maxMiles: 50000,
  drivetrain: null,
  minMpg: null,
  maxDist: 50,
  mustHaveFeatures: ['leather', 'sunroof'],

  needs: [],

  tradeIn: null,

  creditTier: 'great',
  journeyStage: 'Prepared',

  market: {
    label: 'White Plains, NY (10605)',
    zip: '10605',
    lotCities: [
      'White Plains, NY', 'Yonkers, NY', 'New Rochelle, NY', 'Mount Vernon, NY',
      'Scarsdale, NY', 'Harrison, NY', 'Port Chester, NY', 'Greenwich, CT',
      'Stamford, CT', 'Tarrytown, NY',
    ],
  },

  homepage: {
    titleAccent: 'DriveClear White Plains',
    appointment: null,
    dealerAddress: '150 Mamaroneck Ave, White Plains, NY 10605',
    criteriaText: 'used SUV near 10605, 2022–2024, under 50k miles, around $25k (±$5k), Mazda CX-5, leather & sunroof, great credit',
    footText: null,
    footLinkText: 'See all used Mazda CX-5s →',
    footLinkHref: null,
    compareLinkText: 'Compare CX-5 trims across dealers →',
    compareLinkHref: 'compare.html',
    compare: {
      title: 'Compare Mazda CX-5 trims across dealers',
      subtitle: 'Five nearby dealers near <strong>10605</strong> — compare <strong>distance from your zip</strong>, trim, mileage, price, and <strong>safety ratings</strong>. Every CX-5 has <strong>leather + power sunroof</strong>.',
      footDefault: '<strong>2022 Premium Plus at New Rochelle</strong> for lowest price; <strong>2024 Grand Touring at Yonkers</strong> for newest year and lowest miles; <strong>2023 Grand Touring at White Plains</strong> if you want turbo at your local dealer.',
      pickKeys: ['cx5-23-gt', 'cx5-24-gt', 'cx5-22-pp', 'cx5-22-sig', 'cx5-23-carbon'],
      extras: [
        {
          key: 'cx5-22-sig',
          name: '2022 Mazda CX-5 Turbo Signature',
          price: '$29,990',
          year: 2022,
          make: 'Mazda',
          model: 'CX-5',
          trim: 'Turbo Signature',
          vdpId: 431,
          lotCity: 'Stamford, CT',
          trimLabel: 'Turbo Signature · Nappa leather',
          featuresLabel: 'Nappa leather · Power sunroof',
          trimDesc: TRIM_DESCRIPTIONS['Turbo Signature'],
          compareMetrics: { price: 29990, mpg: 26, hp: 256, zero: 6.9, miles: 28600, distMin: 30, distMiles: 22, value: 2100 },
          drawer: {
            dealer: 'DriveClear · Stamford',
            value: '$2,100 below market',
            valueClass: 'great',
            specs: [
              ['Engine', '2.5L Turbo 4-Cyl'], ['Horsepower', '256 hp'], ['0–60 mph', '6.9 s'],
              ['Drivetrain', 'AWD'], ['Year', '2022'], ['Mileage', '28,600 mi'],
              ['Interior', 'Nappa leather · ventilated'], ['Roof', 'Power sunroof'],
            ],
          },
        },
        {
          key: 'cx5-23-carbon',
          name: '2023 Mazda CX-5 2.5 S Carbon Edition',
          price: '$29,488',
          year: 2023,
          make: 'Mazda',
          model: 'CX-5',
          trim: '2.5 S Carbon Edition',
          vdpId: 451,
          lotCity: 'Greenwich, CT',
          trimLabel: 'Carbon Edition · AWD',
          featuresLabel: 'Leather · Power sunroof',
          trimDesc: TRIM_DESCRIPTIONS['2.5 S Carbon Edition'],
          compareMetrics: { price: 29488, mpg: 28, hp: 187, zero: 7.3, miles: 33500, distMin: 25, distMiles: 20, value: 1200 },
          drawer: {
            dealer: 'DriveClear · Greenwich',
            value: '$1,200 below market',
            valueClass: 'good',
            specs: [
              ['Engine', '2.5L 4-Cyl'], ['Horsepower', '187 hp'], ['0–60 mph', '7.3 s'],
              ['Drivetrain', 'AWD'], ['Year', '2023'], ['Mileage', '33,500 mi'],
              ['Interior', 'Leather · heated'], ['Roof', 'Power sunroof'],
            ],
          },
        },
      ],
    },
    picks: [
      {
        key: 'cx5-23-gt',
        name: '2023 Mazda CX-5 Grand Touring',
        price: '$31,990',
        year: 2023,
        make: 'Mazda',
        model: 'CX-5',
        trim: 'Grand Touring',
        vdpId: 401,
        lotCity: 'White Plains, NY',
        match: '98% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Grand Touring · Turbo',
        featuresLabel: 'Leather · Power sunroof',
        trimDesc: TRIM_DESCRIPTIONS['Grand Touring'],
        trimCompare: {
          tagline: 'Top turbo trim',
          diffs: [
            '256 hp turbo — Premium Plus is 187 hp, no turbo',
            'Bose + head-up display (not on Premium Plus)',
            'At your White Plains dealer · 21,800 mi',
          ],
        },
        warrantyBadge: 'Turbo · leather · sunroof',
        specs: [
          { icon: 'couch', text: 'Leather seats' },
          { icon: 'sun', text: 'Power sunroof' },
          { icon: 'gauge-high', text: '256 hp turbo' },
        ],
        expert: 'Your lead spec — turbo Grand Touring with leather, sunroof, and Bose. The CX-5 you were already shopping, one owner, under 50k miles.',
        ownersRating: '4.8/5',
        ownersText: 'Owners love the interior and handling; turbo models prefer premium fuel.',
        compareMetrics: { price: 31990, mpg: 27, hp: 256, zero: 6.8, miles: 21800, distMin: 0, distMiles: 0, value: 2200 },
        drawer: {
          dealer: 'DriveClear White Plains',
          value: '$2,200 below market',
          valueClass: 'great',
          intro: "Here's the full picture on this <strong>used 2023 Mazda CX-5 Grand Touring AWD</strong> — leather, power sunroof, turbo, at your White Plains dealer.",
          specs: [
            ['Engine', '2.5L Turbo 4-Cyl'], ['Horsepower', '256 hp'], ['0–60 mph', '6.8 s'],
            ['Drivetrain', 'AWD'], ['Year', '2023'], ['Mileage', '21,800 mi'],
            ['Interior', 'Leather · heated/ventilated'], ['Roof', 'Power sunroof'],
          ],
          fit: 'Direct match to the CX-5 trim you named — all must-haves in your 2022–2024 window.',
          watch: 'List price above a strict $30k — compare payment to the Premium Plus at 4.9% APR.',
          chips: ['Grand Touring vs Premium Plus?', 'Monthly at 4.9%?', 'Compare all CX-5s'],
        },
      },
      {
        key: 'cx5-24-gt',
        name: '2024 Mazda CX-5 Grand Touring',
        price: '$32,490',
        year: 2024,
        make: 'Mazda',
        model: 'CX-5',
        trim: 'Grand Touring',
        vdpId: 441,
        lotCity: 'Yonkers, NY',
        match: '97% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Grand Touring · Turbo · 2024',
        featuresLabel: 'Leather · Power sunroof',
        trimDesc: TRIM_DESCRIPTIONS['Grand Touring'],
        trimCompare: {
          tagline: 'Same trim, newest year',
          diffs: [
            'Same Grand Touring as 2023 — turbo, leather, sunroof',
            '2024 model · 12,400 mi (lowest on your list)',
            '$500 more than the 2023 Grand Touring',
          ],
        },
        warrantyBadge: 'Newest year · lowest miles',
        specs: [
          { icon: 'couch', text: 'Leather seats' },
          { icon: 'sun', text: 'Power sunroof' },
          { icon: 'calendar', text: '2024 model' },
        ],
        expert: 'Newest CX-5 on the lot — lowest miles in your year range, same Grand Touring leather + sunroof spec you want.',
        ownersRating: '4.8/5',
        ownersText: 'Early owners praise the refreshed styling and quiet cabin.',
        compareMetrics: { price: 32490, mpg: 27, hp: 256, zero: 6.7, miles: 12400, distMin: 15, distMiles: 8, value: 1800 },
        drawer: {
          dealer: 'DriveClear · Yonkers',
          value: '$1,800 below market',
          valueClass: 'great',
          intro: "Here's the breakdown on a <strong>2024 Mazda CX-5 Grand Touring AWD</strong> — barely broken in at 12k miles, leather, sunroof, turbo.",
          specs: [
            ['Engine', '2.5L Turbo 4-Cyl'], ['Horsepower', '256 hp'], ['0–60 mph', '6.7 s'],
            ['Drivetrain', 'AWD'], ['Year', '2024'], ['Mileage', '12,400 mi'],
            ['Interior', 'Leather · heated/ventilated'], ['Roof', 'Power sunroof'],
          ],
          fit: 'Best pick if you want the newest model year and lowest miles — still a CX-5 Grand Touring with your feature list.',
          watch: 'Highest list price on the CX-5 shortlist — worth it only if newest year matters to you.',
          chips: ['2024 vs 2023 — worth the extra?', 'Payment difference?', 'Lowest miles here?'],
        },
      },
      {
        key: 'cx5-22-pp',
        name: '2022 Mazda CX-5 2.5 S Premium Plus',
        price: '$27,990',
        year: 2022,
        make: 'Mazda',
        model: 'CX-5',
        trim: '2.5 S Premium Plus',
        vdpId: 421,
        lotCity: 'New Rochelle, NY',
        match: '96% match',
        location: null,
        locationIcon: 'location-dot',
        trimLabel: 'Premium Plus · Non-turbo',
        featuresLabel: 'Leather · Power sunroof',
        trimDesc: TRIM_DESCRIPTIONS['2.5 S Premium Plus'],
        trimCompare: {
          tagline: 'Value trim — same must-haves',
          diffs: [
            '187 hp — no turbo; runs on regular fuel',
            'Still has leather + power sunroof you asked for',
            '$4,000 less than Grand Touring · closest to $25k',
          ],
        },
        warrantyBadge: 'Closest to $25k',
        specs: [
          { icon: 'couch', text: 'Leather seats' },
          { icon: 'sun', text: 'Power sunroof' },
          { icon: 'dollar-sign', text: 'Best value' },
        ],
        expert: 'The payment-friendly CX-5 — still has leather and a power sunroof without turbo pricing. Closest to your $25k target.',
        ownersRating: '4.7/5',
        ownersText: 'Owners like the value; non-turbo is smoother on regular fuel.',
        compareMetrics: { price: 27990, mpg: 28, hp: 187, zero: 7.4, miles: 31900, distMin: 20, distMiles: 12, value: 1500 },
        drawer: {
          dealer: 'DriveClear · New Rochelle',
          value: '$1,500 below market',
          valueClass: 'good',
          intro: "Here's the detail on a <strong>2022 Mazda CX-5 2.5 S Premium Plus AWD</strong> — leather, power sunroof, and the lowest CX-5 price on your list.",
          specs: [
            ['Engine', '2.5L 4-Cyl'], ['Horsepower', '187 hp'], ['0–60 mph', '7.4 s'],
            ['Drivetrain', 'AWD'], ['Year', '2022'], ['Mileage', '31,900 mi'],
            ['Interior', 'Leather · heated'], ['Roof', 'Power sunroof'],
          ],
          fit: 'Hits leather + sunroof at the best price — ideal if you want a CX-5 first and turbo is optional.',
          watch: 'Non-turbo — less power than Grand Touring but easier on the monthly at 4.9% APR.',
          chips: ['Do I need turbo?', 'Compare to Grand Touring', 'Monthly at 4.9%'],
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
    if (PARTICIPANT.model) {
      P.model = PARTICIPANT.model;
      if (!Array.isArray(PARTICIPANT.model)) P.q = PARTICIPANT.model;
    }
    if (PARTICIPANT.mustHaveFeatures && PARTICIPANT.mustHaveFeatures.length) {
      P.feat = PARTICIPANT.mustHaveFeatures.slice();
    }
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

  dealershipContact(dealerLabel, lotCity) {
    let key = '';
    if (lotCity) key = String(lotCity).split(',')[0].trim();
    else if (dealerLabel) {
      const m = String(dealerLabel).match(/DriveClear\s*(?:·\s*)?(.+)/i);
      key = m ? m[1].split(',')[0].trim() : String(dealerLabel).split(',')[0].trim();
    }
    const hp = PARTICIPANT.homepage;
    const fallback = {
      name: dealerLabel || 'DriveClear',
      address: (hp && hp.dealerAddress) || 'Contact for address',
      phone: '(914) 555-0142',
      hours: 'Mon–Sat 9am–7pm · Sun 11am–5pm',
    };
    if (!key) return fallback;
    return DEALERSHIP_CONTACTS[key] || { ...fallback, name: `DriveClear · ${key}` };
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

  compareLocationLabel(pick) {
    const zip = this.marketZip();
    const cm = pick.compareMetrics || {};
    const distMin = cm.distMin != null ? cm.distMin : 0;
    const distMiles = cm.distMiles != null ? cm.distMiles : this._milesFromDistMin(distMin);
    const city = pick.lotCity || pick.drawer?.lotCity;
    const cityShort = city ? city.split(',')[0].trim() : '';

    if (!zip) return pick.drawer?.distance || cityShort || '—';
    if (distMiles === 0) return `${cityShort || this.visitPlaceShort()} · 0 mi from ${zip}`;
    const drive = distMin > 0 ? ` · ${distMin} min drive` : '';
    return `${cityShort ? cityShort + ' · ' : ''}${distMiles} mi from ${zip}${drive}`;
  },

  _milesFromDistMin(distMin) {
    const map = { 0: 0, 12: 7, 15: 8, 18: 10, 20: 12, 22: 14, 25: 16, 28: 20, 30: 22, 35: 28 };
    return map[distMin] != null ? map[distMin] : Math.max(0, Math.round(distMin * 0.75));
  },

  trimDescription(vOrPick) {
    if (!vOrPick) return '';
    const hp = PARTICIPANT.homepage;
    const id = vOrPick.id != null ? vOrPick.id : vOrPick.vdpId;
    const trim = vOrPick.trim || '';
    if (hp) {
      const pool = []
        .concat(hp.picks || [])
        .concat(hp.compare?.extras || []);
      const pick = pool.find(p => p.vdpId === id)
        || pool.find(p => p.trim === trim && (!vOrPick.year || p.year === vOrPick.year));
      if (pick?.trimDesc) return pick.trimDesc;
    }
    if (TRIM_DESCRIPTIONS[trim]) return TRIM_DESCRIPTIONS[trim];
    const key = Object.keys(TRIM_DESCRIPTIONS).find(k =>
      trim.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(trim.toLowerCase())
    );
    return key ? TRIM_DESCRIPTIONS[key] : '';
  },

  trimCompareDescription(vOrPick, peers) {
    const base = this.trimDescription(vOrPick);
    if (!peers || !peers.length) return base;

    const trim = vOrPick.trim || '';
    const make = vOrPick.make || '';
    const model = vOrPick.model || '';
    const lineupKey = `${String(make).toLowerCase()}|${String(model).toLowerCase()}`;
    const diffLine = TRIM_COMPARE_DIFFS[lineupKey]?.[trim]
      || Object.entries(TRIM_COMPARE_DIFFS[lineupKey] || {}).find(([k]) =>
        trim.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(trim.toLowerCase())
      )?.[1];

    const otherTrims = peers
      .filter(p => p && (p.trim || '') !== trim)
      .map(p => p.trim)
      .filter(Boolean);
    const uniqueOtherTrims = [...new Set(otherTrims)];

    const parts = [];
    if (base) parts.push(base);
    if (diffLine && uniqueOtherTrims.length) {
      parts.push(`Trim differences: ${diffLine}`);
    } else if (uniqueOtherTrims.length && vOrPick.hp) {
      const peer = peers.find(p => p.trim && p.trim !== trim && p.hp);
      if (peer && peer.hp !== vOrPick.hp) {
        parts.push(`Trim differences: ${vOrPick.hp} hp on this trim vs ${peer.hp} hp on ${peer.trim}`);
      }
    } else if (!uniqueOtherTrims.length && peers.length && trim) {
      parts.push(`Same ${trim} trim on your list — compare year, mileage, price, and dealer below.`);
    }
    return parts.join(' ');
  },

  marketZip() {
    const m = PARTICIPANT.market;
    if (m && m.zip) return String(m.zip);
    if (m && m.label) {
      const match = String(m.label).match(/\((\d{5})\)/);
      if (match) return match[1];
    }
    return null;
  },

  // Minutes / miles from participant zip for each lotCities slot.
  _lotProximity(idx) {
    const table = [
      { min: 0, mi: 0 },
      { min: 15, mi: 8 },
      { min: 20, mi: 12 },
      { min: 12, mi: 7 },
      { min: 18, mi: 10 },
      { min: 22, mi: 14 },
      { min: 25, mi: 16 },
      { min: 30, mi: 22 },
      { min: 35, mi: 28 },
      { min: 28, mi: 20 },
    ];
    return table[idx] || { min: idx * 5, mi: idx * 4 + 4 };
  },

  vehicleDistMiles(v) {
    const cities = this.lotLocations();
    if (!cities || !cities.length || !v || !v.location) {
      return ((v.id * 7) % 12) * 9 + 6;
    }
    const idx = cities.indexOf(v.location);
    if (idx === -1) return 50;
    return this._lotProximity(idx).mi;
  },

  vehicleLocationLabel(v) {
    const zip = this.marketZip();
    const cities = this.lotLocations();
    const primary = this.primaryLotCity();
    if (!v?.location) return zip ? `Near ${zip}` : 'In stock';

    const idx = cities ? cities.indexOf(v.location) : -1;
    const prox = idx >= 0 ? this._lotProximity(idx) : null;

    if (prox && prox.mi === 0) {
      const place = this.visitPlaceShort();
      return zip ? `At ${place} · ${zip}` : `At ${place}`;
    }
    if (zip && prox) return `${prox.min} min from ${zip}`;
    if (zip) return `${this.vehicleDistMiles(v)} mi from ${zip}`;
    return v.location;
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
    if (P.maxPrice) q.set('maxPrice', P.maxPrice);
    if (P.maxMiles) q.set('maxMiles', P.maxMiles);
    if (P.maxDist) q.set('maxDist', P.maxDist);
    if (P.model) {
      [].concat(P.model).forEach(m => q.append('model', m));
    }
    if (P.q) q.set('q', P.q);
    if (P.feat && P.feat.length) P.feat.forEach(f => q.append('feat', f));
    if (P.make) [].concat(P.make).forEach(m => q.append('make', m));
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
    if (!hp) return [];
    const cmp = hp.compare || {};
    let pickList = [];
    if (cmp.pickKeys && cmp.pickKeys.length) {
      const byKey = key => (hp.picks || []).find(p => p.key === key)
        || (cmp.extras || []).find(p => p.key === key);
      pickList = cmp.pickKeys.map(byKey).filter(Boolean);
    } else if (cmp.picks && cmp.picks.length) {
      pickList = cmp.picks;
    } else {
      pickList = hp.picks || [];
    }
    if (!pickList.length) return [];

    const apr = this.apr();
    return pickList.map((pick, i) => {
      const cm = pick.compareMetrics || {};
      const d = pick.drawer || {};
      const specMap = Object.fromEntries((d.specs || []).map(row => [row[0], row[1]]));
      const priceFromLabel = parseInt(String(pick.price || '').replace(/\D/g, ''), 10);
      const price = cm.price != null ? cm.price : (priceFromLabel || 0);
      const shortName = String(pick.name || pick.key).replace(/^\d{4}\s+/, '');
      return {
        key: pick.key,
        col: i + 1,
        name: shortName,
        displayName: pick.name || shortName,
        trim: pick.trim || pick.trimLabel || '',
        trimLabel: pick.trimLabel || pick.trim || '',
        trimDesc: pick.trimDesc || this.trimDescription(pick),
        features: pick.featuresLabel || 'Leather · Power sunroof',
        dealer: d.dealer || pick.location || '—',
        lotCity: pick.lotCity || null,
        distance: this.compareLocationLabel(pick),
        price,
        monthly: typeof calcMonthly === 'function' ? calcMonthly(price, 0, apr, 60) : 0,
        mpg: cm.mpg != null ? cm.mpg : parseInt(String(specMap['MPG (comb.)'] || '0'), 10),
        hp: cm.hp != null ? cm.hp : parseInt(String(specMap['Horsepower'] || '0'), 10),
        zero: cm.zero != null ? cm.zero : parseFloat(String(specMap['0–60 mph'] || specMap['0-60 mph'] || '0').replace(/[^\d.]/g, '')) || 0,
        miles: cm.miles != null ? cm.miles : parseInt(String(specMap['Mileage'] || '0').replace(/\D/g, ''), 10),
        distMin: cm.distMin != null ? cm.distMin : 0,
        distMiles: cm.distMiles != null ? cm.distMiles : this._milesFromDistMin(cm.distMin != null ? cm.distMin : 0),
        value: cm.value != null ? cm.value : 0,
        year: pick.year || parseInt(String(pick.name).match(/^(\d{4})/)?.[1], 10) || null,
        make: pick.make || null,
        model: pick.model || null,
        engine: specMap['Engine'] || '—',
        drivetrain: specMap['Drivetrain'] || '—',
        valueLabel: d.value || 'At market',
        valueClass: d.valueClass || 'at',
        vdpId: pick.vdpId != null ? pick.vdpId : null,
        image: pick.imageUrl || null,
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
