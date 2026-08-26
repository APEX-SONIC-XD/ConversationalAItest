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
  maxPrice: 95000,
  maxApproved: null,
  maxMonthly: null,
  body: 'Coupe',
  makes: ['Chevrolet'],
  model: 'Corvette',
  trim: 'Stingray',
  minYear: 2022,
  maxYear: 2026,
  maxMiles: null,
  drivetrain: 'RWD',
  minMpg: null,
  maxDist: null,

  needs: ['sporty', 'comfort', 'reliable'],

  tradeIn: null,

  creditTier: null,
  journeyStage: 'Prepared',

  // ── Market / region (inventory lot cities, distance context) ──
  // Facilitator: set label + lotCities when participant is shopping in a new area.
  market: {
    label: 'Dallas, TX',
    lotCities: [
      'Dallas, TX', 'Fort Worth, TX', 'Plano, TX', 'Irving, TX',
      'Arlington, TX', 'Frisco, TX', 'Garland, TX', 'McKinney, TX',
      'Carrollton, TX', 'Richardson, TX',
    ],
    partnerLots: [],
  },

  // ── Homepage AI recommendations (index.html) ──
  // Facilitator: edit display copy here — name, price, expert blurbs, drawer text.
  // VDP link (optional): set year + make + model, or vdpId as fallback.
  homepage: {
    titleAccent: 'DriveClear Dallas',
    appointment: null,
    dealerAddress: '4821 Lyndon B Johnson Fwy · Dallas, TX',
    criteriaText: 'a Corvette Stingray for retirement — your Sunday drive car, with reliability and total upkeep in mind',
    footText: 'Ranked for fit, expert reviews, owner sentiment, and estimated repair/maintenance cost — not just sticker price.',
    footLinkText: 'See Corvette & weekend coupes →',
    footLinkHref: 'srp.html?make=Chevrolet&model=Corvette&trim=Stingray&body=Coupe&drive=RWD&minYear=2022&maxYear=2026&maxPrice=95000&condition=new&condition=used&region=DFW',
    insightSources: {
      overview: ['Car and Driver', 'Edmunds owner reviews', 'RepairPal', 'Kelley Blue Book', 'DriveClear DFW listings'],
      expert: ['Car and Driver', 'MotorTrend', 'Edmunds'],
      owners: ['Edmunds owner reviews', 'J.D. Power'],
      reliability: ['RepairPal', 'Edmunds reliability data'],
      market: ['Kelley Blue Book', 'CarGurus', 'DriveClear DFW listings'],
      corvette: ['Chevrolet specs', 'Car and Driver', 'RepairPal', 'Edmunds owner reviews'],
      compare: ['DriveClear inventory', 'Kelley Blue Book', 'RepairPal', 'Edmunds owner reviews'],
      financeNumbers: ['Your pre-qual profile', 'DriveClear payment calculator'],
      financeLenders: ['DriveClear lender network', 'NHTSA lender disclosures'],
      financeQuestions: ['CFPB auto finance guides', 'DriveClear dealer playbook'],
      tradeOffer: ['Kelley Blue Book', 'Edmunds', 'DriveClear appraisal model'],
      tradeTiming: ['Kelley Blue Book depreciation curves', 'DriveClear market demand index'],
      tradeCompare: ['Kelley Blue Book', 'Edmunds private-party values', 'Texas tax savings tables'],
      testDriveVisit: ['DriveClear listing', 'Carfax', 'Dealer service records'],
      testDriveTips: ['NHTSA', 'Car and Driver', 'DriveClear test-drive checklist'],
      testDrivePlans: ['DriveClear route data', 'DFW traffic patterns'],
      listing: ['DriveClear listing', 'Carfax', 'RepairPal'],
    },
    compare: {
      title: 'Three Stingrays in the Dallas area',
      subtitle: 'Side-by-side on price, power, mileage, <strong>reliability</strong>, and <strong>5-year maintenance</strong> — all in stock across Dallas–Fort Worth.',
      footDefault: 'The 2024 new Stingray leads on warranty; the 2022 1LT is the value play; the used 2024 2LT splits trim and miles at a lower price — all within the Dallas metro.',
    },
    picks: [
      {
        key: 'corvette-24-new',
        name: '2024 Chevrolet Corvette Stingray 2LT',
        price: '$82,490',
        year: 2024,
        make: 'Chevrolet',
        model: 'Corvette',
        trim: 'Stingray 2LT',
        vdpId: 421,
        match: 'Brand new',
        trimLabel: 'Stingray 2LT · New · 495 hp',
        warrantyBadge: 'Factory warranty',
        specs: [
          { icon: 'sparkles', text: '18 mi · new' },
          { icon: 'gauge-high', text: '495 hp V8' },
          { icon: 'star', text: '4.2/5 reliability' },
          { icon: 'wrench', text: '~$2.8k/yr upkeep' },
        ],
        expert: 'The newest Stingray on our Dallas lot — delivery miles only, full factory warranty, wireless CarPlay, GT2 seats, and front lift. Highest purchase price here, but warranty covers most repair risk early on.',
        ownersRating: '4.2/5',
        ownersText: 'Early C8 reliability is solid when maintained — owners flag premium tires and Z51 brake wear as the main upkeep costs, not engine issues.',
        compareMetrics: { price: 82490, mpg: 24, hp: 495, zero: 2.9, miles: 18, distMin: 0, value: 0, reliability: 4.2, tco5yr: 14200 },
        drawer: {
          value: 'MSRP-aligned · new',
          valueClass: 'at',
          intro: 'Brand-new <strong>2024 Chevrolet Corvette Stingray 2LT</strong> — 18 delivery miles, full GM warranty, revised interior, wireless CarPlay, GT2 seats, and front lift.',
          specs: [
            ['Condition', 'Brand new · 18 mi'],
            ['Engine', '6.2L V8 LT2 · 495 hp'],
            ['Drivetrain', 'RWD · 8-speed DCT'],
            ['Warranty', 'Full factory coverage · bumper + powertrain'],
            ['Reliability', '4.2/5 · on par with sports-car segment avg'],
            ['5-yr maint. est.', '~$14,200 · tires, brakes, fluids, service'],
            ['Highlights', 'Wireless CarPlay · HUD · front lift · magnetic ride'],
            ['History', 'No prior owner · dealer new stock'],
          ],
          fit: 'If you want the latest C8 interior and the lowest repair risk in the first years — warranty carries most of the ownership bet.',
          watch: 'Premium fuel and Z51 tires/brakes run about <strong>$2,800/yr</strong> in upkeep even with warranty — plan for that on top of the payment.',
          chips: ['What does warranty cover?', '5-year upkeep vs 2022?', 'Is the C8 reliable long-term?'],
        },
      },
      {
        key: 'corvette-22-stingray',
        name: '2022 Chevrolet Corvette Stingray 1LT',
        price: '$68,990',
        year: 2022,
        make: 'Chevrolet',
        model: 'Corvette',
        trim: 'Stingray 1LT',
        vdpId: 391,
        match: 'Best value',
        trimLabel: 'Stingray 1LT · Used · 495 hp',
        specs: [
          { icon: 'road', text: '12,400 mi' },
          { icon: 'gauge-high', text: '495 hp V8' },
          { icon: 'star', text: '4.4/5 reliability' },
          { icon: 'wrench', text: '~$1.4k/yr upkeep' },
        ],
        expert: 'Same mid-engine 495 hp Stingray experience at the lowest price in the Dallas area — magnetic ride, clean one-owner history, and strong owner reliability scores. Factory bumper-to-bumper has likely expired; budget for service.',
        ownersRating: '4.4/5',
        ownersText: 'Owners praise LT2 durability when serviced on schedule — magnetic ride and DCT fluid changes are the items to watch, not major engine failures.',
        compareMetrics: { price: 68990, mpg: 24, hp: 495, zero: 2.9, miles: 12400, distMin: 0, value: 3200, reliability: 4.4, tco5yr: 16200 },
        drawer: {
          value: '$3,200 below market',
          valueClass: 'great',
          intro: 'Low-mile <strong>2022 Chevrolet Corvette Stingray 1LT</strong> — 495 hp mid-engine V8, magnetic ride, GT1 seats, and clean one-owner history.',
          specs: [
            ['Engine', '6.2L V8 LT2 · 495 hp'],
            ['Drivetrain', 'RWD · 8-speed DCT'],
            ['Mileage', '12,400 mi'],
            ['0–60 mph', '2.9 sec'],
            ['Reliability', '4.4/5 · strong owner track record on C8'],
            ['5-yr maint. est.', '~$16,200 · incl. post-warranty service'],
            ['Highlights', 'Magnetic Ride · Performance Data Recorder · Brembo brakes'],
            ['History', '1 owner · accident-free'],
          ],
          fit: 'The value play — same Stingray soul, roughly $13,500 less than the new 2024, with proven reliability when maintained.',
          watch: 'At 12,400 mi the bumper-to-bumper warranty is likely done — plan ~<strong>$1,400/yr</strong> for service, tires, and brakes; magnetic ride and DCT service are the big-ticket items.',
          chips: ['What maintenance is due?', '2022 vs new on upkeep?', 'Compare all three'],
        },
      },
      {
        key: 'corvette-24-dallas-2lt',
        name: '2024 Chevrolet Corvette Stingray 2LT',
        price: '$78,090',
        year: 2024,
        make: 'Chevrolet',
        model: 'Corvette',
        trim: 'Stingray 2LT',
        vdpId: 411,
        match: 'Low-mile 2LT',
        trimLabel: 'Stingray 2LT · Torch Red · 495 hp',
        specs: [
          { icon: 'road', text: '8,000 mi' },
          { icon: 'gauge-high', text: '495 hp V8' },
          { icon: 'star', text: '4.3/5 reliability' },
          { icon: 'wrench', text: '~$1.6k/yr upkeep' },
        ],
        expert: 'Low-mile 2024 2LT on our Dallas–Fort Worth network — same revised interior and 2LT content as the new Stingray, but roughly $4,400 less and still under factory warranty at 8,000 miles.',
        ownersRating: '4.3/5',
        ownersText: 'One-owner, accident-free 2LT with GT2 seats, HUD, and front lift — owners like the balance of modern C8 features without new-car premium.',
        compareMetrics: { price: 78090, mpg: 24, hp: 495, zero: 2.9, miles: 8000, distMin: 0, value: 2100, reliability: 4.3, tco5yr: 15500 },
        drawer: {
          value: '$2,100 below market',
          valueClass: 'great',
          dealer: 'DriveClear Dallas',
          distance: 'Dallas–Fort Worth area',
          intro: 'Nearly new <strong>2024 Chevrolet Corvette Stingray 2LT</strong> — Torch Red, 8,000 miles, wireless CarPlay, GT2 seats, HUD, and front lift.',
          specs: [
            ['Location', 'Dallas–Fort Worth area'],
            ['Engine', '6.2L V8 LT2 · 495 hp'],
            ['Drivetrain', 'RWD · 8-speed DCT'],
            ['Mileage', '8,000 mi'],
            ['Reliability', '4.3/5 · one owner · accident-free'],
            ['5-yr maint. est.', '~$15,500 · warranty still active'],
            ['Highlights', 'GT2 seats · HUD · front lift · magnetic ride'],
            ['History', '1 owner · accident-free'],
          ],
          fit: 'If you want 2LT trim and low miles without paying for a brand-new unit — strong option in the Dallas metro.',
          watch: 'Confirm service records and remaining factory warranty at 8,000 mi — plan for Z51 tire and brake wear on weekend drives.',
          chips: ['2LT vs new 2024?', 'Which DFW lot?', 'Compare all three'],
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
    if (PARTICIPANT.model) P.model = PARTICIPANT.model;
    if (PARTICIPANT.trim) P.trim = PARTICIPANT.trim;
    if (PARTICIPANT.conditions && PARTICIPANT.conditions.length) {
      P.condition = PARTICIPANT.conditions.slice();
    } else {
      P.condition = ['new', 'used'];
    }
    const cities = this.lotLocations();
    if (cities && cities.length) {
      P.locations = cities.slice();
      P.region = 'DFW';
    }
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
    if (needs.some(n => /reliab|depend|trust|last|maint|upkeep|tco|repair/.test(n))) { add('reliability'); add('tco5yr'); }
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

  partnerLots() {
    const m = PARTICIPANT.market;
    return (m && m.partnerLots && m.partnerLots.length) ? m.partnerLots.slice() : [];
  },

  partnerLotCities() {
    return this.partnerLots().map(p => p.city).filter(Boolean);
  },

  applyToInventory() {
    const cities = this.lotLocations();
    if (!cities || !cities.length || typeof VEHICLES === 'undefined') return;
    VEHICLES.forEach((v, i) => {
      v.location = cities[i % cities.length];
    });
  },

  syncPickLocations() {
    if (typeof VEHICLES === 'undefined') return;
    const picks = PARTICIPANT.homepage && PARTICIPANT.homepage.picks;
    if (picks && picks.length) {
      picks.forEach(pick => {
        if (!pick || !pick.location || pick.vdpId == null) return;
        const v = VEHICLES.find(x => x.id === parseInt(pick.vdpId, 10));
        if (!v) return;
        v.location = pick.location;
        v.pinLocation = true;
        if (pick.drawer && pick.drawer.dealer) v.dealerName = pick.drawer.dealer;
      });
    }
    this.partnerLots().forEach(partner => {
      if (partner.vdpId == null || !partner.city) return;
      const v = VEHICLES.find(x => x.id === parseInt(partner.vdpId, 10));
      if (!v) return;
      v.location = partner.city;
      v.pinLocation = true;
      if (partner.dealer) v.dealerName = partner.dealer;
    });
  },

  vehicleLocation(v) {
    if (!v) return '';
    if (v.location) return v.location;
    const partner = this.partnerLots().find(p => p.vdpId === v.id);
    return partner ? partner.city : '';
  },

  pickLocation(pick) {
    if (!pick) return 'In stock';
    if (pick.location) return pick.location;
    if (pick.vdpId != null && typeof VEHICLES !== 'undefined') {
      const v = VEHICLES.find(x => x.id === parseInt(pick.vdpId, 10));
      const loc = this.vehicleLocation(v);
      if (loc) return loc;
    }
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
    if (P.model) q.set('model', P.model);
    if (P.trim) q.set('trim', P.trim);
    if (P.minYear) q.set('minYear', P.minYear);
    if (P.maxYear) q.set('maxYear', P.maxYear);
    if (P.maxPrice) q.set('maxPrice', P.maxPrice);
    if (Array.isArray(P.make) && P.make.length === 1) q.set('make', P.make[0]);
    else if (P.make) q.set('make', P.make);
    [].concat(P.condition || []).forEach(c => q.append('condition', c));
    if (P.region) q.set('region', P.region);
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
      const inv = (typeof findVehicleForPick === 'function') ? findVehicleForPick(pick) : null;
      const location = pick.location || (inv && inv.location) || '';
      const specMap = Object.fromEntries((d.specs || []).map(row => [row[0], row[1]]));
      const priceFromLabel = parseInt(String(pick.price || '').replace(/\D/g, ''), 10);
      const shortName = String(pick.name || pick.key).replace(/^\d{4}\s+/, '');
      return {
        key: pick.key,
        col: i + 1,
        name: shortName,
        displayName: pick.name || shortName,
        trimLabel: pick.trimLabel || '',
        dealer: d.dealer || (inv && inv.dealerName) || (location ? `DriveClear ${location.split(',')[0].trim()}` : '—'),
        location,
        distance: location || this.pickLocation(pick),
        price: cm.price != null ? cm.price : (priceFromLabel || 0),
        mpg: cm.mpg != null ? cm.mpg : parseInt(String(specMap['MPG (comb.)'] || '0'), 10),
        hp: cm.hp != null ? cm.hp : parseInt(String(specMap['Horsepower'] || '0'), 10),
        zero: cm.zero != null ? cm.zero : parseFloat(String(specMap['0–60 mph'] || specMap['0-60 mph'] || '0').replace(/[^\d.]/g, '')) || 0,
        miles: cm.miles != null ? cm.miles : parseInt(String(specMap['Mileage'] || '0').replace(/\D/g, ''), 10),
        distMin: cm.distMin != null ? cm.distMin : 0,
        value: cm.value != null ? cm.value : 0,
        reliability: cm.reliability != null ? cm.reliability : 0,
        tco5yr: cm.tco5yr != null ? cm.tco5yr : 0,
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
