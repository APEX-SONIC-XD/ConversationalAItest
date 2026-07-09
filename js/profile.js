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
         Profile.srpHref()         -> filtered SRP URL from intent
         Profile.srpParams()       -> intent for SRP filters (excludes soft MPG presets)
         Profile.lotLocations()    -> inventory lot cities (applyToInventory on load)
         Profile.pickLocation()    -> homepage pick location badge
     • optionally call Profile.subscribe(fn) to react to live changes
       (primary flow is read-on-load + participant refresh).

   A field set to null / [] means "not stated yet".

   Between sessions: reset from js/profile.blank.js (copy PARTICIPANT block).
   ============================================================ */

const PARTICIPANT = {
  // ── Core shopping intent (SRP, VDP payments, finance, compare, nav search) ──
  // LIVE SESSION — Kobe participant; replacing 2017 Audi A4 quattro; sedan, Charlotte, ~$26k/$30k, excellent credit
  maxPrice: 26000,
  maxApproved: 30000,
  maxMonthly: null,
  body: 'Sedan',
  makes: [],
  minYear: 2020,
  maxMiles: 30000,
  drivetrain: 'AWD',
  minMpg: null,
  maxDist: 45,

  needs: ['carplay', 'sporty', 'comfortable', 'performance', 'handling', 'reliable', 'lowmaintenance', 'value', 'insurance', 'fuel', 'financing', 'expertreviews'],

  tradeIn: {
    year: 2017, make: 'Audi', model: 'A4', trim: 'quattro', condition: 'good',
    painPoint: 'High maintenance and repair costs',
  },

  creditTier: 'great',
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
    appointment: null,
    dealerAddress: '1234 South Tryon St, Charlotte, NC 28203',
    criteriaText: '~$26k budget ($30k approved) — under 30k mi AWD sedans, insurance, mpg, financing, reliability & reviews',
    footText: 'Ranked on total cost: insurance, fuel, payment, CR scores, expert reviews & resale.',
    footLinkText: 'Open full TCO compare →',
    footLinkHref: 'compare.html',
    testDrive: {
      multi: true,
      hub: 'DriveClear Charlotte',
      hubAddress: '1234 South Tryon St, Charlotte, NC 28203',
      headline: 'Test drive all three in one Charlotte visit',
      note: 'All three AWD sedans will be staged at our <strong>South Tryon St</strong> showroom — drive them back-to-back with no shuttle between lots.',
      planNote: 'We pull vehicles from Charlotte metro inventory to one location for your visit.',
      transferNote: 'Listings may be at different Charlotte metro lots. For your multi-car test drive, we <strong>transfer every vehicle to DriveClear Charlotte</strong> (1234 South Tryon St) so you can drive all three back-to-back — one check-in, no lot-hopping.',
      keys: ['bmw330', 'lexusIS', 'acuraTLX'],
      lineupPrep: {
        eyebrow: 'DriveClear Assistant · Back-to-back plan',
        driveOrder: ['acuraTLX', 'lexusIS', 'bmw330'],
        orderWhy: 'Start with the lowest payment and insurance, step up through reliability, then finish with the sportiest benchmark while steering feel is fresh.',
        compareFocus: [
          'AWD grip and steering feel vs your 2017 Audi quattro',
          'Road noise and rear-seat space for daily use',
          'Monthly payment and insurance at your 4.9% APR tier',
        ],
        aiTake: 'Drive the <strong>Acura TLX</strong> first as your budget anchor, <strong>Lexus IS 300</strong> second for CR reliability, and <strong>BMW 330i</strong> last — closest to your Audi on feel.',
        chips: ['What order should I drive?', 'Which is closest to my Audi?', 'What should I note between drives?', 'How long for all three?'],
        driveNotes: {
          title: 'In-store drive notes',
          subtitle: 'Rate each drive plus payment, reliability, and maintenance — compare sheet updates live.',
          noteDimensions: [
            { key: 'awdFeel', label: 'AWD / steering vs Audi', group: 'drive', category: 'Performance & handling' },
            { key: 'roadNoise', label: 'Road noise at 60 mph', group: 'drive', category: 'Refinement' },
            { key: 'rearSeat', label: 'Rear seat & daily comfort', group: 'drive', category: 'Comfort' },
            { key: 'value', label: 'Worth the payment', group: 'drive', category: 'Value' },
            { key: 'overall', label: 'Gut check', group: 'drive', category: 'Overall' },
            { key: 'reliability', label: 'Reliability confidence', group: 'ownership', category: 'Reliability' },
            { key: 'maintenance', label: 'Upkeep comfort', group: 'ownership', category: 'Maintenance' },
          ],
        },
      },
    },
    compare: {
      title: 'Total cost & AWD sedan compare — your shortlist',
      subtitle: "You care about <strong>insurance, fuel economy, financing, depreciation/resale, reliability, owner satisfaction, and expert reviews</strong> — plus <strong>AWD</strong> like your Audi. Here are your three <strong>under 30,000 mi</strong> Charlotte AWD sedan matches, with sources labeled.",
      footDefault: 'TCO read: <strong>Acura TLX</strong> has the lowest insurance and payment of the three; <strong>Lexus IS 300</strong> leads CR reliability; <strong>BMW 330i</strong> tops expert reviews and driving feel. All run ~$460–$580/yr less on insurance than your Audi. Payments at <strong>4.9% APR</strong> run ~$482–$580/mo.',
    },
    research: {
      eyebrow: 'DriveClear Assistant · Total cost research',
      title: 'Insurance, mpg, financing, CR scores & expert reviews',
      summary: 'You asked for the <strong>full picture</strong> — not just sticker price. I pulled <strong>insurance estimates</strong>, <strong>EPA fuel economy</strong>, <strong>financing payments</strong> at your 4.9% APR, <strong>Consumer Reports</strong> reliability & owner satisfaction, <strong>expert review scores</strong>, and <strong>5-year resale</strong> for your three <strong>AWD sedan</strong> matches closest to your Audi.',
      aiTake: '<strong>Acura TLX</strong> is cheapest to insure and finance (~$1,580/yr · ~$482/mo). <strong>Lexus IS 300</strong> balances luxury and CR reliability. <strong>BMW 330i</strong> leads expert reviews and driving feel — all with lower insurance than your Audi (~$2,180/yr).',
      sourceNote: 'Illustrative prototype data — every column links to a named source below.',
      audiBenchmark: { label: 'Your 2017 Audi A4 quattro', reliability: 2, ownerSat: 3, retain5yr: 42, insAnnual: 2180, source: 'Consumer Reports · Edmunds · insurance avg.' },
      sources: [
        { metric: 'Listing price', provider: 'DriveClear inventory', detail: 'Charlotte metro dealer stock — no-haggle, all-in price', updated: 'Today' },
        { metric: 'Insurance estimates', provider: 'Charlotte NC rate averages', detail: 'Full coverage, great credit, 12k mi/yr — Geico/Progressive/State Farm composite', updated: 'Mar 2025' },
        { metric: 'Fuel economy (MPG)', provider: 'EPA combined ratings', detail: 'Window-sticker combined city/highway for each trim', updated: '2025' },
        { metric: 'Monthly payment', provider: 'DriveClear finance calculator', detail: '60 mo @ 4.9% APR, 10% down, excellent credit tier', updated: 'Today' },
        { metric: 'CR reliability & owner satisfaction', provider: 'Consumer Reports', detail: 'Predicted reliability and owner satisfaction by model family', updated: 'Jan 2025' },
        { metric: 'Expert review scores', provider: 'Edmunds · Car and Driver · KBB', detail: 'Aggregated editor ratings for trim year', updated: '2025' },
        { metric: '3- & 5-year resale', provider: 'ALG residual curves', detail: 'Charlotte-market depreciation from current listing price', updated: 'Mar 2025' },
        { metric: 'Annual maintenance', provider: 'RepairPal + Consumer Reports', detail: 'Typical scheduled maintenance, excl. major repairs', updated: '2025' },
      ],
      chips: ['Lowest insurance?', 'Best AWD option?', 'Monthly payment?', 'Expert reviews?', 'Where does this data come from?'],
    },
    picks: [
      {
        key: 'bmw330',
        name: '2022 BMW 330i xDrive',
        price: '$38,500',
        year: 2022,
        make: 'BMW',
        model: '330i',
        trim: 'xDrive',
        vdpId: 371,
        testDrive: true,
        match: '96% match',
        location: 'Charlotte, NC',
        locationIcon: 'location-dot',
        trimLabel: 'xDrive Sport Line · AWD Sedan',
        warrantyBadge: '22,400 mi',
        specs: [
          { icon: 'gauge', text: '22,400 mi' },
          { icon: 'snowflake', text: 'xDrive AWD' },
          { icon: 'shield', text: '~$1,850/yr ins.' },
        ],
        expert: 'Car and Driver calls the G20 330i "the benchmark sport sedan" — sharp steering, 255 hp turbo, and xDrive grip closest to your A4 quattro. Edmunds warns upkeep runs higher than Lexus or Acura.',
        ownersRating: '4.4/5',
        ownersText: 'CR owner satisfaction above average for the class; owners love the chassis but note insurance and out-of-warranty repair costs vs. Japanese rivals.',
        compareMetrics: { price: 38500, mpg: 31, hp: 255, zero: 5.6, miles: 22400, distMin: 0, value: 1800, crReliability: 3, crOwnerSat: 4, estValue3yr: 29200, estValue5yr: 24500, insAnnual: 1850, monthlyEst: 580, expertScore: 5, maintAnnual: 1180 },
        drawer: {
          dealer: 'DriveClear Charlotte',
          distance: 'At your dealer — South Tryon St',
          value: '$1,800 below market',
          valueClass: 'great',
          intro: "Here's the <strong>2022 BMW 330i xDrive</strong> at <strong>22,400 miles</strong> — the most direct A4 quattro replacement on driving feel, with xDrive and Apple CarPlay.",
          specs: [
            ['Mileage', '22,400 mi'], ['Drivetrain', 'xDrive AWD'], ['Insurance (est.)', '~$1,850/yr'],
            ['Monthly payment', '~$580/mo @ 4.9%'], ['Expert reviews', '5/5'], ['5-yr resale (est.)', '$24,500'],
          ],
          fit: 'Best if you want the closest thing to your Audi driving experience — quickest 0–60 and top expert scores in the AWD group.',
          watch: 'Stretches your $30k approval (~$38.5k) and insurance still runs ~$330/yr below your Audi — upkeep is the bigger swing factor.',
          chips: ['Worth the premium over Acura?', 'Maintenance vs my Audi?', 'Schedule test drive'],
        },
      },
      {
        key: 'lexusIS',
        name: '2022 Lexus IS 300 AWD',
        price: '$34,490',
        year: 2022,
        make: 'Lexus',
        model: 'IS',
        trim: '300 AWD',
        vdpId: 381,
        testDrive: true,
        match: '95% match',
        location: 'Huntersville, NC',
        locationIcon: 'location-dot',
        trimLabel: '300 AWD F Sport · AWD Sedan',
        warrantyBadge: '22,100 mi',
        specs: [
          { icon: 'gauge', text: '22,100 mi' },
          { icon: 'snowflake', text: 'AWD' },
          { icon: 'shield', text: '~$1,720/yr ins.' },
        ],
        expert: 'KBB praises the IS 300 AWD for "luxury without the drama" — composed ride, strong reliability scores, and AWD without BMW-level maintenance anxiety.',
        ownersRating: '4.5/5',
        ownersText: 'CR owner satisfaction above average; former Audi owners often cite lower surprise repair bills and still-sporty F Sport tuning.',
        compareMetrics: { price: 34490, mpg: 27, hp: 241, zero: 6.1, miles: 22100, distMin: 12, value: 1400, crReliability: 4, crOwnerSat: 4, estValue3yr: 27200, estValue5yr: 22800, insAnnual: 1720, monthlyEst: 520, expertScore: 4, maintAnnual: 820 },
        drawer: {
          dealer: 'DriveClear Huntersville',
          distance: '12 min north of Charlotte',
          value: '$1,400 below market',
          valueClass: 'great',
          intro: "Here's the <strong>2022 Lexus IS 300 AWD</strong> F Sport at <strong>22,100 miles</strong> — AWD grip with Lexus reliability and a calmer ownership cost profile than German rivals.",
          specs: [
            ['Mileage', '22,100 mi'], ['Drivetrain', 'AWD'], ['Insurance (est.)', '~$1,720/yr'],
            ['Monthly payment', '~$520/mo @ 4.9%'], ['CR reliability', '4/5'], ['5-yr resale (est.)', '$22,800'],
          ],
          fit: 'Best AWD compromise — premium feel and CR reliability without the highest payment in the group.',
          watch: 'Still above your $30k ceiling; rear seat is tight and mpg trails the value picks.',
          chips: ['Lexus vs BMW feel?', 'Insurance vs Audi?', 'Add to test drive lineup'],
        },
      },
      {
        key: 'acuraTLX',
        name: '2022 Acura TLX SH-AWD',
        price: '$31,890',
        year: 2022,
        make: 'Acura',
        model: 'TLX',
        trim: 'SH-AWD',
        vdpId: 391,
        testDrive: true,
        match: '93% match',
        location: 'Matthews, NC',
        locationIcon: 'route',
        trimLabel: 'SH-AWD Advance · AWD Sedan',
        warrantyBadge: '19,600 mi',
        specs: [
          { icon: 'gauge', text: '19,600 mi' },
          { icon: 'snowflake', text: 'SH-AWD' },
          { icon: 'shield', text: '~$1,580/yr ins.' },
        ],
        expert: 'Edmunds rates the TLX SH-AWD "the smart Audi alternative" — 272 hp, Super Handling AWD, and a roomy cabin. Car and Driver likes the chassis but notes the 10-speed can feel busy.',
        ownersRating: '4.3/5',
        ownersText: 'CR owner satisfaction average; SH-AWD owners moving from European sedans highlight lower insurance and fewer unplanned shop visits.',
        compareMetrics: { price: 31890, mpg: 26, hp: 272, zero: 5.9, miles: 19600, distMin: 20, value: 1100, crReliability: 3, crOwnerSat: 3, estValue3yr: 25200, estValue5yr: 21200, insAnnual: 1580, monthlyEst: 482, expertScore: 4, maintAnnual: 940 },
        drawer: {
          dealer: 'DriveClear Matthews',
          distance: '20 min southeast of Charlotte',
          value: '$1,100 below market',
          valueClass: 'good',
          intro: "Here's the <strong>2022 Acura TLX SH-AWD</strong> Advance at <strong>19,600 miles</strong> — lowest miles in the AWD group, most horsepower, and SH-AWD torque vectoring like your quattro.",
          specs: [
            ['Mileage', '19,600 mi'], ['Drivetrain', 'SH-AWD'], ['Insurance (est.)', '~$1,580/yr'],
            ['Monthly payment', '~$482/mo @ 4.9%'], ['Horsepower', '272 hp'], ['5-yr resale (est.)', '$21,200'],
          ],
          fit: 'Closest AWD swap on power and grip — just over your $30k approval with the lowest insurance in the premium trio.',
          watch: 'CR reliability is mid-pack; infotainment trackpad takes learning. Worth a back-to-back drive vs. the BMW.',
          chips: ['SH-AWD vs quattro?', 'Payment at 4.9%?', 'Test drive with BMW?'],
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
    if (needs.some(n => /insur/.test(n))) add('insAnnual');
    if (PARTICIPANT.minMpg != null || needs.some(n => /mpg|fuel|efficien|eco|commut/.test(n))) add('mpg');
    if (needs.some(n => /financ|payment|depreciat|resale/.test(n))) { add('monthlyEst'); add('estValue5yr'); }
    if (needs.some(n => /reliab|depend|lowmaintenance/.test(n))) add('crReliability');
    if (needs.some(n => /owner|satisf|reliab/.test(n))) add('crOwnerSat');
    if (needs.some(n => /expert|review|editor/.test(n))) add('expertScore');
    if (PARTICIPANT.maxPrice != null || needs.some(n => /budget|cheap|afford|first|value/.test(n))) add('price');
    if (PARTICIPANT.maxDist != null || needs.some(n => /near|close|local|distance/.test(n))) add('dist');
    if (PARTICIPANT.maxMiles != null || needs.some(n => /mileage|newer|low mile/.test(n))) add('miles');
    if (needs.some(n => /sporty|fun|fast|performance|power|handling/.test(n))) { add('hp'); add('zero'); }
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
    if (PARTICIPANT.maxPrice) extra.push('~$' + PARTICIPANT.maxPrice.toLocaleString() + ' budget');
    else if (P.maxPrice) extra.push('under $' + P.maxPrice.toLocaleString());
    if (PARTICIPANT.maxApproved && PARTICIPANT.maxApproved > (PARTICIPANT.maxPrice || 0)) {
      extra.push('$' + PARTICIPANT.maxApproved.toLocaleString() + ' approved');
    }
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

  budgetSummary() {
    const target = PARTICIPANT.maxPrice;
    const approved = PARTICIPANT.maxApproved;
    if (target && approved && approved > target) {
      return `~$${target.toLocaleString()} target budget · $${approved.toLocaleString()} approved`;
    }
    if (target) return `~$${target.toLocaleString()} budget`;
    if (approved) return `$${approved.toLocaleString()} approved`;
    return '';
  },

  srpSearchCeiling() {
    let ceiling = PARTICIPANT.maxApproved || PARTICIPANT.maxPrice || 0;
    const hp = PARTICIPANT.homepage;
    if (hp && hp.picks && hp.picks.length) {
      hp.picks.forEach(pick => {
        const cm = pick.compareMetrics && pick.compareMetrics.price;
        const fromLabel = parseInt(String(pick.price || '').replace(/\D/g, ''), 10);
        const pickPrice = cm != null ? cm : fromLabel;
        if (pickPrice) ceiling = Math.max(ceiling, pickPrice);
      });
    }
    return ceiling || null;
  },

  srpParams() {
    const P = this.toParams();
    if (PARTICIPANT.minMpg == null) delete P.minMpg;
    const ceiling = this.srpSearchCeiling();
    if (ceiling) {
      P.targetBudget = PARTICIPANT.maxPrice;
      P.maxApproved = PARTICIPANT.maxApproved;
      P.maxPrice = ceiling;
    }
    return P;
  },

  srpHref() {
    const P = this.srpParams();
    const q = new URLSearchParams();
    if (P.body) q.set('body', P.body);
    if (P.drive) {
      const d = Array.isArray(P.drive) ? P.drive[0] : P.drive;
      if (d) q.set('drive', d);
    }
    if (P.minYear) q.set('minYear', P.minYear);
    if (P.maxPrice) q.set('maxPrice', P.maxPrice);
    if (P.targetBudget) q.set('budget', P.targetBudget);
    if (P.maxApproved) q.set('approved', P.maxApproved);
    if (P.maxMiles) q.set('maxMiles', P.maxMiles);
    if (P.maxDist) q.set('maxDist', P.maxDist);
    if (Array.isArray(P.make) && P.make.length) P.make.forEach(m => q.append('make', m));
    else if (P.make) q.set('make', P.make);
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

  testDriveHub() {
    const hp = PARTICIPANT.homepage;
    const td = (hp && hp.testDrive) || {};
    const name = td.hub || hp.titleAccent || 'DriveClear Charlotte';
    const address = td.hubAddress || hp.dealerAddress || 'Charlotte, NC';
    return { name, address, short: name.replace(/^DriveClear\s+/i, '').trim() || 'Charlotte' };
  },

  testDriveLineup() {
    const hp = PARTICIPANT.homepage;
    if (!hp || !hp.picks || !hp.picks.length) return [];
    const td = hp.testDrive || {};
    const hub = this.testDriveHub();
    const keys = td.keys && td.keys.length
      ? td.keys
      : hp.picks.filter(p => p.testDrive !== false).map(p => p.key);
    return keys.map(key => {
      const pick = hp.picks.find(p => p.key === key);
      if (!pick) return null;
      const v = (typeof findVehicleForPick === 'function') ? findVehicleForPick(pick) : null;
      return {
        key: pick.key,
        name: pick.name,
        trimLabel: pick.trimLabel || '',
        price: pick.price,
        location: hub.short,
        testDriveAt: hub.address,
        stockLot: pick.location || (pick.drawer && pick.drawer.dealer) || '',
        vdpId: pick.vdpId != null ? pick.vdpId : (v ? v.id : null),
      };
    }).filter(Boolean);
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
        crReliability: cm.crReliability != null ? cm.crReliability : null,
        crOwnerSat: cm.crOwnerSat != null ? cm.crOwnerSat : null,
        estValue3yr: cm.estValue3yr != null ? cm.estValue3yr : null,
        estValue5yr: cm.estValue5yr != null ? cm.estValue5yr : null,
        insAnnual: cm.insAnnual != null ? cm.insAnnual : null,
        monthlyEst: cm.monthlyEst != null ? cm.monthlyEst : null,
        expertScore: cm.expertScore != null ? cm.expertScore : null,
        year: pick.year || parseInt(String(pick.name).match(/^(\d{4})/)?.[1], 10) || null,
        engine: specMap['Engine'] || '—',
        drivetrain: specMap['Drivetrain'] || (pick.trimLabel && /FWD|AWD|RWD/.exec(pick.trimLabel)?.[0]) || '—',
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
