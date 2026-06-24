/* ============================================================
   DriveClear — BLANK participant profile (copy into profile.js)
   ------------------------------------------------------------
   Between live sessions: replace the PARTICIPANT object in profile.js
   with this structure, then fill in only what the participant stated.

   Facilitator prompt:
     Update js/profile.js only for this participant:
     - Intent fields + homepage block (picks with name, price, copy;
       year/make/model for VDP link; appointment + dealerAddress)
     - market.label + market.lotCities for inventory locations site-wide
     Don't edit HTML or app.js.
   ============================================================ */

const PARTICIPANT = {
  maxPrice: null,
  maxApproved: null,
  maxMonthly: null,
  body: null,
  makes: [],
  minYear: null,
  maxMiles: null,
  drivetrain: null,
  minMpg: null,
  maxDist: null,

  needs: [],

  tradeIn: null,

  creditTier: null,
  journeyStage: null,

  market: {
    label: null,
    lotCities: [],
  },

  homepage: {
    titleAccent: null,
    appointment: null,
    dealerAddress: null,
    criteriaText: null,
    footText: null,
    footLinkText: null,
    footLinkHref: null,
    compare: {
      title: null,
      subtitle: null,
      footDefault: null,
    },
    picks: [],
  },
};
