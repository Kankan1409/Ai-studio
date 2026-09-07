/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Employee } from '../types';

/**
 * Extracts and normalizes tokens from a delimited string (commas, semicolons, newlines, spaces)
 */
export function extractTokens(value?: string): string[] {
  if (!value) return [];
  return String(value)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Checks if a specific task is assigned to an employee using two-way smart linking:
 * 1. Match via Employee's Project ID list:
 *    If in Employees sheet, 'Project ID' contains task IDs (e.g. "AI-001, AI-002"),
 *    then any task whose ID is in that list is assigned to this employee.
 * 2. Match via Task's Owner:
 *    If in Tasks sheet, 'Owner' equals or contains employee's name (e.g. "ข้าวหอม")
 *    or employee's ID (e.g. "E02"), or comma-separated list ("ข้าวหอม, สมชาย").
 * 3. Match via Project / Category:
 *    If task.project matches employee.projectId / employee.project (e.g. "Project 1").
 * 4. Match via Phone / Email:
 *    If task.ownerPhone matches employee.phone (when not empty).
 */
export function isTaskAssignedToEmployee(task: Task, employee: Employee): boolean {
  if (!task || !employee) return false;

  const taskId = (task.id || '').trim().toLowerCase();
  const taskOwner = (task.owner || '').trim().toLowerCase();
  const taskProject = (task.project || task.category || '').trim().toLowerCase();

  const empName = (employee.name || '').trim().toLowerCase();
  const empId = (employee.id || '').trim().toLowerCase();
  const empProjectRaw = (employee.projectId || employee.project || '').trim();

  // 1. Employee's Project ID tokens (e.g. "AI-001,AI-002" or "AI-001, AI-002, AI-003")
  const empProjectTokens = extractTokens(empProjectRaw).map((t) => t.toLowerCase());
  if (taskId && empProjectTokens.includes(taskId)) {
    return true;
  }

  // 2. Exact or substring match on Owner by Employee Name
  if (empName && taskOwner) {
    if (taskOwner === empName) return true;
    // Check if taskOwner contains empName as a distinct token
    const ownerTokens = extractTokens(taskOwner).map((t) => t.toLowerCase());
    if (ownerTokens.includes(empName) || ownerTokens.some((t) => t.includes(empName))) {
      return true;
    }
  }

  // 3. Exact or token match on Owner by Employee ID (e.g. "E02")
  if (empId && taskOwner) {
    if (taskOwner === empId) return true;
    const ownerTokens = extractTokens(taskOwner).map((t) => t.toLowerCase());
    if (ownerTokens.includes(empId)) return true;
  }

  // 4. Match via Phone
  if (employee.phone && task.ownerPhone) {
    const cleanEmpPhone = employee.phone.replace(/[^0-9]/g, '');
    const cleanTaskPhone = task.ownerPhone.replace(/[^0-9]/g, '');
    if (cleanEmpPhone && cleanTaskPhone && cleanEmpPhone === cleanTaskPhone) {
      return true;
    }
  }

  // 5. Match if employee is explicitly assigned to an entire Project code (e.g. "Project 1")
  if (taskProject && empProjectTokens.includes(taskProject)) {
    return true;
  }

  return false;
}

/**
 * Returns all tasks assigned to a specific employee
 */
export function getTasksForEmployee(employee: Employee, tasks: Task[]): Task[] {
  return tasks.filter((t) => isTaskAssignedToEmployee(t, employee));
}

/**
 * Calculates task counts and completion stats for an employee
 */
export function getEmployeeTaskStats(employee: Employee, tasks: Task[]) {
  const empTasks = getTasksForEmployee(employee, tasks);
  const completed = empTasks.filter((t) => t.status === 'Completed').length;
  const inProgress = empTasks.filter((t) => t.status === 'In progress').length;
  const blocked = empTasks.filter((t) => t.status === 'Blocked').length;
  const todo = empTasks.filter((t) => t.status === 'Todo').length;

  return {
    total: empTasks.length > 0 ? empTasks.length : (employee.tasksCount || 0),
    actualTasks: empTasks,
    completed,
    inProgress,
    blocked,
    todo,
  };
}
