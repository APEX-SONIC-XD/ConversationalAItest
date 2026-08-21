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
  maxPrice: null,
  maxApproved: null,
  maxMonthly: null,
  body: ['Sedan', 'SUV'],
  makes: ['Toyota', 'Subaru'],
  minYear: null,
  maxMiles: null,
  drivetrain: 'AWD',
  minMpg: 28,
  maxDist: null,

  needs: ['winter', 'snow', 'value', 'efficient', 'hybrid'],

  tradeIn: null,

  creditTier: null,
  journeyStage: 'Prepared',

  // ── Market / region (inventory lot cities, distance context) ──
  // Facilitator: set label + lotCities when participant is shopping in a new area.
  market: {
    label: 'Rochester, NY',
    lotCities: [
      'Rochester, NY',
      'Henrietta, NY',
      'Greece, NY',
      'Webster, NY',
      'Pittsford, NY',
      'Irondequoit, NY',
      'Brighton, NY',
      'Victor, NY',
    ],
    locations: [
      { city: 'Rochester, NY', name: 'DriveClear Rochester', address: '120 East Ave', zip: '14604', lat: 43.1566, lng: -77.6088 },
      { city: 'Henrietta, NY', name: 'DriveClear Henrietta', address: '2280 W Henrietta Rd', zip: '14623', lat: 43.0592, lng: -77.6120 },
      { city: 'Greece, NY', name: 'DriveClear Greece', address: '4100 W Ridge Rd', zip: '14626', lat: 43.2597, lng: -77.7047 },
      { city: 'Webster, NY', name: 'DriveClear Webster', address: '980 Ridge Rd', zip: '14580', lat: 43.2123, lng: -77.4299 },
      { city: 'Pittsford, NY', name: 'DriveClear Pittsford', address: '3220 Monroe Ave', zip: '14534', lat: 43.0906, lng: -77.5150 },
      { city: 'Irondequoit, NY', name: 'DriveClear Irondequoit', address: '1800 East Ridge Rd', zip: '14617', lat: 43.2134, lng: -77.5792 },
      { city: 'Brighton, NY', name: 'DriveClear Brighton', address: '1900 Monroe Ave', zip: '14618', lat: 43.1476, lng: -77.5564 },
      { city: 'Victor, NY', name: 'DriveClear Victor', address: '7507 Main St', zip: '14564', lat: 42.9820, lng: -77.4089 },
      { city: 'Fairport, NY', name: 'DriveClear Fairport', address: '675 Moseley Rd', zip: '14450', lat: 43.0998, lng: -77.4436 },
      { city: 'Penfield, NY', name: 'DriveClear Penfield', address: '1800 Panorama Trail', zip: '14526', lat: 43.1304, lng: -77.4754 },
      { city: 'Gates, NY', name: 'DriveClear Gates', address: '2200 Buffalo Rd', zip: '14624', lat: 43.1511, lng: -77.7042 },
      { city: 'Canandaigua, NY', name: 'DriveClear Canandaigua', address: '3295 Rochester Rd', zip: '14424', lat: 42.8876, lng: -77.2815 },
      { city: 'Brockport, NY', name: 'DriveClear Brockport', address: '3600 W Ridge Rd', zip: '14420', lat: 43.2137, lng: -77.9361 },
      { city: 'Syracuse, NY', name: 'DriveClear Syracuse', address: '3700 W Genesee St', zip: '13219', lat: 43.0481, lng: -76.1474 },
      { city: 'Buffalo, NY', name: 'DriveClear Buffalo', address: '4400 Transit Rd', zip: '14221', lat: 42.9634, lng: -78.6978 },
      { city: 'Albany, NY', name: 'DriveClear Albany', address: '1200 Central Ave', zip: '12205', lat: 42.7170, lng: -73.8686 },
    ],
  },

  // ── Homepage AI recommendations (index.html) ──
  // Facilitator: edit display copy here — name, price, expert blurbs, drawer text.
  // VDP link (optional): set year + make + model, or vdpId as fallback.
  homepage: {
    titleAccent: 'DriveClear Rochester',
    appointment: null,
    dealerAddress: null,
    criteriaText: 'Toyota Corolla Hybrid AWD — compact, efficient, and snow-capable for Rochester without a budget-brand trade-off',
    footText: 'Three AWD sedans for Rochester — Corolla Hybrid, Impreza, and Legacy.',
    footLinkText: 'See all hybrid & AWD sedan matches →',
    footLinkHref: 'srp.html?make=Toyota&make=Subaru&body=Sedan&body=SUV&drive=AWD&minMpg=28',
    compare: {
      title: 'Corolla Hybrid AWD vs. Subaru sedans',
      subtitle: 'Your shortlist compared on price, fuel economy, below-market savings, and snow-ready AWD — Corolla Hybrid, Impreza, and Legacy.',
      footDefault: 'Corolla Hybrid AWD leads on mpg — Impreza and Legacy trade efficiency for standard Subaru AWD and more cabin room.',
    },
    picks: [
      {
        key: 'corolla-23-hybrid-awd',
        name: '2023 Toyota Corolla LE Hybrid AWD',
        price: '$26,488',
        year: 2023,
        make: 'Toyota',
        model: 'Corolla',
        trim: 'LE',
        match: 'Your pick',
        trimLabel: 'LE · Hybrid AWD · 50+ mpg',
        specs: [
          { icon: 'road', text: '22,400 mi' },
          { icon: 'leaf', text: '50 mpg comb.' },
          { icon: 'snowflake', text: 'Hybrid AWD' },
        ],
        provenance: {
          headline: 'Off-lease return',
          detail: 'Toyota Financial Services lease return — not a rental or fleet car. Single lessee, personal-use lease in upstate NY.',
        },
        expert: 'Exactly what you asked for — Corolla LE Hybrid AWD for Rochester snow and the lowest running costs on this list.',
        ownersRating: '4.8/5',
        ownersText: 'Owners love the hybrid mpg with AWD confidence in winter; one-owner and accident-free.',
        compareMetrics: { price: 26488, mpg: 50, hp: 138, zero: 9.6, miles: 22400, distMin: 3, value: 1100 },
        drawer: {
          dealer: 'DriveClear Rochester',
          value: '$1,100 below market',
          valueClass: 'great',
          intro: 'Your match — <strong>2023 Toyota Corolla LE Hybrid AWD</strong> with Toyota Safety Sense 3.0, heated seats, and ~50 mpg combined.',
          specs: [
            ['Mileage', '22,400 mi'],
            ['Drivetrain', 'Hybrid AWD'],
            ['MPG (comb.)', '50 MPG'],
            ['Horsepower', '138 hp'],
            ['0–60 mph', '9.6 s'],
            ['Engine', '1.8L Hybrid 4-Cyl'],
            ['Prior use', 'Off-lease return'],
            ['Source', 'Toyota Financial Services'],
          ],
          fit: 'Smallest footprint here with the best fuel economy — off-lease but not a rental, with hybrid AWD for Rochester winters.',
          watch: 'Compact sedan — compare Impreza and Legacy if you want more back-seat room.',
          chips: ['Was this a rental?', 'Off-lease vs personal?', 'Compare all three'],
        },
      },
      {
        key: 'impreza-22-prem',
        name: '2022 Subaru Impreza Premium',
        price: '$27,488',
        year: 2022,
        make: 'Subaru',
        model: 'Impreza',
        trim: 'Premium',
        match: 'Subaru AWD',
        trimLabel: 'Compact sedan · Symmetrical AWD · EyeSight',
        specs: [
          { icon: 'road', text: '23,800 mi' },
          { icon: 'snowflake', text: 'Symmetrical AWD' },
          { icon: 'arrow-trend-down', text: '$1,300 below market' },
        ],
        provenance: {
          headline: 'Personal trade-in',
          detail: 'Local Rochester owner — never leased, rented, or fleet-owned. One private owner on Carfax.',
        },
        expert: 'Compact Subaru AWD sedan — same snow-belt formula as the Legacy in a smaller, easier-to-park package.',
        ownersRating: '4.7/5',
        ownersText: 'Impreza owners like the smaller size for city streets with full-time AWD — strong snow-belt pick.',
        compareMetrics: { price: 27488, mpg: 32, hp: 182, zero: 9.0, miles: 23800, distMin: 10, value: 1300 },
        drawer: {
          dealer: 'DriveClear · Irondequoit',
          value: '$1,300 below market',
          valueClass: 'great',
          intro: 'Subaru compact — <strong>2022 Impreza Premium AWD</strong> with EyeSight and all-weather package.',
          specs: [
            ['Mileage', '23,800 mi'],
            ['Drivetrain', 'AWD'],
            ['MPG (comb.)', '32 MPG'],
            ['Horsepower', '182 hp'],
            ['0–60 mph', '9.0 s'],
            ['Engine', '2.5L 4-Cyl'],
            ['Prior use', 'Personal trade-in'],
            ['Source', 'Local Rochester owner'],
          ],
          fit: 'Smallest Subaru here — personal-use trade-in, not lease or rental, with standard AWD and EyeSight.',
          watch: 'Less rear seat room than Legacy — worth it if compact size matters more.',
          chips: ['Impreza vs Legacy?', 'Impreza vs Corolla?', 'Compare all three'],
        },
      },
      {
        key: 'legacy-22-prem',
        name: '2022 Subaru Legacy Premium',
        price: '$27,988',
        year: 2022,
        make: 'Subaru',
        model: 'Legacy',
        trim: 'Premium',
        match: 'Roomier Subaru',
        trimLabel: 'Midsize sedan · Symmetrical AWD · EyeSight',
        specs: [
          { icon: 'road', text: '26,500 mi' },
          { icon: 'snowflake', text: 'Symmetrical AWD' },
          { icon: 'arrow-trend-down', text: '$1,500 below market' },
        ],
        provenance: {
          headline: 'Off-lease return',
          detail: 'Subaru Motors Finance off-lease from Syracuse area — not a rental. Single lessee, personal-use lease.',
        },
        expert: 'Subaru\'s discontinued snow-belt sedan — standard AWD and EyeSight with more cabin room than the Impreza, used only on this lot.',
        ownersRating: '4.7/5',
        ownersText: 'Legacy owners in upstate NY praise winter traction and visibility; less mpg than the Corolla Hybrid but confident in lake-effect snow.',
        compareMetrics: { price: 27988, mpg: 31, hp: 182, zero: 8.5, miles: 26500, distMin: 7, value: 1500 },
        drawer: {
          dealer: 'DriveClear · Pittsford',
          value: '$1,500 below market',
          valueClass: 'great',
          intro: 'Subaru midsize — <strong>2022 Legacy Premium AWD</strong> with EyeSight, heated seats, and all-weather package.',
          specs: [
            ['Mileage', '26,500 mi'],
            ['Drivetrain', 'AWD'],
            ['MPG (comb.)', '31 MPG'],
            ['Horsepower', '182 hp'],
            ['0–60 mph', '8.5 s'],
            ['Engine', '2.5L 4-Cyl'],
            ['Prior use', 'Off-lease return'],
            ['Source', 'Subaru Motors Finance'],
          ],
          fit: 'Used Legacy — off-lease but not a rental; Subaru discontinued this model so only pre-owned examples remain.',
          watch: 'Gas mpg trails the Corolla Hybrid; worth it if you want a roomier sedan and Subaru AWD.',
          chips: ['Legacy vs Impreza?', 'Legacy in snow?', 'Compare all three'],
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
  hybrid:    { minMpg: 40 },
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
    if (PARTICIPANT.body) {
      P.body = Array.isArray(PARTICIPANT.body)
        ? (PARTICIPANT.body.length === 1 ? PARTICIPANT.body[0] : PARTICIPANT.body.slice())
        : PARTICIPANT.body;
    }
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
    if (Array.isArray(P.body) && P.body.length) {
      const labels = P.body.map(b => {
        if (b === 'SUV') return 'compact SUVs';
        if (b === 'Sedan') return 'sedans';
        return String(b).toLowerCase() + 's';
      });
      parts.push(labels.join(' or '));
    } else if (P.body === 'SUV') parts.push('SUVs');
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

  dealerLocations() {
    const m = PARTICIPANT.market;
    if (m && m.locations && m.locations.length) return m.locations.slice();
    const cities = this.lotLocations() || [];
    return cities.map(city => ({
      city,
      name: `DriveClear ${String(city).split(',')[0].trim()}`,
      address: '',
      zip: '',
      lat: 43.1566,
      lng: -77.6088,
    }));
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
