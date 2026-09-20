# สเปกเกม: Outbreak Protocol (Thai Outbreak Strategy Game)

สรุป logic ทั้งหมดจากต้นแบบ (single-file HTML prototype) เพื่อใช้เป็นแหล่งอ้างอิงตอนสร้างเวอร์ชัน Next.js
จริงจัง ค่าคงที่/สูตรทั้งหมดด้านล่างคือ "ground truth" ที่ผ่านการทดสอบเล่นจริงมาแล้วหลายรอบ ห้ามเดาเอง
ให้พอร์ตตามนี้ตรงๆ ก่อน แล้วค่อยปรับ balance ทีหลัง

อ้างอิงต้นแบบที่เล่นได้จริง: https://claude.ai/artifact/1vz88b4JHxQ58gAfRc7Cnm

---

## 1. Data Model

### Province (static)
```ts
type Province = {
  id: string;          // 'bkk', 'non', ...
  name: string;        // ชื่อไทย
  nameEn: string;
  pop: number;          // ประชากรจริง
  x: number; y: number; // ตำแหน่งบน layout (ไม่ใช่พิกัดจริง — ดู "แผนที่" ด้านล่าง)
  hub: boolean;         // มีสนามบิน/ท่าเรือ (เพื่อ flavor เท่านั้น ยังไม่มีผลต่อ mechanic)
};

const PROVINCES: Province[] = [
  { id:'bkk', name:'กรุงเทพมหานคร',      nameEn:'Bangkok',        pop:5527987, x:340, y:300, hub:true  },
  { id:'non', name:'นนทบุรี',            nameEn:'Nonthaburi',     pop:1274278, x:300, y:255, hub:false },
  { id:'ptt', name:'ปทุมธานี',           nameEn:'Pathum Thani',   pop:1144470, x:345, y:200, hub:false },
  { id:'spk', name:'สมุทรปราการ',        nameEn:'Samut Prakan',   pop:1377872, x:400, y:345, hub:true  },
  { id:'npt', name:'นครปฐม',             nameEn:'Nakhon Pathom',  pop:923061,  x:255, y:320, hub:false },
  { id:'skn', name:'สมุทรสาคร',          nameEn:'Samut Sakhon',   pop:583929,  x:280, y:370, hub:false },
  { id:'ccs', name:'ฉะเชิงเทรา',         nameEn:'Chachoengsao',   pop:720933,  x:450, y:300, hub:false },
  { id:'aya', name:'พระนครศรีอยุธยา',    nameEn:'Ayutthaya',      pop:826983,  x:330, y:145, hub:false },
  { id:'sri', name:'สระบุรี',            nameEn:'Saraburi',       pop:635937,  x:400, y:130, hub:false },
  { id:'cbi', name:'ชลบุรี',             nameEn:'Chonburi',       pop:1621996, x:470, y:390, hub:true  },
];
```

### Connections (edges, static)
```ts
// [provinceA, provinceB, weight 0-1 = ความง่ายในการแพร่เชื้อ/เดินทางระหว่างกัน]
const CONNECTIONS: [string,string,number][] = [
  ['bkk','non',0.90], ['bkk','ptt',0.85], ['bkk','spk',0.90], ['bkk','npt',0.75], ['bkk','skn',0.80],
  ['non','ptt',0.70], ['non','npt',0.50],
  ['ptt','aya',0.75], ['ptt','sri',0.55],
  ['spk','ccs',0.70], ['spk','cbi',0.60],
  ['npt','skn',0.70],
  ['ccs','cbi',0.80], ['ccs','sri',0.50],
  ['aya','sri',0.70],
];
```

### Province runtime state (mutable, per game)
```ts
type ProvinceState = {
  infected: number;
  recovered: number;    // ภูมิคุ้มกันธรรมชาติ — เสื่อมได้ (waning)
  dead: number;          // สะสม ไม่มีวันลดลง
  vaccinated: number;    // ภูมิคุ้มกันถาวรจากวัคซีน — ไม่เสื่อม
  unrest: number;        // 0-100 ความไม่พอใจประชาชน
  rioting: boolean;
  collapsed: boolean;    // เขตมรณะ — เมื่อ dead/pop >= COLLAPSE_FRACTION
  measures: { [actionKey: string]: number }; // key -> วันที่เหลือ
};

// susceptible ไม่เก็บเป็น field แยก คำนวณเสมอจาก:
susceptible = pop - infected - recovered - dead - vaccinated  // clamp ที่ 0
```

### Global game state
```ts
type GameState = {
  day: number;
  budget: number;
  pathogenId: string;
  provinces: { [id: string]: ProvinceState };
  history: { day: number; frac: number }[]; // สำหรับกราฟ infected fraction
  severityScore: number;  // cumulative infected-days — สะสมทุก tick
  research: number;       // 0-100
  vaccineReady: boolean;
  peaked: boolean;        // เคยผ่านจุด infected fraction > 1% มาแล้วหรือยัง (เงื่อนไข win ต้อง peaked ก่อน)
  ended: boolean;
};

// ค่าเริ่มต้นเกม (freshState):
day: 0
budget: 100
severityScore: 0
research: 0
vaccineReady: false
peaked: false (implicit undefined ok)
ended: false
// ทุกจังหวัด infected=0 recovered=0 dead=0 vaccinated=0 unrest=0 rioting=false collapsed=false measures={}
// ยกเว้นจังหวัดที่เลือกเป็นจุดเริ่มโรค (labId):
provinces[labId].infected = Math.max(20, Math.round(pop_ของจังหวัดนั้น * 0.00004))
```

---

## 2. Pathogens (ชนิดเชื้อ ที่ผู้เล่นเลือกตอนเริ่มเกม)

แต่ละเชื้อมี 4 ค่าคูณที่กระทบทุกสูตรด้านล่าง:

```ts
type Pathogen = {
  name: string; icon: string; desc: string;
  infectionMult: number;  // คูณ BASE_INFECTION_RATE
  recoveryMult: number;   // คูณ BASE_RECOVERY_RATE
  cfrMult: number;        // คูณ CASE_FATALITY_RATE
  treatability: number;   // 0-1, ยิ่งต่ำ = รักษายาก/วิจัยวัคซีนช้า (ดูสูตรที่ใช้ค่านี้ด้านล่าง)
  stats: { spread:1|2|3|4|5; lethal:1|2|3|4|5; hard:1|2|3|4|5 }; // แค่ไว้แสดงผล UI
};

const PATHOGENS = {
  flu: {
    name: 'ไข้หวัดใหญ่สายพันธุ์ใหม่', icon: '🤧',
    infectionMult: 1.30, recoveryMult: 1.50, cfrMult: 0.3, treatability: 1.00,
    stats: { spread:4, lethal:1, hard:1 },
  },
  pneumo: {
    name: 'ไวรัสปอดอักเสบรุนแรง', icon: '😷',
    infectionMult: 1.00, recoveryMult: 0.90, cfrMult: 1.6, treatability: 0.80,
    stats: { spread:3, lethal:3, hard:2 },
  },
  lab: {
    name: 'เชื้อกลายพันธุ์จากแล็บ', icon: '🧪',
    infectionMult: 1.15, recoveryMult: 0.65, cfrMult: 3.5, treatability: 0.50,
    stats: { spread:4, lethal:4, hard:4 },
  },
  superbug: {
    name: 'ซูเปอร์บั๊กดื้อยา', icon: '☠️',
    infectionMult: 0.75, recoveryMult: 0.45, cfrMult: 5.0, treatability: 0.25,
    stats: { spread:2, lethal:5, hard:5 },
  },
};
```

---

## 3. Global Constants

```ts
const BASE_INFECTION_RATE   = 0.22;   // ผู้ติดเชื้อใหม่/วัน ก่อนคูณด้วย pathogen + susceptible fraction
const BASE_RECOVERY_RATE    = 0.013;  // สัดส่วนผู้ติดเชื้อที่ "resolve" (หาย/ตาย) ต่อวัน โดยไม่มีการรักษา
                                        // = ระยะป่วยเฉลี่ย ~77 วัน ก่อนคูณ pathogen.recoveryMult
const CASE_FATALITY_RATE    = 0.03;   // สัดส่วนของเคสที่ resolve แล้วตาย (ก่อนคูณ pathogen.cfrMult)
const CROSS_SPREAD_FACTOR   = 3.2;    // ตัวคูณการแพร่เชื้อข้ามจังหวัด (ดูสูตร cross-spread)
const DAILY_BUDGET_GAIN     = 12;     // งบที่ได้รับต่อวัน (คงที่ ไม่ผูกกับ GDP/ภาษี — จุดที่ยังไม่ทำ)

const DEATH_LOSE_FRACTION   = 0.95;   // ตายสะสม >= 95% ของประชากรทั้งภูมิภาค = แพ้ (เกือบสูญพันธุ์)
const COLLAPSE_FRACTION     = 0.90;   // จังหวัดที่ dead/pop >= 90% กลายเป็น "เขตมรณะ" (collapsed=true)
const WANE_RATE             = 0.012;  // recovered หายไปเป็น susceptible กี่ % ต่อวัน (~83 วันเฉลี่ย)

const RESEARCH_COST         = 25;     // งบต่อการลงทุนวิจัยวัคซีน 1 ครั้ง (ผู้เล่นกดเอง)
const RESEARCH_GAIN_BASE    = 9;      // point ที่ได้ต่อครั้ง (0-100 scale) ก่อนคูณ pathogen.treatability
const VACCINE_ROLLOUT_RATE  = 0.05;   // หลังวิจัยสำเร็จ: สัดส่วนของ susceptible ที่ได้รับวัคซีน/วัน

const UNREST_RIOT_THRESHOLD    = 70;   // unrest ถึงระดับนี้ = จังหวัดนั้นจลาจล (rioting=true)
const UNREST_DECAY             = 1.5;  // unrest ลดลงเองต่อวันถ้าไม่มีตัวกระตุ้น
const UNREST_LOCKDOWN_FATIGUE  = 2.5;  // unrest เพิ่ม/วัน ถ้า checkpoint measure active อยู่
const UNREST_INFECTION_FACTOR  = 15;   // unrest เพิ่ม = infectedFraction * ค่านี้
const UNREST_GRIEF_FACTOR      = 800;  // unrest เพิ่ม = (คนตายใหม่วันนี้/pop) * ค่านี้
const RIOT_BUDGET_PENALTY      = 15;   // งบเสียหายทันที (ครั้งเดียว) ตอนจังหวัดเริ่มจลาจล
const RIOT_CASUALTY_RATE       = 0.00003; // สัดส่วนประชากรที่ตายเพิ่ม/วัน ระหว่างจลาจล (นอกเหนือจากโรค)
const RIOT_COLLAPSE_COUNT      = 4;    // ถ้าจลาจลพร้อมกัน >= ค่านี้ (จำนวนจังหวัด) = รัฐบาลล่มสลาย จบเกมทันที
```

---

## 4. Actions (หน่วยงานที่ส่งได้ — ผูกกับจังหวัดใดจังหวัดหนึ่ง)

```ts
const ACTIONS = {
  health: {
    name:'หน่วยสาธารณสุขจังหวัด', icon:'🏥', cost:15, duration:5,
    // effect: ลดอัตราแพร่เชื้อในจังหวัดนั้น
    // healthMult = 1 - 0.4 * pathogen.treatability   (active เมื่อ measures.health มีอยู่)
  },
  checkpoint: {
    name:'จุดตรวจ/ปิดด่าน', icon:'🚧', cost:20, duration:5,
    // effect: ลด edge weight ของทุกเส้นเชื่อมที่แตะจังหวัดนี้ลง 50% (ไม่ผูกกับ treatability — วิธีกายภาพ ได้ผลเท่ากันทุกเชื้อ)
  },
  medical: {
    name:'ทีมแพทย์เคลื่อนที่', icon:'🚑', cost:25, duration:5,
    // effect: เร่งการ resolve (หาย/ตาย) + ลดอัตราตาย
    // medicalMult = 1 + 0.6 * pathogen.treatability   (คูณเข้า recovery rate)
    // cfr เมื่อ active = baseCfr * (1 - 0.5 * pathogen.treatability)
  },
};
```

หมายเหตุสำคัญ: **จังหวัดที่กำลังจลาจล (rioting=true) ส่งหน่วยงานใหม่เข้าไปไม่ได้เลย** (การ deploy action ต้อง reject
ถ้า `provinceState.rioting === true`) มาตรการที่ deploy ไปก่อนหน้าจะยังนับเวลาถอยหลังตามปกติ ไม่ได้ถูกยกเลิกทันที

---

## 5. Simulation Tick (คำนวณทุก "1 วัน")

รันตามลำดับนี้เป๊ะๆ (ลำดับมีผลต่อผลลัพธ์):

### 5.1 Setup
```
day += 1
budget += DAILY_BUDGET_GAIN
ลด duration ของทุก measure ที่ active อยู่ลง 1 วัน, ลบทิ้งถ้าเหลือ <= 0

pathogen = PATHOGENS[pathogenId]
infRate  = BASE_INFECTION_RATE * pathogen.infectionMult
recRate  = BASE_RECOVERY_RATE * pathogen.recoveryMult
baseCfr  = CASE_FATALITY_RATE * pathogen.cfrMult
```

### 5.2 In-province spread + resolution (ต่อจังหวัด, ข้ามถ้า collapsed)
```
susceptible = max(0, pop - infected - recovered - dead - vaccinated)
susceptFrac = susceptible / pop

healthActive  = measures.health มีอยู่
medicalActive = measures.medical มีอยู่
healthMult  = healthActive  ? (1 - 0.4 * pathogen.treatability) : 1
medicalMult = medicalActive ? (1 + 0.6 * pathogen.treatability) : 1
cfr         = medicalActive ? baseCfr * (1 - 0.5 * pathogen.treatability) : baseCfr

newInfLocal = infected * infRate * susceptFrac * healthMult
resolved    = infected * recRate * medicalMult
dead_delta  = resolved * cfr

// เก็บสะสมไว้ใน deltas[provinceId] = { newInf, newResolved, newDead } (ยังไม่ apply จริง)
```

### 5.3 Cross-province spread (ต่อ edge ใน CONNECTIONS, ข้ามถ้าทั้งคู่ collapsed)
```
effectiveWeight(a,b,w) = w * (checkpointActive(a) ? 0.5 : 1) * (checkpointActive(b) ? 0.5 : 1)
ew = effectiveWeight(provA, provB, edgeWeight)

fracA = collapsed(A) ? 0 : infectedA / popA
fracB = collapsed(B) ? 0 : infectedB / popB
susceptB = collapsed(B) ? 0 : max(0, popB - infectedB - recoveredB - deadB - vaccinatedB) / popB
susceptA = collapsed(A) ? 0 : max(0, popA - infectedA - recoveredA - deadA - vaccinatedA) / popA

spreadToB = fracA * ew * CROSS_SPREAD_FACTOR * susceptB * 1000
spreadToA = fracB * ew * CROSS_SPREAD_FACTOR * susceptA * 1000

deltas[B].newInf += spreadToB
deltas[A].newInf += spreadToA
```
> ค่า `* 1000` เป็น scaling factor ที่ทดสอบแล้วให้ฟีลการแพร่ข้ามจังหวัดสมเหตุสมผล (ไม่เร็ว/ช้าเกินไป)
> เทียบกับขนาดประชากรจริงระดับล้านคน ถ้าจะปรับ balance ให้ปรับค่านี้เป็นหลัก

### 5.4 Apply deltas (ต่อจังหวัด, ข้ามถ้า collapsed) — รันตามลำดับนี้ในจังหวัดเดียวกัน
```
1. clamp: newInf = min(deltas.newInf, susceptible)
           resolved = min(deltas.newResolved, infected)
           died = min(deltas.newDead, resolved)
           recovered_delta = resolved - died

2. infected  = max(0, infected + newInf - resolved)
3. recovered = min(pop, recovered + recovered_delta)
4. dead      = min(pop, dead + died)
5. recovered = max(0, recovered - recovered * WANE_RATE)   // waning immunity

6. ถ้า vaccineReady:
     stillSusceptible = max(0, pop - infected - recovered - dead - vaccinated)
     dosed = stillSusceptible * VACCINE_ROLLOUT_RATE
     vaccinated = min(pop, vaccinated + dosed)

7. บันทึก log event ถ้า infected fraction ข้ามเกณฑ์ 10% / 50% / 90% (ขาขึ้นเท่านั้น)

8. คำนวณ unrest:
     checkpointOn = measures.checkpoint มีอยู่
     nowFrac = infected / pop
     griefTerm = (died / pop) * UNREST_GRIEF_FACTOR
     unrestDelta = (checkpointOn ? UNREST_LOCKDOWN_FATIGUE : 0)
                 + nowFrac * UNREST_INFECTION_FACTOR
                 + griefTerm
                 - UNREST_DECAY
     unrest = clamp(0, 100, unrest + unrestDelta)
     wasRioting = rioting
     rioting = unrest >= UNREST_RIOT_THRESHOLD
     ถ้า rioting เพิ่งเริ่ม (rioting && !wasRioting):
         budget = max(0, budget - RIOT_BUDGET_PENALTY)
         log event
     ถ้า rioting อยู่:
         dead = min(pop, dead + pop * RIOT_CASUALTY_RATE)
         riotingCount += 1  (ตัวนับระดับ global ต่อ tick)

9. ถ้า !collapsed && (dead / pop) >= COLLAPSE_FRACTION:
     collapsed = true
     infected = 0
     rioting = false
     log event "ล่มสลาย"
```

### 5.5 End-of-tick global calculations
```
totalInfected  = sum(provinces[*].infected)
totalRecovered = sum(provinces[*].recovered)
totalDead      = sum(provinces[*].dead)
frac           = totalInfected / totalPop         // totalPop = sum ของ pop ทั้ง 10 จังหวัด
deathFrac      = totalDead / totalPop

severityScore += totalInfected   // cumulative infected-days (ยิ่งน้อยยิ่งดี — ใช้เป็นคะแนนรอง)
history.push({ day, frac })      // สำหรับกราฟ

if (!peaked && frac > 0.01) peaked = true
```

### 5.6 End-game conditions (เช็คตามลำดับความสำคัญนี้ — หยุดที่ข้อแรกที่ true)
```
1. riotingCount >= RIOT_COLLAPSE_COUNT
   → LOSE: "รัฐบาลล่มสลาย" (การจราจล)

2. deathFrac >= DEATH_LOSE_FRACTION
   → LOSE: "สูญพันธุ์" (ตายเกิน 95%)

3. frac > 0.85   (ผู้ติดเชื้อพร้อมกันทั่วภูมิภาคเกิน 85%)
   → LOSE: "ระบาดควบคุมไม่อยู่"

4. peaked && frac < 0.001 && day > 6
   → WIN: "ควบคุมสำเร็จ" — คำนวณเกรดจาก deathFrac (ดูตารางด้านล่าง)

ถ้าไม่เข้าเงื่อนไขไหนเลย → เกมดำเนินต่อ (ended ยังเป็น false)
```

---

## 6. Grading (ให้เฉพาะตอน WIN เท่านั้น)

```
deathFrac <= 0.001  → S  "ยอดเยี่ยม แทบไม่มีผู้เสียชีวิต"
deathFrac <= 0.005  → A  "ควบคุมได้ดี ความสูญเสียต่ำ"
deathFrac <= 0.02   → B  "ควบคุมได้ แต่มีความสูญเสียพอสมควร"
deathFrac <= 0.05   → C  "ควบคุมได้ช้า ความสูญเสียสูง"
deathFrac <= 0.15   → D  "เฉียดหายนะ ความสูญเสียหนักมาก"
else (< 0.95)        → F  "หายนะระดับภูมิภาค รอดมาได้แบบเจียนตาย"
```

---

## 7. Player Actions (สรุป UI interactions ที่ต้องมี)

| Action | ผล |
|---|---|
| เลือกชนิดเชื้อ + จังหวัดต้นทาง (ตอนเริ่มเกม) | เรียก `freshState(labId, pathogenId)` |
| กด "+1 วัน" | เรียก `simulateTick()` ครั้งเดียว |
| กด "เล่นต่อเนื่อง" | `setInterval(simulateTick, speed)`, speed ปรับได้จาก slider (ในต้นแบบ: `speed = 1400 - sliderValue`, slider range 200-1200) |
| คลิกจังหวัดบนแผนที่ | เลือกจังหวัด → แสดงรายละเอียด + ปุ่ม action (ถ้าไม่ rioting/collapsed) |
| กดปุ่ม action ในจังหวัด (health/checkpoint/medical) | เรียก `applyAction(provinceId, actionKey)` — เช็ค budget พอ + ไม่ ended + ไม่ rioting ก่อน |
| กดปุ่ม "ทุ่มงบวิจัยวัคซีน" | เรียก `investResearch()` — เช็ค budget พอ + ยัง !vaccineReady |

---

## 8. UI/Visualization ที่ต้องมี (จากต้นแบบ)

- แผนที่: node-graph แบบ SVG (**ไม่ใช่ Google Maps จริง** — ตัดสินใจแล้วว่าไม่คุ้มค่า billing/รายละเอียดเกินจำเป็น
  ใช้ตำแหน่ง x,y แบบ manual layout ตาม field `x,y` ใน PROVINCES แทน)
  - สีวงกลม = gradient ตาม infected fraction: safe (เขียว) → warn (เหลือง) → danger (แดง)
  - เขตมรณะ (collapsed) = วงกลมสีดำ + ไอคอน 💀
  - จลาจล (rioting) = ไอคอน 🔥 มุมวงกลม
  - เส้นเชื่อม = ความหนาตาม edge weight, highlight สีน้ำเงินถ้ามี checkpoint active, จางลงถ้าปลายทางใดปลายทางหนึ่ง collapsed
- แผงข้อมูลจังหวัด (sidebar): ประชากร/ติดเชื้อ/หายป่วย/ตาย/ฉีดวัคซีนแล้ว/unrest bar + ปุ่ม action 3 อัน
- แผงห้องวิจัยวัคซีน: progress bar 0-100% + ปุ่มลงทุน
- Log เหตุการณ์: เรียงใหม่ล่าสุดอยู่บน
- กราฟ epidemic curve: line chart ของ `history[].frac` ตามเวลา
- Stat bar บนสุด: วันที่ / ผู้ติดเชื้อรวม / หายป่วยแล้ว / เสียชีวิต / งบประมาณ / คะแนนความเสียหายสะสม / % วิจัยวัคซีน

---

## 9. สิ่งที่ยังไม่ได้ทำ (รู้อยู่แล้วว่าเป็น next step)

- งบประมาณผูกกับ GDP/ภาษีจริง (ตอนนี้ `DAILY_BUDGET_GAIN` คงที่ ไม่ลดลงตามความเสียหายทางเศรษฐกิจ)
- Mutation: เชื้อกลายพันธุ์รุนแรงขึ้นถ้าปล่อยระบาดนานเกินไป
- ขยายจาก 10 จังหวัด (คลัสเตอร์ภาคกลาง) เป็น 77 จังหวัดเต็มประเทศ — ต้องมี adjacency graph ใหม่ทั้งหมด
- Popularity/ความน่าเชื่อถือรัฐบาล แยกจาก unrest (unrest ตอนนี้เป็นระดับจังหวัด ไม่มี global approval rating)
- Persistent save/leaderboard (ต้นแบบเป็น in-memory ล้วน รีเฟรชหน้าคือรีเซ็ต)
- hub (สนามบิน/ท่าเรือ) ตอนนี้เป็น flavor เฉยๆ ยังไม่มีผลต่อ mechanic จริง (เช่น seeding เชื้อจากต่างประเทศ)

---

## 10. คำแนะนำสำหรับ Claude Code ตอน build

- Logic ทั้งหมดใน section 5 ควรอยู่ใน pure function แยกจาก UI (เช่น `lib/simulation.ts`) รับ `GameState` คืน `GameState`
  ใหม่ ทำให้ทดสอบด้วย unit test ได้ง่าย และ reuse ได้ทั้งฝั่ง client (preview) และ server (ถ้าจะทำ multiplayer/persist)
- เก็บ constants ทั้งหมดใน section 3 ไว้ที่ไฟล์เดียว (เช่น `lib/constants.ts`) เพื่อให้ปรับ balance ทีหลังง่าย
- MongoDB: เก็บ `GameState` เป็น document เดียวต่อเกม (ไม่ต้อง normalize เยอะ เพราะ query pattern คือโหลดทั้งก้อนมาเล่น)
  แนะนำ collection `games` โดย document = GameState + userId + createdAt
- ถ้าจะทำ multiplayer/leaderboard ในอนาคต ให้ severityScore + grade เป็นตัวจัดอันดับหลัก
