/**
 * ฟังก์ชันคำนวณและแปลงค่าเกี่ยวกับสัปดาห์ (ISO 8601 Week)
 * สำหรับคำนวณสถิติงานรายสัปดาห์ตลอดทั้งปี (W01 - W52)
 */

export interface WeekInfo {
  year: number;
  week: number;
  label: string; // e.g. "W36"
  fullLabel: string; // e.g. "W36 (สัปดาห์นี้)"
  dateRange: string; // e.g. "31 ส.ค. - 6 ก.ย."
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  isCurrentWeek: boolean;
}

export const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function getISOWeekInfo(dateInput: string | Date | undefined): WeekInfo | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  // แปลงเป็น UTC เพื่อไม่ให้คลาดเคลื่อนเรื่อง Timezone
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = target.getUTCDay() || 7; // จันทร์=1, อาทิตย์=7
  target.setUTCDate(target.getUTCDate() + 4 - dayNr); // วันพฤหัสของสัปดาห์นั้น

  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = target.getUTCFullYear();

  // หาวันจันทร์และวันอาทิตย์ของสัปดาห์นี้
  const mon = new Date(target);
  mon.setUTCDate(target.getUTCDate() - 3);
  const sun = new Date(mon);
  sun.setUTCDate(mon.getUTCDate() + 6);

  const dateRange = `${mon.getUTCDate()} ${THAI_MONTHS[mon.getUTCMonth()]} - ${sun.getUTCDate()} ${THAI_MONTHS[sun.getUTCMonth()]}`;
  const quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' = weekNo <= 13 ? 'Q1' : weekNo <= 26 ? 'Q2' : weekNo <= 39 ? 'Q3' : 'Q4';
  const isCurrentWeek = weekNo === 36;

  return {
    year,
    week: weekNo,
    label: `W${weekNo}`,
    fullLabel: isCurrentWeek ? `W${weekNo} (สัปดาห์นี้)` : `W${weekNo}`,
    dateRange,
    quarter,
    isCurrentWeek,
  };
}

export interface WeeklyActivityStat {
  week: number;
  year: number;
  label: string; // e.g. "W36"
  displayLabel: string; // e.g. "W36"
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  dateRange: string;
  startDate: string;
  endDate: string;
  completed: number;
  inProgress: number;
  todo: number;
  blocked: number;
  total: number;
  isCurrent: boolean;
}

/**
 * สร้างโครงสร้างครบทั้ง 52 สัปดาห์ของปี (W01 - W52)
 */
export function generateAllWeeksOfYear(year = 2026): WeeklyActivityStat[] {
  const weeks: WeeklyActivityStat[] = [];

  // ใน ISO 8601 วันที่ 4 มกราคมอยู่ในสัปดาห์ที่ 1 เสมอ
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7; // Mon=1, Sun=7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (day - 1));

  const totalWeeks = 52;

  for (let w = 1; w <= totalWeeks; w++) {
    const mon = new Date(week1Monday);
    mon.setUTCDate(week1Monday.getUTCDate() + (w - 1) * 7);
    const sun = new Date(mon);
    sun.setUTCDate(mon.getUTCDate() + 6);

    const dateRange = `${mon.getUTCDate()} ${THAI_MONTHS[mon.getUTCMonth()]} - ${sun.getUTCDate()} ${THAI_MONTHS[sun.getUTCMonth()]}`;
    const quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' = w <= 13 ? 'Q1' : w <= 26 ? 'Q2' : w <= 39 ? 'Q3' : 'Q4';
    const label = `W${w}`;
    const isCurrent = w === 36;

    weeks.push({
      week: w,
      year,
      label,
      displayLabel: label,
      quarter,
      dateRange,
      startDate: mon.toISOString().split('T')[0],
      endDate: sun.toISOString().split('T')[0],
      completed: 0,
      inProgress: 0,
      todo: 0,
      blocked: 0,
      total: 0,
      isCurrent,
    });
  }

  return weeks;
}

/**
 * คำนวณปริมาณงานแยกตามสัปดาห์ตลอดทั้งปี (W01 - W52)
 */
export function calculateWeeklyStats(
  tasks: {
    status: string;
    dueDate?: string;
    startDate?: string;
    updatedAt?: string;
    createdAt?: string;
  }[],
  year = 2026
): WeeklyActivityStat[] {
  const weeks = generateAllWeeksOfYear(year);
  const weekMap: Record<number, WeeklyActivityStat> = {};
  weeks.forEach((w) => {
    weekMap[w.week] = w;
  });

  tasks.forEach((t) => {
    const dateStr = t.dueDate || t.startDate || t.updatedAt || t.createdAt;
    if (!dateStr) return;
    const info = getISOWeekInfo(dateStr);
    if (!info) return;

    const targetWeek = weekMap[info.week];
    if (targetWeek) {
      targetWeek.total += 1;
      if (t.status === 'Completed') {
        targetWeek.completed += 1;
      } else if (t.status === 'In progress') {
        targetWeek.inProgress += 1;
      } else if (t.status === 'Blocked') {
        targetWeek.blocked += 1;
      } else if (t.status === 'Todo') {
        targetWeek.todo += 1;
      }
    }
  });

  return weeks;
}
