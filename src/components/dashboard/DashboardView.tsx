import React from 'react';
import {
  Folder,
  CheckCircle2,
  Circle,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  CalendarDays,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Task, ActiveTab } from '../../types';
import { calculateWeeklyStats } from '../../utils/dateUtils';

interface DashboardViewProps {
  tasks: Task[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  setActiveTab,
  onSelectTask,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In progress').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length;
  const todoTasks = tasks.filter((t) => t.status === 'Todo').length;

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Data for Status Donut Chart
  const statusPieData = React.useMemo(() => {
    return [
      { name: 'เสร็จแล้ว (Completed)', value: completedTasks, color: '#10b981' },
      { name: 'กำลังทำ (In progress)', value: inProgressTasks, color: '#3b82f6' },
      { name: 'ติดปัญหา (Blocked)', value: blockedTasks, color: '#f43f5e' },
      { name: 'ยังไม่เริ่ม (Todo)', value: todoTasks, color: '#94a3b8' },
    ].filter((d) => d.value > 0);
  }, [completedTasks, inProgressTasks, blockedTasks, todoTasks]);

  // Filter for weekly chart: 'ALL' (52 weeks), 'CURRENT' (W32-W40), 'Q1', 'Q2', 'Q3', 'Q4'
  const [weekFilter, setWeekFilter] = React.useState<'ALL' | 'CURRENT' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');

  // Weekly Activity calculated for all 52 weeks throughout the entire year 2026 (W01 - W52)
  const allWeeklyData = React.useMemo(() => {
    return calculateWeeklyStats(tasks, 2026);
  }, [tasks]);

  const displayedWeeklyData = React.useMemo(() => {
    if (weekFilter === 'ALL') return allWeeklyData;
    if (weekFilter === 'CURRENT') {
      return allWeeklyData.filter((w) => w.week >= 32 && w.week <= 40);
    }
    return allWeeklyData.filter((w) => w.quarter === weekFilter);
  }, [allWeeklyData, weekFilter]);

  const w36Stat = React.useMemo(() => {
    return allWeeklyData.find((w) => w.week === 36) || { completed: 0, inProgress: 0, total: 0 };
  }, [allWeeklyData]);

  const w37Stat = React.useMemo(() => {
    return allWeeklyData.find((w) => w.week === 37) || { completed: 0, inProgress: 0, total: 0 };
  }, [allWeeklyData]);

  // Overall totals throughout the entire 52-week year
  const yearlyTotals = React.useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let blocked = 0;
    let total = 0;
    allWeeklyData.forEach((w) => {
      completed += w.completed;
      inProgress += w.inProgress;
      todo += w.todo;
      blocked += w.blocked;
      total += w.total;
    });
    return { completed, inProgress, todo, blocked, total };
  }, [allWeeklyData]);

  // Owner stats (งานปฏิบัติการแยกตามคน / ผู้รับผิดชอบ)
  const ownerStats = React.useMemo(() => {
    const map: Record<string, { total: number; completed: number; inProgress: number; blocked: number; todo: number }> = {};
    tasks.forEach((t) => {
      const owner = t.owner || 'ไม่ระบุ';
      if (!map[owner]) {
        map[owner] = { total: 0, completed: 0, inProgress: 0, blocked: 0, todo: 0 };
      }
      map[owner].total += 1;
      if (t.status === 'Completed') map[owner].completed += 1;
      else if (t.status === 'In progress') map[owner].inProgress += 1;
      else if (t.status === 'Blocked') map[owner].blocked += 1;
      else map[owner].todo += 1;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
        inProgress: data.inProgress,
        pending: data.blocked + data.todo,
        rate: Math.round((data.completed / data.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">ภาพรวมกราฟสถิติและความคืบหน้าของงานทั้งหมด</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            กราฟและสถิติเชื่อมโยงข้อมูลสด
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ทั้งหมด */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Folder className="h-6 w-6 stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
              ทั้งหมด
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-slate-900">{totalTasks}</div>
            <div className="text-xs text-slate-500 mt-1">งานทั้งหมดในระบบ</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">ความคืบหน้า</span>
            <span className="font-semibold text-purple-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 2: สำเร็จ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6 stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              สำเร็จ
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-slate-900">{completedTasks}</div>
            <div className="text-xs text-slate-500 mt-1">งานที่เสร็จแล้ว</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">คิดเป็น</span>
            <span className="font-semibold text-emerald-600">{progressPercent}% ของทั้งหมด</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 3: รอ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Circle className="h-6 w-6 stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              รอ (Todo)
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-slate-900">{todoTasks}</div>
            <div className="text-xs text-slate-500 mt-1">ยังไม่ได้ทำ</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">สัดส่วน</span>
            <span className="font-semibold text-slate-600">
              {totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-slate-400 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 4: ดำเนินการ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <PlayCircle className="h-6 w-6 stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              ดำเนินการ
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-slate-900">{inProgressTasks}</div>
            <div className="text-xs text-slate-500 mt-1">กำลังทำอยู่</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">ติดปัญหา (Blocked)</span>
            <span className="font-semibold text-rose-600">{blockedTasks} งาน</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut Chart - สัดส่วนสถานะงาน */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">สัดส่วนสถานะงาน (Donut Chart)</h3>
              </div>
              <span className="text-xs text-slate-400">ภาพรวม</span>
            </div>

            <div className="relative w-full h-[220px] flex items-center justify-center mt-2">
              {statusPieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <RechartsTooltip
                        formatter={(val: any, name: any) => [`${val} งาน`, name]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Central Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900">{completedTasks}</span>
                    <span className="text-[11px] text-slate-500 font-medium">เสร็จสิ้น ({progressPercent}%)</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400 text-center">ไม่มีข้อมูลงาน</div>
              )}
            </div>
          </div>

          {/* Donut Legend */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/50">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-700 text-[11px]">เสร็จแล้ว</span>
              </div>
              <span className="font-bold text-emerald-700">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50/50">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-slate-700 text-[11px]">กำลังทำ</span>
              </div>
              <span className="font-bold text-blue-700">{inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/50">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-slate-700 text-[11px]">ติดปัญหา</span>
              </div>
              <span className="font-bold text-rose-700">{blockedTasks}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100/60">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-slate-700 text-[11px]">ยังไม่เริ่ม</span>
              </div>
              <span className="font-bold text-slate-700">{todoTasks}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Vertical Bar Chart - สถิติรายสัปดาห์ตลอดทั้งปี (W01 ถึง W52) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">
                    สถิติปริมาณงานรายสัปดาห์ตลอดทั้งปี (Annual Weekly Activity - W01 ถึง W52)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  คำนวณแยกทุกๆ สัปดาห์ครบ 52 สัปดาห์ตลอดทั้งปี 2026 ตามวันเริ่ม/กำหนดส่งจริง
                </p>
              </div>

              {/* Badges for W36, W37, and Full Year */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-slate-700">
                  <span className="font-bold text-emerald-800">ตลอดทั้งปี:</span>
                  <span className="text-emerald-700 font-semibold">เสร็จ {yearlyTotals.completed}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-blue-700 font-semibold">กำลังทำ {yearlyTotals.inProgress}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-slate-700">
                  <span className="font-bold text-indigo-700">W36 (สัปดาห์นี้):</span>
                  <span className="text-emerald-700 font-semibold">เสร็จ {w36Stat.completed}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-blue-700 font-semibold">กำลังทำ {w36Stat.inProgress}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="font-bold text-slate-800">W37 (ถัดไป):</span>
                  <span className="text-emerald-700 font-semibold">เสร็จ {w37Stat.completed}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-blue-700 font-semibold">กำลังทำ {w37Stat.inProgress}</span>
                </div>
              </div>
            </div>

            {/* Filter buttons for easy navigation between 52 weeks or Quarters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setWeekFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    weekFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ตลอดทั้งปี (52 สัปดาห์ W01-W52)
                </button>
                <button
                  type="button"
                  onClick={() => setWeekFilter('CURRENT')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    weekFilter === 'CURRENT'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ช่วงปัจจุบัน (W32-W40)
                </button>
                <button
                  type="button"
                  onClick={() => setWeekFilter('Q1')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    weekFilter === 'Q1'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Q1 (W01-W13)
                </button>
                <button
                  type="button"
                  onClick={() => setWeekFilter('Q2')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    weekFilter === 'Q2'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Q2 (W14-W26)
                </button>
                <button
                  type="button"
                  onClick={() => setWeekFilter('Q3')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    weekFilter === 'Q3'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Q3 (W27-W39)
                </button>
                <button
                  type="button"
                  onClick={() => setWeekFilter('Q4')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    weekFilter === 'Q4'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Q4 (W40-W52)
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> เสร็จสิ้น (Completed)
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" /> กำลังทำ (In progress)
                </span>
              </div>
            </div>

            {/* Scrollable Container for 52-week view */}
            <div className="w-full overflow-x-auto mt-2 pb-1">
              <div style={{ minWidth: weekFilter === 'ALL' ? '1280px' : '100%', height: '225px' }}>
                <ResponsiveContainer width="100%" height={225}>
                  <BarChart data={displayedWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800 min-w-[210px]">
                              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
                                <span>สัปดาห์ {data.label} {data.isCurrent ? '(สัปดาห์นี้)' : ''}</span>
                                <span className="text-[11px] text-slate-400 font-normal">[{data.quarter}] {data.dateRange}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-emerald-400">
                                <span>เสร็จสิ้น (Completed):</span>
                                <span className="font-bold">{data.completed} งาน</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-blue-400">
                                <span>กำลังทำ (In progress):</span>
                                <span className="font-bold">{data.inProgress} งาน</span>
                              </div>
                              {data.blocked > 0 && (
                                <div className="flex items-center justify-between gap-4 text-rose-400">
                                  <span>ติดปัญหา (Blocked):</span>
                                  <span className="font-bold">{data.blocked} งาน</span>
                                </div>
                              )}
                              {data.todo > 0 && (
                                <div className="flex items-center justify-between gap-4 text-slate-400">
                                  <span>ยังไม่เริ่ม (Todo):</span>
                                  <span className="font-bold">{data.todo} งาน</span>
                                </div>
                              )}
                              <div className="border-t border-slate-800 pt-1 flex items-center justify-between text-slate-300 font-semibold text-[11px]">
                                <span>รวมงานในสัปดาห์:</span>
                                <span>{data.total} งาน</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="completed" name="เสร็จสิ้น" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="inProgress" name="กำลังทำ" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              คำนวณครบ 52 สัปดาห์ตลอดปี (W01 ถึง W52) เลื่อนแนวนอนหรือกดเลือกไตรมาสได้ทันที
            </span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> วีคปัจจุบัน: W36 (เสร็จ {w36Stat.completed} / กำลังทำ {w36Stat.inProgress}) | วีคถัดไป: W37 (เสร็จ {w37Stat.completed} / กำลังทำ {w37Stat.inProgress})
            </span>
          </div>
        </div>
      </div>

      {/* Chart 3: Horizontal Stacked Bar Chart - งานปฏิบัติการแยกตามคน (แยกตามผู้รับผิดชอบ) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">
                  งานปฏิบัติการแยกตามคน (แยกตามผู้รับผิดชอบ / Assigned to)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  แยกตามคน
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                สัดส่วนความคืบหน้าและปริมาณงานของแต่ละบุคคล
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
              <span className="text-slate-600">เสร็จแล้ว</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" />
              <span className="text-slate-600">กำลังทำ</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-slate-300" />
              <span className="text-slate-600">รอ/ติดปัญหา</span>
            </div>
          </div>
        </div>

        {/* Real Horizontal Stacked Bar Chart using Recharts */}
        <div className="w-full mt-4" style={{ height: `${Math.max(220, ownerStats.length * 40)}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={ownerStats} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <RechartsTooltip
                formatter={(value: any, name: any) => [`${value} งาน`, name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="completed" name="เสร็จสิ้น" stackId="stack" fill="#10b981" />
              <Bar dataKey="inProgress" name="กำลังทำ" stackId="stack" fill="#3b82f6" />
              <Bar dataKey="pending" name="รอ/ติดปัญหา" stackId="stack" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              ทั้งหมด {totalTasks} งาน
            </span>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              ความคืบหน้ารวม {progressPercent}%
            </span>
          </div>

          <button
            id="dash-view-all-work-btn"
            onClick={() => setActiveTab('work')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <span>ไปที่รายการงานทั้งหมด (work)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Recent High Priority Tasks */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">งานด่วนสำคัญ (High Priority)</h3>
            <p className="text-xs text-slate-500">คลิกที่งานเพื่อเปิดดูรายละเอียดงาน (workdetail)</p>
          </div>
          <button
            onClick={() => setActiveTab('work')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ดูทั้งหมด
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {tasks
            .filter((t) => t.priority === 'High')
            .slice(0, 4)
            .map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-medium text-slate-400 shrink-0">
                    {task.id}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-500">{task.project}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      task.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : task.status === 'In progress'
                        ? 'bg-blue-50 text-blue-700'
                        : task.status === 'Blocked'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.status}
                  </span>
                  <span className="text-xs text-slate-500">{task.owner}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
