#!/usr/bin/env node
/**
 * Verify inventory matches participant intent in js/profile.js.
 * Mirrors SRP filter seeding in initSRP() (js/app.js).
 */
import { readFileSync } from 'fs';
import { createContext, runInContext } from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadDriveClear() {
  const sandbox = { window: {}, console };
  sandbox.window = sandbox;
  createContext(sandbox);
  runInContext(readFileSync(join(root, 'js/inventory.js'), 'utf8'), sandbox);
  runInContext(readFileSync(join(root, 'js/profile.js'), 'utf8'), sandbox);
  runInContext(`
    this.VEHICLES = typeof VEHICLES !== 'undefined' ? VEHICLES : [];
    this.findVehicleForPick = typeof findVehicleForPick !== 'undefined' ? findVehicleForPick : null;
    this.PARTICIPANT = typeof PARTICIPANT !== 'undefined' ? PARTICIPANT : {};
    this.Profile = typeof Profile !== 'undefined' ? Profile : null;
  `, sandbox);
  if (sandbox.Profile?.applyToInventory) sandbox.Profile.applyToInventory();
  return sandbox;
}

function vehicleDistance(v) {
  return ((v.id * 7) % 12) * 9 + 6;
}

function srpStateFromProfile(Profile) {
  const pp = Profile.toParams();
  return {
    make: [].concat(pp.make || []),
    body: pp.body ? [pp.body] : [],
    drive: pp.drive ? (Array.isArray(pp.drive) ? pp.drive : [pp.drive]) : [],
    minPrice: 0,
    maxPrice: pp.maxPrice || 50000,
    maxMiles: pp.maxMiles || 100000,
    minYear: pp.minYear || 2010,
    maxYear: pp.maxYear || 2024,
    minMpg: pp.minMpg || 0,
    maxDist: pp.maxDist || 0,
    query: '',
  };
}

function filterSRP(VEHICLES, state) {
  return VEHICLES.filter(v => {
    if (state.make.length && !state.make.includes(v.make)) return false;
    if (state.body.length && !state.body.includes(v.body)) return false;
    if (state.drive.length && !state.drive.includes(v.drivetrain)) return false;
    if (v.price < state.minPrice || v.price > state.maxPrice) return false;
    if (v.mileage > state.maxMiles) return false;
    if (v.year < state.minYear || v.year > state.maxYear) return false;
    if (state.minMpg && v.mpgHwy < state.minMpg) return false;
    if (state.maxDist && vehicleDistance(v) > state.maxDist) return false;
    if (state.query) {
      const haystack = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.body} ${v.extColor}`.toLowerCase();
      if (!haystack.includes(state.query)) return false;
    }
    return true;
  });
}

function buildSrpUrl(state) {
  const u = new URLSearchParams();
  state.make.forEach(m => u.append('make', m));
  state.body.forEach(b => u.set('body', b));
  state.drive.forEach(d => u.set('drive', d));
  if (state.maxPrice < 50000) u.set('maxPrice', state.maxPrice);
  if (state.maxMiles < 100000) u.set('maxMiles', state.maxMiles);
  if (state.minYear > 2010) u.set('minYear', state.minYear);
  if (state.maxYear < 2024) u.set('maxYear', state.maxYear);
  if (state.minMpg) u.set('minMpg', state.minMpg);
  if (state.maxDist) u.set('maxDist', state.maxDist);
  const qs = u.toString();
  return qs ? `srp.html?${qs}` : 'srp.html';
}

function summarizeVehicle(v) {
  return `${v.year} ${v.make} ${v.model} ${v.trim} · ${v.price} · ${v.mileage} mi`;
}

function checkHomepagePicks(PARTICIPANT, findVehicleForPick) {
  const picks = PARTICIPANT?.homepage?.picks || [];
  const resolved = [];
  const missing = [];
  picks.forEach(pick => {
    const v = findVehicleForPick(pick);
    if (v) resolved.push({ pick: pick.name || pick.key, vehicle: summarizeVehicle(v) });
    else missing.push(pick.name || pick.key || pick.key);
  });
  return { configured: picks.length, resolved: resolved.length, resolvedList: resolved, missing };
}

function suggestFixes(state, total) {
  const tips = [];
  if (state.make.length > 1) {
    tips.push('Multiple makes are OR-filtered on SRP — inventory may be thin if only a few rows match each make.');
  }
  if (state.maxPrice && state.maxPrice < 25000) {
    tips.push('Try raising maxPrice in profile.js — much of the lot is above $25k.');
  }
  if (state.body.length && state.body[0] === 'SUV' && state.maxPrice && state.maxPrice < 28000) {
    tips.push('SUV + tight budget: confirm inventory.js has enough SUVs under maxPrice.');
  }
  if (total === 0 && !state.make.length && !state.body.length && !state.maxPrice) {
    tips.push('Profile intent is empty — set body, makes, maxPrice, or needs[] in profile.js.');
  }
  return tips;
}

const sandbox = loadDriveClear();
const { VEHICLES, Profile, PARTICIPANT, findVehicleForPick } = sandbox;
const state = srpStateFromProfile(Profile);
const matches = filterSRP(VEHICLES, state);
const picks = checkHomepagePicks(PARTICIPANT, findVehicleForPick);
const hasIntent = Profile.hasData();
const minExpected = hasIntent ? 1 : 0;
const ok = matches.length >= minExpected && (!picks.configured || picks.resolved > 0 || !hasIntent);

const warnings = [];
if (hasIntent && matches.length === 0) {
  warnings.push('SRP would show 0 vehicles for the current profile intent.');
}
if (picks.configured && picks.missing.length) {
  warnings.push(`Homepage picks missing inventory: ${picks.missing.join(', ')}`);
}
if (hasIntent && matches.length > 0 && matches.length < 3) {
  warnings.push(`Only ${matches.length} SRP match(es) — participant may see a sparse grid.`);
}

const report = {
  ok,
  hasIntent,
  srpCount: matches.length,
  totalInventory: VEHICLES.length,
  srpUrl: buildSrpUrl(state),
  intent: Profile.toParams(),
  filters: state,
  samples: matches.slice(0, 5).map(summarizeVehicle),
  homepagePicks: picks,
  warnings,
  suggestions: matches.length === 0 ? suggestFixes(state, matches.length) : [],
};

const human = [
  ok ? 'PASS' : 'FAIL',
  `SRP: ${report.srpCount} vehicle(s) match participant intent`,
  report.hasIntent ? `Intent: ${JSON.stringify(report.intent)}` : 'Intent: (blank profile — no filters applied)',
  report.samples.length ? `Samples: ${report.samples.join(' | ')}` : '',
  picks.configured ? `Homepage picks: ${picks.resolved}/${picks.configured} resolved in inventory` : '',
  report.warnings.length ? `Warnings: ${report.warnings.join('; ')}` : '',
  `Refresh: http://127.0.0.1:8000/${report.srpUrl}`,
].filter(Boolean).join('\n');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(human);
}

process.exit(ok ? 0 : 1);
