<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Project Overview
Outbreak Protocol — เว็บแอปเกมกลยุทธ์แนว Plague Inc. ที่ผู้เล่นรับบทรัฐบาลไทย ต้องควบคุมการระบาด
ของเชื้อในคลัสเตอร์ 10 จังหวัดภาคกลาง ผ่านการจัดสรรงบประมาณ ส่งหน่วยงาน วิจัยวัคซีน และรับมือความไม่พอใจ
ของประชาชน โลจิกเกมทั้งหมด (constants, สูตร simulation, เงื่อนไขจบเกม) มีสเปกละเอียดอยู่ที่ `GAME_SPEC.md`
ที่ root ของ repo — **อ่านไฟล์นั้นก่อนแตะโค้ด logic เกมทุกครั้ง** ค่าตัวเลขในนั้นผ่านการทดสอบเล่นจริงมาแล้ว
ห้ามเดา/ปรับเองโดยไม่มีคนขอ

ต้นแบบที่เล่นได้จริง (single-file HTML prototype ใช้อ้างอิงพฤติกรรม UI/UX): ดูลิงก์ใน `GAME_SPEC.md`

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- MongoDB (เก็บ game state เป็น document เดียวต่อเกม ไม่ต้อง normalize)
- TypeScript แนะนำแต่ไม่บังคับ — ถ้าเริ่มโปรเจกต์ใหม่ให้ใช้ TypeScript strict mode

## Setup Commands
> ปรับ section นี้ให้ตรงกับ package.json จริงหลัง scaffold โปรเจกต์เสร็จ (ตอนนี้ยังเป็นต้นแบบ ไม่มี repo จริง)
- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test` (ยังไม่มี test suite — ถ้าเพิ่ม simulation logic ใหม่ ให้เขียน unit test คู่กันเสมอ)

## Code Style
- ฟังก์ชัน simulation logic ต้องเป็น **pure function** แยกจาก UI เด็ดขาด (รับ state คืน state ใหม่ ไม่แก้ state
  เดิมตรงๆ ถ้าเป็นไปได้) เพื่อให้ทดสอบได้ง่ายและ reuse ได้ทั้ง client/server
- Constants ทั้งหมด (BASE_INFECTION_RATE, CASE_FATALITY_RATE ฯลฯ) เก็บรวมไว้ไฟล์เดียว เช่น `lib/constants.ts`
  ห้ามกระจาย hardcode ค่าตัวเลขไว้หลายที่ในโค้ด
- ภาษาที่ใช้ใน UI/copy ทั้งหมดเป็นภาษาไทย (ยกเว้นชื่อเกม "Outbreak Protocol" และ field/variable name ในโค้ด
  ที่เป็นภาษาอังกฤษตามปกติ)
- Tailwind: ใช้ utility class ตรงๆ ไม่ต้องสร้าง custom CSS เพิ่มถ้า Tailwind ทำได้อยู่แล้ว

## Architecture Notes
- แยก 3 ชั้นชัดเจน: `lib/simulation.ts` (pure logic ตาม GAME_SPEC.md section 5), `lib/constants.ts`
  (ค่าคงที่ทั้งหมดตาม GAME_SPEC.md section 3), และ component ฝั่ง UI (แผนที่ node-graph แบบ SVG, sidebar,
  log panel) — ดู GAME_SPEC.md section 8 สำหรับ UI ที่ต้องมี
- แผนที่ใช้ SVG node-graph ธรรมดา **ไม่ใช่ Google Maps จริง** (ตัดสินใจแล้วว่าไม่คุ้มค่า billing/รายละเอียดเกิน
  ความจำเป็นสำหรับเกมนี้) ตำแหน่งจังหวัดเป็น manual layout ตาม field x,y ใน GAME_SPEC.md section 1
- MongoDB schema แนะนำ: collection `games`, document = GameState (ตาม GAME_SPEC.md section 1) + userId +
  createdAt เก็บทั้งก้อนไม่ normalize เพราะ query pattern คือโหลดทั้งเกมมาเล่นทีเดียว

## Testing Instructions
- Logic ใน `lib/simulation.ts` ต้องมี unit test ครอบคลุมอย่างน้อย: การแพร่เชื้อในจังหวัด, การแพร่ข้ามจังหวัด,
  เงื่อนไขจบเกมทั้ง 4 แบบ (riot collapse / death fraction / instant crisis / containment win), และการคำนวณเกรด
- ถ้าแก้ constants ใน `lib/constants.ts` ต้อง cross-check กับค่าที่ระบุใน GAME_SPEC.md ว่ายังตรงกันอยู่ ถ้าจะ
  เปลี่ยน balance ให้ถามผู้ใช้ก่อนเสมอ (ค่าพวกนี้ผ่านการทดสอบเล่นจริงหลายรอบมาแล้ว ไม่ใช่ค่าสุ่ม)

## Things to Avoid
- ห้ามเดาสูตร/ค่าคงที่เกมเอง ถ้าไม่แน่ใจให้เปิด GAME_SPEC.md ดูก่อนเสมอ
- ห้ามใช้ Google Maps API หรือ map tile service จริงใดๆ สำหรับแผนที่เกม (เป็นการตัดสินใจ design ที่ตั้งใจแล้ว
  ไม่ใช่ของที่ยังไม่ได้ทำ)
- ห้ามลบ/ย่อ GAME_SPEC.md โดยไม่ถามก่อน — เป็นเอกสารอ้างอิงหลักของทั้งโปรเจกต์

## Security Considerations
- ห้าม commit connection string ของ MongoDB หรือไฟล์ .env ใดๆ
- ถ้ามี API endpoint สำหรับ save/load game ให้ validate userId/session ก่อนเขียนหรืออ่าน document เสมอ
  ป้องกันคนอื่นแก้ game state ของคนอื่น

## PR Instructions
- Commit message ภาษาไทยหรืออังกฤษก็ได้ แต่ให้สื่อว่าแก้ไฟล์ไหน/ทำไม เช่น `feat: เพิ่มระบบวิจัยวัคซีน`
- ก่อน commit ให้รัน lint + test (ถ้ามี) ให้ผ่านก่อนเสมอ
