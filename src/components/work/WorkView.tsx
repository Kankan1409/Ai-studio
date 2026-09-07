import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDot,
  ArrowUpDown,
  FileSpreadsheet,
  Edit2,
  CheckSquare,
  ExternalLink,
  Wrench,
} from 'lucide-react';
import { Task, TaskStatus, Priority, Employee } from '../../types';
import { isTaskAssignedToEmployee } from '../../utils/employeeTaskMatcher';

interface WorkViewProps {
  tasks: Task[];
  employees?: Employee[];
  onSelectTask: (task: Task) => void;
  onAddTaskClick: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  initialSearchQuery?: string;
  filterEmployee?: Employee | null;
  onClearEmployeeFilter?: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  tasks,
  employees = [],
  onSelectTask,
  onAddTaskClick,
  onUpdateTaskStatus,
  initialSearchQuery = '',
  filterEmployee,
  onClearEmployeeFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Sync initialSearchQuery when changed from external caller (e.g. employee tasks button)
  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Extract unique projects
  const projects = useMemo(() => {
    const list = Array.from(new Set(tasks.map((t) => t.project)));
    return list;
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // If filtering by specific employee (from "ดูงาน" button in employee list)
      if (filterEmployee && !isTaskAssignedToEmployee(task, filterEmployee)) {
        return false;
      }

      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.subtasks && task.subtasks.some((st) => st.assignee && st.assignee.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchProject = selectedProject === 'all' || task.project === selectedProject;
      const matchStatus = selectedStatus === 'all' || task.status === selectedStatus;
      const matchPriority = selectedPriority === 'all' || task.priority === selectedPriority;

      return matchSearch && matchProject && matchStatus && matchPriority;
    });
  }, [tasks, searchQuery, selectedProject, selectedStatus, selectedPriority, filterEmployee]);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Completed
          </span>
        );
      case 'In progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            In progress
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            Blocked
          </span>
        );
      case 'Todo':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Todo
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return <span className="text-xs font-semibold text-rose-600">High</span>;
      case 'Medium':
        return <span className="text-xs font-medium text-amber-600">Medium</span>;
      case 'Low':
        return <span className="text-xs font-medium text-slate-500">Low</span>;
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Add Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">งานทั้งหมด</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            คลิกที่แถวของงานเพื่อเปิดดูและแก้ไข <strong>รายละเอียดงาน (workdetail)</strong>
          </p>
        </div>

        <button
          id="work-add-task-btn"
          onClick={onAddTaskClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>เพิ่มงาน</span>
        </button>
      </div>

      {/* Filter Employee Banner if active */}
      {filterEmployee && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl bg-indigo-50/90 border border-indigo-200/80 px-4 py-3 text-xs text-indigo-950">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-indigo-900">กำลังแสดงเฉพาะงานของ:</span>
            <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200/70 shadow-2xs">
              {filterEmployee.name} ({filterEmployee.id})
            </span>
            {(filterEmployee.projectId || filterEmployee.project) && (
              <span className="text-indigo-600 font-mono text-[11px] bg-indigo-100/70 px-2 py-0.5 rounded">
                Project ID: {filterEmployee.projectId || filterEmployee.project}
              </span>
            )}
            <span className="text-indigo-700 font-medium">
              (พบ {filteredTasks.length} งาน)
            </span>
          </div>
          {onClearEmployeeFilter && (
            <button
              onClick={onClearEmployeeFilter}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>✕ แสดงงานของทุกคน</span>
            </button>
          )}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search Input matching Screenshot: Search tickets... */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="work-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets / ค้นหางาน, ชื่อผู้รับผิดชอบ, โครงการ..."
            className="w-full rounded-xl border-0 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 pl-1">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">กรอง:</span>
          </div>

          {/* Project Filter */}
          <select
            id="work-filter-project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทุกโครงการ / แผนก</option>
            {projects.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="work-filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="Completed">Completed (เสร็จแล้ว)</option>
            <option value="In progress">In progress (กำลังทำ)</option>
            <option value="Blocked">Blocked (ติดปัญหา)</option>
            <option value="Todo">Todo (ยังไม่เริ่ม)</option>
          </select>

          {/* Priority Filter */}
          <select
            id="work-filter-priority"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทุก Priority</option>
            <option value="High">High (ด่วนมาก)</option>
            <option value="Medium">Medium (ปานกลาง)</option>
            <option value="Low">Low (ปกติ)</option>
          </select>
        </div>
      </div>

      {/* Tasks Table matching Screenshot 1 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="border-b border-slate-200 bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-3.5 py-3.5 w-20">
                  ID
                </th>
                <th scope="col" className="px-4 py-3.5 min-w-[200px]">
                  Category / ชื่องาน
                </th>
                <th scope="col" className="px-3 py-3.5 min-w-[120px]">
                  Tech Stack / Tools
                </th>
                <th scope="col" className="px-3 py-3.5 min-w-[130px]">
                  แผนก / กำหนดการ
                </th>
                <th scope="col" className="px-3 py-3.5 w-20">
                  Priority
                </th>
                <th scope="col" className="px-3 py-3.5 w-28">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 w-28">
                  ความก้าวหน้า
                </th>
                <th scope="col" className="px-3 py-3.5 w-24">
                  Checklist
                </th>
                <th scope="col" className="px-3.5 py-3.5">
                  Owner
                </th>
                <th scope="col" className="px-3.5 py-3.5 text-right w-28">
                  จัดการ / ลิงก์
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                    ไม่พบรายการงานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const subtasksCount = task.subtasks?.length || 0;
                  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                  const progressVal =
                    task.status === 'Completed'
                      ? 100
                      : subtasksCount > 0
                      ? Math.round((completedSubtasks / subtasksCount) * 100)
                      : task.progress || 0;

                  return (
                    <tr
                      key={task.id}
                      id={`task-row-${task.id}`}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* ID */}
                      <td className="px-3.5 py-3 font-mono font-medium text-slate-500 group-hover:text-indigo-600">
                        {task.id}
                      </td>

                      {/* Category / Title */}
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex flex-col gap-0.5">
                          {task.category && (
                            <span className="inline-flex items-center text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-fit border border-indigo-100">
                              {task.category}
                            </span>
                          )}
                          <span className="group-hover:text-indigo-600 transition-colors font-semibold">
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-[11px] text-slate-400 line-clamp-1">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tech Stack */}
                      <td className="px-3 py-3">
                        {task.techStack ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 line-clamp-1 max-w-[150px]">
                            <Wrench className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{task.techStack}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>

                      {/* แผนก & กำหนดการ */}
                      <td className="px-3 py-3 text-slate-600 font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 w-fit">
                            {task.project}
                          </span>
                          {(task.dueDate || task.duration) && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{task.dueDate || '-'}</span>
                              {task.duration && (
                                <span className="text-[10px] text-slate-400 font-normal">({task.duration})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-3 py-3">{getPriorityBadge(task.priority)}</td>

                      {/* Status with quick change ability */}
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <button
                            type="button"
                            className="focus:outline-none cursor-pointer"
                            title="คลิกเพื่อเปลี่ยนสถานะด่วน"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus: Record<TaskStatus, TaskStatus> = {
                                'Todo': 'In progress',
                                'In progress': 'Completed',
                                'Completed': 'Blocked',
                                'Blocked': 'Todo',
                              };
                              onUpdateTaskStatus(task.id, nextStatus[task.status]);
                            }}
                          >
                            {getStatusBadge(task.status)}
                          </button>
                        </div>
                      </td>

                      {/* ความก้าวหน้า (Progress) */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                progressVal === 100
                                  ? 'bg-emerald-500'
                                  : progressVal > 40
                                  ? 'bg-blue-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${progressVal}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{progressVal}%</span>
                        </div>
                      </td>

                      {/* รายการตรวจสอบ (Checklist / Subtasks) */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {subtasksCount > 0 ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                              completedSubtasks === subtasksCount
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              <CheckSquare className="w-3 h-3 text-indigo-500" />
                              {completedSubtasks}/{subtasksCount}
                            </span>
                            {task.subtasks && task.subtasks.some((st) => st.assignee && st.assignee !== task.owner) && (
                              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                👥 งานร่วม
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="px-3.5 py-3">
                        {(() => {
                          const owners = task.owner
                            ? task.owner
                                .split(/[,;\n/|]+/)
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : [];
                          if (owners.length === 0) {
                            return <span className="text-[11px] text-slate-400">-</span>;
                          }
                          if (owners.length === 1) {
                            const emp = employees.find((e) => e.name === owners[0]);
                            const avatar = emp?.avatar || task.ownerAvatar;
                            return (
                              <div className="flex items-center gap-2">
                                {avatar ? (
                                  <img
                                    src={avatar}
                                    alt={owners[0]}
                                    className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 shrink-0">
                                    {owners[0].slice(0, 1)}
                                  </div>
                                )}
                                <span className="font-medium text-slate-700 truncate max-w-[140px]">{owners[0]}</span>
                              </div>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5" title={owners.join(', ')}>
                              <div className="flex -space-x-2 overflow-hidden shrink-0">
                                {owners.slice(0, 3).map((name) => {
                                  const emp = employees.find((e) => e.name === name);
                                  return emp?.avatar ? (
                                    <img
                                      key={name}
                                      src={emp.avatar}
                                      alt={name}
                                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                    />
                                  ) : (
                                    <div
                                      key={name}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 ring-2 ring-white text-[10px] font-bold text-indigo-700"
                                    >
                                      {name.slice(0, 1)}
                                    </div>
                                  );
                                })}
                              </div>
                              <span className="font-medium text-slate-700 text-xs truncate max-w-[130px]">
                                {owners.slice(0, 2).join(', ')}
                                {owners.length > 2 ? ` +${owners.length - 2}` : ''}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions & Project Link */}
                      <td className="px-3.5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {task.projectLink && (
                            <a
                              href={task.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="เปิดลิงก์งาน / โปรเจกต์"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            id={`task-edit-btn-${task.id}`}
                            onClick={() => onSelectTask(task)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-2xs cursor-pointer"
                            title="แก้ไขรายละเอียดงานและรายการตรวจสอบ"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>แก้ไข</span>
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

        {/* Table Footer / Summary */}
        <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <div>
            แสดง <strong>{filteredTasks.length}</strong> จากทั้งหมด {tasks.length} รายการ
          </div>
          <div className="text-[11px] text-slate-400 italic">
            * คลิกที่แถวใดก็ได้ เพื่อเปิดดูรายละเอียดงาน (workdetail)
          </div>
        </div>
      </div>
    </div>
  );
};
