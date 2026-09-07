import { Task, Employee } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'E01',
    name: 'พี่ไมค์',
    phone: '081-445-6789',
    projectId: 'PID-124, PID-123',
    project: 'Project 1',
    email: 'mike.lead@company.com',
    role: 'Tech Lead / Project Manager',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    tasksCount: 4,
  },
  {
    id: 'E02',
    name: 'พี่หน่อง',
    phone: '089-112-3344',
    projectId: 'PID-122, PID-119',
    project: 'แผนก/การตลาด',
    email: 'nong.mkt@company.com',
    role: 'Marketing Lead',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    tasksCount: 5,
  },
  {
    id: 'E03',
    name: 'พี่ตู้',
    phone: '086-778-9900',
    projectId: 'PID-125',
    project: 'แผนก/ITW',
    email: 'tu.itw@company.com',
    role: 'Senior Full-Stack Dev',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    tasksCount: 4,
  },
  {
    id: 'E04',
    name: 'สมชาย',
    phone: '085-334-5566',
    projectId: 'PID-118',
    project: 'แผนก/ITW',
    email: 'somchai@company.com',
    role: 'Frontend Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    tasksCount: 2,
  },
  {
    id: 'E05',
    name: 'วรรณา',
    phone: '082-998-7711',
    projectId: 'PID-119',
    project: 'แผนก/ออกแบบ',
    email: 'wanna.design@company.com',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    tasksCount: 3,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'PID-125',
    title: 'พัฒนาระบบประมวลผลสถิติรายสัปดาห์ (W37 Weekly Metrics)',
    category: 'แผนก/ITW',
    project: 'แผนก/ITW',
    priority: 'High',
    status: 'In progress',
    owner: 'พี่ตู้',
    ownerPhone: '086-778-9900',
    ownerEmail: 'tu.itw@company.com',
    techStack: 'React, Node.js, Google Sheets API',
    startDate: '2026-09-07',
    dueDate: '2026-09-11',
    duration: '4 วัน',
    description: 'คำนวณยอดงานที่ทำเสร็จและงานที่กำลังทำแยกตามเลขสัปดาห์ W36, W37 แบบเรียลไทม์',
    resultOutcome: 'เตรียมทดสอบระบบสถิติเวอร์ชันแรก',
    projectLink: 'https://sheets.google.com',
    progress: 50,
    progressBar: '50%',
    subtasks: [
      { id: 'st-w1', title: 'เขียนอัลกอริทึม ISO Week Calculation', completed: true, assignee: 'พี่ตู้' },
      { id: 'st-w2', title: 'ผูกข้อมูลเข้ากับกราฟแท่งเปรียบเทียบสัปดาห์', completed: false, assignee: 'พี่ไมค์' },
      { id: 'st-w2b', title: 'ตรวจสอบความถูกต้องและ Unit Test', completed: false, assignee: 'พี่แนน' },
    ],
    createdAt: '2026-09-04T08:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
  },
  {
    id: 'PID-124',
    title: 'จัดเตรียมเอกสารส่งมอบงาน Sprint W37',
    category: 'Project 1',
    project: 'Project 1',
    priority: 'Medium',
    status: 'Completed',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    techStack: 'Google Docs, Slides, Sheets',
    startDate: '2026-09-07',
    dueDate: '2026-09-09',
    duration: '2 วัน',
    description: 'รวบรวมสรุปความคืบหน้างานประจำสัปดาห์ที่ 37 และรายงานสถานะโครงการต่อผู้บริหาร',
    resultOutcome: 'ส่งมอบรายงานผ่าน Drive และเซ็นรับทราบแล้ว',
    projectLink: 'https://docs.google.com',
    progress: 100,
    progressBar: '100%',
    subtasks: [
      { id: 'st-w3', title: 'สรุปสถานะ Tasks รายแผนก', completed: true, assignee: 'พี่ไมค์' },
      { id: 'st-w4', title: 'ส่งมอบรายงานผ่าน Google Drive', completed: true, assignee: 'พี่ตู้' },
    ],
    createdAt: '2026-09-03T11:00:00Z',
    updatedAt: '2026-09-09T16:00:00Z',
  },
  {
    id: 'PID-123',
    title: 'จัดเตรียมสภาพแวดล้อมระบบและฐานข้อมูล Sheet',
    category: 'Project 1',
    project: 'Project 1',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    techStack: 'Google Apps Script, REST API',
    startDate: '2026-09-01',
    dueDate: '2026-09-04',
    duration: '3 วัน',
    description: 'ทดสอบการอ่านและเขียนข้อมูลร่วมกับ Google Apps Script เชื่อมโยง Google Sheets 15 คอลัมน์',
    resultOutcome: 'เชื่อมต่อและซิงค์ข้อมูลเรียบร้อย',
    projectLink: 'https://script.google.com',
    progress: 100,
    progressBar: '100%',
    subtasks: [
      { id: 'st-1', title: 'สร้างชีต Tasks และคอลัมน์มาตรฐาน', completed: true },
      { id: 'st-2', title: 'เขียนฟังก์ชัน doGet() ใน Apps Script', completed: true },
      { id: 'st-3', title: 'ทดสอบส่งคืนข้อมูล JSON format', completed: true },
    ],
    createdAt: '2026-09-01T08:30:00Z',
    updatedAt: '2026-09-03T14:20:00Z',
  },
  {
    id: 'PID-122',
    title: 'Task 2: วางโครงร่างหน้า Dashboard และ Card สรุปผล',
    project: 'แผนก/การตลาด',
    priority: 'Low',
    status: 'In progress',
    owner: 'พี่หน่อง',
    ownerPhone: '089-112-3344',
    ownerEmail: 'nong.mkt@company.com',
    startDate: '2026-09-02',
    dueDate: '2026-09-06',
    description: 'จัดทำกล่องสรุปสถานะงาน 4 ใบ (ทั้งหมด, สำเร็จ, รอ, ดำเนินการ) พร้อมแถบเปอร์เซ็นต์ความก้าวหน้า',
    progress: 60,
    subtasks: [
      { id: 'st-4', title: 'ตรวจทานตัวเลขสถานะงานแยกรายหมวด', completed: true },
      { id: 'st-5', title: 'เชื่อมต่อกราฟสัดส่วนสถานะงาน (Donut Chart)', completed: false },
    ],
    createdAt: '2026-09-02T09:00:00Z',
    updatedAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'PID-121',
    title: 'Write blog post for demo day',
    project: 'แผนก/ITW',
    priority: 'High',
    status: 'In progress',
    owner: 'พี่ตู้',
    ownerPhone: '086-778-9900',
    ownerEmail: 'tu.itw@company.com',
    startDate: '2026-09-02',
    dueDate: '2026-09-05',
    description: 'เขียนบทความแนะนำระบบ Task Manager ที่ใช้งานร่วมกับ Google Sheets เพื่อเผยแพร่ในงาน Demo Day',
    progress: 45,
    subtasks: [
      { id: 'st-6', title: 'ร่างหัวข้อและประเด็นสำคัญ', completed: true },
      { id: 'st-7', title: 'บันทึกภาพหน้าจอการทำงาน', completed: false },
      { id: 'st-8', title: 'ส่งให้ทีมการตลาดรีวิว', completed: false },
    ],
    createdAt: '2026-09-02T10:15:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
  },
  {
    id: 'PID-120',
    title: 'Publish blog page',
    project: 'แผนก/การตลาด',
    priority: 'Low',
    status: 'Blocked',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-09-01',
    dueDate: '2026-09-08',
    description: 'อัปเดตหน้าบล็อกของบริษัท ติดปัญหาเรื่องสิทธิ์การเข้าถึง CMS ชั่วคราว',
    progress: 25,
    subtasks: [
      { id: 'st-9', title: 'ขอสิทธิ์ผู้ดูแลระบบเพิ่ม', completed: false },
      { id: 'st-10', title: 'เตรียมเนื้อหาและรูปประกอบ', completed: true },
    ],
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-03T12:00:00Z',
  },
  {
    id: 'PID-119',
    title: 'Add gradients to design system',
    project: 'แผนก/ออกแบบ',
    priority: 'Medium',
    status: 'Completed',
    owner: 'พี่หน่อง',
    ownerPhone: '089-112-3344',
    ownerEmail: 'nong.mkt@company.com',
    startDate: '2026-08-28',
    dueDate: '2026-09-02',
    description: 'เพิ่มพาเลทโทนสีและชุดการออกแบบใน Tailwind CSS ให้สอดคล้องกับแบรนด์ใหม่',
    progress: 100,
    subtasks: [
      { id: 'st-11', title: 'กำหนดคู่สี Primary และ Neutral', completed: true },
      { id: 'st-12', title: 'อัปเดตเอกสาร Design Tokens', completed: true },
    ],
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-02T17:00:00Z',
  },
  {
    id: 'PID-118',
    title: "Responsive behavior doesn't work on Android",
    project: 'แผนก/ITW',
    priority: 'Medium',
    status: 'In progress',
    owner: 'พี่ตู้',
    ownerPhone: '086-778-9900',
    ownerEmail: 'tu.itw@company.com',
    startDate: '2026-09-03',
    dueDate: '2026-09-07',
    description: 'หน้าตารางงานแสดงผลล้นขอบจอเมื่อเปิดใน Chrome บน Android มือถือขนาดหน้าจอเล็ก',
    progress: 50,
    subtasks: [
      { id: 'st-13', title: 'ตรวจสอบ Breakpoints sm: และ md:', completed: true },
      { id: 'st-14', title: 'เพิ่ม overflow-x-auto ให้กับตารางงาน', completed: true },
      { id: 'st-15', title: 'ทดสอบกับอุปกรณ์จริง', completed: false },
    ],
    createdAt: '2026-09-03T08:00:00Z',
    updatedAt: '2026-09-03T15:30:00Z',
  },
  {
    id: 'PID-117',
    title: 'Confirmation modal not rendering properly',
    project: 'แผนก/ITW',
    priority: 'Medium',
    status: 'In progress',
    owner: 'สมชาย',
    ownerPhone: '085-334-5566',
    ownerEmail: 'somchai@company.com',
    startDate: '2026-09-02',
    dueDate: '2026-09-06',
    description: 'ปุ่มยกเลิกในกล่องยืนยันการลบงานบางครั้งไม่ตอบสนองเมื่อกดบนแท็บเล็ต',
    progress: 30,
    subtasks: [
      { id: 'st-16', title: 'แก้ไข z-index ของ Modal overlay', completed: true },
      { id: 'st-17', title: 'ผูกอีเวนต์ onClick ให้ครอบคลุม Touch Event', completed: false },
    ],
    createdAt: '2026-09-02T13:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z',
  },
  {
    id: 'PID-116',
    title: 'Text wrapping on dashboard stats box overflow',
    project: 'แผนก/ออกแบบ',
    priority: 'Low',
    status: 'Blocked',
    owner: 'วรรณา',
    ownerPhone: '082-998-7711',
    ownerEmail: 'wanna.design@company.com',
    startDate: '2026-09-01',
    dueDate: '2026-09-05',
    description: 'ข้อความภาษาไทยในกล่องสถิติสัปดาห์ตัดคำไม่พอดี รอข้อความสรุปฉบับย่อ',
    progress: 20,
    subtasks: [
      { id: 'st-18', title: 'ปรับ CSS line-clamp และ truncate', completed: true },
      { id: 'st-19', title: 'ปรึกษาทีมเนื้อหาเรื่องความยาวข้อความ', completed: false },
    ],
    createdAt: '2026-09-01T15:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
  },
  {
    id: 'PID-115',
    title: 'Fix sourcemaps on cloud page',
    project: 'แผนก/ITW',
    priority: 'Low',
    status: 'Todo',
    owner: 'สมชาย',
    ownerPhone: '085-334-5566',
    ownerEmail: 'somchai@company.com',
    startDate: '2026-09-04',
    dueDate: '2026-09-09',
    description: 'ตั้งค่า Vite ให้เปิด Sourcemaps เฉพาะใน staging เพื่อไม่ให้เผยแพร่โค้ดใน production',
    progress: 0,
    subtasks: [
      { id: 'st-20', title: 'ปรับแต่งไฟล์ vite.config.ts', completed: false },
    ],
    createdAt: '2026-09-03T16:00:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
  },
  {
    id: 'PID-114',
    title: 'Publish third learn post',
    project: 'แผนก/การตลาด',
    priority: 'Low',
    status: 'Completed',
    owner: 'พี่หน่อง',
    ownerPhone: '089-112-3344',
    ownerEmail: 'nong.mkt@company.com',
    startDate: '2026-08-25',
    dueDate: '2026-09-01',
    description: 'เผยแพร่เนื้อหาตอนที่ 3 เรื่อง การเชื่อม Google Sheets เข้ากับ Web App',
    progress: 100,
    subtasks: [
      { id: 'st-21', title: 'ตรวจทานต้นฉบับ', completed: true },
      { id: 'st-22', title: 'ตั้งเวลาเผยแพร่บนแฟนเพจ', completed: true },
    ],
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-09-01T18:00:00Z',
  },
  {
    id: 'PID-113',
    title: 'Release image licensing for header section shapes',
    project: 'แผนก/การตลาด',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่หน่อง',
    ownerPhone: '089-112-3344',
    ownerEmail: 'nong.mkt@company.com',
    startDate: '2026-08-27',
    dueDate: '2026-08-30',
    description: 'ตรวจสอบใบอนุญาตลิขสิทธิ์รูปภาพสำหรับงานอาร์ตเวิร์กส่วนหัวเว็บ',
    progress: 100,
    subtasks: [
      { id: 'st-23', title: 'รวบรวมใบเสร็จและสัญญาอนุญาต', completed: true },
    ],
    createdAt: '2026-08-27T11:00:00Z',
    updatedAt: '2026-08-30T17:00:00Z',
  },
  {
    id: 'PID-112',
    title: 'Accessibility focuses state for input fields',
    project: 'แผนก/ออกแบบ',
    priority: 'High',
    status: 'Completed',
    owner: 'วรรณา',
    ownerPhone: '082-998-7711',
    ownerEmail: 'wanna.design@company.com',
    startDate: '2026-08-29',
    dueDate: '2026-09-02',
    description: 'เพิ่มขอบสี Focus Ring ที่ได้มาตรฐาน WCAG AA ให้ทุกช่องกรอกข้อมูล',
    progress: 100,
    subtasks: [
      { id: 'st-24', title: 'ทดสอบด้วยคีย์บอร์ด Tab navigation', completed: true },
    ],
    createdAt: '2026-08-29T14:00:00Z',
    updatedAt: '2026-09-02T15:00:00Z',
  },
  {
    id: 'PID-111',
    title: 'Header link revision to support addition of blog page',
    project: 'แผนก/ออกแบบ',
    priority: 'High',
    status: 'Todo',
    owner: 'วรรณา',
    ownerPhone: '082-998-7711',
    ownerEmail: 'wanna.design@company.com',
    startDate: '2026-09-03',
    dueDate: '2026-09-08',
    description: 'เพิ่มลิงก์เมนู "บทความ / บล็อก" ในแถบนำทางด้านบน',
    progress: 0,
    subtasks: [
      { id: 'st-25', title: 'ออกแบบตำแหน่งเมนูใน Figma', completed: false },
    ],
    createdAt: '2026-09-03T10:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z',
  },
  {
    id: 'PID-110',
    title: 'Press outbreak and launch announcement',
    project: 'แผนก/การตลาด',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-08-20',
    dueDate: '2026-08-25',
    description: 'แจกจ่ายข่าวประชาสัมพันธ์เปิดตัวระบบบริหารงานให้กับสื่อมวลชน',
    progress: 100,
    subtasks: [
      { id: 'st-26', title: 'ส่ง Press Release อีเมล', completed: true },
    ],
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-25T16:00:00Z',
  },
  {
    id: 'PID-109',
    title: 'Glitch flicker when looping back more than 3 times on the header logo',
    project: 'แผนก/ITW',
    priority: 'Low',
    status: 'Todo',
    owner: 'พี่ตู้',
    ownerPhone: '086-778-9900',
    ownerEmail: 'tu.itw@company.com',
    startDate: '2026-09-04',
    dueDate: '2026-09-11',
    description: 'แอนิเมชันของโลโก้กระตุกเมื่อเล่นวนรอบหลายครั้งบนเบราว์เซอร์ Safari',
    progress: 0,
    subtasks: [
      { id: 'st-27', title: 'ตรวจสอบ Keyframes transform ใน CSS', completed: false },
    ],
    createdAt: '2026-09-03T14:00:00Z',
    updatedAt: '2026-09-03T14:00:00Z',
  },
  {
    id: 'PID-108',
    title: 'Editorial format for blog posts on website',
    project: 'แผนก/การตลาด',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-08-15',
    dueDate: '2026-08-22',
    description: 'กำหนดมาตรฐานการจัดหน้าและรูปแบบฟอนต์บทความบนเว็บไซต์',
    progress: 100,
    subtasks: [
      { id: 'st-28', title: 'ส่งคู่มือให้อาร์ตเวิร์กและฝ่ายคอนเทนต์', completed: true },
    ],
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-22T17:00:00Z',
  },
  // Q1 Tasks (W01 - W13)
  {
    id: 'PID-101',
    title: 'วางแผนงานประจำปีและกำหนดเป้าหมาย Q1 (W02)',
    project: 'Project 1',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-01-05',
    dueDate: '2026-01-10',
    description: 'กำหนด OKRs และ Roadmaps การพัฒนาโปรเจกต์',
    progress: 100,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-10T17:00:00Z',
  },
  {
    id: 'PID-102',
    title: 'ศึกษาและออกแบบสถาปัตยกรรมคลาวด์ (W06)',
    project: 'Infrastructure',
    priority: 'Medium',
    status: 'Completed',
    owner: 'พี่ตู้',
    ownerPhone: '086-778-9900',
    ownerEmail: 'tu.itw@company.com',
    startDate: '2026-02-02',
    dueDate: '2026-02-07',
    description: 'จัดทำแผนผัง Cloud Infrastructure',
    progress: 100,
    createdAt: '2026-02-02T09:00:00Z',
    updatedAt: '2026-02-07T16:00:00Z',
  },
  {
    id: 'PID-103',
    title: 'ส่งมอบระบบรายงานผลประจำไตรมาส 1 (W12)',
    project: 'แผนก/การตลาด',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่หน่อง',
    ownerPhone: '089-112-3344',
    ownerEmail: 'nong.mkt@company.com',
    startDate: '2026-03-16',
    dueDate: '2026-03-21',
    description: 'สรุปผลงานและยอดผู้เข้าชมไตรมาสแรก',
    progress: 100,
    createdAt: '2026-03-16T08:30:00Z',
    updatedAt: '2026-03-21T18:00:00Z',
  },
  // Q2 Tasks (W14 - W26)
  {
    id: 'PID-104',
    title: 'เริ่มโครงการพัฒนา Google Sheets Integration (W16)',
    project: 'Project 1',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-04-13',
    dueDate: '2026-04-18',
    description: 'พัฒนาต้นแบบแรกสำหรับอ่านเขียน Google Sheets',
    progress: 100,
    createdAt: '2026-04-13T09:00:00Z',
    updatedAt: '2026-04-18T17:00:00Z',
  },
  {
    id: 'PID-105',
    title: 'ปรับปรุงความปลอดภัย API และ Token Auth (W20)',
    project: 'แผนก/ITW',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่ตู้',
    ownerPhone: '086-778-9900',
    ownerEmail: 'tu.itw@company.com',
    startDate: '2026-05-11',
    dueDate: '2026-05-16',
    description: 'ตรวจสอบช่องโหว่ความปลอดภัยและทดสอบระบบจำกัดสิทธิ์',
    progress: 100,
    createdAt: '2026-05-11T09:00:00Z',
    updatedAt: '2026-05-16T17:00:00Z',
  },
  {
    id: 'PID-106',
    title: 'ทดสอบประสิทธิภาพการทำงานและโหลดข้อมูลขนาดใหญ่ (W25)',
    project: 'แผนก/ITW',
    priority: 'Medium',
    status: 'Completed',
    owner: 'สมชาย',
    ownerPhone: '085-334-5566',
    ownerEmail: 'somchai@company.com',
    startDate: '2026-06-15',
    dueDate: '2026-06-20',
    description: 'Stress testing และปรับปรุงการโหลดข้อมูล',
    progress: 100,
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-20T17:00:00Z',
  },
  // Q3 Tasks (W27 - W39)
  {
    id: 'PID-107',
    title: 'ปรับปรุงการแสดงผลสถิติงานและการจัดกลุ่มแผนก (W29)',
    project: 'แผนก/ออกแบบ',
    priority: 'Medium',
    status: 'Completed',
    owner: 'วรรณา',
    ownerPhone: '082-998-7711',
    ownerEmail: 'wanna.design@company.com',
    startDate: '2026-07-13',
    dueDate: '2026-07-18',
    description: 'ออกแบบการ์ดและสีสันของแต่ละสถานะงาน',
    progress: 100,
    createdAt: '2026-07-13T09:00:00Z',
    updatedAt: '2026-07-18T17:00:00Z',
  },
  {
    id: 'PID-108',
    title: 'เตรียมการอัปเดตระบบ Sprint กลางปี (W34)',
    project: 'Project 1',
    priority: 'High',
    status: 'Completed',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-08-17',
    dueDate: '2026-08-22',
    description: 'รวบรวมฟีดแบ็กจากผู้ใช้งานจริงและวางแผนปรับปรุงรอบ 2',
    progress: 100,
    createdAt: '2026-08-17T09:00:00Z',
    updatedAt: '2026-08-22T17:00:00Z',
  },
  // Q4 Upcoming / Planned Tasks (W40 - W52)
  {
    id: 'PID-109',
    title: 'เปิดตัวเวอร์ชัน 2.0 รองรับการซิงค์แบบอัตโนมัติ (W42)',
    project: 'Project 1',
    priority: 'High',
    status: 'In progress',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-10-12',
    dueDate: '2026-10-17',
    description: 'เตรียมการเปิดตัวระบบเวอร์ชันใหม่สำหรับองค์กร',
    progress: 35,
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'PID-110',
    title: 'ขยายขีดความสามารถการสำรองข้อมูลรายสัปดาห์ (W46)',
    project: 'Infrastructure',
    priority: 'Medium',
    status: 'Todo',
    owner: 'พี่ตู้',
    ownerPhone: '086-778-9900',
    ownerEmail: 'tu.itw@company.com',
    startDate: '2026-11-09',
    dueDate: '2026-11-14',
    description: 'สร้าง Trigger สำรองข้อมูลอัตโนมัติไปยัง Google Drive แยกรายสัปดาห์',
    progress: 0,
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'PID-100',
    title: 'สรุปผลการดำเนินงานและปิดงวดประจำปี 2026 (W51)',
    project: 'Project 1',
    priority: 'High',
    status: 'Todo',
    owner: 'พี่ไมค์',
    ownerPhone: '081-445-6789',
    ownerEmail: 'mike.lead@company.com',
    startDate: '2026-12-14',
    dueDate: '2026-12-19',
    description: 'จัดทำรายงานสรุปภาพรวมตลอด 52 สัปดาห์ส่งผู้บริหาร',
    progress: 0,
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
  },
];

export const PROJECTS_LIST = [
  'Project 1',
  'แผนก/การตลาด',
  'แผนก/ITW',
  'แผนก/ออกแบบ',
  'Bug Fixes',
  'Infrastructure',
  'Design System',
];

export const GOOGLE_APPS_SCRIPT_SAMPLE_CODE = `/**
 * Google Apps Script (Code.gs)
 * สคริปต์สำหรับเชื่อมโยง Google Sheets ให้กลายเป็น REST API สำหรับ Task Manager
 * 
 * วิธีใช้งาน:
 * 1. ใน Google Sheets ไปที่ "ส่วนขยาย (Extensions)" -> "Apps Script"
 * 2. วางโค้ดนี้ลงใน Code.gs
 * 3. กด "การทำให้ใช้งานได้ (Deploy)" -> "การทำให้ใช้งานได้ใหม่ (New deployment)"
 * 4. เลือกประเภท "เว็บแอปพลิเคชัน (Web app)"
 * 5. ผู้มีสิทธิ์เข้าถึง (Who has access) ให้เลือก "ทุกคน (Anyone)"
 * 6. คัดลอก URL เว็บแอปมาใส่ในระบบ Task Manager
 */

const SHEET_TASKS = "Tasks";
const SHEET_EMPLOYEES = "Employees";

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = (e && e.parameter && e.parameter.action) || "getAll";

    if (action === "getTasks") {
      const tasks = getSheetData(ss, SHEET_TASKS);
      return createJsonResponse({ status: "success", data: tasks });
    }

    if (action === "getEmployees") {
      const employees = getSheetData(ss, SHEET_EMPLOYEES);
      return createJsonResponse({ status: "success", data: employees });
    }

    // Default: return both
    const tasks = getSheetData(ss, SHEET_TASKS);
    const employees = getSheetData(ss, SHEET_EMPLOYEES);
    return createJsonResponse({
      status: "success",
      tasks: tasks,
      employees: employees
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === "saveTask") {
      const task = postData.task;
      const sheet = ss.getSheetByName(SHEET_TASKS);
      const data = sheet.getDataRange().getValues();
      let foundIndex = -1;

      // ค้นหาแถวที่ตรงกับ ID เพื่ออัปเดต ถ้าไม่พบจะเพิ่มแถวใหม่
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === task.id) {
          foundIndex = i + 1;
          break;
        }
      }

      const rowValues = [
        task.id,
        task.title,
        task.project,
        task.priority,
        task.status,
        task.owner,
        task.ownerPhone || "",
        task.ownerEmail || "",
        task.startDate || "",
        task.dueDate || "",
        task.description || "",
        task.progress || 0,
        new Date().toISOString()
      ];

      if (foundIndex > 0) {
        sheet.getRange(foundIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }

      return createJsonResponse({ status: "success", message: "Task saved successfully" });
    }

    if (action === "deleteTask") {
      const taskId = postData.taskId;
      const sheet = ss.getSheetByName(SHEET_TASKS);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === taskId) {
          sheet.deleteRow(i + 1);
          return createJsonResponse({ status: "success", message: "Task deleted" });
        }
      }
      return createJsonResponse({ status: "error", message: "Task not found" });
    }

    return createJsonResponse({ status: "error", message: "Unknown action" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const results = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    results.push(item);
  }
  return results;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
