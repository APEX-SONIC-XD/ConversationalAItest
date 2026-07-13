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
  // ── LIVE SESSION — first-time buyer; Dallas metro; used sporty SUV; HUD; X5 anchor ──
  maxPrice: 55000,
  maxApproved: null,
  maxMonthly: null,
  body: 'SUV',
  makes: ['BMW', 'Audi', 'Genesis'],
  minYear: 2022,
  maxYear: 2023,
  maxMiles: 45000,
  drivetrain: 'AWD',
  minMpg: null,
  maxDist: 45,

  needs: ['firstcar', 'hud', 'sporty', 'performance', 'value', 'color'],

  tradeIn: null,

  creditTier: 'good',
  journeyStage: 'Prepared',

  market: {
    label: 'Dallas, TX',
    lotCities: [
      'Dallas, TX', 'Plano, TX', 'Frisco, TX', 'Irving, TX', 'Arlington, TX',
      'Fort Worth, TX', 'Garland, TX', 'McKinney, TX', 'Richardson, TX', 'Carrollton, TX',
    ],
  },

  homepage: {
    titleAccent: 'DriveClear Dallas',
    appointment: null,
    dealerAddress: '2400 Commerce St, Dallas, TX 75226',
    criteriaText: 'first-time buyer — 2022–2023 used sporty SUV with HUD, blue/grey/black, under $55k · Dallas',
    footText: 'Dallas-area used matches ranked by sporty styling, horsepower, HUD, mileage, and value.',
    footLinkText: 'See all sporty AWD SUVs →',
    footLinkHref: 'srp.html?body=SUV&drive=AWD&maxPrice=55000&minYear=2022&maxYear=2023',
    buyingProgress: {
      eyebrow: 'DriveClear Assistant',
      title: 'First-Time Buyer Guide',
      summary: 'Most first-time buyers follow the same basic order. You\'re on <strong>step 3</strong> — compare your matches below.',
      currentStep: 2,
      steps: [
        {
          key: 'want',
          label: 'What car I want',
          status: 'done',
          aiTip: 'Start with the <strong>body style, features, and feel</strong> you\'re after — not the monthly payment yet. Yours: <strong>sporty used midsize SUV</strong> with <strong>HUD</strong>, <strong>2022–2023</strong>, <strong>AWD</strong>, in <strong>blue, grey, or black</strong> around <strong>Dallas</strong>. The BMW X5 is your anchor; Audi Q5 and Genesis GV70 are strong alternates.',
          action: { label: 'Browse SUVs', href: 'srp.html?body=SUV&drive=AWD&maxPrice=55000&minYear=2022&maxYear=2023' },
          chips: ['How do I narrow body style?', 'Why does HUD matter?'],
        },
        {
          key: 'afford',
          label: 'What can I afford',
          status: 'done',
          aiTip: 'Now layer in <strong>budget</strong> — sticker price, monthly payment, insurance, and gas. You\'re shopping <strong>under $55k</strong> with <strong>good credit (6.9% APR)</strong>. Decide whether <strong>financing</strong> or <strong>paying cash</strong> fits, and get pre-approved so the number is real before you fall for a car.',
          action: { label: 'Estimate payment', href: 'financing.html' },
          chips: ['Finance vs. pay cash?', 'What monthly can I afford?'],
        },
        {
          key: 'compare',
          label: 'Compare',
          status: 'current',
          aiTip: 'Work from a <strong>small shortlist (2–4 cars)</strong> — the three matches below fit your criteria. Check <strong>price, miles, and HUD</strong> on each, then put them <strong>side-by-side</strong> on year, performance, and value to spot trade-offs before you test drive.',
          action: { label: 'Compare your 3 matches', href: 'compare.html' },
          chips: ['Why only a few cars?', 'What do I look at first?', 'What should I compare first?'],
        },
        {
          key: 'drive',
          label: 'Test drive & purchase',
          status: 'upcoming',
          aiTip: 'Drive your <strong>top one or two</strong> picks. Confirm features like <strong>HUD</strong>, get comfortable with how it drives, then finalize <strong>payment</strong> and paperwork. Listed price here is <strong>all-in — no haggling</strong>.',
          action: { label: 'Schedule test drive', href: 'vdp.html?id=41' },
          chips: ['What to check on a test drive?'],
        },
      ],
    },
    compare: {
      title: 'Used BMW X5 and similar sporty midsize SUVs',
      subtitle: "You're shopping <strong>used 2022–2023</strong> in the <strong>Dallas metro</strong> — you called out the <strong>BMW X5</strong>. Here's how your shortlist stacks up on <strong>year, mileage, horsepower, 0–60, HUD, price, and value</strong>. Best in each row is highlighted.",
      footDefault: 'AI pick: <strong>BMW X5 xDrive40i</strong> is your anchor — most horsepower and the sportiest stance; <strong>Genesis GV70 2.5T</strong> is the value play with HUD and 300 hp; <strong>Audi Q5</strong> splits the difference on tech and quattro grip.',
    },
    picks: [
      {
        key: 'x5',
        name: '2022 BMW X5 xDrive40i',
        price: '$45,990',
        year: 2022,
        make: 'BMW',
        model: 'X5',
        trim: 'xDrive40i',
        match: '98% match',
        location: 'Dallas, TX',
        locationIcon: 'location-dot',
        trimLabel: 'M Sport · Phytonic Blue · AWD SUV',
        warrantyBadge: 'Head-Up Display',
        specs: [
          { icon: 'palette', text: 'Phytonic Blue' },
          { icon: 'gauge-high', text: '335 hp' },
          { icon: 'display', text: 'HUD' },
        ],
        expert: 'Car and Driver calls the X5 "the athlete in the family" — muscular M Sport lines, 335 hp turbo six, and one of the few midsize SUVs that feels genuinely quick.',
        ownersRating: '4.5/5',
        ownersText: 'Owners love the driving position and HUD; first-time luxury buyers should budget for premium fuel and service intervals.',
        compareMetrics: { price: 45990, mpg: 23, hp: 335, zero: 5.3, miles: 26800, distMin: 0, value: 2800 },
        drawer: {
          dealer: 'DriveClear Dallas',
          distance: 'At your Dallas dealer',
          value: '$2,800 below market',
          valueClass: 'great',
          intro: "Here's the <strong>2022 BMW X5 xDrive40i</strong> in <strong>Phytonic Blue</strong> — M Sport package, <strong>head-up display</strong>, and 335 hp.",
          specs: [
            ['Engine', '3.0L Turbo I6'], ['Horsepower', '335 hp'], ['0–60 mph', '5.3 s'],
            ['Exterior', 'Phytonic Blue Metallic'], ['Drivetrain', 'xDrive AWD'], ['Year', '2022'], ['Mileage', '26,800 mi'],
            ['Head-Up Display', 'Yes'], ['MPG (comb.)', '23'],
          ],
          fit: 'Your benchmark — sportiest look in the group, strongest performance, and HUD standard on this trim. Closest to the "sporty midsize SUV" picture in your head.',
          watch: 'As a first-time buyer, factor insurance and maintenance above mainstream SUVs — worth it if performance and presence matter most.',
          chips: ['Is HUD easy to use?', 'Insurance for a first-time buyer?', 'Compare to the Audi Q5'],
        },
      },
      {
        key: 'q5',
        name: '2022 Audi Q5 Premium Plus',
        price: '$37,490',
        year: 2022,
        make: 'Audi',
        model: 'Q5',
        trim: 'Premium Plus',
        match: '94% match',
        location: 'Plano, TX',
        locationIcon: 'location-dot',
        trimLabel: 'Premium Plus · Daytona Gray · AWD SUV',
        warrantyBadge: 'Head-Up Display',
        specs: [
          { icon: 'palette', text: 'Daytona Gray' },
          { icon: 'gauge-high', text: '261 hp' },
          { icon: 'display', text: 'HUD' },
        ],
        expert: 'Edmunds ranks the Q5 among the best-handling compact-luxury SUVs — sharp <strong>Daytona Gray</strong> finish, Virtual Cockpit, and quattro grip without the X5 price step.',
        ownersRating: '4.6/5',
        ownersText: 'Praised for tech and all-weather confidence; slightly smaller than an X5 but still roomy for a first SUV.',
        compareMetrics: { price: 37490, mpg: 25, hp: 261, zero: 5.7, miles: 22400, distMin: 18, value: 2200 },
        drawer: {
          dealer: 'DriveClear Plano',
          distance: '18 min from Dallas',
          value: '$2,200 below market',
          valueClass: 'great',
          intro: "Here's the <strong>2022 Audi Q5 Premium Plus</strong> in <strong>Daytona Gray</strong> — HUD, quattro AWD, and a lower price than the X5.",
          specs: [
            ['Engine', '2.0L Turbo I4'], ['Horsepower', '261 hp'], ['0–60 mph', '5.7 s'],
            ['Exterior', 'Daytona Gray Pearl'], ['Drivetrain', 'quattro AWD'], ['Year', '2022'], ['Mileage', '22,400 mi'],
            ['Head-Up Display', 'Yes'], ['MPG (comb.)', '25'],
          ],
          fit: 'Best "similar to X5" alternative on tech and design — Virtual Cockpit plus HUD, quattro AWD, and about $13k less than the X5 on this lot.',
          watch: 'Less horsepower than the X5 or GV70 — test drive if straight-line punch is your top priority.',
          chips: ['X5 vs Q5 size?', 'How is the HUD?', 'Is quattro worth it?'],
        },
      },
      {
        key: 'gv70',
        name: '2022 Genesis GV70 2.5T',
        price: '$39,490',
        year: 2022,
        make: 'Genesis',
        model: 'GV70',
        trim: '2.5T Select',
        match: '96% match',
        location: 'Irving, TX',
        locationIcon: 'location-dot',
        trimLabel: '2.5T Select · Vik Black · AWD SUV',
        warrantyBadge: 'Head-Up Display',
        specs: [
          { icon: 'palette', text: 'Vik Black' },
          { icon: 'gauge-high', text: '300 hp' },
          { icon: 'display', text: 'HUD' },
        ],
        expert: 'MotorTrend calls the GV70 a "styling standout" — <strong>Vik Black</strong> coupe-like lines, 300 hp turbo four, and near-luxury cabin at a price that undercuts BMW and Audi.',
        ownersRating: '4.7/5',
        ownersText: 'First-time luxury buyers often cite the warranty and HUD as pleasant surprises; sportier than Volvo, less badge prestige than BMW.',
        compareMetrics: { price: 39490, mpg: 23, hp: 300, zero: 5.5, miles: 19200, distMin: 12, value: 3200 },
        drawer: {
          dealer: 'DriveClear Irving',
          distance: '12 min from Dallas',
          value: '$3,200 below market',
          valueClass: 'great',
          intro: "Here's the <strong>2022 Genesis GV70 2.5T</strong> in <strong>Vik Black</strong> — sportiest-looking alternative with <strong>HUD</strong>, 300 hp, and the lowest miles of the three.",
          specs: [
            ['Engine', '2.5L Turbo I4'], ['Horsepower', '300 hp'], ['0–60 mph', '5.5 s'],
            ['Exterior', 'Vik Black'], ['Drivetrain', 'AWD'], ['Year', '2022'], ['Mileage', '19,200 mi'],
            ['Head-Up Display', 'Yes'], ['MPG (comb.)', '23'],
          ],
          fit: 'Strong X5 alternative if you want sporty looks and 300 hp without fully stretching to BMW money — HUD included and lowest mileage here.',
          watch: 'Genesis resale trails BMW/Audi historically; great if you plan to keep it long-term.',
          chips: ['GV70 vs X5 feel?', 'Warranty for first-time buyers?', 'Schedule test drive'],
        },
      },
    ],
    // Prior ChatGPT conversation — seeds SRP "Ask ChatGPT" on load (facilitator can edit).
    srpChat: {
      openInAiMode: true,
      chips: [
        'Show BMW, Audi, or Genesis only',
        'Under $40k',
        'Lowest mileage first',
        '2022 only',
      ],
      messages: [
        {
          role: 'user',
          text: "I'm a first-time buyer — I want a sporty used midsize SUV with a head-up display. Something like a BMW X5 but open to similar options.",
        },
        {
          role: 'ai',
          html: 'Got it — <strong>sporty midsize SUV</strong> with <strong>HUD</strong> is a clear brief. The <strong>BMW X5</strong> is a strong anchor; <strong>Audi Q5</strong> and <strong>Genesis GV70</strong> are common alternates with HUD on the right trims.',
        },
        {
          role: 'user',
          text: '2022 or 2023, AWD, blue grey or black, Dallas area, under $55k. Good credit — around 6.9% APR.',
        },
        {
          role: 'ai',
          html: 'Perfect — I\'ll shop <strong>2022–2023 AWD SUVs</strong> around <strong>Dallas</strong>, <strong>under $55k</strong>, in <strong>blue, grey, or black</strong>, with <strong>HUD</strong> where listed. Three strong matches to start: <strong>X5</strong>, <strong>Q5</strong>, and <strong>GV70</strong>.',
        },
      ],
      resumeHtml: 'Picking up your <strong>ChatGPT</strong> conversation — I\'ve loaded those filters on DriveClear inventory. Your three shortlist SUVs should be in the results. Tell me what to tighten, e.g. <em>"Genesis only"</em> or <em>"under $40k."</em>',
    },
  },
};

// ── First-time buyer progress bar (OFF by default) ──
// Facilitator: copy into PARTICIPANT.homepage.buyingProgress to show on index.
// Keep steps realistic — educate on the normal used-car path, not gamified fluff.
const BUYING_PROGRESS_TEMPLATE = {
  eyebrow: 'DriveClear Assistant',
  title: 'First-Time Buyer Guide',
  summary: 'Most first-time buyers follow the same basic order. You\'re on <strong>step 3</strong> — compare your matches below.',
  currentStep: 2,
  steps: [
    {
      key: 'want',
      label: 'What car I want',
      status: 'done',
      aiTip: 'Start with <strong>body style, must-have features, and how you want it to feel</strong> — not the payment yet. Narrow to 2–3 models that fit before you shop every listing.',
      action: { label: 'Browse matches', href: 'srp.html' },
      chips: ['How do I narrow body style?', 'Why does HUD matter?'],
    },
    {
      key: 'afford',
      label: 'What can I afford',
      status: 'done',
      aiTip: 'Layer in <strong>total cost</strong>: price cap, monthly payment, insurance, and gas. Decide <strong>finance vs. cash</strong> and get pre-approved so you know your real number.',
      action: { label: 'Estimate payment', href: 'financing.html' },
      chips: ['Finance vs. pay cash?', 'What monthly can I afford?'],
    },
    {
      key: 'compare',
      label: 'Compare',
      status: 'current',
      aiTip: 'Start with a <strong>small shortlist (2–4 cars)</strong>, then compare finalists <strong>side-by-side</strong> on price, mileage, year, and features before you schedule test drives.',
      action: { label: 'Compare your picks', href: 'compare.html' },
      chips: ['Why only a few cars?', 'What do I look at first?', 'What should I compare first?'],
    },
    {
      key: 'drive',
      label: 'Test drive & purchase',
      status: 'upcoming',
      aiTip: 'Drive your <strong>top one or two</strong> picks. Confirm must-haves, get comfortable with how it drives, then finalize payment and paperwork.',
      action: { label: 'Schedule test drive', href: 'vdp.html?id=1' },
      chips: ['What to check on a test drive?'],
    },
  ],
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
    if (P.minYear && P.maxYear && P.maxYear > P.minYear) parts.push(`${P.minYear}–${P.maxYear}`);
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
  window.BUYING_PROGRESS_TEMPLATE = BUYING_PROGRESS_TEMPLATE;
}
