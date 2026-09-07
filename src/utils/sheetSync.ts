/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Employee, Priority, TaskStatus, Subtask } from '../types';
import { getTasksForEmployee, getEmployeeTaskCount } from './employeeUtils';

export interface SyncResult {
  success: boolean;
  tasks: Task[];
  employees: Employee[];
  message?: string;
  sourceType: 'gas_web_app' | 'google_sheet' | 'unknown';
}

/**
 * Helper to extract Google Spreadsheet ID from any standard Google Sheets URL
 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch and parse a Google Sheet tab directly via Google Visualization API (GViz)
 */
async function fetchSheetTabGviz(spreadsheetId: string, sheetName: string): Promise<{ headers: string[]; rows: any[][] }> {
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(gvizUrl);
  if (!response.ok) {
    throw new Error(`ไม่สามารถเข้าถึงแผ่นงาน "${sheetName}" (HTTP ${response.status}) - ตรวจสอบว่าได้ตั้งค่าสิทธิ์แชร์ชีตเป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู" แล้ว`);
  }

  const text = await response.text();
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error(`รูปแบบข้อมูลของชีต "${sheetName}" ไม่ถูกต้อง`);
  }

  const data = JSON.parse(jsonMatch[1]);
  if (data.status !== 'ok') {
    throw new Error(data.errors?.[0]?.message || `ไม่สามารถอ่านข้อมูลชีต "${sheetName}" ได้`);
  }

  const cols = data.table?.cols || [];
  const rawRows = data.table?.rows || [];

  const headers = cols.map((col: any) => (col?.label || '').trim());

  const rows = rawRows.map((r: any) => {
    return (r.c || []).map((cell: any) => {
      if (!cell) return '';
      // Prefer formatted string or value
      return cell.f !== undefined && cell.f !== null ? cell.f : (cell.v !== undefined && cell.v !== null ? cell.v : '');
    });
  });

  return { headers, rows };
}

/**
 * Main synchronizer function:
 * Supports both Google Apps Script Web App endpoints and Direct Google Sheets URLs
 */
export async function syncDataFromSource(url: string): Promise<SyncResult> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return {
      success: false,
      tasks: [],
      employees: [],
      message: 'กรุณาระบุ URL ของ Google Apps Script หรือ Google Sheet',
      sourceType: 'unknown',
    };
  }

  // 1. Google Sheets Direct URL (via GViz API)
  const sheetId = extractSpreadsheetId(cleanUrl);
  if (sheetId) {
    try {
      // Try to fetch Tasks sheet (or first tab fallback)
      let taskData;
      try {
        taskData = await fetchSheetTabGviz(sheetId, 'Tasks');
      } catch {
        // Try fallback to standard tab name
        taskData = await fetchSheetTabGviz(sheetId, 'Sheet1');
      }

      // Try to fetch Employees sheet
      let empData;
      try {
        empData = await fetchSheetTabGviz(sheetId, 'Employees');
      } catch {
        // Fallback: try Sheet2 or empty
        try {
          empData = await fetchSheetTabGviz(sheetId, 'Sheet2');
        } catch {
          empData = { headers: [], rows: [] };
        }
      }

      const tasks: Task[] = [];
      const taskHeaders = taskData.headers;

      // Find header column indices
      const findCol = (names: string[]) => {
        return taskHeaders.findIndex((h) => names.some((n) => h.toLowerCase() === n.toLowerCase()));
      };

      const idIdx = findCol(['Project ID', 'ID', 'Task ID', 'รหัส']);
      const titleIdx = findCol(['Project Name', 'Title', 'ชื่องาน', 'ProjectName']);
      const catIdx = findCol(['Category', 'หมวดหมู่', 'Project']);
      const descIdx = findCol(['Description', 'รายละเอียด']);
      const techIdx = findCol(['Tech Stack / Tools', 'TechStack', 'Tools', 'เครื่องมือ']);
      const startIdx = findCol(['Start Date', 'StartDate', 'วันที่เริ่ม']);
      const dueIdx = findCol(['Due Date', 'DueDate', 'กำหนดส่ง']);
      const durationIdx = findCol(['Duration', 'ระยะเวลา']);
      const ownerIdx = findCol(['Owner', 'ผู้รับผิดชอบ']);
      const priorityIdx = findCol(['Priority', 'ความสำคัญ']);
      const statusIdx = findCol(['Status', 'สถานะ']);
      const outcomeIdx = findCol(['Result / Outcome', 'Result', 'ผลลัพธ์']);
      const linkIdx = findCol(['Project Link', 'Link', 'URL']);
      const progIdx = findCol(['Project Progress', 'Progress', 'ความคืบหน้า']);
      const progBarIdx = findCol(['Progress Bar', 'ProgressBar']);
      const subtasksIdx = findCol([
        'Subtasks',
        'Subtask',
        'Checklist',
        'Detail Checklist',
        'Detail checklist',
        'Check list',
        'งานย่อย',
        'รายการย่อย',
        'Detail',
      ]);

      const parseSubtasksFromSheet = (raw: unknown): Subtask[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        const str = String(raw).trim();
        if (!str) return [];

        // Support backward compatibility if previous rows stored JSON
        if (str.startsWith('[') && str.endsWith(']')) {
          try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed)) {
              return parsed.map((item, idx) => {
                if (typeof item === 'string') {
                  return { id: `st-${idx + 1}`, title: item, completed: false };
                }
                return {
                  id: item.id || `st-${idx + 1}`,
                  title: item.title || item.name || '',
                  completed: Boolean(item.completed),
                  assignee: item.assignee || undefined,
                };
              });
            }
          } catch {
            // fallback to plain text below
          }
        }

        // Plain text parsing (only the text typed in the box, line by line or comma separated)
        const lines = str
          .split(/[\r\n]+/)
          .map((s) => s.trim())
          .filter(Boolean);

        if (lines.length > 0) {
          return lines.map((line, idx) => ({
            id: `st-${idx + 1}`,
            title: line.replace(/^[-•*]\s*/, ''),
            completed: false,
          }));
        }

        return [];
      };

      taskData.rows.forEach((row, i) => {
        // Check if row has any non-empty cell
        const hasContent = row.some((cell) => cell !== '' && cell !== null && cell !== undefined);
        if (!hasContent) return;

        const idVal = (idIdx >= 0 ? String(row[idIdx] || '') : `PID-${101 + i}`).trim();
        const titleVal = (titleIdx >= 0 ? String(row[titleIdx] || '') : (row[2] ? String(row[2]) : `งานที่ ${i + 1}`)).trim();
        if (!titleVal && !idVal) return;

        const categoryVal = (catIdx >= 0 ? String(row[catIdx] || '') : (row[1] ? String(row[1]) : 'ทั่วไป')).trim();
        const priorityVal = (priorityIdx >= 0 ? String(row[priorityIdx] || '') : 'Medium').trim() as Priority;
        const statusVal = (statusIdx >= 0 ? String(row[statusIdx] || '') : 'Todo').trim() as TaskStatus;

        let progress = 0;
        if (progIdx >= 0 && row[progIdx] !== undefined && row[progIdx] !== '') {
          const raw = String(row[progIdx]).replace('%', '').trim();
          const parsed = parseFloat(raw);
          if (!isNaN(parsed)) {
            progress = parsed > 0 && parsed <= 1 ? Math.round(parsed * 100) : Math.round(parsed);
          }
        }

        tasks.push({
          id: idVal || `PID-${101 + i}`,
          title: titleVal,
          category: categoryVal || 'ทั่วไป',
          project: categoryVal || 'Project 1',
          description: descIdx >= 0 ? String(row[descIdx] || '').trim() : '',
          techStack: techIdx >= 0 ? String(row[techIdx] || '').trim() : '',
          startDate: startIdx >= 0 ? String(row[startIdx] || '').trim() : '',
          dueDate: dueIdx >= 0 ? String(row[dueIdx] || '').trim() : '',
          duration: durationIdx >= 0 ? String(row[durationIdx] || '').trim() : '',
          owner: ownerIdx >= 0 ? String(row[ownerIdx] || '').trim() : '',
          priority: ['High', 'Medium', 'Low'].includes(priorityVal) ? priorityVal : 'Medium',
          status: ['Todo', 'In progress', 'Completed', 'Blocked'].includes(statusVal) ? statusVal : 'Todo',
          resultOutcome: outcomeIdx >= 0 ? String(row[outcomeIdx] || '').trim() : '',
          projectLink: linkIdx >= 0 ? String(row[linkIdx] || '').trim() : '',
          progress,
          progressBar: progBarIdx >= 0 ? String(row[progBarIdx] || `${progress}%`).trim() : `${progress}%`,
          subtasks: subtasksIdx >= 0 ? parseSubtasksFromSheet(row[subtasksIdx]) : [],
          updatedAt: new Date().toISOString(),
        });
      });

      // Parse Employees
      const employees: Employee[] = [];
      const empHeaders = empData.headers;
      const empIdIdx = empHeaders.findIndex((h) => ['id', 'รหัส'].includes(h.toLowerCase()));
      const empNameIdx = empHeaders.findIndex((h) => ['name', 'ชื่อ', 'ชื่อพนักงาน'].includes(h.toLowerCase()));
      const empPhoneIdx = empHeaders.findIndex((h) => ['phone', 'เบอร์โทร'].includes(h.toLowerCase()));
      const empProjIdx = empHeaders.findIndex((h) => ['project id', 'project', 'โครงการ'].includes(h.toLowerCase()));

      empData.rows.forEach((row, i) => {
        const hasContent = row.some((cell) => cell !== '' && cell !== null && cell !== undefined);
        if (!hasContent) return;

        const idVal = (empIdIdx >= 0 ? String(row[empIdIdx] || '') : (row[0] ? String(row[0]) : `E0${i + 1}`)).trim();
        const nameVal = (empNameIdx >= 0 ? String(row[empNameIdx] || '') : (row[1] ? String(row[1]) : '')).trim();
        if (!nameVal) return;

        const phoneVal = (empPhoneIdx >= 0 ? String(row[empPhoneIdx] || '') : (row[2] ? String(row[2]) : '')).trim();
        const projVal = (empProjIdx >= 0 ? String(row[empProjIdx] || '') : (row[3] ? String(row[3]) : 'Project 1')).trim();

        const empObj: Employee = {
          id: idVal || `E0${i + 1}`,
          name: nameVal,
          phone: phoneVal,
          projectId: projVal,
          project: projVal,
          role: 'Team Member',
        };
        empObj.tasksCount = getEmployeeTaskCount(empObj, tasks);
        employees.push(empObj);
      });

      return {
        success: true,
        tasks,
        employees,
        message: `ดึงข้อมูลตรงจาก Google Sheet สำเร็จ: พบข้อมูล ${tasks.length} งาน และ ${employees.length} พนักงาน`,
        sourceType: 'google_sheet',
      };
    } catch (err: any) {
      return {
        success: false,
        tasks: [],
        employees: [],
        message: `เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheet: ${err.message}`,
        sourceType: 'google_sheet',
      };
    }
  }

  // 2. Google Apps Script Web App Endpoint
  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${cleanUrl}${separator}action=getAll`;

    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return {
        success: false,
        tasks: [],
        employees: [],
        message: `ไม่สามารถดึงข้อมูลจาก Apps Script ได้ (HTTP ${res.status})`,
        sourceType: 'gas_web_app',
      };
    }

    const data = await res.json();
    if (data.status === 'success' || data.success === true) {
      const tasks = (data.tasks || []).map((t: any) => ({
        ...t,
        category: t.category || t.project || 'ทั่วไป',
        project: t.project || t.category || 'Project 1',
        priority: t.priority || 'Medium',
        status: t.status || 'Todo',
        progress: typeof t.progress === 'number' ? t.progress : 0,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
      }));

      const employees = (data.employees || []).map((e: any) => {
        const empObj: Employee = {
          ...e,
          projectId: e.projectId || e.project || '',
          project: e.project || e.projectId || 'Project 1',
        };
        empObj.tasksCount = getEmployeeTaskCount(empObj, tasks);
        return empObj;
      });

      return {
        success: true,
        tasks,
        employees,
        message: `ซิงค์ข้อมูลจาก Apps Script สำเร็จ: พบข้อมูล ${tasks.length} งาน และ ${employees.length} พนักงาน`,
        sourceType: 'gas_web_app',
      };
    } else {
      return {
        success: false,
        tasks: [],
        employees: [],
        message: data.message || data.error || 'Apps Script ตอบกลับสถานะไม่สำเร็จ',
        sourceType: 'gas_web_app',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      tasks: [],
      employees: [],
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`,
      sourceType: 'gas_web_app',
    };
  }
}
