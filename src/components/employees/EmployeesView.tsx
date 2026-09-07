import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  FolderOpen,
  Eye,
  X,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Employee, Task } from '../../types';
import {
  getTasksForEmployee,
  getEmployeeTaskCount,
  parseProjectIds,
  getEmployeeAssignedItems,
} from '../../utils/employeeUtils';
import { EditEmployeeModal } from './EditEmployeeModal';

interface EmployeesViewProps {
  employees: Employee[];
  tasks: Task[];
  onAddEmployeeClick: () => void;
  onFilterEmployeeTasks: (employee: Employee) => void;
  onUpdateEmployee?: (updated: Employee, originalId?: string) => void;
  onDeleteEmployee?: (empId: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  tasks,
  onAddEmployeeClick,
  onFilterEmployeeTasks,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [activeEmployeeModal, setActiveEmployeeModal] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Departments list
  const departments = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.project)));
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.project.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = selectedDept === 'all' || emp.project === selectedDept;

      return matchSearch && matchDept;
    });
  }, [employees, searchQuery, selectedDept]);

  // Calculate tasks per employee dynamically (รองรับทั้งอิงตามชื่อ Owner และอิงตามรหัส Project ID เช่น "AI-001, AI-002")
  const getEmployeeTasks = (emp: Employee) => {
    return getEmployeeAssignedItems(emp, tasks);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Add Employee Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">รายชื่อพนักงาน</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ข้อมูลติดต่อและภาระงานของทีมงานในระบบ
          </p>
        </div>

        <button
          id="employee-add-btn"
          onClick={onAddEmployeeClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>+ เพิ่มพนักงาน</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="employee-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อพนักงาน, รหัส, แผนก, เบอร์โทร..."
            className="w-full rounded-xl border-0 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="employee-dept-filter"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทุกแผนก / โครงการ</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table (ตารางรายชื่อพนักงาน) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="border-b border-slate-200 bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-5 py-3.5 w-24">
                  ID
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Name / ชื่อพนักงาน
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Project / แผนก
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Number / เบอร์ติดต่อ
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  งานที่รับผิดชอบ
                </th>
                <th scope="col" className="px-5 py-3.5 text-right w-24">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    ไม่พบข้อมูลพนักงานที่ตรงกับคำค้นหา
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const empTasks = getEmployeeTasks(emp);
                  const completedCount = empTasks.filter((t) => t.status === 'Completed').length;
                  const taskCount = getEmployeeTaskCount(emp, tasks);
                  const assignedProjectIds = parseProjectIds(emp.projectId || emp.project);

                  return (
                    <tr
                      key={emp.id}
                      id={`emp-row-${emp.id}`}
                      onClick={() => setActiveEmployeeModal(emp)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* ID */}
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-500 group-hover:text-indigo-600">
                        {emp.id}
                      </td>

                      {/* Name with Avatar */}
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                              {emp.name.slice(0, 1)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{emp.role}</div>
                          </div>
                        </div>
                      </td>

                      {/* Project / Department / Project IDs */}
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5 max-w-[280px]">
                          {assignedProjectIds.length > 0 ? (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-[11px] font-mono font-medium text-indigo-700"
                              title={assignedProjectIds.join(', ')}
                            >
                              <Layers className="h-3 w-3 text-indigo-500 shrink-0" />
                              <span className="truncate">{assignedProjectIds.join(', ')}</span>
                            </span>
                          ) : (
                            <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                              {emp.project || '-'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone / Number */}
                      <td className="px-5 py-3.5 text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-slate-800 flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {emp.phone}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {emp.email}
                          </span>
                        </div>
                      </td>

                      {/* Tasks count & breakdown */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                            {taskCount} งาน
                          </span>
                          {completedCount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              (เสร็จ {completedCount})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            id={`emp-view-btn-${emp.id}`}
                            onClick={() => setActiveEmployeeModal(emp)}
                            className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-indigo-700 font-medium bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="ดูรายละเอียดข้อมูลพนักงาน"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>ดูข้อมูล</span>
                          </button>
                          <button
                            type="button"
                            id={`emp-edit-btn-${emp.id}`}
                            onClick={() => setEditingEmployee(emp)}
                            className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลพนักงาน"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            type="button"
                            id={`emp-delete-btn-${emp.id}`}
                            onClick={() => setDeletingEmployee(emp)}
                            className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-medium bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="ลบพนักงาน"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>ลบ</span>
                          </button>
                          <button
                            type="button"
                            id={`emp-tasks-btn-${emp.id}`}
                            onClick={() => onFilterEmployeeTasks(emp)}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="ดูงานทั้งหมดที่พนักงานคนนี้รับผิดชอบ"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>ดูงาน</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <div>
            พนักงานทั้งหมด <strong>{filteredEmployees.length}</strong> คน
          </div>
        </div>
      </div>

      {/* Employee Quick Detail Modal */}
      {activeEmployeeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setActiveEmployeeModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {activeEmployeeModal.id}
                </span>
                <h3 className="text-base font-bold">ข้อมูลพนักงาน (Employee Detail)</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveEmployeeModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {activeEmployeeModal.avatar ? (
                  <img
                    src={activeEmployeeModal.avatar}
                    alt={activeEmployeeModal.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xl shrink-0">
                    {activeEmployeeModal.name.slice(0, 1)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{activeEmployeeModal.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activeEmployeeModal.role}</p>
                  <p className="text-xs font-medium text-indigo-600 mt-1">
                    {activeEmployeeModal.project}
                  </p>
                </div>
              </div>

            <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> เบอร์โทรศัพท์:
                </span>
                <span className="font-medium text-slate-900">{activeEmployeeModal.phone}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> อีเมล:
                </span>
                <span className="font-medium text-slate-900">{activeEmployeeModal.email}</span>
              </div>
            </div>

            {/* Tasks assigned */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  งานที่ได้รับมอบหมาย ({getEmployeeTasks(activeEmployeeModal).length} รายการ)
                </div>
                <span className="text-[10px] text-indigo-600 font-medium">
                  จับคู่อัตโนมัติ: Project ID + Owner
                </span>
              </div>

              {/* Project ID Badges from Sheet Column D */}
              {parseProjectIds(activeEmployeeModal.projectId || activeEmployeeModal.project).length > 0 && (
                <div className="mb-2.5 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100/80">
                  <div className="text-[10px] font-semibold text-indigo-800 mb-1 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-indigo-600" />
                    รหัสงานในชีต (Project ID):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {parseProjectIds(activeEmployeeModal.projectId || activeEmployeeModal.project).map((pId) => (
                      <span
                        key={pId}
                        className="font-mono text-[10px] bg-white border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded"
                      >
                        {pId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {getEmployeeTasks(activeEmployeeModal).length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
                    ยังไม่มีรายการงานที่เชื่อมโยงกับรหัส Project ID หรือชื่อพนักงานนี้
                  </div>
                ) : (
                  getEmployeeTasks(activeEmployeeModal).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-[11px] font-medium text-indigo-600 mr-2">{t.id}</span>
                        <span className="font-medium text-slate-800 truncate">{t.title}</span>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.status === 'In progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const emp = activeEmployeeModal;
                      setActiveEmployeeModal(null);
                      setEditingEmployee(emp);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>แก้ไขข้อมูล</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const emp = activeEmployeeModal;
                      setActiveEmployeeModal(null);
                      setDeletingEmployee(emp);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-medium bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>ลบพนักงาน</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const emp = activeEmployeeModal;
                      setActiveEmployeeModal(null);
                      onFilterEmployeeTasks(emp);
                    }}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    ดูในหน้ารายการงาน
                  </button>
                  <button
                    onClick={() => setActiveEmployeeModal(null)}
                    className="rounded-xl border border-slate-200 hover:bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <EditEmployeeModal
          isOpen={!!editingEmployee}
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUpdateEmployee={(updated, origId) => {
            if (onUpdateEmployee) {
              onUpdateEmployee(updated, origId);
            }
          }}
          onDeleteEmployee={(empId) => {
            if (onDeleteEmployee) {
              onDeleteEmployee(empId);
            }
          }}
          projects={departments}
        />
      )}

      {/* Delete Employee Confirmation Modal */}
      {deletingEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setDeletingEmployee(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">ลบรายชื่อพนักงาน</h4>
                <p className="text-xs text-slate-500">ยืนยันการนำพนักงานออกจากระบบ</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              คุณต้องการลบ <strong>{deletingEmployee.name}</strong> (รหัส {deletingEmployee.id})
              ใช่หรือไม่? ข้อมูลพนักงานจะถูกลบออกจากระบบทันที
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                id="confirm-delete-emp-btn"
                onClick={() => {
                  if (onDeleteEmployee) {
                    onDeleteEmployee(deletingEmployee.id);
                  }
                  setDeletingEmployee(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
