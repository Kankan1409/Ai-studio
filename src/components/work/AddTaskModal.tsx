import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  Users,
  Briefcase,
  CheckSquare,
  Layers,
  Copy,
  Info,
} from 'lucide-react';
import { Task, Priority, TaskStatus, Employee, Subtask } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Task | Task[]) => void;
  employees: Employee[];
  projects: string[];
  existingTasks: Task[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  employees,
  projects,
  existingTasks,
}) => {
  // Mode: 'shared' (1 Card, subtasks can have individual assignees) OR 'template' (Batch generate cards with same checklist for selected employees)
  const [mode, setMode] = useState<'shared' | 'template'>('shared');

  // Common Task Fields
  const [title, setTitle] = useState('');
  const [project, setProject] = useState(projects[0] || 'Project 1');
  const [category, setCategory] = useState(projects[0] || 'แผนก/ITW');
  const [techStack, setTechStack] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [duration, setDuration] = useState('7 วัน');
  const [resultOutcome, setResultOutcome] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [description, setDescription] = useState('');

  // Auto-calculate duration helper
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val && dueDate) {
      const d1 = new Date(val).getTime();
      const d2 = new Date(dueDate).getTime();
      if (!isNaN(d1) && !isNaN(d2)) {
        const days = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
        setDuration(`${days} วัน`);
      }
    }
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    if (startDate && val) {
      const d1 = new Date(startDate).getTime();
      const d2 = new Date(val).getTime();
      if (!isNaN(d1) && !isNaN(d2)) {
        const days = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
        setDuration(`${days} วัน`);
      }
    }
  };

  // Mode 1: Shared Task State
  const [owner, setOwner] = useState(employees[0]?.name || 'พี่ไมค์');
  const [sharedSubtasks, setSharedSubtasks] = useState<
    Array<{ id: string; title: string; assignee?: string }>
  >([
    { id: 'st-1', title: 'ตรวจสอบข้อกำหนดและรายละเอียดงาน', assignee: employees[0]?.name || '' },
    { id: 'st-2', title: 'เริ่มลงมือปฏิบัติงานตามขั้นตอน', assignee: employees[1]?.name || employees[0]?.name || '' },
  ]);
  const [newSharedSubtaskTitle, setNewSharedSubtaskTitle] = useState('');
  const [newSharedSubtaskAssignee, setNewSharedSubtaskAssignee] = useState(employees[0]?.name || '');

  // Mode 2: Template Batch Assign State
  const [selectedEmployeeNames, setSelectedEmployeeNames] = useState<string[]>(
    employees.slice(0, 3).map((e) => e.name)
  );
  const [templateChecklist, setTemplateChecklist] = useState<string[]>([
    'ตรวจสอบความพร้อมของงาน',
    'ดำเนินการปฏิบัติงานตามมาตรฐาน',
    'สรุปผลและรายงานความคืบหน้า',
  ]);
  const [newTemplateItem, setNewTemplateItem] = useState('');

  // Calculate next PID base number
  const nextBaseId = React.useMemo(() => {
    const nums = existingTasks
      .map((t) => {
        const match = t.id.match(/PID-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    return nums.length > 0 ? Math.max(...nums) + 1 : 101;
  }, [existingTasks]);

  if (!isOpen) return null;

  // Toggle employee selection in Template mode
  const handleToggleEmployee = (empName: string) => {
    setSelectedEmployeeNames((prev) =>
      prev.includes(empName) ? prev.filter((n) => n !== empName) : [...prev, empName]
    );
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployeeNames.length === employees.length) {
      setSelectedEmployeeNames([]);
    } else {
      setSelectedEmployeeNames(employees.map((e) => e.name));
    }
  };

  // Add subtask in Shared mode
  const handleAddSharedSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSharedSubtaskTitle.trim()) return;
    setSharedSubtasks((prev) => [
      ...prev,
      {
        id: `st-init-${Date.now()}-${prev.length}`,
        title: newSharedSubtaskTitle.trim(),
        assignee: newSharedSubtaskAssignee.trim() || undefined,
      },
    ]);
    setNewSharedSubtaskTitle('');
  };

  const handleRemoveSharedSubtask = (id: string) => {
    setSharedSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // Add template item in Template mode
  const handleAddTemplateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateItem.trim()) return;
    setTemplateChecklist((prev) => [...prev, newTemplateItem.trim()]);
    setNewTemplateItem('');
  };

  const handleRemoveTemplateItem = (index: number) => {
    setTemplateChecklist((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const baseDueDate = dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    if (mode === 'shared') {
      // Create 1 Shared Task
      const ownerData = employees.find((e) => e.name === owner);
      const subtasksFormatted: Subtask[] = sharedSubtasks.map((s, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title: s.title,
        completed: false,
        assignee: s.assignee || undefined,
      }));

      const newTask: Task = {
        id: `PID-${nextBaseId}`,
        title: title.trim(),
        project,
        category: category.trim() || project,
        techStack: techStack.trim(),
        priority,
        status,
        owner,
        ownerPhone: ownerData?.phone || '',
        ownerEmail: ownerData?.email || '',
        ownerAvatar: ownerData?.avatar,
        startDate: startDate || today,
        dueDate: baseDueDate,
        duration: duration.trim() || '7 วัน',
        resultOutcome: resultOutcome.trim(),
        projectLink: projectLink.trim(),
        description: description.trim(),
        progress: status === 'Completed' ? 100 : status === 'In progress' ? 25 : 0,
        subtasks: subtasksFormatted,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onAddTask(newTask);
    } else {
      // Create Batch Tasks (1 Card for each selected employee)
      if (selectedEmployeeNames.length === 0) {
        alert('กรุณาเลือกพนักงานอย่างน้อย 1 คนสำหรับการสร้างการ์ด');
        return;
      }

      const newTasks: Task[] = selectedEmployeeNames.map((empName, index) => {
        const emp = employees.find((e) => e.name === empName);
        const subtasksCopy: Subtask[] = templateChecklist.map((itemTitle, subIdx) => ({
          id: `st-tmpl-${Date.now()}-${index}-${subIdx}`,
          title: itemTitle,
          completed: false,
          assignee: empName, // Default to this employee
        }));

        return {
          id: `PID-${nextBaseId + index}`,
          title: title.trim(),
          project,
          category: category.trim() || project,
          techStack: techStack.trim(),
          priority,
          status,
          owner: empName,
          ownerPhone: emp?.phone || '',
          ownerEmail: emp?.email || '',
          ownerAvatar: emp?.avatar,
          startDate: startDate || today,
          dueDate: baseDueDate,
          duration: duration.trim() || '7 วัน',
          resultOutcome: resultOutcome.trim(),
          projectLink: projectLink.trim(),
          description: description.trim(),
          progress: 0,
          subtasks: subtasksCopy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      onAddTask(newTasks);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="add-task-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold">สร้างงานใหม่ (+ Add Task)</h3>
            <p className="text-xs text-slate-400">เลือกรูปแบบการสร้างงานและกำหนดรายการ Checklist</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              id="mode-shared-btn"
              onClick={() => setMode('shared')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'shared'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>การ์ดร่วม (Shared Subtasks)</span>
            </button>

            <button
              type="button"
              id="mode-template-btn"
              onClick={() => setMode('template')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'template'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Copy className="h-4 w-4" />
              <span>แจกการ์ดตามคน (Template Checklist)</span>
            </button>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            {mode === 'shared' ? (
              <span>
                <strong>การ์ดร่วม 1 ใบ:</strong> เหมาะกับงานที่เป็นโปรเจกต์เดียวกัน โดยแต่ละข้อใน Checklist สามารถมอบหมายให้พนักงานคนละคนได้
              </span>
            ) : (
              <span>
                <strong>Template Checklist:</strong> เหมาะกับงานที่ทุกคนต้องทำเหมือนกัน ระบบจะสร้างการ์ดแยกของแต่ละคนให้อัตโนมัติด้วยชุด Checklist เดียวกัน
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* PID Preview */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {mode === 'shared' ? 'รหัสงานที่จะสร้าง' : 'รหัสงานเริ่มต้น (Sequential IDs)'}
            </span>
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              {mode === 'shared'
                ? `PID-${nextBaseId}`
                : `PID-${nextBaseId} ถึง PID-${nextBaseId + Math.max(0, selectedEmployeeNames.length - 1)}`}
            </span>
          </div>

          {/* Title and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อโปรเจกต์ / ชื่องาน (Project Name / Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ระบบ Task Manager Dashboard, ออกแบบแบนเนอร์..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่ (Category)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="เช่น แผนก/ITW, งานระบบ..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Project & Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                โครงการ / แผนก (Project)
              </label>
              <select
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  if (!category || projects.includes(category)) {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tech Stack / เครื่องมือที่ใช้ (Tools)
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="เช่น React, Google Apps Script, Figma, Excel..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Lead Owner / Card count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mode === 'shared' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ผู้รับผิดชอบหลัก (Lead Owner)
                </label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      👤 {emp.name} ({emp.project})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนการ์ดที่จะสร้าง
                </label>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-indigo-700">
                  สร้าง {selectedEmployeeNames.length} การ์ด (แยกตามบุคคล)
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ความสำคัญ (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="High">High (ด่วนมาก)</option>
                <option value="Medium">Medium (ปานกลาง)</option>
                <option value="Low">Low (ปกติ)</option>
              </select>
            </div>
          </div>

          {/* MODE 2: Employee Multi-selection Checkboxes */}
          {mode === 'template' && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>เลือกพนักงานที่จะได้รับการ์ดใบนี้ ({selectedEmployeeNames.length}/{employees.length} คน)</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllEmployees}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  {selectedEmployeeNames.length === employees.length ? 'ยกเลิกทั้งหมด' : 'เลือกทุกคน'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-36 overflow-y-auto">
                {employees.map((emp) => {
                  const isChecked = selectedEmployeeNames.includes(emp.name);
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-white border-indigo-400 font-semibold text-indigo-950 shadow-2xs'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEmployee(emp.name)}
                        className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate">{emp.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันเริ่ม (Start Date)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                กำหนดส่ง (Due Date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระยะเวลา (Duration)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="เช่น 7 วัน, 2 สัปดาห์"
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะแรกเริ่ม (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Todo">Todo (รอดำเนินการ)</option>
                <option value="In progress">In progress (กำลังทำ)</option>
                <option value="Completed">Completed (เสร็จสิ้น)</option>
                <option value="Blocked">Blocked (ติดปัญหา)</option>
              </select>
            </div>
          </div>

          {/* SECTION: CHECKLIST BUILDER */}
          {mode === 'shared' ? (
            /* Shared Checklist with Subtask Assignees */
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                  <span>กำหนดรายการ Checklist และผู้รับผิดชอบแต่ละข้อ</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {sharedSubtasks.length} รายการ
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {sharedSubtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs"
                  >
                    <span className="text-slate-800 flex-1 truncate">{st.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={st.assignee || ''}
                        onChange={(e) => {
                          const newAssignee = e.target.value;
                          setSharedSubtasks((prev) =>
                            prev.map((s) => (s.id === st.id ? { ...s, assignee: newAssignee } : s))
                          );
                        }}
                        className="text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-0.5 cursor-pointer"
                        title="เปลี่ยนผู้รับผิดชอบข้อย่อยนี้"
                      >
                        <option value="">👤 (ไม่ระบุคน)</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            👤 {emp.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveSharedSubtask(st.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="ลบข้อนี้"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item row */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={newSharedSubtaskTitle}
                  onChange={(e) => setNewSharedSubtaskTitle(e.target.value)}
                  placeholder="+ เพิ่มข้อรายการย่อยใหม่..."
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newSharedSubtaskAssignee}
                    onChange={(e) => setNewSharedSubtaskAssignee(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 cursor-pointer"
                  >
                    <option value="">👤 (ไม่ระบุคน)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        👤 {emp.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSharedSubtask}
                    className="rounded-lg bg-slate-800 hover:bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer shrink-0"
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Template Checklist for Batch Assign */
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                  <span>ชุด Checklist แม่แบบ (ทุกคนจะได้รับรายการเหล่านี้)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {templateChecklist.length} รายการ
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {templateChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs"
                  >
                    <span className="text-slate-800 flex-1 truncate">
                      {idx + 1}. {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTemplateItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="ลบข้อนี้"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add item row */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newTemplateItem}
                  onChange={(e) => setNewTemplateItem(e.target.value)}
                  placeholder="+ เพิ่มข้อรายการแม่แบบใหม่..."
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTemplateItem}
                  className="rounded-lg bg-slate-800 hover:bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer shrink-0"
                >
                  เพิ่ม
                </button>
              </div>
            </div>
          )}

          {/* Result / Outcome & Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ผลลัพธ์ / ผลสัมฤทธิ์ (Result / Outcome)
              </label>
              <input
                type="text"
                value={resultOutcome}
                onChange={(e) => setResultOutcome(e.target.value)}
                placeholder="เช่น ระบบพร้อมใช้งาน 100%, แบบผ่านการอนุมัติ..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ลิงก์โปรเจกต์ (Project Link / URL)
              </label>
              <input
                type="url"
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                placeholder="https://github.com/... หรือ https://docs.google.com/..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำอธิบายเพิ่มเติม (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุข้อกำหนด หรือรายละเอียดของงาน..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="submit-add-task-btn"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {mode === 'shared' ? 'สร้างการ์ดร่วม' : `สร้างการ์ดสำหรับ ${selectedEmployeeNames.length} คน`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
