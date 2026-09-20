import {
  ActionConfig,
  ActionType,
  Connection,
  DifficultyConfig,
  DifficultyId,
  Pathogen,
  PathogenId,
  Province,
} from './types';

export const APP_VERSION = '0.2.0';

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  casual: {
    id: 'casual',
    name: 'สนับสนุนพิเศษ (Casual)',
    nameEn: 'Special Support',
    desc: 'งบประมาณสูง (+18G/วัน) เหมาะสำหรับผู้ที่ต้องการบริหารจัดการได้ครอบคลุมทั่วถึง',
    icon: '🟢',
    initialBudget: 160,
    dailyBudgetGain: 18,
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  standard: {
    id: 'standard',
    name: 'มาตรฐาน (Standard)',
    nameEn: 'Protocol Spec',
    desc: 'สมดุลจริงตามสเปก (+12G/วัน) ต้องคัดกรองจุดวิกฤตและวางแผนรัดกุม',
    icon: '🟡',
    initialBudget: 100,
    dailyBudgetGain: 12,
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  crisis: {
    id: 'crisis',
    name: 'วิกฤตการคลัง (Crisis)',
    nameEn: 'Austerity',
    desc: 'งบจำกัดรุนแรง (+9G/วัน) บังคับให้ต้องเลือกตัดทิ้งบางพื้นที่เพื่อปกป้องภาพรวม',
    icon: '🔴',
    initialBudget: 75,
    dailyBudgetGain: 9,
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  },
};

export const PROVINCES: Province[] = [
  { id: 'bkk', name: 'กรุงเทพมหานคร', nameEn: 'Bangkok', pop: 5527987, x: 340, y: 305, hub: true },
  { id: 'non', name: 'นนทบุรี', nameEn: 'Nonthaburi', pop: 1274278, x: 280, y: 245, hub: false },
  { id: 'ptt', name: 'ปทุมธานี', nameEn: 'Pathum Thani', pop: 1144470, x: 345, y: 185, hub: false },
  { id: 'spk', name: 'สมุทรปราการ', nameEn: 'Samut Prakan', pop: 1377872, x: 420, y: 365, hub: true },
  { id: 'npt', name: 'นครปฐม', nameEn: 'Nakhon Pathom', pop: 923061, x: 225, y: 325, hub: false },
  { id: 'skn', name: 'สมุทรสาคร', nameEn: 'Samut Sakhon', pop: 583929, x: 265, y: 395, hub: false },
  { id: 'ccs', name: 'ฉะเชิงเทรา', nameEn: 'Chachoengsao', pop: 720933, x: 480, y: 295, hub: false },
  { id: 'aya', name: 'พระนครศรีอยุธยา', nameEn: 'Ayutthaya', pop: 826983, x: 325, y: 115, hub: false },
  { id: 'sri', name: 'สระบุรี', nameEn: 'Saraburi', pop: 635937, x: 425, y: 95, hub: false },
  { id: 'cbi', name: 'ชลบุรี', nameEn: 'Chonburi', pop: 1621996, x: 500, y: 420, hub: true },
];

export const TOTAL_POPULATION = PROVINCES.reduce((sum, p) => sum + p.pop, 0);

export const CONNECTIONS: Connection[] = [
  ['bkk', 'non', 0.90],
  ['bkk', 'ptt', 0.85],
  ['bkk', 'spk', 0.90],
  ['bkk', 'npt', 0.75],
  ['bkk', 'skn', 0.80],
  ['non', 'ptt', 0.70],
  ['non', 'npt', 0.50],
  ['ptt', 'aya', 0.75],
  ['ptt', 'sri', 0.55],
  ['spk', 'ccs', 0.70],
  ['spk', 'cbi', 0.60],
  ['npt', 'skn', 0.70],
  ['ccs', 'cbi', 0.80],
  ['ccs', 'sri', 0.50],
  ['aya', 'sri', 0.70],
];

export const PATHOGENS: Record<PathogenId, Pathogen> = {
  flu: {
    id: 'flu',
    name: 'ไข้หวัดใหญ่สายพันธุ์ใหม่',
    icon: '🤧',
    desc: 'แพร่อย่างรวดเร็ว แต่อัตราเสียชีวิตต่ำ และวิจัยวัคซีนได้ง่าย',
    infectionMult: 1.30,
    recoveryMult: 1.50,
    cfrMult: 0.3,
    treatability: 1.00,
    stats: { spread: 4, lethal: 1, hard: 1 },
  },
  pneumo: {
    id: 'pneumo',
    name: 'ไวรัสปอดอักเสบรุนแรง',
    icon: '😷',
    desc: 'ความเร็วปานกลาง แต่อัตราเสียชีวิตสูงขึ้นและรักษาได้ยากกว่าปกติ',
    infectionMult: 1.00,
    recoveryMult: 0.90,
    cfrMult: 1.6,
    treatability: 0.80,
    stats: { spread: 3, lethal: 3, hard: 2 },
  },
  lab: {
    id: 'lab',
    name: 'เชื้อกลายพันธุ์จากแล็บ',
    icon: '🧪',
    desc: 'แพร่เร็วมาก หายช้า และอันตรายถึงชีวิตสูง พัฒนาวัคซีนได้ยาก',
    infectionMult: 1.15,
    recoveryMult: 0.65,
    cfrMult: 3.5,
    treatability: 0.50,
    stats: { spread: 4, lethal: 4, hard: 4 },
  },
  superbug: {
    id: 'superbug',
    name: 'ซูเปอร์บั๊กดื้อยา',
    icon: '☠️',
    desc: 'แพร่ช้าลงเล็กน้อย แต่อัตราเสียชีวิตสูงสุดและดื้อยาเกือบทุกชนิด',
    infectionMult: 0.75,
    recoveryMult: 0.45,
    cfrMult: 5.0,
    treatability: 0.25,
    stats: { spread: 2, lethal: 5, hard: 5 },
  },
};

export const BASE_INFECTION_RATE = 0.22;
export const BASE_RECOVERY_RATE = 0.013;
export const CASE_FATALITY_RATE = 0.03;
export const CROSS_SPREAD_FACTOR = 3.2;
export const DAILY_BUDGET_GAIN = 12;

export const DEATH_LOSE_FRACTION = 0.95;
export const COLLAPSE_FRACTION = 0.90;
export const WANE_RATE = 0.012;

export const RESEARCH_COST = 25;
export const RESEARCH_GAIN_BASE = 9;
export const RESEARCH_CONTRACT_DAYS = 7; // days of active research per 25G contract
export const RESEARCH_GAIN_DAILY = 1.5; // points per day when research is active
export const MAX_RESEARCH_QUEUE_DAYS = 21; // player can queue up to 3 research contracts (21 days)
export const VACCINE_ROLLOUT_RATE = 0.05;

export const UNREST_RIOT_THRESHOLD = 70;
export const UNREST_DECAY = 1.5;
export const UNREST_LOCKDOWN_FATIGUE = 2.5;
export const UNREST_INFECTION_FACTOR = 15;
export const UNREST_GRIEF_FACTOR = 800;
export const RIOT_BUDGET_PENALTY = 15;
export const RIOT_CASUALTY_RATE = 0.00003;
export const RIOT_COLLAPSE_COUNT = 4;

export const RELIEF_UNREST_REDUCTION = 25;

export const ACTIONS: Record<ActionType, ActionConfig> = {
  health: {
    name: 'หน่วยสาธารณสุขจังหวัด',
    icon: '🏥',
    cost: 15,
    duration: 5,
    desc: 'ลดอัตราการแพร่เชื้อในจังหวัด',
  },
  checkpoint: {
    name: 'จุดตรวจ/ปิดด่าน',
    icon: '🚧',
    cost: 20,
    duration: 5,
    desc: 'ลดการเดินทางเชื่อมต่อกับจังหวัดนี้ลง 50% แต่อาจเพิ่มความไม่พอใจ',
  },
  medical: {
    name: 'ทีมแพทย์เคลื่อนที่',
    icon: '🚑',
    cost: 25,
    duration: 5,
    desc: 'เร่งการรักษาและลดอัตราการเสียชีวิต',
  },
  relief: {
    name: 'มาตรการเยียวยาฉุกเฉิน',
    icon: '📦',
    cost: 20,
    duration: 0,
    desc: 'ส่งถุงยังชีพและงบเยียวยา ลดความไม่พอใจ (Unrest) ทันที 25%',
  },
};
