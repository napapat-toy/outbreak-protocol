import {
  ACTIONS,
  COLLAPSE_FRACTION,
  PROVINCES,
  RESEARCH_COST,
} from './constants';
import {
  applyAction,
  calculateGrade,
  freshState,
  investResearch,
  simulateTick,
} from './simulation';

describe('Simulation Engine', () => {
  describe('freshState', () => {
    it('creates initial state with correct values for lab province', () => {
      const state = freshState('bkk', 'flu');
      expect(state.day).toBe(0);
      expect(state.budget).toBe(100);
      expect(state.ended).toBe(false);
      expect(state.vaccineReady).toBe(false);
      expect(state.research).toBe(0);

      const bkk = state.provinces['bkk'];
      expect(bkk.infected).toBeGreaterThan(20);
      expect(bkk.recovered).toBe(0);
      expect(bkk.dead).toBe(0);
      expect(bkk.vaccinated).toBe(0);
      expect(bkk.rioting).toBe(false);
      expect(bkk.collapsed).toBe(false);

      // Other provinces should have 0 infected initially
      const non = state.provinces['non'];
      expect(non.infected).toBe(0);
    });

    it('sets initial budget and daily gain based on difficulty', () => {
      const casualState = freshState('bkk', 'flu', 'casual');
      expect(casualState.budget).toBe(160);
      const casualTick = simulateTick(casualState);
      expect(casualTick.nextState.budget).toBe(160 + 18);

      const crisisState = freshState('bkk', 'flu', 'crisis');
      expect(crisisState.budget).toBe(75);
      const crisisTick = simulateTick(crisisState);
      expect(crisisTick.nextState.budget).toBe(75 + 9);
    });
  });

  describe('Player Actions', () => {
    it('applies action if budget is sufficient', () => {
      const state = freshState('bkk', 'flu');
      const actionKey = 'health';
      const result = applyAction(state, 'bkk', actionKey);

      expect(result.success).toBe(true);
      expect(result.nextState.budget).toBe(100 - ACTIONS[actionKey].cost);
      expect(result.nextState.provinces['bkk'].measures[actionKey]).toBe(
        ACTIONS[actionKey].duration
      );
    });

    it('rejects action if budget is insufficient', () => {
      const baseState = freshState('bkk', 'flu');
      const state = { ...baseState, budget: 10 }; // not enough for 15G
      const result = applyAction(state, 'bkk', 'health');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('งบประมาณไม่เพียงพอ');
    });

    it('rejects action if province is rioting', () => {
      const state = freshState('bkk', 'flu');
      state.provinces['bkk'].rioting = true;
      const result = applyAction(state, 'bkk', 'health');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('จลาจล');
    });

    it('invests in research and triggers vaccineReady when reaching 100', () => {
      const state = freshState('bkk', 'flu');
      state.research = 95;
      state.budget = 50;

      const result = investResearch(state);
      expect(result.success).toBe(true);
      expect(result.nextState.budget).toBe(50 - RESEARCH_COST);
      expect(result.nextState.research).toBe(100);
      expect(result.nextState.vaccineReady).toBe(true);
    });
  });

  describe('Simulation Tick', () => {
    it('advances day and increments budget by DAILY_BUDGET_GAIN', () => {
      const state = freshState('bkk', 'flu');
      const { nextState } = simulateTick(state);

      expect(nextState.day).toBe(1);
      expect(nextState.budget).toBe(100 + 12);
      expect(nextState.history.length).toBe(2);
    });

    it('spreads infection locally and to adjacent provinces', () => {
      const state = freshState('bkk', 'flu');
      const tick1 = simulateTick(state);
      const tick2 = simulateTick(tick1.nextState);

      // Connected provinces to BKK (e.g. Nonthaburi, Samut Prakan) should start getting infected
      const nonInfected = tick2.nextState.provinces['non'].infected;
      const spkInfected = tick2.nextState.provinces['spk'].infected;
      expect(nonInfected).toBeGreaterThan(0);
      expect(spkInfected).toBeGreaterThan(0);
    });

    it('rolls out vaccine when vaccineReady is true', () => {
      const state = freshState('bkk', 'flu');
      state.vaccineReady = true;

      const { nextState } = simulateTick(state);
      const bkk = nextState.provinces['bkk'];
      expect(bkk.vaccinated).toBeGreaterThan(0);
    });

    it('triggers collapse when death fraction exceeds COLLAPSE_FRACTION', () => {
      const state = freshState('bkk', 'flu');
      const bkkPop = PROVINCES.find((p) => p.id === 'bkk')!.pop;
      state.provinces['bkk'].dead = Math.round(bkkPop * COLLAPSE_FRACTION) + 10;

      const { nextState } = simulateTick(state);
      expect(nextState.provinces['bkk'].collapsed).toBe(true);
      expect(nextState.provinces['bkk'].infected).toBe(0);
    });
  });

  describe('End-game conditions & Grading', () => {
    it('triggers riot collapse defeat if 4 or more provinces riot', () => {
      const state = freshState('bkk', 'flu');
      // Set 4 provinces to unrest >= 70 so rioting is sustained
      state.provinces['bkk'].unrest = 80;
      state.provinces['non'].unrest = 80;
      state.provinces['ptt'].unrest = 80;
      state.provinces['spk'].unrest = 80;

      const { nextState } = simulateTick(state);
      expect(nextState.ended).toBe(true);
      expect(nextState.endResult?.type).toBe('riot_collapse');
      expect(nextState.endResult?.won).toBe(false);
    });

    it('triggers death fraction lose if total dead >= 95%', () => {
      const state = freshState('bkk', 'flu');
      // Distribute deaths so total region dead >= 95%
      for (const p of PROVINCES) {
        state.provinces[p.id].dead = Math.round(p.pop * 0.96);
      }

      const { nextState } = simulateTick(state);
      expect(nextState.ended).toBe(true);
      expect(nextState.endResult?.type).toBe('death_fraction');
      expect(nextState.endResult?.won).toBe(false);
    });

    it('triggers instant crisis lose if active fraction > 85%', () => {
      const state = freshState('bkk', 'flu');
      // Give overwhelming infection across provinces
      for (const p of PROVINCES) {
        state.provinces[p.id].infected = Math.round(p.pop * 0.90);
      }

      const { nextState } = simulateTick(state);
      expect(nextState.ended).toBe(true);
      expect(nextState.endResult?.type).toBe('instant_crisis');
      expect(nextState.endResult?.won).toBe(false);
    });

    it('triggers containment win if peaked, frac < 0.1% and day > 6', () => {
      const state = freshState('bkk', 'flu');
      state.day = 10;
      state.peaked = true;
      // Very few infections left
      for (const p of PROVINCES) {
        state.provinces[p.id].infected = 0;
      }
      state.provinces['bkk'].infected = 5; // very low frac

      const { nextState } = simulateTick(state);
      expect(nextState.ended).toBe(true);
      expect(nextState.endResult?.type).toBe('containment_win');
      expect(nextState.endResult?.won).toBe(true);
      expect(nextState.endResult?.grade).toBeDefined();
    });

    it('calculates grade correctly according to death fraction', () => {
      expect(calculateGrade(0.0005).grade).toBe('S');
      expect(calculateGrade(0.003).grade).toBe('A');
      expect(calculateGrade(0.015).grade).toBe('B');
      expect(calculateGrade(0.04).grade).toBe('C');
      expect(calculateGrade(0.10).grade).toBe('D');
      expect(calculateGrade(0.20).grade).toBe('F');
    });
  });
});
