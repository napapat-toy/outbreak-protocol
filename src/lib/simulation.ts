import {
  ACTIONS,
  BASE_INFECTION_RATE,
  BASE_RECOVERY_RATE,
  CASE_FATALITY_RATE,
  COLLAPSE_FRACTION,
  CONNECTIONS,
  CROSS_SPREAD_FACTOR,
  DAILY_BUDGET_GAIN,
  DEATH_LOSE_FRACTION,
  DIFFICULTIES,
  PATHOGENS,
  PROVINCES,
  RESEARCH_COST,
  RESEARCH_CONTRACT_DAYS,
  RESEARCH_GAIN_DAILY,
  MAX_RESEARCH_QUEUE_DAYS,
  RELIEF_UNREST_REDUCTION,
  RIOT_BUDGET_PENALTY,
  RIOT_CASUALTY_RATE,
  RIOT_COLLAPSE_COUNT,
  TOTAL_POPULATION,
  UNREST_DECAY,
  UNREST_GRIEF_FACTOR,
  UNREST_INFECTION_FACTOR,
  UNREST_LOCKDOWN_FATIGUE,
  UNREST_RIOT_THRESHOLD,
  VACCINE_ROLLOUT_RATE,
  WANE_RATE,
} from './constants';
import {
  ActionType,
  DifficultyId,
  GameEndResult,
  GameLogEvent,
  GameState,
  PathogenId,
  ProvinceState,
} from './types';

export function getProvinceById(id: string) {
  return PROVINCES.find((p) => p.id === id);
}

export function getConnectedProvinces(id: string) {
  const neighborIds = CONNECTIONS
    .filter(([a, b]) => a === id || b === id)
    .map(([a, b]) => (a === id ? b : a));

  return neighborIds
    .map((neighborId) => PROVINCES.find((p) => p.id === neighborId))
    .filter((p): p is (typeof PROVINCES)[number] => Boolean(p));
}

export function getSusceptible(pop: number, state: ProvinceState): number {
  return Math.max(0, pop - state.infected - state.recovered - state.dead - state.vaccinated);
}

export function calculateGrade(deathFrac: number): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  description: string;
} {
  if (deathFrac <= 0.001) return { grade: 'S', description: 'ยอดเยี่ยม แทบไม่มีผู้เสียชีวิต' };
  if (deathFrac <= 0.005) return { grade: 'A', description: 'ควบคุมได้ดี ความสูญเสียต่ำ' };
  if (deathFrac <= 0.02) return { grade: 'B', description: 'ควบคุมได้ แต่มีความสูญเสียพอสมควร' };
  if (deathFrac <= 0.05) return { grade: 'C', description: 'ควบคุมได้ช้า ความสูญเสียสูง' };
  if (deathFrac <= 0.15) return { grade: 'D', description: 'เฉียดหายนะ ความสูญเสียหนักมาก' };
  return { grade: 'F', description: 'หายนะระดับภูมิภาค รอดมาได้แบบเจียนตาย' };
}

export function freshState(
  labId: string = 'bkk',
  pathogenId: PathogenId = 'flu',
  difficultyId: DifficultyId = 'standard'
): GameState {
  const provinces: { [id: string]: ProvinceState } = {};

  for (const p of PROVINCES) {
    provinces[p.id] = {
      infected: 0,
      recovered: 0,
      dead: 0,
      vaccinated: 0,
      unrest: 0,
      rioting: false,
      collapsed: false,
      measures: {},
    };
  }

  const labProvince = getProvinceById(labId) || PROVINCES[0];
  const initialInfected = Math.max(20, Math.round(labProvince.pop * 0.00004));
  provinces[labProvince.id].infected = initialInfected;

  const initialFrac = initialInfected / TOTAL_POPULATION;
  const initialBudget = DIFFICULTIES[difficultyId]?.initialBudget ?? 100;

  return {
    day: 0,
    budget: initialBudget,
    pathogenId,
    difficultyId,
    provinces,
    history: [{ day: 0, frac: initialFrac }],
    severityScore: 0,
    research: 0,
    researchDaysRemaining: 0,
    vaccineReady: false,
    peaked: false,
    ended: false,
  };
}

export function applyAction(
  state: GameState,
  provinceId: string,
  actionKey: ActionType
): { nextState: GameState; success: boolean; reason?: string } {
  if (state.ended) {
    return { nextState: state, success: false, reason: 'เกมสิ้นสุดลงแล้ว' };
  }

  const provinceState = state.provinces[provinceId];
  if (!provinceState) {
    return { nextState: state, success: false, reason: 'ไม่พบจังหวัดที่ระบุ' };
  }

  if (provinceState.collapsed) {
    return { nextState: state, success: false, reason: 'จังหวัดนี้กลายเป็นเขตมรณะแล้ว' };
  }

  // Relief aid specifically targets unrest and can be used during riots
  if (actionKey === 'relief') {
    const action = ACTIONS.relief;
    if (state.budget < action.cost) {
      return { nextState: state, success: false, reason: 'งบประมาณไม่เพียงพอ' };
    }
    const nextUnrest = Math.max(0, provinceState.unrest - RELIEF_UNREST_REDUCTION);
    const nextRioting = nextUnrest >= UNREST_RIOT_THRESHOLD;
    const nextProvinces = { ...state.provinces };
    nextProvinces[provinceId] = {
      ...provinceState,
      unrest: nextUnrest,
      rioting: nextRioting,
    };
    return {
      nextState: {
        ...state,
        budget: state.budget - action.cost,
        provinces: nextProvinces,
      },
      success: true,
    };
  }

  if (provinceState.rioting) {
    return { nextState: state, success: false, reason: 'ไม่สามารถส่งหน่วยงานเข้าพื้นที่จลาจลได้' };
  }

  const action = ACTIONS[actionKey];
  if (state.budget < action.cost) {
    return { nextState: state, success: false, reason: 'งบประมาณไม่เพียงพอ' };
  }

  const nextProvinces = { ...state.provinces };
  const nextProvinceState = {
    ...provinceState,
    measures: {
      ...provinceState.measures,
      [actionKey]: action.duration,
    },
  };
  nextProvinces[provinceId] = nextProvinceState;

  return {
    nextState: {
      ...state,
      budget: state.budget - action.cost,
      provinces: nextProvinces,
    },
    success: true,
  };
}

export function investResearch(state: GameState): {
  nextState: GameState;
  success: boolean;
  reason?: string;
} {
  if (state.ended) {
    return { nextState: state, success: false, reason: 'เกมสิ้นสุดลงแล้ว' };
  }
  if (state.vaccineReady) {
    return { nextState: state, success: false, reason: 'วิจัยวัคซีนสำเร็จแล้ว' };
  }
  if (state.budget < RESEARCH_COST) {
    return { nextState: state, success: false, reason: 'งบประมาณไม่เพียงพอ' };
  }
  if (state.researchDaysRemaining >= MAX_RESEARCH_QUEUE_DAYS) {
    return {
      nextState: state,
      success: false,
      reason: `ทีมวิจัยทำงานเต็มกำลังแล้ว (จองล่วงหน้าได้สูงสุด ${MAX_RESEARCH_QUEUE_DAYS} วัน)`,
    };
  }

  return {
    nextState: {
      ...state,
      budget: state.budget - RESEARCH_COST,
      researchDaysRemaining: state.researchDaysRemaining + RESEARCH_CONTRACT_DAYS,
    },
    success: true,
  };
}

export type TickResult = {
  nextState: GameState;
  events: GameLogEvent[];
};

export function simulateTick(state: GameState): TickResult {
  if (state.ended) {
    return { nextState: state, events: [] };
  }

  const events: GameLogEvent[] = [];
  const nextDay = state.day + 1;
  const dailyGain = DIFFICULTIES[state.difficultyId]?.dailyBudgetGain ?? DAILY_BUDGET_GAIN;
  let nextBudget = state.budget + dailyGain;

  // 5.1 Setup
  const pathogen = PATHOGENS[state.pathogenId];
  const infRate = BASE_INFECTION_RATE * pathogen.infectionMult;
  const recRate = BASE_RECOVERY_RATE * pathogen.recoveryMult;
  const baseCfr = CASE_FATALITY_RATE * pathogen.cfrMult;

  // Day-by-day Research Progress
  let nextResearch = state.research;
  let nextResearchDays = state.researchDaysRemaining;
  let nextVaccineReady = state.vaccineReady;

  if (!nextVaccineReady && nextResearchDays > 0) {
    const dailyGain = RESEARCH_GAIN_DAILY * pathogen.treatability;
    nextResearch = Math.min(100, +(nextResearch + dailyGain).toFixed(2));
    nextResearchDays -= 1;

    if (nextResearch >= 100) {
      nextVaccineReady = true;
      events.push({
        id: `vac-ready-${Date.now()}-${nextDay}`,
        day: nextDay,
        text: `🎉 วิจัยวัคซีนต้าน ${pathogen.name} สำเร็จ 100%! เริ่มแจกจ่ายฉีดวัคซีนวันละ 5% ของประชากรทันที`,
        type: 'success',
      });
    }
  }

  // Clone province states and update measure durations
  const workingProvinces: { [id: string]: ProvinceState } = {};
  for (const [id, provState] of Object.entries(state.provinces)) {
    const updatedMeasures: { [key in ActionType]?: number } = {};
    for (const [key, dur] of Object.entries(provState.measures)) {
      const nextDur = (dur ?? 0) - 1;
      if (nextDur > 0) {
        updatedMeasures[key as ActionType] = nextDur;
      }
    }
    workingProvinces[id] = {
      ...provState,
      measures: updatedMeasures,
    };
  }

  // 5.2 In-province spread & resolution deltas
  const deltas: {
    [id: string]: { newInf: number; newResolved: number; newDead: number };
  } = {};

  for (const prov of PROVINCES) {
    const pState = workingProvinces[prov.id];
    deltas[prov.id] = { newInf: 0, newResolved: 0, newDead: 0 };

    if (pState.collapsed) continue;

    const susceptible = getSusceptible(prov.pop, pState);
    const susceptFrac = susceptible / prov.pop;

    const healthActive = (pState.measures.health ?? 0) > 0;
    const medicalActive = (pState.measures.medical ?? 0) > 0;

    const healthMult = healthActive ? 1 - 0.4 * pathogen.treatability : 1;
    const medicalMult = medicalActive ? 1 + 0.6 * pathogen.treatability : 1;
    const cfr = medicalActive ? baseCfr * (1 - 0.5 * pathogen.treatability) : baseCfr;

    const newInfLocal = pState.infected * infRate * susceptFrac * healthMult;
    const resolved = pState.infected * recRate * medicalMult;
    const dead_delta = resolved * cfr;

    deltas[prov.id].newInf = newInfLocal;
    deltas[prov.id].newResolved = resolved;
    deltas[prov.id].newDead = dead_delta;
  }

  // 5.3 Cross-province spread
  const checkpointActive = (provId: string) =>
    (workingProvinces[provId]?.measures.checkpoint ?? 0) > 0;

  for (const [idA, idB, weight] of CONNECTIONS) {
    const pA = getProvinceById(idA);
    const pB = getProvinceById(idB);
    if (!pA || !pB) continue;

    const sA = workingProvinces[idA];
    const sB = workingProvinces[idB];

    if (sA.collapsed && sB.collapsed) continue;

    const ew =
      weight * (checkpointActive(idA) ? 0.5 : 1) * (checkpointActive(idB) ? 0.5 : 1);

    const fracA = sA.collapsed ? 0 : sA.infected / pA.pop;
    const fracB = sB.collapsed ? 0 : sB.infected / pB.pop;

    const susceptB = sB.collapsed ? 0 : getSusceptible(pB.pop, sB) / pB.pop;
    const susceptA = sA.collapsed ? 0 : getSusceptible(pA.pop, sA) / pA.pop;

    const spreadToB = fracA * ew * CROSS_SPREAD_FACTOR * susceptB * 1000;
    const spreadToA = fracB * ew * CROSS_SPREAD_FACTOR * susceptA * 1000;

    deltas[idB].newInf += spreadToB;
    deltas[idA].newInf += spreadToA;
  }

  // 5.4 Apply deltas
  let globalRiotingCount = 0;

  for (const prov of PROVINCES) {
    const pState = workingProvinces[prov.id];
    if (pState.collapsed) continue;

    const delta = deltas[prov.id];
    const susceptible = getSusceptible(prov.pop, pState);

    // 1. Clamp
    const newInf = Math.min(delta.newInf, susceptible);
    const resolved = Math.min(delta.newResolved, pState.infected);
    const died = Math.min(delta.newDead, resolved);
    const recovered_delta = resolved - died;

    const prevFrac = pState.infected / prov.pop;

    // 2. Infected
    let nextInfected = Math.max(0, pState.infected + newInf - resolved);

    // 3. Recovered
    let nextRecovered = Math.min(prov.pop, pState.recovered + recovered_delta);

    // 4. Dead
    let nextDead = Math.min(prov.pop, pState.dead + died);

    // 5. Waning immunity
    nextRecovered = Math.max(0, nextRecovered - nextRecovered * WANE_RATE);

    // 6. Vaccine rollout
    let nextVaccinated = pState.vaccinated;
    if (nextVaccineReady) {
      const stillSusceptible = Math.max(
        0,
        prov.pop - nextInfected - nextRecovered - nextDead - nextVaccinated
      );
      const dosed = stillSusceptible * VACCINE_ROLLOUT_RATE;
      nextVaccinated = Math.min(prov.pop, nextVaccinated + dosed);
    }

    // 7. Threshold log events (only on rising)
    const nowFrac = nextInfected / prov.pop;
    const thresholds = [
      { t: 0.1, label: '10%' },
      { t: 0.5, label: '50%' },
      { t: 0.9, label: '90%' },
    ];
    for (const { t, label } of thresholds) {
      if (prevFrac < t && nowFrac >= t) {
        events.push({
          id: `${prov.id}-inf-${t}-${nextDay}`,
          day: nextDay,
          text: `⚠️ ${prov.name}: ผู้ติดเชื้อทะลุ ${label} ของประชากรในจังหวัด!`,
          type: t >= 0.5 ? 'danger' : 'warn',
        });
      }
    }

    // 8. Unrest calculation
    const checkpointOn = (pState.measures.checkpoint ?? 0) > 0;
    const griefTerm = (died / prov.pop) * UNREST_GRIEF_FACTOR;
    const unrestDelta =
      (checkpointOn ? UNREST_LOCKDOWN_FATIGUE : 0) +
      nowFrac * UNREST_INFECTION_FACTOR +
      griefTerm -
      UNREST_DECAY;

    const nextUnrest = Math.min(100, Math.max(0, pState.unrest + unrestDelta));
    const wasRioting = pState.rioting;
    let nextRioting = nextUnrest >= UNREST_RIOT_THRESHOLD;

    if (nextRioting && !wasRioting) {
      nextBudget = Math.max(0, nextBudget - RIOT_BUDGET_PENALTY);
      events.push({
        id: `${prov.id}-riot-start-${nextDay}`,
        day: nextDay,
        text: `🔥 ประชาชนใน ${prov.name} ก่อการจลาจล! งบประมาณสูญเสีย ${RIOT_BUDGET_PENALTY}G`,
        type: 'danger',
      });
    }

    if (nextRioting) {
      nextDead = Math.min(prov.pop, nextDead + prov.pop * RIOT_CASUALTY_RATE);
      globalRiotingCount += 1;
    }

    // 9. Collapse check
    let nextCollapsed: boolean = pState.collapsed;
    if (!nextCollapsed && nextDead / prov.pop >= COLLAPSE_FRACTION) {
      nextCollapsed = true;
      nextInfected = 0;
      nextRioting = false;
      events.push({
        id: `${prov.id}-collapse-${nextDay}`,
        day: nextDay,
        text: `💀 ${prov.name} ล่มสลายและกลายเป็นเขตมรณะ (ยอดเสียชีวิตเกิน 90%)`,
        type: 'danger',
      });
    }

    workingProvinces[prov.id] = {
      infected: nextInfected,
      recovered: nextRecovered,
      dead: nextDead,
      vaccinated: nextVaccinated,
      unrest: nextUnrest,
      rioting: nextRioting,
      collapsed: nextCollapsed,
      measures: pState.measures,
    };
  }

  // 5.5 End-of-tick global calculations
  let totalInfected = 0;
  let totalDead = 0;

  for (const prov of PROVINCES) {
    const s = workingProvinces[prov.id];
    totalInfected += s.infected;
    totalDead += s.dead;
  }

  const frac = totalInfected / TOTAL_POPULATION;
  const deathFrac = totalDead / TOTAL_POPULATION;
  const nextSeverity = state.severityScore + totalInfected;
  const nextHistory = [...state.history, { day: nextDay, frac }];

  let nextPeaked = state.peaked;
  if (!nextPeaked && frac > 0.01) {
    nextPeaked = true;
  }

  // 5.6 End-game conditions (checked strictly in priority order)
  let ended = false;
  let endResult: GameEndResult | undefined;

  if (globalRiotingCount >= RIOT_COLLAPSE_COUNT) {
    ended = true;
    endResult = {
      type: 'riot_collapse',
      title: 'รัฐบาลล่มสลาย',
      description: `เกิดการจลาจลรุนแรงพร้อมกันถึง ${globalRiotingCount} จังหวัด ส่งผลให้ระบบบริหารประเทศล่มสลาย`,
      won: false,
    };
  } else if (deathFrac >= DEATH_LOSE_FRACTION) {
    ended = true;
    endResult = {
      type: 'death_fraction',
      title: 'ประชากรสูญพันธุ์',
      description: `ยอดผู้เสียชีวิตสะสมสูงถึง ${(deathFrac * 100).toFixed(1)}% ของประชากรทั้งภูมิภาค เกินเยียวยา`,
      won: false,
    };
  } else if (frac > 0.85) {
    ended = true;
    endResult = {
      type: 'instant_crisis',
      title: 'การระบาดควบคุมไม่อยู่',
      description: `มีผู้ติดเชื้อพร้อมกันทั่วทั้งภูมิภาคมากกว่า 85% ระบบสาธารณสุขล่มสลายอย่างสิ้นเชิง`,
      won: false,
    };
  } else if ((nextPeaked || nextVaccineReady) && frac < 0.001 && nextDay > 6) {
    ended = true;
    const gradeInfo = calculateGrade(deathFrac);
    endResult = {
      type: 'containment_win',
      title: 'ควบคุมการระบาดสำเร็จ',
      description: `สามารถสยบการแพร่ระบาดของเชื้อได้สำเร็จ โดยมียอดผู้เสียชีวิตสะสม ${(deathFrac * 100).toFixed(2)}%`,
      grade: gradeInfo.grade,
      gradeDesc: gradeInfo.description,
      won: true,
    };
  }

  if (ended && endResult) {
    events.push({
      id: `game-end-${nextDay}`,
      day: nextDay,
      text: endResult.won
        ? `🏆 ${endResult.title}: ${endResult.description} (เกรด ${endResult.grade})`
        : `🛑 สิ้นสุดภารกิจ: ${endResult.title} - ${endResult.description}`,
      type: endResult.won ? 'success' : 'danger',
    });
  }

  const nextState: GameState = {
    day: nextDay,
    budget: nextBudget,
    pathogenId: state.pathogenId,
    difficultyId: state.difficultyId || 'standard',
    provinces: workingProvinces,
    history: nextHistory,
    severityScore: nextSeverity,
    research: nextResearch,
    researchDaysRemaining: nextResearchDays,
    vaccineReady: nextVaccineReady,
    peaked: nextPeaked,
    ended,
    endResult,
  };

  return { nextState, events };
}
