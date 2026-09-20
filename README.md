# Outbreak Protocol ☣️ `v0.2.0`

เว็บแอปเกมกลยุทธ์จำลองสถานการณ์ระบาดวิทยา (Strategy / Simulation) ที่ผู้เล่นรับบทเป็นศูนย์บัญชาการควบคุมโรคระบาดของรัฐบาลไทย เพื่อควบคุมการแพร่เชื้อในคลัสเตอร์ 10 จังหวัดภาคกลาง

---

## 🎮 ภาพรวมเกม (Overview)

- **Pure Simulation Engine**: ขับเคลื่อนด้วยแบบจำลองระบาดวิทยา SIR-V พร้อมการแพร่กระจายข้ามเครือข่ายจังหวัด
- **Interactive Tactical Map**: แผนที่ SVG Node-Graph แบบเต็มจอ แสดงสถานะความรุนแรง การจลาจล และจุดตรวจแบบเรียลไทม์
- **Operations & Research**: ส่งหน่วยงานเผชิญเหตุลงพื้นที่ และทุ่มงบวิจัยพัฒนาวัคซีนเพื่อสร้างภูมิคุ้มกันถาวร
- **Analytics & Live Intel**: มีแผงลิ้นชักข้อมูลเชิงลึก กราฟการระบาด และรายงานข่าวกรองสถานการณ์สด
- **In-Game Field Manual**: คู่มือยุทธวิธี กฎการเล่น และสูตรการคำนวณทั้งหมด สามารถเปิดอ่านได้โดยตรงจากภายในเกม
- **Continuity & Shortcuts**: บันทึกเกมอัตโนมัติในตัว และรองรับการควบคุมผ่าน Keyboard Shortcuts ครบครัน

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + React Testing Library

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

```bash
# ติดตั้ง dependencies
npm install

# รัน Development Server
npm run dev

# รัน Tests & Lint
npm test
npm run lint
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 📄 ข้อมูลอ้างอิง (Specifications)

- [GAME_SPEC.md](./GAME_SPEC.md): สเปกเกม สูตรคณิตศาสตร์ และค่าคงที่ทั้งหมด (Ground Truth)
- [AGENTS.md](./AGENTS.md): แนวทางการพัฒนา กฎเกณฑ์สถาปัตยกรรม และ Versioning Policy
