# Outbreak Protocol (Thai Outbreak Strategy Game) ☣️

เว็บแอปเกมกลยุทธ์แนวระบาดวิทยา (Strategy / Simulation) ที่ผู้เล่นรับบทเป็นศูนย์บัญชาการควบคุมโรคระบาดของรัฐบาลไทย ต้องบริหารจัดการงบประมาณ จัดสรรส่งหน่วยงานเผชิญเหตุ วิจัยพัฒนาวัคซีน และรับมือกับความไม่พอใจของประชาชนในคลัสเตอร์ 10 จังหวัดภาคกลาง

---

## 🎮 ฟีเจอร์หลัก (Key Features)

- **Pure Simulation Engine**: โมเดลระบาดวิทยา (SIR Model + Waning Immunity) คำนวณการแพร่ระบาดภายในจังหวัดและการแพร่กระจายข้ามจังหวัดผ่าน Graph เครือข่ายการเดินทาง
- **Interactive Tactical SVG Map**: แผนที่เครือข่ายภาคกลาง 10 จังหวัด แสดงผลแบบเรียลไทม์ด้วยสี Gradient ความรุนแรง, Pulse animation, ไอคอนจลาจล 🔥, เขตมรณะ 💀 และจุดตรวจ 🚧
- **3 Deployment Actions**:
  - 🏥 **หน่วยสาธารณสุขจังหวัด (15G)**: ชะลออัตราการแพร่เชื้อในจังหวัด
  - 🚧 **จุดตรวจ/ปิดด่าน (20G)**: ลดการเดินทางเชื่อมต่อข้ามจังหวัดลง 50%
  - 🚑 **ทีมแพทย์เคลื่อนที่ (25G)**: เร่งการรักษาและลดอัตราเสียชีวิต
- **Vaccine R&D Center**: ทุ่มงบวิจัยพัฒนาวัคซีนเพื่อสร้างภูมิคุ้มกันถาวร แจกจ่ายอัตโนมัติวันละ 5%
- **Difficulty Modes (3 ระดับ)**:
  - 🟢 **สนับสนุนพิเศษ (Casual)**: เริ่มต้น 160G, +18G/วัน (แนะนำสำหรับผู้เล่นใหม่)
  - 🟡 **มาตรฐาน (Standard)**: เริ่มต้น 100G, +12G/วัน (สมดุลตามสเปกตั้งต้น)
  - 🔴 **วิกฤตการคลัง (Crisis)**: เริ่มต้น 75G, +9G/วัน (ท้าทายขั้นสุด)
- **Live Mission Objectives & Tactical Guide**: ระบบติดตามเป้าหมายภารกิจแบบเรียลไทม์ และคู่มือยุทธวิธีในเกม
- **Automated Grading System**: ประเมินผลลัพธ์ชัยชนะตั้งแต่ระดับ S, A, B, C, D จนถึง F

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
- **Deployment Target**: [Vercel](https://vercel.com/)

---

## 🚀 เริ่มต้นใช้งานในเครื่อง (Local Development)

```bash
# ติดตั้ง dependencies
npm install

# รัน Development Server
npm run dev

# รัน Unit Tests ทั้งหมด
npm test

# ตรวจสอบโค้ดด้วย Linter
npm run lint

# ทดสอบคอมไพล์ Production Build
npm run build
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000) เพื่อเริ่มเล่นเกม

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
src/
├── app/
│   ├── globals.css         # Custom theme และ crisis-ops styling
│   ├── layout.tsx          # Root Layout & Thai Metadata
│   └── page.tsx            # Game Coordinator & State Orchestration
├── components/
│   ├── EpidemicChart.tsx   # กราฟเส้นอัตราการระบาดสะสม (SVG)
│   ├── EventLog.tsx        # รายงานสถานการณ์และข่าวกรองสด
│   ├── GameControls.tsx    # ตัวควบคุมเวลาและ Slider ปรับความเร็ว
│   ├── GameMap.tsx         # แผนที่เครือข่าย SVG Interactive Node Graph
│   ├── GameOverModal.tsx   # สรุปผลลัพธ์แพ้/ชนะ และเกรด S–F
│   ├── GameSetupModal.tsx  # หน้าต่างเลือกเชื้อ, จังหวัดเริ่ม, และระดับความยาก
│   ├── GuideModal.tsx      # คู่มือยุทธวิธีและเป้าหมายภารกิจ
│   ├── MissionObjectives.tsx # แผง HUD ติดตามเงื่อนไขชัยชนะ
│   ├── ProvincePanel.tsx   # แผงข้อมูลประชากรละเอียดและปุ่ม 3 คำสั่ง
│   ├── ResearchPanel.tsx   # ศูนย์วิจัยและแจกจ่ายวัคซีน
│   └── TopBar.tsx          # แถบสถิติสถานการณ์รวมด้านบน
└── lib/
    ├── constants.ts        # ค่าคงที่และ Ground Truth ทั้งหมด
    ├── simulation.ts       # Pure Simulation Engine
    ├── simulation.test.ts  # Jest Unit Tests
    └── types.ts            # TypeScript Definitions
```

---

## 📄 แหล่งอ้างอิง (Specifications)

- [GAME_SPEC.md](./GAME_SPEC.md): เอกสารระบุสูตรคณิตศาสตร์, ค่าคงที่ และเงื่อนไขการจำลองฉบับสมบูรณ์ (Ground Truth)
- [AGENTS.md](./AGENTS.md): แนวทางการพัฒนา กฎระเบียบ และการจัดการโค้ด
