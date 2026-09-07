import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDot,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  Share2,
  ArrowLeft,
  Briefcase,
  Phone,
  Mail,
  Flame,
  ExternalLink,
  Wrench,
  Link as LinkIcon,
  Award,
} from 'lucide-react';
import { Task, TaskStatus, Priority, Subtask, Employee } from '../../types';

interface WorkDetailModalProps {
  task: Task | null;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
  task,
  employees,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedProject, setEditedProject] = useState(task?.project || '');
  const [editedCategory, setEditedCategory] = useState(task?.category || task?.project || '');
  const [editedTechStack, setEditedTechStack] = useState(task?.techStack || '');
  const [editedPriority, setEditedPriority] = useState<Priority>(task?.priority || 'Medium');
  const [editedStatus, setEditedStatus] = useState<TaskStatus>(task?.status || 'Todo');
  const [editedOwner, setEditedOwner] = useState(task?.owner || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  const [editedStartDate, setEditedStartDate] = useState(task?.startDate || '');
  const [editedDueDate, setEditedDueDate] = useState(task?.dueDate || '');
  const [editedDuration, setEditedDuration] = useState(task?.duration || '');
  const [editedResultOutcome, setEditedResultOutcome] = useState(task?.resultOutcome || '');
  const [editedProjectLink, setEditedProjectLink] = useState(task?.projectLink || '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState(task?.owner || employees[0]?.name || '');
  const [subtaskAssigneeFilter, setSubtaskAssigneeFilter] = useState<string>('all');

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedProject(task.project);
      setEditedCategory(task.category || task.project || '');
      setEditedTechStack(task.techStack || '');
      setEditedPriority(task.priority);
      setEditedStatus(task.status);
      setEditedOwner(task.owner);
      setEditedDescription(task.description || '');
      setEditedStartDate(task.startDate || '');
      setEditedDueDate(task.dueDate || '');
      setEditedDuration(task.duration || '');
      setEditedResultOutcome(task.resultOutcome || '');
      setEditedProjectLink(task.projectLink || '');
      setSubtasks(task.subtasks ? [...task.subtasks] : []);
      setNewSubtaskAssignee(task.owner || employees[0]?.name || '');
      setSubtaskAssigneeFilter('all');
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // Find owner details
  const ownerObj = employees.find((e) => e.name === task.owner);

  const handleToggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updated);

    // Calculate new progress
    const completedCount = updated.filter((s) => s.completed).length;
    const progress = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;

    // Automatically update task status if all completed
    let newStatus = editedStatus;
    if (updated.length > 0 && completedCount === updated.length) {
      newStatus = 'Completed';
    } else if (completedCount > 0 && newStatus === 'Todo') {
      newStatus = 'In progress';
    }

    onUpdateTask({
      ...task,
      subtasks: updated,
      progress,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      assignee: newSubtaskAssignee.trim() || undefined,
    };

    const updated = [...subtasks, newSub];
    setSubtasks(updated);
    setNewSubtaskTitle('');

    const completedCount = updated.filter((s) => s.completed).length;
    const progress = Math.round((completedCount / updated.length) * 100);

    onUpdateTask({
      ...task,
      subtasks: updated,
      progress,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateSubtaskAssignee = (subtaskId: string, newAssignee: string) => {
    const updated = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, assignee: newAssignee.trim() || undefined } : st
    );
    setSubtasks(updated);
    onUpdateTask({
      ...task,
      subtasks: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updated = subtasks.filter((s) => s.id !== subtaskId);
    setSubtasks(updated);

    const completedCount = updated.filter((s) => s.completed).length;
    const progress = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;

    onUpdateTask({
      ...task,
      subtasks: updated,
      progress,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleQuickStatusChange = (newStatus: TaskStatus) => {
    setEditedStatus(newStatus);
    onUpdateTask({
      ...task,
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : task.progress,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveEdit = () => {
    const ownerData = employees.find((e) => e.name === editedOwner);
    const updated: Task = {
      ...task,
      title: editedTitle,
      project: editedProject,
      category: editedCategory || editedProject,
      techStack: editedTechStack,
      priority: editedPriority,
      status: editedStatus,
      owner: editedOwner,
      ownerPhone: ownerData ? ownerData.phone : task.ownerPhone,
      ownerEmail: ownerData ? ownerData.email : task.ownerEmail,
      ownerAvatar: ownerData ? ownerData.avatar : task.ownerAvatar,
      description: editedDescription,
      startDate: editedStartDate,
      dueDate: editedDueDate,
      duration: editedDuration,
      resultOutcome: editedResultOutcome,
      projectLink: editedProjectLink,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTask(updated);
    setIsEditing(false);
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const currentProgress =
    subtasks.length > 0
      ? Math.round((completedSubtasksCount / subtasks.length) * 100)
      : task.status === 'Completed'
      ? 100
      : task.progress || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="workdetail-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold tracking-wider text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-700/50">
              {task.id}
            </span>
            <span className="text-xs text-slate-300 font-medium">รายละเอียดงาน (workdetail)</span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                id="workdetail-edit-toggle-btn"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>แก้ไข</span>
              </button>
            ) : (
              <button
                id="workdetail-save-btn"
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>บันทึก</span>
              </button>
            )}

            <button
              id="workdetail-close-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Title, Category, Project & Tech Stack */}
          <div>
            {!isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h3>
                  {task.projectLink && (
                    <a
                      href={task.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>เปิดลิงก์โปรเจกต์</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                    {task.project}
                  </span>

                  {(task.category || task.project) && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
                      หมวด: {task.category || task.project}
                    </span>
                  )}

                  {task.techStack && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-200">
                      <Wrench className="h-3.5 w-3.5 text-amber-600" />
                      {task.techStack}
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      task.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    ความสำคัญ: {task.priority}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ชื่อโปรเจกต์ / ชื่องาน (Project Name / Title)
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หมวดหมู่ (Category)
                    </label>
                    <input
                      type="text"
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      โครงการ / แผนก
                    </label>
                    <input
                      type="text"
                      value={editedProject}
                      onChange={(e) => setEditedProject(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tech Stack / เครื่องมือ (Tools)
                    </label>
                    <input
                      type="text"
                      value={editedTechStack}
                      onChange={(e) => setEditedTechStack(e.target.value)}
                      placeholder="เช่น React, Python, Figma..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ความสำคัญ (Priority)
                    </label>
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value as Priority)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ลิงก์โปรเจกต์ (Project Link / URL)
                  </label>
                  <input
                    type="url"
                    value={editedProjectLink}
                    onChange={(e) => setEditedProjectLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Status Bar */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              สถานะงานปัจจุบัน (คลิกเพื่อเปลี่ยน)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Todo', 'In progress', 'Completed', 'Blocked'] as TaskStatus[]).map((st) => {
                const isActive = task.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleQuickStatusChange(st)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? st === 'Completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : st === 'In progress'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : st === 'Blocked'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'Completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {st === 'In progress' && <Clock className="h-3.5 w-3.5" />}
                    {st === 'Blocked' && <AlertTriangle className="h-3.5 w-3.5" />}
                    {st === 'Todo' && <CircleDot className="h-3.5 w-3.5" />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Owner and Timeline Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Details */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                ผู้รับผิดชอบ (Owner)
              </div>
              {!isEditing ? (
                <div className="flex items-start gap-3">
                  {task.ownerAvatar ? (
                    <img
                      src={task.ownerAvatar}
                      alt={task.owner}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {task.owner.slice(0, 1)}
                    </div>
                  )}
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-slate-900 text-sm">{task.owner}</p>
                    {ownerObj && (
                      <p className="text-slate-500">{ownerObj.role}</p>
                    )}
                    {task.ownerPhone && (
                      <p className="text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> {task.ownerPhone}
                      </p>
                    )}
                    {task.ownerEmail && (
                      <p className="text-slate-500 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" /> {task.ownerEmail}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    เลือกผู้รับผิดชอบ
                  </label>
                  <select
                    value={editedOwner}
                    onChange={(e) => setEditedOwner(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.project})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                กำหนดการ (Timeline & Duration)
              </div>
              {!isEditing ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> วันเริ่มงาน:
                    </span>
                    <span className="font-medium text-slate-900">
                      {task.startDate || 'ไม่ได้ระบุ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> กำหนดส่ง (Due Date):
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {task.dueDate || 'ไม่ได้ระบุ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> ระยะเวลา (Duration):
                    </span>
                    <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {task.duration || '7 วัน'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                        วันเริ่มงาน
                      </label>
                      <input
                        type="date"
                        value={editedStartDate}
                        onChange={(e) => setEditedStartDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                        กำหนดส่ง (Due Date)
                      </label>
                      <input
                        type="date"
                        value={editedDueDate}
                        onChange={(e) => setEditedDueDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                      ระยะเวลา (Duration)
                    </label>
                    <input
                      type="text"
                      value={editedDuration}
                      onChange={(e) => setEditedDuration(e.target.value)}
                      placeholder="เช่น 7 วัน, 2 สัปดาห์"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ความก้าวหน้า (Progress) Section */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <span>ความก้าวหน้าของงาน (Progress)</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                currentProgress === 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentProgress > 40
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {currentProgress}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentProgress === 100
                    ? 'bg-emerald-500'
                    : currentProgress > 40
                    ? 'bg-blue-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${currentProgress}%` }}
              />
            </div>

            {/* Quick adjust progress buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">ปรับความก้าวหน้าด่วน:</span>
              <div className="flex items-center gap-1">
                {[0, 25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      const newStatus: TaskStatus = pct === 100 ? 'Completed' : pct > 0 ? 'In progress' : 'Todo';
                      setEditedStatus(newStatus);
                      onUpdateTask({
                        ...task,
                        progress: pct,
                        status: newStatus,
                        updatedAt: new Date().toISOString(),
                      });
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                      currentProgress === pct
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              รายละเอียดงาน (Description)
            </div>
            {!isEditing ? (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="ระบุรายละเอียดงาน..."
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Result / Outcome (ผลสัมฤทธิ์ของงาน) */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
              <Award className="h-4 w-4 text-emerald-600" />
              <span>ผลลัพธ์ / ผลสัมฤทธิ์ของงาน (Result / Outcome)</span>
            </div>
            {!isEditing ? (
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {task.resultOutcome || (
                  <span className="text-slate-400 font-normal italic">
                    ยังไม่มีการระบุผลลัพธ์ (สามารถคลิกแก้ไขเพื่อใส่ผลลัพธ์ได้)
                  </span>
                )}
              </p>
            ) : (
              <input
                type="text"
                value={editedResultOutcome}
                onChange={(e) => setEditedResultOutcome(e.target.value)}
                placeholder="ระบุผลสัมฤทธิ์หรือผลงานที่สำเร็จ เช่น ระบบเปิดใช้งานสมบูรณ์, ส่งมอบไฟล์งานเรียบร้อย..."
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
          </div>

          {/* Subtasks / Checklist */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  รายการตรวจสอบ (Checklist / Subtasks)
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {completedSubtasksCount} จาก {subtasks.length} ข้อ
              </span>
            </div>

            {/* Assignee Filter Chips (if subtasks have assignees) */}
            {subtasks.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium mr-1">กรองดูตามคน:</span>
                <button
                  type="button"
                  onClick={() => setSubtaskAssigneeFilter('all')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    subtaskAssigneeFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ทั้งหมด ({subtasks.length})
                </button>

                {Array.from(new Set(subtasks.map((s) => s.assignee).filter(Boolean) as string[])).map((assigneeName) => {
                  const count = subtasks.filter((s) => s.assignee === assigneeName).length;
                  const doneCount = subtasks.filter((s) => s.assignee === assigneeName && s.completed).length;
                  return (
                    <button
                      key={assigneeName}
                      type="button"
                      onClick={() => setSubtaskAssigneeFilter(assigneeName)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        subtaskAssigneeFilter === assigneeName
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                    >
                      <User className="h-3 w-3" />
                      <span>{assigneeName}</span>
                      <span className="opacity-75 text-[10px]">({doneCount}/{count})</span>
                    </button>
                  );
                })}

                {subtasks.some((s) => !s.assignee) && (
                  <button
                    type="button"
                    onClick={() => setSubtaskAssigneeFilter('unassigned')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      subtaskAssigneeFilter === 'unassigned'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    ไม่ระบุคน ({subtasks.filter((s) => !s.assignee).length})
                  </button>
                )}
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2 mb-3">
              {subtasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">ยังไม่มีรายการตรวจสอบย่อย</p>
              ) : (
                subtasks
                  .filter((st) => {
                    if (subtaskAssigneeFilter === 'all') return true;
                    if (subtaskAssigneeFilter === 'unassigned') return !st.assignee;
                    return st.assignee === subtaskAssigneeFilter;
                  })
                  .map((st) => (
                    <div
                      key={st.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group gap-2"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => handleToggleSubtask(st.id)}
                          className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                        />
                        <span
                          className={`truncate ${
                            st.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {st.title}
                        </span>
                      </label>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {/* Subtask Assignee Selector */}
                        <div className="flex items-center">
                          <select
                            value={st.assignee || ''}
                            onChange={(e) => handleUpdateSubtaskAssignee(st.id, e.target.value)}
                            className={`text-[11px] font-medium rounded-md px-2 py-0.5 border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                              st.assignee
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                            title="คลิกเพื่อเลือกหรือเปลี่ยนผู้รับผิดชอบข้อย่อยนี้"
                          >
                            <option value="">👤 (ไม่ระบุคน)</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.name}>
                                👤 {emp.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(st.id)}
                          className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity cursor-pointer"
                          title="ลบข้อนี้"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ เพิ่มข้อรายการย่อยใหม่..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newSubtaskAssignee}
                  onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  title="เลือกผู้รับผิดชอบข้อย่อยนี้"
                >
                  <option value="">👤 (ไม่ระบุคน)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      👤 {emp.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 hover:bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer shrink-0"
                >
                  เพิ่มข้อ
                </button>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              id="workdetail-delete-btn"
              onClick={() => {
                if (confirm(`คุณแน่ใจว่าต้องการลบงาน "${task.title}" (${task.id}) หรือไม่?`)) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>ลบงานนี้</span>
            </button>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  id="workdetail-footer-edit-btn"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>แก้ไขข้อมูลงาน</span>
                </button>
              ) : (
                <button
                  id="workdetail-footer-save-btn"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
