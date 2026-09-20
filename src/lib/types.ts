export type Province = {
  id: string;
  name: string;
  nameEn: string;
  pop: number;
  x: number;
  y: number;
  hub: boolean;
};

export type Connection = [string, string, number]; // [provinceA, provinceB, weight]

export type ActionType = 'health' | 'checkpoint' | 'medical';

export type ProvinceState = {
  infected: number;
  recovered: number;
  dead: number;
  vaccinated: number;
  unrest: number; // 0-100
  rioting: boolean;
  collapsed: boolean;
  measures: { [key in ActionType]?: number }; // key -> remaining days
};

export type PathogenId = 'flu' | 'pneumo' | 'lab' | 'superbug';

export type Pathogen = {
  id: PathogenId;
  name: string;
  icon: string;
  desc: string;
  infectionMult: number;
  recoveryMult: number;
  cfrMult: number;
  treatability: number; // 0-1
  stats: {
    spread: 1 | 2 | 3 | 4 | 5;
    lethal: 1 | 2 | 3 | 4 | 5;
    hard: 1 | 2 | 3 | 4 | 5;
  };
};

export type ActionConfig = {
  name: string;
  icon: string;
  cost: number;
  duration: number;
  desc: string;
};

export type GameLogEvent = {
  id: string;
  day: number;
  text: string;
  type: 'info' | 'warn' | 'danger' | 'success' | 'action';
};

export type GameEndType = 'riot_collapse' | 'death_fraction' | 'instant_crisis' | 'containment_win';

export type GameEndResult = {
  type: GameEndType;
  title: string;
  description: string;
  grade?: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  gradeDesc?: string;
  won: boolean;
};

export type DifficultyId = 'casual' | 'standard' | 'crisis';

export type DifficultyConfig = {
  id: DifficultyId;
  name: string;
  nameEn: string;
  desc: string;
  icon: string;
  initialBudget: number;
  dailyBudgetGain: number;
  badgeColor: string;
};

export type GameState = {
  day: number;
  budget: number;
  pathogenId: PathogenId;
  difficultyId: DifficultyId;
  provinces: { [id: string]: ProvinceState };
  history: { day: number; frac: number }[];
  severityScore: number;
  research: number; // 0-100
  vaccineReady: boolean;
  peaked: boolean;
  ended: boolean;
  endResult?: GameEndResult;
};
