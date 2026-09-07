/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Employee } from '../types';

/**
 * แยกรายการ Project IDs / Task IDs จากข้อความ เช่น "AI-001,AI-002,AI-003" หรือ "AI-001, AI-002"
 */
export function parseProjectIds(rawProjectField?: string): string[] {
  if (!rawProjectField) return [];
  const tokens = String(rawProjectField)
    .replace(/[;|\n]/g, ',')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0 && id !== '-' && id !== '—');

  // ขจัดรหัสที่ซ้ำกัน และคงลำดับเดิม
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      unique.push(t);
    }
  }
  return unique;
}

/**
 * ดึงรายการงานที่พนักงานรับผิดชอบ โดยรองรับการอิงทั้ง 2 รูปแบบ:
 * 1. อิงตามรหัส Project ID ในตาราง Employees (เช่น "AI-001, AI-002") ที่ตรงกับ ID ในตาราง Tasks
 * 2. อิงตามชื่อพนักงาน (Name) หรือรหัสพนักงาน (ID) ที่ระบุในช่อง Owner ของตาราง Tasks
 */
export function getTasksForEmployee(emp: Employee, allTasks: Task[]): Task[] {
  const matchedTaskIds = new Set<string>();
  const empName = emp.name ? emp.name.trim().toLowerCase() : '';
  const empId = emp.id ? emp.id.trim().toLowerCase() : '';

  // 1. ตรวจสอบรหัสงานในช่อง Project ID ของพนักงาน (เช่น "AI-001,AI-002,AI-003")
  const assignedIds = new Set(
    [...parseProjectIds(emp.projectId), ...parseProjectIds(emp.project)].map((id) =>
      id.trim().toLowerCase()
    )
  );

  const results: Task[] = [];

  for (const task of allTasks) {
    const taskIdLower = (task.id || '').trim().toLowerCase();
    const taskOwnerLower = (task.owner || '').trim().toLowerCase();

    // เช็คว่าตรงกับรหัสงานหรือรหัสโครงการที่ระบุในตารางพนักงานหรือไม่ (เช่น "AI-001")
    const taskProjectLower = (task.project || '').trim().toLowerCase();
    const taskCategoryLower = (task.category || '').trim().toLowerCase();
    const isIdOrProjectMatch =
      (taskIdLower !== '' && assignedIds.has(taskIdLower)) ||
      (taskProjectLower !== '' && assignedIds.has(taskProjectLower)) ||
      (taskCategoryLower !== '' && assignedIds.has(taskCategoryLower));

    // เช็คว่าตรงกับชื่อพนักงานในช่อง Owner ของตารางงานหรือไม่ (เช่น "ข้าวหอม" หรือ "E02")
    const isOwnerMatch =
      empName !== '' &&
      (taskOwnerLower === empName ||
        taskOwnerLower === empId ||
        taskOwnerLower.split(/[,;\n/|]+/).map((s) => s.trim().toLowerCase()).includes(empName));

    if (isIdOrProjectMatch || isOwnerMatch) {
      if (!matchedTaskIds.has(task.id)) {
        matchedTaskIds.add(task.id);
        results.push(task);
      }
    }
  }

  return results;
}

/**
 * คำนวณจำนวนงานที่พนักงานรับผิดชอบ
 * นับรวมทุกรหัสที่กรอกไว้ในช่อง Project ID (เช่น "AI-001,AI-002,AI-003" = 3 งาน)
 * และนับรวมงานที่ระบุชื่อ Owner ในชีต Tasks ด้วย
 */
export function getEmployeeTaskCount(emp: Employee, allTasks: Task[]): number {
  const matchedTasks = getTasksForEmployee(emp, allTasks);

  // ดึงรายการรหัสงานทั้งหมดที่ระบุไว้ในช่อง Project ID ของพนักงาน
  const rawCodes = [
    ...parseProjectIds(emp.projectId),
    ...parseProjectIds(emp.project),
  ];

  // กรองเฉพาะรหัสงานจริง (ไม่ใช่คำว่า แผนก, Project 1, หรือเครื่องหมายขีด -)
  const taskCodes = Array.from(
    new Set(
      rawCodes
        .map((s) => s.trim())
        .filter(
          (s) =>
            s.length > 0 &&
            s !== '-' &&
            !s.startsWith('แผนก') &&
            s.toLowerCase() !== 'project 1'
        )
        .map((s) => s.toLowerCase())
    )
  );

  // ถ้าระบุรหัสงานไว้ เช่น AI-001,AI-002,AI-003 (3 รายการ) ให้นับรวม 3 งานได้ทันที
  if (taskCodes.length > 0) {
    return Math.max(taskCodes.length, matchedTasks.length);
  }

  if (matchedTasks.length > 0) {
    return matchedTasks.length;
  }

  return emp.tasksCount || 0;
}

/**
 * ดึงรายการงานแบบสมบูรณ์สำหรับแสดงใน Modal รายละเอียดพนักงาน
 * หากมีรหัสใน Project ID (เช่น AI-001, AI-002) แต่ยังไม่มีแถวงานในชีต Tasks
 * จะสร้างเป็นรายการแสดงรหัสงานให้เห็นครบถ้วนตามจำนวนที่นับได้
 */
export function getEmployeeAssignedItems(emp: Employee, allTasks: Task[]): Task[] {
  const realTasks = getTasksForEmployee(emp, allTasks);
  const foundTaskIds = new Set(realTasks.map((t) => (t.id || '').trim().toLowerCase()));

  const rawCodes = [
    ...parseProjectIds(emp.projectId),
    ...parseProjectIds(emp.project),
  ];

  const pendingTasks: Task[] = [];
  const seenCodes = new Set<string>();

  for (const rawCode of rawCodes) {
    const code = rawCode.trim();
    const codeLower = code.toLowerCase();
    if (
      !code ||
      code === '-' ||
      code.startsWith('แผนก') ||
      codeLower === 'project 1' ||
      seenCodes.has(codeLower)
    ) {
      continue;
    }
    seenCodes.add(codeLower);

    // ถ้ารหัสนี้ยังไม่มี Task ใน allTasks ให้สร้างการ์ดรหัสงานเพื่อให้แสดงครบตามจำนวนที่นับ
    if (!foundTaskIds.has(codeLower)) {
      pendingTasks.push({
        id: code,
        title: `งานรหัส ${code} (เชื่อมโยงจากตารางพนักงาน)`,
        category: 'โครงการที่ได้รับมอบหมาย',
        project: code,
        priority: 'Medium',
        status: 'In progress',
        owner: emp.name,
        ownerPhone: emp.phone,
        ownerEmail: emp.email,
        techStack: 'Google Sheet Linked',
        startDate: '',
        dueDate: '',
        duration: '',
        progress: 0,
        progressBar: '0%',
        subtasks: [],
      });
    }
  }

  return [...realTasks, ...pendingTasks];
}
